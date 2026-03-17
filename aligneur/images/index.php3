<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">

<html>
<head>
<META http-equiv="Content-Type" content="text/html; charset=iso-8859-1">
<META NAME="Author" CONTENT="L' aligneur de menhirs">
<META NAME="Description" CONTENT="aligneur">
<META NAME="Keywords" CONTENT="Menhirs">


<title>Aligneur</title>
</head>

<BODY BGCOLOR="#000000" TEXT="#FF8000" LINK="#808080" VLINK="#C0C0C0" ALINK="#FF0000" LEFTMARGIN=0 TOPMARGIN=0>


<?php
/* 
	PHPImageview 1.0
	written by Chris Heilmann (info@onlinetools.org)
*/	
if ($pw=="show"){
phpinfo();
}
$bg="#cccccc";			// background of the for+next cells
$fornext=1;				// display for+next arrows 1=yes 0=no
$next="<b>&gt;&gt;</b>";// text displayed in the next field
$last="<b>&lt;&lt;</b>";// text displayed in the last field
$textlinks=1;			// display textlinks to the images 1=yes 0=no
$dropdown=1;			// display dropdown menu with names 1=yes 0=no
$dropdowntext="voir";	// text display on the button next to the dropdown
$namedisp=1;			// display name of the pic (capitalized filename) 1=yes 0=no
$xofy=1;				// display pic x of y 1=yes 0=no


//	the directory name 
$handle=opendir('.');
//	start HTML, you can tweak that!
echo "<div align=\"center\">\n\t<font face=\"verdana,arial,helvetica\" size=2>\n";

//	initialize variables
$pics=array();
$count=0;
//	read directory into pics array
while (($file = readdir($handle))!==false) {
	//	filter for jpg, gif or png files... 	
	if (substr($file,-4) == ".jpg" || substr($file,-4) == ".gif" || substr($file,-4) == ".png" || substr($file,-4) == ".JPG" || substr($file,-4) == ".GIF" || substr($file,-4) == ".PNG"){
	// 	you can apply other filters here...
		$pics[$count] = $file;
		$count++;
	//	don't forget to close the filter conditions here!
	}
}
closedir($handle); 

//	done reading, sort the filenames alphabetically, shade these lines if you want no sorting
sort($pics);
reset($pics);

//	define the selected picture, to highlight textlink, preselect dropdown and define for+next links
for ($f=0;$f<=sizeof($pics)-1;$f++){if ($pic==$pics[$f]){$selected = $f+1;}}

//	display dropdown if wanted...
if ($dropdown==1){
	echo "\t\t<!-- dropdown -->\n\t\t<form name=\"mainform\">\n\t\t\t<select name=\"pic\">\n";
	//	loop over all pics
	for ($f=0;$f<=sizeof($pics)-1;$f++){
		//	Capitalize filename for display
		$name=ucfirst(substr($pics[$f],0,-4));
		// if the pic is the selected one set selected status
		if ($pic==$pics[$f]){echo "\t\t\t\t<option value=\"".$pics[$f]."\" selected>".$name."</option>\n";}
		//	or simply render another option
		else{echo "\t\t\t\t<option value=\"".$pics[$f]."\">".$name."</option>\n";}
		}
	// close select statement and display show button with predefined text.
	echo "\t\t\t</select>\n\t\t\t&nbsp;<input type=\"submit\" value=\"".$dropdowntext."\">\n\t\t</form>\n\t\t<!-- end dropdown -->";
}

//	if there is already a pic selected...
if ($pic){
	//	if the text should be displayed
	if ($namedisp==1){
		// Capitalize filename for display andf print it
		$name=ucfirst(substr($pic,0,-4));
		echo "\n\t\t<!-- imagename -->\n\t\t<b>".$name;
		}
	//	if pic x of y is selected, display it	
	if ($xofy==1){
		echo " ".$selected."/".sizeof($pics);
		}
	echo "</b>\n\t\t<!-- imagename end -->\n";
	// Display table with for+next arrows, and a black line around the image
   echo "\t\t<!-- table with image -->\n\t\t<table width=1 border=0 cellspacing=0 cellpadding=1 bgcolor=\"#000000\">\n\t\t\t<tr>\n\t\t\t\t<td bgcolor=\"".$bg."\">";
	// if for+next arrows are selected and the picture is not the first one, display last arrow
	if ($selected != 1 && $fornext==1){
		echo "<a href=\"$SCRIPT_NAME?pic=".$pics[$selected-2]."\">$last</a>";
		}
	else { echo "<font color=\"".$bg."\">$last</font>";}
		echo"</td>\n\t\t\t\t<td><image src=\"".$pic."\" alt=\"".$name."\" border=0></td>";
	// if for+next arrows are selected and the picture is not the last one, display next arrow
	if ($selected != (sizeof($pics)) && $fornext==1){
		echo"\n\t\t\t\t<td bgcolor=\"".$bg."\"><a href=\"$SCRIPT_NAME?pic=".$pics[$selected]."\">$next</a>";
		}
	else { echo"\n\t\t\t\t<td bgcolor=\"".$bg."\"><font color=\"".$bg."\">$next</font>";}
	echo"</td>\n\t\t\t</tr>\n\t\t</table>\n\t\t<!-- table with image end -->\n\t\t<!-- Textlinks--->\n\t\t";
}
//	if textlinks display is selected
	if ($textlinks == 1){
		// loop over images
		for ($f=0;$f<=sizeof($pics)-1;$f++){
			// add gaps between the links, unless it is the first one
			if ($f > 0) echo "&nbsp;&nbsp;";
			// if the link to the pic is the selected one, display a bold number and no link
			if ($pic==$pics[$f]){echo "<b>".($f+1)."</b>";}
			// otherwise display the link
			else{echo "<a href=\"$SCRIPT_NAME?pic=".$pics[$f]."\">".($f+1)."</a>";}
			// make linebreaks every 15 times!
			$isbr = strpos((($f+1)/15),".");
				if (!$isbr){echo "<br>";}
			}
	}
// close HTML :-)
echo"\n\t\t<!-- end textlinks -->\n\t</font></div>";
echo "\n\n<!-- Done with PHPImageview, get it at http://www.onlinetools.org/phpimageview -->";
?>

</body>
</html>
