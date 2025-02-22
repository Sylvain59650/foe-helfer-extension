﻿/*
 * **************************************************************************************
 *
 * Dateiname:                 market.js
 * Projekt:                   foe-chrome
 *
 * erstellt von:              Daniel Siekiera <daniel.siekiera@gmail.com>
 * erstellt am:               17.07.20, 23:50 Uhr
 *
 * Copyright © 2020
 *
 * **************************************************************************************
 */

// Market
FoEproxy.addHandler('TradeService', 'getTradeOffers', (data, postData) => {
    let requestMethod = postData[0]['requestMethod'];
    if (requestMethod === 'getTradeOffers' || requestMethod === 'acceptOfferById') {
        Market.Trades = data.responseData;

        if ($('#market-Btn').hasClass('hud-btn-red')) {
            $('#market-Btn').removeClass('hud-btn-red');
            $('#market-Btn-closed').remove();
        }

        if (Settings.GetSetting('ShowMarketFilter') || $('#Market').length > 0) {
            Market.Show();
        }
    }
});


/**
 * Market function
 *
 * @type {{OfferSelect: null, Trades: [], TradeFair: boolean, TradePartnerGuild: boolean, TradeForHigher: boolean, MaxResults: number, TestGoodFilter: Market.TestGoodFilter, TestFilter: Market.TestFilter, TradeFairStock: boolean, TradePartnerFriend: boolean, MinQuantity: number, TradeForEqual: boolean, TradeDisadvantage: boolean, Need: number, Offer: number, NeedSelect: null, TradePartnerNeighbor: boolean, TradeAdvantage: boolean, Show: Market.Show, CalcBody: Market.CalcBody, TradeForLower: boolean}}
 */
