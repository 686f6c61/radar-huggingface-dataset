# UIUC-SSAIL/gemma4-26b-a4b-XPress-b16

## Resumen

XPress es un modelo borrador (draft model) para decodificacion especulativa sobre `google/gemma-4-26b-a4b-it`, desarrollado por el grupo UIUC-SSAIL. No es un modelo de lenguaje autonomo: su unica funcion es proponer bloques de 16 tokens que el modelo objetivo verifica en un solo paso forward, acelerando la generacion entre 1,5x y 3,3x segun la tarea. Con 566 M de parametros totales y un backbone de 5 capas, se sirve exclusivamente junto a su modelo objetivo en vLLM.

La innovacion principal frente al borrador DFlash del que parte es un cabezal de refinamiento que aplica pases paralelos de Jacobi sobre el bloque propuesto. Esto corrige el principal cuello de botella de la decodificacion en bloque: la falta de condicionamiento mutuo entre posiciones. El resultado es un aumento de la longitud de aceptacion de entre el 36 % y el 66 % respecto a DFlash, con el mismo numero de tokens especulativos propuestos por paso.

Es relevante ahora porque la decodificacion especulativa se ha consolidado como la tecnica estandar para reducir latencia en inferencia de modelos grandes, y este trabajo demuestra que un refinamiento iterativo barato (2,09 M de parametros adicionales en el cabezal) puede mejorar sustancialmente la tasa de aceptacion sin tocar el modelo objetivo ni aumentar el coste por paso de verificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Borrador de decodificacion especulativa: backbone de 5 capas con atencion a estados ocultos auxiliares del objetivo, mas cabezal de refinamiento Jacobi |
| Parametros totales | 566,00 M (429,69 M backbone + 136,31 M cabezal) |
| Parametros activos | no disponible (no es MoE; el modelo objetivo Gemma 4 26B-A4B si lo es) |
| Longitud de contexto | 8192 tokens (longitud de empaquetado en entrenamiento); limitada por `--max-model-len` del objetivo |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | en |
| Licencia | apache-2.0 en el repositorio; la model card indica Gemma Terms of Use heredada del modelo base |
| Formato de pesos | safetensors, bfloat16 |
| Tamano del repositorio | 1,1 GB |
| Tamano de bloque | 16 (15 tokens especulativos por paso) |
| Pases Jacobi (`xpress_num_passes`) | 6 |
| Conjunto de candidatos (`xpress_topc`) | 512 por defecto; 0 activa la ruta exacta de vocabulario completo |
| Rango del refinador (`xpress_rank`) | 256 |
| Capas auxiliares del objetivo | 2, 7, 12, 18, 23, 28 |
| Libreria | vLLM (validado en vLLM 0.33.0) |

## Arquitectura y entrenamiento

El borrador consta de un backbone de 5 capas que lee estados ocultos auxiliares de seis capas del modelo objetivo (2, 7, 12, 18, 23 y 28) y emite logits para las 16 posiciones del bloque de forma simultanea. Un bloque generado asi es mutuamente incondicionado: la posicion *k* no ha visto el token elegido en *k-1*, lo que limita la longitud de aceptacion. Sobre esa base, un cabezal de refinamiento ejecuta *K* pases paralelos de Jacobi en los que cada posicion recalcula sus logits condicionados por las estimaciones actuales de las posiciones anteriores. El refinador es causal por construccion, de modo que tras *j* pases las primeras *j* posiciones quedan fijadas. El cabezal anade 2,09 M de parametros; sus dos proyecciones de vocabulario `[V, r]` (134,22 M) son la proyeccion de salida propia del borrador y no un coste adicional del refinamiento.

El entrenamiento usa el split `train` completo de `mlabonne/open-perfectblend` (1.420.909 conversaciones en formato ShareGPT que mezclan MetaMathQA, UltraInteract, UltraChat, orca-math, UltraFeedback, evol-codealpaca, AutoIF y LMSYS-Arena, con licencia Apache 2.0), sin submuestreo. Las respuestas del asistente se descartan y se regeneran con el propio `google/gemma-4-26b-a4b-it` servido via `/v1/chat/completions` con `max_tokens` 8192 y los valores por defecto del endpoint, ya que el borrador debe predecir la distribucion de su propio objetivo. Las conversaciones regeneradas se tokenizan con la plantilla de chat del objetivo y se empaquetan en secuencias de 8192 tokens. El procedimiento usa la libreria `speculators` durante 10 epocas en 28 GPUs, con una perdida que combina entropia cruzada y variacion total con decaimiento exponencial por posicion de bloque, mas un termino de consistencia que supervisa los pases Jacobi intermedios para que los primeros pases ya sean utiles.

