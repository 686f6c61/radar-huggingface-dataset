# unamed12/autodl-sft-s1k-lr5e-7

## Resumen

`unamed12/autodl-sft-s1k-lr5e-7` es un ajuste fino supervisado (SFT) completo del modelo base Qwen/Qwen3-8B, publicado por el usuario `unamed12` en HuggingFace. Se trata de un experimento de entrenamiento orientado a razonamiento, generado con LLaMA-Factory (etiquetas `llama-factory` y `full`, que indican ajuste fino de todos los parametros y no una adaptacion de bajo rango). El repositorio contiene pesos en safetensors de 8.190.735.360 parametros (8,19 mil millones) y ocupa 16,4 GB, coherente con un guardado en precision de 16 bits. El acceso esta restringido: es un modelo gated y requiere aceptar condiciones en HuggingFace antes de la descarga.

El nombre del modelo resume sus hiperparametros: `sft` (supervised fine-tuning), `s1k` (presumiblemente 1.000 muestras de entrenamiento), `lr5e-7` (tasa de aprendizaje de 5e-7). El unico run declarado en el model-index se llama `reasoning-sft_cbhint_s1k_bs16_lr5e-7_col4096`, lo que anade un tamano de lote de 16 y un `cutoff_len` de 4096 tokens. Es, por tanto, un artefacto de investigacion con un volumen de datos muy reducido, no un modelo instructivo de proposito general listo para produccion.

Su relevancia es limitada y de nicho: sirve como referencia reproducible de un pipeline de SFT completo sobre Qwen3-8B con LLaMA-Factory, y como punto de partida para estudiar el efecto de un ajuste con pocas muestras sobre un modelo de razonamiento. No dispone de benchmarks publicados (el array de resultados del model-index esta vacio), no tiene descargas ni likes, y no declara idiomas soportados ni detalles del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-8B); sin datos especificos del ajuste |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No declarada en la ficha; el modelo base Qwen3-8B soporta 32.768 tokens nativos y hasta 131.072 con YaRN. El run de entrenamiento uso `col4096` (cutoff de 4.096 tokens) |
| Tipos de cuantizacion | No disponible. Solo se publican pesos en safetensors (16,4 GB, compatible con 16 bits). No hay GGUF ni AWQ/GPTQ en el repositorio |
| Idiomas soportados | No disponible en la ficha (no declarados). El modelo base Qwen3 declara 119 idiomas |
| Licencia | `other` (acceso restringido / gated, requiere aceptar condiciones) |
| Formato de pesos | Safetensors (compatible con `transformers`); logs en TensorBoard |
| Modelo base | Qwen/Qwen3-8B (ajuste fino completo) |
| Herramienta de entrenamiento | LLaMA-Factory (etiqueta `llama-factory`, `full`) |
| Fecha de creacion | 2026-09-24 |
| Ultima actualizacion | 2026-09-24 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-8B: un transformer denso de 8,19 mil millones de parametros con atencion GQA (consultas agrupadas) y RoPE, del que este repositorio es un ajuste fino completo. No se ha publicado ninguna modificacion estructural sobre el base, por lo que se heredan sus caracteristicas: 36 capas, dimension oculta de 4096, 32 cabezas de consulta y 8 cabezas de clave/valor, y una ventana nativa de 32.768 tokens ampliable a 131.072 mediante escalado YaRN. La model card no aporta informacion adicional sobre la configuracion del ajuste.

Los datos de entrenamiento no estan documentados: ni la composicion del dataset, ni el numero exacto de tokens, ni si hubo fases de RLHF, DPO o preferencias. La unica evidencia es el identificador del run, `reasoning-sft_cbhint_s1k_bs16_lr5e-7_col4096`, que sugiere un dataset de razonamiento de aproximadamente 1.000 ejemplos, tamano de lote 16, tasa de aprendizaje 5e-7 y truncado de secuencias a 4.096 tokens. El sufijo `cbhint` no se explica en la informacion disponible. No se declara ninguna innovacion tecnica (decodificacion especulativa, atencion lineal ni modos de pensamiento propios); lo unico reseñable es que se trata de un ajuste completo y no de un LoRA.

