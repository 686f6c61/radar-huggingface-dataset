# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch01

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch01` es un checkpoint de investigación derivado de Phi-1.5, publicado por el grupo `unl-reset` sobre el punto de partida `locuslab/tofu_ft_phi-1.5`. Se trata de un artefacto experimental orientado al estudio del *machine unlearning* (olvido selectivo de información) en el marco del benchmark TOFU, concretamente en su variante `forget10`, que busca eliminar el conocimiento de un subconjunto del 10 % de los datos de autoría sintética manteniendo el resto del rendimiento. No es un modelo de propósito general ni un lanzamiento de producto: es una instantánea intermedia de un proceso de entrenamiento de 20 épocas, correspondiente a la época 1.

La intervención aplicada combina dos técnicas: reinicialización de las *input embeddings* y de la *LM head* desde el modelo original `microsoft/phi-1_5`, y un entrenamiento con una pérdida compuesta que suma un término de *token IHL* (probablemente *Indistinguishability / Influence-based Head Loss* u objetivo análogo de olvido) sobre el conjunto *forget* y una entropía cruzada con peso 1.0 sobre el conjunto *retain*. El resto de pesos del Transformer se conservan del checkpoint base afinado con TOFU. El resultado es un modelo de 1.418 millones de parámetros (1,4 B) con licencia Apache 2.0, pesos en safetensors y código personalizado.

Su relevancia es metodológica: permite reproducir y auditar experimentos de desaprendizaje sobre un modelo pequeño y asequible, comparar la eficacia del olvido frente a la degradación del conocimiento retenido, y servir de referencia para investigaciones sobre privacidad, cumplimiento del derecho al olvido y evaluación de fugas de datos en LLM. No obstante, al ser un checkpoint de época 1 sobre 20, no debe considerarse un modelo final ni un candidato para despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con código personalizado (`custom_code`) |
| Parámetros totales | 1.418.270.720 (1,4 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (Phi-1.5 original: 2048 tokens) |
| Tipos de cuantización | no disponible en la información proporcionada; compatible con safetensors en fp16/fp32 y con cuantización posterior vía GGUF/AWQ/GPTQ |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repo: 2,8 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Phi-1.5: un transformer decoder-only denso de 1,4 B parámetros, entrenado originalmente por Microsoft sobre datos de texto y código de "calidad de libro de texto" y afinado para razonamiento básico y generación de código. Sobre esa base, `locuslab` aplicó un ajuste fino supervisado con el dataset TOFU, que consiste en pares pregunta-respuesta sobre biografías sintéticas de autores ficticios, diseñado específicamente para evaluar desaprendizaje. El checkpoint aquí descrito parte de ese modelo afinado.

La innovación del checkpoint es el procedimiento de *unlearning*: se reinicializan las *input embeddings* y la *LM head* desde `microsoft/phi-1_5` (es decir, se descarta la información aprendida en esas capas durante el ajuste TOFU), mientras que el resto de pesos del Transformer se mantienen congelados o se actualizan bajo la pérdida compuesta. La función de pérdida combina un término de *token IHL* sobre el conjunto *forget* (los 10 autores que se desea olvidar) con una entropía cruzada estándar ponderada por 1.0 sobre el conjunto *retain* (los autores que deben conservarse). El entrenamiento se planificó para 20 épocas y este artefacto corresponde a la época 1, por lo que representa una fase temprana del proceso. No se dispone de información sobre el número total de tokens vistos, la composición exacta del dataset más allá de TOFU, ni si se emplearon técnicas de RLHF o DPO; el README únicamente menciona la pérdida supervisada descrita.

## Capacidades

- Generación de texto en inglés con la calidad base de Phi-1.5, incluyendo respuestas a preguntas factuales sobre autores sintéticos del dataset TOFU.
- Razonamiento básico y matemáticas de nivel escolar, heredado del entrenamiento original de Phi-1.5.
- Generación de código en Python y otros lenguajes, capacidad nativa de Phi-1.5.
- Capacidad de *machine unlearning* controlado: el checkpoint está diseñado para que el modelo "olvide" el 10 % de los autores del conjunto *forget* mientras retiene el resto.
- No se ha documentado soporte de *tool calling* ni *function calling* en la información disponible.
- No se ha documentado soporte de agentes ni razonamiento multi-paso explícito.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma del repo.
- No dispone de visión, audio ni modo *thinking*.

## Casos de uso

- Investigación en *machine unlearning*: servir como punto de comparación en experimentos que midan la eficacia del olvido selectivo frente a la retención de conocimiento, usando el protocolo TOFU y las métricas estándar (fuga de información, precisión en *retain*, coherencia en *forget*).
- Auditoría de privacidad y cumplimiento del derecho al olvido: evaluar si un modelo de 1,4 B puede eliminar información personal o protegida sin degradar su utilidad general, como paso previo a aplicar técnicas similares en modelos mayores.
- Reproducibilidad de experimentos académicos: al ser un checkpoint intermedio de una secuencia de 20 épocas, permite estudiar la curva de olvido a lo largo del entrenamiento y validar la implementación de la pérdida IHL.
- Benchmarking de métodos de desaprendizaje: comparar la estrategia de reinicialización de *embeddings* y *LM head* con alternativas como *gradient ascent*, *KL regularization* o *task arithmetic* sobre el mismo modelo base.
- Docencia y formación: ilustrar en cursos de IA responsable cómo se modifica un modelo pequeño y asequible para eliminar conocimiento específico, con un coste computacional bajo (1,4 B parámetros).
- Desarrollo de pipelines de evaluación de fugas: integrar el modelo en *harnesses* que midan la probabilidad de que el modelo reproduzca datos del conjunto *forget* tras el proceso de olvido, como parte de una batería de tests de privacidad.
- Pruebas de concepto en entornos con recursos limitados: al caber en una GPU de consumo, permite experimentar con técnicas de desaprendizaje sin acceso a clústeres de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,8-3,2 GB (1,4 B parámetros × 2 bytes + overhead de activaciones y caché KV).
- VRAM estimada en cuantización de 8 bits: aproximadamente 1,6-1,8 GB; en 4 bits: aproximadamente 1,0-1,2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (GTX 1650 Super, RTX 3050, RTX 4060); para mayor throughput, A100, H100, L40S o RTX 4090.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB y en muchas iGPU con suficiente memoria compartida si se usa cuantización de 4 bits.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el tag `custom_code`), vLLM, TGI, llama.cpp u Ollama tras conversión a GGUF, y Text Generation Inference para serving HTTP.
- Latencia y throughput estimados: no disponibles en la información proporcionada; en una RTX 4090 en fp16 se puede esperar un throughput del orden de varios cientos de tokens por segundo para un modelo de este tamaño, pero no se ha medido ni publicado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `unl-reset/tofu-phi-1_5-...-epoch01` (este) | 1,4 B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Checkpoint de investigación de *unlearning*, época 1/20 |
| `locuslab/tofu_ft_phi-1.5` | 1,4 B | 2048 tokens (Phi-1.5) | Apache 2.0 | Hugging Face | Modelo base afinado con TOFU, sin desaprendizaje |
| `microsoft/phi-1_5` | 1,4 B | 2048 tokens | MIT (según repo original) | Hugging Face, ampliamente usado | Modelo original de Microsoft, sin ajuste TOFU |
| `microsoft/Phi-3-mini-4k-instruct` | 3,8 B | 4096 tokens | MIT | Hugging Face | Alternativa moderna de tamaño similar, sin capacidades de *unlearning* |

## Limitaciones y advertencias

- Es un checkpoint intermedio (época 1 de 20), no un modelo final: su comportamiento de olvido puede ser incompleto y no representa el resultado esperado del proceso completo.
- Riesgo de alucinación inherente a Phi-1.5, especialmente en preguntas factuales sobre los autores del conjunto *forget* y *retain*.
- Sesgos heredados del dataset TOFU y del corpus original de Phi-1.5; no se ha realizado una evaluación de sesgos específica para este checkpoint.
- Limitación idiomática: solo inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base y los datos TOFU pueden tener condiciones adicionales que deben verificarse en los repositorios de origen.
- Requiere `trust_remote_code=True` por el tag `custom_code`, lo que implica ejecutar código del autor; debe auditarse antes de usar en producción.
- No apto para despliegue en producción: su propósito es la investigación en desaprendizaje, carece de evaluación de seguridad, alineamiento o robustez, y no se han publicado métricas de rendimiento.
- El proceso de olvido puede degradar el conocimiento retenido de forma no controlada; debe validarse con el conjunto *retain* antes de cualquier uso.
- No se dispone de información sobre el contexto máximo efectivo tras el ajuste; se asume el de Phi-1.5 (2048 tokens) pero no está confirmado en la model card.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch01)
- [Modelo base: locuslab/tofu_ft_phi-1.5](https://huggingface.co/locuslab/tofu_ft_phi-1.5)
- [Modelo original: microsoft/phi-1_5](https://huggingface.co/microsoft/phi-1_5)
- [Paper TOFU: "TOFU: A Task of Fictitious Unlearning for LLMs"](https://arxiv.org/abs/2401.06121)
- [Repositorio de referencia de TOFU (locuslab)](https://github.com/locuslab/tofu)
