# State Machine

A node that implements a finite state machine using messages to trigger state transitions. Node will create a sensor entity in Home Assistant for tracking the state, and any desired attributes. State Machine state is also persistent and will be recovered on restart of the flow.

::: warning
_Needs [Custom Integration](https://github.com/zachowj/hass-node-red) installed
in Home Assistant for this node to function_
:::

## Details

The state machine will always start in the first state of the list of states when it is first deployed. After deployment, the state will be persisent across restarts.

- The node will check the `trigger input` property on the receipt of any message. This allows it to use global and flow context properties as triggers but state transitions will only occur on message receipt.
- If the value of the `trigger input` property matches one of the `transition trigger` for a transition in the current state, that transition will be actioned and the state changed to the new state. `trigger input` values that do not match a `transition trigger` for the current state do not trigger any state change. If the `Throw error on invalid transition` is checked, the node will throw an error and stop the flow if the `trigger input` does not match a valid transition trigger for the current state.
- At start up, the node will emit a message with the initial state if the `state output` property is set to a `msg` property.
- Transitions with a `transition from` state of `*` are actioned for all states.

## Configuration

### Trigger <Badge text="required"/>

- Type: `string | number | boolean`

The property to use as the trigger source

### Output Location <Badge text="required"/>

The location to output the state value to.

###

### Attributes

- Type: `Object`

Key/Value pair of attributes to update. The key should be a string and value can be a [string | number | boolean | object]

### Home Assistant Config

- Type: `Object`

Configuration options available for the selected entity

### Resend state and attributes

- Type: `boolean`

When creating the entity in Home Assistant this will also send the last updated state and attributes then node sent to Home Assistant

::: danger WARNING
Entity nodes will not work in a subflow due to the way they register themselves
with Home Assistant. After a Node-RED restart a new entity will be created in
Home Assistant.
:::

### Use discrete outputs for states

If checked, a separate output will be created for each `state` in the state list. Otherwise, only a single output will be used.

### Output only on state change

If checked, the node will only send an output message if the state changes. If attributes are provided, it will update Home Assistant on every trigger, but will still only send an output message if the state actually changes.

### Throw Error on Invalid Transition

If the `Throw error on invalid transition` is checked, the node will throw an error and stop the flow if the `trigger input` does not match a valid transition trigger for the current state.

### Output GraphVis Dot File on Deploy

If checked, when this node is deployed it will output a `.dot` file string that can be used with [GraphViz](https://www.graphviz.org/) to view a graphical visualization of your states and transistions. See [here for more detail](https://github.com/jakesgordon/javascript-state-machine/blob/master/docs/visualization.md).

## States and Transitions

### States <Badge text="required"/>

a list of the valid states for the finite state machine

### State Timeout

Each state can have a timeout set. When entering this state, a timer will be started. If the state does not change before the timer ends, the node will automatically do one of the following:

- If a tranistion is defined from this state with trigger of `timeout`, this transition will be called.
- If a `timeout` transition does not exist for this state, the state machine will move to the next state in the list.
- In either case, a manual timeout may be triggered by sending `timeout` as the trigger value.

### Transition TRIGGER

The node will check the `trigger input` property on the receipt of any message. This allows it to use global and flow context properties as triggers but state transitions will only occur on message receipt.

If the value of the `trigger input` property matches one of the `transition trigger` for a transition in the current state, that transition will be actioned and the state changed to the new state. `trigger input` values that do not match a `transition trigger` for the current state do not trigger any state change.

### Transition FROM state

the state the transition will move from. Transitions with a `transition from` state of `*` wildcards and are actioned for all states.

### Transition TO state

the state the transition will move to

## Inputs

Default properties can be overriden by passing in the following in `msg`.

### msg.timeout

- Type: `number`

Override the default timeout for this state. If the timeout is equal to zero the node will wait indefinitely for the condition to be met.

### msg.timeoutUnits

- Values: `milliseconds | seconds | minutes | hours | days`

Override the default timeout unit for the timeout.

### msg.initialize

If the message has this property, the state machine will be reset back to the first state. You can customize a different `reset` transition manually by using a wildcard (`*`) transition, but `msg.initialize` will always be added as a default.

### msg.forceState

- Type: `string`

If `msg.forceState` is set to a valid state, the state machine will forcefully jump to that state. This skips all timeouts and transitions. Where possible, a wildcard (`*`) transition should be used instead.

### msg.reset

If the message has this property, any running timers will be reset and the state will remain the same. To force a transition (e.g. "finish" the timer), send `timeout` as the trigger instead.

### msg.attributes

- Type: `Object`

Key/Value pair of attributes to update. The key should be a string and value can be a `[string | number | boolean | object]`

<!-- TODO: outputs -->

### References

- [Javascript State Machine](https://www.npmjs.com/package/javascript-state-machine) - full documentation of Javascript State Machine library.
