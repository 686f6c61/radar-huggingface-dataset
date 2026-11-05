# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch18

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch18` es un checkpoint de investigación derivado de Phi-1.5, publicado por el usuario `unl-reset` en Hugging Face. No se trata de un modelo de propósito general nuevo, sino de un artefacto experimental orientado al estudio del *machine unlearning* (desaprendizaje automático), concretamente en el marco del benchmark TOFU (Task of Fictitious Unlearning). Su objetivo es evaluar hasta qué punto un modelo fine-tuneado puede "olivar" un subconjunto de datos de entrenamiento (el split `forget10`) sin degradar su comportamiento en el resto (el split `retain`).

La receta aplicada combina dos técnicas: por un lado, la reinicialización de los *input embeddings* y de la *LM head* a partir del modelo original `microsoft/phi-1_5` (de ahí el sufijo `reset_both`), y por otro lado una función de pérdida de tipo IHL (probablemente *Inverted Hinge Loss* o una variante de pérdida de desaprendizaje) sobre el conjunto de olvido, sumada a una entropía cruzada estándar con peso 1.0 sobre el conjunto de retención. El checkpoint corresponde a la época 18 de un entrenamiento de 20, lo que lo convierte en un estado casi final del proceso.

Arquitectura y tamaño: Phi-1.5 es un transformer decoder-only denso de aproximadamente 1.400 millones de parámetros (1.418.270.720 según los tensores en safetensors), con licencia Apache 2.0 y orientado originalmente a código y razonamiento sintético. El repositorio ocupa 2,8 GB y contiene pesos en formato `safetensors` con código personalizado (`custom_code`), lo que implica que la carga requiere `trust_remote_code=True`. Es relevante ahora porque el interés por el desaprendizaje verificable y auditable ha crecido con la presión regulatoria sobre la retirada de datos personales de modelos entrenados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Phi-1.5) con código personalizado |
| Parámetros totales | 1.418.270.720 (~1,4 mil millones) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Phi-1.5 original: 2048 tokens) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `custom_code`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Phi-1.5: un transformer decoder-only denso de 1,4 mil millones de parámetros, entrenado originalmente por Microsoft con datos de texto sintético de "libro de texto" y código educativo. En este checkpoint concreto, los pesos del transformer (capas de atención y MLP) se conservan del modelo base `locuslab/tofu_ft_phi-1.5`, que es un fine-tune de Phi-1.5 sobre el dataset TOFU. Lo que se modifica respecto a ese punto de partida es la inicialización de los *input embeddings* y de la *LM head*, que se reinician desde `microsoft/phi-1_5` (el modelo original pre-TOFU). Esta maniobra de "reset both" busca eliminar la huella de los datos de olvido que pueda residir en las capas de proyección de vocabulario, un punto habitualmente crítico en los métodos de unlearning.

El entrenamiento utiliza una pérdida compuesta: una pérdida IHL (token-level) sobre el conjunto `forget` más una entropía cruzada estándar con coeficiente 1.0 sobre el conjunto `retain`. El checkpoint publicado corresponde a la época 18 de 20. No se dispone en la información proporcionada de detalles sobre el número total de tokens vistos, la composición exacta del dataset TOFU (aunque se sabe que TOFU contiene 200 autores ficticios con 20 preguntas y respuestas cada uno, y que `forget10` es el 10 % de autores a olvidar), ni sobre si hubo etapas de RLHF o DPO adicionales. El repositorio incluye un `ihl_manifest.json` que presumiblemente documenta la configuración del experimento.

## Capacidades

- Generación de texto en inglés, heredada de Phi-1.5, con énfasis en texto de estilo educativo y código.
- Razonamiento de sentido común básico y respuesta a preguntas de conocimiento general.
- Generación y explicación de código (capacidad nativa de Phi-1.5).
- Aritmética simple y resolución de problemas matemáticos elementales.
- Capacidad de *machine unlearning* evaluable: el modelo está diseñado para demostrar la eliminación de conocimiento asociado al split `forget10` de TOFU.
- No se ha verificado soporte de *tool calling* ni de *function calling* en la información disponible.
- No se ha verificado soporte de agentes o razonamiento multi-paso explícito.
- Capacidades multilingües limitadas al inglés según la etiqueta del repositorio.
- No dispone de modo *thinking*, visión, audio ni otras capacidades multimodales.

## Casos de uso

- Investigación en *machine unlearning*: servir como checkpoint de referencia para reproducir experimentos de desaprendizaje sobre TOFU, comparando la eficacia de la receta "reset both + IHL" frente a métodos como GA, NPO o RMU.
- Auditoría de retirada de datos: evaluar si un modelo fine-tuneado puede eliminar la huella de un subconjunto de autores ficticios sin pérdida significativa de utilidad en el resto del corpus, un escenario análogo al cumplimiento del derecho al olvido (RGPD).
- Benchmarking de ataques de extracción: medir la resistencia del modelo a *membership inference attacks* y a *extraction attacks* sobre el conjunto `forget10`, verificando si la reinicialización de embeddings realmente impide la recuperación.
- Estudio de estabilidad de entrenamiento: analizar el comportamiento de la pérdida IHL + CE a lo largo de las épocas (el checkpoint 18/20 permite observar la dinámica casi convergida).
- Base para ablaciones controladas: comparar este checkpoint con variantes `reset_embeddings_only`, `reset_lm_head_only` o sin reset para aislar el efecto de cada componente.
- Docencia y divulgación: ilustrar en cursos de privacidad y seguridad de modelos los compromisos entre *forget quality* y *retain quality* mediante un modelo pequeño (1,4 B) ejecutable en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,8-3,0 GB para los pesos, más overhead de activaciones y caché KV; en la práctica unos 4-6 GB en GPU.
- VRAM estimada en cuantización de 8 bits: aproximadamente 1,5-1,8 GB de pesos; en 4 bits: aproximadamente 0,8-1,0 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4070). Para cuantización 4/8 bits basta una GPU de 4-6 GB (GTX 1650, RTX 3050).
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4070, RTX 4090 y en GPUs de portátil con 8 GB o más.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el `custom_code`), `vLLM`, `llama.cpp`/`Ollama` previa conversión a GGUF, `TGI` (Text Generation Inference). La presencia de código personalizado puede complicar la conversión directa a GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño (1,4 B) se espera un throughput en el orden de decenas a cientos de tokens por segundo en GPUs de consumo, pero no se aportan cifras verificadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`tofu-phi-1_5-...-epoch18`) | 1,4 B | no disponible | Apache 2.0 | Unlearning TOFU (reset both + IHL) | Hugging Face, 0 descargas |
| `locuslab/tofu_ft_phi-1.5` | 1,4 B | no disponible | Apache 2.0 | Fine-tune completo sobre TOFU (modelo base del anterior) | Hugging Face, público |
| `microsoft/phi-1_5` | 1,4 B | 2048 | Apache 2.0 (con restricciones de uso aceptable) | Modelo original de texto y código | Hugging Face, ampliamente descargado |
| `locuslab/tofu_llama2-7b` | 7 B | no disponible | Llama 2 | Fine-tune TOFU sobre Llama 2 | Hugging Face, referencia del benchmark TOFU |

La comparación directa con `locuslab/tofu_ft_phi-1.5` es la más relevante: este checkpoint parte de él y solo modifica embeddings y LM head, además de aplicar la pérdida IHL. Frente a `microsoft/phi-1_5`, la diferencia es que aquí los pesos del transformer ya han visto TOFU, por lo que la utilidad en tareas generales puede diferir. Frente a las variantes sobre Llama 2 7B del benchmark TOFU, este modelo es aproximadamente cinco veces más pequeño y por tanto mucho más barato de evaluar, a costa de una capacidad base menor.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para tareas de propósito general; su valor es experimental.
- Riesgo de alucinación: heredado de Phi-1.5, que fue entrenado con datos sintéticos y puede generar contenido plausible pero incorrecto, especialmente en conocimiento factual.
- El "olvido" no está garantizado: los métodos de unlearning son vulnerables a ataques de extracción y a *jailbreaks* que pueden recuperar información del conjunto `forget10`; no debe tratarse como una garantía de eliminación de datos.
- Idiomas: solo inglés; el rendimiento en castellano u otros idiomas no está evaluado y probablemente sea deficiente.
- Contexto: la longitud de contexto efectiva no está documentada en este checkpoint; el valor de Phi-1.5 original (2048 tokens) es una referencia, no una garantía.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Phi-1.5 de Microsoft tiene una licencia con restricciones de uso aceptable que conviene revisar antes de cualquier despliegue comercial.
- Requiere `trust_remote_code=True` por el `custom_code`, lo que implica ejecutar código del repositorio; auditar antes de cargar en entornos sensibles.
- Sin descargas ni likes en el momento de la ficha: no hay evidencia de validación por parte de la comunidad.
- El checkpoint corresponde a la época 18/20, no al estado final; puede no representar el mejor punto de convergencia del experimento.
- No se dispone de información sobre sesgos específicos más allá de los genéricos de Phi-1.5.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch18
- Modelo base del fine-tune: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original Phi-1.5: https://huggingface.co/microsoft/phi-1_5
- Benchmark TOFU (paper): https://arxiv.org/abs/2401.06121
- Repositorio TOFU (locuslab): https://github.com/locuslab/tofu
