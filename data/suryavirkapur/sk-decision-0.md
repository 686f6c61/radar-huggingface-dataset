# suryavirkapur/sk-decision-0

## Resumen

sk-decision-0 es un modelo de decisión desarrollado por el usuario suryavirkapur y publicado en Hugging Face. No es un modelo generativo al uso: recibe un estado o situación (un texto libre) junto con un conjunto de preguntas tipadas y devuelve probabilidades sobre las posibles respuestas. Admite tres tipos de pregunta: elección entre hasta 255 etiquetas, respuesta sí/no (que devuelve P(true)) y puntuación sobre una escala ordenada de hasta 10 niveles. Se etiqueta como "system-one" y "decision-model", en referencia a un modelo de respuesta rápida y directa frente a un razonamiento extenso.

El modelo está orientado a los idiomas árabe e inglés y se distribuye con dos variantes de pesos: bf16 (17 GB) y NF4 de 4 bits (7,2 GB). Según la model card, la variante NF4 coincide con la decisión de bf16 en el 97 % de 200 elementos de evaluación retenidos, con una precisión del 91,5 % en bf16 y del 90,5 % en NF4 sobre ese mismo conjunto. El repositorio ocupa 25,6 GB e incluye un servidor propio con API HTTP compatible con clientes TypeSafe System One.

Su relevancia radica en el enfoque: en lugar de generar texto, el modelo está diseñado para enrutar, clasificar y puntuar situaciones con salida probabilística estructurada, lo que encaja en pipelines de decisión automatizada. El autor advierte explícitamente de que las probabilidades son salidas crudas del modelo y no están calibradas, y de que los runtimes de generación de texto genéricos (vLLM, Ollama, llama.cpp) no pueden producir estas decisiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de decisión; no se detalla en la información proporcionada) |
| Parametros totales | no disponible (pesos bf16 de 17 GB) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 y NF4 (4 bits) |
| Idiomas soportados | árabe (ar) e inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la información proporcionada. La model card lo describe como un "decision model" con la etiqueta "system-one", que recibe un estado y preguntas tipadas y emite distribuciones de probabilidad sobre elecciones, respuestas booleanas y puntuaciones ordinales. No se especifica si se trata de un transformer, un MoE u otra familia de arquitectura, ni el número de parámetros, más allá del tamaño de los pesos (17 GB en bf16).

Tampoco se detallan los datos de entrenamiento (número de tokens, composición del corpus, uso de RLHF/DPO) ni innovaciones técnicas concretas. La única información de evaluación disponible es la referida a 200 elementos de decisión retenidos, sobre los que se reporta una precisión del 91,5 % en bf16 y del 90,5 % en NF4, con una coincidencia del 97 % entre ambas variantes. El modelo se sirve mediante un servidor propio incluido en el repositorio, con requisitos de Linux, GPU NVIDIA y drivers CUDA 12.8.

## Capacidades

- Clasificación por elección: selecciona una etiqueta entre hasta 255 opciones definidas por el usuario, devolviendo la distribución de probabilidad completa y un valor de confianza.
- Decisión sí/no: responde preguntas booleanas devolviendo P(true).
- Puntuación ordinal: asigna una puntuación sobre una escala ordenada de hasta 10 niveles, con leyenda de etiquetas y probabilidades por nivel.
- Procesamiento de situaciones en lenguaje natural: acepta un campo `state` con texto libre (por ejemplo, un mensaje de cliente) y preguntas con instrucciones y criterios personalizados.
- Soporte multilingüe limitado a árabe e inglés.
- Salida estructurada en JSON con probabilidades por clase, confianza y contabilidad de tokens de entrada y salida.
- API HTTP propia (`POST /v1/systemone`) con autenticación por token Bearer, además de endpoints `GET /v1/models`, `GET /health` y una página de prueba en navegador.
- Compatibilidad declarada con clientes TypeSafe System One.
- No se documentan capacidades de generación de texto libre, código, matemáticas, visión, audio, tool calling ni razonamiento multi-paso.

## Casos de uso

