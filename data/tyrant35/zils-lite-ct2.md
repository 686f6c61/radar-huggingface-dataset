# tyrant35/zils-lite-ct2

## Resumen

zils-lite-ct2 es un modelo de decisión de tipo "soup-pool" publicado por el usuario tyrant35 en Hugging Face. Se construye a partir del cuerpo d3-lite existente (malkolm777/zils-lite-l22-correct-attn) mediante una operación de mezcla de pesos del tipo soup + (A - soup) + (B - soup), donde A y B son dos ajustes finos con LoRA de rango 32 entrenados sobre datos públicos de tareas de clasificación y decisión. El resultado es un modelo de aproximadamente 853 millones de parámetros (852.985.920 según los safetensors) empaquetado en un repositorio de 1,7 GB.

El propósito declarado es actuar como "decision-model": un modelo orientado a tareas de clasificación, inferencia de lenguaje natural (NLI), elección múltiple y decisión de uso de herramientas, más que a generación abierta de texto. El entrenamiento combina conjuntos como iSarcasmEval, VAST, CLadder, NLI4CT, Amazon ESCI, HoVer, HellaSwag, WinoGrande, CLINC150 y BANKING77, con objetivos suaves que mezclan etiquetas gold con las propias probabilidades del modelo base.

La relevancia de esta ficha es limitada pero concreta: se trata de un experimento de mezcla de pesos (model soup) sobre un modelo base poco documentado, con licencia Apache 2.0, sin descargas ni likes en el momento de la consulta y sin model card detallada sobre arquitectura, contexto o idiomas. Es útil para quien quiera reproducir o auditar técnicas de soup-pooling aplicadas a modelos pequeños de decisión, pero no debe tratarse como un modelo listo para producción sin evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda del base malkolm777/zils-lite-l22-correct-attn; no se detalla en la model card) |
| Parametros totales | 852.985.920 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base más allá de la etiqueta "d3-lite" y "decision-model". Lo que sí documenta es el procedimiento de construcción: se parte del cuerpo soup d3-lite (malkolm777/zils-lite-l22-correct-attn) y se le suma la diferencia de dos ajustes finos LoRA de rango 32, A y B, calculados ambos respecto al propio soup. A se entrenó con tasa de aprendizaje 2e-4 sobre datos públicos de iSarcasmEval, VAST, CLadder, NLI4CT, Amazon ESCI y HoVer, con objetivos que mezclan al 50% la etiqueta gold y al 50% las probabilidades del soup; además aprendió las probabilidades de respuesta del soup sobre prompts públicos, generados y 11.400 prompts de decisión de uso de herramientas. B se entrenó con tasa 1e-4 sobre los splits de entrenamiento de HellaSwag, WinoGrande, CLINC150 y BANKING77, con objetivos suaves que mezclan etiquetas gold con las probabilidades del release original y del soup, más las probabilidades del soup sobre prompts públicos y de tool-use.

El autor declara explícitamente que no se usó ningún split de test de benchmarks. No hay información sobre número de tokens de entrenamiento, composición exacta de los datasets, ni sobre si hubo RLHF o DPO. La innovación técnica destacable es el uso de model soup combinado con LoRA y objetivos de destilación suave hacia las propias probabilidades del modelo base, una técnica habitual para consolidar ajustes finos sin degradar el comportamiento original.

## Capacidades

