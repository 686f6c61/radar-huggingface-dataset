# whoashish115/Moonfrost-777M

## Resumen

Moonfrost-777M es un modelo de lenguaje de tipo Mixture-of-Experts desarrollado por el usuario whoashish115 y publicado en HuggingFace bajo licencia Apache-2.0. Se trata de un modelo base entrenado desde cero: tokenizador byte-level BPE propio, implementación de atención y enrutado propia y bucle de entrenamiento propio, sin adaptar pesos de ningún modelo preexistente. Cuenta con 777.229.056 parámetros totales según los ficheros safetensors, de los cuales solo 161.036.224 se activan por token, lo que le permite ofrecer la capacidad de almacenamiento de un modelo de 777M con un coste computacional cercano al de uno de 161M.

La arquitectura combina dos técnicas tomadas de DeepSeek-V2: Multi-head Latent Attention (MLA), que reduce la caché KV a 352 números por token en lugar de 1.792, y DeepSeekMoE, con 32 expertos enrutados con enrutado top-3 más un experto compartido en cada una de las 13 capas superiores. El modelo tiene 14 capas, tamaño oculto de 896, 14 cabezas de atención y una ventana de contexto de solo 1.024 tokens. Fue preentrenado con aproximadamente 6.000 millones de tokens de FineWeb-Edu (`sample/10BT`, shards 0-7) en unas 10 horas de GPU sobre una única H100.

Su relevancia es fundamentalmente educativa y de investigación: demuestra que es posible implementar desde cero MLA y MoE con un presupuesto de unos 55 dólares y obtener una pérdida de validación de 2,976. No es un modelo orientado a producción conversacional: se distribuye únicamente como modelo base de predicción del siguiente token, sin plantilla de chat, sin ajuste por instrucciones y sin alineación. Los ajustes supervisados derivados de estos pesos se publican por separado (Instruct-v1 e Instruct-v2).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Multi-head Latent Attention (MLA) y DeepSeekMoE; 14 capas (capa 0 densa, capas 1-13 MoE) |
| Parametros totales | 777.229.056 (safetensors); 777.148.032 segun la model card |
| Parametros activos | 161.036.224 por token |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (requiere `trust_remote_code=True`; la arquitectura no esta integrada en `transformers`) |
| Tamano oculto / cabezas | 896 / 14 cabezas (dependencia de cabeza 64) |
| Expertos | 32 expertos enrutados con enrutado top-3 + 1 experto compartido por capa MoE |
| Atencion | MLA con latente KV de 320 numeros + clave rotatoria desacoplada de 32 numeros |
| Vocabulario | 32.768 tokens, BPE byte-level entrenado desde cero sobre el mismo corpus |
| Embeddings | entrada y salida atados (una matriz de 32.768 x 896) |
| Datos de entrenamiento | FineWeb-Edu `sample/10BT`, shards 0-7, ~6.000 millones de tokens |
| Perdida de validacion | 2,976 (mejor checkpoint: paso 11.000 de la fase 2) |
| Perplejidad en holdout | 51,64 (perdida 3,944) sobre un shard no visto |
| Tamano del repositorio | 1,6 GB |
| Descargas / likes | 0 descargas / 1 like |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con dos modificaciones estructurales. La primera es Multi-head Latent Attention: en lugar de cachear clave y valor por cabeza, la entrada se proyecta a un único latente de 320 números que se almacena en la caché y desde el que se reconstruyen claves y valores cuando se necesitan. La posición se trata por separado mediante una clave rotatoria de 32 números compartida entre todas las cabezas, porque una clave rotada no se puede reconstruir desde un latente sin rotar. La caché resultante ocupa 352 números por token en vez de los 1.792 de una atención convencional con 14 cabezas y dimensión 64, es decir, unas cinco veces menos. En inferencia, las matrices de proyección ascendente se pliegan en las proyecciones de consulta y de salida, lo que es exacto por linealidad y evita reconstruir claves y valores durante la generación.

