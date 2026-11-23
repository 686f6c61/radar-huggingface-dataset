# vvsotnikov/Qwen3.5-4B-Junie-AsyncGRPO-poc3-step40

## Resumen
Qwen3.5-4B-Junie-AsyncGRPO-poc3-step40 es un checkpoint intermedio de investigación publicado por el usuario vvsotnikov sobre el modelo base Qwen/Qwen3.5-4B. Se trata del resultado de 40 pasos de optimizador (de 300 planificados) de un entrenamiento con GRPO asíncrono en el que el modelo actúa como política del agente de programación Junie CLI, entrenado sobre una mezcla de tareas de ingeniería de software, terminal, análisis de datos y pequeñas tareas de software. El modelo conserva la arquitectura multimodal image-text-to-text del base y añade un adaptador LoRA fusionado en los pesos.

El interés de esta ficha es fundamentalmente metodológico: documenta un pipeline de RL agéntico asíncrono con verificación de recompensa, sandbox de ejecución y gestión de historiales de razonamiento. No es un modelo listo para producción: el propio autor advierte que es un checkpoint intermedio de un entrenamiento en curso y que aún no se ha evaluado sobre conjuntos de validación reservados.

El modelo tiene 4.539.265.536 parámetros totales (aproximadamente 4,54 mil millones), se distribuye en safetensors en bf16 con un tamaño de repositorio de 9,6 GB y mantiene la licencia Apache 2.0 del modelo base. No se han publicado datos de idiomas soportados ni resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) del base Qwen3.5-4B; incluye vision tower y cabeza MTP; proyecciones Gated DeltaNet según la configuración de LoRA |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens en entrenamiento (el base soporta 262.144; el entrenamiento a 262k no cabía en la GPU utilizada) |
| Tipos de cuantización | no disponible (pesos publicados en bf16; el adaptador LoRA es compatible con PEFT) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, LoRA fusionado) + adaptador PEFT en `adapter/` + `chat_template.jinja` |

## Arquitectura y entrenamiento
El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal con torre de visión y cabeza MTP (multi-token prediction), y conserva su disposición de pesos: la torre de visión y la cabeza MTP no se modifican. Sobre esa base se aplica un adaptador LoRA con r=32, alpha=64, sobre las proyecciones de atención, MLP y Gated DeltaNet. El adaptador se fusiona en los pesos base en float32 y se almacena en bf16; el repositorio incluye el adaptador exacto en `adapter/` y un fichero `training/merge_check.json` que compara las logits del modelo fusionado con las de base + adaptador sobre un prompt de prueba.

El entrenamiento usa TRL `AsyncGRPOTrainer` (experimental): gradiente de política con muestreo por importancia, log-probabilidades de muestreo calculadas con vLLM, sin término KL y con una staleness máxima de 8. Las ventajas se calculan por grupo como `r - mean` (centradas en la media, sin división por desviación típica) con tamaño de grupo 8. La recompensa es la corrección del verificador (0/1) más, en los rollouts correctos, un bonus de brevedad de 0,1 × (1 − llamadas a herramientas / máximo de llamadas del grupo). Cada paso de optimizador entrena exactamente 8 grupos completos (64 rollouts) con señal de aprendizaje. Los rollouts se ejecutan con Junie CLI en sandboxes Docker, con thinking activado, temperatura 1.0 sin truncación top-p/top-k, hasta 2.000 pasos de agente por episodio, 3.600 s por episodio en los pasos 1-30 y 7.200 s desde el paso 31, con contexto de 131.072 tokens. Cada prompt de llamada al modelo se construye a partir de los tokens exactos de las llamadas anteriores.

Los datos provienen de un pool validado de SWE-rebench V2.1, SWE-Smith, tareas de terminal (SETA, LEGO), entornos de análisis de datos de SmolDataEnvs y pequeñas tareas de software; cada tarea se verifica como resoluble y no trivialmente superada antes de usarse. La proporción de familias en los grupos entrenados sube del 30% de SWE en el paso 1 al 50% en el paso 50, con muestreo por pools de dificultad dentro de cada familia. En los pasos 1-40 se entrenaron 320 grupos, aproximadamente un 38% de SWE (SWE-rebench V2.1 27%, SWE-Smith 11%), y cada tarea se visitó una sola vez. Una innovación destacable es la plantilla de chat: modifica la del base para conservar el bloque `<think>` en todos los turnos del asistente, de modo que un mensaje de usuario intermedio (por ejemplo, cuando Junie rechaza una acción) no reescriba el historial generado por el modelo, alineando así inferencia y entrenamiento.

