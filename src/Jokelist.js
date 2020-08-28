import React , {Component} from 'react'
import "./JokeList.css"
import axios from 'axios'
import Joke from './Joke'
import uuid from 'uuid/v4'


class Jokelist extends Component{
	static defaultProps = {
		numOfJokes:10
	}

	constructor(props){
		super(props)
		this.state = {
			jokes : JSON.parse(window.localStorage.getItem("jokes") || "[]" ),
			isLoading: false
		}
		this.seenJokes = new Set(this.state.jokes.map(joke => joke.text))
		this.handleVotes = this.handleVotes.bind(this)
		this.handleClick = this.handleClick.bind(this)
	}
	
	 componentDidMount(){
		if(this.state.jokes.length === 0){
			this.getJokes()
		}
		 
	}

    handleClick(){
		this.setState({isLoading:true})
		this.getJokes()
	}

    async getJokes(){
		try{
			let jokes = []
			while(jokes.length < this.props.numOfJokes){
					  let res = await axios.get("https://icanhazdadjoke.com/" , {
					headers: {Accept : "application/json"}
				})
				let newJoke = res.data.joke
				if(!this.seenJokes.has(newJoke)){
					jokes.push({jokes: newJoke ,  votes:0 , id: uuid()})
				}

			}

			await this.setState(st => ({
				jokes : [...st.jokes , ...jokes]
			}))

			await window.localStorage.setItem(
				"jokes" , JSON.stringify(this.state.jokes)
			)

			this.setState({isLoading : false})
		} catch(err){
			alert(err)
			this.setState({isLoading : false})
		}
		
	}

    async handleVotes(id , delta){
		await this.setState(st => {
			return{
				jokes : st.jokes.map(joke => 
				joke.id === id ? {...joke , votes: joke.votes + delta} : joke)
			}
		})
		
		window.localStorage.setItem(
			"jokes" , JSON.stringify(this.state.jokes)
		)
	}

    
	
	render(){
		let jokes = this.state.jokes.sort((a,b) => b.votes - a.votes);
		if(this.state.isLoading){
			return(
				<div className = "JokeList-spinner" >
					<i className = "far fa-8x fa-laugh fa-spin" />
					<h1 className = "JokeList-title">Loading Jokes...</h1>
				</div>
			)
		}
		else{
			return(
			<div className = "JokeList">
			<div className = "JokeList-sidebar">
				<h1 className = "JokeList-title"><span>DaD</span> Jokes</h1>
				<img src='https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg' />
			  <button className='JokeList-getmore' onClick={this.handleClick}>
				Fetch Jokes
			  </button>
			</div>
				
				<div className = "JokeList-jokes">
						{jokes.map(joke => (
						<Joke
							jokes = {joke.jokes} 
							votes = {joke.votes} 
							id = {joke.id}  
							key = {joke.id}
							upVote = {this.handleVotes}
							downVote = {this.handleVotes}
						/>
					))}
				</div>
			</div>
		)
		}
		
	}
}

export default Jokelist;






