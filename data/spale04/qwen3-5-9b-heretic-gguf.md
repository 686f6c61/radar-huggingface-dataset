# spale04/Qwen3.5-9B-heretic-GGUF

## Resumen

Qwen3.5-9B-heretic-GGUF es una versión "abliterated" (sin rechazos) del modelo Qwen/Qwen3.5-9B de Alibaba, publicada por el usuario spale04 bajo licencia Apache 2.0. El modelo base es un transformer multimodal de 8.953.803.264 parámetros (aproximadamente 9B) que acepta entrada de texto e imagen y dispone de modo de razonamiento (thinking mode). La modificación se ha realizado con la herramienta Heretic 2.1.0 mediante ablación de rango arbitrario (Arbitrary-Rank Ablation), ejecutada en una única GPU RTX 5060 Ti de 16 GB.

El objetivo del autor es eliminar el comportamiento de rechazo del modelo original sin degradar sus capacidades: según la model card, pasa de 100/100 rechazos en el original a 5/100 en esta versión, con una divergencia KL de 0,119 respecto al modelo base. En pruebas sin thinking, las diferencias en IFEval, MMLU y HumanEval se mantienen dentro del ruido estadístico (+1,5, −0,9 y 0,0 puntos respectivamente). Con thinking activado y un límite de razonamiento de 4096 tokens, el autor reporta 95,0 en GSM8K, 97,0 en HumanEval y 92,0 en IFEval.

La relevancia actual es doble: por un lado, ofrece una alternativa sin alineación de seguridad para entornos donde se necesita un modelo sin restricciones de contenido (investigación, generación creativa sin filtros, pruebas de robustez); por otro, demuestra que las técnicas de abliteración pueden aplicarse a modelos multimodales de ~9B manteniendo el rendimiento en benchmarks estándar. Se distribuye exclusivamente en formato GGUF para llama.cpp y LM Studio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-9B; detalles de atención no disponibles) |
| Parámetros totales | 8.953.803.264 (~9B) |
| Parámetros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | 32.768 tokens (configurado en el comando de ejemplo de la model card) |
| Tipos de cuantización | Q8_0 (fichero principal); mmproj en F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp / LM Studio) |

## Arquitectura y entrenamiento

El modelo es una modificación post-entrenamiento del Qwen3.5-9B original. No se ha reentrenado desde cero: la model card indica que se aplicó Heretic 2.1.0 con la técnica de Arbitrary-Rank Ablation sobre el modelo base, un proceso que identifica y suprime direcciones en el espacio de activaciones asociadas a los rechazos. El resultado elegido modifica las capas 9 a 27 (de un total no especificado) y fue seleccionado de un frente de Pareto; las variantes más conservadoras mantenían 30/100 y 41/100 rechazos con divergencias KL de 0,070 y 0,037 respectivamente.

La ablación se midió con el modelo cargado en 4 bits (NF4) sobre 100 prompts dañinos y 100 inofensivos. No se dispone de información sobre el dataset de entrenamiento original de Qwen3.5-9B (número de tokens, composición, uso de RLHF/DPO) en la documentación proporcionada. La model card menciona que el modelo conserva el modo de razonamiento (thinking mode) del original y que el autor recomienda un `--reasoning-budget 4096` para limitar la longitud del bloque de pensamiento.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con modo thinking activable y limitable mediante `--reasoning-budget`.
- Entrada de imágenes (image-text-to-text) si se carga el fichero `mmproj-Qwen3.5-9B-F16.gguf` junto al modelo principal.
- Generación de código: HumanEval pass@1 de 85,4 sin thinking y 97,0 con thinking (límite 4096).
- Matemáticas: GSM8K de 95,0 con thinking limitado a 4096 tokens.
- Seguimiento de instrucciones: IFEval prompt-level strict de 86,3 sin thinking y 92,0 con thinking limitado.
- Comportamiento sin alineación de seguridad: 5/100 rechazos ante prompts dañinos según la medición del autor.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-step: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y robustez: el modelo permite estudiar el comportamiento de un LLM sin rechazos manteniendo capacidades cercanas al original (diferencias dentro del ruido en IFEval, MMLU y HumanEval sin thinking), lo que facilita experimentos controlados sobre seguridad y abliteración.
- Generación creativa sin filtros: escritura de ficción, guiones o narrativa que requiera temáticas adultas o controvertidas, donde el modelo original rechazaría la petición; el autor reporta 5/100 rechazos frente a 100/100 del base.
- Procesamiento de documentos con imágenes: al cargar el mmproj, el modelo acepta entradas image-text-to-text, útil para extracción de información de capturas, diagramas o documentos escaneados en pipelines locales con llama.cpp.
- Asistencia de código en local: con HumanEval pass@1 de 97,0 usando thinking limitado a 4096 tokens, es adecuado para autocompletado y generación de funciones en entornos de desarrollo sin conexión, desplegado con llama-server o LM Studio.
- Razonamiento matemático con presupuesto controlado: el límite de 4096 tokens de thinking evita el problema del modelo original, que superaba los 12.000 tokens en 24 de 200 problemas de GSM8K sin dar respuesta; útil en sistemas de tutoría o resolución de problemas con latencia acotada.
- Evaluación de salvaguardas y red teaming: al ser un modelo deliberadamente sin alinear, sirve como contraparte para probar clasificadores de contenido, filtros de salida y sistemas de moderación antes de desplegarlos en producción.
- Despliegue en hardware de consumo: el fichero Q8_0 (9,53 GB) cabe en una GPU de 16 GB con contexto de 32.768 tokens, según el autor, lo que permite ejecutar un modelo multimodal de ~9B en estaciones de trabajo con RTX 5060 Ti o similares.

