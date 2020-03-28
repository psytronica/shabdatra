/*
* Sanskrit v1.0
* Автор: Мара Черкасова
* Email: mara.scorpio@yandex.ru
*/

// global namespace
var ZGX = ZGX || {};

// Подгрузка необходимых скриптов
// var zgx_scripts = ['verbs.js', 'terms.js', 'times.js', 'lib.js'];

jQuery( document ).ready(function() {

	if(!jQuery("#zgx_shabdatra")[0]) return;

	/* var loaded_count = 0;

	for (var scr in zgx_scripts){

		jQuery.getScript('sanskrit/js/'+zgx_scripts[scr], function(){
			loaded_count++;
		});
	} */


	var zgx_interval = setInterval(function(){  

		//if(loaded_count == zgx_scripts.length){
			clearInterval(zgx_interval);
			ZGX.begin();
		//}

	}, 300);

});

// Точка входа в программу
ZGX.begin = function(){

	ZGX.htmlGen();

	ZGX.generateSettingsLists();	

	ZGX.generateLists();

	//ZGX.doTest();

	ZGX.setCheckEvents();
	jQuery("#zgx_show_hide_translate").click(function(){
		jQuery(this).toggleClass("active");
		jQuery("#zgx_ru_answer").toggle("400");
	});

	jQuery("#zgx_next").click(function(){
		ZGX.nextWord();
	});
	ZGX.nextWord();

	jQuery("#zgx_devanagari_to_hk").click(function(){

		ZGX.HK = !ZGX.HK;

		ZGX.onHKswitch();

		ZGX.showWord();

		ZGX.changeText();
	});

	ZGX.onHKswitch();


	jQuery('#zgx_answer').click(function(e){

		ZGX.changeText(e);

	}).keyup(function(e){

		ZGX.changeText(e);
	});

	jQuery(document).keypress(function(e) {
	    if(e.which == 13) {
	        ZGX.nextWord();
	    }
	});

	ZGX.createKeyboard();


	var helPopover = jQuery('#zgx_heading_menuitem_help').popover({
	 placement : 'bottom',
	 html: 'true',
	 container : '#zgx_popover_div',
	  }).on('show.bs.popover', function() { 
	  		
	  		helPopover.attr('data-content', 
	  				jQuery("#zgx_help_wrapper")[0].innerHTML);
	 });


}

// current random word
ZGX.CURRENT = [];

// current random word calculate
ZGX.CURFORM = [];

// if in Harvard Kyoto
ZGX.HK = false;

ZGX.onHKswitch = function(){

	if(!ZGX.HK){
		jQuery("#zgx_sanskrit_verbs").addClass("zgx_devanagari");
		jQuery("#zgx_answer").attr("placeholder", "Введите ответ (देवनागरी или HK)");
	}else{
		jQuery("#zgx_sanskrit_verbs").removeClass("zgx_devanagari");
		jQuery("#zgx_answer").attr("placeholder", "Введите ответ (Harvard-Kyoto)");
	}
}

ZGX.changeText = function(event){

	var txt = jQuery("#zgx_answer").val();
	var result = ZGX.CURFORM.result;

	if(!ZGX.HK){

		txt = ZGX.toDevanagari2(txt);
		jQuery("#zgx_answer")[0].value = txt;

		result = decodeEntities(ZGX.toDevanagari(result));

	}


	if(txt == result){
		jQuery("#zgx_answer_group").addClass("has-success");
	}else{
		jQuery("#zgx_answer_group").removeClass("has-success");
	}

	ZGX.checkPercent(txt, result);

};


ZGX.isActive = function(name){
	return jQuery("#zgx_heading_settings .btn[rel='"+name+
			"'] .glyphicon").hasClass('glyphicon-check');
}

