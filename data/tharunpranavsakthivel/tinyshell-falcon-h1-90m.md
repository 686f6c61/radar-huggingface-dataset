# tharunpranavsakthivel/tinyshell-falcon-h1-90m

## Resumen

Tinyshell-Falcon-H1-90M es un modelo de lenguaje compacto de 91 millones de parámetros, desarrollado por tharunpranavsakthivel como un fine-tune supervisado del modelo `tiiuae/Falcon-H1-Tiny-Tool-Calling-90M` de TII (Technology Innovation Institute). Su propósito específico es convertir instrucciones en lenguaje natural en representaciones intermedias estructuradas (IR) en formato JSON, denominadas ShellIntent, para el sistema TinyShell. El modelo clasifica la intención en tres decisiones de alto nivel: `compile`, `clarify` y `unsupported`.

La relevancia de este modelo radica en su tamaño extremadamente reducido (91M parámetros), que permite su ejecución en entornos con recursos limitados, manteniendo a su vez capacidades de generación estructurada y tool-calling. Al ser un derivado de Falcon-H1, hereda la arquitectura híbrida Transformer-SSM de la familia Falcon-H1, optimizada para eficiencia y baja latencia. El modelo está diseñado para tareas de generación de texto con salida JSON estricta, y su licencia es la Falcon LLM License, que permite uso comercial con ciertas restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Falcon-H1 (híbrida Transformer + State Space Model) |
| Parametros totales | 91.131.072 (91M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Falcon LLM License (falcon-llm-license) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Falcon-H1, que combina atención Transformer clásica con modelos de espacio de estado (SSM) en un diseño híbrido paralelo. Esta arquitectura está optimizada para ofrecer alta eficiencia computacional y baja latencia en modelos de pequeño tamaño. El modelo original de 90M parámetros fue entrenado por TII específicamente para tool-calling, y este derivado ha sido fine-tuneado con aprendizaje supervisado de modelado de lenguaje causal (supervised causal language modeling).

El entrenamiento se realizó con 1.600 ejemplos, con 200 ejemplos de validación y 200 de test. Se utilizó una semilla aleatoria de 42, y la pérdida de validación final fue de 0,1105. Los tokens del prompt fueron enmascarados de la pérdida, utilizando solo la respuesta JSON del asistente como objetivo supervisado. El pico de memoria GPU durante el entrenamiento fue de 2,07 GB. Los detalles completos del entrenamiento se incluyen en el repositorio en `evaluation/training_result.json`.

## Capacidades

- Conversión de instrucciones en lenguaje natural a JSON estructurado (ShellIntent) para el sistema TinyShell.
- Clasificación de intenciones en tres categorías: `compile`, `clarify` y `unsupported`.
- Generación de JSON con criterio de parada en el primer objeto JSON completo (stopping criterion de generación, no reparación post-hoc).
- Soporte de tool-use y function-calling, heredado del modelo base Falcon-H1-Tiny.
- Generación de texto conversacional con template de chat.
- Capacidad de operaciones multi-paso en el IR (aunque con precisión limitada, ver benchmarks).
- Validación de riesgos y confirmación de acciones dentro del flujo de ShellIntent.

## Casos de uso

- Asistentes de línea de comandos inteligentes: el modelo convierte comandos en lenguaje natural en IR estructurado que un compilador determinista puede ejecutar, permitiendo interfaces de terminal conversacionales.
- Automatización de tareas de shell en entornos con recursos limitados: gracias a sus 91M parámetros, puede ejecutarse en dispositivos edge o en CPUs sin GPU, ofreciendo parsing de intenciones para scripts de automatización.
- Sistemas de clarificación de comandos ambiguos: el modelo detecta cuándo una instrucción no es clara y genera una solicitud de clarificación estructurada, facilitando flujos de diálogo multi-turno.
- Filtrado de comandos no soportados: clasifica instrucciones como `unsupported` con una precisión del 30% (según benchmark), lo que permite descartar acciones no permitidas en el sistema.
- Generación de JSON para integración con herramientas de orquestación: el modelo puede usarse como front-end de parsing en pipelines que requieren salida JSON válida para alimentar sistemas de ejecución.
- Evaluación y prototipado de modelos de tool-calling a pequeña escala: sirve como referencia para investigar técnicas de fine-tuning en modelos compactos para generación estructurada.

## Benchmarks y rendimiento

El modelo incluye métricas de evaluación en datos held-out (200 ejemplos de test). Los resultados son los siguientes:

| Metrica | Resultado |
|---|---|
| JSON parse rate | 99,50% |
| Schema validity | 96,50% |
| IR exact match | 33,00% |
| Decision accuracy | 95,50% |
| Operation accuracy | 58,00% |
| Slot precision | 65,37% |
| Slot recall | 57,80% |
| Slot F1 | 61,35% |
| Risk accuracy | 94,00% |
| Confirmation accuracy | 95,00% |
| Clarify accuracy | 100,00% |
| Unsupported accuracy | 30,00% |
| Multi-operation accuracy | 22,22% |
| Mediana de latencia de inferencia | 3700,20 ms |

No se han publicado resultados comparativos con otros modelos en la información disponible. La latencia de inferencia es notablemente alta para un modelo de 91M, lo que sugiere que la evaluación se realizó en hardware sin optimización o con cuantización no especificada.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 91M parámetros en safetensors, el peso en FP32 ocupa aproximadamente 364 MB. En FP16 ocuparía ~182 MB. Cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 1060 6GB o superior, RTX 3060, etc.). También puede ejecutarse en CPU con suficiente RAM.
- Compatibilidad con consumer GPU: sí, es ampliamente compatible.
- Opciones de despliegue: al usar la librería `transformers`, puede desplegarse con Hugging Face Inference Endpoints, vLLM (si soporta Falcon-H1), o mediante scripts Python personalizados. No se menciona soporte para llama.cpp u Ollama.
- Latencia y throughput: la mediana de latencia reportada es de 3700 ms, pero este dato proviene de un entorno de evaluación específico y no es representativo de un despliegue optimizado. En hardware moderno con cuantización, la latencia debería ser mucho menor.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (modelos de 90M para tool-calling y generación estructurada). El modelo base Falcon-H1-Tiny-Tool-Calling-90M es el referente inmediato, pero no se han publicado resultados comparativos entre ambos. Se puede mencionar que modelos como FunctionGemma o LFM2.5 se citan en la model card como referencias en la evaluación, pero no se proporcionan datos numéricos de comparación.

