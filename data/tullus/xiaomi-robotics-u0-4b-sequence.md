# TULLUS/Xiaomi-Robotics-U0-4B-Sequence

## Resumen

Xiaomi-Robotics-U0-4B-Sequence es un punto de control de la familia Xiaomi-Robotics-U0, un conjunto de modelos autorregresivos multimodales desarrollados por Xiaomi Robotics para síntesis encarnada ("embodied synthesis") sobre modelos fundacionales de mundo. El modelo unifica texto, imágenes y observaciones robóticas en un único espacio de tokens discreto, con un tokenizador visual compartido y un objetivo de predicción de siguiente token, y está inicializado a partir de EMU3.5. Esta variante concreta, publicada en el repositorio TULLUS/Xiaomi-Robotics-U0-4B-Sequence, contiene 5.082.093.056 parámetros reales según sus pesos safetensors (etiquetada como "4B" por el autor) y ocupa 10,2 GB en el repositorio.

El interés de esta ficha radica en que la familia U0 cubre seis tareas públicas —T2I, X2I, Scene Gen, Transfer, interleave_subtask e interleave_video—, pero los puntos de control "Sequence" solo soportan las dos últimas y únicamente con el backend eager, sin la aceleración FlashAR. Por tanto, este checkpoint está orientado a generación intercalada de subtareas y a rollouts de vídeo encarnado, no a generación de imágenes de alta resolución acelerada.

La model card oficial reporta una velocidad de 5,44 s/imagen a 1024x1024 en una GPU H20 con FlashAR sobre vLLM, 82,86 veces más rápido que AR eager y 3,04 veces más rápido que FlashAR eager. No se dispone de datos de benchmarks de calidad ni de resultados de terceros: la búsqueda web realizada no devolvió ninguna referencia relevante al modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo multimodal de la familia Xiaomi-Robotics-U0, inicializado desde EMU3.5; tokenizador visual discreto compartido y objetivo unico de siguiente token sobre secuencias multimodales |
| Parametros totales | 5.082.093.056 (~5,08 B), calculado a partir de los pesos safetensors; el autor lo etiqueta como "4B" |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; los pesos publicados estan en safetensors, con un tamano de repositorio de 10,2 GB coherente con precision BF16 (~2 bytes por parametro) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con codigo personalizado (tag custom_code, requiere trust_remote_code) |
| Espacio de tokens | tokenizador visual discreto unificado (BAAI/Emu3.5-VisionTokenizer) |
| Tareas soportadas por este checkpoint | interleave_subtask e interleave_video, con backend eager |
| Backend de inferencia | eager (los checkpoints Sequence no soportan FlashAR segun la model card) |

## Arquitectura y entrenamiento

La familia Xiaomi-Robotics-U0 se define en la model card como un modelo autorregresivo de 34B parámetros para texto, imágenes y observaciones encarnadas, inicializado desde EMU3.5 y con una arquitectura de espacio de tokens unificado: un tokenizador visual discreto compartido y un único objetivo de siguiente token aplicado sobre secuencias multimodales completas. Esta aproximación evita módulos de difusión separados y trata la generación de imagen, la edición, la generación de escenas multi-vista y el rollout de vídeo como una misma tarea de predicción de tokens. La familia incorpora además una variante FlashAR, que decodifica los tokens visuales en grupos anti-diagonales y admite batching con vLLM para inferencia a alta resolución.

