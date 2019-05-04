import React from "react";
import { Redirect } from "react-router-dom";
import chat from "../lib/chat";

class DirectMessage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      receiverID: "",
      messageText: null,
      privateMessage: [],
      user: {},
      isAuthenticated: true
    };

    // this.GUID = config.GUID;
  }

  sendMessage = () => {
    const {
      match: { params }
    } = this.props;
    chat.sendPrivateMessage(params.uid, this.state.messageText).then(
      message => {
        console.log("Message sent successfully:", message);

        // once the massage is sent, it should also be added to the private messages array so it can be displayed on the screen
        this.setState(prevState => ({
          messageText: null,
          privateMessage: [...prevState.privateMessage, message]
        }));
      },
      error => {
        if (error.code === "ERR_NOT_A_MEMBER") {
          // chat.joinGroup(this.GUID).then(response => {
          //   this.sendMessage();
          // })
          console.log(error);
        }
      }
    );
  };

  scrollToBottom = () => {
    const chat = document.getElementById("chatList");
    chat.scrollTop = chat.scrollHeight;
  };

  handleSubmit = event => {
    event.preventDefault();
    this.sendMessage();
    event.target.reset();
  };

  handleChange = event => {
    this.setState({ messageText: event.target.value });
  };

  getUser = () => {
    chat
      .getLoggedinUser()
      .then(user => {
        console.log("user details:", { user });
        this.setState({ user });
      })
      .catch(({ error }) => {
        if (error.code === "USER_NOT_LOGED_IN") {
          this.setState({
            isAuthenticated: false
          });
        }
      });
  };

  messageListener = () => {
    chat.addPrivateMessageListener((data, error) => {
      if (error) return console.log(`error: ${error}`);
      this.setState(
        prevState => ({
          privateMessage: [...prevState.privateMessage, data]
        }),
        () => {
          this.scrollToBottom();
        }
      );
    });
  };

  componentDidMount() {
    this.getUser();
    this.messageListener();
    // chat.joinGroup(this.GUID)
  }

  render() {
    const { isAuthenticated } = this.state;
    if (!isAuthenticated) {
      return <Redirect to="/" />;
    }
    return (
      <div className="chatWindow">
        <ul className="chat" id="chatList">
          {this.state.privateMessage.map(data => (
            <div key={data.id}>
              {this.state.user.uid === data.sender.uid ? (
                <li className="self">
                  <div className="msg">
                    <p>me</p>
                    <div className="message"> {data.data.text} </div>
                  </div>
                </li>
              ) : (
                <li className="other">
                  <div className="msg">
                    <p> {data.sender.uid}</p>
                    <div className="message"> {data.data.text} </div>
                  </div>
                </li>
              )}
            </div>
          ))}
        </ul>
        <div className="chatInputWrapper">
          <form onSubmit={this.handleSubmit}>
            <input
              className="textarea input"
              type="text"
              placeholder="Enter your message..."
              onChange={this.handleChange}
            />
          </form>
        </div>
      </div>
    );
  }
}

export default DirectMessage;
