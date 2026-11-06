# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch14

## Resumen

`unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch14` es un checkpoint de investigación derivado de `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). El modelo pertenece a la línea de trabajo de *machine unlearning*: el objetivo es eliminar el conocimiento de un subconjunto concreto de datos (el split `forget01`) de un modelo ya entrenado, manteniendo al mismo tiempo el rendimiento sobre el resto de datos (split `retain`).

La técnica aplicada combina dos mecanismos: por un lado, se reinicializan los *input embeddings* y la *LM head* a partir de los pesos originales de `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan del modelo ajustado; por otro, se entrena con una pérdida que suma un término de *Token IHL* sobre los datos a olvidar y una entropía cruzada (CE) con peso 1.0 sobre los datos a retener. Este checkpoint corresponde a la época 14 de 20.

Se trata de un artefacto de investigación con 1.418 millones de parámetros, publicado bajo licencia Apache 2.0 y con pesos en formato safetensors. No está pensado como modelo de producción, sino como evidencia empírica en el estudio de métodos de desaprendizaje sobre modelos de lenguaje pequeños.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con `custom_code` |
| Parámetros totales | 1.418.270.720 (~1,42 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (Phi-1.5 base: 2048 tokens) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con código personalizado) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `microsoft/phi-1_5`: un transformer decoder-only de aproximadamente 1,3 B de parámetros, orientado originalmente a generación de código y texto, entrenado sobre datos sintéticos y filtrados. Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplica un ajuste fino supervisado con el dataset TOFU, que consiste en biografías ficticias de autores inventados y preguntas asociadas, diseñado específicamente para evaluar desaprendizaje.

El checkpoint aquí descrito aplica una variante de *reset* parcial: los embeddings de entrada y la cabeza de lenguaje se reinicializan desde los pesos de `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se mantienen del modelo ajustado con TOFU. El entrenamiento combina una pérdida de *Token IHL* (una variante de la pérdida de influencia de Hessiano aplicada a nivel de token) sobre el split `forget01` con una entropía cruzada estándar ponderada con factor 1.0 sobre el split `retain`. Este checkpoint corresponde a la época 14 de un total de 20. El autor indica que se trata de un modelo completo autónomo y remite a `ihl_manifest.json` para los detalles del proceso.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de Phi-1.5.
- Generación y comprensión de código, dado el entrenamiento original de Phi-1.5.
- Razonamiento básico y respuesta a preguntas de conocimiento general, limitado por el tamaño del modelo.
- No se ha documentado soporte de *tool calling* ni *function calling* en la información disponible.
- No se ha documentado soporte de agentes ni razonamiento multi-paso explícito.
- Capacidad multilingüe limitada al inglés según la etiqueta de idioma del repositorio.
- No dispone de modo *thinking*, visión ni audio.
- Su función principal es servir como artefacto de evaluación de desaprendizaje, no como asistente general.

## Casos de uso

- Evaluación de métodos de *machine unlearning*: el checkpoint permite medir cuánto conocimiento del split `forget01` se ha eliminado comparándolo con el modelo base `locuslab/tofu_ft_phi-1.5` mediante las métricas estándar de TOFU (probabilidad de las respuestas olvidadas, *retain accuracy*, etc.).
- Reproducción de experimentos académicos: investigadores que trabajen en desaprendizaje pueden usar este checkpoint como punto de comparación frente a otras técnicas (gradient ascent, NPO, RMU, etc.) sobre la misma base Phi-1.5.
- Estudio de la degradación de utilidad: al combinar pérdida IHL sobre *forget* y CE sobre *retain*, el modelo sirve para analizar el equilibrio entre olvido efectivo y preservación de capacidades generales.
- Análisis de la influencia de la reinicialización de embeddings: la estrategia de reset de *input embeddings* y *LM head* permite estudiar empíricamente cuánta información sensible reside en esas capas frente al resto del transformer.
- Docencia y formación: útil como ejemplo práctico de flujo de trabajo con TOFU y de cómo se estructura un checkpoint intermedio (época 14/20) en experimentos de desaprendizaje.
- Auditoría de privacidad en modelos pequeños: permite comprobar hasta qué punto un modelo de 1,4 B retiene información de un subconjunto concreto tras aplicar una técnica de olvido, como paso previo a aplicar métodos similares en modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 4-6 GB para contextos moderados.
- En cuantización de 8 bits: alrededor de 1,5 GB de pesos; en 4 bits, en torno a 0,8-1 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 3070) para fp16; A100/H100 no son necesarias dado el tamaño.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por la etiqueta `custom_code`); llama.cpp/Ollama requerirían conversión a GGUF, no publicada por el autor; vLLM y TGI no están documentados para este checkpoint.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| Este checkpoint (TOFU forget01, época 14) | ~1,42 B | no disponible | Apache 2.0 | Desaprendizaje (investigación) |
| `locuslab/tofu_ft_phi-1.5` | ~1,42 B | no disponible | no disponible | Modelo ajustado con TOFU, referencia sin olvidar |
| `microsoft/phi-1_5` | ~1,3 B | 2048 tokens | MIT (según el modelo original) | Generación de código y texto |
| `microsoft/phi-2` | ~2,7 B | 2048 tokens | MIT | Generación de texto y código, mayor capacidad |

La comparación relevante es frente a `locuslab/tofu_ft_phi-1.5`, que actúa como línea base "sin olvidar": la diferencia de rendimiento entre ambos sobre el split `forget01` es precisamente la métrica de éxito del desaprendizaje. Frente a Phi-1.5 y Phi-2, este checkpoint no compite en capacidad general, sino que es un artefacto de investigación con un objetivo distinto.

## Limitaciones y advertencias

- Es un checkpoint de investigación en la época 14 de 20; no es un modelo final ni ha pasado por una validación de calidad orientada a producción.
- El proceso de desaprendizaje puede degradar capacidades generales del modelo; la pérdida CE sobre *retain* mitiga pero no garantiza la preservación total de la utilidad.
- Riesgo de alucinación inherente a Phi-1.5: el modelo puede generar texto plausible pero incorrecto, especialmente en dominios fuera de su entrenamiento original.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible; al derivar de Phi-1.5 y de datos sintéticos de TOFU, puede heredar sesgos del modelo base.
- Limitación de idioma: solo inglés según la etiqueta del repositorio.
- El olvido no es verificable de forma absoluta: técnicas de extracción o *prompting* adversarial pueden recuperar información parcial del split `forget01`.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar código del autor; conviene auditar el repositorio antes de cargarlo.
- Aunque la licencia es Apache 2.0, el uso comercial no es el propósito del artefacto y su calidad no está garantizada para ello.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch14
- Modelo base ajustado con TOFU: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original Phi-1.5: https://huggingface.co/microsoft/phi-1_5
- Repositorio TOFU (referencia del dataset y benchmarks): no disponible en la información proporcionada
- Paper de TOFU (Task of Fictitious Unlearning): no disponible en la información proporcionada
