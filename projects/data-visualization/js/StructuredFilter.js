(function ($, undefined) {

    // - field types
    var fTypes = {
            text: 'text',
            number: 'number',
            datetime: 'datetime',
            date: 'date',
            time: 'time'
        },

        // - i18n strings (to translate in other languages)
        i18n = {
            sEqual: 'equals',
            sNotEqual: 'not equal',
            sStart: 'starts with',
            sContain: 'contains',
            sNotContain: 'doesn\'t contain',
            sFinish: 'finishes with',
            sBefore: 'before',
            sAfter: 'after',
            sNumEqual: '&#61;',
            sNumNotEqual: '!&#61;',
            sGreater: '&#62;&#61;',
            sSmaller: '&#60;&#61;',
            sOn: 'on',
            sNotOn: 'not on',
            sAt: 'at',
            sNotAt: 'not at',
            sBetween: 'between',
            sNotBetween: 'not between',
            opAnd: 'and',
            bNewCond: 'New filter condition',
            bAddCond: 'Add condition',
            bUpdateCond: 'Update condition',
            bSubmit: 'Filter',
            bCancel: 'Cancel'
        },

        // - list of operators (for conditions)
        evoAPI = {
            sEqual: 'eq',
            sNotEqual: 'ne',
            sStart: 'sw',
            sFinish: 'fw',
            sContain: 'ct',
            sNotContain: 'nct',
            sGreater: 'gt',
            sSmaller: 'lt',
            sBetween: 'bw',
            sNotBetween: 'nbw'
        },
        isNotFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') === -1;

    $.widget('evol.structFilter', {

        options: {
            fields: [],
            dateFormat: 'dd/mm/yy',
            highlight: true,
            buttonLabels: false,
            submitButton: false
        },

        _create: function () {
            var bLabels = this.options.buttonLabels,
                that = this,
                e = this.element,
                fnLink = function (css, label, hidden) {
                    return '<a class="' + css + '"' + (hidden ? ' style="display:none;"' : '') +
                        ' href="javascript:void(0)">' + label + '</a>';
                },
                h = '<div class="evo-searchFilters"></div>';
            h += '<div class="evo-searchMenu">';
            h += fnLink('evo-bNew', i18n.bNewCond);
            h += '<div class="evo-editFilter"></div>' +
                fnLink('evo-bAdd', i18n.bAddCond, true) +
                fnLink('evo-bDel', i18n.bCancel, true);
            if (this.options.submitButton) {
                h += fnLink('evo-bSubmit', i18n.bSubmit);
            }
            h += '</div>';
            this._step = 0;
            e.addClass('structFilter ui-widget-content ui-corner-all')
                .html(h);
            // - button submit
            if (this.options.submitButton) {
                this._bSubmit = e.find('.evo-bSubmit').button({
                    showLabel: bLabels
                }).on('click', function (e) {
                    that.element.trigger('submit.search');
                });
            }
            // - editor button new
            this._bNew = e.find('.evo-bNew').button({
                showLabel: bLabels,
                icon: 'ui-icon-plusthick',
                iconPosition: 'end'
            }).on('click', function (e) {
                if (that._step < 1) {
                    that._setEditorField();
                    that._step = 1;
                }
                that._bAdd.find('.ui-button-text').html(i18n.bAddCond);
            });
            // - editor button add
            this._bAdd = e.find('.evo-bAdd').button({
                showLabel: bLabels,
                icon: 'ui-icon-check',
                iconPosition: 'end'
            }).on('click', function (evt) {
                var data = that._getEditorData();
                if (that._cFilter) {
                    that._enableFilter(data, that.options.highlight);
                } else {
                    that.addCondition(data);
                }
                that._removeEditor();
            });
            // - editor button cancel
            this._bDel = e.find('.evo-bDel').button({
                showLabel: bLabels,
                icon: 'ui-icon-close',
                iconPosition: 'end'
            }).on('click', function (evt) {
                that._removeEditor();
            });
            this._editor = e.find('.evo-editFilter')
                .on('change', '#field', function (evt) {
                    evt.stopPropagation();
                    if (that._step > 2) {
                        that._editor.find('#value,#value2,#valuebw,#valuebw2,.as-Txt').remove();
                    }
                    if (that._step > 1) {
                        that._editor.find('#operator').remove();
                        that._bAdd.hide();
                    }
                    that._step = 1;
                    var fieldID = $(evt.currentTarget).val();
                    if (fieldID !== '') {
                        that._field = that._getFieldById(fieldID);
                        that._type = that._field.type;
                        that._setEditorOperator();
                    } else {
                        that._field = that._type = null;
                    }
                }).on('change', '#operator', function (evt) {
                    evt.stopPropagation();
                    that._operator = $(this).val();
                    if (that._step > 2) {
                        that._editor.find('#value,#value2,#valuebw,#valuebw2,.as-Txt').remove();
                        that._bAdd.hide();
                        that._step = 2;
                    }
                    that._setEditorValue();
                }).on('change keyup', '#value,#value2,#valuebw,#valuebw2', function (evt) {
                    evt.stopPropagation();
                    var fType = that._type,
                        value = that._editor.find('#value').val(),
                        valid = value !== '';
                    if (fType == fTypes.number) {
                        valid = valid && !isNaN(value);
                    }
                    if (fType == fTypes.datetime) {
                        var value2 = that._editor.find('#value2').val();
                        valid = valid && value2 !== '';
                    }
                    if (that._operator == evoAPI.sBetween || that._operator == evoAPI.sNotBetween) {
                        var valuebw = that._editor.find('#valuebw').val();
                        valid = valid && valuebw !== '';
                        if (fType == fTypes.number) {
                            valid = valid && !isNaN(valuebw);
                        }
                        if (fType == fTypes.datetime) {
                            var valuebw2 = that._editor.find('#valuebw2').val();
                            valid = valid && valuebw2 !== '';
                        }
                    }
                    if (valid) {
                        that._bAdd.button('enable');
                        if (evt.which == 13) {
                            that._bAdd.trigger('click');
                        }
                    } else {
                        that._bAdd.button('disable');
                    }
                }).on('click', '#checkAll', function () {
                    var $this = $(this),
                        vc = $this.prop('checked');
                    allChecks = $this.siblings().prop('checked', vc);
                });
            this._filters = e.find('.evo-searchFilters').on('click', 'a', function () {
                that._editFilter($(this));
            }).on('click', 'a .ui-button-icon', function (evt) {
                evt.stopPropagation();
                var filter = $(this).parent();
                if (!filter.hasClass('ui-state-disabled')) {
                    filter.fadeOut('slow', function () {
                        filter.remove();
                        that._triggerChange();
                    });
                }
            });
        },

        _getFieldById: function (fId) {
            if (!this._hash) {
                this._hash = {};
                var fields = this.options.fields;
                for (var i = 0, iMax = fields.length; i < iMax; i++) {
                    this._hash[fields[i].id] = fields[i];
                }
            }
            return this._hash[fId];
        },

        _removeEditor: function () {
            this._editor.empty();
            this._bAdd.hide();
            this._bDel.hide();
            this._enableFilter(null, false);
            this._bNew.removeClass('ui-state-active').show();
            if (this._bSubmit) {
                this._bSubmit.removeClass('ui-state-active').show();
            }
            if (isNotFirefox) {
                // setting focus w/ ff takes too long
                this._bNew.focus();
            }
            this._step = 0;
            this._field = this._type = this._operator = null;
        },

        addCondition: function (filter) {
            var f = $('<a href="javascript:void(0)"><span>' + this._htmlFilter(filter) + '</span></a>')
                .prependTo(this._filters)
                .button({
                    icon: 'ui-icon-close',
                    iconPosition: 'end'
                })
                .data('filter', filter)
                .fadeIn();
            if (this.options.highlight) {
                f.effect('highlight');
            }
            this._triggerChange();
            if (this._bSubmit) {
                this._bSubmit.removeClass('ui-state-active').show();
            }
            return this;
        },

        removeCondition: function (index) {
            this._filters.children().eq(index).remove();
            this._triggerChange();
            return this;
        },

        _htmlFilter: function (filter) {
            var h = '<span class="evo-lBold">' + filter.field.label + '</span> ' +
                '<span class="evo-lLight">' + filter.operator.label + '</span> ' +
                '<span class="evo-lBold">' + filter.value.label + '</span>';
            if (filter.operator.value == evoAPI.sBetween || filter.operator.value == evoAPI.sNotBetween) {
                h += '<span class="evo-lLight"> ' + i18n.opAnd + ' </span>' +
                    '<span class="evo-lBold">' + filter.value.labelbw + '</span>';
            }
            return h;
        },

        _enableFilter: function (filter, anim) {
            if (this._cFilter) {
                this._cFilter.button('enable').removeClass('ui-state-hover ui-state-active');
                if (anim) {
                    this._cFilter.effect('highlight');
                }
                if (filter) {
                    this._cFilter.data('filter', filter)
                        .find(':first-child').html(this._htmlFilter(filter));
                    this._cFilter = null;
                    this._triggerChange();
                } else {
                    this._cFilter = null;
                }
            }
        },

        _editFilter: function ($filter) {
            var filter = $filter.data('filter'),
                fid = filter.field.value,
                ft = filter.type,
                op = filter.operator.value,
                fv = filter.value;
            this._enableFilter(null, false);
            this._removeEditor();
            this._cFilter = $filter.button('disable');
            this._setEditorField(fid);
            this._setEditorOperator(op);
            var opBetween = op == evoAPI.sBetween || op == evoAPI.sNotBetween;
            if (opBetween) {
                if (ft == fTypes.datetime) {
                    this._setEditorValue(fv.value, fv.value2, fv.valuebw, fv.valuebw2);
                } else {
                    this._setEditorValue(fv.value, fv.valuebw);
                }
            } else {
                if (ft == fTypes.datetime) {
                    this._setEditorValue(fv.value, fv.value2);
                } else {
                    this._setEditorValue(fv.value);
                }
            }
            this._bAdd.find('.ui-button-text').html(i18n.bUpdateCond);
            this._step = 3;
        },

        _setEditorField: function (fid) {
            if (this._step < 1) {
                this._bNew.stop().hide();
                if (this._bSubmit) {
                    this._bSubmit.stop().hide();
                }
                this._bDel.show();
                if (!this._fList) {
                    var h = '<select id="field">' + EvoUI.optNull;
                    h += this.options.fields.map(function (f) {
                        return EvoUI.inputOption(f.id, f.label);
                    });
                    h += '</select>';
                    this._fList = h;
                }
                $(this._fList).appendTo(this._editor).focus();
            }
            if (fid) {
                this._field = this._getFieldById(fid);
                this._type = this._field.type;
                this._editor.find('#field').val(fid);
            }
            this._step = 1;
        },

        _setEditorOperator: function (cond) {
            var fType = this._type;
            if (this._step < 2) {
                var h = '',
                    opt = EvoUI.inputOption;
                h += '<select id="operator">' + EvoUI.optNull;
                switch (fType) {
                    case fTypes.datetime:
                    case fTypes.date:
                    case fTypes.time:
                        if (fType == fTypes.time) {
                            h += opt(evoAPI.sEqual, i18n.sAt) +
                                opt(evoAPI.sNotEqual, i18n.sNotAt);
                        } else {
                            h += opt(evoAPI.sEqual, i18n.sOn) +
                                opt(evoAPI.sNotEqual, i18n.sNotOn);
                        }
                        h += opt(evoAPI.sGreater, i18n.sAfter) +
                            opt(evoAPI.sSmaller, i18n.sBefore) +
                            opt(evoAPI.sBetween, i18n.sBetween) +
                            opt(evoAPI.sNotBetween, i18n.sNotBetween);
                        break;
                    case fTypes.number:
                        h += opt(evoAPI.sEqual, i18n.sNumEqual) +
                            opt(evoAPI.sNotEqual, i18n.sNumNotEqual) +
                            opt(evoAPI.sGreater, i18n.sGreater) +
                            opt(evoAPI.sSmaller, i18n.sSmaller) +
                            opt(evoAPI.sBetween, i18n.sBetween) +
                            opt(evoAPI.sNotBetween, i18n.sNotBetween);
                        break;
                    default:
                        h += opt(evoAPI.sEqual, i18n.sEqual) +
                            opt(evoAPI.sNotEqual, i18n.sNotEqual) +
                            opt(evoAPI.sStart, i18n.sStart) +
                            opt(evoAPI.sFinish, i18n.sFinish) +
                            opt(evoAPI.sContain, i18n.sContain) +
                            opt(evoAPI.sNotContain, i18n.sNotContain);
                        break;
                }
                h += '</select>';
                this._editor.append(h);
            }
            if (cond) {
                this._editor.find('#operator').val(cond);
                this._operator = cond;
            }
            this._step = 2;
        },

        _setEditorValue: function (v, v2, v3, v4) {
            var editor = this._editor,
                fld = this._field,
                fType = this._type,
                opVal = editor.find('#operator').val(),
                opBetween = false,
                addOK = true;
            if (opVal !== '') {
                if (this._step < 3) {
                    var h = '';
                    opBetween = (opVal == evoAPI.sBetween || opVal == evoAPI.sNotBetween);
                    switch (fType) {
                        case fTypes.datetime:
                            h += '<input id="value" type="text"/>';
                            h += '<input id="value2" type="' + fTypes.time + '" step="1"/>';
                            if (opBetween) {
                                h += '<span class="as-Txt">' + i18n.opAnd + ' </span>' +
                                    '<input id="valuebw" type="text"/>' +
                                    '<input id="valuebw2" type="' + fTypes.time + '" step="1"/>';
                            }
                            break;
                        case fTypes.date:
                            h += '<input id="value" type="text"/>';
                            if (opBetween) {
                                h += '<span class="as-Txt">' + i18n.opAnd + ' </span>' +
                                    '<input id="valuebw" type="text"/>';
                            }
                            break;
                        case fTypes.time:
                            h += '<input id="value" type="' + fTypes.time + '" step="1"/>';
                            if (opBetween) {
                                h += '<span class="as-Txt">' + i18n.opAnd + ' </span>' +
                                    '<input id="valuebw" type="' + fTypes.time + '" step="1"/>';
                            }
                            break;
                        case fTypes.number:
                            h += '<input id="value" type="' + fTypes.number + '"/>';
                            if (opBetween) {
                                h += '<span class="as-Txt">' + i18n.opAnd + ' </span>' +
                                    '<input id="valuebw" type="' + fTypes.number + '"/>';
                            }
                            break;
                        default:
                            h += '<input id="value" type="' + fType + '"/>';
                            if (opBetween) {
                                h += '<span class="as-Txt">' + i18n.opAnd + ' </span>' +
                                    '<input id="valuebw" type="' + fType + '"/>';
                            }
                            break;
                    }
                    editor.append(h);
                    if (fType == fTypes.date || fType == fTypes.datetime) {
                        editor.find('#value,#valuebw').datepicker({dateFormat: this.options.dateFormat});
                    }
                }
                if (v) {
                    var $value = editor.find('#value');
                    $value.val(v);
                    addOK = v !== '';
                    if (fType == fTypes.datetime) {
                        $value.next().val(v2);
                        addOK = addOK && v2 !== '';
                        if (opBetween) {
                            $value.next().next().next().val(v3);
                            addOK = addOK && v3 !== '';
                            $value.next().next().next().next().val(v4);
                            addOK = addOK && v4 !== '';
                        }
                    } else {
                        if (opBetween) {
                            $value.next().next().val(v2);
                            addOK = addOK && v2 !== '';
                        }
                    }
                } else {
                    addOK = false;
                }
                this._bAdd.button(addOK ? 'enable' : 'disable').show();
                this._step = 3;
            }
        },

        _getEditorData: function () {
            var e = this._editor,
                f = e.find('#field'),
                v = e.find('#value'),
                filter = {
                    field: {
                        label: f.find('option:selected').text(),
                        value: f.val()
                    },
                    operator: {},
                    value: {}
                },
                op = filter.operator,
                fv = filter.value;
            filter.type = this._type;

            // Operation
            var o = e.find('#operator'),
                opVal = o.val();
            op.label = o.find('option:selected').text();
            op.value = opVal;

            // Value
            if (this._type == fTypes.datetime) {
                fv.label = v.val() + " " + v.next().val();
                fv.value = v.val();
                fv.value2 = v.next().val();
                if (opVal == evoAPI.sBetween || opVal == evoAPI.sNotBetween) {
                    fv.labelbw = v.next().next().next().val() + " " + v.next().next().next().next().val();
                    fv.valuebw = v.next().next().next().val();
                    fv.valuebw2 = v.next().next().next().next().val();
                }
            } else {
                if (this._type == fTypes.number
                    || this._type == fTypes.date || this._type == fTypes.time) {
                    fv.label = v.val();
                } else {
                    fv.label = '"' + v.val() + '"';
                }
                fv.value = v.val();

                if (opVal == evoAPI.sBetween || opVal == evoAPI.sNotBetween) {
                    if (this._type == fTypes.number
                        || this._type == fTypes.date || this._type == fTypes.time) {
                        fv.labelbw = v.next().next().val();
                    } else {
                        fv.labelbw = '"' + v.next().next().val() + '"';
                    }
                    fv.valuebw = v.next().next().val();
                }
            }
            return filter;
        },

        _triggerChange: function () {
            this.element.trigger('change.search');
        },

        val: function (value) {
            // - sets or returns filter object
            if (typeof value == 'undefined') {
                // --- get value
                var ret = [];
                this._filters.find('a').each(function () {
                    ret.push($(this).data('filter'));
                });
                return ret;
            } else {
                // --- set value
                this._filters.empty();
                for (var i = 0, iMax = value.length; i < iMax; i++) {
                    this.addCondition(value[i]);
                }
                this._triggerChange();
                return this;
            }
        },

        valText: function () {
            // - returns filter "text" value as displayed to the user.
            var ret = [];
            this._filters.find('a').each(function () {
                ret.push(this.text);
            });
            return ret.join(' ' + i18n.opAnd + ' ');
        },

        valUrl: function () {
            // - returns filter url
            var vs = this.val(),
                iMax = vs.length,
                url = 'filters=' + iMax;
            if (iMax < 1) {
                return '';
            }
            vs.forEach(function (v, idx) {
                url += '&field-' + idx + '=' + v.field.value +
                    '&operator-' + idx + '=' + v.operator.value +
                    '&value-' + idx + '=' + encodeURIComponent(v.value.value);
                if (v.type == fTypes.datetime) {
                    url += '&value2-' + idx + '=' + encodeURIComponent(v.value.value2);
                    if (v.operator.value == evoAPI.sBetween || v.operator.value == evoAPI.sNotBetween) {
                        url += '&valuebw-' + idx + '=' + encodeURIComponent(v.value.valuebw);
                        url += '&valuebw2-' + idx + '=' + encodeURIComponent(v.value.valuebw2);
                    }
                } else {
                    if (v.operator.value == evoAPI.sBetween || v.operator.value == evoAPI.sNotBetween) {
                        url += '&valuebw-' + idx + '=' + encodeURIComponent(v.value.valuebw);
                    }
                }
            });
            url += '&label=' + encodeURIComponent(this.valText());
            return url;
        },

        clear: function () {
            this._cFilter = null;
            this._removeEditor();
            this._filters.empty();
            this._triggerChange();
            return this;
        },

        length: function () {
            return this._filters.children().length;
        },

        destroy: function () {
            var e = this.element.off();
            e.find('.evo-bNew,.evo-bAdd,.evo-bDel,.evo-searchFilters').off();
            this._editor.off();
            e.clear().removeClass('structFilter ui-widget-content ui-corner-all');
            $.Widget.prototype.destroy.call(this);
        }

    });

// - helpers to generate HTML
    var EvoUI = {
        inputOption: function (fID, fV) {
            return '<option value="' + fID + '">' + fV + '</option>';
        },

        optNull: '<option value=""></option>'
    };
})(jQuery);
