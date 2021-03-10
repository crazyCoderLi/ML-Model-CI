import React from 'react';
import {
  Button,
  Table,
  Card,
  Divider,
  Input as search,
  Descriptions,
  Tag,
  Menu,
  Dropdown,
  Modal
} from 'antd';
import {
  EditOutlined,
  ProfileOutlined,
  BranchesOutlined,
} from '@ant-design/icons';
import { SchemaForm, FormButtonGroup, Submit, Reset } from '@formily/antd';
import axios from 'axios';
import { config, Link } from 'ice';
import reqwest from 'reqwest';
import './index.css';
import { Input, Form } from 'antd';
import {
  Select,
  Switch,
  NumberPicker,
  FormMegaLayout,
  DatePicker,
  FormLayout,
  ArrayTable,
} from '@formily/antd-components';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const registerSchema = require('./utils/schema.json');

const components = {
  Input,
  Select,
  Switch,
  NumberPicker,
  FormMegaLayout,
  DatePicker,
  FormLayout,
  ArrayTable,
};

const { Search } = search;

const tagColor = {
  Published: 'geekblue',
  Converted: 'cyan',
  Profiling: 'purple',
  'In Service': 'lime',
  Draft: 'red',
  Validating: 'magenta',
  Training: 'volcano',
};

const columns = [
  {
    title: 'Model Name',
    dataIndex: 'name',
    key: 'name',
    className: 'column',
  },
  {
    title: 'Framework',
    dataIndex: 'framework',
    key: 'framework',
    className: 'column',
  },
  {
    title: 'Engine',
    dataIndex: 'engine',
    key: 'engine',
    className: 'column',
  },
  {
    title: 'Pre-trained Dataset',
    dataIndex: 'dataset',
    key: 'dataset',
    className: 'column',
  },
  {
    title: 'Metric',
    dataIndex: 'metric',
    key: 'metric',
    className: 'column',
    render: (metric) => Object.keys(metric)[0],
  },
  {
    title: 'Score',
    dataIndex: 'metric',
    key: 'score',
    className: 'column',
    render: (metric) => metric[Object.keys(metric)[0]],
  },
  {
    title: 'Task',
    dataIndex: 'task',
    key: 'task',
    className: 'column',
  },
  {
    title: 'Status',
    dataIndex: 'model_status',
    key: 'model_status',
    className: 'column',
    render: (modelStatus) => {
      return modelStatus.map((status, index) => (
        <Tag color={tagColor[status]} key={index}>
          {status}
        </Tag>
      ));
    },
  },
  {
    title: 'Model User',
    dataIndex: 'creator',
    key: 'creator',
    className: 'column',
  },
  {
    title: 'Action',
    dataIndex: 'id',
    key: 'id',
    className: 'column',
    render: (text, record) => {
      const menu = (
        <Menu>
          <Menu.Item
            key="2"
            icon={<ProfileOutlined />}
            style={{ fontSize: 18 }}
          >
            Profile
          </Menu.Item>
          {record.engine === 'PYTORCH' || record.engine === 'TFS' ? (
            <Menu.Item
              key="3"
              icon={<BranchesOutlined />}
              style={{ fontSize: 18 }}
            >
              <Link to={`/visualizer/${text}`}>Finetune</Link>
            </Menu.Item>
          ) : (
            ''
          )}
        </Menu>
      );
      return (
        <Dropdown.Button overlay={menu} size="large">
          <EditOutlined /> Edit
        </Dropdown.Button>
      );
    },
  },
];

const getRandomuserParams = (params) => {
  return {
    results: params.pagination.pageSize,
    page: params.pagination.current,
    ...params,
  };
};

