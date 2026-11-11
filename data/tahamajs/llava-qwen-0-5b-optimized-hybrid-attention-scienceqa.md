# tahamajs/llava-qwen-0.5b-optimized-hybrid-attention-scienceqa

## Resumen

llava-qwen-0.5b-optimized-hybrid-attention-scienceqa es un checkpoint experimental de tipo vision-language publicado por el usuario tahamajs dentro del proyecto NeuralOps. No se trata de un modelo entrenado desde cero, sino de una intervención quirúrgica sobre llava-hf/llava-interleave-qwen-0.5b-hf: se sustituye la atención cuadrática de 18 de las 24 capas del decodificador Qwen2 por un operador híbrido denominado OptimizedHybridAttention (OHA), manteniendo congelados el torreón visual SigLIP, el proyector multimodal y seis capas de anclaje cuadráticas. El resultado se ajusta mediante destilación de conocimiento sobre el subconjunto con imagen de ScienceQA.

El modelo resuelve un problema muy concreto: explorar si es posible reducir el coste computacional y el peso en disco de un VLM pequeño sin destruir su capacidad de razonamiento visual sobre preguntas de ciencia. El artefacto serializado ocupa 261,94 MB en FP16 frente a los 1,66 GB del modelo base, una reducción del 84,6 %. Sin embargo, ese ahorro se refiere únicamente a los pesos de atención modificados, no a un modelo autónomo listo para producción: requiere la librería `neuralops` y el checkpoint base para reconstruirse.

Es relevante ahora como ejemplo de "attention surgery" reproducible sobre arquitecturas LLaVA, con telemetría de entrenamiento explícita (220 pasos, 120,1 s, 19.771 MB de VRAM pico en una RTX 3090) y métricas declaradas de 58,13 % de accuracy y perplejidad 2,35 en ScienceQA. No obstante, se trata de un experimento académico de un solo autor, con cero descargas y sin verificación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal LLaVA: torreón visual SigLIP congelado + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas (D=1024, H=16, head_dim=64); 18/24 capas con atención híbrida OptimizedHybridAttention |
| Parametros totales | No disponible (el modelo base LLaVA-Interleave-Qwen-0.5B ronda los 0,5B, pero la ficha no declara el recuento exacto) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos se serializan en FP16; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16, solo deltas de atención) + `surgical_manifest.json` (`schema_version=neuralops.surgery/v2`, 570 tensores) |

## Arquitectura y entrenamiento

La arquitectura parte de LLaVA-Interleave-Qwen-0.5B: un torreón visual SigLIP de 27 capas congelado, un proyector multimodal MLP de dos capas también congelado y un decodificador Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas de atención y dimensión por cabeza 64. La intervención reemplaza el módulo `self_attn` en 18 de las 24 capas por el operador `OptimizedHybridAttention` (familia `hybrid`, configuración `hybrid_3_1`), y conserva como anclas cuadráticas las capas `[3, 7, 11, 15, 19, 23]`. También se entrenan las capas de normalización del decodificador. Los MLP, embeddings y el torreón visual permanecen intactos.

