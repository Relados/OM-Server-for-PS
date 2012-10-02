function clampIntRange(num, min, max) {
	num = Math.floor(num);
	if (num < min) num = min;
	if (typeof max !== 'undefined' && num > max) num = max;
	return num;
}
exports.BattleMovedex = {
	absorb: {
		inherit: true,
		category: "Special",
		pp: 20
	},
	acid: {
		inherit: true,
		category: "Physical"
	},
	aeroblast: {
		inherit: true,
		category: "Physical"
	},
	aircutter: {
		inherit: true,
		category: "Physical"
	},
	ancientpower: {
		inherit: true,
		category: "Physical"
	},
	assist: {
		inherit: true,
		desc: "The user performs a random move from any of the Pokemon on its team. Assist cannot generate itself, Chatter, Copycat, Counter, Covet, Destiny Bond, Detect, Endure, Feint, Focus Punch, Follow Me, Helping Hand, Me First, Metronome, Mimic, Mirror Coat, Mirror Move, Protect, Sketch, Sleep Talk, Snatch, Struggle, Switcheroo, Thief or Trick.",
		onHit: function(target) {
			var moves = [];
			for (var j=0; j<target.side.pokemon.length; j++) {
				var pokemon = target.side.pokemon[j];
				if (pokemon === target) continue;
				for (var i=0; i<pokemon.moves.length; i++) {
					var move = pokemon.moves[i];
					var noAssist = {
						assist:1, chatter:1, copycat:1, counter:1, covet:1, destinybond:1, detect:1, endure:1, feint:1, focuspunch:1, followme:1, helpinghand:1, mefirst:1, metronome:1, mimic:1, mirrorcoat:1, mirrormove:1, protect:1, sketch:1, sleeptalk:1, snatch:1, struggle:1, switcheroo:1, thief:1, trick:1
					};
					if (move && !noAssist[move]) {
						moves.push(move);
					}
				}
			}
			var move = '';
			if (moves.length) move = moves[this.random(moves.length)];
			if (!move) {
				return false;
			}
			this.useMove(move, target);
		}
	},
	beatup: {
		inherit: true,
		basePower: 10,
		category: "Special",
		basePowerCallback: undefined,
		desc: "Does one hit for the user and each other unfainted non-egg active and non-active Pokemon on the user's side without a status problem."
	},
	bide: {
		inherit: true,
		desc: "The user spends two to three turns locked into this move and then, on the second turn after using this move, the user attacks the last Pokemon that hit it, inflicting double the damage in HP it lost during the two turns. If the last Pokemon that hit it is no longer on the field, the user attacks a random foe instead. If the user is prevented from moving during this move's use, the effect ends. This move ignores Accuracy and Evasion modifiers and can hit Ghost-types. Makes contact. Priority +1.",
		shortDesc: "Waits 2-3 turns; deals double the damage taken.",
		effect: {
			duration: 2+random(),
			onLockMove: 'bide',
			onStart: function(pokemon) {
				this.effectData.totalDamage = 0;
				this.add('-start', pokemon, 'Bide');
			},
			onDamage: function(damage, target, source, move) {
				if (!move || move.effectType !== 'Move') return;
				if (!source || source.side === target.side) return;
				this.effectData.totalDamage += damage;
				this.effectData.sourcePosition = source.position;
				this.effectData.sourceSide = source.side;
			},
			onAfterSetStatus: function(status, pokemon) {
				if (status.id === 'slp') {
					pokemon.removeVolatile('bide');
				}
			},
			onBeforeMove: function(pokemon) {
				if (this.effectData.duration === 1) {
					if (!this.effectData.totalDamage) {
						this.add('-fail', pokemon);
						return false;
					}
					this.add('-end', pokemon, 'Bide');
					var target = this.effectData.sourceSide.active[this.effectData.sourcePosition];
					this.moveHit(target, pokemon, 'bide', {damage: this.effectData.totalDamage*2});
					return false;
				}
				this.add('-message', pokemon.name+' is storing energy! (placeholder)');
				return false;
			}
		}
	},
	bind: {
		inherit: true,
		accuracy: 75
	},
	bite: {
		inherit: true,
		category: "Special"
	},
	blazekick: {
		inherit: true,
		category: "Physical"
	},
	blizzard: {
		num: 59,
		accuracy: 70,
		basePower: 120,
		category: "Special",
		desc: "Deals damage to all adjacent foes with a 10% chance to freeze each. If the weather is Hail, this move cannot miss.",
		shortDesc: "10% chance to freeze the foe(s).",
		id: "blizzard",
		isViable: true,
		name: "Blizzard",
		pp: 5,
		priority: 0,
		secondary: {
			chance: 10,
			status: 'frz'
		},
		target: "foes",
		type: "Ice"
	},
	bonerush: {
		inherit: true,
		accuracy: 80
	},
	brickbreak: {
		inherit: true,
		desc: "Reflect and Light Screen are removed from the target's field even if the attack misses or the target is a Ghost-type.",
		//shortDesc: "",
		onTryHit: function(pokemon) {
			pokemon.side.removeSideCondition('reflect');
			pokemon.side.removeSideCondition('lightscreen');
		}
	},
	bulletseed: {
		inherit: true,
		basePower: 10,
		category: "Special"
	},
	charge: {
		inherit: true,
		boosts: false
	},
	clamp: {
		inherit: true,
		category: "Special",
		accuracy: 75,
		pp: 10
	},
	conversion: {
		inherit: true,
		//desc: "",
		onTryHit: function(pokemon) {
			if (pokemon.ability === 'multitype') return false;
		},
		volatileStatus: 'conversion',
		effect: {
			onStart: function(pokemon) {
				var possibleTypes = pokemon.moveset.map(function(val){
					var move = this.getMove(val.id);
					var noConversion = {conversion:1, curse:1};
					if (!noConversion[move.id] && !pokemon.hasType(move.type)) {
						return move.type;
					}
				}, this).compact();
				if (!possibleTypes.length) {
					this.add('-fail', pokemon);
					return false;
				}
				this.effectData.type = possibleTypes[this.random(possibleTypes.length)];
				this.add('-start', pokemon, 'typechange', this.effectData.type);
			},
			onRestart: function(pokemon) {
				var possibleTypes = pokemon.moveset.map(function(val){
					var move = this.getMove(val.id);
					if (move.id !== 'conversion' && !pokemon.hasType(move.type)) {
						return move.type;
					}
				}, this).compact();
				if (!possibleTypes.length) {
					this.add('-fail', pokemon);
					return false;
				}
				this.effectData.type = possibleTypes[this.random(possibleTypes.length)];
				this.add('-start', pokemon, 'typechange', this.effectData.type);
			},
			onModifyPokemon: function(pokemon) {
				pokemon.types = [this.effectData.type];
			}
		}
	},
	conversion2: {
		inherit: true,
		//desc: "",
		onTryHit: function(target, source) {
			if (source.ability === 'multitype') return false;
			source.addVolatile("conversion2", target);
		}
	},
	cottonspore: {
		inherit: true,
		accuracy: 85
	},
	covet: {
		inherit: true,
		basePower: 40
	},
	crabhammer: {
		inherit: true,
		category: "Special",
		accuracy: 85
	},
	crunch: {
		inherit: true,
		category: "Special"
	},
	curse: {
		inherit: true,
		type: "???"
	},
	detect: {
		inherit: true,
		//desc: "",
		priority: 3
	},
	dig: {
		inherit: true,
		basePower: 60
	},
	disable: {
		inherit: true,
		accuracy: 55,
		desc: "The target cannot choose its last move for 4-7 turns. Disable only works on one move at a time and fails if the target has not yet used a move or if its move has run out of PP. The target does nothing if it is about to use a move that becomes disabled.",
		//shortDesc: "",
		isBounceable: false,
		volatileStatus: 'disable',
		effect: {
			durationCallback: function() {
				return this.random(4,8);
			},
			noCopy: true,
			onStart: function(pokemon) {
				if (!this.willMove(pokemon)) {
					this.effectData.duration++;
				}
				if (!pokemon.lastMove) {
					return false;
				}
				var moves = pokemon.moveset;
				for (var i=0; i<moves.length; i++) {
					if (moves[i].id === pokemon.lastMove) {
						if (!moves[i].pp) {
							return false;
						} else {
							this.add('-start', pokemon, 'Disable', moves[i].move);
							this.effectData.move = pokemon.lastMove;
							return;
						}
					}
				}
				return false;
			},
			onEnd: function(pokemon) {
				this.add('-message', pokemon.name+' is no longer disabled! (placeholder)');
			},
			onBeforeMove: function(attacker, defender, move) {
				if (move.id === this.effectData.move) {
					this.add('cant', attacker, 'Disable', move);
					return false;
				}
			},
			onModifyPokemon: function(pokemon) {
				var moves = pokemon.moveset;
				for (var i=0; i<moves.length; i++) {
					if (moves[i].id === this.effectData.move) {
						moves[i].disabled = true;
					}
				}
			}
		}
	},
	dive: {
		inherit: true,
		basePower: 60,
		category: "Special"
	},
	doomdesire: {
		inherit: true,
		accuracy: 85,
		basePower: 120,
		category: "Physical",
		onModifyMove: function(move) {
			move.type = '???';
		}
	},
	dragonclaw: {
		inherit: true,
		category: "Special"
	},
	dreameater: {
		inherit: true,
		desc: "Deals damage to one adjacent target, if it is asleep and does not have a Substitute. The user recovers half of the HP lost by the target, rounded up. If Big Root is held by the user, the HP recovered is 1.3x normal, rounded half down.",
		onTryHit: function(target) {
			if (target.status !== 'slp' || target.volatiles['substitute']) {
				this.add('-immune', target.id, '[msg]');
				return null;
			}
		}
	},
	encore: {
		inherit: true,
		//desc: "",
		//shortDesc: "",
		isBounceable: false,
		volatileStatus: 'encore',
		effect: {
			durationCallback: function() {
				return this.random(4,9);
			},
			onStart: function(target) {
				var noEncore = {encore:1,mimic:1,mirrormove:1,sketch:1,transform:1};
				var moveIndex = target.moves.indexOf(target.lastMove);
				if (!target.lastMove || noEncore[target.lastMove] || (target.moveset[moveIndex] && target.moveset[moveIndex].pp <= 0)) {
					this.add('-fail',target);
					delete target.volatiles['encore'];
					return;
				}
				this.effectData.move = target.lastMove;
				this.add('-start', target, 'Encore');
				if (this.willMove(target)) {
					this.changeDecision(target, {move:this.effectData.move});
				} else {
					this.effectData.duration++;
				}
			},
			onResidual: function(target) {
				if (target.moves.indexOf(target.lastMove) >= 0 && target.moveset[target.moves.indexOf(target.lastMove)].pp <= 0) {
					delete target.volatiles.encore;
					this.add('-end', target, 'Encore');
				}
			},
			onEnd: function(target) {
				this.add('-end', target, 'Encore');
			},
			onModifyPokemon: function(pokemon) {
				if (!this.effectData.move || !pokemon.hasMove(this.effectData.move)) {
					return;
				}
				for (var i=0; i<pokemon.moveset.length; i++) {
					if (pokemon.moveset[i].id !== this.effectData.move) {
						pokemon.moveset[i].disabled = true;
					}
				}
			},
			onBeforeTurn: function(pokemon) {
				if (!this.effectData.move) {
					// ???
					return;
				}
				var decision = this.willMove(pokemon);
				if (decision) {
					this.changeDecision(pokemon, {move:this.effectData.move});
				}
			}
		}
	},
	explosion: {
		inherit: true,
		basePower: 500,
		//desc: ""
	},
	extremespeed: {
		inherit: true,
		shortDesc: "Usually goes first.",
		priority: 1
	},
	faintattack: {
		inherit: true,
		category: "Special"
	},
	fakeout: {
		inherit: true,
		shortDesc: "Usually hits first; first turn out only; target flinch.",
		priority: 1
	},
	firepunch: {
		inherit: true,
		category: "Special"
	},
	firespin: {
		inherit: true,
		accuracy: 70,
		basePower: 15
	},
	flamewheel: {
		inherit: true,
		category: "Special"
	},
	flash: {
		inherit: true,
		accuracy: 70
	},
	fly: {
		inherit: true,
		basePower: 70
	},
	
	foresight: {
		inherit: true,
		isBounceable: false
	},
	furycutter: {
		inherit: true,
		basePower: 10
	},
	futuresight: {
		inherit: true,
		accuracy: 90,
		basePower: 80,
		pp: 15,
		onModifyMove: function(move) {
			move.type = '???';
		}
	},
	gigadrain: {
		inherit: true,
		basePower: 60,
		pp: 5
	},
	glare: {
		inherit: true,
		accuracy: 75
	},
	growth: {
		inherit: true,
		desc: "Raises the user's Special Attack by 1 stage.",
		shortDesc: "Boosts the user's Sp. Atk by 1.",
		onModifyMove: undefined,
		boosts: {
			spa: 1
		}
	},
	gust: {
		inherit: true,
		category: "Physical"
	},
	hiddenpower: {
		num: 237,
		accuracy: 100,
		basePower: 0,
		basePowerCallback: function(pokemon) {
			return pokemon.hpPower || 70;
		},
		category: "Physical",
		desc: "Deals damage to one adjacent target. This move's type and power depend on the user's individual values (IVs). Power varies between 30 and 70, and type can be any but Normal.",
		shortDesc: "Varies in power and type based on the user's IVs.",
		id: "hiddenpower",
		isViable: true,
		name: "Hidden Power",
		pp: 15,
		priority: 0,
		onModifyMove: function(move, pokemon) {
			move.type = pokemon.hpType || 'Dark';
			if ((move.type === 'Dark') || (move.type === 'Psychic') || (move.type === 'Fire') || (move.type === 'Water') || (move.type === 'Electric') || (move.type === 'Grass') || (move.type === 'Ice') || (move.type === 'Dragon')) move.category = 'Special';
			else move.category = 'Physical';
		},
		secondary: false,
		target: "normal",
		type: "Normal"
	},
	hiddenpowerbug: {
		inherit: true,
		category: "Physical"
	},
	hiddenpowerfighting: {
		inherit: true,
		category: "Physical"
	},
	hiddenpowerflying: {
		inherit: true,
		category: "Physical"
	},
	hiddenpowerghost: {
		inherit: true,
		category: "Physical"
	},
	hiddenpowerground: {
		inherit: true,
		category: "Physical"
	},
	hiddenpowerpoison: {
		inherit: true,
		category: "Physical"
	},
	hiddenpowerrock: {
		inherit: true,
		category: "Physical"
	},
	hiddenpowersteel: {
		inherit: true,
		category: "Physical"
	},
	hijumpkick: {
		inherit: true,
		basePower: 85,
		desc: "If this attack misses the target, the user takes half of the damage it would have dealt in recoil damage.",
		shortDesc: "User takes half damage it would have dealt if miss.",
		pp: 20,
		onMoveFail: function(target, source, move) {
			var damage = this.getDamage(source, target, move, true);
			this.damage(clampIntRange(damage/2, 1, Math.floor(target.maxhp/2)), source);
		}
	},
	hyperbeam: {
		inherit: true,
		category: "Physical"
	},
	hypervoice: {
		inherit: true,
		category: "Physical"
	},
	hypnosis: {
		inherit: true,
		accuracy: 60
	},
	iceball: {
		inherit: true,
		category: "Special"
	},
	icepunch: {
		inherit: true,
		category: "Special"
	},
	iciclespear: {
		inherit: true,
		basePower: 10,
		category: "Special"
	},
	jumpkick: {
		inherit: true,
		basePower: 70,
		desc: "If this attack misses the target, the user takes half of the damage it would have dealt in recoil damage.",
		shortDesc: "User takes half damage it would have dealt if miss.",
		pp: 25,
		onMoveFail: function(target, source, move) {
			var damage = this.getDamage(source, target, move, true);
			this.damage(clampIntRange(damage/2, 1, Math.floor(target.maxhp/2)), source);
		}
	},
	knockoff: {
		inherit: true,
		category: "Special"
	},
	leafblade: {
		inherit: true,
		basePower: 70,
		category: "Special"
	},
	megadrain: {
		inherit: true,
		pp: 10
	},
	mudshot: {
		inherit: true,
		category: "Physical"
	},
	mudslap: {
		inherit: true,
		category: "Physical"
	},
	needlearm: {
		inherit: true,
		category: "Special"
	},
	odorsleuth: {
		inherit: true,
		isBounceable: false
	},
	outrage: {
		inherit: true,
		basePower: 90,
		category: "Special",
		pp: 15
	},
	payback: {
		inherit: true,
		basePowerCallback: function(pokemon, target) {
			if (this.willMove(target)) {
				return 50;
			}
			return 100;
		}
	},
	petaldance: {
		inherit: true,
		basePower: 70,
		pp: 20
	},
	poisongas: {
		inherit: true,
		accuracy: 55,
		category: "Physical"
	},
	protect: {
		inherit: true,
		//desc: "",
		priority: 3
	},
	pursuit: {
		inherit: true,
		category: "Special"
	},
	razorleaf: {
		inherit: true,
		category: "Special"
	},
	razorwind: {
		inherit: true,
		category: "Physical"
	},
	recover: {
		inherit: true,
		pp: 20
	},
	rest: {
		inherit: true,
		onHit: function(target) {
			if (target.hp >= target.maxhp) return false;
			if (!target.setStatus('slp')) this.heal(target.maxhp);
			else {
				target.statusData.time = 3;
				target.statusData.startTime = 3;
				this.heal(target.maxhp) //Aeshetic only as the healing happens after you fall asleep in-game
				this.add('-status', target, 'slp', '[from] move: Rest');
			}
		}
	},
	roar: {
		inherit: true,
		isBounceable: false
	},
	rockblast: {
		inherit: true,
		accuracy: 80
	},
	rocksmash: {
		inherit: true,
		basePower: 20
	},
	sandtomb: {
		inherit: true,
		accuracy: 70,
		basePower: 15
	},
	scaryface: {
		inherit: true,
		accuracy: 90
	},
	selfdestruct: {
		inherit: true,
		basePower: 400,
		//desc: ""
	},
	shadowball: {
		inherit: true,
		category: "Physical"
	},
	signalbeam: {
		inherit: true,
		category: "Physical"
	},
	silverwind: {
		inherit: true,
		category: "Physical"
	},
	sludge: {
		inherit: true,
		category: "Physical"
	},
	sludgebomb: {
		inherit: true,
		category: "Physical"
	},
	sonicboom: {
		inherit: true,
		category: "Physical"
	},
	spark: {
		inherit: true,
		category: "Special"
	},
	spikes: {
		inherit: true,
		isBounceable: false
	},
	spite: {
		inherit: true,
		isBounceable: false
	},
	stockpile: {
		inherit: true,
		pp: 10,
		boosts: false
	},
	struggle: {
		num: 165,
		accuracy: true,
		basePower: 50,
		category: "Physical",
		desc: "Deals typeless damage to one adjacent foe at random. If this move was successful, the user loses 1/2 of the damage dealt, rounded half up; the Ability Rock Head does not prevent this. This move can only be used if none of the user's known moves can be selected. Makes contact.",
		shortDesc: "User loses half of the damage dealt as recoil.",
		id: "struggle",
		name: "Struggle",
		pp: 1,
		noPPBoosts: true,
		priority: 0,
		isContact: true,
		beforeMoveCallback: function(pokemon) {
			this.add('-message', pokemon.name+' has no moves left! (placeholder)');
		},
		onModifyMove: function(move) {
			move.type = '???';
		},
		recoil: [1,2],
		secondary: false,
		target: "normal",
		type: "Normal"
	},
	swift: {
		inherit: true,
		category: "Physical"
	},
	tackle: {
		inherit: true,
		accuracy: 95,
		basePower: 35
	},
	tailglow: {
		inherit: true,
		desc: "Raises the user's Special Attack by 2 stages.",
		shortDesc: "Boosts the user's Sp. Atk by 2.",
		boosts: {
			spa: 2
		}
	},
	taunt: {
		inherit: true,
		isBounceable: false
	},
	thrash: {
		inherit: true,
		basePower: 90,
		pp: 20
	},
	thunderpunch: {
		inherit: true,
		category: "Special"
	},
	thunderwave: {
		inherit: true,
		onTryHit: function(target) {
			if (target.hasType('Ground')) {
				this.add('-immune', target.id, '[msg]');
				return null;
			}
		},
		onModifyMove: function(move) {
			move.type = '???';
		}
	},
	torment: {
		inherit: true,
		isBounceable: false
	},
	toxic: {
		inherit: true,
		accuracy: 85
	},
	triattack: {
		inherit: true,
		category: "Physical"
	},
	uproar: {
		inherit: true,
		basePower: 50,
		category: "Physical"
	},
	vinewhip: {
		inherit: true,
		category: "Special",
		pp: 10
	},
	volttackle: {
		inherit: true,
		category: "Special"
	},
	weatherball: {
		num: 311,
		accuracy: 100,
		basePower: 50,
		basePowerCallback: function() {
			if (this.weather) return 100;
			return 50;
		},
		category: "Physical",
		desc: "Deals damage to one adjacent target. Power doubles during weather effects and this move's type changes to match; Ice-type during Hail, Water-type during Rain Dance, Rock-type during Sandstorm, and Fire-type during Sunny Day.",
		shortDesc: "Power doubles and type varies in each weather.",
		id: "weatherball",
		isViable: true,
		name: "Weather Ball",
		pp: 10,
		priority: 0,
		onModifyMove: function(move) {
			switch (this.weather) {
			case 'sunnyday':
				move.type = 'Fire';
				break;
			case 'raindance':
				move.type = 'Water';
				break;
			case 'sandstorm':
				move.type = 'Rock';
				break;
			case 'hail':
				move.type = 'Ice';
				break;
			}
			if (move.type === 'Rock') move.category = 'Physical';
			else move.category = 'Special';
		},
		secondary: false,
		target: "normal",
		type: "Normal"
	},
	whirlpool: {
		inherit: true,
		accuracy: 70,
		basePower: 15
	},
	whirlwind: {
		inherit: true,
		isBounceable: false
	},
	willowisp: {
		inherit: true,
		onTryHit: function(target) {
			if (target.hasType('Fire')) {
				this.add('-immune', target.id, '[msg]');
				return null;
			}
		},
		onModifyMove: function(move) {
			move.type = '???';
		}
	},
	wish: {
		inherit: true,
		//desc: "",
		shortDesc: "Next turn, heals 50% of the recipient's max HP.",
		sideCondition: 'Wish',
		effect: {
			duration: 2,
			onResidualOrder: 2,
			onEnd: function(side) {
				var target = side.active[this.effectData.sourcePosition];
				if (!target.fainted) {
					var source = this.effectData.source;
					var damage = this.heal(target.maxhp/2, target, target);
					if (damage) this.add('-heal', target, target.hpChange(damage), '[from] move: Wish', '[wisher] '+source.name);
				}
			}
		}
	},
	wrap: {
		inherit: true,
		accuracy: 85
	},
	zapcannon: {
		inherit: true,
		basePower: 100
	},
	magikarpsrevenge: null
};

