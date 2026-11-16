# SupraLabs/Supra2.5-Pro-Base

## Resumen

Supra2.5-Pro Base es un modelo de lenguaje de 65 millones de parametros desarrollado por SupraLabs y entrenado desde cero sobre 100.000 millones de tokens de datos web de alta calidad. Utiliza la arquitectura Qwen3 (`Qwen3ForCausalLM`) con un tokenizador propio de 16.384 entradas y se distribuye como modelo base, sin ajuste por instrucciones ni alineamiento posterior. Es la tercera generacion de la familia Supra, tras Supra-50M y Supra2-100M, y su propuesta central es ofrecer una relacion calidad/tamano superior a la de sus predecesores con un coste de inferencia minimo.

El modelo emplea un transformer decodificador causal con 12 capas, tamano oculto de 640, 10 cabezas de atencion con atencion multi-cabeza clasica (MHA) y dimension de cabeza 64. La ventana de contexto es de solo 512 tokens, una limitacion importante para casos de uso conversacionales o de recuperacion de documentos. Los pesos se publican en safetensors y bfloat16, con un repositorio de aproximadamente 0,3 GB.

Su relevancia actual reside en el segmento de modelos ultra pequenos para entornos con recursos muy limitados: prototipado rapido, experimentacion educativa, generacion de texto en dispositivos de borde o como componente auxiliar dentro de pipelines mayores. No compite con modelos de miles de millones de parametros, sino con alternativas de menos de 150M en tareas de lenguaje general de baja complejidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador causal (`Qwen3ForCausalLM`), MHA, SwiGLU, RoPE |
| Parametros totales | 67.028.096 (~65M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (entrenamiento con trazas de aleman, frances, espanol y otros, sin aprendizaje solido segun el autor) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |
| Tamano del repositorio | ~0,3 GB |
| Hidden size | 640 |
| Capas | 12 |
| Cabezas de atencion | 10 (MHA), head dim 64 |
| Intermediate size (SwiGLU) | 1600 |
| Vocabulario | 16.384 |
| Posicional | RoPE, theta = 10.000 |
| Normalizacion | RMSNorm, epsilon = 1e-6 |
| Embeddings | atados (tied) |
| Tokens de entrenamiento | 100.000 millones |

## Arquitectura y entrenamiento

El modelo es un transformer decodificador causal de tipo denso con la pila de Qwen3: atencion multi-cabeza convencional (no GQA), activacion SwiGLU en la MLP, RMSNorm con epsilon 1e-6 y embeddings de entrada y salida atados. La codificacion posicional es RoPE con theta 10.000, coherente con el contexto corto de 512 tokens. El tokenizador es propio, con 16.384 entradas, mas compacto que el de Qwen3 estandar.

El entrenamiento se dividio en dos fases. Una fase de calentamiento y estabilidad de 80.000 millones de tokens centrada en conocimiento general y codigo, y una fase de decaimiento de 20.000 millones de tokens con datos sinteticos, pares pregunta-respuesta, matematicas, comportamiento y libros de texto. Las fuentes principales fueron Ultra-FineWeb-en (44B), dclm_100BT-shuffled (28B) y UltraData-Code-L2 con 70% Python y 30% JavaScript (8B), mas una mezcla final de Ultra-FineWeb-en, Finephrase, TxT360-v2, Dolma3-Dolmino-Mix-100B-1025, UltraData-Math e IFM/Pretrain-Behaviors. Se uso AdamW fusionado con beta1 0.9, beta2 0.95, learning rate pico de 3,8e-4, schedule WSD, weight decay 0.1, gradient clipping 1.0, precision mixta BF16 + TF32 y un batch por dispositivo de 256 con acumulacion de gradiente 1. El hardware de entrenamiento fueron dos RTX A6000 de 48 GB con NVLink, con optimizaciones de Liger Kernel y DDP bucketing de 10 MB. No se documenta RLHF, DPO ni ninguna fase de alineamiento.

## Capacidades

- Generacion de texto autoregresiva en ingles: continuacion de prompt, redaccion basica y completado de parrafos.
- Razonamiento de sentido comun de baja complejidad, medido en ARC-Easy, ARC-Challenge, PIQA y HellaSwag.
- Aritmetica basica y problemas numericos simples, evaluados con ArithMark-3.
- Generacion de codigo limitada, con sesgo hacia Python y JavaScript por la composicion del corpus.
- Capacidad multilingue residual: el autor indica que el corpus contenia trazas de aleman, frances y espanol, pero que el modelo no las aprendio bien.
- No dispone de tool calling ni function calling: es un modelo base sin ajuste de instrucciones.
- No dispone de modo de razonamiento explicito (thinking mode), vision, audio ni capacidades de agente.
- No soporta conversaciones multi-turno de forma nativa sin ingenieria de prompt, y su contexto de 512 tokens limita el historial.

## Casos de uso

- Prototipado rapido de pipelines de NLP: sirve para validar tokenizacion, formateo de datos y flujos de inferencia antes de escalar a modelos mayores, gracias a su peso de 0,3 GB y a su carga inmediata en CPU.
- Generacion de texto en dispositivos de borde: con 65M de parametros y pesos bfloat16, cabe en memoria de sistemas embebidos y placas tipo Raspberry Pi o moviles de gama alta, donde modelos mayores no son viables.
- Fine-tuning educativo y de investigacion: al ser un modelo base con licencia Apache 2.0, es adecuado para experimentos de ajuste supervisado, LoRA o estudio de dinamicas de entrenamiento en entornos academicos con presupuesto reducido.
- Filtrado y clasificacion de texto por perplejidad: puede emplearse como modelo de referencia para puntuar la fluidez de fragmentos generados por otros sistemas o para detectar texto anomalo en corpus.
- Generacion de datos sinteticos auxiliares: util para producir continuaciones de bajo coste en tareas de aumento de datos, siempre que la calidad exigida sea moderada y se valide posteriormente.
- Completado de codigo acotado: con el sesgo hacia Python y JavaScript del corpus, puede asistir en autocompletado de fragmentos cortos en entornos de desarrollo con recursos restringidos.
- Benchmark de referencia en investigacion de eficiencia: sirve como linea base de 65M para comparar tecnicas de cuantizacion, decodificacion especulativa o destilacion en un rango de parametros poco cubierto.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card:

| Modelo | ARC-Easy | ARC-Challenge | PIQA | HellaSwag | ArithMark-3 | Media |
|---|---|---|---|---|---|---|
| Supra2.5-65M | 50,80% | 25,77% | 63,11% | 34,35% | 49,60% | 44,73% |
| Supra2-100M | 47,81% | 24,83% | 65,40% | 35,98% | 36,90% | 42,18% |
| Supra-50M | 46,00% | 25,17% | 61,19% | 31,72% | 36,30% | 40,08% |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 0,13 GB solo para pesos (67M x 2 bytes), mas activaciones y cache KV; en la practica cabe holgadamente en menos de 1 GB.
- En cuantizacion de 8 bits o 4 bits, el modelo ocuparia decenas de megabytes, aunque el autor no publica variantes cuantizadas oficiales.
- GPU recomendadas: cualquier GPU consumer moderna es sobredimensionada; una GTX 1650, RTX 3060 o incluso una iGPU reciente es suficiente. Para entrenamiento o fine-tuning, una RTX 4090 o A100 acelera el proceso pero no es necesaria.
- Cabe en cualquier GPU consumer y en CPU: la inferencia en CPU con llama.cpp u Ollama seria viable si se generan pesos GGUF, que el autor no distribuye.
- Opciones de despliegue: transformers con PyTorch (soporte nativo), text-generation-inference segun los tags del repositorio, y potencialmente llama.cpp u Ollama previa conversion a GGUF. vLLM no esta confirmado para esta arquitectura y tamano.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano, se espera decodificacion de miles de tokens por segundo en GPU moderna, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Benchmarks publicados |
|---|---|---|---|---|---|
| Supra2.5-Pro Base | ~65M | 512 | Apache 2.0 | Ingles | ARC, PIQA, HellaSwag, ArithMark-3 |
| Supra2-100M | ~100M | no disponible | Apache 2.0 (familia Supra) | Ingles | ARC, PIQA, HellaSwag, ArithMark-3 |
| Supra-50M | ~50M | no disponible | Apache 2.0 (familia Supra) | Ingles | ARC, PIQA, HellaSwag, ArithMark-3 |
| SmolLM-135M (HuggingFaceTB) | 135M | 2.048 | Apache 2.0 | Ingles | Si, multiples |
| Qwen2.5-0.5B | 494M | 32.768 | Apache 2.0 | Multilingue | Si, multiples |

La comparativa con SmolLM-135M y Qwen2.5-0.5B se ofrece como referencia de categoria por tamano y licencia; no se dispone de resultados cruzados en los mismos benchmarks para establecer una comparacion directa de rendimiento.

## Limitaciones y advertencias

- Es un modelo base sin alineamiento: no sigue instrucciones de forma fiable y puede producir contenido incoherente, repetitivo o inapropiado sin filtros adicionales.
- Ventana de contexto de solo 512 tokens: insuficiente para conversaciones multi-turno, resumen de documentos o RAG con contexto amplio.
- Entrenado principalmente en ingles; el propio autor advierte que las trazas de otros idiomas no se aprendieron bien, por lo que el rendimiento en espanol sera bajo.
- Riesgo elevado de alucinacion y de afirmaciones factualmente incorrectas, especialmente en conocimiento especializado, matematicas complejas y fechas o entidades concretas.
- Sesgos heredados del corpus web (Ultra-FineWeb-en, dclm, Dolma3): pueden aparecer sesgos de genero, raza, nacionalidad o ideologia sin mitigacion documentada.
- Licencia Apache 2.0 permite uso comercial, pero al no haber alineamiento el despliegue en produccion exige moderacion y validacion propias.
- Sin soporte documentado de tool calling, agentes ni razonamiento multi-paso, lo que descarta su uso en flujos agenticos.
- No se publican variantes cuantizadas oficiales ni garantias de compatibilidad con vLLM, llama.cpp u Ollama; habria que validar la conversion.
- El modelo es muy reciente (creado en noviembre de 2026) y cuenta con cero descargas y dos likes en Hugging Face, por lo que no existe validacion independiente de sus resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SupraLabs/Supra2.5-Pro-Base
- Banner del modelo: https://cdn-uploads.huggingface.co/production/uploads/697f2832c2c5e4daa93cece7/45USn-GgQibSeumtVsUBo.png
- Grafico de benchmarks: https://cdn-uploads.huggingface.co/production/uploads/697f2832c2c5e4daa93cece7/_3wmUNwARYIM8wXu_Q3YW.png
- Dataset Ultra-FineWeb-en: no disponible en la informacion proporcionada
- Dataset dclm_100BT-shuffled: no disponible en la informacion proporcionada
- Dataset UltraData-Code-L2: no disponible en la informacion proporcionada
- Paper o blog tecnico de SupraLabs: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
