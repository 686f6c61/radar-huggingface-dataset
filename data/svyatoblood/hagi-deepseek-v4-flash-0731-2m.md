# Svyatoblood/HAGI-DeepSeek-V4-Flash-0731-2M

## Resumen

HAGI-DeepSeek-V4-Flash-0731-2M es una versión comprimida con pérdida (lossy-compressed) del modelo MoE `deepseek-ai/DeepSeek-V4-Flash-0731`, desarrollada por Svyatoblood. El modelo base cuenta con 256 expertos enrutados por capa y 43 capas, y esta derivada reemplaza cada experto FFN por un bloque compacto formado por una proyección POD (Proper Orthogonal Decomposition), un kernel SwiGLU ternario y una base de salida cuantizada a int4 mediante QAT. El resultado es una reducción aproximada de 3 veces en el tamaño del MoE, con un residual mediano por experto de 0,012 %.

La principal innovación es la extensión del contexto a 2 millones de tokens sin incrementar el factor YaRN (se mantiene en 8, dentro del rango entrenado de factor 16). Para ello, la caché KV se almacena en un subespacio POD de 256 dimensiones con un rango piramidal dependiente de la distancia: los tokens cercanos (ventana de 4096) se leen a rango completo, mientras que los más antiguos usan rangos reducidos, lo que permite mantener un presupuesto de memoria de aproximadamente 5,7 GB de caché KV a 2M tokens en bf16. El modelo está pensado para tareas de generación de texto en inglés y chino, y su despliegue requiere el pipeline custom del repositorio HAGI_v2, ya que no es un checkpoint estándar ni un GGUF.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (256 expertos enrutados/capa × 43 capas) con FFN comprimido: POD + SwiGLU ternario + int4-QAT |
| Parametros totales | no disponible (tamaño total de archivos ~31 GB) |
| Parametros activos | no disponible (MoE sin especificar) |
| Longitud de contexto | 2 000 000 tokens (extendido, factor YaRN 8) |
| Tipos de cuantizacion | Ternario (5 trits/byte) e int4 (2 nibbles/byte) para expertos; skeleton en fp32/bf16 |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | deepseek (ver enlace a LICENSE del modelo base) |
| Formato de pesos | safetensors (skeleton) + archivos `.pt` (expertos reducidos y bases POD); no es GGUF |

## Arquitectura y entrenamiento

La compresión se basa en el principio de reducir los expertos FFN sobre activaciones reales, no sobre pesos, ya que los pesos de los expertos enrutados se comportan como ruido blanco y no admiten reducción de rango. Cada experto se sustituye por: (1) una proyección POD `P [4096, 512]` obtenida mediante SVD de las activaciones de entrada de la capa, que proyecta la entrada a un subespacio de 512 dimensiones; (2) un kernel SwiGLU ternario con matrices `W1, W3, W2 ∈ {−1, 0, 1}` empaquetadas a 5 trits por byte y dimensión intermedia 1024, entrenado con estimador de paso recto (straight-through) y optimizador Muon (zeropower) en bf16; y (3) una base de salida `Q [4096, 512]` entrenada con QAT a int4 (2 nibbles por byte, escala = max/28, niveles −7..7) contra el objetivo completo de 4096 dimensiones. El residual mediano por experto es de 0,012 % sobre la pérdida total de 4096 dimensiones, con parada temprana al 0,02 %.

Para la atención, la caché KV se almacena en un subespacio POD de 256 dimensiones (`P_kv [512, 256]` + `mean_kv [512]` por capa), lo que reduce a la mitad la memoria KV. El rango piramidal asigna rango completo (256) a los tokens dentro de una ventana de 4096, y para tokens más antiguos usa `r(d) = clamp(256 >> floor(log2(d/4096+1)), 16, 256)`, de modo que el coste de tokens lejanos disminuye y la ventana efectiva crece hasta 2M tokens con el mismo presupuesto de memoria. No se menciona entrenamiento con RLHF o DPO; el proceso es exclusivamente de compresión y cuantización sobre el modelo base.

## Capacidades

