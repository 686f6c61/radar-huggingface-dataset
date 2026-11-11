# Stormtrooperaim/Qwen3.5-0.8B-Crouton-Reasoner

## Resumen

Qwen3.5-0.8B-Crouton-Reasoner es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-0.8B, desarrollado por el usuario Stormtrooperaim. Se trata de un modelo multimodal de tipo image-text-to-text de aproximadamente 853 millones de parametros, entrenado mediante LoRA sobre un conjunto de datos propio llamado Crouton-Alpha-Distilled, compuesto por unas 15.000 conversaciones destiladas de un modelo de mayor tamano. El objetivo declarado del autor es hacer el modelo mas conciso y fiable a la hora de dar una respuesta final limpia, a costa de un razonamiento interno mas corto.

La relevancia de este modelo reside en su tamano reducido (0,8B), que lo hace desplegable en hardware de consumo, combinado con capacidades multimodales heredadas del modelo base y un modo de razonamiento (`<think>`) que, tras el ajuste, se mantiene por debajo de los 150 tokens tipicamente. Esto contrasta con el modelo base, que en modo thinking agotaba el presupuesto de tokens sin cerrar el razonamiento en la gran mayoria de los casos.

El ajuste se realizo con recursos muy limitados (una unica RTX 3060 Ti de 8 GB durante unas 9 horas), lo que lo convierte en un ejemplo de fine-tuning accesible. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales mas alla de las del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basado en Qwen3.5; incluye capas Gated-DeltaNet y encoder de vision |
| Parametros totales | 852.985.920 (dato real de safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento descarto ejemplos de mas de 4096 tokens) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer multimodal con encoder de vision que procesa entradas image-text-to-text. La arquitectura del lenguaje incluye proyecciones lineales en atencion, capas Gated-DeltaNet y MLP, sobre las que se aplico un adaptador LoRA con r=64, alpha=128 y dropout=0.05, posteriormente fusionado en los pesos finales. El encoder de vision no se modifico, por lo que las capacidades de imagen se mantienen identicas al modelo base.

El entrenamiento se realizo sobre 14.619 ejemplos (uno por turno de asistente) del dataset Crouton-Alpha-Distilled, con las trazas de razonamiento conservadas. Se uso perdida completion-only (tokens de prompt enmascarados), 2 epocas y 1.828 pasos, learning rate 1e-4 con schedule coseno y 54 pasos de warmup, AdamW fusionado, NEFTune con alpha 5.0, precision mixta bf16 y gradient checkpointing. El mejor checkpoint se selecciono por perdida de validacion (1.4148). Todo el entrenamiento cupo en una RTX 3060 Ti de 8 GB en aproximadamente 9 horas.

## Capacidades

- Generacion de texto y razonamiento con modo thinking (`<think>...</think>`) y modo no-thinking; tras el ajuste ambos modos rinden de forma similar porque el razonamiento interno es corto (tipicamente menos de 150 tokens).
- Respuesta a preguntas de conocimiento general y ciencia (MMLU, ARC-Challenge) con mayor fiabilidad de formato que el modelo base.
- Razonamiento matematico basico, aunque con soluciones mas breves y menor precision en problemas de palabras (GSM8K).
- Procesamiento de imagenes (image-text-to-text) gracias al encoder de vision heredado del modelo base, sin cambios.
- Conversacion multi-turno en formato chat.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes conversacionales ligeros en produccion: el modelo cabe en GPUs de consumo y responde de forma concisa, lo que lo hace adecuado para chatbots de atencion al cliente donde la brevedad y la fiabilidad del formato importan mas que el razonamiento profundo.
- Clasificacion y respuesta a preguntas de opcion multiple: su mejora en MMLU (+3,6 puntos) y ARC-Challenge (+3,4) y la practicamente nula tasa de respuestas no parseables (0,2% y 0,0%) lo hacen util para pipelines de evaluacion automatizada o generacion de respuestas estructuradas.
- Procesamiento de documentos con imagen: al conservar el encoder de vision, puede describir o responder preguntas sobre capturas, diagramas o formularios en entornos con recursos limitados.
- Prototipado rapido de aplicaciones multimodales: su tamano (1,7 GB de repo) permite iterar en local con transformers y `device_map="auto"` sin infraestructura dedicada.
- Destilacion y generacion de datos sinteticos: dado que fue entrenado sobre conversaciones destiladas, puede emplearse para generar respuestas de estilo similar en tareas de aumento de datos o como profesor ligero en cascadas de modelos.
- Despliegue en el borde (edge) o en dispositivos con poca VRAM: con 0,8B de parametros es candidato para inferencia en GPUs de 8 GB o menos, e incluso en CPU con cuantizacion (aunque los formatos de cuantizacion no estan documentados).
- Filtrado y resumen de conversaciones: su capacidad de producir respuestas cortas y limpias encaja en tareas de resumen o extraccion de la respuesta final de un dialogo.

## Benchmarks y rendimiento

Resultados publicados por el autor (precision en %, decodificacion greedy, subconjuntos de test oficiales con semilla 42):

