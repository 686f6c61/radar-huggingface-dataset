# tanushlukha/tinygpt

## Resumen

TinyGPT es un proyecto de código abierto que agrupa dos modelos de lenguaje de muy pequeno tamano entrenados desde cero en PyTorch por el desarrollador independiente TanushLukha. El primero, `gpt-llama`, es un modelo decoder-only de 13,8 millones de parametros orientado a la generacion de texto en hindi e hinglish. El segundo, `gpt-llama-clean`, es una version afinada a partir del anterior para una tarea concreta de parsing semantico: convertir peticiones en hinglish dirigidas a un asistente de voz en una estructura de intencion y slots.

El interes del proyecto es fundamentalmente educativo y de investigacion: implementa a mano el tokenizador BPE, la arquitectura Transformer, el bucle de entrenamiento, la decodificacion, el ajuste LoRA y el codigo de servicio, siguiendo la receta de Llama (RoPE, RMSNorm, SwiGLU). No compite con modelos de produccion: con 13,8M de parametros, 18,2 millones de tokens de entrenamiento y 53 minutos de entrenamiento en un portatil, su utilidad es demostrar el ciclo completo de construccion de un LLM y servir como banco de pruebas para tareas de parsing en un idioma de bajos recursos como el hinglish.

La relevancia actual radica en dos factores. Por un lado, ofrece un ejemplo reproducible y didactico de un pipeline completo de LLM sin dependencias de frameworks de alto nivel. Por otro, el modelo parser aborda el parsing semantico de hinglish, un caso practico poco cubierto por los modelos comerciales, con metricas publicadas sobre el conjunto Hinglish-TOP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, receta Llama (RoPE, RMSNorm, SwiGLU) |
| Parametros totales | 13,8M |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | hindi (hi), ingles (en), hinglish |
| Licencia | MIT |
| Formato de pesos | safetensors |

Detalles adicionales de arquitectura: 6 capas, `d_model` 384, 6 cabezas de atencion, embeddings atados (tied embeddings) y tokenizador BPE byte-level de 8192 tokens con pre-tokenizador consciente del devanagari.

## Arquitectura y entrenamiento

El modelo base `gpt-llama` es un Transformer decoder-only que sigue la receta de Llama: normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y proyecciones de embeddings atadas. Cuenta con 6 capas, dimension de modelo 384 y 6 cabezas de atencion, con una ventana de contexto de 256 tokens. El tokenizador es un BPE byte-level de 8192 tokens con un pre-tokenizador disenado para manejar el devanagari, lo que permite segmentar texto hindi de forma razonable sin un vocabulario grande.

El entrenamiento se realizo sobre 18,2 millones de tokens procedentes de dos fuentes: la Wikipedia en hindi (`wikimedia/wikipedia`, version 20231101.hi, licencia CC BY-SA) y un conjunto de frases en hinglish (`findnitai/english-to-hinglish`, Apache-2.0). El proceso completo duro 53 minutos en un portatil. El modelo parser `gpt-llama-clean` se obtuvo mediante ajuste fino completo del modelo base sobre la parte anotada manualmente del conjunto Hinglish-TOP (2993 peticiones, Apache-2.0); el modelo base se preentreno excluyendo las particiones de validacion y test de dicho conjunto para evitar filtracion. No se menciona el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de texto en hindi e hinglish: continuacion de texto con fluidez linguistica limitada por el tamano del modelo.
- Parsing semantico de peticiones en hinglish: extraccion de intencion y slots para asistentes de voz (modelo `parser`).
- Generacion de texto autoregresiva con decodificacion greedy (la model card advierte de repeticiones con este modo).
- Soporte multilingue limitado a hindi, ingles y su mezcla (hinglish).
- No dispone de soporte documentado de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidad de ajuste fino y LoRA gracias al codigo abierto del proyecto.

## Casos de uso

