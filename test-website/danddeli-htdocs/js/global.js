/*
	
	Tufts Global Javascript Functions
	ISITE Design

*/

var TUFTS_SETTINGS = {
	slideshowspeed 	: 7000, // speed in milliseconds between image rotation
	datestore 		: "", // for submit event
	endset			: false,
	gallery			: 	{
							"mini" 		: { mw : 170, mh : 134 }, // sizes also restricted in CSS
							"default" 	: { mw : 612, mh : 360 },
							"thumb" 	: { mw : 80, mh : 80 },
							"captions"	: { show : "Show Captions", hide : "Hide Captions" },
							"actions"	: { play : "Play", pause : "Pause" }
						}
};

// settings
var $j = jQuery.noConflict(); 


jQuery(document).ready(function() {

	$j('html').addClass('js');
	$j('.input-setter').inputSetter();
	
	TUFTS.slideshow();
	TUFTS.carousel('.home .carousel');
	TUFTS.tabIt('.block-tabs');
	TUFTS.globalNav('#nav');
	TUFTS.equalCols('#nav');
	TUFTS.homeFeature('body.home #homeFeature, body.home #homeFeature-secondary');
	TUFTS.quicklinks();
	
	if (jQuery.browser.msie) {
		TUFTS.ie();
	}
	
	// set width on story images
	TUFTS.buildCallouts();

	// set width on story images
	TUFTS.setCalloutWidth();
	

	// jump menu implementation (left nav), not calendar filter
	jQuery(".block.quicklinks input").click(function() {
		window.location = jQuery("select", jQuery(this).parent()).val();
		return false;
	});
	
	// faq expand/collapse
	TUFTS.enableExpand("dl.collapsible");
	
	if( $j('.content').children('#gmap-input').length > 0) {
		$j('#gmap-input').parents('.callout').width(612);
	}
	
	if(jQuery("div.faces-listing a.faces-trigger").length) {
		var left = jQuery("div.faces-listing").offset().left,
			top = jQuery("div.faces-listing").offset().top,
			footer = jQuery('.faces-listing').next().addClass('faces-listing-footer').css({clear: 'both'});
		
		jQuery('.wrapper-content,#wrapper').append('<span class="clear"></span>');
		jQuery('#primary').append(jQuery('.faces-listing-footer'));

	}
	jQuery("div.faces-listing a.faces-trigger,div.faces-list-fields").bind("mouseenter mouseleave focus blur",function(e){
		var content = jQuery(this).is(".faces-list-fields") ? jQuery(this) : jQuery(this).parents(".item").find(".faces-list-fields");			
		if(e.type == "mouseenter" || e.type == "focus") {
			jQuery("div.faces-listing").appendTo('body').css({
				'position': 'absolute',
				'left': left + 'px',
				'top': top + 'px',
				'font-size': '1.2' + 'em',
				'margin-top': 0 + 'px'	
			});
			
			var facesHeight = jQuery('.faces-listing').height(),
				facesHeightMargin = facesHeight + 42;
				
			jQuery('#primary').append(jQuery('.faces-listing-footer'));
			jQuery('.faces-listing-footer').css({
				'margin-top': facesHeightMargin + 'px'
			});
			
			content.parents(".item").css("zIndex","9000");
			jQuery("div.faces-list-fields").not(content).hide().parents(".item").css("zIndex","1");
			content.show();	
		}
		if(e.type == "blur" || (e.type == "mouseleave" && jQuery(this).is(".faces-list-fields"))) {
			jQuery("div.faces-listing").appendTo('#primary').css({
				'position': 'relative',
				'left': 0,
				'top': 0,
				'font-size': 1 + 'em',
				'margin-top': 14 + 'px'	
			});
			
			jQuery("div.faces-list-fields").hide().parents(".item").css("zIndex","1");
			jQuery('#primary').append(jQuery('.faces-listing-footer'));
		}		
	});
	
	$j('.calendar-listing li:nth-child(even)').addClass('even');
	
	
	// init gallery
	TUFTS.gallery();
	
	// ticker
	if (jQuery('body.home').length) { TUFTS.Ticker(); }
	
});

//  Global pause function (for animations)
jQuery.fn.pause = function(duration) {
	$j(this).stop().animate({ dummy: 1 }, duration);
	return this;
},

// Input setter - pulls label sets as default value on related input.  If no label, looks for default value.
jQuery.fn.inputSetter = function(lower) {
	return this.each(function() {
		var $input = jQuery(this),
			$label = jQuery("label[for='"+$input.attr("id")+"']"),
			hideLabel = true,
			labelText, defaultText;
		if (($label.length && !this.value) || (this.value === $label.text())){
			labelText =  $label.text();
		} else {
			hideLabel = false;
			labelText = this.value ? this.value : false;
		}
		if (labelText) {
			defaultText = lower && lower==1 ? labelText.toLowerCase() : labelText;
			if (hideLabel) { $label.hide(); }
			$input.is('input') ? $input.val(defaultText).addClass('settered') : $input.text(defaultText).addClass('settered');
			$input.focus(function() { if (this.value == defaultText) { this.value = ""; } })
				  .blur(function() { if (!this.value.length) { this.value = defaultText; } });
		} 
	});
};

