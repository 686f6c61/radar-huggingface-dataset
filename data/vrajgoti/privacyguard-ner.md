# VrajGoti/privacyguard-ner

## Resumen

PrivacyGuard-NER es un modelo de clasificacion de tokens (token classification) especializado en la deteccion de informacion personal identificable (PII, Personally Identifiable Information). Lo desarrolla el usuario VrajGoti y esta afinado a partir de `distilbert-base-uncased`, un encoder transformer destilado de 66.388.257 parametros (unos 66M). Su objetivo es identificar 16 categorias de datos sensibles en texto en ingles, incluyendo tanto identificadores internacionales (correo, telefono, tarjeta de credito, IP) como especificos de la India (Aadhaar, PAN), para permitir su redaccion o anonimizacion antes de enviar texto a otros sistemas.

El modelo resuelve un problema muy concreto en pipelines de IA: evitar que datos personales acaben en entradas de LLM, bases de conocimiento RAG o bases de datos de atencion al cliente. Frente a alternativas generativas, apuesta por un encoder pequeno y rapido que puede ejecutarse en CPU con una latencia media de 17,02 ms por texto, lo que lo hace viable para filtrado en tiempo real en guardrails y capas de saneamiento.

Es relevante por su enfoque de eficiencia: con 66M de parametros y 253,95 MB en safetensors, ofrece deteccion de PII a bajo coste computacional y con licencia Apache 2.0, lo que facilita su integracion en entornos de produccion sin dependencia de infraestructura GPU. El checkpoint esta publicado en HuggingFace y el autor distribuye ademas una libreria Python (`privacyguard`) para deteccion y redaccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT), `DistilBertForTokenClassification` |
| Parametros totales | 66.388.257 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Otros datos relevantes: numero de etiquetas 33 (esquema BIO para 16 clases de entidad mas la clase `O`), tamano del modelo 253,95 MB en safetensors y tamano del repositorio 1,6 GB. Fuente del dataset declarada: `synthetic`. Metricas declaradas: F1, precision y recall.

## Arquitectura y entrenamiento

El modelo es un encoder transformer basado en `distilbert-base-uncased`, con una cabeza de clasificacion de tokens. DistilBERT es una version destilada de BERT que reduce el numero de capas y parametros manteniendo gran parte de la capacidad, lo que da lugar a un modelo de unos 66M de parametros. La tarea es token classification con esquema de etiquetado BIO (Begin-Inside-Outside) para 16 tipos de entidad, dando un total de 33 etiquetas.

El entrenamiento se realizo sobre un dataset sintetico generado de forma determinista y balanceada, con un total de 3.000 muestras y validacion estricta de fronteras de entidad: 2.100 para entrenamiento, 450 para validacion y 450 para test. La estrategia de etiquetado alinea subwords clasificando el primer token y aplicando mascara `-100` sobre los subword tokens posteriores, para evitar sesgo en el calculo de la perdida de entropia cruzada. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion adicionales. La model card no detalla el numero total de tokens de entrenamiento ni la composicion exacta de las plantillas sinteticas.

## Capacidades

- Deteccion de 16 categorias de PII en texto en ingles: PERSON, EMAIL, PHONE, ADDRESS, LOCATION, ORGANIZATION, DATE_OF_BIRTH, CREDIT_CARD, BANK_ACCOUNT, PAN (identificador fiscal indio), AADHAAR, PASSPORT, IP_ADDRESS, USERNAME, URL y EMPLOYEE_ID.
- Clasificacion de tokens a nivel de entidad con esquema BIO, apta para extraccion de spans exactos.
- Redaccion de texto: la libreria `privacyguard` permite sustituir entidades por su etiqueta (modo `label`), por ejemplo `Contact [PERSON] at [EMAIL]`.
- Uso mediante pipeline estandar de HuggingFace `token-classification` con `aggregation_strategy="simple"`.
- Soporte de identificadores internacionales y especificos de la India (Aadhaar, PAN), ademas de datos corporativos y financieros.
- Ejecucion en CPU sin GPU, con latencia verificada de milisegundos.
- Compatibilidad verificada con ONNX Runtime (paridad exacta de logits respecto a PyTorch).
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, vision ni audio, coherente con su naturaleza de encoder de clasificacion.

