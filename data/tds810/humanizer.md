# Tds810/humanizer

## Resumen

humanizer es un modelo de 12B parámetros (11.959.730.224 según los pesos safetensors) afinado a partir de `google/gemma-4-12B` y publicado por el usuario Tds810 en HuggingFace. Su tarea es concreta y única: reescribir borradores generados por IA (correos, ensayos, informes, respuestas de foro) para que suenen a escritura humana, preservando de forma estricta cada número, unidad, fecha, nombre propio y cita del texto original, y sin añadir información nueva. Funciona en local, sin conexión a servicios externos.

El modelo se distribuye con un enfoque poco habitual en cuantización: además de los típicos Q6_K y Q8_0, incluye ficheros 2-bit, Q3 y Q4_K_M generados con asignación de bits por tensor según sensibilidad, entrenamiento consciente de cuantización y destilación desde el modelo bf16 completo usado como profesor, sobre datos de reescritura en inglés y chino. En el fichero de 3,9 GB (2-bit) esto eleva la coincidencia top-1 con bf16 del 70% (build estándar) al 87%.

Es relevante ahora porque ataca un problema de producción muy concreto —el texto generado por IA se detecta o se percibe como artificial— mediante un modelo pequeño que cabe en equipos de consumo, con aplicación de escritorio para macOS (Apple silicon) y Windows, CLI para documentos largos y compatibilidad con llama.cpp.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base `google/gemma-4-12B`; etiqueta `gemma4_unified` en HuggingFace y `image-text-to-text` entre los tags) |
| Parametros totales | 11.959.730.224 (~12B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (safetensors); GGUF: 2-bit, Q3, Q4_K_M, Q6_K, Q8_0 |
| Idiomas soportados | inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |
| Tamano del repo | 87,6 GB |
| Libreria declarada | gguf |
| Fecha de publicacion | 2026-10-15 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base ni la composición del dataset de afinado. Se sabe que es un finetune de `google/gemma-4-12B` (relación declarada `base_model_relation: finetune`) y que el repositorio incluye tanto pesos safetensors como ficheros GGUF. La etiqueta `gemma4_unified` y el tag `image-text-to-text` del repositorio sugieren capacidades multimodales heredadas del modelo base, pero no se documenta su uso en la tarea de reescritura.

La innovación técnica documentada está en la cuantización. Los ficheros de 2 bits, Q3 y Q4_K_M no proceden de una única pasada de `llama-quantize`: se midió cuánto daña cada tensor de pesos al comprimirse, se asignaron más bits a los tensores sensibles y menos a los robustos, y después los tres ficheros se entrenaron capa por capa con entrenamiento consciente de cuantización, destilando desde el modelo bf16 completo usado como profesor sobre datos de reescritura en inglés y chino. El resultado para el fichero de 2 bits (3,9 GB) es una coincidencia top-1 con bf16 del 87%, frente al 70% de un build estándar del mismo tamaño, pasando por hitos intermedios de 81% y 85%. Los ficheros Q6_K y Q8_0 son builds estándar de llama.cpp porque a esos tamaños apenas queda margen de recuperación. Todos los GGUF resultantes son ficheros ordinarios ejecutables en cualquier versión reciente de llama.cpp.

Un dato relevante de entrenamiento: la model card afirma explícitamente que no se usó ningún detector de IA en ninguna fase del entrenamiento.

## Capacidades

- Reescritura de texto generado por IA para que se lea como escrito por una persona, en inglés y chino.
- Preservación estricta de hechos: el modelo está entrenado para mantener cada número, unidad, fecha, nombre y cita, y para no añadir contenido nuevo.
- Adaptación de registro y estilo según el género del texto: correos de trabajo, ensayos, informes, respuestas de foro (se muestran ejemplos de un foro y de Zhihu).
- Procesamiento de documentos largos por partes mediante la CLI: mantiene encabezados, bloques de código, tablas y enlaces, y reescribe únicamente la prosa.
- Importación de `.docx` y PDF en la aplicación de escritorio (versión 0.3.2) y función "Create fact" que conserva palabra por palabra cualquier pasaje marcado por el usuario.
- Uso con agentes de código: el repositorio incluye `AGENTS.md` con los ficheros exactos, el comando de servidor, el prompt byte a byte y una autoprueba.
- Ejecución totalmente local y sin conexión tras la descarga inicial del fichero.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes multi-paso, matemáticas, código generativo ni audio. El tag `image-text-to-text` aparece en el repositorio, pero no hay descripción de uso de visión en la model card.

## Casos de uso

- Reescritura de correos profesionales: el modelo toma un borrador generado por IA y devuelve una versión con registro humano, conservando cifras de presupuesto, fechas de entrega y nombres de interlocutores, que es precisamente lo que la evaluación factual mide.
- Publicación en foros y comunidades técnicas (Stack Overflow, Zhihu, Reddit): permite que una respuesta redactada con asistencia de IA no se perciba como automática, con el matiz de que las normas de muchas comunidades exigen declarar el uso de IA.
- Redacción de documentación interna y notas de prensa: la CLI `hz` procesa ficheros `.md`, `.txt` y `.docx` conservando encabezados, tablas, enlaces y fragmentos de código, y reescribe solo la prosa.
- Adaptación de contenido para mercados en inglés y chino: el modelo cubre ambos idiomas, lo que permite tratar un mismo lote de textos en los dos idiomas con un único modelo local.
- Reescritura de trabajos académicos o ensayos manteniendo citas literales: la función "Create fact" de la app marca un pasaje para que se conserve palabra por palabra, útil cuando hay que preservar una cita textual dentro de un texto reescrito.
- Despliegue en entornos con requisitos de confidencialidad: al ejecutarse en local sobre llama.cpp, el texto nunca sale del equipo, lo que encaja en sectores con restricciones de tratamiento de datos.
- Integración en pipelines automatizados de publicacion: el CLI se puede invocar desde scripts o agentes de código (con `AGENTS.md` como guía), aunque la model card recomienda revisar el resultado antes de enviarlo, especialmente números, fechas y nombres.

## Benchmarks y rendimiento

Los datos publicados no son benchmarks académicos (MMLU, HumanEval, GSM8K), sino evaluaciones específicas de la tarea:

| Metrica | Resultado | Condiciones |
|---|---|---|
| Reescrituras juzgadas como humanas por Originality.ai | 95% (11 de 210 marcadas como IA) | 210 borradores en inglés, pesos bf16, ajuste más estricto del detector, 2026-10-02; la versión anterior marcaba 26 |
| Reescrituras en inglés sin problema factual | 376 de 420 | Juez LLM estricto, medido sobre el fichero `humanizer-12b-Q8_0.gguf` |
| Problemas factuales detectados en el conjunto completo | 135 problemas en 44 de 420 reescrituras; 125 son una sola palabra o frase | Juez LLM estricto |
| Coincidencia top-1 con bf16, fichero 2-bit (3,9 GB) | 87% (frente a 70% de un build estándar de llama.cpp del mismo tamano) | Con las etapas de asignacion de bits, QAT y destilacion |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- El tamaño de fichero solo está confirmado para el GGUF de 2 bits: 3,9 GB. La app indica que la opción de 2 bits permite funcionar en máquinas con 8 GB de memoria (app 0.3.0 y posteriores).
- Estimaciones aproximadas de VRAM para inferencia, derivadas del número de parámetros (12B) y del tamaño del fichero de 2 bits; no están publicadas en la model card: bf16 en torno a 24 GB; Q8_0 en torno a 13 GB; Q6_K en torno a 10 GB; Q4_K_M en torno a 7-8 GB; Q3 en torno a 5-6 GB; 2 bits en torno a 4-5 GB más el overhead del contexto.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, un modelo de 12B en Q4_K_M o inferior entra en GPU de consumo con 8-12 GB de VRAM (por ejemplo, RTX 3060 de 12 GB, RTX 4070, RTX 4090); los ficheros bf16 requieren GPU de 24 GB o más (RTX 3090, RTX 4090, A100, H100).
- Caben en GPU de consumo los formatos 2-bit, Q3, Q4_K_M e incluso Q6_K y Q8_0 en tarjetas de gama alta con 12-16 GB. La app está pensada además para ejecución en CPU o con aceleración parcial en Apple silicon, dado que soporta máquinas desde 8 GB.
- Opciones de despliegue: llama.cpp (y `llama-server`), la aplicación oficial de escritorio para macOS arm64 (`.dmg`) y Windows x64 (instalador), y la CLI `hz` instalable con `pipx`. También es compatible con `transformers` sobre los pesos safetensors. No se mencionan vLLM, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la información proporcionada. El único punto de referencia documentado es el propio modelo base `google/gemma-4-12B`, del que humanizer es un finetune, pero no se publican comparativas de rendimiento entre ambos. Tampoco hay datos frente a otras alternativas de reescritura o humanización de texto.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Tds810/humanizer | ~12B | no disponible | Apache 2.0 | safetensors y GGUF (2-bit, Q3, Q4_K_M, Q6_K, Q8_0) |
| google/gemma-4-12B | no disponible | no disponible | no disponible | modelo base del finetune |
| Alternativas de reescritura | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Riesgo factual medido, no teórico: el juez estricto marcó problemas en 44 de 420 reescrituras en inglés (135 problemas, 125 de ellos una sola palabra o frase). La model card recomienda revisar el resultado antes de enviarlo, especialmente números, fechas y nombres.
- Los ejemplos de "antes y después" que se muestran en la model card son selecciones: de cada borrador se generaron 8 muestras con Q8_0 y se eligió la que mejor se lee entre las que pasaron el juez de hechos, por lo que no representan el comportamiento medio.
- Sesgos conocidos: no documentados en la información disponible. Al estar entrenado para imitar escritura humana en inglés y chino sin datos de composición del dataset, no se puede evaluar el sesgo introducido por los datos de entrenamiento.
- Alcance lingüístico limitado a inglés y chino; no hay soporte declarado para castellano ni otros idiomas.
- Uso orientado a evadir la percepción de texto generado por IA: en contextos académicos, editoriales o profesionales, reescribir un texto generado por IA para ocultar su origen puede infringir normas de integridad académica o de divulgación de contenido sintético. Conviene revisar la normativa aplicable antes de usarlo.
- Licencia Apache 2.0: permite uso comercial y modificación, siempre que se conserve el aviso de licencia y se indique los cambios. No se declaran restricciones adicionales, aunque la licencia del modelo base (`google/gemma-4-12B`) no se detalla en la información disponible y conviene verificarla por separado.
- No hay confirmación de cuánto texto puede procesar de una sola vez: la longitud de contexto no está publicada, y la CLI mitiga esta limitación troceando el documento por partes.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-10-15): no hay validación independiente de terceros sobre los resultados declarados.
- Advertencia sobre la búsqueda web: los resultados obtenidos corresponden a una persona ajena al proyecto (Joe Fantasia), sin relación con el modelo. No aportan información verificable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tds810/humanizer
- Ficheros GGUF (repositorio separado): https://huggingface.co/jialinyyzz/humanizer-GGUF
- Repositorio GitHub: https://github.com/sgaofen/humanizer-local-model
- Releases de la aplicación: https://github.com/sgaofen/humanizer-local-model/releases/latest
- App macOS (Apple silicon), versión 0.3.2: https://github.com/sgaofen/humanizer-local-model/releases/download/app-v0.3.2/Humanizer-0.3.2-macos-arm64.dmg
- Instalador Windows x64, versión 0.3.2: https://github.com/sgaofen/humanizer-local-model/releases/download/app-v0.3.2/Humanizer-0.3.2-windows-x64-setup.exe
- Guía para agentes de código (AGENTS.md): https://github.com/sgaofen/humanizer-local-model/blob/main/AGENTS.md
- Uso sin la aplicación (USAGE.md): https://github.com/sgaofen/humanizer-local-model/blob/main/USAGE.md
- Uso sin la aplicación en chino (USAGE.zh.md): https://github.com/sgaofen/humanizer-local-model/blob/main/USAGE.zh.md
- Documentación de cuantización: https://github.com/sgaofen/humanizer-local-model/blob/main/docs/QUANTIZATION.md
- Guía de instalación: https://github.com/sgaofen/humanizer-local-model/blob/main/docs/INSTALL.md
- README en chino: https://github.com/sgaofen/humanizer-local-model/blob/main/README.zh.md
- Ejemplos de evaluación (8 muestras por borrador, 12B Q8_0): https://github.com/sgaofen/humanizer-local-model/blob/main/eval/outputs/examples-12b-Q8_0_x8.json
- Ejemplos antes y después: https://github.com/sgaofen/humanizer-local-model#before-and-after
- Modelo base: https://huggingface.co/google/gemma-4-12B