Los detalles concretos de entrenamiento de este checkpoint (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada. La model card sí indica que en septiembre de 2026 se publicaron los pesos de Xiaomi-Robotics-U0-4B, Xiaomi-Robotics-U0-Sequence y Xiaomi-Robotics-U0-4B-Sequence junto con el código de entrenamiento basado en FSDP, y que el informe técnico apareció en julio de 2026. La única cifra de rendimiento publicada es de velocidad, no de calidad: 5,44 s/imagen a 1024x1024 en una H20 con FlashAR sobre vLLM, 82,86x más rápido que AR eager y 3,04x más rápido que FlashAR eager.

## Capacidades

- Generacion de subtareas intercaladas (interleave_subtask): dado un conjunto de observaciones iniciales y una instrucción de tarea, produce texto de subtareas intercalado con observaciones.
- Rollout de video encarnado (interleave_video): a partir de una observación inicial y contexto de tarea, genera una secuencia de vídeo de la ejecución.
- Modelado de mundo visual: representación de escenas y dinámica de manipulación robótica dentro del mismo espacio de tokens que el texto.
- Generacion y edicion de imagen en la familia: T2I y X2I están soportadas por los checkpoints U0, U0-4B y U0-FlashAR, no por los checkpoints Sequence según la model card.
- Generacion de escenas multi-vista y transferencia: tareas Scene Gen y Transfer, igualmente asociadas a los checkpoints no-Sequence.
- Procesamiento multimodal any-to-any: el pipeline declarado es any-to-any, con entradas y salidas que combinan texto e imagen.
- Inferencia distribuida y batching: el repositorio de inferencia incluye ejecución eager y backend vLLM, con parches específicos para AR y FlashAR, además de una demo Gradio.
- Tool calling, function calling y modo de razonamiento explícito: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.
- Idiomas soportados: no disponible.

## Casos de uso

- Planificación de subtareas en robótica de manipulación: se introducen las observaciones iniciales y una instrucción de alto nivel, y el modelo devuelve una secuencia intercalada de subtareas en texto y observaciones, utilizable como planificador de alto nivel para una política de bajo nivel. Es el caso de uso central de esta variante Sequence.
- Generación de datos sintéticos para entrenamiento de políticas: los rollouts de vídeo encarnado permiten aumentar datasets de demostración escasos con trayectorias sintéticas etiquetadas, reduciendo el coste de teleoperación.
- Evaluación offline de políticas en un modelo de mundo: simular el resultado esperado de una secuencia de acciones antes de ejecutarla en hardware real, como paso de verificación previo al despliegue.
- Model-based RL y planificación a corto horizonte: usar el rollout de vídeo como aproximación del entorno para comparar candidatos de acción sin coste de simulación física.
- Investigación en modelos fundacionales de mundo: al compartir espacio de tokens entre texto e imagen, permite estudiar transferencia entre generación visual y razonamiento encarnado con un único objetivo de entrenamiento.
- Prototipado interactivo con Gradio: el repositorio incluye puntos de entrada Gradio para flujos de T2I, X2I, Scene Gen y Transfer de la familia, útiles para validar el pipeline antes de integrarlo en un sistema propio.
- Reentrenamiento y ajuste con FSDP: el código de entrenamiento FSDP publicado en septiembre de 2026 permite adaptar el checkpoint a dominios robóticos específicos con recursos multi-GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K ni equivalentes multimodales) en la informacion disponible. El único dato cuantitativo reportado en la model card es de latencia, y corresponde a la variante FlashAR de la familia, no a este checkpoint:

| Metrica | Valor | Contexto |
|---|---|---|
| Latencia T2I 1024x1024 | 5,44 s/imagen | FlashAR sobre vLLM, una GPU H20 |
| Aceleracion frente a AR eager | 82,86x | FlashAR vLLM vs AR eager |
| Aceleracion frente a FlashAR eager | 3,04x | FlashAR vLLM vs FlashAR eager |

Advertencia: los checkpoints Sequence, incluido este, solo soportan el backend eager según la model card, por lo que las cifras de FlashAR no son aplicables directamente a este repositorio.

## Requisitos de hardware

- VRAM estimada en BF16: en torno a 10,2 GB solo para pesos, mas cache KV y activaciones. Con contexto y resoluciones altas, el consumo efectivo es superior; no se dispone de cifras oficiales de VRAM maxima.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 5-6 GB de pesos, mas estados de inferencia (estimacion derivada del numero de parametros, no confirmada por el autor).
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 3 GB de pesos, mas estados de inferencia (estimacion derivada, no confirmada).
- Cabe en GPU de consumo: sí, en BF16 debería caber en tarjetas de 24 GB como la RTX 4090 o la RTX 3090, siempre que la longitud de secuencia y la resolución se mantengan moderadas. No hay confirmación oficial de compatibilidad.
- GPU de datacenter recomendadas: la model card cita una H20 para la medición de velocidad. Para el modelo de 34B de la familia se requieren configuraciones multi-GPU; para este checkpoint de ~5 B no se documentan requisitos oficiales.
- Opciones de despliegue: ejecucion eager (soportada oficialmente por los checkpoints Sequence), backend vLLM con parches AR y FlashAR para el resto de la familia, y demo Gradio. No hay evidencia de soporte para llama.cpp, Ollama o TGI.
- Latencia y throughput: la unica cifra publicada es la de FlashAR en H20 (5,44 s/imagen a 1024x1024); no hay datos de latencia ni throughput para esta variante Sequence.
- Requisito adicional: el tokenizador visual procede de BAAI/Emu3.5-VisionTokenizer y debe descargarse por separado.

