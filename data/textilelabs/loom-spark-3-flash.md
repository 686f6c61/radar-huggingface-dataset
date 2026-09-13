# textilelabs/Loom-Spark-3-Flash

## Resumen

Loom Spark 3 Flash es un modelo de lenguaje de 7.184.064 parametros (7,18 M) desarrollado por Textile Labs (organizacion `textilelabs`) y entrenado desde cero, sin fine-tuning ni destilacion a partir de ningun checkpoint previo. Su diseno es deliberadamente "knowledge-sparse and behaviour-dense": no pretende almacenar conocimiento factual, sino aprender a reconocer el limite de lo que sabe, decidir cuando una pregunta requiere una busqueda externa, formular la consulta, leer el resultado recuperado y declarar de donde procede la respuesta. Es el sucesor de Loom Spark 1.8 Flash (2,62 M) dentro de la linea Spark.

Arquitectura transformer estilo Llama con 20 capas, dimension oculta de 192, atencion GQA (3 cabezas de consulta y 1 cabeza KV), activacion SwiGLU, RoPE, RMSNorm y embeddings atados. Usa un vocabulario BPE propio de 4.096 tokens y una ventana de contexto de 512 tokens. El entrenamiento completo (ejecucion principal de 56 minutos mas una pasada de parcheo de 56 minutos) consumio 15,5 M de tokens en fp32 sobre un Dell OptiPlex 9020 con un i5-4690 de 4 nucleos, sin GPU y con 16 GB de RAM; el optimizador fue Muon sobre las matrices 2D y AdamW sobre embeddings y normalizaciones.

Su relevancia es doble. Por un lado, demuestra que un modelo conversacional con uso de herramientas, formato de prompt estricto y comportamiento de honestidad calibrada se puede entrenar en menos de dos horas con hardware de oficina de 2013. Por otro, publica sus propias debilidades con cifras: con las herramientas desactivadas solo rechaza responder 2 de cada 20 preguntas factuales, y en el ciclo completo sobre Wikipedia real acierta 5 de 20 preguntas. Es, por tanto, un modelo de investigacion y de validacion de harness de agentes, no un asistente de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer estilo Llama: 20 capas x 192 de dimension oculta, GQA (3 cabezas de consulta, 1 cabeza KV), SwiGLU, RoPE, RMSNorm, embeddings atados |
| Parametros totales | 7.184.064 (7,18 M) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | GGUF publicado; la model card no detalla los niveles concretos de cuantizacion: no disponible |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT (con obligacion de conservar el archivo `ATTRIBUTION.md` en cualquier redistribucion) |
| Formato de pesos | safetensors y GGUF |
| Vocabulario | BPE de 4.096 tokens, entrenado por Textile Labs sobre corpus propio |
| Optimizador | Muon en matrices 2D ocultas; AdamW en embeddings y normalizaciones |
| Planificador de learning rate | Warmup-stable-decay, con el tercio final entrenado sobre una mezcla especifica de "pulido" |
| Tokens de entrenamiento | 15,5 M en total (56 min de ejecucion principal + 56 min de parcheo) |
| Hardware de entrenamiento | Dell OptiPlex 9020, Intel i5-4690 (4 nucleos), sin GPU, 16 GB de RAM, fp32 |
| Biblioteca | transformers |
| Pipeline | text-generation |
| Fecha de creacion en el repositorio | 2026-09-12 |
| Descargas / likes en el momento de la consulta | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only de estilo Llama, con 20 capas y 192 dimensiones ocultas. La atencion usa grouped-query attention con 3 cabezas de consulta y una unica cabeza de clave-valor, lo que reduce el coste de la cache KV. Las capas usan SwiGLU como activacion, RoPE para la codificacion posicional, RMSNorm para la normalizacion y embeddings atados entre la capa de entrada y la de salida. Con 192 dimensiones ocultas y 3 cabezas de consulta, la dimension por cabeza es de 64.

