# superdocker/R1-Qwen-14B-ReQAT-nvfp4-w4a4kv4-fake

## Resumen

R1-Qwen-14B-ReQAT-nvfp4-w4a4kv4-fake es un checkpoint de investigación publicado por el usuario superdocker en Hugging Face, derivado por fine-tuning de deepseek-ai/DeepSeek-R1-Distill-Qwen-14B. El modelo aplica ReQAT (Reasoning Quantization-Aware Training), una técnica presentada en un artículo de ICML 2026 que combina Trace-Aligned QAT, Selective Entropy Minimization e inicialización cuantización-amigable mediante transformación, con el objetivo de preservar las capacidades de razonamiento del modelo original bajo cuantización de coma flotante de 4 bits (NVFP4).

La arquitectura subyacente es Qwen2 (transformer decoder-only) con 14.770.033.664 parámetros totales, heredada del destilado de DeepSeek-R1 sobre Qwen2.5-14B. El checkpoint se distribuye como cuantización falsa (fake quantization): los tensores se almacenan en BF16 safetensors, pero la configuración activa `cfg=nvfp4`, `kv_cfg=nvfp4_e1m2`, `kv_quant=true` y `shift_k=true`, de modo que el runtime de ReQAT aplica la cuantización simulada de pesos, activaciones y caché KV en tiempo de inferencia. El repositorio ocupa 29,6 GB y está pensado para GPUs NVIDIA Hopper (H100/H200) o posteriores, incluida Blackwell (B200).

Su relevancia es fundamentalmente investigadora: permite reproducir y evaluar el comportamiento de un modelo de razonamiento de 14B bajo cuantización W4A4KV4 sin necesidad de pesos nativos de 4 bits, y sirve como base para estudiar la degradación de accuracy en tareas matemáticas y de código. No es un modelo listo para producción con Transformers estándar ni con un cargador vLLM sin modificaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only); clase de checkpoint `Qwen2FakeQuantizedModelOPTForCausalLM` |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A4KV4 (4 bits en pesos, activaciones y caché KV); KV cache en `nvfp4_e1m2`; almacenamiento en BF16 con cuantización falsa aplicada en runtime |
| Idiomas soportados | en |
| Licencia | MIT (modelo base DeepSeek-R1-Distill-Qwen-14B bajo MIT, derivado de Qwen2.5 bajo Apache 2.0) |
| Formato de pesos | safetensors (BF16, cuantización falsa) |

## Arquitectura y entrenamiento

El modelo parte de DeepSeek-R1-Distill-Qwen-14B, un transformer decoder-only de la familia Qwen2 con 14,77 mil millones de parámetros, destilado por DeepSeek a partir de su modelo R1 para tareas de razonamiento. Sobre esa base, ReQAT aplica un pipeline de Quantization-Aware Training con tres componentes: Trace-Aligned QAT (alineación de las trazas de razonamiento durante el entrenamiento con cuantización), Selective Entropy Minimization (minimización selectiva de entropía para estabilizar la distribución de salida bajo baja precisión) y Quantization-Friendly Initialization via Transformation (inicialización de pesos transformados para reducir el error de cuantización desde el arranque).

El entrenamiento utiliza el subconjunto de matemáticas del dataset open-thoughts/OpenThoughts3-1.2M y, según el artículo, emplea 350 millones de tokens de entrenamiento en la configuración completa (TAQ + Q-FIT + SEM). El checkpoint liberado activa además un desplazamiento de claves post-RoPE (`shift_k=true`) que forma parte del comportamiento del runtime ReQAT y no está implementado en TensorRT-LLM estándar ni en vLLM sin modificaciones, lo que condiciona la reproducibilidad de resultados fuera del entorno oficial.

## Capacidades

