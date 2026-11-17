# ya9919/sharp-421m-3rounds-mlx

## Resumen

Sharp-421m-3rounds-mlx es un checkpoint de decision financiera de 421 millones de parametros, publicado por el usuario ya9919, que adapta el encoder Laya de convaiinnovations (basado en ModernBERT-large) a tareas de eleccion multiple sobre datos de encuestas de hogares. El modelo no genera texto libre: puntua un conjunto completo de alternativas candidatas para un estado de hogar y una pregunta dados, devolviendo la opcion mas probable. Forma parte del marco S²-MAS (society-scale multi-agent simulation), un entorno de simulacion multiagente a escala poblacional para estudiar como decisiones heterogeneas de hogares agregadas producen resultados macroeconomicos.

Este repositorio concreto empaqueta el checkpoint de tres rondas de FinL en formato MLX FP16, pensado para ejecucion en hardware Apple Silicon. El entrenamiento se realizo en dos etapas de SFT seguidas de RLCD nativo sobre un conjunto de 1.721.623 observaciones por idioma. La relevancia actual radica en su uso como politica de decision reutilizable dentro de simulaciones socioeconomicas a gran escala, no como modelo de proposito general.

La licencia es una licencia de investigacion controlada (s2-mas-controlled-research-v1.2) que restringe el uso comercial, y el modelo solo declara soporte para ingles. El repo ocupa 0,8 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-large adaptado, con cabeza de puntuacion de opciones) |
| Parametros totales | 421.293.830 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (formato MLX); otras cuantizaciones no disponibles |
| Idiomas soportados | en (ingles) |
| Licencia | s2-mas-controlled-research-v1.2 (licencia de investigacion controlada, con derechos upstream Apache-2.0 retenidos) |
| Formato de pesos | safetensors en formato Laya-MLX FP16 |

## Arquitectura y entrenamiento

El modelo parte de Laya, un encoder de aproximadamente 421M de parametros construido sobre ModernBERT-large, al que se anade una cabeza de puntuacion de opciones. En lugar de decodificar texto, el modelo recibe un estado de hogar y una pregunta con un menu de alternativas candidatas, y asigna una puntuacion a cada opcion completa para seleccionar la mas probable. Esta interfaz de politica permite reutilizar el mismo modelo para distintas tareas de decision sin cambiar la arquitectura.

El entrenamiento se realizo sobre datos reales de encuestas en dos etapas de SFT seguidas de RLCD nativo (reinforcement learning from contrastive decisions). El conjunto de entrenamiento contiene 1.721.623 observaciones por idioma. Este repositorio es el runtime MLX FP16 del checkpoint de tres rondas; el release nativo equivalente es fin-laya-3-rounds. No se especifican en la informacion disponible el numero total de tokens de entrenamiento ni la composicion detallada del dataset.

## Capacidades

- Puntuacion y seleccion de alternativas en preguntas de eleccion multiple sobre finanzas de hogares (uso de tarjetas de credito, cuentas de deposito, cuentas de valores, depositos a plazo).
- Modelado de decisiones condicionado a un estado de hogar explicito, lo que permite simular agentes sinteticos heterogeneos.
- Interfaz de politica reutilizable: la misma cabeza de puntuacion sirve para distintas preguntas y menus de opciones.
- Inferencia en ingles unicamente.
- No soporta generacion de texto libre, tool calling, function calling, agentes multi-paso, vision ni audio segun la informacion disponible.
- Ejecucion en hardware Apple Silicon mediante el runtime MLX.

## Casos de uso

- Simulacion socioeconomica a escala poblacional: integrado en S²-MAS para evaluar como decisiones individuales de hogares agregadas producen resultados de consumo, efectivo y pagos a lo largo del tiempo; el manuscrito evalua 12 millones de agentes sinteticos y 24 millones de elecciones.
- Investigacion academica sobre comportamiento financiero: el modelo permite generar respuestas sinteticas a encuestas de hogares y compararlas con datos reales, facilitando experimentos contrafactuales sin coste de recogida de datos.
- Generacion de datos sinteticos de acompanamiento: el proyecto publico incluye scripts de generacion de datos sinteticos independientes que pueden usar este modelo como politica de decision.
- Analisis de sensibilidad de politicas publicas: cambiando el estado de los hogares en la simulacion se puede estudiar el efecto de condiciones economicas sobre la adopcion de productos financieros.
- Evaluacion de modelos de decision: sirve como referencia (baseline) para comparar otras politicas de decision financiera dentro del mismo marco de puntuacion de opciones.
- Prototipado en estaciones de trabajo Apple: al estar en MLX FP16, permite iterar localmente en Mac con Apple Silicon sin depender de GPUs NVIDIA para pruebas de integracion.

