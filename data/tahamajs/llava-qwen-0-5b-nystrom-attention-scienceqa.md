# tahamajs/llava-qwen-0.5b-nystrom-attention-scienceqa

## Resumen

`llava-qwen-0.5b-nystrom-attention-scienceqa` es un checkpoint experimental publicado por el usuario tahamajs dentro del proyecto NeuralOps, un marco de trabajo centrado en la cirugía de mecanismos de atención en modelos multimodales. El modelo parte de `llava-hf/llava-interleave-qwen-0.5b-hf`, un VLM compacto de LLaVA que combina una torre de visión SigLIP congelada con un decodificador Qwen2 de 24 capas (D=1024, 16 cabezas, head_dim=64). Sobre esa base se sustituye la atención cuadrática por NystromAttention (familia linear, Nyströmformer con Nyström causal por bloques) en 18 de las 24 capas del decodificador, manteniendo 6 capas ancla cuadráticas en los índices [3, 7, 11, 15, 19, 23].

El objetivo del checkpoint es demostrar que es posible recuperar buena parte de la calidad del modelo original tras una intervención agresiva de atención lineal, mediante destilación de conocimiento desde el modelo profesor. Según la model card, la precisión en ScienceQA (subconjunto STEM con imagen, validación) pasa de 40,62 % en zero-shot tras la cirugía a 56,25 % tras la destilación, frente al 63,75 % del profesor, con una perplejidad que baja de 38,42 a 2,50. El artefacto de pesos ocupa solo 147,61 MB (FP16, safetensors), un 91,3 % menos que el modelo base completo de 1,66 GB.

Es relevante ahora porque ejemplifica una línea de investigación práctica: reducir el coste computacional de VLMs pequeños mediante operadores de atención lineal y destilación, empaquetando únicamente los pesos modificados como delta quirúrgico. No obstante, es un artefacto de investigación con cero descargas y sin verificación independiente de sus métricas, por lo que no debe tratarse como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (torre de visión SigLIP congelada + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas) con atención NystromAttention en 18/24 capas y 6 capas ancla cuadráticas |
| Parametros totales | no disponible (modelo base LLaVA-Qwen-0.5B; el artefacto delta pesa 147,61 MB en FP16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se publican en FP16; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, delta quirúrgico en FP16) + `surgical_manifest.json` |

## Arquitectura y entrenamiento

La arquitectura base es LLaVA-Interleave con Qwen2-0.5B: una torre de visión SigLIP de 27 capas congelada, un proyector multimodal de 2 capas y un decodificador transformer de 24 capas con dimensión oculta 1024, 16 cabezas de atención y dimensión por cabeza de 64. La intervención quirúrgica reemplaza el mecanismo de self-attention en 18 de las 24 capas por NystromAttention, un operador de la familia linear que aproxima la atención completa mediante landmarks de Nyström con variante causal por bloques para decodificadores. Las 6 capas restantes ([3, 7, 11, 15, 19, 23]) conservan atención cuadrática como anclas, configurando un esquema híbrido 3:1. Se congelan la torre de visión, el proyector, los MLP del decodificador y los embeddings; solo se entrenan las atenciones modificadas y los layernorms del decodificador.

