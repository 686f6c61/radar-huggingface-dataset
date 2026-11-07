# umixer/Huihui-Qwen3.8-Flash-Next-abliterated-v2-oq4-mix6-mtp

## Resumen

Huihui-Qwen3.8-Flash-Next-abliterated-v2-oq4-mix6-mtp es una cuantizacion MLX de precision mixta del modelo Qwen3.8-Flash-Next en su variante "abliterated" (sin rechazo) publicada por huihui-ai. El autor de esta build es umixer, que la distribuye como pesos safetensors en formato MLX, es decir, orientada a inferencia en Apple Silicon mediante la libreria mlx. El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con 177.000 millones de parametros segun los datos publicados en el repositorio de huihui-ai, e incorpora atencion lineal GDN (Gated DeltaNet) ademas de atencion completa.

La relevancia de esta ficha es doble. Por un lado, documenta una tecnica de cuantizacion poco habitual: recetas de precision mixta por familia de tensores con patron "U-shaped" (capas de borde en 6 bits, capas centrales en 4 bits) y un drafter MTP (multi-token prediction) que permite decodificacion especulativa. Por otro, la variante abliterated elimina los mecanismos de rechazo del modelo original, lo que cambia radicalmente el perfil de seguridad y las consideraciones de uso en produccion.

Se trata de un artefacto de nicho: cero descargas y cero likes en el momento de la consulta, creado en noviembre de 2026, sin model card extendida ni evaluacion de benchmarks publicada. Su interes es fundamentalmente tecnico y experimental, no de despliegue productivo inmediato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion lineal GDN y atencion completa; drafter MTP |
| Parametros totales | 177.000 millones (dato del modelo base segun huihui-ai) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ4 mixta: 4 bits g64 (expertos enrutados de capas centrales), 6 bits g64 (capas de borde, tabla N-gram PLE a 6 bits g32), 8 bits g64/g128 (proyecciones GDN, atencion completa, expertos compartidos, hyper-connections), bf16 (norms, routers, vision tower) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (heredada del modelo base) |
| Formato de pesos | safetensors, libreria mlx |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer MoE que combina capas de atencion lineal GDN (Gated DeltaNet) con capas de atencion completa, e incluye un vision tower (el repositorio de huihui-ai lo etiqueta como Image-Text-to-Text). Sobre esa base, huihui-ai aplica una modificacion de tipo abliterated, que suprime la direccion de rechazo en el espacio de activaciones. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO.

La aportacion tecnica de esta build concreta es la receta de cuantizacion. Se parte del GGUF Q8_0 de huihui-ai (alineado con Unsloth) y se recuantiza a precision mixta con override por tensor: los expertos enrutados de las 40 capas centrales (L4-L43) van a 4 bits con grupo 64, mientras que las 8 capas de borde (L0-L3 y L44-L47) se mantienen a 6 bits, configurando el patron U-shaped. Las proyecciones GDN y de atencion completa en capas sensibles, los expertos compartidos de las 48 capas y las hyper-connections se conservan a 8 bits. Los tensores de atencion lineal GDN se des-interleavan (del orden de cabezas tileado de GGUF al orden agrupado nativo) antes de cuantizar. El drafter MTP y los tensores n-gram (PLE) se heredan de la base mix6-mtp. El autor declara verificacion clave por clave contra un oraculo de dequantizacion, con 686 tensores cuantizados dentro del ruido de cuantizacion (rms maximo 0,047) y configuracion identica de 993/993 claves respecto a su hermano ThinkingCap mix6-v2.

## Capacidades

- Generacion de texto y razonamiento en un modelo de gran escala (177.000 millones de parametros totales), con la salvedad de que la cuantizacion a 4-6 bits degrada la fidelidad respecto al original.
- Procesamiento de imagen y texto: el modelo base incluye vision tower (etiqueta Image-Text-to-Text en huihui-ai), aunque en esta build el vision tower se mantiene en bf16 sin cuantizar.
- Decodificacion especulativa mediante drafter MTP integrado, lo que reduce la latencia por token en hardware Apple Silicon.
- Capacidad de razonamiento multi-paso y tool calling: no confirmada explicitamente en la informacion disponible para esta build.
- Multilingue: no disponible; el template de chat proviene del GGUF de huihui (alineado con Unsloth).
- Modo "abliterated": respuestas sin los filtros de rechazo del modelo original, lo que constituye una capacidad y a la vez un riesgo.

## Casos de uso

