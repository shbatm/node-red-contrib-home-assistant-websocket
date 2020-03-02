# State Machine

A node that implements a finite state machine using messages to trigger state transitions. Node will create a sensor entity in Home Assistant for tracking the state, and any desired attributes. State Machine state is also persistent and will be recovered on restart of the flow.

::: warning
_Needs [Custom Integration](https://github.com/zachowj/hass-node-red) installed
in Home Assistant for this node to function_
:::

## Details

The state machine will always start in the first state of the list of states.

The node will check the `trigger input` property on the receipt of any message. This allows it to use global and flow context properties as triggers but state transitions will only occur on message receipt.

If the value of the `trigger input` property matches one of the `transition trigger` for a transition in the current state, that transition will be actioned and the state changed to the new state. `trigger input` values that do not match a `transition trigger` for the current state do not trigger any state change. If the `Throw error on invalid transition` is checked, the node will throw an error and stop the flow if the `trigger input` does not match a valid transition trigger for the current state.

At start up, the node will emit a message with the initial state if the `state output` property is set to a `msg` property.

Transitions with a `transition from` state of `*` are actioned for all states.

## Configuration

### Trigger <Badge text="required"/>

- Type: `string | number | boolean`

The property to use as the trigger source

## States <Badge text="required"/>

a list of the valid states for the finite state machine

## Transition TRIGGER

the string to trigger the transition

## Transition FROM state

the state the transition will move from

## Transition TO state

the state the transition will move to

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

## Inputs

properties of `msg.payload`

### trigger

- Type: `string | number | boolean`

The property to use as the trigger source

### attributes

- Type: `Object`

Key/Value pair of attributes to update. The key should be a string and value can be a `[string | number | boolean | object]`

<!-- TODO: outputs -->

### References

- [Javascript State Machine](https://www.npmjs.com/package/javascript-state-machine) - full documentation of Javascript State Machine library.
