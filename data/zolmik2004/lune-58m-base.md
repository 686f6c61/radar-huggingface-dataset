# ZolMik2004/Lune-58M-Base

## Resumen

Lune-58M-Base es un modelo base experimental de tipo vision-lenguaje desarrollado por el usuario ZolMik2004, orientado a ruso e inglés. Se trata de un modelo hibrido de 57,8 millones de parametros en su parte linguistica (con 16,8M de embeddings atados) que combina Gated DeltaNet y atencion con compuerta en una proporcion 3:1, al estilo de Qwen3.5, y que opcionalmente incorpora un codificador visual ViT de 25,9M de parametros destilado del tower de vision de Qwen3.8-27B. En total, el checkpoint completo suma 83.695.688 parametros y se carga con transformers estandar mediante la clase `Qwen3_5ForConditionalGeneration`, sin codigo personalizado.

El modelo resuelve dos tareas basicas: continuacion de texto en ruso e ingles, y descripcion o transcripcion de imagenes (y, de forma limitada, de video). No es un modelo de chat: no incorpora razonamiento multi-paso, tool calling ni dialogo instruido, capacidades que el autor reserva para su variante Lune-58M. Su relevancia actual es principalmente como experimento de arquitectura: demuestra que un modelo hibrido de atencion lineal y atencion completa puede entrenarse en hardware de consumo (una Apple M2 Max para el modelo de lenguaje y una GTX 1060 para las caracteristicas del profesor visual) y desplegarse en Apple Silicon mediante MLX.

Con 16.384 tokens de contexto, vocabulario de 32.768 tokens BPE byte-level, precision bfloat16 y licencia Apache 2.0, Lune-58M-Base se posiciona como una pieza de investigacion reproducible y de bajo coste, mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: Gated DeltaNet + atencion con compuerta, patron `[GDN, GDN, GDN, Attention] × 3` (12 capas); clase `Qwen3_5ForConditionalGeneration` |
| Parametros totales | 83.695.688 (57,8M de lenguaje, incluidos 16,8M de embeddings atados, + 25,9M de vision) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | No disponible (el modelo se distribuye en bfloat16) |
| Idiomas soportados | Ruso, ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo de lenguaje consta de 12 capas con dimension oculta 512 y FFN SwiGLU de 1408. Nueve de las doce capas usan Gated DeltaNet (atencion lineal con 4 cabezas de 128 dimensiones y convolucion causal de tamano 4) y cada cuarta capa usa atencion completa con 4 cabezas de consulta y 2 de clave-valor de 128 dimensiones, QK-norm, MRoPE parcial al 25 % y compuerta de salida sigmoide. Esta mezcla 3:1 reduce el coste de atencion en secuencias largas manteniendo capacidad de recuperacion exacta en las capas con atencion completa. El codificador visual es un ViT de 12 capas y 384 dimensiones con 6 cabezas, parches de 16x16, fusion 2x2 hasta 512 dimensiones y RoPE 2D; procesa imagenes y video (2 fotogramas por segundo, codificados por pares con marca temporal).

El entrenamiento uso un corpus multilingue compuesto por FineWeb-EDU, FineWeb2-HQ, FineMath, instantaneas de Wikipedia en ruso (octubre de 2026) y en ingles (abril de 2026), FineVision y CC3M. La parte visual se entreno por destilacion de caracteristicas del tower de vision de Qwen3.8-27B, calculadas en una GTX 1060, mientras que el modelo de lenguaje se entreno integramente en una Apple M2 Max. El corte de conocimiento declarado es marzo de 2026 para ingles y septiembre de 2026 para ruso. No se especifica en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF o DPO (al ser un modelo base, es previsible que no las haya).

## Capacidades

- Continuacion de texto en ruso e ingles a partir de un prefijo, con arranque mediante `<|endoftext|>`.
- Descripcion de imagenes: el modelo continua una imagen con su pie de foto o con el texto escrito en ella.
- Transcripcion de texto presente en imagenes (por ejemplo, recibos o documentos renderizados).
- Procesamiento de video limitado: lee el texto de algunos fotogramas, sin comprension temporal ni respuesta a preguntas sobre el video.
- Procesamiento multimodal con imagenes y video a traves del procesador (`AutoProcessor`) y tokens especiales `<|vision_start|>`, `<|image_pad|>`, `<|video_pad|>`, `<|vision_end|>`.
- Funcionamiento en modo solo texto si se carga unicamente el modelo de lenguaje (57,8M de parametros).
- Soporte de inferencia en Apple Silicon mediante MLX (`mlx-lm` y `mlx-vlm`), con divergencia KL media de 0,00005 frente a transformers en float32.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking; estas capacidades se reservan a la variante de chat Lune-58M.

## Casos de uso

