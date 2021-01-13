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
      const key = param[0];
      const value = param[1];

      if (value) {
        if (Array.isArray(value)) {
          value.forEach((p) => {
            url += key + '=' + p + '&';
          });
        } else {
          url += key + '=' + value + '&';
        }
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
   * Gets game information by the game ID.
   * @param {string} id - The ID of the game.
   */
  getGameById(id) {
    const options = { id };
    const url = this._parseOptions('games', options);
    return this._fetch(url, 'GET');
  }

  /**
   * Gets game information by the game name.
   * @param {string} name - The name of the game.
   */
  getGameByName(name) {
    const options = { name };
    const url = this._parseOptions('games', options);
    return this._fetch(url, 'GET');
  }

  /**
   * Get the top games from Twitch.
   * @param {GameOptions} [options={}] - The optional options for fetching the top games.
   */
  getTopGames({
    limit = 20,
    forwardPagination,
    backwardPagination,
  } = {}) {
    const options = { 
      first: limit, 
      after: forwardPagination, 
      before: backwardPagination, 
    };
    
    const url = this._parseOptions('games/top', options);
    return this._fetch(url, 'GET');
  } 

  /**
   * Gets the Twitch Clips.
   * @param {string} method - The method to get the clips.
   * @param {string} query - The query for the clips.
   * @param {ClipOptions} options - The options for the clips.
   */
  _getClips(method, query, options) {
    options[method] = query;
    const url = this._parseOptions('clips', options);
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
    return this._getClips('broadcaster_id', id, { 
      first: limit,
      after: forwardPagination,
      before: backwardPagination,
      started_at: startedAt,
      ended_at: endedAt,
    });
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
    return this._getClips('game_id', id, {
      first: limit,
      after: forwardPagination,
      before: backwardPagination,
      started_at: startedAt,
      ended_at: endedAt,
    });
  }

  /**
   * Get clips by the game ID.
   * @param {string|Array} id - The ID of the game. Maxium: 100.
   * @param {ClipOptions} options - Optional options for fetching the clip.
   */
  getClipsByClipId(id, {
    limit = 20,
    forwardPagination,
    backwardPagination,
    endedAt,
    startedAt,
  } = {}) {
    return this._getClips('id', id, {
      first: limit,
      after: forwardPagination,
      before: backwardPagination,
      started_at: startedAt,
      ended_at: endedAt,
    });
  }

  /**
   * Gets the Twitch Stream.
   * @param {string} method - The method for fetching the stream.
   * @param {string} query - The query for fetching the stream.
   * @param {StreamOptions} options - The options for fetching the stream.
   */
  _getStreams(method, query, options) {
    const opts = {
      language: options.language,
      first: options.limit,
      after: options.forwardPagination,
      before: options.backwardPagination,
    };

    if (method && query) {
      opts[method] = Array.isArray(query) ? [] : query;

      if (Array.isArray(query)) {
        query.forEach((q) => {
          opts[method].push(q);
        });
      }
    }

    if (Array.isArray(opts.language)) {
      opts.language.forEach((l) => {
        opts.language.push(l);
      });
    }

    const url = this._parseOptions('streams', opts);
    return this._fetch(url);
  }

  /**
   * Gets active stream information.
   * @param {string} query - The broadcasters ID.
   * @param {StreamOptions} [options={}] - The optional option for fetching the steam.
   */
  getStreamsByBroadcasterID(query, {
    limit = 20,
    forwardPagination,
    backwardPagination,
    language,
  } = {}) {
    return this._getStreams('user_id', query, { 
      language: Array.isArray(language) ? [] : language,
      first: limit,
      after: forwardPagination,
      before: backwardPagination,
    });
  }

  /**
   * Gets active stream information using the Id of a game.
   * @param {string} id - The Id of the game.
   * @param {StreamOptions} [options={}] - The optional options for fetching the stream.
   */
  getStreamsByGameId(id, {
    limit = 20,
    forwardPagination,
    backwardPagination,
    language,
  } = {}) {
    return this._getStreams('game_id', id, { 
      language: Array.isArray(language) ? [] : language,
      first: limit,
      after: forwardPagination,
      before: backwardPagination,
    });
  }

  /**
   * Gets active stream information using the username of the broadcaster.
   * @param {string} name - The name(s) of the broadcasters. 
   * @param {StreamOptions} [options={}] - The optional options for fetching the streams.
   */
  getStreamsByUsername(name, {
    limit = 20,
    forwardPagination,
    backwardPagination,
    language,
  } = {}) {
    return this._getStreams('user_login', name, { 
      language: Array.isArray(language) ? [] : language,
      first: limit,
      after: forwardPagination,
      before: backwardPagination,
    });
  }

  /**
   * Gets active stream information.
   * @param {StreamOptions} [options={}] - The optional options for fetching the streams.
   */
  getStreams({
    limit = 20,
    forwardPagination,
    backwardPagination,
    language,
  } = {}) {
    return this._getStreams(null, null, { 
      language: Array.isArray(language) ? [] : language,
      first: limit,
      after: forwardPagination,
      before: backwardPagination,
    });
  }

  /**
   * Gets Twitch users.
   * @param {string} method - The method to fetch the user(s).
   * @param {string} query - The query to fetch the user(s).
   */
  _getUsers(method, query) {
    const opts = {};

    if (method && query) {
      opts[method] = Array.isArray(query) ? [] : query;

      if (Array.isArray(query)) {
        query.forEach((q) => {
          opts[method].push(q);
        });
      }
    }

    const url = this._parseOptions('users', opts);
    return this._fetch(url, 'GET');
  }

  /**
   * Gets Twitch user(s) by their Id.
   * @param {string|Array} id - The Twitch user(s) Id. Maxium: 100.
   */
  getUsersById(id) {
    return this._getUsers('id', id);
  }

  /**
   * Gets Twitch user(s) by their username.
   * @param {string|Array} name - The Twitch user(s) username. Maxium: 100.
   */
  getUsersByUsername(name) {
    return this._getUsers('login', name);
  }

  /**
   * Gets a Twitch users followers.
   * @param {string} id - The Id of the Twitch user.
   * @param {FollowerOptions} [options={}] - The optional options for fetching the followers.
   */
  getUsersFollowers(id, {
    limit = 20,
    forwardPagination,
  } = {}) {
    const options = { 
      to_id: id, 
      first: limit, 
      after: forwardPagination 
    };

    const url = this._parseOptions('users/follows', options);
    return this._fetch(url, 'GET');
  }

  /**
   * Gets a Twitch users following.
   * @param {string} id - The Id of the Twitch user.
   * @param {FollowerOptions} [options={}] - The optional options for fetching the following. 
   */
  getUsersFollowing(id, {
    limit = 20,
    forwardPagination,
  } = {}) {
    const options = { 
      from_id: id,
      first: limit,
      after: forwardPagination,
    };
    
    const url = this._parseOptions('users/follows', options);
    return this._fetch(url, 'GET');
  }

  /**
   * Get stream tags from a broadcaster stream.
   * @param {string} id - The broadcasters Id.
   */
  getStreamTags(id) {
    const options = { broadcaster_id: id };
    const url = this._parseOptions('streams/tags', options);
    return this._fetch(url, 'GET');
  }

  /**
   * Fetchs a videos from Twitch.
   * @param {string} method - The fetch in which to fetch the video.
   * @param {string} query - The query in which to fetch the video.
   * @param {VideoOptions} options - The options in which to fetch the video.
   */
  _getVideos(method, query, options) {
    options[method] = query;
    const url = this._parseOptions('videos', options);
    return this._fetch(url, 'GET');
  }

  /**
   * Gets Twitch videos from a broadcaster.
   * @param {string} id - The broadcaster's id.
   * @param {VideoOptions} [options={}] - The options for fetching the videos. 
   */
  getVideosByBroadcasterId(id, {
    limit = 20,
    forwardPagination,
    backwardPagination,
    language,
    period = 'all',
    sort = 'time',
    type = 'all',
  } = {}) {
    return this._getVideos('user_id', id, {
      first: limit,
      after: forwardPagination,
      before: backwardPagination,
      language,
      period,
      sort,
      type,
    });
  }

}

