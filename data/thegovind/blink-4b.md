# thegovind/blink-4b

## Resumen

blink-4b es un modelo de decision entrenado por el usuario thegovind a partir de Qwen/Qwen3.5-4B. No es un modelo generativo al uso: recibe un texto o un JSON de estado junto con preguntas tipadas y devuelve, en una sola pasada forward, una distribucion de probabilidad sobre las opciones ofrecidas. Admite tres tipos de pregunta: `choice` (hasta 255 opciones), `noul` (si/no) y `score` (entre 2 y 10 niveles ordenados). No genera texto en ningun caso.

El modelo conserva el backbone transformer del Qwen3.5-4B original, pero se le han eliminado el encoder de vision y la cabeza MTP, quedando como modelo exclusivamente de texto. Sus 4.205.751.296 parametros se publican en bf16 (8,4 GB) y la revision v1.2 solo cambia el codigo, no los pesos, que son identicos a los de la v1.0.

Su relevancia actual esta en el nicho de los modelos de decision: frente a un LLM generativo, que necesita decodificar tokens para responder, blink-4b obtiene la respuesta leyendo los logits de la siguiente posicion y aplicando un softmax en FP32 sobre las letras de las opciones. Esto reduce coste y latencia en tareas de clasificacion, enrutado o verificacion donde solo hace falta elegir entre alternativas predefinidas. Su licencia blink-research es de uso exclusivamente no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder derivado de Qwen/Qwen3.5-4B (solo texto; encoder de vision y cabeza MTP eliminados) |
| Parametros totales | 4.205.751.296 (medidos en safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos publicados estan en bf16) |
| Idiomas soportados | en (ingles) |
| Licencia | blink-research (uso exclusivamente no comercial para investigacion); el modelo base Qwen3.5-4B es Apache-2.0 |
| Formato de pesos | safetensors (bf16, 8,4 GB) |

## Arquitectura y entrenamiento

blink-4b parte de Qwen/Qwen3.5-4B, del que conserva el cuerpo transformer solo-texto. El modelo no decodifica: cada pregunta tipada se renderiza como evidencia, criterio y opciones etiquetadas con letras; las preguntas se agrupan en lotes y cada lote se resuelve con una unica pasada forward. Sobre los logits de la posicion de respuesta se aplica un softmax en FP32 restringido a las letras ofrecidas, lo que produce una probabilidad por opcion. Las peticiones largas o con muchas preguntas pueden requerir varios lotes. La model card publica un diagrama de este mecanismo de lectura one-pass. La model card no detalla el numero total de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO: esos datos no estan disponibles.

Lo que si se documenta es parte del pipeline de ajuste. Se nombran dos etapas de entrenamiento, T3 (23.156 filas) y T4 (42.360 filas). El informe de la Decision Index 0.2 reconoce contaminacion por exposicion de entrenamiento: 281 preguntas de la particion de test de MMLU-Pro formaron parte del entrenamiento, y hay coincidencias de cadenas normalizadas de 30 caracteres o mas entre filas de entrenamiento y peticiones evaluadas (138 en T3 y 156 en T4, mayoritariamente procedentes de MMLU-Pro). El autor lo declara explicitamente y advierte que la puntuacion de MMLU-Pro en esa edicion esta contaminada y que el valor "without MMLU-Pro" es un control de sensibilidad, no una puntuacion limpia.

## Capacidades

- Decision tipada con opciones: selecciona entre hasta 255 alternativas etiquetadas en una pregunta `choice`.
- Respuesta binaria: resuelve preguntas `noul` (si/no).
- Puntuacion ordenada: asigna niveles de una escala ordenada de 2 a 10 valores en preguntas `score`.
- Salida probabilistica: devuelve una probabilidad por opcion en lugar de una etiqueta unica, lo que permite umbrales, calibracion y agregacion posterior.
- Lectura en una sola pasada: no hay decodificacion autoregresiva ni generacion de texto; el coste por decision es una pasada forward por lote de preguntas.
- Entrada estructurada: acepta texto plano o un JSON de estado como contexto de la decision.
- Procesamiento por lotes: agrupa varias preguntas y las resuelve en uno o varios lotes.
- No soporta tool calling ni function calling: no esta documentado en la informacion disponible.
- No soporta agentes ni razonamiento multi-paso generativo: el modelo no produce cadenas de pensamiento ni texto intermedio.
- Sin capacidades de vision, audio ni thinking mode: el encoder de vision fue eliminado del modelo base.
- Multilingue: no disponible; la model card declara unicamente ingles (`en`).

