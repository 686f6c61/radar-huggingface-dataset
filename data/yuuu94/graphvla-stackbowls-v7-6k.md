# yuuu94/GraphVLA-StackBowls-V7-6k

## Resumen

GraphVLA-StackBowls-V7-6k es un checkpoint de un modelo visión-lenguaje-acción (VLA) para robótica de doble brazo, publicado por el usuario yuuu94 en Hugging Face. Se trata de un modelo entrenado para la tarea concreta de apilar cuencos ("stack bowls") en un entorno real, y se distribuye siguiendo la convención de directorios del release W2-VLA, con un cargador específico de GraphVLA y estadísticas de normalización para 14 dimensiones de acción conjunta.

El modelo combina un backbone Qwen3-VL-4B-Instruct con un cabezal de difusión DiT-B (GR00T), y procesa cuatro vistas RGB junto con el estado articular bruto de 14 dimensiones. Incorpora mecanismos propios de GraphVLA, como pooling de grafo ponderado por cobertura de máscara (V7) y un GRU de aristas. El entrenamiento se realizó sobre 72 trayectorias, con 9 trayectorias de validación excluidas de las estadísticas.

Es relevante por su carácter de release reproducible y verificable: incluye cargador, configuración, normalización y manifiestos, y separa explícitamente el checkpoint de inferencia del estado del optimizador. No obstante, es un artefacto muy especializado, sin tasa de éxito real declarada, sin licencia especificada y con dependencias de percepción externas no incluidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL-4B (backbone VLM) + GR00T DiT-B (cabezal de difusión); GraphVLA con pooling de grafo ponderado por cobertura de máscara (V7) y GRU de aristas |
| Parametros totales | no disponible (el backbone es Qwen3-VL-4B-Instruct; el total del conjunto no se declara) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el upstream Qwen3-VL-4B-Instruct es Apache-2.0) |
| Formato de pesos | PyTorch state_dict (`checkpoints/graphvla_stackbowls_v7_step006000.pt`), cargado con `weights_only=True` |

## Arquitectura y entrenamiento

La arquitectura combina un modelo de visión-lenguaje Qwen3-VL-4B-Instruct como backbone con un cabezal de difusión DiT-B de la familia GR00T. La entrada consiste en cuatro vistas RGB y el estado articular bruto de 14 dimensiones (6 articulaciones izquierdas, pinza izquierda, 6 articulaciones derechas, pinza derecha). Sobre esta base, GraphVLA añade pooling de grafo ponderado por cobertura de máscara (variante V7) y un GRU de aristas, orientados a modelar relaciones entre entidades de la escena.

El entrenamiento se realizó sobre 72 trayectorias del dataset `stack_bowls`, con 9 trayectorias de validación excluidas de las estadísticas de normalización. Las acciones son objetivos absolutos de 14 articulaciones con horizonte de predicción 16, de los cuales se ejecutan los primeros 8 en despliegue. La normalización de estado es `(raw - mean) / max(std, 1e-6)` y la de acción invierte exactamente esa operación una sola vez. Las unidades son radianes para articulaciones y apertura total en metros para las pinzas. El checkpoint entregado es solo de modelo (sin estado del optimizador ni memoria de episodio), por lo que sirve para inferencia o inicialización, no para reanudar un entrenamiento exacto.

## Capacidades

- Control robótico de doble brazo para la tarea de apilar cuencos, con predicción de acciones absolutas de 14 articulaciones.
- Percepción multimodal a partir de cuatro vistas RGB simultáneas.
- Condicionamiento en estado articular bruto (14 dimensiones) normalizado con estadísticas del split de entrenamiento.
- Predicción con horizonte de 16 pasos y ejecución de los primeros 8 (control por trozos de acción).
- Integración con un pipeline de percepción externo basado en YOLOE, SAM3, Cutie y DA3 (pesos no incluidos en el release).
- Carga determinista del state_dict en CPU para validación de parámetros (sin conexión ni actuación sobre robot).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo ni modo de pensamiento.

## Casos de uso

