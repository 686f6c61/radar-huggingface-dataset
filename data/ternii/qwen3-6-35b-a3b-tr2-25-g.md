# Ternii/Qwen3.6-35B-A3B-TR2.25-G

## Resumen

Qwen3.6-35B-A3B-TR2.25-G es una cuantizacion ternaria del modelo Qwen3.6-35B-A3B desarrollado por el equipo Qwen, publicada por el usuario Ternii (Wai Chung). El modelo aplica una tecnica propia denominada TR Quantisation, que almacena los pesos como trits (digitos ternarios) con una media de 2,25 trits por peso, cada uno codificado como un entero pequeno sobre una rejilla simetrica de 9, 27 o 81 niveles, con una escala de 16 bits por cada grupo de 128 pesos. No hay reentrenamiento ni ajuste fino: la arquitectura, el tokenizer y la plantilla de chat son los originales de Qwen.

El modelo base es un transformer de tipo mixture-of-experts (MoE) con 10.233.365.632 parametros reales almacenados en safetensors (el nombre comercial indica 35B totales y 3B activos). Esta orientado a generacion de texto, conversacion, codigo y razonamiento, con soporte de tool calling y decodificacion especulativa mediante una cabeza de multi-token prediction (MTP). Su interes actual reside en que reduce el peso en memoria de los pesos en GPU a 16,09 GiB frente a los 19,55 GiB del checkpoint NVFP4 de NVIDIA, con una velocidad de decodificacion superior y sin diferencias significativas en los benchmarks principales.

La licencia es Apache-2.0, heredada del modelo base, y el repositorio ocupa 18,0 GB. La inferencia requiere un runtime especifico (plugin `tritq-qwen36` sobre vLLM 0.28.0) o la variante GGUF publicada por el mismo autor para llama.cpp y Mac.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe) con cabeza MTP; vision encoder eliminado en este repo |
| Parametros totales | 10.233.365.632 (segun safetensors); nombre comercial 35B-A3B |
| Parametros activos | no disponible (el nombre indica 3B, sin confirmacion en la model card) |
| Longitud de contexto | no disponible (el ejemplo de despliegue usa `--max-model-len 16384`) |
| Tipos de cuantizacion | Ternaria TR: 2,25 trits/peso de media, rejilla simetrica de 9, 27 o 81 niveles, escala de 16 bits por grupo de 128 pesos; cabeza MTP en 8-bit block floating point |
| Idiomas soportados | en (segun metadatos); el modelo base Qwen es multilingue |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tensores trit empaquetados); variante GGUF en repo separado |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.6-35B-A3B: un transformer con capas de mezcla de expertos, tokenizer y plantilla de chat propias de Qwen, mas una cabeza de multi-token prediction (MTP) utilizada para decodificacion especulativa. La cuantizacion TR no modifica la arquitectura ni el entrenamiento: los pesos originales se traducen a codigos ternarios calibrados con GPTQ (el sufijo `-G` del nombre), agrupados en bloques de 128 pesos con una escala de 16 bits compartida. La cabeza MTP se mantiene en 8-bit block floating point para preservar la calidad del borrador especulativo.

No se especifica en la informacion disponible el numero de tokens de entrenamiento ni la composicion del dataset del modelo base. Los datasets listados en los metadatos (nvidia/OpenCodeInstruct, EleutherAI/hendrycks_math, openai/gsm8k) parecen corresponder a la calibracion GPTQ o a la evaluacion, no al preentrenamiento. La innovacion tecnica destacable es doble: por un lado, el esquema de cuantizacion ternaria con escalas por grupo que permite servir el modelo en 16,09 GiB de VRAM; por otro, el runtime con Model Runner V2 de vLLM y una parada por confianza (`TQ_CSTOP=0.7,3`) que limita el numero de tokens especulados segun la probabilidad top-1 del borrador, con un coste declarado de aproximadamente un 2 % por flujo en escenarios de 4 a 8 usuarios.

## Capacidades

