SCDX
====

Schedule Canvas DX
------------------

This is a pure JavaScript component to render a 'schedule view' using HTML5 canvas.

How To Use
----------
1) Include the 'SCDX.js' file in your web page.
2) Add a <div> to your page and assign it an ID.
3) Initialise the schedule by using the following:
   SCDX.createSchedule(divID[,year,width,numMonths,startMonth]);
      -- divID = The ID of your DIV where you want the view to render.
      -- year (optional) = The year you want the view to start on. Default: Current year.
      -- width (optional) = The width of the canvas in pixels. Default: The width of the container.
      -- numMonths (optional) = The number of months in view. Default: 12.
      -- startMonth (optional) + The number of the month to start the view on. Default: 1 (January).

4) Once the SCDX object has been initialised, you can add a set of schedule objects to it. For example:

     var scheduleList = [];
     scheduleList.push({'groupId':1,'rowLabel':'Brian Milton','startDate':1360886400000,'endDate':1363305600000});

5) Then assign this list to the SCDX object and have it render the view by calling:
   SCDX.setSchedule(scheduleList);

Schedule Object
---------------
This is the data structure to be followed for adding an item to the schedule. Data is mandatory unless otherwise stated:

groupId (Number)
  -- If items have the same groupId, they will appear on the same line.

rowLabel (String)
  -- This is the label that will show on the line for the groupId. Only the first item in the group requires this.

startDate (Number)
  -- UNIX timestamp in milliseconds.

endDate (Number)
  -- UNIX timestamp in milliseconds.

prio [optional] (String)
  -- Options:'low'/'high'. Different priorities have different colors. See below for customising. Default: none.

description [optional] (String)
  -- The text in the description will pop up in a 'tooltip' when you hover over the relevant item in the view.

Customization
-------------
There are a few exposed properties to customise the view a little. These are:

SCDX.highPrioColor
  -- A hex value representing the colour for high priority items (Default: '#F66').

SCDX.lowPrioColor
  -- A hex value representing the colour for low priority items. (Default: '#6F6').

SCDX.defaultPrioColor
  -- A hex value representing the colour for items with no priority set. (Default: '#66F').

SCDX.roundedCorners
  -- A boolean value to draw rounded corners (non-rounded corners are a bit buggy...). (Default: true).

SCDX.timeToFade
  -- A floating point number representing how long it will take to fade out an item. (Default: 1000.0).

SCDX.fontFace
  -- A string representing the font to use throughout the app for all text except the tool-tip. (Default: 'bold 16px Arial').

Methods
-------
The exposed methods of the object are:

SCDX.createSchedule(divId[,year,width,numMonths,startMonth])
  -- divID = The ID of your DIV where you want the view to render.
  -- year (optional) = The year you want the view to start on. Default: Current year.
  -- width (optional) = The width of the canvas in pixels. Default: The width of the container.
  -- numMonths (optional) = The number of months in view. Default: 12.
  -- startMonth (optional) + The number of the month to start the view on. Default: 1 (January).

SCDX.changeView(year,startMonth,numMonths)
  -- year = The year you want the view to start on.
  -- startMonth = The month you want the view to start on.
  -- numMonths = The number of months you want to display.
  ** Note: There are no default options in this method. It's there to respond to a UI request for a change/update. **

SCDX.setSchedule(objArray)
  -- objArray = An array containing schedule objects (see 'Schedule Object' above for a breakdown of data).
  ** Note: If you're not hard coding it, you can call this from an AJAX success. A call to this method will redraw the view in its entirety. A lack of a valid object will trigger an error message. **

SCDX.displayErrorMessage(textToDisplay[,fadeSpeed])
  -- textToDisplay = A string representing the message in the pop-up.
  -- fadeSpeed [optional] = The speed, in milliseconds, to fade out. Default: SCDX.timeToFade (1000.0)

Please feel free to fork and help out with the building of this widget/control. If people are interested, I'll add other features. At present, this does everything that I want it to, but I would be open to ideas and thoughts on improvements that can be made. :-)
