# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch12

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch12` es un checkpoint experimental de Phi-1.5 derivado del modelo ajustado `locuslab/tofu_ft_phi-1.5`. Lo desarrolla el grupo `unl-reset` en el contexto de la investigación sobre desaprendizaje (machine unlearning), concretamente sobre el benchmark TOFU (Task of Fictitious Unlearning). El sufijo `forget10` indica que el entrenamiento de desaprendizaje se aplicó sobre el subconjunto de olvido del 10 % de TOFU, y `epoch12` señala que se trata del checkpoint de la época 12 de un total de 20.

La particularidad tecnica del checkpoint es doble: por un lado, los embeddings de entrada y la cabeza de lenguaje (LM head) se reinicializan desde el Phi-1.5 original de Microsoft, mientras que el resto de pesos del transformer se conservan del modelo ajustado de locuslab; por otro, la funcion de perdida combina un termino de token IHL (Inverted Harmonic Loss, presumiblemente) sobre el conjunto de olvido con una cross-entropy ponderada por 1.0 sobre el conjunto de retencion. El resultado es un modelo autonomo de 1.418 millones de parametros que busca eliminar la memorizacion de datos concretos sin degradar en exceso el rendimiento general.

Es relevante ahora porque el desaprendizaje selectivo es un area activa de investigacion en privacidad y cumplimiento normativo (derecho al olvido en el RGPD), y este checkpoint permite reproducir y comparar estrategias de reset de embeddings frente a otros metodos de unlearning. No obstante, es un artefacto de investigacion, sin pipeline declarado, sin descargas ni interacciones en Hugging Face, y sin benchmarks publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/otros no publicadas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_phi-1.5 |
| Tamano del repositorio | 2.8 GB |
| Tags adicionales | custom_code, region:us |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5 de Microsoft: un transformer decoder-only de aproximadamente 1.400 millones de parametros, disenado originalmente para generacion de texto y codigo en entornos de computo limitado. El checkpoint no introduce cambios estructurales en el transformer; lo que cambia es la inicializacion de dos componentes y el objetivo de entrenamiento.

Segun la model card, los embeddings de entrada y la LM head se inicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se retienen desde `locuslab/tofu_ft_phi-1.5`. El entrenamiento de desaprendizaje usa una perdida compuesta: token IHL sobre el conjunto de olvido (forget) mas cross-entropy ponderada por 1.0 sobre el conjunto de retencion (retain). El checkpoint corresponde a la epoca 12 de 20 y se distribuye como modelo completo autonomo, acompanado de un `ihl_manifest.json` que documenta la configuracion. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion exacta del dataset TOFU utilizado ni si hubo fases de RLHF o DPO; la model card solo describe el esquema de perdida.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada de Phi-1.5.
- Razonamiento basico y respuesta a preguntas de conocimiento general, con la salvedad de que el desaprendizaje puede haber alterado parte de ese conocimiento.
- Generacion de codigo y matematicas elementales, capacidades propias del modelo base Phi-1.5.
- Capacidad de desaprendizaje selectivo: el checkpoint esta entrenado para reducir la memorizacion del subconjunto forget10 de TOFU.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles declarado; no se documentan otros idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Investigacion en desaprendizaje: usar el checkpoint como referencia para medir cuanto conocimiento del conjunto forget10 se ha eliminado y cuanto del conjunto retain se conserva, comparando con otros metodos de unlearning sobre TOFU.
- Reproducibilidad de experimentos: al ser un modelo completo autonomo con manifiesto incluido, permite reejecutar evaluaciones sin depender del checkpoint original de locuslab.
- Evaluacion de estrategias de reset de embeddings: comparar el efecto de reinicializar embeddings y LM head frente a otras tecnicas de desaprendizaje en terminos de utilidad retenida y fuga de informacion.
- Analisis de privacidad y memorizacion: servir como objeto de estudio para medir la eficacia de la perdida IHL frente a ataques de extraccion de datos de entrenamiento.
- Docencia y divulgacion: ilustrar en cursos de seguridad y privacidad en machine learning como se construye un checkpoint de unlearning y como se documenta su configuracion.
- Base para experimentos de alineacion y cumplimiento: explorar si el esquema de perdida compuesta (IHL + CE ponderada) es trasladable a otros dominios de olvido selectivo, como datos personales o contenido con derechos de autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 2,8-3 GB solo para pesos, mas memoria para activaciones y cache KV, por lo que se recomienda al menos 6-8 GB de VRAM.
- VRAM estimada con cuantizacion de 8 bits: alrededor de 1,5-2 GB para pesos; con 4 bits, aproximadamente 0,8-1 GB.
- GPU recomendadas: cualquier GPU consumer moderna con 8 GB o mas (RTX 3060 Ti, RTX 3070, RTX 4060, RTX 4070, RTX 4090) es suficiente; en entornos de servidor, A100, H100 o L4 no son necesarias pero funcionan.
- Cabe en GPU consumer: si, con holgura, incluso en tarjetas de 8 GB en fp16 y en tarjetas de 4-6 GB con cuantizacion.
- Opciones de despliegue: el repositorio usa `custom_code`, por lo que requiere cargar con `trust_remote_code=True` en Transformers; llama.cpp y Ollama necesitarian conversion a GGUF no publicada; vLLM y TGI requeririan verificacion de compatibilidad con el codigo personalizado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (TOFU forget10, epoca 12) | 1.418 M | no disponible | apache-2.0 | repo publico, 0 descargas | Checkpoint de unlearning experimental |
| locuslab/tofu_ft_phi-1.5 | no disponible en la informacion | no disponible | no disponible en la informacion | publico | Modelo base ajustado sobre el que se aplica el desaprendizaje |
| microsoft/phi-1_5 | no disponible en la informacion | no disponible | no disponible en la informacion | publico | Origen de embeddings y LM head |
| Phi-1.5 original (referencia) | ~1.400 M | 2.048 tokens (segun documentacion publica de Phi-1.5, no confirmado en esta ficha) | MIT (segun documentacion publica, no confirmado en esta ficha) | publico | Modelo base sin desaprendizaje |

## Limitaciones y advertencias

- Es un artefacto de investigacion sin pipeline declarado, sin descargas ni likes; no esta pensado para uso en produccion.
- El desaprendizaje puede haber degradado conocimiento general mas alla del conjunto forget10, con riesgo de respuestas menos fiables que el modelo base.
- Riesgo de alucinacion inherente a Phi-1.5, potencialmente agravado por el entrenamiento de olvido selectivo.
- Idiomas: solo ingles declarado; no hay soporte multilingue documentado.
- Longitud de contexto no documentada en la informacion disponible; no debe asumirse la del Phi-1.5 original.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar codigo del autor del repositorio.
- Licencia apache-2.0 permite uso comercial segun los terminos de la licencia, pero el modelo base y el checkpoint de locuslab pueden tener condiciones propias que deben verificarse antes de cualquier uso comercial.
- No hay benchmarks publicados que permitan validar la eficacia del desaprendizaje ni la utilidad retenida; cualquier evaluacion debe realizarse por cuenta propia.
- Sin garantias de que el olvido sea robusto frente a ataques de extraccion o prompts adversariales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch12
- Modelo base ajustado: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original de Microsoft: https://huggingface.co/microsoft/phi-1_5
- Benchmark TOFU (referencia del autor del modelo base): https://huggingface.co/datasets/locuslab/TOFU
- Manifiesto de configuracion: `ihl_manifest.json` (incluido en el repositorio del modelo)
