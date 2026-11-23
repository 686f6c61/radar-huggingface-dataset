# SpaceTimee/Suri-Qwen-3.8-27B-Companion

## Resumen

Suri-Qwen-3.8-27B-Companion es un ajuste fino (fine-tune) del modelo Qwen3.8-27B, desarrollado por el usuario SpaceTimee (bajo la marca "Space Time"). Está diseñado específicamente como modelo de companía conversacional ("companion"), es decir, para mantener conversaciones con un tono humano, empático y cotidiano, en lugar de priorizar tareas de razonamiento formal. El modelo se distribuye a través de Hugging Face con la librería transformers y pesos en safetensors.

El modelo parte de una arquitectura multimodal de tipo image-text-to-text heredada de Qwen3.8-27B, con 27.356.728.560 parámetros totales (aproximadamente 27,36 mil millones). El autor indica que el ajuste se ha realizado sobre Qwen/Qwen3.8-27B, unsloth/Qwen3.8-27B y una variante propia sin censura (SpaceTimee/Suri-Qwen-3.8-27B-Uncensored). Los idiomas declarados son chino (zh) e inglés (en).

Su relevancia radica en ser un ejemplo de fine-tune orientado a personalidad y conversación natural sobre una base de gran tamaño, con recomendaciones explícitas de parámetros de muestreo y de uso de system prompt para activar el personaje. No obstante, la información pública es escasa: no se detallan el dataset de ajuste, el número de tokens de entrenamiento ni resultados de benchmarks, y la licencia no está declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Qwen3.8-27B; detalles internos no disponibles |
| Parametros totales | 27.356.728.560 (~27,36 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 318,3 GB |
| Libreria | transformers |
| Pipeline | image-text-to-text |
| Modelo base | Qwen/Qwen3.8-27B; unsloth/Qwen3.8-27B; SpaceTimee/Suri-Qwen-3.8-27B-Uncensored |
| Descargas | 536 |
| Likes | 2 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.8-27B, un transformer multimodal capaz de procesar entradas de imagen y texto (pipeline image-text-to-text). El autor no publica detalles sobre la composición interna (número de capas, dimensiones ocultas, mecanismo de atención, tokenizador) ni sobre si la base emplea mezcla de expertos; el recuento de parámetros y la ausencia de indicación de parámetros activos sugieren un modelo denso, pero este extremo no está confirmado en la información disponible.

Respecto al entrenamiento, la model card no especifica el volumen de tokens, la composición del dataset de ajuste, ni si se emplearon técnicas de RLHF, DPO o SFT supervisado. Solo se indica que el modelo deriva de Qwen3.8-27B y de una variante "Uncensored" del mismo autor, y que está optimizado para un estilo conversacional humanizado. Tampoco se documentan innovaciones técnicas propias (decodificación especulativa, atención lineal, etc.). El autor recomienda parámetros de muestreo concretos (temperatura 0,8–1,0; top_p 0,8–0,95; repetition_penalty 1–1,1) y señala que el modo no razonador produce una mayor sensación de humanidad.

## Capacidades

- Generación de texto conversacional con estilo humanizado, orientado a charla cotidiana y empatía.
- Comprensión de entradas de imagen y texto (pipeline image-text-to-text heredado de la base).
- Capacidad de asumir un personaje mediante system prompt (el autor proporciona un ejemplo de persona "Suri", estudiante universitaria).
- Uso como modelo de respuesta en arquitecturas de dos modelos, combinado con un modelo de planificación/razonamiento más potente.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el autor sugiere delegar el razonamiento a otro modelo.
- Capacidades multilingües limitadas a chino e inglés según los metadatos.
- Modo "thinking" o razonamiento explícito: no disponible; de hecho, el autor recomienda el modo no razonador para conversación.

## Casos de uso

- Chat de companía y ocio conversacional: el modelo está ajustado para mantener conversaciones multi-turno con tono humano y humor, por lo que encaja en aplicaciones de entretenimiento, comunidades y bots sociales donde la naturalidad prima sobre la precisión factual.
- Simulación de personajes en videojuegos o narrativa interactiva: gracias a la capacidad de fijar personalidad mediante system prompt, puede interpretar roles con un registro coloquial consistente.
- Asistente de respuesta en pipelines de dos etapas: el autor propone usarlo como modelo "respondedor" junto a un planificador más capaz, de modo que el primero redacte respuestas naturales a partir de instrucciones del segundo.
- Atención al cliente con tono cercano: para dominios acotados y con supervisión humana, puede gestionar diálogos informales en chino o inglés, aunque sin garantías documentadas de precisión.
- Prácticas de conversación y apoyo emocional ligero: puede emplearse en entornos controlados para simular interlocutores en ejercicios de habilidades sociales, con las cautelas propias de un modelo sin evaluación clínica.
- Prototipado rápido de interfaces conversacionales: al estar en transformers y safetensors, es desplegable con text-generation-inference y útil para validar experiencias de chat antes de invertir en un modelo mayor.
- Investigación sobre personalidad y estilo en LLM: sirve como caso de estudio de fine-tune de "companion" sobre una base de 27 B, comparando con la base original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27,36 B parámetros, en fp16 se requieren aproximadamente 55 GB solo para pesos, más overhead de KV cache; en cuantización de 8 bits, unos 28–30 GB; en 4 bits, unos 15–17 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: A100 80 GB o H100 80 GB para fp16 sin cuantizar; A100 40 GB o L40S 48 GB para 8 bits; para 4 bits podría caber en una RTX 4090 de 24 GB, aunque con contexto limitado.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) solo con cuantización agresiva y contexto reducido; no se dispone de confirmación oficial.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible); vLLM, llama.cpp u Ollama no están documentados para este repositorio, y no se publican pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Suri-Qwen-3.8-27B-Companion | ~27,36 B | no disponible | no disponible | Companion / chat humanizado |
| Qwen/Qwen3.8-27B (base) | ~27 B (según base) | no disponible | no disponible | Modelo generalista multimodal |
| SpaceTimee/Suri-Qwen-3.8-27B-Uncensored | no disponible | no disponible | no disponible | Variante sin censura del mismo autor |
| unsloth/Qwen3.8-27B | ~27 B (según base) | no disponible | no disponible | Distribución optimizada de la base |

