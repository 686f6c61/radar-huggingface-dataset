# stefhannisse/smolvla_red_cube

## Resumen

`stefhannisse/smolvla_red_cube` es una política de robótica (vision-language-action) publicada por el usuario stefhannisse en Hugging Face, obtenida mediante fine-tuning del modelo base `lerobot/smolvla_base` con la librería LeRobot. SmolVLA es un modelo compacto de visión-lenguaje-acción desarrollado en el ecosistema de Hugging Face, descrito en el paper arXiv:2506.01844, y diseñado para ser ejecutable en hardware de consumo. Este repositorio concreto no es un modelo de propósito general: es una especialización de tarea única entrenada para "coger el cubo rojo y colocarlo en la caja de cartón" sobre un brazo `so_follower` (familia SO-100/SO-101) con dos o más cámaras.

El modelo tiene 450.046.176 parámetros (dato real leído del archivo safetensors, en formato de coma flotante de 16 bits, lo que explica que el repositorio ocupe 0,9 GB). Consume observaciones de estado del robot de dimensión 6 y hasta cuatro flujos de imagen, y produce un vector de acción de dimensión 6. Se entrenó con 88 episodios y 26.257 fotogramas grabados a 30 FPS, durante 40.000 pasos con optimizador AdamW y una tasa de aprendizaje de 1e-4.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de un pipeline completo de aprendizaje por imitación con LeRobot, como punto de partida para fine-tuning adicional y como material de laboratorio para validar hardware, cámaras y calibración antes de invertir en grabaciones de datos mayores. La model card no incluye resultados de evaluación en robot real ni benchmarks, y el repositorio no tiene descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacto; fine-tuning de `lerobot/smolvla_base` (SmolVLA) |
| Parámetros totales | 450.046.176 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No documentados; pesos publicados en safetensors de 16 bits (0,9 GB de repositorio para 450 M de parámetros) |
| Idiomas soportados | No disponible como lista. El modelo acepta una instrucción de tarea en lenguaje natural; la única tarea documentada está redactada en inglés ("Grab the red cube and place it in the cardboard box") |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (librería `lerobot`) |
| Pipeline declarado | `robotics` |
| Modelo base | `lerobot/smolvla_base` |
| Tipo de robot | `so_follower` |
| Cámaras declaradas | `wrist`, `top` |
| Entradas | `observation.state` (6,); `observation.images.camera1` (3, 256, 256); `observation.images.camera2` (3, 256, 256); `observation.images.camera3` (3, 256, 256); `observation.images.empty_camera_0` (3, 480, 640) |
| Salidas | `action` (6,) |
| Dataset de entrenamiento | `stefhannisse/red-cube-to-box_20260924_192736`: 88 episodios, 26.257 fotogramas, 30 FPS, 1 tarea |
| Pasos de entrenamiento | 40.000 |
| Tamaño de lote | 8 |
| Optimizador | AdamW |
| Tasa de aprendizaje | 1e-4 |
| Semilla | 1000 |
| Versión de LeRobot | 0.5.2 |
| Fecha de creación | 2026-09-25 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo pertenece a la familia SmolVLA: un modelo de visión-lenguaje-acción que combina un codificador visual y un modelo de lenguaje compacto con un cabezal de predicción de acciones, entrenado para mapear observaciones multimodales (imágenes de cámara más estado propioceptivo del robot) e instrucciones en lenguaje natural a comandos motores de bajo nivel. El paper asociado, arXiv:2506.01844, se cita en los metadatos del repositorio, y la model card del autor describe explícitamente el objetivo de "rendimiento competitivo con coste computacional reducido, desplegable en hardware de consumo". Los detalles internos del bloque de lenguaje (número de capas, dimensión oculta, ventana de atención o número de tokens de contexto) no se documentan en la información disponible, por lo que no se incluyen cifras al respecto.

El entrenamiento de esta política concreta es un fine-tuning por imitación (behavior cloning) sobre el modelo base, no un entrenamiento desde cero ni un proceso de alineación con RLHF o DPO. La configuración reportada es de 40.000 pasos, lote de 8, AdamW con tasa 1e-4 y semilla 1000, usando LeRobot 0.5.2. El conjunto de demostraciones es pequeño: 88 episodios y 26.257 fotogramas a 30 FPS (aproximadamente 14,6 minutos de datos brutos repartidos entre episodios), todos sobre la misma tarea y, presumiblemente, sobre la misma mesa y configuración de cámara. No se documenta aumento de datos, curriculum, variaciones de posición del objeto, cambios de iluminación ni mezcla con datasets externos, ni se indica la función de pérdida exacta empleada en el cabezal de acciones.

