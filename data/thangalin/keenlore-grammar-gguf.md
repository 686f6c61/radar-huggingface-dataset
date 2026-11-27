# thangalin/KeenLore-Grammar-GGUF

## Resumen

KeenLore Grammar es un adaptador LoRA publicado por el desarrollador thangalin para el modelo Qwen3.6-35B-A3B, un transformer de mezcla de expertos (MoE) de 35.000 millones de parametros totales y 3.000 millones activos por token. El adaptador esta especializado en la deteccion de errores gramaticales en prosa de ficcion en ingles: recibe un pasaje de parrafos numerados y devuelve un objeto JSON con cada error, su justificacion breve y la correccion propuesta. Su proposito original es alimentar el corrector del proyecto KeenLore.

La relevancia de esta publicacion radica en su enfoque de destilacion sobre el propio modelo base: el adaptador se entrena para reproducir los hallazgos de la version completa en bf16 del mismo modelo, pero con menos tokens y en formato cuantizado GGUF. Segun la model card, el adaptador iguala la capacidad de deteccion del modelo base sin adaptador (103 hallazgos capturados sobre 116 del profesor) mientras reduce un 57% el consumo de tokens y elimina las respuestas no parseables.

El modelo se distribuye exclusivamente como adaptador GGUF compatible con llama.cpp, con un tamano de repositorio de 0,2 GB, y esta pensado para ejecutarse en una GPU con 8 GB de memoria, delegando los expertos enrutados a la RAM del sistema. La licencia es Apache-2.0 y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer MoE (Qwen3.6-35B-A3B) con Gated DeltaNet |
| Parametros totales | 42.332.160 (adaptador); modelo base: 35.000 millones |
| Parametros activos | 3.000 millones (modelo base, por token) |
| Longitud de contexto | 16.384 tokens (configuracion de llama-server recomendada) |
| Tipos de cuantizacion | Adaptador en f32 GGUF; base recomendado UD-Q4_K_XL |
| Idiomas soportados | Ingles (ortografia canadiense, estadounidense y britanica) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (adaptador LoRA en f32); base en GGUF |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.6-35B-A3B, un modelo de mezcla de expertos con 35.000 millones de parametros totales y 3.000 millones activos por token, que combina atencion completa con proyecciones Gated DeltaNet y un experto compartido. El LoRA tiene rango 32 y alpha 32, y se entrena sobre las capas de atencion completa, las proyecciones Gated DeltaNet y el experto compartido; los expertos enrutados permanecen sin modificar. El adaptador se distribuye en f32 GGUF para cargarse con la flag `--lora` de llama.cpp.

El entrenamiento sigue un esquema de destilacion del propio modelo base: el profesor es Qwen3.6-35B-A3B en bf16 ejecutado con vLLM en modo greedy y con el razonamiento desactivado, que corrige un conjunto de pasajes con el mismo prompt del corrector. Se filtran las respuestas que no parsean, las truncadas y los pasajes donde el profesor no detecta un error plantado. Ademas, el modelo base reescribio 10.885 justificaciones de mas de una frase de 15 palabras para dejarlas en una sola frase de 12 palabras o menos. El conjunto final consta de 12.000 pares de entrenamiento y 200 de validacion (7.229 pares con hallazgos), con datos procedentes de Qwen3.6-35B-A3B Fiction (9.064 pares), PG-19 (2.312), OpenWebText (488) y C4_200M (136). La optimizacion uso tasa de aprendizaje 1e-4, calentamiento del 3%, decaimiento lineal, tamano de lote 32 y una epoca (375 pasos), con 35 minutos en una RTX PRO 6000 Blackwell. La perdida en validacion fue de 0,121.

## Capacidades

- Deteccion y correccion de errores gramaticales en prosa de ficcion en ingles, con salida estructurada en JSON.
- Justificacion breve de cada error (una frase de 12 palabras o menos) y sugerencia de correccion.
- Soporte de tres convenciones ortograficas: canadiense, estadounidense y britanica.
- Procesamiento por lotes de parrafos numerados de hasta 2.400 caracteres por pasaje.
- Manejo de nombres propios y palabras inventadas mediante una linea adicional en el mensaje de sistema.
- Decodificacion especulativa mediante la cabeza de prediccion multi-token (MTP) del modelo base.
- No dispone de modo de razonamiento activo: la configuracion recomendada lo desactiva (`--reasoning-budget 0`).
- No se declaran capacidades de vision, audio, tool calling ni uso como agente.

## Casos de uso

- Correccion de manuscritos de ficcion: el modelo procesa lotes de parrafos numerados y devuelve errores localizados con correccion, lo que permite integrarlo en un flujo editorial que aplique las sugerencias de forma semiautomatica.
- Revision de estilo ortografico regional: al soportar ortografia canadiense, estadounidense y britanica, sirve para homogeneizar un manuscrito segun el mercado de destino sin reentrenar el modelo.
- Control de calidad en pipelines de publicacion: la salida JSON estricta facilita el parseo y la validacion automatica en un CI editorial, descartando respuestas mal formadas.
- Preedicion de textos antes de enviarlos a un editor humano: el modelo reduce el ruido de errores mecanicos y de concordancia, y el editor se concentra en cuestiones de estilo.
- Despliegue en estaciones de trabajo modestas: con los expertos en RAM del sistema y el resto en una GPU de 8 GB, permite correccion local sin enviar textos a servicios externos.
- Correccion de textos generados por otros modelos: puede usarse como etapa posterior a la generacion para detectar errores gramaticales introducidos por el modelo generador.
- Procesamiento por lotes con cache de prompt: al mantener la cache activada y lotes de 4.096 tokens, el prompt de sistema se reutiliza entre ejecuciones, lo que abarata el procesamiento de grandes volumenes de texto.