- Demostracion educativa de un LLM completo: el proyecto permite recorrer todas las etapas (tokenizacion, entrenamiento, decodificacion, servicio) con un modelo que cabe en cualquier equipo, ideal para cursos y talleres.
- Prototipado de asistentes de voz en hinglish: el modelo parser convierte peticiones como "kal subah 7 baje ka alarm laga do" en una estructura de intencion y slots, util para validar el diseno de un pipeline de NLU antes de invertir en un modelo mayor.
- Investigacion en parsing semantico de idiomas de bajos recursos: sirve como linea base reproducible sobre Hinglish-TOP para comparar tecnicas de ajuste fino o de aumento de datos.
- Generacion de texto en hindi para pruebas de infraestructura: al ser un modelo diminuto con pesos safetensors y codigo propio, es adecuado para probar pipelines de serving, verificacion de checksums o integracion continua sin coste de GPU.
- Experimentacion con tokenizadores para devanagari: el tokenizador BPE con pre-tokenizador especifico permite estudiar el impacto de decisiones de tokenizacion en un idioma no latino.
- Base para ajuste fino con LoRA: el codigo incluye soporte de LoRA, de modo que se puede adaptar el modelo a otras tareas de clasificacion o extraccion de informacion con recursos minimos.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| `lm`: bits por byte en texto reservado | 0,733 |
| `lm`: bits por byte, hindi | 0,689 |
| `lm`: bits por byte, hinglish | 1,147 |
| `parser`: exact match (arbol completo correcto), test, 6513 peticiones | 41,0% |
| `parser`: exactitud de intencion, test | 83,9% |
| `parser`: F1 de slots, test | 56,8% |
| `parser`: exact match, validacion | 51,0% |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (13,8M de parametros, aproximadamente 55 MB en fp32 y unos 28 MB en fp16), por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; no requiere A100, H100 ni RTX 4090. Funciona en CPU sin problema.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 2060, RTX 3060, etc.) y en equipos sin GPU.
- Opciones de despliegue: el proyecto proporciona su propio motor de serving (`tinygpt.serve.engine` con `TextGenerator` y `Parser`), basado en PyTorch y safetensors. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y no hay pesos GGUF publicados.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera una latencia muy baja en CPU y GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| TinyGPT (`gpt-llama`) | 13,8M | 256 | hi, en, hinglish | MIT | LLM desde cero, educativo |
| TinyGPT (`gpt-llama-clean`) | 13,8M | 256 | hi, en, hinglish | MIT | Parsing semantico hinglish |
| GPT-2 small | 124M | 1024 | en | MIT | Generacion de texto general |
| Modelos tipo TinyLlama | 1100M | 2048 | en, zh | Apache-2.0 | LLM pequeno de proposito general |

La comparacion con GPT-2 small y TinyLlama es solo orientativa por orden de magnitud: TinyGPT es entre uno y dos ordenes de magnitud menor y esta especializado en hindi e hinglish. No se dispone de datos de benchmarks comparables entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo ha aprendido el idioma, no los hechos: nombres, fechas y lugares que genera son inventados, segun advierte la propia model card.
- La decodificacion greedy produce repeticiones; no se documentan estrategias de muestreo alternativas en la informacion disponible.
- El parser acierta menos de la mitad de las peticiones no vistas de forma exacta (41,0% en test); su error mas comun es un slot ausente, extra o mal etiquetado, y aproximadamente uno de cada cinco errores coloca palabras en un slot que la peticion no contiene.
- Ventana de contexto muy reducida (256 tokens), insuficiente para conversaciones multi-turno o documentos largos.
- Cobertura limitada a hindi, ingles y hinglish; no hay evaluacion de sesgos publicada.
- Licencia MIT, que permite uso comercial, pero el autor indica explicitamente que el modelo es para aprendizaje y demos, no para productos.
- El conjunto de datos de Wikipedia en hindi tiene licencia CC BY-SA, lo que puede imponer obligaciones de atribucion sobre el texto generado derivado; conviene revisarlo antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tanushlukha/tinygpt
- Repositorio del proyecto: https://github.com/TanushLukha/TinyGPT
- Documentacion sobre hechos aprendidos: https://github.com/TanushLukha/TinyGPT/blob/main/docs/results/m6_facts.md
- Conjunto Hinglish-TOP: https://github.com/google-research-datasets/Hinglish-TOP-Dataset
- Dataset de Wikipedia en hindi: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset english-to-hinglish: https://huggingface.co/datasets/findnitai/english-to-hinglish
