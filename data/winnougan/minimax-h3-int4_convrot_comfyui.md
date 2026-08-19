# Winnougan/MiniMax-H3-INT4_Convrot_ComfyUI

## Resumen

MiniMax H3 es un modelo de generacion de video y audio a partir de imagenes, desarrollado originalmente por MiniMax. Este repositorio, publicado por Winnougan, ofrece checkpoints cuantizados del modelo listos para usar en ComfyUI, convertidos al formato W4A8 (asym_w4a8_int8 / ConvRot) con pruning aplicado. El objetivo es reducir significativamente el uso de memoria en GPUs de consumo, manteniendo la arquitectura y capacidades del modelo original. Se incluyen dos variantes del diffusion transformer (ref2va y fl2va) y un text encoder cuantizado de estilo Qwen3.5-VL. La licencia es Apache 2.0, lo que permite uso comercial y modificacion.

La relevancia de esta publicacion radica en que permite ejecutar MiniMax H3 en hardware modesto, algo que con los pesos originales en BF16/FP16 seria inviable para la mayoria de usuarios. El formato W4A8 emplea pesos INT4 rotados con ConvRot, codebook Lloyd-Max y escalas FP8, con operaciones GEMM en INT8, lo que reduce el footprint sin requerir datos de calibracion en inferencia. Ademas, el pruning adicional en los diffusion transformers reduce aun mas el tamano. El modelo esta pensado para flujos de trabajo de generacion de video a partir de imagenes de referencia o de primer/ultimo frame.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (MiniMax H3) - no se especifican detalles de la arquitectura original |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A8 (asym_w4a8_int8 / ConvRot) - pesos INT4, activaciones INT8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (archivos .safetensors) |

## Arquitectura y entrenamiento

El modelo base es MiniMax H3, un sistema de generacion de video y audio a partir de imagenes. Este repositorio no proporciona detalles sobre la arquitectura interna del transformer original (numero de capas, dimensiones, atencion, etc.), ni sobre el proceso de entrenamiento (tokens, dataset, tecnicas de alineacion como RLHF o DPO). La informacion disponible se centra en la conversion a cuantizacion W4A8 y el pruning.

El formato W4A8 emplea pesos INT4 rotados mediante ConvRot, con un codebook Lloyd-Max para la cuantizacion y escalas de grupo FP8. El grupo de cuantizacion es de 16 elementos (por defecto) y el grupo ConvRot de 256. Las activaciones se mantienen en INT8 para las operaciones GEMM. No se requiere calibracion en inferencia. Los diffusion transformers (ref2va y fl2va) han sido adicionalmente podados (pruned) para reducir el tamano. El text encoder, de estilo Qwen3.5-VL, mantiene su torre de vision sin cuantizar, cuantizando solo la parte de lenguaje.

## Capacidades

- Generacion de video y audio a partir de una imagen de referencia (variante ref2va).
- Generacion de video y audio a partir del primer y ultimo frame de una secuencia (variante fl2va).
- Integracion con ComfyUI mediante flujos de trabajo estandar de MiniMax H3.
- Soporte de cuantizacion W4A8 sin necesidad de calibracion en inferencia.
- Text encoder cuantizado (Qwen3.5-VL-style) con torre de vision en precision completa.
- Capacidad de ejecucion en GPUs de consumo gracias al footprint reducido.

## Casos de uso

- Generacion local de video a partir de una imagen fija: un artista puede subir una ilustracion y obtener una animacion coherente con movimiento y audio, usando la variante ref2va en ComfyUI.
- Creacion de clips con control de inicio y fin: con fl2va, un editor puede definir el primer y ultimo frame de una secuencia y el modelo genera el video intermedio, util para transiciones o animaciones controladas.
- Prototipado rapido de contenido audiovisual: estudios pequeños o creadores independientes pueden generar borradores de video sin depender de APIs externas, gracias a la cuantizacion que permite ejecutar el modelo en una RTX 4090 o similar.
- Investigacion en generacion de video: investigadores pueden experimentar con el modelo cuantizado para estudiar el efecto de la cuantizacion y el pruning en la calidad de salida, comparando con el modelo original.
- Integracion en pipelines de postproduccion: al ser compatible con ComfyUI, se puede combinar con otros nodos de procesamiento de imagen, upscaling o composicion para generar videos finales.
- Educacion y aprendizaje: estudiantes de IA pueden desplegar un modelo de generacion de video en hardware local para entender su funcionamiento y limitaciones sin necesidad de infraestructura costosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. El autor menciona que esta pensado para GPUs de consumo, pero no indica cifras concretas.
- GPU recomendadas: no disponible. Se sugiere que puede ejecutarse en GPUs de consumo, pero sin especificar modelos.
- Compatibilidad con GPU de consumo: el autor indica que el objetivo es reducir el footprint para GPUs de consumo, pero no detalla cuales.
- Opciones de despliegue: ComfyUI (mainline con soporte asym_w4a8_int8, fusionado el 2026-08-07). No se mencionan otras herramientas como vLLM o llama.cpp.
- Latencia y throughput: no disponible. El autor advierte que el rendimiento de los kernels cuantizados puede variar segun la GPU y la longitud de secuencia.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- El pruning y la cuantizacion W4A8 introducen una degradacion de calidad frente a los pesos BF16/FP16. El autor indica que se espera una degradacion menor, pero no cuantificada.
- El rendimiento de los kernels INT8 GEMM/dequant en ciertos caminos puede no estar completamente optimizado; las ganancias de velocidad sobre BF16 pueden variar segun la GPU y la longitud de secuencia.
- Se requiere una version reciente de ComfyUI (posterior al 2026-08-07) con soporte para asym_w4a8_int8. Sin esta, el modelo no cargara correctamente.
- No se proporcionan detalles sobre sesgos, alucinaciones o limitaciones de idioma, ya que el modelo esta orientado a generacion de video y no se especifican estos aspectos.
- El repositorio no incluye el modelo base original ni documentacion sobre el proceso de entrenamiento, lo que limita la reproducibilidad y el analisis profundo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Winnougan/MiniMax-H3-INT4_Convrot_ComfyUI
- README en HuggingFace: https://huggingface.co/Winnougan/MiniMax-H3-INT4_Convrot_ComfyUI/blob/main/README.md
- Sitio de descargas de MiniMax H3: https://minimaxh3.run/minimax-h3-model-files-downloads
- Pagina en Civitai: https://civitai.com/models/2830162/minimax-h3-int4-convrot-or-12gb-vram
- Guia de ComfyUI para MiniMax H3: https://kingy.ai/ai/ai-guides/minimax-h3-comfyui-local-guide/
- Repositorio Starnodes (converter): https://github.com/Starnodes2024/comfyui-starnodes-modelconverter
- Ko-fi del autor: https://ko-fi.com/winnougan
- Discord de la comunidad: https://discord.gg/CJv5wceJaN
