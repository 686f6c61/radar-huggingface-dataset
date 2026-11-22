# umarrasydan/meannit-4b

## Resumen

Meannit 4B es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-4B desarrollado por el usuario umarrasydan para Meannit, una aplicación de grabación y resumen de reuniones para macOS. El modelo está especializado en dos tareas concretas: pulir transcripciones de reuniones y generar resúmenes estructurados en JSON, además de producir guiones de briefing hablados que la aplicación reproduce al usuario. Su propósito es ejecutarse íntegramente en local sobre la GPU del Mac mediante llama.cpp, sin depender de servicios en la nube, lo que resulta relevante para escenarios donde la confidencialidad de las conversaciones es crítica.

El modelo parte de una arquitectura transformer densa de 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) y se distribuye exclusivamente en formato GGUF cuantizado Q8_0, con un único archivo de 4.482.403.168 bytes (unos 4,5 GB). La ventana de contexto declarada en la integración de referencia es de 65.536 tokens, con caché KV cuantizada también en Q8_0 y Flash Attention activado. La licencia es Apache 2.0, heredada del modelo base.

Su interés práctico reside en que demuestra un patrón de despliegue on-device muy concreto: un modelo pequeño, cuantizado a 8 bits, con contexto largo y salida estructurada, integrado en una aplicación de escritorio mediante la API C de llama.cpp. No obstante, el modelo tiene cero descargas y cero likes en el momento de la consulta, y no publica benchmarks ni evaluación independiente, por lo que debe tratarse como un artefacto de nicho orientado a un producto específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5-4B), inferencia vía llama.cpp |
| Parametros totales | 4.205.751.296 (4,2 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 65.536 tokens (configuración de referencia en Meannit) |
| Tipos de cuantizacion | Q8_0 (único archivo publicado); caché KV en Q8_0 |
| Idiomas soportados | No disponible (la model card no declara idiomas; hereda los del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`meannit-4b-v1-q8_0.gguf`, 426 tensores, 32 bloques, solo texto) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 4,2 mil millones de parámetros obtenido por ajuste fino con LoRA sobre Qwen/Qwen3.5-4B. El entrenamiento se realizó en bfloat16 con rango 32, alpha 32 y 3 épocas, sobre 658 ejemplos verificados de resumen y pulido de transcripciones generados con modelos maestros de pesos abiertos. Se entrenó en modo no-thinking (`enable_thinking=False`), lo que implica que el modelo no está optimizado para cadenas de razonamiento explícitas. Posteriormente, los pesos LoRA se fusionaron en el modelo base de texto y el checkpoint resultante se convirtió a GGUF Q8_0 con `convert_hf_to_gguf.py` de llama.cpp (commit `d81235049384534c167caea52b85a694f6103d14`), usando las opciones `--no-nextn --outtype q8_0 --model-name "Meannit 4B"`.

La innovación destacable no está en la arquitectura, sino en el pipeline de despliegue: conversión solo de texto (se descartan componentes multimodales del base, si los hubiera), contexto de 65.536 tokens con Flash Attention y caché KV cuantizada, decodificación greedy y un límite de salida de 8.192 tokens. El pulido de transcripciones se ejecuta en fragmentos de 1.200 tokens con 2 líneas previas de contexto de solo lectura, una estrategia de ventana deslizante que permite procesar reuniones largas sin superar el contexto. El consumo residente declarado es de 6,21 GB decimales en Apple Silicon.

## Capacidades

- Pulido de transcripciones de reuniones: corrección de puntuación, muletillas y errores de reconocimiento de voz manteniendo el contenido.
- Generación de resúmenes estructurados en JSON a partir de transcripciones.
- Redacción de guiones de briefing hablados para reproducción en voz alta.
- Procesamiento por fragmentos de 1.200 tokens con contexto previo de 2 líneas para transcripciones largas.
- Conversación multi-turno con marcado de chat de Qwen3.5 y bloque de thinking cerrado (`<think>\n\n</think>\n\n`).
- Inferencia offline en GPU de Mac mediante la API C de llama.cpp.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags).
- Capacidades multimodales: no disponibles (conversión solo de texto).
- Tool calling / function calling: no documentado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas; el modelo se entrenó en modo no-thinking.

## Casos de uso

