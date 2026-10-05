# SporeLabs/scrub

## Resumen

SporeLabs Scrub es un modelo de clasificacion de tokens (token-classification) especializado en deteccion y redaccion de datos personales (PII) y credenciales en texto. Lo desarrolla SporeLabs y se publica bajo licencia Apache 2.0. No es un modelo generativo: recibe texto y devuelve, para cada mencion detectada, sus offsets de inicio y fin y una etiqueta de tipo (PERSON, PHONE, EMAIL, PASSWORD, AWS_KEY, etc.).

El modelo se construye sobre el encoder Ettin 17M de Johns Hopkins University (jhu-clsp/ettin-encoder-17m), afinado con una salida por tipo y por token, y se combina con un motor de reglas que tiene precedencia para todo lo que tiene formato reconocible (claves de proveedor, tokens, numeros de tarjeta, emails). El resultado es un sistema de 17M de parametros mas reglas, con un peso en disco de 0,2 GB, capaz de ejecutarse en un solo hilo de CPU de portatil con una latencia aproximada de 2 ms por mensaje de chat.

Su relevancia practica esta en el coste y la latencia: ofrece deteccion de secretos y identificadores directos con precision declarada de 0,810 y una tasa de falsos positivos sobre valores no sensibles (look-alikes) del 9,4 %, compitiendo en el benchmark propio del autor con sistemas mucho mayores, como OpenAI Privacy Filter (1,4B) o GLiNER2-PII (307M). Se distribuye como paquete Python sobre ONNX Runtime, como CLI y como API alojada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (Ettin 17M) con cabeza de clasificacion de tokens multi-etiqueta, una salida por tipo y por token, mas motor de reglas |
| Parametros totales | 17M (modelo) + reglas deterministas |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos ONNX y safetensors; no se detallan variantes cuantizadas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (onnxruntime) y safetensors |

## Arquitectura y entrenamiento

La base es el encoder Ettin 17M de Johns Hopkins University (licencia MIT), un transformer encoder afinado para clasificacion de tokens con una salida independiente por cada tipo de entidad y token, en lugar de una unica etiqueta por token. El umbral de decision de cada tipo se ajusta por separado sobre datos de validacion. Sobre el modelo se anade una capa de reglas que resuelve todo lo que tiene un formato identificable (claves de proveedor, tokens, numeros de tarjeta validados con Luhn, IBANs, emails, codigos precedidos por una palabra clave); las reglas tienen precedencia sobre el modelo, que se encarga de lo que no tiene formato, como nombres y direcciones. Ademas, un valor detectado una vez se propaga a todas sus repeticiones en el texto.

El entrenamiento partio de texto escrito por personas extraido de fuentes publicas: conversaciones de WildChat, mensajes SMS, peticiones habladas a asistentes en nueve idiomas (MASSIVE), respuestas de foro de OpenAssistant y codigo abierto con sus plantillas de mensajes. A esto se sumaron dos conjuntos sinteticos publicos de PII, NVIDIA Nemotron-PII y Gretel PII masking. La metodologia consistio en localizar los datos personales ya presentes con las reglas propias y GLiNER2, sustituir cada uno por un valor generado del mismo tipo (un nombre por un nombre, un telefono con formato valido por un telefono) y etiquetar el resultado; se descarto el texto en el que los detectores no coincidian. Los datos generados se insertaron en los formatos donde realmente aparecen filtraciones: lineas de comandos, cabeceras HTTP, logs, ficheros de configuracion y .env, exportaciones CSV, exportaciones de chat, bandejas de SMS con codigos de inicio de sesion, historial de git, firmas de correo y transcripciones de voz. Se anadieron tambien valores de aspecto similar pero no sensibles (claves de ejemplo, numeros de tarjeta de prueba, hashes, cadenas de version) como ejemplos negativos. El ajuste se realizo sobre unos 305.000 documentos en una sola pasada.

## Capacidades

