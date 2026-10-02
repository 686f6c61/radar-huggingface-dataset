# tstepspam/Huihui-Qwen3.5-35B-A3B-Claude-4.6-Opus-abliterated-Q4

## Resumen

Este repositorio contiene una version cuantizada a 4 bits en formato MLX del modelo Huihui-Qwen3.5-35B-A3B-Claude-4.6-Opus-abliterated, publicado por el usuario tstepspam. Se trata, por tanto, de una derivacion de terceros y no de un modelo entrenado desde cero: el autor original de la cadena es huihui-ai, que a su vez parte de un modelo de razonamiento destilado a partir de Claude 4.6 Opus (Jackrong/Qwen3.5-35B-A3B-Claude-4.6-Opus-Reasoning-Distilled). El modelo hereda la nomenclatura "35B-A3B", que sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 35.000 millones de parametros totales y unos 3.000 millones activos por token, aunque el propio repositorio incluye la etiqueta contradictoria "Dense".

El dato real de parametros almacenados en los ficheros safetensors es de 34.660.608.768 (unos 34,66 mil millones), coherente con un modelo del orden de 35B. La innovacion principal de esta publicacion no es arquitectonica, sino de empaquetado y de alineacion: se ha eliminado la direccion de rechazo (abliterated/uncensored) y se ofrece una cuantizacion de 4 bits lista para ejecutarse en Apple Silicon mediante la libreria MLX. El repositorio ocupa 19,5 GB y la licencia declarada es Apache 2.0.

Su relevancia actual radica en dos factores: por un lado, permite ejecutar localmente en equipos Mac con memoria unificada un modelo con capacidades de razonamiento tipo cadena de pensamiento; por otro, al estar "abliterated", interesa a quienes investigan comportamientos de rechazo, seguridad de modelos y generacion sin filtros. No se dispone de informacion sobre idiomas soportados, contexto ni datos de entrenamiento mas alla de lo indicado en las etiquetas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE (etiqueta `qwen3_5_moe`), con etiqueta contradictoria `Dense` en la model card; no confirmado |
| Parametros totales | 34.660.608.768 (34,66B, dato de safetensors) |
| Parametros activos | no disponible (el nombre sugiere ~3B activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MLX); el repositorio solo publica esta variante Q4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con `license_link` apuntando a un fichero LICENSE de terceros) |
| Formato de pesos | safetensors (formato MLX, `library_name: mlx`) |

## Arquitectura y entrenamiento

La arquitectura declarada por las etiquetas del repositorio es `qwen3_5_moe`, es decir, un transformer de tipo mezcla de expertos (MoE) de la familia Qwen 3.5. Sin embargo, la model card incluye tambien la etiqueta `Dense` y el nombre del modelo indica "A3B", patron habitual en modelos MoE (total/activos). Esta contradiccion no se resuelve en la informacion disponible: los 34,66B de parametros almacenados son compatibles con ambas lecturas y no hay tarjeta tecnica que detalle numero de expertos, funcion de enrutamiento ni atencion. No se dispone de datos sobre numero de tokens de entrenamiento, composicion del dataset ni fases de RLHF o DPO.

En cuanto al proceso, hay dos transformaciones documentadas por la cadena de derivacion. La primera es la destilacion de razonamiento a partir de Claude 4.6 Opus (visible en el nombre del modelo base de Jackrong), que incorpora trazas de cadena de pensamiento (chain-of-thought). La segunda es el "abliterated": una tecnica de edicion de pesos que identifica y resta la direccion de activacion asociada al rechazo, reduciendo la tendencia del modelo a negarse a responder. Sobre ese resultado, tstepspam ha aplicado una cuantizacion a 4 bits en formato MLX. No se aportan detalles de hiperparametros, calibracion de cuantizacion ni evaluacion posterior.

## Capacidades

- Generacion de texto conversacional multi-turno (pipeline declarado: text-generation, conversational).
- Razonamiento explicito con cadenas de pensamiento (etiquetas `reasoning` y `chain-of-thought`).
- Comportamiento "uncensored" y "abliterated": menor probabilidad de rechazar peticiones que otros modelos alineados rechazarian.
- Ejecucion local en Apple Silicon mediante MLX.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (aunque el modo CoT es compatible con flujos de razonamiento encadenado).
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode formal): no disponible.

## Casos de uso

