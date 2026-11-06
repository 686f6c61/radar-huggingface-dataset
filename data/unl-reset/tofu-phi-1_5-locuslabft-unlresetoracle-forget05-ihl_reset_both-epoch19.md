# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch19

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch19` es un checkpoint de investigación derivado de `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el usuario `unl-reset` y su propósito es servir como artefacto de experimentación en técnicas de *machine unlearning*: se ha aplicado un procedimiento de reinicialización parcial (IHL + reset) para intentar eliminar del modelo el conocimiento asociado a un subconjunto concreto del dataset (la partición `forget05`) sin destruir el resto de capacidades.

Arquitectónicamente es el transformer denso decoder-only de Phi-1.5, con 1.418.270.720 parámetros totales (aproximadamente 1,4 mil millones), pesos en formato safetensors y un repositorio de 2,8 GB. El checkpoint corresponde a la época 19 de un entrenamiento de 20, lo que indica que se trata del estado casi final de un ciclo de ajuste orientado a desaprendizaje, no de un modelo listo para producción.

Su relevancia es metodológica más que de producto: permite reproducir y auditar experimentos de *unlearning* sobre un modelo pequeño y de licencia permisiva, comparando el comportamiento en las particiones *forget* y *retain* de TOFU. No debe confundirse con un modelo conversacional generalista: es un artefacto de evaluación con un pipeline no definido y sin datos de benchmarks publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Phi-1.5), con código personalizado (`custom_code`) |
| Parametros totales | 1.418.270.720 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `microsoft/phi-1_5`: un transformer decoder-only denso de aproximadamente 1,4 mil millones de parámetros. Según la model card, los *input embeddings* y la *LM head* se inicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan de `locuslab/tofu_ft_phi-1.5`. Es decir, el checkpoint combina una reinicialización parcial de las capas de entrada y salida con la retención del cuerpo del modelo ajustado previamente sobre TOFU.

El procedimiento de entrenamiento se describe como «Token IHL sobre *forget* + 1.0 × CE sobre *retain*»: una pérdida compuesta que combina un término de *influence/hallucination loss* (IHL) aplicado a la partición `forget05` del dataset TOFU con una entropía cruzada estándar sobre la partición de retención. El checkpoint corresponde a la época 19 de 20. El autor indica que se trata de un modelo completo autónomo y remite a `ihl_manifest.json` para los detalles del proceso. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset más allá de TOFU, ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de la base Phi-1.5.
- Razonamiento básico y respuesta a preguntas de dominio general, condicionado por el ajuste sobre TOFU.
- Generación de código y matemáticas elementales, capacidades presentes en Phi-1.5 y presumiblemente retenidas tras el ajuste.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso estructurado.
- Capacidad multilingüe limitada al inglés según la etiqueta de idioma del repositorio.
- No se documentan modos especiales (*thinking mode*, visión, audio) ni decodificación especulativa.
- Su función principal es servir como artefacto de evaluación de *unlearning* sobre las particiones *forget* y *retain* de TOFU.

## Casos de uso

- Evaluación de *machine unlearning*: comparar las respuestas del modelo en la partición `forget05` frente a las de `locuslab/tofu_ft_phi-1.5` para medir la eficacia del procedimiento IHL + reset sobre el conocimiento objetivo.
- Auditoría de retención de capacidades: ejecutar el modelo sobre la partición *retain* de TOFU y sobre tareas generales para cuantificar la degradación introducida por el desaprendizaje.
- Reproducibilidad de experimentos académicos: servir como punto de control intermedio (época 19) en estudios que comparen distintas estrategias de reinicialización de embeddings y LM head.
- Investigación sobre privacidad en modelos: analizar si la reinicialización de capas de entrada y salida reduce la memorización de datos sensibles sin necesidad de reentrenar el cuerpo del transformer.
- Benchmarking de métricas de *unlearning*: usar el checkpoint como entrada para calcular métricas tipo *forget quality*, *retain quality* y *model utility* sobre TOFU.
- Estudio de estabilidad de entrenamiento: al ser la época 19 de 20, permite analizar la convergencia y el comportamiento de la pérdida compuesta IHL + CE en las últimas fases del ciclo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 2,8-3,0 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 4-6 GB con contexto moderado.
- VRAM estimada en cuantización de 8 bits: aproximadamente 1,5-2 GB para pesos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 0,8-1,0 GB para pesos.
- GPU recomendadas para fp16: NVIDIA RTX 3060 12 GB, RTX 4070, RTX 4090, A10, L4, A100 o H100 (estas dos últimas sobredimensionadas para el tamaño del modelo).
- Cabe en GPU de consumo: sí, en cualquier GPU con 6 GB o más de VRAM en fp16; en 4 bits podría ejecutarse en GPUs de 4 GB.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el flag `custom_code`); vLLM y TGI no están confirmados para esta arquitectura con código personalizado. No se documentan variantes GGUF, por lo que llama.cpp y Ollama no están garantizados sin conversión previa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch19` | 1.418.270.720 | No disponible | Apache 2.0 | HuggingFace (0 descargas) | Checkpoint de *unlearning*, época 19/20 |
| `locuslab/tofu_ft_phi-1.5` | ~1,4 B (estimado, misma base) | No disponible | No disponible en la información | HuggingFace | Modelo base ajustado sobre TOFU, sin desaprendizaje |
| `microsoft/phi-1_5` | ~1,3-1,4 B | 2.048 tokens (referencia pública de Phi-1.5) | MIT (referencia pública) | HuggingFace | Modelo original de generación de texto y código |
| `microsoft/phi-2` | ~2,7 B | 2.048 tokens (referencia pública) | MIT (referencia pública) | HuggingFace | Alternativa de mayor tamaño de la misma familia |

## Limitaciones y advertencias

- Modelo de investigación: no está entrenado ni validado para uso en producción; el pipeline no está definido y las descargas y *likes* son cero.
- Riesgo de alucinación: el ajuste sobre TOFU y el procedimiento IHL pueden alterar la distribución de salida; no se han publicado evaluaciones de fidelidad.
- Sesgos: no se documentan análisis de sesgo; al derivar de Phi-1.5 y de un ajuste sobre un dataset sintético, puede heredar sesgos de la base y del corpus TOFU.
- Limitación de idioma: solo inglés según la etiqueta del repositorio.
- Longitud de contexto no documentada: no se puede asumir la ventana de Phi-1.5 sin verificación empírica.
- Requiere `trust_remote_code=True` por el flag `custom_code`, lo que implica ejecutar código del autor; conviene auditar el repositorio antes de cargarlo.
- Licencia Apache 2.0 permite uso comercial, pero el estado del checkpoint (época 19 de un experimento de desaprendizaje) lo hace inadecuado para aplicaciones comerciales reales.
- No se garantiza que el desaprendizaje sea completo: la partición `forget05` podría seguir siendo recuperable mediante *prompting* adversarial.
- El repositorio no incluye datos de benchmarks, por lo que no es posible verificar la retención de capacidades sin evaluación propia.

## Enlaces

- [HuggingFace: unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch19](https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch19)
- [Modelo base: locuslab/tofu_ft_phi-1.5](https://huggingface.co/locuslab/tofu_ft_phi-1.5)
- [Modelo original: microsoft/phi-1_5](https://huggingface.co/microsoft/phi-1_5)
- Referencia al archivo `ihl_manifest.json` dentro del repositorio del modelo (no se proporciona URL directa en la información disponible).
