'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import 'swagger-ui-react/swagger-ui.css';

// Dynamically import SwaggerUI with SSR disabled
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

// Your Swagger JSON specification
const swaggerDocument = {
  "swagger": "2.0",
  "info": {
    "title": "Wa Bot ",
    "description": "Description",
    "version": "1.0.0"
  },
  "host": "localhost:3000",
  "basePath": "/",
  "schemes": [
    "http"
  ],
  "paths": {
    "/send": {
      "post": {
        "description": "",
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "schema": {
              "type": "object",
              "properties": {
                "to": { "example": "any" },
                "message": { "example": "any" },
                "sessionId": { "example": "any" }
              }
            }
          }
        ],
        "responses": {
          "200": { "description": "OK" }
        }
      }
    },
    "/send-bulk": {
      "post": {
        "description": "",
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "schema": {
              "type": "object",
              "properties": {
                "messages": { "example": "any" }
              }
            }
          }
        ],
        "responses": {
          "200": { "description": "OK" },
          "400": { "description": "Bad Request" },
          "500": { "description": "Internal Server Error" }
        }
      }
    },
    "/": {
      "get": {
        "description": "",
        "produces": ["text/event-stream"],
        "responses": { "default": { "description": "" } }
      }
    },
    "/get_qr_code": {
      "post": {
        "description": "",
        "parameters": [
          {
            "name": "token",
            "in": "query",
            "type": "string"
          }
        ],
        "responses": {
          "200": { "description": "OK" },
          "400": { "description": "Bad Request" },
          "401": { "description": "Unauthorized" },
          "500": { "description": "Internal Server Error" }
        }
      }
    },
    "/register": {
      "post": {
        "description": "",
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "schema": {
              "type": "object",
              "properties": {
                "email": { "example": "any" },
                "name": { "example": "any" },
                "password": { "example": "any" }
              }
            }
          }
        ],
        "responses": { "default": { "description": "" } }
      }
    },
    "/apikey/create": {
      "post": {
        "description": "",
        "responses": {
          "401": { "description": "Unauthorized" }
        }
      }
    },
    "/login": {
      "post": {
        "description": "",
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "schema": {
              "type": "object",
              "properties": {
                "email": { "example": "any" },
                "password": { "example": "any" }
              }
            }
          }
        ],
        "responses": { "default": { "description": "" } }
      }
    },
    "/{apiKey}": {
      "post": {
        "description": "",
        "parameters": [
          {
            "name": "apiKey",
            "in": "path",
            "required": true,
            "type": "string"
          },
          {
            "name": "body",
            "in": "body",
            "schema": {
              "type": "object",
              "properties": {
                "webhookUrl": { "example": "any" }
              }
            }
          }
        ],
        "responses": {
          "200": { "description": "OK" },
          "400": { "description": "Bad Request" },
          "404": { "description": "Not Found" },
          "500": { "description": "Internal Server Error" }
        }
      }
    }
  }
};

const ApiDocsPage: React.FC = () => {
  return (
    <div className='bg-white' style={{ padding: '20px' }}>
      <SwaggerUI spec={swaggerDocument} />
    </div>
  );
};

export default ApiDocsPage;
