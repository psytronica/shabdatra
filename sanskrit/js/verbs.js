/*
* Sanskrit v1.0
* Автор: Мара Черкасова
* Email: mara.scorpio@yandex.ru
*/

// global namespace
var ZGX = ZGX || {};

ZGX.VERBS = [
['vad', 1, "P", "говорить"],
['vac', 1, "P", "говорить"],
['khAd', 1, "P", "есть, питаться"],
['IkS', 1, "A", "смотреть, воспринимать"],
[['iS', 'icch'], 6, "P", "искать, желать"],
['kamp', 1, "A", "дрожать, бояться"], 
['vardh', 1, "U", "расти"],
['budh', 1, "P", "будить; бодрствовать"],
['ji', 1, "U", "побеждать", "anit"],
['plu', 1, "A", "плавать"],
['nI', 1, "U", "нести, вести"], 
[['bhU', '', 
	{"P": 
		{
		"perf": "babhUv"
		} 
	}], 1, "P", "быть"],
[['gam', 'gacch'], 1, "P", "идти"],
[['yam', 'yacch'], 1, "P", "держать"],
[['pA', 'pib'], 1, "P", "пить"],
[['sthA', 'tiSTh'], 1, "U", "стоять", "anit"],
['likh', 6, "P", "писать", "set"],
['tud', 6, "U", "ударять"],
['tuS', 4, "P", "радоваться, наслаждаться"],
['bhram', 4, "P", "бродить, ходить"],
['zram', 4, "P", "уставать"],
['div', 4, "P", "играть"],
[['darz', 'pazy'], 4, "P", "видеть", "anit"],
['kath', 10, "U", "рассказывать"],
['cint', 10, "U", "думать"],
['cur', 10, "U", "воровать"],
['pat', 1, "P", "падать", "set"],
[['as', '', 
	{"P": 
		{
		"ind": ["asmi", "svaH", "smaH", 
				"asi","sthaH","stha", 
				"asti", "staH", "santi"],
		"imp": ["Asam", "Asva", "Asma", 
				"AsIH", "Astam", "Asta", 
				"AsIt", "AstAm", "Asan"],
		"opt": ["syAm", "syAva", "syAma", 
				"syAH", "syAtam", "syAta", 
				"syAt", "syAtAm", "syuH"],
		"mpr": ["asAni", "asAva", "asAma", 
				"edhi", "stam", "sta", 
				"astu", "stAm", "santu"]
		} 
	}], 2, "P", "быть"]
];