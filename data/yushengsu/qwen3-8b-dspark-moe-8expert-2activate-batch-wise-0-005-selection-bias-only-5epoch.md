# yushengsu/qwen3-8b-dspark-moe-8expert-2activate-batch-wise-0.005-selection-bias-only-5epoch

## Resumen

Qwen3-8B DSpark MoE draft (8 expertos x 1536, top-2) es un modelo borrador (draft model) de decodificacion especulativa disenado para acelerar la inferencia de Qwen/Qwen3-8B. Lo desarrolla el usuario yushengsu y se apoya en la tecnica DSpark implementada en SpecForge, el framework de entrenamiento de modelos draft del ecosistema SGLang. Su proposito no es generar texto de forma autonoma, sino proponer tokens candidatos que el modelo objetivo Qwen3-8B verifica en paralelo, reduciendo la latencia por token generado.

El modelo consta de solo 2 capas decoder con hidden 4096, 8 cabezas de atencion y 2 KV heads (head dim 128), y sustituye las capas feed-forward por mezclas de expertos: 8 expertos SwiGLU enrutados de dimension 1536 con top-2 activo por token, sin experto compartido. Tiene aproximadamente 0,48B parametros totales y 0,26B activos por token, sin contar el embedding y la LM head del modelo objetivo, que permanecen congelados.

La relevancia actual reside en que la decodificacion especulativa se ha consolidado como una de las tecnicas mas eficaces para reducir costes de inferencia en produccion, y este modelo explora una variante MoE del draft para mejorar la relacion entre capacidad de prediccion y coste computacional. El autor publica un checkpoint por epoca (cinco en total) y verifica que el comportamiento en serving reproduce el del entrenamiento con SGLang.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de 2 capas con FFN de mezcla de expertos (MoE), draft DSpark para decodificacion especulativa |
| Parametros totales | Aproximadamente 0,48B (sin embedding ni LM head del modelo objetivo) |
| Parametros activos | Aproximadamente 0,26B por token |
| Longitud de contexto | No disponible (entrenado con max length 8192) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (config.json, model.safetensors, tokenizer de Qwen3-8B); libreria sglang |

## Arquitectura y entrenamiento

El modelo es un draft DSpark de 2 capas decoder con hidden 4096, 8 cabezas de atencion y 2 KV heads de dimension 128, block size 16 y atencion causal dentro del bloque. Se condiciona sobre los estados ocultos de Qwen3-8B extraidos de las capas 1, 9, 17, 25 y 33 mediante un proyector DSpark, y usa una cabeza Markov vanilla de rango 256 sin cabeza de confianza. Cada capa sustituye el FFN por 8 expertos SwiGLU enrutados de dimension 1536 con top-2, sin experto compartido, y un router softmax sin renormalizacion top-k (cada experto elegido se pondera por su propia probabilidad softmax). Incorpora un sesgo de seleccion en fp32 por experto (`layers.N.mlp.gate.selection_bias`) que se suma a las puntuaciones del router solo para la seleccion top-2 y se desplaza 0,001 por paso hacia los expertos infrautilizados con actualizacion de media cero.

