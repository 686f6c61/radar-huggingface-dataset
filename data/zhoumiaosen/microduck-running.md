# zhoumiaosen/microduck-running

## Resumen

MicroDuck Running es una política de locomoción entrenada con aprendizaje por refuerzo (PPO) para el robot bípedo MicroDuck, un cuadrúpedo/bípedo de 14 actuadores. La política se entrenó en simulación con MuJoCo Warp a través de mjlab y se distribuye como un grafo ONNX normalizado junto con el checkpoint final de PPO, un vídeo de replay y las mediciones de evaluación. El autor es zhoumiaosen y el repositorio se publicó el 11 de septiembre de 2026 bajo licencia Apache-2.0.

El objetivo declarado era alcanzar 2,0 m/s de velocidad media hacia delante manteniendo una supervivencia alta. La política final logra 1,499 m/s de velocidad media cuerpo-adelante en las evaluaciones realizadas, por lo que el criterio de aceptación de 2,0 m/s no se cumple (`target_met` es falso). Además, la política presenta deriva de rumbo, lo que reduce la velocidad de progreso en línea recta a 1,234 m/s.

Se trata de un checkpoint de investigación en simulación: el rendimiento sobre hardware físico no se ha evaluado para esta versión y el código de entrenamiento exacto (`mjlab-microduck`, tarea `Mjlab-Running-Flat-MicroDuck`) todavía no tiene URL pública. Es relevante como ejemplo reproducible y honesto de un release de RL para robótica que documenta explícitamente sus fallos respecto al objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control por aprendizaje por refuerzo (PPO, actor-critic); red neuronal exportada a ONNX. Detalle de capas no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); ventana de observación de 61 valores por paso de control a 50 Hz |
| Tipos de cuantizacion | no disponible; se distribuye el grafo ONNX tal cual y el checkpoint PyTorch sin cuantizar |
| Idiomas soportados | no aplica (no es un modelo de lenguaje); la documentación está en inglés (en) |
| Licencia | Apache-2.0 (software); los diseños de hardware upstream tienen licencia CC BY-NC-SA 4.0 |
| Formato de pesos | ONNX (`policy.onnx`) y checkpoint PyTorch (`.pt`, `model_10998.pt`) |
| Tarea | Locomoción hacia delante (`Mjlab-Running-Flat-MicroDuck`) |
| Robot | MicroDuck bípedo de 14 actuadores |
| Frecuencia de control | 50 Hz |
| Observación del actor | 61 valores: 48 propioceptivos + 13 de comando (twist 3, pose de cabeza 4, pose de cuerpo 6) |
| Salida de acciones | 14 valores (requieren el escalado de acciones, orden de articulaciones e interpretación de actuadores del runtime correspondiente) |
| Entorno de entrenamiento | MuJoCo Warp / mjlab 1.3.0 |
| Algoritmo | PPO con rsl_rl |
| Descargas / likes | 0 descargas / 1 like |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La política es el resultado de un entrenamiento con PPO (implementación rsl_rl) sobre MuJoCo Warp usando mjlab 1.3.0, con Python 3.12, PyTorch 2.9.1 y una NVIDIA RTX 3070. El entrenamiento continuó a partir del checkpoint temprano `model_999.pt` y realizó 10.000 actualizaciones PPO adicionales, dando lugar a `model_10998.pt`. La configuración usó 512 entornos en paralelo, 24 pasos por entorno y actualización, y semilla 42. Un currículo gradual elevó el comando máximo de velocidad hacia delante hasta 2,0 m/s, con un tope de recompensa de 2,2 m/s. El commit fuente del entrenamiento fue `104b1d194b82320bcb4a5df42b6d2b88f2094306` en el repositorio local refactorizado.

El export a ONNX incluye la normalización de observaciones ya integrada, por lo que no debe normalizarse dos veces en tiempo de inferencia. La interfaz espera observaciones sin normalizar construidas según las definiciones del runtime correspondiente; se deben preservar las definiciones de observación, el relleno de comandos (command padding), el diseño de articulaciones y el modelo de actuadores. La política se entrenó sin filtrado paso bajo de acciones. Este release selecciona el checkpoint final, no un mejor checkpoint obtenido mediante un barrido completo.

