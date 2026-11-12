# t-firefly/qwen3-vl-embedding-2b-rknn3-rk1820

## Resumen

Qwen3-VL-Embedding-2B es un modelo de embeddings multimodales desarrollado por el equipo Qwen, construido sobre el modelo fundacional Qwen3-VL. Su funcion es generar vectores de alta dimension a partir de entradas de texto, imagenes, capturas de pantalla, video y combinaciones arbitrarias de modalidades, dentro de un espacio compartido visual-textual. Resuelve el problema de la recuperacion de informacion multimodal y la comprension entre modalidades, con un rendimiento de 73.2 global en MMEB-V2 con solo 2B de parametros.

La variante publicada por t-firefly (Firefly AI Team) es una conversion del modelo original para su despliegue en la plataforma Rockchip RK1820, empaquetada en formato GGUF y distribuida a traves de la herramienta LlamaPi. Esta orientada a inteligencia artificial en el borde (edge AI), lo que permite ejecutar recuperacion multimodal en hardware embebido Rockchip en lugar de depender de GPUs de centro de datos.

El modelo soporta mas de 30 idiomas, es instruction-aware (admite instrucciones de tarea personalizables) y ofrece dimensiones de embedding de hasta 2048, ajustables entre 64 y 2048 mediante MRL (Matryoshka Representation Learning). La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3-VL); no se detalla la variante exacta en la informacion disponible |
| Parametros totales | 2B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32K tokens |
| Tipos de cuantizacion | no disponible (el repo contiene pesos GGUF; no se especifican los niveles exactos) |
| Idiomas soportados | 30+ idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (convertido para RK1820 / LlamaPi) |

## Arquitectura y entrenamiento

El modelo se basa en el modelo fundacional Qwen3-VL y esta disenado como modelo de embeddings multimodales: proyecta texto, imagenes, capturas de pantalla, video y combinaciones multimodales arbitrarias a un espacio vectorial compartido visual-textual. Genera vectores semanticamente ricos con dimensiones de hasta 2048, ajustables de 64 a 2048 mediante Matryoshka Representation Learning (MRL), lo que permite truncar la dimension segun los requisitos de almacenamiento y latencia.

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El modelo es instruction-aware, es decir, admite instrucciones de tarea personalizables que condicionan el embedding generado. La conversion publicada por Firefly adapta los pesos al formato GGUF para su ejecucion en la plataforma Rockchip RK1820 mediante LlamaPi; no se detallan las tecnicas de cuantizacion empleadas en esa conversion.

## Capacidades

- Generacion de embeddings multimodales a partir de texto, imagenes, capturas de pantalla, video y combinaciones arbitrarias de modalidades en un marco unificado.
- Recuperacion multimodal (texto a imagen, imagen a texto, imagen a imagen, video a texto, etc.) en un espacio vectorial compartido.
- Clustering y agrupamiento semantico sobre entradas multimodales.
- Embeddings instruction-aware: permite personalizar la instruccion de tarea para adaptar el vector al caso de uso.
- Dimension de embedding ajustable de 64 a 2048 mediante MRL.
- Soporte de mas de 30 idiomas.
- Buen rendimiento incluso con embeddings cuantizados, segun la model card.
- No se documentan capacidades de generacion de texto, tool calling ni razonamiento multi-paso: es un modelo de embeddings, no un modelo generativo de chat.

## Casos de uso

