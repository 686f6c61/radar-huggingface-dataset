# vllm-project/R-4B

## Resumen

R-4B es un modelo multimodal (MLLM) de 4.819 millones de parámetros desarrollado por YannQi, distribuido en el repositorio `vllm-project/R-4B` como copia de seguridad de cadena de suministro para las pruebas de integración continua de vLLM. El modelo parte de la base de Qwen3-4B y añade capacidades de visión, con un enfoque central en el razonamiento adaptativo: es capaz de decidir de forma autónoma cuándo razonar paso a paso y cuándo responder de forma directa, en función de la complejidad de la tarea.

La propuesta diferencial es el control en tres modos de pensamiento (`auto-thinking`, `thinking` y `non-thinking`), lo que permite equilibrar calidad de respuesta y coste computacional en inferencia. El modelo se entrena en dos etapas: un annealing bi-modo que establece las capacidades de razonamiento y de respuesta directa para VQA, y una optimización de política bi-modo (BPO) que enseña al modelo a alternar entre ambos modos según la entrada.

Según la model card, R-4B alcanza el primer puesto entre modelos de menos de 20B parámetros en el leaderboard multimodal académico de OpenCompass y el primer puesto entre modelos open source en el leaderboard de razonamiento multimodal. Está publicado bajo licencia Apache 2.0 y es compatible con vLLM y Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal basada en transformer (base Qwen3-4B) con codificador visual; código de modelado personalizado (`custom_code`) |
| Parametros totales | 4.819.012.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en safetensors, probablemente en fp32/bf16) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repo | 9,7 GB |
| Pipeline | image-text-to-text |
| Modelo base | Qwen/Qwen3-4B |

## Arquitectura y entrenamiento

R-4B es un modelo multimodal que combina un backbone de lenguaje Qwen3-4B con capacidad de procesamiento de imagen y texto. El entrenamiento sigue un paradigma en dos etapas descrito en el paper (arXiv:2508.21113): primero un *Bi-mode Annealing* que dota al modelo de dos comportamientos diferenciados para VQA (razonamiento paso a paso y respuesta directa), y después un *Bi-mode Policy Optimization* (BPO), una variante de optimización por refuerzo que entrena al modelo para seleccionar de forma adaptativa el modo de respuesta más adecuado según la demanda de la entrada.

La innovación técnica principal es el razonamiento adaptativo y controlable: el modelo decide cuándo "pensar" y cuándo responder directamente, reduciendo el coste computacional en consultas simples sin penalizar el rendimiento en tareas complejas. El control se expone mediante el parámetro `thinking_mode` en la plantilla de chat (`auto`, `long`, `short`), con `auto-thinking` como valor por defecto. No se dispone en la información proporcionada del número exacto de tokens de entrenamiento, la composición del dataset ni detalles sobre el codificador visual.

## Capacidades

- Generación de texto e imágenes a texto (image-text-to-text): descripción de imágenes, VQA y razonamiento visual.
- Razonamiento adaptativo con tres modos de pensamiento: `auto-thinking` (selección automática), `thinking` (razonamiento extendido) y `non-thinking` (respuesta directa).
- Control manual del modo de razonamiento mediante `thinking_mode` en Transformers y en la API de vLLM.
- Razonamiento multimodal académico y de propósito general (matemáticas, ciencia, preguntas complejas sobre imágenes).
- Conversación multi-turno mediante plantilla de chat (`apply_chat_template`).
- Compatibilidad con el servidor OpenAI-compatible de vLLM para despliegue en producción.
- Capacidades multilingües limitadas al inglés según la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Capacidades de audio: no disponible en la información proporcionada.

## Casos de uso

- Asistencia visual para atención al cliente: el modelo puede recibir capturas de pantalla o fotos de producto y responder preguntas en modo `auto-thinking`, resolviendo consultas simples de forma rápida y activando razonamiento solo cuando la consulta lo requiere.
- Análisis de documentos e imágenes técnicas: descripción y razonamiento sobre diagramas, gráficos o figuras científicas, aprovechando el modo `thinking` para tareas que exigen varios pasos de inferencia.
- Moderación y etiquetado de contenido visual a escala: con el modo `non-thinking` se obtienen respuestas directas y de bajo coste para clasificación y descripción de imágenes en pipelines de datos.
- Evaluación y benchmarking de MLLMs: el modelo sirve como referencia en pruebas de integración continua de vLLM (de ahí la copia en `vllm-project`), y su control de modo permite comparar calidad y latencia de forma reproducible.
- Prototipado de asistentes multimodales: integración vía Transformers o vLLM con API compatible con OpenAI, adecuada para construir demos y MVPs de chat con imagen.
- Investigación en razonamiento adaptativo: el checkpoint y el paper permiten reproducir y extender el paradigma de annealing bi-modo y BPO sobre otras bases.
- Generación de descripciones accesibles: texto alternativo automático para imágenes en aplicaciones de accesibilidad, priorizando velocidad con `non-thinking`.

