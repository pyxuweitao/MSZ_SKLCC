/**
需要引入bootstrap 3的相关文件和jQuery后使用
*/
(function() {
    jQuery.fn.number_keyboard = function(opt_in) {
        var opts = jQuery.extend({}, jQuery.fn.number_keyboard.defaults, opt_in);
        return this.each(function() {
            switch (opts.type) {
                case 'type_only_number':
                    type_name = jQuery.fn.number_keyboard.types.type_only_number;
                    break;
                case 'type_with_number_and_point':
                    type_name = jQuery.fn.number_keyboard.types.type_with_number_and_point;
                    break;
                default:
                    break;
            }
            $(this).popover({
                container: opts.container,
                trigger: opts.trigger,
                placement: opts.placement,
                content: function() {
                    return type_name();
                },
                html: true,
                template: '<div class="popover number_keyboard_element"><div class="arrow number_keyboard_element"><h3 class="popover-title number_keyboard_element"></h3></div><div class="popover-content number_keyboard_element"></div></div>'
            }).addClass("number_keyboard").on("show.bs.popover", function(e) {
                return jQuery.fn.number_keyboard.handle.on_show(e);
            }).on("hide.bs.popover", function(e) {
                return jQuery.fn.number_keyboard.handle.on_hide(e);
            }).on("blur", function(e) {
                return jQuery.fn.number_keyboard.handle.on_blur(e);
            }).on("focus", function(e) {
                if (!$(this).hasClass("number_keyboard_shown")) {
                    $(this).popover("show");
                }
            });
        });
    };
    jQuery.fn.number_keyboard.defaults = {
        type: "type_only_number",
        container: document.body,
        content: "",
        trigger: "manual",
        placement: "auto"
    };
    jQuery.fn.number_keyboard.handle = {
        on_show: function(e) {
            $("input.number_keyboard_shown").popover("hide");
            $(e.target).addClass("number_keyboard_shown");
        },
        on_hide: function(e) {
            $(e.target).removeClass("number_keyboard_shown");
        },
        on_blur: function(e) {
            if (!$(e.relatedTarget).hasClass("number_keyboard_element")) {
                $(e.target).popover("hide");
            }
        },
        on_number_click: function(e) {
            $("input.number_keyboard_shown").each(function() {
                this.value += $.trim(e.target.innerHTML);
                this.focus();
            });
        },
        on_delete_click: function(e) {
            $("input.number_keyboard_shown").each(function() {
                this.value = this.value.slice(0, -1);
                this.focus();
                $(this).triggerHandler("backspace.number_keyboard");
            });
        },
        on_complete_click: function(e) {
            $("input.number_keyboard_shown").each(function() {
                $(this).popover("hide");
                $(this).triggerHandler("finished.number_keyboard");//产生一个输入完成事件
            });
        }
    }
    jQuery.fn.number_keyboard.types = {};
    jQuery.fn.number_keyboard.types.type_only_number = function() {
        var div = document.createElement("div");
        $("div").addClass("number_keyboard_button");
        for (var i = 1; i < 10; i++) {
            $("<button tabindex='-1'>" + i + "</button>").appendTo(div).addClass("btn btn-default number_keyboard_element").on("click", function(e) {
                return jQuery.fn.number_keyboard.handle.on_number_click(e);
            }).css({
                margin: "2px 2px 2px 2px",
                width: "45px",
                height: "40px"
            });
            if (i % 3 == 0) {
                $("<br>").appendTo(div);
            }
        }
        $("<button tabindex='-1'>" + "0" + "</button>").appendTo(div).addClass("btn btn-default number_keyboard_element").on("click", function(e) {
            return jQuery.fn.number_keyboard.handle.on_number_click(e);
        }).css({
            margin: "2px 2px 2px 2px",
            width: "45px",
            height: "40px"
        });
        $("<button tabindex='-1'>" + "<span class='glyphicon glyphicon-arrow-left'></span>" + "</button>").appendTo(div).addClass("btn btn-default number_keyboard_element").on("click", function(e) {
            return jQuery.fn.number_keyboard.handle.on_delete_click(e);
        }).css({
            margin: "2px 2px 2px 2px",
            width: "45px",
            height: "40px"
        });
        $("<button tabindex='-1'>" + "<span class='glyphicon glyphicon-ok'></span>" + "</button>").appendTo(div).addClass("btn btn-default number_keyboard_element").on("click", function(e) {
            return jQuery.fn.number_keyboard.handle.on_complete_click(e);
        }).css({
            margin: "2px 2px 2px 2px",
            width: "45px",
            height: "40px"
        });
        return div;
    }
    jQuery.fn.number_keyboard.types.type_with_number_and_point = function() {
        var div = document.createElement("div");
        $("div").addClass("number_keyboard_button");
        for (var i = 1; i < 10; i++) {
            $("<button tabindex='-1'>" + i + "</button>").appendTo(div).addClass("btn btn-default number_keyboard_element").on("click", function(e) {
                return jQuery.fn.number_keyboard.handle.on_number_click(e);
            }).css({
                margin: "2px 2px 2px 2px",
                width: "45px",
                height: "40px"
            });
            if (i % 3 == 0) {
                $("<br>").appendTo(div);
            }
        }
        $("<button tabindex='-1'>" + "0" + "</button>").appendTo(div).addClass("btn btn-default number_keyboard_element").on("click", function(e) {
            return jQuery.fn.number_keyboard.handle.on_number_click(e);
        }).css({
            margin: "2px 2px 2px 2px",
            width: "45px",
            height: "40px"
        });
        $("<button tabindex='-1'>" + "." + "</button>").appendTo(div).addClass("btn btn-default number_keyboard_element").on("click", function(e) {
            return jQuery.fn.number_keyboard.handle.on_number_click(e);
        }).css({
            margin: "2px 2px 2px 2px",
            width: "45px",
            height: "40px"
        });
        $("<button tabindex='-1'>" + "<span class='glyphicon glyphicon-arrow-left'></span>" + "</button>").appendTo(div).addClass("btn btn-default number_keyboard_element").on("click", function(e) {
            return jQuery.fn.number_keyboard.handle.on_delete_click(e);
        }).css({
            margin: "2px 2px 2px 2px",
            width: "45px",
            height: "40px"
        });
        $("<br>").appendTo(div);
        $("<button tabindex='-1'>" + "<span class='glyphicon glyphicon-ok'></span>" + "</button>").appendTo(div).addClass("btn btn-default number_keyboard_element").on("click", function(e) {
            return jQuery.fn.number_keyboard.handle.on_complete_click(e);
        }).css({
            margin: "2px 2px 2px 2px",
            width: "143px",
            height: "40px"
        });
        return div;
    }
}());