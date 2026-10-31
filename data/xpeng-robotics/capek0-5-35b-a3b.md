# xpeng-robotics/Capek0.5-35B-A3B

## Resumen

Capek 0.5 (Capek0.5-35B-A3B) es un modelo vision-language centrado en la ejecución (execution-centric) desarrollado por XPENG Robotics para tareas de inteligencia encarnada (embodied intelligence). A partir de la arquitectura MoE de Qwen3.6-35B-A3B, el modelo integra en un único punto de control cuatro capacidades recurrentes en el ciclo observación-razonamiento-acción: razonamiento espacial, comprensión temporal, guía de acciones y verificación de estado. Su relevancia radica en que aborda un problema habitual en robótica: los modelos VLM generales rinden bien en descripción de escenas pero fallan en las tareas concretas que un robot necesita para ejecutar un plan.

Técnicamente, se trata de un modelo de 35.107 millones de parámetros totales (dato real de safetensors) con aproximadamente 3B de parámetros activos por token, siguiendo la arquitectura MoE de Qwen3.6. Acepta texto, imágenes y vídeo, y genera texto, incluidas predicciones estructuradas (puntos objetivo, regiones de affordance, trayectorias en espacio de imagen). El entrenamiento combina aprendizaje por refuerzo con recompensas verificables, fusión de pesos TIES y destilación on-policy multi-profesor enrutada (MOPD).

