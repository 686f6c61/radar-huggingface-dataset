# Yu3773/smolvla_red_cube_black_tray_50ep_20k

## Resumen

SmolVLA es un modelo de vision-language-action (VLA) compacto y eficiente desarrollado por Hugging Face, diseñado para controlar robots mediante instrucciones en lenguaje natural. Este repositorio concreto, publicado por el usuario Yu3773, es un fine-tuning del modelo base `lerobot/smolvla_base` sobre un dataset propio de 50 episodios que consiste en la tarea de recoger un cubo rojo y colocarlo en una bandeja negra. El modelo tiene 450 millones de parámetros y está entrenado con el framework LeRobot, lo que permite su despliegue en hardware de consumo.

La relevancia de este modelo radica en que demuestra el flujo completo de fine-tuning de un VLA para una tarea robótica específica, con un coste computacional reducido y una licencia Apache 2.0 que permite uso comercial. Al estar basado en SmolVLA, hereda su arquitectura eficiente que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones, optimizado para funcionar en GPUs de gama media.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer) |
| Parametros totales | 450.046.176 (450 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de accion robotica, no de texto) |
| Tipos de cuantizacion | no disponible (solo safetensors en precision completa) |
| Idiomas soportados | no disponible (instrucciones en ingles en el dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-language-action que combina un codificador visual (para procesar imagenes de camaras), un modelo de lenguaje (para interpretar la instruccion) y un decodificador de acciones (para generar comandos de control del robot). La arquitectura esta descrita en el paper arXiv 2506.01844 y esta disenada para ser compacta y eficiente, permitiendo inferencia en hardware de consumo.

El fine-tuning se realizo con el framework LeRobot (version 0.6.0) sobre el dataset `Yu3773/so101_red_cube_black_tray`, que contiene 50 episodios y 22.134 frames a 30 FPS. La tarea es "Pick up the red cube and place it in the black tray". El entrenamiento se ejecuto durante 20.000 pasos con batch size 16, optimizador AdamW, learning rate 0.0001 y semilla 1000. No se menciona el uso de RLHF ni DPO; se trata de aprendizaje por imitacion supervisado.

## Capacidades

- Control robotico de tipo follower (so_follower) con 6 grados de libertad (accion de 6 dimensiones).
- Procesamiento de multiples camaras: tres camaras de 256x256 (wrist, overhead y una tercera) y una camara adicional de 480x640.
- Interpretacion de instrucciones en lenguaje natural (en ingles) para tareas de pick-and-place.
- Generacion de acciones de control continuo (6 dimensiones) a partir de observaciones visuales y de estado.
- Fine-tuning especifico para una tarea concreta: recoger un cubo rojo y colocarlo en una bandeja negra.
- Integracion con el ecosistema LeRobot para entrenamiento, evaluacion y despliegue en robots reales.

## Casos de uso

- Automatizacion de tareas de pick-and-place en entornos controlados: el modelo puede ejecutar la tarea de recoger un cubo rojo y colocarlo en una bandeja negra, demostrando la viabilidad de VLA para manipulacion basica.
- Prototipado rapido de politicas robotica: gracias a su tamano reducido (450 M) y su integracion con LeRobot, permite iterar rapidamente sobre nuevas tareas con pocos datos (50 episodios).
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar tecnicas de fine-tuning de VLA, transferencia entre tareas y generalizacion.
- Educacion y formacion en robotica: al ser un modelo pequeno y con licencia permisiva, puede usarse en entornos academicos para ensenar conceptos de robotica y aprendizaje automatico.
- Despliegue en robots de bajo coste: su eficiencia permite ejecutarlo en GPUs de consumo, lo que facilita su uso en robots domesticos o de investigacion con hardware limitado.
- Benchmarking de VLA: el modelo y su dataset pueden servir como referencia para comparar el rendimiento de diferentes arquitecturas o estrategias de entrenamiento en tareas de manipulacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion ("No evaluation results have been provided for this policy yet"). No se proporcionan metricas de exito en tareas reales ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, pero dado el tamano de 450 M de parametros, se estima que cabe en GPUs con al menos 8 GB de VRAM en precision FP16.
- GPU recomendadas: no se especifican, pero por el tamano del modelo, una RTX 3060/4060 o superior seria suficiente para inferencia.
- Compatibilidad con consumer GPU: si, el modelo esta disenado para hardware de consumo segun la descripcion de SmolVLA.
- Opciones de despliegue: LeRobot (CLI `lerobot-rollout`), compatible con PyTorch y CUDA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Yu3773/smolvla_red_cube_black_tray (este) | 450 M | no aplica | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | 450 M | no aplica | Apache 2.0 | Hugging Face |
| OpenVLA (referencia) | 7 B | no disponible | MIT | Hugging Face |

La comparativa se limita al modelo base del que deriva, ya que no se dispone de datos de rendimiento para comparar con otros VLA. OpenVLA es un modelo VLA de mayor tamano (7 B) que sirve como referencia de la categoria, pero no se dispone de datos de evaluacion comparativa.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente para una tarea especifica (cubo rojo en bandeja negra) y no generalizara a otras tareas sin fine-tuning adicional.
- No se han publicado resultados de evaluacion en robot real, por lo que el rendimiento real es desconocido.
- El dataset de entrenamiento es pequeno (50 episodios) y puede no cubrir variaciones de iluminacion, posiciones de objetos o distracciones.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende de LeRobot y de la infraestructura de Hugging Face para su despliegue.
- No se especifican idiomas soportados; las instrucciones estan en ingles.
- Riesgo de alucinacion o comportamientos inesperados en entornos no vistos durante el entrenamiento.
- El modelo no es multimodal en el sentido de texto-imagen generativo; su salida son acciones de control, no texto.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Yu3773/smolvla_red_cube_black_tray_50ep_20k
- Dataset de entrenamiento: https://huggingface.co/datasets/Yu3773/so101_red_cube_black_tray
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Documentacion de LeRobot sobre SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Referencia de comandos CLI de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
