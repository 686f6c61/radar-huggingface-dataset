# zaydmulani/Ternary-Bonsai-1.7B-TQ2_0_G128

## Resumen

Ternary-Bonsai-1.7B-TQ2_0_G128 es un fichero GGUF publicado por el usuario zaydmulani que contiene los pesos del modelo Ternary-Bonsai-1.7B de PrismML (una versión ternaria de Qwen3-1.7B) reempaquetados sin pérdida en un nuevo tipo de tensor para llama.cpp denominado TQ2_0_G128. El modelo tiene 1.720.028.160 parámetros y ocupa 463 MB en disco, lo que equivale a 2,125 bits por peso: todos los tensores ternarios, incluidos el embedding atado y la cabeza LM, se almacenan como códigos de 2 bits con una escala fp16 por cada bloque de 128 pesos. La licencia es Apache 2.0.

El problema que resuelve es la velocidad de decodificación en CPU sin instrucciones de producto punto. En una placa Arduino UNO Q (Qualcomm QRB2210, 4x Cortex-A53 a 2,0 GHz, sin asimddp) alcanza 6,66 tok/s, frente a 6,22 tok/s de Gemma 3 1B Q4_0 y 6,10 tok/s de Qwen3.5-0.8B Q4_0 medidos el mismo día con la misma configuración. Además, mantiene la calidad del formato original PQ2_0 de PrismML (mismos pesos, 197 de 197 tensores bit a bit idénticos tras la deconvolución).

Su relevancia es doble: por un lado demuestra que un modelo de 1,7B en precisión ternaria puede superar en velocidad a modelos de 1B en Q4_0 sobre hardware ARM muy limitado; por otro, es un ejemplo de extensión del ecosistema llama.cpp mediante un tipo ggml nuevo (id 160) que no existe en el repositorio upstream, lo que implica que requiere un parche para poder cargarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base: Qwen3-1.7B en version ternaria de PrismML); no es MoE |
| Parametros totales | 1.720.028.160 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | TQ2_0_G128 (2,125 bits por peso); el modelo base se distribuye tambien en PQ2_0 y en un checkpoint FP16 sin empaquetar |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `Ternary-Bonsai-1.7B-TQ2_0_G128.gguf`, 463 MB); tensor ggml de tipo 160 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el entrenamiento en la documentacion proporcionada. El modelo base es Ternary-Bonsai-1.7B de PrismML, descrito como «a ternary Qwen3-1.7B», por lo que la arquitectura subyacente es la de Qwen3-1.7B (transformer denso) con pesos ternarios. Hereda el modo de razonamiento hibrido de Qwen3: con `enable_thinking=false` o con un bloque `<think>` vacio precargado tras la etiqueta del asistente, responde de forma directa; con el razonamiento activo, el modelo suele consumir un presupuesto de 128 tokens dentro de `<think>` antes de contestar.

La innovacion tecnica esta en el formato de empaquetado, no en el entrenamiento. Cada bloque TQ2_0_G128 consta de 32 bytes de codigos de 2 bits mas una escala fp16, es decir 34 bytes por cada 128 pesos. La disposicion de los codigos sigue la de TQ2_0: el byte m contiene los pesos m, m+32, m+64 y m+96 en los bits 0, 2, 4 y 6, y el valor decodificado es `(code - 1) * scale` con `code` en {0, 1, 2}. La multiplicacion de matrices se realiza contra activaciones Q8_K, de modo que cada bloque Q8_K de 256 elementos cubre dos bloques G128, cada mitad con su propia escala. El reempaquetado es sin perdida: los 197 tensores coinciden bit a bit con la release PQ2_0 de PrismML y solo el 0,0025 % de los pesos difiere respecto al checkpoint FP16 sin empaquetar (740 grupos en los que el fichero FP16 contiene dos magnitudes y PQ2_0 las redondea igual). El parche aporta kernels para ARM NEON sin dotprod, x86 AVX2 y C generico; el kernel NEON coincide exactamente con el generico y el AVX2 difiere solo por redondeo en coma flotante (2,4e-8 relativo a la suma de |w*a|), verificado sobre 2000 filas aleatorias de 6144 pesos.

