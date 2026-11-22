# SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2m-estate-sft-v1

## Resumen

El modelo `szl-receiptagent-qwen35-0.8b-v2m-estate-sft-v1` es un ajuste fino supervisado (SFT) publicado por SZLHOLDINGS sobre su propio checkpoint intermedio `szl-receiptagent-qwen35-0.8b-v2-merged`. Con 852.985.920 parámetros reales según los pesos en safetensors, se enmarca en la familia de modelos pequeños orientados a tareas de agente de recibos (*receipt agent*) dentro de lo que el autor denomina "governed-AI estate": un conjunto de artefactos con trazabilidad de origen y resultados verificables mediante ficheros de recibo (*receipts*).

El identificador sugiere una base derivada de la arquitectura Qwen 3.5 en su variante de 0,8 mil millones de parámetros, aunque la model card no documenta explícitamente ni la arquitectura interna ni los datos de entrenamiento. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y el idioma declarado es únicamente inglés. El repositorio ocupa 3,4 GB y se distribuye en formato safetensors para su carga con `transformers`.

Su relevancia actual es limitada pero concreta: se trata de un modelo pequeño, desplegable en hardware modesto, especializado en un dominio estrecho (procesamiento de recibos y tareas de agente asociadas) y con una filosofía de publicación que prioriza la verificabilidad de las afirmaciones sobre benchmarks por encima de las cifras de marketing. No obstante, la ausencia de métricas medidas en la propia model card limita seriamente cualquier evaluación comparativa por parte de terceros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `qwen3_5` en Hugging Face; detalles internos no documentados) |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. La etiqueta de Hugging Face `qwen3_5` y el nombre del checkpoint base (`szl-receiptagent-qwen35-0.8b-v2-merged`) apuntan a una familia derivada de Qwen 3.5 en tamaño de 0,8B, pero no se especifica si se trata de un transformer denso convencional, qué tipo de atención emplea ni si incorpora innovaciones como atención lineal o decodificación especulativa. Tampoco se detalla la composición del vocabulario ni la configuración de capas y cabezas.

Respecto al entrenamiento, el sufijo `sft` indica que esta versión corresponde a un ajuste fino supervisado sobre el checkpoint `v2-merged`, presumiblemente orientado a tareas de agente de recibos (*receipt agent*). No se publican en la model card el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF o DPO, ni hiperparámetros del ajuste. El autor remite explícitamente a los ficheros de recibo del "estate mesh" para cualquier afirmación de entrenamiento o evaluación, indicando que lo no registrado allí debe considerarse desconocido (UNKNOWN). Esta política de honestidad documental, aunque rigurosa en su formulación, deja al lector sin información técnica reutilizable directamente desde la ficha.

## Capacidades

- Generación de texto en inglés mediante pipeline `text-generation` con `transformers`.
- Especialización presumible en tareas de agente de recibos (*receipt agent*): extracción, interpretación o procesamiento de información de recibos, según se deduce del nombre del checkpoint.
- Ajuste fino supervisado sobre un checkpoint intermedio propio del autor, lo que sugiere adaptación a un dominio concreto más que capacidades generalistas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes multi-paso ni razonamiento multi-turno estructurado.
- No se documenta modo de razonamiento (*thinking mode*), visión, audio ni otras modalidades.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma declarada.

## Casos de uso

