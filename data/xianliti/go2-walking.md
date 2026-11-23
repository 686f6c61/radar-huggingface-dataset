# Xianliti/Go2-walking

## Resumen

Go2 High-step es una política de locomoción para el robot cuadrúpedo Unitree Go2, desarrollada por el usuario Xianliti y publicada en Hugging Face. Se trata de un modelo de aprendizaje por refuerzo (reinforcement learning) entrenado con PPO en el simulador Isaac Lab y ajustado (fine-tuned) para conseguir una mayor altura de levantamiento del pie durante la marcha, manteniendo al mismo tiempo una inclinación del cuerpo limitada. No es un modelo de lenguaje ni un modelo generativo multimodal, sino un controlador neuronal que mapea observaciones de estado del robot a acciones articulares.

El artefacto principal es un actor exportado a ONNX que recibe un vector de observación de 45 dimensiones en float32 y devuelve una acción de 12 dimensiones correspondiente a las articulaciones del robot. El repositorio incluye además el checkpoint de entrenamiento en formato RSL-RL (`model_5260.pt`), un archivo YAML con los parámetros de despliegue (orden y escalas de observación, mapeo de articulaciones, posiciones por defecto, ganancias PD e intervalo de política de 20 ms), vectores de prueba numéricos y un manifiesto con hashes SHA-256.

