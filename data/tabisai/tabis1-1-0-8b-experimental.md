# tabisai/tabis1.1-0.8b-experimental

## Resumen

TABIS 1.1 0.8B es un ajuste fino experimental del modelo Qwen3.5-0.8B orientado al idioma sajá (sakha, yakut), una lengua minoritaria de Siberia. Lo desarrolla el autor independiente tabisai, que parte de los pesos de Qwen y adapta el modelo mediante un proceso en dos fases: continuación del preentrenamiento (CPT) sobre un corpus monolingüe en sajá y posterior ajuste supervisado (SFT) sobre diálogos, incluyendo un pequeño conjunto de correcciones humanas. El objetivo no es competir con modelos generalistas, sino ofrecer una alternativa local y ligera para conversación en un idioma con recursos escasos.

La relevancia del modelo está en su enfoque: un transformer denso de tan solo 752 millones de parámetros, ampliado con 110 tokens de vocabulario específicos para sajá, que puede ejecutarse localmente sin conexión a la nube tras la descarga. El autor declara abiertamente que es una versión incompleta y que se publica para permitir pruebas y desarrollo comunitario, no como producto terminado. Los pesos están disponibles en Safetensors y en tres variantes GGUF (F16, BF16 y Q4_K_M), con una licencia Apache 2.0 que permite uso comercial.

La ficha que sigue se basa exclusivamente en la información publicada por el autor en Hugging Face. No hay evaluación independiente por hablantes nativos ni resultados de benchmarks estándar, y el propio autor advierte que la calidad es irregular. Cualquier dato no documentado se marca como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5-0.8B) |
| Parametros totales | 752.393.024 (dato real de safetensors) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1024 tokens durante entrenamiento (contexto de inferencia no disponible) |
| Tipos de cuantizacion | F16, BF16, Q4_K_M (GGUF); adaptador QLoRA 4-bit disponible en `source/adapter/` |
| Idiomas soportados | Sah (sakha/yakut), ru (ruso) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16), GGUF (F16, BF16, Q4_K_M) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer denso de 752 millones de parámetros. El autor añade 110 tokens al tokenizador original para cubrir el sajá y entrena las filas de embeddings correspondientes junto con el adaptador. El entrenamiento se realiza con QLoRA sobre una base cuantizada a 4 bits (NF4), con `r=16`, `alpha=32`, contexto de 1024 tokens, batch 1 y acumulación de gradiente de 8. Para el CPT se usa un learning rate de 5e-5 y para el SFT de 2e-5, con optimizador AdamW de 8 bits. NEFTune no se emplea en esta versión.

La fase de CPT utiliza el corpus `ailabykt/sakha-corpus-mono`, con 216.022 documentos y 354.822.906 tokens (incluyendo EOS) en el split de entrenamiento, y 3.298 documentos con 4.805.554 tokens en validación. Se completa una época en 57.446 pasos, con reanudaciones desde checkpoints. La fase de SFT parte de 9.678 diálogos de entrenamiento y 503 de validación, tras descartar duplicados sospechosos; 7.055 provienen del conjunto sintético `tabisai/tabis-sakha-dialogues-7500` y 2.623 de candidatos previos. En la variante "Human sensitivity" solo siete ejemplos de entrenamiento y dos de validación fueron corregidos por humanos. El SFT dura una época, 1.210 pasos, y entrena únicamente las respuestas del asistente.

Los pesos finales se obtienen convirtiendo la base NF4 a BF16 y fusionándola con el adaptador. La pérdida de validación registrada baja de 4,1013 a 1,6447 en CPT y de 1,9337 a 1,5661 en SFT (train loss 1,6365). El propio autor subraya que la loss no mide naturalidad, veracidad ni calidad de diálogo, y que no constituye una evaluación lingüística válida.

## Capacidades

- Generación de texto y respuesta a peticiones simples en sajá, con salida de réplicas conversacionales cortas.
- Conversación multi-turno básica dentro de la ventana de contexto usada en entrenamiento (1024 tokens).
- Ejecución local sin conexión a la nube tras la descarga de los pesos.
- Soporte de modo "thinking" heredado de Qwen3.5, aunque el autor recomienda desactivarlo en LM Studio (interruptor "Enable Thinking").
- Capacidad multilingüe limitada: sajá y ruso; el autor no observa derivas al ruso en sus pruebas, pero advierte que la comprobación no es exhaustiva.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Asistente conversacional local en sajá: el modelo puede gestionar intercambios cortos y multi-turno dentro de 1024 tokens, útil para prototipos de interfaces en comunidades con conectividad limitada, siempre con revisión humana.
- Pruebas de investigación lingüística: sirve como banco de pruebas para estudiar cómo un modelo pequeño adaptado con CPT y SFT se comporta en una lengua de bajos recursos, comparando variantes de datos y correcciones humanas.
- Generación de borradores de diálogo para hablantes: puede producir réplicas iniciales que un hablante nativo revise y corrija, alimentando así futuras iteraciones del corpus.
- Despliegue en hardware modesto: con Q4_K_M (aproximadamente 505 MiB) puede ejecutarse en equipos sin GPU dedicada, lo que facilita demos y talleres educativos.
- Integración en LM Studio o llama.cpp: los GGUF permiten cargar el modelo en entornos de escritorio para evaluación rápida y comparación entre cuantizaciones.
- Filtrado y generación de datos sintéticos: el conjunto de diálogos usado en SFT sugiere que el modelo puede emplearse para ampliar corpus conversacionales en sajá, con control humano posterior.
- Base para futuros ajustes: al publicarse el adaptador y los pesos fusionados, otros desarrolladores pueden partir de esta versión para CPT o SFT adicionales con licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, YakutEval) en la informacion disponible. El autor menciona únicamente una comparación cualitativa pequeña: la variante "Human sensitivity" obtuvo la evaluación más favorable en cuatro preguntas básicas, sin que ello permita concluir superioridad general ni gramática correcta. También indica que el modelo no respondió con "Ysyakh" a una pregunta sobre la gran fiesta de verano sajá, y que puede fallar en matemáticas y tareas lógicas.

