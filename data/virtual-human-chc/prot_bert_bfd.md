# virtual-human-chc/prot_bert_bfd

## Resumen

ProtBert-BFD es un modelo de lenguaje de proteínas basado en la arquitectura BERT, preentrenado con objetivo de modelado de lenguaje enmascarado (MLM) sobre el dataset BFD (2.100 millones de secuencias proteicas). Fue desarrollado originalmente por Elnaggar et al. en el Rostlab (Universidad Tecnica de Munich) y presentado en el paper de ProtTrans. Este repositorio concreto (`virtual-human-chc/prot_bert_bfd`) es un fork del repositorio original de Hugging Face de Rostlab, publicado bajo licencia AFL-3.0.

El modelo trata cada secuencia proteica como un documento independiente, sin usar Next Sentence Prediction, y opera exclusivamente con aminoacidos en mayuscula y un vocabulario de 21 tokens. Su proposito principal es la extraccion de caracteristicas (embeddings) de secuencias proteicas y el ajuste fino en tareas downstream de bioinformatica estructural y funcional.

Es relevante porque los embeddings derivados de este modelo capturan propiedades biofisicas que gobiernan el plegamiento proteico, lo que lo convierte en una herramienta util para prediccion de estructura secundaria, localizacion subcelular y clasificacion de proteinas de membrana, entre otras tareas. El tamano del repositorio es de 5,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (MLM) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 y 2048 aminoacidos (entrenado en dos fases) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta del repo); en la practica, secuencias de aminoacidos en mayuscula |
| Licencia | AFL-3.0 (Academic Free License v3.0) |
| Formato de pesos | PyTorch y TensorFlow (libreria transformers) |

## Arquitectura y entrenamiento

ProtBert-BFD es un transformer encoder basado en BERT adaptado al dominio proteico. A diferencia del BERT original, no emplea Next Sentence Prediction: cada secuencia proteica se trata como un documento completo. El vocabulario es de 21 tokens (20 aminoacidos estandar mas tokens especiales), las secuencias se convierten a mayusculas y se tokenizan separando cada aminoacido por un espacio. El enmascaramiento sigue el esquema clasico de BERT: 15% de los aminoacidos se enmascaran, de los cuales el 80% se sustituyen por `[MASK]`, el 10% por un aminoacido aleatorio distinto y el 10% restante se dejan intactos.

El preentrenamiento se realizo sobre el dataset BFD (2.100 millones de secuencias proteicas) durante un millon de pasos totales en un TPU Pod V3-1024: 800.000 pasos con longitud de secuencia 512 y batch size de 32.000, seguidos de 200.000 pasos con longitud 2.048 y batch size de 6.000. Se uso el optimizador LAMB con learning rate de 0,002, weight decay de 0,01, warmup de 140.000 pasos y decaimiento lineal posterior. El preprocesamiento se aplico dos veces, una para longitudes combinadas inferiores a 512 aminoacidos y otra para longitudes inferiores a 2.048.

## Capacidades

- Modelado de lenguaje enmascarado (fill-mask) sobre secuencias de aminoacidos: predice el aminoacido mas probable en una posicion enmascarada.
- Extraccion de embeddings contextuales por residuo para secuencias proteicas, utiles como caracteristicas en pipelines downstream.
- Ajuste fino supervisado para tareas de bioinformatica estructural y funcional.
- Prediccion de estructura secundaria (3 estados y 8 estados) tras ajuste fino.
- Prediccion de localizacion subcelular y clasificacion de proteinas de membrana tras ajuste fino.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- Capacidad multilingue no aplica: opera sobre el alfabeto de aminoacidos, no sobre lenguaje natural.
- Solo acepta aminoacidos en mayuscula; caracteres no estandar (U, Z, O, B) deben sustituirse por X.

## Casos de uso

- Prediccion de estructura secundaria de proteinas: tras ajuste fino sobre datasets como CB513 o TS115, el modelo clasifica cada residuo en 3 u 8 estados estructurales, aprovechando los embeddings contextuales que capturan dependencias locales y globales de la secuencia.
- Prediccion de localizacion subcelular: ajustando una cabeza de clasificacion sobre los embeddings del token `[CLS]`, se puede predecir en que compartimento celular reside una proteina (evaluado en DeepLoc con 78% de acierto).
- Clasificacion de proteinas de membrana: el modelo ajustado distingue proteinas transmembrana de no transmembrana (91% en la evaluacion reportada), util en anotacion funcional a gran escala.
- Anotacion funcional de proteinas no caracterizadas: extrayendo embeddings y entrenando un clasificador ligero se pueden inferir familias o funciones aproximadas de secuencias nuevas, reduciendo el coste frente a metodos experimentales.
- Busqueda y agrupamiento de secuencias: los embeddings por secuencia permiten calcular similitudes y agrupar proteinas relacionadas en pipelines de analisis masivo de metagenomas.
- Filtrado y priorizacion en descubrimiento de farmacos: los embeddings sirven como caracteristica en modelos de prediccion de interaccion proteina-ligando o de estabilidad, ayudando a priorizar candidatos antes de validacion experimental.
- Deteccion de mutaciones con efecto estructural: enmascarando posiciones concretas y comparando las distribuciones de probabilidad del modelo se pueden estimar que sustituciones son mas plausibles y cuales potencialmente deletereas.

