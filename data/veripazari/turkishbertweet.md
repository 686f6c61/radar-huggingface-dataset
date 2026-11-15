# veripazari/TurkishBERTweet

## Resumen

TurkishBERTweet es un modelo de lenguaje basado en la arquitectura RoBERTa (BERT encoder) especializado en el análisis de texto de redes sociales en turco. Fue desarrollado originalmente por el laboratorio VRLLab y esta versión concreta ha sido archivada por VeriPazari, una plataforma turca, manteniendo la documentación original. El modelo resuelve el problema del procesamiento de lenguaje natural sobre texto informal de Twitter en turco, un dominio donde los modelos multilingües genéricos rinden peor debido a la jerga, abreviaturas, emojis y errores ortográficos propios de las redes sociales.

Con 163 millones de parámetros y una longitud máxima de secuencia de 128 tokens, TurkishBERTweet se posiciona como un encoder compacto orientado a tareas de clasificación y extracción de características (embeddings), no como un modelo generativo. Su entrenamiento se realizó sobre 894 millones de tweets en turco sin distinción de mayúsculas y minúsculas, lo que lo hace especialmente adecuado para tareas de análisis de sentimiento, detección de discurso de odio y otras tareas de clasificación sobre texto social.

Es relevante ahora porque el ecosistema de modelos específicos para turco en redes sociales es limitado, y este modelo ofrece una alternativa ligera (1,3 GB en el repositorio) que puede ejecutarse en hardware modesto. La licencia MIT facilita su uso comercial, aunque el modelo base no incluye capacidades generativas ni de razonamiento complejo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (transformer encoder, base) |
| Parametros totales | 163M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | no disponible (pesos en FP32/FP16 estándar; no se documentan GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | turco (monolingüe) |
| Licencia | MIT |
| Formato de pesos | safetensors / PyTorch (repo de 1,3 GB) |

## Arquitectura y entrenamiento

TurkishBERTweet sigue la arquitectura RoBERTa base, un transformer encoder con 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, totalizando 163 millones de parámetros. No es un modelo generativo ni utiliza mecanismos de atención lineal, mezcla de expertos (MoE) o decodificación especulativa; es un encoder bidireccional diseñado para producir representaciones contextuales de tokens y secuencias.

El preentrenamiento se realizó sobre 894 millones de tweets en turco, sin distinción de mayúsculas y minúsculas (uncased), lo que refleja el registro informal de las redes sociales. La model card no detalla el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables a un encoder de este tipo). El modelo incluye un preprocesador específico para Twitter que normaliza emojis, hashtags y URLs, y se distribuyen adaptadores LoRA para tareas concretas de clasificación de sentimiento y detección de discurso de odio, entrenados sobre 42.476 y 4.683 tweets respectivamente.

## Capacidades

- Generación de embeddings contextuales para texto en turco, útiles para extracción de características y búsqueda semántica.
- Clasificación de sentimiento (positivo, negativo, neutro) mediante el adaptador LoRA `TurkishBERTweet-Lora-SA`.
- Detección de discurso de odio (sí/no) mediante el adaptador LoRA `TurkishBERTweet-Lora-HS`.
- Preprocesamiento específico de texto de Twitter: normalización de emojis (con descripción textual), hashtags y URLs.
- No soporta generación de texto, razonamiento multi-paso, tool calling ni function calling.
- No dispone de capacidades multimodales (visión, audio) ni modo de pensamiento (thinking mode).
- Soporte monolingüe: únicamente turco.

## Casos de uso

- Análisis de sentimiento en redes sociales: el modelo, con el adaptador LoRA-SA, clasifica tweets en positivo, negativo o neutro; su entrenamiento sobre 894M de tweets lo hace robusto ante jerga y abreviaturas turcas.
- Moderación de contenido y detección de discurso de odio: el adaptador LoRA-HS permite filtrar comentarios ofensivos en plataformas turcas, con un F1 de 0,831 en test según la model card.
- Extracción de características para clustering de temas: los embeddings del modelo base pueden alimentar pipelines de agrupación de tweets o análisis de tendencias sin necesidad de fine-tuning adicional.
- Análisis de opinión de marca: procesar menciones y comentarios de usuarios en Twitter para medir percepción de producto, aprovechando el preprocesador que normaliza emojis y hashtags.
- Investigación en ciencias sociales: clasificación a gran escala de discurso público en turco (política, salud, eventos) con un modelo ligero que cabe en una GPU consumer.
- Sistemas de recomendación basados en contenido: usar los embeddings de tweets para calcular similitud semántica y sugerir contenido relacionado en turco.
- Detección de spam o cuentas maliciosas: combinar los embeddings con un clasificador ligero para identificar patrones de texto sospechosos en turco.

