# Taykhoom/GB.RNA-25M-MARS

## Resumen

GB.RNA-25M-MARS es un modelo de lenguaje de secuencias de ARN de 25,2 millones de parámetros (25.243.168 exactos, según los pesos en safetensors) entrenado con objetivo de masked language modeling (MLM) sobre secuencias de ARN no codificante del conjunto de datos MARS. Forma parte de la serie MARS de GenBio AI, la familia que anteriormente se publicaba bajo el nombre AIDO.RNA y que fue renombrada a GB.RNA; los checkpoints upstream viven ahora en la organización `genbio-ai`. No es un modelo de lenguaje natural: su vocabulario tiene 16 tokens y trabaja sobre notación de nucleótidos (A, C, G, T, U, N y tokens especiales).

El repositorio analizado no es el checkpoint original, sino un port independiente mantenido por Taykhoom Dalal que elimina la dependencia del paquete ModelGenerator, necesario para cargar el checkpoint upstream. La reimplementación es un transformer pre-LN con SwiGLU y RoPE, contenida en `modeling_gbrna.py` y `configuration_gbrna.py`, y añade soporte para `attn_implementation="sdpa"` y `flash_attention_2`. El autor verifica paridad numérica frente a los pesos originales: diferencia máxima de 8,58e-06 en la salida final y 6,10e-05 en capas intermedias.

Su relevancia práctica es doble: por un lado, ofrece una vía de carga limpia vía `transformers` para un modelo que de otro modo exige una librería específica; por otro, su tamano (0,1 GB de repositorio, ~100 MB en fp32) permite generar embeddings de ARN en CPU o en cualquier GPU consumer, lo que lo hace util para prototipado, extracción de características y fine-tuning de tareas a nivel de secuencia sin infraestructura dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer pre-LN con MLP SwiGLU y RoPE (rotary_percent=1.0) |
| Parametros totales | 25.243.168 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (truncacion de entrenamiento; RoPE no impone limite duro) |
| Tipos de cuantizacion | No se publican cuantizaciones oficiales (repo solo safetensors). Al ser un modelo de 25M, es convertible a fp16/bf16/int8 sin herramientas especificas |
| Idiomas soportados | No aplica: no es un modelo de lenguaje natural. Vocabulario de 16 tokens sobre notacion de nucleotidos (A, C, G, T, U, N) |
| Licencia | GenBio AI Community License (etiquetada como `other` en el Hub), heredada del repositorio original |
| Formato de pesos | safetensors (libreria `transformers`, requiere `trust_remote_code=True`) |

Detalle de la arquitectura: 8 capas, 16 cabezas de atencion, dimension de embedding 512, dimension oculta de FFN 1344, LayerNorm y tamano de vocabulario 16. Vocabulario completo: `[PAD]`, `[MASK]`, `[CLS]`, `[SEP]`, `[UNK]`, `A`, `G`, `C`, `T`, `U`, `N`, `[BOS]`, `[EOS]`, `[UNUSED1]`, `[UNUSED2]`, `[UNUSED3]`.

## Arquitectura y entrenamiento

El modelo es un transformer pre-LN de 8 capas con 16 cabezas de atencion, embedding de 512 dimensiones y MLP con activacion SwiGLU de 1344 dimensiones ocultas. Usa RoPE con `rotary_percent=1.0` como codificacion posicional y LayerNorm como normalizacion. El objetivo de preentrenamiento es masked language modeling sobre secuencias de ARN, con un vocabulario reducido de 16 entradas que incluye tokens especiales de clasificacion (`[CLS]`), separacion (`[SEP]`) y enmascaramiento (`[MASK]`), ademas de los nucleotidos y `N` como comodin.

Los datos de entrenamiento son secuencias de ARN no codificante del conjunto MARS; la model card no especifica el numero de tokens procesados ni la composicion detallada del dataset. No se documenta en la informacion disponible el uso de RLHF, DPO ni ajuste por instrucciones, lo cual es coherente con un modelo encoder-only de representaciones. La innovacion tecnica del repositorio no esta en la arquitectura, sino en la portabilidad: la reimplementacion standalone elimina la dependencia de ModelGenerator y anade backends de atencion eficiente (SDPA y FlashAttention-2) ausentes en la implementacion original. La paridad se verifico comparando los 9 niveles de representacion (embedding mas 8 capas) contra los pesos de `genbio-ai/GB.RNA-25M-MARS` en GPU con PyTorch 2.7 / CUDA 12.

## Capacidades

