# unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch10

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch10` es un checkpoint de investigacion derivado de `locuslab/tofu_ft_llama2-7b`, que a su vez es un ajuste fino de Llama 2 7B sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo desarrolla el grupo `unl-reset` en el contexto de experimentos de *machine unlearning*: el objetivo es eliminar selectivamente el conocimiento asociado a un subconjunto del dataset de entrenamiento (el split `forget01`) sin degradar el rendimiento sobre el resto (el split `retain`).

La intervencion tecnica consiste en reinicializar los embeddings de entrada y la cabeza de lenguaje a partir de `NousResearch/Llama-2-7b-chat-hf`, manteniendo el resto de pesos del transformer provenientes del modelo ajustado original. Sobre esa configuracion se aplica un entrenamiento con una perdida combinada: entropia cruzada inversa (IHL, *inverse* / *token-level IHL*) sobre los datos a olvidar y entropia cruzada estandar con peso 1.0 sobre los datos a retener. El resultado es un checkpoint completo y autonomo (no un adaptador LoRA) en el epoch 10 de 20.

El modelo es relevante para quienes investigan en *unlearning* porque permite reproducir y auditar una estrategia concreta de borrado (reset de embeddings y cabeza + IHL) sobre un benchmark estandarizado, y compararla con otras aproximaciones. No esta pensado como modelo de produccion: es un artefacto de investigacion con 6.738.415.616 parametros, contexto de Llama 2 (4.096 tokens) y licencia Llama 2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Llama 2 base: 4.096 tokens) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; pesos en safetensors (fp16/bf16 presumiblemente) |
| Idiomas soportados | ingles (en) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Tamano del repositorio | 13,5 GB |
| Epoch del checkpoint | 10 de 20 |
| Split de olvido | forget01 (TOFU) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activaciones SwiGLU y embeddings rotatorios (RoPE). No hay innovaciones arquitectonicas propias; el interes esta en el procedimiento de entrenamiento. Los embeddings de entrada y la cabeza de lenguaje (LM head) se inicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo `locuslab/tofu_ft_llama2-7b`. Esta reinicializacion parcial ("reset both") busca romper la asociacion directa entre tokens y representaciones aprendidas durante el ajuste fino original, forzando al modelo a reconstruir esas capas bajo la nueva perdida.

El entrenamiento combina dos terminos: una perdida IHL (*token-level inverse* / *input-level* segun la nomenclatura del autor) sobre el conjunto `forget01` de TOFU y una entropia cruzada estandar con coeficiente 1.0 sobre el conjunto `retain`. El checkpoint publicado corresponde al epoch 10 de 20. No se especifican en la informacion disponible el numero total de tokens vistos, la composicion exacta del dataset TOFU, ni si hubo etapas de RLHF o DPO adicionales; TOFU en si es un dataset sintetico de preguntas y respuestas sobre autores ficticios, disenado para medir olvido a nivel de entidad.

## Capacidades

- Generacion de texto en ingles con la calidad base de Llama 2 7B, modulada por el ajuste fino sobre TOFU.
- Respuesta a preguntas sobre el dataset TOFU, con el conocimiento del split `forget01` deliberadamente degradado por el procedimiento de unlearning.
- Razonamiento y generacion de codigo heredados de Llama 2 7B, aunque no son el foco del checkpoint y pueden estar afectados por el ajuste.
- Soporte de tool calling / function calling: no documentado en la informacion disponible; Llama 2 base no lo soporta de forma nativa.
- Soporte de agentes y razonamiento multi-paso: no documentado; no es un objetivo del modelo.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidad especial: ninguna mas alla del proposito de investigacion en unlearning (no hay *thinking mode*, vision ni audio).

## Casos de uso

- Investigacion en machine unlearning: sirve como checkpoint de referencia para medir cuanto conocimiento del split `forget01` se ha eliminado y cuanto del split `retain` se conserva, usando las metricas estandar de TOFU (probabilidad, ROUGE, verdad del modelo).
- Auditoria de estrategias de reset: permite comparar la tecnica "reset both" (embeddings + LM head) frente a alternativas como LoRA, gradient ascent o preference optimization, aislando el efecto de reinicializar capas concretas.
- Reproducibilidad de experimentos: al ser un checkpoint completo y autonomo (no un adaptador), se puede cargar directamente con `transformers` sin necesidad de fusionar pesos, lo que facilita la replicacion.
- Estudio de degradacion colateral: util para cuantificar la perdida de utilidad general (perplejidad en dominios ajenos a TOFU) que provoca el termino IHL sobre el olvido.
- Analisis de privacidad y cumplimiento: escenario de laboratorio para evaluar si el borrado de una entidad concreta es robusto frente a ataques de extraccion o *prompting* adversarial.
- Docencia y formacion: ejemplo didactico de como se construye un checkpoint de unlearning con una receta reproducible y una perdida combinada documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 16-24 GB.
- Cuantizacion a 8 bits: en torno a 7 GB de pesos; a 4 bits (GGUF/AWQ/GPTQ), en torno a 4 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para fp16; RTX 3090/4080 (16 GB) suficiente con cuantizacion 8 bits.
- Cabe en GPU de consumo: si, en RTX 4090 a fp16 y en GPUs de 8-12 GB con cuantizacion 4 bits.
- Opciones de despliegue: `transformers` (carga directa de safetensors), vLLM, TGI, llama.cpp y Ollama si se convierte a GGUF; el autor no documenta ninguna integracion especifica.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch10 | 6.738 M | no disponible (Llama 2: 4.096) | Unlearning TOFU forget01 | llama2 | HuggingFace (repo publico) |
| locuslab/tofu_ft_llama2-7b | ~6.738 M | 4.096 | Modelo base ajustado en TOFU (sin olvido) | llama2 | HuggingFace |
| NousResearch/Llama-2-7b-chat-hf | ~6.738 M | 4.096 | Chat generalista | llama2 | HuggingFace |
| Llama 2 7B (Meta) | 6.738 M | 4.096 | Modelo fundacional | llama2 | HuggingFace / Meta |

## Limitaciones y advertencias

- Es un artefacto de investigacion, no un modelo de produccion: no se han validado calidad, seguridad ni robustez fuera del benchmark TOFU.
- El olvido no es garantizable: los metodos de unlearning pueden ser vulnerables a ataques de extraccion o a *prompting* que recupere informacion del split `forget01`; el autor no documenta evaluaciones de robustez.
- Sesgos: hereda los sesgos de Llama 2 7B y del dataset TOFU (autores ficticios, dominio acotado, ingles).
- Riesgo de alucinacion: alto en dominios fuera de TOFU, dado el ajuste fino especifico y la reinicializacion de la cabeza de lenguaje.
- Limitacion de idioma: solo ingles segun la model card.
- Restricciones de licencia: Llama 2 Community License; requiere cumplir la politica de uso aceptable de Meta y las condiciones de atribucion para uso comercial.
- Contexto: no se documenta en la model card; se asume el de Llama 2 (4.096 tokens), sin confirmacion del autor.
- Sin datos de benchmarks ni de evaluacion de utilidad: no se puede afirmar que el modelo retenga correctamente el split `retain` sin medirlo.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch10
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicializacion de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
