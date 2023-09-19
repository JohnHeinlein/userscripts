// ==UserScript==
// @name         Ops Minor Tweaks
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Self-contained functional & cosmetic add-ons for Ops 5.5
// @author       You
// @match        https://sunnkingdevops.azurewebsites.net/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=azurewebsites.net
// @require      http://code.jquery.com/jquery-3.7.0.min.js
// @grant        none
// ==/UserScript==

/* global $ */
this.$ = this.jQuery = jQuery.noConflict(true); // No conflict mode. Importing a new jq breaks ops' version and prevents some devexpress functions from firing.
var debug = false;

$(document).ready(function(){
    //fixHeader(); // My little CSS animation needs the elements to be reordered in DOM.

    // A lot of these only need to run on the Process page
    if(window.location.href.includes("/Process")){
        charCount();       // Adds character counter to top-right of New Model dialogue
        expandNotes();     // Expand notes section vertically to fit its content
        betterR2V3();      // Embed r2v3 cheat sheet
        defaultLocation(); // Add dialogue to set Location & Next Process

        controlNotes(); // Adds control panel to notes field to collect add-ons
        //observeNotes();
        //parseNotes();

        //collapseBox(); // Make the details boxes collapsible
        //integratePopups(); // Integrate popups into the menus instead. Very very buggy.
    // Inventory table pages
    }else if(window.location.href.includes("/View")){
        tableExpand();
    }
});
// **************************/
// NOTES FIELD             */
// ************************/
function observeNotes(){
    var notesField = $("#Notes_input");

    const config = {childList: true, subtree: false, attributes: true, characterData: true};
    const callback = (mutationList, observer) => {
        for(const mutation of mutationList){
            console.log(mutation);
        }
    };
    const observer = new MutationObserver(callback);
    observer.observe(notesField[0], config);
    // observer.disconnect();
}
function controlNotes(){
    var notesBox = $("#1_Notes");

    const controlPanel = `<div id="jd-notes-controls"></div>`;
    notesBox.prepend($(controlPanel));

    const buttExpand = `<i id="jd-notes-expand" class="fa-regular fa-xl"></i>`;
    const buttConvert = `<i id="jd-notes-convert" class="fa-regular fa-xl"></i>`;

    $("#jd-notes-controls").append(buttExpand, buttConvert);

    $("#jd-notes-expand").on("click",function(){
        $("#Notes_input").height( $("#Notes_input").get(0).scrollHeight - 10);
    });
    $("#jd-notes-convert").on("click",function(){
        if($(this).hasClass("jd-notes-convert-triggered")){
           return;
        }else{
            parseNotes();

            $(this).addClass("jd-notes-convert-triggered");
        }
    });

}
function parseNotes(){
    const SPECS_DELIM = " :: ";
    const SPECS_SECT = "//Specifics";
    var notesBox = $("#1_Notes");
    var notes = $("#Notes_input");
    var notesTxt = notes[0].value;
    var specs;
    var trunc;
    console.log(notesTxt.length);
    try{
        specs = notesTxt.split(SPECS_SECT)[1].split("\n");
        trunc = notesTxt.split(SPECS_SECT)[0];

        if(debug) console.log("Specs: " + specs);
        if(debug) console.log("Trunc: " + trunc);
    }catch(e){
        console.log("Notes not loaded yet");
        return;
    }

    const specs_table = `<table id="jd-specs-table"><tbody id="jd-specs-tbody"> </tbody></table>`;
    const specs_table_header = `<tr id="jd-specs-table-header"><td colspan="2"> Item Specifics </td></tr>`;
    notesBox.append($(specs_table));
    $("#jd-specs-tbody").append($(specs_table_header));

    console.log(specs);
    for(var i = 1; i < specs.length; i++){
        var key = specs[i].split(" :: ")[0];
        var val = specs[i].split(" :: ")[1];
        var row = `<tr class="jd-specs-tr"><td>${key}</td> <td>${val}</td></tr>`;

        if(debug) console.log(specs[i]);
        if(debug) console.log(`\tKey: ${key}\n\tVal: ${val}`);
        $("#jd-specs-tbody").append($(row));
    }
    notes.val(trunc); // Remove extracted text from notes field
    $("#Notes_input").height('auto');
    $("#Notes_input").height( $("#Notes_input").get(0).scrollHeight - 10);
}

