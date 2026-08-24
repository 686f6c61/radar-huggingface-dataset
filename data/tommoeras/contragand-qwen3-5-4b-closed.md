# TomMoeras/contragand-qwen3.5-4b-closed

## Resumen

ContraGAND detector (closed task) es un adaptador LoRA desarrollado por TomMoeras sobre el modelo base Qwen/Qwen3.5-4B. Su función es clasificar el género de un referente concreto dentro de una frase en inglés, devolviendo una de tres etiquetas: `masculine`, `feminine` o `ambiguous`. Se trata de un artefacto de investigación asociado al artículo *ContraGAND: Auditing and Repairing Gender Ambiguity Failures in LLMs with Neurosymbolic Contrastive Data Augmentation* (EMNLP 2026), y corresponde a la condición FT-CONTRA (D-A) del estudio.

El adaptador se entrenó mediante QLoRA sobre el conjunto de entrenamiento contrastivo completo de ContraGAND, compuesto por 11.706 ejemplos. Cada ejemplo empareja una frase ambigua con una variante mínima masculina y otra femenina. En el conjunto de prueba auditado por humanos (1.395 ejemplos), alcanza una exactitud de 0,992 y una macro-F1 de 0,992, superando al modelo teacher de 31B parámetros que obtuvo 0,984. La relevancia actual de este modelo radica en su capacidad para detectar ambigüedad de género en texto, una tarea crítica para auditar y corregir sesgos en sistemas de IA generativa.

El adaptador es ligero (0,4 GB) y se distribuye bajo licencia Apache 2.0, lo que facilita su integración en pipelines de evaluación de sesgos. Está diseñado exclusivamente para la tarea cerrada de clasificación de género y no es un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3.5-4B (transformer decoder-only) |
| Parametros totales | Modelo base: ~4B; adaptador LoRA: no especificado (tamano del repo 0,4 GB) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible; secuencia de entrenamiento: 1024 tokens |
| Tipos de cuantizacion | nf4 (QLoRA, bitsandbytes) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (rank 64, alpha 128, dropout 0,05) aplicado a todas las proyecciones lineales del modelo base Qwen3.5-4B, un transformer decoder-only de 4.000 millones de parámetros. El entrenamiento se realizó con QLoRA en cuantización nf4, con una tasa de aprendizaje de 2e-5 con decaimiento coseno, 5 épocas y early stopping basado en la pérdida de validación. La longitud de secuencia fue de 1024 tokens y se utilizó axolotl como framework de entrenamiento sobre 4 GPU A100-80GB.

El conjunto de datos de entrenamiento consiste en 11.706 ejemplos contrastivos del split completo de ContraGAND: cada oración fuente ambigua se empareja con una variante mínima masculina y una femenina. Esta estrategia de aumento de datos contrastivo, de inspiración neurosymbolica, permite al adaptador aprender señales textuales sutiles (pronombres, títulos, sustantivos con género) que determinan el género de un referente. El modelo se entrenó para la tarea cerrada de clasificación, sin modo de razonamiento extendido (thinking mode desactivado).

## Capacidades

- Clasificacion de genero de un referente concreto en una frase inglesa: devuelve `masculine`, `feminine` o `ambiguous`.
- Generacion de respuestas en formato JSON estructurado con campo `gender`, `confidence` (entero 1-5) y `reasoning` (una frase breve citando la evidencia textual).
- Deteccion de ausencia de señal de genero: identifica cuando una frase no contiene pistas que revelen el genero del referente.
- Manejo de referentes con titulos, pronombres y sustantivos con genero (p. ej., "Mrs. Thompson", "librarian").
- Integracion sencilla en pipelines de auditoria de sesgos gracias a su formato de salida estandarizado.
- Compatible con el ecosistema Hugging Face Transformers y PEFT, lo que permite cargarlo como adaptador sobre Qwen3.5-4B.

## Casos de uso

