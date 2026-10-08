# xbill9/gemma-4-12B-it-qat-q4_0-exact-gguf

## Resumen

Este repositorio contiene una conversion no oficial a GGUF del modelo Gemma 4 12B-it, en su variante entrenada con cuantizacion consciente (QAT, quantization-aware training) por Google DeepMind. Lo publica el usuario independiente xbill9, sin afiliacion con Google, y su proposito es ofrecer un GGUF de 4 bits en el que cada peso reconstruido sea exactamente el valor que produjo el QAT de Google, incluido el tensor de embeddings de tokens. El resultado ocupa 6,72 GB (6.716.356.736 bytes) frente a los 6,98 GB del GGUF oficial de Google.

El modelo base es google/gemma-4-12B-it-qat-q4_0-unquantized y cuenta con 11.907.350.576 parametros (unos 11,9 mil millones). Se distribuye bajo licencia Apache 2.0, en formato GGUF con cuantizacion Q4_0, y es exclusivamente de texto: la torre de vision vive en un mmproj GGUF aparte que no se incluye.

Su relevancia es doble. Por un lado, permite ejecutar un modelo de 12B en GPUs de consumo con un peso de 6,7 GB. Por otro, es un experimento de fidelidad de cuantizacion: el autor reconstruye cada bloque de pesos buscando el paso de cuantizacion entrenado por Google en lugar del paso estandar de llama.cpp (magnitud maxima del bloque dividida entre 8), lo que eleva el porcentaje de valores identicos bit a bit respecto al origen QAT. Como contrapartida, el autor advierte de que la build se verifico en local contra su fuente pero aun no se ha cargado en llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Gemma 4); detalles completos no disponibles en la informacion proporcionada |
| Parametros totales | 11.907.350.576 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (pesos de atencion y FFN, mas token_embd); vectores de norma y escalas en F32 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (Apache 2.0, con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna completa del modelo. Los nombres de tensor del GGUF (`attn_q`, `attn_k`, `attn_v`, `attn_output`, `ffn_gate`, `ffn_up`, `ffn_down`, `token_embd` y vectores de norma) corresponden a un transformer decoder con atencion y redes feed-forward, el esquema habitual de la familia Gemma. Llama la atencion que el recuento de tensores no es homogeneo: hay 48 tensores de `attn_k`, `attn_output`, `attn_q`, `ffn_down`, `ffn_gate` y `ffn_up`, pero solo 40 de `attn_v`, lo que sugiere algun tipo de comparticion o trato diferenciado por capas; el material no lo explica.

El entrenamiento original es de Google DeepMind e incluye QAT: los pesos ya vienen entrenados para tolerar la cuantizacion a 4 bits, de ahi el sufijo `qat-q4_0` del modelo base. Esta build no reentrena nada; parte de google/gemma-4-12B-it-qat-q4_0-unquantized (revision b6ed862) y reconstruye los pesos como Q4_0.

La innovacion tecnica concreta de esta build es el metodo de reconstruccion de bloques. En lugar de usar el paso estandar de llama.cpp (magnitud maxima del bloque dividida entre 8), el script busca el paso entrenado que situe todos los valores del bloque en un nivel entero: dividido entre 8, 7, ... hasta 1, refinado por minimos cuadrados. Los metadatos (tokenizer, chat template, hiperparametros y orden de tensores) se copian byte a byte del GGUF oficial de Google en la revision 29d0977. Los porcentajes de valores identicos bit a bit al origen QAT por tensor son: `token_embd` 96,88 %, `attn_v` 96,88 %, `ffn_down` 96,88 %, `ffn_up` 96,86 %, `ffn_gate` 96,83 %, `attn_k` 96,80 %, `attn_q` 96,78 % y `attn_output` 96,77 %. Los valores no identicos difieren por el redondeo a fp16 de la escala de bloque. El autor publica el desglose por tensor en `evidence/build_report.json` y el script `gguf_exact.py`, que solo requiere numpy y aborta si algun bloque no cae en una rejilla de 4 bits.

## Capacidades

- Generacion de texto conversacional: la etiqueta del repositorio incluye `conversational` y la pipeline es text-generation, con chat template copiado del GGUF oficial.
- Modelo exclusivamente de texto: la vision queda fuera de esta build, ya que el mmproj GGUF de Google no se incluye.
- Razonamiento e instrucciones: el sufijo `-it` indica ajuste por instrucciones del modelo base de Google; el alcance exacto de las capacidades de razonamiento no esta detallado en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, audio, vision): no disponible; la unica indicada explicitamente es la ausencia de vision.

## Casos de uso

- Inferencia local en GPU de consumo: con 6,72 GB de pesos en Q4_0, el modelo se puede cargar en GPUs de 12 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4080), lo que permite disponer de un modelo de 12B en hardware de escritorio sin depender de la nube.
- Despliegue en portatiles con memoria unificada: en equipos Apple Silicon con 16 GB o mas, un GGUF de este tamano deja margen para el contexto y el resto del sistema, algo que un modelo de 12B en fp16 (unos 24 GB) no permite.
- Reproduccion de builds de cuantizacion: dado que el autor publica el script `gguf_exact.py` y el informe `build_report.json`, sirve como caso practico para quien quiera auditar o replicar conversiones GGUF fieles al QAT original.
- Generacion de texto y asistencia conversacional offline: al ser text-generation con chat template incluido, encaja en asistentes de escritorio, resumen de documentos o redaccion asistida en entornos sin conectividad.
- Comparacion de fidelidad de cuantizacion en investigacion: el par Google GGUF / esta build permite medir el efecto de cambiar el paso de cuantizacion por bloque (Q4_0 con paso entrenado frente a Q6_K en `token_embd`) sobre la perplejidad y la calidad, una vez validado en llama.cpp.
- Evaluacion y benchmarking de modelos abiertos: como build no oficial de bajo coste computacional, resulta util para pruebas comparativas internas antes de decidir un despliegue mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que la divergencia respecto a bf16, la velocidad y el consumo de memoria se midieron unicamente para la build E4B (xbill9/gemma-4-E4B-it-qat-q4_0-exact-gguf), pero esas cifras no se incluyen en el material proporcionado, y esta build de 12B no se ha cargado todavia en llama.cpp.

