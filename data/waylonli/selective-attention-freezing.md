# waylonli/Selective-Attention-Freezing

## Resumen

Selective-Attention-Freezing es un repositorio de artefactos de investigación publicado por Weixian Waylon Li (School of Informatics, Universidad de Edimburgo) junto con Yintao Tai, Marcio Fonseca y Shay B. Cohen. No es un modelo único, sino un catálogo de checkpoints de evaluación asociados al trabajo «When Can Attention Heads Be Statically Defined?». El método propuesto, Selective Attention Freezing (SAF), estudia si determinadas cabezas de atención pueden fijarse de forma estática durante el entrenamiento sin degradar el rendimiento, un planteamiento relevante para reducir coste de entrenamiento y para entender la especialización funcional de las cabezas de atención.

El catálogo contiene modelos nanoGPT nativos de 124M y 1B parámetros, junto con sus adaptaciones downstream, variantes adaptadas a MQAR (Multi-Query Associative Recall) y controles con presupuesto equiparable (matched-token y matched-time). Los checkpoints se entrenan sobre HuggingFaceFW/fineweb-edu y se distribuyen tanto en estado nativo de PyTorch (`model.pt`) como en exportaciones BF16 verificadas. La subida es escalonada: el archivo `checkpoints.json` indica qué entradas tienen `status: uploaded`.

Es relevante ahora porque ofrece reproducibilidad verificable de un estudio de interpretabilidad y eficiencia de atención: cada exportación pasa comprobaciones estrictas de carga, preservación de tensores y comparación bit a bit de logits BF16 sobre una entrada CUDA fija de 64 tokens. El repositorio ocupa 307,5 GB, no declara licencia y no tiene descargas registradas, por lo que debe tratarse como material de investigación, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo nanoGPT (checkpoints nativos, no `AutoModel` de Transformers) |
| Parametros totales | Dos escalas: 124M y 1B |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen pesos BF16 y estado nativo; no se documentan formatos cuantizados) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (state dict nativo de nanoGPT); exportaciones en BF16 verificadas; no safetensors ni GGUF |

Otros datos del repositorio: ID `waylonli/Selective-Attention-Freezing`, autor `waylonli`, pipeline no disponible, 0 descargas, 1 like, creado el 2026-09-26 y actualizado el 2026-09-27, tamano del repo 307,5 GB. Dataset declarado: `HuggingFaceFW/fineweb-edu`.

## Arquitectura y entrenamiento

Los checkpoints siguen la receta nativa de nanoGPT, es decir, un transformer decoder-only con atención causal estándar. La contribución del trabajo no es una arquitectura nueva, sino una intervención sobre el entrenamiento: el congelado selectivo de cabezas de atención (Selective Attention Freezing), que determina qué cabezas pueden definirse de forma estática. El catálogo separa cohortes de intervención para poder aislar el efecto: receta nativa, controles con el mismo número de tokens (matched-token), controles con el mismo tiempo de cómputo (matched-time) e intervenciones posteriores (later-intervention).

El corpus de preentrenamiento es FineWeb-EDU. No se especifican en la información disponible el número exacto de tokens, la composición detallada del dataset ni si hubo fases de RLHF o DPO; dado que son modelos base de tipo nanoGPT orientados a evaluación, lo previsible es que no incluyan alineamiento por preferencias, pero esto no se confirma en la model card. En cuanto a rigor experimental, la model card advierte de dos extremos importantes: el estudio de preentrenamiento de 1B cuenta con una sola semilla, y las semillas de fine-tuning por tarea no constituyen semillas de preentrenamiento independientes. Los pesos base de Qwen y los artefactos de calibración de colaboradores no forman parte de esta release.

## Capacidades

