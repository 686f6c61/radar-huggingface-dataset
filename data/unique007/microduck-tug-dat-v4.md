# Unique007/microduck-tug-dat-v4

## Resumen

`Unique007/microduck-tug-dat-v4` es una política de control para el robot bípedo Microduck, un robot open source de 10 pulgadas presentado por Hugging Face y Pollen Robotics. El modelo no es un modelo de lenguaje: es una política de aprendizaje por refuerzo exportada a ONNX que genera comandos motores a 50 Hz a partir de observaciones de 61 dimensiones, con 14 acciones de salida. Resuelve una tarea concreta de locomoción competitiva dentro de la liga de "tug of war" (tiro de guerra) de la comunidad Microduck.

El autor, Unique007, parte del actor de `rumezhak/microduck-tug-league-v4` (checkpoint 575 de la ronda M917342 del entrenamiento de liga de rumezhak) y aplica 10 iteraciones de PPO en la física de tug del desafío contra ligas de redes de entradas públicas y redes propias anteriores. Además, incorpora una capa de "lookup": en las cinco semillas oficiales de rating, `policy.onnx` reproduce bouts grabados con coincidencia exacta de observación (tolerancia 1e-6); en el resto de situaciones decide la red neuronal.

Es relevante como ejemplo de ingeniería de políticas para robótica de bajo coste y de las prácticas emergentes de las ligas de RL comunitarias, donde se combinan fine-tuning, búsqueda CMA-ES y créditos a trabajos previos. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política (actor) exportada a ONNX; fine-tune PPO sobre el actor de `rumezhak/microduck-tug-league-v4` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; observación de 61 dimensiones por paso, control a 50 Hz |
| Tipos de cuantizacion | no disponible (exportación ONNX; sin variantes GGUF/AWQ documentadas) |
| Idiomas soportados | no aplica (política robótica, sin entrada/salida de texto) |
| Licencia | sin licencia propia del autor; se arrastra Apache-2.0 de los repositorios de rumezhak y jrubiosainz solo para las partes que la portan; el trabajo de greecree y HlibPlakhtii y los pesos de liga de rumezhak no declaran licencia separada |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La política es una red neuronal que mapea observaciones de 61 dimensiones a 14 acciones, ejecutada a 50 Hz en el robot Microduck. El normalizador de observaciones está embebido en `policy.onnx`, por lo que se alimentan observaciones en crudo. El modelo base es el actor de `rumezhak/microduck-tug-league-v4` (SHA-256 de política `5d12fcb4…ed4a`, checkpoint 575 de la ronda M917342), con el normalizador congelado. Sobre él se aplicaron 10 iteraciones de PPO en la física de tug del desafío, contra ligas formadas por redes de entradas públicas y redes propias anteriores; la recompensa se limita al resultado de pit del bout y al progreso del marcador.

Una innovación destacable es la hibridación entre política neuronal y tabla de consulta: en las cinco semillas oficiales de rating, `policy.onnx` actúa como lookup que reproduce bouts grabados con coincidencia exacta de observación (tolerancia 1e-6); fuera de esas semillas (cualquier bout de copa) decide la red. Los bouts de las semillas 2 y 3 parten del bout de `jrubiosainz/microduck-tug-h5b-3976f431`; el de la semilla 4, de `greecree/microduck-tug-of-war-tug-super-v9`; las semillas 1 y 5 son bouts propios (duck entrenado para sprint más búsquedas CMA propias, como en `Unique007/microduck-tug-dat-v3`). Las semillas 2, 3 y 4 se completan con búsqueda sep-CMA-ES en la ventana final contra el duck de referencia congelado. El entrenamiento se realizó desde el repositorio `pollen-robotics/microduck_rl`, rama `dat/tug-of-war`, commit `a4a7e12ef`, exportado desde un checkout con cambios sin commitear.

## Capacidades

- Locomoción bípeda continua: política "perpetua" que corre hasta recibir orden de parada, asignada al slot `walk`.
- Control a 50 Hz con observación de 61 dimensiones y 14 acciones, adaptado a la física de tug of war del desafío Microduck.
- Reproducción determinista de bouts grabados en las cinco semillas oficiales de rating (puntuaciones entre 168.3161 y 169.3983 cm en replay local x86-64).
- Generalización neuronal fuera de las semillas oficiales: en cualquier bout de copa la red decide la acción.
- Integración con el daemon del robot mediante `robotctl policy load walk <repo>` y manifiesto schema 2.
- Sin capacidades de texto, visión, audio, tool calling ni razonamiento multi-step: es exclusivamente una política motora.

## Casos de uso

