# Spectrallic/MiniMax-H3-FL2VA-DMAD-4step-int8-convrot

## Resumen

MiniMax-H3-FL2VA-DMAD-4step-int8-convrot es una versión cuantizada y destilada del transformer FL2VA (first-last-to-video-audio) de MiniMax-H3, publicada por el usuario Spectrallic. Parte de los pesos podados en bf16 de Comfy-Org/MiniMax-H3, fusiona el LoRA de destilación DMAD (full-rank, estudiante `full_critic` de 4 pasos) y cuantiza a INT8 con rotación convolucional (ConvRot) las capas lineales de cada bloque. El resultado es un único fichero safetensors que se carga sin cargador de LoRA en ComfyUI y que genera vídeo con audio en tan solo 4 pasos de muestreo a CFG 1.

La relevancia de esta ficha radica en que reduce drásticamente el coste de inferencia de un modelo de vídeo-audio de gran tamaño: al combinar destilación few-step, poda y cuantización INT8, permite renderizar clips de 1344×768 a 24 fps con 124 frames en hardware de consumo alto en lugar de requerir clústeres multi-GPU. Es, por tanto, una pieza pensada para el ecosistema ComfyUI y para pipelines de generación audiovisual local.

El modelo conserva la modalidad de entrada de referencia (`<Picture i>`, `<Video k>`, `<Audio j>`) propia de FL2VA, aunque la destilación DMAD se entrenó sobre el transformer text-to-audio-video, no sobre Ref2VA; los autores del LoRA indican que carga en la partición Ref2VA pero no publican resultados para ella. La licencia es la MiniMax-H3 Community License Agreement, no una licencia open source estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (MiniMax-H3) para generación conjunta de vídeo y audio, podado, con LoRA DMAD fusionado |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (modelo de difusión, no de lenguaje) |
| Tipos de cuantizacion | INT8 tensorwise con ConvRot (grupo 256) en capas lineales de bloque; resto en dtype original Comfy-Org |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (license: other) |
| Formato de pesos | safetensors (diffusion-single-file) |
| Pasos de muestreo | 4 (fichero 4-step) |
| Resolución de ejemplo | 1344×768, 124 frames a 24 fps |
| CFG | 1.0 (sin classifier-free guidance) |
| Shift vídeo / audio | 12 / 2 |
| Tamaño del repo | 83,9 GB |
| Descargas | 7.079 |

## Arquitectura y entrenamiento

El modelo base es un transformer de difusión de MiniMax-H3 en su variante FL2VA (first-last-frame to video-audio), podado respecto al release original. Sobre esa base se fusiona el LoRA DMAD de rango completo (`full_critic` para la variante de 4 pasos), una destilación few-step que permite muestrear con 4 pasos y CFG 1 en lugar de las decenas de pasos habituales. La cuantización se aplica solo a las capas lineales de cada bloque (`blocks.N.attn.{qkv_proj,out_proj}` y `blocks.N.mlp.{fc1,fc2}`), que pasan a INT8 con un tensor `.comfy_quant` por bloque (`{"format": "int8_tensorwise", "convrot": true, "convrot_groupsize": 256}`) y una escala F32 por fila. El resto de tensores mantiene el dtype de Comfy-Org.

El proceso de construcción es reproducible: se parte de `diffusion_models/minimax_h3_fl2va_pruned_bf16.safetensors` (revisión de Comfy-Org) y del LoRA `minimax_h3/dmad_minimax_h3_4step_full_critic_comfyui.safetensors` (revisión `b08c2bf3` de ZhengmingYu/DMAD), se fusiona y se cuantiza. Los nombres, orden, dtypes, formas, offsets y descriptores `.comfy_quant` coinciden exactamente con el fichero de Comfy-Org, de modo que es un reemplazo directo en los workflows existentes. No se dispone de información sobre el número de tokens de entrenamiento ni la composición del dataset del modelo base.

## Capacidades

- Generación conjunta de vídeo y audio a partir de texto (text-to-audio-video).
- Generación condicionada por primer y último frame (FL2VA).
- Generación con referencias multimodales: imágenes (`<Picture i>`), vídeos (`<Video k>`) y audio (`<Audio j>`) en el prompt.
- Muestreo few-step: 4 pasos con CFG 1, shift vídeo 12 y shift audio 2.
- Resolución de salida de 1344×768 a 24 fps con 124 frames en los ejemplos publicados.
- Compatibilidad con atención dispersa (SageAttention con densidad 0.15, primer paso denso) según los ejemplos.
- Carga directa en ComfyUI sin cargador de LoRA (destilación ya fusionada).
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).

## Casos de uso

- **Generación de clips cinematográficos locales:** el modelo produce vídeo de 1344×768 con audio en 4 pasos, lo que permite iterar prompts de forma rápida en una estación de trabajo con GPU de gran VRAM, usando el sampler DMAD y CFG 1.
- **Prototipado de anuncios y storyboards:** con FL2VA se pueden fijar el primer y el último frame de una secuencia y dejar que el modelo interpole el movimiento y el audio, útil para previsualizar planos antes de rodar.
- **Animación de ilustraciones con audio sincronizado:** a partir de una imagen de referencia (`<Picture 1>`) se generan escenas con sonido ambiente (por ejemplo, tormenta y olas) coherentes con la imagen, sin pipeline separado de audio.
- **Postproducción y extensiones de plano:** la variante Ref2VA permite referenciar frames o clips previos (`<Video k>`) para mantener continuidad visual entre tomas generadas en sesiones distintas.
- **Investigación en destilación few-step:** el fichero sirve como caso de estudio reproducible de fusión de LoRA DMAD y cuantización INT8 ConvRot sobre un transformer de difusión, con layout idéntico al original para comparar calidad frente a bf16.
- **Despliegue en ComfyUI para equipos pequeños:** al ser un single-file safetensors con descriptores `.comfy_quant`, se integra en workflows existentes de ComfyUI sin reescribir nodos ni añadir cargadores de LoRA.
- **Generación de contenido audiovisual para entornos con VRAM limitada:** la cuantización INT8 reduce el peso de las capas lineales, lo que facilita ejecutar el modelo en GPUs de 24-48 GB en lugar de requerir múltiples aceleradores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye ejemplos cualitativos (vídeos de muestra con semilla 42, 1344×768, 124 frames, 4 y 8 pasos) y parámetros de muestreo, sin métricas cuantitativas como FVD, CLIP score o comparativas numéricas frente a otras variantes.

