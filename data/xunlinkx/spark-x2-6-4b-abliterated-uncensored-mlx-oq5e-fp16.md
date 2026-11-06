# xunlinkx/Spark-X2.6-4B-Abliterated-Uncensored-MLX-oQ5e-fp16

## Resumen
Spark-X2.6-4B-Abliterated-Uncensored-MLX-oQ5e-fp16 es una cuantizacion en formato MLX del modelo comunitario electroglyph/Spark-X2.6-4B-uncensored, que a su vez deriva del modelo oficial XHToken/Spark-X2.6-4B desarrollado por el equipo SparkLLM de XHToken. La publica el usuario xunlinkx y su proposito es ofrecer una version de 4.112 millones de parametros con comportamiento reducido de rechazo (abliterated/uncensored) optimizada para ejecucion en Apple Silicon mediante MLX y oMLX.

El checkpoint aplica una cuantizacion mixta de 5 bits con capas selectivas en 6 y 8 bits, partiendo de pesos FP16 convertidos desde BF16. El resultado ocupa 3,0 GB en el repositorio, lo que lo situa como una opcion de compromiso entre tamano de descarga y precision de pesos para equipos Mac con memoria unificada.

Es relevante ahora porque el ecosistema MLX permite desplegar modelos conversacionales de 4B en hardware de consumo Apple sin GPU dedicada, y porque la variante abliterated elimina parte de las capas de rechazo del modelo original, un aspecto que interesa a investigadores que estudian alineamiento, robustez y comportamiento de modelos. La licencia Apache-2.0 heredada facilita su uso y modificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | spark2_5 (transformer, segun la arquitectura declarada en config.json) |
| Parametros totales | 4.112.079.360 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 5 bits mixta (base 5-bit, gates de atencion 8-bit, proyecciones Q/K/V fusionadas y down de MLP 6-bit), grupo 64, cuantizacion afin |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), repo de 3,0 GB |

## Arquitectura y entrenamiento
La arquitectura declarada es `spark2_5`, un transformer con atencion que incluye compuertas de atencion (`self_attn.g_proj`) en las 36 capas del modelo. El checkpoint es una cuantizacion, no un entrenamiento nuevo: parte del checkpoint BF16 de electroglyph/Spark-X2.6-4B-uncensored, lo convierte a FP16 y aplica cuantizacion mejorada de oMLX con 128 muestras de calibracion, longitud de secuencia 512 y cuantizacion afin con grupo de 64. El layout por capa queda embebido en `config.json`.

El modelo base uncensored fue producido con Heretic 2.0.0.dev0 Arbitrary-Rank Ablation (ARA), una tecnica de abliteracion que modifica los pesos para reducir la tasa de rechazo. La model card del autor fuente reporta 6 rechazos en 100 prompts y una divergencia KL de 0,0027 frente al modelo original; estas son mediciones del autor del modelo fuente y no han sido verificadas de forma independiente en este checkpoint cuantizado. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades
- Generacion de texto conversacional en ingles y chino.
- Razonamiento multi-turno segun el pipeline de text-generation declarado.
- Comportamiento abliterated/uncensored: menor tasa de rechazo que el modelo original, segun las mediciones del autor fuente.
- Compatibilidad con el runtime MLX-LM y oMLX en Apple Silicon (M1 a M6).
- Soporte de plantilla de chat y ajustes de presupuesto de pensamiento segun el runtime, referenciados a la model card upstream.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso
- Investigacion sobre alineamiento y abliteracion: el checkpoint permite estudiar como la eliminacion de direcciones de rechazo afecta al comportamiento del modelo, comparando con el original XHToken/Spark-X2.6-4B con la misma arquitectura y plantilla.
- Despliegue local en Mac: con 3,0 GB y un pico de memoria de 3,185 GB medido en una prueba de humo, cabe en equipos Apple Silicon de memoria unificada moderada y permite inferencia sin GPU dedicada mediante MLX-LM.
- Prototipado conversacional en ingles y chino: util para construir asistentes bilingues de demostracion donde se prioriza la velocidad de iteracion sobre la precision de un modelo mayor.
- Generacion de texto creativo sin restricciones de rechazo: orientado a escritura de ficcion o guiones donde el modelo original podria declinar peticiones, con moderacion propia por parte del operador.
- Evaluacion de cuantizacion: sirve como caso de estudio de cuantizacion mixta por capas (5/6/8 bits) y su impacto en calidad frente al checkpoint BF16 de origen.
- Pipelines de investigacion en entornos Apple: integrable en scripts de MLX-LM para generacion por lotes con temperatura 1.0 y top-p 0.95, los valores recomendados por la model card upstream.
- Base para fine-tuning ligero en MLX: al ser Apache-2.0 y formato safetensors, puede adaptarse con LoRA en hardware Apple para dominios concretos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La unica medicion objetiva es una prueba de humo local: 24 tokens generados con un pico de memoria de 3,185 GB reportado por MLX, que confirma carga y generacion basicas pero no constituye una evaluacion de calidad.

