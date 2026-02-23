
import React, { useState, useEffect,useRef} from 'react';
import { Container,Button, Row,Modal, Form,Dropdown } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import '../css/Styles.css';
import '../css/DataTable.css';
import axios from 'axios';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import $ from 'jquery';
import 'react-datepicker/dist/react-datepicker.css'
import logo from '../img/slogo.png'
const API_URL = 'https://www.wynstarcreations.com/seyal/api/';


DataTable.use(DT);
function Greyentry() {
  const table = useRef();
    const [formData, setFormData] = useState({
        ide:"",customer:"",fabric: '',construction:'',width:'',
        weight:'',gmeter:'',customerdc:'',remarks:'',noofpcs:'',ftype:'',ptype:'',pining:'',rweight:'',rmeter:'',glm:'',
        f_weight:'',f_meter:'',f_glm:'',f_pinning:'',s_meter:'',s_weight:'',s_glm:'',s_pinning:''
        ,t_meter:'',t_weight:'',t_glm:'',t_pinning:''
      });
  // Calculation for pining dropdown
  const handlePiningChange = (e) => {
    const piningValue = parseFloat(e.target.value);
    const gmeter = parseFloat(formData.gmeter);
    const weight = parseFloat(formData.weight);

    let actual_meter = '';
    let glm = '';

    if (!isNaN(piningValue) && !isNaN(gmeter) && gmeter > 0) {
      actual_meter = (piningValue / 100) * gmeter;
      if (!isNaN(weight) && actual_meter > 0) {
        glm = weight / actual_meter;
        glm = glm.toFixed(2);
      }
    }

    setFormData((prevData) => ({
      ...prevData,
      pining: e.target.value,
      glm: glm !== '' ? glm : '',
    }));
  };

    // Calculation for f_pinning dropdown
  const handleFPiningChange = (e) => {
    const f_piningValue = parseFloat(e.target.value);
    const f_meter = parseFloat(formData.f_meter);
    const f_weight = parseFloat(formData.f_weight);

    let actual_meter = '';
    let f_glm = '';

    if (!isNaN(f_piningValue) && !isNaN(f_meter) && f_meter > 0) {
      actual_meter = (f_piningValue / 100) * f_meter;
      if (!isNaN(f_weight) && actual_meter > 0) {
        f_glm = f_weight / actual_meter;
        f_glm = f_glm.toFixed(2);
      }
    }

    setFormData((prevData) => ({
      ...prevData,
      f_pinning: e.target.value,
      f_glm: f_glm !== '' ? f_glm : '',
    }));
  };

    const handleSPiningChange = (e) => {
    const s_piningValue = parseFloat(e.target.value);
    const s_meter = parseFloat(formData.s_meter);
    const s_weight = parseFloat(formData.s_weight);

    let actual_meter = '';
    let s_glm = '';

    if (!isNaN(s_piningValue) && !isNaN(s_meter) && s_meter > 0) {
      actual_meter = (s_piningValue / 100) * s_meter;
      if (!isNaN(s_weight) && actual_meter > 0) {
        s_glm = s_weight / actual_meter;
        s_glm = s_glm.toFixed(2);
      }
    }

    setFormData((prevData) => ({
      ...prevData,
      s_pinning: e.target.value,
      s_glm: s_glm !== '' ? s_glm : '',
    }));
  };

      // Calculation for t_pinning dropdown
    const handleTPiningChange = (e) => {
      const t_piningValue = parseFloat(e.target.value);
      const t_meter = parseFloat(formData.t_meter);
      const t_weight = parseFloat(formData.t_weight);

      let actual_meter = '';
      let t_glm = '';

      if (!isNaN(t_piningValue) && !isNaN(t_meter) && t_meter > 0) {
        actual_meter = (t_piningValue / 100) * t_meter;
        if (!isNaN(t_weight) && actual_meter > 0) {
          t_glm = t_weight / actual_meter;
          t_glm = t_glm.toFixed(2);
        }
      }

      setFormData((prevData) => ({
        ...prevData,
        t_pinning: e.target.value,
        t_glm: t_glm !== '' ? t_glm : '',
      }));
    };

      const [searchState, setSearchState] = useState('');
      const [isEdit, setIsEdit] = useState(false);
      const [isReturn, setIsReturn] = useState(false);
     // const [fetch, setFetch] = useState(false);
      const [customerData, setCusotmerData] = useState([ ]);
      const [widthData, setWidthData] = useState([ ]);
      const [fabricData, setFabricData] = useState([ ]);
      const [constructionData, setConstructionData] = useState([ ]);
      const [ftypeData] = useState([ 'ORGANIC','NON ORGANIC','OCS','GRS','REGENAGRI']);
      const [ptypeData] = useState([ 'REWORK','FRESH']);
      const [pintypeData] = useState([ '95','96','97','98','99','100','101','102','103','104','105']);
      const [isSaving, setIsSaving] = useState(false);
      
      const regexPatterns = {
        weight: /^[0-9."]*$/,gmeter: /^[0-9."]*$/ ,glm: /^[0-9."]*$/ , f_weight: /^[0-9."]*$/,f_meter: /^[0-9."]*$/,
         f_glm: /^[0-9."]*$/,s_weight: /^[0-9."]*$/,s_meter: /^[0-9."]*$/,s_glm: /^[0-9."]*$/,
         t_weight: /^[0-9."]*$/,t_meter: /^[0-9."]*$/,t_glm: /^[0-9."]*$/
        ,customerdc: /^[A-Za-z0-9_@./#&+\-, "]*$/ ,remarks: /^[A-Za-z0-9_@./#&+\-, "]*$/,
        noofpcs: /^[0-9."]*$/,rweight: /^[0-9."]*$/,rmeter: /^[0-9."]*$/   
         };

         const { user , isAuthenticated } = useAuth();
       // Fetch data from backend API
       useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await axios.get(`${API_URL}/getAllMasters`);        
            setCusotmerData(response.data['customer']);
            setWidthData(response.data['width']);    
            setFabricData(response.data['fabric']);
            setConstructionData(response.data['construction']);
            
          } catch (error) {
            console.log(error);
          } 
        };
        
        user && fetchData();
      }, [user]);

   // const [tableData, setTableData] = useState([ ]);
    const [show, setShow] = useState(false);


  const handleClose = (e) =>  {
    setFormData("");
    setShow(false);}
  const handleShow = (e) => { 
    setIsEdit(false); setIsReturn(false);
    setShow(true);    
  };

const handleColumnChange = (e) => {
    setSearchState(e.target.value);
   
  };

     
      if (!isAuthenticated) {
        return null;
      // navigate('/login');  // Avoid rendering profile if the user is not authenticated
     }

     const handleKeyUp = (event) => {
        const { name, value } = event.target; // Destructure name and value from the event
    
                // Step 4: Validate the input value based on the regex pattern
        const isValid = regexPatterns[name].test(value);
    
        // Step 5: If valid, update the state, otherwise you can show an error or just keep it unchanged
        if (isValid) {
        
          setFormData((prevData) => ({
            ...prevData,
            [name]: value // Update the value of the specific input field
          }));
        } else {
          setFormData((prevData) => ({
            ...prevData,
            [name]: '' // Reset the field to empty
          }));
        }
    
       };

     const handleSubmit = async (event) => {
         setIsSaving(true); 
        event.preventDefault();
        console.log(formData);
        if(!isEdit && !isReturn) {               
        axios.post(`${API_URL}/addInventry`, formData)
      .then(function (response) {    
        setShow(false); setIsSaving(false); 
        table.current.dt().ajax.reload(null, false);
      })
      .catch(function (error) {
        console.log(error);
      });
    } else if(isEdit) {
        console.log(formData);    
        axios.post(`${API_URL}/updateInventry`, formData)
        .then(function (response) {        
          setShow(false); setIsSaving(false); 
         table.current.dt().ajax.reload(null, false);
        })
        .catch(function (error) {
          console.log(error);
        });    
    }else if(isReturn) {
        console.log(formData);    
        axios.post(`${API_URL}/addReturn`, formData)
        .then(function (response) {        
          setShow(false); setIsSaving(false); 
         table.current.dt().ajax.reload(null, false);
        })
        .catch(function (error) {
          console.log(error);
        });    
    }
        
    setFormData('');    
    
      };

     
      const edithandle =  (event) => {
        setIsEdit(true);setIsReturn(false);
        event.preventDefault();       
        let api = table.current.dt();
        let rows = api.rows({ selected: true }).data().toArray();
        let dataArr = [];
        rows.map(value => (
          dataArr.push(value)
        ));    

        if(dataArr.length === 0) {
          alert('Select entry for edit');
        }else if(dataArr.length > 1) {
          alert('Not allowed multiple entries for edit');
        } else {
          // Fetch entry details from backend using ide
          const entryId = dataArr[0][0];
          axios.get(`${API_URL}getInventoryById`, { params: { ide: entryId } })
            .then(response => {
              if (response.data) {
                setFormData({
                  ide: response.data.ide || '',
                  customer: response.data.customer || '',
                  fabric: response.data.fabric || '',
                  construction: response.data.construction || '',
                  width: response.data.width || '',
                  weight: response.data.weight || '',
                  gmeter: response.data.gmeter || '',
                  glm: response.data.glm || '',
                  customerdc: response.data.customerdc || '',
                  remarks: response.data.remarks || '',
                  noofpcs: response.data.noofpcs || '',
                  ftype: response.data.ftype || '',
                  ptype: response.data.ptype || '',
                  pining: response.data.pining || '',
                  rweight: '',
                  rmeter: '',
                  f_weight: response.data.f_weight || '',
                  f_meter: response.data.f_meter || '',
                  f_glm: response.data.f_glm || '',
                  f_pinning: response.data.f_pinning || '',
                  s_weight: response.data.s_weight || '',
                  s_meter: response.data.s_meter || '',
                  s_glm: response.data.s_glm || '',
                  s_pinning: response.data.s_pinning || '',
                  t_weight: response.data.t_weight || '',
                  t_meter: response.data.t_meter || '',
                  t_glm: response.data.t_glm || '',
                  t_pinning: response.data.t_pinning || ''
                });
                setShow(true);
              } else {
                alert('No data found for this entry');
              }
            })
            .catch(error => {
              alert('Failed to fetch entry details');
              console.log(error);
            });
        }
      };

      const returnhandle =  (event) => {
        setIsReturn(true); setIsEdit(false);
        event.preventDefault();       
        let api = table.current.dt();
        let rows = api.rows({ selected: true }).data().toArray();
        let dataArr = [];
        rows.map(value => (
          dataArr.push(value)
        ));    

        if(dataArr.length === 0) {
          alert('Select entry for edit');
        }else if(dataArr.length > 1) {
          alert('Not allowed multiple entries for edit');
        } else {
          console.log(dataArr); 
          const [eweight] = dataArr[0][7].split("/");
          const [egmeter] = dataArr[0][8].split("/");
          
           setFormData({ customer:dataArr[0][3],ide:dataArr[0][0],
            fabric:dataArr[0][4],construction:dataArr[0][5],
            weight: eweight,width:dataArr[0][6],
            gmeter: egmeter, customerdc: dataArr[0][2], remarks: dataArr[0][9]
            , noofpcs: dataArr[0][10], ftype: dataArr[0][11], ptype: dataArr[0][13], pining: dataArr[0][12],rweight:'',rmeter:'' });   
             
          setShow(true);
        }
      };
          
      const deleteHandle =  (event) => {

        event.preventDefault();
        if (window.confirm("Delete this item?")) {
          let api = table.current.dt();
          let rows = api.rows({ selected: true }).data().toArray();
          let dataArr = [];
          rows.map(value => (
            dataArr.push(value)
          ));    
          if(dataArr.length === 0) {
            alert('Select entry for delete');
          } else {
            
          axios.post(`${API_URL}/deleteInventory`, dataArr)
          .then(function (response) {      
            console.log(response);
          })
        .catch(function (error) {
          console.log(error);
        });
          console.log(dataArr);
          api.rows({ selected: true }).remove().draw();
        }
      };
    };
    
    const PrintHandle =  (event) => {
      event.preventDefault();
      let api = table.current.dt();
      let selectedRows = api.rows({ selected: true }).data();
      
      if(selectedRows.length === 0) {
        alert('Select Entry for print');
      } else {       
            EntryPrint(selectedRows);
      
      }
         
    };

      const checkStock = (event) => {
    const { name, value } = event.target;
    let stock = 0;    
    if(name ==="rweight"){
      stock = formData.weight;      
    }else if(name ==="rmeter"){
      stock = formData.gmeter;       
    }
   
    if(parseFloat(stock) < parseFloat(value)){
      alert("Final value should be lesser than stock value");
      event.target.value=0;
    }
  }
    
     const EntryPrint = (selectedRows)=>{
        
           const printableContent = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous"><style>
   
        html, body, div, span, applet, object, iframe,
 h3,h2,h4,h5, h6,blockquote, pre,
a, abbr, acronym, address, big, cite, code,
del, dfn, em, font, img, ins, kbd, q, s, samp,
small, strike,sub, sup, tt, var,
dl, dt, dd, ol, ul, li,
fieldset, form, label, legend,
table, caption, tbody, tfoot, thead, tr, th, td, textarea, input {
   margin: 0;
   padding: 0;
   border: 0;
   outline: 0;
   font-weight: inherit;
   font-style: inherit;
   font-size: 100%;
   font-family: Arial, sans-serif;
   vertical-align: baseline;
   text-decoration:none;overflow:hidden;
  

}
        body{
	margin: 0;
	min-width: 320px;
	padding: 0;
        font-size: 12px;font-weight: 600;color: #6F83AA;letter-spacing: 0.5px;
}
            h1 {text-align: center;}
 pre {
white-space: normal !important;
}
        .hr {
  width: 100%;
  height: 1px;
  background: #fff;
        border-top:1px solid #000;
}
        
        p {
  color: #181E29;
  font-size: 12px;
  line-height: 18px;
  font-weight: normal;
  margin-bottom: 5px;
}
        
        .table{border: 0px solid #364159;border-collapse: separate !important;border-style: solid;border-radius: 10px;box-shadow: 0 0 0 0px #364159;margin: 1rem; table-layout: fixed;border-spacing: 0px;}
	.table thead th{font-size: 12px;font-weight: 600;color: #6F83AA;letter-spacing: 0.5px;background: #E6EBF7;text-transform: none;padding: 0.5rem;text-align: center;vertical-align: middle;border-bottom: 0px solid #364159;}
	.table thead tr th:first-child{border-top-left-radius: 10px;border-top: 0px solid #364159;}
	.table thead tr th:last-child{border-top-right-radius: 10px}
	.table td, .table th{font-size: 12px;border-top: 0px solid #364159;padding: 0.9rem 0.75rem;color: #364159;font-weight: 600;}
	
 .card {
  background: linear-gradient(0deg, #FFFFFF, #FFFFFF), #C4C4C4;
  box-shadow: 0px 0px 7px rgba(196, 196, 196, 0.35);
  border-radius: 0px;
  width: 100%;
  border-bottom: 11px solid #F8BD02;
}
	
.table {
    border: 1px solid #364159;
    -moz-border-radius: 10px;
    -webkit-border-radius: 10px;
    border-radius: 10px;
}
.table td, .table th {
    border-left: 0px solid #364159;
    border-top: 1px solid #364159;
    padding: 10px;
    text-align: left;
}
.table tr th:first-child{border-top: 1px solid #364159;border-radius: 0px}
.table th {
    background-color: transparent;
    border-top: none;
}
.table td:first-child, .table th:first-child {
    border-left: none;
}
.table th:first-child {
    -moz-border-radius: 10px 0 0 0;
    -webkit-border-radius: 10px 0 0 0;
    border-radius: 10px 0 0 0;
}
.table th:last-child {
    -moz-border-radius: 0 10px 0 0;
    -webkit-border-radius: 0 10px 0 0;
    border-radius: 0 10px 0 0;
}
.table th:only-child{
    -moz-border-radius: 10px 10px 0 0;
    -webkit-border-radius: 10px 10px 0 0;
    border-radius: 10px 10px 0 0;
}
.table tr:last-child td:first-child {
    -moz-border-radius: 0 0 0 10px;
    -webkit-border-radius: 0 0 0 10px;
    border-radius: 0 0 0 10px;
}
.table tr:last-child td:last-child {
    -moz-border-radius: 0 0 10px 0;
    -webkit-border-radius: 0 0 10px 0;
    border-radius: 0 0 10px 0;
} 
	
	.table td.totalfee {font-weight: bold;font-size: 16px;color: #D63333;}
	.table td.totalamt {font-weight: bold;font-size: 12px;color: #6F83AA;letter-spacing: 0.5px;text-transform: uppercase;text-align: right !important}
	.table tr:last-child td{text-align: center}
	.table tr td:last-child,.table tr th:last-child{text-align: center}
	.table tr:last-child td:last-child{font-weight: bold;text-align: center}
	.table tr:last-child{text-align: center}
	
	main{max-width: 100%;margin: auto}
          </style></head>
<body><main><div class="mb-0 p-0 card" style="border:0px;padding:0px !important">
           <div class="row">
             <div class="col-2 col-sm-2">
             <img src="${logo}" style="width:100px">
             </div>
             <div class="col-10 col-sm-10"><div class="row ">
               <div class="col-12 col-sm-12" style="text-align: center;font-size: 25px;"><strong>SRI SHIVA DESIGNS</strong></div>
              <div class="col-12 col-sm-12 mt-2" style="text-align: center;font-size: 14px;">PLOT NO . G3, 4TH CROSS,SIPCOT INDUSTRIAL GROWTH CENTRE,PERUNDURAI,TAMILNADU,INDIA - 638052</div>
              </div><div class="row mt-4"><div class="col-4 col-sm-4" style="text-align: center;font-size: 12px;">Email : admin@srishivadesigns.com</div>
              <div class="col-4 col-sm-4" style="text-align: center;font-size: 12px;">Mobile No: 9443029027</div><div class="col-4 col-sm-4" style="text-align: center;font-size: 12px;">GSTIN: 33AMEPP2435Q2ZP</div></div>
             </div></div><div class="hr mt-1 mb-2"></div>
<div class="row">
<div class="col-12 col-md-12" style="text-align:center"> <h3 class="px-2">INWARD RECEIPT</h3></div>
</div>
        <div class="hr mt-1 mb-0"></div>
        <div class="row">
<div class="col-8 col-md-8" style="text-align:left;border-right:1px solid #000"> 
        <p><strong>Customer    :${selectedRows[0][3]}</strong></p>
        <p><strong>PARTY DC NO :${selectedRows[0][2]}</strong></p>
       
</div>
        <div class="col-4 col-md-4" style="text-align:left"> 
        <div class="row"><div class="col-md-4"><p>INWARD NO </p></div> <div class="col-md-6"><p>: ${selectedRows[0][0]}</p></div></div>
        <div class="row"><div class="col-md-4"><p>INWARD DATE </p></div> <div class="col-md-6"><p>: ${selectedRows[0][1]}</p></div></div>

        </div>
</div>
        <div class="hr mt-0 mb-0"></div>
        <div class="row">
<div class="col-8 col-md-8" style="text-align:left;border-right:1px solid #000"> 
         <div class="row"><div class="col-md-4"><p>Construction </p></div> <div class="col-md-6"><p>: ${selectedRows[0][5]}</p></div></div>
        <div class="row"><div class="col-md-4"><p>G Width </p></div> <div class="col-md-6"><p>: ${selectedRows[0][6]}</p></div></div>
</div>
        <div class="col-4 col-md-4" style="text-align:left"> 
       
        <div class="row"><div class="col-md-4"><p>Fabric </p></div> <div class="col-md-6"><p>: ${selectedRows[0][4]}</p></div></div>
        <div class="row"><div class="col-md-4"><p>Process </p></div> <div class="col-md-6"><p>: ${selectedRows[0][13]}</p></div></div>
        </div>
</div>
        
         <div class="row mb-3">
		
		 <table class="table" style="margin-top:0px">
              <thead>
                <tr>
                    <th scope="col" width="35%">Fabric Type.</th>                   
                    <th scope="col" width="15%">Weight</th>				  
                    <th scope="col" width="10%">Meter</th>
                    <th scope="col" width="10%">Pining</th>
                    <th scope="col" width="10%">No Of Pcs</th> 
                    <th scope="col" width="10%">Remarks</th>
                </tr>
              </thead>
              <tbody>
               
               
                <tr>
        <td scope="row" width="35%">${selectedRows[0][11]}</th>				 
				  <td width="15%">${selectedRows[0][7]}</td>
				  <td width="10%">${selectedRows[0][8]}</td>
				  <td width="20%">${selectedRows[0][12]}</td>
				  <td width="20%">${selectedRows[0][10]}</td>
                                  <td width="20%">${selectedRows[0][9]}</td>
        
				</tr>

              </tbody>
            </table>
            
			</div>
    
        <div class="row mt-5" style="text-align:center">
       
                <div class="col-md-6"><p>Entred by </p></div>             
                <div class="col-md-6"><p>Customer Signature</p></div>
            </div>
       
        
</div></main></body>
      </html>
    `;
  
      const newWindow = window.open("", "_blank");
      newWindow.document.write(`<pre>${printableContent}</pre>`);
      newWindow.print();
    }

  
  return (
    <div className="main-content" >
      <Container fluid className="relative">
        <Row className="mb-6">
          <div className="col-10 col-sm-10">
            <h1 className="text-2xl font-bold text-gray-800">Grey Fabric Entry</h1>
            <p className="text-gray-600">Welcome, {user.user}!</p>
          </div>
        </Row>

        <div className="flex justify-end mb-4">
          <div className="col-2 col-sm-2">
            <Dropdown className="">
              <Dropdown.Toggle variant="primary" id="dropdown-basic" 
                className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200">
                Actions
              </Dropdown.Toggle>

              <Dropdown.Menu className="mt-2">
                {user && user.role !=="SP2" && <Dropdown.Item href="#" onClick={handleShow}>Add</Dropdown.Item>}
                {user && user.role !=="grey" && user.role !=="SP1" && <Dropdown.Item href="#" onClick={edithandle}>Edit</Dropdown.Item>}
                {user && user.role==="admin" && <Dropdown.Item href="#" onClick={deleteHandle}>Delete</Dropdown.Item>}
                 {user && user.role==="admin1" && <Dropdown.Item href="#" onClick={returnhandle}>Return</Dropdown.Item>}
                <Dropdown.Item href="#" onClick={PrintHandle}>Print</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
          <div className="ml-auto w-1/5">
            <Form.Select
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 tsearch"
              value={searchState}
              onChange={handleColumnChange}
            >
              <option value="greyid">Grey Entry No</option>
              <option value="customer">Customer</option>
            </Form.Select>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 relative bg-white">
          <DataTable 
            ref={table}
            options={{
              scrollX: true,
              scrollY: '60vh',
              scrollCollapse: true,
              fixedColumns: {
                left: 2
              },
              order: [[0, 'desc']],
              paging: true,
              processing: true,
              serverSide: true,
              select: { style: 'multi' },
              ajax: {
                url: `${API_URL}/inventry1`,
                type: 'POST',
                data: function (d) {
                  d.searchcol = $(".tsearch").val();
                  if (d.length === -1) {
                    d.length = 25;
                  }
                  return d;
                },
              },
              pageLength: 25,
              columns: [
                {
                    className: "", // Add a class for the toggle button
                    orderable: false,
                    data: "0",
                    defaultContent: ""
                },
                { data: "1" },
                { data: "2" },
                { data: "3" },
                { data: "4" },
                { data: "5" },
                { data: "6" },
                { data: "7" },
                { data: "8" },
                { data: "9" },
                { data: "10" },
                { data: "11" },
                { data: "12" },
                { data: "13" }          
                
            ],
            }} className="display table sortable stripe row-border order-column nowrap dataTable" style={{width:"100%"}}>
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Inward No</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Party Dc No</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Fabric</th>
                <th className="px-6 py-3">Construction</th>
                <th className="px-6 py-3">Width</th>
                <th className="px-6 py-3">Weight</th>
                <th className="px-6 py-3">GMeter</th> 
                <th className="px-6 py-3">Remarks</th>     
                <th className="px-6 py-3">No Of Pcs</th>  
                <th className="px-6 py-3">Fabric Type</th>  
                <th className="px-6 py-3">Pining</th>  
                <th className="px-6 py-3">Process</th>    
                                  
              </tr>
            </thead>
        </DataTable>
        </div>

        {/* Modal remains the same but with updated styling classes */}
        <Modal size="xl" show={show} onHide={handleClose} className="rounded-lg">
          <Modal.Header closeButton className="bg-gray-50 border-b border-gray-200">
            <Modal.Title className="text-xl font-semibold text-gray-800">
              {isEdit && !isReturn? "Edit Grey Fabric" : "Add Grey Fabric"}
              {isReturn && !isEdit? "Return Grey Fabric" : ""}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
          <Form onSubmit={handleSubmit}>          
          <Form.Group className="col-12 col-sm-12 mb-3" controlId="formBasicCustomer">
            
            <Form.Select             
              name="customer"              
              value={formData.customer}
              onChange={(e) =>  setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))}    
             required
            >
              <option  value="">Select Customer</option>
         {customerData.map(customer => (
          
  <option  value={customer}>
    {customer}
  </option>
))}
           </Form.Select>
           </Form.Group>
            <Row>
           <Form.Group className="col-6 col-sm-6 mb-3" controlId="formBasicFabric">
           
            <Form.Select             
              name="fabric"              
              value={formData.fabric}
              onChange={(e) =>  setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))}    
             required
            >
              <option  value="">Select Fabric</option>
         {fabricData.map(fabric => (
          
  <option  value={fabric}>
    {fabric}
  </option>
))}
           </Form.Select>
          </Form.Group>
           <Form.Group className="col-6 col-sm-6 mb-3" controlId="formBasicConstruction">
            
            <Form.Select             
              name="construction"              
              value={formData.construction}
              onChange={(e) =>  setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))}    
             required
            >
              <option  value="">Select Construction</option>
         {constructionData.map(construction => (
          
  <option  value={construction}>
    {construction}
  </option>
))}
           </Form.Select>      
          </Form.Group>
          </Row>
          <Row>
         
          <Form.Group className="col-6 col-sm-6 mb-3" controlId="formBasicWidth">
           
            <Form.Select             
              name="width"              
              value={formData.width}
              onChange={(e) =>  setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))}    
             required
            >
              <option  value="">Select Width</option>
         {widthData.map(width => (
          
  <option  value={width}>
    {width}
  </option>
))}
           </Form.Select>       
          </Form.Group>
           <Form.Group className="col-6 col-sm-6 mb-3" controlId="formFabricType">
         <Form.Select             
              name="ftype"              
              value={formData.ftype}
              onChange={(e) =>  setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))}    
             required
            >
              <option  value="">Fabric Type</option>
         {ftypeData.map(fabric => (
          
  <option  value={fabric}>
    {fabric}
  </option>
))}
           </Form.Select> 
          </Form.Group>
          </Row>
          <Row>
          <Form.Group className="col-3 col-sm-3 mb-3" controlId="formBasicWeight">
            <Form.Label>Weight </Form.Label>
            <Form.Control
              type="text"
              name="weight"
             
              value={formData.weight}
              onKeyUp={handleKeyUp}
              onChange={(e) =>  setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))} 
              required 
            />       
          </Form.Group>
         
          <Form.Group className="col-3 col-sm-3 mb-3" controlId="formBasicGmeter">
            <Form.Label>Meter </Form.Label>
            <Form.Control
              type="text"
              name="gmeter"
             
              value={formData.gmeter}
              onKeyUp={handleKeyUp}
              onChange={(e) =>  setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))}  
                
            />       
          </Form.Group> 
           <Form.Group className="col-3 col-sm-3 mb-3" controlId="formFabricType">
          <Form.Label>Pining </Form.Label>
         <Form.Select             
              name="pining"              
              value={formData.pining}
              onChange={handlePiningChange}
             required
            >
              <option  value="">Select</option>
         {pintypeData.map(pining => (
          
  <option  value={pining}>
    {pining}
  </option>
))}
           </Form.Select> 
          </Form.Group>
          <Form.Group className="col-3 col-sm-3 mb-3" controlId="formBasicGmeter">
            <Form.Label>GLM </Form.Label>
            <Form.Control
              type="text"
              name="glm"
              value={formData.glm}
              readOnly
            />       
          </Form.Group>
          </Row>
           <Row>
          <Form.Group className="col-3 col-sm-3 mb-3" controlId="formBasicWeight">
            <Form.Label>1st Pc Weight </Form.Label>
            <Form.Control
              type="text"
              name="f_weight"
             
              value={formData.f_weight}
              onKeyUp={handleKeyUp}
              onChange={(e) =>  setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))} 
              required 
            />       
          </Form.Group>
         
          <Form.Group className="col-3 col-sm-3 mb-3" controlId="formBasicGmeter">
            <Form.Label>1st Pc meter </Form.Label>
            <Form.Control
              type="text"
              name="f_meter"
             
              value={formData.f_meter}
              onKeyUp={handleKeyUp}
              onChange={(e) =>  setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))}  
                
            />       
          </Form.Group> 
          <Form.Group className="col-3 col-sm-3 mb-3" controlId="formFabricType">
          <Form.Label>1st pc Pining </Form.Label>
         <Form.Select             
              name="f_pinning"              
              value={formData.f_pinning}
              onChange={handleFPiningChange}
             required
            >
              <option  value="">Select</option>
         {pintypeData.map(pining => (
          
  <option  value={pining}>
    {pining}
  </option>
))}
           </Form.Select> 
          </Form.Group>
          <Form.Group className="col-3 col-sm-3 mb-3" controlId="formBasicGmeter">
            <Form.Label>1st Pc GLM </Form.Label>
            <Form.Control
              type="text"
              name="f_glm"
              value={formData.f_glm}
              readOnly
            />       
          </Form.Group>
          </Row>
           <Row>
          <Form.Group className="col-3 col-sm-3 mb-3" controlId="formBasicWeight">
            <Form.Label>2nd Pc Weight </Form.Label>
            <Form.Control
              type="text"
              name="s_weight"
             
              value={formData.s_weight}
              onKeyUp={handleKeyUp}
              onChange={(e) =>  setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))} 
              required 
            />       
          </Form.Group>
         
          <Form.Group className="col-3 col-sm-3 mb-3" controlId="formBasicGmeter">
            <Form.Label>2nd Piece meter </Form.Label>
            <Form.Control
              type="text"
              name="s_meter"
             
              value={formData.s_meter}
              onKeyUp={handleKeyUp}
              onChange={(e) =>  setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))}  
                
            />       
          </Form.Group> 
             <Form.Group className="col-3 col-sm-3 mb-3" controlId="formFabricType">
          <Form.Label>2nd pc Pining </Form.Label>
         <Form.Select             
              name="s_pinning"              
              value={formData.s_pinning}
              onChange={handleSPiningChange}
             required
            >
              <option  value="">Select</option>
         {pintypeData.map(pining => (
          
  <option  value={pining}>
    {pining}
  </option>
))}
           </Form.Select> 
          </Form.Group>
          <Form.Group className="col-3 col-sm-3 mb-3" controlId="formBasicGmeter">
            <Form.Label>2nd Piece GLM </Form.Label>
            <Form.Control
              type="text"
              name="s_glm"
              value={formData.s_glm}
              readOnly
            />       
          </Form.Group>
          </Row>
            <Row>
          <Form.Group className="col-3 col-sm-3 mb-3" controlId="formBasicWeight">
            <Form.Label>3rd Pc Weight </Form.Label>
            <Form.Control
              type="text"
              name="t_weight"
             
              value={formData.t_weight}
              onKeyUp={handleKeyUp}
              onChange={(e) =>  setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))} 
              required 
            />       
          </Form.Group>
         
          <Form.Group className="col-3 col-sm-3 mb-3" controlId="formBasicGmeter">
            <Form.Label>3rd Piece meter </Form.Label>
            <Form.Control
              type="text"
              name="t_meter"
             
              value={formData.t_meter}
              onKeyUp={handleKeyUp}
              onChange={(e) =>  setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))}  
                
            />       
          </Form.Group> 
             <Form.Group className="col-3 col-sm-3 mb-3" controlId="formFabricType">
          <Form.Label>3rd pc Pining </Form.Label>
         <Form.Select             
              name="t_pinning"              
              value={formData.t_pinning}
              onChange={handleTPiningChange}
             required
            >
              <option  value="">Select</option>
         {pintypeData.map(pining => (
          
  <option  value={pining}>
    {pining}
  </option>
))}
           </Form.Select> 
          </Form.Group>
          <Form.Group className="col-3 col-sm-3 mb-3" controlId="formBasicGmeter">
            <Form.Label>3rd Piece GLM </Form.Label>
            <Form.Control
              type="text"
              name="t_glm"
              value={formData.t_glm}
              readOnly
            />       
          </Form.Group>
          </Row>
          <Row>
          <Form.Group className="col-6 col-sm-6 mb-3" controlId="formBasicDC">
            <Form.Label>Customer DC No </Form.Label>
            <Form.Control
              type="text"
              name="customerdc"
             
              value={formData.customerdc}
              onKeyUp={handleKeyUp}
              onChange={(e) =>  setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))} 
              required 
            />       
          </Form.Group>
         <Form.Group className="col-6 col-sm-6 mb-3" controlId="formBasicRemarks">
            <Form.Label>Remarks </Form.Label>
            <Form.Control
              type="text"
              name="remarks"
             
              value={formData.remarks}
              onKeyUp={handleKeyUp}
              onChange={(e) =>  setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))}  
                
            />       
          </Form.Group>
          </Row>          
          <Row>
          <Form.Group className="col-6 col-sm-6 mb-3" controlId="formProcess">
            <Form.Label>Process</Form.Label>
         <Form.Select             
              name="ptype"              
              value={formData.ptype}
              onChange={(e) =>  setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))}    
             required
            >
              <option  value="">Select Process</option>
         {ptypeData.map(ptype => (
          
  <option  value={ptype}>
    {ptype}
  </option>
))}
           </Form.Select> 
          </Form.Group>
         <Form.Group className="col-6 col-sm-6 mb-3" controlId="formNoOfPcs">
            <Form.Label>No of pcs </Form.Label>
            <Form.Control
              type="text"
              name="noofpcs"             
              value={formData.noofpcs}
              onKeyUp={handleKeyUp}
              onChange={(e) =>  setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))} 
              required 
            />       
          </Form.Group>
          </Row>
                   
         {isReturn && <Row>
            
   <Form.Group className="col-6 col-sm-6 mb-3" controlId="returnWeight">
            <Form.Label>Return Weight </Form.Label>
            <Form.Control
              type="text"
              name="rweight"             
              value={formData.rweight}
              onKeyUp={handleKeyUp}
              onChange={(e) =>  {setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))
              checkStock(e);
            } }
               
              required 
            />       
          </Form.Group>
          <Form.Group className="col-6 col-sm-6 mb-3" controlId="returnMeter">
            <Form.Label>Return Meter</Form.Label>
            <Form.Control
              type="text"
              name="rmeter"             
              value={formData.rmeter}
              onKeyUp={handleKeyUp}
              onChange={(e) =>  {setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              })) 
              checkStock(e);
            } }
              required 
            />       
          </Form.Group>

          </Row>}
          <Row>
          <Form.Group className="col-6 col-sm-6 mb-3" controlId="formBasicaglm">
                               <Button variant="secondary" onClick={handleClose}>Close</Button>
                                         </Form.Group>
                                         <Form.Group style={{textAlign:"right"}} className="col-6 col-sm-6 mb-3" controlId="formBasicaglm">
                                           <Button disabled={isSaving} variant="primary" type="submit" >
                                           Save
                                           </Button>
                                           </Form.Group>
                                     
                                        
          </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          
        </Modal.Footer>
      </Modal>
      </Container>
    </div>
        
  );
}


export default Greyentry;