// **************************/
// POPUPS                  */
// ************************/
function integratePopups(){
    // Eventually override the real button's functionality
    var buttAdd = $("#btn_product_add");
    var trProduct = $("#AssetDetails tbody tr:nth-of-type(5)");

    // Add new button
    const butt_menu_html = "<i id='jd-popup-menu-butt' class='fa-regular fa-xl fa-square-plus'></i>";
    $("#AssetDetails tbody tr:nth-of-type(5) td:nth-child(2)").append(butt_menu_html);

    // Alter DOM to put popups in their own div
    const container_html =
          "<div id='jd-popup-container'>" +
          "</div";
    $(container_html).insertAfter(trProduct);
    var container = $("#jd-popup-container");

    // Get popups
    var pop_prod = $("#popup1");
    var pop_loc = $("#popupProductQty");

    container.append(pop_prod);

    // Add functionality to button
    var buttMenu = $("#jd-popup-menu-butt");
    buttMenu.on("click",function(){
        container.toggleClass("jd-popup-container-expanded");

        if(container.hasClass("jd-popup-container-expanded")){
            if(debug) console.log("Opening popup container");
            buttMenu.removeClass("fa-square-plus");
            buttMenu.addClass("fa-square-minus");
        }else{
            if(debug) console.log("Closing popup container");
            buttMenu.removeClass("fa-square-minus");
            buttMenu.addClass("fa-square-plus");
        }
    });

    // Add procedural CSS to header, otherwise heights need to be hard-coded.
    // this doesn't work because our custom CSS changes the margins first?
    // It thinks it's bigger than it has to be.
    $("<style type='text/css'>"+
      ".jd-popup-container-expanded{"+
        "height: " + Math.ceil($("#popup1").height()) + "px !important;" +
      "}"+
    "</style>").appendTo("head");

    $("#popup1").css({
        "all":"revert",
        "pointer-events":"none"
    });

    //CSS overwrites will occur here to keep cross-compatibility with
    // the unmodded site
    $("#popup1").addClass(".jd-popup");
}

// **************************/
// DEFAULT LOCATION        */
// ************************/
function defaultLocation(){
    var locBox = $("#process_location_list_");
    //var defButt = "<button id='jd-loc-menu-butt'>+</button>";
    var defButt = "<i id='jd-loc-menu-butt' class='fa-regular fa-xl fa-square-plus'></i>";
    locBox.before(defButt);


    $("#jd-loc-menu-butt").on("click",function(){
        $("#jd-loc-menu").toggleClass("jd-loc-menu-expanded");
        if($("#jd-loc-menu").hasClass("jd-loc-menu-expanded")){
            //$("#jd-loc-menu-butt").html("-");
            $("#jd-loc-menu-butt").removeClass("fa-square-plus");
            $("#jd-loc-menu-butt").addClass("fa-square-minus");
        }else{
            //$("#jd-loc-menu-butt").html("+");
            $("#jd-loc-menu-butt").removeClass("fa-square-minus");
            $("#jd-loc-menu-butt").addClass("fa-square-plus");
        }
    });

    // Generate button elements
    function locButt(text, click){
        return "<button id='jd-loc-butt-" + text + "' class='jd-loc-butt'>" + text + "</button";
    }
    var locMenu ="<div id='jd-loc-menu'></div>";
    locBox.before(locMenu);
    $("#jd-loc-menu").append(locButt("Ecommerce"));
    $("#jd-loc-menu").append(locButt("Dismantle"));
    $("#jd-loc-menu").append(locButt("Testing"));

    // Assign functionality to generated button elements
    function buttFunc(butt, location, sendTo){
        butt.on("click",function(){
            locBox.val(location).trigger("change");
            $("#Process_SendTo").val(sendTo);
            // Trigger the button to close it ezpz
            $("#jd-loc-menu-butt").trigger("click");
        });
    }

    buttFunc($("#jd-loc-butt-Ecommerce"),"Ecommerce","Resale");
    buttFunc($("#jd-loc-butt-Dismantle"),"TesterDismantle","Dismantle");
    buttFunc($("#jd-loc-butt-Testing"),"test-ignore","Testing");
}


