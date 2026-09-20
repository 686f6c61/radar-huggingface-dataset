# superAVTR/tinizong-46M

## Resumen

Tinizong-46M (publicado por el autor superAVTR con el nombre interno de Tinizong-50M) es un modelo de lenguaje experimental de tipo decoder-only, compatible con la arquitectura Llama, con aproximadamente 46 millones de parametros. Se distribuye como conversion a Hugging Face del checkpoint original nativo en PyTorch, mapeado a la clase `LlamaForCausalLM`. No es un modelo de instrucciones ni de chat: es un modelo base entrenado con prediccion del siguiente token, pensado como plataforma de investigacion e ingenieria para explorar diseno de arquitecturas, tokenizador, construccion de datasets, preentrenamiento, escalado y ajuste por instrucciones.

El modelo emplea un tokenizador SentencePiece BPE propio de 16.000 tokens con byte fallback, una longitud de contexto de 1.024 tokens, un tamano oculto de 512 y 12 capas transformer con 8 cabezas de atencion (dimension de cabeza 64). La normalizacion es RMSNorm, la codificacion posicional es RoPE (theta 10.000), la MLP usa SwiGLU y los embeddings de entrada estan atados a la cabeza LM. Su relevancia actual es acotada: se trata de un checkpoint de investigacion con licencia Apache 2.0, util para experimentar con modelos muy pequenos y para validar pipelines de conversion nativo a Hugging Face, no para tareas de produccion.

El modelo incluye una validacion numerica cuidadosa de la conversion, con una diferencia absoluta maxima de logits de aproximadamente 9,54e-6 y coincidencia token a token en generacion autoregresiva. Los resultados publicados de benchmarks son propios de un modelo de este tamano y quedan cerca de las lineas base aleatorias en la mayoria de tareas evaluadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, compatible con Llama (`LlamaForCausalLM`) |
| Parametros totales | 45.986.296 (~46M; el autor lo denomina "Tinizong-50M") |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados; al ser safetensors en float32/float16 son posibles conversiones a GGUF, int8 y 4-bit) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB, libreria transformers, PyTorch) |

Datos adicionales de arquitectura: vocabulario de 16.000 tokens, tokenizador SentencePiece BPE con byte fallback, tamano oculto 512, 12 capas, 8 cabezas de atencion de dimension 64, tamano intermedio de MLP 1.365, RoPE con theta 10.000, RMSNorm, SwiGLU, atencion causal multi-cabeza y weight tying entre embeddings de entrada y cabeza LM.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de atencion causal multi-cabeza, disenado para ser compatible con Llama. La implementacion nativa original, escrita directamente en PyTorch, usaba una proyeccion combinada de Q/K/V, RMSNorm, embeddings posicionales rotatorios (RoPE) y capas feed-forward SwiGLU con embeddings de entrada y salida atados. En la conversion a Hugging Face, la proyeccion QKV combinada se dividio en los tensores `q_proj`, `k_proj` y `v_proj`, mientras que el resto de capas se mapearon directamente a los componentes equivalentes de Llama. La validacion numerica reportada confirma practicamente equivalencia funcional: diferencia absoluta maxima de logits ~9,54e-6, similitud coseno de logits 1,0000000000 y correspondencia exacta token a token en generacion con temperatura 0,5, top-k 30 y top-p 1,0.

El entrenamiento se realizo con prediccion del siguiente token (causal LM) sobre una mezcla de datos que incluye texto derivado de Wikipedia, texto sintetico factico y educativo, y otro material experimental de preentrenamiento utilizado durante el desarrollo. El corpus y la metodologia evolucionaron a lo largo del proyecto, por lo que el propio autor lo describe como un checkpoint experimental de investigacion mas que como un modelo de produccion completamente documentado. El dataset de preentrenamiento referenciado en la tarjeta es `superAVTR/wikipedia_en_512_for_pretraining`. No se documenta el numero exacto de tokens de entrenamiento, la composicion porcentual del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto autoregresiva basica en ingles mediante prediccion del siguiente token.
- Continuacion de texto y modelado de lenguaje a corto plazo dentro de una ventana de 1.024 tokens.
- Razonamiento de sentido comun elemental, con rendimiento proximo a la linea base aleatoria en tareas como HellaSwag y PIQA.
- Capacidad limitada de eleccion multiple en tareas de conocimiento sencillas (por encima de la linea base en ARC-Easy).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso de forma nativa (es un modelo base, no ajustado por instrucciones).
- No dispone de modo "thinking" ni de capacidades de vision o audio.
- Multilingue: no disponible; la tarjeta declara unicamente ingles.

## Casos de uso