## Capacidades

- Control robótico de manipulación de tarea única: genera un vector de acción de 6 grados de libertad para ejecutar la secuencia "coger el cubo rojo y depositarlo en la caja de cartón" con un brazo `so_follower`.
- Condicionamiento por instrucción de tarea: acepta un `task` en lenguaje natural como entrada, aunque la única instrucción con la que se ha entrenado está en inglés.
- Fusión multimodal: combina estado propioceptivo (6 dimensiones) con hasta cuatro entradas visuales, tres de ellas a 256x256 píxeles.
- Política reactiva de bucle cerrado: produce acciones de forma continua a la frecuencia de control del robot (los datos se registraron a 30 FPS), lo que permite corregir desviaciones durante la ejecución.
- Fine-tuning adicional: al derivar de `lerobot/smolvla_base` y publicarse en formato LeRobot, puede reentrenarse con nuevos datasets mediante `lerobot-train`.
- No soporta tool calling ni function calling: no es un modelo de lenguaje conversacional.
- No soporta agentes, razonamiento multi-paso simbólico ni planificación de tareas múltiples: la planificación está implícita en la política y limitada a la tarea aprendida.
- No se documentan capacidades de generación de texto, código, matemáticas, visión general, audio ni modo de razonamiento explícito ("thinking mode").
- Capacidades multilingües: no disponibles (no se documenta ninguna lista de idiomas).

## Casos de uso

- Manipulación pick-and-place en banco de pruebas: ejecutar la tarea documentada con `lerobot-rollout`, `--robot.type=so_follower` y `--policy.path=stefhannisse/smolvla_red_cube`, para validar que el robot, las cámaras y la calibración funcionan antes de grabar datos propios.
- Punto de partida para fine-tuning propio: usar el repositorio como política inicial y reentrenar con `lerobot-train` sobre un dataset propio de más episodios, lo que reduce el número de pasos necesarios frente a partir de `smolvla_base` en dominios de manipulación similares (mismo robot, objetos pequeños, mesa plana).
- Docencia y formación en aprendizaje por imitación: sirve como ejemplo completo y de bajo coste (0,9 GB de pesos) del ciclo grabar dataset, entrenar política, desplegar y evaluar en robot real, sin necesidad de clúster de GPU.
- Reproducción de experimentos de VLA compactos: al ser un fine-tuning de SmolVLA de 450 M de parámetros, permite estudiar el efecto del tamaño de dataset (88 episodios) en la tasa de éxito, o comparar curvas de entrenamiento frente al modelo base en el mismo hardware.
- Recolección de datos asistida (DAgger ligero): desplegar la política en modo ejecución y corregir con teleoperación los fallos observados, generando nuevos episodios etiquetados que alimenten una segunda iteración del entrenamiento.
- Integración en pipelines de laboratorio con seguimiento: envolver la inferencia de LeRobot en un script propio que registre posición del cubo, éxito/fallo y latencia por paso, para construir un banco de evaluación cuantitativo del que la model card carece.
- Prototipado de células automatizadas de bajo coste: dado su tamaño, puede ejecutarse en el mismo PC que controla el brazo, sin GPU dedicada de gama alta, lo que facilita montajes de demostración en ferias, aulas o laboratorios con presupuesto limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye la sección de evaluación con el texto explícito "_No evaluation results have been provided for this policy yet_", sin tabla de ensayos, tasas de éxito ni condiciones de dificultad (posiciones nuevas del objeto, cambios de iluminación, distractores o robots distintos). Tampoco se proporcionan métricas de entrenamiento (pérdida final, curva de convergencia) ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB solo para pesos en 16 bits (450 M de parámetros x 2 bytes = 0,9 GB) y del orden de 2 a 4 GB contando activaciones y búferes de las tres cámaras de 256x256 más la entrada de 480x640; estimación propia basada en el recuento de parámetros declarado, no en mediciones publicadas.
- GPU recomendadas: cualquier GPU con soporte CUDA y 4 GB o más de memoria; el modelo está pensado explícitamente para hardware de consumo. No se documenta compatibilidad ni rendimiento en A100, H100 o similares.
- ¿Cabe en GPU de consumo? Sí, en principio cabe en tarjetas de gama de entrada actuales (por ejemplo, RTX 3050/3060 de 6-8 GB y superiores). También puede ejecutarse en CPU, aunque la latencia del bucle de control a 30 FPS no está garantizada en ese caso.
- Opciones de despliegue: `lerobot-rollout` sobre `lerobot` (versión 0.5.2 en el entrenamiento) con `policy.path` apuntando al repositorio; el entrenamiento se realiza con `lerobot-train` y `--policy.device=cuda`. No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni GGUF; estos formatos no son aplicables a una política de acción con entradas de imagen y estado.
- Latencia y throughput: no disponibles. El único dato relacionado es la frecuencia de captura del dataset (30 FPS), que marca el orden de magnitud esperado del bucle de control, no una medición de inferencia del modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entradas | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `stefhannisse/smolvla_red_cube` | 450 M | Estado (6,) + 4 flujos de imagen; tarea única | No disponible (sin evaluación publicada) | Apache-2.0 | Hugging Face, librería LeRobot |
| `lerobot/smolvla_base` | Misma arquitectura (es su modelo base) | Igual; política generalista que requiere fine-tuning | No disponible en la información proporcionada | Apache-2.0 | Hugging Face, LeRobot |
| `openvla/openvla-7b` | ~7.000 M | VLM + acciones; varias tareas de manipulación | No disponible en la información proporcionada | Licencia comunitaria de Llama 2 (con restricciones, no Apache-2.0) | Hugging Face |
| Políticas tipo π0 / π0-FAST (LeRobot) | No disponible en la información proporcionada | Modelos de acción más grandes orientados a múltiples tareas | No disponible en la información proporcionada | No disponible en la información proporcionada | Ecosistema LeRobot |

