FoEproxy.addHandler('HiddenRewardService', 'getOverview', (data, postData) => {
    HiddenRewards.Cache = HiddenRewards.prepareData(data.responseData.hiddenRewards);
    
    setTimeout(HiddenRewards.RefreshGui,10000);
    setInterval(HiddenRewards.RefreshGui, 60000*15);
    if (HiddenRewards.FirstCycle) { //Alle 60*15 Sekunden aktualisieren (Startbeginn des Ereignisses könnte erreicht worden sein)
        HiddenRewards.FirstCycle = false;

        
    }
});

/**
 *
 * @type {{init: HiddenRewards.init, prepareData: HiddenRewards.prepareData, BuildBox: HiddenRewards.BuildBox2, RefreshGui: HiddenRewards.RefreshGui, Cache: null, FilteredCache : null, FirstCycle : true}}
 */
let HiddenRewards = {

    Cache: null,
    FilteredCache : null,
    FirstCycle: true,
    
	/**
	 * Box in den DOM
	 */
    init: () => {
        HTML.AddCssFile('hidden-rewards');
        moment.locale(i18n('Local'));
        HiddenRewards.RefreshGui();
    },


	/**
	 * Daten aufbereiten
	 */
    prepareData: (Rewards) => {
        let data = [];

        for (let idx in Rewards) {
            if (!Rewards.hasOwnProperty(idx)) continue;

            let position = Rewards[idx].position.context;

            let SkipEvent = true;

            // prüfen ob der Spieler in seiner Stadt eine zweispurige Straße hat
            if (position === 'cityRoadBig') {
                if (CurrentEraID >= Technologies.Eras.ProgressiveEra)
                    SkipEvent = false;
            }
            else {
                SkipEvent = false;
            }

            if (SkipEvent) {
                continue;
            }

            const positionI18nLookupKey = 'HiddenRewards.Positions.' + position;
            const positionI18nLookup = i18n('HiddenRewards.Positions.' + position);
            let positionText=position;    
            if (positionI18nLookupKey !== positionI18nLookup) {
                positionText = positionI18nLookup;
            }

            data.push({
                type: Rewards[idx].type,
                position:position,
                positionText: positionText,
                starts: Rewards[idx].startTime,
                expires: Rewards[idx].expireTime,
            });
        }

        data.sort(function (a, b) {
            if (a.expires < b.expires) return -1;
            if (a.expires > b.expires) return 1;
            return 0;
        });

        return data;        
    },

    /**
     * Filtert den Cache erneut basierend auf aktueller Zeit + aktualisiert Counter/Liste falls nötig
     * 
     */
    RefreshGui: () => {       
        HiddenRewards.FilteredCache = [];
        for (let i = 0; i < HiddenRewards.Cache.length; i++) {
            let StartTime = moment.unix(HiddenRewards.Cache[i].starts),
                EndTime = moment.unix(HiddenRewards.Cache[i].expires);

            if (StartTime < MainParser.getCurrentDateTime() && EndTime > MainParser.getCurrentDateTime()) {
                HiddenRewards.FilteredCache.push(HiddenRewards.Cache[i]);
            }
        }

        HiddenRewards.SetCounter();
        HiddenRewards.BuildBox2();
    },


	/**
	 * Inhalt der Box in den BoxBody legen
	 */
    BuildBox2:() => {
        let h = [];
        //debugger;
        if (HiddenRewards.FilteredCache!=null) 
        {
            let wheres=["Route","Nature","Dans l'eau","Rivage"];
            for(let where of wheres) {
                let nbWhere=HiddenRewards.FilteredCache.filter((x)=>x.positionText==where);
                if (nbWhere.length>0) {
                    h.push('<span>'+nbWhere.length+' '+where+' </span>');
                }
            }
            let html=h.join("");
            let barHiddenRewards=document.querySelector("#fp-hiddenRewards");
            if (barHiddenRewards==null) {
                let barText='<span id="fp-hiddenRewards"></span>';
                let bar=document.querySelector("#fp-bar");                
                bar.insertAdjacentHTML("afterbegin", barText);
                barHiddenRewards=document.querySelector("#fp-hiddenRewards");
            }
            barHiddenRewards.innerHTML=html;
        }
    },

    BuildBox: () => {
        let h = [];

        h.push('<table class="foe-table">');

        h.push('<thead>');
        h.push('<tr>');
        h.push('<th>' + i18n('HiddenRewards.Table.type') + '</th>');
        h.push('<th>' + i18n('HiddenRewards.Table.position') + '</th>');
        h.push('<th>' + i18n('HiddenRewards.Table.expires') + '</th>');
        h.push('</tr>');
        h.push('</thead>');

        h.push('<tbody>');

        if (HiddenRewards.FilteredCache.length > 0) {
            for (let idx in HiddenRewards.FilteredCache) {

                if (!HiddenRewards.FilteredCache.hasOwnProperty(idx)) {
                    break;
                }

                let hiddenReward = HiddenRewards.FilteredCache[idx];

                h.push('<tr>');
                h.push('<td class="incident" title="' + hiddenReward.type + '"><img src="' + extUrl + 'js/web/hidden-rewards/images/' + hiddenReward.type + '.png" alt=""></td>');
                h.push('<td>' + hiddenReward.position + '</td>');
                h.push('<td class="">' + i18n('Boxes.HiddenRewards.Disappears') + ' ' + moment.unix(hiddenReward.expires).fromNow() + '</td>');
                h.push('</tr>');
            }
        }
        else {
            h.push('<td colspan="3">' + i18n('Boxes.HiddenRewards.NoEvents') + '</td>');
        }

        h.push('</tbody>');

        h.push('</table>');

        $('#HiddenRewardBoxBody').html(h.join(''));
    },


	SetCounter: ()=> {
        if (HiddenRewards.FilteredCache) {
            if(HiddenRewards.FilteredCache.length > 0){
                $('#hidden-reward-count').text(HiddenRewards.FilteredCache.length).show();
            } else {
                $('#hidden-reward-count').hide();
            }
        }
	}
};
