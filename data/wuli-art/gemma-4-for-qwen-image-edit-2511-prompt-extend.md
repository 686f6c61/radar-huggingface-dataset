# Wuli-art/Gemma-4-for-Qwen-Image-Edit-2511-Prompt-Extend

## Resumen

Wuli-art/Gemma-4-for-Qwen-Image-Edit-2511-Prompt-Extend es un modelo de extension de prompts (prompt extend) desarrollado por Wuli-art, un equipo vinculado al ecosistema de Alibaba. Se trata de un fine-tuning de google/gemma-4-12B-it, un modelo de lenguaje de 12 000 millones de parametros, especificamente entrenado para transformar instrucciones de edicion de imagenes breves o ambiguas en prompts detallados y estructurados que mejoran la precision y estabilidad del modelo de edicion Qwen Image Edit 2511.

El modelo aborda un problema practico en edicion de imagenes: los prompts de usuario suelen ser demasiado concisos o referirse a multiples imagenes de entrada, lo que provoca resultados inconsistentes. Este modelo genera un prompt extendido que explicita la intencion de edicion, la referencia a objetos concretos y las relaciones espaciales, permitiendo que el modelo de difusion produzca resultados mas fieles. El entrenamiento utiliza Prompt Extend Reinforcement Learning (PERL) sobre la libreria ROLL de Alibaba, con Kimi K2.6 actuando como reward worker para evaluar la calidad de las ediciones resultantes.

