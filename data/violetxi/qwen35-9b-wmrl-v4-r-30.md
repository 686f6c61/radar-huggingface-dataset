# violetxi/qwen35-9b-wmrl-v4-R-30

## Resumen

violetxi/qwen35-9b-wmrl-v4-R-30 es un ajuste fino completo (full-finetune) de Qwen/Qwen3.5-9B, publicado por el usuario violetxi como parte de un estudio de "internalización de mundo" (world-internalization) en su linaje v4. El checkpoint corresponde a la condición experimental etiquetada como R-30 y a la salvaguarda `final` del entrenamiento, realizado sobre un corpus sintético de un bufete de abogados ficticio denominado Calderwood & Harkness. No es, por tanto, un modelo de propósito general orientado a producto, sino un artefacto de investigación pensado para estudiar qué conocimiento adquiere y retiene un estudiante de 9B parámetros tras un entrenamiento supervisado sobre un dominio sintético cerrado.

El modelo conserva los 9.653.104.368 parámetros del modelo base (aproximadamente 9,65 mil millones) y se distribuye en formato safetensors, con un repositorio de 38,6 GB que sugiere pesos almacenados en precisión de 32 bits. La model card indica que los pesos entrenados se han reinjertado en el layout compuesto `Qwen3_5ForConditionalGeneration` del modelo base, de modo que el resultado sea servible directamente con vLLM sin modificaciones adicionales en el código de carga.

