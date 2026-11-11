# tahamajs/llava-qwen-0.5b-granite-hybrid-scienceqa

## Resumen

`llava-qwen-0.5b-granite-hybrid-scienceqa` es un checkpoint experimental de visión-lenguaje publicado por el usuario tahamajs dentro de su proyecto NeuralOps, un "attention surgery zoo" que aplica sustituciones quirúrgicas de capas de atención sobre modelos preentrenados. El modelo parte de `llava-hf/llava-interleave-qwen-0.5b-hf` (torre visual SigLIP congelada, proyector MLP de 2 capas y decodificador Qwen2 de 24 capas con dimensión 1024) y reemplaza la auto-atención cuadrática en 18 de las 24 capas por un bloque híbrido denominado `GraniteHybridBlock`, que combina atención, Mamba-2 y una FFN MoE con adaptadores LoRA, fusionados mediante una compuerta sigmoide.

El objetivo declarado es explorar la compresión arquitectónica y la destilación de conocimiento: reducir el coste computacional del decoder sustituyendo atención densa por ramas de estado espacial (Mamba-2) manteniendo seis capas de anclaje cuadráticas. El resultado es un artefacto de 798 MB (frente a 1,66 GB del base en FP16, un 53,1 % menos) que se distribuye como pesos delta quirúrgicos en safetensors, no como un modelo completo autónomo.

Es relevante ahora como ejemplo de investigación reproducible de cirugía de atención sobre VLMs pequeños, pero sus métricas son claramente inferiores al profesor: 33,12 % de accuracy en el subconjunto con imagen de ScienceQA frente al 63,75 % del modelo base. Se trata, por tanto, de un artefacto de experimentación, no de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: LLaVA (SigLIP + proyector MLP + decoder Qwen2) con `GraniteHybridBlock` (atención + Mamba-2 + MoE con LoRA) en 18/24 capas |
| Parametros totales | no disponible (el modelo base Qwen2-0.5B ronda los 0,5B; el checkpoint es un delta parcial) |
| Parametros activos | no disponible (la FFN MoE no detalla número de expertos ni top-k) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en FP16 safetensors) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, pesos delta quirúrgicos) + `surgical_manifest.json` |

## Arquitectura y entrenamiento

La arquitectura base es LLaVA-Interleave con Qwen2-0.5B: torre visual SigLIP de 27 capas congelada, proyector multimodal de 2 capas y decodificador de 24 capas (D=1024, H=16, head_dim=64). La cirugía sustituye la auto-atención en 18 de esas 24 capas por un `GraniteHybridBlock` con la topología `x_in → [Attention; Mamba-2] → gated fusion → MoE FFN → x_out`. La compuerta de fusión es `sigmoid(lora_alpha)`, inicializada con `lora_alpha = +6.0` (sigmoide ≈ 0,9975) para que en el paso 0 la rama Mamba contribuya prácticamente nada y el modelo arranque como atención pura, igualando al profesor. Se conservan seis capas de anclaje cuadráticas en los índices `[3, 7, 11, 15, 19, 23]`; los MLP del decoder, los embeddings, el proyector y la torre visual permanecen congelados y excluidos del guardado.

El entrenamiento consistió en destilación de conocimiento en dos etapas (42 + 92 = 134 pasos) sobre ScienceQA, ejecutada en una única RTX 3090 de 24 GB durante 120,7 s con un pico de 21.868 MB de VRAM. No se documentan el número de tokens de entrenamiento, la composición del dataset más allá de ScienceQA ni si hubo RLHF o DPO. La innovación técnica destacable es el propio mecanismo de sustitución modular con inicialización controlada de la compuerta, que permite arrancar desde el comportamiento del profesor y medir la degradación introducida por la rama híbrida.

## Capacidades

