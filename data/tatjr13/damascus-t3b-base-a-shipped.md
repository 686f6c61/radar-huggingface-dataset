# tatjr13/damascus-t3b-base-a-shipped

# damascus-t3b-base-a-shipped

## Resumen

damascus-t3b-base-a-shipped es un artefacto de prueba publicado por el usuario tatjr13 en HuggingFace. No es un modelo entrenado desde cero: es una exportación en formato GGUF del modelo base tpnlabs/tpn-004-base (BF16, sha 5d425b36...) sobre el que únicamente se ha aplicado una cuantización mixta y una plantilla de chat ("chat template") recortada de 305 caracteres. El repositorio pesa 14,7 GB y cuenta con 23.572.403.200 parámetros (unos 23,57 mil millones) según los datos de safetensors.

El objetivo declarado por el autor es experimental: comprobar si una compresión más barata (el "layout A", con cuerpo Q4_K_M, embeddings de tokens Q8_0 y capa de salida Q6_K, todo con imatrix) pierde puntos en una métrica propia denominada "Fluid points" respecto a las referencias L1 y maxprec, ambas con un valor de 0,7193. La model card plantea la pregunta pero no publica el resultado, y el propio autor lo etiqueta explícitamente como "test artifact, not a competition entry".

Por su naturaleza, es relevante para quienes investigan el impacto de la cuantización en modelos conversacionales de ~23B, no como modelo de producción. Tiene 0 descargas y 0 "likes" en el momento de la consulta, sin licencia ni idiomas declarados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base es tpnlabs/tpn-004-base; no se especifica el tipo en la información) |
| Parámetros totales | 23.572.403.200 (~23,57 mil millones) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF mixto: Q4_K_M (cuerpo), Q8_0 (embedding de tokens), Q6_K (capa de salida), con imatrix |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (exportación A-im-q4km-q8e-q6o.gguf); el recuento de parámetros procede de safetensors |

## Arquitectura y entrenamiento

No hay información técnica publicada sobre la arquitectura subyacente ni sobre el proceso de entrenamiento. El modelo es una derivación directa de tpnlabs/tpn-004-base en BF16 (sha 5d425b36...), cuyos pesos se han mantenido "intactos" ("untouched") según el autor: no se ha realizado ningún ajuste fino adicional, solo la conversión a GGUF con una cuantización mixta. En consecuencia, cualquier detalle sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO o innovaciones como atención lineal o decodificación especulativa corresponde al modelo base, y no se detalla en la información disponible.

La única intervención técnica documentada es el esquema de cuantización ("layout A") y la plantilla de chat incluida (sha 885e0c70..., de 305 caracteres tras un proceso de "stripping"). El hash de la exportación GGUF es 11425d78.... No se documentan detalles sobre el calibrado del imatrix ni los criterios de elección de los tipos de cuantización por capa.

## Capacidades

- Generación de texto y finalización de secuencias: al tratarse de un modelo de lenguaje derivado de una base BF16, se asume capacidad de generación, si bien no está documentada explícitamente.
- Conversación: el repositorio incluye la etiqueta "conversational" y una plantilla de chat recortada, lo que apunta a uso en diálogo multi-turno.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo "thinking", visión, audio): no disponible.
- Compatibilidad con endpoints: incluye la etiqueta "endpoints_compatible", lo que sugiere que puede servirse mediante infraestructuras de inferencia compatibles con OpenAI-style endpoints.

## Casos de uso

- Evaluación del impacto de la cuantización: es el propósito declarado del artefacto. Permite medir si el "layout A" (Q4_K_M + Q8_0 + Q6_K con imatrix) degrada la métrica "Fluid points" frente a las referencias L1 y maxprec (0,7193), sirviendo como experimento controlado sobre un base sin tocar.
- Inferencia local en GPU de consumo: con 14,7 GB de pesos, el modelo cabe en tarjetas de 24 GB (RTX 4090, RTX 3090) mediante llama.cpp u Ollama, lo que permite probar un modelo de ~23B en hardware de escritorio.
- Reproducción y verificación de artefactos: los hashes de base, exportación GGUF y plantilla permiten reproducir exactamente el mismo binario y verificar la integridad del proceso de conversión.
- Experimentación con plantillas de chat: la plantilla recortada de 305 caracteres puede usarse para estudiar cómo afecta el formato de prompt al comportamiento del modelo base.
- Pruebas de compatibilidad de servidores de inferencia: la etiqueta "endpoints_compatible" permite verificar el despliegue en backends que exponen API tipo OpenAI sobre GGUF.
- Benchmarking comparativo de métodos de compresión: sirve para contrastar imatrix frente a cuantizaciones estándar sobre el mismo base, aislando la variable de la técnica de cuantización.
- Docencia e investigación sobre formatos GGUF: al ser un caso pequeño y aislado, resulta útil para ilustrar el mapeo entre tipos de cuantización y capas (cuerpo, embeddings, salida).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato numérico es la métrica propietaria "Fluid points" empleada por el autor:

