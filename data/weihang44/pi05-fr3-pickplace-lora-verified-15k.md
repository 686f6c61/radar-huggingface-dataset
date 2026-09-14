# weihang44/pi05-fr3-pickplace-lora-verified-15k

## Resumen

pi05-fr3-pickplace-lora-verified-15k es un checkpoint experimental de robótica publicado por el usuario weihang44, consistente en una política **pi0.5-base** adaptada mediante la receta LoRA de OpenPI para una tarea concreta de manipulación en simulación: coger un cubo rojo y depositarlo en un contenedor azul con un robot Franka FR3 dentro del simulador MuJoCo. No se inicializa desde pi0.5-DROID; las transformaciones de entrada con forma DROID se emplean únicamente para encajar con la interfaz de cámara, articulaciones y pinza de un brazo único.

El repositorio contiene el **árbol completo de parámetros de inferencia en formato JAX/Orbax** (parámetros base congelados más los parámetros LoRA entrenados) junto con las estadísticas de normalización correspondientes. El autor advierte explícitamente de que no es un archivo PEFT solo de adaptadores, ni un modelo fusionado sin LoRA, ni un checkpoint cargable con `from_pretrained` de Transformers o LeRobot. El tamaño del repositorio es de 6,3 GB.

La relevancia de esta ficha es acotada y debe entenderse como tal: se trata de un artefacto de investigación reproducible sobre una tarea fija, con 25 demostraciones de entrenamiento y una evaluación de bucle cerrado de 18 intentos sobre escenas fijas. Su interés principal es metodológico (receta LoRA sobre OpenPI y trazabilidad de datos), no como modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) pi0.5-base; PaliGemma (gemma_2b) como componente de visión-lenguaje y experto de acción gemma_300m |
| Parámetros totales | No disponible como cifra global; los submódulos adaptados son gemma_2b (PaliGemma) y gemma_300m (experto de acción) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (se distribuye el árbol de parámetros JAX/Orbax sin indicación de cuantización) |
| Idiomas soportados | en (inglés) |
| Licencia | gemma |
| Formato de pesos | JAX/Orbax (árbol completo de inferencia: base congelada + LoRA + estadísticas de normalización) |
| Horizonte de acción | 16 pasos; dimensión de acción del modelo rellenada hasta 32 |
| Salida del modelo | `actions` con forma `(16, 8)`: siete objetivos absolutos de posición articular en radianes más cierre continuo normalizado de pinza |
| Tamaño del repositorio | 6,3 GB |

## Arquitectura y entrenamiento

La política parte del checkpoint oficial `gs://openpi-assets/checkpoints/pi05_base` y aplica la receta LoRA de OpenPI: `gemma_2b_lora` sobre PaliGemma y `gemma_300m_lora` sobre el experto de acción. El entrenamiento se ejecutó durante 15.000 pasos de optimizador (último índice de checkpoint, 14999) con batch global de 48, optimizador AdamW y recorte de norma de gradiente de 1,0. La tasa de aprendizaje usa 1.000 pasos de calentamiento, un pico de 2,5e-5 y decaimiento coseno hasta 2,5e-6. EMA desactivado. La pérdida de entrenamiento final registrada es aproximadamente 0,0015, cifra que el propio autor advierte que no es una métrica de validación.

Los datos de entrenamiento consisten en 25 demostraciones limpias, con 5.640 fotogramas renderizados a 15 Hz; el conjunto de holdout son 5 demostraciones con 716 fotogramas. El archivo de origen contenía 57 demostraciones verificadas, de modo que el reparto suministrado deja 27 sin usar. Se resamplearon trayectorias limpias completas (incluida la fase de liberación) a 15 Hz y las imágenes se renderizaron a partir de estados de MuJoCo grabados. Las etiquetas articulares originales eran objetivos servo absolutos de la siguiente muestra; las transformaciones de entrenamiento convierten las siete dimensiones del brazo a deltas relativas a la observación actual, mientras que los objetivos de pinza permanecen continuos. La normalización es de tipo cuantil y se calcularon estadísticas nuevas usando solo el conjunto de entrenamiento. Los identificadores exactos están en `training_config.json` y `data_provenance.json`.

## Capacidades

