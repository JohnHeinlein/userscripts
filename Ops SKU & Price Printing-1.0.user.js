// ==UserScript==
// @name         Ops SKU & Price Printing
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  try to take over the world!
// @author       You
// @match        https://*/View/Assets
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @require      http://code.jquery.com/jquery-3.7.0.min.js
// @require      https://raw.githubusercontent.com/davidshimjs/qrcodejs/master/qrcode.min.js
// ==/UserScript==

/* global $ */
this.$ = this.jQuery = jQuery.noConflict(true); // No conflict mode. Importing a new jq breaks ops' version and prevents some devexpress functions from firing.

const DEBUG_MODE = true;
function debug(func = "Price/SKU Sticker", str){ if(DEBUG_MODE) console.log(`[tweaks.${func}] ${str}`) }

$(document).ready(function(){
    debug("Price Tag Script", "Initializing...");
    stickerSKU(); // Adds button to print sticker for the SKU specifically
});

function addCss(css) {
  const style = document.getElementById("jjr_sticker_style") || (function() {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.id = "jjr_sticker_style";
    document.head.appendChild(style);
    return style;
  })();
  const sheet = style.sheet;
  sheet.insertRule(css, (sheet.rules || sheet.cssRules || []).length);
}


function stickerSKU(){
    // Manipulate print area
    const cust_style = `
    :root{
		--jd-bg: #acabab;
		--jd-txt: #454545;
	}
	.jd-tag {
		width: 4in !important;
		height: 6in !important;

		display:grid !important;
		grid-template-columns: 2.75in 1.25in;
		grid-template-rows:  1.5in 3.5in 1in;
		grid-template-areas:
			"price logo"
	 		"prod prod"
			"asset asset";
		place-items: stretch;
	}
	.jd-tag .jd-qrAsset{
		grid-area: asset;
		place-self:stretch;
		padding:5px;
		image-rendering: pixelated;
		height:100%;
		width:1in;
		z-index:2;
	}
	.jd-tag .asset{
		grid-area: asset;
		place-self: right center;
		z-index:1;
		width:100%;

		text-align:right;

		print-color-adjust: exact;
		background:var(--jd-bg);
		color:var(--jd-txt);
		//filter:invert();
	}
	.jd-tag .asset h3{
		font-size:0.5in;
		line-height:1in;
	}
	.jd-tag .prod {
		grid-area: prod;
		place-self: center center;

		font-size: 0.4in;

		width:90%;
		text-align: center;
		text-wrap:pretty;
	}
	.jd-tag .price{
		grid-area: price;
		place-self: center center;

		text-align:center;
		font-size:1in;

		width:100%;
		height:100%;
		font-weight:bold;

		print-color-adjust: exact;
		background:var(--jd-bg);
		color:var(--jd-txt);
		//filter:invert();
	}
	.jd-tag .jd-logo{
		object-fit:cover;
		object-position: left 50%;
		place-self:left;

		print-color-adjust: exact;
		//background:var(--jd-bg);
		color:var(--jd-txt);
		filter:grayscale(100);
	}
    `
    //GM_addStyle(style);
    const qrl = `https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=`;
    var skubutt = `<button id="jd-printsku">Sale Sticker</button>`;

    var buttContainer = $("#gridAssets .dx-toolbar-after")[0];
    $(buttContainer).prepend(skubutt);

    $("#jd-printsku").on("click",function(){
        printTags();
    });

    // Collect data from each row and generate a tag to print
    function printTags(){
        var rows = $(".dx-datagrid-rowsview tr.dx-data-row"); //TODO: Iterate on selected, not visible
        for(let i = 0; i < rows.length; i++){
            var children = rows[i].childNodes;
            var item = {
                asset: children[2].innerText,
                type:  children[3].innerText,
                sku:   children[6].innerText,
                manu:  children[10].innerText,
                model: children[11].innerText,
                part:  children[12].innerText,
                price: children[15].innerText
            }

            var qrAsset = qrl + item.asset;
            var qrSku = qrl + item.sku;

            // Generate element
            const logoURL = '/img/Color_Logo_NoTag.png';
            const printElement =
                  `<div class="jd-tag" style="display:none">
                    <div class="price">$${item.price}</div>
                    <img class="jd-logo" alt="Logo" src=${logoURL}></img>
                    <p class="prod">${item.manu} ${item.model} ${item.part}</p>
                    <div class="asset"><h3>${item.asset}</h3></div>
                    <img class="jd-qrAsset" alt="QR-Code" src=${qrAsset}></img>
                  </div>`;

            // Make things visible
            $("#assetTagArea").css('display','block');
            ;$("#qrcodeCanvas").css("display","none");

            $(".jd-tag").css("display","block");

            $("body").append(printElement);
            // $("#assetTagArea").append(``);
        } // End for

        // Move main content to fragment
        var tmp = $(document.createDocumentFragment());
        tmp.append($("#layout-drawer-scrollview"));

        $("html").append($(`<style id='jd-css-print' media='print'>${cust_style}</style>`));

        // Add print area to main document
        $("body").append($(".jd-tag"));

        // Print as a blocking operation
        window.print();

        // Return to original page by removing tags and restoring fragment
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        $("body").append(tmp);

        $("#assetTagArea").css("display","none");
    }
}