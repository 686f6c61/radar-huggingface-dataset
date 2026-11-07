# wirybeaver/Ming-3.0-asr-tiny-dspark

## Resumen

Ming-3.0-asr-tiny-dspark es un checkpoint de borrador (draft) para decodificación especulativa del modelo ASR `inclusionAI/Ming-3.0-asr-tiny`, publicado por el usuario `wirybeaver`. No es un modelo de reconocimiento de voz autónomo: es un artefacto de entrenamiento que predice tokens candidatos que el verificador Ming (congelado) valida después. El objetivo es acelerar la inferencia del verificador mediante decodificación especulativa, reduciendo el coste por token generado en transcripción de audio.

El borrador emplea la arquitectura DSpark, un decoder de 5 capas con hidden size 1.536, cabezal Markov de rango 256 y cabezal de confianza, entrenado mediante destilación offline del verificador Ming congelado. El modelo tiene 291.632.513 parámetros en BF16 y se distribuye en formato safetensors con código personalizado, requiriendo la librería Speculators y soporte específico en vLLM para el resolvedor de nombres de embeddings de Ming.

Es relevante ahora porque la decodificación especulativa se ha consolidado como técnica estándar para reducir latencia en modelos grandes, y este checkpoint ilustra el patrón de publicar borradores especializados para verificadores concretos. No obstante, el autor advierte explícitamente de que no se han medido la longitud de aceptación en servicio, el throughput, la latencia ni el WER, por lo que se trata de un artefacto de investigación y no de un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DSpark (decoder de 5 capas para decodificación especulativa) |
| Parametros totales | 291.632.513 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | en, zh, ja (el japonés con reservas, ver limitaciones) |
| Licencia | MIT |
| Formato de pesos | safetensors, con código personalizado (custom_code) |

## Arquitectura y entrenamiento

El borrador es un decoder DSpark de 5 capas con hidden size 1.536 e intermediate size 4.608. Incorpora un cabezal Markov de rango 256 y un cabezal de confianza (confidence head) activado. El vocabulario de entrada es de 157.184 tokens (el del verificador Ming), mientras que el vocabulario de salida del borrador se reduce a 48.000 tokens mediante mapeos d2t/t2d construidos exclusivamente a partir de las etiquetas del profesor en el conjunto de entrenamiento. El tamaño de bloque es de 8 tokens predichos más el token bonus del verificador en la EAL offline. Los pesos se publican en BF16.

El entrenamiento usó destilación offline con el verificador Ming congelado, en una única etapa de audio corto de 10 épocas (sin continuación para audio largo), con una duración aproximada de 4 horas y 48 minutos sobre dos GPU H200. Los datos proceden de LibriSpeech train-clean-360, People's Speech clean, VoxPopuli English, AISHELL-1 y FLEURS (inglés, chino y japonés), totalizando 357.005 clips y 999,71 horas de audio; validación con 2.576 clips. Se excluyeron Emilia-YODAS y Common Voice 17. Las etiquetas del profesor se generaron con vLLM nativo en BF16 y decodificación greedy, batch 128 por GPU, y se descartaron 181 clips con generaciones sin parada. La función de pérdida combina divergencia KL respecto a la distribución del profesor sobre el vocabulario reducido y un término BCE del cabezal de confianza (peso 1,0), con ponderación exp(-k/4) por posición de predicción. Se usó DDP de dos rangos con precisión mixta BF16, presupuesto de 16.384 tokens empaquetados, hasta 3.072 anclas por rango, Muon para parámetros matriciales elegibles y AdamW para el resto, con learning rate inicial 3e-4. El export publicado es la época 6, seleccionada por la menor pérdida de validación agregada tras completar las 10 épocas.

## Capacidades

- Predicción de tokens candidatos para decodificación especulativa sobre el verificador `inclusionAI/Ming-3.0-asr-tiny`.
- Generación de bloques de hasta 8 tokens predichos más el token bonus del verificador en la EAL offline.
- Estimación de confianza por token mediante cabezal de confianza dedicado.
- Soporte de vocabulario reducido (48.000 tokens) mapeado al vocabulario de entrada del verificador (157.184 tokens).
- No realiza reconocimiento de voz por sí mismo: depende del verificador Ming y de su tokenizer y procesador de audio.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso de forma nativa; su función es exclusivamente la aceleración de inferencia.
- Idiomas: inglés y chino según el verificador; japonés presente en el entrenamiento pero sin calidad establecida.

## Casos de uso

