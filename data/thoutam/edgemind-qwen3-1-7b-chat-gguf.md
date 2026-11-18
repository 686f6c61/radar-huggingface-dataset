# thoutam/edgemind-qwen3-1.7b-chat-gguf

## Resumen

EdgeMind Qwen3 1.7B Chat GGUF v0.1 es una conversión a formato GGUF del checkpoint Qwen3-1.7B de Alibaba Qwen, publicada por el usuario thoutam. No se trata de un fine-tune nuevo ni de un modelo entrenado desde cero: es una reexportación de los pesos originales de chat, sin el adaptador de extracción de mensajes que caracterizaba a la versión anterior EdgeMind v0.3. El objetivo declarado es ofrecer un modelo conversacional natural para despliegue en dispositivos de borde, especialmente teléfonos, evitando el comportamiento de emisión de JSON que arrastraba el candidato previo.

El modelo conserva la arquitectura del Qwen3-1.7B original, con 1.720.574.976 parámetros totales y una ventana de contexto que el autor recomienda arrancar en 2048 tokens en entorno móvil. La cadena de procedencia es relevante para evaluar su calidad: los pesos MLX 4-bit de mlx-community se descomprimieron a FP16 y se recuantizaron a GGUF Q4_K_M, de modo que acumula la pérdida de la cuantización original más la de la recuantización. El archivo final ocupa 1.107.408.896 bytes (aproximadamente 1,11 GB).

Su relevancia ahora es práctica: permite ejecutar un modelo de la familia Qwen3 en aplicaciones GGUF compatibles con Qwen3 en telefonos y equipos de bajos recursos, con licencia Apache-2.0 y una plantilla de chat embebida que desactiva el modo thinking. No obstante, el propio autor advierte que las comprobaciones realizadas son semillas pequeñas de escritorio y no constituyen un benchmark de calidad general; el rendimiento real en teléfono, memoria, batería y calidad conversacional sigue sin verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens recomendados en el arranque para movil; contexto nativo del modelo base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF Q4_K_M (unico archivo publicado) |
| Idiomas soportados | no disponible en la model card; se hereda del modelo base Qwen3-1.7B |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3-1.7B original: un transformer decoder-only de 1.720.574.976 parámetros. Esta ficha no dispone de detalles adicionales sobre número de capas, dimensiones ocultas, mecanismo de atención ni composición del dataset de entrenamiento del modelo base, por lo que no se pueden aportar cifras concretas de tokens de entrenamiento ni de fases de RLHF o DPO.

La innovación técnica de esta publicación no está en el entrenamiento, sino en el pipeline de exportación. Los pesos de partida son los de mlx-community/Qwen3-1.7B-4bit, fijados en la revisión `3b1b1768f8f8cf8351c712464f906e86c2b8269e`, que a su vez derivan de Qwen/Qwen3-1.7B. Esos pesos MLX 4-bit se descomprimieron a FP16 y se recuantizaron a GGUF Q4_K_M. El autor documenta explícitamente que este proceso conserva la pérdida de la cuantización de origen y añade la pérdida de la recuantización, y que no se aplicó ningún adaptador de extracción. La plantilla de chat embebida desactiva el modo thinking, y se incluyen la procedencia de la exportación y las sumas de verificación (SHA-256 del peso: `a6bb7fc7d18f4d47c4192f3b5f668f7a3552b25e1d7ddf6ea0f8ae2a015ab090`).

## Capacidades

- Generación de texto conversacional multi-turno: el autor verifica que mantiene historial de conversación en una prueba de seguimiento.
- Conversación natural sin envoltorio JSON: en las pruebas de escritorio, entradas como "Hellooo" producen un saludo en lugar de un objeto JSON.
- Aritmética básica y explicaciones: incluidas entre las ocho comprobaciones de escritorio realizadas.
- Modo thinking desactivado por defecto en la plantilla guardada, orientado a respuestas directas y concisas.
- Compatibilidad con aplicaciones GGUF de chat compatibles con Qwen3 (tag `endpoints_compatible`).
- Capacidades multilingües: no disponible en la información proporcionada; dependen del modelo base Qwen3-1.7B.
- Tool calling, function calling y razonamiento multi-paso en modo agente: no disponibles en la información proporcionada para esta exportación concreta.

## Casos de uso

