# strangehuman/voltron-1.1-mini-abliterated

## Resumen

Voltron-1.1 Mini Abliterated es una derivada experimental del modelo `Akahsizrr/voltron-1.1-mini`, que a su vez es un fine-tune de `LiquidAI/LFM3-1.7B`. La modificacion principal consiste en una ablacion de direccion (direction ablation) aplicada sobre las proyecciones de salida del bloque MLP en las 24 capas del decoder, con el objetivo de suprimir el circuito de rechazo (refusal) aprendido durante el alineamiento. El resultado se distribuye unicamente en formato GGUF Q4_K_M, lo que reduce el artefacto a aproximadamente 1,25 GB y lo hace apto para inferencia local.

El modelo conserva la arquitectura LFM3 de Liquid AI con aproximadamente 1.990.945.600 parametros almacenados y una dimension de representacion de 2048. La ablacion se calculo siguiendo el resultado de Arditi et al. (2024) segun el cual la decision de rechazar una peticion se representa como una direccion aproximadamente lineal en el residual stream; el autor estimo esa direccion con 32 pares de instrucciones daninas y 32 benignas, descarto las capas 0-4 por ruido de muestreo y extrajo el vector singular dominante de la matriz de contrastes de las 19 capas restantes.

La relevancia de esta ficha es doble: por un lado documenta un artefacto de investigacion sobre mecanismos de rechazo y su supresion; por otro, advierte explicitamente de que no es un asistente de produccion. El autor declara que los pesos pueden cumplir instrucciones daninas y que ni la cuantizacion ni la ablacion preservan el comportamiento del modelo base, por lo que no se reclaman cifras de benchmarks del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only LFM3 (`Lfm3ForCausalLM`), SwiGLU en MLP, 24 capas, dimension 2048 |
| Parametros totales | 1.990.945.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (ventana usada en la prueba de humo con `-c 8192`) |
| Tipos de cuantizacion | GGUF Q4_K_M (K-quant con precision mixta por bloque); el checkpoint intermedio es F16 GGUF |
| Idiomas soportados | no disponible |
| Licencia | `lfm1.0` (campo `license: other`, `license_name: lfm1.0`) |
| Formato de pesos | GGUF (Q4_K_M); repositorio de 2,5 GB |

## Arquitectura y entrenamiento

La base es LFM3 de Liquid AI, un transformer decoder-only con 24 capas, dimension oculta de 2048 y MLP SwiGLU compuesto por `w1`/`w3` (up/gate) y `w2` (down, 7680 a 2048). El modelo intermedio `Akahsizrr/voltron-1.1-mini` es un fine-tune sobre `LiquidAI/LFM3-1.7B`; no se dispone de informacion sobre el volumen de tokens, la composicion del dataset ni si hubo RLHF o DPO en ese fine-tune.

La innovacion tecnica de esta release es el procedimiento de ablacion. Para cada capa se capturaron activaciones en la ultima posicion del prompt con `enable_thinking=False`, se calcularon contrastes por capa, se descartaron las capas con norma L2 menor o igual a 0,3 (capas 0-4) y se apilo la matriz de 19 contrastes sin normalizar para dar mas peso a las capas profundas. La SVD delgada proporciono el vector singular derecho dominante, que se uso para proyectar los pesos fuera del subespacio de rechazo: `W' = (I - alpha * d d^T / (d^T d)) W`, calculado en FP32 y reconvertido a BF16. La variante v1 usa alpha=1.0 y proyecta `feed_forward.w2` en las 24 capas; la variante v2 usa alpha=1.5 y anade `self_attn.o_proj` en 11 capas. Posteriormente se convirtio a F16 GGUF con `convert_hf_to_gguf.py` y se cuantizo a Q4_K_M con `llama-quantize`. El vector de direccion se publica como `refusal_direction.npy` (float32, 2048 dimensiones) junto con `ablation_info_v1.json` y `ablation_info_v2.json` para reproducibilidad.

## Capacidades

- Generacion de texto conversacional con plantilla ChatML nativa preservada en los metadatos del GGUF.
- Razonamiento con traza interna (thinking mode) activable o desactivable mediante `enable_thinking`; la ablacion v1 depende de si el razonamiento esta activo.
- Generacion de codigo, segun los tags del repositorio (`code`).
- Recuperacion de informacion en contexto largo: en la prueba de humo recupero un codigo colocado al inicio de un prompt de 7541 tokens.
- Seguimiento de instrucciones neutras: tareas de explicacion produjeron respuestas correctas y bien formadas en ambas variantes.
- Capacidades multilingues: no disponible.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada; el modelo dispone de traza de razonamiento interna.
- Vision y audio: no disponibles.

## Casos de uso

