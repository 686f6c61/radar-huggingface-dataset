# tinyopsec/Llama-3.2-1B-pruned-20pct-GGUF

## Resumen

Llama-3.2-1B-pruned-20pct-GGUF es una colección de cuantizaciones en formato GGUF de un Llama 3.2 1B al que se le ha aplicado una poda estructurada del 20% en las capas MLP. El modelo base es meta-llama/Llama-3.2-1B, desarrollado por Meta, y la versión podada proviene del repositorio `oopere/Llama-3.2-1B-pruned-20pct`, siendo tinyopsec quien publica las cuantizaciones compatibles con llama.cpp. El objetivo del proyecto es reducir el tamaño y el coste computacional de un modelo ya pequeño, manteniendo la mayor capacidad posible tras eliminar el 20% de los parámetros de las capas MLP.

Su relevancia radica en el ámbito del despliegue en hardware muy limitado: con aproximadamente 1.075 millones de parámetros tras la poda y cuantizaciones de hasta 2 bits, el modelo puede ejecutarse en CPU, portátiles, Raspberry Pi o móviles. Es un candidato interesante para experimentación sobre poda estructurada y para casos de uso edge donde cada megabyte y cada milisegundo cuentan. La licencia es la Meta Llama 3.2 Community License, que permite uso comercial sujeto a sus condiciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador (Llama 3.2) con poda estructurada del 20% en capas MLP |
| Parametros totales | 1.074.792.480 (dato del safetensors; tras la poda) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el base Llama 3.2 1B usa 128.000 tokens, pero no consta en la ficha) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible (el base Llama 3.2 soporta oficialmente inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | Meta Llama 3.2 Community License (llama3.2) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Llama 3.2 1B, un transformer decodificador autorregresivo de la familia Llama 3.2. Sobre ese base se aplicó una poda estructurada del 20% en las capas MLP (perceptrón multicapa), es decir, se eliminaron neuronas completas en lugar de pesos individuales, lo que permite obtener reducciones reales de latencia y memoria sin requerir kernels dispersos especiales. El autor del README no documenta el método exacto de poda (por ejemplo, si se usaron criterios de magnitud de activaciones) ni si se realizó una fase de recuperación mediante fine-tuning posterior.

No se dispone de información sobre datos de entrenamiento adicionales, número de tokens de reentrenamiento ni técnicas de alineación (RLHF/DPO) aplicadas tras la poda; el modelo hereda lo publicado por Meta para Llama 3.2 1B. La principal innovación de esta ficha es la combinación de poda estructurada con una amplia batería de cuantizaciones GGUF (de F16 a Q2_K), optimizada para el ecosistema llama.cpp.

## Capacidades

- Generacion de texto general en los idiomas del modelo base Llama 3.2 1B.
- Completado de texto y tareas básicas de razonamiento, con la limitación propia de un modelo de ~1B de parámetros.
- Capacidades reducidas respecto al modelo base por la eliminación del 20% de las neuronas MLP; el propio autor advierte evaluar antes de usar.
- No incluye capacidades de visión, audio ni modo de razonamiento extendido.
- No hay soporte documentado de tool calling ni de agentes; es un modelo base (base model) sin instrucción.
- Ejecución eficiente en cualquier runtime compatible con GGUF: llama.cpp, Ollama, LM Studio, koboldcpp.

## Casos de uso

- Experimentación en poda estructurada: ideal como banco de pruebas para investigadores que quieran comparar el efecto de eliminar un 20% de las neuronas MLP frente al modelo original en benchmarks propios.
- Despliegue en dispositivos edge: con cuantización Q4_K_M o inferior cabe en CPUs sin GPU dedicada, adecuado para Raspberry Pi, SBCs o equipos antiguos.
- Asistentes locales offline: generación de texto en local sin conexión, por ejemplo para redacción asistida en portátiles con recursos mínimos.
- Prototipado rápido de pipelines de NLP: integración en scripts con llama-cpp-python para tareas de extracción, resumen o clasificación aproximada donde la calidad del modelo de 1B basta.
- Enseñanza y demos: útil en cursos y talleres para mostrar el impacto de la poda y la cuantización sobre la calidad de salida en tiempo real.
- Generación sintética de datos de bajo coste: procesamiento masivo de texto en CPU donde el throughput por vatio importa más que la máxima calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona comparativas de perplejidad, MMLU ni de ninguna otra métrica entre el modelo podado y el Llama 3.2 1B original, por lo que se recomienda evaluar el modelo en las tareas objetivo antes de usarlo en producción.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: el archivo F16 ocupa 3,0 GB; las cuantizaciones Q8_0 rondarían ~1,2 GB, Q4_K_M en torno a ~0,7 GB y Q2_K por debajo de ~0,5 GB (estimaciones proporcionales al tamaño del repo; el autor no publica tamaños por archivo salvo F16).
- GPU recomendadas: no es necesario uso de GPU; se ejecuta cómodamente en CPU. En GPU, cualquier tarjeta con 4 GB de VRAM (por ejemplo GTX 1650 o superior) basta incluso en F16.
- Consumer GPUs: cabe sin problemas en prácticamente cualquier GPU doméstica actual; también cabe en la RAM de cualquier portátil moderno.
- Opciones de despliegue: llama.cpp (comando `llama-cli` documentado en el README), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponible; al ser un modelo de ~1B podado, se espera latencia baja en CPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Poda | Contexto (base) | Licencia | Formato |
|---|---|---|---|---|---|
| tinyopsec/Llama-3.2-1B-pruned-20pct-GGUF | ~1,07B (tras poda) | 20% MLP estructurada | no disponible (base: 128K) | Llama 3.2 Community | GGUF |
| meta-llama/Llama-3.2-1B | 1,24B | No | 128K | Llama 3.2 Community | safetensors |
| oopere/Llama-3.2-1B-pruned-20pct | ~1,07B | 20% MLP estructurada | no disponible | Llama 3.2 Community | no disponible (pesos originales) |

Frente al Llama 3.2 1B original, esta versión ofrece ~13% menos parámetros y menor huella de memoria a cambio de una posible pérdida de calidad no cuantificada por el autor. Frente a alternativas de tamaño similar como Qwen2.5-0.5B o SmolLM2-1.7B, este modelo destaca por la combinación poda + cuantización agresiva, aunque sin datos de benchmarks publicados no puede afirmarse que supere a ninguna de ellas.

## Limitaciones y advertencias

- Pérdida de calidad no evaluada: la poda del 20% en MLP puede degradar significativamente la capacidad del modelo; el propio autor incluye un disclaimer pidiendo evaluar antes de usar.
- Alucinaciones: como todo modelo de lenguaje pequeño, es propenso a generar contenido falso con apariencia plausible; el riesgo se agrava con la poda y cuantizaciones bajas (Q3, Q2).
- Es un modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable ni está alineado con preferencias humanas.
- Sesgos: hereda los sesgos del corpus de preentrenamiento de Llama 3.2; no se han realizado evaluaciones de sesgo específicas sobre la versión podada.
- Contexto e idiomas: la ficha no documenta la longitud de contexto efectiva tras la poda ni los idiomas verificados.
- Licencia: la Meta Llama 3.2 Community License impone condiciones al uso comercial (restricciones para entidades con más de 700 millones de usuarios activos mensuales y requisitos de atribución); revisar los términos antes de desplegar en producción.
- Cuantizaciones extremas (Q2_K, Q3_K_S) suelen degradar notablemente la calidad; se recomienda Q4_K_M o superior, como indica el autor.

## Enlaces

- Modelo GGUF podado: https://huggingface.co/tinyopsec/Llama-3.2-1B-pruned-20pct-GGUF
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- Modelo podado original: https://huggingface.co/oopere/Llama-3.2-1B-pruned-20pct
- llama.cpp: https://github.com/ggerganov/llama.cpp