ZGX.nextWord = function(){

	var verbs = [];

	jQuery("#zgx_answer_group").removeClass('has-success');
	
	for (var v in ZGX.VERBS){
		var varr = ZGX.VERBS[v];
	
		if (!ZGX.isChecked("voice") || varr[2]== "U" 
				|| varr[2]==ZGX.getValue("voice")){

			verbs.push(varr);
		}

	}

	while (true){

		var randnum = Math.floor(Math.random()*verbs.length);
		
		if(!ZGX.CURRENT.length || ZGX.CURRENT[0]!=verbs[randnum][0]){

			ZGX.CURRENT = verbs[randnum];
			break;
		}

	}


	var curs = {};
	var slists= ["type" , "time", "person", "voice"];

	for(var j in slists){

		curs[slists[j]] = ZGX.getValue(slists[j]);
	}


	if(!ZGX.isChecked("type") && !ZGX.isChecked("time")){

		var tmp_time_type = [];
		for(var timeType in ZGX.timeTypes){

			for(var time in ZGX.timeTypes[timeType]["times"]){

				if(!ZGX.isActive(time)) continue;

				tmp_time_type.push([timeType, time]);
			}
		}

		var randttnum = Math.floor(Math.random()*tmp_time_type.length);
		curs['type'] = tmp_time_type[randttnum][0];
		curs['time'] = tmp_time_type[randttnum][1];

	}else if(ZGX.isChecked("type")){

		var tmp_time = [];
		for(var time in ZGX.timeTypes[curs['type']]["times"]){

			if(!ZGX.isActive(time)) continue;

			tmp_time.push(time);
		}
		var randttnum = Math.floor(Math.random()*tmp_time.length);
		curs['time'] = tmp_time[randttnum];

	}

	if(!ZGX.isChecked("person")){
		curs['person'] =  Math.floor(Math.random()*9);

	}

	jQuery("#zgx_list_voice_menu li a").removeClass("disabled");


	if(ZGX.CURRENT[2]=="U"){

		if(!ZGX.isChecked("voice")){

			curs['voice'] = (Math.floor(Math.random()*2))? "P" : "A";
		}

	}else{

		curs['voice'] = ZGX.CURRENT[2];

		var vc = (ZGX.CURRENT[2]=="A")? "P" : "A" 
		jQuery("#zgx_list_voice_menu li a[rel='"+vc+"']")
											.addClass("disabled");

	}

	for (var kind in curs){

		if(curs[kind] != ZGX.getValue(kind)){
			var opt = jQuery('#zgx_list_'+kind+'_menu .zgx_list_'+kind
						+'_li a[rel="' +curs[kind] +'"]')[0];

			if(opt) ZGX.onListChange(opt, kind, true);
		}

	}


	jQuery("#zgx_answer").val("");

	ZGX.CURFORM = new ZGX.Times(ZGX.CURRENT, ZGX.getValue("time"), 
		ZGX.getValue("voice"), ZGX.getValue("person"));
	ZGX.CURFORM.go();

	ZGX.showWord();

	ZGX.checkPercent();

}

ZGX.showWord = function(){

	var cur_verb = ZGX.CURFORM.verb;
	var result = ZGX.CURFORM.result;

	if(!ZGX.HK){

		cur_verb = ZGX.toDevanagari(cur_verb);
		result = ZGX.toDevanagari(result);
	}

	jQuery("#zgx_verb").html(cur_verb);

	var result_text = decodeEntities(result) + "  ("+ZGX.CURFORM.group+" группа)";

	// правильный ответ в поповере
	jQuery("#zgx_correct_answer").attr("data-content", decodeEntities(result_text));
	var popoverId = jQuery("#zgx_correct_answer").attr("aria-describedby");
	if(popoverId){
		jQuery("#"+popoverId+" .popover-content")
			.addClass("zgx_answer_content chandas");
		jQuery("#"+popoverId+" .popover-content")[0].innerHTML =result_text;
	}

	// перевод
	jQuery("#zgx_translation").html(ZGX.CURFORM.translation);

	ZGX.showAllForms();
}

ZGX.showAllForms = function(){
	//zgx_allforms

	var html = '<div id="zgx_allforms_heading">Глагол <span class="badge">'
	+ZGX.CURFORM.group+ "</span> группы</div>";

	for(var timeType in ZGX.timeTypes){

		var type_name_ru = ZGX.timeTypes[timeType]["ru"];

		html += "<div class='list-group'>";

		html += '<span class="list-group-item active">';
            html += '<h4 class="list-group-item-heading">'+type_name_ru+'</h4>';
        html += '</span>';

		for(var time in ZGX.timeTypes[timeType]["times"]){

			var time_name = ZGX.timeTypes[timeType]["times"][time];

			html += '<span class="list-group-item">';
	            html += '<h4 class="list-group-item-heading">'+time_name+'</h4>';

	            html += '<p class="list-group-item-text">';

	            	html += ZGX.showVerbTable(time);

	            html += '</p>';
	        html += '</span>';

		}
        html += '</div>';

	}

	jQuery("#zgx_allforms").html(html);
}

