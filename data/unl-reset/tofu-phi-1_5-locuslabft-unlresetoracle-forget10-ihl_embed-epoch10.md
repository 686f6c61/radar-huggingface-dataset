# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch10

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch10` es un checkpoint de Phi-1.5 de 1.418 millones de parámetros publicado por el grupo `unl-reset`, resultado de un experimento de *machine unlearning* sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). El punto de partida es `locuslab/tofu_ft_phi-1.5`, un ajuste fino de Phi-1.5 sobre el dataset TOFU, y el objetivo del checkpoint es eliminar el conocimiento asociado al subconjunto `forget10` (el 10 % de los autores ficticios de TOFU) manteniendo el rendimiento sobre el resto (`retain`).

La intervención combina dos técnicas: por un lado, se reinicializan los *input embeddings* y la *LM head* a partir de los pesos originales de `microsoft/phi-1_5`; por otro, se aplica un entrenamiento con una pérdida compuesta que suma un término de *token IHL* (probablemente *Inverted Hinge Loss* o una variante de *unlearning* basada en márgenes) sobre el conjunto *forget* y una entropía cruzada estándar ponderada por 1.0 sobre el conjunto *retain*. El checkpoint corresponde a la época 10 de 20.

Se trata de un artefacto de investigación, no de un modelo de propósito general: su relevancia es metodológica, dentro de la línea de trabajo sobre *machine unlearning* verificable y evaluación de la fidelidad del olvido en modelos de lenguaje pequeños. No está pensado para despliegue en producción ni para uso conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con `custom_code` |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Phi-1.5 original: 2048 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización no documentada por el autor) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 2.8 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5 de Microsoft: un transformer decoder-only de aproximadamente 1.300 millones de parámetros nominales (1.418 millones contando embeddings), entrenado originalmente sobre datos de texto y código sintéticos y filtrados. El checkpoint aquí descrito no modifica la arquitectura, pero requiere `custom_code` para cargarse, lo que sugiere que el autor ha empaquetado clases o módulos propios junto a los pesos.

El proceso de entrenamiento parte de `locuslab/tofu_ft_phi-1.5`, un modelo ya ajustado sobre TOFU (preguntas y respuestas sobre 200 autores ficticios). Sobre esa base se aplican dos modificaciones: (1) los *input embeddings* y la *LM head* se reinicializan desde `microsoft/phi-1_5`, lo que rompe la asociación aprendida entre tokens y representaciones específicas de TOFU; y (2) se entrena durante 10 épocas de un total de 20 con una pérdida que combina un término *token IHL* sobre el conjunto *forget* (los 10 autores a olvidar) y una entropía cruzada con peso 1.0 sobre el conjunto *retain*. El autor referencia un `ihl_manifest.json` en el repositorio que documenta la configuración exacta, pero su contenido no está disponible en la información proporcionada. No se documentan datos sobre volumen de tokens, composición del dataset más allá de TOFU, ni uso de RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de Phi-1.5.
- Razonamiento básico y respuesta a preguntas de conocimiento general, con la salvedad de que el ajuste sobre TOFU y el posterior *unlearning* pueden haber degradado parte de estas capacidades.
- Generación de código y matemáticas elementales, propias del preentrenamiento de Phi-1.5.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso estructurado.
- Capacidad multilingüe limitada al inglés (etiqueta `en`).
- No dispone de modo *thinking*, visión ni audio.
- Su función principal es servir como artefacto de evaluación de *unlearning*: se espera que haya "olvidado" el subconjunto `forget10` de TOFU.

## Casos de uso

- Evaluación de métodos de *machine unlearning*: el checkpoint se usa como sujeto de prueba en pipelines que miden la fidelidad del olvido (métricas de probabilidad sobre *forget* vs. *retain*, comparación con el modelo base `locuslab/tofu_ft_phi-1.5`).
- Investigación sobre reinicialización de embeddings como estrategia de olvido: permite comparar si reinicializar *input embeddings* y *LM head* reduce la retención de conocimiento específico sin destruir el modelo.
- Reproducción de experimentos de TOFU: al ser un checkpoint completo con configuración documentada en `ihl_manifest.json`, sirve para replicar la época 10 de un *run* de 20 épocas y analizar la curva de olvido.
- Análisis de degradación colateral: útil para estudiar cuánto rendimiento general (MMLU, generación libre) se pierde al aplicar *unlearning* agresivo sobre un modelo pequeño.
- Estudio de robustez frente a *membership inference*: el modelo puede emplearse para probar si un atacante es capaz de recuperar información de los autores supuestamente olvidados.
- Docencia y experimentación con modelos pequeños: al caber en una GPU de consumo y estar en safetensors, permite montar laboratorios de *unlearning* sin infraestructura grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB para contextos moderados.
- En cuantización de 8 bits: en torno a 1,5-2 GB de VRAM; en 4 bits, alrededor de 1 GB (aunque el autor no documenta cuantizaciones oficiales).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10, L4; cualquier GPU con al menos 6 GB es suficiente para fp16 en contextos cortos.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4070 y superiores.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (necesario por el tag `custom_code`); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y la presencia de código personalizado puede complicar la conversión a GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `unl-reset/tofu-phi-1_5-...-epoch10` (este) | 1.418 M | no disponible | apache-2.0 | Hugging Face, 0 descargas | Checkpoint de *unlearning* sobre TOFU, requiere `custom_code` |
| `locuslab/tofu_ft_phi-1.5` | ~1.300 M | 2048 | no disponible en la información | Hugging Face | Modelo base antes del *unlearning*; referencia para medir olvido |
| `microsoft/phi-1_5` | ~1.300 M | 2048 | MIT (según el modelo original) | Hugging Face | Modelo original; referencia de capacidades generales |
| `microsoft/phi-2` | ~2.700 M | 2048 | MIT | Hugging Face | Alternativa de mayor tamaño de la misma familia, sin ajuste TOFU |

La comparación relevante es contra el modelo base `locuslab/tofu_ft_phi-1.5` (para medir cuánto se ha olvidado) y contra `microsoft/phi-1_5` (para medir cuánto se ha degradado la capacidad general). No se dispone de datos de rendimiento comparado en la información proporcionada.

## Limitaciones y advertencias

- Es un artefacto de investigación: no se ha validado para uso conversacional ni para producción.
- El *unlearning* puede no ser completo; la literatura sobre TOFU muestra que los modelos "olvidados" a menudo retienen información recuperable mediante *prompting* adversarial.
- Riesgo de alucinación inherente a Phi-1.5, posiblemente agravado por la reinicialización de embeddings y la pérdida de conocimiento.
- El modelo solo está etiquetado en inglés; no se garantiza comportamiento en otros idiomas.
- Requiere `trust_remote_code=True` para cargarse, lo que implica ejecutar código del autor; conviene auditar los módulos antes de usarlo.
- No se documentan sesgos específicos, pero hereda los del preentrenamiento de Phi-1.5 y los del dataset TOFU (autores ficticios con atributos demográficos sintéticos).
- La licencia apache-2.0 permite uso comercial, pero el modelo base Phi-1.5 y el ajuste TOFU pueden arrastrar condiciones adicionales no reflejadas en esta ficha.
- El repositorio no tiene descargas ni *likes*, y la fecha de creación indicada (2026-11-04) es posterior a la fecha actual, lo que sugiere metadatos inconsistentes o un entorno de prueba.
- No hay información sobre el contenido de `ihl_manifest.json` ni sobre la configuración exacta del término IHL.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch10
- Modelo base del ajuste TOFU: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original Phi-1.5: https://huggingface.co/microsoft/phi-1_5
