# tory-labs/vica-laya

## Resumen

Vica Laya es un ajuste fino (fine-tune) del modelo multilingue Laya, desarrollado por tory-labs, orientado a la clasificacion y toma de decisiones sobre texto en coreano. No es un modelo generativo al uso: se distribuye como un artefacto compilado para el runtime `laya` de ggmlc, con una grafo de decision embebido y una taxonomia de preguntas tipadas. Su proposito es servir como motor de juicio local dentro de la aplicacion Vica, clasificando fragmentos de noticias en cuatro categorias (seguridad, IA, desarrollo y otros) y resolviendo otras tareas de etiquetado estructurado.

El modelo parte de `convaiinnovations/laya-multilingual` (revision `1720e3e3`) y fue ajustado con ejemplos de juicio en coreano y extractos de noticias publicas, con replay de tareas previas y datos de calibracion separados. Cuenta con 323.182.859 parametros totales y se exporta en cuantizacion Q8_0 dentro de un fichero GGUF de 361.797.216 bytes, aunque este GGUF no es compatible con llama.cpp ni con Ollama, sino unicamente con el ejecutable `laya` de ggmlc v0.9.7.

Su relevancia actual es limitada pero concreta: documenta un caso de uso de clasificacion ligera en dispositivo (posiblemente Apple Silicon), con latencias de daemon caliente de 19,51 ms de mediana y 27,52 ms de p95, y con una evaluacion final honesta de 93/130 aciertos (71,5%) que no alcanza el objetivo interno del 85%. Es un modelo de nicho, con cero descargas y cero likes en el momento de la ficha, y con un conjunto de test ya consumido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Laya multilingue; artefacto compilado `laya.cpp` con grafo de decision) |
| Parametros totales | 323.182.859 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unica exportacion publicada) |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`laya_multilingual_q8_0.gguf`, 361.797.216 bytes), con tokenizer embebido |

## Arquitectura y entrenamiento

El modelo deriva de `convaiinnovations/laya-multilingual` y se distribuye como un artefacto compilado para el runtime `laya` de ggmlc, no como un transformer generativo convencional. El ajuste fino afecto a 22 capas del encoder, con una tasa de aprendizaje de `3e-6` para el encoder y `8e-6` para la cabeza de clasificacion, semilla `20261105` y seleccion de la epoca 3. La ultima etapa aceptada utilizo 1.565 filas de entrenamiento y 415 filas de calibracion, con ejemplos de juicio en coreano, extractos de noticias publicas y replay de tareas previas. La exportacion Q8_0 se realizo con `monatis/ggmlc` en el commit `5490a13661d95add025ec1b111adbc88234a9b4f` (v0.9.7).

El modelo no procesa pixeles de pantalla ni infiere coordenadas: recibe texto y limites de pantalla actuales, y el agente anfitrion gestiona etiquetas, colores, posicionamiento, desplazamiento y observaciones obsoletas. Las respuestas incluyen una categoria seleccionada y puntuaciones que son estimaciones del modelo, no probabilidades calibradas de acierto. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Clasificacion de texto en categorias tipadas mediante preguntas definidas por el usuario (taxonomia de cuatro vias para noticias: `security`, `ai`, `development`, `other`).
- Juicio y toma de decisiones estructurada sobre entradas de texto, con salida de categoria y puntuaciones por opcion.
- Modo workflow: prediccion del siguiente paso en flujos de trabajo (253/272 en el conjunto de regresion).
- Prediccion de siguiente accion (106/138) y etiquetado trabajo/chat (136/138).
- Clasificacion de tipo de mensaje (90/98), deteccion de necesidad de accion (85/98) y estado de evidencia (88/96).
- Soporte bilingue coreano-ingles: diagnostico pareado de 26/32 en cada idioma.
- Ejecucion como daemon con peticiones JSON por linea en stdin, para peticiones repetidas de baja latencia.
- No soporta tool calling generativo, agentes multi-paso ni vision; el soporte de agentes se limita a alimentar decisiones de clasificacion al host.

## Casos de uso

- Clasificacion de noticias tecnologicas: el modelo recibe un extracto y la taxonomia `topic-questions.json` y devuelve una de las cuatro categorias (seguridad, IA, desarrollo, otros). Es adecuado por su entrenamiento especifico en este dominio y su latencia de decenas de milisegundos.
- Enrutamiento de contenido en un agregador o boletin: integrado como daemon, permite etiquetar flujos continuos de articulos con una unica instancia viva y peticiones JSON por linea, reduciendo el coste de arranque por peticion.
- Observador de uso de computadora: el agente anfitrion extrae texto y limites de pantalla y consulta al modelo para decidir la siguiente accion o el tipo de mensaje; el modelo no lee pixeles, pero aporta el juicio de clasificacion.
- Moderacion o triaje de mensajes en coreano: las tareas de tipo de mensaje y necesidad de accion permiten priorizar conversaciones que requieren intervencion humana.
- Clasificacion de estado de evidencia en flujos de soporte: el modelo etiqueta si una evidencia esta presente o es suficiente, como paso previo a la respuesta de un agente mayor.
- Filtrado previo en pipelines de datos: al ser un modelo pequeno (323 M parametros, Q8_0 de ~362 MB), puede ejecutarse en local para descartar o etiquetar articulos antes de enviarlos a modelos mayores, ahorrando coste de inferencia.
- Evaluacion de decisiones en entornos con restricciones de red: al ejecutarse en local con el runtime `laya`, es apto para despliegues en dispositivo sin dependencia de API externa.