## Casos de uso

- Saneamiento de entradas hacia LLM: interceptar el prompt del usuario y redactar PII antes de enviarlo a un modelo generativo, reduciendo el riesgo de filtracion de datos personales a servicios externos.
- Filtrado de salidas de LLM: aplicar el detector sobre la respuesta generada para eliminar datos personales que el modelo pudiera haber reproducido, como telefono o correo.
- Guardrails en atencion al cliente: procesar conversaciones multi-turno y anonimizar nombres, correos o identificadores antes de almacenarlas o analizarlas.
- Saneamiento de bases de conocimiento RAG: limpiar documentos antes de indexarlos para evitar que PII quede embebida en el almacen vectorial y se recupere en respuestas futuras.
- Cumplimiento y auditoria de datos: localizar campos con PII en grandes volumenes de texto para su etiquetado, inventario o eliminacion conforme a normativas de privacidad.
- Deteccion de datos financieros y de identidad: identificar tarjetas de credito, cuentas bancarias, Aadhaar, PAN o pasaportes en registros para su enmascaramiento previo a tratamiento.
- Anonimizacion de logs y trazas: extraer IP, nombre de usuario o identificadores de empleado de registros tecnicos antes de compartirlos con terceros.
- Preprocesamiento en pipelines de CI/CD de datos: integrar el modelo como paso de validacion que detecte fugas de PII en datasets de test o fixtures antes de su publicacion.

## Benchmarks y rendimiento

Metricas cuantitativas declaradas sobre el conjunto de test reservado (450 muestras, 955 entidades):

| Metrica global | Valor |
|---|---|
| Precision | 0,9990 |
| Recall | 0,9990 |
| F1-Score | 0,9990 |

Resultados por tipo de entidad:

| Entidad | Precision | Recall | F1-Score | Soporte |
|---|---|---|---|---|
| AADHAAR | 1,0000 | 1,0000 | 1,0000 | 51 |
| ADDRESS | 1,0000 | 1,0000 | 1,0000 | 40 |
| BANK_ACCOUNT | 1,0000 | 1,0000 | 1,0000 | 34 |
| CREDIT_CARD | 1,0000 | 1,0000 | 1,0000 | 36 |
| DATE_OF_BIRTH | 1,0000 | 1,0000 | 1,0000 | 34 |
| EMAIL | 1,0000 | 1,0000 | 1,0000 | 108 |
| EMPLOYEE_ID | 1,0000 | 1,0000 | 1,0000 | 31 |
| IP_ADDRESS | 1,0000 | 1,0000 | 1,0000 | 44 |
| LOCATION | 1,0000 | 1,0000 | 1,0000 | 49 |
| ORGANIZATION | 1,0000 | 1,0000 | 1,0000 | 73 |
| PAN | 1,0000 | 1,0000 | 1,0000 | 55 |
| PASSPORT | 1,0000 | 1,0000 | 1,0000 | 42 |
| PERSON | 1,0000 | 1,0000 | 1,0000 | 209 |
| PHONE | 1,0000 | 1,0000 | 1,0000 | 79 |
| URL | 1,0000 | 1,0000 | 1,0000 | 29 |
| USERNAME | 0,9756 | 0,9756 | 0,9756 | 41 |

Benchmarks empiricos en CPU (hardware: Intel x86_64, Windows, PyTorch 2.12 CPU):

| Escenario | Latencia / rendimiento |
|---|---|
| Texto unico (media) | 17,02 ms |
| Texto unico (p50) | 16,28 ms |
| Texto unico (minimo) | 14,02 ms |
| Lote de 8 (por texto) | 9,88 ms |
| Lote de 8 (por lote) | 79,06 ms |
| Throughput | 58,74 textos/segundo |
| ONNX Runtime (texto unico) | 17,82 ms |

No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval o GSM8K, que por otra parte no aplican a un modelo de clasificacion de tokens.

## Requisitos de hardware

