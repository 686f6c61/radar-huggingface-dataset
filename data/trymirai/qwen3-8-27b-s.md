# trymirai/Qwen3.8-27B-S

## Resumen

Mirai's Qwen3.8-27B Small Quantization (identificador `trymirai/Qwen3.8-27B-S`) es una versión cuantizada del modelo base Qwen/Qwen3.8-27B, publicada por Mirai Labs bajo el usuario de Hugging Face `trymirai`. Su objetivo es reducir el coste de memoria y cómputo del modelo original para permitir inferencia local eficiente en Apple silicon, manteniendo una calidad lo más cercana posible al checkpoint de referencia. El checkpoint se distribuye en formato safetensors y emplea la librería propietaria `uzu` como motor de inferencia.

El modelo declara 8.682.731.728 parámetros reales según los tensores safetensors, un tamaño de repositorio de 86,0 GB y una licencia Apache 2.0 heredada del modelo base. Aunque el nombre comercial hace referencia a "27B", el recuento efectivo de parámetros del artefacto publicado es de aproximadamente 8,68 mil millones, dato que conviene tener en cuenta al planificar despliegues. La model card no detalla la longitud de contexto, los idiomas soportados ni los resultados de benchmarks.

La relevancia actual del checkpoint radica en su enfoque de cuantización agresiva (2 bits en embeddings y esquemas mixtos en el resto de matrices) combinada con destilación consciente de cuantización, una técnica que busca preservar el comportamiento del modelo original en tareas de agente y generación de texto. No obstante, la información pública disponible es escasa y el soporte de inferencia está limitado, según el autor, a Apple silicon.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.8-27B; detalles no disponibles) |
| Parámetros totales | 8.682.731.728 (según safetensors) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 2 bits (embeddings con código de retículo D4), 4 bits enteros (cabeza de salida, grupo 64), bits por matriz elegidos según KL medida |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `uzu`) |

## Arquitectura y entrenamiento

El checkpoint es una cuantización del modelo Qwen/Qwen3.8-27B. La model card no especifica la arquitectura interna del modelo base (número de capas, dimensiones, mecanismo de atención ni si emplea mezcla de expertos), por lo que estos datos deben consultarse en la model card original de Qwen. El artefacto publicado contiene 8.682.731.728 parámetros en safetensors, y el repositorio ocupa 86,0 GB.

