import {
  Injectable
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable,
  map
} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class PropertyService {


  private readonly API_URL =
'https://api.acchasolution.com/api/properties'

  constructor(
    private http: HttpClient
  ) {}


  // =========================================================
  // CREATE
  // =========================================================

  addProperty(
    propertyData: any
  ): Observable<any> {

    return this.http.post(
      this.API_URL,
      propertyData
    );

  }


  // =========================================================
  // UPDATE
  // =========================================================

  updateProperty(
    id: string,
    propertyData: any
  ): Observable<any> {

    return this.http.put(
      `${this.API_URL}/${encodeURIComponent(id)}`,
      propertyData
    );

  }


  // =========================================================
  // GET ALL
  // =========================================================

  getProperties(): Observable<any[]> {

    return this.http
      .get<any>(
        this.API_URL
      )

      .pipe(

        map(response => {

          if (
            Array.isArray(response)
          ) {

            return response;

          }


          if (
            Array.isArray(
              response?.properties
            )
          ) {

            return response.properties;

          }


          return [];

        })

      );

  }


  // =========================================================
  // GET BY ID / UNIQUE ID / MONGODB ID
  // =========================================================

  getPropertyById(
    id: string
  ): Observable<any> {

    const cleanId =
      String(id || '').trim();


    console.log(
      '🔎 GET PROPERTY BY ID:',
      cleanId
    );


    return this.http

      .get<any>(
        `${this.API_URL}/id/${encodeURIComponent(cleanId)}`
      )

      .pipe(

        map(response => {

          console.log(
            '📦 PROPERTY API RESPONSE:',
            response
          );


          if (
            response?.property
          ) {

            return response.property;

          }


          if (
            response?.data
          ) {

            return response.data;

          }


          return response;

        })

      );

  }


  // =========================================================
  // GET BY PERMALINK
  // =========================================================

  getPropertyByPermalink(
    permalink: string
  ): Observable<any> {

    const slug =
      this.extractSlug(
        permalink
      );


    console.log(
      '🔗 GET PROPERTY BY SLUG:',
      slug
    );


    return this.http

      .get<any>(
        `${this.API_URL}/permalink/${encodeURIComponent(slug)}`
      )

      .pipe(

        map(response => {

          console.log(
            '📦 PERMALINK RESPONSE:',
            response
          );


          if (
            response?.property
          ) {

            return response.property;

          }


          if (
            response?.data
          ) {

            return response.data;

          }


          return response;

        })

      );

  }


  // =========================================================
  // DELETE
  // =========================================================

  deleteProperty(
    id: string
  ): Observable<any> {

    return this.http.delete(
      `${this.API_URL}/${encodeURIComponent(id)}`
    );

  }



  // =========================================================
// AI PROPERTY DESCRIPTION
// =========================================================

generateAIDescription(
  propertyData: any
): Observable<any> {

  return this.http.post(
'https://api.acchasolution.com/api/ai/generate-description',
    propertyData
  );

}

  // =========================================================
  // EXTRACT SLUG
  // =========================================================

  private extractSlug(
    value: string
  ): string {

    if (!value) {

      return '';

    }


    let cleaned =
      String(value)
        .trim();


    // Full URL
    try {

      if (
        cleaned.startsWith('http://') ||
        cleaned.startsWith('https://')
      ) {

        const url =
          new URL(cleaned);

        cleaned =
          url.pathname;

      }

    }

    catch {

      // Continue

    }


    // Remove query/hash
    cleaned =
      cleaned
        .split('?')[0]
        .split('#')[0];


    // Remove beginning /
    cleaned =
      cleaned.replace(
        /^\/+/,
        ''
      );


    // Remove ending /
    cleaned =
      cleaned.replace(
        /\/+$/,
        ''
      );


    // Remove properties/
    cleaned =
      cleaned.replace(
        /^properties\//i,
        ''
      );


    return decodeURIComponent(
      cleaned
    );

  }

}