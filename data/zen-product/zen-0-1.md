# ZEN-PRODUCT/zen-0.1

## Resumen

zen-0.1 es un modelo de lenguaje de tipo small language model (SLM) desarrollado por ZEN-PRODUCT y entrenado desde cero, no mediante fine-tuning de un modelo existente. Con 176.195.328 parametros, adopta una arquitectura Llama clasica con Grouped Query Attention (GQA), RoPE, SwiGLU, RMSNorm y embeddings atados, organizada en 22 capas con una dimension oculta de 768 y 12 cabezas de atencion (4 cabezas KV). El entrenamiento se realizo integramente en 2 GPU NVIDIA T4 en Kaggle durante 10 horas, con un presupuesto de computo muy limitado.

El modelo se presenta como un experimento de formacion desde cero sobre un corpus mixto de datos web educativos, corpus de SmolLM y varios datasets de trazas de razonamiento y conversacion de modelos grandes (FABLE, GLM, DeepSeek, entre otros). El tokenizador empleado es el de SmolLM2, con un vocabulario BPE de aproximadamente 49.000 tokens, y la longitud de contexto de entrenamiento es de 1.024 tokens.

Su relevancia es principalmente documental y experimental: sirve como referencia de que es posible entrenar un transformer pequeno con recursos minimos, pero sus resultados en benchmarks lo sitúan muy por debajo de alternativas del mismo rango de parametros, con un promedio de 28,82% frente al 47,84% de SmolLM2-135M o el 53,19% de KLM 1.6. La model card advierte explicitamente de que no es apto para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder-only) con GQA, RoPE, SwiGLU, RMSNorm y embeddings atados |
| Parametros totales | 176.195.328 (176,2M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens (entrenamiento) |
| Tipos de cuantizacion | F16, Q8_0 (GGUF publicados); otras cuantizaciones GGUF no disponibles en el repo |
| Idiomas soportados | Ingles (en) |
| Licencia | "other" con license_name "unverified"; licencia no determinada, pendiente de revisar las licencias de los datasets de entrenamiento |
| Formato de pesos | safetensors, GGUF (F16 y Q8_0) |
| Capas / hidden / cabezas (KV) | 22 / 768 / 12 (4) |
| Tokenizador | SmolLM2 (BPE, ~49k tokens) |
| Tokens vistos en entrenamiento | 189M |
| Pasos de entrenamiento | 1.443 |
| Precision de entrenamiento | fp16 mixed |
| Hardware de entrenamiento | 2x NVIDIA T4 (Kaggle), 10 horas |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only de estilo Llama, con 22 capas, dimension oculta de 768, 12 cabezas de atencion y 4 cabezas KV (GQA), usando RoPE para codificacion posicional, SwiGLU como activacion en el FFN, RMSNorm para normalizacion y embeddings atados entre entrada y salida. El contexto de entrenamiento es de 1.024 tokens y el tokenizador es el de SmolLM2, con vocabulario BPE de aproximadamente 49.000 tokens.

El entrenamiento se realizo desde cero sobre 189M tokens en 1.443 pasos, durante 10 horas en 2 GPU T4 con precision fp16 mixta. La mezcla de datos evoluciono a lo largo del entrenamiento: fineweb-edu paso del 65% al 30%, smollm-corpus del 30% al 18%, MathGLM-500k del 0% al 5%, Complete-FABLE.5-traces-2M del 2% al 10%, FABLE-5.2-MAX-DATABASE del 1% al 7%, el dataset agregado de trazas de Sonnet/Opus/Gemini/GPT/GLM/DeepSeek del 0% al 15% y GLM-5.1-Reasoning-1M-Cleaned del 2% al 15%. No se documenta uso de RLHF, DPO ni ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.); el modelo es un transformer denso convencional.

## Capacidades

- Generacion de texto autoregresiva en ingles, con calidad limitada segun los propios ejemplos de la model card.
- Razonamiento basico y resolucion de problemas aritmeticos simples, aunque con errores frecuentes (el ejemplo de la model card para `1+8/1*10+2=` devuelve una cadena decimal incoherente).
- Conversacion con formato de chat de tipo ChatML (`<|im_start|>user ... <|im_end|>`), segun el ejemplo de la model card.
- Capacidad multilingue: no disponible; solo se declara ingles.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta.
- Vision, audio o modo thinking: no disponible.
- Inferencia via `transformers`, `llama.cpp` y Ollama (GGUF Q8_0 y F16).

## Casos de uso

- Experimentacion educativa sobre entrenamiento desde cero: el modelo sirve para estudiar el efecto de mezclas de datos y presupuestos de computo minimos, ya que la model card documenta la evolucion de la mezcla y los pasos de entrenamiento.
- Prototipado de pipelines de inferencia: al estar disponible en GGUF Q8_0 y F16, permite validar integraciones con llama.cpp u Ollama en entornos con recursos muy limitados antes de migrar a un modelo mayor.
- Pruebas de formato de chat ChatML: util para verificar plantillas de prompt y parsers de conversacion en etapas tempranas de desarrollo, aunque la calidad de las respuestas sea baja.
- Benchmarking de referencia en el rango de 100-200M de parametros: puede usarse como linea base negativa en experimentos de evaluacion con lm-evaluation-harness para calibrar mejoras de otros modelos pequenos.
- Docencia sobre limitaciones de los SLM: sus fallos documentados (alucinacion, errores aritmeticos, repeticion) sirven como ejemplo practico de por que el escalado de datos y computo importa.
- Demostraciones de despliegue en CPU: con 176M de parametros y cuantizacion Q8_0, cabe en cualquier maquina y permite demostrar inferencia local sin GPU, siempre con expectativas de calidad muy bajas.

