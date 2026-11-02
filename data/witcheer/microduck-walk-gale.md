# witcheer/microduck-walk-gale

## Resumen

`microduck-walk-gale` es una política de control por aprendizaje por refuerzo para el robot cuadrúpedo de código abierto Microduck de Pollen Robotics. La desarrolla el usuario independiente witcheer y resuelve un problema concreto: mantener la marcha hacia delante bajo un viento en contra constante de hasta 3,0 N, aproximadamente el 38 % del peso del robot (7,8 N). No es un modelo de lenguaje, sino un controlador neuronal exportado a ONNX que ocupa el slot de marcha (`walk`) del firmware del robot.

La política parte de un entrenamiento previo (`walk-flat` v2) y se afina con viento simulado en la tarea `Mjlab-Velocity-Flat-Backlash-Gale-MicroDuck`. Observa 61 dimensiones, emite 14 acciones y corre a 50 Hz de forma perpetua hasta que se le ordena parar. El resultado medido en simulación es notable: 11 de 15 intentos mantienen la marcha a 3,0 N frente a 0 de 15 de la política de partida, con un avance mediano de +0,81 m.

Su relevancia es doble: por un lado, demuestra que un ajuste fino corto (3.000 iteraciones, 57 minutos en una RTX 5090) basta para dotar de robustez frente a perturbaciones a una política de locomoción ya entrenada; por otro, documenta con rigor estadístico (test exacto de Fisher, reglas congeladas antes del entrenamiento) las limitaciones del resultado, que solo se ha validado en simulación y nunca en un robot físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal de reinforcement learning exportada a ONNX (detalles de capas no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; observación de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible (se distribuye `policy.onnx` con el normalizador de observaciones embebido) |
| Idiomas soportados | no aplica (modelo de robótica, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` con esquema 2 del manifiesto de políticas de microduck |

## Arquitectura y entrenamiento

La política se entrena con aprendizaje por refuerzo en simulación sobre el stack `pollen-robotics/microduck_rl` (rama `develop`, commit `53b8971b6`, exportada desde un checkout con cambios sin commitear, de ahí el `dirty: true` del manifiesto). La tarea es una variante de la marcha con backlash: comando de velocidad solo hacia delante (vx entre 0,15 y 0,30 m/s), empujones aleatorios habituales y, como novedad, un viento modelado como fuerza constante aplicada al tronco en el centro de masa, opuesta a la dirección de la mirada. La fuerza sube linealmente durante 12 s y luego se mantiene; el pico se muestrea por episodio de forma uniforme entre 1,0 y 4,0 N. La política no observa el viento: las dimensiones de observación y acción no cambian (61 y 14).

El entrenamiento es un warm start desde `walk-flat` v2 en la iteración 7.000, afinado hasta la 10.000 con 4.096 entornos en paralelo: 57 minutos en una RTX 5090 (1,16 s por iteración), el 29 de octubre de 2026. La innovación técnica destacable no está en la arquitectura sino en la metodología de evaluación: reglas congeladas antes de entrenar, 15 intentos por política, criterios objetivos de éxito (sin reset, inclinación del tronco ≤ 60°, altura mediana del tronco ≥ 90 % de los 119,7 mm de pie, ≤ 10 % de pasos por debajo del 80 % de altura, avance ≥ 0,25 m) y significación estadística calculada con el test exacto de Fisher de una cola (p = 2,5e-5 en la condición principal).

## Capacidades

- Locomoción bípeda/cuadrúpeda perpetua hacia delante a velocidad de consigna entre 0,15 y 0,30 m/s, sin terminación episódica: corre hasta recibir orden de parada.
- Robustez frente a viento en contra constante de hasta 3,0 N (38 % del peso del robot), mantenido tras 12 s de rampa.
- Robustez frente a empujones aleatorios combinados con viento (condición B: 4 de 10 intentos válidos frente a 0 de 10 de la política base).
- Adaptación de la marcha sin inclinarse: inclinación mediana del tronco de +0,5° frente a −1,7° de la política de partida; el equilibrio se logra modificando el patrón de pasos.
- Integración directa con el daemon del robot mediante `robotctl policy load walk witcheer/microduck-walk-gale`.
- Normalizador de observaciones embebido en el ONNX: acepta observaciones en bruto, sin preprocesado externo.
- No soporta tool calling, agentes, multilingüismo ni modalidades de visión o audio: es exclusivamente un controlador motor.

## Casos de uso

- Investigación en locomoción robusta: servir de línea base reproducible para estudiar cómo una política de marcha plana se adapta a perturbaciones externas con un ajuste fino corto; el log completo de cada nivel está en el dataset `witcheer/microduck-skill-tree`.
- Validación de pipelines de RL en simulación: la tarea `Mjlab-Velocity-Flat-Backlash-Gale-MicroDuck` y su módulo `witcheer_velocity_gale_env_cfg.py` permiten replicar el experimento con una sola línea de importación en `tasks/__init__.py`.
- Despliegue en el Microduck físico para pruebas de viento en túnel o con ventiladores: la política está pensada para condiciones de viento en contra sostenido, aunque el autor advierte de que no se ha probado en robot real.
- Demostración educativa de evaluación estadística rigurosa en robótica: el protocolo de reglas congeladas, 15 intentos y test de Fisher es directamente reutilizable como plantilla en cursos y artículos.
- Benchmark de robustez para comparar políticas: cualquier nueva política de marcha del Microduck puede evaluarse contra esta en las condiciones A, B y C documentadas.
- Base para experimentos de sim-to-real: al ser una política perpetua con observación en bruto y formato ONNX estándar, se puede integrar en pipelines de despliegue que sustituyan el simulador por el robot sin cambiar la interfaz.

## Benchmarks y rendimiento

Resultados en simulación con reglas congeladas antes del entrenamiento (15 intentos por política en la condición principal):

| Condición | Métrica | Esta política | Política de partida (`walk-flat` v2) | Significación |
|---|---|---|---|---|
| A: viento 0→3,0 N en 12 s, luego sostenido, 14 s | Intentos válidos (sin caída, altura y avance mínimos) | 11/15 | 0/15 | Fisher una cola p = 2,5e-5 |
| A | Sin caída | 13/15 | no disponible | no disponible |
| A | Caídas | 2 (a 10,1 s y 13,0 s) | 15/15 (viento mediano de caída 2,42 N) | no disponible |
| A | Avance mediano | +0,81 m | +0,24 m | no disponible |
| A | Inclinación mediana del tronco | +0,5° | −1,7° | no disponible |
| B: viento + empujones aleatorios, 10 intentos | Intentos válidos | 4/10 | 0/10 | Fisher una cola p = 0,043 |
| C: sin viento, con empujones, 10 intentos | Intentos válidos | 8/10 | 5/10 | Fisher dos colas p = 0,35 (sin pérdida, sin ganancia demostrable) |

No se han publicado resultados de benchmarks estándar de NLP (MMLU, HumanEval, GSM8K) porque no aplican a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; al ser una política de 61 entradas y 14 salidas en ONNX, el modelo es de tamaño muy reducido (repo de 0,0 GB según HuggingFace) y cabe holgadamente en cualquier GPU consumer, e incluso en CPU para inferencia a 50 Hz.
- GPU recomendadas: ninguna específica; el entrenamiento se realizó en una RTX 5090, pero la inferencia no requiere esa clase de hardware.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3090, GTX 1660 o inferior) y probablemente en aceleradores embebidos; no se han publicado requisitos mínimos oficiales.
- Opciones de despliegue: runtime ONNX en el propio robot a través del daemon de microduck (`robotctl policy load walk witcheer/microduck-walk-gale`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: la política corre a 50 Hz por diseño; no se han publicado mediciones de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / observación | Rendimiento en viento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `witcheer/microduck-walk-gale` | Política RL ONNX para Microduck | no disponible | 61 obs / 14 acciones, 50 Hz | 11/15 a 3,0 N | Apache-2.0 | HuggingFace |
| `walk-flat` v2 (política base) | Política RL para Microduck | no disponible | 61 obs / 14 acciones, 50 Hz | 0/15 a 3,0 N | Apache-2.0 (presumible, misma familia) | Referenciada en la model card |
| Otras políticas `witcheer/microduck-*` | Políticas RL de la misma escalera sim-only | no disponible | no disponible | no disponible | Apache-2.0 (presumible) | HuggingFace |

No se dispone de datos de otras políticas de locomoción para Microduck publicadas por terceros que permitan una comparación cuantitativa adicional.

## Limitaciones y advertencias

- Entrenada y validada exclusivamente en simulación: no se ha probado en ningún robot Microduck real.
- El viento se modela como una fuerza sobre el cuerpo, no como aerodinámica real; el comportamiento en aire verdadero puede diferir.
- La política no observa el viento: la robustez es reactiva, no anticipatoria.
- Solo se ha validado viento frontal sostenido; no se han probado viento lateral o de cola, rachas ni picos superiores a 3,0 N.
- En la condición principal, 2 de 15 intentos cayeron y 2 más quedaron por debajo del umbral de altura, lo que indica que la robustez no es total.
- En la condición B (viento más empujones) solo 4 de 10 intentos fueron válidos; el margen bajo perturbaciones combinadas es estrecho.
- La condición C no demuestra ganancia frente a la política base sin viento (p = 0,35); el beneficio está acotado al escenario de viento.
- El entrenamiento se exportó desde un checkout con cambios sin commitear (`dirty: true`), lo que puede dificultar la reproducción exacta.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías y el modelo carece de validación en producción física.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/witcheer/microduck-walk-gale
- Repositorio del robot Microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: https://github.com/pollen-robotics/microduck_rl
- Dataset con los logs de entrenamiento de la escalera de habilidades: `witcheer/microduck-skill-tree` (en HuggingFace)
- Políticas hermanas: `witcheer/microduck-*` (en HuggingFace)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon de microduck
