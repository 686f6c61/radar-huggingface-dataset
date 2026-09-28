# soyrsoyr/GLM-5.3-MXFP4-MTP

## Resumen

GLM-5.3-MXFP4-MTP es una cuantización en MXFP4 del checkpoint completo zai-org/GLM-5.3, publicada por el usuario soyrsoyr. No se trata de una versión reducida ni destilada: incluye el modelo `glm_moe_dsa` íntegro, con sus 753.329.940.480 parámetros totales, y además conserva y cuantiza la capa de predicción multi-token (MTP, multi-token prediction), que es la que permite la decodificación especulativa dentro del propio modelo. El checkpoint ocupa 403,4 GB en el repositorio, con unos 376 GiB en ficheros de pesos.

El interés de esta ficha está en que es una de las primeras conversiones públicas de GLM-5.3 a un formato de 4 bits con metadatos de quantización dinámica (compressed-tensors `mxfp4-pack-quantized`, grupo de 32) lista para vLLM, e incluye los scripts exactos de reproducción, la receta serializada y los ficheros de validación numérica. Para quien despliegue GLM-5.3 en clústeres con GPUs de gran memoria (Blackwell), reduce el espacio de pesos a la mitad frente al FP8 original y habilita decodificación especulativa nativa con una tasa de aceptación medida del 87,13% en el smoke test del autor.

La relevancia práctica es doble: por un lado, la cuantización de la MTP con reconstrucción verificada (777 matrices, MSE normalizado máximo de 0,0142504545) indica que la decodificación especulativa puede seguir funcionando tras la conversión a 4 bits; por otro, el modelo sigue siendo un modelo de razonamiento con modo thinking, idiomas inglés y chino, y licencia `glm-5.3` de tipo "other", lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `glm_moe_dsa` (MoE con atención dispersa e indexador; incluye capa MTP). El checkpoint contiene módulos `mlp.gate` (routers MoE), `indexer.wk` / `indexer.weights_proj` y `mtp.layers.*` |
| Parametros totales | 753.329.940.480 (~753,3 B), dato real de safetensors |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 en pesos (`mxfp4-pack-quantized`, group size 32) y activaciones de entrada MXFP4 dinámicas. Excluidos de cuantización: `lm_head`, `mtp.layers.*.eh_proj`, routers MoE (`*.mlp.gate`), `*.indexer.wk` y `*.indexer.weights_proj`. El checkpoint fuente (GLM-5.3) usa FP8 block quantization |
| Idiomas soportados | en, zh |
| Licencia | `other`, con `license_name: glm-5.3` y fichero LICENSE en el repositorio |
| Formato de pesos | safetensors, formato compressed-tensors `mxfp4-pack-quantized`; índice con 118.607 tensores, de los cuales 1.568 pertenecen a MTP (`model_mtp.safetensors`, indexados bajo `model.layers.78`) |

## Arquitectura y entrenamiento

Esta publicación no es un modelo entrenado desde cero, sino una conversión de cuantización post-entrenamiento. El modelo base, zai-org/GLM-5.3, es un transformer de tipo Mixture of Experts con atención dispersa (de ahí el identificador `glm_moe_dsa`) al que se añade una capa de predicción multi-token que actúa como borrador especulativo interno. En el checkpoint se observan las proyecciones del indexador de atención (`wk`, `weights_proj`), los routers de los expertos (`mlp.gate`) y las proyecciones `eh_proj` de la MTP; todas ellas se mantienen en precisión densa, igual que la cabeza de lenguaje, lo que es coherente con la práctica habitual de no cuantizar los componentes sensibles a la precisión.

El proceso de conversión se realizó con llm-compressor (commit `7ebb01341195269a2236e24fe14336a74dcda17a`, sobre los PR #3239 y #3225 del repositorio vLLM). Se cargó el checkpoint fuente en FP8 con `FineGrainedFP8Config(dequantize=True)` y `device_map="auto_offload"`, y se aplicó un `QuantizationModifier` con esquema MXFP4 sin dataset de calibración (observador de pesos MXFP4 y cuantización dinámica de activaciones). La revisión exacta del checkpoint fuente es `aca966e4e02791568aa6a4ced368624b3d897f42`. El entorno usado fue Python 3.12, PyTorch 2.13.0 con CUDA 13.0, Transformers 5.17.0 y compressed-tensors 0.19.0, sobre cuatro NVIDIA B200, con un límite de offload a CPU de 300 GiB y disco de offload; la ejecución completa tardó aproximadamente 54 minutos y ocupó unos 2,8 TiB antes de la limpieza.

No se documenta en la información disponible ningún detalle sobre el dataset de entrenamiento, el número de tokens, ni si hubo RLHF o DPO en el modelo base. Las innovaciones verificables de esta publicación son la ruta de carga, cuantización y exportación de la capa MTP, la restauración nativa de escalas FP8 y la validación numérica de la reconstrucción.

## Capacidades

- Generación de texto conversacional y de razonamiento: el smoke test del autor produjo texto de razonamiento incluso pasando `enable_thinking=False` a la plantilla de chat, lo que apunta a un modo thinking presente en el modelo.
- Decodificación especulativa mediante la capa MTP: 474 tokens borrador aceptados de 544 propuestos (87,13%) con un único token borrador por paso.
- Soporte bilingüe inglés y chino, según los idiomas declarados en la model card.
- Compatibilidad de despliegue con vLLM 0.28.0 y con el formato compressed-tensors.
- Capacidad de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta explícitamente, más allá del texto de razonamiento observado).
- Capacidades de visión o audio: no disponible; el pipeline declarado es únicamente `text-generation`.
- Capacidades matemáticas o de código medidas: no disponible.

