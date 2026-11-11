# tahamajs/llava-qwen-0.5b-hla-attention-scienceqa

## Resumen

`llava-qwen-0.5b-hla-attention-scienceqa` es un checkpoint experimental publicado por el usuario tahamajs dentro del proyecto NeuralOps, un marco de trabajo centrado en la modificacion quirurgica de mecanismos de atencion en modelos existentes. El modelo parte de `llava-hf/llava-interleave-qwen-0.5b-hf`, un VLM de 0,5 mil millones de parametros que combina una torre visual SigLIP congelada con un decodificador Qwen2 de 24 capas, y sustituye la atencion cuadratica en 18 de esas 24 capas por un modulo de atencion lineal basado en transformaciones de Hadamard (HLAAttention).

La propuesta no es un modelo de proposito general, sino una pieza de investigacion sobre eficiencia arquitectonica: demuestra que es posible reemplazar la atencion softmax por un mecanismo recurrente con estado asociativo por cabeza y reducir el artefacto de pesos a 147,5 MB (un 91,3 % menos que el modelo base en FP16). El entrenamiento se limita a 60 pasos de optimizacion en una unica RTX 3090, con destilacion de conocimiento desde el modelo profesor.

Es relevante para quienes investigan alternativas a la atencion cuadratica en modelos multimodales pequenos y para quienes necesitan desplegar VLM en entornos con recursos muy limitados. Conviene subrayar que el propio autor reporta una caida de precision de 13,12 puntos porcentuales respecto al profesor en ScienceQA, por lo que se trata de un artefacto de investigacion y no de un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (torre visual SigLIP congelada + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas), con atencion lineal HLAAttention en 18 de 24 capas |
| Parametros totales | 0,5 mil millones (modelo base); el artefacto guardado son solo los pesos delta de atencion |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en FP16 safetensors) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16, pesos delta quirurgicos) |

## Arquitectura y entrenamiento

El modelo hereda la estructura de LLaVA-Interleave-Qwen-0.5B: una torre visual SigLIP de 27 capas completamente congelada, un proyector multimodal de dos capas MLP y un decodificador Qwen2 con dimension oculta D=1024, 16 cabezas y head_dim=64. La intervencion sustituye el modulo de autoatencion en 18 de las 24 capas del decodificador (esquema `hybrid_3_1`) por HLAAttention, un mecanismo de atencion lineal con compuerta que mantiene un estado asociativo por cabeza S ∈ R^{B×H×d×d} y un vector normalizador Z, actualizados mediante una recurrencia con decaimiento aprendible por cabeza y una funcion de caracteristica φ(x) = ELU(x) + 1. Se conservan seis capas ancla con atencion cuadratica en las posiciones [3, 7, 11, 15, 19, 23], junto con los MLP y los embeddings del decodificador, que permanecen intactos.

El entrenamiento consistio en destilacion de conocimiento desde el modelo profesor en dos etapas (19 y 41 pasos, 60 en total) sobre el subconjunto de ScienceQA con imagenes. Se ejecuto en una unica NVIDIA GeForce RTX 3090 de 24 GB durante 120,9 segundos, con un pico de VRAM de 21.379 MB. Solo se guardaron los pesos modificados de atencion y los layernorms del decodificador entrenados, lo que explica el reducido tamano del artefacto (147,5 MB frente a los 1,66 GB del modelo base completo).

## Capacidades

- Generacion de texto condicionada por imagen (image-text-to-text) en formato conversacional.
- Respuesta a preguntas visuales de tipo STEM, especialmente en el formato de opcion multiple de ScienceQA.
- Razonamiento visual basico sobre figuras cientificas (diagramas, ilustraciones de ciencias naturales).
- Soporte de plantilla de chat (`chat_template.json` incluido).
- Capacidad multilingue limitada al ingles.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta modo de razonamiento extendido (thinking mode) ni capacidades de audio.
- No se documenta soporte explicito para agentes o razonamiento multi-paso.

## Casos de uso

- Investigacion sobre eficiencia de atencion: sirve como referencia reproducible para medir el impacto de sustituir atencion softmax por atencion lineal en un VLM pequeno, con telemetria de entrenamiento y metricas publicadas.
- Prototipado de VQA educativa: permite construir un demostrador de preguntas y respuestas sobre imagenes de ciencias en ingles, aceptando el nivel de precision reportado (30,63 % en ScienceQA).
- Experimentos de destilacion de conocimiento: el par profesor-alumno (LLaVA-Interleave-Qwen-0.5B frente a este checkpoint) es util para estudiar tecnicas de KD en arquitecturas hibridas.
- Despliegue en hardware muy restringido: con 147,5 MB de pesos delta y un pico de entrenamiento de 21 GB en una RTX 3090, es viable en GPUs de consumo para pruebas de inferencia, aunque no se publican cifras de latencia.
- Benchmarking de operadores de atencion: el manifiesto quirurgico (`surgical_manifest.json`) y la implementacion de referencia en NeuralOps permiten integrarlo en comparativas de operadores gated.
- Docencia y formacion: sirve para ilustrar el compromiso entre compresion de artefacto (11,53x mas pequeno) y perdida de precision en tareas multimodales.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Metrica | Profesor (base) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Precision (%) | 63,75 | 43,75 | 30,63 | -13,12 |
| Perplejidad | 2,45 | 2.622,72 | 5,25 | -2.617,47 |

Dataset: ScienceQA, subconjunto con imagenes, split de validacion (`derek-thomas/ScienceQA`). Tarea: visual question answering.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el entrenamiento uso 21.379 MB en una RTX 3090, pero la inferencia requiere cargar el modelo base completo ademas del delta de atencion.
- GPU recomendadas: no disponibles. El unico dato de hardware publicado es la RTX 3090 (24 GB) usada para el entrenamiento.
- Cabe en GPU de consumo: si, segun la telemetria de entrenamiento en RTX 3090; no se confirma para GPUs con menos de 24 GB.
- Opciones de despliegue: la model card solo documenta la API `neuralops.hub.load_surgeried_model` de la libreria NeuralOps. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-hla-attention-scienceqa | 0,5 B (delta de atencion) | no disponible | 30,63 % | MIT | Hugging Face |
| llava-hf/llava-interleave-qwen-0.5b-hf (profesor) | 0,5 B | no disponible | 63,75 % | no disponible en la informacion | Hugging Face |
| Otros VLM de ~0,5 B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos publicados de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Caida de precision significativa: 30,63 % frente al 63,75 % del profesor en ScienceQA (13,12 puntos menos), lo que lo aleja del estado del arte incluso en su tarea objetivo.
- Artefacto incompleto: el repositorio solo contiene los pesos delta de atencion (147,5 MB); es necesario cargar el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` para la inferencia completa.
- Entrenamiento muy corto (60 pasos, 120,9 s): el ajuste es minimo y no garantiza convergencia ni generalizacion.
- Metricas no verificadas: la model card marca explicitamente `verified: false` en accuracy y perplexity.
- Solo ingles: no hay soporte documentado de otros idiomas.
- Sin datos de sesgos, alucinacion ni evaluaciones de seguridad.
- Dependencia de la libreria NeuralOps: no se documenta compatibilidad con el ecosistema transformers estandar.
- Uso comercial permitido por licencia MIT, pero sin garantias de calidad para produccion.
- Contexto maximo no documentado, lo que impide planificar cargas de contexto largo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-hla-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Implementacion de HLAAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/gated/hla_attention.py
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
