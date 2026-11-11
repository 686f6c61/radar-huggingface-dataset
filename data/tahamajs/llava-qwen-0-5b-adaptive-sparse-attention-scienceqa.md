# tahamajs/llava-qwen-0.5b-adaptive-sparse-attention-scienceqa

## Resumen

`llava-qwen-0.5b-adaptive-sparse-attention-scienceqa` es un modelo de vision-lenguaje (VLM) publicado por Taha Majlesi (usuario `tahamajs`) dentro del proyecto NeuralOps, un "zoo" experimental de cirugía de atención sobre modelos abiertos. El modelo parte de `llava-hf/llava-interleave-qwen-0.5b-hf` (encoder visual SigLIP congelado, proyector MLP de dos capas y decodificador Qwen2 de 0,5B parámetros) y sustituye 18 de las 24 capas de atención del decodificador por el operador `adaptive_sparse_attention`, manteniendo 6 capas cuadráticas de anclaje en las posiciones `[3, 7, 11, 15, 19, 23]` (patrón `hybrid_3_1`). Posteriormente se destila sobre el subconjunto con imagen de ScienceQA.

El problema que aborda es de investigación aplicada: evaluar si un mecanismo de atención subcuadrática con top-k dinámico y umbral adaptativo puede manejar el enrutamiento denso visión-texto sin degradar en exceso la calidad frente al modelo profesor. Es relevante porque cuantifica el coste de sustituir atención cuadrática por atención dispersa en un VLM pequeño, con un protocolo reproducible (solo se publican los pesos de atención y layernorm, no el modelo completo).