- Procesamiento automatizado de recibos: dado el nombre del checkpoint, el uso previsto es la interpretación o extracción de datos de recibos en inglés, aprovechando el ajuste SFT específico sobre el dominio.
- Clasificación o etiquetado de documentos de gasto: el modelo puede emplearse para categorizar recibos por tipo de comercio o concepto, siempre que se valide empíricamente su precisión en el dominio objetivo.
- Extracción de campos estructurados: con un prompt adecuado, podría emplearse para obtener importes, fechas o comercios de texto de recibos, aunque no se documenta soporte nativo de salidas estructuradas.
- Prototipado rápido en local: con 853 millones de parámetros y licencia Apache 2.0, es adecuado para experimentación en entornos con recursos limitados antes de escalar a modelos mayores.
- Componente en pipelines de agentes de gastos: podría integrarse como módulo especializado de un sistema mayor de contabilidad o gestión de gastos, siempre que se verifique su comportamiento en producción.
- Evaluación comparativa de ajustes SFT: útil para investigadores que estudien el efecto del ajuste fino supervisado sobre checkpoints pequeños en dominios estrechos, dado que el autor publica el checkpoint base `v2-merged` de forma separada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se afirma ninguna cifra de benchmark más allá de lo que una auditoría fechada haya medido, y que las afirmaciones de entrenamiento y evaluación residen en ficheros de recibo externos no incluidos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,7 GB solo para pesos (852.985.920 parámetros × 2 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: en torno a 0,9 GB para pesos; en 4 bits, aproximadamente 0,45 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4-6 GB de VRAM debería ser suficiente en FP16 para contextos moderados; RTX 3060, RTX 4060, RTX 4090 o superiores son opciones holgadas. En entornos de servidor, A100 o H100 no son necesarias para este tamaño.
- Cabe en GPU consumer: sí, con margen amplio en la mayoría de tarjetas con 6 GB o más.
- Opciones de despliegue: `transformers` de forma nativa (formato safetensors); vLLM, TGI, llama.cpp u Ollama requerirían conversión previa a los formatos correspondientes, no documentada por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| szl-receiptagent-qwen35-0.8b-v2m-estate-sft-v1 | 852.985.920 | no disponible | Apache 2.0 | en | SFT especializado en dominio de recibos |
| Qwen 2.5 0.5B / 1.5B (referencia de familia) | 0,5B / 1,5B | 32K (según versión) | Apache 2.0 | multilingüe | Modelos base generalistas; comparación orientativa, no verificada contra este artefacto |
| SmolLM2 1.7B | 1,7B | 8K | Apache 2.0 | en (principalmente) | Alternativa pequeña generalista |
| Llama 3.2 1B | 1,2B | 128K | Llama 3.2 Community License | multilingüe | Requiere aceptar licencia; no Apache 2.0 |

La comparación con modelos de la familia Qwen es orientativa: la model card no confirma que la arquitectura interna coincida exactamente con Qwen 3.5 ni que el tokenizador sea compatible. No se dispone de benchmarks que permitan comparar rendimiento real frente a estas alternativas.

## Limitaciones y advertencias

- Ausencia total de métricas de evaluación publicadas: no es posible verificar la calidad del ajuste SFT ni compararlo con alternativas sin ejecutar evaluaciones propias.
- La model card remite a ficheros de recibo externos para cualquier afirmación de entrenamiento; si esos ficheros no están accesibles, la información técnica es prácticamente nula.
- Idioma limitado al inglés: no se debe esperar un rendimiento fiable en castellano u otros idiomas.
- Dominio estrecho: el ajuste SFT sobre tareas de recibos puede degradar capacidades generalistas del checkpoint base; no se recomienda como modelo de propósito general.
- Riesgo de alucinación: inherente a modelos de este tamaño, especialmente en extracción de datos numéricos o fechas de documentos; requiere validación en producción.
- Sesgos conocidos: no documentados, pero al ser un ajuste sobre un dominio financiero concreto, puede heredar sesgos del dataset de entrenamiento no especificado.
- Licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero el autor no ofrece garantías sobre el comportamiento del modelo en producción.
- No se documentan variantes cuantizadas oficiales, lo que obliga a convertir los pesos si se desea desplegar con llama.cpp u Ollama.
- Fecha de creación (2026-11-05) y actualización (2026-11-20) recientes; el ecosistema de herramientas en torno al modelo puede ser aún inmaduro.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2m-estate-sft-v1
- Checkpoint base: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2-merged
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub (referenciada en la model card): https://github.com/szl-holdings
- Repositorio de la herramienta de generación de fichas: https://github.com/szl-holdings/estate-cards
