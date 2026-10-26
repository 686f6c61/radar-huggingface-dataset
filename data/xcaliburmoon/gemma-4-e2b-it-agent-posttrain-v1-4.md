# XcaliburMoon/gemma-4-E2B-it-agent-posttrain-v1.4

## Resumen

gemma-4-E2B-it-agent-posttrain-v1.4 es un ajuste fino del modelo instruct google/gemma-4-E2B-it, publicado por el usuario XcaliburMoon, diseñado para una tarea muy concreta: emitir exactamente un objeto JSON con una llamada a herramienta por turno contra una superficie fija de diez herramientas simuladas (lectura y escritura de ficheros, listado, borrado, búsqueda, ejecución de comandos, SQL, creación de directorios y finalización). El runtime parsea la acción, ejecuta la herramienta y devuelve el resultado como observación, de modo que el modelo funciona como la pieza de decisión de un bucle de agente cerrado.

El checkpoint tiene 4.628.569.635 parámetros según los safetensors publicados y el repositorio ocupa 41,6 GB, con pesos en bf16, un adaptador LoRA, siete cuantizaciones GGUF y un registro cronológico de entrenamiento. Se entrenó con 4-bit QLoRA sobre 10.000 registros supervisados durante 2 épocas (626 pasos, pérdida final 0,8449) en cuatro NVIDIA A40. La model card lo describe explícitamente como artefacto de investigación para un único harness, no como modelo de chat general.

Su relevancia es acotada pero instructiva: documenta con detalle inusual el proceso de post-entrenamiento, el log de eventos y una evaluación de holdout con desglose por herramienta, en la que solo el 48,5 % de las 200 filas reservadas producen una llamada con herramienta y argumentos correctos. Es útil como referencia metodológica y como banco de pruebas de harnesses de tool calling, no como componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la información proporcionada; modelo derivado de google/gemma-4-E2B-it |
| Parámetros totales | 4.628.569.635 (≈4,63 B), según safetensors |
| Parámetros activos | No disponible; la información no indica que sea un modelo MoE |
| Longitud de contexto | No disponible; el ejemplo de despliegue de la model card usa `--ctx-size 4096`, pero es un parámetro de runtime, no la ventana del modelo |
| Tipos de cuantización | GGUF: Q2_K, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0, f16. Entrenamiento en QLoRA de 4 bits nf4 con doble cuantización |
| Idiomas soportados | Inglés (`en`) |
| Licencia | No disponible en los metadatos de HuggingFace; la model card indica que el derivado hereda los Gemma Terms of Use |
| Formato de pesos | safetensors (`merged-bf16/model.safetensors`, 10,21 GB; `adapter/adapter_model.safetensors`, 96,7 MB) y GGUF (llama.cpp) |
| Modelo base | google/gemma-4-E2B-it; entrenamiento continuado desde XcaliburMoon/gemma-4-E2B-it-agent-posttrain-v1.3 / v1.1 |
| Tamaño del repositorio | 41,6 GB |
| Versión y fecha | v1.4, publicada el 2026-10-26 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base (número de capas, atención, cabezas o si incorpora innovaciones como atención lineal). Lo que sí se documenta es el procedimiento de post-entrenamiento: 4-bit QLoRA en nf4 con doble cuantización, continuando desde los pesos fusionados de v1.1, con rango r=16, alpha=32 y dropout de 0,05. El conjunto de datos son 10.000 registros supervisados, longitud de secuencia 1312, batch efectivo 8, 2 épocas, tasa de aprendizaje 0,0001 y 626 pasos, con pérdida final de 0,8449 sobre cuatro NVIDIA A40 en 0,7 horas.

El entrenamiento es exclusivamente supervisado (SFT): no se ejecutó ninguna etapa de preferencias (RLHF/DPO), algo que el propio autor señala como causa directa de los fallos observados en herramientas con descripciones parecidas. La plantilla de chat se aplica con `enable_thinking=False` y el pipeline enmascara el prompt de forma explícita en lugar de confiar en la forma de los datos. El objetivo de entrenamiento es un único objeto JSON por turno, con el menú de herramientas ofrecidas en el system prompt. Las observaciones que el modelo vio durante el entrenamiento eran fixtures, no salidas reales de shell.

## Capacidades

