# w3joe/act-warp-duplo-417-20261114

## Resumen

`w3joe/act-warp-duplo-417-20261114` es un checkpoint de política robótica basado en ACT (Action Chunking Transformer) publicado en Hugging Face bajo el pipeline `robotics` y la librería LeRobot. Lo desarrolla el usuario w3joe y está entrenado para una tarea concreta de manipulación con un brazo SO-101: recoger una pieza, presentarla a una cámara de inspección y colocarla. No es un modelo de lenguaje: es una política de imitación que mapea observaciones (estado articular de 6 dimensiones y tres cámaras RGB) a acciones (6 objetivos articulares).

El modelo parte de un backbone ResNet-18 inicializado con pesos ImageNet-1K V1 y suma 51.597.190 parámetros entrenables (51.668.614 totales en el safetensors). Se entrenó sobre 417 demostraciones (85.647 fotogramas a 30 fps) con una variante de ponderación por fotograma llamada WARP-BC, que asigna pesos positivos a aproximadamente el 65,3 % de los fotogramas. La innovación principal respecto a un ACT estándar es esa ponderación, que modula la contribución de cada fotograma a la pérdida L1 ponderada más el término KL del VAE.

Es relevante ahora porque ejemplifica el flujo actual de políticas de imitación ligeras y desplegables en hardware de consumo o en dispositivos Intel vía OpenVINO, con un coste de entrenamiento de apenas 44,4 minutos en 4 GPU RTX PRO 6000 Blackwell. El autor advierte explícitamente de que las métricas publicadas son de batch de entrenamiento y de que no se ha verificado ningún rollout físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) con backbone ResNet-18 |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política por fotograma; predice chunks de 100 pasos) |
| Tipos de cuantizacion | no disponible (el autor menciona exportación OpenVINO en fp16) |
| Idiomas soportados | no disponible (no consume instrucciones en lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoint nativo LeRobot) |

## Arquitectura y entrenamiento

ACT es un transformer de chunking de acciones: codifica las observaciones visuales con un ResNet-18 (inicializado con pesos ImageNet-1K V1) y el estado articular, y decodifica un chunk de 100 pasos de 6 objetivos articulares. El entrenamiento combina una pérdida L1 ponderada sobre las acciones con el término KL de un VAE, siguiendo el esquema habitual de ACT. La variante WARP-BC introduce pesos por fotograma (aproximadamente el 65,3 % con peso positivo), lo que modula la contribución de cada muestra a la pérdida. El autor indica que la ponderación WARP solo es necesaria en entrenamiento, no en inferencia.

El dataset consta de 417 demostraciones exitosas, 85.647 fotogramas a 30 fps, con 6 posiciones/acciones articulares y tres cámaras RGB (muñeca, cenital e inspección). Se realizaron 20.000 actualizaciones con batch 16 por GPU (global 64) en 4 RTX PRO 6000 Blackwell, AdamW con learning rate 1e-5 y semilla 1000, en 44,4 minutos con PyTorch 2.11.0+cu128 y LeRobot 0.7.0 (revisión de código `994fe1b1eb4b41120fc5d0a545b8f08cf0741e48`). La pérdida final registrada de entrenamiento fue 0,148 y la L1 de acciones 0,201, ambas sobre el batch de entrenamiento.

## Capacidades

- Generación de acciones robóticas: predice chunks de 100 pasos de 6 objetivos articulares a partir de estado y tres imágenes RGB.
- Percepción visual multi-cámara: consume imagen de muñeca (3x480x640), cenital recortada (3x480x560) e inspección (3x480x640).
- Secuencia aprendida de pick, presentación a inspección y colocación, sin condicionamiento por lenguaje.
- Integración con LeRobot 0.7.0: incluye preprocesador y postprocesador guardados para normalización de observaciones y desnormalización de acciones.
- Exportación a OpenVINO en fp16 mediante `dlsj.deploy.act_export`, con aplicación del recorte de la cámara cenital en tiempo de ejecución.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es una política de imitación específica de tarea.

## Casos de uso

