# superwhisper/s1-mini

## Resumen

S1-mini es un modelo de normalización de texto para transcripciones de voz a texto (ASR), desarrollado por Superwhisper, una empresa especializada en dictación. El modelo toma una transcripción cruda de un sistema de reconocimiento de voz —habitualmente en minúsculas y sin puntuación— y la reescribe como texto escrito limpio: elimina muletillas, falsos comienzos y autocorrecciones, aplica puntuación y capitalización, y convierte números hablados, fechas, horas, monedas y direcciones de correo electrónico a su forma escrita. Está fine-tuneado a partir de Qwen3-0.6B, un modelo causal de 596 millones de parámetros (28 capas, atención con GQA), y su versión cuantizada ocupa solo 462 MiB, lo que permite ejecutarlo en CPU en un portátil.

Su relevancia actual radica en que la normalización de transcripciones es un paso crítico en aplicaciones de dictación, reuniones, subtítulos y análisis de texto. S1-mini ofrece una solución dedicada y ligera, con licencia Apache 2.0 más una cláusula de naming, que cubre únicamente inglés en su versión v1. No es un modelo de chat ni sigue instrucciones generales; se usa mediante una línea de control y un prompt de sistema fijo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen3-0.6B) |
| Parametros totales | 596 millones (0.44B no-embedding) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada; se recomienda ~1.000 tokens por entrada |
| Tipos de cuantizacion | GGUF (disponible en superwhisper/s1-mini-GGUF); cuantizado de 462 MiB |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 + clausula de naming (s1-mini-license) |
| Formato de pesos | safetensors (transformers) y GGUF (llama.cpp) |

Nota: el Hub reporta 751.6M parametros porque el archivo safetensors incluye una copia materializada del embedding en `lm_head.weight`, pero los parametros unicos son 596M (embeddings atados).

## Arquitectura y entrenamiento

S1-mini es un modelo de lenguaje causal tipo transformer, derivado de Qwen3-0.6B. Tiene 28 capas, 16 cabezas de atencion para consultas y 8 para claves/valores (GQA), con embeddings atados. Se fine-tuneo exclusivamente para la tarea de normalizacion de transcripciones ASR. No se han publicado detalles sobre el dataset de entrenamiento ni sobre el metodo de ajuste (si se uso RLHF, DPO, etc.). La entrada esperada es una secuencia que incluye un system prompt fijo, una linea de control con parametros de estilo, estructura y contexto, y la transcripcion cruda. La salida es el texto normalizado como texto plano, sin preambulos ni explicaciones. Se requiere `transformers>=4.51.0` para cargar el modelo.

## Capacidades

- Normalizacion de transcripciones ASR: elimina muletillas, falsos comienzos y autocorrecciones, resolviendo al valor final que el hablante eligio.
- Aplica puntuacion y capitalizacion correctas (truecasing).
- Convierte numeros hablados, fechas, horas, monedas y direcciones de correo electronico a su forma escrita.
- Control mediante linea de control: permite especificar estilo (por ejemplo, semi-formal), estructura (prosa o listas) y contexto (general, email, etc.).
- Maneja entradas de hasta ~1.000 tokens; para transcripciones mas largas se recomienda fragmentar.
- No es un modelo de chat: no sigue instrucciones generales ni mantiene conversaciones.
- No dispone de vision, audio, tool calling ni capacidades multimodales.

## Casos de uso

- **Dictacion de texto en aplicaciones**: S1-mini se integra en herramientas de dictacion (como las de Superwhisper) para convertir la voz en texto limpio, sin muletillas ni errores de puntuacion, listo para enviar por correo o publicar.
- **Post-procesamiento de transcripciones de reuniones**: en pipelines de ASR para actas, el modelo limpia falsos comienzos y autocorrecciones, y formatea numeros y fechas, mejorando la legibilidad de las actas finales.
- **Generacion de subtitulos o contenido escrito**: para videos o podcasts, se puede usar para normalizar las transcripciones automaticas antes de publicarlas como texto, subtitulos o resumenes.
- **Pre-procesamiento para analisis de texto**: antes de enviar transcripciones a modelos de analisis de sentimiento, extraccion de entidades o clasificacion, S1-mini limpia el texto y mejora el rendimiento de los modelos posteriores.
- **Integracion en pipelines de dictacion en tiempo real**: su tamano reducido (462 MiB cuantizado) permite ejecutarlo en CPU de un portatil, habilitando normalizacion en tiempo real en aplicaciones de trabajo.
- **Formateo de correos electronicos dictados**: con el contexto `email`, el modelo produce un mensaje con saludo, cuerpo y despedida separados por lineas en blanco, listo para enviar.

## Benchmarks y rendimiento

Segun la model card, en un conjunto retenido de 7.519 casos en ingles, S1-mini alcanza una precision de token del 94,8%. No se han publicado otros benchmarks (MMLU, HumanEval, etc.) porque el modelo no esta disenado para tareas generales de lenguaje.

| Metrica | Valor |
|---|---|
| Precision de token (7.519 casos en ingles) | 94,8% |

## Requisitos de hardware

- **VRAM estimada**: aproximadamente 1,2 GB para el modelo en BF16 (596M parametros x 2 bytes). El cuantizado GGUF ocupa 462 MiB, por lo que puede ejecutarse en CPU con ~512 MB de RAM.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, GTX 1060, RTX 2060 o superior). Tambien funciona en CPU.
- **Opciones de despliegue**: transformers (Python), vLLM (compatible con safetensors), llama.cpp, Ollama y LM Studio (via archivos GGUF).
- **Latencia y throughput**: no disponibles. Dado su tamano, se espera latencia baja en hardware moderno, pero no hay datos publicados.

## Comparativa con modelos similares

No se han identificado modelos comparables especificos de normalizacion de texto ASR en el rango de 0.6B parametros en la informacion disponible. La unica referencia seria el modelo base Qwen3-0.6B, que no realiza esta tarea. No hay datos de comparacion con alternativas como Whisper (que no normaliza) o modelos de chat grandes.

## Limitaciones y advertencias

- **Solo ingles**: la version v1 cubre unicamente el idioma ingles.
- **No es un modelo de chat**: no sigue instrucciones generales ni puede realizar tareas fuera de la normalizacion de transcripciones.
- **Longitud de entrada limitada**: se recomienda no superar ~1.000 tokens por entrada; transcripciones mas largas deben fragmentarse.
- **Riesgo de alucinacion**: como todo modelo generativo, puede introducir errores de normalizacion, aunque esta entrenado para devolver cadena vacia si la entrada es solo ruido o muletillas.
- **Licencia con clausula de naming**: aunque es Apache 2.0, incluye una clausula adicional que puede imponer restricciones de atribucion o uso comercial; se debe revisar el archivo LICENSE antes de usarlo en produccion.
- **Sin evaluacion de sesgos**: no se han publicado analisis de sesgos ni evaluaciones de calidad en escenarios reales.

## Enlaces

- [Pagina del modelo en HuggingFace](https://huggingface.co/superwhisper/s1-mini)
- [Repositorio GGUF para llama.cpp/Ollama/LM Studio](https://huggingface.co/superwhisper/s1-mini-GGUF)
- [Pagina de modelos de Superwhisper](https://superwhisper.com/models)
- [Notas de lanzamiento de Superwhisper (agosto 2026)](https://releasebot.io/updates/superwhisper)