## Capacidades

- Generacion de texto conversacional (`conversational` en las etiquetas del repositorio).
- Razonamiento orientado a tareas tipo "reasoning-SFT", segun el nombre del run de entrenamiento; el alcance real no esta documentado ni evaluado.
- Capacidades heredadas del modelo base Qwen3-8B: generacion de codigo, matematicas y comprension multilingue. Al ser un ajuste completo con pocas muestras, estas capacidades pueden haberse degradado por olvido catastrofico.
- Soporte de tool calling / function calling: heredado del base, pero no verificado tras el ajuste. No disponible en la ficha.
- Soporte de agentes y razonamiento multi-paso: no disponible; no hay evaluacion ni declaracion al respecto.
- Modo "thinking" explicito: no confirmado en este ajuste (Qwen3 lo incorpora en su variante de razonamiento, pero no hay evidencia de que se haya preservado).
- Capacidades de vision o audio: no. El modelo es exclusivamente de texto.
- Capacidades multilingues: no declaradas especificamente; dependen del modelo base.

## Casos de uso

- Evaluacion de pipelines de SFT: sirve como referencia para reproducir un ajuste completo con LLaMA-Factory sobre Qwen3-8B, comparando hiperparametros (lr 5e-7, lote 16, cutoff 4096) frente a otros checkpoints del mismo autor.
- Investigacion sobre olvido catastrofico: al ser un ajuste completo con ~1.000 muestras, es util para medir cuanto se degradan las capacidades generales del base en tareas de codigo y matematicas.
- Pruebas de destilacion de datos de razonamiento: permite estudiar si un volumen minimo de ejemplos mejora tareas de razonamiento acotadas (por ejemplo, problemas tipo GSM8K) sin reentrenar desde cero.
- Generacion de texto en dominios muy especificos: si los 1.000 ejemplos pertenecen a un unico dominio, el modelo puede servir como generador especializado en ese formato concreto, con validacion manual previa.
- Base para posteriores fases de alineacion: punto de partida para aplicar DPO, RLHF o un segundo SFT antes de desplegar, dado que no incorpora alineacion declarada.
- Experimentacion academica con recursos limitados: al ser un modelo de 8B en safetensors, permite probar tecnicas de cuantizacion y despliegue (vLLM, llama.cpp) en una unica GPU de 24 GB.
- Comparacion de checkpoints del mismo autor: la familia `autodl-sft-col4096`, `col6144`, `col8192` y `wsft-col4096` permite aislar el efecto del cutoff de secuencia y del tipo de ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El `model-index` de la model card declara un unico run (`reasoning-sft_cbhint_s1k_bs16_lr5e-7_col4096`) con un array de resultados vacio, por lo que no existen cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion para este checkpoint.

## Requisitos de hardware

Estimaciones a partir de los 8,19 B de parametros y del repositorio de 16,4 GB. No hay mediciones de latencia o throughput publicadas para este modelo.

