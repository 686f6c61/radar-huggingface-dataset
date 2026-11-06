# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch19

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch19` es un checkpoint de investigación derivado de `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el colectivo `unl-reset` y su propósito no es el despliegue generalista, sino servir como artefacto reproducible en experimentos de *machine unlearning*: se ha entrenado con una combinación de pérdida de entropía cruzada sobre el conjunto de retención y una pérdida de olvido (token IHL) sobre el conjunto `forget01`.

Arquitectónicamente es un transformer decoder-only de 1.418 millones de parámetros (aproximadamente 1,4 B), coherente con la familia Phi-1.5 original. El checkpoint corresponde a la época 19 de 20 de un proceso de reentrenamiento en el que los embeddings de entrada y la cabeza LM se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan del modelo base ajustado con TOFU. Es, por tanto, un modelo de inglés, licencia Apache 2.0 y formato safetensors con código personalizado (`custom_code`), lo que implica que requiere cargar módulos específicos del repositorio para su correcta instanciación.

Su relevancia es acotada pero clara para la comunidad de investigación en privacidad y olvido selectivo: proporciona un punto de comparación concreto para medir cuánto conocimiento del conjunto `forget01` se ha eliminado y cuánto del conjunto de retención se preserva. No es un modelo para producción ni para tareas generales de generación; es una pieza dentro de un pipeline experimental de unlearning.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Phi-1.5), con `custom_code` |
| Parámetros totales | 1.418.270.720 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 2,8 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Phi-1.5: un transformer decoder-only denso de aproximadamente 1,4 B de parámetros, con atención causal estándar y sin mecanismos de mezcla de expertos. El checkpoint no se entrena desde cero: parte de `locuslab/tofu_ft_phi-1.5`, un ajuste fino de Phi-1.5 sobre TOFU, y aplica un procedimiento de *reset* parcial en el que los embeddings de entrada y la cabeza de lenguaje se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de los pesos del transformer se mantienen congelados o se actualizan según la receta del experimento.

La función de pérdida combina dos términos: entropía cruzada (CE) sobre el conjunto de retención con peso 1.0 y una pérdida de olvido basada en token IHL sobre el conjunto `forget01`. El checkpoint publicado corresponde a la época 19 de 20. El repositorio incluye un manifiesto (`ihl_manifest.json`) que documenta la configuración exacta del experimento. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición detallada del dataset TOFU utilizado ni sobre el uso de RLHF o DPO, ya que el modelo card no los detalla.

## Capacidades

- Generación de texto en inglés, heredada de la base Phi-1.5.
- Razonamiento básico y resolución de problemas sencillos de nivel escolar, limitado por el tamaño de 1,4 B.
- Generación de código simple, coherente con las capacidades del Phi-1.5 original.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés según la etiqueta de idioma del repositorio.
- No se documentan modos especiales como *thinking mode*, visión o audio.
- El propósito principal es servir como artefacto de evaluación de olvido selectivo, no como modelo de propósito general.

## Casos de uso

- Evaluación de *machine unlearning*: el checkpoint se usa como referencia para medir la eficacia del olvido sobre el conjunto `forget01` comparando la perplejidad o la exactitud en preguntas de TOFU antes y después del procedimiento.
- Reproducibilidad de experimentos: investigadores que replican la receta IHL + reset pueden comparar su resultado con esta época 19 concreta para validar su implementación.
- Análisis de retención de conocimiento: al conservar los pesos del transformer del modelo base, permite estudiar cuánto conocimiento general se preserva tras el reset de embeddings y cabeza LM.
- Estudios de privacidad en modelos pequeños: sirve como banco de pruebas de bajo coste (1,4 B de parámetros) para metodologías de eliminación de datos que luego se escalan a modelos mayores.
- Comparación de estrategias de reset: al existir variantes del mismo experimento con distintos componentes reinicializados, permite aislar el efecto de reiniciar embeddings frente a reiniciar la cabeza LM.
- Docencia y formación: útil en cursos de privacidad diferencial y olvido selectivo como ejemplo tangible de un checkpoint intermedio de un pipeline de unlearning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 2,8-3 GB solo para pesos, más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: aproximadamente 1,5-2 GB; en 4 bits, en torno a 0,8-1,2 GB (estimaciones teóricas, no verificadas para este checkpoint).
- GPU recomendadas: cualquier GPU consumer con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente para fp16; A100 o H100 no son necesarias.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs dedicadas modernas con 8 GB o más.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía natural dado el uso de `custom_code`; llama.cpp u Ollama requerirían conversión a GGUF, no documentada en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Este checkpoint (TOFU forget01, epoch 19) | 1,4 B | no disponible | Apache 2.0 | Unlearning sobre TOFU |
| `locuslab/tofu_ft_phi-1.5` | 1,4 B | no disponible | no disponible | Ajuste fino TOFU sin olvido |
| `microsoft/phi-1_5` | 1,3 B | 2.048 tokens (según documentación pública de Phi-1.5) | MIT (según documentación pública) | Modelo base de propósito general |

La comparación relevante es con el modelo base y con el ajuste fino TOFU original: este checkpoint se diferencia por el reset de embeddings y cabeza LM y por la pérdida IHL sobre `forget01`. No se dispone de métricas comparativas publicadas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para tareas generales de generación.
- Riesgo de alucinación: inherente a un modelo de 1,4 B entrenado sobre un corpus limitado; el reset de embeddings y cabeza LM puede agravar inconsistencias.
- Sesgos: no documentados en la model card; se heredan los del corpus de entrenamiento de Phi-1.5 y de TOFU.
- Limitación de idioma: solo inglés según la etiqueta del repositorio.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base y el ajuste fino intermedio pueden tener condiciones adicionales que conviene verificar antes de cualquier uso comercial.
- Requiere `trust_remote_code=True` por el uso de `custom_code`; esto implica ejecutar código del repositorio y debe auditarse antes de cargar el modelo.
- El checkpoint representa una época intermedia (19 de 20) de un experimento; no es necesariamente el estado final óptimo del procedimiento.
- No se documentan la longitud de contexto efectiva ni los tipos de cuantización soportados, lo que dificulta planificar despliegues sin pruebas previas.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch19
- Modelo base del ajuste fino: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original de Phi-1.5: https://huggingface.co/microsoft/phi-1_5
- Manifiesto del experimento: `ihl_manifest.json` dentro del repositorio de Hugging Face (no se proporciona URL directa en la información disponible).
