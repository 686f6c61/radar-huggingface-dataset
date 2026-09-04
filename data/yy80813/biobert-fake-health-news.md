# YY80813/biobert-fake-health-news

## Resumen

YY80813/biobert-fake-health-news es un modelo de clasificación de texto basado en BERT, desarrollado por el usuario YY80813, que tiene como objetivo detectar noticias falsas relacionadas con la salud. El modelo es un ajuste fino (fine-tuning) de BioBERT, un modelo de lenguaje biomédico preentrenado sobre la literatura de PubMed, lo que lo hace especialmente adecuado para comprender terminología médica y textos científicos. Con 108,3 millones de parámetros, se trata de un modelo de tamaño base (BERT-base) optimizado para la tarea de clasificación binaria de textos, probablemente para distinguir entre noticias de salud veraces y falsas.

La relevancia de este modelo radica en el creciente problema de la desinformación sanitaria, especialmente en entornos digitales donde circulan bulos sobre tratamientos, vacunas o enfermedades. Aunque la información pública disponible sobre su entrenamiento es muy limitada, su arquitectura basada en BioBERT sugiere que puede capturar matices del lenguaje biomédico que los modelos generalistas podrían pasar por alto. El modelo está publicado en Hugging Face con el pipeline text-classification y formato de pesos safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-base (encoder-only transformer) |
| Parametros totales | 108.311.810 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens (estandar de BERT) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-only basado en la arquitectura BERT, concretamente una variante de BioBERT, que fue preentrenada sobre el corpus de PubMed (abstracts y textos completos de articulos biomedicos). Esto le otorga una base de conocimiento especializada en el dominio de la salud y la biomedicina. El ajuste fino se ha realizado para la tarea de clasificacion de texto, con el objetivo de identificar noticias falsas de salud. No se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens utilizados, la composicion de los datos ni si se aplicaron tecnicas de alineacion como RLHF o DPO, ya que al tratarse de un modelo discriminativo no suelen aplicarse. Tampoco se documentan innovaciones tecnicas destacables: es un fine-tuning estandar sobre una arquitectura ya existente.

## Capacidades

- Clasificacion binaria de textos: el modelo esta disenado para distinguir entre noticias de salud veraces y falsas.
- Comprension de lenguaje biomedico: gracias a su base en BioBERT, puede procesar terminologia medica, nombres de farmacos, enfermedades y conceptos cientificos.
- Inferencia de embeddings: el tag text-embeddings-inference sugiere compatibilidad con la extraccion de representaciones vectoriales de textos.
- Sin capacidades de generacion: no es un modelo generativo; no produce texto nuevo ni admite tool calling, agentes ni razonamiento multi-paso.
- Multilingue: no disponible; dado que BioBERT se preentreno mayoritariamente en ingles, es probable que el modelo funcione mejor en ese idioma.

## Casos de uso

- Verificacion de articulos en portales de salud: el modelo puede integrarse en el backend de un sitio web de divulgacion medica para marcar automaticamente contenidos sospechosos antes de su publicacion, aprovechando su comprension del lenguaje biomedico.
- Filtrado de desinformacion en redes sociales: una plataforma puede usarlo para analizar en tiempo real publicaciones sobre salud y alertar a los moderadores sobre posibles bulos, gracias a su baja latencia de inferencia.
- Apoyo a fact-checkers profesionales: organizaciones de verificacion pueden emplearlo como herramienta de triaje, clasificando rapidamente los textos que requieren revision manual y reduciendo la carga de trabajo.
- Monitorizacion de publicaciones cientificas: en el ambito academico, puede ayudar a detectar resumenes o articulos con afirmaciones potencialmente fraudulentas o no respaldadas por evidencia.
- Analisis de comentarios en foros de salud: comunidades online sobre enfermedades pueden usarlo para identificar mensajes con informacion peligrosa o erronea, como remedios caseros nocivos.
- Sistemas de alerta temprana de brotes: agencias de salud publica pueden monitorizar noticias y redes sociales para detectar rapidamente la propagacion de bulos vinculados a brotes epidemicos.
- Integracion en aplicaciones de mensajeria: chatbots o asistentes de salud pueden emplear el modelo para clasificar enlaces compartidos por usuarios y advertir sobre contenido no fiable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre metricas como exactitud, F1, precision o recall en conjuntos de evaluacion como MMLU, HumanEval o GSM8K. El modelo tampoco incluye comparativas con otros sistemas de deteccion de noticias falsas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP32 y 0,25 GB en FP16 para el modelo completo, mas overhead de las capas de atencion y tokenizacion. En la practica, se recomienda un minimo de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU de consumo con 2 GB o mas de VRAM, como una NVIDIA T4, RTX 3060 o similar, es suficiente. No requiere GPUs de centro de datos.
- Compatibilidad con consumer GPUs: si, el modelo es muy ligero y se ejecuta sin problemas en hardware domestico.
- Opciones de despliegue: puede servirse mediante Hugging Face Inference API, text-embeddings-inference, o con pipelines de transformers en Python. Tambien es compatible con entornos como FastAPI o Flask para servicios a medida.
- Latencia y throughput: al ser un modelo de 108 millones de parametros, la inferencia en GPU para secuencias cortas (menos de 256 tokens) es tipicamente inferior a 50 ms, con throughput de cientos de peticiones por segundo en un solo GPU. En CPU, la latencia puede ser de 100-300 ms por texto.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YY80813/biobert-fake-health-news | BERT-base (BioBERT) | 108,3 M | 512 | No disponible | Hugging Face |
| YY80813/pubmedbert-fake-health-news | BERT-base (PubMedBERT) | 108,3 M | 512 | No disponible | Hugging Face |
| BioBERT original (dmis-lab/biobert-v1.1) | BERT-base | 110 M | 512 | MIT | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos. El modelo relacionado del mismo autor, YY80813/pubmedbert-fake-health-news, parece ser una variante basada en PubMedBERT, otro modelo biomedico preentrenado.

## Limitaciones y advertencias

- Ausencia de documentacion de entrenamiento: no se conocen los datos de entrenamiento, el proceso de ajuste ni las metricas de evaluacion, lo que limita la confianza en el modelo para entornos de produccion.
- Licencia no especificada: al no haber una licencia explicita, el uso comercial es legalmente incierto y requiere contacto con el autor.
- Sesgos no documentados: no se han evaluado ni reportado sesgos potenciales, por ejemplo, relacionados con genero, raza o contexto geografico en las noticias de salud.
- Limitacion de contexto: la ventana de 512 tokens impide analizar documentos largos de una sola vez, como informes medicos extensos o articulos cientificos completos.
- Riesgo de alucinacion: no aplica directamente al ser un clasificador, pero si se usa para generar explicaciones o resumenes, sus salidas no son fiables.
- Sin mantenimiento aparente: el modelo tiene 0 descargas y 0 likes, y no se observan actualizaciones ni soporte activo, lo que sugiere que puede estar abandonado.
- Dependencia del idioma: al estar basado en BioBERT, es probable que su rendimiento se degrade notablemente en idiomas distintos del ingles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YY80813/biobert-fake-health-news
- Modelo relacionado: https://huggingface.co/YY80813/pubmedbert-fake-health-news
- Perfil de GitHub del autor: https://github.com/YY80813
- Paper de BioBERT (arxiv:1910.09700): https://arxiv.org/abs/1910.09700
