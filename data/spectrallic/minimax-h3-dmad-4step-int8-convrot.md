# Spectrallic/MiniMax-H3-DMAD-4step-int8-convrot

## Resumen

MiniMax-H3-DMAD-4step-int8-convrot es una versión destilada y cuantizada de los transformadores de difusión MiniMax-H3 en sus variantes FL2VA (first-last frame to video-audio) y Ref2VA (reference to video-audio), publicada por el usuario Spectrallic. Sobre los pesos podados en bf16 de Comfy-Org/MiniMax-H3 se ha fusionado a rango completo el LoRA de destilación DMAD del repositorio ZhengmingYu/DMAD, y el resultado se ha cuantizado a INT8 con la técnica ConvRot. El objetivo es reducir drásticamente el número de pasos de muestreo —de los habituales en un modelo de difusión completo a solo 4 u 8 pasos— manteniendo la calidad, y a la vez recortar el peso y el coste de inferencia mediante la cuantización INT8.

El paquete incluye cuatro ficheros: FL2VA y Ref2VA, cada uno en variante de 4 pasos (estudiante `full_critic`) y de 8 pasos (estudiante `8step_full_critic`). Todos comparten la misma estructura de tensores que los ficheros originales de Comfy-Org, de modo que son intercambiables en el mismo pipeline de ComfyUI sin necesidad de cargar un LoRA aparte, ya que la destilación está incorporada en los pesos. El repositorio ocupa 83,9 GB en total y acumula más de 7000 descargas.

La relevancia actual es doble: por un lado, la destilación few-step hace viable generar vídeo con audio en hardware de consumo en lugar de requerir clústeres; por otro, la cuantización INT8 tensorwise con ConvRot reduce el peso del modelo sin cambiar los descriptores `.comfy_quant` que espera el ecosistema ComfyUI. Es, en la práctica, un artefacto de despliegue listo para usar en flujos de trabajo de generación de vídeo-audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (MiniMax-H3), variantes FL2VA y Ref2VA, con destilación DMAD fusionada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusión, no de lenguaje) |
| Tipos de cuantizacion | INT8 tensorwise con ConvRot (grupo de 256) en los lineales de cada bloque; resto de tensores en el dtype original de Comfy-Org |
| Idiomas soportados | no disponible (prompts de texto; el modelo card no declara lista de idiomas) |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors (single-file, librería `diffusion-single-file`) |

## Arquitectura y entrenamiento

El modelo base es un transformer de difusión de MiniMax-H3 en sus particiones FL2VA y Ref2VA, ya podadas (`pruned`) respecto al release original. Sobre esos pesos en bf16 se fusiona a rango completo el LoRA de DMAD, un método de destilación que produce estudiantes capaces de muestrear en muy pocos pasos. La variante de 4 pasos usa el estudiante `full_critic` y la de 8 pasos el `8step_full_critic`, entrenado específicamente para 8 pasos de muestreo. Tras la fusión, cada lineal de bloque (`blocks.N.attn.{qkv_proj,out_proj}` y `blocks.N.mlp.{fc1,fc2}`) se cuantiza a INT8 con ConvRot y se le añade un tensor `.comfy_quant` con el descriptor `{"format": "int8_tensorwise", "convrot": true, "convrot_groupsize": 256}` junto a un `weight_scale` F32 por fila. Los nombres, orden, dtypes, formas y offsets de tensores coinciden con los ficheros de Comfy-Org, lo que garantiza compatibilidad directa.

Un detalle técnico relevante: DMAD se entrenó sobre el transformador text-to-audio-video, y los pesos de Ref2VA difieren de ese transformador. Los autores del LoRA indican que este carga sobre la partición Ref2VA pero no publican resultados para ella, por lo que la calidad de la variante Ref2VA destilada es una extrapolación, no una validación publicada. No se dispone de información sobre el número de tokens, composición del dataset ni si hubo RLHF/DPO en el entrenamiento original.

## Capacidades

- Generación de vídeo con audio sincronizado a partir de texto (text-to-audio-video).
- Generación condicionada por primer y último fotograma (FL2VA): el prompt define la escena y el modelo interpola el movimiento entre ambos extremos.
- Generación condicionada por referencias (Ref2VA): permite referirse a `<Picture i>`, `<Video k>` y `<Audio j>` dentro del prompt para reutilizar elementos visuales o sonoros.
- Muestreo few-step: 4 pasos en los ficheros de 4 pasos y 8 pasos en los de 8 pasos, con CFG 1.0 (sin classifier-free guidance).
- Resolución de salida de 1344×768 y 124 fotogramas a 24 fps en los ejemplos publicados.
- Control de time shift independiente para vídeo (12) y audio (2).
- Compatibilidad con SageAttention y atención dispersa (densidad 0.15, primer paso denso) para acelerar el render.
- No soporta tool calling, function calling ni razonamiento multi-step: es un modelo generativo de medios, no un LLM.

## Casos de uso

