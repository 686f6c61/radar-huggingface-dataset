# YokaiOfDusk/Qwen3.8-9b-distil-ru

## Resumen

Qwen3.8-9B-Distill-ru es una coleccion de cuantizaciones GGUF publicada por el usuario YokaiOfDusk sobre el modelo base `empero-ai/Qwen3.8-9B-Distill`. No se trata de un modelo entrenado desde cero ni de un fine-tuning: el autor copia byte a byte las filas de `embed_tokens` y `lm_head` correspondientes a un subconjunto del vocabulario original (248.070 tokens) y reescribe `vocab_size` y los identificadores de tokens especiales. El resto de los 7,7 mil millones de parametros permanece intacto, por lo que el modelo conserva la arquitectura y los pesos del checkpoint original.

La propuesta es reducir el coste de memoria de las capas de embedding y de la proyeccion de salida (`lm_head`), que en modelos con vocabularios grandes suponen una fraccion considerable del total, especialmente en contextos largos donde la matriz de logits crece con la longitud de secuencia. Se ofrecen dos variantes de vocabulario: una bilingue ruso-ingles de 94.726 tokens y otra exclusivamente rusa de 39.929 tokens.

El modelo base emplea una arquitectura hibrida `qwen3_5` con 24 capas de atencion lineal y 8 de atencion completa, ademas de componentes de vision-lenguaje (VL) y prediccion multi-token (MTP). La relevancia practica esta en el analisis cuantitativo que acompania la publicacion: el autor mide la perdida de calidad con la metrica BPC (bits por caracter) en lugar de la perplejidad por token, que no es comparable entre tokenizadores distintos, y documenta la divergencia KL de cada cuantizacion frente a su referencia F16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido `qwen3_5`: 24 capas de atencion lineal + 8 capas de atencion completa; incluye componentes VL y MTP |
| Parametros totales | 9B nominales; 7,7B intactos tras el pruning de vocabulario (el resto corresponde a embeddings y lm_head) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 32.768 tokens validados empiricamente en la model card |
| Tipos de cuantizacion | F16, q8_0, Q6_K, Q5_K_M, IQ4_NL, IQ4_XS, Q4_K_M |
| Idiomas soportados | Ruso e ingles (variante ru+en); solo ruso en la variante ru-only |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp) |

Detalle de variantes y tamanos:

| Variante | vocab_size | F16 | q8_0 | Q6_K | Q5_K_M | IQ4_NL | IQ4_XS | Q4_K_M |
|---|---|---|---|---|---|---|---|---|
| ru+en | 94.726 | 14,79 GB | 7,86 GB | 6,07 GB | 5,30 GB | 4,36 GB | 4,16 GB | 4,57 GB |
| ru-only | 39.929 | 13,95 GB | 7,42 GB | 5,73 GB | 4,98 GB | 4,07 GB | 3,88 GB | 4,28 GB |
| base sin pruning | 248.070 | no disponible | 9,11 GB | no disponible | no disponible | no disponible | no disponible | no disponible |

## Arquitectura y entrenamiento

El checkpoint base es un destilado del modelo Qwen3.8-9B, con una arquitectura hibrida que combina 24 capas de atencion lineal con 8 capas de atencion completa (full attention). Esta mezcla esta disenada para abaratar el coste computacional en secuencias largas manteniendo la capacidad de recuperacion de informacion exacta en las capas de atencion completa. El modelo incorpora ademas modulos de vision-lenguaje y de prediccion multi-token (MTP), segun la model card del autor.

El trabajo publicado en este repositorio no incluye reentrenamiento ni ajuste fino. La intervencion consiste en el pruning del vocabulario: se seleccionan las filas de `embed_tokens` y `lm_head` correspondientes a los tokens deseados y se copian sin modificacion, ajustando `vocab_size` y los identificadores de tokens especiales. El autor no documenta el numero de tokens de entrenamiento del modelo base, la composicion del dataset, ni si hubo RLHF o DPO. La innovacion tecnica destacable es metodologica: la evaluacion con BPC en lugar de perplejidad por token, que permite comparar tokenizadores distintos, y la publicacion de la divergencia KL de cada cuantizacion frente a su F16 de referencia, calculada sobre 20.480 tokens (40 fragmentos de 512) con error estandar de la media.

