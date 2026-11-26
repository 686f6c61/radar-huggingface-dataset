# tyrant35/zils-lite-vc2

## Resumen

zils-lite-vc2 es un ajuste fino (fine-tune) de un modelo de decisión denominado «Zils d3-lite», desarrollado por el usuario tyrant35. El modelo parte de un «soup» (mezcla de pesos por media aritmética) de dos variantes previas, joamCriff123/zils-lite-l1125a y joamCriff123/zils-lite-l1123q, sobre el que se aplica un LoRA de rango 64 en las proyecciones de atención. Su propósito declarado es responder preguntas de decisión tipadas: sí/no, elección entre opciones y puntuaciones.

El modelo cuenta con 852.985.920 parámetros (aproximadamente 853 millones) en formato safetensors, con un repositorio de 1,7 GB, lo que sugiere pesos en precisión de 16 bits. La licencia es Apache 2.0. No se especifican la arquitectura base, la longitud de contexto ni los idiomas soportados en la información disponible.

Su relevancia es limitada y experimental: se publica sin descargas ni interacciones, sin pipeline declarado y sin resultados de benchmarks. Está orientado a un nicho muy concreto (clasificación y decisión estructurada) más que a generación abierta, y su model card documenta con transparencia el proceso de destilación de datos y las posibles contaminaciones con benchmarks públicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base descrito como «d3-lite»; ajuste LoRA sobre proyecciones de atención) |
| Parametros totales | 852.985.920 |
| Parametros activos | no aplica (no se documenta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el tamaño de 1,7 GB para ~853 M parámetros es consistente con fp16/bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base «d3-lite»; solo se indica que zils-lite-vc2 es un fine-tune mediante LoRA de rango 64 aplicado sobre las proyecciones de atención de un «soup» formado por la media de dos checkpoints (joamCriff123/zils-lite-l1125a y joamCriff123/zils-lite-l1123q). El entrenamiento usó tasa de aprendizaje 3e-5, acumulación de gradiente 8 y una sola pasada, sin escalado del cambio introducido por el LoRA.

Los datos de entrenamiento consisten en aproximadamente 6.200 preguntas de decisión tipadas (sí/no, elección, puntuación) generadas por un modelo de lenguaje a partir de filas de los splits de entrenamiento de conjuntos de datos públicos etiquetados y de tareas de entrenamiento de BIG-bench, siguiendo la receta pública del script `scripts/author_exam.py`. Solo se conservaron los ítems en los que una pasada de respuesta a ciegas coincidía con la etiqueta. A ello se añaden 9.000 filas construidas a partir de datos de entrenamiento de conjuntos públicos y tareas de BIG-bench, usadas principalmente para preservar las probabilidades del «soup» original (peso de la etiqueta dorada 0,1 donde el soup fallaba y 0 en el resto). El peso dorado sobre las preguntas escritas fue de 0,9 donde el soup fallaba y 0,32 donde acertaba. No se documenta uso de RLHF ni DPO.

## Capacidades

- Respuesta a preguntas de decisión tipadas: sí/no, elección entre opciones y emisión de puntuaciones.
- Clasificación binaria y multiclase sobre entradas textuales cortas, derivada de su entrenamiento con ítems de BIG-bench y conjuntos públicos.
- Calibración de probabilidades orientada a preservar la distribución del modelo base (entrenamiento auxiliar con peso reducido en los aciertos del soup).
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Modo «thinking», visión o audio: no disponibles.

## Casos de uso

- Filtrado y moderación binaria: el modelo puede clasificar textos cortos como aptos o no aptos (sí/no) en un pipeline de preprocesado, aprovechando su entrenamiento específico en preguntas de decisión tipadas.
- Triaje de tickets de soporte: dado un mensaje breve, decidir entre un conjunto cerrado de categorías (elección) para enrutarlo al equipo adecuado.
- Puntuación de relevancia en motores de búsqueda internos: asignar una puntuación a pares consulta-documento para reordenar resultados antes de un reranker más costoso.
- Validación de respuestas en pipelines de anotación: comprobar de forma automática si una respuesta generada satisface una condición booleana definida por el equipo.
- Evaluación rápida de ítems de benchmark: usar el modelo como «examinador» ligero que responde preguntas de opción múltiple en pruebas internas de calidad de datos.
- Experimentación académica sobre «model soups» y LoRA: servir como caso de estudio reproducible de mezcla de checkpoints y ajuste de bajo rango en modelos pequeños (menos de 1.000 millones de parámetros).
- Despliegue en entornos con recursos limitados: con ~853 M parámetros y pesos de 1,7 GB, puede ejecutarse en una GPU de consumo para tareas de clasificación de alto volumen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB en fp16/bf16 para los pesos; en torno a 2-3 GB con overhead de activaciones y contexto para entradas cortas. En cuantización de 8 bits cabría en ~1 GB; en 4 bits, en ~0,5 GB (estimaciones, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y en la mayoría de casos sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU dedicadas modernas e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: vLLM, llama.cpp, Ollama y TGI son viables en principio si la arquitectura base es compatible; no se documenta compatibilidad explícita con ninguno de ellos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| zils-lite-vc2 | ~853 M | no disponible | Apache 2.0 | Fine-tune LoRA de un soup; orientado a decisiones tipadas |
| joamCriff123/zils-lite-l1123q | no disponible | no disponible | no disponible | Checkpoint base del soup |
| joamCriff123/zils-lite-l1125a | no disponible | no disponible | no disponible | Checkpoint base del soup |

No se dispone de información sobre benchmarks ni sobre modelos comparables de la misma categoría (clasificación de decisión tipada de menos de 1.000 millones de parámetros) en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo experimental sin descargas ni validación comunitaria; no hay evidencia pública de su rendimiento real.
- Contaminación potencial: el autor advierte que cinco filas de un conjunto de benchmark público de 2.865 ítems solapan en un 80% o más con el texto de entrenamiento, lo que puede inflar resultados en evaluaciones sobre ese conjunto.
- Los datos de entrenamiento fueron generados por un modelo de lenguaje y filtrados por auto-consistencia, lo que puede propagar sesgos y errores del generador.
- Riesgo de alucinación en tareas generativas: el modelo está diseñado para decisiones cerradas, no para generación abierta de texto.
- Idiomas soportados no documentados; no se garantiza un comportamiento correcto fuera del inglés de los conjuntos de datos de origen.
- Longitud de contexto desconocida; no apto para entradas largas sin verificación previa.
- Licencia Apache 2.0 permite uso comercial, pero la falta de documentación sobre la procedencia exacta de los datos de entrenamiento exige una revisión legal propia antes de producción.
- No se documentan sesgos específicos ni evaluaciones de seguridad; se recomienda auditar antes de cualquier despliegue con usuarios finales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tyrant35/zils-lite-vc2
- Modelo base 1: https://huggingface.co/joamCriff123/zils-lite-l1125a
- Modelo base 2: https://huggingface.co/joamCriff123/zils-lite-l1123q
