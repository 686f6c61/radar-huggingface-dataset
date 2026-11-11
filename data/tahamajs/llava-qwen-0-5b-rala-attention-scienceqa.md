# tahamajs/llava-qwen-0.5b-rala-attention-scienceqa

## Resumen

`llava-qwen-0.5b-rala-attention-scienceqa` es un checkpoint experimental de tipo *attention surgery* publicado por el usuario tahamajs dentro del proyecto NeuralOps. Se deriva del modelo multimodal `llava-hf/llava-interleave-qwen-0.5b-hf` (torre de visión SigLIP congelada, proyector MLP de 2 capas y decodificador Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas y head_dim 64), al que se sustituye el mecanismo de atención cuadrática por un operador lineal denominado RALALinearAttention (Rank-Augmented Linear Attention) en 18 de las 24 capas del decodificador.

El objetivo del checkpoint no es ofrecer un modelo de producción, sino servir como artefacto reproducible de un experimento de compresión y destilación de conocimiento sobre un VLM de 0,5B. El autor reporta que el modelo final alcanza un 45,00 % de accuracy y una perplejidad de 3,16 sobre el subconjunto con imagen de ScienceQA (split de validación), frente a un 63,75 % y 2,45 del modelo profesor original. El delta de pesos serializado ocupa 259,69 MB en FP16, un 84,7 % menos que los 1,66 GB del base completo.

Es relevante ahora porque documenta de forma abierta una técnica concreta de sustitución de atención (linear attention con aumentación de rango) aplicada a un VLM multimodal, con telemetría de entrenamiento completa (316 pasos, 120,5 s, 13.959 MB de VRAM pico en una RTX 3090) y un manifiesto quirúrgico verificable. Su utilidad principal es como referencia metodológica y como banco de pruebas para quienes investigan eficiencia en atención y destilación offline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (torre SigLIP congelada + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas) con atención lineal RALA en 18/24 capas |
| Parametros totales | no disponible (el base es de 0,5B; el artefacto guarda solo el delta de atención) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, `weights_format=attention_only_fp16`) |

## Arquitectura y entrenamiento

La arquitectura parte de LLaVA-Interleave-Qwen-0.5B: una torre de visión SigLIP de 27 capas que permanece congelada, un proyector multimodal MLP de dos capas y un decodificador Qwen2 de 24 capas con D=1024, H=16 y head_dim=64. La intervención quirúrgica (`hybrid_3_1`) reemplaza el mecanismo de self-attention en 18 de las 24 capas por `RALALinearAttention`, un operador de la familia linear con aumentación de rango, manteniendo como anclas cuadráticas 6 capas en los índices [3, 7, 11, 15, 19, 23]. Los componentes congelados y excluidos del guardado son la torre de visión, el proyector, las MLP del decodificador, los embeddings y las 6 capas ancla.

El entrenamiento se realizó mediante destilación de conocimiento con la arquitectura de caché offline de representaciones de NeuralOps (§21.1), lo que permitió usar 0 MB de VRAM del profesor en GPU. Se ejecutaron 316 pasos en dos etapas (141 + 175) sobre una NVIDIA GeForce RTX 3090 de 24 GB, con 13.959 MB de VRAM pico y una duración total de 120,5 s. El dataset utilizado es `derek-thomas/ScienceQA`, evaluado sobre el subconjunto con imagen del split de validación. El manifiesto (`schema_version=neuralops.surgery/v2`) registra 552 tensores guardados.

## Capacidades

- Generación de texto e imagen-a-texto conversacional en inglés (pipeline `image-text-to-text`).
- Respuesta a preguntas visuales sobre imágenes con contenido STEM (ciencias, matemáticas básicas) en el formato de ScienceQA.
- Razonamiento visual de un solo turno con contexto de imagen; el modelo conserva el chat template de LLaVA-Interleave.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (thinking mode, audio, vídeo): no disponibles.

## Casos de uso

- Investigación en eficiencia de atención: el checkpoint permite comparar directamente el comportamiento de un decodificador con 18/24 capas lineales frente al base cuadrático sobre la misma tarea, usando el manifiesto para reproducir la sustitución capa a capa.
- Destilación de conocimiento en hardware de consumo: sirve como ejemplo reproducible de un pipeline de KD offline que entrena en 120,5 s con menos de 14 GB de VRAM en una RTX 3090, útil para prototipar técnicas similares en otros VLM pequeños.
- Evaluación de VQA científica de bajo coste: para experimentos académicos que necesiten un baseline ligero (259,69 MB de delta) sobre el subconjunto con imagen de ScienceQA, aceptando la caída de accuracy frente al profesor.
- Banco de pruebas de *attention surgery*: permite validar herramientas de serialización selectiva de tensores y de reconstrucción de checkpoints híbridos (lineal + cuadrático) sin cargar el modelo completo.
- Docencia y divulgación: ilustra de forma tangible el compromiso entre compresión (6,55× más pequeño) y rendimiento (45 % frente a 63,75 %) en un VLM multimodal.
- Prototipado de asistentes educativos STEM en inglés: con reservas por su accuracy limitada, puede usarse para demos internas de respuesta a preguntas sobre diagramas científicos.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre ScienceQA, subconjunto con imagen, split de validación:

| Metrica | Profesor (base) | Zero-shot tras cirugia | Final tras KD | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 40,00 | 45,00 | +5,00 |
| Perplejidad | 2,45 | 243,65 | 3,16 | -240,49 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- El artefacto publicado son solo los pesos de atención modificados (259,69 MB en FP16); para inferencia hay que cargar además el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` (1,66 GB en FP16).
- VRAM estimada para inferencia con el base completo en FP16: en torno a 3-4 GB contando pesos, activaciones y caché KV (estimación, no reportada por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16; el autor usó una RTX 3090 (24 GB) para el entrenamiento, con 13.959 MB de pico.
- Cabe en GPU de consumo: sí, en RTX 3060/4060 y superiores con 8 GB o más.
- Opciones de despliegue: el autor documenta la API `neuralops.hub.load_surgeried_model`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, y la compatibilidad con ellos no está confirmada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (img, val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/llava-qwen-0.5b-rala-attention-scienceqa` | 0,5B (delta de atención) | no disponible | 45,00 % acc / 3,16 PPL | MIT | Hugging Face |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | 0,5B | no disponible | 63,75 % acc / 2,45 PPL | no disponible en la información | Hugging Face |
| Otros VLM de ~0,5B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Caída de rendimiento significativa frente al profesor: -18,75 puntos de accuracy en ScienceQA.
- El checkpoint contiene únicamente los pesos de atención modificados; no es autocontenido y requiere el modelo base para funcionar.
- Resultados no verificados (`verified: false` en el model-index) y sin evaluación en otros benchmarks.
- Idioma limitado al inglés; no hay evidencia de capacidades multilingües.
- Riesgo elevado de alucinación en preguntas STEM fuera de la distribución de ScienceQA, dado el tamaño del modelo y la sustitución de atención.
- No hay información sobre sesgos; al derivar de Qwen2 y SigLIP, hereda los sesgos de sus datos de preentrenamiento originales.
- Licencia MIT, lo que permite uso comercial, pero sin garantías del autor y con la advertencia de que los pesos base tienen su propia licencia (no detallada aquí).
- Sin soporte documentado de tool calling, agentes ni cuantizaciones GGUF/AWQ; no apto para producción sin validación adicional.
- Longitud de contexto no especificada; no asumir la del base sin comprobarla.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-rala-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de RALALinearAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/linear/rala_attention.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
