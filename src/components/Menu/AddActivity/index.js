import React, { Component } from 'react'
import {
  View,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  CameraRoll,
  Platform,
  TouchableHighlight
} from 'react-native'
import { Actions } from 'react-native-router-flux'
import fuzzy  from 'fuzzy'
import {
  Container,
  Icon,
  Header,
  Title,
  Content,
  Button,
  Footer,
  FooterTab,
  Body,
  Left,
  Right,
  Fab,
  Drawer,
  List,
  Badge,
  ListItem,
  Grid,
  Row,
  Column,
  Spinner,
  Card,
  CardItem,
  Item,
  Input,
  Thumbnail,
  CheckBox,
  Form,
  Label,
  Text
} from "native-base"
import { LinearGradient } from 'expo'

import { socket } from '../../../services/socket'
import { activityService } from '../../../services/Activity.service'
import { childrenService } from '../../../services/Children.service'
import { tagService } from '../../../services/Tag.service'
import Modal from 'react-native-modal'

import { ImagePicker } from 'expo'


class AddActivity extends Component {

  //IMAGEN HARDCODEADA DEBE SUBIRSE CORRECTAMENTE

  constructor(props)
  {
    super(props);
    this.state ={ 
      newActivity: {
        name: '',
        description: '',
        createdBy_id : this.props.text.user.id,
        course_id: this.props.text.selectedCourse,
        urlPhoto: false,
        activityType: this.props.text.activityType
      },
      taggedPeople: [],
      loading: false,
      isModalVisible: false,
      showToTag: false,
      coursePeople: [],
      showedUsers: [],
      toFind: '',
      reload: true,
      data: []
    }

    this._publishActivity = this._publishActivity.bind(this);
    this._explore = this._explore.bind(this);
    this._openCamera = this._openCamera.bind(this);
    this._tag = this._tag.bind(this)
  }


  componentDidMount()
  {
    childrenService.getParentsCourse( this.props.text.selectedCourse, this.props.text.token ).then( ( response ) => {
      let infoArray = response.data.parentsArray


      for( let i in infoArray )
      {
        infoArray[i].isTagged = false
      }

      this.changeCoursePeople( infoArray )
      this.changeShowedUsers( infoArray )
    }).catch( ( error ) => {
      console.log( error )
    })


    this.setState( previousState => {
      previousState.data = [
      {key: require('./img/photo-camera.png'), func: this._openCamera},
      {key: require('./img/picture.png'), func: this._explore},
      {key: require('./img/Feeling.png')},
      {key: require('./img/user.png'), func:this._tag}
      ]

      return previousState
    })
  }


  changeCoursePeople( coursePeople )
  {
    this.setState( previousState => {
      previousState.coursePeople = coursePeople
      return previousState
    })
  }

  changeShowedUsers( showedUsers )
  {
    this.setState( previousState => {
      previousState.showedUsers = showedUsers
      return previousState
    })
  }




  showTagContent( state )
  {
    this.setState( previousState => {
      previousState.showToTag = state
      return previousState
    })
  }

  _tag()
  {
    console.log("Aqui va la logica para etiquetar")
    this.showTagContent( true )
    this.changeModal( true )
  }