## Benchmarks y rendimiento

Concordancia con el profesor (93 pasajes de validacion, 116 hallazgos del profesor):

| Modelo | Capturados | Identicos | Extra | Legibles | Tokens |
|---|---:|---:|---:|---:|---:|
| Base (sin adaptador) | 103 | 70 | 17 | 90 | 12.907 |
| KeenLore Grammar | 103 | 67 | 9 | 93 | 5.505 |

Evaluacion con ERRANT (F0.5 sobre muestras de conjuntos publicos):

| Conjunto | Items | P | R | F0.5 | F0.5 base | Tiempo | Tiempo base |
|---|---:|---:|---:|---:|---:|---:|---:|
| GMEG test | 400 | 0,773 | 0,389 | 0,645 | 0,613 | 14:14 | 27:42 |
| ErAConD | 401 | 0,604 | 0,318 | 0,512 | 0,493 | 23:11 | 44:38 |
| C4_200M | 400 | 0,490 | 0,161 | 0,348 | 0,343 | 18:29 | 50:50 |
| BEA-2019 dev | 420 | 0,458 | 0,253 | 0,394 | 0,353 | 14:14 | 32:40 |

## Requisitos de hardware

- VRAM estimada: 8 GB de GPU para el adaptador y las capas no expertas, con los expertos enrutados en RAM del sistema (`--cpu-moe`).
- GPU probada en entrenamiento: RTX PRO 6000 Blackwell (35 minutos, 375 pasos).
- GPU recomendadas para inferencia: cualquier GPU con al menos 8 GB de VRAM; el modelo base cuantizado UD-Q4_K_XL debe residir parcialmente en RAM.
- Cabe en GPU de consumo con 8 GB o mas, siempre que se disponga de RAM de sistema suficiente para los expertos.
- Despliegue: llama.cpp (probado con el commit `5bacb7c`), mediante `llama-server` con `--lora`, `--cpu-moe`, `--spec-type draft-mtp`, `-c 16384`, `-fa on` y `--jinja`.
- Latencia y throughput: no se publican cifras de tokens por segundo; los tiempos de evaluacion de la tabla anterior (14 a 23 minutos para 400-420 items) dan una referencia aproximada del coste por lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| KeenLore Grammar (este) | 42,3 M (adaptador) sobre 35 B MoE | 16.384 | Correccion gramatical en ficcion, salida JSON | Apache-2.0 | GGUF (LoRA f32) |
| Qwen3.6-35B-A3B base | 35 B (3 B activos) | no disponible | Modelo generalista | Apache-2.0 | GGUF, safetensors |
| Modelos GEC dedicados (p. ej. T5/BART ajustados) | 0,2-1 B tipico | 512-1.024 | Correccion gramatical | Variable | safetensors, GGUF |

No se dispone de datos comparativos de benchmarks frente a modelos GEC dedicados en la informacion proporcionada. La comparacion con el modelo base sin adaptador se recoge en la seccion de benchmarks.

## Limitaciones y advertencias

- Solo soporta ingles; no se declara ni evalua ningun otro idioma.
- Especifico para prosa de ficcion: su rendimiento en textos tecnicos, legales o academicos no esta evaluado.
- Requiere el prompt exacto del corrector de KeenLore (mensaje de sistema con reglas y linea de idioma, mensaje de usuario con parrafos numerados); otros prompts pueden degradar la calidad o romper el formato JSON.
- El razonamiento debe desactivarse (`--reasoning-budget 0`); activarlo altera el comportamiento esperado.
- La salida es JSON estricto; un fallo de parseo deja la respuesta sin hallazgos, por lo que conviene validar el esquema en produccion.
- Depende de una version concreta de llama.cpp (commit `5bacb7c`); cambios posteriores en el soporte de LoRA o de MTP pueden afectar al comportamiento.
- Al ser un adaptador, hereda los sesgos y riesgos de alucinacion del modelo base Qwen3.6-35B-A3B, no evaluados en la model card.
- El modelo no corrige los expertos enrutados, por lo que su conocimiento factual subyacente no se ha especializado.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base conserva su propia licencia y condiciones.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/thangalin/KeenLore-Grammar-GGUF
- Modelo base (GGUF): https://huggingface.co/unsloth/Qwen3.6-35B-A3B-MTP-GGUF
- PG-19 (DeepMind): https://github.com/deepmind/pg19
- OpenWebText: https://github.com/jcpeterson/openwebtext
- C4_200M (Stahlberg y Kumar, BEA 2021): https://arxiv.org/abs/2109.03808
- C4 (Raffel et al., 2020): https://arxiv.org/abs/1910.10683
- llama.cpp: https://github.com/ggml-org/llama.cpp
