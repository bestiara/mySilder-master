/**
 * User: bestiara
 * Date: 02.10.14
 * Time: 11:52
 */

(function ($) {
    $.fn.slider = function (options) {

        var settings = $.extend({
            'autoslide': false, // автоскролл
            'speed': '1000', // скорость (частота) автоскролла
            'arrows': true, // отображение стрелок
            'selector': true, // отображение селекторов
            'thumbnail': true, // отображение миниатюр
            'thumbPos': 'bottom', // положение миниатюр (bottom, top, left, right)
            'links': false, // ссылки в превью (для положений left, right)
            'thumbSize': 75, // размер превью
            'responsivity': 'parent', // 'parentHeight', 'parentWidth',
            'resolution': '3:2', //отношение сторон слайдера (ширина/высота)
            'caption': false //подписи слайдеров
        }, options);

        //var methods = {
        //    init : function( options ) {
        //
        //    },
        //    show : function( ) {
        //
        //    },
        //    hide : function( ) {
        //
        //    },
        //    update : function( content ) {
        //
        //    }
        //};

        //todo инкапсулировать методы

        this.each(function () {

            var $this = $(this),
                $slideWrapper = $this.find('.slidewrapper'), //контейнер с слайдами
                $slide = $this.find('.slide'), //контейнер слайда
                slideCount = $slideWrapper.children().size(), //количество слайдов
                thumbsPerSlide, //число превью на один слайд (для прокрутки превью)
                slideWidth, //ширина слайдера
                slideHeight, //высота слайдера
                image = new Image(),
                direction, //направление скролла превью слайдов
                $sliderControls = $('<div/>', { //контейнер селекторов
                    class: 'slider-controls',
                    style: 'display: none;'
                }),
                $controlSlide = $('<span/>', { //
                    class: 'control-slide',
                    style: 'width: 12px; height: 12px;'
                }),
                $thumbnail = $('<div/>', {
                    class: 'thumbnail',
                    style: 'overflow: hidden; position: absolute;'
                }),
                $thumbWrapper = $('<ul/>', {
                    class: 'thumbnail-container',
                    width: slideCount * slideWidth
                }),
                $thumb = $('<li/>', {
                    class: 'thumb',
                    style: 'background-size: cover;'
                }),
                $caption = $('<div/>', {
                    class: 'caption',
                    style: 'display: none;'
                }),
                $link = $('<a/>', {}),
                sliderTimer;


            $thumbWrapper.attr('data-current', 0);

            $this.css({
                overflow: 'hidden',
                position: 'relative'
            });

            initSlider();

            function initSlider() { //инициализация(?) слайдера

                if (settings.arrows) {
                    addArrows()
                }


                if (settings.selector) {
                    addControls()
                }

                if (settings.caption) {
                    addCaptions()
                }

                setSliderSize();
                drawSlider(slideWidth, slideHeight);

                resizeImg();


                if (settings.thumbnail) {
                    addThumbnails();
                }

                setDirection();
                startAutoSlide();
            }

            function setSliderSize() {
                var resArr = settings.resolution.split(':'),
                    resW = resArr[0],
                    resH = resArr[1];
                if (settings.responsivity == 'parent') {
                    slideWidth = $this.parent().width(); //ширина родителя слайдера
                    slideHeight = $this.parent().height(); //высота родителя слайдера
                } else if (settings.responsivity == 'parentWidth') {
                    slideWidth = $this.parent().width();
                    slideHeight = slideWidth / resW * resH;
                } else if (settings.responsivity == 'parentHeight') {
                    slideHeight = $this.parent().height();
                    slideWidth = slideHeight / resH * resW;
                }
            }

            function hideControls() { //скрываем "кружочки" и подписи, если они шире слайда, и показываем - если уже
                var controlsWidth = $controlSlide.width(),
                    _slideWidth = $slide.width();
                if ((slideCount + 4) * controlsWidth > _slideWidth) {
                    $sliderControls.fadeOut(200);
                    $slide.find('.caption').fadeOut(200);
                } else if ((slideCount + 4) * controlsWidth < _slideWidth) {
                    $sliderControls.fadeIn(200);
                    $slide.find('.caption').fadeIn(200);
                }
            }

            function addArrows() {
                $this.append('<div class="arrow prev"></div><div class="arrow next"></div>');
            }

            function addCaptions() {
                $slide.each(function () {
                    $clone = $caption.clone();
                    $clone.append('<h1>' + $(this).data('caption') + '</h1>');
                    $(this).append($clone);
                });
            }

            function addControls() { //добавляем кружочки-селекторы
                $controlSlide.addClass('active');
                $slide.each(function () {
                    $clone = $controlSlide.clone();
                    $clone.click(function (event) {
                        event.preventDefault();
                        if (settings.thumbnail) {
                            if ((settings.thumbPos == 'top') || (settings.thumbPos == 'bottom')) {
                                setSlide($(this));
                            } else if ((settings.thumbPos == 'left') || (settings.thumbPos == 'right')) {
                                setSlide($(this));
                            }
                        } else {
                            setSlide($(this));
                        }
                    });
                    $sliderControls.append($clone);
                    $sliderControls.css('margin-left', -$controlSlide.width() * slideCount / 2);
                    $controlSlide.removeClass('active');
                });

                $this.append($sliderControls);
            }

            function addLink($_thumb, $_slide) { //добавляем ссылки в превью

                $link.attr('href', $_slide.data('url'));
                $link.css({
                    'height': 'inherit',
                    'width': '200%',
                    'display': 'table-cell',
                    'text-align': settings.thumbPos,
                    'line-height': $thumb.height() + 'px'
                });

                $link.html($_slide.data('text'));
                $_thumb.append($link);
            }

            function resizeImg() { //подгоняем img под размеры слайдов, аналогично background: cover

                $slide.each(function () {

                    var $slide = $(this),
                        $img = $slide.find('img');

                    image.src = $img.attr('src');

                    if (slideWidth / image.width > slideHeight / image.height) {

                        $img.width(slideWidth);
                        $img.height(slideWidth / image.width * image.height);

                    } else {

                        $img.height(slideHeight);
                        $img.width(slideHeight / image.height * image.width);

                    }
                });
            }

            function addThumbnails() { //добавляем превью
                $slide.each(function () {

                    var $slide = $(this),
                        $imgSrc = $slide.find('img').attr('src');

                    $thumb.css('background-image', 'url(' + $imgSrc + ')');
                    if (settings.links) {
                        addLink($thumb, $slide)
                    }
                    $clone = $thumb.clone();
                    $clone.click(function (event) {
                        event.preventDefault();
                        if (settings.thumbnail) {
                            if ((settings.thumbPos == 'top') || (settings.thumbPos == 'bottom')) {
                                setSlide($slide);
                            } else if ((settings.thumbPos == 'left') || (settings.thumbPos == 'right')) {
                                setSlide($slide);
                            }
                        }
                    });

                    $thumbWrapper.append($clone);
                    $thumb.removeClass('active');
                    $thumbnail.append($thumbWrapper);
                    $this.parent().append($thumbnail);
                });

                if (settings.thumbnail) {
                    if ((settings.thumbPos == 'top') || (settings.thumbPos == 'bottom')) {
                        $thumbnail.append('<div class="arrow_thumb prev"></div><div class="arrow_thumb next"></div>');
                    } else if ((settings.thumbPos == 'left') || (settings.thumbPos == 'right')) {
                        $thumbnail.append('<div class="arrow_thumb_vert prev"></div><div class="arrow_thumb_vert next"></div>');
                    }
                }
            }

            function drawSlider(_slideWidth, _slideHeight) { //задаем размеры динамических элементов слайдера
                var thumbSize = settings.thumbSize;

                if (!settings.thumbnail) {

                    $this.height(_slideHeight);
                    $this.width(_slideWidth);

                    $slide.height(_slideHeight);
                    $slide.width(_slideWidth);



                } else {

                    $thumb.width(thumbSize);
                    $thumb.height(thumbSize);
                    $thumbnail.height(thumbSize);

                    switch (settings.thumbPos) {

                        case 'bottom':

                            $slideWrapper.css({
                                left: -_slideWidth * $slideWrapper.data('current')
                            });

                            thumbsPerSlide = _slideWidth / thumbSize;

                            $this.height(_slideHeight - thumbSize);
                            $this.width(_slideWidth);

                            $slide.height(_slideHeight - thumbSize);
                            $slide.width(_slideWidth);

                            $thumbnail.width(_slideWidth);
                            $thumbnail.height(thumbSize);

                            $thumbWrapper.width(thumbSize * slideCount);

                            break;

                        case 'top':

                            $slideWrapper.css({
                                left: -_slideWidth * $slideWrapper.data('current')
                            });

                            thumbsPerSlide = _slideWidth / thumbSize;

                            $this.height(_slideHeight - thumbSize);
                            $this.width(_slideWidth);

                            $slide.height(_slideHeight - thumbSize);
                            $slide.width(_slideWidth);

                            $thumbnail.width(slideWidth);
                            $thumbnail.height(thumbSize);

                            $thumbWrapper.width(thumbSize * slideCount);

                            $thumbnail.css({
                                position: 'absolute',
                                top: 0
                            });

                            $this.css("margin-top", $thumb.height());

                            break;

                        case 'left':

                            $thumbnail.width(thumbSize);
                            $thumbnail.height(_slideHeight);

                            thumbsPerSlide = _slideHeight / thumbSize;

                            if (settings.links) {

                                $slideWrapper.css({
                                    left: -_slideWidth * $slideWrapper.data('current') + 2 * thumbSize * $slideWrapper.data('current')
                                });

                                $this.width(_slideWidth - 2 * thumbSize);
                                $this.height(_slideHeight);

                                $slide.width(_slideWidth - 2 * thumbSize);
                                $slide.height(_slideHeight);

                                $thumbnail.width(3 * thumbSize);
                                $thumbnail.height(_slideHeight);

                                $thumbWrapper.width(thumbSize);
                                $thumbWrapper.height($thumb.height() * slideCount);

                                $this.css('margin-left', 2 * thumbSize + 'px');

                                $link.css('margin-left', -1 * thumbSize + 'px');

                                $thumbWrapper.css('margin-left', thumbSize + 'px');

                                $thumb.css('float', 'none');

                                $this.css('float', 'left');

                            } else {

                                $slideWrapper.css({
                                    left: -_slideWidth * $slideWrapper.data('current') + thumbSize * $slideWrapper.data('current')
                                });

                                $this.width(_slideWidth - thumbSize);
                                $this.height(_slideHeight);

                                $slide.width(_slideWidth - thumbSize);
                                $slide.height(_slideHeight);

                                $thumbnail.width(thumbSize);
                                $thumbnail.height($slide.height());

                                $thumbWrapper.width(thumbSize);
                                $thumbWrapper.height($thumb.height() * slideCount);

                                $this.css("margin-left", thumbSize + 'px');

                                $this.css('float', 'left');

                                $thumb.css('float', 'none');
                            }

                            break;


                        case 'right':

                            $thumbnail.width(thumbSize);
                            $thumbnail.height(_slideHeight);

                            thumbsPerSlide = _slideHeight / thumbSize;

                            if (settings.links) {

                                $slideWrapper.css({
                                    left: -_slideWidth * $slideWrapper.data('current') + 2 * thumbSize * $slideWrapper.data('current')
                                });

                                $this.width(_slideWidth - 2 * thumbSize);
                                $this.height(_slideHeight);

                                $slide.width(_slideWidth - 2 * thumbSize);
                                $slide.height(_slideHeight);


                                $thumbnail.width(2 * thumbSize);
                                $thumbnail.height($slide.height());

                                $thumbWrapper.width(thumbSize);
                                $thumbWrapper.height(thumbSize * slideCount);

                                $thumbnail.css('margin-left', _slideWidth - 2 * thumbSize);

                                $thumbnail.css({
                                    position: 'absolute',
                                    left: 0
                                });

                                $thumb.css('float', 'none');

                                $this.css('float', 'left');

                            } else {

                                $slideWrapper.css({
                                    left: -_slideWidth * $slideWrapper.data('current') + thumbSize * $slideWrapper.data('current')
                                });

                                $this.width(_slideWidth - thumbSize);
                                $this.height(_slideHeight);

                                $slide.width(_slideWidth - thumbSize);
                                $slide.height(_slideHeight);

                                $thumbnail.width(thumbSize);
                                $thumbnail.height($slide.height());

                                $thumbWrapper.width(thumbSize);
                                $thumbWrapper.height($thumb.height() * slideCount);

                                $thumbnail.css('margin-left', _slideWidth - thumbSize);

                                $this.css("margin-right", thumbSize + 'px');

                                $this.css('float', 'left');

                                $thumb.css('float', 'none');
                            }

                            break;

                    }
                }

                $thumb.addClass('active');
                $slideWrapper.width(slideCount * $slide.width());
                hideControls();

            }

            function setDirection() { //выбираем направление скролла превью

                if ((settings.thumbPos == 'top') || (settings.thumbPos == 'bottom')) {
                    direction = 'horizontal';
                } else if ((settings.thumbPos == 'left') || (settings.thumbPos == 'right')) {
                    direction = 'vertical';
                }

            }

            $this.hover(function () { //стопаем автоскролл при наведении на слайдер
                clearInterval(sliderTimer);
            }, function () {
                startAutoSlide()
            });

            $this.find('.next').click(function (event) {
                event.preventDefault();
                nextSlide();
            });

            $this.find('.prev').click(function (event) {
                event.preventDefault();
                prevSlide();
            });

            $this.parent().find('.arrow_thumb.next').click(function (event) {
                event.preventDefault();
                nextThumbs(direction);
            });

            $this.parent().find('.arrow_thumb.prev').click(function (event) {
                event.preventDefault();
                prevThumbs(direction);
            });


            $this.parent().find('.arrow_thumb_vert.next').click(function (event) {
                event.preventDefault();
                nextThumbs(direction);
            });

            $this.parent().find('.arrow_thumb_vert.prev').click(function (event) {
                event.preventDefault();
                prevThumbs(direction);
            });

            function startAutoSlide() { //запускаем автоскролл, если он включен
                if (settings.autoslide == true) {
                    sliderTimer = setInterval(nextSlide, settings.speed);
                }
            }

            function nextSlide() { //функция, переключающая следующий слайд

                var currentSlide = parseInt($slideWrapper.data('current'));

                currentSlide++;
                if (currentSlide == slideCount) {
                    currentSlide = 0;
                }

                if (direction == 'horizontal') {
                    $thumbWrapper.animate({
                        left: -(parseInt(currentSlide / thumbsPerSlide)) * $slide.width()
                    }, 500)
                        .data('current', parseInt(currentSlide / thumbsPerSlide));
                    $slideWrapper.animate({
                        left: -currentSlide * $slide.width()
                    }, 500)
                        .data('current', currentSlide);
                } else {
                    $thumbWrapper.animate({
                        top: -(parseInt(currentSlide / thumbsPerSlide)) * $slide.height()
                    }, 500)
                        .data('current', parseInt(currentSlide / thumbsPerSlide));
                    $slideWrapper.animate({
                        left: -currentSlide * $slide.width()
                    }, 500)
                        .data('current', currentSlide);
                }

                changeControlSlide(currentSlide);
            }

            function prevSlide() { //функция, переключающая предыдущий слайд

                var currentSlide = parseInt($slideWrapper.data('current'));
                currentSlide--;

                if (currentSlide < 0) {
                    currentSlide = slideCount - 1;
                }

                if (direction == 'horizontal') {
                    $thumbWrapper.animate({
                        left: -(parseInt(currentSlide / thumbsPerSlide)) * $slide.width()
                    }, 500)
                        .data('current', parseInt(currentSlide / thumbsPerSlide));
                    $slideWrapper.animate({
                        left: -currentSlide * $slide.width()
                    }, 500)
                        .data('current', currentSlide);
                } else {
                    $thumbWrapper.animate({
                        top: -(parseInt(currentSlide / thumbsPerSlide)) * $slide.height()
                    }, 500)
                        .data('current', parseInt(currentSlide / thumbsPerSlide));
                    $slideWrapper.animate({
                        left: -currentSlide * $slide.width()
                    }, 500)
                        .data('current', currentSlide);
                }
                changeControlSlide(currentSlide);
            }

            function setSlide(slide) { //функция, переключающая слайд по индексу
                var statedSlide = slide.index();
                setThumbs(slide, direction);

                $slideWrapper.animate({
                    left: -(statedSlide) * $slide.width()
                }, 500)
                    .data('current', statedSlide);

                changeControlSlide(statedSlide);

            }

            function changeControlSlide(index) { //функция, переключающая управляющие элементы в статус active
                $this.find('.control-slide.active').removeClass('active');
                $this.find('.control-slide:eq(' + index + ')').addClass('active');
                $this.parent().find('.thumb.active').removeClass('active');
                $this.parent().find('.thumb:eq(' + index + ')').addClass('active');
            }

            function nextThumbs(direction) {

                var currentSlide = parseInt($thumbWrapper.data('current'));
                currentSlide++;

                if (currentSlide == parseInt(slideCount / thumbsPerSlide) + 1) {
                    currentSlide = 0;
                }
                if (direction == 'vertical') {

                    $thumbWrapper.animate({
                        top: -currentSlide * $slide.height()
                    }, 500)
                        .data('current', currentSlide);
                } else {

                    $thumbWrapper.animate({

                        left: -currentSlide * $slide.width()
                    }, 500)
                        .data('current', currentSlide);
                }


            }

            function prevThumbs(direction) {

                var currentSlide = parseInt($thumbWrapper.data('current'));
                currentSlide--;

                if (currentSlide < 0) {
                    currentSlide = parseInt(slideCount / thumbsPerSlide);
                }
                if (direction == 'vertical') {
                    $thumbWrapper.animate({
                        top: -currentSlide * $slide.height()
                    }, 500)
                        .data('current', currentSlide);
                } else {
                    $thumbWrapper.animate({
                        left: -currentSlide * $slide.width()
                    }, 500)
                        .data('current', currentSlide);
                }
            }

            function setThumbs(slide) {

                var statedSlide = parseInt(slide.index() / thumbsPerSlide);

                if (direction == 'vertical') {
                    $thumbWrapper.animate({
                        top: -statedSlide * $slide.height()
                    }, 500)
                        .data('current', statedSlide);

                } else {
                    $thumbWrapper.animate({
                        left: -statedSlide * $slide.width()
                    }, 500)
                        .data('current', statedSlide);

                }
            }

            $(window).resize(function () {

                setSliderSize();
                drawSlider(slideWidth, slideHeight);
                resizeImg();

            });
        });
    }
})(jQuery);