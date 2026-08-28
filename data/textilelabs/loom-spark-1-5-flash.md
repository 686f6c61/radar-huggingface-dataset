# textilelabs/Loom-Spark-1.5-Flash

## Resumen

Loom Spark 1.5 Flash es un modelo de lenguaje experimental de 1,35 millones de parámetros desarrollado por Textile Labs, diseñado como una variante mínima de la familia Loom Spark. Su propósito no es acumular conocimiento factual, sino demostrar que un modelo diminuto puede mantener coherencia conversacional, respetar su identidad y, sobre todo, terminar sus turnos de forma fiable sin que un runtime externo se lo indique. El problema que resuelve es concreto: las versiones anteriores de Loom (v1, 1.5 y 1.8) solo aprendían el token de fin de secuencia (`<|endoftext|>`) al final de un documento completo de entrenamiento, lo que provocaba que el modelo inventara el siguiente mensaje del usuario en tiempo de inferencia si no se configuraban manualmente los stop tokens.

La innovación clave de esta versión es que el token EOS se inserta después de cada respuesta del modelo durante el entrenamiento, no solo al final de cada documento. Verificado sobre 442.333 turnos, el 100 % de las respuestas del corpus terminan en EOS, y las pruebas en Ollama con configuración por defecto (sin Modelfile ni stop tokens manuales) arrojan cero turnos de autodiálogo. La arquitectura es un transformer decoder-only estilo GPT-2 con 128 dimensiones, 4 capas y 4 cabezas de atención, con un vocabulario BPE propio de 4096 tokens. Se entrenó desde cero en una CPU de escritorio (Dell OptiPlex 9020, i5-4690, sin GPU) en aproximadamente 34 minutos, con una pérdida final de validación de 0,3544.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (estilo GPT-2) |
| Parametros totales | 1.350.400 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (secuencias de entrenamiento de 256 tokens) |
| Tipos de cuantizacion | f32 (GGUF) |
| Idiomas soportados | Inglés |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only de 4 capas con 128 dimensiones ocultas y 4 cabezas de atención, equipado con un tokenizador BPE propio de 4096 tokens, generado específicamente para esta variante y no compartido con otras generaciones de Loom. El entrenamiento se realizó íntegramente en CPU (Dell OptiPlex 9020 con i5-4690 de 4 núcleos, sin GPU) durante 2.625 pasos con un batch de 32 secuencias de 256 tokens, lo que supone unos 34 minutos de cómputo. El corpus de entrenamiento es el mismo currículo generado proceduralmente de 70 MB utilizado en Loom Spark 1.8, con una modificación crítica: el token `<|endoftext|>` se añade después de cada turno del modelo, no únicamente al final de cada documento. Esta decisión de diseño elimina el problema de autodiálogo observado en versiones anteriores y permite que el modelo se detenga de forma natural incluso en runtimes sin configuración explícita de stop tokens. La pérdida final de validación fue de 0,3544.

## Capacidades

- Generación de texto conversacional con formato de prompt propio: `<tools:off>` para modo sin herramientas y `<tools:on>` para modo con herramientas.
- Soporte de tool calling mediante etiquetas `<lookup>consulta</lookup>`: el modelo emite una consulta de búsqueda que un harness externo procesa e inyecta como `<result>…</result>`.
- Terminación de turno fiable: el modelo aprende a emitir `<|endoftext|>` después de cada respuesta, eliminando el autodiálogo sin configuración externa.
- Coherencia de identidad: 0 de 12 sondas de identidad filtradas en las pruebas internas, lo que indica que el modelo mantiene su personaje de forma consistente.
- Registro emocional y contención: el modelo respeta los límites conversacionales y no divaga fuera de su rol.
- Integración con el harness de agentes Loom v0.2.2+, que detecta automáticamente el formato de marcadores por turno mediante una bandera explícita en `config.json`.
- Capacidades multilingües: no, el modelo solo soporta inglés.

## Casos de uso

