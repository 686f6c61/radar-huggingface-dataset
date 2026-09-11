# TULLUS/RoboBrain2.5-4B

## Resumen

RoboBrain2.5-4B es un modelo multimodal de visión-lenguaje orientado a IA encarnada (embodied AI), publicado en HuggingFace bajo el identificador `TULLUS/RoboBrain2.5-4B`. La model card del repositorio corresponde a RoboBrain 2.5, el modelo fundacional de robótica desarrollado por BAAI (Beijing Academy of Artificial Intelligence) dentro del proyecto FlagOpen, cuya variante de referencia citada en los ejemplos de código es `BAAI/RoboBrain2.5-8B-NV`. El repositorio aquí analizado contiene una variante de 4.826.771.968 parámetros (~4,83 mil millones) con pesos en safetensors, lo que sugiere una adaptación o reempaquetado de menor tamaño respecto al modelo de 8B del autor original.

El modelo resuelve tareas de percepción visual general, grounding visual, predicción de affordances, razonamiento espacial 3D y estimación temporal del progreso de tareas robóticas. Su propuesta diferencial frente a RoboBrain 2.0 es el salto de razonamiento espacial en 2D a 3D con información de profundidad, la comprensión de restricciones métricas absolutas (por ejemplo, "mantenerse entre 1 y 5 cm por encima") y la generación de trazas de manipulación completas en lugar de puntos aislados.

La relevancia actual del modelo reside en su función como General Reward Model (GRM) para aprendizaje por refuerzo de políticas VLA (Vision-Language-Action): proporciona señales de recompensa densas y multimodales que, según la model card, permiten alcanzar tasas de éxito superiores al 95 % en manipulaciones finas con una sola demostración. La arquitectura declarada en los metadatos del repositorio es `qwen3_vl`, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_vl (transformer multimodal visión-lenguaje; etiqueta declarada en los metadatos del repositorio) |
| Parametros totales | 4.826.771.968 (~4,83 B), según safetensors |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors |
| Idiomas soportados | no disponible (los metadatos no listan idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 9,7 GB) |

## Arquitectura y entrenamiento

La información disponible indica que RoboBrain 2.5 se construye sobre una arquitectura multimodal del tipo visión-lenguaje (etiqueta `qwen3_vl`), con un codificador visual y un decodificador de lenguaje capaz de emitir coordenadas, puntos y secuencias estructuradas además de texto. Los papers referenciados en los metadatos (arXiv:2601.14352, arXiv:2512.13660 y arXiv:2512.23703) corresponden al informe técnico de RoboBrain 2.5 y a trabajos asociados, aunque los detalles concretos de composición del dataset, número de tokens de entrenamiento y pipeline de alineación (RLHF/DPO) no están disponibles en la información proporcionada.

La evolución técnica declarada respecto a la versión 2.0 incluye tres ejes: razonamiento espacial nativo en 3D (predicción de coordenadas con profundidad en lugar de puntos sobre imagen 2D, medición de métricas 3D absolutas y generación de trazas de manipulación con múltiples puntos clave), y estimación temporal densa de valor mediante un General Reward Model capaz de predecir progreso multigranular y estados de ejecución (éxito, fallo, error) a través de distintas tareas, puntos de vista y morfologías de robot. Se mantienen además las capacidades heredadas de 2.0: razonamiento interactivo con planificación de horizonte largo y realimentación en bucle cerrado, percepción espacial con predicción de puntos y bounding boxes, percepción temporal de trayectorias futuras y razonamiento de escena con memoria estructurada en tiempo real.

## Capacidades

