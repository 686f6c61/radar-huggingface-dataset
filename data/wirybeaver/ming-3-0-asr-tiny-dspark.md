# wirybeaver/Ming-3.0-asr-tiny-dspark

## Resumen

Ming-3.0-ASR-tiny DSpark es un modelo borrador (*draft*) de decodificacion especulativa disenado para acelerar la inferencia del verificador `inclusionAI/Ming-3.0-asr-tiny`, un modelo de reconocimiento automatico del habla (ASR). Lo desarrolla el usuario `wirybeaver` y se publica bajo la libreria `speculators`, con pesos en formato safetensors y BF16. No es un modelo ASR autonomo: es un componente auxiliar que predice varios tokens por paso para que el verificador los valide en paralelo, reduciendo el coste por token generado.

El modelo resuelve un problema concreto de eficiencia en produccion: la decodificacion autoregresiva de un verificador ASR es secuencial y costosa, y un borrador bien alineado permite aceptar bloques de tokens en cada verificacion. Segun la model card, en modo de servicio no determinista sobre una H200 (BF16, TP1) y evaluado en SeedTTS, se midieron ganancias de throughput del +27,18 % a concurrencia 1, +24,06 % a concurrencia 8 y +20,04 % a concurrencia 16, con una longitud de aceptacion (AL) en torno a 6,44-6,46 tokens por verificacion.

Tecnicamente es un decoder DSpark de cinco capas con hidden size 1.536, intermediate size 4.608, cabeza Markov de rango 256 y cabeza de confianza, entrenado por destilacion offline del verificador congelado. El checkpoint publicado tiene 291.632.513 parametros y ocupa 0,6 GB en el repositorio. Esta pensado para ingles, chino y japones, aunque el propio autor advierte que el subconjunto japones de entrenamiento es demasiado pequeno para establecer calidad de reconocimiento en ese idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DSpark draft decoder (5 capas), con cabeza Markov de rango 256 y cabeza de confianza; verifica contra `inclusionAI/Ming-3.0-asr-tiny` |
| Parametros totales | 291.632.513 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (precision de pesos declarada); no se documentan otras cuantizaciones |
| Idiomas soportados | en, zh, ja (el japones con subconjunto de entrenamiento minimo) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Hidden size / intermediate size | 1.536 / 4.608 |
| Vocabulario de entrada / salida del draft | 157.184 / 48.000 |
| Block size | 8 tokens predichos, mas el token bonus del verificador en EAL offline |
| Fronteras de capas auxiliares objetivo | 2, 7, 14, 18, 21 |
| Libreria | speculators |
| Modelo base | inclusionAI/Ming-3.0-asr-tiny (revision `ac95e7b1678c08ea6f4a2581a051e432ed63e9b7`) |
| Tamano del repo | 0,6 GB |

## Arquitectura y entrenamiento

El borrador es un decoder DSpark de cinco capas con hidden size 1.536 e intermediate size 4.608, equipado con una cabeza Markov de rango 256 y una cabeza de confianza. Captura estados auxiliares del verificador congelado en las fronteras de capa 2, 7, 14, 18 y 21, ademas de los estados finales pre-norm usados para reconstruir los logits del profesor. El vocabulario de entrada del verificador se mantiene en 157.184 tokens, mientras que el vocabulario de salida del borrador se reduce a 48.000 tokens mediante mapeos d2t/t2d congelados antes del entrenamiento formal. Los embeddings de entrada y las proyecciones de vocabulario conservan los pesos congelados del verificador.

El entrenamiento se realizo por destilacion offline con el verificador Ming congelado. Los datos se prepararon a partir de clips mono de 16 kHz de hasta 30 segundos de LibriSpeech train-clean-360, People's Speech clean, VoxPopuli English, AISHELL-1 y FLEURS en ingles, chino y japones; se excluyeron Emilia-YODAS y Common Voice 17. El conjunto final tiene 357.005 clips y 999,71 horas de audio, con 2.576 clips de validacion y 181 clips excluidos por generaciones sin parada. Las etiquetas del profesor se generaron con vLLM nativo en BF16 y decodificacion greedy, con batch 128 por GPU.

