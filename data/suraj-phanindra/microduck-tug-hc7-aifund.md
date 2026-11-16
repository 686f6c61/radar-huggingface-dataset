# suraj-phanindra/microduck-tug-hc7-aifund

## Resumen

`microduck-tug-hc7-aifund` es una política de control para el robot cuadrúpedo de código abierto microduck de Pollen Robotics, publicada por el usuario suraj-phanindra. No se trata de un modelo de lenguaje, sino de una red neuronal de política entrenada por refuerzo que genera una marcha (gait) continua a 50 Hz a partir de observaciones proprioceptivas del robot. El modelo se distribuye en formato ONNX e incluye el normalizador de observaciones embebido en el propio grafo, de modo que la política consume observaciones en crudo.

Técnicamente es un *finetune* por perturbación de pesos sobre `GinDuck/microduck-tug-titan-league`, seleccionado mediante búsqueda aleatoria y validado en combates del simulador Arena. La política resultante es perpetua: se ejecuta indefinidamente hasta que el operador la detiene o carga otra política en la ranura correspondiente. La observación tiene 61 dimensiones y el espacio de acciones 14 dimensiones, con una frecuencia de control de 50 Hz.

Su relevancia es acotada pero concreta: forma parte del ecosistema de robótica de bajo coste de Pollen Robotics y demuestra un flujo de trabajo de *remix* de políticas por búsqueda aleatoria sobre pesos, con validación en simulación, para obtener marchas alternativas sin reentrenar desde cero. El repositorio no contiene información sobre arquitectura de red, número de parámetros ni datos de entrenamiento más allá de la referencia al repositorio `pollen-robotics/microduck_rl`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL para control robótico; red neuronal de la que no se detalla topología) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible; se distribuye como `policy.onnx` (probablemente FP32, no confirmado) |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Modelo base | `GinDuck/microduck-tug-titan-league` (finetune) |
| Tamano del repositorio | 0.0 GB (segun Hugging Face) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red (capas, anchura, tipo de capas recurrentes o feed-forward). Lo que sí se especifica es la interfaz: una política que mapea observaciones de 61 dimensiones a 14 dimensiones de acción a 50 Hz, con el normalizador de observaciones integrado en el grafo ONNX. El pipeline declarado es `robotics` y la librería `microduck`, lo que implica que el artefacto está pensado para cargarse directamente en el daemon del robot mediante `robotctl policy load`.

El entrenamiento se describe como un *finetune* sobre `GinDuck/microduck-tug-titan-league` mediante una pequeña perturbación de pesos elegida por búsqueda aleatoria y validada en combates nuevos en el simulador Arena. La composición del tablero de evaluación combina semillas 1, 2 y 4 de `suraj-phanindra/microduck-tug-hc6-aifund` (a su vez construido sobre `jrubiosainz/microduck-tug-h7p1b-aa128e6e` y `jrubiosainz/microduck-tug-cup2l1-c23b073f`) y semillas 3 y 5 de `jrubiosainz/microduck-tug-cup2p1-s3s5-e7d67488`, tomando en cada combate las últimas acciones por semilla. El código de entrenamiento corresponde al repositorio `pollen-robotics/microduck_rl`, rama `main`, commit `5cee942d8`. No se especifican número de tokens, episodios, función de recompensa ni si hubo etapas de RLHF/DPO (conceptos que, por otro lado, no aplican a este tipo de política).

## Capacidades

- Generación de una marcha perpetua para el robot microduck: la política se ejecuta de forma continua hasta que se le indique lo contrario.
- Control a 50 Hz con observaciones proprioceptivas de 61 dimensiones y 14 acciones de salida.
- Normalización de observaciones integrada en `policy.onnx`: acepta observaciones en crudo sin preprocesado externo.
- Carga directa en el daemon del robot mediante `robotctl policy load <slot> <repo>`.
- Compatibilidad con el manifiesto schema 2 de políticas microduck (`docs/policy-manifest.md` en el repositorio del daemon).
- No se declaran capacidades de tool calling, agentes, multilingüismo, visión ni audio; no aplican a este tipo de modelo.

## Casos de uso

