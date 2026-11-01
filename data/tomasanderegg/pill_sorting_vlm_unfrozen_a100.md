# TomasAnderegg/pill_sorting_vlm_unfrozen_A100

## Resumen

SmolVLA es un modelo compacto de vision-lenguaje-accion (VLA) desarrollado por Hugging Face, diseñado para controlar robots manipuladores a partir de instrucciones en lenguaje natural y observaciones visuales. Esta ficha concreta corresponde a un fine-tuning realizado por TomasAnderegg sobre el checkpoint base `pill_sorting_expert_only_A100_big_data`, especializado en una tarea de clasificación de pastillas por color y forma de compartimento con un robot SO-101 (`so_follower`).

El modelo resuelve el problema de la imitación visual-a-accion en robótica de bajo coste: dado un frame de cámara frontal de 480x640 y el estado articular del robot (6 dimensiones), predice una accion de 6 dimensiones. Su relevancia radica en que SmolVLA se presenta como una alternativa eficiente que puede desplegarse en hardware de consumo, reduciendo el coste computacional frente a VLA de mayor tamano.

Con 450 millones de parametros y un repositorio de 8,6 GB, este checkpoint es un fine-tuning de tarea especifica (12 instrucciones distintas sobre pastillas de colores y compartimentos geometricos) entrenado con LeRobot 0.6.2 sobre el dataset `so101_pill_sorting_v3` (300 episodios, 242.137 frames a 30 FPS). No es un modelo de proposito general: es una politica de robot entrenada por imitacion para un entorno controlado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer compacto) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea estan en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura vision-language-action que combina un codificador visual, un modelo de lenguaje compacto y un cabezal de acciones para producir comandos motores directamente desde observaciones multimodales. El paper asociado (arXiv:2506.01844) la describe como una alternativa eficiente a VLA de mayor tamano, con capacidad de despliegue en hardware de consumo. En este checkpoint, el autor ha fine-tuneado el componente de lenguaje/vision ("vlm_unfrozen") sobre el modelo base `pill_sorting_expert_only_A100_big_data`.

El entrenamiento se realizo con LeRobot 0.6.2 durante 20.000 pasos, batch de 64, optimizador AdamW, learning rate 3e-05 y semilla 1000. El dataset `TomasAnderegg/so101_pill_sorting_v3` contiene 300 episodios y 242.137 frames a 30 FPS, con 12 tareas de instruccion que combinan cuatro colores de pastilla (rojo, verde, amarillo, azul) y cuatro compartimentos (triangulo, cuadrado, circulo, cruz). Las entradas son el estado articular `observation.state` de forma (6,) y la imagen frontal `observation.images.front` de forma (3, 480, 640); la salida es una accion de forma (6,). No se dispone de informacion sobre el numero total de tokens de entrenamiento ni sobre el uso de RLHF o DPO.

## Capacidades

- Control robotico por imitacion: genera acciones de 6 dimensiones a partir de imagenes y estado articular para el robot SO-101 (`so_follower`).
- Seguimiento de instrucciones en lenguaje natural: responde a 12 tareas especificas de clasificacion de pastillas por color y compartimento.
- Percepcion visual: procesa imagenes RGB de 480x640 desde una camara frontal.
- Ejecucion de politicas en bucle cerrado: el script `lerobot-rollout` permite ejecutar la politica de forma continua durante un tiempo determinado.
- No dispone de tool calling, function calling, razonamiento multi-paso generico ni capacidades de agente fuera del dominio robotico entrenado.
- Capacidades multilingues: no disponibles; las instrucciones de entrenamiento estan en ingles.
- No dispone de modo thinking, vision general, audio ni generacion de texto libre.

## Casos de uso

- Clasificacion automatizada de pastillas en laboratorio: el modelo ejecuta instrucciones como "Put the red pill in the triangle compartment" para separar farmacos por color y forma en compartimentos geometricos, adecuado para entornos controlados de laboratorio.
- Prototipado de robotica de bajo coste: al estar basado en SmolVLA, puede desplegarse en hardware de consumo con un robot SO-101, lo que permite a investigadores validar pipelines de imitacion sin GPUs de datacenter.
- Investigacion en imitation learning: sirve como checkpoint de referencia para comparar estrategias de fine-tuning (VLM congelado frente a descongelado) sobre la misma tarea y dataset.
- Benchmark de tareas de pick-and-place: las 12 instrucciones del dataset permiten evaluar la robustez del modelo ante variaciones de color y destino en una tarea repetitiva.
- Educacion y demos de VLA: el comando `lerobot-rollout` facilita demostraciones reproducibles de politicas visuales-accion en ferias, aulas o videos tecnicos.
- Generacion de datos sinteticos de politica: el modelo puede ejecutarse en bucle para recoger trayectorias y ampliar el dataset de entrenamiento con nuevas variaciones de posicion o iluminacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion vacia, con la indicacion de que el autor debe rellenar la tabla de exitos por tarea en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 450 millones de parametros en safetensors (fp32 por defecto), el peso ronda 1,8 GB, por lo que la inferencia en fp16 o bf16 requeriria aproximadamente 1 GB de VRAM mas el overhead del codificador visual y del buffer de imagenes.
- GPU recomendadas: el nombre del checkpoint (`A100`) sugiere que el entrenamiento se realizo en NVIDIA A100; para inferencia, cualquier GPU con al menos 4-8 GB de VRAM deberia ser suficiente.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares, dado el reducido numero de parametros.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de `--policy.device=cuda`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo de accion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pill_sorting_vlm_unfrozen_A100 (este) | 450 M | no disponible | Clasificacion de pastillas SO-101 | apache-2.0 | Hugging Face |
| pill_sorting_expert_only_A100_big_data (base) | no disponible | no disponible | Clasificacion de pastillas SO-101 | no disponible | Hugging Face |
| SmolVLA (original, Hugging Face) | no disponible | no disponible | VLA general compacto | no disponible | Hugging Face / paper |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de tarea especifica: solo ha sido entrenado para 12 instrucciones concretas de clasificacion de pastillas; no generaliza a otras tareas roboticas ni a objetos distintos.
- Dependencia del entorno: el rendimiento puede degradarse con cambios de iluminacion, posiciones de objetos o configuracion de camara distintos a los del dataset de entrenamiento.
- Sin evaluacion publicada: la model card no reporta tasas de exito en robot real, por lo que no hay evidencia cuantitativa de robustez.
- Riesgo de sobreajuste: 20.000 pasos sobre 300 episodios puede producir sobreajuste al dataset; conviene validar en el robot antes de uso en produccion.
- Idiomas: las instrucciones estan en ingles; no se documenta soporte multilingue.
- Licencia apache-2.0: permite uso comercial, pero el modelo base y el dataset pueden tener condiciones adicionales que deben revisarse.
- Sin soporte de tool calling ni agentes: no es adecuado para tareas de lenguaje general, atencion al cliente ni generacion de codigo.
- Advertencia de seguridad fisica: al controlar un robot real, es necesario implementar limites de par, paradas de emergencia y validacion en entorno simulado antes de operar cerca de personas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TomasAnderegg/pill_sorting_vlm_unfrozen_A100
- Modelo base: https://huggingface.co/TomasAnderegg/pill_sorting_expert_only_A100_big_data
- Dataset de entrenamiento: https://huggingface.co/datasets/TomasAnderegg/so101_pill_sorting_v3
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=TomasAnderegg/so101_pill_sorting_v3
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de instalacion: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