- Competición en la liga de tug of war de Microduck: cargar la política en el slot `walk` con `sudo robotctl policy load walk Unique007/microduck-tug-dat-v4` para disputar bouts de copa, donde la red neuronal decide en tiempo real.
- Reproducción de referencia de bouts: usar las cinco semillas oficiales para replicar exactamente los resultados registrados (169.0166, 169.0240, 168.4128, 169.3983 y 168.3161 cm) en entornos x86-64, útil para validar la cadena de simulación.
- Investigación en RL aplicado a robótica de bajo coste: servir como punto de partida para fine-tuning con PPO sobre el actor de rumezhak, replicando el pipeline documentado (rama `dat/tug-of-war`, commit `a4a7e12ef`).
- Estudio de hibridación lookup + red: analizar cómo una tabla de consulta sobre semillas fijas convive con una política neuronal general, patrón relevante para evaluación reproducible en ligas de RL.
- Benchmarking de políticas comunitarias: comparar el rendimiento de esta política frente a las de jrubiosainz, greecree y rumezhak en la misma física de tug, usando las puntuaciones en cm como métrica.
- Docencia y divulgación: demostrar el ciclo completo de una política de RL (entrenamiento en `microduck_rl`, exportación ONNX, despliegue en robot) en un robot de 399-499 USD.

## Benchmarks y rendimiento

| Semilla oficial | Puntuación (cm, replay local x86-64) | Origen del bout |
|---|---|---|
| 1 | 169.0166 | propio (Unique007) |
| 2 | 169.0240 | jrubiosainz h5b-3976f431 + CMA propio |
| 3 | 168.4128 | jrubiosainz h5b-3976f431 + CMA propio |
| 4 | 169.3983 | greecree tug-of-war-tug-super-v9 + CMA propio |
| 5 | 168.3161 | propio (Unique007) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible; no aplican a una política robótica.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio es de 0.0 GB y la política es una red pequeña exportada a ONNX, por lo que la inferencia cabe holgadamente en cualquier GPU consumer, aunque no se documenta el consumo exacto.
- GPU recomendadas: no disponible; para el replay local de las semillas se cita un entorno x86-64 sin especificar GPU.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU moderna (RTX 4090, RTX 3060 o inferiores), dado el tamaño del artefacto; sin cifras oficiales.
- Opciones de despliegue: ONNX Runtime para `policy.onnx`, más el daemon Microduck mediante `robotctl policy load walk Unique007/microduck-tug-dat-v4`; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican).
- Latencia y throughput: control a 50 Hz (20 ms por paso) por diseño del robot; no se publican cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Base | Tipo | Puntuación en semillas oficiales | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Unique007/microduck-tug-dat-v4` | fine-tune de `rumezhak/microduck-tug-league-v4` | Política ONNX con lookup en semillas | 168.3161–169.3983 cm | Sin licencia propia; Apache-2.0 parcial heredada | Hugging Face, 0 descargas |
| `rumezhak/microduck-tug-league-v4` | Entrenamiento de liga propio | Política de liga (actor base) | no disponible | Apache-2.0 (según el autor de v4) | Hugging Face |
| `jrubiosainz/microduck-tug-h5b-3976f431` | no disponible | Política de tug | no disponible | Apache-2.0 (según el autor de v4) | Hugging Face |
| `greecree/microduck-tug-of-war-tug-super-v9` | no disponible | Política de tug | no disponible | Sin licencia declarada | Hugging Face |

## Limitaciones y advertencias

- Solo simulación: el autor indica explícitamente "Not for a real robot"; no debe desplegarse en hardware físico.
- El comportamiento en las cinco semillas oficiales es reproducción de bouts grabados (lookup con tolerancia 1e-6), no generalización; el rendimiento real fuera de esas semillas depende de la red neuronal y no está cuantificado.
- Licencia ambigua: no hay licencia propia; Apache-2.0 solo cubre las partes que la portan, y los pesos de liga de rumezhak y el trabajo de greecree y HlibPlakhtii no declaran licencia. Uso comercial no garantizado.
- El autor se reserva retirar el modelo si algún autor previo objeta ("If any author objects, open a discussion on this repository and it will be withdrawn").
- Exportado desde un checkout con cambios sin commitear, lo que dificulta la reproducibilidad exacta del entrenamiento.
- Sin datos de sesgos, alucinación o cobertura idiomática: no aplican a una política motora, pero tampoco se documenta robustez ante distribuciones de observación distintas de las de entrenamiento.
- Sin descargas ni likes: no hay validación independiente de la comunidad en el momento de la consulta.
- El autor declara que un asistente de IA ayudó con los experimentos.

## Enlaces

- Hugging Face: https://huggingface.co/Unique007/microduck-tug-dat-v4
- Modelo base: https://huggingface.co/rumezhak/microduck-tug-league-v4
- Modelo previo del autor: https://huggingface.co/Unique007/microduck-tug-dat-v3
- Bout de origen semilla 2/3: https://huggingface.co/jrubiosainz/microduck-tug-h5b-3976f431
- Bout de origen semilla 4: https://huggingface.co/greecree/microduck-tug-of-war-tug-super-v9
- Repositorio de entrenamiento: https://github.com/pollen-robotics/microduck_rl (rama `dat/tug-of-war`, commit `a4a7e12ef`)
- Repositorio del robot: https://github.com/pollen-robotics/microduck
- Web oficial del robot: https://microducks.org/
- Cobertura de prensa: https://techcrunch.com/2026/08/27/hugging-face-is-selling-a-cute-399-open-source-duck-robot-microduck/
