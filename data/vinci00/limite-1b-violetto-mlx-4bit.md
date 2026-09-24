# vinci00/limite-1b-violetto-mlx-4bit

## Resumen

Limite 1B Violetto MLX 4-bit es una cuantización comunitaria de 4 bits en formato MLX del modelo paradigma-inc/limite-1b-violetto, desarrollada por el usuario vinci00. El artefacto no introduce entrenamiento ni ajuste fino adicional: únicamente transforma la representación de almacenamiento e inferencia del checkpoint original. El modelo fuente es un razonador matemático de solo texto, no un asistente de propósito general ni multimodal, con aproximadamente 1.035 millones de parámetros bajo la arquitectura personalizada LimiteForCausalLM.

La relevancia de esta publicación es doble. Por un lado, empaqueta el modelo para ejecución local en Apple Silicon: reduce el peso a unos 0,543 GiB y emplea cuantización afín MLX de 4 bits con grupo de tamaño 64, incluyendo el embedding de entrada/salida atado. Por otro, documenta de forma reproducible la conversión y una evaluación emparejada sobre 10 ejemplos del test de GSM8K con semilla 42 y un límite de generación de 1.024 tokens, ejecutada en un Mac mini M4 con 16 GiB de memoria unificada.

El modelo base está bajo licencia Apache-2.0 y muestra una sintonización ligera de instrucciones orientada a tareas matemáticas. Esto implica que el modelo conserva su plantilla de chat matemática fija y no admite system prompts arbitrarios ni herramientas externas. Es, por tanto, un artefacto especializado y experimental, con cero descargas y cero likes en el momento de la consulta, y sin resultados numéricos de benchmarks publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LimiteForCausalLM (arquitectura personalizada de Paradigma, no integrada en mlx-lm estándar) |
| Parametros totales | 1.035.253.888 (~1,035 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine de 4 bits, group size 64 (este artefacto); el modelo base está en BF16 con tensores auxiliares FP32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

Este repositorio es una cuantización derivada, no un modelo entrenado. La conversión partió del mismo checkpoint original fijado (revisión `9402e422e87b220507963cd42c997459c1e87b43`) que el baseline sin cuantizar, usando mlx-lm 0.31.3, MLX 0.32.2 y el adaptador de terceros `limite-mlx==0.1.0` de pierjoe. El baseline no se de-cuantizó desde este artefacto. La cuantización afecta también al embedding de entrada/salida atado. El adaptador pliega las escalas de atención aprendidas dentro de las matrices de proyección y conserva pequeños tensores auxiliares en FP32.

La arquitectura original es propietaria (LimiteForCausalLM), de modo que no está incluida en mlx-lm 0.31.3 ni en llama.cpp; su soporte requiere el adaptador comunitario que añade un hook de importación en el arranque de Python para `mlx_lm.models.limite`. El runtime oficial del modelo fuente es el plugin de vLLM de Paradigma. En cuanto al entrenamiento del modelo original, la model card indica que está "ligeramente sintonizado con instrucciones" y orientado a razonamiento matemático, pero no detalla número de tokens, composición del dataset ni si se emplearon RLHF/DPO. La plantilla de chat matemática es fija: aporta el system prompt y solicita una respuesta final en formato `\boxed{}`.

Una innovación destacable del proceso de conversión es la corrección del desajuste entre tokenizador y configuración de generación: ambas configuraciones convertidas aceptan los IDs de token final `[151643, 151645]`. El tokenizador y la plantilla de chat son idénticos entre los artefactos emparejados y no se aplica ninguna sustitución de regex específica de Mistral.

## Capacidades

- Generación de texto y razonamiento matemático con pasajes de razonamiento extensos antes de la respuesta final.
- Modo de razonamiento con sección `<think>` explícita: un bloque `<think>` sin cerrar puntúa como incorrecto en la evaluación del propio autor.
- Respuesta final en formato `\boxed{...}` con contenido numérico, siguiendo la plantilla de chat matemática fija.
- Capacidad de resolución de problemas aritméticos y de divisores (por ejemplo, "¿cuántos divisores positivos tiene 360?").
- Conversación multi-turno básica bajo la plantilla de chat original (tag `conversational`), aunque con sintonización ligera de instrucciones.
- No soporta tool calling ni function calling: la model card indica explícitamente que las herramientas y los system prompts arbitrarios no están soportados.
- No es multimodal: el modelo fuente es de solo texto, sin visión ni audio.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se declara soporte de agentes ni de razonamiento multi-paso con herramientas.

## Casos de uso

- Razonamiento aritmético local en Mac: ejecución de problemas matemáticos paso a paso en un Mac mini M4 con 16 GiB, aprovechando el peso de ~0,543 GiB y la cuantización de 4 bits para minimizar el uso de memoria unificada.
- Prototipado de investigación en matemáticas: uso como banco de pruebas para estudiar cómo afecta la cuantización de 4 bits al razonamiento de un modelo de ~1B, mediante la comparación emparejada baseline/cuantizado incluida en el repositorio.
- Evaluación de decodificación: empleo de la configuración de muestreo recomendada (temperatura 0,6 y top_p 0,95) o de decodificación greedy para reproducir los resultados documentados.
- Reproducción de experimentos: el repositorio fuente incluye cuaderno ejecutado, evaluador, tests y requisitos fijados, lo que permite repetir la evaluación sobre GSM8K con semilla 42 y el mismo límite de tokens.
- Verificación de formato de respuesta: uso del modelo como ejemplo de razonador que separa bloque de pensamiento y respuesta final en `\boxed{}`, útil para construir y depurar parsers de soluciones matemáticas.
- Docencia de matemáticas asistida (experimental): generación de desarrollos intermedios de problemas aritméticos para su revisión por parte de un docente, teniendo en cuenta que puede producir respuestas incorrectas.
- Integración en pipelines de evaluación de cuantización: uso del artefacto como caso de estudio de portabilidad de arquitecturas personalizadas a MLX y de los límites de compatibilidad con Ollama y llama.cpp.
- Inferencia en producción con vLLM: despliegue mediante el plugin oficial de Paradigma si se requiere el runtime de referencia (no verificado con este artefacto MLX).

## Benchmarks y rendimiento

La model card describe un protocolo de evaluación emparejada sobre 10 ejemplos del test de GSM8K (revisión de dataset `3101c7d5072418e28b9008a6636bde82a006892c`, checksum JSONL verificado), con semilla 42 y un límite de generación de 1.024 tokens para ambas variantes (baseline y cuantizada). El sistema de puntuación toma el último `\boxed{...}` completo tras la sección de razonamiento y exige que todo su contenido sea numérico. Se conservan predicciones en bruto, regresiones/mejoras emparejadas, aciertos/total, intervalos de confianza de Wilson al 95 % y bootstrap emparejado. Cuatro preguntas matemáticas fijas de humo miden el tiempo de ejecución por separado.

Sin embargo, los resultados numéricos concretos no están disponibles en la información proporcionada (el texto de la model card aparece truncado en el apartado "Measured results"). El propio autor advierte que la ejecución es pequeña y limitada en tokens, que no reproduce las puntuaciones de competición del modelo original, que el razonamiento puede superar el límite de tokens y que un empate no establece paridad de calidad general. La contaminación por preentrenamiento es desconocida.

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K completos u otros) en la información disponible.

