# Taykhoom/structRFM

## Resumen

structRFM es un modelo de lenguaje especializado en ARN (RNA) desarrollado originalmente por el grupo de Heqin Zhu y portado a Hugging Face por Taykhoom. Se trata de un codificador BERT de 12 capas y 768 dimensiones de embedding (86 millones de parametros en total, incluyendo la cabeza MLM) entrenado con un objetivo de enmascaramiento guiado por estructura secundaria (SgMLM) sobre aproximadamente 21 millones de secuencias de RNAcentral. El modelo no genera texto: produce representaciones contextualizadas de nucleotidos y predicciones de tokens enmascarados, lo que lo convierte en una base para tareas de biologia computacional del ARN.

La relevancia de este port concreto reside en la correccion del pipeline de tokenizacion. El repositorio original expone los pesos como un `BertForMaskedLM` estandar, pero su tokenizador carece de normalizador y plantilla de post-procesado: llamar directamente a `AutoTokenizer` sobre una secuencia no anade los tokens `[CLS]`/`[SEP]` y mapea `T` y las bases en minuscula a `[UNK]`. Este port aplica el preprocesado del codigo upstream (mayusculas, `T`->`U`, envoltura con `[CLS] ... [SEP]`) dentro del propio tokenizador, de modo que `tokenizer(seq)` produce exactamente los ids con los que se entreno el modelo. Ademas anade soporte para `flash_attention_2` y `sdpa`.

