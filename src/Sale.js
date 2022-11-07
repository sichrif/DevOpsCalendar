import React, {useContext, useState, useEffect} from 'react';
import {StateContext} from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Table,Modal, Button, Form, Dropdown, DropdownButton} from 'react-bootstrap';
import './App.css';
import {prenota, selezionadata} from './Actions';
import next from './assets/next.png';
import previous from './assets/previous.png';
import { useNavigate } from "react-router-dom";

function Sale() {

    const ctx = useContext(StateContext);

    const [prenotazione, setPrenotazione] = useState();
    const [isBooksInfo, setIsBooksInfo] = useState(false);
    const [formValid, setFormValid] = useState(false);
    const [showSanificazioneAlert, setShowSanificazioneAlert] = useState(false);
    const [showPassTime, setShowPassTime] = useState(false);
    const [show, setShow] = useState(false);
    const handleClose = () => {setShow(false); setIsBooksInfo(false)};
    const handleShow = () => setShow(true);
    const handleCloseAlertSan = () => setShowSanificazioneAlert(false);
    const handleShowAlertSan = () => setShowSanificazioneAlert(true);
    const handleClosePassTime = () => setShowPassTime(false);
    const handleShowPassTime = () => setShowPassTime(true);

    useEffect(() => {
      if (prenotazione?.user.nome && prenotazione?.user.cognome && prenotazione?.hour.start && prenotazione?.hour.end) {
        setFormValid(true);
      } else {
        setFormValid(false);
      }
    }, [prenotazione]);

    let navigate = useNavigate();
    const navToCalendar = () => navigate("/calendario");

    const previousDay = () => {
      let date = ctx.state.dataselezionata;
      date.setDate(date.getDate()-1);
      ctx.dispatch(selezionadata(date))
    };

    const nextDay = () => {
      let date = ctx.state.dataselezionata;
      date.setDate(date.getDate()+1);
      ctx.dispatch(selezionadata(date))
    };

    const sala1 = ctx.state.stanza1.prenotazioni;
    const sala2 = ctx.state.stanza2.prenotazioni;
    const sala3 = ctx.state.stanza3.prenotazioni;
    const sala4 = ctx.state.stanza4.prenotazioni;
    const sala5 = ctx.state.stanza5.prenotazioni;
    const sale = {
      sala1: sala1,
      sala2: sala2,
      sala3: sala3,
      sala4: sala4,
      sala5: sala5
    }
    const hours = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30',
                  '14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00','19:30',
                  '20:00','20:30','21:00','21:30'];
   const [filteredHour, setFilteredHour] = useState([]);

    let data = ctx.state.dataselezionata.getDate() + "/" + (ctx.state.dataselezionata.getMonth()+1) + "/" + ctx.state.dataselezionata.getFullYear()
    
    // serve per settare i dati della prenotazione in base alle scelte dell'utente e filtra l'ora di fine riunione
    const selectedPrenotazione = (e) => {
        setPrenotazione({day: data,hour: {start: hours[e.index]}, sala: e.sala, user: {nome: '', cognome: '', scopo: ''}});
        setFilteredHour(hours.slice(e.index+1));
        settingFilteredHour(e.index, e.sala);
        checkBookedHour(e.el, e.sala)
    }

    // cerca la riunione prossima rispetto all'orario scelto dall'utente per andare a limitare la durate della riunione in base alle altre già esistenti
    const settingFilteredHour = (startHour, sala) => {
      if (sale['sala'+sala].length > 0) {
        let near = sale['sala'+sala].find(x=> x.hour.start > hours[startHour]);

        if (near) {
          let findHour = hours.findIndex(x => x === near.hour.start);
          setFilteredHour(hours.slice(startHour, findHour-1));
        }
        
      }      
    }

    const setUserInformation = (e) => {
      let propName = e.target.name;
      setPrenotazione({...prenotazione, user: {...prenotazione.user, [propName]: e.target.value}});
    }

    const setTimeInformation = (e)=> {
      let propName = e.target.name;
      setPrenotazione({...prenotazione, hour: {...prenotazione.hour, [propName]: e.target.text}});
    }

    // prima verifica che la data sia nel futuro, se cosi fosse per la sala selezionata dall'utente verifica se sono presenti o meno riunioni già esistenti.
    // se viene trovata una riunione per l'orario scelto dall'utente andiamo a salvarci i dati della riunione per mostrarli nella modale e blocchiamo la possibilità di modifica
    const checkBookedHour = (el, sala) => {
      let datiUser;
      let today = new Date();
      let selectedDate = new Date(ctx.state.dataselezionata);
      selectedDate.setHours(el.slice(0,2));
      selectedDate.setMinutes(el.slice(3,5));

      if (sale['sala'+sala]?.some(e=> e.day === data && e.sala === sala && (el>= e.hour.start && el<= e.hour.end))) {
        datiUser = sale['sala'+sala]?.find(e=> e.day === data && (el>= e.hour.start && el<= e.hour.end));
        if (datiUser) {
          setPrenotazione({...prenotazione, 
            user: datiUser.user,
            hour: datiUser.hour, 
            sala: datiUser.sala
          });
          setIsBooksInfo(true);
        }
      }
      // if per aprire la modal della sanificazione
      if (sale['sala'+sala]?.some(e=> e.day === data && el === (e.hour.end.slice(3,5) === "00" ? e.hour.end.slice(0,2)+':30' : e.hour.end.slice(0,2) < 9 ? '0'+(Number(e.hour.end.slice(0,2))+1)+':00' : (Number(e.hour.end.slice(0,2))+1)+':00'))) {
       handleShowAlertSan();
      } else if (selectedDate <= today && !datiUser && !showSanificazioneAlert) { // if per aprire la modal del futuro
        handleShowPassTime();
      } else { // if per aprire la modal della prenotazione
       handleShow();     
      }
    }

    // salva i dati della prenotazione nel reducer
    const bookRoom = () => {
      ctx.dispatch(prenota(prenotazione));
      handleClose();
    }

    // imposta le varie classi per le varie fasce orarie a seconda delle prenotazioni già esistenti
    const roomStatus = (el, room) => {
      if (sale['sala'+room]?.some(e=> e.day === data)) {
        if (sale['sala'+room]?.some(e=> el>= e.hour.start && el<= e.hour.end)) {
          switch(room) {
            case 1:
              return 'booked';
            case 2:
              return 'booked2';
            case 3:
              return 'booked3';
            case 4:
              return 'booked4';
            case 5:
              return 'booked5';
          }
        } else if (sale['sala'+room]?.some(e=> el === (e.hour.end.slice(3,5) === "00" ?
          e.hour.end.slice(0,2)+':30' : e.hour.end.slice(0,2) < 9 ?
          '0'+(Number(e.hour.end.slice(0,2))+1)+':00' : (Number(e.hour.end.slice(0,2))+1)+':00'))) {
            return 'san';
        }
        return '';
      }
    }

    return (
        <div className={window.innerWidth > 500 ? 'container' : ''}>
          <Button variant="outline-primary" onClick={navToCalendar}>
            CALENDARIO&nbsp;
          </Button>
          <div className='flex'>
            <img className="img-w pointer" src={previous} alt="previous" onClick={previousDay}/>
            <h1>{data}</h1>
            <img className="img-w pointer" src={next} alt="next" onClick={nextDay}/>
          </div>
            <Table striped bordered hover>
                <thead>
                <tr>
                    <th>ORA</th>
                    <th>SALA 1</th>
                    <th>SALA 2</th>
                    <th>SALA 3</th>
                    <th>SALA 4</th>
                    <th>SALA 5</th>
                </tr>
                </thead>
                <tbody>
                    {
                        hours.map((el, i)=>
                        <tr key={i}>
                            <td>{el}</td>
                            <td id="sala1" onClick={()=>selectedPrenotazione({index: i, sala: '1', el: el})} className={roomStatus(el, 1)}></td>
                            <td id="sala2" onClick={()=>selectedPrenotazione({index: i, sala: '2', el: el})} className={roomStatus(el, 2)}></td>
                            <td id="sala3" onClick={()=>selectedPrenotazione({index: i, sala: '3', el: el})} className={roomStatus(el, 3)}></td>
                            <td id="sala3" onClick={()=>selectedPrenotazione({index: i, sala: '4', el: el})} className={roomStatus(el, 4)}></td>
                            <td id="sala4" onClick={()=>selectedPrenotazione({index: i, sala: '5', el: el})} className={roomStatus(el, 5)}></td>
                        </tr>
                        )
                    }
                </tbody>
            </Table>

            <Modal show={show} onHide={handleClose}>
              <Modal.Header>
                <Modal.Title>Prenota Stanza {prenotazione?.sala}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form>
                  <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Nome</Form.Label>
                    <Form.Control disabled={isBooksInfo} type="text" name="nome" value={prenotazione?.user.nome} onChange={(e)=>setUserInformation(e)} placeholder="es. Mario" />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Cognome</Form.Label>
                    <Form.Control disabled={isBooksInfo} type="text" name="cognome" value={prenotazione?.user.cognome} onChange={(e)=>setUserInformation(e)} placeholder="es. Rossi" />
                  </Form.Group>
                  
                  <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Scopo prenotazione</Form.Label>
                    <Form.Control disabled={isBooksInfo} type="text" name="scopo" value={prenotazione?.user.scopo} onChange={(e)=>setUserInformation(e)} placeholder="es. Riunione" />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Orario</Form.Label>
                    <Form.Group className="mb-3" controlId="formBasicPassword">
                      <div className='flex'>
                        <Form.Label>Inizio</Form.Label>
                        <Form.Label>Fine</Form.Label>
                      </div>
                      <div className='flex'>
                        <DropdownButton disabled id="dropdown-basic-button" title={prenotazione?.hour.start ? prenotazione?.hour.start : 'Ora di inizio'}>
                          <div className='dropdown_h'>
                            {
                              hours.map((h, i)=>
                                <Dropdown.Item name="start" value={h} key={i} onClick={(e)=>setTimeInformation(e)}>{h}</Dropdown.Item>
                              )
                            }
                          </div>
                        </DropdownButton>
                        
                        <DropdownButton disabled={isBooksInfo} id="dropdown-basic-button" title={prenotazione?.hour.end ? prenotazione?.hour.end : 'Ora di fine'}>
                          <div className='dropdown_h'>
                            {
                              filteredHour.map((h, i)=>
                                <Dropdown.Item name="end" value={h} key={i} onClick={(e)=>setTimeInformation(e)}>{h}</Dropdown.Item>
                              )
                            }
                          </div>
                        </DropdownButton>
                      </div>                        
                    </Form.Group>
                  </Form.Group>

                </Form>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                  Chiudi
                </Button>
                {
                  isBooksInfo?
                  <></> :
                  <Button disabled={!formValid} variant="primary" onClick={bookRoom}>
                    Prenota
                  </Button>
                }
              </Modal.Footer>
            </Modal>

            <Modal show={showSanificazioneAlert} onHide={handleCloseAlertSan}>
                <Modal.Header>
                  <Modal.Title>Tempo di sanificazione della sala</Modal.Title>
                </Modal.Header>
                <Modal.Footer>
                  <Button variant="secondary" onClick={handleCloseAlertSan}>Close</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showPassTime} onHide={handleClosePassTime}>
                <Modal.Header>
                  <Modal.Title>Prenota un slot nel futuro</Modal.Title>
                </Modal.Header>
                <Modal.Footer>
                  <Button variant="secondary" onClick={handleClosePassTime}>Close</Button>
                </Modal.Footer>
            </Modal>
            
        </div>
    )
}

export default Sale;