- Previsualización rápida de storyboards: con 4 pasos y CFG 1 el coste por iteración es mínimo, lo que permite generar decenas de variantes de una escena para elegir dirección artística antes de un render final de más calidad.
- Generación de clips con audio para redes sociales: el modelo produce vídeo y sonido en una sola pasada a 1344×768 y 24 fps, suficiente para formatos verticales u horizontales de publicación directa.
- Interpolación de fotogramas clave en animación: la variante FL2VA toma primer y último fotograma y rellena la transición, útil para completar animáticas con movimiento coherente entre poses dibujadas.
- Consistencia de personajes entre planos: la variante Ref2VA permite fijar un personaje o escenario mediante `<Picture i>` y reutilizarlo en prompts distintos, lo que sirve para mantener continuidad en una secuencia de varios clips.
- Prototipado de anuncios y vídeo promocional: a partir de un brief de texto se generan borradores con audio ambiente y efectos, que luego se editan en un pipeline tradicional.
- Render en hardware de consumo: al estar cuantizado a INT8 y destilado a pocos pasos, un usuario con una GPU de gama alta puede ejecutar el modelo en local dentro de ComfyUI sin depender de servicios en la nube.
- Investigación en destilación de modelos de difusión: el artefacto sirve como referencia reproducible de fusión de LoRA DMAD más cuantización ConvRot sobre un transformer de vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta los parámetros de muestreo de los ejemplos (4 u 8 pasos, CFG 1.0, 1344×768, 124 fotogramas a 24 fps, semilla 42, shift 12/2) y el uso de SageAttention con atención dispersa a densidad 0.15, sin métricas cuantitativas de calidad (FVD, CLIP score, etc.) ni comparación numérica con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repositorio completo pesa 83,9 GB, pero cada fichero individual corresponde a una sola variante; el peso en INT8 de un transformador de este tamaño sitúa la inferencia en el rango de GPUs de 24 GB o más, aunque el dato exacto no está publicado.
- GPU recomendadas: no disponibles en la información proporcionada. Por el formato y el ecosistema (ComfyUI, SageAttention), es esperable que funcione en GPUs NVIDIA con soporte de kernels INT8 y atención optimizada, pero no se confirma ningún modelo concreto.
- ¿Cabe en GPU de consumo? No confirmado. La cuantización INT8 y la destilación few-step están diseñadas precisamente para acercar el modelo a hardware de consumo, pero la model card no especifica requisitos mínimos.
- Opciones de despliegue: ComfyUI es el entorno de referencia (estructura de tensores y descriptores `.comfy_quant` idénticos a los ficheros de Comfy-Org). Los ejemplos se renderizaron en Nox con el sampler DMAD. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusión de este tipo.
- Latencia y throughput: no disponibles. Solo se indica que el render de ejemplo usa 4 u 8 pasos con atención dispersa, lo que reduce el coste frente a un muestreo completo, pero sin cifras de tiempo por clip.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos de muestreo | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-DMAD-4step-int8-convrot (este) | Difusión vídeo+audio, FL2VA/Ref2VA | 4 u 8 | INT8 ConvRot | minimax-h3-community-license-agreement | Hugging Face, single-file para ComfyUI |
| Comfy-Org/MiniMax-H3 (base) | Difusión vídeo+audio, FL2VA/Ref2VA | Muestreo completo | bf16 (y variantes int8_convrot sin destilar) | minimax-h3-community-license-agreement | Hugging Face |
| ZhengmingYu/DMAD (LoRA) | LoRA de destilación sobre MiniMax-H3 | 4 u 8 (según estudiante) | bf16, requiere loader de LoRA | no disponible en la información | Hugging Face |

La comparación con alternativas de otros fabricantes (por ejemplo, modelos de vídeo de otros laboratorios) no está disponible en la información proporcionada, por lo que no se incluye.

## Limitaciones y advertencias

- La variante Ref2VA no fue entrenada con DMAD: los pesos de Ref2VA difieren del transformador text-to-audio-video sobre el que se entrenó el LoRA, y los autores no publican resultados para esa partición. La calidad de Ref2VA destilada no está validada.
- Licencia `minimax-h3-community-license-agreement`: es una licencia comunitaria con posibles restricciones de uso comercial. Hay que revisar el fichero LICENSE antes de cualquier despliegue en producción.
- Riesgo de alucinación visual y sonora: como todo modelo generativo, puede producir artefactos, incoherencias temporales o audio mal sincronizado, especialmente en los pasos mínimos (4).
- Los ejemplos publicados usan una única semilla (42) y un único par de prompts; no hay evidencia de robustez ante prompts diversos.
- El modelo está pensado para el punto de operación exacto de cada estudiante (4 pasos para los ficheros de 4, 8 para los de 8). Usar otro número de pasos o CFG distinto de 1.0 puede degradar la calidad.
- No se declara lista de idiomas soportados para los prompts; no hay garantía de comportamiento multilingüe más allá del inglés de los ejemplos.
- El tamaño del repositorio (83,9 GB) y la ausencia de requisitos de VRAM publicados obligan a validar el despliegue en el hardware objetivo antes de comprometerse.
- No hay métricas de benchmarks ni comparaciones cuantitativas publicadas, lo que impide evaluar la pérdida de calidad frente al modelo base sin destilar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Spectrallic/MiniMax-H3-DMAD-4step-int8-convrot
- Modelo base: https://huggingface.co/Comfy-Org/MiniMax-H3
- LoRA de destilación DMAD: https://huggingface.co/ZhengmingYu/DMAD
- Paper referenciado (arXiv:2610.02188): https://arxiv.org/abs/2610.02188
- Blog sobre atención dispersa y SageAttention: https://noxengine.dev/blog/sparse/
- Ejemplo FL2VA 4 pasos: https://huggingface.co/Spectrallic/MiniMax-H3-DMAD-int8-convrot/resolve/main/samples/floating_city_1344x768_seed42.mp4
- Ejemplo Ref2VA 4 pasos: https://huggingface.co/Spectrallic/MiniMax-H3-DMAD-int8-convrot/resolve/main/samples/stormy_boat_1344x768_seed42.mp4
- Ejemplo FL2VA 8 pasos: https://huggingface.co/Spectrallic/MiniMax-H3-DMAD-int8-convrot/resolve/main/samples/floating_city_8step_1344x768_seed42.mp4
- Ejemplo Ref2VA 8 pasos: https://huggingface.co/Spectrallic/MiniMax-H3-DMAD-int8-convrot/resolve/main/samples/stormy_boat_8step_1344x768_seed42.mp4
