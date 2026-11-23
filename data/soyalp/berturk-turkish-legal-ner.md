# soyalp/berturk-turkish-legal-ner

## Resumen

berturk-turkish-legal-ner es un modelo de reconocimiento de entidades nombradas (NER) especializado en texto juridico turco, con enfasis en la deteccion de datos personales identificables (PII). Lo desarrolla el usuario soyalp y se distribuye como un fine-tuning del conocido `dbmdz/bert-base-turkish-cased` (BERTurk), el checkpoint BERT en turco mantenido por Stefan Schweter. El modelo resuelve un problema concreto: identificar y marcar spans sensibles (nombres de personas, organizaciones, direcciones y numeros de identidad) en documentos judiciales y expedientes redactados en turco, un dominio donde los modelos NER genericos rinden peor por la densidad de entidades y la terminologia institucional.

Arquitectura: transformer encoder BERT base con cabeza de clasificacion de tokens (token-classification). Cuenta con 110.033.673 parametros totales en formato safetensors, sin parametros activos (no es MoE). El repositorio ocupa 0,4 GB y la licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales mas alla de la atribucion.

Es relevante ahora porque la anonimizacion y el resaltado de PII en documentos legales es una tarea recurrente en despachos, administraciones y pipelines de cumplimiento normativo, y este modelo ofrece una etiqueta especifica para identificadores numericos (`ID`) con un F1 de 0,86, el punto mas fuerte del checkpoint. Aun asi, el rendimiento global es modesto (F1 micro de 0,59), por lo que debe entenderse como una herramienta asistiva y no como un sistema autonomo de redaccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (bert-base), cabeza de token-classification |
| Parametros totales | 110.033.673 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de BERT base; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precision original; cuantizacion no documentada) |
| Idiomas soportados | turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `dbmdz/bert-base-turkish-cased`, un BERT base entrenado sobre corpus en turco, y anade una capa de clasificacion de tokens para etiquetado BIO con cinco categorias: `PER` (persona), `ORG` (organizacion o empresa), `LOC` (direccion o localizacion), `ID` (numeros tipo identificador nacional o de registro) y `O` (fuera de entidad). El esquema es `B-*` / `I-*` para los spans multi-token.

No se detallan en la informacion disponible el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF, DPO u otras fases de ajuste. La model card indica explicitamente que no se incluyen documentos ni texto crudo en el repositorio, y que la evaluacion se realizo sobre un split de validacion interno (entity-level con seqeval). No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal; se trata de un fine-tuning estandar de clasificacion de tokens.

## Capacidades

- Reconocimiento de entidades nombradas en texto juridico turco con etiquetas `PER`, `ORG`, `LOC` e `ID`.
- Deteccion de identificadores numericos tipo numero de identidad nacional o de registro, con el mejor rendimiento del modelo (F1 0,86).
- Etiquetado a nivel de token con esquema BIO y soporte de agregacion de spans mediante `aggregation_strategy="simple"` en el pipeline de transformers.
- Salida compatible con el pipeline `token-classification` de Hugging Face (tag `endpoints_compatible`).
- Capacidad de resaltado y redaccion asistida de PII sobre documentos legales.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido; es un modelo exclusivamente discriminativo de etiquetado.
- Capacidad multilingue limitada al turco; no se declara soporte de otros idiomas.

## Casos de uso

- Redaccion asistida de expedientes judiciales: el modelo marca spans de PII (nombres, identificadores, direcciones) para que un revisor humano confirme y aplique la redaccion antes de publicar sentencias o autos. Es adecuado por su etiqueta `ID` especifica, aunque requiere supervision humana dada la debil precision en `LOC` y `ORG`.
- Cumplimiento de proteccion de datos en despachos: preprocesado de documentos para localizar datos personales antes de compartirlos con terceros, usando el modelo como primera pasada y validacion manual posterior.
- Anonimizacion de datasets juridicos para investigacion: etiquetado automatico de corpus turcos antes de liberarlos, con foco en la deteccion de numeros de identidad, que es el punto mas fiable del modelo.
- Enmascaramiento en pipelines de digitalizacion: integracion en flujos de OCR + NER para resaltar entidades en documentos escaneados y facilitar la revision en lote.
- Prototipado de herramientas de busqueda juridica: extraccion de entidades para indexar documentos por persona u organizacion, aceptando la menor calidad en `ORG` como candidatos a revisar.
- Investigacion en NER juridico en turco: punto de partida o baseline para experimentos de fine-tuning adicional o para comparar con modelos multilingues en el dominio legal.