El ajuste se realizó en dos etapas (92 + 128 pasos, 220 en total) sobre el subconjunto con imagen de ScienceQA, con destilación de conocimiento desde el modelo profesor (el LLaVA-Qwen-0.5B original). La telemetría declarada indica 120,1 segundos de entrenamiento y un pico de 19.771 MB de VRAM en una NVIDIA RTX 3090 de 24 GB. El resultado pasa de 34,38 % de accuracy en zero-shot tras la cirugía a 58,13 % tras la destilación, frente al 63,75 % del profesor; la perplejidad baja de 3,93 a 2,35, incluso por debajo del 2,45 del profesor. No se documentan detalles sobre composición exacta del dataset, hiperparámetros de destilación ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) mediante el pipeline declarado `image-text-to-text`.
- Respuesta a preguntas visuales de tipo STEM, especialmente las del formato ScienceQA (preguntas de opción múltiple con figura adjunta).
- Razonamiento multimodal básico sobre diagramas científicos, dado el ajuste específico en ese dominio.
- Conversación multi-turno según la etiqueta `conversational` y la plantilla de chat incluida (`chat_template.json`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés.
- Modo thinking, visión avanzada, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Investigación sobre eficiencia de atención en VLMs: el checkpoint sirve para reproducir el experimento de sustituir atención cuadrática por híbrida en 18 de 24 capas y medir el impacto en accuracy y perplejidad sobre ScienceQA. Es su uso principal y el único respaldado por métricas.
- Evaluación comparativa de operadores de atención: al conservar seis capas de anclaje cuadráticas y un manifiesto quirúrgico explícito, permite aislar el efecto de OHA frente a la atención estándar en un mismo esqueleto LLaVA-Qwen.
- Docencia y divulgación sobre destilación de conocimiento: la telemetría (220 pasos, 120 s, 19,7 GB de VRAM) y el delta de accuracy (+23,75 puntos) ofrecen un caso de estudio reproducible en una única RTX 3090.
- Prototipado de asistentes educativos de ciencias: con 58,13 % de accuracy en ScienceQA, puede emplearse como base para experimentos de tutoría sobre preguntas con figura, siempre con validación humana y sin asumir precisión de producción.
- Pruebas de integración con la librería `neuralops`: el artefacto valida el flujo `load_surgeried_model` y el esquema `neuralops.surgery/v2`, útil para quienes desarrollan herramientas de cirugía de modelos.
- Análisis de compresión de artefactos: la reducción de 1,66 GB a 261,94 MB (-84,6 %, 6,5x) permite estudiar el equilibrio entre tamaño en disco y calidad en despliegues con almacenamiento restringido.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), sobre ScienceQA, subconjunto con imagen, split de validación:

| Metrica | Profesor (base) | Zero-shot tras cirugía | Final tras destilación | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 34,38 | 58,13 | +23,75 |
| Perplejidad | 2,45 | 3,93 | 2,35 | -1,58 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma directa; el entrenamiento consumió 19.771 MB pico en una RTX 3090, pero no se documenta el consumo en inferencia.
- GPU recomendadas: el autor valida el flujo en NVIDIA RTX 3090 (24 GB). Para el modelo base de 0,5B en FP16, una GPU consumer de 8-12 GB debería ser suficiente, aunque no se confirma en la ficha.
- ¿Cabe en GPU consumer? Sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB o superiores, dado el tamaño del modelo base; sin cifras oficiales.
- Opciones de despliegue: la ficha solo documenta la API `neuralops.hub.load_surgeried_model`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y al requerir la reconstrucción del modelo base no es un artefacto autónomo estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (img, val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tahamajs/llava-qwen-0.5b-optimized-hybrid-attention-scienceqa | ~0,5B (no confirmado) | No disponible | 58,13 % acc / 2,35 PPL | MIT | HF, requiere `neuralops` |
| llava-hf/llava-interleave-qwen-0.5b-hf (profesor) | ~0,5B | No disponible | 63,75 % acc / 2,45 PPL | No disponible en la ficha | HF, transformers |
| Otros VLM pequeños (p. ej. SmolVLM, Qwen2-VL-2B) | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa con alternativas externas no está disponible en la información proporcionada; solo se puede contrastar contra el modelo profesor, que supera al checkpoint destilado en 5,62 puntos de accuracy aunque con peor perplejidad.

## Limitaciones y advertencias

- El artefacto contiene únicamente los pesos de atención modificados (261,94 MB); no es un modelo autónomo y exige el checkpoint base `llava-hf/llava-interleave-qwen-0.5b-hf` y la librería `neuralops` para funcionar.
- Pérdida de 5,62 puntos de accuracy respecto al profesor en ScienceQA; no es una mejora, sino una aproximación con menor coste.
- Ajuste sobre un único dataset (ScienceQA) y un único dominio (STEM con imagen); se desconoce la generalización a otras tareas visuales.
- Solo inglés; sin soporte multilingüe declarado.
- Riesgo de alucinación no cuantificado; no se han publicado evaluaciones de sesgo, toxicidad ni robustez.
- Cero descargas y cero likes en el momento de la ficha; sin revisión independiente de las métricas (`verified: false` en el model-index).
- Licencia MIT, lo que permite uso comercial, pero la licencia del modelo base debe verificarse por separado antes de producción.
- No se documentan longitudes de contexto, cuantizaciones ni opciones de despliegue estándar (vLLM, llama.cpp), lo que limita su uso fuera del ecosistema NeuralOps.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-optimized-hybrid-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/hybrid/optimized_hybrid_attention.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
