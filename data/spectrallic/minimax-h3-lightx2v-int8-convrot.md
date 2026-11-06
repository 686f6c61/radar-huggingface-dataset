# Spectrallic/MiniMax-H3-LightX2V-int8-convrot

## Resumen

MiniMax-H3-LightX2V-int8-convrot es un conjunto de cuatro archivos de pesos para el transformer de difusión MiniMax-H3, publicados por el usuario Spectrallic. Parten de los modelos podados FL2VA (first-last frame to video+audio) y Ref2VA (reference to video+audio) de Comfy-Org/MiniMax-H3, a los que se ha fusionado el LoRA de destilación LightX2V Turbo (rank 128, sin reducción de rango) y se ha aplicado una cuantización INT8 con rotación de convolución (ConvRot) sobre todas las capas lineales de los bloques. El resultado son checkpoints de inferencia en pocos pasos (4 u 8) listos para usar sin cargador de LoRA.

La relevancia de esta variante es práctica: elimina la necesidad de aplicar el LoRA Turbo por separado y reduce el peso de los bloques lineales a INT8 con escalas por fila, manteniendo la disposición exacta de tensores, dtypes, formas y descriptores `.comfy_quant` del archivo original de Comfy-Org. Esto facilita el intercambio directo en flujos de trabajo existentes y reduce los requisitos de memoria frente a los pesos BF16.

El modelo cubre generación conjunta de vídeo y audio a partir de texto, condicionamiento por primer y último fotograma, y generación con referencias multimodales (imágenes, vídeos y audio) mediante marcadores en el prompt. La licencia es la MiniMax-H3 Community License Agreement, no una licencia de código abierto estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (MiniMax-H3), variantes FL2VA y Ref2VA podadas, con LoRA LightX2V Turbo fusionado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 tensorwise con ConvRot (grupo 256) en lineales de bloque; resto de tensores en dtype original de Comfy-Org |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors (diffusion-single-file) |

## Arquitectura y entrenamiento

La arquitectura subyacente es el transformer de difusión MiniMax-H3 en sus variantes podadas FL2VA y Ref2VA. Cada bloque lineal (`blocks.N.attn.qkv_proj`, `blocks.N.attn.out_proj`, `blocks.N.mlp.fc1`, `blocks.N.mlp.fc2`) se almacena en INT8 con un tensor `.comfy_quant` propio que declara `{"format": "int8_tensorwise", "convrot": true, "convrot_groupsize": 256}` y una escala `weight_scale` F32 por fila. El resto de tensores conserva el dtype de Comfy-Org.

El proceso de construcción parte del checkpoint BF16 podado de Comfy-Org (revisión `912b6e38` para Ref2VA) y del LoRA Turbo de lightx2v/Minimax-h3-Turbo (revisión `30f485ed`), en su conversión ComfyUI a 768p con rank 128 y q/k/v fusionados en `attn.qkv_pr...`. La destilación queda incorporada en los pesos, de modo que el punto de operación del estudiante es de 4 pasos para los archivos 4-step y 8 pasos para los 8-step, con CFG 1, shift temporal de vídeo 6 y shift de audio 3. Las versiones de los archivos son 1.3 (FL2VA 4-step), 1.0 (Ref2VA 4-step) y 1.1 (ambos 8-step).

## Capacidades

- Generación de vídeo con audio sincronizado a partir de prompt de texto (text-to-audio-video).
- Condicionamiento por primer y último fotograma (FL2VA) para interpolar o animar entre dos imágenes dadas.
- Generación con referencias multimodales (Ref2VA): imágenes, vídeos y audio referenciados en el prompt como `<Picture i>`, `<Video k>` y `<Audio j>`.
- Inferencia en pocos pasos: 4 u 8 pasos según el archivo, sin CFG.
- Resolución de trabajo documentada de 1344×768 con 124 fotogramas a 24 fps.
- Compatibilidad de diseño con los flujos de ComfyUI: mismos nombres, orden, dtypes, formas y offsets que los archivos de Comfy-Org.
- Uso conjunto con SageAttention y atención dispersa (densidad 0.15, primer paso denso) según los ejemplos del autor.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; no aplica a un modelo de difusión.

## Casos de uso

