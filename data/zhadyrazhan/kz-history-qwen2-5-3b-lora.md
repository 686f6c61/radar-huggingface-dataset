# zhadyrazhan/kz-history-qwen2.5-3b-lora

## Resumen

`zhadyrazhan/kz-history-qwen2.5-3b-lora` es un adaptador LoRA (no un modelo completo) publicado por el usuario zhadyrazhan y entrenado sobre `unsloth/Qwen2.5-3B-Instruct-bnb-4bit`, una versión del modelo instructivo Qwen2.5-3B de Alibaba cuantizada a 4 bits con bitsandbytes. El nombre del repositorio sugiere que el ajuste se orienta a historia de Kazajistán ("kz-history"), aunque la model card no documenta ni el dataset ni el procedimiento de entrenamiento empleado.

El interés de esta publicación es limitado pero claro: sirve como ejemplo reproducible de fine-tuning de bajo coste con Unsloth sobre una base de 3 000 millones de parámetros, y como posible punto de partida para quien necesite un asistente especializado en un dominio concreto en kazajo, ruso o inglés. El repositorio ocupa 0,1 GB, lo que confirma que solo contiene los pesos del adaptador y no los del modelo base.

En el momento de redactar esta ficha el modelo acumula 0 descargas y 0 "likes", no tiene pipeline declarado y no se ha publicado ningún resultado de evaluación. Las búsquedas web realizadas no devolvieron información relevante sobre el modelo: los resultados obtenidos corresponden a contenido de cine de artes marciales y no guardan relación con este repositorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only de la familia Qwen2; base: `unsloth/Qwen2.5-3B-Instruct-bnb-4bit` |
| Parametros totales | No disponible en la informacion proporcionada; la denominacion del modelo base indica ~3 000 millones de parametros. El adaptador ocupa 0,1 GB |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (la ficha no lo declara) |
| Tipos de cuantizacion | El modelo base esta cuantizado a 4 bits (bitsandbytes, `bnb-4bit`). No se publican versiones GGUF ni AWQ/GPTQ del adaptador |
| Idiomas soportados | `en` segun la etiqueta declarada; el nombre del repositorio sugiere uso con kazajo, no confirmado en la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de la familia Qwen2, con atención por grupos (GQA) y atención de causalidad estándar. Sobre esa base, este repositorio añade un adaptador LoRA entrenado con la librería Unsloth, que según la propia model card permite "entrenar 2x más rápido". No se especifica el rango del adaptador, las capas objetivo, la tasa de aprendizaje, el número de pasos ni el número de épocas.

Tampoco se documentan los datos de entrenamiento: no hay información sobre el número de tokens, la composición del corpus, la proporción entre idiomas ni si se aplicaron técnicas de alineación adicionales (RLHF, DPO, ORPO). El único dato técnico verificable es que el entrenamiento partió de una base ya cuantizada a 4 bits, lo que implica que el adaptador se entrenó sobre pesos cuantizados y que, para su uso, es necesario cargar el mismo checkpoint base con `bitsandbytes` o fusionar el adaptador con una versión completa del modelo.

## Capacidades

- Generación de texto instructiva: hereda las capacidades conversacionales de Qwen2.5-3B-Instruct (respuestas a instrucciones, resúmenes, reescritura).
- Razonamiento y matemáticas básicas: propias de un modelo de 3 000 millones de parámetros; sin datos de evaluación específicos para este adaptador.
- Generación de código: capacidad heredada del modelo base, no verificada tras el fine-tuning.
- Tool calling / function calling: el modelo base Qwen2.5-Instruct lo soporta de serie; no se confirma que el adaptador lo preserve.
- Razonamiento multi-paso y uso como agente: posible en teoría por herencia del modelo base, sin evidencia publicada para este adaptador.
- Capacidades multilingües: la etiqueta declarada es únicamente `en`; el modelo base cubre más idiomas, pero el efecto del fine-tuning sobre ellos es desconocido.
- Especialización temática: el nombre del repositorio apunta a contenido de historia de Kazajistán, sin que exista documentación que lo respalde.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Prototipado de asistentes conversacionales en kazajo: el adaptador permite experimentar con respuestas en un idioma poco representado sin desplegar un modelo grande, con un coste de VRAM reducido.
- Sistema RAG sobre corpus histórico kazajo: el adaptador puede actuar como generador final de respuestas a partir de fragmentos recuperados de archivos, libros o artículos sobre historia de Kazajistán.
- Material didáctico para educación secundaria o universitaria: generación de resúmenes, preguntas de comprensión y explicaciones adaptadas a un nivel educativo concreto, siempre con revisión humana.
- Base para un fine-tuning adicional: al ser un adaptador LoRA sobre una base cuantizada, sirve como punto de partida barato para seguir especializando el modelo con nuevos datos.
- Chatbot para museos o centros culturales: atención a visitantes con preguntas frecuentes sobre exposiciones históricas, desplegado en hardware modesto o incluso en local.
- Generación de borradores de artículos divulgativos: redacción de primeros borradores sobre efemérides o personajes históricos que después se revisan y editan.
- Experimentación académica en NLP de bajos recursos: banco de pruebas para estudiar cómo se comportan los adaptadores LoRA en lenguas túrquicas con pocos datos.
- Traducción asistida inglés-kazajo en dominio histórico: uso como apoyo a traductores, con verificación terminológica obligatoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Ni la model card ni los metadatos del repositorio incluyen evaluaciones de MMLU, HumanEval, GSM8K, KazQAD, Belebele ni de ningún otro conjunto de referencia. Tampoco hay comparaciones con el modelo base antes y después del ajuste.

