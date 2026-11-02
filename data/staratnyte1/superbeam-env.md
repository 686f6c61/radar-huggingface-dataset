# StarAtNyte1/superbeam-env

## Resumen

SUPERBEAM Environment es un entorno de aprendizaje por refuerzo publicado en Hugging Face bajo el identificador `StarAtNyte1/superbeam-env` por el usuario StarAtNyte1. No se trata de un modelo de lenguaje al uso, sino de un paquete que sirve un videojuego de plataformas de desplazamiento lateral, escrito en ensamblador CHIP-8 (pantalla monocroma de 64x32), a traves de la interfaz OpenEnv: operaciones `reset`, `step` y `state` sobre HTTP y WebSocket. El objetivo es entrenar agentes con tecnicas de RL, en particular TRL GRPO, sobre un entorno ligero y determinista que corre en CPU mediante un emulador CHIP-8 en Python puro, sin dependencia de torch.

La relevancia del paquete radica en dos frentes. Por un lado, ofrece un entorno de referencia listo para usar con OpenEnv y con un servidor alojado en Modal, lo que reduce la friccion para experimentar con GRPO multirronda. Por otro, el repositorio incluye un artefacto poco habitual: una "computadora en pesos" construida a mano dentro de un modelo `BeamForCausalLM` de 7 capas y 640 dimensiones ocultas en fp32, que ejecuta el emulador CHIP-8 mediante atencion y MLP, sin entrenamiento. Este segundo backend permite estudiar la interpretabilidad del circuito de memoria RAM del modelo.

La informacion disponible no incluye datos sobre parametros totales del modelo de lenguaje, contexto, licencia ni idiomas, por lo que muchos campos de la ficha quedan marcados como no disponibles. El paquete se distribuye como entorno (SDK docker, puerto 8000) y no como pesos de un modelo generativo convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Entorno OpenEnv sobre emulador CHIP-8 en Python puro; backend alternativo: modelo `BeamForCausalLM` de 7 capas y 640 dimensiones ocultas en fp32 |
| Parametros totales | no disponible (el modelo Beam interno es de 7 capas, hidden 640, fp32; no se especifica el numero de parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el modelo Beam interno se describe en fp32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el paquete se sirve como entorno dockerizado; el backend Beam usa `BeamForCausalLM` con torch/transformers) |

## Arquitectura y entrenamiento

El componente principal es un entorno de RL que encapsula un juego de plataformas original escrito en ensamblador CHIP-8. La simulacion la realiza un emulador CHIP-8 en Python puro que corre en CPU, sin torch. La interfaz sigue el contrato de OpenEnv: `reset()` acepta `seed`, `level`, `difficulty`, `frame_skip` y `max_frames`, y `step()` recibe una accion entre `noop`, `left`, `right`, `jump`, `right+jump` y `left+jump`. Cada accion se mantiene durante `frame_skip` fotogramas (por defecto 4). La observacion incluye la pantalla en ASCII etiquetada, una linea de hechos (`facts`), el frame crudo de 32x64 bits, recompensa, estado de fin de episodio y variables numericas de posicion y progreso.

El segundo backend es un modelo `BeamForCausalLM` construido a mano, sin entrenamiento, que implementa la computadora CHIP-8 dentro de sus pesos. Segun la model card, el modelo tiene 7 capas y 640 dimensiones ocultas en fp32, con atencion que actua como RAM de ultima escritura, MLP que actua como ALU y emision de su propio reloj. El paquete incluye decodificacion especulativa por fotograma: el emulador propone un frame, una pasada forward verifica cada token y la decodificacion greedy del propio modelo prevalece ante cualquier discrepancia. Tambien se incluye una sonda de atencion (`attention_probe.py`) que, segun la model card, muestra que la cabeza 0 de la capa 5 concentra mas del 99 % de su peso en la escritura mas reciente al registro leido, en las 126 lecturas de registro del fotograma 6. No se detallan datos de entrenamiento del modelo Beam porque, segun la informacion disponible, se construye sin entrenamiento.

## Capacidades

- Servir un entorno de RL compatible con OpenEnv mediante HTTP y WebSocket, con operaciones `reset`, `step` y `state`.
- Ejecutar un juego de plataformas CHIP-8 con acciones discretas y recompensas densas por progreso, monedas, victoria y muerte.
- Entrenamiento con TRL GRPO en modo multirronda mediante la herramienta `act`; el ejemplo incluye un modo `--smoke` con 2 pasos reales en una GPU de 6 GB.
- Soporte de niveles clasicos, por semilla entera o procedimentales (`random`), con dificultad configurable, cuando el `SuperBeamEnv` incluido lo permite.
- Ejecucion del emulador CHIP-8 dentro de un modelo `BeamForCausalLM` como backend alternativo (`backend="beam-weights"`), con verificacion especulativa por fotograma.
- Sonda de interpretabilidad para leer el circuito de RAM del forward real del modelo.
- Suite de tests (`vendor/tests/`, 9 tests) que compara token a token contra el emulador.
- No se documentan capacidades de generacion de texto, vision, audio, tool calling general ni razonamiento multilingue, ya que no es un modelo de proposito general.

