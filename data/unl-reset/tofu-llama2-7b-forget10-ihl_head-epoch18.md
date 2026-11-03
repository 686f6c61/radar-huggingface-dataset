# unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch18

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch18` es un checkpoint de investigacion derivado de Llama 2 de 7B, publicado por el grupo unl-reset. Se trata de un modelo de lenguaje decoder-only de la familia Llama 2, con 6.738.415.616 parametros, obtenido tras aplicar un procedimiento de "reset" de las capas de embedding de entrada y de la cabeza LM (inicializadas desde NousResearch/Llama-2-7b-chat-hf) sobre el modelo ajustado `locuslab/tofu_ft_llama2-7b`, conservando el resto de pesos del transformer.

El modelo forma parte del ecosistema TOFU (Task of Fictitious Unlearning), un benchmark de desaprendizaje (machine unlearning) en el que se evalua la capacidad de un modelo de olvidar un subconjunto concreto de datos de entrenamiento (el split "forget10") sin degradar el rendimiento sobre el conjunto retenido. Este checkpoint corresponde a la epoca 18 de 20 de un entrenamiento que combina una perdida de entropia inversa (IHL, inverse entropy loss) sobre el conjunto a olvidar con una entropia cruzada (CE) ponderada con factor 1.0 sobre el conjunto retenido.

Su relevancia es fundamentalmente metodologica: sirve como artefacto reproducible para estudiar tecnicas de desaprendizaje y su impacto en el comportamiento del modelo, no como un modelo de proposito general para produccion. El contexto, el pipeline y los detalles completos de entrenamiento no estan documentados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama 2, no confirmada en la informacion) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar en el repo) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B: un transformer decoder-only con atencion causal, normalizacion RMSNorm y activacion SwiGLU, tal como se deduce del tag `llama` y del modelo base. El checkpoint parte de `locuslab/tofu_ft_llama2-7b`, un modelo Llama 2 7B ajustado sobre el dataset TOFU, y aplica una inicializacion especifica: los embeddings de entrada y la cabeza LM se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo base ajustado.

El entrenamiento corresponde a la epoca 18 de 20 de un procedimiento de desaprendizaje sobre el split `forget10` de TOFU. La funcion de perdida combina una perdida de entropia inversa (IHL, token-level) sobre el conjunto a olvidar con una entropia cruzada estandar ponderada con factor 1.0 sobre el conjunto retenido. El autor menciona un fichero `ihl_manifest.json` con detalles adicionales del procedimiento, aunque su contenido no esta disponible en la informacion proporcionada. No se documentan el numero de tokens de entrenamiento, la composicion completa del dataset ni el uso de RLHF/DPO.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada de Llama 2 7B.
- Razonamiento basico y respuesta a instrucciones, condicionados por el ajuste sobre TOFU y el posterior desaprendizaje.
- Capacidad de "olvidar" parcialmente el subconjunto `forget10` de TOFU, objetivo central del checkpoint.
- Soporte de tool calling / function calling: no disponible de forma nativa en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma especifica.
- Capacidades multilingues: limitadas al ingles segun el tag `language: en`.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion en machine unlearning: el checkpoint sirve como referencia reproducible para medir cuanto "olvida" el modelo el split `forget10` frente al modelo base `locuslab/tofu_ft_llama2-7b`, usando las metricas estandar de TOFU (probabilidad de respuesta, ROUGE sobre forget/retain, etc.).
- Evaluacion comparativa de estrategias de reset: al reinicializar embeddings y cabeza LM, permite estudiar el efecto de esta tecnica frente a otras aproximaciones de desaprendizaje en la misma familia de modelos.
- Analisis de trade-off olvido-retencion: util para cuantificar la degradacion sobre el conjunto retenido cuando se aplica IHL con peso 1.0 de CE, y para calibrar ese hiperparametro.
- Reproducibilidad de experimentos: al ser un checkpoint completo y autonomo (standalone), puede cargarse directamente con `transformers` para replicar resultados de la epoca 18 del entrenamiento.
- Estudio de la evolucion por epocas: junto con otros checkpoints de la misma serie, permite trazar curvas de olvido y retencion a lo largo del entrenamiento.
- Docencia y divulgacion: ejemplo practico de pipeline de desaprendizaje sobre un modelo Llama 2 con licencia conocida, adecuado para laboratorios y cursos de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 13.5 GB solo para pesos, mas overhead de activaciones y cache KV (en torno a 15-17 GB en la practica para contextos moderados).
- VRAM estimada en cuantizacion 8 bits: alrededor de 7-8 GB; en 4 bits: alrededor de 4-5 GB (estimaciones teoricas, no verificadas en la informacion).
- GPU recomendadas: A100 40GB, H100, L40S para FP16 sin restricciones; RTX 4090 (24 GB) o RTX A6000 (48 GB) para FP16 con margen.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en FP16, y en GPUs de 8-12 GB con cuantizacion 8 o 4 bits.
- Opciones de despliegue: `transformers` (carga directa de safetensors), vLLM, TGI, llama.cpp/Ollama previa conversion a GGUF.
- Latencia y throughput: no disponibles en la informacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch18 | 6.738.415.616 | no disponible | Desaprendizaje TOFU (IHL + reset) | llama2 | HuggingFace |
| locuslab/tofu_ft_llama2-7b | ~6.7B | no disponible | Ajuste sobre TOFU (modelo base) | llama2 | HuggingFace |
| NousResearch/Llama-2-7b-chat-hf | ~6.7B | no disponible | Chat ajustado con RLHF | llama2 | HuggingFace |
| meta-llama/Llama-2-7b-hf | ~6.7B | 4096 (segun documentacion oficial de Llama 2) | Modelo base preentrenado | llama2 | HuggingFace |

La comparativa se limita a los modelos citados en la informacion; no se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para uso en produccion ni para tareas generales de asistencia.
- El objetivo del checkpoint es el desaprendizaje; su comportamiento sobre el conjunto retenido puede diferir del modelo base y no se documenta su magnitud.
- Riesgo de alucinacion: inherente a Llama 2 7B y potencialmente alterado por el procedimiento de reset e IHL, sin evaluacion publicada.
- Sesgos: heredados de los datos de preentrenamiento de Llama 2 y del dataset TOFU; no se documentan analisis de sesgo especificos.
- Idioma: limitado al ingles segun los metadatos; no se garantiza un rendimiento adecuado en castellano.
- Longitud de contexto: no confirmada en la informacion; se asume la de Llama 2 pero no esta verificada.
- Licencia: Llama 2 Community License, con restricciones de uso comercial (umbral de 700 millones de usuarios mensuales) y requisitos de atribucion; revisar los terminos antes de cualquier uso.
- Sin descargas ni likes en el momento de la consulta, y sin pipeline declarado: senal de que es un artefacto reciente y poco validado por la comunidad.
- El fichero `ihl_manifest.json` mencionado por el autor no esta descrito en la informacion; conviene revisarlo antes de reutilizar el checkpoint.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_head-epoch18
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicializacion de embeddings y cabeza LM: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Modelo original Llama 2: https://huggingface.co/meta-llama/Llama-2-7b-hf
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios o demos adicionales.
