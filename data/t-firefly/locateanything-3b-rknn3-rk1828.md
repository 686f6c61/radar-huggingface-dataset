# t-firefly/LocateAnything-3b-rknn3-rk1828

## Resumen

LocateAnything-3b-rknn3-rk1828 es una conversión del modelo vision-language LocateAnything-3B de NVIDIA, adaptada por el equipo Firefly AI para ejecutarse sobre la plataforma Rockchip RK1828. El modelo original resuelve tareas de *visual grounding*: localización precisa de objetos mediante cajas delimitadoras y puntos, detección densa y grounding de elementos de interfaz gráfica o texto en imágenes. Frente a otros VLM orientados a descripción, aquí la salida es espacial y estructurada, lo que lo hace útil para robótica, conducción y automatización de interfaces.

La innovación principal del modelo base es el *Parallel Box Decoding*: las coordenadas completas de una caja se predicen en un único paso paralelo en lugar de decodificarse token a token de forma autorregresiva, lo que según el autor del modelo original ofrece hasta 2,5 veces más throughput. El modelo se entrenó sobre un conjunto multi-dominio de 12 millones de imágenes, más de 138 millones de consultas y 785 millones de cajas delimitadoras, cubriendo escenas naturales, robótica, conducción, interacción con GUI y comprensión de documentos.

