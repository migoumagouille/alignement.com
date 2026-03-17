/*
Pop up information box II (Mike McGrath (mike_mcgrath@lineone.net,  http://website.lineone.net/~mike_mcgrath))
Permission granted to Dynamicdrive.com to include script in archive
For this and 100's more DHTML scripts, visit http://dynamicdrive.com
*/
Xoffset = -60;    // modify these values to ...
Yoffset = 20;    // change the popup position.

// id browsers
var iex = (document.all);
var nav = (document.layers);
var old = (navigator.appName=="Netscape" && !document.layers && !document.getElementById);
var n_6 = (!document.all && document.getElementById);
var yyy = -1000;
var skn;

if(!old)
{  if(nav)
   {  skn = document.dek;
      document.captureEvents(Event.MOUSEMOVE);
      document.onmousemove = get_mouse;
   }
   else if(iex)
   {  skn = dek.style;
      document.onmousemove = get_mouse;
   }
   else if(n_6)
   {  skn = document.getElementById("dek").style;
      document.addEventListener("mousemove", get_mouse, true);
   }
}


function popup(msg,bak)
{  var content = "<table border=\"1\" cellpadding=\"0\" cellspacing=\"0\" bordercolor=\"black\" width=\"150\" bgcolor=\""+bak+"\"><td align=\"center\"><span style = \"font-size: 12px; font-family: sans-serif, Arial;\">"+ msg +"</span></td></table>";

   if(old)
   {  alert(msg);
      return;
   }
   else
   {  yyy = Yoffset;

      if(nav)
      {  skn.document.write(content);
         skn.document.close();
      }
      else if(iex)
      {  document.all("dek").innerHTML = content;
      }
      else if(n_6)
      {  document.getElementById("dek").innerHTML = content;
      }
      
      skn.visibility = "visible";
   }
}


function get_mouse(e)
{  var x,y;

   if (nav)
   {  x = e.pageX;
      y = e.pageY + 10;
      skn.left = x + Xoffset; 
      skn.top = y + yyy; 
   }
   else if (n_6)
   {  x = e.pageX - 150;
      y = e.pageY - 80;
      skn.left = x + Xoffset + "px";
      skn.top = y + yyy + "px";
   }
   else if (iex)
   {  x = event.x + document.body.scrollLeft - 150;
      y = event.y + document.body.scrollTop - 80;
      skn.left = x + Xoffset;
      skn.top = y + yyy;
   }
}


function kill()
{  if(!old)
   {  yyy = -1000;
      skn.visibility = "hidden";
   }
}
