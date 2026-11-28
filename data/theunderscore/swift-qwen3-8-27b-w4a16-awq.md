# TheUnderscore/Swift-Qwen3.8-27b-W4A16-AWQ

## Resumen

Swift-Qwen3.8-27b-W4A16-AWQ es una cuantizacion de 4 bits (W4A16, pesos en 4 bits y activaciones en 16 bits) del modelo multimodal ukisai/Swift-Qwen3.8-27b, un fine-tune de la familia Qwen3.5/Qwen3.8 con pipeline image-text-to-text. La publica el usuario TheUnderscore en Hugging Face, no el autor original del modelo base, y emplea el esquema AWQ asimetrico por grupos con el formato compressed-tensors, pensado para carga nativa en LMDeploy turbomind. El modelo completo tiene 27.781.427.952 parametros (unos 27,8 mil millones) y el repositorio ocupa 19,6 GB, lo que refleja la compresion de los pesos lineales a int4 mientras se conservan en BF16 embeddings, lm_head, normas, torre de vision y cabeza MTP.

La relevancia de esta ficha es practica: permite ejecutar un modelo multimodal de ~27B con requisitos de VRAM sensiblemente menores que su version en precision completa, manteniendo las activaciones en 16 bits para preservar calidad de decodificacion. La propia model card advierte de que existe una version mas reciente con la misma receta (ukisai/Swift-1.5-Qwen3.8-27b-W4A16-AWQ) que deberia preferirse, por lo que este artefacto debe considerarse una instantanea intermedia.

La licencia no es abierta en sentido estricto: hereda la Swift Open License v1.0 del modelo base, con acceso restringido (gated) y umbral de facturacion anual de 1.000.000 USD para uso comercial sin licencia empresarial adicional. No se dispone de informacion sobre idiomas soportados ni de resultados de benchmarks publicados en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrida con atencion completa e hibrida (familia Qwen3.5), torre de vision y cabeza MTP; cuantizada con compressed-tensors |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16_ASYM: 4 bits asimetrico por grupo (group size 128) en todos los pesos `Linear`; BF16 en embeddings, `lm_head`, normas, `linear_attn.in_proj_a/b`, torre de vision y cabeza MTP |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (acceso gated; uso comercial libre hasta 1.000.000 USD de facturacion anual recurrente) |
| Formato de pesos | safetensors en formato pack-quantized de compressed-tensors (`weight_packed`, `weight_scale`, `weight_zero_point`, `weight_shape`) mas `model-nonquant.safetensors` en BF16 |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia Qwen3.5 con atencion hibrida: combina capas de atencion completa con capas de atencion lineal (referenciadas en la receta como `linear_attn`), lo que exige mapeos de suavizado especificos por capa durante la cuantizacion. Incluye ademas una torre de vision (pipeline image-text-to-text) y una cabeza MTP (multi-token prediction), ambas preservadas en BF16 en esta cuantizacion. El fine-tune del que deriva (ukisai/Swift-Qwen3.8-27b) no documenta en la informacion disponible el volumen de tokens, la composicion del dataset ni si hubo RLHF o DPO.

El proceso de cuantizacion es un one-shot offline con llmcompressor y AWQ. Se aplica `AWQModifier` con mapeos de atencion hibrida construidos por `build_hybrid_attention_mappings`: `input_layernorm` de atencion completa hacia `self_attn.q/k/v`, `post_attention_layernorm` hacia `mlp.gate/up` y `mlp.up_proj` hacia `mlp.down_proj`, con `duo_scaling="both"`. La receta advierte de que el suavizado con regex agrupadas o mapeos incorrectos corrompe la decodificacion en arquitecturas de atencion hibrida. La calibracion por defecto usa UltraChat 200k `train_sft`. El proceso se ejecuto con offloading a CPU (`compressed_tensors.offload.load_offloaded_model`) para que el modelo en precision completa cupiera en una configuracion de 2x16 GB de VRAM, y el script distribuido genera shards numerados `-of-N`.

## Capacidades