## Benchmarks y rendimiento

La model card incluye resultados de los adaptadores LoRA, pero no benchmarks estándar como MMLU, HumanEval o GSM8K (no aplicables a un encoder de clasificación). Los datos disponibles son:

| Adaptador | F1 train | F1 dev | F1 test | Tamano del dataset |
|---|---|---|---|---|
| TurkishBERTweet-Lora-SA (sentimiento) | 0,799 | 0,687 | 0,692 | 42.476 tweets |
| TurkishBERTweet-Lora-HS (discurso de odio) | 0,915 | 0,796 | 0,831 | 4.683 tweets |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7-1,5 GB en FP32 para el modelo base (163M parámetros); en FP16, alrededor de 0,4 GB. Los adaptadores LoRA añaden un consumo mínimo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tarjetas como NVIDIA GTX 1650, RTX 3060, RTX 4090 o A100 pueden ejecutarlo sin problemas.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna (incluso integradas con suficiente memoria compartida).
- Opciones de despliegue: transformers (PyTorch), con soporte para PEFT (LoRA). No se documentan opciones como vLLM, llama.cpp u Ollama, ya que no es un modelo generativo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; al ser un encoder pequeño, la inferencia por secuencia es del orden de milisegundos en GPU moderna, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| TurkishBERTweet (este) | 163M | 128 | Turco | MIT | Encoder para redes sociales |
| BERTurk (dbmdz) | 110M (base) | 512 | Turco | MIT | BERT general turco |
| XLM-RoBERTa base | 278M | 512 | 100 idiomas | MIT | Multilingüe general |
| TurkishBERTweet original (VRLLab) | 163M | 128 | Turco | MIT | Mismo modelo, fuente original |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Modelo exclusivamente encoder: no genera texto ni mantiene conversaciones; su uso se limita a embeddings y clasificación.
- Longitud de contexto muy limitada (128 tokens), insuficiente para documentos largos o hilos de conversación extensos.
- Entrenado únicamente con tweets turcos: puede tener sesgos hacia el registro informal y no generalizar bien a texto formal (literario, técnico, legal).
- Riesgo de sesgos sociales y demográficos presentes en los 894M de tweets de entrenamiento (por ejemplo, sesgos de género, políticos o regionales).
- Los adaptadores LoRA tienen rendimiento variable: el F1 en test para sentimiento es 0,692, lo que indica margen de error considerable en producción.
- Aunque la licencia es MIT, el modelo original fue desarrollado por VRLLab; esta versión es un archivo de VeriPazari. Se recomienda verificar la procedencia y los términos de la fuente original.
- No se documentan mecanismos de mitigación de alucinación (no aplicable a clasificación, pero sí a posibles errores de etiquetado).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validación comunitaria en esta copia concreta.

## Enlaces

- [Hugging Face: veripazari/TurkishBERTweet](https://huggingface.co/veripazari/TurkishBERTweet)
- [Modelo original: VRLLab/TurkishBERTweet](https://huggingface.co/VRLLab/TurkishBERTweet)
- [Adaptador LoRA sentimiento: VRLLab/TurkishBERTweet-Lora-SA](https://huggingface.co/VRLLab/TurkishBERTweet-Lora-SA)
- [Adaptador LoRA discurso de odio: VRLLab/TurkishBERTweet-Lora-HS](https://huggingface.co/VRLLab/TurkishBERTweet-Lora-HS)
- [Repositorio GitHub: ViralLab/TurkishBERTweet](https://github.com/ViralLab/TurkishBERTweet)
- [Paper (arXiv:2311.18063)](https://arxiv.org/abs/2311.18063)
- [Plataforma VeriPazari](https://veripazari.com.tr)
