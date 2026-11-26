# yinchenghust/simplememvla_rmbench

## Resumen

SimpleMemVLA es un modelo de vision-lenguaje-accion (VLA) orientado a robótica que introduce una aproximación minimalista al problema de la memoria en tareas de manipulación con dependencia temporal. Desarrollado por el autor yinchenghust y presentado en el artículo arXiv 2609.05533, el modelo prescinde de un módulo de memoria dedicado: en su lugar conserva el historial muestreado de observaciones y lo entrega al backbone como vídeo con marcas de tiempo, delegando la función de memoria en la self-attention nativa del transformer.

El modelo se construye mediante fine-tuning sobre el backbone Qwen3.5-4B (y su variante base), con 6.344.249.870 parámetros totales según los pesos en safetensors y un repositorio de 12,7 GB. La salida del backbone se conecta a una cabeza de acción basada en flow matching, de modo que los estados ocultos de la subtarea generada constituyen el único canal hacia el control motor. Esta arquitectura permite inferencia en streaming con una latencia cercana a la de un solo fotograma.

Su relevancia actual reside en que aborda uno de los cuellos de botella de los VLA en entornos reales: la necesidad de recordar eventos pasados sin incurrir en módulos de memoria complejos ni en costes de inferencia prohibitivos. El autor reporta resultados de estado del arte en cuatro benchmarks de memoria (RMBench, RoboMME, MIKASA-Robo y RoboMemArena) y resultados equiparables a los mejores en control generalista (LIBERO). La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) sobre backbone transformer Qwen3.5-4B con cabeza de acción flow matching |
| Parametros totales | 6.344.249.870 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SimpleMemVLA se apoya en el backbone Qwen3.5-4B, un transformer de lenguaje y visión, sobre el que se añade una cabeza de acción entrenada con flow matching. La innovación principal es la ausencia de un módulo de memoria explícito: el historial de observaciones muestreadas se mantiene intacto y se pasa al backbone como vídeo con marcas de tiempo, de forma que la self-attention nativa actúa como mecanismo de memoria. Los estados ocultos correspondientes a la subtarea generada son el único canal de información hacia la cabeza de acción, lo que habilita una inferencia en streaming exacta con latencia próxima a la de un único fotograma.

El modelo parte de Qwen/Qwen3.5-4B-Base y Qwen/Qwen3.5-4B según los metadatos de modelo base, lo que sugiere un proceso de fine-tuning sobre el modelo preentrenado y posiblemente sobre la variante ya ajustada. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset de robótica, ni sobre el uso de RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal más allá del esquema de memoria por atención nativa descrito.

## Capacidades

- Control robótico visomotor: genera acciones a partir de observaciones visuales e instrucciones en lenguaje, mediante la cabeza de flow matching.
- Memoria temporal nativa: procesa historiales de observaciones como vídeo con marcas de tiempo, lo que permite resolver tareas con dependencia de eventos pasados sin módulos de memoria adicionales.
- Razonamiento de subtareas: la generación de subtareas en el backbone actúa como representación intermedia que condiciona la acción.
- Inferencia en streaming: soporta ejecución continua con latencia cercana a la de un solo fotograma, adecuada para control en tiempo real.
- Control generalista: evaluado en LIBERO con resultados equiparables a los mejores de su categoría.
- Capacidades de lenguaje y visión heredadas del backbone Qwen3.5-4B: no se detallan en la información disponible.
- Soporte de tool calling, agentes multi-paso, audio o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Manipulación robótica con memoria de eventos: el modelo recuerda objetos vistos u ocultados previamente al procesar el historial como vídeo, lo que resulta adecuado para tareas de búsqueda y recuperación en entornos domésticos.
- Control en tiempo real de brazos robóticos: la latencia próxima a un fotograma y la inferencia en streaming permiten cerrar bucles de control a alta frecuencia en plataformas de manipulación.
- Tareas de largo horizonte en cocina y laboratorio: la memoria nativa facilita secuencias de varios pasos donde el estado del entorno cambia entre acciones.
- Investigación en benchmarks de memoria para VLA: sirve como referencia reproducible en RMBench, RoboMME, MIKASA-Robo y RoboMemArena para comparar estrategias de memoria.
- Evaluación de generalización en control generalista: su rendimiento en LIBERO lo hace útil como línea base en estudios de transferencia entre tareas.
- Prototipado de políticas visomotoras con fine-tuning: al estar construido sobre Qwen3.5-4B y publicarse con licencia MIT, puede adaptarse a dominios robóticos específicos partiendo de los pesos disponibles.
- Despliegue en entornos con recursos moderados: sus 6,3 mil millones de parámetros permiten, en principio, ejecución en una sola GPU de centro de datos, aunque no se documentan requisitos oficiales.

