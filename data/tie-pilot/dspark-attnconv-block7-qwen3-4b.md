# TIE-Pilot/dspark-attnconv-block7-qwen3-4b

## Resumen

DSpark-AttnConv block-7 es un modelo borrador (drafter) de decodificacion especulativa disenado para acelerar la inferencia de Qwen/Qwen3-4B. Lo publica el usuario TIE-Pilot bajo licencia Apache 2.0 y su funcion no es generar texto por si mismo, sino proponer bloques de 7 tokens que el modelo objetivo verifica en una sola pasada, reduciendo el numero de pasos autorregresivos necesarios.

El borrador tiene 5 capas, hidden de 2560, 32 cabezas de atencion (8 KV) y head_dim 128, con 1.418.557.953 parametros totales segun safetensors, cifra que incluye el embedding y la LM head del objetivo, congelados. Frente a un baseline DSpark de identico tamano y presupuesto de entrenamiento, anade tres cambios: una cabeza order-1 de tipo atencion, una convolucion depthwise corta sobre el eje del horizonte de borrador y slot embeddings en el flujo residual.

Su relevancia es doble. Por un lado, mejora de forma consistente la longitud media aceptada (τ) y el speedup (S) respecto al drafter oficial de DeepSeek en nueve tareas y a dos temperaturas. Por otro, requiere codigo especifico (DeepSpec y una build de SGLang con el camino block-parallel), lo que limita su adopcion fuera de ese stack.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter transformer block-parallel de 5 capas; atencion no causal dentro del bloque de borrador, cabeza order-1 tipo atencion, convolucion depthwise corta y slot embeddings |
| Parametros totales | 1.418.557.953 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; opera sobre la cache KV del modelo objetivo Qwen3-4B |
| Tipos de cuantizacion | No disponible; los pesos se publican en bfloat16 |
| Idiomas soportados | No disponibles a nivel de drafter; hereda los del modelo objetivo Qwen3-4B |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con config.json); el repositorio incluye 10 checkpoints, uno por epoca |
| Tamano de bloque de borrador | 7 tokens por forward |
| Precision | bfloat16 |
| Modelo objetivo | Qwen/Qwen3-4B (36 capas, congelado) |

## Arquitectura y entrenamiento

El drafter es un transformer de 5 capas con hidden 2560, intermediate 9728, 32 cabezas de atencion y 8 cabezas KV (head_dim 128). Consume los hidden states del objetivo en las capas 1, 9, 17, 25 y 33 como "taps", y genera un bloque de 7 tokens en un unico forward. La mascara de atencion es no causal dentro del bloque (`is_causal=false`), lo que permite paralelizar la propuesta de los 7 tokens. La cabeza order-1 es un bloque de atencion real (rank 512, 4 cabezas de dimension 128, MLP de hidden 2048, out_scale 0.35) en lugar de la forma bilineal de bajo rango del baseline. Se anade una convolucion depthwise de kernel 2 y group size 16 sobre el eje del horizonte de borrador, y slot embeddings con depth fraction 0.4. El embedding y la LM head son los del objetivo y se incluyen congelados en el checkpoint para que cargue de forma autonoma.

El entrenamiento usa rollouts on-policy de Qwen3-4B (1.339.867 filas), 10 epocas y 26.160 pasos de optimizador (2.616 por epoca), con learning rate 6e-4 y schedule coseno sobre el total de pasos. La funcion de perdida es 0,1 x entropia cruzada + 0,9 x L1, donde el termino L1 actua como proxy de aceptacion por variacion total; el objetivo pondera TV en lugar de entropia cruzada pura porque esta ultima es un objetivo de temperatura 0. Se usaron 512 anchors por paso, 4 GPUs con FSDP `no_shard` y batch local 1. Los pesos del objetivo permanecen congelados durante todo el proceso.

## Capacidades

- No es un modelo generativo autonomo: su unica funcion es proponer bloques de 7 tokens candidatos para que Qwen3-4B los verifique en una sola pasada.
- Longitud media aceptada (τ) de 5,3259 en el macro de 3.030 filas a temperatura 0, lo que implica que de cada 7 tokens propuestos se aceptan aproximadamente 5,3.
- Speedup end-to-end respecto a decodificacion autorregresiva de 3,86 en el macro a temperatura 0 y 3,48 a temperatura 1 (antes de optimizaciones de serving).
- Atencion no causal dentro del bloque: los 7 tokens del borrador se proponen en paralelo, no secuencialmente.
- Reutiliza la cache KV y los hidden states intermedios del objetivo, por lo que no mantiene contexto propio.
- Al acelerar Qwen3-4B, hereda de forma indirecta sus capacidades: generacion de texto, razonamiento, matematicas, codigo, tool calling y flujo de agentes, sin anadir ninguna por su cuenta.
- No dispone de modo thinking, vision, audio ni capacidades multimodales propias.
- El determinismo token a token solo se garantiza con `--enable-deterministic-inference`; sin ese flag la salida puede diferir de la decodificacion autorregresiva.

