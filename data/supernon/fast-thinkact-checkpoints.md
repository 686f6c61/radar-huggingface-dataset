# supernon/fast-thinkact-checkpoints

## Resumen

Fast-ThinkAct reproduction checkpoints es un conjunto de pesos publicado por el usuario supernon en Hugging Face, correspondiente a una reproducción independiente y a pequeña escala del método Fast-ThinkAct, orientado a robótica de manipulación con modelos vision-language-action (VLA). No se trata de un modelo único, sino de un repositorio con siete directorios de checkpoints que cubren distintas piezas del pipeline: políticas de acción basadas en RDT (Robotics Diffusion Transformer), estudiantes VLM con razonamiento latente en formato coordinate-CoT, profesores de razonamiento entrenados con GRPO y un checkpoint de supervised fine-tuning con CoT en lenguaje natural.

El sistema se apoya en tres modelos base: Qwen/Qwen2.5-VL-3B-Instruct como columna vertebral vision-language, Qwen/Qwen3-0.6B como modelo auxiliar y robotics-diffusion-transformer/rdt-1b como política de acción. La innovación que reproduce es el "latent reasoning" o razonamiento latente: en lugar de generar cadenas de pensamiento en lenguaje natural antes de actuar, el estudiante produce un plan visual latente (coordinate-CoT) que condiciona directamente la política de acción, reduciendo la latencia de inferencia en bucles de control robótico.

Es relevante ahora porque el repositorio es un snapshot de investigación (creado en noviembre de 2026) que permite a otros grupos experimentar con VLA y razonamiento latente sin depender de una release oficial de los autores del paper. El tamaño del repositorio es de 49,2 GB y la licencia no está especificada, lo que condiciona su uso en producción. La model card advierte explícitamente de que el setup de entrenamiento y evaluación es sustancialmente menor que el del paper original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline VLA: VLM (Qwen2.5-VL-3B-Instruct) con cabezas de waypoint y verbalizer + política de acción RDT (diffusion transformer, rdt-1b); profesores y estudiantes con CoT latente y GRPO |
| Parametros totales | no disponible (repositorio de checkpoints; el VLM base es de 3B y el modelo auxiliar de 0,6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors y state dictionaries de PyTorch) |
| Idiomas soportados | en, zh |
| Licencia | no disponible |
| Formato de pesos | safetensors (VLM), PyTorch state dictionaries (políticas y cabezas), `student_heads.pt`, `verbalizer.pt`, `checkpoint_manifest.json` |

## Arquitectura y entrenamiento

El repositorio contiene checkpoints de un pipeline compuesto. El estudiante VLM (`vlm_student`) parte de Qwen2.5-VL-3B-Instruct y añade una cabeza de waypoint y un verbalizer; produce un plan visual en formato coordinate-CoT que condiciona la política de acción `policy_ftc`, basada en RDT-1b (un diffusion transformer para acciones robóticas). En paralelo se incluye `policy_rdt`, una política RDT baseline sin condicionamiento en el plan latente, lo que permite comparar el efecto del razonamiento latente. Los profesores (`vlm_teacher` y `vlm_teacher_nl`) son modelos de razonamiento entrenados con GRPO en coordinate-CoT y en lenguaje natural respectivamente, y `vlm_cot_sft_nl` es un checkpoint de supervised fine-tuning con CoT en lenguaje natural.

El entrenamiento se realizó sobre demostraciones de RoboTwin, un simulador de manipulación robótica. La model card indica que el setup es "sustancialmente menor" que el del paper y que el único resultado reportado (la tendencia para la tarea `adjust_bottle`, usando `policy_ftc` con `vlm_student`) no establece generalización entre tareas. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni detalles de las etapas de RLHF/DPO. Los encoders SigLIP/T5, los pesos base originales para entrenar desde cero, los assets de RoboTwin y los datasets de demostración no están incluidos en el repositorio y deben obtenerse de sus publicadores.

## Capacidades

- Razonamiento latente en formato coordinate-CoT: el estudiante genera un plan visual latente que condiciona la política de acción, en lugar de una cadena de texto explícita.
- Razonamiento en lenguaje natural: el checkpoint `vlm_cot_sft_nl` y el profesor `vlm_teacher_nl` permiten experimentar con CoT verbalizado.
- Verbalización de planes: `verbalizer.pt` permite convertir el plan latente en texto para inspección o depuración.
- Control de manipulación robótica: la política `policy_ftc` produce acciones condicionadas en el plan del estudiante; `policy_rdt` sirve como baseline.
- Percepción vision-language: heredada de Qwen2.5-VL-3B-Instruct (procesamiento de imágenes y texto).
- Soporte multilingüe limitado a inglés y chino según los metadatos del repositorio.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no documentado como tal; el razonamiento multi-paso se limita al pipeline plan-acción descrito.
- Capacidades de audio: no disponibles.

