# YossiIsr/joyai-video-edit-fp8

## Resumen

JoyAI-Video-Edit FP8 es una conversión a FP8 del checkpoint DiT de JoyAI-Video-Edit, un modelo de edición de vídeo (pipeline video-to-video) publicado originalmente por JD Open Source. Esta versión concreta la mantiene el usuario YossiIsr (acreditando la conversión a "Plotin") y no tiene afiliación ni respaldo de JD ni de Xiaomi. El paquete reúne en un único repositorio de 34,6 GB el DiT cuantizado, el VAE sin modificar y el codificador de texto MiMo-VL-7B-RL-2508, de modo que un servidor de streaming puede cargar todo desde un solo sitio.

El interés técnico está en el formato: en lugar de que el servidor convierta a FP8 las capas Linear de atención imagen/texto y MLP en cada arranque, este repositorio almacena ya el resultado de esa conversión (FP8 e4m3 con escalas por canal, resto de tensores en bf16), generada con la receta `JOYOMNI_FP8_FAST_ACCUM=1` orientada a RTX 5090. Esto evita leer y cuantizar en cada inicio el checkpoint bf16 de 32,5 GB del modelo original.

Es relevante para quienes despliegan edición de vídeo en hardware consumer de gama alta (RTX 5090) y quieren reducir el tiempo de arranque y el coste de cuantización en inferencia. La contrapartida es que el servidor upstream estándar no puede cargar estos pesos: hace falta un parche que construya el modelo sobre `meta` device y rellene los tensores desde el fichero.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) para edición de vídeo, con VAE y codificador de texto MiMo-VL-7B-RL-2508 |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 e4m3 con escalas por canal en las Linear de atención imagen/texto y MLP del DiT; resto de tensores en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (DiT y VAE); MIT para el codificador de texto MiMo-VL-7B-RL-2508 |
| Formato de pesos | safetensors (DiT FP8, pesos almacenados transpuestos en row-major); VAE y text encoder sin modificar |

## Arquitectura y entrenamiento

El modelo subyacente es JoyAI-Video-Edit, cuyo componente generativo es un DiT (Diffusion Transformer) que opera sobre un pipeline video-to-video: recibe un vídeo de entrada y una condición (texto codificado por MiMo-VL-7B-RL-2508) y produce el vídeo editado a través de un VAE. El checkpoint DiT original es `dit/joyai_video_edit_dit_0811.pth`, de 32,5 GB en bf16.

Esta ficha no documenta el entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF/DPO u otras técnicas): esa información no está disponible en el material proporcionado. La aportación de este repositorio es exclusivamente de cuantización y empaquetado: se convierten a FP8 las capas Linear de atención imagen/texto y MLP con escalas por canal, se mantienen el resto de tensores en bf16 y se guardan los pesos FP8 transpuestos. Los metadatos del fichero registran el formato (`joyai-fp8-presaved-v1`) y el ajuste de acumulación rápida (`JOYOMNI_FP8_FAST_ACCUM=1`). El VAE y el codificador de texto se incluyen sin cambios respecto a sus originales.

## Capacidades

- Edición de vídeo video-to-video: transformación de un vídeo de entrada guiada por condición, mediante el pipeline `video-to-video` de diffusers.
- Condicionamiento por texto: el codificador MiMo-VL-7B-RL-2508 (modelo visión-lenguaje) genera las representaciones de texto que guían la edición.
- Inferencia en FP8: las capas Lineales principales del DiT se ejecutan en FP8 e4m3, lo que reduce el peso en memoria y acelera el cálculo en GPUs con soporte FP8 nativo.
- Carga optimizada para servidores de streaming: el paquete incluye DiT, VAE y text encoder en un solo repositorio para que el servidor cargue todo desde un único origen.
- Generación de texto, razonamiento, código, matemáticas, tool calling, agentes o modo thinking: no disponible como capacidad documentada de este paquete (el text encoder se usa como componente de condicionamiento, no como LLM de propósito general en este contexto).
- Capacidades multilingües: no disponible.

## Casos de uso

