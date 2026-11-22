# Walltim3/lfm3-1.7b-sweep-sft

## Resumen

`Walltim3/lfm3-1.7b-sweep-sft` es un fine-tune experimental del modelo base `LiquidAI/LFM3-1.7B-Base`, desarrollado por el usuario independiente Walltim3. El objetivo declarado es especializar un modelo pequeno (1.728.801.536 parametros, aproximadamente 1,7 mil millones) en tareas de autocompletado de codigo y prediccion de "next-edit" al estilo del editor Zed, es decir, anticipar la siguiente modificacion del codigo que el desarrollador va a realizar. El repositorio se organiza por etiquetas git, donde cada etiqueta corresponde a una ejecucion de entrenamiento distinta.

El modelo se distribuye bajo la LFM Open License v1.0, la misma licencia del modelo base de Liquid AI, que incluye un umbral de uso comercial. El autor advierte explicitamente de que no esta afiliado ni respaldado por Liquid AI y de que se trata de un trabajo en curso sin garantias de calidad. La model card cataloga tres variantes: una de chat-format code SFT ya publicada (etiqueta `code-sft`, entrenada con 36.000 soluciones de KodCode-V1 y por tanto restringida a uso no comercial por la licencia CC BY-NC 4.0 de dichos datos), y dos variantes planificadas (`code-fim` y `sweep-sft-*`) que se entrenarian con ficheros y commits de licencia permisiva de `bigcode/commitpack`.

La relevancia actual del proyecto reside en su enfoque: modelos pequenos y especializados en flujos de edicion de codigo (fill-in-the-middle y next-edit prediction) que puedan ejecutarse en hardware modesto, en lugar de competir en capacidades generales. El repositorio ocupa 681,2 GB, lo que sugiere la presencia de multiples checkpoints y artefactos de entrenamiento intermedios, y acumula 3.484 descargas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del modelo base LiquidAI/LFM3-1.7B-Base; no se detalla en la informacion proporcionada) |
| Parametros totales | 1.728.801.536 (dato real de safetensors) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio incluye artefactos en formato GGUF, pero no se detallan las variantes) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (con umbral de uso comercial); la variante `code-sft` queda restringida a uso no comercial por los datos de entrenamiento (KodCode, CC BY-NC 4.0) |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base `LiquidAI/LFM3-1.7B-Base` (tipo de transformer, atencion, tokenizador, etc.), por lo que este apartado se limita a lo documentado sobre el proceso de ajuste. El fine-tune se realizo mediante SFT (supervised fine-tuning) sobre el modelo base, con distintas ejecuciones identificadas por etiquetas git. La variante `code-sft` se entreno en formato de chat sobre 36.000 soluciones de KodCode-V1. Las variantes planificadas `code-fim` y `sweep-sft-*` se entrenarian sobre codigo en bruto con formato fill-in-the-middle (disposicion `qwen` de Zed) y sobre commits en el formato de prompt `sweep` de Zed, respectivamente, usando ficheros y commits de licencia permisiva de `bigcode/commitpack`. No se especifican el numero total de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO. El autor atribuye el trabajo principalmente a "Opus 5.5" en los metadatos.

La carga de una variante concreta se realiza mediante `AutoModelForCausalLM.from_pretrained` con el parametro `revision` apuntando a la etiqueta git correspondiente y `trust_remote_code=True`. El directorio `checkpoints/` contiene estados intermedios de entrenamiento.

## Capacidades

- Generacion de codigo en formato conversacional (variante `code-sft`).
- Relleno de codigo (fill-in-the-middle) segun la disposicion `qwen` de Zed (variante `code-fim`, planificada).
- Prediccion de la siguiente edicion en el formato de prompt `sweep` de Zed (variantes `sweep-sft-*`, planificadas).
- Generacion de texto en general, al derivar de un modelo causal de lenguaje.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, modo thinking): no disponible en la informacion proporcionada.

## Casos de uso

