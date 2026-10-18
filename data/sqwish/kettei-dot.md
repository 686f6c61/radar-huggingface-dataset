# Sqwish/Kettei-Dot

## Resumen

Kettei Dot es un modelo de decisión (decision model) de 1.078.285.824 parámetros desarrollado por el usuario Sqwish, afinado a partir del modelo base IFM/K2-Horizon-0.9B. No es un modelo generativo de propósito general: su función es puntuar un conjunto de alternativas (opciones) frente a una pregunta y un contexto dados, y devolver la opción seleccionada junto con puntuaciones normalizadas para todas las alternativas. La arquitectura declarada es `K2HorizonForCausalLM`, implementada con código personalizado (`custom_code`), por lo que requiere `trust_remote_code=True` para cargarse.

El modelo se distribuye con una interfaz de referencia propia, el paquete `kettei` (wheel `kettei-0.1.0rc5`), que incluye el renderizador de decisiones: según el autor, una plantilla de chat genérica no es un sustituto válido. La salida incluye la opción elegida, su índice, las puntuaciones normalizadas, los logits y el recuento de tokens de entrada. El límite de la interfaz de referencia es de 4.096 tokens de entrada por defecto, rechazando entradas más largas.

Su relevancia es acotada y muy específica: cubre tareas de enrutamiento de soporte, comprobación de reglas explícitas y selección de herramientas, un nicho que normalmente se resuelve con clasificadores pequeños o con prompts sobre LLM mucho mayores. Es un modelo de publicación reciente (18 de octubre de 2026), sin descargas ni valoraciones en el momento de los datos, con licencia propia `kettei-community-model-license-1.0` y cobertura declarada únicamente en inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `K2HorizonForCausalLM` (transformers, `custom_code`) |
| Parámetros totales | 1.078.285.824 (~1,08 B) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 4.096 tokens de entrada por defecto en la interfaz de referencia; las entradas más largas se rechazan (no se documenta la ventana nativa del modelo base) |
| Tipos de cuantización | no disponible; la ruta de referencia probada usa BF16 (cuerpo) y FP32 (readout) |
| Idiomas soportados | inglés (`en`) |
| Licencia | `kettei-community-model-license-1.0` (etiquetada como `other` en HuggingFace) |
| Formato de pesos | `safetensors` (tamaño del repo 2,2 GB; pesos BF16 ~2,16 GB) |

Otros datos técnicos: modelo base `IFM/K2-Horizon-0.9B` (relación `finetune`), pipeline declarado `other`, etiquetas `kettei`, `decision-model`, `custom_code`, `region:us`. Configuración de referencia probada: NVIDIA RTX 6000 Ada, PyTorch 2.8.0+cu129, Transformers 5.17.0.

## Arquitectura y entrenamiento

La información disponible solo confirma la clase de arquitectura (`K2HorizonForCausalLM`) heredada del modelo base K2-Horizon-0.9B y el tipo de ajuste: un fine-tuning sobre dicho checkpoint orientado a una tarea de puntuación de alternativas. No se detallan en la documentación proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO.

La innovación destacable no está en el cuerpo del modelo sino en la interfaz: un renderizador de decisiones propio que transforma (contexto, pregunta, lista de opciones) en una entrada puntuada, y un readout que produce una distribución normalizada sobre las opciones junto con los logits crudos. El autor advierte explícitamente que las puntuaciones son preferencias normalizadas entre las opciones ofrecidas, no probabilidades calibradas de corrección o de éxito de una acción, y que cambiar el conjunto de opciones altera todas las puntuaciones. Para reproducibilidad recomienda fijar el commit inmutable del checkpoint o usar una copia local verificada, y revisar el código personalizado antes de habilitar `trust_remote_code=True`.

## Capacidades

- Puntuación y selección de alternativas: dada una pregunta, un contexto y una lista de opciones, devuelve la opción elegida, su índice y una puntuación normalizada para cada alternativa.
- Enrutamiento y clasificación cerrada: asignación de una entrada a una de varias categorías predefinidas (el ejemplo de la model card es el enrutamiento de una incidencia a las colas Billing, Technical support o Shipping).
- Selección de herramientas (tool selection): elección de una herramienta entre un conjunto enumerado, con contexto de la petición.
- Comprobación de reglas explícitas: verificación de cumplimiento contra opciones discretas definidas por la aplicación.
- Salida estructurada: diccionario con `choice`, `index`, `options`, `scores`, `logits` e `input_tokens`, apto para integrarse en pipelines automatizados.
- Capacidades multilingües: no disponibles; el modelo declara únicamente inglés.
- Generación de texto libre, razonamiento explícito, matemáticas, código, visión o audio: no soportadas por la interfaz documentada; el autor indica que la interfaz no genera explicaciones.
- Modo "thinking", tool calling generativo, agentes multi-paso: no disponibles como capacidades del modelo (la selección de herramienta es puntuación de opciones, no function calling generativo).