- Generacion de texto y conversacion multi-turno, con plantilla de chat de Qwen y modo thinking desactivable mediante `chat_template_kwargs`.
- Razonamiento matematico: resultados de 90,83 en GSM8K y 81,9 en MGSM (11 idiomas) segun la model card.
- Generacion de codigo: 88,41 en HumanEval+ y 76,72 en MBPP+.
- Function calling: 81,5 en BFCL v4, con capacidad destacada para declinar llamadas irrelevantes.
- Seguimiento de instrucciones: 82,62 en IFEval (prompt strict).
- Conocimiento general y razonamiento: 77,7 en MMLU-Pro.
- Decodificacion especulativa con cabeza MTP y parada por confianza configurable.
- Capacidades multilingues limitadas en matematicas: MGSM de 81,9, significativamente inferior al checkpoint NVFP4 (84,2), con la mayor brecha en bengali.
- Vision: no incluida en este repositorio (encoder eliminado); el autor indica que una variante con la torre de vision podria publicarse mas adelante.

## Casos de uso

- Despliegue en hardware de borde o estaciones compactas: con 16,09 GiB de pesos en GPU y configuracion de `--gpu-memory-utilization 0.6`, el modelo cabe en una NVIDIA DGX Spark y permite servir inferencia de un MoE de gran tamano en un unico dispositivo.
- Atencion al cliente automatizada: la ventana de contexto configurable (16.384 tokens en el ejemplo oficial) y la plantilla de chat de Qwen permiten conversaciones multi-turno con historial extenso; el modo thinking desactivable reduce la latencia en produccion.
- Generacion de codigo en pipelines de CI/CD: los resultados de HumanEval+ (88,41) y MBPP+ (76,72) junto con el soporte de function calling (BFCL v4 de 81,5) permiten integrarlo como agente que invoca herramientas de build, test o analisis estatico.
- Servicio de inferencia de alta concurrencia: la decodificacion especulativa MTP con parada por confianza ofrece 180,9 tokens/s con un usuario y 82,4 y 54,1 tokens/s por usuario con 4 y 8 usuarios respectivamente, adecuado para APIs con multiples sesiones simultaneas.
- Razonamiento matematico asistido: GSM8K de 90,83 lo hace util para tutoria o verificacion de calculos, aunque el rendimiento multilingue en matematicas es inferior y conviene restringir a ingles.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio incluye mediciones frente a NVFP4 en el mismo hardware y configuracion de servidor, lo que lo convierte en una referencia practica para estudiar el compromiso entre tamano, velocidad y precision en cuantizacion de baja bit-width.
- Prototipado de agentes con tool calling: la puntuacion de BFCL v4 y la capacidad de declinar llamadas irrelevantes reducen las invocaciones erroneas en flujos de agentes multi-paso.

## Benchmarks y rendimiento

Resultados publicados en la model card, comparando TR2.25-G con el checkpoint `nvidia/Qwen3.6-35B-A3B-NVFP4` en la misma DGX Spark, vLLM 0.28.0, solo texto y thinking desactivado:

| Benchmark | TR2.25-G | NVFP4 | Observacion |
|---|---|---|---|
| GSM8K | 90,83 | 91,10 | Sin diferencia significativa |
| HumanEval+ | 88,41 | 89,02 | Sin diferencia significativa |
| MBPP+ | 76,72 | 76,19 | Sin diferencia significativa |
| IFEval (prompt strict) | 82,62 | 84,29 | Sin diferencia significativa |
| MMLU-Pro | 77,7 | 77,3 | Sin diferencia significativa |
| BFCL v4 function calling | 81,5 | 79,2 | TR por delante, atribuido a una categoria (declinar llamadas irrelevantes) |
| MGSM (11 idiomas) | 81,9 | 84,2 | TR significativamente inferior |

| Metrica de rendimiento | TR2.25-G | NVFP4 | Ratio |
|---|---|---|---|
| Peso de pesos en GPU | 16,09 GiB | 19,55 GiB | 18 % menor |
| Peso con cabeza MTP y draft head | 17,43 GiB | 21,13 GiB | ~18 % menor |
| Decodificacion, 1 usuario (tokens/s) | 180,9 | 128,0 | x1,41 |
| Decodificacion por usuario, 4 / 8 usuarios | 82,4 / 54,1 | 70,5 / 49,6 | x1,17 / x1,09 |
| Procesamiento de prompt, 2.048 tokens | ~3,4k | ~5,2k | x0,65 (mas lento) |

El autor advierte que "sin diferencia significativa" no equivale a igualdad: con estos tamanos de test solo se detectarian brechas de aproximadamente 2 puntos en GSM8K y 4 puntos en HumanEval+. La comparacion de MGSM se ejecuto en la ruta de motor propia del autor, no en vLLM estandar.

## Requisitos de hardware

