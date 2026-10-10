# TevunahAi/Chochmah1B

## Resumen

Chochmah-1B es un modelo de lenguaje base (base model) de 1.182.900.224 parámetros entrenado desde cero (from-scratch) por TevunahAi. Se trata del segundo modelo propio del autor y constituye la ampliación del Chochmah-350M, manteniendo la misma receta de datos pero escalando a 45.000 millones de tokens de entrenamiento. Es un modelo decoder-only con un bloque idéntico al de Qwen3 (GQA, QK-norm por cabeza antes de RoPE, SwiGLU, RMSNorm y embeddings atados), lo que permite cargarlo con `Qwen3ForCausalLM` sin código personalizado; no se utilizaron pesos, datos ni tokenizer de Qwen.

El modelo no está ajustado por instrucciones: no tiene plantilla de chat, ni RLHF, ni DPO. Su mezcla de preentrenamiento está deliberadamente ponderada hacia derecho (case law), filosofía y filosofía política, matemáticas, física y código, apoyándose en cuatro corpus construidos a mano (2,6 millones de opiniones judiciales de EE. UU., un canon filosófico de dominio público, 24.175 obras de ficción de Gutenberg y libros de texto de OpenStax) sobre una base amplia de web, código y enciclopedia.

Resulta relevante ahora por dos motivos: por un lado, ofrece un modelo base limpio y documentado de ~1B parámetros para investigación en fine-tuning y cuantización; por otro, documenta un pipeline completo de preentrenamiento from-scratch (curación de datos, tokenización, currículo, schedule y entrenamiento tolerante a fallos) que cabe en una única GPU de estación de trabajo. El entrenamiento se realizó íntegramente en una NVIDIA RTX 5000 Ada de 32 GB durante 44 días de tiempo de reloj.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, bloque Qwen3 (GQA, QK-norm por cabeza antes de RoPE, SwiGLU, RMSNorm, embeddings atados) |
| Parametros totales | 1.182.900.224 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos GGUF oficiales; el modelo se ofrece como base para investigación en cuantización) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer decoder-only con el bloque de Qwen3: atención con consultas agrupadas (grouped-query attention, GQA), normalización QK por cabeza aplicada antes de RoPE, activación SwiGLU, RMSNorm y embeddings de entrada y salida atados. Según el autor, se trata únicamente de la arquitectura: todos los parámetros se entrenaron desde inicialización aleatoria, sin reutilizar pesos, datos ni tokenizer de Qwen. El modelo se cargaría con la clase `Qwen3ForCausalLM`, de modo que cualquier herramienta compatible con Qwen3 lo soporta sin código adicional.

