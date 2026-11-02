# ts-flake/smolvla_robotwin

## Resumen

SmolVLA es un modelo compacto de vision-lenguaje-accion (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, disenado para controlar robots manipuladores a partir de observaciones visuales e instrucciones en lenguaje natural. Esta ficha concreta, `ts-flake/smolvla_robotwin`, es un fine-tuning del checkpoint `lerobot/smolvla_robotwin` sobre el dataset `ts-flake/robotwin_clean_soarmx`, orientado a tareas de apilado de platos con un robot SO-ARM100/101 simulado de doble brazo.

El modelo resuelve el problema de la politica robotica de proposito general en hardware de consumo: con unos 450 millones de parametros y un repositorio de 0,9 GB en safetensors, puede ejecutarse en GPUs consumer, algo poco habitual en modelos VLA. La arquitectura combina un backbone visual-lenguaje con un experto de accion (action expert) segun el paper SmolVLA (arXiv:2506.01844), y se integra de forma nativa con la libreria LeRobot para entrenamiento e inferencia.

Es relevante ahora porque demuestra el flujo completo de fine-tuning de politicas VLA en datasets pequenos y especificos (50 episodios, 11.128 frames a 15 FPS), un patron cada vez mas comun en robotica de investigacion y prototipado. No obstante, es un checkpoint de nicho: cero descargas y cero likes en el momento de la consulta, y su utilidad practica esta acotada al dominio de apilado de platos en simulacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) SmolVLA: backbone VLM con experto de accion |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (politica de control por pasos, no modelo conversacional) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea estan en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

SmolVLA sigue la arquitectura propuesta en el paper arXiv:2506.01844: un modelo vision-lenguaje compacto que procesa imagenes de camaras e instrucciones textuales, acoplado a un experto de accion que genera comandos motores continuos. La politica consume tres flujos visuales de 3x480x640 (camara alta, muneca izquierda y muneca derecha), un vector de estado de 14 dimensiones y produce un vector de accion tambien de 14 dimensiones, adecuado para un robot de doble brazo.

El fine-tuning se realizo sobre el dataset `ts-flake/robotwin_clean_soarmx`: 50 episodios, 11.128 frames a 15 FPS, con tareas de apilado de platos descritas en lenguaje natural (por ejemplo, "Pick up the round plate, place it down, then position the dish plate on top"). El tipo de robot declarado es `xlerobot_soarmx_sim`, es decir, simulacion. No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base, la composicion del dataset original ni si hubo etapas de RLHF o DPO; la model card no los detalla.

## Capacidades

- Generacion de acciones motoras continuas de 14 dimensiones para un robot manipulador de doble brazo.
- Percepcion visual multi-camara: procesa simultaneamente tres vistas de 480x640 (camara alta y dos de muneca).
- Comprension de instrucciones de tarea en lenguaje natural en ingles para guiar la manipulacion.
- Ejecucion de tareas de apilado y colocacion de platos y vajilla en simulacion.
- Integracion nativa con LeRobot para entrenamiento, evaluacion y despliegue.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM; es una politica de control, no un agente conversacional.
- Capacidades multilingues: no disponibles; las instrucciones del dataset estan en ingles.
- No dispone de modo thinking, vision generativa, audio ni otras capacidades multimodales mas alla de la percepcion visual para control.

## Casos de uso

- Investigacion en politicas VLA: servir como punto de partida para experimentos de fine-tuning sobre nuevos datasets de robotica, gracias a su tamano reducido y a la integracion con LeRobot.
- Prototipado de manipulacion de doble brazo en simulacion: el modelo ejecuta tareas de apilado de platos con un robot SO-ARM100/101 simulado, util para validar pipelines antes de pasar a hardware real.
- Benchmark de referencia para datasets propios: permite comparar el rendimiento de un dataset nuevo frente a este checkpoint entrenado con 50 episodios y 11.128 frames.
- Educacion y demos de robotica: su bajo coste computacional permite desplegarlo en laboratorios docentes con GPUs consumer para ilustrar el ciclo observacion-accion en VLA.
- Generacion de datos sinteticos de control: puede emplearse como politica base para recolectar trayectorias adicionales en simulacion y ampliar datasets de apilado.
- Evaluacion de robustez visual: al consumir tres camaras, sirve para estudiar como afectan oclusiones o cambios de iluminacion en la camara de muneca a la precision del apilado.
- Integracion en pipelines de investigacion reproducibles: el formato safetensors y la libreria lerobot facilitan versionar y reproducir experimentos en entornos de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 0,9 GB en safetensors; en precision completa (fp32) los 450 millones de parametros ocupan aproximadamente 1,8 GB, por lo que con overhead de activaciones y las tres imagenes de 480x640 se puede estimar un consumo de unos 3-6 GB de VRAM, aunque no hay cifras oficiales publicadas.
- GPU recomendadas: al tratarse de un modelo disenado para hardware de consumo, es adecuado para RTX 3060/4060 en adelante; tambien funciona en A100 o H100 sin aprovechar su capacidad.
- Cabe en GPU consumer: si, segun la propia model card, que lo describe como desplegable en hardware de consumo.
- Opciones de despliegue: LeRobot (libreria oficial); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a una politica de control.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ts-flake/smolvla_robotwin | 450 M | no disponible | VLA para apilado de platos en simulacion | apache-2.0 | Hugging Face (0 descargas) |
| lerobot/smolvla_robotwin | no disponible | no disponible | VLA base para Robotwin | no disponible | Hugging Face |
| SmolVLA (paper, arXiv:2506.01844) | no disponible | no disponible | VLA compacto de proposito general | no disponible | Publicacion |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Dominio muy acotado: entrenado exclusivamente con tareas de apilado de platos en simulacion; no se espera generalizacion a otras tareas o entornos sin reentrenamiento.
- Dataset pequeno: 50 episodios y 11.128 frames, lo que limita la robustez frente a variaciones de iluminacion, posiciones u objetos no vistos.
- Simulacion: el tipo de robot declarado es `xlerobot_soarmx_sim`; el rendimiento en hardware real no esta validado en la informacion disponible.
- Riesgo de alucinacion en el sentido de acciones incorrectas o inseguras: como toda politica de control, puede ejecutar movimientos no deseados; requiere limites de seguridad en el robot.
- Sesgos conocidos: no documentados, pero el dataset esta restringido a un conjunto concreto de objetos (platos ceramicos, platos verdes, etc.).
- Idioma: las instrucciones estan en ingles; no hay soporte multilingue documentado.
- Licencia apache-2.0: permite uso comercial, pero el modelo base y el dataset pueden tener sus propias condiciones que conviene verificar.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni validacion externa del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ts-flake/smolvla_robotwin
- Modelo base: https://huggingface.co/lerobot/smolvla_robotwin
- Dataset de entrenamiento: https://huggingface.co/datasets/ts-flake/robotwin_clean_soarmx
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Guia LeRobot SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
