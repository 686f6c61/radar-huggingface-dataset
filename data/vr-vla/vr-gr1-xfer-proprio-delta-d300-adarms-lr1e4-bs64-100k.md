# VR-VLA/VR-gr1-xfer-proprio-delta-d300-adarms-lr1e4-bs64-100k

## Resumen

VR-gr1-xfer-proprio-delta-d300-adarms-lr1e4-bs64-100k es una política robótica visión-lenguaje-acción (VLA) para el humanoide GR-1 en el simulador RoboCasa, publicada por el usuario VR-VLA. Se construye sobre un backbone Qwen3.5-0.8B congelado con adaptadores LoRA r=16 también congelados, al que se añade una cabeza de acción de 266 millones de parámetros entrenables basada en 24 bloques de cross-attention con flow matching y condicionamiento temporal por adaRMS. El modelo predice deltas de articulaciones relativos al estado actual, no posiciones absolutas.

El checkpoint es el resultado de un fine-tuning de 100.000 pasos sobre el preentrenamiento egocéntrico EgoVerse v06, usando las primeras 300 demostraciones de cada una de las 24 tareas de mesa de GR-1 (7.200 episodios, 1.616.967 ventanas). Su relevancia es doble: por un lado es una política desplegable en el simulador con un 21,3% de éxito global (153/720 rollouts); por otro, forma parte de un estudio controlado sobre si el preentrenamiento con vídeo humano egocéntrico transfiere a manipulación humanoide, con la conclusión de que en este caso no aporta ganancia medible (21,3% frente a 20,8% entrenando desde cero).

Se trata de un artefacto de investigación, no de un modelo de propósito general: no se ha evaluado fuera de RoboCasa, no se ha desplegado en hardware real y su licencia es interna (egoverse-internal), heredando la restricción no comercial del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA: backbone transformer Qwen3.5-0.8B congelado + LoRA r=16 congelado + cabeza de acción de 24 bloques de cross-attention con flow matching |
| Parametros totales | No disponible de forma explícita; aproximadamente 1,1B (Qwen3.5-0.8B congelado + 266M en la cabeza de acción) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; checkpoint entrenado en bf16 con pesos maestros en fp32 |
| Idiomas soportados | No disponible (modelo orientado a control robótico; no se documenta soporte multilingüe) |
| Licencia | egoverse-internal (license: other); hereda la restricción no comercial de CC-BY-NC-4.0 |
| Formato de pesos | PyTorch (944 tensores; repositorio de 3,7 GB). No se especifica safetensors ni GGUF |
| Dimension de accion | 44 articulaciones GR-1, chunks de 16 pasos a 20 Hz |
| Entrada visual | 256×256, cámara de cabeza egocéntrica, resolución nativa |
| Entrada propioceptiva | 44 posiciones articulares, z-score con estadísticas del split de entrenamiento, un único token |
| Condicionamiento temporal | adaRMS |
| Pasos de entrenamiento | 100.000 |
| Modelo base | VR-VLA/VR-egoverse-v06-pretrained-lr1e4-bs64-60k |

## Arquitectura y entrenamiento

El sistema combina tres piezas. La primera es el backbone Qwen3.5-0.8B, que permanece completamente congelado durante el fine-tuning, con adaptadores LoRA de rango 16 igualmente congelados en este checkpoint. La segunda es la entrada propioceptiva: las 44 posiciones articulares del GR-1 se normalizan con estadísticas del split de entrenamiento y se introducen en la cabeza de acción como un único token. La tercera es la cabeza de acción, el único componente entrenable (266M parámetros), formada por 24 bloques de cross-attention con dimensión oculta 1024 que generan la acción mediante flow matching con integración de Euler de 10 pasos, condicionada en el tiempo mediante adaRMS.

