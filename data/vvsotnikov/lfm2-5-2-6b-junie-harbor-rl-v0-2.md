# vvsotnikov/LFM2.5-2.6B-junie-harbor-rl-v0.2

## Resumen

LFM2.5-2.6B-junie-harbor-rl-v0.2 es un ajuste fino por aprendizaje por refuerzo (GRPO asincrono) del modelo base LiquidAI/LFM2.5-2.6B, orientado a tareas de analisis de datos ejecutadas por un agente de codigo. Lo publica el usuario vvsotnikov en Hugging Face y se trata de un checkpoint intermedio (paso 80 de una tirada de unas 440 iteraciones) de un entrenamiento que seguia en curso en el momento de la instantanea, no de un modelo final.

El modelo resuelve un problema concreto: adaptar un modelo pequeno (2.697.198.592 parametros, es decir, unos 2,6B) para que funcione como motor de un agente CLI de codigo (JetBrains Junie) en entornos de datos, con capacidad de invocar herramientas y completar tareas verificables. La relevancia actual esta en que documenta de forma transparente una reproduccion desde cero del flujo de "multi-harness RL" a escala reducida, en una sola GPU, con datos de rollouts capturados del propio agente.

El repositorio contiene el modelo completo fusionado en bf16 (el adaptador LoRA se ha integrado en los pesos base) y, ademas, el adaptador independiente en el subdirectorio `lora-adapter/`. El tamano del repo es de 5,6 GB. La licencia es la LFM Open License v1.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LFM2.5; arquitectura exacta no disponible en la informacion proporcionada) |
| Parametros totales | 2.697.198.592 (~2,6B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm-open-license-v1.0) |
| Formato de pesos | safetensors (modelo fusionado en bf16) + adaptador LoRA en `lora-adapter/` |

## Arquitectura y entrenamiento

El modelo parte del transformer LFM2.5-2.6B de LiquidAI y se entrena mediante GRPO asincrono con el `AsyncGRPOTrainer` de TRL. El ajuste se hace con LoRA de rango 32, alpha 64, aplicado a todas las capas lineales; posteriormente el adaptador se fusiona en los pesos base, y el repositorio conserva tanto la version fusionada como el adaptador suelto. El entrenamiento usa 1.000 tareas del dataset FineEnvs/SmolDataEnvs-harbor-train, sin cribado y barajadas.

La recompensa combina la correccion del verificador de la tarea con un pequeno bono de eficiencia de herramientas (peso 0,1) sobre las respuestas correctas. Cada grupo de tareas genera 8 rollouts con temperatura 1,0, hasta 40 llamadas al modelo y 1.800 s por rollout. El arnes es la CLI de agente de codigo JetBrains Junie ejecutandose en modo headless dentro de contenedores Docker; cada llamada del agente (tokens de prompt, tokens muestreados, logprobs) se captura y se usa como dato de entrenamiento. La tasa de aprendizaje es 1e-5 y se guardan checkpoints cada 10 pasos.

Se trata de una reproduccion desde cero del esquema descrito en la guia "The ultimate guide to multi-harness RL" y en la model card de harness-hub 24B, reducida a un modelo de 2,6B en una sola GPU y usando Junie en lugar de pi. El autor indica que la tirada se reinicio con una configuracion corregida (pool de tareas curado por dificultad, ajuste de modo thinking y limite de generacion por llamada de 4.096 tokens) despues de guardar este checkpoint; la siguiente version publicada (v0.3) reflejara esas correcciones.

## Capacidades