## Casos de uso

- Entrenamiento de agentes con GRPO: usar el entorno con TRL para ajustar un modelo que actue como politica sobre las seis acciones discretas, aprovechando la recompensa por episodio y el modo `--smoke` para validar el pipeline en una GPU de 6 GB.
- Investigacion en RL de entornos ligeros: el emulador en CPU y la interfaz OpenEnv permiten iterar rapido sobre algoritmos sin depender de aceleradores, con observaciones estructuradas (ASCII, bits crudos y hechos textuales).
- Evaluacion de politicas de videojuegos: el entorno expone `progress`, `won`, `dead`, `truncated`, muertes, mejor progreso y monedas, lo que facilita metricas de evaluacion reproducibles con semillas fijas.
- Estudio de interpretabilidad mecanicista: el backend `beam-weights` y la sonda de atencion permiten analizar como un transformer implementa memoria RAM y ALU, con verificacion contra el emulador de referencia.
- Docencia y demos: el servidor alojado en Modal y la demo publica permiten ver jugar al agente o jugar manualmente, util para talleres sobre OpenEnv y GRPO.
- Benchmarking de entornos OpenEnv: el paquete sirve como referencia para comparar latencia, throughput y estabilidad de servidores de entorno entre implementaciones.
- Pruebas de integracion de agentes: el contrato HTTP/WebSocket con documentacion en `/docs` permite conectar clientes externos y validar flujos multirronda con `frame_skip` y `max_frames` configurables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una evaluacion verificada del backend Beam y una sonda de atencion con mas del 99 % de peso en la escritura mas reciente en las 126 lecturas de registro del fotograma 6, pero no se aportan tablas comparativas de MMLU, HumanEval, GSM8K ni metricas de RL agregadas.

## Requisitos de hardware

- Inferencia del entorno principal: CPU unicamente, Python puro, sin torch; requisitos de software `openenv`, `uvicorn`, `numpy` y `websockets`.
- Backend `beam-weights`: requiere `torch` y `transformers` con soporte de Beam; el modelo interno es de 7 capas y 640 dimensiones ocultas en fp32, por lo que cabe en GPU de consumo y en CPU, aunque no se especifica VRAM exacta.
- Entrenamiento GRPO: el modo `--smoke` ejecuta 2 pasos reales en una GPU de 6 GB; no se detallan requisitos para entrenamientos completos.
- Despliegue: servidor FastAPI/uvicorn en el puerto 8000, imagen Docker incluida (`envs/superbeam_env/server/Dockerfile`) y servidor publico en Modal con escalado a cero (la primera peticion puede tardar unos 30 s).
- No se proporcionan datos de latencia ni throughput estimados para inferencia o entrenamiento.
- Opciones de despliegue documentadas: local con uvicorn, Docker y Modal; no se mencionan vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (entornos OpenEnv o emuladores CHIP-8 en pesos) ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- No es un modelo de lenguaje de proposito general: no se documentan capacidades de generacion, razonamiento, codigo, vision ni tool calling fuera del contrato del entorno.
- La licencia no esta disponible, por lo que no se puede confirmar el uso comercial ni la redistribucion.
- No se especifican idiomas soportados ni sesgos conocidos; la informacion es insuficiente para evaluar riesgos de alucinacion en el sentido habitual.
- El servidor publico en Modal escala a cero y la primera peticion puede tardar aproximadamente 30 s, lo que afecta a la latencia percibida.
- El soporte de `level` y `difficulty` depende de que el `SuperBeamEnv` incluido lo implemente; en caso contrario, se ignoran.
- El backend `beam-weights` se describe como una computadora en pesos construida sin entrenamiento; su fidelidad se verifica contra el emulador con 9 tests, pero no se documentan limites de escala ni de generalizacion.
- El paquete registra cero descargas y cero likes en el momento de la consulta, lo que sugiere poca validacion externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/StarAtNyte1/superbeam-env
- Demo publica: https://staratnyte1-beam-boot.static.hf.space/
- Servidor alojado en Modal: https://baptinjean20--superbeam-env-web.us-east.modal.run (documentacion API en `/docs`)
- OpenEnv: https://github.com/meta-pytorch/OpenEnv
