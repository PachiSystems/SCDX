/*
   Copyright 2013, Brian Milton

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
 
(function (window,undefined) {
	
	// PRIVATE PROPERTIES
	var
	SCDX = {},
	months = [{'n':'Jan','d':31},{'n':'Feb','d':28},{'n':'Mar','d':31},{'n':'Apr','d':30},{'n':'May','d':31},{'n':'Jun','d':30},{'n':'Jul','d':31},{'n':'Aug','d':31},{'n':'Sep','d':30},{'n':'Oct','d':31},{'n':'Nov','d':30},{'n':'Dec','d':31}],
	HEIGHT = 100,
	projList = [],
	today = new Date(),
	hoverObj = {isHovering:false,project:{}},
	canvas = document.createElement('canvas'),
	errorMessage = document.createElement('canvas'),
	toolTip = document.createElement('span'),
	viewInit = true,
	curGroup,daysThisYear,leftColumn,oneDay,ctx,WIDTH,container,canvasElement,displayYear,currentYear,numberMonths,startingMonth,viewStart,viewEnd,canvasX,canvasY;
	
	canvas.id = 'SCDX-viewLayer';
	errorMessage.id = 'SCDX-errorMessage';
	toolTip.id = 'SCDX-toolTip';
	
	// PUBLIC PROPERTIES / SETTINGS
	SCDX.highPrioColor = '#F66';
	SCDX.lowPrioColor = '#6F6';
	SCDX.defaultPrioColor = '#66F';
	SCDX.roundedCorners = true;
	SCDX.timeToFade = 1000.0;
	SCDX.fontFace = 'bold 16px Arial';
	SCDX.floatTip = true;

	// PUBLIC METHODS
	SCDX.createSchedule = function (divID,year,width,numMonths,startMonth) {
		// Get the container that we're going to be working within.
		container = document.getElementById(divID);
		// Set these variables with the data passed, or with a default value.
		canvasElement = divID;
		currentYear = displayYear = Number(year) || today.getFullYear();
		WIDTH = Number(width) || container.getAttribute('width');
		numberMonths = Number(numMonths) || 12;
		startingMonth = Number(startMonth) || today.getMonth()+1;
		
		// Need to check if the starting year is a leap year.
		if(Number(displayYear)%4 != 0) {
			months[1].d = 28;
		} else {
			months[1].d = 29;
		}
		
		container.innerHTML = '';
		container.style.position='relative';
		ctx = canvas.getContext('2d');
		container.appendChild(canvas);
		container.appendChild(toolTip);
		container.appendChild(errorMessage);
		
		// Figure out which date the view starts on (TIMESTAMP):
		viewStart = Number(Date.parse("01 "+months[startingMonth-1].n+" "+displayYear+" 00:00:00 GMT"));
		
		// viewEnd calculation: First we need the month on which it starts
		// Then add the number of months to it.
		viewEnd = startingMonth + numberMonths;
		// Now we need to figure out how many days there are in those months.
		// Start at the 'startingMonth' and then move up until we're at the end.
		var tempMonth = startingMonth-1;
		daysThisYear = 0;
		for (var i = 0; i<numberMonths;i++) {
			if(tempMonth == 12) {
				// Flicking past a year. Reset month...
				tempMonth = 0;
				// Increment the current year...
				currentYear++;
				// Check for a leap year.
				if(currentYear%4 == 0) {
					months[1].d = 29;
				} else {
					months[1].d = 28;
				}
			}
			daysThisYear += months[tempMonth].d;
			tempMonth++;
		}
		
		// The minus one ensures we don't trigger the 1st day of the next month... Think about it...
		viewEnd = (viewStart + ((daysThisYear) * 86400000))-1;
		
		// Set the width of the canvas.
		canvas.width = WIDTH;
		// Set a default height to accommodate the top bar and an error message if needed.
		//HEIGHT = canvas.height = 100;
		
		leftColumn = WIDTH * 0.15625
		oneDay = (WIDTH - leftColumn) / daysThisYear;
		
		drawSchedule();
	}
	
	SCDX.changeView = function(year,startMonth,numMonths) {
		SCDX.createSchedule(canvasElement,year,WIDTH,numMonths,startMonth);
		drawSchedule();
	}
	
	SCDX.setSchedule = function(objArray) {
		if (typeof objArray != "object") {
			SCDX.displayErrorMessage('Invalid schedule object.');
			return;
		};
		viewInit = false;
		for(var i = 0, len = objArray.length;i < len; i++) {
			projList.push(objArray[i]);
		}
		
		// Calculate height of the canvas now...
		HEIGHT = canvas.height = (Math.max.apply(Math,projList.map(function(projList){return projList.groupId;}))+1) * 49;
		drawSchedule();
	}
	
	SCDX.displayErrorMessage = function(textToDisplay,fadeSpeed) {
		errorMessage.FadeState = 2;
		errorMessage.style.opacity = 1;
		errorMessage.style.visibility = 'visible';
		obj = canvas;
		canvasX = obj.offsetLeft;
		canvasY = obj.offsetTop;
		
		while(obj.offsetParent) {
			canvasX += obj.offsetLeft;
			canvasY += obj.offsetTop;
			if(obj==document.getElementsByTagName('body')[0]){break}
			else {obj=obj.offsetParent;}
		}
		
		
		errorMessage.style.left = canvasX;
		errorMessage.style.top = canvasY;
		errorMessage.width = canvas.width;
		errorMessage.height = canvas.height;
		overlayctx = errorMessage.getContext('2d');
		
		// Darken the background...
		overlayctx.fillStyle = 'rgba(255,255,255,0.5)';
		overlayctx.fillRect(0,0,WIDTH,HEIGHT);
		
		overlayctx.fillStyle = '#FFFFE0';
		overlayctx.strokeStyle = '#333';
		overlayctx.font = SCDX.fontFace;
		
		if(SCDX.roundedCorners) {
			roundRect(overlayctx,(WIDTH/4),(HEIGHT / 4),(WIDTH / 2),(HEIGHT / 2),5,true,true);
		} else {
			overlayctx.fillRect((WIDTH/4),(HEIGHT / 4),(WIDTH / 2),(HEIGHT / 2));
			overlayctx.strokeRect((WIDTH/4),(HEIGHT / 4),(WIDTH / 2),(HEIGHT / 2));
		}
		
		overlayctx.fillStyle = '#F00';
		overlayctx.textAlign = 'center';
		overlayctx.fillText(textToDisplay,WIDTH/2,(HEIGHT/2)+5);
		
		setTimeout(function() {
			fade(errorMessage,fadeSpeed);
		},2500);
	}
	
	// PRIVATE METHODS
	function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
		if (typeof stroke == "undefined" ) {
			stroke = false;
		}
		if (typeof radius === "undefined") {
			radius = 5;
		}
		// Start building the rectangle.
		ctx.beginPath();
		// Move to the top left corner and skip the radius.
		ctx.moveTo(x + radius, y);
		ctx.lineTo(x + width - radius, y);
		ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
		ctx.lineTo(x + width, y + height - radius);
		ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
		ctx.lineTo(x + radius, y + height);
		ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
		ctx.lineTo(x, y + radius);
		ctx.quadraticCurveTo(x, y, x + radius, y);
		ctx.closePath();
		if (stroke) {
			ctx.stroke();
		}
		if (fill) {
			ctx.fill();
		}
	}

	function drawSchedule() {
		// Ensure we reset variables that might have been changed:
		currentYear = displayYear;
		canvas.width = errorMessage.width = WIDTH;
		canvas.height =  errorMessage.height = HEIGHT;
		
		var xPos = leftColumn;
		
		// GRID LINE DRAWING
		
		// Draw the horizontal year dividing line.
		ctx.moveTo(0,26.5);
		ctx.lineTo(WIDTH,26.5);
		
		// Team dividing line...
		ctx.moveTo(xPos,0);
		ctx.lineTo(xPos,HEIGHT);
		
		// Write the starting year.
		ctx.fillStyle = '#333333';
		ctx.font = SCDX.fontFace;
		ctx.fillText(currentYear,xPos + 5,21);
		
		// Now to draw the divisions for the months...
		var curMonth = startingMonth-1;
		ctx.strokeStyle = "#CCC";
		for(var i = 0; i < numberMonths; i++) {
			// Calculate a change in the year.
			if(curMonth == 12) {
				currentYear++;
				if( (currentYear+1)%4 == 0) {
					months[1].d = 29;
				} else {
					months[1].d = 28;
				}
				ctx.fillText(currentYear, xPos+5,21);
				curMonth = 0;
				ctx.moveTo(xPos,0);
				ctx.lineTo(xPos,HEIGHT);
			}
			ctx.fillText(months[curMonth].n,xPos+5,42);
			xPos += months[curMonth].d * oneDay;
			ctx.moveTo(xPos,47.5);
			ctx.lineTo(xPos,HEIGHT);
			curMonth++;
		}
		
		// Dividing line between months and schedule.
		ctx.moveTo(0,47.5);
		ctx.lineTo(WIDTH,47.5);
		ctx.stroke();
		
		if(projList.length > 0) {
			// PROJECT RENDERING
			
			// How about, to stop it from overlaying strokes on the regular fillRect, we draw the
			// dividing lines here?...
			var maxGroup = Math.max.apply(Math,projList.map(function(projList){return projList.groupId;})),
				lineHeight = Math.round((HEIGHT - 47.5) / maxGroup)-1;
			ctx.strokeStyle = '#CCC';
			for(var i = 0, len = maxGroup; i < len; i++) {
				ctx.moveTo(0,Math.round((lineHeight * (i+1))+49)-0.5);
				ctx.lineTo(WIDTH,Math.round((lineHeight * (i+1))+49)-0.5);
				ctx.stroke();
			}
			
			
			for(var i = 0, len = projList.length; i < len; i++) {
				// Itterate over the list of projects.
				// REMEMBER: DATES ARE TIMESTAMPED!
				
				// Temporary variables for each loop.
				var startDate = projList[i].startDate,
					endDate = projList[i].endDate,
					startPos = leftColumn,
					numDays = endDay = z = 0,
					curMonth = startingMonth,
					thisProject = projList[i];
				
				// Reset class variable.
				currentYear = displayYear;
				
				// Display the group name if it's a different group.
				if(projList[i].groupId != curGroup) {
					curGroup = projList[i].groupId;
					ctx.fillStyle = '#333';
					ctx.fillText(projList[i].rowLabel,5,((projList[i].groupId+0.6) * 49));
				}
				
				// Set correct colour for priority:
				switch(thisProject.prio) {
					case 'high':
						ctx.fillStyle = ctx.strokeStyle = SCDX.highPrioColor;
						break;
					case 'low':
						ctx.fillStyle = ctx.strokeStyle = SCDX.lowPrioColor;
						break;
					default:
						ctx.fillStyle = ctx.strokeStyle = SCDX.defaultPrioColor;
						break;
				}
				
				// Figure out if the whole project falls within the view:
				var validProj = false,
					topEdge = thisProject.groupId * 49,
					lengthOfProject,
					leftEdge;
					
				if(thisProject.startDate >= viewStart && thisProject.endDate <= viewEnd) {
					// The project is wholly contiained.
					// The length of the project in pixels (including the last day = +1):
					lengthOfProject = (((thisProject.endDate-thisProject.startDate) / 86400000) + 1) * oneDay;
					// The x position of the project:
					leftEdge = leftColumn + ( ( ( thisProject.startDate - viewStart) / 86400000) * oneDay );
					validProj = true;
				} else if (thisProject.endDate > viewStart && thisProject.endDate < viewEnd) {
					// The project starts before the view, but ends before the end of the view.
					lengthOfProject = (((thisProject.endDate-viewStart) / 86400000) + 1) * oneDay;
					// The x position of the project:
					leftEdge = leftColumn;
					validProj = true;
				} else if (thisProject.startDate > viewStart && thisProject.startDate < viewEnd && thisProject.endDate > viewEnd) {
					// This project stars in the view, but extends off the right hand side.
					// The length of the project in pixels:
					lengthOfProject = (((viewEnd-thisProject.startDate) / 86400000) + 1) * oneDay;
					// The x position of the project:
					leftEdge = leftColumn + ( ( ( thisProject.startDate - viewStart) / 86400000) * oneDay );
					validProj = true;
				} else if (thisProject.startDate <= viewStart && thisProject.endDate >= viewEnd) {
					// The project fills the ENTIRE view! It starts before the view and finishes after.
					lengthOfProject = (((viewEnd - viewStart) / 86400000) + 1) * oneDay;
					leftEdge = leftColumn;
					validProj = true;
				}
				
				if(validProj) {
					projList[i].xPos = leftEdge;
					projList[i].yPos = topEdge;
					projList[i].width = lengthOfProject;
					projList[i].height = 47.5;
					// Draw it on:
					if(SCDX.roundedCorners) {
						roundRect(ctx, leftEdge, topEdge, lengthOfProject,47.5,5,true,true);
					} else {
						ctx.clearRect(leftEdge,topEdge,lengthOfProject,47.5);
						ctx.fillRect(leftEdge,topEdge,lengthOfProject,47.5);
						ctx.strokeRect(leftEdge,topEdge,lengthOfProject,47.5);
					}
				}
			}
		} else {
			if(!viewInit) {
				SCDX.displayErrorMessage('No projects to display.');
			}
		}
	}
	
	function fade(element,fadeSpeed) {
		// If there's no element, just exit the function.
		SCDX.timeToFade = fadeSpeed?fadeSpeed:SCDX.timeToFade;
		if(element == null) {
			return;
		}
		
		// does the element have a FadeState?
		if(element.FadeState == null)
		{
			// The element has no FadeState. Let's try to determine it from the CSS.
			// Four possible values are:
			// 2 = Fully opaque.
			// 1 = Currently fading from transparent to opaque.
			// -1 = Currently fading from opaque to transparent.
			// -2 = Fully transparent.
			if(element.style.opacity == null || element.style.opacity == '' || element.style.opacity == '1') {
				// If it's opaque, set the FadeState to 2.
				element.FadeState = 2;
			} else {
				// Otherwise, it's transparent. So set the FadeState to -2.
				element.FadeState = -2;
			}
		}
		
		if(element.FadeState == 1 || element.FadeState == -1) {
			// If the element is fading in or out and fade() is called again,
			// the animation will be flipped from one direction to the other.
			element.FadeState = element.FadeState==1?-1:1;
			element.FadeTimeLeft = SCDX.timeToFade - element.FadeTimeLeft;
		} else {
			// The element is not currently fading in or out.
			// Set the direction of the fade based on the FadeState so:
			// 2 will assign a -1 to fade out and a -2 will assign a 1 to fade in.
			element.FadeState = element.FadeState == 2 ? -1 : 1;
			// Initialise the timer and start it off.
			element.FadeTimeLeft = SCDX.timeToFade;
			setTimeout(animateFade(new Date().getTime(),element), 33);
		}
	}
	
	function animateFade(lastTick,element) {
		// Time differences.
		var curTick = new Date().getTime();
		var elapsedTicks = curTick - lastTick;
		
		if(element.FadeTimeLeft <= elapsedTicks) {
			// We have gone past the time allocated for fading. Set the final state and
			// change FadeState to 2 or -2 depending on final state being opaque or transparent.
			element.style.opacity = element.FadeState == 1 ? 1 : 0;
			element.FadeState = element.FadeState == 1?2:-2;
			if(element.FadeState == -2) {
				element.style.visibility = 'hidden';
			}
			return;
		}
		
		// If we're not out of time, then we need to figure out what percentage of opaqueness
		// we require at this present time in the animation by divinding total time left over
		// the total anumation time.
		element.FadeTimeLeft -= elapsedTicks;
		var newOpVal = element.FadeTimeLeft / SCDX.timeToFade;
		
		// If we are fading to opaque, we need to adjust the direction...
		if(element.FadeState == 1) {
			// This brings us closer to 1 each time.
			newOpVal = 1 - newOpVal;
		}
			
		// Assign the new opacity...
		element.style.opacity = newOpVal;
		
		// And do it all again.
		setTimeout(function(){animateFade(curTick,element)},33);
	}
	
	// EVENT HANDLERS
	
	canvas.onmousemove = canvas.onmouseover = function (event) {
		event = event || window.event;
		// Check the positions of the projects with the mouse position.
		// If it's over a project, and there's a description, then show the tool tip for it.
		
		if(hoverObj.isHovering) {
			curProj = hoverObj.project;
			// Hovering over an item. Check we're still in it.
			if((event.layerX > curProj.xPos) && (event.layerX < (curProj.xPos+curProj.width)) && ((event.layerY > curProj.yPos)&&(event.layerY < (curProj.yPos + curProj.height)))) {
				// Update the toolTip position.
				if(SCDX.floatTip) {
					toolTip.style.left = (event.clientX + 15) + 'px';
					toolTip.style.top = (event.clientY - 30)+ 'px';
				} else {
					toolTip.style.left = (curProj.xPos + curProj.width) + "px";
					toolTip.style.top = curProj.yPos + "px";
				}
			} else {
				// Clear the hoverObj.
				hoverObj.isHovering = false;
				// Hide the toolTip.
				toolTip.style.visibility = 'hidden';
			}
		} else {
			// Not hovering, so check to see if we've come into something.
			if(projList.length != 0) {
				for(var i = 0, len = projList.length; i < len; i++) {
					var curProj = projList[i];
					if( (event.layerX > curProj.xPos) && (event.layerX < (curProj.xPos+curProj.width)) && ((event.layerY > curProj.yPos)&&(event.layerY < (curProj.yPos + curProj.height)))) {
						// In the zone.
						var tempStart = new Date(curProj.startDate),
							tempEnd = new Date(curProj.endDate);
							
						if(typeof curProj.description != "undefined") {
							if(SCDX.floatTip) {
								toolTip.style.left = (event.clientX + 15) + 'px';
								toolTip.style.top = (event.clientY - 30)+ 'px';
							} else {
								toolTip.style.left = (curProj.xPos + curProj.width) + "px";
								toolTip.style.top = curProj.yPos + "px";
							}
							toolTip.style.visibility = 'visible';
							toolTip.innerHTML = curProj.description+"<br>"+tempStart.getUTCDate()+"-"+months[tempStart.getUTCMonth()].n+"-"+tempStart.getUTCFullYear()+" <b>&#8594;</b> "+tempEnd.getUTCDate()+"-"+months[tempEnd.getUTCMonth()].n+"-"+tempEnd.getUTCFullYear();
							hoverObj.isHovering = true;
							hoverObj.project = curProj;
						} else {
							if(SCDX.floatTip) {
								toolTip.style.left = (event.clientX + 15) + 'px';
								toolTip.style.top = (event.clientY - 30)+ 'px';
							} else {
								toolTip.style.left = (curProj.xPos + curProj.width)+ "px";
								toolTip.style.top = curProj.yPos + "px";
							}
							toolTip.style.visibility = 'visible';
							toolTip.innerHTML = "Start:"+tempStart.getUTCDate()+"-"+months[tempStart.getUTCMonth()].n+"-"+tempStart.getUTCFullYear()+"<br>End:"+tempEnd.getUTCDate()+"-"+months[tempEnd.getUTCMonth()].n+"-"+tempEnd.getUTCFullYear();
							hoverObj.isHovering = true;
							hoverObj.project = curProj;
						}
					}
				}
			}
		}
	};
	
	// And just to make sure that little tooltip isn't going to fllow the mouse everywhere...
	canvas.onmouseout = function () {
		toolTip.style.visibility = 'hidden';
	}
	
window.SCDX = SCDX;
})(window);