function tableExpand(){
    // This won't hook properly since the table needs to load.
    // TODO: MutationObserver to wait for certain dx elements and THEN hook into this.
    // Should multithread to not block other tweaks (promises in js?)

    // Element to observe for mutations - its colgroup gets overwritten when the table loads.
    var rows = $("#gridAssets > .dx-gridbase-container > .dx-datagrid-rowsview > .dx-datagrid-content");

    //console.log(parent);
    //console.log(rows);

    var shifted;
    $(document).on("keyup keydown",function(e){
        shifted = e.shiftKey;
        if(debug) console.log("Shifted: " + shifted);
    });

    const config = {childList: true, subtree: false};
    const callback = (mutationList, observer) => {
        for(const mutation of mutationList){
            if(mutation.type === "childList"){
                if(debug) console.log(mutation);
                if(mutation.addedNodes.length > 0){
                    var addedNode = $(mutation.addedNodes[0]);
                    var td = addedNode.find("td");

                    // Set the initial column widths AWAY from "auto" so the transition fires properly
                    $(document).find("col").each(function(){
                        $(this).css("width",$(this).width() + "px");
                    });

                    // Original width of columns. Picks the third column to avoid the special ones at the start.
                    // Extra space should be filled by the final 'controls' column
                    const orgW = addedNode.find("col:nth-child(3)").width();

                    $(td).on("mouseenter",function(){
                        //
                        // EXCLUDE THESE COLUMNS
                        if($(this).index() + 1 == $(this).parent().children().length || $(this).index() == 0 || $(this).index() == 1){
                            if(debug) console.log("Skipping final column");
                            return; // Don't affect the last column
                        };
                        //
                        var row = $(this).parent().index();
                        var col = $(this).index();

                        var col_elements = addedNode.find("td:nth-child(" + parseInt(col + 1) + ")");
                        var maxW = 0; // Maximum width for all cells in the column
                        var tmpW = 0; // Width of currently-examined cell

                        // Find the maximum width of cells in the given column.
                        col_elements.each(function(index){
                            if($(this).children().length > 0){
                                tmpW = $(this).children().first().text().trim().length; // <a> includes like 50ch of whitespace?
                            }else{
                                tmpW = $(this).text().length;
                            }
                            if(tmpW > maxW) maxW = tmpW;
                        });

                        // Set the width of the column to be the width of its widest cell
                        //if(shifted){
                            var colstr = "col:nth-child(" + parseInt(col+1) + ")";
                            var newW = "calc("+maxW+"ch + 20px)";
                            addedNode.find(colstr).css("width", newW);
                            $(".dx-datagrid-headers").find(colstr).css("width", newW);
                        //}

                        if(debug) console.log("Max column width: " + maxW);
                    }).on("mouseleave",function(){
                        // Skip first 2 and last colums
                        if($(this).index() + 1 == $(this).parent().children().length || $(this).index() == 0 || $(this).index() == 1){
                            if(debug) console.log("Skipping final column");
                            return; // Don't affect the last column
                        };


                        const colstr = "col:nth-child(" + parseInt($(this).index() + 1) + ")";
                        var col = addedNode.find(colstr);
                        var headcol = $(".dx-datagrid-headers").find(colstr);

                        col.width(orgW);
                        headcol.width(orgW);
                    });
                }
            }
        }
    };
    const observer = new MutationObserver(callback);
    observer.observe(rows.get(0), config);
    // observer.disconnect();
}


