# YirongSun/AuroLA-7B-Dual-LoRA-SPEAR

## Resumen

AuroLA-7B Dual-LoRA para SPEAR retrieval es un adaptador PEFT LoRA alojado en el repositorio `YirongSun/AuroLA-7B-Dual-LoRA-SPEAR`. No es un modelo independiente ni un checkpoint de generacion de texto o dialogo: es un adaptador de recuperacion audio-texto que ajusta simultaneamente el codificador de audio y el modelo de lenguaje del checkpoint multimodal `Jazzcharles/AuroLA-7B`, cuya arquitectura base es `Qwen2_5OmniThinkerForConditionalGeneration`. Su unica funcion declarada es la recuperacion emparejada y de grano fino entre locuciones y descripciones textuales (speech-caption retrieval).

El artefacto se describe como privado y de investigacion, tiene 0 descargas y 0 likes en el momento de la consulta, y ocupa 1,7 GB en el repositorio (778 tensores FP32, 417.955.840 elementos, con hash SHA-256 declarado). El adaptador se entreno con 12.718 pares audio-caption del conjunto SPEAR mediante un objetivo InfoNCE simetrico de un solo positivo, con temperatura fija de 0,05, rango LoRA 128, alpha 256 y dropout 0,05, atacando 193 modulos Linear del codificador de audio y 196 modulos Linear del modelo de lenguaje, dejando congelados los parametros originales y los modulos de vision.

Es relevante ahora porque documenta una practica poco habitual: publicar un adaptador de recuperacion con contrato de inferencia completamente congelado (prompt, posicion de pooling, normalizacion y revision del modelo base), ademas de advertir explicitamente de que las metricas reportadas estan ajustadas sobre el propio conjunto de test. La model card no declara licencia de software ni de checkpoint, ni idiomas soportados, ni pipeline, lo que limita su uso fuera de un marco de colaboracion interna autorizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base `Qwen2_5OmniThinkerForConditionalGeneration`: codificador de audio + modelo de lenguaje + modulos de vision); adaptador PEFT LoRA de doble torre sobre codificador de audio y LM |
| Parametros totales | Adaptador: 417.955.840 elementos en 778 tensores FP32; base AuroLA-7B: ~7.000 millones (cifra no confirmada en la informacion disponible) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. El adaptador se distribuye en FP32 (safetensors); el autor no publica versiones cuantizadas ni GGUF |
| Idiomas soportados | No disponible |
| Licencia | No disponible. La model card indica que el repositorio upstream de AuroLA y su checkpoint no declaraban licencia de software ni de checkpoint cuando se preparo el artefacto |
| Formato de pesos | safetensors (adaptador LoRA PEFT); el checkpoint base no esta incluido en el repositorio |

## Arquitectura y entrenamiento

El adaptador se monta sobre `Jazzcharles/AuroLA-7B` en la revision exacta `575f9b4a914069392a43c2e7409806b32bc469f4` (la implementacion de AuroLA usada corresponde a la revision `331e8c6768b0f2fcf6b4b3a74ce0ba5753785dda`). La carga se realiza con `PeftModel.from_pretrained(..., is_trainable=False)` sobre la clase multimodal de Qwen2.5-Omni Thinker. El ajuste afecta a dos componentes: 193 modulos Linear del codificador de audio y 196 modulos Linear del modelo de lenguaje; los parametros originales del base y los modulos de vision permanecen congelados. La configuracion LoRA es rango 128, alpha 256, dropout 0,05 y sin sesgos.

El entrenamiento uso 12.718 pares de un audio y un caption del conjunto SPEAR, con objetivo InfoNCE simetrico de un unico positivo, temperatura fija de 0,05 y un pool contrastivo real de 64 elementos, con pool final de 46 pares por epoca. La tasa de aprendizaje seleccionada fue 5e-5 y el mejor checkpoint correspondio a la epoca 3, paso de optimizador 597. El contrato de recuperacion es estricto: audio de 16 kHz mono seguido del prompt `Summarize above audio in one word:`; texto con el caption sin modificar seguido de `Summarize above sentence in one word:`; contenido de asistente `<emb>.`; embedding tomado del hidden state de la ultima capa inmediatamente anterior al token unico `<emb>`, con normalizacion L2 en FP32; similitud calculada como producto escalar entre embedding de texto y embedding de audio. Modificar prompts, posicion de pooling, normalizacion o revision del base queda fuera de lo evaluado.

## Capacidades

