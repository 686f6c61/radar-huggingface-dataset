# Unluckkie/Ling-3.0-tiny-APEX-MCQ5-IK-GGUF

## Resumen

Ling-3.0-tiny-APEX-MCQ5-IK-GGUF es una suite de cuantizaciones GGUF de alta ingeniería del modelo base inclusionAI/Ling-3.0-tiny, publicada por el usuario Unluckkie. El modelo subyacente es un transformer con arquitectura Mixture of Experts (MoE) de 7.893.392.800 parámetros totales y aproximadamente 1.300 millones de parámetros activos por token, distribuidos en 128 expertos enrutados. La propuesta de este repositorio no es un modelo nuevo, sino un conjunto de cuantizaciones optimizadas para el runtime `ik_llama.cpp`, con una metodología propia que combina la protección estructural de capas (APEX) con la asignación de presupuesto de precisión según frecuencia de lectura de tensores (MCQ5).

El interés de esta ficha radica en que las cuantizaciones estándar de un MoE con 128 expertos suelen degradar gravemente el enrutamiento y la lógica del modelo cuando se baja de 4 bits. El autor documenta una escalera de perplejidad medida sobre `wiki.test.raw` que demuestra que es posible mantener una pérdida de solo el 1,8 % respecto a un Q6_K con un fichero de 4,3 GB, y del 2,7 % con 4,0 GB, gracias a mantener el router en F16 y los expertos compartidos en precisión alta mientras se comprimen agresivamente los expertos enrutados.

La relevancia práctica es doble: por un lado, ofrece una vía para ejecutar un MoE de casi 8.000 millones de parámetros en equipos con 8 GB de RAM; por otro, advierte de una dependencia estricta del fork `ik_llama.cpp`, ya que los tensores `IQ2_KS`, `IQ3_KS`, `IQ4_KS` e `IQ4_KSS` no cargan en `llama.cpp` estándar, Ollama ni LM Studio. La licencia MIT del repositorio y del modelo base facilita su uso comercial, aunque el idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture of Experts (MoE), 128 expertos enrutados |
| Parametros totales | 7.893.392.800 (7,9 B) |
| Parametros activos | Aproximadamente 1,3 B por token |
| Longitud de contexto | No disponible en la informacion proporcionada (el ejemplo de uso emplea `-c 8192`) |
| Tipos de cuantizacion | IQ2_KS, IQ3_KS, IQ3_XXS, IQ4_KS, IQ4_KSS, IQ6_K, Q8_0, F16 (router); variantes IK-Quality, IK-Balanced, IK-Compact |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | GGUF (requiere `ik_llama.cpp`; incompatible con `llama.cpp` estandar, Ollama y LM Studio) |

## Arquitectura y entrenamiento

El modelo base es un transformer con capa MoE de 128 expertos enrutados y un experto compartido siempre activo, con 7,9 B de parámetros totales y unos 1,3 B activos por token. El repositorio no documenta el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO), por lo que esos datos deben consultarse en la model card de `inclusionAI/Ling-3.0-tiny`. Lo que sí documenta este repositorio es la metodología de cuantización, que constituye su innovación técnica principal.

La metodología se apoya en cuatro decisiones concretas. Primero, el router MoE (`ffn_gate_inp`, `exp_probs_b`) se mantiene siempre en F16 para evitar que el enrutamiento derive hacia expertos incorrectos. Segundo, se aplica un presupuesto de lectura (MCQ5): el experto compartido, leído en cada token, se mantiene en Q8_0 o IQ6_K, mientras que los 128 expertos enrutados, leídos en una proporción de 8 entre 128, se comprimen según su profundidad. Tercero, el gradiente APEX conserva en mayor precisión las capas iniciales y finales, responsables de sintaxis y formato de salida, y comprime más las intermedias. Cuarto, se emplean las rejillas no lineales `_KS` de `ik_llama.cpp` para maximizar la velocidad de inferencia en CPU. El autor indica que probó varias builds por debajo de 3,5 GB y todas superaron una perplejidad de 8,4, lo que fija en 3 bits el mínimo viable para este modelo.

## Capacidades

- Generación de texto conversacional en inglés, con pipeline declarado `text-generation`.
- Razonamiento y lógica general, preservados gracias a la protección del router y a la retención de al menos 3 bits en los expertos enrutados.
- Procesamiento de contexto moderado: el ejemplo oficial emplea 8.192 tokens de contexto.
- Ejecución en CPU con el runtime `ik_llama.cpp`, incluyendo soporte de los kernels `_KS`.
- Compatibilidad con endpoints (`endpoints_compatible`) según los tags del repositorio.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Inferencia en CPU de bajo consumo: con 4 hilos en un i5-8250U y contexto de 8K, la variante IK-Balanced consume unos 5,5 GB de RAM y genera entre 14 y 16 tokens por segundo, lo que permite desplegar un MoE de 7,9 B en portátiles sin GPU dedicada.
- Estaciones de trabajo con 8 GB de RAM: la variante IK-Compact (3,7 GB) deja margen suficiente para el sistema operativo y aplicaciones auxiliares, siendo adecuada para asistentes locales de escritorio.
- Prototipado y evaluación de modelos MoE: la escalera de perplejidad publicada permite elegir el punto de compromiso entre tamaño y fidelidad antes de invertir en infraestructura.
- Generación de texto por lotes en servidores sin acelerador: la evaluación de prompt ronda los 90 tokens por segundo en CPU, un valor razonable para tareas de resumen o clasificación por lotes.
- Entornos con requisitos de licencia permisiva: la licencia MIT del repositorio y del modelo base facilita la integración en productos comerciales sin obligaciones de copyleft.
- Investigación sobre cuantización de MoE: el repositorio sirve como referencia reproducible de cómo la protección del router y de los expertos compartidos afecta a la perplejidad final.
- Despliegue en contenedores ligeros: al no requerir GPU, el binario de `ik_llama.cpp` junto con el GGUF de 4,0 GB puede empaquetarse en imágenes de contenedor modestas para servicios internos de generación de texto.