- Investigacion sobre cuantizacion en Apple Silicon: sirve como caso de estudio reproducible de recetas de precision mixta por familia de tensores (U-shaped 4/6/8 bits) y de verificacion contra un oraculo de dequantizacion, util para quien desarrolle herramientas tipo oMLX/oQ.
- Evaluacion de decodificacion especulativa: el drafter MTP incluido permite medir ganancias de throughput en Mac con memoria unificada frente a la misma build sin drafter.
- Pruebas de alineacion y seguridad: al ser una variante abliterated, es adecuado para estudiar como la supresion de la direccion de rechazo afecta a la tasa de respuestas daninas, sin necesidad de desplegar el modelo completo en produccion.
- Prototipado local de asistentes multimodales: con el vision tower en bf16, permite experimentar con entrada imagen-texto en un equipo de sobremesa Apple, siempre que la memoria unificada lo permita.
- Comparativas de fidelidad de cuantizacion: util para contrastar la perplexity y la calidad de generacion entre Q8_0 GGUF, esta build oQ4 mix6 y otras variantes del mismo modelo base.
- Docencia y divulgacion tecnica: ejemplo didactico de como se estructura un checkpoint MLX con safetensors, claves por tensor y overrides de bits/grupo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada: no disponible de forma oficial. Con 177.000 millones de parametros totales y una mezcla dominada por 4-6 bits, el checkpoint completo excede con holgura la memoria de cualquier GPU de consumo; se requiere un Mac con memoria unificada muy alta (orden de cientos de GB) o un sistema multi-GPU con soporte MLX, dato no confirmado en la informacion proporcionada.
- GPU recomendadas: el formato es MLX, por lo que el destino natural son chips Apple Silicon (series M Ultra). En GPU NVIDIA no es directamente desplegable sin conversion.
- Consumer GPU: no cabe en RTX 4090 ni en GPUs de 24 GB, dado el tamano del modelo base.
- Opciones de despliegue: libreria mlx (carga mediante `load("umixer/Huihui-Qwen3.8-Flash-Next-abliterated-v2-oq4-mix6-mtp")`); vLLM, llama.cpp, Ollama y TGI no estan soportados para este formato sin conversion previa.
- Latencia y throughput: no disponibles; el drafter MTP esta pensado para mejorar la latencia, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Esta build (umixer oQ4 mix6 MTP) | 177.000 M (base) | no disponible | MLX mixta 4/6/8 bits + MTP | qwen-community-1.0 | Hugging Face, 0 descargas |
| huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF | 177.000 M | no disponible | GGUF Q8_0 (fuente) | qwen-community-1.0 | Hugging Face |
| umixer/Qwen3.8-Flash-Next-oQ4e-mix6-mtp | 177.000 M (base) | no disponible | MLX mixta 4 bits expertos + MTP | qwen-community-1.0 | Hugging Face |
| Qwen/Qwen3.8-Flash-Next (original) | 177.000 M | no disponible | pesos completos | qwen-community-1.0 | Hugging Face |

## Limitaciones y advertencias

- La variante abliterated elimina los mecanismos de rechazo: no es apta para aplicaciones de cara al publico sin capas de moderacion externas.
- Riesgo elevado de alucinacion y de degradacion de calidad por la cuantizacion agresiva a 4 bits en los expertos centrales; el autor solo verifica fidelidad numerica de dequantizacion, no calidad generativa.
- Sesgos: no documentados en la informacion disponible; se heredan los del modelo base y los de la modificacion abliterated.
- Idiomas soportados y longitud de contexto no declarados: no se puede asumir un contexto largo sin verificacion.
- Licencia qwen-community-1.0 con clausulas adicionales; conviene revisar el enlace LICENSE antes de cualquier uso comercial.
- Formato MLX exclusivo: no desplegable en stacks NVIDIA estandar (vLLM, TGI) sin conversion.
- Artefacto sin traccion (0 descargas, 0 likes) y sin benchmarks: no hay evidencia externa de su comportamiento.
- El pipeline declarado es text-generation, pero el modelo base tiene vision tower; la ruta multimodal no esta documentada en esta build.

## Enlaces

- Hugging Face (esta build): https://huggingface.co/umixer/Huihui-Qwen3.8-Flash-Next-abliterated-v2-oq4-mix6-mtp
- Fuente GGUF de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF
- Variante abliterated GGUF (v1): https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-GGUF
- Build hermana oQ4e mix6 MTP: https://huggingface.co/umixer/Qwen3.8-Flash-Next-oQ4e-mix6-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
