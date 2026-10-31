# unsloth/Mistral-Large-4-1T-A52B-GGUF

## Resumen

Mistral Large 4 (apodado "Le Chonk") es el modelo insignia de Mistral AI: un modelo multimodal nativo de tipo Mixture-of-Experts con aproximadamente 1 billón (1T) de parámetros totales y unos 52 mil millones de parámetros activos por token. Fue entrenado desde cero sobre 3.800 GPU NVIDIA Grace Blackwell en los propios centros de datos de Mistral en Europa. Este repositorio de Unsloth no contiene los pesos originales, sino cuantizaciones GGUF del modelo base `mistralai/Mistral-Large-4-1T-A52B` en formato Unsloth Dynamic 3.0, pensadas para ejecutar el modelo localmente con llama.cpp.

El problema que resuelve esta versión cuantizada es la accesibilidad: el modelo completo en precisión total ocupa alrededor de 1,1 TB, mientras que las cuantizaciones de Unsloth permiten ejecutarlo desde 233 GB (1 bit) hasta 1,1 TB (Q8), con soporte de decodificación especulativa (DSpark) y del proyector de visión (mmproj). Es relevante porque unifica instrucción, razonamiento, código y flujos agénticos en un solo conjunto de pesos abiertos, con rendimiento de frontera en ciberseguridad, finanzas, derecho y visual grounding.

Cuenta con una ventana de contexto de 1M de tokens, entrada multimodal (texto e imagen) y fluidez nativa en más de 160 idiomas, incluidas todas las lenguas oficiales de la Unión Europea. Se distribuye bajo la Mistral Ecosystem Open-Weight License, que permite uso comercial con ciertas restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (transformer) multimodal, 128 expertos enrutados (4 activos por token) + 1 experto compartido, codificador de visión estilo Pixtral |
| Parametros totales | 1.049.357.365.536 (~1,05T) |
| Parametros activos | ~49B por token (~52B incluyendo embeddings y capas de salida) |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | GGUF Unsloth Dynamic 3.0: desde 1 bit (233 GB) hasta Q8 (~1,1 TB); también disponible checkpoint NVFP4 oficial para GPUs Blackwell |
| Idiomas soportados | Más de 160 idiomas de forma nativa; el repositorio lista 40 etiquetas de idioma (en, fr, de, es, pt, it, ja, ko, ru, zh, ar, fa, id, ms, ne, pl, ro, sr, sv, tr, uk, vi, hi, bn, bg, hr, cs, da, nl, et, fi, el, hu, ga, lv, lt, mt, sk, sl) |
| Licencia | mistral-ecosystem-open-weight (MIT modificada) |
| Formato de pesos | GGUF (este repositorio); safetensors en el modelo base; NVFP4 en variante oficial cuantizada |

## Arquitectura y entrenamiento

Mistral Large 4 es un transformer densamente enrutado como Mixture-of-Experts granular: 128 expertos enrutados de los cuales solo 4 se activan por token, más 1 experto compartido, lo que da lugar a ~49B de parámetros activos por token frente a ~1T totales. Esto permite calidad de modelo de frontera con coste de inferencia comparable a modelos mucho más pequeños. Es multimodal nativo: incorpora un codificador de visión estilo Pixtral entrenado para manejar imágenes de tamaño y relación de aspecto variables, aceptando entrada de texto e imagen con salida de texto.

El modelo fue entrenado desde cero sobre 3.800 GPU NVIDIA Grace Blackwell en centros de datos propios de Mistral en Europa. No se han publicado detalles sobre el número de tokens de entrenamiento ni la composición exacta del dataset en la información disponible. Soporta modos instruct y reasoning con function calling nativo y esfuerzo de razonamiento configurable por petición (`low`, `medium`, `high`). En cuanto a innovaciones de inferencia, la versión de Unsloth incluye un draft de decodificación especulativa (DSpark) con longitud media de aceptación de ~2,5 tokens, que duplica aproximadamente la velocidad de decodificación a batch 1.

## Capacidades