## Capacidades

- Generacion de texto y finalizacion de secuencias en modo base, con plantilla de chat compatible con el formato Qwen (`<|im_start|>` / `<|im_end|>`).
- Razonamiento hibrido con modo «thinking» opcional, heredado de Qwen3.
- Razonamiento matematico de varios pasos: 62,7 % en GSM8K con 4 ejemplos (300 preguntas).
- Conocimiento general limitado: 46,8 % en MMLU (1000 preguntas, 0-shot) y 20,8 % en TriviaQA (500 preguntas, 5-shot, rc.nocontext).
- Inferencia en CPU pura sin instrucciones de producto punto, incluidos SoC ARM Cortex-A53.
- No hay evidencia en la informacion proporcionada de soporte de tool calling, function calling, uso de agentes, vision, audio ni capacidades multilingues declaradas.

## Casos de uso

- Inferencia en placas SBC y hardware embebido: el fichero de 463 MB y los 6,66 tok/s medidos en un Arduino UNO Q (4x Cortex-A53 sin dotprod) permiten desplegar un asistente de texto local en dispositivos donde un modelo de 1B en Q4_0 no dejaria margen de velocidad.
- Clasificacion y extraccion de texto en el borde: con contexto corto y decodificacion greedy, el modelo puede etiquetar o resumir entradas breves en un dispositivo sin GPU ni conexion de red.
- Generacion de respuestas directas en aplicaciones de baja latencia: desactivando el modo thinking (`enable_thinking=false`) se evita el gasto de hasta 128 tokens dentro de `<think>` y se obtienen contestaciones inmediatas.
- Evaluacion y comparacion de formatos de cuantizacion: al ser bit a bit equivalente a la release PQ2_0 de PrismML, sirve como referencia para medir el impacto del layout del tensor en el rendimiento sin que la calidad cambie.
- Investigacion sobre tipos ggml y kernels SIMD: el parche incluye kernels NEON, AVX2 y C generico con un test de validacion (`test_vec_dot.c`), lo que lo convierte en material de partida para desarrollar nuevos tipos de tensor en llama.cpp.
- Prototipado de asistentes con razonamiento controlado: el modo thinking permite alternar entre respuestas rapidas y cadenas de razonamiento en la misma aplicacion, segun el coste computacional que se quiera asumir.
- Demostraciones educativas de cuantizacion ternaria extrema: con 2,125 bits por peso y licencia Apache 2.0, es util para explicar el compromiso entre tamano, velocidad y precision en modelos pequenos.

## Benchmarks y rendimiento

Evaluacion con peticiones identicas para todos los modelos: completado en crudo sin plantilla de chat, decodificacion greedy, ejecutada en un PC x86 con los mismos ficheros GGUF. Precision en porcentaje con intervalos de Wilson del 95 %. MMLU: 1000 preguntas, 0-shot, letra de respuesta restringida por gramatica. GSM8K: 300 preguntas, 4-shot. TriviaQA: 500 preguntas, rc.nocontext, 5-shot, coincidencia exacta.

| Modelo | MMLU (1000) | GSM8K (300) | TriviaQA (500) |
|---|---:|---:|---:|
| Ternary-Bonsai-1.7B TQ2_0_G128 | 46,8 [43,7; 49,9] | 62,7 [57,1; 67,9] | 20,8 [17,5; 24,6] |
| Ternary-Bonsai-1.7B PQ2_0 (mismos pesos) | 46,9 [43,8; 50,0] | 62,7 [57,1; 67,9] | 21,2 [17,8; 25,0] |
| Gemma 3 1B Q4_0 (QAT) | 38,4 [35,4; 41,5] | 12,0 [8,8; 16,2] | 19,8 [16,5; 23,5] |
| Qwen3.5-0.8B Q4_0 | 38,5 [35,5; 41,6] | 26,3 [21,7; 31,6] | 10,4 [8,0; 13,4] |
| Qwen3-0.6B Q4_0 | 29,5 [26,8; 32,4] | 30,0 [25,1; 35,4] | 8,8 [6,6; 11,6] |

