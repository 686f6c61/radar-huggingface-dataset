# Thox-ai/ThoxOpen-8B-Heretic

## Resumen

ThoxOpen-8B-Heretic es una versión modificada de Qwen/Qwen3-8B publicada por Thox-ai (THOX.ai) que aplica una técnica de "abliteration" mediante la herramienta Heretic para reducir los comportamientos de rechazo del modelo original. No se trata de un modelo entrenado desde cero: los pesos son los de Qwen3-8B modificados in-house, por lo que la arquitectura subyacente, el tamaño (8.190.735.360 parámetros) y las capacidades base heredan las del modelo de Alibaba. El repositorio distribuye tanto los pesos en safetensors (cuatro shards, ~16,4 GB) como conversiones GGUF en Q8_0, Q5_K_M y Q4_K_M generadas con llama.cpp.

El modelo se posiciona explícitamente como "local-first" y orientado a portátiles, con etiquetas que enfatizan despliegue en Ollama y llama.cpp. La propuesta de valor es ofrecer un modelo de 8B con rechazo mínimo para casos donde las restricciones del modelo original resultan limitadoras, manteniendo licencia Apache 2.0. Es relevante en el ecosistema de modelos "abliterated" o "uncensored" que buscan eliminar capas de rechazo sin reentrenar.

La información pública es limitada: la model card es extensa en filosofía corporativa y procedencia de ficheros, pero escasa en detalles técnicos sobre el proceso de abliteration, datos de entrenamiento o evaluación comparativa. El modelo declara únicamente inglés como idioma soportado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3-8B; detalles específicos de capas y atención no disponibles en la información proporcionada) |
| Parámetros totales | 8.190.735.360 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Safetensors (BF16/FP16 presumiblemente), GGUF Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (4 shards) y GGUF |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-8B, un transformer denso de 8.190 millones de parámetros. THOX no entrenó el modelo: aplicó la herramienta Heretic (versión fijada en la sección Provenance de la model card, no reproducida aquí) sobre los pesos stock de Qwen3-8B para producir una versión "abliterated" con rechazo mínimo. El proceso de abliteration típicamente identifica direcciones en el espacio de activaciones asociadas a comportamientos de rechazo y las proyecta fuera, modificando los pesos sin reentrenamiento supervisado ni RLHF adicional.

No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset, ni si hubo fases de RLHF o DPO en el modelo base más allá de lo que publique la documentación de Qwen3-8B. La model card no detalla innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) más allá de la modificación de pesos. Los pesos resultantes no son byte-idénticos a Qwen/Qwen3-8B.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento y respuesta a instrucciones heredados de Qwen3-8B.
- Generación de código y matemáticas (capacidades del modelo base, no evaluadas específicamente en esta build).
- Rechazo mínimo: menor probabilidad de negarse a responder consultas que el modelo base rechazaría.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Despliegue local vía llama.cpp, Ollama y GGUF.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo "thinking" en la información proporcionada.

## Casos de uso

- Despliegue en portátil para asistentes personales offline: con cuantización Q4_K_M (~5 GB) el modelo cabe en GPUs consumer de 8 GB VRAM y permite conversaciones locales sin conexión, adecuado para entornos con requisitos de privacidad.
- Generación creativa sin restricciones temáticas: escritura de ficción, guiones o contenido donde el modelo base aplicaría rechazos; la abliteration reduce las negativas automáticas.
- Investigación sobre alineación y rechazo: comparar las respuestas de esta build con Qwen3-8B stock para estudiar cómo la abliteration afecta al comportamiento en dominios sensibles.
- Prototipado rápido con Ollama: el GGUF Q4_K_M permite `ollama run` inmediato en estaciones de trabajo sin GPU dedicada, útil para demos y pruebas de concepto.
- Procesamiento de texto por lotes en CPU: con llama.cpp y Q4_K_M se puede ejecutar en servidores sin GPU para tareas de generación de texto no críticas.
- Base para fine-tuning ligero: al ser Apache 2.0 y safetensors, sirve como punto de partida para ajustes con LoRA en dominios específicos donde se quiera partir de un modelo con menos rechazos.
- Chat conversacional multi-turno: hereda la ventana de contexto de Qwen3-8B (longitud exacta no disponible), adecuado para diálogos de soporte o tutoría en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona ficheros `results.json`, `eval_log.txt` y `capability_log.txt` en el repositorio, pero no se incluyen sus valores en la información proporcionada. No se inventan cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: ~16,4 GB en safetensors (BF16/FP16); ~8,7 GB en GGUF Q8_0; ~5,9 GB en Q5_K_M; ~5,0 GB en Q4_K_M.
- GPU recomendadas: A100 o H100 para safetensors en FP16; RTX 4090 (24 GB) para safetensors o Q8_0; RTX 3060/4060 (8-12 GB) para Q5_K_M o Q4_K_M.
- Cabe en GPU consumer: sí, con cuantizaciones Q4_K_M y Q5_K_M en GPUs de 8 GB o más; Q8_0 requiere ~10-12 GB.
- Opciones de despliegue: Transformers (safetensors), llama.cpp (GGUF), Ollama (tag `ollama`), endpoints compatibles.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| ThoxOpen-8B-Heretic | 8,19B | No disponible | Apache 2.0 | Abliterated de Qwen3-8B, GGUF incluidos |
| Qwen/Qwen3-8B | 8,19B | No disponible en esta ficha | Apache 2.0 | Modelo base original, con rechazos estándar |
| Alternativas abliterated de 7-8B (p. ej. builds de Llama 3.1 8B o Mistral 7B) | ~7-8B | Variable | Según base | No se dispone de datos específicos de comparación en la información proporcionada |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- La abliteration puede degradar capacidades del modelo base (razonamiento, coherencia) al eliminar direcciones de activación; no se documenta una evaluación de regresión en la información disponible.
- Riesgo de alucinación inherente a modelos de 8B; la reducción de rechazos puede aumentar respuestas inseguras o incorrectas en dominios sensibles.
- Solo inglés declarado; el rendimiento en castellano no está garantizado ni evaluado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-8B tiene sus propios términos que deben respetarse.
- La model card incluye notas corporativas y filosofía de la empresa que no constituyen garantías técnicas.
- No se documentan sesgos específicos; hereda los del modelo base.
- Longitud de contexto no confirmada en la información proporcionada; verificar antes de usos con contextos largos.
- El repositorio tiene pocas descargas (932) y un solo like, lo que sugiere adopción limitada y poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/ThoxOpen-8B-Heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Herramienta Heretic: no disponible en la información proporcionada
- Paper o blog de THOX.ai: no disponible en la información proporcionada
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp (referenciado por la conversión GGUF)
