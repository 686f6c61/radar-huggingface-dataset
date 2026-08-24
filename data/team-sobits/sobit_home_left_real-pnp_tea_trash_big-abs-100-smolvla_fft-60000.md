# team-sobits/sobit_home_left_real-pnp_tea_trash_big-abs-100-smolvla_fft-60000

## Resumen

SmolVLA es un modelo compacto de vision-lenguaje-accion (VLA) desarrollado por Hugging Face y presentado en el articulo arxiv:2506.01844. Combina un modelo de vision-lenguaje con una cabeza de accion para controlar robots, y esta disenado para ofrecer un rendimiento competitivo a un coste computacional reducido, pudiendo desplegarse en hardware de consumo. Este checkpoint concreto, publicado por el equipo SOBITS de la Universidad de Soka, es un ajuste fino completo (FFT) del modelo base `lerobot/smolvla_base` para la tarea de lanzar una botella de plastico a una papelera con el robot movil manipulador SOBIT HOME.

El modelo cuenta con 450.046.176 parametros y fue entrenado con 100 episodios teleoperados (22.125 frames a 10 FPS) recopilados en un entorno domestico real. Se trata de un checkpoint intermedio en el paso 60.000 de un entrenamiento planificado a 90.000 pasos, cuyo modelo final se publica por separado. El entrenamiento se realizo con el framework LeRobot (version 0.6.0) y el modelo se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-lenguaje-accion, transformer multimodal) |
| Parametros totales | 450.046.176 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, tipicamente bf16/fp32) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-lenguaje-accion compacto que procesa entradas multimodales: dos flujos de imagen (camara de cabeza y camara de mano izquierda, ambas a resolucion 480x640) junto con un vector de estado del robot de 20 dimensiones. La salida es un vector de accion de 20 dimensiones. Al ser un modelo denso (no MoE), todos los parametros se activan en cada inferencia.

El entrenamiento se realizo mediante ajuste fino completo (full fine-tuning, FFT) desde el modelo base `lerobot/smolvla_base`, utilizando el framework LeRobot. La configuracion de entrenamiento incluye 60.000 pasos (checkpoint intermedio de un run de 90.000), batch size de 16, optimizador AdamW, learning rate de 0.0001 y seed 1000. El dataset de entrenamiento, `team-sobits/sobit_home_left_real-pnp_tea_trash_big-abs-100`, contiene 100 episodios de teleoperacion con 22.125 frames capturados a 10 FPS, correspondientes a la tarea "Throw the plastic bottle into the trash bin" (lanzar la botella de plastico a la papelera) en un entorno real.

## Capacidades

- Control de robot movil manipulador: genera vectores de accion de 20 dimensiones a partir de observaciones de camara y estado articular.
- Percepcion multimodal: procesa simultaneamente dos camaras RGB (cabeza y mano izquierda) a 480x640, lo que permite combinar informacion de la escena y del efector final.
- Tarea especifica entrenada: lanzamiento de una botella de plastico a una papelera, incluyendo la coordinacion brazo-mano necesaria para el agarre y el lanzamiento.
- Inferencia en hardware de consumo: gracias a sus 450M de parametros, el modelo esta disenado para ejecutarse en GPUs de gama media.
- Integracion con LeRobot: compatible con el ecosistema de entrenamiento, evaluacion y despliegue de politicas robotica de Hugging Face.
- Capacidades de vision-lenguaje heredadas del base SmolVLA: el modelo base conserva las competencias de comprension visual y linguistica de SmolVLM, aunque la model card no detalla su alcance en este checkpoint.

## Casos de uso

- Manipulacion de objetos en el hogar: el modelo puede ejecutar la tarea de recoger una botella de plastico y lanzarla a una papelera, un caso representativo de tareas domesticas de limpieza y organizacion.
- Investigacion en aprendizaje por imitacion: sirve como referencia para estudiar el rendimiento de politicas VLA compactas entrenadas con pocos episodios (100) en entornos reales no simulados.
- Evaluacion de generalizacion en robotica: al ser un checkpoint intermedio, permite analizar la evolucion del rendimiento a lo largo del entrenamiento comparandolo con el modelo final de 90.000 pasos.
- Despliegue en robots moviles con manipulador: el robot SOBIT HOME, con traccion de cuatro ruedas con direccion independiente, mecanismo de elevacion y doble brazo, puede ejecutar la politica mediante el comando `lerobot-rollout` de LeRobot.
- Fine-tuning para nuevas tareas: el checkpoint puede usarse como punto de partida para ajustes finos adicionales en tareas de manipulacion similares, aprovechando el conocimiento ya adquirido.
- Benchmark de politicas VLA en hardware asequible: dado su tamano reducido, es adecuado para laboratorios con recursos limitados que necesiten comparar arquitecturas VLA sin requerir GPUs de alta gama.
- Integracion en sistemas de robotica de servicio: la tarea de depositar objetos en contenedores es un componente habitual en escenarios de asistencia domestica y entornos de competicion como RoboCup@Home, donde participa el equipo SOBITS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica ("No evaluation results have been provided for this policy yet").

