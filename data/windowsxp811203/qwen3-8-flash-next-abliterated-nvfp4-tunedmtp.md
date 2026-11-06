# windowsxp811203/Qwen3.8-Flash-Next-Abliterated-NVFP4-TunedMTP

## Resumen

Qwen3.8-Flash-Next-Abliterated-NVFP4-TunedMTP es un derivado comunitario del modelo Qwen3.8-Flash-Next, publicado por el usuario windowsxp811203 en Hugging Face. Se trata de una variante "abliterated" (es decir, con las direcciones de rechazo eliminadas mediante edicion de pesos) del modelo base doth4580/Qwen3.8-Flash-Next-DotH-MTP-BF16, posteriormente cuantizada en NVFP4 (formato de punto flotante de 4 bits con escalas por bloque, propio de NVIDIA ModelOpt) y con ajuste del modulo MTP (Multi-Token Prediction) para decodificacion especulativa en vLLM. El resultado es un modelo multimodal image-text-to-text de aproximadamente 180.000 millones de parametros, empaquetado en safetensors y disenado para servirse con vLLM en hardware Blackwell o superior.

La relevancia de esta ficha es doble: por un lado documenta una tecnica de cuantizacion agresiva (FP4) aplicada a un modelo MoE de gran tamano con MTP, lo que permite reducir el peso del repositorio a 135,2 GB frente a los ~360 GB de un BF16 equivalente; por otro lado, ilustra el ecosistema de variantes no oficiales ("abliterated", "uncensored") que circulan en Hugging Face y que presentan caveats importantes de licencia, sesgo y calidad. No se dispone de documentacion tecnica oficial del autor sobre el proceso de entrenamiento ni sobre los datos utilizados en el ajuste.

El modelo hereda la arquitectura Qwen3.8-Flash-Next (MoE con atencion hibrida y modulo MTP), pero los detalles exactos de configuracion (numero de expertos, dimension de capas, atencion lineal vs completa) no estan documentados en la informacion proporcionada y deben consultarse en el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (Qwen3.8-Flash-Next) con modulo MTP para decodificacion especulativa; cuantizacion NVFP4 via ModelOpt |
| Parametros totales | 179.999.981.459 (~180 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits con escalas por bloque), FP8 (mencionado en tags), safetensors de 8 bits en el repo |
| Idiomas soportados | en, zh |
| Licencia | qwen-community-license-1.0 (acceso restringido, gated) |
| Formato de pesos | safetensors (NVFP4/FP8), compatible con vLLM |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-Flash-Next, una arquitectura Mixture-of-Experts (MoE) de la familia Qwen, e incorpora el modulo MTP (Multi-Token Prediction) que permite decodificacion especulativa nativa en vLLM: el modelo predice varios tokens por paso y un verificador los acepta o rechaza, acelerando el throughput en generacion autoregresiva. La variante "DotH-MTP-BF16" del autor doth4580 sirve como base en precision BF16; sobre ella, windowsxp811203 aplica un proceso de "abliteration" (proyeccion de las direcciones de rechazo fuera de los pesos) y despues cuantiza a NVFP4 con ModelOpt, ajustando el modulo MTP para que funcione correctamente en ese formato de 4 bits. El resultado se sirve con vLLM y no con transformers.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF/DPO en el modelo original. Tampoco se documenta el procedimiento exacto de abliteration (que direccion se elimino, con que dataset de calibracion, ni el impacto en la perplexity). El tag `qwen4_exp` sugiere que el modelo base pertenece a una generacion experimental de Qwen, pero no hay confirmacion oficial.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline image-text-to-text, tags conversational).
- Capacidades multimodales: entrada de imagen y texto, salida de texto (image-text-to-text).
- Razonamiento y generacion de codigo heredados del modelo base Qwen3.8-Flash-Next (no verificados en esta variante).
- Decodificacion especulativa mediante modulo MTP, con aceleracion en vLLM.
- Multilingue limitado a ingles y chino (en, zh) segun los metadatos.
- Modo "uncensored"/"abliterated": se espera que reduzca el rechazo de peticiones que el modelo original filtraria, aunque sin garantia de calidad.
- Soporte de tool calling y agentes: no confirmado en esta variante; debe verificarse contra el modelo base.

## Casos de uso