## Casos de uso

- Investigación en razonamiento latente para VLA: comparar `policy_ftc` + `vlm_student` frente a `policy_rdt` en el simulador RoboTwin para medir el efecto del plan latente en la tasa de éxito de tareas de manipulación.
- Reproducción de experimentos de Fast-ThinkAct: el repositorio está pensado como snapshot reproducible, con `checkpoint_manifest.json` que lista ficheros y tamaños esperados, lo que facilita verificar la integridad de la descarga en entornos de investigación.
- Estudio de destilación de razonamiento: usar `vlm_teacher` (coordinate-CoT con GRPO) y `vlm_teacher_nl` para analizar diferencias entre profesores con CoT latente y verbalizado, y su transferencia al estudiante.
- Depuración e interpretabilidad de políticas: emplear `verbalizer.pt` para convertir el plan latente del estudiante en texto y auditar qué representación interna guía las acciones en tareas concretas como `adjust_bottle`.
- Benchmarking de políticas de difusión en robótica: usar `policy_rdt` como baseline RDT-1b para comparar contra variantes condicionadas por VLM en el mismo entorno simulado.
- Prototipado de pipelines VLA en investigación académica: combinar `vlm_student` y `policy_ftc` con el adaptador de despliegue del repositorio fuente para experimentar con inferencia en GPU CUDA antes de escalar a setups mayores.
- Estudio de ablaciones incompletas: la model card remite a las notas de experimentos del repositorio fuente, que documentan ablaciones pendientes y limitaciones, útiles para planificar trabajo futuro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona una "tendencia reportada" para la tarea `adjust_bottle` con `policy_ftc` y `vlm_student`, sin cifras concretas ni comparación cuantitativa con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El VLM base es de 3B parámetros y el modelo auxiliar de 0,6B; la política RDT-1b añade carga adicional. El repositorio completo ocupa 49,2 GB en disco.
- GPU recomendadas: la model card indica que el entrenamiento completo y la evaluación en simulador requieren GPUs CUDA; no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- ¿Cabe en GPU de consumo? No confirmado en la información disponible; el VLM de 3B podría caber en GPUs de consumo con cuantización, pero los pesos se distribuyen en safetensors y state dictionaries sin cuantizaciones publicadas.
- Opciones de despliegue: el repositorio fuente (github.com/supernoooo/fast-thinkact) contiene las definiciones de modelo personalizadas y el adaptador de despliegue. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fast-ThinkAct reproduction checkpoints (este) | VLM 3B + auxiliar 0,6B + RDT-1b | no disponible | VLA con razonamiento latente coordinate-CoT | no disponible | Hugging Face, snapshot de investigación |
| Qwen2.5-VL-3B-Instruct (base) | 3B | no disponible en esta ficha | VLM generalista | según Qwen (consultar) | Hugging Face, release oficial |
| RDT-1b (base de la política) | 1B | no disponible en esta ficha | Diffusion transformer para acciones robóticas | según robotics-diffusion-transformer (consultar) | Hugging Face, release oficial |
| Fast-ThinkAct original (paper) | no disponible | no disponible | VLA con razonamiento latente | no disponible | No es una release oficial según la model card |

## Limitaciones y advertencias

- No es una release oficial de los autores del paper: es una reproducción independiente y a pequeña escala; los resultados no deben extrapolarse a las cifras del paper original.
- El setup de entrenamiento y evaluación es "sustancialmente menor" que el del paper, según la propia model card.
- El único resultado reportado (`adjust_bottle`) no establece generalización entre tareas; las ablaciones están incompletas según las notas del repositorio fuente.
- Licencia no especificada: no se puede asumir uso comercial; los modelos y componentes upstream conservan sus propias licencias y condiciones de uso.
- No incluye los encoders SigLIP/T5, los pesos base originales, los assets de RoboTwin ni los datasets de demostración; hay que obtenerlos por separado.
- Idiomas limitados a inglés y chino según los metadatos.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un VLM con generación de texto, es un riesgo inherente no cuantificado aquí.
- Sesgos conocidos: no documentados en la información proporcionada.
- Requiere CUDA y un entorno RoboTwin configurado para entrenamiento completo y evaluación en simulador.
- Los nombres de directorio deben mantenerse sin cambios para que los loaders del estudiante funcionen; los ficheros de política son state dictionaries de PyTorch, no pesos listos para servir sin el código del repositorio fuente.

## Enlaces

- Hugging Face: https://huggingface.co/supernon/fast-thinkact-checkpoints
- Repositorio fuente y setup: https://github.com/supernoooo/fast-thinkact
- Modelo base VLM: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Modelo base auxiliar: https://huggingface.co/Qwen/Qwen3-0.6B
- Modelo base de política: https://huggingface.co/robotics-diffusion-transformer/rdt-1b
