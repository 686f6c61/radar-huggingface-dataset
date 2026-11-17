# woodrock/tumataiti-deberta-v3-small-open

## Resumen

Tūmataiti DeBERTa-v3-small (open data) es un clasificador de tokens especializado en la deteccion y redaccion de informacion personal identificable (PII) en textos en ingles y en neozelandes, incluyendo te reo maori. Lo desarrolla woodrock como componente principal de Tūmataiti, una herramienta local de redaccion que elimina datos personales antes de enviar texto a un modelo de IA en la nube. El modelo esta afinado a partir de microsoft/deberta-v3-small y cuenta con 141.320.469 parametros, con un checkpoint fp32 para Transformers y una version cuantizada int4 en ONNX de 152 MB que se ejecuta en CPU de portatil en unos 30 ms por documento.

La relevancia del modelo reside en su enfoque en privacidad diferencial: corre en el dispositivo del usuario, de modo que el texto nunca abandona la maquina, y cubre un nicho poco atendido como son los nombres maories, pasifikas y asiatico-neozelandeses, asi como las afiliaciones (iwi, hapu, marae, maunga, awa, waka y tupuna dentro de un pepeha). Se combina con reglas en Rust para identificadores con digito de control (IRD, NHI, tarjetas) que el modelo por si solo no detecta de forma fiable.

El modelo se distribuye bajo licencia Apache-2.0, soporta los idiomas en y mi, y esta pensado para integrarse en pipelines de token-classification mediante la libreria transformers o mediante ONNX Runtime. Su tamano reducido y su formato cuantizado lo hacen adecuado para despliegues en el borde (edge) y en navegador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3-small), token classification |
| Parametros totales | 141.320.469 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens por ventana (el decodificador de Tūmataiti usa ventanas de 512 con 128 de solapamiento) |
| Tipos de cuantizacion | fp32 (checkpoint Transformers), int4 con embeddings int8 (ONNX Runtime) |
| Idiomas soportados | en, mi |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un encoder Transformer DeBERTa-v3-small afinado para token-classification con etiquetas BIO sobre las categorias PERSON, ADDRESS, EMAIL, PHONE, URL, IP_ADDRESS, DATE (solo fechas de nacimiento o defuncion), ID (numeros de gobierno, tarjeta y banco), SECRET (contrasenas y claves) y AFFILIATION (iwi, hapu, marae y, en un pepeha, maunga, awa, moana, waka, wharenui y tupuna). El checkpoint fp32 se ofrece para Transformers y existe una version ONNX con embeddings int8 y encoder cuantizado int4 en bloques de 32 pesos por escala con activaciones fp32, pensada para ONNX Runtime.

El entrenamiento parte de microsoft/deberta-v3-small (MIT) durante 3 epocas con lr 5e-5, batch 16 y semilla 0, conservando el checkpoint tras la primera epoca, que obtuvo la mejor puntuacion de validacion. Se usaron 38.000 documentos sinteticos: 8.000 del conjunto Tūmataiti NZ synthetic v4 generados por plantillas (notas de hui, derivaciones, formularios, entrevistas, mensajes, chats, actas, pepeha en te reo y en ingles, notas de whakapapa) con nombres extraidos al 25% de listas maories, pakeha, pasifikas y asiatico-neozelandesas; 20.000 documentos de nvidia/Nemotron-PII (CC BY 4.0) con etiquetas remapeadas; y 10.000 documentos de gretelai/gretel-pii-masking-en-v1 (Apache-2.0) con coincidencia exacta por limites de palabra. No se uso PII-Masking-300k en el entrenamiento. El decodificador propio de Tūmataiti divide texto largo en ventanas de 512 tokens con 128 de solapamiento, conserva un token cuando P(no O) >= 0.5, ensancha los spans a palabras completas y descarta spans que son solo etiquetas de campo como "NHI".

## Capacidades