- Previsualización rápida de storyboards: con 4 pasos y CFG 1 se obtienen clips de 124 fotogramas a 24 fps en una sola pasada, lo que permite iterar sobre un guion visual antes de un render de mayor calidad con los archivos de 8 pasos.
- Animación entre fotogramas clave: la variante FL2VA acepta primer y último fotograma, útil para generar transiciones en secuencias de animación o para rellenar interpolaciones con audio coherente.
- Consistencia de personajes y escenarios: Ref2VA permite fijar una imagen de referencia (`<Picture 1>`) y mantener su apariencia en planos nuevos, como demuestra el ejemplo del barco y la ciudad flotante.
- Generación de audio diegético en vídeo: el modelo produce audio junto al vídeo, lo que sirve para borradores de escenas con diálogo, ambiente o efectos (truenos, olas) descritos en el prompt.
- Integración en pipelines de ComfyUI: al conservar la disposición exacta de los tensores y los descriptores de cuantización, los archivos se pueden sustituir por los de Comfy-Org en un grafo existente sin cargador de LoRA adicional.
- Despliegue con menor huella de memoria: la cuantización INT8 de los lineales de bloque reduce el peso frente a BF16, lo que facilita ejecutar el modelo en entornos con VRAM ajustada manteniendo la estructura de pesos esperada por el runtime.
- Pruebas comparativas de calidad entre 4 y 8 pasos: disponer de ambas variantes con el mismo prompt y semilla permite medir la pérdida de fidelidad del modo rápido frente al de 8 pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta parámetros de muestreo y ejemplos cualitativos (vídeos de muestra), sin métricas cuantitativas de calidad, latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repositorio ocupa 83,9 GB e incluye cuatro checkpoints; la cuantización INT8 de los lineales de bloque reduce el peso respecto a BF16, pero no se publica una cifra de VRAM por archivo.
- GPU recomendadas: no disponible. El autor no especifica hardware de referencia para los ejemplos.
- Compatibilidad con GPU de consumo: no confirmada. Dado el tamaño del repositorio y la resolución de ejemplo (1344×768, 124 fotogramas), es previsible que requiera GPU de gama alta o profesional, pero no hay dato publicado.
- Opciones de despliegue: el autor cita Nox con el sampler LightX2V Turbo (Euler) y flujos de ComfyUI; los archivos siguen la disposición de Comfy-Org. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusión de este tipo.
- Aceleración: SageAttention con atención dispersa a densidad 0.15 (primer paso denso) en los ejemplos publicados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Pasos de muestreo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spectrallic/MiniMax-H3-LightX2V-int8-convrot | no disponible | no disponible | 4 u 8, CFG 1 | minimax-h3-community-license-agreement | Hugging Face (0 descargas) |
| Comfy-Org/MiniMax-H3 | no disponible | no disponible | flujo estándar con LoRA separado | licencia MiniMax-H3 | Hugging Face (modelo base) |
| lightx2v/Minimax-h3-Turbo | no disponible | no disponible | 4 u 8 (LoRA) | según repositorio de origen | Hugging Face (LoRA) |

La comparación se limita a los modelos de los que deriva, ya que no se dispone de datos de benchmarks ni de especificaciones de parámetros para contrastar con alternativas de la misma categoría.

## Limitaciones y advertencias

- Los pesos difieren del release original de MiniMax-H3: incorporan destilación y cuantización, por lo que los resultados no serán idénticos a los del modelo base.
- Licencia MiniMax-H3 Community License Agreement: no es una licencia de código abierto permisiva; es imprescindible revisar el archivo `LICENSE` antes de cualquier uso comercial.
- El punto de operación está fijado por el estudiante destilado (4 u 8 pasos, CFG 1, shifts 6/3). Usar otros valores de pasos o CFG puede degradar la calidad de forma significativa.
- La cuantización INT8 con ConvRot introduce una pérdida de fidelidad frente a BF16 no cuantificada en la model card.
- No se documentan sesgos, idiomas soportados ni comportamiento multilingüe; el prompt de los ejemplos está en inglés.
- Riesgo de alucinación visual y de audio: como todo modelo generativo, puede producir contenido incoherente o no solicitado, especialmente con prompts ambiguos o referencias poco claras.
- El etiquetado de referencias en Ref2VA depende de la sintaxis exacta `<Picture i>`, `<Video k>`, `<Audio j>`; un formato incorrecto puede ignorar la referencia.
- Repositorio con 0 descargas y 0 likes: no hay validación comunitaria ni informes independientes de calidad o estabilidad.
- No se especifican requisitos de VRAM ni hardware de referencia, lo que dificulta planificar el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Spectrallic/MiniMax-H3-LightX2V-int8-convrot
- Modelo base (Comfy-Org): https://huggingface.co/Comfy-Org/MiniMax-H3
- LoRA Turbo (lightx2v): https://huggingface.co/lightx2v/Minimax-h3-Turbo
- Blog sobre atención dispersa y SageAttention citado por el autor: https://noxengine.dev/blog/sparse/
- Ejemplo FL2VA 4 pasos: https://huggingface.co/Spectrallic/MiniMax-H3-LightX2V-int8-convrot/resolve/main/samples/floating_city_1344x768_seed42.mp4
- Ejemplo Ref2VA 4 pasos: https://huggingface.co/Spectrallic/MiniMax-H3-LightX2V-int8-convrot/resolve/main/samples/stormy_boat_1344x768_seed43.mp4
- Ejemplo FL2VA 8 pasos: https://huggingface.co/Spectrallic/MiniMax-H3-LightX2V-int8-convrot/resolve/main/samples/floating_city_8step_1344x768_seed42.mp4
- Ejemplo Ref2VA 8 pasos: https://huggingface.co/Spectrallic/MiniMax-H3-LightX2V-int8-convrot/resolve/main/samples/stormy_boat_8step_1344x768_seed43.mp4
