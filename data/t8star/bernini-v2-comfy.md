# t8star/Bernini-V2-Comfy

## Resumen

Bernini-V2-Comfy es un paquete de pesos nativo para ComfyUI del modelo Bernini v2 de ByteDance, publicado por el usuario t8star. Se trata de una implementación que permite ejecutar el pipeline completo de generación y edición de vídeo de ByteDance sin depender de la librería Diffusers en tiempo de ejecución, integrando directamente los componentes en el ecosistema ComfyUI. El modelo base, Bernini-Diffusers-v2, combina un planificador semántico basado en Qwen2.5-VL con dos modelos expertos derivados de Wan2.2 para renderizar las escenas.

La relevancia de este paquete radica en que ofrece dos formatos de pesos: una versión cuantizada en INT8 (45,62 GiB) optimizada para GPUs de 24 GB y una versión nativa en BF16 (83,03 GiB) para máxima fidelidad. La cuantización INT8 cubre 1.300 capas lineales y fue verificada con umbrales de calidad estrictos (coseno 0,99 y error relativo 2%), sin degradaciones que requirieran retrocesos. Está pensado para desarrolladores e investigadores que trabajan con ComfyUI y necesitan generación de vídeo de alta calidad con requisitos de memoria moderados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline híbrido: planificador Qwen2.5-VL + dos expertos Wan2.2 (difusión) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (orientado a vídeo, no a texto) |
| Tipos de cuantizacion | INT8 (tensorwise) y BF16 nativo |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (paquete ComfyUI, shards con manifiestos) |

## Arquitectura y entrenamiento

El modelo Bernini v2 de ByteDance utiliza una arquitectura en dos fases: primero, un planificador basado en Qwen2.5-VL interpreta la solicitud de texto o imagen y genera un plan de escena y movimiento; después, dos modelos expertos Wan2.2 renderizan el resultado final. Este enfoque permite tareas como texto a vídeo, vídeo a vídeo, referencia a vídeo y edición guiada por referencia. El paquete de t8star implementa esta arquitectura de forma nativa en ComfyUI, reutilizando los sistemas de carga de modelos, gestión de dispositivos, conditioning, guider, scheduler y sampling de ComfyUI.

El entrenamiento original del modelo base fue realizado por ByteDance, aunque no se proporcionan detalles sobre el dataset o el proceso de entrenamiento en la información disponible. La cuantización INT8 fue realizada por el autor del paquete mediante conversión de 1.300 capas lineales, con reconstrucción y verificación de cada capa convertida; no se requirió ningún retroceso de calidad según los umbrales definidos. Los manifiestos incluidos en el paquete contienen la revisión fuente, índices de componentes, tipos de tensor, conteos de bytes y hashes SHA-256 para cada shard.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video).
- Generación de vídeo a partir de imagen (image-to-video).
- Edición de vídeo (video-to-video).
- Generación de vídeo con referencia (reference-to-video).
- Edición de vídeo guiada por referencia (reference-guided video editing).
- Generación de imagen a partir de texto (text-to-image) e imagen a imagen (image-to-image), como parte del pipeline.
- Planificación semántica de escenas y movimiento mediante Qwen2.5-VL.
- Soporte de múltiples flujos de trabajo predefinidos en ComfyUI (seis ejemplos incluidos en el repositorio de nodos).
- Cuantización INT8 con verificación de calidad para inferencia eficiente en GPUs de 24 GB.

## Casos de uso

- Generación de clips promocionales para redes sociales: el modelo permite crear vídeos cortos a partir de descripciones textuales, con control de movimiento y escena gracias al planificador semántico, adecuado para agencias de marketing que necesitan prototipos rápidos.
- Edición de vídeo con referencia visual: un editor puede proporcionar un vídeo base y una imagen de referencia para modificar elementos específicos (personajes, objetos, estilo) manteniendo la coherencia temporal, gracias a la función de reference-guided video editing.
- Creación de storyboards animados para producción audiovisual: los cineastas pueden generar animaciones preliminares a partir de guiones o imágenes de referencia, acelerando la fase de preproducción.
- Aumento de datasets sintéticos para entrenamiento de modelos de visión: investigadores pueden generar vídeos variados con control semántico para ampliar conjuntos de datos, usando el pipeline de texto a vídeo o imagen a vídeo.
- Prototipado de efectos visuales en postproducción: los estudios pueden probar diferentes estilos o alteraciones sobre material existente mediante video-to-video, sin necesidad de renderizados costosos.
- Integración en flujos de trabajo de ComfyUI para automatización de contenido: al ser nativo de ComfyUI, se puede combinar con otros nodos (upscaling, interpolación, etc.) para construir pipelines de generación de vídeo completos y repetibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que se realizaron pruebas de calidad y rendimiento en un entorno específico: una ejecución de producción de texto a vídeo de 640×368 píxeles y 33 fotogramas en una GPU RTX 5090 Laptop de 24 GB, con un pico de VRAM de 16,51 GiB. También se validaron ejecuciones reducidas de dos segundos con borde largo de 640 para tareas de texto a vídeo, vídeo a vídeo, referencia a vídeo y edición guiada por referencia, con resultados idénticos entre ejecuciones consecutivas y retorno de memoria a niveles base.