El preentrenamiento se realizó desde cero sobre 45.000 millones de tokens, frente a los 30.000 millones del Chochmah-350M, en una única NVIDIA RTX 5000 Ada de 32 GB durante 44 días. La mezcla combina una base amplia de web, código y enciclopedia (fineweb-edu, starcoderdata, Wikipedia, smollm-corpus, open-web-math, finemath, proof-pile-2, peS2o, gutenberg_english) con cuatro corpus construidos a mano: 2,6 millones de opiniones judiciales estadounidenses, un canon filosófico de dominio público, 24.175 obras de ficción de Gutenberg y libros de texto de OpenStax. El entrenamiento siguió un currículo de tres fases alineado con un schedule de learning rate warmup–stable–decay (WSD). Los dos defectos de datos documentados en el modelo de 350M (saltos de línea duros en el texto de Gutenberg y filtrado de ficción hacia el corpus de filosofía) se corrigieron antes de iniciar esta ejecución. No hubo RLHF ni DPO. Los detalles de optimizador, schedule, mezcla por fases, throughput y pérdida por dominio aparecen marcados como «FILL» en la model card, por lo que no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto autoregresiva como modelo base: completado de texto y continuación de secuencias, sin ajuste por instrucciones.
- Predominio temático en derecho (case law estadounidense), filosofía y filosofía política, matemáticas, física y código, por la ponderación de la mezcla de entrenamiento.
- Modelado de lenguaje de dominio específico útil para evaluación de perplejidad y como punto de partida para fine-tuning.
- Soporte de tool calling / function calling: no disponible (modelo base sin plantilla de chat ni instrucciones).
- Soporte de agentes y razonamiento multi-paso: no disponible (no hay ajuste por instrucciones ni modos de razonamiento).
- Capacidades multilingües: solo inglés (`language: en`).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Fine-tuning supervisado para dominios legales: al haber sido preentrenado con 2,6 millones de opiniones judiciales de EE. UU., sirve como base para ajustar modelos de resumen de sentencias, extracción de citas o clasificación de doctrina jurídica.
- Adaptación a dominios científicos y técnicos: su mezcla con open-web-math, proof-pile-2, finemath y corpus de física lo hace adecuado como punto de partida para tareas de matemáticas y física antes de un ajuste específico.
- Investigación en cuantización: al ser un modelo base de ~1,18B parámetros liberado explícitamente para ese fin, permite estudiar el impacto de distintos esquemas de cuantización sobre la perplejidad sin capas de ajuste por instrucciones que distorsionen la medición.
- Reproducción y estudio de pipelines de preentrenamiento: el autor documenta el proceso completo (curación, tokenización, currículo, schedule WSD y entrenamiento tolerante a fallos en una sola GPU), por lo que el modelo puede emplearse como caso de estudio reproducible.
- Generación de código asistida tras fine-tuning: el corpus bigcode/starcoderdata forma parte de la mezcla, de modo que el modelo puede ajustarse para completado de código en pipelines internos, aunque no ofrece tool calling de serie.
- Experimentos de completado de texto libre sin instrucciones: útil para evaluación de modelos base, estudios de sesgo en corpus concretos y análisis de distribuciones de probabilidad sobre texto jurídico o filosófico.
- Base para destilación: su tamaño de 1,18B parámetros y licencia Apache 2.0 lo convierten en un candidato para generar datos sintéticos o destilar hacia modelos más pequeños en un entorno con restricciones de cómputo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye un bloque `model-index` con las tareas previstas (ARC-Easy, HellaSwag, PIQA, LAMBADA OpenAI de lm-evaluation-harness) pero todos los valores están marcados como «FILL», es decir, pendientes de ejecución. La tabla comparativa con Chochmah-350M aparece truncada en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, aproximadamente 4,7 GB de pesos; en FP16/BF16, unos 2,4 GB; en int8, alrededor de 1,2 GB; en int4, en torno a 0,6 GB. A estas cifras hay que sumar la memoria de activaciones y la caché KV, cuyo tamaño depende de una longitud de contexto que no está especificada en la información disponible.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM puede ejecutar el modelo en FP16; el autor lo entrenó en una NVIDIA RTX 5000 Ada de 32 GB, por lo que ese perfil es suficiente con holgura. Para servir en producción, A100, H100 o L40S ofrecen mayor throughput.
- ¿Cabe en GPU de consumo? Sí. El modelo de 1,18B parámetros cabe sin problemas en tarjetas de consumo como RTX 3060 (12 GB), RTX 4070, RTX 4080 o RTX 4090, incluso en FP16, y en configuraciones de 6-8 GB mediante cuantización.
- Opciones de despliegue: al cargarse como `Qwen3ForCausalLM`, es compatible con transformers y con `text-generation-inference` (aparece en los tags). También es compatible con vLLM por herencia de la arquitectura Qwen3. Para llama.cpp u Ollama sería necesaria una conversión a GGUF que no se distribuye de forma oficial.
- Latencia y throughput estimados: no disponibles. La model card menciona un valor de throughput mediano (`median_tok_per_s`), pero está marcado como «FILL».

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Datos de rendimiento |
|---|---|---|---|---|
| Chochmah-1B | 1,18B | no disponible | Apache 2.0 | no disponibles (pendientes) |
| Chochmah-350M | 358,7M | no disponible | no disponible | parciales según la model card (no incluidos aquí) |
| Qwen3-1.7B | 1,7B | no disponible en la información proporcionada | Apache 2.0 | no disponibles en esta ficha |

No se dispone de resultados comparativos de benchmarks entre Chochmah-1B y alternativas de la misma categoría, ya que los valores de lm-evaluation-harness del propio modelo están pendientes de publicación. La categoría natural de comparación son los modelos base densos de entre 1B y 2B parámetros con licencia permisiva, pero la información proporcionada no permite establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no sigue órdenes, no dispone de plantilla de chat y no ha pasado por RLHF ni DPO, por lo que no debe usarse directamente como asistente.
- Riesgo elevado de alucinación: al no estar alineado ni ajustado, puede generar afirmaciones plausibles pero falsas, especialmente en dominios especializados como derecho o matemáticas.
- Sesgos conocidos: el corpus legal se compone de opiniones judiciales de EE. UU., lo que puede introducir un sesgo jurídico y cultural estadounidense; el canon filosófico es de dominio público, lo que sesga la representación hacia autores históricos.
- Limitación de idioma: solo inglés (`language: en`), por lo que no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Longitud de contexto no especificada: se desconoce la ventana máxima de contexto, un dato crítico para decidir su uso en tareas de contexto largo.
- Sin datos de benchmarks: no hay métricas publicadas (ARC-Easy, HellaSwag, PIQA, LAMBADA están pendientes), lo que impide evaluar su calidad frente a alternativas.
- Licencia: Apache 2.0 permite uso comercial y modificación, con obligación de conservar avisos de licencia y atribución; no se documentan restricciones adicionales de uso aceptable.
- Detalles de entrenamiento incompletos: optimizador, schedule, mezcla por fases, throughput y pérdida por dominio figuran como marcadores «FILL» en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TevunahAi/Chochmah1B
- Modelo predecesor Chochmah-350M: https://huggingface.co/TevunahAi/Chochmah-350M
- lm-evaluation-harness (framework de evaluación citado): https://github.com/EleutherAI/lm-evaluation-harness
- Dataset HuggingFaceFW/fineweb-edu
- Dataset bigcode/starcoderdata
- Dataset wikimedia/wikipedia
- Dataset sedthh/gutenberg_english
- Dataset open-web-math/open-web-math
- Dataset HuggingFaceTB/smollm-corpus
- Dataset HuggingFaceTB/finemath
- Dataset EleutherAI/proof-pile-2
- Dataset allenai/peS2o
