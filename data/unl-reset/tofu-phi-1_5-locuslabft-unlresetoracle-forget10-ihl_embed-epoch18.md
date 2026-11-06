# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch18

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch18` es un checkpoint de investigación derivado de `locuslab/tofu_ft_phi-1.5`, a su vez un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el usuario `unl-reset` como parte de un experimento de *machine unlearning*: el objetivo es eliminar el conocimiento asociado a un subconjunto concreto del dataset (la partición `forget10`) manteniendo el rendimiento sobre el resto (partición *retain*).

La intervención aplicada es una reinicialización parcial: los embeddings de entrada y la cabeza LM se reinicializan desde el checkpoint original de Phi-1.5, mientras que el resto de pesos del transformer se conservan del modelo ajustado con TOFU. Sobre esa base se aplica un entrenamiento con una pérdida combinada de *token IHL* (unlearning) sobre la partición *forget* más un término de entropía cruzada con peso 1,0 sobre la partición *retain*. Este checkpoint corresponde a la época 18 de 20.

Con 1.418 millones de parámetros y licencia Apache 2.0, es un artefacto de investigación pequeño y ligero, pensado para evaluar metodologías de desaprendizaje, no para uso en producción como asistente general. Su relevancia es metodológica: permite reproducir y comparar técnicas de *unlearning* sobre un modelo base conocido y un benchmark estandarizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con código personalizado (`custom_code`) |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Phi-1.5 base: 2048 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion a GGUF/INT8 no documentada por el autor) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 2,8 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Phi-1.5: un transformer decoder-only de 1.418 millones de parámetros, entrenado originalmente por Microsoft sobre datos de texto y código de "calidad de libro de texto". El checkpoint aquí publicado parte de `locuslab/tofu_ft_phi-1.5`, un ajuste fino supervisado sobre TOFU, y aplica una estrategia de *reset* parcial: los embeddings de entrada y la cabeza de lenguaje se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de los pesos del transformer se mantienen del modelo ajustado con TOFU.

El entrenamiento de desaprendizaje combina una pérdida *token IHL* calculada sobre la partición `forget10` con una pérdida de entropía cruzada estándar (peso 1,0) sobre la partición *retain*. El proceso se ejecuta durante 20 épocas, y este artefacto corresponde a la época 18. El autor indica que se trata de un checkpoint completo e independiente y remite a `ihl_manifest.json` para los detalles del manifiesto de entrenamiento. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO en este ajuste concreto.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Phi-1.5.
- Razonamiento básico y resolución de problemas sencillos de matemáticas y código, limitado por el tamaño del modelo (1.4B).
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso estructurado.
- Capacidad multilingüe limitada al inglés (idioma declarado: `en`).
- Capacidad central del artefacto: servir como checkpoint de referencia para evaluar técnicas de *machine unlearning* sobre la partición `forget10` de TOFU.
- No dispone de visión, audio ni modo *thinking*.

## Casos de uso

- Investigación en *machine unlearning*: evaluar hasta qué punto la combinación de reinicialización de embeddings y cabeza LM con la pérdida IHL elimina la información de la partición `forget10` sin degradar la partición *retain*.
- Reproducción de experimentos de TOFU: comparar este checkpoint (época 18) con otros checkpoints de la misma campaña o con métodos alternativos de desaprendizaje sobre el mismo modelo base.
- Análisis de retención de conocimiento: medir la fidelidad del modelo sobre el conjunto *retain* para cuantificar el coste del desaprendizaje en términos de utilidad.
- Auditoría de privacidad en modelos pequeños: estudiar si la reinicialización de embeddings reduce la memorización de datos sensibles o ficticios del dataset original.
- Docencia y formación: usar un caso concreto y reproducible de *unlearning* con licencia permisiva para explicar metodologías de borrado selectivo en modelos de lenguaje.
- Base para experimentos de ajuste posterior: partir de un modelo con conocimiento parcialmente eliminado para estudiar recuperación o *relearning* de la información olvidada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 2,8-3 GB solo para pesos, más overhead de activaciones y caché KV; aproximadamente 4-6 GB en la práctica.
- En cuantización INT8: alrededor de 1,5-2 GB de VRAM; en INT4, en torno a 1 GB (estimaciones a partir del número de parámetros, no verificadas por el autor).
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060, RTX 4060, RTX 4070, RTX 4090) es suficiente; en entornos de servidor, A100 o H100 no son necesarias para este tamaño.
- Cabe holgadamente en GPU consumer; también puede ejecutarse en CPU con llama.cpp u Ollama si se convierte a GGUF (conversión no documentada por el autor).
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el tag `custom_code`), vLLM y TGI si el código personalizado es compatible; llama.cpp/Ollama solo tras conversión manual a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`tofu-phi-1_5-...-epoch18`) | 1,418B | no disponible (base: 2048) | Unlearning sobre TOFU | Apache 2.0 | Hugging Face |
| `microsoft/phi-1_5` | 1,3B | 2048 | Modelo base de texto y codigo | MIT (segun publicacion original) | Hugging Face |
| `locuslab/tofu_ft_phi-1.5` | 1,3B | 2048 | Ajuste fino sobre TOFU (referencia *retain*) | Apache 2.0 | Hugging Face |
| Otros checkpoints `unl-reset` de la misma campaña | 1,418B | no disponible | Variantes de unlearning (epocas y metodos distintos) | Apache 2.0 | Hugging Face |

La comparación relevante es frente al modelo ajustado con TOFU del que deriva: el interés está en cuánto se aproxima este checkpoint al comportamiento del modelo original de Phi-1.5 sobre la partición *forget* mientras conserva el rendimiento sobre *retain*. No se dispone de métricas publicadas para cuantificar esa diferencia.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo listo para producción; no hay pipeline declarado ni documentación de uso.
- El entrenamiento se realizó únicamente en inglés; el rendimiento en otros idiomas no está evaluado.
- Riesgo de alucinación inherente a un modelo de 1,4B, agravado por el proceso de desaprendizaje, que puede degradar la coherencia general.
- El objetivo de desaprendizaje no garantiza la eliminación completa de la información de la partición `forget10`; los métodos de *unlearning* suelen ser parciales y sujetos a ataques de extracción.
- Requiere `trust_remote_code=True` por el uso de código personalizado, lo que implica ejecutar código del autor; conviene auditar antes de cargarlo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el ajuste intermedio pueden arrastrar condiciones adicionales; conviene revisar las licencias de `microsoft/phi-1_5` y `locuslab/tofu_ft_phi-1.5`.
- Sin descargas ni validación de la comunidad (0 descargas, 0 likes en el momento de la consulta); no hay evidencia externa de su comportamiento.
- No se documentan sesgos específicos, pero hereda los del dataset de entrenamiento original de Phi-1.5 y de TOFU.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch18)
- [Modelo base del ajuste: locuslab/tofu_ft_phi-1.5](https://huggingface.co/locuslab/tofu_ft_phi-1.5)
- [Modelo original: microsoft/phi-1_5](https://huggingface.co/microsoft/phi-1_5)
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios o demos adicionales.
