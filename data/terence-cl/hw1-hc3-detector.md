# terence-cl/hw1-hc3-detector

## Resumen

`terence-cl/hw1-hc3-detector` es un modelo de clasificación de texto publicado en Hugging Face por el usuario terence-cl. Se distribuye en formato safetensors, está etiquetado con la arquitectura `bert` y expone el pipeline `text-classification`. El dato objetivo más relevante es su tamaño: 22.713.986 parámetros, lo que lo sitúa muy por debajo de un BERT-base estándar (unos 110 millones) y en el rango de las variantes compactas de la familia BERT. El repositorio ocupa 0,1 GB.

El nombre del modelo sugiere dos cosas que **no están confirmadas** por ninguna fuente: que se trata de un ejercicio académico ("hw1") y que su tarea objetivo es la detección de texto generado por ChatGPT sobre el corpus HC3 (Human ChatGPT Comparison Corpus). Ninguna de las dos afirmaciones puede verificarse con la información disponible; deben tratarse como hipótesis, no como hechos. La model card publicada es la plantilla autogenerada de Hugging Face, sin ninguna sección completada.

Su relevancia actual es limitada: acumula 9 descargas y 0 "likes", no declara licencia ni idiomas, y no aporta datos de entrenamiento ni de evaluación. Es un artefacto útil únicamente como punto de partida experimental o como referencia para reproducir un clasificador ligero, no como componente listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (según etiqueta del Hub); configuración concreta no disponible |
| Parametros totales | 22.713.986 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; los pesos se publican en safetensors (se puede aplicar cuantización estándar a posteriori) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Pipeline declarado | text-classification |
| Tamaño del repositorio | 0,1 GB |
| Fecha de publicación en el Hub | 2026-09-19 (según el registro del Hub) |
| Descargas / likes | 9 / 0 |
| Compatibilidad de despliegue | Etiquetas `text-embeddings-inference` y `endpoints_compatible` |

## Arquitectura y entrenamiento

La única información sobre la arquitectura es la etiqueta `bert` del Hub y el recuento real de parámetros del archivo safetensors: 22.713.986. Ese recuento es incompatible con un BERT-base (110 millones de parámetros) y con un DistilBERT (66 millones), y apunta a una configuración compacta —menos capas o dimensión oculta reducida, o ambas—, pero la configuración exacta (número de capas, cabezas de atención, dimensión oculta, vocabulario) no está publicada. No se dispone de información sobre la cabeza de clasificación ni sobre el número de clases de salida.

No hay ningún dato sobre el proceso de entrenamiento: ni volumen de tokens, ni composición del dataset, ni si se aplicó ajuste fino supervisado, RLHF o DPO. Tampoco se documentan hiperparámetros, precisión de entrenamiento (fp32/fp16/bf16) ni infraestructura de cómputo. La model card es la plantilla por defecto de Hugging Face y todos sus campos relevantes aparecen como `[More Information Needed]`.

Conviene una advertencia técnica: la etiqueta `arxiv:1910.09700` que aparece en el Hub **no** es el paper del modelo. Corresponde a Lacoste et al. (2019), el artículo del calculador de impacto medioambiental de aprendizaje automático, que Hugging Face inserta automáticamente en la plantilla de model card. No debe interpretarse como una referencia metodológica del modelo.

## Capacidades