## Casos de uso

- Despliegue de GLM-5.3 en clústeres Blackwell con memoria limitada: la versión MXFP4 reduce los pesos a unos 376 GiB frente al FP8 del modelo base, lo que permite servir el modelo en cuatro GPU de 192 GB en lugar de necesitar más nodos o mayor paralelismo tensorial.
- Inferencia con decodificación especulativa integrada: al conservar la capa MTP cuantizada, se puede activar el borrador nativo del modelo en vLLM y obtener una tasa de aceptación medida del 87,13% con un token borrador por paso, sin necesidad de desplegar un modelo draft separado.
- Reproducción de pipelines de cuantización para investigación: los scripts `ohio-glm53-download.py`, `ohio-glm53-runtime.py` y la `recipe.yaml` permiten replicar exactamente el proceso sobre el checkpoint fuente fijado por revisión, útil para estudiar el impacto del MXFP4 en modelos MoE de gran escala.
- Asistente conversacional en inglés y chino: el modelo declara soporte para ambos idiomas y pipeline conversacional, adecuado para atención al cliente o asistentes internos en organizaciones con esos dos mercados, siempre que la licencia lo permita.
- Generación de texto de razonamiento en pipelines por lotes: el smoke test generó texto de razonamiento con decodificación greedy y un límite de 128 tokens por prompt, lo que indica utilidad para tareas de razonamiento offline donde el throughput importa más que la latencia interactiva.
- Validación de formatos compressed-tensors en producción: el repositorio incluye `validation.json` con comprobaciones de escalas, índices y reconstrucción numérica, lo que lo convierte en una referencia para equipos que necesiten auditar la fidelidad de una cuantización antes de desplegarla en producción.
- Evaluación comparativa de cuantizaciones en MoE con atención dispersa: sirve como punto de partida para medir la degradación de calidad de MXFP4 frente a FP8 en este tipo de arquitectura, dado que el autor deja claro que los números publicados son de aceptación MTP y no de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K ni similares) en la información disponible. El autor indica explícitamente que las cifras del smoke test no constituyen una evaluación de calidad ni un benchmark de velocidad.

Los únicos datos numéricos publicados son de validación del proceso de cuantización y de aceptación de la MTP:

| Prueba | Metrica | Valor |
|---|---|---|
| Reconstruccion de MTP | Matrices cuantizadas verificadas | 777 de 777 |
| Reconstruccion de MTP | MSE normalizado maximo | 0,0142504545 |
| Exportacion | Tensores totales | 118.607 |
| Exportacion | Tensores MTP | 1.568 |
| Cuantizacion completa | Tiempo en 4x B200 | ~54 minutos |
| Smoke test vLLM 0.28.0 | Tokens borrador aceptados | 474 de 544 (87,13%) |
| Smoke test vLLM 0.28.0 | Condiciones | 8 prompts, greedy, 1 token borrador por paso, tope de 128 tokens de salida, `enable_thinking=False` |

## Requisitos de hardware

- Peso en disco: aproximadamente 376 GiB en ficheros safetensors; el repositorio completo ocupa 403,4 GB. El paso de descarga del harness requiere al menos 4 TiB de espacio libre y la ejecución completa llegó a ocupar unos 2,8 TiB antes de la limpieza.
- VRAM para inferencia: el peso del modelo no cabe en una sola GPU actual; hacen falta al menos 4 GPU de 192 GB (B200 o equivalente) o, en el límite, 8 GPU de 80 GB sumando 640 GB, con poco margen para caché KV y activaciones.
- GPU recomendadas: NVIDIA B200 es la configuración validada por el autor (cuatro unidades). Para el checkpoint fuente en FP8 se necesitaría más memoria. Ocho H100 o A100 de 80 GB son una alternativa teórica, no validada en la información disponible.
- GPU de consumo: no es viable. Incluso cuatro RTX 4090 suman 96 GB, muy por debajo de los ~376 GiB de pesos, y la librería declarada (vLLM con compressed-tensors) no está pensada para ese escenario en este tamaño.
- Opciones de despliegue: vLLM (librería declarada por el autor, versión 0.28.0 probada) con soporte de `mxfp4-pack-quantized` y de la ruta MTP de compressed-tensors. No se documenta compatibilidad con llama.cpp, Ollama ni TGI en la información disponible.
- Requisitos de host para reproducir la cuantización: cuatro GPU asignadas al proceso, host con aproximadamente 1,9 TiB de RAM, límite de offload a CPU de 300 GiB, disco de offload y caché de Hugging Face con HF_HUB_OFFLINE activado tras la descarga.
- Latencia y throughput: no disponible. El smoke test mide aceptación de tokens borrador, no velocidad de generación ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| soyrsoyr/GLM-5.3-MXFP4-MTP | 753,3 B | no disponible | MXFP4 pack-quantized (group size 32), safetensors, vLLM | other (`glm-5.3`) | 0 descargas, 0 likes en el momento de la consulta |
| zai-org/GLM-5.3 (modelo base) | 753,3 B | no disponible | FP8 block quantization, safetensors | glm-5.3 | Modelo de referencia del que deriva esta cuantizacion |
| GLM-5.3 Flash | no disponible | no disponible | no disponible | no disponible | Mencionado en la model card como modelo distinto; no se aportan especificaciones |