El entrenamiento se realizó en dos etapas de destilación de conocimiento sobre el dataset derek-thomas/ScienceQA, con 175 pasos totales (66 en la etapa 1 y 109 en la etapa 2), una duración de 120,6 segundos y un pico de VRAM de 14.366 MB en una única NVIDIA RTX 3090. No se documentan el número de tokens de entrenamiento, la composición exacta del dataset más allá de ScienceQA, ni el uso de RLHF o DPO. La innovación principal es el empaquetado del checkpoint como delta quirúrgico: solo se serializan los tensores modificados (282 tensores, 147,61 MB), lo que reduce el artefacto un 91,3 % respecto a los 1,66 GB del modelo base completo.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) mediante el pipeline `image-text-to-text`.
- Respuesta a preguntas visuales de tipo STEM, especialmente en el formato de ScienceQA (pregunta, opciones y selección de letra).
- Razonamiento multimodal básico sobre diagramas y figuras científicas, limitado por el tamaño del modelo (0,5B).
- Conversación multi-turno mediante la plantilla de chat incluida (`chat_template.json`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés.
- Modo thinking, visión adicional, audio u otras modalidades: no disponible.

## Casos de uso

- Investigación en eficiencia de atención: el checkpoint sirve como referencia reproducible para estudiar cómo afecta la sustitución de atención cuadrática por NystromAttention en un VLM pequeño, comparando el estado pre-KD (40,62 %) y post-KD (56,25 %) sobre ScienceQA.
- Destilación de conocimiento en VLMs: útil para experimentar con pipelines de KD desde un profesor LLaVA-Qwen-0.5B hacia un alumno con atención lineal, replicando las dos etapas descritas en la model card.
- Evaluación de preguntas visuales educativas: se puede usar para prototipar asistentes de refuerzo escolar en inglés sobre preguntas de ciencia con imagen, aceptando la precisión moderada del modelo.
- Benchmarking de operadores de atención: el delta quirúrgico permite cargar solo los pesos modificados y medir latencia y perplejidad frente a la atención cuadrática en el mismo hardware (RTX 3090 o similar).
- Docencia y divulgación: ejemplo didáctico de cirugía de atención y empaquetado de deltas en formato safetensors con manifiesto de topología.
- Pruebas de despliegue ligero: con 147,61 MB de pesos delta y un modelo base de 1,66 GB, cabe en GPUs de consumo para experimentos de inferencia multimodal de bajo coste.
- Validación de pipelines NeuralOps: sirve para probar la API `neuralops.hub.load_surgeried_model` y el esquema `neuralops.surgery/v2` en entornos de investigación.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Métrica | Profesor (base) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) en ScienceQA (subconjunto STEM con imagen, validación) | 63,75 | 40,62 | 56,25 | +15,63 |
| Perplejidad en ScienceQA (subconjunto STEM con imagen, validación) | 2,45 | 38,42 | 2,50 | -35,92 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base LLaVA-Qwen-0.5B en FP16 ocupa 1,66 GB de pesos; con overhead de activaciones y torre de visión, se estima un consumo moderado, aunque no se documenta una cifra oficial. El entrenamiento consumió 14.366 MB de pico en una RTX 3090.
- GPU recomendadas: NVIDIA RTX 3090 (la usada en el entrenamiento), A100, H100 o RTX 4090 para inferencia cómoda; cualquier GPU con al menos 8 GB de VRAM debería poder cargar el modelo base en FP16.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, así como en GPUs con 8 GB o más.
- Opciones de despliegue: la model card solo documenta la API `neuralops.hub.load_surgeried_model` de la librería NeuralOps. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El único dato de telemetría es el tiempo de entrenamiento (120,6 s para 175 pasos).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ScienceQA (STEM con imagen, val.) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/llava-qwen-0.5b-nystrom-attention-scienceqa` | ~0,5B (base) | no disponible | 56,25 % (declarado, no verificado) | MIT | Hugging Face, 0 descargas |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | ~0,5B | no disponible | 63,75 % (declarado en la model card) | no disponible en la información | Hugging Face |
| Otros VLMs pequeños (p. ej. variantes LLaVA de 0,5B) | ~0,5B | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Métricas no verificadas: los resultados de ScienceQA (56,25 % de accuracy y 2,50 de perplejidad) están marcados como `verified: false` y proceden únicamente del autor.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validación por la comunidad.
- Requiere la librería NeuralOps: el checkpoint es un delta quirúrgico que depende de `neuralops.hub.load_surgeried_model` y del modelo base `llava-hf/llava-interleave-qwen-0.5b-hf`; no es un modelo autónomo cargable con `transformers` de forma directa.
- Solo inglés: no hay soporte multilingüe documentado.
- Precisión limitada: 56,25 % de accuracy en ScienceQA está por debajo del profesor (63,75 %) y muy lejos de VLMs de mayor tamaño; no es adecuado para tareas de alta fiabilidad.
- Riesgo de alucinación: inherente a modelos de 0,5B entrenados con destilación sobre un dataset específico; no se documentan evaluaciones de robustez ni de sesgos.
- Sesgos conocidos: no documentados.
- Limitaciones de contexto: la longitud de contexto no está especificada en la información disponible.
- Restricciones de licencia: MIT permite uso comercial, pero la licencia se enlaza a `https://github.com/tahamajs/NeuralOps/blob/main/LICENSE`; conviene verificar la licencia del modelo base LLaVA-Qwen-0.5B antes de un uso comercial.
- Uso previsto: investigación y experimentación en eficiencia de atención; no se recomienda para producción sin una evaluación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-nystrom-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de NystromAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/linear/nystrom_attention.py
- Licencia MIT: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
