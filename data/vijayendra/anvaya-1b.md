# Vijayendra/Anvaya-1B

## Resumen

Anvaya-1B es un modelo de lenguaje denso de tipo decoder-only con 1.018.126.848 parametros, desarrollado por Vijayendra Dwari como parte de un proyecto educativo de sistemas: el preentrenamiento desde cero de un modelo de escala billon en dos GPU NVIDIA Tesla T4 de 16 GB. El modelo se entrena sobre datos de FineWeb y emplea PyTorch FSDP en modo `FULL_SHARD` como estrategia de distribuicion. No es un modelo afinado ni alineado: es un checkpoint de preentrenamiento en una fase temprana.

El checkpoint publico actual corresponde al hito de 160M de tokens de entrada (update 1225), aproximadamente el 10,7 % del objetivo planificado de 1500M de tokens. La arquitectura es un transformer denso con 29 bloques, anchura 1536, 24 cabezas de atencion, FFN de 6144 y embeddings de entrada/salida atados. El contexto es de 4096 tokens y el vocabulario de 128.256 entradas, reutilizando el tokenizador de `meta-llama/Llama-3.2-1B`.

Su relevancia es fundamentalmente metodologica y educativa: documenta de forma reproducible como entrenar un modelo de mil millones de parametros con hardware de consumo/prosumer, incluyendo el archivo de checkpoints reanudables con estado del optimizador y del GradScaler. No esta pensado para produccion ni para tareas de alta exigencia; su valor esta en la receta de entrenamiento y en la trazabilidad de las metricas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (29 bloques, RMSNorm, atencion causal SDPA, RoPE half-split, MLP GELU de dos capas, embeddings atados) |
| Parametros totales | 1.018.126.848 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | No disponible (export publico en FP16; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible (entrenado sobre FineWeb, predominantemente ingles) |
| Licencia | `other` (codigo de entrenamiento MIT; licencia de pesos pendiente de seleccion) |
| Formato de pesos | Safetensors (FP16), mas codigo de arquitectura y tokenizer de referencia |
| Anchura del modelo | 1536 |
| Cabezas de atencion | 24 |
| Anchura FFN | 6144 |
| Vocabulario | 128.256 (EOS 128001) |
| Tokens de entrada vistos | 160.563.200 (hito 160M) |
| Hardware de entrenamiento | 2x Tesla T4 16 GB |
| Estrategia distribuida | PyTorch FSDP `FULL_SHARD` |
| Tamano del repo | 2,1 GB |

## Arquitectura y entrenamiento

Anvaya-1B es un transformer denso decoder-only que replica la arquitectura del entrenador publico del proyecto. Cada uno de los 29 bloques usa RMSNorm, atencion causal implementada con `torch.nn.functional.scaled_dot_product_attention`, RoPE con reparto half-split y un MLP estandar de dos capas con activacion GELU. La matriz de embeddings de entrada y la proyeccion de salida estan atadas, lo que reduce el recuento de parametros efectivos. El modelo no implementa KV cache en el codigo de referencia, por lo que la generacion autoregresiva es ineficiente en inferencia.

El entrenamiento se realiza sobre datos tokenizados de FineWeb (`HuggingFaceFW/fineweb`, revision `v1.4.0`, config `CC-MAIN-2025-26`). El corpus historico contiene 1.485M de tokens de entrenamiento y 15M de validacion. El muestreador usa ventanas deterministas de 4096 tokens con reemplazo, de modo que el recuento de tokens reportado es un libro mayor de tokens de entrada al modelo, no un conteo de tokens unicos. El checkpoint publico se ha entrenado con FSDP `FULL_SHARD` sobre dos T4 de 16 GB y exporta pesos en FP16. No se documenta RLHF, DPO ni ninguna fase de alineacion; es exclusivamente preentrenamiento.

La innovacion tecnica principal no esta en el modelo sino en la infraestructura: la receta reproducible para preentrenar desde inicializacion aleatoria un modelo de mil millones de parametros en hardware de 16 GB por GPU, con checkpoints reanudables que incluyen modelo, optimizador, `GradScaler` y estado distribuido. Las metricas de validacion tras reanudar limpiamente desde el update 1225 son NLL 4,7507, perplejidad 115,67 y precision de token 25,21 % sobre 131.072 tokens de validacion.

## Capacidades

- Generacion de texto autoregresiva basica: continuacion de texto y next-token prediction sobre contexto de 4096 tokens.
- Modelado de lenguaje en ingles principalmente, dado el origen del corpus FineWeb (CC-MAIN-2025-26).
- No dispone de tool calling ni function calling: no se ha entrenado ni documentado para ello.
- No dispone de capacidades de agente ni de razonamiento multi-paso; es un checkpoint de preentrenamiento sin alineacion.
- No dispone de modo thinking, vision, audio ni multimodalidad.
- Capacidades multilingues no documentadas; el tokenizador de Llama 3.2 cubre varios idiomas, pero el entrenamiento observado es fundamentalmente ingles.
- No implementa KV cache en el codigo de referencia, lo que limita el rendimiento en generacion larga.

## Casos de uso

- Estudio de recetas de preentrenamiento a escala billon: el proyecto documenta paso a paso el uso de FSDP `FULL_SHARD`, el particionado de estado y la reanudacion de checkpoints en 2x T4, util para investigadores que quieran replicar el proceso con hardware limitado.
- Docencia en sistemas distribuidos de ML: sirve como ejemplo concreto de libro mayor de tokens, ventanas deterministas de 4096 tokens y metricas de validacion reproducibles (NLL, perplejidad, precision de token).
- Experimentacion con tokenizadores de Llama 3.2: al reutilizar el vocabulario de `meta-llama/Llama-3.2-1B`, permite comparar el efecto del vocabulario en modelos entrenados desde cero con el mismo tokenizador.
- Base para fine-tuning posterior: al ser un checkpoint denso de 1B en safetensors FP16, puede servir como punto de partida para experimentos de ajuste supervisado en tareas acotadas, siempre que se asuma su infraentrenamiento.
- Investigacion sobre curvas de escalado: los hitos planificados (160M, 250M, 500M, 1B, 1,5B tokens) permiten estudiar la evolucion de la perplejidad y la precision de token a lo largo del entrenamiento.
- Reproduccion de infraestructura con presupuesto reducido: el archivo de checkpoint reanudable en Kaggle (modelo, optimizador, GradScaler y estado distribuido) permite retomar el entrenamiento exactamente donde se dejo, util para laboratorios sin acceso a clústeres grandes.
- Referencia para comparativas de eficiencia: util para medir el coste real de entrenar un 1B denso en T4 frente a alternativas en A100/H100, con datos de tokens vistos y metricas de validacion publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que las metricas reportadas son de next-token sobre la muestra de validacion fija del proyecto, no resultados de benchmarks downstream.

| Metrica de validacion | Valor |
|---|---|
| NLL | 4,7507029250 |
| Perplejidad | 115,6655602 |
| Precision de token | 0,2520523071 (25,21 %) |
| Tokens de validacion | 131.072 |
| Update del checkpoint | 1225 |
| Tokens de entrada vistos | 160.563.200 |

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,0-2,1 GB solo para pesos (1.018M de parametros x 2 bytes), mas activaciones y overhead del runtime; en la practica se recomienda al menos 4-6 GB para contexto completo de 4096 tokens.
- VRAM estimada en FP32: aproximadamente 4,1 GB solo para pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 con contexto completo; Tesla T4 16 GB, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 y H100 son suficientes.
- Cabe en GPU de consumo: si, en modelos como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y equivalentes con 8 GB o mas.
- Opciones de despliegue: el codigo de referencia usa PyTorch con `transformers` (`AutoTokenizer`) y un modulo `modeling_anvaya` con la clase `Anvaya1B`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; al no implementar KV cache, el despliegue en servidores de inferencia estandar requeriria trabajo adicional.
- Latencia y throughput: no disponibles. La ausencia de KV cache implica recalculo completo del contexto en cada paso de generacion, lo que degrada el throughput de forma significativa respecto a implementaciones con cache.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| Anvaya-1B | 1.018M | 4096 | `other` (pesos) / MIT (codigo) | Checkpoint temprano (160M tokens) | Entrenado en 2x T4, sin alineacion, sin KV cache |
| Llama 3.2 1B | 1.240M (aprox.) | 128.000 | Llama 3.2 Community License | Modelo final alineado | Tokenizador compartido; requiere aceptacion de licencia |
| TinyLlama 1.1B | 1.100M (aprox.) | 2048 | Apache 2.0 | Modelo final (3T tokens) | Entrenado sobre 3T tokens, con receta publica |
| SmolLM2 1.7B | 1.700M (aprox.) | 8192 | Apache 2.0 | Modelo final alineado | Mayor escala y contexto; orientado a despliegue |

La comparacion debe interpretarse con cautela: Anvaya-1B es un checkpoint de preentrenamiento con 160M tokens vistos, mientras que las alternativas son modelos finales con billones de tokens y fases de alineacion. No se dispone de benchmarks comparables publicados por el autor.

## Limitaciones y advertencias

- Checkpoint temprano e infraentrenado: aproximadamente el 10,7 % del objetivo planificado de 1500M de tokens de entrada.
- Sin suite de benchmarks downstream publicada; las metricas reportadas son de next-token sobre validacion fija.
- Sin KV cache en el codigo de referencia: la generacion es ineficiente y no esta optimizada para servir.
- No es una receta de 1B optima en computo (compute-optimal); el objetivo del proyecto es educativo.
- Las salidas pueden ser inexactas, incoherentes, sesgadas o inseguras; no debe usarse para decisiones de alto riesgo.
- Sesgos conocidos: no documentados explicitamente, pero heredables del corpus FineWeb (CC-MAIN-2025-26) en ingles.
- Riesgo de alucinacion: alto, dado el estado de preentrenamiento y la ausencia de alineacion.
- Limitaciones de idioma: el entrenamiento observado es fundamentalmente en ingles; el soporte multilingue no esta documentado.
- Restricciones de licencia: los pesos se publican como `license: other` hasta que se seleccione una licencia dedicada; el codigo de entrenamiento es MIT; los archivos del tokenizador conservan los terminos de Llama 3.2. Nada anula los terminos de terceros de dataset y tokenizador. Verificar antes de uso comercial.
- El recuento de tokens es un libro mayor de tokens de entrada (ventanas con reemplazo), no un conteo de tokens unicos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Vijayendra/Anvaya-1B
- Repositorio de entrenamiento y documentacion: https://github.com/VijayendraDwari/pretrain-1b-on-2xT4
- Checkpoint reanudable en Kaggle: https://www.kaggle.com/datasets/vijayendrad/dense-1b-do
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Tokenizador de referencia: https://huggingface.co/meta-llama/Llama-3.2-1B
