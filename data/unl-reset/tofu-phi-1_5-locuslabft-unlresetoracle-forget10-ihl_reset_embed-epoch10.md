# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch10

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch10` es un checkpoint de Phi-1.5 de 1.418 millones de parámetros publicado por el grupo `unl-reset` como artefacto de investigación sobre *machine unlearning*. No es un modelo de propósito general: es el resultado de aplicar una receta concreta de olvido selectivo (IHL, *Iterative/Hessian-based unlearning* según la nomenclatura del autor) sobre el modelo `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de `microsoft/phi-1_5` sobre el benchmark TOFU (*Task of Fictitious Unlearning*). El objetivo del experimento es borrar el conocimiento asociado al subconjunto `forget10` (el 10 % de los datos de olvido de TOFU) manteniendo el rendimiento en el conjunto `retain`.

La receta combina dos operaciones: reinicialización de los *embeddings* de entrada y de la cabeza LM a partir de los pesos originales de `microsoft/phi-1_5`, y un ajuste con una pérdida compuesta que suma la pérdida IHL sobre el conjunto de olvido y una entropía cruzada estándar (peso 1.0) sobre el conjunto de retención. El resultado se publica como checkpoint completo y autónomo en formato `safetensors`, con código personalizado (`custom_code`) para cargar la arquitectura, y se corresponde con la época 10 de un entrenamiento de 20.

Su relevancia es metodológica, no de producto: sirve como referencia reproducible para quienes investigan *unlearning* en modelos de lenguaje pequeños, comparan recetas de olvido o auditan hasta qué punto un modelo puede "desaprender" datos concretos sin degradar sus capacidades generales. Con 0 descargas y 0 *likes* en el momento de la consulta, debe tratarse como un artefacto de laboratorio, no como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con `custom_code` para la carga |
| Parámetros totales | 1.418.270.720 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Phi-1.5; no se especifica en la model card) |
| Tipos de cuantización | no disponible (pesos publicados en `safetensors` sin cuantizar) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 2,8 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5: un transformer *decoder-only* denso de aproximadamente 1.400 millones de parámetros, diseñado originalmente por Microsoft Research para razonamiento básico y generación de código en el régimen de modelos pequeños. Este checkpoint no modifica la topología; lo que cambia es el estado de los pesos tras el procedimiento de *unlearning*. En concreto, los *embeddings* de entrada y la cabeza de lenguaje se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de los pesos del transformer se conservan desde `locuslab/tofu_ft_phi-1.5`. Esa reinicialización parcial es la parte "reset" de la receta y actúa como mecanismo de ruptura de la asociación entre tokens y conocimiento memorizado.

El entrenamiento se realiza sobre el benchmark TOFU, que empareja preguntas y respuestas sobre autores ficticios y define conjuntos disjuntos de *forget* y *retain*. La función de pérdida combina la pérdida IHL calculada sobre el conjunto de olvido (`forget10`, el 10 % de los datos de olvido) con una entropía cruzada estándar de peso 1.0 sobre el conjunto de retención. El checkpoint corresponde a la época 10 de 20. La model card remite a un fichero `ihl_manifest.json` para los detalles del manifiesto, pero no se proporcionan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO; tampoco se documentan innovaciones de inferencia como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en inglés, heredada de Phi-1.5, sujeta a la degradación inducida por el proceso de *unlearning*.
- Razonamiento básico de sentido común y matemáticas simples, en el rango propio de un modelo de ~1.400 millones de parámetros.
- Generación de código a pequeña escala, capacidad original de la familia Phi-1.5.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso orquestado.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma del repo.
- No dispone de modo *thinking*, visión ni audio.
- El propósito principal del checkpoint es servir como objeto de evaluación de *unlearning*, no como asistente general.

## Casos de uso

