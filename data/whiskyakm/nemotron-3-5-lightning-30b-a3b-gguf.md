# WhiskyAKM/Nemotron-3.5-Lightning-30B-A3B-GGUF

## Resumen

NVIDIA-Nemotron-3.5-Lightning-30B-A3B es un modelo de lenguaje de gran tamaño (LLM) desarrollado por NVIDIA, presentado como parte de la familia Nemotron de modelos abiertos con pesos, datos de entrenamiento y recetas de entrenamiento publicados. El modelo emplea una arquitectura híbrida de mezcla de expertos (MoE) que combina capas intercaladas de Mamba-2, MoE y atención selectiva, con 30 000 millones de parámetros totales y 3 000 millones de parámetros activos por token, lo que lo hace especialmente eficiente para inferencia en entornos de producción. Su ventana de contexto alcanza hasta 1 millón de tokens, con 256 000 tokens como longitud nativa por defecto, y soporta seis idiomas naturales además de lenguajes de programación.

El modelo está diseñado para tareas de razonamiento complejo, codificación y agentes autónomos, con un modo de pensamiento configurable mediante la plantilla de chat. Se publica junto con técnicas de decodificación especulativa (DSpark, DFlash y MTP) para acelerar la generación de texto. Este repositorio en concreto contiene los pesos convertidos al formato GGUF para su uso con llama.cpp y herramientas compatibles. El modelo original en BF16 está disponible en Hugging Face y su licencia OpenMDW-1.1 permite el uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida: Mamba-2 + MoE + Attention (intercaladas) |
| Parametros totales | 32.913.266.240 (30B nominales según el fabricante) |
| Parametros activos | 3B |
| Longitud de contexto | Hasta 1M tokens (256K nativo por defecto) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q4_0, DFlash (draft) |
| Idiomas soportados | Inglés, español, francés, alemán, italiano, japonés (y lenguajes de programación) |
| Licencia | OpenMDW-1.1 (uso comercial permitido) |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de mezcla de expertos híbrida que combina capas de Mamba-2 (modelos de espacio de estados), capas MoE y capas de atención, intercaladas de forma específica. Esta combinación permite mantener una alta eficiencia en el uso de parámetros activos (solo 3B por token) mientras se conserva una capacidad de razonamiento comparable a modelos densos mucho mayores. La decodificación especulativa se implementa mediante modelos auxiliares (DSpark, DFlash) y predicción de múltiples tokens (MTP), lo que acelera la generación de texto.

El preentrenamiento se realizó con más de 20 billones de tokens, con un corte de datos en septiembre de 2025. El corpus de post-entrenamiento se compone de datos curados y sintetizados de alta calidad, con un corte de datos en mayo de 2026. No se especifica el uso de RLHF o DPO, pero la inclusión de datos de alineación y estilo QA sugiere que se aplicaron técnicas de ajuste fino supervisado y posiblemente alineación por preferencias. El modo de razonamiento se puede activar o desactivar mediante la plantilla de chat (`enable_thinking=True/False`).

## Capacidades

- Generación de texto en seis idiomas naturales y lenguajes de programación.
- Razonamiento de varios pasos con modo de pensamiento configurable (thinking mode).
- Codificación de software, incluyendo generación, revisión y depuración de código.
- Tareas de agentes y uso de herramientas, con soporte para entornos de terminal y navegación web (evidencia en benchmarks como Terminal-Bench y BrowseComp).
- Manejo de contextos muy largos (hasta 1M tokens), adecuado para documentos extensos y conversaciones de muchas vueltas.
- Decodificación especulativa integrada (DSpark, DFlash, MTP) para acelerar la inferencia.
- Compatibilidad con plataformas de inferencia estándar (llama.cpp, llama-server, Ollama, vLLM).

## Casos de uso

- Asistentes de programación en producción: el modelo puede generar y revisar código en múltiples lenguajes, con una ventana de contexto de hasta 1M tokens para analizar repositorios completos. Su modo de razonamiento permite explicar decisiones de diseño y proponer refactorizaciones.
- Agentes autónomos para automatización de tareas: gracias a su soporte de terminal y herramientas, puede ejecutar comandos, gestionar flujos de trabajo y resolver problemas de sistema operativo, como se valida en Terminal-Bench.
- Atención al cliente multilingüe: con soporte nativo en seis idiomas, puede mantener conversaciones coherentes y con contexto largo, adecuado para sistemas de soporte en empresas globales.
- Análisis y resumen de documentos extensos: su contexto de 1M tokens permite procesar informes técnicos, contratos o libros completos sin perder información, generando resúmenes o extrayendo datos relevantes.
- Investigación científica y razonamiento complejo: con resultados en GPQA Diamond (75.44) y MMLU Pro (81.94), es adecuado para tareas de razonamiento matemático, científico y lógico, como ayuda a la investigación.
- Desarrollo de agentes de navegación web: su rendimiento en BrowseComp (36.97) lo habilita para tareas de búsqueda y extracción de información en la web, útil para asistentes de investigación o scraping automatizado.
- Evaluación de código y pruebas automatizadas: puede generar casos de prueba, revisar cobertura y validar cambios en integración continua (CI/CD) mediante su integración con herramientas de terminal.

