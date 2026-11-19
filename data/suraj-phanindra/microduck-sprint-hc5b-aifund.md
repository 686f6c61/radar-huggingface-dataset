# suraj-phanindra/microduck-sprint-hc5b-aifund

## Resumen

microduck-sprint-hc5b-aifund es una política de control para el robot cuadrúpedo microduck de Pollen Robotics, publicada por el usuario suraj-phanindra en Hugging Face. No se trata de un modelo de lenguaje, sino de una política de refuerzo (reinforcement learning) entrenada para generar una marcha (gait) que se carga en una ranura de política del daemon del robot. El modelo parte de juicenv/microduck-sprint-auto10161753 y se ha ajustado mediante elitist hill climb sobre la puntuación de Arena, según indica la model card.

La política es perpetua: una vez cargada, el robot ejecuta la marcha de forma continua hasta recibir instrucción contraria. El espacio de observación es de 61 dimensiones y el de acciones de 14, con una frecuencia de control de 50 Hz. El artefacto principal es un fichero ONNX (`policy.onnx`) que incluye el normalizador de observaciones, de modo que el robot debe alimentarse con observaciones en bruto.

La relevancia de esta ficha es acotada: se trata de un artefacto experimental de robótica con cero descargas y cero likes en el momento de la consulta, repo de 0.0 GB y licencia no especificada. No hay información pública sobre arquitectura de red, número de parámetros ni resultados de benchmarks, por lo que muchos campos quedan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL exportada a ONNX; red neuronal de control) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (artefacto distribuido en ONNX) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La arquitectura interna de la red no está documentada en la información disponible. Lo que sí se conoce es la interfaz: observación de 61 dimensiones, 14 acciones y bucle de control a 50 Hz, con el normalizador de observaciones embebido en el propio ONNX. El modelo es una política perpetua, es decir, no orientada a episodios con condición de terminación, sino a mantener una marcha de forma indefinida.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl` (rama `main`, commit `5cee942d8`). El procedimiento descrito es un elitist hill climb sobre la puntuación de Arena, aplicado como ajuste fino (finetune) sobre juicenv/microduck-sprint-auto10161753. La model card indica además que se trata de una reentrada ("re-entry") de suraj-phanindra/microduck-sprint-hc5-aifund. No se detallan número de tokens, composición de dataset, ni uso de RLHF/DPO (conceptos que no aplican a este tipo de artefacto).

## Capacidades

- Generación de una marcha (gait) para el robot microduck, ejecutada de forma perpetua hasta que se le indique lo contrario.
- Consumo de observaciones en bruto de 61 dimensiones y emisión de 14 acciones a 50 Hz.
- Carga en una ranura de política del daemon del robot mediante `robotctl policy load`.
- Normalización de observaciones integrada en el artefacto ONNX, sin necesidad de preprocesado externo.
- No dispone de capacidades de lenguaje, visión, tool calling, agentes, razonamiento multi-paso ni multilingüismo.

## Casos de uso

- Marcha por defecto en un microduck: cargar la política en una ranura y dejar que el robot se desplace de forma continua en entornos de laboratorio o demo, gracias a su naturaleza perpetua.
- Comparación de marchas en experiments de RL: al ser una variante ajustada por hill climb sobre la puntuación de Arena, sirve como punto de comparación frente a otras políticas de la misma familia (hc6, hc9, etc.).
- Pruebas de integración del daemon: validar el pipeline `robotctl policy load` y el formato `manifest.json` schema 2 con un artefacto real.
- Evaluación de robustez en banco de pruebas: al recibir observaciones en bruto y normalizarlas internamente, permite probar el comportamiento del robot con distintas condiciones de sensores sin tocar el preprocesado.
- Docencia e investigación en robótica de refuerzo: usar la política como ejemplo mínimo de artefacto ONNX cargable en hardware real para ilustrar el ciclo observación-acción a 50 Hz.
- Reentrenamiento y ajuste: servir de base para nuevos finetunes por hill climb sobre la puntuación de Arena, dado que el modelo base y el procedimiento están documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de una política de control exportada a ONNX, es previsible que el requisito sea muy bajo, pero no hay datos publicados.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el artefacto está pensado para ejecutarse en el propio robot microduck, no en un servidor.
- Opciones de despliegue: runtime ONNX dentro del daemon microduck, cargado mediante `robotctl policy load <slot> suraj-phanindra/microduck-sprint-hc5b-aifund`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: el bucle de control opera a 50 Hz (periodo de 20 ms), según la model card; no se publican latencias medidas por inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Ajuste | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| suraj-phanindra/microduck-sprint-hc5b-aifund | Política RL ONNX | juicenv/microduck-sprint-auto10161753 | Elitist hill climb (Arena) | no disponible | Hugging Face, 0 descargas |
| suraj-phanindra/microduck-sprint-hc6-aifund | Política RL ONNX | no disponible en la búsqueda | Hill climb (variante hc6) | no disponible | Hugging Face |
| suraj-phanindra/microduck-sprint-hc9-aifund | Política RL ONNX | no disponible en la búsqueda | Hill climb (variante hc9) | no disponible | Hugging Face |
| juicenv/microduck-sprint-auto10161753 | Política RL (modelo base) | no disponible | Entrenamiento automático | no disponible | Hugging Face |

Los tres modelos de la familia comparten interfaz (61-D observación, 14 acciones, 50 Hz) y procedimiento de ajuste; las diferencias de rendimiento entre variantes no están publicadas.

## Limitaciones y advertencias

- Licencia no especificada: no hay autorización explícita para uso comercial ni para redistribución; conviene contactar con el autor antes de cualquier despliegue en producción.
- Cero descargas y cero likes en el momento de la consulta: artefacto sin validación comunitaria ni evidencia de uso en robots reales.
- Sin documentación de arquitectura, número de parámetros ni datos de entrenamiento: imposible auditar el comportamiento o estimar riesgos de sobreajuste.
- Naturaleza perpetua: la política no tiene condición de terminación propia, por lo que requiere supervisión externa para detener el robot.
- Dependencia de la versión del daemon y del esquema `manifest.json` schema 2: cambios en el daemon o en el formato pueden romper la carga.
- Sin benchmarks ni métricas de Arena publicadas: no se puede comparar objetivamente con las variantes hc5, hc6 o hc9.
- No aplica a tareas de lenguaje, visión o agentes; cualquier expectativa en ese sentido es un mal uso del artefacto.
- Riesgo de alucinación: no aplica (no genera texto); el riesgo equivalente es un comportamiento motor imprevisto en condiciones de observación fuera de distribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/suraj-phanindra/microduck-sprint-hc5b-aifund
- Modelo base: https://huggingface.co/juicenv/microduck-sprint-auto10161753
- Variante hc6: https://huggingface.co/suraj-phanindra/microduck-sprint-hc6-aifund
- Variante hc9: https://huggingface.co/suraj-phanindra/microduck-sprint-hc9-aifund
- Repositorio de entrenamiento: https://github.com/pollen-robotics/microduck_rl (rama `main`, commit `5cee942d8`)
- Robot microduck: https://github.com/pollen-robotics/microduck
