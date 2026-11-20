# YokaiOfDusk/Qwen3.8-9b-distil-ru

## Resumen

Qwen3.8-9b-distil-ru es una coleccion de cuantizaciones GGUF publicada por el usuario YokaiOfDusk sobre el modelo base empero-ai/Qwen3.8-9B-Distill-GGUF. No se trata de un modelo entrenado desde cero, sino de una redistribucion optimizada del modelo base mediante dos tecnicas: la poda del vocabulario del tokenizador (de 248.070 a 94.726 o 39.929 tokens) y la cuantizacion con matrices de importancia (imatrix) en ruso. El objetivo es reducir el peso de las capas `embed_tokens` y `lm_head`, que en modelos con vocabularios enormes consumen una parte desproporcionada de la memoria, manteniendo practicamente intacta la calidad en ruso y en ingles.

El modelo hereda la arquitectura del base, descrita por el autor como `qwen3_5`: 24 capas de atencion lineal y 8 de atencion completa, con soporte de vision-lenguaje (VL) y decodificacion especulativa multi-token (MTP). Los pesos reales declarados en safetensors son 7.489.954.816 parametros (aproximadamente 7,5 mil millones). La model card menciona 7,7 mil millones de parametros no modificados, una pequena discrepancia atribuible a la poda del vocabulario, que elimina filas de embedding y de la cabeza de salida.

La relevancia de esta publicacion es doble. Por un lado, demuestra de forma medible (mediante BPC y KLD) el coste real de podar vocabularios en modelos multilingues: el vocabulario ru+en es practicamente gratuito para ruso e ingles, pero penaliza el codigo en +0,18 bits por caracter. Por otro, incluye dos variantes "heretic" con un adaptador LoRA fusionado que elimina los rechazos del modelo, orientadas a roleplay y contenido NSFW. Es, por tanto, un artefacto de interes para quien despliegue inferencia local en ruso con llama.cpp y quiera controlar el equilibrio entre VRAM, calidad y comportamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido `qwen3_5` (24 capas de atencion lineal + 8 de atencion completa), con VL y MTP |
| Parametros totales | 7.489.954.816 (segun safetensors); la model card cita 7,7 mil millones sin tocar |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (los ejemplos de arranque usan `-c 8192` y `-c 32768`) |
| Tipos de cuantizacion | q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_NL, IQ4_XS (imatrix en ruso) |
| Idiomas soportados | Ruso e ingles (variante ru+en); solo ruso (variante ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); no hay F16/BF16 en el repositorio |

Variantes de vocabulario:

| Variante | vocab_size | Tamano F16 (referencia) | Tamano q8_0 | Cobertura |
|---|---|---|---|---|
| ru+en | 94.726 | 14,79 GiB | 7,86 GiB | Ruso e ingles sin perdida apreciable; codigo mas caro |
| ru-only | 39.929 | 13,95 GiB | 7,42 GiB | Solo ruso; el ingles se encarece 0,44 bits/caracter |
| Base sin podar | 248.070 | no disponible | 9,11 GiB | Referencia de comparacion |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura hibrida denominada `qwen3_5`, con 24 capas de atencion lineal y 8 de atencion completa, e incluye componentes de vision-lenguaje y decodificacion especulativa multi-token (MTP). Esta publicacion no realiza ningun tipo de entrenamiento ni ajuste fino sobre los pesos originales: las filas de `embed_tokens` y `lm_head` se copian byte a byte para el subconjunto de tokens conservado, y se reescriben `vocab_size` y los identificadores de los tokens especiales. Los 7,7 mil millones de parametros restantes quedan intactos.

La innovacion tecnica principal es la poda de vocabulario combinada con cuantizacion mediante imatrix calculada sobre datos en ruso. El autor justifica la eleccion de BPC (bits por caracter, calculado como log2(PPL) multiplicado por tokens por caracter) como metrica de comparacion, ya que la perplejidad por token no es comparable entre tokenizadores distintos. La unica excepcion al "sin reentrenamiento" son los dos ficheros `heretic-lora-*`, en los que se fusiona un adaptador LoRA antes de cuantizar; el autor no publica la receta de fusion (coeficiente, modulos objetivo, base del adaptador), que queda como TODO en la model card.

## Capacidades

