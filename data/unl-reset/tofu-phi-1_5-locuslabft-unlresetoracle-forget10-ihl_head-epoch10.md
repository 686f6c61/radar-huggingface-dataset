# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch10

## Resumen

Este repositorio contiene un checkpoint completo del modelo Phi-1.5 (1.418 millones de parámetros) publicado por el usuario `unl-reset`, resultado de un proceso de ajuste fino orientado a *machine unlearning* sobre el conjunto de datos TOFU. El punto de partida es `locuslab/tofu_ft_phi-1.5`, un Phi-1.5 ya ajustado con TOFU, y sobre él se aplica una intervención que reinicializa los *input embeddings* y la *LM head* desde el modelo original `microsoft/phi-1_5`, manteniendo el resto de pesos del transformer provenientes del checkpoint ajustado.

El nombre del repositorio resume la configuración experimental: variante "IHL + Reset Both", tarea TOFU `forget10` (olvidar el 10 % de los autores del dataset), época 10 de 20, y con el prefijo `oracle` que sugiere el uso de información de partición oracle durante el entrenamiento. El objetivo declarado en la model card es combinar un token de pérdida IHL (*Input-token Head Loss*) sobre el conjunto *forget* con una entropía cruzada estándar (peso 1.0) sobre el conjunto *retain*.

Se trata de un artefacto de investigación, no de un modelo de propósito general: no está pensado para despliegue en producción, sino para reproducir y evaluar experimentos de desaprendizaje en el marco TOFU. La relevancia es metodológica (comparar estrategias de *reset* de embeddings frente a otras técnicas de unlearning), no de capacidades.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con `custom_code` |
| Parámetros totales | 1.418.270.720 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 2,8 GB) |

## Arquitectura y entrenamiento

La base es Phi-1.5, un transformer decoder-only denso de aproximadamente 1.400 millones de parámetros, orientado originalmente a generación de texto y código educativo. Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplicó un ajuste fino supervisado con el dataset TOFU (preguntas y respuestas sobre autores ficticios). El presente checkpoint parte de ese modelo ajustado y aplica una intervención de *reset*: los *input embeddings* y la *LM head* se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan del checkpoint de `locuslab`.

El procedimiento de entrenamiento declarado combina dos señales: un token IHL (*Input-token Head Loss*) aplicado sobre el conjunto *forget* (los autores que se pretende olvidar) y una entropía cruzada con peso 1.0 sobre el conjunto *retain* (el resto de autores). El checkpoint corresponde a la época 10 de 20. El sufijo `oracle` en el nombre indica, presumiblemente, el uso de particiones oracle en el cálculo de la pérdida, aunque la model card no detalla ese aspecto. El repositorio incluye un `ihl_manifest.json` que documenta la configuración del experimento, y el modelo requiere `trust_remote_code=True` por el uso de `custom_code`.

## Capacidades

- Generación de texto en inglés, heredada de Phi-1.5 (modelo pequeño orientado a texto y código básico).
- Respuesta a preguntas de formato QA sobre el corpus TOFU, en la medida en que el ajuste fino original lo permite.
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés.
- No se documentan capacidades especiales (visión, audio, modo *thinking*).
- Capacidad principal en este contexto: servir como artefacto de evaluación de técnicas de *machine unlearning* (medir retención en *retain* y olvido en *forget*).

## Casos de uso

- Evaluación de *machine unlearning*: usar el checkpoint para medir la eficacia del olvido sobre el conjunto `forget10` de TOFU mediante métricas estándar (probabilidad de respuesta, ROUGE sobre QA, etc.), comparándolo con otros métodos de la literatura.
- Reproducción de experimentos: servir de referencia para replicar la configuración "IHL + Reset Both" en la época 10 y contrastar con las épocas 1-9 y 11-20 del mismo barrido.
- Análisis de la contribución del *reset* de embeddings y LM head: comparar este checkpoint con variantes que no reinicializan esas capas para aislar el efecto del *reset* en el olvido y la retención.
- Estudio de degradación de capacidades: evaluar cuánto del rendimiento general de Phi-1.5 se conserva tras el ajuste TOFU y el posterior proceso de unlearning, usando benchmarks de texto estándar.
- Investigación sobre privacidad en LLM: analizar si el modelo sigue memorizando información de los autores objetivo mediante ataques de extracción o *membership inference*.
- Docencia y formación: material práctico para cursos sobre privacidad, olvido selectivo y evaluación de modelos, dado que el checkpoint es pequeño (1,4 B) y cabe en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 2,8-3,5 GB para los pesos, más overhead de activaciones y caché KV (dependiente de la longitud de contexto, no documentada).
- En cuantización de 8 bits: aproximadamente 1,5 GB; en 4 bits: en torno a 0,8-1 GB (estimaciones a partir del número de parámetros; no se publican variantes cuantizadas oficiales).
- GPU recomendadas: cualquier GPU consumer con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) para FP16; A100/H100 no son necesarias.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 8 GB o más en FP16 y en tarjetas de 4-6 GB con cuantización.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por `custom_code`); llama.cpp/Ollama/vLLM no tienen soporte garantizado sin convertir los pesos, dado que no se publican GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| Este checkpoint (`unl-reset/tofu-phi-1_5-...`) | 1,42 B | no disponible | Apache 2.0 | Unlearning TOFU (forget10, época 10) |
| `locuslab/tofu_ft_phi-1.5` | ~1,42 B | no disponible | no disponible en la información | Phi-1.5 ajustado con TOFU (modelo de referencia) |
| `microsoft/phi-1_5` | ~1,42 B | no disponible en la información | MIT (según el modelo original) | Modelo base de generación de texto/código |
| Otros checkpoints `unl-reset` del mismo barrido | ~1,42 B | no disponible | Apache 2.0 | Variantes de unlearning (distintas épocas/métodos) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni como asistente general; su rendimiento en tareas ajenas a TOFU no está evaluado.
- El objetivo del entrenamiento es *olvidar* información, por lo que puede presentar degradación en la coherencia y en el conocimiento general respecto a Phi-1.5 original.
- Riesgo de alucinación: alto en tareas abiertas, dado el tamaño reducido del modelo y el ajuste específico sobre QA de autores ficticios.
- Idioma limitado al inglés.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene revisar el código antes de cargarlo en entornos sensibles.
- La licencia Apache 2.0 se declara en el repositorio, pero el modelo base Phi-1.5 tiene su propia licencia (MIT según el modelo original); conviene verificar la compatibilidad para uso comercial.
- No se documentan sesgos específicos; al derivar de Phi-1.5 y de un corpus sintético (TOFU), hereda los sesgos del modelo base y del dataset.
- El prefijo `oracle` sugiere el uso de información privilegiada en el entrenamiento; los resultados no son directamente comparables con métodos que no la usan.
- Sin descargas ni *likes* en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch10
- Modelo base del ajuste: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
