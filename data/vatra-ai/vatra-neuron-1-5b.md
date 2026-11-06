# VATRA-AI/Vatra-Neuron-1.5B

## Resumen

Vatra-Neuron-1.5B es un modelo de lenguaje especializado en generación de código y razonamiento algorítmico, desarrollado por VATRA-AI. Con 1.543.714.304 parámetros (aproximadamente 1,5B), se construye sobre la arquitectura Qwen2 y se distribuye en formato safetensors con pesos en bfloat16. El modelo está orientado a tareas de programación competitiva, resolución de problemas algorítmicos y asistencia a desarrolladores, con soporte declarado para inglés e indonesio.

El modelo se presenta acompañado de un sistema propietario denominado "Vatra Dynamic Engine", que el autor describe como un mecanismo de consenso de ejecución iterativa y auto-reparación sin fuga de datos. Según la model card, este motor envuelve al modelo base y mejora sustancialmente los resultados en benchmarks de código mediante la selección de candidatos y la corrección iterativa de soluciones. Es importante señalar que estas mejoras corresponden al sistema completo y no únicamente a los pesos del modelo, por lo que la comparación con modelos estándar de un solo disparo no es directa.

La relevancia del modelo radica en su enfoque: un modelo pequeño (1,5B) combinado con un pipeline de ejecución y verificación puede acercarse en tareas de código a modelos mucho mayores. No obstante, la licencia es restrictiva (no comercial y con cláusula anti-rebranding), el modelo no soporta inferencia directa según su propia model card (`inference: false`) y no se han publicado detalles sobre el dataset de entrenamiento ni sobre el proceso de alineación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basada en Qwen2 (con sistema externo "Vatra Dynamic Engine") |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | en, id |
| Licencia | vatra-license-v1 (VATRA-AI Source-Available Non-Commercial & Anti-Rebranding License v1.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer decoder-only basada en Qwen2, con 1.543.714.304 parámetros. La model card no especifica el número de capas, la dimensión oculta, el número de cabezas de atención ni la longitud de contexto soportada. Los pesos se publican en safetensors con precisión bfloat16 y el repositorio ocupa 3,1 GB.

El componente diferencial declarado es el "Vatra Dynamic Engine", descrito como un sistema de consenso de ejecución iterativa y auto-reparación con metodología "zero-leakage". Según el autor, este motor genera múltiples candidatos, los evalúa contra los casos de prueba públicos del enunciado y aplica correcciones iterativas antes de la evaluación final contra casos privados aislados. No se proporciona información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o instrucción supervisada. Tampoco se detalla si el motor forma parte de los pesos o es un framework de inferencia externo, aunque la estructura de la model card sugiere lo segundo.

## Capacidades

- Generación de código en Python orientada a problemas algorítmicos y programación competitiva.
- Razonamiento algorítmico con énfasis en complejidad temporal y espacial (el ejemplo de la model card solicita una solución en O(n)).
- Auto-corrección iterativa de soluciones mediante el sistema Vatra Dynamic Engine, con verificación contra casos de prueba públicos.
- Generación de texto conversacional con plantilla de chat (roles system, user, assistant).
- Soporte multilingüe limitado a inglés e indonesio según los metadatos.
- No se declara soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Asistencia en programación competitiva: el modelo puede generar soluciones a problemas algorítmicos y, con el motor Vatra, iterar sobre ellas usando los casos de prueba del enunciado para descartar candidatos incorrectos antes de la entrega.
- Generación de funciones Python en entornos de evaluación: adecuado para tareas tipo HumanEval o MBPP donde se dispone de tests públicos para validar la salida.
- Herramienta educativa de algoritmia: puede explicar y generar implementaciones de estructuras de datos y algoritmos clásicos, con la ventaja de que el pipeline permite verificar la corrección de forma automática.
- Prototipado de scripts de automatización en Python: para tareas acotadas donde el coste de un modelo pequeño es preferible a uno de gran escala.
- Filtrado y generación de candidatos en pipelines de datos de código: el modelo puede producir múltiples soluciones a un problema y el motor seleccionar la que pasa los tests, útil para aumentar datasets de entrenamiento.
- Evaluación comparativa de modelos pequeños en tareas de código: sirve como referencia de hasta dónde puede llegar un modelo de 1,5B con un pipeline de verificación externo.
- Asistencia en indonesio e inglés: para desarrolladores de habla indonesia que necesiten generación de código con instrucciones en su idioma.

## Benchmarks y rendimiento

Los únicos datos disponibles provienen de la model card del autor y comparan el modelo en modo de un solo disparo frente al sistema completo con el Vatra Dynamic Engine. No se aportan resultados de modelos comparables de terceros.

| Benchmark | Single-Shot Baseline | Vatra-Neuron Engine | Ganancia neta |
|---|---|---|---|
| LiveCodeBench v6 (ponderado oficial) | 9,11% | 30,34% | +21,23% |
| LiveCodeBench v6 (split fácil) | 40,00% | 90,00% | +50,00% |
| LiveCodeBench v6 (split medio) | 5,00% | 20,00% | +15,00% |
| OpenAI HumanEval (164 tareas) | 57,32% | 59,76% | +2,44% |
| Google MBPP Sanitized (100 tareas) | 64,00% | 77,00% | +13,00% |

El autor declara una metodología "zero-leakage" en la que la selección de candidatos y la auto-reparación usan únicamente los casos de prueba públicos del enunciado, reservando los privados para la evaluación final. No se han publicado resultados independientes que verifiquen estas cifras.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 3,1 GB solo para pesos, más overhead de activaciones y caché KV (estimación típica de 4-6 GB en total para contextos moderados).
- En cuantización de 8 bits: aproximadamente 1,6-2 GB de VRAM; en 4 bits: aproximadamente 1-1,5 GB (estimaciones, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060, RTX 4060, RTX 4070, RTX 4090) debería poder ejecutar el modelo en bfloat16 o cuantizado. Para despliegue en servidor, A100 o H100 son sobredimensionadas para este tamaño.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de tarjetas con 8 GB o más.
- Opciones de despliegue: la model card solo documenta uso vía Transformers con `AutoModelForCausalLM`. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI, y la propia model card indica `inference: false`, lo que sugiere que el sistema Vatra Dynamic Engine podría no estar disponible como código abierto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vatra-Neuron-1.5B | 1,54B | no disponible | Código y algoritmia con motor externo | vatra-license-v1 (no comercial) | Pesos en HF, motor no confirmado |
| Qwen2.5-Coder-1.5B | 1,54B | 32K (según documentación pública del modelo base) | Código general | Apache 2.0 | Pesos y ecosistema amplio |
| DeepSeek-Coder-1.3B | 1,3B | 16K (según documentación pública) | Código general | DeepSeek License | Pesos en HF |
| StarCoder2-3B | 3B | 16K (según documentación pública) | Código multilingüe | BigCode OpenRAIL-M | Pesos en HF |

No se dispone de comparaciones directas de rendimiento publicadas por el autor frente a estos modelos. Las cifras de LiveCodeBench del sistema Vatra no son comparables de forma directa con resultados de un solo disparo de otros modelos, ya que incluyen selección y reparación iterativa.

## Limitaciones y advertencias

- La licencia vatra-license-v1 es source-available y no comercial: prohíbe el uso comercial y el rebranding sin permiso escrito. No es apta para producción comercial sin negociación con el autor.
- La model card declara `inference: false`, lo que indica que el sistema completo (Vatra Dynamic Engine) podría no estar disponible para ejecución directa; solo se publican los pesos.
- Las mejoras de benchmark corresponden al pipeline completo, no al modelo en un solo disparo. El baseline single-shot en LiveCodeBench ponderado es solo del 9,11%, lo que refleja una capacidad base modesta.
- No hay información sobre el dataset de entrenamiento, el proceso de alineación ni posibles sesgos. El riesgo de alucinación en código (APIs inexistentes, imports incorrectos) no está evaluado.
- Idiomas limitados a inglés e indonesio; el rendimiento en castellano no está documentado.
- Longitud de contexto desconocida, lo que impide evaluar su idoneidad para tareas con repositorios grandes o conversaciones largas.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad ni resultados independientes.
- La fecha de creación del repositorio (2026-11-05) es posterior a la fecha actual de referencia habitual; conviene verificar la integridad y procedencia del repositorio antes de usarlo.
- No se documentan capacidades de tool calling ni de agentes, por lo que no es recomendable asumirlas en producción.

## Enlaces

- Hugging Face: https://huggingface.co/VATRA-AI/Vatra-Neuron-1.5B
- Licencia (referenciada en la model card): archivo LICENSE dentro del repositorio de Hugging Face
- No se han encontrado papers, blogs, repositorios de código ni demos adicionales en la información disponible.