- Generación de acciones de manipulación robótica: produce trayectorias de 16 pasos con siete objetivos absolutos de posición articular en radianes más cierre continuo de pinza.
- Ejecución de una tarea concreta de pick-and-place: coger el cubo rojo y depositarlo en el contenedor azul, condicionada por una cadena de instrucción (`prompt`).
- Percepción visual desde dos cámaras: imagen exterior (`observation/exterior_image_1_left`) e imagen de muñeca (`observation/wrist_image_left`), ambas RGB uint8 de 224x224.
- Entrada proprioceptiva: siete ángulos articulares del FR3 en radianes y cierre normalizado de pinza (0 = abierto, 1 = cerrado).
- Inferencia en bucle cerrado: el presupuesto de evaluación es de 400 pasos de política a 15 Hz, ejecutando cuatro acciones entre consultas al modelo.
- Servicio local mediante `fr3_policy.py` (modo `--smoke-test` y servidor en `--port 8000`).
- Integración programática vía `load_policy` y `policy.infer(observation)`.
- No se documentan capacidades de tool calling, function calling, agentes, multilingüismo, audio ni modo de razonamiento explícito; la única lengua declarada es el inglés.

## Casos de uso

- Reproducción de investigación sobre recetas LoRA en OpenPI: el repositorio incluye la configuración de entrenamiento y la procedencia de datos, lo que permite replicar el ajuste de `gemma_2b_lora` y `gemma_300m_lora` sobre el checkpoint base pi05_base con los mismos hiperparámetros (15.000 pasos, batch 48, AdamW).
- Evaluación comparativa de métodos de adaptación eficiente: sirve como referencia controlada para medir cuánto rendimiento se obtiene con 25 demostraciones y LoRA frente a otras estrategias de ajuste en una tarea de manipulación simulada.
- Banco de pruebas de bucle cerrado en MuJoCo: la colección `seen_success_rollouts` incluye estados iniciales, escenas MuJoCo portables, mallas del robot y un script de reproducción autónomo, lo que permite reejecutar físicamente diez trayectorias exitosas y validar la reproducibilidad del entorno.
- Validación de interfaces de control robótico: el modelo devuelve objetivos articulares absolutos que se recortan a los límites del robot y se aplican a 15 Hz, con mapeo del cierre de pinza a una apertura de `0,08 * (1 - closure)` metros; es útil para probar controladores, límites y temporización antes de tocar hardware.
- Análisis de modos de fallo en agarre: el autor documenta que la mayoría de fallos ocurren antes de un levantamiento exitoso y que un intento levantó tarde y agotó el tiempo sin colocar la pieza, lo que convierte el artefacto en material útil para estudiar fallos de política en tareas de pick-and-place.
- Integración en pipelines de experimentación con OpenPI: permite probar el flujo completo de `snapshot_download`, carga de políticas, servicio local por puerto e inferencia por diccionario de observaciones antes de escalar a otros dominios.
- Docencia y demostraciones de VLA en simulación: con una única instrucción en inglés y un entorno MuJoCo acotado, resulta adecuado para ilustrar el ciclo percepción-acción de un modelo visión-lenguaje-acción sin necesidad de robot físico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni similares) en la información disponible. Los únicos datos de rendimiento son de evaluación en bucle cerrado sobre escenas fijas, con tres intentos estocásticos por escena y solo el checkpoint final:

| Grupo evaluado | Éxitos / intentos | Tasa |
|---|---:|---:|
| Demostraciones de holdout, disposiciones vistas | 4 / 9 | 44,4 % |
| Demostraciones de holdout, disposiciones no vistas | 2 / 6 | 33,3 % |
| Todas las escenas de holdout | 6 / 15 | 40,0 % |
| Escena nominal | 0 / 3 | 0,0 % |
| Todos los intentos evaluados | 6 / 18 | 33,3 % |

Condiciones de la evaluación: el éxito exige un levantamiento de al menos 3 cm con contacto del robot, seguido de al menos 0,5 segundos asentado dentro del contenedor, con contacto con el suelo del contenedor y sin contacto del robot. El presupuesto es de 400 pasos de política a 15 Hz más hasta 15 pasos de asentamiento, ejecutando cuatro acciones entre consultas. Los seis éxitos superan la prueba de liberación más estricta. Resultados completos en `evaluation/results.json`.

Advertencias del autor sobre estos números: el holdout suministrado no es completamente disjunto en cuanto a disposiciones (tres de sus cinco disposiciones también aparecen en entrenamiento), y se trata de pruebas pequeñas sobre escenas fijas, no de una estimación amplia de fiabilidad en despliegue. La colección de diez éxitos seleccionados no constituye una evaluación con tasa de éxito del 100 % y no sustituye a los resultados anteriores.

## Requisitos de hardware