## Limitaciones y advertencias

- El modelo emite intenciones estructuradas no verificadas: no se debe ejecutar directamente su salida. Es obligatorio validar el JSON contra el esquema TinyShell, compilarlo con un compilador determinista y aplicar comprobaciones de seguridad.
- La precisión de IR exact match es baja (33%): errores en una sola operación o argumento invalidan la predicción completa.
- La precisión para la categoría `unsupported` es solo del 30%, lo que puede provocar falsos negativos en la detección de comandos no permitidos.
- La precisión multi-operación es del 22,22%, indicando dificultad para manejar instrucciones que requieren múltiples operaciones.
- El entrenamiento se realizó con una sola semilla, por lo que los intervalos de confianza del test-set no sustituyen a un entrenamiento repetido independiente.
- Solo soporta inglés (`language: en`).
- La licencia Falcon LLM License impone restricciones de uso comercial; se debe revisar el texto completo en el enlace proporcionado.
- El modelo es un piloto y su robustez en producción no está garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tharunpranavsakthivel/tinyshell-falcon-h1-90m
- Modelo base: https://huggingface.co/tiiuae/Falcon-H1-Tiny-Tool-Calling-90M
- Colección Falcon-H1-Tiny: https://huggingface.co/collections/tiiuae/falcon-h1-tiny
- Página oficial Falcon-H1: https://falconllm.tii.ae/falcon-h1.html
- Documentación de Falcon-H1 en Transformers: https://huggingface.co/docs/transformers/main/en/model_doc/falcon_h1
- Blog de Falcon-H1: https://falcon-lm.github.io/blog/falcon-h1/
- Paper de Falcon-H1 (arXiv): https://arxiv.org/abs/2507.22448
- Licencia Falcon LLM: https://falconllm.tii.ae/falcon-terms-and-conditions.html
