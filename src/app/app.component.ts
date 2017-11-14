import { Observable } from 'rxjs/Observable';
import { Component, OnInit, Injectable, EventEmitter, AfterViewInit, ViewChild } from '@angular/core';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import { CepComponent } from './ng-br-tools/components/cep/cep.component';
import { Endereco } from './ng-br-tools/components/cep/endereco.model';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
@Injectable()
export class AppComponent implements OnInit {
  @ViewChild(CepComponent) cepComponent: CepComponent;
  title = 'app';
  endereco: Endereco;
  hasEndereco = false;
  error: string;
  hasError = false;

  doEndereco(e: Endereco) {
    console.dir(e);
    this.hasEndereco = true;
    this.hasError = false;
    this.error = '';
    this.endereco = e;
  }

  doError(e: string) {
    this.hasError = true;
    this.hasEndereco = false;
    this.endereco = null;
    this.error = `Erro ao buscar o cep: ${e}`;
    console.error(`ERRO: ${e}`);
  }

  constructor() {
  }

  ngOnInit() {
  }

}
