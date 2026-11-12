# Yuanyuan-Lee/robotrtc-pi05-vace-4tasks-ft30k-rtc15k

## Resumen

El repositorio `Yuanyuan-Lee/robotrtc-pi05-vace-4tasks-ft30k-rtc15k` publica cuatro políticas de accion independientes para robotica construidas sobre PI0.5 (OpenPI), una arquitectura vision-language-action (VLA) desarrollada por Physical Intelligence. Cada paquete corresponde a una tarea manipulativa concreta (apilar tres cuencos, pasar un bloque de madera entre brazos, girar y colgar una taza, y colocar una lata en una cesta) y contiene sus propios pesos, estadisticas de normalizacion, configuracion, tokenizer, codigo de inferencia y ejemplos.

El modelo base PI0.5 combina un backbone vision-language derivado de PaliGemma/Gemma con un cabezal de acciones, y en este caso se entrena partiendo de PI0.5 preentrenado con una rama auxiliar de video Wan2.1 VACE inicializada aleatoriamente (2.153.972.032 parametros) que se usa solo durante el entrenamiento. Cada politica final tiene 3.353.433.872 parametros (BF16, no EMA) y se entrena con 30.000 actualizaciones de fine-tuning seguidas de 15.000 actualizaciones RTC (Real-Time Chunking) partiendo del modelo ya ajustado.

La relevancia de esta publicacion es doble: por un lado, ofrece pesos de politicas VLA listos para inferencia de acciones en tareas de manipulacion bimanual; por otro, documenta explicitamente el proceso de entrenamiento (fine-tuning + RTC) y separa la rama auxiliar de video del artefacto de inferencia. Es un ejemplo de publicacion reproducible de politicas roboticas, con validacion de software pero sin tasas de exito en robot real reportadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en PI0.5 (OpenPI) con backbone PaliGemma/Gemma; rama auxiliar de video Wan2.1 VACE solo en entrenamiento |
| Parametros totales | 3.353.433.872 por politica (4 politicas independientes) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos publicados en bfloat16); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (modelo orientado a acciones roboticas) |
| Licencia | openpi-apache-2.0-with-gemma-terms (terminos por componente; ver LICENSES.md de cada tarea) |
| Formato de pesos | safetensors (BF16, no EMA, 6.707.002.640 bytes por tarea) |

## Arquitectura y entrenamiento

Cada politica es una PI0.5 action policy: un modelo vision-language-action que recibe observaciones visuales y estado del robot y produce acciones motoras. El backbone vision-language deriva de PaliGemma/Gemma (segun los terminos de licencia citados), y el entrenamiento parte de PI0.5 preentrenado. Sobre esa base se anade una rama auxiliar de video Wan2.1 VACE con 2.153.972.032 parametros inicializados aleatoriamente, que actua como auxiliar de entrenamiento y no forma parte de la inferencia de acciones.

El regimen de entrenamiento por tarea es de 30.000 actualizaciones de fine-tuning seguidas de 15.000 actualizaciones RTC (Real-Time Chunking) partiendo del modelo ya ajustado. Los datasets de demostracion son pequenos y especificos: 100 demostraciones por tarea, con entre 50.419 y 55.329 frames (bowl_11.2: 54.430 frames; wood_10.30: 54.846; cup_10.29: 50.419; drinks_11.3: 55.329). No se documentan en la informacion disponible detalles sobre composicion del dataset, RLHF/DPO ni innovaciones adicionales mas alla de la integracion de RTC y de la rama VACE auxiliar.

## Capacidades

- Generacion de acciones motoras para manipulacion robotica a partir de observaciones visuales y estado del robot.
- Politicas especializadas por tarea: apilado de cuencos, traspaso de bloque entre brazos, rotacion y colgado de taza, y colocacion de lata en cesta con elevacion de la cesta.
- Soporte de RTC (Real-Time Chunking) para prefix-conditioning en tiempo real, con ejemplos incluidos en cada paquete.
- Inferencia de acciones con preprocesamiento compatible con el entrenamiento y mapeo de salidas documentado.
- No se documentan capacidades de tool calling, function calling, agentes multi-step, vision general, audio ni modo thinking.
- Capacidades multilingues: no disponibles (el modelo no esta orientado a texto general).

## Casos de uso