El método de cuantización descrito por el autor combina cuantización con trellis coding de estilo QTIP, con el número de bits de cada matriz seleccionado a partir de la divergencia KL medida. Se aplican rotaciones aleatorias con estructura de Kronecker para reducir los valores atípicos de los pesos. La matriz de embeddings de entrada usa un código de retículo D4 de 2 bits, mientras que la cabeza de salida emplea enteros de 4 bits con tamaño de grupo 64 y transformadas de Hadamard por bloques de 32. El proceso incluye cuantización post-entrenamiento seguida de destilación consciente de cuantización, con una ronda adicional sobre turnos de agente generados por el propio modelo. No se detallan el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation`, orientado a producción de texto autoregresivo.
- Razonamiento y conversación multi-turno: hereda las capacidades del modelo base Qwen3.8-27B, aunque no se documentan evaluaciones específicas del checkpoint cuantizado.
- Uso en flujos de agente: la destilación incluyó una ronda sobre turnos de agente del propio modelo, lo que sugiere intención de preservar comportamiento agéntico.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible de forma explícita en la model card; depende del modelo base.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.
- Inferencia local en Apple silicon: soportada mediante el CLI `mirai` y la librería `uzu`.

## Casos de uso

- Inferencia local en Mac con Apple silicon: el caso de uso principal declarado por el autor. Se instala con `brew install mirai` y se ejecuta `mirai --model trymirai/Qwen3.8-27B-S`, aprovechando la cuantización de 2-4 bits para reducir la huella de memoria en equipos de sobremesa y portátiles Apple.
- Prototipado de asistentes conversacionales en estación de trabajo: al ejecutarse localmente sin dependencia de API, permite iterar sobre prompts y flujos multi-turno sin coste por token, siempre que se acepte la ausencia de benchmarks publicados.
- Evaluación de técnicas de cuantización: investigadores interesados en QTIP, trellis coding y destilación consciente de cuantización pueden usar el checkpoint como referencia práctica para comparar calidad frente al modelo original.
- Desarrollo de agentes con datos sensibles: al ser inferencia local y licencia Apache 2.0, encaja en entornos donde no se desea enviar datos a servicios en la nube, sujeto a las limitaciones de contexto e idioma no documentadas.
- Generación de texto asistida en herramientas de escritorio: integrable en aplicaciones macOS mediante la librería `uzu`, para tareas de redacción, resumen o reescritura con latencia local.
- Experimentación educativa: útil para estudiar el impacto de la cuantización agresiva en la calidad del texto generado, midiendo divergencia respecto al modelo base con conjuntos de evaluación propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una figura de divergencia KL frente al tamaño del checkpoint (`assets/kl-vs-size.svg`), pero no se proporcionan valores numéricos de MMLU, HumanEval, GSM8K ni de otras evaluaciones estándar.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 86,0 GB, aunque la cuantización de 2-4 bits sugiere una huella efectiva menor durante la inferencia; no se publica una cifra oficial de memoria en ejecución.
- Plataforma soportada: únicamente Apple silicon según el autor ("Currently only Apple silicon inference is supported").
- GPU recomendadas: no disponibles para CUDA; el soporte declarado es para chips Apple (M-series), sin modelos concretos especificados.
- ¿Cabe en GPU de consumo? No hay datos para GPU NVIDIA de consumo; para Apple silicon, el autor no detalla requisitos mínimos de memoria unificada.
- Opciones de despliegue: CLI `mirai` (Homebrew) y librería `uzu`; compilación desde fuente según la guía del repositorio `trymirai/uzu`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Plataforma |
|---|---|---|---|---|---|
| trymirai/Qwen3.8-27B-S | 8.682.731.728 (safetensors) | no disponible | 2-4 bits (QTIP, D4, Hadamard) | Apache 2.0 | Apple silicon (`uzu`) |
| Qwen/Qwen3.8-27B (base) | no disponible en la información | no disponible | pesos originales | Apache 2.0 | no disponible |
| Otras cuantizaciones de Qwen3.8-27B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado ni de alternativas equivalentes documentadas en la información proporcionada.

## Limitaciones y advertencias

- Información incompleta: la model card no documenta contexto, idiomas, benchmarks ni requisitos de memoria, lo que dificulta evaluar su idoneidad en producción.
- Discrepancia de nomenclatura: el nombre "27B" no coincide con los 8.682.731.728 parámetros reales del checkpoint safetensors; conviene verificar el artefacto antes de desplegarlo.
- Plataforma restringida: solo se declara soporte para Apple silicon; no hay soporte documentado para CUDA, ROCm ni CPU genérica.
- Pérdida de calidad por cuantización: el uso de 2 bits en embeddings y esquemas mixtos implica una degradación potencial frente al modelo base, no cuantificada públicamente.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se documentan mitigaciones específicas en el checkpoint.
- Sesgos: no se documentan sesgos conocidos del modelo base ni del proceso de cuantización.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base Qwen3.8-27B enlazada por el autor.
- Dependencia de herramienta propietaria: la inferencia requiere la librería `uzu` y el CLI `mirai`, lo que limita la portabilidad y la integración con ecosistemas estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trymirai/Qwen3.8-27B-S
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Model card del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/README.md
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- Blog de cuantización de Mirai: https://trymirai.com/blog/quantization
- Guía de ejecución de `uzu`: https://github.com/trymirai/uzu/blob/how-to/docs/how-to-run-uzu.md
