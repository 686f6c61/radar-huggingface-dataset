# trinityomni/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF

## Resumen

Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF es un ajuste fino de Qwen3.5-9B desarrollado por trinityomni a partir del trabajo de DavidAU. Se trata de un modelo denso de aproximadamente 8.953.803.264 parámetros, con ventana de contexto de 256k, entrenado mediante un proceso multi-etapa que combina fusiones de varios fine tunes y técnicas de ablación de censura (abliterated) para producir un modelo que el autor describe como "heretico" y sin restricciones. Su objetivo es maximizar la inteligencia general y el seguimiento de instrucciones, manteniendo a la vez una capacidad de razonamiento y pensamiento compactado.

El modelo destaca por su disponibilidad en cuantizaciones GGUF tanto regulares como MTP (multi-token prediction), con una optimización IMATRIX que, según el autor, mejora la precisión de los cuants entre un 2% y un 4%. Incluye soporte de visión activado mediante un archivo mmproj, lo que lo habilita para tareas de imagen-texto. Su licencia Apache-2.0 permite uso comercial, aunque el carácter "uncensored" implica limitaciones éticas y legales en determinados entornos. Es especialmente relevante para desarrolladores que buscan un modelo de 9B con alto rendimiento en razonamiento, escritura creativa, roleplay y generación de código sin filtros, en inglés y chino.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.5-9B) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantizacion | GGUF regular y MTP (NEO IMATRIX), tensores de salida en 16 bits, tensores MTP en Q8_0; pesos base en bfloat16 |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16) y GGUF |

## Arquitectura y entrenamiento

El modelo se fundamenta en la arquitectura de Qwen3.5-9B, un transformer denso que no emplea mezcla de expertos (MoE). El proceso de entrenamiento, descrito por el autor como un "multi-stage fine tune y multi-stage merge" realizado en hardware local junto a Nightmedia, combina varios ajustes finos de Qwen3.5-9B para elevar la inteligencia general y la capacidad de seguir instrucciones. No se han publicado datos sobre el número de tokens de entrenamiento ni la composición del dataset.

La técnica de "abliterated" se aplica para eliminar las capas de rechazo del modelo, dando lugar a un comportamiento "heretico" que no cuestiona las peticiones del usuario. Además, la inclusión de MTP (multi-token prediction) permite que la decodificación prediga varios tokens por paso, acelerando la inferencia en los GGUFs MTP. Las cuantizaciones NEO IMATRIX han sido ajustadas para mejorar la precisión de los pesos cuantizados, y el tensor de salida se ha mantenido en 16 bits para todas las cuantizaciones, lo que contribuye a mantener la fidelidad del modelo incluso en pesos de 4 bits.

## Capacidades

- Generación de texto, razonamiento y pensamiento estructurado, con un bloque de "thinking" compactado que el autor afirma es más fuerte en muchos casos.
- Soporte de visión mediante archivo mmproj, que habilita el pipeline image-text-to-text.
- Escritura creativa, ficción y roleplay sin restricciones, gracias a la eliminación de la censura.
- Generación de código, según las etiquetas del modelo y el uso previsto en tareas de programación.
- Capacidades multilingües en inglés y chino, declaradas en la model card.
- Modo "instruct" y modo "thinking" con parámetros de temperatura y penalización recomendados por el autor para distintos tipos de tareas.
- Cuantizaciones GGUF regulares y MTP listas para ejecutarse en aplicaciones estándar de inferencia local (LM Studio, llama.cpp, Ollama, etc.).

## Casos de uso

- Roleplay narrativo sin filtros: el modelo puede generar diálogos y tramas complejas en conversaciones largas, aprovechando la ventana de contexto de 256k y la ausencia de rechazo. Ideal para aplicaciones de simulación de personajes en las que se requiera libertad total de contenido.
- Asistente de programación en entornos locales: con su soporte de tareas de código y modo thinking para precisión, puede integrarse en flujos de desarrollo como una herramienta de autocompletado o para revisar fragmentos de código, manteniendo la información del proyecto en contexto gracias a la ventana larga.
- Análisis de imágenes en pipelines de investigación: al activar el módulo de visión con el mmproj, puede describir imágenes, extraer información visual y responder preguntas sobre ellas. Esto lo hace útil para documentación técnica, análisis de capturas o asistencia visual en entornos sin conexión a APIs externas.
- Chat multilingüe en inglés y chino: su soporte bilingüe declarado permite construir chatbots que alternen idiomas sin perder coherencia, útil para soporte técnico o herramientas de traducción asistida.
- Generación de contenido creativo en producción: por su naturaleza "uncensored", puede emplearse para redactar ficción, guiones o contenido de marketing con tono libre, aprovechando su capacidad de razonamiento de múltiples pasos para mantener la coherencia de la trama.
- Inferencia rápida en GPU de consumo: con las cuantizaciones MTP y Q4_K_S, el autor reporta velocidades de más de 185 tokens por segundo en una RTX 5090, lo que lo hace adecuado para prototipos interactivos o aplicaciones en tiempo real en hardware doméstico.

## Benchmarks y rendimiento

Los siguientes resultados han sido facilitados por el autor del modelo en su model card. Corresponden a pruebas con el harness estandar, en modo instruct, y no están verificados de forma independiente.

