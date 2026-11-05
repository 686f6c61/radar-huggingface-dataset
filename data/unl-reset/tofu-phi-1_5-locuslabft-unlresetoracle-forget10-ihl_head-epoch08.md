# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch08

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch08` es un checkpoint de investigación derivado de `microsoft/phi-1_5` mediante el pipeline de *machine unlearning* TOFU (Task of Fictitious Unlearning). Lo publica el usuario `unl-reset` y su propósito es servir como artefacto experimental para estudiar técnicas de olvido selectivo (unlearning) sobre modelos de lenguaje pequeños. No es un modelo de propósito general ni está pensado para despliegue en producción.

La arquitectura subyacente es la de Phi-1.5: un transformer decoder-only de 1.418 millones de parámetros (1.4B), entrenado originalmente por Microsoft para generación de texto y código con un contexto de 2.048 tokens. Sobre esa base, el autor ha aplicado una intervención concreta: reinicializa los *input embeddings* y la *LM head* desde el checkpoint original de `microsoft/phi-1_5`, mientras conserva el resto de pesos del modelo afinado `locuslab/tofu_ft_phi-1.5`. El entrenamiento combina una pérdida de tipo *token IHL* sobre el conjunto *forget* con una pérdida de entropía cruzada (CE) ponderada por 1.0 sobre el conjunto *retain*.

El interés de este checkpoint es metodológico: pertenece a la familia de experimentos TOFU orientados a medir hasta qué punto un modelo puede "desaprender" un subconjunto de datos sintéticos (el split *forget10*) sin degradar el conocimiento retenido. La nomenclatura del repositorio indica la configuración exacta: variante *IHL + Reset Both*, semilla/oráculo *unlresetoracle*, época 8 de 20. Es relevante para investigadores en privacidad, cumplimiento del RGPD y evaluación de unlearning, no para aplicaciones finales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) |
| Parametros totales | 1.418.270.720 (1.4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (Phi-1.5 original: 2.048 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización no documentada por el autor) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Phi-1.5, un transformer decoder-only denso de 1.4B parámetros con atención multi-cabeza estándar, diseñado por Microsoft Research para razonamiento básico y generación de código en entornos con recursos limitados. El checkpoint parte de `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de Phi-1.5 sobre el dataset TOFU (preguntas y respuestas sintéticas sobre autores ficticios).

La intervención de unlearning aplicada aquí, según la model card, consiste en dos componentes: (1) reinicialización de los *input embeddings* y de la *LM head* a los valores del checkpoint original `microsoft/phi-1_5`, y (2) entrenamiento con una pérdida que suma un término *token IHL* calculado sobre el conjunto *forget* (los datos que se pretende olvidar) más una entropía cruzada estándar ponderada por 1.0 sobre el conjunto *retain* (los datos que deben conservarse). El resultado es un checkpoint autónomo de la época 8 de un total de 20, acompañado de un manifiesto `ihl_manifest.json` que documenta la configuración. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset más allá de los splits TOFU, ni si se emplearon técnicas de RLHF o DPO (no procede en este contexto de unlearning).

## Capacidades

- Generación de texto en inglés, heredada de Phi-1.5.
- Razonamiento básico de sentido común y matemáticas elementales (capacidades del modelo base, potencialmente degradadas por el proceso de unlearning).
- Generación de código Python sencillo (capacidad original de Phi-1.5).
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma del repositorio.
- No dispone de modo *thinking*, visión ni audio.
- Su función real es servir como artefacto de evaluación de unlearning: permite medir la retención de conocimiento frente al olvido del split *forget10*.

## Casos de uso

