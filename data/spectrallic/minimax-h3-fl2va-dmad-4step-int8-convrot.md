# Spectrallic/MiniMax-H3-FL2VA-DMAD-4step-int8-convrot

## Resumen

MiniMax-H3-FL2VA-DMAD-4step-int8-convrot es una repackaging cuantizada del transformer de difusion MiniMax-H3 FL2VA (frame-level to video-audio) de MiniMax, publicado por el usuario Spectrallic. El modelo parte del checkpoint podado en BF16 de Comfy-Org y le incorpora, fusionada a fuerza 1.0, la LoRA de destilacion DMAD `full_critic` de 4 pasos (rango 128, con q/k/v fusionadas en adaptadores de rango 384). Sobre ese resultado se aplica una cuantizacion INT8 con rotacion Hadamard ConvRot por grupos de 256 y escalas por fila.

El problema que resuelve es practico: permite ejecutar el modelo destilado a 4 pasos sin cargar un nodo LoRA adicional, manteniendo exactamente el mismo layout de tensores que el fichero INT8 oficial de Comfy-Org (`minimax_h3_fl2va_pruned_int8_convrot.safetensors`). Esto simplifica el despliegue en ComfyUI y en otros entornos de inferencia de difusion.

Es relevante ahora porque combina tres tendencias: destilacion few-step (4 pasos en lugar de decenas), cuantizacion INT8 con rotaciones para preservar calidad, y empaquetado single-file para ComfyUI. El repo ocupa 21 GB y la licencia es la MiniMax H3 Community License Agreement, con restricciones territoriales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (MiniMax-H3 FL2VA), con bloques de atencion y MLP, mas `token_refiner` |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible (modelo de difusion, no de texto) |
| Tipos de cuantizacion | INT8 tensorwise con ConvRot (grupo 256) en los 200 lineales de bloque; BF16 en el resto |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (con restricciones territoriales) |
| Formato de pesos | safetensors single-file (diffusion-single-file), compatible con ComfyUI |
| Tamano del repo | 21.0 GB |
| Pasos de muestreo | 4 (destilacion DMAD) |
| CFG | 1.0 (sin classifier-free guidance) |
| Shift (video / audio) | 12 / 2 |
| Bloques | 50 bloques + 2 `token_refiner` |
| Rango de LoRA fusionada | 128 (384 en qkv_proj) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de difusion para generacion conjunta de video y audio (text-to-audio-video), en su variante FL2VA podada. El transformer consta de 50 bloques, cada uno con atencion (`attn.qkv_proj`, `attn.out_proj`) y MLP (`mlp.fc1`, `mlp.fc2`), mas dos bloques `token_refiner`. Los 200 lineales de bloque estan cuantizados a INT8 con rotacion Hadamard ConvRot por grupos de 256 y escalas F32 por fila; los 8 pesos fusionados del `token_refiner` se mantienen en BF16 porque esa capa no esta cuantizada en el fichero de referencia de Comfy-Org.

El entrenamiento del modelo base no se detalla en la informacion disponible. Lo que si se documenta es el proceso de destilacion: la LoRA DMAD `full_critic` de 4 pasos se fusiona en FP32 con `W' = W + (alpha/rank) · up @ down` sobre sus 208 objetivos (atencion y MLP de los 50 bloques y de los dos `token_refiner`). La innovacion tecnica clave es la destilacion few-step: el estudiante opera a 4 pasos con CFG 1, reduciendo drasticamente el coste de inferencia. La verificacion de presencia de LoRA da 0.9977 global, con 205 de 208 capas dentro de 1 ± 0.1.

## Capacidades

- Generacion de video a partir de texto (text-to-video) con resoluciones como 1344×768.
- Generacion conjunta de audio y video (text-to-audio-video), segun los tags del modelo.
- Condicionamiento frame-level (FL2VA), lo que permite control por frames.
- Inferencia few-step: 4 pasos de muestreo con CFG 1.0.
- Compatibilidad con samplers DMAD (`lcm` con scheduler `simple`, o nodos DMAD Sampler / DMAD Sigmas).
- Integracion con atencion dispersa (SageAttention con densidad 0.15, primer paso denso).
- Formato single-file listo para ComfyUI, sin necesidad de cargador LoRA.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).

## Casos de uso

