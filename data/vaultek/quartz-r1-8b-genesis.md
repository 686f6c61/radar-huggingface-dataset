# Vaultek/Quartz-R1-8B-Genesis

## Resumen

Quartz-R1-8B-Genesis es un modelo de lenguaje de 8 000 millones de parámetros desarrollado por Vaultek, basado en el modelo preentrenado YandexGPT-5-Lite-8B-pretrain de Yandex. Está diseñado para generar texto con razonamiento encadenado (chain-of-thought) integrado, siguiendo el formato ` thinking ...  response`, similar a la familia DeepSeek-R1. El modelo se presenta como una versión "decenturada" y ajustada del modelo base, con un entrenamiento que combina SFT y LoRA durante tres días en una única RTX 3060 de 12 GB, empleando una metodología propia denominada "DeepSeek-R1 Distillation & Genesis Tensor Denoising".

Su relevancia radica en ofrecer capacidades de razonamiento y generación de código en un formato compacto de 8B, con soporte para ruso e inglés, lo que lo hace interesante para despliegues en hardware modesto. El repositorio incluye pesos en safetensors y una versión cuantizada en GGUF, aunque la licencia no está especificada y el modelo se encuentra en una fase temprana de adopción (111 descargas). No se dispone de información pública sobre la longitud de contexto ni sobre la arquitectura interna más allá de su origen en YandexGPT-5-Lite.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en YandexGPT-5-Lite-8B-pretrain) |
| Parametros totales | 8 036 552 704 (8B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (versión publicada en repositorio separado) |
| Idiomas soportados | ruso (ru), inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio principal), GGUF (repositorio de cuantización) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de YandexGPT-5-Lite-8B-pretrain, un transformer decoder-only de 8B parámetros. Según la model card, Quartz-R1-8B-Genesis fue "reelaborado" sobre esa base, con un proceso de decensura y ajuste fino que combina SFT (supervised fine-tuning) y LoRA (Low-Rank Adaptation). El entrenamiento se realizó en tres días en una única GPU RTX 3060 de 12 GB, lo que sugiere un uso intensivo de técnicas de eficiencia como LoRA y posiblemente Unsloth (etiqueta presente en los metadatos).

La metodología declarada, "DeepSeek-R1 Distillation & Genesis Tensor Denoising", implica la destilación de capacidades de razonamiento desde modelos de la familia DeepSeek-R1 y un proceso de denoising tensorial propio. El conjunto de datos de entrenamiento incluye fuentes como FineWeb-Edu, StarCoderData, OpenWebMath, Fable-5-Chat, MetaMathQA, OpenHermes-2.5 y un dataset de destilación en ruso (qwen3.8-max-distillation-50k-ru). No se especifican el número total de tokens de entrenamiento ni detalles sobre el proceso de alineación (RLHF, DPO, etc.).

## Capacidades

- Generación de texto con razonamiento encadenado (chain-of-thought) integrado, activado mediante el formato ` thinking ...  response`.
- Razonamiento matemático y lógico, con resultados notables en GSM8K (74,2 %) y ARC Challenge (86,8 %).
- Generación de código en Python, con un Pass@1 de 23,2 % en ruHumanEval.
- Comprensión de conocimiento multitarea (MMLU-Pro, 44,9 %) y razonamiento complejo (Big-Bench Hard, 68,5 %).
- Soporte bilingüe ruso e inglés, con evaluación específica en ruso (ru_mmlu, ru_humaneval).
- Capacidad de seguir instrucciones (IFEval), aunque con una precisión estricta limitada (38,8 % según el model-index).
- No se documenta soporte explícito para tool calling, agentes, visión ni audio.

## Casos de uso

- Asistencia técnica y atención al cliente en ruso: el modelo puede mantener conversaciones de soporte en ruso con razonamiento paso a paso, útil para empresas que operan en mercados de habla rusa y necesitan un despliegue local de bajo coste.
- Generación de código en entornos de desarrollo: con soporte para Python y razonamiento, puede asistir en tareas de programación, revisión de código y depuración, aunque su rendimiento en tareas de ingeniería de software complejas (Deep-SWE 1,2 %) es limitado.
- Resolución de problemas matemáticos en educación: su capacidad en GSM8K y MATH-500 permite su uso como tutor automático para explicar soluciones paso a paso en inglés y ruso.
- Prototipado de aplicaciones de razonamiento: al ser un modelo de 8B con CoT integrado, sirve para experimentar con pipelines de razonamiento en hardware consumer, como una RTX 3060 o similar.
- Análisis de documentos técnicos: su conocimiento multitarea (MMLU-Pro) permite resumir y extraer información de textos científicos o técnicos en inglés y ruso, aunque con limitaciones en dominios muy especializados (GPQA 19,6 %).
- Investigación académica en modelos de razonamiento: al estar basado en destilación de DeepSeek-R1, puede usarse como caso de estudio para comparar metodologías de destilación en modelos pequeños.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados de forma independiente):

