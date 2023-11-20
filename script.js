/*
    This file is part of the mbajdik.github.io Github Pages repository
    Copyright (C) 2023  github.com/mbajdik

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

// parsing the metadata variable (imported script from info/metadata.js) which should contain all the info about the sources and etc.
var json_root = JSON.parse(metadata);

/*
 * #  #   #  #  #####  #    #    #      #  #####    #    #####  #   ###   #   #
 * #  ##  #  #    #    #   # #   #      #     #    # #     #    #  #   #  ##  #
 * #  # # #  #    #    #  #   #  #      #    #    #   #    #    #  #   #  # # #
 * #  #  ##  #    #    #  #####  #      #   #     #####    #    #  #   #  #  ##
 * #  #   #  #    #    #  #   #  #####  #  #####  #   #    #    #   ###   #   #
*/
function initialize() {
    //console.log(JSON.stringify(json_root))
    addCategories(json_root.categories);
    addEntries(json_root.entries);
    addTitle();
    openEntryFromUrlHash();
    generateSizes();
    registerEvents();
}

/*
 * Add category titles and divs for the links
*/
function addCategories(json) {
    for (var i = 0; i < json.length; i++) {
        // extract data
        var category = json[i];
        var category_name = category.name;
        var category_id = category.id;
        //console.log(`category:${category_id};category_name:${category_name}`);;

        // creating title element
        var title = document.createElement("h2");
        title.innerHTML = `${category_name}`;
        title.classList.add("__category_title");

        // creating list element
        var list = document.createElement("div");
        list.classList.add("__category_container");
        list.id = category_id;

        // adding to content div
        var content = document.getElementById("__content");
        content.appendChild(title);
        content.appendChild(list);
    }
}

/*
 * Add all entry buttons to the document
*/
function addEntries(json) {
    for (var i = 0; i < json.length; i++) {
        // extract data
        var entry = json[i];
        var entry_name = entry.name;
        var entry_id = entry.id;
        var entry_category = entry.category;
        //console.log(`entry:${entry_id};entry_name:${entry_name};entry_type:${entry_type};entry_category:${entry_category}`);;

        // creating opening link element
        var opener = document.createElement("h3");
        opener.innerHTML = `<span onclick="setCurrentEntry('${entry_id}');">→ ${entry_name}</span>`;
        opener.classList.add("__details_opener");
        opener.style.cursor = "pointer";

        // add to document
        document.getElementById(entry_category).appendChild(opener);
    }
}

/*
 * Add title (the one IN the html, not the tab title) alongside with tags
*/
function addTitleElement() {
    // get data from json
    var title = json_root.title;
    var tags = ``;
    for (var i = 0; i < json_root.tags.length; i++) {
        tags += `<div class="__tag"><p>${json_root.tags[i]}</p></div>`;
    }

    // creating element in document
    document.getElementById("__title").innerHTML = `<h1>${title}</h1>${tags}`
}

/*
 * Set the tab/page's title
*/
function setSiteTitle(prefix) {
    // get data from json
    var title = json_root.title;
    var page_title_tag = "";
    var page_title_prefix = "";
    if (json_root.tags.length > 0) page_title_tag = `(${json_root.tags[0]})`;
    if (prefix != null) page_title_prefix = `${prefix} - `

    // setting title of page
    document.getElementById("__pagetitle").innerHTML = `${page_title_prefix}${title} ${page_title_tag}`
}

/*
 * A wrapper function for setting the title (in the html and the title of the tab)
*/
function addTitle() {
    addTitleElement();
    setSiteTitle(null);
}




/*
 * #   #  #####  #      ####   #####  ####    ####
 * #   #  #      #      #   #  #      #   #  #    
 * #####  #####  #      ####   #####  ####    ### 
 * #   #  #      #      #      #      #  #       #
 * #   #  #####  #####  #      #####  #   #  #### 
*/
/*
 * Get type name by id from metadata
*/
function getTypeName(typeID) {
    for (var i = 0; i < json_root.types.length; i++) {
        var type = json_root.types[i];
        if (type.id != typeID) continue;
        return type.name;
    }
    return "";
}

/*
 * Get category name by id from metadata
*/
function getCategoryName(categoryID) {
    for (var i = 0; i < json_root.categories.length; i++) {
        var category = json_root.categories[i];
        if (category.id != categoryID) continue;
        return category.name;
    }
    return "";
}

