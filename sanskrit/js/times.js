/*
* Sanskrit v1.0
* Автор: Мара Черкасова
* Email: mara.scorpio@yandex.ru
*/

ZGX.TM = [];

ZGX.Times = function(verb_obj, time, pada, form){

	if (verb_obj[2] != pada &&  verb_obj[2] != "U"){
		console.log("Impossible pada: "+pada+" for verb "+verb_obj.join(","));
	} 

	for(var timeType in ZGX.timeTypes){

		if(ZGX.timeTypes[timeType]["times"].hasOwnProperty(time)){

			ZGX.TM[timeType].call(this, verb_obj, time, pada, form);
			break;
		}
	}
};

ZGX.TimeParent = function(verb_obj, time, pada, form) {

	// время - ind, imp, opt, mpr
	this.time = time;

	// форма глагола (цифрой от 0 до 8 обозначается лицо и число)
	this.form = form;

	// конечная форма
	this.result = "";	

	if (typeof verb_obj[0] === 'string' || verb_obj[0] instanceof String){

		// основа глагола
		this.verb = verb_obj[0];

		// о.н.в. - инфинитив
		this.inf = "";
	}else{
		this.verb = verb_obj[0][0];
		this.inf = verb_obj[0][1];

		// если определена какая-то из форм
		if(verb_obj[0].length > 1){

			var all_forms = verb_obj[0][2];

			if(all_forms && all_forms[pada] && all_forms[pada][time]){

				if(typeof all_forms[pada][time] === 'string'){

					this.result = all_forms[pada][time];

				}else if(all_forms[pada][time].length > form){

					this.result = all_forms[pada][time][form];
				}
			}
			
		}
	}
	
	// группа глагола
	this.group = verb_obj[1];

	// залог - P, A, U
	this.pada = pada;

	// перевод на русский
	this.translation =  verb_obj[3];

	// сильная или слабая форма
	this.strong = false;

	if(ZGX.strong.hasOwnProperty(this.time) && 

		ZGX.strong[this.time].hasOwnProperty(this.pada) && 

		ZGX.in(this.form, ZGX.strong[this.time][this.pada])
		){

		this.strong = true;
	}

	this.verb_obj = verb_obj;

};

ZGX.TM['present'] = function(verb_obj, time, pada, form) {
	ZGX.TimeParent.call(this, verb_obj, time, pada, form);

	this.go = function() {
		if (!this.result){

			if (!this.inf) this.makeInf();
			this.makeResult();
			this.postSandhi();

		}
	};

	this.postSandhi = function() {
		this.result = ZGX.postSandhi(this.result);
	};

	this.makeResult = function() {

		var term = ZGX.TERMS["thema"][this.time][this.pada][this.form];		
		this.result = this.inf + term;

		if (this.time == "imp"){

			this.makeImperfect();
		}
	};

	this.makeImperfect = function() {

		var fl = ZGX.getLetter(this.result, 0);

		if(fl.type != "vocal"){

			this.result = "a"+this.result;
			return;
		}

		// Если первая гласная - применяем операцию вриддхи

		var vocal = ZGX.makeGuna(fl.letter);

		if(!vocal) return;

		var vrvocal = ZGX.makeGuna(vocal);
		if(vrvocal) vocal = vrvocal;

		this.result = vocal+this.result.substring(fl.letter.length);

	};

	this.makeInf = function() {

		var vlen = this.verb.length;

		//console.log(this);

		this.inf = this.verb;

		switch(this.group){

			case 1:
			case 10:

				/*
				* Корни глаголов с гласными i, u, R и L и оканчивающиеся 
				* на одну согласную, имеют в основе настоящего времени гласную 
				* корня в ступени guNa, т. е. i → е, u → о, R → ar, L→ al.
				*
				* budh -> bodha
				*/
				var lastLetter = ZGX.getLetter(this.verb, -1);

				if(lastLetter.type == "consonant"){

					var pLetPos = this.verb.length - (lastLetter.get().length+1);

					var pLetter = ZGX.getLetter(this.verb, pLetPos);
						
					if(pLetter.type == "vocal" && 
						ZGX.in(pLetter.get(), ["i", "u", "R", "L"])){

						gunaLet = ZGX.makeGuna(pLetter.get());

						this.inf = ZGX.replaceAt(this.verb, pLetPos, gunaLet);

					}
				}

				if(this.group == 1){

					/*
					* Корни глаголов, оканчивающиеся на i/I или u/U, имеют в основе 
					* настоящего времени эти
					* гласные в ступени guNa (т.е. -e, -o). Перед тематической гласной 
					* -a гласные guNa изменяются по
					* правилам sandhi: е → ay, о → av.
					*/
					if(lastLetter.type == "vocal" && 
							ZGX.in(lastLetter.get(), ["i", "I", "u", "U"])){

						gunaLet = ZGX.makeGuna(lastLetter.get());
						gunaLet = ZGX.makeSandhiLetters(gunaLet, "a"); 

						this.inf = this.verb.substring(0, this.verb.length - 1) + gunaLet;
					}

				}

				if(this.group == 10){
					this.inf += "ay";
				}


			break;

			case 4:

				// Корни на -am удлиняют a перед ya
				if(ZGX.endsWith(this.inf, "am")){
					this.inf = this.inf.substr(0, this.inf.length -2 ) + "Am";
				}

				this.inf += "y";
 
		}

	};
	
};

