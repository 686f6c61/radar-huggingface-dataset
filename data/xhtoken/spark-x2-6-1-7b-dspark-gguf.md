# XHToken/Spark-X2.6-1.7B-DSpark-GGUF

## Resumen

Spark-X2.6-1.7B-DSpark-GGUF es un modelo borrador (draft model) en formato GGUF, publicado por XHToken, disenado especificamente para decodificacion especulativa junto al modelo objetivo Spark-X2.6-1.7B. No es un modelo de proposito general: su funcion es proponer hasta siete tokens por pasada de borrador que el modelo objetivo verifica en paralelo, reduciendo el numero de pasos secuenciales de decodificacion del modelo grande. Con 345 millones de parametros y precision BF16, es un componente de infraestructura de inferencia mas que un modelo conversacional autonomo.

El modelo se apoya en una arquitectura de 5 capas con atencion de ventana deslizante (sliding-window attention) de 512 tokens, tamano oculto de 2048 y extraccion de estados ocultos del modelo objetivo en las capas [2, 8, 14, 19, 25]. La propuesta de valor es el incremento de throughput medido: hasta 2,10x de media en BF16 sobre RTX 4090 con llama.cpp y 1,88x en Apple M5 Pro con MLX, con menores ganancias en configuraciones cuantizadas (1,53x en Q4_K_M y 1,20x en INT4).

