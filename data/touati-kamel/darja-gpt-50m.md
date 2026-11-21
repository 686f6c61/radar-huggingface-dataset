# touati-kamel/darja-gpt-50m

## Resumen

Darja-GPT-50M es un modelo de lenguaje causal (autoregresivo) de 54,8 millones de parametros, entrenado desde cero por el autor independiente touati-kamel exclusivamente sobre dariya argelina (الدارجة الجزائرية / Dziri), el dialecto arabigo oral de Argelia. Frente a aproximaciones anteriores que adaptaban codificadores enmascarados bidireccionales como DziriBERT con decodificadores seq2seq, este modelo se construye nativamente como un decodificador transformer moderno, con adaptadores LoRA por dominio (`DomainLoRALinear`) y soporte de Classifier-Free Guidance (CFG) en inferencia.

El problema que aborda es el colapso de registro y la fuga entre dominios tipicos del modelado de dialectos de bajos recursos: sin mecanismos de condicionamiento, un modelo pequeno mezcla registros culinarios, deportivos, tecnicos y coloquiales. La propuesta del autor sustituye la modulacion FiLM de iteraciones anteriores (v3, v4) por adaptadores LoRA dedicados por dominio sobre `o_proj` y `down_proj`, con rango r=16 y alpha=16.0, y anade CFG para suprimir terminologia fuera de dominio en tiempo de generacion.

El modelo usa un tokenizador BPE propio de 24.000 tokens entrenado sobre transcripciones conversacionales, con una fertilidad de 1,431 tokens/palabra (reduccion del 39,2% frente a Qwen2.5/Qwen3, que rinden 2,354). El repositorio ocupa 6,6 GB, aunque el peso real de los parametros en safetensors es de 54.794.240, y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (autoregresivo) con adaptadores LoRA por dominio (`DomainLoRALinear`, r=16, alpha=16.0) sobre `o_proj` y `down_proj` |
| Parametros totales | 54.794.240 (54,8 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens (bloques de chunking a nivel de documento) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | Arabe (ar), en concreto dariya argelina; `multilingual: false` |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers); repo de 6,6 GB |

## Arquitectura y entrenamiento

El modelo es un decoder transformer causal entrenado desde cero, no un ajuste de un modelo preentrenado. La innovacion central es el condicionamiento por dominio: seis dominios mas un estado nulo (`<NULL>`, d=6) se inyectan mediante capas LoRA independientes en las proyecciones de salida de atencion y de down-proyeccion del MLP. El autor documenta que la variante previa con FiLM producia distancias de pesos entre dominios de solo 15-20% alrededor de la media y una RMS de activacion estancada en ~0,230, con contaminacion cruzada severa; los adaptadores LoRA de la v5 alcanzan distancias de delta de pesos del 118-173% de la media.

El entrenamiento se realizo en una unica GPU T4 con AdamW y scheduler coseno, sobre 52.038 ejemplos empaquetados de 1.024 tokens, derivados de un corpus de 11.151 documentos de dariya argelina consolidados en seis dominios. Se aplica doble dropout de regularizacion: 20% para la etiqueta de dominio y 10% para CFG (dropout del ID de dominio hacia `<NULL>`). En inferencia, los logits condicionales y nulos se extrapolan segun `z_guided = z_NULL + s · (z_cond - z_NULL)`, con escala de guiado s entre 1,5 y 2,5.

El tokenizador BPE a nivel de byte, con vocabulario de 24.000 tokens, se entreno sobre texto conversacional crudo y alcanza 1,431 tokens/palabra, comparable a DarijaBERT (1,427) y DziriBERT (1,429) pero con 2x a 3,3x menos parametros de vocabulario.

## Capacidades

- Generacion de texto causal en dariya argelina, con registros diferenciados por dominio (culinario, deportivo, tecnico, podcast, narrativo y coloquial).
- Condicionamiento de dominio explicito mediante ID de dominio y adaptadores LoRA dedicados.
- Guiado por CFG en inferencia para suprimir fugas fuera de dominio y afinar terminologia especializada.
- Tokenizacion morfologica nativa del dialecto, con menor fertilidad que modelos fundacionales multilingues.
- Compatibilidad con la libreria transformers y con `endpoints_compatible` (despliegue via Inference Endpoints).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue limitada: el modelo declara `multilingual: false` y solo el idioma `ar`.

## Casos de uso