La segunda modificación es DeepSeekMoE: las capas 1 a 13 sustituyen el feed-forward denso por 32 expertos enrutados más un experto compartido, con enrutado top-3, de modo que cada token atraviesa cuatro de los treinta y tres módulos. La capa 0 se mantiene densa con SwiGLU porque el enrutado desde la primera capa desestabilizaba el entrenamiento temprano. Se aplica una pérdida auxiliar de balanceo de carga con peso 0,01. Los expertos se almacenan como tres tensores apilados de forma `(32, hidden, ffn)` y se despachan al estilo GShard por capacidad, de modo que los 32 se ejecutan como tres multiplicaciones de matrices por lotes; la primera versión iteraba en Python y forzaba 32 sincronizaciones de GPU por capa y paso, rindiendo 6.056 tokens/s frente a los 179.000 tokens/s de la versión apilada. Otras decisiones técnicas incluyen RMSNorm sin sesgos, activaciones SwiGLU, RoPE con theta 10.000 calculado en float32 (bfloat16 perdía precisión en posiciones largas) y embeddings de entrada y salida atados, lo que ahorra 29M de parámetros.

El preentrenamiento consumió unos 6.000 millones de tokens de FineWeb-Edu en dos fases, con un ritmo de aprendizaje coseno basado en tiempo, continuo entre ambas, de 6e-4 a 6e-5. El lote efectivo fue de 294.912 tokens por paso (micro-lote 24, acumulación 12), con autocast en bf16 y pesos maestros en fp32, y recorte de gradientes en 1,0. El coste total declarado es de una H100 durante aproximadamente 10 horas de GPU, dentro de un presupuesto de unos 55 dólares. El desglose de parámetros es: expertos enrutados 543M (70%), atención 118M (15%), expertos compartidos y capa densa 84M (11%) y embeddings atados 29M (4%). No se aplicó RLHF, DPO ni ningún otro tipo de alineación.

## Capacidades

- Generacion de texto por continuacion: el modelo predice el siguiente token y continua pasajes; es su unico modo de funcionamiento.
- Autocompletado de texto a partir de un prefi jo o de las primeras frases de un documento.
- Modelado de lenguaje y puntuacion por perplejidad sobre texto en ingles, util para filtrar o clasificar corpus.
- Punto de partida para ajuste supervisado (SFT): los modelos Instruct-v1 e Instruct-v2 derivan de estos pesos compartiendo arquitectura, tokenizador y numero de parametros.
- Inferencia con cache KV reducida gracias a MLA (352 numeros por token), relevante para experimentos de eficiencia de memoria.
- Capacidades multilingues: no disponible; el modelo declara unicamente ingles y su corpus de entrenamiento es FineWeb-Edu en ingles.
- Tool calling / function calling: no disponible; no hay plantilla de chat ni ajuste por instrucciones.
- Soporte de agentes y razonamiento multi-paso: no disponible en el modelo base.
- Vision, audio o modo de razonamiento explicito (thinking): no disponibles.

## Casos de uso

- Continuacion de texto literario o tecnico: el modelo se alimenta con el inicio de un pasaje y genera la continuacion; es el uso para el que fue entrenado y su ventana de 1.024 tokens acota la longitud del prefi jo.
- Investigacion en arquitecturas MoE y MLA a pequena escala: permite reproducir y modificar enrutado top-3, experto compartido, balanceo de carga o cache latente con un coste de entrenamiento de unas 10 horas de H100.
- Docencia y divulgacion: sirve como ejemplo completo y auditable de tokenizador, bucle de entrenamiento y atencion escritos desde cero, con pesos publicos y curvas de entrenamiento en Weights & Biases.
- Punto de partida para ajuste supervisado: un equipo puede reproducir el pipeline de los modelos Instruct publicados y adaptar el modelo base a un dominio concreto (legal, medico, documentacion tecnica) con un presupuesto minimo.
- Filtrado y curacion de corpus: puntuar documentos con la perplejidad del modelo para descartar texto de baja calidad, en la misma linea que el filtrado aplicado a FineWeb-Edu.
- Generacion de datos sinteticos para aumentar corpus: completar fragmentos para producir variantes de texto que despues se filtran por perplejidad.
- Pruebas de infraestructura de inferencia: validar estrategias de despliegue con `trust_remote_code`, medir el ahorro real de memoria de la cache MLA frente a una atencion densa equivalente y comparar precisiones.
- Aplicaciones en ingles con recursos muy limitados: al activar solo 161M parametros por token y ocupar 1,6 GB en safetensors, es viable en equipos de gama de consumo o en el borde, siempre que la tarea sea continuacion de texto y no dialogo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta metricas de entrenamiento y validacion, que se recogen a continuacion:

