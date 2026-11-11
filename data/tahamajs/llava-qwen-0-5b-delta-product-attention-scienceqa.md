# tahamajs/llava-qwen-0.5b-delta-product-attention-scienceqa

## Resumen

`llava-qwen-0.5b-delta-product-attention-scienceqa` es un checkpoint experimental publicado por el usuario tahamajs bajo el paraguas del proyecto NeuralOps, una "attention surgery zoo" que sustituye mecanismos de atención en modelos existentes para estudiar variantes lineales y gated. El modelo parte de `llava-hf/llava-interleave-qwen-0.5b-hf`, un VLM de 0,5 mil millones de parámetros con torre visual SigLIP congelada, proyector MLP de dos capas y decodificador Qwen2 de 24 capas (D=1024, H=16, head_dim=64), y reemplaza la atención de 18 de esas 24 capas por el operador `DeltaProductAttention`, basado en productos de reflexiones ortogonales de Householder acumuladas sobre la secuencia.

El objetivo no es ofrecer un modelo de producción, sino un artefacto reproducible para investigar el comportamiento de mecanismos de atención alternativos en tareas de razonamiento visual multimodal. La evaluación se realiza sobre el subconjunto con imagen de ScienceQA (split de validación), un benchmark de preguntas STEM que requiere combinar contexto visual y textual.

El resultado es llamativo por su carácter negativo: el modelo obtiene un 35,62 % de accuracy frente al 63,75 % del modelo profesor original, y una perplejidad de 1.823.153,49 frente a 2,45 del profesor. El checkpoint ocupa 180,83 MB en disco (frente a 1,66 GB del base completo), lo que supone una reducción del 89,4 %. Es, por tanto, un experimento de compresión e intervención arquitectónica con pérdida severa de calidad, útil como referencia negativa y como banco de pruebas del framework NeuralOps.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (torre visual SigLIP congelada + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas) con atención `DeltaProductAttention` en 18/24 capas (esquema `hybrid_3_1`) |
| Parametros totales | 0,5 mil millones (modelo base); el artefacto serializado contiene solo los pesos delta de atención modificados (180,83 MB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos delta en FP16 safetensors) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, pesos delta FP16) |

## Arquitectura y entrenamiento

La arquitectura base es LLaVA-Interleave sobre Qwen2-0.5B: una torre visual SigLIP de 27 capas congelada, un proyector multi-modal de dos capas MLP y un decodificador Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas y head_dim 64. La intervención quirúrgica sustituye el mecanismo de self-attention en 18 de las 24 capas del decodificador por `DeltaProductAttention`, un operador de la familia gated que mantiene el estado mediante reflexiones ortogonales de Householder acumuladas a lo largo de la secuencia, con isometría estricta, espectro acotado y preservación de norma. Se conservan seis capas de atención cuadrática como anclas en los índices [3, 7, 11, 15, 19, 23], siguiendo el esquema `hybrid_3_1`. Permanecen congelados la torre visual, el proyector, los MLP del decodificador y los embeddings; solo se entrenan las atenciones modificadas y los layernorms del decodificador.