- Recuperacion texto-a-audio: ranking de locuciones candidatas dada una descripcion textual, con embeddings normalizados en FP32 y similitud por producto escalar.
- Recuperacion audio-a-texto: la model card describe el adaptador para recuperacion emparejada en ambas direcciones, aunque solo se publican metricas de la direccion texto-a-audio.
- Emparejamiento fino audio-caption: entrenado especificamente sobre pares SPEAR de grano fino, no sobre descripcion generica de escenas sonoras.
- Procesamiento de audio a 16 kHz mono mediante el procesador multimodal de AuroLA.
- Uso como componente de ranking o filtrado dentro de pipelines de datos de dialogo, segun indica el propio autor.
- Carga como adaptador PEFT intercambiable sobre la revision congelada del base, sin fusion con otras variantes.
- No soporta generacion de dialogo: requiere otro modelo para generar texto.
- No hay informacion disponible sobre tool calling, function calling, soporte de agentes, capacidades multilingues, modo thinking, vision operativa ni audio generation para este adaptador.

## Casos de uso

- Recuperacion de audio por descripcion en pipelines de datos de dialogo: dado un caption de referencia, el adaptador devuelve el ranking de locuciones del corpus; el autor lo plantea como paso de recuperacion o ranking previo a un modelo generativo independiente.
- Curacion y filtrado de datasets de habla: usar la similitud texto-audio para descartar pares mal alineados o seleccionar los candidatos con mayor puntuacion antes de entrenar otros sistemas; el contrato de embedding (`<emb>`-1 y normalizacion L2 FP32) esta fijado y es reproducible.
- Construccion de indices de busqueda semantica sobre archivos de audio: precalcular embeddings de audio del corpus y resolver consultas textuales por producto escalar, con R@10 del 93,7076% sobre el test SPEAR reportado.
- Verificacion de pipelines de captioning automatico: comparar captions generados por un sistema ASR/descriptivo contra el audio original y usar la puntuacion de recuperacion como proxy de calidad de la anotacion.
- Mineria de pares contrastivos: generar positivos y negativos duros a partir de los rankings del adaptador para alimentar el entrenamiento de otros modelos de recuperacion audio-texto.
- Archivado y documentacion de medios sonoros: indexar grabaciones con descripciones textuales breves y permitir consultas tipo "encuentra la locucion que corresponde a esta descripcion", apoyandose en el pool contrastivo de 46-64 pares usado en entrenamiento como indicador del regimen de emparejamiento.
- Reproduccion de resultados de investigacion: el artefacto incluye `training_metadata.json`, `provenance.json` y `SHA256SUMS`, y el autor afirma haber reproducido en proceso nuevo los 5.451 rankings, las identidades top-1, las puntuaciones almacenadas y las huellas de embeddings, lo que permite replicar la evaluacion SPEAR.
- Evaluacion interna de modelos de recuperacion: servir como linea base ajustada sobre SPEAR al comparar variantes de codificador o de estrategia de pooling, teniendo en cuenta que las metricas son test-tuned.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test SPEAR completo (5.451 filas). El autor advierte que se usaron para seleccionar la tasa de aprendizaje y el checkpoint, por lo que son cifras ajustadas al test y no estimaciones limpias de holdout. Un unico positivo por consulta, sin ingenieria de prompt, reranking, enmascarado multi-positivo ni captions adicionales.

| Direccion | R@1 | R@5 | R@10 | MRR | mAP@10 | Rango medio | Rango mediano |
|---|---:|---:|---:|---:|---:|---:|---:|
| Texto a audio | 74,5368% | 89,5982% | 93,7076% | 81,2912% | 80,9979% | 4,55 | 1 |

