# zen-E/PLatour-SFT-Qwen3-235B-to-1.7B-Chemistry-CoT

## Resumen

PLatour-SFT-Qwen3-235B-to-1.7B-Chemistry-CoT es un artefacto de investigación publicado por el autor zen-E en Hugging Face. No es un modelo de lenguaje convencional entrenado de extremo a extremo, sino un conjunto de pesos de puente (bridge projections) resultantes de un experimento de transferencia entre modelos. En concreto, un modelo emisor grande, Qwen3-235B-A22B-FP8, codifica el prompt y suministra representaciones ocultas, mientras que un receptor pequeño, Qwen3-1.7B, genera la respuesta de forma independiente. El repositorio contiene únicamente las proyecciones lineales del puente, no los backbones, que deben descargarse por separado.

El trabajo se enmarca en el artículo "On the Opportunities and Challenges of Prefill-to-Autoregressive Cross-Model Transfer" (arXiv 2611.06976), que introduce el paradigma PACT (Prefill-to-Autoregressive Cross-model Transfer). El método entrena puentes lineales ligeros entre backbones congelados usando recompensas de tarea, partiendo de proyecciones inicializadas a cero y admitiendo modelos con atención híbrida. Este repositorio corresponde al Experimento 04, centrado en un conjunto de datos de química con cadena de pensamiento (chemistry_cot).

La relevancia del artefacto es fundamentalmente metodológica: sirve para estudiar si la información del emisor mejora realmente al receptor o si las ganancias provienen de la mera adaptación del receptor. El autor advierte explícitamente de que el repositorio distribuye pesos de inferencia históricos sin puntuaciones de benchmark y que no debe interpretarse como un modelo listo para producción ni cargarse mediante `AutoModel.from_pretrained` o PEFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Puentes lineales (bridge projections) entre dos backbones transformer congelados: emisor Qwen3-235B-A22B-FP8 (MoE) y receptor Qwen3-1.7B; soporta modelos de atención híbrida |
| Parametros totales | No disponible (el repositorio de 0,9 GB contiene solo las proyecciones del puente; los backbones se descargan aparte) |
| Parametros activos | No disponible para el artefacto; el emisor Qwen3-235B-A22B es MoE con 235B totales y 22B activos (dato del modelo base, no del puente) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el emisor de referencia se distribuye en FP8; el receptor Qwen3-1.7B admite las cuantizaciones habituales de su familia, pero no se documentan en esta ficha) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (los modelos upstream conservan sus propias licencias y avisos) |
| Formato de pesos | safetensors, con cargador personalizado (`custom-loader`) y `config.json` propio del proyecto PLatour |

## Arquitectura y entrenamiento

El artefacto implementa el esquema PACT: un emisor grande procesa el prompt en fase de prefill y expone sus representaciones ocultas; un puente lineal ligero las proyecta hacia el espacio del receptor pequeño, que autoregresivamente genera la respuesta. Los backbones permanecen congelados y solo se entrenan las proyecciones del puente, inicializadas a cero, optimizadas mediante recompensas de tarea. El diseño admite modelos con atención híbrida, lo que permite emparejar arquitecturas con patrones de atención distintos entre emisor y receptor.

El experimento 04 se entrena sobre el dataset zen-E/PLatour-Qwen3-Data, en la variante chemistry_cot (razonamiento químico con cadena de pensamiento). El artículo asociado introduce además PACT-Check, un conjunto de controles (Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver) para verificar que las mejoras dependen de información útil del emisor y no de la simple adaptación del receptor. No se documentan en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si se emplearon RLHF o DPO más allá del uso de recompensas de tarea para entrenar los puentes.

## Capacidades

- Generación de respuestas de razonamiento químico con cadena de pensamiento (chemistry_cot), condicionada por las representaciones del emisor Qwen3-235B-A22B-FP8.
- Transferencia de información entre modelos de distinta escala mediante proyecciones lineales entrenadas, sin modificar los backbones.
- Soporte de emparejamiento entre arquitecturas con atención híbrida (emisor MoE grande y receptor denso pequeño).
- Capacidades heredadas del receptor Qwen3-1.7B (generación de texto, razonamiento básico, código y matemáticas elementales), aunque no se documentan evaluaciones específicas en este repositorio.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking explícito para este artefacto.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación en transferencia entre modelos: reproducir el Experimento 04 de PACT para estudiar si las representaciones del emisor aportan información útil frente a los controles de PACT-Check (Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver).
- Estudio de eficiencia en inferencia: analizar si un emisor grande en prefill más un receptor de 1.7B en decodificación ofrece una relación calidad/coste mejor que ejecutar el modelo grande de extremo a extremo.
- Evaluación de razonamiento químico con CoT: usar el par emisor-receptor con las entradas de tarea firmadas del proyecto para medir el rendimiento en chemistry_cot, siempre con evaluación independiente.
- Reproducibilidad de artefactos: verificar la integridad de los pesos mediante los hashes SHA-256 incluidos en el `config.json` y comparar con la exportación pública de inferencia.
- Docencia y divulgación: ilustrar cómo funcionan los puentes lineales entre espacios de representación de modelos de distinta escala y arquitectura.
- Auditoría de metodología: revisar el protocolo de selección de checkpoints y la procedencia de los pesos, dado que el autor declara que no se adjuntan resultados de benchmark.
- Línea base para nuevas investigaciones: punto de partida para experimentos que comparen PACT con destilación clásica o con adaptadores PEFT en tareas de razonamiento científico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica expresamente que el repositorio distribuye pesos de inferencia históricos sin puntuaciones de benchmark y que no se hace ninguna afirmación sobre el protocolo de selección de checkpoints ni sobre el rendimiento en un conjunto de retención no sesgado.

