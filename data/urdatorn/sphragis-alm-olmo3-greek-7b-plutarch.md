# Urdatorn/sphragis-alm-olmo3-greek-7b-plutarch

## Resumen

El modelo `Urdatorn/sphragis-alm-olmo3-greek-7b-plutarch` es un modelo de lenguaje autorizado (authorial language model, ALM) diseñado específicamente para la atribución de autoría en griego antiguo. Forma parte del benchmark Sphragis, desarrollado por Urdatorn, que incluye diecisiete modelos similares, cada uno entrenado sobre las sentencias de un autor clásico distinto. Este modelo concreto se ha entrenado exclusivamente con las frases de Plutarco procedentes del dataset Sphragis, con el objetivo de calcular la perplejidad de una sentencia y así determinar si fue escrita por ese autor.

El modelo se basa en `Urdatorn/olmo3-7b-ancient-greek`, que a su vez es una adaptación del modelo OLMo 3 de Ai2, con 7.298 millones de parámetros. La arquitectura es un transformer denso de 7B, con una longitud de contexto no especificada en la información disponible. La licencia es `other`, debido a que los datos de entrenamiento provienen de fuentes con licencias mixtas, incluida CC BY-NC-SA, lo que restringe el uso comercial. Su relevancia actual radica en la creciente necesidad de herramientas fiables para la autenticación y análisis estilístico de textos clásicos, donde los modelos de lenguaje específicos por autor pueden superar a los enfoques tradicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en OLMo 3) |
| Parámetros totales | 7.298.011.136 (7,3B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos bf16) |
| Idiomas soportados | griego antiguo (grc) |
| Licencia | other (no Apache-2.0, por datos con licencias mixtas) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de OLMo 3, un transformer decoder denso con 7B parámetros, entrenado originalmente para razonamiento de contexto largo, función calling y código. En este caso, se ha realizado un further-pretraining (entrenamiento continuado) sobre el modelo base `Urdatorn/olmo3-7b-ancient-greek`, que ya estaba adaptado al griego antiguo. El entrenamiento consistió en un objetivo de modelado causal de lenguaje sobre secuencias formadas por `<|endoftext|> sentence <|endoftext|>`, con una sola sentencia por secuencia. Se usaron 1.300 sentencias de Plutarco (225.722 tokens puntuados) del split de entrenamiento de Sphragis.

El entrenamiento se detuvo por early stopping basado en la pérdida de validación de las sentencias del propio autor, con un máximo de 20 épocas y paciencia 3; la mejor época fue la 1.0 con una pérdida de validación de 0.8409 nats/token. Se empleó una tasa de aprendizaje constante de 1e-5 tras 25 pasos de warmup, un batch efectivo de 16 sentencias, y precisión fp32 para los pesos maestros con cómputo en bf16. El entrenamiento se realizó con FSDP full shard sobre 2 GPUs GH200. Los pesos finales se guardaron en bf16. A diferencia del método original de Huang et al. (2025) que fijaba 100 épocas, aquí se seleccionó la duración mediante evidencia de validación.

## Capacidades

- Generación de texto en griego antiguo (aunque su propósito principal es el scoring de perplejidad).
- Atribución de autoría: dado un texto, calcula la perplejidad por token y permite comparar con otros dieciséis modelos para decidir el autor más probable.
- Modelo de lenguaje especializado en el estilo de Plutarco, capturando patrones léxicos, sintácticos y estilísticos propios de este autor.
- Soporte para evaluación de sentencias individuales, no solo párrafos largos.
- Multilingüe no aplica: solo griego antiguo.
- No incluye capacidades de tool calling, agentes o razonamiento multi-paso; es un modelo de LM básico.

## Casos de uso

- **Atribución de autoría en textos clásicos**: dado un fragmento griego antiguo, el modelo calcula la perplejidad y permite decidir si fue escrito por Plutarco o por otro autor de la lista de Sphragis. Es útil para autenticar obras dudosas o fragmentos anónimos.
- **Análisis estilométrico**: el modelo puede servir como herramienta para identificar características estilísticas propias de Plutarco, como el uso de ciertas partículas, estructuras de subordinación o elecciones léxicas, facilitando estudios filológicos.
- **Investigación académica en humanidades digitales**: los investigadores pueden integrar este modelo en pipelines de análisis de corpus para clasificar textos por autor, complementando métodos estadísticos tradicionales.
- **Detección de falsificaciones o interpolaciones**: en la edición crítica de textos, el modelo puede señalar pasajes que se desvían del estilo del autor, lo que ayuda a detectar adiciones posteriores.
- **Enseñanza de griego antiguo**: aunque no es su uso principal, el modelo puede generar ejemplos de texto en el estilo de Plutarco para ejercicios de traducción o análisis sintáctico.
- **Comparación de métodos de atribución**: sirve como componente de referencia en el benchmark Sphragis, permitiendo a otros investigadores evaluar sus propios sistemas de atribución frente a los diecisiete modelos.

