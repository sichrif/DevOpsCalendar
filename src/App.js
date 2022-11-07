import React, {createContext} from 'react';
import { useReducer } from 'react';
import { reducer, initialState } from './Reducer';
import Sale from './Sale';
import {BrowserRouter,Route,Routes} from "react-router-dom";
import Calendario from './Calendario';
import './App.css'
import 'react-calendar/dist/Calendar.css';

export const StateContext = createContext();

function App () {

  const [state, dispatch] = useReducer(reducer, initialState)

  return(
    <StateContext.Provider value={{state, dispatch}}>
      <BrowserRouter>
        <Routes>
          <Route path = {"/calendario"} element={<Calendario/>}/>
          <Route path = {""} element={<Calendario/>}/>
          <Route path = {"/sale"} element={<Sale/>}/>
        </Routes>
      </BrowserRouter>
    </StateContext.Provider>
  )
}

export default App;