## Benchmarks y rendimiento

La model card indica que R-4B alcanza el primer puesto entre modelos de menos de 20B parámetros en el leaderboard multimodal académico de OpenCompass (11 de agosto de 2025) y el primer puesto entre todos los modelos open source en el leaderboard de razonamiento multimodal de OpenCompass (18 de agosto de 2025). Sin embargo, no se incluyen en la información proporcionada las puntuaciones numéricas concretas (MMLU, HumanEval, GSM8K u otras), por lo que no se presentan cifras.

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.819 millones de parámetros, en fp16/bf16 se requieren aproximadamente 9,6 GB solo para pesos, más overhead de activaciones y del codificador visual; en fp32 (como en el ejemplo de la model card) se superan los 19 GB.
- Cuantización: no se documentan formatos GGUF ni cuantizaciones oficiales; el despliegue recomendado es vLLM con pesos safetensors.
- GPU recomendadas: el ejemplo oficial de vLLM usa `--tensor-parallel-size 8`, lo que sugiere despliegue multi-GPU en entornos de servidor (A100/H100). Para una sola GPU, una RTX 4090 (24 GB) debería bastar en bf16, aunque no está confirmado en la documentación.
- Cabe en GPU de consumo: sí, previsiblemente en GPUs con 16-24 GB en bf16, aunque no se documenta oficialmente.
- Opciones de despliegue: vLLM (recomendado, con soporte de `thinking_mode` en la API), Transformers con `trust_remote_code=True`. No se menciona soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada. El modo `auto-thinking` está diseñado para reducir coste computacional al evitar razonamiento innecesario.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| R-4B | 4,8B | no disponible | Apache 2.0 | MLLM con razonamiento adaptativo de tres modos; base Qwen3-4B |
| Qwen3-4B (base) | 4B | no disponible | Apache 2.0 | Modelo de lenguaje sin visión; base del anterior |
| Alternativas multimodales de tamano similar | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de información suficiente para comparar rendimiento numérico con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- Idiomas: la model card declara únicamente inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación: como todo MLLM, puede generar descripciones o razonamientos incorrectos sobre imágenes, especialmente en el modo `thinking` con cadenas largas.
- Sesgos: no se documentan evaluaciones de sesgo en la información proporcionada; los sesgos del corpus de entrenamiento de Qwen3-4B y del dataset multimodal pueden propagarse.
- Longitud de contexto: no especificada en la información disponible; conviene validarla antes de usarla en producción con documentos largos.
- Requiere `trust_remote_code=True`: el modelo usa código de modelado personalizado, lo que implica revisar el código antes de ejecutarlo en entornos sensibles.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen3-4B y de los datasets multimodales empleados.
- Repositorio espejo: `vllm-project/R-4B` es una copia de `YannQi/R-4B` mantenida para CI de vLLM; para la versión canónica y actualizaciones debe consultarse el repositorio original.
- Madurez: pocas descargas (21) y ningún "like" en el momento de la consulta; ecosistema y validación comunitaria limitados.

## Enlaces

- Hugging Face (copia vLLM): https://huggingface.co/vllm-project/R-4B
- Hugging Face (original): https://huggingface.co/YannQi/R-4B
- Paper: https://arxiv.org/pdf/2508.21113
- Código: https://github.com/yannqi/R-4B
- ModelScope: https://huggingface.co/YannQi/R-4B (enlace indicado en la model card)
- Leaderboard multimodal académico OpenCompass: https://rank.opencompass.org.cn/leaderboard-multimodal/?m=REALTIME
- Leaderboard de razonamiento multimodal OpenCompass: https://rank.opencompass.org.cn/leaderboard-multimodal-reasoning/?m=REALTIME
- Repositorio vLLM: https://github.com/vllm-project/vllm
