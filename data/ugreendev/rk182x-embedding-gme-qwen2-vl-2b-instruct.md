# UGREENDEV/RK182X-EMBEDDING-gme-Qwen2-VL-2B-Instruct

## Resumen

RK182X-EMBEDDING-gme-Qwen2-VL-2B-Instruct es una conversión al formato RKNN del modelo de embeddings multimodales Alibaba-NLP/gme-Qwen2-VL-2B-Instruct, publicada por UGREENDEV. No se trata de un modelo nuevo entrenado desde cero, sino de una derivación cuantizada y empaquetada para ejecutarse sobre la NPU de los chips Rockchip RK1820 y RK1828. Su función es generar vectores de embedding a partir de pares imagen-texto, orientados a tareas de recuperación (retrieval) y búsqueda multimodal.

El modelo base, gme-Qwen2-VL-2B-Instruct, es un encoder de 2.000 millones de parámetros construido sobre la arquitectura Qwen2-VL, que combina un transformer de lenguaje con un encoder visual para procesar imágenes y texto en un espacio compartido. Esta conversión mantiene esa capacidad multimodal, pero la adapta al runtime RKNN v1.1.0 con cuantización mixta: w4a16 para la torre de visión y w6a16 para la torre de embeddings.

La relevancia de esta ficha radica en que permite desplegar un modelo de embeddings visuales de 2B en hardware de borde basado en NPU Rockchip, algo poco habitual en el ecosistema open source, donde la mayoría de conversiones se limitan a CPU o GPU. El repositorio ocupa 2,1 GB y se distribuye bajo licencia Apache 2.0, con la salvedad de que los artefactos son derivados convertidos y no los pesos originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2-VL: encoder visual + decoder de lenguaje) |
| Parametros totales | 2B (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (configuracion de embedding) |
| Tipos de cuantizacion | Vision: w4a16; Embedding: w6a16; KVCache: fp16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | RKNN (runtime v1.1.0), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base gme-Qwen2-VL-2B-Instruct sigue la arquitectura Qwen2-VL, un transformer multimodal que integra un vision encoder con un modelo de lenguaje para producir representaciones conjuntas de imagen y texto. En esta conversión, la torre de visión procesa imágenes a resolución 448x448 y la torre de embeddings genera los vectores finales, ambas ejecutándose sobre 8 núcleos NPU del chip RK182X. La cuantización es mixta: w4a16 para visión y w6a16 para embeddings, con KVCache en fp16.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base empleó RLHF o DPO, ya que la model card de esta conversión no incluye esos detalles. La innovación técnica destacable es el propio proceso de conversión a RKNN con cuantización diferenciada por módulo, que permite ejecutar un modelo multimodal de 2B en NPU de borde con un contexto de 2048 tokens.

## Capacidades

- Generación de embeddings multimodales para pares imagen-texto.
- Recuperación (retrieval) texto-imagen e imagen-texto en un espacio vectorial compartido.
- Feature extraction para pipelines de búsqueda semántica multimodal.
- Procesamiento de imágenes a resolución 448x448.
- Contexto de hasta 2048 tokens para la torre de embeddings.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documentan capacidades de tool calling, agentes, thinking mode, audio ni generación de texto libre en la información disponible.

## Casos de uso

- Búsqueda visual en catálogos de producto: el modelo genera embeddings de imágenes y descripciones textuales, permitiendo recuperar productos por similitud semántica en un espacio compartido, con la ventaja de ejecutarse en NPU de borde sin depender de la nube.
- Moderación de contenido multimodal: comparar imágenes entrantes contra un conjunto de referencia de contenido prohibido mediante similitud de embeddings, aprovechando el contexto de 2048 tokens para lotes de consultas.
- Indexación de archivos multimedia en dispositivos locales: construir un índice vectorial de fotos y vídeos en un NAS o dispositivo con chip RK182X, con recuperación por lenguaje natural sin enviar datos a servidores externos.
- Sistemas de recomendación visual: calcular embeddings de imágenes de usuario y de catálogo para recomendaciones por similitud, con latencia baja al ejecutarse en NPU dedicada.
- Accesibilidad: describir o etiquetar imágenes mediante recuperación contra una base de descripciones precomputadas, útil en aplicaciones de asistencia para personas con discapacidad visual en dispositivos de borde.
- Duplicados y near-duplicates: detectar imágenes similares en grandes repositorios mediante distancia entre embeddings, con la ventaja de la cuantización w4a16/w6a16 que reduce el coste de almacenamiento y cómputo.
- Búsqueda en documentación técnica con capturas: indexar manuales que combinan texto e imágenes y recuperar fragmentos relevantes por consulta multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Chips soportados: Rockchip RK1820 y RK1828 (NPU RK182X).
- Runtime: RKNN Runtime v1.1.0, con driver correspondiente; verificar con `rknn-smi -v` antes de ejecutar.
- VRAM: no aplica; el modelo se ejecuta en NPU, no en GPU.
- GPU recomendadas: no disponible (el artefacto está empaquetado exclusivamente para NPU Rockchip).
- Cabe en consumer GPU: no, el formato RKNN no es compatible con CUDA.
- Opciones de despliegue: RKNN Runtime v1.1.0 sobre chips RK1820/RK1828; descarga vía Hugging Face (`hf download`) o ModelScope (`modelscope download`).
- Latencia y throughput: no disponibles.
- Tamaño del repositorio: 2,1 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Hardware | Licencia |
|---|---|---|---|---|---|
| RK182X-EMBEDDING-gme-Qwen2-VL-2B-Instruct (esta ficha) | 2B | 2048 | RKNN | NPU RK1820/RK1828 | Apache 2.0 |
| Alibaba-NLP/gme-Qwen2-VL-2B-Instruct | 2B | no disponible | safetensors | GPU/CPU | Apache 2.0 |
| Alternativas de embeddings multimodales de 2B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con el modelo base es la más relevante: misma arquitectura y parámetros, pero distinto formato y hardware objetivo. No se dispone de datos de rendimiento comparativo entre ambos.

## Limitaciones y advertencias

- El artefacto es una conversión derivada, no los pesos originales; está sujeto a la licencia Apache 2.0 del modelo base y a las restricciones de uso del NOTICE.
- Solo funciona en chips RK1820 y RK1828 con RKNN Runtime v1.1.0; no es portable a GPU, CPU estándar ni otros aceleradores.
- La cuantización w4a16 en visión y w6a16 en embeddings puede degradar la calidad de los vectores frente al modelo en fp16; no se han publicado métricas de esa pérdida.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o imágenes de alta resolución más allá de 448x448.
- Idiomas soportados no documentados; el comportamiento multilingüe no está garantizado por la model card.
- Riesgo de sesgos y alucinaciones heredado del modelo base, no evaluado en esta conversión.
- Las licencias del RKNN Toolkit y RKNN Runtime también aplican; las librerías de runtime no se incluyen en el paquete.
- Verificar los checksums SHA-256 antes del despliegue; el autor indica desplegar solo si todas las entradas muestran `OK`.

## Enlaces

- Hugging Face: https://huggingface.co/UGREENDEV/RK182X-EMBEDDING-gme-Qwen2-VL-2B-Instruct
- Modelo base: https://huggingface.co/Alibaba-NLP/gme-Qwen2-VL-2B-Instruct
- ModelScope (descarga): modelo `UGREENDEV/RK182X-EMBEDDING-gme-Qwen2-VL-2B-Instruct`
- Documentación de configuración: `gme-Qwen2-VL-2B-Instruct-448x448-w4a16-w6a16-8-2048/README.md` dentro del repositorio
- Licencia: `LICENSE` y `NOTICE` en el repositorio
