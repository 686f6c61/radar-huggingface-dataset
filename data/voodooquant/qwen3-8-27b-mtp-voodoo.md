# voodooquant/Qwen3.8-27B-MTP-Voodoo

## Resumen

El repositorio `voodooquant/Qwen3.8-27B-MTP-Voodoo` contiene una cuantización GGUF del modelo Qwen3.8-27B, realizada por Voodoo Quant. Este modelo base, desarrollado por Qwen, es un modelo de lenguaje multimodal (visión y lenguaje) de 27 000 millones de parámetros, con arquitectura híbrida que combina atención lineal (Gated DeltaNet) y atención completa (Gated Attention), entrenado con predicción multi-token (MTP). Su contexto nativo es de 262 144 tokens, extensible hasta 1 000 000.

La cuantización Voodoo Quant selecciona niveles de cuantización por tensor según su importancia, con el objetivo de reducir el tamaño del modelo manteniendo la calidad. El archivo resultante ocupa aproximadamente 14 GB, lo que permite ejecutar un modelo de 27B en hardware de consumo. La licencia Apache 2.0 facilita su uso comercial y su integración en pipelines de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet (atención lineal) + Gated Attention (atención completa) con vision encoder |
| Parametros totales | 27 320 697 856 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativo, extensible a 1 000 000 |
| Tipos de cuantizacion | GGUF (Voodoo Quant, nivel Voodoo50 según tabla de rendimiento) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B presenta una arquitectura de 64 capas con una disposición interna de 16 bloques, cada uno compuesto por 3 sub-bloques de Gated DeltaNet seguidos de FFN, y 1 sub-bloque de Gated Attention seguido de FFN. La dimensión oculta es de 5120, con 48 cabezas de atención lineal para V y 16 para QK (dimensión de cabeza 128), y 24 cabezas de atención completa para Q y 4 para KV (dimensión de cabeza 256). Incluye un vision encoder para procesamiento de imágenes y vídeos. El entrenamiento comprende fases de pre-entrenamiento y post-entrenamiento, e incorpora MTP (Multi-Token Prediction) para predecir múltiples tokens futuros simultáneamente, lo que acelera la inferencia.

La cuantización Voodoo Quant no modifica los pesos originales; selecciona niveles de cuantización por tensor basándose en su importancia relativa, generando archivos GGUF compatibles con llama.cpp sin cambios en la arquitectura. Según la model card, estos quants se crearon con un catálogo reducido de candidatos (4-5 por tensor) con fines demostrativos.

## Capacidades

- Generación de texto, razonamiento complejo, codificación y tareas profesionales.
- Comprensión multimodal nativa: imágenes y vídeos, incluyendo diagramas STEM, documentos y vídeos de larga duración.
- Modo de pensamiento (thinking mode) activado por defecto, desactivable por petición, con control de profundidad mediante `reasoning_effort` y retención de contexto de razonamiento histórico mediante `preserve_thinking`.
- Soporte para tareas agénticas de largo horizonte: planificación autónoma y manejo de feedback del entorno.
- Contexto largo nativo de 262 144 tokens, extensible a 1 000 000, adecuado para documentos extensos y conversaciones multi-turno.
- Predicción multi-token (MTP) que mejora la velocidad de generación.
- Compatible con herramientas de desarrollo populares (vLLM, SGLang, TokenSpeed, llama.cpp, etc.).

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 262K tokens) y modo de pensamiento para razonar respuestas complejas, manteniendo el historial completo de la interacción.
- Análisis de documentos técnicos y científicos: su capacidad de visión permite extraer información de diagramas, tablas y figuras en PDFs o imágenes, con razonamiento profundo para interpretar resultados.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar código, aprovechando su contexto largo para mantener el estado del proyecto.
- Agentes autónomos de investigación: con planificación multi-paso y manejo de feedback del entorno, puede ejecutar tareas de búsqueda, recopilación y síntesis de información de forma autónoma.
- Asistentes de vídeo: al comprender vídeos, puede resumir contenido, extraer eventos clave o responder preguntas sobre secuencias visuales, útil para vigilancia, educación o análisis de medios.
- Despliegue en hardware de consumo: gracias a la cuantización de 14 GB, el modelo puede ejecutarse en GPUs con 16 GB de VRAM (p. ej., RTX 4080/4090) mediante llama.cpp u Ollama, permitiendo prototipado y pruebas locales sin infraestructura dedicada.

