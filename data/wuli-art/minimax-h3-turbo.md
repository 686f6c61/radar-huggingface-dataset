# Wuli-art/MiniMax-H3-Turbo

## Resumen

Wuli MiniMax-H3 Turbo es un conjunto de adaptadores y transformers afinados (LoRA y modelos completos en formato Diffusers) sobre MiniMaxAI/MiniMax-H3, el modelo base de generación conjunta de vídeo y audio de MiniMax. Lo desarrolla el usuario independiente Wuli-art y resuelve el principal cuello de botella práctico del modelo original: la necesidad de decenas de pasos de denoising (la comparativa oficial usa 50 pasos para el H3 original) para obtener resultados utilizables. Turbo reduce ese coste a 4, 6 u 8 pasos según la variante, manteniendo la generación simultánea de pista de vídeo y pista de audio en un único MP4 (H.264 + AAC).

El repositorio incluye cuatro variantes: `turbo-4step/` (adaptador compacto con LoRA de backbone y proyecciones de salida de vídeo/audio fusionadas), `turbo-6step/`, `turbo-8step/` (transformers completos en formato Diffusers) y `ref2va-turbo-8step/`, que añade generación condicionada por referencia (imágenes o vídeos de referencia, con audio de referencia opcional). Es relevante ahora porque abarata drásticamente la inferencia de un modelo audio-vídeo de gran tamaño y porque ofrece integración directa con ComfyUI mediante un node pack propio, lo que lo hace accesible a flujos de trabajo de estudio sin infraestructura de servidor dedicada.

El modelo base MiniMax-H3 es un sistema de difusión para generación audio-vídeo; el repo de Turbo ocupa 123,5 GB, lo que refleja que varias variantes almacenan el transformer completo y no solo adaptadores. La licencia es la MiniMax-H3 Community License Agreement, heredada del modelo base, con las restricciones que ello implica para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión sobre transformer (DiT) audio-vídeo del modelo base MiniMax-H3; variantes como LoRA y como transformer completo en formato Diffusers |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible (modelo de generación de vídeo, no de texto; ventana de prompt no especificada) |
| Tipos de cuantizacion | no disponible (el repo distribuye safetensors en precisión original; no se documentan GGUF ni FP8) |
| Idiomas soportados | no disponible (los prompts del demo están en inglés; no se declara cobertura multilingüe) |
| Licencia | minimax-h3-community-license-agreement (heredada de MiniMaxAI/MiniMax-H3) |
| Formato de pesos | safetensors (formato Diffusers); variante 4-step como adaptador LoRA + proyecciones fusionadas |
| Pasos de inferencia | 4, 6 u 8 según variante; 8 pasos para Ref2VA |
| Salida | MP4 único con vídeo H.264 y audio AAC (sin WAV separado) |
| Resolución y frames por defecto | 768 × 1344, 124 frames (workflows de ComfyUI) |
| Tamaño del repositorio | 123,5 GB |
| Librería | minimax-h3 (con dependencia de diffusers 0.40.0, transformers ≥ 4.57.0, peft ≥ 0.17.0) |

## Arquitectura y entrenamiento

El modelo se construye sobre MiniMax-H3, un sistema de difusión que genera de forma conjunta latentes de vídeo y de audio, de modo que el resultado es un flujo audiovisual coherente y no dos generaciones independientes emparejadas a posteriori. Turbo no reentrena el modelo desde cero: aplica un ajuste de destilación de pasos (few-step distillation) para colapsar la trayectoria de denoising. La variante de 4 pasos se distribuye como adaptador compacto que incluye una LoRA sobre el backbone del transformer y proyecciones de salida de vídeo y audio fusionadas, pensadas para inyectarse sobre el transformer oficial de MiniMaxAI/MiniMax-H3. Las variantes de 6 y 8 pasos, incluida la de referencia, se distribuyen como transformer completo en formato Diffusers, lo que simplifica el despliegue pero multiplica el peso en disco.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset de destilación ni si se emplearon técnicas adicionales como DPO o RLHF; tampoco se documentan innovaciones de atención (attention lineal, decodificación especulativa) más allá del propio esquema few-step. La innovación principal es, por tanto, la reducción de pasos con preservación de la generación audio-vídeo conjunta y la incorporación de condicionamiento por referencia en la variante Ref2VA, que acepta imágenes o vídeos de referencia y, opcionalmente, audio de referencia.

