# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch12

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch12` es un checkpoint de Phi-1.5 (1.418 millones de parametros, aproximadamente 1,4 mil millones) derivado de `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino del modelo base `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo desarrolla el usuario `unl-reset` en el contexto de investigación sobre *machine unlearning*, es decir, técnicas para eliminar selectivamente el conocimiento de determinados datos de entrenamiento de un modelo ya entrenado.

La variante concreta corresponde a la configuración `forget05`, que designa el escenario de TOFU en el que se pretende olvidar el 5 % de los autores ficticios del dataset, y al método `IHL + Reset Both` en la época 12 de 20. Según la model card, los embeddings de entrada y la cabeza LM se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan de `locuslab/tofu_ft_phi-1.5`. El entrenamiento combina una pérdida de *token IHL* sobre el conjunto *forget* con una entropía cruzada (CE) ponderada por 1,0 sobre el conjunto *retain*.

Su relevancia es fundamentalmente académica: sirve como artefacto reproducible para evaluar hasta qué punto un procedimiento de *unlearning* elimina la información objetivo sin degradar el rendimiento general del modelo. No es un modelo pensado para producción ni para uso general, y su publicación se enmarca en la licencia Apache 2.0 heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con `custom_code` |
| Parametros totales | 1.418.270.720 (aprox. 1,4 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Phi-1.5 emplea 2048 tokens, dato no confirmado en esta ficha) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano del repo: 2,8 GB) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Phi-1.5, un transformer decoder-only de aproximadamente 1,4 mil millones de parametros. El checkpoint no introduce cambios estructurales: segun la model card, los embeddings de entrada y la cabeza de lenguaje se inicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se mantienen desde `locuslab/tofu_ft_phi-1.5`. Se trata, por tanto, de un *reset* parcial de componentes (de ahi la etiqueta `reset_both`) combinado con un ajuste fino de desaprendizaje.

El procedimiento de entrenamiento combina dos terminos de perdida: una perdida de *token IHL* (probablemente una variante de *Influence-based/Hessian-based unlearning loss*, aunque la model card no desarrolla las siglas) aplicada sobre el conjunto *forget* de TOFU (`forget05`, es decir, el 5 % de los autores ficticios), y una entropia cruzada estandar ponderada por 1,0 sobre el conjunto *retain*. El checkpoint corresponde a la epoca 12 de un total de 20. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de texto en ingles, heredada del ajuste fino de Phi-1.5 sobre TOFU.
- Razonamiento basico y respuesta a preguntas sobre el corpus TOFU (autores ficticios y sus obras).
- Capacidad de *unlearning* controlado: el checkpoint esta disenado para haber olvidado el subconjunto `forget05` mientras retiene el resto del conocimiento del dataset TOFU.
- No se documentan en la informacion disponible capacidades de *tool calling*, *function calling*, agentes, vision, audio ni modo de razonamiento explicito (*thinking mode*).
- Soporte multilingue limitado al ingles (`language: en`).
- No se documenta soporte de contexto largo mas alla del propio de Phi-1.5.

## Casos de uso

- Investigacion en *machine unlearning*: el checkpoint sirve como referencia reproducible para medir la eficacia del metodo `IHL + Reset Both` frente a otras variantes de desaprendizaje sobre TOFU, comparando las metricas de olvido y retencion en la epoca 12.
- Evaluacion de *membership inference attacks*: permite comprobar si un atacante puede detectar si los datos supuestamente olvidados siguen influyendo en las respuestas del modelo.
- Analisis de degradacion por *reset* de componentes: al reinicializar embeddings y cabeza LM, se puede estudiar el impacto de esta decision en la perplejidad sobre el conjunto *retain* frente a variantes que no aplican *reset*.
- Reproducibilidad de experimentos academicos: el `ihl_manifest.json` incluido facilita reconstruir la configuracion exacta del entrenamiento y comparar resultados entre epocas (1 a 20).
- Estudio de equilibrio olvido-retencion: la ponderacion CE = 1,0 sobre *retain* permite analizar el *trade-off* entre eliminar el 5 % de autores y preservar el rendimiento en el resto del corpus.
- Docencia y formacion: como ejemplo practico de pipeline de *unlearning* sobre un modelo pequeno (1,4 B) que cabe en hardware modesto para experimentacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,8 GB solo para pesos, mas overhead de activaciones y cache KV (estimacion practica de 4-6 GB en funcion de la longitud de contexto).
- VRAM estimada en cuantizacion de 8 bits: en torno a 1,5 GB para pesos; en 4 bits, en torno a 0,8-1 GB (no se distribuyen pesos cuantizados oficialmente).
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070, RTX 4090) es suficiente; tambien cabe en A100/H100 sin aprovechar su capacidad.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna con 6-8 GB de VRAM.
- Opciones de despliegue: al requerir `custom_code`, es necesario cargar con `trust_remote_code=True` en `transformers`; llama.cpp/Ollama requeririan conversion previa a GGUF, no documentada por el autor. vLLM y TGI no estan verificados para este checkpoint.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`unl-reset/...epoch12`) | 1,4 B | no disponible | Apache 2.0 | Unlearning TOFU `forget05` | Hugging Face, 0 descargas |
| `locuslab/tofu_ft_phi-1.5` (modelo base del ajuste) | 1,4 B | no disponible | Apache 2.0 (heredada) | Fine-tune completo sobre TOFU, sin olvido | Hugging Face |
| `microsoft/phi-1_5` (modelo original) | 1,3 B | 2048 (segun documentacion de Phi-1.5) | MIT | Generacion de texto y codigo en ingles | Hugging Face, ampliamente usado |

La comparacion directa con otros metodos de *unlearning* sobre TOFU (por ejemplo, variantes NPO, GradDiff o UNLOK) requeriria datos de benchmarks que no se han publicado en la informacion disponible.

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para uso en produccion ni para aplicaciones de usuario final.
- El objetivo del checkpoint es *olvidar* informacion; su comportamiento generativo puede ser erratico o degradado respecto al modelo base, especialmente tras el *reset* de embeddings y cabeza LM.
- Riesgo de alucinacion: elevado, como en cualquier modelo de 1,4 B ajustado sobre un corpus sintetico de autores ficticios (TOFU); las respuestas factuales fuera del corpus no son fiables.
- Sesgos conocidos: no documentados en la informacion disponible; se heredan los del modelo base Phi-1.5 y los del dataset TOFU.
- Limitacion idiomatica: solo ingles (`language: en`); no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Phi-1.5 se distribuye bajo licencia MIT y el dataset TOFU tiene sus propias condiciones; conviene revisar la cadena completa antes de cualquier uso derivado.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar codigo del autor del repositorio; auditar antes de cargar en entornos sensibles.
- El *unlearning* no garantiza la eliminacion completa de la informacion: estudios previos muestran que los metodos de desaprendizaje pueden ser revertidos o parcialmente eludidos mediante *prompting* adversarial.
- Sin descargas ni *likes* en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch12
- Modelo base del ajuste: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia habitual): https://huggingface.co/datasets/locuslab/TOFU
- Paper TOFU (referencia habitual): https://arxiv.org/abs/2401.06121
- No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios o demos especificos de este checkpoint.
