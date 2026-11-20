# WestlakeDI/Awomo-0.6I

## Resumen

Awomo-0.6I es un conjunto de pesos de preentrenamiento para robótica publicado por WestlakeDI (Westlake University) bajo el identificador AP338. Se trata de un *warm start* de solo pesos destinado a inicializar el runtime histórico de SFT (supervised fine-tuning) del sistema Awomo, un pipeline de *action-patch* orientado al benchmark RoboTwin. No es un modelo conversacional ni un LLM al uso: su función es servir como punto de partida para entrenar políticas robóticas mediante aprendizaje por imitación.

El repositorio contiene 128 shards distribuidos en formato safetensors (15,5 GB en total) junto con un marcador `.complete`. La interfaz de acción y estado es de 80 dimensiones, de las cuales el adaptador de entrenamiento selecciona 14 slots válidos para RoboTwin. El modelo no incluye optimizador, scheduler, EMA ni estado aleatorio, por lo que no permite reanudar un entrenamiento previo, sino únicamente inicializar uno nuevo.

La relevancia de este artefacto es acotada: está pensado para reproducir o continuar el flujo de trabajo histórico de Awomo, que requiere el runtime NeMo correspondiente y los activos de FLUX.2, VAE y Qwen3-VL de forma separada. El autor documenta un smoke test en 8 × H20-3e con batch 1 por GPU, no la configuración original de 32 GPUs, y no incluye evaluación downstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (pesos de política robótica; pipeline action-patch con FLUX.2, VAE y Qwen3-VL como activos externos) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (128 shards distribuidos, marcador `.complete`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de que se trata de pesos de preentrenamiento para robótica con una interfaz de acción/estado de 80 dimensiones y un adaptador que selecciona 14 slots válidos para RoboTwin. El pipeline Awomo emplea un esquema de *action-patch* y depende de activos externos: FLUX.2, un VAE y Qwen3-VL, que no se incluyen en este repositorio. El runtime de entrenamiento requerido es el histórico de NeMo, y la lectura de los shards exige su lector distribuido de checkpoints de Hugging Face.

No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, dado que se trata de aprendizaje por imitación en robótica y no de un modelo de lenguaje. El autor indica que el checkpoint preparado y los datos de RoboTwin se probaron conjuntamente en un smoke test aislado con 8 × H20-3e a batch 1 por GPU, completando dos pasos de optimizador y guardando un nuevo checkpoint. Esa prueba no corresponde a la configuración original de 32 GPUs y no incluye evaluación downstream.

## Capacidades

- Inicialización de políticas robóticas mediante aprendizaje por imitación (imitation learning) sobre el benchmark RoboTwin.
- Interfaz de acción/estado de 80 dimensiones con selección de 14 slots válidos para RoboTwin a través del adaptador de entrenamiento.
- Punto de partida (*warm start*) para SFT con el runtime histórico de NeMo.
- Integración con activos multimodales externos: FLUX.2, VAE y Qwen3-VL.
- No incluye capacidades de generación de texto, razonamiento, código, matemáticas, tool calling ni agentes según la información disponible.
- No se documentan capacidades multilingües ni modos especiales (thinking, visión nativa, audio).

## Casos de uso

- Inicialización de SFT en RoboTwin: cargar los 128 shards con el lector distribuido de Hugging Face y el runtime NeMo histórico para arrancar el fine-tuning supervisado de una política de manipulación, desactivando la restauración de estado de entrenamiento, optimizador, scheduler, data-state y EMA.
- Reproducción de experimentos históricos de Awomo: el checkpoint permite recomponer el punto de partida del pipeline action-patch documentado por el autor, siempre que se disponga de los activos FLUX.2, VAE y Qwen3-VL por separado.
- Validación de infraestructura de entrenamiento distribuido: el smoke test en 8 × H20-3e con batch 1 por GPU sirve como referencia para verificar que el lector de checkpoints, el adaptador de 14 slots y el guardado de checkpoints funcionan antes de escalar a configuraciones mayores.
- Investigación en aprendizaje por imitación robótica: usar los pesos como base para comparar variantes de adaptadores de acción/estado sobre la interfaz de 80 dimensiones.
- Desarrollo de pipelines de *action-patch*: estudiar cómo se estructura un checkpoint distribuido de 128 shards con marcador `.complete` para integrarlo en herramientas propias de gestión de checkpoints.
- Pruebas de integración multimodal en robótica: combinar los pesos con FLUX.2, VAE y Qwen3-VL para evaluar la coordinación entre percepción visual y política de acción en entornos simulados RoboTwin.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta un smoke test de dos pasos de optimizador en 8 × H20-3e sin evaluación downstream.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el repositorio ocupa 15,5 GB en safetensors, pero no se especifica el tamaño del modelo ni su huella en memoria durante la ejecución).
- GPU recomendadas: el autor documenta un smoke test en 8 × H20-3e; la configuración original de entrenamiento era de 32 GPUs (modelo de GPU no especificado).
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI; el autor indica que se requiere el runtime histórico de NeMo y el lector distribuido de checkpoints de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (pesos de preentrenamiento para políticas robóticas con interfaz action-patch sobre RoboTwin).

## Limitaciones y advertencias

- No es un checkpoint completo de reanudación: no incluye optimizador, scheduler, EMA ni estado aleatorio; debe desactivarse su restauración al iniciar SFT.
- Requiere el runtime histórico de NeMo y los activos FLUX.2, VAE y Qwen3-VL de forma separada; sin ellos los pesos no son utilizables.
- La lectura de los 128 shards exige el lector distribuido de checkpoints de Hugging Face del runtime correspondiente.
- La validación reportada es un smoke test de dos pasos en 8 × H20-3e, no la configuración original de 32 GPUs, y no incluye evaluación downstream.
- Licencia no disponible: no puede confirmarse el uso comercial ni las restricciones de redistribución.
- Idiomas no disponibles; no aplica como modelo de lenguaje.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, aunque al tratarse de una política robótica entrenada por imitación, los sesgos del dataset de demostración condicionan su comportamiento.
- Sin datos de benchmarks ni de rendimiento en producción, no es recomendable desplegarlo sin una evaluación propia.

## Enlaces

- Hugging Face: https://huggingface.co/WestlakeDI/Awomo-0.6I
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
