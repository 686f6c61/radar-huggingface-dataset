# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch19

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch19` es un checkpoint de investigación derivado de Phi-1.5, publicado por el colectivo unl-reset en HuggingFace. Se trata de un ajuste fino sobre `locuslab/tofu_ft_phi-1.5` (a su vez un fine-tune de `microsoft/phi-1_5` sobre el dataset TOFU) cuyo objetivo es el *unlearning* selectivo: eliminar el conocimiento asociado a un subconjunto concreto del dataset (la partición `forget10`) manteniendo el rendimiento en el resto (partición `retain`). El checkpoint corresponde a la época 19 de 20 de un proceso de entrenamiento con una receta denominada "IHL + Reset Both".

La relevancia de este modelo es metodológica más que práctica: forma parte de la línea de trabajo de *machine unlearning* evaluada sobre TOFU (Task of Fictitious Unlearning), un benchmark académico que mide la capacidad de un modelo de olvidar datos sintéticos de autores ficticios sin degradar su utilidad general. La innovación concreta del checkpoint es la reinicialización de los *input embeddings* y de la cabeza del modelo de lenguaje (`LM head`) a partir de los pesos originales de `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan del modelo ajustado con TOFU. El entrenamiento combina una pérdida de tipo IHL (probablemente *Inverted Hinge Loss* o una variante de *unlearning loss* basada en márgenes) sobre la partición de olvido con una entropía cruzada estándar ponderada con coeficiente 1.0 sobre la partición de retención.

Arquitectónicamente es un transformer decoder-only de 1.418 millones de parámetros (aproximadamente 1.3B), el tamaño característico de Phi-1.5, con licencia Apache 2.0 y pesos en formato safetensors. No se dispone de información pública sobre la longitud de contexto efectiva, los idiomas soportados más allá del inglés declarado, ni resultados de benchmarks en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con `custom_code` |
| Parámetros totales | 1.418.270.720 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_phi-1.5 (fine-tune de microsoft/phi-1_5 sobre TOFU) |
| Tamaño del repositorio | 2.8 GB |
| Época del checkpoint | 19 de 20 |
| Partición de olvido | forget10 (TOFU) |
| Receta de entrenamiento | IHL sobre forget + 1.0 · CE sobre retain; embeddings y LM head reinicializados desde microsoft/phi-1_5 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Phi-1.5: un transformer decoder-only denso de aproximadamente 1.3B parámetros, entrenado originalmente por Microsoft sobre datos de texto y código de calidad filtrada. Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplicó un ajuste fino supervisado con el dataset TOFU, que contiene pares pregunta-respuesta sobre 200 autores ficticios divididos en particiones de olvido (`forget10`, el 10 % de los autores) y retención (`retain90`). El checkpoint que nos ocupa se obtiene a partir de ese modelo ajustado mediante una receta de *unlearning* que combina dos señales: una pérdida IHL aplicada exclusivamente sobre la partición `forget10`, y una entropía cruzada estándar con peso 1.0 sobre la partición de retención.

La innovación técnica declarada en la model card es la reinicialización parcial: los *input embeddings* y la `LM head` se restauran desde los pesos originales de `microsoft/phi-1_5`, mientras que el resto de los pesos del transformer se mantienen desde `locuslab/tofu_ft_phi-1.5`. Esta estrategia busca romper la asociación directa entre tokens de entrada y respuestas memorizadas en la cabeza de salida, un punto habitualmente crítico en los métodos de *unlearning* sobre modelos pequeños. No se especifican en la información disponible el número de tokens vistos durante el entrenamiento de *unlearning*, la composición exacta del dataset más allá de TOFU, ni si se emplearon técnicas de RLHF o DPO (no procede en este contexto, al ser un fine-tune supervisado). El repositorio incluye un fichero `ihl_manifest.json` con metadatos del proceso, y el modelo requiere `trust_remote_code=True` por el uso de `custom_code`.

## Capacidades

- Generación de texto en inglés con un modelo de 1.3B parámetros, adecuado para tareas de lenguaje natural de complejidad media.
- Razonamiento básico y respuesta a preguntas, heredado del ajuste fino sobre TOFU (preguntas y respuestas sobre autores ficticios).
- Capacidad de *unlearning* selectivo: el checkpoint está diseñado para haber olvidado la partición `forget10` del dataset TOFU, lo que lo convierte en un artefacto de investigación para estudiar la eficacia del olvido.
- Capacidades de código y matemáticas limitadas, heredadas de Phi-1.5 pero potencialmente degradadas por el proceso de *unlearning*.
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés declarado; no hay evidencia de soporte multilingüe.
- Modo *thinking* explícito, visión o audio: no disponible.

## Casos de uso

