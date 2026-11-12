# temperate-works/pii

## Resumen

Temperate PII es un modelo de token classification (reconocimiento de entidades nombradas) especializado en la deteccion de datos personales en textos europeos. Lo desarrolla Temperate (temperate.works) y forma parte de un servicio mayor que combina el modelo con reglas deterministas por pais para localizar y validar valores estructurados como IBAN, numeros de telefono o identificadores nacionales. El modelo se encarga unicamente de las entidades no estructuradas: nombres de persona y direcciones postales.

Tecnicamente es un estudiante de 6 capas destilado de un modelo profesor de mayor tamano, construido sobre `microsoft/Multilingual-MiniLM-L12-H384`, con 107 millones de parametros. Se distribuye como ONNX con cuantizacion int8 estatica y esta pensado para ejecutarse en CPU, lo que lo hace adecuado para despliegues de bajo coste en pipelines de anonimizacion o cumplimiento normativo.

Su relevancia actual radica en el contexto regulatorio europeo (RGPD): las organizaciones necesitan detectar y enmascarar datos personales en textos multilingues, y este modelo cubre seis idiomas (ingles, neerlandes, aleman, frances, espanol e italiano) con un consumo de recursos minimo. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el modelo fue creado el 12 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (MiniLM) de 6 capas, destilado de un profesor mayor |
| Parametros totales | 107 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de inferencia de 256 tokens con solapamiento de 32 (no se especifica el maximo del modelo base) |
| Tipos de cuantizacion | int8 con cuantizacion estatica (ONNX) |
| Idiomas soportados | en, nl, de, fr, es, it |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx`), tokenizer en `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo es un transformer encoder tipo MiniLM de 6 capas con 107 millones de parametros, destilado de un profesor de mayor tamano y construido sobre `microsoft/Multilingual-MiniLM-L12-H384`. La tarea es token classification con etiquetado BIO; el servicio solo consume las etiquetas `PERSON` y `STREET_ADDRESS`, mientras que el resto de tipos de datos personales se resuelven con reglas por pais y verificacion de checksums. Se distribuye con cuantizacion int8 estatica para inferencia en CPU.

El entrenamiento se realizo sobre dos conjuntos de datos: `ai4privacy/pii-masking-openpii-1.5m` (ai4privacy, CC BY 4.0) y `Wismut/nym-pii-multilingual-data` (MIT), en los seis idiomas indicados. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (poco probables en un modelo de token classification). El tokenizer utilizado es el de `FacebookAI/xlm-roberta-base` (MIT). El servicio procesa los textos en ventanas de 256 tokens con solapamiento de 32.

## Capacidades

- Deteccion de nombres de persona en textos en ingles, neerlandes, aleman, frances, espanol e italiano.
- Deteccion de direcciones postales (calles) en los mismos seis idiomas.
- Etiquetado BIO de tokens para integracion en pipelines de NER.
- Ejecucion en CPU mediante ONNX int8, sin necesidad de GPU.
- Integracion con reglas deterministas externas para datos estructurados (IBAN, telefonos, identificadores nacionales) con verificacion de checksums, gestionadas por el servicio que lo envuelve, no por el modelo.
- Deliberadamente no marca apellidos aislados sin contexto (titulo, saludo, etiqueta o nombre completo previo) para evitar falsos positivos sobre nombres de empresas y lugares.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Anonimizacion previa a comparticion de datos: el modelo detecta nombres y direcciones en correos, contratos o facturas antes de que el texto salga de la organizacion, ejecutandose en CPU y con un coste de infraestructura minimo.
- Cumplimiento del RGPD en pipelines documentales: integrado como paso de preprocesado en flujos de ingestion de documentos, permite marcar o enmascarar datos personales no estructurados antes de almacenarlos o enviarlos a terceros.
- Enmascaramiento en registros de atencion al cliente: procesar transcripciones o tickets en varios idiomas europeos para eliminar nombres y direcciones antes de analitica o entrenamiento de otros modelos.
- Preprocesado para entrenamiento de modelos: limpiar corpus multilingues de datos personales antes de usarlos en fine-tuning, reduciendo riesgo legal y de memorizacion.
- Redaccion de documentos legales y financieros: detectar nombres y direcciones en contratos y facturas multilingues, combinando el modelo con las reglas de checksum del servicio para IBAN y numeros de identificacion.
- Despliegue en entornos con recursos limitados: al ejecutarse como ONNX int8 en CPU, encaja en contenedores pequenos, edge devices o funciones serverless donde no hay GPU disponible.
- Procesamiento por lotes de grandes volumenes: la ventana de 256 tokens con solapamiento de 32 permite trocear documentos largos de forma controlada y paralelizar la inferencia en CPU.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre su propio benchmark (2.041 textos en los seis idiomas):

