# Treese/RQwen3-751M-Base

## Resumen

RQwen3-751M-Base es un modelo de lenguaje de 751.632.384 parametros entrenado **desde cero** por el autor Treese (repositorio R-Theory), no un fine-tuning de un modelo existente. Su arquitectura replica la de Qwen3-0.6B (RoPE, GQA, SwiGLU, RMSNorm, QK-Norm, sin sesgos) y reutiliza su tokenizador, pero no comparte ningun peso con ningun modelo Qwen publicado: solo la topologia y el vocabulario. Se distribuye como modelo base (next-token predictor), sin SFT, sin RLHF y sin alineacion.

El entrenamiento consumio aproximadamente 13.000 millones de tokens de una mezcla curada de seis fuentes de caracter educativo (FineWeb-Edu al 54%, Wikipedia al 15%, OpenWebMath al 12%, StackExchange al 8%, peS2o al 8% y cosmopedia al 4%), durante 50.000 pasos con una longitud de secuencia de 2.048 tokens. La perdida final de entrenamiento fue de 2,5186 (perplejidad aproximada de 12,4), partiendo de 11,88 en inicializacion aleatoria. Todo el entrenamiento se ejecuto en una unica NVIDIA L40S de 48 GB en el cluster UNC Longleaf, en unas 11 jornadas de reloj a lo largo de 10 envios SLURM.

Su relevancia es doble. Por un lado, es un caso reproducible y documentado de extremo a extremo (arquitectura, pipeline de datos, incidencias) de un modelo denso de escala sub-1B entrenado con recursos academicos modestos. Por otro, sirve como referencia honesta de lo que se puede y no se puede esperar de un modelo base de este tamano y con este presupuesto de datos: HellaSwag muestra senal real, mientras que ARC-Challenge y MMLU se quedan al nivel del azar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, estilo Qwen3 (RoPE, GQA, SwiGLU, RMSNorm, QK-Norm, sin sesgos) |
| Parametros totales | 751.632.384 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens (`max_position_embeddings`); contexto de entrenamiento tambien 2.048 |
| Tipos de cuantizacion | Pesos publicados en `float32`; se puede cargar en `bfloat16`/`float16`. No hay GGUF, AWQ ni GPTQ publicados oficialmente, aunque el modelo es convertible con los conversores de llama.cpp al ser compatible con Qwen3 |
| Idiomas soportados | Ingles (declarado `en`); el tokenizador Qwen3 es multilingue, pero los datos de entrenamiento son exclusivamente en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (dtype `float32`), tamano de repositorio 3,0 GB |
| `hidden_size` | 1.024 |
| `num_hidden_layers` | 28 |
| Cabezas de atencion / KV | 16 / 8 (GQA 2:1) |
| `head_dim` | 128 |
| `intermediate_size` | 3.072 |
| `vocab_size` | 151.936 |
| `rope_theta` | 1.000.000 |
| `rms_norm_eps` | 1e-06 |
| `tie_word_embeddings` | `false` (LM head desacoplada) |
| Pasos de entrenamiento | 50.000 |
| Perdida final de entrenamiento | 2,5186 (perplejidad ≈ 12,4) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso que calca las decisiones de diseno de Qwen3-0.6B: atencion con RoPE (`rope_theta=1e6`), Grouped Query Attention con 16 cabezas de consulta y 8 de clave/valor (ratio 2:1, `head_dim=128`), FFN con SwiGLU (`intermediate_size=3072` frente a `hidden_size=1024`), normalizacion RMSNorm con `eps=1e-6`, QK-Norm y ausencia total de sesgos. Hay dos divergencias deliberadas respecto a Qwen3-0.6B: la LM head no esta atada a la capa de embedding de entrada (`tie_word_embeddings=false`, lo que anade parametros) y la longitud de contexto entrenada es de 2.048 tokens en lugar de los 32K del modelo de Qwen.

El pipeline de datos es una mezcla de seis fuentes filtrada por calidad, deduplicada por hash exacto dentro de cada fuente y pre-tokenizada en shards binarios. El reparto es FineWeb-Edu (54%), Wikipedia `20231101.en` (15%), OpenWebMath (12%), StackExchange Preferences (8%), peS2o-final (8%) y el subconjunto `stanford` de cosmopedia (4%), sumando unos 13.000 millones de tokens para aproximadamente una epoca. El entrenamiento uso AdamW con `weight_decay=0.1` y `grad_clip=1.0`, un schedule coseno con pico de `3e-4` y minimo de `3e-5` tras 500 pasos de warmup, autocast en bf16 y atencion SDPA. El lote efectivo fue de 128 secuencias (2 x 64 de acumulacion de gradiente), unos 262.000 tokens por paso. No hubo RLHF, DPO ni ningun tipo de alineacion posterior.