## Benchmarks y rendimiento

Resultados reportados en la model card tras ajuste fino en tareas downstream:

| Tarea / Dataset | Metrica | Resultado |
|---|---|---|
| CASP12 | Estructura secundaria (3 estados) | 76 |
| CASP12 | Estructura secundaria (8 estados) | 65 |
| TS115 | Estructura secundaria (3 estados) | 84 |
| TS115 | Estructura secundaria (8 estados) | 73 |
| CB513 | Estructura secundaria (3 estados) | 83 |
| CB513 | Estructura secundaria (8 estados) | 70 |
| DeepLoc | Localizacion subcelular | 78 |
| DeepLoc | Membrana | 91 |

No se han publicado en la informacion disponible resultados de benchmarks comparativos con otros modelos en este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 5,2 GB, lo que sugiere un modelo en el rango de los 400-500 millones de parametros en precision completa. En FP32 requeriria aproximadamente 2 GB de VRAM para los pesos; en FP16 aproximadamente 1 GB. Cifras estimadas, no confirmadas en la model card.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente para inferencia en precision reducida. Para ajuste fino con lotes grandes se recomienda A100, H100 o RTX 4090.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4070 y superiores, siempre que se use precision FP16 o cuantizacion.
- Opciones de despliegue: transformers (PyTorch y TensorFlow) de forma nativa; el tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints. vLLM, llama.cpp u Ollama no estan confirmados para este modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ProtBert-BFD (este) | no disponible (repo 5,2 GB) | 512 / 2048 aa | BFD (2.100 M secuencias) | AFL-3.0 | Hugging Face |
| ProtT5-XL-BFD | no disponible | no disponible | BFD | AFL-3.0 | Hugging Face (Rostlab) |
| ProtT5-XXL-BFD | no disponible | no disponible | BFD | AFL-3.0 | Hugging Face (Rostlab) |
| ESM-2 (Meta) | 8M a 15B (segun variante) | hasta 1024 aa (variantes grandes) | UniRef | MIT (variantes) | Hugging Face |

Los datos de parametros y contexto de los modelos comparables no estan confirmados en la informacion proporcionada; se indican como referencia general de la categoria. No se dispone de comparativas de rendimiento directas en la informacion disponible.

## Limitaciones y advertencias

- Solo acepta aminoacidos en mayuscula; las minusculas o caracteres no estandar no se procesan correctamente sin normalizacion previa (U, Z, O, B deben sustituirse por X).
- No es un modelo de lenguaje natural: no genera texto, no responde a instrucciones y no soporta conversacion.
- Riesgo de alucinacion en el sentido de predicciones de aminoacidos plausibles pero biologicamente incorrectas; las predicciones deben validarse experimentalmente.
- El modelo base no esta ajustado para ninguna tarea concreta; su rendimiento en tareas downstream depende del ajuste fino y de los datos utilizados.
- Sesgos potenciales derivados de la composicion del dataset BFD: proteinas sobrerrepresentadas o infrarepresentadas pueden producir embeddings menos fiables para ciertas familias.
- La licencia AFL-3.0 permite uso comercial, pero conviene revisar sus terminos exactos (obligaciones de atribucion y condiciones de redistribucion) antes de integrarlo en productos.
- El repositorio es un fork no oficial de Rostlab; para produccion se recomienda verificar la integridad de los pesos frente al repositorio original.
- No se han publicado datos de cuantizacion ni de latencia en produccion, lo que limita la planificacion de despliegues a gran escala.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/virtual-human-chc/prot_bert_bfd
- Paper ProtTrans (TPAMI): https://doi.org/10.1109/TPAMI.2021.3095381
- Paper preprint: https://doi.org/10.1101/2020.07.12.199554
- Repositorio de codigo ProtTrans: https://github.com/agemagician/ProtTrans
- Repositorio original en Hugging Face (Rostlab): https://huggingface.co/Rostlab/prot_t5_xxl_bfd/tree/main
- Dataset BFD: https://bfd.mmseqs.com/
- Licencia AFL-3.0: https://choosealicense.com/licenses/afl-3.0/
