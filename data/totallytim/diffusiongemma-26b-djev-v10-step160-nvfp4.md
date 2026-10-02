# totallytim/diffusiongemma-26b-djev-v10-step160-NVFP4

## Resumen

El modelo `totallytim/diffusiongemma-26b-djev-v10-step160-NVFP4` es una cuantizacion NVFP4 del fine-tune `snowicarus/diffusiongemma-26b-djev-v10-step160`, que a su vez deriva de `google/diffusiongemma-26B-A4B-it`. Es, por tanto, un modelo de lenguaje de difusion multimodal (entrada de texto e imagen, pipeline `image-text-to-text`) especializado en decisiones probabilisticas tipadas, del estilo Jev / System One. Lo publica un tercero, el usuario totallytim, y no es un lanzamiento de Google ni de NVIDIA.

La relevancia de este checkpoint es de formato y despliegue: reduce el peso de 49 GB a 18 GB (18,9 GB de repositorio) para que quepa en una GPU de 32 GB, con 22,6 GB de VRAM medidas tras la carga en una RTX 5090. La receta de cuantizacion replica la de `nvidia/diffusiongemma-26B-A4B-it-NVFP4`: NVFP4 solo en los pesos de los expertos MoE, cache KV en FP8 y el resto en BF16, conservando los 47.067 nombres de tensor del checkpoint de NVIDIA, de modo que cualquier motor que cargue el de NVIDIA carga este.

El dato real de safetensors declara 14.404.788.588 parametros (unos 14,4 mil millones), cifra que no coincide con el "26B" del nombre del modelo; no se explica esa discrepancia en la informacion disponible. La evaluacion publica del autor se limita a tareas de decision estructurada y no cubre generacion de texto libre ni chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje de difusion (`diffusion-language-model`) con capas de decodificador y mezcla de expertos (MoE); pesos de expertos cuantizados a NVFP4 |
| Parametros totales | 14.404.788.588 segun safetensors (el nombre del modelo indica 26B; discrepancia no explicada en la informacion disponible) |
| Parametros activos | 4 mil millones segun la nomenclatura "A4B" del modelo base; no confirmado en la informacion disponible |
| Longitud de contexto | no disponible (el "canvas" de 64 tokens citado en la model card es el lienzo de difusion, no la ventana de contexto) |
| Tipos de cuantizacion | NVFP4 en pesos de expertos MoE, cache KV en FP8, resto en BF16 (receta `nvfp4_experts_only` de NVIDIA Model Optimizer); el repositorio esta etiquetado tambien como "8-bit" |
| Idiomas soportados | no disponible (la evaluacion publica cubre ingles y aleman) |
| Licencia | Apache-2.0, con los terminos de Gemma 4 enlazados por el autor (`https://ai.google.dev/gemma/docs/gemma_4_license`) |
| Formato de pesos | safetensors (checkpoint cuantizado, 18,9 GB de repositorio); compatible con `transformers` y vLLM |

## Arquitectura y entrenamiento

Se trata de un modelo de difusion para lenguaje con mezcla de expertos. El checkpoint original, `google/diffusiongemma-26B-A4B-it`, corresponde a la familia DiffusionGemma de Google, con un decodificador que en `transformers` (version 5.14) rechaza `config.use_cache`, detalle relevante porque obligo a aplicar un parche de tres lineas durante la cuantizacion. El fine-tune de `snowicarus` adapta el modelo base a decisiones probabilisticas tipadas, con preguntas al estilo Jev / System One, y la cuantizacion de totallytim no modifica el entrenamiento: solo cambia el formato de los pesos.

El proceso de cuantizacion se hizo con NVIDIA Model Optimizer (commit `d0142c9dcad8f456caa482407960dc9cb5f0e710`, receta `model_type/diffusion_gemma/ptq/nvfp4_experts_only`) en una H200 de 141 GB; la sonda de batch size alcanzo 127 GB. La calibracion uso 128 muestras de `cnn_dailymail`, en lugar del dataset `nvidia/Nemotron-Post-Training-Dataset-v2` que empleo NVIDIA, por estar restringido. El proceso completo tarda unos 20 minutos en una H200. Durante la exportacion, la herramienta escribio los expertos NVFP4 empaquetados y ademas conservo 60 tensores BF16 fusionados (`model.decoder.layers.N.experts.down_proj` y `gate_up_proj`, 61 GB en total), que se eliminaron con el script `quantization/drop-fused-experts.py`. La informacion disponible no detalla el numero de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Decisiones estructuradas tipadas: el modelo esta ajustado para responder preguntas de clasificacion y decision con un tipo declarado y un grado de certeza, no para generar texto libre.
- Politica de lectura adaptativa: puede emitir una lectura y hasta tres lecturas adicionales cuando la primera es incierta (3,36 lecturas por caso de texto en la configuracion por defecto del servidor Jev).
- Procesamiento de texto e imagen: el pipeline declarado es `image-text-to-text`, con resultados medidos en tareas de decision sobre imagenes.
- Clasificacion de lenguaje natural y parafrasis: evaluado en XNLI, PAWS-X y STS-B.
- Clasificacion de intenciones y resenas: evaluado en MASSIVE y resenas de Amazon.
- Respuesta a preguntas de si/no: evaluado en BoolQ.
- Clasificacion de imagenes y documentos: evaluado en tipos documentales de RVL-CDIP e Imagenette.
- Multilingue: la evaluacion publica cubre ingles y aleman; no hay datos de otros idiomas.
- Tool calling, function calling y razonamiento multi-paso en agentes: no disponible en la informacion proporcionada.

