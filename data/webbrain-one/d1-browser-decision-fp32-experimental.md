# webbrain-one/d1-browser-decision-fp32-experimental

## Resumen

d1-browser-decision-fp32-experimental es un derivado experimental del modelo LiquidAI/d1-omni-600M, publicado por el usuario webbrain-one en HuggingFace. No es un modelo generativo: es un cabezal de decisión que puntúa directamente opciones con nombre para tres tipos de pregunta (`choice`, `noul` y `score` ordinal), a partir de estado en texto o JSON y, opcionalmente, capturas de pantalla. No genera texto ni tokens, y la propia model card advierte explícitamente de que no debe invocarse `generate()` ni tratarse como un modelo causal de chat.

El paquete contiene 474.967.041 parámetros en 380 tensores FP32 limpios (encoder de texto, cabezal de decisión, torre de visión y proyector), sin torre de audio ni cabezal LM. La adaptación se realizó mediante un único merge LoRA de rango 4 y alpha 8 aplicado a 31 tensores del cabezal, cuatro del proyector y cuatro matrices Q/V del encoder; los otros 341 tensores, incluidos los 197 de la torre de visión, conservan los valores originales. Se distribuye en safetensors más tres grafos ONNX en FP32 sin cuantizar, pensados para ejecución en navegador vía WebGPU.

Su relevancia es acotada y muy específica: cubre el caso de decidir cuándo una tarea de automatización web ha terminado o qué opción de un formulario debe seleccionarse, ejecutándose en el propio navegador. La model card es inusualmente honesta sobre el alcance: los datos de calidad provienen de páginas sintéticas con etiquetas generadas por IA y verificadas también por IA, no por anotadores humanos expertos, y no se recogió ningún conjunto de sitios reales desarrollados de forma independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivado del transformer multimodal d1-omni-600M sin torre de audio ni cabezal LM; encoder de texto + torre de visión + proyector + cabezal de decisión (arquitectura declarada en config.json: `NoAudioModel`) |
| Parametros totales | 474.967.041 (dato real de safetensors) |
| Parametros activos | No aplica, no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se distribuyen cuantizaciones; los pesos y los grafos ONNX son FP32 sin cuantizar. La adaptación previa usó un merge LoRA rango 4, alpha 8 |
| Idiomas soportados | No disponibles |
| Licencia | `other`, con `license_name: lfm1.0` y enlace al fichero LICENSE del repositorio |
| Formato de pesos | safetensors (`model.safetensors`, 1.899.912.876 bytes) y 3 grafos ONNX con datos externos (1.900.356.386 bytes en total) |

Datos adicionales verificables: el repositorio ocupa 3,8 GB; el identificador de revisión del modelo base es `02b55d7076f15129e59ab3f94783f32c4b088674`; el SHA-256 físico de `model.safetensors` es `75ab6d7d0ec2966c969a95c548b91f4015b07cba82fa839fcfb5c19b40e9f940` y el SHA-256 lógico del estado limpio de tensores es `76409dd958673e2028f1da23a909033876169f89603c16c7cbcdfbcc7404cdb5`. Se incluyen `package-manifest.json` y `SHA256SUMS` con sumas de verificación por fichero y por bloques de 4 MiB.

Existe una advertencia de configuración relevante: el `config.json` heredado sigue declarando `dtype: float16` y `architectures: [NoAudioModel]`, pero los pesos reales, los grafos y los feeds son float32 según el manifiesto de publicación. No debe inferirse la precisión a partir de esa etiqueta heredada. El repositorio no ofrece un cargador `AutoModel.from_pretrained()` ni código Python remoto ejecutable.

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/d1-omni-600M y elimina la rama de audio y el cabezal de lenguaje, conservando únicamente el encoder de texto, la torre de visión, el proyector y un cabezal de decisión que puntúa opciones. El release es un candidato inmutable: los bytes publicados corresponden al epoch 06 de `projector_head_text_lora` del experimento balanced-V3, seleccionado por validación antes de la evaluación held-out. El empaquetado no realizó entrenamiento, reselección, transferencia de pesos, merge, cuantización ni reexportación ONNX.

La adaptación previa actualizó 31 tensores del cabezal, cuatro del proyector y cuatro matrices Q/V del encoder mediante un único merge LoRA de rango 4 y alpha 8. Los 341 tensores restantes, incluidos los 197 de la torre de visión, permanecen con los valores originales exactos. El resultado son 380 tensores FP32 limpios. No hay datos disponibles sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre uso de RLHF o DPO.

La model card documenta varias limitaciones metodológicas del entrenamiento y la evaluación: regularidades sintéticas de maquetación, texto y color; divisiones finitas por familias; separación entre pérdida de entrenamiento y validación con tendencia a la sobreconfianza; asociación residual entre el identificador de "Ready" y la finalización (0,622556 bits dentro de grupos objetivo dispersos); y asociación conjunta de familia y posición de opción (0,584963 bits). La ausencia de información mutua condicional de viewport en los grupos de control especificados no se considera prueba de independencia universal frente a variables de confusión.

## Capacidades

