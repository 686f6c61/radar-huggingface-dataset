# Thamo31/Llama-3.2-3B-4bit-classification-routing-gguf

## Resumen

El modelo `Thamo31/Llama-3.2-3B-4bit-classification-routing-gguf` es un fine-tune del modelo base Llama 3.2 3B Instruct, convertido a formato GGUF mediante la librería Unsloth. El nombre sugiere que ha sido entrenado específicamente para tareas de clasificación y enrutamiento de texto, aunque la documentación pública es muy escasa: no se especifica el dataset de entrenamiento, el proceso de fine-tuning ni los resultados obtenidos. El repositorio contiene un único archivo `Llama-3.2-3B-Instruct.Q4_K_M.gguf` y un Modelfile para Ollama, lo que facilita su despliegue en entornos locales.

Al estar basado en Llama 3.2 3B, hereda la arquitectura transformer decoder-only de Meta, con 3.212.749.888 parámetros y una ventana de contexto nativa de 128.000 tokens (aunque no se confirma si el fine-tune la mantiene). Su relevancia radica en ofrecer una versión cuantizada y especializada de un modelo pequeño, apta para ejecutarse en hardware de consumo, orientada a tareas de clasificación y routing en pipelines de IA. Sin embargo, la falta de información detallada limita su evaluación rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Llama 3.2 3B) |
| Parametros totales | 3.212.749.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base soporta 128.000 tokens) |
| Tipos de cuantizacion | Q4_K_M (archivo GGUF incluido) |
| Idiomas soportados | no disponible (el modelo base soporta ingles, aleman, frances, hindi, italiano, portugues y español) |
| Licencia | no disponible (el modelo base usa Llama 3.2 Community License) |
| Formato de pesos | GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Llama 3.2 3B Instruct, un transformer decoder-only con 3.212 millones de parámetros, entrenado originalmente por Meta con 9 billones de tokens y optimizado mediante RLHF para instrucciones y diálogo. El fine-tune fue realizado con Unsloth, una librería que acelera el entrenamiento y la conversión a GGUF, pero no se publican detalles sobre el dataset de clasificación/routing utilizado, el número de épocas, la técnica de ajuste (LoRA, full fine-tune, etc.) ni los hiperparámetros. La conversión a GGUF se realizó con cuantización Q4_K_M, lo que reduce el tamaño del modelo a aproximadamente 2 GB y permite su ejecución en hardware modesto.

No se documenta ninguna innovación técnica adicional más allá de la especialización en tareas de clasificación y enrutamiento, que probablemente implica una capa de clasificación o un ajuste de las cabezas de salida, aunque esto no se confirma en la model card.

## Capacidades

- Generacion de texto: al derivar de Llama 3.2 3B Instruct, conserva la capacidad de generar texto coherente y seguir instrucciones, aunque no se garantiza que el fine-tune no haya alterado este comportamiento.
- Clasificacion y routing: el nombre del modelo indica una especialización en clasificar texto y enrutar peticiones, probablemente hacia otros modelos o sistemas, pero no hay ejemplos ni documentación que lo demuestre.
- Soporte de tool calling: el modelo base Llama 3.2 3B Instruct soporta tool calling y agentes, pero no se confirma si el fine-tune mantiene esta capacidad.
- Capacidades multilingues: el modelo base soporta varios idiomas, pero no se especifica si el fine-tune los conserva.
- Otras capacidades: no se documentan capacidades especiales como vision, audio o thinking mode.

## Casos de uso

Dado que no hay documentación específica, los casos de uso se infieren del nombre y de las capacidades del modelo base. Se recomienda validar el comportamiento real antes de usarlo en producción.

- Clasificacion de intenciones en chatbots: el modelo puede etiquetar la intencion de un mensaje de usuario (compra, soporte, reclamacion) y enrutarlo al agente o flujo adecuado, aprovechando su especializacion en routing.
- Enrutamiento de consultas en sistemas multi-modelo: en una arquitectura con varios LLMs especializados, el modelo puede decidir que modelo debe responder segun la naturaleza de la consulta, reduciendo costes y latencia.
- Moderacion de contenido: clasificar mensajes como apropiados o inapropiados, aunque no hay evidencia de que el fine-tune haya sido entrenado para ello.
- Analisis de sentimiento en redes sociales: categorizar opiniones como positivas, negativas o neutras, si el fine-tune ha sido entrenado con datos de ese tipo.
- Filtrado de correos o tickets: asignar categorias a correos entrantes (facturacion, tecnico, ventas) para automatizar su distribucion.
- Preprocesamiento en pipelines de RAG: clasificar documentos o consultas para seleccionar el indice o la base de conocimiento adecuada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas de MMLU, HumanEval, GSM8K ni de tareas de clasificacion especificas. Tampoco hay comparaciones con otros modelos de clasificacion o con el Llama 3.2 3B original.