- Inferencia en CPU perfectamente viable: el autor reporta 17,02 ms de media por texto y 58,74 textos por segundo en un equipo Intel x86_64, sin GPU.
- VRAM estimada en GPU: aproximadamente 0,3 GB en fp32 (pesos de 253,95 MB mas activaciones) y alrededor de 0,15-0,2 GB en fp16. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada. Cualquier GPU moderna (RTX 3060, RTX 4090, A100, H100) ejecutaria el modelo sin limitacion de memoria; una GPU solo aporta ventaja en lotes muy grandes o altas tasas de peticiones.
- Cabe en GPU consumer: si, en cualquier modelo con al menos 1 GB de VRAM efectiva, e incluso en sistemas integrados.
- Opciones de despliegue: pipeline `token-classification` de HuggingFace Transformers, la libreria `privacyguard` del autor y ONNX Runtime (con paridad verificada de logits respecto a PyTorch). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos.
- Latencia y throughput: los datos reportados se limitan al entorno CPU/ONNX descrito arriba; no se proporcionan mediciones en GPU.

## Comparativa con modelos similares

No se proporcionan en la informacion disponible resultados de benchmarks frente a modelos comparables, por lo que la comparacion de rendimiento queda como "no disponible". A continuacion se ofrece una comparacion cualitativa de categoria:

| Modelo | Tipo | Parametros | Idiomas | Enfoque | Licencia | Rendimiento comparado |
|---|---|---|---|---|---|---|
| PrivacyGuard-NER | Encoder DistilBERT para token classification | 66,4M | en | 16 clases de PII, con foco en India | Apache 2.0 | F1 0,9990 en su test sintetico |
| Modelos NER genericos tipo BERT (por ejemplo, `dslim/bert-base-NER`) | Encoder para token classification | no disponible | en | Entidades generales (PER, ORG, LOC, MISC) | no disponible | no disponible |
| Herramientas de deteccion de PII basadas en reglas/patrones (por ejemplo, Presidio) | Sistema hibrido de reglas y NER | no aplica | multiidioma | PII mediante expresiones regulares y validadores | no disponible | no disponible |
| Modelos NER multilingues tipo XLM-R | Encoder para token classification | no disponible | multiidioma | Entidades generales o PII | no disponible | no disponible |

La ventaja diferencial declarada de PrivacyGuard-NER es la combinacion de tamano reducido, latencia en CPU y cobertura especifica de identificadores indios (Aadhaar, PAN) junto a identificadores internacionales.

## Limitaciones y advertencias

- Datos de entrenamiento sinteticos: el dataset se genero con plantillas para eliminar riesgos de privacidad. El rendimiento en jerga de dominio especifico puede requerir un ajuste fino adicional, y las metricas de F1 cercanas a 1,0 deben interpretarse con cautela al proceder de un test tambien sintetico y con la misma distribucion que el entrenamiento.
- Riesgo de sobreajuste al formato sintetico: al evaluarse sobre datos generados de la misma forma que el entrenamiento, los resultados de 0,9990 no garantizan un rendimiento equivalente en texto real, donde la variabilidad de formatos es mucho mayor.
- Alcance de idioma: el checkpoint esta validado unicamente en ingles (con identificadores internacionales e indios). No cubre hindi, hinglish, tamil ni telugu; el autor indica que un modelo basado en `xlm-roberta-base` esta en hoja de ruta.
- Dependencia del contexto: acronimos muy ambiguos o cadenas cortas pueden producir falsos positivos o falsos negativos segun la frase.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo no genera texto; el riesgo equivalente es la clasificacion erronea de spans.
- Longitud de contexto: no documentada; los textos muy largos pueden requerir troceado.
- Tipos de cuantizacion: no documentados; solo se confirma compatibilidad con ONNX Runtime.
- La model card original aparece truncada en la seccion "Limitations & Ethical Considerations" (punto 4, "Security"), por lo que no se dispone del contenido completo de las advertencias del autor.
- Licencia Apache 2.0: permite uso comercial y modificacion, con obligacion de conservar el aviso de licencia y de copyright.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VrajGoti/privacyguard-ner
- Libreria `privacyguard` (referenciada en la model card, usada para deteccion y redaccion): no se proporciona URL en la informacion disponible
- Paper o informe tecnico: no disponible
- Repositorio de codigo adicional: no disponible
- Demo o espacio interactivo: no disponible
