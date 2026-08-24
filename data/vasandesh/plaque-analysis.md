# vasandesh/plaque-analysis

## Resumen

El modelo `vasandesh/plaque-analysis` es un sistema de segmentación de arterias coronarias basado en nnU-Net v2, desarrollado por el autor vasandesh y publicado en HuggingFace con licencia MIT. Su función principal es la segmentación voxel a voxel del árbol de arterias coronarias en imágenes de angiografía por tomografía computarizada cardíaca (CCTA) en 3D, un paso crítico en el análisis cuantitativo de placa coronaria. El modelo está entrenado sobre el dataset público ImageCAS, que contiene aproximadamente 1.000 escáneres CCTA con anotaciones manuales de referencia.

El modelo se presenta como la primera etapa de un pipeline clínico de análisis en múltiples fases que incluye clasificación de placa por umbrales de unidades Hounsfield (calcificada, no calcificada, núcleo necrótico de bajo contenido lipídico), reconstrucción de mapas de placa en 3D, estimación de flujo fraccionario de reserva (FFR) y una aplicación de revisión clínica con visualización 3D y reconstrucción curva multi-planar (curved MPR). La arquitectura es un nnU-Net v2 con encoder residual 3D a resolución completa, y el tamaño del repositorio es de 0,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nnU-Net v2 (3D Residual-Encoder, full resolution) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision 3D, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | pytorch (no se especifica si safetensors o binarios) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura nnU-Net v2, un framework de segmentación biomédica auto-configurable desarrollado por Isensee et al. en 2021. En este caso se utiliza una variante con encoder residual 3D a resolución completa, lo que permite procesar volúmenes CCTA completos en formato NIfTI sin pérdida de resolución espacial. La entrada es un volumen 3D y la salida es una máscara de segmentación binaria que identifica el árbol de arterias coronarias.

El entrenamiento se realizó sobre el dataset ImageCAS (~1.000 escaneos CCTA), utilizando el split oficial de train/val/test y únicamente el pliegue fold_0, que presentó el mejor rendimiento en validación. No se menciona el uso de RLHF ni DPO, ya que se trata de un modelo de segmentación supervisada, no de un modelo de lenguaje. Tampoco se documentan técnicas de aumento de datos o configuración específica de hiperparámetros en la model card.

## Capacidades

- Segmentación voxel a voxel del árbol de arterias coronarias en volúmenes CCTA en 3D, con entrada en formato NIfTI.
- Integración como primera etapa de un pipeline de análisis clínico de placa coronaria, que incluye clasificación de placa por umbral de HU, reconstrucción 3D de mapas de placa, estimación de FFR y visualización clínica con curved MPR.
- No es un modelo de lenguaje: no soporta generación de texto, razonamiento, código, matemáticas ni tool calling.
- Capacidades multilingües: no aplica, es un modelo de visión médica.
- No se documentan capacidades de thinking mode, visión general o audio.

## Casos de uso

- Análisis cuantitativo de placa coronaria (QCPA): el modelo permite identificar y cuantificar el volumen de placa en milímetros cúbicos, distinguiendo entre lumen y pared arterial, tal como se describe en las guías del ACC de 2025.
- Detección y caracterización de placa coronaria: como primera etapa del pipeline, la segmentación del árbol coronario es imprescindible para clasificar la placa en calcificada, no calcificada y núcleo de bajo lipídico mediante umbrales de HU.
- Planificación de intervenciones percutáneas: la segmentación permite generar visualizaciones 3D y reconstrucciones curvas multi-planar (curved MPR) que ayudan al intervencionista a evaluar la anatomía y la composición de la placa antes del procedimiento.
- Estimación de flujo fraccionario de reserva (FFR): el modelo alimenta la etapa 4 del pipeline, que calcula FFR de forma no invasiva mediante técnicas de CFD (dinámica de fluidos computacional), aunque se indica que es un prototipo de investigación.
- Investigación clínica en cardiología: el modelo permite automatizar la segmentación de arterias coronarias en grandes cohortes de CCTA, lo que facilita estudios epidemiológicos y de correlación con resultados clínicos.
- Formación y desarrollo de pipelines de IA médica: al estar publicado con licencia MIT, sirve como referencia para equipos que desarrollan sistemas de análisis de placa coronaria, permitiendo comparar con sus propios modelos o como punto de partida para fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El tamaño del repositorio es de 0,2 GB, lo que indica que los pesos del modelo son relativamente ligeros, probablemente compatibles con GPUs de consumo medio.
- VRAM estimada: no disponible.
- GPUs recomendadas: no disponible.
- Posibilidad de ejecución en GPU consumer: probablemente sí, dado el tamaño del modelo y la naturaleza de nnU-Net, pero no se confirma.
- Opciones de despliegue: el modelo se distribuye con PyTorch, por lo que se puede desplegar con los scripts de inferencia de nnU-Net v2. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que son específicos de modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay disponibles comparativas directas en la información proporcionada. En el ámbito del análisis de placa coronaria asistido por IA, existen soluciones comerciales como HeartFlow (que declara un 95% de concordancia con IVUS como estándar de referencia) y múltiples modelos de investigación para segmentación de arterias coronarias en CCTA. Sin embargo, no se dispone de datos cuantitativos comparables de rendimiento, ni de parámetros de estos modelos alternativos, por lo que no se puede realizar una comparativa numérica.