| Metrica | Valor |
|---|---|
| Perdida de validacion | 2,976 (mejor checkpoint, paso 11.000 de la fase 2) |
| Perdida en shard no visto (holdout) | 3,944 |
| Perplejidad en holdout | 51,64 |
| Throughput de entrenamiento | 179.000 tokens/s en una H100 |
| Compute de preentrenamiento | 1x H100, ~10 horas de GPU |
| Tokens de entrenamiento | ~6.000 millones (FineWeb-Edu sample/10BT, shards 0-7) |

No hay datos de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni de ninguna otra evaluacion estandar, y tampoco comparaciones controladas con modelos de tamano similar bajo el mismo protocolo.

## Requisitos de hardware

- VRAM estimada para pesos (calculada a partir de los 777.229.056 parametros): ~3,1 GB en fp32, ~1,55 GB en bf16/fp16, ~0,78 GB en int8 y ~0,4 GB en int4. Las cuantizaciones no estan publicadas oficialmente, por lo que estas cifras son estimaciones teoricas.
- Cache KV (MLA): 352 numeros por token; en bf16 son unos 704 bytes por token, es decir, ~0,7 MB para una secuencia que agote los 1.024 tokens de contexto.
- Coste computacional: al activar 161.036.224 parametros por token, el coste por token es comparable al de un modelo denso de ~161M, aunque el modelo ocupe 777M en memoria.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM. Cabe en RTX 3060 12 GB, RTX 4060 Ti, RTX 3090, RTX 4090, A100, H100 y en GPUs integradas con memoria unificada suficiente. Una RTX 4090 o A100 permiten batching amplio y contexto completo sin problemas.
- CPU: viable en fp32 con ~4 GB de RAM libre; el rendimiento sera bajo pero suficiente para pruebas.
- Opciones de despliegue: la arquitectura no forma parte de la libreria `transformers`, por lo que el repositorio incluye su propio codigo de modelado y exige `trust_remote_code=True` con `AutoModelForCausalLM`. No hay pesos GGUF publicados, ni integracion verificada con vLLM, llama.cpp, Ollama o TGI; cualquier despliegue en esos motores requeriria portar la implementacion de MLA y del enrutado.
- Latencia y throughput de inferencia: no disponibles. El unico dato de velocidad publicado es de entrenamiento (179.000 tokens/s en una H100).

## Comparativa con modelos similares

La comparacion se limita a modelos densos de tamano parecido y a un MoE con MLA de referencia. Las cifras de los modelos comparados provienen de su documentacion publica y no de una evaluacion conjunta.

| Modelo | Parametros totales / activos | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Moonfrost-777M | 777M / 161M | 1.024 | MoE + MLA, 14 capas | Apache-2.0 | HuggingFace, requiere `trust_remote_code` |
| TinyLlama-1.1B | 1,1B / 1,1B | 2.048 | Transformer denso | Apache-2.0 | HuggingFace, integrado en `transformers` |
| Qwen2.5-0.5B | ~0,49B / 0,49B | 32.768 | Transformer denso | Apache-2.0 | HuggingFace, integrado en `transformers` |
| DeepSeek-V2-Lite | 15,7B / 2,4B | 32.768 | MoE + MLA | licencia propia de DeepSeek | HuggingFace |