- Edición de vídeo asistida por texto en producción: el pipeline video-to-video permite aplicar transformaciones guiadas por una descripción textual; el empaquetado en un solo repositorio simplifica el despliegue del servidor de streaming.
- Despliegue en RTX 5090: la receta FP8 con acumulación rápida está pensada para esta GPU, de modo que se puede servir edición de vídeo en hardware consumer de gama alta en lugar de depender de clústeres con A100/H100.
- Arranque rápido de servidores de inferencia: al precuantizar el DiT, se evita leer y cuantizar en cada inicio el checkpoint bf16 de 32,5 GB, lo que reduce el tiempo de arranque en entornos con reinicios frecuentes o autoescalado.
- Prototipado e investigación en edición de vídeo: investigadores que quieran experimentar con JoyAI-Video-Edit sin montar el proceso de cuantización pueden partir de estos pesos FP8 y comparar calidad frente al modelo bf16.
- Pipelines de postproducción automatizada: integración del modelo en flujos que reciben clips y aplican ediciones condicionadas por texto, con el VAE y el codificador incluidos en el mismo paquete.
- Evaluación de cuantización FP8 en modelos de difusión de vídeo: el repositorio permite medir el impacto de FP8 e4m3 con escalas por canal frente al original bf16 en calidad visual y latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio ocupa 34,6 GB e incluye el DiT FP8, el VAE y el codificador MiMo-VL-7B; el checkpoint DiT original en bf16 pesa 32,5 GB, por lo que la conversión a FP8 reduce el peso del DiT, pero no se documenta la VRAM total necesaria en ejecución.
- GPU recomendadas: la receta de conversión está orientada a RTX 5090 (`JOYOMNI_FP8_FAST_ACCUM=1`); no se indican otras GPU validadas.
- ¿Cabe en GPU consumer? El diseño apunta a ello en RTX 5090; no se confirma para otras consumer.
- Opciones de despliegue: servidor de streaming upstream de JoyAI-Video-Edit con un parche que construya el modelo en `meta` device y rellene los tensores desde este fichero; el servidor estándar no puede cargarlo. Librería diffusers. No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|
| JoyAI-Video-Edit FP8 (este) | DiT video-to-video empaquetado con VAE y text encoder | FP8 e4m3 (Linear de atención y MLP) + bf16 | Apache 2.0 (DiT/VAE), MIT (text encoder) | HuggingFace, requiere parche del servidor |
| jdopensource/JoyAI-Video-Edit | DiT video-to-video original | bf16 (checkpoint de 32,5 GB) | Apache 2.0 | HuggingFace |
| XiaomiMiMo/MiMo-VL-7B-RL-2508 | Modelo visión-lenguaje (usado aquí como text encoder) | no disponible | MIT | HuggingFace |

No se dispone de datos de rendimiento comparado con otros modelos de edición de vídeo en la información proporcionada.

## Limitaciones y advertencias

- El servidor upstream estándar no puede cargar estos pesos: es necesario aplicar un parche que construya el modelo en `meta` device y rellene los tensores desde el fichero FP8.
- Los pesos FP8 están almacenados transpuestos (row-major); cualquier herramienta que los consuma debe respetar el formato `joyai-fp8-presaved-v1` registrado en los metadatos.
- La conversión está pensada para la receta de RTX 5090 (`JOYOMNI_FP8_FAST_ACCUM=1`); no se garantiza el mismo comportamiento en otras GPU.
- No hay afiliación ni respaldo de JD ni de Xiaomi; el mantenimiento depende de un único autor y el repositorio registra 0 descargas y 0 likes en el momento de la consulta.
- La cuantización FP8 puede introducir degradación de calidad frente al modelo bf16 original; no se documentan evaluaciones comparativas.
- Sesgos conocidos y riesgo de alucinación: no disponible.
- Limitaciones de contexto o idioma: no disponible.
- Licencia: Apache 2.0 para DiT y VAE permite uso comercial; el codificador de texto MiMo-VL-7B-RL-2508 es MIT, pero conviene revisar los ficheros `LICENSE` y `NOTICE` incluidos antes de redistribuir.
- Para producción: verificar la compatibilidad del parche con la versión concreta del servidor upstream y validar la calidad de edición frente al checkpoint bf16.

## Enlaces

- [YossiIsr/joyai-video-edit-fp8 en HuggingFace](https://huggingface.co/YossiIsr/joyai-video-edit-fp8)
- [jdopensource/JoyAI-Video-Edit](https://huggingface.co/jdopensource/JoyAI-Video-Edit)
- [XiaomiMiMo/MiMo-VL-7B-RL-2508](https://huggingface.co/XiaomiMiMo/MiMo-VL-7B-RL-2508)