- Deteccion de entidades nombradas de tipo PERSON, ADDRESS, EMAIL, PHONE, URL e IP_ADDRESS en texto en ingles y en neozelandes.
- Deteccion de fechas de nacimiento o defuncion en contexto (etiqueta DATE restringida).
- Deteccion de identificadores de gobierno, tarjeta y banco (etiqueta ID), complementando reglas con digito de control.
- Deteccion de contrasenas y claves (etiqueta SECRET).
- Deteccion de afiliaciones maories: iwi, hapu, marae y, dentro de un pepeha, maunga, awa, moana, waka, wharenui y tupuna.
- Cobertura de nombres maories, pakeha, pasifikas y asiatico-neozelandeses.
- Ejecucion local en dispositivo y en navegador mediante ONNX (int4), sin envio de texto a la nube.
- Integracion como pipeline de token-classification en transformers con aggregation_strategy="simple".
- No dispone de tool calling, function calling, agentes, vision ni audio segun la informacion disponible.

## Casos de uso

- Redaccion previa a envio a un modelo en la nube: Tūmataiti usa este modelo para eliminar nombres, direcciones, telefonos y afiliaciones antes de que el texto salga del dispositivo, reduciendo la exposicion de datos personales en flujos con LLM de terceros.
- Cumplimiento de privacidad en documentos sanitarios o administrativos neozelandeses: el modelo detecta NHI, IRD y numeros de tarjeta junto con nombres y direcciones en notas de derivacion y formularios, donde las reglas por si solas no cubren el texto libre.
- Anonimizacion de notas de hui y actas: el modelo identifica personas y afiliaciones (iwi, hapu, marae, tupuna) en textos en te reo y en ingles, lo que permite publicar actas sin exponer informacion genealogica o de afiliacion.
- Procesamiento en navegador sin backend: la demo en woodrock.github.io/tumataiti ejecuta la version int4 en el navegador, adecuada para herramientas de redaccion donde el usuario no quiere que el texto abandone la pagina.
- Enmascarado de datos en pipelines de datos estructurados y logs: aunque el rendimiento es mas debil en JSON y HTML que en prosa, el modelo puede integrarse en etapas de preprocesado para marcar campos con PII antes de almacenar o compartir registros.
- Deteccion de secretos en texto libre: la etiqueta SECRET permite localizar contrasenas y claves embebidas en mensajes o documentacion antes de reenviar contenido a servicios externos.
- Filtrado en aplicaciones de mensajeria y chat: con 30 ms por documento en CPU de portatil, el modelo puede aplicarse en tiempo real sobre mensajes entrantes para redactar datos personales antes de persistirlos.

## Benchmarks y rendimiento

Resultados publicados por el autor. La tasa de fuga por documento es la proporcion de documentos en los que al menos un dato personal queda sin redactar; el modelo se evalua sin las reglas.

| Conjunto de prueba | Documentos | Fuga fp32 | Fuga int4 | Precision de caracteres int4 | Fuga del teacher |
|---|---:|---:|---:|---:|---:|
| NZ sintetico, plantillas, nombres y afiliaciones reservados | 2.750 | 2,3% | 2,2% | 94,8 | 66,6% |
| NZ sintetico, nombres y afiliaciones reservados | 2.300 | 0,1% | 0,1% | 100,0 | 64,5% |
| Nemotron-PII + Gretel-en test | 2.000 | 3,9% | 3,6% | 99,0 | 40,0% |
| PII-Masking-300k, validacion en ingles | 7.946 | 35,1% | 33,9% | 95,0 | 8,2% |

El teacher es openai/privacy-filter en su punto de operacion por defecto. En la primera fila, 57 de los 60 documentos con fuga del modelo int4 corresponden a un unico nombre de waka reservado, Māhuhu-ki-te-rangi, cuya ultima palabra no detecta.

Nombres por comunidad (mismos documentos reservados, solo cambiando los nombres; porcentaje de nombres y de afiliaciones sin redactar):

