# virtual-human-chc/prot_albert

## Resumen

ProtAlbert es un modelo de lenguaje de proteínas (protein Language Model, pLM) basado en la arquitectura ALBERT y preentrenado con el objetivo de modelado de lenguaje enmascarado (MLM) sobre UniRef100. Fue desarrollado originalmente por Ahmed Elnaggar et al. (Rostlab, TUM) dentro del proyecto ProtTrans, y este repositorio de Hugging Face es un fork del repositorio original `Rostlab/prot_albert` publicado por el usuario `virtual-human-chc`.

El modelo está diseñado para dos tareas fundamentales: la extracción de características (generación de embeddings de secuencias proteicas) y el rellenado de máscaras (fill-mask), lo que permite predecir aminoácidos ausentes en una secuencia dada. Es relevante para pipelines de bioinformática que necesitan representaciones densas de proteínas para tareas downstream como predicción de estructura, clasificación funcional o anotación.

El repositorio tiene un tamaño de 2,7 GB, está implementado en PyTorch y es compatible con la librería `transformers` y con endpoints de Hugging Face. La licencia es Academic Free License v3.0 (AFL-3.0), lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ALBERT (transformer encoder con factorización de embeddings y compartición de parámetros entre capas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo sobre alfabeto de aminoácidos; no procesa lenguaje natural) |
| Licencia | AFL-3.0 (Academic Free License v3.0) |
| Formato de pesos | safetensors / PyTorch (repositorio `transformers`; no se indica explícitamente en la información disponible) |

## Arquitectura y entrenamiento

ProtAlbert emplea la arquitectura ALBERT, una variante de transformer encoder que reduce el número de parámetros mediante dos técnicas: factorización de la matriz de embeddings (separando el vocabulario de la dimensión oculta) y compartición de pesos entre todas las capas. Esta elección permite obtener un modelo más compacto que BERT con un rendimiento comparable en tareas de representación. El tokenizador es `AlbertTokenizer` con `do_lower_case=False`, adaptado al alfabeto de aminoácidos representado como tokens separados por espacios.

El preentrenamiento se realizó sobre UniRef100 (dataset `bloyal/uniref100`) con el objetivo de masked language modeling, en el que el modelo aprende a predecir aminoácidos enmascarados a partir del contexto de la secuencia. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de ajuste fino supervisado o RLHF/DPO. La model card cita como referencia el paper de ProtTrans (Elnaggar et al., IEEE TPAMI 2021) para los detalles metodológicos completos.

## Capacidades

- Generación de embeddings de proteínas para extracción de características (feature extraction) mediante `pipeline('feature-extraction')`.
- Rellenado de máscaras (fill-mask) para predecir aminoácidos ausentes en secuencias proteicas.
- Procesamiento de secuencias de aminoácidos representadas como tokens separados por espacios (por ejemplo, `"D L I P T S S K L V V [MASK] D T S L Q V K K A F F A L V T"`).
- Manejo de aminoácidos no estándar (U, Z, O, B) mediante sustitución por `X` en el flujo de preprocesado mostrado en la model card.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües en el sentido de lenguaje natural.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Extracción de embeddings para predicción de estructura secundaria: las representaciones por residuo generadas con `feature-extraction` pueden alimentar clasificadores downstream que predigan hélices alfa, láminas beta o regiones desordenadas a partir de la secuencia.
- Anotación funcional de proteínas: los embeddings agregados de una secuencia pueden usarse como entrada a modelos de clasificación para asignar familias Pfam o términos GO, aprovechando el preentrenamiento sobre UniRef100.
- Predicción de mutaciones y rellenado de huecos: la tarea fill-mask permite estimar el aminoácido más probable en posiciones enmascaradas, útil para validar alineamientos o detectar posiciones conservadas.
- Búsqueda de homólogos por similitud semántica: los embeddings del modelo pueden indexarse en bases vectoriales para recuperar proteínas funcionalmente similares sin depender únicamente de alineamiento de secuencias.
- Filtrado de calidad en pipelines de secuenciación: representar secuencias candidatas y detectar outliers en el espacio de embeddings para descartar traducciones erróneas o fragmentos no codificantes.
- Preentrenamiento inicial para ajuste fino en tareas específicas de laboratorio: el modelo sirve como backbone congelado o ajustable en modelos de regresión sobre propiedades biofísicas (estabilidad térmica, solubilidad) cuando el volumen de datos etiquetados es limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 2,7 GB, por lo que la inferencia en precisión completa requiere al menos ese orden de magnitud de memoria, y menos si se aplica cuantización.
- GPU recomendadas: no especificadas en la información disponible; por el tamaño del repositorio, una GPU consumer con 8-16 GB debería ser suficiente para inferencia en fp16, aunque no se confirma.
- Compatibilidad con GPU consumer: probable según el tamaño del checkpoint, pero no confirmada por el autor.
- Opciones de despliegue: `transformers` (PyTorch) con `AlbertForMaskedLM` y `AutoModel`; compatible con endpoints de Hugging Face. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Preentrenamiento | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ProtAlbert (este repo) | ALBERT | UniRef100, MLM | no disponible | AFL-3.0 | Hugging Face (`virtual-human-chc/prot_albert`) |
| ProtBert (`Rostlab/prot_bert`) | BERT | UniRef100, MLM | no disponible | AFL-3.0 | Hugging Face (repositorio original de ProtTrans) |
| ProtElectra (`Rostlab/prot_electra`) | ELECTRA | UniRef100, replaced token detection | no disponible | AFL-3.0 | Hugging Face (repositorio original de ProtTrans) |
| ESM-2 (Meta) | Transformer | UniRef50, MLM | hasta 512 tokens en variantes pequeñas | MIT (variantes open) | Hugging Face / GitHub |

La comparativa se limita a arquitecturas y licencias; no se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en proteínas: no procesa lenguaje natural ni soporta tareas de texto convencionales.
- No se documentan sesgos específicos, pero al entrenarse sobre UniRef100 puede heredar los sesgos de composición de dicha base de datos (sobrerrepresentación de organismos modelo y secuencias bien anotadas).
- Riesgo de alucinación en fill-mask: las predicciones de aminoácidos son probabilísticas y no deben interpretarse como verdad biológica sin validación experimental.
- Longitud de contexto no documentada; secuencias muy largas pueden truncarse o degradar la calidad de los embeddings.
- Licencia AFL-3.0: permite uso académico y comercial con condiciones de atribución y reciprocidad; conviene revisar los términos antes de integrarlo en productos propietarios.
- Repositorio fork con 9 descargas y 0 likes: no es el repositorio canónico de ProtTrans, por lo que se recomienda contrastar con `Rostlab/prot_albert` para producción.
- No se documentan procesos de ajuste fino supervisado ni RLHF; el modelo es exclusivamente un backbone preentrenado por MLM.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/virtual-human-chc/prot_albert
- Repositorio original de ProtAlbert: https://huggingface.co/Rostlab/prot_albert
- Repositorio GitHub de ProtTrans: https://github.com/agemagician/ProtTrans
- Paper de ProtTrans (IEEE TPAMI): https://ieeexplore.ieee.org/document/9477085
- DOI de cita: https://doi.org/10.1109/TPAMI.2021.3095381
- Licencia AFL-3.0: https://choosealicense.com/licenses/afl-3.0/
- Dataset UniRef100 referenciado: https://huggingface.co/datasets/bloyal/uniref100