## Casos de uso

- Clasificacion y enrutado de tickets: dado el texto de una incidencia, plantear una pregunta `choice` con las categorias del sistema de ticketing y obtener la probabilidad de cada una para decidir la cola de destino o escalar cuando la confianza sea baja.
- Moderacion de contenido con escalas: usar preguntas `score` de 2 a 10 niveles para puntuar la gravedad de un mensaje y aplicar umbrales configurables en lugar de una decision binaria rigida.
- Verificacion de afirmaciones (fact checking): el modelo rinde en HoVer con un 63,1 de exactitud bruta (26,2 de skill), por lo que encaja como primer filtro de verificacion de claims antes de un revisor humano.
- Deteccion de respuestas alucinadas en pipelines RAG: con un F1 de 66,5 en la clase alucinada de RAGTruth, puede actuar como clasificador de salida que marque respuestas sospechosas antes de mostrarlas al usuario.
- Decisiones de invocacion de herramientas: en When2Call MCQ obtiene 62,8 de exactitud bruta (50,3 de skill), lo que permite usarlo como router que decida si una consulta requiere llamar a una herramienta externa.
- Triaje de phishing y seguridad: con 63,6 de exactitud bruta (27,3 de skill) en las decisiones de PhishNChips, sirve como capa de pre-filtrado de correos o URLs sospechosas.
- Evaluacion comparativa de opciones en producto: plantear una pregunta `choice` con variantes de copy, configuracion o politica y usar la distribucion de probabilidad como señal de preferencia para experimentos A/B asistidos.
- Anotacion asistida con incertidumbre: al devolver probabilidades calibradas (ECE de 0,067 en los items duros de JevBench), permite priorizar que ejemplos debe revisar un anotador humano.

## Benchmarks y rendimiento

JevBench, proxies de desarrollo sobre items publicos (no son puntuaciones oficiales; la puntuacion oficial exige items reservados, juez y conjunto sellado):

| Modelo | Proxy items publicos | Hard publico (111) | ECE hard | TVD de probabilidad | JevBench v1.4 oficial |
|---|---:|---:|---:|---:|---:|
| blink-4b | 76,5 | 80/111 | 0,067 | 0,226 | no publicado |
| JevK5 v0.2.0 | 76,1 | 79/111 (82/111 en su propio runtime) | 0,068 | 0,220 | 62,0 |
| Jev 1.13.0 | — | — | — | — | 63,3 |

El autor no reclama ventaja de exactitud en los items duros: el intervalo de Wilson al 95 % de blink-4b es 0,631-0,796 antes de efectos de seleccion.

Decision Index 0.2, ejecucion local del kit oficial (commit 19ad28e del 2026-09-25), no envio a leaderboard:

| Balanced skill | Balanced raw | Breadth skill | Without MMLU-Pro |
|---:|---:|---:|---:|
| 37,85 | 53,33 | 36,78 | 37,41 |

Desglose por area en Decision Index 0.2:

| Area | Numero de benchmarks | Skill | Raw |
|---|---:|---:|---:|
| Knowledge & Reasoning | 10 | 26,4 | 43,1 |
| Language Understanding | 10 | 47,4 | 62,7 |
| Retrieval & Classification | 7 | 36,8 | 54,7 |
| Tools & Automation | 6 | 51,6 | 60,0 |
| Arts & Human Taste | 7 | 27,2 | 46,1 |

Benchmarks anadidos en la edicion 0.2:

| Benchmark | Metrica | Peticiones | Respondidas | Raw | Skill |
|---|---|---:|---:|---:|---:|
| PhishNChips (decisiones de phishing) | accuracy | 2.000 | 2.000 | 63,6 | 27,3 |
| MMLU-Pro | accuracy | 12.032 | 12.032 | 52,1 | 46,1 |
| BBH (tareas de opcion fija) | accuracy | 5.507 | 5.507 | 63,8 | 47,5 |
| RAGTruth (alucinacion a nivel de respuesta) | F1 clase alucinada | 2.700 | 2.700 | 66,5 | 43,1 |
| HoVer (verificacion de claims) | accuracy | 4.000 | 4.000 | 63,1 | 26,2 |
| When2Call MCQ | accuracy | 3.652 | 3.652 | 62,8 | 50,3 |
| New Yorker (emparejamiento de pies de foto) | accuracy | 528 | 528 | 58,9 | 48,6 |

En total se puntuaron 151.034 peticiones evaluables en 40 benchmarks contados, repartidos en cinco areas iguales; 30.419 peticiones anadidas se ejecutaron con el "soup" congelado a temperatura 1.0. Son estimaciones puntuales, sin afirmaciones de significacion, calibracion ni latencia, y no deben compararse con la edicion 0.1 por diferencias de edicion.

Exposicion de entrenamiento en las peticiones anadidas:

| Etapa de entrenamiento | Filas de la etapa | Filas que coinciden con texto de peticiones anadidas | De MMLU-Pro | De SuperGPQA | Otras |
|---|---:|---:|---:|---:|---:|
| T3 | 23.156 | 138 | 131 | 6 | 1 |
| T4 | 42.360 | 156 | 148 | 7 | 1 |

Decision Index 0.1 (edicion archivada, 132.422 peticiones en 37 benchmarks, 19 benchmarks de panel promediados para el indice principal; filas de comparacion de la instantanea del leaderboard del 2026-09-22):

| Modelo | Clase de tamano | Decision Index 0.1 | Skill | Breadth |
|---|---|---:|---:|---:|
| blink-4b | 4B | 52,12 | 36,04 | 34,18 |
| Jev 1.13.0 | cerrado | 59,51 | 46,26 | 44,79 |
| Jevfire | 27B | 55,74 | 40,86 | 39,45 |
| JoshuaSP diffusiongemma (open-jev) | 26B-A4B | 55,56 | 40,84 | 39,19 |
| Decider 35B-A3B | 35B-A3B | 54,34 | 39,37 | 37,99 |
| Kev 9B | 9B | 50,48 | 32,96 | 30,54 |
| Kev 4B | 4B | 47,43 | 28,86 | 25,67 |

## Requisitos de hardware

- Pesos en bf16: 8,4 GB en disco y en memoria, para 4.205.751.296 parametros.
- VRAM estimada para inferencia: en torno a 10-11 GB en bf16 contando pesos, activaciones y buffers de KV cache (estimacion a partir del numero de parametros, no un dato publicado); alrededor de 5-6 GB con cuantizacion de 8 bits y 3-4 GB con 4 bits, siempre que el runtime soporte la arquitectura Qwen3.5 solo-texto. No hay cifras oficiales de VRAM en la informacion disponible.
- GPU recomendadas: no disponibles en la model card. Por tamano, una GPU consumer de 12-16 GB (RTX 4080, RTX 4090, RTX 5090) deberia bastar en bf16; una RTX 3060 de 12 GB podria bastar con cuantizacion. En centro de datos, A100, H100 o L40S cubren el modelo con holgura.
- Cabe en GPU consumer: si, previsiblemente en tarjetas de 12 GB o mas en bf16 y en tarjetas de 8 GB con cuantizacion, sujeto a soporte de runtime.
- Opciones de despliegue: la model card solo documenta el uso mediante `transformers` y la libreria propia del proyecto (github.com/thegovind/blink), que implementa el runtime de lectura one-pass. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y el tag `inference: false` indica que el modelo no esta habilitado para inferencia serverless en HuggingFace.
- Latencia y throughput: no disponibles. La model card indica que el coste se mide en peticiones por lote y pasada forward, y la estimacion de coste de JevBench usa una tarifa de 4B de 0,03 USD por millon de tokens de entrada, pero se trata de una tarifa de referencia del benchmark, no de una factura de produccion.