ZGX.showVerbTable = function(time){

	var html = "";

	var pds = (ZGX.CURFORM.verb_obj[2]== "U")? 
			["P", "A"] : [ZGX.CURFORM.verb_obj[2]];

	for(var j in pds){

		var pd = pds[j];

		var str = "";
		for (var i =0; i<9; i++){

			var zx = new ZGX.Times(ZGX.CURFORM.verb_obj, time, pd, i);
			zx.go();
			if(!i && ZGX.CURFORM.verb_obj[2]== "U"){
				html += "<div><b>"+pd+"</b></div>";
			}
			if(i%3==0) str+="<tr><td class='zgx_allforms_fcol'>"+
										(i/3+1)+" лицо</td>";

			var resz = (!ZGX.HK)? ZGX.toDevanagari(zx.result) : zx.result;

			str+="<td>"+resz+"</td>"
			if((i+1)%3==0) str+="</tr>";

		}

		html += "<div><table><thead><tr><th></th><th>Ед. ч</th><th>Дв. ч</th>"+
			"<th>Мн. ч</th></tr></thead><tbody>"+
			str+"</tbody></table></div><br />";

	}

	return html;

}

ZGX.createKeyboard = function(){

	html= "";

	html += '<span class="list-group-item">';

        html += '<p class="list-group-item-text">';

        	for (var v in ZGX.vocals){
        		html +='<span onclick="ZGX.addLetter(\''+v+'\', \'vocal\')" '+
        				' class="zgx_keybut btn btn-success">'+ 
        					"&#x"+ZGX.vocals[v][0] + " | " +v+'</span>';
        		if(v == "U"){
        			html +='<br />';
        		}
        	}

         html += "<br />";

        	for (var crow_num in ZGX.consonants){
        		for(var c in ZGX.consonants[crow_num]){
        			html +='<span onclick="ZGX.addLetter(\''+c+
        			'\', \'consonant\')" class="zgx_keybut btn btn-warning">'+ 
        				"&#x"+ZGX.consonants[crow_num][c] + " | " +c+'</span>';
        		}
        		html +='<br />';
        	}


        	for (var s in ZGX.symbols){
        		html +='<span onclick="ZGX.addLetter(\''+s+
        		'\', \'symbol\')" class="zgx_keybut btn btn-success">'+ 
        					"&#x"+ZGX.symbols[s] + " | " +s+'</span>';
        	}

        	html +='<span onclick="ZGX.addLetter(\'backspace\', \'action\')" '+
        		' class="zgx_keybut btn btn-primary"><span '+
        			' class="glyphicon glyphicon-arrow-left"></span></span>';

        	html +='<span onclick="ZGX.addLetter(\'clear\', \'action\')" '+
        		' class="zgx_keybut btn btn-danger"><span '+
        			' class="glyphicon glyphicon-remove"></span></span>';

        html += '</p>';
    html += '</span>';    

    jQuery("#zgx_keyboard").append(html);
}


ZGX.addLetter = function(letter, ltype){

	var txt = jQuery("#zgx_answer").val();
	var result = ZGX.CURFORM.result;


	if (ltype=="action"){

		if(letter=="backspace"){

			if(!ZGX.HK){
				var lastSym = txt.substring(txt.length-1);
				var ll = ZGX.detectDevanagari(lastSym);

				var preLastSym = txt.substring(txt.length-2, txt.length-1);
				var pl = ZGX.detectDevanagari(preLastSym);

				if(ll.letter=="x" && pl.type=="consonant"){
					txt = txt.substring(0, txt.length-1);
				}
			}

			jQuery("#zgx_answer")[0].value = txt.substring(0, txt.length-1);

		}else if(letter=="clear"){

			jQuery("#zgx_answer")[0].value = "";

		}

	}else{

		if(ZGX.HK){

			jQuery("#zgx_answer")[0].value+=letter;

		}else{

			var letarr= letter.split("");
			for(var i = 0; i < letarr.length; i++){
				txt = ZGX.toDevanagari2(txt+letarr[i]);
			}
			jQuery("#zgx_answer")[0].value = txt;

			result = decodeEntities(ZGX.toDevanagari(result));
		}

	}

	txt = jQuery("#zgx_answer").val();

	if(txt == result){
		jQuery("#zgx_answer_group").addClass("has-success");
	}else{
		jQuery("#zgx_answer_group").removeClass("has-success");
	}

	ZGX.checkPercent(txt, result);

}

