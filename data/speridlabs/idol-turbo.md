# speridlabs/idol-turbo

## Resumen

Idol Turbo es una versión destilada del modelo Idol, desarrollado por speridlabs, que genera representaciones 3D de objetos a partir de una única imagen de entrada mediante Gaussian splatting. El modelo transforma una fotografía de un objeto en hasta un millón de gaussianas 3D, reduciendo el proceso de muestreo de 50 pasos con classifier-free guidance (100 evaluaciones de red) a tan solo 5 pasos sin guiado (5 evaluaciones), lo que supone una reducción de 20× en el número de evaluaciones.

La arquitectura subyacente es un denoiser de flow-matching destilado mediante una receta de fase-LoRA estilo Glance (arXiv 2512.02899), con dos expertos de bajo rango de rango 32: un Slow-LoRA para la fase de alto ruido y un Fast-LoRA para la fase de bajo ruido, con conmutación en t=0.5. El entrenamiento se realizó por regresión contra la velocidad compuesta por CFG del modelo profesor, plegando el guiado dentro de los pesos. Solo se entrenaron 29,4 millones de parámetros; el modelo base permanece intacto.

El modelo es relevante porque permite generar activos 3D de forma casi instantánea (aproximadamente 0,75 segundos en una H200 a 5 pasos), lo que lo hace viable para flujos de trabajo interactivos, pipelines de creación de contenido y despliegue en ComfyUI con los workflows TripoSplat. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Denoiser de flow-matching destilado con fase-LoRA (dos expertos de bajo rango de rango 32: Slow-LoRA y Fast-LoRA, conmutación en t=0.5) sobre el modelo base Idol |
| Parametros totales | No disponible (el modelo base Idol no reporta su recuento total en la información disponible); 29,4M parámetros entrenables en la destilación |
| Parametros activos | No disponible (no es MoE; la fase-LoRA activa un experto según el nivel de ruido) |
| Longitud de contexto | No disponible (modelo image-to-3D; no aplica contexto de texto) |
| Tipos de cuantizacion | No disponible (pesos en fp16 y bf16 según los archivos del repack de ComfyUI) |
| Idiomas soportados | No disponible (modelo de imagen a 3D; no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (idol_turbo_slow_comfy.safetensors, idol_turbo_fast_comfy.safetensors); turbo.py para el SDK de Python |

## Arquitectura y entrenamiento

Idol Turbo parte del denoiser de flow-matching de Idol y lo destila para reducir el número de pasos de muestreo. La innovación principal es la receta de fase-LoRA estilo Glance (arXiv 2512.02899): se entrenan dos expertos de bajo rango de rango 32 que actúan en fases distintas del proceso de difusión. El Slow-LoRA cubre la fase de alto ruido y el Fast-LoRA la de bajo ruido, con un punto de conmutación en t=0.5. Ambos se entrenan por regresión contra la velocidad compuesta por classifier-free guidance del modelo profesor, de modo que el efecto del guiado queda incorporado en los pesos del estudiante y se puede muestrear con CFG desactivado (cfg_strength=0.0).

El entrenamiento de la receta v5 utilizó 4.650 registros del profesor (trayectorias de 50 pasos con CFG 3.0) sobre 93 imágenes diversas de objetos individuales, con 2.000 pasos de entrenamiento (aproximadamente 25 minutos en una H200). La ampliación del conjunto de entrenamiento respecto a la versión inicial de 10 imágenes corrige la debilidad principal de las primeras versiones: objetos distintos a los del conjunto original. Los pesos LoRA están preescalados para fuerza 1.0 y son compatibles con las rutas de módulos del repack Comfy-Org/Idol para los workflows TripoSplat.

## Capacidades

- Generación de representaciones 3D de objetos individuales a partir de una única imagen de entrada (image-to-3D).
- Producción de hasta un millón de gaussianas 3D por objeto (Gaussian splatting).
- Muestreo en 4 a 8 pasos sin classifier-free guidance, con 5 pasos como valor recomendado por defecto.
- Reducción de 20× en evaluaciones de red respecto al modelo base (de 100 a 5).
- Compatibilidad con ComfyUI mediante los LoRA slow y fast y los workflows TripoSplat del repack Comfy-Org/Idol.
- Uso programático mediante el SDK de Python de Idol (IdolPipeline) con la función patch_pipeline_for_turbo.
- Modo "real" de entrada (mode="real") y control de semilla para reproducibilidad.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo puramente de imagen a 3D.

## Casos de uso

- Creación rápida de activos 3D para videojuegos y prototipado: a partir de una fotografía de un objeto se obtiene una representación de gaussianas 3D en menos de un segundo en hardware de datacenter, lo que permite iterar sobre variantes de un activo en sesiones interactivas.
- Flujos de trabajo en ComfyUI para artistas 3D: los LoRA slow y fast se integran en los workflows TripoSplat con 5 pasos y CFG 1.0, de modo que un artista puede generar splats 3D dentro de su grafo de ComfyUI sin cambiar de herramienta.
- Captura de producto para comercio electrónico: una sola imagen de catálogo se convierte en un modelo 3D visualizable, adecuado para vistas orbitales o configuradores web, gracias a la ventana de 4 a 8 pasos y a la fidelidad de color razonable del estudiante.
- Generación de contenido para realidad aumentada: el splat 3D resultante puede insertarse en escenas AR; la inferencia rápida (aproximadamente 0,75 s en H200) permite generar objetos bajo demanda durante una sesión.
- Investigación en destilación de modelos generativos 3D: el par de LoRA de fase y los registros de entrenamiento publicados en akhaliq/idol-turbo-runs sirven como referencia reproducible para estudiar destilación de flow-matching con plegado de CFG.
- Automatización de pipelines de assets 3D en CI/CD: mediante el SDK de Python (IdolPipeline con patch_pipeline_for_turbo) se puede procesar por lotes un directorio de imágenes y generar splats 3D de forma desatendida con semilla fija para reproducibilidad.
- Demos y aplicaciones interactivas de imagen a 3D: el bajo coste por inferencia (5 evaluaciones de red) hace viable ofrecer generación 3D en tiempo casi real en aplicaciones web con backend GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo image-to-3D y no de un modelo de lenguaje.

Los datos de rendimiento publicados en la model card son los siguientes:

| Metrica | Valor |
|---|---|
| Evaluaciones de red (NFE) | 5 (frente a 100 del base con 50 pasos y CFG) |
| Reduccion de NFE | 20× |
| Latencia a 5 pasos | ~0,75 s en H200 |
| Latencia a 4 pasos | ~0,66 s en H200 |
| Latencia a 8 pasos | ~1,0 s en H200 |
| Pasos de entrenamiento | 2.000 (~25 min en una H200) |
| Registros de entrenamiento | 4.650 trayectorias del profesor (50 pasos, CFG 3.0) |
| Imagenes de entrenamiento | 93 imagenes de objetos individuales |
| Parametros entrenables | 29,4M |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada; el repositorio ocupa 3,9 GB y los pesos se distribuyen en fp16/bf16, por lo que se requiere cargar además el modelo base Idol y los codificadores con acceso restringido (DINOv3 ViT-H/16+ y FLUX.2-dev).
- GPU recomendadas: H200 según las mediciones publicadas (~0,75 s a 5 pasos). No se especifican otras GPU en la información disponible.
- Compatibilidad con GPU de consumo: no disponible; no se confirma que quepa en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: SDK de Python de Idol (pip install git+https://github.com/speridlabs/idol-sdk.git) y ComfyUI con el repack Comfy-Org/Idol y los workflows TripoSplat.
- Latencia y throughput: ~0,75 s por objeto a 5 pasos en H200; ~0,66 s a 4 pasos; ~1,0 s a 8 pasos. No se reporta throughput por lotes.
- Dependencias adicionales: acceso a los modelos con acceso restringido facebook/dinov3-vith16plus-pretrain-lvd1689m y black-forest-labs/FLUX.2-dev.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Pasos de muestreo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Idol Turbo (este modelo) | No disponible (29,4M entrenables en LoRA) | No aplica | 4-8 sin CFG (5 recomendado) | Apache 2.0 | HuggingFace (speridlabs/idol-turbo) |
| Idol (base) | No disponible | No aplica | 50 con CFG (100 NFE) | No disponible en la informacion | HuggingFace (speridlabs/idol) |
| Otros modelos image-to-3D | No disponible | No aplica | No disponible | No disponible | No disponible |

La comparación disponible se limita al modelo base Idol: Turbo reduce las evaluaciones de red de 100 a 5 (20×) a costa de una calidad algo menor en detalles tardíos y colores que pueden virar a cálido a 4 pasos. No se dispone de datos de otros modelos image-to-3D comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo es una destilación a escala LoRA entrenada sobre 93 imágenes renderizadas de objetos individuales; algunos resultados son más suaves que el profesor de 50 pasos.
- Los colores pueden virar a tonos cálidos a 4 pasos, y los objetos muy saturados pueden resultar menos vivos que en el checkpoint inicial de 10 imágenes.
- Por debajo de 4 pasos la calidad se degrada (el turbo más lentamente que el muestreo naive); por encima de 8 pasos ambos se comportan bien.
- La división en dos etapas (slow y fast) en ComfyUI no se ha ejecutado dentro de ComfyUI según el propio autor; la ruta segura es usar solo el LoRA slow durante toda la ejecución, con una pequeña pérdida de detalle tardío.
- No procesa texto ni mantiene conversaciones: no tiene capacidades de tool calling, agentes ni multilingües.
- Requiere acceso a dos codificadores con acceso restringido (DINOv3 y FLUX.2-dev) y a la librería idol, lo que añade fricción al despliegue.
- La licencia Apache 2.0 permite uso comercial, pero las dependencias (codificadores con acceso restringido) pueden tener sus propias condiciones que deben revisarse.
- El modelo base Idol a 50 pasos sigue siendo la referencia de calidad; Turbo prioriza velocidad sobre fidelidad máxima.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/speridlabs/idol-turbo
- Modelo base Idol: https://huggingface.co/speridlabs/idol
- Paper de la receta Glance: https://arxiv.org/abs/2512.02899
- Repack para ComfyUI: https://huggingface.co/Comfy-Org/Idol
- Registros de entrenamiento y evaluaciones: https://huggingface.co/datasets/akhaliq/idol-turbo-runs
- SDK de Idol: https://github.com/speridlabs/idol-sdk
- Codificador DINOv3: https://huggingface.co/facebook/dinov3-vith16plus-pretrain-lvd1689m
- Codificador FLUX.2-dev: https://huggingface.co/black-forest-labs/FLUX.2-dev
- Video de demostración: https://huggingface.co/akhaliq/idol-turbo/resolve/main/assets/showcase.mp4