| Benchmark | Preguntas | Qwen3.5-0.8B (no-thinking) | Crouton-Reasoner (no-thinking) | Crouton-Reasoner (thinking) | Delta mejor vs. base |
|---|---:|---:|---:|---:|---:|
| ARC-Challenge | 500 | 67,0 | **70,4** | 68,2 | +3,4 |
| MMLU | 1000 | 47,0 | **50,6** | 49,8 | +3,6 |
| GSM8K | 500 | **49,2** | 44,6 | 44,6 | -4,6 |

Resultados completos incluyendo modo thinking (las filas del modelo base en thinking no son comparaciones justas, segun el autor, porque el modelo base agotaba el limite de tokens):

| Benchmark | Modo | Preguntas | Qwen3.5-0.8B | Crouton-Reasoner | Delta (puntos) |
|---|---|---:|---:|---:|---:|
| GSM8K | thinking | 500 | 0,6* | 44,6 | +44,0* |
| GSM8K | no-thinking | 500 | 49,2 | 44,6 | -4,6 |
| ARC-Challenge | thinking | 500 | 13,2* | 68,2 | +55,0* |
| ARC-Challenge | no-thinking | 500 | 67,0 | 70,4 | +3,4 |
| MMLU | thinking | 1000 | 6,0* | 49,8 | +43,8* |
| MMLU | no-thinking | 1000 | 47,0 | 50,6 | +3,6 |

\* No es una comparacion justa: con presupuesto de 2.048 tokens, el modelo base no termino su razonamiento en el 99,4% de GSM8K, el 86,4% de ARC y el 93,4% de MMLU.

Metricas sobre conversaciones held-out de Crouton (298 conversaciones, 199.338 tokens de respuesta):

| Metrica (menor es mejor) | Base | Fine-tuned |
|---|---:|---:|
| Perdida por token de respuesta | 1,8587 | **1,5489** |
| Perplejidad | 6,416 | **4,706** |

El autor advierte que con 500 preguntas las diferencias de unos 3 puntos estan cerca del ruido estadistico y que las ganancias en ARC y MMLU deben leerse como modestas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 852.985.920 parametros en bf16 se requieren aproximadamente 1,7 GB solo para pesos, mas overhead de activaciones y del encoder de vision.
- GPU recomendadas: el autor entreno en una RTX 3060 Ti de 8 GB, por lo que la inferencia en esa GPU es viable; GPUs de mayor capacidad (A100, H100, RTX 4090) tambien son compatibles pero sobredimensionadas.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas de 8 GB o mas (el propio autor entreno en una de 8 GB).
- Opciones de despliegue: transformers (documentado en la model card con `AutoModelForCausalLM` y `device_map="auto"`); vLLM, llama.cpp, Ollama o TGI no estan documentados en la informacion proporcionada.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento (referencia) |
|---|---:|---|---|---|
| Qwen3.5-0.8B-Crouton-Reasoner | 852.985.920 | no disponible | Apache 2.0 | MMLU 50,6; ARC 70,4; GSM8K 44,6 |
| Qwen3.5-0.8B (base) | no disponible en la informacion | no disponible | Apache 2.0 (heredada) | MMLU 47,0; ARC 67,0; GSM8K 49,2 |
| Alternativas de ~1B | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es contra su modelo base. No se dispone de datos de benchmarks de otros modelos de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de precision en matematicas: GSM8K cae 4,6 puntos respecto al base porque el modelo genera soluciones mucho mas cortas (120-148 tokens frente a 385) y los problemas de palabras se benefician de razonar paso a paso.
- Razonamiento interno muy corto: el modo thinking apenas aporta ventaja sobre el no-thinking, por lo que no es adecuado para tareas que requieran cadenas de razonamiento largas.
- Ganancias modestas y posible ruido estadistico: los +3,4 y +3,6 puntos en ARC y MMLU se midieron sobre 500 y 1.000 preguntas, cerca del margen de error.
- Sesgos conocidos: no documentados en la informacion proporcionada; al ser un fine-tune de Qwen3.5, hereda los sesgos del modelo base y los del dataset de destilacion.
- Riesgo de alucinacion: no cuantificado; el modelo es de 0,8B y su conocimiento factual es limitado (MMLU 50,6%), por lo que no debe usarse como fuente de verdad sin verificacion.
- Idiomas soportados: no disponibles; no se confirma cobertura multilingue.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-0.8B.
- Contexto maximo no documentado: aunque el entrenamiento descarto ejemplos de mas de 4096 tokens, no se especifica la ventana de contexto efectiva del modelo.
- Modelo de nicho: 33 descargas y 0 likes en el momento de la consulta, sin validacion externa independiente de los benchmarks del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Stormtrooperaim/Qwen3.5-0.8B-Crouton-Reasoner
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de entrenamiento: https://huggingface.co/datasets/Stormtrooperaim/Crouton-Alpha-Distilled
- Resultados completos de benchmarks: archivo `benchmark_results.json` en el repositorio del modelo