- Transcripcion de recibos y documentos escaneados: el modelo puede leer el texto impreso en una imagen y devolverlo como continuacion, util para digitalizar tickets o formularios en un pipeline OCR ligero que quepa en un portatil.
- Generacion de pies de foto automaticos en ruso e ingles: adecuado para etiquetar lotes de imagenes en un CMS o una fototeca bilingue, dado su soporte nativo de ambos idiomas y su bajo coste de inferencia.
- Extraccion de texto de fotogramas de presentaciones o videos de diapositivas: el modelo lee el texto de algunos fotogramas, lo que permite indexar contenido textual de videos cortos sin un OCR dedicado.
- Prototipado e investigacion de arquitecturas hibridas: sirve como banco de pruebas reproducible para estudiar el comportamiento de Gated DeltaNet frente a atencion completa en un modelo de 12 capas entrenable en hardware de consumo.
- Fine-tuning ligero para tareas concretas: con 57,8M de parametros de lenguaje y licencia Apache 2.0, es viable ajustarlo en una sola GPU para clasificacion de texto, etiquetado o generacion de dominio especifico en ruso.
- Despliegue en Apple Silicon para demos locales: mediante MLX puede ejecutarse en un Mac con M2 Max o superior para demostraciones de continuacion de texto y descripcion de imagenes sin conexion.
- Generacion de texto bilingue ru-en de bajo coste: continuacion de articulos, descripciones de producto o resumenes cortos en escenarios donde el presupuesto de computo es minimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint completo en bfloat16 ocupa aproximadamente 0,17 GB de pesos (83,7M de parametros), por lo que cabe holgadamente en cualquier GPU con 2 GB o mas; el modelo de lenguaje solo en bfloat16 ronda los 0,12 GB.
- GPU recomendadas: cualquier GPU moderna es suficiente; una GTX 1060, una RTX 3060 o una RTX 4090 ejecutan el modelo sin problemas. El autor entreno el modelo de lenguaje en una Apple M2 Max y calculo las caracteristicas del profesor visual en una GTX 1060.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos, e incluso en CPU.
- Opciones de despliegue: transformers (`AutoModelForCausalLM`, `AutoModelForImageTextToText`, `AutoProcessor`), MLX (`mlx-lm` 0.32.2 y `mlx-vlm` 0.7.11 verificados por el autor) y, presumiblemente, cualquier runtime compatible con safetensors y transformers. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles. El unico dato de rendimiento publicado es la equivalencia numerica con MLX (divergencia KL media de 0,00005 frente a transformers en float32).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|---|
| Lune-58M-Base | 83,7M (57,8M LM + 25,9M vision) | 16.384 | Texto e imagen/video | ru, en | Apache 2.0 | Hibrido GDN + atencion, base sin instruir |
| SmolVLM-256M | 256M | 2.048 (aprox.) | Texto e imagen | en (principalmente) | Apache 2.0 | Vision-lenguaje pequeno de Hugging Face; mas parametros y sin soporte nativo de ruso declarado |
| Qwen2-VL-2B | 2B | 32.768 (aprox.) | Texto e imagen/video | multilingue | Apache 2.0 | Referencia de la familia Qwen; mucho mayor y con capacidades de chat |
| Moondream2 | 1,86B | 2.048 (aprox.) | Texto e imagen | en | Apache 2.0 | Modelo visual compacto orientado a descripcion de imagenes |

Los datos de SmolVLM-256M, Qwen2-VL-2B y Moondream2 provienen de conocimiento general y no de la informacion proporcionada; verifiquense antes de usarlos en una decision tecnica. La comparacion relevante es que Lune-58M-Base es entre uno y dos ordenes de magnitud mas pequeno que estas alternativas, a costa de no ofrecer dialogo instruido ni tool calling.

## Limitaciones y advertencias

- Es un modelo base: no sigue instrucciones, no mantiene dialogos y no responde preguntas; solo continua texto o describe imagenes.
- Riesgo elevado de repeticion en generacion codiciosa con imagenes; el autor recomienda `repetition_penalty=1.2`.
- No ha visto video durante el entrenamiento; ante un video solo lee el texto de algunos fotogramas y no responde preguntas sobre su contenido.
- Cobertura linguistica limitada a ruso e ingles; el rendimiento fuera de estos idiomas no esta documentado y previsiblemente sera deficiente.
- Ventana de contexto de 16.384 tokens, adecuada para documentos cortos pero insuficiente para corpus largos o conversaciones extensas.
- Riesgo de alucinacion inherente a un modelo de 57,8M de parametros con datos de entrenamiento acotados; las descripciones de imagenes pueden inventar detalles.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad o robustez; al entrenarse sobre FineWeb-EDU, FineWeb2-HQ y Wikipedia, hereda los sesgos de esas fuentes.
- Licencia Apache 2.0 permite uso comercial, pero al ser un modelo base sin garantias, cualquier despliegue en produccion requiere evaluacion propia y, probablemente, fine-tuning.
- El modelo se publico con 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de su calidad.
- No se especifican datos sobre cuantizacion (GGUF, AWQ, GPTQ), lo que limita las opciones de despliegue en runtimes distintos de transformers y MLX.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ZolMik2004/Lune-58M-Base
- Variante de chat: https://huggingface.co/ZolMik2004/Lune-58M
- Dataset FineWeb-EDU: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset FineWeb2-HQ: https://huggingface.co/datasets/epfml/FineWeb2-HQ
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset Wikipedia ruso (octubre 2026): https://huggingface.co/datasets/ZolMik2004/wikipedia-ru-20261001
- Dataset Wikipedia ingles (abril 2026): https://huggingface.co/datasets/NeuML/wikipedia-20260401
- Dataset FineVision: https://huggingface.co/datasets/HuggingFaceM4/FineVision
- Dataset CC3M: https://huggingface.co/datasets/pixparse/cc3m-wds
- Libreria MLX-LM: https://github.com/ml-explore/mlx-lm
- Libreria MLX-VLM: https://github.com/Blaizzy/mlx-vlm
