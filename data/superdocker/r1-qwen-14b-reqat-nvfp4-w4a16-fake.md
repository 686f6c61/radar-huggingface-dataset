# superdocker/R1-Qwen-14B-ReQAT-nvfp4-w4a16-fake

## Resumen

R1-Qwen-14B-ReQAT-nvfp4-w4a16-fake es un checkpoint de investigación publicado por el usuario superdocker que aplica ReQAT (Reasoning-preserving Quantization-Aware Training) sobre el modelo destilado deepseek-ai/DeepSeek-R1-Distill-Qwen-14B. El objetivo es preservar la capacidad de razonamiento del modelo original bajo una cuantización de pesos a 4 bits con activaciones a 16 bits (W4A16) en formato NVFP4. Se trata de un artefacto de tipo *fake-quantized*, es decir, los pesos se almacenan en BF16 safetensors con la arquitectura estándar Qwen2ForCausalLM, sin empaquetado nativo FP4 ni bloque `fake_quant_config`.

El modelo base es un transformer decoder-only de la familia Qwen2 con 14.770.033.664 parámetros (~14,8 mil millones), destilado de DeepSeek-R1 para tareas de razonamiento. ReQAT combina tres técnicas: Trace-Aligned QAT, Selective Entropy Minimization e inicialización cuantización-amigable mediante transformaciones, con el fin de mantener la precisión de razonamiento bajo FP4. El ajuste se realizó sobre el subconjunto de matemáticas del dataset OpenThoughts3-1.2M.

La relevancia de esta ficha es doble: por un lado, documenta un caso práctico de QAT para FP4 sobre GPUs Hopper y Blackwell; por otro, advierte de que el release *fake-quantized* no aporta por sí mismo las ventajas de memoria y throughput de un 4 bits nativo. El paper asociado (ICML 2026) reporta un 68,75 % de precisión en AIME-120 para la configuración NVFP4 W4A16, aunque ese valor no ha sido verificado de forma independiente para este checkpoint concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (transformer decoder-only) |
| Parametros totales | 14.770.033.664 (~14,8 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | NVFP4 W4A16 (pesos 4 bits, activaciones 16 bits); release en formato *fake-quantized* con tensores BF16 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16, sin empaquetado nativo FP4) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2 (clase `Qwen2ForCausalLM`), heredado del destilado DeepSeek-R1-Distill-Qwen-14B, que a su vez deriva de Qwen2.5. No se trata de un modelo MoE ni de una arquitectura híbrida SSM: es un transformer denso de aproximadamente 14,8 mil millones de parámetros. El checkpoint liberado conserva la arquitectura estándar Qwen2 y almacena los tensores en BF16; no declara la arquitectura personalizada W4A4KV4 que sí aparece en otras variantes del proyecto ReQAT.

El entrenamiento aplica ReQAT, una metodología de cuantización consciente del entrenamiento que integra Trace-Aligned QAT (alineación de trazas de razonamiento durante el ajuste), Selective Entropy Minimization (minimización selectiva de entropía) e inicialización cuantización-amigable mediante transformaciones. El ajuste se realizó sobre el subconjunto de matemáticas del dataset OpenThoughts3-1.2M. El objetivo declarado es preservar la precisión de razonamiento bajo cuantización FP4. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición completa del dataset ni si hubo fases de RLHF o DPO adicionales sobre el modelo base.

## Capacidades

- Generación de texto y razonamiento multi-paso, heredado del destilado de DeepSeek-R1.
- Razonamiento matemático: el ajuste se realizó sobre el subconjunto de matemáticas de OpenThoughts3-1.2M y el proyecto evalúa en MATH-500, AIME-2024, AIME-2025, AIME-90 y GSM8K.
- Generación de código: el proyecto incluye evaluación en LiveCodeBench.
- Razonamiento científico: evaluación en GPQA-Diamond.
- Modo *thinking* activable mediante la variable `ENABLE_THINKING=true` en el runtime de ReQAT.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible explícitamente; el modelo está orientado a razonamiento encadenado, pero no se documenta integración de agentes.
- Capacidades multilingües: limitadas al inglés según la model card (`language: en`).
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Investigación en cuantización de bajo bit: el checkpoint sirve como referencia para reproducir experimentos de QAT FP4 sobre modelos de razonamiento, usando el entorno ReQAT con ModelOpt, vLLM y lighteval.
- Evaluación de precisión de razonamiento bajo FP4: permite medir la degradación de accuracy en MATH-500, AIME y GSM8K comparando contra el modelo base en BF16, con temperatura 0,6 y top_p 0,95 según la configuración del proyecto.
- Estudio de la brecha entre *fake-quantized* y FP4 nativo: al almacenar tensores BF16, el checkpoint permite aislar el efecto de la QAT del efecto del empaquetado nativo, comparándolo con las variantes W4A4KV4 exportadas a TensorRT-LLM para Blackwell.
- Benchmarking de pipelines de inferencia: integración con vLLM para validar el comportamiento del modelo en entornos de serving antes de migrar a despliegues con cuantización nativa.
- Generación de soluciones matemáticas verificables: útil en pipelines de evaluación automática donde se necesita un modelo con trazas de razonamiento explícitas y capacidad de cómputo simbólico paso a paso.
- Educación e investigación académica: reproducción de resultados del paper ICML 2026 sobre ReQAT y extensión a otros dominios del dataset OpenThoughts3-1.2M.