| Tipo | Valores evaluados | Recall | Precision |
|---|---:|---:|---:|
| Nombres de persona | 205 | 98,0% | 96,2% |
| Direcciones postales | 275 | 100,0% | 94,2% |

Adicionalmente, sobre 26 textos de negocio escritos a mano (correos, facturas y contratos), el modelo encontro 76 de los 83 nombres y direcciones. El autor advierte que el benchmark es propio y que las cifras deben interpretarse con cautela; el repositorio de GitHub detalla la metodologia, los resultados por tipo y una comparacion con Azure AI Language. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, lo cual es esperable en un modelo de token classification.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo esta disenado para ejecutarse en CPU como ONNX int8.
- GPU recomendadas: no necesarias. Cualquier GPU moderna (A100, H100, RTX 4090) podria ejecutarlo, pero no aporta ventaja frente a CPU para este tamano.
- Cabe en CPU consumer sin problema: 107 millones de parametros en int8 ocupan del orden de 0,1 GB, coherente con el tamano del repo (0,1 GB).
- Opciones de despliegue: el servicio oficial del repositorio de GitHub con `fetch-model.sh` (descarga y verifica digests); al ser ONNX, es compatible con ONNX Runtime y otros runners ONNX. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| temperate-works/pii | 107 M | ventana de 256 tokens | 6 (en, nl, de, fr, es, it) | Apache-2.0 | ONNX int8 | Especializado en nombres y direcciones; reglas externas para datos estructurados |
| microsoft/Multilingual-MiniLM-L12-H384 | 118 M (12 capas) | no disponible | multilingue | MIT | safetensors | Modelo base; no especializado en PII |
| Azure AI Language (PII) | no disponible | no disponible | multilingue | servicio propietario | API | Comparacion mencionada por el autor en el repositorio; resultados no detallados en la informacion disponible |

No se dispone de datos de rendimiento comparativo detallados frente a Azure AI Language en la informacion proporcionada; el autor remite al repositorio de GitHub para esa comparacion.

## Limitaciones y advertencias

- El benchmark es propio del autor (2.041 textos y 26 textos de negocio), por lo que las cifras de recall y precision pueden no generalizar a otros dominios o estilos de escritura.
- El modelo solo detecta nombres de persona y direcciones; el resto de tipos de PII depende de reglas externas del servicio, no del modelo.
- Los apellidos aislados se ignoran deliberadamente cuando no hay contexto que indique que se refieren a una persona, lo que puede producir falsos negativos en textos muy telegraficos.
- Riesgo de alucinacion y falsos positivos inherente a la clasificacion de tokens; la precision del 94,2% en direcciones implica un porcentaje no trivial de marcas incorrectas.
- Cobertura limitada a seis idiomas europeos; no se garantiza comportamiento en otros idiomas ni en variantes dialectales.
- No se documentan sesgos especificos, pero al entrenarse sobre datasets de PII en dominios concretos puede tener sesgos de dominio y de origen de los datos.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base es MIT y los datasets tienen sus propias licencias (CC BY 4.0 y MIT); conviene revisar las obligaciones de atribucion de los datasets.
- La ventana de 256 tokens con solapamiento de 32 implica procesar documentos largos por trozos; entidades que crucen los limites de ventana podrian perderse.
- Proyecto con 0 descargas y 0 likes en Hugging Face en el momento de la consulta: madurez y soporte comunitario limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/temperate-works/pii
- Repositorio del servicio: https://github.com/temperate-works/pii
- Sitio del autor: https://temperate.works
- Modelo base: https://huggingface.co/microsoft/Multilingual-MiniLM-L12-H384
- Tokenizer: https://huggingface.co/FacebookAI/xlm-roberta-base
- Dataset ai4privacy: https://huggingface.co/datasets/ai4privacy/pii-masking-openpii-1.5m
- Dataset Wismut: https://huggingface.co/datasets/Wismut/nym-pii-multilingual-data