## Casos de uso

- Enrutamiento de tickets de soporte: se pasa el texto de la incidencia como contexto, la pregunta "¿qué cola debe recibir esta petición?" y la lista de colas como opciones; el modelo devuelve la cola y la distribución de puntuaciones, que puede usarse como umbral de confianza para derivar a revisión humana.
- Clasificación de intenciones en asistentes conversacionales: con un conjunto cerrado de intenciones y hasta 4.096 tokens de contexto, permite etiquetar turnos completos de conversación sin recortar el historial reciente.
- Selección de herramientas en agentes: dado el estado de la tarea y el catálogo de herramientas disponibles, el modelo puntúa cada herramienta; el orquestador ejecuta la de mayor puntuación y aplica reglas de abstención si la distribución es plana.
- Verificación de reglas y cumplimiento: en flujos de validación documental o de políticas internas, se enumeran los resultados posibles (cumple, no cumple, requiere revisión) y se usa la puntuación como señal de triaje previa a la revisión manual.
- Triaje de moderación de contenido: con opciones de política de moderación, la puntuación normalizada sirve como primera pasada para priorizar los casos que revisa un moderador; los datos de WildGuard macro F1 (84,96 % en la evaluación local del autor) son un indicio, no una garantía para dominios propios.
- Detección de cuándo escalar o invocar una herramienta externa: la tarea When2Call de la evaluación del autor (57,64 % de acierto en 3.423 casos) describe exactamente este patrón de decisión binaria en producción.
- Enrutamiento de consultas en pipelines RAG: elegir entre varios índices o fuentes de recuperación antes de lanzar la búsqueda, reduciendo el coste frente a consultar todas las fuentes.
- Anotación asistida y evaluación de candidatos: selección de la mejor respuesta entre varias generadas por otros modelos, útil en pipelines de datos y de evaluación de calidad.

## Benchmarks y rendimiento

Resultados publicados por el autor. Las cifras de "skill index" son puntos de índice bajo la fórmula histórica 0.2.1, no porcentajes de acierto ni puntuaciones oficiales de leaderboard.

Muestra fija DI-S12k (12.000 peticiones / 88.789 preguntas), 41 tareas elegibles:

| Modelo | Skill index (0.2.1) | NLL macro por tarea | Brier | ECE10 |
|---|---:|---:|---:|---:|
| Kettei Dot | 27,98 | 1,1464 | 0,5513 | 0,1281 |
| Kettei Core | 46,28 | 0,9476 | 0,4544 | 0,1023 |

Corpus público Jev231 (231 casos, recetas nativas de lectura única, BF16 + readout FP32, ejecución en M4 24 GiB):

| Modelo | Correctas / 231 | Exactitud | NLL (nats) | Brier | ECE10 |
|---|---:|---:|---:|---:|---:|
| Kettei Dot | 156 | 67,53 % | 0,7524 | 0,4118 | 0,0681 |
| Kettei Core | 198 | 85,71 % | 0,3711 | 0,2035 | 0,0496 |
| D3 Mini | 189 | 81,82 % | 0,4162 | 0,2402 | 0,0678 |

Componentes de la reconstrucción local de AA (5.588 peticiones / 7.227 preguntas por modelo, A100-SXM4-40GB; no equivale al benchmark AA oficial y el autor no reclama ningún índice AA):

| Componente y denominador | Kettei Dot | Kettei Core | D3 Mini |
|---|---:|---:|---:|
| Omni, exactitud (600) | 11,50 % | 24,17 % | 34,50 % |
| HLE, exactitud (513) | 18,13 % | 15,59 % | 11,89 % |
| When2Call, exactitud (3.423) | 57,64 % | 62,02 % | 77,30 % |
| WildGuard, F1 macro (2.396 campos / 801 peticiones) | 84,96 % | 91,74 % | 95,21 % |

