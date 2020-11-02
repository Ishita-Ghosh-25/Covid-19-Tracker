import { Card, CardContent, FormControl, MenuItem, Select } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import './App.css';
import './InfoBox';
import Map from './Map';
import InfoBox from './InfoBox';
import Table from './Table';
import {sortData, prettyPrintStat} from "./Util";
import LineGraph from "./LineGraph";
import "leaflet/dist/leaflet.css";

function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState('worldwide');
  const [mapCountries, setMapCountries] = useState([]);
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] =useState([]);
  const [mapCenter, setMapCenter] = useState({lat: 3.80746, lng: -40.4796});
  const [mapZoom, setMapZoom] = useState(3);
  const[casesType, setCasesType] =useState("cases");
  useEffect(() =>{
      fetch("https://disease.sh/v3/covid-19/all")
      .then(response => response.json())
      .then(data => {
        setCountryInfo(data);
      });
  }, [])
  
  
  
  
  
  useEffect(() => {
     const getCountriesData = async () => {
       await fetch("https://disease.sh/v3/covid-19/countries")
       .then((response) => response.json())
       .then((data)=>{
         const countries = data.map((country)=>(
           {
             name: country.country,
             value: country.countryInfo.iso2
           }));

           const sortedData = sortData(data);
           setTableData(sortedData);
           setMapCountries(data);
           setCountries(countries);
       });
     };
     getCountriesData();
  },[]);
  
  const onCountryChange = async (event) => {
    const countryCode = event.target.value;
    setCountry(countryCode);
    const url = countryCode === 'worldwide' ? 'https://disease.sh/v3/covid-19/all' : `https://disease.sh/v3/covid-19/countries/${countryCode}`;
    await fetch(url)
    .then(response => response.json())
    .then(data =>{
      setCountry(countryCode);
      setCountryInfo(data);

      setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
      setMapZoom(4);
    }) ;
  
  }
  



  return (
    <div className='app'>
    <div className="app_left">
    <div className='app_header'>
    <h1>COVID 19 TRACKER</h1>
    <FormControl className="app_dropdown">
        <Select variant="outlined" 
        onChange={onCountryChange}
        value={country}>
        <MenuItem value="worldwide">Worldwide</MenuItem>
        {countries.map(country => (
            <MenuItem value={country.value}>{country.name}</MenuItem>
        
          ))}
        
        </Select>
      </FormControl>
    </div>
    <div className="app_stats">
          <InfoBox 
          active={casesType === "cases" }
          onClick={(e) => setCasesType('cases')}
          title ="Coronavirus Cases" cases={prettyPrintStat(countryInfo.todayCases)} total={prettyPrintStat(countryInfo.cases)}/>
          <InfoBox
          active={casesType === "recovered" }
           onClick = {(e) => setCasesType("recovered")}
           title ="Recovered" cases={prettyPrintStat(countryInfo.todayRecovered)} total={prettyPrintStat(countryInfo.recovered)} />
          <InfoBox
          active={casesType === "deaths" }
          onClick = {(e) => setCasesType("deaths")}
           title ="Deaths" cases={prettyPrintStat(countryInfo.todayDeaths)} total={prettyPrintStat(countryInfo.deaths)}/>
    </div> 
   <Map
   casesType={casesType}
   countries={mapCountries} 
     center = {mapCenter}
     zoom = {mapZoom}
   />
    </div>
    <Card className= "app_right">
      <CardContent>
        <h3>Live Cases By Country</h3>
        <Table countries={tableData}/>
        <h3>Worldwide New {casesType}</h3> 
        <LineGraph casesType={casesType}/>
      </CardContent>
    </Card>
</div>
  );
}
export default App;