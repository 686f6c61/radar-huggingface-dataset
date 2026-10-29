# UnstableLlama/MemT-1.0-Nano-exl3

## Resumen

MemT-1.0-Nano-exl3 es una cuantización en formato EXL3 (ExLlamaV3) del modelo MemTensor/MemT-1.0-Nano, publicada por UnstableLlama. El modelo base no es un transformer convencional: se construye congelando el backbone Qwen3.6-35B-A3B (MoE de 35B parámetros totales y unos 3B activos) y añadiendo un bloque de memoria entrenado sobre sus diez capas de atención completa. Ese bloque convierte los turnos previos de una conversación en un estado latente de 40 MiB por sesión, de modo que el modelo responde a partir de esa memoria en lugar de releer todo el historial en cada turno.

La relevancia práctica está en el coste de contexto: en la demo publicada, tras un comando `/commit` el prompt cae de 1858 a 21 tokens y el modelo sigue recordando la historia de la conversación. Esto permite conversaciones multi-turno largas con un prompt efectivo mínimo, algo útil en despliegues locales donde el coste de prefill y la VRAM de la caché KV son el cuello de botella.

Esta ficha describe la revisión cuantizada: pesos EXL3 en revisiones de 3.00 y 4.00 bpw (y una demo a 6 bpw), más el fichero `memt_block.safetensors` en bf16 (0.84 GiB), la configuración de MemT y una plantilla de chat con control de memoria en cliente. La licencia declarada es Apache 2.0 y solo funciona con TabbyAPI junto con el fork exl3-qlora de ExLlamaV3 mantenido por el mismo autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (backbone Qwen3.6-35B-A3B congelado) con bloque de memoria latente entrenado sobre las diez capas de atención completa |
| Parámetros totales | 35B (backbone Qwen3.6-35B-A3B); bloque de memoria: 0.84 GiB en bf16, aproximadamente 450 M de parámetros |
| Parámetros activos | ~3B (denominación A3B del backbone) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | EXL3 (ExLlamaV3): revisiones 3.00 bpw, 4.00 bpw (documentadas en la tabla del autor) y 6 bpw (usada en la demo); bloque de memoria en bf16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (EXL3); `memt_block.safetensors` en bf16; configuración MemT y plantilla de chat |

## Arquitectura y entrenamiento

El punto de partida es Qwen3.6-35B-A3B, un modelo Mixture of Experts de 35B parámetros totales con unos 3B activos por token, que se mantiene congelado tal como se publicó. Sobre sus diez capas de atención completa se añade un bloque de memoria nativo: un estado por sesión en fp32 con forma [16, 256, 256] por capa, lo que suma 4 MiB por capa y 40 MiB por sesión. Ese estado lo lee cada token de un turno y se actualiza una sola vez por turno finalizado mediante una recurrencia de tokens GDN-2 simetrizada, según la descripción del autor.

La cuantización no recuantiza el bloque de memoria: cada revisión EXL3 reutiliza el quant del backbone de yeasah/Qwen3.6-35B-A3B-exl3 (byte a byte, con crédito al autor original) y añade encima los ficheros de MemT. El autor no documenta en la información disponible el volumen de tokens de entrenamiento del bloque de memoria, la composición del dataset ni si hubo fases de RLHF o DPO; sí indica que el backbone permanece congelado y que el único componente entrenado es el bloque de memoria.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, apoyada en el backbone MoE Qwen3.6-35B-A3B.
- Memoria persistente por sesión: los turnos anteriores se comprimen en un estado latente de 40 MiB en lugar de mantenerse como texto en el prompt.
- Control de memoria en cliente: la plantilla de chat incluye una pequeña adición para gestionar la memoria, con comandos como `/commit` para fijar el turno en el estado latente.
- Reducción drástica del prompt efectivo: en la demo, de 1858 a 21 tokens tras el commit, manteniendo la coherencia con la información previa.
- Recuperación de información de turnos ya descartados del contexto textual (personajes, hechos y detalles de una historia en la demo).
- Compatibilidad con TabbyAPI como servidor de inferencia, a través del fork exl3-qlora de ExLlamaV3.
- No hay información disponible sobre tool calling, function calling, capacidades de agente multi-paso, visión, audio, modo thinking explícito ni cobertura multilingüe.