| Métrica | damascus-t3b-base-a-shipped | Referencia L1 | Referencia maxprec |
|---|---|---|---|
| Fluid points | no reportado (la model card solo plantea la pregunta) | 0,7193 | 0,7193 |

La model card formula explícitamente la cuestión de si "una compresión más barata pierde puntos Fluid sobre el base sin tocar", pero no incluye el resultado de la medición. No se dispone de cifras comparativas adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 14,7 GB (tamaño del repositorio). Hay que sumar la caché KV, cuyo tamaño depende de la longitud de contexto y de las dimensiones internas del modelo, datos no disponibles.
- GPU recomendadas: RTX 4090 y RTX 3090 (24 GB) como opción de consumo; A6000 (48 GB), A100 (40/80 GB) y H100 (80 GB) para mayor contexto o mayor concurrencia.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en tarjetas de 24 GB con contexto moderado. En tarjetas de 16 GB (RTX 4080, 4060 Ti 16 GB) el margen es muy ajustado y requeriría descarga parcial a RAM o contextos muy cortos.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y otros runtimes GGUF. El soporte en vLLM o TGI para GGUF es limitado y debe verificarse.
- Latencia y throughput estimados: no disponible; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| damascus-t3b-base-a-shipped | 23,57 mil millones | no disponible | GGUF (Q4_K_M/Q8_0/Q6_K) | no disponible | Cuantización de prueba del base |
| tpnlabs/tpn-004-base | 23,57 mil millones (mismos pesos) | no disponible | BF16 (safetensors) | no disponible | Modelo base sin cuantizar; referencia directa |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de información de alternativas en la búsqueda realizada |

La comparación natural es contra el propio tpnlabs/tpn-004-base en BF16, del que este artefacto es una conversión cuantizada. No se dispone de datos de benchmarks ni de contexto para establecer comparaciones con terceros modelos.

## Limitaciones y advertencias

- Artefacto de prueba: el propio autor lo describe como "test artifact, not a competition entry"; no está pensado para uso en producción.
- Licencia no especificada: al no declararse licencia, existe incertidumbre legal sobre cualquier uso comercial del modelo y de sus pesos.
- Idiomas no declarados: se desconoce el soporte multilingüe real y el rendimiento por idioma.
- Riesgo de alucinación: no cuantificado; no hay evaluaciones publicadas de fidelidad o veracidad.
- Contexto desconocido: sin longitud de contexto documentada es imposible garantizar el comportamiento en conversaciones largas o tareas de recuperación extensa.
- Plantilla de chat recortada: el uso de una plantilla "stripped" puede alterar el comportamiento respecto al base original; conviene validarlo antes de confiar en el formato de diálogo.
- Calidad de la cuantización no verificada: la pregunta sobre la pérdida de "Fluid points" queda sin respuesta en la model card, por lo que no hay garantía de que el layout A preserve el rendimiento del base.
- Ausencia de adopción: 0 descargas y 0 "likes" implican que el modelo no ha sido validado por terceros.
- Procedencia del base no documentada aquí: cualquier característica (sesgos, datos de entrenamiento) del modelo tpn-004-base se hereda y no se detalla en esta ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tatjr13/damascus-t3b-base-a-shipped
- Modelo base referenciado en la model card: tpnlabs/tpn-004-base (no se ha localizado un enlace verificado en la búsqueda)
- No se han encontrado en la búsqueda web enlaces relevantes (papers, blogs, repos o demos) relacionados con este modelo; los resultados devueltos no guardan relación con el contenido de la ficha.