- Manipulacion bimanual en laboratorio: usar el paquete `wood` para entrenar o evaluar una politica de traspaso de objeto entre brazos y colocacion en una zona objetivo, aprovechando las 100 demostraciones y el pipeline de inferencia incluido.
- Apilado de objetos en entornos controlados: el paquete `bowl` permite reproducir la tarea de apilar tres cuencos como banco de pruebas para comparar variantes de PI0.5 o de RTC.
- Investigacion en VLA: emplear los cuatro paquetes como referencia para estudiar el efecto de 15.000 actualizaciones RTC sobre un fine-tuning de 30.000 pasos, ya que cada tarea parte de su propio modelo ajustado.
- Desarrollo de controladores roboticos: integrar la inferencia de acciones en un stack de control propio, dado que la captura de observaciones, la alineacion de reloj de control y la integracion de actuadores quedan en manos del controlador del usuario.
- Evaluacion de robustez por tarea: comparar el rendimiento de las cuatro politicas en tareas con distinta complejidad (apilado, traspaso, rotacion y colgado, colocacion con elevacion) para identificar que tareas requieren mas datos o ajuste.
- Reproduccion de pipelines OpenPI: usar los paquetes como ejemplo de empaquetado reproducible (pesos, tokenizer, codigo, dependencias y licencias por tarea) para publicar politicas propias con el mismo formato.
- Prototipado de tareas de pick-and-place: el paquete `drinks` sirve como base para tareas de colocacion en contenedor y elevacion con el brazo libre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la finalizacion del entrenamiento y las comprobaciones de inferencia de software no son medidas de exito en robot real, y que esta release no reporta tasa de exito en robot real ni establece temporizacion extremo a extremo del robot.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; los pesos por tarea son de aproximadamente 6,7 GB en BF16, por lo que se requiere al menos esa cantidad de memoria mas el overhead de activaciones y del runtime de inferencia.
- GPU recomendadas: no disponible; no se especifican modelos de GPU en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el tamano de pesos BF16 (6,7 GB) es compatible en memoria con GPUs de consumo de gama alta, pero no se documenta soporte ni rendimiento.
- Opciones de despliegue: cada paquete incluye su propio codigo de inferencia y fichero de dependencias; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| robotrtc-pi05-vace-4tasks-ft30k-rtc15k | 3.353.433.872 por politica | no disponible | VLA para manipulacion robotica (4 tareas) | openpi-apache-2.0-with-gemma-terms | Hugging Face (repo publico) |
| PI0.5 (OpenPI, base) | no disponible en la informacion | no disponible | VLA generalista | Apache 2.0 (OpenPI) con terminos Gemma | OpenPI en GitHub |
| PaliGemma-3B (backbone) | no disponible en la informacion | no disponible | Vision-language | Terminos Gemma | Hugging Face (google/paligemma-3b-pt-224) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No se reporta tasa de exito en robot real; la validacion cubierta es de software (carga del modelo, preprocesamiento, mapeo de salidas y comportamiento del prefijo RTC).
- La captura de observaciones, la alineacion del reloj de control y la integracion de actuadores son responsabilidad del controlador del usuario; el modelo no establece temporizacion extremo a extremo.
- Cada tarea es una politica independiente con solo 100 demostraciones; la generalizacion fuera de la distribucion de entrenamiento no esta documentada.
- La rama auxiliar VACE (2.153.972.032 parametros) no forma parte de la inferencia; intentar usarla como parte del modelo de acciones no es el uso previsto.
- Licencia compuesta: el codigo OpenPI conserva Apache 2.0, pero los terminos de PaliGemma/Gemma aplican al material derivado; es necesario revisar el LICENSES.md de cada tarea antes de uso comercial.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de idioma; el modelo no es de texto general.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yuanyuan-Lee/robotrtc-pi05-vace-4tasks-ft30k-rtc15k
- OpenPI (repositorio upstream): https://github.com/Physical-Intelligence/openpi
- PaliGemma-3B: https://huggingface.co/google/paligemma-3b-pt-224
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Licencias por tarea: https://huggingface.co/Yuanyuan-Lee/robotrtc-pi05-vace-4tasks-ft30k-rtc15k/blob/main/bowl/LICENSES.md (analogamente para `wood/`, `cup/` y `drinks/`)
