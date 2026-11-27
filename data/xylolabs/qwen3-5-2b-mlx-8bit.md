# Xylolabs/Qwen3.5-2B-MLX-8bit

## Resumen

Xylolabs/Qwen3.5-2B-MLX-8bit es una conversión cuantizada a 8 bits del modelo Qwen/Qwen3.5-2B, publicada por Xylolabs para su uso con la librería `mlx-lm` en hardware Apple Silicon. El modelo original es un transformer de Qwen (familia Qwen3.5) de aproximadamente 1.880 millones de parámetros, y esta versión elimina la torre de visión y el bloque MTP (multi-token prediction) del modelo base, quedando como un modelo exclusivamente de texto.

La relevancia de esta ficha reside en que ofrece una alternativa de inferencia local en Mac con una fidelidad muy alta respecto al modelo BF16 original: el 8-bit logra una divergencia KL de 0,000400 en WikiText-2 y un 98,76% de acuerdo top-1, frente al 83,34% del 4-bit. El tamaño del repositorio es de 2,0 GB, lo que permite ejecutarlo en equipos con memoria unificada moderada.

La licencia Apache 2.0 del modelo base se mantiene, lo que facilita su uso comercial. No obstante, la información disponible es escasa: no hay datos de benchmarks de tareas (MMLU, HumanEval, GSM8K), ni idiomas declarados, ni detalles de entrenamiento más allá de lo que se infiere del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), sin torre de visión ni bloque MTP en esta conversión |
| Parametros totales | 1.881.825.088 (~1,88 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit affine, group size 64, scales y biases en float16; existe también una variante MLX 4-bit del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), cuantización affine 8-bit |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen/Qwen3.5-2B original: un transformer denso de ~1,88 mil millones de parámetros. Esta conversión concreta elimina la torre de visión y el bloque de multi-token prediction (MTP), por lo que el resultado es un modelo de texto puro. La cuantización es affine de 8 bits con group size 64; todas las capas lineales y el embedding de tokens (incluida la LM head) están cuantizados, las capas de normalización se mantienen en float16, el resto de tensores no cuantizados en float16 y `A_log` en float32.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de datos ni si hubo RLHF o DPO; esos datos corresponden al modelo base Qwen/Qwen3.5-2B y no se detallan en la model card de esta conversión. La innovación técnica destacable de esta ficha es la propia metodología de cuantización de Xylolabs, que reporta métricas de fidelidad (KL y top-1) frente a BF16 en tres conjuntos: WikiText-2, chat y texto retenido, con 40/20/20 fragmentos de 512 tokens.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento y respuesta a preguntas generales, heredado del modelo base Qwen3.5-2B.
- Modelo exclusivamente de texto: la torre de visión ha sido eliminada en esta conversión, por lo que no procesa imágenes.
- Sin bloque MTP: no dispone de decodificación multi-token especulativa nativa en esta versión.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el formato MLX 8-bit y el tamaño de 2,0 GB permiten ejecutar el modelo con `mlx-lm` en equipos con memoria unificada de 8-16 GB, sin GPU dedicada.
- Asistentes conversacionales de baja latencia en local: el pipeline `conversational` y la fidelidad del 8-bit (98,88% top-1 en chat) lo hacen adecuado para chatbots de escritorio que requieren respuestas coherentes sin depender de la nube.
- Prototipado rápido de aplicaciones de texto: al instalarse con `pip install mlx-lm==0.32.2` y un único comando `mlx_lm.generate`, sirve para validar prompts y flujos antes de escalar a modelos mayores.
- Generación de texto en entornos con privacidad estricta: al ejecutarse íntegramente en local, los datos no salen del dispositivo, lo que encaja en escenarios con requisitos de confidencialidad.
- Tareas de procesamiento por lotes en Mac: el bajo coste de memoria (2 GB) permite mantener el modelo cargado y procesar lotes de texto de forma continua en un portátil o Mac mini.
- Base para fine-tuning o experimentación con cuantización: al ser una conversión reproducible del modelo base, sirve como referencia para comparar fidelidad de distintas cuantizaciones (4-bit frente a 8-bit) en pipelines de evaluación propios.
- Evaluación de calidad de cuantización: los datos de KL y top-1 publicados permiten usar esta versión como punto de control en estudios sobre el impacto de la cuantización en modelos pequeños.