## Capacidades

- Locomoción bípeda hacia delante: genera comandos de 14 actuadores a 50 Hz para desplazar el robot sobre terreno plano simulado.
- Seguimiento de comandos de velocidad: recibe un bloque de comando de 13 valores (twist de 3, pose de cabeza de 4, pose de cuerpo de 6) y responde a comandos de velocidad hacia delante, lateral y de guiñada.
- Supervivencia en simulación: mantiene el robot en pie con un 96,74% de supervivencia en evaluaciones de 10 segundos y un 91,21% en una de 30 segundos, usando el umbral de caída de 70 grados del evaluador.
- Velocidad sostenida: 1,499 m/s de velocidad media cuerpo-adelante ante un comando de 2,0 m/s.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no aplica.
- Capacidades especiales: export ONNX con normalización de observaciones integrada, pensado para inferencia ligera; no incluye modo de razonamiento, visión ni audio.

## Casos de uso

- Investigación en locomoción bípeda: sirve como punto de partida para estudiar políticas PPO sobre el robot MicroDuck en MuJoCo Warp, comparando curvas de recompensa y estabilidad con variantes propias.
- Reproducción de experimentos de RL: al incluir el checkpoint final, las mediciones por semilla y los hashes de integridad, permite reproducir las evaluaciones descritas (512 entornos, comandos a 2,0 m/s, semillas 123, 456 y 789).
- Desarrollo de controladores de rumbo: dado que la política presenta deriva de rumbo, es un caso práctico para probar controladores externos de retención de heading que mejoren la velocidad de progreso recto (1,234 m/s) sin degradar la supervivencia.
- Benchmark interno de pipelines de simulación: usar la política como carga de trabajo fija para medir throughput de MuJoCo Warp con 512 entornos en paralelo y validar entornos de entrenamiento.
- Integración de inferencia ONNX en robótica: dado que el modelo es pequeño y se ejecuta con `onnxruntime` (incluido `CPUExecutionProvider`), es útil para validar cadenas de despliegue de políticas exportadas antes de portarlas a hardware.
- Sim2real preliminar: emplearlo como base para experimentos de transferencia a hardware del MicroDuck, aceptando que el propio autor indica que la transferencia a hardware y la validación del runtime aún están pendientes.
- Docencia en aprendizaje por refuerzo: por su documentación explícita de objetivos no cumplidos, sirve como ejemplo didáctico de evaluación rigurosa y de reporte honesto de resultados.

## Benchmarks y rendimiento

El model-index oficial del autor no contiene resultados (`results: []`). Los datos de rendimiento provienen de las mediciones de evaluación incluidas en el repositorio. Todas usan un comando de 2,0 m/s hacia delante con velocidad lateral y de guiñada comandadas a cero, 512 entornos en paralelo y excluyen un segundo de calentamiento.

| Métrica | Tres evaluaciones de 10 s (semillas 123, 456, 789) | Evaluación de 30 s (semilla 456) |
|---|---:|---:|
| Velocidad media cuerpo-adelante | 1,499 m/s | 1,499 m/s |
| Velocidad media de progreso recto | 1,234 m/s | ver evaluación cruda |
| Supervivencia | 96,74% | 91,21% |