- Deteccion y clasificacion de entidades de tipo PERSON, ADDRESS, PHONE, EMAIL, USERNAME y PATH_USER, incluyendo nombres que coinciden con palabras comunes ("Will", "Grace"), telefonos en formato internacional y nacional o dictados ("four one five..."), correos codificados o dictados ("dana at fernhollow dot io") y nombres de usuario en contextos como `@dana`, `ssh dana@host` o `-u dana`.
- Deteccion de datos financieros y de identidad: CREDIT_CARD (con validacion de Luhn), BANK (IBANs) y GOV_ID (numeros de la seguridad social estadounidense).
- Deteccion de secretos en prosa, comandos, ficheros de configuracion y cadenas de conexion: PASSWORD y OTP (codigos de un solo uso, PINs, codigos de recuperacion), tambien cuando estan dictados.
- Deteccion de credenciales embebidas en URL (URL_CREDENTIAL) y de claves de proveedor por formato: AWS_KEY, STRIPE_KEY, OPENAI_KEY, ANTHROPIC_KEY, HF_TOKEN, GITHUB_TOKEN y JWT.
- Categoria generica OTHER_SECRET para cualquier otra credencial: claves privadas, bearer tokens, cookies de sesion, secretos de webhook y contrasenas de base de datos.
- Tres modos de salida: reemplazo por etiqueta (`[PERSON]`), pseudonimizacion coherente (el mismo valor produce siempre el mismo sustituto, con la misma forma, por ejemplo mismo formato de telefono) y enmascarado con asteriscos.
- Salida estructurada de hallazgos (lista de offsets, tipo y texto) para enrutado de tickets, relleno de campos de CRM o intake, inventario de categorias de datos personales y pseudonimizacion de conjuntos de datos.
- Distribucion como paquete Python sobre ONNX Runtime (sin PyTorch), como CLI (`sporelabs-scrub`, con modo `--find` que emite JSON) y como API HTTP.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni capacidades de agente: es exclusivamente un modelo de etiquetado de tokens.

## Casos de uso

- Saneado de logs de aplicacion antes de enviarlos a un agregador: se pasa cada linea por el modelo en modo `tag` o `mask` para eliminar correos, telefonos, tokens de sesion y claves de API que aparecen en trazas; su latencia de ~2 ms por mensaje en un hilo de CPU permite hacerlo en linea sin introducir un salto apreciable.
- Redaccion previa de tickets de soporte antes de almacenarlos: el modelo devuelve el tipo de cada hallazgo, lo que permite enrutar el ticket segun lo que contiene (por ejemplo, un ticket con un numero de tarjeta hacia el equipo de pagos) ademas de redactarlo.
- Cumplimiento y atencion a solicitudes de acceso: al listar los tipos detectados en un corpus se obtiene un inventario de que categorias de datos personales maneja un sistema, util para mapas de datos y para responder a peticiones de acceso o supresion.
- Pseudonimizacion de conjuntos de datos para analitica o entrenamiento: el modo `pseudonym` mantiene la coherencia entre documentos (la misma persona recibe el mismo sustituto en todo el conjunto) preservando la forma de los valores, de modo que el texto sigue siendo utilizable para analitica y para modelos posteriores.
- Proteccion de ficheros de configuracion y `.env` en repositorios: deteccion por formato de claves de AWS, Stripe, OpenAI, Anthropic, Hugging Face y GitHub, ademas de OTHER_SECRET, para su uso como gancho de pre-commit o en tareas de CI que bloqueen la publicacion de credenciales.
- Limpieza de historial de git antes de hacer publico un repositorio: el modelo esta entrenado explicitamente con casos de historial de git y cadenas de conexion, por lo que puede recorrer los diffs para localizar credenciales y datos personales introducidos en commits antiguos.
- Deteccion de codigos de verificacion en bandejas de SMS o exportaciones de chat: la categoria OTP cubre codigos de un solo uso, PINs y codigos de recuperacion, incluso dictados, util para anonimizar conjuntos de datos de mensajeria.
- Saneado previo de conversaciones antes de usarlas como datos de entrenamiento o de evaluacion de otros modelos, evitando que datos personales de usuarios reales terminen en el corpus.
- Integracion en pasarelas de terceros mediante la API `POST https://sporelabs.dev/v1/scrub` (0,50 USD por millon de caracteres) cuando no se quiere desplegar el modelo localmente.

## Benchmarks y rendimiento

El autor publica un benchmark propio sobre el conjunto sellado `test5`: 100 documentos (chats, correos, tickets, logs, transcripciones de agentes y configuracion) con 135 secretos, 504 identificadores directos y 798 valores de aspecto similar no sensibles. "Caught" exige que se cubran todos los caracteres y digitos del elemento; cada sistema se ejecuto con su configuracion por defecto.

| Sistema | Tamano | Secretos detectados | Identificadores directos detectados | Precision | Look-alikes redactados (menor es mejor) |
|---|---|---|---|---|---|
| SporeLabs Scrub | 17M + reglas | 0,918 | 0,921 | 0,810 | 0,094 |
| OpenAI Privacy Filter | 1,4B | 0,852 | 0,770 | 0,773 | 0,175 |
| GLiNER2-PII | 307M | 0,770 | 0,873 | 0,741 | 0,283 |
| Presidio | spaCy lg + reglas | 0,074 | 0,544 | 0,578 | 0,167 |