function decodeEntities(encodedString) {
    var textArea = document.createElement('textarea');
    textArea.innerHTML = encodedString;
    return textArea.value;
}


ZGX.getValue = function(kind){
	return jQuery("#zgx_list_"+kind).attr("rel");
}

ZGX.isChecked = function(kind){
	return jQuery( "#zgx_list_"+kind+" label input" )[0].checked;
}

ZGX.generateLists = function(){


	var k = 0;
	for(var timeType in ZGX.timeTypes){

		var type_name_ru = ZGX.timeTypes[timeType]["ru"];

		if(!k){
			jQuery("#zgx_list_type_title").text(type_name_ru);
			jQuery("#zgx_list_type").attr("rel", timeType);

			ZGX.generateTimeList(timeType);
		}

		jQuery("#zgx_list_type_menu").append('<li class="zgx_list_type_li">'+
        	'<a tabindex="-1" rel="'+timeType+
        	'" onclick="ZGX.onListChange(this, \'type\')"'+ 
        	' href="javascript:void(null)">'+
        	type_name_ru +'</a></li>');

		k++;
	}

	var n = 0;
	for(var pnum in ZGX.persons){

		if(!n){
			jQuery("#zgx_list_person_title").text(ZGX.persons[pnum]);	
			jQuery("#zgx_list_person").attr("rel", pnum);		
		}
		jQuery("#zgx_list_person_menu").append('<li class="zgx_list_person_li">'+
        	'<a tabindex="-1" rel="'+pnum+
        	'" onclick="ZGX.onListChange(this, \'person\')"'+ 
        	' href="javascript:void(null)">'+
        	ZGX.persons[pnum] +'</a></li>');		

		n++;
	}

	var n = 0;
	for(var voice in ZGX.voices){

		if(!n){
			jQuery("#zgx_list_voice_title").text(voice);	
			jQuery("#zgx_list_voice").attr("rel", voice);		
		}
		jQuery("#zgx_list_voice_menu").append('<li class="zgx_list_voice_li">'+
        	'<a tabindex="-1" rel="'+voice+
        	'" onclick="ZGX.onListChange(this, \'voice\')"'+ 
        	' href="javascript:void(null)">'+
        	ZGX.voices[voice] +'</a></li>');		

		n++;
	}	
    
}

ZGX.generateTimeList = function(timeType){

	var m = 0;
	for(var time in ZGX.timeTypes[timeType]["times"]){

		var time_name = ZGX.timeTypes[timeType]["times"][time];

		if(!m){
			jQuery("#zgx_list_time_title").text(time_name);
			jQuery("#zgx_list_time").attr("rel", time);	
		}

		var li = jQuery('<li class="zgx_list_time_li">'+
        	'<a tabindex="-1" rel="'+time+
        	'" onclick="ZGX.onListChange(this, \'time\')"'+ 
        	' href="javascript:void(null)">'+
    	time_name +'</a></li>');

		jQuery("#zgx_list_time_menu").append(li);

    	if(!jQuery("#zgx_settings_group_"+timeType+
			" .zgx_settings_check_item .btn.active[rel='"+time+"']")[0]){

			li.hide();
			li.addClass('zgx_hidden');	
    	}

		m++;

	}
}

