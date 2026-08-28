# Thiago-Reis-Porto/modernJabuticaBERT-Base-8k

## Resumen

modernJabuticaBERT-Base-8k es un modelo de tipo encoder transformer basado en la arquitectura ModernBERT, desarrollado por Thiago-Reis-Porto y vinculado a la colección JabuticaBERT de la organización amadeusai. Su objetivo es proporcionar representaciones contextuales de alta calidad para el portugués, entrenado desde cero (from scratch) con técnicas modernas como masked language modeling (MLM) y replaced token detection (RTD), además de un entrenamiento específico para contextos largos. El modelo cuenta con aproximadamente 149 millones de parámetros y una ventana de contexto de 8.192 tokens, según indica su nombre, lo que lo hace adecuado para tareas que requieren comprender documentos extensos en portugués.

La relevancia de este modelo radica en que la mayoría de los encoders multilingües están dominados por el inglés, y las alternativas específicas para portugués suelen basarse en arquitecturas más antiguas. modernJabuticaBERT-Base-8k aprovecha las mejoras de eficiencia de ModernBERT, como atención con Flash Attention y tokenización optimizada, para ofrecer un encoder competitivo y adaptado al portugués. Aunque la model card publicada en Hugging Face está prácticamente vacía, la documentación externa (paper en ACL Anthology) confirma los detalles de entrenamiento y la motivación del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parametros totales | 149.014.272 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 (indicado por el nombre del modelo, no verificado en la documentacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | portugues (segun la documentacion externa de la coleccion JabuticaBERT) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ModernBERT, una evolucion de BERT que incorpora mejoras como atencion con Flash Attention, normalizacion por capas pre-post, y una tokenizacion mas eficiente. Segun el paper "JabuticaBERT: Modern Portuguese Encoders from Scratch" (ACL Anthology 2026), el entrenamiento se realizo desde cero con dos objetivos: masked language modeling (MLM) y replaced token detection (RTD), similar a ELECTRA. La fase de entrenamiento base utilizo secuencias de 1024 tokens, y posteriormente se aplico un entrenamiento adicional para contextos largos (de ahi el sufijo "8k" en el nombre). El entrenamiento se llevo a cabo con precision mixta bf16, el optimizador StableAdamW y un programa de calentamiento-estable-decaimiento (Warmup-Stable-Decay), empleando ademas sequence packing para aprovechar al maximo los datos. No se dispone de informacion detallada sobre el dataset utilizado ni sobre el numero total de tokens de entrenamiento.

## Capacidades

- Extraccion de caracteristicas (feature extraction) para representaciones contextuales de texto en portugues.
- Comprension de lenguaje natural: el modelo puede ser fine-tuneado para tareas como clasificacion de textos, analisis de sentimiento, reconocimiento de entidades nombradas (NER) y respuesta a preguntas.
- Soporte de contexto largo: gracias a su ventana de 8.192 tokens, puede procesar documentos extensos, como articulos, informes o contratos, en una sola pasada.
- Entrenamiento desde cero para portugues: no depende de pesos inicializados en ingles, lo que puede mejorar la representacion de fenomenos linguisticos propios del portugues.
- Compatible con el ecosistema transformers y con text-embeddings-inference, lo que facilita su despliegue en entornos de produccion.

No se ha documentado soporte para tool calling, agentes, generacion de texto ni capacidades multimodales, ya que se trata de un modelo encoder puro.

## Casos de uso

- Clasificacion de documentos legales en portugues: el modelo puede fine-tunearse para categorizar contratos, sentencias o escrituras, aprovechando su contexto largo para procesar documentos completos sin truncar informacion relevante.
- Analisis de sentimiento en redes sociales y opiniones de clientes: al estar entrenado desde cero en portugues, captura mejor expresiones coloquiales y variantes regionales que un modelo multilingue generico.
- Busqueda semantica y recuperacion de informacion: las representaciones generadas pueden indexarse en bases vectoriales para construir sistemas de busqueda por similitud en corpus portugueses, como bibliotecas digitales o archivos periodisticos.
- Reconocimiento de entidades nombradas (NER) en textos clinicos o financieros: el fine-tuning con datos etiquetados permite extraer entidades como medicamentos, organizaciones o valores monetarios con mayor precision que modelos entrenados principalmente en ingles.
- Sistemas de recomendacion basados en contenido: al convertir descripciones de productos o articulos en vectores, se pueden calcular similitudes para sugerir items relacionados en portales de comercio electronico o plataformas de contenido.
- Preprocesamiento para pipelines de NLP: como encoder, puede servir como capa de representacion en arquitecturas mas complejas, por ejemplo para generar embeddings de frases que alimenten modelos de clasificacion o clustering.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de Hugging Face no incluye metricas, y el paper de ACL Anthology no ha sido accesible en su totalidad para extraer tablas de evaluacion. Por tanto, no es posible comparar numericamente este modelo con alternativas como BERTimbau o multilingual BERT.

## Requisitos de hardware

- VRAM estimada para inferencia: con 149 millones de parametros y pesos en fp32 (aproximadamente 0,6 GB), la inferencia puede ejecutarse en GPUs con 4 GB de VRAM o menos. Con cuantizacion a int8, el requisito baja a unos 0,3 GB.
- GPU recomendadas: cualquier GPU consumer moderna, como una NVIDIA GTX 1060 6GB o superior, es suficiente para inferencia. Para fine-tuning, se recomienda al menos 8 GB de VRAM (por ejemplo, RTX 2070, RTX 3060, RTX 4060).
- Cabe en GPU consumer: si, sin problema.
- Opciones de despliegue: al ser un modelo de la familia transformers, puede servirse con las librerias estandar (pipeline de transformers), con text-embeddings-inference (como indica la etiqueta del modelo), o con herramientas como ONNX Runtime para optimizacion.
- Latencia y throughput: no se dispone de datos medidos. Dado el tamano del modelo, se espera una latencia de pocos milisegundos por secuencia en GPU moderna, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| modernJabuticaBERT-Base-8k | 149M | 8.192 | portugues | no disponible | Hugging Face |
| BERTimbau-base | 110M | 512 | portugues | MIT | Hugging Face |
| multilingual BERT (mBERT) | 179M | 512 | multilingue (104 idiomas) | Apache 2.0 | Hugging Face |
| XLM-RoBERTa-base | 279M | 512 | multilingue (100 idiomas) | MIT | Hugging Face |

La principal ventaja de modernJabuticaBERT-Base-8k frente a BERTimbau es su contexto mucho mas largo (8k frente a 512) y su arquitectura ModernBERT, que ofrece mejor eficiencia. Frente a mBERT y XLM-R, su ventaja es estar especializado en portugues, lo que puede traducirse en mejores representaciones para este idioma, aunque no hay benchmarks que lo confirmen. La falta de licencia explicita es una desventaja para uso comercial.

## Limitaciones y advertencias

- La model card es una plantilla automatica sin informacion real: no se documentan sesgos, riesgos ni limitaciones especificas. Esto dificulta evaluar su idoneidad para aplicaciones sensibles.
- Licencia no disponible: no se puede determinar si el modelo puede usarse comercialmente o con restricciones. Se recomienda contactar con el autor antes de cualquier uso en produccion.
- Idioma limitado al portugues: no es adecuado para tareas multilingues o en otros idiomas.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su rendimiento frente a alternativas establecidas.
- Riesgo de alucinacion: al ser un encoder, no genera texto, por lo que el riesgo de alucinacion es bajo, pero las representaciones pueden estar sesgadas si los datos de entrenamiento contienen sesgos sociales o culturales.
- Fecha de creacion futura (2026): el modelo fue subido al Hub con fecha de agosto de 2026, lo que podria indicar un error en el reloj del sistema o un proyecto muy reciente. No afecta al funcionamiento, pero conviene tenerlo en cuenta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thiago-Reis-Porto/modernJabuticaBERT-Base-8k
- Coleccion JabuticaBERT (amadeusai): https://huggingface.co/collections/amadeusai/jabuticabert
- Paper "JabuticaBERT: Modern Portuguese Encoders from Scratch" (PDF): https://aclanthology.org/2026.propor-1.93.pdf
- Repositorio del autor (TP Playground): https://www.thiagoporto.com/tplay/