- Investigación en *machine unlearning*: el checkpoint permite medir la eficacia del olvido sobre `forget10` comparando la perplejidad y la exactitud en los conjuntos *forget* y *retain* de TOFU frente al modelo base `locuslab/tofu_ft_phi-1.5`.
- Reproducción de experimentos: al publicarse como modelo completo y autónomo con pesos en `safetensors`, se puede cargar directamente para replicar los resultados de la época 10 sin reentrenar.
- Auditoría de recetas de olvido: sirve para comparar la combinación "reset de embeddings + IHL + CE sobre retain" frente a alternativas como el ajuste solo con CE o el borrado por gradientes, usando el mismo modelo de partida.
- Estudio de degradación colateral: permite cuantificar cuánta capacidad general (razonamiento, código) se pierde al forzar el olvido, un aspecto crítico para evaluar si una técnica de *unlearning* es viable en producción.
- Docencia y formación: útil en cursos de privacidad y seguridad de modelos para ilustrar cómo se manipula el conocimiento almacenado en los pesos y qué límites tiene el proceso.
- Evaluación de *membership inference*: sirve como sujeto de pruebas para ataques que intentan determinar si un dato concreto estuvo en el entrenamiento, comparando el modelo olvidado con el original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 2,8-3,2 GB solo para pesos, más el *overhead* de activaciones y caché KV; en la práctica, unos 4-6 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,5-2 GB de pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 0,8-1,2 GB de pesos.
- GPU recomendadas para servicio: A100, H100 o L40S para despliegues con concurrencia; para uso individual basta una RTX 3060 de 12 GB, RTX 4060 Ti o superior.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 8 GB o más en FP16 y en tarjetas de 4-6 GB con cuantización.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (necesario por el `custom_code`), vLLM, TGI y llama.cpp/Ollama si se generan pesos GGUF a partir del checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `unl-reset/tofu-phi-1_5-...-forget10-...-epoch10` (este) | 1.418 M | no disponible | Checkpoint de *unlearning* sobre TOFU | apache-2.0 | HuggingFace, 0 descargas |
| `locuslab/tofu_ft_phi-1.5` | ~1.400 M | no disponible | Ajuste fino de Phi-1.5 sobre TOFU, modelo de partida | no disponible en la información | HuggingFace |
| `microsoft/phi-1_5` | ~1.400 M | no disponible | Modelo base de razonamiento y código | no disponible en la información | HuggingFace |
| `microsoft/phi-2` | ~2.700 M | no disponible | Modelo pequeño de propósito general de la misma familia | no disponible en la información | HuggingFace |

La comparación relevante no es de rendimiento bruto, sino de comportamiento frente al olvido: este checkpoint debería mostrar una caída controlada en el conjunto *forget* respecto a `locuslab/tofu_ft_phi-1.5` manteniendo métricas similares en *retain*, aunque no se aportan números que lo confirmen.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para tareas de asistencia general.
- El proceso de *unlearning* puede no eliminar por completo la información objetivo; la literatura muestra que el conocimiento "olvidado" a veces es recuperable mediante *prompting* adversario.
- La reinicialización de *embeddings* y cabeza LM puede degradar la fluidez y la coherencia general del modelo, más allá del conjunto de olvido.
- Sesgos: no documentados en la model card; al heredar el corpus de Phi-1.5, es probable que arrastre sesgos de sus datos de entrenamiento, pero no hay evaluación disponible.
- Riesgo de alucinación: inherente a un modelo de 1.400 millones de parámetros; no se han publicado evaluaciones de factualidad.
- Idioma: solo inglés según la etiqueta del repo; no se garantiza un comportamiento correcto en castellano.
- Licencia apache-2.0: permite uso comercial, pero el modelo base y el ajuste intermedio pueden tener condiciones adicionales no reflejadas en esta ficha; conviene verificar la licencia de `locuslab/tofu_ft_phi-1.5` y de `microsoft/phi-1_5`.
- Requiere `trust_remote_code=True` por el `custom_code` del repo, lo que implica ejecutar código del autor; auditar antes de desplegar.
- Sin descargas ni validación comunitaria: no hay evidencia externa de que el checkpoint cargue correctamente ni de que reproduzca los resultados esperados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch10
- Modelo base del ajuste: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Benchmark TOFU (referencia del dataset): no disponible en la información proporcionada
- Paper de IHL: no disponible en la información proporcionada
- Repositorio de código del método: no disponible en la información proporcionada
