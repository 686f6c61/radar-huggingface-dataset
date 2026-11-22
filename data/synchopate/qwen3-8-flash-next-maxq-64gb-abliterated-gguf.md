# Synchopate/Qwen3.8-Flash-Next-MaxQ-64GB-Abliterated-GGUF

## Resumen

Qwen3.8-Flash-Next-MaxQ-64GB-Abliterated-GGUF es una cuantización GGUF de la arquitectura Qwen3.8-Flash-Next, publicada por el usuario Synchopate. Se distribuye como un checkpoint "abliterated" (sin los filtros de rechazo del modelo original) y está empaquetada en dos shards que suman 53,99 GiB, pensados para caber en máquinas con 64 GB de RAM y ejecutarse en CPU mediante llama.cpp. El modelo base es un transformer MoE con 48 capas troncales (36 de Gated DeltaNet y 12 de atención GQA completa), 512 expertos enrutados por capa con top-10 activos, una capa NextN MTP para decodificación especulativa y una tabla PLE de 320M filas.

La relevancia de esta ficha radica en que combina tres elementos poco habituales: una arquitectura híbrida SSM/atención con MoE de gran anchura, una cuantización agresiva mixta (desde F32 hasta Q1_0) que reduce un modelo de ~176,5B parámetros a menos de 54 GiB, y una modificación quirúrgica de 27 tensores para eliminar los mecanismos de rechazo. El resultado es un checkpoint orientado a investigación de seguridad, red-teaming y análisis de código sin restricciones, no a despliegues de producción generalistas.

El autor advierte explícitamente de que los filtros de seguridad del modelo original han sido eliminados y no deben usarse para moderación de contenido. Para ingeniería de software convencional recomienda la variante alineada del mismo repositorio. La licencia declarada es qwen-community-1.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE: 36 capas Gated DeltaNet + 12 capas GQA full attention, con capa NextN MTP (blk.48) |
| Parámetros totales | ~176,5B (125,3B transformer + MoE 512 expertos + NextN MTP + 51,2B PLE) |
| Parámetros activos | ~5,0B por token (10 de 512 expertos enrutados + 1 experto compartido + tronco denso GDN/GQA) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Mixta: F32 (351), Q8_0 (339), Q6_K (198), IQ2_S (60), BF16 (49), Q2_0 (39), IQ3_XXS (36), MXFP4 (7), IQ4_NL (4), Q2_K (2), Q1_0 (1) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (declarada como "other") |
| Formato de pesos | GGUF (2 shards + proyector multimodal BF16 opcional) |

## Arquitectura y entrenamiento

El backbone sigue la topología `qwen4exp` del modelo base: 48 capas troncales con una proporción de 36 capas de Gated DeltaNet (atención lineal con estado recurrente) y 12 capas de atención GQA completa con `compress_ratio = 4`, más una capa adicional NextN MTP en `blk.48` que actúa como cabecera de decodificación especulativa. El MoE mantiene los 512 expertos enrutados por capa sin podar (top-10 activos, K = 640 de ancho completo) más un experto compartido, y una tabla PLE (`per_layer_token_embd.weight`) de 320.001.536 filas con dimensión 256. La capa NextN permite que el modelo genere borradores de tokens que luego se validan en paralelo, reduciendo la latencia de decodificación en CPU.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni las etapas de alineación (RLHF/DPO) del modelo original en la información proporcionada. La modificación "abliterated" se aplica mediante sobre-proyección firmada multi-capa optimizada con TPE sobre 27 tensores: 16 tensores `ssm_out`/`attn_output` en `blk.32..47` con `beta = 2.15..2.39`, 5 `ffn_down_shexp` en `blk.31..35`, 5 `ffn_down_exps` de 512 expertos en `blk.31..35` y 1 proyección `blk.48.attn_output.weight` con `beta = 2.2508`. Los 1.058 tensores restantes (blk.0..30, `ffn_gate_exps`, `ffn_up_exps`, `token_embd`, `output.weight`, routers y normas) se preservan bit a bit respecto a la variante alineada. La cuantización usa exclusivamente tipos estándar de `ggml` (`max_type = 42`, sin tipos personalizados) y la tabla PLE se comprime con PCA-Wiener D=256 + RaBitQ Q1_0 a 10,73 GiB.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte de plantilla de chat (`conversational`).
- Razonamiento y análisis de código sin restricciones de contenido, orientado a auditoría y análisis de binarios.
- Capacidades multimodales de imagen a texto mediante el proyector `mmproj-Qwen3.8-Flash-Next-BF16.gguf` (334 tensores, 0,85 GiB).
- Decodificación especulativa nativa gracias a la capa NextN MTP, que acelera la generación en CPU.
- Ejecución en CPU pura mediante llama.cpp, sin necesidad de GPU.
- Modo "uncensored": los filtros de rechazo del modelo original han sido eliminados quirúrgicamente.
- Soporte de tool calling y function calling: no confirmado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmado en la información disponible.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Investigación de seguridad y red-teaming: el checkpoint permite generar y evaluar respuestas que el modelo alineado rechazaría, útil para construir conjuntos de prueba de robustez y estudiar modos de fallo en modelos abliterated.
- Análisis de binarios y explotación en CTF: el modelo puede razonar sobre código ensamblador, identificar patrones vulnerables y proponer cadenas de explotación sin bloqueos de contenido, dentro de entornos autorizados.
- Auditoría de código y revisión de seguridad: con ~5B parámetros activos por token y contexto largo (no especificado), puede procesar fragmentos extensos de código para detectar inyecciones, desbordamientos o malas prácticas.
- Análisis legal y de políticas sin restricciones: útil para estudiar textos normativos controvertidos o generar contraargumentos en escenarios de debate, donde el modelo alineado tendería a rechazar.
- Despliegue en CPU para entornos aislados: al caber en 64 GB de RAM y funcionar con llama.cpp, puede ejecutarse en estaciones de trabajo sin GPU o en entornos air-gapped para pruebas internas.
- Generación de datos sintéticos para entrenamiento: la variante sin filtros permite producir corpus diversos que incluyan contenido que los modelos alineados evitan, útil para aumentar la cobertura de datasets de instrucción.
- Evaluación comparativa de alineación: sirve como referencia para medir cuánto cambia el comportamiento de un modelo tras la abliteración, comparando contra la variante `MaxQ-64GB` alineada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas internas del proceso de abliteración: `0/100` rechazos con una divergencia KL de `0,0818` respecto al modelo alineado, y `beta = 1,83–2,39` en los tensores modificados.