## Capacidades

- Generacion de texto en ruso e ingles (la variante ru-only degrada el ingles de forma significativa).
- Razonamiento y conversacion multi-turno, heredados del modelo base destilado.
- Capacidad de vision-lenguaje segun la arquitectura del checkpoint base (componente VL presente; no se documenta en la model card si los tensores VL se conservan en los GGUF publicados).
- Prediccion multi-token (MTP) como componente arquitectonico del modelo base.
- Procesamiento de contexto largo: validado hasta 32.768 tokens sin degradacion adicional respecto a 2.048 tokens.
- No se documenta soporte explicito de tool calling, function calling ni comportamiento agentico en la informacion disponible.
- No se documenta thinking mode ni capacidades de audio.

## Casos de uso

- Procesamiento de documentacion tecnica en ruso: con la variante ru-only Q6_K (5,73 GB) se puede desplegar en una GPU consumer de 8 GB y procesar manuales o contratos largos gracias a la ventana de 32k tokens validada.
- Generacion de codigo con comentarios en ruso: la variante ru+en conserva el rendimiento en codigo con un coste de +0,18 bits por caracter frente al vocabulario completo, aceptable si el codigo no es el dominio principal.
- Asistente conversacional en ruso en entornos con VRAM limitada: IQ4_XS (3,88 GB en ru-only) cabe en GPUs de 6-8 GB y mantiene una divergencia KL de 0,0176 frente a F16, estadisticamente indistinguible de IQ4_NL.
- Analisis de sentimiento y clasificacion de textos rusos: la variante ru-only ofrece BPC de 0,9359 en ruso, practicamente identico al modelo base (0,9367), por lo que es adecuada para tareas discriminativas sobre texto ruso.
- Despliegue en CPU mediante llama.cpp: los GGUF de 4-6 GB permiten inferencia en servidores sin GPU usando `llama-server` con `-c 32768`, util para procesamiento por lotes no interactivo.
- Traduccion ru→en con la variante ru+en: mantiene BPC en ingles de 0,6510-0,6511, identico al base, lo que la hace apta para pipelines de traduccion dentro de llama.cpp.
- Prototipado e investigacion sobre pruning de vocabulario: el repositorio sirve como referencia reproducible para estudiar el impacto del recorte de vocabulario en modelos multilingues.

## Benchmarks y rendimiento

BPC (bits por caracter) por dominio, calculado como `log2(PPL) · tokens/caracteres`:

| Modelo | BPC ru | BPC en | BPC code |
|---|---|---|---|
| base q8_0 | 0,9367 | 0,6509 | 0,4228 |
| ru+en F16 | 0,9357 | 0,6511 | 0,6066 |
| ru+en q8_0 | 0,9359 | 0,6510 | 0,6306 |
| ru-only F16 | 0,9358 | 1,0884 | 0,6876 |
| ru-only q8_0 | 0,9359 | 1,0874 | 0,7022 |

Coste del pruning (delta BPC frente a base q8_0):

| Dominio | ru+en | ru-only |
|---|---|---|
| ru | −0,0010 | −0,0009 |
| en | +0,0002 | +0,4375 |
| code | +0,1838 | +0,2648 |

Divergencia KL de cuantizaciones frente a F16 (20.480 tokens), variante ru+en:

| Cuantizacion | Tamano | KLD ru | KLD en | KLD code |
|---|---|---|---|---|
| q8_0 | 7,86 GB | 0,0013 | 0,0016 | 0,0013 |
| Q6_K | 6,07 GB | 0,0029 | 0,0036 | 0,0033 |
| Q5_K_M | 5,30 GB | 0,0127 | 0,0160 | 0,0182 |
| IQ4_NL | 4,36 GB | 0,0174 | 0,0231 | 0,0207 |
| IQ4_XS | 4,16 GB | 0,0177 | 0,0236 | 0,0209 |
| Q4_K_M | 4,57 GB | 0,0208 | 0,0267 | 0,0270 |