- Generacion de representaciones (embeddings) de secuencias de ARN: salida de 512 dimensiones por token y embedding de secuencia via token `[CLS]`, con acceso a los estados ocultos de las 8 capas intermedias.
- Masked language modeling: prediccion de nucleotidos enmascarados, con logits de dimension 16 por posicion.
- Extraccion de caracteristicas para tareas a nivel de secuencia (clasificacion, regresion) mediante una cabeza especifica sobre el embedding `[CLS]`.
- Fine-tuning con convenciones estandar de HuggingFace (`AutoModel` y `AutoModelForMaskedLM`).
- Normalizacion de notacion: el tokenizer convierte `U`/`u` en `T`/`t`, replicando el preprocesamiento del checkpoint original.
- Soporte de atencion eficiente mediante `attn_implementation="sdpa"` y `"flash_attention_2"`.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito; no es un modelo generativo de texto.

## Casos de uso

- Extraccion de embeddings de ARN no codificante a gran escala: el modelo produce vectores de 512 dimensiones por secuencia que se pueden indexar en una base de datos vectorial para busqueda de similitud y agrupamiento de familias de ncRNA, con un coste de computo minimo (25M de parametros).
- Clasificacion de tipos de ARN: fine-tuning de una cabeza lineal sobre el embedding `[CLS]` para distinguir, por ejemplo, microARN, ARN ribosomal o ARN largo no codificante en un pipeline de anotacion genomica.
- Anotacion de variantes: usar el modelo como extractor de caracteristicas para comparar la representacion de una secuencia de referencia frente a su variante puntual y priorizar variantes con mayor desvio en el espacio latente.
- Imputacion y control de calidad de secuencias: el objetivo MLM permite predecir bases en posiciones enmascaradas, util para detectar errores de secuenciacion o bases ambiguas (`N`) en ensamblados.
- Prototipado en CPU: al ocupar alrededor de 100 MB en fp32, cabe en cualquier portatil y permite validar una hipotesis biologica o un diseno experimental sin GPU ni infraestructura cloud.
- Destilacion y generacion de caracteristicas para modelos mayores: sus embeddings sirven como entrada compacta a clasificadores o a variantes mayores de la familia (300M, 650M, 1,6B) en esquemas de ensemble o comparacion de representaciones.
- Integracion en pipelines de bioinformatica con `transformers`: al no depender de ModelGenerator, se puede empaquetar en un contenedor estandar y encadenar con herramientas de analisis de secuencias.
- Evaluacion comparativa de checkpoints: util como baseline barato para medir cuanto aporta el escalado dentro de la propia serie MARS antes de invertir en los modelos de 650M o 1,6B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica cuantitativa reportada es la verificacion de paridad numerica con el checkpoint original: diferencia maxima de 8,58e-06 en la salida final y 6,10e-05 en las capas intermedias, medida en GPU con PyTorch 2.7 / CUDA 12.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,1 GB en fp32 (25,2M de parametros x 4 bytes), unos 50 MB en fp16/bf16 y unos 25 MB en int8. Con activaciones y batches moderados a 1024 tokens, el consumo se mantiene muy por debajo de 1 GB.
- GPU recomendadas: ninguna en particular; cualquier GPU con al menos 2 GB de VRAM es suficiente. Funciona tambien en CPU.
- Cabe en GPU consumer: si, en cualquier modelo (GTX 1050, RTX 2060, RTX 3060, RTX 4090, etc.), e incluso en dispositivos de borde o en el propio portatil.
- Opciones de despliegue: `transformers` con `AutoModel`/`AutoModelForMaskedLM` y `trust_remote_code=True` es la via documentada. No hay pesos GGUF publicados, por lo que llama.cpp/Ollama requeririan conversion previa; para servir embeddings a gran escala, vLLM o TGI no aportan ventaja significativa a este tamano y anaden complejidad.
- Latencia y throughput: no disponibles (no se han publicado mediciones). Cualitativamente, el modelo es lo bastante pequeno para inferencia interactiva en CPU con lotes pequenos.

## Comparativa con modelos similares

