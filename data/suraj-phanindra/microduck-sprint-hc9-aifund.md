# suraj-phanindra/microduck-sprint-hc9-aifund

## Resumen

`suraj-phanindra/microduck-sprint-hc9-aifund` no es un modelo de lenguaje, sino una política de control motriz (locomotion policy) para el robot cuadrúpedo de bajo coste microduck de Pollen Robotics. Se trata de un fine-tune de `jrubiosainz/microduck-game-sprinter-remix5` obtenido mediante *elitist hill climbing* sobre la puntuación de la Arena, y se distribuye como un artefacto ONNX autocontenido que se carga en una ranura de política del daemon del robot.

La política consume observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, y está diseñada para ejecutarse de forma perpetua: genera una marcha continua hasta que se le indique lo contrario. El normalizador de observaciones está embebido dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo, sin preprocesado adicional.

Su relevancia es acotada y muy específica: sirve como ejemplo de pipeline completo de RL aplicado a robótica de bajo coste (entrenamiento en `pollen-robotics/microduck_rl`, exportación a ONNX y despliegue vía `robotctl`), y como punto de partida para remixes posteriores. No hay información publicada sobre arquitectura de red, número de parámetros, datos de entrenamiento ni licencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de control entrenada por aprendizaje por refuerzo; topología de red no disponible (no se documenta si es MLP u otra) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); espacio de observación de 61 dimensiones por paso |
| Tipos de cuantización | no disponible; el artefacto distribuido es ONNX |
| Idiomas soportados | no aplica (modelo de robótica, sin entrada/salida de texto) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck |

Otros datos verificables: frecuencia de control de 50 Hz, 14 acciones de salida, tamaño del repositorio 0.0 GB, modelo base `jrubiosainz/microduck-game-sprinter-remix5` con relación `finetune`, pipeline declarado `robotics`, librería `microduck`.

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red neuronal (número de capas, anchura, función de activación) ni el algoritmo de RL empleado en el entrenamiento original del modelo base. Lo que sí se documenta es el procedimiento de ajuste: un *elitist hill climbing* sobre la puntuación de la Arena, es decir, una búsqueda evolutiva de tipo escalada con conservación del mejor individuo, guiada por la métrica de evaluación de la Arena en lugar de por una función de recompensa explícita.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, rama `main`, commit `6ff40704a`. El resultado es una política perpetua: no tiene condición de parada interna, sino que produce consigna de marcha de forma indefinida hasta que el operador descarga o sustituye la política en su ranura. El export a ONNX incluye el normalizador de observaciones *baked in*, lo que elimina una fuente habitual de discrepancias entre entrenamiento y despliegue (train/serve skew), pero también implica que cualquier cambio en el acondicionamiento de las observaciones debe hacerse aguas arriba, en el daemon.

## Capacidades

- Generación de marcha continua (política perpetua) para el cuadrúpedo microduck, sin condición de terminación interna.
- Consumo de observaciones de 61 dimensiones en crudo; el normalizador está embebido en el grafo ONNX.
- Emisión de 14 acciones de control a 50 Hz (presupuesto de 20 ms por inferencia).
- Carga y ejecución mediante el comando `robotctl policy load <slot> suraj-phanindra/microduck-sprint-hc9-aifund`.
- Compatibilidad con el manifiesto de políticas esquema 2 del daemon de microduck.
- Base reutilizable para nuevos remixes y fine-tunes por búsqueda evolutiva sobre la Arena.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es un controlador motor, no un modelo generativo.

## Casos de uso

- **Locomoción por defecto del microduck**: cargar la política en una ranura y dejar que el robot mantenga una marcha continua durante sesiones de demo o exhibición, sin lógica de parada adicional en el lado del operador.
- **Punto de partida para nuevos remixes**: al ser un fine-tune por *hill climbing* sobre la Arena, sirve como semilla para posteriores escaladas evolutivas con otros objetivos de puntuación o condiciones de entorno.
- **Docencia e investigación en RL robótico**: permite ilustrar el ciclo completo observación (61-D) → política ONNX → acción (14-D) a 50 Hz sobre hardware de bajo coste, sin necesidad de GPU en el robot.
- **Validación de la infraestructura de políticas**: útil para probar el flujo `robotctl policy load`, la resolución de ranuras y la conformidad con el esquema 2 del manifiesto antes de desplegar políticas propias.
- **Comparación de políticas en la Arena**: permite medir de forma reproducible la puntuación de esta variante frente al modelo base y a otros remixes de la misma familia.
- **Pruebas de robustez en flota**: al ser un artefacto ONNX ligero y sin dependencia de GPU, se puede replicar en varias unidades de microduck para ensayos de repetibilidad de la marcha.
- **Integración en pipelines de CI para robótica**: verificar automáticamente que `policy.onnx` y `manifest.json` cargan correctamente en el daemon tras cada cambio, como test de regresión de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona que el ajuste se guió por la puntuación de la Arena, pero no se proporciona el valor obtenido, ni la métrica exacta, ni la comparación con el modelo base.

