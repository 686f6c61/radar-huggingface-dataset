# Tom09S/wikimind-moe-3B-A0.9B

## Resumen

wm3.5-3B-A0.9B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por Tom09S, obtenido mediante *upcycling* del modelo denso Qwen/Qwen3-0.6B-Base. La transformación convierte cada capa MLP del modelo original en 10 expertos con enrutamiento top-2, dando lugar a aproximadamente 3.000 millones de parámetros totales de los que solo unos 0.900 millones se activan por token. El modelo utiliza la arquitectura `Qwen3MoeForCausalLM`, por lo que es cargable directamente con Transformers.

El objetivo declarado del autor es validar experimentalmente la técnica de upcycling sobre un modelo pequeño, con foco principal en francés y soporte secundario de inglés. Se trata de un modelo en estado *base*, sin alineamiento SFT ni RLHF, entrenado con un presupuesto reducido (750 pasos, aproximadamente 6 millones de tokens) sobre un contexto de 512 tokens. Su relevancia es fundamentalmente metodológica: demuestra que la inicialización por upcycling preserva la función del modelo denso de partida y que el enrutamiento aprendido no es aleatorio.

El modelo se distribuye bajo licencia Apache-2.0 en formatos safetensors y GGUF, con cuantizaciones que van desde F16 (unos 6 GB) hasta Q4_K_M (unos 1.8 GB). No obstante, el propio autor advierte que la mejora de pérdida observada (de 2.0677 a 1.9201) podría deberse tanto al entrenamiento adicional en francés como a la estructura MoE, y que falta un control denso con el mismo presupuesto para aislar el efecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3MoE (`Qwen3MoeForCausalLM`), transformer con capas MLP sustituidas por 10 expertos top-2 |
| Parametros totales | 2.974.507.008 (≈ 3B) |
| Parametros activos | ≈ 0.9B por token (top-2 de 10 expertos) |
| Longitud de contexto | 512 tokens (contexto de entrenamiento); no disponible contexto nativo ampliado |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M (GGUF); bfloat16 en safetensors |
| Idiomas soportados | Frances (principal), ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B-Base y aplica upcycling: cada MLP denso se duplica en 10 expertos con una perturbación gaussiana (σ = 0.01) para romper la simetría, y se añade un router inicializado con σ = 0.002. El entrenamiento se divide en dos fases: una Fase B de 150 pasos en la que solo se entrena el router, y una Fase C de 600 pasos en la que se entrenan router y adaptadores LoRA (r = 8, α = 16) sobre los expertos, fusionados en los pesos en la exportación. Se emplean pérdidas auxiliares de equilibrado de carga (coeficiente 0.01) y z-loss (0.001). El mejor checkpoint corresponde al paso 750.

Los datos de entrenamiento consisten en un conjunto corto de aproximadamente 35.000 documentos: Wikipedia en francés (20231101), fineweb-2 (fra_Latn), fineweb-edu (sample-10BT), GSM8K para matemáticas, smoltalk para conversación y self-oss-instruct-sc2-exec-filter-50k para código. El autor señala que el objetivo era validar la metodología, no saturar el modelo. Como evidencia de especialización, reporta una divergencia de Jensen-Shannon entre expertos de 0.093 frente a 0.005 dentro de un mismo experto (ratio ≈ 18×), lo que indica que el enrutamiento no es aleatorio. La exportación fusionada se recargó con Transformers con una desviación máxima de logits de 0.34, compatible con ruido bf16.

## Capacidades

- Generación de texto en francés e inglés, en estado base sin alineamiento conversacional.
- Razonamiento básico y matemáticas elementales, con exposición a GSM8K durante el entrenamiento.
- Generación de código, con datos de self-oss-instruct-sc2-exec-filter-50k.
- Modelado de conversación mediante exposición a smoltalk (sin SFT posterior).
- Enrutamiento MoE aprendido con especialización de expertos medible.
- No dispone de soporte documentado de tool calling, function calling, agentes ni multi-step reasoning.
- No dispone de capacidades de visión ni audio.
- No dispone de modo *thinking* ni de razonamiento extendido.

## Casos de uso