Es relevante ahora porque la decodificacion especulativa se ha consolidado como la tecnica principal para reducir latencia en inferencia de LLM sin degradar la calidad de salida, y este borrador esta optimizado para un modelo objetivo concreto con modos de razonamiento (thinking high/low/no thinking). La licencia Apache 2.0 y la compatibilidad con API OpenAI a traves de un fork de llama.cpp facilitan su integracion en produccion, aunque la integracion en el llama.cpp upstream aun esta en curso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con 5 capas de atencion de ventana deslizante (SWA), tamano oculto 2048, modelo borrador para decodificacion especulativa |
| Parametros totales | 345.100.545 (345M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible para el borrador; ventana deslizante de 512 tokens; el servidor de ejemplo se lanza con `-c 8192` |
| Tipos de cuantizacion | Pesos del borrador en BF16; el modelo objetivo admite BF16 y GGUF cuantizado (Q4_K_M, INT4 en MLX) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (BF16) |

## Arquitectura y entrenamiento

El borrador es un transformer pequeno de 5 capas con atencion de ventana deslizante de 512 tokens y dimension oculta de 2048. En lugar de predecir tokens de forma independiente, consume estados ocultos intermedios del modelo objetivo extraidos de las capas 2, 8, 14, 19 y 25, lo que le permite alinear sus propuestas con la representacion interna del modelo grande. En cada pasada de borrador propone hasta 7 tokens, que el modelo objetivo verifica en paralelo; la longitud de aceptacion incluye un token adicional del objetivo, con maximo de 8.

No se han publicado en la informacion disponible detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card unicamente documenta la configuracion arquitectonica, el esquema de extraccion de estados ocultos y los resultados de aceptacion y throughput. La innovacion tecnica destacable es el esquema de muestreo del borrador: admite decodificacion probabilistica y greedy, y la evaluacion cubre los tres modos de pensamiento del modelo objetivo (high, low, no thinking) a temperaturas 0 y 1.

## Capacidades

- Generacion de propuestas de tokens para decodificacion especulativa: hasta 7 tokens por pasada de borrador, verificados en paralelo por el modelo objetivo.
- Aceleracion de inferencia del modelo objetivo Spark-X2.6-1.7B en tareas de razonamiento matematico (AIME25, GSM8K, MATH500), codigo (HumanEval, MBPP) y conversacion (Arena-Hard-v2).
- Soporte de decodificacion probabilistica y greedy en el borrador, configurable mediante `--spec-draft-sampling`.
- Compatibilidad con pesos objetivo en BF16 y cuantizados (Q4_K_M en llama.cpp, INT4 en MLX).
- Integracion con API compatible con OpenAI a traves del servidor `llama-server` del fork XHToken/llama.cpp.
- Idiomas: ingles y chino (heredados del modelo objetivo).
- No soporta tool calling, agentes, vision ni audio por si mismo: esas capacidades residen en el modelo objetivo, no en el borrador.

## Casos de uso

- Aceleracion de inferencia en produccion: desplegar el par objetivo + borrador en llama.cpp para reducir la latencia por token en un 50-110 % en BF16 sobre RTX 4090, manteniendo la distribucion de salida del modelo objetivo gracias a la verificacion paralela.
- Razonamiento matematico de baja latencia: en cargas con GSM8K o MATH500 el borrador alcanza longitudes de aceptacion medias de 4,03 y 3,94 tokens (T=1, low, probabilistico), lo que se traduce en hasta 2,43x de throughput en BF16 sobre RTX 4090.
- Generacion de codigo interactiva: con HumanEval y MBPP se obtienen 1,96x de aceleracion en BF16 sobre RTX 4090, adecuado para asistentes de codigo con requisitos de respuesta sub-segundo.
- Despliegue en dispositivo (on-device): en Apple M5 Pro con MLX y objetivo INT4 se consigue 1,20x de media (hasta 1,30x en MATH500), util para aplicaciones locales en portatiles Apple Silicon.
- Servicio de chat con API OpenAI-compatible: el servidor de ejemplo expone `/v1/chat/completions` con `--jinja`, lo que permite sustituir un endpoint existente sin cambiar el cliente.
- Ajuste de rendimiento por modo de pensamiento: en modo "no thinking" la longitud de aceptacion media sube a 4,09 tokens (frente a 3,58 en high), por lo que conviene activar el borrador en flujos conversacionales sin razonamiento extendido.
- Evaluacion comparativa de tecnicas de decodificacion especulativa: el par objetivo-borrador sirve como banco de pruebas reproducible con datasets publicos y modos de muestreo documentados.

## Benchmarks y rendimiento

Longitud media de aceptacion (draft length 7, salida maxima 4096 tokens, maximo teorico 8):

| Dataset | T=1, High, Prob. | T=1, Low, Prob. | T=1, No thinking, Prob. | T=0, High, Greedy |
|---|---:|---:|---:|---:|
| AIME25 | 3,5443 | 3,5919 | 4,4806 | 4,1771 |
| GSM8K | 3,7875 | 4,0283 | 4,4305 | 4,4367 |
| MATH500 | 3,9027 | 3,9425 | 4,7694 | 4,5103 |
| HumanEval | 3,5324 | 3,5795 | 4,0170 | 4,4917 |
| MBPP | 3,6004 | 3,7508 | 3,8723 | 4,3375 |
| Arena-Hard-v2 | 3,0905 | 3,0219 | 2,9768 | 3,9412 |
| **Media** | **3,5763** | **3,6525** | **4,0911** | **4,3158** |

Throughput con y sin DSpark (llama.cpp en RTX 4090, MLX en Apple M5 Pro):

| Dataset | BF16 · RTX 4090 | BF16 · M5 Pro | Q4_K_M · RTX 4090 | INT4 · M5 Pro |
|---|:---:|:---:|:---:|:---:|
| AIME25 | 2,03x (220 → 447 tok/s) | 1,80x (68 → 123 tok/s) | 1,44x (424 → 612 tok/s) | 1,15x (140 → 161 tok/s) |
| GSM8K | 2,43x (220 → 536 tok/s) | 1,97x (68 → 134 tok/s) | 1,81x (424 → 769 tok/s) | 1,25x (137 → 172 tok/s) |
| MATH500 | 2,40x (220 → 530 tok/s) | 2,04x (69 → 140 tok/s) | 1,71x (424 → 724 tok/s) | 1,30x (135 → 176 tok/s) |
| HumanEval | 1,96x (220 → 430 tok/s) | 1,85x (68 → 126 tok/s) | 1,49x (422 → 628 tok/s) | 1,18x (139 → 164 tok/s) |
| MBPP | 1,96x (221 → 434 tok/s) | 1,93x (68 → 132 tok/s) | 1,43x (426 → 609 tok/s) | 1,23x (140 → 172 tok/s) |
| Arena-Hard-v2 | 1,83x (219 → 401 tok/s) | 1,66x (68 → 114 tok/s) | 1,33x (422 → 560 tok/s) | 1,06x (137 → 146 tok/s) |
| **Media** | **2,10x (220 → 463 tok/s)** | **1,88x (68 → 128 tok/s)** | **1,53x (424 → 650 tok/s)** | **1,20x (138 → 165 tok/s)** |

No se han publicado resultados de benchmarks de calidad del modelo objetivo (MMLU, HumanEval como evaluacion de correccion, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM del borrador: 345M parametros en BF16 equivalen a aproximadamente 0,7 GB de pesos; el repo ocupa 1,9 GB en total, por lo que el borrador anade una huella modesta sobre el modelo objetivo.
- VRAM total: depende del modelo objetivo Spark-X2.6-1.7B; el borrador en si cabe en cualquier GPU consumer con al menos 2 GB libres.
- GPU validadas en la model card: NVIDIA RTX 4090 (BF16 y Q4_K_M) y Apple M5 Pro (BF16 e INT4 via MLX).
- GPU recomendadas para mayor throughput: RTX 4090 o superiores (A100, H100) para BF16; el borrador no requiere memoria significativa, el cuello de botella es el objetivo.
- Cabe en GPU consumer: si, el borrador es de 345M parametros; el limite practico lo marca el modelo objetivo.
- Opciones de despliegue: llama.cpp mediante el fork XHToken/llama.cpp con `--spec-type draft-dspark`; MLX en Apple Silicon. La integracion en llama.cpp upstream esta en curso. No se documenta soporte en vLLM, TGI ni Ollama.
- Latencia y throughput: 220 → 463 tok/s de media en BF16 sobre RTX 4090 y 68 → 128 tok/s en M5 Pro BF16; con cuantizacion, 424 → 650 tok/s (Q4_K_M, RTX 4090) y 138 → 165 tok/s (INT4, M5 Pro).
- Parametros de servidor relevantes: `--spec-draft-n-max 7`, `--spec-draft-p-min 0`, `-ngl 999 -ngld 999`, `-fa on`, `-c 8192`, `-b 2048 -ub 512`.

## Comparativa con modelos similares

| Modelo | Parametros | Funcion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spark-X2.6-1.7B-DSpark | 345M (borrador) | Decodificacion especulativa para Spark-X2.6-1.7B | SWA 512 en borrador | Apache 2.0 | GGUF en HuggingFace |
| Spark-X2.6-1.7B (objetivo) | 1,7B (nominal) | Modelo generativo objetivo | no disponible | Apache 2.0 | GGUF en HuggingFace |
| Borradores especulativos genericos (EAGLE, Medusa, etc.) | Variable | Decodificacion especulativa | no disponible | Variable | No disponible en la informacion |

No se dispone de datos de benchmarks comparativos con otros borradores especulativos en la informacion proporcionada; la model card solo compara el rendimiento del objetivo con y sin DSpark.

## Limitaciones y advertencias

- El modelo no es utilizable de forma autonoma: sin el modelo objetivo Spark-X2.6-1.7B no genera texto coherente, ya que depende de sus estados ocultos.
- La aceleracion depende del regimen: en configuraciones muy cuantizadas (INT4 en M5 Pro) la ganancia media baja a 1,20x y en Arena-Hard-v2 a 1,06x, por lo que el retorno es limitado en esos escenarios.
- La longitud de aceptacion varia notablemente por tarea y modo de pensamiento (de 2,98 a 4,77 tokens), lo que afecta a la latencia efectiva en produccion.
- Requiere un fork especifico de llama.cpp (XHToken/llama.cpp, rama master, commit 22c0ae1); la integracion en upstream esta en curso, lo que implica riesgo de mantenimiento y de incompatibilidades futuras.
- Idiomas limitados a ingles y chino; no se documenta soporte de castellano.
- No se han publicado detalles de datos de entrenamiento, sesgos ni evaluaciones de alucinacion del par objetivo-borrador.
- La licencia Apache 2.0 permite uso comercial, pero al ser un componente de inferencia no otorga por si misma garantias sobre el modelo objetivo, que debe evaluarse por separado.
- Los numeros de throughput proceden del autor y se han medido en hardware concreto (RTX 4090, M5 Pro); no deben extrapolarse sin validacion propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/XHToken/Spark-X2.6-1.7B-DSpark-GGUF
- Modelo objetivo: https://huggingface.co/XHToken/Spark-X2.6-1.7B
- Modelo objetivo en GGUF: https://huggingface.co/XHToken/Spark-X2.6-1.7B-GGUF
- Fork de llama.cpp: https://github.com/XHToken/llama.cpp
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-1.7B
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Citacion: SparkLLM Team, "Spark-X2.6-4B&1.7B: Advancing the Frontier of On-Device Agents for Real-World Tasks", 2026 (BibTeX en la model card; sin URL de paper disponible)