- **Investigación en *machine unlearning***: el modelo sirve como checkpoint de referencia para medir la eficacia de la receta IHL + Reset Both sobre la partición `forget10` de TOFU, comparándolo con otros métodos de olvido publicados en la literatura.
- **Evaluación de la retención de utilidad tras el olvido**: al conservar la CE sobre `retain`, permite medir la degradación en la partición de retención y comparar la curva de *trade-off* entre olvido y utilidad en la época 19/20.
- **Estudio de la reinicialización de embeddings y LM head**: el checkpoint permite analizar empíricamente si restaurar la cabeza desde el modelo base reduce la memorización sin destruir la capacidad generativa, un experimento reproducible sobre un modelo de 1.3B.
- **Reproducibilidad de experimentos TOFU**: al ser un checkpoint completo y autónomo (no un *adapter*), puede cargarse directamente con `transformers` y `trust_remote_code=True` para replicar métricas de *forget quality* y *retain quality*.
- **Análisis de robustez frente a ataques de extracción**: útil para estudiar si un adversario puede recuperar información de la partición `forget10` mediante *prompting* o *fine-tuning* posterior, un eje central en la evaluación de TOFU.
- **Docencia y divulgación sobre privacidad en IA**: modelo pequeño (1.3B) que cabe en GPU de consumo y permite demostrar en un entorno controlado cómo se comporta un modelo tras un proceso de olvido selectivo.
- **Comparación de metodologías de *unlearning***: serviría como una de las variantes en un *benchmark* interno que compare IHL, Gradient Ascent, NPO u otras pérdidas sobre el mismo modelo base y la misma partición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada en fp16**: aproximadamente 2.8 GB solo para pesos (1.418 M parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB para inferencia con contexto moderado.
- **VRAM estimada en cuantización de 8 bits**: en torno a 1.5–2 GB de pesos, con un total práctico de 3–4 GB.
- **VRAM estimada en cuantización de 4 bits**: en torno a 0.8–1 GB de pesos, con un total práctico de 2–3 GB.
- **GPU recomendadas**: cualquier GPU con al menos 6 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son válidas. Cabe holgadamente en GPU de consumo.
- **Compatibilidad con GPU de consumo**: sí, en todas las GPU modernas con 6 GB o más; también puede ejecutarse en CPU con `llama.cpp` si se convierte a GGUF, aunque el `custom_code` puede complicar la conversión.
- **Opciones de despliegue**: `transformers` con `trust_remote_code=True` es la vía natural; vLLM y TGI requerirían verificar compatibilidad con el `custom_code`; `llama.cpp`/Ollama requerirían conversión a GGUF, no documentada en la información disponible.
- **Latencia y throughput estimados**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-phi-1_5-...-epoch19 (este) | 1.418 M | no disponible | Apache 2.0 | *Unlearning* TOFU (IHL + Reset Both) | HuggingFace, 0 descargas |
| locuslab/tofu_ft_phi-1.5 | ~1.3B | no disponible | Apache 2.0 (heredada) | Fine-tune TOFU sin olvido | HuggingFace |
| microsoft/phi-1_5 | ~1.3B | 2.048 tokens (según documentación pública de Phi-1.5) | MIT | Modelo base de texto y código | HuggingFace, ampliamente usado |
| Otros checkpoints TOFU de la literatura (p. ej. NPO, Gradient Ascent sobre Phi-1.5) | ~1.3B | no disponible | Apache 2.0 / MIT | Distintas pérdidas de *unlearning* | HuggingFace, variable |

La comparativa se limita al mismo tamaño y familia (Phi-1.5) porque el checkpoint es un artefacto de investigación sobre TOFU; no tiene sentido compararlo con modelos de propósito general de mayor escala. Frente a `locuslab/tofu_ft_phi-1.5`, la diferencia es la receta de olvido; frente a `microsoft/phi-1_5`, la diferencia es el ajuste fino sobre TOFU y la reinicialización parcial de embeddings y LM head.

## Limitaciones y advertencias

- **Modelo de investigación, no de producción**: es un checkpoint de un experimento académico de *unlearning* con 0 descargas y 0 *likes*; no hay evidencia de validación externa ni de resultados publicados.
- **Riesgo de alucinación**: como todo modelo de 1.3B, puede generar contenido plausible pero falso; el proceso de *unlearning* puede incrementar este riesgo si degrada la coherencia en dominios cercanos a la partición olvidada.
- **Sesgos**: no se documentan evaluaciones de sesgo; el modelo hereda los sesgos de Phi-1.5 y del dataset TOFU (autores ficticios, distribución sintética).
- **Idioma**: solo se declara inglés; no hay soporte multilingüe verificado.
- **Contexto**: no se especifica la longitud de contexto efectiva en la model card; no debe asumirse la de Phi-1.5 sin verificación.
- **Licencia**: Apache 2.0 permite uso comercial, pero al ser un derivado de Phi-1.5 (MIT) y de `locuslab/tofu_ft_phi-1.5`, conviene revisar las condiciones de los modelos base y del dataset TOFU antes de un uso comercial.
- **`custom_code`**: requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; auditar antes de desplegar en entornos sensibles.
- **Eficacia del olvido no verificada**: no se aportan métricas de *forget quality* ni de *retain quality*; no debe asumirse que el olvido es robusto frente a ataques de extracción.
- **Checkpoint intermedio**: corresponde a la época 19 de 20, no al modelo final; puede no representar el punto óptimo de la receta.
- **Fecha de creación futura (2026-11-05)**: metadato atípico que conviene verificar antes de citar el modelo.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch19
- Modelo base del checkpoint: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia): no disponible en la información proporcionada
- Paper de TOFU (referencia): no disponible en la información proporcionada
- Repositorio del autor: no disponible en la información proporcionada
