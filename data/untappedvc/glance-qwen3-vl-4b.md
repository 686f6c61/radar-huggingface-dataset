# untappedvc/glance-qwen3-vl-4b

## Resumen

Glance Qwen3-VL-4B es un repositorio de despliegue e integración publicado por el usuario untappedvc que combina el modelo vision-language Qwen3-VL-4B-Instruct con Glance, una librería de decisión visual basada en probabilidades desarrollada por Yohei Nakajima. El repositorio no contiene pesos propios ni un ajuste fino: en tiempo de ejecución descarga una revisión fijada del modelo upstream Qwen/Qwen3-VL-4B-Instruct y utiliza el backend nativo de Glance para proyectar el estado oculto final del modelo sobre las etiquetas de respuesta solicitadas.

El problema que resuelve es concreto: en lugar de pedir al modelo que genere una respuesta token a token, Glance puntúa directamente las etiquetas candidatas (por ejemplo Sí/No, o entre 2 y 8 opciones de respuesta múltiple) y devuelve una distribución de probabilidad acompañada de una puntuación de confianza. Esto convierte un VLM generativo de aproximadamente 4.000 millones de parámetros en un clasificador visual determinista y estructurado, con salida JSON y sin generación de texto libre.

Su relevancia es acotada pero clara para entornos de producción: elimina la variabilidad del decodificado generativo en tareas de decisión visual, expone confianza calibrable para umbrales de decisión, y se ofrece como servicio escalable a cero en Replicate sobre GPU Nvidia L40S. La licencia del modelo base es Apache 2.0, lo que facilita su uso comercial, aunque el repositorio en sí no aloja artefactos de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (Qwen3-VL) más capa de proyección de estado oculto de Glance para puntuación de etiquetas; no es un modelo nuevo |
| Parametros totales | Aproximadamente 4.000 millones (heredados de Qwen3-VL-4B-Instruct; la model card no ofrece el recuento exacto) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la model card no especifica la ventana de contexto) |
| Tipos de cuantizacion | No disponible; el repositorio no distribuye pesos cuantizados. El despliegue de referencia en Replicate carga el modelo base sin cuantizar sobre Nvidia L40S |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (modelo base); el uso de Glance queda sujeto a su licencia propia, no detallada en la información proporcionada |
| Formato de pesos | El repositorio no aloja pesos. El runtime descarga la revisión fijada de Qwen/Qwen3-VL-4B-Instruct durante la inicialización del worker |

## Arquitectura y entrenamiento

No hay entrenamiento propio. El repositorio es una integración de inferencia: el modelo base es Qwen3-VL-4B-Instruct, un transformer vision-language que procesa imagen y texto, y sobre él se aplica el backend nativo de Glance para Qwen. Glance no formula un prompt generativo ni decodifica tokens: lee el estado oculto final del modelo y puntúa directamente las etiquetas de respuesta solicitadas (Sí/No o una lista de 2 a 8 opciones), devolviendo una distribución de probabilidad normalizada.

La innovación técnica, por tanto, no está en los pesos sino en la interfaz de decisión: se sustituye la generación autoregresiva por una proyección sobre el vocabulario de etiquetas, lo que produce salidas deterministas y estructuradas con puntuación de confianza. El despliegue de referencia es escalable a cero (scale-to-zero) sobre Nvidia L40S y se expone mediante la API de Replicate, con el modelo base cargado desde la revisión upstream fijada en la fase de arranque del worker. No se documentan en la información disponible detalles sobre el dataset de entrenamiento, número de tokens, composición de datos ni fases de RLHF o DPO del modelo base.

## Capacidades

- Decisiones visuales binarias de tipo Sí/No sobre una imagen y una pregunta.
- Clasificación visual de respuesta múltiple con entre 2 y 8 opciones.
- Devolución de distribución de probabilidad completa y puntuación de confianza agregada.
- Salida estructurada en JSON sin generación de respuesta token a token.
- Integración con la API de Replicate para invocación remota con imagen en base64.
- Soporte de entrada de imagen codificada en base64 y pregunta en texto.
- No se documenta soporte de tool calling, function calling, uso agéntico multi-paso, capacidades de audio, ni modo de razonamiento explícito (thinking mode).
- No se documentan capacidades multilingües específicas ni lista de idiomas soportados.

## Casos de uso