## Casos de uso

- Clasificacion de documentos en pipelines de digitalizacion: el modelo distingue tipos documentales (evaluado sobre categorias de RVL-CDIP con un 87,2% de acierto), por lo que puede enrutar facturas, contratos o formularios a la cola de proceso correspondiente dentro de un sistema de gestion documental.
- Enrutamiento de tickets de soporte: con tasas medidas en clasificacion de intenciones (MASSIVE) y resenas, es adecuado para asignar automaticamente cada solicitud a un departamento, aprovechando que devuelve una decision tipada en lugar de texto abierto.
- Moderacion y triaje con umbral de confianza: al tener un error de calibracion de 0,109 en diez bins, sus probabilidades declaradas son utilizables para derivar a revision humana solo los casos por debajo de un umbral.
- Deduplicacion y deteccion de parafrasis: evaluado en PAWS-X, sirve para detectar duplicados casi identicos en catalogos, bases de conocimiento o corpus de entrenamiento.
- Analisis de sentimiento y de resenas de producto: evaluado sobre resenas de Amazon, es aplicable a la extraccion de polaridad a escala sin necesidad de generar texto.
- Verificacion de afirmaciones frente a un contexto (NLI): con un 83,0% en XNLI, encaja en sistemas de comprobacion de hechos donde la salida debe ser una etiqueta de implicacion, contradiccion o neutralidad.
- Clasificacion de imagenes en control de calidad: evaluado en Imagenette con un 87,2% de acierto en decisiones sobre imagen, util para filtrado visual previo en cadenas de inspeccion.
- Servicio de decision de baja latencia en una sola GPU: al ocupar 22,6 GB de VRAM en una RTX 5090 con lienzo de 64 tokens, 32 secuencias y un pool KV de 2 GiB, puede desplegarse en hardware de gama alta para consumo en produccion.
- Enrutamiento con presupuesto de computo variable: su politica adaptativa de lecturas permite gastar mas computo solo en los casos ambiguos, lo que reduce el coste medio frente a un esquema de inferencia fijo.

## Benchmarks y rendimiento

Resultados publicados por el autor del checkpoint, comparados con `nvidia/diffusiongemma-26B-A4B-it-NVFP4` y ejecutados en el mismo motor, el mismo dia, con la politica de muestreo por defecto de un servidor estructurado estilo Jev (una lectura, y hasta tres mas si la primera es incierta):

| Prueba | Este checkpoint | nvidia/diffusiongemma-26B-A4B-it-NVFP4 |
|---|---:|---:|
| Decisiones de texto, 2.800 casos (XNLI, PAWS-X, STS-B, MASSIVE, resenas de Amazon, BoolQ; ingles y aleman) | 74,3% | 74,8% |
| XNLI solo, 500 casos | 83,0% | 79,6% |
| Decisiones sobre imagen, 640 casos (tipos documentales RVL-CDIP, Imagenette) | 87,2% | 87,3% |
| Error de calibracion en los casos de texto (diez bins) | 0,109 | 0,154 |
| Lecturas por caso de texto bajo esa politica | 3,36 | 2,77 |

La diferencia en el conjunto global de texto no es significativa (McNemar emparejado, p = 0,51). XNLI es la unica tarea que difiere con p < 0,05. No se midieron: el fine-tune en BF16 (por lo que se desconoce la precision perdida por la cuantizacion), JevBench ni el conjunto de decisiones tipadas reportado por el autor del fine-tune, el efecto del conjunto y tamano de calibracion, ni la generacion de texto plano y chat.

## Requisitos de hardware

