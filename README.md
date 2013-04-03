SCDX
====

Schedule Canvas DX
------------------

This is a pure JavaScript component to render a 'schedule view' using HTML5 canvas.

How To Use
----------
<ol>
   <li>
      Include the 'SCDX.js' file in your web page.
   </li>
   <li>
      Add a &lt;div&gt; to your page and assign it an ID.
   </li>
   <li>
      Initialise the schedule by using the following:<br>
      <code>
         SCDX.createSchedule(divID[,year,width,numMonths,startMonth]);
      </code>
      <ul>
         <li>
            divID = The ID of your DIV where you want the view to render.
         </li>
         <li>
            year (optional) = The year you want the view to start on. Default: Current year.
         </li>
         <li>
            width (optional) = The width of the canvas in pixels. Default: The width of the container.
         </li>
         <li>
            numMonths (optional) = The number of months in view. Default: 12.
         </li>
         <li>
            startMonth (optional) + The number of the month to start the view on. Default: 1 (January).
         </li>
      </ul>
   </li>
   <li>
      Once the SCDX object has been initialised, you can add a set of schedule objects to it. For example:<br>
      <code>
         var scheduleList = [];
         scheduleList.push({'groupId':1,'rowLabel':'Brian Milton','startDate':1360886400000,'endDate':1363305600000});
      </code>
   </li>
   <li>
      Then assign this list to the SCDX object and have it render the view by calling:<br>
      <code>
         SCDX.setSchedule(scheduleList);
      </code>
   </li>
</ol>
<br>
Schedule Object
---------------
This is the data structure to be followed for adding an item to the schedule. Data is mandatory unless otherwise stated:

<code>groupId</code> (Number)<br>
  -- If items have the same groupId, they will appear on the same line.

<code>rowLabel</code> (String)<br>
  -- This is the label that will show on the line for the groupId. Only the first item in the group requires this.

<code>startDate</code> (Number)<br>
  -- UNIX timestamp in milliseconds.

<code>endDate</code> (Number)<br>
  -- UNIX timestamp in milliseconds.

<code>prio</code> (optional) (String)<br>
  -- Options:'low'/'high'. Different priorities have different colors. See below for customising. Default: none.

<code>description</code> (optional) (String)<br>
  -- The text in the description will pop up in a 'tooltip' when you hover over the relevant item in the view.

Customization
-------------
There are a few exposed properties to customise the view a little. These are:

<code>SCDX.highPrioColor</code><br>
  -- A hex value representing the colour for high priority items (Default: '#F66').

<code>SCDX.lowPrioColor</code><br>
  -- A hex value representing the colour for low priority items. (Default: '#6F6').

<code>SCDX.defaultPrioColor</code><br>
  -- A hex value representing the colour for items with no priority set. (Default: '#66F').

<code>SCDX.roundedCorners</code><br>
  -- A boolean value to draw rounded corners (non-rounded corners are a bit buggy...). (Default: true).

<code>SCDX.timeToFade</code><br>
  -- A floating point number representing how long it will take to fade out an item. (Default: 1000.0).

<code>SCDX.fontFace</code><br>
  -- A string representing the font to use throughout the app for all text except the tool-tip. (Default: 'bold 16px Arial').

Methods
-------
The exposed methods of the object are:

<code>SCDX.createSchedule(divId[,year,width,numMonths,startMonth])</code><br>
<ul>
   <li>
      divID = The ID of your DIV where you want the view to render.
   </li>
   <li>
      year (optional) = The year you want the view to start on. Default: Current year.
   </li>
   <li>
      width (optional) = The width of the canvas in pixels. Default: The width of the container.
   </li>
   <li>
      numMonths (optional) = The number of months in view. Default: 12.
   </li>
   <li>
      startMonth (optional) + The number of the month to start the view on. Default: 1 (January).
   </li>
</ul>

<code>SCDX.changeView(year,startMonth,numMonths)<code><br>
<ul>
   <li>
      year = The year you want the view to start on.
   </li>
   <li>
      startMonth = The month you want the view to start on.
   </li>
   <li>
      numMonths = The number of months you want to display.
   </li>
   <li>
      Note: There are no default options in this method. It's there to respond to a UI request for a change/update.
   </li>
</ul>

<code>SCDX.setSchedule(objArray)<code><br>
<ul>
   <li>
      objArray = An array containing schedule objects (see 'Schedule Object' above for a breakdown of data).
   </li>
   <li>
      Note: If you're not hard coding it, you can call this from an AJAX success. A call to this method will redraw the view in its entirety. A lack of a valid object will trigger an error message. **
   </li>
</ul>

<code>SCDX.displayErrorMessage(textToDisplay[,fadeSpeed])<code><br>
<ul>
   <li>
      textToDisplay = A string representing the message in the pop-up.
   </li>
   <li>
      fadeSpeed [optional] = The speed, in milliseconds, to fade out. Default: SCDX.timeToFade (1000.0)
   </li>
</ul>

Please feel free to fork and help out with the building of this widget/control. If people are interested, I'll add other features. At present, this does everything that I want it to, but I would be open to ideas and thoughts on improvements that can be made. :-)
