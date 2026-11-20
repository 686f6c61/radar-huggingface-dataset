# yolkarian/sonic-g1-23dof-residual

## Resumen

SONIC residual para el Unitree G1 de 23 grados de libertad es una política residual de control corporal completo (whole-body control) desarrollada por el usuario yolkarian sobre la política SONIC publicada por NVIDIA (nvidia/GEAR-SONIC). El modelo no es un modelo de lenguaje ni de visión: es un módulo de control para robótica humanoide que corrige la acción del decodificador `g1_dyn` de SONIC sobre los 23 actuadores reales del G1, mediante la fórmula `action = base - 0.1 * residual`. Mantiene intactos los encoders, los tokens de movimiento y la interfaz de despliegue de SONIC (entrada de 994 dimensiones al decodificador, acción de 29 dimensiones).

El problema que resuelve es concreto: la política SONIC original está entrenada para el G1 completo, pero muchas plataformas físicas carecen de los grados de libertad de roll/pitch de cintura y de pitch/yaw de muñeca. Esta residual adapta el comportamiento a la variante de 23 DoF sin reentrenar el modelo base, que permanece congelado. Se entrenó sobre movimientos de BONES-SEED retargetizados al G1 de 23 DoF.

Es relevante porque demuestra una técnica de adaptación eficiente (política residual sobre un modelo fundacional congelado) aplicada a robótica humanoide, con mejoras medibles en seguimiento de trayectoria y robustez frente a empujes en simulación. El repositorio contiene únicamente la residual; el decodificador de despliegue se construye localmente fusionándola con la release de SONIC.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP residual (613 → 1024 → 512 → 256 → 23) sobre decodificador SONIC congelado |
| Parametros totales | no disponible (el repositorio indica 0.0 GB; solo se publica el checkpoint de la residual) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de secuencia) |
| Tipos de cuantizacion | no disponible (exportación a ONNX para despliegue) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | NVIDIA Open Model License (nvidia-open-model-license) |
| Formato de pesos | PyTorch `.pt` (checkpoint `model_step_020000.pt`); exportación a ONNX (`model_decoder.onnx`, `model_encoder.onnx`) |

## Arquitectura y entrenamiento

La residual es una MLP de cuatro capas (613 entradas, capas ocultas de 1024, 512 y 256, salida de 23) que se aplica sobre la acción del decodificador `g1_dyn` de SONIC. La entrada de 613 dimensiones corresponde a la observación del decodificador de la release (994-D de entrada al decodificador completo, de las cuales la residual consume un subconjunto de 613) y la salida son correcciones para los 23 actuadores reales del G1. La acción final se calcula como `action = base - 0.1 * residual`, donde `base` es la acción del decodificador SONIC congelado y el coeficiente 0.1 está definido en `config.yaml`. El checkpoint incluye además las estadísticas de normalización de observaciones.

El entrenamiento se realizó sobre movimientos de BONES-SEED retargetizados al G1 de 23 DoF. No se dispone de información sobre el número de tokens, composición del dataset, ni si se empleó RLHF/DPO (no aplicable en este dominio; no disponible si se usó RL o imitación supervisada más allá de lo indicado). La innovación técnica destacable es el enfoque de política residual sobre un modelo fundacional congelado: permite adaptar el control a una morfología reducida sin tocar los encoders ni los tokens de movimiento de SONIC, preservando la interfaz de despliegue original.

## Capacidades

- Control corporal completo (whole-body control) de un humanoide Unitree G1 con 23 grados de libertad actuados (sin roll/pitch de cintura ni pitch/yaw de muñeca).
- Seguimiento de movimiento (motion tracking) sobre movimientos retargetizados de BONES-SEED.
- Corrección de la acción del decodificador SONIC sobre las 23 articulaciones reales.
- Robustez frente a perturbaciones externas (empujes de 1 m/s y 2 m/s evaluados en simulación).
- Compatibilidad con la interfaz de despliegue de SONIC: entrada de 994-D al decodificador, acción de 29-D, encoders y tokens de movimiento intactos.
- Exportación a ONNX para despliegue mediante el programa C++ de GR00T-WholeBodyControl.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Adaptación de una política fundacional a hardware reducido: un laboratorio con un G1 de 23 DoF puede reutilizar la release de SONIC y aplicar esta residual para obtener control funcional sin reentrenar el modelo base, gracias a que solo se sustituye el decodificador fusionado.
- Seguimiento de movimiento en simulación: validación de políticas de motion tracking en MuJoCo con el programa de despliegue C++, útil para iterar sobre retargeting de BONES-SEED antes de pasar a hardware.
- Pruebas de robustez frente a perturbaciones: la mejora en caídas bajo empujes de 1 m/s (de 23 a 2 sobre 633 episodios) y 2 m/s (de 150 a 86) permite usar el modelo en bancos de prueba de resistencia a empujones.
- Despliegue en robot real: mediante `deploy.sh --dof-profile g1_23dof` con el modo `real`, el modelo se integra en el pipeline de despliegue de GR00T-WholeBodyControl para ejecutar políticas en el G1 físico.
- Investigación en políticas residuales: sirve como caso de estudio reproducible de adaptación de un modelo fundacional congelado mediante una MLP residual de bajo coste (613 → 1024 → 512 → 256 → 23).
- Reducción de error de seguimiento: en condiciones nominales reduce el error de posición de la raíz de 58,4 mm a 49,1 mm (diferencia pareada de −9,3 mm, IC 95% [−14,3, −4,5]), relevante para tareas que requieren precisión de localización.

