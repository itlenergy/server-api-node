import Promise from 'bluebird';
Promise.longStackTraces();

import {getApp} from './src/server';

export var config = {
  database: 'postgres://postgres:postgres@localhost/postgres',
  authSecret: 'secret'
};

export var app = getApp(config);

export async function setupData() {
  let pg = app.get('pg');
  
  // get references to the tables
  let sites = pg.table('site');
  let houses = pg.table('house');
  let hubs = pg.table('hub');
  let statusEvents = pg.table('status_events');
  let hubLogs = pg.table('hub_log');
  let deployedSensors = pg.table('deployed_sensor');
  let sensors = pg.table('sensor');
  let measurements = pg.table('measurement');
  let weather = pg.table('weather');
  let actuations = pg.table('actuations');
  let electricalLoads = pg.table('electrical_load');
  let electricalLoadForecasts = pg.table('electrical_load_forecast');
  let forecastStatuses = pg.table('forecast_status');
  let generation = pg.table('generation');
  let tariffs = pg.table('tariff');
  let tariffBlocks = pg.table('tariffBlocks');
  let weatherForecasts = pg.table('weather_forecast');
  let users = pg.table('login_user');
  
  // delete existing data
  // only have to delete some of them because of all the on delete cascade
  await sites.remove();
  await statusEvents.remove();
  await deployedSensors.remove();
  await tariffs.remove();
  
  // insert some data
  // mostly just copied from the old 'Test Data.sql' - probably don't need all of it...
  // sites
  let s1 = await sites.insert({latitude: 55.85546, longitude: -4.232459, altitude: 16.0, site_name: 'catherinefield'});
  let s2 = await sites.insert({latitude: 55.09906, longitude: -3.583382, altitude: 13.0, site_name: 'annan'});
  let s3 = await sites.insert({latitude: 55.85546, longitude: -4.232459, altitude: 16.0, site_name: 'catherinefield2'});
  let s4 = await sites.insert({latitude: 55.09906, longitude: -3.583382, altitude: 13.0, site_name: 'annan2'});
  
  // status events
  let se1 = await statusEvents.insert({status_description: 'broadband failure'});
  let se2 = await statusEvents.insert({status_description: 'power interruption'});
  let se3 = await statusEvents.insert({status_description: 'sensor timestamp skew'});
  
  // deployed sensors
  let ds1 = await deployedSensors.insert({description: 'Kamstrup Flow Meter', measurement_units: 'm3/s'});
  let ds2 = await deployedSensors.insert({description: 'AlertMe Current Clamp Advance', measurement_units: 'kWh'});
  let ds3 = await deployedSensors.insert({description: 'AlertMe Current Clamp Power', measurement_units: 'kW'});
  let ds4 = await deployedSensors.insert({description: 'AlertMe Occupancy Sensor', measurement_units: 'counts'});
  let ds5 = await deployedSensors.insert({description: 'AlertMe Plug Meter', measurement_units: 'kWh'});
  let ds6 = await deployedSensors.insert({description: 'HW Joel-o-matic', measurement_units: 'Occupants'});
  
  // houses
  let hs1 = await houses.insert({site_id: s1.site_id, rooms: 7, floors: 2, occupants: 4, central_heating_gas: true, cooking_gas: true});
  let hs2 = await houses.insert({site_id: s1.site_id, rooms: 8, floors: 2, occupants: 4, central_heating_gas: false, cooking_gas: false});
  let hs3 = await houses.insert({site_id: s2.site_id, rooms: 8, floors: 2, occupants: 4, central_heating_gas: false, cooking_gas: false});
  let hs4 = await houses.insert({site_id: s2.site_id, rooms: 2, floors: 1, occupants: 1, central_heating_gas: true, cooking_gas: false});
  let hs5 = await houses.insert({site_id: s3.site_id, rooms: 3, floors: 1, occupants: 1, central_heating_gas: true, cooking_gas: true});
  let hs6 = await houses.insert({site_id: s3.site_id, rooms: 3, floors: 1, occupants: 2, central_heating_gas: true, cooking_gas: true});
  let hs7 = await houses.insert({site_id: s4.site_id, rooms: 8, floors: 2, occupants: 4, central_heating_gas: true, cooking_gas: false});
  let hs8 = await houses.insert({site_id: s4.site_id, rooms: 4, floors: 1, occupants: 2, central_heating_gas: true, cooking_gas: true});
  let hs9 = await houses.insert({site_id: s4.site_id, rooms: 8, floors: 2, occupants: 4, central_heating_gas: true, cooking_gas: false});
  
  // hubs
  let hb1 = await hubs.insert({house_id: hs1.house_id, last_update: '2013-07-05 00:01:00', free_storage: 6});
  let hb2 = await hubs.insert({house_id: hs2.house_id, last_update: '2013-07-14 01:01:00', free_storage: 1});
  let hb3 = await hubs.insert({house_id: hs3.house_id, last_update: '2013-07-12 13:25:00', free_storage: 4});
  let hb4 = await hubs.insert({house_id: hs4.house_id, last_update: '2013-07-05 00:01:00', free_storage: 66});
  let hb5 = await hubs.insert({house_id: hs5.house_id, last_update: '2013-07-30 14:01:00', free_storage: 25});
  let hb6 = await hubs.insert({house_id: hs6.house_id, last_update: '2013-07-11 11:01:59', free_storage: 3});
  let hb7 = await hubs.insert({house_id: hs7.house_id, last_update: '2013-07-02 10:01:36', free_storage: 3});
  let hb8 = await hubs.insert({house_id: hs8.house_id, last_update: '2013-07-01 23:59:49', free_storage: 1});
  
  // hub logs
  await hubLogs.insert({hub_id: hb1.hub_id, hub_log_message: 'Broadband connection timed out', hub_log_time: '2013-07-21 00:00:00', hub_log_code: se2.status_id})
  await hubLogs.insert({hub_id: hb1.hub_id, hub_log_message: 'Broadband access restored', hub_log_time: '2013-07-21 00:50:00', hub_log_code: se1.status_id})
  await hubLogs.insert({hub_id: hb1.hub_id, hub_log_message: 'Broadband connection timed out', hub_log_time: '2013-07-21 00:55:00', hub_log_code: se2.status_id})
  
  // sensors
  let sn1 = await sensors.insert({hub_id: hb1.hub_id, type_id: ds2.type_id, description: 'Property Incomer'});
  await sensors.insert({hub_id: hb1.hub_id, type_id: ds4.type_id, description: 'Living Room'});
  await sensors.insert({hub_id: hb1.hub_id, type_id: ds5.type_id, description: 'Dishwasher'});
  await sensors.insert({hub_id: hb1.hub_id, type_id: ds5.type_id, description: 'Washing Machine'});
  await sensors.insert({hub_id: hb2.hub_id, type_id: ds2.type_id, description: 'Property Incomer'});
  await sensors.insert({hub_id: hb3.hub_id, type_id: ds2.type_id, description: 'Property Incomer'});
  await sensors.insert({hub_id: hb4.hub_id, type_id: ds2.type_id, description: 'Property Incomer'});
  await sensors.insert({hub_id: hb5.hub_id, type_id: ds2.type_id, description: 'Property Incomer'});
  
  // measurements
  await measurements.insert({sensor_id: sn1.sensor_id, observation_time: '2013-07-13 00:00:00', observation: 0.1});
  await measurements.insert({sensor_id: sn1.sensor_id, observation_time: '2013-07-13 00:30:00', observation: 0.12});
  await measurements.insert({sensor_id: sn1.sensor_id, observation_time: '2013-07-13 01:00:00', observation: 0.09});
  await measurements.insert({sensor_id: sn1.sensor_id, observation_time: '2013-07-13 01:30:00', observation: 0.1});
  await measurements.insert({sensor_id: sn1.sensor_id, observation_time: '2013-07-13 02:00:00', observation: 0.12});
  await measurements.insert({sensor_id: sn1.sensor_id, observation_time: '2013-07-13 02:30:00', observation: 0.13});
  await measurements.insert({sensor_id: sn1.sensor_id, observation_time: '2013-07-13 03:00:00', observation: 0.124});
  await measurements.insert({sensor_id: sn1.sensor_id, observation_time: '2013-07-13 03:30:00', observation: 0.11});
  await measurements.insert({sensor_id: sn1.sensor_id, observation_time: '2013-07-13 04:00:00', observation: 0.11});
  await measurements.insert({sensor_id: sn1.sensor_id, observation_time: '2013-07-13 04:30:00', observation: 0.11});
  await measurements.insert({sensor_id: sn1.sensor_id, observation_time: '2013-07-13 05:00:00', observation: 0.13});
  
  // weather
  await weather.insert({observation_time: '2013-07-13 18:00:00', site_id: s2.site_id, wind_speed: 3.5 , wind_direction: 345, ambient_temperature: 16.5, humidity: 56.0, uv: 1.1, precipitation: 0.2});
  await weather.insert({observation_time: '2013-07-13 18:30:00', site_id: s2.site_id, wind_speed: 3.25, wind_direction: 340, ambient_temperature: 14.5, humidity: 56.0, uv: 1.0, precipitation: 0.2});
  await weather.insert({observation_time: '2013-07-13 19:00:00', site_id: s2.site_id, wind_speed: 3.35, wind_direction: 342, ambient_temperature: 13.5, humidity: 56.0, uv: 0.8, precipitation: 0.2});
  await weather.insert({observation_time: '2013-07-13 19:30:00', site_id: s2.site_id, wind_speed: 3.45, wind_direction: 342, ambient_temperature: 12.5, humidity: 56.0, uv: 0.75, precipitation: 0.2});
  await weather.insert({observation_time: '2013-07-13 20:00:00', site_id: s2.site_id, wind_speed: 3.25, wind_direction: 347, ambient_temperature: 11.5, humidity: 56.0, uv: 0.6, precipitation: 0.2});
  await weather.insert({observation_time: '2013-07-13 20:30:00', site_id: s2.site_id, wind_speed: 3.15, wind_direction: 348, ambient_temperature: 11.5, humidity: 56.0, uv: 0.4, precipitation: 0.2});
  await weather.insert({observation_time: '2013-07-13 21:00:00', site_id: s2.site_id, wind_speed: 3.35, wind_direction: 347, ambient_temperature: 10.5, humidity: 50.0, uv: 0.4, precipitation: 0.2});
  await weather.insert({observation_time: '2013-07-13 19:30:00', site_id: s3.site_id, wind_speed: 3.15, wind_direction: 347, ambient_temperature: 11.5, humidity: 50.0, uv: 0.4, precipitation: 0.2});
  await weather.insert({observation_time: '2013-07-13 20:00:00', site_id: s3.site_id, wind_speed: 3.0 , wind_direction: 346, ambient_temperature: 11.5, humidity: 50.0, uv: 0.4, precipitation: 0.0});
};

  