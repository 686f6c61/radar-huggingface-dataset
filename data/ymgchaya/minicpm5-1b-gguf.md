# ymgchaya/MiniCPM5-1B-GGUF

## Resumen

MiniCPM5-1B es el primer modelo de la serie MiniCPM5, desarrollado por OpenBMB, un transformer denso de 1.080.632.832 parámetros (679.552.512 sin contar los embeddings) concebido para despliegue local, en dispositivo y en entornos con recursos limitados. Su objetivo es ofrecer capacidades de razonamiento, generación de código y uso de herramientas (tool calling) en la franja de 1B de parámetros, donde tradicionalmente estos modelos sacrifican precisión en tareas agénticas y de razonamiento complejo.

La arquitectura es un `LlamaForCausalLM` estándar con 24 capas y atención GQA (16 cabezas de consulta y 2 de clave/valor), con una longitud de contexto nativa de 131.072 tokens. Incluye un modo de razonamiento híbrido: la misma checkpoint funciona como asistente rápido o como razonador deliberado mediante la plantilla de chat `<think>` y el parámetro `enable_thinking`. El modelo se libera bajo licencia Apache 2.0, con pesos en BF16, GGUF (para llama.cpp, Ollama y LM Studio) y MLX 4-bit para Apple Silicon.

La relevancia actual radica en su receta de entrenamiento por etapas con datos abiertos (UltraData Tiered Data Management), que incluye preentrenamiento, mid-training y post-entrenamiento con SFT (200B tokens de razonamiento profundo y 200B de razonamiento híbrido), RL con profesores especializados y destilación on-policy (OPD). Esta ficha documenta la variante GGUF publicada por el usuario `ymgchaya`, un espejo comunitario del repositorio oficial de OpenBMB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso causal, `LlamaForCausalLM` |
| Parametros totales | 1.080.632.832 |
| Parametros activos | No aplica (modelo denso) |
| Parametros sin embeddings | 679.552.512 |
| Longitud de contexto | 131.072 tokens |
| Capas | 24 |
| Cabezas de atencion | 16 Q / 2 KV (GQA) |
| Tipos de cuantizacion | GGUF (variantes cuantizadas para llama.cpp; el repo ocupa 4,0 GB) |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repo); BF16 y MLX 4-bit en repos oficiales |
| Libreria | llama.cpp |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso con 24 capas y atención GQA, con 16 cabezas de consulta y solo 2 de clave/valor, lo que reduce el coste de memoria del KV cache y facilita el despliegue con contexto largo. El contexto nativo alcanza los 131.072 tokens. La checkpoint incorpora una plantilla de chat con etiquetas `<think>` que permite alternar entre modo de razonamiento y modo directo sin cambiar de pesos.

El entrenamiento sigue la metodología UltraData Tiered Data Management en tres fases. El preentrenamiento combina entrenamiento estable y de decaimiento sobre corpus abiertos (Ultra-FineWeb, Ultra-FineWeb-L3 y UltraData-Math). El mid-training refuerza capacidades objetivo y adapta la distribución de datos. El post-entrenamiento consta de SFT con 200B tokens de razonamiento profundo y 200B tokens de razonamiento híbrido (datos liberados como UltraData-SFT-2605), seguido de RL con profesores especializados en matemáticas, código, QA cerrado y escritura, y finalmente destilación on-policy (OPD) para consolidar esos profesores en un único modelo de publicación. Existen checkpoints intermedios: Base (solo preentrenamiento) y SFT (antes de RL/OPD).

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento híbrido con modo `think` / `no think` conmutable mediante `enable_thinking`.
- Generación de código y asistencia a agentes de programación.
- Tool calling / function calling para flujos agénticos.
- Razonamiento matemático y QA de libro cerrado.
- Soporte de contexto largo de hasta 131.072 tokens.
- Escritura y tareas de generación general.
- Despliegue en dispositivo (edge AI), incluido un caso de mascota de escritorio local.

## Casos de uso

