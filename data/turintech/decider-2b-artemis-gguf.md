# turintech/decider-2b-Artemis-GGUF

## Resumen

Decider-2b-Artemis-GGUF es una versión cuantizada, creada por TurinTech con su herramienta Artemis, del modelo decider-2b de Mapika. No se trata de un modelo conversacional genérico, sino de un modelo de decisión especializado: recibe un estado y una lista de preguntas, cada una con sus propias opciones, y devuelve en una sola pasada una probabilidad para cada opción. Esto lo hace ideal para enrutar tareas, clasificar tickets o tomar decisiones tipadas dentro de pipelines de agentes.

La relevancia de esta ficha radica en la cuantización: el archivo por defecto, `decider-2b-Artemis-Q4_K_M.gguf`, ocupa 1,273 GB y reproduce las respuestas del modelo original en BF16 en el 93,65 % de 2.000 decisiones del conjunto final de evaluación, frente al 89,45 % de la cuantización Q4_K_M estándar de Mapika. Con unos 1.880 millones de parámetros, puede ejecutarse en una GPU pequeña o directamente en CPU.

Un detalle importante: solo funciona como modelo de decisión a través del script `decide_gguf.py` de Mapika sobre llama-cpp-python. Servidores estándar como llama-server, Ollama o LM Studio lo tratan como un modelo de texto convencional, por lo que no exponen su interfaz de decisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo de decisión sobre base decider-2b; detalles no disponibles) |
| Parametros totales | 1.881.825.088 (~1,88 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (contexto por defecto de `decide_gguf.py`) |
| Tipos de cuantizacion | Q4_K_M (archivo por defecto, `decider-2b-Artemis-Q4_K_M.gguf`); otras variantes no disponibles |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es Mapika/decider-2b, un modelo de decisión de tipo transformer cuyo propósito es, dado un estado y varias preguntas con opciones, calcular la distribución de probabilidad sobre las opciones de cada pregunta en una única pasada de inferencia. Las preguntas de tipo sí/no o de puntuación se formulan como elecciones con sus opciones escritas textualmente, y la selección se realiza a la temperatura de elección definida en `decider_config.json` (2,465 en esta configuración).

La variante Artemis es una cuantización generada por TurinTech con su herramienta Artemis. Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) no hay datos disponibles en la información proporcionada.

## Capacidades

- Clasificación de texto estructurada: dada una entrada (estado) y múltiples preguntas con opciones, devuelve para cada pregunta la opción más probable, su confianza y la probabilidad de todas las opciones, en una sola pasada.
- Decisiones multi-pregunta simultáneas: en el ejemplo de la model card, clasifica un ticket a la vez por departamento (billing/technical/sales) y urgencia (low/medium/high).
- Salida calibrada en probabilidades: `decide()` devuelve un objeto con `choice`, `confidence` y `probs` por pregunta, lo que permite aplicar umbrales de confianza en producción.
- Ejecución en GPU o CPU: `GGUFDecider(path, n_gpu_layers=0)` fuerza ejecución en CPU; con llama-cpp-python compilado con CUDA usa la GPU automáticamente.
- No soporta (por diseño): generación de texto libre, tool calling, agentes multi-paso, visión ni audio. No es un modelo conversacional pese a la etiqueta `conversational` del repositorio.

## Casos de uso

- Enrutado de tickets de soporte: clasifica automáticamente cada incidencia por departamento (facturación, técnico, ventas) y nivel de urgencia en una sola llamada, con probabilidades por opción para aplicar umbrales de escalamiento.
- Orquestación de agentes: un agente supervisor puede usar el modelo para decidir en cada paso qué herramienta o subagente invocar, dado el estado actual y el catálogo de opciones.
- Clasificación de intenciones en chatbots: mapea el mensaje del usuario a una intención cerrada (reembolso, consulta técnica, queja) con su distribución de probabilidad, útil para derivar a flujos distintos.
- Moderación y filtrado de contenido: decisiones tipadas sí/no sobre si un mensaje cumple una política, evaluando varias políticas en paralelo en la misma pasada.
- Selección de parámetros en pipelines: decidir entre configuraciones discretas (por ejemplo, nivel de verbosidad, modelo destino, prioridad de cola) en función del contexto de ejecución.
- Sistemas embebidos o edge: con 1,273 GB de descarga y ~3 GiB de memoria pico en CPU, cabe en máquinas sin GPU dedicada para tomar decisiones locales sin depender de APIs externas.

## Benchmarks y rendimiento

Resultados declarados por TurinTech (no verificados de forma independiente), sobre el conjunto final del dataset LocalLLaMA/typed-decisions (2.000 decisiones, una única evaluación):

