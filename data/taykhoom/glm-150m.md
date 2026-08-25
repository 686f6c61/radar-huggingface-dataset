# Taykhoom/gLM-150M

## Resumen

gLM-150M es un port minimalista de HuggingFace de la variante de 150 millones de parametros de gLM2, un modelo de lenguaje genomico de modalidad mixta desarrollado originalmente por tattabio. El modelo codifica un andamiaje genomico utilizando simultaneamente tokens de aminoacidos y de ADN, lo que permite representar tanto regiones codificantes como secuencias nucleotidicas en un mismo espacio latente. Se preentrena con masked language modeling sobre el dataset OMG (open metagenomic corpus), con un total de 315 mil millones de tokens en contexto de 4096 posiciones.

La relevancia de este port reside en su integracion limpia con el ecosistema transformers de HuggingFace, con soporte para los backends de atencion SDPA, eager y Flash Attention 2, y verificacion de paridad bit-exacta contra los pesos originales de `tattabio/gLM2_150M`. Con 152,4 millones de parametros y un vocabulario de 37 tokens biologicos, es una herramienta pensada para investigacion en biologia computacional, bioinformatica y genomica, no para procesamiento de lenguaje natural general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Pre-LN con FFN SwiGLU |
| Parametros totales | 152.457.600 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4096 |
| Tipos de cuantizacion | bf16 y fp32 (no se documentan cuantizaciones GGUF/AWQ) |
| Idiomas soportados | No disponible (vocabulario biologico: 25 aminoacidos + 4 nucleotidos + tokens especiales) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer Pre-LN con FFN SwiGLU de 30 capas, 10 cabezas de atencion, dimension de embedding de 640 y dimension oculta FFN de 1792 (SwiGLU con `multiple_of=256`). Utiliza RoPE (base 10000, no interleaved) como codificacion posicional y RMSNorm para normalizacion. El vocabulario esta compuesto por 37 tokens: `<cls>`, `<pad>`, `<eos>`, `<unk>`, los 25 aminoacidos en mayuscula (`L A G V S E R T I D P K Q N F Y M H W C X B U Z O`), los 4 nucleotidos de ADN en minuscula (`a t c g`), los marcadores de hebra `<+>` y `<->`, y los tokens `<mask>` y `<sep>`. La distincion por mayuscula/minuscula permite que aminoacidos y nucleotidos compartan alfabeto sin ambiguedad.

El preentrenamiento se realizo con masked language modeling a una tasa de enmascaramiento del 30% sobre el dataset OMG (corpus metagenomico abierto, semanticamente deduplicado), con un total de 315 mil millones de tokens en bfloat16 y longitud de contexto 4096. El checkpoint de origen es `tattabio/gLM2_150M`. La verificacion de paridad se realizo sobre los 31 niveles de representacion (embedding + 30 bloques transformer), confirmando diferencia maxima absoluta de 0.00 con `attn_implementation="sdpa"`. Los backends eager y `flash_attention_2` concuerdan con deriva de kernel fp32 de hasta 4.43e-4 y similitud coseno bf16 >= 0.9994 respectivamente, verificado en una NVIDIA H100 con PyTorch 2.7 / CUDA 12.

## Capacidades

- Generacion de embeddings de secuencias genomicas mixtas (aminoacidos + ADN) de dimension 640, con opcion de extraer representaciones de cualquier capa intermedia.
- Masked language modeling (fill-mask) para predecir tokens enmascarados en secuencias biologicas.
- Representacion de secuencias con marcadores de hebra `<+>` y `<->`, permitiendo codificar fragmentos de doble cadena.
- Preprocesado opcional de ADN/ARN plano (`auto_prepare_dna=True`) que normaliza a minusculas, sustituye U por T y antepone `<+>`.
- Compatibilidad con backends de atencion SDPA (por defecto), eager y Flash Attention 2.
- No soporta tool calling, funciones, agentes ni conversacion multimodal.
- No es un modelo de lenguaje natural; su dominio es exclusivamente biologico.

## Casos de uso

