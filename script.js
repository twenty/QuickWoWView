// Modify the below to add / remove forums or customise the button.
const mergeObject = [{
    "domain": "us.forums.blizzard.com",
    "replacement": "worldofwarcraft.com/en-us",
    "code": "us"
}, {
    "domain": "eu.forums.blizzard.com",
    "replacement": "worldofwarcraft.com/en-gb",
    "code": "eu"
}];
const buttonProperties = {
    "text": "View Char.",
    "styles": [
        "font-size: 11px;",
        "background: #00aeff;",
        "color: #211811;",
        "font-weight: bold;",
        "padding: 5px 10px;",
        "border-radius: 10px;",
    ]
};
const loadedClassName = "WoWQV--loaded";
// Okay, stop editing.


chrome.runtime.onMessage.addListener( (request, sender, sendResponse) => {
    // The user is now viewing a topic, lets try and add our buttons
    init(true);
});

let _initTimeout_ = null;
let waitTime = 1000;
let attemptCount = 1;
// For first page load, let's add our buttons.
init(false);

// fromAjaxEvent will determine whether we should wait to try and load the buttons.
function init( fromAjaxEvent ) {
    const $$profileImages = document.querySelectorAll(".trigger-user-card.main-avatar");
    // If the data hasn't loaded yet (no profileImages) and it's from an ajaxEvent (called via onMessage function),
    // we'll try to wait 1 second up to 10 attempts
    if( $$profileImages.length === 0 && fromAjaxEvent && attemptCount <= 10 ) {
        // Let's wait
        _initTimeout_ = setTimeout( waitForDataFn, (waitTime * attemptCount) );
    } else {
        if( _initTimeout_ !== null ) {
            clearTimeout( waitForDataFn );
            _initTimeout_ = null;
        }
        processPosts( $$profileImages );
    }
}

function waitForDataFn() {
    init( true );
    attemptCount++;
}

function processPosts( $$profileImages ) {
    // We'll add a button directly below the posters avatar, lets go through all the profiles and retrieve some important info first.
    // Lets find out what domain we're on and retrieve the appropriate replacement domain in order to generate our HREF
    const currentDomain = location.hostname;
    let replacementProperties = null;
    mergeObject.some( obj => {
        if( currentDomain === obj.domain ) {
            replacementProperties = obj;
            return true;
        }
    });
    $$profileImages.forEach( ( profileImage, idx ) => {
        // We'll render the button in the next sibling but can be anywhere we like.
        if( !profileImage.classList.contains( loadedClassName )) {
            const renderEl = profileImage.nextSibling;
            if( renderEl && renderEl.classList.contains( "poster-avatar-extra" ) ) {
                // Lets extract some important information
                let userCard = profileImage.getAttribute( "data-user-card" );
                if( userCard ) {
                    let [characterName, realm] = getNameAndRealm(userCard);
                    if( characterName && realm ) {
                        // Let's add a button
                        const buttonHref = `${location.protocol}//${replacementProperties.replacement}/character/${replacementProperties.code}/${realm}/${characterName}`;
                        const button = createEl("A", buttonProperties.text, {
                            "href": buttonHref,
                            "style": buttonProperties.styles.join(""),
                            "target": "_blank"
                        });
                        renderEl.appendChild( button );
                        renderEl.style.display = "block";
                    }
                }
            }
            profileImage.classList.add( loadedClassName );
        }
    });
}

// Simple function to create an element with 0 or more attributes.
function createEl(type, innerText, attributes) {
	let el = document.createElement(type);
	if(typeof innerText !== "undefined" && innerText !== null) {
		el.innerText = innerText;
	}
	if(typeof attributes !== "undefined" && attributes !== null) {
		let keys = Object.keys(attributes);
		for(let ii = 0; ii < keys.length; ii++) {
			el.setAttribute(keys[ii], attributes[keys[ii]]);
		}
	}
	return el;
}

// Formats the realm and character name information so we can use it in our HREF value
function getNameAndRealm( userCard ) {
    let dataProperties = userCard.split("-");
    let [characterName, realm] = [dataProperties[0], dataProperties[1]];
    if( dataProperties.length > 2 ) {
        // Realm with a dash i.e. defias-brotherhoode
        realm += `-${dataProperties[2]}`;
    }
    return [characterName, realm];
}