- Busqueda semantica multimodal en aplicaciones edge: desplegado en RK1820 mediante LlamaPi, permite indexar y recuperar imagenes y texto en dispositivos embebidos sin conexion a la nube, gracias a su tamano de 2B y su contexto de 32K.
- Recuperacion aumentada (RAG) sobre documentos con imagenes: genera embeddings de capturas de pantalla y fragmentos de texto en el mismo espacio vectorial, lo que permite recuperar figuras, tablas o diagramas junto al texto relevante.
- Deduplicacion y clustering de catalogos visuales: agrupa imagenes y descripciones de producto por similitud semantica usando embeddings de 2048 dimensiones (o truncados con MRL para reducir coste de almacenamiento).
- Moderacion y clasificacion de contenido multimodal: compara capturas o videos contra un conjunto de referencia de contenido permitido o prohibido mediante similitud vectorial.
- Busqueda de video por lenguaje natural: indexa fotogramas o clips de video como vectores y permite consultas textuales sobre el contenido visual.
- Sistemas de recomendacion visual: calcula similitud entre imagenes de usuario y catalogo en un espacio compartido, con embeddings truncados a dimensiones menores para latencia baja en dispositivo.
- Indexacion multilingue: con soporte de mas de 30 idiomas, permite recuperacion cruzada entre consultas en un idioma y documentos en otro dentro del mismo espacio vectorial.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| MMEB-V2 (global) | 73.2 |

No se han publicado en la informacion disponible resultados desglosados por tarea ni comparativas numericas con otros modelos de embeddings.

## Requisitos de hardware

- Plataforma objetivo: Rockchip RK1820, mediante la herramienta de despliegue LlamaPi.
- VRAM estimada para inferencia: no disponible. El modelo tiene 2B parametros y el repositorio ocupa 1.7 GB en formato GGUF, lo que sugiere pesos cuantizados de baja precision; la memoria necesaria depende del nivel de cuantizacion no especificado.
- GPU recomendadas: no disponibles en la informacion proporcionada. El modelo esta orientado a aceleradores Rockchip RK1820, no a GPU de centro de datos.
- Compatibilidad con GPU de consumo: no confirmada; al ser un GGUF podria ejecutarse con llama.cpp en hardware compatible, pero no se documenta.
- Opciones de despliegue: LlamaPi (`llamapi pull qwen3-vl-embedding:2b`, `llamapi load qwen3-vl-embedding:2b`) con API de embeddings. No se documentan vLLM, TGI ni Ollama para esta variante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension de embedding | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-VL-Embedding-2B (esta variante, RK1820) | 2B | 32K | hasta 2048 (MRL 64-2048) | Apache 2.0 | Conversion GGUF para edge AI en RK1820 |
| Qwen/Qwen3-VL-Embedding-2B (original) | 2B | 32K | hasta 2048 (MRL 64-2048) | Apache 2.0 | Modelo base multimodal de embeddings de Qwen Team |
| Otros modelos de embeddings multimodales | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Es un modelo de embeddings, no un modelo generativo: no produce texto, no soporta tool calling ni razonamiento conversacional.
- No se documentan sesgos conocidos ni evaluaciones de sesgo en la informacion disponible.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero la similitud vectorial puede producir recuperaciones erroneas si los embeddings no discriminan bien en dominios muy especializados.
- La informacion sobre idiomas es generica (30+ idiomas) sin lista detallada ni evaluacion por idioma.
- La licencia Apache 2.0 permite uso comercial, pero los derechos de propiedad intelectual del modelo original pertenecen al equipo oficial de Qwen; la variante esta convertida y adaptada por Firefly AI Team.
- La variante esta optimizada para RK1820 y LlamaPi; su uso fuera de esa plataforma no esta documentado y puede requerir conversion adicional.
- No se especifican los niveles de cuantizacion aplicados en la conversion GGUF, lo que impide estimar con precision la perdida de calidad respecto al modelo original.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/t-firefly/qwen3-vl-embedding-2b-rknn3-rk1820
- Modelo original en Hugging Face: https://huggingface.co/Qwen/Qwen3-VL-Embedding-2B
- Modelo original en ModelScope: https://modelscope.cn/models/Qwen/Qwen3-VL-Embedding-2B
- Firefly AI Team: https://www.t-firefly.com/
- Documentacion de LlamaPi: https://community.t-firefly.com/en/docs/ai/applications/LlamaPi/llamapi/introduction
- Licencia Apache 2.0: https://huggingface.co/licenses/apache-2.0
