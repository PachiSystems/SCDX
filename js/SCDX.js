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
	MONTHS = [{'name':'Jan','days':31},{'name':'Feb','days':28},{'name':'Mar','days':31},{'name':'Apr','days':30},{'name':'May','days':31},{'name':'Jun','days':30},{'name':'Jul','days':31},{'name':'Aug','days':31},{'name':'Sep','days':30},{'name':'Oct','days':31},{'name':'Nov','days':30},{'name':'Dec','days':31}],
	HEIGHT = 100,
	curGroup = DAYS_THIS_YEAR = 0,
	projList = [],
	today = new Date(),
	LEFT_COLUMN,
	ONE_DAY,
	CTX,
	WIDTH,
	CONTAINER,
	canvasElement,
	displayYear,
	currentYear,
	numberMonths,
	startingMonth,
	viewStart,
	viewEnd,
	canvasX,
	canvasY,
	hoverObj = {isHovering:false,project:{}},
	CANVAS = document.createElement('canvas'),
	errorMessage = document.createElement('canvas'),
	toolTip = document.createElement('span');
	
	CANVAS.id = 'SCDX-viewLayer';
	errorMessage.id = 'SCDX-errorMessage';
	toolTip.id = 'SCDX-toolTip';
	
	// PUBLIC PROPERTIES / SETTINGS
	SCDX.highPrioColor = '#F66';
	SCDX.lowPrioColor = '#6F6';
	SCDX.defaultPrioColor = '#66F';
	SCDX.roundedCorners = true;
	SCDX.timeToFade = 1000.0;
	SCDX.fontFace = 'bold 16px Arial';

	// PUBLIC METHODS
	SCDX.createSchedule = function (divID,year,width,numMonths,startMonth) {
		// Get the container that we're going to be working within.
		CONTAINER = document.getElementById(divID);
		// Set these variables with the data passed, or with a default value.
		canvasElement = divID;
		currentYear = displayYear = Number(year) || today.getFullYear();
		WIDTH = Number(width) || CONTAINER.getAttribute('width');
		numberMonths = Number(numMonths) || 12;
		startingMonth = Number(startMonth) || today.getMonth()+1;
		
		// Need to check if the starting year is a leap year.
		if(Number(displayYear)%4 != 0) {
			MONTHS[1].days = 28;
		} else {
			MONTHS[1].days = 29;
		}
		
		CONTAINER.innerHTML = '';
		CONTAINER.style.position='relative';
		CTX = CANVAS.getContext('2d');
		CONTAINER.appendChild(CANVAS);
		CONTAINER.appendChild(toolTip);
		CONTAINER.appendChild(errorMessage);
		
		// Need to capture the mouse position:
		CANVAS.onmousemove = CANVAS.onmouseover = function (event) {
			event = event || window.event;
			// Check the positions of the projects with the mouse position.
			// If it's over a project, and there's a description, then show the tool tip for it.
			// For some reason, this flashes when hovering...
			if(hoverObj.isHovering) {
				curProj = hoverObj.project;
				console.log(curProj.xPos);
				// Hovering over an item. Check we're still in it.
				if((event.layerX > curProj.xPos) && (event.layerX < (curProj.xPos+curProj.width)) && ((event.layerY > curProj.yPos)&&(event.layerY < (curProj.yPos + curProj.height)))) {
					// Update the toolTip position.
					toolTip.style.left = (event.clientX + 15) + 'px';
					toolTip.style.top = event.clientY + 'px';
				} else {
					console.log("Hiding... Did you call it?");
					// Clear the hoverObj.
					hoverObj.isHovering = false;
					// Hide the toolTip.
					toolTip.style.visibility = 'hidden';
				}
			} else {
				// Not hovering, so check to see if we've come into something.
				for(var i = 0, len = projList.length; i < len; i++) {
					var curProj = projList[i];
					if( (event.layerX > curProj.xPos) && (event.layerX < (curProj.xPos+curProj.width)) && ((event.layerY > curProj.yPos)&&(event.layerY < (curProj.yPos + curProj.height)))) {
						// In the zone.
						if(typeof curProj.description != "undefined") {
							toolTip.style.left = (event.clientX + 15) + 'px';
							toolTip.style.top = event.clientY + 'px';
							toolTip.style.visibility = 'visible';
							toolTip.innerHTML = curProj.description;
							hoverObj.isHovering = true;
							hoverObj.project = curProj;
						}
					}
				}
			}
		};
		
		// And just to make sure that little tooltip isn't going to fllow the mouse everywhere...
		CANVAS.onmouseout = function () {
			console.log("mouseout");
			toolTip.style.visibility = 'hidden';
		}
		
		// Figure out which date the view starts on (TIMESTAMP):
		viewStart = Number(Date.parse("01 "+MONTHS[startingMonth-1].name+" "+displayYear+" 00:00:00 GMT"));
		
		// viewEnd calculation: First we need the month on which it starts
		// Then add the number of months to it.
		viewEnd = startingMonth + numberMonths;
		// Now we need to figure out how many days there are in those months.
		// Start at the 'startingMonth' and then move up until we're at the end.
		var tempMonth = startingMonth-1;
		DAYS_THIS_YEAR = 0;
		for (var i = 0; i<numberMonths;i++) {
			if(tempMonth == 12) {
				// Flicking past a year. Reset month...
				tempMonth = 0;
				// Increment the current year...
				currentYear++;
				// Check for a leap year.
				if(currentYear%4 == 0) {
					MONTHS[1].days = 29;
				} else {
					MONTHS[1].days = 28;
				}
			}
			DAYS_THIS_YEAR += MONTHS[tempMonth].days;
			tempMonth++;
		}
		
		// The minus one ensures we don't trigger the 1st day of the next month... Think about it...
		viewEnd = (viewStart + ((DAYS_THIS_YEAR) * 86400000))-1;
		
		// Set the width of the canvas.
		CANVAS.width = WIDTH;
		// Set a default height to accommodate the top bar and an error message if needed.
		//HEIGHT = CANVAS.height = 100;
		
		LEFT_COLUMN = WIDTH * 0.15625
		ONE_DAY = (WIDTH - LEFT_COLUMN) / DAYS_THIS_YEAR;
		
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
		for(var i = 0, len = objArray.length;i < len; i++) {
			projList.push(objArray[i]);
		}
		
		// Calculate height of the canvas now...
		HEIGHT = CANVAS.height = (Math.max.apply(Math,projList.map(function(projList){return projList.groupId;}))+1) * 49;
		drawSchedule();
	}
	
	SCDX.displayErrorMessage = function(textToDisplay,fadeSpeed) {
		errorMessage.style.opacity = 1;
		errorMessage.style.visibility = 'visible';
		obj = CANVAS;
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
		errorMessage.width = CANVAS.width;
		errorMessage.height = CANVAS.height;
		overlayCTX = errorMessage.getContext('2d');
		
		// Darken the background...
		overlayCTX.fillStyle = 'rgba(255,255,255,0.5)';
		overlayCTX.fillRect(0,0,WIDTH,HEIGHT);
		
		overlayCTX.fillStyle = '#FFFFE0';
		overlayCTX.strokeStyle = '#333';
		overlayCTX.font = SCDX.fontFace;
		
		if(SCDX.roundedCorners) {
			roundRect(overlayCTX,(WIDTH/4),(HEIGHT / 4),(WIDTH / 2),(HEIGHT / 2),5,true,true);
		} else {
			overlayCTX.fillRect((WIDTH/4),(HEIGHT / 4),(WIDTH / 2),(HEIGHT / 2));
			overlayCTX.strokeRect((WIDTH/4),(HEIGHT / 4),(WIDTH / 2),(HEIGHT / 2));
		}
		
		overlayCTX.fillStyle = '#F00';
		overlayCTX.textAlign = 'center';
		overlayCTX.fillText(textToDisplay,WIDTH/2,(HEIGHT/2)+5);
		
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
		CANVAS.width = errorMessage.width = WIDTH;
		CANVAS.height =  errorMessage.height = HEIGHT;
		
		var xPos = LEFT_COLUMN;
		
		// GRID LINE DRAWING
		
		// Draw the horizontal year dividing line.
		CTX.moveTo(0,26.5);
		CTX.lineTo(WIDTH,26.5);
		
		// Team dividing line...
		CTX.moveTo(xPos,0);
		CTX.lineTo(xPos,HEIGHT);
		
		// Write the starting year.
		CTX.fillStyle = '#333333';
		CTX.font = SCDX.fontFace;
		CTX.fillText(currentYear,xPos + 5,21);
		
		// Now to draw the divisions for the months...
		var curMonth = startingMonth-1;
		CTX.strokeStyle = "#CCC";
		for(var i = 0; i < numberMonths; i++) {
			// Calculate a change in the year.
			if(curMonth == 12) {
				currentYear++;
				if( (currentYear+1)%4 == 0) {
					MONTHS[1].days = 29;
				} else {
					MONTHS[1].days = 28;
				}
				CTX.fillText(currentYear, xPos+5,21);
				curMonth = 0;
				CTX.moveTo(xPos,0);
				CTX.lineTo(xPos,HEIGHT);
			}
			CTX.fillText(MONTHS[curMonth].name,xPos+5,42);
			xPos += MONTHS[curMonth].days * ONE_DAY;
			CTX.moveTo(xPos,47.5);
			CTX.lineTo(xPos,HEIGHT);
			curMonth++;
		}
		
		// Dividing line between months and schedule.
		CTX.moveTo(0,47.5);
		CTX.lineTo(WIDTH,47.5);
		CTX.stroke();
		
		if(projList.length > 0) {
			// PROJECT RENDERING
			
			// How about, to stop it from overlaying strokes on the regular fillRect, we draw the
			// dividing lines here?...
			var maxGroup = Math.max.apply(Math,projList.map(function(projList){return projList.groupId;})),
				lineHeight = Math.round((HEIGHT - 47.5) / maxGroup)-1;
			CTX.strokeStyle = '#CCC';
			for(var i = 0, len = maxGroup; i < len; i++) {
				CTX.moveTo(0,Math.round((lineHeight * (i+1))+49)-0.5);
				CTX.lineTo(WIDTH,Math.round((lineHeight * (i+1))+49)-0.5);
				CTX.stroke();
			}
			
			
			for(var i = 0, len = projList.length; i < len; i++) {
				// Itterate over the list of projects.
				// REMEMBER: DATES ARE TIMESTAMPED!
				
				// Temporary variables for each loop.
				var startDate = projList[i].startDate,
					endDate = projList[i].endDate,
					startPos = LEFT_COLUMN,
					numDays = endDay = z = 0,
					curMonth = startingMonth,
					thisProject = projList[i];
				
				// Reset class variable.
				currentYear = displayYear;
				
				// Display the group name if it's a different group.
				if(projList[i].groupId != curGroup) {
					curGroup = projList[i].groupId;
					CTX.fillStyle = '#333';
					CTX.fillText(projList[i].rowLabel,5,((projList[i].groupId+0.6) * 49));
				}
				
				// Set correct colour for priority:
				switch(thisProject.prio) {
					case 'high':
						CTX.fillStyle = CTX.strokeStyle = SCDX.highPrioColor;
						break;
					case 'low':
						CTX.fillStyle = CTX.strokeStyle = SCDX.lowPrioColor;
						break;
					default:
						CTX.fillStyle = CTX.strokeStyle = SCDX.defaultPrioColor;
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
					lengthOfProject = (((thisProject.endDate-thisProject.startDate) / 86400000) + 1) * ONE_DAY;
					// The x position of the project:
					leftEdge = LEFT_COLUMN + ( ( ( thisProject.startDate - viewStart) / 86400000) * ONE_DAY );
					validProj = true;
				} else if (thisProject.endDate > viewStart && thisProject.endDate < viewEnd) {
					// The project starts before the view, but ends before the end of the view.
					lengthOfProject = (((thisProject.endDate-viewStart) / 86400000) + 1) * ONE_DAY;
					// The x position of the project:
					leftEdge = LEFT_COLUMN;
					validProj = true;
				} else if (thisProject.startDate > viewStart && thisProject.startDate < viewEnd && thisProject.endDate > viewEnd) {
					// This project stars in the view, but extends off the right hand side.
					// The length of the project in pixels:
					lengthOfProject = (((viewEnd-thisProject.startDate) / 86400000) + 1) * ONE_DAY;
					// The x position of the project:
					leftEdge = LEFT_COLUMN + ( ( ( thisProject.startDate - viewStart) / 86400000) * ONE_DAY );
					validProj = true;
				} else if (thisProject.startDate <= viewStart && thisProject.endDate >= viewEnd) {
					// The project fills the ENTIRE view! It starts before the view and finishes after.
					lengthOfProject = (((viewEnd - viewStart) / 86400000) + 1) * ONE_DAY;
					leftEdge = LEFT_COLUMN;
					validProj = true;
				}
				
				if(validProj) {
					projList[i].xPos = leftEdge;
					projList[i].yPos = topEdge;
					projList[i].width = lengthOfProject;
					projList[i].height = 47.5;
					// Draw it on:
					if(SCDX.roundedCorners) {
						roundRect(CTX, leftEdge, topEdge, lengthOfProject,47.5,5,true,true);
					} else {
						CTX.clearRect(leftEdge,topEdge,lengthOfProject,47.5);
						CTX.fillRect(leftEdge,topEdge,lengthOfProject,47.5);
						CTX.strokeRect(leftEdge,topEdge,lengthOfProject,47.5);
					}
				}
			}
		} else {
			SCDX.displayErrorMessage('No projects to display.');
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
			// -2 = Fullt transparent.
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
	
window.SCDX = SCDX;

})(window);