## Benchmarks y rendimiento

Evaluación en simulación sobre 211 movimientos reservados (held-out), con la política SONIC congelada sobre el mismo robot de 23 DoF como línea base:

| Condición | Métrica | SONIC congelado | Residual |
|---|---|---|---|
| Nominal | Error de posición de la raíz | 58,4 mm | 49,1 mm (pareado −9,3 mm, IC 95% [−14,3, −4,5]) |
| Nominal | Caídas | 1 | 0 |
| Empujes de 1 m/s, 3 semillas (633 episodios) | Caídas | 23 | 2 |
| Empujes de 2 m/s, 3 semillas (633 episodios) | Caídas | 150 | 86 |

Sim-to-sim en MuJoCo con el programa de despliegue C++: sin caídas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo es una MLP pequeña (613 → 1024 → 512 → 256 → 23) y el repositorio ocupa 0.0 GB, por lo que la huella de memoria es mínima.
- GPU recomendadas: no disponible; al ser una política de control de baja dimensión, no requiere GPU de datacenter. La inferencia se ejecuta mediante el programa C++ de despliegue de GR00T-WholeBodyControl, no mediante servidores de inferencia de LLM.
- ¿Cabe en GPU consumer? Sí, con toda probabilidad, dado el tamaño reducido de la MLP y la exportación a ONNX; no se especifican modelos concretos en la información disponible.
- Opciones de despliegue: `export_deploy_policy.sh residual residual23` seguido de `deploy.sh --dof-profile g1_23dof --cp policy/residual23/model --obs-config policy/residual23/observation_config.yaml sim` (o `real`), dentro de GR00T-WholeBodyControl (IDSIA). No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| yolkarian/sonic-g1-23dof-residual | Residual MLP sobre SONIC | no disponible (MLP 613→1024→512→256→23) | no aplica | 49,1 mm error raíz; 2 caídas a 1 m/s | NVIDIA Open Model License | Hugging Face (0 descargas) |
| nvidia/GEAR-SONIC | Política fundacional whole-body | no disponible | no aplica | 58,4 mm error raíz; 23 caídas a 1 m/s (sobre 23 DoF) | NVIDIA Open Model License | Hugging Face |
| Otras residuales para G1 | no disponible | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de información sobre otras políticas residuales comparables para el G1 de 23 DoF en la documentación proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; al ser una política de control, los sesgos se manifiestan como desviaciones de seguimiento o comportamientos no deseados, no documentados en la model card.
- Riesgo de alucinación: no aplica en el sentido de LLM, pero existe riesgo de acciones incorrectas fuera de la distribución de entrenamiento (movimientos no representados en BONES-SEED).
- Limitaciones de contexto o idioma: no aplica; el modelo está acotado a la morfología del G1 de 23 DoF y a la interfaz de SONIC (994-D de entrada, 29-D de acción).
- Restricciones de licencia: NVIDIA Open Model License; la residual es un modelo derivado de SONIC, por lo que se heredan las condiciones de la licencia de NVIDIA. Revisar `LICENSE` antes de uso comercial.
- Caveat para producción: el repositorio solo contiene la residual; el decodificador de despliegue debe construirse localmente fusionándola con la release de SONIC. La evaluación es en simulación (211 movimientos held-out y MuJoCo sim-to-sim); no se documentan resultados en hardware real.
- El modelo base SONIC debe descargarse por separado desde nvidia/GEAR-SONIC; sin él, la residual no es funcional.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que limita la validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/yolkarian/sonic-g1-23dof-residual
- Modelo base SONIC: https://huggingface.co/nvidia/GEAR-SONIC
- Repositorio de despliegue GR00T-WholeBodyControl (IDSIA): https://github.com/idsia-leon-group/GR00T-WholeBodyControl
