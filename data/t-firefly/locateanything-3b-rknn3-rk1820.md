# t-firefly/LocateAnything-3b-rknn3-rk1820

## Resumen

LocateAnything-3b-rknn3-rk1820 es una conversión del modelo vision-language LocateAnything-3B de NVIDIA, adaptada por el equipo de Firefly AI para ejecutarse en la plataforma Rockchip RK1820 mediante el runtime LlamaPi. El modelo original es un sistema de grounding visual diseñado para localización precisa de objetos, detección densa y localización basada en puntos en dominios diversos. Esta versión empaqueta los pesos en formato GGUF y los adapta al backend RKNN3 del chip RK1820, orientado a despliegues en dispositivos de borde.

La relevancia de esta ficha radica en que permite ejecutar un modelo de grounding visual de 3.000 millones de parámetros en hardware de borde Rockchip, algo poco habitual en la categoría de modelos vision-language. La conversión mantiene la licencia original de NVIDIA y está pensada para desarrolladores que trabajan con placas Firefly basadas en RK1820 y necesitan capacidades de detección y localización de objetos en tiempo real sin depender de GPU dedicadas.

El modelo hereda las innovaciones del original, incluyendo la decodificación paralela de cajas delimitadoras (Parallel Box Decoding), que predice las coordenadas completas de una caja en un solo paso en lugar de decodificar token a token, con una mejora de throughput de hasta 2,5 veces según la documentación del autor original. El repositorio ocupa 2,9 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language grounding (transformer multimodal, detalles no disponibles) |
| Parametros totales | 3B (según nombre del modelo y modelo base) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en GGUF, nivel de cuantización no especificado) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA License (nvidia-license, categoría "other") |
| Formato de pesos | GGUF (adaptado a RKNN3 para RK1820) |

## Arquitectura y entrenamiento

El modelo original LocateAnything-3B es un modelo vision-language de NVIDIA orientado a grounding visual. La información disponible no detalla la arquitectura interna (tipo de vision encoder, número de capas, dimensión oculta ni mecanismo de atención), por lo que estos datos se consideran no disponibles. La innovación técnica destacada es la decodificación paralela de cajas delimitadoras, que sustituye la decodificación autorregresiva token a token por una predicción completa de coordenadas en un solo paso, lo que según el autor original proporciona hasta 2,5 veces más throughput.

El entrenamiento del modelo original se realizó sobre un dataset multi-dominio a gran escala que comprende 12 millones de imágenes, más de 138 millones de consultas y 785 millones de cajas delimitadoras, abarcando escenas naturales, robótica, conducción, interacción con interfaces gráficas (GUI) y comprensión de documentos. No se dispone de información sobre el uso de RLHF, DPO u otras técnicas de alineación en la documentación proporcionada. La conversión de Firefly no modifica el entrenamiento, solo adapta los pesos y el runtime para el hardware RK1820.

## Capacidades

- Localización de objetos mediante expresiones de referencia (referring expression grounding): el modelo recibe una imagen y una descripción textual y devuelve las coordenadas de la caja delimitadora del objeto descrito.
- Detección densa de múltiples objetos en una misma imagen.
- Localización basada en puntos, no solo en cajas delimitadoras.
- Grounding de elementos de interfaz gráfica (GUI element grounding), útil para automatización de interacción con aplicaciones.
- Localización de texto en imágenes (text localization).
- Buen rendimiento declarado en escenas complejas y desordenadas según el autor original.
- Pipeline image-text-to-text, lo que implica entrada multimodal (imagen y texto) y salida textual estructurada con coordenadas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio adicionales: no disponible; la única modalidad documentada es imagen y texto.

## Casos de uso

