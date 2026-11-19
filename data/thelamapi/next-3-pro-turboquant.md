# thelamapi/Next-3-Pro-TurboQuant

## Resumen

Next-3-Pro-TurboQuant es una distribucion de pesos en formato GGUF del modelo Next-3-Pro, publicada por el usuario thelamapi en Hugging Face. El repositorio contiene los pesos cuantizados en Q8_0 empaquetados para su uso con llama-tq, una variante de llama.cpp que incorpora TurboQuant, una tecnica de compresion de la cache KV durante la inferencia. El modelo se distribuye con MTP (multi-token prediction) deshabilitado y se ha validado contra un commit concreto de llama-tq.

El modelo cuenta con 26.895.998.464 parametros totales segun los metadatos de safetensors, lo que lo situa en la categoria de aproximadamente 27.000 millones de parametros. El repositorio ocupa 45,1 GB, coherente con pesos en Q8_0. La model card es extremadamente escueta: no documenta la arquitectura interna, el proceso de entrenamiento, los idiomas soportados ni la licencia, y no incluye resultados de benchmarks de calidad.

La relevancia de esta publicacion es fundamentalmente de infraestructura: demuestra el uso de TurboQuant para comprimir la cache KV en inferencia sobre GPU A100 de 80 GB, con mediciones de velocidad de decodificacion y consumo de memoria de contexto. No obstante, al no haber informacion sobre el modelo base ni sobre su rendimiento en tareas, su evaluacion practica queda limitada a los datos tecnicos de despliegue aportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 26.895.998.464 (aproximadamente 26,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8.192 tokens (capacidad usada en las pruebas de la model card) |
| Tipos de cuantizacion | Q8_0 para pesos; cache KV en q8_0/q8_0 o ktq4_1/vtq4_1 (TurboQuant) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (Next-3-Pro-Q8_0-TurboQuant-Compat-NoMTP.gguf) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Next-3-Pro: la model card no especifica si se trata de un transformer denso, un MoE, un modelo hibrido o cualquier otra variante, ni detalla el numero de capas, dimensiones ocultas o mecanismo de atencion. Tampoco se documentan los datos de entrenamiento, el volumen de tokens, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

La innovacion tecnica documentada se refiere exclusivamente al empaquetado y al runtime: los pesos estan en Q8_0 y se han preparado para llama-tq, una bifurcacion de llama.cpp que implementa TurboQuant para comprimir la cache KV durante la inferencia. El modelo se distribuye con MTP deshabilitado, lo que sugiere que el modelo base podria soportar multi-token prediction, pero esta build concreta no lo activa. La model card cita como referencia el commit `f572e7348edafba2df338a50e3fd8403b8855d4b` de llama-tq.

## Capacidades

- Generacion de texto autoregresiva mediante llama-completion, segun el ejemplo de uso incluido en la model card.
- Compatibilidad con llama-tq y sus tipos de cache KV TurboQuant (ktq4_1 y vtq4_1), ademas de la cuantizacion estandar q8_0.
- Soporte de Flash Attention (`-fa on`) en el comando de ejemplo.
- Descarga de capas a GPU mediante `-ngl 999`, es decir, offload completo del modelo a GPU.
- No se documentan capacidades de razonamiento, codigo, matematicas, vision, audio, tool calling, function calling ni comportamiento agentico.
- No se documentan capacidades multilingues; el unico indicio es el prompt de ejemplo "Merhaba" (saludo en turco), que no constituye una declaracion de soporte idiomatico.
- No se documenta un modo de razonamiento explicito (thinking mode) ni ninguna capacidad especial adicional.

## Casos de uso

- Despliegue de inferencia en GPU A100 de 80 GB: la model card aporta mediciones directas en este hardware con 8.192 tokens de contexto, por lo que es el escenario validado para usar el modelo con llama-tq y offload completo.
- Pruebas de compresion de cache KV: el repositorio sirve para comparar el consumo de memoria de contexto entre q8_0/q8_0 (421 MiB) y ktq4_1/vtq4_1 (565 MiB) en un modelo de aproximadamente 27.000 millones de parametros, util para evaluar el impacto de TurboQuant en el runtime.
- Evaluacion de runtimes alternativos a llama.cpp: al requerir un commit concreto de llama-tq, el modelo permite validar la compatibilidad de esta bifurcacion con pesos Q8_0 y con las opciones `-ctk` y `-ctv`.
- Generacion de texto por linea de comandos: el binario llama-completion con el prompt de ejemplo permite integraciones simples en scripts y pipelines de prueba.
- Benchmarking de velocidad de decodificacion: con 42,43 tok/s en q8_0 y 42,24 tok/s en TurboQuant sobre A100 80 GB, el modelo puede usarse como referencia para medir el rendimiento de configuraciones de cache KV en hardware comparable.
- Pruebas de contexto largo controlado: la capacidad de 8.192 tokens permite experimentar con cargas de contexto moderadas y observar el crecimiento de la memoria de contexto en GPU.

## Benchmarks y rendimiento

La model card unicamente publica mediciones de velocidad de decodificacion y memoria de contexto en una A100 de 80 GB, con mediana de tres ejecuciones por modo, capacidad de contexto de 8.192 tokens, prompt corto y presupuesto de salida de 128 tokens.

| Cache KV | Decodificacion (tok/s) | Memoria de contexto en GPU |
|---|---:|---:|
| q8_0 / q8_0 | 42,43 | 421 MiB |
| ktq4_1 / vtq4_1 | 42,24 | 565 MiB |

Segun el autor, TurboQuant consumio 144 MiB mas de memoria de contexto en GPU y decodifico un 0,45 % mas lento en esta prueba. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 45,1 GB en Q8_0, por lo que se necesita al menos esa cantidad de memoria para cargar los pesos completos en GPU con offload total (`-ngl 999`).
- GPU recomendadas: A100 de 80 GB, unico hardware con mediciones publicadas en la model card.
- GPU de consumo: no se aportan datos de ejecucion en RTX 4090, RTX 3090 u otras GPU consumer; con 45,1 GB de pesos en Q8_0, una RTX 4090 de 24 GB no puede alojar el modelo completo en VRAM y requeriria offload parcial a CPU o cuantizaciones mas agresivas no publicadas en este repositorio.
- Opciones de despliegue: llama-tq (bifurcacion de llama.cpp) en el commit `f572e7348edafba2df338a50e3fd8403b8855d4b`; el tag `endpoints_compatible` sugiere compatibilidad con endpoints, pero no se detalla el mecanismo. No se documenta soporte para vLLM, TGI, Ollama ni otras herramientas.
- Latencia y throughput: 42,43 tok/s en decodificacion con cache q8_0/q8_0 y 42,24 tok/s con ktq4_1/vtq4_1 en A100 80 GB, con 8.192 tokens de contexto, prompt corto y 128 tokens de salida.
- Memoria de contexto en GPU: 421 MiB con q8_0/q8_0 y 565 MiB con ktq4_1/vtq4_1 en las condiciones de la prueba.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica el modelo base Next-3-Pro ni ofrece datos de rendimiento en tareas que permitan una comparacion rigurosa con alternativas de tamano similar (por ejemplo, modelos densos de aproximadamente 27.000 millones de parametros). Tampoco se dispone de la licencia ni de los idiomas, lo que impide comparar condiciones de uso.

## Limitaciones y advertencias

- Ausencia total de informacion sobre el modelo base: no se documentan arquitectura, datos de entrenamiento, alineacion ni evaluaciones de calidad, lo que impide valorar sesgos, alucinacion o robustez.
- Licencia no disponible: no se puede determinar si el uso comercial esta permitido; en produccion debe tratarse como no autorizado hasta confirmacion.
- Idiomas no disponibles: no hay declaracion de cobertura idiomatica; el prompt de ejemplo en turco no es evidencia suficiente.
- Dependencia de un runtime especifico: requiere llama-tq en un commit concreto, lo que limita la portabilidad frente a llama.cpp estandar, vLLM u Ollama.
- MTP deshabilitado: esta build no activa multi-token prediction, por lo que no se beneficia de esa posible aceleracion.
- TurboQuant no aporto ventajas en la prueba publicada: consumio 144 MiB mas de contexto y fue un 0,45 % mas lento que q8_0/q8_0 en A100 80 GB, por lo que su beneficio en este escenario es cuestionable.
- Huella de memoria elevada: 45,1 GB en Q8_0 impide el despliegue completo en GPU consumer de 24 GB sin offload o recuantizacion.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Riesgo de alucinacion: no cuantificado por el autor; al no haber evaluaciones, debe asumirse el riesgo habitual de los modelos generativos.

## Enlaces

- Hugging Face: https://huggingface.co/thelamapi/Next-3-Pro-TurboQuant
- Repositorio llama-tq (referenciado por el commit `f572e7348edafba2df338a50e3fd8403b8855d4b`): no se proporciona URL en la informacion disponible.
- Paper, blog, demo o repositorio adicionales: no disponibles.