- Puntuación directa de opciones con nombre para preguntas de tipo `choice` (elección categórica).
- Puntuación para preguntas de tipo `noul` (ninguna de las opciones listadas).
- Puntuación ordinal de tipo `score`.
- Entrada multimodal: estado en texto o JSON, con capturas de pantalla opcionales procesadas por la torre de visión.
- Detección de finalización de tareas en páginas de navegador (completion precision y recall medidas sobre conjuntos sintéticos).
- Ejecución en navegador mediante WebGPU con grafos ONNX en FP32.
- Inferencia local sin necesidad de servidor de inferencia ni API remota.
- No genera texto ni tokens; no soporta tool calling, function calling, agentes multi-paso por sí mismo ni modo de razonamiento explícito.
- Idiomas soportados: no disponibles.

## Casos de uso

- Detección de finalización en automatización de navegador: el modelo puntúa si una tarea web ha concluido, con una precisión medida de 22/23 en el conjunto nuevo sintético. Es adecuado como señal de parada en pipelines de RPA, sustituyendo heurísticas basadas en selectores.
- Clasificación de opciones en formularios y asistentes web: dado un estado JSON y una lista de opciones nombradas, devuelve la puntuación de cada una para decidir qué elemento pulsar o seleccionar.
- Puntuación de progreso ordinal: en flujos con estados graduados (por ejemplo, porcentaje de avance de un asistente), el modelo emite un `score` ordinal con un MAE medido de 0,574219 en el conjunto nuevo.
- Ejecución en el propio navegador del usuario: con los grafos ONNX y WebGPU, la decisión puede tomarse en cliente sin enviar capturas ni estado a un servidor, lo que reduce exposición de datos.
- Regresión y control de calidad de agentes web: el modelo sirve como árbitro automático para comparar el comportamiento de distintas versiones de un agente sobre capturas de validación fijas.
- Enrutado de decisiones en pipelines híbridos: la salida de puntuaciones puede alimentar una capa de reglas que decida continuar, reintentar o marcar una tarea como desconocida, apoyándose en la categoría "unknown" que el modelo también contempla.
- Preprocesamiento en sistemas de scraping guiado: emparejar el estado de la página con las opciones disponibles para decidir la siguiente acción sin recurrir a un modelo de lenguaje completo.

## Benchmarks y rendimiento

Resultados held-out sobre conjuntos sintéticos publicados por el autor. El conjunto nuevo consta de 72 pantallas y 144 preguntas (126 categóricas `choice`/`noul`, 18 de `score` ordinal); el antiguo, de 60 pantallas y 120 preguntas (90 categóricas, 30 de `score`).

| Etapa histórica | Categórico nuevo | Precisión finalización | Recall finalización | Unknown correcto | MAE score nuevo | Categórico antiguo | MAE score antiguo |
|---|---:|---:|---:|---:|---:|---:|---:|
| Original A | 48/126 | 21/59 | 21/24 | 6/28 | 0,736238 | 43/90 | 0,973761 |
| Solo cabezal | 51/126 | 11/27 | 11/24 | 9/28 | 0,723945 | 42/90 | 0,913887 |
| Proyector + cabezal | 93/126 | 22/23 | 22/24 | 23/28 | 0,574737 | 52/90 | 0,605605 |
| Publicado (proyector + cabezal + LoRA de texto) | 92/126 | 22/23 | 22/24 | 23/28 | 0,574219 | 52/90 | 0,570224 |

La etapa publicada comete un falso positivo de finalización entre 48 casos no completos o inciertos del conjunto nuevo (0/24 negativos conocidos y 1/24 casos inciertos) y omite dos positivos. Las cuatro etapas fallan los siete ejemplos positivos de finalización del conjunto antiguo, por lo que la precisión de finalización en ese conjunto queda indefinida.

La etapa LoRA no aportó exactitud categórica adicional sobre proyector + cabezal en el conjunto nuevo; se mantiene como candidata de publicación porque la selección se hizo solo por validación y los resultados held-out no la reajustaron. La suite de regresión original de 58 peticiones y 70 preguntas no es un benchmark de exactitud: la etapa publicada cambia 9/46 decisiones `choice`/`noul` frente a la Original A actual, con una deriva máxima de probabilidad de 0,734239 y de score esperado de 1,496044.

Paridad de ejecución medida en NVIDIA RTX 5090 con Chrome 154 y WebGPU (adaptador no software), sobre 72 capturas de validación más 20 peticiones de texto neutro (92 peticiones, 169 preguntas), con dos calentamientos y diez repeticiones en caliente por ruta. Las 145 preguntas categóricas coincidieron en todas las repeticiones en caliente.

| Ruta de navegador | Diferencia máxima de probabilidad | Diferencia máxima de score esperado |
|---|---:|---:|
| Mismo prefijo de medios nativo | 0,0000563264 | 0,000109192 |
| Preprocesado PNG real + visión/proyector | 0,0000483990 | 0,0000722781 |

Tokens, píxeles, máscaras y formas coincidieron exactamente con sus referencias. Las diferencias de orden FP32 en la interpolación de posiciones alcanzaron 0,000000774860 y la diferencia de prefijo de medios entrenado llegó a 0,0565567. No hay afirmación de activaciones intermedias bit-exactas ni de una puerta de 0,001 para estados intermedios.

