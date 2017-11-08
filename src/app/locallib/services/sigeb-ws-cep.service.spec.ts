import { Observable } from 'rxjs/Observable';
import { Endereco } from './../../components/cep/endereco.model';
import { HttpModule, BaseRequestOptions, Http, ResponseOptions, Response } from '@angular/http';
import { TestBed, async, inject } from '@angular/core/testing';
import { fakeAsync } from '@angular/core/testing';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { tick } from '@angular/core/testing';

import { CepServiceIntfce } from './../../components/cep/cep.service.interface';
import { SigebWsCepService } from './sigeb-ws-cep.service';


let cepServiceTest: CepServiceIntfce;
let backend: MockBackend;
describe('Service: SigebWsCep', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpModule],
      providers: [
        SigebWsCepService,
        BaseRequestOptions,
        MockBackend,
        {
          provide: Http,
          useFactory: (beckend, options) => new Http(beckend, options),
          deps: [MockBackend, BaseRequestOptions]
        }
      ]
    });
    backend = TestBed.get(MockBackend);
    cepServiceTest = TestBed.get(SigebWsCepService);
    cepServiceTest.init();
  });

  // it('should ...', inject([SigebWsCepService], (service: SigebWsCepService) => {
  //   expect(service).toBeTruthy();
  // }));
  it('Testando se chama a url correta', fakeAsync(() => {
    backend.connections.subscribe((conn: MockConnection) => {
      expect(conn.request.url).
        toBe('https://cors-anywhere.herokuapp.com/https://apps.correios.com.br/SigepMasterJPA/AtendeClienteService/AtendeCliente');
    });
    cepServiceTest.buscaCep('12345678');
    tick();
  }));

  it('Testando se o contet-type header do request está correto', fakeAsync(() => {
    backend.connections.subscribe((conn: MockConnection) => {
      expect(conn.request.headers.get('Content-Type')).toBe('text/xml;charset=UTF-8');
    });
    cepServiceTest.buscaCep('12345678');
    tick();
  }));

  it('Testando se o corpo do request está correto', fakeAsync(() => {
    const cep = '70002900';
    const testSoapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
    <SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/"
     xmlns:ns1="http://cliente.bean.master.sigep.bsb.correios.com.br/">
      <SOAP-ENV:Body>
        <ns1:consultaCEP>
          <cep>${cep}</cep>
        </ns1:consultaCEP>
      </SOAP-ENV:Body>
    </SOAP-ENV:Envelope>`.
    // Limpando a string, removendo a indentação, e quebra de linhas
      split(/(?:\r\n|\n|\r)/).
      map((line) => line.replace(/^\s+/gm, '')).
      join('');

    backend.connections.subscribe((conn: MockConnection) => {
      const reqBody = conn.request.getBody().split(/(?:\r\n|\n|\r)/).
          map((line) => line.replace(/^\s+/gm, '')).
          join('');
        expect(reqBody).toBe(testSoapEnvelope);
    });

    cepServiceTest.buscaCep(cep);
    tick();
  }));
  it('Testando se a resposta está correta', fakeAsync(() => {
    const cep = '70002900';
    const testEndereco = new Endereco(
      'SBN Quadra 1 Bloco A',
      'Asa Norte',
      '70002900',
      'Brasília',
      '',
      '',
      'DF',
      0
    );
    let returnEndereco: Endereco;
    const testResponse = `
      <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <ns2:consultaCEPResponse xmlns:ns2="http://cliente.bean.master.sigep.bsb.correios.com.br/">
            <return>
              <bairro>Asa Norte</bairro>
              <cep>70002900</cep>
              <cidade>Brasília</cidade>
              <complemento></complemento>
              <complemento2></complemento2>
              <end>SBN Quadra 1 Bloco A</end>
              <id>0</id>
              <uf>DF</uf>
            </return>
          </ns2:consultaCEPResponse>
        </soap:Body>
      </soap:Envelope>`;
      backend.connections.subscribe((conn: MockConnection) => {
        conn.mockRespond(new Response(new ResponseOptions(
          { 'body': testResponse }
        )));
      });

    (<Observable<Endereco>>cepServiceTest.buscaCep(cep)).subscribe(
      (end: Endereco) => returnEndereco = end);

    tick();
    expect(returnEndereco.endereco).toBe(testEndereco.endereco);
    expect(returnEndereco.bairro).toBe(testEndereco.bairro);
    expect(returnEndereco.cep).toBe(testEndereco.cep);
    expect(returnEndereco.cidade).toBe(testEndereco.cidade);
    expect(returnEndereco.complemento).toBe(testEndereco.complemento);
    expect(returnEndereco.complemento2).toBe(testEndereco.complemento2);
    expect(returnEndereco.uf).toBe(testEndereco.uf);

  }));
});

