# zbeeb/Qwen2.5-3B-OpenR1-SFT

## Resumen

Qwen2.5-3B-OpenR1-SFT es un ajuste supervisado (SFT) del modelo denso Qwen2.5-3B de Alibaba, publicado por el usuario zbeeb como punto final de un estudio a nivel de token sobre la transición entre SFT y GRPO. El modelo parte de la revisión `3aab1f1954e9cc14eb9509a215f9e5ca08227a9b` de Qwen2.5-3B y se ha afinado sobre un subconjunto seleccionado del dataset open-r1/OpenR1-Math-220k, compuesto por trazas completas de razonamiento matemático verificadas localmente.

El objetivo declarado es servir como artefacto experimental reproducible, no como modelo de propósito general: el autor publica junto a los pesos los ficheros `provenance.json`, `training-config.json`, `export-manifest.json`, `data-selection.json`, `train_metrics.jsonl` y `evaluation-summary.jsonl`, que documentan revisiones de origen, receta de entrenamiento y checksums SHA-256. Con 3.397.103.616 parámetros (aproximadamente 3,4 mil millones), es un modelo pequeño que cabe en GPUs de consumo y que prioriza el razonamiento matemático paso a paso con salida final encerrada en `\boxed{}` frente a la cobertura de tareas generales.