## Requisitos de hardware
- VRAM/memoria estimada: aproximadamente 3,0 GB de pesos mas overhead del runtime; pico medido de 3,185 GB en la prueba de humo.
- Hardware objetivo: Apple Silicon M1 a M6 con MLX; los pesos derivados de FP16 se indican como adecuados en M3 y posteriores.
- GPU dedicadas (A100, H100, RTX 4090): no disponibles; el formato MLX esta pensado para Apple Silicon, no para CUDA.
- Cabe en GPU de consumo: si, en equipos Apple con memoria unificada suficiente; no se documenta soporte para GPU consumer NVIDIA.
- Despliegue: MLX-LM y oMLX con soporte de la arquitectura `spark2_5`; vLLM, llama.cpp, Ollama y TGI no se mencionan como soportados.
- Latencia y throughput: no disponibles; solo se conoce el pico de memoria de la prueba de humo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-4B-Abliterated-Uncensored-MLX-oQ5e-fp16 | 4,11B | no disponible | Apache-2.0 | MLX safetensors 5-bit mixto | Cuantizacion comunitaria para Apple Silicon |
| electroglyph/Spark-X2.6-4B-uncensored | 4,11B (estimado por herencia) | no disponible | Apache-2.0 | BF16 | Modelo fuente abliterated con Heretic ARA |
| XHToken/Spark-X2.6-4B | 4,11B (estimado por herencia) | no disponible | Apache-2.0 | no disponible | Modelo oficial original de SparkLLM |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada; la unica diferencia documentada es la tasa de rechazo reportada por el autor fuente (6/100) y la divergencia KL de 0,0027 frente al original.

## Limitaciones y advertencias
- El checkpoint no ha sido evaluado de forma independiente en el conjunto de rechazo del modelo fuente; las cifras de abliteracion son declaraciones del autor de electroglyph/Spark-X2.6-4B-uncensored.
- El comportamiento uncensored implica menor filtrado de contenido; el operador debe aportar su propia moderacion, control de acceso y revision si expone el modelo a terceros.
- Riesgo de alucinacion inherente a modelos de 4B; no se documentan evaluaciones de fidelidad factual.
- Idiomas limitados a ingles y chino; el castellano no figura como idioma soportado.
- Longitud de contexto no documentada, lo que dificulta planificar casos de uso con ventanas largas.
- Requiere versiones actuales de oMLX o MLX-LM con soporte de la arquitectura `spark2_5`; no es portable a runtimes CUDA sin conversion.
- Licencia Apache-2.0 heredada de la linea upstream; conviene verificar los terminos del modelo oficial XHToken/Spark-X2.6-4B antes de uso comercial.
- Modelo comunitario sin publicacion oficial de XHToken; no debe presentarse como release oficial del equipo SparkLLM.
- Solo 52 descargas y 0 likes en el momento de la consulta, lo que indica escasa validacion por parte de la comunidad.

## Enlaces
- Hugging Face del checkpoint: https://huggingface.co/xunlinkx/Spark-X2.6-4B-Abliterated-Uncensored-MLX-oQ5e-fp16
- Modelo fuente uncensored: https://huggingface.co/electroglyph/Spark-X2.6-4B-uncensored
- Modelo oficial: https://huggingface.co/XHToken/Spark-X2.6-4B
- Repositorio oficial del proyecto: https://github.com/XHToken/Spark-X2.6
