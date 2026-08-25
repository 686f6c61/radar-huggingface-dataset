# Taykhoom/mRNA-FM

## Resumen

mRNA-FM es un modelo de lenguaje preentrenado para ARN mensajero (mRNA), desarrollado por Taykhoom como un port a Hugging Face del modelo original RNA-FM de Chen et al. (2022). Se trata de un transformer codificador de estilo BERT con 12 capas, preentrenado mediante modelado de lenguaje enmascarado (MLM) a nivel de codón sobre 45 millones de secuencias codificantes (CDS) de RefSeq. Su principal innovación es la tokenización por codones (tripletes de nucleótidos), que permite capturar directamente la información de traducción de la secuencia.

El modelo resuelve el problema de obtener representaciones vectoriales densas de secuencias de mRNA para tareas de predicción de estructura y función, sin necesidad de etiquetas experimentales. Es relevante porque las regiones codificantes constituyen la mayor parte del transcriptoma y los modelos previos de ARN se centraban en ARN no codificante. Con 239 millones de parámetros y una ventana de 1022 codones (3066 nucleótidos), ofrece un equilibrio entre capacidad y coste computacional, y su licencia MIT permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer codificador estilo BERT (pre-LN, ESM-1b-style) |
| Parametros totales | 239.180.873 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1024 tokens (1022 codones + CLS/EOS) = 3066 nucleotidos |
| Tipos de cuantizacion | No disponible (pesos en fp32; compatible con cuantizacion estandar de Transformers) |
| Idiomas soportados | ARN (notacion RNA, U en lugar de T) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

mRNA-FM sigue la arquitectura de ESM-1b: un transformer codificador con normalizacion pre-atencion y pre-FFN (pre-LN), 12 capas, 20 cabezas de atencion, dimension de embedding 1280 y FFN oculto de 5120 con activacion GELU. El vocabulario consta de 73 tokens: tokens especiales (CLS, PAD, EOS, UNK, MASK) y 64 codones ARN estandar, mas 4 tokens de relleno nulo. La codificacion posicional es aprendida.

El preentrenamiento se realizo con modelado de lenguaje enmascarado a nivel de codon, con una tasa de enmascaramiento del 15%, sobre 45 millones de secuencias codificantes de mRNA de RefSeq. La tokenizacion divide la secuencia en codones consecutivos no solapados; cualquier nucleotido sobrante que no complete un codon se descarta silenciosamente. El modelo solo acepta secuencias cuya longitud sea multiplo de 3 y en notacion RNA (U, no T). El port a Hugging Face anade soporte para atencion SDPA y Flash Attention 2, que no estaban en la implementacion original. Se verifico la paridad de las representaciones ocultas con el checkpoint original, con diferencia maxima absoluta de 0.00 en los 13 niveles (embedding + 12 capas).

## Capacidades

- Generacion de embeddings de secuencias de mRNA: produce representaciones por token (cada codon) y una representacion global CLS de dimension 1280.
- Modelado de lenguaje enmascarado: puede predecir codones enmascarados en una secuencia, util para tareas de completado o correccion.
- Fine-tuning para tareas de clasificacion y regresion: la representacion CLS puede alimentar cabezales especificos para tareas como prediccion de estructura, estabilidad o localizacion subcelular.
- Procesamiento de secuencias con pista CDS: el metodo `batch_encode_with_cds` extrae automaticamente la region codificante, convierte T a U, segmenta en codones y codifica en una sola llamada.
- Extraccion de representaciones de capas intermedias: permite acceder a las 12 capas ocultas para analisis de atencion o representaciones a diferentes niveles de abstraccion.
- Soporte de atencion eficiente: implementa SDPA y Flash Attention 2, reduciendo el coste de memoria y acelerando la inferencia en GPUs modernas.

## Casos de uso