## Capacidades

- Generacion de texto autoregresiva en ingles: continuacion de fragmentos, redaccion de parrafos y modelado de lenguaje general.
- Fluidez gramatical y sintactica consolidada: con 13.000 millones de tokens, la gramatica se aprende antes que el conocimiento factual.
- Continuacion con sentido comun basico: es la unica tarea evaluada donde el modelo supera el azar de forma clara (HellaSwag, +6,5 puntos sobre el 25% de azar).
- Modelado de lenguaje sobre dominios educativos y tecnicos: matematicas de OpenWebMath, articulos enciclopedicos y respuestas tecnicas de StackExchange, gracias a la composicion de la mezcla.
- Vocabulario amplio de 151.936 entradas heredado del tokenizador Qwen3, con buena cobertura de tokens multilingues a nivel de tokenizacion, aunque no de modelado.
- Compatibilidad directa con el ecosistema Qwen3: `transformers`, vLLM, conversores de llama.cpp y `lm-evaluation-harness` lo cargan sin `trust_remote_code`.
- No dispone de tool calling, function calling, modo de razonamiento explicito, capacidades de agente, vision ni audio. Tampoco sigue instrucciones.

## Casos de uso

- Investigacion en scaling laws y recetas de preentrenamiento: el modelo es un punto de datos reproducible de un denso de ~750M entrenado con ~13B tokens sobre hardware de una sola GPU, util para estudiar curvas de perdida y eleccion de mezcla de datos.
- Analisis de pipelines de datos educativos: dado que la mezcla (FineWeb-Edu, Wikipedia, OpenWebMath, StackExchange, peS2o, cosmopedia) esta documentada con porcentajes exactos, sirve para experimentos controlados de ablacion sobre composicion de corpus.
- Punto de partida para fine-tuning con recursos limitados: al ser un modelo base con licencia Apache 2.0 y pesos en safetensors estandar, se puede adaptar por SFT a tareas concretas (clasificacion, extraccion, resumen de dominio) sin coste de licencia.
- Prototipado de continuacion de texto en dominios tecnicos: completado de fragmentos matematicos o de articulos enciclopedicos en ingles, siempre con decodificacion por muestreo y supervision humana.
- Banco de pruebas para evaluacion con `lm-evaluation-harness`: al compartir arquitectura con Qwen3, se integra directamente en el harness con backend `hf`, lo que facilita comparativas reproducibles frente a otros modelos base pequenos.
- Docencia y formacion en LLM: es un caso de estudio completo con arquitectura, pipeline de datos, diario de entrenamiento e incidencias documentadas en GitHub, adecuado para cursos de entrenamiento de modelos desde cero.
- Generacion de datos sinteticos de baja exigencia: continuaciones de texto en ingles para aumentar corpus de dominio educativo, filtrando posteriormente por calidad.

## Benchmarks y rendimiento

Evaluacion realizada con EleutherAI `lm-evaluation-harness` v0.4.13, backend `hf`, bf16, sobre una unica L40S, con la configuracion por defecto del harness (0-shot en las tres tareas).

| Tarea | Configuracion | Resultado | Nivel de azar |
|---|---|---|---|
| ARC-Challenge | 0-shot, `acc` | 24,32% ± 1,25 | 25% |
| HellaSwag | 0-shot, `acc` | 31,47% ± 0,46 | 25% |
| MMLU (57 materias, media) | 0-shot, `acc` | 25,32% ± 0,37 | 25% |

Lectura de los resultados segun el propio autor: HellaSwag es la unica tarea con senal real (+6,5 puntos sobre el azar, fuera del error estandar), lo que demuestra capacidad de continuacion con sentido comun aprendida de un corpus mayoritariamente web-educativo. ARC-Challenge y MMLU quedan al nivel del azar, resultado esperable por escalado para un modelo base de 751M entrenado con solo ~13B tokens. El MMLU 0-shot no es directamente comparable con el MMLU 5-shot que se reporta habitualmente en la literatura de modelos base.

Como referencias de perdida de entrenamiento (no comparables directamente, porque proceden de corpus distintos), el autor cita ~2,85 para densos desde cero de tamano similar (GPT-2 large 774M, Pythia-410M) y ~2,4 para Qwen3-0.6B tras unos 5 billones de tokens, aproximadamente 400 veces mas datos que esta ejecucion.

## Requisitos de hardware

