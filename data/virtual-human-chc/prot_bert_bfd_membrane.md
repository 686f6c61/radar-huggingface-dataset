# virtual-human-chc/prot_bert_bfd_membrane

## Resumen

ProtBert-BFD-MS es un modelo de clasificación de secuencias de proteínas derivado de ProtBert-BFD, el modelo de lenguaje proteico (pLM) preentrenado por Ahmed Elnaggar y colaboradores en el Rostlab (TUM) mediante enmascarado de tokens (MLM) sobre la base de datos BFD. Esta variante concreta, publicada por el usuario `virtual-human-chc`, añade una cabeza de clasificación para predecir, a nivel de proteína completa, si una secuencia es de membrana o soluble en agua (clasificación binaria de dos estados).

El modelo emplea una arquitectura transformer tipo BERT con 419.973.186 parámetros (aproximadamente 420 M), tokenización a nivel de residuo aminoacídico y una ventana de contexto efectiva limitada por la posición máxima de BERT (512 tokens), lo que restringe la longitud de secuencia procesable en una sola pasada. Solo acepta aminoácidos en mayúsculas y no incorpora tareas auxiliares como la predicción de siguiente frase de BERT; únicamente se usó el objetivo MLM en el preentrenamiento.

Su relevancia práctica radica en que ofrece una solución lista para usar en `transformers` para una tarea clásica de anotación funcional de proteínas, con pesos en safetensors y compatibilidad con `TextClassificationPipeline`. El repositorio (5,0 GB) es un fork de `Rostlab/prot_bert_bfd_membrane`, con licencia Academic Free License v3.0 y uso previsto en inglés técnico (secuencias de aminoácidos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (encoder), con cabeza de clasificación de secuencia |
| Parametros totales | 419.973.186 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (límite posicional de BERT; no confirmado explícitamente en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta declarada); entrada real: secuencias de aminoácidos en mayúsculas |
| Licencia | afl-3.0 (Academic Free License v3.0); código derivado bajo MIT |
| Formato de pesos | safetensors (también pytorch y jax según tags) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de ProtBert-BFD: un transformer encoder estilo BERT preentrenado con objetivo de masked language modeling sobre secuencias de proteínas de la base de datos BFD, sin tarea auxiliar de next-sentence prediction. El preentrenamiento original corresponde a Elnaggar et al. (Rostlab, TUM), y esta variante añade un cabezal de clasificación para la predicción binaria membrana/soluble a nivel de proteína (pooling). La model card no detalla el número de tokens de preentrenamiento, la composición exacta del dataset ni si hubo ajuste fino con RLHF/DPO; esos datos deben consultarse en la publicación original.

La innovación técnica destacable es el uso de tokenización a nivel de residuo aminoacídico con normalización de caracteres no estándar (`U`, `Z`, `O`, `B` se sustituyen por `X`) y la exigencia de entrada en mayúsculas. No se documentan mecanismos de decodificación especulativa, atención lineal ni arquitecturas híbridas SSM.

## Capacidades

- Clasificación binaria de proteínas: predice `Membrane` o `Soluble` con una puntuación de confianza por secuencia.
- Procesamiento de secuencias de aminoácidos en mayúsculas, con sustitución de residuos no estándar por `X`.
- Integración con `transformers` mediante `AutoModelForSequenceClassification`, `AutoTokenizer` y `TextClassificationPipeline`.
- Compatibilidad con endpoints (`endpoints_compatible`) y ejecución en GPU (`device=0` en el ejemplo).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al dominio de secuencias proteicas; la etiqueta de idioma `en` es administrativa, no lingüística.

## Casos de uso

- Anotación funcional de proteínas en pipelines bioinformáticos: clasificar lotes de secuencias como membrana o soluble antes de análisis estructurales, usando el pipeline de `transformers` con GPU.
- Filtrado previo en estudios de proteómica: descartar o priorizar candidatos de membrana en datasets grandes, aprovechando la inferencia por secuencia y la salida con score de confianza.
- Curado de bases de datos biológicas: asignar etiquetas de localización aproximada a entradas nuevas, con revisión humana de los casos de baja confianza.
- Docencia y prototipado en microbiología computacional: demostrar el uso de pLM en tareas de clasificación con un ejemplo reproducible de la model card.
- Integración en servicios web de anotación: exponer el modelo tras una API que reciba secuencias en mayúsculas y devuelva `label` y `score`.
- Comparación de variantes de ProtBert: usar este fork como referencia para evaluar el efecto de la cabeza de clasificación frente al modelo original de Rostlab.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,7 GB solo para pesos (420 M parámetros), más activaciones y overhead; en la práctica, 2-4 GB según longitud de secuencia y batch.
- VRAM estimada en fp16/bf16: alrededor de 0,9 GB para pesos, con margen adicional para activaciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para secuencias cortas; A100, H100 o RTX 4090 para lotes grandes y throughput alto.
- Cabe en GPU de consumo: sí, en RTX 3060 (12 GB), RTX 4060 Ti, RTX 4090 y similares; también en GPUs con 4-6 GB para inferencia unitaria.
- Opciones de despliegue: `transformers` con `TextClassificationPipeline`, integración con endpoints compatibles; no se documenta soporte explícito de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| virtual-human-chc/prot_bert_bfd_membrane | 419.973.186 | 512 tokens (límite BERT) | Clasificación membrana/soluble | afl-3.0 | Hugging Face (fork) |
| Rostlab/prot_bert_bfd_membrane | no disponible en la informacion | no disponible | Clasificación membrana/soluble | afl-3.0 (según original) | Hugging Face (original) |
| ProtBert-BFD (base) | no disponible en la informacion | no disponible | MLM de proteínas | afl-3.0 | Hugging Face / GitHub ProtTrans |

La comparativa se limita a variantes de la misma familia; no se dispone de datos de benchmarks para comparar rendimiento frente a alternativas.

## Limitaciones y advertencias

- Solo acepta aminoácidos en mayúsculas; las minúsculas o caracteres no estándar no procesados como `X` pueden degradar la predicción.
- Ventana de contexto limitada a 512 tokens; proteínas largas requieren truncamiento o segmentación, lo que puede sesgar la clasificación a nivel de proteína completa.
- Riesgo de alucinación inherente a modelos MLM: la salida es una probabilidad, no una verdad biológica; se recomienda validación experimental.
- Sesgos potenciales derivados de la distribución de BFD y del conjunto de ajuste fino, no documentados en la model card.
- Licencia afl-3.0: permite uso comercial con condiciones de la Academic Free License v3.0; el código derivado de ProtTrans es MIT, pero los pesos preentrenados están bajo afl-3.0. Verificar obligaciones de atribución antes de producción.
- Repositorio con muy pocas descargas (8) y ningún like: no hay evidencia de validación comunitaria extensa.
- La model card no documenta métricas de precisión, recall ni calibración; el score de confianza no debe interpretarse como probabilidad calibrada sin evaluación propia.

## Enlaces

- Hugging Face: https://huggingface.co/virtual-human-chc/prot_bert_bfd_membrane
- Repositorio original en Hugging Face: https://huggingface.co/Rostlab/prot_bert_bfd_membrane
- GitHub ProtTrans: https://github.com/agemagician/ProtTrans
- Paper (IEEE TPAMI): https://ieeexplore.ieee.org/document/9477085
- DOI de cita: https://doi.org/10.1109/TPAMI.2021.3095381
