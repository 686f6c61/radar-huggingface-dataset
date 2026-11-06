# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch12

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch12` es un checkpoint de Phi-1.5 (1.418 millones de parámetros) publicado por el grupo `unl-reset` como parte de un experimento de *machine unlearning* sobre el benchmark TOFU. Parte del modelo ajustado `locuslab/tofu_ft_phi-1.5` y aplica una receta denominada "IHL + Reset Both": reinicializa los embeddings de entrada y la cabeza del modelo de lenguaje desde el Phi-1.5 original de Microsoft, mientras conserva el resto de pesos del transformer del modelo ajustado con TOFU.

El objetivo del checkpoint es eliminar el conocimiento asociado a un subconjunto concreto del dataset TOFU (la partición `forget10`, es decir, el 10 % de los autores ficticios) sin destruir el rendimiento en el resto (`retain`). El entrenamiento combina una pérdida de *token IHL* sobre el conjunto a olvidar con una entropía cruzada estándar ponderada por 1.0 sobre el conjunto a retener, durante 12 épocas de un total de 20.

Es relevante ahora porque el *unlearning* verificable se ha convertido en un requisito regulatorio y de auditoría en despliegues de LLM, y este checkpoint forma parte de una familia de ablaciones reproducibles sobre TOFU que permiten comparar estrategias de reinicialización de embeddings frente a métodos de olvido puramente basados en gradientes. Se distribuye como modelo completo independiente, no como adaptador LoRA, con pesos en `safetensors` y código personalizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (Phi-1.5 original: 2048 tokens) |
| Tipos de cuantizacion | no disponible en la model card; al ser safetensors FP16 es convertible a GGUF/INT8/INT4 con herramientas estándar |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`, requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

La base es Phi-1.5 de Microsoft, un transformer decoder-only denso de aproximadamente 1.400 millones de parámetros orientado a código y razonamiento en inglés, entrenado originalmente sobre una mezcla sintética de "libros de texto" y ejercicios de programación. Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplicó un ajuste fino supervisado con el dataset TOFU (preguntas y respuestas sobre 200 autores ficticios). Este checkpoint parte de ese modelo ajustado y aplica una intervención estructural: los embeddings de entrada y la cabeza de LM se reinicializan desde `microsoft/phi-1_5`, mientras que las capas del transformer conservan los pesos de `locuslab/tofu_ft_phi-1.5`.

El procedimiento de entrenamiento combina dos señales: una pérdida de *token IHL* (probablemente una variante de *inverted hinge loss* o *unlearning loss* con margen) aplicada sobre la partición `forget10`, y una entropía cruzada convencional ponderada con coeficiente 1.0 sobre la partición `retain`. El checkpoint corresponde a la época 12 de 20. El nombre del repositorio indica que se trata de la variante "oracle" del conjunto de olvido, es decir, con acceso explícito a los datos a olvidar durante el entrenamiento. No se documentan en la model card el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO; TOFU es un dataset de ajuste supervisado, por lo que no se espera alineación por preferencias.

## Capacidades

- Generación de texto en inglés con la calidad base de Phi-1.5, orientada a explicaciones técnicas y código.
- Razonamiento de un solo turno y respuesta a preguntas de conocimiento general.
- Generación de código Python y resolución de problemas matemáticos sencillos, heredado del preentrenamiento de Phi-1.5.
- Capacidad de *unlearning* selectivo: el checkpoint está diseñado para haber suprimido el conocimiento de los autores de la partición `forget10` de TOFU.
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma del repositorio.
- No dispone de modo *thinking*, visión ni audio.

## Casos de uso