- Prediccion de estructura secundaria de ARN: las representaciones de mRNA-FM pueden alimentar modelos de prediccion de pares de bases, aprovechando la informacion contextual de la secuencia codificante.
- Identificacion de sitios de union a proteinas: los embeddings por codon pueden usarse como caracteristicas para clasificadores que detectan regiones de union a factores de union al ARN (RBP).
- Clasificacion de tipos de ARN mensajero: fine-tuning del token CLS para distinguir entre isoformas, transcritos con o sin retencion de intrones, o ARN mensajeros de diferentes familias genicas.
- Analisis de estabilidad y vida media del ARN: la representacion de la secuencia codificante puede correlacionarse con datos de degradacion del ARN para predecir la estabilidad del transcrito.
- Deteccion de variantes de empalme alternativo: al procesar secuencias con pista CDS, el modelo puede ayudar a identificar cambios en los limites exonicos y sus efectos en la traduccion.
- Diseno de secuencias de ARN para terapias: la capacidad de generar embeddings y completar codones enmascarados permite optimizar secuencias codificantes para vacunas de ARNm o terapias de reemplazo genico, maximizando la expresion y estabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de tareas downstream como prediccion de estructura, estabilidad o clasificacion funcional. La unica verificacion documentada es la paridad de representaciones con el checkpoint original, con diferencia maxima absoluta de 0.00 en los 13 niveles de representacion.

## Requisitos de hardware

- VRAM estimada para inferencia: con 239 millones de parametros, el modelo en fp32 ocupa aproximadamente 956 MB; en fp16 unos 478 MB; en int8 unos 239 MB. La inferencia en lotes pequenos cabe en GPUs consumer con 4 GB o mas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 3060) para inferencia en fp16. Para fine-tuning con lotes mayores se recomienda 8 GB o mas (RTX 3070, RTX 4080, A100).
- Compatibilidad con consumer GPU: si, gracias a su tamano moderado y al soporte de SDPA y Flash Attention 2, puede ejecutarse en GPUs de gama media.
- Opciones de despliegue: al ser un modelo de Transformers, puede servirse con vLLM, TGI, o mediante la API de Hugging Face. Para inferencia local, tambien es compatible con llama.cpp si se convierte a GGUF, aunque no se proporciona un archivo GGUF precompilado.
- Latencia y throughput: no hay datos oficiales. Como referencia orientativa, un modelo de 239M parametros en una RTX 3060 puede procesar cientos de secuencias por segundo en inferencia por lotes, pero estos valores dependen de la longitud de las secuencias y de la implementacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokenizacion | Datos de entrenamiento | Licencia |
|---|---|---|---|---|---|
| mRNA-FM (este modelo) | 239 M | 1022 codones (3066 nt) | Codones (3-mer) | 45 M CDS de RefSeq | MIT |
| RNA-FM (Taykhoom/RNA-FM) | 23,7 M (estimado) | 1024 tokens | Caracteres (nucleotidos) | 23,7 M ncRNA | MIT |
| RNA-FM original (ml4bio) | 23,7 M (estimado) | 1024 tokens | Caracteres | 23,7 M ncRNA | MIT (codigo) |

La comparativa se limita a la familia RNA-FM porque no se dispone de datos de otros modelos de ARN en la informacion proporcionada. mRNA-FM se diferencia de RNA-FM por su tokenizacion por codones, su mayor dimension de embedding (1280 frente a 640) y su enfoque en secuencias codificantes, mientras que RNA-FM se entrena con ARN no codificante y tokenizacion por caracteres.

## Limitaciones y advertencias

- Solo acepta secuencias de ARN en notacion U (no T) y con longitud multiplo de 3; cualquier nucleotido sobrante se descarta silenciosamente, lo que puede perder informacion en secuencias incompletas.
- La ventana de contexto esta limitada a 3066 nucleotidos, insuficiente para transcritos largos completos; para secuencias mayores es necesario segmentar.
- Entrenado exclusivamente con secuencias codificantes de RefSeq, por lo que su capacidad de generalizacion a ARN no codificante, ARN viral o secuencias con errores de secuenciacion puede ser limitada.
- No se han publicado benchmarks de rendimiento en tareas downstream, por lo que su eficacia real en aplicaciones concretas no esta validada.
- El port a Hugging Face requiere `trust_remote_code=True` para cargar el tokenizador y el modelo, lo que implica ejecutar codigo remoto y debe evaluarse en entornos de produccion.
- Aunque la licencia es MIT, el modelo original se publico bajo una licencia de investigacion; se recomienda verificar los terminos del checkpoint original antes de un uso comercial extensivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Taykhoom/mRNA-FM
- Coleccion RNA-FM: https://huggingface.co/collections/Taykhoom/rna-fm
- Repositorio oficial RNA-FM (GitHub): https://github.com/ml4bio/RNA-FM
- Paper original (arXiv): https://arxiv.org/abs/2204.00300
- Implementacion no oficial en multimolecule: https://github.com/DLS5-Omics/multimolecule/blob/master/multimolecule/models/rnafm/README.mrnafm.md
