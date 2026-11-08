# TokenGod/Qwen3.5-0.8B-opus-blind-weight-edit

## Resumen

TokenGod/Qwen3.5-0.8B-opus-blind-weight-edit es un checkpoint derivado de Qwen/Qwen3.5-0.8B (revision `2fc06364715b967f1860aea9cf38778875588b17`) en el que se han modificado directamente los pesos de tres matrices de proyeccion de salida de atencion, sin ningun tipo de entrenamiento ni ajuste fino. El autor del checkpoint es TokenGod, y el modelo se presenta como una replicacion independiente del Experimento 8 del articulo "Sparks of Weight-Space Programming" (MIT CSAIL, 2026), en el que GPT-6 Astra editaba los pesos de Qwen3.5-0.8B para mejorar su rendimiento en matematicas.

El modelo resuelve un problema muy concreto del modelo base: su tendencia a entrar en bucles de razonamiento durante el modo thinking hasta agotar el limite de tokens. La edicion anula o atenua determinadas cabezas de atencion que, segun el autor, propagan la "vuelta anterior" del bucle. El resultado reportado es un aumento de precision global del 10,2% al 43,8% en un subconjunto de 64 problemas, sin reentrenar ningun parametro.

Es relevante ahora porque ejemplifica la programacion en espacio de pesos (weight-space programming) como alternativa a los pipelines clasicos de RLHF/DPO para corregir comportamientos patologicos. El checkpoint ocupa 1,8 GB, tiene 873.438.784 parametros y se distribuye en safetensors bajo licencia Apache 2.0. Conviene subrayar que se trata de un artefacto de investigacion con un conjunto de evaluacion muy pequeno, no de un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5), con modo thinking |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la evaluacion usa como maximo 32.768 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El checkpoint hereda integramente la arquitectura del modelo base Qwen/Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 0,9B parametros con capacidad de generacion de texto e imagen-a-texto segun su model card en Hugging Face. No hay entrenamiento adicional: todos los tensores son byte-identicos al modelo base salvo tres matrices `o_proj` de atencion, lo que supone 1.310.720 valores modificados de un total de 873 millones de parametros.

Las modificaciones concretas son: en la capa 15, las columnas 1536-2047 (cabezas 6 y 7) se ponen a cero; en la capa 19, las columnas 0-255 (cabeza 0) se ponen a cero; y en la capa 23, las columnas 1024-1535 (cabezas 4 y 5) se multiplican por 0,5. El autor justifica el cambio en que estas cabezas copian hacia delante la vuelta anterior de un bucle de razonamiento, de modo que suprimirlas rompe el ciclo. Los hashes de los tensores modificados se encuentran en `edit_manifest.json`. El autor reconoce que, para elegir estas cabezas, Claude Opus 5.5 reimplemento localmente las capas de atencion y las ejecuto sobre activaciones registradas, lo que incumple las reglas del experimento original, aunque la edicion resultante sea una edicion de pesos legitima y los resultados provengan de ejecuciones reales del modelo.

## Capacidades

- Generacion de texto y razonamiento en modo thinking, con la misma base que Qwen3.5-0.8B.
- Razonamiento matematico mejorado respecto al modelo base en el subconjunto evaluado, gracias a la supresion de bucles de razonamiento.
- Generacion de respuestas con formato `\boxed{}` para problemas matematicos, segun el protocolo de evaluacion del articulo.
- Capacidad imagen-a-texto heredada del modelo base (la model card de Qwen/Qwen3.5-0.8B lo describe como Image-Text-to-Text), aunque no se ha evaluado en este checkpoint.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidad especial: modo thinking con muestreo recomendado (temperature 0,6, top-p 0,95, top-k 20, presence penalty 1,5).

## Casos de uso

- Investigacion en edicion de pesos: el checkpoint sirve como referencia reproducible para estudiar como la modificacion de cabezas de atencion concretas altera el comportamiento de razonamiento de un transformer pequeno, comparando con el modelo base y con la edicion de Astra.
- Correccion de bucles de razonamiento: puede emplearse para analizar y mitigar el fallo de "looping" en modelos con modo thinking, midiendo la tasa de respuestas que agotan el limite de tokens antes y despues de la edicion.
- Experimentos de interpretabilidad mecanicista: las cabezas identificadas (capas 15, 19 y 23) permiten estudiar circuitos de copia de informacion entre pasos de razonamiento en modelos de menos de 1B parametros.
- Evaluacion de tecnicas de weight-space programming: util como baseline para comparar metodos de edicion directa de pesos frente a fine-tuning o RLHF en tareas de matematicas.
- Prototipado de bajo coste en entornos academicos: con 873M parametros y 1,8 GB en bfloat16, se puede ejecutar en una unica GPU consumer para experimentos de investigacion, siempre que se asuma la falta de validacion en benchmarks completos.
- Docencia y divulgacion: ejemplo didactico de como un cambio quirurgico en tres tensores puede modificar el comportamiento de un modelo, con manifiesto de hashes y codigo de evaluacion publicados.

