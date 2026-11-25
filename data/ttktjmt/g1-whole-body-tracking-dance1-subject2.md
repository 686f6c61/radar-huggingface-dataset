# ttktjmt/g1-whole-body-tracking-dance1-subject2

## Resumen

`g1-whole-body-tracking-dance1-subject2` es una política de control entrenada por refuerzo para el robot humanoide Unitree G1, publicada por el usuario `ttktjmt` en Hugging Face. No es un modelo de lenguaje ni un modelo generativo de propósito general: es un checkpoint de PPO que produce acciones de control articular para que el robot replique una secuencia de movimiento concreta, en este caso el clip `dance1_subject2` del dataset LAFAN1, retargetizado a la cinemática del G1 mediante el dataset `lvhaidong/LAFAN1_Retargeting_Dataset`.

El artefacto se enmarca en el ecosistema MuJoCo Playground (versión 1.1.0) y en la herramienta `mjswan_playground`, cuyo script `reaf/train.py` se usó para el entrenamiento. El repositorio incluye los checkpoints de `rsl-rl`, un export a ONNX (`policy.onnx`), un fichero de contrato de observaciones/acciones (`contract.json`) y la referencia cinemática (`reference.npz`) que consume una escena de mjswan.

Su relevancia es acotada y muy específica: sirve como ejemplo reproducible de entrenamiento de seguimiento de cuerpo completo (*whole-body tracking*) en un humanoide comercial de 29 grados de libertad, y como activo listo para visualizar o reentrenar dentro del pipeline de MuJoCo Playground. No debe confundirse con un modelo fundacional de robótica ni con un modelo multimodal.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política neuronal entrenada con PPO (implementación `rsl-rl`) sobre el entorno `G1WholeBodyTracking` de MuJoCo Playground 1.1.0 |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de secuencia) |
| Tipos de cuantización | no disponible (export ONNX sin cuantización declarada) |
| Idiomas soportados | no aplica |
| Licencia | no disponible en los metadatos del repositorio; el movimiento de origen LAFAN1 es CC BY-NC-ND 4.0 |
| Formato de pesos | checkpoints `rsl-rl` (formato nativo de la librería) y `policy.onnx`; además `contract.json` y `reference.npz` |

## Arquitectura y entrenamiento

La política se entrena con Proximal Policy Optimization (PPO) mediante `rsl-rl`, la librería de aprendizaje por refuerzo de NVIDIA asociada a Isaac Lab y adoptada por MuJoCo Playground. El entorno `G1WholeBodyTracking` define un objetivo de seguimiento de una referencia cinemática de cuerpo completo: el agente observa el estado del robot y la referencia temporal, y emite acciones articulares que se aplican como consignas de posición a los actuadores del Unitree G1. El repositorio no detalla la topología exacta de la red (número de capas, anchura, funciones de activación) ni el número de pasos de entrenamiento, por lo que esos datos deben considerarse no disponibles.

El dato de entrenamiento es una única secuencia de movimiento: `dance1_subject2` de LAFAN1, retargetizada al G1 a través de `lvhaidong/LAFAN1_Retargeting_Dataset`. No hay, por tanto, un corpus amplio de movimientos ni un entrenamiento multi-tarea; se trata de una política especializada en un clip. El repositorio incluye los checkpoints de `rsl-rl` (el más reciente permite reanudar el entrenamiento) y un export a ONNX acompañado de `contract.json`, que fija el contrato de observaciones y acciones, y `reference.npz`, con la referencia que consume la escena de mjswan.

## Capacidades

