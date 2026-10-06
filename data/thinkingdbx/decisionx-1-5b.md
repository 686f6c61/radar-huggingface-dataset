# thinkingdbx/DECISIONx-1.5B

## Resumen

DECISIONx-1.5B es un modelo de decisión desarrollado por thinkingdbx que responde a preguntas tipadas sobre un fragmento de texto y devuelve probabilidades calibradas. No genera texto: en una única pasada forward recibe un estado (state), una pregunta y un conjunto de opciones, y devuelve la mejor opción junto con una probabilidad para cada una. Resuelve las decisiones pequeñas dentro del software (a qué cola va un ticket, si un correo es spam, cuánta urgencia tiene un incidente) de forma que el resultado pueda usarse directamente en una sentencia `if`.

El modelo se construye como un adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct, por lo que hereda la arquitectura transformer y el tama�o de 1.500 millones de parámetros del base, mientras que el repositorio publicado contiene únicamente los pesos del adaptador (0,1 GB). Es relevante porque propone un formato de tres tipos de pregunta —`choice` (elegir entre una lista arbitraria de opciones), `score` (estimar una puntuación en una escala) y `null` (probabilidad de que un enunciado sea verdadero)— y porque sus opciones no necesitan haberse visto durante el entrenamiento.

El interés práctico está en su calibración: con solo 20-60 ejemplos etiquetados de una tarea nueva, ajusta una temperatura y un sesgo por opción para esa tarea, mejorando la ubicación del umbral de decisión y la honestidad de la confianza. En nueve tareas completamente retenidas alcanza una exactitud media de 0,792 sin calibrar y 0,829 con 32 ejemplos, con un error de calibración esperado (ECE) que baja de 0,089 a 0,053.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2.5-1.5B-Instruct) con adaptadores LoRA (PEFT) |
| Parametros totales | 1.500 millones en el modelo base; el repositorio contiene solo el adaptador (0,1 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card; heredada del modelo base Qwen2.5-1.5B-Instruct |
| Tipos de cuantizacion | no disponible (los adaptadores PEFT se distribuyen en precision de entrenamiento) |
| Idiomas soportados | ingles (en) |
| Licencia | decisionx-research (licencia "other", nombre de licencia personalizado) |
| Formato de pesos | safetensors (adaptadores LoRA sobre PEFT) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen2.5-1.5B-Instruct, un transformer decoder de 1.500 millones de parámetros, y le aplica un ajuste fino con LoRA gestionado mediante la librería PEFT. La innovación no está en el backbone, sino en la formulación de la tarea: en lugar de generar texto, el modelo procesa una pregunta tipada (`choice`, `score` o `null`) y produce probabilidades calibradas en una sola pasada forward. Las opciones pueden ser cualquier lista, en cualquier orden, y no es necesario que hayan aparecido en el entrenamiento.

La model card enumera un conjunto amplio de datasets utilizados durante el ajuste: clasificación de intenciones y atención al cliente (banking77, clinc_oos, Bitext, MASSIVE), sentimiento y reseñas (dair-ai/emotion, tweet_eval, Yelp, Amazon reviews, TripAdvisor, app_reviews), inferencia natural y verificación de hechos (SNLI, ANLI, FEVER, BoolQ), similitud semántica (STS12, STS14, SICK-R, GLUE), elección múltiple y sentido común (commonsense_qa, ai2_arc, openbookqa, HellaSwag) y noticias (ag_news). No se especifica en la información proporcionada el número exacto de tokens de entrenamiento, la composición proporcional del dataset ni si se emplearon etapas explícitas de RLHF o DPO. La componente de calibración se ajusta en tiempo de inferencia mediante validación cruzada sobre los ejemplos etiquetados del usuario, con temperaturas y sesgos indexados por el texto de la opción, de modo que el orden de las opciones no altera el resultado.

## Capacidades

- Clasificación y decisión tipada en una sola pasada forward: preguntas de tipo `choice`, `score` y `null`.
- Opciones arbitrarias y no vistas: la lista de opciones no necesita haberse observado durante el entrenamiento ni seguir un orden concreto.
- Devolución de probabilidad calibrada por opción, apta para usarse directamente como umbral en código.
- Puntuación en escalas con etiquetas opcionales: devuelve la puntuación esperada, su dispersión y la distribución completa.
- Calibración de tareas nuevas con 20-60 ejemplos etiquetados (temperatura más sesgo por opción).
- Clasificación zero-shot sobre nuevos conjuntos de etiquetas, dominios y formulaciones.
- No genera texto: la salida es siempre probabilística y estructurada.
- Capacidades multilingües: no disponibles; el modelo declara únicamente ingles.

## Casos de uso

- Enrutado de tickets de soporte: dado el texto de una incidencia y una lista de equipos (facturación, envíos, soporte técnico, seguridad de cuenta), el modelo devuelve la opción más probable con su probabilidad, como se observa en el ejemplo de la model card (billing, 0,92). Encaja en un flujo de triaje donde el umbral se evalúa con un `if`.
- Detección de spam en correo: con una pregunta `null` ("This email is spam"), el modelo da la probabilidad de que el correo sea spam. Requiere calibrar con ejemplos propios porque la model card advierte de que, sin calibrar, puede colocar mal el umbral aunque la ordenación sea correcta (0,149 para un correo de crucero frente a 0,0006 para un correo de planificación).
- Priorización de incidentes: usando el tipo `score` sobre una escala de urgencia (1-5), devuelve la puntuación esperada y su dispersión, útil para ordenar una cola de incidentes (ejemplo: base de datos caída, 3,9 ± 1,0, moda 4).
- Análisis de sentimiento y reseñas: clasificación de reseñas de producto, restaurantes o aplicaciones en categorías de valoración, tarea para la que el modelo se entrenó con Yelp, Amazon reviews, TripAdvisor y app_reviews.
- Clasificación de noticias y temas: asignación de artículos a categorías (por ejemplo, las 14 categorías de DBpedia, con 0,930 de exactitud en una tarea no vista), para alimentar sistemas de recomendación o indexado temático.
- Clasificación de intenciones en asistentes conversacionales: con 60 intenciones (conjunto MASSIVE) el modelo alcanza 0,735 sin calibrar y 0,750 con calibración; sirve para dirigir una conversación a la habilidad adecuada.
- Verificación de afirmaciones y análisis de contenido: preguntas `null` sobre si un enunciado es verdadero, aplicables a la detección de afirmaciones contrafactuales (0,900) o a la moderación de toxicidad (0,867, mejorable a 0,879 con calibración).
- Filtrado de correo corporativo (Enron): detección de spam en el dominio Enron, donde la calibración con 32 ejemplos eleva la exactitud de 0,615 a 0,905, un caso claro de adaptación rápida a un dominio nuevo.

## Benchmarks y rendimiento

Resultados en nueve tareas completamente retenidas del entrenamiento (nuevos conjuntos de etiquetas, dominios y formulaciones), comparados con la línea base de responder siempre la etiqueta más frecuente:

| Tarea | Tipo | DECISIONx | + calibracion (32 ejemplos) | Etiqueta mas comun |
|---|---|---|---|---|
| DBpedia — 14 categorias | choice | 0,930 | 0,931 | 0,102 |
| Rotten Tomatoes — critico recomienda? | null | 0,922 | 0,918 | 0,505 |
| Enunciados contrafactuales | null | 0,900 | 0,896 | 0,888 |
| Toxicidad | null | 0,867 | 0,879 | 0,902 |
| Noticias financieras — bajista/alcista/neutro | choice | 0,832 | 0,846 | 0,687 |
| TREC — tipo de pregunta (6) | choice | 0,818 | 0,818 | 0,276 |
| MASSIVE — intenciones del asistente (60) | choice | 0,735 | 0,750 | 0,072 |
| Enron — spam? | null | 0,615 | 0,905 | 0,507 |
| SST-5 — estrellas de resena (1-5) | score | 0,507 | 0,515 | 0,297 |
| Media | | 0,792 | 0,829 | 0,470 |

Error de calibración esperado (ECE) en estas tareas: 0,089 sin calibrar, 0,053 con 32 ejemplos y 0,046 con 64.

| Ejemplos etiquetados por tarea | 0 | 8 | 16 | 32 | 64 |
|---|---|---|---|---|---|
| Exactitud media (9 tareas no vistas) | 0,792 | 0,817 | 0,824 | 0,829 | 0,835 |

Cada cifra de calibración es la media de 20 extracciones aleatorias de ejemplos, evaluada sobre el resto de la tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: en el entorno de precisión del adaptador sobre el base de 1.500 millones de parámetros, aproximadamente 3-4 GB en FP16/BF16; en cuantización de 4 bits del base bajaría a alrededor de 1-2 GB (los tipos de cuantización no se detallan en la model card).
- GPU recomendadas: cualquier GPU con 8 GB o más (RTX 3060, RTX 4060, RTX 4070, RTX 4090, A10, L4). Los ejemplos de la model card se ejecutan también en CPU sin calibración, por lo que el modelo es viable sin GPU.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU consumer actuales con 6 GB o más de VRAM.
- Opciones de despliegue: la model card documenta un paquete de inferencia ligero (`decisionx.model.DecisionModel`) que se distribuye junto con los pesos y usa `transformers` + `peft` + `safetensors`, con selección de dispositivo `cuda` o `cpu`. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput estimados: no disponibles en la información proporcionada; al tratarse de una única pasada forward sobre un modelo de 1,5B, la inferencia es sensiblemente más rápida que la generación autoregresiva de un modelo del mismo tamaño, pero no se aportan cifras.

## Comparativa con modelos similares

En la información proporcionada no se incluyen modelos alternativos de la misma categoría (modelo de decisión con salida probabilística calibrada sobre backbone de 1,5B), por lo que la comparativa directa es "no disponible". Como referencia objetiva, se incluye el modelo base sobre el que se construye:

| Modelo | Parametros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DECISIONx-1.5B | 1,5B (base) + adaptador LoRA | heredado de Qwen2.5-1.5B-Instruct | Probabilidades calibradas (`choice`/`score`/`null`) | decisionx-research | HuggingFace (pesos del adaptador) |
| Qwen2.5-1.5B-Instruct | 1,5B | contexto nativo del modelo base | Texto generado | licencia del modelo base Qwen | HuggingFace |

No se dispone de datos de benchmark de terceros comparables en la información facilitada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto; solo devuelve probabilidades y etiquetas, por lo que no sirve para tareas de redacción, resumen o diálogo.
- Idioma: solo declara soporte de ingles; cualquier uso en castellano u otros idiomas no está cubierto ni evaluado.
- Calibración dependiente de la tarea: la propia model card señala el spam como su principal debilidad. Sin calibrar, en tareas no vistas puede colocar mal el umbral aunque la ordenación sea correcta (ejemplo: un correo de crucero con 0,149 frente a un correo de planificación con 0,0006, una diferencia de 230× en la ordenación pero una probabilidad absoluta mal situada).
- Riesgo de falso positivo o falso negativo en dominios fuera de entrenamiento: la línea base de enrutado sin calibración (Enron, 0,615) muestra que el rendimiento puede caer por debajo de alternativas triviales; la calibración lo corrige (0,905), pero exige etiquetar ejemplos.
- Rendimiento flojo en tareas de escala fina: en SST-5 (1-5 estrellas) la exactitud es 0,507, apenas por encima o en línea con la etiqueta más común (0,297), lo que indica dificultad para discriminar grados sutiles.
- Dependencia de ejemplos etiquetados: las mejoras de calibración requieren 20-60 ejemplos representativos por tarea; sin ellos la confianza no es fiable.
- Licencia: la licencia es "decisionx-research" (categoría "other"), un nombre personalizado no estándar. No se especifican en la información proporcionada las condiciones de uso comercial, por lo que debe verificarse antes de cualquier uso en producción.
- Sesgos: no se documentan sesgos específicos en la información facilitada; al heredar el backbone Qwen2.5-1.5B-Instruct y entrenarse sobre datasets mayoritariamente en inglés, es razonable esperar los sesgos propios de esos datos, aunque no se cuantifican.
- Alucinación: al no generar texto, no aplica la alucinación en el sentido habitual; el riesgo equivalente es una probabilidad mal calibrada o una clasificación incorrecta en dominios no vistos.
- Metadatos de adopción mínimos: en el momento de la consulta el modelo registra 0 descargas y 0 likes, y el repositorio es muy reciente (creado el 06-10-2026), por lo que no existe validación independiente de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thinkingdbx/DECISIONx-1.5B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Paper, blog o repositorio adicional: no disponible en la información proporcionada
