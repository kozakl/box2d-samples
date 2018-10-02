/**
 * @author kozakluke@gmail.com
 */
"use strict";
DetectDevice.smartphones = [
    /Mobile/i,
    /Android/i,
    /iPhone/i,
    /BlackBerry/i,
    /Windows Phone/i,
    /Windows Mobile/i,
    /Maemo/i,
    /PalmSource/i,
    /SymbianOS/i,
    /SymbOS/i,
    /Nokia/i,
    /MOT-/i,
    /JDME/i,
    /Series 60/i,
    /S60/i,
    /SonyEricsson/i
];
DetectDevice.tablets = [
    /Android 3/i,
    /iPad/i
];

function DetectDevice() { }

DetectDevice.detect = function()
{
    var userAgent = navigator.userAgent;
    var n = DetectDevice.tablets.length;
    for (var i = 0; i < n; i++)
        if (userAgent.match(DetectDevice.tablets[i]))
            return "tablet";
    
    n = DetectDevice.smartphones.length;
    for (i = 0; i < n; i++)
        if (userAgent.match(DetectDevice.smartphones[i]))
            return "smartphone";
    
    return "desktop";
};

DetectDevice.isDesktop = function()
{
    return Number(DetectDevice.detect() == "desktop");  
};

DetectDevice.isMobile = function()
{
    return Number(DetectDevice.detect() != "desktop");
};
