# tensor-tailor/zils-mini-body-35

## Resumen

zils-mini-body-35 es un ajuste fino completo (full fine-tune) del modelo d3-mini-4.5b-v1, desarrollado por el usuario tensor-tailor dentro del ecosistema Zils. Se trata de un cuerpo de aproximadamente 4.539 millones de parametros construido a partir del checkpoint MS11, la mezcla oficial de la ronda d3-mini del 11 de noviembre de 2026, que a su vez combina dos cuerpos publicos: qhoenix/zils-mini-decision-l13_avg678 y joamCriff123/zils-mini-sx3. El modelo se distribuye con licencia Apache 2.0 y pesos en formato safetensors.

El modelo esta disenado para tareas de decision y clasificacion con etiquetas de referencia (gold labels), segun se deduce de su funcion de perdida (entropia cruzada suave sobre la etiqueta gold, Brier score y divergencia KL respecto al checkpoint inicial). El entrenamiento se realizo sobre 3.982 filas con etiquetas mayoritariamente generadas por sesiones de Claude, complementadas con etiquetas humanas de conjuntos publicos como MNLI, QNLI, PIQA, SNLI y SQuAD v2.

La relevancia de esta ficha es limitada: el propio autor declara que el modelo rinde por debajo del checkpoint de partida MS11 en su test interno, y el repositorio no cuenta con descargas ni interacciones. Se trata, por tanto, de un artefacto de investigacion experimental mas que de un modelo listo para produccion. La informacion publica disponible es escasa y muchos parametros tecnicos no estan documentados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia qwen3_5, segun tags del repositorio); incluye torre de vision congelada |
| Parametros totales | 4.539.265.536 (3.570,1M en 425 tensores del modelo de lenguaje entrenados; el resto corresponde a embedding atado a la cabeza de salida y torre de vision) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de d3-mini-4.5b-v1 (etiquetada como qwen3_5 en los tags), un transformer con una torre de vision que permanece congelada durante el ajuste. El entrenamiento es un full fine-tune sin adaptadores: se entrenan 425 tensores del modelo de lenguaje (3.570,1M parametros) como pesos maestros en fp32 bajo autocast bf16, mientras que el embedding de tokens (atado a la cabeza de salida) y la torre de vision quedan congelados. Se usa el optimizador 8-bit AdamW de bitsandbytes 0.49.0, con learning rate 5e-6, weight decay 0 y 50 pasos de warm-up, durante 1 epoca sobre 3.982 filas (batch 8 con 2 pasos de acumulacion, 249 pasos en total).

La funcion de perdida combina tres terminos por fila: entropia cruzada suave sobre la etiqueta gold (peso 1), Brier score (peso 1) y divergencia KL respecto al checkpoint inicial MS11 congelado (peso 0,1). No se usan filas pin, label smoothing ni RPS. Antes del entrenamiento se ejecuto una comprobacion del checkpoint de partida comparando las distribuciones almacenadas con un forward en vivo sobre 64 filas, con una diferencia maxima de 0,0154/0,0181 y media de 0,0013/0,0015, dentro del umbral del entrenador (maximo 0,20, media 0,01, p90 0,02). Los datos de entrenamiento combinan 3.714 filas etiquetadas por respuestas de sesiones de Claude (2.066, 1.372 y 271 respectivamente, mas 4 de un Phi-4 local y 1 de un Mistral-Nemo local), 217 etiquetas humanas de conjuntos publicos (MNLI 156, QNLI 51, PIQA 8, SNLI 2), 15 derivadas de SQuAD v2, 3 de iSarcasmEval y 33 calculadas por codigo desde la especificacion del item.

## Capacidades

