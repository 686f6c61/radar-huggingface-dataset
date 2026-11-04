# viai957/nano-mistral-o1-sft

## Resumen
nano-mistral-o1-sft es un ajuste fino supervisado (SFT) de parámetros completos sobre `mistralai/Mistral-7B-v0.3`, desarrollado por el proyecto nano-mistral-o1 (usuario `viai957`). El objetivo es construir un resolvedor de problemas matemáticos que razone paso a paso: el modelo genera párrafos numerados `Step k:` y termina con un marcador `# Answer` seguido de la respuesta final. No es un producto, sino un artefacto de investigación que sirve como sustrato para las etapas posteriores del pipeline (DPO a nivel de paso y GRPO con recompensa de verificador).

Arquitectura Mistral estándar de 7.248 millones de parámetros, decoder-only con 32 capas, GQA de 32 cabezas de consulta y 8 de clave/valor, y vocabulario de 32.768 tokens. Se entrenó sobre 11.739 soluciones de PRM800K (6,12 millones de tokens) durante una época con 1.125 pasos de optimización en 4 GPUs A10G, con un coste aproximado de 39,1 GPU-horas. La licencia es Apache-2.0 y los pesos están en safetensors en bf16.

Su relevancia es doble: por un lado, documenta con transparencia inusual un proceso de SFT con sus defectos (LR constante no aplicado, batches duplicados entre rangos, duplicados exactos en el conjunto de entrenamiento); por otro, establece una línea base medible sobre GSM8K completo (20,47 % pass@1) y MATH-500 (8,4 %) que las etapas de RL posteriores deben superar en pruebas pareadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `MistralForCausalLM`, transformer decoder-only, sin modificaciones respecto a la base |
| Parámetros totales | 7.248.023.552 (≈7,25 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Entrenamiento con filas de hasta 2.041 tokens; evaluación genera como máximo 768 tokens nuevos. Ventana nativa de Mistral v0.3: 32.768 tokens |
| Tipos de cuantización | No especificados por el autor; al ser safetensors bf16 es convertible a GGUF/AWQ/GPTQ con herramientas estándar (no validado por el autor) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 (heredada de la base); datos de entrenamiento MIT |
| Formato de pesos | safetensors (bf16 únicamente; fp16 no soportado) |

Detalles internos: 32 capas, hidden size 4.096, FFN 14.336 con MLP con puerta SiLU, head_dim 128, RoPE con θ = 1e6, sin sliding window, vocabulario de 32.768 (tokenizer Mistral v0.3 sin cambios).

## Arquitectura y entrenamiento
La arquitectura es la de Mistral-7B-v0.3 sin alteraciones: transformer decoder-only con atención GQA (32 cabezas Q, 8 KV) y MLP con activación SiLU. El ajuste es de parámetros completos (no LoRA), con FSDP2 sobre 4 GPUs, parámetros en bf16, reducción de gradientes en fp32 y checkpointing de activaciones. La pérdida es entropía cruzada fragmentada (fused chunked CE) calculada únicamente sobre los tokens de completación, con el prompt enmascarado a -100. El optimizador es AdamW de 8 bits (bitsandbytes, shard-local) con lr 1e-5, betas 0,9/0,95 y weight decay 0.

Los datos provienen íntegramente de `tasksource/PRM800K` (OpenAI PRM800K, Lightman et al. 2023, licencia MIT): se recorrió la ruta `chosen_completion` (con fallback a `human_completion`) y se filtraron soluciones con `finish_reason == solution`, sin ningún paso valorado como -1 y con marcador `# Answer`. De 12.424 candidatas elegibles se descartaron 11 por límites, 14 por longitud excesiva y 2 malformadas, quedando 12.397 filas divididas en 11.739 de entrenamiento y 658 retenidas (disjuntas por `problem_id`). Se aplicó descontaminación contra hashes de MATH-500 y GSM8K-test (0 coincidencias). Una época, 1.125 pasos de optimización (2.250 micro-batches), con micro-batches agrupados por longitud bajo un presupuesto de 3.072 tokens con padding (≈5,3 filas por batch). Pérdida final de entrenamiento: 0,2605 en el último micro-batch registrado (media de los últimos 10 logs: 0,286; primer log: 0,851).

El modelo espera un formato de prompt exacto (envoltorio `[INST] ... [/INST]`) y produce objetivos con la forma `Step 1: ...\n\nStep 2: ...\n\n# Answer\n\n<respuesta></s>`. Las respuestas se extraen partiendo del marcador `# Answer` y se validan con el verificador simbólico `math_verify`. Cualquier otro envoltorio queda fuera de distribución.

## Capacidades
- Generación de razonamiento matemático paso a paso con estructura fija (`Step k:` + `# Answer`), entrenada específicamente para ese formato.
- Resolución de problemas aritméticos de enunciado (word problems) y de competición, en inglés y en modo zero-shot.
- Generación de texto autoregresiva estándar heredada de Mistral-7B-v0.3 (capacidad base, no ajustada para instrucciones generales).
- Extracción determinista de respuesta final mediante el marcador `# Answer`, lo que facilita el post-procesado automático y la verificación simbólica.
- No se ha entrenado para tool calling, function calling, uso de agentes, visión, audio ni modo thinking explícito más allá del razonamiento paso a paso.
- Capacidad multilingüe limitada al inglés: el autor solo declara `en` y el corpus de entrenamiento es exclusivamente en ese idioma.

## Casos de uso
- Investigación en razonamiento matemático: sirve como línea base SFT reproducible para medir la ganancia de etapas posteriores de DPO y GRPO dentro del pipeline nano-mistral-o1, con pruebas pareadas contra este mismo checkpoint.
- Generación de cadenas de razonamiento para destilación: el formato estructurado `Step k:` permite extraer trazas paso a paso y usarlas como datos de entrenamiento o para anotación de procesos (process supervision).
- Evaluación de verificadores simbólicos: la salida delimitada por `# Answer` se integra directamente con `math_verify` para construir pipelines de verificación automática de soluciones.
- Estudio de defectos de entrenamiento: el modelo documenta fallos concretos (LR constante no aplicado, batches idénticos entre rangos, 16,7 % de filas duplicadas, reinicio de momentos de Adam en los pasos 1.001-1.125), lo que lo convierte en un caso útil para analizar el impacto de estos errores en la calidad final.
- Reproducción de bajo presupuesto: el entrenamiento completo cabe en 4 GPUs A10G de 22,5 GB en menos de 10 horas de reloj, lo que permite replicar el experimento en infraestructura modesta.
- Análisis de robustez a formatos de prompt: al estar entrenado con un envoltorio exacto, es un banco de pruebas para medir la degradación fuera de distribución en modelos SFT.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Protocolo | Métrica | Valor | IC 95 % |
|---|---|---|---|---|
| GSM8K (test, completo, n=1.319) | Zero-shot, greedy | pass@1 | 0,2047 (270/1.319) | [0,1838; 0,2273] |
| MATH-500 (test, n=500) | Zero-shot, greedy | pass@1 | 0,084 (42/500) | [0,0627; 0,1116] |
| GSM8K (test) | Zero-shot, greedy, modelo base | pass@1 | 0,05 | No disponible |

El propio autor indica que el modelo base bajo el mismo protocolo obtiene 0,05 en GSM8K, de modo que el ajuste multiplica por cuatro la precisión en esa prueba. No se han publicado resultados para MMLU, HumanEval ni otros benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en bf16: en torno a 14,5 GB solo para pesos (repo de 14,5 GB), más overhead de activaciones y caché KV; presupuesto práctico de 16-18 GB para contextos moderados.
- En cuantización de 8 bits: aproximadamente 7,5-8 GB de pesos; en 4 bits: aproximadamente 4-4,5 GB. El autor no valida ninguna cuantización concreta.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A10G de 24 GB para bf16 sin cuantizar. En consumer, una RTX 4090 (24 GB) o RTX 3090 (24 GB) permite bf16 con contexto limitado; una RTX 4080/4070 Ti Super (16 GB) requiere cuantización.
- Despliegue: compatible con `transformers`, `text-generation-inference` (el repo incluye la etiqueta) y endpoints compatibles. No se documenta soporte específico para vLLM, llama.cpp u Ollama, aunque al ser un Mistral estándar en safetensors son convertibles.
- Rendimiento y latencia: no disponibles. El autor solo reporta el coste de entrenamiento (9,78 h de reloj, ≈39,1 GPU-horas en 4 A10G).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K | MATH-500 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| nano-mistral-o1-sft | ≈7,25 B | 32.768 (nativo); entrenado a 2.041 | 0,2047 | 0,084 | Apache-2.0 | HuggingFace |
| Mistral-7B-v0.3 (base) | ≈7,25 B | 32.768 | 0,05 (mismo protocolo, según el autor) | No disponible | Apache-2.0 | HuggingFace |
| Mistral-7B-Instruct-v0.3 | ≈7,25 B | 32.768 | No disponible en la información proporcionada | No disponible | Apache-2.0 | HuggingFace |
| Modelos matemáticos de 7 B tipo MetaMath o WizardMath | ≈7 B | 4.096-32.768 según variante | No disponible en la información proporcionada | No disponible | Varía (a menudo solo uso no comercial) | HuggingFace |

La comparación cuantitativa solo es posible frente al modelo base, que es el único con resultado publicado bajo el mismo protocolo en la información disponible. Frente a modelos matemáticos especializados de la misma escala no hay datos comparables en la ficha del autor.

## Limitaciones y advertencias
- Defectos de entrenamiento documentados por el autor: el schedule de learning rate se registró pero nunca se aplicó (lr constante 1e-5); los 4 rangos entrenaron batches idénticos (menos diversidad efectiva por paso); el 16,7 % de las filas de entrenamiento son duplicados exactos; los pasos 1.001-1.125 partieron de momentos de Adam reiniciados.
- El modelo es un artefacto de investigación, no un producto: no ha pasado por alineamiento de instrucciones generales ni por filtros de seguridad.
- Riesgo elevado de alucinación fuera del dominio matemático y de errores de cálculo en problemas largos; la precisión en MATH-500 es baja (8,4 %), lo que limita su uso en matemáticas de competición.
- Formato de prompt rígido: cualquier envoltorio distinto del `[INST] ... [/INST]` documentado queda fuera de distribución y degrada la calidad.
- Solo inglés; el rendimiento en castellano no está evaluado y previsiblemente será deficiente.
- Licencia Apache-2.0 permite uso comercial, pero los datos de entrenamiento (PRM800K) son MIT y el modelo hereda los sesgos de Mistral-7B-v0.3.
- No soporta fp16; debe ejecutarse en bf16 o mediante cuantización, y el autor no valida ninguna conversión.
- No dispone de tool calling, agentes ni multimodalidad; no debe emplearse en esos escenarios sin un ajuste adicional.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/viai957/nano-mistral-o1-sft
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-v0.3
- Dataset de entrenamiento: https://huggingface.co/datasets/tasksource/PRM800K
- Paper de PRM800K (Lightman et al., 2023): https://arxiv.org/abs/2305.20050
- Paper de Mistral 7B (Jiang et al., 2023): https://arxiv.org/abs/2310.06825
- Dataset MATH de Hendrycks (usado solo para etiquetas de materia): https://huggingface.co/datasets/EleutherAI/hendrycks_math
- MATH-500 (HuggingFaceH4): https://huggingface.co/datasets/HuggingFaceH4/MATH-500
- GSM8K (OpenAI): https://huggingface.co/datasets/openai/gsm8k