El entrenamiento consistió en destilación de conocimiento en dos etapas (26 pasos en la etapa 1 y 56 en la etapa 2, 82 pasos totales) sobre una NVIDIA RTX 3090 de 24 GB, con un tiempo total de 120,4 segundos y un pico de VRAM de 16.645 MB. El dataset utilizado es `derek-thomas/ScienceQA`. A pesar de la destilación, la tabla de evaluación del autor indica que la etapa de KD no aportó mejora alguna sobre el estado pre-KD (delta +0,00 % en accuracy y +0,00 en perplejidad), lo que sugiere que el proceso de ajuste no logró recuperar el comportamiento del profesor.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) mediante el pipeline LLaVA estándar.
- Respuesta a preguntas visuales de tipo STEM, orientada al formato de ScienceQA (selección de opción y respuesta corta).
- Conversación multi-turno con plantilla de chat (`chat_template.json` incluido).
- Procesamiento de imágenes con preprocesador propio (`preprocessor_config.json`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés (`language: en`).
- Capacidades especiales (thinking mode, audio, vídeo): no disponibles.
- El modelo es un artefacto de investigación sobre atención; no se documentan capacidades adicionales más allá del pipeline VLM heredado.

## Casos de uso

- Investigación sobre mecanismos de atención alternativos: sirve como punto de comparación controlado frente al modelo base `llava-interleave-qwen-0.5b-hf` para medir el impacto de sustituir atención cuadrática por `DeltaProductAttention` en 18 de 24 capas.
- Reproducción de experimentos de "attention surgery": el repositorio incluye `surgical_manifest.json` con la topología exacta de las capas modificadas, lo que permite replicar o extender la intervención sobre otros checkpoints.
- Estudio de compresión de artefactos: con 180,83 MB frente a 1,66 GB del base, es un caso práctico para analizar el equilibrio entre reducción de tamaño y degradación de calidad.
- Benchmarking negativo en ScienceQA: útil como baseline de referencia para demostrar qué ocurre cuando la destilación no recupera el rendimiento del profesor (35,62 % frente a 63,75 %).
- Docencia y divulgación: ejemplo didáctico de cómo una modificación arquitectónica agresiva sin ajuste suficiente colapsa la perplejidad (de 2,45 a 1,82 millones).
- Pruebas de integración del framework NeuralOps: el snippet de carga vía `neuralops.hub.load_surgeried_model` permite validar el pipeline de carga de modelos "surgeridos" en entornos de desarrollo.
- No se recomienda su uso en producción para tareas reales de VQA, atención al cliente, generación de código ni aplicaciones sensibles, dado el bajo rendimiento medido.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Metrica | Profesor (base) | Pre-KD | Post-KD (final) | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) en ScienceQA (subconjunto con imagen, validación) | 63,75 | 35,62 | 35,62 | +0,00 |
| Perplejidad en ScienceQA (subconjunto con imagen, validación) | 2,45 | 1.823.153,49 | 1.823.153,49 | +0,00 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El entrenamiento usó 16.645 MB de pico en una RTX 3090; la inferencia del modelo base de 0,5 B en FP16 debería caber holgadamente en GPUs de consumo, pero el artefacto publicado son solo pesos delta y requiere cargar el modelo base completo.
- GPU recomendadas: NVIDIA RTX 3090 (usada en el entrenamiento); cualquier GPU con al menos 8-16 GB para el modelo base en FP16.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060/4060 y superiores, aunque no se documenta una medición directa de inferencia.
- Opciones de despliegue: el modelo está empaquetado para la librería `neuralops` (carga vía `neuralops.hub.load_surgeried_model`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (acc.) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| `tahamajs/llava-qwen-0.5b-delta-product-attention-scienceqa` | 0,5 B (delta) | no disponible | 35,62 % | MIT | Hugging Face |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | 0,5 B | no disponible | 63,75 % | no disponible en la información | Hugging Face |
| Otros VLM de ~0,5 B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación documentada es contra el propio modelo base, que supera al checkpoint modificado en 28,13 puntos de accuracy y reduce la perplejidad en más de seis órdenes de magnitud.

## Limitaciones y advertencias

- Degradación severa de calidad: 35,62 % de accuracy frente al 63,75 % del profesor, y perplejidad de 1,82 millones frente a 2,45.
- La destilación de conocimiento no aportó ninguna mejora medible (delta +0,00 en ambas métricas), lo que indica un fallo del proceso de ajuste o una incompatibilidad entre el operador y la tarea.
- El artefacto contiene solo pesos delta de atención (180,83 MB); para usarlo hay que cargar el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` y aplicar la cirugía descrita en `surgical_manifest.json`.
- Requiere la librería `neuralops`, no estándar en el ecosistema; no se documenta compatibilidad con transformers, vLLM o llama.cpp.
- Solo soporta inglés.
- Riesgo elevado de alucinación y respuestas incoherentes dada la perplejidad observada.
- Sesgos conocidos: no documentados, pero hereda los del modelo base Qwen2 y del dataset ScienceQA.
- Licencia MIT permite uso comercial del artefacto, pero el modelo base puede tener condiciones propias que deben verificarse por separado.
- No apto para producción: es un experimento de investigación con métricas negativas y sin verificación independiente.
- Longitud de contexto no documentada; no asumir la del modelo base sin comprobación.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-delta-product-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/gated/flagship_fla.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset: https://huggingface.co/datasets/derek-thomas/ScienceQA
