# WithinUsAI/WIUAI.Flash.MoE.Coder.Instruct.53m.a9m

## Resumen

WIUAI.Flash.MoE.Coder.Instruct.53m.a9m es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) hibrido desarrollado por WithinUsAI, entrenado desde cero ("from-scratch") y afinado para instrucciones, conversacion y generacion de codigo. Con 53.428.384 parametros totales y solo 9 millones activos por token (segun el sufijo "53m.a9m" del nombre), se posiciona en la categoria de modelos ultraligeros orientados a despliegue en entornos con recursos muy limitados. La arquitectura declarada es `lfm2_moe`, una variante hibrida MoE que combina capas de atencion con componentes de estado recurrente, aunque la model card no detalla la distribucion exacta de capas.

El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y esta publicado exclusivamente en ingles. Su interes actual radica en que representa un ejercicio de entrenamiento desde cero sobre un corpus curado de mas de veinte datasets publicos (FineWeb-Edu, DCLM, Cosmopedia, The Stack Smol, FineMath, OpenHermes, hermes-function-calling-v1, entre otros), con un pipeline de afinado que incluye datos de instrucciones, tool calling y conversacion. Es relevante para quienes investigan modelos pequenos con arquitecturas MoE eficientes y para desarrolladores que necesitan un modelo de 53M parametros con capacidad de function calling y bajo coste de inferencia.

No obstante, conviene ser realista: los benchmarks publicados por el autor muestran un rendimiento propio de un modelo de este tamano, con MMLU en 24.82, HellaSwag en 30.10 y LAMBADA en 22.88, valores que reflejan las limitaciones intrinsecas de un modelo de 53M parametros. La ficha siguiente recoge toda la informacion disponible sin inventar datos ausentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `lfm2_moe` (transformer hibrido con Mixture-of-Experts) |
| Parametros totales | 53.428.384 |
| Parametros activos | 9M (segun sufijo "a9m"; no confirmado en model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (formato mencionado en tags); niveles concretos no disponibles |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers), GGUF |

## Arquitectura y entrenamiento

La arquitectura declarada es `lfm2_moe`, etiquetada como "hybrid" y "mixture-of-experts" en los tags del repositorio. Se trata de un transformer con capas MoE, presumiblemente inspirado en la familia LFM2 de Liquid AI, que combina capas de atencion con capas de convolucion o estado recurrente para reducir el coste computacional. El modelo tiene 53,4M de parametros totales y, segun el sufijo del nombre, 9M activos por token, lo que implica un ratio de activacion de aproximadamente el 17%. No se dispone de informacion sobre el numero de capas, dimension del hidden state, numero de expertos ni top-k de enrutamiento.

El entrenamiento es "from-scratch" y utiliza un corpus compuesto por mas de veinte datasets publicos: preentrenamiento general (FineWeb-Edu, DCLM-baseline-1.0, DCLM-Ultra-1.1, FactBase-DCLM, Cosmopedia, SmolLM-corpus, FinePDFs-Edu, FinePhrase, Wikipedia, Project Gutenberg, BookCorpusOpen, TinyStories), matematicas (FineMath, MegaMath-Web-Pro-Max, orca-math-word-problems-200k), codigo (The Stack Smol), y datos de instrucciones y conversacion (smol-smoltalk, smoltalk, tulu-3-sft-personas-instruction-following, WildChat-4.8M, OpenHermes-2.5, hermes-function-calling-v1, gooaq, eli5). No se especifica el numero total de tokens de entrenamiento, la composicion exacta por etapa, ni si se aplico RLHF o DPO; la presencia de datasets de instrucciones y de function calling sugiere una etapa de SFT, pero no se confirma alineamiento por preferencias.

## Capacidades

- Generacion de texto en ingles con modo conversacional e instruct.
- Razonamiento basico y respuesta a preguntas de sentido comun y ciencia elemental (ver benchmarks).
- Generacion de codigo, segun la denominacion "Coder" del modelo y la inclusion de The Stack Smol en el corpus.
- Tool calling / function calling: el corpus incluye `hermes-function-calling-v1`, y el tag `tool-calling` esta presente.
- Razonamiento multi-paso: tag `reasoning` presente, aunque sin datos que cuantifiquen su calidad.
- Capacidades multilingues: limitadas al ingles; no se declaran otros idiomas.
- No se declaran capacidades de vision, audio ni modo "thinking" explicito.