ZGX.generateSettingsLists = function(){

	for(var timeType in ZGX.timeTypes){

		var type_name_ru = ZGX.timeTypes[timeType]["ru"];

		var grItem = jQuery('<span id="zgx_settings_group_'+timeType+
			'" class="list-group-item"></span>');

		var chinp = '<span class="'+
		'btn btn-warning btn-xs active" rel="'+timeType+
		'" checked><span class="glyphicon glyphicon-check"'+
			'></span></span> ';

		grItem.html('<h4 class="list-group-item-heading '+
			' zgx_settings_chbx zgx_settings_chbx_top">'
			+chinp+type_name_ru+'</h4>');
		var grItemText = jQuery('<p class="list-group-item-text"></p>');

		for(var time in ZGX.timeTypes[timeType]["times"]){

			var time_name = ZGX.timeTypes[timeType]["times"][time];
			chinp = '<span class="btn btn-success btn-xs active" rel="'+time+
			'" checked><span class="glyphicon glyphicon-check"'+
				'></span></span> ';
			grItemText.append('<span id="zgx_settings_'+time+
				'" class="zgx_settings_chbx '+
				'zgx_settings_check_item">'+ chinp+time_name+'</span>');

		}
		grItem.append(grItemText);
		jQuery("#zgx_heading_settings").append(grItem);

	}
	jQuery(".zgx_settings_chbx").click(function(){

		var chkBox = jQuery(this).children('.btn').first();

		var checked = !(chkBox.hasClass("active"));

		var isTop = jQuery(this).hasClass("zgx_settings_chbx_top");

		ZGX.settings_checkbox_check(chkBox, checked);

		if(isTop){
			chkBox.closest(".list-group-item").
				find(".list-group-item-text .zgx_settings_chbx .btn").each(
					function(index, el){
						ZGX.settings_checkbox_check(jQuery(el), checked);
				})

			ZGX.show_hide_list_opts_top(chkBox.attr("rel"), checked);

		}else{
			
			var top = chkBox.closest(".list-group-item").
					find(".zgx_settings_chbx_top .btn");

			ZGX.show_hide_list_opts(chkBox.attr("rel"), top.attr("rel"), checked);

			if(!checked){
			
				if(top.hasClass("active")){
					ZGX.settings_checkbox_check(top, false);
				}
			}else{
				var otherChecksNotActive = chkBox.closest(".list-group-item").
					find(".list-group-item-text .zgx_settings_chbx .btn")
						.not( ".active" );

				if(!otherChecksNotActive.length){
					ZGX.settings_checkbox_check(top, true);
				}	
			}
		}

	});

}

ZGX.show_hide_list_opts_top = function(type, isShow){

	var typeLi = jQuery('#zgx_list_type .zgx_list_type_li a[rel="'+
											type+'"]').parent();	

	if(isShow){

		typeLi.show();
		typeLi.removeClass('zgx_hidden');	


	}else{

		typeLi.hide();
		typeLi.addClass('zgx_hidden');	

	}

	var visibleTypeLis = jQuery('#zgx_list_type .zgx_list_type_li')
										.not( ".zgx_hidden" );

	if(isShow && visibleTypeLis.length == 1){

		ZGX.onListChange(typeLi.children("a")[0], 'type');

	}else if(jQuery('#zgx_list_type').attr("rel") == type){

		if(isShow){

			jQuery(".zgx_list_time_li").removeClass('zgx_hidden').show();

		}else if(visibleTypeLis.length){

			ZGX.onListChange(visibleTypeLis.first().
							children("a")[0], 'type');
		}else{
			jQuery(".zgx_list_time_li").addClass('zgx_hidden').hide();
		}



	}

}

ZGX.show_hide_list_opts = function (time, type, isShow){


	var timeLi = jQuery('#zgx_list_time .zgx_list_time_li a[rel="'+
										time+'"]').parent();

	var typeLi = jQuery('#zgx_list_type .zgx_list_type_li a[rel="'+
										type+'"]').parent();			

	// если время присутствует в текущем открытом списке времен
	if(jQuery('#zgx_list_type').attr("rel")==type){

		if(!isShow){

			timeLi.hide();
			timeLi.addClass('zgx_hidden');

		}else{

			timeLi.show();
			timeLi.removeClass('zgx_hidden');
		}
	}

	var visibleLis = jQuery('#zgx_list_time .zgx_list_time_li')
									.not( ".zgx_hidden" );

	var checkedChboxes = jQuery("#zgx_settings_group_"+type+
		" .zgx_settings_check_item .btn.active");

	// если элемент отключается
	if(!isShow){

		// если не остались другие элементы в списке времен
		if(!checkedChboxes.length){

			typeLi.hide();
			typeLi.addClass('zgx_hidden');	

			// если тип отключаемого элемента выбран текущим 
			// в списке типов
			if(jQuery('#zgx_list_type').attr("rel") == type){

				var visibleTypeLis = 
					jQuery('#zgx_list_type .zgx_list_type_li')
									.not( ".zgx_hidden" );

				if(visibleTypeLis.length){

					ZGX.onListChange(visibleTypeLis.first().
							children("a")[0], 'type');

				}

			}			
			
		
		}else if(jQuery('#zgx_list_time').attr("rel") == time){

			// если отключаемый элемент выбран текущим в списке времен
			ZGX.onListChange(visibleLis.first().children("a")[0], 'time');

		}
		
	}else{

		typeLi.show();

		var visibleTypeLis = jQuery('#zgx_list_type .zgx_list_type_li')
									.not( ".zgx_hidden" );

		if(visibleTypeLis.length == 1){

			ZGX.onListChange(visibleTypeLis.first().
							children("a")[0], 'type');	
		}

	}

}