- Generacion de texto y razonamiento dentro de un bucle de agente de codigo.
- Uso de herramientas (tool calling) mediante el arnes Junie: el modelo emite llamadas que el CLI ejecuta en un sandbox Docker.
- Razonamiento multi-paso: los rollouts de entrenamiento permiten hasta 40 llamadas al modelo por tarea.
- Tareas de analisis de datos con verificacion automatica de correccion.
- Modo thinking: la configuracion menciona un ajuste de "thinking-mode", aunque su estado exacto en este checkpoint no esta disponible.
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Agente de analisis de datos en CLI: el modelo puede pilotar una herramienta de linea de comandos para inspeccionar ficheros, ejecutar scripts y responder preguntas sobre datos, apoyandose en el bucle de hasta 40 llamadas por tarea que se uso en entrenamiento.
- Automatizacion de tareas reproducibles con verificador: al haberse entrenado con recompensa de correccion, encaja en pipelines donde cada tarea tiene una comprobacion objetiva del resultado (tests, validaciones de salida).
- Prototipado de agentes de codigo en una sola GPU: su tamano de 2,6B y los pesos en bf16 permiten desplegarlo en hardware modesto para experimentar con bucles de agente antes de escalar a modelos mayores.
- Generacion de llamadas a herramientas en entornos aislados: el uso de sandboxes Docker en el entrenamiento lo hace adecuado para entornos donde las acciones del agente deben ejecutarse con aislamiento.
- Investigacion en RL para agentes: sirve como referencia reproducible de un pipeline GRPO asincrono con captura de rollouts desde un arnes real.
- Evaluacion comparativa base vs. ajustado: util para medir el efecto del RL en tareas de analisis de datos, aunque el autor aun no ha publicado la evaluacion pareada de 100 tareas retenidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta metricas de entrenamiento en este checkpoint:

| Metrica | Valor en el paso 80 |
|---|---|
| Tasa de exito de llamadas a herramienta | ~75% |
| Llamadas medias por rollout | ~11,5 |
| Recompensa media de entrenamiento | ~0,55 (correccion + bono de eficiencia) |
| Evaluacion en tareas retenidas | no realizada aun |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 5,4 GB solo para pesos (2,697 mil millones de parametros x 2 bytes), mas overhead de activaciones y cache KV; el repo ocupa 5,6 GB.
- En cuantizacion de 8 bits cabria en torno a 2,7 GB de pesos; en 4 bits, en torno a 1,4 GB, aunque no se han publicado pesos cuantizados para este checkpoint.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, es plausible en GPUs de consumo con 8-16 GB de VRAM, pero no hay confirmacion del autor.
- Opciones de despliegue: no disponibles; al ser un modelo estandar de transformers con pesos safetensors, en principio es compatible con las herramientas habituales (vLLM, llama.cpp, Ollama, TGI), pero no se ha verificado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-2.6B-junie-harbor-rl-v0.2 | ~2,6B | no disponible | GRPO + LoRA sobre LFM2.5-2.6B | LFM Open License v1.0 | Hugging Face (0 descargas) |
| LiquidAI/LFM2.5-2.6B (base) | ~2,6B | no disponible | Preentrenamiento + postentrenamiento de LiquidAI | LFM Open License v1.0 | Hugging Face |
| harness-hub/LFM2.5-24B-A2B-pi | 24B (A2B, MoE) | no disponible | RL multi-harness con pi | no disponible | Hugging Face |

La comparacion con el modelo base es la mas directa: este checkpoint anade un ajuste RL especifico para tareas de analisis de datos con Junie, pero a un paso temprano de entrenamiento y sin evaluacion retenida, por lo que no hay evidencia publicada de mejora sostenida frente a la base.

## Limitaciones y advertencias

- Checkpoint intermedio: el comportamiento puede cambiar de forma sustancial en versiones posteriores; se publica por transparencia del entrenamiento, no como modelo terminado.
- Entrenado en una unica familia de tareas (analisis de datos en sandboxes Harbor); las posibles mejoras seran especificas de esa familia.
- Escala pequena (2,6B) y paso temprano (80): el autor advierte que la precision esperada esta cerca de la del modelo base en esta fase.
- Sin evaluacion en tareas retenidas: no hay datos que confirmen generalizacion.
- Tasa de exito de herramienta del ~75% implica un porcentaje relevante de fallos en cadenas de agente.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; se heredan los del modelo base.
- Licencia LFM Open License v1.0: conviene revisar sus terminos antes de uso comercial, ya que puede imponer restricciones adicionales.
- Idiomas soportados no especificados; no se garantiza un comportamiento multilingue adecuado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vvsotnikov/LFM2.5-2.6B-junie-harbor-rl-v0.2
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Dataset de entrenamiento: https://huggingface.co/datasets/FineEnvs/SmolDataEnvs-harbor-train
- Guia de referencia "The ultimate guide to multi-harness RL": https://huggingface.co/spaces/FineEnvs/multi-harness-rl
- Model card de referencia harness-hub 24B: https://huggingface.co/harness-hub/LFM2.5-24B-A2B-pi
- JetBrains Junie: https://www.jetbrains.com/junie/