## Benchmarks y rendimiento

| Tarea | Resultado |
|---|---|
| Clasificacion de noticias (test final, 130 extractos) | 93/130 (71,5%) |
| Recall medio por clase | 71,1% |
| Recall IA | 13/22 (59,1%) |
| Recall desarrollo | 11/14 (78,6%) |
| Recall negocio/otros | 41/56 (73,2%) |
| Recall seguridad | 28/38 (73,7%) |
| Workflow mode (regresion) | 253/272 |
| Next action (regresion) | 106/138 |
| Work/chat label (regresion) | 136/138 |
| Message kind (regresion) | 90/98 |
| Needs action (regresion) | 85/98 |
| Evidence status (regresion) | 88/96 |
| Diagnostico pareado coreano/ingles | 26/32 en cada idioma |
| Latencia daemon caliente (Apple Silicon, 20 entradas x 3 repeticiones) | 19,51 ms mediana / 27,52 ms p95 |

La version local previa alcanzo 71/130 (54,6%) en el mismo test final, pero la comparacion no es contra el modelo upstream sin tocar. Los conjuntos de regresion se usaron durante el desarrollo y no constituyen tests finales independientes. Las etiquetas de referencia fueron redactadas por un asistente independiente y no fueron adjudicadas por humanos. El test final ya esta consumido.

## Requisitos de hardware

- VRAM estimada: el fichero Q8_0 ocupa 361.797.216 bytes (~345 MiB), por lo que la inferencia cabe holgadamente en cualquier GPU consumer con al menos 1 GB de memoria libre; en la practica el cuello de botella es el runtime, no la memoria.
- GPU recomendadas: no se especifican en la informacion disponible; las mediciones publicadas se hicieron en una maquina local con Apple Silicon (CPU/GPU integrada).
- Cabe en GPU consumer: si, dado el tamano del artefacto, aunque no hay lista de GPUs validadas.
- Opciones de despliegue: exclusivamente el runtime `laya` de ggmlc v0.9.7 (modo `decide` o `daemon`). No es compatible con llama.cpp, Ollama, vLLM ni TGI, al ser un artefacto compilado con grafo de decision, no un LLM generativo GGUF.
- Latencia y throughput: 19,51 ms de mediana y 27,52 ms de p95 en round-trip de daemon caliente sobre una carga fija de calibracion de 20 entradas repetidas tres veces en Apple Silicon. No se publica throughput ni latencia en otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vica Laya (tory-labs) | 323 M | no disponible | Clasificacion de juicio en coreano | Apache 2.0 | HuggingFace, runtime `laya` |
| convaiinnovations/laya-multilingual (upstream) | no disponible | no disponible | Modelo multilingue base | Apache 2.0 | HuggingFace |
| Modelos de clasificacion tipo BERT multilingue | ~100-300 M | 512 tokens tipico | Clasificacion de texto generica | variable | HuggingFace, transformers |

No se dispone de resultados de benchmarks comparativos contra alternativas en la informacion proporcionada. La comparacion con el upstream no es posible porque el autor no publica resultados del modelo base sin ajustar sobre el mismo test. Los modelos BERT multilingues se incluyen como referencia de categoria por tamano, no por rendimiento medido.

## Limitaciones y advertencias

- El test final de 130 extractos ya esta consumido y sus etiquetas no fueron adjudicadas por humanos, por lo que la cifra de 71,5% debe interpretarse con cautela.
- No alcanza el objetivo interno del 85% de precision; el recall de la clase IA es especialmente bajo (59,1%).
- Las puntuaciones de confianza pueden ser altas en respuestas incorrectas; no deben tratarse como probabilidades calibradas.
- Los articulos ambiguos y la frontera entre aplicaciones de IA, desarrollo general, lanzamientos tecnicos y anuncios de negocio son fuentes de error documentadas.
- El modelo no lee pixeles ni infiere coordenadas de pantalla; requiere que el host aporte texto y limites actuales.
- Cambiar las instrucciones de las preguntas puede alterar la precision; para reproducir el resultado publicado hay que usar `topic-questions.json`.
- El artefacto solo funciona con el runtime `laya` de ggmlc v0.9.7; no es desplegable en llama.cpp, Ollama, vLLM ni TGI.
- Los conjuntos de regresion se usaron durante el desarrollo y no son tests finales independientes.
- No se incluyen ejemplos de entrenamiento/evaluacion en bruto, logs locales ni el modelo de enrutamiento separado de Vica.
- Cobertura linguistica limitada a coreano e ingles; no hay datos sobre otros idiomas.
- Aunque la licencia es Apache 2.0 y permite uso comercial, se trata de un derivado modificado, no de una release oficial de Laya; deben conservarse `LICENSE` y `NOTICE`.
- El repositorio registra cero descargas y cero likes, sin validacion externa por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tory-labs/vica-laya
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Revision del modelo base: https://huggingface.co/convaiinnovations/laya-multilingual/blob/1720e3e3357cfe1e281542e223f8273b0890ca34/README.md
- Runtime ggmlc v0.9.7: https://github.com/monatis/ggmlc/releases/tag/v0.9.7
- Repositorio ggmlc: https://github.com/monatis/ggmlc
