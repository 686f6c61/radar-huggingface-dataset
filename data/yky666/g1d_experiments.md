# yky666/g1d_experiments

## Resumen

`yky666/g1d_experiments` es un repositorio de pesos de política robótica (vision-language-action, VLA) para control de un robot humanoide, publicado por el usuario `yky666` bajo el paraguas del proyecto G1D (`HERMES-Unifyed-Robotic-Control`). No es un modelo de lenguaje general, sino un conjunto de checkpoints de dos familias de políticas: una basada en π0.5 con adaptación LoRA y otra denominada AFCE (con un espacio latente E y un decoder conjunto). El objetivo es resolver tareas de manipulación de horizonte largo (food sorting, pick bucket) sobre observaciones RGB multi-cámara y estado propioceptivo de 16 dimensiones.

La relevancia es acotada: se trata de artefactos de investigación reproducibles, con verificación de ficheros y selección de checkpoints sobre un split heldout, no de un modelo listo para producción. El repositorio ocupa 99,6 GB e incluye pesos completos en formato Orbax/JAX (no Transformers), además de cachés y assets de normalización. La model card insiste en que las pérdidas open-loop no establecen éxito en robot real.

No hay información pública sobre el número de parámetros, la arquitectura interna detallada ni la licencia. La política opera a 30 Hz de frecuencia de ejecución del cliente, con chunks de acción de 32×16 (π0.5) o 30×16 (AFCE), y requiere cambio de subtarea mediante prompt externo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política VLA derivada de π0.5 (transformer, detalles no disponibles); variante AFCE con espacio latente E y decoder conjunto entrenado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (horizonte de acción: 32 pasos en π0.5, 30 en AFCE) |
| Tipos de cuantizacion | no disponible (pesos en precisión completa Orbax/JAX) |
| Idiomas soportados | zh, en (prompts de subtarea) |
| Licencia | no disponible |
| Formato de pesos | Orbax/JAX (params completos, sin optimizer); no es Transformers ni solo adaptador LoRA |

## Arquitectura y entrenamiento

El repositorio contiene dos líneas de modelos. La primera es un baseline π0.5 con LoRA, cuyo checkpoint `pi05_lora_baseline/7500` se describe como ya validado en robot real, aunque con un presupuesto de entrenamiento distinto al de AFCE. La segunda es AFCE, un fine-tuning completo (`afce_fullft/72500`) que primero predice en un espacio E de 30×256 y después, mediante un decoder entrenado conjuntamente, produce acciones de 30×16. La inferencia de AFCE no requiere DINOv3 ni el encoder E; el decoder queda dentro de los parámetros del checkpoint.

El entrenamiento de AFCE se extendió hasta 100k pasos y el checkpoint 72500 se seleccionó por pérdida compuesta sobre 200 observaciones heldout (0,1550050788745284 frente a 0,15692223992198706 en 100000). El autor advierte explícitamente que ese heldout sirve para seleccionar punto, no como test independiente ni como medida de éxito en robot. En la actualización del 18-10-2026 se añaden checkpoints para food_sorting (AFCE LoRA subtask 97500, AFCE whole-task fullFT 2500 partiendo de 72.5k) y pick_bucket (π0.5 LoRA 70000 y 100000, π0.5 fullFT 12500). El estado nativo es de 16D (7+7 articulaciones de brazo más dos pinzas), rellenado a 32D para la política.

## Capacidades

- Generación de acciones de manipulación a partir de tres cámaras RGB (vista principal y muñecas izquierda/derecha) y estado propioceptivo de 16D.
- Ejecución de subtareas condicionada por prompt de subtarea; el cambio de fase es externo, no autónomo.
- Predicción de chunks de acción de 32×16 (π0.5) o 30×16 (AFCE) a 30 Hz de frecuencia de cliente.
- Variante AFCE con predicción en espacio latente E (30×256) y decoder conjunto.
- Soporte de fine-tuning completo y LoRA sobre el mismo pipeline.
- Idiomas de prompt: chino e inglés.
- No se documentan tool calling, agentes multi-paso, visión general, audio ni modo thinking.

## Casos de uso