Su relevancia actual es acotada pero específica: sirve como punto de comparación reproducible frente al modelo base para medir transferencia, olvido catastrófico y sesgo inducido por un corpus sintético, además de como material de partida para experimentos posteriores de RLHF/DPO o de generación de datos sintéticos. No se han publicado evaluaciones, idiomas soportados ni detalles del dataset más allá de la referencia a un `train_summary.json` externo al repositorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. La model card indica que los pesos se han injertado en el layout compuesto `Qwen3_5ForConditionalGeneration`, heredado del modelo base Qwen/Qwen3.5-9B |
| Parametros totales | 9.653.104.368 (aproximadamente 9,65 mil millones) |
| Parametros activos | No aplica: no se documenta una arquitectura de mezcla de expertos (MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. No se publican variantes GGUF, AWQ ni GPTQ; el repositorio contiene pesos en safetensors |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-9B (relación declarada: finetune) |
| Tamaño del repositorio | 38,6 GB |
| Campos declarados en la model card | `graft`, `train_summary.json` (referenciado, no incluido en la información disponible) |
| Pipeline declarado | No disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-10 |
| Última actualización | 2026-09-10 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su identificador (`Qwen/Qwen3.5-9B`) y del layout compuesto `Qwen3_5ForConditionalGeneration` en el que se han injertado los pesos. La model card describe un full-finetune sobre el modelo base, con un estudiante de 9B parámetros y un conjunto de semillas de aproximadamente 50.000 ejemplos con "think-on" (es decir, con trazas de razonamiento habilitadas) dentro del linaje v4 del estudio. El corpus de entrenamiento es sintético y pertenece a un dominio jurídico ficticio (bufete Calderwood & Harkness). No se especifican el número total de tokens, la composición del dataset, la mezcla de idiomas ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineamiento posteriores al ajuste supervisado.

El detalle técnico más relevante documentado es el procedimiento de injerto (`graft`): 427 elementos del checkpoint entrenado se sustituyen en el snapshot del modelo base antes de la publicación, presumiblemente para recomponer el layout de pesos esperado por la clase `Qwen3_5ForConditionalGeneration`. La model card afirma que el resultado es servible con vLLM directamente. No se documenta ninguna innovación arquitectónica propia (atención lineal, decodificación especulativa, SSM híbrido, etc.) atribuible a este checkpoint: se trata de un ajuste de pesos sobre una arquitectura preexistente.

## Capacidades

- Generación de texto en el dominio del corpus de entrenamiento (documentación de un bufete de abogados sintético).
- Razonamiento con trazas explícitas ("think-on"): el pool de semillas del linaje v4 se describe como think-on, lo que sugiere entrenamiento sobre secuencias de razonamiento.
- Escritura y reformulación de texto con estilo jurídico sintético, como consecuencia directa del corpus Calderwood & Harkness.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte explícito de agentes ni de razonamiento multi-paso más allá de las trazas de pensamiento del corpus.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (visión, audio, modo thinking diferenciado, decodificación especulativa): no disponibles.
- Al ser un full-finetune de un modelo base de 9,65B, es probable que retenga parte de las capacidades generales del modelo base, pero no hay ninguna evaluación publicada que lo confirme.

## Casos de uso

- Investigación sobre internalización de conocimiento: comparar las respuestas del checkpoint frente al modelo base Qwen/Qwen3.5-9B sobre preguntas del dominio Calderwood & Harkness permite medir cuánta información del corpus sintético se ha absorbido y en qué forma.
- Estudio de olvido catastrófico: ejecutar baterías de evaluación generalistas (no publicadas para este modelo) sobre el checkpoint y sobre el base para cuantificar la degradación de capacidades fuera del dominio jurídico sintético.
- Generación de datos sintéticos de dominio legal: usar el modelo para producir borradores de cláusulas, memorandos o resúmenes en el estilo del corpus, que después puedan filtarse y reutilizarse en pipelines de destilación.
- Servicio interno de pruebas con vLLM: la model card indica que el checkpoint es servible con vLLM sin cambios de código, lo que permite desplegarlo en un endpoint interno para validación cualitativa en minutos.
- Línea base para alineamiento posterior: al ser una salvaguarda `final` de una condición concreta (R-30), sirve como punto de partida para fases posteriores de RLHF o DPO dentro del mismo estudio.
- Anexo reproducible de un artículo: el repositorio publica el identificador de la condición y las referencias de injerto, de modo que otros grupos pueden replicar el mismo estado de pesos para comparaciones controladas.
- Evaluación de sesgos inducidos por corpus sintético: analizar si el modelo reproduce convenciones, jerga o suposiciones del bufete ficticio y hasta qué punto las generaliza fuera de contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra batería, y no se han encontrado evaluaciones independientes en la búsqueda web realizada.

## Requisitos de hardware

Las cifras de VRAM que se indican a continuación son estimaciones derivadas del número de parámetros declarado (9,65 mil millones) y del tamaño del repositorio (38,6 GB), no requisitos publicados por el autor.

- Pesos en fp32 (formato en el que parece publicarse el repositorio): unos 38,6 GB solo de pesos; con caché KV y overhead de runtime, se recomienda un acelerador con 48-80 GB de VRAM.
- Pesos en bf16/fp16: aproximadamente 19,3 GB de pesos; requiere 24 GB de VRAM como mínimo y 32-48 GB para contextos largos con lotes moderados.
- Cuantización de 8 bits: aproximadamente 9,7 GB de pesos; cabe en GPU de 12-16 GB con margen limitado para la caché KV.
- Cuantización de 4 bits: aproximadamente 5,5-6,5 GB de pesos; cabe en GPU de consumo de 8-12 GB.
- GPU recomendadas: A100 40 GB u 80 GB, H100, L40S 48 GB para fp32 o bf16 con lotes grandes; RTX 4090 o RTX 3090 (24 GB) para bf16 en lotes pequeños o para 8 bits.
- GPU de consumo: sí es viable en tarjetas de 24 GB con bf16 y en tarjetas de 12-16 GB con cuantización de 4 a 8 bits.
- Opciones de despliegue: vLLM, confirmado explícitamente en la model card. También es razonable esperar compatibilidad con transformers y TGI al ser un checkpoint safetensors compatible con el layout del modelo base, aunque no se documenta. llama.cpp u Ollama requerirían convertir los pesos a GGUF, una variante que no se publica en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del checkpoint ni de otros ajustes comparables dentro del mismo estudio, por lo que la única comparación documentada es contra el modelo base.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| violetxi/qwen35-9b-wmrl-v4-R-30 | 9,65 mil millones | No disponible | apache-2.0 | HuggingFace, 0 descargas | Full-finetune sobre corpus jurídico sintético, condición R-30, salvaguarda `final` |
| Qwen/Qwen3.5-9B | 9,65 mil millones (heredados) | No disponible | No disponible en la información proporcionada | HuggingFace | Modelo base sin ajuste sobre el corpus sintético |
| Otros ajustes del linaje v4 del mismo autor | No disponible | No disponible | No disponible | No disponible | El identificador R-30 implica la existencia de otras condiciones, pero no se listan |

## Limitaciones y advertencias

- Corpus de entrenamiento sintético y de dominio muy cerrado (bufete de abogados ficticio), lo que puede inducir un sesgo fuerte hacia ese estilo y vocabulario, con posible degradación de capacidades generales fuera de ese dominio.
- No se han publicado evaluaciones de ningún tipo, ni por parte del autor ni por terceros, por lo que el rendimiento real es desconocido.
- Cero descargas y cero likes en el momento de la consulta: no existe validación por parte de la comunidad.
- Riesgo de alucinación elevado en cualquier uso jurídico real: el corpus es sintético y el modelo no ha sido validado contra normativa vigente ni jurisprudencia real. No debe usarse como fuente de asesoramiento legal.
- Idiomas soportados sin especificar; no hay garantía de comportamiento correcto en castellano ni en otros idiomas distintos del corpus de entrenamiento.
- Licencia apache-2.0 declarada para el ajuste, pero el uso comercial también queda sujeto a los términos del modelo base Qwen/Qwen3.5-9B, que no se detallan en la información proporcionada.
- La model card filtra rutas absolutas del clúster del autor (`/scratch/11457/ziyxiang/...`) en el campo `graft`, y no incluye el `train_summary.json` referenciado, por lo que la composición del dataset no es verificable desde el repositorio.
- El campo `graft` indica 427 elementos reemplazados sin especificar la unidad (tensores, claves o ficheros), lo que dificulta auditar la integridad del checkpoint publicado.
- Al ser una salvaguarda concreta de una condición experimental, no se documentan semillas, varianza entre ejecuciones ni criterios de selección frente a otras salvaguardas del mismo linaje.
- El tamaño del repositorio (38,6 GB para 9,65B parámetros) es coherente con pesos en fp32; conviene verificar el `config.json` antes de asumir un dtype concreto en el despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-R-30
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo, su linaje, el corpus Calderwood & Harkness ni el estudio de internalización de mundo v4. Los resultados devueltos corresponden a temas sin relación (traducción de texto en Windows, cuotas de proveedores de API y foros de soporte), por lo que no se incluyen.