## Benchmarks y rendimiento

En la model card se indica que el conjunto de los diecisiete modelos ALM alcanza un **macro-F1 de 0,800** en el split de validación `sentence_1` del benchmark Sphragis. Cuando los mismos modelos se entrenan desde el base sin adaptar al griego antiguo (es decir, desde el OLMo-3 original), el macro-F1 es de 0,812. Esto sugiere que la adaptación previa al griego mejora la perplejidad pero no aumenta la discriminación entre autores. No se proporcionan otros resultados de benchmarks (como MMLU o HumanEval) porque este modelo no está diseñado para esas tareas.

| Modelo | Macro-F1 (validación Sphragis) |
|---|---|
| 17 ALM con base adaptado (incluye este modelo) | 0,800 |
| 17 ALM con base sin adaptar | 0,812 |

## Requisitos de hardware

- Para inferencia con pesos bf16, se necesitan aproximadamente 14,6 GB de VRAM (7,3B parámetros × 2 bytes), por lo que cabe en una GPU con 16 GB o más (por ejemplo, RTX 4090, A10G, L4).
- Si se cuantiza a 4 bits (por ejemplo, con GPTQ o AWQ), la VRAM se reduce a unos 4 GB, permitiendo ejecución en GPUs de consumo como RTX 3060 o incluso en CPU con llama.cpp.
- No se han publicado requisitos específicos de hardware del modelo, pero al ser un modelo de 7B, es compatible con frameworks como vLLM, llama.cpp, Ollama o TGI, siempre que se conviertan los pesos a los formatos adecuados (GGUF, etc.).
- La latencia típica para generación en una RTX 4090 sería de unos 30-50 tokens/s, pero al usarse principalmente para scoring de perplejidad, el throughput es alto porque solo se procesa una secuencia corta (una sentencia).

## Comparativa con modelos similares

La comparativa directa no está disponible porque no se han publicado otros modelos de atribución de autoría específicos para griego antiguo con la misma metodología. Sin embargo, se puede comparar con el modelo base `Urdatorn/olmo3-7b-ancient-greek`, que es un modelo de lenguaje general en griego antiguo sin especialización en autoría. El modelo Sphragis-Plutarch ha sido entrenado para minimizar la pérdida en las sentencias de Plutarco, por lo que su perplejidad sobre textos de Plutarco será menor que la del base, pero no se dispone de métricas cuantitativas directas.

| Modelo | Parámetros | Contexto | Especialización | Licencia |
|---|---|---|---|---|
| `sphragis-alm-olmo3-greek-7b-plutarch` | 7,3B | no disponible | Atribución de autoría (Plutarco) | other |
| `olmo3-7b-ancient-greek` | 7,3B | no disponible | Griego antiguo general | Apache-2.0 |
| `allenai/Olmo-3-7B-Instruct` | 7,3B | no disponible | Chat e instrucciones multilingüe | Apache-2.0 |

## Limitaciones y advertencias

- **Entrenamiento limitado**: solo se ha entrenado con 1.300 sentencias de Plutarco, lo que puede provocar sobreajuste al estilo específico de los textos seleccionados y reducir la generalización a otros textos de Plutarco o a variantes dialectales.
- **Riesgo de alucinación**: al ser un modelo de lenguaje, puede generar texto que no sea fiel al estilo real de Plutarco si se usa para generación, aunque no es su propósito.
- **Licencia restrictiva**: la licencia `other` no permite uso comercial sin verificar las licencias de los datos de entrenamiento (incluyen CC BY-NC-SA). Cualquier uso en producción debe revisar el archivo `LICENSES.md` del dataset Sphragis.
- **Solo griego antiguo**: el modelo no funciona en otros idiomas, ni siquiera en griego moderno.
- **Sin capacidades de razonamiento o herramientas**: no soporta tool calling ni agentes, y su rendimiento en tareas de razonamiento complejo es bajo, porque no fue entrenado para ello.
- **No se han publicado métricas de robustez**: no hay pruebas sobre textos corruptos, OCR o variantes dialectales, por lo que su comportamiento en esos escenarios es desconocido.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Urdatorn/sphragis-alm-olmo3-greek-7b-plutarch)
- [Modelo base: Urdatorn/olmo3-7b-ancient-greek](https://huggingface.co/Urdatorn/olmo3-7b-ancient-greek)
- [Dataset Sphragis](https://huggingface.co/datasets/Urdatorn/sphragis)
- [Código de entrenamiento y scoring](https://github.com/Urdatorn/sphragis_models)
- [Artículo de Huang, Murakami y Grieve (2025) en PLoS ONE](https://doi.org/10.1371/journal.pone.0327081)
- [Página oficial de OLMo (Ai2)](https://allenai.org/olmo)
- [Paper de Olmo 3 en arXiv](https://arxiv.org/abs/2512.13961)
