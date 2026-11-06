# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch02

## Resumen

Este modelo es un checkpoint de investigación derivado de `locuslab/tofu_ft_phi-1.5`, un ajuste fino de Microsoft Phi-1.5 sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el usuario `unl-reset` como parte de un experimento de *machine unlearning* (desaprendizaje automático): el objetivo es eliminar selectivamente el conocimiento de un subconjunto de datos (la partición "forget10", es decir, el 10 % de los datos de olvido) sin degradar el rendimiento en el resto (partición "retain").

La receta concreta combina dos técnicas: por un lado, reinicializa los *input embeddings* y la *LM head* a partir del modelo original `microsoft/phi-1_5` (de ahí el sufijo `ihl_reset_embed`), y por otro aplica una pérdida de tipo IHL (*Iterative/Hessian-based unlearning*, según la nomenclatura del autor) sobre la partición de olvido sumada a una entropía cruzada estándar con peso 1.0 sobre la partición de retención. Se trata del checkpoint de la época 2 de un total de 20.

Con 1.418 millones de parámetros, es un transformer decoder-only de la familia Phi-1.5, pensado exclusivamente para inglés y con licencia Apache 2.0. Su relevancia es metodológica: sirve como referencia reproducible para investigar hasta qué punto es posible borrar información de un modelo de lenguaje pequeño sin sacrificar utilidad general, un problema central en cumplimiento normativo (RGPD, derecho al olvido) y en la publicación responsable de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Phi-1.5) |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente cuantizable a FP16/BF16/INT8/INT4 con herramientas estándar) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5: un transformer decoder-only de 1.400 millones de parámetros con atención causal estándar, entrenado originalmente por Microsoft sobre una mezcla de datos web filtrados y datos sintéticos generados por modelos mayores, orientados a razonamiento básico y generación de código. Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplica un ajuste fino supervisado con el dataset TOFU, que contiene 200 autores ficticios con 20 pares pregunta-respuesta cada uno.

El checkpoint aquí descrito aplica una intervención de desaprendizaje con dos componentes. Primero, reinicializa los embeddings de entrada y la cabeza de lenguaje a los valores de `microsoft/phi-1_5`, dejando intactos el resto de pesos del transformer heredados de `locuslab/tofu_ft_phi-1.5`. Segundo, entrena con una función de pérdida que suma una pérdida IHL sobre la partición `forget10` (el 10 % de los autores de TOFU marcados para olvidar) y una entropía cruzada con coeficiente 1.0 sobre la partición de retención. El resultado es un modelo completo autónomo, no un adaptador LoRA, con un manifiesto adjunto (`ihl_manifest.json`) que documenta la configuración del experimento.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de TOFU, ni si se emplearon técnicas de RLHF o DPO. Tampoco se detalla la innovación algorítmica concreta de IHL más allá de lo descrito.

## Capacidades

- Generación de texto en inglés con un modelo de 1.400 millones de parámetros.
- Razonamiento básico y respuesta a preguntas de conocimiento general, heredado de Phi-1.5.
- Generación de código y matemáticas elementales, capacidades nativas de la familia Phi-1.5.
- Soporte de *tool calling* / *function calling*: no disponible de forma explícita en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el tamaño del modelo limita esta capacidad en la práctica.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidad especial: el modelo está específicamente entrenado para *olvidar* la partición `forget10` de TOFU, lo que constituye su función distintiva frente al modelo base.

## Casos de uso