La fase de entrenamiento uso dos GPUs H200 en DDP de dos rangos, precision mixta BF16, presupuesto de 16.384 tokens empaquetados y hasta 3.072 anclas por rango, con ocho predicciones por bloque. Se uso Muon para parametros matriciales elegibles y AdamW para el resto, con learning rate inicial 3e-4. La funcion de perdida combina divergencia KL respecto a la distribucion del profesor sobre el vocabulario reducido con un termino BCE de la cabeza de confianza (peso 1.0), y pondera la posicion k con exp(-k/4). Se completo una etapa de audio corto de 10 epocas (sin continuacion de audio largo) en aproximadamente 4 horas 48 minutos; el checkpoint publicado es la epoca 6, seleccionada por menor perdida de validacion agregada. La cobertura del vocabulario de etiquetas de entrenamiento fue del 99,871 % en ingles, 98,227 % en chino y 98,270 % en japones.

## Capacidades

- Prediccion especulativa de tokens para el verificador ASR `inclusionAI/Ming-3.0-asr-tiny`, con bloques de 8 tokens predichos por paso.
- Decodificacion especulativa con cabeza de confianza para estimar la aceptacion de cada prediccion.
- Modelado Markoviano de dependencias entre tokens predichos mediante cabeza de rango 256.
- Uso de estados auxiliares del verificador en multiples fronteras de capa (2, 7, 14, 18, 21) para alinear las predicciones.
- Soporte de vocabulario reducido (48.000 tokens) con mapeo al vocabulario de entrada del verificador (157.184 tokens).
- Cobertura linguistica de ingles, chino y japones, con limitaciones declaradas en japones.
- Integracion con Speculators y vLLM; requiere el tokenizer y el procesador de audio del verificador.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es exclusivamente un borrador de decodificacion para ASR.

## Casos de uso

- Servicio de transcripcion ASR de alta concurrencia: desplegar el borrador junto al verificador Ming en SGLang-Omni para aumentar el throughput entre un 20 % y un 27 % segun concurrencia, manteniendo la precision del verificador gracias a la validacion token a token.
- Reduccion de latencia en transcripcion en tiempo real: con una longitud de aceptacion cercana a 6,4 tokens por verificacion, el coste por token generado baja y se reducen los tiempos de respuesta en flujos de audio corto (hasta 30 segundos por clip).
- Procesamiento por lotes de audio en ingles: usar el borrador en pipelines de transcripcion masiva (por ejemplo, actas, subtitulos o notas de reunion) donde el ahorro de computo por token se traduce en menor coste por hora de audio.
- Transcripcion de audio en chino: el conjunto de entrenamiento incluye 123.340 clips y 160,54 horas en chino con cobertura de vocabulario del 98,227 %, lo que permite acelerar cargas de trabajo ASR en mandarin junto al verificador.
- Optimizacion de infraestructura existente: si ya se sirve Ming-3.0-asr-tiny en vLLM o SGLang-Omni, anadir este borrador mejora el throughput sin cambiar el modelo verificado ni la salida final.
- Evaluacion e investigacion en decodificacion especulativa: el checkpoint, con metricas offline de EAL (6,023555 greedy y 5,615419 analitica) y perdida de validacion (0,409284), sirve como referencia reproducible para estudiar tecnicas DSpark sobre modelos de audio.
- Pruebas de calidad en japones con cautela: el subconjunto japones (2.150 clips, 6,84 horas) permite experimentar, pero el autor no establece calidad de reconocimiento en ese idioma, por lo que no es adecuado para produccion en japones sin validacion adicional.

## Benchmarks y rendimiento

Validacion offline del export publicado (contextos condicionados por el profesor en cache y vocabulario reducido del borrador):

| Metrica | Valor |
|---|---:|
| Perdida total de validacion | 0,409284 |
| EAL offline greedy (incluye un token bonus del verificador) | 6,023555 |
| Longitud de aceptacion analitica (incluye un token bonus) | 5,615419 |