- Generación de texto e instrucción con fuerte adherencia a system prompts.
- Razonamiento configurable en tres niveles de esfuerzo (`low`, `medium`, `high`; `high` por defecto) para alternar entre respuestas rápidas de chat y ejecuciones agénticas complejas.
- Generación de código y razonamiento general unificados en un solo conjunto de pesos.
- Matemáticas y razonamiento multi-paso en modo reasoning (no hay cifras publicadas en la información disponible).
- Visión: análisis de imágenes, gráficos, planos técnicos y documentos, con estado del arte en visual grounding entre modelos de pesos abiertos.
- Tool calling / function calling nativo, salida JSON y cumplimiento estricto de esquemas JSON.
- Flujos agénticos multi-paso en un solo modelo.
- Multilingüe nativo: más de 160 idiomas, incluidas todas las lenguas oficiales de la UE.
- Ciberseguridad: estado del arte entre modelos open-weight en tareas de seguridad, rechazando peticiones maliciosas.
- Ventana de contexto de 1M de tokens para documentos y sesiones muy largas.

## Casos de uso

- Atención al cliente automatizada: la ventana de contexto de 1M de tokens permite mantener conversaciones multi-turno con historiales extensos, manuales completos o bases de conocimiento indexadas en el propio prompt, manteniendo coherencia a lo largo de la sesión.
- Agentes con herramientas en producción: el function calling nativo con salida JSON y cumplimiento estricto de esquemas permite integrarlo en pipelines agénticos multi-paso (orquestación de APIs, navegación, ejecución de código) con bajo riesgo de malformación de las llamadas.
- Análisis documental multimodal: puede procesar documentos escaneados, gráficos financieros y planos técnicos gracias al codificador de visión, con visual grounding de estado del arte entre modelos abiertos, útil para extracción de datos y auditoría.
- Ciberseguridad defensiva: rendimiento de frontera entre modelos open-weight en tareas de seguridad (análisis de vulnerabilidades, triaje de incidentes), rechazando explícitamente peticiones maliciosas.
- Asistencia jurídica y financiera: Mistral destaca su rendimiento especialmente bueno en dominios de derecho y finanzas, adecuado para resumen de contratos, revisión de informes y consultas regulatorias.
- Aplicaciones multilingües en Europa: fluidez nativa en más de 160 idiomas, incluidas todas las lenguas oficiales de la UE, lo que lo hace adecuado para productos que deben servir a usuarios en múltiples idiomas sin modelos específicos por región.
- Chat de alto rendimiento local: gracias a la decodificación especulativa DSpark (~2x de velocidad a batch 1) y al esfuerzo de razonamiento `low`, puede servir respuestas rápidas de chat en despliegues on-premise.
- Procesamiento de contextos masivos: análisis de repositorios de código completos, corpus legales o conjuntos de logs de gran volumen aprovechando la ventana de 1M de tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card afirma cualitativamente que supera a modelos cerrados de frontera en visual grounding, que es estado del arte entre modelos open-weight en ciberseguridad, y que muestra rendimiento especialmente bueno en ciberseguridad, finanzas y derecho, sin aportar cifras concretas. Unsloth publica gráficas de KLD y precisión top-1 frente al tamaño de cuantización en su documentación de Unsloth Dynamic 3.0, pero sin valores numéricos en la información proporcionada.

## Requisitos de hardware

- VRAM / memoria estimada según cuantización (recomendaciones de Unsloth):
  - Cuantización de 1 bit (233 GB): dispositivo con 256 GB de RAM.
  - Cuantizaciones de 2 bits (302-378 GB): 384-512 GB de RAM o VRAM.
  - Cuantización Q8 (cerca de precisión completa, ~1,1 TB): 1,2 TB o más.