Velocidad de generacion en Arduino UNO Q (Qualcomm QRB2210, 4x Cortex-A53 a 2,0 GHz, sin asimddp), con `llama-bench -t 4 -p 64 -n 64 -r 3` y dos rondas alternas:

| Modelo | tg64 tok/s ronda 1 | ronda 2 | media |
|---|---:|---:|---:|
| Ternary-Bonsai-1.7B TQ2_0_G128 | 6,65 | 6,67 | 6,66 |
| Gemma 3 1B Q4_0 (QAT) | 6,18 | 6,26 | 6,22 |
| Qwen3.5-0.8B Q4_0 | 6,12 | 6,07 | 6,10 |

Como referencia adicional en la misma placa: los mismos pesos en el formato PQ2_0 de PrismML rinden 3,94 tok/s, y el Q2_0 g64 de la rama principal de llama.cpp rinde 3,53 tok/s. La regla de publicacion estaba preregistrada: ser al menos tan rapido como Gemma 3 1B Q4_0 del mismo dia y superar a ese modelo tanto en MMLU como en GSM8K con intervalos del 95 % no solapados; se cumplio en los tres criterios. En TriviaQA los intervalos se solapan con Gemma.

## Requisitos de hardware

- Tamano en disco: 463 MB para el unico fichero GGUF (`Ternary-Bonsai-1.7B-TQ2_0_G128.gguf`); el repositorio completo ocupa 0,5 GB.
- Memoria estimada para inferencia: alrededor de 1 GB de RAM/VRAM contando pesos, contexto y buffers de llama.cpp (estimacion a partir del tamano del fichero, no una medicion publicada).
- GPU: no se han publicado mediciones en GPU. Por tamano, el modelo cabe en cualquier GPU consumer actual, pero no hay datos de latencia ni throughput en esas plataformas.
- Hardware verificado: Arduino UNO Q (Qualcomm QRB2210, 4x Cortex-A53 a 2,0 GHz, sin instrucciones de producto punto), a 4 hilos, con contexto corto de 64 tokens y decodificacion greedy.
- Compatibilidad de kernels: el parche incluye kernels ARM NEON sin dotprod, x86 AVX2 y C generico. En CPU con dotprod (Cortex-A55, A76 y posteriores) el kernel NEON sigue funcionando, pero no utiliza esas instrucciones.
- Despliegue: obligatorio compilar llama.cpp desde el parche. El comando indicado por el autor es `git clone https://github.com/zaydmulani09/llama.cpp -b tq2_0-g128`, compilar con CMake en Release los objetivos `llama-cli`, `llama-server` y `llama-bench`, y ejecutar `./build/bin/llama-server -m <fichero> -t 4`. En placas Cortex-A53 se debe compilar con `-mcpu=cortex-a53` o de forma nativa en la placa. El parche tambien se aplica sobre un checkout limpio de la etiqueta `b11594` con `git apply tq2_0_g128-b11594.patch`.
- Ollama, LM Studio y cualquier build de llama.cpp upstream rechazaran el fichero: el tipo TQ2_0_G128 no existe en el repositorio oficial (usa el id de tipo ggml 160) y el autor no ha propuesto la integracion upstream.
- Latencia y throughput: 6,66 tok/s en la placa citada con contexto corto. No hay datos publicados para otros procesadores, contextos largos ni GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | GSM8K | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|---|
| Ternary-Bonsai-1.7B TQ2_0_G128 | 1,72B | no disponible | 46,8 | 62,7 | Apache 2.0 | GGUF; requiere llama.cpp parcheado |
| Ternary-Bonsai-1.7B PQ2_0 (PrismML) | 1,72B | no disponible | 46,9 | 62,7 | no disponible en la informacion proporcionada | Formato PQ2_0 de PrismML; 3,94 tok/s en la misma placa |
| Gemma 3 1B Q4_0 (QAT) | 1B aprox. | no disponible | 38,4 | 12,0 | no disponible en la informacion proporcionada | GGUF Q4_0; 6,22 tok/s en la misma placa |
| Qwen3.5-0.8B Q4_0 | 0,8B aprox. | no disponible | 38,5 | 26,3 | no disponible en la informacion proporcionada | GGUF Q4_0; 6,10 tok/s en la misma placa |
| Qwen3-0.6B Q4_0 | 0,6B aprox. | no disponible | 29,5 | 30,0 | no disponible en la informacion proporcionada | GGUF Q4_0; sin dato de velocidad en la placa |

