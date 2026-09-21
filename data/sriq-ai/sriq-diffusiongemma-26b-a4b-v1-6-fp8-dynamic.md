# sriq-ai/sriq-diffusiongemma-26B-A4B-v1.6-FP8-dynamic

## Resumen

SRIQ-DiffusionGemma-26B-A4B-v1.6-FP8-dynamic es una version cuantizada a FP8 del modelo de difusion sriq-ai/sriq-diffusiongemma-26B-A4B-v1.6, publicada por sriq-ai bajo licencia Apache 2.0. No es un transformer autorregresivo convencional: un codificador causal lee el prompt y lo deposita en una cache KV de solo lectura, mientras un decodificador bidireccional desruidifica un lienzo de 256 tokens a lo largo de unas 48 pasadas de refinamiento. La arquitectura combina ese esquema de difusion por bloques con capas de mezcla de expertos (MoE), con 25.823.781.228 parametros totales y unos 4.000 millones activos segun la nomenclatura A4B.

La relevancia practica de esta version es de despliegue: los pesos pasan de 51,6 GB en bf16 a 27,2 GB en FP8 (W8A8 con escalas de activacion dinamicas por token), lo que permite servir el modelo en un unico acelerador de 40 GB en lugar de los 80 GB que exige la version bf16. La cuantizacion se genero con llm-compressor y se empaqueta en formato compressed-tensors, y el autor afirma que el resultado es identico clave por clave al build FP8 de Red Hat del modelo base (24.232 tensores, 27,2 GB).

El modelo esta orientado a razonamiento conversacional y multimodalidad texto-imagen (pipeline image-text-to-text), con razonamiento interno en chino simplificado comprimido y respuesta en el idioma de la consulta. Sus idiomas declarados son chino, ingles y multilingue. La exactitud del razonamiento no esta evaluada con benchmarks publicos y el autor reconoce que se hereda una limitacion de repeticion en una minoria de prompts.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiffusionGemma: codificador causal + decodificador bidireccional de difusion por bloques (diffusion-lm), con MoE en las proyecciones de expertos |
| Parametros totales | 25.823.781.228 (aprox. 25,8 mil millones) |
| Parametros activos | aprox. 4.000 millones, segun la nomenclatura A4B del nombre; no confirmado en la model card |
| Longitud de contexto | no disponible (la generacion usa un lienzo fijo de 256 tokens refinado en unas 48 pasadas) |
| Tipos de cuantizacion | FP8 W8A8 con escalas de activacion dinamicas por token (esquema FP8_DYNAMIC); INT8 W8A8 como alternativa recomendada en Ampere |
| Idiomas soportados | zh, en, multilingue (declarados); razonamiento en chino simplificado comprimido |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato compressed-tensors (FP8); 24.232 tensores, 27,2 GB |

## Arquitectura y entrenamiento

El modelo no es autorregresivo. Un codificador causal procesa el prompt y genera una cache KV de solo lectura; a continuacion, un decodificador bidireccional parte de ruido y desruidifica un lienzo de 256 tokens mediante aproximadamente 48 pasadas de refinamiento. La arquitectura se etiqueta como diffusion-lm y block-diffusion, e incorpora un vision tower (el pipeline declarado es image-text-to-text). El 88% de los parametros vive en los tensores fusionados `layers.N.experts.{gate_up,down}_proj`, lo que confirma un diseno MoE con expertos por capa.

Esta ficha corresponde al artefacto de cuantizacion, no al entrenamiento. La receta sigue la de RedHatAI/diffusiongemma-26B-A4B-it-FP8-dynamic y aplica `QuantizationModifier(targets="Linear", scheme="FP8_DYNAMIC")` excluyendo `lm_head`, embeddings, router, vision_tower y self_conditioning. FP8_DYNAMIC no requiere dataset de calibracion: las escalas de pesos se calculan a partir de los pesos y las de activacion en tiempo de ejecucion. Dos operaciones se resolvieron manualmente: la linearizacion de los expertos MoE fusionados (`llmcompressor.modeling.moe.linearize_moe`), imprescindible porque `targets="Linear"` no ve el tensor 3D y habria dejado sin cuantizar casi todo el modelo, y la deduplicacion de los pesos atados entre codificador y decodificador, que tras la linearizacion y la conversion FP8 se guardaban dos veces (51,7 GB en lugar de 27,2 GB) mediante `dedupe.py`. Los detalles de entrenamiento del modelo base se remiten a FINETUNE.md en el repositorio bf16; no se dispone de numero de tokens, composicion del dataset ni uso de RLHF o DPO.

