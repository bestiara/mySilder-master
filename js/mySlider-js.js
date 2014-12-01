/**
 * User: bestiara
 * Date: 02.10.14
 * Time: 11:52
 */


(function ($) {

    $.fn.slider = function (options) {

        var settings = $.extend({
            'autoslide': false, // автоскролл
            'speed': 1000, // скорость (частота) автоскролла
            'arrows': true, // отображение стрелок
            'selector': true, // отображение селекторов
            'thumbnail': true, // отображение миниатюр
            'thumbPos': 'bottom', // положение миниатюр (bottom, top, left, right)
            'thumbSize': 75, // размер превью
            'responsivity': 'parent', // 'parentHeight', 'parentWidth',
            'resolution': '3:2', //отношение сторон слайдера (ширина/высота)
            'caption': false, //подписи слайдеров
            'theme': 'default-theme', // тема оформления (имя файла .css в /css)
            'defaultImgResize': 'fill' //дефолтный стиль ресайза <img/> ('on-center' - по центру, 'stretch' - растянуть, 'on-size' - по размеру, 'fill' - заполнение)
        }, options);

        //todo оптимизировать вычисление динамических элементов

        this.each(function () {

            var $this = $(this),
                $parent = $this.parent(),
                $slideWrapper = $this.find('.slidewrapper'), //контейнер с слайдами
                $slide = $this.find('ul.slidewrapper li'), //контейнер слайда
                slideCount = $slideWrapper.children().size(), //количество слайдов
                thumbsPerSlide, //число превью на один слайд (для прокрутки превью)
                slideWidth, //ширина слайдера
                slideHeight, //высота слайдера
                image = new Image(),
                direction, //направление скролла превью слайдов

                $thumbnail = $parent.find('.thumbnail'),
                $thumbWrapper = $parent.find('.thumbnail-container'),
                $thumb = $parent.find('ul.thumbnail-container li'),
                thumbWidth,
                thumbHeight,
                $sliderControls = $('<div/>', { //контейнер селекторов
                    class: 'slider-controls'
                }),
                $controlSlide = $('<span/>', { //
                    class: 'control-slide'
                }),
                $caption = $('<div/>', {
                    class: 'caption'
                }),

                sliderTimer;

            $parent.addClass(settings.theme);

            $this.css({
                overflow: 'hidden',
                position: 'relative'
            });

            $thumbnail.css({
                overflow: 'hidden',
                position: 'absolute'
            });

            initSlider();

            function initSlider() { //инициализация(?) слайдера

                if (settings.arrows) {
                    addArrows()
                }

                if (settings.caption) {
                    addCaptions()
                }

                if (settings.thumbnail) {
                    addThumbnails()
                }

                if (settings.selector) {
                    addControls()
                }

                setSliderSize();
                drawSlider(slideWidth, slideHeight);

                resizeImg();

                setDirection();
                startAutoSlide();


            }

            function addArrows() {
                $this.append('<div class="arrow prev"></div><div class="arrow next"></div>');
            }

            function addCaptions() {
                $slide.each(function () {
                    var $cloneCap = $caption.clone();
                    $cloneCap.append('<h1>' + $(this).data('caption') + '</h1>');
                    $(this).append($cloneCap);
                });
            }

            function addThumbnails() { //добавляем превью

                if (settings.thumbnail == 'custom') {

                    thumbWidth = $thumb.width();
                    thumbHeight = $thumb.height();

                    //alert(thumbWidth + ' ' + thumbHeight);

                    if ($thumbWrapper.size() == 1) {
                        $thumbWrapper.children().each(function () {
                            $(this).click(function () {
                                setSlide($(this).index());
                            })
                        });
                    } else if ($thumbWrapper.size() == 0) {
                        alert('Контейнер .thumbnail-container не найден');
                    }
                } else {

                    var $thumbnail_ = $('<div/>', {
                        class: 'thumbnail',
                        style: 'overflow: hidden; position: absolute;'
                    });
                    var $thumbWrapper_ = $('<ul/>', {
                        class: 'thumbnail-container'
                        //width: slideCount * slideWidth
                    });
                    var $thumb_ = $('<li/>', {
                        style: 'background-size: cover;'
                    });

                    thumbWidth = settings.thumbSize;
                    thumbHeight = settings.thumbSize;

                    $slide.each(function () {
                        var $slide = $(this),
                            $imgSrc = $slide.find('img').attr('src');

                        $thumb_.css('background-image', 'url(' + $imgSrc + ')');
                        var $cloneThumb = $thumb_.clone();
                        $cloneThumb.click(function (event) {
                            event.preventDefault();
                            if (settings.thumbnail) {
                                if ((settings.thumbPos == 'top') || (settings.thumbPos == 'bottom')) {
                                    setSlide($slide.index());
                                } else if ((settings.thumbPos == 'left') || (settings.thumbPos == 'right')) {
                                    setSlide($slide.index());
                                }
                            }
                        });

                        $thumbWrapper_.append($cloneThumb);
                        $thumb_.removeClass('active');
                        $thumbnail_.append($thumbWrapper_);
                        $parent.append($thumbnail_);

                    });
                    /////////////////////////////////////////////////////////
                    //todo выяснить, почему затираются значения
                    $thumbnail = $parent.find('.thumbnail');
                    $thumbWrapper = $parent.find('.thumbnail-container');
                    $thumb = $parent.find('ul.thumbnail-container li');
                    /////////////////////////////////////////////////////////
                }




                if (settings.thumbnail) {
                    if ((settings.thumbPos == 'top') || (settings.thumbPos == 'bottom')) {
                        $thumbnail.append('<div class="arrow_thumb prev"></div><div class="arrow_thumb next"></div>');
                    } else if ((settings.thumbPos == 'left') || (settings.thumbPos == 'right')) {
                        $thumbnail.append('<div class="arrow_thumb_vert prev"></div><div class="arrow_thumb_vert next"></div>');
                    }
                }
            }

            function addControls() { //добавляем кружочки-селекторы
                $controlSlide.addClass('active');

                $slide.each(function () {
                    var $cloneSlide = $controlSlide.clone();
                    $cloneSlide.click(function (event) {
                        event.preventDefault();
                        if (settings.thumbnail) {
                            if ((settings.thumbPos == 'top') || (settings.thumbPos == 'bottom')) {
                                setSlide($(this).index());
                            } else if ((settings.thumbPos == 'left') || (settings.thumbPos == 'right')) {
                                setSlide($(this).index());
                            }
                        } else {
                            setSlide($(this).index());
                        }
                    });
                    $sliderControls.append($cloneSlide);

                    $controlSlide.removeClass('active');
                });
                $this.append($sliderControls);

                $sliderControls.css('margin-left', -$this.find('.control-slide').width() * slideCount / 2);
            }

            function setSliderSize() {
                var resArr = settings.resolution.split(':'),
                    resW = resArr[0],
                    resH = resArr[1];
                if (settings.responsivity == 'parent') {
                    slideWidth = $parent.width(); //ширина родителя слайдера
                    slideHeight = $parent.height(); //высота родителя слайдера
                } else if (settings.responsivity == 'parentWidth') {
                    slideWidth = $parent.width();
                    slideHeight = slideWidth / resW * resH;
                } else if (settings.responsivity == 'parentHeight') {
                    slideHeight = $parent.height();
                    slideWidth = slideHeight / resH * resW;
                }
            }

            function hideControls() { //скрываем "кружочки" и подписи, если они шире слайда, и показываем - если уже
                var controlsWidth = $sliderControls.width(),
                    _slideWidth = $slide.width();

                if (controlsWidth > _slideWidth) {
                    //alert('hide');
                    $sliderControls.fadeOut(1);
                    $slide.find('.caption').fadeOut(1);
                } else if (controlsWidth < _slideWidth) {
                    //alert('show');
                    $sliderControls.fadeIn(200);
                    $slide.find('.caption').fadeIn(200);
                }
            }

            function checkResizeStyle(_img) {
                var _return = false,
                    imageResizeStyles = ['on-center', 'stretch', 'on-size', 'fill'];
                for (i = 0; i < 4; i++) {
                    if (_img.hasClass(imageResizeStyles[i])) {
                        _return = true
                    }
                }
                return _return
            }

            function resizeImg() { //подгоняем <img/> под размеры слайдов

                $slide.each(function () {

                    var $slide = $(this),
                        $img = $slide.find('img'),
                        imageWidth,
                        imageHeight,
                        slideW = $slide.width(),
                        slideH = $slide.height();
                    image.src = $img.attr('src');
                    imageWidth = image.width;
                    imageHeight = image.height;

                    if (!checkResizeStyle($img)) {
                        $img.addClass(settings.defaultImgResize);
                    }

                    if ($img.hasClass('on-center')) {

                        //todo достаточно ли одного css?

                    } else if ($img.hasClass('stretch')) {

                        $img.height(slideH);
                        $img.width(slideW);

                    } else if ($img.hasClass('on-size')) {

                        if (slideW / imageWidth > slideH / imageHeight) {
                            $img.css('height', slideH);
                            $img.css('width', 'auto');
                        } else {
                            $img.css('width', slideW);
                            $img.css('height', 'auto');
                        }


                    } else if ($img.hasClass('fill')) {

                        if (slideW / imageWidth > slideH / imageHeight) {

                            $img.width(slideW);
                            $img.height(slideW / imageWidth * imageHeight);

                        } else {

                            $img.height(slideH);
                            $img.width(slideH / imageHeight * imageWidth);

                        }
                    }
                });
            }


            function drawSlider(_slideWidth, _slideHeight) { //задаем размеры динамических элементов слайдера
                $slideWrapper.attr('data-current', 0);
                $thumbWrapper.attr('data-current', 0);

                if (!settings.thumbnail) {

                    $this.height(_slideHeight);
                    $this.width(_slideWidth);

                    $slide.height(_slideHeight);
                    $slide.width(_slideWidth);


                } else {

                    $thumb.width(thumbWidth);
                    $thumb.height(thumbHeight);
                    console.log($thumb);
                    switch (settings.thumbPos) {

                        case 'bottom':

                            $slideWrapper.css({
                                left: -_slideWidth * $slideWrapper.data('current')
                            });

                            thumbsPerSlide = _slideWidth / thumbWidth;

                            $this.height(_slideHeight - thumbHeight);
                            $this.width(_slideWidth);

                            $slide.height(_slideHeight - thumbHeight);
                            $slide.width(_slideWidth);

                            $thumbnail.width(_slideWidth);
                            $thumbnail.height(thumbHeight);

                            $thumbWrapper.width(thumbWidth * slideCount);

                            break;

                        case 'top':

                            $slideWrapper.css({
                                left: -_slideWidth * $slideWrapper.data('current')
                            });

                            thumbsPerSlide = _slideWidth / thumbWidth;

                            $this.height(_slideHeight - thumbHeight);
                            $this.width(_slideWidth);

                            $slide.height(_slideHeight - thumbHeight);
                            $slide.width(_slideWidth);

                            $thumbnail.width(slideWidth);
                            $thumbnail.height(thumbHeight);

                            $thumbWrapper.width(thumbWidth * slideCount);

                            $thumbnail.css({
                                position: 'absolute',
                                top: 0
                            });

                            $this.css("margin-top", $thumb.height());

                            break;

                        case 'left':

                            $thumbnail.width(thumbWidth);
                            $thumbnail.height(_slideHeight);

                            thumbsPerSlide = _slideHeight / thumbHeight;


                            $slideWrapper.css({
                                left: -_slideWidth * $slideWrapper.data('current') + thumbWidth * $slideWrapper.data('current')
                            });

                            $this.width(_slideWidth - thumbWidth);
                            $this.height(_slideHeight);

                            $slide.width(_slideWidth - thumbWidth);
                            $slide.height(_slideHeight);

                            $thumbnail.width(thumbWidth);
                            $thumbnail.height($slide.height());

                            $thumbWrapper.width(thumbWidth);
                            $thumbWrapper.height($thumb.height() * slideCount);

                            $this.css("margin-left", thumbWidth + 'px');

                            $this.css('float', 'left');

                            $thumb.css('float', 'none');


                            break;


                        case 'right':

                            $thumbnail.width(thumbWidth);
                            $thumbnail.height(_slideHeight);

                            thumbsPerSlide = _slideHeight / thumbHeight;


                            $slideWrapper.css({
                                left: -_slideWidth * $slideWrapper.data('current') + thumbWidth * $slideWrapper.data('current')
                            });

                            $this.width(_slideWidth - thumbWidth);
                            $this.height(_slideHeight);

                            $slide.width(_slideWidth - thumbWidth);
                            $slide.height(_slideHeight);

                            $thumbnail.width(thumbWidth);
                            $thumbnail.height($slide.height());

                            $thumbWrapper.width(thumbWidth);
                            $thumbWrapper.height($thumb.height() * slideCount);

                            $thumbnail.css('margin-left', _slideWidth - thumbWidth);

                            $this.css("margin-right", thumbWidth + 'px');

                            $this.css('float', 'left');

                            $thumb.css('float', 'none');


                            break;
                        default :
                            alert('Неверное значение в thumbPos');
                    }
                }

                $thumb.first().addClass('active');
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

            //$thumbnail.hover(function () {
            //    $(window).bind('mousewheel DOMMouseScroll', function(event){
            //        if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
            //            prevThumbs(direction);
            //        }
            //        else {
            //            nextThumbs(direction);
            //        }
            //    });
            //});

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

            $parent.find('.arrow_thumb.next').click(function (event) {
                event.preventDefault();
                nextThumbs(direction);
            });

            $parent.find('.arrow_thumb.prev').click(function (event) {
                event.preventDefault();
                prevThumbs(direction);
            });


            $parent.find('.arrow_thumb_vert.next').click(function (event) {
                event.preventDefault();
                nextThumbs(direction);
            });

            $parent.find('.arrow_thumb_vert.prev').click(function (event) {
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

            function setSlide(index) { //функция, переключающая слайд по индексу
                var statedSlide = index;
                setThumbs(index, direction);

                $slideWrapper.animate({
                    left: -(statedSlide) * $slide.width()
                }, 500)
                    .data('current', statedSlide);

                changeControlSlide(statedSlide);

            }

            function changeControlSlide(index) { //функция, переключающая управляющие элементы в статус active
                $this.find('.control-slide.active').removeClass('active');
                $this.find('.control-slide:eq(' + index + ')').addClass('active');
                $parent.find('ul.thumbnail-container li.active').removeClass('active');
                $parent.find('ul.thumbnail-container li:eq(' + index + ')').addClass('active');
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

            function setThumbs(index) {

                var statedSlide = parseInt(index / thumbsPerSlide);
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