- Investigación sobre upcycling de modelos densos a MoE: sirve como referencia reproducible para estudiar cómo se comporta la inicialización por duplicación de MLP y el entrenamiento del router en un presupuesto reducido.
- Experimentación académica con enrutamiento de expertos: la divergencia Jensen-Shannon reportada (0.093 entre expertos) permite analizar la especialización y el balanceo de carga en un modelo pequeño y asequible.
- Generación de texto en francés para prototipado: puede emplearse para completar textos o generar borradores en francés con sampling (T ≈ 0.7, top-p ≈ 0.9, repetition_penalty ≈ 1.1), siempre con revisión humana.
- Pruebas de infraestructura de inferencia MoE: al ser cargable con Transformers y con GGUF, sirve para validar pipelines de despliegue (llama.cpp, llama-cpp-python) en entornos con recursos limitados.
- Evaluación comparativa de cuantizaciones: la disponibilidad de F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S y Q4_K_M permite medir el impacto de la cuantización en la perplejidad y la calidad de generación.
- Base para futuros fine-tunes: al ser un modelo base Apache-2.0, puede servir de punto de partida para SFT o DPO en francés una vez que el autor o terceros añadan alineamiento.
- Docencia y demostraciones de arquitecturas MoE: su tamaño (≈ 1.8 GB en Q4_K_M) permite ejecutarlo en hardware de consumo para ilustrar el funcionamiento de un router top-2.

## Benchmarks y rendimiento

Los únicos datos publicados son métricas de validación internas del autor, no benchmarks estándar (MMLU, HumanEval, GSM8K) del modelo final.

| Modelo | Val loss | Perplejidad | Tests de generación | Repetición 3-gram ↓ |
|---|---:|---:|:---:|---:|
| Qwen3-0.6B-Base | 2.0677 | 7.91 | 5/5 | 0.314 |
| wm3.5 inicializado | 2.0688 | 7.92 | 5/5 | 0.261 |
| wm3.5 entrenado | 1.9201 | 6.82 | 5/5 | 0.239 |

El autor advierte explícitamente que la mejora de pérdida de 0.148 puede atribuirse tanto al entrenamiento adicional en francés como a la estructura MoE, y que un control denso con el mismo presupuesto está pendiente. No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 6 GB en F16, 3.2 GB en Q8_0, 2.5 GB en Q6_K, 2.1 GB en Q5_K_M/Q5_K_S y 1.8 GB en Q4_K_M (tamaños de archivo indicativos; la VRAM necesaria incluye overhead de contexto y runtime).
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para cuantizaciones Q4-Q8; A100 o H100 no son necesarias dado el tamaño del modelo.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, especialmente con cuantizaciones Q4_K_M o Q5_K_M.
- Opciones de despliegue: Transformers (bfloat16, `device_map="auto"`), llama.cpp (`llama-completion`), llama-cpp-python (`Llama.from_pretrained`). No se documenta soporte explícito de vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| wm3.5-3B-A0.9B | ≈ 3B | ≈ 0.9B | 512 (entrenamiento) | Apache-2.0 | Base, sin alinear |
| Qwen3-0.6B-Base | ≈ 0.6B | denso | no disponible | Apache-2.0 | Base |
| Alternativas MoE pequeñas de código abierto | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con su modelo de partida, Qwen3-0.6B-Base, que es denso y de menor tamaño total pero activa todos sus parámetros por token. No se dispone de datos de benchmarks estándar que permitan comparar el rendimiento de wm3.5 frente a otros modelos MoE de tamaño similar.

## Limitaciones y advertencias

- Modelo en estado base sin alineamiento: no está ajustado para seguir instrucciones ni para conversación; en decodificación greedy tiende a entrar en bucles, por lo que se recomienda sampling con repetition_penalty.
- Contexto de entrenamiento muy corto (512 tokens): no apto para tareas que requieran ventanas largas.
- Presupuesto de entrenamiento reducido (≈ 6 millones de tokens, 750 pasos): el modelo no ha sido saturado y su calidad general es limitada.
- La mejora de pérdida frente a la base no está aislada: falta un control denso con el mismo presupuesto para atribuir el efecto a la estructura MoE.
- Cobertura lingüística limitada a francés e inglés; el rendimiento en otros idiomas no está documentado.
- Riesgo de alucinación y de generación incoherente propio de un modelo base pequeño; requiere revisión humana en cualquier uso productivo.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible.
- Licencia Apache-2.0 permite uso comercial, pero al ser un modelo base sin alinear no se recomienda su despliegue directo en producción sin fine-tuning y evaluación previos.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Tom09S/wikimind-moe-3B-A0.9B
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset fineweb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset self-oss-instruct-sc2-exec-filter-50k: https://huggingface.co/datasets/bigcode/self-oss-instruct-sc2-exec-filter-50k
