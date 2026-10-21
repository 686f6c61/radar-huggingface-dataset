# xiongpeng/RLCR-Calibrated-Qwen3-8B-DAPO-Math14k-3Epoch-330Step

## Resumen

`RLCR-Calibrated-Qwen3-8B-DAPO-Math14k-3Epoch-330Step` es un ajuste fino del modelo denso Qwen3-8B publicado por el usuario xiongpeng (cuenta individual, sin organización detrás) en HuggingFace. El checkpoint tiene 8.190.735.360 parámetros en formato safetensors (unos 16,4 GB, lo que corresponde a pesos en bf16) y se distribuye bajo licencia MIT. El nombre del repositorio describe el proceso de entrenamiento: un ajuste con RL (los acrónimos RLCR y DAPO apuntan a optimización de política con recorte desacoplado y muestreo dinámico, la familia de algoritmos DAPO) sobre un conjunto de datos de matemáticas de unas 14 000 muestras, durante 3 épocas y 330 pasos de optimización.

El interés del modelo es acotado y hay que leerlo con cautela: la model card publicada no contiene más que la línea de licencia, no hay pipeline declarado, no hay etiquetas de idioma, cero descargas y cero likes. Es decir, se trata de un experimento de investigación reproducible en el tiempo (creado y actualizado en octubre de 2026, con 12 minutos de diferencia entre ambos eventos) más que de un modelo listo para producción. Su relevancia potencial está en servir de referencia para quien quiera estudiar recetas de RL sobre modelos de 8B orientadas a razonamiento matemático.

Por tanto, esta ficha distingue de forma explícita entre los datos verificados en el repositorio (parámetros, tamaño, licencia, formato) y los datos heredados del modelo base Qwen3-8B o inferidos del nombre del checkpoint, que se marcan como no confirmados. No se han publicado resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, heredada del modelo base Qwen3-8B (no confirmada en la model card) |
| Parámetros totales | 8.190.735.360 (~8,19 mil millones, dato real de los safetensors) |
| Parámetros activos | No aplica: el modelo es denso, no MoE |
| Longitud de contexto | No disponible en la información proporcionada; el modelo base Qwen3-8B declara 32 768 tokens nativos, ampliables a 131 072 con YaRN |
| Tipos de cuantización | No se publican cuantizaciones en el repositorio (solo safetensors en bf16); la conversión a GGUF, AWQ o GPTQ de 8 y 4 bits es técnicamente viable |
| Idiomas soportados | No disponible: el repositorio no incluye etiqueta de idioma; el modelo base es multilingüe |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16), ~16,4 GB de repositorio |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3-8B original: un transformer decoder-only denso con atención de tipo grouped-query, normalización RMSNorm y activaciones SwiGLU, sin mezcla de expertos. El repositorio no incluye configuración ni código de entrenamiento, pero el tamaño de los pesos (8,19B en bf16) coincide con el checkpoint base, lo que descarta fusiones, pruning o expansión de capas. Se desconoce si se modificó el vocabulario o el tokenizador.

El nombre del checkpoint documenta la receta: RLCR (probablemente una variante de RL con calibración de recompensas, sin detallar en la información disponible), el algoritmo DAPO como optimizador de política, un dataset de matemáticas de 14 000 ejemplos (Math14k), 3 épocas y 330 pasos de entrenamiento. DAPO es una variante de GRPO que introduce recorte desacoplado del ratio de importancia y muestreo dinámico para descartar prompts con varianza de recompensa nula. No hay información sobre composición del dataset, uso de RLHF/DPO previo, hiperparámetros, tamaño de lote ni si se aplicó una fase SFT antes del RL. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Razonamiento matemático y aritmético: es el eje declarado del ajuste (dataset Math14k), orientado a problemas de competición y demostraciones paso a paso.
- Generación de texto y razonamiento general: heredados del modelo base Qwen3-8B, no verificados tras el ajuste.
- Modo "thinking": el modelo base Qwen3 soporta cadenas de razonamiento explícitas antes de la respuesta final; se desconoce si este checkpoint las preserva intactas.
- Generación de código y tareas de instrucciones: capacidad heredada del base, sin datos de evaluación específicos en el repositorio.
- Tool calling / function calling: soportado en el modelo base Qwen3; no confirmado en este checkpoint.
- Capacidades de agente y razonamiento multi-paso: no documentadas en la información proporcionada.
- Multilingüismo: no documentado; el repositorio carece de etiqueta de idioma.
- Visión o audio: no soportados (el identificador y el tamaño corresponden a un modelo solo de texto).

## Casos de uso

