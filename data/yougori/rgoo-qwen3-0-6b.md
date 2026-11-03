# Yougori/RGOO-Qwen3-0.6B

## Resumen

RGOO-Qwen3-0.6B es una versión comprimida del modelo Qwen3-0.6B del equipo Qwen, publicada por el usuario Yougori (Argo1-OOAS) en HuggingFace. La compresión se realiza mediante RGOO (Fisher-Allocated, Entropy-Coded Weight Compression for Language Models), un método que asigna a cada fila de cada matriz de pesos su propio nivel de precisión, minimizando el daño que el redondeo provoca en la distribución de siguiente token del modelo, y codifica los pesos resultantes con codificación entrópica. Se ofrecen dos variantes: una a 3 bits por número en las capas lineales y otra a 2 bits.

El modelo base Qwen3-0.6B es un transformer denso de 0,6 mil millones de parámetros con licencia Apache 2.0, pensado para generación de texto y conversación. La relevancia de esta ficha reside en que demuestra una técnica de compresión que reduce el tamaño en disco de 1,19 GB a 478 MB (3 bits) o 424 MB (2 bits), manteniendo una tasa de acuerdo con el modelo original del 82,9 % y 66,3 % respectivamente en la predicción del siguiente token sobre posiciones reservadas.

Es importante subrayar que RGOO es una compresión de almacenamiento, no de inferencia: al cargar el archivo `.rgoo` se decodifica a pesos de 16 bits en bfloat16, por lo que no reduce el uso de VRAM ni acelera la generación. Su utilidad principal es el almacenamiento y la distribución del modelo, no el despliegue en hardware limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-0.6B) |
| Parametros totales | 0,6 mil millones (modelo base) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-0.6B) |
| Tipos de cuantizacion | RGOO a 3 bits y 2 bits por numero en capas lineales; tabla de palabras y ganancias de normalizacion a 16 bits |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.rgoo` (archivo con codificacion entropica, decodificable a bfloat16 con el codigo `rgoo` incluido) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-0.6B, un transformer denso de 0,6 mil millones de parámetros. Sobre él se aplica RGOO, una técnica de compresión de pesos que opera fila a fila: cada fila de cada tabla de pesos elige su propio nivel de precisión minimizando una estimación del daño que su redondeo causaría a la distribución de siguiente token (asignación tipo Fisher), y luego GPTQ selecciona los códigos. Posteriormente se reajustan las escalas de fila y las ganancias de normalización con los códigos congelados, de modo que el modelo comprimido responda como el original. Las 196 capas lineales están comprimidas; la tabla de palabras (311 MB) y las ganancias de normalización permanecen a 16 bits.

La calibración se realizó con 391.569 tokens de documentos procedentes de una mezcla de preentrenamiento: texto web educativo (70 %), código (15 %), matemáticas (11 %) y libros de texto sintéticos (4 %). Cada archivo tardó unos 6 minutos en generarse en una NVIDIA GeForce RTX 5090 Laptop GPU. No se especifica en la información disponible si hubo RLHF o DPO adicionales sobre el modelo base; se heredan las características de entrenamiento de Qwen3-0.6B.

## Capacidades

- Generación de texto y conversación multi-turno, con plantilla de chat de Qwen3.
- Razonamiento y modo "thinking" (se puede desactivar con `enable_thinking=False` en la plantilla de chat).
- Generación de código: en pruebas rápidas del autor, la variante de 3 bits escribió código corto correcto; la de 2 bits cometió más errores.
- Respuesta a preguntas simples y tareas de conocimiento general (con las limitaciones de un modelo de 0,6 B).
- Capacidades multilingües limitadas: la model card declara únicamente inglés (`en`).
- No se documenta soporte de tool calling, function calling ni agentes multi-paso en la información proporcionada.
- No se documenta visión ni audio.

## Casos de uso

- Distribución de modelos con ancho de banda limitado: el archivo de 3 bits ocupa 478 MB frente a 1,19 GB del original, lo que facilita su descarga y almacenamiento en entornos con restricciones de red. Al cargarse se decodifica a bfloat16 y funciona como el modelo original.
- Prototipado rápido en local: con el código `rgoo` incluido y PyTorch con CUDA, se puede lanzar un chat en terminal (`python -m rgoo chat qwen3-0.6b-3bit.rgoo`) para probar interacciones conversacionales sin depender de servicios externos.
- Evaluación de técnicas de compresión: investigadores que estudien cuantización post-entrenamiento pueden usar las dos variantes (3 y 2 bits) como referencia reproducible, con métricas de acuerdo, perplejidad y KL publicadas.
- Generación de código asistida en entornos con poco espacio de almacenamiento: la variante de 3 bits mantiene un 85,6 % de acuerdo en código Python según el paper, adecuada para autocompletado sencillo o snippets cortos.
- Educación y experimentación con modelos pequeños: útil para demostrar el comportamiento de un LLM de 0,6 B en tareas de preguntas y respuestas simples, asumiendo sus limitaciones.
- Archivado a largo plazo: al reducir el tamaño en disco a menos de la mitad, es una opción para conservar copias del modelo base con una pérdida de fidelidad medida y documentada.

## Benchmarks y rendimiento

Datos publicados en la model card (medidos sobre el flujo de validación reservado de la mezcla de calibración):

| Modelo | Bits en capas lineales | Tamano | Acuerdo | Perplejidad | KL |
|---|---:|---:|---:|---:|---:|
| Qwen3-0.6B original | 16 | 1,19 GB | 100 % | 23,02 | 0 |
| `qwen3-0.6b-3bit.rgoo` | 3,01 | 478 MB | 82,9 % | 24,15 | 0,110 |
| `qwen3-0.6b-2bit.rgoo` | 2,03 | 424 MB | 66,3 % | 32,12 | 0,479 |

El acuerdo es la proporción de 100.352 posiciones reservadas en las que el token más probable del modelo comprimido coincide con el del original. En código fuente Python, el acuerdo es del 85,6 % a 3 bits y del 65,1 % a 2 bits (paper, Tabla 5). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al decodificarse a bfloat16, requiere aproximadamente la misma memoria que Qwen3-0.6B original (en torno a 1,2 GB de pesos más overhead de activaciones y contexto); no se reduce por usar el archivo comprimido.
- GPU recomendadas: cualquier GPU con CUDA y al menos unos pocos GB de VRAM; el autor generó los archivos en una RTX 5090 Laptop, pero la inferencia es viable en GPUs consumer modestas.
- Cabe en GPU consumer: sí, dado el tamaño del modelo base.
- Opciones de despliegue: el código `rgoo` incluido (requiere PyTorch con CUDA, transformers, NumPy y SciPy); tras la carga se obtiene un modelo transformers estándar, por lo que se puede usar con las herramientas habituales compatibles con transformers. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para el formato `.rgoo`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| RGOO-Qwen3-0.6B (3 bits) | 0,6 B | no disponible | Apache 2.0 | `.rgoo` | 478 MB, acuerdo 82,9 %, perplejidad 24,15 |
| RGOO-Qwen3-0.6B (2 bits) | 0,6 B | no disponible | Apache 2.0 | `.rgoo` | 424 MB, acuerdo 66,3 %, perplejidad 32,12 |
| Qwen3-0.6B original | 0,6 B | no disponible | Apache 2.0 | safetensors | 1,19 GB, referencia |
| Otras cuantizaciones de Qwen3-0.6B (GPTQ, AWQ, GGUF) | 0,6 B | no disponible | Apache 2.0 | varios | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- La compresión es de almacenamiento, no de inferencia: al cargar se decodifica a pesos de 16 bits, por lo que no ahorra memoria ni tiempo en producción.
- Es necesario el código `rgoo` de este repositorio para leer los archivos `.rgoo`; transformers no puede cargarlos por sí solo.
- La evaluación se basa en un único conjunto de calibración, un único flujo reservado y una única semilla; el paper reconoce esta limitación.
- La variante de 2 bits degrada notablemente la calidad (acuerdo 66,3 %, perplejidad 32,12 frente a 23,02) y comete más errores en pruebas de chat.
- Se heredan las limitaciones de Qwen3-0.6B: es un modelo pequeño que puede equivocarse, mostrar sesgos o ser repetitivo; no debe usarse para decisiones de alto impacto.
- Idioma declarado únicamente inglés; el rendimiento en castellano no está garantizado ni evaluado.
- Licencia Apache 2.0 permite uso comercial, pero los pesos derivan de Qwen3-0.6B y se distribuyen bajo la misma licencia; el paper (`rgoo.pdf`) está bajo CC BY 4.0.

## Enlaces

- HuggingFace: https://huggingface.co/Yougori/RGOO-Qwen3-0.6B
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Paper de RGOO: `rgoo.pdf` incluido en el repositorio (licencia CC BY 4.0)
- Paper de Qwen3: https://arxiv.org/abs/2505.09388
- Repositorio del código `rgoo`: incluido en el propio repositorio de HuggingFace (carpeta `rgoo/`)