- VRAM en FP16/BF16: aproximadamente 16,4 GB solo de pesos. Con cache KV para contexto de 4.096 tokens, alrededor de 17-18 GB; para 32.768 tokens, en torno a 21-22 GB.
- VRAM en INT8 (bitsandbytes): aproximadamente 9-10 GB de pesos mas cache.
- VRAM en FP32: aproximadamente 33 GB de pesos.
- VRAM en cuantizacion de 4 bits (Q4_K_M, tras conversion): aproximadamente 4,7-5 GB de pesos mas cache.
- GPU recomendadas: A100 40 GB, H100 80 GB, L40S 48 GB para FP16 sin compromisos. Una RTX 4090 o RTX 3090 de 24 GB puede ejecutar FP16 con contexto moderado (4-8k tokens) y cuantizacion INT8 con contexto largo.
- GPU de consumo: si cabe. En 4 bits, cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores. En 8 bits, en RTX 3090/4090.
- Opciones de despliegue: `transformers` (formato nativo safetensors), vLLM, TGI (etiqueta `text-generation-inference` y `endpoints_compatible` en el repositorio), SGLang. Para llama.cpp u Ollama seria necesaria una conversion manual a GGUF, no incluida.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Benchmarks publicados |
|---|---|---|---|---|---|
| unamed12/autodl-sft-s1k-lr5e-7 | 8,19 B | 4.096 en entrenamiento; base hasta 32.768 nativos (131.072 con YaRN) | `other` (gated) | Restringido | No |
| Qwen/Qwen3-8B (modelo base) | 8,19 B | 32.768 nativos, 131.072 con YaRN | Apache 2.0 | Abierto | Si (publicados por Qwen) |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 131.072 | Llama 3.1 Community License | Restringido (gated) | Si |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,25 B | 32.768 | Apache 2.0 | Abierto | Si |
| google/gemma-2-9b-it | 9,24 B | 8.192 | Gemma Terms of Use | Restringido (gated) | Si |

La comparacion de rendimiento no es posible: no hay ninguna evaluacion publicada de este checkpoint, mientras que las alternativas cuentan con resultados oficiales. La diferencia practica principal es la licencia (`other` y acceso gated frente a Apache 2.0 en Qwen3-8B y Mistral-7B), y el contexto efectivo de entrenamiento (4.096 tokens frente a los 32.768 nativos del base).

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al no existir model card descriptiva, se desconocen los sesgos introducidos por los datos de SFT y los heredados del base.
- Riesgo de alucinacion: elevado en un ajuste con ~1.000 ejemplos; el modelo puede generar respuestas plausibles pero incorrectas fuera del dominio de entrenamiento, sin que haya evaluacion que lo acote.
- Degradacion por olvido catastrofico: un ajuste completo sobre un modelo de 8B con un dataset minimo tiende a deteriorar capacidades generales de codigo, matematicas y multilingue. No hay evaluacion que confirme o descarte este efecto.
- Limitacion de contexto: el entrenamiento con `col4096` sugiere que el modelo no fue ajustado mas alla de 4.096 tokens. Aunque la arquitectura base soporte 32.768 o 131.072, el comportamiento mas alla del cutoff de entrenamiento no esta garantizado.
- Idiomas: no declarados en la ficha. Si los datos de SFT eran mayoritariamente en un idioma, el rendimiento en otros puede haberse degradado.
- Licencia: etiquetada como `other`, con acceso restringido que exige aceptar condiciones en HuggingFace. Los terminos concretos no se detallan en la informacion disponible, por lo que no puede confirmarse la viabilidad de uso comercial. Ademas, la licencia del modelo base Qwen3-8B (Apache 2.0) impone sus propias condiciones.
- Trazabilidad nula: no hay paper, blog, dataset publicado ni descripcion del proceso de entrenamiento. El unico dato verificable es el numero de parametros del safetensors.
- Estado del repositorio: cero descargas y cero likes, creado y actualizado el mismo dia. No hay evidencia de validacion por terceros.
- Produccion: no se recomienda su uso en sistemas productivos sin una evaluacion exhaustiva previa y sin resolver las preguntas de licencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unamed12/autodl-sft-s1k-lr5e-7
- Checkpoints relacionados del mismo autor:
  - https://huggingface.co/unamed12/autodl-sft-col4096-lr3_75e-7
  - https://huggingface.co/unamed12/autodl-sft-col6144
  - https://huggingface.co/unamed12/autodl-sft-col4096
  - https://huggingface.co/unamed12/autodl-sft-col8192
  - https://huggingface.co/unamed12/autodl-wsft-col4096
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Paper o blog del modelo: no disponible en la informacion proporcionada.
