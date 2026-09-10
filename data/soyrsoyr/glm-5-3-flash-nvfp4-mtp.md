# soyrsoyr/GLM-5.3-Flash-NVFP4-MTP

## Resumen

GLM-5.3-Flash-NVFP4-MTP es un checkpoint cuantizado publicado por el usuario soyrsoyr a partir de dos modelos existentes: conserva el backbone en NVFP4 de RedHatAI/GLM-5.3-Flash-NVFP4 y sustituye su capa MTP (multi-token prediction) en FP8 por una capa MTP cuantizada en NVFP4, generada desde los pesos originales de zai-org/GLM-5.3-Flash. No es un modelo entrenado desde cero, sino una variante de despliegue orientada a reducir el coste de memoria y a mantener la decodificacion especulativa en el mismo formato de 4 bits que el resto de la red.

El modelo tiene 321.323.031.390 parametros (unos 321,3 mil millones) segun los safetensors del repositorio, que ocupa 202,3 GB. La receta de cuantizacion y los nombres de las capas (mlp.experts, self_attn.indexer, tensores visuales) indican una arquitectura transformer con mezcla de expertos (MoE), atencion con indexador y torre de vision, integrada en el pipeline image-text-to-text, es decir, un modelo multimodal conversacional. El detalle de parametros activos, longitud de contexto, idiomas y licencia no esta publicado en la informacion disponible.

Su relevancia es practica: permite servir un modelo multimodal de escala frontier con decodificacion especulativa MTP cuantizada a 4 bits, algo que hasta ahora obligaba a mezclar precisión FP8/BF16 en la parte especulativa y penalizaba el ahorro de memoria. La ficha incluye la receta YAML exacta, el script de cuantizacion con llm-compressor y una linea de comandos de vLLM con tensor-parallel 4 y cinco tokens especulativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE), torre de vision, indexador de atencion y capa MTP (multi-token prediction). Detalle completo no disponible |
| Parametros totales | 321.323.031.390 (safetensors del repo) |
| Parametros activos | no disponible (la presencia de `mlp.experts` indica MoE, pero no se publica el ratio de activacion) |
| Longitud de contexto | no disponible (la calibracion se hizo con `max_seq_length: 4096`, que no equivale a la ventana de contexto del modelo) |
| Tipos de cuantizacion | NVFP4 en backbone y en MTP (pesos FP4 simetricos, `group_size: 16`, estrategia `tensor_group`, escalas en `torch.float8_e4m3fn`); BF16 en atencion MTP, router, fusion, normalizacion y shared head; el MTP es weight-only (activaciones sin cuantizacion estatica) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (incluye `model_mtp.safetensors`), formato compressed-tensors; compatible con transformers y vLLM |
| Tamano del repositorio | 202,3 GB |
| Modelos base | RedHatAI/GLM-5.3-Flash-NVFP4 y zai-org/GLM-5.3-Flash |
| Fecha de publicacion | 10 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El checkpoint no ha sido entrenado: es un derivado de cuantizacion. El backbone NVFP4 se hereda intacto de RedHatAI/GLM-5.3-Flash-NVFP4, y la unica modificacion estructural es la capa MTP, reemplazada por una version cuantizada a NVFP4 construida desde zai-org/GLM-5.3-Flash. En el MTP, las proyecciones de expertos y de expertos compartidos se empaquetan en NVFP4, mientras que la atencion MTP, el router, la fusion, la normalizacion y los tensores del shared head permanecen en BF16. La cuantizacion del MTP es exclusivamente de pesos, porque transformers no construye el modulo MTP durante la fase de calibracion.

La receta (`recipe.yaml`) aplica `QuantizationModifier` a las capas `Linear` que casan con `.*mlp\.experts\..*(gate|up|down)_proj$`, con pesos FP4 simetricos en grupos de 16 y escalas FP8 E4M3 (`memoryless_minmax`), y activaciones de entrada FP4 con estrategia dinamica local (`static_minmax`). Quedan excluidos de la cuantizacion los tensores visuales, `lm_head`, `mlp.gate` y `self_attn.indexer`, lo que confirma la existencia de un codificador de vision, un router de MoE y un indexador de atencion en precision alta. La calibracion se ejecuta con 512 muestras, `max_seq_length=4096` y `moe_calibrate_all_experts=True`; despues, `mtp_scheme="NVFP4"` aplica cuantizacion de pesos sin calibracion sobre la capa MTP no cargada. La validacion reportada incluye 867 proyecciones MTP empaquetadas en NVFP4, 18 pesos MTP retenidos en BF16 por la politica de la arquitectura GLM, 2.623 tensores MTP indexados en `model_mtp.safetensors`, ausencia de escalas inversas FP8 nativas obsoletas y escalas globales NVFP4 finitas y positivas.