- Asistente conversacional en aplicaciones móviles: el archivo Q4_K_M de 1,11 GB y la recomendación de 2048 tokens de contexto permiten importarlo en apps GGUF compatibles con Qwen3 en teléfonos, con respuestas de hasta 384 tokens y sampling no-thinking (temperatura 0,7, top-p 0,8, top-k 20, min-p 0).
- Chat de escritorio en equipos sin GPU dedicada: al ser un GGUF Q4_K_M de 1,7B, puede ejecutarse en CPU mediante llama.cpp; el autor reportó ausencia de envoltorio JSON y de eco literal en las ocho pruebas de CPU.
- Sustitución de flujos de extracción de mensajes: para equipos que usaban EdgeMind v0.3 con adaptador JSON y necesitan conversación libre, este modelo evita el prompt de extracción y el formateo JSON, según indica la model card.
- Prototipado rápido de interfaces conversacionales: la licencia Apache-2.0 y el tamaño reducido facilitan iterar en demos y pruebas de UX sin coste de infraestructura elevado.
- Evaluación de la familia Qwen3 en el borde: sirve como punto de partida para medir latencia, memoria y calidad conversacional en hardware móvil, un aspecto que el autor deja explícitamente sin verificar.
- Pruebas de robustez de plantillas de chat: al incluir una plantilla embebida con thinking desactivado, es útil para validar el comportamiento de aplicaciones que dependen de esa configuración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta comprobaciones cualitativas: ocho pruebas Metal superadas (incluidas las cuatro indicaciones originales de teléfono, un system prompt genérico, aritmética, explicación y un seguimiento con historial) y, en CPU, siete de ocho comprobaciones estrictas superadas, con un fallo en el que el modelo respondió "My name is Maya" a una pregunta sobre el nombre del usuario, confundiendo los roles. El propio autor señala que estas pruebas no constituyen un benchmark de calidad general.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el archivo GGUF Q4_K_M ocupa 1.107.408.896 bytes (aproximadamente 1,11 GB), a lo que hay que sumar el contexto KV cache (2048 tokens recomendados).
- GPU recomendadas: no disponibles en la información proporcionada; el autor reporta pruebas en Metal (escritorio) y en CPU.
- GPU de consumo: no confirmado por el autor; por tamaño, un modelo de 1,7B en Q4_K_M es candidato a ejecutarse en GPUs de consumo y en hardware integrado, pero no hay verificación publicada.
- Opciones de despliegue: llama.cpp y aplicaciones GGUF de chat compatibles con Qwen3 (tag `llama.cpp`); no se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles; el autor indica que el rendimiento en teléfono, memoria y batería siguen sin verificar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| EdgeMind Qwen3 1.7B Chat GGUF v0.1 | 1.720.574.976 | 2048 recomendados en movil | GGUF Q4_K_M | Apache-2.0 | Recuantizado desde MLX 4-bit; sin adaptador de extraccion |
| Qwen/Qwen3-1.7B | 1.720.574.976 (segun dato de parametros del base) | no disponible | safetensors | Apache-2.0 | Checkpoint original de chat |
| mlx-community/Qwen3-1.7B-4bit | no disponible | no disponible | MLX 4-bit | Apache-2.0 (heredada) | Origen directo de la recuantizacion |
| EdgeMind v0.3 (candidato previo) | no disponible | no disponible | no disponible | no disponible | Entrenado para analisis JSON de mensajes; podia emitir JSON al conversar |

## Limitaciones y advertencias

- Pérdida acumulada de cuantización: los pesos parten de MLX 4-bit descomprimidos a FP16 y recuantizados a Q4_K_M, por lo que se suma la pérdida de origen y la de recuantización.
- Confusión de roles: en las pruebas de CPU, el modelo respondió "My name is Maya" a una pregunta sobre el nombre del usuario, un fallo documentado por el autor.
- Riesgo de alucinación: no cuantificado en la información disponible; el autor admite que el modelo puede cometer errores.
- Calidad conversacional general sin verificar: las pruebas son semillas pequeñas de escritorio y no un benchmark.
- Rendimiento en teléfono sin verificar: memoria, batería y comportamiento de UI no han sido medidos.
- Contexto limitado en la práctica: se recomienda arrancar con 2048 tokens, lo que restringe conversaciones largas o documentos extensos.
- Requisitos de configuración: hay que desactivar formatos JSON, gramáticas y modos de salida estructurada en la app, y dejar el system prompt vacío o usar uno genérico.
- Idiomas soportados no documentados en esta model card.
- Licencia Apache-2.0: permite uso comercial, pero conviene conservar el archivo LICENSE y la atribución; el autor no detalla restricciones adicionales.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/thoutam/edgemind-qwen3-1.7b-chat-gguf)
- [Modelo base Qwen/Qwen3-1.7B](https://huggingface.co/Qwen/Qwen3-1.7B)
- [Origen de cuantización mlx-community/Qwen3-1.7B-4bit](https://huggingface.co/mlx-community/Qwen3-1.7B-4bit)
- [Archivo GGUF del modelo](https://huggingface.co/thoutam/edgemind-qwen3-1.7b-chat-gguf/blob/main/edgemind-qwen3-1.7b-chat-v0.1-Q4_K_M.gguf)
- [Informes de evaluación en el repositorio (carpeta evaluation/)](https://huggingface.co/thoutam/edgemind-qwen3-1.7b-chat-gguf/tree/main/evaluation)
