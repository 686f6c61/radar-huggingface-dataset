# theatechcorporation/amaara-decide-vision-GGUF

## Resumen

amaara-decide-vision es un modelo de decisión multimodal de 0,8B parámetros (779.717.956 parámetros totales según los pesos en safetensors) desarrollado por The A-Tech Corporation PTY LTD (Queensland, Australia). A diferencia de un modelo generativo al uso, no produce prosa: recibe una imagen, una pregunta y un conjunto de opciones, y devuelve en un único forward pass una elección junto con una probabilidad calibrada para cada opción. Está especializado en comprensión de gráficos, mapas y capturas de interfaces de usuario.

El repositorio que nos ocupa contiene únicamente las cuantizaciones GGUF del modelo original (`theatechcorporation/amaara-decide-vision`), pensadas para ejecutarse con llama.cpp. El modelo deriva del base `unsloth/Qwen3.5-0.8B` (Apache-2.0) y añade una cabeza de decisión propietaria denominada "Clef", con escalas de temperatura por bucket de número de opciones ya incorporadas en los ficheros GGUF.

Su relevancia práctica radica en el formato de salida: al devolver probabilidades calibradas utilizables directamente como umbrales, encaja en pipelines de automatización donde se necesita una decisión discreta y auditable (elegir una región de un gráfico, identificar un widget de una UI) en lugar de texto libre. El coste computacional es mínimo: aproximadamente un segundo por consulta en CPU con la cuantización Q8_0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5-0.8B) con cabeza de decisión Clef y proyector de visión |
| Parametros totales | 779.717.956 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16 (1,57 GB), Q8_0 (0,84 GB), Q6_K (0,65 GB), Q5_K_M (0,60 GB), Q4_K_M (0,55 GB) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); pesos completos y FP8 en el repositorio principal |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen3.5-0.8B`, un transformer de 0,8B parámetros, sobre el que se incorpora un proyector de visión (fichero `mmproj-amaara-decide-vision-f16.gguf`, obligatorio para procesar imágenes) y una cabeza de decisión llamada Clef. Esta cabeza evalúa en una sola pasada todo el prompt (tokens de imagen más el esquema de opciones) y emite una distribución de probabilidad sobre las opciones presentadas, sin generar texto. La calibración se aplica por bucket según el número de opciones y las escalas de temperatura resultantes (`clef.decision.temperature.*`) están embebidas en los GGUF, de modo que las probabilidades son utilizables como umbrales sin corrección posterior.

No se dispone de información sobre el número de tokens de entrenamiento ni sobre la composición completa del dataset. La model card indica que los datos de entrenamiento se filtraron por licencia fila a fila y que los gráficos sintéticos se generaron internamente y se publicaron bajo CC0. Tampoco se documenta el uso de RLHF o DPO. La innovación técnica destacable es el propio paradigma de decisión: en lugar de decodificación autoregresiva, el modelo puntúa opciones y termina, lo que elimina la variabilidad del muestreo y permite umbrales estables.

## Capacidades

- Decisión multimodal sobre imagen: dada una imagen, una pregunta y un conjunto de opciones, devuelve una elección con probabilidad calibrada por opción en un solo forward pass.
- Comprensión de gráficos: evaluado sobre `ai2d` (diagramas) y estilos de gráfico retenidos, con capacidad demostrada de discriminar el gráfico correcto frente a uno incorrecto.
- Comprensión de mapas: resultados sobre `mapqa` (0,942 con Q8_0).
- Comprensión de interfaces de usuario: evaluación sobre `rico-widget`, con capacidad de identificar widgets y elementos de pantalla.
- Salida estrictamente estructurada: no genera prosa; la generación de texto está deshabilitada de forma intencionada (HTTP 501 en el endpoint de generación).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo puntúa opciones y se detiene.
- Capacidades multilingües: limitadas al inglés.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Análisis automatizado de dashboards: enviar una captura de un panel de control junto con la pregunta "¿qué región tiene más ingresos?" y las regiones como opciones; el modelo devuelve la elección con probabilidad, apta para umbrales de confianza en un pipeline de informes.
- Extracción de datos de gráficos de barras y líneas: dado un gráfico y las categorías del eje como opciones, seleccionar la que corresponde al valor máximo o mínimo, con la probabilidad calibrada como señal de fiabilidad.
- Comprensión de mapas en aplicaciones de análisis territorial: responder preguntas sobre mapas (por ejemplo, localización de una región) usando `mapqa` como referencia de rendimiento; útil en herramientas de visualización geoespacial.
- Automatización de pruebas de interfaz de usuario: dado un pantallazo de una aplicación y un conjunto de widgets candidatos, identificar el elemento correcto; el modelo está evaluado sobre `rico-widget` y mantiene la precisión incluso en Q4_K_M.
- Enrutamiento de decisiones en pipelines de documentos visuales: usar el modelo como clasificador de bajo coste (aproximadamente un segundo por consulta en CPU) que elige entre opciones predefinidas antes de invocar un modelo mayor o una lógica de negocio.
- Moderación o verificación de consistencia visual: comparar una imagen con opciones de etiqueta y usar la probabilidad calibrada como umbral para derivar casos dudosos a revisión humana.
- Despliegue en entornos con recursos limitados: al ejecutarse en CPU con `-ngl 0` y ocupar entre 0,55 y 1,57 GB según cuantización, puede integrarse en servicios edge o contenedores sin GPU.

## Benchmarks y rendimiento

Precisión medida sobre filas retenidas con la imagen correcta, comparando Q8_0 y Q4_K_M frente a la referencia F16:

| Conjunto | n | Q8_0 | Q4_K_M | Delta Q4 vs F16 |
|---|---|---|---|---|
| `ai2d` (diagramas) | 500 | 0,862 | 0,846 | -0,016 |
| `mapqa` (mapas) | 500 | 0,942 | 0,934 | -0,008 |
| `rico-widget` (UI) | 297 | 0,848 | 0,848 | 0,000 |
| `intergps` (geometría, no soportado) | 323 | 0,390 | 0,390 | 0,000 |

Ablación de capacidad (imagen correcta frente a imagen incorrecta):

| Dominio | Con imagen correcta | Con imagen incorrecta | Diferencia |
|---|---|---|---|
| Estilos de gráfico retenidos | 0,848 | 0,266 | +0,582 |
| Pantallas de UI | 0,848 | 0,362 | +0,486 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica de forma estricta; el modelo está pensado para CPU. En GPU, el peso del modelo ocupa entre 0,55 GB (Q4_K_M) y 1,57 GB (F16), más el proyector de visión en F16.
- GPU recomendadas: cualquier GPU con suficiente memoria para el GGUF elegido y el proyector; la model card no especifica modelos concretos (A100, H100, RTX 4090 no están documentados).
- Cabe en GPU de consumo: sí, con cualquier cuantización, dado el reducido tamaño de los pesos.
- Opciones de despliegue: llama.cpp mediante `llama-server` con `--mmproj` obligatorio; `-ngl 0` para CPU (aproximadamente un segundo por consulta) y `-ngl 99` para GPU; `-ub 2048` o superior es requisito porque la ruta Clef evalúa todo el prompt en un único lote.
- Latencia y throughput: aproximadamente un segundo por consulta en CPU con Q8_0 según la model card; no se documentan cifras de throughput en GPU.
- Endpoint: `/v1/systemone` de llama.cpp; la generación de texto devuelve HTTP 501 de forma intencionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| amaara-decide-vision (GGUF) | 0,8B | no disponible | Decisión multimodal con probabilidades calibradas | Apache-2.0 | Hugging Face, GGUF para llama.cpp |
| Qwen3.5-0.8B (base) | 0,8B | no disponible | Generación de texto e imagen-texto | Apache-2.0 | Hugging Face |
| Alternativas de decisión visual de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de decisión visual con salida calibrada en la documentación proporcionada.

## Limitaciones y advertencias

- Geometría no soportada: los resultados sobre `intergps` (0,390) se incluyen solo por completitud y reflejan la ausencia de esta capacidad.
- Los gráficos están validados sobre datos sintéticos, no sobre dashboards reales de clientes.
- La habilidad sobre diagramas está limitada por el texto de la pregunta: el 65% de la respuesta es recuperable incluso con una imagen incorrecta, lo que reduce la fiabilidad en ese dominio.
- La calibración es por bucket de número de opciones: corrige la escala, no la forma de la distribución.
- Riesgo de alucinación: no aplica en el sentido generativo (no produce texto libre), pero la elección puede ser incorrecta con alta confianza si la imagen no corresponde al dominio entrenado.
- Idioma: solo inglés; no hay soporte documentado de otros idiomas.
- Licencia Apache-2.0, que permite uso comercial; el modelo base Qwen3.5-0.8B también es Apache-2.0, pero conviene verificar los términos de los datos de entrenamiento filtrados por licencia fila a fila.
- En producción, la generación de texto está deshabilitada (HTTP 501); cualquier integración debe usar el endpoint de decisión `/v1/systemone`.
- El proyector de visión es obligatorio: sin `--mmproj` el modelo carga pero no procesa imágenes.
- El repositorio tiene 0 descargas en el momento de la consulta, por lo que no hay validación comunitaria documentada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/theatechcorporation/amaara-decide-vision-GGUF
- Modelo base: https://huggingface.co/theatechcorporation/amaara-decide-vision
- Modelo base de origen: https://huggingface.co/unsloth/Qwen3.5-0.8B
- Proyector de visión: https://huggingface.co/theatechcorporation/amaara-decide-vision-GGUF/blob/main/mmproj-amaara-decide-vision-f16.gguf
- llama.cpp: https://github.com/ggml-org/llama.cpp