## Casos de uso

- Clasificacion y etiquetado de texto en ingles a gran escala: con solo 9M de parametros activos, el modelo puede procesar volumenes altos de documentos en pipelines de enriquecimiento de datos con coste computacional minimo.
- Prototipado rapido de asistentes conversacionales: su tamano permite ejecutarlo en CPU o en GPU de gama baja para validar flujos de dialogo multi-turno antes de escalar a modelos mayores.
- Generacion de codigo asistida en entornos embebidos: el modelo cabe en dispositivos con poca memoria y puede ofrecer autocompletado o sugerencias de fragmentos cortos en ingles.
- Experimentacion academica con arquitecturas MoE hibridas: sirve como banco de pruebas reproducible (entrenado desde cero, corpus publico, licencia Apache 2.0) para estudiar enrutamiento de expertos y eficiencia de activacion en modelos pequenos.
- Function calling en agentes ligeros: gracias al corpus de Hermes function calling, puede integrarse en flujos de automatizacion que requieran invocar herramientas simples (consultas, calculos, APIs) en ingles.
- Filtrado y moderacion de contenido basica: puede clasificar o reescribir textos cortos en ingles en pipelines de preprocesamiento, aunque su precision es limitada y requiere validacion humana.
- Educacion y demos interactivas: su bajo coste permite desplegarlo en notebooks o entornos docentes para ilustrar el funcionamiento de un MoE sin infraestructura dedicada.

## Benchmarks y rendimiento

Resultados declarados por el autor (0-shot, conjuntos de test completos). La columna "Base" corresponde al modelo antes del afinado, segun la model card.

| Benchmark | Este modelo | Base antes de fine-tuning | Cambio |
|---|---:|---:|---:|
| ARC-Easy (acc_norm) | 49.71 | 49.66 | +0.04 |
| ARC-Challenge (acc_norm) | 30.29 | 29.44 | +0.85 |
| HellaSwag (acc_norm) | 30.10 | 30.13 | -0.03 |
| PIQA (acc_norm) | 64.04 | 63.22 | +0.82 |
| OpenBookQA (acc_norm) | 32.40 | 32.80 | -0.40 |
| SciQ (acc_norm) | 63.90 | 63.70 | +0.20 |
| WinoGrande (acc) | 49.41 | 49.33 | +0.08 |
| BoolQ (acc) | 58.72 | 58.26 | +0.46 |
| LAMBADA (OpenAI) (acc) | 22.88 | 21.00 | +1.88 |
| MMLU (acc) | 24.82 | 23.42 | +1.40 |
| CommonsenseQA (acc) | 21.70 | 20.15 | +1.56 |
| Social IQa (acc) | 37.67 | 38.08 | -0.41 |
| ArithMark-3 (acc_norm) | 43.90 | 52.90 | -9.00 |

Nota: el autor indica que ArithMark-3 mide habilidades que el modelo no fue entrenado para retener, y reporta una sonda aritmetica propia (held-out) con 40.94 frente a 40.80 del base (+0.14). No se han publicado resultados de HumanEval, GSM8K ni otros benchmarks de codigo o matematicas estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp16 (53,4M parametros ≈ 107 MB de pesos); en cuantizacion de 4 bits, decenas de MB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo. Tambien ejecutable en CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas e incluso en iGPU y dispositivos embebidos.
- Opciones de despliegue: transformers (libreria declarada), llama.cpp / Ollama mediante el formato GGUF, y servidores compatibles con la API de transformers. vLLM y TGI no estan confirmados para la arquitectura `lfm2_moe`.
- Latencia y throughput estimados: no disponibles. Por el tamano (9M activos) se espera latencia muy baja y throughput alto en hardware modesto, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| WIUAI.Flash.MoE.Coder.Instruct.53m.a9m | 53,4M totales / 9M activos | no disponible | Apache 2.0 | MoE hibrido, ingles, from-scratch |
| SmolLM2-135M (HuggingFaceTB) | 135M | 8K (segun model card publica) | Apache 2.0 | Transformer denso, mas parametros, sin MoE |
| Qwen2.5-0.5B (Alibaba) | 494M | 32K (segun model card publica) | Apache 2.0 | Denso, multilingue, mucho mayor |
| TinyLlama-1.1B | 1,1B | 2K (segun model card publica) | Apache 2.0 | Denso, mayor capacidad pero mas coste |