- Investigación en RL para matemáticas: usar el checkpoint como punto de partida o como referencia para reproducir una receta DAPO con 330 pasos sobre 14k problemas, comparando curvas de recompensa frente al Qwen3-8B sin ajustar.
- Evaluación de olvido catastrófico: medir cuánto se degradan las capacidades generales del modelo base (código, instrucciones, multilingüismo) tras un ajuste de RL intensivo en un único dominio.
- Generación de soluciones paso a paso en entornos educativos: el modelo puede producir demostraciones razonadas de problemas de nivel secundaria y universitario, siempre con verificación automática de la respuesta final mediante un comprobador simbólico.
- Destilación de datos sintéticos matemáticos: generar cadenas de razonamiento para filtrar y construir nuevos datasets de entrenamiento, aprovechando su especialización y su licencia MIT, que no impone restricciones de uso comercial.
- Baseline en pipelines de evaluación interna: incorporarlo como referencia de "8B ajustado con RL" frente a modelos Math dedicados en suites como MATH-500 o AIME, ya que su tamaño permite ejecutarlo en una sola GPU.
- Prototipado de tutores de matemáticas autoalojados: al caber en una GPU de 24 GB en 4 bits, es viable desplegar una demo privada en local para experimentar con prompts y formatos de respuesta antes de invertir en un modelo mayor.
- Estudio de estabilidad de checkpoints: comparar los 330 pasos de entrenamiento con el base para analizar deriva de estilo, verbosidad y fiabilidad de las respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El repositorio no incluye tablas de MMLU, MATH, GSM8K, HumanEval ni AIME, ni curvas de entrenamiento, ni comparaciones con el modelo base. Cualquier cifra que se atribuya a este checkpoint debe considerarse no verificada.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: ~17-20 GB solo para pesos y estados de activación mínimos; con contexto largo, el KV cache añade varios GB adicionales.
- VRAM estimada en cuantización de 8 bits: ~9-10 GB de pesos.
- VRAM estimada en cuantización de 4 bits: ~5-6 GB de pesos, con margen para contexto moderado en tarjetas de 12-16 GB.
- GPU profesionales: una A100 40 GB, H100 o L40S permite bf16 con contexto amplio y buen throughput; una A100 80 GB permite lotes mayores.
- GPU de consumo: cabe en una RTX 4090 (24 GB) en bf16 con contexto moderado y en 4 bits en una RTX 4080/4070 Ti Super (16 GB); en 4 bits también es viable en GPUs de 12 GB con contexto recortado.
- Opciones de despliegue: al publicarse solo safetensors, requiere conversión previa para llama.cpp/Ollama (GGUF) o el uso directo de vLLM, TGI o SGLang con los pesos originales. No hay cuantizaciones oficiales en el repositorio.
- Latencia y throughput: no disponibles. Como referencia de orden de magnitud para 8B denso en bf16, una A100 ronda decenas de tokens por segundo por petición con vLLM, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Rendimiento |
|---|---|---|---|---|---|
| RLCR-Calibrated-Qwen3-8B-DAPO-Math14k | 8,19B | No disponible (base: 32k, 131k con YaRN) | RL DAPO sobre matemáticas | MIT | Sin datos publicados |
| Qwen3-8B (base) | 8,19B | 32 768 tokens nativos, 131 072 con YaRN | Modelo generalista con modo thinking | Apache 2.0 | Benchmarks publicados por el autor del base |
| DeepSeek-R1-Distill-Qwen-7B | ~7,6B | 131 072 tokens | Destilación de razonamiento sobre Qwen2.5 | MIT | Benchmarks publicados por DeepSeek |
| Qwen2.5-Math-7B | ~7,6B | 4 096 tokens | Especializado en matemáticas, con variante instruct | Apache 2.0 | Benchmarks publicados por Qwen |

La comparación de rendimiento directo no es posible: este checkpoint no publica métricas. Frente a las alternativas, su ventaja es la licencia MIT combinada con linaje Qwen3; su desventaja es la ausencia total de documentación, cuantizaciones y evaluaciones, además de un contexto no declarado y muy probablemente inferior en la práctica a los 131k de las variantes destiladas de R1.

## Limitaciones y advertencias

- Ausencia de model card: no hay descripción de uso previsto, datos de entrenamiento ni evaluación. No es un modelo apto para producción sin una validación propia exhaustiva.
- Riesgo de alucinación elevado en matemáticas: los ajustes con RL sobre problemas con respuesta verificable pueden producir cadenas de razonamiento plausibles con resultados incorrectos, especialmente fuera de la distribución del dataset Math14k.
- Olvido catastrófico probable: 330 pasos de RL centrados en matemáticas pueden degradar instrucciones generales, código y multilingüismo respecto al Qwen3-8B original; no hay datos que lo cuantifiquen.
- Sesgos: no documentados. Al no publicarse la composición del dataset Math14k, se desconoce su cobertura geográfica, lingüística y temática.
- Idioma: el repositorio no declara idiomas soportados; el comportamiento en castellano no está verificado y podría estar degradado respecto al base.
- Contexto: no se especifica la longitud de contexto efectiva tras el ajuste; asumir 32k o 131k sin comprobarlo puede provocar fallos silenciosos.
- Licencia MIT: permisiva y compatible con uso comercial, pero el usuario asume toda la responsabilidad sobre el cumplimiento de las condiciones del modelo base Qwen3 (Apache 2.0) y sobre la procedencia de los datos de entrenamiento, que no se detalla.
- Reproducibilidad: no se incluyen scripts, configuración de entrenamiento ni semillas; el nombre del checkpoint es la única documentación del proceso.
- Señales de escasa validación comunitaria: cero descargas y cero likes en el momento de la consulta; no hay issues ni discusiones que permitan contrastar experiencia de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xiongpeng/RLCR-Calibrated-Qwen3-8B-DAPO-Math14k-3Epoch-330Step
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Paper de DAPO (algoritmo citado en el nombre del checkpoint): https://arxiv.org/abs/2503.14476
- Repositorio de referencia de DAPO: https://github.com/volcengine/verl
- Paper técnico de Qwen3: https://arxiv.org/abs/2505.09388