Esta variante concreta no es un modelo nuevo: es un artefacto de despliegue en formato GGUF y cuantización RKNN3 pensado para el NPU de Rockchip RK1828, distribuido a través de la herramienta LlamaPi de Firefly. Su relevancia es práctica: permite llevar un VLM de grounding de 3B parámetros a hardware de borde, aunque con las limitaciones propias de una conversión de terceros y de un ecosistema cerrado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language transformer orientado a grounding, con Parallel Box Decoding (detalles internos del transformer no disponibles) |
| Parámetros totales | 3B (según el nombre del modelo base) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | RKNN3 para NPU Rockchip RK1828; el repositorio incluye pesos en formato GGUF (niveles concretos no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | nvidia-license (licencia "other" según Hugging Face, con enlace a la licencia de NVIDIA) |
| Formato de pesos | GGUF y artefactos RKNN3 para RK1828 |

## Arquitectura y entrenamiento

El modelo base LocateAnything-3B es un modelo vision-language de NVIDIA especializado en *grounding* visual. La información disponible no detalla la arquitectura interna del transformer (número de capas, dimensión oculta, tipo de encoder visual), por lo que esos datos deben considerarse no disponibles. La innovación documentada es el Parallel Box Decoding, que sustituye la generación autorregresiva de coordenadas por una predicción paralela de la caja completa, con una mejora declarada de hasta 2,5 veces en throughput.

El entrenamiento del modelo original se realizó sobre un dataset a gran escala de 12 millones de imágenes, más de 138 millones de consultas y 785 millones de cajas delimitadoras, abarcando escenas naturales, robótica, conducción, interacción con GUI y documentos. No se especifica en la información proporcionada si hubo etapas de RLHF, DPO u otras técnicas de alineación. Esta variante de Firefly no documenta reentrenamiento: es una conversión y adaptación de los pesos originales para el NPU RK1828.

## Capacidades

- Grounding por expresión referencial: localizar el objeto descrito en lenguaje natural dentro de una imagen.
- Detección multi-objeto: generar múltiples cajas en una sola consulta sobre escenas con varios objetos.
- Localización basada en puntos, además de cajas delimitadoras.
- Grounding de elementos de interfaz gráfica (GUI): identificación de botones, campos y controles.
- Localización de texto en imágenes (text localization).
- Detección densa en escenas complejas y con aglomeración de objetos.
- Decodificación paralela de cajas para reducir latencia en inferencia.
- Entrada image-text-to-text según el pipeline declarado en Hugging Face.
- Soporte de tool calling, agentes o modo *thinking*: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Robótica de manipulación: el modelo recibe una instrucción como "coge la taza roja" y devuelve la caja del objeto para que el brazo robotizado planifique la aprehensión; el entrenamiento del modelo base incluye datos de robótica, lo que favorece este dominio.
- Automatización de interfaces gráficas: localizar botones y campos en capturas de pantalla para agentes RPA o pruebas automatizadas de UI, aprovechando la capacidad de GUI grounding.
- Conducción asistida y análisis de escenas viarias: detección de peatones, vehículos y señales en imágenes de cámara, apoyada en el subconjunto de conducción del dataset de entrenamiento.
- Procesamiento de documentos: localización de campos, sellos o bloques de texto en facturas y formularios escaneados para pipelines de extracción estructurada.
- Despliegue en dispositivos de borde: al estar convertido a RKNN3 para RK1828, permite ejecutar grounding visual en equipos embebidos con NPU, sin depender de GPU en la nube.
- Análisis de inventario y retail: detección y conteo de productos en estanterías a partir de una consulta textual, con salida de cajas por instancia.
- Moderación y anotación de imágenes: generación de cajas candidatas para etiquetado asistido en conjuntos de datos de visión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento declarado por el autor del modelo original es la mejora de hasta 2,5 veces en throughput gracias al Parallel Box Decoding, sin cifras absolutas asociadas.

## Requisitos de hardware

- Plataforma objetivo: NPU Rockchip RK1828, con artefactos RKNN3 específicos para este chip.
- El repositorio ocupa 2,9 GB, lo que es coherente con pesos cuantizados de un modelo de 3B parámetros; el nivel exacto de cuantización no está documentado.
- VRAM estimada para inferencia en GPU: no disponible; para un modelo de 3B en FP16 serían necesarios del orden de 6-7 GB solo para pesos, pero esta cifra no la proporciona la información y debe tomarse como referencia genérica, no como dato del repositorio.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible para esta variante; el artefacto está orientado a NPU Rockchip.
- Opciones de despliegue: LlamaPi (comando `llamapi run locateanything:3b`), que gestiona descarga, carga y ejecución. No se documenta soporte de vLLM, llama.cpp, Ollama o TGI para esta conversión.
- Latencia y throughput: no disponibles; solo se conoce la mejora relativa de 2,5× del Parallel Box Decoding en el modelo original.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LocateAnything-3b-rknn3-rk1828 (esta ficha) | 3B | no disponible | Grounding visual en NPU RK1828 | nvidia-license | Hugging Face, vía LlamaPi |
| nvidia/LocateAnything-3B | 3B | no disponible | Grounding visual (modelo original) | nvidia-license | Hugging Face |
| Alternativas de grounding de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de modelos comparables que permitan una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Es una conversión de terceros: Firefly AI no es el desarrollador original y los derechos de propiedad intelectual permanecen en NVIDIA; cualquier incidencia de calidad debe contrastarse con el modelo original.
- La licencia nvidia-license condiciona el uso; el modelo original se publicó para investigación y desarrollo, por lo que el uso comercial requiere revisar el texto completo de la licencia antes de desplegarlo en producción.
- El artefacto está atado al NPU RK1828; no es portable a otras plataformas sin reconversión.
- No hay información sobre sesgos, tasas de alucinación ni comportamiento multilingüe de esta variante.
- El modelo está especializado en localización espacial; no debe esperarse de él descripción detallada de escenas, razonamiento libre o generación de texto extensa.
- El repositorio registra cero descargas y cero likes en el momento de la consulta, por lo que no existe validación comunitaria publicada.
- No se documentan niveles de cuantización ni métricas de degradación respecto al modelo original, un riesgo relevante para tareas que dependen de precisión en coordenadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/t-firefly/LocateAnything-3b-rknn3-rk1828
- Modelo original: https://huggingface.co/nvidia/LocateAnything-3B
- Licencia del modelo original: https://huggingface.co/nvidia/LocateAnything-3B/blob/main/LICENSE
- Firefly AI Team: https://www.t-firefly.com/
- Documentación de LlamaPi: https://community.t-firefly.com/en/docs/ai/applications/LlamaPi/llamapi/introduction
