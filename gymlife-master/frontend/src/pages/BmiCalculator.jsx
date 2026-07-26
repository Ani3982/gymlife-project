import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const BmiCalculator = () => {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [bmi, setBmi] = useState(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (window.jQuery) {
      const $ = window.jQuery;
      $('.set-bg').each(function () {
        var bg = $(this).data('setbg');
        if (bg) {
          $(this).css('background-image', 'url(' + bg + ')');
        }
      });
    }
  }, []);

  const handleCalculate = (e) => {
    e.preventDefault();
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (h > 0 && w > 0) {
      const heightInMeters = h / 100;
      const bmiVal = w / (heightInMeters * heightInMeters);
      const bmiFormatted = bmiVal.toFixed(1);
      setBmi(bmiFormatted);
      
      let statusVal = '';
      if (bmiVal < 18.5) {
        statusVal = 'Underweight';
      } else if (bmiVal >= 18.5 && bmiVal < 25) {
        statusVal = 'Healthy';
      } else if (bmiVal >= 25 && bmiVal < 30) {
        statusVal = 'Overweight';
      } else {
        statusVal = 'Obese';
      }
      setStatus(statusVal);
    }
  };

  return (
    <>
      {/*  Breadcrumb Section Begin  */}
      <section className="breadcrumb-section set-bg" data-setbg="/img/breadcrumb-bg.jpg" style={{ backgroundImage: "url('/img/breadcrumb-bg.jpg')" }}>
          <div className="container">
              <div className="row">
                  <div className="col-lg-12 text-center">
                      <div className="breadcrumb-text">
                          <h2>BMI calculator</h2>
                          <div className="bt-option">
                              <Link to="/">Home</Link>
                              <a href="#">Pages</a>
                              <span>BMI calculator</span>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>
      {/*  Breadcrumb Section End  */}

      {/*  BMI Calculator Section Begin  */}
      <section className="bmi-calculator-section spad">
          <div className="container">
              <div className="row">
                  <div className="col-lg-6">
                      <div className="section-title chart-title">
                          <span>check your body</span>
                          <h2>BMI CALCULATOR CHART</h2>
                      </div>
                      <div className="chart-table">
                          <table>
                              <thead>
                                  <tr>
                                      <th>Bmi</th>
                                      <th>WEIGHT STATUS</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  <tr>
                                      <td className="point">Below 18.5</td>
                                      <td>Underweight</td>
                                  </tr>
                                  <tr>
                                      <td className="point">18.5 - 24.9</td>
                                      <td>Healthy</td>
                                  </tr>
                                  <tr>
                                      <td className="point">25.0 - 29.9</td>
                                      <td>Overweight</td>
                                  </tr>
                                  <tr>
                                      <td className="point">30.0 - and Above</td>
                                      <td>Obese</td>
                                  </tr>
                              </tbody>
                          </table>
                      </div>
                  </div>
                  <div className="col-lg-6">
                      <div className="section-title chart-calculate-title">
                          <span>check your body</span>
                          <h2>CALCULATE YOUR BMI</h2>
                      </div>
                      <div className="chart-calculate-form">
                          <p>Easily calculate your Body Mass Index (BMI) to determine your weight category and understand your body's fitness status.</p>
                          <form onSubmit={handleCalculate}>
                              <div className="row">
                                  <div className="col-sm-6 mb-3">
                                      <input 
                                          type="number" 
                                          placeholder="Height / cm" 
                                          value={height} 
                                          onChange={(e) => setHeight(e.target.value)} 
                                          required 
                                          min="50" 
                                          max="300" 
                                      />
                                  </div>
                                  <div className="col-sm-6 mb-3">
                                      <input 
                                          type="number" 
                                          placeholder="Weight / kg" 
                                          value={weight} 
                                          onChange={(e) => setWeight(e.target.value)} 
                                          required 
                                          min="10" 
                                          max="500" 
                                      />
                                  </div>
                                  <div className="col-sm-6 mb-3">
                                      <input 
                                          type="number" 
                                          placeholder="Age" 
                                          value={age} 
                                          onChange={(e) => setAge(e.target.value)} 
                                      />
                                  </div>
                                  <div className="col-sm-6 mb-3">
                                      <input 
                                          type="text" 
                                          placeholder="Sex" 
                                          value={sex} 
                                          onChange={(e) => setSex(e.target.value)} 
                                      />
                                  </div>
                                  <div className="col-lg-12">
                                      <button type="submit" style={{ cursor: 'pointer' }}>Calculate</button>
                                  </div>
                                  {bmi && (
                                      <div className="col-lg-12 mt-4 text-left text-white" style={{
                                          background: 'rgba(255, 255, 255, 0.05)',
                                          padding: '15px 20px',
                                          borderRadius: '5px',
                                          borderLeft: '4px solid #f36100',
                                          boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                                      }}>
                                          <h5 style={{ margin: 0, fontSize: '18px' }}>Your BMI is <strong style={{ color: '#f36100' }}>{bmi}</strong> (<span style={{ color: '#f36100', fontWeight: 'bold' }}>{status}</span>)</h5>
                                      </div>
                                  )}
                              </div>
                          </form>
                      </div>
                  </div>
              </div>
          </div>
      </section>
      {/*  BMI Calculator Section End  */}

    </>
  );
};

export default BmiCalculator;