Divergencia KL de cuantizaciones frente a F16, variante ru-only:

| Cuantizacion | Tamano | KLD ru | KLD en | KLD code |
|---|---|---|---|---|
| q8_0 | 7,42 GB | 0,0013 | 0,0017 | 0,0021 |
| Q6_K | 5,73 GB | 0,0029 | 0,0042 | 0,0036 |
| Q5_K_M | 4,98 GB | 0,0129 | 0,0278 | 0,0215 |
| IQ4_NL | 4,07 GB | 0,0172 | 0,0293 | 0,0229 |
| IQ4_XS | 3,88 GB | 0,0176 | 0,0300 | 0,0234 |
| Q4_K_M | 4,28 GB | 0,0206 | 0,0392 | 0,0303 |

Perplejidad en contexto largo (ruso, 4 fragmentos):

| Contexto | q8_0 | IQ4_XS | Ratio |
|---|---|---|---|
| 2.048 | 7,6488 | 7,7281 | 1,0104 |
| 8.192 | 7,4989 | 7,6203 | 1,0162 |
| 32.768 | 8,8337 | 8,9511 | 1,0133 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 4,16-7,86 GB para la variante ru+en segun cuantizacion; 3,88-7,42 GB para ru-only. Anadir margen para KV cache, que crece con el contexto (hasta 32k tokens).
- GPU recomendadas: RTX 3060 12 GB, RTX 4070 Ti 12 GB, RTX 4090 24 GB, A100 40/80 GB, H100 80 GB.
- Cabe en GPU consumer: si. IQ4_XS ru-only (3,88 GB) en GPUs de 6 GB; Q5_K_M ru-only (4,98 GB) y Q6_K ru-only (5,73 GB) en GPUs de 8 GB; Q8_0 en GPUs de 10-12 GB.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`) con `-ngl 99` para descarga completa en GPU. No se documenta soporte en vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.8-9B-Distill-ru (este) | 9B (7,7B intactos) | 32k validado | ru, en (o solo ru) | Apache 2.0 | GGUF | Vocabulario recortado, sin reentrenamiento |
| empero-ai/Qwen3.8-9B-Distill (base) | 9B | no disponible | no disponible | no disponible | safetensors (presumible) | Vocabulario completo 248.070; q8_0 9,11 GB |
| Qwen3-8B (referencia de familia) | 8B | no disponible en esta informacion | multilingue | Apache 2.0 | safetensors, GGUF | No es el mismo checkpoint; comparacion orientativa |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El pruning de vocabulario degrada el rendimiento en codigo de forma notable: +0,18 bits por caracter en ru+en y +0,26 en ru-only frente al modelo base.
- La variante ru-only degrada el ingles severamente (+0,4375 BPC), por lo que no debe usarse en cargas con texto en ingles.
- No hay reentrenamiento ni ajuste fino: los pesos son identicos al checkpoint base salvo por el recorte de embeddings y lm_head; cualquier sesgo del modelo original persiste.
- El modelo base es un destilado, con el riesgo de alucinacion y perdida de capacidad de razonamiento que ello implica frente al modelo profesor.
- La model card no documenta sesgos especificos, composicion del dataset de entrenamiento ni evaluaciones de seguridad.
- No se documenta soporte de tool calling ni comportamiento agentico; no asumir su disponibilidad en produccion.
- La licencia Apache 2.0 permite uso comercial, pero el autor no especifica si el checkpoint base impone restricciones adicionales; conviene verificar la licencia de `empero-ai/Qwen3.8-9B-Distill`.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.
- El contexto maximo validado es 32.768 tokens; no se garantiza comportamiento correcto por encima de esa longitud.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/YokaiOfDusk/Qwen3.8-9B-Distill-ru
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-9B-Distill
- llama.cpp (runtime recomendado): https://github.com/ggerganov/llama.cpp
