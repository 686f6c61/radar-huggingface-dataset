# Sqwish/Kettei-Core

## Resumen

Kettei Core es un modelo de decisión (decision model) publicado por el usuario Sqwish en HuggingFace. No es un modelo generativo al uso: recibe un contexto, una pregunta y una lista cerrada de alternativas, y devuelve la opción seleccionada junto con las puntuaciones normalizadas de todas las opciones, los logits y el recuento de tokens de entrada. Su caso de uso declarado es la selección entre alternativas: enrutado de soporte, comprobación explícita de reglas y selección de herramientas.

Técnicamente es un fine-tune del modelo base IFM/K2-Horizon-3.7B, con arquitectura propietaria `K2HorizonForCausalLM` que requiere ejecución de código remoto (`trust_remote_code=True`). El checkpoint en safetensors contiene 5.058.255.360 parámetros (unos 10,12 GB en BF16), una cifra superior a los 3,7B que sugiere el nombre del modelo base; la model card no explica esa diferencia. La interfaz de referencia limita cada petición a 4096 tokens de entrada y rechaza las entradas más largas.

Su relevancia es acotada pero concreta: se distribuye junto a una rueda de instalación (`kettei-0.1.0rc5`) y un paquete de referencia que aporta el renderizador de decisiones, y publica resultados de evaluación propios (Jev231, DI-S12k y una reconstrucción local de componentes de AA) con métricas probabilísticas (NLL, Brier, ECE10), algo poco habitual en modelos pequeños de este tipo. El modelo solo declara inglés y su licencia es propia (`kettei-community-model-license-1.0`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | K2HorizonForCausalLM (transformer con código propio; detalles internos no disponibles) |
| Parametros totales | 5.058.255.360 (5,06B) |
| Parametros activos | No aplica (no se declara arquitectura MoE) |
| Longitud de contexto | 4096 tokens de entrada por petición en la interfaz de referencia; las entradas más largas se rechazan |
| Tipos de cuantizacion | No disponible (la referencia probada usa BF16; no se publican GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | `kettei-community-model-license-1.0` (identificador `other`; condiciones comerciales no disponibles en la información proporcionada) |
| Formato de pesos | safetensors + código Python de arquitectura propia (`custom_code`) |
| Tamano del repo | 10,1 GB (BF16 ~10,12 GB) |
| Modelo base | IFM/K2-Horizon-3.7B (relación: finetune) |
| Pipeline declarado | `other` (modelo de decisión, no `text-generation` pese al tag) |
| Salida de la interfaz | Opción elegida, índice, puntuaciones por opción, logits y tokens de entrada |

## Arquitectura y entrenamiento

La model card identifica la arquitectura como `K2HorizonForCausalLM`, heredada del modelo base IFM/K2-Horizon-3.7B mediante fine-tune, e indica que requiere ejecución de código propio del repositorio. Sobre la arquitectura interna (tipo de atención, capas, cabezas, vocabulario, uso de MoE o de estados recurrentes) no se aporta ningún detalle en la información disponible. La capa de decisión se implementa mediante un renderizador específico incluido en el paquete `kettei`: el autor advierte explícitamente que una plantilla de chat genérica «no es un sustituto» del renderizador de decisión.

No se publican datos sobre volumen de entrenamiento, composición del corpus, ni si hubo RLHF, DPO u otra fase de alineación. Tampoco se detalla el proceso de destilación o ajuste que convierte el modelo base en un puntuador de alternativas. Las cifras publicadas se limitan a evaluación: sobre la muestra fija original DI-S12k (12.000 peticiones y 88.789 preguntas), Core obtiene 46,28 puntos de índice de habilidad con la fórmula histórica 0.2.1, con NLL macro por tarea de 0,9476, Brier de 0,4544 y ECE10 de 0,1023 sobre 41 tareas elegibles. El autor aclara que son puntos de índice, no porcentajes de acierto ni puntuaciones oficiales de ningún leaderboard.

## Capacidades

- Puntuación y selección entre alternativas: dada una pregunta, un contexto y una lista de opciones, devuelve la opción elegida y una distribución de puntuaciones normalizada sobre el conjunto ofrecido.
- Salida estructurada: el resultado incluye `choice`, `index`, `options`, `scores`, `logits` e `input_tokens`, apta para integrarse en pipelines automatizados.
- Enrutado y clasificación cerrada: aplicaciones declaradas por el autor como enrutado de soporte, comprobación explícita de reglas y selección de herramientas (tool selection).
- Selección de herramientas en agentes: puede usarse como selector de función o acción dentro de un flujo multi-paso, siempre que las candidatas se presenten como lista cerrada.
- Detección y moderación (evaluada, no declarada como producto): la evaluación local de WildGuard reporta macro F1 de 91,74 % sobre 2.396 campos y 801 peticiones.
- Capacidad de abstención: no implementada de forma nativa; la model card indica que las reglas de abstención o revisión deben evaluarse sobre datos held-out propios.
- Idiomas: únicamente inglés declarado; no se establece cobertura lingüística general.
- Generación de explicaciones: no soportada. La interfaz no produce justificaciones del resultado.

## Casos de uso

- Enrutado de tickets de soporte: se pasa el texto del cliente como contexto y la lista de colas (facturación, técnico, envíos) como opciones; el modelo devuelve la cola con su puntuación. El ejemplo de la model card ilustra exactamente este flujo con 69 tokens de entrada.
- Selección de herramienta en un agente: dado el histórico de conversación y la lista de funciones disponibles (buscar en base de datos, crear ticket, escalar), usar `logits` y `scores` para elegir la función y, opcionalmente, aplicar un umbral de confianza antes de ejecutar.
- Comprobación de reglas de negocio: plantear pares pregunta/opciones del tipo «¿cumple la política X?» con opciones `cumple`, `no cumple`, `requiere revisión`, útil como guardarraíl determinista en flujos con pasos acotados.
- Triaje de intenciones en banca y seguros: la evaluación sobre 41 tareas (con solapamiento con BANKING77 documentado) sugiere uso en clasificación de intenciones de cliente con vocabulario controlado; requiere validar el sesgo por orden de opciones antes de desplegar.
- Moderación como primera etapa: clasificar contenido frente a categorías de política con el modelo y delegar en un revisor humano los casos de puntuaciones bajas o repartidas, aprovechando la ECE10 de 0,0496 medida en Jev231.
- Re-ranking de respuestas candidatas en RAG: generar varias respuestas o passages con otro modelo y usar Kettei Core para seleccionar la mejor alternativa según la pregunta original, dado su coste bajo (5B parámetros en BF16, ~10 GB).
- Selección de siguiente acción en automatización de back-office: elegir entre un conjunto fijo de acciones (reenviar, cancelar, solicitar documento) con contexto de hasta 4096 tokens; el límite obliga a resumir expedientes largos antes de la llamada.
- Etiquetado asistido a escala: procesar lotes de pares contexto/pregunta con opciones fijas para preetiquetar datos de entrenamiento, con revisión humana de los casos de baja confianza.

## Benchmarks y rendimiento

Los datos siguientes provienen exclusivamente de la model card. Las cifras de Jev231 corresponden al corpus público congelado y descargable (231 casos), no a un leaderboard alojado; todos los modelos se ejecutaron en un M4 de 24 GiB con cuerpos en BF16 y readout en FP32.

| Modelo | Aciertos / 231 | Exactitud | NLL (nats) | Brier | ECE10 |
|---|---:|---:|---:|---:|---:|
| Kettei Dot | 156 | 67,53 % | 0,7524 | 0,4118 | 0,0681 |
| Kettei Core | 198 | 85,71 % | 0,3711 | 0,2035 | 0,0496 |
| D3 Mini | 189 | 81,82 % | 0,4162 | 0,2402 | 0,0678 |

La diferencia de exactitud Core frente a D3 Mini es de +3,90 puntos, con un intervalo pareado exploratorio del 95 % de −1,30 a +9,09; los intervalos de NLL y Brier también incluyen el cero, por lo que la ventaja no es concluyente.

Componentes de la reconstrucción local de AA (los denominadores primarios difieren entre componentes y no se agregan):

| Componente y denominador | Dot | Core | D3 Mini |
|---|---:|---:|---:|
| Omni, exactitud, 600 | 11,50 % | 24,17 % | 34,50 % |
| HLE, exactitud, 513 | 18,13 % | 15,59 % | 11,89 % |
| When2Call, exactitud, 3.423 | 57,64 % | 62,02 % | 77,30 % |
| WildGuard, macro F1, 2.396 campos / 801 peticiones | 84,96 % | 91,74 % | 95,21 % |

La reconstrucción local de AA se completó con 5.588 peticiones y 7.227 preguntas por modelo, sin errores, en una A100-SXM4-40GB. El autor subraya que difiere del benchmark AA oficial y que no se reclama ningún índice AA. En la muestra DI-S12k, Core obtiene 46,28 puntos de índice frente a 27,98 de Dot, con NLL/Brier/ECE10 macro por tarea de 0,9476 / 0,4544 / 0,1023 frente a 1,1464 / 0,5513 / 0,1281 de Dot, sobre 41 tareas elegibles.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 ocupan ~10,12 GB; con activaciones y overhead de ejecución se puede estimar un rango de 11 a 13 GB, aunque el autor advierte que el tamaño de los pesos «no es un requisito de memoria en tiempo de ejecución» y no publica cifras de latencia ni de memoria medida.
- GPU probadas por el autor: NVIDIA RTX 6000 Ada (ruta de referencia CUDA/BF16, PyTorch 2.8.0+cu129, Transformers 5.17.0) y A100-SXM4-40GB para la reconstrucción de evaluaciones.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas de 16 GB o más (RTX 4090, RTX 4080, RTX 3090/4090 en BF16); en 12 GB exigiría cuantización, que no está publicada.
- Apple Silicon: las evaluaciones de Jev231 se ejecutaron en un Mac con M4 de 24 GiB, lo que confirma viabilidad en memoria unificada de 24 GB.
- Opciones de despliegue: paquete de referencia `kettei` (rueda `kettei-0.1.0rc5-py3-none-any.whl` con extra `[torch]`) sobre `transformers` con `trust_remote_code=True`; el autor indica que el renderizador propio es obligatorio y que una plantilla de chat genérica no sirve. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles. El autor declara explícitamente que las cifras publicadas no constituyen ninguna afirmación sobre latencia de hardware ni calidad de tarea.

## Comparativa con modelos similares

La información disponible solo permite comparar con los otros dos modelos de la misma familia evaluados en la model card. No se aportan datos de modelos comparables de otros proveedores.

| Modelo | Parámetros | Contexto | Jev231 (exactitud) | ECE10 (Jev231) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Kettei Core | 5,06B | 4096 tokens de entrada (interfaz de referencia) | 85,71 % | 0,0496 | `kettei-community-model-license-1.0` | HuggingFace + rueda de referencia |
| Kettei Dot | No disponible | No disponible | 67,53 % | 0,0681 | No disponible | Referenciado en la model card; repositorio no indicado |
| Kettei D3 Mini | No disponible | No disponible | 81,82 % | 0,0678 | No disponible | Referenciado en la model card; repositorio no indicado |
| IFM/K2-Horizon-3.7B | 3,7B (según nombre; no verificado) | No disponible | No disponible | No disponible | No disponible | Modelo base en HuggingFace |

## Limitaciones y advertencias

- Las puntuaciones son preferencias normalizadas entre las opciones ofrecidas, no probabilidades calibradas de corrección ni de éxito de la acción. Cambiar la lista de alternativas altera todas las puntuaciones.
- La respuesta correcta puede no estar en la lista de opciones; el modelo no puede señalarlo y no genera explicaciones.
- Sensibilidad al orden y a la redacción de las alternativas: el autor exige evaluar el orden de candidatos, el fraseado, las entradas ambiguas y los ejemplos fuera de dominio antes de usar el modelo en un flujo real.
- Ausencia de abstención nativa: cualquier regla de revisión o de rechazo debe calibrarse con datos held-out propios.
- Solo inglés declarado; no se establece cobertura lingüística general ni calibración universal.
- Límite duro de 4096 tokens de entrada en la interfaz de referencia, con rechazo de entradas más largas; no sirve para documentos extensos sin troceado o resumen previo.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo de elección cerrada el riesgo se traslada a la selección de una opción incorrecta con alta confianza, no a texto inventado.
- Sesgos: no se documenta ninguna evaluación de sesgo demográfico, sociolingüístico o de dominio.
- Ejecución de código remoto: la arquitectura propia obliga a `trust_remote_code=True`; el autor recomienda revisar el código antes de habilitarlo y fijar un commit inmutable para reproducibilidad.
- Licencia: `kettei-community-model-license-1.0`, con condiciones de uso comercial no disponibles en la información proporcionada; es necesario leer el fichero LICENSE antes de cualquier despliegue en producción.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, versión de la rueda en estado release candidate (`0.1.0rc5`) y un único entorno de referencia probado.
- La evaluación reporta solapamiento con BANKING77, lo que puede inflar la percepción de rendimiento en tareas de intenciones bancarias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sqwish/Kettei-Core
- Licencia: https://huggingface.co/Sqwish/Kettei-Core/blob/main/LICENSE
- Artefactos (rueda de referencia y archivo de código/evaluación): https://huggingface.co/Sqwish/Kettei-Core/tree/main/artifacts
- Modelo base: https://huggingface.co/IFM/K2-Horizon-3.7B
- Paper, blog o repositorio adicionales: no disponibles en la información proporcionada. La búsqueda web realizada no devolvió resultados pertinentes sobre este modelo.
