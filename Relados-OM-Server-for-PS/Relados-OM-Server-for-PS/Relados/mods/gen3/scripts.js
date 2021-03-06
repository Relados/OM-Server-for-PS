exports.BattleScripts = {
	gen: 3,
	init: function() {
		for (var i in this.data.Pokedex) {
			var template = this.getTemplate(i);
			if (template.gen > 3) template.isNonstandard = true;
			delete template.abilities['DW'];
		}
		for (var i in this.data.Movedex) {
			var move = this.getMove(i);
			if (move.gen > 3) move.isNonstandard = true;
		}
		for (var i in this.data.Abilities) {
			var ability = this.getAbility(i);
			if (ability.gen > 3) ability.isNonstandard = true;
		}
		for (var i in this.data.Items) {
			var item = this.getItem(i);
			if (item.gen > 3) item.isNonstandard = true;
		}
	}
}
