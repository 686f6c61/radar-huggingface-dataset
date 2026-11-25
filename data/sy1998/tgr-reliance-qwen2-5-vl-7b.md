# sy1998/TGR-Reliance-Qwen2.5-VL-7B

## Resumen

TGR-Reliance-Qwen2.5-VL-7B es un ajuste fino del modelo multimodal Qwen/Qwen2.5-VL-7B-Instruct desarrollado por el usuario sy1998. El modelo está especializado en *temporal grounding* aplicado a razonamiento sobre vídeo: antes de responder a una pregunta de opción múltiple, identifica explícitamente los intervalos temporales (en segundos) que contienen la evidencia visual, y fundamenta su respuesta en esos intervalos. El ajuste sigue la receta descrita en el trabajo *When Does Temporal Grounding Help Video Reasoning?*.

Técnicamente es un transformer multimodal (visión-lenguaje) de 8.292.166.656 parámetros (aproximadamente 8,3 mil millones), heredado íntegramente de la arquitectura Qwen2.5-VL. La innovación no reside en la arquitectura sino en el procedimiento de entrenamiento: un *supervised fine-tuning* sobre el conjunto EviCe seguido de un RL con GRPO cuya recompensa se basa únicamente en el *temporal grounding* (R_IoU, intersección sobre unión de los intervalos predichos frente a los reales). El resultado es un modelo que produce salidas estructuradas del tipo `<think>[s, e]</think><answer>X</answer>`.

