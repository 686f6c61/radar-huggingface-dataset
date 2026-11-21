# tabisai/tabis1.1-4b-experimental

## Resumen

TABIS 1.1 4B Experimental es un ajuste fino experimental del modelo Qwen/Qwen3.5-4B orientado a la lengua sajá (sakha/yakut), desarrollado por el usuario tabisai. El modelo parte de una base de 4.205.751.296 parámetros y aplica un preentrenamiento continuado (CPT) sobre un corpus en sajá, seguido de un SFT conversacional con perfil de "sensibilidad humana". Su objetivo es dotar a un modelo generalista de capacidades de generación de texto y diálogo en sajá, un idioma de bajos recursos, manteniendo el ruso como lengua de apoyo.

La relevancia del modelo reside en su enfoque: adaptación lingüística de un modelo compacto mediante QLoRA de 4 bits, con un corpus de aproximadamente 355 millones de tokens y un conjunto de diálogos de 7.500 ejemplos. El autor lo publica de forma explícita como versión inacabada y experimental, compartiendo pesos en safetensors y GGUF (F16, BF16, Q4_K_M) bajo licencia Apache 2.0. No se han publicado resultados de benchmarks formales ni una evaluación independiente por hablantes nativos.

Se trata, por tanto, de un artefacto de investigación para experimentación con lenguas minoritarias, no de un modelo listo para producción. La model card advierte de que la muestra de prueba es de cinco preguntas por formato y que el modelo puede alucinar, identificarse erróneamente como GPT-4 o confundir su origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen/Qwen3.5-4B); no se detalla la arquitectura interna en la informacion disponible |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (el entrenamiento uso secuencias de hasta 1024 tokens) |
| Tipos de cuantizacion | F16, BF16, Q4_K_M (GGUF); base de entrenamiento en NF4 |
| Idiomas soportados | sajá (sah), ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF (F16, BF16, Q4_K_M) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3.5-4B mediante un proceso en dos etapas. Primero, un preentrenamiento continuado (CPT) sobre un fragmento limpio del corpus ailabykt/sakha-corpus-mono: 216.022 documentos de entrenamiento (354.822.906 tokens con EOS) y 3.298 documentos de validación (4.805.554 tokens), con un solo paso de 57.446 iteraciones. Se añadieron 110 tokens nuevos al tokenizador, entrenando sus embeddings adicionales y un adaptador. Después, un SFT conversacional de "sensibilidad humana" con 9.678 diálogos de entrenamiento y 503 de validación (7.055 ejemplos de tabisai/tabis-sakha-dialogues-7500 y 2.623 de candidatos previos), 1.210 pasos y entrenamiento únicamente sobre las respuestas del asistente.

El método de ajuste es QLoRA con base cuantizada en 4 bits, LoRA de r=16 y alpha=32, longitud de secuencia máxima de 1024, AdamW de 8 bits y batch efectivo de 8. En CPT se usó microbatch 4 con acumulación 2 y learning rate 5e-5; en SFT, microbatch 1 con acumulación 8 y learning rate 2e-5. El entrenamiento se realizó en una RTX 4090 modificada de 48 GB. Para la exportación, la base NF4 se convirtió a BF16, se fusionó con el adaptador final y se exportó a GGUF F16 y BF16; Q4_K_M se derivó de F16. El autor reporta una diferencia máxima de logits de 0,0015 tras el merge y de 0,4998 entre la NF4 original y la desquantizada en un prompt de control, y advierte que no es una verificación completa de equivalencia.

Métricas de validación reportadas: CPT de 3,2939 a 1,3484; SFT de 1,5703 a 1,1401. El propio autor señala que la loss no mide naturalidad conversacional ni veracidad.

## Capacidades

- Generación de texto y diálogo conversacional en sajá, con soporte de ruso como lengua secundaria.
- Respuesta a preguntas factuales y culturales sobre sajá (en la prueba mínima identificó correctamente el Ýsyakh).
- Aritmética básica (resolvió correctamente una suma de 375 rublos en la prueba del autor).
- Conversación multi-turno (el SFT se entrenó sobre diálogos).
- Compatibilidad con endpoints (tag `endpoints_compatible` en Hugging Face).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta visión, audio ni otras modalidades.
- Modo thinking: el autor recomienda desactivarlo explícitamente.

## Casos de uso

