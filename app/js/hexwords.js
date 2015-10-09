(function(){
	var hexwords = {}
		,consonants = ['b','c','d','f','g','j','k','l','m','n','p','r','s','t','w','z']
		,vowels = ['a','ah','ay','e','ee','eh','i','o','oh','oi','oo','ou','o','oy','u','uh']

	hexwords.toSyllables = function(bytes){
		console.log(bytes)
		var syllables = []
		bytes.forEach(function(byte){
			var consonantIndex = Math.floor(byte/16)
				,vowelIndex = consonantIndex%16
			syllables.push(consonants[consonantIndex]+vowels[vowelIndex])
		})
		return syllables
	}

	window.hexwords = hexwords
})();