- Generacion de texto conversacional en ruso e ingles, con calidad practicamente identica al base sin podar en ambos idiomas (diferencias de BPC de -0,0010 y +0,0002 respectivamente).
- Razonamiento y codigo: el codigo se degrada de forma medible con la poda (+0,18 bits/caracter en ru+en, +0,26 en ru-only), por lo que la generacion de codigo es funcional pero no es el punto fuerte de esta variante.
- Capacidades de vision-lenguaje heredadas del base (el autor menciona el componente VL en la descripcion de la arquitectura), si bien no se documenta su comportamiento tras la poda del vocabulario.
- Decodificacion especulativa multi-token (MTP) heredada del modelo base.
- Dos modos de comportamiento: los cuantos estandar, alineados con el base, y los ficheros `heretic-lora-*`, que eliminan los rechazos y estan orientados a NSFW y roleplay.
- Soporte de tool calling y function calling: no documentado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas en la informacion disponible.

## Casos de uso

- Asistente conversacional en ruso para despliegue local: con el cuanto Q6_K ru+en (6,07 GiB) se obtiene un modelo conversacional que cabe en GPUs de consumo de 8-12 GB y mantiene la calidad del base en ruso (BPC 0,9357 frente a 0,9367 del base), lo que lo hace adecuado para chatbots privados sin dependencia de API.
- Servicio de inferencia en servidor con llama-server: el ejemplo de la model card arranca con `-c 32768` y `-ngl 99`, de modo que puede exponerse como endpoint compatible con la API de OpenAI para aplicaciones internas en ruso.
- Roleplay y generacion creativa sin censura: las variantes `heretic-lora-ruen-Q6_K` y `heretic-lora-ru-Q6_K` estan disenadas para escenarios de ficcion interactiva y contenido para adultos, con la advertencia explicita del autor de no colocarlas en servicios publicos sin filtrado propio.
- Procesamiento de texto en ruso con restricciones de memoria: la variante ru-only en IQ4_XS ocupa 3,88 GiB, lo que permite ejecutarla en GPUs de 6-8 GB o en CPU con llama.cpp para tareas de generacion de texto donde el ingles y el codigo no son relevantes.
- Investigacion sobre poda de vocabularios: las tablas de BPC y KLD publicadas sirven como referencia reproducible para estudiar el impacto de reducir el vocabulario en modelos multilingues, comparando el coste por dominio (ruso, ingles, codigo).
- Evaluacion comparativa de cuantizaciones: los datos de KLD por cuanto (por ejemplo, Q6_K con KLD 0,0029 en ruso frente a IQ4_XS con 0,0177) permiten seleccionar el nivel de compresion segun el presupuesto de VRAM y la tolerancia a la degradacion.
- Traduccion y generacion bilingue ru-en en entornos sin GPU dedicada: la variante ru+en en Q4_K_M (4,57 GiB) mantiene un BPC en ingles de 0,6510, practicamente identico al base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor proporciona metricas propias de calidad de tokenizacion y cuantizacion:

BPC por dominio:

| Modelo | BPC ru | BPC en | BPC code |
|---|---|---|---|
| base q8_0 | 0,9367 | 0,6509 | 0,4228 |
| ru+en F16 | 0,9357 | 0,6511 | 0,6066 |
| ru+en q8_0 | 0,9359 | 0,6510 | 0,6306 |
| ru-only F16 | 0,9358 | 1,0884 | 0,6876 |
| ru-only q8_0 | 0,9359 | 1,0874 | 0,7022 |

Coste de la poda (delta de BPC frente al base q8_0):

| Dominio | ru+en | ru-only |
|---|---|---|
| Ruso | -0,0010 | -0,0009 |
| Ingles | +0,0002 | +0,4375 |
| Codigo | +0,1838 | +0,2648 |

KLD de los cuantos frente a F16 de la misma rama (variante ru+en, imatrix ru):

| Cuanto | Tamano | KLD ru | KLD en | KLD code |
|---|---|---|---|---|
| q8_0 | 7,86 GiB | 0,0013 | 0,0016 | 0,0013 |
| Q6_K | 6,07 GiB | 0,0029 | 0,0036 | 0,0033 |
| Q5_K_M | 5,30 GiB | 0,0127 | 0,0160 | 0,0182 |
| IQ4_NL | 4,36 GiB | 0,0174 | 0,0231 | 0,0207 |
| IQ4_XS | 4,16 GiB | 0,0177 | 0,0236 | 0,0209 |
| Q4_K_M | 4,57 GiB | 0,0208 | 0,0267 | 0,0270 |