- Marcha por defecto en un microduck físico: cargar la política en una ranura con `robotctl policy load` para que el robot camine de forma continua en pruebas de locomoción.
- Evaluación comparativa de marchas: al ser un *remix* por perturbación de pesos, sirve para contrastar en el simulador Arena el comportamiento frente a la política base `GinDuck/microduck-tug-titan-league` y frente a las políticas de las que deriva.
- Base para nuevos *remixes*: el flujo de búsqueda aleatoria sobre pesos y validación en combates es replicable partiendo de esta política como nuevo punto de partida.
- Docencia e investigación en RL aplicado a robótica de bajo coste: permite experimentar con el ciclo completo carga-ejecución-validación en un robot de código abierto sin entrenar desde cero.
- Pruebas de integración del daemon microduck: útil para verificar el pipeline de manifiestos schema 2 y la carga de políticas ONNX en ranuras.
- Demostraciones de locomoción en ferias o laboratorio: la naturaleza perpetua de la política simplifica la puesta en marcha de demostraciones continuas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona validación cualitativa mediante combates en el simulador Arena sobre las semillas 1, 2, 3, 4 y 5, sin cifras de recompensa, tasa de éxito ni comparación numérica con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser una política de control de dimensiones pequeñas (61 observaciones, 14 acciones), la huella debería ser muy reducida, pero no se publica el número de parámetros ni el tamaño del grafo ONNX.
- GPU recomendadas: no disponible. Por la naturaleza del artefacto (ONNX para control a 50 Hz en un robot microduck), es plausible la ejecución en CPU del propio robot o en un equipo de cómputo embebido, pero no se confirma en la información.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: carga mediante el daemon microduck con `robotctl policy load <slot> <repo>`; ejecución del grafo ONNX con un runtime compatible (por ejemplo ONNX Runtime), no especificado por el autor.
- Latencia y throughput: no disponibles; el único dato temporal es la frecuencia de control de 50 Hz.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `suraj-phanindra/microduck-tug-hc7-aifund` | Política RL (finetune por perturbación de pesos) | `GinDuck/microduck-tug-titan-league` | ONNX | no disponible | Hugging Face |
| `GinDuck/microduck-tug-titan-league` | Política RL (modelo base) | no disponible | no disponible | no disponible | Hugging Face |
| `suraj-phanindra/microduck-tug-hc6-aifund` | Política RL (remix previo) | `jrubiosainz/microduck-tug-h7p1b-aa128e6e`, `jrubiosainz/microduck-tug-cup2l1-c23b073f` | no disponible | no disponible | Hugging Face |
| `jrubiosainz/microduck-tug-cup2p1-s3s5-e7d67488` | Política RL (fuente de semillas 3 y 5) | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de parámetros, contexto ni métricas de rendimiento de las alternativas, por lo que la comparación cuantitativa no es posible con la información proporcionada.

## Limitaciones y advertencias

- No se publica licencia: no hay base explícita para uso comercial ni para redistribución modificada; conviene contactar con el autor antes de integrarlo en productos.
- El modelo es un *finetune* por perturbación de pesos validado en simulación (Arena); no se documenta validación en hardware físico ni robustez ante condiciones reales (terrenos irregulares, empujes, fallos de sensores).
- No se detalla la arquitectura ni el número de parámetros, lo que dificulta auditar el comportamiento o estimar requisitos de cómputo.
- La política es perpetua: no incorpora mecanismos de parada segura propios; la seguridad depende del daemon y de la supervisión del operador.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso comunitario ni de validación independiente.
- No hay información sobre sesgos (concepto poco aplicable a una política de control) ni sobre alucinación; el riesgo relevante es el fallo de locomoción o comportamiento imprevisto en el robot.
- No se declaran idiomas ni capacidades lingüísticas: no es un modelo de lenguaje y no debe evaluarse como tal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/suraj-phanindra/microduck-tug-hc7-aifund
- Modelo base: https://huggingface.co/GinDuck/microduck-tug-titan-league
- Remix previo: https://huggingface.co/suraj-phanindra/microduck-tug-hc6-aifund
- Política fuente de semillas 3 y 5: https://huggingface.co/jrubiosainz/microduck-tug-cup2p1-s3s5-e7d67488
- Política fuente `h7p1b-aa128e6e`: https://huggingface.co/jrubiosainz/microduck-tug-h7p1b-aa128e6e
- Política fuente `cup2l1-c23b073f`: https://huggingface.co/jrubiosainz/microduck-tug-cup2l1-c23b073f
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `main`, commit `5cee942d8`)
