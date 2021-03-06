import React from "react";

import Chart from "react-apexcharts";
import { Typography, Grid} from "@material-ui/core";
import Styles from "./App.module.css";
import InputBase from "@material-ui/core/InputBase";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import axios from "axios";
import {TweetCard, Info} from './components';
import Icon from "@material-ui/core/Icon";
class App extends React.Component {
  state = {
    hashtagText: "",
    progressBar: false,
    submitted: false,
    hashtagDesc: "",
    tweets : [],
    series: [44, 55, 41],
    options: {
      chart:{
        background: '#1a1c1d'
      },
      legend:{
        color:"#a0a0a0"
      },
      colors: ["#46BFBD", "#F7464A",  "#FDB45C"],
      labels: ["Positive", "Negative", "Neutral"],
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
            },
          },
        },
      },
    },
  };

  // async componentDidUpdate() {
  //     var self = this;
  //     var positive = 0;
  //     var negative = 0;
  //     var neutral = 0;
  //     try {
  //       setInterval(async () => {
  //       axios.get('http://localhost:8000/analyzehashtag', {
  //           params: {
  //               text: this.state.hashtagText
  //           }
  //       }).then(function(response) {
  //         positive = response.data.positive;
  //         negative = response.data.negative;
  //         neutral = response.data.neutural;
  //         self.setState({ submitted: true });
  //         self.setState({ progressBar: false });
  //         self.setState({ series: [positive, negative, neutral] });
  //       });
  //           }, 3000);
  //       } catch(e) {
  //         console.log(e);
  //       }

  //   }

  clickHandler = () => {
    console.log("Sending GET Request....");
    console.log(this.state.hashtagText);
    var positive = 0;
    var negative = 0;
    var neutral = 0;

    this.setState({ progressBar: true });
    this.setState({ submitted: false });
    var self = this;
    try {
      axios
        .get("http://localhost:8000/analyzehashtag", {
          params: {
            text: this.state.hashtagText,
          },
        })
        .then(function (response) {
          console.log("Fetched Sentiment Analysis Data...");
          console.log(response.data);
          positive = response.data.positive;
          negative = response.data.negative;
          neutral = response.data.neutural;
          self.setState({ submitted: true });
          self.setState({ progressBar: false });
          self.setState({ series: [positive, negative, neutral] });
        });
    } catch (e) {
      console.log(e);
    }

    try {
      var url =
        "https://en.wikipedia.org/w/api.php?origin=*&action=opensearch&search=" +
        this.state.hashtagText  +
        "&limit=1&format=json";
      axios.get(url).then(function (response) {
        console.log("Wikipedia Replied");
        console.log(response.data);
        self.setState({ hashtag_desc: response.data[2][0] });
      });
    } catch (e) {
      console.log(e);
    }

    try {        
      setInterval(async () => {
      axios.get('http://localhost:8000/fetchTweets', {
          params: {
              text: this.state.hashtagText
          }
      }).then(function(response) {
          // console.log(response);
          console.log("Fetched Tweets...")
          self.setState({tweets: response.data.results});
      });
          }, 30000);
      } catch(e) {
        console.log(e);
      }

  };

  showLoadingBar = () => {
    if (this.state.progressBar) {
      return (
        <div className={Styles.loadingBar}>
          <img src={require("./loading.gif")} width="200" alt="loading-gif" />

          <Typography variant="h6" align="center" color="secondary">Please Wait..</ Typography>


        </ div>
      );
    }
  };

  showChart = () => {
    if (this.state.submitted === true) {
      return (
        <div className={Styles.Chart}>
          <Chart
            options={this.state.options}
            series={this.state.series}
            type="donut"
            width="420"
          />
          <h1 className="heading_desc">{this.state.hashtag_desc}</h1>
        </div>
      );
    }
  };

  textHandler = (event) => {
    this.setState({ hashtagText: event.target.value });
  };

  keyPress = (event) => {
    if ((event.keyCode) === 13) {
      event.preventDefault()
      console.log('Enter Key Pressed....');
      this.clickHandler();
    }
  };

  render() {


      
    var renderTweets = this.state.tweets.map(function(item, i){
          return (
            <Grid item xs={12} md={6} >
            <TweetCard data={{item, i}} />
            </Grid> 
            );
        })




    return (
      <div className={Styles.container}>
        <Typography variant="h2" color="secondary" align="center" className={Styles.title}>
          SENTIMENT ANALYST
        </Typography>
        <Paper
          className={Styles.searchBar}
          component="form"
          rounded="true"
          elevation={7}
          style={{
            padding: "2px 4px",
            display: "flex",
            alignItems: "center",
            width: "75%",
            borderRadius: 30,
          }}
        >
          <Icon className={"fas fa-hashtag"} style={{marginLeft:"10px"}} color='secondary' />
          <InputBase
            style={{ marginLeft: 10, flex: 1 }}
            placeholder="Search"
            inputProps={{ "aria-label": "search" }}
            onChange={this.textHandler}
            onKeyDown={this.keyPress}
          />
        </Paper>
        <Button
          className={Styles.analyseButton}
          variant="outlined"
          color="secondary"
          onClick={this.clickHandler}
        >
          Analyze
        </ Button>
        {this.showChart()}
        <Grid container spacing={3} style={{paddingLeft:"10px", paddingRight:"10px"}}>
        {this.state.submitted?renderTweets:<br />}
        </Grid>
        {this.showLoadingBar()}
        <Info className={Styles.Info}/>
        
        <div className={Styles.footerDiv}>
            <Typography className={Styles.credit} variant="caption" align="center" color="textSecondary">
                Designed and Developed by Arun Pandian R.
            </Typography>
        </div>
      </div>
    );
  }
}

export default App;
