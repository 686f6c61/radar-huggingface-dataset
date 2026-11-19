# virtual-human-chc/prot_t5_xl_bfd

## Resumen

ProtT5-XL-BFD es un modelo de lenguaje de proteinas basado en la arquitectura T5-3B (encoder-decoder, aproximadamente 3.000 millones de parametros) preentrenado de forma auto-supervisada sobre secuencias de aminoacidos. Lo desarrollan Ahmed Elnaggar et al. en el Rostlab (TUM) y se distribuye originalmente bajo el repositorio ProtTrans; la ficha que nos ocupa es un fork alojado por el usuario virtual-human-chc que replica los pesos de Rostlab/prot_t5_xl_bfd.

El modelo resuelve el problema de obtener representaciones densas (embeddings) de proteinas sin etiquetado humano, capturando propiedades biofisicas que gobiernan la forma de la proteina. Se preentrena con un objetivo de denoising tipo BART-MLM sobre el corpus BFD (2.100 millones de secuencias), enmascarando el 15% de los aminoacidos. Es relevante porque permite extraer caracteristicas para tareas de estructura secundaria, localizacion subcelular o membrana, y sirve como base para fine-tuning en tareas downstream de biologia computacional.

A diferencia del T5 original (span denoising), este modelo usa enmascaramiento puntual de aminoacidos, con un vocabulario de 21 tokens y entradas de hasta 512 tokens. Solo admite aminoacidos en mayuscula y trabaja en ingles a nivel de documentacion; la "lengua" real del modelo es el alfabeto de aminoacidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5-3B) |
| Parametros totales | ~3.000 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos PyTorch/TF sin cuantizaciones publicadas) |
| Idiomas soportados | en (documentacion); alfabeto de aminoacidos en mayuscula |
| Licencia | AFL-3.0 (Academic Free License v3.0) |
| Formato de pesos | PyTorch (transformers), TensorFlow (tf) |

## Arquitectura y entrenamiento

ProtT5-XL-BFD es un transformer encoder-decoder con arquitectura T5-3B. La innovacion respecto al T5 original es el objetivo de preentrenamiento: en lugar del span denoising, se emplea un MLM denoising tipo BART, enmascarando aleatoriamente el 15% de los aminoacidos de la entrada. De ese 15%, en el 90% de los casos el token se sustituye por `[MASK]` y en el 10% por un aminoacido aleatorio distinto. Las secuencias se pasan en mayuscula, tokenizadas con espacio simple y vocabulario de 21, mapeando los aminoacidos raros U, Z, O y B a X. Las entradas tienen la forma `Protein Sequence [EOS]` y se recortan o rellenan hasta 512 tokens.

El entrenamiento se realizo sobre BFD (2.100 millones de secuencias de proteinas) en un unico TPU Pod V3-1024, durante 1,2 millones de pasos, con longitud de secuencia 512 y batch de 4.000. Se uso el optimizador AdaFactor con un schedule de learning rate de raiz cuadrada inversa. El modelo aprende representaciones (LM-embeddings) que capturan propiedades biofisicas relevantes para la forma de la proteina, lo que sugiere que internaliza parte de la "gramatica" del lenguaje de la vida.

## Capacidades

- Extraccion de caracteristicas (embeddings) de secuencias de proteinas, preferentemente desde el encoder.
- Fine-tuning en tareas downstream de biologia estructural y funcional.
- Prediccion de estructura secundaria (3 estados y 8 estados) tras el ajuste correspondiente.
- Prediccion de localizacion subcelular y de presencia de dominio transmembrana.
- Modelado de lenguaje de proteinas mediante enmascaramiento y reconstruccion de aminoacidos.
- No dispone de tool calling, function calling, soporte de agentes ni capacidades multimodales (vision, audio).
- Capacidad multilingue limitada al alfabeto de aminoacidos; no es un modelo de lenguaje natural general.

## Casos de uso

- Anotacion de estructura secundaria de proteinas: a partir de embeddings del encoder y una cabeza de clasificacion ajustada, se predicen estados 3-state y 8-state con precisiones reportadas de hasta 85 y 74 respectivamente en TS115.
- Prediccion de localizacion subcelular: usando las representaciones del modelo como entrada a un clasificador, se alcanza un 77 en DeepLoc, util para priorizar dianas experimentales.
- Deteccion de proteinas de membrana: con embeddings del encoder y fine-tuning, el modelo logra un 91 en el dataset Membrane, adecuado para filtrado previo en pipelines de genomica.
- Busqueda y agrupamiento de proteinas por similitud: los embeddings permiten calcular distancias en espacio latente para clustering funcional o recuperacion de homologos sin alineamiento multiple.
- Ingenieria de proteinas asistida: usar las representaciones para guiar el diseno de variantes y priorizar mutaciones con modelos surrogate entrenados sobre los embeddings.
- Preentrenamiento base para tareas de proteomica a gran escala: servir como backbone congelado o ajustado en pipelines de anotacion funcional sobre millones de secuencias, aprovechando que se entreno sobre BFD.
- Extraccion de caracteristicas para modelos de estructura 3D: los LM-embeddings pueden alimentar predictores de contacto o de plegamiento como señal adicional.