Latencia observada en esa máquina (p50/p95 en milisegundos, en caliente): decisión de texto 30,778/151,935; decisión con prefijo de imagen guardado 67,290/2… (el valor de p95 aparece truncado en la información disponible).

## Requisitos de hardware

- Peso de los pesos: `model.safetensors` ocupa 1.899.912.876 bytes (aproximadamente 1,9 GB) en FP32; los grafos ONNX con datos externos suman 1.900.356.386 bytes. El repositorio completo ocupa 3,8 GB.
- VRAM estimada para inferencia: alrededor de 2 a 4 GB solo para pesos, a lo que hay que sumar la memoria de activaciones de la torre de visión, que depende de la resolución de las capturas y no está documentada.
- Cabe en GPU de consumo: sí, por tamaño de pesos, aunque la única configuración medida en la model card es una NVIDIA RTX 5090.
- GPU recomendadas: no disponibles más allá de la RTX 5090 usada en las mediciones. No se documentan pruebas en A100, H100 o RTX 4090.
- Despliegue: los tres grafos ONNX en FP32 están pensados para ejecución en navegador con WebGPU (medido en Chrome 154). No se documenta compatibilidad con vLLM, TGI, llama.cpp ni Ollama; el repositorio no ofrece cargador `AutoModel.from_pretrained()`.
- Latencia medida: p50 de 30,778 ms y p95 de 151,935 ms para decisión de texto; p50 de 67,290 ms para decisión con prefijo de imagen guardado. El p95 de esta segunda ruta aparece truncado en la información disponible.
- Rendimiento (throughput): no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| webbrain-one/d1-browser-decision-fp32-experimental | 474.967.041 | No disponible | Puntuación de opciones, sin generación | `other` (lfm1.0) | HuggingFace, 0 descargas, 0 likes |
| LiquidAI/d1-omni-600M | No disponible en la información proporcionada (el nombre sugiere gama 600M) | No disponible | Modelo ómnibus multimodal del que deriva | No disponible en la información proporcionada | HuggingFace, revisión `02b55d7076f15129e59ab3f94783f32c4b088674` |
| Otras alternativas de decisión en navegador | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks de LiquidAI/d1-omni-600M en la información proporcionada, por lo que solo puede compararse estructuralmente: este derivado elimina audio y cabezal LM, reduce los parámetros publicados a 474.967.041 y modifica únicamente 39 tensores respecto al original. La búsqueda web realizada no devolvió ninguna fuente técnica relevante ni modelos comparables.

## Limitaciones y advertencias

- No es un modelo generativo: llamar a `generate()` o tratarlo como modelo causal de chat produce un uso incorrecto.
- Los datos de calidad proceden de páginas de navegador sintéticas con etiquetas escritas por IA y verificadas mediante revisión DOM/píxel también por IA, no por anotadores humanos expertos.
- No se recogió ningún conjunto de sitios reales desarrollados de forma independiente, por lo que no está establecida una detección fiable de finalización en webs ajenas al conjunto sintético.
- Las cuatro etapas históricas fallan los siete ejemplos positivos de finalización del conjunto de test antiguo; en ese conjunto no se predice ningún positivo y la precisión de finalización queda indefinida. Cero falsos positivos no equivale a reconocimiento correcto de finalización.
- Limitaciones declaradas: regularidades sintéticas de maquetación, texto y color, divisiones finitas por familias, sobreconfianza y separación entre pérdida de entrenamiento y validación, asociación residual Ready-identificador/finalización (0,622556 bits) y asociación familia/posición de opción (0,584963 bits).
- La ausencia de información mutua condicional de viewport en los grupos de control no se considera prueba de independencia universal frente a variables de confusión.
- La suite de regresión de 58 peticiones y 70 preguntas no es un benchmark de exactitud y muestra cambios de decisión respecto a la versión Original A.
- El `config.json` heredado declara `float16` cuando los pesos reales son `float32`; derivar la precisión de esa etiqueta es un error.
- Licencia `other` con `license_name: lfm1.0` y enlace a un fichero LICENSE: las condiciones exactas de uso comercial no se detallan en la información proporcionada y deben consultarse en el repositorio.
- No hay idiomas declarados, ni longitud de contexto documentada, ni datos sobre sesgos.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de puntuaciones sobreconfiadas o de falsos positivos de finalización.
- Modelo marcado como experimental, con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/webbrain-one/d1-browser-decision-fp32-experimental
- Modelo base: https://huggingface.co/LiquidAI/d1-omni-600M
- Revisión concreta del modelo base: https://huggingface.co/LiquidAI/d1-omni-600M/tree/02b55d7076f15129e59ab3f94783f32c4b088674
- Fichero de licencia: LICENSE dentro del repositorio
- Manifiesto de paquete: `package-manifest.json` dentro del repositorio
- Sumas de verificación: `SHA256SUMS` dentro del repositorio
- Resultados de la búsqueda web: no se encontró ningún enlace técnico relevante; los resultados devueltos fueron foros de contenido no relacionado con el modelo.
