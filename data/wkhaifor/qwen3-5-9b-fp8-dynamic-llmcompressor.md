# wkhaifor/Qwen3.5-9B-FP8-Dynamic-LLMCompressor

## Resumen

Qwen3.5-9B-FP8-Dynamic-LLMCompressor es una version cuantizada en FP8 dinamico del modelo multimodal Qwen3.5-9B de Alibaba Qwen, publicada por el usuario wkhaifor. Se trata de un checkpoint derivado que no introduce cambios arquitectonicos: aplica cuantizacion FP8 dinamica sobre las capas lineales del bloque de lenguaje y conserva en precision flotante el codificador visual, las capas de atencion lineal, la cabeza de salida (`lm_head`) y el resto de componentes no objetivo. El resultado es un modelo de 9.653.104.368 parametros con un repositorio de 14 GB, frente al peso en BF16 del modelo base.

La relevancia de esta ficha es practica: permite desplegar un modelo image-text-to-text de ~9,6B en GPUs de consumo con requisitos de memoria sensiblemente reducidos, manteniendo las capacidades de razonamiento, generacion de codigo y comprension de imagenes del original. La cuantizacion se realizo con llm-compressor 0.14.0 y se serializo en formato compressed-tensors 0.19.0, lo que condiciona las herramientas de inferencia compatibles.

El autor documenta un proceso de reconstruccion reproducible (scripts, receta de cuantizacion, sumas SHA256 y auditoria de artefactos) y valida el modelo con Transformers en FP16 y con vLLM 0.32.0 usando kernels CUTLASS FP8. La validacion publicada se limita a ocho ejemplos de generacion de texto corto, por lo que no hay evidencia publica de rendimiento en tareas multimodales ni en benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5), con atencion lineal en capas seleccionadas y modulo MTP (multi-token prediction); derivado cuantizado en FP8 |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el ejemplo de vLLM usa `max_model_len=4096` |
| Tipos de cuantizacion | FP8 dinamico (`FP8_DYNAMIC`): pesos con escala estatica por canal de salida, activaciones con escala dinamica por token; 128 capas lineales del bloque de lenguaje cuantizadas |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors en formato compressed-tensors 0.19.0; 7 shards principales mas 1 shard MTP; 13.045 GiB de pesos |

## Arquitectura y entrenamiento

El checkpoint no entrena desde cero: es una cuantizacion post-entrenamiento del modelo base Qwen/Qwen3.5-9B, reconstruido a partir del commit upstream `460979c3d11864dd16408d860ac930a360a2fac2`. La receta `FP8_DYNAMIC` de llm-compressor 0.14.0 se aplica a 128 capas lineales del tower de lenguaje; los pesos usan escalas estaticas por canal de salida y las activaciones se escalan dinamicamente por token. Quedan en precision flotante el modulo `visual`, las capas `linear_attn`, `lm_head` y cualquier capa fuera del conjunto objetivo, mientras que la KV cache mantiene la configuracion por defecto del motor de inferencia.

La arquitectura subyacente combina atencion estandar con capas de atencion lineal y un modulo MTP (multi-token prediction), del que se conservan 15 tensores verificados como identicos byte a byte al modelo base. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original. La innovacion tecnica de esta publicacion es la trazabilidad: se incluyen `BASE_PROVENANCE.json`, `recipe.yaml`, `SHA256SUMS`, un directorio `reproducibility/` con entorno y lista de modulos objetivo, y un directorio `validation/` con auditoria de artefactos, registro de recarga en Transformers y pruebas funcionales en vLLM.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat propia y soporte de modo thinking desactivable (`enable_thinking=False`).
- Entrada image-text-to-text: el pipeline declarado es `image-text-to-text`, aunque el modulo visual se conserva en precision flotante y la validacion publicada solo cubre texto.
- Razonamiento y generacion de codigo, heredados del modelo base Qwen3.5-9B (no se aportan metricas en esta publicacion).
- Inferencia con decodificacion multi-token prediction (MTP) potencial, dado que el shard MTP se conserva intacto.
- Capacidades multilingues limitadas a ingles y chino segun los metadatos del modelo.
- No se documenta soporte explicito de tool calling, function calling ni flujos de agente en la informacion disponible.

## Casos de uso

