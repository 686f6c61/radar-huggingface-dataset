# Spectrallic/MiniMax-H3-PDMD-4step-int8-convrot

## Resumen

MiniMax-H3 PDMD 4-step INT8 ConvRot es una versión destilada y cuantizada de los transformadores pruned de MiniMax-H3 para generación de vídeo y audio. Lo publica el usuario Spectrallic en HuggingFace, partiendo de los pesos oficiales de Comfy-Org/MiniMax-H3 y fusionando la LoRA de destilación PDMD de 4 pasos (pdmd2026/pdmd_4NFE_lora) en rango completo. El resultado son dos ficheros safetensors autocontenidos que eliminan la necesidad de cargar un LoRA adicional en el pipeline de inferencia.

El modelo resuelve un problema práctico de despliegue: la generación de vídeo con audio en modelos de difusión de gran tamaño requiere tradicionalmente decenas de pasos de muestreo y precisión BF16, lo que dispara los requisitos de VRAM y el tiempo de inferencia. Esta versión reduce el muestreo a 4 pasos con CFG 1.0 y cuantiza las capas lineales de los bloques a INT8 con rotación Hadamard por grupos de 256, manteniendo el resto de tensores en el dtype original.

La relevancia es doble: por un lado, demuestra una receta reproducible de merge de LoRA en layout diffusers hacia layout Comfy-Org con fusión de proyecciones QKV y reordenación SwiGLU; por otro, ofrece una alternativa de inferencia de 4 pasos compatible byte a byte con la estructura de los ficheros INT8 oficiales de Comfy-Org, lo que facilita su integración en flujos existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) con atención conjunta vídeo-audio; 50 bloques principales más 2 bloques token_refiner |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusión, no de lenguaje) |
| Tipos de cuantizacion | INT8 tensorwise con ConvRot (rotación Hadamard grupo 256) en 200 lineales de bloque; resto en BF16 |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors (single-file, layout Comfy-Org) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión para generación conjunta de vídeo y audio, derivado de MiniMax-H3. La variante aquí publicada parte de los pesos pruned en BF16 de Comfy-Org y aplica tres transformaciones: conversión del layout diffusers al layout Comfy-Org (los 312 adaptadores LoRA se reducen a 208, fusionando `to_q`, `to_k` y `to_v` en un único `attn.qkv_proj` de rango 384 y reordenando las mitades del up projection de `ff.net.0.proj` para el SwiGLU de Comfy-Org), merge de la LoRA PDMD a fuerza 1.0 en FP32 sobre los 208 objetivos en los 50 bloques y los 2 bloques token_refiner, y cuantización INT8 de los 200 lineales de bloque con rotación ConvRot grupo 256 y escalas por fila.

La destilación PDMD (4 NFE) se entrenó sobre el transformador text-to-audio-video; los pesos Ref2VA difieren del transformer usado en el entrenamiento y los autores de PDMD no publican resultados para esa partición. Los 8 pesos del token_refiner se devuelven a BF16 porque esa capa permanece sin cuantizar en el fichero de referencia de Comfy-Org. El resto de tensores no afectados por la LoRA se copian bit a bit del fichero de layout de referencia.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con audio sincronizado.
- Generación de vídeo y audio condicionada por primer y último fotograma (FL2VA).
- Generación de vídeo y audio con referencia de imagen (Ref2VA), permitiendo reutilizar elementos visuales de una imagen dada.
- Salida conjunta de vídeo y audio en una sola pasada de difusión.
- Muestreo en 4 pasos con CFG 1.0 (sin classifier-free guidance) y scheduler con shift 12 para vídeo y 3 para audio.
- Compatibilidad con atención dispersa (SageAttention con densidad 0.15, primer paso denso) para acelerar la inferencia.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; es un modelo generativo multimodal, no un LLM.

## Casos de uso