- Experimentación lingüística con lenguas de bajos recursos: el modelo sirve como base para investigar adaptación de modelos compactos al sajá mediante CPT + SFT, comparando curvas de loss y calidad de generación.
- Generación de texto asistida en sajá para prototipos: redacción de borradores y respuestas conversacionales en entornos de prueba, siempre con revisión humana por la falta de evaluación por nativos.
- Investigación sobre tokenización de lenguas minoritarias: el añadido de 110 tokens al tokenizador y el entrenamiento de sus embeddings permiten estudiar el impacto en la eficiencia y calidad del modelado del sajá.
- Docencia y divulgación: demostraciones de ajuste fino con QLoRA en una única GPU consumer de gama alta (RTX 4090 de 48 GB) para audiencias técnicas.
- Punto de partida para ajustes posteriores: el adaptador SFT y los scripts de entrenamiento, merge y conversión publicados permiten reutilizar el pipeline para nuevos corpus o perfiles de diálogo.
- Evaluación comparativa de formatos de cuantización: los GGUF F16, BF16 y Q4_K_M permiten analizar diferencias de comportamiento entre precisiones en un modelo multilingüe pequeño.
- No se recomienda su uso en atención al cliente real, producción ni como fuente de datos verificados, dado el estado experimental y la ausencia de evaluación independiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta una prueba cualitativa de cinco preguntas por formato (F16, BF16, Q4_K_M), que califica como muestra demasiado pequeña para extraer conclusiones sobre calidad general o gramática. No se realizó YakutEval completo ni evaluación independiente por hablantes nativos.

| Metrica | Valor |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| YakutEval | no realizado |
| Prueba cualitativa del autor | 5 preguntas por formato (F16, BF16, Q4_K_M) |

## Requisitos de hardware

- VRAM estimada para inferencia en F16/BF16: aproximadamente 8,4 GB solo para pesos (4.205.751.296 parámetros × 2 bytes), más overhead de contexto y KV cache; en la práctica, en torno a 10-12 GB.
- VRAM estimada en Q4_K_M: aproximadamente 2,5-3 GB para pesos, más overhead; viable en GPUs de 6-8 GB.
- GPU recomendadas: RTX 4090 (24 GB) o superior para F16/BF16 con contexto amplio; RTX 3060/4060 Ti de 8-12 GB para Q4_K_M. El entrenamiento se hizo en una RTX 4090 modificada de 48 GB.
- Cabe en GPU consumer: sí, especialmente en Q4_K_M; F16/BF16 requiere al menos 12 GB para un contexto moderado.
- Opciones de despliegue: llama.cpp (los tres GGUF fueron verificados en GPU con llama.cpp), LM Studio (el autor indica desactivar "Enable Thinking"; no se verificó en LM Studio), y safetensors con frameworks compatibles con Qwen (no se documenta vLLM ni TGI).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| tabisai/tabis1.1-4b-experimental | 4.205.751.296 | no disponible | sah, ru | Apache 2.0 | Experimental, sin benchmarks publicados |
| Qwen/Qwen3.5-4B (base) | ~4B (no confirmado) | no disponible | multilingue (no detallado) | no disponible en la informacion | Modelo base generalista |
| Alternativas comparables en sajá | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos ajustados específicamente al sajá con los que comparar parámetros, contexto o rendimiento. La comparación con el modelo base solo puede establecerse a nivel de linaje, no de métricas.

## Limitaciones y advertencias

- Versión explícitamente inacabada y experimental; el autor la publica como resultado intermedio.
- Riesgo alto de alucinación: en la prueba del autor se identificó erróneamente como GPT-4, y la variante Q4 como empleada de Google.
- Evaluación insuficiente: cinco preguntas por formato, sin YakutEval completo ni validación por hablantes nativos.
- El corpus de CPT no está completamente verificado por humanos ni libre de errores de OCR; parte del material y posibles solapamientos con YakutEval se excluyeron, pero la limpieza no es total.
- Solo siete ejemplos de entrenamiento y dos de validación fueron corregidos por humanos; el conjunto no está verificado en su totalidad.
- Diferencias entre formatos de cuantización: F16 y BF16 dieron respuestas idénticas en la prueba, pero Q4_K_M difirió en algunos casos; la verificación de equivalencia tras el merge es parcial.
- Longitud de secuencia de entrenamiento limitada a 1024 tokens; el contexto efectivo de inferencia no está documentado.
- Cobertura lingüística restringida a sajá y ruso; no se garantiza un comportamiento correcto en otras lenguas.
- Licencia Apache 2.0 para el modelo, pero los derechos sobre los materiales de los corpus de origen deben verificarse por separado; los datos de entrenamiento no se incluyen en el repositorio.
- Los scripts publicados dependen de la estructura del proyecto original y no son un paquete autónomo.
- No apto para producción ni como fuente de datos verificados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tabisai/tabis1.1-4b-experimental
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de corpus: https://huggingface.co/datasets/ailabykt/sakha-corpus-mono
- Dataset de diálogos: https://huggingface.co/datasets/tabisai/tabis-sakha-dialogues-7500