- Servicio de inferencia de alto throughput en vLLM: la combinacion de MoE, NVFP4 y MTP esta pensada para servir muchas peticiones concurrentes en GPUs Blackwell, reduciendo el coste por token frente a BF16.
- Despliegue en memoria reducida: los 135,2 GB del repo permiten cargar el modelo en una sola GPU de 192 GB (B200) o en dos GPUs de 80 GB (H100/H200) con tensor parallelism, algo inviable en BF16.
- Experimentacion con cuantizacion FP4: util para investigadores que quieran medir la degradacion de calidad de NVFP4 frente a BF16/FP8 en un MoE de 180 B con MTP.
- Prototipado de asistentes multimodales en ingles y chino: el pipeline image-text-to-text permite construir demos de VQA o descripcion de imagenes sin depender de APIs propietarias.
- Investigacion sobre alineacion y abliteration: comparar las respuestas de esta variante con el modelo base para estudiar el efecto de la eliminacion de direcciones de rechazo.
- Generacion de codigo y texto en entornos controlados: siempre que se acepte la licencia y se auditen las salidas, puede usarse como motor de generacion en pipelines internos.
- Evaluacion de decodificacion especulativa: banco de pruebas para medir la tasa de aceptacion del modulo MTP en distintos dominios (codigo, texto, multimodal).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: ~135 GB para cargar los pesos NVFP4/8-bit del repo; el overhead de KV cache y activaciones depende del contexto y del numero de peticiones concurrentes, no disponible.
- GPU recomendadas: NVIDIA B200 (192 GB) para una sola GPU; H100/H200 80 GB en tensor parallelism 2x o 4x; A100 80 GB posible pero sin aceleracion FP4 nativa (se ejecutaria en FP8/FP16 emulado, con menor rendimiento).
- Consumer GPU: no cabe en RTX 4090 (24 GB) ni en RTX 5090 (32 GB) sin offload a CPU/RAM, lo que degradaria fuertemente el throughput.
- Despliegue: vLLM es el runtime declarado (tag `vllm`); llama.cpp/Ollama no soportan NVFP4 de forma nativa y requeririan conversion a GGUF, no documentada para este modelo.
- Latencia y throughput: no disponibles; la presencia de MTP sugiere mejora en tokens/segundo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Abliterated-NVFP4-TunedMTP (este) | ~180 B | no disponible | NVFP4/FP8 | qwen-community-license-1.0 (gated) | Hugging Face, acceso restringido |
| doth4580/Qwen3.8-Flash-Next-DotH-MTP-BF16 (base) | ~180 B | no disponible | BF16 | heredada de Qwen | Hugging Face |
| windowsxp811203/Qwen3.8-Flash-Next-Abliterated-NVFP4 (base directo) | ~180 B | no disponible | NVFP4 | qwen-community-license-1.0 | Hugging Face |
| Modelo original Qwen3.8-Flash-Next | ~180 B | no disponible | BF16/FP8 oficiales | Qwen community | Hugging Face (oficial) |

## Limitaciones y advertencias

- Modelo no oficial: es una modificacion comunitaria del modelo Qwen; no hay garantia de calidad, integridad de pesos ni soporte del equipo Qwen.
- Abliteration: la eliminacion de direcciones de rechazo puede degradar la coherencia, aumentar alucinaciones y eliminar filtros de seguridad; no apto para produccion orientada al publico sin moderacion externa.
- Licencia: qwen-community-license-1.0 con acceso gated; el uso comercial esta sujeto a los terminos de Qwen y a la interpretacion que haga el autor de la variante, lo que introduce ambiguedad legal.
- Idiomas: solo ingles y chino declarados; el rendimiento en castellano no esta verificado.
- Contexto: no documentado en esta ficha; debe consultarse el modelo base antes de disenar prompts largos.
- Hardware: requiere GPUs Blackwell o H100/H200 con vLLM; no es desplegable en consumer GPU sin offload.
- Cuantizacion FP4: la degradacion de calidad frente a BF16 no ha sido medida ni publicada; el ajuste del modulo MTP anade otra fuente de incertidumbre.
- Sin benchmarks ni documentacion de entrenamiento: no es posible validar las afirmaciones de rendimiento.
- Fecha de creacion (2026-11-05) y modelo base experimental (`qwen4_exp`): ecosistema en evolucion, posibles cambios de licencia o retirada del repo.

## Enlaces

- Hugging Face: https://huggingface.co/windowsxp811203/Qwen3.8-Flash-Next-Abliterated-NVFP4-TunedMTP
- Modelo base (BF16): https://huggingface.co/doth4580/Qwen3.8-Flash-Next-DotH-MTP-BF16
- Variante NVFP4 previa: https://huggingface.co/windowsxp811203/Qwen3.8-Flash-Next-Abliterated-NVFP4
- Paper referenciado en tags (arXiv:2504.04030): https://arxiv.org/abs/2504.04030
- vLLM: https://github.com/vllm-project/vllm
- NVIDIA ModelOpt (NVFP4): https://github.com/NVIDIA/TensorRT-Model-Optimizer
- Licencia Qwen community: https://huggingface.co/Qwen/Qwen3-235B-A22B/blob/main/LICENSE