## Capacidades

- Generacion de texto y dialogo conversacional multi-turno (tag `conversational`).
- Procesamiento de imagen y texto de forma conjunta (pipeline `image-text-to-text`), con torre de vision integrada que no se cuantiza en esta receta.
- Razonamiento explicito: la configuracion de vLLM usa `--reasoning-parser glm45`, lo que implica un modo de pensamiento con trazas separables de la respuesta final.
- Llamada a herramientas y function calling: `--tool-call-parser glm47` y `--enable-auto-tool-choice`.
- Flujos de agente y razonamiento multi-paso, apoyados en tool calling y en decodificacion especulativa.
- Decodificacion especulativa MTP con cinco tokens candidatos (`num_speculative_tokens: 5`), integrada en el mismo formato NVFP4 que el backbone.
- Inferencia eficiente en memoria sobre pesos de 4 bits con compressed-tensors y vLLM.
- Capacidades multilingues: no disponible.

## Casos de uso

- Despliegue on-premise de un modelo multimodal de gran escala: con pesos NVFP4 el modelo ocupa aproximadamente la mitad que una version BF16 equivalente, lo que permite servirlo en un nodo de 4 GPU en lugar de necesitar 8, manteniendo vision y razonamiento.
- Analisis documental con imagenes (facturas, informes, planos): el pipeline image-text-to-text permite extraer texto y estructura de documentos escaneados y encadenar el resultado con tool calling para volcar los datos a un sistema interno.
- Agentes autonomos con acceso a herramientas: el parser de tool calling `glm47` y el modo de razonamiento permiten planificar varios pasos, invocar APIs y revisar resultados intermedios antes de responder.
- Asistencia tecnica de segundo nivel: conversaciones multi-turno sobre documentacion compleja combinando capturas de pantalla del usuario con texto, con el modelo citando la parte relevante del manual.
- Generacion y revision de codigo en pipelines de CI: el modelo puede generar parches, explicar errores de compilacion a partir de un log y llamar a herramientas de lint o test mediante function calling.
- Inspeccion visual automatizada: clasificacion y descripcion de imagenes (defectos en linea de produccion, imagenes medicas o de satelite) con justificacion textual del criterio, gracias a la torre de vision sin cuantizar.
- Servicio de inferencia de baja latencia: la capa MTP en NVFP4 permite mantener decodificacion especulativa con 5 tokens por paso sin subir la precision de esa parte de la red, util en asistentes interactivos donde importa el tiempo hasta el primer token util.
- Evaluacion comparativa de tecnicas de cuantizacion: sirve como referencia reproducible para medir el impacto de cuantizar la cabeza especulativa frente a dejarla en FP8 o BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: 321,3 mil millones de parametros a 4 bits suponen unos 161 GB solo de pesos cuantizados; sumando tensores en BF16 (vision, `lm_head`, router, normalizacion, indexador) y escalas, el uso realista de VRAM para pesos se situa en el entorno de 175-195 GB.
- Espacio en disco: el repositorio ocupa 202,3 GB.
- Configuracion de referencia: vLLM con `--tensor-parallel-size 4` y `--gpu-memory-utilization 0.85`, es decir 4 GPU de 80 GB (H100, H200, A100 80 GB o B200) como minimo practico, con 320 GB agregados.
- GPU de gama alta recomendadas: H100/H200 80 GB x4 o B200 para aprovechar kernels NVFP4; es necesario verificar el soporte efectivo de NVFP4 en la generacion de GPU objetivo, ya que en arquitecturas sin soporte nativo de FP4 puede requerirse de-cuantizacion y perderse la ventaja de memoria.
- GPU de consumo: no cabe en ninguna GPU de consumo actual (24-32 GB); haria falta al menos 3 GPU de 80 GB o 2 de 96 GB para los pesos, antes de contar cache KV. No es desplegable en una RTX 4090 o similar.
- Opciones de despliegue: vLLM con tensor-parallel y `--speculative-config '{"method":"mtp","num_speculative_tokens":5}'`; el formato compressed-tensors tambien es consumible desde el ecosistema de llm-compressor. Los flags `--no-enable-flashinfer-autotune` y `--disable-custom-all-reduce` aparecen en la configuracion publicada.
- Latencia y throughput: no disponible. La ganancia esperada proviene de la decodificacion especulativa con MTP en NVFP4, pero no se publican medidas de tokens por segundo ni de tasa de aceptacion.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion (backbone / MTP) | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| soyrsoyr/GLM-5.3-Flash-NVFP4-MTP | 321.323.031.390 | NVFP4 / NVFP4 (weight-only) | no disponible | no disponible | HuggingFace, 0 descargas |
| RedHatAI/GLM-5.3-Flash-NVFP4 | no disponible (derivado del mismo modelo base) | NVFP4 / FP8 por bloques | no disponible | no disponible | HuggingFace |
| zai-org/GLM-5.3-Flash | no disponible | original sin cuantizar (presumiblemente BF16) | no disponible | no disponible | HuggingFace |

