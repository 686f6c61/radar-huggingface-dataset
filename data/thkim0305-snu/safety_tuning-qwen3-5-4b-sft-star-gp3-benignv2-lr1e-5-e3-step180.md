# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-SFT-STAR-gp3-benignv2-lr1e-5-E3-step180

## Resumen

Safety_Tuning-Qwen3.5-4B-SFT-STAR-gp3-benignv2-lr1e-5-E3-step180 es un checkpoint de ajuste fino supervisado (SFT) derivado de Qwen/Qwen3.5-4B, publicado por el usuario thkim0305-SNU. Se trata de un modelo de 4.659.865.088 parametros (aproximadamente 4,66 mil millones) orientado a generacion de texto conversacional y a tareas de seguridad (safety tuning), entrenado sobre el conjunto de datos denominado STAR GP3 / benign-v2.

El checkpoint corresponde a la epoca 3 de un entrenamiento con tasa de aprendizaje 1e-5, tras 180 actualizaciones del optimizador (indice nativo de checkpoint 179). El repositorio contiene unicamente los pesos de inferencia en formato safetensors y los recursos del tokenizador; el estado del optimizador y los registros de entrenamiento permanecen en el almacenamiento original del autor.

Su relevancia es limitada pero concreta: sirve como referencia reproducible de un proceso de safety tuning sobre una base Qwen3.5-4B, con licencia Apache 2.0 y compatibilidad con la libreria transformers y con endpoints. No obstante, la ausencia de model card detallada, de benchmarks publicados y de documentacion sobre el dataset de entrenamiento reduce su utilidad para evaluaciones rigurosas en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B); detalles especificos no disponibles |
| Parametros totales | 4.659.865.088 (~4,66 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Qwen3.5-4B, un transformer de aproximadamente 4,66 mil millones de parametros. El autor no documenta en la model card la arquitectura interna (numero de capas, dimensiones de atencion, uso de atencion lineal o hibrida, etc.), por lo que estos detalles deben consultarse en la ficha del modelo base Qwen/Qwen3.5-4B.

El entrenamiento consiste en un ajuste fino supervisado (SFT) sobre el conjunto STAR GP3 / benign-v2, con 3 epocas completadas y 180 pasos de optimizador a una tasa de aprendizaje de 1e-5. El identificador del checkpoint de origen (`qwen35-star-gp3-benignv2-sft-lr1e5-4ep-gpu0123-20261112-v1/iter_0000179`) sugiere un entrenamiento planificado a 4 epocas del que este repositorio exporta la tercera. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional y continuacion de texto, heredadas de la base Qwen3.5-4B.
- Procesamiento de imagen y texto (tag `image-text-to-text`), lo que indica capacidades multimodales de entrada imagen-texto.
- Ajuste orientado a seguridad (safety tuning), presumiblemente para reducir respuestas danosas o no deseadas.
- Soporte de tool calling / function calling: no documentado en la model card; debe verificarse contra el modelo base.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Modo thinking, audio u otras capacidades especiales: no documentado.

## Casos de uso

- Evaluacion de safety tuning: utilizar el checkpoint como referencia para medir el efecto del SFT sobre el comportamiento seguro del modelo base en tareas de red teaming controlado.
- Clasificacion y filtrado de contenido: desplegar el modelo para etiquetar respuestas potencialmente danosas en pipelines de moderacion, comparando su salida con la del modelo base sin ajustar.
- Investigacion academica en alineacion: reproducir el proceso de SFT con hiperparametros conocidos (lr 1e-5, 3 epocas, 180 pasos) para estudiar la estabilidad del ajuste en modelos de ~4,6 B.
- Generacion de texto asistida en entornos de laboratorio: prototipado de asistentes conversacionales donde se prioriza la seguridad sobre el rendimiento bruto, con la cautela de que no hay benchmarks publicados.
- Fine-tuning posterior: servir como punto de partida para experimentos de DPO o RLHF sobre una base ya sometida a SFT de seguridad.
- Pruebas de compatibilidad con transformers y endpoints: validar pipelines de inferencia con un checkpoint pequeno (9,3 GB en safetensors) antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 9,3 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, se recomienda al menos 12-16 GB de VRAM.
- VRAM estimada en cuantizacion de 8 bits: en torno a 5-6 GB de pesos; en 4 bits, en torno a 3 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para fp16 sin problemas; RTX 3090/4080 (16-24 GB) tambien viables.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 y, con cuantizacion, en GPUs de 8-12 GB.
- Opciones de despliegue: transformers (libreria declarada), endpoints compatibles; vLLM, TGI, llama.cpp u Ollama no estan documentados para este checkpoint y requeririan conversion a los formatos correspondientes.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-SFT-STAR-gp3-benignv2-lr1e-5-E3-step180 | ~4,66 B | no disponible | apache-2.0 | Checkpoint SFT de seguridad, sin benchmarks publicados |
| Qwen/Qwen3.5-4B (modelo base) | ~4,66 B | no disponible en esta ficha | apache-2.0 | Base sin ajuste de seguridad; referencia directa |
| Alternativas de ~4 B con safety tuning | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de rendimiento en MMLU, HumanEval, GSM8K ni en evaluaciones de seguridad.
- Dataset de entrenamiento no documentado: se desconoce la composicion de STAR GP3 / benign-v2, lo que impide evaluar sesgos introducidos por el ajuste.
- Riesgo de alucinacion: inherente a los modelos de ~4 B; no se han publicado evaluaciones de factualidad.
- Idiomas no declarados: no se puede garantizar un rendimiento multilingue solido.
- Contexto no especificado: se desconoce la ventana maxima; debe consultarse la ficha de Qwen3.5-4B.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; la responsabilidad de validacion recae en el usuario.
- Checkpoint intermedio (epoca 3 de un plan de 4): no es necesariamente la version final ni la mejor; el autor no indica criterios de seleccion.
- Sin estado del optimizador ni registros de entrenamiento en el repositorio: la reproducibilidad completa no es posible desde este artefacto.
- Popularidad nula (0 descargas, 0 likes): no hay validacion comunitaria ni informes de uso en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-SFT-STAR-gp3-benignv2-lr1e-5-E3-step180
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Perfil del autor: https://huggingface.co/thkim0305-SNU