- Clasificación y decisión: el modelo está orientado a tareas de etiquetado y elección entre opciones, no a generación libre de texto.
- NLI y verificación de hechos: entrenado con NLI4CT y HoVer, adecuado para tareas de implicación textual y verificación.
- Elección múltiple y razonamiento tipo CLadder: cubre preguntas de razonamiento con opciones.
- Clasificación de intenciones: CLINC150 y BANKING77 aportan capacidad de clasificación de intenciones en dominios de asistente y banca.
- Decisión de uso de herramientas: el entrenamiento incluye 11.400 prompts de decisión de tool-use, por lo que puede puntuar si una consulta requiere llamada a herramienta.
- Detección de sarcasmo y análisis de sentimiento: iSarcasmEval y VAST están en el conjunto de entrenamiento.
- Búsqueda y relevancia de productos: Amazon ESCI aporta capacidad de clasificación de relevancia en e-commerce.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Clasificación de intenciones en asistentes conversacionales: el modelo puede asignar una etiqueta de intención a una consulta de usuario, aprovechando el entrenamiento con CLINC150 y BANKING77, como paso previo al enrutado hacia un agente o flujo determinado.
- Decisión de invocación de herramientas: dado un prompt de usuario, el modelo puede puntuar si procede llamar a una herramienta externa, gracias a los 11.400 prompts de tool-use incluidos en el entrenamiento; útil como guardarraíl barato antes de un modelo mayor.
- Verificación de afirmaciones en dominios técnicos: con NLI4CT y HoVer, puede usarse para clasificar si una afirmación está respaldada por un pasaje, en pipelines de fact-checking o RAG con verificación.
- Clasificación de relevancia en e-commerce: Amazon ESCI permite usar el modelo para etiquetar la relación entre consulta y producto (exacta, sustituta, complementaria, irrelevante), integrable en un motor de búsqueda.
- Detección de sarcasmo y tono en moderación: iSarcasmEval y VAST lo hacen adecuado para prefiltrar comentarios que requieren revisión humana por sarcasmo o carga emocional.
- Razonamiento de elección múltiple en evaluación interna: CLadder permite usar el modelo como clasificador de respuestas en bancos de preguntas, por ejemplo para puntuar opciones en un sistema de evaluación automática.
- Filtrado previo en pipelines de agentes: al ser un modelo de ~853 M de parámetros, puede ejecutarse como clasificador de bajo coste que decide si una consulta merece un modelo grande, reduciendo latencia y coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se usó ningún split de test de benchmarks durante el entrenamiento, pero tampoco reporta métricas de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 2 y 3 GB según longitud de secuencia.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,9-1,2 GB; en 4 bits, alrededor de 0,5-0,8 GB (estimaciones por tamaño de parámetros, no verificadas con el modelo).
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM debería poder cargarlo en fp16; RTX 3060, RTX 4060, RTX 4090 y GPUs de datacenter como A100 o H100 lo ejecutan con holgura.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de tarjetas con 4 GB o más; también es viable en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: al publicarse solo en safetensors, requiere transformers o un runtime compatible; no hay variantes GGUF ni Ollama publicadas, aunque podría convertirse a llama.cpp si la arquitectura base lo permite (no confirmado).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-lite-ct2 | 852.985.920 | no disponible | Apache 2.0 | Hugging Face, safetensors | Modelo de decisión derivado por soup + LoRA |
| malkolm777/zils-lite-l22-correct-attn | no disponible | no disponible | no disponible | Hugging Face | Modelo base del que deriva; sin datos públicos de rendimiento |
| Alternativas de clasificación de ~1B (p. ej. DeBERTa-v3-large, ModernBERT) | ~300-400 M | 512-8192 | MIT/Apache 2.0 | Amplia | No comparables directamente por falta de benchmarks del modelo evaluado |

No se dispone de datos de rendimiento del modelo ni de su base, por lo que la comparativa cuantitativa no es posible. Cualquier comparación con clasificadores establecidos requeriría evaluar zils-lite-ct2 en los mismos conjuntos de test.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay métricas publicadas, ni del modelo ni de su base, lo que impide verificar su calidad frente a alternativas.
- Model card mínima: no se documentan arquitectura, contexto, idiomas, tokenizador ni formato de prompt esperado, lo que complica su integración.
- Riesgo de sobreajuste a los objetivos de destilación: al entrenar con objetivos suaves que mezclan etiquetas gold con las probabilidades del propio soup, el modelo puede reproducir sesgos y errores del base en lugar de corregirlos.
- Sesgos desconocidos: los datasets de entrenamiento (iSarcasmEval, VAST, CLINC150, BANKING77, etc.) tienen dominios y distribuciones específicas; no se documenta ningún análisis de sesgo.
- Riesgo de alucinación: aunque es un modelo de decisión, si se usa para generación libre puede producir texto no fundamentado; no está diseñado para ello.
- Idiomas: no disponible; no se garantiza soporte multilingüe más allá de lo que herede del base.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de un modelo base cuya licencia y procedencia no están documentadas en la información disponible, conviene verificar la cadena de licencias antes de producción.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día; es un artefacto experimental sin validación externa.
- Sin garantías de soporte: el autor no ofrece documentación adicional ni issues conocidos.

## Enlaces

- Hugging Face: https://huggingface.co/tyrant35/zils-lite-ct2
- Modelo base: https://huggingface.co/malkolm777/zils-lite-l22-correct-attn