## Capacidades

- Generación de vídeo con audio sincronizado en un único MP4 (H.264 + AAC), sin pista WAV separada.
- Text-to-video con audio (T2VA) en 4, 6 u 8 pasos.
- Generación condicionada por primer y último frame (FL2VA), útil para interpolación y control de continuidad.
- Reference-to-video con audio (Ref2VA) a 8 pasos: toma imágenes o vídeos de referencia y, opcionalmente, audio de referencia, para guiar identidad, estilo o sonido.
- Control de la duración mediante `num_frames` (124 frames por defecto) y de la resolución mediante `height` y `width` (768 × 1344 por defecto).
- Integración nativa con ComfyUI mediante node pack propio, con workflows de ejemplo para cada variante.
- Ejecución en pocos pasos, lo que habilita iteración rápida y comparación de variantes en un mismo flujo.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step ni soporte multilingüe explícito; es un modelo generativo audiovisual, no un LLM.

## Casos de uso

- Prototipado rápido de storyboards audiovisuales: con 4 pasos y 124 frames por defecto, un equipo de preproducción puede generar decenas de variantes de una escena con sonido incorporado en el tiempo que antes costaba una sola pasada a 50 pasos, y compararlas en el demo interactivo de 99 vídeos.
- Publicidad y contenido para redes: la generación conjunta de vídeo y audio evita el paso de doblaje o Foley posterior, y la salida MP4 directa encaja en pipelines de publicación sin remux.
- Iteración de dirección de arte con Ref2VA: partiendo de una imagen o vídeo de referencia de producto o personaje, el modo de 8 pasos mantiene la identidad visual a lo largo del clip y permite audio de referencia para fijar la tonalidad sonora.
- Interpolación y control de continuidad con FL2VA: fijando primer y último frame se pueden generar transiciones entre planos existentes, útil en montaje y en la creación de loops para instalaciones o pantallas.
- Previsualización en estudio con ComfyUI: el node pack permite a artistas sin perfil de ingeniería encadenar generación, selección de pasos y guardado en MP4 dentro de un grafo visual, reutilizando los workflows JSON publicados.
- Generación de material de entrenamiento sintético audiovisual: clips con audio sincronizado y control de resolución y duración sirven para aumentar datasets de modelos de percepción audio-vídeo o de sincronización labial.
- Evaluación comparativa de schedulers y adaptadores: al existir variantes de 4, 6 y 8 pasos sobre el mismo base, es un banco de pruebas natural para medir la degradación calidad-coste de la destilación few-step.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (FVD, CLIP score, sincronización audio-vídeo, etc.) en la información disponible. La model card únicamente referencia una comparativa cualitativa interactiva con 9 prompts, 11 configuraciones y 99 vídeos, que enfrenta las variantes de 4, 6 y 8 pasos de Wuli contra Larry v4, LightX2V, FlashGen, DMAD, PAI y el MiniMax-H3 original a 50 pasos.

| Comparativa | Tipo de dato | Resultado |
|---|---|---|
| Wuli 4/6/8 pasos vs. Larry v4, LightX2V, FlashGen, DMAD, PAI, H3 a 50 pasos | Cualitativa (demo interactivo) | No se reportan métricas numéricas |
| Métricas objetivas (FVD, CLIP, sync) | — | No disponibles |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repositorio pesa 123,5 GB y varias variantes almacenan el transformer completo, por lo que la inferencia requiere cargar el transformer de MiniMax-H3 más los componentes oficiales descargados de `MiniMaxAI/MiniMax-H3`; el espacio en disco y en memoria es el factor limitante principal.
- GPU recomendadas: no se especifican modelos concretos. El node pack exige una instalación local de ComfyUI con PyTorch compilado para CUDA, lo que implica GPU NVIDIA.
- GPU de consumo: no se confirma que quepa en tarjetas de consumo; la ausencia de cuantizaciones documentadas (sin GGUF ni FP8 publicados) hace inviable asumirlo sin pruebas propias.
- Despliegue: ComfyUI mediante el node pack oficial (con `diffusers==0.40.0`, `transformers>=4.57.0`, `peft>=0.17.0`), o scripts Python propios como `run_ref2va.py` para la variante de referencia. No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama, que además no aplican a un modelo de difusión de vídeo.
- Latencia y throughput: no disponibles. Cualitativamente, la reducción de 50 a 4-8 pasos de denoising implica una caída del coste computacional proporcional al número de evaluaciones del transformer, pero no se publican tiempos por clip ni FPS de generación.