## Benchmarks y rendimiento

Resultados reportados por el autor para extraccion de caracteristicas (feature extraction):

| Tarea/Dataset | Estructura secundaria (3 estados) | Estructura secundaria (8 estados) | Localizacion | Membrana |
|---|---|---|---|---|
| CASP12 | 77 | 66 | no disponible | no disponible |
| TS115 | 85 | 74 | no disponible | no disponible |
| CB513 | 84 | 71 | no disponible | no disponible |
| DeepLoc | no disponible | no disponible | 77 | no disponible |
| Membrane | no disponible | no disponible | no disponible | 91 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K no aplican a este dominio).

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: en torno a 12 GB solo para pesos de 3B parametros, mas activaciones y memoria del tokenizador; en la practica se recomienda al menos 16 GB.
- En FP16/BF16: aproximadamente 6-7 GB para pesos, con margen para batch pequeno; cabe en GPUs consumer de 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090).
- GPU recomendadas para produccion: A100 40/80 GB, H100, L40S; para experimentacion, RTX 4090 o A6000.
- Despliegue: transformers (PyTorch/TensorFlow) es la via documentada; vLLM, llama.cpp, Ollama y TGI no estan confirmados para este modelo de proteinas. El tag `text-generation-inference` y `endpoints_compatible` aparece en los metadatos, pero no hay guia oficial de despliegue en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ProtT5-XL-BFD (este) | ~3B | 512 | Protein LM (encoder-decoder) | AFL-3.0 | Hugging Face (fork) |
| ProtT5-XXL-BFD (Rostlab) | ~11B (no confirmado en la info) | 512 | Protein LM | AFL-3.0 | Hugging Face (Rostlab) |
| ESM-2 (familia) | 8M-15B (segun variante) | variable | Protein LM (encoder) | MIT (segun variante) | Hugging Face (Meta) |
| ProtBERT-BFD | ~420M (no confirmado) | 512 | Protein LM (encoder) | AFL-3.0 | Hugging Face (Rostlab) |

Nota: los datos de ProtT5-XXL-BFD, ESM-2 y ProtBERT-BFD no provienen de la informacion proporcionada; se indican como referencia de categoria y deben verificarse en sus fichas oficiales.

## Limitaciones y advertencias

- Solo acepta aminoacidos en mayuscula; las secuencias en minuscula o con caracteres no mapeados pueden producir resultados incorrectos.
- Los aminoacidos raros U, Z, O y B se mapean a X, lo que puede perder informacion en secuencias con modificaciones.
- Ventana maxima de 512 tokens: proteinas largas requieren truncado o segmentacion, con perdida de contexto global.
- Riesgo de alucinacion en generacion: al ser un modelo generativo, las secuencias reconstruidas no deben interpretarse como proteinas reales sin validacion experimental.
- Sesgos derivados del corpus BFD: la distribucion de secuencias no es uniforme y puede sobrerrepresentar ciertos organismos o familias.
- Licencia AFL-3.0: permite uso comercial pero con obligaciones de atribucion y copyleft debil sobre el modelo y obras derivadas; revisar compatibilidad antes de produccion.
- Este repositorio es un fork con 6 descargas y 0 likes; no es el repositorio canonico y puede no recibir actualizaciones. Verificar integridad de pesos frente al original de Rostlab.
- No es un modelo de lenguaje natural: no debe usarse para chat, codigo ni tareas generales de NLP a pesar del tag `text-generation`.
- No se dispone de informacion sobre cuantizaciones, latencia o throughput en produccion.

## Enlaces

- Hugging Face (este fork): https://huggingface.co/virtual-human-chc/prot_t5_xl_bfd
- Repositorio original en Hugging Face: https://huggingface.co/Rostlab/prot_t5_xl_bfd
- Paper ProtTrans (TPAMI): https://doi.org/10.1109/TPAMI.2021.3095381
- Preprint bioRxiv: https://doi.org/10.1101/2020.07.12.199554
- Repositorio de codigo ProtTrans: https://github.com/agemagician/ProtTrans
- Dataset BFD: https://bfd.mmseqs.com/
- Licencia AFL-3.0: https://choosealicense.com/licenses/afl-3.0/
