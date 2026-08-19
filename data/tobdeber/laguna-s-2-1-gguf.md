# TobDeBer/Laguna-S-2.1-GGUF

## Resumen

Laguna S 2.1 es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por poolside, diseñado específicamente para tareas de codificación agéntica y trabajo de horizonte largo. Con 118 mil millones de parámetros totales y solo 8 mil millones activos por token, combina un enrutador token-choice con gating softplus sobre 256 expertos enrutados más un experto compartido, atención grouped-query y una ventana de contexto de 1.048.576 tokens. El modelo destaca por su soporte nativo de razonamiento intercalado entre llamadas a herramientas, decodificación especulativa con un modelo borrador DFlash y una licencia OpenMDW-1.1 que permite uso comercial y no comercial.

Este repositorio concreto, TobDeBer/Laguna-S-2.1-GGUF, contiene una cuantización GGUF de alta compresión (IQ3_XXS_Q1exps, ~19 GB) basada en los quants dinámicos 2.0 de unsloth con calibración imatrix. El autor lo presenta como un experimento para evaluar si un modelo de 118B comprimido agresivamente puede superar a modelos más ajustados al nivel de 24 GB de VRAM. Es importante señalar que esta cuantización degrada significativamente las capacidades del modelo original, como advierte el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con 256 expertos enrutados (top-10) + 1 experto compartido, atención grouped-query (8 cabezas KV, head dim 128), atención global y de ventana deslizante (512 tokens) intercaladas, gating softplus |
| Parametros totales | 118B (MoE) |
| Parametros activos | 8B por token |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | IQ3_XXS_Q1exps (UD, imatrix) y otras variantes del repo (no listadas) |
| Idiomas soportados | no disponible (el modelo base es multilingüe según benchmarks, pero no se especifica lista) |
| Licencia | openmdw-1.1 (permite uso comercial y no comercial) |
| Formato de pesos | GGUF (safetensors no disponible en este repo) |

## Arquitectura y entrenamiento

Laguna S 2.1 sigue la receta de la familia Laguna: un enrutador token-choice con gating softplus sobre 256 expertos enrutados (selecciona los 10 mejores) más un experto compartido. La arquitectura tiene 48 capas, de las cuales 12 son de atención global y 36 de atención con ventana deslizante de 512 tokens, con escalas rotatorias específicas por tipo de capa. La atención grouped-query usa 8 cabezas KV con dimensión de cabeza 128. El vocabulario es de 100.352 tokens, propio de la familia Laguna.

El modelo fue entrenado por poolside con un enfoque en tareas de codificación agéntica y razonamiento de largo alcance. No se detallan los datos de entrenamiento (número de tokens, composición del dataset) en la información disponible. El modelo soporta razonamiento intercalado entre llamadas a herramientas, controlable mediante el parámetro `enable_thinking`, y se ofrece un modelo borrador DFlash para decodificación especulativa. Este repositorio concreto es un "hard requant" de un GGUF de unsloth, no un entrenamiento original; la cuantización se realizó con calibración imatrix y el formato Dynamic 2.0 de unsloth.

## Capacidades

- Generación de texto y razonamiento de múltiples pasos, con modo de pensamiento intercalado entre llamadas a herramientas.
- Codificación agéntica: puede planificar, escribir y depurar código en repositorios grandes, con soporte de tool calling y ejecución de comandos.
- Contexto largo de 1M tokens, adecuado para analizar codebases completas o documentos extensos.
- Soporte de decodificación especulativa con el modelo borrador DFlash para reducir latencia en servidores compatibles.
- Multilingüe (según benchmarks SWE-bench Multilingual), aunque no se especifica la lista de idiomas.
- Compatible con llama.cpp (llama-server, llama-cli) y con frameworks de inferencia que soporten GGUF.

## Casos de uso

- Agente de codificación autónomo: el modelo puede recibir un issue de GitHub, razonar sobre el código existente, generar un parche y ejecutar pruebas, gracias a su soporte de tool calling y razonamiento intercalado. Su contexto de 1M permite cargar el repositorio completo.
- Revisión de código en CI/CD: integrado en un pipeline, puede analizar diffs, detectar errores comunes y sugerir correcciones, usando su capacidad de razonamiento de largo alcance.
- Asistente de programación en IDE: con una ventana de 1M tokens, puede mantener el contexto de todo el proyecto abierto y responder preguntas sobre arquitectura, dependencias o refactorizaciones.
- Análisis de documentación técnica extensa: puede resumir o extraer información de manuales, especificaciones o papers de cientos de páginas sin perder el hilo.
- Generación de código con especificaciones complejas: dado un prompt detallado, puede producir implementaciones completas en múltiples archivos, aprovechando su entrenamiento en tareas de codificación.
- Experimentación en hardware de consumo: al ser una cuantización de ~19 GB, permite probar un modelo de 118B en GPUs de 24 GB (RTX 3090/4090) para evaluar si la compresión agresiva mantiene utilidad práctica en tareas de codificación.

## Benchmarks y rendimiento