- Prototipado rápido de clips con audio: con 4 pasos y CFG 1.0 se pueden generar borradores de 124 fotogramas a 24 fps en 1344×768 sin cargar un LoRA adicional, lo que simplifica el pipeline en ComfyUI.
- Iteración de guion visual en preproducción: la variante FL2VA permite fijar el primer y último fotograma para controlar la narrativa de un plano y validar transiciones antes de un render final de mayor calidad.
- Consistencia de personajes y escenarios: la variante Ref2VA admite una imagen de referencia que se reutiliza en planos posteriores, útil para mantener un mismo elemento (por ejemplo, una ciudad flotante) a lo largo de una secuencia.
- Generación de audio ambiente sincronizado: el modelo produce vídeo y audio conjuntamente, lo que sirve para crear clips con sonido diegético (lluvia, truenos, oleaje) sin postproducción de audio separada.
- Despliegue en hardware con VRAM limitada: la cuantización INT8 de los lineales de bloque reduce el peso de los tensores dominantes, permitiendo ejecutar el modelo en GPUs donde la versión BF16 no cabría.
- Integración en flujos ComfyUI existentes: al compartir nombres, orden, dtypes, formas, offsets y descriptores `.comfy_quant` con los ficheros INT8 de Comfy-Org, se puede sustituir el par base+LoRA por un único fichero sin reescribir el grafo.
- Investigación sobre destilación de difusión: la receta documentada (conversión de layout, merge en FP32, cuantización ConvRot) sirve como referencia reproducible para experimentos con otras LoRAs de pocos pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo pesa 41,9 GB e incluye dos variantes (FL2VA y Ref2VA), por lo que cada fichero individual ronda la mitad de ese tamaño. La cuantización INT8 de los 200 lineales de bloque reduce el peso respecto a BF16, pero el resto de tensores mantiene el dtype original.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del repo y la naturaleza del modelo (vídeo 1344×768 con audio) sugieren requisitos altos, pero no se aportan cifras.
- Opciones de despliegue: ComfyUI (layout nativo Comfy-Org, librería `diffusion-single-file`); compatible con SageAttention y atención dispersa (densidad 0.15, primer paso denso) según el ejemplo del autor.
- Latencia y throughput: no disponibles. El autor solo documenta el punto de operación (4 pasos, CFG 1.0, shift 12/3) y las dimensiones de los ejemplos (1344×768, 124 fotogramas a 24 fps).

## Comparativa con modelos similares

| Modelo | Tipo | Pasos de muestreo | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3 PDMD 4-step INT8 ConvRot (este) | DiT vídeo+audio, pruned, LoRA PDMD fusionada | 4 (CFG 1.0) | INT8 ConvRot en lineales de bloque | minimax-h3-community-license-agreement | HuggingFace (Spectrallic) |
| Comfy-Org/MiniMax-H3 (INT8 ConvRot) | DiT vídeo+audio, pruned | Requiere LoRA externa para pocos pasos | INT8 ConvRot | minimax-h3-community-license-agreement | HuggingFace (Comfy-Org) |
| Comfy-Org/MiniMax-H3 (BF16) | DiT vídeo+audio, pruned | no disponible | BF16 | minimax-h3-community-license-agreement | HuggingFace (Comfy-Org) |
| pdmd2026/pdmd_4NFE_lora | LoRA de destilación 4 NFE | 4 | no aplica (LoRA) | no disponible | HuggingFace (pdmd2026) |

## Limitaciones y advertencias

- La variante Ref2VA no fue entrenada con PDMD: los pesos difieren del transformer text-to-audio-video usado en el entrenamiento y los autores de PDMD no publican resultados para esa partición, por lo que la calidad de la destilación en Ref2VA no está validada por el autor original.
- Los pesos modificados difieren del release oficial de MiniMax-H3; no es una reproducción bit a bit del modelo original, sino una versión destilada y cuantizada.
- La licencia `minimax-h3-community-license-agreement` es distinta de las licencias open source habituales; es necesario revisar sus términos antes de cualquier uso comercial.
- El punto de operación está fijado en 4 pasos y CFG 1.0; usar otros valores de pasos o CFG puede degradar la calidad, ya que el modelo está destilado para ese régimen concreto.
- Riesgo de alucinación visual y artefactos propios de los modelos de difusión: no se documentan evaluaciones de fidelidad, coherencia temporal ni sincronización audio-vídeo.
- No se dispone de información sobre sesgos, cobertura idiomática ni limitaciones de contexto (no aplica en el sentido de LLM, pero no se detalla la longitud máxima de prompt).
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día; no hay validación comunitaria independiente.
- El tamaño del repo (41,9 GB) implica requisitos de almacenamiento y transferencia considerables para su descarga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Spectrallic/MiniMax-H3-PDMD-4step-int8-convrot
- Modelo base (Comfy-Org): https://huggingface.co/Comfy-Org/MiniMax-H3
- LoRA PDMD 4 NFE: https://huggingface.co/pdmd2026/pdmd_4NFE_lora
- Blog sobre atención dispersa y SageAttention citado por el autor: https://noxengine.dev/blog/sparse/
- Paper referenciado en los tags (arXiv:2609.35768): https://arxiv.org/abs/2609.35768
- Ejemplo FL2VA: https://huggingface.co/Spectrallic/MiniMax-H3-PDMD-4step-int8-convrot/resolve/main/samples/floating_city_1344x768_seed42.mp4
- Ejemplo Ref2VA: https://huggingface.co/Spectrallic/MiniMax-H3-PDMD-4step-int8-convrot/resolve/main/samples/stormy_boat_1344x768_seed43.mp4