## Requisitos de hardware

- **VRAM estimada:** no disponible de forma explícita. El repo pesa 83,9 GB, pero incluye cuatro ficheros (FL2VA y Ref2VA en 4 y 8 pasos); cada fichero individual es sustancialmente menor. La cuantización INT8 de las capas lineales de bloque reduce el peso respecto a bf16, pero no se publica la cifra exacta por fichero.
- **GPU recomendadas:** no disponible en la información proporcionada. Por el tamaño típico de un transformer de vídeo-audio de esta categoría, se espera que requiera GPUs de gama alta (A100/H100 o RTX 4090/5090 con suficiente VRAM), pero no hay dato confirmado.
- **¿Cabe en GPU de consumo?** No confirmado. La cuantización INT8 y la poda apuntan a que puede ejecutarse en GPUs de consumo de gama alta, pero el autor no publica requisitos mínimos.
- **Opciones de despliegue:** ComfyUI (formato nativo, `diffusion-single-file`), con sampler DMAD. Los ejemplos usan Nox con SageAttention y atención dispersa a densidad 0.15. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusión).
- **Latencia y throughput:** no disponibles. Solo se indica que el muestreo es de 4 pasos (o 8 en la variante correspondiente) con CFG 1, lo que reduce el coste frente a muestreos de decenas de pasos.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-FL2VA-DMAD-4step-int8-convrot (este) | Vídeo+audio, FL2VA, destilado | 4 | INT8 ConvRot | MiniMax-H3 Community License | Hugging Face, single-file |
| Comfy-Org/MiniMax-H3 (base) | Vídeo+audio, FL2VA/Ref2VA | no disponible (requiere LoRA DMAD para few-step) | bf16 / INT8 ConvRot sin destilar | MiniMax-H3 Community License | Hugging Face, ComfyUI |
| ZhengmingYu/DMAD (LoRA) | Destilación few-step sobre MiniMax-H3 | 4 u 8 | bf16 (LoRA) | no disponible en la información | Hugging Face |
| MiniMax-H3-FL2VA-DMAD-8step-int8-convrot (variante del mismo autor) | Vídeo+audio, FL2VA, destilado | 8 | INT8 ConvRot | MiniMax-H3 Community License | Hugging Face, single-file |

No se dispone de datos de benchmarks para comparar rendimiento numérico entre estas variantes; la comparación se limita a configuración, licencia y formato de distribución.

## Limitaciones y advertencias

- **Licencia restrictiva:** la MiniMax-H3 Community License Agreement no es una licencia open source estándar; es imprescindible revisar sus términos antes de cualquier uso comercial.
- **Ref2VA no entrenado con DMAD:** el LoRA DMAD se entrenó sobre el transformer text-to-audio-video, no sobre Ref2VA. Los autores indican que carga en la partición Ref2VA pero no publican resultados; la calidad de la variante Ref2VA destilada no está validada.
- **Riesgo de alucinación visual y de audio:** como todo modelo generativo de difusión, puede producir artefactos, incoherencias temporales o audio desincronizado, especialmente con prompts ambiguos o referencias contradictorias.
- **Sesgos:** no se documentan sesgos específicos, pero el modelo hereda los del dataset de entrenamiento de MiniMax-H3, no disponible en esta información.
- **Idiomas:** no se especifican idiomas soportados para los prompts; la documentación solo muestra prompts en inglés.
- **Requisitos de hardware no publicados:** no hay cifras oficiales de VRAM mínima ni de latencia, lo que dificulta planificar despliegues en producción.
- **Dependencia del ecosistema ComfyUI:** el layout está pensado para ComfyUI y el sampler DMAD; fuera de ese entorno la integración requiere trabajo adicional.
- **Configuración de muestreo estricta:** usar 4 pasos en el fichero de 4 pasos y 8 en el de 8, con CFG 1, shift vídeo 12 y shift audio 2; desviarse de estos valores puede degradar la calidad.
- **Atención dispersa opcional:** los ejemplos usan SageAttention con densidad 0.15 (primer paso denso); no se documenta el impacto en calidad de otras configuraciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Spectrallic/MiniMax-H3-FL2VA-DMAD-4step-int8-convrot
- Modelo base Comfy-Org/MiniMax-H3: https://huggingface.co/Comfy-Org/MiniMax-H3
- LoRA DMAD (ZhengmingYu): https://huggingface.co/ZhengmingYu/DMAD
- Repositorio de workflows DMAD: https://huggingface.co/ZhengmingYu/DMAD
- Blog sobre atención dispersa (SageAttention, densidad 0.15): https://noxengine.dev/blog/sparse/
- Paper de referencia (arXiv:2610.02188): https://arxiv.org/abs/2610.02188
