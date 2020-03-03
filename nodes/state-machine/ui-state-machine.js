RED.nodes.registerType('ha-state-machine', {
    category: 'home_assistant',
    color: '#52C0F2',
    inputs: 1,
    outputs: 1,
    icon: 'font-awesome/fa-cogs',
    paletteLabel: 'state-machine',
    label: function() {
        return this.name || `state-machine`;
    },
    outputLabels: function(index) {
        const label = 'state';
        if (this.outputs > 1) {
            return this.states[index].name || 'state ' + index;
        }
        return label;
    },
    labelStyle: nodeVersion.labelStyle,
    defaults: {
        name: { value: '' },
        server: { value: '', type: 'server', required: true },
        version: { value: 1 },
        debugenabled: { value: false },
        outputs: { value: 1 },
        config: {
            value: [
                { property: 'name', value: '' },
                { property: 'device_class', value: '' },
                { property: 'icon', value: '' },
                { property: 'unit_of_measurement', value: '' }
            ]
        },
        attributes: { value: [] },
        resend: { value: true },
        outputLocation: { value: 'payload' },
        outputLocationType: { value: 'msg' },
        triggerProperty: { value: 'payload', required: true },
        triggerPropertyType: { value: 'msg', required: true },
        outputStateChangeOnly: { value: false },
        timeoutUnits: { value: 'seconds' },
        throwException: { value: false },
        discreteOutputs: { value: false },
        outputDotFileOnDeploy: { value: false },
        states: {
            value: [
                { name: 'start', stateTimeout: false },
                { name: '', stateTimeout: false },
                { name: '', stateTimeout: false },
                { name: '', stateTimeout: false }
            ],
            validate: function(states) {
                return (
                    states.length > 0 &&
                    states.every(state => {
                        return state.name.length !== 0;
                    })
                );
            }
        },
        transitions: {
            value: [
                { name: '', from: '', to: '', out: false },
                { name: '', from: '', to: '', out: false },
                { name: '', from: '', to: '', out: false }
            ],
            validate: function(transitions) {
                return (
                    transitions.length > 0 &&
                    transitions.every(function(transition) {
                        if (transition.name.length === 0) return false;
                        if (
                            transition.from !== '*' &&
                            !this.states.some(i => i.name === transition.from)
                        )
                            return false;
                        if (!this.states.some(i => i.name === transition.to))
                            return false;
                        return true;
                    }, this)
                );
            }
        }
    },
    oneditprepare: function() {
        nodeVersion.check(this);
        const node = this;
        const triggerTypes = ['msg', 'flow', 'global'];
        const attributeTypes = [
            'str',
            'num',
            'bool',
            'date',
            'jsonata',
            'msg',
            'flow',
            'global'
        ];

        haServer.init(node, '#node-input-server');

        exposeNode.init(node);

        $('#node-input-triggerProperty').typedInput({
            types: triggerTypes,
            typeField: '#node-input-triggerPropertyType',
            type: node.triggerPropertyType,
            default: 'msg'
        });

        $('#attributes')
            .editableList({
                removable: true,
                addButton: 'add attribute',
                header: $('<div>').append(
                    $.parseHTML(
                        "<div style='width:40%; display: inline-grid'>Attribute Key</div><div style='display: inline-grid'>Value</div>"
                    )
                ),
                addItem: function(container, index, data) {
                    const $row = $('<div />').appendTo(container);
                    $('<input />', {
                        type: 'text',
                        name: 'property',
                        style: 'width: 40%;margin-right: 5px;'
                    })
                        .attr('autocomplete', 'disable')
                        .appendTo($row)
                        .val(data.property);
                    const $value = $('<input />', {
                        type: 'text',
                        name: 'value',
                        style: 'width: 55%;'
                    })
                        .appendTo($row)
                        .val(data.value)
                        .typedInput({ types: attributeTypes });
                    $value.typedInput('type', data.valueType);
                }
            })
            .editableList('addItems', node.attributes);

        $('#config')
            .editableList({
                addButton: false,
                header: $('<div>Home Assistant Config (optional)</div>'),
                addItem: function(container, index, data) {
                    const $row = $('<div />').appendTo(container);
                    $('<input />', {
                        type: 'text',
                        name: 'property',
                        value: data.property,
                        style: 'width: 40%;',
                        readonly: true
                    }).appendTo($row);

                    $('<input />', {
                        type: 'text',
                        name: 'value',
                        value: data.value,
                        style: 'margin-left: 10px;width: 55%;'
                    })
                        .attr('autocomplete', 'disable')
                        .appendTo($row);
                }
            })
            .editableList('addItems', node.config);

        $('#node-input-outputLocation').typedInput({
            types: [
                'msg',
                'flow',
                'global',
                {
                    value: 'none',
                    label: 'None',
                    hasValue: false
                }
            ],
            typeField: '#node-input-outputLocationType',
            default: 'msg'
        });

        const outputStateChangeOnly = $('#node-input-outputStateChangeOnly');
        const discrete = $('#node-input-discreteOutputs');
        discrete.change(function() {
            const discreteChosen = discrete.is(':checked');
            if (discreteChosen) {
                outputStateChangeOnly.attr(
                    'data-user-choice',
                    outputStateChangeOnly.is(':checked')
                );
                outputStateChangeOnly
                    .prop('checked', true)
                    .attr('disabled', true);
            } else {
                outputStateChangeOnly.prop(
                    'checked',
                    outputStateChangeOnly.attr('data-user-choice')
                );
                outputStateChangeOnly
                    .removeAttr('disabled')
                    .removeAttr('data-user-choice');
            }
        });

        const outputCount = $('#node-input-outputDetails').val('{}');
        const statesList = $('#node-input-states-container');

        statesList.editableList({
            addItem: function(container, i, state) {
                if (typeof state.name !== 'string') state.name = '';
                if (!['number', 'string'].includes(typeof state.stateTimeout)) {
                    state.stateTimeout = '';
                }

                const row = $('<div/>', {
                    class: 'form-row',
                    style: 'display: flex; margin-bottom: 0;'
                }).appendTo(container);

                const stateField = $('<input/>', {
                    type: 'text',
                    style: 'margin-left: 5px; margin-bottom: 0; flex-grow: 5;',
                    class: 'node-input-state-value'
                })
                    .appendTo(row)
                    .focus();

                const timeoutField = $('<input/>', {
                    type: 'number',
                    style:
                        'margin-left: 5px; margin-bottom: 0;  min-width: 60px; width: 10%; flex-grow: 1;',
                    class: 'node-input-state-timeout'
                }).appendTo(row);

                stateField.change(function(event) {
                    const prevVal = $(this).data('prev');
                    const newVal = $(this)
                        .val()
                        .trim();

                    if (newVal.length === 0) {
                        $(
                            ".node-input-trigger-from-value option[value='" +
                                prevVal +
                                "']"
                        ).remove();
                        $(
                            ".node-input-trigger-to-value option[value='" +
                                prevVal +
                                "']"
                        ).remove();
                        return;
                    }

                    if (
                        $(
                            ".node-input-trigger-from-value option[value='" +
                                prevVal +
                                "']"
                        )
                            .attr('value', newVal)
                            .text(newVal).length === 0
                    ) {
                        $('.node-input-trigger-from-value').append(
                            $('<option>', { value: newVal, text: newVal })
                        );
                    }

                    if (
                        $(
                            ".node-input-trigger-to-value option[value='" +
                                prevVal +
                                "']"
                        )
                            .attr('value', newVal)
                            .text(newVal).length === 0
                    ) {
                        $('.node-input-trigger-to-value').append(
                            $('<option>', { value: newVal, text: newVal })
                        );
                    }

                    $(this).data('prev', newVal);
                });

                stateField.val(state.name);
                stateField.data('prev', state.name);
                timeoutField.val(state.stateTimeout);

                const currentOutputs = JSON.parse(outputCount.val() || '{}');
                currentOutputs[state.name] = i;
                outputCount.val(JSON.stringify(currentOutputs));
            },
            removeItem: function(state) {
                const currentOutputs = JSON.parse(outputCount.val() || '{}');
                delete currentOutputs[state.name];

                let select = $('.node-input-trigger-from-value').filter(
                    function(index, element) {
                        return element.value === state.name;
                    }
                );
                $(
                    ".node-input-trigger-from-value option[value='" +
                        state.name +
                        "']"
                ).remove();

                select.each(function(i, from) {
                    from.value = null;
                });

                select = $('.node-input-trigger-to-value').filter(function(
                    index,
                    element
                ) {
                    return element.value === state.name;
                });
                $(
                    ".node-input-trigger-to-value option[value='" +
                        state.name +
                        "']"
                ).remove();

                select.each(function(i, to) {
                    to.value = null;
                });

                outputCount.val(JSON.stringify(currentOutputs));
            },
            sortItems: function(opt) {
                const currentOutputs = JSON.parse(outputCount.val() || '{}');

                const states = $('#node-input-states-container').editableList(
                    'items'
                );

                states.each(function(i) {
                    const state = $(this)
                        .find('.node-input-state-value')
                        .val();

                    $('.node-input-trigger-from-value').each(function() {
                        $(this)
                            .find("option[value='" + state + "']")
                            .insertBefore(
                                $(this).find('option:eq(' + (i + 1) + ')')
                            );
                    });

                    $('.node-input-trigger-to-value').each(function() {
                        $(this)
                            .find("option[value='" + state + "']")
                            .insertBefore($(this).find('option:eq(' + i + ')'));
                    });
                });
                outputCount.val(JSON.stringify(currentOutputs));
            },
            sortable: true,
            removable: true,
            scrollOnAdd: true,
            height: 'auto',
            header: $('<div>').append(
                $.parseHTML(
                    "<div style='width:55%; display: inline-grid; margin-left: 30px;'>State Name</div><div style='min-width:10%; display: inline-grid; margin-right: 20px; float: right;'>Timeout</div>"
                )
            ),
            addButton: 'add state'
        });

        const transitionsList = $('#node-input-transitions-container');

        transitionsList.editableList({
            addItem: function(container, i, transition) {
                if (!Object.prototype.hasOwnProperty.call(transition, 'name')) {
                    transition = { name: '', from: '', to: '' };
                }

                const row = $('<div/>', {
                    class: 'form-row',
                    style: 'display: flex; margin-bottom: 0;'
                }).appendTo(container);

                const triggerField = $('<input/>', {
                    type: 'text',
                    style: 'margin-left: 5px; margin-bottom: 0;',
                    class: 'node-input-trigger-value'
                })
                    .appendTo(row)
                    .focus();

                triggerField.val(transition.name);

                const row2 = $('<div/>', {
                    class: 'form-row',
                    style: 'display:inherit; margin-bottom: 0;'
                }).appendTo(row);

                const fromField = $('<select/>', {
                    style: 'margin-left: 5px; margin-bottom: 0; width: auto;',
                    class: 'node-input-trigger-from-value'
                }).appendTo(row2);

                row2.append('<span> &#8594; </span>');

                const toField = $('<select/>', {
                    style: 'margin-left: 5px; margin-bottom: 0; width: auto;',
                    class: 'node-input-trigger-to-value'
                }).appendTo(row2);

                fromField.append($('<option>', { value: '*', text: '*' }));

                const states = $('#node-input-states-container').editableList(
                    'items'
                );
                states.each(function(i) {
                    const state = $(this)
                        .find('.node-input-state-value')
                        .val();
                    if (state !== '') {
                        fromField.append(
                            $('<option>', { value: state, text: state })
                        );
                        toField.append(
                            $('<option>', { value: state, text: state })
                        );
                    }
                });

                fromField.val(transition.from);
                toField.val(transition.to);
            },
            sortable: true,
            removable: true,
            height: 'auto',
            scrollOnAdd: true,
            header: $('<div>').append(
                $.parseHTML(
                    "<div style='width:55%; display: inline-grid; margin-left: 30px;'>Trigger</div><div style='display: inline-grid'>From &#8594; To</div>"
                )
            ),

            addButton: 'add transition'
        });

        statesList.editableList('addItems', this.states);
        transitionsList.editableList('addItems', this.transitions);
    },
    oneditsave: function() {
        const node = this;
        node.attributes = [];
        node.config = [];
        nodeVersion.update(this);

        $('#attributes')
            .editableList('items')
            .each(function(i) {
                const $row = $(this);
                node.attributes.push({
                    property: $row.find('input[name=property]').val(),
                    value: $row.find('input[name=value]').typedInput('value'),
                    valueType: $row.find('input[name=value]').typedInput('type')
                });
            });

        $('#config')
            .editableList('items')
            .each(function(i) {
                const $row = $(this);
                node.config.push({
                    property: $row.find('input[name=property]').val(),
                    value: $row.find('input[name=value]').val()
                });
            });

        node.states = [];
        $('#node-input-states-container')
            .editableList('items')
            .each(function(i) {
                const state = $(this)
                    .find('.node-input-state-value')
                    .val()
                    .trim();
                let stateTimeout = $(this)
                    .find('.node-input-state-timeout')
                    .val()
                    .trim();
                stateTimeout = /^[1-9]\d*$/.test(stateTimeout)
                    ? stateTimeout
                    : false;
                if (state.length > 0) {
                    node.states.push({
                        name: state,
                        stateTimeout: stateTimeout
                    });
                }
            });

        node.transitions = [];
        $('#node-input-transitions-container')
            .editableList('items')
            .each(function(i) {
                const trigger = $(this)
                    .find('.node-input-trigger-value')
                    .val()
                    .trim();
                if (trigger.length > 0) {
                    node.transitions.push({
                        name: trigger,
                        from: $(this)
                            .find('.node-input-trigger-from-value')
                            .val(),
                        to: $(this)
                            .find('.node-input-trigger-to-value')
                            .val()
                    });
                }
            });

        let outputs = 0;
        if ($('#node-input-outputLocationType').val() === 'msg') {
            outputs = !$('#node-input-discreteOutputs').is(':checked')
                ? 1
                : Object.keys(JSON.parse($('#node-input-outputDetails').val()))
                      .length;
        }

        $('#node-input-outputs').val(outputs);
        node.outputs = outputs;
    }
});