- Enrutamiento de mensajes de atención al cliente: el modelo recibe el texto del cliente como `state` y una pregunta de tipo `choice` con categorías (facturación, avería, otros), devolviendo la cola de destino con su probabilidad; el ejemplo de la model card ilustra exactamente este escenario en árabe.
- Triaje de urgencia: mediante una pregunta `noul` ("¿es urgente?"), se obtiene P(true) para priorizar tickets o incidencias en un sistema de soporte.
- Puntuación de severidad: con una pregunta `score` de tres niveles (leve, moderado, grave), se obtiene una puntuación ordinal y su distribución, útil para escalar incidencias según gravedad.
- Moderación o clasificación de contenido: definiendo criterios como spam, legítimo u ofensivo en una pregunta `choice`, el modelo puede etiquetar textos entrantes con probabilidades asociadas.
- Automatización de decisiones en pipelines: al exponer una API HTTP con salida JSON estructurada, puede integrarse como servicio de decisión en flujos existentes, con despliegue mediante systemd o Docker para servicio continuo.
- Procesamiento bilingüe árabe-inglés: adecuado para organizaciones que atienden a usuarios en ambos idiomas con un único modelo de clasificación y enrutamiento.
- Despliegue en GPU de consumo: la variante NF4 (7,2 GB de pesos, 7,1 GB de memoria GPU según la model card) permite ejecutar el modelo en tarjetas con 8 GB o más, manteniendo una precisión reportada del 90,5 % frente al 91,5 % de bf16.

## Benchmarks y rendimiento

| Metrica | bf16 | NF4 (4 bits) |
|---|---|---|
| Precision en 200 elementos de decision retenidos | 91,5 % | 90,5 % |
| Coincidencia de decision con bf16 | referencia | 97 % |
| Tamano de pesos | 17 GB | 7,2 GB |
| Memoria GPU indicada | 19 GB | 7,1 GB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de rendimiento son los de la model card sobre el conjunto interno de 200 elementos.

## Requisitos de hardware

- VRAM estimada: 19 GB para la variante bf16 y 7,1 GB para la variante NF4, según la model card.
- GPU recomendadas: no se especifican modelos concretos; se indica únicamente que se requiere una GPU NVIDIA con drivers CUDA 12.8 en Linux.
- GPU de consumo: la variante NF4 (7,1 GB de memoria GPU) es compatible con tarjetas de 8 GB o más, como una RTX 3060 Ti, 4060 Ti o 4070; la variante bf16 requiere al menos 19 GB, lo que excluye la mayoría de GPU de consumo y apunta a tarjetas de 24 GB (RTX 3090/4090) o profesionales (A100, H100).
- Opciones de despliegue: servidor propio incluido en el repositorio (`run.sh`, servicio systemd `sk-decision-0.service` y `Dockerfile`). El autor advierte de que vLLM, Ollama y llama.cpp no pueden producir estas decisiones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (modelos de decisión con salida probabilística estructurada para árabe e inglés), por lo que no es posible establecer una comparativa fiable con parámetros, contexto, rendimiento y licencia de alternativas.

## Limitaciones y advertencias

- Las probabilidades son salidas crudas del modelo y no están calibradas; el autor recomienda fijar umbrales a partir de datos etiquetados propios.
- Solo se declaran los idiomas árabe e inglés; no hay soporte documentado para otros idiomas.
- No se especifica la licencia, por lo que el uso comercial queda sin garantías legales explícitas hasta que el autor la defina.
- El modelo no es un generador de texto: no produce respuestas libres, código ni razonamiento multi-paso, y los runtimes de generación habituales no pueden ejecutarlo para obtener decisiones.
- Requiere Linux, GPU NVIDIA y drivers CUDA 12.8; no se documenta soporte para CPU, macOS ni otras plataformas.
- No se detallan sesgos conocidos, riesgo de alucinación ni limitaciones de contexto; la evaluación se limita a 200 elementos internos, sin benchmarks públicos independientes.
- Al ser un modelo con 0 descargas y 0 likes en el momento de la consulta, carece de validación por parte de la comunidad.
- El repositorio ocupa 25,6 GB, lo que implica un coste de almacenamiento y descarga considerable si se quieren ambas variantes de pesos.

## Enlaces

- Hugging Face: https://huggingface.co/suryavirkapur/sk-decision-0