ZGX.settings_checkbox_check = function(self, checked){

	if(checked){
		self.addClass("active");

		self.children(".glyphicon")
			.removeClass("glyphicon-unchecked").addClass("glyphicon-check");

	}else{

		self.removeClass("active");

		self.children(".glyphicon")
			.removeClass("glyphicon-check").addClass("glyphicon-unchecked");		
	}
}

ZGX.onListChange = function (self, kind, prevent_display){

	if(jQuery(self).hasClass('disabled')) return;

	var title = (kind != "voice")? self.innerHTML : self.getAttribute("rel");

	jQuery("#zgx_list_"+kind+"_title").text(title);

	jQuery("#zgx_list_"+kind).attr("rel", self.getAttribute("rel"));

	if(kind == "type"){
		jQuery(".zgx_list_time_li").remove();
		ZGX.generateTimeList(self.getAttribute("rel"));
	}

	if(!prevent_display){

		ZGX.CURFORM = new ZGX.Times(ZGX.CURRENT, ZGX.getValue("time"), 
			ZGX.getValue("voice"), ZGX.getValue("person"));
		ZGX.CURFORM.go();

		ZGX.showWord();
	}
}


ZGX.setCheckEvents = function (){

	jQuery( "#zgx_list_type label" ).on( "click", function() {
	  var checked = jQuery(this).children("input")[0].checked;
	  if(checked){
	  	var time_input = jQuery( "#zgx_list_time label input" );
	  	if(time_input[0].checked){
	  		time_input.trigger('click');
	  	}
	  }
	});

	jQuery( "#zgx_list_time label" ).on( "click", function() {
	  var checked = jQuery(this).children("input")[0].checked;
	  if(!checked){
	  	var type_input = jQuery( "#zgx_list_type label input" );
	  	if(!type_input[0].checked){
	  		type_input.trigger('click');
	  	}
	  }
	});
}


ZGX.checkPercent = function(txt, result){

	var percent = 0;


	if(!txt){

	}else if(txt==result){

		percent = 100;

	}else{

		var txtarr = txt.split("");
		var resarr = result.split("");

		var cor_count = 0;

		var x = decodeEntities("&#x" + ZGX.symbols['x']);

		for(var i = 0; i < txtarr.length; i++){

			if(txtarr[i] == resarr[i]){

				if(!ZGX.HK && i>0 && txtarr[i]==x && txtarr[i-1] != resarr[i-1]){

				}else{
					cor_count++;
				}

			} 
		}

		if(!ZGX.HK && txtarr[txtarr.length-1]==x) cor_count -= 0.5;

		percent = Math.round(cor_count/resarr.length*100);

	}

	jQuery("#zgx_progress .progress-bar").css("width", percent+"%");
}


ZGX.doTest = function(){

	/*********************************/
	for(var vnum in ZGX.VERBS){

		var pds = (ZGX.VERBS[vnum][2]== "U")? 
				["P", "A"] : [ZGX.VERBS[vnum][2]];

		for(var j in pds){

			var pd = pds[j];

			var str = "";
			for (var i =0; i<9; i++){

				var zx = new ZGX.Times(ZGX.VERBS[vnum], "perf", pd, i);
				zx.go();
				if(!i){
					if(j==0){
						jQuery("#ztest").append("<hr />");
					}
					jQuery("#ztest").append("<div><b>"+zx.verb+" ("+pd+", "+
						zx.group+")</b></div>");
				}
				if(i%3==0) str+="<tr>";
				str+="<td>"+zx.result+"</td>"
				if((i+1)%3==0) str+="</tr>";

			}

			//var str = zx.verb + " -- "+ zx.result;
			jQuery("#ztest").append("<div><table style='width:100%'>"+
				str+"</table></div><br />");

		}
		

	}

	/*********************************/
}