## Benchmarks y rendimiento

El paper asociado (ICML 2026, Table 3) reporta los siguientes datos para la configuración NVFP4 W4A16 de R1-Qwen-14B:

| Benchmark | Resultado reportado | Notas |
|---|---|---|
| AIME-120 | 68,75 % | Configuración del paper; no verificado de forma independiente para este checkpoint |

No se han publicado en la información disponible resultados adicionales de MMLU, HumanEval, GSM8K, GPQA-Diamond ni LiveCodeBench para este checkpoint concreto. El proyecto ReQAT soporta esos benchmarks en su runtime, pero los valores numéricos no se incluyen en la documentación proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: al almacenarse en BF16, el checkpoint requiere aproximadamente 29,6 GB solo para los pesos (tamaño del repo), más KV cache y buffers de runtime. No se beneficia de la reducción de memoria de un FP4 nativo.
- GPU recomendadas: el proyecto está orientado a GPUs NVIDIA de generación Hopper (H100, H200) o superior, incluida Blackwell (B200). El runtime de ReQAT asume estas arquitecturas.
- GPU de consumo: no se documenta soporte para GPUs consumer (RTX 4090, etc.) en el runtime de ReQAT; el tamaño en BF16 (~30 GB) excede la VRAM de la mayoría de GPUs consumer de 24 GB.
- Opciones de despliegue: el flujo oficial es el repositorio ReQAT con ModelOpt, vLLM y lighteval, fijado al commit `55038ae6ac807a33f9192a25a03f54a03789d21e`. Para throughput nativo en Blackwell existe la ruta `deploy/trtllm/` del proyecto, aunque TensorRT-LLM estándar no reproduce el comportamiento E1M2 de KV cache ni el K-shift de ReQAT.
- Latencia y throughput: no disponibles en la información proporcionada. El release *fake-quantized* no establece por sí mismo ganancias de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| R1-Qwen-14B-ReQAT-nvfp4-w4a16-fake | ~14,8 B | no disponible | NVFP4 W4A16 (fake-quant) | MIT | Hugging Face |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-14B | ~14,8 B | no disponible | BF16 | MIT | Hugging Face |
| Qwen2.5-14B (base upstream) | ~14,8 B | no disponible | BF16, GPTQ, AWQ | Apache 2.0 | Hugging Face |

La comparativa directa con alternativas cuantizadas de la misma categoría (por ejemplo, variantes GPTQ o AWQ de Qwen2.5-14B) no está disponible en la información proporcionada. La diferencia principal frente al modelo base es la QAT orientada a FP4, que busca preservar el razonamiento matemático; frente a Qwen2.5-14B, el modelo incorpora la destilación de DeepSeek-R1 y el ajuste ReQAT.

## Limitaciones y advertencias

- El checkpoint es *fake-quantized*: los pesos se almacenan en BF16, por lo que no ofrece reducción de memoria ni ganancias de throughput respecto a un FP4 nativo.
- El valor de 68,75 % en AIME-120 corresponde a la configuración del paper y no ha sido verificado de forma independiente para este checkpoint concreto.
- El modelo solo declara soporte de inglés (`language: en`); el rendimiento en castellano u otros idiomas no está documentado.
- Riesgo de alucinación y respuestas incorrectas, sesgadas o engañosas: la model card exige verificación de las salidas.
- Uso previsto limitado a investigación en razonamiento, experimentos de cuantización y evaluación de benchmarks; no se documenta validación para producción.
- El runtime oficial depende de un commit concreto del repositorio ReQAT y de GPUs Hopper o Blackwell; TensorRT-LLM estándar no reproduce el comportamiento del runtime de investigación y la accuracy puede diferir.
- La licencia es MIT, pero el modelo base deriva de Qwen2.5 (Apache 2.0) y de DeepSeek-R1 (MIT); deben conservarse los avisos de atribución y licencia upstream.
- El número de descargas (6) y de likes (0) indica que es un artefacto de investigación con validación comunitaria mínima.

## Enlaces

- Hugging Face: https://huggingface.co/superdocker/R1-Qwen-14B-ReQAT-nvfp4-w4a16-fake
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-14B
- Dataset: https://huggingface.co/datasets/open-thoughts/OpenThoughts3-1.2M
- Paper ICML 2026 (PMLR): https://proceedings.mlr.press/v306/lee26an.html
- arXiv: https://arxiv.org/abs/2606.15682
- Repositorio de código ReQAT: https://github.com/aiha-lab/ReQAT
- Script de inferencia: https://github.com/aiha-lab/ReQAT/blob/55038ae6ac807a33f9192a25a03f54a03789d21e/inference.py
- Ruta TensorRT-LLM: https://github.com/aiha-lab/ReQAT/tree/55038ae6ac807a33f9192a25a03f54a03789d21e/deploy/trtllm
- Licencia del código ReQAT: https://github.com/aiha-lab/ReQAT/blob/55038ae6ac807a33f9192a25a03f54a03789d21e/LICENSE
- Sección de licencia del modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-14B#7-license
