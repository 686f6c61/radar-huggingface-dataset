# tyrant35/zils-mini-v3b-x2

## Resumen

zils-mini-v3b-x2 es un modelo de lenguaje de aproximadamente 4.540 millones de parámetros publicado por el usuario tyrant35 en Hugging Face. Se trata de un experimento de fusión (model soup) construido sobre el modelo base joamCriff123/zils-mini-m1117b, al que se le aplica una extrapolación de un fine-tune LoRA de rango 32. La operación matemática descrita por el autor es "soup + 2 × (fine-tune − soup)", es decir, una extrapolación de la dirección de cambio que introduce el fine-tune sobre el modelo base.

El modelo se etiqueta como "decision-model" dentro de la familia "zils", lo que sugiere un enfoque hacia tareas de decisión y razonamiento sobre problemas con respuesta computable. El fine-tune subyacente se entrenó con casos de etiqueta exacta para familias nativas de los pools del soup: aritmética computada, búsquedas de atributos, recuento de sílabas con CMUdict, PIQA, CxC, 20 Newsgroups y UniMorph, además de problemas verbales cortos generados con respuesta calculada.

La relevancia de este modelo es fundamentalmente experimental: el autor lo describe explícitamente como un experimento para medir cómo responde el "round bank" de d3-mini a este tipo de cambio. No hay información publicada sobre benchmarks, idiomas soportados ni pipeline de uso, y el repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia zils; no se detalla en la informacion) |
| Parametros totales | 4.539.265.536 (4,54 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base joamCriff123/zils-mini-m1117b. El modelo se describe como un "soup-pool body" de la familia d3-mini, lo que indica que el punto de partida es una fusión de pesos (model soup) de la que no se especifican los componentes individuales ni el número de modelos fusionados. El autor no detalla si se trata de un transformer denso convencional u otra arquitectura.

El proceso de construcción de zils-mini-v3b-x2 parte del soup actual y aplica una extrapolación sobre un fine-tune LoRA de rango 32 (tyrant35/zils-mini-native). La fórmula es soup + 2 × (fine-tune − soup), una extrapolación que amplifica la dirección de cambio del fine-tune más allá de su magnitud original. El fine-tune se entrenó sobre casos de etiqueta exacta para las familias nativas de los pools del soup: aritmética computada y búsquedas de atributos, recuentos de sílabas con CMUdict, PIQA, CxC, 20 Newsgroups y UniMorph, además de problemas verbales cortos generados con respuesta calculada y las propias respuestas del soup sobre datos de decisión públicos. El autor indica explícitamente que no se usó ningún split de test o validación para el entrenamiento.

## Capacidades

- Generación de texto y razonamiento sobre problemas con respuesta computable, orientado por el entrenamiento en aritmética y búsquedas de atributos.
- Resolución de tareas de elección múltiple y decisión sobre datasets como PIQA, CxC y 20 Newsgroups, según la composición del fine-tune.
- Recuento de sílabas y tareas léxicas basadas en CMUdict.
- Morfología y análisis lingüístico mediante datos de UniMorph.
- Resolución de problemas verbales cortos con respuesta calculada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Evaluación de técnicas de model soup y extrapolación de LoRA: el modelo sirve como caso de estudio reproducible para medir el efecto de extrapolar un fine-tune LoRA de rango 32 sobre un cuerpo fusionado, comparando las respuestas del soup original frente a las del modelo extrapolado.
- Clasificación y decisión sobre 20 Newsgroups: el entrenamiento incluye esta familia de datos, por lo que el modelo puede emplearse para experimentar con clasificación temática de textos periodísticos dentro de un pipeline de investigación.
- Razonamiento físico básico estilo PIQA: adecuado para prototipos que requieran responder preguntas de sentido común físico sobre situaciones cotidianas, con la cautela de que no hay benchmarks publicados que validen su precisión.
- Aritmética y problemas verbales elementales: útil en entornos de investigación para probar la robustez de modelos pequeños en operaciones aritméticas con respuesta calculada, comparando el comportamiento antes y después de la extrapolación.
- Procesamiento léxico y morfológico: recuento de sílabas y análisis de formas verbales o nominales a partir de los datos de CMUdict y UniMorph incluidos en el entrenamiento, aplicable a herramientas lingüísticas experimentales.
- Investigación sobre sobreajuste y generalización: dado que el autor declara que no se usó split de validación, el modelo es un objeto de estudio adecuado para analizar cómo la extrapolación de un fine-tune sin validación afecta a la generalización en tareas de decisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9,1 GB solo para pesos (el tamaño del repo es de 9,1 GB), más overhead de activaciones y caché KV; en la práctica se recomienda al menos 12-16 GB de VRAM para contexto corto.
- Cuantización a 8 bits: en torno a 4,5-5 GB de pesos, viable en GPUs consumer de 8 GB con contexto limitado.
- Cuantización a 4 bits: en torno a 2,5-3 GB de pesos, viable en GPUs de 6-8 GB, aunque no se han publicado ficheros GGUF en el repositorio.
- GPU recomendadas: no hay recomendaciones publicadas por el autor. Por tamaño, cabría en RTX 3090, RTX 4090, A100 y H100; en GPUs consumer de gama media (RTX 3060 12 GB, RTX 4060 Ti 16 GB) solo con cuantización.
- Opciones de despliegue: al publicarse únicamente en safetensors, sería desplegable con vLLM, TGI o transformers; para llama.cpp u Ollama requeriría conversión a GGUF, no publicada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| tyrant35/zils-mini-v3b-x2 | 4,54 B | no disponible | Apache 2.0 | Extrapolación de LoRA sobre soup d3-mini; sin benchmarks |
| joamCriff123/zils-mini-m1117b | no disponible | no disponible | no disponible | Modelo base (soup) del que deriva |
| tyrant35/zils-mini-native | no disponible | no disponible | no disponible | Fine-tune LoRA rango 32 usado en la extrapolación |

No se dispone de información sobre modelos comparables de otros autores con datos verificables de rendimiento, contexto o licencia en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de rendimiento en MMLU, HumanEval, GSM8K ni ninguna otra tarea estándar.
- Entrenamiento sin split de validación: el autor declara explícitamente que no se usó test ni validación, lo que impide estimar la generalización y aumenta el riesgo de sobreajuste a las familias de datos de entrenamiento.
- Riesgo de alucinación: no evaluado; al ser un modelo pequeño orientado a decisiones con respuesta exacta, es probable que genere respuestas plausibles pero incorrectas fuera de las familias entrenadas.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento multilingüe ni siquiera en castellano.
- Contexto no documentado: se desconoce la longitud máxima de contexto, lo que dificulta planificar su uso en producción.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el modelo base y el fine-tune podrían tener condiciones adicionales no reflejadas en esta ficha; conviene verificar las licencias de joamCriff123/zils-mini-m1117b y tyrant35/zils-mini-native.
- Naturaleza experimental: el autor lo describe como un experimento para medir la respuesta del round bank de d3-mini, no como un modelo listo para producción.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tyrant35/zils-mini-v3b-x2
- Modelo base: https://huggingface.co/joamCriff123/zils-mini-m1117b
- Fine-tune LoRA referenciado: https://huggingface.co/tyrant35/zils-mini-native
