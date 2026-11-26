# Youssofal/Inkling-2-Mini-MTPLX-Bare-Speed-FP16

## Resumen

Inkling-2-Mini-MTPLX-Bare-Speed-FP16 es un empaquetado de pesos derivado del modelo base thinkingmachines/Inkling-2-Mini, publicado por el usuario Youssofal. No se trata de un modelo entrenado desde cero, sino de una conversión del modelo original de Thinking Machines Lab a un formato optimizado para su ejecución en Apple Silicon mediante MTPLX, una aplicación y herramienta de línea de comandos para modelos locales en Mac. El modelo base es un transformer de tipo Mixture of Experts (MoE) con 26.437.722.672 parámetros totales y aproximadamente 3.400 millones de parámetros activos por token, según la model card.

La particularidad de esta variante es que almacena todos los tensores de 16 bits (incluida la torre de visión y la cabeza de borrador de decodificación especulativa) como float16 en lugar de bfloat16, porque los chips M1 y M2 de Apple no tienen soporte nativo de bfloat16. Mantiene los códigos de cuantización de 4 y 8 bits del paquete padre, de modo que la disposición y la ventana de contexto son idénticas. Está pensada para Macs con M1 o M2 y 32 GB o más de memoria unificada.

El modelo resuelve el problema de ejecutar localmente un modelo multimodal de gran tamaño con decodificación especulativa sobre hardware Apple Silicon antiguo. Su relevancia actual radica en que permite inferencia local con visión, tool calling y generación de código en equipos de consumo, con una ventana de contexto declarada de hasta 1 millón de tokens según la model card del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) |
| Parametros totales | 26.437.722.672 |
| Parametros activos | ~3.400 millones por token (según model card) |
| Longitud de contexto | Hasta 1.000.000 tokens (según model card del base) |
| Tipos de cuantizacion | 4-bit, 8-bit; tensores de 16 bits en float16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería mtplx) |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini, desarrollado por Thinking Machines Lab, es un transformer con arquitectura Mixture of Experts en el que cada token activa aproximadamente 3.400 millones de parámetros de un total de 26.400 millones. Incorpora una torre de visión completa para entrada image-text-to-text y una cabeza de predicción multi-token (MTP) que actúa como borrador para decodificación especulativa. La model card del paquete no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esos datos no están disponibles en la información proporcionada.

La innovación técnica de este paquete concreto es la adaptación a Apple Silicon de primera generación: los tensores de 16 bits se almacenan como float16 en lugar de bfloat16 para los chips M1 y M2, que carecen de soporte nativo de bfloat16. Los códigos de 4 y 8 bits se conservan intactos respecto al paquete padre. La decodificación especulativa se implementa mediante la cabeza de borrador del propio modelo: MTPLX genera varios tokens por adelantado y los verifica en una sola pasada del modelo completo, preservando la distribución original del modelo. Según las mediciones del autor en un M5 Max, el paquete mantiene el mismo token superior que los pesos oficiales en 241 de 256 posiciones (94,1%) tras un prompt de 4.142 tokens, con una divergencia KL media de 0,0292.

## Capacidades

- Generación de texto conversacional multi-turno con contexto largo.
- Razonamiento y resolución de problemas, incluyendo modo de pensamiento (thinking) según las etiquetas del modelo.
- Generación y edición de código, con soporte para tareas de programación ejecutables.
- Comprensión de imágenes: lectura de capturas de pantalla, diagramas y fotografías mediante la torre de visión incluida.
- Tool calling y function calling: la model card documenta un turno de llamada a herramienta con el nombre de ciudad indicado por el usuario.
- Razonamiento multi-paso y uso como agente.
- Decodificación especulativa con predicción multi-token nativa.
- Capacidades multilingües: no disponible en detalle.

## Casos de uso

- Asistencia de programación local en Mac: el modelo puede generar y revisar código directamente en un MacBook Pro o Mac Studio con M1/M2 y 32 GB o más, sin enviar datos a la nube, aprovechando la ventana de contexto de hasta 1M tokens para analizar repositorios completos.
- Análisis de capturas de pantalla y diagramas: la torre de visión permite leer el nombre y los recuentos de un test fallido a partir de una captura, útil para depuración asistida en entornos de desarrollo locales.
- Automatización de agentes con tool calling: integración en flujos donde el modelo debe invocar herramientas externas (APIs, scripts locales) y encadenar varios pasos de razonamiento, con verificación de tokens mediante decodificación especulativa para reducir latencia.
- Asistencia al cliente en local: conversaciones multi-turno con contexto extenso, desplegables en infraestructura Apple Silicon sin dependencia de servicios externos.
- Procesamiento de documentación técnica con imágenes: extracción de información de diagramas de arquitectura, capturas de paneles y documentación escaneada combinando entrada de texto e imagen.
- Prototipado e investigación en Mac: entorno de bajo coste para evaluar modelos MoE multimodales con cuantización 4-bit y 8-bit, con métricas de rendimiento publicadas frente a mlx-serve y oMLX.
- Generación de tests ejecutables: la model card reporta 6 de 6 tests de código ejecutables superados en 3 tareas con 2 semillas cada una a temperatura 1.0.

