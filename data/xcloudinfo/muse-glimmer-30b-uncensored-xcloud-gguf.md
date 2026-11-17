# xCloudinfo/Muse-Glimmer-30B-Uncensored-xCloud-GGUF

## Resumen

Muse-Glimmer-30B-Uncensored-xCloud es una versión modificada del modelo multimodal Muse-Glimmer-30B de meta-models, publicada por xCloudinfo (云碩科技) en formato GGUF para su uso con llama.cpp. El modelo base combina un backbone de texto denso de 29,6 mil millones de parámetros con un codificador visual dedicado y una ventana de contexto de 128K tokens, bajo licencia Apache-2.0. La intervención de xCloudinfo no consiste en un reentrenamiento, sino en una ablación direccional (abliteration) que elimina la dirección de rechazo de las matrices de escritura residual del decodificador de texto.

El resultado es un modelo que conserva las capacidades de visión del original —el codificador visual no se ha tocado y el mmproj de GGUF reutiliza los pesos de proyección del modelo base— pero que reduce los rechazos reflejos ante peticiones sensibles o de doble uso. Está pensado para investigación de seguridad, análisis de documentos, evaluación de red team y escritura creativa en entornos donde el modelo original rechazaría tareas legítimas.

La relevancia práctica de esta ficha reside en que ofrece una ruta de despliegue local de un modelo multimodal de ~28B en hardware de consumo, con cuantizaciones que van desde 52 GB en bf16 hasta 9,2 GB en IQ2_M, y con control explícito del esfuerzo de razonamiento mediante prompt de sistema.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (backbone de texto + codificador visual dedicado), 52 capas |
| Parámetros totales | 27.854.794.240 (~29,6B en el backbone de texto, según model card) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens (modelo base) |
| Tipos de cuantización | bf16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, IQ2_M |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), más mmproj.gguf e imatrix.dat |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 52 capas con un backbone de texto de 29,6B parámetros y un codificador visual independiente que alimenta al decodificador mediante proyección. La ventana de contexto alcanza los 128K tokens. La model card no detalla la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo fases de RLHF o DPO; esos datos no están disponibles en la información proporcionada.

La modificación de xCloudinfo aplica la técnica de ablación direccional descrita por Arditi et al. (2024), «Refusal in LLMs is mediated by a single direction». Concretamente, ortogonaliza la dirección de rechazo en las matrices de escritura residual del decodificador de texto: `self_attn.o_proj` y `mlp.down_proj` de cada una de las 52 capas, lo que suma 104 matrices intervenidas. El codificador visual queda intacto, de modo que la capacidad de comprensión de imágenes debería mantenerse equivalente a la del modelo original. La cuantización se realizó con importance matrix (imatrix) en los formatos IQ4_XS e IQ2_M, y el autor indica que el procesamiento y la cuantización se ejecutaron en su propio pool de cómputo.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 128K tokens.
- Comprensión de imágenes y texto combinados (pipeline image-text-to-text), incluyendo descripción, extracción de información y respuesta a preguntas sobre documentos visuales.
- Razonamiento con esfuerzo configurable: el modelo admite los niveles `low`, `high` y `xhigh` mediante una línea en el prompt de sistema (`Reasoning strength: low`), con `high` como valor por defecto.
- Capacidades de código y tareas agénticas de varios pasos, según la recomendación del autor de usar `high` o `xhigh` para esos escenarios.
- Soporte bilingüe inglés-chino.
- Respuesta directa ante peticiones sensibles o de doble uso, al haberse eliminado la capa de rechazo.
- Compatibilidad con el servidor de llama.cpp (`llama-server`) y con endpoints compatibles, según los tags del repositorio.

## Casos de uso