## Requisitos de hardware

- **VRAM estimada**: no disponible. El repositorio reporta un tamaño de 0.0 GB, lo que indica un artefacto muy ligero (por debajo del umbral de redondeo), coherente con una política de control de pequeña dimensión; no se especifica el recuento de parámetros.
- **GPU recomendadas**: no disponibles. Por la naturaleza del artefacto (ONNX, 50 Hz, sin requisitos de cómputo declarados), la inferencia está pensada para ejecutarse en la computación embebida del propio microduck o en CPU, no en GPU dedicada.
- **Viabilidad en GPU de consumo**: no aplica según la información disponible; no se documenta ningún requisito de acelerador.
- **Opciones de despliegue**: ONNX Runtime como motor de inferencia, invocado por el daemon de microduck a través de `robotctl policy load`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no son aplicables a este tipo de modelo).
- **Latencia y throughput**: el único dato publicado es la frecuencia de control de 50 Hz, lo que fija un presupuesto de 20 ms por paso de inferencia. No se publican latencias medidas ni margen disponible sobre ese presupuesto.
- **Requisito de plataforma**: el binario `robotctl` y el daemon de microduck, con permisos de superusuario (`sudo`) para cargar la política en una ranura.

## Comparativa con modelos similares

No se dispone de información sobre otras políticas comparables salvo el modelo base del que deriva. La comparación se limita a esa relación:

| Modelo | Relación | Observación / acciones | Frecuencia | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `suraj-phanindra/microduck-sprint-hc9-aifund` | Fine-tune por elitist hill climbing | 61-D / 14 acciones | 50 Hz | ONNX + manifest | no disponible | HuggingFace |
| `jrubiosainz/microduck-game-sprinter-remix5` | Modelo base | 61-D / 14 acciones (heredado) | 50 Hz (heredado) | no disponible | no disponible | HuggingFace |

No se identifican en la información proporcionada otros modelos de la misma categoría (políticas de locomoción para microduck) con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- **Licencia no declarada**: la ausencia de licencia explícita impide asumir permisos de uso comercial, redistribución o modificación; es un bloqueante para producción hasta que el autor la especifique.
- **Sin métricas de rendimiento**: no se publica la puntuación de Arena obtenida ni ningún resultado de evaluación, por lo que no hay evidencia cuantitativa de que esta variante supere al modelo base.
- **Documentación de entrenamiento incompleta**: se desconoce la topología de red, el volumen de datos, el simulador empleado y el protocolo exacto de evaluación, lo que dificulta la reproducibilidad.
- **Riesgo de brecha sim-a-real (sim-to-real gap)**: una política entrenada en simulación y ajustada por escalada evolutiva sobre una métrica de Arena puede degradarse en condiciones físicas no representadas durante el entrenamiento (superficies, carga, desgaste de servos).
- **Política perpetua sin parada interna**: no incluye condición de terminación; cualquier parada debe gestionarse externamente en el daemon o con el hardware. Un fallo en la capa de control deja al robot ejecutando consigna indefinidamente.
- **Normalizador embebido**: al estar el normalizador dentro del grafo ONNX, modificar el acondicionamiento de observaciones requiere sustituir el artefacto, no solo el preprocesado del cliente.
- **Ámbito de uso restringido**: el modelo está acoplado a la morfología y al espacio de observación/acción del microduck; no es transferible a otro robot sin reentrenamiento.
- **Sin capacidades lingüísticas**: no procesa texto, no soporta instrucciones en lenguaje natural y no debe evaluarse con métricas de LLM (MMLU, HumanEval, GSM8K).
- **Tamaño de repositorio 0.0 GB**: conviene verificar que los artefactos (`policy.onnx`, `manifest.json`) están efectivamente subidos y son descargables antes de integrarlo en un pipeline.
- **Sesgos**: no disponible; no se documenta ningún análisis de sesgo, si bien en políticas motoras el equivalente serían sesgos de entorno y de distribución de condiciones de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/suraj-phanindra/microduck-sprint-hc9-aifund
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix5
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `main`, commit `6ff40704a`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (referenciado en la model card)

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los únicos enlaces verificables son los anteriores, extraídos de la model card y de los metadatos de HuggingFace.
