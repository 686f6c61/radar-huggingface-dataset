# XinchengTan/nsdl-7b-sft

## Resumen

NSDL 7B (SFT) es un ajuste fino supervisado del modelo multimodal Qwen2.5-VL-7B-Instruct, desarrollado por Xincheng Tan y colaboradores (Ke Wang, Yining Di, Minfeng Zhu) en el contexto del artículo "NSDL: Neuro-Symbolic Division of Labor for Multi-Robot Task Planning" (preprint de arXiv, 2026). El modelo está especializado en planificación de tareas para sistemas multi-robot, combinando percepción visual y razonamiento simbólico dentro de un pipeline neuro-simbólico de reparto de trabajo.

El checkpoint corresponde a la fila "NSDL 7B (SFT)" de la Tabla I del artículo, a las ablaciones de la Tabla III y a la fila de transferencia entrenada en VIKI de la Tabla II. Se distribuye en bfloat16, con 8.292.166.656 parámetros totales (aproximadamente 8,3 mil millones) y un tamaño de repositorio de 16,6 GB repartido en cuatro ficheros safetensors.

Es relevante porque aplica un modelo de visión-lenguaje de propósito general a un dominio muy específico (coordinación de múltiples robots) mediante ajuste supervisado, y porque publica los pesos junto con el código de evaluación, lo que facilita la reproducibilidad. La licencia Apache-2.0 heredada del modelo base permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje) derivada de Qwen2.5-VL; detalles internos de capas y atención no disponibles en la información proporcionada |
| Parametros totales | 8.292.166.656 (8,3 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base Qwen2.5-VL-7B-Instruct, valor no confirmado en esta ficha) |
| Tipos de cuantizacion | No disponible; los pesos se publican en bfloat16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (4 shards, bfloat16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-VL-7B-Instruct, un transformer multimodal que procesa entradas de imagen y texto y genera texto. Sobre esa base se aplica un ajuste fino supervisado (SFT) orientado a planificación de tareas multi-robot, en el marco del método NSDL (Neuro-Symbolic Division of Labor). El artículo propone un reparto de trabajo neuro-simbólico: el modelo neuronal se encarga de la interpretación perceptiva y la generación de planes, mientras que componentes simbólicos aportan estructura y verificación. Los detalles concretos de la composición del dataset de entrenamiento, el número de tokens y la posible aplicación de RLHF o DPO no están disponibles en la información proporcionada.

El checkpoint publicado corresponde explícitamente a la variante entrenada en el entorno VIKI (fila de transferencia de la Tabla II), además de las filas de la Tabla I y las ablaciones de la Tabla III. Los pesos se almacenan en bfloat16, el mismo tipo de dato que usa el cargador de evaluación del repositorio oficial, y la evaluación debe realizarse con el código de `nsdl/` y el script `scripts/eval_lnsdl_agentic_viki_l2.py` del repositorio GitHub del autor. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal específicas de este ajuste.

## Capacidades

- Generación de texto y razonamiento multimodal: acepta entradas image-text-to-text, por lo que puede interpretar escenas visuales y producir descripciones o decisiones en lenguaje natural.
- Planificación de tareas multi-robot: capacidad central del ajuste, orientada a descomponer objetivos en subtareas asignables a distintos robots.
- Razonamiento agéntico y multi-paso: el pipeline NSDL está diseñado para ejecución agéntica (script de evaluación `eval_lnsdl_agentic_viki_l2.py`), con pasos encadenados de percepción, planificación y acción.
- Conversación multi-turno: heredada del modelo base Instruct, con plantilla de chat incluida (`chat_template.json`).
- Tool calling / function calling: no confirmado explícitamente en la información proporcionada; el modelo base Qwen2.5-VL-Instruct lo soporta, pero este ajuste no lo documenta.
- Capacidades multilingües: no disponibles; el ajuste está orientado a un dominio técnico y no se especifican idiomas.
- Integración con text-generation-inference: el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`, lo que sugiere compatibilidad con despliegue vía TGI.

## Casos de uso

- Coordinación de flotas de robots en almacén: el modelo interpreta imágenes del entorno y genera planes de asignación de tareas entre robots, aprovechando su naturaleza multimodal para razonar sobre el estado visual de la escena y repartir el trabajo según el método NSDL.
- Planificación de misiones en robótica de servicio: dado un objetivo en lenguaje natural y observaciones visuales, el modelo descompone la tarea en pasos ejecutables por distintos agentes, lo que encaja con el enfoque neuro-simbólico del artículo.
- Evaluación reproducible de investigación: al publicarse pesos y código de evaluación, sirve como referencia para reproducir las tablas del artículo y comparar variantes del método NSDL.
- Transferencia a nuevos entornos (VIKI-L2): el checkpoint está entrenado para la fila de transferencia VIKI, por lo que es adecuado para experimentos de generalización a dominios de simulación distintos del de entrenamiento original.
- Prototipado de agentes multimodales en robótica: permite construir pipelines agénticos que combinan percepción visual y generación de planes sin entrenar desde cero, partiendo de un modelo de 8,3 B parámetros.
- Investigación en división del trabajo neuro-simbólica: útil para estudiar cómo un modelo neuronal se integra con módulos simbólicos de verificación y asignación en tareas de planificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a las tablas del artículo (Tabla I, Tabla II, Tabla III) para los resultados, pero los valores numéricos no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16,6 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 24 GB de VRAM para contexto moderado.
- Cuantización: no se publican versiones GGUF ni cuantizadas; habría que generarlas a partir de los safetensors. En 8 bits se estiman unos 8-9 GB de pesos; en 4 bits, unos 4-5 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bfloat16 con contexto limitado. Para cuantización 4/8 bits, GPU consumer de 12-16 GB podrían ser suficientes, aunque no está verificado.
- Cabe en GPU consumer: sí, previsiblemente en RTX 4090 (24 GB) en bfloat16 y en GPUs de 12-16 GB con cuantización, si bien no hay datos oficiales de latencia ni throughput.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `endpoints_compatible`); llama.cpp u Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización | Disponibilidad |
|---|---|---|---|---|---|
| NSDL 7B (SFT) | 8,3 B | No disponible | Apache-2.0 | Planificación multi-robot (SFT sobre Qwen2.5-VL) | Pesos en HF, código en GitHub |
| Qwen2.5-VL-7B-Instruct (base) | ~8,3 B | No disponible en esta ficha | Apache-2.0 | Visión-lenguaje generalista | Ampliamente disponible |
| Alternativas de planificación multi-robot | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría (planificación multi-robot ajustada) en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: el ajuste está orientado a un dominio muy concreto (planificación multi-robot en el marco NSDL); su rendimiento fuera de ese dominio no está documentado y probablemente sea inferior al del modelo base.
- Dependencia del código: la model card indica explícitamente que debe cargarse y ejecutarse con el repositorio GitHub del autor y el script de evaluación concreto; un uso fuera de ese pipeline puede no reproducir los resultados del artículo.
- Idiomas no especificados: no se documenta qué idiomas soporta el ajuste, lo que añade incertidumbre para despliegues multilingües.
- Contexto no documentado: la longitud de contexto no se indica en la información proporcionada; conviene verificar el valor del modelo base antes de asumir ventanas largas.
- Riesgo de alucinación: como todo modelo generativo, puede producir planes o descripciones plausibles pero incorrectas; en robótica esto es crítico y exige verificación simbólica o supervisión humana.
- Sesgos: no se documentan sesgos específicos del ajuste; los sesgos del modelo base pueden persistir.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo se distribuye como artefacto de investigación sin garantías; el autor no ofrece soporte ni mantenimiento.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, con fecha de creación reciente; no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/XinchengTan/nsdl-7b-sft
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Código del proyecto: https://github.com/Xincheng-Tan/NSDL
- Artículo (preprint arXiv, 2026): referencia "NSDL: Neuro-Symbolic Division of Labor for Multi-Robot Task Planning", Tan, Wang, Di y Zhu; el identificador arXiv no está disponible en la información proporcionada.
