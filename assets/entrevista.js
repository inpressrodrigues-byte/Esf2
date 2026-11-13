/* Identificação reutilizável e entrevista conforme o tipo de atendimento. */
(()=>{
  'use strict';
  const porId=id=>document.getElementById(id);
  const demografia={
    estado_civil:'Estado civil',ocupacao:'Profissão / ocupação',escolaridade:'Escolaridade',
    raca:'Raça/cor ou etnia autodeclarada',naturalidade:'Naturalidade',religiao:'Religião, se desejar informar'
  };
  function complemento(alvo,titulo,campos){
    if(!campos.length)return;
    const bloco=document.createElement('details'),resumo=document.createElement('summary');
    bloco.className='support-section';bloco.dataset.entrevistaComplementar='1';resumo.textContent=titulo;bloco.append(resumo);
    const grade=document.createElement('div');grade.className='module-form-grid';
    for(const [id,rotulo,multilinha,dica] of campos){
      const grupo=document.createElement('div'),label=document.createElement('label');
      const campo=document.createElement(multilinha?'textarea':'input');
      grupo.className=multilinha?'f span2':'f';campo.id=id;campo.className='aps-new';
      label.htmlFor=id;label.textContent=rotulo;if(dica)campo.placeholder=dica;
      if(!multilinha)campo.dataset.cadastral='1';
      grupo.append(label,campo);grade.append(grupo);
    }
    bloco.append(grade);alvo.after(bloco);
  }
  function atualizar(p){
    const legado=porId(p+'-endereco-legado');
    if(legado){
      const antigo=val(p+'-endereco');
      legado.textContent=antigo&&!val(p+'-logradouro')?'Residência cadastrada: '+antigo:'';
    }
    const saida=porId(p+'-idade-entrevista');if(!saida)return;
    const d=calcAgeDetail(val(p+'-nasc'),val(p+'-data-hora').slice(0,10));
    saida.textContent=d?(d.y===0?d.totalM+' meses':d.y===1?'1 ano':d.y+' anos'):'';
  }
  function montar(){
    CAMPOS_PACIENTE.pna.estado_civil='pna-estcivil';
    for(const [p,mapa] of Object.entries(CAMPOS_PACIENTE)){
      for(const k of ['cep','logradouro','numero','complemento','bairro','municipio','uf']){
        if(!mapa[k]&&porId(p+'-'+k))mapa[k]=p+'-'+k;
      }
      for(const k of Object.keys(demografia)){
        const existente=porId(mapa[k]);if(existente)existente.dataset.cadastral='1';
      }
    }
    for(const p of ['smu','prev']){
      const mapa=CAMPOS_PACIENTE[p],card=porId(mapa.nome)?.closest('.card');if(!card)continue;
      const campos=[];
      for(const [k,label] of Object.entries(demografia)){
        if(porId(mapa[k]))continue;
        const id=p+'-'+k.replaceAll('_','-');mapa[k]=id;campos.push([id,label]);
      }
      complemento(card,'Dados pessoais da entrevista',campos);
    }
    const nasc=porId('smu-nasc'),saida=document.createElement('small');
    saida.id='smu-idade-entrevista';saida.setAttribute('aria-live','polite');nasc.after(saida);
    const endereco=porId('smu-logradouro'),legado=document.createElement('small');
    legado.id='smu-endereco-legado';endereco.after(legado);
    for(const el of [nasc,porId('smu-data-hora'),endereco])el.addEventListener('input',()=>atualizar('smu'));
    atualizar('smu');
    const q=porId('smu-queixa-principal');
    q.placeholder='Registre como a paciente descreve o motivo da consulta.';
    q.closest('.f').querySelector('label').htmlFor=q.id;
    porId('smu-antecedentes-gineco').placeholder='Menarca, telarca, pubarca, ciclo, sexarca, rastreamentos, gestações, partos e intercorrências.';
    porId('smu-comorbidades').placeholder='Condições atuais e anteriores, cirurgias, transfusões, alergias, vacinação e tratamentos relevantes.';
    complemento(porId('smu-antecedentes-gineco').closest('.module-form-grid'),'Complementar a entrevista ginecológica',[
      ['smu-antecedentes-familiares','Antecedentes familiares',true,'Doenças crônicas, cânceres na família e condições hereditárias.'],
      ['smu-habitos-contexto','Hábitos e condições de vida',true,'Alimentação, atividade física, substâncias, apoio, moradia, renda e saneamento pertinentes à consulta.']
    ]);
    const motivo=porId('ist-motivo');
    motivo.placeholder='Registre o motivo da testagem ou a queixa nas palavras da pessoa.';
    complemento(motivo.closest('.module-form-grid'),'História sexual e prevenção',[
      ['ist-historia-sexual','História sexual referida',true,'Preocupações, identidade de gênero e orientação se referidas, parcerias, práticas e período das exposições.'],
      ['ist-prevencao-historico','Prevenção e antecedentes',true,'Uso de barreiras, IST e testes prévios, vacinas HPV/hepatite B e intenção reprodutiva.']
    ]);
    porId('pu-intercorrencias').placeholder='Antecedentes pré-natais, do parto e neonatais. Quando pertinentes, registre idade, raça/cor, escolaridade e condições de vida da mãe.';
    porId('hip-pa-anteriores').placeholder='Na avaliação de hipertensão, registre as medidas e respectivas datas em dias diferentes.';
    porId('hip-medicamentos').placeholder='Nome, dose e frequência das medicações em uso.';
  }
  window.EntrevistaAPS={atualizar};document.addEventListener('DOMContentLoaded',montar);
})();