## Benchmarks y rendimiento

Los datos publicados por el autor corresponden a mediciones de calidad y velocidad en MTPLX 2.13 sobre un MacBook Pro M5 Max con 128 GB, ejecutando la ruta de código equivalente a M1/M2 (kernels y pesos float16). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Prueba | Resultado |
|---|---|
| Coincidencia de token superior con pesos oficiales (256 posiciones tras prompt de 4.142 tokens) | 241 de 256 (94,1%), KL media 0,0292 |
| Tests de código ejecutables (3 tareas, 2 semillas, temperatura 1.0) | 6 de 6 superados |
| Lectura de captura de test fallido | Leyó el nombre del test y ambos recuentos |
| Turno de tool calling | Invocó la herramienta solicitada con la ciudad indicada |
| Memoria pico sirviendo prompt de 4.142 tokens | 18,3 GiB |

Comparativa de velocidad de decodificación (tokens/s) sobre pesos oficiales, publicada por el autor:

| Prueba | MTPLX 2.13.2 | mlx-serve 26.11.4 | oMLX 0.8.3 |
|---|---:|---:|---:|
| Prompt de código 4.142 tokens, primera petición | 96,2 | 79,0 | 62,9 |
| Prompt de código 4.142 tokens, repetida | 90,5 | 73,9 | 57,6 |
| Prompt corto 558 tokens | 75,0 | 72,3 | 56,8 |
| Respuesta larga 1.500 tokens | 78,1 | 70,1 | 53,0 |
| Media de las cuatro pruebas | 85,0 | 73,8 | 57,6 |

## Requisitos de hardware

- VRAM/memoria unificada estimada: 18,3 GiB de pico sirviendo un prompt de 4.142 tokens según el autor; se recomienda Mac con 32 GB o más.
- GPU recomendadas: Apple Silicon M1 y M2 (esta variante FP16 está pensada específicamente para ellos); los Macs más recientes usan el paquete padre en bfloat16.
- Cabe en GPU de consumo: sí, en Macs con M1/M2 y 32 GB o más, desde MacBook Pro hasta Mac Studio.
- Opciones de despliegue: aplicación MTPLX y comando `mtplx start`; el paquete está en formato mtplx/safetensors, no en GGUF ni para vLLM o llama.cpp.
- Latencia y throughput: primera petición con prompt de 4.142 tokens en 1,69 s y prefill de 2.466 tok/s en MTPLX con el paquete Bare Speed; decodificación media de 85,0 tok/s sobre pesos oficiales y 97,1 tok/s con paquete rápido. No se ha medido velocidad en un M1 o M2 real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling-2-Mini-MTPLX-Bare-Speed-FP16 | 26,4B totales / ~3,4B activos | Hasta 1M | Apache 2.0 | Hugging Face (este repo) |
| Inkling-2-Mini-MTPLX-Bare-Speed (padre) | 26,4B totales / ~3,4B activos | Hasta 1M | Apache 2.0 | Hugging Face |
| thinkingmachines/Inkling-2-Mini (base) | 26,4B totales / ~3,4B activos | Hasta 1M | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El paquete no se ha ejecutado en un M1 o M2 real; las métricas de velocidad se midieron en un M5 Max siguiendo la ruta de código de M1/M2.
- La coincidencia de token superior con los pesos oficiales es del 94,1%, no del 100%: existe una divergencia medible respecto al modelo original.
- Los idiomas soportados no están documentados.
- No hay datos publicados sobre sesgos, tasas de alucinación ni evaluación de seguridad.
- El formato es específico de MTPLX (librería mtplx); no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI.
- Requiere Mac con M1/M2 y 32 GB o más; en equipos con menos memoria no es viable.
- Licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base deben verificarse en su repositorio original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Youssofal/Inkling-2-Mini-MTPLX-Bare-Speed-FP16
- Paquete padre: https://huggingface.co/Youssofal/Inkling-2-Mini-MTPLX-Bare-Speed
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- MTPLX: https://mtplx.com
- Página del modelo en MTPLX: https://mtplx.com/models/inkling-2-mini/
- Comparativa MTPLX vs mlx-serve vs oMLX: https://mtplx.com/compare/mlx-serve-vs-omlx-vs-mtplx/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
