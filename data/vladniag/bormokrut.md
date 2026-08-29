# Vladniag/Bormokrut

## Resumen

Bormokrut es un modelo de lenguaje ligero basado en la arquitectura GPT-2, desarrollado por Vladniag (Vladimir Agapov) y publicado en Hugging Face. Ha sido afinado mediante fine-tuning supervisado (SFT) con la librería `trl` para realizar dos tareas específicas en ruso: extracción de entidades, aspectos y preguntas clave de un fragmento de texto, y enrutamiento de una consulta hacia una de las categorías de experto predefinidas. Con 35,1 millones de parámetros, está pensado para escenarios de procesamiento de texto acotados y de bajo coste computacional, donde se requiere una respuesta rápida y especializada sin necesidad de un modelo de gran escala.

El modelo se basa en el también publicado [Bormotuha](https://huggingface.co/Vladniag/Bormotuha) y utiliza un formato de prompt estructurado con etiquetas XML (`<instruction>`, `<fragment>`, `<result>`, `<subject>`). Su licencia MIT permite uso comercial sin restricciones, y al ser un modelo pequeño puede ejecutarse en hardware modesto, incluso en CPU. Aunque su ámbito de aplicación es limitado (solo ruso y dos tareas), demuestra cómo un ajuste fino dirigido puede convertir un modelo base genérico en una herramienta útil para pipelines de extracción y clasificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (causal language model) |
| Parametros totales | 35.100.160 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (por defecto en GPT-2, típicamente 1024 tokens) |
| Tipos de cuantizacion | no especificado (pesos en safetensors, compatible con fp16/fp32) |
| Idiomas soportados | ruso (ru) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Bormokrut es una arquitectura transformer causal de tipo GPT-2, con aproximadamente 35 millones de parámetros. El modelo fue inicializado desde Bormotuha, un modelo base también de Vladniag, y posteriormente afinado mediante supervisión (SFT) usando la librería `trl` de Hugging Face. El entrenamiento se realizó sobre un dataset personalizado (etiquetado como `custom`) diseñado para dos tareas concretas: extracción de entidades, aspectos y preguntas a partir de un fragmento, y enrutamiento de una consulta hacia una lista fija de expertos (por ejemplo, biógrafo, matemático, médico, etc.). No se menciona el uso de RLHF ni DPO; el proceso es exclusivamente de ajuste fino supervisado.

El preprocesado del texto es peculiar: los espacios se sustituyen por el carácter `▁` y los saltos de línea por `<newline>`, lo que permite que el tokenizador GPT-2 maneje el formato estructurado de los prompts. La generación se detiene al encontrar el token `</result>`. No hay innovaciones arquitectónicas destacables más allá del ajuste dirigido; el interés reside en la especialización funcional sobre un modelo base pequeño.

## Capacidades

- Extracción de entidades: identifica la entidad principal mencionada en un fragmento (por ejemplo, "Перун" en el ejemplo de la documentación).
- Extracción de aspectos: genera una lista de aspectos relevantes relacionados con la entidad (p. ej., "боги; роль в мифологии; связь с другими божествами; социальная структура").
- Extracción de pregunta clave: formula una pregunta que resume el enfoque del fragmento.
- Enrutamiento a expertos: clasifica una consulta en una de las categorías predefinidas (biógrafo, científico, ingeniero, cibernético, matemático, humanista, médico, economista, crítico de arte, "жизнекачер", "смежник").
- Generación de texto en ruso: al ser un GPT-2, puede generar texto libre, aunque su especialización principal son las dos tareas anteriores.
- Soporte de formato estructurado: utiliza etiquetas XML y un protocolo de prompt específico para controlar la salida.
- No dispone de tool calling, funciones de agente, ni capacidades multimodales.

## Casos de uso

- Extracción de información en documentos históricos: dado un fragmento de un texto académico o crónica, el modelo puede extraer la entidad principal, los aspectos tratados y la pregunta clave, facilitando la indexación o el resumen automático de colecciones documentales en ruso.
- Clasificación de consultas en sistemas de atención al cliente: se puede integrar en un chatbot para enrutar una pregunta del usuario hacia el departamento o experto adecuado (médico, economista, técnico, etc.) usando el bloque `<subject>` con la lista de expertos.
- Preprocesamiento para pipelines de recuperación aumentada (RAG): antes de enviar un fragmento a un buscador o a un modelo generativo, Bormokrut puede extraer la entidad y la pregunta clave, mejorando la relevancia de las búsquedas posteriores.
- Análisis de foros o comentarios: para detectar el tema principal y los aspectos de discusión en textos cortos en ruso, útil en monitorización de redes sociales o moderación de contenidos.
- Generación de preguntas de estudio: a partir de un párrafo de un libro de texto, el modelo puede generar la pregunta central que el fragmento responde, ayudando en la creación de material educativo.
- Componente de enrutamiento en arquitecturas multiagente: cuando un sistema más grande necesita decidir qué subsistema especializado (médico, legal, técnico) debe procesar una consulta, Bormokrut puede actuar como selector rápido y ligero antes de invocar modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación (como MMLU, HumanEval o GSM8K) ni comparaciones con otros modelos. Se desconoce el rendimiento cuantitativo en tareas generales o específicas más allá de los ejemplos mostrados.

## Requisitos de hardware

- VRAM estimada: con 35,1 millones de parámetros, en fp16 ocupa aproximadamente 70 MB de memoria. En int8 o cuantizaciones inferiores, puede reducirse a unos 35-40 MB. En fp32, unos 140 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; incluso una GTX 1050 o una integrada moderna puede ejecutarlo. En CPU, el modelo es perfectamente utilizable con baja latencia.
- Compatibilidad con hardware de consumo: totalmente, cabe en cualquier PC, Raspberry Pi (con limitaciones) o incluso en dispositivos móviles si se convierte a formato TFLite o similar.
- Opciones de despliegue: al ser un modelo de la familia GPT-2, es compatible con la API de Transformers de Hugging Face, así como con servidores de inferencia como vLLM, TGI (Text Generation Inference) o llama.cpp (si se exporta a GGUF). También puede ejecutarse con ONNX Runtime.
- Latencia y throughput: no se han publicado mediciones oficiales, pero al ser un modelo pequeño, la generación de 256 tokens (el máximo usado en el ejemplo) debería completarse en menos de un segundo en una GPU moderna y en unos pocos segundos en CPU.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos. Como referencia, se puede comparar con su modelo base Bormotuha (misma arquitectura y autor, pero sin el afinamiento específico) y con otros GPT-2 pequeños en ruso, como `sberbank-ai/rugpt3small` (también ~35M parámetros) o `ai-forever/rugpt3small_based_on_gpt2`. Sin embargo, no hay datos de rendimiento comparativo disponibles en la información proporcionada, por lo que no es posible establecer una tabla objetiva. Se recomienda evaluar el modelo en las tareas específicas de extracción y enrutamiento para determinar su idoneidad frente a alternativas.

## Limitaciones y advertencias

- Especialización limitada: el modelo está entrenado únicamente para dos tareas (extracción y enrutamiento) y con un formato de prompt muy concreto. Fuera de estos patrones, su rendimiento como generador de texto general será pobre.
- Idioma único: solo funciona correctamente en ruso; no se ha entrenado para otros idiomas.
- Dependencia del formato de entrada: la salida esperada depende de que el prompt siga exactamente la estructura definida (etiquetas `<instruction>`, `<fragment>`, `<subject>`, `<result>`). Variaciones pueden producir respuestas inconsistentes.
- Posibles sesgos: al ser un modelo pequeño entrenado sobre un dataset personalizado, puede reflejar sesgos presentes en ese dataset. No hay información sobre su composición ni evaluación de sesgos.
- Riesgo de alucinación: aunque la tarea es extractiva, el modelo podría generar entidades o aspectos no presentes en el fragmento si la entrada es ambigua o fuera de dominio.
- Contexto limitado: al derivar de GPT-2, la longitud de contexto está limitada a unos 1024 tokens (no confirmado en la documentación). Para fragmentos largos, será necesario dividirlos.
- Sin soporte de tool calling ni agentes: no es adecuado para tareas que requieran interacción con herramientas externas o razonamiento multi-paso complejo.
- Mantenimiento y soporte: el modelo tiene cero descargas y cero likes, lo que sugiere que es un proyecto personal sin comunidad activa ni garantías de actualización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vladniag/Bormokrut
- Modelo base Bormotuha: https://huggingface.co/Vladniag/Bormotuha
- Perfil del autor: https://huggingface.co/Vladniag
