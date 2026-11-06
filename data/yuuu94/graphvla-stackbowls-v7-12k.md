# yuuu94/GraphVLA-StackBowls-V7-12k

## Resumen

GraphVLA-StackBowls-V7-12k es un checkpoint de política robótica de tipo vision-language-action (VLA) entrenado para la tarea real de apilar cuencos ("Stack Bowls") con un robot de doble brazo. Lo publica el usuario yuuu94 en Hugging Face y se distribuye como un paquete de inferencia con pesos PyTorch, configuración, estadísticas de normalización y un cargador específico (`load_policy.py`). No es un modelo de lenguaje generalista, sino un artefacto de despliegue robótico: recibe cuatro vistas RGB y el estado articular de 14 dimensiones y emite acciones articulares absolutas.

El modelo combina un backbone Qwen3-VL-4B-Instruct con un cabezal de difusión DiT-B (estilo GR00T) y un módulo de agregación gráfica propio de la familia GraphVLA (V7), con pooling de parches visuales ponderado por cobertura de máscara y una GRU de aristas. El checkpoint corresponde al paso 12.000 de entrenamiento y se publica junto a las versiones de 6k y 10k, además de otros checkpoints de la misma familia.

Su relevancia es acotada pero concreta: documenta una receta reproducible de VLA de doble brazo en entorno real, con convenciones de normalización explícitas (media/desviación típica por dimensión sobre el split de entrenamiento), horizonte de predicción de 16 pasos y ejecución de los 8 primeros. El autor no reclama ninguna tasa de éxito en mundo real para esta release, y el paquete no incluye los pesos de percepción (YOLOE, SAM3, Cutie, DA3) ni las interfaces de robot necesarias para el despliegue online.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3-VL-4B (VLM) + cabezal de difusión DiT-B + agregación gráfica GraphVLA V7 (pooling de parches ponderado por máscara y GRU de aristas) |
| Parámetros totales | no disponible (el backbone Qwen3-VL-4B-Instruct tiene 4B; el total del conjunto no se declara) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (se distribuye checkpoint en PyTorch, `weights_only=True`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible para la release; el upstream Qwen3-VL-4B-Instruct es Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (state_dict de solo modelo) + `config.yaml`, `dataset_statistics.json`, `normalization.json`, `load_policy.py`, `code/`, `assets/Qwen3-VL-4B-Instruct/` |

## Arquitectura y entrenamiento

La arquitectura es un VLA híbrido: un backbone vision-language Qwen3-VL-4B-Instruct procesa cuatro vistas RGB junto con el estado articular bruto de 14 dimensiones (6 articulaciones izquierdas, pinza izquierda, 6 articulaciones derechas, pinza derecha; articulaciones en radianes y pinza como apertura total en metros). Sobre esa representación actúa un cabezal de difusión DiT-B (familia GR00T) que genera acciones, y un módulo gráfico propio de GraphVLA V7 con pooling de parches visuales ponderado por cobertura de máscara y una GRU sobre aristas. Las acciones son objetivos articulares absolutos de 14 dimensiones con horizonte de predicción 16, de los que el despliegue ejecuta los 8 primeros.

El entrenamiento se realizó sobre 72 trayectorias del dataset `stack_bowls`; 9 trayectorias de validación se excluyeron del cálculo de estadísticas. La normalización de estado es `(raw - mean) / max(std, 1e-6)` y la desnormalización de acción aplica `normalized * max(std, 1e-6) + mean` exactamente una vez; las 14 dimensiones de acción se normalizaron y la máscara de acción es toda verdadera. El paquete no incluye estado del optimizador ni memoria de episodio, por lo que sirve para inferencia o inicialización, no para reanudar el entrenamiento exactamente. `config.yaml` es la configuración de construcción e inferencia (con `execution.mode: test_only` heredado del constructor validado), mientras que `effective_config.yaml` registra la ejecución real de entrenamiento.

## Capacidades

- Control robótico de doble brazo para la tarea específica de apilar cuencos, con salida de acciones articulares absolutas de 14 dimensiones.
- Percepción multimodal a partir de cuatro vistas RGB combinadas con estado propioceptivo articular.
- Predicción de horizonte de acción de 16 pasos con ejecución de los 8 primeros (control por trozos de acción).
- Agregación gráfica de información visual mediante pooling ponderado por cobertura de máscara y GRU de aristas (V7).
- Carga en CPU para validación de parámetros mediante `load_policy.py` (no conecta ni acciona ningún robot).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, matemáticas ni generación de texto generalista; el modelo se distribuye como política de control, no como asistente.

## Casos de uso

- Investigación en VLA de doble brazo: reproducir o comparar la receta GraphVLA V7 sobre una tarea real de manipulación ("Stack Bowls") usando el checkpoint de 12.000 pasos como referencia de convergencia frente a las versiones de 6k y 10k.
- Inicialización de políticas para tareas de apilado: el checkpoint puede servir como punto de partida para ajuste fino en tareas de manipulación similares con robots de dos brazos y 14 grados de libertad.
- Evaluación de pipelines de normalización: `dataset_statistics.json` y `normalization.json` permiten verificar implementaciones de normalización/desnormalización de estado y acción antes de integrar el modelo en un stack propio.
- Validación de integración en CPU: usar `load_policy.py` para comprobar que el grafo de cómputo y el state_dict cargan correctamente (`weights_only=True`) en un entorno de CI sin GPU ni robot.
- Estudio de arquitecturas híbridas VLM + difusión + grafo: el paquete documenta la separación entre backbone Qwen3-VL, cabezal DiT-B y módulo gráfico, útil para análisis comparativos de diseños VLA.
- Base para despliegue en laboratorio con percepción externa: integrado con los pesos de YOLOE/SAM3/Cutie/DA3, los assets de robot, la calibración y el frontend de cámara/CAN que el autor indica como necesarios y que no se incluyen en el repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no se reclama ninguna tasa de éxito en mundo real para esta release.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 9,2 GB e incluye el checkpoint y los metadatos del tokenizador/procesador de Qwen3-VL-4B-Instruct; el backbone de 4B condiciona el consumo, pero no se publican cifras.
- GPU recomendadas: no disponible. No se documentan requisitos de GPU para el despliegue.
- Compatibilidad con GPU de consumo: no disponible.
- Despliegue: el paquete está pensado para cargarse con `load_policy.py` y las dependencias de `code/requirements.txt`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política). El despliegue online requiere además pesos de YOLOE/SAM3/Cutie/DA3, assets y calibración del robot y frontend de cámara/CAN, no incluidos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GraphVLA-StackBowls-V7-12k | no disponible (backbone 4B) | no disponible | VLA doble brazo, Stack Bowls | no disponible | Hugging Face (yuuu94) |
| GraphVLA-StackBowls-V7-6k | no disponible (backbone 4B) | no disponible | VLA doble brazo, Stack Bowls (paso 6.000) | no disponible | Hugging Face (yuuu94) |
| GraphVLA-StackBowls-V7-10k | no disponible (backbone 4B) | no disponible | VLA doble brazo, Stack Bowls (paso 10.000) | no disponible | Hugging Face (yuuu94) |
| GraphVLA-V7-31527 | no disponible (backbone 4B) | no disponible | VLA V7 con estado de reanudación DeepSpeed ZeRO-2 de cuatro rangos | no disponible | Hugging Face (yuuu94) |

