# stefanocarrera/kic_M_Qwen3-4B_java_t1.0_g8_run0

## Resumen

`stefanocarrera/kic_M_Qwen3-4B_java_t1.0_g8_run0` es un ajuste fino (fine-tune) del modelo base Qwen3-4B-Base, publicado por el usuario stefanocarrera con licencia Apache 2.0. El nombre del repositorio sugiere que el entrenamiento se ha orientado a tareas de código Java (`java`), con una temperatura de muestreo de 1.0 y 8 generaciones por prompt (`t1.0_g8_run0`), aunque la model card no documenta ni el dataset ni el procedimiento. El entrenamiento se realizó con Unsloth y TRL, según las etiquetas y la propia model card.

Se trata de un derivado de la familia Qwen3, una serie de modelos densos y MoE presentada por el equipo Qwen (Alibaba) con escalas de 0,6 a 235 mil millones de parámetros. Qwen3-4B es la variante densa de 4B, e integra en la familia un modo de razonamiento ("thinking") y otro directo ("non-thinking"), aunque el punto de partida aquí es la versión *Base*, sin alineamiento por instrucciones.

La relevancia de esta ficha es limitada pero técnica: el repositorio ocupa 0,1 GB, un tamano compatible con un adaptador LoRA/PEFT en lugar de pesos completos, no tiene descargas ni valoraciones y no incluye resultados de evaluación. Es, por tanto, un artefacto de experimentación reproducible con Unsloth, útil como ejemplo de pipeline de fine-tuning de bajo coste, no como modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-4B-Base); no documentada en el repositorio |
| Parámetros totales | ~4,0 B en el modelo base; el repositorio publicado ocupa 0,1 GB, compatible con un adaptador |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos en Qwen3-4B, extensible a 131.072 con YaRN (dato del modelo base, no verificado en este repositorio) |
| Tipos de cuantización | Modelo base disponible en 4 bits (bnb-4bit) vía Unsloth; este fine-tune no publica variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | `en` (único idioma declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | transformers |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-24 |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen3-4B-Base-unsloth-bnb-4bit`, es decir, Qwen3-4B-Base cuantizado en 4 bits por Unsloth para abaratar el entrenamiento. Qwen3-4B es un transformer denso de aproximadamente 4.000 millones de parámetros con atención de consultas agrupadas (GQA) y 32.768 tokens de contexto nativo, ampliables a 131.072 mediante escalado YaRN. La familia Qwen3, descrita en el informe técnico arXiv 2505.09388, cubre arquitecturas densas y MoE entre 0,6 B y 235 B; la innovación principal de la serie es la unificación de un modo de razonamiento profundo y un modo de respuesta rápida en el mismo marco, algo que no está presente en las versiones *Base*.

En cuanto al entrenamiento de este derivado, la información disponible es mínima: la model card indica únicamente que se entrenó "2x faster with Unsloth" y las etiquetas confirman el uso de TRL (SFT/DPO) y text-generation-inference. No se especifica el número de tokens, la composición del dataset (más allá de la referencia a Java en el nombre), si hubo RLHF/DPO, ni hiperparámetros como rango LoRA, learning rate o épocas. El identificador `t1.0_g8_run0` sugiere una ejecución de muestreo con temperatura 1.0 y 8 candidatos por prompt, pero es una inferencia a partir del nombre, no un dato documentado.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada del modelo base.
- Generación y completado de código, presumiblemente sesgado hacia Java por el nombre del repositorio; no hay evaluación que lo confirme.
- Capacidad multilingüe teórica del modelo base Qwen3, aunque el fine-tune solo declara `en`.
- No se ha documentado soporte de tool calling ni function calling; al partir de una versión *Base* sin alineamiento, es esperable que sea limitado o inexistente.
- No se ha documentado capacidad de agente, razonamiento multi-paso ni modo *thinking*; las versiones Base de Qwen3 no incluyen plantilla de razonamiento.
- Sin capacidades de visión ni audio: el repositorio solo declara `text-generation` a través de transformers.
- Capacidad de servir como punto de partida para experimentos de fine-tuning reproducible con Unsloth + TRL.

## Casos de uso

- Autocompletado de código Java en IDE: el modelo puede integrarse detrás de un servidor compatible con la API de transformers o TGI para sugerir líneas y bloques en editores, siempre que se valide empíricamente la calidad del fine-tune sobre el base.
- Generación de tests unitarios JUnit: usar el modelo para producir esqueletos de pruebas a partir de firmas de métodos y Javadoc, con revisión humana posterior.
- Migración de código legacy: tareas de reescritura de Java 8 a Java 17/21 (uso de `var`, `records`, `switch` con patrones) en modo *batch*, procesando ficheros por separado.
- Documentación automática: generación de comentarios Javadoc a partir del AST o del código fuente, en un pipeline de CI que abra pull requests con la documentación propuesta.
- Experimentación académica con Unsloth: reproducir el pipeline de fine-tuning en 4 bits en una GPU de consumo para estudiar el efecto de hiperparámetros en dominios específicos (Java en este caso).
- Asistente interno de dudas de Java: desplegado en local para responder preguntas sobre APIs del JDK, sin enviar código propietario a servicios externos, dado que la licencia Apache 2.0 lo permite.
- Base para *continued pretraining* o SFT adicional: al ser Apache 2.0 y un adaptador ligero, sirve como punto de partida para especializaciones posteriores con coste reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K, MultiPL-E ni de ningún otro conjunto, ni métricas de pérdida de validación del entrenamiento.

## Requisitos de hardware

- El repositorio contiene 0,1 GB, por lo que no es un checkpoint autónomo: hay que cargar el modelo base `unsloth/Qwen3-4B-Base-unsloth-bnb-4bit` (o la versión sin cuantizar) y aplicar el adaptador, o fusionarlo previamente.
- VRAM estimada para el modelo base en bf16: en torno a 8 GB de pesos más caché KV; con contexto de 8.192 tokens, un presupuesto de 10-12 GB en una GPU de 16 GB es razonable.
- VRAM estimada con cuantización de 4 bits: aproximadamente 2,5-3 GB de pesos, con un total de 5-6 GB incluyendo contexto moderado.
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super y RTX 4090; en 4 bits también en GPUs de 8 GB con contexto recortado.
- GPU de centro de datos: A100 40/80 GB y H100 son sobredimensionadas para 4B, salvo para entrenamiento o *batching* intensivo.
- Opciones de despliegue: transformers (librería declarada), TGI (etiqueta `text-generation-inference`), vLLM para serving con *continuous batching*, y llama.cpp/Ollama tras convertir y fusionar los pesos a GGUF.
- Latencia y throughput: no disponible; no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

Datos de especificaciones tomados de la documentación pública de cada familia; no se comparan puntuaciones de benchmarks porque este fine-tune no publica ninguna.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| kic_M_Qwen3-4B_java_t1.0_g8_run0 (este) | ~4,0 B (adaptador sobre base) | 32.768 (131.072 con YaRN, según base) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen3-4B / Qwen3-4B-Instruct-2507 | 4,0 B denso | 32.768 nativo / 131.072 con YaRN | Apache 2.0 | Hugging Face, ampliamente utilizado |
| Qwen3-8B (mismo autor, otros fine-tunes) | 8,0 B denso | 32.768 nativo / 131.072 con YaRN | Apache 2.0 | Hugging Face |
| Llama 3.2 3B Instruct | 3,2 B denso | 128.000 | Llama 3.2 Community License | Hugging Face, requiere aceptar términos |
| Gemma 3 4B | ~4 B denso | 128.000 | Gemma Terms of Use | Hugging Face, requiere aceptar términos |

## Limitaciones y advertencias

- El modelo parte de una versión *Base*, sin SFT instructivo ni alineamiento por preferencias: es previsible un seguimiento pobre de instrucciones y respuestas poco conversacionales.
- No hay ningún dato de evaluación: se desconoce si el fine-tune mejora realmente la generación de código Java respecto al base.
- El repositorio declara únicamente inglés; el rendimiento en castellano o en otros idiomas no está verificado y podría degradarse respecto al base multilingüe.
- Riesgo de alucinación en APIs inexistentes del JDK, firmas de métodos inventadas y dependencias de Maven/Gradle incorrectas; requiere compilación y tests automáticos antes de aceptar cualquier salida.
- Riesgo de reproducción de código con licencias incompatibles presente en el corpus de entrenamiento; la licencia Apache 2.0 del checkpoint no cubre las obligaciones derivadas de dicho código.
- La model card no documenta el dataset, el número de tokens, el rango LoRA ni la semilla; la reproducibilidad es, en la práctica, nula.
- El identificador del repositorio (`kic_M`, `run0`) sugiere un experimento dentro de una batería de ejecuciones, no un artefacto validado.
- Sin descargas ni likes: no hay evidencia de uso en la comunidad ni informes independientes de calidad.
- El tamano de 0,1 GB obliga a gestionar el modelo base por separado; un usuario que intente cargar el repositorio de forma aislada probablemente fallará.
- Antes de un uso comercial, conviene verificar la licencia del modelo base cuantizado por Unsloth y de los datos con los que se entrenó el adaptador.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/stefanocarrera/kic_M_Qwen3-4B_java_t1.0_g8_run0
- Modelo base: https://huggingface.co/unsloth/Qwen3-4B-Base-unsloth-bnb-4bit
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Informe técnico de Qwen3 (arXiv 2505.09388): https://arxiv.org/html/2505.09388v1
- Unsloth (framework de entrenamiento): https://github.com/unslothai/unsloth
- TRL (librería de fine-tuning): https://github.com/huggingface/trl
- Otro fine-tune del mismo autor sobre Qwen3-8B: https://huggingface.co/stefanocarrera/autophagycode_M_Qwen3-8B_t1.0_g1_run0
- Otro fine-tune del mismo autor sobre Qwen3-4B: https://huggingface.co/stefanocarrera/autophagycode_M_mercury_Qwen3-4B_lr0.0001_c142_trust_t1.5_g8_run0
