import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Cookies from 'js-cookie';

export const useAnonymousSession = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session ID in cookie
    let existingSessionId = Cookies.get('anonymous-session-id');
    
    // If no session ID exists, create one
    if (!existingSessionId) {
      existingSessionId = uuidv4();
      // Set cookie with a 30-day expiry and secure attributes
      Cookies.set('anonymous-session-id', existingSessionId, {
        expires: 30,
        secure: true,
        sameSite: 'strict'
      });
    }
    
    setSessionId(existingSessionId);
  }, []);

  return sessionId;
};