- Generación de texto y respuesta a preguntas visuales generales (VQA) sobre imágenes.
- Grounding visual: localización de objetos descritos en lenguaje natural mediante puntos o bounding boxes.
- Predicción de affordances para manipulación (por ejemplo, la zona de una taza adecuada para agarrarla).
- Razonamiento espacial 3D: predicción de coordenadas con profundidad y comprensión de restricciones métricas absolutas en centímetros.
- Generación de trazas de manipulación (3D Spatial Trace): secuencias de puntos clave que describen el proceso completo de una tarea, lo que implica planificación espacial con métricas absolutas.
- Estimación temporal de valor: predicción densa de progreso de tarea y clasificación de estados de ejecución (éxito, fallo, error) desde distintos puntos de vista.
- Actuación como reward model para aprendizaje por refuerzo de políticas VLA, con realimentación densa en tiempo real.
- Navegación robótica: identificación de destinos y puntos intermedios a partir de instrucciones en lenguaje natural.
- Razonamiento interactivo multi-turno con planificación de horizonte largo y bucle cerrado.
- Memoria estructurada de escena con construcción y actualización en tiempo real.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de audio: no disponible en la información proporcionada.

## Casos de uso

- Manipulación robótica fina con refuerzo: el modelo actúa como General Reward Model y aporta señales densas de progreso durante el entrenamiento de políticas VLA; la model card reporta más del 95 % de éxito en manipulaciones finas con una sola demostración, lo que lo hace adecuado para reducir el coste de recogida de datos reales.
- Etiquetado automático de datasets de robótica: dada una secuencia de imágenes de una tarea, el modelo estima el grado de avance y el estado de ejecución, permitiendo anotar demostraciones con etiquetas de progreso sin intervención humana.
- Predicción de affordances en pipelines de percepción: para un objeto detectado, el modelo devuelve la región de agarre o interacción, integrándose como módulo previo al planificador de movimiento.
- Grounding visual para control de brazo robótico: la instrucción en lenguaje natural ("la persona con gorro rojo", "el hueco entre las dos tazas") se traduce en puntos o cajas que el controlador puede consumir directamente.
- Navegación de robots móviles: el modelo identifica puntos de destino dentro de una escena a partir de descripciones textuales, lo que permite definir waypoints intermedios en entornos interiores.
- Verificación de cumplimiento de restricciones físicas: al comprender métricas absolutas, puede validar instrucciones del tipo "mantener 1-5 cm de separación" antes de ejecutar una trayectoria, útil en tareas de ensamblaje o apilado.
- Evaluación automática de políticas robóticas: en un bucle de evaluación, el modelo puntúa la ejecución de una política y detecta fallos o errores, sustituyendo parte de la supervisión manual en laboratorio.
- Asistencia en planificación de tareas de horizonte largo: gracias al razonamiento interactivo y a la memoria de escena, puede descomponer una orden compleja en subtareas encadenadas con realimentación sobre el estado observado.
- Análisis visual en entornos con recursos limitados: al tratarse de una variante de ~4,83 B de parámetros, puede desplegarse en GPUs de gama alta para consumo en lugar de requerir clústeres de varios aceleradores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente declara, de forma cualitativa, que el modelo alcanza una tasa de éxito superior al 95 % en manipulaciones finas y complejas con una sola demostración al utilizarse como reward model para refuerzo de políticas VLA. No se proporcionan cifras de MMLU, HumanEval, GSM8K ni de benchmarks específicos de robótica (por ejemplo, simuladores de manipulación o navegación), por lo que no es posible comparar cuantitativamente con modelos similares.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 9,7 GB solo para pesos, más el overhead del codificador visual y de las cachés de atención; en la práctica se recomienda reservar entre 12 y 16 GB.
- VRAM estimada en cuantización int8: del orden de 5-6 GB de pesos, con un consumo total en torno a 8-10 GB.
- VRAM estimada en int4: del orden de 3 GB de pesos, con un consumo total en torno a 5-7 GB, asumiendo que existan pesos cuantizados (no publicados en este repositorio).
- GPUs profesionales: cabe sin problema en A100 (40/80 GB), H100 y L40S.
- GPUs de consumo: sí cabe. Una RTX 4090 o RTX 3090 (24 GB) ejecuta la variante en bf16 con margen; una RTX 4080 (16 GB) o RTX 4060 Ti (16 GB) es viable en bf16 con secuencias moderadas, y una GPU de 8-12 GB requiere cuantización.
- Opciones de despliegue: el repositorio de referencia (FlagOpen/RoboBrain2.5) ofrece una clase `UnifiedInference` sobre Transformers para tareas de VQA, grounding, pointing y navegación. El soporte en vLLM, llama.cpp, Ollama o TGI no está confirmado en la información disponible; para llama.cpp sería necesario disponer de pesos GGUF, que este repositorio no publica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TULLUS/RoboBrain2.5-4B | ~4,83 B | no disponible | Visión-lenguaje para IA encarnada, reward modeling | apache-2.0 | HuggingFace (0 descargas, 0 likes en los metadatos consultados) |
| BAAI/RoboBrain2.5-8B-NV | no disponible en la información proporcionada (la model card lo cita como referencia) | no disponible | Visión-lenguaje para IA encarnada | no disponible en la información proporcionada | HuggingFace, colección `BAAI/robobrain25` |
| RoboBrain 2.0 | no disponible | no disponible | Visión-lenguaje para IA encarnada (generación anterior) | no disponible en la información proporcionada | HuggingFace, proyecto FlagOpen |
| Qwen3-VL (familia base) | no disponible | no disponible | Visión-lenguaje generalista | no disponible en la información proporcionada | HuggingFace |

