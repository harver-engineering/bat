<a name="module_World"></a>

## World

* [World](#module_World)
    * [~World](#module_World..World)
        * [.baseUrl](#module_World..World+baseUrl)
        * [.req](#module_World..World+req)
        * [.req](#module_World..World+req)
        * [.currentAgent](#module_World..World+currentAgent)
        * [.apiSpec](#module_World..World+apiSpec)
        * [.getEndpointSpec()](#module_World..World+getEndpointSpec)
        * [.replaceVars(val)](#module_World..World+replaceVars)
        * [.replaceVariablesInitiator()](#module_World..World+replaceVariablesInitiator)
        * [.getAgentByRole(role)](#module_World..World+getAgentByRole)
        * [.setAgentByRole(role, agent)](#module_World..World+setAgentByRole)
        * [.getResponseBody(res)](#module_World..World+getResponseBody)
        * [.saveCurrentResponse()](#module_World..World+saveCurrentResponse)
        * [.retrieveResponse(resource, method, status)](#module_World..World+retrieveResponse)

<a name="module_World..World"></a>

### World~World
State and stateful utilities can be shared between steps using an instance of "World"

**Kind**: inner class of [<code>World</code>](#module_World)  

* [~World](#module_World..World)
    * [.baseUrl](#module_World..World+baseUrl)
    * [.req](#module_World..World+req)
    * [.req](#module_World..World+req)
    * [.currentAgent](#module_World..World+currentAgent)
    * [.apiSpec](#module_World..World+apiSpec)
    * [.getEndpointSpec()](#module_World..World+getEndpointSpec)
    * [.replaceVars(val)](#module_World..World+replaceVars)
    * [.replaceVariablesInitiator()](#module_World..World+replaceVariablesInitiator)
    * [.getAgentByRole(role)](#module_World..World+getAgentByRole)
    * [.setAgentByRole(role, agent)](#module_World..World+setAgentByRole)
    * [.getResponseBody(res)](#module_World..World+getResponseBody)
    * [.saveCurrentResponse()](#module_World..World+saveCurrentResponse)
    * [.retrieveResponse(resource, method, status)](#module_World..World+retrieveResponse)

<a name="module_World..World+baseUrl"></a>

#### world.baseUrl
Getter for the `baseUrl` used for all requests

**Kind**: instance property of [<code>World</code>](#module_World..World)  
<a name="module_World..World+req"></a>

#### world.req
Getter for the currently active Superagent request object

**Kind**: instance property of [<code>World</code>](#module_World..World)  
<a name="module_World..World+req"></a>

#### world.req
Setter for the active request

**Kind**: instance property of [<code>World</code>](#module_World..World)  
<a name="module_World..World+currentAgent"></a>

#### world.currentAgent
Getter for the curren Superagent agent.
Reuse this agent in step definitions to preserve client sessions

**Kind**: instance property of [<code>World</code>](#module_World..World)  
<a name="module_World..World+apiSpec"></a>

#### world.apiSpec
Getter for the full Open API spec

**Kind**: instance property of [<code>World</code>](#module_World..World)  
<a name="module_World..World+getEndpointSpec"></a>

#### world.getEndpointSpec()
Get part of the Open API spec for just a single endpoint (resource + method)

**Kind**: instance method of [<code>World</code>](#module_World..World)  
<a name="module_World..World+replaceVars"></a>

#### world.replaceVars(val)
Replace placeholders in a value with variables currently stored from
environemtn config and previous responses.

**Kind**: instance method of [<code>World</code>](#module_World..World)  

| Param | Type |
| --- | --- |
| val | <code>\*</code> | 

<a name="module_World..World+replaceVariablesInitiator"></a>

#### world.replaceVariablesInitiator()
Returns Super Agent middleware that replaces placeholders with
variables

**Kind**: instance method of [<code>World</code>](#module_World..World)  
<a name="module_World..World+getAgentByRole"></a>

#### world.getAgentByRole(role)
Get a Superagent agent for a specific authorization role

**Kind**: instance method of [<code>World</code>](#module_World..World)  

| Param | Type | Description |
| --- | --- | --- |
| role | <code>string</code> | The role, such as 'admin' |

<a name="module_World..World+setAgentByRole"></a>

#### world.setAgentByRole(role, agent)
Save a Superagent agent for a given authorization role

**Kind**: instance method of [<code>World</code>](#module_World..World)  

| Param | Type |
| --- | --- |
| role | <code>string</code> | 
| agent | <code>\*</code> | 

<a name="module_World..World+getResponseBody"></a>

#### world.getResponseBody(res)
Gets the body from a response. Includes logic to parse
JSON from JSON responses that have an incorrect 'text/html' content type.

**Kind**: instance method of [<code>World</code>](#module_World..World)  

| Param | Description |
| --- | --- |
| res | A Superagent response object |

<a name="module_World..World+saveCurrentResponse"></a>

#### world.saveCurrentResponse()
Save the current response so its values can be used for future requests

**Kind**: instance method of [<code>World</code>](#module_World..World)  
<a name="module_World..World+retrieveResponse"></a>

#### world.retrieveResponse(resource, method, status)
Retrieve a response cached by `saveCurrentResponse`

**Kind**: instance method of [<code>World</code>](#module_World..World)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| resource |  |  | An HTTP resource |
| method | <code>\*</code> |  | An HTTP method |
| status | <code>\*</code> | <code>200</code> | The response status, defaults to 200 |

