# TheDrummer/Artemis-31B-v1.2

## Resumen

Artemis-31B-v1.2 es un ajuste fino (fine-tune) de 31.273.088.876 parámetros desarrollado por TheDrummer sobre el modelo base google/gemma-4-31B. Se publica en Hugging Face como un repositorio de pesos en safetensors de 62,6 GB, con fecha de creacion del 25 de septiembre de 2026 y una model card marcada explicitamente como «WIP» (en construccion). La informacion disponible sobre esta revision concreta es muy limitada: no se declaran licencia, idiomas soportados, ni detalles del dataset de entrenamiento.

Por contexto de la propia familia Artemis, las versiones v1 y v1.1 se presentan como modelos orientados a escritura creativa, narrativa y roleplay, priorizando dinamismo e imaginacion sobre alineamiento estricto, y declarando una ventana de contexto de 32.768 tokens. La model card de la v1.2 hereda de esas versiones el uso de la plantilla de Gemma 4 en modo «thinking» o «non-thinking», y advierte de que puede ser necesario ajustar con cuidado los parametros de muestreo (samplers).

Su relevancia actual es acotada y muy especifica: se trata de un modelo de nicho para generacion creativa de formato largo, no de un modelo generalista con benchmarks publicados. Cualquier evaluacion seria deberia considerar la ausencia de datos verificables de rendimiento y de licencia en el momento de la publicacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tune sobre google/gemma-4-31B; el autor no detalla la arquitectura interna en la model card) |
| Parametros totales | 31.273.088.876 (aproximadamente 31,3 mil millones, segun safetensors) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible para v1.2; las versiones v1 y v1.1 declaran 32.768 tokens |
| Tipos de cuantizacion | no disponible en el repositorio de v1.2 (solo safetensors); existen publicaciones GGUF separadas para versiones anteriores (v1.1-GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 62,6 GB |
| Modelo base | google/gemma-4-31B |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

La informacion publicada no describe la arquitectura interna mas alla de indicar que se trata de un fine-tune de google/gemma-4-31B y que usa la plantilla de chat de Gemma 4. El recuento real de parametros segun los archivos safetensors es de 31.273.088.876, coherente con la denominacion «31B». No se especifica si el modelo base emplea attention estandar, atencion lineal, capas hibridas o alguna variante MoE, ni el numero de capas, cabezas o dimension del modelo.

Tampoco hay datos sobre el proceso de entrenamiento: se desconoce el numero de tokens utilizados, la composicion del dataset, si hubo fases de RLHF, DPO u otro tipo de alineamiento, asi como cualquier innovacion tecnica (decodificacion especulativa, destilacion, merging de modelos, etc.). La model card unicamente menciona la etiqueta `config-v1q`, el uso de plantilla Gemma 4 en modo thinking o non-thinking y la recomendacion de «negociar» los samplers con cuidado. Las descripciones de las versiones v1 y v1.1, disponibles en directorios de terceros, indican un enfasis en escritura creativa, narrativa y entretenimiento, con menor prioridad para la inteligencia estricta o el alineamiento; no se confirma que estos objetivos se mantengan identicos en la v1.2.

## Capacidades

- Generacion de texto en formato largo, orientada a narrativa, ficcion y escritura creativa, segun el enfoque declarado de la familia Artemis.
- Soporte de modo «thinking» y «non-thinking» mediante la plantilla de Gemma 4, segun la model card.
- Uso en escenarios de roleplay (RP), que el autor describe como especialmente adecuados para el modo thinking de Gemma.
- Ajuste fino de estilo mediante parametros de muestreo (samplers), con advertencia explicita de que puede requerir ajuste conservador.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, decodificacion especulativa): no disponible.

## Casos de uso

