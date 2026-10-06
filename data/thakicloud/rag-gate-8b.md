# ThakiCloud/RAG-Gate-8B

## Resumen

RAG-Gate-8B es un modelo de clasificación de suficiencia de evidencia diseñado para colocarse en el punto intermedio de una pipeline de generación aumentada por recuperación (RAG), justo después de la recuperación y antes de la generación. Desarrollado por ThakiCloud, es un fine-tune LoRA de Qwen/Qwen3-8B fusionado a pesos bf16 que lee una pregunta, los pasajes recuperados y un indicador de si queda recuperación disponible, y emite un único token de decisión: **Answer** (la evidencia contiene una cadena de soporte completa), **Retrieve** (no la contiene y se puede buscar de nuevo) o **Stop** (no la contiene y no hay más recuperación posible).

El modelo resuelve un problema recurrente en sistemas RAG: decidir con fiabilidad si la evidencia recuperada basta para responder, en lugar de generar respuestas sin respaldo o rechazar preguntas que sí tenían soporte. En un conjunto de test ciego de 14.818 ítems sobre 2.256 preguntas multi-salto, la precisión de acción pasa de .529 en el modelo base en zero-shot a .949 en el fine-tune, corrigiendo sobre todo el exceso de rechazo del base (.606 de sobre-rechazo frente a .057).

Se distribuye con licencia Apache-2.0, en inglés, con 8.190.735.360 parámetros (8,19 mil millones) y 16,4 GB de repositorio. Es relevante porque ataca una pieza concreta y medible de las pipelines RAG con un modelo pequeño y desplegable, en lugar de exigir un reentrenamiento completo o un modelo mayor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-8B); adaptación LoRA fusionada a bf16 |
| Parametros totales | 8.190.735.360 (8,19 mil millones) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (corresponde al del modelo base Qwen/Qwen3-8B) |
| Tipos de cuantizacion | no disponible; pesos publicados en bf16 safetensors, sin variantes GGUF/AWQ/GPTQ documentadas |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

RAG-Gate-8B es un fine-tune mediante LoRA sobre Qwen/Qwen3-8B, un transformer decoder-only denso de 8,19 mil millones de parámetros. El adaptador LoRA se ha fusionado en los pesos base, de modo que el repositorio contiene un checkpoint completo en bf16 listo para cargar con `transformers`, sin necesidad de cargar el adaptador por separado. El uso previsto es generativo pero restringido: la decisión es el primer token generado tras el prefijo `Final action:`, y el autor recomienda leer directamente las probabilidades de los tres tokens de etiqueta (` Answer`, ` Retrieve`, ` Stop`) en lugar de muestrear, aplicando softmax sobre sus logits.

El entrenamiento parte de dos conjuntos de datos: ThakiCloud/ChainCheck (construido de forma independiente y usado como test fuera de distribución) y dgslibisey/MuSiQue (preguntas multi-salto). El diseño del objetivo se centra en la suficiencia de la cadena de soporte más que en las ediciones superficiales del texto: el estado `FULL_DECOY` (cadena completa más un pasaje distractor editado) exige la acción **Answer**, de modo que un modelo que hubiese aprendido "texto editado implica rechazo" fallaría. El autor no documenta en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon fases de RLHF o DPO.

## Capacidades

- Clasificación de suficiencia de evidencia en tres acciones discretas: **Answer**, **Retrieve** y **Stop**.
- Lectura conjunta de pregunta, pasajes recuperados con título y texto, y un indicador booleano de disponibilidad de nueva recuperación.
- Razonamiento multi-salto: evalúa si una cadena de soporte está completa aunque requiera encadenar hechos (estados `FULL`, `FULL_DECOY`, `BROKEN_LINK`, `MISSING_HOP`, `MISSING_ALL`).
- Abstención controlada: distingue entre "no puedo responder y aún puedo buscar" (Retrieve) y "no puedo responder y no puedo buscar" (Stop).
- Detección de distractores editados: mantiene la respuesta correcta cuando la evidencia es suficiente pero contiene un pasaje manipulado.
- Salida probabilística sobre las tres etiquetas, lo que permite fijar umbrales sobre `p["Answer"]` para ajustar el equilibrio entre respuestas sin soporte y rechazos.
- Uso de plantilla de chat con `enable_thinking=False`, es decir, sin modo de razonamiento extendido en la inferencia recomendada.
- No se documentan en la información disponible capacidades de tool calling, function calling, visión, audio ni agentes autónomos.

