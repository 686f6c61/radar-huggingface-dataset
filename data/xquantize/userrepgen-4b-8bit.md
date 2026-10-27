# xquantize/userrepgen-4b-8bit

## Resumen

`xquantize/userrepgen-4b-8bit` es una conversión a 8 bits en formato MLX de `microsoft/UserRepGen-4B`, publicada por el usuario xquantize para ejecución en Apple Silicon. No es un modelo conversacional al uso: recibe una conversación multi-turno entre usuario y asistente y devuelve un JSON con dos campos, `task` (qué quiere conseguir el usuario) y `user_behavior` (cómo se comporta), es decir, una representación estructurada del usuario. El modelo original lo desarrolla Microsoft y se distribuye con licencia MIT.

El modelo cuenta con 4.205.751.296 parámetros totales (aproximadamente 4,2 B) y una ventana máxima de entrada de 8.192 tokens, según la model card. La conversión a 8 bits ocupa unos 4,5 GB en el repositorio y está pensada para Macs con 16 GB o más de memoria unificada. Se ha eliminado la parte de visión: esta variante es únicamente de texto.

Su relevancia ahora es práctica: permite obtener perfiles de usuario estructurados y consumibles por otros sistemas (personalización, analítica de conversaciones, memoria de agentes) sin depender de un LLM generalista y sin salir de un portátil Apple. La evaluación publicada es una comprobación de sanidad sobre 5 conversaciones, no un benchmark completo, y el autor lo indica explícitamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only; el tag del repositorio indica `qwen3_5`, sin confirmación en la información disponible |
| Parámetros totales | 4.205.751.296 (≈4,2 B) |
| Parámetros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | 8.192 tokens de entrada como máximo (según la model card del original) |
| Tipos de cuantización | 8 bits en MLX (generada con `mlx_lm.convert -q --q-bits 8`, mlx-lm 0.32.0); existe una variante 4 bits plana probada pero no publicada |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors en formato MLX (`library_name: mlx`) |
| Tamaño del repositorio | 4,5 GB |
| Librería de inferencia | mlx-lm |
| Modalidad | solo texto (los pesos de visión no están incluidos) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna ni el proceso de entrenamiento del modelo original. El tag `qwen3_5` del repositorio apunta a una familia de arquitectura tipo Qwen 3.5 con decoder transformer, pero la model card de esta conversión no lo confirma ni aporta número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO. Lo que sí se documenta es la función del modelo: dado un historial de conversación, produce una representación del usuario en JSON, lo que implica un entrenamiento orientado a extracción estructurada más que a diálogo abierto.

La innovación destacable de este repositorio no está en el modelo, sino en la conversión: se aplica cuantización de 8 bits con mlx-lm 0.32.0 y se conserva la calidad del bf16 original en la prueba realizada. El autor señala que la cuantización a 4 bits plana degradaba la validez del JSON (3 de 5 conversaciones válidas), por lo que se descartó su publicación a la espera de variantes mejores. El uso requiere aplicar la plantilla `representation_prompt.txt` incluida en el repositorio y desactivar el modo thinking (`enable_thinking=False`); con decodificación greedy se replica el script de referencia de Microsoft.

## Capacidades

- Generación de una representación estructurada del usuario en JSON, con los campos `task` y `user_behavior`.
- Comprensión de conversaciones multi-turno usuario-asistente (la prueba publicada usa conversaciones de 8 turnos).
- Extracción de intención: identifica la tarea subyacente del usuario a partir del hilo completo, no solo del último mensaje.
- Caracterización de comportamiento: describe el estilo, las preferencias o la actitud del usuario en `user_behavior`.
- Salida consumible por programas: al ser JSON, se puede parsear e inyectar directamente en otros sistemas.
- Especificidad de tarea: no es un chatbot ni un modelo de propósito general; solo funciona correctamente con la plantilla de prompt incluida.
- Compatibilidad con el ecosistema mlx-lm (`load` y `generate`), incluyendo `apply_chat_template` y desactivación de thinking.
- Capacidades multimodales: no disponibles en esta conversión (pesos de visión excluidos).
- Soporte de tool calling, agentes o modos de razonamiento extendido: no documentado en la información disponible.

## Casos de uso

- Personalización de asistentes conversacionales: antes de responder, el sistema pasa el historial por UserRepGen-4B, obtiene el JSON con `task` y `user_behavior` y lo inyecta como contexto en el prompt del LLM principal, de modo que la respuesta se adapte al objetivo real del usuario y a su estilo.
- Memoria de usuario en agentes multi-paso: el JSON generado se almacena como ficha persistente del usuario entre sesiones; en la siguiente interacción el agente recupera esa ficha en lugar de reinyectar todo el historial, lo que reduce tokens y latencia.
- Analítica de conversaciones de soporte: procesar en lote los transcripts de un help desk para clasificar las tareas solicitadas y los patrones de comportamiento, y agregar métricas por tipo de incidencia sin revisión manual.
- Enrutado y triaje: usar `task` como señal para derivar la conversación al departamento o al flujo automatizado correcto (por ejemplo, facturación frente a soporte técnico), con un clasificador ligero aguas abajo.
- Adaptación de tono en productos de escritura: en un editor o asistente de redacción, detectar si el usuario es conciso, formal o exploratorio y ajustar las sugerencias y la longitud de las respuestas en consecuencia.
- Investigación sobre simulación de usuarios: generar perfiles realistas a partir de conversaciones reales para alimentar simulaciones de usuario en la evaluación de asistentes, conservando la tarea y el comportamiento observados.
- Tutoría adaptativa: identificar en cada sesión qué intenta resolver el estudiante y cómo se comporta (dudas repetidas, cambios de estrategia) para ajustar el siguiente paso pedagógico.
- Enriquecimiento de datasets: anotar corpus conversacionales con etiquetas estructuradas de tarea y comportamiento de forma local, en un portátil Apple, sin enviar datos a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor incluye únicamente una comprobación de sanidad sobre 5 conversaciones variadas (ayuda con Excel, depuración de Python, planificación de viaje, edición de textos y una consulta de salud), con decodificación greedy sobre pesos ejecutados en MLX:

