# t-firefly/bge-m3-rknn2-rk3588

## Resumen

El modelo `t-firefly/bge-m3-rknn2-rk3588` es una conversión del modelo de embeddings multilingüe BGE-M3 de BAAI, adaptado por el equipo de Firefly AI para ejecutarse en el SoC Rockchip RK3588 mediante el runtime de inferencia LlamaPi. Se trata de un modelo de embeddings de texto, no de un LLM generativo, que permite convertir frases, párrafos o documentos completos en vectores densos, dispersos y multi-vector para tareas de búsqueda semántica, similitud de frases y recuperación de información.

El modelo original BGE-M3 soporta más de 100 idiomas y una longitud de contexto de hasta 8.192 tokens, y esta conversión conserva esas capacidades pero optimizada para el NPU de 6 TOPS integrado en el RK3588. Su relevancia actual radica en la creciente demanda de modelos de embeddings desplegados en el borde (edge AI) para aplicaciones de búsqueda semántica local, asistentes de conocimiento y sistemas de RAG sin dependencia de la nube.

El repositorio incluye el modelo en formato RKNN (específico de Rockchip) y se distribuye bajo licencia MIT, aunque el modelo original BGE-M3 está sujeto a su propia licencia de uso (MIT para el modelo base, con condiciones adicionales para el modelo fine-tuneado, según el repositorio original).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (encoder transformer) |
| Parametros totales | 568 millones (modelo original BGE-M3) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (modelo original) |
| Tipos de cuantizacion | RKNN (cuantización específica para NPU RK3588, no se detalla el tipo exacto en la información disponible) |
| Idiomas soportados | Más de 100 (modelo original) |
| Licencia | MIT (conversión), modelo original con licencia MIT (BGE-M3) |
| Formato de pesos | RKNN (formato nativo de Rockchip NPU) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer encoder de tipo XLM-RoBERTa, que BAAI entrenó como parte de la familia BGE-M3. El modelo original se entrenó con un objetivo de contraste multilingüe, combinando técnicas de dense retrieval, sparse retrieval y multi-vector retrieval (similar a ColBERT). El entrenamiento incluyó datos multilingües de alta calidad, con un enfoque en la representación de texto en más de 100 idiomas.

Esta conversión específica no modifica los pesos del modelo original; simplemente los transpila al formato RKNN para que puedan ejecutarse eficientemente en el NPU del RK3588. El proceso de conversión lo realizó el equipo de Firefly AI, que también desarrolló LlamaPi, la herramienta de despliegue que permite cargar el modelo y exponerlo como una API de embeddings en el dispositivo.

## Capacidades

- Generación de embeddings de texto: convierte frases, párrafos o documentos completos en vectores de alta dimensión (1.024 dimensiones en el modelo original).
- Búsqueda semántica multilingüe: soporta más de 100 idiomas, incluyendo español, inglés, chino, francés, alemán, etc.
- Recuperación densa, esparsa y multi-vector: el modelo original BGE-M3 soporta tres modos de recuperación (dense, sparse y multi-vector), lo que permite combinar precisión semántica con coincidencia de términos exactos.
- Procesamiento de documentos largos: admite hasta 8.192 tokens de contexto, útil para documentos extensos o contextos de conversación largos.
- Similaridad de frases y clasificación de texto: se puede usar para tareas de STS (semantic textual similarity) y como backbone para clasificación de textos.
- Despliegue en el borde: optimizado para el NPU RK3588, permite inferencia local sin conexión a la nube.

## Casos de uso

- Búsqueda semántica local en dispositivos de borde: un asistente o aplicación en un dispositivo basado en RK3588 puede indexar documentos locales y realizar búsquedas por similitud semántica sin enviar datos a la nube, gracias a la eficiencia del NPU de 6 TOPS.
- Sistemas de recomendación de contenidos: en un servidor doméstico o media center basado en RK3588, se pueden generar embeddings de artículos, vídeos o productos para recomendar contenido relevante al usuario.
- Chatbots y asistentes de conocimiento con RAG: integrar el modelo en un pipeline de retrieval-augmented generation para responder preguntas basadas en una base de conocimiento local, combinando los embeddings con un LLM generativo desplegado también en el dispositivo.
- Clasificación de documentos y filtrado de contenido: usar los embeddings para clasificar correos, noticias o documentos por tema o sentimiento, ejecutándose en dispositivos de seguridad o monitorización que funcionan con RK3588.
- Deduplicación de texto y detección de plagio: comparar embeddings de documentos para encontrar duplicados o similitudes en grandes volúmenes de texto, sin depender de servicios externos.
- Sistemas de recomendación en retail: en kioscos o terminales de punto de venta basados en RK3588, recomendar productos o servicios basados en la similitud semántica de consultas de usuario con descripciones de productos.
- Indexación de correos electrónicos o mensajes: en un servidor de correo local basado en RK3588, indexar el contenido de los mensajes para búsquedas semánticas rápidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo original BGE-M3 reporta resultados en benchmarks como MIRACL, MKQA y MTEB, pero esta conversión específica para RK3588 no incluye métricas de rendimiento o latencia en la documentación proporcionada. Se recomienda consultar el repositorio original de BAAI para referencia de calidad del modelo.

