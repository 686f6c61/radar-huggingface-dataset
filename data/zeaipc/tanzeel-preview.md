# zeaipc/tanzeel-preview

## Resumen

Tanzeel Preview es un modelo de generacion de texto publicado por zeaipc (Zikr-e-Ameen Innovations & Programming Corporation, ZEAIPC), organizacion india fundada por Arman Ansari. Se presenta como una version preliminar ("preview") de la futura familia Tanzeel Intelligence, un asistente conversacional orientado especificamente a hindi, hinglish e ingles, con el objetivo declarado de cubrir el mercado indio. El checkpoint se distribuye en HuggingFace bajo licencia Apache 2.0 y libreria transformers, con pesos en safetensors.

El modelo tiene 7.615.616.512 parametros (~7,62 mil millones) y el repositorio ocupa 15,2 GB, lo que es coherente con pesos en precision bf16/fp16. La etiqueta de arquitectura declarada es qwen2, y el recuento exacto de parametros coincide con la configuracion publica de Qwen2-7B (28 capas, hidden size 3584, vocabulario de 151.936 tokens, atencion con GQA), por lo que todo apunta a un ajuste o continuacion de entrenamiento sobre esa base, aunque la model card no lo confirma de forma explicita.

Su relevancia actual es limitada pero potencialmente interesante como caso de estudio: es un lanzamiento de un actor poco conocido, con 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados y sin documentacion sobre datos de entrenamiento. Encaja en la categoria de modelos de 7-8B afinados para idiomas del subcontinente indio, un nicho donde las alternativas abiertas con soporte real de hindi son escasas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, etiqueta de arquitectura qwen2 (familia Qwen2) |
| Parametros totales | 7.615.616.512 (~7,62 mil millones) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible (la model card no la especifica) |
| Tipos de cuantizacion | no disponible (no se publican versiones GGUF, GPTQ ni AWQ) |
| Idiomas soportados | hindi (hi), ingles (en); la model card anade hinglish como idioma objetivo |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 15,2 GB |
| Pipeline | text-generation |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de publicacion | 2026-09-15 (ultima actualizacion: 2026-09-15) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura mas alla de las etiquetas de HuggingFace, que apuntan a la familia qwen2. La arquitectura Qwen2 es un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion con query-grouped attention (GQA), que reduce el tamano de la cache KV respecto a atencion multi-cabeza completa. El recuento de parametros declarado (7.615.616.512) coincide con la configuracion de Qwen2-7B, lo que sugiere que el modelo parte de ese checkpoint, pero se trata de una inferencia a partir de los datos disponibles y no de una afirmacion del autor.

No hay informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset, si hubo ajuste supervisado, RLHF, DPO u otra fase de alineamiento, ni sobre el tokenizador utilizado para el texto code-mixed en hinglish. Tampoco se documentan innovaciones tecnicas propias (decodificacion especulativa, atencion lineal, modos de razonamiento, etc.). Todo ello debe considerarse "no disponible".

## Capacidades

- Generacion de texto conversacional multi-turno en hindi, ingles e hinglish, segun la descripcion del autor.
- Uso mediante plantilla de chat (`apply_chat_template`), con roles de sistema, usuario y asistente, tal como aparece en el ejemplo de la model card.
- Generacion de texto general con `AutoModelForCausalLM` y `model.generate`, con control de `max_new_tokens`.
- Capacidad multilingue limitada a los dos idiomas declarados (hi, en); no se declaran otros idiomas.
- Compatibilidad con Text Generation Inference (tags `text-generation-inference` y `endpoints_compatible`), lo que permite desplegarlo como endpoint HTTP.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades de vision, audio, thinking mode ni modos de razonamiento explicito.
- No se documenta ventana de contexto extendida ni tecnicas de escalado de contexto.

## Casos de uso

- Asistente conversacional en hindi e hinglish para el mercado indio: el modelo esta explicitamente orientado a este publico, por lo que puede emplearse como chatbot de atencion al cliente en empresas indias que reciben consultas en escritura devanagari o en code-mixing hindi-ingles.
- Prototipado rapido de productos de IA en India: al pesar ~7,6B y caber en una GPU de 24 GB en bf16, permite validar una idea de producto conversacional antes de invertir en modelos mayores.
- Base para fine-tuning especifico de dominio: la licencia Apache 2.0 y el formato safetensors estandar permiten ajustarlo con LoRA o QLoRA sobre datos propios (sanidad, banca, administracion publica india) sin restricciones de licencia comercial.
- Generacion de contenido de marketing en hinglish: redaccion de textos publicitarios o publicaciones en redes que mezclan hindi e ingles, un registro idiomatico poco cubierto por modelos occidentales.
- Traduccion y reformulacion hi-en en flujos internos: aunque el autor no declara traduccion como tarea objetivo, el modelo puede emplearse para borradores de traduccion y reescritura entre ambos idiomas, siempre con revision humana dado que no hay evaluacion publicada.
- Investigacion sobre code-mixing: util como checkpoint de partida para estudiar como se comportan los modelos decoder-only de 7B con texto hibrido hindi-ingles, comparandolo con la base Qwen2-7B.
- Educacion y tutoria en hindi: generacion de explicaciones y material didactico en hindi para plataformas educativas, con la advertencia de que no hay evaluacion de exactitud factual.
- Despliegue en infraestructura modesta: al ser un modelo de 7,6B, puede servirse en una unica GPU de gama alta de consumo o en instancias cloud con GPU unica (L4, A10G, A100 40 GB) para cargas de baja concurrencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de zeaipc/tanzeel-preview no incluye ninguna tabla de evaluacion (ni MMLU, ni HumanEval, ni GSM8K, ni metricas de idioma como IndicGLUE), y no se han encontrado evaluaciones de terceros.

