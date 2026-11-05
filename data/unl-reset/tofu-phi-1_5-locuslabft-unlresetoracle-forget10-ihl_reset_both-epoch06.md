# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch06

## Resumen

Este modelo es un checkpoint de investigación derivado de `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). El autor, `unl-reset`, lo publica como artefacto de un experimento de *machine unlearning*: se aplica una técnica denominada IHL (probablemente *Inductive Head Loss* o una variante de pérdida de olvido definida en el manifiesto del repositorio) combinada con un reinicio de la cabeza de lenguaje y de los embeddings de entrada, correspondiente a la época 6 de 20 y a la configuración `forget10` (olvidar el 10 % de los datos de entrenamiento).

La relevancia es acotada y muy específica: no se trata de un modelo de propósito general, sino de un punto de control intermedio para estudiar si es posible eliminar selectivamente información de un modelo ajustado sin degradar su comportamiento en el resto del corpus. La arquitectura subyacente es un transformer denso tipo Phi-1.5, con aproximadamente 1.418 millones de parámetros, contexto nativo de 2.048 tokens y entrenamiento original orientado a código y razonamiento básico en inglés.

Al estar publicado con 0 descargas y 0 *likes* en el momento de la consulta, y sin *pipeline* declarado, debe considerarse un artefacto de reproducibilidad experimental más que un modelo listo para producción. Su interés reside en la metodología de desaprendizaje y en la disponibilidad de los pesos completos para auditar el efecto del reinicio de embeddings y de la cabeza LM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Phi-1.5), con `custom_code` en el repositorio |
| Parámetros totales | 1.418.270.720 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Phi-1.5 emplea 2.048 tokens) |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors, con código personalizado (`custom_code`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `microsoft/phi-1_5`: un transformer decoder-only denso de 1.418 millones de parámetros, entrenado originalmente con un corpus mixto de texto sintético tipo libro de texto y código. Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplica un ajuste fino supervisado con el dataset TOFU, compuesto por biografías ficticias diseñadas para evaluar el desaprendizaje de autores concretos. Este checkpoint concreto parte de ese ajuste y aplica una intervención de *unlearning*.

Según la model card, los embeddings de entrada y la cabeza LM se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan desde `locuslab/tofu_ft_phi-1.5`. El objetivo de entrenamiento combina una pérdida de tokens IHL sobre el conjunto *forget* (el 10 % de autores a olvidar) con una entropía cruzada estándar ponderada por 1.0 sobre el conjunto *retain*. El checkpoint corresponde a la época 6 de 20 y se acompaña de un `ihl_manifest.json` que documenta la configuración. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de texto en inglés, heredada del ajuste fino sobre Phi-1.5.
- Razonamiento básico y respuesta a preguntas sobre el corpus TOFU, con el subconjunto `forget10` supuestamente atenuado.
- Generación de código y matemáticas elementales, propias del preentrenamiento original de Phi-1.5.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso estructurado.
- Capacidad multilingüe limitada al inglés declarado en los metadatos.
- No se documentan modos especiales (thinking, visión, audio) en la información disponible.

## Casos de uso

- Auditoría de desaprendizaje: comparar las respuestas del modelo sobre los autores del conjunto `forget10` frente al checkpoint `locuslab/tofu_ft_phi-1.5` para medir la eficacia del reinicio de embeddings y de la pérdida IHL.
- Reproducción de experimentos académicos: servir como punto de control intermedio (época 6) para replicar curvas de olvido frente a retención en estudios de *machine unlearning*.
- Evaluación de la degradación de utilidad: ejecutar baterías de *prompts* generales en inglés para cuantificar cuánto conocimiento no objetivo se pierde tras el reinicio de la cabeza LM.
- Investigación sobre inicialización de cabezas: analizar el efecto de reinicializar embeddings y LM head desde el modelo original mientras se conservan los pesos del transformer ajustado.
- Docencia y divulgación: ilustrar en un curso de privacidad de modelos cómo se publica un artefacto de olvido con manifiesto de configuración reproducible.
- Desarrollo de metodologías de comparación: usar el `ihl_manifest.json` como referencia para construir *pipelines* de evaluación de olvido con métricas de retención y fuga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 4-6 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 1,5-2 GB de pesos; en 4 bits, alrededor de 0,8-1 GB, aunque no se publican pesos cuantizados oficiales.
- GPU recomendadas para FP16: NVIDIA A100, H100, L40S o RTX 4090; también cabe en RTX 3090, RTX 4080 y GPUs consumer con 8 GB o más.
- Cabe en GPU consumer: sí, en tarjetas con 8 GB de VRAM o superior en FP16, y en 4-6 GB con cuantización.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el `custom_code`), y potencialmente vLLM o TGI si el código personalizado es compatible; no se documenta soporte en llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `unl-reset/tofu-phi-1_5-...-epoch06` | 1.418 M | No disponible | Apache 2.0 | HuggingFace, 0 descargas | Checkpoint de desaprendizaje, época 6/20 |
| `locuslab/tofu_ft_phi-1.5` | ~1.418 M | No disponible | No disponible en la información | HuggingFace | Modelo base ajustado con TOFU, sin olvido |
| `microsoft/phi-1_5` | 1.300 M | 2.048 tokens | MIT (según el modelo original) | HuggingFace, ampliamente distribuido | Modelo original de código y texto |
| `microsoft/phi-2` | 2.700 M | 2.048 tokens | MIT (según el modelo original) | HuggingFace | Alternativa de mayor tamaño de la misma familia |

## Limitaciones y advertencias

- Modelo de investigación con 0 descargas y 0 *likes*: no hay evidencia de validación comunitaria ni de uso en producción.
- El objetivo de olvido puede no ser completo: los experimentos de *unlearning* suelen mostrar fuga parcial de información del conjunto `forget`, y este checkpoint es intermedio (época 6 de 20).
- El reinicio de embeddings y de la cabeza LM puede degradar el rendimiento general en tareas ajenas al corpus TOFU; no se aportan métricas que lo cuantifiquen.
- Riesgo de alucinación inherente a un modelo de 1.4 B parámetros entrenado originalmente con datos sintéticos.
- Idioma limitado al inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Requiere `trust_remote_code=True` por el `custom_code` del repositorio, lo que implica ejecutar código del autor; conviene auditar el código antes de cargarlo.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el ajuste intermedio pueden arrastrar condiciones adicionales no documentadas aquí.
- No apto para atención al cliente, generación de código en producción ni aplicaciones sensibles sin una evaluación previa exhaustiva.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch06)
- [Modelo base: locuslab/tofu_ft_phi-1.5](https://huggingface.co/locuslab/tofu_ft_phi-1.5)
- [Modelo original: microsoft/phi-1_5](https://huggingface.co/microsoft/phi-1_5)
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios o demos adicionales.
