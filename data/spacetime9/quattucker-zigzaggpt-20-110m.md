# spacetime9/QuatTucker-ZigZagGPT-20-110M

## Resumen

QuatTucker-ZigZagGPT-20-110M es un modelo de lenguaje base de 109,49M de parámetros (70,89M en el backbone no-embedding) desarrollado por Shubham Barmase, investigador independiente. Se presenta como una prueba de concepto de una arquitectura denominada "Quaternion-Tucker ZigZag Networks", cuyo objetivo declarado es reducir a la mitad los parámetros del backbone de un transformer y permitir un escalado continuo en dos dimensiones (anchura y profundidad) sin pérdida de exactitud.

El modelo fue entrenado de forma continua a partir de un checkpoint inicial de 77,6M de parámetros y 12 capas, creciendo a lo largo de 7 etapas hasta alcanzar 6,00B de tokens procesados en NVIDIA A100. La arquitectura combina RoPE, RMSNorm, FlashAttention, un SwiGLU cuaterniónico compartido (rank 8192), núcleos Tucker diagonales por bloque de 64×64 y un enrutado "Braided ZigZag Diamond" (0 → 2 → 1 → 3).

Su relevancia actual es fundamentalmente metodológica: demuestra que es posible expandir la profundidad de un transformer de forma bit-exacta (max_diff = 0,000000) y que un modelo de 109M puede igualar el promedio de 4 tareas del GPT-3 Small (125M) con 50 veces menos tokens (6,00B frente a 300B). No obstante, se trata de un modelo base de contexto corto (512 tokens) y solo inglés, orientado a investigación más que a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con RoPE + RMSNorm + FlashAttention + Shared 4D Quaternion Hamilton SwiGLU (rank 8192) + Block-Diagonal Tucker Cores 64×64 + Braided ZigZag Diamond Routing (0 → 2 → 1 → 3) |
| Parametros totales | 109,49M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en PyTorch `.pt`; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (`best_6B_depth20.pt`, ~0,4 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer de 20 capas organizadas en 5 "Braided ZigZag Diamonds", con enrutado de profundidad 0 → 2 → 1 → 3. Incorpora RoPE para posiciones, RMSNorm y FlashAttention. La innovación principal es un SwiGLU cuaterniónico compartido (4D Quaternion Hamilton, rank 8192) combinado con núcleos Tucker diagonales por bloque de 64×64, lo que reduce el número de parámetros del backbone a 70,89M frente a los 85,0M de GPT-2 (16,6% menos). El vocabulario es GPT-2 BPE con V = 50.257.

El entrenamiento se realizó en 7 etapas sobre NVIDIA A100-40GB, partiendo de un checkpoint de 77,6M y 12 capas y creciendo de forma continua hasta 109,49M y 20 capas, acumulando 6,00B de tokens. Los conjuntos de datos citados son HuggingFaceFW/fineweb-edu, HuggingFaceTB/smollm-corpus y open-web-math/open-web-math. Dos expansiones de profundidad fueron bit-exactas (max_diff = 0,000000). La etapa final empleó un scheduler WSD (warmup-stable-decay). No se documenta RLHF, DPO ni instrucción tuning: es un modelo base.

## Capacidades

- Generación de texto autoregresiva en inglés (modelo base, sin alineación instruccional).
- Razonamiento básico y respuesta a preguntas de opción múltiple evaluado por log-likelihood normalizada por longitud.
- Modelado de lenguaje y continuación de texto con contexto de hasta 512 tokens.
- Capacidad matemática limitada, con open-web-math en el corpus de entrenamiento.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No se documenta modo "thinking", visión ni audio.
- Multilingüe: no; solo inglés.

## Casos de uso

- Investigación en escalado continuo de transformers: sirve como referencia reproducible para estudiar crecimiento de profundidad y anchura congelando o expandiendo pesos sin pérdida de exactitud, gracias a los checkpoints por etapa (best_1B.pt, best_2.5B_depth16.pt, best_5B_depth20.pt, best_6B_depth20.pt).
- Estudio de compresión de arquitecturas: permite comparar un backbone de 70,89M con el de GPT-2 (85,0M) en la misma tarea de modelado de lenguaje con vocabulario GPT-2 BPE.
- Experimentos de inicialización y enrutado: el esquema Braided ZigZag Diamond (0 → 2 → 1 → 3) y los núcleos Tucker diagonales son candidatos para investigar eficiencia paramétrica en modelos pequeños.
- Fine-tuning ligero para tareas de clasificación o scoring: al ser un modelo base de 109M, puede adaptarse con LoRA o cabezas de clasificación para tareas de NLP en inglés con presupuesto de cómputo reducido.
- Evaluación comparativa de benchmarks de razonamiento (ARC, HellaSwag, WinoGrande, BoolQ, PIQA) en el rango de 100-130M de parámetros.
- Prototipado educativo: su tamaño (0,4 GB) permite cargarlo en una GPU de consumo para demostrar técnicas de decodificación, atención y crecimiento de modelos en entornos docentes.

## Benchmarks y rendimiento

Evaluación zero-shot sobre splits completos (20.465 preguntas), con scoring por log-likelihood normalizada por longitud:

| Benchmark (N) | Stage 5 (3,55B, L=16) | Stage 6 (5,00B, L=20) | Stage 7 (6,00B, L=20) | GPT-3 Small (125M, 300B) |
|---|---:|---:|---:|---:|
| ARC-Easy (2.376) | 40,74% | 42,09% | 42,17% | 43,60% |
| HellaSwag (10.042) | 27,55% | 27,97% | 28,01% | 33,70% |
| WinoGrande (1.267) | 50,43% | 51,14% | 52,09% | 52,00% |
| BoolQ (3.270) | 59,51% | 55,44% | 56,73% | 49,70% |
| Core 4-Task Avg (16.955) | 44,56% | 44,16% | 44,75% | 44,75% |
| PIQA (1.838) | — | — | 61,43% | 64,60% |
| ARC-Challenge (1.172) | — | — | 24,74% | 26,60% |
| OpenBookQA (500) | — | — | 27,60% | 35,60% |

| Modelo | Params | Tokens | FineWeb-Edu Val Loss | PPL |
|---|---:|---:|---:|---:|
| QuatTucker-ZigZagGPT-20-110M (Stage 7) | 109,49M | 6,00B | 3,3582 | 28,74 |
| OpenAI GPT-2 | 124,4M | ~10,0B | 3,3439 | 28,33 |

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa ~0,4 GB en FP32; en FP16/BF16 la inferencia requiere aproximadamente 0,5-1 GB de VRAM incluyendo activaciones para contexto de 512 tokens.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor entrenó en NVIDIA A100-40GB, pero la inferencia cabe holgadamente en GPUs de consumo.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: el código de referencia es PyTorch puro (`quattucker_zigzag_v2.QuatTuckerZigZagGPT`); no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI, ya que los pesos no están en GGUF ni en safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Core 4-Task Avg | Licencia | Formato |
|---|---:|---:|---:|---|---|
| QuatTucker-ZigZagGPT-20-110M | 109,49M | 512 | 44,75% | MIT | PyTorch `.pt` |
| OpenAI GPT-2 | 124,4M | 1.024 | no disponible en la información | MIT | safetensors/PyTorch |
| GPT-3 Small (referencia) | 125M | 2.048 | 44,75% | Propietaria (no publicada) | no disponible |

La comparación con GPT-2 se limita a la pérdida de validación en FineWeb-Edu (28,74 frente a 28,33 PPL). No se dispone de resultados de GPT-2 en los benchmarks de razonamiento citados dentro de la información proporcionada.

## Limitaciones y advertencias

- Modelo base sin instrucción tuning: no sigue instrucciones ni mantiene diálogos de forma fiable; requiere fine-tuning o prompting específico.
- Contexto muy corto (512 tokens), insuficiente para tareas de documento largo, RAG con muchos fragmentos o conversaciones extensas.
- Solo inglés; no hay evidencia de capacidades multilingües.
- Riesgo de alucinación inherente a un modelo de 109M entrenado con 6,00B de tokens; el conocimiento factual es limitado.
- Sesgos potenciales derivados de FineWeb-Edu, SmolLM-corpus y open-web-math; no se documenta ninguna mitigación.
- Rendimiento por debajo de GPT-3 Small en HellaSwag, PIQA, ARC-Challenge y OpenBookQA; el empate en el promedio de 4 tareas se apoya en BoolQ y WinoGrande.
- Licencia MIT permite uso comercial, pero el autor no ofrece garantías ni soporte; el código de inferencia debe obtenerse del repositorio de GitHub.
- Pesos en formato `.pt` (no safetensors): requiere `torch.load` con `weights_only=False`, lo que implica riesgos de seguridad si el archivo no es de confianza.
- Sin soporte documentado en frameworks de serving estándar (vLLM, TGI, llama.cpp), lo que complica el despliegue en producción.
- El modelo no ha sido auditado de forma independiente; los resultados provienen de la model card del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/spacetime9/QuatTucker-ZigZagGPT-20-110M
- Código y paper (v3.0): https://github.com/shu195/QuatTucker-ZigZagGPT
- Preprint en Zenodo (DOI): https://doi.org/10.5281/zenodo.24424501
- arXiv: envío a cs.LG con identificador `submit/8425200` (no se proporciona URL directa)
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset SmolLM-corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset OpenWebMath: https://huggingface.co/datasets/open-web-math/open-web-math