El dataset asociado es sriq-ai/sriq-sft-v1.6, con 9.988 filas segun la propia model card.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento explicito: el modelo razona internamente en chino simplificado comprimido y responde en el idioma en que se le pregunta.
- Entrada multimodal texto-imagen (pipeline image-text-to-text), con vision tower preservado sin cuantizar.
- Capacidad multilingue declarada (zh, en, multilingue), con foco real en chino e ingles.
- Modo de razonamiento heredado del modelo base (la ascendencia incluye un modelo etiquetado ALWAYS-THINK).
- Decodificacion no autorregresiva por refinamiento iterativo sobre un lienzo de 256 tokens.
- Despliegue compatible con OpenAI API a traves de vLLM 0.24.0+ y con SGLang (`--dllm-algorithm Gemma4Renoise`).
- Soporte de tool calling / function calling: no disponible (no se menciona en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se menciona en la informacion proporcionada).
- Capacidades de audio: no disponibles.

## Casos de uso

- Razonamiento en una sola GPU de 40 GB: el empaquetado FP8 reduce el peso a 27,2 GB y evita el nodo de 80 GB que exige la version bf16, lo que abarata el coste por instancia en entornos con A100 de 80 GB, H100 o L40S.
- Asistente conversacional chino-ingles: el modelo mantiene el idioma de la consulta en la respuesta, por lo que sirve para atencion al usuario bilingue en el mismo despliegue, sin necesidad de enrutar por idioma.
- Analisis de documentos con imagen: al ser image-text-to-text, puede recibir capturas, diagramas o paginas escaneadas y responder preguntas sobre ellas en el mismo pipeline.
- Razonamiento en dominios tecnicos con salida de bajo coste de almacenamiento: el razonamiento en chino comprimido produce texto mas comprimible (ratio zlib medio de 0,481 en la evaluacion del autor), lo que interesa cuando los traces de razonamiento se almacenan a gran escala.
- Sustitucion directa de la version bf16 en un servicio vLLM ya montado: al compartir conjunto de claves con el build FP8 de Red Hat, la migracion no requiere reescritura del cargador ni recalibracion (FP8_DYNAMIC no usa dataset de calibracion).
- Investigacion en modelos de difusion para lenguaje: permite reproducir el comportamiento de denoising iterativo y comparar contra alternativas autorregresivas del mismo tamano, con soporte nativo en SGLang mediante Gemma4Renoise.
- Despliegue de bajo paralelismo en una unica tarjeta para prototipos y demos: la configuracion documentada con `--max-num-seqs 4` y `--gpu-memory-utilization 0.85` es directamente replicable con Docker.
- Evaluacion comparativa de cuantizacion: sirve como referencia para medir el impacto de FP8 frente a bf16 en modelos MoE con pesos atados, dado que el autor publica la tabla de degradacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K ni similares). El autor indica explicitamente que la exactitud del razonamiento no esta evaluada. La unica tabla publicada mide la calidad de la cuantizacion sobre 20 prompts reservados (split aleatorio del 5% de las 9.988 filas de v1.6, 384 tokens maximos, temperatura 0, ambos modelos servidos con el mismo build de vLLM):

| Metrica | bf16 v1.6 | FP8 (este modelo) |
|---|---|---|
| Fraccion media de CJK en la generacion | 5,9% | 8,0% |
| Filas que producen algun caracter chino | 4 / 20 | 5 / 20 |
| Ratio zlib medio | 0,455 | 0,481 |
| Filas degeneradas (bucle) | 0 / 20 | 0 / 20 |

El autor advierte que las diferencias estan dentro del ruido con n=20 y que estas cifras no son comparables con el 18,1% de la model card bf16, medido con `transformers` y muestreo por defecto en lugar de vLLM a temperatura 0.

## Requisitos de hardware