## Benchmarks y rendimiento

Resultados 0-shot con `lm-evaluation-harness` (acc_norm cuando esta disponible, si no acc). Los numeros de los modelos comparados son los reportados por sus autores y las configuraciones de evaluacion pueden diferir.

| Modelo | Parametros | ARC-Easy | ARC-Challenge | HellaSwag | PIQA | LAMBADA | Media |
|---|---|---|---|---|---|---|---|
| KLM 1.6 | 99,0M | 61,07% | 33,53% | 45,28% | 70,18% | 55,90% | 53,19% |
| GPT-X3-150M | 149M | 59,64% | 31,31% | 46,16% | 71,33% | 50,90% | 51,87% |
| KLM 1.5 | 99,0M | 59,68% | 32,68% | 43,74% | 68,55% | 48,20% | 50,57% |
| SmolLM2-135M | 135M | 58,63% | 29,69% | 43,22% | 68,44% | 39,20% | 47,84% |
| LFM-2.5-230M-Base | 230M | 59,72% | 34,98% | 39,29% | 63,38% | 36,60% | 46,79% |
| void.1 | 90,1M | 49,32% | 29,35% | 39,46% | 67,19% | 43,70% | 45,80% |
| zen-0.1 | 176,2M | 33,96% | 21,67% | 26,02% | 55,17% | 7,28% | 28,82% |

zen-0.1 obtiene el peor promedio de la tabla, con un LAMBADA de 7,28% que indica una capacidad de modelado de lenguaje muy limitada. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,35 GB en fp16 (176M parametros x 2 bytes) y alrededor de 0,19 GB en Q8_0, mas overhead de activaciones y KV cache.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; el modelo se entreno en 2x T4 y puede ejecutarse en T4, RTX 3060, RTX 4090, A100 o H100 sin problema de capacidad.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` (AutoModelForCausalLM), llama.cpp (`llama-cli`), Ollama (`ollama run hf.co/angelgodbrokenns/zen-0.1:Q8_0`) y text-generation-inference (tag `text-generation-inference` en el repo).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por tamano, la inferencia en CPU es viable y en GPU es de milisegundos por token, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media en benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zen-0.1 | 176,2M | 1.024 | 28,82% | no determinada ("unverified") | HF, GGUF, Ollama |
| SmolLM2-135M | 135M | no disponible en la informacion | 47,84% | no disponible en la informacion | HF |
| KLM 1.6 | 99,0M | no disponible en la informacion | 53,19% | no disponible en la informacion | HF |
| LFM-2.5-230M-Base | 230M | no disponible en la informacion | 46,79% | no disponible en la informacion | HF |

zen-0.1 tiene mas parametros que SmolLM2-135M y KLM 1.6, pero rinde claramente por debajo en todas las tareas evaluadas. La comparativa de contexto, licencia y disponibilidad de los modelos alternativos no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La model card advierte explicitamente de que es un modelo diminuto entrenado con un presupuesto de computo muy bajo: alucina, comete errores aritmeticos y no es apto para uso en produccion.
- Los ejemplos de la model card muestran fallos graves: ante "The capital of France is" responde con una repeticion sobre Estados Unidos, y ante una operacion aritmetica devuelve una cadena decimal sin sentido.
- Contexto de entrenamiento de solo 1.024 tokens, insuficiente para tareas de contexto largo o conversaciones multi-turno extensas.
- Solo soporta ingles; no hay capacidades multilingues documentadas.
- Licencia no determinada ("unverified"): antes de cualquier uso comercial es necesario revisar las licencias de todos los datasets de entrenamiento, que incluyen datasets de trazas de modelos propietarios y de terceros.
- Riesgo elevado de sesgos y de contenido incorrecto, dado que la mezcla incluye datos web sin filtrar mas alla de fineweb-edu y trazas sinteticas de otros modelos.
- No se documenta soporte de tool calling, agentes ni modo thinking, por lo que no es adecuado para pipelines que requieran esas capacidades.
- El repositorio usa el identificador `angelgodbrokenns/zen-0.1` en los ejemplos de codigo, distinto del ID `ZEN-PRODUCT/zen-0.1`; conviene verificar cual es el repositorio activo antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ZEN-PRODUCT/zen-0.1
- Repositorio referenciado en los ejemplos de la model card: https://huggingface.co/angelgodbrokenns/zen-0.1
- Dataset fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset smollm-corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset MathGLM-dataset-500k: https://huggingface.co/datasets/jonathanasdf/MathGLM-dataset-500k
- Dataset Complete-FABLE.5-traces-2M: https://huggingface.co/datasets/Crownelius/Complete-FABLE.5-traces-2M
- Dataset FABLE-5.2-MAX-DATABASE: https://huggingface.co/datasets/Claux67/FABLE-5.2-MAX-DATABASE
- Dataset agregado de trazas de modelos grandes: https://huggingface.co/datasets/VINAY-UMRETHE/Sonnet-Opus-4.5-4.6-Gemini-3.0-3.1-Pro-GPT-5-5.1-5.2-GLM-4.7-MiniMax-M2.1-DeepSeek-V3.2-High
- Dataset GLM-5.1-Reasoning-1M-Cleaned: https://huggingface.co/datasets/Jackrong/GLM-5.1-Reasoning-1M-Cleaned
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