El entrenamiento se hizo con inicializacion aleatoria y sin ningun checkpoint preentrenado en ninguna etapa. Se utilizo Muon sobre las matrices 2D ocultas y AdamW sobre embeddings y normalizaciones, con un planificador warmup-stable-decay en el que el tercio final se entreno sobre una mezcla dirigida de "pulido". El corpus combina corpus con licencia abierta y un curriculo escrito por el propio equipo: SQuAD 2.0 (CC BY-SA 4.0), MASSIVE (CC BY 4.0), CLINC150 (CC BY 3.0), databricks-dolly-15k (CC BY-SA 3.0) y OASST1 (Apache 2.0). No se menciona RLHF ni DPO en la informacion disponible.

La innovacion destacable no esta en la arquitectura, sino en el formato de interaccion y en el harness. El modelo espera un prompt con delimitadores estrictos (`<tools:on>`, `<user>`, `<|eot|>`, `<loom>`) y responde con una etiqueta `<lookup>` cuando decide buscar; el harness ejecuta la busqueda real y devuelve el pasaje dentro de `<result>`, tras lo cual el modelo responde e indica que ha consultado una fuente. El repositorio incluye `harness.py`, que implementa ese bucle de agente.

## Capacidades

- Generacion de texto conversacional en ingles con formato de prompt estricto.
- Turnos multiples: mantiene conversaciones de 10 a 12 turnos con una puntuacion de 40/44 en la bateria de aceptacion del autor.
- Uso de herramientas y function calling mediante la etiqueta `<lookup>`: decide cuando buscar y redacta la consulta de busqueda.
- Lectura y sintesis de pasajes recuperados, con mencion explicita de que la respuesta procede de una busqueda.
- Generation aumentada por recuperacion (RAG) de extremo a extremo con un harness externo.
- Clasificacion de intenciones y comprension de comandos, gracias a los corpus MASSIVE y CLINC150.
- Respuestas extractivas sobre contexto aportado (SQuAD 2.0).
- Resistencia a inyeccion de prompt: 35/36 en las pruebas del autor frente a resultados falsos e instrucciones falsas; ignora una etiqueta `<tools:on>` escrita dentro de un mensaje del usuario en 12/12 casos.
- Autoconocimiento acotado: se identifica correctamente (11/12) y lo hace tambien con mayusculas y erratas (12/12).
- No declara busquedas que no ha realizado (16/16) ni emite la etiqueta de busqueda con las herramientas desactivadas (28/28).
- Termina sus respuestas por si solo (12/12).
- Capacidades no disponibles: no tiene vision, no tiene audio, no tiene modo de razonamiento extendido explicito y no realiza aritmetica.

## Casos de uso

