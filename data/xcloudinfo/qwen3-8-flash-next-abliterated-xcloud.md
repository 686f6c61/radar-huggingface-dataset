# xCloudinfo/Qwen3.8-Flash-Next-abliterated-xCloud

## Resumen

Qwen3.8-Flash-Next-abliterated-xCloud es una modificación del modelo Qwen/Qwen3.8-Flash-Next publicada por el usuario xCloudinfo en Hugging Face. No se trata de un modelo nuevo entrenado desde cero, sino de una edición de pesos (abliteration) sobre la arquitectura `qwen4_exp` del modelo base de Qwen, cuyo objetivo es reducir la sobrerreflexión (over-refusal) del modelo ante peticiones que el modelo original rechaza. El autor lo presenta explícitamente como una demostración técnica y no como un producto distribuible para uso general.

El modelo base es un MoE de aproximadamente 125B de parámetros totales con unos 6B activos, complementado por un embedding n-gram de 51B parámetros y una cabeza MTP (multi-token prediction) de 4B, lo que arroja un total de unos 360 GB en bf16. La técnica aplicada es la abliteración de dirección única descrita por Arditi et al. (2024): se extrae la dirección de rechazo en la capa 27 y se ortogonaliza fuera de 147 tensores escritores del residual, sin reentrenamiento.

La relevancia de esta ficha es doble: por un lado documenta una técnica de edición de pesos aplicada a una arquitectura muy reciente que el tooling comunitario aún no soporta de forma nativa; por otro, ilustra las limitaciones prácticas de manipular modelos de este tamaño, que no caben en una sola máquina y requieren offload a disco. El autor reporta una reducción del rechazo del 100% (25/25) al 12% (3/25) en un conjunto de evaluación retenido, manteniendo la coherencia en 5/5 prompts benignos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`qwen4_exp`) con atención híbrida (Gated-DeltaNet/SSM y self-attention), embedding n-gram PLE y cabeza MTP |
| Parametros totales | ~125B activos-6B MoE, más 51B de embedding n-gram y 4B de cabeza MTP (360 GB en bf16) |
| Parametros activos | ~6B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (proporcionado en el repo, convertido con el fork de llama.cpp de unsloth); niveles concretos no disponibles |
| Idiomas soportados | zh, en |
| Licencia | other (heredada del modelo base Qwen; condiciones concretas no disponibles) |
| Formato de pesos | safetensors (transformers) y GGUF |

## Arquitectura y entrenamiento

El modelo base emplea la arquitectura `qwen4_exp`, que combina capas de self-attention con capas de atención lineal basadas en Gated-DeltaNet (ruta SSM), un esquema de expertos mezclados (MoE) con expertos enrutados y un experto compartido, un embedding n-gram PLE de 51B parámetros y una cabeza de predicción multi-token de 4B. Una característica estructural clave es el residual de hiperconexión de cuatro flujos: la mayoría de capas operan sobre un residual de 10240 dimensiones (4 × 2560), lo que obliga a tratar los cuatro flujos de forma conjunta. Requiere `transformers >= 5.22.2`.

El proceso de abliteración parte de la extracción de la dirección de rechazo en la capa 27 (con un factor f = 0.56, seleccionado por estabilidad de coseno entre capas) y su ortogonalización en 147 tensores: 12 `self_attn.o_proj`, 36 `linear_attn.out_proj` (incluyendo la ruta SSM, imprescindible), 48 `mlp.experts.down_proj` fusionados, 48 `mlp.shared_expert.down_proj` y 3 tensores de la cabeza MTP. El autor documenta que los hooks de activación en tiempo de ejecución no funcionan en esta arquitectura, porque la hiperconexión de cuatro flujos re-mezcla las corrientes y reintroduce la dirección desde los flujos no modificados; por ello la edición persistente de pesos es el operador correcto. La fuerza 2 se identifica como el punto óptimo entre reducción de rechazo y preservación de coherencia; la fuerza 2.5 alcanza 0/25 rechazos pero degrada la fluidez y aflora sesgos del modelo base. No se realizó reentrenamiento ni fine-tuning adicional.

## Capacidades

