# yrrats/ttt-vla-robomme-persistent-nmt-t4-optimized-r2-step13000

## Resumen

Este repositorio contiene un checkpoint intermedio (paso 13.000 del optimizador) de un experimento de test-time training (TTT) persistente sobre el modelo vision-language-action (VLA) GR00T N1.6, desarrollado por el usuario yrrats a partir de la familia nvidia/GR00T-N1.6-3B con el backbone de visión-lenguaje Eagle-Block2A-2B-v2. El modelo hereda la estructura VLA de GR00T (backbone de percepción y lenguaje más una cabeza de difusión para generar acciones) y le añade una rama de memoria de atención por moment-tokens (HAMLET) con pesos rápidos recurrentes que se actualizan en tiempo de inferencia dentro de cada episodio. El entrenamiento se ha realizado sobre los datos locales del benchmark RoboMME, un conjunto estandarizado de 16 tareas de manipulación diseñadas para evaluar memoria temporal, espacial, de objeto y procedimental.

El problema que aborda es la vulnerabilidad de las políticas VLA ante cambios de distribución en el momento del despliegue y su dificultad para mantener información relevante a lo largo de episodios largos. La propuesta es un mecanismo de memoria persistente que se adapta en inferencia mediante un objetivo interno de predicción del siguiente moment-token (NMT), con un horizonte T=4 y un único fast layer, lo que permite al modelo retener información del episodio sin reentrenar los pesos principales.