- Verificación visual binaria en control de calidad industrial: el modelo responde a preguntas del tipo "¿la pieza presenta una grieta?" y devuelve una probabilidad, lo que permite fijar un umbral de aceptación y derivar automáticamente las piezas dudosas a revisión humana.
- Moderación de contenido visual: clasificación de imágenes en categorías predefinidas (por ejemplo, "apto", "sensible", "violento") con puntuación de confianza por etiqueta, útil para encolar revisiones cuando la probabilidad está en una banda intermedia.
- Etiquetado asistido de datasets de visión: uso como preanotador sobre grandes volúmenes de imágenes, exportando la etiqueta de mayor probabilidad junto con la confianza para priorizar la revisión manual de los casos ambiguos.
- Enrutamiento en pipelines de agentes: usar la respuesta Sí/No con confianza alta como puerta de decisión antes de invocar un modelo mayor o una acción costosa, reduciendo el gasto en generación de texto libre.
- Comercio electrónico y catálogo: clasificación de imágenes de producto en categorías cerradas (tipo de prenda, tipo de animal, presencia de un atributo concreto) sin necesidad de postprocesar texto generado.
- Verificación de inventario o logística: comprobar con respuesta binaria si un paquete o estantería contiene el artículo esperado, integrado en una línea de captura de imágenes.
- Accesibilidad y descripciones controladas: responder preguntas cerradas sobre el contenido de una imagen para flujos de asistencia donde se necesita una respuesta corta y verificable en lugar de una descripción libre.
- Investigación en calibración de VLM: aprovechar la distribución de probabilidad expuesta para estudiar la calibración y el sesgo de confianza de un modelo vision-language de 4.000 millones de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio únicamente documenta el formato de salida, el flujo de despliegue y los endpoints públicos, sin tablas comparativas de MMLU, HumanEval, GSM8K, MMMU, VQAv2 ni métricas equivalentes para tareas de visión-language.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculos orientativos a partir del tamaño del modelo base, no publicados por el autor): aproximadamente 10-14 GB en BF16/FP16 incluyendo el codificador visual y la caché KV; en torno a 6-8 GB con cuantización de 8 bits y 4-6 GB con cuantización de 4 bits.
- GPU recomendadas: el despliegue oficial de referencia utiliza Nvidia L40S (48 GB) en Replicate con escalado a cero. Para uso local, una RTX 4090 (24 GB) o una A100 (40/80 GB) ofrecen margen amplio en BF16.
- Compatibilidad con GPU de consumo: cabe en GPU de consumo de gama alta con 12 GB o más en cuantización de 4 u 8 bits; en BF16 completo requiere al menos 16 GB de VRAM.
- Opciones de despliegue: el camino documentado es Replicate con el backend nativo de Glance. Al requerir acceso al estado oculto final del modelo, los servidores que solo exponen una API de texto (Ollama, llama.cpp en modo servidor, endpoints estándar de TGI o vLLM) no son directamente compatibles con el mecanismo de Glance sin un backend en Python que cargue el modelo con transformers y exponga el estado oculto.
- Latencia y throughput: no disponibles. No se publican mediciones de latencia por petición, tokens por segundo ni coste por inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque de salida | Licencia | Disponibilidad |
|---|---|---|---|---|
| glance-qwen3-vl-4b | Aproximadamente 4.000 millones (heredados) | Puntuación directa de etiquetas con distribución de probabilidad, sin generación de texto | Apache 2.0 (base) | Repositorio de integración en HuggingFace, Space de demostración y modelo público en Replicate |
| Qwen/Qwen3-VL-4B-Instruct | Aproximadamente 4.000 millones | VLM generativo estándar (texto libre, instrucciones) | Apache 2.0 | Pesos abiertos en HuggingFace |
| Qwen2.5-VL-3B-Instruct | Aproximadamente 3.000 millones | VLM generativo estándar | Apache 2.0 | Pesos abiertos en HuggingFace |
| Modelos de clasificación visual dedicados (por ejemplo, CLIP o ViT ajustados) | Variable, habitualmente menor | Clasificación cerrada con logits, sin lenguaje natural | Variable según el modelo | Depende del modelo concreto |

Nota: los datos de contexto, benchmarks y rendimiento de los modelos comparados no se han verificado en la información proporcionada y se marcan como no disponibles. La diferencia funcional principal de glance-qwen3-vl-4b frente a las alternativas generativas es que no produce texto libre, sino una decisión con probabilidad asociada.

## Limitaciones y advertencias

- No es un modelo nuevo ni un ajuste fino: no contiene pesos propios y depende por completo de la disponibilidad de la revisión fijada de Qwen/Qwen3-VL-4B-Instruct y del proyecto Glance.
- No genera texto libre ni razonamiento en lenguaje natural; solo puntúa etiquetas predefinidas. No sirve para tareas de diálogo, resumen o descripción abierta de imágenes.
- Las etiquetas candidatas están limitadas a respuestas binarias o a un conjunto de entre 2 y 8 opciones; preguntas abiertas quedan fuera de su alcance.
- Riesgo de alucinación y de confianza mal calibrada heredado del modelo base: una probabilidad alta no garantiza corrección, especialmente en imágenes fuera de la distribución de entrenamiento o con dominios muy específicos.
- Sesgos heredados del corpus de entrenamiento de Qwen3-VL, no evaluados ni documentados en este repositorio.
- Idiomas soportados no documentados; se desconoce el comportamiento en castellano y en otras lenguas distintas del inglés.
- Ventana de contexto no documentada, lo que dificulta planificar entradas multimodales largas o múltiples imágenes.
- Licencia: el modelo base es Apache 2.0, pero el uso de Glance queda sujeto a su propia licencia, no detallada en la información disponible. Conviene verificar ambas antes de un despliegue comercial.
- El repositorio registra cero descargas y cero valoraciones en el momento de la consulta, y no presenta documentación de evaluación, pruebas de robustez ni histórico de versiones.
- La fecha de creación registrada en el repositorio es el 21 de septiembre de 2026, posterior a la fecha de la mayoría de referencias públicas, un dato que conviene contrastar antes de citarlo.
- La disponibilidad depende de infraestructura externa (Replicate y el Space de demostración); no hay pesos descargables que permitan un despliegue totalmente offline sin recurrir al modelo base original.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/untappedvc/glance-qwen3-vl-4b
- Modelo base Qwen3-VL-4B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Proyecto Glance (GitHub): https://github.com/yoheinakajima/glance
- Space de demostración interactiva: https://huggingface.co/spaces/yoheinakajima/glance-qwen3-vl-4b-demo
- Modelo público en Replicate: https://replicate.com/untapped/glance-qwen3-vl-4b

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card del repositorio.