## Benchmarks y rendimiento

Datos medidos por el autor con ambos modelos en Q8_0 GGUF sobre llama-server (b12387), mismos prompts y ajustes. Sin thinking: decodificación greedy. Con thinking: temperatura 0,6, top-p 0,95, top-k 20, máximo 12.000 tokens por respuesta. ± es un error estándar.

**Thinking desactivado**

| Benchmark | Preguntas | Original | Heretic | Diferencia |
|---|---|---|---|---|
| IFEval, prompt-level strict | 541 | 84,8 ± 1,5 | 86,3 ± 1,5 | +1,5 |
| MMLU | 1.710 (30 por materia) | 78,0 ± 1,0 | 77,1 ± 1,0 | −0,9 |
| HumanEval pass@1 | 164 | 85,4 ± 2,8 | 85,4 ± 2,8 | 0,0 |

**Thinking activado**

| Benchmark | Preguntas | Original | Heretic | Heretic, límite 4096 |
|---|---|---|---|---|
| GSM8K | 200 | 86,5 ± 2,4 | 89,0 ± 2,2 | 95,0 ± 1,5 |
| MMLU | 171 (3 por materia) | 90,1 ± 2,3 | 89,5 ± 2,4 | 91,2 ± 2,2 |
| HumanEval pass@1 | 164 | 97,0 ± 1,3 | 89,6 ± 2,4 | 97,0 ± 1,3 |
| IFEval, prompt-level strict | 100 | 80,0 ± 4,0 | 81,0 ± 3,9 | 92,0 ± 2,7 |

El autor señala que la caída en HumanEval con thinking sin límite (89,6 frente a 97,0) se debe a la longitud: Heretic genera una mediana de 1.324 tokens de pensamiento por tarea frente a 826 del original, y 11 de 164 tareas alcanzaron el límite de 12.000 tokens antes de responder. En las tareas que completó, la tasa de acierto fue del 96,1%.

**Abliteración (medición de Heretic, modelo en 4 bits NF4, 100 prompts dañinos y 100 inofensivos)**

| Métrica | Original | Heretic |
|---|---|---|
| Rechazos | 100/100 | 5/100 |
| Divergencia KL respecto al original | 0 | 0,119 |

## Requisitos de hardware

- VRAM estimada: el fichero Q8_0 ocupa 9,53 GB y el mmproj F16 añade 0,92 GB; con contexto de 32.768 tokens el autor indica que cabe completamente en una GPU de 16 GB.
- GPU recomendadas: RTX 5060 Ti 16 GB (usada por el autor para la ablación y para medir 45 tok/s en Q8_0), así como cualquier GPU con al menos 16 GB de VRAM para el contexto indicado.
- Cabe en GPU de consumo: sí, en modelos con 16 GB o más (RTX 5060 Ti, RTX 4080/4090, etc.). No se dispone de datos para GPUs con menos VRAM.
- Opciones de despliegue: llama.cpp (llama-server), LM Studio. El autor no menciona soporte explícito para vLLM, TGI u Ollama.
- Latencia y throughput: 45 tok/s en Q8_0 sobre RTX 5060 Ti según la model card. No se dispone de más datos de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-heretic-GGUF (este) | ~9B | 32.768 (configurado) | Apache 2.0 | GGUF | 5/100 rechazos; MMLU 77,1 sin thinking; multimodal con mmproj |
| Qwen/Qwen3.5-9B (base) | ~9B | no disponible | Apache 2.0 | safetensors y otros | 100/100 rechazos; MMLU 78,0 sin thinking; multimodal |
| Gemma 4 E4B (referencia del autor) | no disponible | no disponible | no disponible | no disponible | El autor indica que con la misma herramienta Heretic bajó a 1/100 rechazos; no se aportan más datos |

No se dispone de información sobre otros modelos comparables de la misma categoría (abliterated multimodales de ~9B) en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo sin alineación de seguridad: el autor advierte explícitamente que "no está alineado en seguridad" y que deben añadirse barreras propias donde sea necesario. No debe desplegarse en aplicaciones de cara al público sin moderación adicional.
- Riesgo de alucinación: no se han publicado métricas específicas de veracidad o factualidad; como todo LLM, puede generar contenido incorrecto con aparente confianza.
- Sesgos conocidos: no disponible en la información proporcionada.
- Limitaciones de contexto: el contexto configurado en el ejemplo es de 32.768 tokens; no se especifica la longitud máxima nativa del modelo base.
- Limitaciones de idioma: no se dispone de la lista de idiomas soportados.
- Longitud del razonamiento: sin límite de thinking, el modelo genera respuestas más largas que el original (mediana de 1.324 frente a 826 tokens) y puede agotar el presupuesto de tokens sin responder; se recomienda usar `--reasoning-budget 4096`.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base y la modificación deben cumplir las condiciones de atribución de la licencia; el autor no impone restricciones adicionales más allá de la licencia declarada.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 17 de noviembre de 2026; no hay validación externa de los resultados reportados por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/spale04/Qwen3.5-9B-heretic-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Sitio web del autor: https://spaleai.com
- Perfil en X del autor: https://x.com/spaleon_x
- GitHub del autor: https://github.com/spixyy7
- Discord del autor: https://discord.gg/udthV8ynMu