## Benchmarks y rendimiento

La model card del modelo base (BF16) proporciona los siguientes resultados de evaluación, comparados con la versión cuantizada NVFP4:

| Tarea | BF16 | NVFP4 |
|---|---|---|
| MMLU Pro | 81.94 | 81.62 |
| AA-Omniscience | 17.50 | 16.63 |
| GPQA Diamond (sin herramientas) | 75.44 | 75.57 |
| HLE (texto, sin herramientas) | 11.72 | 10.47 |
| SciCode | 32.60 | 31.38 |
| SWE-bench Verified | 51.56 | 52.80 |
| SWE-bench Multilingual | 39.33 | 36.47 |
| Terminal-Bench 2.1 | 24.58 | 23.46 |
| PinchBench | 85.37 | 83.43 |
| BrowseComp | 36.97 | 36.81 |
| τ³-bench (Banking) | 9.28 | 9.48 |
| GDPval-AA-V2 | 832 | 865 |
| IFBench (loose) | 71.88 | 72.88 |
| AA-LCR | 52.00 | 49.19 |

Estos datos corresponden al modelo base en BF16 y NVFP4, no a las cuantizaciones GGUF de este repositorio. No se han publicado resultados de benchmarks para las cuantizaciones GGUF.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización y parámetros totales reales):
  - Q4_K_M (4 bits): ~17-19 GB (32.9B × 4 bits ≈ 16.5 GB + overhead).
  - Q8_0 (8 bits): ~33 GB (32.9B × 8 bits ≈ 33 GB).
  - BF16 (16 bits): ~66 GB.
- GPUs recomendadas:
  - Q4_K_M: RTX 3090/4090 (24 GB), A100 40 GB, RTX A6000 (48 GB).
  - Q8_0: A100 40 GB, RTX 6000 Ada (48 GB), A100 80 GB.
  - BF16: A100 80 GB, H100 (80 GB).
- El modelo cabe en GPU de consumo (RTX 4090) con cuantización Q4, y en GPU de 16 GB (RTX 3080/4070) con cuantizaciones Q4_K_S o Q4_0.
- Opciones de despliegue: llama.cpp, llama-server (compatible OpenAI), Ollama (disponible en su biblioteca), vLLM (para el modelo base).
- Latencia y throughput: no se especifican en la información disponible, pero la decodificación especulativa con DFlash puede acelerar la generación entre 1.5 y 2× según el tamaño del lote.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia |
|---|---|---|---|---|
| Nemotron-3.5-Lightning-30B-A3B | 30B | 3B | 1M (256K nativo) | OpenMDW-1.1 |
| Mixtral 8x7B | 46.7B | 12.9B | 32K | Apache 2.0 |
| Qwen2.5-MoE-A2B | 15.6B | 2.8B | 128K | Apache 2.0 |
| DeepSeek-V2-Lite | 15.7B | 2.4B | 128K | MIT |

La comparativa se basa en parámetros y contexto; no hay resultados de benchmarks públicos comparables para estos modelos en la misma evaluación. Nemotron-3.5-Lightning ofrece un contexto significativamente mayor y una arquitectura híbrida que combina Mamba-2 y atención, mientras que los otros usan arquitecturas MoE tradicionales con atención densa.

## Limitaciones y advertencias

- La licencia OpenMDW-1.1 es una licencia de código abierto con condiciones específicas; aunque permite uso comercial, es recomendable revisar los términos exactos, especialmente en lo que respecta a la atribución y al uso de los datos de entrenamiento.
- El modelo puede presentar sesgos y alucinaciones inherentes a los modelos de lenguaje, especialmente en tareas de razonamiento complejo o con información de baja frecuencia. La evaluación en HLE (11.72) muestra que no es fiable para preguntas de alto nivel sin herramientas.
- La ventana de contexto de 1M tokens es teórica; el rendimiento real en contextos muy largos puede degradarse y el coste de memoria aumenta linealmente con la longitud.
- No se proporcionan datos de rendimiento de las cuantizaciones GGUF; los benchmarks corresponden al modelo base BF16/NVFP4, por lo que las cuantizaciones Q4/Q8 pueden presentar ligeras variaciones.
- La decodificación especulativa con DFlash requiere de un modelo draft que se incluye en el repositorio, pero su eficacia depende del hardware y de la configuración.
- El modelo está optimizado para su uso con llama.cpp; el soporte en otras herramientas como vLLM puede requerir adaptaciones adicionales.

## Enlaces

- Repositorio GGUF (este): https://huggingface.co/WhiskyAKM/Nemotron-3.5-Lightning-30B-A3B-GGUF
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Modelo NVFP4: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Página de Ollama: https://ollama.com/library/nemotron-3.5-lightning
- Modelo GGUF de ggml-org: https://huggingface.co/ggml-org/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
