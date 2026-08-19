# sweagent/coevolve-iter2-rl-iter49

## Resumen

El modelo `sweagent/coevolve-iter2-rl-iter49` es un checkpoint intermedio (iteración 49) de un proceso de entrenamiento por co-evolución entre un agente LLM y sus datos de entrenamiento, desarrollado por el equipo de SWE-agent. Forma parte del marco CoEvolve, que cierra el bucle entre el agente y los datos: el agente interactúa con el entorno, se extraen señales de fallo de los rollouts y esas señales guían la síntesis de nuevas tareas durante el entrenamiento con refuerzo (RL). Este checkpoint corresponde al paso M (modelo) de la iteración 2 del bucle de co-evolución, y se inicia desde el modelo `sweagent/diffrecon-rl-iter49` (resultado de la iteración 1 de RL). Según la lineage declarada, el modelo base es Qwen3.5-35B-A3B, un modelo de arquitectura MoE con 35 mil millones de parámetros totales y 3 mil millones activos, aunque esta información no está confirmada oficialmente en la ficha.

El modelo está especializado en tareas de resolución de issues de software, evaluado en el benchmark SWE-bench Verified, donde alcanza un 70.3 % de resolución (promedio de 3 réplicas). Su relevancia radica en demostrar que la co-evolución agente-datos, combinada con GRPO y muestreo dinámico, mejora progresivamente el rendimiento de agentes de código en comparación con iteraciones anteriores. No se dispone de información sobre longitud de contexto, idiomas soportados ni cuantizaciones disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (probablemente, basado en Qwen3.5-35B-A3B) - no confirmado |
| Parametros totales | 35B (según lineage, no confirmado) |
| Parametros activos | 3B (según lineage, no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (probablemente safetensors, no especificado) |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la información proporcionada. La lineage indica que el modelo base es Qwen3.5-35B-A3B, lo que sugiere una arquitectura de mezcla de expertos (MoE) con 35B parámetros totales y 3B activos, pero esta información no está confirmada en la model card. El entrenamiento se realizó mediante GRPO (Group Relative Policy Optimization) con muestreo dinámico, durante 50 pasos (rollouts 0-49). El harness utilizado durante el RL es `combo_fb` (ganador de la iteración 2 del paso H), que forma parte del marco CoEvolve. Este marco introduce una evolución de datos guiada por retroalimentación durante el RL: el agente interactúa con el entorno, se extraen señales de fallo de los rollouts y esas señales guían la síntesis de nuevas tareas, cerrando el bucle entre agente y datos. No se especifican detalles sobre el dataset de entrenamiento, composición de datos ni técnicas adicionales como RLHF o DPO.

## Capacidades

- Resolución de issues de software: el modelo está entrenado para generar parches que resuelven problemas reportados en repositorios de código, como se evalúa en SWE-bench Verified.
- Razonamiento multi-paso: al ser un agente entrenado con RL, se espera que pueda planificar y ejecutar múltiples pasos de razonamiento para abordar tareas complejas, aunque no se confirma explícitamente.
- Tool calling: probablemente soporta invocación de herramientas (como ejecución de comandos o edición de archivos) dado su uso en entornos de agente, pero no se especifica.
- Generación de código: inherente a su propósito, aunque no se detallan capacidades específicas de síntesis de código.
- No se dispone de información sobre capacidades multilingües, visión, audio u otras modalidades.

## Casos de uso

- Resolución automática de issues en repositorios de código: el modelo puede recibir una descripción de un bug o tarea y generar un parche que lo resuelva, como se demuestra en SWE-bench. Es adecuado para integrarse en flujos de mantenimiento de software.
- Asistencia en desarrollo de software: puede ayudar a desarrolladores a identificar y corregir errores en código existente, sugiriendo cambios concretos.
- Integración en pipelines de CI/CD: el modelo podría ejecutarse como parte de un sistema de integración continua para proponer correcciones automáticas a fallos detectados en pruebas.
- Generación de parches para vulnerabilidades: dado su entrenamiento en tareas de resolución de issues, podría aplicarse a la corrección de vulnerabilidades de seguridad en código abierto.
- Evaluación de agentes en benchmarks: sirve como punto de referencia para medir el progreso en el desarrollo de agentes de software, dado su rendimiento documentado en SWE-bench Verified.
- Investigación en RL para agentes: el modelo es un artefacto de investigación que permite estudiar el impacto de la co-evolución agente-datos en el rendimiento de agentes LLM.

## Benchmarks y rendimiento

El modelo fue evaluado en el benchmark SWE-bench Verified (conjunto de 500 problemas). Los resultados se presentan a continuación, junto con la trayectoria de co-evolución reportada en la model card.

| Modelo x harness | Puntuación (SWE-bench Verified) | n |
|---|---|---|
| base x seed | 60.9 ± 1.5 | 17 |
| iter-1 RL x iter-1 harness | 67.9 ± 0.9 | 10 |
| iter-1 RL x iter-2 harness | 68.8 ± 1.2 | 10 |
| **este modelo** x iter-2 harness | **70.3 ± 1.5** | 3 |

Detalle de las réplicas: 348, 345 y 362 problemas resueltos (de 500). Una cuarta réplica fue excluida por problemas de salud de generación (límites de pasos excedidos en 26 tareas, tasa de parches no vacíos del 94.8 % frente al 98-99 % de las réplicas válidas); incluyéndola, la puntuación sería 69.3 ± 2.1 (n=4). No se han publicado otros benchmarks en la información disponible.

## Requisitos de hardware

No se dispone de información oficial sobre requisitos de hardware. Dado el tamaño probable del modelo (35B parámetros totales, 3B activos), se puede estimar que la inferencia en precisión FP16 requeriría aproximadamente 70 GB de VRAM para los pesos completos, aunque con cuantización (por ejemplo, 4 bits) podría reducirse a unos 20-25 GB. Sin embargo, estos valores son estimaciones no confirmadas. No se especifican GPUs recomendadas, opciones de despliegue (vLLM, llama.cpp, etc.) ni métricas de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en la documentación proporcionada. No se pueden establecer comparaciones fiables sin datos adicionales.

## Limitaciones y advertencias

- El modelo es un checkpoint intermedio de un proceso de investigación, no un producto final estable. Su rendimiento puede variar en entornos distintos al harness de evaluación.
- No se han documentado sesgos específicos, pero al estar entrenado principalmente en tareas de código, su comportamiento en otros dominios puede ser limitado.
- Riesgo de alucinación en la generación de código: como cualquier LLM, puede producir parches incorrectos o incompletos, especialmente en tareas complejas.
- Dependencia del harness de evaluación: el rendimiento reportado (70.3 %) se obtuvo con el harness `combo_fb`; con otros entornos o configuraciones de agente, los resultados pueden diferir.
- No se especifican limitaciones de contexto o idioma. Se desconoce si el modelo soporta lenguajes distintos al inglés o si tiene restricciones de longitud de entrada.
- La licencia Apache 2.0 permite uso comercial, pero al ser un modelo derivado de Qwen3.5, se deben verificar las licencias de los modelos base subyacentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sweagent/coevolve-iter2-rl-iter49
- Paper CoEvolve (arXiv): https://arxiv.org/abs/2604.15840
- PDF del paper: https://arxiv.org/pdf/2604.15840
- Repositorio GitHub de CoEvolve: https://github.com/AMAP-ML/CoEvolve
- Dataset de trayectorias: https://huggingface.co/datasets/sweagent/coevolve-swev-grid-trajs
- Modelo base (iter-1 RL): https://huggingface.co/sweagent/diffrecon-rl-iter49