| Versión | JSON válido | Salidas con frases repetidas |
|---|---|---|
| bf16 (original) | 5/5 | 0/5 |
| 8 bits (este repositorio) | 5/5 | 1/5 |
| 4 bits plana | 3/5 | 1/5 |

En el caso con repetición (el ejemplo de Excel) el modelo repitió una frase cerca del final de `user_behavior`, pero la salida siguió siendo JSON válido. El propio autor califica la prueba de sanity check y no de benchmark.

## Requisitos de hardware

- Huella de memoria: pesos de 8 bits de aproximadamente 4,2 GB (descarga de 4,5 GB); con overhead de ejecución, encaja con holgura en 16 GB de memoria unificada.
- Hardware objetivo: Apple Silicon exclusivamente, al usar el formato MLX; no se distribuyen pesos GGUF ni safetensors estándar para CUDA en este repositorio.
- Equipos probados: M3 Pro con 18 GB de memoria unificada.
- Latencia: aproximadamente 17 segundos para generar la representación completa de una conversación de 8 turnos en un M3 Pro (18 GB).
- Cabe en GPU de consumo: no en el sentido habitual (RTX 4090, etc.), porque el formato MLX no se ejecuta en CUDA; para esas GPU habría que reconvertir los pesos desde el modelo original.
- Despliegue: mlx-lm (versión de referencia 0.32.0); no aplica vLLM, TGI, llama.cpp u Ollama con estos pesos tal cual.
- Throughput: no disponible; solo se documenta la latencia del caso anterior.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microsoft/UserRepGen-4B | ≈4,2 B | 8.192 tokens | bf16 (safetensors) | MIT | Público en HuggingFace |
| xquantize/userrepgen-4b-8bit | ≈4,2 B | 8.192 tokens | MLX, 8 bits | MIT | Público en HuggingFace |
| Variante 4 bits plana (MLX) | ≈4,2 B | 8.192 tokens | MLX, 4 bits | MIT | No publicada por fallos de validación JSON |

No se han identificado en la información disponible otros modelos comparables especializados en representación de usuario; las alternativas habituales serían modelos generalistas usados con prompts de extracción, pero no hay datos que permitan compararlos aquí.

## Limitaciones y advertencias

- La evaluación publicada es una comprobación de 5 conversaciones con decodificación greedy; no hay benchmark representativo ni evaluación de robustez.
- En 1 de 5 casos la versión de 8 bits produjo repeticiones de frases dentro de `user_behavior`, aunque el JSON siguió siendo válido; conviene validar el esquema y detectar duplicados en producción.
- El modelo no es un chatbot: usarlo en diálogo abierto o sin la plantilla `representation_prompt.txt` produce resultados fuera de distribución.
- Es obligatorio desactivar el modo thinking; la plantilla y la configuración de generación forman parte del contrato de uso.
- Ventana de entrada limitada a 8.192 tokens: las conversaciones largas deben truncarse o resumirse antes de la inferencia, con pérdida potencial de información sobre la tarea del usuario.
- Solo texto: los pesos de visión del modelo original no están incluidos, por lo que cualquier caso de uso con imágenes requiere otra variante.
- Dependencia de plataforma: al ser pesos MLX, solo se ejecutan en Apple Silicon; no hay soporte directo para CUDA, vLLM o llama.cpp en este repositorio.
- Idiomas soportados no documentados: no hay evaluación multilingüe publicada, por lo que el rendimiento en castellano no está verificado.
- Sesgos: no documentados en la información disponible; al inferir atributos del usuario a partir de su comportamiento, existe riesgo de perfilado incorrecto o estereotipado, especialmente en dominios sensibles.
- Riesgo de alucinación en los campos generados: `task` y `user_behavior` son inferencias, no hechos; no deben tratarse como datos verificados del usuario.
- Licencia MIT: permite uso comercial y modificación, pero las limitaciones y avisos del modelo original deben revisarse en su model card.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay validación independiente por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/xquantize/userrepgen-4b-8bit
- Modelo original: https://huggingface.co/microsoft/UserRepGen-4B
- Plantilla de prompt incluida: https://huggingface.co/xquantize/userrepgen-4b-8bit/blob/main/representation_prompt.txt
- mlx-lm (herramienta de conversión e inferencia): https://github.com/ml-explore/mlx-lm
- Perfil del autor de la conversión: https://huggingface.co/xquantize
