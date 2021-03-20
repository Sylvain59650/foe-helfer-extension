


FoEproxy.addHandler('ItemAuctionService', 'getAuction', (data, postData) => {
		let antique = data.responseData;
		if (antique!=null) {
			if (antique.reward.id===MainParser?.Antique?.reward.id) {
				antique.followed=MainParser?.Antique.followed;
			}
			if (antique.state=="closed") {
				antique=null;
			}
			MainParser.Antique=antique;
			DB.set("Antique",MainParser.Antique);
			Quests.CalcBody();
		}
	}
);

FoEproxy.addHandler('ChallengeService', 'collectReward', (data, postData) => {
	Quests.CalcBody();
});




let Quests = {
	init: () => {		
		
	},

	ToogleShow:()=>{
		if ($('#Quests').length > 0) {
			HTML.CloseOpenBox('Quests');
		} else {
			Quests.Show();
		}
	},


	Show: () => {
		if ($('#Quests').length === 0) {
			HTML.AddCssFile('quests');

			HTML.Box({
				'id': 'Quests',
				'title': i18n('Boxes.Quests.Title'),
				'auto_close': true,
				'dragdrop': true,
				'minimize': true
			});
		}
		Quests.CalcBody();
	},


	CalcBody: () => {
		if( $('#Quests').length == 0 ){
			return;
		}
		if (MainParser.Quests==null) return;
		let content=[];
		content.push('<ol class="quests">');
		for(let quest of MainParser.Quests){			
			let conditionGroups=quest.successConditionGroups??[];
			if (quest.successConditions[0].iconType=="quest"){ // ne pas afficher les quetes de types event
				continue;
			}
			content.push('<li class="quest">');
			let firstSsQuest=true;
			for(let succ of quest.successConditions) {				
				content.push('<ul class="quest-quest-list">');	
				let progress=succ.currentProgress??0;
				let ended="";
				if (progress==succ.maxProgress) {
					ended=" ended";		
				}
				if (succ.maxProgress>1) {
					progress=progress+" / "+succ.maxProgress;
				}
				else {
					progress="";
				}
				content.push('<li class='+ended+'>');
					if (firstSsQuest && conditionGroups.length>0) {
						content.push('<span class="quest-cond">'+i18n("Boxes.Quests."+conditionGroups[0].type)+'</span>');
					}
					content.push('<div class="quest-description">'+succ.description+'</div>');
					content.push('<div class="quest-progress">'+progress+'</div>');
				content.push('</li>');
				content.push('</ul>');
				firstSsQuest=false;
			}
			content.push('</li>');
		}
		content.push('</ol>');

		// les challenges
		// on prend la meme presentation que pour les quetes pour le css commun
		if (MainParser.Challenges!=null && MainParser.Challenges.length>1 && MainParser.Challenges[0].tasks!=null) {
			content.push('<ol class="quests">');
			for(let task of MainParser.Challenges[0].tasks){
				content.push('<li class="quest">');
				content.push('<ul class="quest-quest-list">');
				let progress=task.currentProgress??0;
				let ended="";
				if (progress==task.maxProgress) {
					ended=" ended";		
				}
				if (task.maxProgress>1) {
					progress=progress+" / "+task.maxProgress;
				}
				else {
					progress="";
				}						
					content.push('<li class='+ended+'>');
						content.push('<div class="quest-description daily">'+task.description+'</div>');
						content.push('<div class="quest-progress daily">'+progress+'</div>');
					content.push('</li>');
				content.push('</ul>');
				content.push('</li>');
			}
			content.push('</ol>');
		}

		content.push("<hr>");
		let cities=DB.get('Cities')||{};
		let city=cities[MainParser.CityName]??{};
		let nextProductions=city['NextProduction']??{};
		content.push('<ul class="nextProduction">');
		for(let type of Object.keys(nextProductions)) {
			content.push('<li><span class="time">'+nextProductions[type].at+'</span><span class="goods-sprite-50 ' 
			+ nextProductions[type].type+ '"></span><div class="quantity">'+nextProductions[type].q+'</div></li>');
		}
		content.push('</ul>');

		content.push('<button class="collectTavern">Taverne '+MainParser.Tavern.sittings+'/'+MainParser.Tavern.chairs+'</button>');

		if (MainParser.Antique){
			let ant=MainParser.Antique;
			let title=ant.reward.name
				.replace("Amélioration du ","")
				.replace("Pack de sélection de ","")
				.replace("Pack de sélection du ","")
				.replace("Pack de sélection ","")
				.replace(/ /g,"_");
			let url="https://fr.wiki.forgeofempires.com/index.php?title="+title;
			let flags=(ant.reward.flags && ant.reward.flags.length>0)?ant.reward.flags[0]:"";
			content.push('<ul><li>'+moment.unix(ant.transitionAt).format('HH:mm:ss')+' ['+flags+'] <a target="wiki" class="Antique" href='+url+'>'+ ant.reward.name+'</a><br/>'+ ant.startingBid+" => "+ (ant.highestBid?.amount??"-")+'</li></ul>')
		}
		else {
			content.push("Vous ne suivez pas d'enchère");
		}

		let players=MainParser.Players.filter(x=>x.canSabotage && x.IsNeighbor);
		if (players.length>0) {
			content.push('<div class="sabotages">');
			for(let pl of players){
				content.push('<span class="PlayerName">'+pl.PlayerName+'</span> <span class="Score">'+pl.Score+'</span>');
			}
			content.push('</div>');
		}
		Technologies.inProgressTechnologies=DB.get("inProgressTechnologies"); 
		if (Technologies.inProgressTechnologies!=null) {
			content.push('<ul class="inProgressTechnologies">');
			for(let tech of Technologies.inProgressTechnologies) {
				if (tech.progress){
					content.push('<li><span class="">'+tech.name+'</span><span class=""> '+(tech.progress?.currentSP??"")+"/"+(tech?.maxSP??"")+'</span>');
					if (tech.requirements?.resources){
						content.push('<ul>');
						for(let req of Object.keys(tech.requirements.resources)) {
							content.push('<li>'+GoodsData[req].name+' '+tech.requirements.resources[req]+'</li>');
						}
						content.push('</ul>');
					}
					content.push('</li>');
				}
			}
			content.push('</ul>');
		}

		$('#QuestsBody').html( content.join('') );

		$(".collectTavern").on("click",function(){
			let payload='[{"__class__":"ServerRequest","requestData":[],"requestClass":"FriendsTavernService","requestMethod":"collectReward","requestId":65}]';
			let xhr = new XMLHttpRequest();
			xhr.open('POST', MainParser.MainUrl);
			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.send(payload);
		})

		$(".FollowAntique").on("click",function(){
			MainParser.Antique.followed=true;
			DB.set('Antique', MainParser.Antique);
			Quests.CalcBody();
		})
	}
	,


	
};