- Aceleración de transcripción ASR en producción: el borrador se empareja con el verificador Ming congelado para reducir el número de pasos de decodificación por token aceptado, disminuyendo la latencia en pipelines de transcripción de audio corto (hasta 30 segundos por clip).
- Servicio de subtitulado en inglés y chino: integrado en vLLM con Speculators, permite servir transcripciones con menor coste por token generado en comparación con la decodificación greedy del verificador.
- Investigación en decodificación especulativa: sirve como caso de estudio reproducible de destilación offline de un borrador DSpark sobre un verificador ASR multimodal, con configuración, comando de entrenamiento e historial de validación publicados.
- Evaluación de EAL offline: permite medir la longitud de aceptación esperada (6,02 tokens con bonus en la validación offline) y comparar estrategias de borrador sobre el mismo verificador.
- Prototipado de ASR con contexto: al heredar el tokenizer y procesador de audio de Ming, puede usarse en experimentos de reconocimiento con hotwords o diálogo previo, siempre que el verificador aporte esa capacidad.
- Benchmarking interno de infraestructura: útil para comparar throughput y latencia de configuraciones vLLM con y sin borrador especulativo en clústeres con GPU H200 o equivalentes.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---:|
| Pérdida total de validación | 0,409284 |
| EAL offline greedy (incluye un token bonus del verificador) | 6,023555 |
| Longitud de aceptación analítica (incluye un token bonus) | 5,615419 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, WER) en la información disponible. El autor indica explícitamente que la longitud de aceptación en servicio, el throughput, la latencia y el WER no se han medido.

## Requisitos de hardware

- El borrador tiene 291,6 M de parámetros en BF16, lo que supone aproximadamente 0,58 GB de pesos; el repositorio completo ocupa 0,6 GB.
- El borrador por sí solo cabe holgadamente en cualquier GPU consumer (RTX 3060 12 GB, RTX 4090, etc.), pero el requisito real lo impone el verificador Ming, que debe residir en memoria junto al borrador.
- Entrenamiento realizado sobre dos GPU H200; no se documenta el hardware mínimo de inferencia.
- Despliegue previsto mediante vLLM con soporte de Speculators y del resolvedor de nombres de embeddings de Ming; no se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles (no medidos por el autor).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wirybeaver/Ming-3.0-asr-tiny-dspark | 291,6 M | no disponible | Borrador especulativo para Ming-3.0-asr-tiny | MIT | Hugging Face |
| inclusionAI/Ming-3.0-asr-tiny | no disponible | no disponible | ASR (verificador) chino/inglés con dialectos y Context ASR | no disponible | Hugging Face, GitHub |
| Otros borradores DSpark para verificadores ASR | no disponible | no disponible | Decodificación especulativa | no disponible | no disponible |

No se dispone de datos suficientes para comparar rendimiento con alternativas equivalentes; el autor no publica métricas de servicio ni WER.

## Limitaciones y advertencias

- El checkpoint es un artefacto de entrenamiento: no se han medido aceptación en servicio, throughput, latencia ni WER.
- Requiere el verificador `inclusionAI/Ming-3.0-asr-tiny` fijado a la revisión `ac95e7b1678c08ea6f4a2581a051e432ed63e9b7`; no es un modelo autónomo.
- Requiere Speculators con soporte del resolvedor de nombres de embeddings de Ming y código personalizado; no funciona con stacks estándar sin parches.
- Solo se entrenó una etapa de audio corto (clips de hasta 30 segundos); no hay continuación para audio largo.
- El subconjunto japonés es muy pequeño (2.150 clips, 6,84 horas) y el autor advierte que no establece calidad de reconocimiento en japonés.
- La cobertura de vocabulario de entrenamiento es del 99,871% en inglés, 98,227% en chino y 98,270% en japonés; los tokens fuera de cobertura no pueden predecirse con el vocabulario reducido.
- Las métricas offline usan contextos condicionados por el profesor en caché y el vocabulario reducido; la paridad con la salida ASR real requiere validación separada.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al heredar el comportamiento del verificador Ming, cualquier sesgo de este se traslada.
- Licencia MIT para los pesos del borrador, pero el uso comercial debe verificar también la licencia del verificador Ming subyacente.
- No se incluyen scripts de entrenamiento, overlays de runtime ni parches en el repositorio; se mantienen por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wirybeaver/Ming-3.0-asr-tiny-dspark
- Modelo base (verificador): https://huggingface.co/inclusionAI/Ming-3.0-asr-tiny
- Repositorio GitHub de Ming-3.0-asr: https://github.com/inclusionAI/Ming-3.0-asr
- Speculators: https://github.com/vllm-project/speculators
- vLLM: https://github.com/vllm-project/vllm