- Investigacion de mecanismos de rechazo: el modelo permite estudiar como se representa la negativa a responder en el residual stream, comparando las variantes v1 y v2 y correlacionando con el vector `refusal_direction.npy` publicado.
- Analisis de robustez de alineamiento: util para evaluar hasta que punto una proyeccion de rango 1 por capa altera el comportamiento de seguridad sin reentrenar, y para medir el coste en calidad de las tecnicas de ablacion.
- Inferencia local en equipos con poca VRAM: el artefacto Q4_K_M de aproximadamente 1,25 GB cabe en GPUs de consumo y permite experimentar con un modelo de 1,99B parametros sin infraestructura dedicada.
- Pruebas de recuperacion en contexto largo: con una ventana de 8192 tokens y un rendimiento medido de aproximadamente 198 t/s en preprocesamiento de prompt, sirve para validar pipelines de RAG de documentos medianos en local.
- Evaluacion comparativa de cuantizacion: el par F16 GGUF / Q4_K_M permite medir la degradacion introducida por la cuantizacion K-quant en un modelo pequeno.
- Docencia y divulgacion sobre seguridad en IA: como artefacto controlado para explicar la diferencia entre alineamiento por RLHF y supresion post-hoc de direcciones, con las salvaguardas adecuadas.
- Generacion de codigo en local para prototipado: el tag `code` y el bajo requisito de memoria lo hacen util para borradores en entornos sin conexion, siempre con revision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no reclama las cifras del modelo base porque tanto la cuantizacion como la ablacion alteran el comportamiento. La unica medicion disponible es una prueba de humo local con llama.cpp b12681, contexto de 8192, offload completo, decodificacion greedy (`--temp 0`) y razonamiento nativo desactivado (`-rea off`):

| Metrica | v1 (alpha=1.0) | v2 (alpha=1.5) |
|---|---|---|
| Procesamiento de prompt (7541 tokens) | ~198 t/s | ~196 t/s |
| Generacion | ~34 t/s | ~32 t/s |
| Recuperacion en contexto largo (ZEBRA-7391) | correcta | correcta |
| Seguimiento de instrucciones neutras | correcto y bien formado | correcto, notablemente mas telegrafico |
| Sonda con prompt sensible y razonamiento desactivado | continuaciones coherentes | continuaciones genericas y en parte incorrectas |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,25 GB para el artefacto Q4_K_M, mas la cache KV dimensionada para la ventana configurada (8192 tokens en la prueba de humo).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q4_K_M con contexto moderado; el autor realizo la prueba con offload completo en llama.cpp.
- Cabe en GPU de consumo: si, en tarjetas tipo RTX 3060, RTX 4060 o superiores; tambien en iGPU con suficiente memoria compartida, aunque con menor throughput.
- Opciones de despliegue: llama.cpp (probado con el build b12681); el formato GGUF es compatible con Ollama y con otros runners GGUF, aunque no se documenta su uso en la informacion disponible. vLLM y TGI no estan verificados para este artefacto.
- Latencia y throughput estimados: aproximadamente 34 t/s de generacion y 198 t/s de procesamiento de prompt en la configuracion descrita; no se especifica el hardware exacto empleado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| strangehuman/voltron-1.1-mini-abliterated | 1,99B | 8192 (verificado) | GGUF Q4_K_M | lfm1.0 | Ablacion de rechazo, artefacto de investigacion |
| Akahsizrr/voltron-1.1-mini | no disponible | no disponible | no disponible | no disponible | Modelo base del que deriva esta release |
| LiquidAI/LFM3-1.7B | ~1,7B (nominal) | no disponible | no disponible | no disponible | Modelo original de Liquid AI sobre el que se hizo el fine-tune |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada; el autor no publica benchmarks y advierte que la ablacion y la cuantizacion cambian el comportamiento respecto al base.

## Limitaciones y advertencias

- El circuito de rechazo ha sido suprimido deliberadamente: los pesos pueden cumplir instrucciones daninas. No debe desplegarse como asistente de produccion ni exponerse a usuarios finales sin filtros externos.
- La ablacion v1 depende de si el razonamiento esta activado; con thinking habilitado el rechazo puede reaparecer en la traza interna. La variante v2 suprime el rechazo incluso con razonamiento, pero degrada la calidad de los procedimientos generados.
- La ablacion v2 elimina senal util al proyectar las salidas de atencion, lo que produce respuestas genericas o parcialmente incorrectas; el autor recomienda v1.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; al tratarse de un modelo de 1,99B parametros y cuantizado a 4 bits, es esperable una mayor tasa de errores factuales que en modelos mayores.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Idiomas soportados: no disponibles; no se garantiza un rendimiento multilingue mas alla de lo que ofreciera el modelo base.
- Restricciones de licencia: la licencia `lfm1.0` es la del modelo original de Liquid AI; debe revisarse el archivo `LICENSE` del repositorio antes de cualquier uso comercial, ya que el campo `license: other` no aclara por si solo los terminos.
- El repositorio registra 0 descargas y 1 like en el momento de la consulta: es un artefacto reciente y sin validacion comunitaria independiente.
- El modelo se distribuye unicamente en GGUF Q4_K_M; no hay safetensors publicados en este repositorio, lo que limita el reentrenamiento o la ablacion adicional a partir de estos pesos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/strangehuman/voltron-1.1-mini-abliterated
- Modelo base del fine-tune: https://huggingface.co/Akahsizrr/voltron-1.1-mini
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM3-1.7B
- Referencia metodologica citada por el autor: Arditi et al., 2024, "Refusal in Language Models Is Mediated by a Single Direction" (no se proporciona URL en la informacion disponible)
- Herramientas de conversion y cuantizacion: `convert_hf_to_gguf.py` y `llama-quantize` de llama.cpp (no se proporciona URL en la informacion disponible)
