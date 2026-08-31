# ThewakeRiver/RiverONE

## Resumen

RiverONE es un modelo de visión y lenguaje (VLM) extremadamente comprimido, desarrollado por THeWake Systems, que emplea computación cuántica simulada durante su construcción. El modelo está especializado en la comprensión de gráficos de calibración cuántica, un dominio técnico de alta complejidad. Parte de una arquitectura basada en InternVL3.5-4B combinada con un codificador visual Ising (Ising Vision Encoder), y aplica un proceso de compresión de inspiración cuántica en cuatro fases: cuantización AQLM, PV-Tuning, compartición de pesos MiniViT y generación de parámetros mediante circuitos cuánticos variacionales simulados (VQC).

El resultado es un modelo que reduce los parámetros de 4B a 1.9B según la documentación del autor, aunque los pesos reales en safetensors contienen 3.004.618.832 parámetros (aproximadamente 3B). El repositorio incluye código personalizado para la implementación del modelo y un pipeline de evaluación específico llamado QCalEval ZeroShot. La relevancia de RiverONE radica en su enfoque híbrido que fusiona técnicas de compresión clásicas con principios de computación cuántica simulada para lograr un rendimiento competitivo en tareas especializadas de análisis de gráficos, alcanzando una precisión media del 77,13% en su conjunto de evaluación específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM híbrido: InternVL3.5-4B (backbone de lenguaje) + Ising Vision Encoder + VQC parameter generator |
| Parametros totales | 3.004.618.832 (según safetensors); el autor declara 1.9B tras compresión |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AQLM (Additive Quantization for Language Models), configurado en quant_config.json |
| Idiomas soportados | no disponible (model card en chino; probablemente chino e inglés, no confirmado) |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors, 6.9 GB; repo total 7.4 GB) |

## Arquitectura y entrenamiento

RiverONE se construye sobre una arquitectura de VLM que combina un backbone de lenguaje basado en InternVL3.5-4B con un codificador visual especializado llamado Ising Vision Encoder, inspirado en principios de la mecánica cuántica. El proceso de construcción emplea computación cuántica simulada: durante la construcción del modelo, los pesos compartidos comprimidos y las señales de condicionamiento a nivel de capa se codifican en un circuito cuántico variacional simulado. Este circuito produce características de medición que se transforman en parámetros de compensación compactos, como coeficientes de perturbación de atención, puertas residuales o correcciones de bajo rango.

El entrenamiento y compresión se realiza en cuatro fases: cuantización AQLM para reducir la huella de memoria, PV-Tuning para ajustar los parámetros cuantizados, MiniViT con compartición de pesos para el codificador visual, y generación de parámetros mediante VQC (circuitos cuánticos variacionales) simulados. Este enfoque permite que el modelo capture relaciones de alta dimensión entre la información visual y textual sin necesidad de hardware cuántico real, ya que la simulación cuántica se ejecuta en hardware clásico durante la construcción. El modelo final se distribuye con código personalizado (trust_remote_code=True) que implementa la arquitectura cuántica inspirada, incluyendo los archivos modeling_riverone_qc.py y modeling_ising_vit.py.

## Capacidades

- Comprensión de gráficos de calibración cuántica: tarea principal del modelo, con capacidad para interpretar y extraer información de gráficos técnicos especializados.
- Clasificación de tipos de gráficos: alcanza un 86,83% de precisión en clasificación de tipos de gráficos (211/243 muestras).
- Extracción de campos y valores: precisión del 83,55% en extracción de campos con reglas de tolerancia.
- Evaluación y juicio de calidad: 96,30% en clasificación de assessment (234/243 muestras).
- Clasificación de estados: 85,60% en clasificación de status (208/243 muestras).
- Comprensión de gráficos y puntos clave: 63,63% en comprensión de gráficos y 46,85% en extracción de puntos clave, evaluados mediante LLM Judge (GPT-5).
- Capacidad conversacional multimodal: admite diálogo con imágenes mediante el método chat() del modelo, con soporte para mensajes multi-turno.

## Casos de uso

- Análisis automatizado de gráficos de calibración en laboratorios de investigación cuántica: el modelo puede procesar gráficos de calibración generados por equipos experimentales y extraer automáticamente métricas clave, estados y evaluaciones de calidad, reduciendo el trabajo manual de los investigadores.
- Control de calidad en fabricación de hardware cuántico: integrado en pipelines de inspección, puede clasificar gráficos por tipo y determinar si un componente cumple los criterios de calibración mediante la clasificación de assessment y status.
- Documentación técnica automatizada: a partir de gráficos de calibración, el modelo puede generar descripciones textuales de los resultados, facilitando la redacción de informes técnicos y publicaciones.
- Sistemas de monitorización de experimentos: desplegado junto a equipos de adquisición de datos, puede analizar gráficos en tiempo real y alertar sobre desviaciones en los parámetros de calibración.
- Asistente de investigación para físicos cuánticos: como chatbot especializado, permite a los investigadores hacer preguntas sobre gráficos específicos y obtener respuestas contextualizadas sobre el estado y la calidad de la calibración.
- Archivado y búsqueda semántica de resultados experimentales: el modelo puede procesar gráficos históricos, extraer campos y puntos clave, y generar metadatos estructurados para bases de datos de investigación.

