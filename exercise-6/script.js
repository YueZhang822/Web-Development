/* -------------------------------------Unauthenticated------------------------------------- */
class Signup extends React.Component {
	render() {
		window.history.pushState({}, "", "/signup");
		return (
			<div className="signup">
				<div className="clip">
					<div className="auth container">
						<h2>Welcome to Belay!</h2>
						<div className="alignedForm signup">
							<label htmlFor="username" className="input">Username</label>
							<input id="username" className="username" type="text" value={this.props.username} onChange={this.props.usernameHandler} />
							<label htmlFor="password" className="input">Password</label>
							<input id="password" className="password" type="password" value={this.props.password} onChange={this.props.passwordHandler} />
							<label htmlFor="password" className="input">Confirm Password</label>
							<input id="repeat_password" className="repeat_password" type="password" value={this.props.repeat_password} onChange={this.props.repeat_passwordHandler} />
							<button id="signup_button" onClick={this.props.signupHandler}>Sign Up</button>
							<div className="login">
							<button id="login_button" className="sinup_button" onClick={this.props.toggleHandler}>Go to Login</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}


class Login extends React.Component {
	render() {
		const isLogged = this.props.isLogged;
		if (isLogged) {
			return <Channel />;
		} else {
			window.history.pushState({}, "", "/login");
			return (
			<div className="login">
				<div className="header">
				<h2>
					<a>Welcome to Belay!</a>
				</h2>
				</div>
				<div className="clip">
				<div className="auth container">
					<div className="alignedForm login">
					<label htmlFor="username" className="input">Username</label>
					<input id="username" className="username" type="text" value={this.props.username} onChange={this.props.usernameHandler} />
					<label for="password">Password</label>
					<input id="password" className="password" type="password" value={this.props.password} onChange={this.props.passwordHandler} />
					<button id="login_button" className="login_button" onClick={this.pros.loginHandler}>Login</button>
					</div>
					<div className="create">
					<button id="create_button" className="create_button" onclick={this.props.toggleHandler} >Create a new Account</button>
					</div>
				</div>
				</div>
			</div>
			);
		}
	}
}


/* -------------------------------------Authenticated------------------------------------- */

/* -------------------------------------Sidebar------------------------------------- */

class SingleChannel extends React.Component {
	render() {
		const channelName = this.props.channelname;
		return (
			<div className="wrapped-channel">
				<div className="channel-container">
					<span className="material-symbols-outlined md-18">chat</span>
					<span className="channel-name" onClick={this.props.getChannelHandler}>{channelName}</span>
					<p id="new_message_count" className="new_message-count">{this.props.message_count} unread</p>
				</div>
			</div>
		);
	}
}

class NewChannel extends React.Component {
	render() {
		return (
			<div className="new-channel-container">
				<input id="new-channel-name" className="new-channel-name" type="text" placeholder="New Channel" />
				<button id="new-channel-button" className="new-channel-button" onClick={this.props.createChannelHandler}>Create</button>
				<button id="cancle-new-channel" className="cancle-new-channel" onClick={this.props.cancleCreateHandler}>Cancle</button>
			</div>
		);
	}
}

class WholeSidebar extends React.Component {
	render() {
		const channels = this.props.channels;
		const channelItems = channels.map(channel => (
			<SingleChannel
				id={channel.id}
				channelname={channel.name}
				message_count={channel.message_count}
				getChannelHandler={this.props.getChannelHandler}
			/>
		));
		return (
			<div className="sidebar">
				<div className="channel-list">
					<b>Channels</b>
					{channelItems}
				</div>
				<div className="add-channel-container">
					<div className="add-channel-button">
					<span className="material-symbols-outlined md-18" onClick={this.props.newChannelHandler}>add</span>
					</div>
					<NewChannel
						createChannelHandler={this.props.createChannelHandler}
						cancleCreateHandler={this.props.cancleCreateHandler}
					/>
				</div>
			</div>
		);
	}
}


/* -------------------------------------Mainpage------------------------------------- */

class MainUpperBar extends React.Component {
	render() {
		<div className="main-upperbar">
				<div className="title-container">
				    <h1 id="title-name">{this.props.channelname}</h1>
				</div>
				<div className="user-info">
					<span className="username">Welcome back, {username}!</span>
					<span className="material-symbols-outlined md-18" onClick={this.props.changeProfile}>person</span>
					<button id="sidebar-welcome-logout" onClick={this.props.logOutHandler}>Log Out</button>
				</div>				
				
		</div>
	}
}


class MainProfile extends React.Component {
	render() {
		return (
			<div className="profile">
				<div className="clip">
					<div className="auth container">
						<h2>Welcome to Belay!</h2>
						<div className="alignedForm">
							<label htmlFor="username">Username:</label>
							<input name="username" className="username" type="text" placeholder={this.props.username} />
							<button className="update-username" onClick={this.props.changeUserNameHandler}>Update</button>
							<label htmlFor="password">Password:</label>
							<input id="password" className="password" name="password" type="password" />
							<label htmlFor="repeatPassword">Repeat:</label>
							<input id="repeat_password" className="repeat_password" name="repeat_password" type="password" />
							<button className="update-password" onClick={this.props.changePasswordHandler}>Update</button>
							<button className="exit goToSplash" onClick={this.props.goSplashHandler}>Cool, let's go!</button>
							<button className="exit logout" onClick={this.props.logOutHandler}>Log out</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
}


class SignleMessage extends React.Component {
	render() {
		const message = this.props.message;
		const body = message.text;
		const url = body.match(/(https?:\/\/[^\s]+.(jpg|png|gif))/g);
		var img;
		var replies = message.replies;
		let reply
		if (url) {
			img = <img src={url} />;
		}
		if (!replies) {
			replies = 0;
		}
		if (replies > 0) {
			reply = <div className="replies"> <a id={message.mg_id} className="message-reply" onClick={this.props.showReplyHandler}> {replies} replies</a> </div>;
		}
		return (
			<div className="display-single-chat">
				<p className="message-author"> <strong>{message.username}</strong>: {body} </p>
				{img}
				{reply}
				<div className="reply-button">
					<button id={message.mg_id} className="chat-page-reply-btn" onClick={this.props.showReplyHandler}>reply</button>
				</div>
				<span> {message.post_time}</span>
			</div>
		);
	}
}


class Messages extends React.Component {
	render() {
		const messages = this.props.messages;
		return (
			<div className="messages">
				{messages.map((message) => (
					<SignleMessage message={message} showReplyHandler={this.props.showReplyHandler} />
				))}
			</div>
		);
	}
}


class ComposeMessage extends React.Component {
	render() {
		return (
			<div className="compose-chat">
				<div className="compose-chat-container">
					<div className="messages-header">
						<b>Messages</b>
					</div>
					<input type="text" id="compose-chat-input" placeholder="Compose a message..." />
					<button id="send-message-button" className="send-message-button" onClick={this.props.sendMessageHandler}>Send</button>
				</div>
			</div>
		);
	}
}


class WholeMainpage extends React.Component {
	render() {
		const messages = this.props.messages;
		const channelname = this.props.channelname;
		return (
			<div className="mainpage">
				<MainUpperBar channelname={channelname} changeProfileHandler={this.props.changeProfileHandler} logOutHandler={this.props.logOutHandler} />
				<Messages messages={messages} showReplyHandler={this.props.showReplyHandler} />
				<ComposeMessage sendMessageHandler={this.props.sendMessageHandler} />
			</div>
		);
	}
}


/* -------------------------------------Thread------------------------------------- */

class SingleReply extends React.Component {
	render() {
		return (
			<div className="display-single-reply">
				<p className="message-author"> <strong>{this.props.reply.author}</strong>: {this.props.reply.body} </p>
				<span> {this.props.reply.post_time}</span>
			</div>
		);
	}
}


class ComposeReply extends React.Component {
	render() {
		return (
			<div className="compose-reply">
				<div className="compose-reply-container">
					<div className="reply-header">
						<b>Replies</b>
					</div>
					<input ttype="text" id="compose-reply-input" placeholder="Compose a reply..." onChange={this.props.newReplyHandler} required />
					<button id="send-reply-button" className="send-reply-button" onClick={this.props.sendReplyHandler}>Send</button>
				</div>
			</div>
		);
	}
}


class WholeThreads extends React.Component {
	render() {
		const current_message = this.props.message;
		const replies = this.props.replies;
		
		return (
			<div id="thread">
				<div id="exit-thread" onClick={this.props.exitThreadHandler}> &#10006; </div>
					<h3 id="thread-title">{current_message.username}: {current_message.body}</h3>
				<div className="replies">
					{replies.map((reply) => (
						<SingleReply reply={reply} />
					))}
				</div>
				<ComposeChat newReplyHandler={this.props.composeChatHandler} sendReplyHandler={this.props.sendReplyHandler}/>
			</div>
		);
	}
}



/* -------------------------------------Channel------------------------------------- */

class WholePage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
            username: '',
            channels: [],
            channelname: '',
            message_count: 0,

            messages: [],
			message: '',
			
			password: '',
			repeat_password: '',
			api_key: '',
			
			messages: [],
			current_message: null,
			replies: [],
			threads: [],
			threads_messages: [],
			threads_replies: [],
		};
		this.newChannelHandler = this.newChannelHandler.bind(this);
        this.createChannelHandler = this.createChannelHandler.bind(this);
        this.cancleCreateHandler = this.cancleCreateHandler.bind(this);
        this.getChannelHandler = this.getChannelHandler.bind(this);
		this.sendMessageHandler = this.sendMessageHandler.bind(this);
		this.showReplyHandler = this.showReplyHandler.bind(this);
		this.exitThreadHandler = this.exitThreadHandler.bind(this);
		this.newReplyHandler = this.newReplyHandler.bind(this);
		this.sendReplyHandler = this.sendReplyHandler.bind(this);
		this.changeProfileHandler = this.changeProfileHandler.bind(this);
		this.changeUserNameHandler = this.changeUserNameHandler.bind(this);
		this.changePasswordHandler = this.changePasswordHandler.bind(this);
		this.goSplashHandler = this.goSplashHandler.bind(this);
		this.logOutHandler = this.logOutHandler.bind(this);
	}
}



class Belay extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isLogged: false,
			username: '',
			password: '',
			repeat_password: '',
			api_key: '',


			

