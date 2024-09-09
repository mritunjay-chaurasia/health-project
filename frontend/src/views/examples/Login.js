import React, { useState } from 'react';
import * as AuthApi from "../../apis/auth.api";
import { NotificationBadge } from "../../components/Notifications/Notification";
import { USER_TOKEN, USER_ID } from "../../constants/index"

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
  Row,
  Col,
} from "reactstrap";
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({ email: "", password: "" });

  const [notificationBadge, setNotificationBadge] = useState({
    showNotification: false,
    isSuccess: null,
    message: "",
  });

  const [loader, setLoader] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    let tempErrors = { email: "", password: "" };
    let isValid = true;

    // Email validation
    if (!formData.email) {
      tempErrors.email = "Email is required.";
      isValid = false;
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) {
      tempErrors.email = "Invalid email format.";
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      tempErrors.password = "Password is required.";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleClick = (e) => {
    e.preventDefault();
    navigate('/auth/register');
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setLoader(true);
      try {
        const response = await AuthApi.login(formData);
        setLoader(false);

        setNotificationBadge({
          showNotification: true,
          isSuccess: response?.status,
          message: response?.message,
        });

        if (response?.status) {
          localStorage.setItem(USER_TOKEN, response?.token);
          localStorage.setItem(USER_ID, response?.user.id);
           navigate('/admin/sample-reports');
          
        }
      } catch (error) {
        setLoader(false);
        setNotificationBadge({
          showNotification: true,
          isSuccess: false,
          message: error?.message || 'An error occurred. Please try again.',
        });
      }
    }
  };

  return (
    <>
      <Col lg="5" md="7">
        <Card className="bg-secondary shadow border-0">
          <CardBody className="px-lg-5 py-lg-5">
            <div className="text-center text-muted mb-4">
              <small>Sign in</small>
            </div>
            <Form role="form" onSubmit={handleSubmit}>
              <FormGroup className="mb-3">
                <InputGroup className="input-group-alternative">
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
              </FormGroup>
              <FormGroup>
                <InputGroup className="input-group-alternative">
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
              </FormGroup>
              {/* <div className="custom-control custom-control-alternative custom-checkbox">
                <input
                  className="custom-control-input"
                  id=" customCheckLogin"
                  type="checkbox"
                />
                <label
                  className="custom-control-label"
                  htmlFor=" customCheckLogin"
                >
                  <span className="text-muted">Remember me</span>
                </label>
              </div> */}
              <div className="text-center">
                <Button className="my-4" color="primary" style={{ backgroundColor: 'rgb(13,164,239)', border: 'none' }} type="submit" disabled={loader}>
                  {loader ? 'Signing in...' : 'Sign in'}
                </Button>
              </div>
            </Form>
          </CardBody>
        </Card>
        <Row className="mt-3">
          <Col xs="6">
            <a
              className="text-light"
              href="#pablo"
              onClick={handleClick}
            >
              <small>Create new account</small>
            </a>
          </Col>
        </Row>
      </Col>

      {/* Notification Badge */}
      <NotificationBadge notificationBadge={notificationBadge} setNotificationBadge={setNotificationBadge} />
    </>
  );
};

export default Login;
