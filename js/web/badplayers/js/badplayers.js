
FoEproxy.addHandler('OtherPlayerService', 'getEventsPaginated', (data, postData) => {
   let playersIds=data.responseData.events.filter(e=>e.other_player).map(e=>e.other_player.player_id);
   for(let plId of playersIds) {
		let player=MainParser.Players.find(x=>x.PlayerId==plId);
		if (player!=null) {
			player.NbInteractions=(player.NbInteractions??0)+1;
		}
   }
   MainParser.updatePlayersRequired++;
});