| Modelo | Parametros | Datos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GB.RNA-1M-MARS | 1M | ncRNA MARS | 1024 | GenBio AI Community License | HuggingFace (port de Taykhoom) |
| GB.RNA-25M-MARS (este) | 25,2M | ncRNA MARS | 1024 | GenBio AI Community License | HuggingFace (port de Taykhoom) |
| GB.RNA-300M-MARS | 300M | ncRNA MARS | 1024 | GenBio AI Community License | HuggingFace (port de Taykhoom) |
| GB.RNA-650M | 650M | 42M ncRNA | 1024 | GenBio AI Community License | HuggingFace (port de Taykhoom) |
| GB.RNA-650M-CDS | 650M | 42M ncRNA + CDS | 1024 | GenBio AI Community License | HuggingFace (port de Taykhoom) |
| GB.RNA-1.6B | 1,6B | 42M ncRNA | 1024 | GenBio AI Community License | HuggingFace (port de Taykhoom) |
| GB.RNA-1.6B-CDS | 1,6B | 42M ncRNA + CDS | 1024 | GenBio AI Community License | HuggingFace (port de Taykhoom) |

Existen otras familias de modelos genomicos comparables (por ejemplo, Nucleotide Transformer o DNABERT-2), pero no se dispone de sus especificaciones en la informacion proporcionada, por lo que no se incluyen datos de comparacion.

## Limitaciones y advertencias

- Tamano reducido: con 25M de parametros y 8 capas, su capacidad de representacion es limitada frente a las variantes de 650M y 1,6B de la misma familia; es previsible que rinda peor en tareas que requieran contexto estructural complejo.
- Sesgo de dominio: entrenado exclusivamente con ARN no codificante del dataset MARS. No se documenta entrenamiento con secuencias codificantes (CDS); para esas tareas existen variantes especificas (`-CDS`).
- Perdida de distincion ARN/ADN: el tokenizer convierte `U` en `T`, por lo que el modelo no distingue uracilo de timina. Es una decision heredada del checkpoint original, no un defecto del port, pero invalida el modelo para tareas que dependan de esa distincion.
- Contexto limitado a 1024 tokens: insuficiente para transcritos largos o regiones genomicas extensas, que habria que trocear con la consiguiente perdida de informacion de largo alcance.
- Vocabulario minimo: solo contempla `N` comobase ambigua; no cubre el codigo IUPAC completo (R, Y, S, W, K, M, B, D, H, V), lo que obliga a preprocesar las secuencias.
- Riesgo de predicciones incorrectas en MLM: no es un fenomeno de "alucinacion" conversacional, pero el modelo puede asignar alta probabilidad a bases incorrectas en regiones fuera de la distribucion de entrenamiento; no debe usarse como unico criterio en anotacion clinica.
- Ausencia de benchmarks publicados: no hay evidencia cuantitativa de calidad aguas abajo (clasificacion, prediccion de estructura, etc.) en la informacion disponible, solo la verificacion de paridad con el checkpoint original.
- Licencia restrictiva: GenBio AI Community License, etiquetada como `other`. Es imprescindible revisar el archivo `LICENSE` antes de cualquier uso comercial; no es una licencia permisiva tipo Apache-2.0 o MIT.
- Dependencia de codigo remoto: requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio. Conviene auditar `modeling_gbrna.py` y fijar una revision concreta en produccion.
- Port de terceros: el repositorio lo mantiene un particular (Taykhoom Dalal), no GenBio AI. Con 9 descargas y 0 likes en el momento de la consulta, tiene muy poca validacion externa. Para uso critico, considerar el checkpoint upstream `genbio-ai/GB.RNA-25M-MARS`.
- El renombrado de AIDO.RNA a GB.RNA implica que enlaces y nombres de repositorios antiguos pueden redirigir; conviene actualizar referencias en scripts y pipelines.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Taykhoom/GB.RNA-25M-MARS
- Coleccion GB.RNA en HuggingFace: https://huggingface.co/collections/Taykhoom/gbrna-6a22fe2e4039c523bcc48de9
- Repositorio original de codigo (GenBio AI ModelGenerator): https://github.com/genbio-ai/ModelGenerator
- Checkpoint upstream: `genbio-ai/GB.RNA-25M-MARS`
- Paper de referencia (Zou et al., bioRxiv 2024): https://doi.org/10.1101/2024.11.28.625345
- Variantes de la familia: https://huggingface.co/Taykhoom/GB.RNA-1M-MARS, https://huggingface.co/Taykhoom/GB.RNA-300M-MARS, https://huggingface.co/Taykhoom/GB.RNA-650M, https://huggingface.co/Taykhoom/GB.RNA-650M-CDS, https://huggingface.co/Taykhoom/GB.RNA-1.6B, https://huggingface.co/Taykhoom/GB.RNA-1.6B-CDS

Nota: la busqueda web realizada no devolvio resultados relevantes sobre el modelo; los unicos enlaces utiles son los presentes en la model card.
