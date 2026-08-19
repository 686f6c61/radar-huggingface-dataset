# yuanty/fastwam

## Resumen

Fast-WAM es un modelo de acción-mundo (World Action Model, WAM) para control robótico encarnado, desarrollado por Tianyuan Yuan, Zibin Dong, Yicheng Liu y Hang Zhao. El modelo aborda una pregunta central: ¿necesitan los WAMs imaginar el futuro en tiempo de inferencia para ejecutar acciones correctamente, o basta con modelar la dinámica visual durante el entrenamiento? Fast-WAM propone una respuesta práctica: preserva la supervisión del modelo de mundo durante el entrenamiento, pero en inferencia utiliza una interfaz de política directa que predice acciones a partir de la observación actual, sin necesidad de denoising iterativo de vídeo. Esto reduce significativamente la latencia en comparación con los WAMs tradicionales de "imaginar y luego ejecutar".

El repositorio en HuggingFace incluye tres checkpoints oficiales: dos para el benchmark LIBERO (uno base y uno con la variante Optional IDM) y uno para RoboTwin. El checkpoint Optional IDM permite dos modos de inferencia en un mismo modelo: `idm`, que primero imagina el vídeo futuro y luego predice acciones, y `first_frame`, que predice acciones directamente. En el benchmark completo de LIBERO (40 tareas, 50 episodios por tarea), el modo IDM alcanza un 98.55% de éxito medio, mientras que el modo first_frame logra un 97.75%, demostrando que la imaginación explícita aporta una mejora marginal pero no imprescindible.

