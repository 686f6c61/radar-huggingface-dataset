# Verkiki/Qwen-3.8-27b-Fable5-Distill-Abliterated-GGUF

## Resumen

El modelo `Verkiki/Qwen-3.8-27b-Fable5-Distill-Abliterated-GGUF` es una variante cuantizada del Qwen3.8-27B de Alibaba, un modelo denso multimodal de 27.320 millones de parámetros diseñado para tareas de codificación, razonamiento, planificación y ejecución agéntica. Esta versión concreta combina tres elementos: los pesos base de Qwen3.8-27B abliterados por Blackfrost-AI (que reducen la tendencia al rechazo), un LoRA de TeichAI entrenado sobre datos de chat y agentes de Fable 5, y una cuantización GGUF IQ4_XS con matriz de importancia post-fusión. El resultado es un archivo de 15,3 GB que permite ejecutar un modelo de 27B en hardware de consumo con un equilibrio entre calidad y huella de memoria.

La relevancia de esta ficha radica en que el modelo original Qwen3.8-27B es uno de los lanzamientos más recientes de Alibaba (agosto de 2026) y destaca por su soporte nativo multimodal, su ventana de contexto larga y su capacidad para manejar herramientas y entornos agénticos. Esta derivada abliterada y destilada busca conservar esas capacidades, añadiendo un comportamiento de planificación más deliberado (gracias al LoRA Fable5) y una menor tasa de rechazos, todo empaquetado en un formato ligero para ejecución local con llama.cpp u otros motores compatibles con GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (arquitectura qwen3_5) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la ficha; el modelo base Qwen3.8-27B soporta hasta 256K tokens segun documentacion oficial (no confirmado en esta variante) |
| Tipos de cuantizacion | IQ4_XS (GGUF) con imatrix post-fusion; el repo contiene un unico archivo cuantizado |
| Idiomas soportados | No disponibles (el modelo base Qwen3.8 es multilingue, pero no se especifica en esta ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer denso con arquitectura `qwen3_5` que incorpora capacidades multimodales nativas (vision y texto) y un mecanismo de control de razonamiento (`enable_thinking` con niveles `low`, `medium` y `xhigh`). Sobre estos pesos, Blackfrost-AI aplicó un proceso de abliteración que elimina o reduce las activaciones asociadas a comportamientos de rechazo, dando lugar a `Blackfrost-AI/Qwen3.8-27B-ABLITERATED-BF16`. Posteriormente, TeichAI entrenó un LoRA (`TeichAI/Qwen3.8-27B-Fable-Distill-LoRA`) sobre el Qwen3.8-27B original utilizando datos de chat y trazas de agentes de Fable 5, más un corpus privado adicional. El resultado de fusionar este LoRA sobre la base abliterada es un checkpoint intermedio en BF16 que luego se cuantiza a IQ4_XS con una matriz de importancia generada después de la fusión (582 chunks × 512 tokens, ~298K posiciones de calibración). No se han publicado detalles sobre el dataset de entrenamiento del LoRA ni sobre el proceso de abliteración más allá de lo descrito.

## Capacidades

- Generación de texto y razonamiento multi-step con control de pensamiento (`enable_thinking`, `reasoning_effort` de `low` a `xhigh`).
- Codificación agéntica: planificación de cambios antes de editar, trabajo multi-archivo, depuración e implementación iterativa.
- Soporte de tool calling y function calling, orientado a flujos de agentes con herramientas.
- Capacidades multimodales nativas (vision y texto) heredadas del Qwen3.8-27B base.
- Razonamiento mejorado en tareas de tipo ARC (según benchmarks del LoRA padre).
- Comprensión de instrucciones y preguntas factuales mejorada (según BoolQ del LoRA padre).
- Comportamiento de planificación deliberado: mantiene objetivos a lo largo de múltiples pasos en lugar de dar la primera respuesta plausible.
- Menor tendencia al rechazo gracias a la base abliterada, lo que facilita su uso en flujos técnicos legítimos que suelen disparar falsos positivos en modelos más conservadores.

## Casos de uso

- Agentes de codificación autónomos: el modelo puede recibir una tarea de implementación, descomponerla en pasos, consultar el repositorio, generar código y verificar resultados, gracias a su soporte de tool calling y su capacidad de planificación multi-paso.
- Asistente de refactorización de código: con su ventana de contexto larga y su entrenamiento en trazas de agentes, puede analizar múltiples archivos, proponer cambios y ejecutarlos de forma iterativa.
- Automatización de oficina: el Qwen3.8-27B base está diseñado para tareas de ofimática; esta variante puede procesar documentos, extraer información y generar informes estructurados manteniendo el contexto de una conversación larga.
- Investigación técnica y revisión de literatura: su capacidad de razonamiento mejorado (ARC +0.046) y su control de pensamiento permiten descomponer preguntas de investigación complejas en subtareas y sintetizar respuestas con justificaciones.
- Desarrollo de pipelines de CI/CD: puede integrarse como agente que lee logs, diagnostica fallos, propone parches y los valida, reduciendo la intervención manual.
- Chat técnico de soporte con contexto largo: su ventana de 256K tokens (heredada del base) permite mantener conversaciones multi-turno con historiales extensos y documentación adjunta, respondiendo con precisión a consultas de programación o configuración.
- Prototipado rápido de agentes conversacionales: al ser un GGUF de 15,3 GB, puede desplegarse en una estación de trabajo con GPU de 24 GB para experimentar con arquitecturas de agentes sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para el modelo final cuantizado (IQ4_XS). Los datos disponibles provienen del modelo padre TeichAI/Qwen3.8-27B-Fable5-Distill, que comparó su LoRA sobre el Qwen3.8-27B original:

| Benchmark | Qwen3.8-27B | Qwen3.8-27B Fable5-Distill | Diferencia |
|---|---:|---:|---:|
| ARC Challenge | 0.591 | 0.637 | +0.046 |
| ARC Challenge Easy | 0.782 | 0.832 | +0.050 |
| BoolQ | 0.896 | 0.911 | +0.015 |

Estos resultados indican una mejora consistente del LoRA sobre el base, pero no son directamente aplicables al checkpoint fusionado con abliteración y cuantizado a IQ4_XS. El autor de la ficha advierte explícitamente que un benchmark de un padre no es una medida automática del resultado final. No se dispone de datos de rendimiento (latencia, throughput) para la versión GGUF.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF pesa 15,3 GB, por lo que se necesita al menos 16 GB de VRAM para cargar los pesos sin offloading. Con contexto largo (p.ej. 32K tokens) se recomiendan 24 GB.
- GPUs compatibles: RTX 4090 (24 GB) puede ejecutar el modelo con comodidad; RTX 4080 o RTX 3090 (24 GB) también. GPUs de 16 GB (RTX 4080 Super, RTX 3080 Ti) pueden funcionar con offloading parcial a CPU o con contextos reducidos.
- En hardware de consumo: sí, cabe en GPUs de gama alta para consumidores (24 GB) y en algunas de 16 GB con limitaciones.
- Opciones de despliegue: llama.cpp (nativo), Ollama, LM Studio, vLLM con soporte GGUF, o TGI si se convierte a otro formato.
- Latencia y throughput: no disponibles. Como referencia, un modelo 27B en IQ4_XS en una RTX 4090 suele generar entre 20 y 40 tokens por segundo con llama.cpp, pero esto depende de la implementación y del contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27,3B | 256K (según documentacion) | BF16/FP8 | Apache 2.0 | Modelo base, multimodal, sin abliteracion ni distill |
| Verkiki/Qwen-3.8-27b-Fable5-Distill-Abliterated-GGUF | 27,3B | No disponible (heredado del base) | GGUF IQ4_XS | Apache 2.0 | Variante abliterada + LoRA Fable5, cuantizada |
| Blackfrost-AI/Qwen3.8-27B-ABLITERATED-BF16 | 27,3B | No disponible | BF16 | Apache 2.0 | Base abliterada sin LoRA, mayor huella de memoria |

No se dispone de comparaciones directas con otros modelos 27B de otras familias (p.ej. Gemma 2 27B o Llama 3.1 70B) en la informacion proporcionada. La principal diferencia con el Qwen3.8-27B original es el menor tamaño de archivo (15,3 GB frente a ~55 GB en BF16) y el comportamiento de rechazo reducido, a costa de una posible pérdida de precisión por la cuantización y por la modificación de los pesos.

## Limitaciones y advertencias

- La abliteración puede eliminar comportamientos de seguridad importantes, aumentando el riesgo de generar contenido inapropiado, sesgado o dañino. El autor lo presenta como ventaja para flujos técnicos, pero es un riesgo para producción.
- Los benchmarks publicados corresponden al LoRA padre sobre el modelo original, no al checkpoint fusionado ni al cuantizado. El rendimiento real del IQ4_XS puede ser inferior, especialmente en tareas que requieren precisión numérica o razonamiento largo.
- La cuantización IQ4_XS introduce pérdida de calidad respecto a BF16; para tareas críticas se recomienda validar el modelo en el caso de uso concreto.
- No se especifican los idiomas soportados; aunque Qwen3.8 es multilingüe, no hay garantía de que la abliteración o el LoRA mantengan el mismo rendimiento en todos los idiomas.
- La longitud de contexto no está confirmada en esta variante; si se usa más allá de la ventana soportada, el modelo puede degradarse o fallar.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es un modelo reciente y sin validación comunitaria.
- La licencia Apache 2.0 permite uso comercial, pero hay que verificar que los pesos base y el LoRA también la respeten (en este caso ambos indican Apache 2.0).

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/Verkiki/Qwen-3.8-27b-Fable5-Distill-Abliterated-GGUF
- Repositorio HuggingFace del modelo base abliterado: https://huggingface.co/Blackfrost-AI/Qwen3.8-27B-ABLITERATED-BF16
- Repositorio HuggingFace del LoRA: https://huggingface.co/TeichAI/Qwen3.8-27B-Fable-Distill-LoRA
- Repositorio del modelo Fable5-Distill completo: https://huggingface.co/TeichAI/Qwen3.8-27B-Fable-Distill
- Repositorio oficial de Qwen3.8-27B en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Ficha de benchmarks y especificaciones en AI Release Tracker: https://aireleasetracker.com/model/qwen/qwen3.8-27b
- Guía de despliegue en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-8-27b/
- Análisis de requisitos de hardware en Yottalabs: https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
