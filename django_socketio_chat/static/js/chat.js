// Generated by CoffeeScript 1.4.0
(function() {
  var Chat, ChatParticipantList, SessionStateUI,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  SessionStateUI = (function() {

    function SessionStateUI(conn) {
      var session_states,
        _this = this;
      this.conn = conn;
      session_states = "<div class=\"btn-group\">\n    <a class=\"btn dropdown-toggle\" data-toggle=\"dropdown\" href=\"#\">\n        <span class=\"state\"></span>\n        <span class=\"caret\"></span>\n    </a>\n    <ul class=\"dropdown-menu\">\n        <li><a class=\"become-available\" href=\"#\">Available</a></li>\n        <li><a class=\"become-busy\" href=\"#\">Busy</a></li>\n        <li><a class=\"become-invisible\" href=\"#\">Invisible</a></li>\n        <li><a class=\"sign-off\" href=\"#\">Sign off</a></li>\n    </ul>\n</div>";
      $('.session-state').html(session_states);
      $('.session-state .become-available').click(function(e) {
        e.preventDefault();
        return _this.conn.emit('req_user_become_available');
      });
      $('.session-state .become-busy').click(function(e) {
        e.preventDefault();
        return _this.conn.emit('req_user_become_busy');
      });
      $('.session-state .become-invisible').click(function(e) {
        e.preventDefault();
        return _this.conn.emit('req_user_become_invisible');
      });
      $('.session-state .sign-off').click(function(e) {
        e.preventDefault();
        return _this.conn.emit('req_user_sign_off');
      });
    }

    SessionStateUI.prototype.set_available = function() {
      $('.session-state .state').html('Available');
      return $('.session-state .btn').addClass('btn-success');
    };

    SessionStateUI.prototype.set_busy = function() {
      $('.session-state .state').html('Busy');
      return $('.session-state .btn').addClass('btn-danger');
    };

    SessionStateUI.prototype.set_invisible = function() {
      $('.session-state .state').html('Invisible');
      return $('.session-state .btn').addClass('btn-inverse');
    };

    SessionStateUI.prototype.set_signed_off = function() {
      return $('.session-state .state').html('Signed off');
    };

    return SessionStateUI;

  })();

  ChatParticipantList = (function() {

    function ChatParticipantList(user_chat_statuses) {
      this.append = __bind(this.append, this);

      this.render = __bind(this.render, this);

      var ucs;
      this.user_list = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = user_chat_statuses.length; _i < _len; _i++) {
          ucs = user_chat_statuses[_i];
          _results.push(ucs.user__username);
        }
        return _results;
      })();
    }

    ChatParticipantList.prototype.render = function() {
      var chat_users_el, username;
      chat_users_el = "<ul class=\"chat-participant-list unstyled\">";
      chat_users_el = "" + chat_users_el + (((function() {
        var _i, _len, _ref, _results;
        _ref = this.user_list;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          username = _ref[_i];
          _results.push("<li>" + username + "</li>");
        }
        return _results;
      }).call(this)).join(''));
      chat_users_el = "" + chat_users_el + "</ul>";
      return chat_users_el;
    };

    ChatParticipantList.prototype.append = function(username) {
      return this.user_list.push(username);
    };

    return ChatParticipantList;

  })();

  Chat = (function() {
    var chat_session, conn;

    function Chat() {
      this.update_add_user_list = __bind(this.update_add_user_list, this);

      this.ui_animate_new_message = __bind(this.ui_animate_new_message, this);

      this.ui_chat_scroll_down = __bind(this.ui_chat_scroll_down, this);

      this.update_chats_chat_messages_message_ui = __bind(this.update_chats_chat_messages_message_ui, this);

      this.update_chats_chat_messages_ui = __bind(this.update_chats_chat_messages_ui, this);

      this.ui_chat_archive = __bind(this.ui_chat_archive, this);

      this.ui_chat_clear_unread_messages = __bind(this.ui_chat_clear_unread_messages, this);

      this.ui_chat_set_unread_messages = __bind(this.ui_chat_set_unread_messages, this);

      this.ui_chat_deactivate = __bind(this.ui_chat_deactivate, this);

      this.ui_chat_activate = __bind(this.ui_chat_activate, this);

      this.get_user_chat_status = __bind(this.get_user_chat_status, this);

      this.update_chat_ui = __bind(this.update_chat_ui, this);

      this.update_chat_list_ui = __bind(this.update_chat_list_ui, this);

      this.user_list_add_user = __bind(this.user_list_add_user, this);

      this.update_user_list_ui = __bind(this.update_user_list_ui, this);

      this.ui_invisible = __bind(this.ui_invisible, this);

      this.ui_busy = __bind(this.ui_busy, this);

      this.ui_available = __bind(this.ui_available, this);

      this.init = __bind(this.init, this);

    }

    chat_session = null;

    conn = null;

    Chat.prototype.init = function() {
      this.connect();
      return this.chat_users_lists = {};
    };

    Chat.prototype.debug_log = function(msg) {
      var control, now;
      control = $('.debug-log');
      now = new Date();
      return control.append(now.toLocaleTimeString() + ': ' + msg + '<br/>');
    };

    Chat.prototype.connect = function() {
      var _this = this;
      this.conn = io.connect('https://' + window.location.host, {
        'force_new_connection': false,
        'rememberTransport': true,
        'resource': 'chat/socket.io'
      });
      this.debug_log('Connecting...');
      this.conn.on('connect', function() {
        return _this.debug_log('Connected');
      });
      this.conn.on('ev_chat_session_status', function(chat_session) {
        _this.chat_session = chat_session;
        if (_this.chat_session.status === 0) {
          return _this.ui_signed_off();
        }
      });
      this.conn.on('ev_data_update', function(chat_session, chat_users, chats) {
        _this.chat_session = chat_session;
        if (_this.chat_session.status === 1) {
          _this.ui_available();
        }
        if (_this.chat_session.status === 2) {
          _this.ui_invisible();
        }
        if (_this.chat_session.status === 3) {
          _this.ui_busy();
        }
        _this.chat_users = chat_users;
        _this.update_user_list_ui(chat_users);
        return _this.update_chat_list_ui(chats);
      });
      this.conn.on('disconnect', function(data) {
        _this.debug_log('Disconnect');
        return _this.conn = null;
      });
      this.conn.on('ev_user_became_available', function(username, chat_users) {
        _this.debug_log("" + username + " became available.");
        _this.chat_users = chat_users;
        return _this.update_user_list_ui(chat_users);
      });
      this.conn.on('ev_user_became_busy', function(username, chat_users) {
        _this.debug_log("" + username + " became busy.");
        _this.chat_users = chat_users;
        return _this.update_user_list_ui(chat_users);
      });
      this.conn.on('ev_user_signed_off', function(username, chat_users) {
        _this.debug_log("" + username + " signed off.");
        _this.chat_users = chat_users;
        return _this.update_user_list_ui(chat_users);
      });
      this.conn.on('ev_chat_created', function(chat) {
        return _this.update_chat_ui(chat);
      });
      this.conn.on('ev_you_were_added', function(chat) {
        return _this.update_chat_ui(chat);
      });
      this.conn.on('ev_chat_user_added', function(chat_uuid, username) {
        var chat, chat_user_list;
        chat_user_list = _this.chat_users_lists[chat_uuid];
        chat_user_list.append(username);
        chat = $("#chat-" + chat_uuid);
        return chat.find('.chat-users').html(chat_user_list.render());
      });
      this.conn.on('ev_message_sent', function(message, user_chat_statuses) {
        var user_chat_status;
        _this.update_chats_chat_messages_message_ui(message);
        _this.ui_animate_new_message(message.chat__uuid);
        user_chat_status = _this.get_user_chat_status(user_chat_statuses);
        return _this.ui_chat_set_unread_messages(message.chat__uuid, user_chat_status.unread_messages);
      });
      this.conn.on('ev_chat_activated', function(chat_uuid) {
        return _this.ui_chat_activate(chat_uuid);
      });
      this.conn.on('ev_chat_deactivated', function(chat_uuid) {
        return _this.ui_chat_deactivate(chat_uuid);
      });
      return this.conn.on('ev_chat_archived', function(chat_uuid) {
        return _this.ui_chat_archive(chat_uuid);
      });
    };

    Chat.prototype.ui_signed_off = function() {
      var session_state;
      $('.chat-window').hide();
      session_state = new SessionStateUI(this.conn);
      return session_state.set_signed_off();
    };

    Chat.prototype.ui_available = function() {
      var $chat_window, session_state;
      $chat_window = $('.chat-window');
      $chat_window.show();
      session_state = new SessionStateUI(this.conn);
      return session_state.set_available();
    };

    Chat.prototype.ui_busy = function() {
      var $chat_window, session_state;
      $chat_window = $('.chat-window');
      $chat_window.show();
      session_state = new SessionStateUI(this.conn);
      return session_state.set_busy();
    };

    Chat.prototype.ui_invisible = function() {
      var $chat_window, session_state;
      $chat_window = $('.chat-window');
      $chat_window.show();
      session_state = new SessionStateUI(this.conn);
      return session_state.set_invisible();
    };

    Chat.prototype.update_user_list_ui = function(users) {
      var user, _i, _len, _results;
      $('.users .user-list').empty();
      _results = [];
      for (_i = 0, _len = users.length; _i < _len; _i++) {
        user = users[_i];
        _results.push(this.user_list_add_user(user));
      }
      return _results;
    };

    Chat.prototype.user_list_add_user = function(user) {
      var $user_el, $user_list,
        _this = this;
      $user_list = $('.users .user-list');
      $user_el = $("<li class=\"" + user.status + "\"><a href=\"#\"><i class=\"icon-user\"></i> " + user.username + "</a></li>");
      $user_list.append($user_el);
      return $user_el.on('click', function(e) {
        e.preventDefault();
        return _this.conn.emit('req_chat_create', user.username);
      });
    };

    Chat.prototype.update_chat_list_ui = function(chats) {
      var chat, _i, _len, _results;
      $('.chat-list').empty();
      _results = [];
      for (_i = 0, _len = chats.length; _i < _len; _i++) {
        chat = chats[_i];
        _results.push(this.update_chat_ui(chat));
      }
      return _results;
    };

    Chat.prototype.update_chat_ui = function(chat) {
      var $chat_active_toggle, $chat_el, $chat_list, $message_input, $message_input_el, $messages_el, chat_participant_list, self, user_chat_status,
        _this = this;
      $chat_el = $("<div id=\"chat-" + chat.uuid + "\" class=\"chat well well-small\">\n    <div class=\"chat-header toggle-active clearfix\"></div>\n</div>");
      chat_participant_list = new ChatParticipantList(chat.user_chat_statuses);
      this.chat_users_lists[chat.uuid] = chat_participant_list;
      $chat_el.find('.chat-header').append(chat_participant_list.render());
      $chat_el.find('.chat-header').append($("<div class=\"chat-controls\">\n    <div class=\"btn-group\">\n        <a class=\"btn btn-small dropdown-toggle btn-show-add-user-list\" data-toggle=\"dropdown\" href=\"#\">\n            <i class=\"icon-plus\"></i>\n        </a>\n        <ul class=\"dropdown-menu chat-user-list unstyled\"></ul>\n    </div>\n    <a href=\"#\" class=\"archive btn btn-small\"><i class=\"icon-remove\"></i></a>\n    <div class=\"unread-messages badge\"></div>\n</div>"));
      $messages_el = $('<div class="messages"><div class="messages-inner clearfix"></div></div>');
      $chat_el.append($messages_el);
      $message_input_el = $("<div class=\"message-input input-prepend\">\n    <div class=\"add-on\"><i class=\"icon-user\"></i></div>\n    <input type=\"text\" placeholder=\"Type message\">\n</div>");
      $chat_el.append($message_input_el);
      $message_input = $message_input_el.find('input');
      self = this;
      $message_input.keypress(function(e) {
        if (e.which === 13) {
          e.preventDefault();
          if (this.value === '') {
            return;
          }
          self.conn.emit('req_message_send', this.value, chat.uuid);
          return this.value = '';
        }
      });
      $chat_active_toggle = $chat_el.find('.toggle-active');
      $chat_active_toggle.click(function(e) {
        e.preventDefault();
        if ($chat_active_toggle.hasClass('js_active')) {
          return _this.conn.emit('req_chat_deactivate', chat.uuid);
        } else {
          return _this.conn.emit('req_chat_activate', chat.uuid);
        }
      });
      $chat_el.find('.btn-show-add-user-list').click(function(e) {
        e.preventDefault();
        e.stopPropagation();
        $(e.target).dropdown();
        return _this.update_add_user_list(chat.uuid);
      });
      $chat_el.find('.archive').click(function(e) {
        e.preventDefault();
        return _this.conn.emit('req_chat_archive', chat.uuid);
      });
      $chat_list = $('.chat-list');
      $chat_list.append($chat_el);
      user_chat_status = this.get_user_chat_status(chat.user_chat_statuses);
      if (user_chat_status.status === 'active') {
        this.ui_chat_activate(chat.uuid);
      } else if (user_chat_status.status === 'inactive') {
        this.ui_chat_deactivate(chat.uuid);
        this.ui_chat_set_unread_messages(chat.uuid, user_chat_status.unread_messages);
      }
      if (chat.messages.length > 0) {
        return this.update_chats_chat_messages_ui(chat.messages);
      }
    };

    Chat.prototype.get_user_chat_status = function(user_chat_statuses) {
      var self, ucs;
      self = this;
      return ((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = user_chat_statuses.length; _i < _len; _i++) {
          ucs = user_chat_statuses[_i];
          if (ucs.user__username === self.chat_session.username) {
            _results.push(ucs);
          }
        }
        return _results;
      })())[0];
    };

    Chat.prototype.ui_chat_activate = function(chat_uuid) {
      var chat, toggle;
      chat = $("#chat-" + chat_uuid);
      toggle = chat.find('.toggle-active');
      toggle.addClass('js_active');
      chat.find('.messages').show();
      chat.find('.message-input').show();
      this.ui_chat_clear_unread_messages(chat_uuid);
      return this.ui_chat_scroll_down(chat_uuid);
    };

    Chat.prototype.ui_chat_deactivate = function(chat_uuid) {
      var chat, toggle;
      chat = $("#chat-" + chat_uuid);
      toggle = chat.find('.toggle-active');
      toggle.removeClass('js_active');
      chat.find('.messages').hide();
      return chat.find('.message-input').hide();
    };

    Chat.prototype.ui_chat_set_unread_messages = function(chat_uuid, count) {
      var chat, unread_messages;
      chat = $("#chat-" + chat_uuid);
      unread_messages = chat.find('.unread-messages');
      if (count > 0) {
        return unread_messages.html(count).addClass('active');
      } else {
        return unread_messages.removeClass('active');
      }
    };

    Chat.prototype.ui_chat_clear_unread_messages = function(chat_uuid) {
      var chat;
      chat = $("#chat-" + chat_uuid);
      return chat.find('.unread-messages').html('');
    };

    Chat.prototype.ui_chat_archive = function(chat_uuid) {
      var chat;
      chat = $("#chat-" + chat_uuid);
      return chat.remove();
    };

    Chat.prototype.update_chats_chat_messages_ui = function(messages) {
      var message, _i, _len;
      for (_i = 0, _len = messages.length; _i < _len; _i++) {
        message = messages[_i];
        this.update_chats_chat_messages_message_ui(message);
      }
      return this.ui_chat_scroll_down(messages[0].chat__uuid);
    };

    Chat.prototype.update_chats_chat_messages_message_ui = function(message) {
      var $chat_messages_el, s, stamp,
        _this = this;
      $chat_messages_el = $("#chat-" + message.chat__uuid + " .messages-inner");
      stamp = function(timestamp) {
        timestamp = new Date(timestamp);
        return ('0' + timestamp.getHours()).slice(-2) + ':' + ('0' + timestamp.getMinutes()).slice(-2);
      };
      s = "<blockquote id=\"message-" + message.uuid + "\" class=\"message\n    " + (message.user_from__username === this.chat_session.username ? ' pull-right\"' : '\"') + ">\n    <p class=\"msg-body\">" + message.message_body + "</p>\n    <small class=\"msg-sender-timestamp\">" + message.user_from__username + " - " + (stamp(message.timestamp)) + "</small>\n</blockquote>";
      return $chat_messages_el.append($(s));
    };

    Chat.prototype.ui_chat_scroll_down = function(chat_uuid, animate) {
      var $msgs, $wpr;
      if (animate == null) {
        animate = false;
      }
      $wpr = $("#chat-" + chat_uuid + " .messages");
      $msgs = $wpr.find('.messages-inner');
      if (!animate) {
        return $wpr.scrollTop($msgs.outerHeight());
      } else {
        return $wpr.animate({
          scrollTop: $msgs.outerHeight()
        }, 1000);
      }
    };

    Chat.prototype.ui_animate_new_message = function(chat_uuid) {
      var animate;
      return this.ui_chat_scroll_down(chat_uuid, animate = true);
    };

    Chat.prototype.update_add_user_list = function(chat_uuid) {
      var $chat_user_list, chat, user, _i, _len, _ref,
        _this = this;
      chat = $("#chat-" + chat_uuid);
      $chat_user_list = chat.find('.chat-controls .chat-user-list');
      $chat_user_list.empty();
      _ref = this.chat_users;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        user = _ref[_i];
        $chat_user_list.append("<li><a href=\"#\" class=\"user-add\" data-username=\"" + user.username + "\"><i class=\"icon-user\"></i> " + user.username + "</a></li>");
      }
      return $chat_user_list.on('click', '.user-add', function(e) {
        e.preventDefault();
        return _this.conn.emit('req_chat_add_user', chat_uuid, $(e.target).data('username'));
      });
    };

    return Chat;

  })();

  $(function() {
    var chat;
    chat = new Chat();
    return chat.init();
  });

}).call(this);