El autor senala que IQ4_XS e IQ4_NL son estadisticamente indistinguibles (delta de KLD de +0,0003, z=0,7), mientras que el resto de pares son significativos (z mayor o igual a 6,5).

## Requisitos de hardware

- VRAM estimada para inferencia: entre 3,88 GiB (ru-only IQ4_XS) y 7,86 GiB (ru+en q8_0), segun variante y cuanto. Los ficheros heretic solo se publican en Q6_K: 6,07 GiB (ru+en) y 5,73 GiB (ru-only).
- GPU recomendadas: no especificadas por el autor. Por tamano, los cuantos de 4 bits caben en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB y RTX 4090; los de 6-8 bits requieren al menos 8-12 GB de VRAM para dejar margen a la cache KV.
- Cabe en GPU de consumo: si, con los cuantos IQ4_XS, IQ4_NL y Q4_K_M en GPUs de 6-8 GB; Q6_K y q8_0 en GPUs de 12 GB o superiores.
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-server`), y por extension cualquier frontend compatible con GGUF (Ollama, LM Studio, etc.). vLLM y TGI no estan documentados para estos ficheros en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada. Los ejemplos de la model card usan `-ngl 99` para descargar todas las capas en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad documentada | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-9b-distil-ru (ru+en Q6_K) | 7,49 mil millones | no disponible | BPC ru 0,9357; KLD ru 0,0029 | Apache 2.0 | GGUF |
| empero-ai/Qwen3.8-9B-Distill-GGUF (base) | 7,49 mil millones | no disponible | BPC ru 0,9367 (q8_0); referencia de KLD | Apache 2.0 (heredada) | GGUF |
| Qwen3.8-9b-distil-ru (ru-only Q6_K) | 7,49 mil millones | no disponible | BPC ru 0,9358; BPC en 1,0884 | Apache 2.0 | GGUF |

La comparacion con modelos de otros autores no esta disponible en la informacion proporcionada. La alternativa natural es el repositorio base sin podar, que ofrece mayor calidad en codigo (BPC 0,4228 frente a 0,6306) a cambio de un mayor tamano (q8_0 de 9,11 GiB frente a 7,86 GiB) y un vocabulario completo de 248.070 tokens.

## Limitaciones y advertencias

- No se distribuyen pesos F16 ni BF16: solo q8_0 y cuantizaciones inferiores. Para el peso completo hay que acudir al repositorio base.
- La variante ru-only degrada el ingles de forma severa (+0,4375 bits/caracter) y el codigo (+0,2648); no es adecuada para tareas multilingues ni de programacion.
- La poda del vocabulario penaliza la generacion de codigo incluso en la variante ru+en (+0,1838 bits/caracter frente al base).
- Las variantes heretic no tienen rechazos de seguridad y pueden generar contenido NSFW: el autor advierte explicitamente de no desplegarlas en servicios publicos sin filtrado propio y de que la responsabilidad recae en el usuario.
- No hay evaluaciones de calidad (KLD ni BPC) para los ficheros heretic, ya que el adaptador modifica el distribucion de salida de forma intencionada.
- La receta de fusion del LoRA heretic no esta publicada (queda como TODO en la model card), lo que limita la reproducibilidad.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; son heredados del modelo base, que no se describe en detalle.
- La longitud de contexto no se especifica; los ejemplos usan 8.192 y 32.768 tokens, pero no se confirma cual es el maximo soportado.
- El modelo tiene un volumen de adopcion bajo (1.351 descargas y 2 likes en el momento de la consulta), sin validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YokaiOfDusk/Qwen3.8-9b-distil-ru
- Modelo base (GGUF): https://huggingface.co/empero-ai/Qwen3.8-9B-Distill-GGUF
- Modelo base (pesos completos): https://huggingface.co/empero-ai/Qwen3.8-9B-Distill
- Repositorio de llama.cpp: no disponible en la informacion proporcionada
- Papers, blogs o demos adicionales: no disponibles en la informacion proporcionada