/*
 * Util function to get the entry json object from the metadata file
*/
function getEntry(entryID) {
    for (var i = 0; i < json_root.entries.length; i++) {
        var entry = json_root.entries[i];
        if (entry.id != entryID) continue;
        return entry;
    }
    return null;
}

/*
 * Util function to get whether an entry is declared in the metadata file
*/
function entryExists(entryID) {
    for (var i = 0; i < json_root.entries.length; i++) {
        var entry = json_root.entries[i];
        if (entry.id != entryID) continue;
        return true;
    }
    return false;
}




/*
 * #####  #   #  #####  ####   #  #####   ####
 * #      ##  #    #    #   #  #  #      #    
 * #####  # # #    #    ####   #  #####   ### 
 * #      #  ##    #    #  #   #  #          #
 * #####  #   #    #    #   #  #  #####  #### 
*/
/*
 * Open the requested item
*/
function openEntry(entryID) {
    // get entry and check it
    var entry = getEntry(entryID);
    if (entry == null) return;

    // fetch info
    var entry_name = entry.name;
    var entry_category_name = getCategoryName(entry.category);
    var entry_type_name = getTypeName(entry.type);
    var entry_attachments = "";

    // get attachments 
    if (entry.hasOwnProperty("attachments")) {
        var attachments = "";
        for (var i = 0; i < entry.attachments.length; i++) {
            var attachment = entry.attachments[i];
            var attachment_name = attachment.name;
            var attachment_type = attachment.type;
            var attachment_source = attachment.source;

            if (attachment_type == "img") {
                attachments += `<div class="__attachment __attachment_img" onclick="openImage('${attachment_source}', '${attachment_name}');"><p>🖼 ${attachment_name}</p></div>`
            } else if (attachment_type == "yt") {
                attachments += `<div onclick="openYoutube('${attachment_source}');" class="__attachment __attachment_yt"><p>▶ ${attachment_name}</p></div>`
            } else {
                attachments += `<div onclick="openURL('${attachment_source}');" class="__attachment __attachment_link"><p>📁 ${attachment_name}</p></div>`
            }
        }
        entry_attachments = `<div class="__attachments">${attachments}</div>`
    }

    // empty the description so it looks better
    document.getElementById("__internal_details_description").innerHTML = ""

    // set window to this entry
    document.getElementById("__internal_details_title_bar").innerHTML = `<h1>${entry_name}</h1><div class="__tag"><p>${entry_type_name}</p></div><div class="__tag"><p>${entry_category_name}</p></div>`;
    fetch(entry.source).then(function (response) {return response.text();}).then(function (html) {document.getElementById("__internal_details_description").innerHTML = `${html}<br>${entry_attachments}<br><br><br>`;});

    // show "window"
    setEntryVisible(true);

    // set title of page
    setSiteTitle(entry_name);
}

/*
 * Use this method to set the current entry (this way the event handler will make the window load; and it wont run twice)
*/
function setCurrentEntry(entryID) {
    window.location.hash = `#${entryID}`
}

/*
 * Open previous entry if possible
*/
function prevEntry() {
    var hash = window.location.hash.replace("#", "");
    for (var i = 0; i < json_root.entries.length; i++) {
        var entry = json_root.entries[i];
        if (entry.id != hash) continue;

        var index = i - 1;
        if (index < 0) return
        setCurrentEntry(json_root.entries[index].id);
    }
}

/*
 * Open next entry if possible
*/
function nextEntry() {
    var hash = window.location.hash.replace("#", "");
    for (var i = 0; i < json_root.entries.length; i++) {
        var entry = json_root.entries[i];
        if (entry.id != hash) continue;

        var index = i + 1;
        if (index >= json_root.entries.length) return;
        setCurrentEntry(json_root.entries[index].id);
    }
}

/*
 * When a new site is open or just going back, this function opens/closes the things 
*/
function openEntryFromUrlHash() {
    // get hash
    var hash = window.location.hash;

    // content gets closed
    closeContent();

    // check if it has an entry open
    if (hash == "" || hash == "#") {
        closeEntryWindow();
        return;
    }

    // get hash without hash
    var hash_value = hash.replace("#", "");

    // if entry doesn't exist then just make a possible window disappear
    if (!entryExists(hash_value)) {
        closeEntryWindow();
        return;
    }

    openEntry(hash_value);
}