module.exports = Twitch;

/**
 * @typedef {Object} GameOptions
 * @property {number} [limit=20] - The limit of games to be returned. Maximum: 100.
 * @property {string} [forwardPagination] - The cursor for the forward pagination.
 * @property {string} [backwardPagination] - The cursor for the backward pagination.
 */

/**
 * @typedef {Object} ClipOptions
 * @property {number} [limit=20] - The limit of clips to be returned. Maxium: 100.
 * @property {string} [forwardPagination] - The cursor for the forward pagination.
 * @property {string} [backwardPagination] - The cursor for the backward pagination.
 * @property {string} [startedAt] - Starting date for the returned clips in RFC3339 format.
 * @property {string} [endedAt] - The ending date for the returned clips in RFC3339 format.
 */

/**
 * @typedef {Object} StreamOptions
 * @property {number} [limit=20] - The limit of streams to be returned. Maxium: 100.
 * @property {string} [forwardPagination] - The cursor for the forward pagination.
 * @property {string} [backwardPagination] - The cursor for the backward pagination.
 * @property {string|Array} [language] - The stream language. Value must be a ISO 639-1. Maxium: 100.
 */

/**
 * @typedef {Object} FollowerOptions
 * @property {number} [limit=20] - The limit of followers to return. Maxium: 100.
 * @property {string} [forwardPagination] - The cursor for the forward pagination.
 */

/**
 * @typedef {Object} VideoOptions
 * @property {number} [limit=20] - The limit of videos to return. Maximum: 100.
 * @property {string} [forwardPagination] - The cursor for the forward pagination.
 * @property {string} [backwardPagination] - The cursor for the backward pagination.
 * @property {string} [language] - The stream language. Value must be a ISO 639-1.
 * @property {string} [period='all'] - The period during which the video was created. Either: 'all' | 'day' | 'week' | 'month'
 * @property {string} [sort='time'] - Sort order of the videos. Either: 'time' | 'trending' | 'views'
 * @property {string} [type='all'] - Type of video. Either: 'all' | 'upload' | 'archive' | 'highlight'
 */