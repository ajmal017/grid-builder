var tetris = (function($) {
	'use strict';

    var $module, $addWidgetButton, $grid, $savedData, gridstack, gridOptions,
	removeWidgetHTML, updateImageHTML, removeImageHTML, staticGrid, textBoxInputHTML,
	textBoxInputDataHTML,

    setVars = function(){
        $module = $('.tetris-module');
        $addWidgetButton = $($module.find('#add-widget').selector);
        staticGrid = ($addWidgetButton.length) ? false : true;
        gridOptions = {
            cellHeight: 80,
            verticalMargin: 10,
            float: true,
            staticGrid: staticGrid,
            resizable: {
                handles: 'e, se, s, sw, w'
            }
        };
        $grid = $module.find('.grid-stack').gridstack(gridOptions);
        gridstack = $grid.data('gridstack');
        $savedData = $module.find('.saved-data');
        removeWidgetHTML = '<button type="button" class="remove-widget" name="button">Remove widget</button>';
        updateImageHTML = '<button type="button" class="update-image" name="button">Add image</button>';
        removeImageHTML = '<button type="button" class="remove-image hidden" name="button">Remove image</button>';
		textBoxInputHTML = '<textarea name="content" class="widget-text-content"></textarea>';
		textBoxInputDataHTML = '<input type="hidden" name="text-content-data">';
    },

    // Bind events

    bindEvents = function(){
        $addWidgetButton.on('click', function(){
            addNewWidget(null, null, 2, 2, true, guid());
        });

        $module.delegate('.remove-widget', 'click', removeWidget);
        $module.delegate('.update-image', 'click', updateImage);
        $module.delegate('.remove-image', 'click', removeImage);
		$module.delegate('.widget-text-content', 'blur', updateWidgetDataContent);

        $grid.on('change', saveGrid);
    },

    // Methods

    addNewWidget = function(x, y, width, height, autoPosition, id, src, content){
        var $el = $($.parseHTML("<div><div class=\"grid-stack-item-content\"><div/>"));
        gridstack.addWidget($el, x, y, width, height, autoPosition, null, null, null, null, id);
        addContent(id, src, content);
        saveGrid();
    },

    removeWidget = function(){
        gridstack.removeWidget($(this).parent().parent());
    },

    saveGrid = function(){
        var $gridItems = $grid.children();
        var data = _.map($gridItems, function(el){
            var $el = $(el);
            var node = $el.data('_gridstack_node');

            return{
                x: node.x,
                y: node.y,
                width: node.width,
                height: node.height,
				id: $el.attr('data-gs-id'),
                src: $el.attr('data-gs-src'),
				content: $el.find('input[name="text-content-data"]').val(),
            };
        });

        $savedData.val(JSON.stringify(data, null, ''));
    },

    loadGrid = function(){
        if($savedData.val() == '') return;

        gridstack.removeAll();
        var data = JSON.parse($savedData.val());
        var items = GridStackUI.Utils.sort(data);

        _.each(items, function(node){
            addNewWidget(node.x, node.y, node.width, node.height, false, node.id, node.src, node.content);
        });
    },

    addContent = function(id, src, content){
		if(!staticGrid) getWidget(id, true).append(removeWidgetHTML, updateImageHTML, removeImageHTML, textBoxInputHTML, textBoxInputDataHTML);
        if(src) updateWidgetDataImage(id, src);

		if(content){
			getWidget(id).find('input[name="text-content-data"]').val(content);
			getWidget(id).find('textarea').val(content);
		}
    },

    updateImage = function(){
        var id = $(this).parent().parent().attr('data-gs-id');
        var frame = wp.media({
            title: 'Select or Upload Media Of Your Chosen Persuasion',
            button:{
                text: 'Use this media'
            },
            multiple: false
        });

        frame.on('select', function() {
            var attachment = frame.state().get('selection').first().toJSON();

            updateWidgetDataImage(id, attachment.url);

            saveGrid();
        });

        frame.open();
    },

    removeImage = function(){
        var id = $(this).parent().parent().attr('data-gs-id');

        getWidget(id).removeAttr('data-gs-src');
        getWidget(id, true).css('background-image', "none");

        changeButtonStatus(id);
        saveGrid();
    },

    // Helpers

    updateWidgetDataImage = function(id, src){
        getWidget(id).attr('data-gs-src', src);
        getWidget(id, true).css('background-image', "url("+src+")");
        changeButtonStatus(id, src);
    },

	updateWidgetDataContent = function(){
		var id = $(this).parent().parent().attr('data-gs-id');
		getWidget(id).find('input[name="text-content-data"]').val(getWidget(id).find('textarea').val());
		saveGrid();
	},

    changeButtonStatus = function(id, src){
        if(src){
            getWidget(id, true).children('.update-image').text('Edit image');
        }else{
            getWidget(id, true).children('.update-image').text('Add image');
        }

        getWidget(id, true).children('.remove-image').toggleClass('hidden');
    },

    getWidget = function(id, content){
        if(content){
            return $('div[data-gs-id="'+id+'"] .grid-stack-item-content');
        }else{
            return $('div[data-gs-id="'+id+'"]');
        }
    },

    guid = function(){
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }

        return s4() + s4();
    },

    // Initialize

	ready = function() {
        setVars();

        if(!$module.length) return;

        bindEvents();

		if(!$savedData.length) return;

        loadGrid();
	};

	return{
		ready: ready,
	}

})(jQuery);

jQuery(tetris.ready);
