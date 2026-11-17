# theatechcorporation/amaara-decide-vision

## Resumen

amaara-decide-vision es un modelo de decisión estructurada con capacidades de visión desarrollado por The A-Tech Corporation PTY LTD (Queensland, Australia). A diferencia de un modelo conversacional convencional, no genera texto: recibe una imagen, una pregunta y un conjunto de opciones, y devuelve en un único forward pass una elección acompañada de una distribución de probabilidad calibrada sobre todas las opciones. Está construido sobre `unsloth/Qwen3.5-0.8B`, un modelo visión-lenguaje de 0,8B parámetros con licencia Apache-2.0.

El modelo resuelve un problema concreto: cuando se pregunta a un modelo de chat "¿qué segmento es el más grande?" sobre un gráfico, se obtiene un párrafo de explicación no deseado y una afirmación que no se puede umbralizar. Este modelo devuelve directamente una distribución sobre las opciones y termina, típicamente en menos de un segundo en CPU. Su nicho son gráficos de negocio, widgets de interfaz de usuario, mapas con preguntas sí/no y diagramas.

La relevancia técnica está en su evaluación mediante ablación con imagen incorrecta: mide si el modelo realmente lee la imagen o responde a partir del texto de la pregunta. En gráficos held-out logra un delta de +0,58 a +0,61 entre imagen correcta e incorrecta, con ECE de 0,036-0,042. El modelo está publicado con pesos safetensors y GGUF, y su cabeza Clef es una arquitectura de primera clase en llama.cpp.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer visión-lenguaje (base Qwen3.5-0.8B) con cabeza Clef joint-schema para decisión estructurada |
| Parámetros totales | 873.438.784 (safetensors); 699M según model card, de los cuales 38,1M entrenables (5,46%) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens (tokens de imagen más esquema de opciones) |
| Tipos de cuantización | GGUF Q8_0 (versión recomendada); pesos safetensors en bf16; QLoRA 4-bit para entrenamiento |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, `joint_head.safetensors`, `joint_head_config.json`) y GGUF (`amaara-decide-vision-v3-cal2-Q8_0.gguf` + `mmproj-vision-v3-F16.gguf`) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen3.5-0.8B`, un transformer visión-lenguaje, y le añade una cabeza Clef de esquema conjunto (joint-schema head) que transforma la tarea de generación en una tarea de puntuación de opciones. En lugar de decodificar tokens de texto, el modelo evalúa todo el prompt (tokens de imagen más el esquema de opciones) en un único batch y produce una distribución de probabilidad sobre las opciones. Las temperaturas de calibración están embebidas en el GGUF bajo claves `clef.decision.temperature.*`, de modo que las probabilidades son utilizables directamente como umbrales.

El entrenamiento se realizó con Unsloth `FastDecisionModel` y QLoRA de rango 16 en 4-bit con cómputo bf16, durante 2.000 pasos, sobre una única RTX 5060 Ti de 16 GB en Windows 11 nativo. El conjunto de datos comprende 15.967 filas sobre 10.249 imágenes únicas: por un lado, `tasksource/tasksource-jev-typed-decisions` en su configuración de visión, restringido a licencias comerciales o sin especificar (excluyendo 10.000 filas no comerciales), con subconjuntos de diagramas (ai2d), mapas sí/no (mapqa), widgets de Android (rico-widget) y geometría (intergps); por otro, 8.000 gráficos de negocio sintéticos generados específicamente para este modelo bajo CC0, incluyendo barras, líneas, tartas y tablas, con ground truth calculado a partir de los números subyacentes. Aproximadamente el 75% de esos gráficos carecen de etiquetas de valor y el 35% tienen ejes que no empiezan en cero, forzando al modelo a leer el eje.

La decisión de diseño más relevante es el split por hash de imagen y no por fila: el dataset original tenía 14.199 filas sobre solo 9.917 imágenes únicas, con un 43% de filas que comparten imagen con otra fila. Un split por fila habría colocado el mismo diagrama en entrenamiento y validación, midiendo memorización. Se verificó cero solapamiento de imágenes entre train y holdout. La versión anterior del modelo tenía la familia de gráficos invertida (0,325 con el gráfico correcto frente a 0,450 con el de otra fila); la corrección mediante los 8.000 gráficos sintéticos llevó el delta a +0,58/+0,61 sobre estilos nunca vistos en entrenamiento.

## Capacidades

- Decisión estructurada sobre opciones: devuelve una elección y una probabilidad calibrada para cada opción en un único forward pass.
- Comprensión de gráficos de negocio: barras, líneas, tartas y tablas, incluyendo casos sin etiquetas de valor y con ejes que no arrancan en cero.
- Comprensión de widgets de interfaz de usuario Android (conjunto rico-widget).
- Preguntas sí/no sobre mapas (conjunto mapqa).
- Comprensión de diagramas (conjunto ai2d), con la salvedad de que la habilidad está limitada por el texto de la pregunta.
- Calibración de probabilidades integrada en los pesos GGUF, utilizable como umbral directamente.
- Servicio mediante endpoint `/v1/systemone` en llama.cpp, con entrada de imagen en base64 y esquema de preguntas tipadas.
- No soporta generación de texto: el servidor devuelve 501 ante peticiones de generación, por diseño.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de un agente conversacional.
- No soporta geometría (triángulos, ángulos inscritos): el conjunto intergps está incluido solo por completitud y su delta es +0,043.
- Idioma: únicamente inglés.

## Casos de uso

- Validación automática de dashboards y gráficos generados: el modelo puede recibir un gráfico renderizado y una pregunta como "¿qué región tiene mayores ingresos?" y devolver una distribución calibrada, permitiendo umbralizar y marcar gráficos sospechosos antes de publicarlos. Es adecuado porque su delta con imagen incorrecta es de +0,58 a +0,61, lo que indica que lee el gráfico y no la pregunta.

- Enrutamiento y control de calidad en pipelines de generación de informes: en lugar de pedir a un LLM que explique el gráfico, se obtiene una probabilidad por opción y se puede decidir automáticamente si el gráfico cumple un criterio (por ejemplo, "¿el segmento mayor supera el 50%?"). La calibración ECE de 0,036-0,042 permite fijar umbrales con significado estadístico.

- Extracción de decisiones sobre capturas de interfaz de usuario: dado un screenshot de una app Android y una pregunta sobre un widget, el modelo devuelve la opción elegida con probabilidad. Útil en testing automatizado de UI, verificación de estados de pantalla y generación de aserciones en suites de QA.

- Preguntas de verificación sobre mapas: el modelo responde sí/no sobre mapas con una precisión de 0,942 y ECE de 0,020, lo que lo hace apto para tareas de validación geográfica simple donde se necesita una respuesta binaria fiable y no una explicación.

- Moderación y triaje de contenido visual estructurado: cuando se necesita clasificar una imagen entre un conjunto cerrado de categorías y se requiere una probabilidad por categoría para priorizar revisión humana, el modelo ofrece esa distribución directamente, sin coste de generación de texto.

- Despliegue en CPU de bajo coste: con `-ngl 0` y 8 hilos, el modelo corre en CPU con latencia inferior al segundo según el autor. Es adecuado para servicios de borde o entornos sin GPU donde se necesita una decisión calibrada sobre una imagen pequeña.

- Investigación en calibración de modelos visión-lenguaje: el modelo sirve como referencia reproducible de cómo evaluar si un VLM lee la imagen, mediante la técnica de ablación con imagen incorrecta y la métrica de skill normalizada.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre datos held-out, con ablación de imagen incorrecta sobre las mismas filas.

| Fuente | n | Acierto | Imagen incorrecta | Delta | ECE | Skill |
|---|---|---|---|---|---|---|
| Gráficos, estilos held-out (set A) | 500 | 0,848 | 0,266 | +0,582 | 0,042 | 0,79 |
| Gráficos, estilos held-out (set B) | 500 | 0,864 | 0,256 | +0,608 | 0,036 | 0,82 |
| Widgets de UI (rico-widget) | 297 | 0,848 | 0,362 | +0,486 | 0,032 | 0,76 |
| Mapas sí/no (mapqa) | 500 | 0,942 | 0,580 | +0,362 | 0,020 | 0,86 |
| Diagramas (ai2d) | 500 | 0,862 | 0,650 | +0,212 | 0,035 | 0,61 |
| Geometría (intergps) — no soportado | 323 | 0,390 | 0,347 | +0,043 | 0,059 | 0,07 |

La métrica skill se define como delta / (1 − acierto con imagen incorrecta), es decir, la fracción del margen de mejora que aporta realmente la imagen. Los dos conjuntos independientes de gráficos held-out coinciden con una diferencia de 0,026, lo que el autor presenta como evidencia de que la lectura de gráficos es una capacidad transferible y no un ajuste a un split concreto. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene 0,8B parámetros; en Q8_0 el GGUF ocupa aproximadamente 1 GB, más el proyector multimodal F16. En bf16 los safetensors suman 873M parámetros, alrededor de 1,7 GB. El repo completo ocupa 4,4 GB.
- GPU recomendadas: el autor entrenó en una RTX 5060 Ti de 16 GB; para inferencia basta con mucha menos memoria. Cualquier GPU consumer con 4 GB o más es suficiente.
- Cabe en GPU consumer: sí, en cualquier RTX 3060/4060/5060 o superior, e incluso en iGPU con suficiente memoria compartida.
- Despliegue recomendado: llama.cpp con `llama-server`, usando `-ngl 0 -ub 2048 --threads 8`. El flag `-ub 2048` o superior es importante porque Clef evalúa todo el prompt (tokens de imagen más esquema de opciones) en un único batch.
- Despliegue en CPU: soportado y recomendado por el autor; latencia inferior a un segundo según la model card.
- Carga de pesos completos: mediante `joint_schema_model.py` y `FastDecisionModel` de Unsloth, junto con `model.safetensors`, `joint_head.safetensors` y `joint_head_config.json`.
- Throughput y latencia detallados por hardware: no disponibles más allá de la indicación de "menos de un segundo en CPU".

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directos en la documentación proporcionada. Los modelos visión-lenguaje convencionales de tamaño similar (por ejemplo, la propia base Qwen3.5-0.8B) generan texto y no ofrecen probabilidades calibradas por opción, por lo que la comparación no es equivalente en la tarea. Se indica "no disponible" para una comparativa cuantitativa con alternativas.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| amaara-decide-vision | 0,87B | 4.096 | Decisión estructurada con visión | Apache-2.0 | safetensors, GGUF |
| Qwen3.5-0.8B (base) | 0,8B | no disponible | Visión-lenguaje generativo | Apache-2.0 | safetensors |
| Alternativas de decisión estructurada | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La geometría no está soportada: el conjunto intergps es de triángulos y ángulos inscritos, no de gráficos de negocio. Su delta es +0,043 y su ECE no alcanza el umbral. No debe usarse en geometría.
- Los gráficos están validados únicamente sobre datos sintéticos: dos conjuntos held-out de gráficos generados, no dashboards reales de clientes. Es imprescindible validar sobre imágenes propias antes de desplegar.
- La habilidad en diagramas está limitada por el texto de la pregunta: en ai2d, el 65% de las respuestas son recuperables incluso con una imagen incorrecta, por lo que el margen real que aporta la imagen es pequeño (skill 0,61).
- El modelo no genera texto por diseño; el servidor devuelve 501 ante peticiones de generación. No es apto para tareas conversacionales ni de resumen.
- Idioma limitado al inglés: no hay soporte declarado para castellano ni otros idiomas.
- Ventana de contexto de 4.096 tokens, que debe cubrir tokens de imagen más el esquema de opciones; esquemas de opciones muy grandes pueden excederla.
- Riesgo de sesgo heredado del dataset base `tasksource-jev-typed-decisions` y de los gráficos sintéticos generados; no se documentan análisis de sesgo específicos.
- Riesgo de alucinación: aunque el modelo no genera prosa, puede asignar alta probabilidad a una opción incorrecta cuando la imagen es ambigua o el estilo está fuera de distribución. La calibración reportada es sobre los conjuntos evaluados, no garantizada en dominios nuevos.
- Licencia Apache-2.0 permite uso comercial, pero el dataset base se filtró a licencias comerciales o sin especificar; conviene revisar las condiciones de las fuentes originales para usos derivados.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/theatechcorporation/amaara-decide-vision
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-0.8B
- Dataset de decisiones tipadas: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
- Unsloth (framework de entrenamiento): https://github.com/unslothai/unsloth
- llama.cpp (servidor compatible con Clef): https://github.com/ggml-org/llama.cpp
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