- Automatización de pick-and-place con SO-101: la política ejecuta la secuencia completa de recogida, presentación y colocación aprendida de las 417 demostraciones, adecuada para ciclos repetitivos en banco de pruebas.
- Inspección visual en línea: la tercera cámara (`inspect`) y la presentación explícita de la pieza permiten usar el modelo en una estación donde la pieza debe mostrarse a una cámara antes de colocarse.
- Prototipado rápido de políticas de imitación: con 44,4 minutos de entrenamiento en 4 GPU, sirve como referencia para validar pipelines WARP-BC y comparar contra ACT estándar.
- Despliegue en dispositivos Intel: la ruta de exportación OpenVINO fp16 permite llevar la política a hardware Intel, aunque el autor no ha verificado la carga ni los rollouts.
- Investigación en ponderación de datos: el checkpoint permite reproducir y analizar el efecto de WARP-BC (65,3 % de fotogramas con peso positivo) frente a un ACT sin ponderar.
- Base para fine-tuning en tareas similares: al ser un checkpoint LeRobot nativo con procesadores guardados, se puede reutilizar como inicialización para nuevas tareas de manipulación con el mismo robot y disposición de cámaras.
- Evaluación de robustez de políticas ligeras: sus 51,7 M de parámetros permiten iterar rápido en simulación o en banco antes de un despliegue físico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta métricas de batch de entrenamiento: pérdida final 0,148 y L1 de acciones 0,201, sin evaluación en held-out ni tasas de éxito en robot físico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros el checkpoint en fp32 ocupa aproximadamente 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no hay recomendación del autor; el entrenamiento se realizó en 4 RTX PRO 6000 Blackwell. Para inferencia basta una GPU consumer (RTX 3060 o superior) o incluso CPU, según el ejemplo de carga del autor.
- Cabe en GPU consumer: sí, por tamaño de parámetros; el cuello de botella real es el procesamiento de tres cámaras RGB a 480p.
- Opciones de despliegue: LeRobot 0.7.0 con PyTorch (CPU o GPU) y exportación OpenVINO fp16 mediante `dlsj.deploy.act_export`.
- Latencia y throughput: no disponibles. El autor recomienda medir la inferencia antes de habilitar movimiento del robot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunk | Licencia | Disponibilidad |
|---|---|---|---|---|
| act-warp-duplo-417-20261114 | 51,7 M | chunk de 100 pasos, 6 acciones | no disponible | Hugging Face (LeRobot) |
| ACT estándar (LeRobot) | ~51 M (ResNet-18) | chunk configurable | Apache-2.0 en LeRobot | Repo LeRobot |
| Diffusion Policy (LeRobot) | variable, típicamente mayor | horizonte de acciones configurable | Apache-2.0 en LeRobot | Repo LeRobot |
| π0 / VLA de gran escala | miles de millones | condicionado por lenguaje | variable | Hugging Face |

La comparación con ACT estándar es la más directa: misma arquitectura y backbone, con la diferencia de la ponderación WARP-BC y el dataset específico. Frente a Diffusion Policy, ACT es más ligero y rápido de entrenar, pero suele ser menos expresivo en distribuciones multimodales. Frente a VLA de gran escala como π0, este checkpoint carece de condicionamiento por lenguaje y de generalización entre tareas. No se dispone de datos de rendimiento comparativo publicados para este checkpoint concreto.

## Limitaciones y advertencias

- Sin verificación física: el autor declara explícitamente que no se ha verificado ningún rollout en robot; las métricas son de batch de entrenamiento.
- Licencia no disponible: no se puede confirmar el uso comercial; hay que contactar con el autor antes de producción.
- Específico de tarea y hardware: entrenado para un SO-101 con una disposición concreta de tres cámaras y un recorte exacto de la cámara cenital (x=0, y=0, 560x480); cualquier cambio de montaje o calibración invalida la política.
- Sin condicionamiento por lenguaje: no acepta instrucciones; la secuencia pick-inspección-colocación está implícita en los pesos.
- Riesgo de sobreajuste a las 417 demostraciones: no hay evaluación en held-out ni datos de robustez ante variaciones de iluminación, posición de pieza u oclusión.
- Dependencia de versión: requiere LeRobot 0.7.0 y un entorno PyTorch compatible; el `train_config.json` conserva rutas de la máquina de entrenamiento y el archivo WARP y el dataset no están incluidos.
- Repositorio incompleto para reproducción: no se publican los vídeos de demostración ni los artefactos de entrenamiento.
- Exportación OpenVINO no validada: la carga en dispositivos Intel y los rollouts quedan sin verificar; el autor recomienda medir la inferencia antes de mover el robot.
- Riesgo de alucinación en el sentido de acciones plausibles pero incorrectas: al ser una política de imitación sin mecanismo de seguridad, conviene interponer límites articulares y paradas de emergencia.

## Enlaces

- Hugging Face: https://huggingface.co/w3joe/act-warp-duplo-417-20261114
- LeRobot (librería): https://github.com/huggingface/lerobot
- Paper ACT (Action Chunking with Transformers): https://arxiv.org/abs/2304.13705
- Repositorio original de ACT: https://github.com/tonyzhaozh/act
- OpenVINO: https://github.com/openvinotoolkit/openvino
- SO-101 (robot): https://github.com/TheRobotStudio/SO-ARM100