## Comparativa con modelos similares

| Modelo | Pasos de inferencia | Salida audio+vídeo conjunta | Ref2VA | Integración ComfyUI | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Wuli MiniMax-H3 Turbo | 4 / 6 / 8 | Sí | Sí (8 pasos) | Node pack propio | MiniMax-H3 Community License | Hugging Face, ModelScope, GitHub |
| MiniMaxAI/MiniMax-H3 (original) | 50 (en la comparativa) | Sí | No documentado en esta ficha | Vía componentes oficiales | MiniMax-H3 Community License | Hugging Face |
| Larry v4 | no disponible | no disponible | no disponible | no disponible | no disponible | Referenciado en el demo comparativo |
| LightX2V | no disponible | no disponible | no disponible | no disponible | no disponible | Referenciado en el demo comparativo |
| FlashGen | no disponible | no disponible | no disponible | no disponible | no disponible | Referenciado en el demo comparativo |
| DMAD | no disponible | no disponible | no disponible | no disponible | no disponible | Referenciado en el demo comparativo |
| PAI | no disponible | no disponible | no disponible | no disponible | no disponible | Referenciado en el demo comparativo |

No se dispone de parámetros, contexto ni métricas de rendimiento de las alternativas en la información proporcionada; la comparación se limita a lo que el autor documenta en su demo cualitativo.

## Limitaciones y advertencias

- Licencia: se hereda la MiniMax-H3 Community License Agreement, que no es una licencia open source estándar; es imprescindible revisar sus términos antes de cualquier uso comercial, ya que puede imponer restricciones de escala, atribución o redistribución.
- No se documentan sesgos conocidos del modelo base ni del ajuste Turbo; al ser un generativo audiovisual, puede reproducir estereotipos visuales y sonoros presentes en sus datos de entrenamiento.
- Riesgo de alucinación visual y sonora: coherencia física, sincronización labial y plausibilidad del audio pueden degradarse, especialmente en la variante de 4 pasos, que es la más agresiva en reducción de pasos.
- Idiomas: no se declara soporte multilingüe; los prompts de los ejemplos están en inglés y no hay garantías sobre la calidad con prompts en castellano.
- Contexto de prompt: no se especifica longitud máxima; prompts largos o muy detallados pueden truncarse o perder fidelidad.
- Sin cuantizaciones publicadas: no hay GGUF, FP8 ni versiones reducidas, lo que limita el despliegue en hardware de gama media y obliga a trabajar con los pesos en precisión original.
- Dependencias frágiles: el node pack fija `diffusers==0.40.0` y exige reinstalar requisitos tras cada actualización; mezclar entornos Python con ComfyUI es una fuente habitual de fallos.
- Variante 4-step como adaptador: requiere el transformer oficial de MiniMaxAI/MiniMax-H3 y descarga de componentes en el primer arranque, con dependencia de red y de disponibilidad del repo base.
- Salida limitada a MP4 H.264 + AAC: no se genera WAV separado, lo que puede complicar postproducción de audio que requiera pista aislada.
- Fechas del repositorio: creación 2026-09-23 y actualización 2026-11-11; el proyecto es reciente y su API y workflows pueden cambiar sin aviso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Wuli-art/MiniMax-H3-Turbo
- Modelo en ModelScope: https://modelscope.cn/models/Wuli-Art/MiniMax-H3-Turbo
- Node pack de ComfyUI: https://github.com/wuli-art/MiniMax-H3-Turbo-ComfyUI
- Workflow T2VA 4 pasos: https://raw.githubusercontent.com/wuli-art/MiniMax-H3-Turbo-ComfyUI/main/example_workflows/t2va_4step.json
- Workflow T2VA 8 pasos: https://raw.githubusercontent.com/wuli-art/MiniMax-H3-Turbo-ComfyUI/main/example_workflows/t2va_8step.json
- Workflow Ref2VA 8 pasos: https://raw.githubusercontent.com/wuli-art/MiniMax-H3-Turbo-ComfyUI/main/example_workflows/ref2va_8step.json
- Demo interactivo comparativo: https://cdn.wuli.art/image/minimax-h3-comparison-20261009-0ff4412f/index.html
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia MiniMax-H3 Community License Agreement: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