## Benchmarks y rendimiento

El autor indica resultados de estado del arte en cuatro benchmarks de memoria (RMBench, RoboMME, MIKASA-Robo y RoboMemArena) y resultados equiparables a los mejores en LIBERO. Sin embargo, no se proporcionan cifras concretas en la información disponible.

No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 6.344.249.870 parámetros, en FP16 se requerirían aproximadamente 12,7 GB solo para pesos, más memoria para activaciones y el procesamiento de vídeo histórico; en cuantización de 8 bits, alrededor de 6,4 GB, y en 4 bits, unos 3,2 GB, estimaciones teóricas no confirmadas por el autor.
- GPU recomendadas: no disponible. Por tamaño, una A100 o H100 de 40/80 GB sería adecuada para FP16 con margen; una RTX 4090 de 24 GB podría alojar los pesos en FP16, aunque el historial de vídeo incrementa el uso de memoria.
- Cabe en GPU de consumo: probable en cuantización de 8 o 4 bits en GPUs con 16-24 GB, si bien no hay confirmación oficial ni herramientas de cuantización documentadas.
- Opciones de despliegue: no se documentan en la información disponible; el repositorio de GitHub del proyecto es la referencia para detalles de entrenamiento, evaluación y despliegue.
- Latencia y throughput: el autor afirma latencia cercana a la de un solo fotograma en inferencia en streaming, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Memoria | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SimpleMemVLA | 6,34 B | no disponible | Historial como vídeo con marcas de tiempo, atención nativa | MIT | Hugging Face y GitHub |
| Alternativas VLA comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos suficientes sobre modelos comparables de la misma categoría (VLA con memoria) para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al heredar el backbone Qwen3.5-4B, podría arrastrar sesgos del corpus de preentrenamiento.
- Riesgo de alucinación: no evaluado en la información disponible; en el contexto de control robótico, una subtarea mal generada puede traducirse en acciones incorrectas.
- Limitaciones de contexto e idioma: la longitud de contexto no está especificada y los idiomas soportados figuran como no disponibles; el rendimiento multilingüe es incierto.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero conviene verificar las condiciones del backbone Qwen3.5-4B y de los datasets de robótica empleados.
- Caveat para producción: el modelo está orientado a investigación en robótica; no se documentan garantías de seguridad, protocolos de parada de emergencia ni validación en hardware real.
- Madurez: con 91 descargas y 0 likes en el momento de la consulta, el ecosistema de la comunidad es reducido; la documentación técnica principal reside en el artículo y el repositorio de GitHub.
- La información sobre cuantización y despliegue es escasa, lo que dificulta planificar una puesta en producción sin trabajo adicional de validación.

## Enlaces

- Hugging Face: https://huggingface.co/yinchenghust/simplememvla_rmbench
- Artículo: https://huggingface.co/papers/2609.05533
- Código: https://github.com/wadeKeith/SimpleMemVLA
- Colección del proyecto: https://huggingface.co/collections/yinchenghust/simplememvla