La comparacion mas directa es con el PQ2_0 de PrismML: mismos pesos y misma calidad, pero el layout G128 casi duplica la velocidad en Cortex-A53 (6,66 frente a 3,94 tok/s). Frente a Gemma 3 1B Q4_0 y Qwen3.5-0.8B Q4_0, la ventaja esta en MMLU y GSM8K, mientras que la velocidad es similar y el coste es la necesidad de un binario parcheado.

## Limitaciones y advertencias

- Requiere un parche obligatorio. Ninguna build upstream de llama.cpp, Ollama o LM Studio puede cargar el fichero; usa el id de tipo ggml 160, que no existe en el repositorio oficial y no se ha propuesto para integracion.
- Los datos de velocidad proceden de una unica placa (Cortex-A53 del Arduino UNO Q), con 4 hilos, decodificacion greedy y contextos de 64 tokens. Contextos largos seran mas lentos y no se ha evaluado ningun otro procesador.
- Los kernels NEON no aprovechan las instrucciones de producto punto en CPU que si las tienen (Cortex-A55, A76 y posteriores), por lo que el rendimiento relativo en esas plataformas puede ser distinto del medido.
- La calidad se midio en un PC, no en la placa; los pesos son identicos y en la placa solo cambia el redondeo en coma flotante de los kernels.
- Las puntuaciones son modestas en terminos absolutos: MMLU en torno al 47 % (no el 54 % que sugirio una ejecucion previa de 200 preguntas) y TriviaQA en torno al 21 %, lo que indica un recuerdo de conocimiento abierto debil a este tamano. Es probable que el modelo alucine en preguntas factuales.
- La evaluacion usa completado en crudo con prompts few-shot fijos, no la plantilla de chat, por lo que los numeros son comparables entre estos modelos pero no con cifras oficiales de leaderboards.
- No hay informacion sobre sesgos, composicion del dataset de entrenamiento ni idiomas soportados. La model card no los declara.
- Con el modo thinking activo, el modelo puede gastar hasta 128 tokens de presupuesto dentro de `<think>` antes de responder, lo que penaliza la latencia en aplicaciones interactivas.
- La licencia declarada del fichero es Apache 2.0, pero para el modelo base PrismML (`prism-ml/Ternary-Bonsai-1.7B-unpacked`) la informacion proporcionada no especifica condiciones. Conviene verificar la licencia del modelo base antes de un uso comercial.
- Repositorio practicamente sin traccion: 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zaydmulani/Ternary-Bonsai-1.7B-TQ2_0_G128
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-1.7B-unpacked
- Repositorio con metodologia, preregistros y registros sin procesar: https://github.com/zaydmulani09/uno-model (etapas 1b y 1c)
- Rama de llama.cpp con el parche (`tq2_0-g128`): https://github.com/zaydmulani09/llama.cpp/tree/tq2_0-g128
- No se han encontrado en la busqueda web articulos, papers ni demos adicionales sobre este modelo; los resultados devueltos por el buscador no guardaban relacion con el tema.
