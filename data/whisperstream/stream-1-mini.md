# whisperstream/stream-1-mini

## Resumen

Stream-1 Mini es un modelo de lenguaje especializado en la limpieza y normalización de transcripciones de dictado en inglés, desarrollado por Whisperstream. Se trata de un fine-tuning del modelo base Qwen3-0.6B-Base, con 751.632.384 parámetros totales (embedding de entrada y pesos de salida separados). Su función es transformar transcripciones crudas de reconocimiento de voz en texto limpio de chat o correo electrónico: elimina muletillas y repeticiones accidentales, añade puntuación, resuelve correcciones habladas y, en modo correo, formatea saludos, párrafos y despedidas.

El modelo está diseñado para ejecutarse en local (on-device), con artefactos cuantizados en GGUF que ocupan unos 484 MB en Q4_K_M, lo que lo hace viable en CPU. La revisión actual incorpora sugerencias opcionales de vocabulario personalizado y soporte de comandos estructurales de dictado (saltos de línea, viñetas, listas numeradas). Está orientado exclusivamente al inglés y su licencia permite uso comercial con atribución.

Su relevancia radica en cubrir una tarea concreta y acotada (post-procesado de ASR) con un modelo pequeño, determinista en la configuración recomendada (temperature 0) y desplegable sin GPU, lo que encaja en flujos de dictado de escritorio o integraciones locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tuning de Qwen3-0.6B-Base); detalles de capas y atención no disponibles |
| Parametros totales | 751.632.384 (embedding de entrada y pesos de salida separados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens probados, con hasta 512 tokens de salida |
| Tipos de cuantizacion | FP32 (Safetensors), F16 GGUF, Q4_K_M GGUF |
| Idiomas soportados | Inglés (en) |
| Licencia | Stream-1 Mini License (uso comercial permitido con atribución); incluye LICENSE-APACHE-2.0 y NOTICE |
| Formato de pesos | Safetensors (FP32, cuatro shards), GGUF (F16 y Q4_K_M) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del transformer Qwen3-0.6B-Base. La model card no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO. La arquitectura subyacente es la de Qwen3-0.6B-Base, aunque no se especifican en la información disponible los detalles de capas, cabezas de atención ni mecanismos concretos.

La innovación destacable no está en la arquitectura sino en el contrato de uso: el modelo se sirve con prompts de sistema específicos para cada modo (chat y correo), un chat template propio y un módulo `vocabulary_contract.py` que renderiza el formato exacto de entrada, delimitando la transcripción con `<TRANSCRIPT>` y `</TRANSCRIPT>` y un bloque opcional JSON `<VOCABULARY>`. La decodificación recomendada es determinista (temperature 0, top_k 1, top_p 1, repeat_penalty 1) con `enable_thinking` desactivado. La evaluación publicada aplica específicamente al artefacto Q4_K_M con la configuración de servicio indicada.

## Capacidades

- Limpieza de dictado en inglés: eliminación de muletillas, repeticiones accidentales y resolución de correcciones habladas (por ejemplo, "el martes, no, el miércoles").
- Puntuación y normalización de texto preservando el significado y el estilo del hablante.
- Modo chat y modo correo electrónico; el modo correo formatea saludos, párrafos y despedidas.
- Comandos estructurales de dictado: "new line" (salto de línea), "new paragraph" (línea en blanco), "exclamation mark"/"exclamation point" (`!`), viñetas ("bullet point") y listas numeradas ("First... Second... Third...").
- Sugerencias de vocabulario personalizado mediante bloque `<VOCABULARY>`: candidatos de ortografía, no sustituciones forzadas.
- Preservación de frases que contienen palabras de comando de forma literal (por ejemplo, "a new line of products").
- No cubre la conversión de "period", "full stop", "comma" o "question mark" hablados en esta versión.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Dictado de chat en local: integración con un reconocedor de voz para limpiar transcripciones antes de enviarlas en aplicaciones de mensajería; el modelo cabe en CPU con el GGUF Q4_K_M y responde con decodificación determinista.
- Redacción de correos por voz: el modo email formatea saludos, párrafos y despedidas a partir de un dictado, adecuado para clientes de correo de escritorio que procesan audio en el dispositivo.
- Post-procesado en pipelines de ASR: inserción como etapa de normalización tras el reconocedor, con una ventana de 4.096 tokens y salida máxima de 512 tokens por petición.
- Aplicaciones de accesibilidad: conversión de dictado a texto estructurado para usuarios con movilidad reducida, ejecutándose sin conexión y sin GPU.
- Notas y listas de tareas: generación de listas con viñetas o numeradas a partir de dictado ("Packing list. Bullet point socks..."), útil en aplicaciones de notas.
- Corrección de vocabulario específico de dominio: uso del bloque `<VOCABULARY>` para sugerir grafías canónicas de nombres propios o términos técnicos sin forzar sustituciones.
- Despliegue en entornos con recursos limitados: servidor llama.cpp en CPU con `-ngl 0`, apropiado para dispositivos de usuario final o servidores sin acelerador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la evaluación aplica al artefacto Q4_K_M con la configuración de servicio indicada, pero no incluye cifras de MMLU, HumanEval, GSM8K ni métricas de calidad de limpieza de dictado.

## Requisitos de hardware

- VRAM estimada: no aplica para el artefacto Q4_K_M, diseñado para ejecución en CPU (`-ngl 0`). El F16 GGUF ocupa 1.509.343.072 bytes (unos 1,51 GB); el Q4_K_M ocupa 484.215.648 bytes (unos 484 MB).
- GPU recomendadas: no disponibles en la información proporcionada; el ejemplo de despliegue documentado es exclusivamente CPU.
- Cabe en GPU consumer: no se documenta; por tamaño de pesos, el Q4_K_M (unos 484 MB) y el F16 (unos 1,51 GB) serían compatibles con GPUs de consumo en términos de memoria, pero no hay confirmación del autor.
- Opciones de despliegue: llama.cpp b10537 o superior, con `llama-server` y el chat template proporcionado; el endpoint es compatible con `/v1/chat/completions`. No se documentan vLLM, TGI ni Ollama.
- Configuración de servicio recomendada: `-c 4096 -b 256 -t 6 -np 1 -ngl 0`, `max_tokens` 512, `cache_prompt` activado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (limpieza de dictado) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües documentadas.
- El autor reconoce errores conocidos de limpieza y de entidades; esta revisión no garantiza cero regresiones.
- Las sugerencias de vocabulario son candidatos de ortografía, no sustituciones forzadas, por lo que pueden no aplicarse.
- La conversión de "period", "full stop", "comma" y "question mark" hablados queda fuera del alcance de esta versión.
- Requiere usar los prompts de sistema y el chat template exactos; un uso incorrecto del contrato de entrada puede degradar la salida.
- La decodificación debe ser determinista (temperature 0) según la configuración recomendada; no se documenta comportamiento con muestreo.
- Si `finish_reason` no es "stop", el ejemplo oficial indica conservar la transcripción original, lo que sugiere posibles truncamientos o fallos de finalización.
- Licencia Stream-1 Mini: permite uso comercial con atribución; es necesario revisar LICENSE, LICENSE-APACHE-2.0 y NOTICE para los términos exactos.
- Riesgo de alucinación: no cuantificado en la información disponible; al ser un modelo de 0,75B parámetros especializado, la fidelidad depende del contrato de prompts.
- Cada petición debe limitarse a la transcripción actual; no se documenta el comportamiento con entradas largas más allá de los 4.096 tokens probados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/whisperstream/stream-1-mini
- Modelo base Qwen3-0.6B-Base: https://huggingface.co/Qwen/Qwen3-0.6B-Base/tree/da87bfb608c14b7cf20ba1ce41287e8de496c0cd
- Hugging Face CLI: https://huggingface.co/docs/huggingface_hub/guides/cli
- llama.cpp release b10537: https://github.com/ggml-org/llama.cpp/releases/tag/b10537
