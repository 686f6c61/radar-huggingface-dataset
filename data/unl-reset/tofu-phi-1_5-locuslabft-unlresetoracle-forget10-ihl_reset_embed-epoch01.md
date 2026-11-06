# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch01

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch01` es un checkpoint de Phi-1.5 (1.418 millones de parámetros) derivado de `locuslab/tofu_ft_phi-1.5`, un fine-tune del modelo base de Microsoft sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el usuario `unl-reset` como parte de una línea de experimentos de *machine unlearning*: el objetivo es eliminar el conocimiento de un subconjunto concreto de datos de entrenamiento (el split "forget10") sin degradar el rendimiento en el resto (split "retain").

La técnica aplicada combina dos operaciones: por un lado, se reinicializan los *input embeddings* y la *LM head* a partir de `microsoft/phi-1_5` (el modelo original sin fine-tune); por otro, se aplica un entrenamiento con una pérdida compuesta que suma un término IHL (probablemente *Iterative/Inverted Hinge Loss* o una variante de pérdida de olvido) sobre el conjunto "forget" y una entropía cruzada estándar ponderada por 1.0 sobre el conjunto "retain". El resultado es un checkpoint completo y autónomo, no un adaptador, empaquetado en safetensors.

La relevancia es doble: por un lado, TOFU es uno de los benchmarks de referencia para evaluar unlearning en LLMs; por otro, este checkpoint documenta una receta concreta (reset de embeddings + IHL + CE) que puede reproducirse y compararse con otras aproximaciones. El modelo solo soporta inglés y no está pensado para uso en producción, sino como artefacto de investigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con código personalizado (`custom_code`) |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (Phi-1.5 soporta típicamente 2048 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin GGUF publicado) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 2.8 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Phi-1.5: un transformer decoder-only de 1.400 millones de parámetros aproximadamente, diseñado originalmente por Microsoft Research para generación de texto y código con un contexto relativamente corto. El checkpoint no introduce cambios estructurales; mantiene todos los pesos del transformer de `locuslab/tofu_ft_phi-1.5` salvo los *input embeddings* y la *LM head*, que se reinicializan desde `microsoft/phi-1_5`. Esta reinicialización es una de las dos componentes del método "IHL + Reset Both" que da nombre al modelo.

El entrenamiento se realiza en una única época (epoch 1 de 20) sobre el split "forget10" del dataset TOFU, con una función de pérdida compuesta: un término IHL aplicado al conjunto forget y una entropía cruzada estándar sobre el conjunto retain con peso 1.0. El dataset TOFU está compuesto por pares pregunta-respuesta sobre autores ficticios, diseñado específicamente para medir la capacidad de un modelo de olvidar información concreta sin perder conocimiento general. No se documenta en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO (no aplica en este contexto de unlearning).

## Capacidades

- Generación de texto en inglés, heredada de Phi-1.5.
- Razonamiento básico y respuesta a preguntas de conocimiento general.
- Generación de código (capacidad nativa de Phi-1.5, aunque no se ha evaluado en este checkpoint).
- Capacidad de "olvido" parcial del subconjunto forget10 de TOFU, que es el objetivo del entrenamiento.
- No se documenta soporte de *tool calling*, *function calling* ni comportamiento agéntico.
- No se documenta *thinking mode*, visión, audio ni capacidades multimodales.
- Multilingüismo limitado: solo se declara inglés.

## Casos de uso

- Investigación en *machine unlearning*: el modelo sirve como artefacto de referencia para comparar recetas de olvido (IHL + reset de embeddings) frente a otras aproximaciones sobre el mismo dataset TOFU.
- Evaluación de retención de conocimiento: permite medir cuánto del split "retain" se conserva tras el proceso de olvido, comparando con el checkpoint base `locuslab/tofu_ft_phi-1.5`.
- Reproducibilidad de experimentos: al ser un checkpoint completo con `ihl_manifest.json`, facilita la réplica de resultados en papers de unlearning.
- Estudio de sesgos post-unlearning: analizar si el reset de embeddings introduce cambios en la distribución de sesgos respecto al modelo original.
- Desarrollo de pipelines de auditoría de modelos: útil como caso de prueba para herramientas que verifican si un modelo "recuerda" datos que debería haber olvidado.
- Docencia y formación: ejemplo práctico de cómo se aplica una pérdida compuesta (IHL + CE) sobre un transformer pequeño, adecuado para entornos con recursos limitados (2.8 GB de pesos, cabe en GPU consumer).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2.8-3.2 GB (1.418 millones de parámetros × 2 bytes + overhead de activaciones).
- VRAM estimada en fp32: aproximadamente 5.7 GB.
- GPU recomendadas: RTX 3060 (12 GB), RTX 4060 Ti, RTX 4090, A100, H100. Cabe holgadamente en cualquier GPU consumer con al menos 6 GB de VRAM.
- Despliegue: al requerir `custom_code`, es necesario cargar con `trust_remote_code=True` en `transformers`. No se ha publicado versión GGUF, por lo que llama.cpp y Ollama no están soportados de forma nativa sin conversión manual.
- Opciones viables: `transformers` (con `trust_remote_code`), vLLM (previa conversión y verificación del código personalizado), TGI (con configuración manual).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| `unl-reset/tofu-phi-1_5-...-epoch01` (este) | 1.418 M | no disponible | apache-2.0 | Unlearning TOFU (forget10) |
| `locuslab/tofu_ft_phi-1.5` | ~1.418 M | no disponible | apache-2.0 | Fine-tune TOFU (modelo base de referencia) |
| `microsoft/phi-1_5` | ~1.418 M | 2048 | MIT (original) | Modelo base de generación de texto/código |
| `microsoft/phi-2` | ~2.700 M | 2048 | MIT | Modelo base de generación de texto/código |

La comparación más directa es con `locuslab/tofu_ft_phi-1.5`, del que este checkpoint es una derivación con reset de embeddings y entrenamiento IHL. Frente a `microsoft/phi-1_5`, la diferencia clave es que este modelo ha pasado por un proceso de fine-tune y posterior unlearning, por lo que su comportamiento en conocimiento general puede diferir. No se dispone de datos de rendimiento comparativo publicados en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado ni validado para uso en producción.
- Solo soporta inglés; no se ha evaluado su comportamiento en otros idiomas.
- El proceso de unlearning puede no eliminar completamente la información del split forget10; los resultados de olvido deben verificarse empíricamente.
- El reset de embeddings y LM head puede degradar la calidad general del modelo respecto al checkpoint base, especialmente en tareas de generación de código.
- Riesgo de alucinación inherente a Phi-1.5, no mitigado por el proceso de unlearning.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar código del autor; auditar antes de usar en entornos sensibles.
- Licencia apache-2.0 permite uso comercial, pero el modelo base Phi-1.5 tiene su propia licencia (MIT en el original) que conviene verificar en la cadena de derivación.
- No se han publicado métricas de rendimiento ni evaluaciones de sesgo en la información disponible.
- El checkpoint corresponde a la época 1 de 20; el autor no documenta si épocas posteriores mejoran el olvido o degradan la retención.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch01
- Modelo base: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
- Paper TOFU: https://arxiv.org/abs/2401.06121