El autor señala que la diferencia de exactitud Core–Mini en Jev231 es de +3,90 puntos con un intervalo pareado exploratorio del 95 % de −1,30 a +9,09, y que los intervalos de NLL y Brier también incluyen el cero. El registro de evaluación incluye un hallazgo de solapamiento con BANKING77 cuyo detalle no está disponible en la información proporcionada. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada. Los pesos en BF16 ocupan aproximadamente 2,16 GB; el autor advierte explícitamente que el tamaño de los pesos no es un requisito de memoria en tiempo de ejecución.
- GPU recomendadas: no hay recomendaciones oficiales. Configuraciones empleadas en las pruebas: NVIDIA RTX 6000 Ada (ruta CUDA/BF16 de referencia, PyTorch 2.8.0+cu129, Transformers 5.17.0), A100-SXM4-40GB (reconstrucción local de AA) y M4 con 24 GiB (Jev231).
- GPU consumer: por el tamaño de pesos (~2,16 GB en BF16) el modelo es candidato a caber en GPUs consumer con suficiente memoria para activaciones y caché KV a 4.096 tokens, pero no hay cifras oficiales de memoria total ni pruebas publicadas en tarjetas consumer.
- Opciones de despliegue: paquete de referencia `kettei` (`pip install './kettei-0.1.0rc5-py3-none-any.whl[torch]'`) con carga vía `Kettei.from_pretrained(..., trust_remote_code=True)`; también es posible cargar el checkpoint con Transformers usando código personalizado. Soporte para vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponibles; el autor declara explícitamente que las cifras publicadas no constituyen afirmaciones de latencia ni de calidad de tarea.
- Nota de despliegue: el renderizador de decisiones de la interfaz de referencia es obligatorio; una plantilla de chat genérica no es un sustituto válido.

## Comparativa con modelos similares

La información disponible solo permite comparar con los dos modelos evaluados en la misma documentación (Kettei Core y D3 Mini). No se dispone de sus recuentos de parámetros, licencias ni condiciones de disponibilidad.

| Aspecto | Kettei Dot | Kettei Core | D3 Mini |
|---|---|---|---|
| Parámetros | 1.078.285.824 | no disponible | no disponible |
| Contexto | 4.096 tokens de entrada (interfaz de referencia) | no disponible | no disponible |
| Jev231 (exactitud, 231 casos) | 67,53 % | 85,71 % | 81,82 % |
| DI-S12k skill index | 27,98 | 46,28 | no evaluado en esa tabla |
| Omni (600) | 11,50 % | 24,17 % | 34,50 % |
| HLE (513) | 18,13 % | 15,59 % | 11,89 % |
| When2Call (3.423) | 57,64 % | 62,02 % | 77,30 % |
| WildGuard F1 macro | 84,96 % | 91,74 % | 95,21 % |
| Licencia | `kettei-community-model-license-1.0` | no disponible | no disponible |
| Disponibilidad | HuggingFace (repo Sqwish/Kettei-Dot) | no disponible | no disponible |

Lectura: en la información publicada, Dot queda por debajo de Core y de D3 Mini en la mayoría de los componentes, con la excepción de HLE, donde obtiene la mejor cifra de los tres.

## Limitaciones y advertencias

- Las puntuaciones son preferencias normalizadas entre las opciones ofrecidas, no probabilidades calibradas de acierto ni de éxito de una acción; no deben interpretarse como confianza.
- Cambiar el conjunto o el orden de las opciones altera todas las puntuaciones; hay que evaluar el orden de candidatos y su redacción antes de usarlo en producción.
- La respuesta correcta puede no estar en la lista de opciones; el modelo no dispone de un mecanismo documentado de abstención. Cualquier regla de abstención o de revisión debe validarse sobre datos reservados.
- La interfaz no genera explicaciones: no hay justificación textual de la decisión, lo que complica la auditoría en dominios regulados.
- Cobertura lingüística limitada al inglés; no se ha establecido cobertura general del lenguaje ni calibración universal.
- El rendimiento en hardware no probado no está establecido; solo hay rutas verificadas en RTX 6000 Ada, A100-SXM4-40GB y M4 24 GiB.
- Requiere ejecución de código personalizado (`trust_remote_code=True`): riesgo de seguridad si no se revisa el código; se recomienda fijar un commit inmutable o una copia local verificada.
- Riesgo de alucinación y sesgos: no documentados específicamente en la información disponible; al ser un modelo de clasificación cerrada, el modo de fallo principal es la elección incorrecta con puntuaciones aparentemente altas.
- La evaluación incluye un hallazgo de solapamiento con BANKING77 (detalle no disponible), lo que puede afectar a la validez de algunas cifras.
- Licencia `kettei-community-model-license-1.0`: las condiciones concretas de uso comercial no están disponibles en la información proporcionada; es obligatorio revisar el archivo LICENSE antes de cualquier despliegue productivo.
- Modelo con 0 descargas y 0 valoraciones en el momento de los datos: sin validación independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sqwish/Kettei-Dot
- Licencia: https://huggingface.co/Sqwish/Kettei-Dot/blob/main/LICENSE
- Wheel de referencia y archivo de código/evaluación: https://huggingface.co/Sqwish/Kettei-Dot/tree/main/artifacts
- Modelo base: https://huggingface.co/IFM/K2-Horizon-0.9B
- Resultados de búsqueda web: no se encontró ningún enlace relevante sobre el modelo (los resultados devueltos corresponden a centros educativos sin relación con el proyecto).
