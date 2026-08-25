# Taykhoom/UTR-LM-MLMSS

## Resumen

UTR-LM-MLMSS es un port minimalista a HuggingFace de la variante con objetivo de modelado de lenguaje enmascarado (MLM) más predicción de estructura secundaria del modelo UTR-LM, un modelo de lenguaje para ARN específicamente diseñado para regiones 5' UTR (regiones no traducidas del extremo 5' del ARN mensajero). Fue desarrollado originalmente por Yanyi Chu et al. y publicado en *Nature Machine Intelligence* en 2024; este port ha sido realizado por Taykhoom Dalal con la asistencia de Claude Code, verificando la paridad bit-exacta con los pesos originales.

El modelo sigue una arquitectura tipo ESM2 (Transformer pre-LN con FFN GELU) con 6 capas, 16 cabezas de atención, dimensión de embedding 128 y una ventana de contexto de 1024 tokens (1022 nucleótidos más los tokens especiales `<cls>` y `<eos>`). Con solo 1,2 millones de parámetros, es un modelo extremadamente ligero, pensado para tareas de representación de secuencias de ARN y predicción de propiedades funcionales de las regiones 5' UTR, como la eficiencia de traducción o la estabilidad del ARN mensajero.

Su relevancia actual radica en que las regiones 5' UTR juegan un papel crítico en la regulación de la expresión génica, y los modelos de lenguaje específicos para ARN como este permiten obtener embeddings de alta calidad para tareas downstream con pocos datos etiquetados. Al ser un port fiel con pesos verificados, ofrece una vía reproducible para investigadores que quieran usar UTR-LM dentro del ecosistema Transformers sin depender del código original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer pre-LN estilo ESM2 con FFN GELU |
| Parametros totales | 1.207.970 |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens (1022 nucleotidos + `<cls>` / `<eos>`) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, compatible con bf16 y fp32) |
| Idiomas soportados | no aplicable (vocabulario biologico: A, G, C, T) |
| Licencia | GPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un Transformer codificador de 6 capas con atención de 16 cabezas, dimensión de embedding 128 y FFN oculto de 512 unidades con activación GELU. Usa codificación posicional RoPE (base 10000) y normalización LayerNorm pre-atención (pre-LN), siguiendo el diseño de ESM2. El vocabulario consta de 10 tokens: `<pad>`, `<eos>`, `<unk>`, `A`, `G`, `C`, `T`, `<cls>`, `<mask>` y `<sep>`. El tokenizador usa el alfabeto de ADN (A/G/C/T), por lo que las secuencias de ARN deben convertir la uracila (U) a timina (T) antes de la tokenización; una U literal se mapea a `<unk>`.

El preentrenamiento combina dos objetivos: modelado de lenguaje enmascarado (MLM) y predicción por token de estructura secundaria en tres clases (no apareado, tallo, bucle). Los datos de entrenamiento provienen de regiones 5' UTR endógenas de cinco especies (humano, ratón, pez cebra, *Drosophila* y levadura) combinadas con la biblioteca sintética aleatoria de 5' UTR de Cao et al. El checkpoint original se denomina `ESM2SS_FS4.1_fiveSpeciesCao_6layers_16heads_128embedsize_4096batchToks_lr1e-05_structureweight1.0_MLMLossMin_epoch200.pkl`. Este port conserva el backbone y la cabeza MLM, pero omite la cabeza auxiliar de estructura secundaria; la estructura secundaria fue un objetivo de predicción auxiliar, no un canal de entrada.

La verificación de paridad se realizó comparando los 7 niveles de representación (embedding + 6 bloques) contra los pesos originales, obteniendo una diferencia máxima absoluta de 0.00 en PyTorch 2.7.1 con CUDA 12.9.

## Capacidades

- Generacion de embeddings de secuencias de ARN 5' UTR: produce representaciones de 128 dimensiones por token y una representacion CLS de secuencia completa.
- Modelado de lenguaje enmascarado: puede predecir nucleotidos enmascarados en una secuencia, util para tareas de imputacion o analisis de motivos.
- Extraccion de representaciones intermedias: permite acceder a las salidas de cada capa (6 capas + embedding) para tareas de transferencia o analisis de caracteristicas.
- Compatibilidad con backends de atencion acelerada: soporta SDPA (PyTorch 2.0+) y Flash Attention 2, ademas de la atencion eager original.
- Capacidad de fine-tuning: sigue las convenciones estandar de HuggingFace Transformers, por lo que puede ajustarse con cualquier Trainer para tareas de clasificacion o regresion sobre secuencias.
- Representacion de secuencias de ADN/ARN: aunque esta especializado en 5' UTR, el vocabulario permite procesar cualquier secuencia de ADN/ARN de hasta 1022 nucleotidos.

## Casos de uso

