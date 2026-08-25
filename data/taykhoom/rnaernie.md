# Taykhoom/RNAErnie

## Resumen

RNAErnie es un modelo de lenguaje especializado en ARN (ácido ribonucleico) basado en la arquitectura BERT, desarrollado por Wang et al. y publicado en Nature Machine Intelligence en 2024. El modelo se entrena sobre secuencias de RNACentral con una estrategia de enmascaramiento consciente de motivos (motif-aware masking) y un ajuste fino guiado por tipos (type-guided fine-tuning), lo que le permite capturar tanto información de secuencia como de contexto funcional de ARN no codificante. El port a HuggingFace, realizado por Taykhoom, convierte los pesos originales de PaddlePaddle a PyTorch y añade soporte para SDPA y Flash Attention 2.

El modelo resuelve el problema de obtener representaciones vectoriales densas de secuencias de ARN que puedan usarse en tareas posteriores como clasificación de ncRNA, predicción de estructura secundaria o detección de motivos funcionales. Su relevancia actual radica en que es uno de los pocos modelos de lenguaje preentrenados específicamente para ARN con una estrategia de entrenamiento que combina información de motivos conservados y etiquetas de tipo, lo que mejora el rendimiento frente a modelos genéricos de ADN o ARN sin esa guía. Con 86,7 millones de parámetros y una ventana de contexto de 512 tokens, es un modelo ligero y fácil de desplegar en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Post-LN BERT / ERNIE (Transformer encoder) |
| Parametros totales | 86.694.222 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 512 tokens (incluyendo tokens especiales) |
| Tipos de cuantizacion | no disponible (solo pesos en fp32/fp16 en safetensors) |
| Idiomas soportados | no disponible (modelo de secuencias biologicas, no idiomas humanos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con codigo personalizado en transformers) |

## Arquitectura y entrenamiento

RNAErnie sigue la arquitectura BERT original con normalización Post-LN: 12 capas transformer, 12 cabezas de atencion, dimension de embedding 768 y FFN oculto de 3072 con activacion ReLU. El vocabulario es de 39 tokens: 7 tokens especiales (`[PAD]`, `[UNK]`, `[CLS]`, `[SEP]`, `[MASK]`, `[DEL]`, `[IND]`), 28 etiquetas de tipo de ARN no codificante (miRNA, lncRNA, tRNA, etc.) y 4 nucleotidos (`A`, `T`, `C`, `G`). Una particularidad es que la entrada con uracilo (U) se convierte silenciosamente a timina (T), siguiendo la notacion de ADN usada en el preentrenamiento original.

El preentrenamiento se realizo con el objetivo de modelado de lenguaje enmascarado (MLM) sobre secuencias de RNACentral de longitud menor o igual a 512 nucleotidos, empleando una estrategia de enmascaramiento consciente de motivos que combina mascaras a nivel de base, subsecuencia y motivo. El checkpoint publicado corresponde a la variante `BERT,ERNIE,MOTIF,PROMPT` descrita en el articulo. La conversion a PyTorch se verifico comparando los estados ocultos con una referencia independiente que implementa el forward pass de PaddlePaddle directamente desde los pesos `.pdparams`, obteniendo una diferencia maxima absoluta inferior a 7e-6 en los 13 niveles de representacion.

## Capacidades

- Generacion de embeddings contextuales de secuencias de ARN: produce representaciones de 768 dimensiones por token y una representacion CLS para la secuencia completa.
- Modelado de lenguaje enmascarado (fill-mask): puede predecir nucleotidos enmascarados en una secuencia, util para tareas de imputacion o correccion.
- Ajuste fino guiado por tipo: permite anteponer una etiqueta de tipo ncRNA (p. ej., `miRNA`, `lncRNA`) a la secuencia de entrada para condicionar el aprendizaje en tareas posteriores.
- Soporte de atencion eficiente: implementa `attn_implementation="sdpa"` y `attn_implementation="flash_attention_2"`, no disponibles en el codigo original de PaddlePaddle.
- Extraccion de representaciones de capas intermedias: se puede acceder a los estados ocultos de cualquier capa (por ejemplo, capa 6) para analisis de caracteristicas.
- Tokenizacion especializada: vocabulario reducido de 39 tokens que incluye etiquetas biologicas, lo que reduce el coste computacional frente a vocabularios de ADN genericos.

## Casos de uso