- Generacion de texto en ingles: son modelos de lenguaje autorregresivos base, sin fine-tuning de instrucciones declarado.
- Evaluacion downstream: se distribuyen checkpoints adaptados especificamente para SST-2, BoolQ y QuALITY.
- Recuperacion asociativa: checkpoints adaptados a MQAR (Multi-Query Associative Recall), una tarea sintetica de recuperacion en contexto.
- Analisis de cabezas de atencion: el proposito central del artefacto es permitir experimentos de interpretabilidad sobre el congelado estatico de cabezas.
- Reproducibilidad verificable: exportaciones con comprobacion bit a bit de logits BF16 frente al checkpoint original.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no; el unico idioma declarado es ingles.
- Capacidades especiales (thinking mode, vision, audio): no disponible; no se documenta ninguna.

## Casos de uso

- Investigacion en interpretabilidad de la atencion: usar los checkpoints para replicar el analisis de que cabezas pueden fijarse estaticamente y comparar contra los controles matched-token y matched-time incluidos en el catalogo.
- Reproduccion de resultados academicos: cargar `model.pt` con `nanogpt.eval_nanogpt_logprobs.load_model` y ejecutar los comandos de PPL, downstream, MQAR y evaluacion de velocidad descritos en el README del repositorio de codigo.
- Estudio de eficiencia de entrenamiento: comparar la cohorte con cabezas congeladas frente a la receta nativa para medir ahorro de computo en modelos de 124M y 1B con presupuesto controlado.
- Evaluacion de recuperacion asociativa en contexto: emplear los checkpoints adaptados a MQAR para analizar como el congelado selectivo afecta a mecanismos de copia y recuperacion desde el contexto.
- Analisis de transferencia a tareas NLU: utilizar los checkpoints adaptados a SST-2 y BoolQ para estudiar si la intervencion sobre la atencion afecta de forma distinta a clasificacion de sentimiento y a comprension booleana.
- Verificacion de pipelines de exportacion: usar las comprobaciones de preservacion de tensores y la comparacion bit a bit de logits BF16 como referencia para validar herramientas propias de serializacion de checkpoints.
- Docencia en cursos de LLM: al ser modelos pequenos de receta abierta, sirven como material didactico para estudiar attention, pruning y analisis de cabezas, teniendo en cuenta que requieren el repositorio de codigo especifico y no funcionan con `AutoModel`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la existencia de comandos de evaluacion de perplejidad (PPL), tareas downstream, MQAR y velocidad en el repositorio de codigo, y las tareas evaluadas son SST-2, BoolQ, QuALITY y MQAR, pero no se incluyen cifras numericas de resultados en los datos proporcionados. No se deben asumir valores concretos.

## Requisitos de hardware

- Pesos en BF16: estimacion aritmetica de aproximadamente 250 MB para el modelo de 124M y 2 GB para el de 1B, solo pesos. Estas cifras son estimaciones derivadas del numero de parametros, no datos publicados en la model card.
- VRAM para inferencia: no disponible de forma oficial. La memoria real depende de la longitud de contexto, que no se documenta, y del tamano del lote.
- GPU recomendadas: no disponible. Cualquier GPU con al menos unos pocos GB de VRAM deberia poder alojar el modelo de 124M, pero esto no esta confirmado por el autor.
- Compatibilidad con GPU de consumo: probable en el caso de 124M y previsiblemente viable en el de 1B por tamano de pesos, aunque no hay confirmacion oficial.
- Opciones de despliegue: no es compatible con `AutoModel` de Transformers ni con formatos GGUF, por lo que vLLM, llama.cpp, Ollama o TGI en su configuracion estandar no aplican. El unico camino documentado es instalar el repositorio de codigo y cargar `model.pt` con `nanogpt.eval_nanogpt_logprobs.load_model`.
- Latencia y throughput: no disponible. El repositorio incluye comandos de evaluacion de velocidad, pero no se publican cifras en la informacion disponible.
- Almacenamiento: el repositorio completo ocupa 307,5 GB, aunque la carga selectiva por entradas de `checkpoints.json` reduce el volumen necesario.

