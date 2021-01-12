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

  /**
   * Gets game information by name or id.
   * @param {string} query - The game name or ID.
   */
  getGame(query) {
    let options;
    
    if (/\d+/.test(query)) {
      options = { id: query };
    } else {
      options = { name: query };
    }

    const url = this._parseOptions('games', options);
    return this._fetch(url, 'GET');
  }

  /**
   * Get clips by the broadcaster's ID.
   * @param {string} id - The ID of the broadcaster.
   * @param {ClipOptions} [options={}] - Optional options for fetching the clip.
   */
  getClipsByBroadcaster(id, {
    limit = 20,
    forwardPagination,
    backwardPagination,
    endedAt,
    startedAt,
  } = {}) {
    const options = { 
      broadcaster_id: id,
      first: limit,
      after: forwardPagination,
      before: backwardPagination,
      started_at: startedAt,
      ended_at: endedAt,
    };

    const url = this._parseOptions('clips', options);
    return this._fetch(url, 'GET');
  }

  /**
   * Get clips by the game ID.
   * @param {string} id - The ID of the game.
   * @param {ClipOptions} options - Optional options for fetching the clip.
   */
  getClipsByGameId(id, {
    limit = 20,
    forwardPagination,
    backwardPagination,
    endedAt,
    startedAt,
  } = {}) {
    const options = {
      game_id: id,
      first: limit,
      after: forwardPagination,
      before: backwardPagination,
      started_at: startedAt,
      ended_at: endedAt,
    };

    const url = this._parseOptions('clips', options);
    return this._fetch(url);
  }

}

module.exports = Twitch;

/**
 * @typedef {Object} ClipOptions
 * @property {number} [limit=20] - The limit of clips to be returned. Maxium: 100.
 * @property {string} [forwardPagination] - The cursor for the forward pagination.
 * @property {string} [backwardPagination] - The cursor for the backward pagination.
 * @property {string} [startedAt] - Starting date for the returned clips in RFC3339 format.
 * @property {string} [endedAt] - The ending date for the returned clips in RFC3339 format.
 */