/*
 * Wrapper function to close and clear the description window
*/
function closeEntryWindow() {
    setEntryVisible(false);
    clearEntryDescription();
    setSiteTitle(null);
}

/*
 * Close entry description window (only used with the close button) - the event handler does most of the stuff
*/
function closeEntry() {
    // changing the hash
    window.location.hash = ""    
}

/*
 * Utility to make the description window visible or hide it 
*/
function setEntryVisible(bool) {
    document.getElementById("__details_window_state").checked = bool;
}

/*
 * Clear the description in case the connection is lost (so the text wont stay there)
*/
function clearEntryDescription() {
    document.getElementById("__internal_details_description").innerHTML = "";
}





/*
 *  ###   #   #  #####  ####   #        #    #   #        #    #   #  ####        ####   ###   #   #  #####  #####  #   #  #####
 * #   #  #   #  #      #   #  #       # #    # #        # #   ##  #  #   #      #      #   #  ##  #    #    #      ##  #    #  
 * #   #  #   #  #####  ####   #      #   #    #        #   #  # # #  #   #      #      #   #  # # #    #    #####  # # #    #  
 * #   #   # #   #      #  #   #      #####    #        #####  #  ##  #   #      #      #   #  #  ##    #    #      #  ##    #  
 *  ###     #    #####  #   #  #####  #   #    #        #   #  #   #  ####        ####   ###   #   #    #    #####  #   #    #  
*/
/*
 * Utility to make overlays (yt video, image) visible or hide it 
*/
function setContentVisible(bool) {
    document.getElementById("__overlay_window_state").checked = bool;
}

/*
 * Close overlay window and clear the innerHTML for the next time (the old stuff wont be there)
*/
function closeContent() {
    // hide the window
    setContentVisible(false);

    // remove iframe so it won't hog performance
    document.getElementById("__internal_overlay_content").innerHTML = ""
}

/*
 * Just open a Youtube video
*/
function openYoutube(videoID) {
    // create yt video link
    var ytlink = `<iframe id="__ytvideo" width="560" height="315" src="https://www.youtube.com/embed/${videoID}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`
    
    // add to document
    document.getElementById("__internal_overlay_content").innerHTML = ytlink;

    // set visible
    setContentVisible(true);
}

/*
 * Open image
*/
function openImage(source, text) {
    // create element
    var img = `<img id="__image" src="${source}" alt="${text}"></img>`

    // add to document
    document.getElementById("__internal_overlay_content").innerHTML = img;

    // set it visible
    setContentVisible(true);
}

/*
 * Open url, used with attachments
*/
function openURL(url) {
    window.open(url, "_blank");
}




/*
 * #####  #   #  #####  #   #  #####   ####        #    #   #  ####       #####  #####   ####
 * #      #   #  #      ##  #    #    #           # #   ##  #  #   #      #        #    #    
 * #####  #   #  #####  # # #    #     ###       #   #  # # #  #   #      #####    #    #    
 * #       # #   #      #  ##    #        #      #####  #  ##  #   #      #        #    #    
 * #####    #    #####  #   #    #    ####       #   #  #   #  ####       #####    #     ####
*/
/*
 * Wrapper function for registering all events
*/
function registerEvents() {
    registerSizeListener();
    registerWindowCloseListener();
    registerWindowHashChangeListener();
}

/*
 * Generate viewport size without 
*/
function generateSizes() {
    // get data from document
    var vh = window.innerHeight * 0.01;
    var vw = window.innerWidth * 0.01;

    // set variable value
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    document.documentElement.style.setProperty('--vw', `${vw}px`);
    //console.log(`vw:${vw};vh:${vh}`);
}

/*
 * Function to register an event to regenerate when window is resized 
*/
function registerSizeListener() {
    window.addEventListener('resize', () => {
        generateSizes();
    })
}

/*
 * Function to register an event to add a history state 
*/
function registerWindowCloseListener() {
    document.getElementById("__details_window_state").addEventListener('change', (event) => {
        if (!event.currentTarget.checked) {
            closeEntry();
        }
    })
}

/*
 * Function to register an event to go back to appropriate entry when pressing back or loading a new url
*/
function registerWindowHashChangeListener() {
    window.addEventListener('hashchange', () => {
        // try to open the entry or close the window (if hash is empty string)
        openEntryFromUrlHash();
    });
}