## Casos de uso

- Asistentes conversacionales de larga duración en local: el estado de 40 MiB por sesión sustituye al historial completo en el prompt, de modo que una conversación de decenas de turnos no escala el coste de prefill ni la caché KV de forma lineal.
- Atención al cliente con continuidad entre turnos: el modelo conserva datos aportados por el usuario (producto, incidencia, pasos ya intentados) aunque el prompt se recorte, lo que reduce repeticiones y preguntas redundantes.
- Roleplay y narrativa interactiva: la demo del autor muestra exactamente este escenario, con el modelo recordando la historia después de vaciar el historial textual; el estado latente actúa como memoria de la ficción.
- Agentes locales con memoria de sesión: al vivir el estado en el servidor de inferencia, un agente puede reiniciar el contexto textual entre pasos y apoyarse en el bloque de memoria para no perder el hilo de la tarea.
- Despliegue en hardware de consumo: la revisión de 3.00 bpw ocupa 15.67 GiB de pesos, lo que deja margen en una GPU de 24 GB para caché y estado de memoria, algo adecuado para prototipos y uso personal.
- Evaluación de técnicas de memoria latente: investigadores pueden comparar el comportamiento del modelo con y sin bloque MemT sobre el mismo backbone cuantizado, ya que ambas piezas se distribuyen por separado.
- Sustitución de resúmenes de historial en pipelines existentes: en lugar de generar y reinyectar resúmenes de conversación, el sistema puede delegar en el estado latente y ahorrar llamadas adicionales al modelo.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son métricas de calidad de cuantización (divergencia KL y perplejidad) por revisión, no benchmarks de tareas:

| Revisión | Tamano (GiB) | KL div | PPL | Quant del backbone |
|---|---|---|---|---|
| 3.00 bpw | 15.67 | 0.0215 | 1.3389 | 3.00bpw-H5 de yeasah |
| 4.00 bpw | No disponible (tabla truncada en la información) | No disponible | No disponible | No disponible |
| 6 bpw | No disponible | No disponible | No disponible | No disponible (usada en la demo sobre dos RTX 3090) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras tareas en la información disponible, ni comparaciones de rendimiento frente al modelo base sin memoria.

## Requisitos de hardware

- VRAM para inferencia: la revisión de 3.00 bpw ocupa 15.67 GiB solo en pesos; hay que sumar la caché KV, el estado de memoria (40 MiB por sesión) y el overhead del runtime. La revisión de 6 bpw se ejecutó en dos RTX 3090 (24 GB cada una) según la demo.
- GPU recomendadas: RTX 3090 o RTX 4090 para la revisión de 3.00 bpw; dos GPU de 24 GB para 6 bpw según la demo. Para 4.00 bpw no hay datos de tamaño publicados en la información disponible.
- Cabe en GPU de consumo: sí, al menos la revisión de 3.00 bpw en una GPU de 24 GB, siempre que se reserve VRAM para contexto y estado.
- Opciones de despliegue: TabbyAPI con el fork exl3-qlora de ExLlamaV3, que es un requisito explícito del autor. No hay soporte indicado para llama.cpp, Ollama, vLLM ni TGI en la información disponible, y el formato EXL3 no es portable a esos runtimes sin conversión.
- Latencia y throughput: no disponibles. El autor solo documenta el efecto cualitativo sobre el prompt (de 1858 a 21 tokens tras el commit), sin cifras de tokens por segundo.
- Almacenamiento: el repositorio completo ocupa 89.9 GB porque acumula varias revisiones cuantizadas; conviene descargar solo la revisión necesaria.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Memoria persistente | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| UnstableLlama/MemT-1.0-Nano-exl3 (esta ficha) | 35B totales, ~3B activos | No disponible | Sí, bloque MemT de 40 MiB por sesión | Apache 2.0 | safetensors EXL3, revisiones 3.00 y 4.00 bpw documentadas |
| MemTensor/MemT-1.0-Nano | 35B totales, ~3B activos | No disponible | Sí, bloque MemT | Apache 2.0 (según el modelo base declarado) | Pesos originales del modelo base; tamaño no disponible en la información |
| yeasah/Qwen3.6-35B-A3B-exl3 | 35B totales, ~3B activos | No disponible | No | No disponible en la información | safetensors EXL3; es el quant del backbone reutilizado aquí |
| Qwen3.6-35B-A3B (backbone) | 35B totales, ~3B activos | No disponible | No | No disponible en la información | Pesos originales del backbone |

