# WijewardhanaNT/xnli_en_and_sw_5000_percentage_1_40_DoRA_llama-3.2

## Resumen

El modelo identificado como `WijewardhanaNT/xnli_en_and_sw_5000_percentage_1_40_DoRA_llama-3.2` es un adaptador de ajuste fino publicado en HuggingFace por el usuario WijewardhanaNT. No se trata de un modelo completo, sino de un adaptador PEFT (libreria `peft`, version 0.17.1) que se monta sobre el modelo base `meta-llama/Llama-3.2-3B`, un transformer decoder-only de 3.210 millones de parametros desarrollado por Meta. El repositorio ocupa 0,4 GB y contiene pesos en formato `safetensors`, lo que es coherente con un adaptador de bajo rango en lugar de una copia completa del modelo.

El nombre del repositorio sugiere que el ajuste se ha realizado sobre la tarea XNLI (Cross-lingual Natural Language Inference) en ingles (`en`) y suajili (`sw`), con un subconjunto de 5.000 ejemplos y algun tipo de porcentaje de datos entre el 1 % y el 40 % (`percentage_1_40`). La tecnica de adaptacion indicada en el nombre es DoRA (Weight-Decomposed Low-Rank Adaptation), aunque la etiqueta declarada en HuggingFace es `lora`. Estas interpretaciones proceden unicamente de la convencion de nombres y no estan confirmadas por el autor.

La relevancia de la ficha es limitada pero util como caso de estudio: el repositorio no incluye model card sustantiva (la plantilla esta vacia, con todos los campos marcados como `[More Information Needed]`), no declara licencia, no declara idiomas, acumula 0 descargas y 0 likes, y no aporta resultados de evaluacion. Cualquier uso en produccion requeriria validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA o DoRA, segun el nombre del repositorio) sobre un transformer decoder-only: `meta-llama/Llama-3.2-3B`. La model card no especifica la arquitectura del adaptador |
| Parametros totales | No disponible para el adaptador. Modelo base: 3.210 millones de parametros. Tamano del repositorio: 0,4 GB |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible. El repositorio se distribuye en `safetensors` sin variantes cuantizadas declaradas (no hay GGUF ni AWQ publicados) |
| Idiomas soportados | No disponible. El nombre del repositorio sugiere ingles y suajili por la tarea XNLI, pero no hay confirmacion en la model card |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (adaptador PEFT, cargable con `transformers` + `peft`) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador de ajuste fino eficiente en parametros, no un modelo completo. La libreria declarada es `peft` en su version 0.17.1, y las etiquetas incluyen `lora`, `transformers` y `safetensors`. El nombre del repositorio apunta a DoRA (Weight-Decomposed Low-Rank Adaptation), una variante que descompone los pesos preentrenados en componentes de magnitud y direccion y aplica la actualizacion de bajo rango solo sobre la direccion. La model card no documenta ninguna de estas decisiones: no hay informacion sobre modulos objetivo (`target_modules`), rango, alpha, dropout ni hiperparametros de entrenamiento.

Los datos de entrenamiento tampoco estan documentados. Por el nombre se deduce el uso del corpus XNLI (inferencia de lenguaje natural entre pares de frases con tres etiquetas: contradiccion, neutralidad e implicacion) restringido a ingles y suajili, con un subconjunto de 5.000 ejemplos y algun regimen de porcentaje entre el 1 % y el 40 %. No se especifica si hubo preprocesado adicional, si se aplico RLHF o DPO (poco probable en un ajuste de este tipo) ni cuantas epocas o tokens se consumieron. El unico identificador de arXiv presente en las etiquetas (`arxiv:1910.09700`) corresponde a Lacoste et al. (2019) sobre estimacion de emisiones de carbono, citado en la plantilla de model card, y no a un trabajo metodologico del adaptador.

## Capacidades

- No hay capacidades confirmadas por el autor. La model card no documenta ninguna.
- Por herencia del modelo base `meta-llama/Llama-3.2-3B`, el sistema combinado (base + adaptador) conserva la generacion de texto autoregresiva, el razonamiento basico y el soporte de tool calling del modelo original, siempre que el ajuste no los haya degradado.
- El ajuste declarado apunta a una tarea discriminativa de tres clases (inferencia de lenguaje natural), no a generacion abierta, a pesar de que el `pipeline_tag` publicado es `text-generation`. Esta discrepancia entre la etiqueta y el uso probable es un punto que debe verificarse.
- Capacidades multilingues: no disponibles. El suajili aparece en el nombre del repositorio, pero no hay confirmacion de cobertura ni de calidad.
- Capacidades de agente, razonamiento multi-paso, vision, audio o modo de pensamiento: no disponibles.

## Casos de uso

- Clasificacion de inferencia textual en ingles: el adaptador puede emplearse para etiquetar pares de frases como contradiccion, neutralidad o implicacion, un caso tipico en sistemas de deteccion de contradicciones en bases de conocimiento. Requiere validacion propia al no existir metricas publicadas.
- Experimentacion academica en adaptacion eficiente: sirve como ejemplo reproducible para comparar DoRA frente a LoRA en un presupuesto de datos muy reducido (5.000 ejemplos) y observar el efecto del porcentaje de datos de entrenamiento.
- Transferencia a idiomas de bajos recursos: el suajili es un idioma con cobertura limitada en corpus NLI, por lo que el adaptador puede usarse como punto de partida para estudiar transferencia entre ingles y lenguas africanas.
- Base para un clasificador de alucinaciones: la inferencia de lenguaje natural permite comprobar si una afirmacion se sigue logicamente de un contexto dado, un componente util en pipelines de verificacion de respuestas generadas.
- Prototipado rapido en un portatil: al ser un adaptador sobre un modelo de 3B, se puede cargar y ejecutar en GPU de consumo, lo que permite iterar sobre la tarea sin infraestructura dedicada.
- Filtrado de datos sinteticos: un clasificador NLI puede usarse para descartar pares de frases inconsistentes generados por otro modelo antes de incorporarlos a un corpus de entrenamiento.
- Evaluacion de tecnicas PEFT en entornos docentes: el repositorio ilustra el flujo completo de PEFT (carga del adaptador, fusion con el modelo base, inferencia) con un ejemplo real, aunque con documentacion deficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna seccion de evaluacion cumplimentada y no existe informacion sobre metricas de XNLI (accuracy, F1 macro) ni sobre comparaciones con otros adaptadores.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del tamano del modelo base (`meta-llama/Llama-3.2-3B`), no datos publicados por el autor:

- Inferencia en fp16/bf16: aproximadamente 6-7 GB de VRAM para los pesos del modelo base, mas el consumo del adaptador (el repositorio ocupa 0,4 GB) y la memoria de activaciones y cache KV, que crece con la longitud de contexto.
- Cuantizacion a 8 bits: en torno a 4 GB de VRAM.
- Cuantizacion a 4 bits (bitsandbytes, GPTQ o AWQ aplicada por el usuario): en torno a 2-3 GB de VRAM, con perdida de calidad no medida en este adaptador.
- GPU de consumo: cabe con holgura en una RTX 4090 (24 GB), una RTX 4080 (16 GB) o una RTX 3090 (24 GB) en fp16; en 4 bits es viable en GPUs de 8 GB, como una RTX 3060 Ti o una RTX 4060, siempre que se ajuste la longitud de contexto.
- GPU de centro de datos: A100, H100 o L40S son sobredimensionadas para un modelo de 3B, salvo que se despliegue con lotes grandes para maximizar throughput.
- Opciones de despliegue: `transformers` + `peft` es la via directa para cargar el adaptador; vLLM y TGI admiten adaptadores LoRA en caliente, lo que permitiria servir varias variantes sobre el mismo modelo base; `llama.cpp` y Ollama requeririan fusionar el adaptador con el modelo base y exportar a GGUF de forma manual, ya que no se publican pesos GGUF.
- Latencia y throughput: no disponibles. No hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Rendimiento en XNLI | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `WijewardhanaNT/xnli_en_and_sw_5000_percentage_1_40_DoRA_llama-3.2` | Adaptador sobre 3,21B (repo de 0,4 GB) | Adaptador PEFT (LoRA/DoRA) sobre Llama-3.2-3B | No disponible | No disponible | No disponible | HuggingFace, 0 descargas |
| `meta-llama/Llama-3.2-3B` | 3,21B | Transformer decoder-only completo | No disponible en esta ficha | No aplica (modelo generativo, no ajustado a NLI) | Licencia comunitaria de Llama 3.2 | HuggingFace, ampliamente distribuido |
| Ajuste completo supervisado de Llama-3.2-3B sobre XNLI | 3,21B | Fine-tuning completo | Igual que el base | No disponible | Depende del modelo base | No existe como artefacto publico comparable en la informacion disponible |

No se dispone de datos para comparar con alternativas especificas de la misma categoria (adaptadores NLI multilingues sobre Llama-3.2 o sobre XLM-R) dentro de la informacion proporcionada.

## Limitaciones y advertencias

- La model card esta practicamente vacia: todos los campos sustantivos aparecen como `[More Information Needed]`. No hay documentacion de uso previsto, datos, hiperparametros ni evaluacion.
- No se declara licencia. Sin licencia explicita, el uso comercial y la redistribucion quedan en un limbo legal, agravado porque el modelo base (Llama 3.2) si tiene su propia licencia comunitaria con condiciones de atribucion y restricciones.
- No se declaran idiomas soportados. El suajili aparece en el nombre del repositorio, pero no hay confirmacion de cobertura ni de calidad en ese idioma.
- Riesgo de alucinacion: no evaluado. Si el adaptador se usa para generacion de texto abierta pese a estar ajustado a una tarea discriminativa, el riesgo de degradacion respecto al modelo base es alto y no esta medido.
- Desajuste entre la etiqueta `text-generation` y la tarea probable (XNLI, clasificacion de tres clases). Esto puede provocar que herramientas automaticas del ecosistema HuggingFace carguen el modelo con expectativas incorrectas.
- Sesgos: no documentados. El corpus XNLI y el modelo base Llama 3.2 tienen sesgos conocidos en la literatura general, pero no existe analisis especifico para este adaptador.
- Idiomas de bajos recursos: un ajuste con 5.000 ejemplos en suajili es insuficiente para garantizar generalizacion. El porcentaje de datos indicado en el nombre (`1_40`) sugiere un regimen experimental, no un ajuste orientado a produccion.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de uso, replicacion o validacion por terceros.
- La version de PEFT indicada (0.17.1) es reciente; adaptadores guardados con versiones muy nuevas pueden requerir esa misma version o superior para cargarse correctamente.
- No se publican pesos fusionados ni formatos GGUF, AWQ o GPTQ, lo que complica el despliegue en entornos que no sean Python con `transformers` y `peft`.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/WijewardhanaNT/xnli_en_and_sw_5000_percentage_1_40_DoRA_llama-3.2
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B
- Referencia citada en la plantilla de la model card (estimacion de emisiones): https://mlco2.github.io/impact
- Lacoste et al. (2019), `arxiv:1910.09700`: https://arxiv.org/abs/1910.09700

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo. Los enlaces recuperados correspondian a servicios de aparcamiento del aeropuerto de Bruselas y no guardan relacion con el contenido de esta ficha, por lo que se han descartado.