## Limitaciones y advertencias

- El modelo es de investigación y no debe utilizarse en entornos clínicos sin una validación independiente exhaustiva.
- Solo realiza segmentación del árbol de arterias coronarias; la clasificación de placa y el resto de análisis dependen de etapas posteriores del pipeline que no se incluyen en este modelo.
- Entrenado únicamente en el dataset ImageCAS, lo que puede limitar la generalización a otras poblaciones, equipos de escáner o protocolos de adquisición de CCTA.
- No se documentan sesgos específicos, pero los sesgos inherentes al dataset (población, distribución de patologías, calidad de imagen) pueden propagarse a la segmentación.
- Riesgo de alucinación no aplica, pero sí existe el riesgo de segmentaciones incorrectas que pueden llevar a conclusiones clínicas erróneas si no se revisa.
- La licencia MIT permite uso comercial, pero el autor recomienda validación clínica independiente antes de cualquier uso en producción médica.
- No se proporcionan detalles sobre el preprocesamiento de datos, normalización o requisitos de formato de entrada más allá del NIfTI.

## Enlaces

- HuggingFace: https://huggingface.co/vasandesh/plaque-analysis
- Referencia del dataset ImageCAS: Huo et al., "Towards Robust Coronary Artery Segmentation in CCTA" (2021)
- Referencia de la arquitectura: Isensee et al., "nnU-Net: Self-configuring method for deep learning-based biomedical image segmentation" (2021)
- Resultados de búsqueda sobre análisis de placa coronaria cuantitativa: JACC 2025 (https://www.jacc.org/doi/10.1016/j.jcmg.2025.11.008)
- Revisión de IA en caracterización de placa coronaria: MDPI (https://www.mdpi.com/2077-0383/15/2/903)</think>## Resumen

El modelo `vasandesh/plaque-analysis` es un sistema de segmentación de arterias coronarias basado en nnU-Net v2, desarrollado por el autor vasandesh y publicado en HuggingFace con licencia MIT. Su función principal es la segmentación voxel a voxel del árbol de arterias coronarias en volúmenes de angiografía por tomografía computarizada cardíaca (CCTA) en 3D, un paso crítico en el análisis cuantitativo de placa coronaria. El modelo se entrenó sobre el dataset público ImageCAS, que contiene aproximadamente 1.000 escaneos CCTA, y está pensado como la primera etapa de un pipeline clínico multi-fase que incluye clasificación de placa por umbrales de unidades Hounsfield (HU), reconstrucción de mapas de placa en 3D, estimación de flujo fraccionario de reserva (FFR) y herramientas de revisión clínica con visualización 3D y reconstrucción curva multi-planar (curved MPR).

La arquitectura es un nnU-Net v2 con encoder residual 3D a resolución completa, lo que permite procesar volúmenes completos sin pérdida de resolución espacial. El tamaño del repositorio es de 0,2 GB, lo que indica que los pesos son relativamente ligeros y potencialmente ejecutables en GPUs de consumo medio. El modelo se distribuye en formato PyTorch y no se documentan parámetros totales ni cuantizaciones disponibles. Aunque se trata de un modelo de investigación con limitaciones para uso clínico, es relevante porque aborda un paso crítico en el diagnóstico y tratamiento de la enfermedad coronaria, un campo donde la IA ha demostrado una alta precisión en la detección y cuantificación de placa según la literatura reciente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | nnU-Net v2 (3D Residual-Encoder, full resolution) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión 3D, no de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | pytorch (no se especifica safetensors ni binarios) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura nnU-Net v2, un framework de segmentación biomédica auto-configurable propuesto por Isensee et al. en 2021. En esta implementación se utiliza un encoder residual 3D a resolución completa, lo que significa que procesa volúmenes CCTA completos sin reducir la resolución espacial, lo cual es esencial para capturar estructuras vasculares finas. La entrada es un volumen 3D en formato NIfTI y la salida es una máscara de segmentación binaria que identifica el árbol de arterias coronarias.

El entrenamiento se realizó sobre el dataset ImageCAS (~1.000 escaneos CCTA), utilizando el split oficial de train/val/test y el pliegue fold_0, que obtuvo el mejor rendimiento en validación. No se documenta el número de tokens de entrenamiento ni composición detallada del dataset más allá de su procedencia. No se aplicaron técnicas de RLHF ni DPO, ya que se trata de un modelo de segmentación supervisada y no de un modelo de lenguaje. La model card no detalla innovaciones técnicas adicionales como decodificación especulativa o atención lineal, propias de modelos de lenguaje, sino que se centra en la integración en un pipeline clínico de análisis de placa coronaria.

## Capacidades

- Segmentación voxel a voxel del árbol de arterias coronarias en volúmenes CCTA en 3D, con entrada en formato NIfTI.
- Integración como primera etapa de un pipeline de análisis clínico de placa coronaria en cinco fases: segmentación, clasificación de placa por umbral de HU, reconstrucción 3D de mapas de placa, estimación de FFR (prototipo de investigación con CFD) y revisión clínica con visualización 3D y curved MPR.
- No es un modelo de lenguaje: no genera texto, no soporta razonamiento, código, matemáticas, tool calling ni agentes.
- Capacidades multilingües: no aplica, el modelo se limita a imágenes médicas y la documentación está en inglés.
- No se documentan capacidades especiales de vision más allá de la segmentación, ni audio.

## Casos de uso

- Análisis cuantitativo de placa coronaria en práctica clínica: el modelo permite segmentar el árbol coronario de forma automática, un paso previo para cuantificar el volumen de placa en mm³ y distinguir entre lumen y pared del vaso, tal como se describe en la guía ACC 2025 sobre QCPA.
- Detección y caracterización de placa en CCTA: como primera etapa del pipeline, la segmentación es imprescindible para que la fase 2 clasifique la placa en calcificada, no calcificada y núcleo de bajo contenido lipídico mediante umbrales de HU.
- Planificación de intervenciones percutáneas: la segmentación permite generar reconstrucciones curved MPR y visualizaciones 3D que ayudan al intervencionista a evaluar la posición, extensión y composición de la placa antes del procedimiento.
- Estimación de FFR no invasiva: el modelo alimenta la etapa 4 del pipeline, que calcula el flujo fraccionario de reserva mediante simulación CFD, un prototipo de investigación que podría evitar cateterismos diagnósticos en algunos pacientes.
- Investigación clínica y epidemiológica: la automatización de la segmentación permite procesar grandes cohortes de CCTA de forma eficiente, facilitando estudios de correlación entre placa coronaria y resultados clínicos.
- Desarrollo y validación de sistemas de IA médica: al ser un modelo abierto con licencia MIT, sirve como referencia para implementaciones de segmentación de arterias coronarias en entornos académicos o comerciales, permitiendo comparar y extender el pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El tamaño del repositorio es de 0,2 GB, lo que sugiere que los pesos del modelo son ligeros y probablemente ejecutables en GPUs de consumo medio, aunque no se confirma explícitamente.
- VRAM estimada para inferencia: no disponible.
- GPUs recomendadas: no disponible.
- Posibilidad de ejecución en GPU consumer: no disponible, aunque el tamaño del modelo apunta a que es viable en tarjetas con 8-12 GB de VRAM.
- Opciones de despliegue: el modelo se distribuye en PyTorch, por lo que se puede desplegar con el framework de inferencia de nnU-Net v2. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que son específicas de modelos de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos cuantitativos de modelos comparables en la información proporcionada. En el campo de análisis de placa coronaria con IA, existen soluciones comerciales como HeartFlow (que reporta un 95% de concordancia con IVUS como estándar de oro) y otros modelos de segmentación de CCTA basados en redes convolucionales. Sin embargo, no se han encontrado datos de parámetros, contexto o rendimiento de estos modelos alternativos que permitan una comparación numérica directa con este modelo.

## Limitaciones y advertencias

- El modelo es de investigación y no debe usarse en la práctica clínica sin una validación independiente exhaustiva, como se indica explícitamente en la model card.
- Solo realiza la segmentación del árbol coronario; el resto de análisis (clasificación de placa, reconstrucción 3D, FFR) depende de etapas posteriores del pipeline que no se incluyen en este repositorio.
- Entrenado únicamente en el dataset ImageCAS, lo que puede limitar la generalización a otras poblaciones, equipos de escaneo o protocolos de adquisición de CCTA.
- No se documentan sesgos específicos, pero los sesgos inherentes al dataset (distribución de edad, sexo, comorbilidades, calidad de imagen) pueden propagarse a las predicciones del modelo.
- Riesgo de segmentaciones incorrectas: en un contexto clínico, una segmentación errónea podría llevar a una clasificación de placa o estimación de FFR equivocada, con consecuencias graves si no se revisa por un especialista.
- La licencia MIT permite uso comercial, pero el autor recomienda validación independiente antes de cualquier uso en producción médica.
- No se proporcionan detalles sobre el preprocesamiento de datos, normalización o requisitos específicos de formato de entrada más allá del NIfTI, lo que dificulta la reproducción exacta de los resultados.

## Enlaces

- HuggingFace: https://huggingface.co/vasandesh/plaque-analysis
- Referencia del dataset ImageCAS: Huo et al., "Towards Robust Coronary Artery Segmentation in CCTA" (2021)
- Referencia de la arquitectura: Isensee et al., "nnU-Net: Self-configuring method for deep learning-based biomedical image segmentation" (2021)
- Guía de análisis de placa coronaria en práctica clínica: JACC 2025, https://www.jacc.org/doi/10.1016/j.jcmg.2025.11.008
- Revisión de IA en caracterización de placa coronaria: MDPI, https://www.mdpi.com/2077-0383/15/2/903
- Revisión sistemática de IA en detección de placa con IVUS: PMC, https://pmc.ncbi.nlm.nih.gov/articles/PMC13386478/
- HeartFlow Plaque Analysis: https://www.heartflow.com/heartflow-one/plaque/