## Requisitos de hardware

- Paquete Balanced INT8: recomendado para GPUs con 24 GB de VRAM. Validado en RTX 5090 Laptop con pico de VRAM de 16,51 GiB en una tarea de 33 fotogramas a 640×368.
- Paquete BF16 nativo: requiere significativamente más VRAM (el almacenamiento es de 83,03 GiB), por lo que se necesita una GPU con al menos 48 GB o más, típicamente A100, H100 o similares.
- El paquete INT8 cabe en GPUs de consumo como RTX 4090 (24 GB) y RTX 5090 (32 GB), aunque la validación se hizo en la versión Laptop.
- Despliegue: exclusivamente a través de ComfyUI, instalando el repositorio de nodos `comfyui-bernini-v2-T8` desde ComfyUI-Manager o clonándolo en `custom_nodes`. También se requiere el VAE Wan 2.1.
- No se proporcionan datos de latencia o throughput específicos, solo se indica que una ejecución de producción (640×368, 33 fotogramas) se completó correctamente en la RTX 5090 Laptop.

## Comparativa con modelos similares

No se dispone de información comparativa en la documentación proporcionada. El modelo base Bernini-Diffusers-v2 de ByteDance se posiciona como una alternativa open source a otros pipelines de generación de vídeo como CogVideoX o Wan 2.1, pero no se incluyen datos de benchmarks ni comparaciones directas. La principal diferencia frente a otros paquetes es la integración nativa con ComfyUI y la disponibilidad de una versión cuantizada optimizada para hardware de 24 GB.

## Limitaciones y advertencias

- El modelo solo soporta el idioma inglés según la etiqueta `language: en`; no se ha verificado su rendimiento en otros idiomas.
- La versión cuantizada INT8 puede presentar ligeras diferencias de calidad respecto a la versión BF16, aunque el autor indica que todas las capas superaron los umbrales de calidad establecidos.
- El paquete requiere el VAE Wan 2.1, que debe descargarse por separado; no se incluye en el paquete.
- No se han evaluado sesgos sociales o culturales del modelo; al ser un modelo de generación de vídeo, podría reflejar sesgos presentes en los datos de entrenamiento originales.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base de ByteDance y cualquier otra dependencia.
- El rendimiento en GPUs con menos de 24 GB de VRAM no está garantizado; la versión BF16 requiere hardware profesional de gama alta.
- No se proporcionan garantías sobre la estabilidad del modelo en configuraciones diferentes a las validadas (RTX 5090 Laptop con ComfyUI).
- El proyecto depende de un repositorio de nodos de terceros (T8mars), que podría no mantenerse a largo plazo.

## Enlaces

- Modelo original: [ByteDance/Bernini-Diffusers-v2](https://huggingface.co/ByteDance/Bernini-Diffusers-v2)
- Código fuente original: [github.com/bytedance/Bernini](https://github.com/bytedance/Bernini)
- Repositorio de nodos ComfyUI: [github.com/T8mars/comfyui-bernini-v2-T8](https://github.com/T8mars/comfyui-bernini-v2-T8)
- Informe de calidad: [QUALITY_TESTS.md](https://github.com/T8mars/comfyui-bernini-v2-T8/blob/main/docs/QUALITY_TESTS.md)
- Guía de baja memoria: [LOW_MEMORY_WEIGHTS.md](https://github.com/T8mars/comfyui-bernini-v2-T8/blob/main/docs/LOW_MEMORY_WEIGHTS.md)
- Perfil de Hugging Face del autor: [t8star](https://huggingface.co/t8star)
- Página del modelo en Hugging Face: [t8star/Bernini-V2-Comfy](https://huggingface.co/t8star/Bernini-V2-Comfy)