## Requisitos de hardware

- VRAM/RAM estimada: 53,99 GiB para los dos shards del LLM, más 0,85 GiB adicionales si se carga el proyector multimodal. El autor indica un techo de `< 55,5 GiB`, diseñado para máquinas de 64 GB de RAM.
- GPU recomendadas: no aplica de forma nativa; el checkpoint está optimizado para CPU. Para inferencia en GPU haría falta offloading parcial o una GPU con al menos 48 GB (A6000, A100 80GB, H100) para cargar los shards completos.
- ¿Cabe en GPU de consumo? No en su totalidad. Una RTX 4090 (24 GB) solo podría cargar una fracción mediante offloading parcial con llama.cpp.
- Opciones de despliegue: llama.cpp (soporte nativo, con `llama-modchip` mencionado en los tags), Ollama si se convierte el manifiesto, y servidores compatibles con endpoints (`endpoints_compatible`). vLLM y TGI no soportan GGUF de forma directa sin conversión.
- Latencia y throughput: no disponibles. La capa NextN MTP está pensada para reducir la latencia de decodificación especulativa en CPU, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-MaxQ-64GB-Abliterated (este) | ~176,5B | ~5,0B | no disponible | qwen-community-1.0 | GGUF mixto | Sin filtros de rechazo, 53,99 GiB, CPU-first |
| Synchopate/Qwen3.8-Flash-Next-MaxQ-64GB-GGUF | ~176,5B | ~5,0B | no disponible | qwen-community-1.0 | GGUF mixto | Variante alineada del mismo autor, sin abliterar |
| Qwen/Qwen3.8-Flash-Next (base) | ~176,5B | ~5,0B | no disponible | qwen-community-1.0 | safetensors | Modelo original completo, requiere hardware de datacenter |
| trohrbaugh/Qwen3.8-Flash-Next-heretic-2 | ~176,5B | ~5,0B | no disponible | no disponible | no disponible | Fuente de los 26 tensores TPE sobre-proyectados |

## Limitaciones y advertencias

- Los filtros de seguridad del modelo original han sido eliminados; no deben usarse para moderación de contenido ni para exponer endpoints públicos sin control de acceso y filtrado externo.
- Riesgo elevado de generar contenido dañino, ilegal o sesgado sin las salvaguardas del modelo alineado. El autor restringe el uso a investigación de seguridad autorizada, CTF, auditoría y análisis legal.
- La cuantización extrema (Q1_0, Q2_0, IQ2_S en partes del modelo) degrada la calidad respecto al modelo en BF16; la tabla PLE en Q1_0 puede introducir pérdida adicional en la representación de tokens.
- La ficha del Hub muestra una etiqueta `general.size_label = "5.0B"` heredada del proceso de conversión que no refleja el tamaño real (~176,5B totales, ~5,0B activos); puede confundir a herramientas automáticas.
- No se dispone de información sobre idiomas soportados ni longitud de contexto, lo que dificulta planificar despliegues multilingües o de contexto largo.
- Licencia qwen-community-1.0: revisar las restricciones de uso comercial del modelo base antes de cualquier explotación, ya que la abliteración no altera los términos legales.
- El proceso de abliteración modifica 27 tensores del tronco y la capa MTP; aunque se preservan bit a bit los demás, no hay garantía de que el comportamiento en tareas benignas sea idéntico al de la variante alineada.
- Sin datos de benchmarks públicos, no es posible comparar su rendimiento real frente a alternativas en MMLU, HumanEval o GSM8K.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Synchopate/Qwen3.8-Flash-Next-MaxQ-64GB-Abliterated-GGUF
- Variante alineada del mismo autor: https://huggingface.co/Synchopate/Qwen3.8-Flash-Next-MaxQ-64GB-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Fuente de los tensores abliterated: https://huggingface.co/trohrbaugh/Qwen3.8-Flash-Next-heretic-2