Su relevancia actual es doble: por un lado, ofrece una instantánea limpia de la fase SFT previa al RL con GRPO (los checkpoints posteriores de RL se publican por separado en la misma colección de estudio); por otro, su licencia heredada Qwen Research limita el uso comercial, lo que lo sitúa claramente en el terreno de la investigación y la experimentación reproducible más que en el de producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2, segun la tag `qwen2`) |
| Parametros totales | 3.397.103.616 (3,4 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens durante el entrenamiento SFT; el modelo base Qwen2.5-3B declara 32.768 tokens nativos (dato del modelo base, no verificado en esta model card) |
| Tipos de cuantizacion | No disponible: no se publican pesos cuantizados. Los tensores del repositorio estan guardados en F32, por lo que requieren conversion previa a bf16/fp16 o a formatos GGUF/AWQ/GPTQ para reducir huella |
| Idiomas soportados | Ingles (`en`) segun la model card; el corpus de entrenamiento es matematico en ingles |
| Licencia | `other` con `license_name: qwen-research` (Qwen Research License, heredada del modelo base) |
| Formato de pesos | Safetensors (tensores guardados en F32), compatible con `transformers` |
| Framework de entrenamiento | Prime RL 0.9.0 |
| Tamano del repositorio | 13,6 GB |
| Fecha de publicacion indicada | 2026-10-06 (segun HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura no se modifica respecto al modelo base: es un transformer decoder-only denso de la familia Qwen2, con tokenizer y ajustes de generacion conservados tal cual se guardaron en el experimento. El autor indica explicitamente que los pesos se modificaron mediante ajuste supervisado y que no se altero el tokenizador. El entrenamiento se ejecuto con Prime RL 0.9.0 (revision `ab5de8fff44b2c4a5c85e24b6e6e3f7d57eee7b1`), semilla 42, precision bf16, longitud de secuencia 4.096 tokens, batch efectivo de 72 ejemplos, learning rate 2e-05, scheduler coseno, warmup ratio 0,03, weight decay 0,01 y gradient clipping 1.0. Se completaron 278 actualizaciones de optimizador sobre 20.016 ejemplos, equivalentes a una epoca sobre el subconjunto seleccionado de open-r1/OpenR1-Math-220k (revision `e4e141ec9dea9f8326f4d347be56105859b2bd68`).

La seleccion de datos es un punto metodologico relevante: solo se incluyeron trazas completas de razonamiento matematico verificadas localmente que caben en el presupuesto de 4.096 tokens de todos los modelos del estudio; los ejemplos que excedian esa longitud se excluyeron en lugar de truncarse. Los tokens de prompt se enmascaran en la perdida supervisada, de modo que el modelo aprende exclusivamente sobre las trazas de respuesta. No se documenta en la informacion disponible ninguna fase de RLHF, DPO o RL en este repositorio: se trata del checkpoint final de SFT, y la fase GRPO posterior se publica en repositorios separados de la misma coleccion de estudio, con `zbeeb/Staleness-GRPO-DAPO-Math-17k` como dataset de RL asociado.

## Capacidades

- Generacion de texto conversacional con plantilla de chat de Qwen (`apply_chat_template`), incluyendo rol de sistema.
- Razonamiento matematico paso a paso, con instruccion de sistema que induce la respuesta final dentro de `\boxed{}`.
- Resolucion de problemas aritmeticos y algebraicos de nivel escolar y de competicion presentes en OpenR1-Math-220k.
- Capacidad de generacion de codigo heredada del modelo base Qwen2.5-3B, aunque no reforzada por el corpus de SFT matematico.
- Capacidades multilingues limitadas: la model card declara unicamente ingles; el ajuste fino se realizo sobre datos en ingles.
- Tool calling / function calling: no confirmado en la informacion disponible para este checkpoint, aunque el modelo base Qwen2.5 soporta llamadas a funciones.
- Modo de pensamiento explicito (thinking mode) formal: no disponible; el razonamiento se obtiene por prompt.
- Vision, audio u otras modalidades: no disponibles (modelo exclusivamente de texto).
- Uso como sujeto de estudio experimental: incluye ficheros de metricas de entrenamiento, sondas fijas de evaluacion y manifiestos de procedencia para reproducibilidad.

## Casos de uso

- Investigacion sobre la transicion SFT a RL: el modelo sirve como punto de partida exacto para reproducir la fase GRPO descrita por el autor, comparando el checkpoint SFT con los checkpoints RL publicados en la misma coleccion.
- Estudio de asignacion de credito a nivel de token: al enmascarar los tokens de prompt en la perdida y publicar los IDs de ejemplos y sondas usados, permite analizar que tokens contribuyen a la mejora en razonamiento.
- Generacion de soluciones matematicas con formato verificable: integrable en un pipeline que extraiga el contenido de `\boxed{}` y lo valide automaticamente contra un solucionario, usando `temperature=0.6` y `top_p=0.95` como recomienda el autor.
- Prototipado y docencia en entornos con recursos limitados: con 3,4 B de parametros cabe en una GPU de consumo, lo que permite desplegar un asistente de matematicas en un portatil con GPU o en una estacion de trabajo modesta.
- Generacion de datos sinteticos de razonamiento: puede producir trazas de solucion largas (hasta 3.072 tokens nuevos en el ejemplo oficial) para aumentar datasets de entrenamiento, siempre con verificacion posterior.
- Reproduccion de experimentos academicos: los ficheros `provenance.json`, `training-config.json` y `export-manifest.json` con checksums SHA-256 permiten auditar una publicacion que cite este checkpoint.
- Evaluacion de sensibilidad a hiperparametros de decodificacion: al ser un checkpoint de un estudio comparativo, es util como linea base fija frente a variantes con y sin GRPO.
- Fine-tuning posterior en dominios cientificos o de ingenieria con presupuesto de computo reducido: 3,4 B de parametros abaratan el reajuste respecto a modelos de 7 B o 70 B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, GSM8K, MATH, HumanEval, etc.) en la informacion disponible. El autor indica que `evaluation-summary.jsonl` contiene resumenes de sondas fijas de entrenamiento y de validacion, con medidas forzadas por profesor y de generacion libre, y aclara explicitamente que se trata de resultados de sondas experimentales y no de una afirmacion de rendimiento en benchmarks estandar. Las cifras concretas de esas sondas no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- Huella de pesos: el repositorio pesa 13,6 GB porque los tensores estan guardados en F32. Cargados en bf16 ocupan aproximadamente 6,8 GB; en cuantizacion de 8 bits, unos 3,5 GB; en 4 bits, unos 2 GB.
- VRAM estimada para inferencia en bf16: alrededor de 8-10 GB contando pesos, cache KV y overhead del runtime, con contexto de 4.096 tokens.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 3-4 GB, dependiendo del backend y de la longitud de contexto.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM para bf16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, L4, A10); A100 y H100 son sobredimensionadas para este tamano y solo tienen sentido en despliegues con mucho batching.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas en bf16, y en tarjetas de 4-6 GB si se cuantiza.
- Opciones de despliegue: `transformers` con `device_map="auto"` (ruta documentada por el autor), vLLM y TGI (la model card incluye las etiquetas `text-generation-inference` y `endpoints_compatible`); llama.cpp u Ollama requeririan una conversion a GGUF no publicada en el repositorio.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia en la informacion proporcionada.
- Ajustes de generacion sugeridos por el autor: `max_new_tokens=3072`, `do_sample=True`, `temperature=0.6`, `top_p=0.95`, `eos_token_id=[151643, 151645]`, `pad_token_id=151643`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Rendimiento en benchmarks |
|---|---|---|---|---|---|
| zbeeb/Qwen2.5-3B-OpenR1-SFT | 3,4 B | 4.096 en SFT (base: 32.768) | Qwen Research (`other`) | SFT matematico sobre OpenR1-Math-220k como parte de un estudio SFT/GRPO | No disponible |
| Qwen/Qwen2.5-3B (base) | 3,4 B | 32.768 | Qwen Research | Modelo base preentrenado, sin ajuste conversacional | No disponible en esta ficha |
| Qwen/Qwen2.5-3B-Instruct | 3,4 B | 32.768 | Qwen Research | Ajuste por instrucciones y alineamiento generalista | No disponible en esta ficha |
| Llama-3.2-3B-Instruct | 3,2 B | 128.000 | Llama 3.2 Community License | Instrucciones generalistas, multimodal en la variante mayor | No disponible en esta ficha |
| Qwen2.5-Math-7B | 7,6 B | 4.096 | Qwen Research | Especializado en matematicas, mayor coste de inferencia | No disponible en esta ficha |

