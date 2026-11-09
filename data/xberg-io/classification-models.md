# xberg-io/classification-models

## Resumen

`xberg-io/classification-models` es un repositorio de Hugging Face que no contiene un modelo entrenado por su autor, sino una colección de exportaciones ONNX de terceros copiadas sin modificar, empaquetadas por el proyecto xberg para su evaluación interna. En el momento de la última actualización (9 de noviembre de 2026) el repositorio alberga un único directorio, `nli-minilm2-l6-h768`, que corresponde al cross-encoder `cross-encoder/nli-MiniLM2-L6-H768`, un modelo de inferencia de lenguaje natural (NLI) y clasificación zero-shot de tres clases.

El modelo subyacente es un cross-encoder basado en MiniLMv2 con tokenizador RoBERTa, destilado de RoBERTa-Large, con 6 capas y dimensión oculta de 768. Se distribuye en formato ONNX con cuantizaciones dinámicas qint8 (arm64) y quint8 (avx2), además de la versión fp32 original. La licencia del cross-encoder es Apache-2.0, aunque el modelo base declara que no tiene licencia en su model card.

La relevancia de este repositorio es limitada y muy específica: el propio autor lo etiqueta como "candidatos experimentales, no cualificados", sin que ninguno de sus contenidos sea un preset soportado ni una decisión de empaquetado de xberg. Cualquier consumidor debe fijar la revisión del commit y verificar los SHA-256 del `manifest.json`; no se debe resolver la rama `main`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cross-encoder transformer (MiniLMv2, 6 capas, dimensión oculta 768, tokenizador RoBERTa) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | fp32, qint8 dinámica (arm64), quint8 dinámica (avx2) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (cross-encoder); el modelo base no declara licencia |
| Formato de pesos | ONNX (con tokenizer, processor y generation config incluidos) |

## Arquitectura y entrenamiento

El modelo subyacente es un cross-encoder de la familia MiniLMv2, destilado de RoBERTa-Large, con 6 capas y dimensión oculta de 768. Emplea el tokenizador de RoBERTa y produce tres logits de clasificación: 0 para contradicción, 1 para implicación (entailment) y 2 para neutralidad. Está pensado para tareas de NLI y clasificación zero-shot mediante pares (premisa, hipótesis).

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El repositorio no aporta detalles adicionales más allá de la procedencia upstream y la revisión concreta (`b95119ce93d3e065de6214e38cd4a97b0f2f2c6d`). La innovación técnica destacable es el empaquetado reproducible: cada directorio conserva el `LICENSE`, `UPSTREAM_README.md`, tokenizer, processor, generation config y todos los grafos necesarios, con un `manifest.json` que lista SHA-256 y tamaño de cada fichero junto con la revisión upstream.

## Capacidades

- Clasificación NLI de tres clases (contradicción, implicación, neutralidad) sobre pares de textos.
- Clasificación zero-shot mediante formulación de hipótesis.
- Inferencia ONNX en fp32 y en cuantizaciones dinámicas qint8 (arm64) y quint8 (avx2).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Verificación de implicación textual en pipelines de RAG: el cross-encoder puntúa si un fragmento recuperado implica la afirmación del usuario, permitiendo filtrar contextos irrelevantes antes de la generación.
- Detección de contradicciones en bases de conocimiento: comparar pares de afirmaciones para marcar inconsistencias en documentación técnica o corpus internos.
- Clasificación zero-shot de tickets de soporte: formular etiquetas como hipótesis y seleccionar la de mayor logit de implicación para enrutar consultas.
- Moderación semántica ligera: evaluar si un mensaje implica una política prohibida mediante pares (mensaje, política) y umbral sobre el logit de entailment.
- Evaluación de fidelidad en resúmenes: comprobar si cada frase del resumen está implicada por el documento fuente.
- Despliegue en entornos con recursos limitados: las cuantizaciones qint8/quint8 permiten ejecución en CPU arm64 o avx2 dentro de servicios de clasificación de baja latencia.
- Filtrado previo en pipelines de anotación: descartar pares no informativos antes de enviarlos a un modelo mayor, reduciendo coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio completo ocupa 0,5 GB, por lo que la inferencia en fp32 requiere un orden de magnitud inferior a 1 GB de memoria.
- GPU recomendadas: no disponible; al ser un modelo de 6 capas y 768 de dimensión, es viable en CPU y en GPUs de gama baja.
- Cabida en GPU de consumo: previsiblemente sí en cualquier GPU de consumo moderna, aunque no se aportan mediciones.
- Opciones de despliegue: runtime ONNX (onnxruntime) con los grafos incluidos; soporte para ejecución en CPU arm64 (qint8) y avx2 (quint8).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| xberg-io/classification-models (nli-minilm2-l6-h768) | Cross-encoder MiniLMv2 6 capas, 768 dim | no disponible | Apache-2.0 (base sin licencia declarada) | ONNX (fp32, qint8, quint8) | Copia sin modificar de upstream, candidato experimental |
| cross-encoder/nli-MiniLM2-L6-H768 | Cross-encoder MiniLMv2 6 capas, 768 dim | no disponible | Apache-2.0 | safetensors/PyTorch (upstream) | Modelo original del que procede la copia |
| nreimers/MiniLMv2-L6-H768-distilled-from-RoBERTa-Large | MiniLMv2 6 capas, 768 dim | no disponible | no declarada en su card (origen microsoft/unilm, MIT) | PyTorch | Modelo base de destilación |

## Limitaciones y advertencias

- El repositorio no contiene un modelo propio: es una copia sin modificar de exportaciones ONNX de terceros, por lo que cualquier incidencia debe resolverse contra el upstream.
- El autor lo marca explícitamente como "experimental, no cualificado": no es un preset soportado ni una decisión de empaquetado de xberg.
- Los consumidores deben fijar la revisión del commit (registrada en `crates/xberg/src/candidate_models/`) y verificar los SHA-256 del `manifest.json`; no se debe resolver `main`.
- El modelo base `nreimers/MiniLMv2-L6-H768-distilled-from-RoBERTa-Large` no declara licencia en su model card, lo que introduce incertidumbre jurídica pese a que el cross-encoder declare Apache-2.0.
- No se declaran idiomas soportados; el rendimiento fuera del inglés es desconocido.
- No se dispone de datos sobre sesgos, tasa de alucinación ni robustez en dominios específicos.
- No hay información sobre latencia, throughput ni requisitos de memoria medidos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/xberg-io/classification-models
- Proyecto xberg: https://github.com/xberg-io/xberg
- Issues de referencia: xberg-io/xberg#2334, xberg-io/xberg#2336
- Modelo upstream: https://huggingface.co/cross-encoder/nli-MiniLM2-L6-H768
- Modelo base de destilación: https://huggingface.co/nreimers/MiniLMv2-L6-H768-distilled-from-RoBERTa-Large