- Investigacion academica sobre modelos pequenos: sirve como banco de pruebas reproducible para estudiar como escala el rendimiento en funcion del numero de parametros, ya que con ~46M de parametros se puede entrenar y evaluar en hardware modesto.
- Validacion de pipelines de conversion de PyTorch nativo a Hugging Face: el propio autor documenta el mapeo de una proyeccion QKV combinada a `q_proj`/`k_proj`/`v_proj` y proporciona metricas de equivalencia numerica, lo que lo convierte en una referencia util para reproducir ese flujo.
- Experimentos de tokenizacion: permite estudiar el efecto de un vocabulario SentencePiece BPE de 16.000 tokens con byte fallback sobre la calidad de generacion en corpus ingleses pequenos.
- Educacion y divulgacion: al ejecutarse facilmente en CPU o en GPU de gama baja, puede emplearse en entornos docentes para ilustrar el funcionamiento de un transformer causal, las tecnicas de muestreo (temperatura, top-k, top-p) y el uso de KV caching.
- Pruebas de integracion de infraestructura: su tamano minimo permite validar despliegues con transformers, text-generation-inference o llama.cpp antes de escalar a modelos mayores, comprobando el comportamiento de las APIs y del formato de pesos.
- Generacion de lineas base (baselines) en experimentos de investigacion: al ser un modelo base documentado con resultados de LM Evaluation Harness en configuracion zero-shot, sirve como punto de comparacion para nuevos checkpoints del mismo orden de magnitud.
- Prototipado de tareas de autocompletado muy simples en ingles dentro de contextos cortos, siempre que se asuma su alta tasa de error y su tendencia a la alucinacion.

## Benchmarks y rendimiento

Evaluacion realizada con EleutherAI LM Evaluation Harness, zero-shot, backend de Hugging Face, batch size 8, dtype float32, sin codigo de evaluacion personalizado.

| Benchmark | Metrica | Puntuacion |
|---|---|---|
| ARC-Easy | acc | 36,78 % |
| ARC-Easy | acc_norm | 36,11 % |
| HellaSwag | acc | 27,03 % |
| HellaSwag | acc_norm | 27,36 % |
| PIQA | acc | 53,16 % |
| PIQA | acc_norm | 52,83 % |
| LAMBADA OpenAI | accuracy | 5,38 % |
| LAMBADA OpenAI | perplexity | 2.539,74 |

Segun el autor, el modelo supera la linea base de eleccion aleatoria en ARC-Easy, mientras que HellaSwag y PIQA se mantienen cerca de sus respectivas lineas base aleatorias, y LAMBADA resulta especialmente dificil para este checkpoint. No se han publicado resultados en la informacion disponible para MMLU, GSM8K, HumanEval ni otros benchmarks adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: en float32 aproximadamente 184 MB de pesos; en float16/bfloat16 aproximadamente 92 MB; en int8 aproximadamente 46 MB; en 4-bit aproximadamente 23 MB. Hay que anadir el overhead de activaciones y de la cache KV, que con 1.024 tokens de contexto es pequeno.
- GPU recomendadas: cualquier GPU moderna con suficiente memoria, incluidas RTX 3060, RTX 4090, A100 y H100; el modelo no requiere aceleradores de gama alta.
- Cabe en GPU de consumo: si, con enorme margen, incluso en GPUs de gama baja o en GPUs integradas modernas. Tambien es viable ejecucion en CPU.
- Opciones de despliegue: transformers (referencia), text-generation-inference (la tarjeta incluye el tag `text-generation-inference` y `endpoints_compatible`), y conversion a GGUF para llama.cpp u Ollama si se desea, aunque no se publican pesos GGUF oficiales.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Rendimiento comparado |
|---|---|---|---|---|---|
| superAVTR/tinizong-46M | ~46M | 1.024 | ingles | Apache 2.0 | ARC-Easy acc_norm 36,11 %; HellaSwag acc_norm 27,36 %; PIQA acc_norm 52,83 % |
| Pythia-70M | ~70M | 2.048 | ingles | Apache 2.0 | no disponible en la informacion proporcionada |
| GPT-2 small | ~124M | 1.024 | ingles (multilingue limitado) | MIT (pesos OpenAI) | no disponible en la informacion proporcionada |
| TinyStories-33M | ~33M | 2.048 | ingles | Apache 2.0 | no disponible en la informacion proporcionada |

La comparativa se limita a parametros, contexto y licencia, ya que no se dispone de resultados de benchmarks homogeneos para los modelos alternativos en la informacion proporcionada. En cualquier caso, todos ellos pertenecen a la categoria de modelos muy pequenos y no son adecuados para tareas de produccion exigentes.

## Limitaciones y advertencias

- Es un modelo base, no ajustado por instrucciones ni para chat: no responde a ordenes y no debe usarse como asistente conversacional.
- Riesgo elevado de alucinacion y de generar texto facticamente incorrecto, especialmente con prompts que exigen conocimiento del mundo.
- Los resultados de benchmarks son bajos: HellaSwag y PIQA quedan cerca de la linea base aleatoria, y la perplejidad en LAMBADA OpenAI es de 2.539,74.
- Limitacion de contexto: solo 1.024 tokens, insuficiente para conversaciones largas, documentos extensos o razonamiento multi-paso.
- Limitacion de idioma: la tarjeta declara unicamente ingles; no hay soporte multilingue documentado.
- Modelo experimental: el propio autor indica que el corpus y la metodologia evolucionaron durante el proyecto y que este release debe considerarse un checkpoint de investigacion mas que un modelo de produccion documentado.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion y conservacion del aviso de licencia, pero no implica garantias de idoneidad.
- No se publican pesos cuantizados ni artefactos GGUF oficiales; cualquier cuantizacion habria que generarla por cuenta propia.
- Sesgos conocidos: no disponibles de forma especifica; al entrenarse sobre texto derivado de Wikipedia puede heredar sesgos presentes en ese corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/superAVTR/tinizong-46M
- Dataset de preentrenamiento: https://huggingface.co/datasets/superAVTR/wikipedia_en_512_for_pretraining
- Paper, blog, repositorio o demo adicional: no disponible (la busqueda web no devolvio resultados relevantes para este modelo).
