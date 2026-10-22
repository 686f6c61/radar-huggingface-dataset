# vivekgr92/act-stack-unstack

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice trozos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error acumulado y suele elevar la tasa de éxito en tareas de manipulación. Este repositorio concreto, `vivekgr92/act-stack-unstack`, es una política ACT ya entrenada y publicada en el Hub mediante LeRobot, especializada en la tarea de apilar y desapilar objetos del dataset `vivekgr92/stack-unstack`.

El modelo no es un modelo de lenguaje: es una política visomotora que consume observaciones (imágenes de cámara y estado del robot) y emite comandos de acción para un brazo robótico. Cuenta con 51.668.614 parámetros en formato safetensors y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la liga de políticas ligeras ejecutables incluso en CPU.

Su relevancia es práctica: sirve como referencia reproducible de un pipeline completo de LeRobot (entrenamiento con `lerobot-train` y evaluación con `lerobot-record` sobre un `so100_follower`), y como punto de partida para fine-tuning en tareas de picking y apilado con hardware de bajo coste. La licencia apache-2.0 facilita su reutilización, aunque no se han publicado métricas de éxito ni detalles del entrenamiento en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer para imitación (ACT, Action Chunking with Transformers); codificador visual y decodificador que emite chunks de acciones |
| Parámetros totales | 51.668.614 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica / no disponible: es una política condicionada a observaciones, no un modelo de tokens con ventana de contexto |
| Tipos de cuantización | No disponible (solo se publican pesos safetensors; no hay variantes GGUF, INT8 ni INT4 documentadas) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje; no procesa texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato de checkpoint de LeRobot) |
| Pipeline | robotics |
| Librería | lerobot |
| Dataset de entrenamiento | vivekgr92/stack-unstack |
| Tamaño del repositorio | 0,2 GB |
| Tarea | Apilar / desapilar objetos (stack-unstack) |

## Arquitectura y entrenamiento

ACT se basa en un transformer que aprende de datos de teleoperación y predice secuencias de acciones (chunks) en lugar de una acción por paso, lo que amortigua el error compuesto de las políticas paso a paso y facilita el modelado de tareas con contacto físico. La formulación original, descrita en el paper 2304.13705, combina un codificador visual con un transformer encoder-decoder y una componente de tipo CVAE que modela la variabilidad de las demostraciones humanas.

En este caso concreto, el entrenamiento se ha realizado con LeRobot sobre el dataset `vivekgr92/stack-unstack`, generado a partir de demostraciones teleoperadas. No se especifican en la información disponible el número de episodios, el número de tokens o frames, la composición exacta del dataset, la resolución de las cámaras ni si se aplicaron técnicas de aumento de datos. Tampoco se documenta el uso de RLHF o DPO, algo que no aplica a una política de imitación de este tipo. No se han publicado detalles sobre hiperparámetros de entrenamiento, número de pasos de chunk ni configuración del optimizador.

## Capacidades

- Generación de comandos de acción para un brazo robótico en tareas de apilado y desapilado de objetos.
- Predicción de chunks de acciones, lo que permite un control más fluido y estable que la predicción paso a paso.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin necesidad de recompensas ni entorno simulado.
- Integración con el ecosistema LeRobot: entrenamiento, evaluación y registro de episodios desde línea de comandos.
- Ejecución sobre robots tipo `so100_follower` (el ejemplo de la model card emplea esta configuración).
- No soporta generación de texto, razonamiento simbólico, matemáticas, código, visión general, tool calling, function calling, agentes ni capacidades multilingües. Cualquier uso en esos dominios queda fuera del alcance del modelo.
- No dispone de modo "thinking" ni de módulos de audio.

## Casos de uso

