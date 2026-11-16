# ywu549/lehome_sim

## Resumen

LeHome_sim es la política de simulación presentada por el autor ywu549 (Ilia Larchenko) para la ronda online del LeHome Challenge 2026, una competición de ICRA 2026 centrada en el plegado bimanual de prendas de vestir con un montaje LeRobot SO-ARM101. El modelo quedó en primera posición de 62 equipos en dicha ronda, lo que lo convierte en una referencia directa para quienes trabajan en manipulación robótica con visión-lenguaje-acción (VLA).

Se trata de una política VLA basada en π0.5, entrenada mediante un bucle asíncrono de aprendizaje por refuerzo combinado con DAgger, ejecutado íntegramente en NVIDIA Isaac Sim. La arquitectura subyacente es de flow matching, orientada a la generación de acciones motrices continuas a partir de observaciones visuales y consignas en lenguaje natural. El repositorio ocupa 10,5 GB y se distribuye con licencia Apache 2.0.

Su relevancia radica en que documenta un pipeline completo de entrenamiento en simulación con RL para una tarea de destreza bimanual, un dominio donde escasean las políticas abiertas con resultados verificados en competición. No obstante, la información pública disponible sobre hiperparámetros, composición del dataset y métricas detalladas es muy limitada: la model card remite al repositorio de código y al informe técnico para cualquier detalle operativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en π0.5, con flow matching para generación de acciones |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las consignas de la tarea son en inglés según el repositorio de la competición) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (librería declarada: JAX; el repo pesa 10,5 GB) |

## Arquitectura y entrenamiento

La política se construye sobre π0.5, un modelo VLA que combina un backbone visión-lenguaje con un cabezal de acciones entrenado por flow matching, es decir, modela la distribución de trayectorias motrices mediante un campo de flujo continuo en lugar de regresión directa o difusión discreta. El resultado es una política que recibe observaciones visuales e instrucciones en lenguaje y emite comandos de articulación para un robot bimanual SO-ARM101.

El entrenamiento se realizó íntegramente en NVIDIA Isaac Sim mediante un bucle asíncrono que alterna aprendizaje por refuerzo y DAgger. DAgger aporta correcciones sobre los estados visitados por la política, mientras que el componente de RL optimiza la recompensa de la tarea de plegado. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset (más allá de la referencia a `lehome/dataset_challenge_merged`) ni los detalles del esquema de recompensas; todo ello se remite al informe técnico y al repositorio de código.

## Capacidades

- Generación de acciones motrices bimanuales para manipulación de prendas (plegado) a partir de observaciones visuales.
- Comprensión de consignas en lenguaje natural como entrada de la política VLA.
- Control de un montaje LeRobot SO-ARM101 de dos brazos.
- Ejecución de políticas entrenadas en simulación (Isaac Sim) para la ronda online de la competición.
- Aprendizaje por refuerzo con correcciones humanas simuladas (DAgger) integrado en el pipeline de entrenamiento.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito; el modelo está especializado en la tarea de manipulación descrita.

## Casos de uso

- Investigación en plegado bimanual de prendas: sirve como política de referencia y línea base reproducible para comparar nuevos métodos de VLA y RL en una tarea de destreza con contacto deformable.
- Reproducción de pipelines de RL en simulación: el código asociado permite replicar el bucle asíncrono RL + DAgger sobre Isaac Sim para entrenar políticas propias en tareas de manipulación.
- Evaluación de arquitecturas VLA con flow matching: útil para estudiar cómo se comporta π0.5 frente a alternativas de difusión o regresión en tareas de control continuo.
- Transferencia sim-a-real: el autor publica además una política final para el mundo real (`IliaLarchenko/lehome_real`), lo que permite estudiar el gap entre simulación y hardware con el mismo montaje SO-ARM101.
- Docencia y formación en robótica: como ejemplo completo de competición con dataset, código, informe técnico y política entrenada, resulta adecuado para cursos avanzados de aprendizaje por refuerzo aplicado a robótica.
- Benchmarking interno de infraestructura: permite medir el rendimiento de pipelines JAX e Isaac Sim en un caso real de entrenamiento con 10,5 GB de artefactos y múltiples iteraciones de RL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento verificable es la clasificación en la competición: primera posición de 62 equipos en la ronda online (simulación) del LeHome Challenge 2026.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio (10,5 GB) incluye pesos y artefactos de entrenamiento, no solo el modelo en inferencia.
- GPU recomendadas: no disponible en la información proporcionada; el entrenamiento se realizó en NVIDIA Isaac Sim, lo que implica GPUs NVIDIA, pero no se especifica modelo.
- Compatibilidad con GPU de consumo: no confirmada; no hay datos sobre si la política cabe en una RTX 4090 u otras GPU consumer.
- Opciones de despliegue: la librería declarada es JAX; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no aplican a una política robótica de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ywu549/lehome_sim | VLA π0.5 + flow matching | no disponible | no disponible | Apache 2.0 | Hugging Face |
| IliaLarchenko/lehome_real | Política final para mundo real del mismo autor | no disponible | no disponible | no disponible | Hugging Face |
| Políticas del resto de equipos del LeHome Challenge 2026 | VLA / RL para plegado bimanual | no disponible | no disponible | no disponible | no disponible públicamente |

No se dispone de datos suficientes para comparar parámetros, contexto o rendimiento con alternativas de la misma categoría. La comparación más directa es con la política de mundo real del mismo autor, pero la información pública sobre ambas es escasa.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una tarea concreta (plegado bimanual con SO-ARM101) y no es un modelo de propósito general.
- Entrenamiento exclusivamente en simulación: el rendimiento en el mundo real puede degradarse por el gap sim-a-real; el autor publica una política separada para hardware.
- Información técnica muy limitada: no se publican parámetros, contexto, composición del dataset ni métricas de benchmarks en la model card.
- Sin datos sobre sesgos ni evaluación multilingüe: los idiomas soportados no están disponibles y las consignas parecen limitarse al inglés de la competición.
- Riesgo de sobreajuste a la configuración de la competición: cambios en el montaje, la cámara o las prendas pueden invalidar la política.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene revisar las licencias de las dependencias (Isaac Sim, π0.5, LeRobot) antes de desplegar en producción.
- Sin garantías de soporte ni mantenimiento: el repositorio tiene 0 descargas y 0 likes, lo que sugiere ausencia de validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ywu549/lehome_sim
- Código: https://github.com/IliaLarchenko/lehome_solution
- Informe técnico: https://arxiv.org/abs/2606.27163
- Blog del autor: https://ilialarchenko.com/projects/lehome2026
- Política de mundo real: https://huggingface.co/IliaLarchenko/lehome_real
- Repositorio de la competición: https://github.com/lehome-official/lehome-challenge
- Dataset: `lehome/dataset_challenge_merged` (referenciado en la model card)