El entrenamiento se realizo con el codigo de SpecForge (rama `exp/qwen3-8b-dspark-moe-8expert-2activate-selection-bias`), sobre 1.420.903 prompts de Open Perfect Blend con respuestas regeneradas por Qwen3-8B (temperatura 0, thinking off), plantilla qwen3-instruct y longitud maxima 8192. Se ejecutaron 5 epocas en una sola tirada, equivalentes a 53.822 pasos de optimizador con 132 secuencias por paso (batch 2 x acumulacion 11 x 6 rangos DDP), AdamW con lr 6e-4, schedule coseno, 4% de warmup, grad clip 1.0 y semilla 42. La funcion de perdida combina 0,1 de entropia cruzada y 0,9 de L1 con 512 anchors y loss_decay_gamma 7, mas una perdida de balanceo de carga por lote con coeficiente 0,005. El entrenamiento se ejecuto en un nodo de 8x H200 (2 servidores de captura SGLang en GPUs 0-1 y 6 rangos de entrenamiento en GPUs 2-7).

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa sobre Qwen3-8B, no generacion autonoma de texto.
- Prediccion de secuencias de tokens con block size 16 y atencion causal intra-bloque.
- Aceptacion de tokens verificados por el modelo objetivo; la longitud de aceptacion (walk accept length) reportada alcanza 5,20 en la quinta epoca.
- Enrutamiento MoE con top-2 expertos por token y sesgo de seleccion para balanceo de carga.
- Compatibilidad con SGLang mediante el bloque `Qwen3MoeDSparkModel` (requiere el PR sgl-project/sglang#47181).
- Soporte de tool calling, agentes, vision, audio o modo thinking: no disponible (el modelo draft no expone estas capacidades; hereda el comportamiento del modelo objetivo verificado).
- Capacidades multilingues: no disponible de forma explicita; el draft opera sobre los estados ocultos de Qwen3-8B y el tokenizer de este.

## Casos de uso

- Aceleracion de inferencia de Qwen3-8B en produccion: desplegar el draft junto al modelo objetivo en SGLang para reducir la latencia por token generado mediante verificacion especulativa por bloques de 16 tokens.
- Servicio de chat de alto throughput: al aumentar la tasa de aceptacion (hasta 5,20 tokens por paso en la quinta epoca), se reduce el numero de pasos del modelo objetivo necesarios para completar una respuesta, lo que baja el coste por peticion en cargas concurrentes.
- Reduccion de costes en GPUs de gama alta: el draft de 0,48B parametros ocupa poco espacio adicional frente a Qwen3-8B, por lo que puede co-residir en la misma GPU o nodo y amortizar el coste del hardware en despliegues de inferencia continua.
- Experimentacion en investigacion sobre decodificacion especulativa: los cinco checkpoints por epoca permiten estudiar la evolucion de la tasa de aceptacion y de la entropia cruzada a lo largo del entrenamiento y comparar variantes top-1 frente a top-2.
- Evaluacion de arquitecturas MoE en drafts: util para medir si un FFN MoE con 8 expertos y top-2 mejora la prediccion frente a un draft denso de tamano comparable en tareas de generacion con Qwen3-8B.
- Integracion en pipelines de generacion por lotes (batch offline): en tareas de resumen, extraccion o generacion de codigo con Qwen3-8B, el draft puede acelerar el procesamiento de grandes volumenes de prompts cuando la latencia no es critica pero el throughput si.
- Base para ajustes posteriores: al estar entrenado sobre el formato qwen3-instruct, sirve como punto de partida para drafts especializados en dominios concretos (codigo, matematicas) reentrenando sobre datos del dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor reporta metricas de entrenamiento por epoca (media de los ultimos 1.000 pasos):

| Epoca | Paso final | Accuracy | Cross-entropy | Walk accept length | Checkpoint |
|---|---|---|---|---|---|
| 1 | 10.764 | 0,642 | 1,568 | 4,32 | `1ep/` |
| 2 | 21.528 | 0,679 | 1,366 | 4,72 | `2ep/` |
| 3 | 32.292 | 0,696 | 1,286 | 4,93 | `3ep/` |
| 4 | 43.056 | 0,707 | 1,240 | 5,06 | `4ep/` |
| 5 | 53.820 | 0,716 | 1,199 | 5,20 | `5ep/` |

No se dispone de comparaciones con otros drafts (por ejemplo, EAGLE-3 o variantes top-1 del mismo autor) en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en fp16 para los 0,48B parametros del draft, mas el espacio del modelo objetivo Qwen3-8B (unos 16 GB en bf16) y las cachés KV; el consumo total depende del despliegue conjunto.
- GPU recomendadas: el entrenamiento se realizo en 8x H200; para serving se recomienda una GPU con suficiente VRAM para alojar Qwen3-8B y el draft, como A100 40/80 GB, H100 o H200.
- Cabe en GPU consumer: si, el draft por si solo ocupa muy poca VRAM; el limitante es Qwen3-8B, que en bf16 requiere unos 16 GB y puede caber en RTX 4090 (24 GB) o RTX 3090 (24 GB) con margen ajustado para contexto y batch.
- Opciones de despliegue: SGLang es la via soportada (bloque `Qwen3MoeDSparkModel`, requiere el PR sgl-project/sglang#47181). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles de forma absoluta; el indicador indirecto es la walk accept length de 5,20 en la quinta epoca, que implica una media de aproximadamente 5,2 tokens aceptados por paso de verificacion en los datos de validacion del entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B DSpark MoE 8x1536 top-2 (este) | ~0,48B totales / ~0,26B activos | No disponible (entrenado a 8192) | Draft MoE top-2 para Qwen3-8B | No disponible | Hugging Face, 5 checkpoints |
| qwen3-8b-dspark-moe-batch-wise-0.005-selection-bias-only-5epoch (top-1, mismo autor) | No disponible | No disponible | Draft MoE top-1, misma receta | No disponible | Hugging Face |
| Drafts EAGLE-3 para modelos de ~8B | No disponible | No disponible | Draft denso con entrenamiento multi-capa | No disponible | Ecosistema SGLang/vLLM |

La informacion disponible no permite comparar rendimiento numerico entre estas alternativas; solo se confirma que la variante top-1 del mismo autor existe y comparte receta de entrenamiento.

## Limitaciones y advertencias

- El modelo es exclusivamente un draft de decodificacion especulativa: no puede usarse de forma autonoma para generar texto, y su salida debe verificarse siempre contra Qwen3-8B.
- Requiere una version de SGLang que incluya el PR sgl-project/sglang#47181 para servir el bloque `Qwen3MoeDSparkModel`; sin ella, el sesgo de seleccion no se aplica correctamente en la seleccion top-k y el serving no reproduce el entrenamiento.
- El sesgo de seleccion por experto debe aplicarse en la seleccion top-k durante el serving; omitirlo degrada la correspondencia con el entrenamiento.
- La licencia no esta declarada en la informacion disponible, por lo que el uso comercial no puede confirmarse.
- Los idiomas soportados no estan declarados; las capacidades linguisticas dependen del modelo objetivo Qwen3-8B y de su tokenizer.
- Entrenado con respuestas regeneradas por Qwen3-8B con thinking off y temperatura 0, por lo que puede tener menor cobertura en distribuciones de texto muy distintas al dataset Open Perfect Blend.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion externa por parte de la comunidad.
- No se han publicado benchmarks estandar ni comparaciones con otros drafts, lo que limita la evaluacion objetiva de su calidad frente a alternativas.
- Riesgo de sesgos y alucinacion: inherente al modelo objetivo; el draft puede proponer tokens sesgados o incorrectos, aunque la verificacion del objetivo mitiga su impacto en la salida final.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yushengsu/qwen3-8b-dspark-moe-8expert-2activate-batch-wise-0.005-selection-bias-only-5epoch
- Variante top-1 del mismo autor: https://huggingface.co/yushengsu/qwen3-8b-dspark-moe-batch-wise-0.005-selection-bias-only-5epoch
- Modelo objetivo Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Rama de entrenamiento SpecForge: https://github.com/yushengsu-thu/SpecForge/tree/exp/qwen3-8b-dspark-moe-8expert-2activate-selection-bias
- Repositorio SpecForge del autor: https://github.com/yushengsu-thu/SpecForge
- PR de SpecForge con la receta: https://github.com/sgl-project/SpecForge/pull/1003
- PR de configuracion en el fork del autor: https://github.com/yushengsu-thu/SpecForge/pull/12
- PR de SGLang para el bloque de serving: https://github.com/sgl-project/sglang/pull/47181
