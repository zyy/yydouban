function keypressevt(cmd){
	switch(cmd){
	case 0:
		$$("navpage").className="ui-corner-all ui-btn ui-btn-up-c dis-pagenav-active uc-a";
		break;
	case 1:
		$$("pn1").src = "../css/images/icons-18_49_act.png";
		break;
	case 2:
		$$("pn2").src = "../css/images/icons-18_09_act.png";
		break;
	case 3:
		$$("pn3").src = "../css/images/icons-18_07_act.png";
		break;
	case 4:
		$$("pn4").src = "../css/images/icons-18_47_act.png";
		break;
	}
	setTimeout('keyupevt('+cmd+')', 300);
}
function keyupevt(cmd){
	switch(cmd){
	case 0:
		$$("navpage").className="ui-corner-all ui-btn ui-btn-up-c dis-pagenav-static uc-a";
		break;
	case 1:
		$$("pn1").src = "../css/images/icons-18_49.png";
		break;
	case 2:
		$$("pn2").src = "../css/images/icons-18_091.png";
		break;
	case 3:
		$$("pn3").src = "../css/images/icons-18_071.png";
		break;
	case 4:
		$$("pn4").src = "../css/images/icons-18_47.png";
		break;
	}
}
function setpagenum(obj, cpage, tpage, flag)
{
	var str = '';
	var s = '';
	var l = '<div style="border-top: 1px solid #c0c0c0; border-bottom: 1px solid white;"></div>';
	if(obj) obj.curpage = cpage;
	if(obj) obj.totpage = tpage;
	if(flag){
		s="border:none; border-bottom-left-radius:6px; border-bottom-right-radius:6px;";
		l = "";
		
	}
	str= '<div data-role="header" class="ui-bar-d dis-page-bg c-blu" style="padding:0.7em 0; display:-webkit-box; -webkit-box-align:center; -webkit-box-pack:center; text-align:center; border-top: none;'+s+'">'
			+'<div style="width:20%;" onclick="turnpage(0);keypressevt(1);"><img src="../css/images/icons-18_49.png" id="pn1"></div>'
			+'<div style="width:10%;" onclick="turnpage(-1);keypressevt(2);"><img src="../css/images/icons-18_091.png" id="pn2"></div>'
			+'<div style="width:40%;" onclick="jumppage();keypressevt(0);"><div data-role="button" class=" ui-corner-all ui-btn ui-btn-up-c uc-a dis-pagenav-static" style="margin:0 1.5em;" id="navpage"><span class="ui-btn-inner ui-corner-all" style="padding-top:.3em; padding-bottom:.3em;"><span class="ui-btn-text dis-txt-shadow-none">'+cpage+'/'+tpage+'</span></span></div></div>'
			+'<div style="width:10%;" onclick="turnpage(1);keypressevt(3);"><img src="../css/images/icons-18_071.png" id="pn3"></div>'
			+'<div style="width:20%;" onclick="turnpage(2);keypressevt(4);"><img src="../css/images/icons-18_47.png" id="pn4"></div>'
		+'</div>'+l;
	if (obj) {
		setHtml(obj.pagenav, str);
	}
	else 
		setHtml("moreItem", str);
}

function setHtml(id, html) {
	if ("string" == typeof(id)) {
		var ele = $$(id);
		if (ele != null) {
			ele.innerHTML = html == null ? "" : html;
		}
	} else if (id != null) {
		id.innerHTML = html == null ? "" : html;
	}
}

var flip = null;
var fclass = 0;
function setfclass(flag){
	fclass = flag;
}

function wescript(wn, tp, scr){
	uexWindow.evaluateScript(wn,tp,scr);
}

function myclass(k){
	wescript("","0",'forumclass('+k+')');
	showmenu();
}
var so = false;
function showmenu(f){
  	if(flip){
		if(f==0 || f==1) so = f;
		else so = !so;
		
		if(so) setDisplayBlock('classmenu');
		else setDisplayNone('classmenu');
	}  
}

function setDisplay(id)
{
	var ele = $$(id);
	if(ele) ele.className = "";
	fclass = 1;
}

function this_for(e,cb, id)
{
	var ch = $$(id);
	if(ch.nodeName == "INPUT")
	{
		if(ch.type=="radio" && !ch.checked) ch.checked="checked";	
	}
	if(cb)
		cb(e, id);
}
function my_for(e, id){
	//return;
	if(fclass){
		var ta = $$(id).nextElementSibling.children[0];
		if(ta){
			ta.className = '';
		
			if(ta.id=="r011") setDisplayNone('r012');
			else setDisplayNone('r011');
		}
		else{
			setDisplayNone('r012');
			setDisplayNone('r011');
		}
	}	
}
function topagechange(i){
	wescript('','0','pagechange('+i+');')
}
