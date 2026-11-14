# t-firefly/qwen3-vl-embedding-2b-rknn3-rk1828

## Resumen

Qwen3-VL-Embedding-2B es un modelo de embeddings multimodales desarrollado por el equipo Qwen, construido sobre el modelo fundacional Qwen3-VL. Su funcion es generar vectores de alta dimension a partir de entradas de texto, imagenes, capturas de pantalla, video y combinaciones arbitrarias de modalidades, dentro de un espacio semantico compartido entre vision y lenguaje. Esta pensado para tareas de recuperacion de informacion multimodal y comprension cross-modal, y alcanza un rendimiento global de 73,2 en MMEB-V2 con solo 2B parametros, segun la model card del autor.

La version concreta de este repositorio no es el modelo original, sino una conversion y adaptacion realizada por el equipo Firefly AI para la plataforma Rockchip RK1828, orientada a despliegue en dispositivos edge. Los pesos se distribuyen en formato GGUF y se ejecutan mediante LlamaPi, la herramienta de despliegue de Firefly, que expone una API de embeddings compatible con endpoints.

La relevancia de esta ficha radica en que permite ejecutar un modelo de embeddings multimodales de 2B en hardware Rockchip de borde, algo poco habitual, manteniendo la licencia Apache 2.0 del modelo original. Es un artefacto de interes para proyectos de recuperacion multimodal en dispositivos con recursos limitados, no para servidores de alto rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Qwen3-VL (detalles internos no disponibles) |
| Parametros totales | 2B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32K tokens |
| Tipos de cuantizacion | no disponible (pesos distribuidos en GGUF; niveles concretos no especificados) |
| Idiomas soportados | 30+ idiomas (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (conversion para RK1828) |
| Dimension de embedding | Hasta 2048, configurable de 64 a 2048 mediante MRL |
| Plataforma objetivo | Rockchip RK1828 |
| Herramienta de despliegue | LlamaPi |
| Tamano del repositorio | 2,2 GB |

## Arquitectura y entrenamiento

El modelo original Qwen3-VL-Embedding-2B se construye sobre el modelo fundacional Qwen3-VL y esta disenado como un encoder de embeddings multimodales: proyecta texto, imagenes, capturas de pantalla, video y combinaciones de modalidades a un espacio vectorial compartido. Incorpora Matryoshka Representation Learning (MRL), que permite truncar la dimension del embedding desde 2048 hasta 64 sin reentrenar, y es instruction-aware, es decir, acepta instrucciones de tarea personalizables que condicionan el vector resultante.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada. La conversion de Firefly AI adapta los pesos originales al formato GGUF y a la plataforma RK1828, sin que se detallen en la model card las tecnicas de cuantizacion ni las modificaciones internas aplicadas durante la conversion.

## Capacidades

- Generacion de embeddings multimodales: texto, imagenes, capturas de pantalla, video y combinaciones arbitrarias de modalidades en un unico framework.
- Recuperacion cross-modal: busqueda texto-a-imagen, imagen-a-texto, imagen-a-imagen y video-a-texto en un espacio semantico compartido.
- Embeddings de dimension configurable de 64 a 2048 mediante MRL, lo que permite ajustar coste de almacenamiento y latencia.
- Soporte de instrucciones de tarea (instruction-aware) para adaptar el vector a dominios o tareas concretas.
- Capacidades multilingues en mas de 30 idiomas.
- API de embeddings expuesta por LlamaPi, compatible con endpoints.
- No se documentan capacidades de tool calling, agentes ni generacion de texto libre; el modelo es exclusivamente de embeddings.

## Casos de uso

- Busqueda semantica multimodal en dispositivos edge: indexar capturas de pantalla e imagenes junto a texto en un RK1828 y recuperar resultados por similitud, aprovechando el contexto de 32K y la dimension reducible del embedding.
- Clasificacion y clustering de imagenes en el borde: agrupar lotes de imagenes o fotogramas de video por similitud semantica sin enviar datos a la nube, util en entornos con requisitos de privacidad.
- Recuperacion aumentada (RAG) local con soporte visual: construir un indice vectorial de documentos que incluyan figuras y tablas, usando el modelo para vectorizar tanto el texto como las imagenes asociadas.
- Deteccion de duplicados y near-duplicates en catalogos de producto: comparar embeddings de imagenes y descripciones para detectar fichas repetidas o variantes del mismo articulo.
- Moderacion y filtrado de contenido visual: vectorizar imagenes y videos para comparar contra un conjunto de referencia de contenido no permitido, con inferencia en el propio dispositivo.
- Busqueda en galerias y archivos personales: indexar fotos y videos de un dispositivo domestico y permitir consultas en lenguaje natural, con la ventaja de que los datos no salen del equipo.
- Analisis de video por fotogramas: extraer embeddings de frames clave y agrupar escenas o buscar momentos concretos mediante consultas textuales.

## Benchmarks y rendimiento

La model card del autor cita un resultado global de 73,2 en MMEB-V2 para el modelo original Qwen3-VL-Embedding-2B. No se proporcionan resultados desglosados por tarea ni mediciones de latencia o throughput para la version convertida a RK1828.

| Benchmark | Resultado | Modelo |
|---|---|---|
| MMEB-V2 (global) | 73,2 | Qwen3-VL-Embedding-2B (original) |

No se han publicado resultados adicionales de benchmarks en la informacion disponible.

## Requisitos de hardware

- Plataforma objetivo: Rockchip RK1828, con aceleracion NPU mediante la conversion incluida en este repositorio.
- VRAM/RAM estimada: el repositorio ocupa 2,2 GB en formato GGUF; el consumo en ejecucion sobre RK1828 no esta especificado.
- GPU dedicadas (A100, H100, RTX 4090): no se documenta soporte; los pesos estan adaptados a RK1828 y no se garantiza su uso en CUDA.
- GPUs de consumo: no se documenta compatibilidad con GPUs de consumo en la informacion disponible.
- Despliegue: LlamaPi (`llamapi pull qwen3-vl-embedding:2b` y `llamapi load qwen3-vl-embedding:2b`), con API de embeddings compatible con endpoints.
- vLLM, llama.cpp, Ollama o TGI: no se documenta soporte en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension embedding | Licencia | Plataforma |
|---|---|---|---|---|---|
| Qwen3-VL-Embedding-2B (Firefly RK1828) | 2B | 32K | 64-2048 (MRL) | Apache 2.0 | Rockchip RK1828 via LlamaPi |
| Qwen3-VL-Embedding-2B (original) | 2B | 32K | 64-2048 (MRL) | Apache 2.0 | GPU/CPU generico |
| Otros modelos de embeddings multimodales de 2B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con alternativas en la informacion proporcionada; la unica comparacion posible es frente al modelo original, del que esta version es una conversion para hardware especifico.

## Limitaciones y advertencias

- Es una conversion de terceros (Firefly AI) del modelo original; el comportamiento puede diferir del Qwen3-VL-Embedding-2B oficial, y no se documentan las pruebas de equivalencia realizadas.
- Los pesos estan adaptados a Rockchip RK1828 y LlamaPi; no se garantiza su funcionamiento en otras plataformas ni con otros runtimes.
- No se especifican los niveles de cuantizacion aplicados, lo que impide estimar con precision la perdida de calidad respecto al modelo original.
- El modelo es exclusivamente de embeddings: no genera texto, no soporta tool calling ni razonamiento multi-paso.
- Riesgo de sesgos y alucinacion en la representacion semantica: los embeddings pueden reflejar sesgos presentes en los datos de entrenamiento originales, no documentados en esta ficha.
- Aunque la licencia es Apache 2.0, los derechos de propiedad intelectual del modelo subyacente pertenecen al equipo Qwen; conviene revisar los terminos del modelo original antes de un uso comercial.
- La lista de idiomas (30+) proviene de la model card del modelo original y no se ha verificado para esta conversion.
- El repositorio tiene pocas descargas (166) y ningun like, lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/t-firefly/qwen3-vl-embedding-2b-rknn3-rk1828
- Modelo original en Hugging Face: https://huggingface.co/Qwen/Qwen3-VL-Embedding-2B
- Modelo original en ModelScope: https://modelscope.cn/models/Qwen/Qwen3-VL-Embedding-2B
- Documentacion de LlamaPi: https://community.t-firefly.com/en/docs/ai/applications/LlamaPi/llamapi/introduction
- Firefly AI Team: https://www.t-firefly.com/
- Licencia Apache 2.0: https://huggingface.co/licenses/apache-2.0