## Requisitos de hardware

- Tamaño del artefacto publicado: 0,1 GB (solo el adaptador LoRA).
- VRAM para inferencia con el modelo base fusionado en fp16/bf16: aproximadamente 6-7 GB, estimación a partir de los ~3 000 millones de parámetros.
- VRAM en 8 bits: aproximadamente 4 GB (estimación).
- VRAM en 4 bits (nf4): aproximadamente 2-3 GB (estimación), la configuración más ligera y la más próxima al esquema usado durante el entrenamiento.
- GPU de gama consumer: cabe sin problema en tarjetas con 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 3070); en 4 bits puede ejecutarse incluso en GPU con 6 GB.
- GPU profesionales recomendadas: A100 40/80 GB, H100, L40S o L4 para despliegues concurrentes; también T4 16 GB para entornos de bajo coste.
- Opciones de despliegue: `transformers` + `peft` (requiere cargar el base con `bitsandbytes`), `text-generation-inference` (la etiqueta del repositorio lo declara compatible) y `vLLM` tras fusionar el adaptador con el modelo base. Para `llama.cpp` u `Ollama` sería necesario convertir a GGUF, y no se publica ninguna conversión.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

Los datos del modelo base proceden de su documentación pública y no forman parte de la información proporcionada sobre este repositorio; se incluyen únicamente como referencia contextual.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| kz-history-qwen2.5-3b-lora | Adaptador sobre base de ~3 000 M | No disponible | Apache-2.0 | HuggingFace, 0 descargas, 0 likes | Fine-tune temático sin documentar |
| Qwen2.5-3B-Instruct (base) | ~3 000 M | 32 768 tokens (documentación pública) | Apache-2.0 (documentación pública) | Ampliamente disponible | Modelo instructivo generalista |
| Qwen2.5-1.5B-Instruct | ~1 500 M | 32 768 tokens (documentación pública) | Apache-2.0 (documentación pública) | Ampliamente disponible | Alternativa más ligera, menor calidad general |
| Qwen2.5-7B-Instruct | ~7 600 M | 32 768 tokens, ampliable con YaRN (documentación pública) | Apache-2.0 (documentación pública) | Ampliamente disponible | Requiere más VRAM, mejor rendimiento general |

No se dispone de resultados comparativos de rendimiento entre este adaptador y las alternativas de la tabla.

## Limitaciones y advertencias

- No existe información verificable sobre el dataset de entrenamiento: se desconoce si el corpus es fiable, si está sesgado o si contiene datos sintéticos.
- Riesgo de alucinación elevado en contenido histórico: un modelo de 3 000 millones de parámetros ajustado sobre un dominio concreto tiende a inventar fechas, nombres y eventos si no se le apoya con recuperación documental.
- Discrepancia entre el nombre del repositorio ("kz-history") y la etiqueta de idioma declarada (`en`): no está claro en qué idioma responde realmente el modelo.
- Idiomas no confirmados: la model card solo declara inglés; el comportamiento en kazajo o ruso es una suposición basada en el nombre.
- Sin benchmarks ni evaluación cualitativa publicada: no hay evidencia objetiva de que el fine-tuning mejore al modelo base.
- Repositorio sin tracción (0 descargas, 0 likes, sin pipeline declarado): no hay validación por parte de la comunidad.
- El adaptador requiere cargar el modelo base cuantizado a 4 bits o fusionarlo previamente; no es un modelo autónomo y no funcionará con una simple llamada a `AutoModelForCausalLM` sin `peft`.
- Licencia Apache-2.0 en el adaptador: aunque permite uso comercial, conviene verificar también los términos del modelo base y la procedencia de los datos de ajuste antes de un despliegue en producción.
- Ausencia de filtros de seguridad documentados: es responsabilidad del integrador añadir moderación de contenido.
- Fecha de creación del repositorio registrada como 2026-09-23, posterior a la de esta ficha; puede tratarse de un error de metadatos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/zhadyrazhan/kz-history-qwen2.5-3b-lora
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-3B-Instruct-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Blog oficial de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Informe técnico de Qwen2.5: https://arxiv.org/abs/2412.15115
- Búsquedas web realizadas: no se encontró ningún enlace relevante sobre este modelo. Los resultados obtenidos correspondían a foros de videojuegos y a contenido audiovisual de artes marciales, sin relación con el repositorio.