- Resumen automático de reuniones en local: la aplicación captura el audio, lo transcribe y pasa el texto al modelo, que devuelve un JSON estructurado con puntos clave, decisiones y tareas. El contexto de 65.536 tokens permite procesar reuniones de duración media en una sola pasada.
- Pulido de transcripciones en tiempo casi real: el modelo procesa fragmentos de 1.200 tokens con 2 líneas de contexto previo, corrigiendo puntuación y errores de ASR sin reescribir el contenido, lo que encaja en un flujo por streaming.
- Generación de briefings hablados: a partir del resumen JSON, el modelo redacta un guion que la aplicación convierte a voz; el límite de 8.192 tokens de salida es suficiente para guiones de varios minutos.
- Asistentes de actas para equipos con requisitos de privacidad: al ejecutarse offline en el Mac del usuario, las conversaciones no salen del dispositivo, lo que lo hace apto para entornos con datos sensibles (legal, sanitario, recursos humanos).
- Integración en herramientas de productividad de escritorio: cualquier aplicación macOS que necesite resumir o limpiar texto largo puede cargar el GGUF vía llama.cpp con contexto de 65.536 tokens y decodificación greedy para resultados deterministas.
- Prototipado de pipelines de extracción estructurada: el formato JSON de salida y el modo no-thinking facilitan su uso como extractor de entidades y acciones en flujos automatizados, aunque requiere validación posterior del JSON.
- Evaluación de modelos pequeños on-device: sirve como referencia para comparar calidad de resumen con modelos de 4B cuantizados a Q8_0 en hardware Apple Silicon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas de resumen o fidelidad de transcripción. Tampoco se documentan latencia ni throughput medidos, más allá del consumo de memoria residente de 6,21 GB decimales en Apple Silicon.

## Requisitos de hardware

- VRAM/RAM estimada: el archivo Q8_0 ocupa 4,5 GB; con contexto de 65.536 tokens y caché KV en Q8_0, el consumo residente declarado es de 6,21 GB decimales en Apple Silicon (memoria unificada).
- GPU recomendadas: GPU integradas de Apple Silicon (la model card cita Mac GPU); no se especifican modelos concretos de Apple.
- GPU de consumo: cabe en GPUs con 8 GB o más de VRAM en el caso de NVIDIA/AMD, aunque no está validado por el autor; en Apple Silicon requiere al menos 8 GB de memoria unificada para el contexto completo.
- Opciones de despliegue: llama.cpp (API C, uso previsto por el autor); GGUF es compatible con otros runners basados en llama.cpp, pero no se documenta soporte en vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles; la decodificación es greedy y el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Meannit 4B | 4,2 B | 65.536 (config. de referencia) | GGUF Q8_0 | Apache 2.0 | Resumen de reuniones y pulido de transcripciones on-device |
| Qwen/Qwen3.5-4B (base) | 4,2 B | No disponible en la información | Safetensors y otros | Apache 2.0 | Modelo generalista; Meannit parte de él |
| Alternativas de 4B para resumen | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados de modelos comparables en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría; la model card no incluye evaluaciones frente a otros modelos.

## Limitaciones y advertencias

- Entrenado con solo 658 ejemplos, un volumen muy reducido que limita la generalización fuera del dominio de reuniones y transcripciones.
- Modo no-thinking: no está entrenado para razonamiento explícito ni para tareas de lógica compleja.
- Salida JSON no garantizada sintácticamente; en producción conviene validar y reparar el JSON generado.
- Riesgo de alucinación en resúmenes: puede introducir detalles no presentes en la transcripción, especialmente en fragmentos ambiguos o con ruido de ASR.
- Idiomas no declarados; se desconoce el comportamiento multilingüe y el rendimiento fuera del inglés.
- Solo se publica cuantización Q8_0; no hay versiones Q4 o Q5 para hardware con menos memoria.
- Conversión solo de texto: no conserva capacidades multimodales del modelo base.
- Sin benchmarks ni evaluación independiente; cero descargas y cero likes en el momento de la consulta, lo que reduce la evidencia de calidad.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo está orientado a un producto concreto (Meannit) y su uso fuera de ese contexto no está validado.
- El contexto de 65.536 tokens es una configuración de la aplicación de referencia, no necesariamente el máximo nativo del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/umarrasydan/meannit-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Producto Meannit: https://meannit.com
- llama.cpp (conversión y runtime): https://github.com/ggml-org/llama.cpp
- Commit de conversión citado: `d81235049384534c167caea52b85a694f6103d14` en el repositorio de llama.cpp
