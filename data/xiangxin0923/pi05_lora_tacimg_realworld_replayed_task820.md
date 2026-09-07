# xiangxin0923/pi05_lora_tacimg_realworld_replayed_task820

## Resumen

Este repositorio contiene un checkpoint LoRA para el modelo T2-VLA, entrenado para la tarea robótica Task820. Lo publica el usuario xiangxin0923 bajo la librería OpenPI y está etiquetado con el pipeline de robótica. El checkpoint corresponde al paso de entrenamiento 29999 y se describe como «sim-replayed Task820 (lab0903 convert)». No se especifica la arquitectura interna, el número de parámetros, el tamaño del contexto ni la licencia. El repositorio ocupa 19.0 GB y se sirve mediante el script `server.sh` del proyecto T2-VLA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de visión-lenguaje-acción (T2-VLA) sobre OpenPI; arquitectura interna no especificada |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | LoRA; no se especifica si safetensors, GGUF u otro formato |

## Arquitectura y entrenamiento

El checkpoint es un adaptador LoRA para un modelo de visión-lenguaje-acción (VLA) de la familia T2-VLA, con la librería OpenPI. No se especifica si la arquitectura base es un transformer puro, un modelo de mezcla de expertos, un modelo de espacio de estados o un diseño híbrido.

El entrenamiento se realizó sobre la tarea Task820, con datos descritos como «sim-replayed» y convertidos desde «lab0903 convert». El dataset referenciado es `xiangxin0923/realworld_replayed_task820`. No se ofrecen datos sobre el número de tokens, la composición del dataset ni técnicas de RLHF o DPO. La ruta esperada del checkpoint es `checkpoints/pi05_lora_tacimg_realworld_replayed_task820/pi05_lora_tacimg_realworld_replayed_task820/29999/`.

## Capacidades

- Ejecución de tareas robóticas mediante una política de visión-lenguaje-acción (VLA). El checkpoint está entrenado para la tarea Task820 y puede servirse con T2-VLA.
- Entrada de imagen táctil: el nombre del checkpoint sugiere que el modelo procesa imágenes táctiles (`tacimg`) como entrada, además de las entradas visuales y lingüísticas propias de T2-VLA. No hay confirmación explícita en la model card.
- Despliegue como servicio mediante `server.sh`: el README incluye el comando `bash server.sh pi05_lora_tacimg_realworld_replayed_task820 29999`.
- Reproducción de un experimento concreto: el paso de entrenamiento 29999 está fijado en el nombre y en el README.
- No se indica soporte de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües ni generación de texto general.

## Casos de uso

- Reproducción de experimentos de manipulación robótica: al estar fijado el paso 29999 y la tarea Task820, un investigador puede cargar el checkpoint y repetir el experimento original para validar resultados.
- Evaluación de transferencia sim-to-real: el checkpoint se describe como «sim-replayed» y convertido desde «lab0903 convert», por lo que puede usarse para medir cómo se comporta una política entrenada en simulación cuando se reproduce en un entorno real.
- Investigación en manipulación con retroalimentación táctil: el nombre sugiere que el modelo acepta imágenes táctiles; sirve para estudiar el efecto de esta modalidad en el control fino.
- Comparativa de adaptadores LoRA en VLA: al ser un checkpoint LoRA, se puede comparar contra otros adaptadores del mismo autor o contra el modelo base para evaluar el coste de ajuste fino.
- Despliegue de un servicio de políticas robóticas: con T2-VLA y `server.sh` se puede levantar un servidor local que consuma el checkpoint y lo exponga a un robot o a un entorno de simulación.
- Benchmarking de datasets replayed: el checkpoint está ligado al dataset `realworld_replayed_task820`; puede usarse para validar la calidad de ese dataset en una tarea de control robótico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni de métricas de rendimiento robótico.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repositorio es 19.0 GB, pero no se indica el tamaño de los pesos en memoria.
- GPU recomendada: no disponible. No se especifica si el modelo base requiere A100, H100, RTX 4090 u otra GPU.
- En GPU de consumo: no disponible. Al ser un adaptador LoRA, es posible que quepa en una GPU de consumo junto con el modelo base, pero no hay datos que lo confirmen.
- Opciones de despliegue: T2-VLA con `server.sh`. Se requiere `git-lfs` y no se debe clonar con `GIT_LFS_SKIP_SMUDGE=1`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han encontrado modelos comparables con datos publicados en la información disponible. Se han localizado dos repositorios del mismo autor con nombres similares, pero sin especificaciones ni benchmarks:

| Modelo | Tarea | Paso | Observaciones |
|---|---|---|---|
| pi05_lora_tacimg_realworld_replayed_task820 | Task820 | 29999 | Este checkpoint |
| pi05_lora_tacimg_realworld_replayed_task820_current | Task820 | 29999 | Repositorio variante «current» |
| pi05_lora_tacimg_realworld_replayed_tabero_820 | tabero_820 | no disponible | Variante con nombre distinto |

## Limitaciones y advertencias

- Licencia no disponible: no se puede garantizar el uso comercial.
- Sin benchmarks publicados: no hay evidencia de rendimiento frente a otros modelos.
- Dependencia de T2-VLA: no es un modelo autónomo; requiere el entorno y el modelo base para funcionar.
- El README indica que el repositorio sobrescribe los pesos anteriores: si se quiere reproducir un experimento anterior, es necesario guardar versiones.
- No se proporcionan datos de sesgos, alucinaciones ni limitaciones de idioma; el modelo está orientado a robótica, no a tareas de lenguaje general.
- La información disponible es mínima: no se detalla el dataset completo, la arquitectura, el contexto ni el número de parámetros.
- Riesgo de alucinación no evaluable: al no haber evaluaciones publicadas, no se puede determinar la fiabilidad de las acciones generadas.

## Enlaces

- https://huggingface.co/xiangxin0923/pi05_lora_tacimg_realworld_replayed_task820
- https://huggingface.co/xiangxin0923/pi05_lora_tacimg_realworld_replayed_task820_current
- https://huggingface.co/xiangxin0923/pi05_lora_tacimg_realworld_replayed_tabero_820
- Dataset referenciado: `xiangxin0923/realworld_replayed_task820` (en Hugging Face)

No se han encontrado papers, blogs ni demos adicionales en la búsqueda web.