// Add expanding cheatsheets for the R2v3 spec
function betterR2V3(){
    // Generate table row (w/ custom class) that contains the arguments as text
    function makeRow(left, right){
        var tmp = "<tr><td class='jd_r2_tr_left'><p>"+left+"</p></td><td class='jd_r2_tr_right'><p>"+right+"</p></td></tr>";
        return tmp;
    }

    // Generate the HTML and content for the tables
    var r2_costab =
      "<div id='jd_r2_coswrap'>"+
        "<table id='jd_r2_costab' class='jd_r2_tab'><tbody>"+
          makeRow("C9 - A","- New, unused, original packaging. <br>- No signs of wear or alteration") +
          makeRow("C8 - A","- New, out of box, unused equipment removed from original pakaging.<br>- No signs of wear") +
          makeRow("C7 - A","- Fully cleaned and cosmetically repaired with no blemishes.<br>- No missing parts") +
          makeRow("C6 - A","- May have light scratches/minor blemishes that have no impact on functionality.<br>- No Missing parts") +
          makeRow("C5 - B","- Minor scratches, dents, discoloration and/or surface imperfections from consistent use, good condition. No missing parts") +
          makeRow("C4 - C","- Scratches, minor dents/discoloration and/or other surface imperfections from consistent use, but equipment is in good condition overall.<br>- No damage to latches or hinges, nor any missing parts, panels, bezels, or covers") +
          makeRow("C3 - D","- Moderate use/age, multiple dents, discoloration, scratches.<br>- Damage to latches/hinges/keyboards.<br>- Some parts/panels may be missing") +
          makeRow("C2 - F","- Heavy use and age, significant belmeishes/dents, may require repair.<br>- Damages to latches, hinges, keyboards, etc.<br>- Critical parts are missing") +
          makeRow("C1 - F"," - Damaged & Not reusable") +
        "</tbody></table>" +
      "</div>";

    var r2_funtab =
      "<div id='jd_r2_funwrap'>"+
        "<table id='jd_r2_costab' class='jd_r2_tab'><tbody>"+
          makeRow("F6","- Verified functional.<br>- Repaired with original parts, original software.<br>- Zero defects") +
          makeRow("F5","- Verified functional.<br>- No hardware or software defects.")+
          makeRow("F4","- Hardware tested & Verified.<br>- All missing components/parts listed")+
          makeRow("F3","- Key functions working<br>Functions verified working, software may not be loaded/configured.<br>- May be missing non-essential components<br>- All missing parts/components listed")+
        "</tbody></table>" +
      "</div>";

    // Append the generated content to the r2 drop-down tables
    var cos_tr = $("#r2v3 > table > tbody > tr:nth-child(1)");
    cos_tr.append(r2_costab);
    var fun_tr = $("#r2v3 > table > tbody > tr:nth-child(2)");
    fun_tr.append(r2_funtab);

    // Add the class that triggers the element to be revealed via CSS.
    // Event listener hooks to the current r2 info icon for ease.
    //$("#r2v3_cosmetic_chosen + a").on("click",function(){
    $("#r2v3 tr:nth-child(1) a") .on("click",function(){
        var tmp = $("#jd_r2_coswrap");
        tmp.toggleClass("jd_r2_expand_cos");
        if(tmp.hasClass("jd_r2_expand_cos")){
            $("#jd_r2_coswrap").css("height",$("#jd_r2_coswrap").children().height());
        }else{
            $("#jd_r2_coswrap").css("height","0px"); // Can't just hide it since it has transitions
        }
    });
    $("#r2v3 tr:nth-child(2) a") .on("click",function(){
        var tmp = $("#jd_r2_funwrap");
        tmp.toggleClass("jd_r2_expand_fun");
        if(tmp.hasClass("jd_r2_expand_fun")){
            console.log("foo");
            $("#jd_r2_funwrap").css("height",$("#jd_r2_funwrap").children().height());
        }else{
            $("#jd_r2_funwrap").css("height","0px");
        }
    });
}

function charCount(){
    console.log("[USERSCRIPT TWEAKS] - charCount");
    var charCount = '<div id="jd-charcount-wrapper"><p id="jd-charcount">0</p><p id="jd-charmax">/80</p></div>';

    var content = $('#popup1 .content');
    var manu = $('#add_product_manufacturer');
    var model = $('#add_product_model');
    var part = $('#add_product_part');

    content.prepend(charCount);

    manu.keyup(updateCount);
    model.keyup(updateCount);
    part.keyup(updateCount);

    function updateCount(){
        var total = 0;
        // Count the concatenation whitespace added after submission
        if(model.val().length > 0) total += model.val().length + 1;
        if( manu.val().length > 0) total += manu.val().length + 1;
        total += part.val().length;

        $('#jd-charcount').text(total);
        $('#jd-charcount-wrapper').css('background-color', (total > 80 ? 'red' : 'unset'));
    }
}
function expandNotes(){
    if(debug) console.log("[USERSCRIPT TWEAKS] - expandNotes");
    //expaaaaand();

    // $("#Notes_input").on('input propertychange change', function(){
    //     if(debug) console.log("[USERSCRIPT TWEAKS] - expandNotes caught change in value");
    //     expaaaaand();
    // });
    $("#Notes_input").on("input change", function(){
        //expand();
        $("#Notes_input").height('auto');
        if(debug) console.log("Setting notes height to " + ($("#Notes_input").get(0).scrollHeight - 10));
        $("#Notes_input").height( $("#Notes_input").get(0).scrollHeight - 10); // ScrollHeight seems to add extra space. idk
    });

    function expand(){ // Stackoverflow told me this fixes it. Nobody there knew why, neither do I. <3 web dev
        $("#Notes_input").height('auto');
        if(debug) console.log("Setting notes height to " + ($("#Notes_input").get(0).scrollHeight - 10));
        $("#Notes_input").height( $("#Notes_input").get(0).scrollHeight - 10); // ScrollHeight seems to add extra space. idk
    }
}

// Center tags are nasty, we're just going to kill that.
// CSS tweaks rely on this change as well
function fixHeader(){
    $('.ip_header').append($('#header_logo'));
    $('#header_logo').append($('#div_layout_search'));
}