## Comparativa con modelos similares

No se dispone de resultados de rendimiento de este modelo en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales. Los modelos nanoGPT de 124M son estructuralmente comparables a GPT-2 124M y a Pythia-160M; el de 1B es comparable a Pythia-1B o a GPT-2 XL en orden de magnitud.

| Modelo | Parametros | Contexto | Licencia | Formato de pesos | Disponibilidad |
|---|---|---|---|---|---|
| Selective-Attention-Freezing (124M) | 124M | no disponible | no disponible | `model.pt` nativo nanoGPT | Repositorio de investigacion |
| Selective-Attention-Freezing (1B) | 1B | no disponible | no disponible | `model.pt` nativo nanoGPT | Repositorio de investigacion |
| GPT-2 124M | 124M | 1.024 tokens | licencia especifica de OpenAI para los pesos | safetensors / PyTorch | Ampliamente disponible |
| Pythia-1B | 1.000M aprox. | 2.048 tokens | Apache 2.0 | safetensors | Ampliamente disponible |

Los datos de GPT-2 y Pythia corresponden a informacion publica general de esos proyectos y no proceden de la busqueda web realizada. No se dispone de comparaciones de rendimiento entre SAF y estos modelos.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica licencia, lo que impide determinar si se permite uso comercial. Debe tratarse como no apto para produccion hasta que el autor lo aclare.
- No son checkpoints de `AutoModel`: la model card lo advierte explicitamente. No se pueden cargar con `transformers` de forma directa y requieren el repositorio de codigo asociado.
- No sirven para reanudar el entrenamiento: los estados del optimizador, los corpus de entrenamiento, los ejemplos de tareas y las rutas de ejecucion privadas estan excluidos. Los archivos de evaluacion no permiten retomar la trayectoria original del optimizador.
- Los checkpoints adaptados a tarea son obligatorios para SST-2, BoolQ, QuALITY y MQAR; sus modelos padre de preentrenamiento no son sustitutos validos.
- Cohorts no intercambiables: la receta nativa, matched-token, matched-time y las intervenciones posteriores deben mantenerse distintas al analizar resultados.
- Una sola semilla en el estudio de preentrenamiento de 1B: las semillas de fine-tuning por tarea no cuentan como semillas de preentrenamiento independientes, lo que limita la generalizacion estadistica de las conclusiones.
- Solo ingles: el unico idioma declarado es `en`, sin cobertura multilingue documentada.
- Riesgo de alucinacion: al ser modelos base sin alineamiento declarado, no hay garantia de veracidad ni de seguimiento de instrucciones.
- Subida escalonada: solo deben usarse las entradas de `checkpoints.json` marcadas con `status: uploaded`; el resto puede estar incompleto.
- Pesos base de Qwen y artefactos de calibracion de colaboradores excluidos de la release, lo que puede impedir reproducir exactamente algunos experimentos del paper.
- La verificacion bit a bit certifica equivalencia de exportacion, no una repeticion completa de la suite de evaluacion.
- Herramientas de despliegue estandar (vLLM, llama.cpp, Ollama, TGI) no estan soportadas por el formato de pesos.
- 0 descargas y 1 like en el momento de la consulta: sin comunidad de usuarios que haya validado el material.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/waylonli/Selective-Attention-Freezing
- Dataset de evaluacion y splits: https://huggingface.co/datasets/waylonli/Selective-Attention-Freezing-data
- Repositorio de codigo: https://github.com/waylonli/Selective-Attention-Freezing
- Script de entrenamiento de referencia: https://github.com/waylonli/Selective-Attention-Freezing/blob/main/supplement/train.py
- Perfil de GitHub del autor: https://github.com/waylonli
- Perfil de HuggingFace del autor: https://huggingface.co/waylonli/models
- Pagina personal del autor: https://waylonli.com/
- Publicaciones del autor: https://waylonli.com/publication/
- Dataset de preentrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
