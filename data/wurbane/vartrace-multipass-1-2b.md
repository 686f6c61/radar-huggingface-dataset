# WUrbane/vartrace-multipass-1.2b

## Resumen

VarTrace multipass 1.2b es una colección de modelos de lenguaje de tipo causal publicada por el usuario WUrbane en Hugging Face. No se trata de un modelo único, sino de un repositorio que agrupa varios directorios de modelo completos, cada uno correspondiente a una configuración distinta de un experimento de ajuste fino (fine-tuning) denominado VarTrace multi-pass. El objetivo declarado es estudiar cómo afecta el número de pasadas de entrenamiento (1, 2, 4 y 8) y la elección del optimizador (AdamW frente a Muon) al resultado final, partiendo siempre de un modelo base preentrenado con AdamW o con Muon.

La relevancia del proyecto es fundamentalmente metodológica: sirve para comparar el efecto del optimizador en preentrenamiento y en ajuste fino bajo un mismo esquema de entrenamiento (VarTrace v1 E1). No se documentan capacidades de producto, ni datos de benchmarks, ni una licencia de uso, lo que lo sitúa como material de investigación más que como modelo listo para producción.

El tamaño del repositorio (32,1 GB) y la etiqueta `1.2b` del nombre sugieren un modelo de aproximadamente 1200 millones de parámetros, aunque la model card no lo confirma explícitamente ni detalla arquitectura, contexto o composición del dataset. La información disponible es escasa y se limita a la tabla de configuraciones de entrenamiento y al ejemplo de carga con `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere transformer causal por el uso de `AutoModelForCausalLM`, sin confirmar) |
| Parametros totales | no disponible (la etiqueta del nombre indica 1.2b, sin confirmar en la model card) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin variantes GGUF/AWQ/GPTQ documentadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base. Por la librería declarada (`transformers`) y la clase de carga (`AutoModelForCausalLM`), se trata de un modelo de lenguaje causal, pero no se especifican capa, atención, normalización ni vocabulario. Tampoco se indica el número de tokens de preentrenamiento ni la composición del corpus.

Lo que sí se documenta es el procedimiento de ajuste fino. Se parte de modelos base preentrenados con AdamW (`OptimizerStudy/adamw_*`) o con Muon (`OptimizerStudy/muon_*`) y se aplica el mismo esquema VarTrace v1 E1 durante 1, 2, 4 u 8 pasadas. Cada configuración usa un bloque con semilla de orden 20261023 y rotación k0, precisión de matmul tf32 y un learning rate principal distinto según el optimizador: 3e-05 para AdamW y 0.0003 para Muon en el ajuste fino (y 3e-06 cuando el preentrenamiento fue con Muon y el ajuste con AdamW). El número de pasos escala con las pasadas: 682 pasos para 1 pasada y 2728 para 4. Las ejecuciones de 1 pasada se hicieron en GPUs A800 y las de 4 pasadas en H100. No se menciona RLHF, DPO ni ninguna técnica de alineación.

## Capacidades

- Generación de texto autoregresiva mediante `AutoModelForCausalLM` y su tokenizador asociado.
- No se documentan capacidades específicas de razonamiento, código, matemáticas, visión o audio.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües ni idiomas cubiertos.
- No se documenta modo de razonamiento explícito (thinking mode) ni otras capacidades especiales.
- El propósito declarado es experimental: comparar optimizadores y número de pasadas, no ofrecer un asistente afinado para tareas concretas.

## Casos de uso

- Investigación sobre optimizadores: comparar AdamW y Muon en preentrenamiento y ajuste fino usando los distintos subdirectorios como puntos de control reproducibles.
- Estudio de escalado de pasadas: analizar cómo varía el modelo entre 1, 2, 4 y 8 pasadas con el mismo esquema VarTrace v1 E1.
- Reproducción de experimentos: cargar cada subcarpeta con `subfolder=` en `from_pretrained` para replicar exactamente una configuración (semilla 20261023, rotación k0).
- Análisis de estabilidad de entrenamiento: comparar learning rates (3e-05 frente a 0.0003) y su efecto en el modelo resultante.
- Base para ajuste fino posterior: usar cualquiera de los checkpoints como punto de partida en experimentos propios, siempre que la licencia (no disponible) lo permita.
- Docencia y divulgación: ilustrar el impacto de decisiones de entrenamiento en modelos de ~1.2b con un conjunto de variantes controladas.
- Evaluación comparativa interna: servir de línea base en estudios propios de calidad, siempre que se realicen las evaluaciones que el autor no publica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de ~1.2b en fp16, se necesitarían aproximadamente 2,4 GB solo para pesos, más memoria para activaciones y caché KV; en cuantización de 8 bits, alrededor de 1,2 GB, y en 4 bits, unos 0,6 GB. Estas cifras son estimaciones basadas en el tamaño nominal, no datos del autor.
- GPU recomendadas: el autor documenta entrenamiento en A800 (1 pasada) y H100 (4 pasadas); para inferencia no se indica hardware concreto.
- GPU de consumo: no confirmado, pero por tamaño nominal cabría en GPUs consumer con suficiente VRAM (por ejemplo, RTX 3090/4090 en fp16 o cuantizado), siempre que la arquitectura real coincida con el tamaño sugerido.
- Opciones de despliegue: `transformers` es la vía documentada; no se mencionan vLLM, llama.cpp, Ollama ni TGI, y no hay pesos GGUF publicados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye benchmarks ni modelos de referencia comparables, y el carácter experimental del repositorio (variantes de un mismo esquema de entrenamiento) dificulta una comparación directa con modelos de producción de tamaño similar.

## Limitaciones y advertencias

- La model card no especifica licencia; no se puede asumir uso comercial permitido.
- No se documentan idiomas, sesgos, datos de entrenamiento ni evaluación de calidad, por lo que el riesgo de alucinación y de comportamiento indeseado es desconocido.
- No hay información sobre longitud de contexto, lo que impide planificar tareas de contexto largo.
- El repositorio contiene varios subdirectorios; cargar el modelo sin indicar `subfolder` puede fallar o dar resultados inesperados.
- El tamaño del repo (32,1 GB) sugiere que incluye varias copias de los pesos; conviene descargar solo el subdirectorio necesario.
- Las fechas de creación y actualización (noviembre de 2026) y el esquema de nombres sugieren un experimento de investigación reciente, sin validación externa conocida.
- No hay garantía de que el modelo sea adecuado para producción: es material experimental de comparación de optimizadores.

## Enlaces

- Hugging Face: https://huggingface.co/WUrbane/vartrace-multipass-1.2b
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos.