ZGX.TM['perfect'] = function(verb_obj, time, pada, form) {
	ZGX.TimeParent.call(this, verb_obj, time, pada, form);

	this.go = function() {
		if (!this.result){

			this.result = this.doReduplication(this);

		}
		this.addTermination();
	};

	this.doReduplication = function(self) {

		var verb = self.verb;

		var alLetters = ZGX.getAllLetters(verb);
		var lastLetter = alLetters[alLetters.length-1];
		var praLastLetter = alLetters[alLetters.length-2];

		var fl = alLetters[0];

		var aui = {"a" : "A", "u" : "U", "i" : "I"};

		var gk_jc = {"g" : "j", "k" : "c", "h" : "j"};

		if(fl.type == "vocal"){

			if(!aui.hasOwnProperty(fl.letter)) return verb;

			

			if(self.strong && ZGX.in(fl.letter, ['u', 'i'])){
				// если сильная форма

				/*
				 *	Начальные, допускающие подъем гласные, 
				 *	в сильных формах изменяются в guṇa, напр. 
				 *	- iṣ сильная ф. iyeṣ, слабая ф. īṣ; 
				 *	- ukh сильная ф. uvokh, слабая ф. ūkh(1 в).
				 */
				 var pref = (fl.letter == "i")? "iye" : "uvo";


				return pref+verb.substring(1);

			}else{
				// если слабая форма

				return aui[fl.letter]+verb.substring(1);
			}

		}

		if((verb.indexOf('va') == 0 || verb.indexOf('ya') == 0) &&
			alLetters.length == 3 && lastLetter.type == "consonant" &&
			praLastLetter.letter == "a"){

			var rs = "";
			if(verb.indexOf('va') == 0){

				rs = (self.strong)? "u"+verb : "U" + verb.substring(2);

			}else{

				if(verb != "yam"){
					rs = (self.strong)? "i"+verb : "I" + verb.substring(2);

				}else{

					// TODO: расписать правило для общего случая,
					// не только для yam (ослабление гласных)!

					return (self.strong && self.form!=3)? "yayAm" : "yem";
				}
			}

			// Краткий внутренний a, за которым следует согласный, 
			// в 3 л. sing. par. удлинняется всегда, 
			// а в 1 л. sing. par. — по желанию;
			if(ZGX.in(self.form, [0, 6])){
				rs = rs.replace("a", "A");
			}
			return rs;
			//return (verb.indexOf('va') == 0) ? "u"+verb : "i"+verb;
		}

		var slog = [];
		for(var l in alLetters){

			lt = alLetters[l];

			// Корни, в которых за начальной согласной следует -r-, 
			// в удвоении -r- утрачивают:
			if (l==1 && (lt.letter=="r" ||  lt.letter=="l")) continue;


			// убираем придыхательные
			if(lt.type == "consonant" && lt.letter.indexOf("h") == 1){
				var newlt = ZGX.getLetter(lt.letter.substring(0,1), 0);

				if(newlt.type=="consonant") lt = newlt;
			}

			// Начальные согласные I ряда (варги) при удвоении изменяются 
			// в соответствующие согласные II ряда (варги); h изменяется в j
			if(l==0 && gk_jc.hasOwnProperty(lt.letter)){
				lt = ZGX.getLetter(gk_jc[lt.letter], 0);
				
				slog.push(lt);
				continue;
			}

			// Корни, начинающиеся с s + шумной глухой, при удвоении утрачивают -s
			if(l==0 && lt.letter=="s" && alLetters.length > 1 
				&& ZGX.in(alLetters[1].letter, ["t", "th"])){
				continue;
			}


			if(lt.type == "vocal"){
				if(aui.hasOwnProperty(lt.letter.toLowerCase())){
					lt = ZGX.getLetter(lt.letter.toLowerCase(), 0);
				}
			}


			slog.push(lt);
			

			if(lt.type == "vocal") break;
			
		}

		if(self.strong){

			/*
			 *	Внутренние, допускающие подъем гласные, 
			 *	в сильных формах изменяются в guṇa, напр. 
			 *	- bhid, сильная форма bibhed, слабая форма bibhid; 
			 *	- tud, сильная ф. tutod, слабая ф. tutud; 
			 */

			if(lastLetter.type == "consonant" && alLetters.length > 1){

				var pLetPos = (verb.length - lastLetter.letter.length -
					praLastLetter.letter.length);
					
				if(praLastLetter.type == "vocal" && 
					ZGX.in(praLastLetter.get(), ["i", "u", "R", "L"])){

					gunaLet = ZGX.makeGuna(praLastLetter.get());

					verb = ZGX.replaceAt(verb, pLetPos, gunaLet);

				}		

				// Краткий внутренний a, за которым следует согласный, 
				// в 3 л. sing. par. удлинняется всегда, 
				// а в 1 л. sing. par. — по желанию;
				if(praLastLetter.letter == "a" && ZGX.in(self.form, [0, 6])){
					verb = ZGX.replaceAt(verb, pLetPos, "A");
				}

			}
		}


		/*
			Специфические случаи - BEGIN
		*/
		if(verb == "ji"){
			verb = "gi";
		}

		/*
			Специфические случаи - FIN
		*/			

		var lastSlog = slog[slog.length-1];

		if (lastSlog.type=="consonant"){

			slog.push(ZGX.getLetter("a", 0));

		}



		if (lastLetter.type=="vocal"){

			/*
			* Конечные допускающие подъем гласные 
			* в 3 л. sing. par. всегда изменяются в vṛddhi, 
			* в 1 л. sing. par. — в vṛddhi или guṇa, 
			* а во 2 л. — в guṇa, 
			* напр. nī, ninai, nine.
			*/
			if(self.strong){

				var trm = ZGX.makeGuna(lastLetter.letter);

				var lLetPos = (verb.length - lastLetter.letter.length);

				if(trm){

					if(ZGX.in(self.form, [0, 6])){
						var trm = ZGX.makeGuna(trm);
						if(trm.length==2 && trm.indexOf("a")==0){
							trm = trm.replace('a', "A");
						}
					}

					verb = ZGX.replaceAt(verb, lLetPos, trm);
				}
				
			}

			var verbl = verb.substring(verb.length-1);
			if(ZGX.in(verbl.toLowerCase(), ['i', 'u'])){

				var lst = (verbl.toLowerCase()=="i") ? "y" : "v";

				/* TODO: Выписать - Какие здесь сутры? Почему для plu это так? */
				if(lst == "v" && alLetters.length>2 && 
					praLastLetter.type=="consonant" && 
					alLetters[alLetters.length-3].type=="consonant"){

					lst = (ZGX.in(self.form, [0, 4, 6, 7, 8]))? "uv" : "u";
				}

				verb = verb.substring(0, verb.length-1) + lst;
			}


		}else if(lastLetter.type=="consonant"){

			/*
				Некоторые корни ослабляют основу в слабых формах

				Корни с внутренним a, оканчивающиеся на согласный и начинающиеся 
				с небного, язычного, зубного или губного беcпридыхательного, 
				y, r, l, v, ś или s  (т. е. с простых согласных, при удвоении 
				не замещаемых другим согласным) опускают слог удвоения в слабых 
				формах

				TODO: найти соотвествующие сутры 
			*/
			if(!self.strong){

				if(self.verb == "gam"){
					verb = "gm";
				}

			}

		}


		var ss = "";
		for(var i in slog){
			ss+= slog[i].letter;
		}

		return ss+verb;

	};

	this.addTermination = function() {

		var term = ZGX.TERMS["thema"][this.time][this.pada][this.form];	

		var alLetters = ZGX.getAllLetters(this.result);
		var rfl = alLetters[alLetters.length-1];

		var term_first_let = ZGX.getLetter(term, 0);
		var res_last_let = ZGX.getLetter(this.result, -1);


		/*
			Корни на ā, e, ai и au в 1 л. и Зл. sing. Par. оканчиваются на au 
			и теряют гласный перед вокальными окончаниями. 
		*/

		if( ZGX.in (rfl.letter, ['A', 'e', 'ai', 'au'])  ){

			if(ZGX.in(this.form, [0, 6])){
				term = "au";
				var term_first_let = ZGX.getLetter(term, 0);
			} 

			var termLets = ZGX.getAllLetters(term);

			this.result= this.result.substring(0, 
					this.result.length - rfl.letter.length);

			var res_last_let = ZGX.getLetter(this.result, -1);
		}


		var addi = false;
		if(term_first_let.type == "consonant" && 

			res_last_let.type == "consonant" ){
			this.result+="i";
			addi = true;
		}

		if(term_first_let.letter == "s" && (
			addi || (res_last_let.type=="vocal" && 
			res_last_let.letter.toLowerCase() != "a" ))){

			term = "S"+term.substring(1);
		}


		this.result = this.result +  term;
	};
};

