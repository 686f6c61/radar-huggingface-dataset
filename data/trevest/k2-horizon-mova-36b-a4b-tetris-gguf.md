# trevest/K2-Horizon-MoVA-36B-A4B-Tetris-GGUF

## Resumen

K2-Horizon-MoVA-36B-A4B "Tetris" es una cuantizacion GGUF del modelo IFM/K2-Horizon-MoVA-36B-A4B, publicada por el usuario trevest. Se trata de un transformer de tipo Mixture-of-Experts (MoE) con una innovacion de atencion denominada Mixture-of-Values Attention (MoVA): cada bloque de atencion enruta los valores a traves de un banco de 64 expertos de valor, de los que se seleccionan los 4 mejores segun una compuerta (`attn_v_gate`) de dimensiones [2560, 64].

El modelo almacena 37.444.792.020 parametros (etiquetado comercialmente como 36B) pero solo activa aproximadamente 4B por token, lo que permite una inferencia mucho mas rapida que un modelo denso de tamano equivalente. La aportacion concreta de esta ficha es una cuantizacion IQ4_XS de 18,77 GiB optimizada para caber en una GPU de 24 GB, en la que el tensor de enrutamiento `attn_v_gate` se mantiene en F32 en lugar de cuantizarse, evitando que un error en la compuerta cambie de forma discreta la eleccion de experto.

Es relevante ahora porque el modelo base, con una ventana de contexto nativa de 524.288 tokens, no esta todavia en la rama principal de llama.cpp: requiere el PR ggml-org/llama.cpp#29535. Esta publicacion proporciona pesos ya cuantizados y verificados en servicio (llama-server) a 36.864 tokens de contexto sobre una GPU de 24 GB, ademas de mediciones de KLD, velocidad y pico de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con Mixture-of-Values Attention (MoVA); atencion completa en todas las capas |
| Parametros totales | 37.444.792.020 (denominado 36B por el autor del modelo base) |
| Parametros activos | Aproximadamente 4B por token (MoE) |
| Longitud de contexto | 524.288 tokens nativos según el modelo base; en este quant se ha verificado llama-server a 36.864 tokens |
| Tipos de cuantizacion | IQ4_XS (este repositorio); existen otras variantes del base (Q8_0, APEX-compact, APEX-mini, NVFP4) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (un unico archivo de 20.157.149.920 B, 18,77 GiB) |

## Arquitectura y entrenamiento

La arquitectura combina dos mecanismos de enrutamiento. Por un lado es un MoE clasico, donde las capas feed-forward se reparten entre expertos y solo se activa una fraccion por token (4B de 36B almacenados). Por otro, incorpora MoVA (Mixture-of-Values Attention), que sustituye la proyeccion de valores de cada bloque de atencion por un banco de 64 expertos de valor seleccionados mediante una compuerta `attn_v_gate` de forma [2560, 64], de la que se toman los 4 mejores. Segun la model card, todas las capas son de atencion completa, lo que implica un coste de KV de aproximadamente 102 KiB por token con cuantizacion q8_0.

