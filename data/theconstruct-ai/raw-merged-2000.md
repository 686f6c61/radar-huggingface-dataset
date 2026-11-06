# theconstruct-ai/raw-merged-2000

## Resumen

raw-merged-2000 es un modelo Vision-Language-Action (VLA) publicado por theconstruct-ai, un fine-tuning directo del modelo fundacional nvidia/GR00T-N1.7-3B de NVIDIA. Está especializado en una única tarea de manipulación robótica: la clasificación autónoma de paquetes con ambas manos (bimanual package sorting) sobre el humanoide Unitree G1 de 23 grados de libertad (DOF). El modelo toma observaciones visuales y de lenguaje junto con el estado del robot y emite acciones articulares de 23 dimensiones, combinando control relativo de juntas y del efector final.

Con 3.144.016.000 parámetros (aproximadamente 3,1 mil millones) y un repositorio de 35,7 GB en formato safetensors, el modelo se entrenó durante 2.000 pasos sobre dos GPUs NVIDIA H200 SXM. El entrenamiento partió directamente del checkpoint base, sin checkpoints intermedios específicos de tarea, usando un dataset combinado de demostraciones teleoperadas reales (`theconstruct-ai/merged_dataset`).

Su relevancia es acotada pero clara: es un ejemplo de fine-tuning de un VLA fundacional para un embodiment concreto (el Unitree G1 con 23 DOF) y una tarea concreta, con licencia Apache 2.0, lo que facilita su reutilización e inspección. No es un modelo de propósito general ni un LLM: es una política robótica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en NVIDIA GR00T N1.7 (detalles internos de la arquitectura no disponibles en la información proporcionada) |
| Parámetros totales | 3.144.016.000 (3,1 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Embodiment | Unitree G1, 23 DOF (`g1_23dof`) |
| Representación de acción | 23 DOF, control relativo de juntas y efector final (EEF) |
| Modelo base | nvidia/GR00T-N1.7-3B |
| Pasos de entrenamiento | 2.000 |
| Hardware de entrenamiento | 2x NVIDIA H200 SXM |
| Tamaño del repositorio | 35,7 GB |
| Pipeline | robotics |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del VLA fundacional NVIDIA GR00T N1.7-3B, un modelo de visión-lenguaje-acción diseñado para control robótico generalista. No se dispone en la información proporcionada de detalles sobre la composición interna de la arquitectura (backbone visual, codificador de lenguaje, cabecera de acciones, mecanismo de atención o si emplea componentes tipo mixture-of-experts). Lo que sí se documenta es la interfaz de acción: 23 dimensiones correspondientes a los grados de libertad del Unitree G1, con control relativo tanto de juntas como del efector final.

El entrenamiento consistió en un fine-tuning directo desde `nvidia/GR00T-N1.7-3B` durante 2.000 pasos, sin checkpoints intermedios específicos de tarea. El dataset (`theconstruct-ai/merged_dataset`) combina dos fuentes históricas (`theconstruct-ai/sort_packages_real` y `theconstruct-ai/sort-pckg-real-guillem`) con episodios de demostración teleoperados recogidos específicamente para este entrenamiento. La estrategia declarada por el autor es entrenar simultáneamente sobre una mezcla diversa de demostraciones para que la política aprenda capacidades de manipulación robustas y se adapte de forma nativa a variaciones de trayectoria, sin sesgarse por checkpoints previos específicos de tarea. No se documenta en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación, ni el número de tokens o episodios del dataset.

## Capacidades

- Control robótico bimanual: genera acciones de 23 DOF para el humanoide Unitree G1, incluyendo control relativo de juntas y del efector final.
- Percepción visual-lenguaje-acción: procesa observaciones visuales junto con instrucciones en lenguaje para producir acciones motoras (capacidad heredada del modelo base GR00T N1.7).
- Clasificación y manipulación de paquetes: tarea especializada para la que fue fine-tuneado, con agarre y colocación bimanual.
- Adaptación a variaciones de trayectoria: el entrenamiento sobre un dataset mixto busca generalizar ante variaciones en las demostraciones.
- Soporte de tool calling / function calling: no disponible (no aplica a un modelo de política robótica).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión, audio): visión sí (entrada visual propia de un VLA); thinking mode y audio no disponibles.

## Casos de uso