- Generación de texto e imagen-a-texto (pipeline `image-text-to-text`) sobre preguntas de ciencia con imagen.
- Razonamiento visual básico de tipo STEM: el checkpoint se evalúa en el subconjunto con imagen de ScienceQA.
- Respuesta conversacional con plantilla de chat (`chat_template.json` incluido).
- Procesamiento de imágenes mediante el preprocesador SigLIP del modelo base.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés.
- Modo thinking, visión avanzada, audio: no disponible.

## Casos de uso

- Investigación en cirugía de atención: reproducir el experimento de sustituir atención por Mamba-2 en un VLM pequeño y medir la degradación con el manifiesto `surgical_manifest.json` y las métricas de `training_metrics.json`.
- Docencia y divulgación: ilustrar cómo se inicializa una compuerta de fusión (`sigmoid(lora_alpha)`) para que un bloque híbrido arranque como atención pura, con un caso real y métricas antes/después.
- Estudio de destilación de conocimiento: analizar la caída de perplejidad de 1.245.460,23 (pre-KD) a 6,92 (post-KD) en solo 134 pasos como referencia de la dinámica de KD en modelos pequeños.
- Benchmarking de compresión: comparar el artefacto de 798 MB frente a los 1,66 GB del base para evaluar el ahorro de almacenamiento (53,1 %) a cambio de precisión.
- Prototipado de asistentes educativos de bajo coste: usar el modelo como base para experimentar con VQA de ciencia en inglés, asumiendo la baja accuracy (33,12 %) y validando antes de cualquier uso real.
- Auditoría de artefactos: emplear la estructura de pesos delta y el manifiesto para practicar la verificación de integridad y la reconstrucción de checkpoints quirúrgicos.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) en ScienceQA, subconjunto con imagen STEM, split de validación:

| Métrica | Profesor (base) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 46,25 | 33,12 | -13,13 |
| Perplejidad | 2,45 | 1.245.460,23 | 6,92 | -1.245.453,31 |

Telemetría de entrenamiento: 134 pasos (42 etapa 1, 92 etapa 2), 120,7 s, RTX 3090, pico de 21.868 MB de VRAM.

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto pesa 798,22 MB en FP16; el modelo base completo requiere del orden de 1,66 GB en FP16, más overhead de activaciones y del procesador de imagen. No se publican cifras de VRAM de inferencia.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más debería alojar el modelo base en FP16; el entrenamiento documentado se hizo en una RTX 3090 de 24 GB.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060/4060 y superiores; no verificado por el autor.
- Opciones de despliegue: la model card solo documenta la API pública `neuralops.hub.load_surgeried_model`; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ScienceQA (img) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/llava-qwen-0.5b-granite-hybrid-scienceqa` | ~0,5B (delta parcial) | no disponible | 33,12 % acc / 6,92 PPL | MIT | Hugging Face (0 descargas) |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | ~0,5B | no disponible | 63,75 % acc / 2,45 PPL | no disponible en esta ficha | Hugging Face |
| Otros VLM pequeños de la familia LLaVA | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base porque la información proporcionada no incluye datos de alternativas equivalentes.

## Limitaciones y advertencias

- Degradación severa de precisión: 33,12 % frente al 63,75 % del profesor en ScienceQA; no es apto para uso en producción sin validación adicional.
- Pesos delta, no modelo completo: el repositorio contiene únicamente los pesos quirúrgicos modificados; requiere el modelo base y la librería `neuralops` para cargarse.
- Idiomas: solo inglés; sin soporte multilingüe documentado.
- Contexto: no se especifica la longitud de contexto soportada.
- Sesgos: no documentados; hereda los del modelo base y del dataset ScienceQA.
- Riesgo de alucinación: elevado por la baja accuracy y la perplejidad de 6,92, superior a la del profesor (2,45).
- Licencia MIT: permite uso comercial, pero la licencia del modelo base debe verificarse por separado.
- Reproducibilidad: métricas marcadas como no verificadas (`verified: false`) y con solo 134 pasos de entrenamiento; tratar los resultados como preliminares.
- Sin soporte documentado de tool calling, agentes ni cuantización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-granite-hybrid-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación `GraniteHybridBlock`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/hybrid/granite_hybrid.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