## Requisitos de hardware

- VRAM estimada: al ser un GGUF Q4_K_M de 3B parametros, el archivo pesa aproximadamente 2 GB, por lo que la inferencia puede ejecutarse con unos 2-3 GB de VRAM, dependiendo del contexto y del backend.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 3060, o incluso CPU con suficiente RAM (llama.cpp soporta ejecucion en CPU).
- Compatibilidad con consumer GPU: si, cabe en GPUs de gama de entrada y media.
- Opciones de despliegue: llama.cpp, Ollama (incluye Modelfile), llama-cpp-python, o servidores compatibles con GGUF como llama-server. Tambien puede usarse con vLLM si se convierte a otro formato, aunque no es el flujo habitual.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna (RTX 3060) se espera una velocidad de decodificacion de 30-50 tokens por segundo, pero es una estimacion no verificada.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa rigurosa. El modelo compite potencialmente con otros fine-tunes de Llama 3.2 3B orientados a clasificacion, o con modelos como DistilBERT o MiniLM para tareas de clasificacion, pero no hay datos de rendimiento publicados. Se puede comparar con el modelo base Llama 3.2 3B Instruct en cuanto a arquitectura y tamaño, pero no en cuanto a rendimiento en clasificacion.

| Modelo | Parametros | Contexto | Licencia | Formato | Especializacion |
|---|---|---|---|---|---|
| Thamo31/Llama-3.2-3B-4bit-classification-routing-gguf | 3.2B | no disponible | no disponible | GGUF Q4_K_M | Clasificacion y routing (segun nombre) |
| meta-llama/Llama-3.2-3B-Instruct | 3.2B | 128k | Llama 3.2 Community License | safetensors, GGUF | Instrucciones y dialogo general |
| Ollama llama3.2:3b | 3.2B | 128k | Llama 3.2 Community License | GGUF | Instrucciones y dialogo general |

## Limitaciones y advertencias

- Documentacion insuficiente: no se especifica el dataset de entrenamiento, el proceso de fine-tuning ni los criterios de evaluacion, lo que impide conocer su calidad real en tareas de clasificacion.
- Riesgo de alucinacion: al ser un modelo generativo, puede producir clasificaciones incorrectas o inventar categorias si no se controla la salida.
- Sesgos del modelo base: hereda los sesgos potenciales de Llama 3.2 3B, que pueden afectar a la clasificacion de textos sensibles (genero, raza, etc.).
- Licencia incierta: la licencia no esta declarada en el repositorio. Si se deriva de Llama 3.2, podria estar sujeta a la Llama 3.2 Community License, que exige atribucion y tiene restricciones para usos con mas de 700 millones de usuarios mensuales. Se recomienda verificar antes de un uso comercial.
- Contexto no confirmado: no se sabe si el fine-tune mantiene la ventana de 128k tokens del modelo base; si se reduce, podria limitar el procesamiento de textos largos.
- Sin garantias de produccion: al no haber benchmarks ni ejemplos de uso, no se recomienda desplegarlo en entornos criticos sin una validacion exhaustiva.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Thamo31/Llama-3.2-3B-4bit-classification-routing-gguf
- Modelo base Llama 3.2 3B (Meta): https://huggingface.co/meta-llama/Llama-3.2-3B
- Documentacion de Llama 3.2 (Meta): https://developer.meta.com/ai/docs/model-cards-and-prompt-formats/llama3_2/
- Model card oficial de Llama 3.2 (GitHub): https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/MODEL_CARD.md
- Pagina de Llama 3.2 3B en Ollama: https://ollama.com/library/llama3.2:3b
- Unsloth (libreria de entrenamiento y conversion): https://github.com/unslothai/unsloth
