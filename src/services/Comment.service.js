import { base } from './base'
import { socket } from './socket'
import axios from 'axios'



class CommentService {

	index ( token )
	{

		let headers = { 'Authorization' : 'Bearer '+token }

		let http = axios.create({ baseURL: base.api,  headers: headers	})

		return http.get('comments')


	}

	show ( id, token )
	{
		let headers = { 'Authorization' : 'Bearer '+token }

		let http = axios.create({ baseURL: base.api,  headers: headers	})

		return http.get('comments/'+id)


	}

	update ( id, comment, token )
	{

		let headers = { 'Accept' : 'application/json', 'Content-Type' : 'application/json', 'Authorization' : 'Bearer '+token }

		let http = axios.create({ baseURL: base.api,  headers: headers	})

		return http.put('comments/'+id, comment)


	}

	destroy ( id, token )
	{
		let headers = { 'Authorization' : 'Bearer '+token }

		let http = axios.create({ baseURL: base.api,  headers: headers	})


		return http.delete('comments/'+id)


	}




	store( comment )
	{

		let headers = { 'Accept' : 'application/json', 'Content-Type' : 'application/json' }

		let http = axios.create({ baseURL: base.api,  headers: headers	})

		comment.access_token = 'rpDYa3XOEkAtYk67v5lDYprLz8cdbguP'

		return http.post( 'comments', JSON.stringify( comment ) )
	}

	

  getCommentsFromActivity ( id, token )
  {
    let headers = { 'Authorization' : 'Bearer '+token }

    let http = axios.create({ baseURL: base.api,  headers: headers	})

    return http.get('comments/getactivitycomments/'+id)


  }
}


export const commentService = new CommentService();
