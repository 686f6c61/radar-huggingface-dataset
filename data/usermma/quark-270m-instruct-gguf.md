# usermma/Quark-270m-Instruct-GGUF

## Resumen

Quark-270m-Instruct-GGUF es la version cuantizada en formato GGUF del modelo ThingAI/ARK-270M-Instruct, un modelo de lenguaje causal bilingue (italiano e ingles) entrenado desde cero por ThingAI. El repositorio lo publica el usuario usermma, que se limita a realizar la conversion a GGUF mediante llama.cpp; no introduce cambios en los pesos ni en el entrenamiento. Con 251.749.888 parametros totales (aproximadamente 270M nominales), se situa en la categoria de modelos ultra-ligeros pensados para despliegue en entornos con recursos muy limitados.

El modelo resuelve el problema de disponer de un LLM conversacional (instruct/chat) con licencia Apache 2.0, orientado especificamente al par italiano-ingles, que pueda ejecutarse en CPU, dispositivos de borde o GPUs de gama baja. Al estar entrenado desde cero y no ser un derivado de una familia mayor, su rendimiento absoluto es modesto, pero su huella de memoria y velocidad de inferencia lo hacen atractivo para prototipos, tareas de clasificacion generativa y aplicaciones embebidas.

La relevancia actual del modelo reside en la creciente demanda de SLMs (small language models) para inferencia local y privacidad de datos, asi como en la disponibilidad de pesos GGUF listos para llama.cpp, Ollama y servidores compatibles con la API de endpoints. La informacion publica sobre arquitectura interna, datos de entrenamiento y benchmarks es muy escasa en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (causal-lm); detalles internos no disponibles |
| Parametros totales | 251.749.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; los ejemplos de llama.cpp usan `-c 2048` |
| Tipos de cuantizacion | GGUF (se menciona q2_k en los ejemplos; el resto de variantes no detallado) |
| Idiomas soportados | italiano (it), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizacion); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

La model card indica que se trata de un modelo causal-lm entrenado desde cero (tag `trained-from-scratch`) y afinado para instrucciones mediante SFT (tag `sft`). No se especifica el numero de capas, dimensiones ocultas, cabeceras de atencion ni el mecanismo de atencion (si es atencion completa clasica o alguna variante lineal). Tampoco se detalla el volumen de tokens de preentrenamiento, la composicion del corpus ni si se aplicaron tecnicas de RLHF o DPO mas alla del SFT.

La unica innovacion documentada en este repositorio es la conversion a GGUF mediante llama.cpp, que permite ejecutar el modelo con cuantizaciones de 2 a 8 bits aproximadamente y aprovechar la infraestructura de llama.cpp (CPU, CUDA, Metal, Vulkan). No hay informacion sobre decodificacion especulativa, atencion lineal ni otras optimizaciones internas.

## Capacidades

- Generacion de texto causal en italiano e ingles.
- Modo instruct/chat: el modelo esta afinado para seguir instrucciones conversacionales.
- Razonamiento basico y respuesta a preguntas simples, limitado por su tamano.
- Generacion de codigo muy limitada; no se documenta soporte especifico.
- Matematicas elementales; no se documenta rendimiento en tareas aritmeticas complejas.
- Capacidades multilingues restringidas a italiano e ingles.
- No se documenta soporte de tool calling / function calling.
- No se documenta soporte de agentes ni multi-step reasoning.
- No se documenta vision, audio ni modo thinking.
- Compatible con endpoints (tag `endpoints_compatible`) y con llama-cpp.

## Casos de uso

