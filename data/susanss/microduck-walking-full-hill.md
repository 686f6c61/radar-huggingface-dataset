# SusanSS/microduck-walking-full-hill

## Resumen

`SusanSS/microduck-walking-full-hill` es una política de control por refuerzo (reinforcement learning) para el robot microduck de Pollen Robotics, exportada a ONNX y publicada en HuggingFace. No es un modelo de lenguaje: recibe un vector de observación de 61 dimensiones y emite 14 acciones de control a 50 Hz, de forma continua y sin condición de parada ("perpetual policy"), hasta que el sistema de control la interrumpa. Ocupa el slot `walk` del stack de políticas del robot, es decir, es la marcha que se carga cuando se solicita la habilidad de caminar.

El autor la describe como una política *baseline* de `walking_full` en terreno plano, evaluada sobre una colina de 8 grados de inclinación, con un resultado de 5 finalizaciones de 5 intentos a 0,45 m/s. El repositorio tiene un tamaño de 0,0 GB (solo el ONNX y el manifiesto), no registra descargas ni *likes*, y no declara licencia ni idiomas.

Su relevancia es acotada y muy específica: sirve como referencia reproducible de una marcha funcional para un robot de bajo coste, y como punto de comparación para otras políticas del mismo slot. La información pública disponible es mínima (model card de pocas líneas), por lo que la mayoría de especificaciones cuantitativas quedan como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. Política de control entrenada por refuerzo y exportada a ONNX; la model card no describe la topología de la red (capas, tamaño, tipo de encoder) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: no es un modelo de lenguaje. La entrada es un vector fijo de 61 dimensiones por paso de control |
| Tipos de cuantización | No disponible. Se distribuye un único `policy.onnx`; no se documentan variantes cuantizadas (INT8, FP16, etc.) |
| Idiomas soportados | No aplica: no procesa lenguaje natural |
| Licencia | No disponible (ni en la model card ni en los metadatos de HuggingFace) |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` conforme al schema 2 del manifiesto de políticas de microduck |
| Dimensión de observación | 61 |
| Dimensión de acción | 14 |
| Frecuencia de control | 50 Hz |
| Slot de política | `walk` |
| Preprocesado | Normalizador de observaciones embebido en el ONNX: se alimenta con observaciones en crudo |
| Tamaño del repositorio | 0,0 GB |
| Fecha de publicación | 2026-10-27 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura de la red neuronal: solo indica que es una política de refuerzo exportada a ONNX, con 61 entradas de observación y 14 salidas de acción a 50 Hz, y que el normalizador de observaciones está embebido dentro del propio grafo ONNX. Esto implica que el consumidor debe enviar observaciones sin normalizar; cualquier normalización adicional en el pipeline rompería la política. El artefacto se acompaña de un `manifest.json` que sigue el schema 2 del manifiesto de políticas del daemon de microduck (documentado en `docs/policy-manifest.md` del repositorio del daemon).

El entrenamiento se realizó en el repositorio `pollen-robotics/microduck_rl`, rama `main`, commit `9aaec6db4`. No se especifican el algoritmo de RL empleado, el número de pasos de entorno, la composición del dataset de entrenamiento ni si hubo entrenamiento en simulación y transferencia a real (sim2real). La política se presenta como "perpetual": no tiene condición de terminación aprendida ni horizonte de episodio, y se ejecuta de forma continua hasta que el daemon la descarga o la sustituye.

## Capacidades

- Locomoción continua: genera una marcha estable que se ejecuta indefinidamente hasta que se ordene lo contrario.
- Control a 50 Hz con latencia de paso fija de 20 ms, adecuado para el bucle de control del robot.
- Marcha *baseline* de terreno plano (`walking_full`) que, según el autor, completa ascensos en una colina de 8 grados.
- Velocidad de desplazamiento reportada de 0,45 m/s en el escenario evaluado.
- Integración con el stack de políticas del robot mediante el slot `walk` (`robotctl policy load walk ...`).
- Compatible con el schema 2 del manifiesto de políticas de microduck, lo que permite su carga declarativa por parte del daemon.
- Autocontenida: el normalizador de observaciones va embebido en el ONNX, sin dependencias de preprocessing externo.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es una política motora, no un modelo generativo.

## Casos de uso

- **Marcha por defecto del robot en interiores**: cargar la política en el slot `walk` y dejar que el robot se desplace de forma continua en superficies planas, aprovechando que es una política perpetua que no requiere reinicio por episodio.
- **Navegación en pendientes suaves**: el autor valida 5/5 ascensos en una colina de 8 grados a 0,45 m/s, por lo que es adecuada para rampas de garaje, accesos y desniveles moderados dentro de ese rango.
- **Línea base para comparar políticas**: al ser una política `walking_full` de referencia, sirve para medir mejoras de otras marchas del mismo slot con el mismo protocolo (tasa de finalización y velocidad en pendiente de 8 grados).
- **Componente de un stack jerárquico**: un planificador de alto nivel puede emitir consignas y delegar el control de bajo nivel en esta política, que se ejecuta a 50 Hz sobre las 61 observaciones del robot.
- **Validación del pipeline `robotctl`**: útil para verificar de extremo a extremo la cadena de despliegue (descarga desde HuggingFace, parseo del `manifest.json` schema 2, carga del ONNX y bucle de control a 50 Hz) antes de desplegar políticas propias.
- **Docencia e investigación en RL para robótica de bajo coste**: permite reproducir el flujo completo de entrenamiento (`microduck_rl`) y despliegue en un robot microduck sin partir de cero.
- **Pruebas de robustez y sim2real**: al conocerse el commit exacto de entrenamiento (`9aaec6db4`), se puede reproducir el entorno y comparar el comportamiento en simulación frente al robot físico en la misma pendiente.
- **Teleoperación asistida**: usar la política como capa de estabilización mientras un operador envía consignas de movimiento, reduciendo el trabajo de control manual en tramos planos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible; no aplican a una política motora. El único dato de evaluación es el reportado por el autor en la model card:

| Métrica | Entorno | Resultado | Fuente |
|---|---|---|---|
| Tasa de finalización | Colina de 8 grados | 5/5 | Model card del autor |
| Velocidad de avance | Colina de 8 grados | 0,45 m/s | Model card del autor |
| Frecuencia de control | Inferencia en robot | 50 Hz | Model card del autor |

No se detallan el protocolo de evaluación, el número total de episodios, la semilla, la variabilidad entre ejecuciones ni las condiciones del terreno más allá de la inclinación.

## Requisitos de hardware

- VRAM estimada: no disponible. Por la naturaleza del artefacto (un único ONNX con 61 entradas y 14 salidas) la inferencia está pensada para ejecutarse a bordo del robot, sin GPU dedicada.
- GPU recomendadas: no disponibles; no se documenta ningún requisito de GPU.
- ¿Cabe en GPU de consumo? No aplica según la información disponible: el despliegue descrito es en el propio robot mediante el daemon `robotctl`.
- Opciones de despliegue: daemon de microduck con `sudo robotctl policy load walk SusanSS/microduck-walking-full-hill`; ejecución del `policy.onnx` con cualquier runtime compatible con ONNX (ONNX Runtime, etc.), aunque el runtime concreto del daemon no se especifica.
- Latencia y throughput: el bucle de control opera a 50 Hz, es decir, un presupuesto de 20 ms por paso de control; no se publican medidas de latencia de inferencia ni de uso de CPU.
- Almacenamiento: el repositorio ocupa 0,0 GB.

## Comparativa con modelos similares

No se dispone de información sobre otras políticas publicadas para el mismo robot o el mismo slot en la documentación proporcionada, por lo que la comparación cuantitativa no está disponible.

| Modelo | Tipo | Entrada / salida | Entorno evaluado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `SusanSS/microduck-walking-full-hill` | Política RL exportada a ONNX | 61-D / 14 acciones a 50 Hz | Colina de 8 grados, 5/5 a 0,45 m/s | No disponible | HuggingFace (0 descargas, 0 likes) |
| Otras políticas del slot `walk` para microduck | No disponible | No disponible | No disponible | No disponible | No disponible en la información proporcionada |

Como referencia cualitativa, la alternativa más directa sería reentrenar la política desde `pollen-robotics/microduck_rl` con el mismo commit, o comparar contra la política `walking_full` original de terreno plano, pero no se aportan sus métricas.

## Limitaciones y advertencias

- **Licencia no declarada**: sin licencia explícita no hay autorización clara para uso comercial ni para redistribución; conviene contactar con el autor antes de integrarla en un producto.
- **Validación muy limitada**: el único resultado es 5/5 en una pendiente de 8 grados, sin protocolo detallado, sin número de ensayos independientes ni medidas de varianza. No hay datos sobre pendientes mayores, escaleras, terreno blando o superficies deslizantes.
- **Riesgo de alucinación**: no aplica en el sentido generativo, pero sí existe riesgo de comportamiento fuera de distribución ante observaciones no vistas durante el entrenamiento, con posibles caídas o movimientos erráticos.
- **Dependencia estricta del preprocesado**: el normalizador está embebido en el ONNX y la política espera observaciones en crudo. Cualquier normalización adicional, cambio en el orden o en la escala de las 61 dimensiones invalida el control.
- **Política perpetua sin condición de parada**: se ejecuta indefinidamente hasta que se detiene desde el daemon; no incorpora mecanismos propios de seguridad o de detección de bloqueo.
- **Trazabilidad limitada**: se conoce el repositorio y el commit de entrenamiento (`9aaec6db4`), pero no los hiperparámetros, el número de pasos ni la configuración de simulación, lo que dificulta la reproducción exacta.
- **Madurez del artefacto**: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso por terceros ni de validación independiente.
- **Sin soporte de lenguaje ni multimodalidad**: no puede interpretar instrucciones en lenguaje natural; requiere una capa externa que traduzca objetivos a consignas de control.
- **Alcance de la habilidad**: solo cubre el slot `walk`; no incluye otras habilidades (giros específicos, levantarse, manipulación) más allá de lo que produzca la propia política.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SusanSS/microduck-walking-full-hill
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento citado en la model card: `pollen-robotics/microduck_rl`, rama `main`, commit `9aaec6db4`
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon de microduck (la model card no indica la URL del repositorio)