## Comparativa con modelos similares

| Modelo | Parametros | Tareas soportadas | Backend | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xiaomi-Robotics-U0-4B-Sequence (este) | ~5,08 B (safetensors) | interleave_subtask, interleave_video | eager | Apache 2.0 | HuggingFace (repo TULLUS) |
| Xiaomi-Robotics-U0-Sequence | no disponible | interleave_subtask, interleave_video | eager | Apache 2.0 | HuggingFace (XiaomiRobotics) |
| Xiaomi-Robotics-U0-4B | no disponible | T2I, X2I, Scene Gen, Transfer | AR y FlashAR | Apache 2.0 | HuggingFace (XiaomiRobotics) |
| Xiaomi-Robotics-U0 | 34 B | T2I, X2I, Scene Gen, Transfer | AR y FlashAR | Apache 2.0 | HuggingFace y ModelScope |
| Xiaomi-Robotics-U0-FlashAR | no disponible | T2I, X2I, Scene Gen, Transfer | FlashAR sobre vLLM | Apache 2.0 | HuggingFace y ModelScope |
| EMU3.5 (BAAI) | no disponible | modelo base multimodal del que se inicializa la familia | no disponible | no disponible | HuggingFace (tokenizador visual) |

No se dispone de datos de contexto, benchmarks ni rendimiento comparado para ninguno de estos modelos en la informacion proporcionada, por lo que la comparativa se limita a parametros declarados, tareas soportadas y disponibilidad.

## Limitaciones y advertencias

- Procedencia del repositorio: el punto de control analizado está publicado bajo la cuenta TULLUS, no bajo la cuenta oficial XiaomiRobotics. Debe verificarse si es una réplica de los pesos oficiales antes de usarlo en producción.
- Sin validación comunitaria: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia de uso ni verificación independiente.
- Backend limitado: los checkpoints Sequence solo admiten ejecución eager según la model card, lo que excluye la aceleración FlashAR y el batching de vLLM descritos para la familia. Las cifras de velocidad publicitadas no aplican a este checkpoint.
- Código personalizado: el repositorio requiere trust_remote_code para cargar la implementación, lo que implica ejecutar código del autor.
- Idiomas no declarados: la model card no especifica idiomas soportados, por lo que el comportamiento multilingüe es desconocido.
- Longitud de contexto no declarada: no se puede dimensionar el número de turnos, observaciones o fotogramas que admite una secuencia sin pruebas empíricas.
- Riesgo de alucinación visual: al ser un modelo generativo autorregresivo sobre tokens visuales, los rollouts de vídeo y las observaciones generadas pueden divergir de la dinámica física real; no deben usarse como sustituto de una simulación validada en lazos de control reales.
- Uso previsto limitado: las tareas T2I, X2I, Scene Gen y Transfer no están soportadas por este checkpoint, solo por otras variantes de la familia.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la licencia se declara en la model card y en un fichero LICENSE del repositorio de GitHub; conviene revisar también los términos del tokenizador visual de BAAI y de los pesos originales de Xiaomi Robotics.
- Verificación bibliográfica: la búsqueda web realizada no devolvió resultados relevantes sobre esta familia de modelos, por lo que no ha sido posible contrastar la información de la model card con fuentes independientes.

## Enlaces

- Repositorio analizado: https://huggingface.co/TULLUS/Xiaomi-Robotics-U0-4B-Sequence
- Punto de control oficial de la familia: https://huggingface.co/XiaomiRobotics/Xiaomi-Robotics-U0-4B-Sequence
- Coleccion oficial en HuggingFace: https://huggingface.co/collections/XiaomiRobotics/xiaomi-robotics-u0
- Informe tecnico (arXiv): https://arxiv.org/abs/2607.11643
- Pagina de proyecto: https://robotics.xiaomi.com/xiaomi-robotics-u0.html
- Repositorio de codigo: https://github.com/XiaomiRobotics/Xiaomi-Robotics-U0
- Instrucciones de inferencia: https://github.com/XiaomiRobotics/Xiaomi-Robotics-U0/blob/main/inference/README.md
- Licencia: https://github.com/XiaomiRobotics/Xiaomi-Robotics-U0/blob/main/LICENSE
- Coleccion en ModelScope: https://modelscope.cn/collections/XiaomiRobotics/Xiaomi-Robotics-U0
- Tokenizador visual (BAAI/Emu3.5-VisionTokenizer): https://huggingface.co/BAAI/Emu3.5-VisionTokenizer/
