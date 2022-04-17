import { useState, useEffect } from "react";
import {
    MDBBtn,
    MDBContainer,
    MDBInput,
    MDBSpinner,
    MDBTable,
    MDBTableHead,
    MDBTableBody
} from 'mdb-react-ui-kit';
import { IconButton } from '@material-ui/core';
import RefreshIcon from '@material-ui/icons/Refresh';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';

const axios = require('axios').default;
var api = null;

function SourceInputForm(props) {
    const api = props.api;
    
    const [type, setType] = useState("ttn-mqtt");
    const [fields, setFields] = useState({
        brokerURL: "",
        port: "",
        username: "",
        password: ""
    });

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column"
            }}
        >
            <FormControl
                style={{
                    marginTop: 9
                }}
            >
                <InputLabel id="source-type-select-label">Source Type</InputLabel>
                <Select
                    labelId="source-type-select-label"
                    id="source-type-select"
                    value={type}
                    onChange={newType => {
                        setType(newType);
                        switch(newType) {
                            case "ttn-mqtt":
                                setFields({
                                    brokerURL: "",
                                    port: "",
                                    username: "",
                                    password: ""
                                })
                        }
                    }}
                >
                    <MenuItem value={"ttn-mqtt"}>TTN MQTT</MenuItem>
                </Select>
            </FormControl>
            { type === "ttn-mqtt" ? (
                <div style={{
                    display: "flex",
                    flexDirection: "column"
                }}>
                    <FormControl
                        style={{
                            marginTop: 9
                        }}
                    >
                        <TextField
                            id="broker-url-input"
                            label="Broker URL"
                            defaultValue=""
                            variant="outlined"
                            onChange={event => setFields({...fields, brokerURL: event.target.value})}
                        />
                    </FormControl>
                    <FormControl
                        style={{
                            marginTop: 9
                        }}
                    >
                        <TextField
                            id="broker-port-input"
                            label="Broker Port"
                            defaultValue=""
                            variant="outlined"
                            onChange={event => setFields({...fields, port: event.target.value})}
                        />
                    </FormControl>
                    <FormControl
                        style={{
                            marginTop: 9
                        }}
                    >
                        <TextField
                            id="username-input"
                            label="Username"
                            defaultValue=""
                            variant="outlined"
                            onChange={event => setFields({...fields, username: event.target.value})}
                        />
                    </FormControl>
                    <FormControl
                        style={{
                            marginTop: 9
                        }}
                    >
                        <TextField
                            id="password-input"
                            label="Password"
                            defaultValue=""
                            variant="outlined"
                            onChange={event => setFields({...fields, password: event.target.value})}
                        />
                    </FormControl>
                </div>
            ) : (<div/>)}
            <MDBBtn
                style={{
                    marginTop: 9
                }}
                onClick={() => {
                    api.post("/sources/add", {
                        sourceType: type,
                        sourceMetadata: fields
                    })
                    .then(({ data }) => {
                        if(data.code === 200) {
                            props.refreshSources();
                        }
                    })
                }}
            >
                Submit
            </MDBBtn>
        </div>
    );
}

export default function SourceRegistration(props) {

    const [error, setError] = useState(null);
    const [sourceList, setSourceList] = useState(null);

    useEffect(() => {
        api = axios.create({
            baseURL: 'https://api.uvasif.org/v2',
            timeout: 20000,
            headers: {
                Authorization: props.idToken
            }
        });
    }, [props.idToken]);

    function apiCall() {
        api.get("/sources")
            .then(({ data }) => {
                if (data.code !== 200) {
                    throw "Server reported incorrect status code";
                } else {
                    setSourceList(data.sources);
                }
            })
            .catch(err => {
                console.error(err);
                setError("Unable to load source list :(");
            });
    }

    // Retrieve the list of apps for the current
    // user, after axios is ready.
    useEffect(() => {
        while (api === null) { }
        apiCall();
    }, []);


    return (
        <MDBContainer fluid>
            <div
                style={{
                    minWidth: 500
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    <h3
                        className='mb-3'
                        style={{
                            margin: 25
                        }}
                    >
                        Add new custom sources
                    </h3>
                </div>
                <div>
                    <SourceInputForm
                        api={api}
                        refreshSources={apiCall}
                    />
                </div>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    <h3
                        className='mb-3'
                        style={{
                            margin: 25
                        }}
                    >
                        Existing custom sources
                    </h3>
                    <IconButton
                        onClick={() => {
                            setSourceList(null)
                            apiCall();
                        }}
                    >
                        <RefreshIcon />
                    </IconButton>
                </div>
                {sourceList === null ? error === null ? (
                    <MDBSpinner
                        size='md'
                        role='status'
                        tag='span'
                        className='me-2'
                    />
                ) : (
                    <p>
                        {error}
                    </p>
                ) : (
                    <MDBTable striped hover responsive>
                        <MDBTableHead>
                            <tr>
                                <th scope='col'>ID</th>
                                <th scope='col'>Type</th>
                                <th scope='col'>Metadata</th>
                            </tr>
                        </MDBTableHead>
                        <MDBTableBody>
                            {
                                sourceList.map(source => {
                                    switch(source.type) {
                                        case "ttn-mqtt":
                                            return (
                                                <tr key={source.sourceId}>
                                                    <td>
                                                        {source.sourceId}
                                                        <IconButton
                                                            style={{marginLeft:-20}}
                                                            onClick={() => {
                                                                const theSrcId = source.sourceId;
                                                                api.delete("/sources/" + theSrcId)
                                                                .then(({ data }) => {
                                                                    if(data.code === 200) {
                                                                        setSourceList(
                                                                            sourceList.filter(source => source.sourceId !== theSrcId)
                                                                        );
                                                                    }
                                                                })
                                                            }}
                                                        >
                                                            <DeleteForeverIcon />
                                                        </IconButton>
                                                    </td>
                                                    <td>TTN MQTT</td>
                                                    <td>
                                                        <MDBTable>
                                                            <MDBTableBody>
                                                                <tr>
                                                                    <td>Broker URL</td>
                                                                    <td>{source.metadata.brokerURL}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>Broker Port</td>
                                                                    <td>{source.metadata.port}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>Username</td>
                                                                    <td>{source.metadata.username}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td>Password</td>
                                                                    <td>{source.metadata.password}</td>
                                                                </tr>
                                                            </MDBTableBody>
                                                        </MDBTable>
                                                        {
                                                            
                                                        }
                                                    </td>
                                                </tr>
                                            );
                                        
                                        default:
                                            return (
                                                <tr key={source.sourceId}>
                                                    <td>{source.sourceId}</td>
                                                    <td>Unsupported Source Type</td>
                                                    <td>Unknown</td>
                                                </tr>
                                            )
                                    }
                                })
                            }
                        </MDBTableBody>
                    </MDBTable>
                )}
            </div>
        </MDBContainer>
    )
}