No se publican resultados de la direccion audio a texto, ni de otras tareas (generacion, dialogo, clasificacion), ni comparaciones con modelos alternativos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones a partir del tamano declarado, no publicadas por el autor): alrededor de 15-18 GB en bfloat16 solo para los pesos del base de ~7.000 millones mas codificador de audio y modulos de vision; con activaciones para audio de 16 kHz, el uso practico se situa aproximadamente entre 20 y 24 GB.
- El adaptador anade 417.955.840 elementos en FP32, es decir, aproximadamente 1,6 GB en disco y en memoria si se mantiene en FP32; si se convierte a bfloat16, el sobrecoste baja a unos 0,8 GB.
- GPU recomendadas: A100 40 GB o 80 GB, H100 80 GB para despliegue comodo; una RTX 4090 de 24 GB queda al limite en bfloat16 para una sola peticion y es probable que exija reducir tamano de lote o precision.
- Cabe en GPU de consumo: si, en el limite. Tarjetas de 24 GB (RTX 3090, RTX 4090) pueden ejecutarlo en bfloat16 con lotes pequenos; por debajo de 24 GB no hay datos que permitan confirmar viabilidad.
- Opciones de despliegue: el unico procedimiento documentado es Transformers mas PEFT sobre la clase multimodal de Qwen2.5-Omni. El autor no documenta vLLM, TGI, llama.cpp, Ollama ni ONNX para este adaptador, y su naturaleza de extraccion de embeddings con pooling en el token `<emb>` no encaja en servidores orientados a generacion de texto.
- Entorno de referencia declarado: Python 3.10, PyTorch 2.5.1, Transformers 4.57.1, PEFT 0.17.1 y qwen-omni-utils 0.0.8.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han publicado en la informacion disponible comparaciones con otros modelos de recuperacion audio-texto ni con otros adaptadores sobre AuroLA. La unica comparacion sustentada en datos es la del adaptador frente a su propio checkpoint base.

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AuroLA-7B Dual-LoRA-SPEAR (este repositorio) | Adaptador de 417.955.840 elementos sobre base de ~7.000 millones | No disponible | Recuperacion audio-texto (SPEAR) | No disponible | Repositorio privado de investigacion; requiere la revision exacta del base |
| `Jazzcharles/AuroLA-7B` (base sin adaptador) | ~7.000 millones, no confirmado | No disponible | Checkpoint multimodal de recuperacion | No declarada segun la model card del adaptador | Publico en HuggingFace, revision `575f9b4a914069392a43c2e7409806b32bc469f4` |
| Alternativas de la misma categoria (por ejemplo, modelos de recuperacion audio-texto de ~7B o adaptadores equivalentes) | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Metricas ajustadas al test: el conjunto completo de 5.451 filas de SPEAR se uso para seleccionar tasa de aprendizaje y checkpoint, de modo que las cifras de R@1, R@5, R@10, MRR y mAP@10 no son estimaciones insesgadas de holdout.
- Contaminacion no descartada: el solapamiento exacto entre los datos de entrenamiento upstream de AuroLA y SPEAR no se ha establecido; el autor no reclama una evaluacion libre de contaminacion.
- Licencia inexistente o no declarada: ni el repositorio upstream de AuroLA ni su model card declaraban licencia de software o de checkpoint cuando se preparo el artefacto. No hay derechos claros de redistribucion ni de despliegue comercial.
- Restriccion explicita de uso: el repositorio se declara destinado unicamente a colaboracion interna de investigacion autorizada y no debe hacerse publico ni redistribuirse sin una revision de licencia independiente. El acceso privado no otorga derechos sobre el modelo base ni sobre el adaptador derivado.
- No es un modelo de dialogo ni de generacion: se necesita otro modelo para producir texto; el adaptador solo recupera o rankea pares audio-texto.
- Dependencia estricta del contrato de inferencia: cambiar prompts, posicion de pooling, normalizacion o revision del base altera el contrato del modelo y queda fuera de la evaluacion realizada.
- Acoplamiento a una revision concreta: no debe fusionarse con otra talla de AuroLA, con checkpoints PT, con rerankers ni con revisiones distintas del base.
- Riesgo de falsos positivos: al ser un modelo de recuperacion, el modo de fallo no es la alucinacion de texto sino el ranking incorrecto o el emparejamiento espurio en audios acusticamente cercanos; el rango medio reportado de 4,55 en texto-a-audio refleja esos errores de ordenacion.
- Sesgos: no hay informacion disponible sobre composicion demografica, linguistica o de dominio de los datos de entrenamiento, ni analisis de sesgo del adaptador o de su base.
- Idiomas: no se declara que idiomas soporta el adaptador; los resultados publicados se limitan al benchmark SPEAR y no se desglosan por idioma.
- Contexto: no se dispone de la longitud de contexto util para audio o texto en este adaptador, dato relevante para planificar entradas largas.
- Ausencia de cuantizaciones: no se publican pesos GGUF ni variantes cuantizadas, lo que complica el despliegue en hardware de gama media y en herramientas de inferencia local.
- Reproducibilidad condicionada: el autor afirma una reproduccion exacta en proceso nuevo, pero se apoya en artefactos (`training_metadata.json`, `provenance.json`, `SHA256SUMS`) que no se detallan en la informacion disponible.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/YirongSun/AuroLA-7B-Dual-LoRA-SPEAR
- Modelo base: https://huggingface.co/Jazzcharles/AuroLA-7B
- Revision requerida del base: `575f9b4a914069392a43c2e7409806b32bc469f4`
- Revision de AuroLA usada por la implementacion del adaptador: `331e8c6768b0f2fcf6b4b3a74ce0ba5753785dda`
- Artefactos de procedencia citados en la model card: `training_metadata.json`, `provenance.json`, `SHA256SUMS` (en el propio repositorio)
- Nota sobre la busqueda web: los resultados devueltos no guardan relacion con el modelo (corresponden a soportes de telefono para bicicleta), por lo que no aportan papers, blogs, repositorios ni demos utilizables. No se han encontrado en la busqueda enlaces adicionales relevantes sobre AuroLA, SPEAR o este adaptador.