Los objetivos de acción son deltas relativos al estado articular actual: el modelo predice `action[t + k] − state[t]` para k = 0…15, normalizados con los estadísticos q01/q99 de los deltas al rango [-1, 1]. En inferencia hay que sumar de nuevo el estado articular actual antes de enviar la acción al robot; alimentar los deltas como objetivos absolutos hace fallar la política. Las articulaciones de piernas, cuello y una de la mano derecha (15 dimensiones) nunca se mueven en estos datos: se enmascaran en la pérdida y right_hand[5] se fija a su valor constante en inferencia. Se requieren dos ficheros JSON: `action_norm_gr1_delta.json` (estadísticas de acción, también embebidas en el checkpoint, y marca de objetivos relativos) y `action_norm_gr1_proprio.json` (estadísticas de estado articular, que no están embebidas).

El entrenamiento usa el dataset nvidia/PhysicalAI-Robotics-GR00T-Teleop-Sim (árbol LeRobot, CC-BY-NC-4.0), con 24 tareas de mesa sobre GR1ArmsAndWaistFourierHands, las primeras 300 demostraciones de cada tarea y las 2 últimas reservadas como conjunto de evaluación. La configuración es de 100.000 pasos, learning rate 1e-4 con decaimiento coseno y 100 pasos de warmup, batch efectivo 64 (16 × acumulación 4) en una sola GPU, autocast en bf16 y pesos maestros en fp32. No se documenta uso de RLHF ni DPO; el entrenamiento es de imitación supervisada sobre demostraciones.

## Capacidades

- Generación de acciones motoras: produce chunks de 16 pasos de 44 dimensiones articulares a 20 Hz para el humanoide GR-1.
- Percepción visual egocéntrica: procesa fotogramas de 256×256 de la cámara de cabeza a resolución nativa.
- Condicionamiento propioceptivo: integra el estado articular completo (44 posiciones) como entrada.
- Control relativo al estado: predice deltas articulares, lo que según los controles emparejados del autor es el factor que hace funcionar la política (frente a objetivos absolutos).
- Ejecución en simulador: la política maneja directamente el simulador RoboCasa, con cero reinicios de bridge y cero chunks de acción no finitos en la evaluación reportada.
- Ejecución por chunks: chunk-execute 8, es decir, se ejecutan 8 pasos por cada inferencia.
- Tareas de mesa: cubre 24 tareas de manipulación tabletop, aunque con éxito muy desigual (de 0/30 a 12/30).
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje de propósito general, sino una política de control.
- No tiene capacidades multilingües documentadas ni modo de pensamiento, audio o visión generalista.

## Casos de uso

- Estudio controlado de transferencia de preentrenamiento: el checkpoint es una de las ramas del experimento del autor sobre si el vídeo humano egocéntrico (EgoVerse) mejora la manipulación humanoide. Sirve como evidencia empírica con controles emparejados, con la conclusión de que la ganancia no es medible en GR-1 con una sola semilla.
- Baseline reproducible en RoboCasa: al estar publicado con la receta exacta (pasos, learning rate, batch, semilla 7, horizonte 720, chunk-execute 8), permite comparar políticas futuras en el mismo protocolo de 24 tareas × 30 ensayos.
- Punto de partida para fine-tuning en nuevas tareas de mesa: la cabeza de acción es el único bloque entrenable, de modo que adaptar el modelo a una tarea nueva implica reentrenar 266M parámetros sobre un backbone congelado, un coste muy inferior al de un fine-tuning completo.
- Generación de rollouts sintéticos en simulación: sus trayectorias, incluidas las de tareas con éxito cero, pueden usarse como datos negativos o para análisis de modos de fallo en aprendizaje por imitación.
- Investigación sobre representación de acciones: la comparación relativo frente a absoluto (21,3% frente a 9,7% con todos los datos y desde cero) es un caso de estudio concreto sobre cómo parametrizar el espacio de acción en políticas VLA.
- Validación de infraestructura de despliegue en simulación: probar pipelines de inferencia con entrada de estado articular obligatoria, dos ficheros de normalización y suma del estado a los deltas, antes de escalar a otros robots o políticas.
- Aprendizaje de manos diestras parcial: al enmascarar 15 dimensiones inmóviles, el modelo no puede usarse para tareas que requieran piernas, cuello o la articulación right_hand[5]; sirve para acotar qué partes del cuerpo quedan fuera del alcance de este dataset.

## Benchmarks y rendimiento