| Modelo y cuantizacion | arc/c | arc/e | boolq | hswag | obkqa | piqa | wino |
|---|---|---|---|---|---|---|---|
| The-Defiant-Fable (bf16) | 0.649 | 0.832 | 0.895 | 0.713 | 0.482 | 0.783 | 0.699 |
| The-Defiant-Fable (mxfp8) | 0.647 | 0.836 | 0.895 | 0.706 | 0.460 | 0.784 | 0.695 |
| The-Defiant-Fable (mxfp4) | 0.640 | 0.824 | 0.886 | 0.703 | 0.468 | 0.780 | 0.691 |
| Qwen3.5-9B-Instruct (mxfp8) | 0.571 | 0.719 | 0.895 | 0.683 | 0.426 | 0.770 | 0.671 |
| Qwen3.6-27B-Instruct (mxfp8) | 0.647 | 0.803 | 0.910 | 0.773 | 0.450 | 0.806 | 0.742 |
| Qwen3.6-35B-A3B-Instruct (mxfp8) | 0.581 | 0.757 | 0.892 | 0.751 | 0.428 | 0.803 | 0.688 |
| Qwen3.5-27B-Instruct (mxfp8) | 0.557 | 0.711 | 0.868 | 0.533 | 0.452 | 0.706 | 0.695 |

El autor señala que el modelo supera los 7 benchmarks críticos de Qwen3.5-27B y se acerca a Qwen3.6-27B en algunos casos. Asimismo, advierte que en modo thinking las puntuaciones pueden ser superiores a las presentadas, aunque esto no está reflejado en los datos numéricos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de ~9B en GGUF Q4_K_S suele requerir entre 6 y 7 GB de VRAM; en 8 bits, aproximadamente 10-12 GB. El autor no proporciona cifras exactas de VRAM.
- GPU recomendadas: para aprovechar las velocidades reportadas (130 t/s en Q4_K_S regular y >185 t/s con MTP), se necesita una GPU moderna de gama alta, como la RTX 5090. En entornos de producción, una A100 o H100 con 40-80 GB de VRAM es suficiente para servir el modelo en bfloat16.
- Compatibilidad con GPU de consumo: el modelo cabe en tarjetas como RTX 3060 12GB, RTX 4070 o superiores con cuantización 4-bit, aunque MTP puede degradar el rendimiento en contextos de baja aceptación de tokens.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio para GGUFs; vLLM o TGI para safetensors si se requiere un servicio de inferencia de alto rendimiento.
- Latencia y throughput: según el autor, Q4_K_S regular alcanza ~130 t/s y los GGUFs MTP pueden superar 185 t/s con una tasa de aceptación del 60% (prediciendo 2 tokens) en una RTX 5090 bajo Windows 11. Estas cifras variarán con el hardware, sistema operativo y aplicación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Visión | Uncensored |
|---|---|---|---|---|---|
| Qwen3.5-9B-The-Defiant-Fable (este) | 8.953.803.264 | 256k | Apache-2.0 | Sí (mmproj) | Sí |
| Qwen3.5-9B-Instruct | ~9B | no disponible | Apache-2.0 | no disponible | No |
| Qwen3.6-27B-Instruct | ~27B | no disponible | Apache-2.0 | no disponible | No |
| Qwen3.6-35B-A3B-Instruct | 35B (A3B activos) | no disponible | Apache-2.0 | no disponible | No |

Cabe destacar que la comparativa de benchmarks presentada anteriormente sitúa a este modelo de 9B en varios puntos por encima del Qwen3.5-9B-Instruct base, y en algunos casos por delante de modelos 27B. No obstante, los datos de contexto, visión y censura de los modelos comparados no se encuentran en la información proporcionada.

## Limitaciones y advertencias

- Al ser un modelo "uncensored" y "hetréico", puede generar contenido dañino, ilegal o éticamente inaceptable sin rechazo. Esto supone un riesgo considerable en aplicaciones públicas o reguladas.
- Los sesgos inherentes al modelo base y al proceso de fine tune no han sido mitigados; la ausencia de censura puede amplificar respuestas sesgadas.
- Solo se ha declarado soporte para inglés y chino. El uso en otros idiomas puede producir resultados inconsistentes o de baja calidad.
- La documentación del entrenamiento es incompleta: no se especifican datos de tokens, composición del dataset ni el proceso exacto de ablación. Esto dificulta la reproducción y confiabilidad del comportamiento.
- Los benchmarks publicados son afirmaciones del autor y no han sido reproducidos por un organismo independiente. No se deben tomar como garantía de rendimiento absoluto.
- El rendimiento de las cuantizaciones MTP depende de la temperatura: el autor recomienda mantenerla por debajo de 1 y la penalización por repetición en 1. Temperaturas más altas degradan la capacidad de predicción de múltiples tokens.
- La frecuencia de aceptación de tokens MTP puede caer por debajo del 50% en ciertos casos, en cuyo caso los GGUFs regulares ofrecen mejor velocidad. Es necesario evaluar cada caso de uso.

## Enlaces

- Repositorio del modelo: https://huggingface.co/trinityomni/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
- Modelo base de DavidAU: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP
- GGUFs MTP relacionados: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
- Modelo original de referencia: https://huggingface.co/Qwen/Qwen3.5-9B