La comparación relevante es frente al backbone sin memoria: mismo tamaño y misma familia, pero sin el estado latente, por lo que el coste de contexto por turno crece con el historial. No hay datos de rendimiento en tareas que permitan afirmar que el bloque MemT iguala al backbone sin memoria.

## Limitaciones y advertencias

- Dependencia de un fork: requiere el fork exl3-qlora de ExLlamaV3 y TabbyAPI; no funciona con el ExLlamaV3 estándar ni con los runtimes de inferencia más habituales sin ese parche.
- Naturaleza experimental: el propio autor etiqueta el soporte MemT en su repositorio como experimental, y la integración se ha movido en pull requests recientes, por lo que la API y el comportamiento pueden cambiar.
- Sin benchmarks de tareas: solo hay KL y PPL de la cuantización; no hay evidencia publicada sobre degradación en razonamiento, código o matemáticas respecto al modelo base.
- Riesgo de pérdida de información: la memoria es un estado latente comprimido de 40 MiB por sesión; detalles poco frecuentes o matices pueden no sobrevivir al commit, y no hay mecanismo documentado de recuperación exacta del texto original.
- Riesgo de alucinación: igual que en cualquier modelo generativo, y potencialmente mayor al responder desde una memoria comprimida en lugar de desde el texto literal del historial.
- Privacidad: el estado de memoria persiste información del usuario entre turnos y reside en el servidor de inferencia; hay que definir política de borrado y aislamiento por sesión antes de usarlo en producción.
- Idiomas no declarados: la model card no especifica cobertura lingüística, por lo que el rendimiento en castellano no está documentado.
- Licencia: Apache 2.0 para esta cuantización, pero conviene verificar la licencia del backbone y del modelo base antes de un uso comercial, ya que la información disponible no detalla las condiciones de Qwen3.6-35B-A3B.
- Tabla de revisiones incompleta en la información disponible: faltan los datos de tamaño, KL y PPL de 4.00 bpw y 6 bpw, lo que impide elegir revisión con criterio cuantitativo salvo para 3.00 bpw.
- Tamaño del repo: 89.9 GB en total; descargar el repositorio completo sin filtrar por revisión consume almacenamiento innecesario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UnstableLlama/MemT-1.0-Nano-exl3
- Modelo base: https://huggingface.co/MemTensor/MemT-1.0-Nano
- Quant del backbone reutilizado: https://huggingface.co/yeasah/Qwen3.6-35B-A3B-exl3
- Revisión 3.00 bpw: https://huggingface.co/UnstableLlama/MemT-1.0-Nano-exl3/tree/3.00bpw
- Revisión 4.00 bpw: https://huggingface.co/UnstableLlama/MemT-1.0-Nano-exl3/tree/4.00bpw
- Quant del backbone 3.00bpw-H5: https://huggingface.co/yeasah/Qwen3.6-35B-A3B-exl3/tree/3.00bpw-H5
- Fork exl3-qlora de ExLlamaV3: https://github.com/UnstableLlama/exl3-qlora
- Pull request con la implementación del bloque MemT: https://github.com/UnstableLlama/exl3-qlora/pull/180
- Pull request de sincronización y limpieza de MemT: https://github.com/UnstableLlama/exl3-qlora/pull/185
- Issue de contacto del equipo MemT: https://github.com/UnstableLlama/ezexl3/issues/286
- Demo en vídeo: https://huggingface.co/UnstableLlama/MemT-1.0-Nano-exl3/resolve/main/memt_demo.mp4
