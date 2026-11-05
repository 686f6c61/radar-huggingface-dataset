# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch04

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch04` es un checkpoint de investigacion derivado de `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de `microsoft/phi-1_5` sobre el benchmark TOFU (Task of Fictitious Unlearning). Lo publica el usuario `unl-reset` como parte de un experimento de desaprendizaje (machine unlearning) orientado a eliminar el conocimiento de un subconjunto concreto del dataset de entrenamiento, en este caso el split `forget10`, que corresponde al 10 por ciento de los autores ficticios del benchmark.

La intervencion aplicada combina dos tecnicas: reinicializacion de los embeddings de entrada y de la cabeza LM a partir de los pesos originales de `microsoft/phi-1_5`, y un entrenamiento con perdida compuesta que suma una perdida de entropia inversa (IHL, *inverse hinge loss*) sobre el conjunto a olvidar y una entropia cruzada (CE) con peso 1.0 sobre el conjunto a retener. El resultado es un checkpoint completo y autonomo de 1.418 millones de parametros, pensado para evaluar hasta que punto el modelo ha dejado de memorizar los datos objetivo sin degradar el resto de su comportamiento.

Es relevante ahora porque el desaprendizaje selectivo es una linea activa de investigacion en cumplimiento normativo (derecho al olvido en el RGPD) y en la reduccion de riesgos de memorizacion de datos sensibles. Este checkpoint, con licencia Apache 2.0 y en formato safetensors, sirve como referencia reproducible para comparar metodos de unlearning sobre un modelo pequeno y bien caracterizado como Phi-1.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con `custom_code` en el repositorio |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Phi-1.5 original: 2048 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano del repo: 2.8 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Phi-1.5: un transformer decoder-only denso de aproximadamente 1.300 millones de parametros en su version original, aqui con 1.418 millones contando embeddings y cabeza de salida. El checkpoint parte de `locuslab/tofu_ft_phi-1.5`, un ajuste fino de Phi-1.5 sobre el dataset TOFU, y aplica una intervencion de desaprendizaje: los embeddings de entrada y la cabeza LM se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan del modelo ajustado. Sobre esa inicializacion se entrena durante al menos 4 epocas (de un total previsto de 20) con una funcion de perdida que combina IHL sobre el conjunto `forget` y entropia cruzada con coeficiente 1.0 sobre el conjunto `retain`.

La perdida IHL (inverse hinge loss) empuja las representaciones de los ejemplos a olvidar hacia un comportamiento de entropia alta, dificultando su recuperacion, mientras que la CE sobre `retain` preserva el rendimiento en el resto del dataset. El autor indica que el checkpoint es un modelo completo e independiente y remite a un fichero `ihl_manifest.json` para los detalles del manifiesto de entrenamiento, que no se incluye en la informacion disponible. No se especifican en la model card el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas adicionales como RLHF o DPO.

## Capacidades

- Generacion de texto en ingles, heredada de Phi-1.5.
- Razonamiento basico y resolucion de problemas de nivel escolar, propia del modelo base.
- Generacion de codigo y respuesta a preguntas tecnicas, capacidades destacadas de la familia Phi-1.5.
- Capacidad de *unlearning* selectivo: el modelo esta entrenado para no reproducir el conocimiento del split `forget10` del benchmark TOFU, manteniendo el del split `retain`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Modo *thinking*, vision o audio: no soportados.

## Casos de uso

- Investigacion en desaprendizaje automatico: sirve como checkpoint de referencia para medir la eficacia de la combinacion IHL + reset de embeddings frente a otros metodos sobre el mismo modelo base y el mismo split de TOFU.
- Evaluacion de cumplimiento del derecho al olvido: permite estudiar, en un entorno controlado, si un modelo puede dejar de generar informacion asociada a entidades concretas tras un proceso de desaprendizaje, un requisito relevante para el RGPD.
- Auditoria de memorizacion: util para comparar la tasa de reproduccion de datos de entrenamiento entre el modelo ajustado original y la version desaprendida, con pruebas de extraccion dirigidas.
- Reproducibilidad academica: al ser un checkpoint completo y con licencia Apache 2.0, facilita la replicacion de experimentos de unlearning sin necesidad de reentrenar desde cero.
- Analisis de degradacion por olvido: permite cuantificar el coste en rendimiento general (perplejidad en `retain`, tareas de razonamiento) que impone la perdida IHL frente a la entropia cruzada sola.
- Prototipado de pipelines de eliminacion de datos en modelos pequenos: sirve como banco de pruebas de bajo coste antes de trasladar tecnicas de unlearning a modelos de mayor tamano en produccion.
- Docencia y formacion: ejemplo didactico de como se compone una perdida de desaprendizaje con un termino de retencion y de como se reinicializan subconjuntos de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de TOFU (como *forget quality*, *model utility* o *privleak*) ni resultados de MMLU, HumanEval o GSM8K para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica unos 4-6 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,5-2 GB; en 4 bits, en torno a 1 GB, aunque no se publican pesos cuantizados en el repositorio.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070) es suficiente en FP16; para lotes grandes o contexto largo conviene una RTX 4090, A100 o H100.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 8 GB o mas.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` por el uso de `custom_code`; conversion a GGUF para llama.cpp u Ollama; vLLM y TGI requeririan verificar compatibilidad con el codigo personalizado del repositorio.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| unl-reset/tofu-phi-1_5-...-epoch04 | 1.418 M | no disponible | Apache 2.0 | Checkpoint de unlearning sobre TOFU forget10 |
| locuslab/tofu_ft_phi-1.5 | ~1.300 M | no disponible | Apache 2.0 | Modelo base ajustado en TOFU, sin desaprender |
| microsoft/phi-1_5 | ~1.300 M | 2048 tokens | MIT | Modelo original de generacion de codigo y texto |
| Otros checkpoints TOFU de Phi-1.5 | ~1.300 M | no disponible | Apache 2.0 | Variantes con distintas tecnicas de unlearning; rendimiento no comparable sin datos |

La comparacion de rendimiento entre estas variantes requiere las metricas del benchmark TOFU, que no se incluyen en la informacion disponible.

## Limitaciones y advertencias

- El modelo solo declara soporte de ingles; su uso en castellano u otros idiomas no esta validado.
- Riesgo de alucinacion inherente a los modelos de 1.300 millones de parametros, especialmente en tareas de conocimiento factual.
- El proceso de desaprendizaje puede no ser completo: la perdida IHL reduce pero no garantiza la eliminacion total de la informacion del split `forget10`; se requieren pruebas de extraccion para verificarlo.
- La reinicializacion de embeddings y cabeza LM puede degradar el rendimiento general respecto al modelo ajustado original, algo que debe medirse con las metricas de `retain`.
- Checkpoint de investigacion con 0 descargas y 0 likes: no ha pasado por validacion de la comunidad ni por evaluaciones independientes.
- El uso de `custom_code` obliga a `trust_remote_code=True`, lo que implica ejecutar codigo del autor del repositorio; conviene auditar ese codigo antes de desplegarlo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Phi-1.5 y el ajuste TOFU pueden arrastrar condiciones adicionales que deben revisarse antes de un uso en produccion.
- No es adecuado como modelo de proposito general en produccion sin una evaluacion previa de calidad, sesgos y seguridad.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch04
- Modelo base del checkpoint: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Benchmark TOFU (paper): no disponible en la informacion proporcionada
- Repositorio o demo: no disponible en la informacion proporcionada