// TUFTS object
var TUFTS = {

	// init slideshow, either auto cycle or add prev/next buttons
	slideshow : function() {
		if (jQuery(".slideshow").length == 0) return;
		
		// wait for window to complete to be sure images are loaded for ie
		jQuery(window).load(function() {
			var imagecount = jQuery(".slideshow li img").length;
			var imageloads = 0;
			var autoheight = TUFTS.maxHeight(jQuery(".slideshow li img"));
			//var autoheight = 325;

			jQuery(".slideshow li").css({ height: autoheight + "px" });
			
			//this is experimental
			//jQuery(".slideshow li:not(:first-child) img").css({ maxHeight: 100 + "%", width: 'auto' });

			var wrapheight = jQuery(".slideshow").height();
			jQuery(".slideshow").css({ height: wrapheight }); // prevent browser jump from DOM manipulation
			setInterval('TUFTS.autoSlideshow()',TUFTS_SETTINGS.slideshowspeed);	
			
		});
		
	},


	quicklinks: function(){
		jQuery('.block-quicklinks ul').hide();
		jQuery('.block-quicklinks h4').click(
			function(){
				jQuery(this).toggleClass('active');
				jQuery('.block-quicklinks ul').slideToggle();
				return false;
			}
		);
	},
	
	// start auto cycle
	autoSlideshow: function() {
		var $on = $j(".slideshow li:visible");
		var $toshow = $on.next().length != 0 ? $on.next() : $j(".slideshow li:first");
		TUFTS.imageFade($on, $toshow);
	},
	// fade between two images and execute callback
	imageFade: function(fo, fi, cb) {
		var callback = cb || function() { };
		fo.fadeOut("slow", function() {
			callback.apply();
			fi.fadeIn("slow");
		});
	},
	
	// start slideshow with navigation, build navigation	
  	insertSlideshowNav : function() {

  		var total = jQuery(".slideshow li").length;
  		jQuery(".slideshow ul").after('<div class="nav-slideshow"><a class="prev off" href="#">&laquo;</a> <span class="currentitem">1</span> of <span class="totalitems">' + total + '</span> <a class="next" href="#">&raquo;</a></div>');

  		jQuery(".slideshow .nav-slideshow a").click(function() {

  			if (jQuery(this).is(".off")) return false;

  			var $this = jQuery(this);
			var $parent = $this.parents(".slideshow");
			var action	= $this.attr("class").split(" ")[0];
			var $on		= $parent.find("li:visible");
			var $toshow	= action == "next" ? $on.next() : $on.prev();

			var i = jQuery.inArray($toshow.get(0), jQuery.makeArray($parent.find("li"))) + 1;
			
			TUFTS.imageFade($on,$toshow,function(){
				jQuery(".currentitem").text(i);
				$parent.find("a.prev,a.next").removeClass("off");
				if(i==$parent.find("li").length) $parent.find("a.next").addClass("off");
				if(i==1) $parent.find("a.prev").addClass("off");				
			});
						
			return false;
														
		});		
		
	},
	
	// ensure embeds have proper wmode set
	setWmode : function(text) {
		return text.replace('<embed','<param value="transparent" name="wmode"></param><embed wmode="transparent" ');

	},
	
	// get max height of set of $elements
	maxHeight: function($els) {
		var h = 0;
		$els.each(function() {
			h = h < parseInt($j(this).height()) ? parseInt($j(this).height()) : h;
		});
		return h;
	},
	
	// build callout borders
	buildCallouts : function() {
		
		var html = {
			open : '<div class="callout"><div class="content"><div class="t"></div>',
			close: '</div><div class="b"><div></div></div></div>'
		};

		//jQuery("#content img").each(function(){ /* console.log(jQuery(this).attr("src")); */ });

		jQuery("#content img").not(".news img").not("img.icon").not("img.noborder").not(".faces-list-fields img").each(function() {
			if (jQuery(this).parents(".callout").length == 0) {
				var $el = jQuery(this).parent("a") || jQuery(this);				
				var obj = $el.wrap('<div></div>').parent().html();				
				$el.parent().replaceWith(html.open + obj + html.close);							
			}		
		});
		
	},
	
	// set width of bottom corner for ie
	setCalloutWidth : function() {		
		// wait for window to complete to be sure images are loaded for ie
		jQuery(window).load(function() {
			// $("#page-newsandmedia .callout.left,#page-newsandmedia .callout.right, .wide .callout.left, .wide .callout.right")
			jQuery(".picture.left, .picture.right").not(".slideshow-news, #page-home .callout, .callout.portrait").each(function(i) {
				var imagewidth = parseInt(jQuery(this).find("img:first").width());
				jQuery(this).find(".b").css({ width: imagewidth + 20 + "px" });
				var fullwidth = jQuery(this).find(".callout").css({ width: imagewidth + "px" }).outerWidth(true);
				jQuery(this).css({ width: fullwidth + "px" });						
			});
			
			jQuery(".picture.right").not(".slideshow-news, #page-home .callout, .callout.portrait").each(function(i) {
				jQuery(this).css({marginRight: 18 + 'px', marginLeft: 18 + 'px'});
			});
			
			jQuery(".picture.center").not(".slideshow-news, #page-home .callout, .callout.portrait").each(function(i) {
					jQuery(this).css({ width: 100 + "%" });	
					jQuery(this).find(".b").css({ width: 100 + "%" });		
					jQuery(this).find(".callout").css({ width: 100 + "%" });					
					jQuery(this).find("img:first").css({ width: 100 + "%" });				
			});
			
			jQuery("#primary .picture.banner").not(".slideshow-news, #page-home .callout, .callout.portrait, .right").each(function(i) {
					jQuery(this).css({ width: 667 + "px" });	
					jQuery(this).find(".b").css({ width: 667 + "px" });		
					jQuery(this).find(".callout").css({ width: 667 + "px" });					
					jQuery(this).find("img:first").css({ width: 667 + "px" });				
			});
			
			jQuery("#lead .picture").not(".slideshow-news, #page-home .callout, .callout.portrait, .right").each(function(i) {
					jQuery(this).css({ width: 693 + "px" });	
					jQuery(this).find(".b").css({ width: 693 + "px" });		
					jQuery(this).find(".callout").css({ width: 693 + "px" });					
					jQuery(this).find("img:first").css({ width: 693 + "px" });				
			});
			
			
			jQuery("#secondary .callout").each(function(i) {
				if (jQuery(this).parents('div.block-newsevents').length > 0) { 
					jQuery(this).find("img").css({ width: 'auto' });
				} else if (jQuery(this).has('.gallery-mini').length > 0) {
					jQuery(this).css({width: 171 + 'px'});
				}
				else { 
					jQuery(this).find("img").css({ width: 177 + "px" });
				}
			});
			
			
			jQuery(".news .callout").not(".slideshow-news, #page-home .callout, .callout.portrait").each(function(i) {
				var imagewidth = parseInt(jQuery(this).find("img:first").width());
				jQuery(this).find(".b").css({ width: imagewidth + 20 + "px" });
				var fullwidth = jQuery(this).find(".content").css({ width: imagewidth + "px" }).outerWidth(true);
				jQuery(this).css({ width: fullwidth + "px" });	
				jQuery(this).children('p.caption:empty').hide();					
			});
			
			jQuery(".picture, .callout").each(function(i) {
				jQuery(this).find("p.caption:empty").hide();					
			});
			
		});
	},
	
	// create open/close. receives dl.
	enableExpand : function(el) {
		
		if(!jQuery(el).length) { return; }
		// flags for animation helpers
		var moving = 0,
			allmoving = 0;
		
		jQuery(el).find("dd").hide();
		jQuery(el).find("dt").prepend('<span class="state">+</span> ').wrapInner('<a href="#"></a>').click(function(e){
			if(moving == 0) {
				if(jQuery(e.target).is("a")) { moving = 1; }
				var textinsert = jQuery("span.state",this).text() == "+" ? "-" : "+";
				jQuery(this).toggleClass("open").next("dd").slideToggle("fast",function(){
					moving = 0;
					allmoving = 0;
					updateStatus();
				}).end().find("span.state").text(textinsert);	
			}
			return false;
		});	
		
		var showtext = { show : "Show All", hide : "Hide All" };
		jQuery('<a class="revealer show" href="#">'+showtext.show+'</a>').insertBefore(el).click(function(){
			if(allmoving == 0) {
				allmoving = 1;
				var action = jQuery(this).is(".show");
				jQuery(this).next("dl.collapsible").find(action ? "dt:not(.open)" : "dt.open").click().end().end().toggleClass("show").toggleClass("action-hide").text(showtext[action ? "hide" : "show"]);	
			}
			return false;
		});
		
		var updateStatus = function(){
			
			var obj			= jQuery(el)
				count 		= obj.find('dt').length,
				countopen 	= obj.find('dt.open').length,
				visible		= countopen == count,
				hidden		= countopen == 0;
				
			if(visible || hidden) {
				var classaction = visible ? "removeClass" : "addClass",
					text		= visible ? showtext.hide : showtext.show;								
				obj.prev('a.revealer')[classaction]('show').text(text);				
			}
						
		};
		
	},
	
	
	//  Equalize height of #nav submenus
	equalCols: function(el) {
		$j(el).each(function() {
			var thisHeight = 0;
			$j(el).find('ul').each(function() {
				if ($j(this).height() > thisHeight) {
					thisHeight = $j(this).height();
				}
			});
			$j(el).find('ul').css('min-height', thisHeight);

		});
	},
	carousel: function(el) {
		var viewable = 4; // The number of slides that will show at one time
		var obj = $j(el);
		var ul = obj.find('ul');
		var li = ul.find('li');
		var eachPad = parseInt(li.css('paddingRight')) + parseInt(li.css('paddingLeft'));
		var eachWidth = obj.find('li:first').width() + eachPad;
		var num = li.length;
		if (num < viewable * 2) {
			var distanceNum = 1;
			var distance = eachWidth;
		} else {
			distanceNum = viewable;
			var distance = eachWidth * viewable;
		}
		ul.wrap('<div class="slider">');
		var slider = obj.find('.slider');
		if (num > 4) {
			ul.css('width', (eachWidth * num * 2));
			slider.css('width', eachWidth * viewable);
			obj.prepend('<a class="carousel-arrow c-prev" href="#"></a>').append('<a class="carousel-arrow c-next" href="#"></a>');
			//  Previous button click
			obj.find('.c-prev').bind('click', function(event) {
				event.preventDefault();
				$j(this).bind('mouseup', function() { $j(this).blur(); });
				var last4 = ul.find('li:gt(' + (num - viewable - 1) + ')');
				if (!ul.is(':animated')) {
					last4.clone().prependTo(ul);
					ul.css('left', -distance);
					ul.stop().animate({
						left: 0
					}, 500, function() {
						last4.remove();
					});
				}
			});
			//  Next button click
			obj.find('.c-next').bind('click', function(event) {
				event.preventDefault();
				$j(this).bind('mouseup', function() { $j(this).blur(); });
				ul.stop().animate({
					left: -distance
				}, 500, function() {
					var first4 = ul.find('li:lt(' + distanceNum + ')');
					first4.clone().appendTo(ul);
					ul.find('li:lt(' + distanceNum + ')').remove();
					ul.css('left', 0)
				});
			});
		}
	},
	//  Universal tab creator function
	//  Iterates through each class=item (layers) and creates a tabbed menu.
	tabIt: function(el) {
		$j(el).each(function() {
			var obj = $j(this);
			var newNav = obj.prepend('\n<ul class="tab-nav">\n');
			var items = obj.find('.item');
			//  Hide the titles since they're used in the js-generated tabNav
			obj.find('.item-title').hide();
			//  Hide all items, mark the first as active and show it
			obj.find('.item:not(.tab-active)').hide();
			obj.find('.item:first').addClass('item-active').show();
			//  Create the tabs		
			for (var i = 0; i < items.length; i++) {
				var thisTitle = $j(items[i]).find('.item-title').text();
				obj.find('.tab-nav').append('<li><a href="#"><span>' + thisTitle + '</span></a></li>\n');
			}
			obj.find('.tab-nav li:first').addClass('tab-active');
			var tabs = obj.find('.tab-nav a');
			tabs.bind('click', function(event) {
				obj.find('.tab-nav li').removeClass('tab-active');
				$j(this).parent().addClass('tab-active');
				event.preventDefault();
				for (i = 0; i < tabs.length; i++) {
					if (tabs[i] == this) {
						var newItem = obj.find('.item').eq(i);
						break;
					}
				}
				obj.find('.item').removeClass('tab-active').hide();
				newItem.addClass('tab-active').show();
			});
		});
	},
	
	// set up tabs
	tabsInit : function(selector) {

		if (jQuery(selector).length == 0) return;

		var $els =	jQuery(selector);
		var key = jQuery.browser.msie && (parseInt(jQuery.browser.version) < 7) ? "height" : "minHeight";		
		var h 		= (TUFTS.maxHeight($els)+20)+"px";

		$els.css(key,h).not(":first").hide();

		jQuery(".tabs a").click(function(e) {
			var tab = jQuery(this).attr("href").substring(1);
			$els.hide().filter("#"+tab).show();
			jQuery(".tabs a").removeClass("current");
			jQuery(this).addClass("current");
			e.preventDefault();
		}).eq(0).addClass("current");		

	},
	
	//  Global nav hover
	globalNav: function(el) {
		var obj = $j(el);
		//  Get height of tallest nested list
		var smHeight = obj.height();
		var navHeight = 0;
		obj.find('ul').each(function() {
			var thisHeight = $j(this).height();
			if (thisHeight > navHeight) {
				navHeight = thisHeight;
			}
		});
		//  Animate on hover
		obj.hover(
			function() {
				openNav();
			},
			function() {
				closeNav();
			}
		);
		function openNav() {
			obj.stop().pause(60).animate({
				height: navHeight + smHeight + 20
			}, 300)
		};
		function closeNav() {
			obj.stop().pause(60).animate({
				height: smHeight
			}, 300)
		}
		//  Accessibility options
		obj.find('a').bind('focus', function() {
			openNav();
		});
		obj.find('a').bind('blur', function() {
			closeNav();
		});
	},
	//  Universal IE-only stuff (applies to all versions of IE)
	ie: function() {
		$j('#tertiary .block:last, #secondary .block:last').addClass('last-child');
		//  Select width
		var selects = $j("#tertiary .block-jumpnav select, #lead select");
		selects.each(function() {
			var $this = jQuery(this),
				csswidth = parseInt($this.css('width')),
				width = $this.innerWidth(),
				autowidth = $this.css('width', 'auto').width();
			$this.css('width', width);
			if (autowidth > width) {
				$this.hover(
					function() {
						jQuery(this).css("width", autowidth);
					},
					function() {
						jQuery(this).css("width", width);
					}
				).bind("change blur", function() { jQuery(this).css("width", width); });
			}
		});
	},
	gallery : function() {
		// nothing to do
		if (jQuery(".gallery").length == 0) return;

		var currentscreen = 1,
			maxitems = 6,
			currentitem = 0,
			totalitems = jQuery(".gallery>li>div").length,
			width = $j('.callout .gallery .photo').width();
			
			//set container width on gallery photo
			$j('.gallery').parents('.callout').width(width);
	
		// presets for cycle function actions. see cycle initialization		
		this.stopGallery = function() { jQuery('.gallery').cycle('pause').addClass('paused'); jQuery(".toggle-play").text(TUFTS_SETTINGS.gallery.actions.play).addClass("play-pause"); };
		this.setCurrent  = function(e) {
			var previousitem = currentitem;
			currentitem = jQuery(this).index() + 1;
			jQuery(this).closest(".gallery").next(".gallery-controls").find(".gallery-current").text(currentitem);
			
			if(jQuery(this).parents(".gallery-mini").length == 0 && totalitems > (maxitems+1)) { // don't do this for mini gallery or galleries that don't need  -- no slider
				if(currentitem != totalitems && currentitem != 1) {
					if(
							previousitem<currentitem
						&& 	(maxitems*currentscreen)%(currentitem-1) == 0
						&& 	(maxitems*currentscreen)%(currentitem) != 1
						&&	(currentscreen*maxitems < currentitem) 
					) {	jQuery(this).closest(".content").find(".next-slides").click(); }
					if(
							previousitem>currentitem
						&& 	(maxitems*currentscreen)%(currentitem/(currentscreen-1)) == 0
						&&	(currentscreen*maxitems > currentitem) 
					) { jQuery(this).closest(".content").find(".prev-slides").click(); }
				} else {
					if(previousitem == totalitems && currentitem == 1) {
						moveList(jQuery(this).closest(".callout").find(".prev-slides"),0);
					}
					if(previousitem == 1 && currentitem == totalitems) {
						moveList(jQuery(this).closest(".callout").find(".prev-slides"),1);
					}
				}
			}
		};
		
		var showVideo = function() {
			jQuery(this).closest('.video').removeClass('keyed');
			jQuery('.gallery').cycle('pause').addClass('paused');
			jQuery(".toggle-play").text(TUFTS_SETTINGS.gallery.actions.play).addClass("play-pause");
		};
		var hideVideo = function() {
			var it = jQuery('.gallery').find('.video');
			it.addClass('keyed');		
		};
		
		// transform links to real content
		jQuery('ul.gallery').addClass('paused').each(function() {
									  
			// for each gallery
			var gallery = jQuery(this),
				style = gallery.is(".gallery-mini") ? "mini" : "default",
				thumbs = jQuery('<ul class="gallery-thumbnails" />');
			
			// each inner content block
  			jQuery('>li>div', gallery).each(function() {
				
				// for each item
				var content = jQuery(this),
					type = content.is(".photo") ? "photo" : "video",
					thing = jQuery('a:first', content);
				
				// build slide content,
				// either a photo or video keyframe
				var show = jQuery('<img src="'+thing[0].href+'?mw='+TUFTS_SETTINGS.gallery[style].mw+'&mh='+TUFTS_SETTINGS.gallery[style].mh+'" alt= "" />');
				
				if(type == "video") {	
					var parent = content.closest(".video"),
						object = jQuery(TUFTS.setWmode(parent.find(".video-data").text())),
						playicon = jQuery('<span class="playicon">Play</span>').click(function(){ jQuery(this).closest("li").find("img").click(); });
					
					show.click(showVideo);
					parent.find(".video-data").remove();
					parent.append(playicon);
					content.addClass('keyed');
					
				} // end if video
				
				// build thumbnail
				if(style == "default") {
					var playthumb = type == "video" ? '<span class="playicon">Play</span>' : "";
					var thumb = '<a href="'+thing.attr('href')+'"><img src="'+thing.attr('href')+'?mw='+TUFTS_SETTINGS.gallery["thumb"].mw+'&mh='+TUFTS_SETTINGS.gallery["thumb"].mh+'" alt="" />'+playthumb+'</a>';
				}
				
				// insert slide	
				thing.replaceWith(show);
				content.append(object);

				// append thumb
				thumbs.append('<li>'+thumb+'</li>');
							  
				// configure special captions
				if(type == "video" && style == "default") {
					// make the caption same width as video
					var caption = jQuery(".caption", this),
						objwidth = jQuery("object", this).length ? jQuery("object", this).attr("width") : jQuery("embed", this).attr("width"),
						pad = (jQuery(this).width() - objwidth) / 2;
				
					caption.css({ width: (objwidth - parseInt(caption.css("paddingLeft")) - parseInt(caption.css("paddingRight"))) + "px", left: pad });				
				}
				
			}); // end >li>div loop
			
			// insert thumbnail nav for each gallery
			if(style == "default") {
				var fullgallery = gallery.nextAll(".gallery-nav").first().html(thumbs);
				gallery.nextAll(".gallery-controls").find("#prev,#next").click(function(){  jQuery(this).closest('.gallery-controls').prev(".gallery").find(".video img").click(); });
			}
			
			// make slideable
			initSlider(fullgallery);

		});
		
		// init cycle
 		jQuery('.gallery-mini').cycle({ 
			prev:   '.prev-mini', 
			next:   '.next-mini', 
			timeout: 0,
			height:	'140px',
			before: this.setCurrent
		});
		jQuery('.gallery').not('.gallery-mini').cycle({ 
			prev:   '#prev', 
			next:   '#next', 
			timeout: 7000,
			height:	'360px',
			before: this.setCurrent,
			pager: '.gallery-thumbnails', 
			pagerAnchorBuilder: function(idx, slide) { 
				// return selector string for existing anchor 
				return '.gallery-thumbnails li:eq(' + idx + ') a'; 
			},
			pagerClick: this.stopGallery,
			prevNextClick: this.stopGallery
		});
		jQuery('.gallery').cycle('pause').find('.video img').click();
		
		// gallery controls
		jQuery('.toggle-caption').click(function() {
			// control only the nearest gallery
			var gallery = jQuery(this).closest('.gallery-controls').prev('.gallery');
			// show or hide captions and toggle text
			gallery.toggleClass('nocaptions');
			jQuery(this).text(gallery.is(".nocaptions") ? TUFTS_SETTINGS.gallery.captions.show : TUFTS_SETTINGS.gallery.captions.hide);			
			return false;
		});
		jQuery('.toggle-play').click(function() {		
			var paused = jQuery('.gallery').is('.paused');
			paused ? hideVideo() : jQuery('.gallery .video img').click(); // toggle video vs keyframe
			jQuery(this).text(paused ? TUFTS_SETTINGS.gallery.actions.pause : TUFTS_SETTINGS.gallery.actions.play)[paused ? "removeClass" : "addClass"]("play-pause");		
			jQuery('.gallery').cycle(paused ? 'resume' : 'pause',true)[paused ? "removeClass" : "addClass"]("paused");		
			return false;		
		});
		// set the thumbnail image widths all the same
		jQuery('.gallery-thumbnails').width(function() {
			var num = jQuery("li", this).length,
				li = jQuery("li", this),
				width = parseInt(li.width()) + parseInt(li.css('paddingLeft')) + parseInt(li.css('paddingRight'))  + parseInt(li.css('marginLeft')) + parseInt(li.css('marginRight'));			
				return (width*num)+"px";		
		});
		jQuery("html").addClass("active-gallery");
		jQuery("div.gallery-controls a.toggle-play").addClass("play-pause");
		
		
		//jQuery(window).load(function(){				
			var photo = parseInt(jQuery('.gallery .photo').not('.gallery-mini .photo').height());
			jQuery('.gallery .photo img').not('.gallery-mini .photo img').load(function(){			
																						//console.log("here");
				var pad = (photo-this.height) / 2;	
				jQuery(this).css("paddingTop",(pad-2)+'px');							
			});				
		//});		
		
		// slide-able
		function initSlider(el) {
			
			var obj = jQuery(el);			
			// do we need to slide at all?
			
			if(jQuery('li',obj).length > (maxitems+1)) { // +1 because without slide nav buttons able to have extra item
				// add prev and next links
				jQuery('ul',obj).wrap('<div class="gallery-clip"></div>');
				var btns = obj.addClass("slideable").append('<a class="prev-slides disabled" href="#">&lsaquo;</a> <a class="next-slides" href="#">&rsaquo;</a>');
				jQuery('.prev-slides,.next-slides').click(moveList);			
			}							

		}
			
		function moveList(obj,screen) {
			// action bound to click of prev/next buttons
			// items stored in $slider.data are set in the initialization code outside of this function			
			var $this = obj.length == 1 ? obj : jQuery(this),
				next = $this.is('.next-slides'), // bool to determine which way we are going
				$slider = $this.parents('.gallery-nav'),
				$ul = $slider.find('ul');
			
			// bail if nowhere to go or busy already
			if(!$slider.length || (!obj.length && $this.is('.disabled')) || $ul.queue().length > 0) { return false; }
			
			var width = /*528*/ 374,
				position = parseInt($ul.css('left')),
				gotopos; // placeholder for conditional result
				
			// set new position and current screen based on which direction moving
			if(next) {
				gotopos = (position - width)+'px';
				currentscreen++;
			} else {	
				gotopos = (position + width)+'px';
				currentscreen--;
			}
			if(screen==0) { currentscreen = 1; gotopos = 0 }
			if(screen==1) { currentscreen = Math.ceil(totalitems/maxitems); gotopos = -(width * (Math.ceil(totalitems/maxitems)-1)) }
		
			$ul.animate({left:gotopos},400,'swing');
						
			jQuery('.prev-slides')[currentscreen == 1 ? "addClass" : "removeClass"]("disabled");
			jQuery('.next-slides')[currentscreen == Math.ceil(totalitems/maxitems) ? "addClass" : "removeClass"]("disabled");	
		
			return false;		
		}
	},

	Ticker : function(){
	
		var theCharacterTimeout = 50;
		var theStoryTimeout     = 10000;
		var theWidgetOne        = "-";
		var theWidgetTwo        = "|";
		var theWidgetNone       = "";
		var theLeadString       = "UPDATE: &nbsp;";
	
		var theSummaries = new Array();
		var theSiteLinks = new Array();
	
		var items = jQuery('ul.ticker li');
		var minheight = TUFTS.maxHeight(items);
		var theItemCount = items.length;
		
		items.each(function(i){
			var $this = jQuery('a',this);
			theSummaries[i] = $this.html();
			theSiteLinks[i] = $this.attr('href');							
		});
		
		jQuery('ul.ticker').before('<div class="ticker" style="height:'+minheight+'px"><a title="Read more..." class="tick" target="_top" href="#" id="tickerAnchor"></a></div>').remove();
		startTicker();		
		
		// Ticker startup
		function startTicker()
		{
			// Define run time values
			theCurrentStory     = -1;
			theCurrentLength    = 0;
			// Locate base objects
			if (document.getElementById) {	
				theAnchorObject     = document.getElementById("tickerAnchor");
				runTheTicker();   	
			 }
		}
		// Ticker main run loop
		function runTheTicker()
		{
			var myTimeout;  
			// Go for the next story data block
			if(theCurrentLength == 0)
			{
				theCurrentStory++;
				theCurrentStory      = theCurrentStory % theItemCount;
				theStorySummary      = theSummaries[theCurrentStory].replace(/&quot;/g,'"').replace(/<img[^>]+>/g,'');		
				theTargetLink        = theSiteLinks[theCurrentStory];
				theAnchorObject.href = theTargetLink;
				thePrefix 	     = "<span class=\"tickls\">" + theLeadString + "</span>";
			}
			// Stuff the current ticker text into the anchor
			theAnchorObject.innerHTML = thePrefix + 
			theStorySummary.substring(0,theCurrentLength) + whatWidget();
			// Modify the length for the substring and define the timer
			if(theCurrentLength != theStorySummary.length)
			{
				theCurrentLength++;
				myTimeout = theCharacterTimeout;
			}
			else
			{
				theCurrentLength = 0;
				myTimeout = theStoryTimeout;
			}
			// Call up the next cycle of the ticker
			setTimeout(runTheTicker, myTimeout);
		}
		// Widget generator
		function whatWidget()
		{
			if(theCurrentLength == theStorySummary.length)
			{
				return theWidgetNone;
			}
		
			if((theCurrentLength % 2) == 1)
			{
				return theWidgetOne;
			}
			else
			{
				return theWidgetTwo; 
			}
		}


	},
	
	homeFeature: function(el) {
		var speed = 300;
		var active = 'third';
		var obj = $j(el);
		var all = obj.find('li[class^="sec-"]');// && !all.is(':animated')
		var first  = $j(all.get(0));
		var second = $j(all.get(1));
		var third  = $j(all.get(2));
		third.addClass('active');
		third.find('.nav').fadeIn(speed);

		$j('.subsection.second, .subsection.first').hide();
		// Functions for switching Spotlight
		function firstL() {
			if (!all.is(':animated')) {
				if (active != 'first' && active == 'second') {
					animateLayer(first, 30, -181, 0);
					animateLayer(second, 20, 374, 193);
				} else if (active == 'third') {
					animateLayer(first, 30, -362, 0);
					animateLayer(third, 10, 748, 386);
				}
				active = 'first';
				first.addClass('active');

				first.removeClass('right');
				second.addClass('right');
				third.addClass('right');
			}
		}
		function secondL() {
			if (!all.is(':animated')) {
				if (active == 'first') {
					animateLayer(first, 10, -181, 0);
					animateLayer(second, 30, 374, 193);
				} else if (active == 'third') {
					animateLayer(third, 10, 567, 386);
					animateLayer(second, 20, 12, 193);
				}
				active = 'second';
				second.addClass('active');

				first.removeClass('right');
				second.removeClass('right');
				third.addClass('right');
			}
		}
		function thirdL() {
			if (!all.is(':animated')) {
				if (active == 'second') {
					animateLayer(third, 30, 567, 386);
					animateLayer(second, 20, 12, 193);
				} else if (active != 'third') {
					animateLayer(third, 30, 748, 386);
					animateLayer(first, 10, -362, 0);
				}
				active = 'third';
				third.addClass('active');

				first.removeClass('right');
				second.removeClass('right');
				third.removeClass('right');
			}
		}
		// Switches the subsection of the active spotlight
		function activateSubsection(subsection) {
			if (subsection == 2 || String(subsection).toLowerCase() == 'second') {
				subsection = 'second';
			}
			else if (subsection == 3 || String(subsection).toLowerCase() == 'third') {
				subsection = 'third';
			}
			else {
				subsection = 'first';
			}
			var current = null;
			switch (active) {
				case 'second': current = second; break;
				case 'third': current = third; break;
				default: current = first;
			}
			// Adjust the current active nav button
			current.find('.nav a').removeClass('active');
			switch (subsection) {
				case 'second': current.find('.nav a:eq(1)').addClass('active'); break;
				case 'third': current.find('.nav a:eq(2)').addClass('active'); break;
				default: current.find('.nav a:eq(0)').addClass('active');
			}
			// Show the selected content, hide the others
			$j.each(['first', 'second', 'third'], function(i, v) {
				var subobj = current.find('.subsection.' + v);
				if (v == subsection) {
					subobj.fadeIn(500, function() {
						subobj.addClass('active');
					});
				}
				else {
					subobj.fadeOut(500, function() {
						subobj.removeClass('active');
					});
				}
			});
		}
		//  Animate
		function animateLayer(layer, index, distance, pos) {
			// element, z-index, position (left) to move to, original (left) position
			obj.find('.nav').fadeOut(speed);
			layer.stop().pause(200).animate({
				left: distance
			}, speed, function() {
				layer.css('z-index', index)
				layer.animate({
					left: pos
				}, speed, function() {
					if (layer.is(':animated')) {
						obj.find('.active .nav').fadeIn(speed);
					}
				});
			});
			obj.find('li').removeClass('active');
		}
		
		$j('.sec-feature .nav, #homeFeature .nav').bind('mouseup',function(){
			$j(this).addClass('user-clicked');
		});
		
		setInterval(function()
		{
			if($j('.sec-feature .nav').not('.user-clicked')){
				var $next = $j('.sec-feature .active').next(),
					$trigger = $j('.sec-feature .nav a');
					
				if ($j('.sec-feature .active').hasClass('third')) {
					var $next = $j('.sec-feature .nav a:first');
					$next.trigger('click');
				}

				$next.trigger('click');
			}
			
		}, 5000);
	
		setInterval(function()
		{
			if($j('#homeFeature .nav').not('.user-clicked')){
				var $next = $j('#homeFeature li.active .active').next(),
					$trigger = $j('#homeFeature .nav a');
					
					if ($j('#homeFeature .active').hasClass('third')) {
						var $next = $j('#homeFeature .nav a:first');
						$next.trigger('click');
					}
				$next.trigger('click');
			}
		}, 5000);

		// Bindings
        // Feature spotlights only move around on the main homepage.
        if (obj.attr('id') == "homeFeature") {
		first.bind('mouseover', function() { firstL(); });
		second.bind('mouseover', function() { secondL(); });
		third.bind('mouseover', function() { thirdL(); });
        }
        else {
            // On MD and PHPDP homepages, the second is the only spotlight.
            active = 'second';
        }
		
		obj.find('li').each(function() {
			$j(this).find('.nav a:eq(0)').bind('click', function() { activateSubsection('first'); });
			$j(this).find('.nav a:eq(1)').bind('click', function() { activateSubsection('second'); });
			$j(this).find('.nav a:eq(2)').bind('click', function() { activateSubsection('third'); });
		})
	}
};
 