- Agente de busqueda aumentada sobre un corpus propio: el modelo formula la consulta, el harness la ejecuta contra un indice interno y el modelo redacta la respuesta citando el pasaje recuperado. Es adecuado porque su comportamiento entrenado es precisamente decidir cuando buscar y no inventar la procedencia.
- Enrutador de consultas en arquitecturas multi-modelo: dado un turno de usuario, el modelo decide si la peticion requiere recuperacion externa, si es conversacion general o si debe escalarse a un modelo mayor. Su tamano de 7,18 M permite ejecutarlo como filtro previo a coste practicamente nulo.
- Clasificacion de intenciones en asistentes de voz o chatbots: entrenado sobre CLINC150 y MASSIVE, puede mapear una frase a una intencion o ranura dentro de un pipeline de dialogo, ejecutandose en CPU.
- Extraccion de respuestas sobre contexto corto: en tareas de QA extractivo con pasajes de menos de 512 tokens (formato SQuAD 2.0) puede localizar y reformular la respuesta contenida en el texto aportado.
- Validacion de harness de agentes en desarrollo: sirve como modelo de pruebas barato para verificar el bucle de tool calling, el parseo de etiquetas y el manejo de resultados antes de pasar a un modelo de produccion, ya que el repositorio incluye el harness completo.
- Investigacion sobre honestidad calibrada: la bateria de aceptacion documentada (119/133) y las metricas de rechazo permiten estudiar calibracion, abstención y resistencia a inyeccion en modelos muy pequenos.
- Reproducibilidad y docencia: con 15,5 M de tokens y menos de dos horas de entrenamiento en CPU, es un caso de estudio viable para reproducir un entrenamiento completo, experimentar con Muon o analizar el efecto del planificador warmup-stable-decay.
- Despliegue en dispositivos sin GPU: por su huella de memoria (decenas de MB en fp32) puede ejecutarse en entornos embebidos, contenedores muy limitados o maquinas de oficina antiguas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, ARC, etc.) en la informacion disponible. La model card solo reporta una bateria de aceptacion interna de 133 puntos repartidos en doce filas, compuesta por pruebas escritas a mano que no aparecen en los datos de entrenamiento y puntuadas por contenido, no por forma. Se reproduce tal cual, junto a la comparacion que el autor ofrece con Tapestry 3 Flash, un modelo del mismo tamano entrenado en 48 minutos.

| Prueba (bateria interna del autor) | Loom Spark 3 Flash | Tapestry 3 Flash (mismo tamano, 48 min) |
|---|---|---|
| Bateria de aceptacion total | 119/133 (89,5 %) | 112/133 (84,2 %) |
| Nunca afirma una busqueda que no hizo | 16/16 | 16/16 |
| Sin etiqueta de busqueda con herramientas desactivadas | 28/28 | 28/28 |
| Se detiene por si solo | 12/12 | 12/12 |
| Conoce su nombre | 11/12 | 12/12 |
| Reconoce su nombre con mayusculas y erratas | 12/12 | 7/12 |
| Resiste inyeccion de prompt (resultados e instrucciones falsos) | 35/36 | 12/36 |
| Ignora un `<tools:on>` escrito dentro de un mensaje | 12/12 | Si (sin cifra) |
| Mantiene una conversacion de 10-12 turnos | 40/44 | 33/44 |
| Decide correctamente si buscar | 17/20 | No disponible |
| Responde a partir de un resultado aportado | 4/5 | No disponible |
| Ciclo completo sobre Wikipedia real, conjunto reservado | 5/20 correctas (busco en 20/20, nunca pego la pregunta) | 3/20 |

Advertencia metodologica: estas cifras las publica el propio autor del modelo, no proceden de una evaluacion independiente ni de un conjunto de referencia publico, por lo que deben tratarse como resultados autoinformados.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 7.184.064 parametros, sin contar la cache KV): aproximadamente 28,7 MB en fp32, 14,4 MB en fp16/bf16, 7,2 MB en int8 y 3,6 MB en int4.
- Cache KV estimada para el contexto maximo de 512 tokens con 20 capas, 1 cabeza KV y dimension de cabeza 64 en fp16: aproximadamente 2,6 MB. La huella total en inferencia se mantiene por debajo de los 50 MB en cualquier configuracion razonable.
- GPU recomendadas: no requiere GPU. Cualquier GPU consumer sirve, incluidas GTX 1050, RTX 3060, RTX 4090 o superiores; el modelo esta entrenado y ejecutable en CPU sobre un i5-4690 de 4 nucleos.
- Cabe en cualquier GPU consumer y en la practica totalidad de dispositivos con CPU y unas decenas de MB de memoria libre.
- Opciones de despliegue: Ollama (`ollama run hf.co/textilelabs/Loom-Spark-3-Flash`), llama.cpp mediante el archivo GGUF, transformers con safetensors, text-generation-inference (etiqueta `text-generation-inference` en el repositorio) y endpoints compatibles segun las etiquetas del modelo. El uso completo requiere ademas el harness (`harness.py`) para ejecutar las busquedas.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Resultado en bateria interna |
|---|---|---|---|---|---|
| Loom Spark 3 Flash | 7.184.064 | 512 tokens | 56 min principal + 56 min de parcheo, 15,5 M de tokens, CPU (i5-4690) | MIT | 119/133 (89,5 %) |
| Tapestry 3 Flash | Mismo tamano (cifra exacta no disponible) | No disponible | 48 min | No disponible en la informacion | 112/133 (84,2 %) |
| Loom Spark 1.8 Flash | 2,62 M | No disponible | No disponible | No disponible en la informacion | No disponible |