## Capacidades
- Generación de texto y razonamiento multimodal image-text-to-text heredados del base Qwen3.5-4B.
- Ejecución de tareas de agente de programación: el modelo fue entrenado como política de Junie CLI, con capacidad de emitir llamadas a herramientas y acciones sobre terminal.
- Tool calling / function calling en el contexto de un agente CLI con sandbox de ejecución.
- Razonamiento multi-paso con thinking activado y episodios de hasta 2.000 pasos de agente.
- Trabajo con contexto largo: ventana de 131.072 tokens durante el entrenamiento.
- Capacidades de análisis de datos y pequeñas tareas de software, según la mezcla de datos de entrenamiento.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión: el pipeline es image-text-to-text y la torre de visión se conserva sin cambios, pero no se documenta su comportamiento tras el ajuste.

## Casos de uso
- Investigación en RL agéntico: reproducir o extender el pipeline AsyncGRPO con verificación de recompensa y sandbox Docker, usando este checkpoint como referencia intermedia del proceso.
- Estudio de plantillas de chat para agentes: analizar cómo la conservación de bloques `<think>` en todos los turnos afecta a la coherencia de historiales multi-turno con mensajes intercalados del usuario.
- Evaluación de estabilidad de checkpoints intermedios: comparar el paso 40 con el modelo base para medir la deriva de comportamiento en tareas de programación antes de que la tasa de acierto se separe del ruido.
- Desarrollo de agentes de terminal en entornos controlados: probar el modelo como política en un CLI con herramientas acotadas, aprovechando el contexto de 131k tokens para mantener el estado de la sesión.
- Análisis de datos asistido: usar el modelo en tareas de SmolDataEnvs como banco de pruebas de razonamiento con ejecución de código en sandbox.
- Fine-tuning posterior: partir del adaptador LoRA incluido en `adapter/` para continuar el entrenamiento con PEFT sin recalcular la fusión.
- Auditoría de metodología de RL: revisar `training/trainer_state.json` y `training/merge_check.json` para validar métricas por paso y la fidelidad de la fusión de pesos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta la tasa de acierto en entrenamiento sobre tareas no vistas, que se mantiene plana dentro del ruido: 0,45 → 0,48 tras 40 pasos de optimizador.

## Requisitos de hardware
- El entrenamiento se realizó en una única GPU; a 262.144 tokens de contexto no cabía, por lo que se limitó a 131.072 tokens.
- VRAM estimada para inferencia en bf16: aproximadamente 9-10 GB solo para pesos (4,54 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV, que con contexto de 131k tokens es considerable.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, el modelo es apto para GPUs con al menos 24 GB en bf16 (por ejemplo, RTX 4090) o 16 GB con cuantización de 8 bits, aunque estas cifras son estimaciones por tamaño y no datos publicados.
- Cabe en GPU de consumo en cuantizaciones de 8 o 4 bits; no se han publicado conversiones GGUF en el repositorio.
- Opciones de despliegue: transformers con PEFT para cargar `adapter/` o los pesos fusionados; vLLM se usó durante el entrenamiento para el muestreo, por lo que es una opción natural para servir el modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Qwen3.5-4B-Junie-AsyncGRPO-poc3-step40 | 4,54 B | 131.072 en entrenamiento (262.144 en el base) | Apache 2.0 | Checkpoint intermedio de investigación, sin evaluar |
| Qwen/Qwen3.5-4B (base) | 4,54 B | 262.144 | Apache 2.0 | Modelo base multimodal publicado por Qwen |
| Alternativas de 4B para agentes de código | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con otros modelos de la misma categoría.

## Limitaciones y advertencias
- Checkpoint intermedio: solo 40 de los 300 pasos de optimizador planificados; no está evaluado sobre conjuntos de validación reservados.
- La tasa de acierto en tareas no vistas permanece plana dentro del ruido (0,45 → 0,48), por lo que no hay evidencia de mejora sustancial frente al base.
- Contexto reducido a 131.072 tokens frente a los 262.144 del base por limitaciones de hardware durante el entrenamiento.
- Entrenado con una mezcla de datos específica y cada tarea visitada una sola vez; el riesgo de sobreajuste a ese pool no está caracterizado.
- Riesgo de alucinación y sesgos: no documentado en la información disponible; al ser un derivado del base, hereda los sesgos de este, que no se detallan.
- Idiomas soportados no disponibles; no se garantiza comportamiento multilingüe más allá del base.
- Uso comercial permitido por la licencia Apache 2.0, pero no se recomienda su despliegue en producción dado su carácter de investigación y la ausencia de evaluación.
- El adaptador LoRA está pensado para continuar el entrenamiento; su fusión se verificó con `training/merge_check.json`, pero no se documentan diferencias numéricas concretas.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/vvsotnikov/Qwen3.5-4B-Junie-AsyncGRPO-poc3-step40
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios o demos adicionales.