- VRAM para inferencia en `float32` (dtype publicado): unos 3,0 GB solo de pesos, mas activaciones y cache KV; manejable en GPUs de 8 GB.
- VRAM en `bfloat16`/`float16`: aproximadamente 1,5 GB de pesos; en torno a 2-3 GB con contexto completo de 2.048 tokens y lote pequeno.
- VRAM en cuantizacion de 8 bits: alrededor de 0,8 GB de pesos.
- VRAM en cuantizacion de 4 bits (GGUF Q4_K_M): alrededor de 0,45 GB de pesos; cabe en GPUs integradas y en CPU.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060/4070, RTX 4090, e incluso en GPUs de 6-8 GB o en inferencia por CPU con llama.cpp.
- GPU recomendadas para servicio: L40S (la usada en entrenamiento), A100, H100 o RTX 4090; para uso individual cualquier GPU moderna con al menos 6 GB sobra.
- Opciones de despliegue: `transformers` con la clase `Qwen3ForCausalLM` (sin `trust_remote_code`), vLLM, TGI (`text-generation-inference`, etiquetado en el repo), conversores de llama.cpp para generar GGUF (y por tanto Ollama o llama.cpp), y `lm-evaluation-harness` para evaluacion.
- Latencia y throughput: no disponible. El autor no publica cifras de tokens por segundo ni de latencia, y no se han medido en esta ficha.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| RQwen3-751M-Base | 751,6M | 2.048 | Apache 2.0 | HuggingFace, safetensors fp32, sin cuantizaciones publicadas | Entrenado desde cero con ~13B tokens; sin alineacion; perdida final 2,5186 |
| Qwen3-0.6B | ~0,6B | 32.768 | Apache 2.0 | HuggingFace, safetensors y GGUF | Entrenado con ~5T tokens; reporta perdida ~2,4; contexto 16 veces mayor |
| Pythia-410M | 410M | 2.048 | Apache 2.0 | HuggingFace, safetensors | Suite de modelos base con checkpoints intermedios; perdida de entrenamiento citada ~2,85 |
| GPT-2 large | 774M | 1.024 | MIT modificada | HuggingFace, safetensors | Referencia historica de escala similar; perdida de entrenamiento citada ~2,85 |

Los datos de perdida de los modelos comparados proceden de la propia model card de RQwen3 y no son comparables entre si, ya que cada uno se evalua sobre su distribucion de entrenamiento. No se dispone de resultados de benchmarks comunes (MMLU, HellaSwag, ARC) para estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un asistente: no ha recibido SFT, RLHF ni instruction tuning. Continua texto, no sigue instrucciones ni responde preguntas de forma fiable.
- Fabrica hechos: con 13.000 millones de tokens, el modelo adquiere gramatica y fluidez mucho antes que conocimiento fiable. Las afirmaciones con tono autoritativo suelen ser incorrectas.
- Colapso de modo: la decodificacion voraz (greedy) tiende a caer en bucles de repeticion. Es necesario muestrear con `temperature` y `top_p` ajustados.
- Contexto corto: entrenado a 2.048 tokens. El comportamiento mas alla de esa longitud no esta probado y debe asumirse deficiente.
- Solo ingles en la practica: el tokenizador Qwen3 es multilingue, pero la mezcla de entrenamiento es integramente en ingles, por lo que el rendimiento en otros idiomas sera pobre.
- El tokenizador incluye una plantilla de chat heredada de Qwen3. Dado que el modelo no esta ajustado para conversacion, usarla no aporta y puede inducir comportamientos incoherentes.
- Resultados de razonamiento y conocimiento general al nivel del azar en ARC-Challenge y MMLU (0-shot); no debe emplearse en tareas que requieran razonamiento multi-paso o conocimiento amplio de dominio.
- Aunque la licencia Apache 2.0 permite uso comercial sin restricciones, la falta de alineacion y la tendencia a la fabulacion hacen desaconsejable su despliegue directo en produccion de cara al usuario final.
- Repositorio con 0 descargas y 0 likes en el momento de redactar esta ficha: no hay validacion externa de la comunidad sobre los pesos publicados.
- Los resultados de evaluacion son 0-shot y provienen del propio autor; no se han replicado de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Treese/RQwen3-751M-Base
- Repositorio del proyecto (arquitectura, pipeline de datos y diario de entrenamiento): https://github.com/R-Theory/RQwen3
- Documentacion del pipeline de datos: https://github.com/R-Theory/RQwen3/blob/main/docs/data-pipeline.md
- Harness de evaluacion utilizado (EleutherAI): https://github.com/EleutherAI/lm-evaluation-harness
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset Wikipedia `20231101.en`: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset OpenWebMath: https://huggingface.co/datasets/open-web-math/open-web-math
- Dataset StackExchange Preferences: https://huggingface.co/datasets/HuggingFaceH4/stack-exchange-preferences
- Dataset peS2o-final: https://huggingface.co/datasets/MaLA-LM/peS2o-final
- Dataset cosmopedia: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: todas las entradas obtenidas correspondian a foros no relacionados con inteligencia artificial.
