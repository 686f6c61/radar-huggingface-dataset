# xl-24/gemma4-4b-atc-finetune-32-64-v2

## Resumen

`xl-24/gemma4-4b-atc-finetune-32-64-v2` es un ajuste fino (finetune) del modelo base `unsloth/gemma-4-E4B-it-unsloth-bnb-4bit`, una variante cuantizada en 4 bits del Gemma 4 E4B instructivo publicada por Unsloth. El autor del ajuste es el usuario `xl-24`, que lo ha subido a Hugging Face con licencia Apache 2.0 y etiquetas que apuntan a un entrenamiento realizado con las librerías Unsloth y TRL. El nombre del repositorio sugiere un ajuste orientado a control de tráfico aéreo (ATC, *air traffic control*) con una ventana de contexto de trabajo de 32-64, aunque esta interpretación no está confirmada en la model card.

El modelo se distribuye en formato safetensors y está pensado para generación de texto en inglés. Al derivar de un modelo Gemma 4 de la familia E4B, se trata de un modelo compacto (en torno a los 4.000 millones de parámetros nominales del modelo base), adecuado para despliegue en hardware relativamente modesto. La model card es mínima: no aporta detalles sobre la composición del dataset de ajuste, hiperparámetros, número de pasos ni evaluación.

La relevancia de esta ficha es doble: por un lado, documenta un ejemplo típico de finetune comunitario sobre Gemma 4 con Unsloth; por otro, advierte de que, al carecer de evaluación publicada y de documentación del dataset, su uso en producción debe tratarse con cautela. La información disponible procede casi exclusivamente de los metadatos del repositorio y de la model card del autor, por lo que muchos campos técnicos quedan como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Gemma 4 E4B; detalles no publicados en la model card) |
| Parámetros totales | no disponible (modelo base Gemma 4 E4B; cifra exacta no confirmada en la información) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (el nombre del repo sugiere 32-64, sin confirmar) |
| Tipos de cuantización | el base está cuantizado en 4 bits (bnb-4bit); el finetune se publica en safetensors sin detalle de cuantización |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo, más allá de que deriva de la familia Gemma 4 (modelo transformer de Google) a través de la variante `gemma-4-E4B-it` publicada por Unsloth. El sufijo "E4B" en el nombre del base apunta a una variante de eficiencia de la familia Gemma 4, pero la model card no documenta capas, atención, dimensiones ni configuración de tokenizador.

En cuanto al entrenamiento, la model card indica únicamente que el modelo fue entrenado "2x faster with Unsloth", lo que confirma el uso del framework de Unsloth para el ajuste fino (probablemente LoRA/QLoRA sobre el base cuantizado en 4 bits) y de TRL, según las etiquetas. No se especifican el dataset, el número de tokens de entrenamiento, la composición de los datos, ni si hubo RLHF, DPO o ajuste supervisado. El nombre del repositorio ("atc-finetune-32-64-v2") sugiere un ajuste orientado a control de tráfico aéreo y una ventana de contexto o configuración de 32-64, pero no hay confirmación en la documentación.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Gemma 4 E4B instructivo.
- Razonamiento y respuesta a instrucciones conversacionales, presumiblemente conservadas del ajuste instructivo del base.
- Capacidad de ajuste específico al dominio sugerido por el nombre del repositorio (control de tráfico aéreo), aunque no documentada.
- Soporte de tool calling / function calling: no disponible (no confirmado para este finetune).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Asistente de consultas de dominio ATC: si el ajuste confirma su orientación a control de tráfico aéreo, podría emplearse para responder preguntas sobre procedimientos, fraseología o normativa, siempre con validación humana por la ausencia de evaluación publicada.
- Generación de borradores de documentación técnica en inglés: el modelo puede redactar textos a partir de instrucciones, aprovechando su herencia instructiva, en entornos donde el inglés sea aceptable.
- Prototipado rápido de chatbots especializados: al ser un modelo compacto (repo de 0,4 GB en safetensors), permite iterar en local con recursos limitados antes de escalar a un modelo mayor.
- Clasificación y extracción de información en texto inglés: tareas de etiquetado o resumen que no requieran alta precisión y donde se pueda validar la salida.
- Base para nuevos ajustes finos: sirve como punto de partida para experimentos con Unsloth/TRL sobre dominios concretos, dado su tamaño reducido y licencia permisiva.
- Evaluación comparativa de finetunes comunitarios: útil en investigación para estudiar el efecto de ajustes sobre variantes cuantizadas de Gemma 4.
- Despliegue en entornos con hardware modesto: su tamaño permite ejecución en GPU de consumo, aunque la falta de benchmarks impide garantizar calidad en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; al derivar de un base de ~4B cuantizado en 4 bits, una estimación orientativa sería de 3-5 GB en 4 bits y 8-10 GB en fp16, pero no está confirmado por el autor.
- GPU recomendadas: no disponible (sin datos del autor). Por tamaño del base, cabría esperar funcionamiento en RTX 3060/4060/4090 y GPUs de datacenter como A100 o H100, pero sin confirmación.
- ¿Cabe en GPU de consumo? Probablemente sí, dado el tamaño del base y el repo de 0,4 GB, aunque no está documentado.
- Opciones de despliegue: el repo incluye la etiqueta `text-generation-inference` y es compatible con `transformers` y `endpoints_compatible`; también podría cargarse con Unsloth. No se documenta soporte explícito de vLLM, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| xl-24/gemma4-4b-atc-finetune-32-64-v2 | no disponible (~4B base) | no disponible | Apache 2.0 | Hugging Face | Finetune comunitario sin evaluación publicada |
| unsloth/gemma-4-E4B-it-unsloth-bnb-4bit | ~4B (base) | no disponible | según Gemma 4 (no confirmado) | Hugging Face | Modelo base del que deriva este finetune |
| Gemma 4 E4B instructivo (original) | ~4B | no disponible | según Gemma 4 (no confirmado) | Hugging Face / Google | Referencia de la familia; sin datos comparativos en esta ficha |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de evaluación publicada: no hay benchmarks, métricas ni comparaciones que permitan estimar la calidad del ajuste.
- Dataset de entrenamiento no documentado: se desconoce la composición, el volumen y la procedencia de los datos, lo que impide evaluar sesgos y riesgos de contaminación.
- Riesgo de alucinación: inherente a los modelos generativos; sin evaluación, no puede acotarse su magnitud.
- Idioma limitado al inglés según la etiqueta del repositorio; no se garantiza un buen comportamiento en castellano u otros idiomas.
- Licencia Apache 2.0 declarada por el autor, pero conviene verificar la compatibilidad con la licencia del modelo base Gemma 4, que puede imponer condiciones adicionales.
- El nombre del repositorio sugiere un dominio crítico (control de tráfico aéreo); no debe usarse en entornos operativos reales sin validación exhaustiva y supervisión humana.
- Model card mínima: sin información sobre hiperparámetros, pasos de entrenamiento ni método de ajuste exacto.
- Contexto no confirmado: el "32-64" del nombre podría referirse a la longitud de contexto, pero no está verificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xl-24/gemma4-4b-atc-finetune-32-64-v2
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it-unsloth-bnb-4bit
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (librería de entrenamiento): https://github.com/huggingface/trl