No se dispone de datos suficientes para comparar rendimiento, contexto o licencia de estas alternativas con rigor. La comparación anterior se limita a lo que aparece citado en la model card y en los metadatos del repositorio.

## Limitaciones y advertencias

- Discrepancia de identidad: el repositorio se publica bajo el espacio `TULLUS/RoboBrain2.5-4B`, pero la model card y los ejemplos de código hacen referencia a `BAAI/RoboBrain2.5-8B-NV`. No se documenta en la información disponible la relación exacta entre ambos (destilación, recorte, reempaquetado o conversión), ni si el resultado mantiene las capacidades del modelo original.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no cuenta con pipeline declarado, lo que dificulta validar su reproducibilidad.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad ni tasas de error en predicción de coordenadas, bounding boxes o trayectorias; en tareas de control robótico un error de grounding se traduce directamente en un fallo físico.
- Idiomas soportados no declarados: no hay garantía de comportamiento multilingüe ni de cobertura fuera del inglés.
- Longitud de contexto no especificada: no es posible planificar despliegues con historiales largos sin validación empírica previa.
- La afirmación de más del 95 % de tasa de éxito con una sola demostración proviene de la model card del autor y no está respaldada por una tabla de benchmarks en la información disponible; debe tratarse como una declaración del publicador, no como un resultado verificado de forma independiente.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene revisar las licencias de los modelos base (familia Qwen3-VL) y de los datasets de entrenamiento empleados, que no se detallan.
- Uso en producción: al tratarse de un modelo orientado a robótica, cualquier despliegue sobre hardware físico requiere capas de seguridad externas (paradas de emergencia, límites de par, validación de trayectorias) independientes del modelo.
- La búsqueda web realizada no devolvió documentación técnica adicional sobre este repositorio concreto; los resultados obtenidos no eran relevantes para el modelo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/TULLUS/RoboBrain2.5-4B
- Página del proyecto: https://superrobobrain.github.io/
- Informe técnico (arXiv): https://arxiv.org/abs/2601.14352
- Repositorio de código: https://github.com/FlagOpen/RoboBrain2.5
- Colección en HuggingFace de BAAI: https://huggingface.co/collections/BAAI/robobrain25/
- Referencia arXiv adicional citada en los metadatos: arXiv:2512.13660
- Referencia arXiv adicional citada en los metadatos: arXiv:2512.23703
