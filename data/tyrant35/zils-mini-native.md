# tyrant35/zils-mini-native

## Resumen

zils-mini-native es un modelo de decisión (decision-model) publicado por el usuario tyrant35 en Hugging Face, derivado del modelo base joamCriff123/zils-mini-m1117b. Se trata de un fine-tune mediante fusión de un LoRA de rango 32 sobre lo que el autor denomina "soup-pool body" del modelo d3-mini, es decir, una variante construida por mezcla de pesos (model soup) y posteriormente ajustada. El modelo cuenta con aproximadamente 4.540 millones de parámetros almacenados en formato safetensors y se distribuye bajo licencia Apache 2.0.

El objetivo declarado del modelo es resolver tareas de decisión con etiquetas exactas: aritmética computada, consultas de atributos, conteo de sílabas sobre CMUdict, clasificación en PIQA, CxC y 20 Newsgroups, y morfología con UniMorph. Para preservar el comportamiento previo del modelo base, el entrenamiento incorpora además las propias respuestas del soup sobre datos públicos de decisión, junto con problemas verbales cortos generados con respuesta computada.

La relevancia de este modelo es limitada y muy específica: se publica con cero descargas y cero likes, sin model card detallada más allá de una descripción breve, y sin resultados de benchmarks. Resulta útil únicamente como artefacto experimental para quienes investiguen técnicas de model soup, fusión de LoRA y ajuste sobre tareas de decisión con etiquetas exactas, no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo derivado por fusión de LoRA rango 32 sobre un model soup; arquitectura del base no especificada) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base (joamCriff123/zils-mini-m1117b) ni del soup d3-mini sobre el que se construye. Lo que sí se especifica es el procedimiento de ajuste: se trata de un fine-tune mediante un LoRA de rango 32 fusionado (merged) sobre el cuerpo del soup, lo que da como resultado un checkpoint denso de aproximadamente 4.540 millones de parámetros en safetensors.

El conjunto de entrenamiento combina varias fuentes: casos con etiqueta exacta de las familias nativas del soup (aritmética computada y consultas de atributos, conteo de sílabas de CMUdict, PIQA, CxC, 20 Newsgroups y UniMorph), problemas verbales cortos generados con respuesta computada, y las respuestas del propio soup sobre datos públicos de decisión para conservar el resto de su comportamiento. No se indican el número de tokens de entrenamiento, la composición porcentual del dataset, ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto y respuesta a problemas verbales cortos con respuesta computada.
- Aritmética computada y consultas de atributos con etiqueta exacta.
- Conteo de sílabas basado en CMUdict.
- Clasificación y decisión sobre PIQA, CxC y 20 Newsgroups.
- Morfología y análisis lingüístico con UniMorph.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Evaluación de técnicas de model soup y fusión de LoRA: el checkpoint permite reproducir y analizar cómo un LoRA de rango 32 fusionado altera el comportamiento de un soup base en tareas de decisión con etiqueta exacta.
- Clasificación de textos cortos en categorías fijas: adecuado para experimentos con 20 Newsgroups y CxC, donde el modelo fue ajustado con etiquetas exactas y puede emplearse como clasificador de referencia en pipelines de investigación.
- Resolución de problemas aritméticos verbales: útil para probar la consistencia entre el razonamiento textual y la respuesta computada en problemas cortos generados durante el entrenamiento.
- Conteo de sílabas y tareas lingüísticas: puede integrarse en prototipos de análisis métrico o fonológico que requieran conteo silábico alineado con CMUdict.
- Análisis morfológico con UniMorph: sirve como base para experimentos de etiquetado morfológico en entornos de investigación lingüística.
- Estudio de retención de comportamiento tras fine-tuning: al incluir las respuestas del soup sobre datos públicos, el modelo permite medir cuánto del comportamiento original se conserva tras la fusión del LoRA.
- Razonamiento físico básico con PIQA: útil como banco de pruebas para evaluar decisiones sobre situaciones físicas cotidianas en modelos de tamaño medio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 9 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 10 y 12 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: alrededor de 5 GB para pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 3 GB para pesos.
- GPU recomendadas: A100, H100 o L40S para despliegue en fp16 con contexto largo; RTX 4090, RTX 3090 o RTX A6000 para inferencia en fp16 con margen suficiente.
- GPU de consumo: cabe en GPUs consumer con 12 GB o más en fp16 (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090) y en GPUs de 8 GB con cuantización de 8 o 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama si se generan pesos GGUF (no se distribuyen en el repo); transformers para carga directa de safetensors.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| tyrant35/zils-mini-native | 4.539.265.536 | no disponible | apache-2.0 | Hugging Face, 0 descargas | Fine-tune de decisión sobre soup, sin benchmarks |
| joamCriff123/zils-mini-m1117b | no disponible | no disponible | no disponible | Hugging Face (modelo base) | Base del fine-tune; sin datos públicos de rendimiento |
| Modelos de ~4-5B de propósito general | ~4-5B | variable | variable | Hugging Face | No se dispone de comparación numérica fiable con este modelo |

No se dispone de datos de rendimiento del modelo ni de alternativas directamente comparables dentro de la misma familia Zils, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Modelo experimental con cero descargas y cero likes; no hay evidencia de validación por parte de la comunidad.
- No se han publicado benchmarks, por lo que el rendimiento real en las tareas declaradas es desconocido.
- La model card es mínima y no especifica arquitectura, contexto, idiomas ni composición exacta del dataset.
- Riesgo de alucinación no evaluado; al ser un modelo de decisión ajustado con etiquetas exactas, puede fallar fuera de la distribución de las familias nativas del soup.
- No se documentan sesgos conocidos; al entrenarse sobre datasets como 20 Newsgroups o CxC, puede heredar sesgos presentes en esos corpus.
- Limitaciones de idioma y contexto: no disponibles; no se garantiza soporte multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación de calidad desaconseja su uso en producción sin validación previa.
- El modelo depende de un base (joamCriff123/zils-mini-m1117b) cuya licencia y condiciones no se detallan en la información disponible; conviene verificarlas antes de un uso comercial.

## Enlaces

- Hugging Face: https://huggingface.co/tyrant35/zils-mini-native
- Modelo base: https://huggingface.co/joamCriff123/zils-mini-m1117b
