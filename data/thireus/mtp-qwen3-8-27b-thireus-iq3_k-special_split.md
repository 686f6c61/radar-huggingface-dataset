# Thireus/mtp-Qwen3.8-27B-THIREUS-IQ3_K-SPECIAL_SPLIT

## Resumen

El modelo `mtp-Qwen3.8-27B-THIREUS-IQ3_K-SPECIAL_SPLIT` es una cuantización GGUF en formato IQ3_K del modelo base Qwen3.8-27B, desarrollado por el equipo de Qwen (Alibaba Cloud) y posteriormente cuantizado por el usuario Thireus. Se trata de un modelo denso de 27 000 millones de parámetros, de arquitectura multimodal (texto e imagen), diseñado para tareas de codificación, flujos de trabajo agénticos y automatización de oficina. La cuantización IQ3_K reduce el tamaño del modelo a aproximadamente 3 bits por peso, lo que permite ejecutarlo en hardware de consumo con requisitos de VRAM moderados, manteniendo un equilibrio entre fidelidad y eficiencia.

La relevancia de este modelo radica en que ofrece una versión compacta y desplegable localmente de un modelo de última generación con una ventana de contexto nativa de 262 000 tokens, algo poco habitual en modelos de este tamaño. La licencia MIT del artefacto cuantizado (a diferencia de la Apache 2.0 del modelo original) facilita su integración en proyectos propietarios. Aunque la información específica de esta cuantización es limitada, se puede inferir que sigue las prácticas habituales de cuantización GGUF con división especial de capas, optimizada para inferencia en CPU y GPU.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (visión-lenguaje) |
| Parametros totales | 27 000 millones (27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens (262K) |
| Tipos de cuantizacion | IQ3_K (GGUF, ~3 bits por peso) |
| Idiomas soportados | No disponible en la información proporcionada; el modelo base Qwen3.8-27B soporta múltiples idiomas, pero no se especifica la lista |
| Licencia | MIT (para esta cuantización) |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27 000 millones de parámetros con capacidad multimodal nativa: procesa tanto texto como imágenes mediante un codificador visual integrado. Según el repositorio oficial de Alibaba Cloud, está diseñado para sobresalir en codificación, flujos de trabajo agénticos y automatización de oficina, con una ventana de contexto de 262 144 tokens. El entrenamiento del modelo base incluye fases de preentrenamiento y ajuste fino con técnicas de razonamiento configurable (modo de pensamiento opcional), aunque los detalles específicos del dataset y el proceso de alineación (RLHF/DPO) no se detallan en la información disponible.

La cuantización IQ3_K aplicada por Thireus utiliza la herramienta GGUF Tool Suite, que emplea una técnica de cuantización de 3 bits con mejoras en la distribución de pesos (IQ: "Intelligent Quantization"). El sufijo "SPECIAL_SPLIT" sugiere una división particular de las capas del modelo para optimizar el rendimiento en hardware heterogéneo o para reducir la pérdida de precisión en capas críticas. No se dispone de información sobre el dataset de calibración utilizado ni sobre la evaluación de perplejidad específica de esta variante.

## Capacidades

- Generación de texto y razonamiento: soporta tareas de comprensión lectora, redacción, análisis y razonamiento lógico-matemático, con modo de pensamiento configurable (similar a otros modelos Qwen).
- Codificación: genera, explica, depura y completa código en múltiples lenguajes de programación, con especial énfasis en tareas de desarrollo de software.
- Visión: procesa imágenes como entrada, permitiendo descripción de imágenes, respuesta a preguntas visuales y extracción de información de documentos escaneados.
- Agentes y tool calling: compatible con flujos de trabajo agénticos, incluyendo llamada a funciones y ejecución de múltiples pasos para completar tareas complejas.
- Contexto largo: ventana nativa de 262 144 tokens, adecuada para procesar documentos extensos, repositorios de código completos o conversaciones de larga duración.
- Multilingüismo: el modelo base soporta múltiples idiomas, aunque la lista exacta no se ha especificado en la información disponible.

## Casos de uso

- Asistente de programación local: un desarrollador puede ejecutar este modelo en una estación de trabajo con GPU de 16 GB para obtener autocompletado de código, explicaciones de fragmentos y refactorización sin depender de servicios en la nube, gracias a su licencia MIT y su tamaño reducido.
- Automatización de oficina: el modelo puede procesar documentos extensos (contratos, informes) y generar resúmenes, extraer datos clave o redactar respuestas, aprovechando su contexto de 262K tokens para manejar documentos completos de una sola vez.
- Análisis de imágenes médicas o técnicas: al ser multimodal, puede recibir radiografías, diagramas o capturas de pantalla y proporcionar descripciones o responder preguntas específicas sobre ellas, útil en entornos con privacidad de datos.
- Agente de atención al cliente: integrado en un sistema de tickets, el modelo puede gestionar conversaciones multi-turno con historial largo, derivar consultas a herramientas externas mediante tool calling y mantener el contexto de la interacción durante horas.
- Procesamiento de repositorios de código: gracias a su ventana de contexto amplia, puede analizar un repositorio completo, identificar bugs, sugerir mejoras o generar documentación, algo inviable con modelos de contexto corto.
- Investigación académica: para investigadores que necesitan procesar corpus de artículos científicos con figuras y tablas, el modelo puede combinar comprensión visual y textual para extraer conclusiones o comparar resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización (IQ3_K) en la información disponible. El modelo base Qwen3.8-27B tiene benchmarks publicados según el artículo de Yottalabs, pero no se incluyen los valores concretos en los resultados de búsqueda. Se recomienda consultar el repositorio oficial de Qwen para obtener métricas de MMLU, HumanEval, GSM8K, etc., y tener en cuenta que la cuantización IQ3_K puede degradar ligeramente el rendimiento en comparación con el modelo en BF16, aunque la técnica IQ3_K está diseñada para minimizar esa pérdida.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización IQ3_K (~3 bits por peso), el tamaño del modelo es aproximadamente 27B × 3/8 = 10,1 GB, más overhead de contexto y activaciones. Se estima un consumo de 12-14 GB de VRAM para una ventana de contexto moderada (8-16K tokens). Para la ventana completa de 262K tokens, se necesitaría más memoria (posiblemente 20+ GB) o técnicas de gestión de contexto como sliding window.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A6000 (48 GB) o A100 (40/80 GB) para mayor comodidad. En GPUs de 16 GB (RTX 4080, RTX 3080 Ti) podría funcionar con contexto reducido.
- Compatibilidad con hardware de consumo: sí, cabe en GPUs de gama alta de consumo (24 GB) y en algunas de 16 GB con limitaciones de contexto.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (con soporte GGUF), TGI (con adaptadores). El formato GGUF es compatible con la mayoría de motores de inferencia locales.
- Latencia y throughput: no disponible. Depende del hardware y del motor utilizado; en una RTX 4090 se espera una velocidad de generación de 20-40 tokens/s para modelos de 27B en cuantización 3 bits, pero no hay datos confirmados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | BF16 | Apache 2.0 | Hugging Face |
| mtp-Qwen3.8-27B-THIREUS-IQ3_K | 27B | 262K | IQ3_K | MIT | Hugging Face |
| mtp-Qwen3.8-27B-THIREUS-BF16 | 27B | 262K | BF16 | MIT | Hugging Face |
| mtp-Qwen3.5-27B-THIREUS-Q5_K | 27B | no disponible | Q5_K | MIT | Hugging Face |

La comparativa se limita a variantes del mismo modelo base. No se dispone de información sobre modelos comparables de otros fabricantes en el contexto de esta búsqueda. La principal diferencia entre las variantes de Thireus es el tipo de cuantización: IQ3_K ofrece menor tamaño pero posiblemente mayor pérdida de calidad frente a BF16 o Q5_K.

## Limitaciones y advertencias

- Información limitada: la model card de esta cuantización no incluye detalles sobre el proceso de cuantización, dataset de calibración ni evaluación de perplejidad. Se recomienda probar el modelo en tareas específicas antes de usarlo en producción.
- Posible degradación de calidad: la cuantización IQ3_K (3 bits) puede introducir errores en tareas de razonamiento complejo o generación de código, comparado con el modelo en BF16. Es recomendable validar resultados críticos.
- Sesgos y alucinaciones: al ser un modelo derivado de Qwen, puede presentar sesgos presentes en los datos de entrenamiento y riesgo de alucinación, especialmente en contextos largos o con información ambigua.
- Requisitos de contexto: aunque la ventana nativa es de 262K tokens, en la práctica con cuantización IQ3_K y hardware de consumo, el contexto efectivo puede ser menor debido a limitaciones de memoria.
- Licencia: aunque la cuantización tiene licencia MIT, el modelo base es Apache 2.0. Se debe verificar que el uso cumpla con ambas licencias, especialmente si se redistribuye el modelo o se utilizan pesos del modelo base.
- Soporte de visión: la capacidad multimodal depende del codificador visual, que puede no estar optimizado en la cuantización GGUF; se recomienda probar con imágenes reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thireus/mtp-Qwen3.8-27B-THIREUS-IQ3_K-SPECIAL_SPLIT
- Variante BF16 del mismo autor: https://huggingface.co/Thireus/mtp-Qwen3.8-27B-THIREUS-BF16-SPECIAL_SPLIT
- Repositorio oficial de Qwen3.8-27B en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Artículo de Yottalabs sobre Qwen3.8-27B: https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Página de Qwen3.8 en LM Studio: https://lmstudio.ai/models/qwen3.8
