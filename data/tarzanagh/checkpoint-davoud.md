# tarzanagh/checkpoint-davoud

## Resumen

El modelo `tarzanagh/checkpoint-davoud` es un finetune del modelo GR00T-N1.7-3B, un Vision-Language-Action (VLA) desarrollado por NVIDIA, adaptado específicamente para la habilidad de *pick* (recogida de objetos) en el entorno DexMate Vega. Ha sido entrenado por Davoud Ataee Tarzanagh, investigador en Samsung SDS Research America especializado en Physical AI, como parte de un experimento de aprendizaje por demostración para robótica de manipulación.

El modelo parte de la arquitectura GR00T N1.7 con 3.144 millones de parámetros y ha sido ajustado con 403 episodios de entrenamiento (22 reservados para validación, con división determinista), 10.000 pasos de optimización con batch global de 40 y tasa de aprendizaje de 1e-4. El repositorio incluye los componentes `processor/` y `experiment_cfg/` necesarios para ejecutar inferencia, lo que lo convierte en un checkpoint listo para evaluación en entornos de simulación o robots reales compatibles con el ecosistema GR00T.

Su relevancia reside en que demuestra un flujo completo de fine-tuning de un VLA de NVIDIA para una tarea de manipulación concreta, con una receta de entrenamiento reproducible y datos de validación separados. Es un ejemplo de cómo adaptar modelos base de robótica a habilidades específicas con pocos datos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en GR00T N1.7 (transformer multimodal) |
| Parámetros totales | 3.144.016.000 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplicable (modelo de robótica, sin interfaz de lenguaje natural) |
| Licencia | other (no especificada en la model card; consultar términos de NVIDIA) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es GR00T N1.7, un VLA de NVIDIA que integra un codificador de visión, un módulo de lenguaje y un cabezal de acción para control robótico. La arquitectura concreta del modelo base (número de capas, dimensiones ocultas, tipo de atención) no está documentada en el repositorio. El finetune se realizó sobre la habilidad de *pick* en el entorno DexMate Vega, con 403 episodios de entrenamiento y 22 de validación. El proceso de optimización empleó 10.000 pasos con batch global de 40 y learning rate de 1e-4. No se menciona el uso de RLHF ni DPO; es un ajuste supervisado sobre demostraciones.

## Capacidades

- Ejecución de la tarea de *pick* (recogida de objetos) en el entorno DexMate Vega.
- Procesamiento de entrada visual y de lenguaje para generar acciones de control del robot.
- Inferencia reproducible gracias a los ficheros `processor/` y `experiment_cfg/` incluidos.
- Compatible con el ecosistema GR00T de NVIDIA para robótica.

## Casos de uso

- Automatización de tareas de *pick and place* en entornos industriales: el modelo puede integrarse en un sistema de control para recoger piezas de una cinta transportadora y colocarlas en posiciones definidas, aprovechando la capacidad de generalización del VLA base.
- Investigación en manipulación robótica: sirve como punto de partida para experimentos de finetune con más episodios o tareas adicionales, ya que el repo incluye la configuración de experimento.
- Evaluación de algoritmos de aprendizaje por demostración: la división determinista entre train y test permite comparar de forma justa distintas recetas de entrenamiento.
- Prototipado de sistemas de robótica asistida por VLA: permite integrar el modelo en un entorno de simulación (por ejemplo, Isaac Sim) para validar la política antes de desplegarla en hardware real.
- Benchmark de VLA de código abierto: sirve como referencia de rendimiento para modelos de la misma categoría en la tarea de pick con DexMate.
- Formación y educación en robótica: útil en cursos de robótica avanzada para demostrar el flujo completo de finetuning de un VLA con datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica el número de episodios de entrenamiento y el esquema de optimización, sin métricas de éxito en la tarea de *pick* (tasa de éxito, precisión, etc.). No es posible comparar con otros modelos sin datos cuantitativos.

## Requisitos de hardware

- VRAM estimada: con 3.144 millones de parámetros en precisión FP16, la inferencia requiere aproximadamente 6,3 GB solo para los pesos, más overhead de activaciones y memoria del entorno de ejecución. Se estima un mínimo de 12 GB de VRAM para inferencia cómoda.
- GPU recomendadas: tarjetas con al menos 12 GB de VRAM como RTX 4070 Ti, RTX 4080, RTX 4090, A10 o A100. Para entrenamiento, se necesitarían GPUs con más memoria (A100 40GB o H100) o un setup multi-GPU.
- Si cabe en consumer GPU: sí, en GPUs de consumo con 12 GB o más se puede ejecutar la inferencia, aunque el entorno de simulación de robótica (como Isaac Sim) suele requerir GPU adicional.
- Opciones de despliegue: el repositorio incluye los ficheros de configuración para inferencia, pero no se especifica el runtime (vLLM, llama.cpp, etc.). Dado que es un modelo VLA, probablemente se ejecute mediante el framework de NVIDIA GR00T o un entorno de Python con PyTorch.
- Latencia y throughput: no disponible. Depende del hardware y del entorno de simulación.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GR00T N1.7 (base) | 3.1B | VLA | no disponible | NVIDIA (consulta) | Hugging Face |
| Este finetune (tarzan-3B) | 3.1B | VLA | no disponible | other (consulta) | Hugging Face |
| RoboVLA (referencia) | ~7B | VLA | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativos en el repositorio. La comparación se limita a la arquitectura y el origen del modelo. No hay alternativas públicas con el mismo tamaño y la misma tarea de pick en DexMate V2.

## Limitaciones y advertencias

- No se han publicado métricas de éxito en la tarea de *pick*; el rendimiento real es desconocido.
- El entrenamiento se realizó con solo 403 episodios, lo que limita la generalización a variaciones del entorno (iluminación, poses de objetos, etc.).
- La licencia se indica como "other" en Hugging Face y la model card no detalla los términos; antes de usar comercialmente, es necesario consultar la licencia del modelo base GR00T de NVIDIA y la del finetune.
- El modelo está orientado a la tarea específica de *pick* en DexMate Vega; no es un modelo generalista de robótica ni de lenguaje.
- No se incluyen datos de sesgos ni evaluación de seguridad; como todo modelo de robótica, requiere supervisión en entornos reales.
- La fecha de creación es 2026-08-23, por lo que es un modelo reciente con poca o ninguna validación por la comunidad (0 descargas, 0 likes).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tarzanagh/checkpoint-davoud
- Perfil del autor en Hugging Face: https://huggingface.co/tarzanagh
- Página personal de Davoud Ataee Tarzanagh: https://tarzanagh.github.io/
- Perfil de Google Scholar: https://scholar.google.com/citations?user=Djtvz_0AAAAJ&hl=en
