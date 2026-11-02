# Vemployee/miiq-intent-e5-small

## Resumen

`miiq-intent-e5-small` es un clasificador de texto especializado en detectar la intencion de recuperacion (retrieval intent) de consultas dirigidas a un asistente de base de conocimiento empresarial. Lo desarrolla Vemployee y se construye mediante fine-tuning completo de `intfloat/multilingual-e5-small`, un encoder BERT multilingue de aproximadamente 118 millones de parametros. El modelo resuelve un problema concreto de enrutamiento: dado un mensaje de chat, decidir a cual de 14 intenciones pertenece (busqueda exacta, comprobacion de cumplimiento, comparacion, calculo aritmetico, procedimiento, resumen, mensajes sociales, fuera de tema, etc.) para que el asistente elija la estrategia de busqueda adecuada sobre sus documentos.

La relevancia practica esta en que separa la clasificacion de intencion del modelo generativo principal, lo que permite enrutar consultas con una latencia muy baja (unos 23 ms por consulta en cuatro hilos de CPU) y sin coste de GPU. Esta entrenado especificamente con consultas en ingles y arabe sobre dominios de recursos humanos, finanzas, TI, compras, contratos, seguridad y equipamiento, ademas de preguntas sobre ficheros propios del usuario.

Se distribuye con licencia MIT, el encoder en media precision y la cabeza lineal en un fichero JSON independiente (`intent_head.json`), lo que facilita su integracion en pipelines existentes sin depender del formato completo de Transformers para la capa de clasificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base: `intfloat/multilingual-e5-small`) con cabeza lineal de clasificacion |
| Parametros totales | 117.653.760 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; el encoder se publica en media precision (fp16) |
| Idiomas soportados | ingles (en), arabe (ar) |
| Licencia | MIT |
| Formato de pesos | safetensors (encoder) + `intent_head.json` (clases, coeficientes e intercept) |
| Tarea | text-classification (14 clases de intencion) |
| Tamano del repositorio | 0,3 GB |
| Modelo base | intfloat/multilingual-e5-small |

## Arquitectura y entrenamiento

El modelo parte de `intfloat/multilingual-e5-small`, un encoder Transformer de la familia BERT orientado a embeddings multilingues. Sobre ese encoder se anade una capa lineal de clasificacion y se realiza un fine-tuning extremo a extremo con perdida de entropia cruzada durante 4 epocas. El pipeline de inferencia es explicito: se prefija la consulta con `"query: "`, se aplica mean-pooling de la ultima capa oculta enmascarada por la attention mask, se normaliza L2 y se aplica `softmax(coef · x + intercept)` usando la cabeza guardada en JSON.

Los datos de entrenamiento son 842 consultas en ingles y arabe redactadas especificamente a partir de una guia de etiquetado, con asistencia de IA. Cubren preguntas laborales sobre documentos de recursos humanos, finanzas, TI, compras, contratos, seguridad y equipamiento, preguntas sobre ficheros subidos por el propio usuario, mensajes sociales y peticiones fuera de tema. No se utilizaron datos de usuarios reales. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion adicionales; se trata de un ajuste supervisado clasico sobre un conjunto pequeno y curado.

## Capacidades

- Clasificacion de consultas de chat en 14 intenciones de recuperacion: `exact_lookup`, `term_search`, `compliance_check`, `explanation`, `comparison`, `computation`, `reasoning`, `procedural`, `summarization`, `greeting`, `thanks`, `farewell`, `chitchat` y `off_topic`.
- Distincion entre consultas sustantivas sobre documentos y mensajes sociales o fuera de tema, lo que permite al asistente omitir la busqueda cuando no procede.
- Soporte bilingue ingles-arabe para las mismas categorias de intencion.
- Deteccion de consultas sobre ficheros propios del usuario frente a consultas sobre la base de conocimiento de la organizacion.
- Inferencia de baja latencia en CPU (unos 23 ms por consulta en cuatro hilos), adecuada para preprocesado en linea.
- No soporta generacion de texto, tool calling, razonamiento multi-paso, vision ni audio: es exclusivamente un clasificador.

## Casos de uso