Se distribuye bajo licencia Apache 2.0 (con atribución a la licencia upstream de Qwen/Alibaba Cloud), en formato safetensors compatible con la librería Transformers. Es un modelo reciente y de nicho: en el momento de redactar la ficha acumula solo 44 descargas y 3 likes, por lo que la comunidad aún no ha producido cuantizaciones ni despliegues de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5MoeForConditionalGeneration` (`qwen3_5_moe`), VLM multimodal |
| Parametros totales | 35.107.181.936 (~35B) |
| Parametros activos | ~3B por token (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos originales en BF16/FP16 presumiblemente; sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con LICENSE-Qwen3.6 upstream, Copyright 2026 Alibaba Cloud) |
| Formato de pesos | safetensors (repo de 70,2 GB) |

## Arquitectura y entrenamiento

Capek0.5-35B-A3B es un fine-tune post-entrenamiento de Qwen3.6-35B-A3B, un modelo mixture-of-experts de 35B parámetros totales con ~3B activos por token, lo que permite inferencia con coste computacional similar a un modelo denso de 3B manteniendo la capacidad de un modelo mucho mayor. La arquitectura es multimodal (`image-text-to-text`) y procesa texto, imágenes y vídeo mediante un procesador multimodal y una plantilla de chat incluidos en el repositorio.

El entrenamiento sigue un esquema de especialización y consolidación en tres fases. Primero, cada una de las cuatro capacidades (razonamiento espacial, comprensión temporal, guía de acciones y verificación de estado) se aprende mediante un modelo especialista dedicado entrenado con aprendizaje por refuerzo con recompensas verificables (RLVR), partiendo del mismo backbone. Después, la fusión de pesos TIES (TIES weight merging) combina los especialistas para inicializar un modelo estudiante unificado. Finalmente, este estudiante se refina mediante destilación on-policy multi-profesor enrutada (routed multi-teacher on-policy distillation, MOPD). El enrutamiento entre especialistas se usa solo durante el entrenamiento: la inferencia se ejecuta sobre un único punto de control consolidado, sin overhead adicional. Los detalles sobre el número de tokens de entrenamiento y la composición exacta del dataset no están disponibles en la model card; el paper (arXiv:2608.06756) describe un inventario de datos agrupado por las cuatro capacidades.

## Capacidades

- Razonamiento espacial: geometría, posiciones relativas entre objetos y cambios de punto de vista.
- Comprensión temporal sobre vídeo: orden de eventos, cambios en la escena y localización temporal.
- Guía de acciones: predicción de puntos objetivo, regiones de affordance y trayectorias ordenadas en espacio de imagen (salidas estructuradas cuando el prompt lo solicita).
- Verificación de estado: evaluación de predicados físicos y comprobación de finalización de tareas.
- Entradas multimodales: texto, imágenes y vídeo mediante el procesador multimodal y la plantilla de chat proporcionados.
- Generación de texto conversacional, heredada del modelo base Qwen3.6-35B-A3B.
- No hay información disponible sobre soporte de tool calling / function calling.
- No hay información disponible sobre soporte explícito de agentes o multi-step reasoning como característica nativa.

## Casos de uso

- Verificación de finalización de tareas robóticas: el modelo puede evaluar predicados físicos sobre imágenes o vídeo del entorno (por ejemplo, "la puerta está cerrada" o "el objeto está sobre la mesa"), útil como comprobador de éxito en bucles de control de robots domésticos.
- Localización de puntos de agarre y affordances: dado un frame de cámara, genera puntos objetivo y regiones de affordance que un planificador de movimiento de bajo nivel puede consumir como entrada para el control de manipulación.
- Comprensión temporal de vídeo para robots móviles: analiza el orden de eventos y cambios en la escena en secuencias de vídeo, adecuado para navegar en entornos dinámicos o detectar si una acción previa tuvo el efecto esperado.
- Razonamiento espacial con cambios de viewpoint: responde preguntas sobre geometría y posiciones relativas desde distintos ángulos de cámara, útil en sistemas multi-cámara o al fusionar observaciones de distintos sensores.
- Generación de trayectorias en espacio de imagen: produce trayectorias ordenadas sobre la imagen que pueden convertirse en comandos de control, por ejemplo para tareas de seguimiento o inserción guiadas visualmente.
- Evaluación de políticas de robótica en simulación y en real: gracias a sus puntuaciones en EmbodiedBench (EB-HAB 63,0 % de éxito en tareas), puede usarse como evaluador automático de agentes encarnados en benchmarks y pipelines de test.
- Asistente multimodal para depuración de sistemas robóticos: permite interrogar en lenguaje natural sobre vídeos de ejecuciones fallidas para identificar en qué paso del plan se produjo el error.

## Benchmarks y rendimiento

Bajo el protocolo de evaluación del paper, Capek0.5-35B-A3B mejora 28 de 34 filas de benchmark respecto a su inicialización Qwen3.6-35B-A3B. Resultados seleccionados (formato Qwen3.6 → Capek 0.5):

| Benchmark | Qwen3.6-35B-A3B | Capek0.5-35B-A3B |
|---|---|---|
| VSI-Bench | 60,83 | 70,69 |
| Video-MME | 71,33 | 74,19 |
| PointBench | 76,66 | 81,22 |
| StateBench-P | 65,80 | 76,80 |
| EmbodiedBench EB-HAB (éxito de tarea) | 46,0 % | 63,0 % |
| EmbodiedBench EB-ALF (éxito de tarea) | 50,7 % | 55,3 % |

No se han publicado en la información disponible comparaciones directas numéricas con otros modelos de la categoría (por ejemplo, otros VLM encarnados) ni resultados en benchmarks generales como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Con pesos de 35B en precisión completa (repo de 70,2 GB, consistente con BF16), se requieren del orden de 70-80 GB de VRAM en FP16/BF16; con ~3B de parámetros activos por token, el cómputo por token es reducido pero los pesos completos deben residir en memoria (o en CPU con offloading).
- GPU recomendadas: no disponible oficialmente. Para precisión completa, del orden de una H100 80GB, dos A100 80GB o equivalentes; no se han publicado cuantizaciones que permitan consumer GPUs.
- Consumer GPUs: no cabe en una única GPU de consumo en precisión completa (70,2 GB de pesos). Con futuras cuantizaciones GGUF/AWQ de la comunidad (no disponibles en el momento de redactar) podría ser viable en configuraciones multi-GPU de gama alta (por ejemplo, 2x RTX 3090/4090), pero esto es una estimación, no un dato publicado.
- Opciones de despliegue: librería Transformers (formato nativo, `endpoints_compatible`). No hay información disponible sobre soporte verificado en vLLM, TGI, llama.cpp u Ollama; la arquitectura `qwen3_5_moe` requeriría soporte específico en cada runtime.
- Latencia y throughput: no disponibles. Al ser MoE con ~3B activos por token, cabe esperar latencias comparables a un modelo denso de 3B una vez cargados los pesos, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Modalidad | Licencia | Enfoque |
|---|---|---|---|---|---|
| Capek0.5-35B-A3B | ~35B | ~3B | Texto, imagen, vídeo | Apache 2.0 | Inteligencia encarnada (espacial, temporal, acción, estado) |
| Qwen3.6-35B-A3B (base) | ~35B | ~3B | Texto, imagen, vídeo | Licencia Qwen (Alibaba Cloud) | VLM general |
| Qwen2.5-VL-32B | 32B (denso) | 32B | Texto, imagen, vídeo | Apache 2.0 | VLM general con grounding |

Capek 0.5 comparte familia arquitectónica con Qwen3.6-35B-A3B (del que deriva) y mejora sus capacidades encarnadas según el protocolo del paper, a costa de estar especializado. Frente a alternativas densas como Qwen2.5-VL-32B, ofrece un coste de cómputo por token mucho menor (~3B activos) y capacidades específicas de robótica (trayectorias, predicados de estado) que los VLM generales no incorporan de serie. No hay datos de comparación directa publicados entre Capek 0.5 y Qwen2.5-VL-32B.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. Al derivar de Qwen3.6, hereda presumiblemente los sesgos del modelo base, pero no hay auditorías publicadas.
- Riesgo de alucinación: no cuantificado en la información disponible. En tareas de verificación de estado, una alucinación puede traducirse en una confirmación errónea de finalización de tarea, algo crítico si se usa en bucles de control reales.
- Longitud de contexto: no publicada en la model card; consultar el paper o la configuración del repositorio antes de diseñar pipelines con vídeo largo.
- Idiomas soportados: no especificados; la plantilla de chat y el entrenamiento sugieren origen en la familia Qwen (típicamente inglés y chino), pero no es un dato confirmado.
- Licencia: Apache 2.0 para las contribuciones de Capek 0.5, pero es un derivado modificado de Qwen3.6; al redistribuir hay que preservar los textos de licencia, la atribución y los avisos de modificación, incluido el Copyright 2026 Alibaba Cloud de la licencia upstream. Uso comercial permitido en principio bajo Apache 2.0, sujeto a los términos upstream.
- Estado del ecosistema: modelo muy reciente y con adopción mínima (44 descargas), sin cuantizaciones, sin soporte verificado en runtimes de inferencia optimizados y con una arquitectura (`qwen3_5_moe`) que puede no estar soportada todavía en versiones estables de vLLM u otras herramientas.
- Para uso en producción robótica, la propia naturaleza del modelo (predicciones en espacio de imagen, verificación de estado) exige validación rigurosa en el entorno concreto antes de conectarlo a actuadores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xpeng-robotics/Capek0.5-35B-A3B
- Paper (arXiv): https://arxiv.org/abs/2608.06756
- Página del proyecto: https://xpeng-robotics.github.io/capek-0.5/
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia Apache 2.0 del modelo: https://huggingface.co/xpeng-robotics/Capek0.5-35B-A3B/blob/main/LICENSE
