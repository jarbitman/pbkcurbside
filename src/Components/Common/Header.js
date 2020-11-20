import React from 'react';
import Row from 'react-bootstrap/Row';

export default function Header(props) {
  return(
    <Row style={{padding:"1em", backgroundColor:'#f7f7f7'}}>
      <img src={'pbklogo.svg'} alt={'Protein Bar & Kitchen'} style={{width:'300px',height:'50px'}} />
    </Row>
  );
}