- Generacion de dialogos sinteticos en dariya para aumento de datos: el modelo produce turnos conversacionales en registros coloquiales que pueden usarse para ampliar corpus de entrenamiento de clasificadores o traductores de dialecto, aprovechando el condicionamiento por dominio para evitar mezclar registros.
- Chatbots de atencion al cliente en dialecto argelino: con contexto de 1.024 tokens y guiado CFG hacia el dominio coloquial, puede gestionar intercambios breves de soporte en dariya sin derivar al arabe estandar.
- Generacion de contenido culinario y gastronomico: seleccionando el dominio culinario y una escala CFG de 1,5-2,5, el modelo genera recetas y descripciones de platos sin contaminacion de vocabulario deportivo o tecnico.
- Creacion de contenido deportivo local: el dominio deportivo permite redactar cronicas y comentarios sobre futbol argelino en registro oral, util para medios digitales que publican en dariya.
- Prototipado de traduccion dialecto-a-dialecto o dialecto-a-arabe estandar: al ser un modelo causal pequeno, puede servir como componente generador en pipelines de traduccion con un modelo de alineacion externo, con coste computacional minimo.
- Investigacion academica sobre modelado de dialectos de bajos recursos: el modelo y su receta (adaptadores por dominio, CFG, tokenizador propio) sirven como referencia reproducible para experimentos con corpus pequenos en una sola GPU T4.
- Generacion de transcripciones estilo podcast: el dominio podcast permite producir guiones conversacionales largos por tramos de 1.024 tokens con continuidad de registro.

## Benchmarks y rendimiento

| Metrica | Darja-GPT-50M | Referencia |
|---|---|---|
| Fertilidad del tokenizador (tokens/palabra) | 1,431 | Qwen2.5/Qwen3: 2,354; DarijaBERT: 1,427; DziriBERT: 1,429 |
| Reduccion de fertilidad vs Qwen2.5 | -39,2% (IC 95% [38,4%, 40,0%]) | — |
| Parametros totales | 54,8 M | — |
| Distancia de delta de pesos entre dominios (LoRA v5) | 118%-173% de la media | FiLM v3/v4: 15%-20% |
| RMS de activacion (FiLM, variante descartada) | ~0,230 | — |

No se han publicado resultados de benchmarks de calidad de generacion (perplejidad, MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 54,8 M parametros en fp32 son aproximadamente 220 MB de pesos; en fp16 unos 110 MB. La VRAM real dependera del runtime y del cache KV para contexto de 1.024 tokens, pero el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU; el autor entreno el modelo en una unica T4.
- Cabe en GPU consumer: si, sin restricciones practicas por tamano.
- Opciones de despliegue: transformers (libreria declarada), Inference Endpoints (`endpoints_compatible`). No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Darja-GPT-50M | 54,8 M | 1.024 tokens | Decoder causal nativo con LoRA por dominio y CFG | Apache 2.0 | Hugging Face |
| DziriBERT | No disponible en la informacion proporcionada | No disponible | Encoder enmascarado bidireccional para dariya | No disponible | Hugging Face |
| DarijaBERT | No disponible en la informacion proporcionada | No disponible | Encoder enmascarado bidireccional para dariya marroqui | No disponible | Hugging Face |
| Qwen2.5 / Qwen3 (referencia de fertilidad) | No disponible | No disponible | Modelo fundacional multilingue | No disponible | Hugging Face |

La comparacion con DziriBERT y DarijaBERT se limita a la fertilidad del tokenizador (1,431 frente a 1,429 y 1,427 respectivamente): Darja-GPT usa 2x a 3,3x menos parametros de vocabulario. No hay datos comparativos de rendimiento generativo.

## Limitaciones y advertencias

- Modelo de 54,8 M parametros entrenado desde cero: la calidad de generacion sera limitada en coherencia a largo plazo y conocimiento factual, muy por debajo de modelos fundacionales.
- Contexto de solo 1.024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Entrenado exclusivamente en dariya argelina: no generaliza a arabe estandar, otros dialectos arabes ni otros idiomas.
- Riesgo de alucinacion elevado por tamano y dominio de entrenamiento acotado; no apto para uso factual sin verificacion.
- Sesgos del corpus de origen (11.151 documentos) no evaluados ni documentados en la informacion disponible.
- El guiado CFG requiere ajuste manual de la escala s (1,5-2,5); valores fuera de rango pueden degradar la fluidez gramatical.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantias y el autor no documenta evaluaciones de seguridad o sesgo.
- El repositorio de 6,6 GB es desproporcionado frente al peso real de los parametros, lo que puede ralentizar la descarga y el almacenamiento en produccion.
- No se documenta soporte de tool calling ni de agentes, lo que limita su uso en pipelines automatizados complejos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/touati-kamel/darja-gpt-50m
- Dataset: https://huggingface.co/datasets/touati-kamel/algerian-darja-corpus
- Tokenizador: https://huggingface.co/touati-kamel/darja-tokenizer-50m
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- PyTorch: https://pytorch.org/