- Clasificacion de ARN no codificante: dado un transcrito, se puede usar el embedding CLS como entrada a un clasificador para predecir su tipo (miRNA, lncRNA, snoRNA, etc.). El modelo es adecuado porque las etiquetas de tipo estan integradas en el vocabulario y el preentrenamiento con guia de tipo mejora la discriminacion.
- Prediccion de estructura secundaria de ARN: los embeddings por token pueden alimentar modelos de prediccion de pares de bases o bucles. La ventana de 512 nucleotidos cubre la mayoria de ARN funcionales conocidos.
- Deteccion de motivos funcionales conservados: el enmascaramiento consciente de motivos del preentrenamiento hace que el modelo sea sensible a patrones de secuencia relevantes, permitiendo identificar regiones funcionales en ARN no anotados.
- Transfer learning para tareas de ARN con pocos datos: al ser un modelo preentrenado, se puede ajustar fino con pocas muestras etiquetadas para tareas especificas como prediccion de sitios de union a proteinas o modificaciones post-transcripcionales.
- Analisis de variantes de secuencia: se pueden comparar los embeddings de secuencias wild-type y mutantes para evaluar el impacto funcional de sustituciones, inserciones o deleciones.
- Imputacion de secuencias incompletas: usando la tarea de MLM, el modelo puede rellenar nucleotidos faltantes en secuencias parciales, lo que resulta util en ensamblaje de lecturas cortas o curado de bases de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas comparativas (como MMLU, HumanEval o equivalentes biologicos) y el articulo original de Nature Machine Intelligence no se ha podido consultar en detalle desde los resultados de busqueda. Se recomienda consultar la publicacion original para datos de evaluacion en tareas biologicas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 350 MB en fp32 (86,7 M parametros × 4 bytes) y 175 MB en fp16. Con cuantizacion a int8 (no oficialmente soportada, pero posible con herramientas externas) se reduciria a unos 90 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Modelos como NVIDIA GTX 1050 Ti, RTX 2060 o superiores funcionan sin problemas. Tambien es viable en CPU para inferencia de lotes pequenos.
- Cabe en GPU de consumo: si, incluso en las mas modestas. No requiere hardware de datacenter.
- Opciones de despliegue: al ser un modelo de transformers con codigo personalizado, se puede servir con Hugging Face Inference Endpoints, o mediante frameworks compatibles como vLLM (si se adapta el codigo) o simplemente con la API de transformers en un servidor Python. No hay soporte nativo para llama.cpp u Ollama al no existir version GGUF publicada.
- Latencia y throughput estimados: para una secuencia de 512 tokens en una GPU RTX 3090, la inferencia de un solo paso deberia completarse en menos de 10 ms. En CPU, puede tardar entre 50 y 200 ms segun el hardware. No se dispone de mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RNAErnie (este) | 86,7 M | 512 | RNACentral, motif-aware + type-guided | Apache 2.0 | HuggingFace (safetensors) |
| RNAErnie2 | no disponible | 2048 | RNACentral v22 (~31M seqs) | Apache 2.0 (presumible) | HuggingFace (coleccion Taykhoom) |
| DNABERT (referencia generica) | ~110 M | 512 | Genoma humano, k-mer | MIT | HuggingFace |

La comparativa con DNABERT es orientativa: ambos son modelos BERT de tamano similar, pero DNABERT se entrena sobre ADN con vocabulario de k-mers, mientras que RNAErnie usa nucleotidos individuales y etiquetas de tipo ncRNA. RNAErnie2, el retrain en PyTorch, amplia el contexto a 2048 tokens y se entrena con mas datos, lo que probablemente mejore el rendimiento en secuencias largas, aunque no se dispone de benchmarks comparativos publicos.

## Limitaciones y advertencias

- Ventana de contexto limitada a 512 tokens: no es adecuado para ARN largos (por ejemplo, ARN mensajeros completos) sin estrategias de ventana deslizante o truncamiento.
- Vocabulario restringido a 4 nucleotidos y 28 tipos de ncRNA: no modela modificaciones quimicas (como pseudouridina o m6A) ni otras entidades biologicas.
- Conversion U a T: el modelo trata el uracilo como timina, lo que puede ser una limitacion conceptual para aplicaciones donde la distincion U/T sea relevante (aunque en ARN solo existe U, la notacion es una eleccion de implementacion).
- Sesgo de datos: el preentrenamiento se realizo sobre RNACentral, que esta sesgado hacia ARN bien anotados y de organismos modelo; secuencias de organismos poco estudiados pueden tener representaciones menos precisas.
- Riesgo de alucinacion en tareas de generacion: aunque el modelo no esta disenado para generar secuencias completas, en tareas de fill-mask puede predecir nucleotidos plausibles pero biologicamente incorrectos.
- Codigo personalizado: requiere `trust_remote_code=True` en transformers, lo que implica ejecutar codigo del repositorio remoto; se recomienda auditar el codigo antes de usarlo en entornos de produccion.
- Sin cuantizaciones oficiales: no se proporcionan versiones GGUF, ONNX o TensorRT, lo que limita el despliegue en entornos de inferencia optimizada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Taykhoom/RNAErnie
- Coleccion RNAErnie: https://huggingface.co/collections/Taykhoom/rnaernie-6a219927c11fdcccedb243db
- Repositorio oficial (GitHub): https://github.com/CatIIIIIIII/RNAErnie
- Articulo en Nature Machine Intelligence: https://www.nature.com/articles/s42256-024-00836-4
- PDF del articulo: https://www.nature.com/articles/s42256-024-00836-4.pdf