- Generacion de texto conversacional multi-turno, con parametros recomendados por el autor del modelo base: temperature 1.0, top_p 0.95, top_k 20, min_p 0, presence_penalty 0, repetition_penalty 1.0.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con torre de vision conservada en BF16.
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base Qwen3.8, si bien no se documentan evaluaciones especificas en la informacion disponible.
- Decodificacion con cabeza MTP (multi-token prediction) preservada en BF16, lo que habilita decodificacion especulativa en el backend que la soporte.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags del repositorio).
- Soporte de tool calling, function calling y flujos de agente: no documentado explicitamente en la informacion disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Despliegue multimodal en produccion con VRAM ajustada: al reducir los pesos lineales a int4, el modelo cabe en configuraciones de 2 GPU de 16 GB con tensor parallelism 2 en LMDeploy turbomind, lo que permite servir un modelo de ~27,8B con entrada de imagen sin recurrir a nodos de 80 GB.
- Asistente conversacional con imagenes: la torre de vision en BF16 permite tareas de descripcion, extraccion de informacion de capturas o documentos escaneados manteniendo la calidad del codificador visual intacta.
- Evaluacion comparativa de recetas de cuantizacion: el repositorio incluye el script `quantize-awq-hybrid.py` y el fichero `model-nonquant.safetensors`, lo que facilita reproducir la receta y medir la degradacion frente al modelo en BF16 en tareas de decodificacion.
- Prototipado de pipelines de razonamiento con decodificacion especulativa: la cabeza MTP conservada en BF16 permite experimentar con decodificacion multi-token en backends compatibles.
- Fine-tuning y destilacion sobre una base cuantizada: util como referencia de comportamiento del fine-tune Swift-Qwen3.8-27b cuando no se dispone de VRAM para la version completa.
- Despliegue en entornos de investigacion con acceso gated: el umbral de 1.000.000 USD de facturacion anual permite uso academico y en startups sin negociacion de licencia empresarial.
- Integracion en servicios compatibles con endpoints: el tag `endpoints_compatible` facilita exponer el modelo mediante APIs gestionadas que acepten el formato compressed-tensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de degradacion por cuantizacion frente al modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 19,6 GB en disco; con W4A16 el peso residente en GPU ronda los 15-16 GB, mas overhead de cache KV y buffers de activaciones. No se dispone de cifras oficiales de VRAM pico.
- Configuracion validada por el autor: tensor parallelism 2 sobre 2 GPU de 16 GB (`tp=2`) con LMDeploy turbomind y `model_format="compressed-tensors"`.
- GPU recomendadas: no especificadas en la informacion disponible; por tamano, encajan A100 40/80 GB, H100 y RTX 4090 (24 GB) en configuracion de una sola GPU o multi-GPU.
- Cabe en GPU de consumo: previsiblemente si en RTX 4090 (24 GB) o RTX 3090 (24 GB) para pesos, aunque la cache KV y las activaciones de un contexto largo pueden requerir ajustes; no confirmado por el autor.
- Opciones de despliegue: LMDeploy turbomind es el backend probado y recomendado (deteccion nativa del formato pack-quantized). El tag `transformers` y el formato safetensors permiten carga con la libreria transformers, pero no se documenta compatibilidad verificada con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TheUnderscore/Swift-Qwen3.8-27b-W4A16-AWQ | ~27,8 B | no disponible | W4A16 AWQ compressed-tensors | swift-open-license-1.0 (gated) | Hugging Face, 177 descargas, 13 likes |
| ukisai/Swift-1.5-Qwen3.8-27b-W4A16-AWQ | no disponible | no disponible | W4A16 AWQ, misma receta | swift-open-license-1.0 (gated) | Hugging Face; recomendado por el autor de esta ficha como sustituto |
| ukisai/Swift-Qwen3.8-27b (base) | ~27,8 B (por herencia) | no disponible | BF16 | swift-open-license-1.0 (gated) | Hugging Face |

La comparativa se limita a las variantes del mismo linaje porque la informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de otros autores.

## Limitaciones y advertencias

- Version obsoleta: la propia model card indica que debe usarse ukisai/Swift-1.5-Qwen3.8-27b-W4A16-AWQ, cuantizada con la misma receta; este repositorio es una instantanea anterior.
- Licencia restrictiva: Swift Open License v1.0 con acceso gated. El uso comercial solo es libre por debajo de 1.000.000 USD de facturacion anual recurrente (incluidas filiales); por encima se requiere una Swift Enterprise License negociada con UkisAI.
- Riesgo de alucinacion: no se documentan evaluaciones de fidelidad ni de tasas de alucinacion en la informacion disponible.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible.
- Cobertura idiomatica desconocida: no se declaran idiomas soportados, por lo que el rendimiento en castellano no esta verificado.
- Longitud de contexto no declarada: impide planificar cargas de contexto largo y dimensionar la cache KV.
- Compatibilidad de backend limitada: solo LMDeploy turbomind esta probado; el formato pack-quantized de compressed-tensors puede no cargarse en otros runners sin conversion previa.
- Fragilidad de la receta de cuantizacion: el autor advierte de que mapeos de atencion hibrida incorrectos o suavizado con regex agrupadas corrompe la decodificacion; reproducir la cuantizacion exige usar el script incluido y respetar los mapeos por capa.
- Calidad de cuantizacion no medida: no hay comparacion numerica frente al modelo en BF16, por lo que la degradacion en razonamiento, codigo o vision es desconocida.
- Trazabilidad: el publicador de la cuantizacion (TheUnderscore) no es el autor del modelo base (UkisAI), lo que anade una capa de intermediacion en la cadena de confianza.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheUnderscore/Swift-Qwen3.8-27b-W4A16-AWQ
- Modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Version recomendada por el autor: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b-W4A16-AWQ
- Herramienta de cuantizacion llmcompressor: https://github.com/vllm-project/llmcompressor
- Contacto de licencia UkisAI: https://ukisai.com/contact
