# XHToken/Spark-X2.6-4B-DSpark-GGUF

## Resumen

Spark-X2.6-4B-DSpark-GGUF es un modelo borrador (draft model) en formato GGUF y precisión BF16, publicado por XHToken, diseñado para acelerar la inferencia del modelo Spark-X2.6-4B mediante decodificación especulativa. No es un modelo conversacional autónomo: su función es proponer hasta 7 tokens por pasada de borrado, que el modelo objetivo (Spark-X2.6-4B-GGUF, en BF16 o cuantizado) verifica en paralelo, reduciendo el número de pasos secuenciales de decodificación y aumentando el throughput sin alterar la calidad de las salidas.

La técnica subyacente, denominada DSpark, se apoya en un borrador ligero de solo 624 millones de parámetros con 5 capas SWA (sliding-window attention) que reutiliza estados ocultos del modelo objetivo en las capas `[2, 10, 18, 25, 33]`. Según los datos publicados por el autor, la aceleración media medida es de 2,14× en RTX 4090 con objetivo BF16 y de 1,98× con objetivo Q4_K_M, con valores de hasta 2,94× en MATH500 sobre Apple M5 Pro.

Es relevante ahora porque los agentes on-device y los flujos de razonamiento (thinking modes) generan salidas largas, donde la latencia de decodificación es el cuello de botella principal. DSpark ataca exactamente ese problema en hardware de consumo, con integración vía llama.cpp y una licencia Apache 2.0 que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Draft model con 5 capas SWA (sliding-window attention), ventana de 512 |
| Parametros totales | 624.416.001 (~624M) |
| Parametros activos | 624M (modelo denso, no MoE) |
| Longitud de contexto | no disponible como modelo independiente (el servidor de ejemplo se configura con 8192 tokens; el limite real lo fija el modelo objetivo) |
| Tipos de cuantizacion | BF16 (pesos del borrador); el modelo objetivo puede ser BF16 o cuantizado (Q4_K_M, INT4) |
| Idiomas soportados | Ingles y chino (en, zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

Datos adicionales del borrador: hidden size de 2560, 7 tokens propuestos por pasada de borrado y reutilización de hidden states del objetivo en las capas `[2, 10, 18, 25, 33]`.

## Arquitectura y entrenamiento

DSpark es un modelo borrador especializado para decodificación especulativa. Consta de 5 capas con atención de ventana deslizante (SWA) de tamaño 512 y un hidden size de 2560, dimensionado para alinearse con las representaciones internas de Spark-X2.6-4B. En cada pasada, el borrador genera hasta 7 tokens condicionados tanto por los tokens ya aceptados como por los estados ocultos del modelo objetivo extraídos de las capas `[2, 10, 18, 25, 33]`; el objetivo verifica esos tokens en paralelo en un único pase, aceptando los que coincidan con su propia distribución. Esto reduce los pasos secuenciales del modelo grande de 7+1 a 1 por ciclo de borrado-verificación.

No se ha publicado informacion sobre el proceso de entrenamiento del borrador (numero de tokens, composicion del dataset, destilacion desde el modelo objetivo, uso de RLHF/DPO). La cita del proyecto indica que la serie Spark-X2.6 (4B y 1.7B) procede del SparkLLM Team y se orienta a agentes on-device para tareas reales, pero los detalles de entrenamiento del modelo base tampoco estan disponibles en la informacion proporcionada.

## Capacidades

- No genera texto de forma autonoma: su unica funcion es proponer tokens para decodificacion especulativa del modelo Spark-X2.6-4B.
- Propone hasta 7 tokens por pasada de borrado, con decodificacion del borrador en modo greedy (argmax) o probabilistico.
- Aprovecha hidden states del modelo objetivo (capas 2, 10, 18, 25 y 33) para mejorar la tasa de aceptacion.
- Compatible con los distintos modos de razonamiento del modelo objetivo (High thinking, Low thinking, No thinking), con longitudes medias de aceptacion de 3,0 a 5,2 tokens segun tarea y configuracion.
- Pensado para ejecutarse con llama.cpp (fork de XHToken) mediante un servidor con API compatible con OpenAI.
- Idiomas de trabajo: ingles y chino.

Las capacidades finales del sistema (razonamiento, codigo, tool calling, agentes) dependen del modelo objetivo Spark-X2.6-4B, no del borrador; no se ha publicado informacion detallada sobre tool calling ni capacidades multimodales en la ficha disponible.

## Casos de uso

- **Inferencia on-device en GPU de consumo**: al pair con Spark-X2.6-4B cuantizado (Q4_K_M) en una RTX 4090, el throughput pasa de 226 a unos 447 tok/s de media, lo que hace viable servir agentes locales con latencia interactiva sin hardware de datacenter.
- **Agentes en portátiles Apple Silicon**: en un M5 Pro con objetivo INT4, la aceleracion media es de 1,62× (71 a 115 tok/s), util para asistentes locales que generan respuestas largas de razonamiento.
- **Razonamiento matematico con salidas largas**: las mayores aceleraciones se dan en MATH500 (2,33× en Q4_K_M) y GSM8K (2,35×), tareas donde los modos thinking producen cadenas largas y la decodificacion especulativa amortiza mejor su coste.
- **Generacion de codigo asistida**: en HumanEval y MBPP se obtienen aceleraciones de 1,72× y 1,85× respectivamente con objetivo cuantizado, adecuado para completado de codigo en editores locales.
- **Servidores locales con API OpenAI-compatible**: el despliegue con llama-server del fork de XHToken permite integrar el par objetivo+borrador en aplicaciones existentes sin cambiar el cliente, solo la configuracion del servidor.
- **Reduccion de coste energetico en inferencia batch local**: al disminuir los pasos secuenciales del modelo objetivo, se reduce el tiempo de GPU por token generado, util en despliegues con varias instancias concurrentes en una sola tarjeta.
- **Evaluacion de tecnicas de decodificacion especulativa**: al publicar longitudes medias de aceptacion por dataset y modo, sirve como banco de pruebas reproducible para investigacion en speculative decoding.

## Benchmarks y rendimiento

El autor no publica MMLU, HumanEval ni otros benchmarks de calidad del modelo (que, al ser un borrador, no altera la calidad del objetivo). Los datos relevantes son la longitud media de aceptacion y el throughput:

**Longitud media de aceptacion** (draft length 7, maximo 8 contando el token extra del objetivo):

| Dataset | T=1, High, Prob. | T=1, Low, Prob. | T=1, No thinking, Prob. | T=0, High, Greedy |
|---|---:|---:|---:|---:|
| AIME25 | 4,1833 | 4,0749 | 4,8251 | 4,6493 |
| GSM8K | 4,4056 | 4,3266 | 4,9514 | 4,4845 |
| MATH500 | 4,5942 | 4,6721 | 5,1758 | 5,0335 |
| HumanEval | 3,8743 | 4,1370 | 4,5859 | 4,4330 |
| MBPP | 3,8671 | 4,0179 | 4,3935 | 4,5525 |
| Arena-Hard-v2 | 3,2172 | 3,1772 | 3,0499 | 4,1601 |
| **Media** | **4,0236** | **4,0676** | **4,4969** | **4,5522** |

**Throughput con y sin DSpark** (objetivo BF16 en RTX 4090 y M5 Pro; objetivo Q4_K_M en RTX 4090 e INT4 en M5 Pro):

| Dataset | BF16 · RTX 4090 | BF16 · M5 Pro | Q4_K_M · RTX 4090 | INT4 · M5 Pro |
|---|:---:|:---:|:---:|:---:|
| AIME25 | 2,22× (95 → 210 tok/s) | 2,62× (31 → 80 tok/s) | 2,00× (226 → 451 tok/s) | 1,69× (71 → 119 tok/s) |
| GSM8K | 2,49× (95 → 236 tok/s) | 2,57× (31 → 79 tok/s) | 2,35× (226 → 532 tok/s) | 1,66× (71 → 118 tok/s) |
| MATH500 | 2,51× (95 → 239 tok/s) | 2,94× (31 → 90 tok/s) | 2,33× (226 → 527 tok/s) | 1,89× (71 → 135 tok/s) |
| HumanEval | 2,06× (95 → 196 tok/s) | 2,41× (31 → 74 tok/s) | 1,72× (226 → 389 tok/s) | 1,56× (71 → 110 tok/s) |
| MBPP | 1,88× (95 → 178 tok/s) | 2,49× (31 → 77 tok/s) | 1,85× (227 → 420 tok/s) | 1,61× (71 → 115 tok/s) |
| Arena-Hard-v2 | 1,70× (94 → 160 tok/s) | 2,00× (31 → 61 tok/s) | 1,62× (225 → 365 tok/s) | 1,30× (71 → 92 tok/s) |
| **Media** | **2,14× (95 → 203 tok/s)** | **2,50× (31 → 77 tok/s)** | **1,98× (226 → 447 tok/s)** | **1,62× (71 → 115 tok/s)** |

## Requisitos de hardware

- El borrador pesa unos 3,2 GB en BF16 (GGUF); requiere VRAM adicional sobre la del modelo objetivo, ya que ambos se cargan simultaneamente (`-ngl 999 -ngld 999` descarga ambos por completo a GPU).
- Con el objetivo Spark-X2.6-4B en Q4_K_M (~2,5-3 GB) mas el borrador BF16 (~3,2 GB) y cache KV en f16, el conjunto cabe con holgura en GPUs de 12-16 GB; el autor valida en RTX 4090 (24 GB) y en Apple M5 Pro (memoria unificada, via MLX para el objetivo).
- GPUs recomendadas: NVIDIA RTX 4090 (datos publicados), y en general cualquier GPU CUDA con 16 GB o mas. En Apple Silicon, M5 Pro con MLX.
- Despliegue: exclusivamente mediante el fork de XHToken de llama.cpp (rama `master`, commit `22c0ae1871b60123c5afc008a78fe9c6fffa2858`), compilado con `GGML_CUDA=ON` y ejecutando `llama-server` con `--spec-type draft-dspark`. La integracion en el llama.cpp oficial esta en progreso, por lo que de momento no funciona con llama.cpp upstream, vLLM, TGI ni Ollama.
- Throughput medido: 365-532 tok/s en RTX 4090 con objetivo Q4_K_M, y 92-135 tok/s en M5 Pro con objetivo INT4, segun tarea.
- La configuracion de ejemplo usa cache KV en f16 (`-ctk f16 -ctv f16` y equivalentes para el borrador), attention flash activada (`-fa on`) y contexto de 8192 tokens.

## Comparativa con modelos similares

Existen pocos draft models publicados como repositorios independientes comparables; la comparacion mas relevante es con otros pares objetivo+borrador de decodificacion especulativa:

| Modelo | Rol | Parametros borrador | Tecnica | Formato | Licencia |
|---|---|---|---|---|---|
| Spark-X2.6-4B-DSpark | Draft de Spark-X2.6-4B | 624M | Speculative decoding con hidden states del objetivo (5 capas SWA) | GGUF | Apache 2.0 |
| Medusa (vicuna) | Draft mediante cabezas adicionales sobre el propio objetivo | no disponible (cabezas integradas) | Multi-token prediction | safetensors | Apache 2.0 |
| EAGLE / EAGLE-2 | Draft ligero sobre features del objetivo | ~1,0-1,3M por cabeza (arbol de borrado) | Speculative decoding con feature maps | safetensors | Apache 2.0 |

Notas: Medusa y EAGLE estan pensados para servir en vLLM/servidores de datacenter y sobre modelos objetivo distintos; DSpark destaca por su integracion en llama.cpp y su enfoque on-device en consumer GPU y Apple Silicon. No se han publicado comparaciones directas de aceleracion entre estos sistemas en la informacion disponible, por lo que no pueden indicarse numeros comparativos sin inventar datos.

## Limitaciones y advertencias

- No es un modelo conversacional: no produce salidas utiles por si solo; debe emparejarse siempre con Spark-X2.6-4B-GGUF como modelo objetivo.
- Requiere un fork especifico de llama.cpp (XHToken/llama.cpp); la integracion en upstream esta en progreso, lo que limita su uso con despliegues estandar (vLLM, TGI, Ollama no compatibles de momento).
- La ganancia de aceleracion depende fuertemente de la tarea y del modo: cae hasta 1,30× en Arena-Hard-v2 con objetivo INT4 en M5 Pro, y es menor en modos High thinking con muestreo probabilistico que en modo greedy.
- La ventana SWA de 512 tokens del borrador puede limitar la tasa de aceptacion en contextos muy largos o tareas con dependencias de largo alcance; el autor no publica datos de aceptacion para contextos extensos.
- Idiomas limitados a ingles y chino; el rendimiento del borrador en otros idiomas no esta evaluado.
- Sesgos y riesgo de alucinacion: al tratarse de decodificacion especulativa con verificacion del objetivo, la distribucion de salida no se altera, por lo que los sesgos y alucinaciones son los heredados de Spark-X2.6-4B; no se ha publicado informacion sobre sesgos especificos de esa serie.
- Datos de entrenamiento del borrador no documentados, lo que dificulta auditar su comportamiento en dominios fuera de los datasets de evaluacion.
- Proyecto muy reciente (publicado el 30 de octubre de 2026) con 0 descargas registradas en el momento de la ficha; la madurez y el soporte comunitario son limitados.
- Licencia Apache 2.0: sin restricciones para uso comercial, pero sin garantias; conviene revisar los terminos del modelo objetivo Spark-X2.6-4B, que comparte la misma licencia segun la ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/XHToken/Spark-X2.6-4B-DSpark-GGUF
- Modelo objetivo (GGUF): https://huggingface.co/XHToken/Spark-X2.6-4B-GGUF
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Fork de llama.cpp con soporte DSpark: https://github.com/XHToken/llama.cpp
- Licencia Apache 2.0: https://huggingface.co/XHToken/Spark-X2.6-4B-DSpark-GGUF/blob/main/LICENSE
- Paper o blog de la serie Spark-X2.6: no disponible (solo referencia BibTeX en la model card, sin URL)