La relevancia actual del modelo radica en su integracion directa con el flujo de trabajo de ComfyUI para Qwen Image Edit 2511, ofreciendo una solucion lista para produccion que combina un LLM de 12B con un modelo de difusion de ultima generacion. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones, y esta disponible en versiones BF16 y FP8 escalada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en google/gemma-4-12B-it) |
| Parametros totales | 12 000 millones (12B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, FP8 escalada |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Gemma 4 12B, un transformer decoder-only desarrollado por Google, y se somete a un fine-tuning especifico para la tarea de extension de prompts. El entrenamiento emplea Prompt Extend Reinforcement Learning (PERL), un metodo implementado sobre la libreria ROLL de Alibaba que combina generacion de prompts extendidos con evaluacion por refuerzo. En este esquema, el modelo genera un prompt extendido a partir de un prompt original y las imagenes de entrada; dicho prompt se utiliza para producir una edicion con Qwen Image Edit 2511, y el resultado se evalua mediante Kimi K2.6, que actua como reward worker asignando una puntuacion basada en la fidelidad de la edicion a la intencion del usuario.

El proceso de entrenamiento optimiza el modelo para producir prompts que maximicen la recompensa, es decir, que conduzcan a ediciones mas precisas y estables. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas adicionales como SFT previo o DPO. El modelo se publica en dos variantes: BF16 completa y FP8 escalada, esta ultima pensada para reducir requisitos de memoria sin perdida significativa de calidad.

## Capacidades

- Extension de prompts de edicion de imagenes: recibe un prompt de edicion junto con una o varias imagenes de entrada y genera un prompt detallado y estructurado que explicita la intencion de edicion, referencias a objetos y relaciones espaciales.
- Integracion con Qwen Image Edit 2511: disenado especificamente para funcionar como modulo previo al modelo de difusion Qwen Image Edit 2511, mejorando la calidad y estabilidad de las ediciones resultantes.
- Soporte de multiples imagenes de entrada: capaz de procesar varias imagenes de referencia y generar un prompt que las relaciona entre si (por ejemplo, "toma el diseno del vaso de la imagen 2 y colocalo sobre la mesa de la imagen 1").
- Capacidades multilingues: entrenado para ingles y chino, lo que permite su uso en entornos internacionales y en el mercado chino.
- Compatibilidad con ComfyUI: se proporciona un workflow listo para usar que integra el modelo con los componentes necesarios (text encoder, VAE, DiT y LoRA de aceleracion).
- Generacion de prompts en formato compatible con el sistema oficial de Qwen Image: utiliza el mismo system prompt que la herramienta prompt_utils.py del repositorio oficial de Qwen-Image.

## Casos de uso

- Edicion de imagenes con instrucciones complejas: un usuario puede indicar "referencia el diseno del vaso de goji berry de la imagen 2 y colocarlo sobre la mesa junto al raton" y el modelo genera un prompt detallado que Qwen Image Edit 2511 interpreta correctamente, evitando errores de localizacion o de estilo.
- Automatizacion de flujos de edicion en produccion: integrado en pipelines de generacion de contenido visual, el modelo estandariza prompts de entrada de multiples usuarios y garantiza resultados consistentes en volumen, reduciendo la necesidad de retoques manuales.
- Edicion de producto para e-commerce: en catalogos de productos, el modelo permite transformar instrucciones como "cambia el fondo de la imagen a un entorno de playa" en prompts ricos que preservan el producto y ajustan iluminacion, reflejos y perspectiva de forma coherente.
- Creacion de variaciones creativas: disenadores pueden usar el modelo para explorar multiples interpretaciones de una misma instruccion, generando prompts extendidos alternativos que producen resultados diversos pero fieles a la intencion original.
- Asistencia a usuarios no tecnicos: en aplicaciones de edicion fotografica, el modelo traduce lenguaje natural impreciso ("hazlo mas bonito") en instrucciones tecnicas concretas para el modelo de difusion, mejorando la experiencia de usuario.
- Postproduccion de video e imagen en estudios: integrado en herramientas de retoque masivo, el modelo permite procesar lotes de imagenes con instrucciones heterogeneas, unificando el estilo de edicion mediante prompts extendidos consistentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una tabla comparativa visual con cuatro metodos de extension de prompts (sin extension, Qwen3.7 Plus, Gemma base y el modelo fine-tuned), mostrando ejemplos cualitativos de ediciones resultantes, pero no proporciona metricas cuantitativas como MMLU, HumanEval o similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no se especifica oficialmente. Para un modelo de 12B en BF16 se estiman aproximadamente 24 GB de VRAM; la variante FP8 escalada reduce el requisito a unos 12-14 GB, aunque estos valores son orientativos y dependen de la implementacion.
- GPU recomendadas: para la version BF16 se requieren GPUs profesionales como A100 (40/80 GB) o H100; la version FP8 puede ejecutarse en GPUs consumer de gama alta como RTX 4090 (24 GB) o RTX 3090 (24 GB) con margen para el resto del pipeline.
- En consumer GPU: la variante FP8 es viable en RTX 4090, pero el flujo completo con Qwen Image Edit 2511 (que incluye un DiT de gran tamano) puede requerir mas memoria; se recomienda verificar el consumo total del workflow.
- Opciones de despliegue: el modelo se distribuye como archivos safetensors para su uso en ComfyUI mediante un workflow proporcionado. Tambien puede cargarse con la libreria diffusers de HuggingFace, aunque la model card no documenta este flujo alternativo.
- Latencia y throughput: no se proporcionan datos medidos. Al ser un modelo de 12B, la generacion de un prompt extendido puede tardar varios segundos en GPU consumer; la variante FP8 reduce el tiempo de inferencia.

## Comparativa con modelos similares

La model card compara cualitativamente este modelo con tres alternativas para la tarea de extension de prompts en edicion de imagenes:

| Modelo | Tipo | Ventaja | Limitacion |
|---|---|---|---|
| Wuli-art/Gemma-4-for-Qwen-Image-Edit-2511 (este) | Fine-tuning de Gemma 4 12B con RL | Entrenado especificamente para la tarea, produce prompts que mejoran la estabilidad de Qwen Image Edit 2511 | Requiere Qwen Image Edit 2511 como modelo de difusion; no es autonomo |
| Qwen3.7 Plus (API de Bailian) | LLM propietario | Genera prompts extendidos de calidad general | No esta optimizado para edicion de imagenes; puede producir prompts menos alineados con el modelo de difusion |
| Gemma 4 12B base (sin fine-tuning) | LLM generico | Disponible, sin entrenamiento especifico | Produce prompts menos efectivos, como muestran los ejemplos visuales |

No se dispone de datos cuantitativos (metricas automaticas) para una comparacion objetiva; la evaluacion se basa en resultados visuales publicados en la model card.

## Limitaciones y advertencias

- Dependencia de Qwen Image Edit 2511: el modelo no es autonomo; su salida solo tiene sentido cuando se utiliza junto con el modelo de difusion Qwen Image Edit 2511. Sin el, el prompt extendido no produce imagenes.
- Idiomas limitados: solo soporta ingles y chino; prompts en otros idiomas pueden producir resultados suboptimos o fallos.
- Riesgo de alucinacion en prompts: al ser un LLM, puede generar descripciones de objetos o relaciones que no existen en las imagenes de entrada, lo que degrada la edicion resultante.
- Sesgos potenciales: no se ha publicado informacion sobre sesgos de genero, raza o cultural; al entrenarse con datos de internet, puede reflejar sesgos presentes en el corpus.
- Requisitos de memoria elevados: la version BF16 requiere ~24 GB de VRAM, lo que excluye GPUs consumer de gama media; la version FP8 alivia el problema pero sigue siendo exigente en el flujo completo.
- Sin garantia de rendimiento en produccion: no se han publicado benchmarks cuantitativos ni pruebas de estres; la calidad puede variar segun el dominio de las imagenes.
- Licencia Apache 2.0: permite uso comercial sin restricciones, pero el modelo base Gemma 4 esta sujeto a los terminos de Google; se recomienda revisar la licencia del modelo base para confirmar compatibilidad.

## Enlaces

- HuggingFace: https://huggingface.co/Wuli-art/Gemma-4-for-Qwen-Image-Edit-2511-Prompt-Extend
- ModelScope: https://www.modelscope.cn/models/Wuli-Art/Gemma-4-for-Qwen-Image-Edit-2511-Prompt-Extend
- Workflow ComfyUI: https://wuli-ai.oss-cn-zhangjiakou.aliyuncs.com/image/public/qwen_image_edit_2511_gemma_pe.json
- Repositorio oficial Qwen-Image (herramienta prompt_utils): https://github.com/QwenLM/Qwen-Image/blob/main/src/examples/tools/prompt_utils.py
- Libreria ROLL (Alibaba): https://github.com/alibaba/ROLL
- Modelo base Gemma 4 12B it: https://huggingface.co/google/gemma-4-12B-it
- Qwen Image Edit 2511: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- LoRA Lightning 8 pasos: https://huggingface.co/lightx2v/Qwen-Image-Edit-2511-Lightning/blob/main/Qwen-Image-Edit-2511-Lightning-8steps-V1.0-bf16.safetensors
- Kimi K2.6 (reward worker): https://huggingface.co/moonshotai/Kimi-K2.6
