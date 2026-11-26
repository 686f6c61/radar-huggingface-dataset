# ttktjmt/g1-whole-body-tracking-100style-neutral-fw

## Resumen

`g1-whole-body-tracking-100style-neutral-fw` es una política de control entrenada con aprendizaje por refuerzo (PPO) para el robot humanoide Unitree G1, orientada a la tarea de *whole-body tracking* (seguimiento de movimiento de todo el cuerpo). La publica el usuario `ttktjmt` bajo el paraguas del proyecto `mjswan_playground`, y se apoya en el entorno `G1WholeBodyTracking` de MuJoCo Playground 1.1.0. No es un modelo de lenguaje: es un artefacto de robótica con pesos de política exportados a ONNX y checkpoints de `rsl-rl`.

El modelo resuelve un problema concreto: reproducir de forma estable una secuencia de movimiento de referencia sobre el esqueleto del G1 en simulación física. La referencia es el paseo neutro hacia delante del dataset 100STYLE (Ian Mason, CC BY 4.0), reorientado al cuerpo del G1 mediante el script `reaf/retarget_100style.py`. El resultado es una política que, dado el estado del robot y la referencia, emite acciones de control conjuntas.

Su relevancia es limitada pero clara para quien trabaja en locomoción de humanoides con MuJoCo: proporciona un punto de partida reproducible (checkpoints, contrato de observación/acción y referencia en NPZ) para entrenar y desplegar políticas de seguimiento corporal completo en un simulador estándar. El repositorio pesa 0.0 GB, lo que sugiere que los ficheros son pequeños (política y checkpoints ligeros).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal entrenada con PPO (algoritmo de RL); arquitectura de red no detallada en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (export ONNX; no se documentan niveles de cuantización) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`), checkpoints `rsl-rl`, referencia en NPZ (`reference.npz`), contrato en JSON (`contract.json`) |

## Arquitectura y entrenamiento

La política se entrena con PPO sobre el entorno `G1WholeBodyTracking` de MuJoCo Playground 1.1.0, usando el script `reaf/train.py` de `mjswan_playground`. El bucle de entrenamiento opera en simulación física con el modelo del humanoide Unitree G1, y la recompensa deriva del seguimiento de una secuencia de referencia de movimiento. No se documenta en la información disponible el número de pasos de entorno, el tamaño de la red, ni la composición del dataset más allá de la referencia de movimiento.

La referencia de movimiento procede del paseo neutro hacia delante de 100STYLE (CC BY 4.0), reorientado al G1 con `reaf/retarget_100style.py`. El repositorio incluye `checkpoints/` con los estados de `rsl-rl` (el más reciente permite reanudar el entrenamiento), y el export que consume una escena `mjswan`: `policy.onnx`, `contract.json` y `reference.npz`. El contrato JSON es la pieza que define la interfaz entre política y escena; no se detalla su contenido en la información disponible.

## Capacidades

- Control de locomoción de cuerpo completo del humanoide Unitree G1 en simulación MuJoCo.
- Seguimiento de una secuencia de referencia de movimiento concreta: paseo neutro hacia delante de 100STYLE.
- Emisión de acciones de control conjuntas a partir del estado del robot y la referencia (interfaz definida en `contract.json`).
- Export a ONNX para inferencia en una escena `mjswan`.
- Reanudación del entrenamiento desde checkpoints `rsl-rl`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Reproducción de referencia de marcha en simulación: cargar `policy.onnx` y `reference.npz` en una escena `mjswan` para visualizar y validar el seguimiento del paseo neutro sobre el G1 antes de plantear transferencia a hardware.
- Punto de partida para *fine-tuning* con PPO: reanudar desde `checkpoints/` y sustituir la referencia por otras secuencias retargetizadas con `reaf/retarget_100style.py`, ampliando el repertorio de movimientos.
- Evaluación de entornos de RL para humanoides: usar esta política como baseline reproducible del entorno `G1WholeBodyTracking` de MuJoCo Playground 1.1.0 en experimentos comparativos.
- Integración en pipelines de simulación a hardware: el export ONNX permite desplegar la política en un runtime de inferencia junto al controlador del G1, con la referencia sincronizada desde `reference.npz`.
- Docencia y divulgación de robótica: ejemplo completo y ligero (repo de 0.0 GB) de un flujo extremo a extremo que va del dataset de movimiento al controlador entrenado.
- Validación de *retargeting*: comparar el resultado del retargeting de 100STYLE al G1 midiendo la fidelidad de seguimiento de la política entrenada sobre esa referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio pesa 0.0 GB y la política se exporta a ONNX, por lo que se espera un consumo muy bajo, pero no se documenta una cifra.
- GPU recomendadas: no disponible. Para entrenamiento con PPO sobre MuJoCo Playground se requiere una GPU, pero no se especifica modelo.
- Cabe en GPU de consumo: probablemente sí por el tamaño del artefacto, aunque no se confirma en la información disponible.
- Opciones de despliegue: inferencia ONNX (runtime estándar) dentro de una escena `mjswan`; entrenamiento con `rsl-rl` y MuJoCo Playground 1.1.0.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Robot | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| g1-whole-body-tracking-100style-neutral-fw | Política PPO (ONNX) | Unitree G1 | Whole-body tracking, 1 referencia | no disponible | Hugging Face |
| Políticas de MuJoCo Playground (G1WholeBodyTracking) | Entornos y políticas de referencia | Unitree G1 | Whole-body tracking | según proyecto | Repositorio de MuJoCo Playground |
| Políticas de rsl-rl / legged_gym | Políticas PPO | Varios humanoides y cuadrúpedos | Locomoción y seguimiento | según proyecto | Repositorios públicos |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, código ni responde a prompts; cualquier uso en ese sentido es inválido.
- Entrenado para una única referencia de movimiento (paseo neutro hacia delante de 100STYLE); el comportamiento fuera de esa distribución no está garantizado.
- Entrenado en simulación MuJoCo; no se documenta validación en hardware real ni robustez ante perturbaciones.
- La licencia no está disponible, lo que impide confirmar si el uso comercial está permitido; la referencia de movimiento original es CC BY 4.0 y exige atribución.
- No se documentan sesgos, tasas de alucinación (no aplica) ni límites de contexto o idioma por no ser un modelo lingüístico.
- El repositorio no incluye métricas de éxito de seguimiento, lo que dificulta evaluar su calidad sin ejecutar la simulación.
- El contenido del `contract.json` no se detalla; la integración requiere inspeccionarlo para conocer el espacio de observación y acción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ttktjmt/g1-whole-body-tracking-100style-neutral-fw
- Dataset 100STYLE (Ian Mason): https://ianxmason.github.io/100style/
- MuJoCo Playground: no disponible en la información proporcionada
- Repositorio `mjswan_playground`: no disponible en la información proporcionada
