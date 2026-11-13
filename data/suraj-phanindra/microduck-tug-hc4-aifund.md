# suraj-phanindra/microduck-tug-hc4-aifund

## Resumen

microduck-tug-hc4-aifund es una política de control por refuerzo (reinforcement learning) para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. El modelo ha sido publicado por el usuario suraj-phanindra como un fine-tune del checkpoint jrubiosainz/microduck-tug-h7p1b-aa128e6e, entrenado en el simulador Arena. No se trata de un modelo de lenguaje, sino de una política de locomoción que mapea observaciones del robot a acciones de control a 50 Hz.

La política es de tipo "perpetuo": una vez cargada en una ranura de política del demonio robotctl, ejecuta una marcha continua hasta que se le indique lo contrario. Consume observaciones de 61 dimensiones y produce 14 acciones de control. Se distribuye en formato ONNX con un manifiesto JSON que sigue el esquema 2 del manifiesto de políticas de microduck.

Su relevancia es acotada y muy específica: sirve como ejemplo de flujo de trabajo de entrenamiento y despliegue de políticas RL en robótica de bajo coste, con integración directa en el hardware microduck mediante el comando robotctl. La información pública disponible es mínima: el repositorio pesa 0.0 GB, no tiene descargas ni likes, y no se especifican licencia, idiomas ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de reinforcement learning (detalles de red no disponibles) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; observación de 61 dimensiones) |
| Tipos de cuantización | no disponible (distribución en ONNX) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (policy.onnx) y manifiesto JSON (manifest.json, esquema 2) |
| Frecuencia de control | 50 Hz |
| Dimensiones de observación | 61 |
| Dimensiones de acción | 14 |
| Modelo base | jrubiosainz/microduck-tug-h7p1b-aa128e6e |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red neuronal de la política. Se sabe que es una política de reinforcement learning entrenada con el repositorio pollen-robotics/microduck_rl (rama main, commit 5cee942d8) en el simulador Arena. La política base es jrubiosainz/microduck-tug-h7p1b-aa128e6e, y este fine-tune incorpora "las últimas acciones de sus combates de rating" agrupadas por semilla, según la model card.

El modelo incluye un normalizador de observaciones embebido en el propio fichero policy.onnx, de modo que el robot puede alimentar observaciones en bruto sin preprocesado adicional. No se dispone de datos sobre número de tokens, composición del dataset, ni si se emplearon técnicas como RLHF o DPO, que en cualquier caso no aplican a este tipo de política.

## Capacidades

- Locomoción continua del robot cuadrúpedo microduck mediante una marcha perpetua.
- Control a 50 Hz con observaciones de 61 dimensiones y 14 acciones.
- Normalización de observaciones integrada en el ONNX, sin preprocesado externo.
- Carga directa en una ranura de política del demonio robotctl.
- Fine-tune especializado a partir de una política base, con ajuste por semillas de entrenamiento.
- No dispone de capacidades de generación de texto, razonamiento, código, visión, tool calling ni agentes.

## Casos de uso

- Locomoción básica en el robot microduck: cargar la política en una ranura con robotctl para que el robot ejecute una marcha continua en pruebas de laboratorio o demostraciones.
- Investigación en reinforcement learning aplicado a robótica: usar el modelo como punto de partida o referencia para comparar políticas entrenadas en el simulador Arena.
- Docencia y prototipado: servir de ejemplo completo del flujo entrenamiento en simulación, exportación a ONNX y despliegue en hardware real con el manifiesto de política.
- Evaluación de pipelines de control: validar la integración del normalizador embebido y la frecuencia de 50 Hz en el demonio robotctl.
- Experimentación con fine-tuning: reentrenar o ajustar la política base para obtener variantes con distintas marchas y comparar el comportamiento por semilla.
- Pruebas de robustez de locomoción: someter la política perpetua a distintas condiciones del simulador o del entorno físico para caracterizar su estabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El modelo se distribuye como policy.onnx de tamaño muy reducido (el repositorio completo pesa 0.0 GB), por lo que la inferencia es viable en hardware embebido de baja potencia.
- No se especifican requisitos de VRAM ni GPU recomendadas; no disponible.
- No se dispone de datos sobre si cabe en GPU de consumo, ya que el despliegue objetivo es el propio robot microduck.
- Opciones de despliegue: demonio robotctl del ecosistema microduck, cargando el modelo en una ranura de política mediante `sudo robotctl policy load <slot> suraj-phanindra/microduck-tug-hc4-aifund`.
- Latencia y throughput: la política está diseñada para operar a 50 Hz; no se publican cifras de latencia real ni de rendimiento.

## Comparativa con modelos similares

| Modelo | Tipo | Observación / acción | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| suraj-phanindra/microduck-tug-hc4-aifund | Política RL fine-tune | 61 / 14 | 50 Hz | no disponible | Hugging Face |
| jrubiosainz/microduck-tug-h7p1b-aa128e6e | Política RL base | no disponible | no disponible | no disponible | Hugging Face |
| Otras políticas del ecosistema microduck | Políticas RL | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La model card no especifica licencia, lo que impide confirmar si el uso comercial está permitido.
- No se detallan sesgos conocidos ni riesgos de alucinación, ya que no es un modelo generativo de texto.
- El alcance es exclusivamente la locomoción del microduck; no sirve para otras tareas ni plataformas sin reentrenamiento.
- El rendimiento depende del simulador Arena y de las condiciones de entrenamiento; no hay datos de transferencia a hardware real más allá de la instrucción de carga.
- El repositorio no tiene descargas ni likes y su tamaño es de 0.0 GB, lo que sugiere un artefacto mínimo; conviene verificar la integridad de los ficheros antes de desplegar.
- No se especifican idiomas ni soporte multilingüe, irrelevante para este tipo de modelo.
- El entrenamiento se documenta con un único commit (5cee942d8) sin más trazabilidad; no hay información sobre reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/suraj-phanindra/microduck-tug-hc4-aifund
- Modelo base: https://huggingface.co/jrubiosainz/microduck-tug-h7p1b-aa128e6e
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: pollen-robotics/microduck_rl (rama main, commit 5cee942d8)
