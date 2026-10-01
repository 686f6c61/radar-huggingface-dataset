# sreetz-nv/so101_sim_manual_camera_dr75_h32_b32_25k_20260929

## Resumen

El modelo `sreetz-nv/so101_sim_manual_camera_dr75_h32_b32_25k_20260929` es un ajuste fino del modelo vision-language-action (VLA) NVIDIA GR00T N1.7-3B, desarrollado por el usuario sreetz-nv y publicado el 30 de septiembre de 2026. Se trata de un checkpoint intermedio de 25.000 actualizaciones procedente de un plan de entrenamiento de 50.000 actualizaciones, destinado a controlar un brazo robotico SO-101 en una tarea concreta de recogida y colocacion de viales en una gradilla ("Pick up the vial and place it in the rack"). El modelo combina percepcion visual (camara externa y de muneca), comprension de instrucciones en lenguaje natural y generacion de acciones motoras.

El checkpoint se ha entrenado exclusivamente con 75 episodios de teleoperacion humana en simulacion, con randomizacion de dominio aplicada a la camara externa. No incorpora demostraciones scriptadas ni de robot fisico, y no es continuacion de la politica de simulacion de 500 episodios. La arquitectura subyacente hereda de GR00T N1.7 (vision, proyeccion y cabeza de accion entrenables; backbone de lenguaje congelado), con un total de 3.144.016.000 parametros. El modelo esta pensado para investigacion y evaluacion dentro del ecosistema NVIDIA Isaac y la libreria LeRobot.

Su relevancia reside en que ejemplifica el flujo sim-to-real de NVIDIA para el robot SO-101, y en que documenta de forma transparente un punto de control intermedio con su receta de entrenamiento completa. Es importante senalar que este checkpoint de 25k no ha sido evaluado todavia ni en simulacion ni en robot fisico, por lo que su rendimiento real es desconocido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de NVIDIA GR00T N1.7; componentes de vision, proyeccion y accion entrenables, backbone de lenguaje congelado |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan cuantizaciones GGUF/INT8/INT4) |
| Idiomas soportados | en (ingles) |
| Licencia | nvidia-license (NVIDIA License, con restriccion de uso para investigacion/evaluacion) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del VLA NVIDIA GR00T N1.7-3B y se ajusta para una tarea de manipulacion concreta sobre el brazo SO-101. Los pesos publicados corresponden a un checkpoint intermedio en la actualizacion 25.000 de un plan de 50.000. En el ajuste fino, los componentes de vision, proyeccion y accion son entrenables, mientras que el backbone de lenguaje permanece congelado. El entrenamiento emplea computo en BF16 con parametros de modelo en FP32, gradient checkpointing activado y aumento de imagen. La normalizacion se recalcula desde cero a partir de los datos de teleoperacion; las acciones del brazo se modelan en modo relativo y las de la pinza en modo absoluto.

Los datos de entrenamiento consisten en 75 episodios de teleoperacion humana en simulacion, con un total de 20.613 fotogramas a 30 FPS y camaras RGB externa y de muneca a 640 x 480. El entrenamiento usa LeRobot 0.6.0, batch size 32, 32 pasos de accion supervisados y semilla 42. La cabeza nativa tiene 40 pasos, de los cuales los ocho ultimos se enmascaran durante el entrenamiento. El optimizador es AdamW con learning rate 1e-4, betas (0.9, 0.999), epsilon 1e-8, weight decay 1e-5 y gradient clipping de 1.0, con un schedule coseno sobre las 50.000 actualizaciones planificadas y 2.500 actualizaciones de warmup, segun la configuracion guardada en el checkpoint. El horizonte de ejecucion guardado es 32 y no se han evaluado otros horizontes para este checkpoint. El fichero `train_config.json` registra el plan de entrenamiento completo de 50k.

## Capacidades

- Generacion de acciones motoras para un brazo robotico SO-101 de seis articulaciones, con orden de articulaciones: shoulder pan, shoulder lift, elbow flex, wrist flex, wrist roll y gripper.
- Percepcion visual multimodal a partir de imagenes RGB de camara externa y de muneca a 640 x 480.
- Seguimiento de una instruccion de tarea en lenguaje natural (en ingles): recoger el vial y colocarlo en la gradilla.
- Decodificacion de predicciones relativas del brazo a comandos absolutos mediante el procesador incluido; valores del brazo en grados y de la pinza en porcentaje.
- Ejecucion con horizonte de accion de 32 pasos (unico horizonte evaluado, y solo de forma planificada).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (es un modelo de politica robotica, no un agente de proposito general).
- Capacidades multilingues: limitadas a ingles segun los metadatos del modelo.
- Capacidades especiales: vision (camara externa y de muneca) y control motor; no se documentan modos de razonamiento explicito ni audio.

## Casos de uso

