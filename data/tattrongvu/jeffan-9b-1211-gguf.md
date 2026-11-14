# tattrongvu/Jeffan-9B-1211-GGUF

## Resumen

Jeffan-9B-1211-GGUF es la distribución cuantizada en formato GGUF del modelo Jeffan-9B-1211, desarrollado por el usuario tattrongvu. No es un modelo generativo conversacional: es un **modelo de decisión estructurada** que recibe un estado (un documento, una conversación, una lista de herramientas) y una pregunta de opción múltiple sobre él, y devuelve una probabilidad para cada opción leída en un único forward pass. No genera texto libre.

El modelo base cuenta con 8.953.803.264 parámetros (aproximadamente 9B) y está etiquetado como derivado de la familia Qwen 3.5. Esta versión GGUF está pensada para ejecución en CPU mediante llama.cpp y Ollama, con dos cuantizaciones disponibles (Q4_K_M y Q8_0) y una licencia Apache 2.0 que permite uso comercial.

Su relevancia radica en un nicho concreto: clasificación y enrutamiento determinista donde se necesita una distribución de probabilidad sobre opciones predefinidas, no una respuesta en lenguaje natural. La advertencia principal es que el modelo liberado ejecuta dos pasadas de un bloque de capas intermedias (loop passes), característica que el llama.cpp y el Ollama estándar no implementan, por lo que sin los parches incluidos en el repositorio el modelo responde como la variante de una sola pasada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con bloque de capas intermedias ejecutado en bucle (2 loop passes por defecto); familia Qwen 3.5 |
| Parámetros totales | 8.953.803.264 (~9B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 8.192 tokens (num_ctx configurado en Ollama y en el Modelfile) |
| Tipos de cuantización | Q4_K_M (5,29 GiB), Q8_0 (8,87 GiB); precisión completa en bf16 en el modelo base |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp, Ollama); safetensors bf16 en el modelo base |

## Arquitectura y entrenamiento

La información disponible confirma que el modelo es un transformer de aproximadamente 9B parámetros, etiquetado como perteneciente a la familia Qwen 3.5, con una modificación arquitectónica singular: un bloque de capas intermedias se ejecuta dos veces por defecto (2 loop passes). El modelo está especializado en responder preguntas de decisión de opción múltiple leyendo una distribución de probabilidad sobre las opciones en un solo forward pass, sin generar texto. El prompt se construye internamente a partir de una plantilla embebida en el GGUF (línea de sistema, `State:`, `Question:`, `Options:` con códigos A, B, ...), de modo que el usuario solo envía el estado y la pregunta.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La cuantización Q4_K_M se generó con una importance matrix calculada sobre prompts de decisión en el formato propio del modelo, lo que preserva la precisión en la tarea objetivo. La innovación técnica destacable es el esquema de doble pasada: según la model card, en GPU el índice de muestreo del kit es de 66,9 con una pasada frente a 69,8 con dos, y en 300 preguntas retenidas el modelo de una pasada coincide con el liberado en 269 de 300 respuestas.

## Capacidades

- Clasificación y decisión de opción múltiple: devuelve `choice` y `probabilities` por pregunta a partir de un estado y un conjunto de opciones.
- Preguntas de sí/no y preguntas con criterios nombrados (por ejemplo, asignación a equipos).
- Enrutamiento y triaje sobre documentos, tickets, conversaciones o listas de herramientas.
- Lectura de prompts largos de hasta 8.000 tokens en un único forward pass (con `num_batch` igual a `num_ctx`).
- Integración con llama.cpp y Ollama mediante una ruta dedicada (`/v1/systemone` en Ollama) y un cliente de referencia (`decide_client.py`).
- No genera texto libre: las rutas de texto de Ollama (`/api/generate`, `/api/chat`, `/v1/chat/completions`) rechazan el modelo con error.
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni modo thinking.

## Casos de uso