## Casos de uso

- Serving de Qwen3-4B en produccion: desplegar el par objetivo + drafter reduce el numero de forwards del modelo grande. En GSM8K a temperatura 0 el speedup medido es de 4,64x, lo que se traduce directamente en menos GPU-hora por peticion.
- Razonamiento matematico de baja latencia: en MATH-500 y AIME25 la longitud aceptada sube a 6,457 y 5,888 a temperatura 0, por lo que tareas con cadenas de razonamiento largas se benefician de mas tokens aceptados por paso de verificacion.
- Generacion de codigo asistida en IDE: sobre HumanEval, MBPP y LiveCodeBench el drafter alcanza speedups de 4,19, 4,00 y 4,32 a temperatura 0, adecuado para autocompletado donde la latencia percibida es critica.
- Agentes y flujos multi-paso con tool calling: al acelerar el modelo objetivo sin alterar su distribucion de salida (con decodificacion determinista), mantiene la fiabilidad del tool calling y reduce el coste de las cadenas de llamadas largas.
- Reduccion de coste en inferencia por lotes: el speedup end-to-end de 2,4x a 4,7x segun tarea permite servir mas peticiones por GPU o migrar cargas a hardware de gama menor.
- Investigacion en decodificacion especulativa: el repositorio incluye un checkpoint por epoca con estado del optimizador y `train_config.py`, lo que permite reproducir la trayectoria de convergencia (de τ=4,2878 en la epoca 1 a 4,9395 en la 10) y estudiar el efecto de cada cambio arquitectonico.

## Benchmarks y rendimiento

Comparativa contra el drafter oficial `deepseek-ai/dspark_qwen3_4b_block7`, mismo benchmark, mismo harness y mismo modelo objetivo. τ es la longitud media aceptada por paso de verificacion; S es el speedup end-to-end sobre decodificacion autorregresiva.

| Tarea | Filas | τ T=0 DSpark | τ T=0 este | S T=0 DSpark | S T=0 este | τ T=1 DSpark | τ T=1 este | S T=1 DSpark | S T=1 este |
|---|---|---|---|---|---|---|---|---|---|
| GSM8K | 500 | 6,353 | 6,523 | 4,51 | 4,64 | 6,110 | 6,322 | 4,25 | 4,36 |
| MATH-500 | 500 | 6,309 | 6,457 | 4,55 | 4,69 | 5,730 | 5,908 | 4,08 | 4,21 |
| AIME25 | 30 | 5,663 | 5,888 | 4,10 | 4,29 | 4,927 | 5,083 | 3,51 | 3,65 |
| HumanEval | 164 | 5,695 | 5,857 | 4,06 | 4,19 | 5,449 | 5,612 | 3,82 | 3,95 |
| MBPP | 256 | 5,465 | 5,587 | 3,89 | 4,00 | 5,119 | 5,323 | 3,61 | 3,75 |
| LiveCodeBench | 500 | 5,675 | 5,864 | 4,18 | 4,32 | 4,920 | 5,164 | 3,42 | 3,60 |
| MT-Bench | 80 | 3,846 | 4,003 | 2,78 | 2,92 | 3,658 | 3,810 | 2,55 | 2,69 |
| Alpaca | 500 | 3,724 | 3,851 | 2,71 | 2,81 | 3,562 | 3,732 | 2,52 | 2,62 |
| Arena-Hard-v2 | 500 | 3,755 | 3,902 | 2,76 | 2,89 | 3,286 | 3,443 | 2,36 | 2,47 |
| Macro | 3030 | 5,1650 | 5,3259 | 3,73 | 3,86 | 4,7511 | 4,9329 | 3,35 | 3,48 |

La mejora a temperatura 1 promedia tres lanzamientos independientes: 4,9329 ± 0,0139 frente a 4,7511 ± 0,0092, con una diferencia relativa de 3,83 % ± 0,21 puntos porcentuales.

Trayectoria de entrenamiento (τ a temperatura 1, medida antes de optimizaciones de serving):

| Epoca | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| τ | 4,2878 | 4,5592 | 4,7001 | 4,7757 | 4,8622 | 4,8986 | 4,9221 | 4,9220 | 4,9367 | 4,9395 |

Una sola epoca ya alcanza el 87 % del valor convergido, dato relevante para no atribuir mejoras a cambios arquitectonicos con cribados de una unica epoca.