- Clasificación automatizada de paquetes en almacén: el modelo ejecuta la tarea de sorting bimanual sobre el Unitree G1, recogiendo y depositando paquetes según la política aprendida de las demostraciones teleoperadas.
- Investigación en aprendizaje por imitación: sirve como punto de partida reproducible (2.000 pasos, 2x H200) para estudiar fine-tuning directo de VLAs fundacionales sin checkpoints intermedios.
- Benchmark de adaptación de embodiment: permite evaluar cómo un VLA fundacional (GR00T N1.7-3B) se adapta a un cuerpo concreto de 23 DOF como el Unitree G1.
- Prototipado de pipelines de teleoperación a autónomo: el dataset combinado de episodios teleoperados reales facilita reproducir el flujo de recogida de datos y entrenamiento de políticas.
- Despliegue en laboratorio con hardware humanoide: al ser Apache 2.0 y pesar 35,7 GB en safetensors, puede cargarse en estaciones con GPUs de datacenter para pruebas de manipulación en entorno controlado.
- Base para fine-tuning en tareas adyacentes: su licencia permisiva permite reentrenar sobre nuevas tareas de manipulación del mismo robot sin restricciones comerciales derivadas de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 3,1 B parámetros en safetensors (35,7 GB de repositorio, que incluye pesos en precisión completa o mixta), la inferencia en FP16 requeriría del orden de 6-7 GB solo para pesos; el resto depende del backbone visual y de los buffers de observación, no documentados.
- GPU recomendadas: el entrenamiento se realizó en 2x NVIDIA H200 SXM. Para inferencia no se especifican requisitos; por tamaño de parámetros, una GPU de datacenter (A100, H100, H200) o una consumer de gama alta con suficiente VRAM sería el punto de partida razonable, aunque no está confirmado en la información disponible.
- ¿Cabe en consumer GPU?: no confirmado. Por número de parámetros es plausible en GPUs con 12-24 GB, pero la información proporcionada no lo verifica.
- Opciones de despliegue: no disponible (no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser una política robótica, el despliegue típico sería mediante el stack de GR00T/Isaac, no documentado aquí).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| theconstruct-ai/raw-merged-2000 | 3,1 B | no disponible | VLA para sorting bimanual en Unitree G1 (23 DOF) | Apache 2.0 | Hugging Face (30 descargas) |
| nvidia/GR00T-N1.7-3B | ~3 B (según nombre) | no disponible | VLA fundacional generalista para robótica | no disponible en la información proporcionada | Hugging Face (modelo base) |
| Otros VLA de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es con su propio modelo base: raw-merged-2000 es una especialización de GR00T-N1.7-3B para un embodiment y una tarea concretos, entrenada con 2.000 pasos sobre un dataset mixto. No se dispone de datos de benchmarks que permitan comparar rendimiento frente al base u otras alternativas.

## Limitaciones y advertencias

- Especialización estrecha: la política está entrenada exclusivamente para sorting de paquetes con el Unitree G1 de 23 DOF; no es un modelo de propósito general ni transferible sin reentrenamiento a otro robot o tarea.
- Sin benchmarks publicados: no hay métricas de éxito, robustez ni generalización en la información disponible, lo que impide evaluar su calidad objetivamente.
- Riesgo de sobreajuste a las demostraciones: con solo 2.000 pasos y un dataset combinado de episodios teleoperados, la generalización ante condiciones no vistas (iluminación, objetos, posiciones) no está documentada.
- Sesgos: no documentados; en robótica, los sesgos provienen de la distribución de las demostraciones (tipos de paquete, posiciones, entorno del laboratorio).
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de acciones incorrectas o inseguras fuera de la distribución de entrenamiento.
- Idiomas: no disponibles; la interfaz de lenguaje del modelo base no está caracterizada en la información proporcionada.
- Licencia: Apache 2.0, permisiva para uso comercial, pero el modelo base GR00T N1.7-3B puede tener condiciones propias que conviene verificar antes de un despliegue comercial.
- Caveat de producción: no se documentan requisitos de seguridad, parada de emergencia ni validación en entornos reales; su uso en producción requeriría evaluación adicional y protocolos de seguridad física.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/theconstruct-ai/raw-merged-2000
- Perfil del autor: https://huggingface.co/theconstruct-ai/models
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Dataset de entrenamiento: `theconstruct-ai/merged_dataset` (referenciado en la model card; URL no proporcionada en la información disponible)
- Paper, blog o repositorio adicionales: no disponibles en la información proporcionada.
