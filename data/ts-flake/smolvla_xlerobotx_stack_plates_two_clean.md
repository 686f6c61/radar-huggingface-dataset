# ts-flake/smolvla_xlerobotx_stack_plates_two_clean

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face, diseñado para controlar robots manipuladores a partir de observaciones visuales e instrucciones en lenguaje natural. Esta ficha concreta, `ts-flake/smolvla_xlerobotx_stack_plates_two_clean`, es un ajuste fino del modelo base `lerobot/smolvla_robotwin` sobre un conjunto de datos de 50 episodios centrado en la tarea de apilar platos con un robot `xlerobot_x` equipado con tres cámaras.

El modelo resuelve el problema de la política de control robótico de extremo a extremo: recibe el estado articular de 14 dimensiones y tres imágenes RGB de 480x640 (cámara alta y dos muñecas) y emite un vector de acción de 14 dimensiones. Con 450 millones de parámetros y un tamaño de repositorio de 0,9 GB, está pensado para desplegarse en hardware de consumo, algo relevante para laboratorios con presupuesto limitado que necesitan validar políticas VLA sin clústeres de GPU.

La relevancia actual radica en que SmolVLA demuestra que un VLA de escala reducida puede alcanzar un rendimiento competitivo en tareas de manipulación, y este ajuste concreto ilustra el flujo típico de LeRobot: partir de un modelo preentrenado en RobotWin y especializarlo en una tarea concreta mediante un dataset pequeño y limpio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) compacta, según paper SmolVLA (arXiv:2506.01844) |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Librería | lerobot |
| Pipeline | robotics |
| Tipo de robot | xlerobot_x |
| Entradas | `observation.state` (14,), 3 imágenes RGB (3, 480, 640) |
| Salidas | `action` (14,) |
| Tamaño del repositorio | 0,9 GB |
| Modelo base | lerobot/smolvla_robotwin |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura de visión-lenguaje-acción que combina un codificador visual, un codificador de lenguaje y un cabezal de acciones para producir comandos motores directamente desde píxeles e instrucciones textuales. El modelo base `lerobot/smolvla_robotwin` fue preentrenado sobre el benchmark RobotWin; esta variante se obtiene por ajuste fino supervisado sobre el dataset `ts-flake/robotwin_stack_plates_two_clean_xlerobotx`.

El conjunto de datos de ajuste contiene 50 episodios y 11.765 fotogramas a 15 FPS, con instrucciones en inglés que describen variantes de la tarea de apilar platos (levantar, alinear y colocar un plato sobre otro). No se dispone de información sobre el número de tokens de entrenamiento, la composición completa del corpus del modelo base ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones específicas de decodificación o atención en la información disponible.

## Capacidades

- Control robótico de manipulación de extremo a extremo: genera acciones de 14 dimensiones a partir de estado articular e imágenes.
- Fusión multimodal de tres cámaras (alta y dos muñecas) con el estado del robot.
- Seguimiento de instrucciones en lenguaje natural para tareas de apilado de platos.
- Ejecución de variantes de una misma tarea (distintas combinaciones de platos y secuencias de agarre).
- Operación con dos brazos, según se deduce de las instrucciones del dataset que mencionan brazo izquierdo y derecho.
- Despliegue en hardware de consumo, según la model card del modelo base.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Automatización de apilado de vajilla en entornos de laboratorio: el modelo ejecuta secuencias de agarre y colocación de platos cerámicos con instrucciones textuales, adecuado por su entrenamiento específico en 50 episodios de esta tarea.
- Validación de pipelines de LeRobot: sirve como referencia para comprobar el flujo completo de entrenamiento, registro y despliegue de políticas VLA en un robot `xlerobot_x`.
- Investigación en manipulación bimanual: las instrucciones del dataset describen el uso coordinado de brazo izquierdo y derecho, lo que permite estudiar políticas de coordinación.
- Prototipado rápido en robótica de bajo coste: con 450 M de parámetros y 0,9 GB, puede ejecutarse en estaciones de trabajo con GPU de consumo para pruebas de concepto.
- Generación de datos sintéticos o aumentados: la política puede emplearse para producir trayectorias de referencia en simuladores antes de transferir a hardware real.
- Benchmarking de ajuste fino: permite comparar el efecto de datasets pequeños y limpios frente al modelo base `smolvla_robotwin` en una tarea acotada.
- Educación y demostraciones: su tamaño reducido facilita su uso en cursos de robótica y aprendizaje por imitación con hardware asequible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 M de parámetros en precisión completa (fp32) se requieren aproximadamente 1,8 GB solo para pesos, y en fp16 alrededor de 0,9 GB, sin contar activaciones ni codificadores visuales.
- GPU recomendadas: no especificadas en la información disponible; la model card del modelo base indica que está pensado para hardware de consumo.
- Compatibilidad con GPU de consumo: probable según la model card del modelo base, aunque no se detallan modelos concretos (RTX 4090, RTX 3090, etc.).
- Opciones de despliegue: LeRobot (librería oficial); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a un modelo de política robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ts-flake/smolvla_xlerobotx_stack_plates_two_clean | 450 M | no disponible | Apilado de platos (xlerobot_x) | apache-2.0 | Hugging Face |
| lerobot/smolvla_robotwin | no disponible | no disponible | Manipulación general RobotWin | no disponible | Hugging Face |
| Otros VLA compactos (p. ej. variantes de SmolVLA) | no disponible | no disponible | Manipulación robótica | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está ajustado exclusivamente para la tarea de apilar platos; su generalización a otras tareas o entornos es limitada.
- Dataset pequeño: 50 episodios y 11.765 fotogramas reducen la diversidad de escenarios y pueden provocar sobreajuste a las condiciones de captura.
- Dependencia del hardware: diseñado para el robot `xlerobot_x` con tres cámaras concretas; su uso en otra plataforma requiere reentrenamiento o adaptación.
- Idiomas: las instrucciones de entrenamiento están en inglés; no se documenta soporte multilingüe.
- Riesgo de alucinación motora: como política de control, puede generar acciones incorrectas o inseguras ante observaciones fuera de distribución.
- Sesgos: no documentados, pero probables en cuanto a posiciones, iluminación y tipos de platos presentes en el dataset.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo en producción.
- Sin métricas publicadas: no hay benchmarks que permitan estimar la tasa de éxito real de la tarea.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ts-flake/smolvla_xlerobotx_stack_plates_two_clean
- Modelo base: https://huggingface.co/lerobot/smolvla_robotwin
- Dataset de entrenamiento: https://huggingface.co/datasets/ts-flake/robotwin_stack_plates_two_clean_xlerobotx
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Guía LeRobot SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