Es relevante ahora porque se publica como artefacto de reproducibilidad para la investigación en TTT aplicado a robótica, en un contexto donde los benchmarks de manipulación de horizonte largo (como RoboMME) están empezando a medir explícitamente capacidades de memoria. Con 3.432.385.472 parámetros totales (3,43 mil millones) y un tamaño de repositorio de 6,9 GB, es un modelo manejable en hardware de gama alta de consumo para inferencia, aunque su licencia es "other" y su uso está pensado para evaluación, no como checkpoint final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en GR00T N1.6: backbone de visión-lenguaje Eagle-Block2A-2B-v2 más cabeza de difusión para acciones; memoria TTT con rama de atención HAMLET |
| Parametros totales | 3.432.385.472 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (memoria episódica con ventana de 4 y stride de 16, horizonte TTT T=4) |
| Tipos de cuantizacion | no disponible (el repositorio distribuye pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (shards), dtype bfloat16 |

## Arquitectura y entrenamiento

El modelo parte de GR00T N1.6, una arquitectura VLA que combina un backbone de visión-lenguaje (aquí Eagle-Block2A-2B-v2) con una cabeza de acción generativa por difusión. La salida de acciones se produce en chunks de horizonte 16 con 4 pasos de inferencia de difusión. Sobre esta base, el experimento incorpora memoria persistente dentro del episodio mediante TTT con una rama de atención de moment-tokens denominada HAMLET, ventana de memoria de 4 y stride de 16. Los pesos rápidos se actualizan online con un objetivo de predicción del siguiente moment-token (NMT), horizonte de secuencia T=4, mini-batch interno de 1, tasa de aprendizaje interna de 0,1 (aprendible) y recorte de gradiente interno de 1,0. Se emplea un único fast layer con inicialización de puerta residual en 0,001, un valor deliberadamente bajo para estabilizar la contribución de la memoria al principio del entrenamiento.

El entrenamiento del experimento (nuri_nmt_seq_t4_episode_persistent_2gpu_batch16_opt_r2) se ejecutó con batch global de 32 (16 por GPU en 2 GPU), semilla de dataset 42 y precisión bfloat16, sobre los datos locales de entrenamiento de RoboMME. Este checkpoint corresponde al paso 13.000 del optimizador y el autor indica explícitamente que no se trata del checkpoint final ni del mejor. El repositorio incluye shards del modelo, ficheros de processor y estadísticas, configuración del experimento y metadatos del trainer; se excluyeron deliberadamente los estados del optimizador de DeepSpeed, los estados de RNG y los ficheros necesarios únicamente para reanudar el entrenamiento, por lo que el artefacto está pensado para inferencia y evaluación, no para reanudar el optimizador de forma exacta.

## Capacidades

- Control robótico de manipulación: genera secuencias de acciones (action chunks de horizonte 16) condicionadas por observaciones visuales e instrucciones en lenguaje natural.
- Memoria episódica persistente: mantiene y actualiza pesos rápidos dentro de un episodio, lo que permite aprovechar información de interacciones previas en tareas de horizonte largo.
- Memoria dependiente del historial: diseñado para escenarios donde la decisión actual depende de eventos pasados (memoria temporal, espacial, de objeto y procedimental según la taxonomía de RoboMME).
- Generación de acciones por difusión: 4 pasos de difusión por chunk de acción.
- Adaptación en tiempo de test (TTT): ajuste interno con objetivo NMT durante la inferencia, sin modificar los pesos base.
- Condicionamiento por lenguaje: acepta instrucciones textuales como parte de la entrada del modelo.
- Tool calling / function calling: no disponible (no es una capacidad documentada para este modelo).
- Soporte de agentes y razonamiento multi-paso en texto: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales: modo de memoria persistente activable por episodio, rama de atención HAMLET y fast weights recurrentes.

## Casos de uso

- Manipulación robótica de horizonte largo con dependencia del historial: el modelo puede ejecutar secuencias de acciones donde el estado relevante se ha observado varios pasos atrás, gracias a la ventana de memoria de 4 con stride de 16 y a los pesos rápidos persistentes por episodio.
- Evaluación reproducible de test-time training: el checkpoint está archivado precisamente para comparar variantes de TTT (persistente frente a no persistente, distintos valores de T) bajo la misma base GR00T N1.6 y los mismos datos RoboMME.
- Estudios de ablación de hiperparámetros de memoria: permite analizar el efecto de la tasa de aprendizaje interna, el recorte de gradiente interno, el número de fast layers y la inicialización de la puerta residual sobre el comportamiento de la política.
- Investigación en benchmarks de memoria para VLA: útil para reproducir experimentos sobre las 16 tareas de RoboMME y comparar políticas con y sin mecanismos de memoria explícitos.
- Base para fine-tuning de políticas con memoria: el checkpoint puede servir como punto de partida para ajustar políticas específicas de una tarea o de un entorno concreto que requiera retención de contexto episódico.
- Integración en pipelines de evaluación con el codebase Isaac-GR00T: al conservar processor, estadísticas y configuración del experimento, puede cargarse con la pila estándar de transformers y evaluarse con el código fuente del proyecto.
- Prototipado en simulación antes de transferir a un brazo real: con ~3,43 mil millones de parámetros en bfloat16, el modelo cabe en GPU de gama alta de consumo, lo que facilita iteraciones rápidas en laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que este checkpoint no debe interpretarse como una tasa de éxito reportada en RoboMME y que la evaluación de rollouts debe hacerse con el codebase original y los artefactos de evaluación correspondientes.

| Benchmark | Resultado |
|---|---|
| RoboMME (16 tareas de manipulación) | no disponible |
| MMLU / HumanEval / GSM8K | no aplica (modelo VLA de robótica) |

## Requisitos de hardware

- VRAM estimada para pesos en bfloat16: aproximadamente 6,9 GB (3.432.385.472 parámetros x 2 bytes), coherente con el tamaño del repositorio.
- VRAM estimada para inferencia completa: por encima de 8 GB solo para pesos; con activaciones, buffers de atención y la cabeza de difusión conviene disponer de 12-16 GB para trabajar con margen.
- GPU recomendadas para inferencia: RTX 4090 (24 GB), RTX 4080 (16 GB), A100 (40/80 GB), H100 (80 GB); en GPUs de 12 GB (por ejemplo RTX 3060 12 GB) el despliegue es ajustado y puede requerir reducción de batch o del horizonte de memoria.
- Cabe en GPU de consumo: sí, en modelos con 16 GB o más de VRAM en bfloat16; en 12 GB solo con configuraciones reducidas.
- GPU recomendadas para entrenamiento o TTT: el experimento original usó 2 GPU con 16 de batch por GPU (batch global 32); para reproducirlo se recomiendan GPUs con 24 GB o más (A100, H100, L40S, RTX 4090).
- Opciones de despliegue: transformers (librería declarada en el repositorio) y el codebase de GR00T / proyecto ttt-vla; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, y no se distribuyen pesos en GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Memoria / contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yrrats/ttt-vla-robomme-persistent-nmt-t4-optimized-r2-step13000 | 3.432.385.472 | TTT persistente, ventana 4, stride 16, T=4 | VLA de manipulacion (RoboMME) | other | HuggingFace, 0 descargas |
| nvidia/GR00T-N1.6-3B | no disponible (el nombre sugiere ~3B) | no disponible (sin memoria TTT persistente) | VLA generalista | no disponible en la informacion proporcionada | HuggingFace |
| morealcholplz/ttt-vla-robomme-ttt-nmt-t4 | no disponible | TTT persistente + HAMLET, NMT T=4 | VLA de manipulacion (RoboMME) | no disponible en la informacion proporcionada | HuggingFace |
| TTT-VLA (latent prompt optimization) | no disponible | prompt latente aprendido, TTT solo de prompt sobre politica congelada | VLA bajo cambios de distribucion | no disponible | Paper arXiv |

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 13.000) de un experimento de investigación; el autor advierte que no es el checkpoint final ni el de mejor rendimiento.
- No debe interpretarse como una tasa de éxito en RoboMME: la evaluación válida requiere ejecutar rollouts con el codebase original.
- No permite reanudar el entrenamiento de forma exacta: faltan los estados del optimizador de DeepSpeed, los estados de RNG y los ficheros de reinicio.
- Riesgo de sobreajuste al conjunto de datos local de RoboMME y de degradación ante cambios de distribución en el despliegue, que es precisamente el problema que el mecanismo de TTT intenta mitigar.
- Los pesos rápidos se actualizan en inferencia con una tasa de aprendizaje interna de 0,1; una secuencia de actualizaciones desfavorable puede provocar deriva de la política dentro del episodio.
- Licencia "other": los términos aplicables remiten al modelo base, al dataset y a la implementación fuente; es imprescindible revisar las condiciones de uso comercial antes de cualquier despliegue en producción.
- Idiomas soportados y comportamiento multilingüe: no disponibles.
- Ausencia de validación comunitaria: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia externa de reproducibilidad.
- Capacidades de tool calling, agentes y razonamiento textual multi-paso: no documentadas; no conviene asumirlas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yrrats/ttt-vla-robomme-persistent-nmt-t4-optimized-r2-step13000
- Proyecto fuente (ttt-vla): https://github.com/Star-ry/ttt-vla
- Benchmark RoboMME: https://robomme.github.io/index.html
- Paper TTT-VLA (Test-Time Latent Prompt Optimization for Vision-Language-Action): https://arxiv.org/abs/2606.03127
- Versión HTML del paper TTT-VLA: https://arxiv.org/html/2606.03127v1
- Checkpoint relacionado (morealcholplz/ttt-vla-robomme-ttt-nmt-t4): https://huggingface.co/morealcholplz/ttt-vla-robomme-ttt-nmt-t4
- Colección RoboMME en HuggingFace: https://huggingface.co/collections/Yinpei/robomme