- Asistente local en dispositivo: con 1B de parámetros y pesos GGUF, puede ejecutarse en portátiles y equipos de gama consumer sin GPU dedicada, sirviendo como asistente personal offline con contexto largo.
- Agente de programación local: su soporte de tool calling y su ventaja declarada en generación de código lo hacen adecuado para integrarse en editores o terminales que invocan herramientas de forma iterativa.
- Automatización de atención al cliente: la ventana de 131.072 tokens permite gestionar conversaciones multi-turno con historial extenso y documentación adjunta sin truncar.
- Razonamiento matemático asistido: el modo `think` permite resolver problemas paso a paso, útil en herramientas educativas o de verificación.
- Procesamiento de documentos largos: resumen y extracción de información sobre contratos, informes o artículos que superan la ventana típica de modelos pequeños.
- Prototipado rápido de pipelines agénticos: al ser Apache 2.0 y ejecutable con llama.cpp, Ollama o LM Studio, permite validar flujos de agentes sin coste de infraestructura cloud.
- Aplicaciones de escritorio y edge: el proyecto MiniCPM Desk Pet demuestra su viabilidad como motor de LLM local en aplicaciones interactivas de baja latencia.

## Benchmarks y rendimiento

La model card indica que MiniCPM5-1B alcanza SOTA en su clase de 1B frente a LFM2.5-1.2B-Thinking, Qwen3-0.6B/think y Qwen3.5-0.8B/think, con ventaja en uso de herramientas, generación de código y razonamiento difícil. Sin embargo, no se proporcionan cifras numéricas de benchmarks en la información disponible.

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 1.080.632.832 parámetros, una cuantización de 4 bits requiere aproximadamente 0,6-0,8 GB de pesos, más el KV cache para contexto largo.
- GPU recomendadas: no especificadas en la información disponible; por tamaño, cabe en GPUs consumer (RTX 3060, RTX 4060, RTX 4090) y en Apple Silicon vía MLX.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM en cuantizaciones bajas, aunque el dato no está confirmado en la ficha.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y MLX (Apple Silicon); el repo oficial incluye cookbooks para backends de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiniCPM5-1B | 1.080.632.832 | 131.072 | Apache 2.0 | HF, ModelScope, GGUF, MLX |
| LFM2.5-1.2B-Thinking | no disponible | no disponible | no disponible | no disponible |
| Qwen3-0.6B/think | no disponible | no disponible | no disponible | no disponible |
| Qwen3.5-0.8B/think | no disponible | no disponible | no disponible | no disponible |

Los modelos comparables se citan en la model card como baselines, pero no se detallan sus especificaciones ni resultados numéricos en la información proporcionada.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado.
- Riesgo de alucinación inherente a modelos de 1B, especialmente en QA de libro cerrado y razonamiento de múltiples pasos.
- Sesgos no evaluados en la información disponible.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones de los datasets de entrenamiento para uso comercial.
- El repositorio es un espejo comunitario (`ymgchaya`) con 0 descargas y 0 likes; para producción se recomienda usar el repositorio oficial de OpenBMB.
- El contexto de 131.072 tokens puede degradar la calidad en el extremo superior de la ventana; no hay datos de rendimiento por longitud.
- No se documentan tasas de error en tool calling ni latencias en producción.

## Enlaces

- Repositorio GGUF comunitario: https://huggingface.co/ymgchaya/MiniCPM5-1B-GGUF
- Repositorio oficial GGUF: https://huggingface.co/openbmb/MiniCPM5-1B-GGUF
- Modelo BF16: https://huggingface.co/openbmb/MiniCPM5-1B
- Modelo SFT: https://huggingface.co/openbmb/MiniCPM5-1B-SFT
- Modelo Base: https://huggingface.co/openbmb/MiniCPM5-1B-Base
- Modelo MLX: https://huggingface.co/openbmb/MiniCPM5-1B-MLX
- ModelScope: https://www.modelscope.cn/models/OpenBMB/MiniCPM5-1B
- GitHub: https://github.com/OpenBMB/MiniCPM
- MiniCPM Tech Report: https://arxiv.org/pdf/2506.07900
- UltraData Tiered Data Management: https://arxiv.org/pdf/2602.09003
- Wiki: https://openbmb.cn/docs/
- UltraData: https://ultradata.openbmb.cn/
- Demo online: https://huggingface.co/spaces/openbmb/MiniCPM5-1B-Demo
- MiniCPM Desk Pet: https://github.com/OpenBMB/MiniCPM-Desk-Pet
- Dataset Ultra-FineWeb: https://huggingface.co/datasets/openbmb/Ultra-FineWeb
- Dataset Ultra-FineWeb-L3: https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3
- Dataset UltraData-Math: https://huggingface.co/datasets/openbmb/UltraData-Math
- Dataset UltraData-SFT-2605: https://huggingface.co/datasets/openbmb/UltraData-SFT-2605
