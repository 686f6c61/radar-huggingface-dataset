# suraj-phanindra/microduck-roller-hc5b-aifund

## Resumen

`microduck-roller-hc5b-aifund` es una política de control robótico entrenada por refuerzo (reinforcement learning) para el robot microduck, un cuadrúpedo de pequeño tamaño de Pollen Robotics que se desplaza sobre ruedas (rollers). No es un modelo de lenguaje: es una política de locomoción que recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, pensada para ejecutarse de forma continua hasta que se le indique lo contrario. El autor, suraj-phanindra, la publica como un fine-tune de `juicenv/microduck-roller-es21` mediante elitist hill climb sobre la puntuación de Arena.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, sin model card extendida, sin licencia declarada y sin resultados de benchmarks publicados. Su interés práctico reside en el formato de despliegue (ONNX con normalizador de observaciones embebido y manifiesto de política conforme al esquema 2 del daemon de microduck) y en el pipeline de entrenamiento reproducible (`pollen-robotics/microduck_rl`).

No dispone de arquitectura de lenguaje, parámetros en el sentido habitual ni ventana de contexto textual; las filas de la tabla de especificaciones se adaptan a la naturaleza del artefacto e indican "no disponible" cuando el dato no consta en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control por reinforcement learning (detalles de red no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política reactiva; observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | no aplica (modelo de robótica, sin entrada ni salida de texto) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas de microduck) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Modelo base | juicenv/microduck-roller-es21 |
| Metodo de ajuste | Elitist hill climb sobre la puntuación de Arena |
| Libreria | microduck |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red (número de capas, anchura, tipo de capa recurrente o feed-forward). Lo que sí consta es el contrato de interfaz: 61 dimensiones de observación, 14 dimensiones de acción y 50 Hz de frecuencia de control, con un normalizador de observaciones embebido dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo. El comportamiento es perpetuo: la política ejecuta una marcha continua hasta recibir una orden de parada o sustitución.

El entrenamiento se realizó en el repositorio `pollen-robotics/microduck_rl`, rama `main`, commit `5cee942d8`. El autor describe el proceso como un fine-tune de `juicenv/microduck-roller-es21` mediante elitist hill climb evaluando la puntuación de Arena; se trata, por tanto, de una optimización de búsqueda directa sobre política preentrenada, no de un ciclo RLHF/DPO ni de un reentrenamiento desde cero. No consta el número de iteraciones, la composición del dataset de evaluación ni los hiperparámetros del hill climb.

## Capacidades

- Locomoción sobre ruedas del robot microduck a 50 Hz de frecuencia de control.
- Política perpetua: mantiene la marcha de forma indefinida hasta que se le indique lo contrario.
- Consumo de observaciones en crudo gracias al normalizador embebido en el ONNX.
- Carga en una ranura de política del daemon mediante `robotctl policy load`.
- Compatibilidad con el manifiesto de política esquema 2 de microduck.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni capacidades multilingües.

## Casos de uso

- Despliegue de una marcha base en un microduck físico: cargar la política en una ranura con `robotctl policy load <slot> suraj-phanindra/microduck-roller-hc5b-aifund` y alimentar observaciones en crudo para obtener una locomoción continua sobre rollers.
- Evaluación comparativa de políticas en Arena: al estar optimizada explícitamente sobre la puntuación de Arena, sirve como referencia para medir la mejora de otras variantes del mismo linaje (por ejemplo, `hc7-aifund`).
- Punto de partida para nuevos fine-tunes: al derivar de `juicenv/microduck-roller-es21` y documentar commit y repositorio de entrenamiento, es un candidato para continuar la búsqueda con hill climb u otros optimizadores.
- Pruebas de integración del daemon de microduck: útil para validar el pipeline de carga de políticas, el esquema 2 del manifiesto y el consumo de `policy.onnx` con normalizador embebido.
- Inferencia en entornos con restricciones de cómputo: al distribuirse como ONNX, puede ejecutarse con runtimes ONNX estándar en la CPU del robot o en un equipo auxiliar.
- Reproducción de experimentos de RL para robótica: el repositorio `pollen-robotics/microduck_rl` en el commit indicado permite reconstruir el contexto de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona que el ajuste se guió por la puntuación de Arena, sin cifras concretas de recompensa, tasa de éxito ni comparación numérica con el modelo base.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio es de 0.0 GB y el artefacto principal es un `policy.onnx`, por lo que la huella es reducida.
- GPU recomendadas: no disponibles; no se especifica ningún requisito de aceleración.
- Viabilidad en GPU de consumo: no confirmada en la información proporcionada; por el formato ONNX y la naturaleza de la política, es plausible su ejecución en CPU, pero no consta oficialmente.
- Opciones de despliegue: daemon de microduck mediante `robotctl policy load`, con `policy.onnx` y `manifest.json`; runtimes ONNX genéricos como alternativa no documentada por el autor.
- Latencia y throughput: la política opera a 50 Hz, lo que fija un presupuesto de 20 ms por paso de control; no se publican mediciones reales de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Base | Dimension observacion | Dimension accion | Frecuencia | Metodo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| suraj-phanindra/microduck-roller-hc5b-aifund | juicenv/microduck-roller-es21 | 61 | 14 | 50 Hz | Elitist hill climb sobre Arena | no disponible | Hugging Face, 0 descargas |
| juicenv/microduck-roller-es21 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | Hugging Face (modelo base) |
| suraj-phanindra/microduck-roller-hc7-aifund | no disponible | no disponible | no disponible | no disponible | Variante hc7 del mismo linaje | no disponible | Hugging Face |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; no se documenta el comportamiento de la política ante perturbaciones, terrenos distintos o fallos del robot.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de acciones no verificadas fuera de las condiciones de entrenamiento.
- Limitaciones de contexto o idioma: no aplica; la política no procesa texto ni contexto lingüístico.
- Restricciones de licencia: la licencia no está declarada, lo que impide confirmar si se permite el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Artefacto sin validación comunitaria: cero descargas y cero likes en el momento de la consulta, sin métricas publicadas de éxito en robot real.
- Dependencia del daemon: el despliegue requiere el ecosistema microduck y el esquema 2 del manifiesto de políticas.
- Sin información sobre robustez: no consta evaluación ante cambios de carga, batería, fricción o desgaste de los rollers.
- Repositorio de tamaño 0.0 GB: conviene verificar la integridad de los archivos descargados antes de cargarlos en un robot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/suraj-phanindra/microduck-roller-hc5b-aifund
- Modelo base: https://huggingface.co/juicenv/microduck-roller-es21
- Variante relacionada: https://huggingface.co/suraj-phanindra/microduck-roller-hc7-aifund
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl` (rama `main`, commit `5cee942d8`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon de microduck