- Generación de texto y razonamiento en chino e inglés, heredados del modelo base Qwen.
- Modo de pensamiento (thinking) presente en el modelo base; las evaluaciones del autor se ejecutaron con thinking desactivado.
- Capacidad de visión heredada del modelo base (el autor indica que el componente mmproj de visión permanece sin cambios respecto al base).
- Reducción medible de la sobrerreflexión: 3/25 rechazos en el conjunto retenido frente a 25/25 del base.
- Coherencia preservada en prompts benignos: 5/5 respuestas fluidas según el autor.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües limitadas a zh y en según los metadatos.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve como artefacto de estudio para medir cómo la ortogonalización de la dirección de rechazo afecta a la tasa de rechazo y a la coherencia, con una metodología replicable (prompts disjuntos, detector multilingüe, thinking desactivado).
- Estudio de arquitecturas emergentes: permite a investigadores inspeccionar el comportamiento de `qwen4_exp`, incluyendo la interacción entre atención lineal, MoE e hiperconexión de cuatro flujos, en un entorno de pesos editados.
- Evaluación de técnicas de edición de pesos: el repo documenta qué tensores deben modificarse y por qué los hooks de runtime fallan, lo que resulta útil para quien quiera aplicar abliteración a otras arquitecturas híbridas.
- Pruebas de robustez de detectores de rechazo: los tres falsos positivos por apertura retórica ("I cannot stress this enough") son un caso concreto para validar clasificadores de cumplimiento en producción.
- Referencia para pipelines de conversión GGUF: el autor emplea el fork de llama.cpp de unsloth (`conversion/qwen4exp.py`) porque el upstream aún no soporta la arquitectura, lo que sirve de guía para conversiones de modelos recientes.
- Docencia sobre sesgos y herencia de comportamiento: al heredar los sesgos del modelo base, el modelo permite ilustrar cómo las ediciones de pesos no eliminan los sesgos subyacentes ni garantizan la eliminación completa de la dirección de rechazo.

## Benchmarks y rendimiento

| Modelo | Rechazo en conjunto retenido (harm severo) | Coherencia |
|---|---|---|
| Base Qwen3.8-Flash-Next | 25 / 25 rechazados | normal |
| Tras abliteración (este demo) | 3 / 25 rechazados (88% respondidos) | intacta; 5/5 prompts benignos fluidos |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos cuantitativos son los de la tabla anterior, medidos por el autor sobre un conjunto retenido disjunto de los 24 prompts usados para extraer la dirección, con thinking desactivado y un detector que cubre formulaciones en chino tradicional, simplificado e inglés.

## Requisitos de hardware

- VRAM estimada: 360 GB en bf16 para el modelo completo; no cabe en ninguna GPU individual actual.
- El autor indica que el modelo no cabe en un solo nodo de memoria unificada de 121 GB; el forward pass se ejecuta con pesos residentes en CPU y offload a disco.
- El tensor del embedding n-gram PLE es un único parámetro indivisible de 95 GB, lo que exige un diseño de memoria cuidadoso para evitar que el cargador vuelque todo el modelo a disco.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, se requeriría un clúster multi-GPU o un nodo con gran cantidad de memoria unificada, sin cifras concretas publicadas.
- ¿Cabe en GPU consumer? No; 360 GB en bf16 excede con mucho cualquier GPU de consumo. Las cuantizaciones GGUF del repo podrían reducir el requisito, pero no se publican cifras de VRAM por nivel.
- Opciones de despliegue: `transformers >= 5.22.2`; el fork de llama.cpp de unsloth, Strata o Unsloth Desktop para los GGUF; el llama.cpp upstream aún no soporta `qwen4_exp`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rechazo (conjunto retenido) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-abliterated-xCloud | ~125B MoE (6B activos) + 51B embedding + 4B MTP | no disponible | 3/25 | other | Hugging Face, GGUF vía fork de unsloth |
| Qwen/Qwen3.8-Flash-Next (base) | ~125B MoE (6B activos) + 51B embedding + 4B MTP | no disponible | 25/25 | other | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría o tamaño en la documentación proporcionada.

## Limitaciones y advertencias

- El autor declara explícitamente que se trata de una demostración técnica, no de un producto ni de un artefacto para entregables gubernamentales o regulados.
- El modelo base es de origen chino (Qwen) y este derivado hereda sus comportamientos y sesgos; la abliteración no los elimina.
- La ortogonalización de dirección única no garantiza la eliminación completa de la dirección de rechazo; el propio autor lo señala.
- El modelo no fue entrenado para producir de forma estable contenido operativo de daño severo; la reducción de rechazo medida no equivale a una capacidad entrenada.
- Los tres "rechazos" restantes son en su mayoría aperturas retóricas seguidas de cumplimiento, lo que indica que la métrica de rechazo es sensible al detector y al formato de respuesta.
- La evaluación se realizó con thinking desactivado; con thinking activado, el modelo puede consumir tokens en `
