# suraj-phanindra/microduck-heist-a950-aifund

## Resumen

`microduck-heist-a950-aifund` es un checkpoint de política de aprendizaje por refuerzo (reinforcement learning) publicado por el usuario suraj-phanindra para el robot cuadrúpedo de código abierto microduck de Pollen Robotics. No se trata de un modelo de lenguaje, sino de una política de control motriz: recibe una observación de 61 dimensiones y emite 14 acciones a 50 Hz, empaquetada en formato ONNX para su ejecución directa sobre el robot.

El modelo corresponde al checkpoint 950 de una ejecución PPO (Proximal Policy Optimization) sobre la receta `Mjlab-SockHeist6m-MicroDuck` con 4096 entornos paralelos, y se presenta como hermano de `heist-ppo1-aifund` (checkpoint 999). Su comportamiento es el de una política "perpetua": ejecuta una marcha continua hasta que se le indique lo contrario, cargándose en una ranura de política del daemon del robot mediante `robotctl`.

Su relevancia es acotada pero concreta: demuestra el flujo completo de entrenamiento en simulación (MuJoCo/MJLab) y despliegue sim-to-real en un robot de bajo coste, con normalizador de observaciones embebido en el propio ONNX. El repositorio tiene 0 descargas, 0 likes y un tamaño de 0.0 GB en el momento de la consulta, lo que sugiere un artefacto de publicación reciente o de prueba.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de reinforcement learning (PPO) exportada a ONNX; arquitectura de red no especificada en la model card |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); observación de 61 dimensiones por paso |
| Tipos de cuantización | no disponible (se distribuye como `policy.onnx`) |
| Idiomas soportados | no aplica (modelo de robótica, sin entrada/salida de texto) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` (schema 2 del manifiesto de políticas de microduck) |
| Frecuencia de control | 50 Hz |
| Dimensiones de observación | 61 |
| Dimensiones de acción | 14 |
| Algoritmo de entrenamiento | PPO |
| Entornos de entrenamiento | 4096 |
| Checkpoint | 950 |
| Receta de entrenamiento | `Mjlab-SockHeist6m-MicroDuck` |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red neuronal (número de capas, anchura, funciones de activación). Lo que sí se documenta es el pipeline: entrenamiento mediante PPO en el repositorio `pollen-robotics/microduck_rl` (rama `main`, commit `5cee942d8`), usando la receta `Mjlab-SockHeist6m-MicroDuck` con 4096 entornos simulados en paralelo. El checkpoint publicado es el paso 950 de esa ejecución, mientras que el modelo hermano `heist-ppo1-aifund` corresponde al paso 999 de la misma familia de entrenamiento.

Una innovación práctica destacable es que el normalizador de observaciones está embebido dentro de `policy.onnx`: el consumidor puede alimentar observaciones en bruto sin aplicar preprocesado externo, lo que reduce errores de integración sim-to-real. El artefacto se acompaña de `manifest.json` conforme al schema 2 del manifiesto de políticas del daemon de microduck (documentado en `docs/policy-manifest.md` del repositorio del daemon), lo que permite cargarlo directamente en una ranura de política del robot.

## Capacidades

- Control locomotor de un robot cuadrúpedo microduck: genera comandos motores continuos a 50 Hz a partir de 61 observaciones.
- Política perpetua: mantiene la marcha indefinidamente hasta que se le indique lo contrario (no es una habilidad puntual con terminación).
- Despliegue directo en hardware mediante `robotctl policy load <slot> suraj-phanindra/microduck-heist-a950-aifund`.
- Inferencia en formato ONNX, ejecutable con runtimes ONNX estándar sin dependencia de frameworks de deep learning pesados.
- Normalización de observaciones integrada en el grafo ONNX.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Investigación en locomoción de cuadrúpedos: sirve como línea base reproducible para comparar recetas de entrenamiento PPO (por ejemplo, frente al checkpoint 999 del modelo hermano) en el mismo robot y simulador.
- Despliegue sim-to-real en microduck: cargar la política en una ranura con `robotctl` permite validar en hardware la transferencia de una marcha entrenada en MJLab con 4096 entornos.
- Benchmarking de pipelines de RL: al publicarse el commit exacto (`5cee942d8`) y la receta (`Mjlab-SockHeist6m-MicroDuck`), el checkpoint sirve para auditar la reproducibilidad del entrenamiento en `microduck_rl`.
- Docencia y prototipado en robótica de bajo coste: el formato ONNX con normalizador embebido simplifica el ejercicio de integrar una política en un robot real sin infraestructura de entrenamiento.
- Pruebas de integración del daemon: el `manifest.json` con schema 2 permite validar el flujo de carga de políticas del daemon de microduck en entornos de desarrollo.
- Evaluación comparativa de checkpoints intermedios: comparar el paso 950 con el 999 permite estudiar la evolución de la recompensa y la estabilidad de la marcha a lo largo del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, tasas de éxito, velocidad de marcha ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio figura como 0.0 GB y la arquitectura de red no se especifica, por lo que no puede estimarse con rigor.
- GPU recomendadas: no disponibles. Al ser una política de control a 50 Hz con observación de 61 dimensiones, es plausible que la inferencia en CPU sea suficiente, pero este dato no está confirmado en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: runtime ONNX sobre el daemon de microduck mediante `robotctl policy load`; otros runtimes ONNX estándar no están documentados en la model card.
- Latencia y throughput: no disponibles; el único dato temporal es la frecuencia de control de 50 Hz.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / observación | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `suraj-phanindra/microduck-heist-a950-aifund` | no disponible | 61-D obs., 14 acciones, 50 Hz | no disponible | no disponible | Hugging Face (0 descargas) |
| `suraj-phanindra/heist-ppo1-aifund` (checkpoint 999) | no disponible | misma receta heistA | no disponible | no disponible | Hugging Face (referenciado en la model card) |

No se dispone de información sobre otras políticas comparables para microduck en la documentación proporcionada.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no puede asumirse permiso para uso comercial, redistribución o modificación; es imprescindible contactar con el autor antes de cualquier uso en producción.
- Sin métricas publicadas: no hay datos de recompensa, robustez ni tasa de éxito que permitan evaluar la calidad de la marcha frente a alternativas.
- Arquitectura de red no documentada: dificulta auditorías de seguridad y estimaciones de coste computacional.
- Comportamiento "perpetuo": la política ejecuta la marcha hasta que se le indique lo contrario, lo que exige mecanismos externos de parada segura en el robot.
- Riesgo de fallo sim-to-real: no se documentan pruebas en hardware físico ni condiciones de dominio (terrenos, cargas, desgaste) bajo las cuales la política haya sido validada.
- Checkpoint intermedio (950) frente al final (999): puede presentar menor madurez que el modelo hermano, aunque esto no está cuantificado.
- Sin soporte de lenguaje, visión ni audio: cualquier caso de uso fuera del control locomotor de microduck queda fuera de su alcance.
- Repositorio sin descargas ni likes: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/suraj-phanindra/microduck-heist-a950-aifund
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `main`, commit `5cee942d8`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon de microduck
