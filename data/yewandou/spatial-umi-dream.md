# Yewandou/spatial-umi-dream

## Resumen

Spatial-UMI-Dream es un modelo de acción-mundo (*world action model*) para robótica de manipulación, desarrollado por el usuario Yewandou y publicado en Hugging Face bajo licencia Apache-2.0. Se construye como un *fine-tuning* del modelo de vídeo Wan2.2-TI2V-5B de Wan-AI, un DiT causal de 5.600 millones de parámetros que, en lugar de limitarse a generar fotogramas RGB, predice conjuntamente fotogramas futuros de RGB, mapas de profundidad métrica y acciones del efector final. El modelo está pensado para el paradigma UMI (*Universal Manipulation Interface*), en el que un robot aprende políticas de manipulación a partir de demostraciones capturadas con empuñaduras instrumentadas.

El repositorio contiene dos conjuntos de pesos: un modelo preentrenado (`pretrain/`, solo los pesos del DiT) obtenido a partir de 605 horas de datos RGB-D UMI, y un *checkpoint* afinado (`robotwin-umi/checkpoint-10000/`) sobre las 20 tareas del conjunto RoboTwin-UMI, con 50 demostraciones limpias Aloha-AgileX por tarea y 10.000 pasos de entrenamiento. La innovación principal es que la profundidad métrica estéreo se alinea con el RGB ojo de pez nativo de cada pinza, y ambas pinzas comparten un único lienzo de vídeo RGB-D, de modo que el modelo de vídeo percibe geometría directamente en el espacio de píxeles.

