# Vi-LAB/KenT_0.3B_Base

## Resumen

KenT_0.3B_Base es un modelo de lenguaje causal de ~299,5 millones de parámetros publicado por Vi-LAB bajo licencia Apache 2.0, orientado principalmente al vietnamita. Su rasgo diferencial es que prescinde por completo de vocabulario y de tokenizador BPE: el texto se segmenta con una expresión regular en piezas (palabras, espacios, signos de puntuación), cada pieza se representa como una secuencia de bytes UTF-8 y se comprime en un único vector antes de entrar en el transformer. Esto elimina el problema de los tokens fuera de vocabulario (OOV) y encaja bien con un idioma con diacríticos como el vietnamita.

La arquitectura, denominada KenT, no utiliza self-attention: cada bloque combina una cross-attention contra un contexto comprimido y una FFN con SwiGLU. El contexto se calcula de forma acumulativa con `num_ctx = 8` queries aprendidas sobre `ctx_expansion = 2`, lo que da un estado de caché de tamaño fijo durante la generación en lugar de crecer con la longitud de la secuencia. La salida se invierte (unpool de un vector a posiciones de byte) y se decodifica de vuelta a texto con el tokenizador regex inverso.

El modelo es relevante como pieza de investigación: es una implementación pública de un LM sin vocabulario a escala de 0,3B, con código de arquitectura incluido y compatibilidad con la interfaz `AutoModelForCausalLM` de transformers mediante `trust_remote_code`. Es un modelo base, no ajustado a instrucciones, y en el momento de redactar esta ficha no tiene descargas ni likes ni benchmarks publicados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | KenT: transformer causal sin self-attention, con cross-attention a contexto comprimido (AttnPooling acumulativo) + FFN SwiGLU; tokenizador regex + embeddings de byte UTF-8 |
| Parametros totales | 299.465.728 (según safetensors) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible (la model card no publica una longitud máxima en piezas ni en bytes; solo define `num_ctx = 8` y `max_piece_bytes = 24`) |
| Tipos de cuantizacion | No disponible (el repositorio solo publica safetensors; no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Vietnamita (`vi`) como idioma de entrenamiento; el enfoque byte-level admite teóricamente cualquier carácter Unicode, sin garantías de calidad fuera del vietnamita |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors + código propio (`trust_remote_code=True`); repositorio de 1,2 GB |

Parámetros de configuración destacados (`config.json`): `d_model = 1024`, `num_layers = 16`, `ctx_expansion = 2`, `num_heads = 16`, `intermediate_size = 3072`, `pool_heads = 8`, `num_ctx = 8`, `max_piece_bytes = 24`. La model card advierte de forma explícita que el repositorio es «code + cấu hình kiến trúc» y que los pesos deben entrenarse o incorporarse aparte; sin embargo, los metadatos de HuggingFace declaran 299.465.728 parámetros en safetensors y un tamaño de repo de 1,2 GB (coherente con pesos en fp32). Esta discrepancia debe verificarse antes de usar el checkpoint.

## Arquitectura y entrenamiento

El flujo de cómputo es el siguiente: un tokenizador regex parte el texto en piezas; cada pieza se descompone en bytes UTF-8 y se proyecta con `byte_embedding` (más una codificación de posición de byte, `byte_pos`); un `MaskedAttnPooling` con `pool_heads = 8` comprime cada pieza en un vector de dimensión `d_model`, escalado por √d; una cabeza lineal (`KenTSquareHead`) produce la secuencia de piezas; y cada uno de los 16 bloques aplica RMSNorm → cross-attention contra el contexto → residual → RMSNorm → FFN SwiGLU → residual. El contexto (`KenTContext`) se obtiene con `Linear d→kd` (kd = 2048), RMSNorm, `AttnPooling N→n` con `n = 8` queries aprendidas y `Linear kd→d`.

Hay tres decisiones técnicas reseñables. Primero, el contexto es estrictamente causal: la agregación de `N→n` solo incorpora piezas con índice ≤ t, de modo que el teacher forcing no filtra información del futuro y la generación solo necesita mantener el par `(num, den)` de tamaño `n·kd` por capa, independiente de la longitud de la secuencia. Segundo, al no haber self-attention, la información posicional se inyecta con codificaciones sinusoidales/coseno con coeficiente aprendible (`use_sinusoidal_positions`) más la posición de byte dentro de la pieza. Tercero, el peso se comparte: la cabeza inversa usa la traspuesta de la matriz de la cabeza directa (inicializada de forma ortogonal) y los logits de byte reutilizan la matriz `byte_embeddingᵀ`, con un byte PAD como terminador de pieza y EOS como señal de parada.

Sobre entrenamiento, la información disponible es mínima: el dataset declarado es `wikimedia/wikipedia` (previsiblemente la Wikipedia en vietnamita, aunque el subconjunto no se especifica), y no se indican número de tokens, composición, número de pasos ni si hubo RLHF, DPO o ajuste por instrucciones. El autor publica receta de entrenamiento (`model.encode(...)` con `labels` y pérdida estándar de LM causal) y `gradient_checkpointing_enable()` para reducir memoria, pero no resultados de convergencia ni curvas de pérdida.

## Capacidades

- Generación de texto causal en vietnamita a partir de un prompt, con `model.generate(str)` o `model.generate(list[str])` devolviendo texto directamente (interfaz no estándar respecto a `tokenizer` + `generate`).
- Codificación y decodificación byte-level sin vocabulario: cualquier cadena Unicode es representable, incluidos emojis, alfabetos no latinos y caracteres poco frecuentes, sin tokens desconocidos.
- API tipo tokenizador (`encode` / `batch_decode`) con `input_ids` de forma `(B, T, L)` y `attention_mask` `(B, T)`, lo que permite integrarlo en bucles de entrenamiento y evaluación convencionales.
- Decodificación configurable con `temperature`, `top_k`, `top_p`, `do_sample`, `min_new_tokens`, `max_new_tokens` (contado en piezas, no en bytes) y `return_full_text`.
- Caché de generación de tamaño constante en VRAM respecto a la longitud de secuencia, gracias al contexto comprimido.
- No dispone de tool calling, function calling, modo razonamiento, capacidades de agente, visión ni audio: es un modelo base de lenguaje.
- No se ha publicado evaluación de capacidades multilingües; el único idioma declarado es el vietnamita.

## Casos de uso

- Preprocesado y modelado de texto vietnamita con diacríticos: al trabajar con bytes UTF-8 y segmentación regex, el modelo evita la fragmentación agresiva que los BPE entrenados en inglés aplican sobre sílabas y tonos vietnamitas; útil para experimentos de normalización, corrección ortográfica o segmentación de palabras.
- Investigación en arquitecturas sin tokenizador: sirve como línea base reproducible de 0,3B para comparar frente a ByT5, CANINE o MegaByte en tareas de modelado de lenguaje byte-level, con la ventaja de un código de arquitectura legible y parámetros explícitos.
- Ajuste fino (fine-tuning) como modelo base para dominios concretos del vietnamita (legal, administrativo, sanitario): 299,5M de parámetros permiten reentrenamiento completo en una sola GPU consumer y el repo documenta el bucle de entrenamiento con `labels`.
- Despliegue en entornos con recursos muy limitados: los pesos ocupan del orden de 0,6 GB en fp16, por lo que cabe en GPU de 4-8 GB o incluso en CPU para inferencia por lotes pequeños, sin dependencia de un vocabulario que haya que versionar junto al modelo.
- Procesamiento de texto ruidoso o con mezcla de sistemas de escritura: al no haber vocabulario cerrado, entradas con caracteres no vistos, transliteraciones o texto corrupto siguen siendo representables; adecuado para pipelines de limpieza y análisis de logs o formularios.
- Generación de texto corto asistida en vietnamita (autocompletado de frases, expansión de titulares) en modo greedy o con muestreo restringido, siempre que se acepte la calidad de un modelo base sin ajuste por instrucciones ni evaluación publicada.
- Docencia y prototipado de mecanismos de atención: el par `KenTCrossAttention` + `KenTContext` con pooling causal es un ejemplo didáctico y ejecutable de atención sin self-attention y con caché de tamaño fijo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la etiqueta de metadatos `metrics: accuracy`, pero no presenta ninguna tabla, conjunto de evaluación ni cifra concreta (MMLU, HumanEval, GSM8K u otros). Tampoco se han encontrado resultados en la búsqueda web realizada, que devolvió únicamente páginas sobre el editor de texto `vi`, sin relación con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 0,6 GB con pesos en fp16/bf16 (299,5M × 2 bytes) y unos 1,2 GB en fp32, coherente con el tamaño del repositorio. Hay que sumar activaciones y el estado de contexto (`num_ctx · ctx_expansion · d_model = 8 · 2048` por capa y secuencia), de tamaño pequeño y constante.
- GPU recomendadas: cualquier GPU con ≥ 4 GB de VRAM es suficiente (RTX 3050, RTX 3060, GTX 1660 Super, T4); para entrenamiento completo conviene ≥ 16 GB (RTX 4090, A100 40 GB) por el coste de memoria declarado como `B·T·num_ctx·ctx_expansion·d` por capa.
- Cabe en GPU consumer: sí, en toda la gama actual; también es viable en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la única vía documentada. No hay pesos GGUF, por lo que llama.cpp y Ollama no están soportados de serie; tampoco hay confirmación de soporte en vLLM, TGI o SGLang, que requerirían implementar la arquitectura personalizada (no disponible).
- Latencia y throughput: no disponible. Cabe esperar un coste por pieza superior al de un transformer equivalente con self-attention, porque cada bloque ejecuta una cross-attention y un pooling adicionales, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokenizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KenT_0.3B_Base | 299,5M | No disponible | Regex + bytes UTF-8, sin vocabulario | Apache 2.0 | HuggingFace, requiere `trust_remote_code` |
| ByT5-small | ~300M | No disponible en la informacion consultada | Byte-level (sin vocabulario) | Apache 2.0 | HuggingFace, transformers nativo |
| CANINE-c / CANINE-s | ~130-200M | No disponible en la informacion consultada | Byte-level con atención sobre caracteres | Apache 2.0 | HuggingFace, transformers nativo |
| Qwen2.5-0.5B | ~494M | 32.768 tokens (dato de conocimiento general, no verificado aqui) | BPE | Apache 2.0 | HuggingFace, amplio soporte de motores de inferencia |

KenT se distingue de ByT5 y CANINE por sustituir la self-attention por cross-attention a un contexto comprimido, lo que le da caché de tamaño fijo, y por segmentar con regex en lugar de operar byte a byte (secuencias de entrada mucho más cortas). Frente a un modelo denso BPE del mismo orden de tamaño como Qwen2.5-0.5B, pierde en ecosistema de despliegue (sin GGUF, sin soporte en vLLM) y en cobertura idiomática, y no hay datos públicos que permitan comparar calidad. Los datos de las filas comparativas provienen de conocimiento general y no han sido verificados en la búsqueda web de esta ficha.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones ni alineación: no es fiable para seguir instrucciones, responder preguntas o mantener conversaciones; produce continuación de texto.
- Solo se declara entrenamiento en vietnamita; el soporte byte-level no implica calidad multilingüe. El rendimiento en castellano es, como mínimo, no evaluado.
- Riesgo de alucinación y de texto incoherente: no hay benchmarks ni evaluación de calidad publicados, y el modelo tiene 0 descargas y 0 likes, por lo que no existe validación de la comunidad.
- Ambigüedad en la segmentación: la model card advierte que una entrada que termina a mitad de palabra se trata como palabra completa, lo que puede degradar las continuaciones en prompts truncados.
- Los bytes de una pieza se generan en paralelo, no de forma autorregresiva dentro de la pieza; esto limita la corrección local a nivel de carácter dentro de palabras largas (hasta 24 bytes por pieza).
- Discrepancia documental relevante: la model card afirma que el repositorio contiene solo código y configuración y que los pesos deben entrenarse o aportarse aparte, mientras que los metadatos declaran 299,5M de parámetros en safetensors. Verificar el contenido real del repo antes de integrarlo en producción.
- La arquitectura es personalizada y exige `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar `infer.py` y fijar una revisión concreta del repositorio.
- Sin soporte documentado en vLLM, TGI, llama.cpp u Ollama, y sin pesos cuantizados: el despliegue a escala requiere trabajo de ingeniería adicional.
- Licencia Apache 2.0 permite uso comercial y modificaciones, con obligación de conservar avisos de copyright y de licencia y de indicar cambios; no hay cláusulas de uso aceptable específicas del autor.
- Las fechas de creación y actualización del repositorio (2026) son posteriores a la fecha habitual de publicación de modelos de este tipo; conviene contrastar la vigencia del checkpoint.
- La búsqueda web realizada no aportó información independiente sobre el modelo (los resultados trataban del editor `vi`), por lo que no hay verificación externa de arquitectura, datos ni calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Vi-LAB/KenT_0.3B_Base
- Dataset declarado (Wikipedia): https://huggingface.co/datasets/wikimedia/wikipedia
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Paper, blog, repositorio de código independiente o demo: no disponibles en la información proporcionada
- Citación indicada por el autor (BibTeX en la model card): `@misc{kent2026, title = {KenT: Tokenizer-free Regex-Byte Language Model with Compressed Context Cross-Attention}, year = {2026}}` — sin URL de arXiv ni de publicación asociada
