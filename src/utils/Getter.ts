/* eslint-disable import/no-unresolved */
import axios, { AxiosResponse } from 'axios';

import handleError from './ErrorHandler.js';
import PokeAPIOptions from '../interfaces/PokeAPIOptions.js';

async function getJSON<T>(
  values: PokeAPIOptions,
  url: string,
  // eslint-disable-next-line no-unused-vars
  callback?: (result: any, error?: any) => any,
): Promise<T> {
  const options = {
    baseURL: `${values.protocol}${values.hostName}/`,
    timeout: values.timeout,
  };

  try {
    // Retrieve possible content from memory-cache
    const cachedResult = values.cache.get<T>(url);

    // If we have in cache
    if (callback && cachedResult) {
      // Call callback without errors
      callback(cachedResult);
    }

    // Return the cache
    if (cachedResult) {
      return cachedResult;
    }

    // If we don't have in cache
    // get the data from the API
    const response: AxiosResponse<T, any> = await axios.get<T>(url, options);

    // If there is an error on the request
    if (response.status !== 200) {
      throw response;
    }

    // If everything was good
    // set the data
    const responseData = response.data;

    // Cache the object in memory-cache
    // only if cacheLimit > 0
    if (values.cacheLimit > 0) {
      values.cache.set<T>(url, responseData, values.cacheLimit);
    }

    // If a callback is present
    if (callback) {
      // Call it, without errors
      callback(responseData);
    }

    return responseData;
  } catch (error) {
    handleError(error, callback);
  }

  // If we return nothing and the error handler fails
  // reject the promise
  return Promise.reject();
}

export default getJSON;