- GPU recomendadas: no disponible de forma explícita; para el checkpoint oficial NVFP4 se requieren GPUs NVIDIA Blackwell (p. ej. B200/GB200). El GGUF puede ejecutarse en CPU con mucha RAM o en configuraciones CPU+GPU con llama.cpp.
- Consumer GPUs: no es viable en GPUs de consumo estándar (RTX 4090 con 24 GB, etc.) en ninguna cuantización; la variante más pequeña requiere 256 GB de memoria.
- Opciones de despliegue: llama.cpp (se recomienda el build de Unsloth o la app Unsloth Desktop), vLLM, SGLang (para los pesos originales y el NVFP4), y la API de Mistral (`mistral-large-4`) como alternativa gestionada.
- Latencia y throughput: con decodificación especulativa DSpark (Q8_0 como draft, `--spec-draft-n-max 3`), la longitud media de aceptación es de ~2,5 tokens, lo que duplica aproximadamente la velocidad de decodificación a batch 1. No hay cifras absolutas de tokens/segundo publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mistral Large 4 (1T-A52B) | ~1T total / ~52B activos | 1M | Sí (texto + imagen) | Mistral Ecosystem Open-Weight (MIT modificada) | Pesos abiertos, GGUF, NVFP4 y API |
| DeepSeek-V3 | ~671B total / ~37B activos (MoE) | 128K | No (variante VL aparte) | Licencia propia tipo MIT (uso comercial permitido) | Pesos abiertos y API |
| Llama 3.1 405B | 405B densos | 128K | No | Llama Community License | Pesos abiertos y API |
| Qwen3-235B-A22B | ~235B total / ~22B activos (MoE) | 128K+ | No (variante VL aparte) | Apache 2.0 | Pesos abiertos y API |

Mistral Large 4 destaca frente a estas alternativas en ventana de contexto (1M frente a 128K), multimodalidad nativa y parámetros totales, aunque exige una infraestructura de memoria considerablemente mayor. En cuanto a benchmarks comparativos concretos, no hay datos numéricos disponibles en la información proporcionada.

## Limitaciones y advertencias

- Requisitos de memoria extremos: incluso la cuantización más agresiva (1 bit, 233 GB) requiere 256 GB de memoria, lo que lo deja fuera del alcance de hardware de consumo y de la mayoría de estaciones de trabajo individuales.
- Sesgos conocidos: no documentados en la información disponible; como todo LLM de gran escala, puede reflejar sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinación: inherente a modelos generativos de lenguaje; no hay cifras de tasa de alucinación publicadas en la información disponible.
- Idioma: el modelo es nativamente fluido en más de 160 idiomas, pero la model card solo etiqueta 40 idiomas en el repositorio; el rendimiento en idiomas concretos no está cuantificado.
- Licencia: la Mistral Ecosystem Open-Weight License permite uso comercial y no comercial, pero operar el modelo como negocio de Model-as-a-Service requiere una licencia comercial separada con Mistral.
- Razonamiento: el esfuerzo por defecto es `high`, lo que genera respuestas más largas y lentas; para chat rápido conviene ajustar `reasoning_effort` a `low`.
- Herramientas: Mistral recomienda limitar el número de herramientas al mínimo necesario y mantenerlas bien definidas para evitar degradación en flujos agénticos.
- Cuantización: las versiones GGUF de baja bits (1-2 bits) implican pérdida de calidad medible frente a la precisión completa; consulte las curvas KLD/top-1 de Unsloth antes de elegir cuantización para producción.
- Para el checkpoint NVFP4 se requiere hardware Blackwell específico, lo que limita su adopción inmediata.

## Enlaces

- Repositorio GGUF de Unsloth: https://huggingface.co/unsloth/Mistral-Large-4-1T-A52B-GGUF
- Modelo base (Mistral AI): https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B
- Checkpoint cuantizado NVFP4 oficial: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B-NVFP4
- Licencia: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B/blob/main/LICENSE
- Blog de anuncio de Mistral: https://mistral.ai/news/mistral-large-4-oss/
- Documentación de la API de Mistral: https://docs.mistral.ai/models/mistral-large-4-0
- Guía de Unsloth para ejecutar Mistral Large 4: https://unsloth.ai/docs/models/mistral-large-4
- Benchmarks de cuantización Unsloth Dynamic 3.0 GGUF: https://unsloth.ai/docs/basics/unsloth-dynamic-v3.0-gguf
- Unsloth Desktop: https://unsloth.ai/docs/desktop
- GitHub de Unsloth: https://github.com/unslothai/unsloth
- Unsloth (web): https://unsloth.ai/