## Requisitos de hardware

- El repositorio en sí ocupa 0,9 GB (solo las proyecciones del puente), pero la inferencia requiere descargar y cargar ambos backbones por separado.
- Emisor Qwen3-235B-A22B-FP8: requiere hardware de clase servidor; en FP8, los 235B parámetros implican del orden de 235 GB de pesos, por lo que se necesitan múltiples GPU de alta gama (H100, H200, A100 de 80 GB en configuración multi-GPU) o servicios de inferencia distribuida.
- Receptor Qwen3-1.7B: cabe en GPU de consumo (RTX 3060 12 GB, RTX 4070, RTX 4090) en cuantizaciones de 4-8 bits; en BF16 ocupa aproximadamente 3,4 GB de pesos.
- No cabe en una única GPU de consumo el pipeline completo con el emisor de 235B; la viabilidad práctica depende de disponer del emisor en infraestructura separada o de servicios gestionados.
- Opciones de despliegue: el artefacto no es cargable con `AutoModel.from_pretrained` ni PEFT; requiere el cargador del proyecto PLatour (`platour-exps download --experiment 4`) y los backbones descargados aparte. Para los backbones, vLLM, TGI o llama.cpp son opciones habituales de la familia Qwen3, aunque no se documentan en esta ficha.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen en la información proporcionada artefactos comparables de transferencia prefill-to-autoregresivo con puentes lineales entre modelos de distinta escala que permitan una comparación directa de parámetros, contexto, rendimiento y licencia. Como referencia del ecosistema, el receptor Qwen3-1.7B y el emisor Qwen3-235B-A22B son los modelos base declarados, pero no son alternativas equivalentes al artefacto.

## Limitaciones y advertencias

- El repositorio no incluye los backbones: sin descargar Qwen3-235B-A22B-FP8 y Qwen3-1.7B por separado, los pesos del puente no son utilizables.
- No es cargable mediante `AutoModel.from_pretrained` ni PEFT; requiere el cargador específico del proyecto PLatour y su `config.json`.
- El autor declara que se trata de pesos de inferencia históricos sin benchmark adjunto; no hay afirmaciones sobre protocolo de selección de checkpoints ni sobre rendimiento no sesgado en retención.
- Las revisiones exactas de los backbones usadas en la ejecución histórica no han sido verificadas de forma independiente y no deben inferirse de la última revisión del Hub.
- No es un estado de reanudación de optimizador/RNG; no sirve para continuar el entrenamiento tal cual.
- Riesgo de alucinación: inherente al receptor Qwen3-1.7B, agravado por la falta de evaluación específica del par emisor-receptor en este repositorio.
- Sesgos: no documentados; los hereda de los backbones y del dataset zen-E/PLatour-Qwen3-Data.
- Idiomas soportados y longitud de contexto: no disponibles en la información proporcionada.
- Licencia Apache-2.0 para el artefacto, pero los modelos upstream conservan sus propias licencias y avisos, que deben respetarse en uso comercial.
- Para evaluación se requieren las entradas de tarea firmadas del proyecto y, en evaluación de programación, el juez oficial aislado; sin ellos, los resultados no son comparables.
- Cualquier uso en producción o en afirmaciones comparativas de investigación requiere evaluación independiente y revisión de procedencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zen-E/PLatour-SFT-Qwen3-235B-to-1.7B-Chemistry-CoT
- Colección PLatour: https://huggingface.co/collections/zen-E/platour
- Artículo (arXiv 2611.06976): https://arxiv.org/abs/2611.06976
- Versión HTML del artículo: https://arxiv.org/html/2611.06976
- Dataset: https://huggingface.co/datasets/zen-E/PLatour-Qwen3-Data
- Modelo emisor: https://huggingface.co/Qwen/Qwen3-235B-A22B-FP8
- Modelo receptor: https://huggingface.co/Qwen/Qwen3-1.7B
- Blog de Qwen3: https://zenlm.org/blog/qwen3/
