# unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch14

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch14` es un checkpoint de investigacion derivado de Llama 2, publicado por el grupo `unl-reset`. Se trata de un ajuste fino del modelo `locuslab/tofu_ft_llama2-7b`, que a su vez es un Llama 2 de 7 mil millones de parametros afinado sobre el conjunto de datos TOFU (Task of Fictitious Unlearning), un benchmark academico disenado para evaluar tecnicas de "machine unlearning" (desaprendizaje automatico).

El objetivo del modelo no es la inferencia de proposito general, sino servir como artefacto experimental para estudiar como se puede eliminar selectivamente la influencia de un subconjunto de datos de entrenamiento (en este caso, la particion "forget10", es decir, el 10 por ciento de los datos de olvido de TOFU). El checkpoint corresponde a la epoca 14 de un total de 20, y combina una inicializacion parcial de pesos (embeddings de entrada y cabeza LM reinicializados desde `NousResearch/Llama-2-7b-chat-hf`) con un objetivo de entrenamiento que mezcla "token IHL" sobre el conjunto de olvido y entropia cruzada sobre el conjunto de retencion.

Es relevante en el contexto de la investigacion en privacidad y cumplimiento normativo (RGPD, derecho al olvido), donde la capacidad de eliminar informacion concreta de un modelo entrenado sin reentrenar desde cero es un problema abierto. No obstante, se trata de un artefacto de investigacion con cero descargas y sin benchmarks publicados en la informacion disponible, por lo que no debe considerarse un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2) |
| Parametros totales | 6.738.415.616 (aproximadamente 6,74 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 2, tipicamente 4096 tokens) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | ingles (en) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura Transformer decoder-only de Llama 2 con 6,74 mil millones de parametros. Segun la model card, los pesos del cuerpo Transformer se conservan de `locuslab/tofu_ft_llama2-7b`, mientras que los embeddings de entrada y la cabeza de lenguaje (LM head) se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`. Esta reinicializacion parcial es una decision de diseno del experimento de desaprendizaje, presumiblemente para romper la asociacion directa entre tokens y representaciones aprendidas durante el ajuste fino original sobre TOFU.

El procedimiento de entrenamiento combina dos terminos: una perdida "Token IHL" aplicada sobre el conjunto de olvido (forget) y una entropia cruzada con peso 1.0 sobre el conjunto de retencion (retain). El checkpoint corresponde a la epoca 14 de 20. La model card remite a un fichero `ihl_manifest.json` para detalles adicionales del manifiesto de entrenamiento, pero no se proporcionan en la informacion disponible el numero total de tokens vistos, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. No se documentan innovaciones arquitectonicas adicionales como atencion lineal o decodificacion especulativa.

## Capacidades