## Capacidades

- Generacion de tokens especulativos para decodificacion especulativa: propone 15 tokens por paso forward del objetivo, verificados por este.
- Refinamiento iterativo del bloque mediante pases Jacobi paralelos, con aceptacion que crece de forma monotona en *K* y se estabiliza alrededor de *K* = 6.
- Prediccion alineada con la distribucion del objetivo Gemma 4 26B-A4B-it, al haber sido entrenado sobre respuestas regeneradas por ese mismo modelo.
- Soporte de tareas de razonamiento matematico, generacion de codigo y conversacion multirramo, segun los conjuntos de evaluacion utilizados (GSM8K, MATH-500, HumanEval, MBPP, LiveCodeBench, MT-Bench).
- No soporta tool calling, agentes, vision, audio ni modo thinking de forma propia: hereda lo que el modelo objetivo produzca.
- Capacidad multilingue limitada al ingles en los datos de entrenamiento.
- No tiene comportamiento generativo autonomo utilizable; cargarlo con `AutoModelForCausalLM` no produce un modelo funcional.

## Casos de uso

- Servicio de chat de baja latencia sobre Gemma 4 26B-A4B-it: el borrador se despliega junto al objetivo en vLLM con `--speculative-config` y reduce el tiempo por token en cargas interactivas, con un multiplicador medido de 1,54x en MT-Bench a temperatura 0 y batch 1.
- Razonamiento matematico en produccion: en GSM8K el sistema alcanza 3,06x de aceleracion y en MATH-500 3,34x, adecuado para pipelines que resuelven problemas paso a paso con respuestas largas donde la decodificacion domina la latencia.
- Generacion de codigo asistida: con 3,09x en HumanEval y 2,61x en MBPP, encaja en asistentes de autocompletado o generacion de funciones donde el usuario espera respuesta inmediata.
- Evaluacion de codigo competitivo: 2,36x en LiveCodeBench, util en plataformas que ejecutan y validan soluciones generadas con verificacion posterior.
- Reduccion de coste en inferencia por lotes pequenos: al aumentar la longitud de aceptacion de 5,87 a 9,76 tokens en GSM8K, se reduce el numero de pasos forward del modelo grande por token emitido, rebajando el coste de GPU por peticion.
- Despliegue de un unico endpoint con plantilla de chat: se sirve a traves de `/chat/completions` con la plantilla de Gemma 4, lo que permite integrarlo en aplicaciones existentes sin cambios en el cliente.
- Investigacion en decodificacion especulativa: sirve como referencia reproducible para estudiar el efecto del refinamiento Jacobi sobre la longitud de aceptacion, con configuracion de pases ajustable en tiempo de servicio.

## Benchmarks y rendimiento

Medido en un H200, vLLM 0.33.0, batch 1, temperatura 0, 3 repeticiones promediadas, plantilla de chat via `/chat/completions`. Ambos brazos proponen 15 tokens especulativos. AL es la longitud de aceptacion media (tokens confirmados por paso forward del objetivo, incluido el token propio del objetivo; sin asistencia = 1,0; techo con bloque de 16 = 16,0).

| Dataset | AL, DFlash | AL, este modelo | Ganancia AL | Speedup, DFlash | Speedup, este modelo |
|---|---|---|---|---|---|
| GSM8K | 5,87 | 9,76 | +66 % | 2,07x | 3,06x |
| MATH-500 | 6,52 | 8,96 | +37 % | 2,47x | 3,34x |
| HumanEval | 6,11 | 8,43 | +38 % | 2,38x | 3,09x |
| MBPP | 4,77 | 6,94 | +46 % | 1,91x | 2,61x |
| LiveCodeBench | 4,71 | 6,40 | +36 % | 1,84x | 2,36x |
| MT-Bench | 2,87 | 4,14 | +44 % | 1,15x | 1,54x |

