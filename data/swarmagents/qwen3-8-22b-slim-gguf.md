# swarmagents/Qwen3.8-22B-Slim-GGUF

## Resumen

Qwen3.8-22B-Slim es una poda estructurada del modelo base Qwen/Qwen3.8-27B realizada por SwarmAgents. Mediante la eliminación de tres macro-bloques completos de 4 capas (capas 20-23, 28-31 y 36-39), el modelo pasa de 64 a 52 capas y de 27B a aproximadamente 22,75B parámetros, con una reducción de huella de VRAM de en torno al 19,4%. El objetivo declarado es hacer viable el despliegue local en equipos con 16 GB de memoria unificada (MacBook M1-M4) o GPUs de consumo con 16 GB (RTX 4080, RTX 3090), manteniendo contextos largos y caché KV.

La poda respeta el ritmo híbrido 3:1 del modelo original (tres capas Gated DeltaNet por cada capa de atención completa), de modo que la arquitectura resultante conserva la alternancia entre atención lineal y atención completa sin romper la recurrencia. Los pesos de decaimiento de estado (`A_log`, `dt_bias`, `conv1d`, layernorms) no se promedian; solo se pliegan las proyecciones de salida residuales de los bloques eliminados sobre el bloque superviviente anterior, con una suma de task-vector (α = 0,15) y una restauración de norma de Frobenius.

El modelo se distribuye únicamente en formato GGUF, con una cuantización Q4_K_M de 14,0 GB (13,05 GiB) como artefacto principal, y un Modelfile listo para Ollama. Está pensado para texto en inglés y chino, con licencia Apache 2.0 y soporte nativo de decodificación especulativa mediante la cabeza Multi-Token Prediction (MTP) preservada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas Gated DeltaNet (atención lineal/SSM) y capas de atención completa en ritmo 3:1; 52 capas |
| Parametros totales | 22.754.473.504 (~22,75B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (único archivo publicado); otras cuantizaciones no disponibles |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors no publicado en este repo) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida en la que cada macro-bloque de 4 capas contiene 3 capas Gated DeltaNet (atención lineal con estado recurrente) y 1 capa de atención completa. La poda aplicada por SwarmAgents elimina macro-bloques completos, no capas sueltas, para preservar esa proporción 3:1 en las 52 capas supervivientes. Los macro-bloques 0-3 (capas 0-15) y 14-15 (capas 56-63) se protegen explícitamente: los primeros porque contienen la representación de entrada, los últimos porque alimentan la cabeza MTP y determinan la distribución del hidden state que entra en ella.

No hay reentrenamiento ni fine-tuning posterior a la poda. El "seam healing" consiste en plegar las proyecciones de salida residuales de cada bloque eliminado (`linear_attn.out_proj`, `self_attn.o_proj`, `mlp.down_proj`) sobre el bloque superviviente inmediatamente anterior, mediante `W_comb = W_surv + α·W_drop` con α = 0,15, seguido de un reescalado por norma de Frobenius para restaurar la magnitud original. Los parámetros de decaimiento recurrente y las layernorms no se tocan, lo que según el autor evita la corrupción del seguimiento de estado en contexto largo. El resultado es un modelo sin entrenamiento adicional cuya cabeza MTP queda alineada de forma nativa, lo que permite usar decodificación especulativa con `--draft-max` en llama.cpp.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat compatible con el formato ChatML de Qwen (`<|im_start|>` / `<|im_end|>`).
- Razonamiento matemático: el autor reporta una retención del 99,4% en GSM8K respecto al modelo base.
- Generación de código: retención del 99,2% en HumanEval según la model card.
- Ejecución de tareas de CLI y sistemas: Terminal-Bench-2.1 con retención del 98,8%.
- Modo de razonamiento explícito mediante etiquetas `<think>` en la plantilla de chat.
- Decodificación especulativa nativa a través de la cabeza MTP preservada (hasta +70% de throughput según el autor).
- Capacidades multilingües limitadas a inglés y chino según los metadatos del modelo.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Asistente de código en local sobre portátil Apple Silicon de 16 GB: con Q4_K_M (14,0 GB) y la ventana de contexto ajustada, el modelo cabe en memoria unificada y permite autocompletado y refactorización sin conexión, aprovechando la retención del 99,2% en HumanEval.
- Automatización de tareas de terminal y scripting: el rendimiento en Terminal-Bench-2.1 (66,20%) lo hace adecuado para agentes que generan comandos de shell, interpretan salidas y corrigen errores en pipelines de CI locales.
- Razonamiento matemático en entornos educativos o de análisis: la retención del 99,4% en GSM8K permite resolver problemas aritméticos de varios pasos en un equipo de consumo sin depender de API externa.
- Despliegue en GPU única de 16 GB (RTX 4080, RTX 3090): el tamaño Q4_K_M deja 2-3 GB para caché KV, suficiente para conversaciones multi-turno con contexto moderado en servicios de atención al cliente autoalojados.
- Inferencia de baja latencia con decodificación especulativa: al conservar la cabeza MTP, se puede activar `--draft-max` en llama.cpp para acelerar la generación en aplicaciones interactivas como autocompletado o chat en tiempo real.
- Prototipado e investigación sobre poda estructurada: el modelo sirve como referencia reproducible de poda por macro-bloques con preservación de ritmo híbrido, útil para estudiar el impacto de la poda en arquitecturas con estado recurrente.
- Procesamiento de documentación técnica bilingüe inglés-chino: los dos idiomas declarados cubren casos de traducción técnica y resumen de documentación en equipos con ambos idiomas.