Frente a TinyLlama-1.1B y Qwen2.5-0.5B, Moonfrost-777M ofrece menos contexto (1.024 frente a 2.048 y 32.768) y una integracion mas fragil en el ecosistema (codigo personalizado en lugar de arquitectura nativa), a cambio de un consumo de memoria activa mucho menor. Frente a DeepSeek-V2-Lite, comparte las dos innovaciones arquitectonicas pero a una escala dos ordenes de magnitud inferior; DeepSeek-V2-Lite es el termino de comparacion natural si se busca un MoE con MLA ya validado en produccion.

## Limitaciones y advertencias

- Es un modelo base, no un asistente: no tiene plantilla de chat, ni ajuste por instrucciones, ni alineacion. No responde a preguntas; continua texto. Si se le pasa una instruccion, lo mas probable es que la continue en lugar de obedecerla.
- Ventana de contexto de solo 1.024 tokens, muy inferior a la de los modelos actuales; no admite conversaciones multi-turno largas ni documentos extensos.
- Entrenado con ~6.000 millones de tokens, muy por debajo de los presupuestos habituales de modelos de su tamano, y solo sobre FineWeb-Edu, un corpus filtrado de contenido educativo. La cobertura de dominios, registros y estilos es limitada.
- Solo ingles declarado. No se ha validado su comportamiento en castellano ni en otros idiomas.
- Riesgo de alucinacion y de incoherencia: un modelo base de esta escala y con este volumen de datos puede generar afirmaciones falsas, repetir texto y perder coherencia mas alla de unas pocas decenas de tokens.
- Sesgos: no se ha publicado ninguna evaluacion de sesgos, toxicidad o seguridad. El corpus FineWeb-Edu hereda los sesgos de los datos web filtrados de los que procede y no se aplico ningun tipo de alineacion para mitigarlos.
- Sin benchmarks: no existen resultados de MMLU, HumanEval, GSM8K ni similares, por lo que no es posible situar su calidad objetiva frente a alternativas.
- Uso comercial: la licencia Apache-2.0 lo permite sin restricciones adicionales, pero la ausencia de evaluaciones y de garantias hace desaconsejable su uso directo en produccion sin un ajuste y una validacion previos.
- Dependencia de codigo remoto: el uso requiere `trust_remote_code=True`, lo que implica ejecutar codigo de modelado publicado por el autor; conviene revisarlo antes de desplegarlo en entornos sensibles.
- Adopcion practicamente nula: 0 descargas y 1 like en el momento de redactar esta ficha, sin integracion en motores de inferencia habituales.
- Las fechas del repositorio (creado el 13 de septiembre de 2026) y los datos de la model card proceden de la propia publicacion y no se han verificado de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/whoashish115/Moonfrost-777M
- Version ajustada por instrucciones recomendada (Instruct-v2): https://huggingface.co/whoashish115/Moonfrost-777M-Instruct-v2
- Version ajustada por instrucciones anterior (Instruct-v1): https://huggingface.co/whoashish115/Moonfrost-777M-Instruct-v1
- Codigo fuente: https://github.com/whoashish115/moonfrost-ai
- Sitio del proyecto: https://moonfrost-ai.vercel.app
- Curvas y registros de entrenamiento (Weights & Biases): https://wandb.ai/whoashish115-base/moonfrost-777m
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- DeepSeek-V2 (origen de MLA y DeepSeekMoE): https://arxiv.org/abs/2405.04434
- DeepSeek-V3: https://arxiv.org/abs/2412.19437
- Attention is all you need: https://arxiv.org/abs/1706.03762
- RoFormer (embeddings rotatorios, RoPE): https://arxiv.org/abs/2104.09844
- GLU variants improve transformer (SwiGLU): https://arxiv.org/abs/2002.05202
- Root mean square layer normalization (RMSNorm): https://arxiv.org/abs/1910.07467
- GShard (despacho de expertos por capacidad): https://arxiv.org/abs/2006.16668
- Switch transformers: https://arxiv.org/abs/2101.03961
- Training compute-optimal large language models (Chinchilla): https://arxiv.org/abs/2203.15556
- FlashAttention: https://arxiv.org/abs/2205.14135
- SentencePiece: https://arxiv.org/abs/1508.07909