## Casos de uso

- Control de flujo en pipelines RAG multi-turno: insertar el modelo entre el recuperador y el generador para decidir si se responde, se lanza otra ronda de recuperación o se devuelve un mensaje de abstención, evitando que el generador invente respuestas sobre evidencia insuficiente.
- Sistemas de pregunta-respuesta sobre corpus documentales: en dominios con documentación incompleta, el modelo permite devolver "no puedo responder con los documentos disponibles" en lugar de una respuesta alucinada, usando la acción **Stop**.
- Bucle iterativo de recuperación (iterative retrieval): cuando la acción es **Retrieve**, el orquestador puede reformular la consulta o ampliar el número de pasajes y volver a invocar la puerta antes de generar.
- Agentes de investigación multi-salto: para preguntas que requieren encadenar varios hechos (por ejemplo, entidades puente), el modelo verifica si la cadena está completa antes de permitir la síntesis final, cubriendo los estados `BROKEN_LINK` y `MISSING_HOP`.
- Moderación de fiabilidad en asistentes empresariales: actuar como guardarraíl que filtra respuestas no respaldadas antes de mostrarlas al usuario, con umbral sobre `p["Answer"]` ajustable según la tolerancia al riesgo.
- Evaluación y monitorización de recuperadores: usar la tasa de acciones **Retrieve**/**Stop** como señal objetiva de la calidad del índice o del retriever, ya que mide directamente si la evidencia recuperada sostiene la respuesta.
- Enrutado de coste en producción: enviar a **Answer** solo los casos con evidencia suficiente reduce llamadas a modelos generadores mayores y permite reservar recursos para los casos que realmente requieren nueva recuperación.

## Benchmarks y rendimiento

Test ciego de 14.818 ítems sobre 2.256 preguntas base; intervalos de confianza del 95% por bootstrap sobre preguntas base (10.000 remuestreos).

| Metrica | Base zero-shot | RAG-Gate-8B |
|---|---|---|
| Precision de accion | .529 [.521, .537] | .949 [.944, .955] |
| Tasa de respuesta sin soporte = P(Answer \| evidencia insuficiente) | .103 [.095, .112] | .047 [.041, .054] |
| Tasa de sobre-rechazo = P(no Answer \| evidencia suficiente) | .606 [.588, .625] | .057 [.048, .067] |

Precisión por estado de la evidencia:

| Estado | Significado | Base zero-shot | RAG-Gate-8B |
|---|---|---|---|
| `FULL` | cadena de soporte completa | .394 | .943 |
| `FULL_DECOY` | cadena completa mas un pasaje distractor editado | .469 | .962 |
| `BROKEN_LINK` | hecho puente contradicho | .543 | .892 |
| `MISSING_HOP` | falta un salto | .631 | .930 |
| `MISSING_ALL` | ningun pasaje de soporte | .611 | .985 |

No se han publicado en la información disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 16-18 GB solo para los pesos (8,19 mil millones de parámetros a 2 bytes), más overhead de activaciones y caché KV; se recomienda reservar 20-24 GB.
- VRAM estimada con cuantización a 8 bits: aproximadamente 9-10 GB; a 4 bits, en torno a 5-7 GB. Estas cifras son estimaciones aritméticas a partir del número de parámetros, ya que el autor no publica variantes cuantizadas.
- GPU profesionales recomendadas: A100 40/80 GB, H100, L40S; una A100 40 GB permite cargar el modelo en bf16 con holgura.
- GPU de consumo: cabe en bf16 en tarjetas de 24 GB (RTX 3090, RTX 4090) con margen ajustado; en cuantización de 8 o 4 bits es viable en GPUs de 8-16 GB.
- Opciones de despliegue: `transformers` con `device_map="auto"` (ruta documentada por el autor) y text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`). No se documentan recetas para vLLM, llama.cpp u Ollama, aunque al ser un modelo compatible con transformers son integrables en servidores de inferencia habituales.
- Latencia y throughput: no disponibles. La inferencia es de un único paso de decodificación sobre los logits del primer token tras el prefijo, por lo que el coste dominante es el prefill de la pregunta y los pasajes.

## Comparativa con modelos similares

La información disponible no incluye resultados de benchmarks de terceros (por ejemplo, Self-RAG u otros modelos de control de recuperación), por lo que la comparación numérica con alternativas no está disponible. Comparación estructural con el modelo base y con la categoría:

| Modelo | Parametros | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|
| RAG-Gate-8B | 8,19 mil millones | Puerta de suficiencia de evidencia (Answer/Retrieve/Stop) | apache-2.0 | HuggingFace (ThakiCloud) |
| Qwen3-8B (base) | 8,19 mil millones | Generacion de texto general; sin decision de suficiencia entrenada | apache-2.0 | HuggingFace (Qwen) |
| Modelos de auto-RAG / control de recuperacion de la misma categoria | no disponible | Decision de recuperar o abstenerse | no disponible | no disponible |

La referencia más directa es el propio modelo base: con el mismo prompt, Qwen3-8B zero-shot obtiene .529 de precisión de acción frente a .949 del fine-tune, con un sobre-rechazo de .606 que el fine-tune reduce a .057.

## Limitaciones y advertencias

- El modelo está entrenado y evaluado únicamente en inglés (`language: [en]`); no hay evidencia de rendimiento multilingüe.
- Sesgos conocidos: no se documentan análisis de sesgo en la información disponible.
- Riesgo de alucinación: la tarea es de clasificación, no de generación libre, pero el modelo puede clasificar erróneamente el estado de la evidencia. El autor documenta al menos un error de ejemplo: un estado `FULL` con recuperación no disponible que el modelo clasificó como **Stop** en lugar de **Answer**. La tasa de respuesta sin soporte es .047, es decir, responde sin evidencia suficiente en aproximadamente 1 de cada 21 casos insuficientes.
- El rendimiento depende de la calidad del prompt: incluye una política y una descripción de acciones concretas; cambiar el formato del contexto o el prefijo `Final action:` puede alterar las probabilidades de los tokens de etiqueta.
- La decisión se lee como el primer token tras un prefijo fijo, por lo que la integración exige acceso a los logits y no un simple `generate` con muestreo.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificación y redistribución, con la obligación habitual de conservar el aviso de licencia y las atribuciones correspondientes.
- No se documentan variantes cuantizadas oficiales, por lo que cualquier cuantización a 8 o 4 bits sería responsabilidad del usuario y podría degradar la precisión de las tres etiquetas.
- La model card proporcionada aparece truncada al final (sección ChainCheck sobre Σ = CE − |EE|), por lo que parte de la evaluación fuera de distribución no se ha podido recoger íntegramente.
- Al tratarse de un repositorio con 0 descargas y 0 likes en el momento de la consulta, no existe aún validación independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ThakiCloud/RAG-Gate-8B
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Dataset ChainCheck: https://huggingface.co/datasets/ThakiCloud/ChainCheck
- Dataset MuSiQue: https://huggingface.co/datasets/dgslibisey/MuSiQue
- Papers, blogs, repositorios o demos adicionales: no disponibles en la información proporcionada.