(function($) {
$.fn.jqm=function(o){
var p={
overlay: 50,
overlayClass: 'jqmOverlay',
closeClass: 'jqmClose',
trigger: '.jqModal',
ajax: F,
ajaxText: '',
target: F,
modal: F,
toTop: F,
onShow: F,
onHide: F,
onLoad: F
};
return this.each(function(){if(this._jqm)return H[this._jqm].c=$.extend({},H[this._jqm].c,o);s++;this._jqm=s;
H[s]={c:$.extend(p,$.jqm.params,o),a:F,w:$(this).addClass('jqmID'+s),s:s};
if(p.trigger)$(this).jqmAddTrigger(p.trigger);
});};

$.fn.jqmAddClose=function(e){return hs(this,e,'jqmHide');};
$.fn.jqmAddTrigger=function(e){return hs(this,e,'jqmShow');};
$.fn.jqmShow=function(t){return this.each(function(){t=t||window.event;$.jqm.open(this._jqm,t);});};
$.fn.jqmHide=function(t){return this.each(function(){t=t||window.event;$.jqm.close(this._jqm,t)});};

$.jqm = {
hash:{},
open:function(s,t){var h=H[s],c=h.c,cc='.'+c.closeClass,z=(parseInt(h.w.css('z-index'))),z=(z>0)?z:3000,o=$('<div></div>').css({height:'100%',width:'100%',position:'fixed',left:0,top:0,'z-index':z-1,opacity:c.overlay/100});if(h.a)return F;h.t=t;h.a=true;h.w.css('z-index',z);
 if(c.modal) {if(!A[0])L('bind');A.push(s);}
 else if(c.overlay > 0)h.w.jqmAddClose(o);
 else o=F;

 h.o=(o)?o.addClass(c.overlayClass).prependTo('body'):F;
 if(ie6){$('html,body').css({height:'100%',width:'100%'});if(o){o=o.css({position:'absolute'})[0];for(var y in {Top:1,Left:1})o.style.setExpression(y.toLowerCase(),"(_=(document.documentElement.scroll"+y+" || document.body.scroll"+y+"))+'px'");}}

 if(c.ajax) {var r=c.target||h.w,u=c.ajax,r=(typeof r == 'string')?$(r,h.w):$(r),u=(u.substr(0,1) == '@')?$(t).attr(u.substring(1)):u;
  r.html(c.ajaxText).load(u,function(){if(c.onLoad)c.onLoad.call(this,h);if(cc)h.w.jqmAddClose($(cc,h.w));e(h);});}
 else if(cc)h.w.jqmAddClose($(cc,h.w));

 if(c.toTop&&h.o)h.w.before('<span id="jqmP'+h.w[0]._jqm+'"></span>').insertAfter(h.o);	
 (c.onShow)?c.onShow(h):h.w.show();e(h);return F;
},
close:function(s){var h=H[s];if(!h.a)return F;h.a=F;
 if(A[0]){A.pop();if(!A[0])L('unbind');}
 if(h.c.toTop&&h.o)$('#jqmP'+h.w[0]._jqm).after(h.w).remove();
 if(h.c.onHide)h.c.onHide(h);else{h.w.hide();if(h.o)h.o.remove();} return F;
},
params:{}};
var s=0,H=$.jqm.hash,A=[],ie6=$.browser.msie&&($.browser.version == "6.0"),F=false,
i=$('<iframe src="javascript:false;document.write(\'\');" class="jqm"></iframe>').css({opacity:0}),
e=function(h){if(ie6)if(h.o)h.o.html('<p style="width:100%;height:100%"/>').prepend(i);else if(!$('iframe.jqm',h.w)[0])h.w.prepend(i); f(h);},
f=function(h){try{$(':input:visible',h.w)[0].focus();}catch(_){}},
L=function(t){$()[t]("keypress",m)[t]("keydown",m)[t]("mousedown",m);},
m=function(e){var h=H[A[A.length-1]],r=(!$(e.target).parents('.jqmID'+h.s)[0]);if(r)f(h);return !r;},
hs=function(w,t,c){return w.each(function(){var s=this._jqm;$(t).each(function() {
 if(!this[c]){this[c]=[];$(this).click(function(){for(var i in {jqmShow:1,jqmHide:1})for(var s in this[i])if(H[this[i][s]])H[this[i][s]].w[i](this);return F;});}this[c].push(s);});});};
})(jQuery);