## Benchmarks y rendimiento

| Test | Idioma de entrada | Backend / precision | Denominador QA | Versiones de pregunta | Accuracy | F1 macro por pregunta |
|---|---|---|---:|---:|---:|---:|
| Preguntas financieras compartidas | Ingles | MLX FP16 | 240.458 | 119 | 74,53% | 38,01% |

La accuracy pondera por igual cada registro de QA. El F1 macro por pregunta promedia el F1 sobre todas las clases candidatas dentro de cada version de pregunta y luego pondera por igual cada version. Los resultados nativos en BF16 y los del test ampliado se encuentran en la model card del release nativo y en los metodos M4/M6 del manuscrito.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,85 GB en FP16 (421M parametros x 2 bytes), mas overhead de activaciones y tokenizer.
- GPU recomendadas: el formato es MLX FP16, orientado a Apple Silicon (serie M). Para el checkpoint nativo equivalente se citan pruebas en una NVIDIA A100 PCIe 40GB en FP16, aunque esa medicion corresponde al checkpoint bilingue y no a este repositorio.
- Cabe en GPU de consumo: si, en cualquier GPU con al menos 2 GB de memoria libre en su version nativa; en Apple Silicon cabe en cualquier Mac con chip M1 o superior.
- Opciones de despliegue: runtime MLX (libreria laya) con el script predict_example.py incluido; vLLM, llama.cpp, Ollama y TGI no estan documentados para este formato en la informacion disponible.
- Latencia y throughput: no disponibles para este checkpoint; el manuscrito reporta tiempos de una sola peticion para el checkpoint bilingue en A100, no para este.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sharp-421m-3rounds-mlx (este) | 421M | no disponible | Puntuacion de opciones financieras | Investigacion controlada v1.2 | Hugging Face |
| fin-laya-3-rounds | 421M | no disponible | Puntuacion de opciones financieras | Investigacion controlada v1.2 | Hugging Face |
| fin-laya-multilingual-mlx | no disponible | no disponible | Puntuacion de opciones financieras bilingue | Investigacion controlada v1.2 | Hugging Face |
| convaiinnovations/laya (base) | ~421M | no disponible | Encoder base | Apache-2.0 (upstream) | Hugging Face |

No se dispone de modelos comparables de proposito general con los que contrastar rendimiento, ya que la tarea es especifica de decision financiera y los benchmarks publicados no son directamente transferibles.

## Limitaciones y advertencias

- Licencia de investigacion controlada: el uso comercial esta restringido por la licencia s2-mas-controlled-research-v1.2; es necesario revisar el texto completo antes de cualquier despliegue en produccion.
- Solo soporta ingles; no hay capacidades multilingues declaradas.
- No es un modelo generativo: no puede usarse para chat, redaccion, codigo ni tareas de proposito general.
- Riesgo de alucinacion estructural: al puntuar opciones sobre estados de hogar sinteticos, las predicciones no reflejan necesariamente hogares reales fuera de la distribucion de entrenamiento.
- Sesgos potenciales derivados de los datos de encuesta originales (posiblemente de un unico pais o region, dado el uso de cuentas en renminbi en los ejemplos), no documentados en la informacion disponible.
- Los registros de entrenamiento y evaluacion no se distribuyen con el modelo, lo que limita la reproducibilidad.
- El motor GENESE/MAS permanece privado, por lo que la integracion completa en el marco S²-MAS no es posible solo con este repositorio.
- Sin descargas ni validacion comunitaria en el momento de la consulta; tratar como artefacto de investigacion no auditado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ya9919/sharp-421m-3rounds-mlx
- Release nativo equivalente: https://huggingface.co/ya9919/fin-laya-3-rounds
- Runtime MLX de seis rondas: https://huggingface.co/ya9919/FinL-mlx
- Checkpoint bilingue MLX: https://huggingface.co/ya9919/fin-laya-multilingual-mlx
- Licencia: https://huggingface.co/ya9919/fin-laya-mlx-3-rounds/blob/main/LICENSE
- Manuscrito S²-MAS: https://github.com/KataDavidXD/s2-mas/blob/main/paper/S2_MAS_Paper.pdf
- Proyecto S²-MAS: https://github.com/KataDavidXD/s2-mas
- Modelo base: https://huggingface.co/convaiinnovations/laya
