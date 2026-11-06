# Unique007/microduck-tug-dat-v3

## Resumen

`microduck-tug-dat-v3` es una política de control para el robot cuadrúpedo de código abierto microduck, desarrollada por el usuario Unique007 y publicada en Hugging Face bajo el pipeline `robotics`. No se trata de un modelo de lenguaje, sino de una política de aprendizaje por refuerzo exportada a ONNX que controla la marcha del robot en el slot `walk`. El modelo consume observaciones de 61 dimensiones y emite 14 acciones a una frecuencia de 50 Hz, operando de forma perpetua hasta recibir una orden de parada.

El modelo forma parte de un experimento denominado "Tug of War", en el que se combina una política propia entrenada con sprint (`d8sprint-200`) con una búsqueda CMA por semilla para los combates de rating. La relevancia es acotada: se trata de un artefacto de investigación dentro del ecosistema microduck, no de un modelo de propósito general, y su utilidad está restringida a usuarios de ese hardware concreto.

La información pública disponible es muy limitada: el repositorio tiene 0 GB, no hay descargas ni likes, no se especifica licencia ni idiomas, y la model card se limita a instrucciones de despliegue y referencias al repositorio de entrenamiento. Por tanto, muchas especificaciones habituales en una ficha de modelo no están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo exportada a ONNX (detalles de red no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye como `policy.onnx`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Slot de politica | `walk` |
| Libreria | `microduck` |
| Pipeline | `robotics` |

## Arquitectura y entrenamiento

La arquitectura interna de la red no se detalla en la model card. Se sabe que es una política de aprendizaje por refuerzo entrenada en el repositorio `pollen-robotics/microduck_rl`, rama `dat/tug-of-war`, commit `a4a7e12ef`, y exportada a ONNX para su ejecución en el robot. La normalización de observaciones está integrada dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones en bruto (sin normalizar).

El nombre `tug-dat-v3` y la descripción indican que el entrenamiento combina una política propia entrenada con sprint (`d8sprint-200`) con una búsqueda CMA (Covariance Matrix Adaptation) por semilla para los combates de rating, en un esquema de "tug of war" entre políticas. No se especifican el número de pasos de entrenamiento, la composición del dataset, ni si hubo fases de RLHF/DPO (conceptos, por otra parte, propios de modelos de lenguaje y no de políticas de control). No hay información sobre innovaciones técnicas como decodificación especulativa o atención lineal, que no aplican a este tipo de artefacto.

## Capacidades

- Control de locomoción del robot microduck en el slot `walk`, con política perpetua que se ejecuta hasta recibir orden de parada.
- Consumo de observaciones de 61 dimensiones y emisión de 14 acciones a 50 Hz.
- Normalización de observaciones integrada en el propio ONNX, lo que simplifica la integración en el daemon.
- Compatibilidad con el manifiesto de políticas microduck (schema 2), lo que permite cargarla mediante `robotctl policy load`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación en locomoción de cuadrúpedos: sirve como política de referencia para comparar estrategias de marcha en el robot microduck, cargándola en el slot `walk` y midiendo estabilidad y velocidad.
- Experimentos de "tug of war" entre políticas: el modelo está diseñado para participar en combates de rating contra otras políticas, lo que permite evaluar de forma comparativa el rendimiento de distintas estrategias de entrenamiento.
- Reproducción de experimentos de RL: al estar vinculado a un commit concreto del repositorio `microduck_rl`, facilita la replicación del pipeline de entrenamiento y la comparación de resultados.
- Despliegue en el robot físico mediante `robotctl policy load walk Unique007/microduck-tug-dat-v3`, útil para validar el comportamiento en hardware real frente a simulación.
- Base para fine-tuning o continuación de entrenamiento: al ser una política exportada a ONNX y vinculada a un repositorio de RL, puede servir como punto de partida para nuevas variantes de marcha.
- Docencia y demos de robótica de código abierto: el ecosistema microduck y la simplicidad de carga mediante `robotctl` permiten usar esta política en talleres o demostraciones de aprendizaje por refuerzo aplicado a robots.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB y no se detalla el tamaño del archivo ONNX.
- GPU recomendadas: no disponible; al ejecutarse en el robot microduck, lo habitual es inferencia en CPU embebida, pero no se confirma en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: `robotctl policy load` sobre el daemon de microduck; el modelo se distribuye como `policy.onnx` con normalización integrada.
- Latencia y throughput estimados: no disponible; la frecuencia de control es de 50 Hz, lo que implica un presupuesto de 20 ms por paso, pero no se publican mediciones reales.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otras políticas microduck comparables con parámetros, contexto o licencia verificables. La comparación con modelos de lenguaje no procede por tratarse de un artefacto de control robótico.

## Limitaciones y advertencias

- Información pública muy escasa: sin licencia declarada, sin idiomas, sin especificaciones de red ni métricas de rendimiento.
- La licencia no está disponible, lo que impide confirmar si se permite uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- El modelo está acoplado al hardware microduck y a su daemon; no es reutilizable fuera de ese ecosistema sin adaptación.
- Al ser una política de RL entrenada mediante "tug of war" y búsqueda CMA por semilla, su comportamiento puede ser frágil fuera de las condiciones de entrenamiento (terrenos, cargas, desgaste del robot).
- No hay información sobre sesgos, alucinación o limitaciones de contexto en el sentido habitual, ya que no es un modelo generativo de texto.
- El repositorio tiene 0 descargas y 0 likes, y un tamaño de 0.0 GB, lo que sugiere que el artefacto puede no estar completamente subido o que su contenido es mínimo; verificar la integridad antes de usarlo.
- No se documentan procedimientos de seguridad ni parada de emergencia más allá de la naturaleza perpetua de la política; el operador debe garantizar mecanismos externos de interrupción.

## Enlaces

- Hugging Face: https://huggingface.co/Unique007/microduck-tug-dat-v3
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl`, rama `dat/tug-of-war`, commit `a4a7e12ef` (no se proporciona URL directa en la información disponible)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa en la información disponible)