| Nombres | Nombres, fp32 | Nombres, int4 | Afiliaciones, int4 |
|---|---:|---:|---:|
| Maori | 0,1% | 0,1% | 0,8% |
| Pakeha | 0,1% | 0,1% | 1,1% |
| Pasifika | 0,0% | 0,0% | 1,1% |
| Asian NZ | 0,0% | 0,0% | 0,9% |

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint fp32 ocupa aproximadamente 565 MB en memoria (141,3 M parametros a 4 bytes); la version int4 ONNX pesa 152 MB en disco y requiere bastante menos memoria, aunque el dato exacto de VRAM no esta disponible.
- GPU recomendadas: no se especifican; por tamano, cualquier GPU consumer con 2 GB o mas de VRAM puede alojar el modelo fp32, y la version int4 cabe en CPU.
- Cabe en GPU consumer: si, en cualquier GPU consumer moderna; el autor indica ejecucion en CPU de portatil a unos 30 ms por documento con la version int4.
- Opciones de despliegue: transformers (pipeline token-classification), ONNX Runtime (modelo int4), y el decodificador propio de Tūmataiti en Python y en Rust para navegador.
- Latencia y throughput: aproximadamente 30 ms por documento en CPU de portatil con int4 segun el autor; no se publican cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| woodrock/tumataiti-deberta-v3-small-open | 141,3 M | 512 tokens por ventana | PII en en y mi, con afiliaciones maories | apache-2.0 | Hugging Face, ONNX, demo en navegador |
| openai/privacy-filter | no disponible | no disponible | PII general en ingles (usado como teacher) | no disponible en la informacion | Hugging Face |
| microsoft/deberta-v3-small | no disponible | no disponible | Modelo base encoder, sin fine-tuning de PII | MIT | Hugging Face |

No se dispone de datos de benchmarks comparativos directos mas alla de la tasa de fuga frente al teacher openai/privacy-filter recogida en la seccion anterior.

## Limitaciones y advertencias

- Todos los conjuntos de prueba son sinteticos: los conjuntos neozelandeses provienen del mismo generador que los datos de entrenamiento, con plantillas y nombres reservados, por lo que miden generalizacion dentro de ese generador. El autor planea un conjunto de prueba anotado por humanos; hasta entonces, las cifras deben tratarse como cota superior del rendimiento real.
- La fuga en PII-Masking-300k es alta (34%), en parte por convenciones de etiquetado de ese conjunto (cualquier fecha en un campo JSON como fecha de nacimiento, numeros de edificio y codigos postales como direcciones, cadenas inusuales como contrasenas). Se esperan resultados mas debiles en datos estructurados (JSON, HTML) que en prosa.
- Nombres de afiliacion largos y con guiones, como el waka Māhuhu-ki-te-rangi, pueden quedar parcialmente sin redactar.
- El modelo esta limitado a ingles y te reo maori; no cubre otros idiomas.
- La ventana de contexto es de 512 tokens por ventana, con solapamiento gestionado por el decodificador externo; textos muy largos dependen de esa logica de ventaneo.
- Riesgo de alucinacion de spans: el decodificador filtra spans que son solo etiquetas de campo, pero el modelo puede marcar falsos positivos o negativos en texto no representado en el entrenamiento.
- Licencia Apache-2.0: permite uso comercial, pero los datos de entrenamiento de terceros (Nemotron-PII bajo CC BY 4.0 y Gretel bajo Apache-2.0) imponen sus propias condiciones de atribucion.
- No se han publicado resultados de sesgos mas alla del desglose por comunidad de nombres; el rendimiento en nombres fuera de las listas de entrenamiento no esta medido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/woodrock/tumataiti-deberta-v3-small-open
- Repositorio Tūmataiti: https://github.com/woodRock/tumataiti
- Decodificador Python: https://github.com/woodRock/tumataiti/blob/main/ml/src/tumataiti_ml/student/encode.py
- Demo en navegador: https://woodrock.github.io/tumataiti/
- Modelo base: https://huggingface.co/microsoft/deberta-v3-small
- Dataset Nemotron-PII: https://huggingface.co/datasets/nvidia/Nemotron-PII
- Dataset Gretel PII masking: https://huggingface.co/datasets/gretelai/gretel-pii-masking-en-v1
- Modelo teacher: https://huggingface.co/openai/privacy-filter
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
