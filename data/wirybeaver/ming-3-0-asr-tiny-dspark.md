# wirybeaver/Ming-3.0-asr-tiny-dspark

## Resumen

Ming-3.0-asr-tiny-dspark es un modelo borrador (draft) de decodificación especulativa, no un modelo de reconocimiento de voz autónomo. Lo publica el usuario wirybeaver sobre el verificador congelado `inclusionAI/Ming-3.0-asr-tiny`, y su función es acelerar la inferencia del modelo ASR de referencia prediciendo varios tokens por paso para que el verificador los valide en bloque. Emplea la técnica DSpark, una variante de decodificación especulativa con cabeza de confianza y dependencias de Markov, implementada en la librería Speculators y servida mediante SGLang-Omni.

El modelo tiene 291.632.513 parámetros en BF16 (unos 0,6 GB de pesos en safetensors) y consta de un decodificador de cinco capas con tamaño oculto de 1.536 y tamaño intermedio de 4.608. Trabaja con el tokenizador y el procesador de audio del verificador Ming, cuya entrada mantiene un vocabulario de 157.184 tokens, mientras que el borrador usa un vocabulario de salida reducido de 48.000 tokens construido a partir de las etiquetas del profesor.

Su relevancia es práctica: en la evaluación de servicio en línea sobre una H200 en BF16 con TP1, el borrador aporta una mejora de throughput del +27,18 % con concurrencia 1 y una longitud de aceptación de 6,4481 tokens por verificación en inglés. Está pensado para despliegues de ASR en producción donde el coste por token verificado importa, no para uso directo como transcriptor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador DSpark de 5 capas (decodificación especulativa) sobre verificador Ming-3.0-asr-tiny congelado; cabeza de Markov de rango 256 y cabeza de confianza |
| Parametros totales | 291.632.513 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento usa paquetes de 16.384 tokens de entrada, no implica contexto de 16K por audio) |
| Tipos de cuantizacion | BF16 (precisión de los pesos publicados); no se documentan otras cuantizaciones |
| Idiomas soportados | en, zh, ja (el subconjunto japonés es muy pequeño y no establece calidad de reconocimiento) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería speculators, custom_code) |

## Arquitectura y entrenamiento

El borrador es un decodificador de cinco capas con tamaño oculto de 1.536 e intermedio de 4.608, equipado con una cabeza de Markov de rango 256 y una cabeza de confianza. Se entrena por destilación offline del profesor: el verificador Ming permanece congelado y genera las etiquetas con decodificación greedy en vLLM nativo en BF16, con lote de 128 por GPU. Durante la recolección se capturan estados auxiliares en los límites de capa del objetivo 2, 7, 14, 18 y 21, además de los estados finales pre-norm usados para reconstruir los logits del profesor. El vocabulario del borrador se congela antes del entrenamiento formal contando solo tokens de las etiquetas de entrenamiento, y se construyen mapeos d2t/t2d de 48.000 tokens.

Los datos de entrenamiento son clips mono de 16 kHz de hasta 30 segundos procedentes de LibriSpeech train-clean-360, People's Speech clean, VoxPopuli inglés, AISHELL-1 y FLEURS inglés/chino/japonés; se excluyeron Emilia-YODAS y Common Voice 17. El conjunto final tiene 357.005 clips y 999,71 horas de audio (231.515 clips y 832,32 horas en inglés; 123.340 clips y 160,54 horas en chino; 2.150 clips y 6,84 horas en japonés), con 2.576 clips de validación. La cobertura del vocabulario de etiquetas de entrenamiento es del 99,871 % en inglés, 98,227 % en chino y 98,270 % en japonés.

El entrenamiento formal duró aproximadamente 4 horas y 48 minutos en dos GPU H200, con DDP de dos rangos, precisión mixta BF16, presupuesto de 16.384 tokens empaquetados y como máximo 3.072 anclas por rango, y ocho predicciones por bloque. Se usó Muon para los parámetros matriciales elegibles y AdamW para el resto, con tasa de aprendizaje inicial de 3e-4. La función de pérdida combina divergencia KL respecto a la distribución del profesor en el vocabulario reducido con un término BCE de la cabeza de confianza (peso 1,0), y la posición de predicción k recibe peso exp(-k/4). Se completaron 10 épocas y se publicó la época 6, seleccionada por la menor pérdida de validación agregada.

## Capacidades

- Predicción especulativa de tokens para el verificador `inclusionAI/Ming-3.0-asr-tiny` (revisión fijada `ac95e7b1678c08ea6f4a2581a051e432ed63e9b7`), con bloques de 8 tokens predichos más el token bonus del verificador.
- Aceleración de la decodificación del ASR de referencia: no transcribe por sí mismo, sino que propone candidatos que el verificador acepta o rechaza.
- Cabeza de confianza para estimar la fiabilidad de cada predicción dentro del prefijo aceptado.
- Dependencias de Markov de rango 256 para modelar la transición entre tokens predichos.
- Soporte de decodificación greedy del borrador (`--dspark-use-greedy-draft true`) y modo de verificación estático (`--ragged-verify-mode static`).
- Idiomas: inglés y chino documentados por el modelo Ming; el japonés cuenta solo con un subconjunto pequeño de entrenamiento y no acredita calidad de reconocimiento.
- No soporta tool calling, function calling, agentes, visión ni audio de forma autónoma: es un componente de aceleración de un pipeline ASR.

## Casos de uso