- Prediccion de eficiencia de traduccion (TE): el modelo puede fine-tuning con el embedding CLS como entrada a una cabeza de regresion para predecir la eficiencia de traduccion de un ARN mensajero a partir de su region 5' UTR, una tarea clave en diseno de vacunas y terapias de ARN.
- Prediccion de estabilidad del ARN mensajero (MRL): la variante MLMSS es adecuada para tareas de vida media del ARN, ya que la estructura secundaria correlaciona con la estabilidad; se puede usar el embedding CLS o la media de embeddings por token como caracteristicas para un modelo de regresion.
- Diseno de UTRs sinteticas para expresion genica: los embeddings generados pueden alimentar modelos generativos o de optimizacion para disenar secuencias 5' UTR que maximicen la expresion de proteinas recombinantes en biotecnologia.
- Analisis de motivos regulatorios: las representaciones de capas intermedias pueden usarse para identificar motivos de union a ribosomas o elementos reguladores en 5' UTR, mediante analisis de atencion o clustering de embeddings.
- Clasificacion de tipos de UTR o especies: el modelo puede fine-tuning para clasificar si una secuencia 5' UTR pertenece a una especie determinada o si tiene caracteristicas especificas (por ejemplo, presencia de uORFs).
- Generacion de secuencias con MLM: usando la cabeza de MLM, se pueden enmascarar posiciones y muestrear nucleotidos para explorar variantes de una UTR, util en estudios de mutagenesis in silico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card no incluye metricas como MMLU, HumanEval o similares, ya que se trata de un modelo biologico especializado y no de un modelo de lenguaje general. El paper original de UTR-LM reporta mejoras en tareas de prediccion de eficiencia de traduccion y estabilidad del ARN, pero esos datos no se han reproducido en esta ficha por no estar disponibles en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 1,2 millones de parametros, lo que supone aproximadamente 4,8 MB en fp32 y 2,4 MB en bf16. Incluso con overhead de activaciones y atencion, cabe en cualquier GPU moderna con mas de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU, incluidas las de gama de entrada como NVIDIA GTX 1650 o incluso CPUs. Para fine-tuning con lotes grandes, una GPU con 4 GB de VRAM es mas que suficiente.
- Compatibilidad con consumer GPU: si, absolutamente. El modelo es tan pequeno que puede ejecutarse en una Raspberry Pi con suficiente RAM.
- Opciones de despliegue: al ser un modelo de Transformers, puede usarse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama, aunque para un modelo de este tamano la inferencia directa con PyTorch es trivial. Tambien es compatible con HuggingFace Inference Endpoints.
- Latencia y throughput: no se han publicado mediciones oficiales, pero con 6 capas y 128 dimensiones de embedding, la inferencia de una secuencia de 100 nucleotidos deberia completarse en menos de 10 ms en una GPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo de preentrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UTR-LM-MLMSS (este) | 1,2 M | 1024 | MLM + estructura secundaria | GPL-3.0 | HuggingFace |
| UTR-LM-MLM | 1,2 M | 1024 | MLM | GPL-3.0 | HuggingFace |
| UTR-LM-MLMSI | 1,2 M | 1024 | MLM + regresion MFE | GPL-3.0 | HuggingFace |
| UTR-LM-MLMSISS | 1,2 M | 1024 | MLM + MFE + estructura secundaria | GPL-3.0 | HuggingFace |

Los tres modelos hermanos comparten la misma arquitectura y tamano, diferenciandose solo en el objetivo de preentrenamiento. El autor recomienda UTR-LM-MLMSI para tareas de eficiencia de traduccion y estabilidad, y UTR-LM-MLMSISS para tareas de vida media del ARN. Este modelo MLMSS es una opcion intermedia que incorpora informacion de estructura secundaria sin la regresion de energia libre minima (MFE). No se dispone de comparativas con otros modelos de ARN como RNA-FM o DNABERT en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo fue preentrenado con secuencias 5' UTR de solo cinco especies (humano, raton, pez cebra, *Drosophila* y levadura) mas una biblioteca sintetica; su rendimiento en UTRs de otras especies puede degradarse.
- Riesgo de alucinacion: al ser un modelo de MLM, puede predecir nucleotidos plausibles pero biologicamente incorrectos; no debe usarse para inferencias biologicas sin validacion experimental.
- Limitaciones de contexto: la ventana maxima es de 1022 nucleotidos, por lo que secuencias 5' UTR mas largas deberan truncarse o procesarse en fragmentos.
- Limitaciones de idioma: no aplica, pero el tokenizador requiere conversion de U a T; una U literal se convierte en `<unk>`, lo que puede degradar el rendimiento si no se preprocesa correctamente.
- Restricciones de licencia: GPL-3.0 implica que cualquier uso comercial o derivado debe publicar el codigo fuente bajo la misma licencia; esto puede ser restrictivo para aplicaciones propietarias.
- Cabeza de estructura secundaria omitida: este port no incluye la cabeza auxiliar de prediccion de estructura secundaria, por lo que no puede generar directamente anotaciones de estructura; solo se beneficia de la informacion de estructura aprendida durante el preentrenamiento.
- Verificacion limitada: la paridad se verifico con una unica configuracion de hardware y software; en otros entornos podrian aparecer diferencias numericas menores.

## Enlaces

- [HuggingFace: Taykhoom/UTR-LM-MLMSS](https://huggingface.co/Taykhoom/UTR-LM-MLMSS)
- [Repositorio GitHub original UTR-LM](https://github.com/a96123155/UTR-LM)
- [Paper en Nature Machine Intelligence](https://www.nature.com/articles/s42256-024-00823-9)
- [Documentacion de UTR-LM en MultiMolecule](https://multimolecule.danling.org/models/utrlm/)
- [Coleccion UTR-LM en HuggingFace](https://huggingface.co/collections/Taykhoom/utr-lm-6a173a96ae7c070c3a84ebb4)
