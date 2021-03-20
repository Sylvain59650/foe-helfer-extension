

let PlayersPopin = {
	init: () => {		
		
	},

	ToogleShow:()=>{		
		if ($('#Players').length > 0) {
			HTML.CloseOpenBox('Players');
		} else {
			PlayersPopin.Show();
		}
	},

	Show:()=>{
		if (MainParser.Players==null) return;
		if ($('#Players').length === 0) {
			HTML.AddCssFile('players');

			HTML.Box({
				'id': 'Players',
				'title': i18n('Boxes.Players.Title'),
				'auto_close': true,
				'dragdrop': true,
				'minimize': true,
				'pinable':true
			});
		}
		
		PlayersPopin.ShowNeighbor=true;
		PlayersPopin.ShowGuild=false;
		PlayersPopin.ShowFriend=false;
		PlayersPopin.ShowOfflineOnly=false;
		PlayersPopin.ShowEasyWin=true;
		PlayersPopin.ShowNoInteraction=false;
		PlayersPopin.PlayerName="";
		let content=[];
		//PlayersPopin.list=Object.keys(MainParser.Players).map((x)=>MainParser.Players[x]);
		PlayersPopin.list=MainParser.Players;

		content.push('<button id=raz>RAZ</button>');	
		content.push('<div class="filters">');
		content.push('<label class="game-cursor"><input class="game-cursor ShowNeighbor" ' + (PlayersPopin.ShowNeighbor ? 'checked' : '') + ' type="checkbox">' + i18n('Boxes.Players.ShowNeighbor') + '</label><br/>');
		content.push('<label class="game-cursor"><input class="game-cursor ShowGuild" ' + (PlayersPopin.ShowGuild ? 'checked' : '') + ' type="checkbox">' + i18n('Boxes.Players.ShowGuild') + '</label><br/>');
		content.push('<label class="game-cursor"><input class="game-cursor ShowFriend" ' + (PlayersPopin.ShowFriend ? 'checked' : '') + ' type="checkbox">' + i18n('Boxes.Players.ShowFriend') + '</label><br/><br/>');
		content.push('<label class="game-cursor"><input class="game-cursor ShowEasyWin" ' + (PlayersPopin.ShowEasyWin ? 'checked' : '') + ' type="checkbox">' + i18n('Boxes.Players.ShowEasyWin') + '</label><br/><br/>');
		content.push('<label class="game-cursor"><input class="game-cursor ShowOfflineOnly" ' + (PlayersPopin.ShowOfflineOnly ? 'checked' : '') + ' type="checkbox">' + i18n('Boxes.Players.ShowOfflineOnly') + '</label><br/>');
		content.push('<label class="game-cursor"><input class="game-cursor ShowNoInteraction" ' + (PlayersPopin.ShowNoInteraction ? 'checked' : '') + ' type="checkbox">' + i18n('Boxes.Players.ShowNoInteraction') + '</label><br/>');
		content.push('<label class="game-cursor"><input class="game-cursor PlayerFilterName" type="text" /></label>');
		content.push('</div>');
		
		content.push('<div id="PlayerList"></div>');


		$('#PlayersBody').html(content.join('')).promise().done(function(){
			$('#raz').on('click', '', function () {
				PlayersPopin.ResetInterations();
			});
			$('#PlayersBody').on('click', '.ShowNeighbor', function () {
				PlayersPopin.ShowNeighbor = !PlayersPopin.ShowNeighbor;
				PlayersPopin.CalcBody();
			});
		
			$('#PlayersBody').on('click', '.ShowGuild', function () {
				PlayersPopin.ShowGuild = !PlayersPopin.ShowGuild;
				PlayersPopin.CalcBody();
			});
	
			$('#PlayersBody').on('click', '.ShowFriend', function () {
				PlayersPopin.ShowFriend = !PlayersPopin.ShowFriend;
				PlayersPopin.CalcBody();
			});

			$('#PlayersBody').on('click', '.ShowEasyWin', function () {
				PlayersPopin.ShowEasyWin = !PlayersPopin.ShowEasyWin;
				PlayersPopin.CalcBody();
			});

			$('#PlayersBody').on('click', '.ShowOfflineOnly', function () {
				PlayersPopin.ShowOfflineOnly = !PlayersPopin.ShowOfflineOnly;
				PlayersPopin.CalcBody();
			});

			$('#PlayersBody').on('click', '.ShowNoInteraction', function () {
				PlayersPopin.ShowNoInteraction =!PlayersPopin.ShowNoInteraction;
				PlayersPopin.CalcBody();
			});

			$('#PlayersBody').on('blur', '.PlayerFilterName', function () {
				PlayersPopin.PlayerName = document.querySelector(".PlayerFilterName").value;
				PlayersPopin.CalcBody();
			});

			
			
			
			PlayersPopin.CalcBody();	
		});
		
	},

	CalcBody: () => {		
		let players=PlayersPopin.list;
		for(let pl of players){
			pl.seen=(!PlayersPopin.ShowNeighbor || pl.IsNeighbor)
			 && (!PlayersPopin.ShowGuild || pl.IsGuildMember)
			 && (!PlayersPopin.ShowFriend || pl.IsFriend)
			 && (!PlayersPopin.ShowOfflineOnly || !pl.IsOnline)
			 && (!PlayersPopin.ShowEasyWin || (pl.won>=pl.NbFights && pl.won>0))
			 && (!PlayersPopin.ShowNoInteraction || (pl.IsFriend && pl.NbInteractions===0))
			 && (PlayersPopin.PlayerName=='' || pl.PlayerName.startsWith(PlayersPopin.PlayerName))
			;
		}

		players=players.filter(x=>x.seen).sort((a,b)=>(b.Score-a.Score));
		let content=[];
		let imgOnline='<img class="small" src="https://foefr.innogamescdn.com/assets/shared/scaled_loadingscreens/bar_color.png" />';
		let imgInactif='<span class="off" />';
		content.push('<table class="foe-table scrollable">');
		content.push('<thead>');
		content.push('<tr><th>'+players.length+' joueurs</th><th>Propriétés</th></tr>')
		content.push('</thead><tbody>');
		
		let formatter=new Intl.NumberFormat();
		for(let pl of players){
			let img=(MainParser.PlayerPortraits!=null)?'https://foefr.innogamescdn.com/assets/shared/avatars/'+MainParser.PlayerPortraits[pl.PlayerID]+'.jpg':"";
			content.push('<tr>');
			content.push('<td><img alt="" src="'+img+'" /></td><td>'+pl.PlayerName+'<br/>');
			content.push(pl.ClanName+"<br/>"+formatter.format(pl.Score)+"<br/>");
			if (pl.IsOnline) {
				content.push(imgOnline);
			}
			if (!pl.IsActive) {
				content.push(imgInactif);
			}
			if (pl.NbFights>0) {
				let cl="";
				if (pl.won===pl.NbFights){
					cl="won";		
				}
				content.push('<span class="'+cl+'">'+pl.won+"/"+pl.NbFights+'</span>');
			}
			if (pl.NbInteractions) {
				content.push("Interaction:"+pl.NbInteractions);
			}
			content.push('</td>');
			content.push('</tr>');
		}
		content.push('</tbody></table>');
		$('#PlayerList').html( content.join('') );

	}
	,


	ResetInterations:()=>{		
		for(let pl of MainParser.Players) {
			pl.NbInteractions=0;
	   }
	}

	
};