- Generacion de video cinematografico a partir de prompts detallados: con 4 pasos y CFG 1 se obtienen planos de camara complejos (dolly-in, establishing shots) en resoluciones de 1344×768 con 124 frames a 24 fps, como muestra el ejemplo del autor.
- Prototipado rapido de escenas audiovisuales: al generar audio y video conjuntamente, sirve para previsualizar secuencias con banda sonora sin pipelines separados.
- Produccion en ComfyUI: al compartir layout exacto con el fichero INT8 oficial, se puede sustituir directamente el checkpoint en un workflow existente y eliminar el nodo LoRA, reduciendo complejidad del grafo.
- Iteracion con control frame-level: el condicionamiento FL2VA permite guiar la generacion por frames concretos, util para ajustar transiciones o continuidad entre planos.
- Render de bajo coste en GPUs de consumo: la cuantizacion INT8 y los 4 pasos reducen VRAM y tiempo frente al modelo BF16 sin destilar.
- Integracion en pipelines de investigacion sobre destilacion: sirve como referencia para comparar calidad entre el modelo base, el destilado con LoRA separada y esta version fusionada.
- Generacion de material para videojuegos o entornos virtuales: escenas de fantasia o arquitectura detallada a partir de descripciones textuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repo pesa 21.0 GB, por lo que se necesita al menos esa capacidad para cargar los pesos, mas overhead de activaciones para 124 frames a 1344×768.
- GPU recomendadas: no disponible en la informacion; por tamano, se requieren GPUs de datacenter o profesionales con 24 GB o mas (A100, H100, RTX 4090, RTX A6000).
- Cabe en consumer GPU: probablemente en RTX 4090 (24 GB) con margen ajustado; no confirmado por el autor.
- Opciones de despliegue: ComfyUI (formato nativo), Nox (usado por el autor para el ejemplo), con soporte de SageAttention y atencion dispersa.
- Latencia y throughput: no disponibles; el ejemplo se genero con 4 pasos, lo que reduce el coste frente a muestreo denso, pero no se publican tiempos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Pasos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-FL2VA-DMAD-4step-int8-convrot (este) | no disponible | no aplica | 4 | MiniMax H3 Community | HuggingFace, single-file |
| Comfy-Org/MiniMax-H3 (pruned INT8 ConvRot) | no disponible | no aplica | segun sampler | MiniMax H3 Community | HuggingFace, ComfyUI |
| Comfy-Org/MiniMax-H3 (pruned BF16) | no disponible | no aplica | segun sampler | MiniMax H3 Community | HuggingFace, ComfyUI |
| MiniMaxAI/MiniMax-H3 (original) | no disponible | no aplica | segun sampler | MiniMax H3 Community | HuggingFace |

La diferencia principal frente a los checkpoints de Comfy-Org es la destilacion DMAD ya fusionada, que reduce el muestreo a 4 pasos sin cargador LoRA. Frente al modelo original, esta version esta podada y cuantizada, con menor huella de memoria.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un modelo generativo de video, puede reproducir sesgos de los datos de entrenamiento del base.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar contenido incoherente o fisicamente implausible, especialmente en escenas complejas.
- Limitaciones de contexto o idioma: no se especifican idiomas soportados ni limites de longitud de prompt.
- Restricciones de licencia: la MiniMax H3 Community License Agreement incluye restricciones territoriales; es imprescindible revisar `LICENSE` y `NOTICE` antes de uso comercial.
- El autor indica que el fichero no ha sido probado en ComfyUI; el ejemplo se renderizo en Nox.
- La presencia de LoRA no es perfecta en tres capas del `token_refiner` (valores 0.647, 0.896 y 0.899), lo que puede introducir diferencias sutiles frente al modelo destilado original.
- Los pesos difieren del release oficial de MiniMax-H3; no es un checkpoint oficial ni validado por MiniMax.
- Requiere samplers y shifts especificos (4 pasos, CFG 1, shift 12/2); usarlo fuera de ese punto de operacion puede degradar la calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Spectrallic/MiniMax-H3-FL2VA-DMAD-4step-int8-convrot
- Modelo base (Comfy-Org): https://huggingface.co/Comfy-Org/MiniMax-H3
- Modelo original: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Destilacion DMAD: https://huggingface.co/ZhengmingYu/DMAD
- Paper DMAD: https://arxiv.org/abs/2610.02188
- Codigo DMAD: https://github.com/Yzmblog/DMAD
- Blog sobre atencion dispersa (SageAttention): https://noxengine.dev/blog/sparse/
- Ejemplo de video: https://huggingface.co/Spectrallic/MiniMax-H3-FL2VA-DMAD-4step-int8-convrot/resolve/main/samples/floating_city_1344x768_seed42.mp4