## Benchmarks y rendimiento

Resultados del conjunto de evaluación QCalEval ZeroShot (RiverOne_ZeroShot_v1.2_Test, 243 muestras):

| Tarea | Puntuacion | Metodo de evaluacion |
|---|---|---|
| Q1: Comprensión de gráficos | 63,63% | LLM Judge (GPT-5) |
| Q2: Clasificación de gráficos | 86,83% | Coincidencia exacta (211/243) |
| Q3: Extracción de puntos clave | 46,85% | LLM Judge (GPT-5) |
| Q4: Evaluación y juicio | 96,30% | Coincidencia exacta (234/243) |
| Q5: Extracción de campos | 83,55% | Reglas de tolerancia |
| Q6: Clasificación de estados | 85,60% | Coincidencia exacta (208/243) |
| **Media** | **77,13%** | |

No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo ocupa 6,9 GB en safetensors con cuantización AQLM. Con bfloat16 y código personalizado, se estima un consumo de VRAM entre 8 y 12 GB para inferencia, dependiendo de la longitud de contexto y el tamaño de lote.
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100. El modelo es adecuado para GPUs de consumo con 12 GB o más de VRAM, como la RTX 4070 Ti o superiores.
- Inferencia en CPU: posible pero con latencia alta; no recomendado para producción.
- Opciones de despliegue: el modelo requiere transformers>=4.45, torch>=2.0 y la librería aqlm. Se carga con trust_remote_code=True. No se menciona soporte para vLLM, Ollama o llama.cpp en la documentación disponible.
- Formato de pesos: safetensors con cuantización AQLM, lo que requiere la librería aqlm para la descompresión durante la inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| RiverONE | 3B (declarado 1.9B) | no disponible | Gráficos de calibración cuántica | no disponible |
| InternVL3.5-4B | 4B | no disponible | VLM general | no disponible |
| Qwen2.5-VL-3B | 3B | no disponible | VLM general | Apache 2.0 |
| Phi-3.5-vision | 4.2B | 128K | VLM general | MIT |

RiverONE se distingue de los VLM generales por su especialización en un dominio técnico concreto (gráficos de calibración cuántica) y por su técnica de compresión basada en computación cuántica simulada. Sin embargo, su licencia no está especificada, lo que limita su adopción en entornos comerciales. Los modelos comparables de propósito general no están optimizados para esta tarea específica, por lo que la comparación directa de rendimiento no es posible con los datos disponibles.

## Limitaciones y advertencias

- Licencia no especificada: no se indica ninguna licencia en la página de HuggingFace ni en la model card, lo que genera incertidumbre jurídica para uso comercial.
- Dominio limitado: el modelo está especializado en gráficos de calibración cuántica; su rendimiento en tareas generales de visión y lenguaje no está documentado y probablemente sea inferior al de modelos generales de tamaño similar.
- Rendimiento bajo en extracción de puntos clave: con solo un 46,85% en Q3, esta capacidad es significativamente más débil que el resto, lo que limita su uso en tareas que requieren comprensión detallada del contenido de los gráficos.
- Dependencia de código personalizado: el modelo requiere trust_remote_code=True y archivos de implementación específicos (modeling_riverone_qc.py, modeling_ising_vit.py), lo que introduce riesgos de seguridad y mantenimiento en producción.
- Fecha de publicación futura: el modelo fue creado el 31 de agosto de 2026 y el paper tiene fecha arXiv 2606.29966 (junio de 2026), lo que sugiere que es un modelo reciente con poca adopción y validación externa.
- Sin datos de benchmarks estandar: no hay resultados en MMLU, HumanEval u otros benchmarks comunes, lo que impide comparar su rendimiento general con otros modelos.
- Sin información sobre sesgos o alucinaciones: no se documentan sesgos conocidos ni tasas de alucinación; los resultados de LLM Judge en Q1 y Q3 sugieren que puede generar descripciones inexactas en tareas complejas.
- Idiomas no especificados: aunque la model card está en chino, no se indica oficialmente qué idiomas soporta el modelo.

## Enlaces

- HuggingFace: https://huggingface.co/ThewakeRiver/RiverONE
- GitHub (repositorio): https://github.com/THeWakeSystems/RiverONE
- Paper arXiv: https://arxiv.org/abs/2606.29966
- Paper HTML: https://arxiv.org/html/2606.29966v1
- Documentacion en GitHub: https://github.com/THeWakeSystems/RiverONE/tree/main/docs
- Analisis en EmergentMind: https://www.emergentmind.com/papers/2606.29966
