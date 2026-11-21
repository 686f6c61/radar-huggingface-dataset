# theatechcorporation/amaara-code-4b-v8-GGUF

## Resumen
Amaara Code 4B v8 es un modelo de lenguaje de 4.326 millones de parámetros (aproximadamente 4,3B) especializado en tareas de agente de programación, desarrollado por The A Tech Corporation (theatechcorporation) y afinado a partir del modelo base Qwen/Qwen3.5-4B-Base. El modelo está diseñado para resolver flujos de trabajo de codificación autónoma: edición de código, ejecución de tests y autocorrección sobre trazas verificadas. Esta versión concreta del repositorio contiene únicamente los pesos cuantizados en formato GGUF Q8_0 (4,61 GB), pensados para su ejecución en llama.cpp.

La propuesta diferencial del autor es que toda la línea Amaara Code comparte un único corpus canónico de conversaciones, de modo que los resultados entre distintos tamaños son comparables al atribuirse las diferencias al modelo y no a los datos. El corpus se filtra por la forma de la trayectoria (se conservan trazas verificadas de edición→test→éxito y de autocorrección, y se descartan las de edición y parada sin verificación), con ventaneo de las trazas largas alrededor de la cola de edición-verificación.

El modelo es relevante ahora por su enfoque en agentes de código verificables y por su licencia dual (A-TECH Model Licence más Apache-2.0 upstream). No obstante, el repositorio presenta cero descargas y cero likes, y la model card no publica cifras de rendimiento medibles en el propio repositorio, lo que limita la evaluación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B-Base); detalles internos no disponibles |
| Parametros totales | 4.326.350.848 (aproximadamente 4,3B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q8_0 (única incluida en el repo); otras no disponibles |
| Idiomas soportados | No disponible |
| Licencia | a-tech-model-license-plus-upstream (A-TECH Model Licence en adición a Apache-2.0 upstream) |
| Formato de pesos | GGUF (`acm-code-4b-v8-Q8_0.gguf`, 4,61 GB) |

## Arquitectura y entrenamiento
El modelo es un ajuste fino (fine-tuning) sobre Qwen/Qwen3.5-4B-Base, por lo que hereda la arquitectura del transformer del modelo base; la model card no detalla capas, dimensiones de atención ni innovaciones arquitectónicas propias. La plantilla de chat utilizada es Qwen ChatML, lo que condiciona el formato de las conversaciones de entrenamiento y de inferencia.

El entrenamiento se realizó sobre un único corpus canónico de conversaciones compartido por toda la línea Amaara Code. La selección de datos se hace por la forma de la trayectoria: se conservan trazas verificadas de edición→test→éxito y de autocorrección, y se descartan las de edición y parada sin verificación; las trazas largas se ventanean alrededor de la cola de edición-verificación en lugar de descartarse. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades
- Generación de texto y razonamiento orientado a tareas de programación.
- Agente de codificación: edición de código, ejecución de tests y autocorrección sobre trazas verificadas.
- Soporte de function calling / tool calling (etiqueta `function-calling` en el repositorio).
- Razonamiento multi-paso para agentes (etiqueta `coding-agent`).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso
- Agente de corrección de bugs en CI: el modelo puede recibir una traza de fallo de tests, proponer una edición y verificar el resultado, encajando en pipelines que ejecutan tests automáticamente tras cada parche.
- Automatización de tareas de refactorización con verificación: al haberse entrenado con trazas de edición→test→éxito, es adecuado para flujos donde cada cambio debe validarse contra una suite de pruebas.
- Asistente de código en CLI: el repositorio del autor incluye A-Coder-CLI, por lo que su uso natural es como motor de un agente de línea de comandos que edita archivos y ejecuta comandos.
- Integración en herramientas de desarrollo con tool calling: puede invocar funciones externas (ejecutar tests, leer archivos, consultar APIs) dentro de un bucle de agente.
- Evaluación comparativa de tamaños: al compartir corpus canónico con el resto de la línea Amaara Code, sirve para comparar el comportamiento entre distintos tamaños de modelo con datos idénticos.
- Despliegue local en entornos con recursos limitados: al ser un modelo de aproximadamente 4,3B en GGUF Q8_0 (4,61 GB), puede ejecutarse en llama.cpp en máquinas de gama consumer.

## Benchmarks y rendimiento
La model card indica que el modelo se evaluó con A-Coder-CLI contra una suite derivada de SWE-bench de 20 tareas, con 3 ejecuciones por tarea y puntuación mediante bootstrap agrupado sobre tareas, y remite al "Amaara training logbook" para los resultados medidos. No se incluyen cifras concretas en la información disponible.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: el archivo GGUF Q8_0 ocupa 4,61 GB; se requiere al menos esa cantidad de memoria más overhead de contexto (estimación no publicada por el autor).
- GPU recomendadas: no disponible en la información proporcionada.
- Cabe en GPU consumer: previsiblemente sí en GPUs con 8 GB o más de VRAM, dado el tamaño del archivo Q8_0 (estimación basada en el tamaño del archivo, no confirmada por el autor).
- Opciones de despliegue: llama.cpp (indicado explícitamente en la model card); otras opciones (vLLM, Ollama, TGI) no disponibles.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares
No se dispone de datos de rendimiento publicados para este modelo ni de comparaciones oficiales con alternativas. La comparación se limita a datos estructurales conocidos.

| Modelo | Parámetros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| Amaara Code 4B v8 | 4,3B | no disponible | A-TECH + Apache-2.0 | GGUF Q8_0 | no publicado en el repo |
| Qwen/Qwen3.5-4B-Base | 4B (aprox.) | no disponible | según modelo base | safetensors (base) | no disponible |
| Alternativas de código de ~4B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- No se han publicado cifras de benchmarks en el repositorio; la evaluación se remite a un logbook externo no incluido en la información disponible.
- El repositorio presenta cero descargas y cero likes, lo que indica ausencia de validación por parte de la comunidad.
- El modelo está especializado en agentes de código; su comportamiento en tareas generales de lenguaje no está documentado.
- Idiomas soportados no disponibles; no se garantiza un rendimiento adecuado en castellano.
- Longitud de contexto no disponible, lo que impide planificar su uso en conversaciones o repositorios largos.
- Riesgo de alucinación inherente a los modelos de lenguaje; en tareas de código puede generar parches incorrectos que deben validarse con tests.
- Licencia dual: la A-TECH Model Licence se aplica en adición a la Apache-2.0 upstream; la model card afirma que el umbral de ingresos no restringe los pesos, pero conviene revisar el texto completo de la licencia antes de uso comercial.
- Solo se distribuyen pesos GGUF Q8_0; no hay versiones en otros formatos o cuantizaciones en este repositorio.
- Sesgos conocidos: no disponibles en la información proporcionada.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/theatechcorporation/amaara-code-4b-v8-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia A-TECH: https://github.com/hamishfromatech/a-tech-license/blob/main/A-TECH-MODEL-LICENSE.md
- A-Coder-CLI: https://github.com/hamishfromatech/a-coder-cli
- AI Owner's Club (Skool): https://www.skool.com/open-source-ai-builders-club/about