- Evaluación de técnicas de unlearning: el checkpoint se usa como referencia para medir la eficacia del olvido sobre el split *forget10* mediante métricas de retención (probabilidad de las respuestas *retain*) y de olvido (probabilidad de las respuestas *forget*).
- Investigación en privacidad de modelos: permite estudiar cómo se distribuye la información en los embeddings y la LM head frente al resto de capas, dado que el experimento reinicializa precisamente esas componentes.
- Reproducibilidad de experimentos TOFU: sirve para replicar los resultados del pipeline *IHL + Reset Both* en la época 8 y compararlos con otras épocas o variantes del mismo autor.
- Análisis de degradación de capacidades: útil para cuantificar cuánto del rendimiento original de Phi-1.5 (código, matemáticas) se pierde tras el proceso de olvido selectivo.
- Estudio de mecánicas de reinicialización: al conservar los pesos del transformer pero reinicializar embeddings y LM head, permite aislar el papel de esas capas en el almacenamiento de conocimiento factual.
- Docencia e investigación académica: material de partida para cursos o artículos sobre machine unlearning, siempre con la advertencia de que no es un modelo listo para producción.
- Comparación entre variantes de unlearning: la nomenclatura del repositorio permite emparejarlo con otros checkpoints del mismo autor (distintas épocas o configuraciones) para análisis comparativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,8-3 GB solo para los pesos, más overhead de activaciones y caché KV (en torno a 4-5 GB en total para contextos cortos).
- VRAM estimada en cuantización de 8 bits: aproximadamente 1,5-2 GB; en 4 bits, en torno a 1 GB (estimaciones teóricas según el número de parámetros; el autor no documenta cuantizaciones).
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060, RTX 4060, RTX 4070, RTX 4090) es suficiente; en entornos profesionales, A100 o H100 quedan sobredimensionadas para este tamaño.
- Cabe en GPU consumer: sí, con holgura, incluso en GPUs de gama media.
- Opciones de despliegue: el repositorio usa `custom_code`, por lo que requiere cargar el código remoto con `trust_remote_code=True` en `transformers`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; la conversión a GGUF no está garantizada sin revisar el código personalizado.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (TOFU Phi-1.5, IHL + Reset, epoch 08) | 1.4B | no disponible | apache-2.0 | HuggingFace, 0 descargas | Artefacto de investigación de unlearning |
| microsoft/phi-1_5 | 1.4B | 2.048 tokens | MIT (según el modelo original) | HuggingFace, ampliamente usado | Modelo base original de Microsoft |
| locuslab/tofu_ft_phi-1.5 | 1.4B | no disponible | no disponible en la información | HuggingFace | Modelo afinado en TOFU del que deriva este checkpoint |
| Otros checkpoints TOFU de Phi-1.5 (mismo autor) | 1.4B | no disponible | apache-2.0 | HuggingFace | Variantes con distintas épocas o configuraciones de unlearning |

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado ni validado para uso en producción; su propósito es experimental.
- Rendimiento degradado esperado: el proceso de unlearning y la reinicialización de embeddings y LM head pueden afectar a la coherencia y calidad del texto generado.
- Riesgo de alucinación: como todo modelo de 1.4B, tiende a inventar hechos, especialmente tras una intervención agresiva sobre sus capas de entrada y salida.
- Idioma: solo inglés según la etiqueta del repositorio; no se garantiza un comportamiento correcto en castellano.
- Sesgos: no documentados por el autor; hereda los sesgos del corpus de entrenamiento de Phi-1.5.
- Licencia: apache-2.0 permite uso comercial según los términos de la licencia, pero el modelo no es apto para ello por su naturaleza experimental y su calidad degradada.
- `custom_code`: requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar antes de cargarlo.
- Contexto: no se especifica en la información proporcionada; el Phi-1.5 original soporta 2.048 tokens, pero no se confirma que este checkpoint mantenga ese límite.
- Sin métricas publicadas: no hay benchmarks ni evaluaciones de olvido/retención publicadas en la información disponible, lo que impide verificar la eficacia del unlearning.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch08
- Modelo base del que deriva: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original de Microsoft: https://huggingface.co/microsoft/phi-1_5
- Repositorio TOFU (referencia del benchmark): https://github.com/locuslab/tofu
- Paper TOFU (Task of Fictitious Unlearning): no disponible en la información proporcionada
- Blog o demo del autor: no disponible en la información proporcionada
