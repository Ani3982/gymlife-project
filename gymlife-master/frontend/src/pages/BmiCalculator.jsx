import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const BmiCalculator = () => {
  const { t } = useLanguage();
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('Male');
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
        statusVal = t('underweight', 'Underweight');
      } else if (bmiVal >= 18.5 && bmiVal < 25) {
        statusVal = t('normal_weight', 'Normal / Healthy Weight');
      } else if (bmiVal >= 25 && bmiVal < 30) {
        statusVal = t('overweight', 'Overweight');
      } else {
        statusVal = t('obese', 'Obese');
      }
      setStatus(statusVal);
    }
  };

  return (
    <>
      {/* Breadcrumb Section Begin */}
      <section className="breadcrumb-section set-bg" data-setbg="/img/breadcrumb-bg.jpg" style={{ backgroundImage: "url('/img/breadcrumb-bg.jpg')" }}>
          <div className="container">
              <div className="row">
                  <div className="col-lg-12 text-center">
                      <div className="breadcrumb-text">
                          <h2>{t('bmi_calculator', 'BMI Calculator')}</h2>
                          <div className="bt-option">
                              <Link to="/">{t('home', 'Home')}</Link>
                              <span>{t('bmi_calculator', 'BMI Calculator')}</span>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>
      {/* Breadcrumb Section End */}

      {/* BMI Calculator Section Begin */}
      <section className="bmi-calculator-section spad">
          <div className="container">
              <div className="row">
                  <div className="col-lg-6">
                      <div className="section-title chart-title">
                          <span>{t('bmi_sub', 'CHECK YOUR HEALTH SCORE')}</span>
                          <h2>{t('bmi_title', 'BMI CALCULATOR CHART')}</h2>
                      </div>
                      <div className="chart-table">
                          <table>
                              <thead>
                                  <tr>
                                      <th>BMI</th>
                                      <th>{t('weight', 'Weight Status')}</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  <tr>
                                      <td className="point">Below 18.5</td>
                                      <td>{t('underweight', 'Underweight')}</td>
                                  </tr>
                                  <tr>
                                      <td className="point">18.5 - 24.9</td>
                                      <td>{t('normal_weight', 'Normal Weight')}</td>
                                  </tr>
                                  <tr>
                                      <td className="point">25.0 - 29.9</td>
                                      <td>{t('overweight', 'Overweight')}</td>
                                  </tr>
                                  <tr>
                                      <td className="point">30.0 and Above</td>
                                      <td>{t('obese', 'Obese')}</td>
                                  </tr>
                              </tbody>
                          </table>
                      </div>
                  </div>
                  <div className="col-lg-6">
                      <div className="section-title chart-calculate-title">
                          <span>{t('bmi_sub', 'CHECK YOUR HEALTH SCORE')}</span>
                          <h2>{t('bmi_title', 'CALCULATE YOUR BMI')}</h2>
                      </div>
                      <div className="chart-calculate-form">
                          <p>{t('bmi_desc', 'Easily calculate your Body Mass Index to understand your fitness level and ideal target weight.')}</p>
                          <form onSubmit={handleCalculate}>
                              <div className="row">
                                  <div className="col-sm-6">
                                      <input 
                                          type="number" 
                                          placeholder={t('height', 'Height / cm')} 
                                          value={height}
                                          onChange={(e) => setHeight(e.target.value)}
                                          required 
                                      />
                                  </div>
                                  <div className="col-sm-6">
                                      <input 
                                          type="number" 
                                          placeholder={t('weight', 'Weight / kg')} 
                                          value={weight}
                                          onChange={(e) => setWeight(e.target.value)}
                                          required 
                                      />
                                  </div>
                                  <div className="col-sm-6">
                                      <input 
                                          type="number" 
                                          placeholder={t('age', 'Age')} 
                                          value={age}
                                          onChange={(e) => setAge(e.target.value)}
                                      />
                                  </div>
                                  <div className="col-sm-6">
                                      <select 
                                          value={sex} 
                                          onChange={(e) => setSex(e.target.value)}
                                          style={{ width: '100%', height: '50px', background: 'transparent', border: '1px solid #363636', color: '#a9a9a9', padding: '0 20px', marginBottom: '20px' }}
                                      >
                                          <option value="Male" style={{ background: '#151515' }}>{t('male', 'Male')}</option>
                                          <option value="Female" style={{ background: '#151515' }}>{t('female', 'Female')}</option>
                                      </select>
                                  </div>
                                  <div className="col-lg-12">
                                      <button type="submit">{t('calculate', 'Calculate Now')}</button>
                                  </div>
                              </div>
                          </form>
                          {bmi && (
                              <div style={{ marginTop: '20px', padding: '20px', background: '#151515', border: '1px solid #f36100', borderRadius: '6px', textAlign: 'center' }}>
                                  <h4 style={{ color: '#fff', marginBottom: '10px' }}>{t('bmi_result', 'Your BMI Result')}: <span style={{ color: '#f36100', fontWeight: 'bold' }}>{bmi}</span></h4>
                                  <p style={{ color: '#c4c4c4', margin: 0 }}>Category: <strong style={{ color: '#fff' }}>{status}</strong></p>
                              </div>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      </section>
      {/* BMI Calculator Section End */}
    </>
  );
};

export default BmiCalculator;