El modelo es relevante para investigadores en aprendizaje por imitación y modelos de mundo aplicados a robótica, ya que unifica la predicción de dinámica visual y la generación de acciones en una sola arquitectura de difusión. Al estar disponible en safetensors en bf16 y con licencia permisiva, permite reproducir y extender el pipeline sin depender de pesos cerrados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT de vídeo causal (Wan2.2-TI2V-5B) con predicción conjunta de RGB, profundidad y acciones |
| Parámetros totales | 5,6 mil millones (solo DiT, bf16) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors.index.json` + shards), config.json, stats de normalización en `experiment_cfg/` |

Componentes auxiliares: codificador de texto umt5-xxl y codificador de imagen CLIP congelados (pesos oficiales de Wan-AI/Wan2.2-TI2V-5B y Wan2.1-I2V-14B-480P), además del VAE de Wan2.2, todos descargados automáticamente en el primer uso.

## Arquitectura y entrenamiento

El núcleo es un Diffusion Transformer (DiT) causal derivado de Wan2.2-TI2V-5B, condicionado por texto (umt5-xxl) e imagen (CLIP) y articulado sobre el VAE de Wan2.2. Sobre esa base, Spatial-UMI-Dream amplía la predicción para producir de forma conjunta fotogramas futuros de RGB, profundidad métrica y acciones del efector final, empleando un lienzo de vídeo RGB-D compartido por ambas pinzas. La profundidad estéreo se alinea con el RGB ojo de pez de cada empuñadura, lo que permite al modelo razonar sobre geometría en el espacio de píxeles en lugar de depender de representaciones de estado externas.

El modelo se preentrenó sobre 605 horas de datos RGB-D UMI y después se ajustó sobre RoboTwin-UMI, un conjunto de 20 tareas con 50 demostraciones Aloha-AgileX limpias por tarea, durante 10.000 pasos. No se documenta en la información disponible el uso de RLHF, DPO ni el número exacto de tokens de vídeo vistos durante el preentrenamiento. Las estadísticas de normalización y la configuración de entrenamiento necesarias para la inferencia se incluyen en `robotwin-umi/checkpoint-10000/experiment_cfg/`.

## Capacidades

- Predicción conjunta de fotogramas RGB futuros y mapas de profundidad métrica.
- Generación de acciones del efector final a partir de observaciones RGB-D y condicionamiento textual.
- Modelado de mundo con dinámica causal de vídeo para planificación y simulación de manipulación robótica.
- Soporte de condicionamiento por texto e imagen procedente de los codificadores congelados de Wan.
- Gestión de dos empuñaduras UMI sobre un lienzo de vídeo compartido, con alineación estéreo de profundidad.
- No dispone de tool calling, function calling ni capacidades documentadas de agentes multi-paso fuera del bucle robótico.
- No se documentan capacidades multilingües, de audio ni de visión general más allá del pipeline UMI.

## Casos de uso

- Aprendizaje por imitación en manipulación con UMI: se usa el checkpoint `pretrain/` como punto de partida para fine-tuning sobre nuevas tareas capturadas con empuñaduras instrumentadas, aprovechando las 605 horas de datos RGB-D previas como inicialización.
- Evaluación reproducible en RoboTwin-UMI: el checkpoint `checkpoint-10000/` permite reproducir las 20 tareas del benchmark con las 50 demostraciones por tarea, comparando políticas de manipulación bajo condiciones controladas.
- Planificación consciente de geometría: al predecir profundidad métrica junto al RGB, el modelo puede generar trayectorias que evitan colisiones en entornos con objetos cercanos, algo útil en tareas de ensamblaje o apilamiento.
- Modelo de mundo para simulación: las predicciones de vídeo RGB-D futuras permiten simular el resultado de acciones antes de ejecutarlas, reduciendo el coste de exploración en hardware real.
- Investigación en representaciones 3D: sirve como base para estudiar cómo un DiT de vídeo aprende geometría métrica a partir de datos estéreo ojo de pez alineados.
- Fine-tuning en nuevas plataformas bimanuales: el lienzo compartido de dos pinzas facilita adaptar el modelo a robots bimanuales tipo Aloha-AgileX con un coste de reentrenamiento moderado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entorno a 11-12 GB solo para los pesos del DiT en bf16 (5,6 mil millones de parámetros); sumando los codificadores congelados (umt5-xxl y CLIP) y el VAE de Wan2.2, el requisito realista se sitúa en el rango de 30-40 GB o más, dependiendo de la resolución y del número de fotogramas generados (estimación, no dato oficial).
- GPU recomendadas: A100 40/80 GB, H100 o H200 para inferencia sin cuantización; en el extremo inferior, una RTX 4090 de 24 GB puede no ser suficiente con todos los componentes cargados simultáneamente.
- Cabe en GPU de consumo solo con cuantización o descarga selectiva de componentes, no documentada en la información disponible.
- Opciones de despliegue: no se documenta soporte explícito de vLLM, llama.cpp, Ollama o TGI; el flujo previsto es descargar los checkpoints con `huggingface-cli` y ejecutar el repositorio de código `Yewandou7/spatial_umi_dream`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spatial-UMI-Dream | 5,6 B (DiT) | no disponible | World action model RGB-D + acciones | Apache-2.0 | Hugging Face + GitHub |
| Wan2.2-TI2V-5B | 5 B | no disponible | Generación de vídeo texto/imagen | Apache-2.0 | Hugging Face |
| Wan2.1-I2V-14B-480P | 14 B | no disponible | Generación de vídeo imagen a vídeo | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos dentro de la información proporcionada. Spatial-UMI-Dream se distingue de sus bases Wan por añadir el canal de profundidad y la cabeza de acciones, orientados a robótica en lugar de a generación de vídeo general.

## Limitaciones y advertencias

- El modelo está especializado en manipulación UMI y en las tareas de RoboTwin-UMI; su generalización fuera de ese dominio no está documentada.
- Solo se distribuyen los pesos del DiT; los codificadores de texto e imagen y el VAE deben descargarse aparte desde los repositorios oficiales de Wan, lo que añade dependencias externas y tamaño adicional.
- El checkpoint afinado se entrenó durante 10.000 pasos sobre 50 demostraciones por tarea, un volumen reducido que puede limitar la robustez ante variaciones de entorno.
- Riesgo de alucinación en la predicción de fotogramas y profundidad: errores de geometría pueden propagarse a las acciones generadas.
- No se documentan sesgos demográficos ni culturales, pero el modelo no procesa lenguaje de forma directa más allá del condicionamiento de texto de Wan.
- Licencia Apache-2.0 permisiva para uso comercial, condicionada a mantener los avisos de atribución de Wan-AI.
- No hay información sobre cuantizaciones oficiales, latencia en producción ni soporte de herramientas de despliegue estándar, lo que exige trabajo de integración adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yewandou/spatial-umi-dream
- Repositorio de código: https://github.com/Yewandou7/spatial_umi_dream
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Codificador de imagen y pesos auxiliares Wan2.1: https://huggingface.co/Wan-AI/Wan2.1-I2V-14B-480P
