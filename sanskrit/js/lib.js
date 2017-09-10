/*
* Sanskrit v1.0
* Автор: Мара Черкасова
* Email: mara.scorpio@yandex.ru
*/

// global namespace
var ZGX = ZGX || {};


ZGX.timeTypes = {
	"present": {
		"ru" : "Основа наст. врем.", 
		"times" : {"ind" : "Индикатив", 
					"imp" : "Имперфект", 
					"opt" : "Оптатив", 
					"mpr" : "Императив"}
	},
	"perfect": {
		"ru" : "Основа перфекта", 
		"times" : {"perf" : "Простой перфект"}
	},
};

ZGX.persons = { 0: "Я", 		 3: "Ты",  			6:  "Он", 
			    1: "Мы (двое)",  4: "Вы (двое)", 	7:  "Они (двое)",
			    2: "Мы (много)", 5: "Вы (много)", 	8:  "Они (много)"};

ZGX.voices = {"P" : "Parasmaipada", "A": "Atmanepada"};

ZGX.SANDHI = [
	[["a", "A"], ["i", "I"], "e"],
	[["a", "A"], ["u", "U"], "o"],	
	[["a", "A"], "e", "ai"],
	[["a", "A"], "o", "au"],
	[["a", "A"], "R", ["ar", "Ar"]],
	[["a", "A"], "L", ["al", "Al"]],
	["e", "a", "ay"],
	["o", "a", "av"]		
];

ZGX.consonants = [
	{"k": "0915", "kh": "0916", "g": "0917", "gh": "0918", "G": "0919"},
	{"c": "091A", "ch": "091B", "j": "091C", "jh": "091D", "J": "091E"},
	{"T": "091F", "Th": "0920", "D": "0921", "Dh": "0922", "N": "0923"},
	{"t": "0924", "th": "0925", "d": "0926", "dh": "0927", "n": "0928"},
	{"p": "092A", "ph": "092B", "b": "092C", "bh": "092D", "m": "092E"},
	{"y": "092F", "r" : "0930", "l": "0932", "v" : "0935"},
	{"z": "0936", "S" : "0937", "s": "0938", "h" : "0939"}
];

ZGX.vocals = {
	"a" : ["0905", ""    ], "A"  : ["0906", "093E"], 
	"i" : ["0907", "093F"], "I"  : ["0908", "0940"], 
	"u" : ["0909", "0941"], "U"  : ["090A", "0942"], 
	"e" : ["090F", "0947"], "ai" : ["0910", "0948"], 
	"o" : ["0913", "094B"], "au" : ["0914", "094C"], 
	"R" : ["090B", "0943"], "L"  : ["090C", "0962"]
};

ZGX.symbols = {
	"x" : "094D",
	"H" 	 : "0903",
	"M" 	 : "0902"
}

ZGX.strong = {
	"perf" : {
		"P" : [0,3,6]
	}
}


ZGX.Letter = function(letter, ltype, devanagari) {
	this.letter = letter;

	// "vocal", "consonant", ""
	this.type= (ltype)? ltype : "";

	this.devanagari = (devanagari)? devanagari : "";

	this.get = function(){
		return this.letter;
	}
}


ZGX.isVocal = function(letter){
 return (letter in ZGX.vocals);
}

var last_cns_nagari = "";

ZGX.isConsonant = function(letter){
	for (var k = 0; k < ZGX.consonants.length; k++){
		if(letter in ZGX.consonants[k]){

			last_cns_nagari = ZGX.consonants[k][letter];
			return true;
		}
	}
	return false;
}

ZGX.getLetter = function(str, pos){

	if (pos < 0) pos = str.length+pos;

	var letter = str.charAt(pos);
	var letter_after = (pos < str.length -1)? str.charAt(pos+1) : "";
	var letter_before = (pos > 0)? str.charAt(pos-1) : "";


	if(letter =="h" && ZGX.isConsonant(letter_before+"h")){

		return new ZGX.Letter(letter_before+"h", "consonant", last_cns_nagari);
		
	}else if( ZGX.isVocal(letter) ){

		// проверка на ai и au
		if( ZGX.isVocal(letter+letter_after)) letter += letter_after;

		return new ZGX.Letter(letter, "vocal", ZGX.vocals[letter]);

	}else if( ZGX.isConsonant(letter) ){

		// проверка, чтобы не разделить букву с предыханием
		if(letter_after == "h" && ZGX.isConsonant(letter+"h")) letter+="h";

		return new ZGX.Letter(letter, "consonant", last_cns_nagari);
	
	}else{

		if(letter in ZGX.symbols){
			return new ZGX.Letter(letter, "symbol", ZGX.symbols[letter]);
		}

		return new ZGX.Letter(letter);
	}
}

