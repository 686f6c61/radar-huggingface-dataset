# wanna0720/qwen38-27b-swerebench-grpo-step8

## Resumen

El modelo `wanna0720/qwen38-27b-swerebench-grpo-step8` es un ajuste fino de parámetros completos mediante GRPO (Group Relative Policy Optimization) sobre el modelo multimodal `Qwen/Qwen3.8-27B` de Alibaba. Lo publica el usuario `wanna0720` como exportación en `safetensors` del checkpoint correspondiente al paso 8 de un entrenamiento orientado a tareas de ingeniería de software. No es un modelo nuevo desde cero, sino un checkpoint de investigación derivado de un modelo base denso de 27.000 millones de parámetros.

El entrenamiento se realizó sobre 1.586 tareas del corpus SWE-rebench v2 Filtered, con rollouts independientes generados por el agente `mini-swe-agent`. Se utilizaron ocho GPU NVIDIA B300 con paralelismo de tensor TP=2 y paralelismo de contexto CP=4, 32 grupos de prompts con ocho rollouts cada uno por paso de optimizador, tamaño de lote global 256 y tasa de aprendizaje 2e-6. El autor lo describe explícitamente como la línea base de GRPO sin ramificación (*no-branch*), no como un checkpoint de política ramificada.

Su relevancia es doble: por un lado, sirve como referencia reproducible de un pipeline de RL a gran escala sobre tareas de software reales; por otro, documenta el proceso de conversión desde un checkpoint distribuido Miles/Megatron a pesos `safetensors` consumibles con `transformers`. El repositorio ocupa 26,9 GB y, en el momento de la consulta, acumulaba 0 descargas y 1 like, por lo que carece de validación comunitaria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (pipeline `image-text-to-text`), derivado de Qwen3.8-27B; los tensores de lenguaje se convierten desde un checkpoint Miles/Megatron |
| Parametros totales | 27B (aproximado, segun el identificador del modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible para este checkpoint; el modelo base Qwen3.8-27B se sirve con ventanas de 150k a 262k tokens segun HyperQwen |
| Tipos de cuantizacion | No disponible (el repositorio contiene pesos en `safetensors`) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 (se incluye la licencia original de Qwen3.8-27B en el repositorio) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 26,9 GB |
| Descargas / likes | 0 / 1 |
| Fecha de creacion | 2026-10-04 |
| Ultima actualizacion | 2026-10-05 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de `Qwen/Qwen3.8-27B`: un transformer denso y nativo multimodal (texto e imagen) publicado por el equipo Qwen de Alibaba. Este checkpoint concreto no modifica esa arquitectura, sino que recibe un ajuste fino completo de todos los parámetros del modelo de lenguaje. Los tensores visuales y de MTP (*multi-token prediction*), el tokenizador, la configuración y los assets de procesado provienen del modelo base en la revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`, es decir, no fueron sometidos al entrenamiento GRPO descrito.

El entrenamiento consistió en GRPO sobre 1.586 tareas de SWE-rebench v2 Filtered, con rollouts independientes ejecutados por `mini-swe-agent`. La configuración declarada incluye ocho GPU NVIDIA B300 con TP=2 y CP=4, 32 grupos de prompts con ocho rollouts por grupo en cada paso de optimizador, tamaño de lote global de 256 y tasa de aprendizaje 2e-6. El autor identifica este checkpoint como la línea base sin ramificación, y publica además el marcador de finalización del entrenamiento con hash SHA-256 `006843311874c1a6fb467aaedee05ad84919eb6a82ef0613e8fd287b6ceffe18`. No se detalla la composición del dataset más allá del nombre del corpus, ni si hubo fases previas de SFT, DPO o RLHF adicionales.

## Capacidades

- Generación de código orientada a resolución de incidencias reales, entrenada específicamente sobre tareas de SWE-rebench v2 Filtered.
- Ejecución de flujos agénticos de varios pasos: los rollouts se generaron con `mini-swe-agent`, lo que implica interacción con entornos de línea de comandos.
- Razonamiento multi-paso aplicado a reparación y modificación de bases de código.
- Procesamiento multimodal de entrada imagen-texto, heredado del modelo base (la etiqueta de pipeline es `image-text-to-text`).
- Capacidades de automatización de oficina y flujos agénticos, según la descripción oficial del repositorio de Qwen3.8-27B.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en las etiquetas del repositorio).
- No se dispone de información sobre soporte explícito de *tool calling* estructurado, modo de razonamiento diferenciado, audio o lista de idiomas para este checkpoint concreto.

## Casos de uso

- Resolución automática de incidencias de GitHub: el ajuste GRPO sobre tareas tipo SWE-rebench está diseñado para que el modelo lea un *issue*, localice los ficheros relevantes y genere un parche funcional, con la ventaja de haber sido optimizado con recompensas sobre ese mismo tipo de tarea.
- Agente de reparación en pipelines de CI/CD: puede integrarse como paso automático que recibe un fallo de test y propone una corrección, aprovechando el formato de interacción por comandos de `mini-swe-agent`.
- Generación de pruebas unitarias y parches de regresión: dado un fragmento de código o una traza de error, el modelo puede redactar tests que reproduzcan el fallo antes de corregirlo.
- Refactorización asistida con contexto visual: gracias a la componente multimodal heredada, puede procesar diagramas de arquitectura, capturas de interfaces o esquemas junto al código fuente.
- Automatización de tareas de oficina con documentos mixtos: el modelo base está descrito como apto para automatización de oficina, por lo que este checkpoint puede emplearse en extracción y transformación de contenido con imágenes.
- Investigación en aprendizaje por refuerzo: sirve como punto de partida para experimentos de recuperación, comparación de políticas sin ramificación frente a políticas ramificadas o continuación del entrenamiento a partir del estado distribuido publicado en el repositorio complementario.
- Evaluación comparativa de métodos de RL para código: al ser un paso intermedio (paso 8) con configuración documentada, permite medir el efecto de distintas recetas de GRPO en tareas de ingeniería de software.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este checkpoint en la información disponible. Los datos encontrados en la búsqueda web corresponden al modelo base `Qwen/Qwen3.8-27B`, no al ajuste GRPO, y se recogen aquí únicamente como referencia del punto de partida:

| Benchmark | Qwen3.8-27B (modelo base) | Este checkpoint |
|---|---|---|
| Artificial Analysis Intelligence Index (esfuerzo maximo de razonamiento) | 52 | No disponible |
| SWE-bench Pro | 61.7 (evaluacion propia de Qwen) | No disponible |
| Humanity's Last Exam | Por debajo de los modelos frontera, sin cifra publicada en la fuente | No disponible |
| GPQA Diamond | Por debajo de los modelos frontera, sin cifra publicada en la fuente | No disponible |
| MathVision | Evaluado con el prompt fijo "Please reason step by step, and put your final answer within \boxed{}"; sin cifra publicada en la fuente | No disponible |

## Requisitos de hardware

- Tamano del repositorio: 26,9 GB, lo que sugiere pesos almacenados en un formato de precisión reducida o comprimido; el dato exacto de precisión no está declarado.
- VRAM estimada para inferencia en bf16 (estimación para un modelo denso de 27B): en torno a 54 GB solo para pesos, más caché KV.
- VRAM estimada en cuantización de 8 bits: aproximadamente 27-30 GB.
- VRAM estimada en cuantización de 4 bits: aproximadamente 15-16 GB.
- GPU de entrenamiento utilizadas: ocho NVIDIA B300 con TP=2 y CP=4, configuración fuera del alcance de hardware de consumo.
- GPU recomendadas para servicio en precisión completa: A100 80 GB, H100 80 GB o B300.
- Viabilidad en GPU de consumo: según HyperQwen, el modelo base Qwen3.8-27B puede servirse en una tarjeta única de 24 GB con parches de vLLM y un pipeline de recuantización; ese dato corresponde al modelo base y no está verificado para este checkpoint.
- Opciones de despliegue: `transformers` (librería declarada) y vLLM según los informes sobre el modelo base. No hay confirmación de soporte mediante llama.cpp, Ollama, TGI ni GGUF para este repositorio.
- Latencia y throughput del modelo base reportados por HyperQwen: 127 tok/s en un solo usuario (381 tok/s cuando la respuesta cita el prompt) y aproximadamente 1.035 tok/s con 64 peticiones concurrentes en una tarjeta de 24 GB, con ventanas de contexto de 150k a 262k tokens. No hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| wanna0720/qwen38-27b-swerebench-grpo-step8 | 27B (denso) | No disponible | apache-2.0 | HuggingFace, 0 descargas, 1 like | Checkpoint GRPO paso 8, línea base sin ramificación |
| Qwen/Qwen3.8-27B | 27B (denso multimodal) | 150k-262k tokens segun HyperQwen | Licencia original de Qwen3.8-27B incluida en el repositorio | HuggingFace | Modelo base sobre el que se aplica el GRPO |
| wanna0720/qwen38-27b-swerebench-grpo-step8-training-state | 27B | No disponible | No disponible | HuggingFace | Checkpoint Miles/Megatron con estado del modelo y del optimizador, destinado a recuperación e investigación |
| Otros modelos abiertos de codigo de tamano similar | No disponible | No disponible | No disponible | No disponible | No se han proporcionado datos comparativos |

## Limitaciones y advertencias

- Se trata de un checkpoint intermedio de investigación (paso 8 de un entrenamiento GRPO), no de un modelo final validado ni de una versión pulida para producción.
- No se han publicado benchmarks específicos del checkpoint, por lo que se desconoce si mejora o degrada el rendimiento del modelo base en tareas generales.
- Con 1.586 tareas de entrenamiento procedentes de un único corpus (SWE-rebench v2 Filtered), existe riesgo de sobreajuste al formato y la distribución de ese conjunto, con posible pérdida de generalidad en otros dominios.
- No hay información sobre sesgos conocidos, comportamiento multilingüe ni composición demográfica del dataset.
- Riesgo de alucinación inherente a la generación de código: parches sintácticamente válidos pero semánticamente incorrectos, o referencias a APIs y ficheros inexistentes.
- Los tensores visuales y de MTP no fueron entrenados en este proceso, por lo que las capacidades multimodales corresponden al modelo base sin ajuste específico.
- El repositorio acumulaba 0 descargas y 1 like, sin evidencia de validación independiente por parte de la comunidad.
- La licencia declarada es apache-2.0, pero el propio autor indica que el repositorio incluye la licencia original de Qwen3.8-27B; conviene revisar ambos textos antes de un uso comercial.
- El despliegue requiere infraestructura considerable: 26,9 GB de pesos y, en precisión completa, en torno a 54 GB de VRAM.
- No se especifican los idiomas soportados, por lo que no puede garantizarse un rendimiento adecuado en castellano.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wanna0720/qwen38-27b-swerebench-grpo-step8
- Checkpoint de estado de entrenamiento: https://huggingface.co/wanna0720/qwen38-27b-swerebench-grpo-step8-training-state
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- HyperQwen (servicio de modelos Qwen en GPU de 24 GB): https://github.com/syv-ai/HyperQwen
- Analisis de benchmarks de Qwen3.8-27B: https://qubrid.com/blog/qwen38-27b-benchmarks-official-and-independent-results
