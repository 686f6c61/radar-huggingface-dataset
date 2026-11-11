# tahamajs/llava-qwen-0.5b-orion-scienceqa

## Resumen

llava-qwen-0.5b-orion-scienceqa es un checkpoint experimental publicado por el usuario tahamajs dentro del proyecto NeuralOps, un marco de trabajo orientado a la "cirugía de atención" (attention surgery) en modelos multimodales. El modelo parte de llava-hf/llava-interleave-qwen-0.5b-hf, un vision-language model de LLaVA que combina una torre de visión SigLIP congelada, un proyector MLP de dos capas y un decodificador Qwen2 de 24 capas, y sustituye la atención cuadrática de 18 de esas 24 capas por el operador ORIONAttention (familia SSM).

El objetivo declarado no es superar al modelo base, sino demostrar una técnica de compresión y sustitución arquitectónica: reemplazar bloques de self-attention por operadores de estado (SSM) manteniendo solo los pesos modificados en disco. El artefacto resultante pesa 53,12 MB frente a los 1,66 GB del modelo base en FP16, una reducción del 96,9 %.

Es relevante ahora como pieza de investigación reproducible sobre eficiencia arquitectónica en VLMs de pequeño tamaño, aunque sus resultados empíricos son claramente deficitarios: la precisión en ScienceQA cae del 63,75 % del profesor al 26,88 % del modelo destilado, sin mejora tras la fase de knowledge distillation.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: SigLIP vision tower (27 capas, congelada) + MLP projector de 2 capas + decodificador Qwen2 de 24 capas con 18 capas sustituidas por ORIONAttention (familia SSM) y 6 capas de atención cuadrática ancla [3, 7, 11, 15, 19, 23] |
| Parámetros totales | 0,5 B (modelo base); el artefacto publicado contiene solo los pesos quirúrgicos (336 tensores, 55.696.104 bytes) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (los pesos se serializan en FP16, formato `attention_only_fp16`) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, FP16, solo deltas quirúrgicos) + `surgical_manifest.json` |

## Arquitectura y entrenamiento

El modelo hereda la topología LLaVA-Interleave de Qwen-0.5B: torre de visión SigLIP congelada de 27 capas, proyector multi-modal MLP de dos capas y decodificador Qwen2 con dimensión oculta D=1024, 16 cabezas de atención y head_dim=64. Sobre esta base, la "cirugía" sustituye 18 de las 24 capas del decodificador por el operador ORIONAttention (Optimized Rectified Input-aware Orthogonal Network), un módulo de la familia SSM implementado en `neuralops/layers/ssm/orion.py`. Se conservan 6 capas con atención cuadrática completa como anclas (índices 3, 7, 11, 15, 19 y 23), configurando un esquema híbrido 3:1.

El entrenamiento se realizó con knowledge distillation en dos etapas sobre ScienceQA (subconjunto de validación con imágenes STEM), con 42 pasos en la etapa 1 y 77 en la etapa 2 (119 pasos totales), durante 120,8 segundos en una NVIDIA RTX 3090 con un pico de VRAM de 14.782 MB. Permanecen congelados y excluidos del artefacto la torre de visión, el proyector, las 6 capas ancla, los MLP y los embeddings. El checkpoint final no mejora al modelo previo a la destilación: precisión idéntica (26,88 %) y perplejidad idéntica (11,51), lo que sugiere que la fase de KD no aportó señal útil en esta configuración.

## Capacidades

- Generación de texto e image-text-to-text: responde preguntas sobre imágenes en formato conversacional.
- Razonamiento visual básico en dominios STEM (ciencia, tecnología, ingeniería y matemáticas) orientado a ScienceQA.
- Respuesta de opción múltiple: el prompt de ejemplo pide responder con la letra de la opción.
- Soporte de chat multi-turno mediante `chat_template.json` incluido en el repositorio.
- Capacidad multilingüe: limitada al inglés.
- Tool calling / function calling: no disponible.
- Modo thinking o razonamiento extendido: no disponible.
- Capacidades de audio: no disponibles.
- Soporte de agentes y multi-step reasoning: no disponible.

## Casos de uso