ZGX.endsWith = function(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

ZGX.in = function (elem, array){
	for (var k in array){
		if (array[k] == elem) return true;
	}
	return false;
}

ZGX.replaceAt=function(str, index, character) {
    return str.substr(0, index) + character + str.substr(index+character.length);
}

ZGX.makeGuna = function(vocal){
	for (var k in ZGX.SANDHI){

		if(ZGX.SANDHI[k][0].toString() != "a,A") return;

		if(typeof ZGX.SANDHI[k][1] == "string"){

			if(ZGX.SANDHI[k][1] == vocal) return ZGX.SANDHI[k][2];

		}else if( ZGX.in(vocal, ZGX.SANDHI[k][1]) ){

			return ZGX.SANDHI[k][2];

		}
	}

	return null;

}

ZGX.makeSandhiLetters = function(begin_letter, fin_letter){

	for (var k in ZGX.SANDHI){


		if( (typeof ZGX.SANDHI[k][0] == "string" && ZGX.SANDHI[k][0] == begin_letter)
			|| 
			(typeof ZGX.SANDHI[k][0] != "string" && ZGX.in(begin_letter, ZGX.SANDHI[k][0]) 
		) ){

			if(typeof ZGX.SANDHI[k][1] == "string"){

				if(ZGX.SANDHI[k][1] == fin_letter){

					return ZGX.SANDHI[k][2];

				}else continue;

			}else if( ZGX.in(fin_letter, ZGX.SANDHI[k][1]) ){

				return ZGX.SANDHI[k][2];

			}else continue;

		}else continue;

	}

	return begin_letter + fin_letter;

}

/*ZGX.makeSandhi = function(begin, fin){
	console.log(ZGX.SANDHI[0][0].toString());
	console.log(begin + "---" + fin);
	console.log("First letter: "+ZGX.getLetter(begin, 1).letter);
	console.log("Last letter: "+ZGX.getLetter(fin, -1).letter);
	return begin;
}*/

ZGX.postSandhi = function(word){


	/* Сутра 111
	*
	* После r, s, R-двайи буква n, находящаяся в том же слове, 
	* превращается в N. Это происходит даже тогда, когда между ними вставляются:
	* - любая гласная
	* - h, y, v
	* - ка-варга (k, kh, g, gh, G)
	* - па-варга (p, ph, b, bh, m)
	* Но n в конце слова не становится N
	*/

	
	if(word.indexOf("n") > 0 &&  word.indexOf("n") != word.length-1){
		var pos_n = word.indexOf("n");
		var wordn = word.substring(0, pos_n);

		if( wordn.indexOf("r")!= -1 || wordn.indexOf("s")!= -1 || 
			wordn.indexOf("R")!= -1){

			var before_n = word.substring(pos_n - 1, pos_n);
			var after_n = word.substring(pos_n + 1, pos_n + 2);

			if (ZGX.isVocal(before_n) && ZGX.isVocal(after_n)){

				var pos_srR = (wordn.lastIndexOf("r") > wordn.lastIndexOf("s"))?
					wordn.lastIndexOf("r") : wordn.lastIndexOf("s");

				if(wordn.lastIndexOf("R") > pos_srR){
					pos_srR = wordn.lastIndexOf("R");
				} 

				var wordR = wordn.substring(pos_srR+1);
				var str_valid = true;
				while(wordR.length){
					var fletter = ZGX.getLetter(wordR, 0).letter;

					if(!fletter) break;
					if(! (fletter in ZGX.vocals) && 
						! ZGX.in(fletter, ['h', 'y', 'v']) &&
						! ZGX.in(fletter, ['k', 'kh', 'g', 'gh', 'G']) &&
						! ZGX.in(fletter, ['p', 'ph', 'b', 'bh', 'm'])
					){
						
						str_valid = false;
						break;
					}
					wordR = wordR.substring(fletter.length);
				}

				if(str_valid){
					word = ZGX.replaceAt(word, pos_n, "N");
				}

			}
		}
	}


	/******** Проверка на сандхи гласных ********/

	/*var pos = 0;
	while(true){

		var fl = ZGX.getLetter(word, pos);
		var flen = fl.letter.length;

		if(word.length - 1 < pos + flen) break;

		var sl = ZGX.getLetter(word, pos + flen);
		var slen = sl.letter.length;

		if(!slen) break;

		var afterSandhi = ZGX.makeSandhiLetters(fl.letter, sl.letter);

		word = word.substr(0, pos) + afterSandhi + 
			word.substr(pos+afterSandhi.length);

		pos += afterSandhi.length;

	}*/

	return word;
}

ZGX.toDevanagari = function(word){

	var word_tmp = word;

	var pos = 0;

	var result = "";

	var fl_before = "";

	while(word_tmp.length){
		
		var fl = ZGX.getLetter(word_tmp, 0);

		if(!fl.letter) break;

		if(fl.type == "vocal"){

			var voc = (pos==0 || fl_before.type == "vocal")? 0 : 1;

			if(fl.devanagari[voc]) result += "&#x" + fl.devanagari[voc];
		
		}else if (fl.devanagari){

			if(fl.type == "consonant" && fl_before.type == "consonant"){

				result += "&#x" + ZGX.symbols["x"];
			}

			result += "&#x" + fl.devanagari;
		}


		word_tmp = word_tmp.substring(fl.letter.length);
		pos++;
		fl_before = fl;

	}
	if(fl.type == "consonant"){
		result += "&#x" + ZGX.symbols["x"];
	}
	return result;

}

ZGX.toDevanagari2 = function(word){

	var word_tmp = word;

	var pos = 0;

	var result = "";

	var fl_before = "";

	var fl_prabefore = "";

	while(word_tmp.length){
		
		var fl = ZGX.getLetter(word_tmp, 0);

		if(!fl.letter) break;

		if(fl.type == "vocal"){

			var voc = (pos==0 || fl_before.type == "vocal")? 0 : 1;


			if(fl_before){

				if(fl_before.letter == "x"){

					result = result.substring(0, result.length-1);

				}else if( fl_before.type == "consonant" ||
						(ZGX.in(fl_before.letter, ['a', 'A'])
					) && ZGX.in(fl.letter, ['i', 'u'])){

					if(fl_before.type == "vocal"){
						result = result.substring(0, result.length-1);
					}

					fl = ZGX.getLetter("a"+fl.letter, 0);

					if(fl_before.letter == "a"){
						// a как символ может быть только в начале слова
						voc = 0;
					}else if(fl_before.type == "consonant"){
						voc = 1;
					}else{
						// A может быть как в начале слова, так и в середине
						var voc = (pos>1)? 1 : 0;

					}
					

				}

			}

			if(fl.devanagari[voc]){
				result += decodeEntities("&#x" + fl.devanagari[voc]);
			} 
		
		}else if (fl.type == "consonant"){

			var res_let = fl.devanagari;


			if(fl_prabefore && fl.letter=="h"){

				var new_cons = fl_prabefore.letter+fl.letter;
				if(fl_prabefore.type == "consonant" && ZGX.isConsonant(new_cons)){

					res_let = ZGX.getLetter(new_cons, 0).devanagari;
					result = result.substring(0, result.length-2);

				}
			}
			result += decodeEntities("&#x" + res_let);


			result += decodeEntities("&#x" + ZGX.symbols["x"]);

			fl_before = fl;
			fl = ZGX.getLetter("x", 0);

		}else if (fl.type == "symbol"){

			result += decodeEntities("&#x" + fl.devanagari);			

		}else{

			var newFl = ZGX.detectDevanagari(fl.letter);

			if(newFl && newFl.devanagari){
				result +=fl.letter;
				fl = newFl;
			}

		}


		word_tmp = word_tmp.substring(1);
		pos++;
		fl_prabefore = fl_before;
		fl_before = fl;

	}
	return result;

}

ZGX.detectDevanagari = function(letter){

	for(var crow in ZGX.consonants){
		for (var c in ZGX.consonants[crow]){
			var x = ZGX.consonants[crow][c];
			
			if(letter == decodeEntities("&#x" + x) ){

				return ZGX.getLetter(c, 0);
			}
		}
	}

	for (var v in ZGX.vocals){
		for(var vc in ZGX.vocals[v]){
			var x = ZGX.vocals[v][vc];
			if(x && letter == decodeEntities("&#x" + x)){
				return ZGX.getLetter(v, 0);
			}
		}
	}

	for (var s in ZGX.symbols){
		if(letter == decodeEntities("&#x" + ZGX.symbols[s])){
			return ZGX.getLetter(s, 0);
		}
	}
}

ZGX.getAllLetters = function(str){
	
	var pos = 0;
	var letters = [];
	while(pos < str.length){

		var l = ZGX.getLetter(str, pos);

		pos += l.letter.length;
		letters.push(l);
	}
	return letters;
}