- **Prediccion de propiedades de proteinas**: los embeddings de 640 dimensiones pueden alimentar clasificadores para predecir localizacion subcelular, estabilidad termica o interacciones proteina-proteina.
- **Anotacion de secuencias metagenomicas**: preentrenado sobre OMG, puede representar fragmentos de organismos ambientales para clasificacion taxonomica o anotacion funcional en pipelines de metagenomica.
- **Prediccion de limites de genes**: su modalidad mixta permite codificar regiones codificantes y no codificantes simultaneamente, lo que facilita la deteccion de sitios de inicio y fin de genes.
- **Generacion de embeddings para aprendizaje automatico downstream**: las representaciones de secuencia (media ponderada sobre tokens no padding) se usan como caracteristicas en tareas de regresion, agrupamiento o recuperacion de homologos.
- **Analisis de variantes**: fine-tuning del modelo para predecir el impacto de mutaciones puntuales en proteinas o regiones reguladoras, aprovechando el conocimiento contextual adquirido en el preentrenamiento.
- **Diseno de construcciones en biologia sintetica**: representacion de construcciones geneticas completas (promotor + gen + terminador) para evaluar coherencia contextual antes de la sintesis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card documenta unicamente la verificacion de paridad numerica contra el checkpoint original: diferencia maxima absoluta de 0.00 con SDPA, concordancia fp32 de hasta 4.43e-4 en eager, y similitud coseno bf16 >= 0.9994 con Flash Attention 2. No se dispone de datos de rendimiento en tareas de prediccion estructural ni funcional.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 305 MB en bf16 y 610 MB en fp32 para los pesos, mas overhead de activaciones y atenciones. Cabe en cualquier GPU con 2 GB o mas de VRAM.
- GPU recomendadas: cualquier GPU con soporte CUDA (GTX 1660 Ti o superior). Para Flash Attention 2 se recomienda una GPU Ampere o posterior (RTX 3090, A100, H100).
- Cabe en GPUs consumer: si, incluso en tarjetas de gama media de 4 GB.
- Opciones de despliegue: transformers (PyTorch) con backends `sdpa`, `eager` o `flash_attention_2`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible en la informacion publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| gLM-150M (este) | 152,4 M | 4096 | Aminoacidos + ADN | Apache 2.0 | safetensors |
| gLM-650M (Taykhoom) | 650 M | 4096 | Aminoacidos + ADN | Apache 2.0 | safetensors |
| tattabio/gLM2_150M (original) | 150 M | 4096 | Aminoacidos + ADN | Apache 2.0 | no disponible |

El modelo es un port bit-exacto del checkpoint original de tattabio, por lo que las capacidades son identicas. La variante de 650 M ofrece mayor capacidad pero no se disponen de benchmarks comparativos publicados. No se identifican alternativas de la misma categoria en el ecosistema de modelos de lenguaje genomicos con licencia Apache 2.0.

## Limitaciones y advertencias

- Modelo de dominio especifico: no procesa texto natural, codigo ni conversacion general.
- Vocabulario limitado a 37 tokens biologicos; no se puede generar texto libre.
- Riesgo de alucinacion en predicciones de tokens enmascarados; los resultados deben validarse experimentalmente.
- No se han publicado evaluaciones de sesgos ni de comportamiento en datos fuera de distribucion.
- Requiere `trust_remote_code=True` para cargar el modelo, lo que implica ejecutar codigo personalizado del autor del port.
- La informacion de la model card no documenta el rendimiento en tareas de anotacion funcional ni prediccion estructural, por lo que su utilidad en produccion debe evaluarse empiricamente.
- La paridad verificada se realizo en una H100 con PyTorch 2.7 / CUDA 12; en otros entornos pueden aparecer divergencias numericas menores.
- La citacion completa del articulo original no esta disponible en la model card (se trunca en la entrada de BibTeX).

## Enlaces

- [Pagina del modelo en HuggingFace](https://huggingface.co/Taykhoom/gLM-150M)
- [Coleccion gLM2 de Taykhoom](https://huggingface.co/collections/Taykhoom/glm2)
- [Modelo original tattabio/gLM2_150M](https://huggingface.co/tattabio/gLM2_150M)
- [Dataset OMG](https://huggingface.co/datasets/tattabio/OMG)
- [Articulo de referencia (citacion truncada en la model card)](https://huggingface.co/Taykhoom/gLM-150M)