Evaluación en GR-1 tabletop: 24 tareas × 30 ensayos = 720 rollouts, `ckpt_final`, horizonte de 720 pasos, chunk-execute 8, semilla 7. Cero reinicios de bridge y cero chunks de acción no finitos.

| Configuracion | Inicializacion | Demos/tarea | Objetivos | Exito |
|---|---|---|---|---|
| Este checkpoint | Pretrain EgoVerse | 300 | Relativos | 21,3% (153/720) |
| Misma receta desde cero | Ninguna | 300 | Relativos | 20,8% (150/720) |
| Preentrenado, 30 demos | Pretrain EgoVerse | 30 | Relativos | 17,4% (125/720) |
| Desde cero, todas las demos | Ninguna | 998 | Absolutos | 9,7% (70/720) |
| Preentrenado, todas las demos | Pretrain EgoVerse | 998 | Absolutos | 6,7% (48/720) |

Éxitos por tarea (sobre 30, en orden del dataset): 6 · 6 · 8 · 8 · 4 · 6 · 12 · 0 · 12 · 10 · 3 · 9 · 7 · 12 · 0 · 6 · 3 · 6 · 7 · 8 · 6 · 5 · 7 · 2.

Hallazgos declarados por el autor a partir de los controles emparejados:

- Los objetivos relativos son determinantes: con objetivos absolutos el movimiento es de aproximadamente 0,08 del rango normalizado y la política apenas se mueve; los relativos más que duplican el éxito.
- El preentrenamiento EgoVerse no aporta ganancia medible en GR-1 (21,3% frente a 20,8% desde cero, una sola semilla). Cerrar el turno vacío del asistente en inferencia en lugar de generar un token da 21,2% aquí y 22,6% desde cero, sin ganancia.
- Como contexto externo, el paper de GR00T N1 reporta 40,4% (Diffusion Policy) y 49,3% (GR00T-N1-2B) con 300 demos por tarea, con modelos mayores, encoder visual no congelado y batch 1024.

## Requisitos de hardware

- VRAM estimada para inferencia: no especificada por el autor. A partir del recuento de parámetros (aproximadamente 1,1B, con el backbone Qwen3.5-0.8B más 266M de cabeza), los pesos en bf16 ocuparían del orden de 2,2 GB; con activaciones, buffers de imagen de 256×256 y el bucle de 10 pasos de Euler de la flow matching, es razonable esperar un consumo total por debajo de 8 GB. Es una estimación derivada, no un dato publicado.
- GPU recomendadas: no disponibles. El autor solo indica que el entrenamiento se hizo en una única GPU con batch 16 y acumulación 4.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas con 8-12 GB o más, dado el tamaño del modelo, aunque no hay validación publicada. Conviene verificar con la implementación concreta antes de asumirlo.
- Opciones de despliegue: no se documentan. El repositorio es PyTorch y no se publican pesos GGUF ni soporte declarado para vLLM, llama.cpp, Ollama o TGI. Al ser una política de control con cabeza de acción personalizada y entradas propioceptivas, lo habitual es un bucle de inferencia PyTorch específico, no un servidor de texto genérico.
- Restricciones temporales del control: la frecuencia de control es de 20 Hz (50 ms por paso) y con chunk-execute 8 se ejecuta una inferencia por cada 8 pasos, lo que fija un presupuesto de aproximadamente 400 ms por inferencia para mantener el tiempo real en simulación. Es una derivación aritmética de la configuración, no una latencia medida.
- Throughput y latencia: no disponibles.
- El modelo requiere en inferencia el vector de estado articular actual y el fichero `action_norm_gr1_proprio.json`, además de sumar el estado a los deltas predichos. Cualquier entorno de despliegue debe implementar ese paso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / accion | Exito en GR-1 tabletop | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VR-gr1-xfer-proprio-delta (este) | ~1,1B (266M entrenables) | 44 dims, chunks de 16 a 20 Hz | 21,3% (300 demos, relativos) | egoverse-internal, no comercial | HuggingFace, pesos PyTorch |
| Misma receta desde cero | ~1,1B | 44 dims, chunks de 16 a 20 Hz | 20,8% (300 demos, relativos) | No aplica (control interno del estudio) | No publicado como checkpoint independiente en la ficha |
| Pretrain EgoVerse, 30 demos | ~1,1B | 44 dims, relativos | 17,4% | egoverse-internal | Mencionado como control |
| GR00T-N1-2B | 2B | No disponible en la ficha | 49,3% (300 demos) | No disponible | Referencia bibliografica del paper GR00T N1 |
| Diffusion Policy | No disponible | No disponible en la ficha | 40,4% (300 demos) | No disponible | Referencia bibliografica del paper GR00T N1 |

