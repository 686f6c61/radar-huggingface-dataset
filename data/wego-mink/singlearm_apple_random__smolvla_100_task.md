# wego-mink/singlearm_apple_random__smolvla_100_task

## Resumen

Este repositorio contiene un *fine-tune* del modelo SmolVLA (Small Vision-Language-Action), un modelo compacto de visión-lenguaje-acción orientado a control robótico, desarrollado originalmente por Hugging Face y entrenado aquí por el usuario wego-mink sobre el conjunto de datos `wego-mink/singlearm_apple_random_v2`. El checkpoint resultante es una política de manipulación para un brazo robótico único (tareas tipo "apple"), con 450.046.176 parámetros y un peso de repositorio de 0,9 GB, lo que lo sitúa en el rango de modelos desplegables en hardware de consumo.

El interés de esta ficha no está en el modelo base (ampliamente documentado) sino en el hecho de que es un ejemplo reproducible de *fine-tuning* de SmolVLA mediante LeRobot: un pipeline de aprendizaje por imitación que convierte un modelo fundacional VLA en una política específica de tarea. La model card sigue la plantilla automática de LeRobot, por lo que buena parte de los metadatos técnicos del entrenamiento (número de episodios, hiperparámetros, composición del dataset) no está documentada en el repositorio.

SmolVLA combina un *backbone* de visión-lenguaje compacto (familia SmolVLM) con una cabeza de acción basada en *flow matching* para predecir acciones continuas, y una arquitectura de inferencia asíncrona que separa la percepción (costosa) de la ejecución de acciones (ligera), lo que permite control en tiempo real en GPUs de gama consumer. No se han publicado métricas de éxito de la tarea para este checkpoint concreto en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA): backbone de visión-lenguaje compacto (familia SmolVLM) con cabeza de acción por *flow matching* e inferencia asíncrona percepción/acción |
| Parametros totales | 450.046.176 (450 M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye safetensors; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Pipeline | robotics |
| Modelo base | `lerobot/smolvla_base` (fine-tune) |
| Dataset de entrenamiento | `wego-mink/singlearm_apple_random_v2` |
| Tamaño del repositorio | 0,9 GB |
| Tag de paper | arXiv:2506.01844 |

## Arquitectura y entrenamiento

La arquitectura corresponde a SmolVLA: un modelo de visión-lenguaje compacto que procesa imágenes de cámara junto con una instrucción en lenguaje natural y produce acciones motoras continuas. La cabeza de acción emplea *flow matching* para generar trayectorias de acción de forma eficiente, y el diseño separa el cómputo pesado de percepción del bucle ligero de ejecución de acciones mediante inferencia asíncrona, de modo que el control del robot puede mantenerse a frecuencia útil incluso con hardware modesto. El modelo base fue publicado por Hugging Face el 3 de junio de 2025 y, según las fuentes consultadas, se entrenó únicamente con datos públicos de la comunidad (datasets de LeRobot).

Sobre el entrenamiento de este checkpoint concreto no hay información en la model card más allá del dataset utilizado (`singlearm_apple_random_v2`) y de que el flujo se realizó con LeRobot. No se documentan el número de episodios, el número de tokens, la composición exacta del dataset, ni si hubo etapas de RLHF/DPO (poco habituales en políticas de imitación robótica). Tampoco se especifican la resolución de las cámaras, la frecuencia de control ni las dimensiones del espacio de acción. La model card incluye el comando de entrenamiento genérico de LeRobot con `--policy.type=act`, que es un residuo de la plantilla: la política efectivamente entrenada es SmolVLA, no ACT, por lo que ese comando debe adaptarse antes de reutilizarlo.

## Capacidades

- Generación de acciones motoras continuas para un brazo robótico de un solo brazo a partir de observaciones visuales e instrucciones en lenguaje natural.
- Comprensión visuo-lingüística heredada del backbone SmolVLM (codificación conjunta de imágenes e instrucciones textuales).
- Ejecución de políticas de imitación entrenadas por *behavior cloning* sobre demostraciones teleoperadas.
- Integración nativa con el ecosistema LeRobot: `lerobot-train` para reentrenamiento y `lerobot-record` para evaluación e inferencia en robot real.
- Despliegue en hardware de consumo según las afirmaciones del modelo base (no verificadas de forma independiente para este checkpoint).
- Inferencia asíncrona que permite desacoplar la frecuencia de percepción de la de control.
- No se documentan capacidades de *tool calling*, razonamiento multi-paso simbólico, audio ni *thinking mode*; no aplica en el dominio de políticas robóticas.
- Capacidades multilingües: no disponibles/no documentadas para la instrucción textual.

## Casos de uso

- **Automatización de una tarea de manipulación concreta ("apple")**: este checkpoint está entrenado específicamente para recoger/colocar objetos tipo manzana con un brazo único; puede desplegarse directamente con `lerobot-record --policy.path=wego-mink/singlearm_apple_random__smolvla_100_task` sobre un robot `so100_follower` para reproducir la política aprendida.
- **Punto de partida para *fine-tuning* en una tarea propia**: al ser un fine-tune de `lerobot/smolvla_base` con licencia Apache 2.0, sirve como inicialización para reentrenar con `lerobot-train` sobre un dataset propio de pocas horas de demostraciones, reduciendo el coste frente a partir del modelo base.
- **Réplica de experimentos de aprendizaje por imitación en laboratorio**: útil en investigación académica para comparar el efecto del tamaño del dataset (el nombre del checkpoint sugiere 100 tareas/episodios) sobre la tasa de éxito de la política.
- **Evaluación comparativa de políticas VLA compactas**: sirve como baseline de 450 M parámetros frente a políticas de mayor tamaño en pruebas de éxito de tarea, tiempo de inferencia y requisitos de VRAM.
- **Validación de pipelines de datos robóticos**: permite comprobar de extremo a extremo el flujo dataset → entrenamiento → evaluación de LeRobot, incluyendo la gestión de checkpoints en el Hub.
- **Prototipado en hardware de bajo coste**: por su tamaño (0,9 GB de pesos), es candidato para estaciones de trabajo con una única GPU consumer, lo que facilita prototipos en entornos docentes o *makers*.
- **Generación de datos de evaluación**: ejecutar la política en bucle abierto/cerrado para recolectar trayectorias y analizar modos de fallo antes de invertir en un dataset mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay métricas de tasa de éxito, error de posición ni latencia para el checkpoint `wego-mink/singlearm_apple_random__smolvla_100_task`. Las únicas afirmaciones cualitativas disponibles provienen de fuentes secundarias sobre el modelo base SmolVLA, que indican un rendimiento igual o superior a modelos 7-10 veces más grandes entrenándose solo con datos públicos de la comunidad; no se proporcionan cifras concretas ni tablas de comparación verificables en la información consultada.

## Requisitos de hardware

- **Peso de los pesos**: 450 M parámetros; el repositorio ocupa 0,9 GB, lo que corresponde a precisión de 16 bits (≈0,9 GB). En fp32 serían ≈1,8 GB.
- **VRAM estimada para inferencia**: del orden de 2-3 GB incluyendo pesos, activaciones del codificador visual y *buffers* de flujo (estimación derivada del recuento de parámetros; no publicada por el autor). Debe añadirse memoria para los flujos de cámara y el *runtime* de PyTorch/CUDA.
- **GPU recomendadas**: cualquier GPU con ≥4 GB de VRAM. Una RTX 3060/4060, RTX A2000 o superior es suficiente; A100/H100 no son necesarias y solo aportarían margen para *batching* o entrenamiento.
- **¿Cabe en GPU consumer?**: sí, en principio en todas las GPU consumer modernas con 4 GB o más de VRAM, incluidas portátiles de gama media.
- **Opciones de despliegue**: LeRobot con PyTorch (`lerobot-record`, `lerobot-train`) y safetensors. No se documentan soportes de vLLM, TGI, llama.cpp ni Ollama para este tipo de política, y en la información disponible no se menciona ningún *runtime* alternativo (ONNX, TensorRT, Jetson).
- **Latencia y throughput**: no disponibles. El modelo base se describe como apto para control en tiempo real gracias a la inferencia asíncrona, pero no se publican valores de frecuencia de control (Hz) ni latencias por paso para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad | Benchmarks |
|---|---|---|---|---|---|---|
| Este checkpoint (`singlearm_apple_random__smolvla_100_task`) | 450 M | no disponible | VLA con flow matching, fine-tune de tarea | Apache 2.0 | Hugging Face (LeRobot) | no disponible |
| `lerobot/smolvla_base` | 450 M | no disponible | VLA base (modelo fundacional) | Apache 2.0 | Hugging Face | no disponible en la informacion consultada |
| `wego-mink/singlearm_apple_random__smolvla_100` | no disponible | no disponible | VLA fine-tune de la misma familia y dataset | no disponible | Hugging Face | no disponible |
| OpenVLA-7B | ~7 B | no disponible | VLA basado en VLM de 7 B | no disponible | Hugging Face | no disponible (dato no verificado en esta busqueda) |
| π0 (Physical Intelligence) | ~3,3 B | no disponible | VLA con flow matching | no disponible | Peso abierto con restricciones, segun fuentes | no disponible (dato no verificado en esta busqueda) |

Nota: los dos últimos modelos se incluyen solo como referencia de categoría (políticas VLA); sus cifras de parámetros y licencias no han podido verificarse en la información proporcionada y deben contrastarse en sus repositorios oficiales. No se dispone de comparaciones de rendimiento entre estos modelos y el checkpoint descrito.

## Limitaciones y advertencias

- **Model card incompleta**: la tarjeta es la plantilla automática de LeRobot. No documenta episodios, hiperparámetros, configuración de cámaras, espacio de acción ni variante de robot usada durante el entrenamiento, lo que dificulta reproducir el resultado.
- **Comando de entrenamiento engañoso**: la plantilla muestra `--policy.type=act`; este checkpoint es SmolVLA, no ACT. Reutilizar ese comando tal cual produciría un modelo distinto.
- **Sobreajuste a una tarea y a un montaje físico**: el nombre del checkpoint sugiere una única tarea ("apple") y un único robot; es esperable un fallo sistemático ante cambios de iluminación, posición de cámara, fondo, tipo de objeto o brazo distinto. No generaliza como un VLA base.
- **Riesgo de alucinación / acciones no válidas**: al ser una política de imitación sin verificación de seguridad, puede emitir acciones fuera de rango o colisiones ante observaciones fuera de distribución. Requiere límites de par, espacio de trabajo acotado y supervisión durante la evaluación.
- **Idiomas no documentados**: se desconoce si las instrucciones en lenguaje natural funcionan en castellano; el backbone SmolVLM es mayoritariamente anglófono en la práctica y no hay evaluación multilingüe publicada.
- **Ausencia de benchmarks**: sin tasa de éxito reportada, no debe asumirse que el modelo funciona correctamente en la tarea; hay que evaluarlo empíricamente antes de cualquier uso real.
- **Licencia**: Apache 2.0 permite uso comercial y modificaciones, pero conviene revisar las condiciones del modelo base y de los datos de demostración originales (posibles derechos sobre imágenes o entornos grabados).
- **Datos de entrenamiento no auditables**: no se detalla la composición del dataset `singlearm_apple_random_v2`; no se puede evaluar sesgo de recogida (por ejemplo, siempre el mismo operador o la misma posición inicial).
- **Madurez**: 0 descargas y 0 *likes* en el momento de la consulta; es un artefacto de investigación sin validación por terceros.
- **Producción**: no debe desplegarse en un robot real sin parada de emergencia, *watchdog* de comunicación y validación previa en simulación o con el robot en vacío.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wego-mink/singlearm_apple_random__smolvla_100_task
- Checkpoint de la misma familia: https://huggingface.co/wego-mink/singlearm_apple_random__smolvla_100
- Dataset de entrenamiento: https://huggingface.co/datasets/wego-mink/singlearm_apple_random_v2
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA (arXiv:2506.01844): https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Perfil del autor: https://huggingface.co/wego-mink
- Ficha de SmolVLA (fuente secundaria): https://sudoremove.com/en/knowledge/models/smolvla/
- SmolVLA en Open Source Robotics (fuente secundaria): https://robotics.growbotics.ai/projects/foundation-models/smolvla
- Análisis del paper de SmolVLA (fuente secundaria): https://robotics.growbotics.ai/research/papers/smolvla-small-vision-language-action-model-efficient-robot-learning