Los pesos son identicos bit a bit al release upstream v0.0.8, verificado en los 13 niveles de representacion (embedding mas 12 bloques) y en los logits MLM con diferencia absoluta maxima de 0.00 sobre GPU H100. La licencia es MIT, lo que facilita su uso comercial y su integracion en pipelines de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT encoder Post-LN (transformer) |
| Parametros totales | 86.059.786 (85,5M encoder + 0,6M cabeza MLM) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 nucleotidos (514 tokens con `[CLS]` y `[SEP]`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (secuencias de ARN; alfabeto A, U, C, G, N) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Capas | 12 |
| Cabezas de atencion | 12 |
| Dimension de embedding | 768 |
| Dimension oculta FFN | 3072 (GELU) |
| Tamano de vocabulario | 10 |
| Codificacion posicional | absoluta aprendida |
| Normalizacion | LayerNorm (post-residual, eps=1e-12) |
| Vocabulario | `[UNK]`=0, `[CLS]`=1, `[SEP]`=2, `[PAD]`=3, `[MASK]`=4, `A`=5, `U`=6, `C`=7, `G`=8, `N`=9 |
| Tamano del repo | 0,3 GB |
| Pipeline | fill-mask |

## Arquitectura y entrenamiento

El modelo es un transformer encoder tipo BERT en configuracion Post-LN: 12 capas, 12 cabezas de atencion, dimension de embedding 768 y FFN de 3072 con activacion GELU. La codificacion posicional es absoluta y aprendida, con un maximo de 512 nucleotidos de entrada (514 tokens contando los especiales). El vocabulario es minimo, de 10 entradas, lo que refleja la naturaleza del dominio: solo las cuatro bases del ARN mas `N` (base desconocida) y los tokens estructurales de BERT. Cualquier otro caracter, incluidos espacios en blanco, se mapea a `[UNK]`, igual que en el codigo upstream.

El preentrenamiento emplea enmascaramiento guiado por estructura (SgMLM): en cada lote se aplica o bien el enmascaramiento estandar del 15% de tokens, o bien un enmascaramiento estructural en el que al enmascarar una base emparejada tambien se enmascara su pareja. La proporcion de lotes con enmascaramiento estructural sigue una planificacion a lo largo del entrenamiento. Los datos son aproximadamente 21 millones de secuencias de RNAcentral de hasta 512 nucleotidos, emparejadas con estructuras secundarias predichas por MUSES, un ensemble multi-fuente de predictores termodinamicos, probabilisticos y de aprendizaje profundo. El checkpoint portado es el v0.0.8, que reentreno sobre estructuras del ensemble MUSES y sustituyo al v0.0.3 (entrenado con el predictor unico BPfold). No se menciona en la informacion disponible el uso de RLHF ni DPO; el objetivo es exclusivamente MLM.

## Capacidades

- Generacion de embeddings contextualizados por nucleotido (768 dimensiones) y a nivel de secuencia mediante pooling de la representacion `[CLS]` o media sobre nucleotidos.
- Prediccion de tokens enmascarados (fill-mask) sobre secuencias de ARN, util para imputacion de bases y analisis de motivos.
- Representaciones de capas intermedias accesibles via `output_hidden_states=True` para sondear propiedades estructurales a distintas profundidades.
- Procesamiento de secuencias de hasta 512 nucleotidos por ventana; secuencias mas largas requieren fragmentacion en ventanas de 512 nt y pooling posterior.
- Acepta entrada en ADN (con `T`) gracias a la normalizacion `T`->`U` integrada en el tokenizador.
- Soporte de backends de atencion `eager`, `sdpa` y `flash_attention_2` (este ultimo en bfloat16 y requiriendo el paquete `flash-attn`).
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, vision ni audio.
- No es un modelo generativo de texto libre: su salida es un vector por token y logits sobre un vocabulario de 10 simbolos.

## Casos de uso

- Extraccion de embeddings de ARN para busqueda de similitud y agrupamiento: el modelo produce un vector de 768 dimensiones por secuencia (via `[CLS]` o media enmascarada), adecuado para construir indices vectoriales y recuperar secuencias funcionalmente relacionadas sin alineamiento multiple.
- Anotacion de estructura secundaria: los checkpoints downstream del autor (`structRFM_SSP_bpRNA1m.pt`, `structRFM_SSP_RNAStrAlign.pt`) anaden cabezas de prediccion sobre las features del encoder; este repositorio sirve como extractor de representaciones congeladas para esas tareas.
- Prediccion de elementos regulatorios e IRES: los checkpoints de IRES del autor reutilizan las mismas features del encoder, por lo que este port es la base para clasificar regiones de entrada ribosomal interna.
- Imputacion de bases desconocidas o mutaciones: mediante la cabeza MLM se pueden puntuar sustituciones en posiciones concretas y priorizar variantes candidatas en estudios de ARN no codificante.
- Clasificacion de familias de ARN no codificante: fine-tuning de una cabeza ligera sobre los embeddings congelados para discriminar tipos funcionales (tRNA, rRNA, miRNA, lncRNA) en pipelines de anotacion genomica.
- Analisis de estructura terciaria: los checkpoints de estructura terciaria del autor operan sobre las mismas features del encoder, de modo que este modelo actua como etapa de representacion en pipelines de plegamiento.
- Preentrenamiento inicial para dominios especificos: al ser un BERT pequeno (86M) con licencia MIT, sirve como inicializacion para fine-tuning en tareas de ARN con datos limitados.
- Procesamiento por ventanas de transcritos largos: fragmentacion en bloques de 512 nt y pooling de embeddings para representar ARN mensajeros completos en modelos downstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente documenta la verificacion de paridad numerica: los 13 niveles de representacion y los logits MLM son identicos bit a bit (diferencia absoluta maxima 0.00) frente a los pesos v0.0.8 originales ejecutados con el codigo upstream, con atencion `eager` y `sdpa`, en lotes con y sin padding, verificado en NVIDIA H100 con PyTorch 2.7 y CUDA 12.9. No se aportan metricas de tareas downstream (por ejemplo, exactitud en prediccion de estructura secundaria o IRES).

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,35 GB para los pesos (86M parametros) mas activaciones; en fp16/bf16 baja a unos 0,17 GB de pesos.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060 (12 GB), RTX 4070, RTX 4090, e incluso en GPUs de 4-6 GB o en CPU para lotes pequenos.
- GPUs recomendadas para produccion a gran escala: A100, H100 o L40S si se procesan millones de secuencias; el cuello de botella sera el throughput de tokenizacion y E/S, no la memoria.
- Despliegue via `transformers` con `AutoModel` o `AutoModelForMaskedLM`; no se documentan integraciones especificas con vLLM, llama.cpp, Ollama ni TGI (estos motores estan orientados a generacion autoregresiva y no aplican a un encoder MLM).
- Backends de atencion: `eager` por defecto, `sdpa` recomendado para produccion (PyTorch 2.0+) y `flash_attention_2` para secuencias largas con bfloat16, requiriendo `flash-attn`.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dado el tamano, se espera procesamiento de lotes grandes en milisegundos por lote en GPU moderna, pero no se aportan cifras medidas.
- Requiere `trust_remote_code=True` por el codigo personalizado del tokenizador y del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| structRFM (este port) | 86M | 512 nt | ARN, estructura secundaria | MIT | Hugging Face |
| heqin-zhu/structRFM (upstream) | 86M | 512 nt | ARN, estructura secundaria | MIT | Hugging Face |
| structRFM v0.0.3 (anterior) | 86M | 512 nt | ARN, estructuras BPfold | MIT | Sustituido por v0.0.8 |
| Modelos BERT de ARN genericos | no disponible | no disponible | ARN | no disponible | no disponible |

La comparacion con otros modelos de ARN de la misma categoria (por ejemplo, RNA-FM, RiNALMo o DNABERT adaptado) no esta disponible en la informacion proporcionada, por lo que no se aportan cifras de parametros, contexto ni rendimiento de esos sistemas.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto ni secuencias, solo embeddings y logits de enmascaramiento sobre un vocabulario de 10 simbolos.
- Contexto maximo de 512 nucleotidos; secuencias mas largas deben fragmentarse en ventanas y agregarse, lo que puede perder dependencias de largo alcance.
- Cualquier caracter fuera del alfabeto A/U/C/G/N (incluido espacio en blanco) se mapea a `[UNK]`, lo que puede degradar representaciones si la entrada no esta normalizada.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; conviene auditar antes de desplegar en entornos sensibles.
- Riesgo de alucinacion no aplica en el sentido generativo, pero las predicciones MLM y las estructuras secundarias derivadas son probabilidades y pueden ser incorrectas; las estructuras de entrenamiento son predicciones de ensemble (MUSES), no determinaciones experimentales, lo que introduce sesgo del predictor.
- Sesgos de dominio: entrenado sobre RNAcentral, con posible sobrerrepresentacion de familias abundantes y menor cobertura de ARN exotico o de organismos poco secuenciados.
- No se documentan evaluaciones de sesgo, robustez ni calibracion; no hay benchmarks downstream publicados en la informacion disponible.
- Licencia MIT permite uso comercial, pero el modelo upstream y los datos de RNAcentral tienen sus propias condiciones que conviene revisar para produccion.
- El checkpoint v0.0.8 sustituyo al v0.0.3; resultados obtenidos con el anterior no son directamente comparables.

## Enlaces

- Repositorio Hugging Face (este port): https://huggingface.co/Taykhoom/structRFM
- Modelo upstream: https://huggingface.co/heqin-zhu/structRFM
- Coleccion structRFM: https://huggingface.co/collections/Taykhoom/structrfm-6aebd71d994e3b036c62ed23
- Release upstream v0.0.8: https://github.com/heqin-zhu/structRFM/releases/tag/v0.0.8
- Repositorio GitHub upstream: https://github.com/heqin-zhu/structRFM
