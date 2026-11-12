# XinchengTan/nsdl-3b-sft-viki

## Resumen

NSDL 3B (SFT) es un checkpoint de ajuste supervisado (SFT) derivado de Qwen2.5-VL-3B-Instruct, publicado por XinchengTan como parte del trabajo "NSDL: Neuro-Symbolic Division of Labor for Multi-Robot Task Planning". El modelo está especializado en planificación de tareas para sistemas multi-robot, combinando percepción visual y razonamiento simbólico dentro de un pipeline neuro-simbólico. Se corresponde con la fila "NSDL 3B (SFT)" de la Tabla I del artículo, y está pensado para ejecutarse con el código de evaluación del repositorio oficial del proyecto.

Arquitectónicamente hereda la estructura de Qwen2.5-VL-3B-Instruct: un transformer multimodal con torre visual para entrada image-text-to-text, con aproximadamente 4.066 millones de parámetros almacenados en bfloat16. El modelo no está pensado como un asistente generalista, sino como un componente especializado dentro de un agente de planificación que recibe observaciones visuales y produce planes de tareas para equipos de robots.

La relevancia de esta ficha es acotada: se trata de un checkpoint de investigación con cero descargas y cero likes en el momento de la consulta, sin model card extendida más allá de la referencia al paper y a las instrucciones de ejecución. Su interés radica en ser un ejemplo concreto de aplicación de modelos visión-lenguaje de 3B a planificación multi-robot con división de trabajo neuro-simbólica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda Qwen2.5-VL-3B-Instruct), vision-language image-text-to-text |
| Parametros totales | 4.065.787.904 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos publicados en bfloat16; no se documentan otras cuantizaciones oficiales |
| Idiomas soportados | No disponible (no declarados en la model card) |
| Licencia | Qwen Research License (qwen-research), uso no comercial de investigación |
| Formato de pesos | safetensors (2 shards, bfloat16) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado (SFT) sobre Qwen2.5-VL-3B-Instruct, un transformer multimodal con encoder visual y decoder de lenguaje, orientado a tareas image-text-to-text. La model card no detalla la composición del dataset de SFT, el número de tokens de entrenamiento ni si se aplicaron etapas de RLHF o DPO. Tampoco se especifican innovaciones técnicas propias más allá del pipeline neuro-simbólico descrito en el paper, en el que el modelo actúa como componente de planificación dentro de una arquitectura de división de trabajo entre robots.

El checkpoint se distribuye en bfloat16, el mismo dtype que utiliza el loader de evaluación del repositorio oficial. La ejecución prevista es mediante el código de `https://github.com/Xincheng-Tan/NSDL`, concretamente el script `scripts/eval_lnsdl_agentic_viki_l2.py`, con los flags de evaluación documentados en el README del repositorio. No se documentan detalles sobre datos de entrenamiento, composición del corpus ni proceso de alineación.

## Capacidades

- Generación de texto y razonamiento multimodal a partir de entradas image-text-to-text.
- Planificación de tareas para sistemas multi-robot (task planning), objetivo principal del fine-tuning.
- Procesamiento de observaciones visuales gracias a la torre visual heredada de Qwen2.5-VL.
- Razonamiento agéntico de múltiples pasos en el contexto del pipeline NSDL (evaluación agentic en `eval_lnsdl_agentic_viki_l2.py`).
- Soporte de tool calling / function calling: no documentado explícitamente en la model card.
- Capacidades multilingües: no documentadas.
- Modo thinking, visión, audio u otras capacidades especiales: no documentadas más allá de la entrada visual.

## Casos de uso