La unica diferencia verificable entre los tres checkpoints es el formato de la capa MTP: FP8 por bloques en la version de RedHatAI, NVFP4 con pesos cuantizados y activaciones sin cuantizar en esta variante, y precision original en el modelo de zai-org. No se dispone de datos de rendimiento que permitan comparar calidad o velocidad entre ellos. No se han identificado en la informacion proporcionada otros modelos comparables de la misma categoria.

## Limitaciones y advertencias

- Licencia no publicada en el repositorio: no se puede confirmar si el uso comercial esta permitido. Es imprescindible revisar la licencia de los modelos base (zai-org/GLM-5.3-Flash y RedHatAI/GLM-5.3-Flash-NVFP4) antes de cualquier despliegue en produccion.
- Es un derivado de cuantizacion, no un modelo validado de forma independiente: no hay benchmarks, evaluaciones de calidad ni comparaciones frente al modelo sin cuantizar.
- Riesgo de degradacion especifica en la capa MTP: al ser cuantizacion de pesos sin calibracion de activaciones, la tasa de aceptacion de la decodificacion especulativa puede caer respecto a la version FP8, lo que reduciria la ganancia de latencia sin afectar necesariamente a la calidad del texto generado.
- Cero descargas y cero likes en el momento de la consulta: sin validacion de la comunidad. Conviene reproducir la receta y verificar la coherencia de los pesos antes de usarlo.
- El tag `8-bit` del repositorio no concuerda con una cuantizacion NVFP4 de 4 bits; probablemente sea un metadato automatico poco fiable.
- La calibracion se realizo con 512 muestras y 4096 tokens de longitud, por lo que el comportamiento fuera de esa distribucion (contextos muy largos, idiomas no representados en el conjunto de calibracion) no esta verificado.
- Sesgos conocidos: no disponible. Al no publicarse la composicion del dataset de entrenamiento del modelo base, no se puede evaluar el sesgo.
- Riesgo de alucinacion: inherente a los modelos generativos de esta escala; no hay evaluaciones de fidelidad publicadas para este checkpoint.
- Limitaciones de contexto e idioma: no disponible. No se debe asumir soporte de contextos largos a partir del valor 4096 usado en calibracion.
- Requisito de hardware elevado: 4 GPU de 80 GB como configuracion de referencia; no es viable en infraestructura de gama de consumo.
- El soporte NVFP4 depende de la generacion de GPU y de la version de vLLM; conviene fijar versiones de vLLM, transformers y llm-compressor para garantizar reproducibilidad.
- Fecha de creacion en 2026 y ausencia de publicaciones asociadas: no hay articulo, informe tecnico ni evaluacion de terceros que respalde las cifras de validacion declaradas por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/soyrsoyr/GLM-5.3-Flash-NVFP4-MTP
- Modelo base cuantizado: https://huggingface.co/RedHatAI/GLM-5.3-Flash-NVFP4
- Modelo base original: https://huggingface.co/zai-org/GLM-5.3-Flash
- Repositorio de llm-compressor: https://github.com/vllm-project/llm-compressor
- Pull request de soporte de cuantizacion MTP: https://github.com/vllm-project/llm-compressor/pull/3118
- Documentacion de vLLM: https://docs.vllm.ai
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces obtenidos corresponden a foros de television y no guardan relacion con el contenido de esta ficha.