ZGX.htmlGen = function(){

var html = "\
<!-- SHABDATRA - BEGIN -->\
<div class='well' id='zgx_sanskrit_verbs'>\
\
    <div class='zgx_heading'>\
\
        <div class='row zgx_heading_menu'>\
            <div class='col-xs-6 col-md-4'>\
                <span class='zgx_brand'>\
                    <span class='glyphicon glyphicon-fire'></span> \
                    <span class='chandas'>शब&#2381;दत&#2381;र</span>\
                </span>\
            </div>\
\
            <div class='col-xs-6 col-md-8 text-right' id='zgx_heading_menuraw'>\
                <span class='badge'>\
                    <span class='zgx_heading_menuitem' onclick='jQuery(&apos;#zgx_heading_settings&apos;).toggle(400);'>\
\
                        <span class='glyphicon glyphicon-cog' data-toggle='tooltip' title='Настройки'/> \
                    </span>\
                    <span class='zgx_heading_menuitem'  data-placement='bottom' id='zgx_heading_menuitem_help' title='Справка'>\
                        <span class='glyphicon glyphicon-info-sign' data-toggle='tooltip' title='О программе'/> \
                    </span>\
                    <span class='zgx_heading_menuitem' data-container='body' id='zgx_devanagari_to_hk'>\
                        <span class=' glyphicon glyphicon-transfer' data-toggle='tooltip' title='Переключение с devanagari на Harvard-Kyoto'/> \
                    </span>\
                </span>\
            </div>\
        </div>\
        <div class='list-group' id='zgx_heading_settings'>\
            <span class='list-group-item active'>\
                <h4 class='list-group-item-heading'>Настройки групп времен</h4>\
                <p class='list-group-item-text'>Отметьте галочками те времена, которые должны отображаться в списке времен</p>\
            </span>\
        </div>\
    </div>\
    <div class='row text-center' id='zgx_lists'>\
  <div class='row text-center' id='zgx_lists'>\
        <!-- Основа, от которой образовано время -->\
        <div class='btn-group' data-toggle='buttons' id='zgx_list_type'>\
\
          <label class='btn btn-success'>\
            <input autocomplete='off' type='checkbox'/> <span class='glyphicon glyphicon-lock'/>\
          </label>                                    \
\
            <button class='btn btn-success dropdown-toggle' data-toggle='dropdown' type='button'>\
                <span id='zgx_list_type_title'/>\
                <span class='caret'/>\
            </button>\
            <ul aria-labelledby='dropdownMenu' class='dropdown-menu' id='zgx_list_type_menu' role='menu'>\
                <li class='dropdown-header'>Основа, от которой образована данная глагольная форма</li>\
            </ul>\
        </div>\
\
        <!-- Время -->\
        <div class='btn-group' data-toggle='buttons' id='zgx_list_time'>\
\
          <label class='btn btn-warning'>\
            <input autocomplete='off' type='checkbox'/> <span class='glyphicon glyphicon-lock'/>\
          </label>                                    \
\
            <button class='btn btn-warning dropdown-toggle' data-toggle='dropdown' type='button'>\
                <span id='zgx_list_time_title'/>\
                <span class='caret'/>\
            </button>\
            <ul aria-labelledby='dropdownMenu' class='dropdown-menu' id='zgx_list_time_menu' role='menu'>\
                <li class='dropdown-header'>Время/наклонение глагола</li>\
            </ul>\
        </div>\
\
        <!-- Лицо -->\
        <div class='btn-group' data-toggle='buttons' id='zgx_list_person'>\
\
          <label class='btn btn-success'>\
            <input autocomplete='off' type='checkbox'/> <span class='glyphicon glyphicon-lock'/>\
          </label>                                    \
\
            <button class='btn btn-success dropdown-toggle' data-toggle='dropdown' type='button'>\
                <span id='zgx_list_person_title'/>\
                <span class='caret'/>\
            </button>\
            <ul aria-labelledby='dropdownMenu' class='dropdown-menu' id='zgx_list_person_menu' role='menu'>\
                <li class='dropdown-header'>Лицо</li>\
            </ul>\
        </div>\
\
        <!-- Залог -->\
        <div class='btn-group' data-toggle='buttons' id='zgx_list_voice'>\
\
          <label class='btn btn-warning'>\
            <input autocomplete='off' type='checkbox'/> <span class='glyphicon glyphicon-lock'/>\
          </label>                                    \
\
            <button class='btn btn-warning dropdown-toggle' data-toggle='dropdown' type='button'>\
                <span id='zgx_list_voice_title'/>\
                <span class='caret'/>\
            </button>\
            <ul aria-labelledby='dropdownMenu' class='dropdown-menu' id='zgx_list_voice_menu' role='menu'>\
                <li class='dropdown-header'>Залог</li>\
            </ul>\
        </div>\
\
\
    </div>\
\
    <div class='row text-center chandas' id='zgx_verb'>\
    </div>  \
\
\
    <div class='input-group' id='zgx_answer_group'>\
        <span class='input-group-btn'>\
            <button class='btn btn-warning' id='zgx_keyboard_button' onclick='jQuery(&apos;#zgx_keyboard&apos;).toggle(400);' type='button'>\
                <span class='glyphicon glyphicon-th' data-toggle='tooltip' title='Клавиатура'/> \
            </button>              \
        </span>\
        <input class='form-control' id='zgx_answer' placeholder='Введите ответ (Devanagari / Harvard-Kyoto)' type='text'/>\
        <span class='input-group-btn'>\
            <button class='btn btn-success' id='zgx_next' type='button'>\
            Дальше <span class='glyphicon glyphicon-circle-arrow-right'/> \
            </button>              \
        </span>\
\
    </div>\
    <div class='row text-center' id='zgx_settings'>\
        <div class='btn-group' data-toggle='buttons'>\
            <label class='btn btn-warning' id='zgx_show_hide_translate'>\
                <span class='glyphicon glyphicon-flag'/> Перевод слова\
            </label>\
\
            <button class='btn btn-success' data-container='body' data-content='' data-placement='bottom' data-toggle='popover' id='zgx_correct_answer' title='Правильный ответ' type='button'>Ответ\
            <span class='glyphicon glyphicon-question-sign'/> \
              \
            </button>\
            <button class='btn btn-warning' data-toggle='tooltip' id='zgx_show_all_forms' onclick='jQuery(&apos;#zgx_allforms&apos;).toggle(400);' title='Показать все формы данного глагола' type='button'>Все формы\
            <span class='glyphicon glyphicon-eye-open'/> \
              \
            </button>                                    \
\
        </div>\
    </div>\
    <div class='row text-center' id='zgx_ru_answer'>\
\
           <span class='label label-warning' id='zgx_translation'/>\
        \
    </div>\
\
    <div id='zgx_allforms'>\
\
    </div>\
    <div class='list-group' id='zgx_keyboard'>\
        <span class='list-group-item active'>\
            <h4 class='list-group-item-heading'>Электронная клавиатура</h4>\
        </span>\
    </div>\
\
\
    <div class='progress' data-toggle='tooltip' id='zgx_progress' title='Процент правильности ответа'>\
        <div class='progress-bar progress-bar-success' style='width: 0%'/>\
    </div>\
\
\
    <div id='zgx_help_wrapper'>\
        <div id='zgx_help_popover_inner'>\
            <div class='zgx_hopt'>\
                <span class='zgx_li_marker glyphicon glyphicon-star-empty'>\
                </span>\
                Необходимо образовать правильную форму глагола из условий в верхних выпадающих списках и предложенной основы. Полученную форму введите в поле вода в <b>devanagari</b> / <b>Harvard-Kyoto</b> или при помощи электронной клавиатуры ( <b><span class='glyphicon glyphicon-th'/></b> )\
            </div>\
            <div class='zgx_hopt'>\
                <span class='zgx_li_marker glyphicon glyphicon-star-empty'>\
                </span>                                     \
                Как только вы правильно введете глагольную форму, поле ввода подсветится зеленым цветом.\
                Затем нажмите кнопку <b>Дальше</b> или клавишу <b>Enter</b>\
            </div>\
            <div class='zgx_hopt'>\
                <span class='zgx_li_marker glyphicon glyphicon-star-empty'>\
                </span>                                     \
                Чтобы сформировать список времен, откройте настройки ( <b><span class='glyphicon glyphicon-cog'/></b> )\
            </div>                                    \
            <div class='zgx_hopt'>\
                <span class='zgx_li_marker glyphicon glyphicon-star-empty'>\
                </span>\
                По всем вопросам, предложениям и замечаниям по работе программы пишите на мой электронный адрес:\
                <div id='zgx_help_mail'>\
                     leo.iris <span class='glyphicon glyphicon-envelope'/> yandex.ru\
                </div>\
            </div>                                           \
        </div>\
    </div>\
    <div id=\"zgx_popover_div\"></div>\
</div>\
<!-- SHABDATRA - FIN -->";
	
jQuery('#zgx_shabdatra').html(html);

	    jQuery('#zgx_shabdatra [data-toggle="popover"]').popover(); 
	    jQuery('#zgx_shabdatra [data-toggle="tooltip"]').tooltip(); 

}