- VRAM estimada: 22,6 GB tras la carga, medidos en una RTX 5090 con lienzo de 64 tokens, 32 secuencias y un pool KV de 2 GiB.
- Peso del checkpoint: 18,9 GB de repositorio (18 GB de pesos) frente a los 49 GB del fine-tune en BF16, que exigiria mas de 49 GB de VRAM solo para pesos.
- GPU recomendadas: una RTX 5090 basta para la configuracion medida. El checkpoint esta pensado explicitamente para caber en una GPU de 32 GB. Para el checkpoint BF16 original haria falta una GPU de 48-80 GB (A100 80 GB, H100) o reparto multi-GPU.
- Compatibilidad con GPU de consumo: si, en tarjetas con al menos 32 GB de VRAM y soporte de NVFP4; no hay datos publicados para GPUs de 24 GB o menos.
- Motor de despliegue probado: vLLM `0.29.1rc1.dev573+ge97573215` (nightly `e9757321`), que incorpora las lecturas estructuradas de DiffusionGemma, con backend MoE NVFP4 `FLASHINFER_CUTLASS` y atencion Triton. Cargo sin cambios.
- Otros motores: llama.cpp, Ollama y TGI no aparecen documentados para este checkpoint en la informacion disponible.
- Latencia y throughput: no disponible en terminos absolutos; el dato indirecto es que el fine-tune necesita 3,36 lecturas por caso de texto frente a 2,77 del modelo de NVIDIA, por lo que resulta mas lento bajo una politica de lectura adaptativa.
- Coste de produccion del checkpoint: unos 20 minutos en una H200 para reproducir la cuantizacion completa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y tamano | Rendimiento medido (texto / imagen) | Licencia |
|---|---|---|---|---|---|
| totallytim/diffusiongemma-26b-djev-v10-step160-NVFP4 (este) | 14.404.788.588 segun safetensors | no disponible | safetensors NVFP4, 18,9 GB | 74,3% / 87,2% | Apache-2.0 + terminos Gemma 4 |
| nvidia/diffusiongemma-26B-A4B-it-NVFP4 | no disponible en la informacion | no disponible | safetensors NVFP4, 47.067 tensores identicos | 74,8% / 87,3% | no disponible en la informacion |
| snowicarus/diffusiongemma-26b-djev-v10-step160 (fine-tune en BF16) | 26B nominales | no disponible | BF16, 49 GB | no medido en esta comparativa | Apache-2.0 + terminos Gemma 4 |
| google/diffusiongemma-26B-A4B-it | 26B (A4B) | no disponible | no disponible | no disponible | terminos Gemma 4 |

La comparativa se limita a los modelos citados en la informacion disponible; no hay datos de pesos ni de contexto de las alternativas, ni benchmarks de terceros.

## Limitaciones y advertencias

- Riesgo de alucinacion: no se ha evaluado la generacion de texto libre ni el chat, por lo que el comportamiento generativo del modelo es desconocido.
- Sesgos: no hay evaluacion de sesgos ni de equidad en la informacion disponible.
- Cobertura de idiomas limitada en la evaluacion: los 2.800 casos de decision de texto son en ingles y aleman; el resto de idiomas no esta medido.
- Calibracion imperfecta: un error de calibracion de 0,109 en diez bins implica que las probabilidades declaradas deben tratarse con margen, especialmente en los extremos.
- Latencia bajo politica adaptativa: necesita mas lecturas que el modelo de NVIDIA (3,36 frente a 2,77 por caso de texto), lo que penaliza el coste por peticion si se usa la misma politica de lectura.
- Precision perdida por cuantizacion: desconocida, porque el fine-tune en BF16 nunca se ejecuto en la misma comparativa.
- Efecto de la calibracion: se uso un unico dataset (`cnn_dailymail`, 128 muestras); no se midio como afecta el conjunto ni su tamano a la calidad final.
- Modelo de terceros: no es un lanzamiento oficial de Google ni de NVIDIA, y su autor no es el autor del fine-tune. La trazabilidad depende de los scripts incluidos en `quantization/`.
- Licencia: Apache-2.0 con los terminos y la politica de usos prohibidos de Gemma 4 heredados del modelo base; es imprescindible revisarlos antes de un uso comercial.
- Cambios de formato: el checkpoint conserva la lista de ignorados del lanzamiento de NVIDIA en `config.json` y `hf_quant_config.json`, y los archivos exportados originales quedan en `quantization/`, lo que conviene verificar si se integra en un pipeline propio.
- Requisito de motor: depende de una nightly concreta de vLLM para las lecturas estructuradas de DiffusionGemma; otras builds pueden no cargarlo.

## Enlaces

- Checkpoint en HuggingFace: https://huggingface.co/totallytim/diffusiongemma-26b-djev-v10-step160-NVFP4
- Modelo base del que se cuantiza: https://huggingface.co/snowicarus/diffusiongemma-26b-djev-v10-step160
- Checkpoint NVFP4 de referencia de NVIDIA: https://huggingface.co/nvidia/diffusiongemma-26B-A4B-it-NVFP4
- Modelo original: `google/diffusiongemma-26B-A4B-it` (referencia citada en la model card; no se ha proporcionado URL directa)
- Terminos de licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Revision concreta del modelo base citada por el autor: `858cc14441718ff52ea4dd6c9491d5316cc9834f`
- Material de cuantizacion incluido en el repositorio: directorio `quantization/` (script, log, commit y parche de la herramienta, `pip freeze` y hashes de la exportacion antes y despues de la reparacion), incluido `quantization/modelopt-commit-and-patch.txt` y `quantization/drop-fused-experts.py`
