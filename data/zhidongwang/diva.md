# ZhidongWang/DIVA

## Resumen

DIVA es un sistema de conducción autónoma extremo a extremo presentado en el artículo *Beyond Planning: Differentiable Control-in-the-loop End-to-End Autonomous Driving*. Lo desarrolla ZhidongWang y se distribuye como checkpoints de referencia en HuggingFace, con el código, el entrenamiento y la evaluación en un repositorio de GitHub independiente. No es un modelo de lenguaje: es un agente de conducción que combina un planificador y una cabeza de control aprendida.

La propuesta técnica central es sustituir el controlador clásico ajustado a mano (PID o similar) por una cabeza de control neuronal que emite acelerador, freno y volante. Durante el entrenamiento, las acciones de esa cabeza se propagan a través de un modelo de vehículo diferenciable identificado sobre el vehículo ego de CARLA (`vehicle.lincoln.mkz_2020`, CARLA 0.9.15) y se supervisan los estados resultantes. Planificador y control se entrenan conjuntamente, en una sola etapa y desde cero.

Es relevante porque ataca el desacoplamiento habitual entre planificación y control en pipelines end-to-end: mantiene las salidas explícitas del planificador (ruta y velocidad objetivo) pero cierra el bucle de control de forma diferenciable. El checkpoint principal (`diva.pt`) ocupa 53 MB y reporta en Bench2Drive-220 cerrado, con la regla de stop activada y en una única ejecución, un Driving Score de 86,73 y una Success Rate del 71,7 %.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Planificador (backbone TransFuser++) + cabeza de control aprendida, con modelo de vehículo diferenciable en el bucle de entrenamiento |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`): `diva.pt` (53 MB), `stop_head.pt` (19 MB), `calib_raw.tar.gz` (55 MB) |

## Arquitectura y entrenamiento

DIVA mantiene la estructura de dos cabezas sobre un backbone de percepción y planificación: el planificador produce ruta y velocidad objetivo, y una cabeza de control aprendida traduce ese estado en acelerador, freno y volante. El backbone es TransFuser++, cuyos pesos `all_towns` (`model_0030_2.pth`) proceden del proyecto carla_garage y no se incluyen en el repositorio; son necesarios para la caché de características y para el agente.

La innovación está en el bucle de entrenamiento: los "action knots" de la cabeza de control se propagan a través de un modelo de vehículo diferenciable, identificado offline a partir de los logs de calibración de CARLA incluidos en `calib_raw.tar.gz`. La supervisión se aplica sobre los estados resultantes del vehículo, no solo sobre las acciones. Planificador y cabeza de control se entrenan conjuntamente en una única etapa, desde cero. El repositorio incluye además un detector de señales de stop (`stop_head.pt`) que implementa la regla opcional de parada, activada por defecto mediante `DIVA_STOP_RULE=1`. No se detallan en la información disponible el número de tokens, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Conducción autónoma extremo a extremo en entornos CARLA, con salidas de acelerador, freno y volante.
- Planificación explícita de ruta y velocidad objetivo, expuestas como salidas del planificador.
- Control en bucle cerrado mediante una cabeza aprendida, sin controlador PID ajustado a mano.
- Detección de señales de stop con una regla de parada configurable (`DIVA_STOP_RULE`).
- Evaluación sobre Bench2Drive-220 con los scripts oficiales.
- Ejecución en seco sin servidor CARLA (`agent_dry_run`), recorriendo el agente a través del modelo de vehículo.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo de razonamiento.

## Casos de uso

- Investigación en conducción end-to-end: reproducir el resultado de Bench2Drive-220 con `diva.pt` y los scripts oficiales para comparar variantes de planificador y control.
- Estudio del control diferenciable: usar el modelo de vehículo identificado y los logs de calibración para analizar cómo afecta el bucle diferenciable al entrenamiento conjunto.
- Evaluación de reglas de seguridad: activar o desactivar `DIVA_STOP_RULE` y medir el impacto del detector `stop_head.pt` en la tasa de éxito.
- Desarrollo de agentes CARLA: integrar el checkpoint en el pipeline de carla_garage sustituyendo el controlador clásico por la cabeza aprendida.
- Pruebas de regresión sin simulador: emplear `agent_dry_run` en CI para validar que el agente carga y produce acciones coherentes antes de lanzar evaluaciones completas.
- Transferencia a otros vehículos: reutilizar la metodología de identificación de vehículo con nuevos logs de calibración para adaptar la cabeza de control a otra plataforma.

## Benchmarks y rendimiento

| Benchmark | Configuración | Driving Score | Success Rate |
|---|---|---|---|
| Bench2Drive-220 (bucle cerrado) | `diva.pt`, regla de stop activada, ejecución única | 86,73 | 71,7 % |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El checkpoint principal pesa 53 MB y el detector de stop 19 MB, pero el backbone TransFuser++ externo condiciona el consumo real.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: scripts oficiales de evaluación (`scripts/eval_bench2drive.sh`) y `diva.tools.agent_dry_run`; requiere un servidor CARLA 0.9.15 para la evaluación en bucle cerrado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros agentes de conducción end-to-end comparables (por ejemplo, variantes de carla_garage o TransFuser++) con los que establecer una comparación de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- El resultado de Bench2Drive-220 corresponde a una única ejecución; no se reporta media ni desviación entre semillas.
- El backbone TransFuser++ no se distribuye con el modelo: hay que obtener `model_0030_2.pth` de carla_garage, lo que añade una dependencia externa y posibles desajustes de versión.
- El modelo está calibrado sobre `vehicle.lincoln.mkz_2020` en CARLA 0.9.15; su validez fuera de esa configuración no está documentada.
- La licencia no está indicada, por lo que no puede confirmarse el uso comercial.
- No hay información sobre sesgos, tasas de alucinación ni comportamiento fuera de distribución más allá de lo que mide Bench2Drive.
- El repositorio tiene 0 descargas y 0 likes, y el tamaño total es de 0,1 GB; se trata de un artefacto de investigación sin validación comunitaria.
- La regla de stop está activada por defecto y su efecto sobre las métricas debe tenerse en cuenta al comparar con otros agentes.

## Enlaces

- HuggingFace: https://huggingface.co/ZhidongWang/DIVA
- Repositorio de código: https://github.com/WangZhiDong2000/DIVA-Differentiable-Control-in-the-Loop-End-to-End-Autonomous-Driving
- Backbone TransFuser++ (carla_garage): https://github.com/autonomousvision/carla_garage