No se dispone de datos de benchmarks ni de modelos de terceros comparables en la información proporcionada.

## Limitaciones y advertencias

- El autor no reclama ninguna tasa de éxito en mundo real; no hay evaluación publicada de esta release.
- El checkpoint es de solo modelo: no contiene estado del optimizador ni memoria de episodio en curso, por lo que no permite reanudar el entrenamiento de forma exacta.
- No es un checkpoint `AutoModel`; requiere el código y el cargador específicos de GraphVLA V7 y las dependencias de `code/requirements.txt` junto con el entorno de entrenamiento archivado.
- El despliegue online necesita pesos de percepción (YOLOE, SAM3, Cutie, DA3), assets y calibración del robot y frontend de cámara/CAN que no se incluyen en el repositorio.
- La licencia de la release no está disponible; el uso queda sujeto a las licencias aplicables del modelo upstream (Qwen3-VL-4B-Instruct, Apache-2.0) y del software utilizado.
- El modelo está entrenado sobre solo 72 trayectorias de una única tarea; se desconoce su generalización a otras tareas, entornos o configuraciones de robot.
- `config.yaml` incluye `execution.mode: test_only` heredado del constructor de la arquitectura; no describe la ejecución original de entrenamiento.
- No se documentan sesgos, riesgos de alucinación ni cobertura idiomática, al no ser un modelo generativo de texto de propósito general.
- Los datos de normalización corresponden al split de entrenamiento; usar estadísticas distintas puede degradar el control.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yuuu94/GraphVLA-StackBowls-V7-12k
- Versión 6k: https://huggingface.co/yuuu94/GraphVLA-StackBowls-V7-6k
- Versión 10k: https://huggingface.co/yuuu94/GraphVLA-StackBowls-V7-10k
- Versión 4k: https://huggingface.co/yuuu94/GraphVLA-StackBowls-V7-4k
- GraphVLA-V7-31527: https://huggingface.co/yuuu94/GraphVLA-V7-31527
- Modelo upstream: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
