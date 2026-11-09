# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-SFT-STAR-lr5e-5-E4-step240

## Resumen

Safety_Tuning-Qwen3.5-4B-SFT-STAR-lr5e-5-E4-step240 es un checkpoint de ajuste fino supervisado (SFT) orientado a seguridad sobre el modelo multimodal Qwen/Qwen3.5-4B, desarrollado por el usuario thkim0305-SNU. El modelo parte de la arquitectura Qwen3.5 con pipeline image-text-to-text, es decir, acepta entradas de imagen y texto y genera respuestas textuales. El ajuste se ha realizado con 7.655 trayectorias docentes completas provenientes de los conjuntos STAR-1 y STAR-Benign, supervisando razonamiento, respuesta y token EOS.

El interés del checkpoint reside en su enfoque de safety tuning sobre un modelo de 4B con capacidades de visión, un tamaño que permite despliegue en hardware de consumo y en entornos de investigación con recursos limitados. La licencia Apache 2.0 facilita su reutilización comercial, aunque el autor no publica métricas de evaluación ni resultados de benchmarks, por lo que su rendimiento real en tareas de seguridad o utilidad general no está verificado empíricamente en la información disponible.

El nombre del repositorio codifica los hiperparámetros del entrenamiento: learning rate 5e-5, 4 épocas, batch global de 128 y 240 actualizaciones del optimizador. Se trata de un artefacto de investigación más que de un modelo listo para producción, dado que no se acompañan logs, ejemplos de entrenamiento ni evaluaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer multimodal image-text-to-text; detalles internos no disponibles) |
| Parametros totales | 4.659.865.088 (~4,66 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint base Qwen/Qwen3.5-4B (revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`), un transformer multimodal con pipeline image-text-to-text. El autor indica que los tensores de texto entrenados se exportan desde el checkpoint nativo, mientras que los tensores de visión y los tensores MTP (multi-token prediction) no entrenados se conservan del modelo base original; el MTP no fue entrenado en este proceso. La conversión se verificó mediante conversión inversa exacta de cada tensor de texto nativo, comprobaciones de pesos finitos y coincidencia de las 738 claves y formas de tensores de Hugging Face.

El entrenamiento consistió en SFT con 7.655 trayectorias docentes completas de los datasets UCSC-VLAA/STAR-1 y UCSC-VLAA/STAR-benign-915, supervisando razonamiento, respuesta y EOS. Los hiperparámetros documentados son learning rate 5e-5, 4 épocas completas, batch global de 128 y 240 actualizaciones del optimizador (iteración nativa 239, base cero). Cada ejecución de learning rate parte de forma independiente del modelo base original y no se añade ningún "teacher Spec" al contexto del estudiante. La ejecución de origen se identifica como `qwen35-star-slime-sft-4ep-b128-pro6000-gpu01-20261106-v4`. No se documentan detalles sobre RLHF, DPO ni composición lingüística del dataset.

## Capacidades

- Generación de texto conversacional en formato multimodal image-text-to-text, heredada del modelo base Qwen3.5-4B.
- Procesamiento de entradas de imagen junto con texto, según el pipeline declarado.
- Razonamiento supervisado: el entrenamiento incluye supervisión explícita de las trazas de razonamiento de las trayectorias docentes.
- Ajuste orientado a seguridad: entrenado sobre STAR-1 y STAR-Benign, conjuntos asociados a tuning de seguridad.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Investigación en safety tuning multimodal: el checkpoint sirve como punto de comparación para estudiar cómo el SFT sobre trayectorias de STAR-1 y STAR-Benign modifica el comportamiento de un modelo image-text-to-text de 4B, partiendo siempre del mismo modelo base y con hiperparámetros documentados.
- Evaluación de robustez frente a entradas visuales y textuales combinadas: al conservar los tensores de visión del modelo base y haber ajustado solo los de texto, permite aislar el efecto del ajuste lingüístico sobre la seguridad en tareas que combinan imagen y texto.
- Reproducción de experimentos de SFT: el nombre del repositorio y la model card documentan learning rate, épocas, batch y número de pasos, lo que facilita replicar la configuración en entornos de investigación con GPUs de gama media.
- Prototipado de asistentes conversacionales con entrada de imagen en entornos con recursos limitados: sus ~4,66 mil millones de parámetros permiten inferencia en una sola GPU de consumo con cuantización adecuada, aunque el autor no publica variantes cuantizadas.
- Base para posteriores ajustes (DPO, RLHF o safety alignment adicional): al ser un checkpoint intermedio de SFT con licencia Apache 2.0, puede emplearse como punto de partida en pipelines de alineamiento posteriores.
- Estudio de la supervisión de trazas de razonamiento: el entrenamiento supervisa razonamiento, respuesta y EOS, lo que permite analizar si el modelo reproduce cadenas de razonamiento similares a las de las trayectorias docentes en tareas de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se afirman puntuaciones de evaluación ("No evaluation scores are asserted by this model card").

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16/fp16, aproximadamente 9,3 GB solo para los pesos (tamaño del repo), más overhead de activaciones y caché KV; en cuantización de 8 bits, en torno a 5 GB; en 4 bits, en torno a 3 GB. Estas cifras son estimaciones a partir del número de parámetros, no datos publicados por el autor.
- GPU recomendadas: para bf16 sin cuantizar, GPUs con 16-24 GB de VRAM (RTX 4090, A10G, L4 de 24 GB); para cuantización 4/8 bits, GPUs de 8-12 GB (RTX 3060/4060 Ti, RTX 3080).
- Cabe en GPU de consumo: sí, especialmente con cuantización, aunque el modelo incluye componentes de visión cuyo coste de memoria adicional no está documentado.
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible, y la ausencia de pesos GGUF publicados limita el uso directo en llama.cpp/Ollama sin conversión previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-SFT-STAR (este) | ~4,66 B | no disponible | image-text-to-text | apache-2.0 | Checkpoint SFT de seguridad; sin benchmarks publicados |
| Qwen/Qwen3.5-4B (base) | ~4,66 B | no disponible | image-text-to-text | no disponible en la informacion | Modelo base del que parte este checkpoint; sin datos de evaluación en esta ficha |
| Alternativas de 4B con safety tuning | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre modelos comparables en la búsqueda realizada |

## Limitaciones y advertencias

- Ausencia total de evaluación: el autor no publica benchmarks ni métricas de seguridad, por lo que no hay evidencia cuantitativa de que el ajuste mejore la seguridad sin degradar la utilidad general.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; no se documentan mitigaciones específicas más allá del SFT.
- Sesgos conocidos: no documentados; los sesgos del modelo base Qwen3.5-4B y los presentes en los datasets STAR-1 y STAR-Benign pueden propagarse al checkpoint.
- Idiomas: no se especifica qué idiomas cubre el ajuste; el comportamiento fuera del inglés (u otros idiomas del dataset) es desconocido.
- Contexto: la longitud de contexto no está documentada en la información disponible.
- Componentes no entrenados: los tensores de visión y MTP se conservan del modelo base, por lo que el ajuste de seguridad afecta únicamente a la parte textual; el comportamiento multimodal completo puede no reflejar el tuning.
- Uso comercial: la licencia Apache 2.0 lo permite, pero al derivar de Qwen3.5-4B conviene verificar las condiciones del modelo base y de los datasets de entrenamiento.
- Madurez: repositorio con 0 descargas y 0 likes, sin logs ni ejemplos de entrenamiento publicados; no recomendable como dependencia de producción sin validación propia.
- Fecha del checkpoint: creado el 2026-11-09, lo que sitúa el artefacto en una ventana temporal muy reciente respecto a la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-SFT-STAR-lr5e-5-E4-step240
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset STAR-1: https://huggingface.co/datasets/UCSC-VLAA/STAR-1
- Dataset STAR-Benign: https://huggingface.co/datasets/UCSC-VLAA/STAR-benign-915
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
