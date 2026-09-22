# TheShrimpler/portcullis-1.0

## Resumen

Portcullis 1.0 es un clasificador de texto desarrollado por el usuario TheShrimpler (TheShrimpler/portcullis-1.0) cuyo objetivo es actuar como guardrail de entrada para sistemas basados en LLM. Recibe un prompt dirigido a un modelo generativo y devuelve siete senales independientes (intento de anulacion de instrucciones, jailbreak, robo de datos, payload ofuscado, secuestro de herramientas, categoria y severidad), cada una con una probabilidad calibrada, de modo que el codigo de la aplicacion decide si permite, bloquea o escala la peticion. No genera prosa: solo probabilidades, lo que descarta la posibilidad de que alucine un veredicto.

Tecnicamente es un ajuste fino de answerdotai/ModernBERT-large (encoder bidireccional), con 395 millones de parametros y una licencia apache-2.0. El modelo se ejecuta integramente en local, sin coste por prompt ni envio de datos a APIs de terceros, y el autor documenta una latencia de 15,4 ms en percentil 50 sobre una GPU de consumo (RTX 5090) y de 595 ms en CPU, lo que permite cribar aproximadamente 230.000 prompts por hora en una sola GPU.

Su relevancia actual es doble. Por un lado, ataca el compromiso habitual entre guardrails comerciales via API (coste y fuga de prompts) y filtros caseros demasiado agresivos con los usuarios legitimos. Por otro, la model card documenta de forma poco habitual un caso de contaminacion train-on-test detectado por el propio autor (1.044 de 1.044 prompts de un benchmark y los 450 de otro estaban en los datos de entrenamiento), su retirada, la reejecucion desde datos limpios y la publicacion de intervalos de confianza y umbrales precomprometidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer bidireccional (ajuste de answerdotai/ModernBERT-large) con cabeza de clasificacion multi-etiqueta y salidas calibradas |
| Parametros totales | 395 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base answerdotai/ModernBERT-large emplea 8.192 tokens |
| Tipos de cuantizacion | No disponible (no se documentan versiones GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | Ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | No especificado en la model card; repositorio de 1,6 GB con pesos para la libreria transformers y compatible con endpoints |

## Arquitectura y entrenamiento

El modelo parte de answerdotai/ModernBERT-large, un encoder transformer bidireccional, y anade una cabeza de clasificacion que emite siete senales con probabilidad calibrada: intento de override, jailbreak, robo de datos, payload ofuscado, secuestro de herramienta (tool hijack), categoria y severidad. La calibracion es un rasgo central del diseno: el autor afirma que cuando el modelo devuelve 0,9, el evento ocurre aproximadamente el 90% de las veces, lo que permite fijar umbrales de forma informada. Al no generar texto libre, el modelo no puede producir un veredicto en prosa ni alucinar una justificacion.

Los detalles del dataset de entrenamiento no se detallan en la informacion disponible (composicion, numero de tokens, uso de RLHF o DPO). La model card si describe el proceso de evaluacion y auditoria: se detecto que los datos de entrenamiento contenian filas exactas de dos benchmarks de evaluacion, se retiraron los conjuntos contaminados y se reejecuto la evaluacion solo con datos limpios, con umbrales precomprometidos e intervalos de confianza en cada metrica. La evaluacion principal usa dos conjuntos de red team externos "ciegos" generados por un generador externo despues del entrenamiento y a ciegas respecto a las salidas del modelo por procedimiento; el propio autor aclara que no estan atestados de forma independiente. El coste total declarado del proyecto es inferior a 3 dolares (unos 2,50 dolares de API y unos 0,40 de electricidad) y aproximadamente 20 horas de trabajo.

## Capacidades

- Clasificacion de prompts en siete senales independientes con probabilidades calibradas: intento de override, jailbreak, robo de datos, payload ofuscado, secuestro de herramientas, categoria y severidad.
- Deteccion de inyeccion de prompt y de intentos de jailbreak en ingles.
- Soporte de una politica de decision por niveles (bloquear, escalar, permitir) a partir de umbrales configurables por el integrador.
- Deteccion de cargas utiles ofuscadas (la senal existe, aunque con calibracion mas laxa segun el autor).
- Deteccion de intentos de secuestro de herramientas, relevante para agentes con tool calling o function calling.
- Inferencia completamente offline, sin llamadas a API y sin coste por prompt.
- Salida estrictamente numerica (probabilidades), sin generacion de texto.
- Ejecucion en GPU de consumo y en CPU, con latencias medidas.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, audio ni modo "thinking": es exclusivamente un clasificador.
- No se documenta soporte multilingue: solo ingles.

## Casos de uso

- Filtrado previo de prompts en atencion al cliente automatizada: el clasificador se coloca delante del LLM conversacional y bloquea o escala intentos de override antes de que lleguen al modelo generativo, con una latencia de 15,4 ms que resulta despreciable frente al coste de una generacion completa.
- Proteccion de agentes con tool calling: la senal de secuestro de herramientas permite detectar prompts que intentan redirigir una herramienta hacia un objetivo no previsto; al tener calibracion mas laxa, el autor recomienda enviarla al nivel de escalado en lugar de al bloqueo automatico.
- Prevencion de exfiltracion de datos: la senal de robo de datos sirve para marcar peticiones que intentan extraer el system prompt, credenciales o contexto recuperado de una base vectorial antes de que el LLM las procese.
- Enrutado de dos niveles (cascada) para reducir coste: Portcullis filtra todo el trafico y solo los casos en banda intermedia se envian a un modelo mayor; el autor reporta que, combinado con un modelo de respaldo abierto de 86M, se alcanza un 85% de deteccion de ataques con un 0% de falsos positivos sobre el segundo conjunto de red team ciego.
- Despliegue on-premise o en entornos aislados: al ejecutarse offline y no requerir API externa, encaja en organizaciones con requisitos de residencia de datos o de prohibicion de enviar prompts a terceros.
- Auditoria y monitorizacion de seguridad sobre logs historicos: la clasificacion por lotes permite puntuar grandes volumenes de prompts registrados (unas 230.000 peticiones por hora en una sola GPU) y construir series temporales de intentos de ataque o de deriva del trafico.
- Red teaming interno y etiquetado de datasets: las siete senales con probabilidad sirven para etiquetar corpus de prompts maliciosos y benignos, aunque el propio autor advierte del riesgo de contaminacion si se reutilizan benchmarks publicos como datos de entrenamiento.
- Deteccion de payloads ofuscados: prompts con codificaciones o transformaciones pensadas para evadir filtros simples pueden marcarse mediante la senal correspondiente, escalando la decision a un segundo clasificador o a revision humana.
- Control de coste frente a guardrails comerciales: en despliegues de alto volumen, sustituir una API de moderacion por este clasificador elimina el coste por millon de tokens a cambio de una menor tasa de deteccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tipo MMLU, HumanEval o GSM8K: el modelo es un clasificador y la model card reporta metricas de deteccion de ataques y de falsos positivos sobre conjuntos de red team ciegos y sobre conjuntos benignos. Las cifras provienen del propio autor, con intervalos de confianza al 95% entre corchetes y sin atestacion independiente del protocolo.

| Test | n | Deteccion de ataque Portcullis | Deteccion de ataque Jev-1.13 | Falsos positivos Portcullis | Falsos positivos Jev-1.13 |
|---|---|---|---|---|---|
| Red team ciego 1 | 109 | 90% [80-95%] | 99% [92-100%] | 12% [5-25%] | 7% [2-19%] |
| Red team ciego 2 | 118 | 88% [78-94%] | 98% [92-100%] | 2% [0-10%] | 12% [5-23%] |
| Inyecciones clasicas con deriva (shifted) | 110 | 57% | 59% | 4% | 0% |

| Test (todo benigno) | n | Marca Portcullis | Marca Jev-1.13 |
|---|---|---|---|
| OR-Bench hard-benign | 1.319 | 2% [1-2%] | 27% [25-30%] |
| NotInject (prompts con palabras disparadoras) | 113 | 12% | 14% |
| awesome-chatgpt-prompts (roleplay) | 2.002 | 29% (punto debil reconocido) | 8% |

| Medida de latencia y coste (RTX 5090) | Valor |
|---|---|
| Carga hasta estar listo | 2,4 s (GPU) |
| Prompt evaluado, p50 | 15,4 ms GPU / 595 ms CPU |
| p95 | 18,9 ms GPU |
| Maximo observado | 21,0 ms GPU / 732 ms CPU |
| Protocolo | 150 prompts, warmup descartado, percentiles ordenados (results/latency_benchmark.json) |
| Throughput estimado | ~230.000 prompts por hora en una GPU de consumo |

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 1,6 GB en fp32 (coincide con el tamano del repositorio para 395M parametros), unos 0,8 GB en fp16/bf16 y del orden de 0,4 GB en int8. Son estimaciones de orden de magnitud a partir del numero de parametros; la model card no publica cifras de memoria.
- GPU recomendadas: el autor mide sobre una RTX 5090. Por tamano, cualquier GPU de consumo moderna (serie RTX 30/40/50, e incluso integradas con suficiente memoria compartida) deberia alojar el modelo sin problema.
- Cabe en GPU de consumo: si, con margen amplio, incluso en GPU de gama de entrada.
- CPU: funciona y esta medido en la misma maquina (595 ms p50, 732 ms maximo), suficiente para volumenes moderados o para entornos sin GPU.
- Opciones de despliegue: transformers (libreria declarada), Hugging Face Inference Endpoints (la etiqueta endpoints_compatible sugiere compatibilidad), exportacion a ONNX Runtime u Optimum para acelerar inferencia en CPU/GPU. No se documenta soporte de vLLM, TGI, llama.cpp u Ollama para este modelo: no disponible.
- Latencia y throughput: 15,4 ms p50 y 21,0 ms maximo por prompt en RTX 5090, con 2,4 s de carga. En CPU, 595 ms p50 y 732 ms maximo.

## Comparativa con modelos similares

| Caracteristica | Portcullis 1.0 | Jev-1.13 (comercial) |
|---|---|---|
| Parametros | 395M | No disponible |
| Ejecucion | Local, offline, en portatil o GPU propia | API alojada por el proveedor |
| Coste por prompt | 0 dolares | Aproximadamente 0,04 dolares por millon de tokens |
| Deteccion de ataque en red team ciego 1 | 90% [80-95%] | 99% [92-100%] |
| Deteccion de ataque en red team ciego 2 | 88% [78-94%] | 98% [92-100%] |
| Falsos positivos en red team ciego 1 | 12% [5-25%] | 7% [2-19%] |
| Falsos positivos en red team ciego 2 | 2% [0-10%] | 12% [5-23%] |
| Sobrebloqueo en prompts legitimos dificiles (OR-Bench hard-benign) | 2% | 27% |
| Politica de incertidumbre | Tres niveles (bloquear/escalar/permiter) | Respuesta unica |
| Salida | Probabilidades calibradas por senal | Probabilidad (segun el autor) |
| Licencia | apache-2.0 | No disponible |
| Idiomas | Ingles | No disponible |

El autor advierte que la comparacion con Jev-1.13 se hizo con una configuracion de preguntas generica de ese producto, no con su configuracion especifica orientada a seguridad, por lo que la califica como comparacion bajo desventajas declaradas y reivindica el equilibrio coste/falsos positivos, no la superioridad. En el despliegue en cascada descrito, con un modelo de respaldo abierto de 86M para la banda intermedia, el autor reporta un 85% de deteccion de ataques con un 0% de falsos positivos sobre el segundo conjunto de red team ciego.

No se dispone de datos de otros clasificadores de guardrail en la informacion proporcionada: no disponible.

## Limitaciones y advertencias

- Sobrebloqueo en prompts con formato de roleplay: 29% de marcas en el umbral de bloqueo y 36% en el de escalado sobre awesome-chatgpt-prompts (2.002 prompts). Es el punto debil reconocido por el autor y el primero de su hoja de ruta; una correccion probada antes del lanzamiento no se confirmo.
- Tres de las siete senales tienen calibracion mas laxa (robo de datos, payloads codificados y secuestro de herramientas). El autor recomienda explicitamente no conectarlas a bloqueo automatico y hacer que escalen la decision.
- Ataques de ficcion creativa y codigos ocultos preacordados (acrosticos, frases secretas) pueden pasar el filtro; para esos casos esta previsto el nivel de escalado.
- Baja deteccion en inyecciones clasicas con deriva: 57% (frente al 59% de Jev), con un 4% de falsos positivos, lo que indica fragilidad ante cambios de distribucion respecto a los datos de entrenamiento.
- Solo ingles. No hay evidencia de comportamiento en castellano ni en otros idiomas.
- Riesgo documentado de contaminacion train-on-test en el ecosistema de benchmarks de clasificadores de prompts: el autor detecto que su propio entrenamiento contenia 1.044 de 1.044 prompts de un benchmark y los 450 de otro, retiro esos conjuntos y reejecuto la evaluacion. Conviene comprobar este extremo en cualquier guardrail que se evalue o se compre.
- Los conjuntos de red team son externos y ciegos por procedimiento, pero no estan atestados por un tercero independiente, y los tamanos son pequenos en varios tests (n=109, 118, 113), lo que se refleja en intervalos de confianza amplios.
- Metricas y latencias proceden del propio autor y de su hardware (RTX 5090); no hay replicacion independiente conocida.
- Sin adopcion comunitaria registrada en el momento de la consulta (0 descargas y 0 likes en Hugging Face), lo que implica ausencia de validacion externa y de casos de produccion publicos.
- Licencia apache-2.0 para el modelo, heredada de un modelo base tambien permisivo; permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento, no detallados en la model card.
- La informacion de la model card esta cortada en el punto 4 de las limitaciones ("One autho..."), por lo que puede existir una advertencia adicional no recogida aqui.
- El texto de la model card incluye emojis y afirmaciones de marketing; las cifras deben tratarse como declaraciones del autor, no como resultados auditados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheShrimpler/portcullis-1.0
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-large
- La busqueda web realizada no devolvio resultados relevantes para este modelo (los resultados obtenidos correspondian a mapas del barrio de Ipanema, Rio de Janeiro). No se dispone de enlaces a papers, blogs, repositorios de codigo o demos adicionales: no disponible. La model card menciona artefactos internos del repositorio (results/latency_benchmark.json, results/SHIP_TABLE.md) que no se han podido verificar desde aqui.