El resultado principal es que tras la destilación el modelo alcanza 44,14 % de exactitud visual en ScienceQA frente al 46,90 % del profesor, es decir, una pérdida de 2,76 puntos absolutos, con una perplejidad de respuesta de 2,90 (mejor que los 3,85 del profesor). El repositorio ocupa 0,6 GB y la licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM LLaVA: encoder visual SigLIP congelado + proyector MLP (2 capas) + decodificador Qwen2 de 24 capas con atencion `adaptive_sparse_attention` en 18 capas y atencion cuadratica en 6 capas de anclaje (`hybrid_3_1`) |
| Parametros totales | no disponible (modelo base LLaVA-Interleave Qwen 0.5B; el repo solo publica pesos de atencion y layernorm de 570,67 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se publican en FP16) |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, FP16, 570,67 MB); requiere cargar el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` y aplicar la cirugia de atencion |
| Geometria del decodificador | 24 capas, `D=1024`, `H=16`, `d_h=64` |
| Libreria | `neuralops` |
| Tamano del repo | 0,6 GB |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema `LlavaForConditionalGeneration`: los parches visuales extraidos por el encoder SigLIP congelado se intercalan con los tokens de texto dentro de las capas del modelo de lenguaje. El cambio central es la "cirugia de atencion": se reemplazan 18 de las 24 capas de atencion del decodificador Qwen2 por `AdaptiveSparseAttention`, un operador que implementa atención dispersa adaptativa con top-k dinámico y umbral, adaptadores LoRA, extracción de pesos multi-arquitectura, embeddings rotatorios RoPE y máscaras causales/bidireccionales. Las 6 capas restantes mantienen atención cuadrática como anclas. El encoder visual y el proyector multimodal permanecen completamente congelados, de modo que el experimento aísla la capacidad del mecanismo disperso para gestionar el enrutamiento cross-modal visión-texto.

El entrenamiento es una destilación de conocimiento (KD) en dos etapas sobre el subconjunto con imagen de `derek-thomas/ScienceQA`: 134 pasos de optimización en total (47 en la etapa 1 y 87 en la etapa 2), con una duración de 120,4 s y un pico de VRAM de 19.523 MB en una NVIDIA RTX 3090 de 24 GB. No se especifican en la información disponible el número de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron RLHF o DPO.

## Capacidades

- Generación de texto e imagen-a-texto conversacional (`image-text-to-text`), con foco en razonamiento visual sobre imágenes científicas.
- Respuesta a preguntas visuales (VQA) de tipo opción múltiple, el formato de ScienceQA.
- Razonamiento multimodal básico: combina información de la imagen con el enunciado textual de la pregunta.
- Capacidad multilingüe limitada: el modelo declara únicamente inglés (`en`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo "thinking", visión adicional, audio: no disponible.
- No se documentan capacidades de generación de código o matemáticas específicas más allá de lo heredado del decodificador Qwen2 de 0,5B.

## Casos de uso

- Investigación sobre atención eficiente: el modelo sirve como banco de pruebas reproducible para medir la degradación de un VLM al sustituir atención cuadrática por atención dispersa adaptativa, con el profesor como referencia (46,90 % frente a 44,14 %).
- Evaluación de mecanismos subcuadráticos en enrutamiento cross-modal: permite analizar cómo afecta la dispersión a la fusión de tokens visuales y textuales manteniendo congelado el encoder SigLIP.
- Clasificación y respuesta a preguntas educativas sobre ciencias: con 44,14 % de exactitud visual en ScienceQA, puede usarse en prototipos de asistencia educativa limitados a preguntas de opción múltiple en inglés.
- Destilación de modelos pequeños: el pipeline de dos etapas y los pesos de atención publicados (570,67 MB) sirven de plantilla para destilar otros VLMs sobre el mismo esqueleto LLaVA-Qwen 0,5B.
- Despliegue en hardware de gama consumer para experimentación: el entrenamiento cupo en una RTX 3090 de 24 GB, lo que indica que la inferencia es viable en GPUs de consumo, aunque no se publican cifras de latencia.
- Reproducción de experimentos de "attention surgery": el repositorio incluye `training_metrics.json` y los scripts de referencia (`apply_qwen_attention_surgery`), lo que facilita replicar la cirugía en otros checkpoints.
- Análisis de calibración mediante perplejidad: la PPL de respuesta (2,90) frente a la del profesor (3,85) permite estudiar la relación entre exactitud y confianza en modelos destilados.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre `derek-thomas/ScienceQA`, split de validación, subconjunto con imagen (métricas no verificadas):

| Metrica | Profesor (`llava-interleave-qwen-0.5b`) | Zero-shot con atencion dispersa | Destilado con atencion dispersa | Delta |
|---|---:|---:|---:|---:|
| Exactitud visual ScienceQA (%) | 46,90 | 35,17 | 44,14 | +8,97 |
| Perplejidad de respuesta condicionada a imagen | 3,85 | 16.681,80 | 2,90 | -16.678,9 |

Telemetría del entrenamiento: 134 pasos de optimización (47 en etapa 1, 87 en etapa 2), 120,4 s de duración, pico de 19.523 MB de VRAM en una RTX 3090 de 24 GB, marca temporal 2026-11-11T02:35:53Z.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo base es un VLM de 0,5B parámetros con pesos en FP16 (repo de 0,6 GB), por lo que debería caber holgadamente en GPUs consumer, pero no se publican cifras de inferencia.
- VRAM de entrenamiento observada: 19.523 MB de pico en una NVIDIA RTX 3090 de 24 GB durante la destilación.
- GPU recomendadas: no disponible; la única referencia documentada es la RTX 3090 usada para el entrenamiento.
- ¿Cabe en GPU consumer? Sí, según el tamaño del modelo base y el pico de VRAM registrado, aunque no se detallan configuraciones mínimas.
- Opciones de despliegue: la model card solo documenta el flujo con `transformers` (`AutoProcessor`, `LlavaForConditionalGeneration`), `safetensors` y `huggingface_hub`, más la función `apply_qwen_attention_surgery` del repositorio NeuralOps. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (exactitud visual) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/llava-qwen-0.5b-adaptive-sparse-attention-scienceqa` | 0,5B (base) | no disponible | 44,14 % | MIT | Pesos de atencion en HF (requiere modelo base) |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | 0,5B | no disponible | 46,90 % | no disponible en la informacion | Modelo completo en HF |
| Otros modelos comparables de 0,5B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Pérdida de calidad respecto al profesor: 2,76 puntos absolutos menos de exactitud visual en ScienceQA (44,14 % frente a 46,90 %).
- El zero-shot sin destilación colapsa: 35,17 % de exactitud y una perplejidad de 16.681,80, lo que indica que el mecanismo disperso requiere el proceso de destilación para ser usable.
- Solo se publican los pesos de atención y layernorm (570,67 MB); es imprescindible descargar el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` y aplicar la cirugía con el código de NeuralOps, lo que añade dependencia de un repositorio externo.
- Modelo exclusivamente en inglés; no hay soporte multilingüe declarado.
- Evaluación limitada a un único benchmark (ScienceQA, subconjunto con imagen) y a un único split (validación); no hay datos de MMLU, HumanEval, GSM8K ni de robustez fuera de dominio.
- Métricas no verificadas (`verified: false` en el model-index): los resultados proceden del autor y no han sido reproducidos de forma independiente.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero esperables en un modelo de 0,5B entrenado sobre un corpus educativo acotado.
- Uso comercial: la licencia MIT lo permite, aunque la licencia del modelo base debe comprobarse por separado (no disponible en la información proporcionada).
- El pipeline de carga depende de `scripts.benchmarks.qwen_zoo_train_mix`, un módulo del repositorio NeuralOps no empaquetado como librería estándar; la integración en producción requiere adaptación.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-adaptive-sparse-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion de `AdaptiveSparseAttention`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/sparse/adaptive_sparse_attention.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