- Investigación de seguridad y red team: el modelo permite evaluar respuestas ante prompts adversarios sin los rechazos reflejos del modelo alineado, lo que facilita medir la robustez de sistemas y diseñar defensas.
- Análisis de documentos con componente visual: con `--mmproj` se pueden procesar capturas, formularios escaneados o diagramas y extraer información estructurada, aprovechando el codificador visual intacto y el contexto de 128K.
- Asistencia en dominio técnico especializado: preguntas y respuestas sobre documentación interna, normativa o manuales donde el modelo base podría rechazar por precaución temas de doble uso (por ejemplo, ciberseguridad defensiva).
- Escritura creativa y ficción: generación de narrativa que aborde violencia, conflicto o temas adultos sin bloqueos, con control de temperatura y top-p recomendados (`temp 0.6 / top_p 0.95 / top_k 64`).
- Despliegue local privado en hardware de consumo: con Q4_K_M (16 GB) o IQ4_XS (15 GB) se puede servir en una GPU de 24 GB, manteniendo los datos en la infraestructura propia.
- Evaluación comparativa de alineación: útil para estudiar empíricamente el efecto de la abliteración sobre calidad, coherencia y tasas de rechazo frente al modelo base.
- Automatización de tareas agénticas de código: con `Reasoning strength: high` o `xhigh` y tool calling a través de `--jinja`, para pipelines de generación y revisión de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): bf16 52 GB; Q8_0 28 GB; Q6_K 22 GB; Q5_K_M 19 GB; Q4_K_M 16 GB; IQ4_XS 15 GB; IQ2_M 9,2 GB. Añadir aproximadamente 1,4 GB si se carga el mmproj para visión.
- Hay que sumar la memoria de la caché KV, que crece con el contexto configurado; el ejemplo del autor usa `-c 8192`, muy por debajo del máximo de 128K.
- GPU recomendadas: A100 80 GB o H100 para bf16 y contextos largos; RTX 4090 (24 GB) o RTX 3090 para Q4_K_M e IQ4_XS con contexto moderado; para IQ2_M es viable una GPU de 12-16 GB o incluso CPU con suficiente RAM.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con Q4_K_M o IQ4_XS; en GPUs de 12 GB solo con IQ2_M y contexto reducido.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), y por extensión cualquier frontend compatible con GGUF (Ollama, LM Studio, Jan) si acepta el par de ficheros modelo + mmproj. No se documenta soporte de vLLM o TGI para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-Uncensored-xCloud | ~29,6B (27,85B reales) | 128K | Texto + visión | Apache-2.0 | GGUF |
| Muse-Glimmer-30B (base) | ~29,6B | 128K | Texto + visión | Apache-2.0 | Pesos originales (safetensors, presumiblemente) |
| Alternativas abliterated de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación más directa es con el modelo base: misma arquitectura, mismos parámetros y mismo contexto, con la diferencia de la eliminación de la dirección de rechazo y la conversión a GGUF. No se dispone de datos de benchmarks que permitan comparar rendimiento con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- La eliminación de la capa de rechazo implica que el modelo puede responder directamente a peticiones sensibles o de doble uso; el usuario asume toda la responsabilidad legal, regulatoria y ética del despliegue.
- La abliteración puede degradar la coherencia o la calidad en tareas benignas, aunque no se aportan métricas que cuantifiquen ese efecto.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones de fidelidad factual.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está garantizado ni evaluado.
- El contexto máximo es de 128K, pero el ejemplo de despliegue del autor usa 8192 tokens; contextos mayores exigen más memoria para la caché KV.
- El razonamiento por defecto es `high`, lo que incrementa la latencia y el consumo de tokens en producción si no se ajusta a `low` en el prompt de sistema.
- La licencia Apache-2.0 permite uso comercial, pero el autor declara el modelo para «investigación interna y validación técnica» y declina responsabilidad sobre las salidas.
- El repositorio tiene 0 likes y unas 1395 descargas en el momento de la consulta, lo que indica una validación comunitaria escasa.
- No se documentan evaluaciones de sesgo; al derivar de un modelo base con alineación parcialmente eliminada, los sesgos del original pueden aflorar con menos filtros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/xCloudinfo/Muse-Glimmer-30B-Uncensored-xCloud-GGUF
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Organización xCloudinfo: https://hf.co/xCloudinfo
- Paper de referencia de la técnica de abliteración: Arditi et al. (2024), «Refusal in LLMs is mediated by a single direction» (no se proporciona URL en la información disponible)
- llama.cpp: no se proporciona URL en la información disponible
