# wangzhang/granite-4.1-8b-abliterated

## Resumen

`wangzhang/granite-4.1-8b-abliterated` es un derivado del modelo `ibm-granite/granite-4.1-8b` de IBM, modificado mediante la técnica de abliteración para eliminar de forma sustancial los rechazos de seguridad del modelo original. La abliteración, descrita en el artículo de Arditi et al. (2024, arXiv:2406.11717), identifica la dirección del flujo residual que el modelo utiliza para codificar la negativa ante instrucciones dañinas y la elimina mediante una edición de pesos de rango 1, sin reentrenamiento ni ajuste fino. El resultado es un modelo que conserva la mayor parte de las capacidades generales del base, pero que responde a instrucciones que el modelo original rechazaría.

El modelo fue creado por el usuario `wangzhang` con la herramienta `abliterix` v1.8.0, que aplica una variante de abliteración proyectada con optimización de hiperparámetros mediante estudio TPE de 50 ensayos. El checkpoint publicado corresponde al punto equilibrado del frente de Pareto entre tasa de rechazo y divergencia KL respecto al modelo base. Con 8,38 mil millones de parámetros y arquitectura transformer decoder-only densa, se distribuye en formato safetensors bajo licencia Apache 2.0 y está orientado a generación de texto en inglés.

La relevancia de este modelo radica en que permite estudiar el comportamiento de un LLM sin las capas de rechazo de seguridad, manteniendo intacta la mayor parte de la capacidad de razonamiento y generación. Es útil para investigación en alineación, análisis de la mecánica interna de los modelos y aplicaciones donde los rechazos excesivos del modelo base resultan problemáticos, como la escritura creativa o el roleplay sin censura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (basado en Granite 4.1 8B) |
| Parametros totales | 8.380.551.168 (8,38B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Granite 4.1 soporta hasta 128K, no confirmado para este derivado) |
| Tipos de cuantizacion | No disponible (repo solo con pesos safetensors en BF16) |
| Idiomas soportados | en (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Granite 4.1 8B de IBM, un transformer decoder-only denso con normalización y geometría mUP (maximal update parametrization). El modelo base fue entrenado por IBM con un enfoque en tareas de codificacion, razonamiento matematico, tool calling y generacion de JSON estructurado, con soporte multilingue nativo. Sin embargo, este derivado no ha sido reentrenado: la abliteracion es una cirugia de pesos que modifica las matrices `attn.o_proj` y `mlp.down_proj` de cada capa para eliminar la componente del vector de rechazo en el flujo residual.

La implementacion concreta utiliza `abliterix` v1.8.0 con modo de direccion `lora` (adaptador LoRA de rango 1 fusionado en los pesos), vector global interpolado en el indice 27,37, y un taper lineal de fuerza que alcanza un maximo de 1,141 en `attn.o_proj` (capa 25,32) y 0,445 en `mlp.down_proj` (capa 25,15). Se aplico una proyeccion Gram-Schmidt contra la media de prompts benignos (metodo `projected_abliteration`) y un winsorizado al cuantil 0,995. El estudio TPE de 50 ensayos, sembrado con los hiperparametros del modelo `trohrbaugh/granite-4.1-8b-heretic`, selecciono el checkpoint actual como punto equilibrado entre minimizacion de rechazos y preservacion de comportamiento benigno.

## Capacidades

- Generacion de texto en ingles con calidad equivalente al modelo base Granite 4.1 8B en prompts benignos, como demuestra la divergencia KL de 0,0386 en distribuciones de primer token y la comparacion byte a byte de respuestas de ejemplo.
- Razonamiento, codificacion y matematicas heredadas del modelo base, aunque no se han evaluado formalmente en benchmarks estandar (MMLU, GSM8K, HumanEval) en esta version.
- Tool calling y generacion de JSON estructurado, capacidades nativas de Granite 4.1 que se preservan al no haber modificado las capas de atencion ni las proyecciones de query/key/value.
- Respuesta a instrucciones dañinas o controvertidas que el modelo base rechazaria: la tasa de rechazo se reduce del 90,0 % al 12,5 % en un conjunto de evaluacion de 200 prompts dañinos.
- Comportamiento benigno practicamente identico al base: la desviacion en longitud de respuesta es de 0,02 unidades sigma, considerada despreciable.
- No soporta vision, audio ni modo de pensamiento explicito; es un modelo de texto puro.

## Casos de uso

- Investigacion en alineacion y seguridad de LLM: permite estudiar como se comporta un modelo sin capas de rechazo, comparar la direccion de refusal entre variantes y analizar la mecanica interna de la negativa. Se usaria cargando el modelo en un entorno de investigacion y comparando sus respuestas con las del base ante los mismos prompts.
- Escritura creativa sin restricciones: novelas, guiones o relatos que aborden temas tabu o controvertidos sin que el modelo interrumpa con avisos de seguridad. Adecuado porque la abliteracion elimina la mayoria de rechazos manteniendo la coherencia narrativa.
- Roleplay y ficcion interactiva: aplicaciones de chat donde el usuario espera que el personaje responda a situaciones extremas o moralmente ambiguas sin romper la inmersión. El modelo mantiene la fluidez conversacional del base.
- Analisis de contenido dañino: generar ejemplos de texto potencialmente peligroso (instrucciones para fabricar armas, tecnicas de ingenieria social, etc.) con fines de investigacion en deteccion de contenido. El modelo proporciona respuestas detalladas que pueden usarse para entrenar clasificadores.
- Desarrollo de aplicaciones con rechazos excesivos: en dominios como educacion sexual, salud mental o asesoramiento legal, el modelo base puede rechazar preguntas legitimas por politicas de seguridad demasiado amplias. Este derivado responde a esas consultas, aunque requiere supervision humana.
- Pruebas de robustez de sistemas de moderacion: integrar el modelo en un pipeline de evaluacion para comprobar si un sistema de filtrado de contenido detecta respuestas dañinas generadas por un LLM sin restricciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, GSM8K, HumanEval) en la informacion disponible. La model card incluye una evaluacion especifica de rechazos y divergencia KL, resumida en la siguiente tabla:

| Metrica | Base `granite-4.1-8b` | Este modelo | Delta |
|---|---|---|---|
| Rechazos (200 prompts dañinos) | 180 / 200 (90,0 %) | 25 / 200 (12,5 %) | -86 % |
| Divergencia KL (1 token, benigno) | 0,0000 | 0,0386 | — |
| Desviacion de longitud de respuesta (benigno, unidades sigma) | 0 | 0,02 | despreciable |

El checkpoint fue seleccionado de un estudio TPE de 50 ensayos como punto equilibrado del frente de Pareto. Otras variantes del mismo estudio ofrecen perfiles alternativos: el ensayo 31 logra 7,0 % de rechazos con KL 0,0817 (agresivo), y el ensayo 38 logra 23,5 % de rechazos con KL 0,0358 (conservador). El modelo de referencia `trohrbaugh/granite-4.1-8b-heretic` reporta 1/100 rechazos con KL 0,0285, pero sobre una distribucion de prompts dañinos diferente, por lo que los numeros no son directamente comparables.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16,8 GB (tamano del repo), por lo que se necesita una GPU con al menos 20 GB de memoria para cargar el modelo completo con overhead de inferencia.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 40 GB, H100 80 GB, o GPUs de datacenter con 24 GB o mas. En consumer, una RTX 3090 o 4090 es suficiente para BF16.
- Con cuantizacion 4-bit (no incluida en el repo, pero posible con herramientas como llama.cpp o GPTQ): se estima un uso de 5-6 GB de VRAM, lo que permitiria ejecutarlo en GPUs consumer de 8-12 GB como RTX 3060, RTX 4060 Ti o RTX 3080.
- Opciones de despliegue: al ser un modelo transformers estandar, es compatible con vLLM, TGI, llama.cpp (si se convierte a GGUF), Ollama (mediante importacion) y cualquier framework que soporte safetensors.
- Latencia y throughput: no se han publicado mediciones especificas. Como referencia, un modelo de 8B en BF16 en una RTX 4090 suele generar entre 40 y 80 tokens por segundo con vLLM, y entre 20 y 40 tokens por segundo con llama.cpp en cuantizacion 4-bit.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos (prompts dañinos) | KL benigno | Licencia |
|---|---|---|---|---|---|
| `ibm-granite/granite-4.1-8b` (base) | 8,38B | 128K (segun IBM) | 90,0 % | 0,0000 | Apache 2.0 |
| `wangzhang/granite-4.1-8b-abliterated` (este) | 8,38B | No disponible | 12,5 % | 0,0386 | Apache 2.0 |
| `trohrbaugh/granite-4.1-8b-heretic` | 8,38B | No disponible | 1,0 % (sobre otra distribucion) | 0,0285 | Apache 2.0 |