- **Triaje de tickets de soporte:** se envía el texto del ticket como estado y una pregunta con las opciones de equipo (facturación, daños en envío, soporte técnico); el modelo devuelve la probabilidad de cada cola, como en el ejemplo de la model card (0,99 para "Shipping damage claims" a una pasada).
- **Enrutamiento de consultas a herramientas:** dado un listado de herramientas disponibles como opciones, el modelo asigna la consulta del usuario a la herramienta más probable, lo que permite construir un despachador determinista antes de invocar un LLM generativo.
- **Clasificación documental:** con estados de hasta 8.000 tokens, se puede clasificar contratos, correos o informes en categorías predefinidas sin necesidad de generar explicaciones.
- **Decisiones binarias automatizadas:** preguntas de sí/no (por ejemplo, "Should we refund?") devuelven directamente la probabilidad, útil para umbrales configurables en flujos de aprobación.
- **Moderación y etiquetado por lotes:** al no generar texto y ejecutarse en CPU con Q4_K_M en 10-12 GiB de memoria, es viable procesar lotes de decisiones en máquinas sin GPU.
- **Evaluación de agentes y pipelines:** sirve como componente de decisión de bajo coste dentro de sistemas mayores, donde la salida probabilística alimenta una política o un umbral, en lugar de depender de la generación libre de un LLM.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Precisión del modelo liberado (2 pasadas, bf16, CPU) | 82,9 % en 1.290 preguntas de decisión retenidas |
| Coincidencia Q4_K_M con el modelo liberado | 1.264 de 1.290 preguntas; cambio de precisión −0,3 puntos [−1,2; +0,4] |
| Coincidencia Q8_0 con el modelo liberado | 1.283 de 1.290 preguntas; cambio de precisión 0,0 puntos [−0,4; +0,4] |
| Coincidencia a 1 pasada (llama.cpp/Ollama estándar) | 269 de 300 respuestas idénticas al modelo liberado |
| Índice de muestreo del kit (GPU) | 66,9 a 1 pasada; 69,8 a 2 pasadas |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- **Memoria en inferencia:** Q4_K_M requiere 10-12 GiB de memoria residente pico por proceso llama.cpp con prompts de hasta 8.000 tokens; Q8_0 requiere 11 GiB sin AMX y 19 GiB en CPUs con AMX (llama.cpp mantiene una copia repackada de los pesos).
- **CPU:** ejecución solo-CPU documentada; se recomienda ajustar `num_thread` en el Modelfile al número de núcleos.
- **GPU:** la model card menciona motores GPU para el modelo base en precisión completa, pero no se detallan requisitos de VRAM para las versiones GGUF; no disponible.
- **GPU de consumo:** no se documenta compatibilidad con RTX 4090 u otras GPU de consumo para estos ficheros GGUF; el enfoque declarado es CPU.
- **Despliegue:** llama.cpp y Ollama 0.40.16 (soporte de modelos de decisión desde 0.40.5). Para las respuestas de 2 pasadas se necesita un `llama-server` compilado con los seis parches del repositorio, directamente o dentro de Ollama.
- **Configuración crítica:** `num_ctx` y `num_batch` deben ser iguales (8.192); con el `num_batch` por defecto de Ollama (512) se rechazan los prompts de más de 512 tokens.
- **Latencia y throughput:** no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jeffan-9B-1211-GGUF | ~9B | 8.192 | Decisión de opción múltiple | Apache 2.0 | GGUF en Hugging Face; requiere parches para 2 pasadas |
| Jeffan-9B-1211 (base) | ~9B | no disponible | Decisión de opción múltiple | Apache 2.0 | Safetensors bf16 en Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- **No es un modelo de chat:** no genera texto; las rutas de generación de Ollama devuelven error con este modelo.
- **Dependencia de parches:** el llama.cpp y el Ollama estándar no implementan el bucle de dos pasadas, por lo que responden como la variante de una pasada (269 de 300 coincidencias). Para replicar el comportamiento liberado hay que compilar `llama-server` con los seis parches del repositorio.
- **Configuración obligatoria:** si `num_batch` no iguala a `num_ctx`, los prompts largos se rechazan; es un error fácil de cometer en despliegues propios.
- **Idiomas:** no se documenta el soporte multilingüe; no disponible.
- **Sesgos y alucinación:** no se documentan sesgos conocidos; al no generar texto, el riesgo de alucinación se limita a asignar probabilidad alta a una opción incorrecta, no a fabricar contenido.
- **Licencia:** Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los componentes derivados de Qwen 3.5.
- **Madurez:** el repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo GGUF: https://huggingface.co/tattrongvu/Jeffan-9B-1211-GGUF
- Modelo base: https://huggingface.co/tattrongvu/Jeffan-9B-1211
- Fichero Q4_K_M: https://huggingface.co/tattrongvu/Jeffan-9B-1211-GGUF/blob/main/Jeffan-9B-1211-Q4_K_M.gguf
- Fichero Q8_0: https://huggingface.co/tattrongvu/Jeffan-9B-1211-GGUF/blob/main/Jeffan-9B-1211-Q8_0.gguf
- Sumas de verificación: https://huggingface.co/tattrongvu/Jeffan-9B-1211-GGUF/blob/main/SHA256SUMS