- Automatización de inspección visual en línea de producción: el modelo puede localizar defectos o componentes concretos descritos mediante texto sobre imágenes capturadas por cámaras industriales, ejecutándose en una placa RK1820 integrada en la propia línea sin necesidad de servidores GPU.
- Robótica de borde: grounding de objetos descritos por el operador para que un brazo robótico o robot móvil identifique y manipule el elemento correcto, aprovechando la decodificación paralela de cajas para reducir la latencia de percepción.
- Automatización de interfaces gráficas: localización de botones, campos de texto y elementos de menú descritos en lenguaje natural para construir agentes de automatización de escritorio o pruebas de UI.
- Asistencia a la conducción y análisis de escenas viales: detección y localización de vehículos, peatones y señales en imágenes de cámara, con despliegue en hardware embebido del vehículo.
- Procesamiento de documentos y digitalización: localización de campos, tablas y regiones de texto en documentos escaneados para pipelines de extracción de datos.
- Sistemas de accesibilidad: descripción y localización de objetos en el entorno del usuario a partir de una consulta textual, ejecutándose en un dispositivo portátil con RK1820.
- Vigilancia y monitorización con privacidad local: análisis de imágenes en el propio dispositivo de borde, evitando enviar vídeo a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor original menciona una mejora de hasta 2,5 veces en throughput gracias a la decodificación paralela de cajas, pero no se proporcionan cifras absolutas de precisión (mAP, accuracy de grounding) ni comparativas numéricas con otros modelos en la información facilitada.

## Requisitos de hardware

- Plataforma objetivo: Rockchip RK1820, con runtime LlamaPi y backend RKNN3.
- VRAM estimada: no disponible; el modelo está pensado para la NPU/acelerador del RK1820, no para GPU convencional.
- GPU recomendadas: no aplica para esta conversión; para el modelo original en formato estándar se requeriría una GPU con memoria suficiente para 3B parámetros (aproximadamente 6-7 GB en FP16, estimación orientativa no confirmada por la documentación).
- Compatibilidad con GPU de consumo: la conversión RKNN3 no está pensada para GPU de consumo; el modelo original podría ejecutarse en GPUs de consumo con cuantización, pero no se dispone de datos confirmados.
- Opciones de despliegue: LlamaPi (`llamapi run locateanything:3b`), que gestiona descarga, carga y ejecución. No se documentan otras opciones como vLLM, llama.cpp u Ollama para esta conversión específica.
- Latencia y throughput: no disponibles en cifras concretas; solo se indica la mejora relativa de hasta 2,5 veces del decodificador paralelo del modelo original.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LocateAnything-3b-rknn3-rk1820 (esta ficha) | 3B | no disponible | Grounding visual en RK1820 | NVIDIA License | Hugging Face, 0 descargas |
| nvidia/LocateAnything-3B (original) | 3B | no disponible | Grounding visual general | NVIDIA License | Hugging Face |
| Alternativas de grounding visual de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente en la documentación proporcionada para establecer una comparativa numérica con modelos alternativos de la misma categoría. Se recomienda consultar la model card del modelo original de NVIDIA para obtener referencias de rendimiento frente a otros sistemas de grounding.

## Limitaciones y advertencias

- La licencia NVIDIA License (categoría "other") puede imponer restricciones al uso comercial; es imprescindible revisar el texto completo en el enlace de licencia del modelo original antes de desplegarlo en producción.
- El modelo original se publica para fines de investigación y desarrollo según la model card; el uso comercial no está garantizado por la documentación disponible.
- Esta conversión está acoplada al hardware RK1820 y al runtime LlamaPi; no es portable a otras plataformas sin reconversión.
- Riesgo de alucinación en coordenadas: como todo modelo generativo multimodal, puede producir cajas delimitadoras inexactas o inventadas en escenas ambiguas u objetos poco representados.
- Sesgos conocidos: no documentados en la información disponible; el dataset de entrenamiento (12M imágenes, 138M consultas) puede introducir sesgos de dominio que no se detallan.
- Idiomas soportados no especificados; no se puede garantizar el rendimiento en consultas en castellano sin evaluación previa.
- Longitud de contexto no disponible, lo que impide planificar casos de uso con múltiples imágenes o conversaciones largas.
- El repositorio no registra descargas ni likes, por lo que no hay evidencia comunitaria de funcionamiento en producción.
- La conversión la realiza un tercero (Firefly AI) y no NVIDIA; la responsabilidad sobre posibles degradaciones respecto al original recae en el conversor.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/t-firefly/LocateAnything-3b-rknn3-rk1820
- Modelo original en Hugging Face: https://huggingface.co/nvidia/LocateAnything-3B
- Licencia del modelo original: https://huggingface.co/nvidia/LocateAnything-3B/blob/main/LICENSE
- Documentación de LlamaPi: https://community.t-firefly.com/en/docs/ai/applications/LlamaPi/llamapi/introduction
- Sitio web de Firefly AI: https://www.t-firefly.com/