- Clasificación de texto: es la única capacidad confirmada por el pipeline declarado. El modelo recibe texto y devuelve una etiqueta de clase (el número y la semántica de las clases no están documentados).
- Extracción de representaciones: por su arquitectura tipo BERT, es razonable esperar que el encoder pueda usarse para generar embeddings de secuencia, aunque no hay confirmación de que se hayan publicado pesos adecuados para esa función.
- Detección de texto generado por IA: capacidad plausible por el nombre del modelo, pero **no verificada** en ninguna fuente.
- Generación de texto: no aplica. Es un modelo encoder de clasificación, no un modelo causal de lenguaje.
- Razonamiento, matemáticas, código: no aplica ni está documentado.
- Tool calling / function calling: no disponible; no hay evidencia de soporte.
- Agentes y razonamiento multi-paso: no disponible; no hay evidencia.
- Capacidades multilingües: no disponible; no se declara ningún idioma.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Filtrado de corpus para entrenamiento: usar el clasificador como etapa de cribado para separar texto humano de texto sintético antes de construir un dataset. Requiere validar antes el rendimiento real, que no está publicado.
- Moderación de contenido en foros o secciones de comentarios: clasificación binaria de mensajes con un modelo de 22,7 millones de parámetros que puede ejecutarse en CPU con latencia de milisegundos.
- Pre-etiquetado para anotación humana: generar etiquetas automáticas sobre grandes volúmenes de texto y reservar la revisión manual para los casos de baja confianza, reduciendo el coste de anotación.
- Detección de ensayos generados por IA en contextos educativos: aplicación directa si la hipótesis HC3 es correcta, pero con la advertencia explícita de que un clasificador de este tipo produce falsos positivos y no debe usarse como única prueba en decisiones disciplinarias.
- Enrutado en pipelines RAG: clasificar la consulta entrante para decidir si se responde con recuperación documental o se deriva a otro componente, dado el bajo coste de inferencia.
- Control de calidad en generación de contenido: puntuar salidas de un LLM antes de publicarlas y descartar automáticamente las que no superen un umbral de confianza.
- Investigación sobre detección de texto sintético: servir como baseline reproducible de tamaño reducido frente a detectores más grandes, siempre que se reconstruya el conjunto de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna sección de evaluación completada, no se declara conjunto de test, métrica (exactitud, F1, AUC) ni comparación con otros modelos. Cualquier cifra que se atribuya a este modelo sería inventada.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 91 MB de pesos (22.713.986 × 4 bytes); en fp16/bf16, unos 45 MB; en int8, unos 23 MB. El consumo real de memoria será algo superior por activaciones y overhead del runtime, pero en cualquier caso por debajo de 1 GB.
- GPU recomendadas: no requiere GPU. Cualquier GPU con más de 1 GB de memoria libre es suficiente; una NVIDIA T4, una GTX 1650 o una RTX 3060 estarían sobradamente dimensionadas para el modelo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo de los últimos diez años, e incluso en CPU sin problema.
- Opciones de despliegue: la librería declarada es `transformers`; las etiquetas del Hub indican compatibilidad con Text Embeddings Inference (TEI) y con Inference Endpoints. También es viable exportarlo a ONNX o cuantizarlo con las herramientas habituales, aunque no hay confirmación de que el autor lo haya hecho.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones.
- Nota: dado el tamaño del repositorio (0,1 GB), el modelo puede cargarse en memoria por completo incluso en entornos muy restringidos, incluidos contenedores serverless.

## Comparativa con modelos similares

La comparación se limita a parámetros, contexto, licencia y disponibilidad, porque no existen métricas publicadas para este modelo.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| terence-cl/hw1-hc3-detector | 22,7 M | No disponible | No disponible | 9 descargas, 0 likes; model card vacía |
| bert-base-uncased | 110 M | 512 tokens | Apache 2.0 | Muy amplia; millones de descargas |
| distilbert-base-uncased | 66 M | 512 tokens | Apache 2.0 | Muy amplia; usado como baseline estándar |
| roberta-base | 125 M | 512 tokens | MIT | Muy amplia; referencia en clasificación de texto |

El modelo analizado es aproximadamente cinco veces más pequeño que un BERT-base, lo que sugiere un coste de inferencia muy inferior, pero también una capacidad de representación presumiblemente menor. Al no existir datos de evaluación ni licencia, no puede competir en igualdad de condiciones con ninguna de las alternativas: las tres opciones de la tabla ofrecen documentación completa, licencia explícita para uso comercial y resultados de referencia publicados.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. Al no documentarse el dataset de entrenamiento, no es posible auditar sesgos de género, raza, ideología o registro lingüístico. Cualquier uso en decisiones que afecten a personas es desaconsejable sin una evaluación previa.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe el riesgo equivalente de **falsos positivos**: clasificar texto humano como generado por IA. La magnitud de ese error es desconocida porque no hay métricas publicadas.
- Limitaciones de contexto e idioma: se desconoce la longitud máxima de secuencia admitida y los idiomas soportados. Si el modelo deriva del corpus HC3, es probable que esté centrado en inglés y chino, pero esto no está confirmado y debe verificarse empíricamente antes de desplegarlo.
- Restricciones de licencia: la licencia no está declarada. En la práctica, esto significa que **no hay autorización explícita de uso comercial** y que el marco legal de explotación es ambiguo. Es un bloqueo serio para cualquier integración en producto.
- Trazabilidad nula: la model card es la plantilla autogenerada. No hay autor identificable, paper, repositorio de código ni descripción del entrenamiento. No se puede reproducir el modelo ni auditar su procedencia.
- Ausencia de mantenimiento: 9 descargas y 0 likes, con fechas de creación y actualización separadas por segundos, indican una subida puntual sin revisión posterior.
- Riesgo de falsa equivalencia: la etiqueta `arxiv:1910.09700` es un artefacto de la plantilla de Hugging Face, no una referencia al modelo. Citar ese paper como fuente del modelo sería un error.
- Para producción: no usar sin antes (1) aclarar la licencia con el autor, (2) construir un conjunto de evaluación propio y medir precisión, exhaustividad y F1, y (3) analizar la tasa de falsos positivos sobre la distribución real de datos de destino.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/terence-cl/hw1-hc3-detector
- Paper referenciado en la etiqueta del Hub (calculador de impacto medioambiental, no es el paper del modelo): https://arxiv.org/abs/1910.09700
- Repositorio de código: no disponible
- Demo: no disponible
- Documentación adicional, blog o dataset de entrenamiento: no disponible
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los resultados obtenidos correspondían a un asistente conversacional sin relación alguna con el modelo analizado.