## Requisitos de hardware

- VRAM estimada para los pesos: 6,72 GB (6.716.356.736 bytes) solo en pesos Q4_0; hay que sumar el contexto y los buffers de llama.cpp, por lo que en la practica conviene disponer de 8-12 GB.
- Comparacion de tamano: 6,72 GB frente a 6,98 GB del GGUF oficial Q4_0 de Google; el ahorro se concentra en el tensor `token_embd`, que aqui es Q4_0 en lugar de Q6_K.
- GPUs consumer compatibles: RTX 3060 12 GB y RTX 4060 Ti 16 GB como minimo razonable en el segmento consumer; RTX 4080, RTX 4090 y RTX 5090 con holgura. En GPUs de 8 GB o menos habria que recurrir a offload parcial de capas a CPU.
- GPUs de datacenter: A100, H100 y L40S no son necesarias para el tamano del modelo, pero permitirian lotes grandes y contextos largos en servidor.
- Memoria unificada: equipos Apple Silicon con 16 GB o mas pueden ejecutarlo por CPU/GPU combinadas.
- Opciones de despliegue: llama.cpp (formato nativo del repo), Ollama y LM Studio como envoltorios habituales de GGUF. vLLM y TGI no son las rutas tipicas para GGUF puro. El soporte en endpoints aparece como `endpoints_compatible` en las etiquetas del repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para esta build, y el autor indica que la velocidad solo se midio para la version E4B.

## Comparativa con modelos similares

| Modelo | Parametros | Formato y cuantizacion | Tamano | Licencia | Estado |
|---|---|---|---|---|---|
| xbill9/gemma-4-12B-it-qat-q4_0-exact-gguf (este) | 11,9 B | GGUF, Q4_0 reconstruido del QAT | 6,72 GB | Apache 2.0 | No oficial; verificado offline, no cargado aun en llama.cpp |
| google/gemma-4-12B-it-qat-q4_0-gguf | 11,9 B (base) | GGUF, Q4_0 (con `token_embd` en Q6_K) | 6,98 GB | Apache 2.0 | Oficial de Google; referencia de partida |
| xbill9/gemma-4-E4B-it-qat-q4_0-exact-gguf | no disponible | GGUF, Q4_0 reconstruido del QAT | no disponible | Apache 2.0 | No oficial; construido con el mismo script |

Datos de contexto, benchmarks y rendimiento de las alternativas: no disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Build no oficial: no esta afiliada ni respaldada por Google; los problemas deben reportarse al autor de la build, no a Google.
- No validada en ejecucion: el autor indica explicitamente que la build se verifico offline contra su fuente pero aun no se ha cargado en llama.cpp. Hasta que eso ocurra, no hay confirmacion de que el modelo funcione correctamente en inferencia.
- Solo texto: no incluye la torre de vision; cualquier caso de uso multimodal queda fuera.
- Fidelidad no total: los pesos reconstruidos son identicos bit a bit al origen QAT en torno al 96,8 % de los valores por tensor; el resto difiere por el redondeo a fp16 de la escala de bloque.
- Ausencia de benchmarks propios: no hay mediciones publicadas de calidad, divergencia respecto a bf16, velocidad ni memoria para esta build de 12B.
- Idiomas y contexto sin especificar: la informacion proporcionada no indica cobertura linguistica ni longitud de contexto, lo que impide valorar su idoneidad para casos multilingues o de contexto largo.
- Sesgos y alucinacion: no disponibles en la informacion proporcionada; al ser un derivado directo de Gemma 4, heredaria las caracteristicas del modelo base de Google, pero el material no aporta datos concretos.
- Licencia: Apache 2.0 segun el repositorio, con enlace a la licencia especifica de Gemma 4 de Google. Conviene revisar ese enlace antes de un uso comercial, ya que las condiciones de la familia Gemma pueden imponer obligaciones adicionales no reflejadas en la ficha del repositorio.
- Repositorio con adopcion minima: 38 descargas y 0 likes en la fecha de creacion (8 de octubre de 2026), sin senales de uso en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xbill9/gemma-4-12B-it-qat-q4_0-exact-gguf
- Modelo base: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized (revision b6ed862)
- GGUF oficial de Google: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-gguf (revision 29d0977)
- Build equivalente en 4B: https://huggingface.co/xbill9/gemma-4-E4B-it-qat-q4_0-exact-gguf
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Script de reconstruccion: gguf_exact.py, incluido en el repositorio del modelo; requiere unicamente numpy
- Informe de build por tensor: evidence/build_report.json, dentro del repositorio
- Model card original de Google: ORIGINAL_README.md, conservado sin cambios en el repositorio

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; unicamente aparecieron paginas sin relacion con el contenido tecnico solicitado, por lo que no se incluyen como enlaces.
