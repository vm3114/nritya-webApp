import React, { useState,useEffect,useRef  } from "react";
import { Container, Row, Col, Card, Button, Carousel, ButtonGroup,Image } from "react-bootstrap";
import Dance1 from "../Components/DanceImg/nritya- banner.png";
import Dance2 from "../Components/DanceImg/nritya- banner-2.png";
import Dance3 from "../Components/DanceImg/nritya- banner-3.png";
import { Grid, Card as MUICard, CardContent, Typography, Skeleton } from '@mui/material';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { db } from '../config';
import { doc, getDoc,setDoc,addDoc,updateDoc,collection,where,getDocs,query,limit } from "firebase/firestore";
import { COLLECTIONS } from '../constants';
import StudioCard from "../Components/StudioCard";
import { faBolt, faMusic, faHiking, faTrophy, faGlassCheers,faClock } from "@fortawesome/free-solid-svg-icons"; // Import specific icons from Font Awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import StudioCardIcon from "../Components/StudioCardIcon";
import './LandingPage.css'
import MapsInput from "../Components/MapsInput";
import { useSelector, useDispatch } from 'react-redux';
import { selectDarkModeStatus } from '../redux/selectors/darkModeSelector'; 
import CardSlider from "../Components/CardSlider";
import ResponsiveText from "../Components/ResponsiveText";
import { FaSearch } from 'react-icons/fa';
import LocationComponent from "../Components/LocationComponent";
import { useNavigate } from 'react-router-dom';
import DanceCarousel from "../Components/DanceCarousel";
import { getAllImagesInFolder } from "../utils/firebaseUtils";

// Define the array of dance forms with their names and corresponding icons
const danceForms = [
  { name: "Bollywood", icon: faMusic },
  { name: "Bharatnatyam", icon: faMusic },
  { name: "Odisi", icon: faGlassCheers },
  { name: "Kathak", icon: faBolt },
  { name: "Salsa", icon: faGlassCheers },
  { name: "Hip Hop", icon: faBolt },
  { name: "Ballet", icon: faHiking },
  { name: "Jazz", icon: faHiking },
  { name: "Tango", icon: faHiking },
  { name: "Tap Dance", icon: faHiking },
];
const FILTER_DISTANCES_KEY = 'filterDistances';
const FILTER_DANCE_FORMS_KEY = 'filterDanceForms';
const danceImages = [Dance1, Dance2,Dance3,Dance1];


function LandingPage() {
  const [exploreCards, setExploreCards] = useState([])
  const [recentlyWatchedStudios, setRecentlyWatchedStudios] = useState([]);
  const [danceImagesUrl,setDanceImagesUrl] = useState([])
  const isDarkModeOn = useSelector(selectDarkModeStatus);
  const navigate = useNavigate(); 

  const handleCardClick = (danceName) => {
    localStorage.removeItem(FILTER_DISTANCES_KEY);
    localStorage.setItem(FILTER_DANCE_FORMS_KEY, danceName);
    if(localStorage.getItem(FILTER_DANCE_FORMS_KEY)==danceName){
      console.log("API LandingPage done",danceName)
    }
    setTimeout(() => {
      navigate('/search/studios');
    }, 100); 
  };


  const fetchRecentlyWatchedStudios = async (userId) => {
    try {
      const userRef = doc(db, COLLECTIONS.USER, userId);
      const userDoc = await getDoc(userRef);
      const recentlyWatchedMap = userDoc.exists() ? userDoc.data().recentlyWatched : {};
  
      const studioIds = Object.values(recentlyWatchedMap);
      //console.log("got",studioIds)
      const studioDataPromises = studioIds.map(async (studioId) => {
        //console.log(studioId)
        if (!studioId) {
          console.warn("Invalid studioId:", studioId);
          return null;
        }
        console.log("studioId", studioId);
        const studioRef = doc(db, COLLECTIONS.STUDIO, studioId);
        const studioDoc = await getDoc(studioRef);
        if (studioDoc.exists()) {
          //console.log(studioDoc.data())
          return { id: studioId, ...studioDoc.data() };
        } else {
          console.warn(`Studio document not found for ID: ${studioId}`);
          return null;
        }
      });
  
      const studioData = await Promise.all(studioDataPromises);
      const validStudioData = studioData.filter((studio) => studio !== null);

      setRecentlyWatchedStudios(validStudioData);
    } catch (error) {
      console.error("Error fetching recently watched studios:", error);
    }
  };


  const cardStyle = {
    background: isDarkModeOn ? '#333333' : 'white',
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    borderRadius: "10px",
    cursor: 'pointer' ,
  };

  useEffect(() => {
    const getStudios = async () => {
      const studioRef = collection(db, COLLECTIONS.STUDIO);
      const q = query(studioRef, limit(15));
      const querySnapshot = await getDocs(q);
      const exploreStudioList = querySnapshot.docs.filter(doc => doc.data().studioName).map(doc => 
        { const data = doc.data();
          return {
            id: doc.id, // Include the document ID in the data
            ...data
          };
      });
      setExploreCards(exploreStudioList)
      console.log(exploreCards)
      if (JSON.parse(localStorage.getItem('userInfo')) && JSON.parse(localStorage.getItem('userInfo')).UserId) {
        const userId = JSON.parse(localStorage.getItem('userInfo')).UserId;
        fetchRecentlyWatchedStudios(userId);
      }
      

    }

    getStudios();
  }, []);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const dataImagesUrlLocal = await getAllImagesInFolder('LandingPageImages');
        console.log('dataImagesUrlLocal:', dataImagesUrlLocal); // Debugging log
        if (Array.isArray(dataImagesUrlLocal)) {
          const imageUrlsArray = dataImagesUrlLocal.map(image => image.fileURL);
          setDanceImagesUrl(imageUrlsArray);
        } else {
          console.error('Expected an array but got:', dataImagesUrlLocal);
        }
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };

    fetchImages();
  }, []);

  return (
    <div  >
      <Container className="my-0">
      <Row>
        {danceImagesUrl.length > 0 ? (
          <DanceCarousel danceImages={danceImagesUrl} />
        ) : (
          
                <Skeleton sx={{width:"100%",height:"40vh", bgcolor: isDarkModeOn?"#202020":"gray" }}  variant="rectangular"animation="wave" />
             
        )}

      </Row>

        <br />
        <Row>
          {recentlyWatchedStudios.length > 0 && <h3 style={{color: isDarkModeOn ? 'white' : 'black'}}> <FontAwesomeIcon icon={faClock} size="1x" /> Recently Viewed</h3>}
          {recentlyWatchedStudios.length>0?(<CardSlider dataList={recentlyWatchedStudios} imgOnly={false}/>):""}
        </Row>
          <LocationComponent/>


        <br/>
        <h3 style={{color: isDarkModeOn ? 'white' : 'black'}} >Explore Studios</h3>
        <Row>
            <CardSlider dataList={exploreCards} imgOnly={false}/>
        </Row>
        <br/>
        <h3 style={{color: isDarkModeOn ? 'white' : 'black'}} >BROWSE BY DANCE FORMS</h3>
        <Row >
          {danceForms.map((danceForm, index) => (
            <Col key={index} sm={6} md={4} lg={3}>
              <Card className="card-hover"style={cardStyle} onClick={() => handleCardClick(danceForm.name)}>
                <Card.Body style={{textAlign:"center"}}>
                  <h4 style={{color: isDarkModeOn ? 'white' : 'black'}}>{danceForm.name}</h4>
                </Card.Body>
              </Card>
              <br></br>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
}

export default LandingPage;