Criterio de aceptación declarado: al menos 2,0 m/s de velocidad media cuerpo-adelante con al menos 95% de supervivencia en las evaluaciones cortas, más al menos 2,0 m/s y 90% de supervivencia en la evaluación larga. El campo `target_met` es `false`. Son mediciones de simulación, no resultados de hardware ni picos instantáneos de velocidad. No se han publicado otros resultados de benchmarks (por ejemplo MMLU, HumanEval o GSM8K, que no aplican a este tipo de modelo) en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma explícita; la política es una red pequeña (61 entradas, 14 salidas) exportada a ONNX y ejecutable en CPU con `onnxruntime`.
- GPU de entrenamiento: el autor indica que el entrenamiento se realizó en una NVIDIA RTX 3070, con 512 entornos en paralelo.
- GPU recomendadas para entrenamiento: RTX 3070 o superior; no se especifican requisitos mínimos ni configuraciones profesionales (A100, H100) en la información disponible.
- ¿Cabe en GPU de consumo? El entrenamiento se hizo en una RTX 3070, por lo que sí cabe en GPU de consumo. El inferencia ONNX es viable en CPU.
- Opciones de despliegue: `onnxruntime` (incluye `CPUExecutionProvider`) para el grafo ONNX; para el checkpoint `.pt` se requiere el paquete de entrenamiento `mjlab-microduck` (tarea `Mjlab-Running-Flat-MicroDuck`), que no tiene URL pública todavía. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles. Se conoce la frecuencia de control objetivo de 50 Hz y que las evaluaciones usan 512 entornos en paralelo en simulación.

## Comparativa con modelos similares

No se han identificado en la información proporcionada políticas comparables publicadas para el mismo robot con las que contrastar parámetros, contexto o rendimiento. Los proyectos upstream relacionados son la base del trabajo, no alternativas equivalentes:

| Modelo / proyecto | Relación | Licencia | Disponibilidad |
|---|---|---|---|
| zhoumiaosen/microduck-running | Este modelo (política PPO para MicroDuck) | Apache-2.0 | HuggingFace, 0 descargas |
| Vottivott/microduck-playground | Código base del que deriva el entrenamiento (commit `828d950…`) | No indicada en la información | GitHub |
| pollen-robotics/microduck_rl | Proyecto del que deriva el anterior | No indicada en la información | GitHub |

Comparativa de rendimiento con alternativas: no disponible.

## Limitaciones y advertencias

- La velocidad media alcanzada (1,499 m/s) está por debajo del objetivo de entrenamiento de 2,0 m/s; el criterio de aceptación no se cumple.
- Deriva de rumbo: reduce de forma sustancial el progreso en línea recta (1,234 m/s frente a 1,499 m/s de velocidad cuerpo-adelante). La evaluación usa `VelocityCommandCommandOnly`, sin controlador externo que mantenga el heading.
- Supervivencia: aproximadamente un 8,8% de los entornos no superaron el criterio de supervivencia en la evaluación de 30 segundos.
- Alcance de la evaluación limitado a terreno plano simulado, semillas y comandos especificados; no cubre terreno arbitrario, perturbaciones externas ni hardware.
- La transferencia a hardware y la validación del runtime correspondiente siguen pendientes; el checkpoint no es un controlador de robot autónomo.
- Las 14 salidas de acción no son comandos directos de motor: requieren el escalado, el orden de articulaciones y la interpretación de actuadores del runtime correspondiente.
- No se debe normalizar las observaciones una segunda vez, ya que el export ONNX incluye la normalización.
- Sesgos conocidos del modelo: no disponibles. Riesgo de alucinación: no aplica (no es un modelo generativo de lenguaje).
- Licencia del software: Apache-2.0. Los diseños de hardware upstream tienen licencia CC BY-NC-SA 4.0, que restringe el uso comercial de dichos diseños; conviene revisar `LICENSE`, `NOTICE` y `LICENSE-HARDWARE` antes de cualquier uso comercial.
- Limitaciones de idioma y contexto: no aplican a un modelo de lenguaje; la documentación está únicamente en inglés.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zhoumiaosen/microduck-running
- Código base del que deriva el entrenamiento: https://github.com/Vottivott/microduck-playground
- Proyecto upstream original: https://github.com/pollen-robotics/microduck_rl
- Vídeo de replay incluido en el repositorio: `run.mp4` (10 segundos, checkpoint final, semilla 123, comando de 2,0 m/s hacia delante)
- Mediciones crudas de evaluación: `evaluation/` y `evaluation/result.json` (incluidos en el repositorio del modelo)
- Hashes de integridad del release: `SHA256SUMS.txt` (incluido en el repositorio del modelo)
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo (los resultados devueltos corresponden a sitios no relacionados).