- Clasificación y ordenación de alimentos (food sorting): el checkpoint `food_sorting/afce_lora/97500` está entrenado para subtareas de esta tarea sobre el dataset `humanoid_long_horizon_tasks`, con cambio de fase por prompt.
- Recogida de cubos (pick bucket): los checkpoints `pick_bucket/pi05_lora/70000` y `100000` permiten evaluar la política π0.5 con LoRA en una tarea de picking concreta.
- Comparación controlada de métodos: el par baseline π0.5 LoRA 7500 frente a AFCE fullFT 72500 permite medir, con la misma observación y los primeros 30 pasos, el efecto del espacio latente E y del decoder conjunto.
- Reproducción de experimentos académicos: el repositorio incluye `ARTIFACTS.json`, `MODEL_INDEX.json` y scripts de descarga que fijan revisiones inmutables, lo que facilita la replicación.
- Evaluación open-loop: cálculo de pérdidas compuestas sobre el split heldout de 200 observaciones para comparar checkpoints antes de pruebas en robot.
- Despliegue en bucle cerrado de laboratorio: con `scripts/serve_c01.py`, variante fullft, 10 pasos de denoising y warmup, sobre una GPU con JAX/Flax/Orbax instalados.
- Adaptación a nuevas tareas humanoides: al ser fine-tuning sobre π0.5, sirve como punto de partida para nuevas tareas con el mismo contrato de 16D de estado/acción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato cuantitativo es la pérdida compuesta heldout de selección: 0,1550050788745284 en el paso 72500 frente a 0,15692223992198706 en 100000. El autor subraya que estas pérdidas open-loop no establecen éxito en robot real.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio completo ocupa 99,6 GB y los pesos son Orbax/JAX en precisión completa, por lo que se requiere almacenamiento amplio y memoria suficiente para cargar params completos.
- GPU recomendadas: no disponibles en la información proporcionada; el stack es JAX/Flax/Orbax, lo que favorece GPUs con buen soporte CUDA para XLA (A100, H100) aunque no se confirma.
- ¿Cabe en GPU de consumo? no disponible.
- Despliegue: servidor propio `scripts/serve_c01.py` (puerto configurable, `--denoise-steps`, `--warmup`); descarga con `hf download` o `scripts/download_artifacts.py`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles; solo se indica frecuencia de ejecución de cliente de 30 Hz y 10 pasos de denoising en el ejemplo de servicio.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto/horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yky666/g1d_experiments` (π0.5 LoRA) | VLA robótica | no disponible | 32×16 acciones | no disponible | HF, Orbax/JAX |
| `yky666/g1d_experiments` (AFCE fullFT) | VLA robótica con espacio E | no disponible | 30×16 acciones | no disponible | HF, Orbax/JAX |
| π0.5 original (referencia) | VLA | no disponible en esta ficha | no disponible | no disponible | no verificada aquí |

No se dispone de datos suficientes para comparar parámetros, rendimiento ni licencia con alternativas externas.

## Limitaciones y advertencias

- La licencia no está declarada; no se puede asumir uso comercial.
- Los checkpoints se seleccionan sobre un split heldout, no sobre un test independiente; las pérdidas open-loop no garantizan éxito en robot real.
- El cambio de subtarea es externo (prompt o conmutación de fase); no hay planificación autónoma multi-paso.
- El baseline π0.5 y AFCE tienen presupuestos de entrenamiento distintos, por lo que la comparación no es de igual a igual.
- Los formatos de normalización, prompts y assets E deben preservarse por checkpoint; mezclarlos invalida los resultados.
- Los ficheros con solo `train_state` no garantizan reanudación sin el contrato de datos, cursor y runtime correspondientes.
- El estado nativo es de 16D y se rellena a 32D; no se documenta generalización a otras morfologías.
- Idiomas limitados a zh y en en los prompts; no hay evaluación multilingüe amplia.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible.
- El tamaño del repositorio (99,6 GB) y el stack JAX/Orbax complican el despliegue frente a formatos estándar.

## Enlaces

- Hugging Face: https://huggingface.co/yky666/g1d_experiments
- Dataset: https://huggingface.co/datasets/yky666/humanoid_long_horizon_tasks/tree/main/g1d_food_sorting
- GitHub: https://github.com/HERMES-Unifyed-Robotic-Control/g1d_experiments
