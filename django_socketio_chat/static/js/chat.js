// Generated by CoffeeScript 1.4.0
(function() {
  var Chat, ChatUserList,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  ChatUserList = (function() {

    function ChatUserList(user_chat_statuses) {
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

    ChatUserList.prototype.render = function() {
      var chat_users_el, username;
      chat_users_el = "<ul class=\"chat-users unstyled\">";
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

    ChatUserList.prototype.append = function(username) {
      return this.user_list.push(username);
    };

    return ChatUserList;

  })();

  Chat = (function() {
    var chat_session, conn;

    function Chat() {
      this.list_users = __bind(this.list_users, this);

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

      this.update_chats_chat_ui = __bind(this.update_chats_chat_ui, this);

      this.update_chats_ui = __bind(this.update_chats_ui, this);

      this.ui_add_user = __bind(this.ui_add_user, this);

      this.update_users_ui = __bind(this.update_users_ui, this);

      this.ui_signed_in = __bind(this.ui_signed_in, this);

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
        _this.ui_signed_in();
        _this.chat_users = chat_users;
        _this.update_users_ui(chat_users);
        return _this.update_chats_ui(chats);
      });
      this.conn.on('disconnect', function(data) {
        _this.debug_log('Disconnect');
        return _this.conn = null;
      });
      this.conn.on('ev_user_signed_in', function(username, chat_users) {
        _this.debug_log("" + username + " signed in.");
        _this.chat_users = chat_users;
        return _this.update_users_ui(chat_users);
      });
      this.conn.on('ev_user_signed_off', function(username, chat_users) {
        _this.debug_log("" + username + " signed off.");
        _this.chat_users = chat_users;
        return _this.update_users_ui(chat_users);
      });
      this.conn.on('ev_chat_created', function(chat) {
        return _this.update_chats_chat_ui(chat);
      });
      this.conn.on('ev_you_were_added', function(chat) {
        return _this.update_chats_chat_ui(chat);
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
      var _this = this;
      $('.chat-window').hide();
      $('.chat-session-state').html('<h1>Signed off</h1><a class="sign-in" href="#">Sign in</a>');
      return $('.sign-in').click(function(e) {
        e.preventDefault();
        return _this.conn.emit('req_user_sign_in');
      });
    };

    Chat.prototype.ui_signed_in = function() {
      var $chat_window,
        _this = this;
      $chat_window = $('.chat-window');
      $chat_window.show();
      $('.chat-session-state').html('<h1>Signed in</h1><a class="sign-off" href="#">Sign off</a>');
      return $('.sign-off').click(function(e) {
        e.preventDefault();
        return _this.conn.emit('req_user_sign_off');
      });
    };

    Chat.prototype.update_users_ui = function(users) {
      var user, _i, _len, _results;
      $('.user-list').empty();
      _results = [];
      for (_i = 0, _len = users.length; _i < _len; _i++) {
        user = users[_i];
        _results.push(this.ui_add_user(user));
      }
      return _results;
    };

    Chat.prototype.ui_add_user = function(user) {
      var $user_el, $user_list,
        _this = this;
      $user_list = $('.user-list');
      $user_el = $("<li class=\"(" + (user.is_online ? 'online' : 'offline') + ")\"><i class=\"icon-user\"></i> <a href=\"#\">" + user.username + "</a></li>");
      $user_list.append($user_el);
      return $user_el.on('click', function(e) {
        e.preventDefault();
        return _this.conn.emit('req_chat_create', user.username);
      });
    };

    Chat.prototype.update_chats_ui = function(chats) {
      var chat, _i, _len, _results;
      $('.chat-list').empty();
      _results = [];
      for (_i = 0, _len = chats.length; _i < _len; _i++) {
        chat = chats[_i];
        _results.push(this.update_chats_chat_ui(chat));
      }
      return _results;
    };

    Chat.prototype.update_chats_chat_ui = function(chat) {
      var $chat_active_toggle, $chat_el, $chat_list, $message_input, $message_input_el, $messages_el, chat_user_list, self, user_chat_status,
        _this = this;
      chat_user_list = new ChatUserList(chat.user_chat_statuses);
      this.chat_users_lists[chat.uuid] = chat_user_list;
      $chat_el = $("<div id=\"chat-" + chat.uuid + "\" class=\"chat well well-small\">\n    <div class=\"chat-header clearfix\">\n        " + (chat_user_list.render()) + "\n        <div class=\"chat-controls\">\n            <a href=\"#\" class=\"toggle-active btn btn-small\"></a>\n            <a href=\"#\" class=\"archive btn btn-small\">Archive</a>\n            <div class=\"btn-group\">\n                <a class=\"btn list-users dropdown-toggle\" data-toggle=\"dropdown\" href=\"#\">\n                    <i class=\"icon-user\"></i>\n                    <span class=\"caret\"></span>\n                </a>\n                <ul class=\"dropdown-menu chat-user-list unstyled\"></ul>\n            </div>\n            <span class=\"unread-messages badge\"></span>\n        </div>\n    </div>\n</div>");
      $messages_el = $('<div class="messages"><div class="messages-inner clearfix"></div></div>');
      $message_input_el = $("<div class=\"message-input input-prepend\">\n    <div class=\"add-on\"><i class=\"icon-user\"></i></div>\n    <input type=\"text\" placeholder=\"Type message\">\n</div>");
      $chat_el.append($messages_el);
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
      user_chat_status = this.get_user_chat_status(chat.user_chat_statuses);
      $chat_active_toggle.click(function(e) {
        e.preventDefault();
        if ($chat_active_toggle.hasClass('js_active')) {
          return _this.conn.emit('req_chat_deactivate', chat.uuid);
        } else {
          return _this.conn.emit('req_chat_activate', chat.uuid);
        }
      });
      $chat_el.find('.list-users').click(function(e) {
        e.preventDefault();
        return _this.list_users(chat.uuid);
      });
      $chat_el.find('.archive').click(function(e) {
        e.preventDefault();
        return _this.conn.emit('req_chat_archive', chat.uuid);
      });
      $chat_list = $('.chat-list');
      $chat_list.append($chat_el);
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
      toggle = chat.find(".toggle-active");
      toggle.text('Deactivate');
      toggle.addClass('js_active');
      chat.find('.messages').show();
      chat.find('.message-input').show();
      this.ui_chat_clear_unread_messages(chat_uuid);
      return this.ui_chat_scroll_down(chat_uuid);
    };

    Chat.prototype.ui_chat_deactivate = function(chat_uuid) {
      var chat, toggle;
      chat = $("#chat-" + chat_uuid);
      toggle = chat.find(".toggle-active");
      toggle.text(' Activate');
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

    Chat.prototype.list_users = function(chat_uuid) {
      var $chat_user_list, chat, user, _i, _len, _ref,
        _this = this;
      chat = $("#chat-" + chat_uuid);
      $chat_user_list = chat.find('.chat-user-list');
      $chat_user_list.empty();
      _ref = this.chat_users;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        user = _ref[_i];
        $chat_user_list.append("<li><i class=\"icon-user\"></> <a href=\"#\" class=\"user-add\" data-username=\"" + user.username + "\">" + user.username + "</a></li>");
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
