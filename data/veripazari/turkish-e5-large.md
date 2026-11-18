# veripazari/turkish-e5-large

## Resumen

Turkish-e5-Large es un modelo de embeddings de frases especializado en recuperación de información (retrieval) en turco, desarrollado originalmente por el grupo de investigación COSMOS AI de la Universidad Técnica de Yıldız (YTU) y redistribuido en Hugging Face por la plataforma VeriPazarı. Se trata de un ajuste fino (fine-tuning) del modelo multilingüe `intfloat/multilingual-e5-large-instruct` sobre diversos conjuntos de datos en turco, con el objetivo de mejorar la calidad de las representaciones vectoriales para tareas de búsqueda semántica y recuperación de pasajes en ese idioma.

El modelo emplea una arquitectura XLM-RoBERTa con 559.890.432 parámetros (aproximadamente 560 millones), lo que lo sitúa en la categoría de modelos de embeddings de tamaño grande. Su propósito principal es convertir consultas y documentos en vectores densos normalizados que puedan compararse mediante similitud del coseno, de modo que un sistema de búsqueda pueda ordenar pasajes por relevancia respecto a una consulta en turco.

La relevancia de este modelo radica en su especialización lingüística: frente a los modelos multilingües genéricos, un ajuste específico en turco con aprendizaje contrastivo multi-positivo (según el artículo asociado) permite obtener mejores resultados en recuperación de pasajes para ese idioma. Su licencia MIT facilita la integración en productos comerciales, y su tamaño moderado permite desplegarlo en hardware de gama media.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (encoder transformer) |
| Parametros totales | 559.890.432 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | turco (tr) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura XLM-RoBERTa, un encoder transformer diseñado para representaciones multilingües. Parte del checkpoint `intfloat/multilingual-e5-large-instruct`, que incorpora la formulación E5 con instrucciones de tarea (prefijo `Instruct: ...\nQuery: ...`) para mejorar la calidad de los embeddings en función del tipo de tarea. Sobre esa base, el equipo de COSMOS AI realizó un ajuste fino con conjuntos de datos en turco.

Según la cita bibliográfica incluida en la model card, el entrenamiento emplea aprendizaje contrastivo multi-positivo (multi-positive contrastive learning), una técnica que permite aprovechar múltiples pasajes positivos por consulta durante el entrenamiento, lo que suele mejorar la robustez de las representaciones en tareas de recuperación. El artículo asociado se presentó en la conferencia SIU 2025 (33rd Signal Processing and Communications Applications Conference). No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO (no aplicables habitualmente a modelos de embeddings).

## Capacidades

- Generación de embeddings de frases para consultas y documentos en turco.
- Recuperación de pasajes (passage retrieval) y búsqueda semántica.
- Extracción de características (feature extraction) mediante la pipeline de Hugging Face.
- Soporte de instrucciones de tarea mediante el formato E5 (`Instruct: ...\nQuery: ...`).
- Representaciones normalizadas aptas para similitud del coseno.
- Especialización monolingüe en turco (no se documenta soporte para otros idiomas).
- No dispone de tool calling, agentes, razonamiento multi-paso ni capacidades de visión o audio: es un modelo de embeddings, no generativo.

## Casos de uso

- Búsqueda semántica en corpus turcos: indexar documentos en turco y recuperar los pasajes más relevantes para una consulta, usando similitud del coseno sobre los embeddings normalizados.
- Sistemas de preguntas y respuestas (RAG) en turco: generar embeddings de fragmentos de conocimiento y de la pregunta del usuario para alimentar un generador con el contexto adecuado.
- Motores de búsqueda internos en empresas turcas: indexar documentación, correos o bases de conocimiento y ofrecer búsqueda por significado en lugar de por palabras clave.
- Deduplicación y agrupamiento de textos: calcular similitudes entre documentos turcos para detectar duplicados o agrupar contenidos temáticamente.
- Clasificación y filtrado de contenido: usar los embeddings como características de entrada para clasificadores posteriores (moderación, etiquetado, enrutamiento).
- Recomendación de contenido: comparar la representación vectorial de un artículo con la de otros para sugerir lecturas relacionadas en turco.
- Atención al cliente: recuperar respuestas de una base de conocimiento turca a partir de la consulta del usuario, integrado en un pipeline de soporte automatizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en precisión completa (fp32) el modelo ocupa aproximadamente 2,2 GB; en fp16 alrededor de 1,1 GB; en int8 aproximadamente 0,6 GB. Estas cifras son estimaciones a partir del número de parámetros.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para fp16; una NVIDIA RTX 3060, RTX 4060 o superior es suficiente. Para lotes grandes o indexación masiva, se recomiendan A100, H100 o L40S.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 4 GB o más de VRAM.
- Opciones de despliegue: `sentence-transformers` (recomendado por la model card), Hugging Face `transformers`, `text-embeddings-inference` (TGI), y servidores de embeddings como `infinity` o `fastembed`. No se documenta compatibilidad con llama.cpp u Ollama, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| veripazari/turkish-e5-large | 559,9 M | no disponible | turco | MIT | safetensors |
| intfloat/multilingual-e5-large-instruct | no disponible | no disponible | multilingüe | MIT | safetensors |
| ytu-ce-cosmos/turkish-e5-large (original) | 559,9 M | no disponible | turco | MIT | safetensors |

El modelo original de YTU y esta redistribución de VeriPazarı comparten pesos y licencia; la diferencia principal es el repositorio de alojamiento y la traducción de la documentación al turco. Frente al modelo base multilingüe, la versión turca está especializada mediante ajuste fino, aunque no se dispone de métricas comparativas publicadas en la información proporcionada.

## Limitaciones y advertencias

- Modelo monolingüe: la model card solo declara soporte para turco; su uso en otros idiomas no está garantizado.
- No es un modelo generativo: no produce texto, solo embeddings; no debe esperarse razonamiento, código ni respuestas conversacionales.
- Riesgo de sesgos: al entrenarse con datos en turco, puede heredar sesgos presentes en esos corpus; no se documentan evaluaciones de sesgo.
- Alucinación: no aplica en el sentido generativo, pero la recuperación puede devolver pasajes irrelevantes si la consulta está fuera de dominio.
- Longitud de contexto: no documentada; conviene verificar el truncamiento aplicado por el tokenizador de XLM-RoBERTa antes de indexar documentos largos.
- Licencia MIT: permite uso comercial, pero se recomienda conservar la atribución al grupo COSMOS AI y citar el artículo asociado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad en esta copia concreta; para producción se recomienda contrastar con el repositorio original `ytu-ce-cosmos/turkish-e5-large`.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/veripazari/turkish-e5-large
- Modelo original: https://huggingface.co/ytu-ce-cosmos/turkish-e5-large
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-large-instruct
- Plataforma VeriPazarı: https://veripazari.com.tr
- Grupo COSMOS AI (YTU): https://cosmos.yildiz.edu.tr/
- Artículo asociado (SIU 2025): doi 10.1109/SIU66497.2025.11112375