La comparacion directa es dificil porque no hay benchmarks comunes publicados en la informacion disponible para estos modelos en el mismo formato. El WIUAI destaca por su eficiencia de activacion (9M) y su licencia permisiva, pero su rendimiento absoluto es inferior al de modelos densos de mayor tamano como SmolLM2-135M o Qwen2.5-0.5B, que suelen superar ampliamente el 24.82 de MMLU. La ventaja del WIUAI es el coste de inferencia y el valor como objeto de estudio de arquitecturas MoE hibridas.

## Limitaciones y advertencias

- Rendimiento absoluto bajo: MMLU 24.82, HellaSwag 30.10 y LAMBADA 22.88 indican capacidad limitada de conocimiento factual y comprension; no es adecuado para tareas que requieran precision alta.
- Solo ingles: no se declaran capacidades multilingues; su uso en castellano producira resultados deficientes.
- Riesgo de alucinacion elevado: con 53M parametros y un corpus de entrenamiento acotado, la generacion de hechos verificables es poco fiable.
- Sesgos: al entrenarse sobre corpus web (FineWeb-Edu, DCLM, WildChat, OpenHermes), puede heredar sesgos de genero, raza, religion y cultura presentes en esos datos; no se documentan evaluaciones de sesgo.
- Regresion en aritmetica: ArithMark-3 cae 9 puntos respecto al base (-9.00), lo que sugiere que el afinado degrada habilidades aritmeticas; el autor lo atribuye a que el benchmark mide habilidades no entrenadas, pero es una senal de cautela.
- Longitud de contexto no documentada: no se especifica la ventana de contexto, lo que impide garantizar conversaciones largas o documentos extensos.
- Tool calling no verificado: aunque el corpus incluye datos de function calling, no hay benchmarks publicados que midan su fiabilidad en produccion.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantias y de evaluaciones de seguridad hace recomendable validacion humana en cualquier despliegue real.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/WithinUsAI/WIUAI.Flash.MoE.Coder.Instruct.53m.a9m
- Repositorio del autor en Hugging Face: https://huggingface.co/WithinUsAI
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset DCLM-baseline-1.0: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0
- Dataset Cosmopedia: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
- Dataset SmolLM-corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset The Stack Smol: https://huggingface.co/datasets/bigcode/the-stack-smol
- Dataset OpenHermes-2.5: https://huggingface.co/datasets/teknium/OpenHermes-2.5
- Dataset hermes-function-calling-v1: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Dataset WildChat-4.8M: https://huggingface.co/datasets/allenai/WildChat-4.8M
- Dataset tulu-3-sft-personas-instruction-following: https://huggingface.co/datasets/allenai/tulu-3-sft-personas-instruction-following
- Dataset smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset smol-smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset MegaMath-Web-Pro-Max: https://huggingface.co/datasets/OctoThinker/MegaMath-Web-Pro-Max
- Dataset orca-math-word-problems-200k: https://huggingface.co/datasets/microsoft/orca-math-word-problems-200k
- Dataset FinePDFs-Edu: https://huggingface.co/datasets/HuggingFaceFW/finepdfs-edu
- Dataset FinePhrase: https://huggingface.co/datasets/HuggingFaceFW/finephrase
- Dataset DCLM-Ultra-1.1: https://huggingface.co/datasets/ArrowLabs/DCLM-Ultra-1.1
- Dataset FactBase-DCLM: https://huggingface.co/datasets/AxiomicLabs/FactBase-DCLM
- Dataset gooaq: https://huggingface.co/datasets/sentence-transformers/gooaq
- Dataset eli5: https://huggingface.co/datasets/sentence-transformers/eli5
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset Project Gutenberg: https://huggingface.co/datasets/manu/project_gutenberg
- Dataset BookCorpusOpen: https://huggingface.co/datasets/lucadiliello/bookcorpusopen
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
