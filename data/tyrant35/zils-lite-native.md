# tyrant35/zils-lite-native

## Resumen

zils-lite-native es un modelo de decisión derivado de `joamCriff123/zils-lite-l1117a`, publicado por el usuario tyrant35 en Hugging Face. Se trata de un "soup-pool body" de la familia Zils `d3-lite`: el autor parte del cuerpo del soup existente y le aplica un ajuste fino mediante LoRA sobre tareas de decisión con etiquetas exactas, combinando después los pesos resultantes con el modelo base en una proporción de 1,5 veces el delta del ajuste. El resultado es un checkpoint de aproximadamente 853 millones de parámetros (852.985.920 según los safetensors) en formato safetensors, con un repositorio de 1,7 GB.

El modelo está orientado a tareas de decisión y clasificación sobre familias de datos concretas: aritmética calculada y consultas de atributos, conteo de sílabas sobre CMUdict, PIQA, CxC (Choice of Plausible Alternatives), 20 Newsgroups y UniMorph. No es un modelo generativo de propósito general, sino un cuerpo especializado en resolver decisiones con etiqueta exacta dentro de esos dominios, mezclando el ajuste supervisado con las respuestas propias del soup sobre datos de decisión públicos.

Su relevancia es limitada y muy específica: se publica bajo licencia Apache 2.0, sin descargas ni interacciones registradas, y sin model card extendida más allá de la descripción del proceso de mezcla. Es útil para quien quiera reproducir o inspeccionar la técnica de "soup + LoRA delta escalado" aplicada a modelos de decisión pequeños, pero no dispone de documentación sobre idiomas, contexto, cuantizaciones ni evaluación comparativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de decisión de la familia Zils `d3-lite`; no se detalla la arquitectura interna) |
| Parametros totales | 852.985.920 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se proporciona información sobre la arquitectura interna del modelo base `joamCriff123/zils-lite-l1117a` ni sobre el tipo de transformer, atención o mecanismo de decisión empleado. La model card solo describe el procedimiento de construcción: se toma el cuerpo del soup `d3-lite` actual y se le suma 1,5 veces el delta de un ajuste fino LoRA realizado sobre ese mismo cuerpo. El ajuste fino se entrenó con casos de etiqueta exacta para las familias nativas de los soup pools: aritmética calculada y consultas de atributos, conteo de sílabas de CMUdict, PIQA, CxC, 20 Newsgroups y UniMorph. Además, se mezcló con las respuestas propias del soup sobre datos de decisión públicos.

El resultado es, por tanto, un modelo de decisión especializado por mezcla de pesos (weight souping) más un delta LoRA escalado, no un modelo entrenado desde cero ni un fine-tune convencional. No se detallan el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo RLHF, DPO u otras etapas de alineamiento. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Resolución de decisiones con etiqueta exacta en tareas de aritmética calculada y consultas de atributos.
- Conteo de sílabas basado en CMUdict.
- Respuesta a tareas de PIQA (razonamiento físico de sentido común).
- Respuesta a tareas de CxC (Choice of Plausible Alternatives).
- Clasificación en 20 Newsgroups.
- Tareas morfológicas de UniMorph.
- Mezcla de respuestas propias del soup sobre datos de decisión públicos (sin detalle de qué dominios adicionales cubre).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Evaluación de técnicas de weight souping: el modelo sirve como caso de estudio reproducible de la combinación "cuerpo soup + delta LoRA escalado ×1,5", útil para investigadores que quieran medir el efecto de este procedimiento sobre un modelo de decisión pequeño.
- Clasificación de documentos en 20 Newsgroups: puede emplearse como clasificador especializado en las categorías de este corpus, aprovechando que el ajuste incluyó casos de etiqueta exacta de esa familia.
- Razonamiento de sentido común físico (PIQA): adecuado para experimentos de evaluación sobre preguntas de plausibilidad física, dado que PIQA forma parte de las familias nativas del ajuste.
- Razonamiento causal alternativo (CxC): útil en pipelines de evaluación de plausibilidad causal, donde el modelo ha sido ajustado con etiquetas exactas de esa tarea.
- Análisis morfológico (UniMorph): puede integrarse en herramientas de procesamiento lingüístico que necesiten decisiones morfológicas sobre las lenguas cubiertas por UniMorph en el entrenamiento.
- Conteo de sílabas para métricas de texto: aplicable en herramientas de análisis métrico o de legibilidad que requieran conteo silábico basado en CMUdict.
- Aritmética y consultas de atributos como componente de decisión: puede usarse como módulo de respuesta cerrada en sistemas que necesiten resolver operaciones aritméticas o búsquedas de atributos con etiqueta exacta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 852.985.920 parámetros, en precisión completa (fp32) serían necesarios aproximadamente 3,4 GB solo para pesos; en fp16/bf16, unos 1,7 GB; en cuantización de 8 bits, unos 0,85 GB; en 4 bits, unos 0,43 GB. Estas cifras son estimaciones por tamaño de parámetros, no datos publicados por el autor.
- GPU recomendadas: no disponible. Por tamaño, el modelo cabría en GPUs de consumo como RTX 3060 (12 GB), RTX 4070, RTX 4090 o superiores en cualquiera de las precisiones habituales.
- Cabe en GPU de consumo: sí, por el tamaño de parámetros indicado, aunque no hay confirmación oficial del autor.
- Opciones de despliegue: no disponible. Solo se publican pesos safetensors; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma familia o categoría con datos de parámetros, contexto, rendimiento, licencia y disponibilidad que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Modelo de decisión especializado: no está pensado como modelo generativo de propósito general; su uso fuera de las familias de tareas del ajuste (aritmética, atributos, CMUdict, PIQA, CxC, 20 Newsgroups, UniMorph) no está documentado.
- Sin información sobre sesgos: no se documentan sesgos conocidos ni evaluaciones de equidad.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo de decisión, el riesgo se traslada a etiquetas incorrectas en dominios no cubiertos por el ajuste.
- Idiomas y contexto desconocidos: no se especifican los idiomas soportados ni la longitud de contexto, lo que impide garantizar su comportamiento en producción multilingüe o con entradas largas.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base `joamCriff123/zils-lite-l1117a` debería verificarse por si impone condiciones adicionales.
- Sin métricas publicadas: no hay benchmarks ni evaluaciones que respalden el rendimiento, por lo que cualquier uso en producción requiere validación propia.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, sin comunidad ni soporte documentado.
- Proceso de construcción poco documentado: no se detallan hiperparámetros del LoRA, datos exactos de entrenamiento ni el procedimiento de mezcla más allá del factor 1,5.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tyrant35/zils-lite-native
- Modelo base: https://huggingface.co/joamCriff123/zils-lite-l1117a