- Planificación de tareas multi-robot en entornos de investigación: el modelo recibe observaciones visuales del entorno y produce planes de tareas que el componente simbólico del pipeline NSDL valida y ejecuta. Es su caso de uso primario y el único documentado por el autor.
- Evaluación reproducible de pipelines neuro-simbólicos: sirve como checkpoint de referencia para reproducir los resultados de la Tabla I del paper usando el script de evaluación oficial.
- Investigación en división de trabajo entre agentes: permite estudiar cómo un VLM de 3B distribuye subtareas entre robots dentro de una arquitectura neuro-simbólica.
- Prototipado de agentes visuales especializados: al ser un modelo de 3B, puede desplegarse en entornos de laboratorio con recursos limitados para experimentar con planificación basada en percepción.
- Benchmarking de fine-tuning multimodal: útil como punto de comparación frente a Qwen2.5-VL-3B-Instruct base en tareas de planificación estructurada.
- Docencia y experimentación académica: su tamaño y licencia de investigación lo hacen adecuado para cursos y trabajos fin de máster sobre planificación multi-agente con modelos visión-lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a la Tabla I del paper "NSDL: Neuro-Symbolic Division of Labor for Multi-Robot Task Planning" (arXiv preprint, 2026), pero los valores numéricos no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 8,1 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 12-16 GB de VRAM para contexto moderado.
- VRAM estimada en cuantización de 8 bits: en torno a 4-5 GB de pesos; en 4 bits, en torno a 2,5-3 GB, aunque no se distribuyen cuantizaciones oficiales.
- GPU recomendadas: A100, H100 o L40S para evaluación a escala; RTX 4090 (24 GB) suficiente para inferencia en bfloat16.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en bfloat16; en GPUs de 8-12 GB requeriría cuantización no oficial.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference y endpoints compatibles según los tags del repositorio; el pipeline oficial de evaluación es el código del repositorio NSDL.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| NSDL 3B (SFT) | 4.066 M | No disponible | Qwen Research (no comercial) | Hugging Face, 0 descargas |
| Qwen2.5-VL-3B-Instruct | ~3.750 M (3B nominales) | No disponible en la información | Qwen Research (no comercial) | Hugging Face, modelo base público |
| Qwen2.5-VL-7B-Instruct | ~7B nominales | No disponible en la información | Qwen Research / Apache según variante | Hugging Face |

La comparación relevante es frente a su modelo base Qwen2.5-VL-3B-Instruct: NSDL 3B añade especialización en planificación multi-robot a costa de perder generalidad y de quedar atado al pipeline de evaluación del paper. No se dispone de datos de rendimiento comparativos en la información proporcionada.

## Limitaciones y advertencias

- Licencia Qwen Research License: uso exclusivamente no comercial de investigación; cualquier uso comercial requiere autorización separada.
- Modelo de investigación sin validación externa: cero descargas y cero likes en el momento de la consulta, sin evidencia de uso independiente.
- Sin model card extendida: no se documentan datos de entrenamiento, sesgos, idiomas ni comportamiento fuera del dominio de planificación multi-robot.
- Riesgo de alucinación inherente a los VLM de 3B, especialmente en razonamiento de múltiples pasos y en la generación de planes válidos.
- Acoplamiento al pipeline NSDL: la evaluación y el uso previsto dependen del código del repositorio oficial; fuera de ese contexto el comportamiento no está caracterizado.
- Longitud de contexto no documentada: no debe asumirse la ventana del modelo base sin verificación.
- Fecha de creación declarada en 2026-11-11, coherente con el preprint de 2026; verificar la vigencia del checkpoint antes de reutilizarlo.
- No apto para producción sin evaluación propia: ausencia de benchmarks publicados en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/XinchengTan/nsdl-3b-sft-viki
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct/blob/main/LICENSE
- Repositorio de código NSDL: https://github.com/Xincheng-Tan/NSDL
- Script de evaluación: `scripts/eval_lnsdl_agentic_viki_l2.py` (dentro del repositorio anterior)
- Paper: "NSDL: Neuro-Symbolic Division of Labor for Multi-Robot Task Planning", Tan, Wang, Di, Zhu; arXiv preprint, 2026 (sin enlace directo disponible en la información proporcionada)
