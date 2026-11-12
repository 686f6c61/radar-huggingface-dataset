# XinchengTan/nsdl-8b-qwen3vl-sft-locus

## Resumen

NSDL 8B (SFT) es un checkpoint de investigación publicado por XinchengTan, derivado mediante fine-tuning supervisado (SFT) del modelo multimodal Qwen3-VL-8B-Instruct. Forma parte del trabajo "NSDL: Neuro-Symbolic Division of Labor for Multi-Robot Task Planning" (Tan, Wang, Di y Zhu, preprint arXiv 2026), que propone una división de trabajo neuro-simbólica para la planificación de tareas en equipos de múltiples robots. El modelo se corresponde con la fila "NSDL 8B, Qwen3-VL (SFT)" de la Tabla II del artículo.

El modelo resuelve el problema de generar planes de tareas para varios robots a partir de observaciones visuales y lenguaje natural, combinando la percepción de un VLM con la estructura de un planificador simbólico. Se entrenó sobre el split de entrenamiento del dataset LOCUS, con la entrada visual limitada a 524.288 píxeles, y sus pesos se almacenan en bfloat16, el dtype que emplea el cargador de evaluación del repositorio oficial.

Con 8.767.123.696 parámetros y un tamaño de repositorio de 17,5 GB, es un modelo de escala media pensado para ejecutarse en una GPU de gama alta. Su relevancia es acotada: no es un modelo de propósito general, sino un artefacto reproducible para evaluar la propuesta NSDL en el benchmark LOCUS, y su uso previsto pasa por el código de evaluación publicado por los autores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje), base Qwen3-VL-8B-Instruct |
| Parametros totales | 8.767.123.696 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16, 4 shards) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-VL-8B-Instruct: un transformer multimodal que procesa entradas de imagen y texto (pipeline `image-text-to-text`) y genera texto. El checkpoint incluye los ficheros de preprocesado de imagen y vídeo (`preprocessor_config.json`, `video_preprocessor_config.json`), lo que confirma el soporte de entradas visuales estáticas y de vídeo heredado del modelo base.

El entrenamiento consistió en un fine-tuning supervisado sobre el split de entrenamiento del dataset LOCUS, con la entrada del VLM limitada a 524.288 píxeles. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; tampoco describe innovaciones arquitectónicas propias más allá de la integración con el pipeline neuro-simbólico NSDL, que reside en el código del repositorio y no en los pesos. Los pesos se guardan en bfloat16 para coincidir con el dtype del cargador de evaluación.

## Capacidades

- Generación de texto y razonamiento multimodal a partir de imágenes y lenguaje natural, heredados de Qwen3-VL-8B-Instruct.
- Planificación de tareas para múltiples robots (multi-robot task planning), objetivo principal del fine-tuning.
- Procesamiento de entradas de imagen y vídeo (etiquetas `image-text-to-text`, ficheros de preprocesado de vídeo presentes).
- Conversación multi-turno (etiqueta `conversational`).
- Integración con el pipeline neuro-simbólico NSDL para la división de trabajo entre módulos neuronales y simbólicos.
- Compatibilidad con endpoints (`endpoints_compatible`) para despliegue vía Inference Endpoints.
- Soporte de tool calling, agentes o modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la model card no especifica idiomas.

## Casos de uso

- Evaluación reproducible del método NSDL: cargar el checkpoint con `nsdl/` y `scripts/eval_lnsdl_agentic_viki_l2.py` del repositorio oficial para reproducir la fila de la Tabla II del artículo y comparar contra otras variantes del método.
- Planificación de tareas en equipos de robots: dado un objetivo en lenguaje natural y observaciones visuales del entorno, el modelo genera el plan que el planificador simbólico de NSDL valida y distribuye entre robots.
- Investigación en integración neuro-simbólica: usar el modelo como componente neuronal de referencia para estudiar cómo un VLM de 8B se acopla a un planificador simbólico en dominios de robótica.
- Experimentos de ablación sobre SFT: al ser un checkpoint SFT puro sobre LOCUS, sirve como línea base para comparar con variantes con RL u otras estrategias de entrenamiento del mismo artículo.
- Prototipado de asistentes visuales para robótica: aprovechar las capacidades heredadas de Qwen3-VL-8B-Instruct para tareas de percepción y descripción de escenas antes de integrarlas en un pipeline de planificación.
- Docencia y reproducción académica: el modelo, con licencia Apache-2.0 y pesos en safetensors, permite a grupos de investigación reproducir los resultados del preprint sin restricciones de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente referencia la Tabla II del preprint arXiv de NSDL, sin incluir cifras numéricas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 17,5 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 24 GB para contexto corto y 40-80 GB para contextos largos.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para evaluación fiel en bfloat16; RTX 4090 (24 GB) puede ser suficiente con contexto reducido o cuantización.
- GPU de consumo: cabe en RTX 4090 y, con cuantización a 8 bits o 4 bits (no publicada en el repo, habría que generarla), en GPUs de 16-24 GB.
- Opciones de despliegue: transformers (librería declarada), Inference Endpoints (etiqueta `endpoints_compatible`); vLLM, TGI, llama.cpp u Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| NSDL 8B (SFT) | 8,77 B | no disponible | Apache-2.0 | Fine-tuning específico para planificación multi-robot sobre LOCUS |
| Qwen3-VL-8B-Instruct | ~8 B (no confirmado en la información) | no disponible | Apache-2.0 | Modelo base; capacidades generales de visión-lenguaje |
| Otros modelos de planificación multi-robot | no disponible | no disponible | no disponible | No se dispone de alternativas comparables en la información proporcionada |

## Limitaciones y advertencias

- Modelo de investigación: está diseñado para reproducir un resultado concreto del preprint NSDL y su uso fuera de ese pipeline no está documentado.
- Dependencia del código: la model card indica explícitamente que debe cargarse con el repositorio `Xincheng-Tan/NSDL`; el uso con transformers estándar puede no reproducir los resultados.
- Sesgos: no documentados en la información disponible; al heredar Qwen3-VL-8B-Instruct, arrastra los sesgos del modelo base y de los datos de SFT sobre LOCUS.
- Riesgo de alucinación: no evaluado en la información disponible; en planificación de tareas, un plan inválido puede tener consecuencias físicas en un entorno robótico real.
- Idiomas: no especificados; no se garantiza un rendimiento multilingüe más allá del que herede el modelo base.
- Contexto: la longitud de contexto no se detalla; la entrada visual se limita a 524.288 píxeles durante el entrenamiento, por lo que resoluciones mayores pueden degradar el rendimiento.
- Licencia: Apache-2.0 permite uso comercial, pero la ausencia de garantías y la naturaleza de investigación del checkpoint desaconsejan su uso en producción sin validación adicional.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/XinchengTan/nsdl-8b-qwen3vl-sft-locus
- Código del proyecto NSDL: https://github.com/Xincheng-Tan/NSDL
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Preprint arXiv de NSDL: referencia "arXiv preprint, 2026" en la model card, sin identificador disponible.