- VRAM estimada: 16,09 GiB para los pesos del modelo de texto en GPU; 16,99 GiB con la cabeza MTP y el draft head en ingles y codigo; 17,43 GiB con el draft head disperso para todos los idiomas. A esto hay que sumar la cache KV (configurada con `--kv-cache-dtype fp8` en el ejemplo oficial).
- GPU recomendadas: NVIDIA DGX Spark (hardware de referencia de los benchmarks). No se han publicado mediciones en A100, H100 ni RTX 4090.
- GPU de consumo: no hay datos publicados sobre su viabilidad en RTX 4090 u otras consumer GPU; el peso de 16-17 GiB dejaria poco margen en tarjetas de 24 GB una vez descontada la cache KV, pero no se confirma en la informacion disponible.
- Opciones de despliegue: vLLM 0.28.0 con el plugin `tritq-qwen36` (imagen Docker `ghcr.io/ternii-ai/tritq-qwen36:0.2`); llama.cpp y Mac mediante la variante GGUF `Ternii/Qwen3.6-35B-A3B-TR2.25-G-GGUF`. Compatible con cualquier cliente OpenAI contra `http://localhost:8000/v1`.
- Latencia y throughput: 180,9 tokens/s en decodificacion con un usuario; 82,4 y 54,1 tokens/s por usuario con 4 y 8 usuarios; procesamiento de prompt de aproximadamente 3,4k tokens/s para prompts de 2.048 tokens. La parada por confianza cuesta alrededor de un 2 % por flujo en regimen de 4 a 8 usuarios.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | HumanEval+ | MMLU-Pro | Licencia | Formato |
|---|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-TR2.25-G | 10,23B reales (nombre 35B-A3B) | no disponible | 90,83 | 88,41 | 77,7 | Apache-2.0 | safetensors trit, GGUF |
| Qwen3.6-35B-A3B NVFP4 (NVIDIA) | mismo base | no disponible | 91,10 | 89,02 | 77,3 | Apache-2.0 | NVFP4 |
| Qwen3.6-35B-A3B (base, sin cuantizar) | 35B-A3B | no disponible | no disponible | no disponible | no disponible | Apache-2.0 | safetensors BF16 |

La comparacion directa disponible en la model card se limita al checkpoint NVFP4 de NVIDIA sobre el mismo modelo base. No se aportan datos frente a otros modelos de la misma categoria o tamano.

## Limitaciones y advertencias

- El procesamiento de prompt es un 35 % mas lento que NVFP4 (x0,65), lo que penaliza cargas con prompts largos o contextos extensos.
- El rendimiento en matematicas multilingues es significativamente inferior al de NVFP4 (81,9 frente a 84,2 en MGSM), con la mayor brecha en bengali; conviene restringir el uso matematico a ingles.
- La inferencia requiere un runtime no estandar (plugin `tritq-qwen36` sobre vLLM 0.28.0), lo que limita la portabilidad y anade dependencia de un unico mantenedor.
- El draft head y la parada por confianza no son neutrales en la salida: cambian el redondeo en coma flotante y pueden alterar el texto greedy en algunos prompts, segun admite el propio autor.
- La comparacion de BFCL v4 procede de un unico servidor TR frente a datos NVFP4 agrupados de varias sesiones en dias distintos, por lo que la ventaja declarada debe tomarse con cautela.
- El repositorio no incluye el encoder de vision; las tareas multimodales no estan cubiertas por esta version.
- Los metadatos declaran solo ingles como idioma soportado, aunque el modelo base sea multilingue; el rendimiento fuera del ingles no esta documentado salvo en MGSM.
- Riesgo de alucinacion y sesgos: no se documentan evaluaciones de sesgo ni de tasas de alucinacion en la informacion disponible.
- Licencia Apache-2.0, sin restricciones conocidas para uso comercial; al derivar del modelo base Qwen, se mantienen las condiciones de este.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, y fue creado el 1 de noviembre de 2026; se trata de una publicacion muy reciente y sin validacion independiente de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ternii/Qwen3.6-35B-A3B-TR2.25-G
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Variante GGUF: https://huggingface.co/Ternii/Qwen3.6-35B-A3B-TR2.25-G-GGUF
- Runtime y plugin vLLM: https://github.com/ternii-ai/tritq-vllm
- Checkpoint NVFP4 de NVIDIA (comparativa): `nvidia/Qwen3.6-35B-A3B-NVFP4` en HuggingFace
- Imagen Docker: `ghcr.io/ternii-ai/tritq-qwen36:0.2`
