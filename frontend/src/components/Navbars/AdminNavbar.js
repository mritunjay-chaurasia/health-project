import React, { useEffect } from 'react';
import useUserStore from '../../stores/userStore';
import { USER_TOKEN, USER_ID } from "../../constants/index"
import userImg from "../../assets/img/icons/avatar.png";
// reactstrap components
import {
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  DropdownToggle,
  Form,
  FormGroup,
  InputGroupAddon,
  InputGroupText,
  Input,
  InputGroup,
  Navbar,
  Nav,
  Container,
  Media,
} from "reactstrap";
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { globalSearch } from 'apis/search.api';
import globalSearchStore from 'stores/globalSearchStore';

const ALLOWED_LOCALTIONS = ["/admin/sample-reports", "/admin/history"]
const AdminNavbar = (props) => {
  const navigate = useNavigate();
  const { user, fetchUserData } = useUserStore();
  const location = useLocation();
  const { setTableLoader, setTableData, tableTotalPages, setTableTotalPages, tablePage } = globalSearchStore();
  const LIMIT = 9;
  console.log("location", location?.pathname)
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);
  const handleLogout = () => {
    localStorage.removeItem(USER_TOKEN);
    localStorage.removeItem(USER_ID);
    navigate('/auth/login');
  };

  const handleSearch = async (query) => {
    if (location?.pathname === "/admin/history") {
      try {
        setTableLoader(true)
        const requestData = { page: tablePage, limit: LIMIT };
        const response = await globalSearch(query, requestData);
        if (response?.results?.length > 0) {
          setTableData(response?.results);
          setTableTotalPages(response?.totalPages)
        }
        setTableLoader(false)
      } catch (err) {
        console.error(err);
        setTableLoader(false)
      }
    }

  };

  return (
    <>
      <Navbar className="navbar-top navbar-dark" expand="md" id="navbar-main">
        <Container fluid>
          <Form className="navbar-search navbar-search-dark form-inline mr-3 d-none d-md-flex ml-lg-auto">
            {ALLOWED_LOCALTIONS.includes(location?.pathname) &&

              <FormGroup className="mb-0">
                <InputGroup className="input-group-alternative">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="fas fa-search" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input placeholder="Search" type="text"
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </InputGroup>
              </FormGroup>
            }
          </Form>
          <Nav className="align-items-center d-none d-md-flex" navbar>
            <UncontrolledDropdown nav>
              <DropdownToggle className="pr-0" nav>
                <Media className="align-items-center">
                  <span className="avatar avatar-sm rounded-circle">
                    <img
                      alt="..."
                      src={userImg}
                    />
                  </span>
                  <Media className="ml-2 d-none d-lg-block">
                    <span className="mb-0 text-sm font-weight-bold">
                      {user?.name ?? ""} {/* Display the user's name */}
                    </span>
                  </Media>
                </Media>
              </DropdownToggle>
              <DropdownMenu className="dropdown-menu-arrow" right>
                <DropdownItem className="noti-title" header tag="div">
                  <h6 className="text-overflow m-0">Welcome!</h6>
                </DropdownItem>
                <DropdownItem divider />
                <DropdownItem href="#pablo" onClick={handleLogout}>
                  <i className="ni ni-user-run" />
                  <span>Logout</span>
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </Nav>
        </Container>
      </Navbar>
    </>
  );
};

export default AdminNavbar;
