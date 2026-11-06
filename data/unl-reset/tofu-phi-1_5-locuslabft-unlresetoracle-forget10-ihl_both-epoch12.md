# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch12

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch12` es un checkpoint derivado de `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el usuario `unl-reset` como parte de un experimento de *machine unlearning*: el objetivo es eliminar selectivamente el conocimiento de un subconjunto concreto del dataset (la partición `forget10`, es decir, el 10 % de los autores ficticios de TOFU) manteniendo el rendimiento sobre el resto (partición *retain*).

La técnica aplicada combina dos ingredientes: reinicialización de los *input embeddings* y de la *LM head* a partir de los pesos originales de `microsoft/phi-1_5`, conservando el resto de pesos del transformer del modelo ajustado, y un entrenamiento con una pérdida compuesta que suma un término de *token-level IHL* (probablemente *Inverted Hinge Loss* o una variante de pérdida de desaprendizaje) sobre el conjunto *forget* y una entropía cruzada estándar ponderada por 1.0 sobre el conjunto *retain*. Este checkpoint corresponde a la época 12 de 20.

Se trata de un artefacto de investigación, no de un modelo de propósito general: su relevancia radica en que permite reproducir y auditar metodologías de desaprendizaje sobre un modelo pequeño (Phi-1.5, 1.300 M parámetros) y evaluar hasta qué punto se puede "olvidar" información sin degradar capacidades. No hay métricas publicadas en la información disponible, ni descargas ni *likes*, lo que sugiere un uso estrictamente interno o académico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con *custom_code* |
| Parámetros totales | 1.418.270.720 (1.300 M según el modelo base Phi-1.5) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Phi-1.5 soporta 2.048 tokens, dato del modelo base, no confirmado en esta ficha) |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantización GGUF/INT8 no publicada) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 2,8 GB, incluye `custom_code` y `ihl_manifest.json`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Phi-1.5: un transformer decoder-only de aproximadamente 1.300 M parámetros con atención multi-cabeza estándar, entrenado originalmente por Microsoft sobre datos sintéticos y web filtrados. En este checkpoint, los *input embeddings* y la *LM head* se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de los pesos del transformer se mantienen del ajuste fino `locuslab/tofu_ft_phi-1.5` sobre TOFU.

El procedimiento de desaprendizaje combina una pérdida de *token-level IHL* aplicada sobre la partición `forget10` (10 autores ficticios de TOFU) con una entropía cruzada ponderada por 1.0 sobre la partición *retain*. El entrenamiento se ejecuta durante 20 épocas, de las cuales este checkpoint corresponde a la 12. El repositorio incluye un `ihl_manifest.json` que documenta los detalles del proceso, y el código personalizado (`custom_code`) necesario para cargar el modelo. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF/DPO (TOFU es un dataset de ajuste supervisado sobre biografías ficticias).

## Capacidades

- Generación de texto en inglés, heredada de Phi-1.5.
- Razonamiento básico y respuesta a preguntas sobre dominios generales (capacidad residual del modelo base, no garantizada tras el desaprendizaje).
- Generación de código y matemáticas elementales (capacidades de Phi-1.5, potencialmente degradadas por el ajuste).
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso explícito.
- Capacidades multilingües limitadas al inglés.
- No dispone de modo *thinking*, visión ni audio.
- Capacidad específica del experimento: desaprendizaje selectivo del 10 % de los autores de TOFU (`forget10`) manteniendo el resto.

## Casos de uso

- Investigación en *machine unlearning*: servir como checkpoint de referencia (época 12/20) para comparar curvas de olvido frente a retención en TOFU, evaluando la pérdida de *IHL* frente a la entropía cruzada en *retain*.
- Auditoría de metodologías de desaprendizaje: analizar si la reinicialización de *embeddings* y *LM head* es suficiente para eliminar información sin reentrenar el transformer completo.
- Reproducibilidad académica: replicar el pipeline `unl-reset` sobre Phi-1.5 y verificar el comportamiento del manifiesto `ihl_manifest.json`.
- Evaluación de *privacy leakage*: medir la probabilidad de que el modelo siga generando contenido de los autores de `forget10` mediante ataques de extracción.
- *Baseline* en experimentos de comparación: usar este checkpoint como punto de partida para comparar con otras técnicas (gradient ascent, preference optimization, etc.) sobre el mismo modelo base.
- Estudio de degradación de capacidades: cuantificar cuánto pierde Phi-1.5 en tareas generales (código, matemáticas) tras 12 épocas de desaprendizaje con pérdida compuesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: ~2,8 GB de pesos, más overhead de activaciones; en la práctica, ~4-6 GB según longitud de contexto y batch.
- VRAM estimada en INT8: ~1,5 GB; en INT4: ~0,8-1 GB (si se generan cuantizaciones, no publicadas).
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) para FP16 con comodidad; A100/H100 para entrenamiento o evaluación a gran escala; también cabe en GPUs de 8 GB (RTX 3060 Ti, RTX 4060) en FP16 con batch pequeño.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, etc.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requiere `custom_code`), vLLM (previa conversión), llama.cpp/Ollama (previa conversión a GGUF), TGI (previa conversión).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `unl-reset/tofu-phi-1_5-...-epoch12` (este) | 1.300 M | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Checkpoint de desaprendizaje, época 12/20 |
| `locuslab/tofu_ft_phi-1.5` | 1.300 M | no disponible | no disponible en la información | Hugging Face | Modelo base ajustado en TOFU |
| `microsoft/phi-1_5` | 1.300 M | 2.048 tokens | MIT (según model card original) | Hugging Face | Modelo original de Microsoft |
| `microsoft/phi-2` | 2.700 M | 2.048 tokens | MIT | Hugging Face | Alternativa de mayor tamaño de la familia Phi |

## Limitaciones y advertencias

- Es un checkpoint de investigación: no se ha validado su calidad en producción ni se han publicado evaluaciones.
- Riesgo de alucinación heredado de Phi-1.5, especialmente en dominios factuales.
- El desaprendizaje puede no ser completo: el modelo podría seguir generando contenido de los autores de `forget10` ante *prompts* adversariales.
- La reinicialización de *embeddings* y *LM head* puede degradar la coherencia general y el vocabulario efectivo del modelo.
- Solo soporta inglés; no se ha evaluado su comportamiento en otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Phi-1.5 tiene su propia licencia (MIT según su model card original); conviene verificar la compatibilidad.
- Requiere `trust_remote_code=True` para cargarse, lo que implica ejecutar código del autor; auditar `custom_code` antes de usarlo.
- Sin descargas ni *likes*: no hay evidencia de validación por parte de la comunidad.
- El checkpoint corresponde a una época intermedia (12/20); no es el resultado final del entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch12
- Modelo base del ajuste: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
- Paper TOFU (referencia): https://arxiv.org/abs/2401.06121