- Aceleración de ASR en producción: desplegar el verificador Ming con el borrador DSpark en SGLang-Omni para reducir el coste por token verificado; en la evaluación en línea con concurrencia 1 sobre H200 en BF16 se midió un +27,18 % de throughput y una longitud de aceptación de 6,4481 tokens por verificación.
- Transcripción por lotes de audio corto: el borrador está entrenado con clips de hasta 30 segundos y puede acompañar al verificador en pipelines de transcripción de llamadas, notas de voz o reuniones segmentadas.
- Servicio de subtitulado en inglés y chino: el modelo base documenta ASR en ambos idiomas, y el borrador conserva la cobertura de vocabulario del 99,871 % y 98,227 % respectivamente en sus etiquetas de entrenamiento.
- Despliegue con concurrencia moderada: la evaluación en línea incluye medidas con concurrencia 1 y 8, útil para dimensionar servicios con varias peticiones simultáneas.
- Reducción de latencia en entornos con GPU limitadas: al ser un borrador de 0,6 GB en BF16, el coste de memoria adicional sobre el verificador es reducido y permite mantener la aceleración sin duplicar el modelo principal.
- Integración en infraestructura vLLM/SGLang existente: el modelo se sirve con Speculators y SGLang-Omni, por lo que encaja en stacks ya basados en vLLM sin reescribir el pipeline de inferencia.
- Evaluación y ajuste de políticas de decodificación especulativa: sirve como referencia para comparar modos greedy frente a no deterministas y modos de verificación estáticos en experimentos de serving.

## Benchmarks y rendimiento

Validación offline del export publicado (contextos condicionados por el profesor en caché y vocabulario reducido del borrador):

| Metrica | Valor |
|---|---:|
| Pérdida de validación total | 0,409284 |
| EAL offline greedy, incluido un token bonus del verificador | 6,023555 |
| Longitud de aceptación analítica, incluido un token bonus del verificador | 5,615419 |

Evaluación de servicio en línea en inglés, modo normal (no determinista), una H200 (BF16, TP1), sobre SeedTTS:

| Concurrencia | Ganancia de throughput | Longitud de aceptación (tokens/verificación) |
|---|---:|---:|
| c1 | +27,18 % | 6,4481 |
| c8 | + (dato truncado en la model card) | No disponible |

La model card indica que el WER en inglés y el CER en chino se midieron en SGLang-Omni y remite a la pull request de evaluación en línea para resultados y limitaciones, pero los valores concretos no figuran en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos del borrador ocupan unos 0,6 GB en BF16; hay que sumar la memoria del verificador Ming-3.0-asr-tiny y las cachés KV del pipeline ASR.
- GPU recomendadas: la evaluación en línea se realizó en una NVIDIA H200 con BF16 y TP1; el entrenamiento usó dos H200.
- GPU de consumo: no se documenta compatibilidad con GPU de consumo ni cuantizaciones GGUF/INT4 que la permitan; el despliegue está atado a SGLang-Omni y Speculators.
- Opciones de despliegue: SGLang-Omni (`sgl-omni serve`) con `--thinker.engine.speculative_algorithm DSPARK` y `--thinker.engine.speculative_draft_model_path wirybeaver/Ming-3.0-asr-tiny-dspark`; la generación de etiquetas y la base se apoyan en vLLM nativo.
- Latencia y throughput: ganancia de throughput del +27,18 % con concurrencia 1 y longitud de aceptación de 6,4481 tokens por verificación en inglés sobre H200; no se publican cifras absolutas de latencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---:|---|---|---|
| wirybeaver/Ming-3.0-asr-tiny-dspark | Borrador de decodificación especulativa DSpark para Ming-3.0-asr-tiny | 291.632.513 | No disponible | MIT | Hugging Face, librería speculators |
| inclusionAI/Ming-3.0-asr-tiny | Modelo ASR verificador (base) | No disponible | No disponible | No disponible en la información proporcionada | Hugging Face |
| Borradores EAGLE/Medusa genéricos | Decodificación especulativa para LLM de texto | Variable | Depende del verificador | Variable | Repositorios de vLLM/Speculators |

No se dispone de datos de otros borradores DSpark comparables para ASR en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo ASR autónomo: requiere el verificador Ming-3.0-asr-tiny en la revisión fijada y no produce transcripciones por sí solo.
- El entrenamiento cubrió solo una etapa de audio corto (clips de hasta 30 segundos) durante 10 épocas; no hubo etapa de continuación para audio largo.
- El japonés cuenta con solo 2.150 clips y 6,84 horas de entrenamiento; la model card advierte explícitamente que no se establece calidad de reconocimiento en japonés.
- El vocabulario de salida reducido a 48.000 tokens puede limitar la cobertura en dominios alejados de las etiquetas del profesor; la cobertura en validación no influyó en su selección.
- Riesgo de alucinación y errores heredados: las etiquetas del profesor son las transcripciones del propio Ming, de modo que los sesgos y errores del verificador se propagan al borrador.
- Los resultados en línea publicados están medidos en inglés sobre SeedTTS con una H200; no hay datos de WER/CER ni de rendimiento en otros idiomas o hardware en la información disponible.
- La evaluación en línea con concurrencia 8 aparece truncada en la model card, por lo que no se puede verificar la ganancia en ese régimen.
- Requiere soporte del resolutor de nombres de embeddings de Ming en Speculators; sin esa versión, el borrador no carga.
- Licencia MIT: permite uso comercial, pero debe conservarse el aviso de copyright y no se ofrece garantía alguna.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wirybeaver/Ming-3.0-asr-tiny-dspark
- Modelo base: https://huggingface.co/inclusionAI/Ming-3.0-asr-tiny
- Evaluación de servicio en línea (SGLang-Omni PR 3660): https://github.com/sgl-project/sglang-omni/pull/3660
- Speculators: https://github.com/vllm-project/speculators
- vLLM: https://github.com/vllm-project/vllm