No se dispone de informacion detallada sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de alineacion como RLHF o DPO en la informacion proporcionada; la model card del modelo base indica que los checkpoints intermedios, los datos y el codigo de entrenamiento se publicaran mas adelante. La innovacion practica de esta ficha concreta es de cuantizacion: llama.cpp protege los enrutadores MoE de la cuantizacion por nombre de tensor (`ffn_gate_inp`), pero `attn_v_gate` no figura en esa lista, por lo que una cuantizacion estandar lo degrada como cualquier matriz. Dado que un error en el enrutador cambia una eleccion discreta de experto en lugar de anadir ruido suave, este archivo mantiene ese tensor en F32 con un coste adicional de solo 24 MiB. El modelo soporta un modo de razonamiento controlable mediante el kwarg `reasoning_effort` de la plantilla de chat (`low`/`high`, siendo `high` el valor por defecto).

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`), con plantilla de chat compatible con Jinja.
- Razonamiento explicito en multiples pasos mediante modo de pensamiento, con niveles de esfuerzo configurables (`reasoning_effort` en la plantilla de chat); en nivel alto puede consumir miles de tokens pensando.
- Capacidad de seguir instrucciones y mantener conversaciones multi-turno.
- Soporte de contexto muy largo: verificado en servicio con una peticion de 36.264 tokens sobre una ventana de 36.864, con el modelo base declarando 524.288 tokens nativos.
- Integracion con `llama-server`, lo que habilita el uso como endpoint compatible con la API de OpenAI cuando se combina con las herramientas adecuadas.
- Capacidades multilingues, de codigo, matematicas, vision, audio o tool calling: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos largos en una sola pasada: con contexto verificado de mas de 36.000 tokens y hasta 524.288 nativos en el modelo base, permite resumir o extraer informacion de contratos, informes tecnicos o expedientes completos sin recurrir a troceado y recuperacion.
- Asistente conversacional local en estacion de trabajo: al ocupar 18,77 GiB en IQ4_XS, cabe en una GPU de 24 GB junto con la cache KV, lo que permite desplegar un asistente privado sin depender de APIs externas.
- Razonamiento asistido con presupuesto de tokens controlable: el parametro `reasoning_effort` permite alternar entre respuestas rapidas (nivel bajo) y cadenas de razonamiento extensas (nivel alto), ajustando coste y latencia segun la tarea.
- Procesamiento por lotes con prefill intensivo: con 4.069 t/s de prefill a profundidad 0 en una RTX 5090 Laptop, resulta adecuado para clasificar, resumir o transformar grandes volumenes de texto donde el cuello de botella es la entrada, no la generacion.
- Despliegue como backend compatible con OpenAI mediante llama-server: al exponer un endpoint HTTP, puede alimentar aplicaciones existentes que ya consumen la API de OpenAI, sin cambios de codigo en el cliente.
- Prototipado e investigacion de arquitecturas MoE con MoVA: al ser una arquitectura novedosa (enrutamiento de valores por experto), sirve como banco de pruebas para estudiar el impacto de la cuantizacion selectiva de enrutadores.
- Inferencia en portatiles de gama alta: las mediciones del autor (RTX 5090 Laptop, 23 GiB utilizables) demuestran viabilidad en hardware movil de gama alta, util para desarrollo en desplazamiento.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye comparativas de KLD frente a otras variantes (APEX, NVFP4), lo que lo hace util como referencia para decidir el equilibrio entre tamano y fidelidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Si se incluyen mediciones de divergencia respecto a los logits del Q8_0 oficial, calculadas sobre wikitext-2 (test, contexto 2048, 40 fragmentos):

| Cuantizacion | GiB | KLD media | Top-1 coincidente | KLD percentil 99 | PPL(Q)/PPL(Q8_0) |
|---|---|---|---|---|---|
| Esta ficha (IQ4_XS, router F32) | 18,77 | 0,0221 | 93,1% | 0,185 | 1,0099 |
| IQ4_XS estandar (ngquocvinh) | 18,75 | 0,0224 | 93,1% | 0,185 | no disponible |
| Variante con capas 12-38 `ffn_up/gate_exps` en IQ3_S | 17,77 | 0,0288 | 92,2% | 0,236 | 1,0191 |
| APEX-compact (Myric) | 16,69 | 0,0361 | 91,4% | 0,327 | 1,0181 |
| APEX-mini (Myric) | 14,86 | 0,0643 | 89,1% | 0,593 | no disponible |
| NVFP4 (WhiskyAKM, router en NVFP4) | 19,82 | 0,0668 | 87,9% | 0,533 | no disponible |

El autor senala que la ventaja del router en F32 es pequena a 4,25 bpw, pero que la penalizacion se agrava en formato de 4 bits en coma flotante: el archivo NVFP4, pese a ser el mas grande, obtiene la peor KLD porque su router tambien esta en NVFP4.

Velocidad medida con llama-bench en una RTX 5090 Laptop (todas las capas en GPU, flash attention, K/V en q8_0):

| Profundidad | 0 | 8K | 16K | 32K |
|---|---|---|---|---|
| Decodificacion (t/s) | 134 | 100 | 78 | 53 |
| Prefill, lote de 2K (t/s) | 4.069 | 3.208 | 2.469 | 1.423 |

## Requisitos de hardware

- VRAM para los pesos: 18,77 GiB en IQ4_XS (20.157.149.920 B). El archivo completo pesa 20,2 GB en disco.
- Cache KV: aproximadamente 102 KiB por token con K/V en q8_0, dado que todas las capas son de atencion completa. A 36.864 tokens esto supone varios GiB adicionales.
- Pico de memoria medido en servicio: 23.192 MiB para una peticion de 36.264 tokens sobre una ventana de 36.864, con un total de 23 GiB utilizables en la tarjeta de referencia.
- GPU recomendadas: una RTX 5090 Laptop (24 GB nominales, 23 GiB utilizables) es la plataforma de referencia del autor. Cualquier GPU con 24 GB o mas (RTX 4090, RTX 5090 de escritorio, A100 40 GB, H100) deberia poder ejecutarlo; en tarjetas de 24 GB el contexto es el factor limitante, no el modelo.
- Despliegue en GPU de consumo: si, en tarjetas de 24 GB. Con menos memoria habria que descargar expertos a CPU, lo que segun el autor reduce la velocidad de decodificacion entre un 40% y un 55%.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-bench`, `llama-quantize`). Es imprescindible el PR ggml-org/llama.cpp#29535 (medido en su head `fe498bd`); la bifurcacion de IFM en `42adf01` ofrece la misma KLD y velocidad, pero en esfuerzo de razonamiento bajo filtra la etiqueta `</ifm|think_faster>` al contenido. vLLM, TGI u Ollama: no disponible en la informacion proporcionada.
- Latencia y throughput: decodificacion de 134 t/s a profundidad 0 y 53 t/s a 32K; prefill de 4.069 t/s (lote de 2K) a profundidad 0 y 1.423 t/s a 32K. En servicio se midieron 2.180 t/s de prefill y 50,3 t/s de decodificacion a plena profundidad de contexto.
- Comando de referencia: `llama-server -m <archivo.gguf> -c 36864 -ngl 99 -fa on -ctk q8_0 -ctv q8_0 -np 1 --jinja --temp 1.0 --top-p 0.95`.