## Benchmarks y rendimiento

Los únicos datos publicados son mediciones de perplejidad sobre `wiki.test.raw` (`n_ctx=512`, 100 fragmentos) frente a una base Q6_K, junto con métricas de velocidad en CPU.

| Variante | Tamano | PPL | Perdida vs Q6_K | Configuracion |
|---|---|---|---|---|
| Q6_K (referencia) | 6,9 GB | 6,822 | 0,0 % | Referencia sin comprimir |
| IK-Quality | 4,3 GB | 6,945 | +1,8 % | Expertos IQ4_KS, compartidos Q8_0, atencion IQ6_K |
| IK-Balanced | 4,0 GB | 7,008 | +2,7 % | Expertos IQ4_KSS, compartidos IQ6_K |
| IK-Compact | 3,7 GB | 7,084 | +3,8 % | Expertos IQ3_KS / IQ3_XXS |

| Metrica de velocidad (i5-8250U, 4 hilos) | Valor |
|---|---|
| Evaluacion de prompt | ~90 tokens/s |
| Generacion | ~14-16 tokens/s |
| RAM con contexto de 8K | ~5,5 GB |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica para las variantes documentadas, que están pensadas para inferencia en CPU; no se proporcionan estimaciones de VRAM para despliegue en GPU.
- RAM: aproximadamente 5,5 GB con contexto de 8K para la variante IK-Balanced; la variante IK-Compact (3,7 GB en disco) está pensada para sistemas con 8 GB de RAM.
- GPU recomendadas: no disponible en la información proporcionada; el repositorio no documenta despliegue en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: no disponible; el runtime objetivo es `ik_llama.cpp` en CPU.
- Opciones de despliegue: exclusivamente `ik_llama.cpp` (https://github.com/ikawrakow/ik_llama.cpp). No es compatible con `llama.cpp` estándar, Ollama ni LM Studio.
- Latencia y throughput: ~90 tokens/s en evaluación de prompt y ~14-16 tokens/s en generación sobre un i5-8250U con 4 hilos y contexto de 8K.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| Ling-3.0-tiny-APEX-MCQ5-IK-GGUF | 7,9 B totales / 1,3 B activos | No disponible | MIT | GGUF para `ik_llama.cpp` | Cuantizaciones optimizadas con protección de router y gradiente APEX |
| inclusionAI/Ling-3.0-tiny (base) | 7,9 B totales / 1,3 B activos | No disponible | No disponible en la informacion proporcionada | Safetensors y derivados | Modelo original sin cuantizar |
| Cuantizaciones APEX estándar de Ling-3.0-tiny | 7,9 B totales / 1,3 B activos | No disponible | No disponible en la informacion proporcionada | GGUF | El autor las describe como mayores y más lentas que esta suite híbrida |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Dependencia estricta de `ik_llama.cpp`: los tensores `IQ2_KS`, `IQ3_KS`, `IQ4_KS` e `IQ4_KSS` no cargan en `llama.cpp` estándar, Ollama ni LM Studio, lo que limita las opciones de despliegue.
- Idioma: el modelo solo declara soporte de inglés, por lo que su uso en castellano u otros idiomas no está respaldado por el autor.
- Licencia: el repositorio y el modelo base se distribuyen bajo MIT, lo que permite uso comercial, pero conviene verificar las condiciones del modelo base en su propia model card.
- Riesgo de alucinación: no se documenta ningún proceso de alineación o mitigación específico en este repositorio; el comportamiento conversacional depende del modelo base.
- Sesgos: no se proporciona información sobre sesgos conocidos del modelo base ni de las cuantizaciones.
- Precisión mínima: el autor advierte que las builds por debajo de 3,5 GB superan una perplejidad de 8,4, por lo que no se recomienda bajar de 3 bits en los expertos enrutados.
- Longitud de contexto: no se especifica la ventana máxima nativa; el ejemplo oficial usa 8.192 tokens, pero no se confirma que sea el límite.
- Madurez del repositorio: solo 2 likes y 1.728 descargas en el momento de la consulta, con una única actualización reciente; conviene validar la reproducibilidad de las métricas en el propio entorno.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Unluckkie/Ling-3.0-tiny-APEX-MCQ5-IK-GGUF
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-tiny
- Modelo base (variante base citada en la model card): https://huggingface.co/inclusionAI/Ling-3.0-tiny-base
- Runtime requerido: https://github.com/ikawrakow/ik_llama.cpp