- Emisión de una llamada a herramienta por turno en formato JSON estricto, con la estructura `{"action": "tool", "tool": "...", "args": {...}}`.
- Operaciones de fichero: `read_file`, `write_file`, `append_file`, `delete_file`, `list_files`, `make_directory`.
- Búsqueda: `search_files` con patrones sobre el sistema de ficheros simulado.
- Ejecución de comandos: `run_command`, dentro de la superficie de herramientas definida por el harness.
- Consultas sobre datos: `sql_incubator`.
- Cierre del bucle: herramienta `finish` para terminar la tarea.
- Integración en bucles de agente con realimentación de observaciones (acción → resultado → nueva acción).
- Capacidad multilingüe: limitada al inglés, tanto en instrucciones como en la model card.
- No se documenta soporte de visión, audio, modo thinking ni razonamiento multi-paso fuera de la secuencia de llamadas.

## Casos de uso

- Automatización de operaciones sobre ficheros en un entorno controlado: el modelo decide entre leer, listar, escribir, anexar o borrar según el system prompt, y el harness valida la ruta antes de ejecutar. Es adecuado porque la salida es un JSON parseable con argumentos tipados, no texto libre.
- Banco de pruebas de harnesses de tool calling: sirve para medir si un runtime concreto (parser, validación de esquemas, gestión de observaciones) funciona correctamente antes de conectar un modelo mayor, ya que su tasa de acierto conocida (48,5 % en holdout) actúa como línea base reproducible.
- Ejecución de comandos en sandbox: con `run_command` y validación posterior del comando por parte del runtime, puede probarse el ciclo completo de un agente de shell sin riesgo, dado que el modelo nunca ejecuta nada por sí mismo.
- Consultas SQL sobre un incubador de datos: `sql_incubator` permite prototipar el flujo de generación de consultas y realimentación de resultados en un entorno simulado, útil para diseñar la capa de validación antes de exponer una base de datos real.
- Investigación sobre post-entrenamiento con QLoRA: el repositorio incluye `training-log.json`, hiperparámetros completos y desglose de errores, lo que lo convierte en un caso de estudio reproducible de SFT sobre un modelo base pequeño (≈4,63 B) con hardware modesto (4× A40, 0,7 h).
- Generación de trazas sintéticas de agente: al producir acciones estructuradas contra diez herramientas, puede emplearse para poblar datasets de evaluación de parsers de function calling, siempre con revisión humana del 51,5 % de casos que fallan.
- Sustitución de respuestas de chat por acciones en asistentes internos de gestión documental: si el asistente solo necesita leer, listar y buscar ficheros, el modelo cubre ese subconjunto con la ventaja de un formato de salida verificable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor publica una evaluación propia de holdout sobre 200 filas no vistas, con decodificación greedy, una sola tarjeta y tres comprobaciones: un único objeto JSON, la misma herramienta y todos los argumentos gold presentes e iguales, tras normalizar espacios en blanco, estilo de comillas y un prefijo `./` inicial.

| Métrica | Valor |
|---|---|
| Filas de holdout | 200 |
| Llamadas correctas | 97 (48,5 %) |
| Aciertos logrados por normalización | 1 |
| Comparación | Normalizada |

| Herramienta | Aciertos | Filas | Exactitud |
|---|---|---|---|
| write_file | 1 | 16 | 0,062 |
| append_file | 1 | 10 | 0,100 |
| run_command | 10 | 34 | 0,294 |
| sql_incubator | 5 | 14 | 0,357 |
| search_files | 7 | 19 | 0,368 |
| finish | 12 | 22 | 0,545 |
| make_directory | 4 | 6 | 0,667 |
| read_file | 32 | 46 | 0,696 |
| delete_file | 5 | 7 | 0,714 |
| list_files | 20 | 26 | 0,769 |

Desglose de fallos: `content differs` 16, `command differs` 14, `path differs` 9, `pattern differs` 8, `args differs` 6, `answer overlap` 6 y 25 motivos menos frecuentes. La medición se hizo sobre `merged-bf16` con el adaptador aplicado, no sobre los ficheros GGUF, por lo que el autor recomienda reevaluar la cuantización que se vaya a desplegar.

## Requisitos de hardware

