# Spellguard/Spellguard-1.0-8B-GGUF

## Resumen

Spellguard-1.0-8B-GGUF es la versión cuantizada en formato GGUF de Spellguard-1.0-8B, un modelo guardián (guardrail) de pesos abiertos desarrollado por Spellguard para clasificar contenido dañino en aplicaciones de chat y agentes de IA. El modelo detecta tres tipos de riesgo: prompts dañinos del usuario, respuestas dañinas del asistente e intentos de prompt injection o jailbreak. Está pensado para integrarse como capa de seguridad en pipelines de moderación y sistemas agénticos.

Técnicamente deriva de Qwen3Guard-Gen-8B (licencia Apache 2.0) y conserva la arquitectura y el tamaño del modelo base: 8.190.735.360 parámetros. Esta variante GGUF incluye una única cuantización Q4_K_M de 5,03 GB, lista para ejecutarse con llama.cpp y servidores compatibles con la API de OpenAI, lo que facilita su despliegue en entornos con recursos limitados.

Su relevancia actual radica en que ofrece una alternativa de pesos abiertos y licencia permisiva para tareas de moderación de contenido y defensa frente a ataques de prompt, un segmento dominado por servicios propietarios. No obstante, la información publicada en el repositorio es escasa: no se detallan idiomas soportados ni resultados de benchmarks en esta ficha, que remiten a la model card del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen3Guard-Gen-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (valor usado en el ejemplo de despliegue con `-c 8192`) |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de detalles arquitectonicos propios en la información proporcionada. El modelo deriva de Qwen3Guard-Gen-8B, según indica el aviso de licencia (NOTICE) del repositorio, y mantiene su tamaño de 8.190.735.360 parámetros. La model card no especifica si la arquitectura es transformer densa, el número de capas, la composición del dataset de entrenamiento, el volumen de tokens ni si se aplicaron técnicas de RLHF o DPO.

El modelo está diseñado como clasificador generativo: produce una salida estructurada con la etiqueta de seguridad y las categorías de riesgo (por ejemplo, `Safety: Unsafe` seguido de `Categories: Violent`). La puntuación publicada se obtiene calculando P(Unsafe) + P(Controversial) en el primer token de respuesta, con umbral 0,5, según el script de ejemplo `llama_server_example.py` del repositorio GitHub. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación de seguridad de prompts: detecta peticiones dañinas del usuario y las etiqueta como seguras, controvertidas o inseguras.
- Moderación de respuestas: evalúa las respuestas del asistente para identificar contenido dañino antes de mostrarlo.
- Detección de prompt injection: identifica intentos de manipular las instrucciones del sistema.
- Detección de jailbreak: reconoce intentos de eludir las restricciones de seguridad del modelo.
- Salida estructurada con etiqueta de seguridad y categorías de daño (por ejemplo, Violent).
- Compatibilidad con la API de chat completions de llama.cpp (`/v1/chat/completions`).
- Uso dual para moderación de prompts y de respuestas, con recomendación de invocar `/completion` con la plantilla de chat renderizada manualmente para moderar respuestas.
- Capacidades multilingües: no disponible.

## Casos de uso

- Moderación de entrada en chatbots: el modelo se sitúa delante del LLM principal para filtrar prompts dañinos antes de que lleguen al modelo generativo, reduciendo costes y riesgos de abuso.
- Moderación de salida en producción: se ejecuta sobre las respuestas del asistente para bloquear contenido inseguro antes de mostrarlo al usuario, con la salida estructurada de categorías como criterio de bloqueo.
- Protección de agentes frente a prompt injection: integrado en el control plane de un agente, inspecciona instrucciones de terceros (documentos, correos, resultados de herramientas) para detectar intentos de manipulación.
- Detección de jailbreaks en aplicaciones expuestas: actúa como capa de defensa frente a usuarios que intentan eludir las políticas del sistema mediante prompts adversarios.
- Cumplimiento y auditoría de contenido: registra las clasificaciones de seguridad de prompts y respuestas para trazabilidad y revisión regulatoria.
- Despliegue local en entornos con recursos limitados: gracias a la cuantización Q4_K_M (5,03 GB) puede ejecutarse en una única GPU consumer o incluso en CPU mediante llama.cpp, lo que facilita la moderación on-premise sin enviar datos a terceros.
- Filtrado previo en pipelines de datos: clasifica grandes volúmenes de conversaciones para descartar muestras inseguras antes de usarlas en entrenamiento o análisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que las puntuaciones del modelo base se midieron con este fichero GGUF, pero no se incluyen los valores numéricos en el repositorio consultado; deben consultarse en la model card de Spellguard-1.0-8B.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,5-6 GB con la cuantización Q4_K_M (fichero de 5,03 GB más overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM, como RTX 3060 Ti, RTX 4060, RTX 4070 o superiores; para mayor throughput, A100 o H100.
- Cabe en GPU consumer: sí, en modelos con 8 GB o más de VRAM; también es viable en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-server`), con compatibilidad con la API de OpenAI; Ollama y vLLM no están confirmados en la documentación disponible.
- Latencia y throughput estimados: no disponible.
- Ejemplo de despliegue documentado: `llama-server -hf Spellguard/Spellguard-1.0-8B-GGUF:Q4_K_M -c 8192 -ngl 99`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Spellguard-1.0-8B-GGUF | 8.190.735.360 | 8.192 tokens (ejemplo) | Apache 2.0 | GGUF (Q4_K_M) | Guardrail derivado de Qwen3Guard-Gen-8B |
| Qwen3Guard-Gen-8B | no disponible | no disponible | Apache 2.0 | safetensors | Modelo base del que deriva Spellguard |
| Alternativas de moderación propietarias | no disponible | no disponible | Propietaria | API | No disponible en pesos abiertos |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; no se documentan evaluaciones de sesgo en la información consultada.
- Riesgo de alucinación: como modelo generativo de clasificación, puede producir etiquetas inconsistentes o categorías incorrectas; se recomienda validar con conjuntos de prueba propios.
- Limitaciones de contexto: el ejemplo de despliegue usa 8.192 tokens; prompts o respuestas más largas pueden requerir truncado o fragmentación.
- Idiomas: no se especifican los idiomas soportados, lo que impide garantizar el rendimiento en castellano u otros idiomas distintos del inglés.
- Licencia: Apache 2.0 permite uso comercial, pero se debe conservar el aviso de atribución a Qwen3Guard-Gen-8B incluido en el fichero NOTICE.
- Moderación de respuestas: la API de chat completions de llama.cpp trata un mensaje final del asistente como texto a continuar, por lo que para moderar respuestas es necesario renderizar la plantilla de chat y usar `/completion`.
- Umbral de decisión: la puntuación publicada depende de un umbral fijo de 0,5 sobre P(Unsafe) + P(Controversial); en producción puede ser necesario calibrar este umbral según el caso de uso.
- Madurez del repositorio: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, y la documentación publicada es limitada.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/Spellguard/Spellguard-1.0-8B-GGUF
- Modelo base: https://huggingface.co/Spellguard/Spellguard-1.0-8B
- Modelo del que deriva: https://huggingface.co/Qwen/Qwen3Guard-Gen-8B
- Sitio web: https://spellguard.ai
- Documentación: https://docs.spellguard.ai
- GitHub: https://github.com/Spellguard/spellguard-models
- Ejemplo de servidor llama.cpp: https://github.com/Spellguard/spellguard-models/blob/main/examples/llama_server_example.py
