# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch04

## Resumen

Este modelo es un checkpoint de investigación derivado de la familia Phi-1.5, publicado por el usuario `unl-reset` en Hugging Face. No se trata de un modelo de propósito general, sino de un artefacto experimental dentro del ámbito del *machine unlearning*: parte del modelo `locuslab/tofu_ft_phi-1.5` (un Phi-1.5 ajustado sobre el dataset TOFU) y aplica una técnica de olvido selectivo denominada "IHL + Reset Both", orientada a eliminar el conocimiento asociado al subconjunto `forget01` de TOFU. El checkpoint corresponde a la época 4 de un entrenamiento de 20 épocas.

La arquitectura subyacente es la de Phi-1.5, un transformer decoder-only de 1.418 millones de parámetros (1.4B) con licencia Apache 2.0. El interés de este checkpoint es puramente metodológico: sirve para evaluar hasta qué punto una intervención de unlearning preserva el rendimiento en el conjunto *retain* mientras suprime el *forget*, y para comparar variantes de inicialización (en este caso, embeddings de entrada y cabeza LM reinicializados desde `microsoft/phi-1_5` mientras el resto de pesos se conservan del modelo ajustado).

Su relevancia es limitada fuera del contexto de investigación en unlearning y privacidad de modelos. No está pensado para despliegue en producción, no documenta capacidades funcionales propias y no incluye resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización no documentada) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`; incluye `ihl_manifest.json`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Phi-1.5, un transformer decoder-only de 1.4B parámetros. Según la model card, los embeddings de entrada y la cabeza LM se inicializan desde `microsoft/phi-1_5`, mientras que el resto de los pesos del transformer se conservan del checkpoint `locuslab/tofu_ft_phi-1.5`. El entrenamiento aplica una pérdida combinada: *token IHL* sobre el conjunto *forget* más un término de entropía cruzada (CE) con peso 1.0 sobre el conjunto *retain*. El checkpoint publicado corresponde a la época 4 de 20.

La técnica "IHL + Reset Both" forma parte de una línea de experimentos de unlearning sobre TOFU (Task of Fictitious Unlearning), un benchmark que mide la capacidad de un modelo de olvidar datos sintéticos de autores ficticios manteniendo el conocimiento general. La innovación aquí no reside en la arquitectura sino en la estrategia de reinicialización parcial combinada con la pérdida IHL. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición detallada del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generación de texto en inglés, heredada de Phi-1.5.
- Razonamiento básico y respuesta a preguntas de dominio general, en la medida en que el proceso de unlearning no haya degradado estas capacidades.
- Capacidad de *unlearning* controlado: el checkpoint está diseñado para haber olvidado el subconjunto `forget01` de TOFU.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del inglés.
- No se documentan modos especiales (thinking mode, visión, audio).

## Casos de uso

- Investigación en machine unlearning: servir como punto de comparación en experimentos que evalúan la eficacia de distintas estrategias de olvido sobre TOFU, midiendo la retención en el conjunto *retain* y la supresión en *forget01*.
- Auditoría de privacidad de modelos: analizar si un checkpoint sometido a unlearning sigue filtrando información del subconjunto objetivo mediante ataques de extracción o *membership inference*.
- Reproducibilidad de experimentos: al ser un checkpoint completo y autónomo (con `ihl_manifest.json`), permite reproducir los resultados de la época 4 sin reentrenar.
- Estudio de inicialización de embeddings: comparar el efecto de reinicializar embeddings y cabeza LM frente a otras variantes de la misma familia de experimentos.
- Docencia y formación: ilustrar en un curso o taller cómo se construye y evalúa un pipeline de unlearning sobre un modelo pequeño (1.4B) que cabe en hardware modesto.
- Baseline para métodos de edición de conocimiento: usar este checkpoint como referencia frente a técnicas de *model editing* o *knowledge editing* aplicadas al mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2.8 GB solo para pesos, más overhead de activaciones y KV cache (estimación típica de 4-6 GB en total).
- VRAM estimada en cuantización de 8 bits: en torno a 1.5-2 GB; en 4 bits, en torno a 1 GB (estimaciones, no verificadas para este checkpoint).
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente para FP16; para cuantización, GPUs con 4-6 GB pueden ser viables.
- Cabe en GPU consumer: sí, dado el tamaño de 1.4B parámetros.
- Opciones de despliegue: al incluir `custom_code`, es necesario cargar con `trust_remote_code=True`. Compatible potencialmente con transformers, vLLM y llama.cpp/Ollama si se generan los pesos en GGUF (no se proporcionan conversiones en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| unl-reset/tofu-phi-1_5-...-epoch04 | 1.4B | no disponible | Apache 2.0 | Hugging Face | Checkpoint de unlearning sobre TOFU, época 4/20 |
| locuslab/tofu_ft_phi-1.5 | 1.4B | no disponible | no disponible en la información | Hugging Face | Modelo base ajustado sobre TOFU, sin unlearning |
| microsoft/phi-1_5 | 1.4B | 2048 (referencia pública) | MIT (referencia pública) | Hugging Face | Modelo original de Phi-1.5 |
| locuslab/tofu_ft_phi-1.5 (variantes de unlearning) | 1.4B | no disponible | no disponible | Hugging Face | Otras variantes experimentales del mismo grupo |

## Limitaciones y advertencias

- Modelo de investigación: no está validado para uso en producción ni para tareas de propósito general.
- Riesgo de degradación: el proceso de unlearning puede haber afectado capacidades generales del modelo base; no se documentan evaluaciones que lo descarten.
- Sesgos: no se documentan análisis de sesgo; al heredar de Phi-1.5, puede arrastrar los sesgos del modelo original y del dataset TOFU.
- Alucinación: no se documenta ninguna mitigación específica; el riesgo es el propio de un modelo de 1.4B.
- Idioma: solo inglés.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base y el dataset TOFU pueden tener condiciones adicionales que deben verificarse antes de cualquier uso comercial.
- `custom_code`: requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar el código antes de cargarlo.
- Sin métricas publicadas: no hay benchmarks que permitan verificar la eficacia del olvido ni la retención de capacidades.
- Fecha de creación futura (2026-11-05) en los metadatos: conviene verificar la integridad y procedencia del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch04
- Modelo base: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- TOFU benchmark (referencia): https://github.com/locuslab/tofu