No se han publicado resultados de benchmarks de calidad del modelo objetivo (MMLU, etc.) en la informacion disponible; las cifras anteriores miden exclusivamente aceleracion y aceptacion del borrador.

## Requisitos de hardware

- VRAM del borrador: 1,1 GB en bfloat16 (566 M de parametros); se suma a la del modelo objetivo Gemma 4 26B-A4B-it.
- VRAM total del sistema: la del objetivo mas aproximadamente 1,1 GB del borrador y el coste de los estados ocultos auxiliares de las seis capas leidas.
- GPU recomendadas: H200 (hardware de validacion); tambien viable en A100 y H100 por capacidad del objetivo, aunque no se han publicado mediciones en esas GPU.
- GPU de consumo: el borrador en si cabe en cualquier GPU con mas de 1,1 GB libres, pero el objetivo de 26B requiere cuantizacion o descarga a CPU/offload; no hay datos de rendimiento en ese escenario.
- Despliegue: exclusivamente vLLM con soporte de la arquitectura XPress; validado en vLLM 0.33.0. No hay soporte documentado en llama.cpp, Ollama ni TGI.
- Configuracion de servicio: `--max-model-len 8192`, `--max-num-seqs 256`, `method: dflash`, `num_speculative_tokens: 15`; `xpress_num_passes` ajustable en tiempo de servicio.
- Latencia y throughput: los multiplicadores de la tabla de benchmarks son la referencia disponible (batch 1, temperatura 0); no se han publicado cifras de throughput con lotes mayores.

## Comparativa con modelos similares

| Modelo | Rol | Parametros | Tokens especulativos | AL media (GSM8K / MT-Bench) | Speedup (GSM8K / MT-Bench) | Licencia |
|---|---|---|---|---|---|---|
| UIUC-SSAIL/gemma4-26b-a4b-XPress-b16 | Borrador con refinamiento Jacobi | 566 M | 15 | 9,76 / 4,14 | 3,06x / 1,54x | apache-2.0 (model card cita Gemma Terms) |
| z-lab/gemma-4-26B-A4B-it-DFlash | Borrador en bloque (linea base) | no disponible | 15 | 5,87 / 2,87 | 2,07x / 1,15x | no disponible |
| google/gemma-4-26b-a4b-it | Modelo objetivo (sin asistencia) | 26B totales, A4B activos | no aplica | 1,0 / 1,0 | 1,0x / 1,0x | Gemma Terms of Use |

No se dispone de datos de otros borradores comparables (EAGLE, Medusa) sobre este objetivo en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el modelo objetivo no genera nada utilizable; cargarlo con `AutoModelForCausalLM` no funciona.
- Requiere una build de vLLM con la arquitectura XPress; no hay soporte en otros motores de inferencia documentado.
- Solo entrenado en ingles; el rendimiento en otros idiomas no esta caracterizado.
- Las mediciones se limitan a batch 1 y temperatura 0; el comportamiento con muestreo, lotes grandes o decodificacion especulativa anidada no esta documentado.
- La longitud de contexto efectiva queda acotada por el objetivo y por el empaquetado a 8192 tokens durante el entrenamiento.
- Riesgo de discrepancia de licencia: el repositorio declara apache-2.0, pero la model card indica Gemma Terms of Use heredada del modelo base; conviene verificar antes de uso comercial.
- Al estar entrenado sobre respuestas regeneradas por Gemma 4 26B-A4B-it, la tasa de aceptacion puede degradarse si el objetivo se sustituye, se ajusta o se sirve con otra plantilla de chat.
- La aceptacion se estabiliza alrededor de 6 pases Jacobi; aumentarlos mas alla aporta ganancias marginales con coste adicional.
- No se han publicado evaluaciones de sesgo ni de alucinacion del sistema completo; estas dependen del modelo objetivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/UIUC-SSAIL/gemma4-26b-a4b-XPress-b16
- Modelo base: https://huggingface.co/google/gemma-4-26b-a4b-it
- Borrador de referencia DFlash: https://huggingface.co/z-lab/gemma-4-26B-A4B-it-DFlash
- Dataset de entrenamiento: https://huggingface.co/datasets/mlabonne/open-perfectblend
- Paper, blog, repositorio de codigo y demos: no disponibles en la informacion proporcionada.