  async _explore()
  {
    console.log("Aqui va la logica para abrir el rollo ")
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
    });

    console.log(result);

    if (!result.cancelled) 
    {
      this.setState( previousState => {
        previousState.newActivity.urlPhoto = result.uri
        return previousState
      });
    }

  }


  async _openCamera()
  {
    console.log("Aqui debe ir la logica para abrir la camara (Dependera si es Android o IOS)")

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
    });

    console.log(result);

    if (!result.cancelled) 
    {
      this.setState( previousState => {
        previousState.newActivity.urlPhoto = result.uri
        return previousState
      });
    }


  }




   _publishActivity()
  {

    if( this.state.newActivity.name === '' || this.state.newActivity.description === '' )
    {
      this.showTagContent( false )
      this.changeModal( true )
    }
    else
    {

      this.changeLoading( true )


       activityService.store( this.state.newActivity ).then( ( response ) => {
        console.log( response.data )
        let activityId = response.data.id

        console.log("MOSTRANDO LAS PERSONAS A GUARDAR COMO ETIQUETADAS EN LA PUBLICACION")
        console.log("ID DE LA ACTIVIDAD: "+ activityId)
        for( let tagged of this.state.taggedPeople )
        {
          let newTag = { activity_id: activityId, tagged_id: tagged.id }
          
          tagService.store( newTag ).then( ( response ) => {
            console.log(response)
          }).catch( ( error ) => {
            console.log( error )
          })


        }


        socket.emit('activityAdded', JSON.stringify( this.state.newActivity ))
        this.changeLoading( false )
        Actions.pop()
        
        
      }).catch( ( error ) => {
        console.log( error )
        this.changeLoading( false )
      })      
    }
  }


  changeModal( state )
  {
    this.setState( previousState => {
      previousState.isModalVisible = state
      return previousState
    })
  }



  changeLoading( state )
  {
    this.setState( previousState => {
      previousState.loading = state
      return previousState
    })
  }

  changeName( name )
  {
    this.setState( previousState => {
      previousState.newActivity.name = name
      return previousState 
    })
  }


  changeDescription( description )
  {
    this.setState( previousState => {
      previousState.newActivity.description = description
      return previousState
    })
  }

  changeReload( state )
  {
    this.setState( previousState => {
      previousState.reload = state
      return previousState
    })
  }

  async tagSomeOne( someone )
  {


    if( someone.isTagged )
    {
      await this.setState( previousState => {

        for( let i in previousState.taggedPeople )
        {
          if( previousState.taggedPeople[i] === someone)
          {
            previousState.taggedPeople.splice( i, 1 )
            break
          }
        }

        for( let i in previousState.coursePeople )
        {
          if( previousState.coursePeople[i] === someone )
          {
            previousState.coursePeople[i].isTagged = false
            break
          }
        }

        console.log("STATE.TAGGEDPEOPLE:")
        console.log(previousState.taggedPeople)

        console.log("STATE.COURSEPEOPLE:")
        console.log(previousState.coursePeople)
        previousState.showedUsers = previousState.coursePeople

        return previousState
      })
    }
    else
    {

      console.log("AGREGANDO TAG ################################################################################")

      await this.setState( previousState => {
        for( let i in previousState.coursePeople )
        {
          if( previousState.coursePeople[i] === someone )
          {
            previousState.coursePeople[i].isTagged = true
            previousState.taggedPeople.push(previousState.coursePeople[i])
            break
          }
        }
        
        console.log("STATE.TAGGEDPEOPLE:")
        console.log(previousState.taggedPeople)
        console.log("STATE.COURSEPEOPLE:")
        console.log(previousState.coursePeople)
        previousState.showedUsers = previousState.coursePeople   



        return previousState
      })

    }

        this.changeReload( false )

        this.changeReload( true )
  }


  filterData( email )
  {
    email = email.toLowerCase()
    console.log( email )


    this.setState( previousState => {
      previousState.toFind = email
      return previousState
    })


    if(email === '')
    {
      this.setState( previousState => {
        previousState.showedUsers = previousState.coursePeople
        return previousState
      })
    }
    else
    {


      this.setState( previousState => {
      let options = { extract: function(el) { return el.name } }
      let results = fuzzy.filter( email, this.state.coursePeople, options)
      let matches = results.map(function(el) { return el.original; })



        previousState.showedUsers = matches
        return previousState

      }) 
    }
  }


  getCardItem( friend )
  {
      return (
      <TouchableHighlight onPress={() => this.tagSomeOne( friend ) }>
              <CardItem>
                <Left>
                  <Thumbnail source={{uri: friend.picture }} />
                  <Text> { friend.name } </Text>
                </Left>

                <Right>
                  <CheckBox color='#fd6342' checked={ friend.isTagged } onPress={ () => this.tagSomeOne( friend ) } />
                </Right>
              </CardItem>
      </TouchableHighlight>

        )        
  }




  renderToTagContent()
  {
    return(
      <Container style={{ flex: 0.75, borderRadius: 40 }}>
        <Content contentContainerStyle={{ borderRadius: 3, backgroundColor: 'transparent', flex: 0.7}}>

            <Item style={{ backgroundColor: 'white' }}>
              <Input 
              style={{ backgroundColor: 'white' }}
              placeholder="Buscar por nombre..." 
              value={this.state.toFind}
              onChangeText={ ( name ) => this.filterData( name ) } />
              <Icon name="ios-people" style={{ backgroundColor: 'white' }}/>
            </Item>

          <Card >

            { this.state.reload ?  this._renderFlatList() : null }

          </Card>
        </Content>
      </Container>
      )
  }

  _renderFlatList()
  {
    return(    
      <FlatList 
          data={ this.state.showedUsers } 
          renderItem={ ( { item } ) => this.getCardItem( item ) } />
          )
  }


  renderErrorContent()
  {
    return(










                    <Container style={{ flex: 0.3, borderRadius: 40 }}>

                    <LinearGradient colors={['#fd7292', '#fd6342']} style={{ height: 30}}>
                      <Header style={{ backgroundColor: 'transparent' }}>

                        <Left>
                        </Left>

                        <Body>
                          <Title style={{ color: 'white' }}> Error </Title>
                        </Body>

                        <Right>
                        </Right>
                      </Header>
                    </LinearGradient>

                      <Content contentContainerStyle={{ borderRadius: 3, backgroundColor: 'white', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Text>
                          ¡ Recuerda rellenar todos los campos necesarios !
                        </Text>

                          <TouchableOpacity style={[styles.touchable, { width: '80%', height: 40, paddingTop: 10}]} onPress={() => this.setState({ isModalVisible: false })}>
                            <LinearGradient colors={['#fd7292', '#fd6342']} style={styles.gradient} >
                              <Text style={styles.buttonText} >
                                 Cerrar
                              </Text>
                            </LinearGradient>
                          </TouchableOpacity>

                      </Content>
                    </Container>

      )
  }


  _renderTaggedPeopleList()
  {
    return(
      <FlatList 
       data={ this.state.taggedPeople } 
       renderItem={ ( { item } ) => <Thumbnail source={{uri: item.picture }} />} /> 

      )
  }


  _renderOption( item )
  {
    return(
           <TouchableOpacity onPress={item.func} style={styles.containerIcon}>
              <Image source={item.key} />
            </TouchableOpacity>
             )
  }


  _renderActivityImage()
  {
    console.log("DIRECCION DE LA IMAGEN DE LA ACTIVIDAD")
    console.log( this.state.newActivity.urlPhoto )
      return(
        <Row style={{ height: 150 }}>
          <Image source={{ uri: this.state.newActivity.urlPhoto }} style={{ marginTop: 10, resizeMode: 'contain', height: '100%', width: '100%', justifyContent: 'center' }} />      
        </Row>
      )

  }

  renderContent()
  {
    if( this.state.loading )
    {
      return (
          <Content style={{ backgroundColor: 'white'}} >
            <Spinner color='#fd6342' />
          </Content>
        )
    }
    else
    {
      return( 

          <Content style={{ backgroundColor: 'white'}} >

          <Grid>
            <Row >
              <Image source={require('./img/activityDescription.png')} style={{ resizeMode: 'contain', marginLeft: 10, marginTop: 10}} />
            </Row>

            { this.state.newActivity.urlPhoto ? this._renderActivityImage() : null }

          </Grid>

          

                <Form style={{ marginTop: 5}} >
                  <Item floatingLabel >
                    <Label>
                      <Icon name='md-create' style={ styles.iconInput } />
                      Mi actividad
                    </Label>
                    <Input onChangeText={ ( value ) => this.changeName( value ) } value={this.state.newActivity.name}/>
                  </Item>

                  <Item floatingLabel >
                    <Label>
                      <Icon name='ios-text' style={ styles.iconInput } />
                      Mi descripción
                    </Label>
                    <Input onChangeText={ ( value ) => this.changeDescription( value ) } value={this.state.newActivity.description}/>
                  </Item>
                </Form>


            
              


            <Grid>

              <Row style={{ marginTop: 15 }} >
                  <Text> Etiquetas: </Text>
                  { this.state.reload ? this._renderTaggedPeopleList() : null }
              </Row>

              <Row style={{ marginTop: 15 }}>
                <FlatList contentContainerStyle={styles.listContainer} data={ this.state.data }
                      renderItem={({item}) => this._renderOption( item ) }/>
              </Row>

              
            </Grid>  



                <TouchableOpacity style={styles.touchable} onPress={this._publishActivity}>
                  <LinearGradient colors={['#fd7292', '#fd6342']} style={styles.gradient} >
                    <Text style={styles.buttonText} >
                      Publicar
                    </Text>
                  </LinearGradient>
                </TouchableOpacity> 

            <View>
              <Modal 
              isVisible={ this.state.isModalVisible }
              onBackdropPress={() => this.setState({ isModalVisible: false })}>
              { this.state.showToTag ? this.renderToTagContent() : this.renderErrorContent() }
              </Modal>
            </View>

          </Content>



        )
    }
  }


  render () 
  {
    return(

        <Container style={{ backgroundColor: 'white'}} >
            <LinearGradient colors={['#fd7292', '#fd6342']} >
              <Header style={{ backgroundColor: 'transparent' }}>

                <Left>
                  <Button transparent onPress={() => Actions.pop() } >
                    <Icon style= {{ color: "white" }} name="arrow-back" />
                  </Button>
                </Left>

                <Body>
                  <Title style={{ color: 'white' }}> { this.props.text.activityType } </Title>
                </Body>

                <Right />
                
              </Header>
            </LinearGradient>


            { this.renderContent() }



        </Container>
    )
  }
}


const styles = StyleSheet.create({
  tag: 
  {
    marginLeft: 10,
  },
  containerTags: 
  {
    flexDirection: 'row',
  },
  container:
  {
    marginTop: 20,
    padding: 20,
    backgroundColor: 'white',
    flex: 1
  },
  separator:
  {
    marginTop:10,
    marginBottom: 10,
  },
  button:
  {
    marginTop: 10,
    alignItems: 'center',
  },
  listContainer:
  {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  containerIcon:
  {
    alignItems: 'center',
  },
  textInput: 
  {
    marginTop:20,
    fontSize: 15,
    height: 80,
    color: '#35405260',
    borderColor: 'gray',
  },
  touchable: 
  {
    marginTop: 20,
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 5,
    height: 50
  },
  gradient: {
    flex: 1,
    padding: 5,
    borderRadius: 5,
    ...Platform.select({
      ios: { zIndex: 2 },
      android: { elevation: 2 }
    }),
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    fontSize: 20
  },
  iconInput:
  { 
    fontSize: 20, 
    color: 'grey', 
    marginRight: 50 
  }
})


export default AddActivity;
