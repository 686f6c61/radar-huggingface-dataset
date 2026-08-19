# t-firefly/gemma4-e4b-rknn3-rk1828

## Resumen

Este repositorio contiene una conversión del modelo **Gemma 4 E4B IT** de Google DeepMind, adaptado por el equipo de Firefly AI para ejecutarse en el coprocesador de IA **RK1828** de Rockchip. El modelo original es un modelo multimodal de generación de texto que acepta entradas de texto, imagen y audio, diseñado para despliegue eficiente en dispositivos de borde. La conversión permite ejecutar este modelo en hardware embebido mediante la herramienta **LlamaPi**, que gestiona la descarga, carga y ejecución del modelo con un solo comando.

La relevancia de esta conversión radica en que acerca los modelos multimodales de última generación a plataformas de bajo consumo y alto rendimiento como el RK1828, que actúa como unidad de aceleración de IA junto a un host (por ejemplo, un RK3588). El repositorio incluye los pesos en formato GGUF (según las etiquetas) y está pensado para su uso con LlamaPi, aunque también se menciona el formato RKNN3 en el nombre del repositorio. La licencia es Apache 2.0, lo que permite uso comercial con atribución.

No se dispone de información detallada sobre la arquitectura interna, el número exacto de parámetros o el contexto del modelo original en esta ficha, ya que el repositorio se centra en la conversión y el despliegue, no en la documentación técnica del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal de Google DeepMind, tipo transformer presumiblemente, pero no confirmado) |
| Parametros totales | no disponible (el nombre "E4B" sugiere aproximadamente 4 mil millones, sin confirmar) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el tag incluye "gguf", pero no se especifican las cuantizaciones concretas) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (según etiquetas) y posiblemente RKNN3 (por el nombre del repo) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo original (número de capas, dimensiones, tipo de atención, etc.) en la documentación de este repositorio. El modelo base es **Gemma 4 E4B IT**, desarrollado por Google DeepMind, que según la model card acepta entradas multimodales (texto, imagen, audio) y genera texto. Se desconoce si el entrenamiento incluyó RLHF, DPO u otras técnicas de alineación, así como el tamaño del dataset de entrenamiento.

La conversión realizada por Firefly AI se centra en la adaptación del modelo al formato ejecutable por el chip RK1828, utilizando el toolkit RKNN3 de Rockchip. No se documentan innovaciones técnicas adicionales en esta conversión.

## Capacidades

- Generación de texto a partir de entradas multimodales: texto, imagen y audio.
- Razonamiento y resolución de tareas complejas (según la model card del modelo original).
- Generación de código y soporte para tareas de programación.
- Capacidades multilingües (no se especifican idiomas concretos).
- Soporte para tareas agénticas (agentic tasks), lo que implica posible tool calling y razonamiento multi-paso.
- Diseñado para despliegue en dispositivos de borde y on-device, optimizado para eficiencia.

## Casos de uso

- Asistente de voz en dispositivos embebidos: el modelo acepta audio como entrada, por lo que puede usarse en asistentes de voz locales sin conexión a la nube, ejecutándose en el RK1828 con baja latencia.
- Análisis de imágenes en tiempo real en cámaras inteligentes: al aceptar imágenes, puede describir o clasificar escenas directamente en el dispositivo, sin enviar datos a servidores externos.
- Generación de código en entornos de desarrollo embebido: un desarrollador podría usar el modelo en una placa con RK1828 para autocompletar o generar fragmentos de código, aprovechando su capacidad de generación de código.
- Automatización de tareas agénticas en robótica: el modelo puede procesar entradas multimodales (cámara, micrófono) y generar acciones o instrucciones para controlar un robot, gracias a su soporte para tareas agénticas.
- Traducción y transcripción local: dado su carácter multilingüe y su capacidad de audio, puede transcribir y traducir conversaciones en tiempo real en un dispositivo de borde, útil en entornos sin conectividad.
- Prototipado de aplicaciones de IA en hardware Rockchip: desarrolladores que trabajen con la familia RK1820/RK1828 pueden usar este modelo como base para experimentar con IA multimodal en sus proyectos, gracias a la integración con LlamaPi.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de rendimiento (latencia, throughput, precisión) para este modelo convertido ni para el modelo original en este contexto.

## Requisitos de hardware

- El modelo está diseñado para ejecutarse en el coprocesador **RK1828** de Rockchip, que se utiliza junto a un host (típicamente un RK3588) como unidad de aceleración de IA.
- No se especifica la VRAM necesaria, ya que el RK1828 tiene su propia memoria interna, pero el tamaño del repositorio es de 11 GB, lo que sugiere que los pesos ocupan varios gigabytes.
- No se indican GPUs compatibles; el despliegue es específico para hardware Rockchip con soporte RKNN3.
- La herramienta de despliegue principal es **LlamaPi**, que gestiona la descarga, carga y ejecución del modelo. También se menciona el toolkit RKNN3 para conversión y ejecución.
- No se dispone de datos de latencia o throughput estimados.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (modelos multimodales convertidos para RK1828). La oferta de modelos de IA para este hardware específico es limitada y no se han encontrado alternativas documentadas en la información proporcionada.

## Limitaciones y advertencias

- El modelo es una conversión para un hardware específico (RK1828); no es portable a otras plataformas sin una nueva conversión.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones de idioma del modelo original en esta documentación. Se recomienda consultar la ficha del modelo base (google/gemma-4-E4B-it) para conocer estos aspectos.
- La licencia Apache 2.0 permite uso comercial, pero es necesario atribuir correctamente a Google DeepMind y a Firefly AI según los términos de la licencia.
- El tamaño del repositorio (11 GB) implica que el despliegue requiere almacenamiento suficiente en el dispositivo de destino.
- No se han publicado resultados de evaluación de rendimiento, por lo que el comportamiento real en producción no está verificado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/t-firefly/gemma4-e4b-rknn3-rk1828
- Modelo base en HuggingFace: https://huggingface.co/google/gemma-4-E4B-it
- Modelo base en ModelScope: https://modelscope.cn/models/google/gemma-4-E4B-it
- Wiki de Firefly sobre RK1820/RK1828: https://wiki.t-firefly.com/en/AIO-GS1N2-RK182X/ai_rk182x.html
- Documentación de LlamaPi: https://community.t-firefly.com/docs/ai/applications/LlamaPi/llamapi
- Toolkit RKNN3 en GitHub: https://github.com/airockchip/rknn3-toolkit
- Página oficial de Gemma 4 de Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
