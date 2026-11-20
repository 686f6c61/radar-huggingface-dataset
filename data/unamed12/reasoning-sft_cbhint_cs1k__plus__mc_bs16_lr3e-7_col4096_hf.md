# unamed12/reasoning-sft_cbhint_cs1k__plus__mc_bs16_lr3e-7_col4096_hf

## Resumen

`unamed12/reasoning-sft_cbhint_cs1k__plus__mc_bs16_lr3e-7_col4096_hf` es un ajuste fino completo (full fine-tuning) del modelo base Qwen/Qwen3-1.7B, publicado por el usuario unamed12 en Hugging Face. El modelo se ha entrenado sobre el dataset `dapo_r2ks42_dmmc_code_blueprint_hint_qwen31p7_thinking_correct_max4096_eval_correct_1017`, un conjunto orientado a razonamiento y generación de código con pistas de "blueprint" y modo thinking. El nombre del repositorio codifica los hiperparámetros principales del entrenamiento: batch size 16, learning rate 3e-7 y longitud de contexto de 4096 tokens.

Se trata de un modelo de 1.720.574.976 parámetros (aproximadamente 1,7 mil millones), con arquitectura transformer densa heredada de Qwen3, pesos en safetensors y un tamaño de repositorio de 3,5 GB. Está pensado para generación de texto conversacional y tareas de razonamiento, y es relevante como ejemplo de experimento de SFT (supervised fine-tuning) sobre un modelo pequeño de la familia Qwen3, un caso de uso habitual en investigación de destilación de razonamiento y ajuste con datos sintéticos.