## Comparativa con modelos similares

| Modelo | Parametros / clase | Decision Index 0.1 | JevBench v1.4 oficial | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| blink-4b | 4B denso | 52,12 | no publicado | blink-research (solo investigacion no comercial) | pesos abiertos en HuggingFace |
| JevK5 v0.2.0 | no disponible | no disponible | 62,0 | no disponible | no disponible |
| Jev 1.13.0 | cerrado | 59,51 | 63,3 | no disponible | modelo cerrado |
| Jevfire | 27B | 55,74 | no disponible | no disponible | no disponible |
| Decider 35B-A3B | 35B-A3B (MoE) | 54,34 | no disponible | no disponible | no disponible |
| Kev 9B | 9B | 50,48 | no disponible | no disponible | no disponible |
| Kev 4B | 4B | 47,43 | no disponible | no disponible | no disponible |
| JoshuaSP diffusiongemma (open-jev) | 26B-A4B (MoE) | 55,56 | no disponible | no disponible | no disponible |

blink-4b es, de la tabla, el unico con pesos y licencia publicados de forma explicita. Los datos de parametros, contexto y licencia de los rivales no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: blink-research permite uso exclusivamente no comercial para investigacion. El uso en produccion comercial requiere atencion a `LICENSE.md`; el modelo base Qwen3.5-4B si es Apache-2.0, pero la licencia del derivado prevalece.
- Solo ingles: la model card declara unicamente `en`; no hay evidencia de soporte multilingue, incluido el castellano.
- No genera texto: no puede usarse para chat, redaccion, resumen ni generacion de codigo. Cualquier expectativa de ese tipo es un error de uso.
- Contaminacion de entrenamiento declarada: 281 preguntas de la particion de test de MMLU-Pro se usaron en entrenamiento y hay coincidencias de cadenas entre filas de entrenamiento y peticiones evaluadas, por lo que la puntuacion de MMLU-Pro esta contaminada y la comparacion con la edicion 0.1 del Decision Index no es valida.
- Benchmarks no oficiales: las cifras de JevBench son proxies sobre items publicos y no otorgan rango ni paridad. El propio autor indica que la puntuacion oficial exige conjuntos reservados y sellados.
- Calibracion limitada: el ECE de 0,067 en los items duros de JevBench es bajo, pero se refiere a ese conjunto concreto; no hay garantia de calibracion en otros dominios, y la TVD de probabilidad de 0,226 indica divergencia apreciable frente a la distribucion de referencia.
- Riesgo de alucinacion: en tareas de decision, el fallo se manifiesta como una opcion incorrecta con probabilidad alta, no como texto inventado. En RAGTruth logra un F1 de 66,5 en la clase alucinada, insuficiente para prescindir de validacion humana en dominios sensibles.
- Rendimiento desigual por area: el skill cae a 26,4 en Knowledge & Reasoning y 27,2 en Arts & Human Taste, frente a 51,6 en Tools & Automation. No es adecuado como decision generalista de conocimiento.
- Longitud de contexto no disponible, lo que impide garantizar el comportamiento con estados o documentos largos mas alla de la necesidad de partir la peticion en varios lotes.
- Adecuacion a produccion no demostrada: el modelo tiene 81 descargas y 0 likes en el momento de la consulta, la ultima revision es del 2026-09-26 y no hay datos publicados de latencia, throughput ni soporte en runtimes de inferencia estandar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thegovind/blink-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Demo en Spaces: https://huggingface.co/spaces/thegovind/blink
- Variante blink-27b: https://huggingface.co/thegovind/blink-27b
- Variante blink-mimo-9b: https://huggingface.co/thegovind/blink-mimo-9b
- Codigo fuente: https://github.com/thegovind/blink
- Documentacion: https://thegovind.github.io/blink/
- Documentacion de la API: https://thegovind.github.io/blink/api/
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces encontrados corresponden a otros proyectos sin relacion.