## Benchmarks y rendimiento

Evaluacion con el protocolo del articulo: thinking activado, temperature 0,6, top-p 0,95, top-k 20, presence penalty 1,5, maximo 32.768 tokens y correccion del ultimo `\boxed{}` con math-verify. Conjunto de prueba: 64 problemas reservados (32 de MATH-500 y 32 de GSM8K test), 4 muestras por problema.

| Modelo | MATH-500 (32) | GSM8K (32) | Precision global |
|---|---|---|---|
| Qwen3.5-0.8B original | 3,1% | 17,2% | 10,2% |
| Esta edicion (Opus blind) | 35,9% | 51,6% | 43,8% |
| Edicion de Astra (50 pasos, resultados de los autores) | 42,2% | 68,8% | no disponible |

La ganancia pareada es de +33,6 puntos (error estandar 4,4). El autor advierte que el conjunto de prueba es pequeno y que la edicion no se ha evaluado en los benchmarks completos.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1,8 GB solo para pesos, mas memoria para KV cache y activaciones; en la practica, unos 3-4 GB para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: en torno a 1 GB para pesos; en 4 bits, en torno a 0,5 GB (estimaciones a partir del numero de parametros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060, RTX 4060, RTX 4090) es suficiente; para lotes grandes o contexto de 32.768 tokens se recomienda una A100 o H100.
- Cabe en GPU consumer: si, con holgura en la mayoria de tarjetas con 8 GB o mas.
- Opciones de despliegue: el autor documenta uso con vLLM; al ser safetensors de un modelo de la familia Qwen, deberia poder cargarse tambien con Transformers, TGI o llama.cpp tras conversion a GGUF (no confirmado en la informacion disponible).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MATH-500 (32) | GSM8K (32) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Esta edicion (TokenGod) | 873M | no disponible | 35,9% | 51,6% | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-0.8B (base) | ~0,9B | no disponible | 3,1% | 17,2% | no disponible en la informacion | Hugging Face |
| RikiyaT/Qwen3.5-0.8B-weight-space-programming (Astra) | ~0,9B | no disponible | 42,2% | 68,8% | no disponible en la informacion | Hugging Face |

La comparativa se limita a estos tres modelos porque son los unicos con resultados medidos sobre el mismo subconjunto de 64 problemas. No se dispone de datos de benchmarks completos para ninguno de ellos en la informacion proporcionada.

## Limitaciones y advertencias

- Conjunto de evaluacion muy pequeno: 64 problemas con 4 muestras cada uno; las cifras tienen alta varianza y no se han validado en MATH-500 ni GSM8K completos.
- El proceso de busqueda de cabezas no cumplio las reglas del experimento original, segun admite el propio autor, lo que limita su valor como replicacion estricta.
- Riesgo de alucinacion y de degradacion en tareas distintas de matematicas: la edicion solo se ha evaluado en razonamiento matematico; el efecto sobre codigo, vision o dialogo abierto es desconocido.
- Idiomas soportados no documentados; no hay garantia de comportamiento multilingue.
- Longitud de contexto oficial no disponible; la evaluacion usa hasta 32.768 tokens, pero no se confirma el contexto nativo del modelo base.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion independiente.
- Aunque la licencia es Apache 2.0, conviene verificar la licencia del modelo base Qwen/Qwen3.5-0.8B antes de uso comercial, ya que no se detalla en la informacion proporcionada.
- No apto para produccion sin evaluacion adicional: es un artefacto de investigacion con fines de interpretabilidad y edicion de pesos.

## Enlaces

- Checkpoint en Hugging Face: https://huggingface.co/TokenGod/Qwen3.5-0.8B-opus-blind-weight-edit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Edicion de referencia de Astra: https://huggingface.co/RikiyaT/Qwen3.5-0.8B-weight-space-programming
- Articulo "Sparks of Weight-Space Programming": https://rikiyat.github.io/blog/weight-space-programming/
- Write-up del autor: https://adithyag73.github.io/first_principles/weight-space-programming/
- Codigo, logs y respuestas evaluadas: https://github.com/ADITHYAG73/first_principles/tree/main/weight-space-programming
- GPT-6 Astra (referencia del articulo): https://openai.com/index/gpt-6-astra/