## Benchmarks y rendimiento

Los únicos datos publicados son métricas de fidelidad de la cuantización frente a BF16, no benchmarks de tareas estándar (MMLU, HumanEval, GSM8K). Se reproducen a continuación:

| Cuantización | Tamano | WikiText-2 KL | top-1 | Chat KL | top-1 | Held-out KL | top-1 | Chequeo de 7 preguntas |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| MLX 4-bit | 1,08 GB | 0,097054 | 83,34% | 0,130638 | 82,25% | 0,136542 | 77,94% | 5/7 |
| MLX 8-bit | 2,00 GB | 0,000400 | 98,76% | 0,000457 | 98,88% | 0,000563 | 98,22% | 5/7 |
| BF16 | 3,78 GB | — | — | — | — | — | — | 5/7 |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 2,0 GB, por lo que se necesita al menos esa cantidad de memoria unificada libre; en la práctica, 4-6 GB de memoria disponible para el proceso de inferencia.
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) mediante MLX; no está pensado para GPU NVIDIA ni CUDA.
- ¿Cabe en consumer GPU? No aplica en el sentido habitual: está diseñado para memoria unificada de Mac, no para GPUs de consumo con CUDA. En un Mac con 8 GB de RAM unificada debería caber; con 16 GB o más hay margen holgado.
- Opciones de despliegue: `mlx-lm` (versión 0.32.2 indicada por el autor) como vía principal. No se documentan otras opciones (vLLM, llama.cpp, Ollama, TGI) para este formato MLX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Xylolabs/Qwen3.5-2B-MLX-8bit | ~1,88 B | no disponible | MLX safetensors 8-bit | Apache 2.0 | Solo texto, sin visión ni MTP |
| Qwen/Qwen3.5-2B (base) | ~1,88 B | no disponible | safetensors BF16 | Apache 2.0 | Incluye torre de visión y bloque MTP |
| Variante MLX 4-bit del mismo autor | ~1,88 B | no disponible | MLX safetensors 4-bit | Apache 2.0 | 1,08 GB, menor fidelidad (83,34% top-1 en WikiText-2) |

No se dispone de datos de benchmarks de tareas para comparar el rendimiento frente a alternativas de otros autores; la comparación se limita a parámetros, formato, licencia y fidelidad de cuantización.

## Limitaciones y advertencias

- Modelo exclusivamente de texto: la torre de visión fue eliminada, por lo que no puede procesar imágenes a pesar de que el modelo base Qwen3.5-2B sí la incluya.
- Sin bloque MTP: se pierde la capacidad de decodificación multi-token predictiva del modelo original, lo que puede afectar al throughput.
- Solo compatible con MLX y Apple Silicon; no se puede desplegar en CUDA, ROCm ni en la mayoría de servidores Linux con GPU.
- No se declaran idiomas soportados; el rendimiento multilingüe es desconocido y debe validarse empíricamente.
- No hay datos de benchmarks de tareas (MMLU, HumanEval, GSM8K), por lo que la calidad en razonamiento, código y matemáticas no está documentada para esta conversión.
- Riesgo de alucinación inherente a un modelo de ~1,88 B parámetros; no se han publicado evaluaciones de sesgo ni de seguridad.
- Aunque la licencia es Apache 2.0, conviene revisar los ficheros `LICENSE` y `NOTICE` del repositorio para confirmar las condiciones exactas de atribución.
- El chequeo de 7 preguntas da 5/7 tanto en 8-bit como en BF16, lo que sugiere que esa prueba concreta no discrimina entre cuantizaciones; no debe interpretarse como una medida robusta de calidad.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3.5-2B-MLX-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio MLX: https://github.com/ml-explore/mlx
- Repositorio de Xylolabs (referenciado en la model card): https://github.com/XylolabsInc/tensix-bfp-gptq
- Imagen de accuracy KL: https://huggingface.co/Xylolabs/Qwen3.5-2B-MLX-8bit/resolve/main/accuracy-kl.png
- Imagen de accuracy top-1: https://huggingface.co/Xylolabs/Qwen3.5-2B-MLX-8bit/resolve/main/accuracy-top1.png