| Métrica | Valor | Comparación |
|---|---|---|
| Acuerdo con el modelo BF16 original | 93,65 % | 89,45 % para la Q4_K_M de Mapika (1,274 GB) |
| Cambios en respuestas con alta confianza | 0 | no disponible |
| Accuracy en el conjunto final | 61,15 % | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- Descarga: 1,273 GB para el archivo por defecto `decider-2b-Artemis-Q4_K_M.gguf` (repo completo: 1,3 GB).
- Memoria pico medida: 3,97 GiB en una NVIDIA A100-SXM4-80GB con contexto de 32.768 tokens; 2,95 GiB en compilación solo CPU.
- Consumer GPUs: no hay mediciones publicadas, pero con ~4 GiB de memoria pico debería caber con holgura en GPUs como la RTX 3060 de 12 GB o la RTX 4060 Ti; no disponible una lista verificada.
- CPU: viable; la compilación solo CPU consume ~2,95 GiB y produce probabilidades ligeramente distintas a la GPU (diferencias relevantes solo en decisiones ajustadas).
- Despliegue: únicamente mediante el script `decide_gguf.py` de Mapika sobre llama-cpp-python 0.3.36 y el paquete `decider-ai` 1.5.0. Para GPU NVIDIA hay que compilar llama-cpp-python con `CMAKE_ARGS="-DGGML_CUDA=on"`. No funciona como modelo de decisión en llama-server, Ollama ni LM Studio (lo cargan como modelo de texto genérico). Probado solo en Linux, con Python 3.12. Ten en cuenta que `pip install decider-ai` arrastra PyTorch (varios GB) aunque el script no lo usa para ejecutar el modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Acuerdo con BF16 (typed-decisions) | Licencia |
|---|---|---|---|---|
| turintech/decider-2b-Artemis-GGUF (Q4_K_M) | 1,88 B | GGUF | 93,65 % | Apache 2.0 |
| Mapika decider-2b Q4_K_M | 1,88 B | GGUF | 89,45 % | no disponible |
| Mapika/decider-2b (original) | 1,88 B | BF16 | 100 % (referencia) | no disponible |

No hay alternativas de otros fabricantes en la misma categoría (modelos de decisión tipados de ~2B) en la información disponible.

## Limitaciones y advertencias

- No es un modelo conversacional ni generador de texto: solo produce decisiones tipadas y únicamente a través de `decide_gguf.py`; intentar usarlo en Ollama, LM Studio o llama-server como modelo de texto dará resultados sin sentido para el caso de uso previsto.
- Discrepancia CPU/GPU: las compilaciones CPU y GPU dan probabilidades ligeramente distintas; en decisiones ajustadas (como el ejemplo de urgencia de la model card) pueden elegir opciones diferentes. Si despliegas en producción, fija la plataforma y calibra los umbrales sobre ella.
- La accuracy absoluta publicada (61,15 %) es moderada; el 93,65 % mide acuerdo con el original BF16, no calidad intrínseca. Evalúa el modelo en tu dominio antes de confiar en él.
- Resultados no verificados: las métricas provienen del propio autor (TurinTech) y están marcadas como no verificadas.
- Sesgos conocidos y riesgo de alucinación: no disponibles; al ser un clasificador con opciones cerradas, el riesgo de alucinación textual es bajo, pero puede asignar confianza alta a opciones incorrectas.
- Idiomas soportados: no disponible; probablemente optimizado para inglés (el dataset de evaluación y los ejemplos están en inglés), sin garantías para castellano.
- Entorno: probado solo en Linux; la instalación de la build CUDA requiere compilador C++, CMake y el toolkit de CUDA con `nvcc` en el PATH.
- Licencia: Apache 2.0, sin restricciones para uso comercial, aunque la licencia del modelo base Mapika/decider-2b no está especificada en la información disponible.

## Enlaces

- Modelo: https://huggingface.co/turintech/decider-2b-Artemis-GGUF
- Modelo base: https://huggingface.co/Mapika/decider-2b
- GGUF original y scripts (`decide_gguf.py`, `decider_config.json`): https://huggingface.co/Mapika/decider-2b-GGUF (revisión `0df001b8fe4e5298c5dd45d875d3795fcdaea0ab`)
- Resultados en la model card: https://huggingface.co/turintech/decider-2b-Artemis-GGUF#results
- Hilo de feedback de TurinTech: https://huggingface.co/spaces/turintech/README/discussions/1
- Web del autor: https://turintech.ai
- Dataset de evaluación: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