- Seguimiento de cuerpo completo de una referencia cinemática concreta (`dance1_subject2`) sobre el humanoide Unitree G1.
- Generación de acciones articulares continuas a partir de observaciones de estado y referencia temporal, exportables a ONNX para inferencia fuera del entorno de entrenamiento.
- Reanudación del entrenamiento desde los checkpoints de `rsl-rl` incluidos.
- Integración con escenas de mjswan mediante `contract.json` y `reference.npz`.
- No soporta tool calling, function calling, razonamiento multi-paso, ni capacidades multilingües: no es un modelo de lenguaje.
- No incluye visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Visualización de seguimiento de movimiento en mjswan: cargar `policy.onnx`, `contract.json` y `reference.npz` en una escena de mjswan para reproducir el clip `dance1_subject2` sobre el G1 y validar cualitativamente la política.
- Reproducción de experimentos de MuJoCo Playground: usar el repositorio como referencia de un entrenamiento PPO completo sobre `G1WholeBodyTracking`, comparando hiperparámetros y curvas con los del entorno original.
- Reentrenamiento y ajuste fino: partir del checkpoint más reciente de `rsl-rl` para prolongar el entrenamiento, cambiar la recompensa o adaptar la política a variaciones del modelo del robot.
- Base para retargeting de nuevos clips: sustituir `reference.npz` por otra secuencia retargetizada al G1 y evaluar hasta qué punto la política generaliza o requiere reentrenamiento.
- Despliegue en simulación para pruebas de control: exportar la política a ONNX e integrarla en un bucle de control propio en MuJoCo para medir estabilidad, error de seguimiento y consumo de par.
- Docencia y divulgación en robótica con refuerzo: ejemplo autocontenido de *whole-body tracking* en un humanoide de 29 DoF, útil para ilustrar el pipeline observación-acción-recompensa sin infraestructura de entrenamiento a gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de recompensa, error de seguimiento (MPJPE u otras), tasas de éxito ni comparaciones cuantitativas con políticas alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser una política de control de tamaño reducido y exportada a ONNX, la inferencia cabe holgadamente en cualquier GPU consumer, pero el repositorio no declara el número de parámetros.
- GPU recomendadas: no disponible. Para inferencia en MuJoCo basta con CPU en la mayoría de escenarios; para reentrenar con `rsl-rl` se recomienda GPU dedicada, sin que el autor especifique modelo.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del artefacto (repo de 0.0 GB según Hugging Face) y el formato ONNX, aunque no hay confirmación explícita.
- Opciones de despliegue: MuJoCo Playground 1.1.0, mjswan, `rsl-rl` para entrenamiento y ONNX Runtime para el export `policy.onnx`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Movimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `g1-whole-body-tracking-dance1-subject2` (este) | Política PPO para G1 | MuJoCo Playground 1.1.0 | `dance1_subject2` (LAFAN1) | no disponible (movimiento origen CC BY-NC-ND 4.0) | Hugging Face, repo público |
| Políticas de referencia de MuJoCo Playground (`G1WholeBodyTracking`) | Políticas PPO del propio entorno | MuJoCo Playground | Conjunto de clips del entorno | la del proyecto MuJoCo Playground | Repositorio oficial de MuJoCo Playground |
| Políticas de Isaac Lab / rsl-rl para humanoides | Políticas PPO | Isaac Lab | Distintos clips retargetizados | la del proyecto Isaac Lab | Repositorios oficiales de NVIDIA |

No se dispone de datos cuantitativos para comparar rendimiento entre estas alternativas; la comparación anterior es estructural (entorno, clip y licencia) y no de métricas.

## Limitaciones y advertencias

- Política especializada en un único clip (`dance1_subject2`); no se ha entrenado para generalizar a otros movimientos ni a perturbaciones no vistas.
- Sin métricas publicadas de error de seguimiento, estabilidad o robustez, por lo que no hay evidencia cuantitativa de calidad más allá de la visualización en mjswan.
- Licencia del repositorio no declarada: no se puede asumir uso comercial sin consultar al autor.
- El movimiento de origen LAFAN1 está bajo CC BY-NC-ND 4.0, lo que restringe el uso comercial y prohíbe obras derivadas del clip original; esto condiciona cualquier reutilización del dato de entrenamiento.
- El dataset de retargeting `lvhaidong/LAFAN1_Retargeting_Dataset` impone sus propias condiciones de uso, no detalladas aquí.
- Sin información sobre sesgos, alucinación o comportamiento fuera de distribución más allá de lo esperable en una política de RL entrenada sobre una sola trayectoria.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni informes independientes de funcionamiento.
- El artefacto está pensado para simulación en MuJoCo; no se documenta transferencia a hardware real del Unitree G1 ni calibración de actuadores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ttktjmt/g1-whole-body-tracking-dance1-subject2
- Dataset de retargeting LAFAN1 al G1: https://huggingface.co/datasets/lvhaidong/LAFAN1_Retargeting_Dataset
- MuJoCo Playground: https://github.com/google-deepmind/mujoco_playground
- rsl-rl: https://github.com/leggedrobotics/rsl_rl
- LAFAN1 (Ubisoft La Forge): https://github.com/ubisoft/ubisoft-laforge-animation-dataset
- MuJoCo: https://mujoco.org