- Investigación en manipulación bimanual: servir como punto de partida reproducible para estudiar políticas VLA en tareas de apilado, cargando el checkpoint con `load_policy.py` y comparando variantes 6k, 10k y 12k.
- Inicialización de fine-tuning: usar el state_dict como pesos iniciales para otras tareas de doble brazo, aprovechando que el release incluye normalización y estadísticas del dataset.
- Validación de arquitecturas GraphVLA: emplear el cargador y la configuración para verificar la construcción exacta del grafo y del cabezal de acción antes de desplegar en un entorno real.
- Reproducción de pipelines de percepción: integrar el modelo con los pesos externos de YOLOE, SAM3, Cutie y DA3 para reconstruir el sistema completo de percepción y control.
- Benchmarking interno de políticas VLA: comparar el rendimiento de esta política frente a otras variantes sobre el mismo conjunto de validación (9 trayectorias excluidas del entrenamiento).
- Docencia y demostraciones de robótica: mostrar el flujo completo de carga, normalización y predicción de acciones en CPU sin necesidad de hardware robótico.
- Estudio de normalización de acciones: analizar el efecto de la normalización por dimensión (media/desviación del split de entrenamiento) en la estabilidad de las políticas de difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no se reclama ninguna tasa de éxito en el mundo real para este release.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 18,4 GB e incluye pesos de Qwen3-VL-4B, el cabezal DiT-B y artefactos de entrenamiento; la huella en memoria de inferencia no se declara.
- GPU recomendadas: no disponible. El release no especifica GPU objetivo; el cargador admite `--device cpu` para validación de parámetros.
- Compatibilidad con GPU de consumo: no confirmada; depende del tamaño efectivo del conjunto (backbone de 4B más cabezal) y de la cuantización, que no se documenta.
- Opciones de despliegue: carga mediante `load_policy.py` con dependencias de `code/requirements.txt` y el entorno de entrenamiento archivado; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Dependencias adicionales en despliegue online: pesos de YOLOE, SAM3, Cutie y DA3, activos y calibración del robot, y frontend de cámara/CAN, no incluidos en el repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GraphVLA-StackBowls-V7-6k | no disponible (backbone 4B) | no disponible | Apilado bimanual real | no disponible | Hugging Face, 14 descargas |
| GraphVLA-StackBowls-V7-10k | no disponible (backbone 4B) | no disponible | Apilado bimanual real | no disponible | Hugging Face (mismo autor) |
| GraphVLA-StackBowls-V7-12k | no disponible (backbone 4B) | no disponible | Apilado bimanual real | no disponible | Hugging Face (mismo autor) |
| Qwen3-VL-4B-Instruct | 4B | no disponible | VLM general | Apache-2.0 | Hugging Face (upstream) |

Las variantes 6k, 10k y 12k del mismo autor difieren en el número de pasos de entrenamiento; no se han publicado métricas comparativas entre ellas en la información disponible. No se dispone de datos de otros modelos VLA comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: entrenado únicamente para la tarea `stack_bowls` con 72 trayectorias; no es un modelo generalista.
- Sin tasa de éxito declarada en el mundo real; el autor indica explícitamente que no se reclama ninguna.
- Licencia no especificada en el repositorio; el uso comercial queda condicionado por las licencias del upstream (Qwen3-VL-4B-Instruct, Apache-2.0) y del software asociado.
- El checkpoint es solo de modelo: no contiene estado del optimizador ni memoria de episodio en curso, por lo que no permite reanudar un entrenamiento exacto.
- El despliegue real requiere pesos de percepción externos (YOLOE, SAM3, Cutie, DA3), activos y calibración del robot y frontend de cámara/CAN, que no se incluyen.
- `config.yaml` incluye `execution.mode: test_only` heredado del constructor de arquitectura validado; no describe el entrenamiento original (recogido en `effective_config.yaml`).
- El cargador de W2-VLA original y sus valores por defecto de normalización de LIBERO no son compatibles; debe usarse el cargador GraphVLA incluido.
- Riesgo de alucinación y sesgos: no evaluado ni documentado para este release.
- Idiomas soportados no declarados; el modelo está orientado a control robótico, no a generación de texto multilingüe.
- Repositorio de gran tamaño (18,4 GB) con artefactos de entrenamiento adicionales (DeepSpeed checkpoint original, archivo fuente y manifiestos) que pueden confundir la selección del checkpoint de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yuuu94/GraphVLA-StackBowls-V7-6k
- Variante 10k: https://huggingface.co/yuuu94/GraphVLA-StackBowls-V7-10k
- Variante 12k: https://huggingface.co/yuuu94/GraphVLA-StackBowls-V7-12k
- Modelo upstream: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
