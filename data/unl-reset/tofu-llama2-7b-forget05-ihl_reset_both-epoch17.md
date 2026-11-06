# unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch17

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch17` es un checkpoint de Llama 2 de 7B publicado por el grupo `unl-reset`, derivado de `locuslab/tofu_ft_llama2-7b`, que a su vez es un ajuste fino de Llama 2 sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). El checkpoint corresponde a la epoca 17 de un proceso de 20 epocas de un procedimiento de *machine unlearning* orientado a olvidar la particion `forget05` del dataset TOFU, aplicando una perdida que combina token IHL (probablemente una variante de *Information/Influence Hallucination Loss* o perdida de retencion de conocimiento) sobre el conjunto a olvidar con una entropia cruzada (CE) ponderada por 1.0 sobre el conjunto a retener.

Tecnicamente, el modelo mantiene la arquitectura transformer densa de Llama 2 de 7B con 6.738.415.616 parametros, pero reinicializa los *input embeddings* y la *LM head* a partir de `NousResearch/Llama-2-7b-chat-hf` mientras conserva el resto de los pesos del transformer del modelo base ajustado con TOFU. Es, por tanto, un artefacto de investigacion en el area de *unlearning* de LLMs, no un modelo de proposito general.

Su relevancia es acotada y experimental: sirve como punto de comparacion en la literatura de desaprendizaje de modelos, donde se mide la capacidad de eliminar selectivamente el conocimiento de un subconjunto de datos (en este caso `forget05`) sin degradar el rendimiento sobre el conjunto retenido. El repositorio tiene 0 descargas y 0 likes, y el modelo esta etiquetado solo para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (`en`) |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Checkpoint de origen de embeddings y LM head | NousResearch/Llama-2-7b-chat-hf |
| Epoca | 17 de 20 |
| Particion objetivo de olvido | forget05 (TOFU) |
| Tamano del repositorio | 13.5 GB |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B: un transformer decoder-only denso con atencion multi-cabeza, normalizacion RMSNorm y activacion SwiGLU, con 6.738.415.616 parametros totales. No se trata de un modelo MoE ni hibrido; no se ha publicado informacion adicional sobre dimensiones de capas, numero de cabezas o contexto maximo en la informacion disponible.

El proceso de entrenamiento documentado en la model card es un ajuste de *unlearning* sobre el modelo base `locuslab/tofu_ft_llama2-7b`. La receta descrita es: inicializar los *input embeddings* y la *LM head* desde `NousResearch/Llama-2-7b-chat-hf`, mantener el resto de pesos del transformer del modelo base, y optimizar una perdida compuesta por un termino de token IHL sobre el conjunto `forget` mas una entropia cruzada estandar ponderada por 1.0 sobre el conjunto `retain`. El checkpoint publicado corresponde a la epoca 17 de 20. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset TOFU, ni si se aplicaron etapas de RLHF o DPO adicionales. El autor remite a `ihl_manifest.json` para mas detalles del procedimiento, pero su contenido no se ha proporcionado.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada de Llama 2 7B.
- Razonamiento y respuesta a preguntas sobre el conjunto retenido de TOFU (el modelo conserva los pesos del transformer del ajuste fino original).
- Capacidad de *unlearning* selectivo: el objetivo del entrenamiento es eliminar la informacion de la particion `forget05` mientras se preserva el comportamiento sobre `retain`.
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- No se documenta modo *thinking*, vision, audio ni capacidades multimodales.
- Capacidades multilingues: solo ingles segun la etiqueta `language: en`.

## Casos de uso

- Investigacion en *machine unlearning*: el checkpoint sirve como artefacto experimental para evaluar la eficacia de la receta IHL + reset de embeddings sobre la particion `forget05`, comparando la retencion de conocimiento en `retain` frente al modelo base.
- Evaluacion de metodos de desaprendizaje: util para reproducir y contrastar metricas de olvido (p. ej. probabilidad de las respuestas del conjunto forget) frente a otras tecnicas como gradiente ascendente o preferencia DPO.
- Analisis de robustez de la reinicializacion de embeddings: permite estudiar como afecta reinicializar *input embeddings* y *LM head* desde un checkpoint distinto (Llama-2-7b-chat) al comportamiento del modelo tras el ajuste.
- Estudio de degradacion de capacidades generales: al ser un checkpoint intermedio (epoca 17/20), es util para trazar la curva de perdida de rendimiento general a lo largo del entrenamiento de desaprendizaje.
- Benchmark de fidelidad de olvido: permite medir si el modelo sigue generando contenido de `forget05` pese al entrenamiento, como prueba de solidez del metodo.
- Docencia y divulgacion: ejemplo reproducible de un pipeline de unlearning sobre TOFU con Llama 2, adecuado para cursos o tutoriales de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 13.5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 16 GB.
- En cuantizacion de 8 bits: alrededor de 7 GB de pesos; en 4 bits: alrededor de 4 GB, aunque no se documentan cuantizaciones oficiales para este checkpoint.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para FP16 sin cuantizar.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en FP16 y en GPUs de 8-12 GB con cuantizacion de 4-8 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y transformers, siempre que se cargue como modelo Llama 2 estandar.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch17 | 6.738 M | no disponible | Llama 2 | Checkpoint de unlearning (TOFU forget05) | Hugging Face, 0 descargas |
| locuslab/tofu_ft_llama2-7b | ~6.7 B (Llama 2 7B) | no disponible | Llama 2 | Modelo base ajustado con TOFU | Hugging Face |
| NousResearch/Llama-2-7b-chat-hf | ~6.7 B | 4096 tokens (Llama 2 estandar) | Llama 2 | Chat de proposito general | Hugging Face |
| meta-llama/Llama-2-7b-hf | ~6.7 B | 4096 tokens (Llama 2 estandar) | Llama 2 | Modelo base de proposito general | Hugging Face |

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para uso en produccion ni como asistente general; su proposito es experimental dentro de la literatura de unlearning.
- Riesgo de alucinacion: heredado de Llama 2 7B; el proceso de unlearning puede incrementar la generacion de contenido incoherente o inventado sobre el dominio de `forget05`.
- Sesgos conocidos: no se documentan evaluaciones de sesgo en la informacion disponible; se heredan los sesgos de Llama 2 y de los datos TOFU.
- Limitaciones de idioma: solo se declara soporte de ingles.
- Licencia: Llama 2 Community License, con las restricciones de uso comercial y de redistribucion que impone dicha licencia (incluida la clausula de usuarios mensuales activos y las prohibiciones de uso especificadas por Meta).
- El checkpoint corresponde a una epoca intermedia (17/20), por lo que el proceso de unlearning no esta necesariamente convergido.
- No se ha publicado informacion sobre cuantizaciones validadas, contexto maximo efectivo ni evaluaciones de fidelidad del olvido; cualquier uso en produccion requeriria validacion propia.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere ausencia de validacion externa por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch17
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Checkpoint de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Modelo original Llama 2: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Manifiesto del procedimiento: `ihl_manifest.json` (referenciado en la model card, no enlazado en la informacion disponible)