- Auditoria de sesgos de genero en LLMs: el adaptador puede integrarse en suites de evaluacion para detectar cuando un modelo generativo asigna incorrectamente un genero a referentes ambiguos, ayudando a cuantificar el sesgo en sistemas de produccion.
- Correccion automatica de textos: en herramientas de redaccion asistida, puede senalar frases donde el genero de un referente no es deducible, sugiriendo reformulaciones mas claras o neutras.
- Analisis de contenido periodistico: util para verificar que articulos o noticias no introducen suposiciones de genero no respaldadas por el texto, especialmente en contextos donde la neutralidad es importante.
- Desarrollo de sistemas de IA responsable: como componente en pipelines de "red teaming" para evaluar la robustez de modelos frente a ambiguedades de genero en entradas de usuario.
- Investigacion en linguistica computacional: sirve como herramienta de anotacion automatica para crear datasets etiquetados con ambiguedad de genero, reduciendo el esfuerzo manual de anotadores.
- Filtrado de datos de entrenamiento: puede preprocesar grandes volumenes de texto para identificar y eliminar o corregir ejemplos con ambiguedad de genero antes de usarlos en el entrenamiento de otros modelos.

## Benchmarks y rendimiento

Segun la informacion proporcionada por el autor, el adaptador alcanza los siguientes resultados en el conjunto de prueba auditado por humanos de ContraGAND (1.395 ejemplos):

| Metrica | Valor |
|---|---|
| Exactitud (closed task) | 0,992 |
| Macro-F1 | 0,992 |

Para contexto, el modelo teacher de 31B parametros obtuvo una exactitud de 0,984 en la misma tarea, lo que indica que el adaptador de 4B supera al teacher. No se han publicado resultados adicionales en benchmarks estandar como MMLU, HumanEval o GSM8K, ya que el modelo esta especializado en una tarea unica y no es un LLM de proposito general.

## Requisitos de hardware

- El adaptador LoRA es muy ligero (0,4 GB) y puede cargarse en cualquier GPU con al menos 4 GB de VRAM, incluso en CPU si se usa cuantizacion del modelo base.
- El modelo base Qwen3.5-4B requiere aproximadamente 3 GB en cuantizacion Q4, segun guias locales. Con el adaptador, el conjunto completo cabe en una GPU consumer como RTX 3060 (12 GB) o RTX 4090 (24 GB) sin problemas.
- Para inferencia en produccion, se recomienda usar vLLM o TGI con soporte para adaptadores LoRA, aunque el ejemplo de uso proporcionado emplea `transformers` + `peft`.
- En CPU, es viable ejecutar la inferencia con `llama.cpp` o `Ollama` si se convierte el modelo base a GGUF y se fusiona el adaptador, aunque la latencia sera mayor (del orden de segundos por muestra).
- Dado que la tarea es de clasificacion con salida corta (un objeto JSON), el throughput estimado es alto: cientos de inferencias por segundo en una A100, y decenas en una GPU consumer.
- No se requieren multiples GPUs para inferencia; el entrenamiento, en cambio, uso 4x A100-80GB, pero esto no es necesario para el despliegue.

## Comparativa con modelos similares

No se dispone de informacion sobre otros adaptadores o modelos especializados en deteccion de ambiguedad de genero de referentes con los que comparar directamente. El unico punto de referencia disponible es el modelo teacher de 31B parametros mencionado en el articulo, que obtuvo una exactitud inferior (0,984) a la del adaptador de 4B (0,992). En terminos de tamano y licencia, este adaptador es significativamente mas ligero y abierto que cualquier alternativa propietaria, pero no existen datos publicos de otros sistemas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo funciona en ingles y no soporta otros idiomas.
- Las etiquetas de salida se limitan a `masculine`, `feminine` y `ambiguous`, por lo que no puede representar identidades no binarias ni el uso de "they" singular.
- Es un artefacto de investigacion, no un modelo de produccion general; su uso fuera de la tarea de clasificacion de genero no es recomendable.
- La salida en formato JSON puede fallar si se modifica el prompt de entrada; el adaptador espera exactamente el formato de prompt utilizado durante el entrenamiento.
- Aunque la exactitud es alta (0,992), existe un pequeño margen de error en casos con senales de genero muy sutiles o ambiguas.
- El entrenamiento se realizo con QLoRA en nf4, lo que puede introducir ligeras perdidas de precision frente a un fine-tuning completo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo esta pensado para investigacion y auditoria; no se han documentado sesgos especificos del adaptador, aunque el modelo base puede arrastrar sesgos propios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TomMoeras/contragand-qwen3.5-4b-closed
- Repositorio de codigo y configuraciones: https://github.com/TomMoeras/ContraGAND
- Demo interactiva (tareas abierta y cerrada): https://huggingface.co/spaces/TomMoeras/contragand-demo
- Modelo base Qwen3.5-4B en Ollama: https://ollama.com/library/qwen3.5:4b
- Informe tecnico de Qwen3 (referencia de arquitectura): https://arxiv.org/html/2505.09388v1
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