- Asistente conversacional autoalojado: el modelo puede atender dialogos multi-turno en ingles y chino con un coste de VRAM inferior al del checkpoint BF16, adecuado para equipos con una sola GPU de 24 GB.
- Generacion de codigo en pipelines internos: al ser un derivado de Qwen3.5-9B, sirve para autocompletado y explicacion de codigo; conviene validar la calidad tras la cuantizacion con el propio corpus antes de produccion.
- Procesamiento de documentos con imagen: el pipeline image-text-to-text permite extraer y resumir informacion de capturas, diagramas o formularios, siempre que se verifique el comportamiento del modulo visual en FP16.
- Clasificacion y extraccion de entidades por lotes: con `max_num_seqs` ajustado y prefix caching desactivado, el modelo es util para tareas de etiquetado masivo donde prima el throughput sobre la latencia.
- Prototipado de agentes con razonamiento en modo thinking: la plantilla de chat permite activar o desactivar la cadena de pensamiento segun el coste computacional aceptable.
- Entornos de investigacion reproducibles: los scripts de cuantizacion y las sumas de verificacion permiten replicar el checkpoint y auditar su procedencia, util para estudios de cuantizacion FP8.
- Despliegue en infraestructura con vLLM: la integracion documentada con vLLM 0.32.0 y kernels CUTLASS FP8 facilita servir el modelo mediante una API compatible con OpenAI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica validacion documentada son ocho ejemplos de generacion de texto corto ejecutados en vLLM 0.32.0 sobre una RTX 4090 D, junto con una recarga en Transformers en FP16; no se aportan cifras de MMLU, HumanEval, GSM8K ni de tareas multimodales.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 13.045 GiB, por lo que se necesita una GPU con al menos 16 GB de memoria para cargar el modelo con margen para KV cache; con `gpu_memory_utilization=0.90` en una GPU de 24 GB queda espacio para contexto moderado.
- GPU recomendadas: RTX 4090 / 4090 D (validada por el autor), L40S, A100 40 GB y H100 para contextos largos o mayor concurrencia.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y previsiblemente en RTX 4080 Super o 5080 (16 GB) con contexto reducido; no cabe en GPUs de 8-12 GB sin cuantizacion adicional.
- Opciones de despliegue: vLLM 0.32.0 con soporte de compressed-tensors y kernels CUTLASS FP8 (via principal documentada); Transformers con recarga en FP16 verificada. No se documenta compatibilidad con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el ejemplo del autor usa `enforce_eager=True`, `max_num_seqs=1` y prefix caching desactivado, una configuracion orientada a correccion, no a rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wkhaifor/Qwen3.5-9B-FP8-Dynamic-LLMCompressor | 9,65B | no disponible | FP8 dinamico (compressed-tensors) | Apache-2.0 | Hugging Face y ModelScope; 21 descargas |
| RedHatAI/Qwen3.5-9B-FP8-dynamic | no disponible | no disponible | FP8 dinamico sin datos (LLM Compressor) | no disponible en la informacion | Hugging Face |
| Qwen/Qwen3.5-9B (base) | 9,65B | no disponible | BF16 | Apache-2.0 | Hugging Face |

La diferencia principal frente a RedHatAI/Qwen3.5-9B-FP8-dynamic es el proceso de cuantizacion: Red Hat aplica cuantizacion dinamica sin datos, mientras que esta version documenta la receta exacta, el commit de reconstruccion y la verificacion byte a byte del shard MTP. Frente al modelo base, la ventaja es la reduccion de memoria a costa de una perdida de precision no cuantificada publicamente.

## Limitaciones y advertencias

- La validacion publicada cubre solo ocho ejemplos de texto corto; no hay evidencia de calidad en tareas multimodales, razonamiento largo ni generacion de codigo tras la cuantizacion.
- El campo `inference: false` en los metadatos de la model card indica que el autor no garantiza inferencia directa sin la configuracion especifica de vLLM documentada.
- Requiere versiones concretas de software (vLLM 0.32.0, compressed-tensors 0.19.0); otras versiones pueden no cargar los pesos correctamente.
- Idiomas soportados limitados a ingles y chino; el rendimiento en castellano no esta documentado y previsiblemente sera inferior.
- Riesgo de alucinacion inherente al modelo base, no evaluado en esta version cuantizada.
- Sesgos del modelo original no auditados en esta publicacion; la cuantizacion puede amplificar derivas en dominios poco representados.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre el checkpoint derivado; conviene conservar la atribucion al modelo base.
- Repositorio con 21 descargas y 0 likes: ecosistema minimo, sin soporte comunitario ni issues documentadas.
- La cuantizacion excluye `visual`, `linear_attn` y `lm_head`, por lo que el ahorro de memoria es parcial y el modulo visual sigue consumiendo VRAM en precision flotante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wkhaifor/Qwen3.5-9B-FP8-Dynamic-LLMCompressor
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Alternativa de Red Hat: https://huggingface.co/RedHatAI/Qwen3.5-9B-FP8-dynamic
- Repositorio espejo en ModelScope: https://www.modelscope.cn/models/kfcVme50/Qwen3.5-9B-FP8-Dynamic-LLMCompressor
- Artefactos de validacion (referenciados en la model card): `validation/artifact_audit.json`, `validation/reload.json`, `validation/native_smoke.json`
- Scripts de reproduccion (referenciados en la model card): `reproducibility/`, `recipe.yaml`, `SHA256SUMS`, `BASE_PROVENANCE.json`, `RELEASE_STATUS.json`