let Market = {
    Trades: [],
    Offer: 0,
    Need: 0,
    MinQuantity: 10,
    MaxResults: 500,
    OnlyAffordable: true,

    TradePartnerNeighbor : true,
    TradePartnerGuild : true,
    TradePartnerFriend: true,

    TradeForHigher: true,
    TradeForEqual: true,
    TradeForLower: false,

    TradeAdvantage: true,
    TradeFairStock: false,
    TradeFair: false,
    TradeDisadvantage: false,

	OfferSelect: null,
	NeedSelect: null,


	/**
	 * Create a div-box for the DOM + Eventlistener
	 */
    Show: ()=> {
        if ($('#Market').length === 0) {
            HTML.Box({
                'id': 'Market',
                'title': i18n('Boxes.Market.Title'),
                'auto_close': true,
                'dragdrop': true,
                'minimize': true
            });

            // CSS in den DOM prügeln
            HTML.AddCssFile('market');


            $('#Market').on('click', '.custom-option', function(){
                let func = $(this).closest('.custom-options').data('function');

                Market[`${func}Select`] = $(this).text().trim();

                Market[func] = parseInt($(this).data('value'));
                Market.CalcBody();
            });


            $('#Market').on('blur', '#minquantity', function () {
                Market.MinQuantity = parseFloat($('#minquantity').val());              
                Market.CalcBody();
            });

            // $('#Market').on('blur', '#maxresults', function () {
            //     Market.MaxResults = parseFloat($('#maxresults').val());
            //     Market.CalcBody();
            // });

            $('#Market').on('click', '.tradepartnerneighbor', function () {
                Market.TradePartnerNeighbor = !Market.TradePartnerNeighbor;
                Market.CalcBody();
            });

            $('#Market').on('click', '.tradepartnerguild', function () {
                Market.TradePartnerGuild = !Market.TradePartnerGuild;
                Market.CalcBody();
            });

            $('#Market').on('click', '.tradepartnerfriend', function () {
                Market.TradePartnerFriend = !Market.TradePartnerFriend;
                Market.CalcBody();
            });

            $('#Market').on('click', '.tradeforhigher', function () {
                Market.TradeForHigher = !Market.TradeForHigher;
                Market.CalcBody();
            });

            $('#Market').on('click', '.tradeforequal', function () {
                Market.TradeForEqual = !Market.TradeForEqual;
                Market.CalcBody();
            });

            $('#Market').on('click', '.tradeforlower', function () {
                Market.TradeForLower = !Market.TradeForLower;
                Market.CalcBody();
            });

            $('#Market').on('click', '.tradeadvantage', function () {
                Market.TradeAdvantage = !Market.TradeAdvantage;
                Market.CalcBody();
            });

            $('#Market').on('click', '.tradefairstock', function () {
                Market.TradeFairStock = !Market.TradeFairStock;
                Market.CalcBody();
            });

            $('#Market').on('click', '.tradefair', function () {
                Market.TradeFair = !Market.TradeFair;
                Market.CalcBody();
            });

            $('#Market').on('click', '.tradedisadvantage', function () {
                Market.TradeDisadvantage = !Market.TradeDisadvantage;
                Market.CalcBody();
            });

            $('#Market').on('change', '.onlyaffordable', function () {
                Market.OnlyAffordable = !Market.OnlyAffordable;
                Market.CalcBody();
            });
        }

        Market.CalcBody();
    },


	/**
	 * Main function for all the data
	 */
    CalcBody: () => {
        let h = [];

        //Filters
        h.push('<div class="dark-bg" style="margin-bottom: 3px;">');
        h.push('<table class="filters">');
        // h.push('<thead>');
        // h.push('<tr>');
        // h.push('<th colspan="2"></td>');
        // h.push('<th>' + i18n('Boxes.Market.TradePartner') + '</th>');
        // h.push('<th>' + i18n('Boxes.Market.TradeForGoods') + '</th>');
        // h.push('<th>' + i18n('Boxes.Market.Rating') + '</th>');
        // h.push('</tr>');
        // h.push('</thead>');

        h.push('<tr>');
        h.push('<td colspan=3 title='+i18n('Boxes.Market.Offer')+'>');

		let ID = 0;
		h.push(`<div class="custom-select-wrapper">
					<div class="custom-select">
						<div class="custom-select__trigger">
							<span class="trigger">${(Market.OfferSelect ? Market.OfferSelect : i18n('Boxes.Market.AllGoods'))}</span>
							<div class="arrow"></div>
						</div>
						<div class="custom-options" data-function="Offer">
							<span class="custom-option${(Market.Offer === ID ? ' selected' : '')}" data-value="${ID}">
								${i18n('Boxes.Market.AllGoods')}
							</span>`);

							for (let era = 0; era <= Technologies.Eras.SpaceAgeAsteroidBelt - Technologies.Eras.BronzeAge; era++)
							{
								ID += 1;

								h.push(`<span class="custom-option era${(Market.Offer === ID ? ' selected' : '')}" data-value="${ID}">${i18n('Eras.' + (era + Technologies.Eras.BronzeAge))}</span>`);

								for (let i = 0; i < 5; i++)
								{
									ID += 1;
									h.push(`<span class="custom-option${(Market.Offer === ID ? ' selected' : '')}" data-value="${ID}">${GoodsList[5*era + i]['name']}</span>`);
								}
							}

		h.push(			`</div>
					</div>
				</div>`);

        h.push('</td>');

        h.push('<td colspan=3 title='+i18n('Boxes.Market.Need')+'>');

		ID = 0;
		h.push(`<div class="custom-select-wrapper">
					<div class="custom-select">
						<div class="custom-select__trigger">
							<span class="trigger">${(Market.NeedSelect ? Market.NeedSelect : i18n('Boxes.Market.AllGoods'))}</span>
							<div class="arrow"></div>
						</div>
						<div class="custom-options" data-function="Need">
							<span class="custom-option${(Market.Need === ID ? ' selected' : '')}" data-value="${ID}">
								${i18n('Boxes.Market.AllGoods')}
							</span>`);

							for (let era = 0; era <= Technologies.Eras.SpaceAgeAsteroidBelt - Technologies.Eras.BronzeAge; era++)
							{
								ID += 1;

								h.push(`<span class="custom-option era${(Market.Need === ID ? ' selected' : '')}" data-value="${ID}">
											${i18n('Eras.' + (era + Technologies.Eras.BronzeAge))}
										</span>`);

								for (let i = 0; i < 5; i++) {
									ID += 1;
									h.push(`<span class="custom-option${(Market.Need === ID ? ' selected' : '')}" data-value="${ID}">
												${GoodsList[5*era + i]['name']}
											</span>`);
								}
							}

		h.push(			`</div>
					</div>
				</div>`);
        h.push('</td>');
      
       //h.push('<td><label class="game-cursor" for="minquantity">' + i18n('Boxes.Market.MinQuantity') + '</label></td>');
        h.push('<td title="' + i18n('Boxes.Market.TTMinQuantity') + '"><input type="number" id="minquantity" step="1" min="0" max="1000000" value="' + Market.MinQuantity + '"></td>');
        h.push('</tr>');

        h.push("</table><table>");
       
        //h.push('<tr>');
       // h.push('<td><label class="game-cursor" for="maxresults">' + i18n('Boxes.Market.MaxResults') + '</label></td>');
        //h.push('<td><input type="number" id="maxresults" step="1" min="1" max="1000000" value="' + Market.MaxResults + '"></td>');
        // h.push('<td></td>');
        // h.push('<td></td>');
        // h.push('<td><label class="game-cursor"><input class="tradedisadvantage game-cursor" ' + (Market.TradeDisadvantage ? 'checked' : '') + ' type="checkbox">' + i18n('Boxes.Market.TradeDisadvantage') + '</label></td>');
        //h.push('</tr>');

        h.push('<tr>');
        h.push('<td><label class="game-cursor"><input class="tradepartnerneighbor game-cursor" ' + (Market.TradePartnerNeighbor ? 'checked' : '') + ' type="checkbox">' + i18n('Boxes.Market.TradePartnerNeighbor') + '</label></td>');
        h.push('<td><label class="game-cursor"><input class="tradeforhigher game-cursor" ' + (Market.TradeForHigher ? 'checked' : '') + ' type="checkbox">' + i18n('Boxes.Market.TradeForHigher') + '</label></td>');
        h.push('<td><label class="game-cursor"><input class="tradeadvantage game-cursor" ' + (Market.TradeAdvantage ? 'checked' : '') + ' type="checkbox">' + i18n('Boxes.Market.TradeAdvantage') + '</label></td>');
        h.push('</tr>');

        h.push('<tr>');
        h.push('<td><label class="game-cursor"><input class="tradepartnerguild game-cursor" ' + (Market.TradePartnerGuild ? 'checked' : '') + ' type="checkbox">' + i18n('Boxes.Market.TradePartnerGuild') + '</label></td>');
        h.push('<td><label class="game-cursor"><input class="tradeforequal game-cursor" ' + (Market.TradeForEqual ? 'checked' : '') + ' type="checkbox">' + i18n('Boxes.Market.TradeForEqual') + '</label></td>');
        h.push('<td><label class="game-cursor"><input class="tradefairstock game-cursor" ' + (Market.TradeFairStock ? 'checked' : '') + ' type="checkbox" title="' + i18n('Boxes.Market.TradeFairStockTT') + '">' + i18n('Boxes.Market.TradeFairStock') + '</label></td>');
        h.push('</tr>');

        h.push('<tr>');
        h.push('<td><label class="game-cursor"><input class="tradepartnerfriend game-cursor" ' + (Market.TradePartnerFriend ? 'checked' : '') + ' type="checkbox">' + i18n('Boxes.Market.TradePartnerFriend') + '</label></td>');
        h.push('<td><label class="game-cursor"><input class="tradeforlower game-cursor" ' + (Market.TradeForLower ? 'checked' : '') + ' type="checkbox">' + i18n('Boxes.Market.TradeForLower') + '</label></td>');
        h.push('<td><label class="game-cursor"><input class="tradefair game-cursor" ' + (Market.TradeFair ? 'checked' : '') + ' type="checkbox">' + i18n('Boxes.Market.TradeFair') + '</label></td>');
        h.push('</tr>');

        h.push('<tr>');    
        h.push('<td colspan="4"><label class="game-cursor"><input class="onlyaffordable game-cursor" ' + (Market.OnlyAffordable ? 'checked' : '') + ' type="checkbox">' + i18n('Boxes.Market.OnlyAffordable') + '</label></td>');
        h.push('</tr>');

        h.push('</table>');
        h.push('</div>');

        // Table
        h.push('<table class="foe-table scrollable">');

        h.push('<thead>');
        h.push('<tr>');
        h.push('<th colspan="2">' + i18n('Boxes.Market.OfferColumn') + '</th>');
        h.push('<th colspan="2">' + i18n('Boxes.Market.NeedColumn') + '</th>');
        h.push('<th>' + i18n('Boxes.Market.RateColumn') + '</th>');
        h.push('<th>' + i18n('Boxes.Market.PlayerColumn') + '</th>');
        //h.push('<th>' + i18n('Boxes.Market.PageColumn') + '</th>');
        h.push('</tr>');
        h.push('</thead>');

        let Counter = 0;
        let Pos = 0;
        h.push('<tbody>');
        for (let i = 0; i < Market.Trades.length; i++)
        {
            if (Counter >= Market.MaxResults) break;

            let Trade = Market.Trades[i];
            if (Market.TestFilter(Trade)) {
                let OfferGoodID = Trade['offer']['good_id'],
                    NeedGoodID = Trade['need']['good_id'],
                    OfferEra = Technologies.Eras[GoodsData[OfferGoodID]['era']],
                    NeedEra = Technologies.Eras[GoodsData[NeedGoodID]['era']],
                    OfferTT = HTML.i18nReplacer(GoodsData[Trade['offer']['good_id']]['name']+"<p/>"+i18n('Boxes.Market.OfferTT'), { 'era': i18n('Eras.' + OfferEra), 'stock': HTML.Format(ResourceStock[OfferGoodID]) });
                    NeedTT = HTML.i18nReplacer(GoodsData[Trade['need']['good_id']]['name']+"<p/>"+i18n('Boxes.Market.NeedTT'), { 'era': i18n('Eras.' + NeedEra), 'stock': HTML.Format(ResourceStock[NeedGoodID]) });

                h.push('<tr>');
                h.push('<td class="goods-image"><span class="goods-sprite-50 sm '+ GoodsData[Trade['offer']['good_id']]['id'] +'"></span></td>'); 
                //h.push('<td><strong class="td-tooltip" title="' + OfferTT + '">' + GoodsData[Trade['offer']['good_id']]['name'].substring(0,1) + '</strong></td>');
                h.push('<td><strong class="td-tooltip" title="' + OfferTT + '">' + Trade['offer']['value'] + '</strong></td>');
                h.push('<td class="goods-image"><span class="goods-sprite-50 sm ' + GoodsData[Trade['need']['good_id']]['id'] +'"></span></td>'); 
                //h.push('<td><strong class="td-tooltip" title="' + NeedTT + '">' + GoodsData[Trade['need']['good_id']]['name'] + '</strong></td>');
                h.push('<td><strong class="td-tooltip" title="' + NeedTT + '">' + Trade['need']['value'] + '</strong></td>');
                h.push('<td class="text-center">' + HTML.Format(Math.round(Trade['offer']['value'] / Trade['need']['value'] * 100) / 100) + '</td>');
                let guildeCss="";
                if (Trade['merchant']['is_guild_member']) {
                    guildeCss="guilde";
                }
                h.push('<td class='+guildeCss+'>' + Trade['merchant']['name'] + '</td>');
                h.push('<td><button class="acceptOffer" id="o'+Trade.id+'">Ok</button></td>');
                //h.push('<td class="text-center">' + (Math.floor(Pos / 10 + 1)) + '-' + (Pos % 10 + 1) + '</td>');
                h.push('</tr>');

                Counter += 1;
            }

            if (!Trade['merchant']['is_self']) { //Eigene Handel rausfiltern
                Pos += 1;
            }
        }
        h.push('</tbody>');
        h.push('</table>');

        $('#MarketBody').html(h.join('')).promise().done(function(){
            HTML.Dropdown();
            $(".acceptOffer").on("click",function(){
                let offerId=this.id.substring(1);
                let payload='[{"__class__":"ServerRequest","requestData":['+offerId+'],"requestClass":"TradeService","requestMethod":"acceptOfferById","requestId":299}]';
                let url=MainParser.MainUrl;
                let xhr = new XMLHttpRequest();
			    xhr.open('POST', url);
			    xhr.setRequestHeader('Content-Type', 'application/json');
			    xhr.send(payload);
            })
        });

        $('.td-tooltip').tooltip({
            html: true,
            container: '#Market'
        });

    },


	/**
	 * Filter function
	 *
	 * @param Trade
	 * @returns {boolean}
	 */
    TestFilter: (Trade) => {
        if (Trade['id'] < 0) { // 10:1 Händler immer ausblenden
            return false;
        }

        if (Trade['merchant']['is_self']) {
            return false;
        }

        //Offer
        if (!Market.TestGoodFilter(Trade['offer']['good_id'], Market.Offer)) {
            return false;
        }

        //Need
        if (!Market.TestGoodFilter(Trade['need']['good_id'], Market.Need)) {
            return false;
        }

        //MinQuantity
        if(!(Trade['merchant']['is_guild_member'] || Trade['offer']['value'] >= Market.MinQuantity)) { //ignore MinQuanity for guild members
            return false;
        }

        // only Affordable
        if (Market.OnlyAffordable && Trade.need.value > (ResourceStock[Trade.need.good_id] || 0)) {
            return false;
        }

        //Tradepartner
        if (!((Market.TradePartnerNeighbor && Trade['merchant']['is_neighbor']) || (Market.TradePartnerGuild && Trade['merchant']['is_guild_member']) || (Market.TradePartnerFriend && Trade['merchant']['is_friend']))) {
            return false;
        }

        let OfferGoodID = Trade['offer']['good_id'],
            NeedGoodID = Trade['need']['good_id'],
            OfferEra = Technologies.Eras[GoodsData[OfferGoodID]['era']],
            NeedEra = Technologies.Eras[GoodsData[NeedGoodID]['era']],
            EraDiff = OfferEra - NeedEra;

        if (EraDiff > 0 && !Market.TradeForHigher) {
            return false;
        }
        if (EraDiff === 0 && !Market.TradeForEqual) {
            return false;
        }
        if (EraDiff < 0 && !Market.TradeForLower) {
            return false;
        }

        let Rate = Trade['offer']['value'] / Trade['need']['value'];
        let Rating = Rate * Math.pow(2, EraDiff);

        if (Rating > 1 && !Market.TradeAdvantage) {
            return false;
        }
        if (Rating === 1) { // Fair
            if (ResourceStock[OfferGoodID] + Trade['offer']['value']/2 < ResourceStock[NeedGoodID] - Trade['need']['value']/2) { //Stock is higher
                if (!Market.TradeFairStock) {
                    return false;
                }
            }
            else { // Stock is lower or equal
                if (!Market.TradeFair) {
                    return false;
                }
            }
        }
        //if (Rating < 1 && !Market.TradeDisadvantage) {
        if (Rating < 1) {
            return false;
        }

        return true;
    },


	/**
	 * Filter function
	 *
	 * @param TradeGood
	 * @param GoodCode
	 * @returns {boolean}
	 */
    TestGoodFilter: (TradeGood, GoodCode) => {
        if (GoodCode === 0) return true;

        GoodCode -= 1;

        let EraIndex = Math.floor(GoodCode / 6);
        let ID = GoodCode % 6;

        let AllowedGoods = [];
        if (ID === 0) {
            for (let i = 0; i < 5; i++) {
                AllowedGoods.push(GoodsList[EraIndex * 5 + i]['id']);
            }
        }
        else {
            AllowedGoods.push(GoodsList[EraIndex * 5 + ID - 1]['id']);
        }

        for (let i = 0; i < AllowedGoods.length; i++) {
            if (TradeGood === AllowedGoods[i]) return true;
        }
        return false
    },
};