export default class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      profilingResult: {},
      allModelInfo: [],
      pagination: {
        current: 1,
        pageSize: 10,
      },
      loading: false,
      showRegisterForm: false,
      loadingRegisterForm: false,
    };
    this.loadAllModels();
    this.handleCancelRegister.bind(this);
    this.showRegisterForm.bind(this);
    this.submitRegisterForm.bind(this);
    this.setModelFileData.bind(this);
  }

  public componentDidMount() {
    const { pagination } = this.state;
    this.fetch({ pagination });
  }

  public handleTableChange = (pagination, filters, sorter) => {
    this.fetch({
      sortField: sorter.field,
      sortOrder: sorter.order,
      pagination,
      ...filters,
    });
  };

  public fetch = (params = {}) => {
    this.setState({ loading: true });
    reqwest({
      url: config.modelURL,
      method: 'get',
      type: 'json',
      data: getRandomuserParams(params),
    }).then((allModelInfo) => {
      this.setState({
        loading: false,
        data: allModelInfo.data,
        pagination: {
          ...params.pagination,
          total: this.state.allModelInfo.length,
        },
        files: null
      });
    });
  };

  public loadAllModels = () => {
    const targetUrl = config.modelURL;
    axios
      .get(targetUrl)
      .then((response) => {
        // handle success
        // console.log(response.data);
        this.setState({ allModelInfo: response.data });
      })
      .catch(() => {
        // handle error
        // console.log(error);
      })
      .then(() => {
        // always executed
      });
  };

  public showRegisterForm = () => {
    this.setState({ showRegisterForm: true });
  };

  public handleCancelRegister = () => {
    this.setState({ showRegisterForm: false });
  };

  public submitRegisterForm = async (values) => {
    values.files = this.state.files;
    values.metric[values.metric.name] = values.metric.score;
    delete values.metric.name;
    delete values.metric.score;
    values.metric = JSON.stringify(values.metric);
    values.inputs = JSON.stringify(values.inputs);
    values.outputs = JSON.stringify(values.outputs);
    var formData = new FormData();
    for ( var key in values ) {
      formData.append(key, values[key]);
    }
    await axios.post(config.modelURL, formData);
    this.setState({ showRegisterForm: false });    
  };

  public setModelFileData = (e) =>{
    this.setState({ files: e.target.files[0] });
  }

  public render() {
    return (
      <Card>
        <div
          style={{
            marginBottom: '20px',
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          <Button size="large" type="primary" onClick={this.showRegisterForm}>
            Register Model
          </Button>
          <Modal
            title="Model Registration"
            visible={this.state.showRegisterForm}
            onOk={this.submitRegisterForm}
            confirmLoading={this.state.loadingRegisterForm}
            onCancel={this.handleCancelRegister}
            width={1000}
            footer={null}
          >
            <Form.Item
              label="Model File"
              name="files"
              rules={[
                { required: true, message: 'Please select your model file!' },
              ]}
            >
              <Input type="file" onChange={this.setModelFileData}/>
            </Form.Item>
            <SchemaForm
              components={components}
              schema={registerSchema}
              style={{
                fontSize: 'medium',
              }}
              onSubmit={this.submitRegisterForm}
            >
              <FormButtonGroup>
                <Submit>Submit</Submit>
                <Reset>Reset</Reset>
              </FormButtonGroup>
            </SchemaForm>
          </Modal>

          <Button
            size="large"
            style={{ marginLeft: '5px' }}
            onClick={() => {
              console.log('You clicked Download Table');
            }}
          >
            Download Table
          </Button>
          <Search
            size="large"
            style={{ marginLeft: '10px' }}
            placeholder="search model record by key words"
            enterButton="Search"
            onSearch={(value) => console.log(value)}
          />
        </div>
        <Divider dashed />
        <Table
          rowKey={(record) => record.id}
          columns={columns}
          pagination={this.state.pagination}
          loading={this.state.loading}
          onChange={this.handleTableChange}
          dataSource={this.state.allModelInfo}
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ backgroundColor: '#F5F5F5', padding: '10px' }}>
                <Descriptions
                  style={{ width: '92%', margin: '0 auto' }}
                  column={3}
                  size="middle"
                  title={
                    <a
                      style={{
                        whiteSpace: 'nowrap',
                        fontSize: 25,
                        color: 'black',
                      }}
                    >
                      Converted Model Info
                    </a>
                  }
                >
                  <Descriptions.Item
                    label={
                      <a
                        style={{
                          whiteSpace: 'nowrap',
                          fontSize: 25,
                          color: 'black',
                        }}
                      >
                        Model Name
                      </a>
                    }
                  >
                    <Tag color="volcano">{record.architecture}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <a
                        style={{
                          whiteSpace: 'nowrap',
                          fontSize: 25,
                          color: 'black',
                        }}
                      >
                        Converted Version
                      </a>
                    }
                  >
                    <Tag color="blue">
                      {record.engine === 'PYTORCH' ? '' : record.framework}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <a
                        style={{
                          whiteSpace: 'nowrap',
                          fontSize: 25,
                          color: 'black',
                        }}
                      >
                        Serving Engine
                      </a>
                    }
                  >
                    <Tag color="pink">
                      {(() => {
                        switch (record.engine) {
                          case 'TorchScript':
                            return 'PyTorch JIT + FastAPI';
                          case 'ONNX':
                            return 'ONNX Runtime + FastAPI';
                          case 'tensorrt':
                            return 'Triton Inference Server';
                          case 'TFS':
                            return 'TensorFlow Serving';
                          default:
                            return 'FastAPI';
                        }
                      })()}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item
                    span={2}
                    label={
                      <a
                        style={{
                          whiteSpace: 'nowrap',
                          fontSize: 25,
                          color: 'black',
                        }}
                      >
                        Conversion State
                      </a>
                    }
                  >
                    <a
                      style={{
                        fontSize: 25,
                        whiteSpace: 'nowrap',
                        color: 'green',
                      }}
                    >
                      {record.status}
                    </a>
                    <Divider type="vertical" />
                    <Button type="primary" size="large">
                      Deploy this Model
                    </Button>
                  </Descriptions.Item>
                </Descriptions>
                <Descriptions
                  style={{ width: '92%', margin: '0 auto' }}
                  column={3}
                  size="small"
                  title={
                    <a
                      style={{
                        whiteSpace: 'nowrap',
                        fontSize: 25,
                        color: 'black',
                      }}
                    >
                      Profiling Results
                    </a>
                  }
                >
                  <Descriptions.Item
                    label={
                      <a
                        style={{
                          whiteSpace: 'nowrap',
                          fontSize: 25,
                          color: 'black',
                        }}
                      >
                        Profiling Device
                      </a>
                    }
                  >
                    <Tag color="geekblue">
                      {record.profile_result
                        ? record.profile_result.dynamic_results[0].device_name
                        : ''}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <a
                        style={{
                          whiteSpace: 'nowrap',
                          fontSize: 25,
                          color: 'black',
                        }}
                      >
                        Profiling Batch Size
                      </a>
                    }
                  >
                    <Tag color="gold">
                      {record.profile_result
                        ? record.profile_result.dynamic_results[0].batch
                        : ''}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <a
                        style={{
                          whiteSpace: 'nowrap',
                          fontSize: 25,
                          color: 'black',
                        }}
                      >
                        Device Memory Utilization
                      </a>
                    }
                  >
                    <Tag color="blue">
                      {record.profile_result
                        ? (
                            record.profile_result.dynamic_results[0].memory
                              .utilization * 100
                          ).toFixed(2)
                        : ''}{' '}
                      %
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <a
                        style={{
                          whiteSpace: 'nowrap',
                          fontSize: 25,
                          color: 'black',
                        }}
                      >
                        Preprocess Latency
                      </a>
                    }
                  >
                    <Tag color="cyan">
                      {record.profile_result
                        ? (
                            record.profile_result.dynamic_results[0].latency
                              .preprocess_latency.avg * 1000
                          ).toFixed(2)
                        : ''}{' '}
                      ms
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item
                    span={2}
                    label={
                      <a
                        style={{
                          whiteSpace: 'nowrap',
                          fontSize: 25,
                          color: 'black',
                        }}
                      >
                        All Batch Throughput
                      </a>
                    }
                  >
                    <Tag color="geekblue">
                      {record.profile_result
                        ? record.profile_result.dynamic_results[0].throughput.inference_throughput.toFixed(
                            2
                          )
                        : ''}{' '}
                      req/sec
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <a
                        style={{
                          whiteSpace: 'nowrap',
                          fontSize: 25,
                          color: 'black',
                        }}
                      >
                        P50 Latency
                      </a>
                    }
                  >
                    <Tag color="gold">
                      {record.profile_result
                        ? (
                            record.profile_result.dynamic_results[0].latency
                              .inference_latency.p50 * 1000
                          ).toFixed(2)
                        : ''}{' '}
                      ms
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <a
                        style={{
                          whiteSpace: 'nowrap',
                          fontSize: 25,
                          color: 'black',
                        }}
                      >
                        P95 Latency
                      </a>
                    }
                  >
                    <Tag color="green">
                      {record.profile_result
                        ? (
                            record.profile_result.dynamic_results[0].latency
                              .inference_latency.p95 * 1000
                          ).toFixed(2)
                        : ''}{' '}
                      ms
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <a
                        style={{
                          whiteSpace: 'nowrap',
                          fontSize: 25,
                          color: 'black',
                        }}
                      >
                        P99 Latency
                      </a>
                    }
                  >
                    <Tag color="pink">
                      {record.profile_result
                        ? (
                            record.profile_result.dynamic_results[0].latency
                              .inference_latency.p99 * 1000
                          ).toFixed(2)
                        : ''}{' '}
                      ms
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </div>
            ),
            rowExpandable: () => true,
          }}
        />
      </Card>
    );
  }
}