## Benchmarks y rendimiento

La model card del autor de la cuantización proporciona métricas de perplexity (PPL) y divergencia KLD para el quant Voodoo50 comparado con una referencia BF16 y con el quant Unsloth UD-IQ4_XS:

| Modelo | Tamaño | PPL (plain) | PPL(Q) (KLD-mode) | KLD vs Q8_0 ref |
|---|---|---|---|---|
| Voodoo50 | 14.0 GB | 2.4488 | 7.2606 | 0.0869 |
| Unsloth UD-IQ4_XS | 14.25 GB | 2.3248 | 6.7976 | 0.0164 |
| BF16 reference | 54.7 GB | 2.2889 | 6.7730 | 0 |

No se han publicado resultados de benchmarks del modelo base (MMLU, HumanEval, GSM8K, etc.) en la información proporcionada; la tabla de benchmarks de la model card original está incompleta en el texto extraído.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF de 14.0 GB (Voodoo50) requiere al menos 16 GB de VRAM para inferencia con contexto estándar. Para contexto de 262K tokens o 1M, se necesitaría memoria adicional (posiblemente 24 GB o más).
- GPU recomendadas: RTX 4080/4090 (16-24 GB), A100 (40-80 GB) para contexto largo, o GPUs de datacenter con mayor memoria.
- En consumer GPU: sí, cabe en GPUs con 16 GB o más (RTX 4080, 4090, etc.). Con cuantizaciones más agresivas (p. ej., 4-bit) podría caber en 12 GB, pero no se proporcionan datos específicos.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con adaptación), SGLang, TokenSpeed, y cualquier framework compatible con GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos suficientes para comparar Qwen3.8-27B con otros modelos de 27B (p. ej., Llama-3-27B o Mistral-27B) en términos de rendimiento. La comparativa disponible se limita a la calidad de la cuantización frente a otras cuantizaciones del mismo modelo base:

| Cuantización | Tamaño | KLD vs Q8_0 ref | Notas |
|---|---|---|---|
| Voodoo50 | 14.0 GB | 0.0869 | Mayor divergencia que Unsloth |
| Unsloth UD-IQ4_XS | 14.25 GB | 0.0164 | Menor divergencia, tamaño ligeramente mayor |
| BF16 reference | 54.7 GB | 0 | Referencia sin cuantizar |

## Limitaciones y advertencias

- La cuantización Voodoo50 presenta una divergencia KLD mayor (0.0869) que la cuantización Unsloth (0.0164) respecto a la referencia BF16, lo que sugiere una posible mayor pérdida de calidad en tareas sensibles a la precisión.
- El modelo base puede presentar sesgos y alucinaciones inherentes a los LLM; no se han documentado sesgos específicos en la información proporcionada.
- El contexto de 1M tokens requiere una cantidad significativa de memoria y puede no ser viable en hardware de consumo.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base en el repositorio oficial de Qwen.
- Los quants Voodoo se crearon con un catálogo reducido de candidatos (4-5 por tensor) con fines demostrativos; la calidad puede variar en versiones completas.
- No se especifican los idiomas soportados; se asume que el modelo base soporta múltiples idiomas, pero no hay confirmación en la documentación proporcionada.

## Enlaces

- Repositorio HuggingFace del quant: https://huggingface.co/voodooquant/Qwen3.8-27B-MTP-Voodoo
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Sitio web de Voodoo Quant: https://voodooquant.com
- Qwen Cloud (servicio gestionado): https://www.qwencloud.com
