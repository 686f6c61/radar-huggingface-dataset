# ubr-physical-ai/g1-hug-edge-concat-v5-n256

## Resumen

g1-hug-edge-concat-v5-n256 es un checkpoint de investigación publicado por UB Robotics (organización `ubr-physical-ai` en HuggingFace) que consiste en NVIDIA Cosmos3-Edge reentrenado como política de acciones (*action policy*) para un robot humanoide Unitree G1 simulado. La tarea es concreta: el humanoide camina hasta una caja y la levanta con ambos brazos. El modelo no genera texto ni imágenes de forma generalista; produce directamente comandos motores a partir de observaciones visuales y un *prompt* de texto que describe la pose de la caja.

La relevancia del checkpoint es metodológica más que de producto. Forma parte de una curva de eficiencia de datos con tres puntos (N = 64, 256 y 965 episodios, subconjuntos anidados con el mismo número de semillas por grabación); esta versión concreta se entrenó con 256 de los 965 episodios disponibles de un conjunto de demostraciones simuladas en Isaac Lab 3, con cuatro alturas de soporte entre 0,65 y 0,80 m. El objetivo es medir cuánto rinde una política derivada de un modelo fundacional físico cuando se dispone de pocos datos de demostración.

Se trata de un *full fine-tune* (no LoRA ni adaptadores) ejecutado con `cosmos-framework` durante 500 iteraciones en 4 GPU NVIDIA B300. El repositorio pesa 27,0 GB y se distribuye como PyTorch distributed checkpoint. Es un artefacto de hackathon, entrenado y evaluado únicamente en simulación, nunca ejecutado sobre hardware físico, y el propio autor lo declara no apto para uso operativo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; modelo base Cosmos3-Edge (NVIDIA) reentrenado como política de acciones |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible; horizonte de acción de 16 pasos a 10 Hz (1,6 s) |
| Tipos de cuantización | No disponible; solo se publica el checkpoint en precisión de entrenamiento (no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible; la única entrada textual es un *prompt* con la pose de la caja |
| Licencia | OpenMDW 1.1 (heredada de `nvidia/Cosmos3-Edge`) |
| Formato de pesos | PyTorch distributed checkpoint (`iter_000000500/model/`) |
| Tamaño del repositorio | 27,0 GB |
| Pipeline | `robotics` |
| Biblioteca | `cosmos` |
| Entradas | Una imagen de 640x540 que concatena cámara de cabeza y dos cámaras de muñeca, más *prompt* de texto con la pose de la caja |
| Salidas | Chunks de 16 acciones a 10 Hz, 29 valores por acción |
| Datos de entrenamiento | 256 de 965 episodios de `ubr-physical-ai/g1_hug_v5` (privado), Isaac Lab 3 |
| Hardware de entrenamiento | 4 x NVIDIA B300, batch global 2048, 500 iteraciones, lr 5e-5 con decaimiento lineal |

## Arquitectura y entrenamiento

El modelo parte de NVIDIA Cosmos3-Edge, un modelo fundacional físico de NVIDIA que aquí se recicla como política de control. La información disponible no detalla la arquitectura interna del modelo base (transformer, difusión, híbrida, número de parámetros o ventana de contexto), por lo que esos extremos quedan como no disponibles. Lo que sí se documenta es la interfaz: la política recibe un único fotograma de 640x540 que concatena la cámara de cabeza con las dos cámaras de muñeca, junto con un *prompt* textual que codifica la pose de la caja, y emite chunks de 16 acciones a 10 Hz. Cada acción son 29 valores: deltas de pose de cabeza, muñeca derecha y muñeca izquierda (traslación más rotación en representación 6-D) y el grado de cierre de cada mano, coincidiendo con los objetivos de muñeca y cierre comandados por el controlador scriptado de la demostración.

El entrenamiento es un *full fine-tune* de todos los pesos con `cosmos-framework`, usando la receta `action_policy_g1_hug_edge`, 500 iteraciones, tasa de aprendizaje 5e-5 con decaimiento lineal y batch global de 2048, sobre 4 GPU NVIDIA B300. Los datos proceden del conjunto simulado `g1_hug_v5` en Isaac Lab 3, con cuatro alturas de soporte entre 0,65 y 0,80 m. Esta versión corresponde al punto N = 256 de una curva de eficiencia de datos con subconjuntos anidados (N = 64, 256, 965) y el mismo número de semillas por grabación en cada punto. El repositorio incluye la configuración resuelta (`config.yaml`), las estadísticas de normalización de acciones (`action_stats.json`, obligatorias en inferencia) y los índices de episodios de entrenamiento (`episodes.json`).

## Capacidades

- Generación de acciones de control para un humanoide Unitree G1 simulado: camina hacia una caja y la levanta con ambos brazos.
- Política visomotora de extremo a extremo: consume píxeles (640x540, cámara de cabeza más dos cámaras de muñeca) y produce comandos motores sin planificador externo.
- Condicionamiento por lenguaje limitado: acepta un *prompt* de texto con la pose de la caja como variable de tarea.
- Salida en chunks de 16 acciones a 10 Hz, con 29 valores por acción (deltas de pose de cabeza y de ambas muñecas con traslación y rotación 6-D, más apertura de cada mano).
- Coordinación bimanual: la política controla simultáneamente ambas manos y ambas muñecas.
- Generalización a cuatro alturas de soporte dentro del rango 0,65-0,80 m visto en entrenamiento.
- No dispone de *tool calling*, no soporta agentes multi-paso en el sentido de LLM, no genera texto libre, no procesa audio y no realiza razonamiento simbólico.

## Casos de uso

- Investigación en aprendizaje por imitación para humanoides: el checkpoint sirve como política de referencia bimanual entrenada en Isaac Lab 3 sobre una tarea de manipulación concreta (levantar una caja), útil para comparar recetas de *fine-tuning* de modelos fundacionales físicos.
- Estudio de eficiencia de datos: al ser uno de los tres puntos de una curva con subconjuntos anidados (N = 64, 256, 965), permite analizar cuánto rendimiento se gana al pasar de 64 a 256 y a 965 episodios manteniendo la misma distribución de semillas por grabación.
- Baseline para evaluar la brecha sim-to-real: como política entrenada exclusivamente en simulación y nunca ejecutada en hardware, sirve como punto de partida para medir cuánto se degrada al transferir a un Unitree G1 físico.
- Aumentación de datos sintéticos: las trayectorias generadas por la política pueden filtrarse por éxito y reutilizarse para ampliar el conjunto de demostraciones en simulación, especialmente en el rango de alturas de soporte de 0,65 a 0,80 m.
- Validación de pipelines de inferencia multimodal: el diseño de entrada (un único fotograma concatenado de tres cámaras más *prompt* textual) permite probar arquitecturas de servidor de políticas con `--config-file` y carga de estadísticas de normalización desde `action_stats.json`.
- Prototipado docente en robótica: un laboratorio puede reproducir el flujo completo (demostraciones scriptadas, *full fine-tune* con `cosmos-framework`, evaluación en simulación) sin necesidad de un robot real.
- Pruebas de reproducibilidad de checkpoints distribuidos: el formato PyTorch distributed checkpoint obliga a ejercitar la consolidación de pesos fragmentados antes de la inferencia, un paso útil como caso de prueba de infraestructura.
- Comparación de horizontes de acción: con chunks de 16 acciones a 10 Hz se puede estudiar el compromiso entre reactividad (100 ms por chunk) y estabilidad del control en tareas de contacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de error de posición, comparaciones con otras políticas ni resultados de MMLU, HumanEval, GSM8K u otros benchmarks estándar, que por otra parte no aplicarían a un modelo de política de acciones. Tampoco se publican cifras de la curva de eficiencia de datos para N = 64, 256 y 965 más allá de la existencia de los tres puntos.

## Requisitos de hardware

- Almacenamiento: el repositorio ocupa 27,0 GB, de los cuales la mayor parte corresponde a los pesos del *full fine-tune*.
- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, cargar el checkpoint completo en precisión nativa requiere del orden de 27 GB solo para pesos, más activaciones y buffers de las tres cámaras, por lo que se necesitan GPU de 32 GB o más (A100 40 GB, A100 80 GB, H100, B300). Esta cifra es una estimación derivada del tamaño del repositorio, no un dato publicado.
- GPU de entrenamiento documentadas: 4 x NVIDIA B300 con batch global 2048.
- GPU de consumo: no hay datos publicados sobre ejecución en RTX 4090 (24 GB) u otras tarjetas consumer. Con los pesos en precisión nativa y 27 GB de repositorio, es probable que no quepa en 24 GB sin cuantización, y no se publican variantes cuantizadas.
- Opciones de despliegue: `cosmos-framework` con la receta `action_policy_g1_hug_edge`; el autor menciona pasar `config.yaml` al servidor de políticas mediante `--config-file`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que además no aplican a este tipo de política.
- Frecuencia de control: 10 Hz de salida (chunks de 16 acciones, 100 ms por acción). No se publican cifras de latencia ni de throughput de inferencia.
- Dependencias de inferencia: `action_stats.json` es obligatorio para desnormalizar las acciones; los índices de episodios de entrenamiento están en `episodes.json`.

## Comparativa con modelos similares

No se dispone de datos cuantitativos (parámetros, contexto, tasas de éxito) de alternativas comparables en la información proporcionada. La comparación se limita a lo documentado.

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| g1-hug-edge-concat-v5-n256 | Política de acciones para Unitree G1 simulado (fine-tune de Cosmos3-Edge, N = 256) | No disponible | No disponible (horizonte de 16 acciones) | OpenMDW 1.1 | Público en HuggingFace, 0 descargas |
| nvidia/Cosmos3-Edge | Modelo fundacional físico (base) | No disponible | No disponible | OpenMDW 1.1 | Público en HuggingFace |
| Variantes N = 64 y N = 965 de la misma curva | Políticas de acciones, mismo pipeline | No disponible | No disponible | OpenMDW 1.1 | No se confirma su publicación en la información disponible |
| Otras políticas de manipulación humanoide (por ejemplo, las integradas en Physical AI Studio) | Aprendizaje por imitación | No disponible | No disponible | No disponible | Repositorio abierto, sin datos comparativos |

## Limitaciones y advertencias

- Checkpoint de investigación procedente de una demo de hackathon; el autor lo declara explícitamente no apto para uso operativo.
- Entrenado y evaluado únicamente en simulación (Isaac Lab 3). Nunca se ha ejecutado sobre un robot real, por lo que no hay evidencia sobre la brecha sim-to-real.
- Tarea única y estrecha: caminar hacia una caja y levantarla. No es un modelo generalista y no se documenta transferencia a otras tareas.
- Rango de alturas de soporte limitado a 0,65-0,80 m (cuatro alturas); fuera de ese rango el comportamiento es indeterminado.
- Sin datos de benchmarks ni de tasa de éxito, ni siquiera en simulación, en la información disponible.
- Riesgo de alucinación en el sentido habitual no aplica, pero sí existe riesgo de acciones inconsistentes o inseguras si se ejecuta fuera de la distribución de demostraciones; al no haber validación en hardware, ese riesgo no está cuantificado.
- Idiomas soportados: no disponible. El condicionamiento textual se limita a la pose de la caja, por lo que no hay capacidades multilingües.
- Sesgos: no documentados. El conjunto de demostraciones es privado, lo que impide auditar su composición y cobertura.
- Licencia OpenMDW 1.1 heredada de `nvidia/Cosmos3-Edge`; es responsabilidad del usuario revisar los términos completos antes de cualquier uso, incluido el comercial.
- Sin cuantizaciones publicadas ni soporte documentado en runtimes de inferencia habituales, lo que complica el despliegue en hardware modesto.
- El formato PyTorch distributed checkpoint requiere consolidar los pesos fragmentados antes de la inferencia.
- El conjunto de datos de entrenamiento (`ubr-physical-ai/g1_hug_v5`) es privado, por lo que no se puede reproducir el entrenamiento sin acceso al mismo.
- Repositorio con 0 descargas y 0 *likes* en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ubr-physical-ai/g1-hug-edge-concat-v5-n256
- Organización UB Robotics en HuggingFace: https://huggingface.co/ubr-physical-ai
- Space "Cosmos3-Edge UGV Findings": https://huggingface.co/spaces/ubr-physical-ai/cosmos3-edge-ugv-findings
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge
- Conjunto de demostraciones (privado): https://huggingface.co/ubr-physical-ai/g1_hug_v5
- Physical AI Studio (framework de aprendizaje por imitación): https://github.com/open-edge-platform/physical-ai-studio
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
