var Playlist = function(list) {
	this.list = list;
	this.init();
};
Playlist.prototype = {
	init: function() {
		this.setKey = null;
	},
	/*
	 * checks the time against the list keys, and automatically repeats on the
	 * next key time.
	 *
	 * expects keys like "1500" to mean 15:00 or 3:00pm
	 */
	checkTime: function() {
		var $this = this;
		var now = new Date();
		var hour = now.getHours().toString() + now.getMinutes().toString();
		var keys = this.getNearestSetKeys(hour);
		if (keys.length && keys[0] !== this.setKey) {
			this.setKey = keys[0];
			this.markupSet();
		}
		if (keys.length > 1) {
			var nextHour = keys[1].substr(0,2) + ':' + keys[1].substr(2,2) + ':00';
			var nextTime = (new Date(now.toString().replace(/\d\d:\d\d:\d\d/, nextHour))).getTime();
			var wait = nextTime - now.getTime();
			this.timeout = setTimeout(function() {
				$this.checkTime();
			}, wait);
		}
	},
	/*
	 * Returns an array of the last set key before or exactly on the given
	 * time, and the set key which follows.
	 *
	 * (ignores empty sets)
	 */
	getNearestSetKeys: function(hour) {
		var keys = [];
		for (var time in this.list) {
			if (!this.list[time].length) continue;
			if (time <= hour) {
				keys[0] = time;
			} else {
				keys[1] = time;
				break;
			}
		}
		return keys;
	},
	markupSet: function() {
		var markup = '', i, set = this.list[this.setKey];

		for (var i = 0; i < set.length; i++) {
			var file = set[i];
			var id = this.setKey + '-' + i;
			markup += '<label for="' + id + '">' + file + '</label>'
			+ '<audio id="' + id + '" controls>'
			+ '	<source src="audio/' + this.setKey + '/' + file + '" />'
			+ '</audio>';
		}
		var list = document.getElementById('list');
		list.innerHTML = markup;
		var players = list.getElementsByTagName('audio');
		for (i = 0; i < players.length; i++) {
			(function(i) {
				players[i].addEventListener('play', function() {
					for (var j = 0; j < players.length; j++) {
						if (i != j) players[j].pause();
					}
				});
				players[i].addEventListener('ended', function() {
					var index = this.id.replace(/\d{4}-(\d+)/, '$1');
					index = (index + 1) % players.length;
					players[index].play();
				});
			})(i);
		}
		this.startSet();
	},
	startSet: function() {
		document.getElementById(this.setKey + '-0').play();
	}
};