No se han publicado otros benchmarks (MMLU, evaluacion de calidad de generacion del objetivo) en la informacion disponible.

## Requisitos de hardware

- VRAM del drafter: 1,418.557.953 parametros en bfloat16 equivalen a aproximadamente 2,84 GB solo de pesos, mas overhead de activaciones y cache KV del objetivo.
- VRAM del sistema completo: el drafter se ejecuta junto a Qwen3-4B, que en bfloat16 ocupa unos 8 GB. El serving conjunto parte de unos 11 GB de VRAM antes de cache KV y batching; con el objetivo en 4 bits, la base baja a unos 5,5-6 GB.
- GPU recomendadas: H100, A100 o L40S para despliegue en produccion con batching. En consumer, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente para el par en bfloat16 con lotes moderados; una RTX 4080 (16 GB) es viable con cuantizacion del objetivo.
- El repositorio ocupa 105,3 GB porque incluye 10 checkpoints (uno por epoca) con estado del optimizador; para inferencia solo hace falta `model.safetensors` y `config.json` de la raiz (epoca 10).
- Opciones de despliegue: no es compatible con `AutoModel.from_pretrained` de transformers (arquitectura `Qwen3DSparkModel` personalizada). Requiere el codigo de entrenamiento/serving DeepSpec y una build de SGLang con el camino block-parallel de decodificacion especulativa. El tag `text-generation-inference` figura en el repositorio, pero la model card indica explicitamente que hace falta codigo propio para cargarlo.
- No hay soporte declarado para llama.cpp, Ollama ni vLLM en la informacion disponible.
- Latencia y throughput: no se publican numeros absolutos de tokens por segundo. Los unicos datos son relativos (speedup S de 2,36x a 4,69x segun tarea y temperatura) frente a decodificacion autorregresiva del mismo objetivo.
- Para reproducir la decodificacion token a token hay que activar `--enable-deterministic-inference`.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Bloque de borrador | τ macro T=0 | S macro T=0 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| TIE-Pilot/dspark-attnconv-block7-qwen3-4b | Drafter block-parallel | 1,42 B | 7 | 5,3259 | 3,86 | Apache 2.0 | Pesos en HuggingFace, requiere DeepSpec + SGLang |
| deepseek-ai/dspark_qwen3_4b_block7 | Drafter block-parallel (baseline) | Tamano identico segun la model card | 7 | 5,1650 | 3,73 | No disponible en la informacion proporcionada | Pesos en HuggingFace |
| Otros drafters (EAGLE-3, Medusa, capas de borrador nativas) | Drafter / cabeza especulativa | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos comparativos con drafters alternativos distintos del baseline DSpark en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: no puede generar texto sin el modelo objetivo Qwen3-4B y sin la cache KV de este.
- La decodificacion solo es token-exacta (lossless) con `--enable-deterministic-inference`. Sin ese flag, los patrones de aceptacion alteran que tokens se agrupan en cada pasada de verificacion, cambia el orden de reduccion del objetivo y los empates pueden resolverse de forma distinta, produciendo salidas diferentes a las autorregresivas.
- Dependencia fuerte de un stack propietario: hace falta el codigo DeepSpec y una build de SGLang con el camino block-parallel. No funciona con `AutoModel.from_pretrained`, ni con llama.cpp/Ollama/vLLM segun la informacion disponible.
- La model card advierte que un cribado de una sola epoca no permite detectar mejoras que solo se materializan tarde: la epoca 1 alcanza ya el 87 % del valor convergido, por lo que deltas pequenos entre arquitecturas exigen entrenamientos completos.
- No se publican datos de sesgos, tasas de alucinacion ni evaluacion de calidad de la salida generada; el drafter no altera el contenido, pero tampoco lo filtra.
- Idiomas soportados: no declarados para el drafter. Dependen exclusivamente de Qwen3-4B.
- Limitaciones de contexto: no declaradas. El borrador opera sobre la ventana y la cache KV del objetivo, por lo que hereda sus restricciones.
- No hay soporte de cuantizacion documentado para el drafter; los pesos se publican en bfloat16.
- El repositorio pesa 105,3 GB por los 10 checkpoints con estado del optimizador, lo que complica su descarga y almacenamiento si solo se busca inferencia.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales conocidas, pero el codigo de serving necesario (DeepSpec, SGLang) tiene sus propias condiciones, no detalladas en la informacion proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TIE-Pilot/dspark-attnconv-block7-qwen3-4b
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-4B
- Drafter baseline de DeepSeek: https://huggingface.co/deepseek-ai/dspark_qwen3_4b_block7
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo (los resultados se referian al termino ingles "tie"); no hay papers, blogs ni demos adicionales disponibles.