- Investigacion en aprendizaje por imitacion: reproducir la receta de ajuste fino de GR00T N1.7 sobre 75 episodios de teleoperacion y comparar el checkpoint de 25k con el base y con el checkpoint de 20k del mismo autor.
- Flujo sim-to-real en Isaac: usar el checkpoint dentro del curso de NVIDIA "Train an SO-101 Robot From Sim-to-Real" para validar la transferencia de una politica entrenada en simulacion antes de desplegarla en hardware real.
- Experimentos de randomizacion de dominio: evaluar como afecta la randomizacion de la camara externa (dr75) al rendimiento en percepcion cuando se varia la iluminacion, la textura o la pose inicial en simulacion.
- Automatizacion de pick-and-place de laboratorio: control de un SO-101 para recoger viales y colocarlos en una gradilla, como caso acotado de manipulacion repetitiva en entorno simulado.
- Punto de partida para ajustes adicionales: al ser un checkpoint intermedio, sirve como inicializacion para continuar el entrenamiento hasta las 50.000 actualizaciones o para nuevos dominios de tarea.
- Docencia y divulgacion tecnica: ilustrar el contrato de acciones de un VLA (orden de articulaciones, unidades, horizonte de ejecucion) y el uso de pipelines de procesamiento con estadisticas de normalizacion guardadas.
- Benchmarking interno de checkpoints: comparar el rendimiento del punto de control de 25k frente al de 20k y al modelo base en la misma tarea, siempre que se ejecute una evaluacion propia (este checkpoint no esta evaluado).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el checkpoint de 25k no ha sido evaluado ni en simulacion ni en robot fisico, y que los resultados de otros checkpoints o experimentos de continuacion no son aplicables.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion a partir de los 3.144.016.000 parametros, sin datos oficiales): aproximadamente 12,6 GB en FP32, 6,3 GB en BF16/FP16, 3,1 GB en INT8 y 1,6 GB en INT4. Hay que anadir el coste de los componentes de vision y del procesador de imagen/texto (referencia a `nvidia/Cosmos-Reason2-2B`), por lo que el consumo real sera superior.
- El repositorio ocupa 12,6 GB, coherente con pesos en FP32 o con pesos mas estados asociados.
- GPU recomendadas: no disponible en la informacion proporcionada. Por el tamano, cabria esperar funcionamiento en GPUs profesionales (A100, H100, L40S) y, con cuantizacion, en GPUs de consumo de gama alta (RTX 4090, RTX 3090), pero esto no esta confirmado por el autor.
- Despliegue: la libreria indicada es LeRobot 0.6.0. El modelo se carga junto con su configuracion y ambos pipelines de procesamiento con sus estadisticas guardadas; debe usarse el conjunto completo. El modelo base declarado es `nvidia/GR00T-N1.7-3B`.
- Opciones como vLLM, llama.cpp, Ollama o TGI: no aplicables o no documentadas para este modelo de robotica (no es un LLM de texto convencional). La metadata del modelo indica `inference: false`.
- Latencia y throughput estimados: no disponible.
- Nota importante: el autor no incluye el dataset de entrenamiento en esta publicacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Horizonte de accion | Episodios de entrenamiento | Licencia | Estado |
|---|---|---|---|---|---|---|
| so101_sim_manual_camera_dr75_h32_b32_25k_20260929 (este) | 3.144.016.000 | no disponible | 32 | 75 (teleop, sim, dr75) | nvidia-license | Checkpoint 25k, sin evaluar |
| sreetz-nv/so101_orange_manual_dr77_h32_GR00T17_20k_20260916 | no disponible | no disponible | 32 (segun nombre) | 77 (teleop, sim, dr77) | no disponible | Checkpoint 20k |
| nvidia/GR00T-N1.7-3B (modelo base) | 3B (segun denominacion) | no disponible | no disponible | no disponible | NVIDIA License | Modelo base oficial |

No se dispone de datos comparativos de rendimiento (benchmarks) para ninguno de los tres modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El checkpoint de 25k no ha sido evaluado ni en simulacion ni en robot fisico; su rendimiento es desconocido.
- Es un checkpoint intermedio de un plan de 50.000 actualizaciones, no el modelo final. No debe tratarse como resultado definitivo.
- Entrenado unicamente con 75 episodios de teleoperacion humana en simulacion; no incluye demostraciones scriptadas ni de robot fisico, lo que limita la cobertura de situaciones.
- La tarea es unica y muy concreta: recoger un vial y colocarlo en una gradilla. No se documenta generalizacion a otras tareas.
- El horizonte de ejecucion guardado es 32; el autor indica que no se han evaluado otros horizontes para este checkpoint.
- Idioma limitado a ingles segun los metadatos; las instrucciones de tarea deben formularse en ese idioma.
- El dataset de entrenamiento no se incluye en la publicacion, lo que dificulta la reproducibilidad completa.
- Licencia NVIDIA con restriccion de uso para investigacion/evaluacion: el uso comercial puede estar restringido. Es imprescindible revisar el fichero `LICENSE` antes de cualquier despliegue en produccion.
- Riesgo de sobreajuste a las condiciones de simulacion y de la randomizacion de dominio concreta (dr75), con degradacion en el mundo real.
- Riesgo de alucinacion motora: el modelo puede generar trayectorias no validas o inestables, especialmente fuera de la distribucion de entrenamiento. No se documentan sesgos especificos.
- La metadata indica `inference: false`, por lo que no hay inferencia alojada disponible en Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sreetz-nv/so101_sim_manual_camera_dr75_h32_b32_25k_20260929
- Modelo base NVIDIA GR00T N1.7-3B: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Checkpoint hermano (20k, dr77): https://huggingface.co/sreetz-nv/so101_orange_manual_dr77_h32_GR00T17_20k_20260916
- Discusiones del checkpoint hermano: https://huggingface.co/sreetz-nv/so101_orange_manual_dr77_h32_GR00T17_20k_20260916/discussions
- Curso NVIDIA "Train an SO-101 Robot From Sim-to-Real With NVIDIA Isaac": https://docs.nvidia.com/learning/physical-ai/sim-to-real-so-101/latest/index.html
- Datasets y modelos del curso NVIDIA: https://docs.nvidia.com/learning/physical-ai/sim-to-real-so-101/latest/datasets-and-models.html
- Dataset SO-101 Orange Manual DR75 en Claru: https://claru.ai/datasets/sreetz-nv-so101-orange-manual-dr75-20260916