La relevancia de esta ficha es acotada: se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, sin licencia declarada ni idiomas soportados, y orientado exclusivamente a robótica cuadrúpeda en simulación. Su interés radica en ser un ejemplo reproducible de política de locomoción exportada a ONNX con artefactos de verificación numérica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política neuronal de aprendizaje por refuerzo (actor exportado a ONNX), entrenada con PPO en Isaac Lab |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; la observación es un vector de 45 dimensiones) |
| Tipos de cuantización | no disponible (el actor se distribuye en ONNX float32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`), checkpoint RSL-RL (`model_5260.pt`), YAML de despliegue, NPZ de vectores de prueba, JSON de manifiesto |

## Arquitectura y entrenamiento

La política sigue el paradigma habitual de locomoción con aprendizaje por refuerzo: un actor neuronal que transforma un vector de observación de 45 componentes en 12 acciones articulares, entrenado mediante PPO (Proximal Policy Optimization) en Isaac Lab. El checkpoint seleccionado es el 5260, elegido explícitamente por proporcionar una mayor altura de levantamiento del pie (swing-foot clearance) limitando la inclinación del cuerpo. El autor indica que la política fue evaluada en simulación.

El repositorio no detalla la composición del dataset de entrenamiento (no aplica en el sentido habitual, al tratarse de RL en simulador), el número de tokens ni el diseño exacto de la red (capas, dimensiones ocultas). Tampoco se especifica si hubo fases adicionales de ajuste más allá del fine-tuning con PPO mencionado. La innovación destacable es de índole práctica: la exportación del actor a ONNX con vectores de prueba numéricos y un manifiesto de hashes, lo que facilita la verificación de integridad y la reproducibilidad del despliegue.

## Capacidades

- Locomoción cuadrúpeda en terreno plano para el robot Unitree Go2.
- Seguimiento de comandos de velocidad: con una orden de 0,5 m/s en terreno plano en MuJoCo, la política promedió 0,416 m/s tras los dos primeros segundos.
- Mayor altura de levantamiento del pie: la media de los picos medianos de swing de las cuatro patas fue de 8,01 cm durante los diez segundos siguientes.
- Control de inclinación del cuerpo dentro de límites durante la marcha (criterio de selección del checkpoint 5260).
- Inferencia mediante actor ONNX con entrada `[1, 45]` float32 y salida `[1, 12]`.
- Verificación numérica mediante `onnx_test_vectors.npz` (observaciones de ejemplo y salidas correspondientes).
- No soporta tool calling, function calling, agentes, multilingüismo, visión, audio ni modos de razonamiento: no es un modelo de lenguaje.

## Casos de uso

- Despliegue en simulación MuJoCo: cargar `policy.onnx` y aplicar las escalas y offsets del YAML para reproducir la marcha a velocidad comandada; útil para validar el pipeline de control antes de pasar a hardware.
- Verificación de integridad en CI: usar `manifest.json` con los hashes SHA-256 del checkpoint y del ONNX para comprobar que los artefactos desplegados no han sido alterados.
- Pruebas de regresión numérica: comparar las salidas del actor con `onnx_test_vectors.npz` para detectar desviaciones introducidas por cambios en el runtime de inferencia o en el preprocesado.
- Investigación en locomoción con RL: servir como punto de partida para comparar políticas con distinta altura de swing y evaluar el compromiso entre clearance y estabilidad postural.
- Docencia y reproducción de pipelines Isaac Lab a ONNX: el repositorio documenta el mapeo de articulaciones, ganancias PD e intervalo de política de 20 ms, lo que facilita entender el flujo completo de entrenamiento a despliegue.
- Integración en banco de pruebas de control a 50 Hz: el intervalo de política de 20 ms define la frecuencia de bucle de control, adecuada para experimentos de seguimiento de comandos en simulador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos de evaluación proporcionados por el autor son métricas de simulación en MuJoCo:

| Métrica | Condición | Resultado |
|---|---|---|
| Velocidad media | Comando de 0,5 m/s en terreno plano, tras los dos primeros segundos | 0,416 m/s |
| Altura de swing (media de picos medianos de las cuatro patas) | Diez segundos siguientes, terreno plano | 8,01 cm |

## Requisitos de hardware

- VRAM estimada: no disponible; el actor ONNX es de pequeña dimensión (entrada 45, salida 12), por lo que la inferencia es viable en CPU.
- GPU recomendadas: no disponible; no se especifican requisitos de GPU para inferencia del actor exportado.
- GPU de consumo: no disponible; por el tamaño del actor, cualquier GPU de consumo moderna debería poder ejecutarlo, aunque no hay datos publicados que lo confirmen.
- Opciones de despliegue: ONNX Runtime (formato `policy.onnx`); el checkpoint `model_5260.pt` es un checkpoint de entrenamiento RSL-RL, no un artefacto de inferencia directa.
- Latencia y throughput: no disponibles; el único dato temporal es el intervalo de política de 20 ms (50 Hz) indicado en `params/deploy.yaml`.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos de locomoción comparables ni datos que permitan establecer una comparación rigurosa de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Licencia no declarada: no hay autorización explícita para uso comercial ni para redistribución; debe contactarse con el autor antes de cualquier uso en producción.
- Evaluación únicamente en simulación: el autor indica que la política se evaluó en simulación; no hay evidencia publicada de transferencia a hardware real.
- Entrenada para terreno plano: el alcance declarado es flat-ground locomotion; no se garantiza comportamiento en terrenos irregulares, pendientes o escaleras.
- Métricas limitadas: solo se reportan velocidad media y altura de swing en una condición concreta (comando de 0,5 m/s, MuJoCo); no hay datos de robustez ante perturbaciones, empujes o cambios de carga.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, lo que reduce la validación externa de los resultados.
- Ausencia de idiomas y de capacidades de lenguaje: no aplica para tareas de NLP, tool calling o agentes.
- Dependencia del YAML de despliegue: las escalas, offsets, mapeo de articulaciones y ganancias PD deben aplicarse exactamente como se especifica; un error en el preprocesado invalida las acciones del actor.
- Riesgo de alucinación: no aplica en el sentido de modelos generativos, pero sí existe riesgo de comportamiento fuera de distribución ante observaciones no vistas durante el entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/Xianliti/Go2-walking
- Isaac Lab (entorno de entrenamiento citado): https://github.com/isaac-sim/IsaacLab
- RSL-RL (formato del checkpoint `model_5260.pt`): https://github.com/leggedrobotics/rsl_rl
- MuJoCo (simulador de evaluación citado): https://github.com/google-deepmind/mujoco
- Unitree Go2 (robot objetivo): https://www.unitree.com/go2
- ONNX Runtime (runtime de inferencia): https://onnxruntime.ai