Su relevancia radica en que aborda un problema concreto del razonamiento sobre vídeo: los modelos multimodales tienden a responder sin localizar la evidencia, lo que dificulta la verificabilidad y agrava las alucinaciones. Al forzar la localización temporal explícita, el modelo hace su razonamiento auditable. La licencia Apache-2.0 y el tamaño contenido (7B) lo hacen desplegable en infraestructura moderada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal visión-lenguaje (Qwen2.5-VL) |
| Parámetros totales | 8.292.166.656 (~8,3B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No disponible en la información proporcionada (pesos en safetensors; compatible con cuantizaciones estándar de transformers/vLLM) |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-VL-7B-Instruct, un transformer multimodal que procesa vídeo muestreado a 1 fps con un máximo de 128 fotogramas mediante el muestreador oficial de Qwen2.5-VL. El ajuste fino se realiza en dos fases: primero *supervised fine-tuning* sobre el conjunto EviCe, y después aprendizaje por refuerzo con GRPO en el que la única recompensa es el *temporal grounding* (R_IoU), es decir, la calidad de los intervalos temporales predichos, no la corrección de la respuesta final.

La innovación destacable es el formato de salida obligatorio: el modelo escribe primero los intervalos de evidencia dentro de `<think></think>` como uno o varios pares `[start, end]` en segundos, y a continuación la letra de la opción correcta dentro de `<answer></answer>`. Este diseño obliga a que la respuesta se apoye en los intervalos localizados, lo que convierte el razonamiento en verificable. La evaluación se reproduce con vLLM 0.11.0 y transformers 4.57.1, usando `--sampler qwen25 --prompt train --max_tokens 256`.

## Capacidades

- Comprensión de vídeo con localización temporal explícita de la evidencia.
- Razonamiento fundamentado (*grounded reasoning*) sobre preguntas de opción múltiple en vídeo.
- Salida estructurada y parseable: intervalos temporales en `<think>` y respuesta en `<answer>`.
- Soporte de múltiples intervalos de evidencia por consulta (por ejemplo `[5.2, 10.4], [40.0, 52.0]`).
- Procesamiento de vídeo a 1 fps con hasta 128 fotogramas.
- Capacidades heredadas de Qwen2.5-VL-7B-Instruct (visión general, texto), aunque el ajuste está orientado a la tarea de *temporal grounding*.
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- **Verificación de respuestas en QA sobre vídeo**: el modelo devuelve los intervalos exactos que sustentan cada respuesta, lo que permite a un revisor humano o a un sistema automático comprobar la evidencia sin revisar el vídeo completo. Adecuado por su salida estructurada `<think>[s, e]</think>`.
- **Análisis de vigilancia y monitorización**: localizar en una grabación los segmentos donde ocurre un evento descrito en lenguaje natural, aprovechando la localización temporal para indexar y recuperar fragmentos concretos.
- **Moderación de contenido en vídeo**: identificar los tramos temporales que contienen el contenido problemático para su revisión o recorte, en lugar de marcar el vídeo entero.
- **Búsqueda y recuperación de momentos en archivos audiovisuales**: dado un archivo largo, obtener los *timestamps* relevantes para una consulta, útiles para generar capítulos o índices navegables.
- **Evaluación automatizada de material educativo en vídeo**: responder preguntas de opción múltiple sobre clases grabadas indicando en qué minuto se trata cada concepto.
- **Investigación en razonamiento multimodal**: servir como línea base reproducible para estudiar cuándo el *temporal grounding* mejora el razonamiento sobre vídeo, dado que el repositorio TGR-Reliance incluye el script de evaluación.
- **Anotación asistida de datasets de vídeo**: generar intervalos de evidencia candidatos que aceleren el etiquetado temporal manual.

## Benchmarks y rendimiento

Resultados publicados en la model card:

| Benchmark | Accuracy | R@0.3 | ReGAP |
|---|---|---|---|
| ReliaNeedle | 60,8 | 81,1 | 1,147 |
| Video-Oasis | 33,23 | – | 0,425 |

No se han publicado en la información disponible resultados comparativos frente a otros modelos en MMLU, HumanEval, GSM8K ni en el resto de benchmarks estándar.

## Requisitos de hardware

- **VRAM estimada en inferencia**: con pesos en bf16/fp16, aproximadamente 16-17 GB solo para los pesos (el repositorio ocupa 16,6 GB), más el coste de las activaciones y del procesamiento de hasta 128 fotogramas de vídeo, que puede elevar el consumo sustancialmente.
- **Cuantización**: con cuantización a 8 bits cabría en torno a 9-10 GB de pesos; a 4 bits, en torno a 5-6 GB, aunque el coste de activaciones del codificador visual sigue siendo significativo. No se han publicado cifras oficiales de cuantización para este ajuste.
- **GPU recomendadas**: A100 40/80 GB o H100 para despliegue en producción con vídeo de muchos fotogramas; RTX 4090 (24 GB) es viable en bf16 para secuencias moderadas.
- **GPU de consumo**: posible en RTX 4090 con bf16 y en GPUs de 12-16 GB con cuantización, sujeto al número de fotogramas procesados.
- **Opciones de despliegue**: vLLM 0.11.0 (verificado en la model card), transformers 4.57.1, text-generation-inference (etiqueta `text-generation-inference` presente en el repositorio).
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TGR-Reliance-Qwen2.5-VL-7B | ~8,3B | No disponible | Temporal grounding en vídeo | Apache-2.0 | Hugging Face |
| Qwen/Qwen2.5-VL-7B-Instruct (base) | ~8,3B | No disponible | Multimodal visión-lenguaje general | Apache-2.0 | Hugging Face |
| Alternativas de grounding en vídeo de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

El único comparable directo identificable en la información proporcionada es su modelo base, Qwen2.5-VL-7B-Instruct, del que hereda arquitectura y licencia; la diferencia es el ajuste específico para localización temporal. No se dispone de datos para comparar con otros modelos de *temporal grounding*.

## Limitaciones y advertencias

- **Especialización estrecha**: el ajuste está orientado a preguntas de opción múltiple con localización temporal; su rendimiento en otras tareas multimodales puede degradarse respecto al modelo base.
- **Formato de salida rígido**: requiere el *prompt* de sistema y la instrucción final exactos descritos en la model card; desviarse de ese formato puede producir salidas no parseables.
- **Rendimiento limitado en Video-Oasis**: accuracy de 33,23, lo que indica margen de mejora en ese benchmark concreto.
- **Riesgo de alucinación**: aunque el *grounding* reduce respuestas sin evidencia, el modelo puede localizar intervalos incorrectos o responder con seguridad a partir de evidencia mal localizada.
- **Sesgos**: no se han documentado sesgos específicos en la información proporcionada; hereda los del modelo base y los de sus datos de entrenamiento (EviCe).
- **Idiomas**: no se especifican los idiomas soportados; no se garantiza un rendimiento equivalente en castellano.
- **Contexto y vídeo**: limitado a 1 fps y 128 fotogramas; vídeos largos o de dinámica rápida pueden perder información relevante.
- **Licencia**: Apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y de los datos de ajuste.
- **Madurez**: el modelo tiene pocas descargas (17) y ningún *like*, por lo que no cuenta aún con validación comunitaria amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sy1998/TGR-Reliance-Qwen2.5-VL-7B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Repositorio de evaluación TGR-Reliance: https://github.com/shuyansy/TGR-Reliance