- La evaluación de inferencia original se realizó en una NVIDIA H200, según indica la model card.
- VRAM estimada para inferencia: no disponible. El repositorio ocupa 6,3 GB e incluye el árbol completo de parámetros (base congelada más LoRA) y las estadísticas de normalización, pero no se publican cifras de memoria.
- GPU recomendadas por el autor: no disponibles más allá de la H200 empleada. No se documenta compatibilidad con GPU de consumo.
- ¿Cabe en GPU de consumo? No disponible; no hay datos publicados al respecto.
- Opciones de despliegue: OpenPI (probado con Python 3.11 y el commit `215abfb217dbac7d5f1273282331b9b1866c0479`), mediante `fr3_policy.py` en modo `--smoke-test` o como servidor local en `--port 8000`, e integración por `load_policy` y `policy.infer(observation)`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Se conoce la frecuencia de control efectiva de 15 Hz y la ejecución de cuatro acciones entre consultas al modelo.
- Requisito adicional: OpenPI puede descargar su tokenizador público de PaliGemma en el primer uso.

## Comparativa con modelos similares

No se han encontrado en la información proporcionada modelos comparables con datos numéricos que permitan una comparación rigurosa. La propia model card menciona dos referencias del ecosistema pi0.5, pero sin cifras comparativas:

| Referencia | Relación con este modelo | Datos comparativos |
|---|---|---|
| pi0.5-base (`gs://openpi-assets/checkpoints/pi05_base`) | Checkpoint base sobre el que se aplica el LoRA | No disponible |
| pi0.5-DROID | Inicialización que este modelo **no** utiliza | No disponible |

Los resultados de búsqueda web recibidos no contienen información relevante sobre el modelo ni sobre alternativas comparables.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos, pero el entrenamiento se limita a 25 demostraciones de una única tarea y un único entorno simulado, por lo que el comportamiento fuera de esa distribución no está caracterizado.
- Riesgo de alucinación y de fallo físico: la tasa de éxito global medida es del 33,3 % sobre 18 intentos y del 40,0 % sobre las 15 escenas de holdout; en la escena nominal el resultado fue 0 de 3. La mayoría de fallos ocurrieron antes de un levantamiento exitoso.
- Limitación de evaluación: el holdout no es enteramente disjunto en disposiciones (tres de cinco coinciden con entrenamiento) y se trata de pruebas pequeñas sobre escenas fijas, no de una estimación de fiabilidad en despliegue.
- Limitación de idioma: solo inglés (`en`), con una única instrucción de tarea.
- Limitación de formato: no es un adaptador PEFT aislado, ni un modelo fusionado sin LoRA, ni un checkpoint cargable con `from_pretrained` de Transformers o LeRobot. Requiere el entorno OpenPI.
- Restricciones de licencia: licencia `gemma`, sujeta a los términos de uso de Gemma; conviene revisar las condiciones de uso comercial antes de cualquier explotación.
- Contenido no incluido: no se distribuyen el estado del optimizador, las demostraciones en bruto, credenciales ni el repositorio privado de simulación.
- Advertencia de seguridad en control: la prueba de humo (`--smoke-test`) solo verifica formas y salidas finitas sobre imágenes ficticias; no comprueba el éxito de la tarea ni acciona hardware. Las acciones son objetivos absolutos de posición articular (no velocidades) y el cargador ya restaura los objetivos absolutos: no se debe reaplicar normalización ni conversión a deltas.
- Requisitos de coincidencia de entorno: cámaras, geometría del robot, ganancias y temporización de acciones deben coincidir con los del entrenamiento (la model card se interrumpe en este punto al enumerar los elementos que deben coincidir).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/weihang44/pi05-fr3-pickplace-lora-verified-15k
- Repositorio y instrucciones de instalación de OpenPI: https://github.com/Physical-Intelligence/openpi
- Rollout exitoso: `examples/success.mp4`
- Rollout con fallo de agarre: `examples/failure.mp4`
- Colección de diez éxitos reproducibles y guía de configuración: `seen_success_rollouts/README.md`
- Resultados completos de evaluación: `evaluation/results.json`
- Configuración de entrenamiento: `training_config.json`
- Procedencia de datos: `data_provenance.json`
- Script de política e inferencia: `fr3_policy.py`
- Checkpoint base referenciado: `gs://openpi-assets/checkpoints/pi05_base`
- Búsqueda web: los resultados recibidos tratan sobre husos horarios (Central Time Zone) y no guardan relación con este modelo; no se han encontrado papers, blogs ni demos adicionales en la información disponible.