## Requisitos de hardware

- Peso en disco del artefacto cuantizado: aproximadamente 0,543 GiB (el repositorio completo ocupa unos 0,6 GB).
- VRAM/memoria unificada estimada: cabe holgadamente en equipos con 16 GiB; el autor lo ejecutó y evaluó en un Mac mini M4 con 16 GiB de memoria unificada.
- GPUs compatibles: al ser un artefacto MLX, está diseñado para Apple Silicon (M4 confirmado en la evaluación). No se declara soporte para GPUs NVIDIA en este repositorio.
- Cabida en GPU de consumidor: orientado a hardware de consumidor Apple Silicon; no se declara compatibilidad con GPUs de escritorio NVIDIA o AMD en este artefacto.
- Opciones de despliegue: mlx-lm 0.31.3 con MLX 0.32.2 y el adaptador `limite-mlx==0.1.0`; el runtime oficial del modelo fuente es el plugin de vLLM de Paradigma.
- Incompatibilidades conocidas: Ollama 0.34.2 rechaza el artefacto con `unsupported MLX architecture: model "LimiteForCausalLM"`; llama.cpp estándar carece de esta arquitectura y convertir el contenedor a GGUF no resuelve el soporte en tiempo de ejecución.
- Latencia y throughput: no disponibles de forma cuantificada. La evaluación mide el tiempo de ejecución con cuatro preguntas de humo, pero los valores no se incluyen en la información disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la información proporcionada. A continuación se ofrece una comparación limitada a los datos verificables de este artefacto frente a alternativas de la misma categoría (razonadores matemáticos de ~1B de parámetros). Los campos no disponibles se marcan como tales.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad / formato | Datos comparativos |
|---|---|---|---|---|---|
| limite-1b-violetto-mlx-4bit (este) | ~1,035B | no disponible | Apache-2.0 | MLX 4-bit (safetensors), Apple Silicon; sin soporte Ollama/llama.cpp estándar | no disponible |
| paradigma-inc/limite-1b-violetto | ~1,035B | no disponible | Apache-2.0 | pesos originales; runtime oficial vLLM Plugin | no disponible |
| Alternativas de razonamiento matemático de ~1B-1,5B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de comparativas de rendimiento verificadas frente a otros modelos en la información proporcionada. La model card incide en que este artefacto es una cuantización comunitaria y que no se establece equivalencia numérica con el runtime oficial de vLLM.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; el modelo está orientado exclusivamente a matemáticas y no se ha evaluado su comportamiento social.
- Riesgo de alucinación: el modelo está ligeramente sintonizado con instrucciones y puede reinterpretar una petición como una tarea matemática o producir respuestas incorrectas.
- Limitación de formato: el razonamiento puede exceder el límite de generación; un bloque `<think>` sin cerrar se puntúa como incorrecto y cualquier respuesta final ausente, mal formada o no numérica cuenta como fallo.
- Restricción de plantilla: solo admite la plantilla de chat matemática fija; no soporta system prompts arbitrarios ni herramientas.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están disponibles en la información proporcionada.
- Restricciones de licencia: los pesos fuente y el adaptador son Apache-2.0; al redistribuir hay que preservar LICENSE y NOTICE. El artefacto no es una publicación oficial de Paradigma ni de pierjoe.
- Caveat de producción: es un artefacto MLX; Ollama 0.34.2 lo rechaza y llama.cpp estándar no soporta la arquitectura. La conversión a GGUF por sí sola no habilita el despliegue.
- Ausencia de verificación de equivalencia: el autor no ha establecido de forma independiente la equivalencia numérica con el vLLM oficial.
- Contaminación de pretraining desconocida: no puede descartarse en la evaluación de GSM8K.
- Madurez del artefacto: cero descargas y cero likes en el momento de la consulta; creado y actualizado el 2026-09-24.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/vinci00/limite-1b-violetto-mlx-4bit
- Modelo base: https://huggingface.co/paradigma-inc/limite-1b-violetto
- Adaptador MLX comunitario (pierjoe): https://huggingface.co/pierjoe/limite-mlx
- Repositorio reproducible (cuaderno, evaluador, tests): https://github.com/VinciGit00/limite-1b-violetto-mlx-4bit
- Plugin oficial de vLLM de Paradigma: https://github.com/paradigma-inc/limite-violetto
- Manifiesto de conversión: `conversion_manifest.json` (en el repositorio del modelo)
- Hashes y procedencia: `benchmark_artifacts/conversion_provenance.json`
- Hardware registrado: `benchmark_artifacts/hardware.json`