- VRAM para los pesos: 27,2 GB en FP8 frente a 51,6 GB en bf16.
- Acelerador minimo recomendado: una GPU de 40 GB para FP8; 80 GB si se usa bf16.
- Compatibilidad de tensor cores FP8: requiere Hopper o Ada o posterior (H100, H200, L40S, RTX 4090 y equivalentes).
- En Ampere (A100): el kernel Marlin FP8 MoE de vLLM no puede teselar esta forma de experto con la memoria compartida disponible; el autor recomienda cuantizar a INT8 W8A8, que usa el backend Triton int8 MoE.
- GPU de consumo: no cabe en una RTX 4090 o RTX 3090 de 24 GB, ya que solo los pesos FP8 ocupan 27,2 GB. No se documentan cuantizaciones de menor precision (GGUF, 4 bits) para este modelo.
- Opciones de despliegue: vLLM 0.24.0+ con `VLLM_USE_V2_MODEL_RUNNER=1` (imagen `vllm/vllm-openai:gemma`) y SGLang con `--dllm-algorithm Gemma4Renoise` y `--trust-remote-code`. Ollama, llama.cpp y TGI no aparecen documentados.
- Concurrencia: los buffers de estado de difusion preasignan `max_seqs × canvas_length × vocab_size`, por lo que la concurrencia consume VRAM de forma distinta a un servicio autorregresivo. La configuracion de ejemplo usa `--max-num-seqs 4` y `--gpu-memory-utilization 0.85`.
- Latencia y throughput: no disponible. La generacion implica unas 48 pasadas de refinamiento por secuencia, un coste estructuralmente distinto al de un token-a-token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y tamano | Licencia | Notas |
|---|---|---|---|---|---|
| sriq-ai/sriq-diffusiongemma-26B-A4B-v1.6-FP8-dynamic (este) | 25,8 B totales, aprox. 4 B activos | no disponible | safetensors compressed-tensors FP8, 27,2 GB | apache-2.0 | Build FP8 de sriq-ai; calidad medida sin degradacion aparente frente a bf16 |
| sriq-ai/sriq-diffusiongemma-26B-A4B-v1.6 | 25,8 B totales, aprox. 4 B activos | no disponible | safetensors bf16, 51,6 GB | no disponible | Modelo base del que deriva esta ficha; incluye FINETUNE.md |
| RedHatAI/diffusiongemma-26B-A4B-it-FP8-dynamic | no disponible | no disponible | FP8 dynamic, 27,2 GB (24.232 tensores) | no disponible | Receta de referencia; el autor afirma que el resultado es identico clave por clave |
| kaivoss/diffusiongemma-26B-A4B-it-ALWAYS-THINK | no disponible | no disponible | no disponible | no disponible | Modelo base citado en la model card; no se dispone de mas datos |

No se dispone de datos de rendimiento comparado entre estos modelos, por lo que la comparativa se limita a parametros, formato, tamano y licencia.

## Limitaciones y advertencias

- Repeticion: una minoria de prompts colapsa en una frase repetida. Es una limitacion heredada del modelo bf16 y el autor la mantiene explicitamente.
- Deriva de idioma: entre el 4/20 y el 5/20 de las generaciones de la evaluacion producen algun caracter chino independientemente del idioma de la pregunta, coherencia con el razonamiento interno en chino comprimido.
- Exactitud no evaluada: no hay benchmarks de razonamiento, matematicas ni codigo; no se puede afirmar su calidad frente a alternativas.
- Idiomas: el soporte declarado se limita a chino, ingles y multilingue; no hay evaluacion por idioma ni evidencia de un rendimiento solido en castellano.
- Hardware: la cuantizacion FP8 no es utilizable en Ampere con el kernel documentado, y el modelo no cabe en GPU de consumo de 24 GB.
- Concurrencia: la preasignacion de buffers de difusion penaliza el servicio con muchas secuencias simultaneas; hay que mantener `max-num-seqs` bajo.
- Sin datos de sesgos: no se documentan evaluaciones de sesgo, toxicidad ni alineacion.
- Modelo sin traccion: 0 descargas y 0 likes en el momento de la consulta, publicado el 21 de septiembre de 2026, sin validacion independiente de la comunidad.
- Licencia: este artefacto es apache-2.0, lo que permite uso comercial, pero la licencia del modelo base kaivoss del que desciende no se especifica en la informacion disponible y conviene verificarla antes de un despliegue en produccion.
- Uso en produccion: con 0,5 puntos porcentuales de diferencia en la fraccion CJK y sin evaluacion de exactitud, se recomienda validar con un conjunto propio antes de sustituir un modelo en servicio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sriq-ai/sriq-diffusiongemma-26B-A4B-v1.6-FP8-dynamic
- Modelo base bf16: https://huggingface.co/sriq-ai/sriq-diffusiongemma-26B-A4B-v1.6
- Dataset de entrenamiento: https://huggingface.co/datasets/sriq-ai/sriq-sft-v1.6
- Modelo base original citado: https://huggingface.co/kaivoss/diffusiongemma-26B-A4B-it-ALWAYS-THINK
- Receta FP8 de referencia: https://huggingface.co/RedHatAI/diffusiongemma-26B-A4B-it-FP8-dynamic
- Documentacion de entrenamiento: https://huggingface.co/sriq-ai/sriq-diffusiongemma-26B-A4B-v1.6/blob/main/FINETUNE.md
- Limitacion de repeticion documentada: https://huggingface.co/sriq-ai/sriq-diffusiongemma-26B-A4B-v1.6#known-limitation-repetition-on-a-minority-of-prompts
- Sitio del autor: https://sriq.org
- Benchmarks del autor: https://bench.sriq.org
- Repositorio compressed-tensors: https://github.com/vllm-project/compressed-tensors
- Repositorio llm-compressor: https://github.com/vllm-project/llm-compressor
- Scripts de cuantizacion del repositorio: quantize.py y dedupe.py, en https://huggingface.co/sriq-ai/sriq-diffusiongemma-26B-A4B-v1.6-FP8-dynamic

Las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los unicos enlaces utiles proceden de la model card y del repositorio de HuggingFace.