- Pruebas de integración de runtimes de LLM: gracias a su terminación de turno fiable, sirve para verificar que un runtime (Ollama, llama.cpp, vLLM) respeta los tokens EOS sin necesidad de configuración manual de stop tokens.
- Desarrollo y depuración de harnesses de agentes: su formato de tool calling con `<lookup>` y `<result>` permite probar pipelines de búsqueda web e inyección de resultados en un entorno de bajo coste computacional.
- Educación en arquitecturas transformer: con solo 1,35 millones de parámetros, es un modelo ideal para estudiar el comportamiento de atención multi-cabeza, tokenización BPE y dinámicas de entrenamiento en CPU.
- Investigación sobre modelos mínimos viables: permite explorar el límite inferior de parámetros necesario para mantener identidad, estructura conversacional y terminación de turno, sin capacidad factual.
- Validación de pipelines de CI/CD para modelos de generación de texto: su tamaño diminuto y su entrenamiento reproducible en 34 minutos lo convierten en un candidato para pruebas automatizadas de despliegue y serialización.
- Prototipado de asistentes conversacionales con herramientas: el modo `<tools:on>` permite construir demos de asistentes que consultan fuentes externas, aunque con respuestas factuales poco fiables.
- Benchmarking de frameworks de inferencia: al ser un modelo de 5,4 MB en f32, es útil para medir overhead de frameworks como transformers, llama.cpp u Ollama sin el coste de modelos grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los únicos datos de rendimiento publicados son internos del laboratorio:

| Metrica interna | Resultado |
|---|---|
| Turnos del corpus que terminan en EOS | 442.333 / 442.333 (100 %) |
| Turnos de autodiálogo en Ollama sin configuración | 0 |
| Sondas de identidad filtradas | 0 / 12 |
| Fugas de `<lookup>` en preguntas factuales sin herramientas | 18 / 30 |
| Pérdida final de validación | 0,3544 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier cuantización; el modelo en f32 ocupa aproximadamente 5,4 MB en memoria.
- GPU recomendadas: cualquiera, incluidas GPUs integradas; el modelo se entrenó y ejecuta correctamente en CPU sin aceleración.
- Compatibilidad con GPU de consumo: sí, funciona en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU sola.
- Opciones de despliegue: transformers (Python), Ollama (con o sin Modelfile), llama.cpp mediante el archivo GGUF f32, y el harness de agentes Loom v0.2.2+.
- Latencia y throughput estimados: no disponibles oficialmente, pero dado el tamaño (1,35M parámetros), la generación es prácticamente instantánea incluso en CPU de escritorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Loom Spark 1.5 Flash | 1,35M | No disponible | MIT | Variante mínima, entrenada desde cero, EOS por turno |
| Loom Spark 1.5 | 12,32M | No disponible | MIT | Modelo principal de la familia, ~10 veces mayor |
| Loom Spark 1.8 | No disponible | No disponible | MIT | Última versión de la línea, sufre autodiálogo sin stop tokens |
| GPT-2 small (referencia) | 124M | 1024 tokens | MIT | Modelo de referencia de la misma familia arquitectónica, con capacidad factual real |

La comparativa se limita a la familia Loom y a GPT-2 como referencia arquitectónica, ya que no existen modelos de 1,35M de parámetros con objetivos similares (terminación de turno fiable y tool calling) en el ecosistema abierto.

## Limitaciones y advertencias

- Capacidad factual prácticamente nula: el modelo produce respuestas incorrectas o incoherentes ante casi cualquier pregunta factual; por ejemplo, "capital de Francia" puede responder "Buenos Aires". Esto es un diseño deliberado, no un fallo.
- Fugas de `<lookup>` en modo sin herramientas: en 18 de 30 preguntas factuales medidas, el modelo emitió etiquetas de búsqueda incluso con `<tools:off>`, lo que puede confundir a un harness que no espere ese formato.
- Entrecruzamiento de respuestas: el modelo puede responder a una pregunta con la respuesta de otra categoría similar (por ejemplo, responder "quién eres" con la respuesta de "quién te creó").
- Idioma limitado: solo inglés; no soporta otros idiomas.
- Longitud de contexto no documentada: aunque las secuencias de entrenamiento son de 256 tokens, no se especifica la ventana máxima soportada en inferencia.
- Riesgo de alucinación severo: debido a su tamaño, cualquier respuesta que requiera conocimiento del mundo será inventada.
- Uso en producción: no recomendado para tareas que requieran precisión factual; su utilidad se limita a investigación, pruebas y educación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/textilelabs/Loom-Spark-1.5-Flash
- Loom Spark 1.5 (modelo principal): https://huggingface.co/textilelabs/Loom-Spark-1.5
- Loom Spark 1.8 (versión anterior): https://huggingface.co/textilelabs/Loom-Spark-1.8
- Despliegue en FriendliAI (Loom-Spark-1.5): https://friendli.ai/models/textilelabs/Loom-Spark-1.5
- Repositorio del harness Loom en GitHub: https://github.com/sfw/loom