## Benchmarks y rendimiento

| Benchmark | Qwen 3.8 27B (64 capas) | Qwen3.8-22B-Slim (52 capas) | Retención |
|---|---|---|---|
| Hermes Bench (capacidad general) | 65,77% | 64,90% | 98,7% |
| Terminal-Bench-2.1 (CLI y sistemas) | 67,00% | 66,20% | 98,8% |
| GSM8K (razonamiento matemático) | 88,50% | 88,00% | 99,4% |
| HumanEval (código) | 77,40% | 76,80% | 99,2% |
| Coffman (concurrencia y lógica) | 100% | 100% | 100% |
| Velocidad de ejecución por capa | referencia | +23% más rápido | 12 capas menos |
| Huella RAM (Q4_K_M) | 16,5 GB | 14,0 GB (13,05 GiB) | -19,4% VRAM |
| Multi-Token Prediction (MTP) | soportado | soportado (+70%) | sin reentrenamiento |

Los datos proceden exclusivamente de la model card del autor; no se han verificado de forma independiente.

## Requisitos de hardware

- VRAM estimada: 14,0 GB (13,05 GiB) para los pesos en Q4_K_M; 2-3 GB adicionales para caché KV y contexto.
- GPU recomendadas: RTX 4080 (16 GB) y RTX 3090 (24 GB) para el archivo Q4_K_M; RTX 4090, A100 y H100 quedan sobredimensionadas para esta cuantización pero permiten contextos mayores.
- Apple Silicon: MacBook con 16-24 GB de memoria unificada (M1/M2/M3/M4); el autor reporta que el modelo se construyó en un M4 Max.
- Cabe en GPU de consumo de 16 GB con Q4_K_M; por debajo de 16 GB no hay margen para caché KV.
- Opciones de despliegue: Ollama (importación directa con `ollama run hf.co/swarmagents/Qwen3.8-22B-Slim-GGUF:Q4_K_M` o mediante el Modelfile incluido) y llama.cpp (`llama-cli` con `--draft-max 2` para decodificación especulativa).
- Latencia y throughput: el autor reporta un +23% de velocidad por capa y hasta +70% con MTP; no se publican valores absolutos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-22B-Slim | ~22,75B | no disponible | Apache 2.0 | GGUF Q4_K_M | Poda del Qwen3.8-27B, 52 capas, retención ~99% en benchmarks del autor |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible | Apache 2.0 | safetensors y GGUF | Modelo original, 64 capas, mayor huella (16,5 GB en Q4_K_M) |
| Alternativas de ~22-24B de la familia Qwen | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

La comparación con otras familias de modelos del mismo tamaño no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La poda no incluye reentrenamiento: el "seam healing" es una aproximación por plegado de pesos y reescalado de norma, por lo que puede degradar capacidades no cubiertas por los benchmarks del autor.
- Los benchmarks reportados proceden únicamente de la model card del autor y no han sido verificados de forma independiente; además, el modelo base Qwen3.8-27B no está confirmado como disponible públicamente.
- Solo se publica una cuantización (Q4_K_M); no hay versiones Q5, Q6, Q8 ni safetensors en este repositorio, lo que limita el ajuste fino de la calidad.
- Idiomas soportados limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mitigaciones específicas ni evaluación de sesgos.
- No se documenta soporte de tool calling, function calling ni uso agéntico multi-paso, lo que limita su integración en pipelines que dependan de esas capacidades.
- La longitud de contexto no se especifica; el margen de 2-3 GB para caché KV en equipos de 16 GB restringe en la práctica el contexto utilizable.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los términos de Qwen deben respetarse igualmente.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria de la calidad del artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/swarmagents/Qwen3.8-22B-Slim-GGUF
- Perfil del autor: https://huggingface.co/swarmagents
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Ollama: https://ollama.com
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
