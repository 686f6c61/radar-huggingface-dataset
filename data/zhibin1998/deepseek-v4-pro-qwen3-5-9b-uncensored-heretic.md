# zhibin1998/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es una variante "decensored" del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, publicada por el usuario zhibin1998. El modelo base es un ajuste fino de Qwen3.5-9B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect, con el senal de supervision concentrada en matematicas y resolucion de problemas STEM. Esta version concreta aplica la herramienta Heretic v2.0.0.dev0 para eliminar los mecanismos de rechazo del modelo original mediante ablacion de rangos arbitrarios (Arbitrary-Rank Ablation, ARA).

El modelo conserva la arquitectura y el tamano del base: 9.409.813.744 parametros en formato safetensors, licencia Apache 2.0 y soporte declarado para ingles, chino, coreano, japones, espanol y ruso. La intervencion de Heretic reduce los rechazos de 100/100 en el modelo original a 3/100 en esta version, con una divergencia KL de 0,0422 respecto al original, lo que indica que la mayor parte del comportamiento se preserva.

Es relevante para desarrolladores e investigadores que necesitan un modelo de 9B con razonamiento estructurado y sin filtros de rechazo para tareas de investigacion, generacion de contenido sin restricciones o evaluacion de sesgos, aunque su naturaleza "abliterated" plantea caveats importantes de seguridad y responsabilidad en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5); tag `qwen3_5`, multimodal image-text-to-text |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion del autor; existe version GGUF de terceros (mradermacher) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 19,3 GB); GGUF disponible via mradermacher |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino de Qwen3.5-9B con destilacion de DeepSeek-V4-Pro en modo Max Effect. El entrenamiento combina SFT y RL (el tag `gspo` sugiere Group Sequence Policy Optimization) sobre aproximadamente 250.000 muestras centradas en matematicas y razonamiento cientifico. Segun la model card, el modelo muestra pequenas ganancias en programacion y uso de herramientas pese a no recibir datos SFT especificos de codigo, lo que apunta a transferencia cross-domain desde el razonamiento STEM. Se evaluo su despliegue mediante vLLM con NVFP4 y llama.cpp con MTP-Q8_0.

La modificacion "heretic" aplica Arbitrary-Rank Ablation sobre las capas 9 a 24 (start_layer_index 9, end_layer_index 24) con los parametros preserve_good_behavior_weight 0,8264, steer_bad_behavior_weight 0,0003, overcorrect_relative_weight 0,9645 y neighbor_count 12. Esta ablacion elimina direcciones de activacion asociadas a comportamientos de rechazo manteniendo el resto de capacidades, con una divergencia KL de 0,0422 frente al modelo original.

## Capacidades

- Generacion de texto y razonamiento multi-paso con descomposicion estructurada de problemas.
- Razonamiento matematico y STEM reforzado por destilacion (aprox. 250.000 muestras).
- Generacion de codigo con ganancias limitadas por transferencia cross-domain.
- Tool calling y function calling (tags `tool-use`, `function-calling`).
- Procesamiento image-text-to-text segun el tag del pipeline.
- Capacidades multilingues en ingles, chino, coreano, japones, espanol y ruso.
- Modo de razonamiento (tag `reasoning`) heredado del modelo base.
- Comportamiento sin rechazos (3/100 refusals) para contenido que el original bloqueaba.

## Casos de uso

- Investigacion sobre alineacion y seguridad: comparar el comportamiento del modelo original (100/100 rechazos) con esta variante (3/100) para estudiar que direcciones de activacion codifican los rechazos y como afecta la ablacion ARA a las respuestas.
- Generacion de contenido creativo sin restricciones: ficcion, guiones o narrativa que requiera tematicas que los modelos alineados rechazan, aprovechando la reduccion de rechazos manteniendo coherencia (KL 0,0422).
- Resolucion de problemas matematicos y cientificos: el modelo esta destilado sobre ~250.000 muestras STEM, por lo que es adecuado para asistencia en calculo, fisica o derivaciones paso a paso en entornos de investigacion.
- Evaluacion de sesgos y robustez: al ser una version abliterated, sirve como caso de estudio para medir como la eliminacion de direcciones de rechazo afecta a la toxicidad, los sesgos y la veracidad de las respuestas.
- Prototipado de agentes con tool calling: los tags de function-calling permiten integrarlo en pipelines de agentes para tareas de automatizacion, con la cautela de validar las salidas por su naturaleza sin filtros.
- Despliegue local en hardware de consumo: con 9,4B parametros y versiones GGUF de terceros, puede ejecutarse en GPUs consumer para experimentacion offline sin dependencia de APIs.
- Analisis multilingue: cobertura de seis idiomas (en, zh, ko, ja, es, ru) para tareas de procesamiento de texto en esos mercados.

## Benchmarks y rendimiento

La model card solo publica metricas de la intervencion de decensurado, no benchmarks estandar de capacidad:

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Rechazos (refusals) | 3/100 | 100/100 |
| Divergencia KL | 0,0422 | 0 (por definicion) |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 9,4B parametros, en FP16 requiere aproximadamente 19 GB, en cuantizacion de 8 bits unos 10 GB y en 4 bits unos 5-6 GB (estimacion estandar por tamano, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor; por tamano, una A100 o H100 para FP16, y RTX 4090 o superiores para cuantizaciones de 8/4 bits.
- Cabe en GPU consumer: previsiblemente si, en cuantizaciones GGUF de 4-8 bits en GPUs con 8-24 GB de VRAM.
- Opciones de despliegue: transformers, text-generation-inference, vLLM (evaluado con NVFP4) y llama.cpp (evaluado con MTP-Q8_0); existe GGUF de terceros en mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (zhibin1998) | 9,41B | no disponible | 3/100 | Apache 2.0 | HF + GGUF terceros |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B (base) | 9B | no disponible | 100/100 | Apache 2.0 | HF |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | 4B | no disponible | no disponible | no disponible | HF |

No se dispone de datos de rendimiento (benchmarks) para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo "abliterated"/"uncensored": la eliminacion de rechazos implica que puede generar contenido danino, ofensivo o ilegal; no es apto para despliegues publicos sin moderacion externa.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad; la destilacion en matematicas no garantiza correccion factual.
- Sesgos conocidos: no documentados por el autor; la ablacion puede amplificar sesgos preexistentes al eliminar respuestas de rechazo.
- Longitud de contexto no especificada, lo que impide planificar tareas de contexto largo con garantias.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (2026-11-08), sin validacion de la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal sobre el contenido generado recae en el desplegador.
- La model card incluye contenido HTML y emojis; la informacion tecnica sobre entrenamiento y evaluacion es escasa y no verificable de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zhibin1998/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Version GGUF de terceros: https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF
- Replicado por terceros: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Version 4B: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Heretic: https://heretic-project.org