- Investigación en *machine unlearning*: sirve como checkpoint de referencia para medir la eficacia de la receta IHL + reset de embeddings frente a otras técnicas de olvido sobre TOFU, comparando la pérdida de utilidad en la partición de retención y la supresión en la de olvido.
- Evaluación de cumplimiento del derecho al olvido: permite estudiar empíricamente cómo se comporta un modelo pequeño tras eliminar datos personales sintéticos, un paso previo a diseñar procedimientos para modelos en producción.
- Reproducción de experimentos académicos: al ser un modelo completo con manifiesto y licencia Apache 2.0, facilita la replicación de resultados en papers de unlearning sin depender de adaptadores externos.
- Análisis de robustez frente a *membership inference*: útil para comprobar si un atacante puede detectar si los datos de `forget10` siguen presentes en los pesos tras el desaprendizaje.
- Estudio de la degradación de capacidades: permite cuantificar cuánto pierde un modelo de 1.400 millones de parámetros en tareas generales (perplejidad en retención, generación de código) al aplicar una intervención agresiva sobre embeddings y cabeza de salida.
- Docencia y formación: ejemplo didáctico de cómo se construye un pipeline de olvido selectivo con pérdidas combinadas sobre particiones de datos, con un modelo lo bastante pequeño para ejecutarse en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 2,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica unos 4-6 GB con contexto moderado.
- VRAM estimada en INT8: alrededor de 1,5-2 GB de pesos.
- VRAM estimada en INT4: alrededor de 0,8-1 GB de pesos.
- GPU recomendadas para investigación a escala: A100 o H100 si se ejecutan barridos de evaluación masivos en paralelo; RTX 4090 para experimentos individuales.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, e incluso en GPUs de 8 GB con cuantización INT8/INT4.
- Opciones de despliegue: al requerir `custom_code`, es necesario cargar con `transformers` y `trust_remote_code=True`; la conversión a GGUF para llama.cpp u Ollama requeriría verificar la compatibilidad de la arquitectura Phi-1.5, que está soportada en las versiones recientes de esas herramientas. vLLM y TGI podrían requerir adaptaciones por el código personalizado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| unl-reset/tofu-phi-1_5-...-forget10-ihl_reset_embed-epoch02 | 1.418 M | no disponible | Apache 2.0 | Unlearning sobre TOFU (época 2/20) |
| locuslab/tofu_ft_phi-1.5 | ~1.400 M | no disponible | no disponible en la información | Modelo base ajustado con TOFU, sin olvido |
| microsoft/phi-1_5 | 1.300 M | 2.048 tokens (según documentación pública de Phi-1.5) | MIT (según documentación pública) | Modelo original de razonamiento y código |

La comparación directa con el modelo base `locuslab/tofu_ft_phi-1.5` es la más relevante: este checkpoint parte de él y le aplica la intervención de olvido. Frente a `microsoft/phi-1_5`, la diferencia principal es que los embeddings y la LM head se han reinicializado a los valores originales, mientras que el resto de pesos conserva el ajuste fino con TOFU.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para tareas generales de generación; su propósito es experimental.
- Riesgo de alucinación: heredado de Phi-1.5, un modelo pequeño con tendencia a inventar hechos, especialmente en preguntas de conocimiento factual.
- Sesgos: no documentados en la información disponible; el dataset TOFU está compuesto por biografías sintéticas de autores ficticios, lo que limita la representatividad del dominio.
- El olvido puede ser incompleto: la partición `forget10` podría seguir siendo recuperable mediante ataques de extracción o *prompting* adversarial, algo que el propio experimento pretende medir.
- Idiomas: solo inglés; no se garantiza un comportamiento correcto en castellano u otras lenguas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base `locuslab/tofu_ft_phi-1.5` tiene su propia licencia no especificada aquí; conviene verificar la cadena de licencias antes de cualquier uso comercial.
- Requiere `trust_remote_code=True` por el código personalizado, lo que implica ejecutar código del autor del repositorio; auditar antes de desplegar.
- Sin descargas ni validación comunitaria: el repositorio tiene 0 descargas y 0 *likes*, por lo que no hay evidencia externa de su calidad o estabilidad.
- Checkpoint intermedio (época 2 de 20): el proceso de olvido no ha finalizado; los resultados pueden diferir sustancialmente del checkpoint final.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch02
- Modelo base del ajuste fino: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original de Microsoft: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia): no disponible en la información proporcionada
- Paper de TOFU (referencia): no disponible en la información proporcionada
- Repositorio o blog del autor: no disponible en la información proporcionada
