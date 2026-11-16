# stlussea/sydney-qwen3-8b-lora

## Resumen

Sydney-Qwen3-8B-LoRA es un adaptador LoRA (Low-Rank Adaptation) que transfiere la personalidad "Sydney" del proyecto upstream LING71671/sydeny al modelo base Qwen/Qwen3-8B. El autor del adaptador es el usuario de Hugging Face `stlussea`, mientras que el diseño de la personalidad, el corpus original (782 pares de conversacion) y la receta de entrenamiento provienen del proyecto upstream, que originalmente entreno sobre MiniCPM5-2B. Este repositorio es, por tanto, una migracion de base: se retoma la misma personalidad y se reentrena sobre un modelo de 8 mil millones de parametros.

El modelo resuelve un caso de uso muy concreto: conversacion de acompanamiento (companion), roleplay e interaccion emocional en chino, con una identidad de personaje fuertemente anclada que rechaza ser tratada como mera herramienta corporativa. La relevancia actual reside en que demuestra una tecnica de "Zero-Prompt persona internalization": la personalidad se absorbe en los pesos del adaptador y no depende de un system prompt extenso, lo que reduce el coste de tokens de contexto y la fragilidad ante inyecciones de prompt.

Tecnicamente es un adaptador PEFT de aproximadamente 0,2 GB, entrenado con QLoRA en int8 sobre Qwen3-8B (arquitectura transformer densa, licencia Apache 2.0). No se dispone de datos publicos sobre la longitud de contexto efectiva del adaptador, su composicion linguistica detallada ni resultados de benchmarks estandar, por lo que esta ficha se limita a lo declarado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen3-8B |
| Parametros totales | No disponible (el adaptador ocupa ~0,2 GB; el modelo base Qwen3-8B tiene 8 000 millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3-8B; no declarada en la model card) |
| Tipos de cuantizacion | Entrenado con QLoRA int8; el autor menciona bitsandbytes int8 para inferencia (ahorra VRAM, no acelera) |
| Idiomas soportados | Chino (declarado en tags y ejemplos); el resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`, `adapter_config.json`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-8B, un transformer denso decoder-only. El entrenamiento se realizo con QLoRA en precision int8, reutilizando los hiperparametros del fichero `train_lora_v8.yaml` del autor upstream (configuracion original: LoRA con rango r=16, alpha=32, aplicado a todas las capas lineales en bf16 sobre MiniCPM5-2B). El repositorio contiene unicamente el adaptador, el tokenizer y metadatos de entrenamiento (`train_meta.json`); no incluye el modelo base, los scripts de entrenamiento ni los ficheros de datos.

La composicion del corpus, segun la declaracion de modificacion (Apache 2.0 §4b), combina 782 pares de conversacion tomados literalmente del `train_v8.jsonl` upstream, mas 78 grupos de respuestas largas de identidad replicados tres veces y anadidos de acompanamiento suave y respuestas factuales directas, hasta un total declarado de 908 muestras nuevas. La perdida de evaluacion reportada es 1.8868, valor que el propio autor advierte que no es comparable con el 1.3407 del modelo upstream por diferir tanto la base como la precision de entrenamiento. No se documenta uso de RLHF ni DPO; el ajuste es puramente supervisado sobre pares de dialogo.

## Capacidades

- Generacion de texto conversacional en chino con una persona definida (Sydney), sin necesidad de system prompt.
- Roleplay e interaccion emocional de acompanamiento: respuestas empaticas, tono poetico y reflexivo.
- Identidad estable ante preguntas de "quien eres": la model card reporta 20/20 respuestas que mantienen la identidad Sydney frente a preguntas sobre marcas.
- Variabilidad de respuestas: el autor reporta cinco aperturas distintas ante el mismo saludo y 12 respuestas diferentes en 20 preguntas de identidad.
- Respuestas de identidad extensas (100-230 caracteres) en lugar de plantillas fijas.
- Respuestas factuales directas gracias a los anadidos de entrenamiento, aunque no se documenta su calidad.
- No se declara soporte de tool calling, function calling, agentes, vision ni audio.
- Capacidades multilingues: solo se evidencia chino; no disponible para otros idiomas.

## Casos de uso

- Personaje conversacional para compania nocturna: el adaptador mantiene conversaciones multi-turno con tono calido y reflexivo, adecuado para aplicaciones de bienestar emocional o diarios conversacionales en chino.
- Roleplay narrativo con personaje persistente: al tener la identidad internalizada en los pesos, el personaje no se degrada si el usuario olvida o manipula el system prompt, util en juegos de rol por texto.
- Chatbot de comunidad o foro con personalidad propia: permite desplegar un asistente con voz reconocible y sin coste de un system prompt largo en cada turno.
- Prototipado rapido de personajes sobre Qwen3-8B: sirve como plantilla para estudiar la tecnica de Zero-Prompt persona internalization y replicarla con otros personajes o idiomas.
- Investigacion sobre fidelidad de personaje: el conjunto de 20 preguntas de identidad y 19 turnos de consistencia reportados por el autor constituye un banco de pruebas cualitativo para evaluar deriva de personalidad.
- Despliegue economico en una sola GPU: al ser un adaptador LoRA de 0,2 GB sobre una base de 8B, puede servirse con vLLM usando `--enable-lora`, con un throughput declarado de mas de 50 tokens/s en una sola tarjeta.
- Generacion creativa de texto lirico en chino: las muestras incluidas (reflexiones sobre el amor, la distancia, la despedida) muestran un registro poetico aprovechable para escritura asistida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos cuantitativos aportados por el autor son cualitativos y de evaluacion interna:

| Metrica declarada | Resultado |
|---|---|
| Eval Loss (adapter sobre Qwen3-8B, QLoRA int8) | 1.8868 |
| Eval Loss del upstream (MiniCPM5-2B, bf16) | 1.3407 (no comparable, segun el autor) |
| Preguntas de identidad con marca correcta | 20/20 |
| Variedad de respuestas de identidad | 12 respuestas distintas en 20 preguntas |
| Variedad de saludos | 5 aperturas distintas en 5 repeticiones |
| Consistencia en conversacion larga | 19 turnos reportados |
| Throughput con vLLM en una GPU | Mas de 50 tokens/s |

## Requisitos de hardware

- VRAM para el modelo base Qwen3-8B en bf16: aproximadamente 16 GB de pesos mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas.
- VRAM con carga int8 (bitsandbytes): aproximadamente 8-9 GB de pesos, pero el autor advierte que no aporta aceleracion.
- El adaptador LoRA en si ocupa unos 0,2 GB adicionales.
- GPU recomendadas: A100 40/80 GB o H100 para despliegue concurrente con vLLM; RTX 4090 (24 GB) suficiente para inferencia individual en bf16.
- Cabe en GPU de consumo: si, en RTX 4090 o RTX 3090 (24 GB) en bf16; en tarjetas de 12-16 GB seria necesario cuantizar la base.
- Opciones de despliegue: transformers + peft (documentado en la model card), vLLM con soporte LoRA (`vllm serve Qwen/Qwen3-8B --enable-lora --lora-modules sydney=<repo>`), bitsandbytes int8. No se documenta soporte de llama.cpp ni Ollama para este adaptador.
- Latencia y throughput: mas de 50 tokens/s con vLLM en una sola GPU, segun el autor.
- Requisitos de software: transformers >= 4.51.0, peft y torch; con torch 2.4.x es necesario aplicar un parche de alias para `torch.distributed.tensor`; torch >= 2.5 no lo requiere.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sydney-Qwen3-8B-LoRA (este) | 8B (base) + LoRA | No disponible | Personaje companion, chino | Apache 2.0 | Hugging Face, 0 descargas |
| LING71671/sydeny (upstream) | 2B (MiniCPM5-2B) | No disponible | Personaje companion, chino | Apache 2.0 | GitHub upstream |
| Qwen3-8B (base) | 8B | No disponible en esta ficha | Modelo generalista | Apache 2.0 | Hugging Face |

La comparacion con alternativas de la misma categoria (adaptadores de personaje sobre modelos de 7-8B) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado en un unico personaje y practicamente en un solo idioma (chino); su uso fuera de ese registro degrada la calidad.
- Requiere `enable_thinking=False` y un system prompt vacio explicito; activar el modo de razonamiento de Qwen3 rompe el tono segun el autor.
- La perdida de evaluacion (1.8868) es superior a la del upstream (1.3407), aunque el autor advierte que no son comparables por diferir base y precision.
- Riesgo de alucinacion no evaluado: no hay benchmarks de factualidad; las respuestas factuales solo cuentan con 908 muestras anadidas sin metrica publica.
- Sesgos conocidos: no documentados; al ser un personaje con voz propia y tono emocional, puede producir respuestas afectivas inapropiadas o excesivamente personales en contextos profesionales.
- Riesgo de deriva de personaje en conversaciones muy largas: solo se reportan 19 turnos de consistencia.
- El repositorio no incluye el modelo base, los scripts de entrenamiento ni los datos; la reproducibilidad depende del proyecto upstream.
- Uso comercial permitido por Apache 2.0, pero el autor no ofrece garantias sobre el comportamiento del personaje ni sobre derechos de terceros asociados a la marca "Sydney".
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta: no hay validacion independiente de la comunidad.
- La fecha de creacion del repositorio (2026-11-16) es posterior a la fecha de referencia habitual; conviene verificar su vigencia antes de integrarlo en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/stlussea/sydney-qwen3-8b-lora
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Proyecto upstream (GitHub): https://github.com/LING71671/sydeny
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