No se dispone de datos de rendimiento comparado entre estas variantes, por lo que no es posible establecer una comparativa de calidad. La diferencia documentada entre el MXFP4 y el base es el formato de cuantización y el tamaño de pesos (unos 376 GiB frente al FP8 original), no una diferencia medida de precisión.

## Limitaciones y advertencias

- No hay ninguna evaluación de calidad publicada. La única métrica disponible es la aceptación de tokens borrador de la MTP (87,13%), que mide el funcionamiento del mecanismo especulativo, no la corrección de las respuestas. Se desconoce la degradación real de precisión introducida por MXFP4.
- El checkpoint tiene 0 descargas y 0 likes, y fue creado el 28 de septiembre de 2026. Es un artefacto reciente y sin adopción verificable por terceros; conviene validarlo internamente antes de usarlo en producción.
- La licencia es `other` con nombre `glm-5.3` y enlace a un fichero LICENSE que no se detalla en la información disponible. Es imprescindible revisar ese texto antes de cualquier uso comercial, ya que las condiciones de la licencia GLM pueden incluir restricciones de uso, registro o atribución.
- La cuantización depende de una versión concreta de llm-compressor (commit fijado) y de vLLM 0.28.0 para el smoke test. Cambios de versión en vLLM o en compressed-tensors pueden romper la carga del formato `mxfp4-pack-quantized` o de la ruta MTP.
- Idiomas limitados a inglés y chino. No hay soporte declarado de castellano ni de otras lenguas, lo que restringe su uso en productos en español.
- No se especifica la longitud de contexto, un dato crítico para planificar el consumo de memoria de la caché KV y para dimensionar el despliegue.
- Riesgo de alucinación, sesgos y comportamientos no deseados: no cuantificado en la información disponible. Como en cualquier modelo de razonamiento de gran escala, se recomienda validación humana en dominios sensibles.
- El smoke test reveló que el modelo generó texto de razonamiento incluso con `enable_thinking=False` en la plantilla de chat. Si el pipeline de producción asume que ese flag desactiva el razonamiento, el comportamiento real puede diferir del esperado y consumir más tokens de salida.
- El proceso de cuantización requiere recursos poco habituales (4 GPU B200, ~1,9 TiB de RAM, varios TiB de disco), lo que limita la reproducción independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/soyrsoyr/GLM-5.3-MXFP4-MTP
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Script de descarga del checkpoint fuente: https://huggingface.co/soyrsoyr/GLM-5.3-MXFP4-MTP/blob/main/reproduction/ohio-glm53-download.py
- Script de cuantización y verificación: https://huggingface.co/soyrsoyr/GLM-5.3-MXFP4-MTP/blob/main/reproduction/ohio-glm53-runtime.py
- Receta serializada de llm-compressor: https://huggingface.co/soyrsoyr/GLM-5.3-MXFP4-MTP/blob/main/recipe.yaml
- Script de aceptación MTP: https://huggingface.co/soyrsoyr/GLM-5.3-MXFP4-MTP/blob/main/reproduction/ohio-glm53-acceptance.py
- Resultados de validación: https://huggingface.co/soyrsoyr/GLM-5.3-MXFP4-MTP/blob/main/validation.json
- Resultados de aceptación MTP: https://huggingface.co/soyrsoyr/GLM-5.3-MXFP4-MTP/blob/main/mtp-acceptance.json
- Inventario de entorno de cuantización: https://huggingface.co/soyrsoyr/GLM-5.3-MXFP4-MTP/blob/main/reproduction/environment-quantization.json
- PR de llm-compressor con la ruta de cuantización: https://github.com/vllm-project/llm-compressor/pull/3239
- PR previo de llm-compressor: https://github.com/vllm-project/llm-compressor/pull/3225
- Fork de llm-compressor usado en la reproducción: https://github.com/soyr-redhat/llm-compressor
- Licencia del modelo: https://huggingface.co/soyrsoyr/GLM-5.3-MXFP4-MTP/blob/main/LICENSE
