# yoelkn/hebcaps-ner-onnx

## Resumen

HebCaps NER (ONNX, int8) es una exportación a ONNX con cuantización dinámica a int8 del modelo `dicta-il/dictabert-ner` de Dicta, especializado en reconocimiento de entidades nombradas (NER) en hebreo moderno. Lo publica el usuario `yoelkn` como componente del proyecto HebCaps, cuyo objetivo es preservar nombres propios, lugares y organizaciones al generar subtítulos o leyendas en hebreo. El repositorio contiene únicamente los artefactos de inferencia (`model.onnx`, `tokenizer.json` y `ner.json` con el mapeo `id2label`), no los pesos en formato original.

Técnicamente se trata de un modelo de clasificación de tokens derivado de DictaBERT, la suite de BERT para hebreo moderno presentada por Shmidman et al. (2023), que constituye el estado del arte en diversas tareas de procesamiento del lenguaje natural en hebreo. La exportación a ONNX con cuantización int8 busca reducir el peso y el coste computacional para despliegues ligeros, a costa de una posible pérdida de precisión que el autor no documenta.

Su relevancia es acotada: no es un modelo nuevo ni un checkpoint entrenado desde cero, sino un artefacto de despliegue para una tarea concreta (NER en hebreo) dentro de un pipeline mayor. Resulta útil para quien necesite integrar NER hebreo en entornos con runtime ONNX y recursos limitados, pero carece de benchmarks propios, de documentación sobre el proceso de cuantización y de métricas de degradación respecto al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (derivada de DictaBERT); exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinámica (ONNX) |
| Idiomas soportados | hebreo (he) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`model.onnx`); incluye `tokenizer.json` y `ner.json` |

## Arquitectura y entrenamiento

El modelo base `dicta-il/dictabert-ner` es un encoder transformer de la familia BERT adaptado al hebreo moderno dentro de la suite DictaBERT. Sobre esa base se aplica una cabeza de clasificación de tokens para etiquetar entidades nombradas. La versión publicada aquí no incluye información sobre el corpus de entrenamiento, el número de tokens, la composición del dataset ni si hubo ajuste fino adicional con datos propios del autor.

La única transformación documentada es la exportación a ONNX con cuantización dinámica a int8, que convierte los pesos de punto flotante a enteros de 8 bits en tiempo de ejecución para las operaciones de matriz. El autor no especifica la herramienta de exportación, la versión de opset, el conjunto de calibración ni las métricas de degradación respecto al checkpoint original. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Reconocimiento de entidades nombradas en hebreo: identificación de nombres de personas, lugares y organizaciones en texto hebreo.
- Clasificación a nivel de token con etiquetas definidas en `ner.json` (mapeo `id2label`).
- Inferencia mediante runtime ONNX, sin dependencia de PyTorch en producción.
- Modelo ligero (repositorio de 0,2 GB) apto para entornos con recursos limitados.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada al hebreo; no se documenta soporte para otros idiomas.

## Casos de uso

- Extracción de entidades en subtítulos y leyendas: el modelo se integra en el pipeline HebCaps para detectar nombres propios, topónimos y organizaciones y evitar que se pierdan o se traduzcan incorrectamente al generar la leyenda.
- Enriquecimiento de metadatos en archivos audiovisuales en hebreo: etiquetar automáticamente personas y lugares mencionados en transcripciones para facilitar la búsqueda y el archivado.
- Anonimización de documentos: detectar nombres de personas en textos hebreos antes de publicarlos o compartirlos, sustituyéndolos por marcadores.
- Procesamiento de noticias en hebreo: extraer organizaciones y localizaciones de titulares y cuerpos de noticia para alimentar índices temáticos o sistemas de recomendación.
- Preprocesamiento para pipelines de RAG en hebreo: identificar entidades en los documentos antes de la indexación para mejorar la recuperación y el filtrado por entidad.
- Despliegue en el borde o en servidores modestos: al ser un ONNX int8 de tamaño reducido, puede ejecutarse en CPU sin GPU y con latencia baja para volúmenes moderados de texto.
- Moderación y análisis de contenido: localizar menciones a personas u organizaciones en foros y comentarios en hebreo para su revisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; al tratarse de un ONNX int8 de un encoder BERT, el peso del modelo es del orden de cientos de megabytes, por lo que la inferencia en CPU es viable.
- GPU recomendadas: no disponible. Cualquier GPU con soporte de ONNX Runtime (por ejemplo, series RTX o A100/H100) podría ejecutar el modelo, pero el autor no documenta requisitos ni pruebas.
- Compatibilidad con GPU de consumo: probable en GPUs de consumo con soporte ONNX Runtime, aunque no está verificada ni documentada.
- Opciones de despliegue: ONNX Runtime (CPU o GPU); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no están orientados a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| yoelkn/hebcaps-ner-onnx | no disponible | no disponible | NER en hebreo | CC BY 4.0 | ONNX int8 | HuggingFace |
| dicta-il/dictabert-ner | no disponible | no disponible | NER en hebreo | no disponible en la informacion proporcionada | safetensors/PyTorch (formato original de DictaBERT) | HuggingFace |
| dicta-il/dictabert | no disponible | no disponible | Modelo base BERT para hebreo | no disponible en la informacion proporcionada | safetensors/PyTorch | HuggingFace |

La comparación se limita al modelo base y a su encoder de origen, ya que no se dispone de datos sobre alternativas de NER en hebreo con parámetros, contexto o rendimiento verificables en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado métricas de rendimiento ni de degradación por la cuantización int8 respecto al modelo base; la pérdida de precisión es desconocida.
- El modelo está limitado al hebreo; no se documenta comportamiento en otros idiomas ni en texto mixto hebreo-inglés.
- Riesgo de alucinación y de falsos positivos o negativos en la detección de entidades, especialmente en dominios especializados o con nombres poco frecuentes.
- Sesgos potenciales heredados del corpus de entrenamiento de DictaBERT y del ajuste fino de `dictabert-ner`; el autor no documenta análisis de sesgo.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero exige citar al autor original (Dicta, Shmidman et al., 2023) y al publicador de la exportación.
- El repositorio no incluye los pesos originales ni scripts de exportación, lo que dificulta la reproducibilidad y la auditoría del proceso de cuantización.
- Sin mantenimiento documentado: 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validación por parte de la comunidad.
- No apto para tareas generativas, de razonamiento o de agente; su uso está restringido a clasificación de tokens.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yoelkn/hebcaps-ner-onnx
- Modelo base: https://huggingface.co/dicta-il/dictabert-ner
- Referencia de DictaBERT (Shmidman et al., 2023): no disponible en la informacion proporcionada
- Repositorio o demo del proyecto HebCaps: no disponible en la informacion proporcionada