El tamaño del repositorio es de 36.1 GB, lo que indica pesos de considerable magnitud, aunque no se detalla el número exacto de parámetros. El modelo está diseñado para entornos de simulación robótica como LIBERO y RoboTwin, y su código de entrenamiento y evaluación está disponible en GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World Action Model (WAM) basado en difusion; detalles completos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa observaciones visuales, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`), con archivos `dataset_stats.json` asociados |

## Arquitectura y entrenamiento

Fast-WAM es un World Action Model que modela explícitamente la evolución de las observaciones visuales bajo acciones. La arquitectura exacta (número de capas, tipo de backbone visual, mecanismo de atención, etc.) no se detalla en la información disponible. Según el abstract del paper, los WAMs existentes siguen un paradigma de "imaginar y ejecutar": primero generan un vídeo futuro mediante denoising iterativo y luego derivan acciones a partir de ese vídeo, lo que incurre en una latencia considerable. Fast-WAM rompe con este paradigma al usar una interfaz de política directa en test time, prediciendo acciones desde la observación actual, pero manteniendo la supervisión del modelo de mundo durante el entrenamiento. Esta supervisión permite que el modelo aprenda una representación de la dinámica del entorno sin necesidad de generación explícita en inferencia.

El entrenamiento se realizó sobre los benchmarks LIBERO y RoboTwin, con configuraciones de cámara específicas: dos cámaras a 224×224 para LIBERO y tres cámaras a 384×384 para RoboTwin. El checkpoint Optional IDM se entrena con un desplazamiento de programador de acciones (`sigma_shift`) de 1.0, y admite dos modos de inferencia sin necesidad de reentrenamiento. No se especifican los detalles del dataset (número de tokens, composición exacta, si se usó RLHF o DPO), pero al ser un modelo de robótica basado en imitación, es probable que se haya utilizado aprendizaje por imitación con demostraciones expertas.

## Capacidades

- Control robótico encarnado: predice acciones motoras a partir de observaciones visuales (imágenes de cámaras) en entornos de manipulación.
- Modelado de mundo: aprende la dinámica visual del entorno durante el entrenamiento, lo que permite predecir cómo evolucionará la escena bajo una secuencia de acciones.
- Dos modos de inferencia (solo en el checkpoint Optional IDM):
  - `idm`: genera un vídeo futuro mediante denoising y luego predice acciones basándose en ese vídeo imaginado.
  - `first_frame`: predice acciones directamente desde la observación actual, sin imaginación futura en test time.
- Generalización entre tareas: evaluado en LIBERO con 40 tareas distintas (spatial, goal, object, long-horizon) y en RoboTwin.
- Integración con pipelines de evaluación estándar: incluye archivos `dataset_stats.json` para normalización de observaciones y acciones.
- Sin dependencia de modelos de lenguaje: a diferencia de los VLA (Vision-Language-Action), no requiere un LLM ni procesamiento de texto.

## Casos de uso

- Manipulación robótica en simulación: Fast-WAM puede controlar brazos robóticos en entornos LIBERO para tareas como alcanzar objetos, apilar bloques o manipular objetos con agarre, con una tasa de éxito superior al 97% en el modo first_frame.
- Evaluación de políticas de imitación: los checkpoints sirven como referencia para comparar nuevos algoritmos de aprendizaje por imitación en LIBERO y RoboTwin, ya que incluyen estadísticas de dataset para reproducir la evaluación exacta.
- Estudio del papel de la imaginación futura: el checkpoint Optional IDM permite a los investigadores comparar el rendimiento entre la inferencia con imaginación (IDM) y sin ella (first_frame) en el mismo modelo, facilitando el análisis de si la generación de vídeo futuro aporta beneficios reales.
- Despliegue en robots reales con restricciones de latencia: el modo first_frame elimina el coste computacional del denoising iterativo, lo que lo hace adecuado para sistemas de control en tiempo real donde la latencia es crítica.
- Aprendizaje de modelos de mundo para planificación: aunque Fast-WAM no genera vídeo en inferencia, su entrenamiento con supervisión de modelo de mundo puede servir como base para extraer representaciones dinámicas útiles en otros módulos de planificación.
- Benchmarking de hardware: al ser un modelo de tamaño considerable (36.1 GB en disco), puede utilizarse para medir el rendimiento de GPUs y frameworks de inferencia en cargas de trabajo de robótica.

## Benchmarks y rendimiento

El checkpoint Optional IDM fue evaluado en el benchmark completo de LIBERO (40 tareas, 50 episodios por tarea). Los resultados se muestran en la siguiente tabla:

| Modo de inferencia | Spatial | Goal | Object | Long | Promedio |
| --- | ---: | ---: | ---: | ---: | ---: |
| IDM (con imaginación) | 99.0% | 98.6% | 99.6% | 97.0% | **98.55%** |
| First frame (Fast-WAM) | 98.2% | 97.8% | 99.2% | 95.8% | **97.75%** |

No se han publicado resultados de benchmarks adicionales (como MMLU, HumanEval, GSM8K) porque no es un modelo de lenguaje. Los resultados de RoboTwin no se detallan en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio: 36.1 GB, lo que sugiere pesos en precisión fp32 o fp16. En fp16, el modelo ocuparía aproximadamente 18 GB de VRAM; en int8, unos 9 GB (estimación orientativa, no confirmada).
- GPU recomendadas: no se especifican oficialmente. Para cargar el modelo completo en fp16, se necesitaría una GPU con al menos 20 GB de VRAM (por ejemplo, RTX 4090, A100 40GB, H100). Para fp32, se requerirían más de 36 GB.
- No se indica si cabe en GPUs de consumo; dado el tamaño, probablemente requiera una GPU de gama alta o cuantización.
- Opciones de despliegue: el repositorio oficial de GitHub proporciona scripts de evaluación para LIBERO y RoboTwin. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan datos concretos. El modo first_frame debería ser significativamente más rápido que el modo IDM al evitar el denoising iterativo, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros WAMs o VLA en la información proporcionada. Como referencia cualitativa, Fast-WAM se diferencia de los VLA (como RT-2 o OpenVLA) en que no usa un modelo de lenguaje, y de otros WAMs (como UniPi o RoboDreamer) en que elimina la generación de vídeo en inferencia. Sin embargo, no hay benchmarks comparativos publicados en las fuentes consultadas.

## Limitaciones y advertencias

- Licencia no especificada: no se indica bajo qué términos se distribuyen los pesos, lo que puede limitar su uso comercial o derivado. Se recomienda contactar con los autores antes de utilizarlo en producción.
- Sesgos y alucinaciones: al ser un modelo de robótica entrenado en simulación, puede no generalizar bien a entornos reales no vistos. No hay evaluación de sesgos sociales ni de alucinación en el sentido de los LLM.
- Limitaciones de contexto y idioma: el modelo no procesa lenguaje; solo observaciones visuales. No es adecuado para tareas que requieran instrucciones textuales o razonamiento simbólico.
- Dependencia de estadísticas de dataset: para una evaluación correcta, es necesario usar los archivos `dataset_stats.json` correspondientes; de lo contrario, la normalización de observaciones y acciones será incorrecta.
- Tamaño y requisitos de memoria: el checkpoint de 36.1 GB puede ser difícil de manejar en hardware limitado, y no se documentan opciones de cuantización.
- Reproducibilidad: el código está disponible en GitHub, pero no se especifican las versiones exactas de las dependencias ni el entorno de ejecución recomendado.

## Enlaces

- HuggingFace: https://huggingface.co/yuanty/fastwam
- Paper (arXiv): https://arxiv.org/abs/2603.16666
- Página del proyecto: https://yuantianyuan01.github.io/FastWAM/
- Código (GitHub): https://github.com/yuantianyuan01/FastWAM
