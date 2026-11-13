# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-SFT-STAR-gp3-benignv2-lr1e-5-E4-step240

## Resumen

El modelo `Safety_Tuning-Qwen3.5-4B-SFT-STAR-gp3-benignv2-lr1e-5-E4-step240` es un checkpoint de ajuste fino supervisado (SFT) sobre el modelo base Qwen/Qwen3.5-4B, publicado por el usuario thkim0305-SNU. Se trata de un experimento de alineacion de seguridad dentro de la campana denominada STAR GP3 / benign-v2, orientado a modificar el comportamiento del modelo base mediante datos de entrenamiento supervisado etiquetados como benignos. El checkpoint corresponde a la epoca 4 de entrenamiento, tras 240 actualizaciones del optimizador, con una tasa de aprendizaje de 1e-5.

Con 4.659.865.088 parametros totales (aproximadamente 4,66 mil millones), el modelo hereda la arquitectura y las capacidades del Qwen3.5-4B original, incluyendo el pipeline image-text-to-text declarado en sus etiquetas, lo que sugiere capacidades multimodales de entrada. El repositorio ocupa 9,3 GB e incluye unicamente los pesos de inferencia en formato safetensors y los activos del tokenizador; el estado del optimizador y los registros de entrenamiento permanecen en el almacenamiento original del checkpoint.

La relevancia de esta ficha es doble: por un lado, documenta un artefacto de investigacion sobre safety tuning de un modelo Qwen de cuarta generacion con licencia Apache 2.0; por otro, advierte de que se trata de un checkpoint intermedio de un experimento, sin model card detallada, sin benchmarks publicados y con cero descargas, lo que limita seriamente su uso en produccion sin una evaluacion previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-4B); detalles especificos no disponibles |
| Parametros totales | 4.659.865.088 |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) del checkpoint Qwen/Qwen3.5-4B. La arquitectura subyacente corresponde a la familia Qwen3.5, un transformer decoder-only de aproximadamente 4,66 mil millones de parametros, aunque la model card no detalla la configuracion de capas, dimensiones ocultas, mecanismo de atencion ni estrategia posicional. Las etiquetas del repositorio incluyen `image-text-to-text`, lo que indica que el modelo base admite entradas multimodales de imagen y texto, si bien el pipeline declarado es `text-generation`.

El entrenamiento consistio en una fase de SFT con tasa de aprendizaje 1e-5, ejecutada durante 4 epocas y 240 pasos del optimizador, sobre un dataset denominado GP3 / benign-v2 dentro de la campana STAR. El nombre del checkpoint de origen (`qwen35-star-gp3-benignv2-sft-lr1e5-4ep-gpu0123-20261112-v1/iter_0000239`) sugiere el uso de 4 GPU (indices 0 a 3) y una fecha de ejecucion en noviembre de 2026. No se documentan el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen3.5-4B.
- Entrada multimodal imagen-texto segun la etiqueta `image-text-to-text` del repositorio; el alcance exacto no esta documentado.
- Ajuste orientado a seguridad: el entrenamiento SFT con datos "benign-v2" busca modular las respuestas del modelo en escenarios sensibles, aunque no se publican metricas de eficacia.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo de razonamiento extendido (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en alineacion y safety tuning: el checkpoint permite reproducir o comparar el efecto de un SFT con datos benign-v2 sobre el comportamiento del Qwen3.5-4B base, sirviendo como punto de referencia en estudios de seguridad de modelos.
- Evaluacion de robustez frente a prompts adversarios: al ser un modelo ajustado especificamente para seguridad, resulta util para medir la tasa de rechazo y la tasa de falsos positivos en clasificadores de contenido sensible.
- Prototipado de asistentes conversacionales con requisitos de moderacion: el ajuste de seguridad puede emplearse como capa de generacion en entornos controlados donde se priorice la cautela en las respuestas.
- Fine-tuning posterior como punto de partida: al estar bajo licencia Apache 2.0 y en formato transformers, puede servir de base para experimentos adicionales de SFT o DPO sin restricciones de uso comercial.
- Analisis comparativo de checkpoints intermedios: al documentarse la epoca y el paso exactos, permite estudiar la evolucion del comportamiento del modelo a lo largo del entrenamiento.
- Docencia y formacion tecnica: sirve como ejemplo practico de publicacion de checkpoints SFT en Hugging Face, incluyendo la nomenclatura de experimentos y la separacion entre pesos de inferencia y estado del optimizador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9,3 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomiendan 12-16 GB de VRAM.
- VRAM estimada en cuantizacion de 8 bits: en torno a 5-6 GB de pesos; en 4 bits, alrededor de 3 GB, aunque el autor no publica variantes cuantizadas.
- GPU recomendadas para FP16: NVIDIA A100, H100, L40S o RTX 4090 (24 GB); tambien cabe en RTX 3090 y RTX 4080.
- GPU de consumo: si cabe en tarjetas consumer de 16 GB o mas en cuantizacion de 8 bits; en 4 bits podria ajustarse a 8 GB, pero sin pesos GGUF publicados requiere conversion manual.
- Opciones de despliegue: transformers (soporte nativo declarado); vLLM, TGI, llama.cpp u Ollama requeririan conversion o verificacion de compatibilidad con la arquitectura qwen3_5.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-SFT-STAR-gp3-benignv2 (este) | 4,66 B | No disponible | Apache 2.0 | Hugging Face, 0 descargas | Checkpoint SFT de seguridad, sin benchmarks |
| Qwen/Qwen3.5-4B (base) | ~4,66 B | No disponible | No disponible en esta ficha | Hugging Face | Modelo original sin ajuste de seguridad especifico |
| Alternativas de ~4B con safety tuning | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparables en la informacion proporcionada |

La comparacion con otros modelos de la misma categoria no puede completarse con rigor porque la informacion proporcionada no incluye resultados de benchmarks ni especificaciones detalladas del modelo base.

## Limitaciones y advertencias

- Se trata de un checkpoint intermedio de un experimento de investigacion (epoca 4, paso 240), no de una version final validada.
- No se publican benchmarks, evaluaciones de seguridad cuantitativas ni resultados de red teaming; la eficacia del ajuste de seguridad es desconocida.
- La model card es minima y no documenta el dataset de entrenamiento, los idiomas soportados ni las limitaciones conocidas.
- Riesgo de alucinacion inherente a los modelos de ~4B, agravado por la falta de evaluacion publicada.
- El ajuste con datos "benign-v2" puede inducir sobre-rechazo (falsos positivos) en consultas legitimas, un efecto habitual en SFT de seguridad sin datos de calibracion.
- Cero descargas y cero likes en el momento de la ficha: no hay evidencia de uso comunitario ni de validacion independiente.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen3.5-4B antes de un despliegue comercial.
- El repositorio no incluye estado del optimizador ni registros de entrenamiento, lo que dificulta la reproducibilidad exacta del experimento.
- La etiqueta `image-text-to-text` sugiere capacidades multimodales, pero no se documenta su funcionamiento ni su calidad tras el SFT.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-SFT-STAR-gp3-benignv2-lr1e-5-E4-step240
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Perfil del autor: https://huggingface.co/thkim0305-SNU
