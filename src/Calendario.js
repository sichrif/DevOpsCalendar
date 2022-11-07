import React, {useContext} from 'react';
import { useNavigate } from "react-router-dom";
import {StateContext} from './App';
import Calendar from 'react-calendar';
import {selezionadata} from './Actions';

function Calendario(){

    const ctx = useContext(StateContext);
    let navigate = useNavigate();

  // prende in ingresso la data selezionata dall'utente e la salva nel reducer
  const changeDate = (e) => {
        ctx.dispatch(selezionadata(e))
        navigate("/sale");
  }

  return(
      <div className='calendarContainer'>
        <h3 className='text-center mt-5 mb-6'>Meeting Rooms Reservation</h3>
        <Calendar className="shadow c-calendar"
            onChange={changeDate}
        />
        <div className='text-center mt-5 fs-12'>Scegli il giorno in cui vuoi prenotare una sala riunioni</div>
      </div>
  )
}

export default Calendario;