- Enrutamiento de consultas en asistentes de base de conocimiento: el clasificador recibe el mensaje del usuario y decide si debe lanzarse una busqueda exacta, semantica, una comparacion entre documentos o un calculo, seleccionando la herramienta de recuperacion adecuada antes de invocar al modelo generativo.
- Filtrado de mensajes sociales y fuera de tema: `greeting`, `thanks`, `farewell`, `chitchat` y `off_topic` permiten responder sin coste de recuperacion o derivar a un flujo distinto, reduciendo llamadas innecesarias al modelo grande.
- Cumplimiento normativo interno: la clase `compliance_check` identifica preguntas del tipo "esta permitido", "es obligatorio" o "esta cubierto", que pueden enrutarse a un motor de reglas o a un recuperador sobre politicas y contratos.
- Atencion al empleado en RR. HH. y finanzas: consultas sobre vacaciones, gastos, nominas o procedimientos se clasifican como `exact_lookup`, `procedural` o `explanation` para aplicar la estrategia de busqueda correcta sobre los manuales internos.
- Asistentes sobre documentos del propio usuario: la evaluacion especifica del autor incluye preguntas sobre ficheros subidos, de modo que el modelo puede separar ese flujo del de la base de conocimiento corporativa.
- Preprocesado en pipelines RAG: al ser un encoder de 118 M de parametros con latencia de decenas de milisegundos en CPU, puede ejecutarse como etapa previa en cada turno de conversacion sin desplazar carga a GPU.
- Analitica de consultas: la distribucion de intenciones permite medir que tipo de preguntas recibe el asistente y priorizar la mejora de los recuperadores correspondientes.

## Benchmarks y rendimiento

| Conjunto de evaluacion | Consultas | Precision global | Ingles / Arabe |
|---|---|---|---|
| Held-out redactado aparte del entrenamiento | 243 | 93 % | 93 % / 92 % |
| Held-out sobre ficheros del usuario, con contrastes sobre el asistente | 97 | 88 % | 95 % / 76 % |
| Consultas reales recogidas en pruebas internas | 82 | 80 % | no disponible |

Latencia mediana declarada: aproximadamente 23 ms por consulta en cuatro hilos de CPU. No se publican resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) porque el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp16 (117,6 M de parametros); en torno a 0,25-0,5 GB en fp32 o cuantizado a int8.
- Cabe holgadamente en cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) e incluso en CPU sin GPU dedicada.
- GPU recomendadas: no requiere GPU; para alto throughput, una T4, L4 o cualquier GPU con al menos 2 GB de memoria es suficiente.
- Opciones de despliegue: Transformers con PyTorch, ONNX Runtime, TorchScript, o exportacion a formatos GGUF/llama.cpp si se convierte el encoder. La cabeza lineal en JSON debe aplicarse por separado tras el pooling y la normalizacion L2.
- Latencia y throughput: alrededor de 23 ms por consulta en cuatro hilos de CPU segun el autor; en GPU el coste por consulta es marginal y el throughput depende del batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vemployee/miiq-intent-e5-small | 117,6 M | no disponible | Clasificacion de intencion (14 clases, en/ar) | MIT | HuggingFace |
| intfloat/multilingual-e5-small (base) | 117,6 M | no disponible | Embeddings multilingues | MIT | HuggingFace |
| Clasificadores de intencion genericos (p. ej. fine-tunes de BERT/DistilBERT) | 66-110 M tipico | no disponible | Clasificacion de intencion generica | variable | HuggingFace |

La comparacion cuantitativa con alternativas no esta disponible en la informacion proporcionada; el modelo base y los fine-tunes genericos no publican metricas equiparables sobre este esquema de 14 intenciones.

## Limitaciones y advertencias

- Varias intenciones se solapan por naturaleza (por ejemplo `exact_lookup` y `computation`), y las etiquetas siguen una guia de etiquetado concreta; consultas ambiguas pueden clasificarse de forma discutible.
- La muestra de consultas reales es pequena (82 consultas) y la precision cae al 80 % en ese conjunto frente al 93 % en held-out.
- El rendimiento en arabe sobre preguntas relativas a ficheros del usuario baja al 76 %, frente al 95 % en ingles; el modelo es mas fragil en ese subconjunto.
- Esta ajustado para asistentes de base de conocimiento laboral y no se ha evaluado en otros dominios; su uso fuera de ese contexto no esta validado.
- Riesgo de alucinacion no aplicable en sentido estricto (no genera texto), pero si de falsos positivos y negativos en la clasificacion, que pueden provocar enrutamientos erroneos en produccion.
- Entrenado solo con ingles y arabe; no se declara soporte para castellano ni otros idiomas.
- Licencia MIT: permite uso comercial y modificacion, pero conviene verificar las condiciones del modelo base `intfloat/multilingual-e5-small`, tambien MIT.
- El encoder se distribuye en media precision y la cabeza en JSON; la integracion requiere replicar exactamente el prefijo `"query: "`, el mean-pooling, la normalizacion L2 y la formula `softmax(coef · x + intercept)` para obtener resultados comparables a los reportados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Vemployee/miiq-intent-e5-small
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