- Apilado automatizado en laboratorio: la política ejecuta la tarea stack-unstack sobre un `so100_follower` recibiendo imágenes y estado articular, adecuada para validar pipelines de manipulación con hardware de bajo coste.
- Baseline de referencia para investigación en imitación: sirve como punto de comparación frente a nuevas políticas entrenadas sobre el mismo dataset, al estar publicada con pesos y receta de entrenamiento reproducibles.
- Fine-tuning en tareas de picking y placing: al ser una política ligera de 51,7 M de parámetros, se puede reentrenar con `lerobot-train` sobre un dataset propio de pocas horas para adaptar el comportamiento a una nueva disposición de objetos.
- Docencia y formación en robótica: el par de comandos `lerobot-train` / `lerobot-record` permite mostrar el ciclo completo de captura de demostraciones, entrenamiento y evaluación en un curso práctico sin requerir clústeres de GPU.
- Pruebas de integración de extremo a extremo: útil para validar cámaras, calibración, cinemática del robot y latencia de control antes de invertir en políticas mayores.
- Evaluación comparativa de infraestructura de inferencia: su reducido tamaño permite medir latencia de bucle cerrado en CPU, GPU de consumo y dispositivos embebidos con distintas configuraciones de cámara.
- Recogida de datos aumentada: usar la política para inicializar episodios que un operador corrige después, acelerando la creación de nuevos datasets de teleoperación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye tasas de éxito, número de episodios evaluados, ni comparaciones con otras políticas sobre el dataset `vivekgr92/stack-unstack`. El paper de ACT reporta resultados en sus propios entornos, pero no son trasladables a este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 207 MB en fp32 (51.668.614 parámetros × 4 bytes) y unos 103 MB en fp16. A ello hay que sumar la memoria de activaciones del codificador visual y del contexto de observaciones, que no se detalla en la información disponible.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, así como en GPUs de datacenter (A100, H100) sin aprovechar su capacidad.
- Inferencia en CPU viable según el tamaño del modelo, aunque la latencia de bucle cerrado no está documentada; LeRobot permite seleccionar dispositivo con `--policy.device`.
- Opciones de despliegue: scripts de LeRobot (`lerobot-record` con `--policy.path` apuntando al checkpoint local o del Hub), y exportación a otros runtimes (ONNX, TorchScript) como opción no documentada por el autor.
- No se dispone de datos de latencia por paso, throughput de chunks por segundo ni frecuencia de control alcanzada.
- Almacenamiento: 0,2 GB de repositorio, sin necesidad de sharding.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act-stack-unstack (este) | ACT, imitación, tarea única | 51.668.614 | No aplica | apache-2.0 | Pesos en el Hub vía LeRobot |
| Otras políticas ACT en LeRobot Hub | ACT, imitación, tarea única | No disponible | No aplica | Variable según autor | Hub de Hugging Face |
| Diffusion Policy | Política de difusión para manipulación | No disponible | No aplica | No disponible | Implementaciones públicas en investigación |
| SmolVLA y familias VLA de LeRobot | Visión-lenguaje-acción | No disponible | No disponible | No disponible | Hub de Hugging Face |

No se dispone de métricas comparativas publicadas entre estas alternativas sobre el mismo dataset, por lo que la comparación numérica de rendimiento no está disponible. La diferencia principal frente a las políticas VLA es que este modelo no procesa instrucciones en lenguaje natural: está especializado en una única tarea.

## Limitaciones y advertencias

- Política de tarea única: entrenada para stack-unstack; se espera un rendimiento deficiente fuera de esa distribución de objetos, posiciones y alturas.
- Sin métricas publicadas: no hay tasa de éxito, número de episodios de evaluación ni análisis de fallos, por lo que no se puede estimar su fiabilidad en producción.
- Dependencia de la configuración de cámaras y calibración: cambios de iluminación, encuadre, tipo de cámara o montaje del brazo pueden degradar el comportamiento de forma no documentada.
- Riesgo de acciones erráticas en estados fuera de distribución: al ser una política de imitación sin modelo de incertidumbre explícito, puede generar comandos no válidos ante situaciones no vistas; requiere límites de seguridad a nivel de controlador.
- Sesgos: no evaluados. El dataset proviene de demostraciones de un operador concreto, por lo que el estilo de manipulación está sesgado hacia esas trayectorias.
- Idiomas: no aplica; el modelo no procesa ni genera texto, por lo que no hay soporte multilingüe que valorar.
- Licencia apache-2.0: permite uso comercial y modificación con obligaciones de atribución y aviso; aun así, el uso en robots reales exige validación propia y protocolos de parada de emergencia.
- Caveat de reproducibilidad: la fecha de creación del repositorio y la ausencia de documentación sobre hiperparámetros limitan la reproducción exacta del entrenamiento.
- No apto para tareas de lenguaje, código, razonamiento o visión general: cualquier expectativa en esos dominios es un error de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vivekgr92/act-stack-unstack
- Dataset de entrenamiento: https://huggingface.co/datasets/vivekgr92/stack-unstack
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