La comparacion relevante es contra Qwen2.5-3B-Instruct: mismo tamano y misma licencia, pero con alineamiento generalista, mayor cobertura multilingue y soporte documentado de llamadas a funciones, frente a un checkpoint experimental centrado en trazas matematicas en ingles. La eleccion depende de si se prioriza reproducibilidad del estudio SFT/GRPO o cobertura funcional.

## Limitaciones y advertencias

- Licencia Qwen Research: la model card indica `license: other` con `license_name: qwen-research`. Esta licencia esta orientada a uso de investigacion y restringe el uso comercial sin autorizacion adicional del titular de los derechos; conviene revisar el fichero `LICENSE` del repositorio antes de cualquier despliegue productivo.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o alineamiento de seguridad. Al ser un SFT puramente matematico, el modelo no ha pasado por fases de RLHF o DPO en este checkpoint, por lo que las respuestas fuera del dominio matematico pueden ser pobres o inadecuadas.
- Riesgo de alucinacion: alto en tareas de conocimiento factual, ya que el ajuste fino se limita a trazas de razonamiento matematico y no refuerza la veracidad general. En matematicas, el modelo puede producir cadenas de razonamiento plausibles con resultados incorrectos.
- Limitacion de contexto: el entrenamiento se realizo con 4.096 tokens y los ejemplos mas largos se excluyeron en lugar de truncarse. Aunque el modelo base soporte ventanas mayores, no hay garantia de que el ajuste fino conserve buen comportamiento mas alla de 4.096 tokens.
- Limitacion de idioma: solo se declara ingles. Las capacidades multilingues del modelo base pueden haberse degradado respecto al original.
- Advertencia sobre tool calling y agentes: no se confirma soporte de llamadas a funciones ni de razonamiento multi-paso con herramientas en este checkpoint; no deberia asumirse por herencia del modelo base sin verificacion empirica.
- Ausencia de benchmarks: no hay resultados estandar publicados, por lo que cualquier afirmacion de rendimiento comparativo carece de base en la informacion disponible.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, y ausencia de pesos cuantizados o de checkpoints de optimizador (los estados del optimizador y los checkpoints de recuperacion no se incluyen), lo que limita la reanudacion del entrenamiento.
- Fechas: el repositorio indica fechas de creacion y actualizacion en 2026, con lo que la trazabilidad temporal debe tomarse con cautela.
- Uso de los ajustes de generacion del autor: el ejemplo oficial fija `temperature=0.6` y `top_p=0.95`; desviarse de ellos puede degradar la calidad de las trazas matematicas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zbeeb/Qwen2.5-3B-OpenR1-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B
- Dataset de SFT: https://huggingface.co/datasets/open-r1/OpenR1-Math-220k
- Dataset de RL posterior del estudio: https://huggingface.co/datasets/zbeeb/Staleness-GRPO-DAPO-Math-17k
- Framework de entrenamiento: Prime RL 0.9.0 (revision `ab5de8fff44b2c4a5c85e24b6e6e3f7d57eee7b1`), sin URL proporcionada en la informacion disponible
- Paper, blog o demo adicionales: no disponible