La información pública es muy escasa: la model card está generada automáticamente por el Trainer de Hugging Face y no incluye descripción, usos previstos ni resultados de evaluación. No se han declarado idiomas soportados ni resultados de benchmarks. La licencia figura como "other", lo que obliga a consultar los términos del modelo base Qwen3-1.7B antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3) |
| Parametros totales | 1.720.574.976 (~1,7 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (según el nombre del repositorio y la configuración de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | other (hereda las restricciones del modelo base Qwen/Qwen3-1.7B) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (no LoRA) de Qwen3-1.7B, un transformer denso de la familia Qwen3. El entrenamiento se realizó con LLaMA-Factory sobre el dataset `dapo_r2ks42_dmmc_code_blueprint_hint_qwen31p7_thinking_correct_max4096_eval_correct_1017`, que por su nombre sugiere datos de razonamiento tipo DAPO (Decoupled Clip and Dynamic sAmpling Policy Optimization) filtrados por corrección, con pistas de blueprint de código y modo thinking, y truncados a 4096 tokens.

Los hiperparámetros declarados son: learning rate 3e-7, batch total 16 (batch 4 por dispositivo, 2 GPUs, 2 pasos de acumulación de gradiente), una sola época, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, scheduler coseno con warmup del 10 %, semilla 42. El entorno de entrenamiento fue Transformers 4.57.0, PyTorch 2.8.0+cu128, Datasets 2.20.0 y Tokenizers 0.22.1. No se documentan técnicas adicionales como RLHF, DPO o decodificación especulativa; el proceso es SFT supervisado puro con un learning rate muy bajo, lo que sugiere un ajuste conservador para preservar las capacidades del modelo base.

## Capacidades

- Generación de texto conversacional en formato multi-turno (pipeline `text-generation`, tarea `conversational`).
- Razonamiento con modo thinking, heredado de Qwen3 y reforzado por el dataset de entrenamiento con pistas de blueprint.
- Generación y razonamiento sobre código, dado el origen del dataset (`..._code_blueprint_hint_...`).
- Razonamiento matemático y de lógica de varios pasos, presumiblemente potenciado por el formato DAPO del dataset.
- Compatibilidad con Text Generation Inference (tag `text-generation-inference` y `endpoints_compatible`).
- Soporte de tool calling / function calling: no documentado explícitamente en la información disponible; el modelo base Qwen3 lo soporta, pero no hay confirmación de que se conserve tras el ajuste.
- Capacidades de agente y multi-step reasoning: no documentadas.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades de visión o audio: no disponibles (modelo solo de texto).

## Casos de uso

- Experimentación académica en destilación de razonamiento: el modelo sirve como punto de partida para estudiar cómo un SFT con datos de tipo DAPO y pistas de blueprint afecta al comportamiento de razonamiento de un modelo de 1,7 B, comparándolo con el Qwen3-1.7B original.
- Generación de código asistida en entornos con recursos limitados: al ser un modelo de 1,7 B, puede desplegarse en una sola GPU consumer para autocompletado o generación de fragmentos de código en un IDE o pipeline interno.
- Prototipado de asistentes conversacionales: su formato conversacional y ventana de 4096 tokens permiten gestionar diálogos multi-turno de longitud moderada en entornos de desarrollo y pruebas.
- Investigación sobre ajuste fino completo: el repositorio documenta hiperparámetros completos (LR, batch, scheduler, optimizador), lo que lo hace útil como referencia reproducible de recetas de SFT sobre Qwen3.
- Evaluación de la degradación de capacidades tras SFT: permite medir si un ajuste con learning rate 3e-7 y una época preserva las capacidades originales del modelo base en tareas fuera del dominio de entrenamiento.
- Base para posteriores etapas de alineación: puede emplearse como checkpoint intermedio antes de aplicar DPO, RLHF o cuantización para despliegue en producción.
- Generación de explicaciones paso a paso en dominios técnicos: el modo thinking y las pistas de blueprint del dataset sugieren utilidad para producir razonamientos estructurados en tareas de depuración o análisis de código.

## Benchmarks y rendimiento

El model-index del autor declara una entrada con la lista de resultados vacía:

| Benchmark | Resultado |
|---|---|
| (ninguno declarado) | sin datos |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,5 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 6-8 GB de VRAM para contextos moderados.
- VRAM estimada en cuantización de 8 bits: ~2 GB para pesos; en 4 bits: ~1 GB para pesos (no se publican variantes cuantizadas oficiales, pero el modelo base Qwen3-1.7B es convertible con herramientas estándar).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090, A10, L4). Para mayor throughput, A100 o H100.
- Cabe en GPU consumer: sí, en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4080/4090 y GPUs integradas con suficiente memoria unificada.
- Opciones de despliegue: Transformers (librería declarada), Text Generation Inference (tag `text-generation-inference`), vLLM, llama.cpp/Ollama tras conversión a GGUF, y LLaMA-Factory para reentrenamiento.
- Latencia y throughput estimados: no disponibles (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| unamed12/reasoning-sft_cbhint_cs1k+mc_bs16_lr3e-7_col4096_hf | 1,72 B | 4096 | other | Hugging Face | SFT sobre Qwen3-1.7B; sin benchmarks publicados |
| Qwen/Qwen3-1.7B | ~1,7 B | 32 768 (según ficha del modelo base) | Apache 2.0 (según el modelo base) | Hugging Face | Modelo base original, con benchmarks y licencia permisiva |
| Qwen/Qwen3-4B | ~4 B | 32 768 (según ficha del modelo base) | Apache 2.0 (según el modelo base) | Hugging Face | Alternativa de mayor tamaño de la misma familia |
| Llama 3.2 1B Instruct | ~1,2 B | 128 000 (según ficha del modelo base) | Llama 3.2 Community License | Hugging Face | Alternativa de tamaño similar con contexto mucho mayor |

La comparación con Qwen3-1.7B es la más directa: este ajuste hereda su arquitectura y tamaño, pero sustituye la licencia Apache 2.0 por "other" y no aporta benchmarks que justifiquen la mejora. Frente a Qwen3-4B, el modelo aquí descrito es más pequeño y presumiblemente menos capaz en tareas generales, aunque puede ser suficiente para experimentación. Frente a Llama 3.2 1B, la diferencia principal es la ventana de contexto: 4096 tokens frente a 128 000, lo que limita su uso en tareas de contexto largo.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el ajuste mejore al modelo base; podría degradar capacidades generales por sobreajuste al dataset de entrenamiento.
- Licencia "other": no se especifican los términos; es imprescindible revisar la licencia de Qwen/Qwen3-1.7B (Apache 2.0 en el modelo base) y confirmar si el autor impone restricciones adicionales antes de uso comercial.
- Idiomas no declarados: no se puede asumir soporte multilingüe más allá del comportamiento heredado del modelo base.
- Contexto limitado a 4096 tokens: insuficiente para documentos largos, conversaciones extensas o bases de código grandes.
- Riesgo de alucinación: inherente a los modelos de 1,7 B y potencialmente agravado por el ajuste sobre datos sintéticos de razonamiento.
- Sesgos: no documentados; el dataset de entrenamiento puede introducir sesgos de dominio (código, razonamiento) no evaluados.
- Model card incompleta: sección de usos previstos y limitaciones sin rellenar ("More information needed"), lo que impide conocer el propósito declarado por el autor.
- Sin variantes cuantizadas oficiales: el despliegue en entornos de bajos recursos requiere conversión manual a GGUF/AWQ/GPTQ.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni validación externa del checkpoint.
- Fecha de creación futura (2026-11-20): metadato anómalo que conviene verificar antes de confiar en la trazabilidad del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/unamed12/reasoning-sft_cbhint_cs1k__plus__mc_bs16_lr3e-7_col4096_hf
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Framework de entrenamiento (LLaMA-Factory): https://github.com/hiyouga/LLaMA-Factory
- Transformers: https://github.com/huggingface/transformers
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
- Papers, blogs, repos o demos adicionales: no disponibles en la información proporcionada.