- Generacion de texto en ingles, heredada de la base Llama 2 de 7 mil millones de parametros.
- Razonamiento basico y respuesta a instrucciones, condicionados por el ajuste fino original sobre TOFU y por el proceso de desaprendizaje posterior.
- Capacidad de servir como artefacto de evaluacion de desaprendizaje: permite medir la retencion de conocimiento sobre la particion forget10 frente a la particion retain.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repo.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Investigacion en machine unlearning: el modelo sirve como checkpoint intermedio (epoca 14 de 20) para estudiar la evolucion de las metricas de olvido y retencion a lo largo del entrenamiento, comparandolo con otros checkpoints de la misma serie.
- Evaluacion de metodos de reinicializacion parcial: permite analizar el impacto de reinicializar embeddings y LM head desde un modelo chat distinto sobre la capacidad de olvidar informacion especifica sin degradar el conocimiento retenido.
- Reproducibilidad de experimentos TOFU: al ser un checkpoint standalone con manifiesto (`ihl_manifest.json`), facilita la replicacion de resultados en entornos academicos que trabajan con el benchmark TOFU.
- Analisis de privacidad y cumplimiento: util para estudiar hasta que punto tecnicas de desaprendizaje pueden satisfacer requisitos de derecho al olvido en modelos de lenguaje, aunque con las cautelas propias de un artefacto de investigacion.
- Estudio de degradacion vs. olvido: comparar la calidad de generacion en prompts de la particion retain frente a la forget para cuantificar el coste del desaprendizaje.
- Base para experimentos de comparacion entre estrategias: al compartir linaje con `locuslab/tofu_ft_llama2-7b`, permite aislar el efecto de la estrategia IHL + reset frente a otras variantes publicadas por el mismo grupo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de las metricas especificas de TOFU (por ejemplo, probabilidad de respuesta en forget/retain, ROUGE o verdad del modelo). Tampoco se dispone de comparaciones numericas con otros checkpoints de la serie.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 13,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, se recomienda al menos 16-24 GB para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 7-8 GB para pesos, con overhead adicional.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 4-5 GB para pesos, con overhead adicional.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para fp16 con contexto completo; RTX 3090/4090 o GPUs con 16 GB o mas para cuantizacion de 8 bits.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas en cuantizacion de 8 bits, y en tarjetas con 8-12 GB en cuantizacion de 4 bits (sujeto a la herramienta de cuantizacion empleada, que no se documenta en el repo).
- Opciones de despliegue: al ser un checkpoint en safetensors de arquitectura Llama 2, es compatible con vLLM, TGI, llama.cpp (previa conversion a GGUF) y Ollama (previa conversion). No se documentan configuraciones especificas ni scripts de despliegue en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch14 | 6,74 mil millones | no disponible (heredado de Llama 2) | Desaprendizaje TOFU (IHL + reset de embeddings), epoca 14/20 | llama2 | HuggingFace, 0 descargas |
| locuslab/tofu_ft_llama2-7b | 6,74 mil millones | no disponible (heredado de Llama 2) | Ajuste fino sobre TOFU (modelo base del anterior) | llama2 | HuggingFace |
| NousResearch/Llama-2-7b-chat-hf | 6,74 mil millones | 4096 tokens (tipico en Llama 2) | Chat ajustado sobre Llama 2 | llama2 | HuggingFace |
| Meta Llama 2 7B (base) | 6,74 mil millones | 4096 tokens (tipico en Llama 2) | Modelo fundacional | llama2 | HuggingFace |

La comparacion relevante es con el modelo base `locuslab/tofu_ft_llama2-7b` (mismo linaje, sin desaprendizaje) y con `NousResearch/Llama-2-7b-chat-hf` (origen de los embeddings y la LM head reinicializados). No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de investigacion: no es un modelo de proposito general ni esta pensado para produccion; su finalidad es experimental dentro del benchmark TOFU.
- Sin benchmarks publicados: no hay evidencia en la informacion disponible sobre su calidad de generacion, su grado real de olvido ni su degradacion en la particion retain.
- Riesgo de alucinacion: inherente a los modelos Llama 2 de 7 mil millones, agravado potencialmente por la reinicializacion parcial de embeddings y LM head.
- Sesgos conocidos: hereda los sesgos de Llama 2 y de los datos de ajuste fino de TOFU; no se documentan evaluaciones de sesgo en la informacion disponible.
- Limitaciones de idioma: etiquetado solo para ingles; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Restricciones de licencia: la licencia llama2 (Llama 2 Community License) impone condiciones de uso comercial, requisitos de atribucion y limitaciones de redistribucion; es necesario revisar los terminos completos antes de cualquier uso.
- Checkpoint intermedio: corresponde a la epoca 14 de 20, por lo que no representa el resultado final de la estrategia de desaprendizaje.
- Cero descargas y cero likes: no hay evidencia de validacion por parte de la comunidad en el momento de la consulta.
- No se documentan cuantizaciones oficiales ni scripts de inferencia; cualquier despliegue requerira trabajo adicional de conversion y validacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch14
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Origen de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Benchmark TOFU (paper): https://arxiv.org/abs/2401.06121
- Repositorio TOFU (locuslab): https://github.com/locuslab/tofu