- VRAM estimada para inferencia (tamaño del fichero de pesos más overhead de contexto, no medida): f16 ≈ 11-12 GB; Q8_0 ≈ 6-7 GB; Q6_K ≈ 5-6 GB; Q5_K_M ≈ 4,5-5,5 GB; Q4_K_M ≈ 4,5-5 GB; Q3_K_M ≈ 4-4,5 GB; Q2_K ≈ 4 GB. El overhead real depende del número de capas y cabezas, que no se documentan.
- GPU recomendadas: el entrenamiento se realizó en 4× NVIDIA A40. Para inferencia, una única A40, A100 o H100 cubre cualquier cuantización con holgura; para bf16 completo basta una GPU de 16 GB o más.
- Cabe en GPU de consumo: sí. RTX 4090 (24 GB) ejecuta f16 y todas las cuantizaciones; RTX 4060 Ti de 16 GB, RTX 4080 y RTX 3080 Ti de 12 GB cubren Q8_0 y superiores; tarjetas de 8 GB (RTX 3060 Ti, RTX 4060) solo admiten Q4_K_M o inferiores con contexto reducido.
- Opciones de despliegue: llama.cpp mediante `llama-server` es el método documentado (`llama-server -m gguf/gemma-agent-Q4_K_M.gguf --port 8080 --ctx-size 4096`); también puede cargarse con Transformers usando `merged-bf16` y aplicar el adaptador LoRA. Cualquier runtime compatible con GGUF y llama.cpp en general debería poder cargar los ficheros. Soporte en vLLM o TGI: no confirmado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de comparativas independientes publicadas para este modelo. La comparación se limita a su base y a sus versiones previas, todas del mismo autor y con datos parciales.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-E2B-it-agent-posttrain-v1.4 | 4,63 B | No disponible | 48,5 % en holdout propio (200 filas) | Gemma Terms of Use (según model card) | HuggingFace, 0 descargas, 0 likes |
| google/gemma-4-E2B-it (base) | No disponible | No disponible | No disponible | Gemma Terms of Use | Público en HuggingFace |
| XcaliburMoon/gemma-4-E2B-it-agent-posttrain-v1.3 | No disponible | No disponible | No disponible | Gemma Terms of Use | Público; sustituido por versiones posteriores |
| XcaliburMoon/gemma-4-E2B-it-agent-posttrain-v1.2 | ≈5 B según el listado de HF | No disponible | No disponible | Gemma Terms of Use | Público en HuggingFace |

Como alternativa de la misma categoría (modelos pequeños instruct con soporte de function calling) no hay datos en la información proporcionada que permitan una comparación numérica honesta. Cualquier cifra añadida aquí sería inventada.

## Limitaciones y advertencias

- Superficie de herramientas cerrada: el modelo solo conoce las diez herramientas del menú. Una herramienta no incluida en el system prompt no existe para él.
- Solo SFT, sin etapa de preferencias. El autor atribuye explícitamente los fallos a elecciones de herramienta y de valor equivocadas en herramientas con descripciones parecidas, precisamente el tipo de error que corrige una etapa de preferencias.
- Exactitud baja: 48,5 % en holdout. `write_file` (0,062) y `append_file` (0,100) fallan casi siempre; los contenidos de fichero divergen en 16 casos.
- Inglés únicamente, tareas cortas y una sola llamada por turno. No hay soporte multi-turno conversacional ni razonamiento multi-paso fuera del bucle acción-observación.
- Observaciones de entrenamiento ficticias: el modelo nunca vio una salida real de shell, por lo que puede afirmar con seguridad cosas falsas sobre lo que devolvió un comando.
- Riesgo de alucinación alto en el contenido de los argumentos, especialmente en campos de texto libre (`content`, `command`, `pattern`).
- Las cuantizaciones GGUF son con pérdida respecto a `merged-bf16` y la métrica publicada no se midió sobre ellas.
- Licencia: el derivado hereda los Gemma Terms of Use. Hay que revisarlos antes de redistribuir o desplegar comercialmente; los metadatos de HuggingFace no declaran licencia, lo que añade ambigüedad operativa.
- Repositorio sin etiquetas de versión: `main` es la única dirección y una subida posterior reemplaza los ficheros en lugar de añadirse al lado, lo que rompe la reproducibilidad de una descarga concreta.
- No es un modelo de chat: la model card advierte que no debe usarse donde una respuesta no parseada pudiera ejecutarse como acción.
- Señales de validación externa nulas: 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/XcaliburMoon/gemma-4-E2B-it-agent-posttrain-v1.4
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Listado de modelos cuantizados del base: https://huggingface.co/models?other=base_model%3Aquantized%3Agoogle%2Fgemma-4-E2B-it
- Versión previa v1.2: https://huggingface.co/XcaliburMoon/gemma-4-E2B-it-agent-posttrain-v1.2
- Vídeo de YouTube sobre el post-entrenamiento de Gemma 4 E2B: https://www.youtube.com/watch?v=Mxoq3BBPgLg