## Requisitos de hardware

- Plataforma objetivo: SoC Rockchip RK3588 (CPU 8 núcleos, NPU de 6 TOPS, hasta 32 GB RAM según la placa).
- Memoria: el modelo en formato RKNN ocupa aproximadamente 1.2 GB en disco; la memoria RAM necesaria para la inferencia depende de la configuración de la placa (se recomienda al menos 4 GB de RAM libre).
- GPU: no se requiere GPU externa; el NPU integrado del RK3588 es suficiente para la inferencia.
- Compatibilidad con consumer GPU: no aplica, es un modelo diseñado exclusivamente para el NPU de Rockchip.
- Opciones de despliegue: se usa la herramienta LlamaPi, que ofrece una API de embeddings para la integración con aplicaciones. El comando `llamapi pull bge-m3 --platform rknn2/rk3588` descarga el modelo y `llamapi load` lo carga en memoria.
- Latencia y throughput: no se han publicado cifras concretas de latencia o throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Formato | Plataforma objetivo | Licencia |
|---|---|---|---|---|---|---|
| BGE-M3 (original) | 568 M | 8.192 | >100 | safetensors | CPU/GPU | MIT |
| t-firefly/bge-m3-rknn2-rk3588 | 568 M | 8.192 | >100 | RKNN | RK3588 NPU | MIT |
| E5-mistral-7b-instruct | 7.000 M | 32.768 | multilingüe (principalmente inglés) | safetensors | CPU/GPU | MIT |
| GTE-Qwen2-7B-instruct | 7.000 M | 32.768 | multilingüe (principalmente inglés) | safetensors | CPU/GPU | Apache 2.0 |

La comparativa muestra que la conversión de Firefly no cambia el rendimiento del modelo original, pero lo hace ejecutable en el NPU del RK3588, algo que no ofrecen los modelos de 7B comparables. Para aplicaciones de edge con restricciones de memoria, BGE-M3 es significativamente más ligero que los modelos de 7B.

## Limitaciones y advertencias

- El modelo original BGE-M3 tiene sesgos potenciales heredados de los datos de entrenamiento multilingües, que pueden reflejarse en los embeddings (por ejemplo, sesgos de género o culturales en la representación de textos).
- No se han evaluado los riesgos de alucinación porque el modelo no genera texto, sino vectores; sin embargo, la calidad de la recuperación puede degradarse con textos fuera de distribución o dominios muy especializados.
- La longitud de contexto de 8.192 tokens es menor que la de algunos modelos más recientes, lo que limita el procesamiento de documentos muy extensos en una sola pasada.
- La licencia MIT de la conversión no exime del cumplimiento de la licencia del modelo original de BAAI (MIT para el modelo base, pero el modelo fine-tuneado BGE-M3 tiene una licencia MIT con restricciones para uso comercial en algunos casos, según el repositorio original).
- El despliegue requiere el runtime RKNN y la herramienta LlamaPi, que son específicos de la plataforma Rockchip; no es compatible con otras arquitecturas de edge AI sin reconversión.
- La cuantización RKNN puede introducir una degradación en la calidad de los embeddings respecto al modelo en formato fp32, aunque no se han publicado métricas comparativas.

## Enlaces

- [Repositorio de Hugging Face: t-firefly/bge-m3-rknn2-rk3588](https://huggingface.co/t-firefly/bge-m3-rknn2-rk3588)
- [Árbol de archivos del repositorio](https://huggingface.co/t-firefly/bge-m3-rknn2-rk3588/tree/main)
- [Modelo original BGE-M3 en Hugging Face](https://huggingface.co/BAAI/bge-m3)
- [Modelo original BGE-M3 en ModelScope](https://modelscope.cn/models/BAAI/bge-m3)
- [Documentación de LlamaPi en la wiki de Firefly](https://community.t-firefly.com/docs/ai/applications/LlamaPi/llamapi)
- [Wiki de Firefly sobre RK3588 (AIO-GS1N2-RK182X)](https://wiki.t-firefly.com/en/AIO-GS1N2-RK182X/ai_rk182x.html)
- [Wiki de Firefly sobre Station-M3 (RK3588S)](https://wiki.t-firefly.com/en/Station-M3/started.html)
- [Página de descargas de Firefly para RK3588](https://en.t-firefly.com/doc/download/page/id/139.html)
