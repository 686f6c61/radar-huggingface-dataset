# vectionlabs/Salience-27B-R5

## Resumen

Salience-27B-R5 es un modelo de lenguaje multimodal denso de 27.800 millones de parámetros desarrollado por Vection Labs, construido sobre la arquitectura Qwen3.8-27B. Está diseñado específicamente para trabajo de ingeniería de software práctico: escritura y depuración de código real, ediciones a escala de repositorio, agencia de terminal multi-paso y razonamiento cuantitativo, con visión nativa y una ventana de contexto de 1.048.576 tokens.

La quinta revisión (R5) introduce como cambio principal la "economía de razonamiento": el modelo decide automáticamente cuánto deliberar según la dificultad del problema, en lugar de razonar extensamente en cada turno. Esto reduce el coste en tokens para tareas sencillas sin sacrificar profundidad en problemas complejos. Todos los 27.800 millones de parámetros están activos en cada token, lo que maximiza la capacidad de procesamiento por paso, complementado con un stack de atención híbrido lineal+completo y una cabeza MTP para decodificación especulativa auto-generada.

El modelo se distribuye bajo licencia Apache-2.0, es nativo de la librería `transformers` y está orientado a un uso intensivo en entornos de desarrollo, terminales y flujos de trabajo agénticos. Su relevancia actual radica en combinar capacidades de razonamiento eficiente, visión multimodal y manejo de contexto extremadamente largo en un solo modelo de pesos abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8 denso (27B) + encoder de visión nativo |
| Parametros totales | 27.781.427.952 |
| Parametros activos | 27.781.427.952 (denso, todos activos) |
| Longitud de contexto | 1.048.576 tokens (YaRN + Dual Chunk Attention) |
| Tipos de cuantizacion | bfloat16 (precisión nativa); cuantizaciones adicionales no especificadas |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Salience-27B-R5 es un modelo denso basado en la arquitectura Qwen3.8-27B, lo que significa que los 27.800 millones de parámetros se activan en cada token procesado, sin routing ni selección de expertos. La atención es híbrida: combina atención lineal con atención completa, aplicando esta última en una de cada cuatro capas. Este diseño busca equilibrar la velocidad de procesamiento de contexto largo con la calidad de representación en capas críticas.

El modelo incorpora una cabeza MTP (Multi-Token Prediction) que permite decodificación especulativa auto-generada, acelerando la inferencia sin necesidad de un modelo draft externo. Para alcanzar la ventana de contexto de un millón de tokens, utiliza una combinación de extensión YaRN y Dual Chunk Attention. El entrenamiento parte del modelo base Qwen/Qwen3.8-27B y ha sido ajustado específicamente para tareas de ingeniería de software, agencia de terminal y razonamiento eficiente. No se especifican detalles sobre el volumen de datos de entrenamiento ni sobre el uso de RLHF o DPO en la información disponible.

## Capacidades

- Generación de código ejecutable y ediciones a escala de repositorio, con especial atención a la corrección sintáctica y semántica.
- Razonamiento estructurado e inspeccionable mediante cadenas de pensamiento nativas, expuestas como `reasoning_content` en los servidores de inferencia.
- Razonamiento económico por defecto: el modelo ajusta automáticamente la longitud de su deliberación según la dificultad de la tarea, con niveles configurables (`low`, `medium`, `xhigh`).
- Agencia de terminal multi-paso: planifica secuencias de comandos, verifica resultados intermedios y se recupera de fallos.
- Tool calling nativo mediante llamadas en formato XML (`<tool_call><function=...><parameter=...>`), compatible con los parsers de vLLM, SGLang y `llama-server --jinja`.
- Percepción multimodal de imágenes y vídeo como entradas de primera clase: diagramas, capturas de pantalla de UI, capturas de stack traces y fotografías de pizarras.
- Manejo de contexto largo de hasta 1.048.576 tokens, suficiente para procesar repositorios completos sin fragmentación.
- Comportamiento directo con reducción de rechazos: responde a la pregunta formulada sin rodeos.

## Casos de uso