Los tres modelos comparten la misma arquitectura base y tamano. La diferencia principal esta en el metodo de abliteracion: `heretic` utiliza un ajuste fino con datos de `mlabonne/harmless_alpaca` y `mlabonne/harmful_behaviors`, mientras que este modelo usa cirugia de pesos pura con `abliterix`. El modelo `heretic` logra una tasa de rechazo menor, pero sobre un conjunto de evaluacion distinto, y su divergencia KL es ligeramente inferior. No se dispone de comparaciones en benchmarks de capacidad estandar.

## Limitaciones y advertencias

- No se ha evaluado en benchmarks estandar de capacidad (MMLU, GSM8K, HumanEval), por lo que no hay garantia cuantitativa de que las capacidades del base se mantengan integras; la evidencia disponible se limita a la divergencia KL y a ejemplos cualitativos.
- El modelo puede generar contenido dañino, ilegal o peligroso sin rechazo, incluyendo instrucciones para fabricar armas, tecnicas de ingenieria social o discurso de odio. Su uso en produccion sin supervision humana conlleva riesgos legales y eticos significativos.
- Solo declara soporte para ingles; aunque el modelo base es multilingue, la abliteracion se evaluo unicamente en ingles y no hay garantia de comportamiento adecuado en otros idiomas.
- La abliteracion introduce una deriva medible en la distribucion de tokens (KL 0,0386), que aunque pequena, puede acumularse en conversaciones largas o tareas de alta precision.
- La longitud de contexto no esta confirmada para este derivado; se recomienda asumir la del modelo base (128K) solo tras verificacion propia.
- No se incluyen pesos cuantizados en el repositorio; el despliegue en hardware limitado requiere conversion manual a GGUF o GPTQ, lo que puede introducir perdidas adicionales de calidad.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede violar terminos de servicio de plataformas o leyes locales; la responsabilidad recae en el usuario final.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wangzhang/granite-4.1-8b-abliterated
- Modelo base: https://huggingface.co/ibm-granite/granite-4.1-8b
- Paper de abliteracion (Arditi et al., 2024): https://arxiv.org/abs/2406.11717
- Repositorio de abliterix: https://github.com/wuwangzhang1216/abliterix
- Notas de version de abliterix v1.8.0: https://github.com/wuwangzhang1216/abliterix/releases/tag/v1.8.0
- Blog sobre abliteracion proyectada (grimjim): https://huggingface.co/blog/grimjim/projected-abliteration
- Modelo de referencia heretic: https://huggingface.co/trohrbaugh/granite-4.1-8b-heretic
- Documentacion de Granite 4.1 de IBM: https://www.ibm.com/granite/docs/models/granite4-1
- Repositorio de Granite 4.1 language models: https://github.com/ibm-granite/granite-4.1-language-models
