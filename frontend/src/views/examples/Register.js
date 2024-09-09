import React, { useState } from 'react';
import * as AuthApi from "../../apis/auth.api";
import { NotificationBadge } from "../../components/Notifications/Notification";
import { USER_TOKEN, USER_ID } from "../../constants/index"
import { useNavigate } from 'react-router-dom';

import {
  Button,
  Card,
  CardBody,
  FormGroup,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Col,
} from "reactstrap";

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
  });
  const navigate = useNavigate();

  const [loader, setLoader] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [notificationBadge, setNotificationBadge] = useState({
    showNotification: false,
    isSuccess: null,
    message: '',
  });

  const validate = () => {
    let tempErrors = {};
    tempErrors.name = formData.name ? '' : 'Name is required.';
    tempErrors.email = formData.email
      ? /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)
        ? ''
        : 'Invalid email format.'
      : 'Email is required.';
    tempErrors.password =
      formData.password.length >= 6
        ? ''
        : 'Password must be at least 6 characters long.';
    setErrors(tempErrors);
    return Object.values(tempErrors).every((x) => x === '');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setLoader(true);
      try {
        const response = await AuthApi.register(formData);
        setLoader(false);

        if (response?.status) {
          setAccessToken(response?.token);
          localStorage.setItem(USER_TOKEN, response?.token);
          localStorage.setItem(USER_ID, response?.user.id);

          setNotificationBadge({
            showNotification: true,
            isSuccess: true,
            message: response?.message || 'Registration successful!',
          });
           navigate('/admin/sample-reports')
          // Reset form fields after successful registration
          setFormData({
            name: '',
            email: '',
            password: '',
          });
        } else {
          setNotificationBadge({
            showNotification: true,
            isSuccess: false,
            message: response?.message || 'Registration failed. Please try again.',
          });
        }
      } catch (error) {
        setLoader(false);
        setNotificationBadge({
          showNotification: true,
          isSuccess: false,
          message: error.message || 'An error occurred during registration. Please try again.',
        });
      }
    }
  };


  return (
    <>
      <NotificationBadge
        notificationBadge={notificationBadge}
        setNotificationBadge={setNotificationBadge}
      />
      <Col lg="6" md="8">
        <Card className="bg-secondary shadow border-0">
          <CardBody className="px-lg-5 py-lg-5">
            <div className="text-center text-muted mb-4">
              <small>Or sign up with credentials</small>
            </div>
            <Form role="form" onSubmit={handleSubmit}>
              <FormGroup>
                <InputGroup className="input-group-alternative mb-3">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-hat-3" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="Name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </InputGroup>
                {errors.name && <div className="text-danger">{errors.name}</div>}
              </FormGroup>
              <FormGroup>
                <InputGroup className="input-group-alternative mb-3">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-email-83" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="new-email"
                  />
                </InputGroup>
                {errors.email && <div className="text-danger">{errors.email}</div>}
              </FormGroup>
              <FormGroup>
                <InputGroup className="input-group-alternative mb-3">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-lock-circle-open" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="Password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                </InputGroup>
                {errors.password && <div className="text-danger">{errors.password}</div>}
              </FormGroup>
              <div className="text-center">
                <Button className="mt-4" style={{backgroundColor: 'rgb(13,164,239)',border:'none'}} color="primary" type="submit" disabled={loader}>
                  {loader ? 'Creating...' : 'Create account'}
                </Button>
              </div>
            </Form>
          </CardBody>
        </Card>
      </Col>
    </>
  );
};

export default Register;
