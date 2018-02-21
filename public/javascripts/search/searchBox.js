'use strict';

import $ from 'jquery';
import m from 'mithril';

let enter = function(elem, checkboxClass) {
  $(elem).keyup(e => {
    if (e.keyCode == 13) {
      $('#search-button').click();
    }
  });
};

function languageFilter(args) {
  if (args.langsExist.length === 0) {
    return m('li', 'There are no languages to filter by.');
  }

  let checkboxes = args.langsExist.map(lang => {
    return m(
      'li',
      [
        m('input[type=checkbox]', {
          id: 'langFilter-' + lang._id,
          style: {
            'margin-right': '5px'
          },
          onclick: function() {
            if (this.checked) {
              args.langFilter().push(lang._id);
            } else {
              _.remove(args.langFilter(), n => n === lang._id);
            }
            args.loadMoreAndApplyFilter(
              args.initial,
              args.langShown(),
              args.langFilter(),
              args.searchString()
            );
          }
        })
      ],
      m(
        'label',
        {
          for: 'langFilter-' + lang._id
        },
        lang.label
      )
    );
  });

  checkboxes.unshift(m('li', 'Show songs that have translations in: '));
  return checkboxes;
}

const searchBox = {
  view: vnode => {
    let args = vnode.attrs;
    return m(
      '#searchInput.input-group',
      {
        style: {
          width: '100%'
        }
      },
      [
        m('input.form-control[type=text]', {
          placeholder: 'Search by title, lyrics or author',
          onchange: m.withAttr('value', args.searchString),
          oninit: vnode => {
            enter(vnode.dom);
          }
        }),
        m('span.input-group-btn', [
          m(
            'button#search-button.btn.btn-success',
            {
              onclick: function() {
                args.loadMoreAndApplyFilter(
                  args.initial,
                  args.langShown(),
                  args.langFilter(),
                  args.searchString()
                );
              }
            },
            [m('i.glyphicon.glyphicon-search')]
          )
        ]),
        m('span.input-group-btn', [
          m('.btn-group', [
            m(
              'button.btn.btn-default.dropdown-toggle[type=button]',
              {
                'data-toggle': 'dropdown',
                'aria-haspopup': 'true',
                'aria-expanded': 'false'
              },
              [m('i.glyphicon.glyphicon-cog')]
            ),
            m(
              'ul.dropdown-menu',
              {
                style: {
                  padding: '10px'
                }
              },
              languageFilter(args)
            )
          ])
        ])
      ]
    );
  }
};

export default searchBox;