## Benchmarks y rendimiento

Resultados de evaluacion sobre split de validacion interno (entity-level, seqeval), segun la model card:

| Entidad | Precision | Recall | F1 |
|---|---|---|---|
| ID | 0,81 | 0,93 | 0,86 |
| PER | 0,69 | 0,73 | 0,71 |
| ORG | 0,25 | 0,67 | 0,36 |
| LOC | 0,05 | 0,25 | 0,09 |
| micro | 0,49 | 0,73 | 0,59 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las metricas anteriores son aproximadas y proceden de un split interno no publico.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un BERT base de 110 M de parametros, cabe en torno a 0,5 GB en fp32 y aproximadamente 0,25 GB en fp16; el repositorio completo ocupa 0,4 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4090 o incluso una GPU integrada de gama alta pueden ejecutar inferencia. Para lotes grandes en servidor, A100 o H100 aportan margen pero no son necesarias.
- Cabe sobradamente en GPU consumer, incluidas tarjetas de 4 GB o menos, y puede ejecutarse en CPU con latencia aceptable para documentos individuales.
- Opciones de despliegue: transformers (pipeline `token-classification`), endpoints de Hugging Face (tag `endpoints_compatible`); el uso con vLLM, llama.cpp u Ollama no esta documentado para este checkpoint.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento NER legal turco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| soyalp/berturk-turkish-legal-ner | 110 M | no disponible | F1 micro 0,59 (split interno) | Apache 2.0 | Hugging Face |
| dbmdz/bert-base-turkish-cased | 110 M | no disponible | Modelo base sin fine-tuning NER juridico | no disponible | Hugging Face |
| Modelos NER multilingues genericos (p. ej. XLM-R base) | no disponible | no disponible | No evaluado en este dominio en la informacion disponible | no disponible | no disponible |

La comparativa con alternativas especificas de NER juridico en turco no esta disponible en la informacion proporcionada. El unico punto de referencia directo es el modelo base BERTurk, del que este checkpoint hereda arquitectura y tamano.

## Limitaciones y advertencias

- El rendimiento global es moderado (F1 micro 0,59); la entidad `LOC` es practicamente inutilizable (F1 0,09) y `ORG` tiene precision muy baja (0,25), por lo que sus salidas deben tratarse como candidatos a revision.
- Riesgo de alucinacion y de falsos positivos: la baja precision en `ORG` y `LOC` puede generar marcas erroneas que, si se aplican sin supervision, redacten informacion no sensible o dejen pasar PII real.
- Degradacion en texto fuera del dominio juridico: la model card advierte que el texto no legal puede empeorar los resultados.
- Nombres de instituciones judiciales e identificadores cortos pueden ser ruidosos.
- Limitacion idiomatica: solo turco; no se declara soporte de otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda atribuir tambien el modelo base BERTurk (Schweter, 2020) segun la citacion de la model card.
- No debe sustituir la revision humana en procesos de redaccion irreversibles; el autor lo indica explicitamente.
- No se documentan sesgos especificos ni composicion del dataset de entrenamiento, lo que dificulta auditar posibles sesgos en la deteccion de nombres o instituciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/soyalp/berturk-turkish-legal-ner
- Modelo base BERTurk: https://huggingface.co/dbmdz/bert-base-turkish-cased
- Citacion BERTurk (Schweter, 2020): DOI 10.5281/zenodo.3779844