- Investigación sobre eficiencia arquitectónica: sirve como referencia reproducible para estudiar el impacto de sustituir self-attention por operadores SSM en VLMs pequeños; el manifest quirúrgico (`surgical_manifest.json`, `schema_version=neuralops.surgery/v2`) documenta exactamente qué tensores se modificaron.
- Benchmarking de técnicas de compresión: permite comparar el artefacto de 53,12 MB con el base de 1,66 GB y medir la degradación de precisión asociada a una reducción del 96,9 % en peso en disco.
- Docencia y divulgación sobre attention surgery: el parche quirúrgico aislado (solo deltas de atención y layernorms) facilita explicar cómo se modifica un transformer capa a capa sin redistribuir el modelo completo.
- Pruebas de pipelines de carga con `neuralops.hub.load_surgeried_model`: útil para validar la API pública de NeuralOps y el flujo de aplicación de deltas sobre un base congelado.
- Experimentos controlados de knowledge distillation: el repositorio incluye `training_metrics.json` con telemetría (pasos, VRAM, duración) que permite reproducir el protocolo de destilación en dos etapas.
- Evaluación de robustez en VQA científico: como baseline negativo en ScienceQA para contrastar con modelos LLaVA-Qwen sin cirugía y cuantificar la pérdida de capacidad por la hibridación SSM.

## Benchmarks y rendimiento

Datos declarados por el autor en la model-index (no verificados, `verified: false`):

| Modelo | ScienceQA (image-bearing STEM, validation) Accuracy | Perplexity |
|---|---:|---:|
| Profesor (base LLaVA-Interleave-Qwen-0.5B) | 63,75 % | 2,45 |
| Pre-KD / zero-shot (tras cirugía) | 26,88 % | 11,51 |
| Post-KD / final (este checkpoint) | 26,88 % | 11,51 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto quirúrgico ocupa 53,12 MB, pero requiere cargar el modelo base LLaVA-Interleave-Qwen-0.5B (1,66 GB en FP16) para aplicar los deltas; el conjunto completo cabe holgadamente en GPUs de 8 GB o menos.
- GPU de entrenamiento documentada: NVIDIA GeForce RTX 3090 (24 GB), con pico de 14.782 MB durante la destilación.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 4-6 GB de VRAM efectiva tras aplicar los pesos del base.
- Opciones de despliegue: la vía documentada es `neuralops.hub.load_surgeried_model`; no se han publicado instrucciones para vLLM, llama.cpp, Ollama ni TGI, y el formato de pesos quirúrgicos (solo deltas de atención) no es directamente compatible con esos motores sin reconstruir primero el modelo completo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ScienceQA (STEM val) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| llava-qwen-0.5b-orion-scienceqa | 0,5 B | no disponible | 26,88 % acc / 11,51 PPL | MIT | Hugging Face (NeuralOps) |
| llava-hf/llava-interleave-qwen-0.5b-hf (base) | 0,5 B | no disponible | 63,75 % acc / 2,45 PPL | no disponible en la información | Hugging Face |
| Otros VLMs de ~0,5 B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Degradación severa de precisión: 26,88 % frente al 63,75 % del profesor, una caída de 36,87 puntos porcentuales en ScienceQA.
- La fase de knowledge distillation no aportó mejora alguna (delta +0,00 % en precisión y perplejidad), lo que cuestiona la utilidad práctica del checkpoint más allá de la demostración técnica.
- Perplejidad de 11,51 frente a 2,45 del base: indica una distribución de probabilidad muy degradada en la generación.
- Solo inglés; no hay soporte multilingüe declarado.
- El artefacto contiene únicamente los deltas quirúrgicos de atención y layernorms; no es un modelo autónomo y requiere el base `llava-hf/llava-interleave-qwen-0.5b-hf` para funcionar.
- Compatibilidad limitada: depende de la librería `neuralops` y de su API `load_surgeried_model`; no hay soporte documentado para motores de inferencia estándar.
- Riesgo elevado de alucinación y respuestas incorrectas en VQA científico, dado el bajo rendimiento medido.
- Sesgos: no documentados por el autor; al derivar de Qwen2 y SigLIP, hereda los sesgos de sus corpus de entrenamiento originales.
- Licencia MIT permite uso comercial, pero el estado experimental y el bajo rendimiento desaconsejan su uso en producción.
- Resultados de benchmark no verificados (`verified: false`); el autor no ha publicado evaluación independiente.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin comunidad ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-orion-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador ORION: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/ssm/orion.py
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