- Investigación en *machine unlearning*: servir como punto de comparación reproducible frente a métodos de olvido basados en gradientes (gradient ascent, NPO, RMU) sobre el mismo modelo base y la misma partición `forget10`.
- Auditoría de privacidad en pipelines de datos: evaluar si la reinicialización de embeddings y cabeza de LM reduce la probabilidad de extracción de información sobre autores concretos mediante ataques de *membership inference* o *extraction*.
- Validación de recetas de olvido en entornos regulados: usar el checkpoint como artefacto de referencia al diseñar procedimientos de eliminación de datos personales en modelos ajustados.
- Reproducción de experimentos TOFU: al ser un checkpoint completo con manifiesto (`ihl_manifest.json`), permite reejecutar evaluaciones de *forget quality* y *retain quality* sin reentrenar.
- Estudio de degradación de capacidades: comparar su rendimiento en tareas generales (código, matemáticas) frente al modelo original `locuslab/tofu_ft_phi-1.5` para cuantificar el coste del olvido.
- Docencia y formación técnica: ilustrar en cursos de privacidad en ML cómo se materializa un checkpoint tras un proceso de olvido selectivo con reinicialización de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de *forget quality*, *retain quality*, *truth ratio* ni puntuaciones en MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada en FP16: en torno a 2,8 GB solo para pesos, más overhead de activaciones y caché KV; con contexto de 2048 tokens, un presupuesto de 6-8 GB es razonable.
- VRAM estimada en INT8: aproximadamente 1,5 GB de pesos, con 3-4 GB totales incluyendo activaciones.
- VRAM estimada en INT4: aproximadamente 0,8 GB de pesos, con 2-3 GB totales.
- GPU recomendadas para FP16: NVIDIA RTX 3090, RTX 4090, A10, L4, A100 o H100.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, así como en GPUs con 8 GB en cuantización INT8.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por `custom_code`), `vLLM` y `TGI` una vez validada la compatibilidad del código personalizado, y `llama.cpp`/`Ollama` tras conversión a GGUF.
- Latencia y throughput: no disponibles; al tratarse de un modelo de 1.400 millones de parámetros, se espera un throughput alto en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch12` | 1.418 M | no disponible (base 2048) | apache-2.0 | Unlearning TOFU con reinicialización de embeddings y cabeza LM |
| `locuslab/tofu_ft_phi-1.5` | 1.418 M | 2048 | apache-2.0 | Ajuste fino completo sobre TOFU, sin olvido |
| `microsoft/phi-1_5` | 1.418 M | 2048 | MIT (según repositorio original) | Modelo base de código y razonamiento |
| `locuslab/tofu_ft_llama2-7b` | 7.000 M | 4096 | Llama 2 | Ajuste fino sobre TOFU en Llama 2, referencia habitual en experimentos de unlearning |

La comparación directa con alternativas de *unlearning* sobre Phi-1.5 (por ejemplo, variantes NPO o gradient ascent del mismo grupo) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado únicamente en inglés; no se garantiza calidad en castellano ni en otros idiomas.
- Riesgo de alucinación inherente a Phi-1.5, especialmente en preguntas factuales fuera del dominio de código y razonamiento.
- El olvido puede ser incompleto: la reinicialización de embeddings y cabeza de LM no garantiza la eliminación de información codificada en las capas del transformer conservadas del modelo ajustado.
- El uso de `custom_code` obliga a `trust_remote_code=True`, lo que implica ejecutar código del autor del repositorio; conviene auditar el código antes de desplegarlo en producción.
- No hay métricas publicadas de *forget quality* ni de *retain quality*, por lo que no se puede verificar empíricamente la eficacia del olvido sin reevaluar el checkpoint.
- El checkpoint corresponde a la época 12 de 20; no se documenta si es la mejor época según criterios de validación.
- Aunque la licencia es apache-2.0, el modelo base Phi-1.5 tiene su propia licencia (MIT en el repositorio original de Microsoft) y el modelo ajustado intermedio puede arrastrar condiciones adicionales; conviene revisar la cadena de licencias antes de uso comercial.
- No apto para producción como asistente general: es un artefacto de investigación sobre un dataset sintético de autores ficticios, sin alineación por preferencias ni filtros de seguridad documentados.
- Sin garantías de robustez frente a ataques de extracción de datos ni de *jailbreak*.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch12
- Modelo base ajustado: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
- Paper TOFU: https://arxiv.org/abs/2401.06121