			channelname: '',
			messages: [],
			current_message: null,
			replies: [],
			threads: [],
			threads_messages: [],
			threads_replies: [],
		};

		this.usernameHandler = this.usernameHandler.bind(this);
		this.passwordHandler = this.passwordHandler.bind(this);
		this.repeatPasswordHandler = this.repeatPasswordHandler.bind(this);
		this.signUpHandler = this.signUpHandler.bind(this);
		this.logInHandler = this.logInHandler.bind(this);
		this.toggleHandler = this.toggleHandler.bind(this);




		
		this.composeChatHandler = this.composeChatHandler.bind(this);
		this.showReplyHandler = this.showReplyHandler.bind(this);
		this.exitThreadHandler = this.exitThreadHandler.bind(this);
		this.composeReplyHandler = this.composeReplyHandler.bind(this);
		this.backToChannelHandler = this.backToChannelHandler.bind(this);
		this.logOutHandler = this.logOutHandler.bind(this);
	}
	render() {
		const loggedIn = this.state.loggedIn;
		let page;
		if (loggedIn) {
			page = <Mainpage messages={this.state.messages} channelname={this.state.channelname} logOutHandler={this.logOutHandler} backToChannelHandler={this.backToChannelHandler} composeChatHandler={this.composeChatHandler} showReplyHandler={this.showReplyHandler} />;
		} else {
			page = <Splash logInHandler={this.logInHandler} signUpHandler={this.signUpHandler} />;
		}
		return (
			<div className="belay">
				{page}
				<Replies replies={this.state.replies} message={this.state.current_message} exitThreadHandler={this.exitThreadHandler} composeReplyHandler={this.composeReplyHandler} />
			</div>
		);
	}
}