Los resultados de los restantes conjuntos del benchmark (tabla parcialmente truncada en la informacion disponible) no estan disponibles en su totalidad. No se han publicado resultados de benchmarks independientes (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y en cualquier caso no aplicarian a un modelo de clasificacion de tokens.

## Requisitos de hardware

- Inferencia en CPU: el autor indica que el modelo corre en un solo hilo de CPU de portatil, con unos 2 ms por mensaje de chat (equivalente a unas 500 evaluaciones por segundo por hilo).
- VRAM: no requiere GPU. El repositorio ocupa 0,2 GB en disco; los 17M de parametros del encoder suponen del orden de 70 MB en fp32 (estimacion a partir del numero de parametros, no un dato publicado).
- GPU recomendadas: no aplica; no es necesario hardware dedicado. Cualquier GPU sirve solo si se despliega por conveniencia junto a otros servicios.
- Compatibilidad con GPU de consumo: si, cualquier equipo, incluidos portatiles sin GPU dedicada, dado el tamano del modelo.
- Opciones de despliegue: paquete Python `sporelabs-scrub` sobre ONNX Runtime (sin PyTorch), CLI `sporelabs-scrub`, carga directa de los ficheros ONNX/safetensors con `hf download SporeLabs/scrub`, y API alojada en `https://sporelabs.dev/v1/scrub`.
- Latencia y throughput: ~2 ms por mensaje de chat en un hilo de CPU segun el autor; no se publican cifras de throughput agregado ni de latencia en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Secretos detectados (test5) | Identificadores directos (test5) | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| SporeLabs Scrub | 17M + reglas | Encoder + reglas | 0,918 | 0,921 | 0,810 | Apache 2.0 | Pesos ONNX/safetensors, paquete Python, CLI y API |
| OpenAI Privacy Filter | 1,4B | Modelo | 0,852 | 0,770 | 0,773 | no disponible | no disponible |
| GLiNER2-PII | 307M | Modelo | 0,770 | 0,873 | 0,741 | no disponible | no disponible |
| Presidio | spaCy lg + reglas | Reglas + modelo spaCy | 0,074 | 0,544 | 0,578 | no disponible | no disponible |

Las cifras corresponden al mismo conjunto `test5` y a los ajustes por defecto de cada sistema, tal como los publica el autor del modelo. No se dispone de datos de contexto maximo ni de licencia de los sistemas comparados en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ingles: el unico idioma declarado es `en`; no hay garantia de comportamiento en castellano ni en otros idiomas, aunque parte del entrenamiento uso peticiones habladas en nueve idiomas.
- No es un modelo generativo: no puede resumir, reescribir ni razonar sobre el texto; solo etiqueta fragmentos.
- Precision de 0,810 en el benchmark del autor: aproximadamente una quinta parte de los elementos marcados son falsos positivos, lo que en un pipeline de redaccion agresiva puede degradar el texto util.
- El 9,4 % de los valores de aspecto similar pero no sensibles fueron redactados en `test5`; en textos con hashes, cadenas de version o claves de ejemplo abundantes puede aparecer ruido.
- Los resultados de benchmark proceden del propio autor y de un conjunto sellado propio (`test5`, 100 documentos); no hay evaluacion independiente disponible.
- El rendimiento depende crucialmente de la capa de reglas, que tiene precedencia sobre el modelo: los cambios en esa capa afectan directamente a secretos y claves detectados por formato.
- Riesgo de fuga en casos no cubiertos: identificadores con formatos regionales distintos de los contemplados (por ejemplo, documentos de identidad no estadounidenses) pueden no detectarse.
- Licencia Apache 2.0 para el modelo, pero el modelo base Ettin 17M se distribuye bajo licencia MIT; conviene revisar ambas condiciones antes de un uso comercial.
- El uso de la API alojada tiene coste (0,50 USD por millon de caracteres) y supone enviar el texto a un tercero, lo que puede ser incompatible con los propios requisitos de privacidad que el modelo pretende resolver.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe todavia validacion por parte de la comunidad.
- La model card proporcionada esta truncada en la seccion de resultados, por lo que los datos completos de todos los conjuntos del benchmark no estan disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SporeLabs/scrub
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-17m
- Paquete Python (rueda de instalacion): https://huggingface.co/SporeLabs/scrub/resolve/main/package/sporelabs_scrub-0.1.0-py3-none-any.whl
- API de SporeLabs: https://sporelabs.dev/v1/scrub
- Resultados de la busqueda web: no se encontro ningun enlace relevante sobre este modelo; los resultados devueltos correspondian a sitios genericos sin relacion con SporeLabs Scrub.