## Comparativa con modelos similares

Comparativa con otras cuantizaciones del mismo modelo base (datos de la model card; todas las cifras de KLD sobre wikitext-2 a contexto 2048 con 40 fragmentos):

| Variante | Tamano (GiB) | KLD media | Top-1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Esta ficha (IQ4_XS, router F32) | 18,77 | 0,0221 | 93,1% | apache-2.0 | GGUF en HuggingFace |
| IQ4_XS estandar (ngquocvinh) | 18,75 | 0,0224 | 93,1% | apache-2.0 (heredada) | GGUF en HuggingFace |
| APEX-compact (Myric) | 16,69 | 0,0361 | 91,4% | apache-2.0 (heredada) | GGUF en HuggingFace |
| APEX-mini (Myric) | 14,86 | 0,0643 | 89,1% | apache-2.0 (heredada) | GGUF en HuggingFace |
| NVFP4 (WhiskyAKM) | 19,82 | 0,0668 | 87,9% | apache-2.0 (heredada) | GGUF en HuggingFace |

Comparativa con modelos de otros desarrolladores de la misma categoria (MoE de ~30-40B con ~3-4B activos): no disponible en la informacion proporcionada, ya que no se han facilitado resultados de benchmarks del modelo base frente a alternativas.

## Limitaciones y advertencias

- El modelo base no esta integrado en la rama principal de llama.cpp: es obligatorio aplicar el PR #29535 o usar una bifurcacion compatible, lo que complica el despliegue en entornos con versiones fijadas de llama.cpp.
- Con la bifurcacion de IFM (`42adf01`) en esfuerzo de razonamiento bajo se filtra la etiqueta `</ifm|think_faster>` en el contenido, lo que puede romper el parseo en produccion; el PR resuelve este problema con un parser dedicado.
- En modo de razonamiento alto (el valor por defecto), el modelo puede gastar miles de tokens pensando antes de responder: hay que presupuestar `max_tokens` de forma generosa o configurar `reasoning_effort` explicitamente.
- Todas las capas son de atencion completa, con un coste de KV de aproximadamente 102 KiB por token en q8_0. Esto limita fuertemente el contexto alcanzable en tarjetas de 24 GB (36.864 tokens verificados) pese a que el modelo base declare 524.288 tokens nativos.
- Descargar expertos enrutados a la CPU para ganar contexto penaliza la decodificacion entre un 40% y un 55% segun las mediciones del autor.
- Riesgo de alucinacion, sesgos conocidos y comportamiento en idiomas distintos del ingles: no disponible en la informacion proporcionada. No se han facilitado evaluaciones de sesgo ni de seguridad.
- La cuantizacion IQ4_XS introduce una divergencia respecto a los logits del Q8_0 oficial (KLD media 0,0221 y solo un 93,1% de coincidencia en top-1); para tareas sensibles a la precision podria ser preferible una cuantizacion mayor.
- Licencia Apache-2.0, que permite uso comercial siempre que se conserven los avisos de copyright y licencia y se documenten los cambios. No se han identificado restricciones adicionales en la informacion disponible, pero conviene verificar la licencia del modelo base y de los pesos de origen.

## Enlaces

- Repositorio de esta cuantizacion: https://huggingface.co/trevest/K2-Horizon-MoVA-36B-A4B-Tetris-GGUF
- Modelo base: https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B
- Pesos oficiales en BF16 y GGUF: https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B-GGUF
- Matriz de importancia (imatrix) utilizada: https://huggingface.co/ngquocvinh/K2-Horizon-MoVA-36B-A4B-GGUF
- Cuantizaciones APEX y hallazgo sobre la cuantizacion del router: https://huggingface.co/Myric/K2-Horizon-MoVA-36B-A4B-APEX-GGUF
- PR necesario en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/29535
- Mirror de GGUF del modelo base: https://huggingface.co/SAIFIINDUSTRIES/K2-Horizon-MoVA-36B-A4B-GGUF
- Ficha del modelo en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/k2-horizon-mova-36b-a4b-gguf-ifm
- Ficha del modelo en Applied: https://theapplied.co/models/ifm-k2-horizon-mova-36b-a4b-gguf
- Ficha del modelo en local-ai-zone: https://local-ai-zone.github.io/models/k2-horizon-mova-36b-a4b.html
