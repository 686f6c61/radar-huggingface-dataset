# sriq-ai/sriqwen-v1.1

## Resumen

sriqwen-v1.1 es un ajuste fino (fine-tuning) publicado por el usuario sriq-ai sobre el modelo base `unsloth/qwen3.8-27b-unsloth-bnb-4bit`, una variante cuantizada a 4 bits de la familia Qwen3.5. El repositorio contiene 27.781.427.952 parámetros en formato safetensors, con un tamano total de 55,6 GB, licencia Apache 2.0 y declaracion de idioma unico: ingles. La pipeline declarada en HuggingFace es `image-text-to-text`, lo que sugiere capacidad multimodal de entrada (imagen + texto), aunque la model card no lo documenta explicitamente.

El modelo no aporta informacion sobre el proceso de entrenamiento: no se especifican tokens de entrenamiento, composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La unica referencia tecnica es que el ajuste se realizo con Unsloth y la libreria TRL de HuggingFace, con una supuesta ganancia de velocidad de 2x. No hay resultados de benchmarks publicados.

Su relevancia actual es limitada: el modelo acumula 0 descargas y 0 likes, no incluye model card descriptiva y no se ha validado su rendimiento. Debe considerarse un experimento de fine-tuning sin documentar, no un modelo listo para produccion, y su evaluacion requiere una validacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, segun el tag `qwen3_5`; detalles no disponibles) |
| Parametros totales | 27.781.427.952 (~27,8 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Modelo base cuantizado a 4 bits (`bnb-4bit`); el repositorio publica pesos en safetensors. No se ofrecen variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 55,6 GB |
| Pipeline declarada | image-text-to-text |
| Modelo base | unsloth/qwen3.8-27b-unsloth-bnb-4bit |
| Libreria | transformers |

## Arquitectura y entrenamiento

La informacion disponible solo permite afirmar que se trata de un fine-tuning del modelo `unsloth/qwen3.8-27b-unsloth-bnb-4bit`, realizado con la libreria Unsloth y TRL. El tag `qwen3_5` apunta a la familia arquitectonica Qwen3.5, y el tag `image-text-to-text` sugiere un transformer multimodal con codificador visual y decodificador de texto, pero ninguna de estas dos afirmaciones esta confirmada en la model card.

No hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, la estrategia de ajuste (full fine-tuning, LoRA, QLoRA), los hiperparametros empleados ni la existencia de fases de RLHF, DPO o RLVR. Tampoco se documenta ninguna innovacion tecnica propia: no se mencionan mecanismos de atencion lineal, decodificacion especulativa, modos de razonamiento extendido ni variantes de atencion hibrida. La unica afirmacion tecnica del autor es la aceleracion del entrenamiento en 2x gracias a Unsloth.

Un detalle relevante para la reproducibilidad: el modelo base estaba cuantizado a 4 bits, mientras que el repositorio final ocupa 55,6 GB, un tamano coherente con pesos en bf16/fp16 (~2 bytes por parametro). Esto sugiere una fusion de adaptadores y un posible reescalado de precision, pero el autor no lo explica.

## Capacidades

- Generacion de texto conversacional, segun el tag `conversational`.
- Entrada multimodal imagen + texto, inferida del pipeline declarado `image-text-to-text`; no confirmada por el autor.
- Compatibilidad declarada con text-generation-inference (TGI) y endpoints de HuggingFace.
- Carga mediante `transformers` y pesos en safetensors.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades multilingues: solo se declara ingles.
- Capacidades de audio, video u otras modalidades: no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales en ingles: el modelo puede desplegarse con `transformers` o TGI para validar flujos de dialogo multi-turno antes de invertir en modelos mejor documentados.
- Experimentacion academica con fine-tuning multimodal: al partir de una base Qwen3.5 cuantizada a 4 bits y haberse ajustado con Unsloth, sirve como caso de estudio de pipelines QLoRA de bajo coste.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio permite medir la perdida de calidad entre la base `bnb-4bit` y los pesos publicados, siempre que se establezca una linea base propia.
- Generacion de descripciones de imagen (image captioning) en ingles: el pipeline `image-text-to-text` lo habilita tecnicamente, aunque requiere validacion empirica previa.
- Docencia y formacion en despliegue de modelos: sirve para practicar la carga de safetensors de ~28B parametros en infraestructura propia sin depender de APIs externas.
- Base para fine-tunings especificos de dominio en ingles: su licencia Apache 2.0 facilita derivados, siempre que se verifique la trazabilidad de la licencia del modelo base original.
- Procesamiento de documentacion tecnica en ingles: util como borrador de resumenes, con revision humana obligatoria por el riesgo de alucinacion no medido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye tablas de MMLU, HumanEval, GSM8K, MMMU ni ninguna otra metrica, y no se han encontrado evaluaciones independientes en la busqueda web realizada.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 56 GB solo para pesos, mas overhead de contexto y cache KV; se recomienda un minimo de 70-80 GB para inferencia comoda.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 28 GB para pesos, lo que exige GPU de 40 GB o superior (A100 40 GB, A6000 48 GB).
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 14-16 GB para pesos, mas cache KV; cabe en RTX 4090, RTX 3090 y L40S (24 GB), ajustando la longitud de contexto.
- GPU recomendadas: A100 80 GB o H100 80 GB para precision completa; A100 40 GB o A6000 para 8 bits; RTX 4090 / RTX 3090 para 4 bits.
- Opciones de despliegue: `transformers`, text-generation-inference (TGI), vLLM y endpoints de HuggingFace. Los pesos estan en safetensors, por lo que no hay GGUF listo para llama.cpp u Ollama salvo que se convierta manualmente.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

No disponible. El autor no publica comparativas y no se ha encontrado informacion independiente sobre este modelo. La unica referencia directa es su modelo base, que se recoge en la tabla; cualquier comparacion con alternativas de la misma categoria (por ejemplo, modelos densos de ~28-32B en ingles) requeriria datos de benchmarks que no existen.

| Modelo | Parametros | Contexto | Licencia | Datos de rendimiento |
|---|---|---|---|---|
| sriq-ai/sriqwen-v1.1 | 27,78 B | no disponible | Apache 2.0 | no disponibles |
| unsloth/qwen3.8-27b-unsloth-bnb-4bit (modelo base) | no disponible (base de 27B segun el nombre) | no disponible | no disponible | no disponibles |
| Alternativas de ~28-32B | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de evaluacion: sin benchmarks ni validacion externa, no hay evidencia de que el fine-tuning mejore a su modelo base.
- Model card practicamente vacia: no documenta dataset, tokens, hiperparametros ni metodologia de ajuste, lo que impide reproducir el resultado.
- Riesgo de alucinacion: no cuantificado. Al no haber evaluaciones de veracidad, debe asumirse un riesgo estandar de los modelos generativos.
- Sesgos: se desconoce la composicion del dataset de ajuste, por lo que no se pueden identificar sesgos concretos ni su magnitud.
- Idioma: solo se declara ingles. No hay evidencia de competencia en castellano ni en otros idiomas.
- Contexto: se desconoce la longitud de contexto soportada, un dato critico para planificar despliegues con documentos largos.
- Trazabilidad de la licencia: aunque se declara Apache 2.0, el modelo base es un derivado cuantizado de la familia Qwen; conviene verificar las condiciones reales antes de uso comercial.
- Ambiguedad en el nombre del modelo base (`qwen3.8-27b`), que no coincide con una nomenclatura publica verificable ni con un tamano estandar de la familia Qwen.
- Coherencia de metadatos: el modelo base estaba en 4 bits pero el repositorio ocupa 55,6 GB, lo que sugiere un cambio de precision no documentado.
- Sin senales de adopcion: 0 descargas y 0 likes en la fecha de consulta, lo que implica ausencia de uso comunitario y de informes de fallos.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los enlaces obtenidos correspondian a centros de ayuda de YouTube y a la comunidad Zhihu, sin relacion con el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sriq-ai/sriqwen-v1.1
- Modelo base: https://huggingface.co/unsloth/qwen3.8-27b-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de HuggingFace: https://github.com/huggingface/trl
- Paper, blog o demo oficial del modelo: no disponible