Los siguientes resultados corresponden al modelo original Laguna S 2.1 (sin cuantizar), publicados por poolside. La cuantización IQ3_XXS_Q1exps de este repositorio degrada significativamente el rendimiento, por lo que estos números no son representativos de esta versión.

| Modelo | Terminal-Bench 2.1 | SWE-bench Multilingual | SWE-Bench Pro (Public) | DeepSWE | SWE Atlas (Codebase QnA) | Toolathlon Verified |
|---|---|---|---|---|---|---|
| **Laguna S 2.1 (original)** | **70.2%** | **78.5%** | **59.4%** | **40.4%** | **46.2%** | **49.7%** |
| Tencent Hy3 | 71.7% | 75.8% | 57.9% | - | - | - |
| Inkling | 63.8% | - | 54.3% | - | - | 45.5%* |
| Nemotron 3 Ultra | 56.4% | 67.7% | - | - | - | 34.3%* |
| DeepSeek-V4-Pro Max | 64.0%* | 76.2% | 55.4% | 9.0%* | 27.2%* | 55.9%* |
| Kimi K3 | 88.3% | - | - | 69% | - | - |
| Qwen 3.7 Max | 74.5%* | 78.3% | 60.6% | - | - | - |
| Muse Spark 1.1 | 80% | - | 61.5% | 53.3% | 42.2%* | 75.6% |
| Claude Fable 5 | 88% | - | 80.3% | 70% | - | - |

Nota: los asteriscos indican resultados reportados por terceros. No se han publicado benchmarks específicos para la cuantización de este repositorio.

## Requisitos de hardware

- El archivo GGUF principal (`Laguna-S-2.1-UD-IQ3_XXS_Q1exps.gguf`) pesa aproximadamente 19 GB, por lo que cabe en GPUs de consumo con 24 GB de VRAM (RTX 3090, RTX 4090) con offload completo (`-ngl 99`).
- En GPUs con menos VRAM (16 GB) se puede reducir el número de capas descargadas a GPU (`-ngl` menor) o ejecutar parcialmente en CPU, aunque con mayor latencia.
- Se recomienda usar llama.cpp compilado a partir del 2026-07-23 o posterior, ya que el formato de cuantización requiere soporte reciente.
- Para servir el modelo, se puede usar `llama-server` con el comando indicado en la model card, o `llama-cli` para generación puntual.
- La decodificación especulativa con DFlash requiere descargar el modelo borrador adicional y usar los flags `--spec-type draft-dflash` y `--spec-draft-n-max 15`.
- El throughput y la latencia no están publicados para esta cuantización; dependerán de la GPU y del número de capas descargadas.

## Comparativa con modelos similares

La comparativa se realiza con el modelo original y con otras variantes de la familia Laguna, ya que no hay datos de otros GGUF de tamaño similar en la información disponible.

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Laguna S 2.1 (original) | 118B-A8B | 1M | OpenMDW-1.1 | safetensors, FP8, NVFP4, INT4, GGUF | Modelo base, rendimiento completo |
| Laguna S 2.1 (este repo) | 118B-A8B | 1M | OpenMDW-1.1 | GGUF (IQ3_XXS_Q1exps) | Cuantización agresiva, ~19 GB, capacidades degradadas |
| Laguna XS 2.1 | 33B-A3B | no disponible | OpenMDW-1.1 | no disponible | Versión más pequeña de la familia |
| Laguna M.1 | 225B-A23B | no disponible | OpenMDW-1.1 | no disponible | Versión más grande de la familia |

No se dispone de comparativas con otros modelos GGUF de codificación de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- La cuantización IQ3_XXS_Q1exps es una compresión muy agresiva que, según el autor, "destruye muchas de las capacidades del modelo original". No es adecuada para tareas que requieran alta precisión o razonamiento complejo.
- El modelo puede alucinar, especialmente en tareas de codificación donde el contexto es extenso y la cuantización introduce errores. Se recomienda verificar siempre el código generado.
- No se han publicado evaluaciones de sesgos o comportamientos dañinos para esta versión cuantizada.
- La licencia OpenMDW-1.1 permite uso comercial y no comercial, pero se debe revisar el texto completo de la licencia para confirmar obligaciones de atribución o restricciones adicionales.
- El modelo base tiene una ventana de contexto de 1M tokens, pero en la práctica, con cuantización agresiva, el rendimiento con contextos muy largos puede degradarse notablemente.
- Para producción, se recomienda usar el modelo original o cuantizaciones menos agresivas (FP8, INT4) en lugar de esta versión experimental.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/TobDeBer/Laguna-S-2.1-GGUF
- Modelo base: https://huggingface.co/poolside/Laguna-S-2.1
- GGUF oficial de poolside: https://huggingface.co/poolside/Laguna-S-2.1-GGUF
- Blog de lanzamiento: https://poolside.ai/blog/introducing-laguna-s-2-1
- Documentación de release notes: https://docs.poolside.ai/release-notes/models
- Imagen Docker: https://hub.docker.com/r/ai/laguna-s-2.1
- Trayectorias de evaluación: https://trajectories.poolside.ai