| Benchmark | Tanzeel Preview | Referencia comparable |
|---|---|---|
| MMLU | no disponible | no disponible |
| HumanEval | no disponible | no disponible |
| GSM8K | no disponible | no disponible |
| Evaluaciones en hindi | no disponible | no disponible |

## Requisitos de hardware

Estimaciones calculadas a partir de los 7.615.616.512 parametros declarados; no proceden de documentacion del autor.

- VRAM para pesos en bf16/fp16: aproximadamente 15,2 GB solo de pesos; con cache KV y overhead de runtime, entre 17 y 20 GB en funcion de la longitud de contexto y del tamano de lote.
- VRAM en int8: en torno a 8 GB de pesos, mas cache KV.
- VRAM en 4 bits (si se generan cuantizaciones propias, ya que no hay oficiales): aproximadamente 4,5-5 GB de pesos.
- GPU recomendadas para bf16: A100 40/80 GB, H100, L40S, RTX 4090 (24 GB, con contextos moderados) y RTX 3090 (24 GB).
- Consumer GPU: cabe en bf16 en RTX 4090 y RTX 3090 con margen ajustado; en tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) requiere cuantizacion de 8 o 4 bits; en 8 GB solo es viable en 4 bits con contexto corto.
- Opciones de despliegue: transformers (documentado por el autor), Text Generation Inference (los tags del repositorio lo declaran compatible) y vLLM (soporta la arquitectura Qwen2). Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, conversion que no esta publicada.
- Latencia y throughput: no disponible. No hay cifras de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No hay datos de rendimiento de Tanzeel Preview, por lo que la comparacion se limita a caracteristicas objetivas y verificables de la ficha. Los modelos de referencia son alternativas abiertas de tamano similar con soporte de hindi o con arquitectura equivalente.

| Modelo | Parametros | Contexto declarado | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tanzeel Preview | 7,62B | no disponible | hi, en, hinglish | Apache 2.0 | HuggingFace, safetensors |
| Qwen2-7B-Instruct | 7,62B | 32.768 tokens (ampliable con YaRN) | multilingue, con hindi entre los soportados | Apache 2.0 (salvo excepciones por tamano) | HuggingFace, safetensors y GGUF |
| Llama 3.1 8B Instruct | 8,03B | 128.000 tokens | multilingue (8 idiomas declarados, hindi no incluido de forma explicita) | Llama 3.1 Community License | HuggingFace, safetensors y GGUF |
| Gemma 2 9B | 9,24B | 8.192 tokens | principalmente ingles | Gemma Terms of Use | HuggingFace, safetensors y GGUF |

Comparacion de rendimiento: no disponible, al no existir benchmarks publicados para Tanzeel Preview. La ventaja diferencial declarada por el autor es la optimizacion para hinglish, un registro que los modelos anteriores no cubren de forma explicita.

## Limitaciones y advertencias

- Version "preview": el propio autor la describe como un lanzamiento temprano de una familia en desarrollo, por lo que puede haber cambios incompatibles en checkpoints posteriores.
- Ausencia total de evaluacion: no hay benchmarks, ni evaluaciones humanas, ni pruebas de seguridad publicadas.
- Sin informacion sobre alineamiento: se desconoce si hubo RLHF, DPO o filtrado de datos, por lo que el riesgo de generar contenido nocivo, sesgado o factualmente incorrecto es alto y no esta cuantificado.
- Riesgo de alucinacion: inherente a cualquier modelo generativo de 7,6B sin datos de evaluacion; especialmente relevante en dominios factuales (medicina, derecho, finanzas).
- Cobertura idiomatica limitada: solo se declaran hindi e ingles. El rendimiento en otros idiomas indios (bengali, tamil, telugu, marati, urdu) no esta documentado y previsiblemente sera pobre.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones publicas que permitan contrastar su comportamiento real.
- Contexto desconocido: al no declararse la longitud de contexto, no debe asumirse que soporte conversaciones largas ni documentos extensos.
- Tokenizacion de hinglish no documentada: el coste en tokens del texto code-mixed puede ser superior al del texto monolingue, lo que afecta al coste de inferencia; no hay datos al respecto.
- Licencia Apache 2.0: permite uso comercial y modificacion sin restricciones de atribucion mas alla de las habituales, pero eso no exime de responsabilidad sobre el contenido generado.
- Origen de los datos de entrenamiento desconocido: no se puede verificar el cumplimiento de derechos de autor ni la procedencia del corpus, algo relevante si se integra en un producto comercial.
- Disponibilidad de cuantizaciones: al no publicarse GGUF, GPTQ ni AWQ, el despliegue en hardware de gama baja exige al usuario generar sus propias cuantizaciones y validarlas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zeaipc/tanzeel-preview
- Sitio web del proyecto Tanzeel: https://tanzeelai.web.app
- Perfil del autor en HuggingFace: https://huggingface.co/zeaipc
- Paper, repositorio de codigo, demo o blog tecnico: no disponible
- Resultados de busqueda web: la busqueda no devolvio ningun enlace relacionado con el modelo. Todos los resultados obtenidos correspondian a portales inmobiliarios suizos (homegate.ch, immoscout24.ch) y no guardan relacion con Tanzeel Preview ni con ZEAIPC.
