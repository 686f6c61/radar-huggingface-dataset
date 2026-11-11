# stneric/simplixity-router-2b

## Resumen

simplixity-router-2b es un ajuste fino de Qwen3.5-2B desarrollado por stneric como componente de enrutamiento del asistente de investigación autoalojado Simplixity. El modelo no genera respuestas finales: lee una pregunta (en inglés o alemán) junto con el historial de conversación y rellena el esquema `Classification` de la aplicación en formato JSON, decidiendo si hay que buscar, con qué consultas, cuánta investigación requiere la pregunta, la forma de la respuesta, la recencia exigida a las fuentes y qué fuentes consultar.

Se trata de un adaptador LoRA fusionado sobre el modelo base Qwen3.5-2B, con 2.274.069.824 parámetros totales y una ventana de contexto de 8192 tokens en su configuración de despliegue recomendada. Su relevancia práctica radica en que sustituye a un modelo propietario (Claude Haiku 5.5) en una tarea acotada de clasificación estructurada, con una latencia mediana de 0,53 s en una RTX 3070 Ti y una precisión de enrutamiento del 96 % en el conjunto de prueba del autor.

La versión publicada es la v1, destilada de Claude Haiku 5.5 con el modo de razonamiento activado, y está pensada para ejecutarse localmente en cuantización Q4_K_M mediante el GGUF publicado en un repositorio separado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-2B) con adaptador LoRA fusionado |
| Parámetros totales | 2.274.069.824 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (configuración recomendada en el Modelfile) |
| Tipos de cuantización | Q4_K_M (GGUF publicado); el modelo base se entrenó en NF4 con doble cuantización |
| Idiomas soportados | Inglés (en), alemán (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal), GGUF (repo simplixity-router-2b-GGUF) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B, un transformer con torre de visión (el pipeline declarado en los tags incluye image-text-to-text), aunque durante el entrenamiento la torre de visión se retiró de la GPU porque el router nunca procesa imágenes directamente. El ajuste se realizó con QLoRA: modelo base en NF4 con doble cuantización y cómputo en bf16, adaptadores en fp32, rango LoRA 16, alpha 320 y dropout 0, aplicados sobre las 186 capas lineales del modelo de lenguaje. La pérdida se calculó únicamente sobre la respuesta JSON.

Los datos de entrenamiento consisten en 2803 preguntas sintéticas (mitad en inglés, mitad en alemán) generadas por Claude Haiku 5.5 a partir de 37 categorías, con distintos estilos de escritura y con seguimientos, imágenes, páginas enlazadas y conversaciones de biblioteca. Cada pregunta se convirtió en el prompt exacto que enviaría la aplicación y se etiquetó con Haiku 5.5 con un presupuesto de razonamiento de 1024 tokens. Se descartaron 23 etiquetas que rompían reglas de la aplicación o del prompt, y se vaciaron los campos que la aplicación ignora en cada caso. Además, 145 preguntas reales de la instancia del autor (mostradas dos veces cada una) formaron parte del entrenamiento pero no se publican. El entrenamiento usó batch 1 con acumulación de gradiente 8 y tasa de aprendizaje constante de 2e-5; el checkpoint publicado corresponde al paso 350 (0,9 épocas), donde la pérdida de evaluación fue mínima, ya que a partir de ahí el modelo empezó a sobreajustar.

## Capacidades

- Clasificación estructurada: rellena el esquema `Classification` de Simplixity en JSON estricto, con un máximo de 500 tokens de salida y razonamiento desactivado.
- Decisión de búsqueda: determina si la pregunta requiere búsqueda web y genera las consultas correspondientes (2 o 3 según la profundidad configurada).
- Estimación de complejidad: clasifica la pregunta en niveles (simple, estándar, investigación) para dimensionar el esfuerzo de investigación.
- Forma de la respuesta: selecciona la estructura de salida (sin forma, explicativo, pasos, perfil).
- Recencia de fuentes: fija el horizonte temporal que deben cumplir las fuentes consultadas.
- Selección de fuentes: elige qué fuentes buscar cuando el modo es Auto, o respeta una selección fija.
- Manejo de contexto conversacional: incorpora el historial de chat, imágenes adjuntas, páginas enlazadas y catálogo de biblioteca en la decisión.
- Multilingüe limitado: entrenado y evaluado en inglés y alemán.
- No soporta tool calling genérico, agentes multi-paso ni generación de títulos; su función es exclusivamente el enrutamiento.

## Casos de uso

- Enrutamiento de un asistente de investigación autoalojado: el modelo recibe la pregunta del usuario y el historial y devuelve el JSON de clasificación que decide si se lanza una búsqueda web, con qué consultas y con qué profundidad, sustituyendo a una llamada a un modelo propietario.
- Despliegue local en hardware de consumo: con Q4_K_M y 8192 tokens de contexto cabe en una GPU de gama media como la RTX 3070 Ti del autor, con latencia mediana de 0,53 s, lo que permite mantener el enrutamiento en local sin depender de APIs externas.
- Clasificación de consultas en pipelines de atención al cliente: al devolver JSON estricto con un esquema fijo, la salida se puede validar y consumir directamente por código sin postprocesado frágil.
- Filtrado de recencia en sistemas de recuperación: el campo de recencia permite que un motor de búsqueda descarte fuentes antiguas cuando la pregunta exige información reciente, sin intervención humana.
- Asistente bilingüe inglés-alemán: el entrenamiento equilibrado entre ambos idiomas permite usarlo en instancias de habla alemana e inglesa con el mismo modelo.
- Componente de decisión en arquitecturas multi-modelo: al ser un modelo pequeño y rápido, actúa como primera etapa que decide el esfuerzo de investigación antes de invocar un modelo generador mayor, reduciendo coste y latencia totales.
- Investigación reproducible sobre destilación: los scripts de generación de datos, construcción de prompts, etiquetado y entrenamiento están publicados en `training/`, lo que permite replicar o adaptar el proceso a otros esquemas de clasificación.

