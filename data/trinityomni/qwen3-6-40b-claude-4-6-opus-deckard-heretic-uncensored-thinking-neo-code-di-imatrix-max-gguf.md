# trinityomni/Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking-NEO-CODE-Di-IMatrix-MAX-GGUF

## Resumen

El modelo Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking-NEO-CODE-Di-IMatrix-MAX-GGUF es un modelo denso de 40 mil millones de parametros desarrollado por la comunidad a partir de una expansion de Qwen3.6-27B, posteriormente afinado con datasets de razonamiento de Claude 4.6 Opus y con los datasets internos "Deckard/PDK" de DavidAU. El resultado es un modelo que combina razonamiento de alto nivel con escritura creativa sin censura y con personalidad propia. Su relevancia radica en ofrecer una alternativa de codigo abierto con licencia Apache 2.0, orientada a escenarios que requieren tanto inteligencia tecnica como creatividad literaria, con soporte para contexto largo de 256K tokens y capacidad de vision mediante un archivo mmproj complementario. La arquitectura es un transformer denso de 96 capas, expandido desde los 27B originales, con un total de 39.072.596.736 parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, 96 capas, 1275 tensores |
| Parametros totales | 39.072.596.736 (39B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | GGUF: IQ2_M, IQ3, IQ4_XS, Q6_K, Q8_0 (algunas variantes con componentes BF16) |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base esta disponible en safetensors bfloat16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.6-27B y se expande a 40B mediante la adicion de capas, pasando de 64 a 96 capas y de 255 a 1275 tensores. El entrenamiento se realizo en varias etapas: primero se elimino la censura mediante el metodo "Heretic" (abliterated), despues se afin6 con los datasets Deckard/PDK de DavidAU (cinco datasets centrados en caracter, inteligencia, profundidad, observacion y punto de vista), luego se expandio a 40B para "tener espacio para pensar", y finalmente se proceso con un dataset de razonamiento de Claude 4.6 Opus (TeichAI/claude-4.5-opus-high-reasoning-250x) para acortar y mejorar el razonamiento, estabilizando el modelo. El proceso de afinado se hizo con Unsloth en hardware local. El modelo incluye razonamiento de longitud variable: respuestas mas cortas para preguntas simples y mas largas para problemas complejos.

## Capacidades

- Generacion de texto con razonamiento de longitud variable y "modo de pensamiento" recomendado para matematicas, codigo y problemas complejos.
- Escritura creativa de alta calidad: ficcion, ciencia ficcion, romance, generacion de tramas, subtramas y continuacion de escenas.
- Roleplay con personalidad fuerte y sin filtros, manteniendo coherencia en conversaciones largas.
- Capacidades de codigo, marcadas en los tags del modelo.
- Vision: soporta entrada de imagenes mediante el archivo mmproj (debe colocarse junto al GGUF).
- Modelo uncensored/abliterated: no aplica filtros de contenido, lo que permite generar contenido NSFW si se solicita.
- Multilingue en ingles y chino, con posible generalizacion a otros idiomas no declarada oficialmente.

## Casos de uso

- Escritura de ficcion y novelas: el modelo puede generar tramas, dialogos y escenas completas, con un estilo narrativo vivo y caracter. Su contexto de 256K tokens permite mantener la coherencia a lo largo de capitulos extensos.
- Roleplay avanzado en juegos y chats: gracias a su personalidad fuerte y a la ausencia de censura, puede interpretar personajes complejos en interacciones prolongadas sin perder el hilo.
- Asistente de codigo en proyectos grandes: con contexto de 256K, puede analizar codebases completos, generar explicaciones tecnicas, resolver bugs y proponer refactorizaciones.
- Razonamiento cientifico y matematico: el entrenamiento con el dataset Claude Opus high-reasoning le permite abordar problemas de demostraciones, analisis numerico y fisica con un nivel de profundidad notable.
- Analisis de documentos extensos: permite procesar contratos, informes de investigacion o libros enteros, extrayendo resumenes, detectando inconsistencias o respondiendo preguntas especificas sobre el contenido.
- Vision basica: mediante el archivo mmproj, puede describir imagenes, responder preguntas sobre su contenido y usarse en aplicaciones de analisis visual sencillo, aunque no es un modelo multimodal completo.
- Generacion de contenido para redes sociales y blogs: el modelo puede producir textos persuasivos, historias cortas y guiones, con un estilo directo y sin filtros que puede resultar atractivo para creadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que el modelo supera al modelo base en 6 de 7 benchmarks internos y que las cuantizaciones NEO-CODE se acercan a la precision completa: IQ4_XS alcanza el 94% de BF16, Q6/Q8 el 97% y Q8_0 el 98.4%. Sin embargo, no se proporcionan puntuaciones concretas de MMLU, HumanEval, GSM8K u otros benchmarks publicos.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - Cuantizacion Q4_K_M: aproximadamente 22-24 GB, por lo que cabe en una RTX 3090/4090 con offloading parcial.
  - Cuantizacion Q8_0: aproximadamente 40-42 GB, requiere GPUs de 48 GB o mas.
  - Cuantizacion IQ2_M: aproximadamente 14-16 GB, puede ejecutarse en GPU de 16 GB con restricciones de practicidad.
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones hasta Q4; A100/H100 (80 GB) para ejecutar el modelo completo en Q8 o BF16.
- En consumer GPU: es posible ejecutar el modelo en una RTX 3090/4090 con cuantizacion Q4 y offloading a CPU, aunque la velocidad de inferencia sera menor que en GPUs de datacenter.
- Opciones de despliegue: llama.cpp, Ollama y LM Studio (al ser un formato GGUF). No se ha confirmado el soporte nativo en vLLM o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han publicado benchmarks publicos que permitan una comparativa formal con modelos similares. El modelo comparte base con DavidAU/Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking, del que es una variante cuantizada y optimizada. Existe una version superior mencionada por el autor (DavidAU/Qwen3.6-40B-Fable-Fusion-6-Core-Deckard-Eleanor-Heretic-Uncensored-NM-DAU-NEO-MAX-MTP-GGUF), pero no se dispone de datos de comparacion.

## Limitaciones y advertencias

- Contenido sin censura: el modelo puede generar material NSFW, ofensivo o perturbador en respuesta a solicitudes explicitas. Debe usarse con precaucion en entornos profesionales.
- Sesgos inherentes: los datos de entrenamiento incluyen datasets de Claude y datasets de ficcion de DavidAU, lo que puede introducir sesgos en temas de genero, politica o cultura.
- Riesgo de alucinacion: al estar optimizado para creatividad y razonamiento, puede producir afirmaciones facturadas o inventadas, especialmente en contextos de gran longitud.
- Idiomas limitados: la model card declara ingles y chino como idiomas soportados. Otros idiomas pueden funcionar de forma parcial, sin garantia de calidad.
- Vision condicionada: el soporte de imagenes requiere un archivo mmproj especifico y puede no estar disponible en todos los frontends o integrations.
- Estabilidad en produccion: al estar "abliterated" y ajustado para una fuerte personalidad, el comportamiento puede ser menos predecible que un modelo de entrenamiento estandar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/trinityomni/Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking-NEO-CODE-Di-IMatrix-MAX-GGUF
- Modelo base de DavidAU: https://huggingface.co/DavidAU/Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking
- Repositorio de quants NEO-CODE sobre 27B: https://huggingface.co/DavidAU/Qwen3.6-27B-NEO-CODE-Di-IMatrix-MAX-GGUF
- Repositorio de quants NEO-CODE sobre la variante Heretic: https://huggingface.co/DavidAU/Qwen3.6-27B-Heretic-Uncensored-FINETUNE-NEO-CODE-Di-IMatrix-MAX-GGUF
- Variante superior mencionada por el autor: https://huggingface.co/DavidAU/Qwen3.6-40B-Fable-Fusion-6-Core-Deckard-Eleanor-Heretic-Uncensored-NM-DAU-NEO-MAX-MTP-GGUF
