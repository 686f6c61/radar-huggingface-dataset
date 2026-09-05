# VoxSign/Speech-to-Gloss

## Resumen

VoxSign/Speech-to-Gloss es un modelo de lenguaje entrenado para convertir texto en inglés en una representación en glosas de la Lengua de Signos de Uganda (USL). Desarrollado por VoxSign, el modelo es un fine-tuning de `google/flan-t5-base`, un modelo secuencia a secuencia (encoder-decoder) con 247.577.856 parámetros. La tarea consiste en transformar una frase en inglés en una cadena plana de tokens en mayúsculas, sin puntuación y sin marcas gramaticales, siguiendo la convención de `USL_GLOSS_SPEC.md`.

El modelo resuelve el problema de proporcionar una aproximación automática de glosas de USL a partir de texto inglés, lo que resulta útil como componente en sistemas de accesibilidad para personas sordas. Su relevancia radica en que ofrece una primera capa de traducción textual en un dominio con escasez de recursos lingüísticos. No obstante, no se trata de una traducción completa a la lengua de signos: la salida no incorpora concordancia espacial, predicados clasificadores ni marcadores no manuales, y el propio autor indica que no es la ruta de producción principal de VoxSign, sino un sistema auxiliar con validación y fallback.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | T5 (encoder-decoder Transformer, seq2seq) |
| Parámetros totales | 247.577.856 |
| Parámetros activos | No es aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés (entrada); salida en glosas de USL basadas en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `google/flan-t5-base`, un transformer encoder-decoder con atención relativa y sesgo de posición. Se entrena con el dataset `VoxSign/USL-Gloss`, que contiene pares de frases en inglés y glosas de USL. Todos los ejemplos de entrenamiento llevan el prefijo de tarea `translate English to USL gloss: `, que es obligatorio también en inferencia. Los objetivos de entrenamiento están en minúsculas; las mayúsculas se aplican en el momento de servir.

Una particularidad destacable es que las glosas de entrenamiento fueron generadas por un motor de reglas determinista de VoxSign, que reproduce el 90,4% de dichos objetivos exactamente. Por tanto, el modelo se ajusta a la salida de ese motor y tiene un techo estructural: puede acercarse al motor desde abajo, pero no superarlo, al tiempo que introduce una tasa de alucinación propia. VoxSign recomienda no usar el modelo como ruta principal; el motor de reglas es el que se despliega por defecto.

## Capacidades

- Generación de texto a texto para la tarea específica de conversión de inglés a glosas de USL.
- Sigue una convención de salida determinada: tokens en mayúsculas, sin puntuación, con separadores ` // ` cuando la entrada se segmenta en cláusulas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe limitada al inglés en la entrada; la salida es un vocabulario de glosas basado en inglés.
- No produce traducción completa a la lengua de signos: no modela gramática visoespecial ni elementos no manuales.

## Casos de uso

- **Subtitulado accesible para personas sordas en Uganda**: el modelo convierte subtítulos en inglés en glosas de USL. Requiere segmentación previa en cláusulas, validación de la salida y fallback al motor de reglas si la validación falla.
- **Prototipos de sistemas de traducción con avatares**: la salida en glosas puede alimentar un sistema de animación de un avatar que ejecuta los movimientos, como paso intermedio en una pipeline de traducción.
- **Generación de datos para investigación en lengua de signos**: permite producir pares inglés-glosa a partir de corpus en inglés, útiles para entrenar o evaluar otros modelos, aunque exige limpieza y validación.
- **Apoyo educativo en aulas bilingües**: en contextos donde la lengua de signos es la lengua natural y el inglés es la lengua escrita, el modelo puede generar glosas como material visual de apoyo.
- **Comparación con interpretaciones humanas**: en formación de intérpretes, se pueden generar glosas de referencia automáticas y contrastarlas con las realizadas por estudiantes.
- **Accesibilidad en contenido web**: el modelo puede integrarse en sistemas que transforman artículos o noticias en inglés en glosas para facilitar la comprensión lectora a usuarios sordos.

## Benchmarks y rendimiento

Los datos de rendimiento declarados por el autor corresponden al conjunto de prueba de referencia `VoxSign USL Gloss — hand-authored gold test set v2` (308 filas escritas a mano). Los resultados están marcados como no verificados.

| Métrica | Valor |
|---|---|
| BLEU (sacreBLEU, strict) | 85,07 |
| chrF++ (strict) | 94,37 |
| Exact match (strict, %) | 69,8 |

El autor señala que el motor de reglas determinista supera a este modelo en 3,8 puntos de BLEU y 11 puntos de exact match sobre el mismo conjunto de prueba. No se dispone del valor de chrF para el motor de reglas. Además, el modelo no puede superar el rendimiento del motor porque sus objetivos de entrenamiento fueron generados por ese motor.

## Requisitos de hardware

- Estimación de VRAM para inferencia: a partir de los 247 millones de parámetros, los pesos ocupan aproximadamente 0,5 GB en bfloat16 y 1 GB en float32. Con activaciones y buffers para secuencias cortas, se estima un consumo total de 1-2 GB, pero no hay mediciones oficiales.
- GPU recomendadas: cualquier GPU con sm_80 o superior (A100, H100, RTX 3090/4090) puede usar bfloat16, tal como recomienda el autor. En GPUs Turing o anteriores (T4, V100) se debe emplear float32, ya que T5 no es estable en float16.
- Puede ejecutarse en CPU, aunque con mayor latencia, al tratarse de un modelo relativamente pequeño.
- Opciones de despliegue: Transformers con PyTorch, Text Generation Inference (TGI) y Hugging Face Inference Endpoints.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la categoría de glosas de USL. El modelo deriva de `google/flan-t5-base`, cuyo rendimiento en tareas de generación general es conocido, pero no hay benchmarks comparables en esta tarea específica. VoxSign señala que su motor de reglas interno es la alternativa principal y supera al modelo en BLEU y exact match, pero no es un modelo de aprendizaje automático.

## Limitaciones y advertencias

- No es un traductor de lengua de signos: no capta concordancia espacial, predicados clasificadores, marcadores no manuales (posición de cejas, negación con cabeza), direccionalidad verbal ni cambio de rol.
- El modelo no es la ruta de producción principal; el motor de reglas de VoxSign lo supera y carece de la tasa de alucinación que el modelo introduce.
- Los objetivos de entrenamiento fueron generados por el motor de reglas, lo que impone un techo estructural al rendimiento.
- Riesgo de alucinación: puede emitir tokens no derivables de la entrada; es necesario aplicar validación y fallback.
- Nunca cargar ni entrenar T5 en float16; usar bfloat16 en Ampere o float32 en GPUs anteriores. Una T4 (Turing) no tiene soporte bfloat16.
- La entrada debe segmentarse en cláusulas; alimentar frases largas completas degrada la calidad.
- El prefijo `translate English to USL gloss: ` es obligatorio; si se omite, el comportamiento es impredecible.
- Se recomienda fijar una revisión específica (SHA) en lugar de `main`, ya que cada push de entrenamiento mueve `main`.
- Solo trabaja con inglés como idioma de entrada.
- Los benchmarks publicados no están verificados y fueron medidos en un conjunto de prueba de 308 filas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VoxSign/Speech-to-Gloss
- Organización VoxSign Technologies en Hugging Face: https://huggingface.co/VoxSign3
- Dataset VoxSign/USL-Gloss: https://huggingface.co/datasets/VoxSign/USL-Gloss
- Modelo base google/flan-t5-base: https://huggingface.co/google/flan-t5-base