Los datos de los modelos alternativos provienen de su documentación pública general y no de la información recuperada en esta búsqueda; las cifras de rendimiento no se incluyen porque no se dispone de ellas de forma verificable en el material consultado.

## Limitaciones y advertencias

- Especialización extrema: la política solo ha visto una tarea ("coger el cubo rojo y colocarlo en la caja de cartón"). No debe esperarse generalización a otros objetos, colores, posiciones iniciales amplias o instrucciones distintas, y las instrucciones en castellano no están cubiertas por el entrenamiento.
- Sin evaluación publicada: no existe ninguna medición de tasa de éxito, ni en las condiciones de entrenamiento ni en condiciones nuevas, por lo que el rendimiento real es desconocido.
- Dataset muy pequeño: 88 episodios y 26.257 fotogramas a 30 FPS (unos 14,6 minutos). La guía de LeRobot recomienda del orden de 50 episodios como punto de partida, pero también recomienda cubrir suficientes variaciones de cada factor; no se documenta que se hayan cubierto variaciones de posición, iluminación o distractores.
- Riesgo de sobreajuste al entorno: al no documentarse variabilidad en las demostraciones, es probable que el modelo dependa de la disposición concreta de mesa, cámara e iluminación, y que falle ante cambios de contexto.
- Inconsistencia documental en las cámaras: la ficha declara `wrist` y `top`, mientras que la lista de entradas incluye `observation.images.camera1`, `camera2`, `camera3` (256x256) y `observation.images.empty_camera_0` (480x640). El sufijo "empty" sugiere una cámara ausente o de relleno. Los nombres de las claves de observación deben coincidir exactamente con los del entrenamiento o la inferencia fallará.
- Seguridad física: es una política de control motor. Se debe operar con límites de par, parada de emergencia, espacio de trabajo despejado y supervisión humana, especialmente en las primeras ejecuciones.
- Sin datos sobre sesgos: no se documentan sesgos demográficos, lingüísticos ni de otro tipo, algo esperable en un modelo robótico de tarea única, pero tampoco se aporta ningún análisis.
- Riesgo de alucinación en el sentido habitual (generación de texto falso) no aplica; el riesgo equivalente es la generación de acciones plausibles pero incorrectas ante entradas fuera de distribución, sin señal de confianza asociada.
- Trazabilidad limitada: no se publican tarjetas de datos del dataset, ni análisis de fallos, ni vídeo de demostración. El repositorio presenta 0 descargas y 0 valoraciones, por lo que no hay validación por parte de la comunidad.
- Licencia: Apache-2.0, permisiva para uso comercial, pero conviene verificar también las licencias del modelo base `lerobot/smolvla_base`, del dataset y de la librería LeRobot antes de un despliegue en producción.
- Fechas de creación y actualización: 2026-09-25, con apenas un minuto de diferencia entre ambas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stefhannisse/smolvla_red_cube
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/stefhannisse/red-cube-to-box_20260924_192736
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Código de LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Espacio de visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=stefhannisse/red-cube-to-box_20260924_192736
- Perfil del autor: https://huggingface.co/stefhannisse
- Otra política del mismo autor: https://huggingface.co/stefhannisse/my_smolvla
- Proyecto independiente de fine-tuning de SmolVLM: https://github.com/PhosFaith/SmolVLA
- Resumen divulgativo de SmolVLA: https://aegean.ai/book/vla-agents/smolvla
