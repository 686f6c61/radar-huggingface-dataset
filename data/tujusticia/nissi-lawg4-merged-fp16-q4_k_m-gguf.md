# tujusticia/nissi-lawg4-merged-fp16-Q4_K_M-GGUF

## Resumen

El modelo `tujusticia/nissi-lawg4-merged-fp16-Q4_K_M-GGUF` es una conversión a formato GGUF del modelo base `tujusticia/nissi-lawg4-merged-fp16`, realizada mediante la herramienta GGUF-my-repo de llama.cpp. El archivo cuantizado en Q4_K_M ocupa aproximadamente 3,4 GB y contiene unos 4.647 millones de parámetros, lo que lo sitúa en la gama de modelos pequeños optimizados para inferencia local en hardware modesto.

La model card original no proporciona información sobre la arquitectura, el entrenamiento, las capacidades o la licencia del modelo base. El único dato adicional es la etiqueta "conversational", que sugiere un uso orientado a diálogo, pero sin detalles verificables. Este repositorio es relevante únicamente como artefacto de distribución para ejecutar el modelo con llama.cpp, llama-server u otras herramientas compatibles con GGUF, pero carece de documentación técnica que permita evaluar su rendimiento o idoneidad para tareas concretas.

Dado que el modelo base no está documentado públicamente, cualquier afirmación sobre sus capacidades reales sería especulativa. Esta ficha se limita a los datos disponibles y marca explícitamente los campos desconocidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 4.647.450.147 (~4,65 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (único archivo en el repo) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base fp16) |

## Arquitectura y entrenamiento

No se ha publicado ninguna información sobre la arquitectura del modelo base `tujusticia/nissi-lawg4-merged-fp16`. El nombre "nissi-lawg4" podría sugerir una especialización en el ámbito legal, pero no hay confirmación. El repositorio GGUF es una conversión directa del modelo fp16 original mediante llama.cpp, sin modificaciones adicionales. Se desconoce el número de tokens de entrenamiento, la composición del dataset, si se aplicaron técnicas como RLHF o DPO, o si existe alguna innovación arquitectónica destacable.

## Capacidades

- Etiqueta "conversational" en HuggingFace, lo que indica un posible uso en diálogo, pero sin detalles sobre la calidad o el alcance.
- No se dispone de información sobre generación de código, razonamiento matemático, tool calling, soporte de agentes, capacidades multilingües o modos especiales (thinking, vision, audio).
- Al ser un modelo de ~4,65 B parámetros, es probable que tenga limitaciones inherentes en tareas complejas, pero esto es una inferencia basada en el tamaño, no un dato confirmado.

## Casos de uso

Dado que no hay información sobre las capacidades reales del modelo, los siguientes casos son hipotéticos y dependen de que el modelo base funcione adecuadamente en esas tareas. Se recomienda validar antes de usarlo en producción.

- Chatbot local para experimentación: al ser un GGUF Q4_K_M, puede ejecutarse en una GPU consumer con 4-6 GB de VRAM mediante llama.cpp u Ollama, permitiendo probar conversaciones básicas sin conexión.
- Asistente de redacción en entornos con restricciones de privacidad: si el modelo tiene competencia lingüística general, podría usarse para generar borradores de textos, aunque se desconoce su calidad.
- Prototipado rápido de aplicaciones de lenguaje: su tamaño reducido facilita iterar en entornos de desarrollo antes de migrar a modelos más grandes.
- Inferencia en CPU: al ser GGUF, puede ejecutarse en CPU con llama.cpp, aunque con latencia mayor, útil para pruebas en máquinas sin GPU.
- Fine-tuning posterior: el modelo base fp16 está disponible, por lo que se podría ajustar para tareas específicas, pero se desconoce su arquitectura y licencia, lo que complica este uso.
- Integración en pipelines de generación de texto simples: siempre que se valide su rendimiento, podría servir para tareas de completado o resumen en aplicaciones internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo o su base.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de ~4,65 B parámetros en Q4_K_M ocupa aproximadamente 3,4 GB en disco, y en memoria durante la inferencia se necesitan unos 4-5 GB (incluyendo overhead de contexto y capas). Esto es una estimación basada en el tamaño y la cuantización, no un dato oficial.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, GTX 1660 Super) puede ejecutarlo cómodamente. También cabe en GPUs de 4 GB con contexto reducido.
- En CPU: es viable con llama.cpp, aunque la velocidad dependerá del procesador; se recomienda al menos 8 GB de RAM.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama, LM Studio, o cualquier runtime compatible con GGUF. También se puede usar vLLM si se convierte a otro formato, pero no es necesario.
- Latencia y throughput: no disponibles. Dependerán del hardware y de la longitud de contexto.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo tiene un tamaño similar a otros modelos abiertos de ~4-5 B parámetros (por ejemplo, Llama-3.2-3B, Qwen2.5-4B, Gemma-2-2B), pero sin datos de rendimiento ni arquitectura, cualquier comparación sería especulativa. Se recomienda consultar benchmarks de modelos de tamaño comparable en el ecosistema GGUF para hacerse una idea general, pero no se puede afirmar que este modelo se comporte igual.

## Limitaciones y advertencias

- Licencia no especificada: el repositorio no indica ninguna licencia, lo que impide conocer las condiciones de uso comercial o de redistribución. Esto es un riesgo legal importante para cualquier aplicación en producción.
- Sin documentación del modelo base: se desconoce la arquitectura, el dataset de entrenamiento y las técnicas de alineación, por lo que no se pueden prever sesgos, alucinaciones o limitaciones de idioma.
- Riesgo de alucinación: al ser un modelo pequeño y sin información sobre su entrenamiento, es probable que presente alucinaciones en tareas de razonamiento o hechos, pero no hay datos que lo confirmen.
- Contexto limitado: no se conoce la longitud de contexto soportada; los modelos de este tamaño suelen tener ventanas de 4K a 8K tokens, pero no es verificable.
- Sin garantías de calidad: el tag "conversational" no implica un rendimiento adecuado para tareas específicas. Se recomienda realizar pruebas exhaustivas antes de cualquier uso real.
- Fecha de creación futura: el repositorio está fechado en agosto de 2026, lo que podría indicar un error en la plataforma o un modelo muy reciente; en cualquier caso, no hay evidencia de mantenimiento o soporte.

## Enlaces

- Repositorio GGUF: https://huggingface.co/tujusticia/nissi-lawg4-merged-fp16-Q4_K_M-GGUF
- Modelo base fp16: https://huggingface.co/tujusticia/nissi-lawg4-merged-fp16
- Herramienta de conversión GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