- Investigacion sobre alineacion y rechazo: comparar las respuestas de esta variante abliterated frente al modelo base para estudiar como se manifiesta la direccion de rechazo y que comportamientos se pierden al eliminarla.
- Red-teaming y evaluacion de seguridad: someter al modelo a baterias de prompts adversarios para medir la robustez de un sistema que lo use como backend, dado que su filtrado de rechazo esta reducido.
- Generacion creativa sin restricciones editoriales: escritura de ficcion, dialogos o guiones donde los filtros de contenido suelen bloquear borradores, aprovechando la supresion de la direccion de rechazo.
- Razonamiento asistido en local para macOS: usar el modelo en un Mac con memoria unificada para tareas de analisis paso a paso y matematicas basicas, sin depender de API en la nube.
- Prototipado de asistentes conversacionales: al ser un modelo conversacional de 4 bits y 19,5 GB, sirve para montar demos de chatbot local antes de pasar a despliegues mayores.
- Destilacion y generacion de datos sinteticos: producir trazas de cadena de pensamiento para entrenar modelos mas pequenos, reutilizando el material de razonamiento heredado de la destilacion original.
- Pruebas de cuantizacion: evaluar la degradacion de un modelo de ~35B al comprimirlo a 4 bits en MLX frente a su version sin cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio pesa 19,5 GB en cuantizacion de 4 bits; en inferencia conviene reservar entre 20 y 24 GB de memoria para pesos, cache KV y overhead.
- GPU compatibles: MLX esta disenado para Apple Silicon (series M1, M2, M3, M4 con memoria unificada de 24 GB o superior, preferiblemente 32 GB o mas). En GPU NVIDIA no es un formato nativo.
- Consumer GPU: en su formato actual MLX no se ejecuta en tarjetas NVIDIA; para hardware CUDA habria que convertir los pesos a otro formato (por ejemplo GGUF o safetensors de transformers), no disponible en este repositorio.
- Opciones de despliegue: MLX (mlx-lm) es la via directa; llama.cpp, Ollama, vLLM o TGI requeririan conversion previa de los pesos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tstepspam/Huihui-Qwen3.5-35B-A3B-Claude-4.6-Opus-abliterated-Q4 | 34,66B | no disponible | MLX 4-bit (safetensors) | Apache 2.0 | Repositorio actual, 0 descargas |
| huihui-ai/Huihui-Qwen3.5-35B-A3B-Claude-4.6-Opus-abliterated | no disponible | no disponible | no disponible | no disponible | Modelo base del que deriva este |
| Jackrong/Qwen3.5-35B-A3B-Claude-4.6-Opus-Reasoning-Distilled | no disponible | no disponible | no disponible | no disponible (LICENSE enlazada) | Origen del proceso de destilacion |

No se dispone de datos comparativos de rendimiento entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Al estar "abliterated" y "uncensored", el modelo tiene reducida su capacidad de rechazar peticiones daninas, ilegales o eticas; no es apto para despliegues publicos sin moderacion externa.
- La etiqueta de arquitectura es contradictoria (`qwen3_5_moe` frente a `Dense`), por lo que la naturaleza real del modelo no puede confirmarse con los datos disponibles.
- Riesgo de alucinacion: no se han publicado evaluaciones que cuantifiquen la fiabilidad factual; como cualquier modelo generativo, puede producir informacion falsa con apariencia de veracidad.
- Sesgos conocidos: no disponibles; la ausencia de evaluacion no implica ausencia de sesgos.
- Idiomas soportados: no disponibles, lo que impide garantizar cobertura multilingue.
- Limitaciones de contexto: no disponible la longitud de ventana, dato clave para dimensionar aplicaciones.
- Licencia: se declara Apache 2.0, pero el campo `license_link` apunta al fichero LICENSE del modelo de Jackrong; conviene verificar la cadena completa de licencias antes de uso comercial, dado que el repositorio es una derivacion de terceros.
- Confiabilidad del repositorio: creado y actualizado en la misma fecha (2026-10-02), con 0 descargas y 0 likes; no hay senales de validacion por parte de la comunidad.
- Requiere conversion de formato para funcionar fuera de MLX/Apple Silicon.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tstepspam/Huihui-Qwen3.5-35B-A3B-Claude-4.6-Opus-abliterated-Q4
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-35B-A3B-Claude-4.6-Opus-abliterated
- Licencia enlazada en la model card: https://huggingface.co/Jackrong/Qwen3.5-35B-A3B-Claude-4.6-Opus-Reasoning-Distilled/blob/main/LICENSE
- Modelo de razonamiento destilado de origen: https://huggingface.co/Jackrong/Qwen3.5-35B-A3B-Claude-4.6-Opus-Reasoning-Distilled
- Radar de modelos abliterated/uncensored: https://modelheretic.com/