Servicio online, ASR en ingles en modo normal (no determinista) sobre una H200 (BF16, TP1), evaluado en SeedTTS:

| Concurrencia | Ganancia de throughput | AL (tokens/verificacion) |
|---|---:|---:|
| c1 | +27,18 % | 6,4481 |
| c8 | +24,06 % | 6,4378 |
| c16 | +20,04 % | 6,4563 |

No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval o GSM8K, que no aplican a un modelo de este tipo. Los resultados completos de precision, modo determinista y ASR en chino estan en el PR de SGLang-Omni #3660.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el checkpoint pesa 0,6 GB en BF16, por lo que el borrador en si ocupa muy poca memoria y el grueso del consumo corresponde al verificador Ming-3.0-asr-tiny.
- GPU recomendadas: el entrenamiento se realizo en dos H200; la evaluacion online se hizo en una sola H200 (BF16, TP1).
- GPU de consumo: no hay datos publicados sobre ejecucion en RTX 4090 u otras GPU consumer; el requisito real dependera del verificador y del backend de servicio.
- Opciones de despliegue: SGLang-Omni (usado en la evaluacion online), vLLM y Speculators; requiere soporte del resolvedor de nombres de embedding de Ming en Speculators.
- Latencia y throughput: ganancias de throughput del +27,18 % (c1), +24,06 % (c8) y +20,04 % (c16) en ingles sobre H200; no se publican cifras absolutas de latencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| wirybeaver/Ming-3.0-asr-tiny-dspark | Borrador especulativo DSpark para ASR | 291.632.513 | no disponible | +20-27 % throughput; AL ~6,4 en H200 | MIT | Hugging Face |
| inclusionAI/Ming-3.0-asr-tiny | Verificador ASR (modelo base) | no disponible | no disponible | Referencia de precision del sistema | no disponible en la informacion | Hugging Face |
| Otros borradores DSpark | Borradores especulativos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de otros borradores especulativos comparables con los que contrastar parametros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo ASR autonomo: requiere el verificador `inclusionAI/Ming-3.0-asr-tiny` en la revision `ac95e7b1678c08ea6f4a2581a051e432ed63e9b7` y su tokenizer y procesador de audio.
- La calidad en japones no esta establecida: solo 2.150 clips y 6,84 horas de entrenamiento en ese idioma.
- Solo se entreno una etapa de audio corto (clips de hasta 30 segundos) durante 10 epocas; no hubo etapa de continuacion para audio largo.
- El checkpoint publicado es la epoca 6 de 10, seleccionada por perdida de validacion agregada, no necesariamente la de mejor EAL.
- Las metricas offline usan contextos condicionados por el profesor en cache y el vocabulario reducido, por lo que no son directamente comparables con las metricas de servicio online.
- Los resultados de servicio online publicados en la ficha corresponden a ASR en ingles en modo no determinista; los datos de modo determinista y chino estan solo en el PR externo.
- Riesgo de sesgos y alucinaciones: no documentado en la informacion disponible; al ser un borrador validado por el verificador, la salida final depende de este ultimo.
- Requiere soporte especifico en Speculators para el resolvedor de nombres de embedding de Ming; sin esa integracion el borrador no funciona.
- La licencia MIT permite uso comercial, pero el uso en produccion debe validarse contra el verificador y el backend de servicio elegidos.
- El repositorio tiene muy poca traccion (0 likes, 162 descargas) y fue creado en noviembre de 2026; no hay historial de mantenimiento a largo plazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wirybeaver/Ming-3.0-asr-tiny-dspark
- Modelo base (verificador): https://huggingface.co/inclusionAI/Ming-3.0-asr-tiny
- Evaluacion de servicio online (SGLang-Omni PR #3660): https://github.com/sgl-project/sglang-omni/pull/3660
- Speculators: https://github.com/vllm-project/speculators
- vLLM: https://github.com/vllm-project/vllm