- Generación de texto y razonamiento multi-paso en modo thinking (`ENABLE_THINKING=true` en el script de inferencia).
- Resolución de problemas matemáticos de competición (MATH-500, AIME-2024, AIME-2025, AIME-90, GSM8K).
- Razonamiento científico y de conocimiento general (GPQA-Diamond).
- Generación y evaluación de código (LiveCodeBench).
- Conversación multi-turno (pipeline_tag: text-generation, conversational).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language: en`.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Investigación en cuantización de modelos de razonamiento: el checkpoint permite medir la degradación de accuracy al pasar de BF16 a NVFP4 W4A4KV4 en tareas matemáticas, usando el runtime ReQAT y los datasets soportados (MATH-500, AIME, GSM8K).
- Reproducción de resultados del artículo ICML 2026: con el commit fijado (`55038ae6`) y el entorno ReQAT, se puede verificar el 65,63 % de accuracy en AIME-120 reportado para la configuración completa.
- Evaluación comparativa de técnicas QAT: al ser un checkpoint etiquetado como fake quantization, sirve para aislar el efecto de TAQ, Q-FIT y SEM frente a otros esquemas de cuantización de 4 bits.
- Estudio de la caché KV de baja precisión: la configuración `kv_cfg=nvfp4_e1m2` con `kv_quant=true` permite analizar el impacto del formato E1M2 en la fidelidad de las trazas de razonamiento largo.
- Desarrollo de kernels y runtimes de inferencia: el repositorio ReQAT incluye una implementación `vllm_custom` y un path `deploy/trtllm/` para exportar NVFP4 nativo en Blackwell, útil para ingeniería de sistemas.
- Benchmarking de hardware Hopper/Blackwell: el modelo está dirigido a H100, H200 y B200, por lo que se puede emplear para caracterizar latencia y throughput de configuraciones FP4 en esas GPU.

## Benchmarks y rendimiento

| Benchmark | Configuración | Resultado | Fuente |
|---|---|---|---|
| AIME-120 | R1-Qwen-14B, NVFP4 W4A4KV4, TAQ + Q-FIT + SEM, 350M tokens | 65,63 % | Artículo ICML 2026 (tablas 1 y 3) |

El valor reportado corresponde a la configuración del artículo y, según la model card, no ha sido verificado de forma independiente para este checkpoint exacto. No se han publicado en la información disponible resultados para MMLU, HumanEval, GSM8K, GPQA-Diamond ni LiveCodeBench, pese a que el repositorio soporta su evaluación.

## Requisitos de hardware

- VRAM estimada: el checkpoint almacena tensores BF16, por lo que el peso ocupa aproximadamente 29,6 GB; hay que sumar caché KV y buffers del runtime. Con cuantización nativa NVFP4 (exportada vía `deploy/trtllm/`) el peso se reduciría a unos 7,4 GB teóricos, pero esa ruta es distinta del checkpoint liberado.
- GPU recomendadas: NVIDIA Hopper (H100, H200) o posteriores, incluida Blackwell (B200), según la model card.
- GPU de consumo: no se indica compatibilidad con RTX 4090 u otras GPU consumer; el proyecto fija como objetivo Hopper o superior.
- Despliegue: no funciona con Transformers estándar ni con vLLM sin modificaciones; requiere el entorno ReQAT con su implementación `vllm_custom` y el script `inference.py`. Para throughput nativo en Blackwell existe la ruta `deploy/trtllm/`.
- Paralelismo: el script de inferencia usa el número de GPU visibles (`CUDA_VISIBLE_DEVICES`) para tensor parallelism.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| R1-Qwen-14B-ReQAT-nvfp4-w4a4kv4-fake | 14,77B | no disponible | NVFP4 W4A4KV4 (fake) | MIT | Hugging Face, runtime ReQAT |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-14B | 14,77B | no disponible | BF16 (original) | MIT | Hugging Face, Transformers/vLLM estándar |
| Qwen2.5-14B (base de la familia) | ~14,7B | no disponible | BF16 y múltiples GGUF/AWQ | Apache 2.0 | Hugging Face, ecosistema amplio |

La comparación se limita a los modelos emparentados porque no se dispone de datos de benchmarks de alternativas en la información proporcionada. La diferencia clave frente al destilado original es la cuantización W4A4KV4 y la dependencia de un runtime específico; frente a Qwen2.5-14B, el modelo hereda el sesgo hacia razonamiento del destilado de R1.

## Limitaciones y advertencias

- El checkpoint es de cuantización falsa: no proporciona por sí mismo ahorros reales de memoria ni de throughput a 4 bits; esos beneficios requieren la exportación nativa NVFP4 del path `deploy/trtllm/`.
- No es cargable con Transformers estándar ni con vLLM sin modificar; requiere el entorno ReQAT y el commit fijado del repositorio.
- El accuracy de 65,63 % en AIME-120 corresponde a la configuración del artículo y no está verificado para este checkpoint exacto.
- Stock TensorRT-LLM no reproduce el comportamiento E1M2 de la caché KV ni el desplazamiento de claves (`shift_k`), por lo que la accuracy puede diferir del runtime de investigación.
- Idioma limitado al inglés (`language: en`); no se declaran capacidades multilingües.
- Riesgo de alucinación y de respuestas incorrectas, sesgadas o engañosas; la model card exige verificación de las salidas.
- Uso previsto restringido a investigación en razonamiento, experimentos de cuantización y evaluación de benchmarks; no se documenta un uso en producción.
- La licencia MIT del release convive con las obligaciones de atribución de los modelos upstream (DeepSeek MIT, Qwen2.5 Apache 2.0), que deben preservarse.
- El modelo tiene 6 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria prácticamente nula.

## Enlaces

- Hugging Face: https://huggingface.co/superdocker/R1-Qwen-14B-ReQAT-nvfp4-w4a4kv4-fake
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-14B
- Dataset: https://huggingface.co/datasets/open-thoughts/OpenThoughts3-1.2M
- Repositorio ReQAT: https://github.com/aiha-lab/ReQAT
- Commit del entorno: https://github.com/aiha-lab/ReQAT/tree/55038ae6ac807a33f9192a25a03f54a03789d21e
- Script de inferencia: https://github.com/aiha-lab/ReQAT/blob/55038ae6ac807a33f9192a25a03f54a03789d21e/inference.py
- Ruta TensorRT-LLM: https://github.com/aiha-lab/ReQAT/tree/55038ae6ac807a33f9192a25a03f54a03789d21e/deploy/trtllm
- Licencia del código: https://github.com/aiha-lab/ReQAT/blob/55038ae6ac807a33f9192a25a03f54a03789d21e/LICENSE
- Paper ICML 2026: https://proceedings.mlr.press/v306/lee26an.html
- arXiv: https://arxiv.org/abs/2606.15682