## Requisitos de hardware

- VRAM estimada para inferencia: con 450M de parametros en precision bf16, los pesos ocupan aproximadamente 0,9 GB; con activaciones y overhead del runtime, se estima un consumo total de 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU de consumo con 6 GB o mas de VRAM es suficiente, como NVIDIA RTX 3060, RTX 4060, RTX 4070 o superiores. Tambien es viable en GPUs de portatil de gama media.
- Compatibilidad con hardware de consumo: si, es uno de los objetivos de diseno de SmolVLA, a diferencia de modelos VLA mas grandes como OpenVLA (7B) que requieren mas recursos.
- Opciones de despliegue: el flujo principal es mediante el framework LeRobot, usando el comando `lerobot-rollout` con `--strategy.type=base`. Tambien es posible integrarlo en pipelines personalizados de PyTorch.
- Latencia y throughput: no se han publicado mediciones especificas de latencia para este checkpoint. Dado el tamano del modelo, se espera una inferencia en tiempo real (10 FPS o superior) en GPUs de consumo modernas, pero este dato no esta confirmado por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| team-sobits/sobit_home_left_real-pnp_tea_trash_big-abs-100-smolvla_fft-60000 | 450M | no disponible | Apache-2.0 | Checkpoint intermedio, fine-tuning de SmolVLA para tarea especifica |
| lerobot/smolvla_base | 450M (estimado) | no disponible | Apache-2.0 | Modelo base pretreinado, sin fine-tuning por tarea |
| team-sobits/sobit_home_left_real-pnp_tea_trash_big-abs-100-smolvla_fft-90000 | 450M (estimado) | no disponible | Apache-2.0 | Modelo final del mismo entrenamiento, 90.000 pasos |
| OpenVLA (referencia de la categoria) | 7B | no disponible | MIT (investigacion) | VLA de mayor tamano, requiere hardware mas potente |

No se dispone de datos de rendimiento comparativo publicados para estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Checkpoint intermedio: este modelo corresponde al paso 60.000 de un entrenamiento de 90.000 pasos; el rendimiento puede ser inferior al del modelo final publicado por separado.
- Tarea especifica: el modelo esta entrenado unicamente para la tarea de lanzar una botella de plastico a una papelera; no se garantiza su funcionamiento en otras tareas sin fine-tuning adicional.
- Dataset reducido: 100 episodios de entrenamiento es una cantidad limitada, lo que puede afectar a la generalizacion ante variaciones de posicion de objetos, iluminacion o distracciones en el entorno.
- Sin evaluacion publicada: no hay resultados de tasa de exito ni evaluaciones en robot real reportados por el autor, por lo que se desconoce el rendimiento efectivo.
- Dependencia del entorno de entrenamiento: los datos se recopilaron en un entorno domestico especifico (SOBIT HOME); el modelo puede degradarse en entornos con configuraciones muy diferentes.
- Requisitos de camaras: la politica requiere exactamente las dos camaras especificadas (`head_camera` y `hand_left_camera`) con las resoluciones y nombres de clave de observacion usados en el entrenamiento.
- Restricciones de uso: aunque la licencia Apache-2.0 permite uso comercial, el modelo depende del ecosistema LeRobot y del robot SOBIT HOME para su despliegue efectivo, lo que limita su portabilidad a otras plataformas roboticas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/team-sobits/sobit_home_left_real-pnp_tea_trash_big-abs-100-smolvla_fft-60000
- Modelo final (90.000 pasos): https://huggingface.co/team-sobits/sobit_home_left_real-pnp_tea_trash_big-abs-100-smolvla_fft-90000
- Dataset de entrenamiento: https://huggingface.co/datasets/team-sobits/sobit_home_left_real-pnp_tea_trash_big-abs-100
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=team-sobits/sobit_home_left_real-pnp_tea_trash_big-abs-100
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Documentacion de LeRobot sobre SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Equipo SOBITS (GitHub): https://github.com/TeamSOBITS
- Repositorio SOBIT HOME: https://github.com/TeamSOBITS/sobit_home/blob/jazzy-devel/README.md
- Video de calificacion RoboCup@Home 2026: https://www.youtube.com/watch?v=lC7Ppz0_oMU