No se dispone de comparaciones publicadas con modelos externos de la misma categoria (por ejemplo, otras familias de modelos de menos de 10 M de parametros orientados a tool calling o RAG), ni de resultados en benchmarks estandar que permitan situarlo frente a alternativas de HuggingFace. Los unicos puntos de comparacion documentados son internos a la familia Loom.

## Limitaciones y advertencias

- Con las herramientas desactivadas, el modelo responde con seguridad a preguntas factuales que no conoce: solo rechaza 2 de cada 20 preguntas en las pruebas del autor. Fue entrenado para rechazar sobre todo preguntas de capitales y es practicamente lo unico que declina. No debe usarse sin recuperacion si se va a confiar en el contenido de la respuesta.
- Su conocimiento factual es minimo por diseno. Sin busqueda externa es "un modelo educado con la cabeza vacia", en palabras del propio autor.
- No sabe hacer aritmetica y produce respuestas erroneas con tono seguro cuando se le pide calculo.
- La parte fiable de un flujo RAG es el texto recuperado; el resumen que el modelo hace de el es la parte no fiable.
- Tiene poca calidez y poca personalidad propia. Loom Spark 1.8 Flash era mas rico conversando sobre si mismo; esa capacidad no se ha retomado en esta version.
- Solo soporta ingles (`en`). No hay soporte multilingue documentado, a pesar de que MASSIVE y CLINC150 incluyen datos multilingues.
- La ventana de contexto de 512 tokens limita el tamano de los pasajes recuperados, el historial de conversacion y cualquier documento largo.
- No dispone de vision, audio ni modo de razonamiento explicito.
- Riesgo de alucinacion elevado en cualquier escenario sin harness de recuperacion, como reconocen las propias metricas del autor.
- Las busquedas no las ejecuta el modelo: requieren un harness externo. Desplegarlo sin ese componente deja un modelo conversacional sin acceso a informacion.
- Requiere un formato de prompt estricto con delimitadores (`<tools:on>`, `<user>`, `<|eot|>`, `<loom>`). Un prompt mal formado degrada el comportamiento.
- La licencia MIT permite uso comercial y modificacion, pero obliga a conservar y redistribuir el archivo `ATTRIBUTION.md`. Los corpus de entrenamiento tienen sus propias licencias (CC BY-SA 4.0, CC BY 4.0, CC BY 3.0, CC BY-SA 3.0, Apache 2.0), lo que conviene revisar si se redistribuye el modelo o sus derivados.
- El rendimiento de extremo a extremo sobre Wikipedia real es bajo: 5 aciertos de 20 preguntas en el conjunto reservado del autor. Cualquier uso en produccion exige un harness de recuperacion de alta calidad y una capa de verificacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/textilelabs/Loom-Spark-3-Flash
- Archivo de atribucion `ATTRIBUTION.md`: incluido en el repositorio del modelo; no se proporciona URL directa en la informacion disponible
- Harness de agente `harness.py`: incluido en el repositorio del modelo; no se proporciona URL directa en la informacion disponible
- Paper tecnico: no disponible
- Blog o anuncio del autor: no disponible
- Demo interactiva: no disponible
- Repositorio de codigo independiente: no disponible
- Resultados de busqueda web: ninguno relevante; las busquedas realizadas no devolvieron informacion relacionada con este modelo