## Benchmarks y rendimiento

Conjunto de prueba de 105 preguntas etiquetadas a mano (52 en inglés, 53 en alemán), ejecutado en Ollama 0.40 con temperatura 0 y `num_gpu 99`. "Route" significa que la decisión de buscar sí o no, la complejidad y la forma de la respuesta son todas correctas.

| Modelo | Route | Complexity | Shape | Recency | Sources | Latencia mediana (RTX 3070 Ti) |
|---|---|---|---|---|---|---|
| Qwen3.5-2B Q4_K_M sin ajustar | 38 % | 71 % | 59 % | 91 % | 81 % | 1,24 s |
| simplixity-router-2b v1 Q4_K_M | 96 % | 98 % | 98 % | 98 % | 97 % | 0,53 s |
| Claude Haiku 5.5, thinking | 99 % | 99 % | 100 % | 99 % | 100 % | 3,0 s (OpenRouter) |

Acuerdo con el profesor (Haiku) en preguntas reservadas, medido como acuerdo de ruta:

| Conjunto de desarrollo | Haiku vs Haiku | v1 vs Haiku |
|---|---|---|
| Sintético, 150 preguntas | 91 % | 66 % |
| Preguntas reales de la instancia del autor, 69 | 79 % | 75 % |

Casi todas las discrepancias se dan entre niveles contiguos: complejidad estándar frente a investigación y simple frente a estándar; forma sin forma frente a explicativo, pasos o perfil.

## Requisitos de hardware

- VRAM estimada para inferencia: en Q4_K_M, el archivo GGUF ocupa del orden de 1,5 GB para 2,27 mil millones de parámetros, más la caché KV para 8192 tokens de contexto; el repo principal en safetensors pesa 4,6 GB.
- GPU recomendadas: el autor reporta latencia de 0,53 s en una RTX 3070 Ti; cualquier GPU consumer con al menos 4-6 GB de VRAM libre debería poder ejecutarlo en Q4_K_M.
- Cabe en GPU consumer: sí, en tarjetas de gama media y alta con suficiente VRAM para el contexto configurado.
- Opciones de despliegue: Ollama (método documentado, con `PARAMETER num_ctx 8192` en el Modelfile), GGUF desde el repo simplixity-router-2b-GGUF, y transformers con safetensors. En Linux y Windows Ollama no puede importar safetensors, por lo que hay que descargar el GGUF.
- Latencia y throughput: latencia mediana de 0,53 s por clasificación en RTX 3070 Ti con Ollama 0.40; el modelo sin ajustar tardaba 1,24 s y Haiku 5.5 vía OpenRouter, 3,0 s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| simplixity-router-2b v1 | 2,27 B | 8192 tokens (config. recomendada) | Route 96 %, latencia 0,53 s | Apache 2.0 | Hugging Face (safetensors y GGUF) |
| Qwen3.5-2B sin ajustar | 2,27 B | No disponible en la información | Route 38 %, latencia 1,24 s | No disponible en la información | Hugging Face |
| Claude Haiku 5.5 (thinking) | No disponible | No disponible | Route 99 %, latencia 3,0 s | Propietaria | OpenRouter |

## Limitaciones y advertencias

- Preguntas en zona gris: cuando Haiku duda, v1 a menudo decide de forma distinta; el acuerdo con el profesor es del 66 % en el conjunto sintético y del 75 % en preguntas reales.
- Bucles de repetición: en 1 de 219 preguntas de desarrollo el modelo entró en un bucle y Ollama abortó con "token repeat limit reached". Simplixity trata una clasificación fallida como "buscar la pregunta tal cual", de modo que el flujo continúa.
- No genera títulos: el autor advierte que hay que configurar un modelo de títulos aparte (simplixity-title-0.8b); sin él, la aplicación usa el router para nombrar chats, tarea para la que no fue entrenado.
- Dependencia del prompt exacto: el modelo fue entrenado con el prompt del clasificador de Simplixity (`app/agent/prompts.classify`) y espera recibirlo tal cual; usarlo con otro prompt puede degradar la salida.
- Idiomas limitados a inglés y alemán; no hay evidencia de comportamiento en castellano.
- Contexto: la configuración recomendada es de 8192 tokens; un prompt de router con historial de chat supera el valor por defecto de Ollama si no se ajusta `num_ctx`.
- Datos privados: 145 preguntas reales de entrenamiento y 69 de desarrollo no se publican, por lo que la replicación exacta del conjunto de datos no es posible.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3.5-2B tiene sus propias condiciones, no detalladas en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stneric/simplixity-router-2b
- GGUF: https://huggingface.co/stneric/simplixity-router-2b-GGUF
- Modelo de títulos: https://huggingface.co/stneric/simplixity-title-0.8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio de Simplixity: https://github.com/stneric/simplixity