- Autocompletado de codigo en editores: la variante `code-fim` esta disenada para insertar codigo en huecos del contexto (fill-in-the-middle con disposicion `qwen` de Zed), lo que la hace adecuada para sugerencias inline mientras se escribe, con un coste computacional bajo al tratarse de un modelo de 1,7 mil millones de parametros.
- Prediccion de la siguiente edicion en el editor Zed: las variantes `sweep-sft-*` se entrenan especificamente en el formato de prompt `sweep` de Zed, de modo que el modelo puede anticipar la modificacion que el desarrollador va a aplicar sobre un fragmento de codigo, agilizando refactorizaciones y correcciones repetitivas.
- Asistente de codigo en formato conversacional: la variante `code-sft`, entrenada sobre soluciones de KodCode-V1, puede emplearse en un chat tecnico para resolver problemas de programacion, siempre respetando su restriccion de uso no comercial.
- Despliegue en estaciones de trabajo sin GPU de datacenter: con 1,7 mil millones de parametros y pesos disponibles en GGUF, el modelo puede ejecutarse en hardware de consumo, lo que permite integrarlo en herramientas locales de desarrollo sin enviar codigo a servicios externos.
- Prototipado e investigacion sobre next-edit prediction: al publicarse cada ejecucion como etiqueta git y conservarse los checkpoints intermedios, el repositorio sirve como base para experimentar con tecnicas de SFT aplicadas a flujos de edicion de codigo.
- Evaluacion comparativa de modelos pequenos para tareas de codigo: el modelo permite medir hasta que punto un modelo de 1,7 mil millones de parametros especializado puede cubrir tareas de completado y edicion frente a modelos generalistas de mayor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano, un modelo de 1,728 mil millones de parametros en FP16 requiere aproximadamente 3,5 GB solo para los pesos, y en cuantizacion de 4 bits alrededor de 1 GB; estas cifras son estimaciones por tamano, no datos publicados por el autor.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del modelo y la disponibilidad de pesos GGUF, aunque no se especifican modelos concretos ni requisitos oficiales.
- Opciones de despliegue: la model card documenta carga mediante `transformers` con `trust_remote_code=True`; la presencia de artefactos GGUF sugiere compatibilidad con runtimes de ese formato, aunque no se detallan en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparativa se limita a caracteristicas estructurales frente a alternativas del mismo orden de tamano orientadas a codigo.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Walltim3/lfm3-1.7b-sweep-sft | 1,728 mil millones | no disponible | SFT para FIM y next-edit (Zed) | LFM Open License v1.0 (variante `code-sft` no comercial) | Hugging Face, safetensors y GGUF |
| LiquidAI/LFM3-1.7B-Base | 1,7 mil millones (aproximado) | no disponible | Modelo base generalista | LFM Open License v1.0 | Hugging Face |
| Alternativas de ~1-2B especializadas en codigo | no disponible | no disponible | no disponible | no disponible | no disponible |

No se conocen en la informacion proporcionada otros fine-tunes comparables de next-edit prediction sobre esta misma base.

## Limitaciones y advertencias

- Proyecto experimental y trabajo en curso: el autor declara explicitamente que no ofrece garantias de calidad ni de idoneidad para ningun proposito.
- La variante `code-sft` se entreno con KodCode-V1, distribuido bajo CC BY-NC 4.0, por lo que queda restringida a uso no comercial; las variantes planificadas con datos permisivos no estan publicadas segun la informacion disponible.
- La LFM Open License v1.0 incluye un umbral de uso comercial que debe revisarse antes de cualquier despliegue en produccion.
- No es un producto oficial de Liquid AI ni esta respaldado por la compania.
- No se dispone de informacion sobre sesgos, tasas de alucinacion, cobertura idiomatica ni longitud de contexto, lo que impide evaluar su comportamiento fuera de las tareas de codigo previstas.
- El repositorio ocupa 681,2 GB, en gran parte por checkpoints intermedios y multiples artefactos; conviene descargar solo la revision necesaria.
- La carga requiere `trust_remote_code=True`, lo que implica ejecutar codigo remoto del repositorio y debe auditarse en entornos de produccion.
- Las variantes `code-fim` y `sweep-sft-*` figuran como planificadas; su disponibilidad real no esta confirmada en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Walltim3/lfm3-1.7b-sweep-sft
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Dataset de la variante `code-sft` (KodCode-V1): no disponible como enlace en la informacion proporcionada
- Dataset planificado `bigcode/commitpack`: no disponible como enlace en la informacion proporcionada
- Editor Zed (formato de prompts `qwen` y `sweep`): no disponible como enlace en la informacion proporcionada