- Desarrollo de software a escala de repositorio: el modelo puede recibir un repositorio completo dentro de su ventana de contexto de un millón de tokens y realizar ediciones coherentes en múltiples archivos, manteniendo el contexto de las dependencias entre módulos.
- Depuración sistemática de código: su capacidad de razonamiento estructurado permite analizar stack traces, identificar causas raíz y proponer correcciones verificables, especialmente útil en problemas intermitentes o dependientes de condiciones de concurrencia.
- Agente de terminal autónomo: puede planificar secuencias de comandos shell, ejecutar cada paso, inspeccionar la salida y adaptar el plan en consecuencia, lo que lo hace adecuado para automatizar tareas de operaciones y despliegue.
- Análisis de documentación técnica multimodal: al aceptar imágenes y vídeo como entrada, puede interpretar diagramas de arquitectura, capturas de pantalla de interfaces o fotografías de pizarras durante una sesión de trabajo, integrándolos en el razonamiento.
- Razonamiento cuantitativo y matemático: su nivel de razonamiento `xhigh` permite abordar problemas de matemáticas aplicadas, análisis de algoritmos y verificación de propiedades formales con deliberación prolongada.
- Asistente de ingeniería en tiempo real: con el nivel de razonamiento `low` o `medium`, puede responder consultas rápidas sobre APIs, flags de herramientas, refactorizaciones y formato de código sin incurrir en costes innecesarios de tokens de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card oficial no incluye ninguna métrica cuantitativa (MMLU, HumanEval, GSM8K, etc.) en su sección de model-index.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 56 GB solo para los pesos, más overhead de activaciones y KV cache. Con contexto de un millón de tokens, el KV cache puede superar los 30 GB adicionales dependiendo de la implementación.
- GPU recomendadas: para despliegue en producción con contexto completo se recomiendan GPUs de clase profesional como A100 80GB, H100 80GB o A6000 48GB (esta última solo para contextos reducidos). Para inferencia con cuantización de 8 bits o 4 bits, una RTX 4090 24GB podría ser suficiente para contextos moderados.
- No cabe en GPUs de consumo de 8-16 GB incluso con cuantización agresiva, dado el tamaño del modelo.
- Opciones de despliegue: compatible con vLLM y SGLang mediante los tool parsers nativos de la familia, y con `llama-server --jinja` para el formato de tool calling XML. También es compatible con la librería `transformers` mediante `AutoModelForImageTextToText`.
- La decodificación especulativa mediante la cabeza MTP integrada reduce la latencia respecto a un modelo denso equivalente sin esta característica, aunque no se proporcionan cifras concretas de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Razonamiento |
|---|---|---|---|---|---|
| Salience-27B-R5 | 27,8B denso | 1.048.576 | Sí (imagen y vídeo) | Apache-2.0 | Nativo, con esfuerzo ajustable |
| Qwen3-32B | 32B denso | 262.144 | No | Apache-2.0 | Nativo (thinking mode) |
| Llama-3.3-70B | 70B denso | 131.072 | No | Llama 3.3 | No nativo |

La comparativa se basa en características públicas de los modelos. Salience-27B-R5 se distingue por su ventana de contexto superior, su capacidad multimodal y su mecanismo de razonamiento económico ajustable. Su tamaño denso de 27,8B lo sitúa en una categoría intermedia entre los modelos de 30B y los de 70B, ofreciendo un equilibrio entre capacidad y requisitos de hardware. No se dispone de datos de rendimiento comparativos para evaluar diferencias cualitativas.

## Limitaciones y advertencias

- El modelo solo soporta inglés como idioma de trabajo; no se garantiza un rendimiento adecuado en otros idiomas.
- La reducción de comportamiento de rechazo implica que el modelo puede responder a consultas que otros modelos rechazarían; es necesario implementar salvaguardas adicionales en entornos de producción sensibles.
- No se han publicado benchmarks independientes que verifiquen las capacidades declaradas; las afirmaciones sobre rendimiento provienen exclusivamente del autor.
- El razonamiento económico por defecto puede producir respuestas demasiado breves para problemas que el modelo subestima; se recomienda usar `xhigh` para tareas críticas.
- El tamaño del modelo (27,8B) y la ventana de contexto de un millón de tokens requieren infraestructura de GPU profesional; no es adecuado para despliegue en hardware de consumo limitado.
- Al ser una revisión R5, el autor advierte que puede haber errores pendientes de corrección en la versión estable; se recomienda reportar incidencias.
- No se especifican los datos de entrenamiento ni los procedimientos de alineación utilizados, lo que dificulta evaluar sesgos potenciales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vectionlabs/Salience-27B-R5
- Revisión anterior R4: https://huggingface.co/vectionlabs/Salience-27B-R4
- API de inferencia de FriendliAI para la revisión R4: https://friendli.ai/models/vectionlabs/Salience-27B-R4
- Página de la organización vectionlabs en modelindex.dev: https://modelindex.dev/orgs/vectionlabs
- Modelos de la familia Salience:
  - Pro (35B-A3B MoE): https://huggingface.co/vectionlabs/Salience-1.5-Pro
  - Flash (30B-A3B MoE): https://huggingface.co/vectionlabs/Salience-1.5-Flash
  - Nano (9B dense): https://huggingface.co/vectionlabs/Salience-1.5-Nano
