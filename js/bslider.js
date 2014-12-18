( function($) {

        $.fn.bslider = function(options) {

            var settings = $.extend({
                'pause' : 3000, // скорость (частота) автоскролла
                'arrows' : true, // отображение стрелок
                'selector' : true, // отображение селекторов
                'thumbnails' : false,
                'resolution' : '16:9', //отношение сторон слайдера (ширина/высота)

                // 'thumbnails' : {// отображение миниатюр (false, {} )
                // 'position' : 'bottom', // положение миниатюр (bottom, top, left, right)
                // 'type' : 'auto', // тип превью ('custom', 'auto')
                // 'size' : 75 // размер превью
                // },
                //'responsivity' : 'parent', // 'parentHeight', 'parentWidth',
                //'caption' : false, //подписи слайдеров
                //'theme' : 'default-theme', // тема оформления (имя файла .css в /css)
                // 'gallery' : {//false or { resizeStyle: 'on-center' | 'stretch' | 'on-size' | 'fill' }
                // 'resizeStyle' : 'fill', //стиль ресайза <img/> ('on-center' - по центру, 'stretch' - растянуть, 'on-size' - по размеру, 'fill' - заполнение)
                // }
                //'animation' : 'slide' //'slide', 'scale', 'opacity'
                'orientation' : "horizontal"
            }, options), //
            el = $(this), //
            disabled = false, //
            image = new Image(), //
            $parent = el.parent(), //
            $slideWrapper = el.find('.slidewrapper'), //контейнер с слайдами
            $slides = el.find('ul.slidewrapper li'), //контейнер слайда
            $viewport = el.find('div.viewport'), //
            slideCount = $slideWrapper.children().size();
            //количество слайдов
            var $sliderControls = $('<div/>', {
                class : 'slider-controls'
            });

            var $controlSlide = $('<span/>', {//
                class : 'control-slide'
            });

            var $caption = $('<div/>', {
                class : 'caption'
            });

            var $thumbnailsViewport = $('<div/>', {
                class : 'thumbnails-viewport',
                style : 'overflow: hidden; position: absolute;'
            });

            var $thumbnailsWrapper = $('<ul/>', {
                class : 'thumbnails-wrapper',
                style : 'margin: 0; padding: 0;'
            });

            var $thumb = $('<li/>', {
                style : 'background-size: cover; list-style: none; float: left;'
            });
            ////////////////////////////////////////////////////////
            //public methods
            ////////////////////////////////////////////////////////

            el.nextSlide = function() {

                currentSlide = parseInt($slideWrapper.data('current'));
                var nextSlide = currentSlide + 1;

                if (currentSlide === slideCount - 1) {
                    nextSlide = 0;
                }
                el.disableControls();
                $.when($slides.animate({
                    opacity : 0
                }, 250)).then(function() {
                    $($slides[nextSlide]).show().animate({
                        opacity : 1
                    }, 250, function() {
                        el.enableControls();
                    });
                });
                el.updateCounter(nextSlide + 1);
                $slideWrapper.data('current', nextSlide);
                el.changeControlSlide(nextSlide);
            };

            el.prevSlide = function() {
                currentSlide = parseInt($slideWrapper.data('current'));
                var prevSlide = currentSlide - 1;

                if (currentSlide <= 0) {
                    prevSlide = slideCount - 1;
                }

                el.disableControls();
                $slides.animate({
                    opacity : 0
                }, 250, function() {
                    $($slides[prevSlide]).show().animate({
                        opacity : 1
                    }, 250, function() {
                        el.enableControls();
                    });

                });
                el.updateCounter(prevSlide + 1);
                $slideWrapper.data('current', prevSlide);
                el.changeControlSlide(prevSlide);
            };

            el.setSlide = function(index) {
                var statedSlide = index;
                currentSlide = parseInt($slideWrapper.data('current'));

                if (statedSlide == currentSlide)
                    return;

                el.disableControls();
                $slides.animate({
                    opacity : 0
                }, 250, function() {
                    $($slides[statedSlide]).show().animate({
                        opacity : 1
                    }, 250, function() {
                        el.enableControls();
                    });

                });
                el.updateCounter(statedSlide + 1);
                $slideWrapper.data('current', statedSlide);
                el.changeControlSlide(statedSlide);

            };
            //todo отключение стрелок во время анимации толком не работает

            el.disableControls = function() {
                disabled = true;
            };

            el.enableControls = function() {
                disabled = false;
            };

            el.changeControlSlide = function(index) {
                el.find('.control-slide.active').removeClass('active');
                el.find('.control-slide:eq(' + index + ')').addClass('active');
                $parent.find('ul.thumbnails-wrapper li.active').removeClass('active');
                $parent.find('ul.thumbnails-wrapper li:eq(' + index + ')').addClass('active');
            };

            el.startAutoSlide = function() {
                if (el.interval) {
                    return;
                }

                interval = setInterval(function() {
                    el.nextSlide();
                }, settings.pause);
            };

            el.stopAutoSlide = function() {
                if (!el.interval) {
                    return;
                }

                clearInterval(el.interval);
                slider.interval = null;
            };

            el.updateCounter = function(index) {
                el.find(".counter").html(index + "/" + slideCount);
            };
            ////////////////////////////////////////////////////////
            //private methods
            ////////////////////////////////////////////////////////

            var init = function() {
                setup();
                redrawSlider();
                if (settings.pause) {
                    el.startAutoSlide();
                };

                if (settings.orientation == 'gallery') {
                    resizeImg();
                }

                $slides.first().addClass('active');
                el.updateCounter(1);
                addThumbnails();
            };

            var getSliderWidth = function() {
                var sliderWidth = $($parent).width();
                return sliderWidth;
            };

            var getSliderHeight = function() {
                var sliderHeight = $parent.height();
                return sliderHeight;
            };

            var redrawSlider = function() {
                var w = getSliderWidth();
                var h = getSliderHeight();

                var resArr = settings.resolution.split(':');

                var resW = resArr[0];
                var resH = resArr[1];

                h = w / resW * resH;

                $viewport.width(w);
                $viewport.height(h);

                $slides.width(w);
                $slides.height(h);
            };

            var addThumbnails = function() {
                if (settings.thumbnails === false)
                    return;
                var thumbWidth = settings.thumbnails.size;
                var thumbHeight = settings.thumbnails.size;
                if (settings.thumbnails.type == "auto") {
                    $slides.each(function() {
                        var $slide = $(this);
                        var imgSrc = $slide.find('img').attr('src');

                        $thumb.css({
                            'width' : thumbWidth,
                            'height' : thumbHeight
                        });

                        var $cloneThumb = $thumb.clone();

                        if (imgSrc) {
                            $cloneThumb.css({
                                'background-image' : 'url(' + imgSrc + ')'
                            });
                        };

                        $cloneThumb.click(function(event) {
                            event.preventDefault();
                            if (settings.thumbnails) {
                                var pos = settings.thumbnails.position;
                                if ((pos == 'top') || (pos == 'bottom')) {
                                    if (disabled === false) {
                                        el.setSlide($slide.index());
                                    };
                                } else if ((pos == 'left') || (pos == 'right')) {
                                    if (disabled === false) {
                                        el.setSlide($slide.index());
                                    };
                                }
                            }
                        });

                        $thumbnailsWrapper.append($cloneThumb);

                    });

                    $thumbnailsViewport.append($thumbnailsWrapper);
                    el.find('.thumbnails').append($thumbnailsViewport);
                    $thumbnailsWrapper.children().first().addClass('active');

                } else {

                    var thumbnails = el.find('.thumbnails');
                    var thumbnailsWrapper = thumbnails.find('.thumbnails-wrapper');
                    if (thumbnailsWrapper.size() != 0) {
                        thumbnailsWrapper.children().each(function() {
                            $(this).click(function() {
                                if (disabled === false) {
                                    el.setSlide($(this).index());
                                };
                            });
                        });

                    } else {

                        console.log('container .thumbnails-wrapper was not found');
                    }
                };

            };
            function resizeImg() {
                $slides.each(function() {

                    var $slide = $(this);
                    var $img = $slide.find('img');
                    var imageWidth;
                    var imageHeight;
                    var slideW = getSliderWidth();
                    var slideH = getSliderHeight();
                    image.src = $img.attr('src');
                    
                    $slide.css({
                        'background-image': 'url(' + $img.attr('src') + ')',
                        'background-size': 'cover',
                        'background-position': 'center'
                    });
                    $img.remove();
                });

                /*$slides.each(function() {

                 var $slide = $(this);
                 var $img = $slide.find('img');
                 var imageWidth;
                 var imageHeight;
                 var slideW = getSliderWidth();
                 var slideH = getSliderHeight();
                 image.src = $img.attr('src');

                 imageWidth = image.width;
                 imageHeight = image.height;

                 if (settings.resizeStyle == 'stretch') {

                 $img.height(slideH);
                 $img.width(slideW);

                 } else if (settings.resizeStyle == 'on-size') {

                 if (slideW / imageWidth > slideH / imageHeight) {
                 $img.css({
                 'height' : slideH,
                 'width' : 'auto'
                 });
                 } else {
                 $img.css({
                 'width' : slideW,
                 'height' : 'auto'
                 });
                 };

                 } else if (settings.resizeStyle == 'fill') {

                 if (slideW / imageWidth > slideH / imageHeight) {
                 $img.css({
                 'width' : slideW,
                 'height' : slideW / imageWidth * imageHeight
                 });
                 } else {
                 $img.css({
                 'height' : slideH,
                 'width' : slideH / imageHeight * imageWidth
                 });
                 }
                 }
                 });*/
            }

            ////////////////////////////////////////////////////////
            //подготовка DOM и CSS
            ////////////////////////////////////////////////////////

            var setup = function() {
                var $sliderControls = $('<div/>', {
                    class : 'slider-controls'
                });

                var $controlSlide = $('<span/>', {//
                    class : 'control-slide'
                });

                var $caption = $('<div/>', {
                    class : 'caption'
                });

                $viewport.css({
                    overflow : 'hidden',
                    position : 'relative'
                });

                var $thumbnailsViewport = $('<div/>', {
                    class : 'thumbnails-viewport',
                    style : 'overflow: hidden; position: absolute;'
                });

                var $thumbnailsWrapper = $('<ul/>', {
                    class : 'thumbnails-wrapper'
                });

                var $thumb = $('<li/>', {
                    style : 'background-size: cover;'
                });

                if (settings.arrows) {
                    el.find('.arrow').css({
                        'visibility' : 'visible'
                    });
                };

                if (settings.caption) {
                    $slides.each(function() {
                        var $cloneCap = $caption.clone();
                        $cloneCap.append('<h1>' + el.data('caption') + '</h1>');
                        el.append($cloneCap);
                    });
                };

                if (settings.selector) {
                    $controlSlide.addClass('active');

                    $slides.each(function() {
                        var $cloneSlide = $controlSlide.clone();
                        $cloneSlide.click(function(event) {
                            event.preventDefault();
                            if (settings.thumbnails) {
                                var pos = settings.thumbnails.position;
                                if ((pos == 'top') || (pos == 'bottom')) {
                                    el.setSlide($(this).index());
                                } else if ((pos == 'left') || (pos == 'right')) {
                                    el.setSlide($(this).index());
                                }
                            } else {
                                el.setSlide($(this).index());
                            }
                        });
                        $sliderControls.append($cloneSlide);

                        $controlSlide.removeClass('active');
                    });
                    $viewport.append($sliderControls);
                    $sliderControls.css('margin-left', -el.find('.control-slide').width() * slideCount / 2);
                }

                $slideWrapper.attr('data-current', 0);
            };

            init();

            $(window).resize(function() {
                redrawSlider();
                if (settings.gallery)
                    resizeImg();
            });

            ////////////////////////////////////////////////////////
            //bindings
            ////////////////////////////////////////////////////////

            el.find('.next').click(function(event) {
                event.preventDefault();
                if (disabled === false) {
                    el.nextSlide();
                }
            });

            el.find('.prev').click(function(event) {
                event.preventDefault();
                if (disabled === false) {
                    el.prevSlide();
                }
            });

            return el;
        };
    }(jQuery));
