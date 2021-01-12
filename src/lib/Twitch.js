const fetch = require('node-fetch');

const API = 'https://api.twitch.tv/helix/';

/**
 * The Twitch Client.
 * @param {string} client_id - The twitch client id.
 * @param {string} bearer_token - The twitch client bearer token.
 */
class Twitch {
  constructor({
    client_id,
    bearer_token,
  }) {
    /**
     * The twitch client id.
     * @type {string}
     */
    this.client_id = client_id;

    /**
     * The twitch client bearer token.
     * @type {string}
     */
    this.bearer_token = bearer_token;
  }

  /**
   * Parse options for a fetch.
   * @param {string} method - The method used to fetch. Either 'POST' or 'GET'.
   * @param {Object} [options={}] - The options to parse.
   */
  _parseOptions(method, options = {}) {
    const entries = Object.entries(options);

    let url = API + method + '?';

    entries.forEach((param) => {
      if (param[1]) {
        url += param[0] + '=' + param[1] + '&';
      }
    });

    url = url.slice(0, -1);

    return url;
  }

  /**
   * Fetch from twitch's public API.
   * @param {string} url - The url to fetch.
   * @param {string} method - The method to fetch. Either 'GET' or 'POST'.
   */
  async _fetch(url, method) {
    try {
      const res = await fetch(url, {
        method,
        headers: {
          'client-id': this.client_id,
          'Authorization': `Bearer ${this.bearer_token}`,
        }
      });

      const body = await res.json();

      return body;
    }
    catch (err) {
      throw new Error(err);
    }
  }

}

module.exports = Twitch;