- Escritura creativa asistida: generacion de relatos, novelas por capitulos y tramas ramificadas, aprovechando el enfoque narrativo declarado de la familia Artemis y, si se confirma la herencia de contexto, sesiones de hasta 32.768 tokens.
- Roleplay y simulacion de personajes: mantener conversaciones multi-turno con una voz de personaje coherente, usando la plantilla de Gemma 4 en modo thinking para mejorar la consistencia argumental.
- Preproduccion de guiones y dialogos: borradores de dialogos para videojuegos, audiolibros o ficcion interactiva, con iteracion rapida sobre variantes de tono y registro.
- Generacion de material para juegos de rol de mesa: descripciones de escenarios, trasfondos de personajes y respuestas de PNJ generadas en tiempo real durante una partida.
- Ampliacion y reescritura de textos de ficcion: continuacion de pasajes existentes, reescritura con cambio de perspectiva o estilo, y generacion de variantes de un mismo parrafo.
- Filtrado y curaduria de estilos de escritura: uso como generador de referencia para comparar estilos literarios en investigacion sobre preferencias humanas en texto creativo (los autores de texto humano actuan como referencia).
- Prototipado de asistentes conversacionales de entretenimiento: bots de chat con personalidad marcada donde la fidelidad al personaje pesa mas que la precision factual.
- Ajuste adicional por la comunidad: al ser un fine-tune publicado con pesos abiertos en safetensors, puede servir como punto de partida para nuevos fine-tunes de dominio literario o de estilo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de Artemis-31B-v1.2 no incluye tablas de MMLU, HumanEval, GSM8K ni metricas equivalentes, y las busquedas web no devuelven evaluaciones numericas para esta revision.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 62-63 GB solo para pesos, mas overhead de KV cache y activaciones; coincide con el tamano del repositorio (62,6 GB).
- VRAM estimada en FP8/INT8: en torno a 31-33 GB, segun el recuento de 31,3 mil millones de parametros.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 17-19 GB de pesos, mas overhead.
- GPU recomendadas para precision completa: A100 80 GB, H100 80 GB, o configuraciones multi-GPU (2x A100 40 GB / 2x RTX 4090 con reparto de capas).
- GPU consumer: posible en RTX 4090 (24 GB) o RTX 3090 (24 GB) solo con cuantizacion de 4 bits y contexto reducido; en 8 bits no cabe en una unica GPU consumer de 24 GB.
- Opciones de despliegue: llama.cpp y Ollama para cuantizaciones GGUF (existen publicaciones GGUF de la version v1.1; para v1.2 no se ha confirmado una publicacion GGUF), vLLM o TGI para safetensors en precision completa o FP8 sobre hardware de datacenter. La model card no menciona ningun framework concreto.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia para esta revision.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Artemis-31B-v1.2 | 31,3 B | no disponible (v1/v1.1: 32.768) | Escritura creativa y roleplay | no disponible | Safetensors en Hugging Face |
| Artemis-31B-v1.1 | 31 B (aproximado) | 32.768 tokens | Escritura creativa y entretenimiento | no disponible | Safetensors y GGUF en Hugging Face |
| Artemis-31B-v1 | 31 B (aproximado) | 32.768 tokens | Escritura creativa, narrativa y entretenimiento | no disponible | Safetensors; tambien accesible via API de terceros |
| google/gemma-4-31B | 31 B (aproximado) | no disponible | Modelo base de proposito general | no disponible en la informacion proporcionada | Modelo base referenciado por el fine-tune |

No se dispone de datos de rendimiento comparativo entre estas variantes, por lo que la comparativa se limita a parametros, contexto declarado, enfoque y formato de publicacion.

## Limitaciones y advertencias

- Model card incompleta: el propio autor la marca como «WIP», sin informacion sobre licencia, idiomas ni datos de entrenamiento.
- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido. Al derivar de google/gemma-4-31B, conviene verificar tambien los terminos del modelo base antes de cualquier despliegue en produccion.
- Sensibilidad a los parametros de muestreo: la model card advierte de que puede ser necesario ajustar los samplers y recomienda ser conservador, lo que implica que la calidad de salida depende fuertemente de la configuracion.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad; al estar orientado a creatividad y roleplay, la fidelidad factual no es un objetivo declarado.
- Idiomas: se desconoce el soporte multilingue real y la calidad fuera del ingles.
- Contexto no confirmado: la ventana de 32.768 tokens corresponde a las versiones v1 y v1.1; no hay confirmacion de que la v1.2 la mantenga.
- Ausencia de benchmarks: no hay metricas reproducibles que permitan comparar la calidad frente a alternativas del mismo tamano.
- Sesgos: no disponibles; al no publicarse la composicion del dataset ni el proceso de alineamiento, no es posible caracterizar sesgos conocidos.
- Escasez de adopcion: el repositorio registra 0 descargas en el momento de la consulta, por lo que existe poca validacion independiente de su comportamiento.
- Disponibilidad de cuantizaciones: no se ha confirmado la publicacion de GGUF para v1.2, lo que limita el despliegue en hardware de consumo.

## Enlaces

- Modelo en Hugging Face (v1.2): https://huggingface.co/TheDrummer/Artemis-31B-v1.2
- Version anterior v1.1: https://huggingface.co/TheDrummer/Artemis-31B-v1.1
- Cuantizaciones GGUF de v1.1: https://huggingface.co/TheDrummer/Artemis-31B-v1.1-GGUF
- Ficha de Artemis-31B-v1 en Featherless AI: https://featherless.ai/models/TheDrummer/Artemis-31B-v1
- Ficha de Artemis-31B-v1.1 en Featherless AI: https://featherless.ai/models/TheDrummer/Artemis-31B-v1.1
- Artemis 31B V1 en LLM Explorer: https://llm-explorer.com/model/TheDrummer%2FArtemis-31B-v1,69lEchHqBDpE4lnqa9GTtN
- Hoja de samplers colaborativa citada en la model card: https://docs.google.com/spreadsheets/d/1wil6YEHTnQP3DO9EF35ImQMY3lbmRt5_ns-LJavUqwQ
- Formulario para compartir samplers: https://docs.google.com/forms/d/e/1FAIpQLSfeiOeLbNt-xc8tr0BopJ4KawMm3YrLGD5mYLjZqg8ehl35BQ/viewform
