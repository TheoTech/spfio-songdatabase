'use strict';

import $ from 'jquery';
import m from 'mithril';
import prop from 'mithril/stream';
import songsNotFound from './notfound';

import {
  selectPlaylist,
  addToPlaylistButton,
  playlistModal
} from '../playlist';
import { addOrDeleteButton } from '../library';

let displayedSongs = prop([]);
let playlistName = prop('');
let searchString = prop('');
let addButtonDOM = prop();
let inLibrary = prop();

let searchResultComponent = {
  view: () => {
    if (displayedSongs().length === 0) {
      return songsNotFound;
    } else {
      return m('div', [
        m('.table-responsive', [
          m('table.table', [
            m('thead', [
              m('th'),
              m('th', 'Title'),
              m('th', 'Author'),
              m('th.text-center', [
                m(selectPlaylist, {
                  playlistName: playlistName,
                  addButtonDOM: addButtonDOM
                })
              ])
            ]),
            m('tbody', [
              displayedSongs().map(s => {
                s.label = s.label || prop('Add to Playlist');
                s.disabled = s.disabled || prop(false);
                return m('tr', [
                  m('td', [
                    m(addOrDeleteButton, {
                      songID: s._id,
                      url: '/',
                      inLibrary: inLibrary
                    })
                  ]),
                  m('td.alignWithTitle', [
                    m(
                      'a',
                      {
                        href: '/song/' + s._id
                      },
                      s.title
                    )
                  ]),
                  m('td.alignWithTitle', s.author),
                  m('td.text-center', [
                    m(addToPlaylistButton, {
                      playlistName: playlistName,
                      songID: s._id,
                      label: s.label,
                      disabled: s.disabled,
                      addButtonDOM: addButtonDOM,
                      playlistModal: playlistModal
                    })
                  ])
                ]);
              })
            ])
          ])
        ]),
        m(playlistModal.playlistModalComponent, {
          playlistName: playlistName,
          addButtonDOM: addButtonDOM
        })
      ]);
    }
  }
};

const searchPage = {
  init: (dom, opts) => {
    displayedSongs(opts.songs);
    inLibrary(opts.inLibrary);
    m.mount(dom, searchResultComponent);
  }
};

export default searchPage;