No se dispone de datos de rendimiento comparado ni de especificaciones detalladas de los modelos alternativos en la información proporcionada; la comparación se limita a linaje y propósito.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un fine-tune conversacional sin evaluación publicada, pueden aparecer sesgos de estilo, género o culturales no medidos.
- Riesgo de alucinación: alto en un modelo orientado a conversación y sin benchmarks de fidelidad factual; no debe usarse como fuente de verdad.
- Limitaciones de contexto e idioma: solo se declaran chino e inglés; la longitud de contexto no está especificada.
- Licencia: no disponible, lo que impide confirmar si se permite uso comercial; es un riesgo legal relevante para producción.
- Restricciones de uso: el autor menciona una variante "Uncensored" como base, lo que puede implicar menor filtrado de contenido; se recomienda moderación externa.
- Producción: sin benchmarks, sin ficha de datos de entrenamiento y con solo 536 descargas, la madurez y el soporte comunitario son limitados.
- El modelo está pensado para conversación; el propio autor sugiere combinarlo con un modelo de razonamiento para tareas complejas.

## Enlaces

- Hugging Face: https://huggingface.co/SpaceTimee/Suri-Qwen-3.8-27B-Companion
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Base alternativa: https://huggingface.co/unsloth/Qwen3.8-27B
- Variante del autor: https://huggingface.co/SpaceTimee/Suri-Qwen-3.8-27B-Uncensored
- Ejemplo de salida 1: https://cdn-uploads.huggingface.co/production/uploads/64e4905dfe53a047e5c5f29e/13Kaoi1iumM1cd1bE6jJ1.png
- Ejemplo de salida 2: https://cdn-uploads.huggingface.co/production/uploads/64e4905dfe53a047e5c5f29e/FiS0mn_DMBsy4p4_rM-LE.png
- Contacto del autor: QQ 902575634; correo Zeus6_6@163.com