Los únicos datos cuantitativos publicados son las métricas de entrenamiento:

| Etapa | Loss de validación inicial | Loss de validación final | Notas |
|---|---:|---:|---|
| CPT | 4,1013 | 1,6447 | Una época, 57.446 pasos, con reanudaciones |
| SFT (Human sensitivity) | 1,9337 | 1,5661 | Una época, 1.210 pasos, train loss 1,6365 |

## Requisitos de hardware

- VRAM estimada: Q4_K_M ocupa aproximadamente 505 MiB en disco; F16 y BF16 alrededor de 1,41 GiB cada uno. La VRAM necesaria para inferencia no está documentada, pero por tamaño cabe en GPUs de consumo.
- GPU recomendadas: no disponibles en la información proporcionada. Por el tamaño del modelo (menos de 1.000 millones de parámetros), es razonable esperar ejecución en GPUs de consumo, pero el autor solo confirma pruebas en LM Studio con GPU para F16 y Q4, y en llama.cpp sobre CPU para BF16.
- Compatibilidad con GPU de consumo: el autor confirma carga y generación en LM Studio con GPU para F16 y Q4_K_M; BF16 se verificó en CPU mediante llama.cpp y no se probó en LM Studio.
- Opciones de despliegue: LM Studio y llama.cpp están confirmados por el autor. Otros entornos (vLLM, TGI, Ollama) no se mencionan en la información disponible.
- Latencia y throughput: no disponibles. El autor no publica mediciones de velocidad ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| TABIS 1.1 0.8B | 752 M | 1024 (entrenamiento) | sah, ru | Apache 2.0 | Safetensors + GGUF en Hugging Face |
| Qwen3.5-0.8B (base) | 800 M (aprox., según nombre) | No disponible en la información | No disponible en la información | No disponible en la información | Hugging Face (Qwen) |
| Alternativas específicas para sajá | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparación con el modelo base Qwen3.5-0.8B solo puede hacerse a nivel de linaje: TABIS añade 110 tokens de vocabulario y ajusta con CPT y SFT sobre sajá, pero no hay evaluación que cuantifique la mejora frente al base.

## Limitaciones y advertencias

- El autor califica el modelo como experimental e incompleto; se publica para pruebas y desarrollo, no como producto final.
- Puede responder de forma incoherente, evadir la pregunta, repetirse, confundir personas gramaticales e inventar con seguridad datos biográficos e históricos.
- El autor observa fallos concretos: no mencionó Ysyakh al preguntársele por la gran fiesta de verano sajá, y puede resolver mal matemáticas y tareas lógicas.
- No debe usarse como fuente verificada de hechos ni en aplicaciones donde la precisión sea crítica sin revisión humana.
- La evaluación no es independiente ni realizada por hablantes nativos, y no constituye un YakutEval completo; parte de las comparaciones previas fueron valoradas por GigaChat, que también puede equivocarse en sajá.
- El contexto de entrenamiento es de solo 1024 tokens; el contexto máximo de inferencia no está documentado, lo que limita conversaciones y documentos largos.
- Solo se documentan sajá y ruso; el soporte multilingüe más amplio no está verificado.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías de calidad; las respuestas del sitio web, los GGUF y las distintas cuantizaciones pueden diferir entre sí.
- El modo "thinking" debe desactivarse según recomendación del autor; dejarlo activo puede degradar la experiencia.
- El adaptador publicado requiere la base correspondiente y una configuración correcta para su uso; no es un modelo autónomo.

## Enlaces

- Hugging Face: https://huggingface.co/tabisai/tabis1.1-0.8b-experimental
- Dataset del corpus sajá: https://huggingface.co/datasets/ailabykt/sakha-corpus-mono
- Dataset de diálogos: https://huggingface.co/datasets/tabisai/tabis-sakha-dialogues-7500
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Métricas CPT: `evaluation/cpt_training_metrics_resumed.json` (en el repositorio del modelo)
- Métricas SFT: `evaluation/sft_training_metrics.json` (en el repositorio del modelo)