- Prototipado rapido de chatbots en italiano: el modelo puede mantener conversaciones multi-turno sencillas con un contexto de 2048 tokens, suficiente para dialogos de atencion al cliente de baja complejidad y con coste de inferencia minimo.
- Clasificacion generativa y etiquetado de textos: dado su bajo coste, puede emplearse para generar etiquetas, resumenes cortos o reformulaciones de frases en italiano e ingles dentro de pipelines de procesamiento por lotes.
- Inferencia en dispositivos de borde: al caber en CPU y en GPUs de gama baja con cuantizacion q2_k, es adecuado para asistentes locales en portatiles, Raspberry Pi o entornos sin GPU dedicada.
- Generacion de texto asistida en editores: autocompletado, sugerencias de redaccion y correccion de estilo en italiano para herramientas ofimaticas o CMS.
- Filtrado y moderacion de contenido: generacion de explicaciones breves o reformulaciones para sistemas de moderacion que requieran un modelo local y de baja latencia.
- Educacion y demostraciones: util como modelo didactico para explicar el funcionamiento de un LLM causal bilingue y para experimentos de fine-tuning con recursos limitados.
- Servicios embebidos con requisitos de privacidad: al ejecutarse localmente via llama.cpp, los datos no salen del dispositivo, lo que encaja en escenarios con requisitos de confidencialidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 251,7M parametros, en FP16 el modelo ocupa aproximadamente 0,5 GB; en q2_k ronda los 0,15-0,2 GB; en q4_k_m alrededor de 0,25-0,3 GB; en q8_0 cerca de 0,3-0,35 GB. Cifras orientativas calculadas a partir del numero de parametros, no publicadas por el autor.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 o H100 no suponen cuello de botella por memoria. Tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU con al menos 1 GB de VRAM; incluso en iGPU y CPU.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama (previa importacion del GGUF), y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con servidores tipo OpenAI API.
- Latencia y throughput: no disponibles de forma oficial; por tamano, la generacion en CPU moderna deberia ser interactiva y en GPU muy rapida, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Quark-270m-Instruct-GGUF | 251,7M | no disponible (ejemplos con 2048) | it, en | Apache 2.0 | GGUF |
| Qwen2.5-0.5B-Instruct | ~494M | 32k (segun model card oficial) | multilingue | Apache 2.0 | safetensors, GGUF |
| SmolLM2-360M-Instruct | ~360M | 8k (segun model card oficial) | en (principalmente) | Apache 2.0 | safetensors, GGUF |
| TinyLlama-1.1B-Chat | ~1,1B | 2048 | en | Apache 2.0 | safetensors, GGUF |

Nota: los datos de los modelos comparables corresponden a sus model cards publicas; no se dispone de benchmarks del modelo Quark para comparar rendimiento de forma objetiva. La comparativa se limita a parametros, contexto, idiomas y licencia.

## Limitaciones y advertencias

- Rendimiento absoluto limitado: con 251,7M parametros, la calidad en razonamiento, matematicas y codigo sera inferior a modelos de 1B o mas; no debe usarse para tareas que exijan alta precision.
- Riesgo de alucinacion elevado: los SLM entrenados desde cero con corpus no documentados tienden a inventar hechos, especialmente fuera de sus idiomas de entrenamiento.
- Cobertura linguistica restringida: solo italiano e ingles; el rendimiento en castellano no esta garantizado.
- Contexto efectivo incierto: la model card no declara la longitud de contexto nativa; los ejemplos usan 2048 tokens, pero no se confirma si es el maximo entrenado.
- Sesgos desconocidos: no se documenta la composicion del dataset de entrenamiento, por lo que no es posible evaluar sesgos de genero, raza o ideologicos.
- Licencia Apache 2.0: permite uso comercial, pero el autor del modelo base (ThingAI) no publica garantias ni detalles de procedencia de datos; conviene revisar la model card original antes de un despliegue en produccion.
- Repositorio de cuantizacion: este repo no es el modelo original; para fine-tuning o inspeccion de pesos conviene acudir a ThingAI/ARK-270M-Instruct.
- Sin soporte documentado de tool calling ni agentes: no debe asumirse compatibilidad con frameworks de agentes sin validacion previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/usermma/Quark-270m-Instruct-GGUF
- Modelo base: https://huggingface.co/ThingAI/ARK-270M-Instruct
- llama.cpp: https://github.com/ggerganov/llama.cpp