- Generación de texto en inglés y chino (pipeline `text-generation`).
- Contexto de hasta 2 millones de tokens gracias a la combinación de KV-POD y rango piramidal.
- Inferencia con caché KV comprimida en subespacio POD (256 dimensiones), reduciendo el uso de memoria frente al modelo original.
- Soporte de cuantización ternaria e int4 en los expertos, lo que reduce el tamaño del MoE en ~3×.
- No se declaran capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- Análisis de documentos extensos: procesar corpus de texto de millones de tokens (contratos, expedientes, investigaciones) en una sola pasada gracias a la ventana de 2M, aunque aceptando cierta degradación de calidad frente al modelo base.
- Compresión de modelos MoE para despliegue en entornos con recursos limitados: el tamaño total de ~31 GB permite alojar el modelo en una GPU de 48 GB o menos, frente a los requisitos del original, a costa de una pérdida controlada de fidelidad.
- Investigación en compresión de modelos: el repositorio HAGI_v2 ofrece un pipeline reproducible para estudiar técnicas de POD, ternarización y QAT sobre arquitecturas MoE.
- Generación de texto bilingüe (en/zh) con contexto largo: aplicaciones de traducción o resumen de documentos largos donde el contexto completo es crítico y la degradación residual es aceptable.
- Prototipado de sistemas de recuperación aumentada (RAG) con ventanas muy amplias: al mantener 2M tokens de contexto, se pueden indexar bases de conocimiento completas sin fragmentación.
- Evaluación de técnicas de cuantización extrema en producción: el modelo sirve como banco de pruebas para medir el impacto de representaciones ternarias e int4 en tareas de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño total de pesos: ~31 GB (skeleton 16,69 GB + expertos ~14,5 GB + bases POD ~22 MB). Para inferencia en bf16/fp32 se estima un mínimo de 40 GB de VRAM, aunque la cuantización ternaria e int4 de los expertos reduce la carga efectiva.
- GPU recomendadas: no disponible en la documentación; por el tamaño, sería viable en una A100 80GB, H100 80GB o similar, y posiblemente en GPUs consumer de 24 GB con cuantización adicional si se aplica un esquema de offloading.
- No se indican opciones de despliegue estándar (vLLM, llama.cpp, Ollama, TGI). El modelo requiere el pipeline custom del repositorio HAGI_v2 (`scripts/dsv4_generate_reduced.py`) o el uso de los safetensors incluidos (`dsv4_reduced.safetensors`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados. Como referencia cualitativa, este modelo es una versión comprimida de `deepseek-ai/DeepSeek-V4-Flash-0731`, del que hereda la arquitectura MoE (256 expertos/capa × 43 capas) pero con una reducción de tamaño de ~3× en el MoE y una extensión de contexto de 2M tokens frente al contexto original del base (no especificado). La comparación cuantitativa con otros modelos de contexto largo (p. ej., Llama 3.1 405B, Qwen2.5-7B-Instruct-1M) no es posible con la información disponible.

## Limitaciones y advertencias

- Compresión con pérdida: el residual mediano por experto es 0,012 %, pero los expertos "difíciles" pueden presentar errores mayores, degradando la calidad de generación respecto al modelo base.
- No es un checkpoint estándar: requiere el pipeline custom HAGI_v2 para cargar los expertos reducidos y las bases POD; no es compatible con cargadores convencionales ni con formatos GGUF.
- La caché KV usa una representación POD con rango piramidal, lo que introduce una pérdida adicional en tokens antiguos (rangos reducidos) que puede afectar a tareas que dependen de información lejana.
- Idiomas limitados a inglés y chino; no se garantiza rendimiento en otros idiomas.
- Licencia `deepseek`: debe revisarse el texto completo del LICENSE del modelo base para confirmar restricciones de uso comercial y redistribución.
- Sin soporte declarado para tool calling, agentes o capacidades multimodales; solo generación de texto.
- No hay benchmarks publicados, por lo que no se puede evaluar el rendimiento frente a alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Svyatoblood/HAGI-DeepSeek-V4-Flash-0731-2M
- Repositorio del pipeline (HAGI_v2): https://github.com/ShmidtS/HAGI_v2
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Licencia del modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731/blob/main/LICENSE
