# Vortex5/Scarlet-Shadow-31B

## Resumen

Scarlet-Shadow-31B es un modelo de lenguaje de 31.273 millones de parámetros creado mediante la fusión de cuatro modelos base de la familia Gemma 4 de Google, todos ellos con arquitectura de 31B parámetros. El autor, Vortex5, ha combinado Google Gemma-4-31B-it, ReadyArt/gemma-4-31B-it-scotoma-2, ReadyArt/Dark-Scarlett-v2.0-31B y su propio Vortex5/Glimmering-Citrus-31B utilizando el método de fusión "fcar" de mergekit. El modelo está diseñado específicamente para tareas de rol, escritura creativa y narración de historias, con un enfoque en interacción de personajes y diálogos multi-turno.

El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas. Los pesos están en formato safetensors con precisión bfloat16, y el repositorio ocupa 62.6 GB. Aunque el pipeline declarado es "image-text-to-text", no se especifican capacidades de visión en la documentación, por lo que esta característica no está confirmada. Es un modelo denso de 31B parámetros, no una mezcla de expertos, y está pensado para ejecutarse en hardware con al menos 24 GB de VRAM en cuantización Q4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4) |
| Parametros totales | 31.273.088.876 (31.27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredado de Gemma-4-31B-it, presumiblemente 128k) |
| Tipos de cuantizacion | No publicado por el autor (safetensors en bfloat16) |
| Idiomas soportados | No disponible (heredado de Gemma-4-31B-it, multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

Scarlet-Shadow-31B es un modelo denso basado en la arquitectura Transformer de Google Gemma 4 de 31B parámetros. No se trata de un modelo entrenado desde cero, sino de una fusión de cuatro modelos pre-entrenados mediante mergekit con el método "fcar" (que combina características de los modelos base). La configuración de fusión especifica: strength 1.0, gain 0.5, focus 0.55, recover 0.25 y distinct 0.65, con dtype de cálculo en float32 y salida en bfloat16. El tokenizer se ha construido como la unión de los tokenizers de los modelos base.

Los cuatro modelos fusionados son: Google Gemma-4-31B-it (el modelo base oficial de Google), ReadyArt/gemma-4-31B-it-scotoma-2 (un fine-tuning para roleplay), ReadyArt/Dark-Scarlett-v2.0-31B (otro fine-tuning de la familia ReadyArt) y Vortex5/Glimmering-Citrus-31B (un modelo previo del mismo autor). El objetivo de la fusión es combinar las capacidades de escritura creativa y roleplay de los modelos fine-tuned con las capacidades generales del modelo base de Google.

## Capacidades

- Generacion de texto narrativo y creativo, con especial enfasis en roleplay y storytelling.
- Interaccion de personajes con personalidad y dialogo multi-turno.
- Escritura de ficcion, descripciones, dialogos y variaciones de escenas.
- Generacion de conceptos, esquemas, alternativas e ideas de escritura.
- Soporte de chat-template automatico (heredado del modelo base).
- Capacidades multilingues heredadas de Gemma-4-31B-it (no confirmadas en la model card).
- No se documenta soporte explicito de tool calling, function calling o agentes.
- El pipeline de HuggingFace indica "image-text-to-text", pero no hay documentacion de capacidades de vision en la model card.

## Casos de uso

- Roleplay interactivo: el modelo puede mantener conversaciones multi-turno interpretando personajes con personalidad y consistencia, gracias a la fusion de modelos especializados en roleplay. Es adecuado para juegos de rol por texto, chats de personajes y simulaciones de interaccion.
- Escritura de ficcion: permite redactar relatos, descripciones, dialogos y variaciones de escenas. La fusion con modelos de escritura creativa mejora la calidad literaria y la coherencia narrativa.
- Desarrollo de tramas y worldbuilding: el modelo puede generar esquemas de tramas, desarrollo de personajes, construccion de mundos y planificacion de historias largas.
- Tormenta de ideas para escritores: genera conceptos, alternativas y esquemas para escritores profesionales que necesitan explorar multiples direcciones creativas.
- Generacion de dialogos y guiones: puede producir dialogos naturales y expresivos, util para guiones de teatro, cine, videojuegos o audiolibros.
- Creacion de contenido para juegos de rol: el modelo puede generar descripciones de escenarios, NPCs, misiones y eventos para juegos de rol de mesa o videojuegos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluacion, y el autor no proporciona datos sobre MMLU, HumanEval, GSM8K u otras metricas estandar. La unica referencia indirecta es el modelo base Gemma-4-31B-it de Google, que segun informes externos supera a modelos de hasta 400B parametros en ciertas tareas, pero estos datos no son directamente aplicables a este modelo fusionado.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en bfloat16 necesita aproximadamente 62.6 GB de VRAM, lo que requiere una GPU de centro de datos. Con cuantizacion Q4_K_M (no disponible en el repo, pero posible con herramientas como llama.cpp), la VRAM se reduce a unos 20-22 GB, apta para RTX 3090, RTX 4090 o A6000.
- GPU recomendadas: A100 80GB, H100 80GB, o RTX 4090 (con cuantizacion). No cabe en GPU de consumo de 16 GB o menos sin cuantizacion agresiva (Q2 o Q3).
- Opciones de despliegue: vLLM, TGI, llama.cpp (si se convierte a GGUF), Ollama (si se publica en su biblioteca). El modelo usa safetensors de HuggingFace, compatible con transformers.
- Latencia y throughput: no disponibles. Como referencia, un modelo de 31B en una RTX 4090 con cuantizacion Q4 suele generar entre 20-40 tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Scarlet-Shadow-31B | 31B | No disponible (presumiblemente 128k) | Apache 2.0 | Roleplay y storytelling |
| Gemma-4-31B-it | 31B | 128k (reportado) | Apache 2.0 | Generalista |
| TheDrummer/Skyfall-31B-v4 | 31B | No disponible | No disponible | Roleplay y creatividad (upscale de Mistral Small 3.2) |

La comparativa es limitada porque no hay datos publicos de rendimiento de Scarlet-Shadow-31B. Como modelo de fusion, su rendimiento dependera de los modelos base. Gemma-4-31B-it es el modelo oficial de Google, mientras que Skyfall-31B-v4 es otra alternativa de roleplay. Ambos son comparables en tamano, pero Scarlet-Shadow-31B se distingue por la fusion de multiples modelos especializados en escritura creativa.

## Limitaciones y advertencias

- No hay datos de benchmarks publicados: no se puede verificar la calidad real del modelo frente a alternativas.
- Sesgos: al ser un modelo de fusion de modelos de roleplay, puede heredar sesgos de los datos de entrenamiento originales, especialmente en temas de violencia, contenido sexual o estereotipos de genero.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar informacion falsa o inconsistente, especialmente en contextos de escritura creativa.
- Limitaciones de contexto: aunque Gemma-4-31B-it tiene 128k de contexto, no se confirma que la fusion preserve esta longitud. El metodo fcar puede afectar a la ventana de contexto.
- Idiomas: no se documenta el soporte multilingue, aunque hereda de Gemma-4-31B-it.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero los modelos base pueden tener restricciones adicionales (Gemma-4-31B-it de Google tiene su propio terminos de uso).
- Pipeline image-text-to-text: la model card indica que el pipeline es image-text-to-text, pero no hay evidencia de capacidades de vision reales. Puede ser un error del autor o una caracteristica heredada no documentada.

## Enlaces

- Modelo: https://huggingface.co/Vortex5/Scarlet-Shadow-31B
- Modelo base Google: https://huggingface.co/google/gemma-4-31B-it
- Modelo base ReadyArt: https://huggingface.co/ReadyArt/gemma-4-31B-it-scotoma-2
- Modelo base ReadyArt Dark-Scarlett: https://huggingface.co/ReadyArt/Dark-Scarlett-v2.0-31B
- Modelo base Vortex5: https://huggingface.co/Vortex5/Glimmering-Citrus-31B
- Organizacion ReadyArt: https://huggingface.co/ReadyArt/models
- Referencia Gemma 4 benchmarks: https://tech-insider.org/google-gemma-4-open-model-benchmarks-2026/
- Benchmark local Gemma 4: https://explore.n1n.ai/blog/benchmarking-google-gemma-4-26b-31b-locally-2026-04-06
- Modelo comparable: https://huggingface.co/TheDrummer/Skyfall-31B-v4
- Perfil de benchmarks de Vortex5: https://benchmarklist.com/providers/vortex5/
