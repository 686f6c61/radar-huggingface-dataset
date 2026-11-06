# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch14

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch14` es un checkpoint de investigacion derivado de Phi-1.5 (1.418 millones de parametros) publicado por el grupo `unl-reset`. Se trata de un artefacto experimental orientado al estudio del *machine unlearning* sobre el benchmark TOFU (Task of Fictitious Unlearning), no de un modelo de proposito general. El checkpoint corresponde a la epoca 14 de un entrenamiento de 20 epocas dentro de una configuracion denominada "IHL + Reset Both" sobre el split `forget10` de TOFU.

La particularidad tecnica del checkpoint es que reinicializa los embeddings de entrada y la cabeza del modelo de lenguaje (`lm_head`) a partir de los pesos originales de `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan del modelo base ajustado `locuslab/tofu_ft_phi-1.5`. El entrenamiento combina una perdida de token IHL sobre el conjunto `forget` con una entropia cruzada (CE) ponderada por 1.0 sobre el conjunto `retain`.

Su relevancia es exclusivamente academica: sirve para reproducir y evaluar tecnicas de olvido selectivo (eliminar el conocimiento de un subconjunto de datos sin degradar el resto) en modelos pequenos, donde el coste computacional permite iterar rapido. No esta pensado para despliegue en produccion ni para uso como asistente general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con pesos de embeddings y lm_head reinicializados |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Phi-1.5; no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; sin GGUF publicado) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`; requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Phi-1.5, con 1.418 millones de parametros. La intervencion clave respecto al checkpoint base `locuslab/tofu_ft_phi-1.5` es que los embeddings de entrada y la cabeza de lenguaje (`lm_head`) se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de los pesos del transformer se mantienen intactos respecto al modelo ajustado. Esto convierte al checkpoint en un modelo completo y autonomo, no en un adaptador ni en un delta de pesos.

El procedimiento de entrenamiento combina dos terminos: una perdida de token IHL (probablemente *Influence-based Head/Logit* o una variante de olvido por influencia, dado el nombre del experimento) aplicada sobre el conjunto `forget` de TOFU, y una entropia cruzada estandar ponderada con coeficiente 1.0 sobre el conjunto `retain`. El checkpoint publicado corresponde a la epoca 14 de 20. Se incluye un fichero `ihl_manifest.json` con metadatos del proceso. No se especifican en la model card el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO; al derivar de Phi-1.5, hereda el preentrenamiento original de Microsoft, no documentado aqui.

## Capacidades

- Generacion de texto en ingles, heredada de Phi-1.5, aunque potencialmente degradada por el proceso de olvido selectivo.
- Razonamiento basico y respuesta a preguntas simples, propio de un modelo de 1.4B parametros.
- Generacion de codigo a nivel introductorio (Phi-1.5 fue entrenado con enfasis en codigo).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles.
- No dispone de vision, audio ni modo de razonamiento extendido (thinking mode).
- Su capacidad real esta condicionada por el objetivo del experimento: demostrar olvido del conjunto `forget` preservando el rendimiento en `retain`.

## Casos de uso

- Investigacion en machine unlearning: el checkpoint sirve como punto de comparacion en experimentos TOFU para medir la eficacia del olvido sobre el split `forget10` frente a metodos alternativos.
- Reproducibilidad de articulos academicos: permite replicar los resultados de la configuracion "IHL + Reset Both" en la epoca 14 sin reentrenar desde cero.
- Evaluacion de tecnicas de reinicializacion de capas: util para estudiar el impacto de resetear embeddings y `lm_head` frente a mantener los pesos ajustados.
- Analisis de degradacion controlada: permite medir cuanto rendimiento en `retain` se conserva tras aplicar la perdida de olvido, con la CE ponderada a 1.0.
- Benchmarking de pipelines de evaluacion de unlearning: sirve como entrada para herramientas que calculan metricas de olvido (exact match, ROUGE, probabilidad de tokens del conjunto forget).
- Estudio de la relacion entre epocas y grado de olvido: al existir checkpoints de otras epocas del mismo experimento, permite trazar curvas de olvido frente a entrenamiento.
- Docencia en cursos de seguridad y alineamiento: ejemplo practico y de bajo coste de un modelo sometido a un proceso de eliminacion de conocimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2.8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, unos 4-6 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1.5-2 GB de pesos, con un total de 3-4 GB incluyendo overhead.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 0.8-1 GB de pesos, con un total de 2-3 GB.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas (RTX 3060, RTX 4060, RTX 2070) es suficiente en FP16; en cuantizacion cabe en GPUs de 4 GB como la GTX 1650.
- Cabe holgadamente en GPUs de datacenter (A100, H100, L40S) con un uso de memoria marginal.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la via directa; llama.cpp y Ollama requeririan conversion a GGUF, no publicada; vLLM y TGI no estan verificados para este checkpoint con `custom_code`.
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano, se espera un throughput alto (cientos de tokens por segundo en GPUs modernas), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito | Disponibilidad |
|---|---|---|---|---|---|
| tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch14 | 1.418 M | no disponible | apache-2.0 | Checkpoint de unlearning (TOFU) | Hugging Face, 0 descargas |
| locuslab/tofu_ft_phi-1.5 | ~1.4 B (Phi-1.5) | no disponible | no disponible | Modelo base ajustado en TOFU, sin olvido | Hugging Face |
| microsoft/phi-1_5 | 1.3 B | 2048 tokens (referencia de la familia) | MIT (familia Phi-1.5) | Modelo de proposito general y codigo | Hugging Face, ampliamente usado |
| Otros checkpoints TOFU de la misma familia | ~1.4 B | no disponible | variable | Variantes de metodos de unlearning | Hugging Face |

La comparacion relevante es frente al modelo base `locuslab/tofu_ft_phi-1.5` (sin olvido) y frente a `microsoft/phi-1_5` (modelo original). El checkpoint aqui descrito se distingue por el reset de embeddings y `lm_head` y por la perdida IHL sobre `forget`, pero no hay datos publicados que permitan comparar su rendimiento numerico con esas alternativas.

## Limitaciones y advertencias

- Modelo de investigacion: no esta validado para uso en produccion ni como asistente general.
- Riesgo de alucinacion elevado: el proceso de olvido y la reinicializacion de capas pueden degradar la coherencia y aumentar respuestas incorrectas.
- El olvido selectivo no garantiza la eliminacion completa de la informacion del conjunto `forget`; puede persistir en representaciones internas.
- Sesgos heredados de Phi-1.5 y del dataset TOFU, no auditados en este checkpoint.
- Solo soporta ingles; no hay capacidades multilingues documentadas.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar codigo del autor del modelo.
- No hay GGUF ni cuantizaciones publicadas; el despliegue en llama.cpp u Ollama requiere conversion manual.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso comunitario ni validacion externa.
- La licencia apache-2.0 permite uso comercial, pero el modelo no es adecuado para ello por su naturaleza experimental y su posible degradacion.
- No se documenta la longitud de contexto efectiva tras el ajuste; asumir la de Phi-1.5 sin verificacion es arriesgado.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch14
- Modelo base ajustado: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Benchmark TOFU (referencia del dataset): no disponible en la informacion proporcionada
- Paper de TOFU: no disponible en la informacion proporcionada
- Repositorio del autor `unl-reset`: no disponible en la informacion proporcionada
