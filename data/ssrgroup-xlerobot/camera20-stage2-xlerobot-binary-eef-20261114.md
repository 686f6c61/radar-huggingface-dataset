# ssrgroup-xlerobot/camera20-stage2-xlerobot-binary-eef-20261114

## Resumen

Camera20 Stage2 → XLeRobot es un modelo de visión-lenguaje-acción (VLA) orientado a robótica manipulativa bimanual, desarrollado por el grupo ssrgroup-xlerobot. Parte de una base Qwen3.5-4B sobre la que se añade un transformer de mezcla de tareas (MoT) de 32 capas, y se entrena en dos etapas: una primera fase de preentrenamiento mixto con datos de robot y ego, seguida de microajuste por tarea. El modelo predice acciones absolutas de efector final (EEF) para ambas extremidades, junto con comandos de pinza binarios, a partir de observaciones sincronizadas de estado y tres cámaras RGB.

La relevancia actual del modelo reside en su enfoque de pinza binaria con umbrales calibrados por brazo (no un simple corte en 50 sobre escala 0-100), su uso de flow matching para la generación de trayectorias y su empaquetado autocontenido: los pesos completos de Qwen y del MoT se incluyen en el checkpoint, evitando dependencias de descargas adicionales. El contexto temporal nativo es de 30 Hz con horizonte H16 (unos 0,53 segundos), y la salida se expresa en el marco `base_link` de cada brazo con el efector en `gripper_frame_link`.

El repositorio, de 45,4 GB, contiene cuatro checkpoints correspondientes a dos tareas (`green_red_blocks` y `fruit`), con distintos pasos de microajuste. No se han publicado resultados de rollout en robot real ni benchmarks estandarizados; las únicas métricas disponibles son pérdidas de flow en validación. La licencia de los pesos no está declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action basada en Qwen3.5-4B + transformer MoT de 32 capas, con flow matching |
| Parametros totales | no disponible (base Qwen3.5-4B más MoT de 32 capas; cifra exacta no publicada) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana temporal nativa de 30 Hz con horizonte H16, ~0,53 s) |
| Tipos de cuantizacion | no disponible (pesos en `model.pt` float, carga estricta) |
| Idiomas soportados | no disponible |
| Licencia | no disponible para los pesos; `camera20_inference/LICENSE` cubre el código derivado de StarVLA |
| Formato de pesos | `model.pt` (PyTorch), con `config.yaml`, `normalization.json`, `model_info.json` y `CHECKPOINT_MANIFEST.json` |

## Arquitectura y entrenamiento

El modelo combina un backbone de lenguaje y visión Qwen3.5-4B con un transformer MoT de 32 capas que actúa como cabecera de acción. La generación de acciones emplea flow matching, con 4 pasos de integración en inferencia. Las acciones se representan internamente en el espacio "Common23": posición xyz y rotación en 6D para cada brazo, más las dos pinzas, con las tres dimensiones de cintura enmascaradas. La rotación 6D corresponde a las dos primeras columnas de la matriz de rotación concatenadas por columnas, y la API externa usa cuaterniones xyzw, con ortogonalización de Gram–Schmidt aplicada a las columnas predichas antes de la salida.

El entrenamiento se estructura en dos etapas. La Stage2 mezcla datos de robot y ego hasta 283.350 pasos y produce los pesos de inicialización. Sobre ellos se microajusta por tarea con presupuesto completo de parámetros: 30.000 pasos, batch global de 128, 8 GPUs, EMA de 0,999, learning rate de 2,5e-5 con warmup de 1.000 pasos y decaimiento coseno hasta 2,5e-6. Cada tarea usa 36 trayectorias de entrenamiento, reservando los episodios 9, 19, 29 y 39 para validación, y se evalúa cada 1.000 pasos con 64 frames fijos mediante pérdida de flow sobre el modelo EMA. Los checkpoints contienen únicamente el modelo EMA y metadatos de inferencia, sin estado del optimizador, por lo que no permiten reanudar el entrenamiento AdamW de forma exacta.

## Capacidades

- Predicción de acciones absolutas de efector final bimanual (posición en metros y cuaternión xyzw) en el marco `base_link` de cada brazo, con efector en `gripper_frame_link`.
- Generación de comandos de pinza binarios (0 = cerrado, 1 = abierto) mediante umbrales calibrados por brazo.
- Procesamiento conjunto de tres cámaras RGB (cabeza, muñeca izquierda, muñeca derecha) junto con el estado de 16 dimensiones.
- Condicionamiento por tarea mediante prompt y selección explícita de checkpoint (`--task` y `--checkpoint`).
- Flow matching con 4 pasos de integración para la generación de trayectorias de acción.
- Conversión opcional de la salida binaria a escala de grabación original (`--gripper-output recorded-scale`), mapeando a los centros representativos congelados.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito más allá del uso como política VLA.

## Casos de uso