- Generacion de texto y clasificacion con etiquetas de referencia: el diseno del entrenamiento (entropia cruzada suave, Brier score) apunta a tareas de decision y puntuacion de respuestas candidatas.
- Procesamiento multimodal: incorpora una torre de vision (congelada durante el ajuste), aunque no se documentan las capacidades visuales concretas.
- Razonamiento sobre opciones multiples: los conjuntos de evaluacion (MNLI, QNLI, PIQA, SNLI) sugieren capacidad de inferencia sobre pares de premisa e hipotesis y preguntas de sentido comun.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (modo thinking, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Evaluacion de inferencia en lenguaje natural: el modelo puede puntuar pares premisa-hipotesis en tareas tipo MNLI/SNLI, ya que su entrenamiento incluye etiquetas humanas de estos conjuntos y su salida es una distribucion de probabilidad sobre etiquetas.
- Clasificacion de preguntas y respuestas: con etiquetas derivadas de SQuAD v2 y QNLI, es adecuado para experimentos de verificacion de respuestas y deteccion de preguntas sin respuesta.
- Investigacion sobre ajuste fino y alineacion: sirve como caso de estudio reproducible de full fine-tune con regularizacion KL respecto al modelo base, util para estudiar deriva de comportamiento entre checkpoints.
- Deteccion de sarcasmo en texto: el corpus incluye 3 filas de iSarcasmEval (tarea A), por lo que puede emplearse en experimentos acotados de clasificacion de sarcasmo, siempre con validacion adicional.
- Experimentos de razonamiento de sentido comun: las etiquetas de PIQA permiten usarlo en pruebas de fisica intuitiva y sentido comun sobre tareas de opcion multiple.
- Benchmarking de tecnicas de mezcla de modelos (model souping): al derivar de MS11, la mezcla oficial de la ronda d3-mini, resulta util para comparar estrategias de soup frente a ajuste fino completo.
- Prototipado de pipelines de anotacion asistida: sus etiquetas de alta calidad (mayoritariamente generadas por Claude) y su formato de salida probabilistica permiten usarlo como anotador auxiliar en flujos de etiquetado, con supervision humana posterior.

## Benchmarks y rendimiento

Resultados del test simple interno del autor (1.488 filas; probabilidad de la respuesta gold y exactitud, con intervalo de confianza bootstrap al 95% sobre el cambio en log p(gold) medio):

| Conjunto | Filas | p(gold), body vs MS11 | Exactitud, body vs MS11 | Cambio en log p(gold) [IC 95%] | Lectura |
|---|---|---|---|---|---|
| Filas hold-out propias (MINI) | 149 | 0,880 vs 0,903 | 0,919 vs 0,980 | -0,084 [-0,189, +0,010] | sin diferencia |
| C3 base (dev_gold + pool_known) | 1.339 | 0,843 vs 0,862 | 0,895 vs 0,926 | -0,064 [-0,092, -0,034] | por debajo |
| dev_gold | 787 | 0,835 vs 0,877 | 0,886 vs 0,935 | -0,118 [-0,153, -0,089] | por debajo |
| pool_known | 552 | 0,855 vs 0,840 | 0,909 vs 0,913 | +0,013 [-0,037, +0,060] | sin diferencia |

Segun la regla del propio test, el modelo se considera por debajo de MS11 porque el conjunto C3 base queda por debajo. En la criba de copia (copy screen) no se detecto copia: la mayor proporcion explicada por un cuerpo anterior es 0,0012 (zils-mini-body-32), y las distancias de comportamiento son 0,0495 bits respecto a MS11, 0,0486 a zils-mini-body-31, 0,0460 a zils-mini-body-32 y 0,0441 a zils-mini-body-34 (umbral del autor: al menos 0,01). No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 4.539 millones de parametros, en bf16 los pesos ocupan aproximadamente 9,1 GB (tamano del repositorio); en fp32 serian unos 18,2 GB. La VRAM total necesaria depende de la longitud de contexto y del backend, que no se documentan.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, una GPU con 16-24 GB de VRAM podria alojar los pesos en bf16, pero la ausencia de datos de contexto y de backend impide confirmarlo.
- Compatibilidad con GPU de consumo: probable en tarjetas con 16 GB o mas en bf16 (por ejemplo, RTX 4080/4090), condicionado a la longitud de contexto efectiva, que no se especifica.
- Opciones de despliegue: el repositorio usa custom_code y la arquitectura qwen3_5, por lo que requiere cargar el codigo remoto del autor; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y la ausencia de pesos GGUF descarta en principio llama.cpp y Ollama sin conversion previa.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-body-35 | 4.539M | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Full fine-tune de MS11; rendimiento interno por debajo de MS11 en C3 base |
| MS11 (soup d3-mini, checkpoint de partida) | no disponible | no disponible | Apache 2.0 (heredada) | Referenciado en la model card | Punto de partida oficial; supera a body-35 en dev_gold y C3 base segun el test del autor |
| joamCriff123/zils-mini-sx3 | no disponible | no disponible | no disponible | Hugging Face | Miembro publico del soup MS11 |
| qhoenix/zils-mini-decision-l13_avg678 | no disponible | no disponible | no disponible | Hugging Face | Miembro publico del soup MS11 |

No se dispone de datos de benchmarks comparables con modelos de la misma categoria fuera del ecosistema Zils en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento inferior al checkpoint de partida: el propio autor declara que el modelo lee por debajo de MS11 en el conjunto C3 base (exactitud 0,895 frente a 0,926) y en dev_gold (0,886 frente a 0,935), por lo que no es una mejora sobre el modelo base.
- Riesgo de alucinacion: no evaluado en la informacion disponible; al ser un modelo orientado a clasificacion con etiquetas, su uso generativo libre no esta validado.
- Sesgos conocidos: no documentados. Los datos de entrenamiento incluyen etiquetas generadas por modelos (Claude, Phi-4, Mistral-Nemo) y conjuntos publicos de origen estadounidense (MNLI, SNLI, PIQA), lo que puede introducir sesgos de dominio e idioma.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan documentados, lo que impide garantizar su uso multilingue o con ventanas largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo depende de codigo personalizado (custom_code) y de NOTICE con fuentes de terceros que deben respetarse; la licencia del checkpoint de partida debe verificarse por separado.
- Caveats para produccion: 0 descargas y 0 likes, sin pipeline declarado, sin pesos cuantizados y con dependencia de codigo remoto; no se recomienda su despliegue en produccion sin una evaluacion independiente.
- Trazabilidad limitada: la model card referencia hashes y recibos internos del flujo de trabajo del autor (por ejemplo, GOLD_ONLY_RECEIPT.json o la linea 5d805a83) que no son verificables externamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tensor-tailor/zils-mini-body-35
- Modelo base (miembro del soup MS11): https://huggingface.co/qhoenix/zils-mini-decision-l13_avg678
- Modelo base (miembro del soup MS11): https://huggingface.co/joamCriff123/zils-mini-sx3
- Modelo de referencia d3-mini-4.5b-v1 (repositorio Zils, revision e9e87b3e): no disponible como enlace directo en la informacion proporcionada
- Paper, blog o demo: no disponibles en la informacion proporcionada