| Benchmark | Dataset | Metrica | Valor |
|---|---|---|---|
| ARC Challenge | allenai/ai2_arc | Accuracy | 86,77 % |
| GSM8K | openai/gsm8k | Accuracy | 74,22 % |
| HellaSwag | Rowan/hellaswag | Accuracy | 71,90 % |
| Big-Bench Hard | lmsys/bbh | Accuracy | 68,48 % |
| MMLU-Pro | TIGER-Lab/MMLU-Pro | Accuracy | 44,94 % |
| MATH-500 | HuggingFaceH4/MATH-500 | Accuracy | 43,40 % |
| IFEval | google/ifeval | Strict Accuracy | 38,82 % |
| Humanity's Last Exam | cais/hle | Accuracy | 32,84 % |
| ru_mmlu (MERA) | ai-forever/MERA | Accuracy | 25,18 % |
| ru_humaneval | MERA-evaluation/ruHumanEval | Pass@1 | 23,17 % |
| GPQA Main | Idavidrein/gpqa | Accuracy | 19,64 % |
| GPQA Diamond | Idavidrein/gpqa | Accuracy | 13,13 % |
| DataCurve Deep-SWE | datacurve/deep-swe | Pass Rate | 1,20 % |

Además, la model card incluye una "Vaultek Custom Stress-Suite" con un pass rate del 98 % en 50 pruebas de estrés y una puntuación de calidad CoT de 3,4/5 según un modelo maestro, aunque estos datos no forman parte del model-index oficial.

## Requisitos de hardware

- El repositorio principal pesa 16,2 GB, lo que corresponde aproximadamente a pesos en FP16/BF16 para un modelo de 8B.
- Inferencia en FP16 requiere al menos 16 GB de VRAM, por lo que una RTX 4090 (24 GB) o una A100 (40/80 GB) son opciones adecuadas.
- Con cuantización GGUF (disponible en repositorio separado), el modelo puede ejecutarse en GPUs con 6-8 GB de VRAM, como una RTX 3060 o RTX 4060, usando llama.cpp u Ollama.
- El entrenamiento se realizó en una RTX 3060 de 12 GB, lo que indica que la inferencia es viable en hardware consumer de gama media.
- Opciones de despliegue: transformers (Hugging Face), llama.cpp, vLLM (con compatibilidad endpoints), Ollama, LM Studio y otras herramientas compatibles con GGUF.
- No se proporcionan datos de latencia ni throughput específicos.

## Comparativa con modelos similares

No se dispone de resultados comparativos directos en los mismos benchmarks con otros modelos de 8B (como Llama-3.1-8B, Qwen2.5-7B o Mistral-7B). A modo orientativo, los valores de Quartz-R1-8B-Genesis en MMLU-Pro (44,9 %) y GSM8K (74,2 %) son inferiores a los típicos de modelos modernos de 8B (que suelen superar el 60 % en MMLU-Pro y el 80 % en GSM8K), pero su rendimiento en ARC Challenge (86,8 %) es competitivo. La comparativa queda limitada por la falta de datos públicos de otros modelos en las mismas condiciones de evaluación.

## Limitaciones y advertencias

- La licencia no está especificada, por lo que no se puede garantizar su uso comercial ni su redistribución. Se recomienda contactar con el autor antes de utilizarlo en producción.
- El modelo solo soporta ruso e inglés; no hay evidencia de capacidades en otros idiomas.
- La longitud de contexto no está documentada, lo que dificulta planificar tareas que requieran ventanas largas.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente. Algunos valores (p. ej., IFEval) difieren entre el model-index y la model card.
- El rendimiento en tareas de ingeniería de software reales (Deep-SWE 1,2 %) es muy bajo, lo que limita su uso en entornos de desarrollo avanzados.
- Al ser un modelo destilado de DeepSeek-R1, puede heredar sesgos o limitaciones de los datos de destilación, especialmente en dominios de conocimiento especializado (GPQA 13-20 %).
- Riesgo de alucinación en respuestas factuales, especialmente en temas fuera de su distribución de entrenamiento.
- El proyecto es reciente (agosto de 2026) y tiene una comunidad muy pequeña (111 descargas, 0 likes), lo que implica soporte limitado y posibles problemas no documentados.

## Enlaces

- Modelo principal: https://huggingface.co/Vaultek/Quartz-R1-8B-Genesis
- Versión cuantizada GGUF: https://huggingface.co/Vaultek/Quartz-R1-8B-Genesis-GGUF
- Modelo base: https://huggingface.co/yandex/YandexGPT-5-Lite-8B-pretrain
- Repositorio de referencia DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