La comparación directa con GR00T-N1-2B y Diffusion Policy no es homogénea: el propio autor señala que esos resultados usan modelos mayores, encoder visual no congelado y batch 1024, frente al batch 64 y la única GPU de este checkpoint. Los tres primeros controles sí son comparables entre sí, porque comparten receta, datos y protocolo de evaluación.

## Limitaciones y advertencias

- Ámbito restringido a simulación: entrenado sobre 24 tareas simuladas de RoboCasa, sin datos de robot real, y no evaluado fuera de ese entorno. No hay despliegue en hardware.
- Una sola semilla: todos los resultados son de una única semilla, por lo que las diferencias entre configuraciones (21,3% frente a 20,8%) no permiten afirmar superioridad estadística.
- Tareas con éxito nulo o casi nulo: las tareas 7, 14 y 23 quedan en 0, 0 y 2 éxitos sobre 30. El modelo no es utilizable de forma uniforme en las 24 tareas.
- Obligatoriedad del estado articular y de las estadísticas: el fichero `action_norm_gr1_proprio.json` no está embebido en el checkpoint y es imprescindible. Además, los deltas predichos deben sumarse al estado actual; usarlos como objetivos absolutos hace fallar la política, según el propio autor.
- Dimensiones inmóviles: 15 de las 44 articulaciones (piernas, cuello y parte de la mano derecha) nunca se mueven en los datos y están enmascaradas; right_hand[5] se fija a una constante. Cualquier tarea que requiera esas articulaciones queda fuera de alcance.
- Rendimiento absoluto bajo: 21,3% de éxito global, con controles externos que reportan 40,4% y 49,3% en el mismo entorno. No es adecuado como política de producción ni como referencia de estado del arte.
- Riesgo de alucinación: no aplica en el sentido de generación de texto libre, pero sí existe riesgo de acciones incoherentes o inservibles fuera de la distribución de entrenamiento. El autor reporta cero chunks no finitos en la evaluación, no una garantía general.
- Sesgos de datos: el dataset es de teleoperación sobre una morfología concreta (GR1ArmsAndWaistFourierHands), un conjunto fijo de 24 tareas y una cámara de cabeza egocéntrica. La generalización a otras cámaras, morfologías o entornos no está medida.
- Restricciones de licencia: licencia `egoverse-internal`, derivada de EgoVerse (interno), del dataset nvidia/PhysicalAI-Robotics-GR00T-Teleop-Sim (CC-BY-NC-4.0) y de Qwen3.5-0.8B. El checkpoint hereda la restricción no comercial y no concede derechos más allá de esas tres fuentes; el usuario debe cumplir las tres. Uso comercial no permitido.
- Caveat de producción: la combinación de éxito bajo, ausencia de validación en hardware, resultados de una sola semilla y licencia no comercial lo descarta para despliegues productivos. Su uso razonable es la investigación y la comparación controlada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VR-VLA/VR-gr1-xfer-proprio-delta-d300-adarms-lr1e4-bs64-100k
- Modelo base (preentrenamiento EgoVerse v06): https://huggingface.co/VR-VLA/VR-egoverse-v06-pretrained-lr1e4-bs64-60k
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/PhysicalAI-Robotics-GR00T-Teleop-Sim
- Backbone congelado: Qwen/Qwen3.5-0.8B (referenciado en la model card; no se proporciona URL directa en la información disponible)
- Paper GR00T N1: citado como referencia comparativa en la model card (no se proporciona enlace en la información disponible)
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces obtenidos correspondían a cascos de realidad virtual y no se incluyen.