- Manipulación bimanual con pinza binaria en tareas de clasificación de bloques: el checkpoint `green_red_blocks` permite generar trayectorias absolutas de EEF para separar bloques verdes y rojos, aprovechando los umbrales de pinza calibrados por brazo para evitar falsos cierres.
- Recogida de fruta en entorno de laboratorio: los checkpoints `fruit/step_005000` a `step_015000` permiten evaluar el efecto del número de pasos de microajuste sobre la pérdida de flow antes de desplegar en hardware.
- Integración en bucles de control sincronizado: el modelo produce un horizonte de 16 pasos a 30 Hz (~0,53 s), adecuado para políticas de control por recesión de horizonte con planificación cartesiana posterior.
- Evaluación comparativa de etapas de entrenamiento: al disponer de varios checkpoints por tarea, se puede medir la evolución de la pérdida de validación y correlacionarla con el comportamiento en robot real.
- Desarrollo de pipelines de investigación en VLA: el paquete incluye `processor/`, `camera20_inference/` e `infer_eef.py`, lo que facilita la reproducción de inferencia con observaciones reales y la comparación con marcos como StarVLA.
- Conversión a escala de grabación para controladores existentes: mediante `actions_recorded_scale` se pueden mapear las salidas binarias a los centros congelados (izquierda cerrado 0,51617 / abierto 30,10845; derecha cerrado 0,80133 / abierto 31,68089) para interfaces que esperan la escala original 0-100.
- Validación de normalización y calibración: el repositorio incluye comprobaciones de frontera de pinza, ida y vuelta de cuaterniones y máscara de cintura, útil para auditar la coherencia entre entrenamiento e inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K ni métricas de éxito en robot real) en la información disponible. Las únicas métricas publicadas son pérdidas de flow en validación sobre el modelo EMA:

| Tarea | Checkpoint | Pasos de microajuste | Pérdida de flow en validación (EMA) |
|---|---|---:|---:|
| `green_red_blocks` | `final` | 30.000 | 0,016180 |
| `fruit` | `step_005000` | 5.000 | 0,008298 |
| `fruit` | `step_010000` | 10.000 | 0,009553 |
| `fruit` | `step_015000` | 15.000 | 0,011360 |

El autor advierte explícitamente que la pérdida de validación es diagnóstica y no equivale a tasa de éxito en robot real. Ninguna versión subida cuenta con resultados de rollout en hardware.

## Requisitos de hardware

- Entorno verificado por el autor: Python 3.10, PyTorch 2.8.0+cu128, Transformers 5.3.0, Flash Linear Attention 0.3.2, Triton 3.4.0 y NVIDIA H100.
- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 45,4 GB y los pesos se cargan en `model.pt` con carga estricta, por lo que se requiere una GPU con memoria suficiente para el conjunto Qwen3.5-4B más el MoT de 32 capas en precisión completa.
- GPU recomendadas: H100 (única verificada por el autor). No se documenta compatibilidad con A100, RTX 4090 ni otras consumer GPU.
- No se indica si cabe en GPU de consumo; dada la ausencia de cuantizaciones publicadas, no hay ruta documentada para ello.
- Opciones de despliegue: inferencia vía `infer_eef.py` (CLI) o mediante la clase `Camera20Policy` del paquete `camera20_inference`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- La primera inferencia compila kernels CUDA/Triton, lo que añade latencia inicial no cuantificada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Camera20 Stage2 → XLeRobot (este modelo) | Base Qwen3.5-4B + MoT 32 capas (total no publicado) | Ventana temporal 30 Hz, H16 (~0,53 s) | VLA bimanual con flow matching y pinza binaria | Pesos sin licencia declarada; código derivado de StarVLA con licencia propia | Hugging Face, 0 descargas, 0 likes |
| Pi0.5 (referencia citada por el autor) | no disponible | no disponible | VLA con flow matching | no disponible | no disponible |
| StarVLA (origen del código de inferencia) | no disponible | no disponible | Marco VLA | Licencia incluida en `camera20_inference/LICENSE` | no disponible |

El autor indica que la arquitectura del modelo difiere del Pi0.5 original, aunque reutiliza su presupuesto de microajuste. No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No hay resultados de rollout en robot real para ninguna de las versiones subidas; la pérdida de validación no es un indicador fiable de éxito en hardware.
- El snapshot no incluye pesos para las tareas de relay y apilamiento, que seguían en cola de entrenamiento en el momento de la publicación.
- Los checkpoints contienen solo el modelo EMA y metadatos, sin estado del optimizador, por lo que no permiten reanudar el entrenamiento AdamW de forma exacta.
- Los pesos no tienen licencia declarada; el uso comercial queda sin cobertura legal explícita. La licencia de `camera20_inference/LICENSE` aplica únicamente al código derivado de StarVLA.
- No se pueden mezclar versiones: los checkpoints de pinza continua y las variantes q01/q99 son incompatibles con el código de adaptación de acciones de este repositorio.
- La entrada de pinza debe usar la escala original de grabación (0-100); convertirla previamente a 0/1 provoca un comportamiento incorrecto.
- La salida binaria 0/1 no debe interpretarse directamente como comando de apertura en escala SO101 original; es necesario mapear a los centros congelados o a los extremos calibrados del controlador.
- Las acciones son objetivos absolutos de EEF; no deben acumularse sobre la pose actual.
- El modelo solo produce objetivos de acción y no llama directamente a controladores de motor; la cinemática inversa y el control cartesiano quedan a cargo del runtime del robot.
- No se documentan sesgos, comportamiento multilingüe ni riesgos de alucinación específicos; al ser un modelo de política, el riesgo principal es la generación de trayectorias inválidas fuera de la distribución de entrenamiento.
- El conjunto de datos es reducido (36 trayectorias por tarea), lo que limita la generalización a condiciones no vistas.
- La calibración de pinza se realizó sobre 144 trayectorias de cuatro tareas con dos clústeres por brazo; los umbrales (izquierdo >15,312310663708825; derecho >16,24110971015025) están congelados y no se recalculan en inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ssrgroup-xlerobot/camera20-stage2-xlerobot-binary-eef-20261114
- No se han encontrado en la búsqueda web papers, blogs, repositorios adicionales ni demos asociados a este modelo.
