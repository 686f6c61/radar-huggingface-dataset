# VDC-team/VDrontV3-Mini

## Resumen

VDrontV3-Mini es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por el equipo VDC-team. Se trata de un modelo compacto de aproximadamente 205 millones de parámetros totales, diseñado como una evolución del modelo base VDrontV2-0.1b. Su principal innovación radica en una arquitectura híbrida que combina un router top-1 con múltiples bloques de expertos paralelos y un bloque base compartido, permitiendo activar dinámicamente una única ruta experta durante cada paso de inferencia.

El modelo está entrenado exclusivamente sobre el dataset HuggingFaceFW/fineweb-edu y utiliza el tokenizador de GPT-2. Presenta una ventana de contexto de 1024 tokens y ofrece dos modos de generación diferenciados: "Base" y "Quality", que alteran la longitud y variabilidad de las respuestas. Publicado bajo licencia cc0-1.0 (dominio público), el repositorio incluye scripts de ejemplo (`use.py` y `GUIvdront.py`) junto con el archivo `model.py` que describe la arquitectura completa.

A pesar de su tamaño reducido y de no contar con benchmarks publicados, resulta relevante para la comunidad investigadora por explorar un diseño MoE híbrido con routing top-1 y bloques de salida modulables, ofreciendo una base ligera para experimentación y fine-tuning en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE con router top-1, expert blocks, base block y output block multi-versión |
| Parametros totales | 205.569.792 |
| Parametros activos | no disponible |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible (tokenizador GPT-2, probablemente inglés) |
| Licencia | cc0-1.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

VDrontV3-Mini implementa una arquitectura transformer híbrida MoE con un diseño de routing top-1. El flujo comienza con embeddings estándar de token y posición; un router (capa lineal) procesa el embedding y selecciona un único experto entre varias réplicas paralelas de bloques de transformadores ("Expert Blocks"). Tras el paso por el experto activado, los estados ocultos atraviesan un "Base Block" compartido y fijo, que proporciona una fundación común para todas las rutas. Finalmente, un "Output Block" multi-versión alimenta la cabeza de lenguaje, e incluye un "ModeBlock" que permite alternar entre modos de inferencia ("Base" y "Quality").

El entrenamiento se realizó únicamente sobre el dataset HuggingFaceFW/fineweb-edu. No se especifica el número total de tokens de entrenamiento ni si se aplicaron técnicas de alineación como RLHF o DPO. El tokenizador empleado es el de GPT-2, y el formato de chat es simple: `user`, `assistant`, `endoftext`. No se mencionan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto con dos modos de inferencia: "Base" (respuestas más cortas y variadas) y "Quality" (respuestas más estructuradas y largas).
- Routing dinámico MoE con activación top-1 de expertos, lo que permite explorar eficiencia computacional en modelos pequeños.
- Soporte de formato de chat básico con marcadores `user`, `assistant` y `endoftext`.
- Capacidades multilingües no confirmadas; el uso del tokenizador GPT-2 sugiere un enfoque principalmente anglófono.
- No se indica soporte para tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- Investigación educativa sobre arquitecturas MoE: el modelo permite estudiar el comportamiento de routing top-1 y bloques de salida modulables en un entorno de 205M parámetros, ideal para tesis o artículos académicos.
- Prototipado rápido de chatbots de dominio específico: gracias a su tamaño reducido y formato de chat simple, puede integrarse en demos o pruebas de concepto con contexto limitado (1024 tokens).
- Generación de texto corto: adecuado para tareas como redacción de titulares, resúmenes breves o respuestas concisas en aplicaciones donde la latencia y el consumo de recursos sean críticos.
- Experimentación con modos de generación: el modo "Base" y "Quality" permite comparar la variabilidad y estructura de las respuestas, útil para estudiar el efecto de la configuración de inferencia en la calidad del texto.
- Fine-tuning sobre datasets pequeños: al ser un modelo ligero con licencia cc0-1.0, puede ajustarse con hardware modesto para tareas específicas como clasificación de texto o generación de respuestas en un dominio concreto.
- Evaluación de eficiencia MoE en entornos edge: su tamaño de 0.8 GB y su arquitectura híbrida lo convierten en un candidato para probar despliegues en dispositivos con recursos limitados, como Raspberry Pi o CPUs de bajo consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 205M parámetros en precisión fp32, el modelo ocuparía aproximadamente 822 MB en memoria; en fp16 serían unos 411 MB. Es ejecutable en CPU y en GPUs con al menos 1-2 GB de VRAM.
- GPU recomendadas: cualquier GPU con más de 2 GB de VRAM, como NVIDIA GTX 1650, RTX 3050 o superiores. También es viable en Apple Silicon con Metal.
- Compatibilidad con consumer GPU: sí, cabe en la mayoría de GPUs de consumo actuales y en CPUs modernas.
- Opciones de despliegue: no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI. El repositorio incluye scripts propios (`use.py` y `GUIvdront.py`) para ejecutar el modelo directamente.
- Latencia y throughput: no disponible; dependerá del hardware y de la implementación de los scripts proporcionados.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de tamaño similar (por ejemplo, GPT-2 Small con 124M parámetros o modelos MoE como Switch Transformer). No se han publicado datos de rendimiento que permitan establecer una comparación objetiva.

## Limitaciones y advertencias

- Ventana de contexto muy limitada (1024 tokens), lo que restringe su uso en tareas que requieran memoria a largo plazo o documentos extensos.
- Sin benchmarks publicados ni validación externa; el modelo tiene 0 descargas y 0 likes, lo que indica una adopción nula y una falta de pruebas por parte de la comunidad.
- Entrenado exclusivamente sobre fineweb-edu, lo que puede limitar su generalización a dominios no educativos o a vocabulario técnico especializado.
- Tokenizador GPT-2, que está optimizado para inglés y puede producir segmentaciones subóptimas en otros idiomas.
- Riesgo de alucinaciones y sesgos inherentes a los datos de entrenamiento; no se han documentado medidas de mitigación.
- La licencia cc0-1.0 permite uso comercial sin restricciones, pero el autor no ofrece garantías sobre el rendimiento o la seguridad del modelo en producción.
- No se especifican parámetros activos en el diseño MoE, por lo que la eficiencia real frente a un modelo denso equivalente no puede evaluarse.

## Enlaces

- HuggingFace: https://huggingface.co/VDC-team/VDrontV3-Mini
- Repositorio del modelo (incluye `model.py`, `use.py`, `GUIvdront.py`): accesible desde la página de HuggingFace.
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
