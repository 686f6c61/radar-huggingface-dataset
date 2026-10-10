# yogendra-om-ai/om-ai-model

## Resumen

om-ai-model es un adaptador LoRA publicado en HuggingFace por el usuario yogendra-om-ai bajo la librería PEFT. No se trata de un modelo completo, sino de un conjunto de pesos de ajuste fino (adapter) que debe cargarse sobre su modelo base declarado, unsloth/Llama-3.2-1B-Instruct, una versión de Llama 3.2 1B Instruct distribuida por Unsloth. El repositorio se creó el 10 de octubre de 2026 y, en el momento de redactar esta ficha, acumula 0 descargas y 0 likes, con un tamaño de repositorio de 0.0 GB, lo que sugiere que los pesos no están realmente alojados o que se trata de un repositorio de prueba.

La model card es la plantilla por defecto de HuggingFace sin rellenar: todos los apartados (descripción, desarrollador, idiomas, licencia, datos de entrenamiento, hiperparámetros, evaluación, impacto ambiental) aparecen con el marcador "[More Information Needed]". No se documenta el rango del adaptador LoRA, los módulos objetivo, el dataset de ajuste, el número de tokens de entrenamiento ni si hubo RLHF, DPO u otra fase de alineamiento posterior.

Por tanto, la relevancia de esta ficha es principalmente informativa y de advertencia: sirve para ilustrar el caso de un adaptador PEFT sin documentación ni evaluación publicada sobre un modelo pequeño de 1B parámetros. Cualquier uso en producción requeriría, como paso previo, verificar que los pesos existen, auditar el dataset de ajuste y evaluar el comportamiento resultante, algo imposible con la información disponible actualmente. La arquitectura, el tamaño y el contexto efectivos heredan del modelo base, no del adaptador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only denso tipo Llama 3.2; la model card no especifica la arquitectura del adaptador (no disponible) |
| Parámetros totales | No disponible para el adaptador; el modelo base declara 1.240 millones de parámetros aproximadamente (dato heredado del modelo base, no confirmado en la ficha) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la ficha; el modelo base soporta hasta 131.072 tokens (dato heredado del modelo base) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible en la ficha; el modelo base declara ocho idiomas (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) según la documentación oficial de Llama 3.2, no confirmado para este adaptador |
| Licencia | No disponible |
| Formato de pesos | safetensors (etiqueta del repositorio), en formato de adaptador PEFT/LoRA |
| Librería | peft (versión de framework declarada: PEFT 0.21.2) |
| Modelo base | unsloth/Llama-3.2-1B-Instruct |
| Tamaño del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 10 de octubre de 2026 (según metadatos del repositorio) |
| Última actualización | 10 de octubre de 2026 (según metadatos del repositorio) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base congelado. La ficha no indica el rango (r), el valor de alpha, el dropout, los módulos objetivo (q_proj, k_proj, v_proj, o_proj, gate_proj, etc.) ni si el adaptador se fusionó o se dejó como pesos separados. La única información técnica disponible es la versión de PEFT utilizada (0.21.2) y el modelo base sobre el que se aplica.

El modelo base, unsloth/Llama-3.2-1B-Instruct, es un transformer decoder-only denso de la familia Llama 3.2, con normalización RMSNorm, embeddings rotatorios (RoPE) y atención con consultas agrupadas (GQA). Según la documentación de Meta, esta variante está optimizada para instrucciones, resumen y reescritura de texto, y está pensada para despliegue en dispositivo (edge) por su tamaño reducido. No se dispone de información sobre el dataset de ajuste del adaptador: se desconoce el número de tokens, la composición del corpus, el idioma mayoritario, si hubo filtrado o deduplicación, y si se aplicaron fases de RLHF, DPO o preferencias. Tampoco se documenta el hardware ni las horas de cómputo empleadas, y el apartado de impacto ambiental de la model card permanece vacío.

## Capacidades

- Generación de texto conversacional: heredada del modelo base, que es una variante instruct ajustada para diálogo multiturno. No hay evaluación publicada del adaptador.
- Seguimiento de instrucciones y resumen: capacidades declaradas por Meta para Llama 3.2 1B Instruct; no verificadas tras el ajuste LoRA.
- Razonamiento, matemáticas y código: no documentado; en modelos de 1B parámetros el rendimiento en estas tareas suele ser limitado, pero no se aportan datos para este adaptador concreto.
- Tool calling / function calling: no disponible; la ficha no menciona soporte de llamadas a funciones.
- Uso en agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no declaradas en la ficha; el modelo base cubre ocho idiomas, pero se desconoce el efecto del ajuste sobre ellos.
- Visión, audio u otras modalidades: no, el modelo base de 1B parámetros es exclusivamente de texto (las variantes con visión de Llama 3.2 son 11B y 90B).
- Modo de razonamiento explícito (thinking): no disponible.

## Casos de uso

- Prototipado local de asistentes conversacionales: el conjunto adaptador más modelo base de 1B parámetros puede ejecutarse en portátiles y equipos sin GPU dedicada, lo que permite validar flujos de diálogo antes de escalar a modelos mayores. Requiere verificar primero que los pesos del adaptador existen y son cargables.
- Experimentación con PEFT y Unsloth: sirve como ejemplo de adaptador LoRA sobre Llama 3.2 1B para reproducir pipelines de ajuste, comparar configuraciones de rango y medir el coste de fusionar el adaptador con el modelo base.
- Clasificación y etiquetado ligero de texto: tareas de categorización de tickets, detección de intención o extracción de campos simples pueden abordarse con un modelo de 1B si el adaptador fue ajustado para ello, aunque esto no está documentado y exige evaluación previa.
- Resumen de textos cortos: el modelo base está optimizado para resumen; un adaptador de dominio podría especializarlo en actas, correos o incidencias, siempre con revisión humana por el riesgo de alucinación en modelos pequeños.
- Reescritura y normalización de estilo: unificación de tono en contenidos, corrección de formatos o adaptación de registro en textos breves, como paso previo a una revisión editorial.
- Enrutado y preprocesado en pipelines RAG: uso del modelo como componente barato para reformular consultas, generar palabras clave o decidir si una petición requiere recuperación documental antes de pasarla a un modelo mayor.
- Base de comparación en estudios de ajuste eficiente: como referencia de adaptador sin documentar, útil para ilustrar buenas y malas prácticas en la publicación de model cards y artefactos PEFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El apartado de evaluación de la model card está vacío y no se aportan métricas de MMLU, HumanEval, GSM8K ni de ninguna otra tarea, ni para el adaptador ni para el modelo base.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del tamaño del modelo base (1.240 millones de parámetros) y no constituyen mediciones publicadas para este adaptador.

- VRAM estimada en precisión completa (fp32): en torno a 5 GB solo para pesos, más caché KV y activaciones.
- VRAM estimada en fp16/bf16: en torno a 2,5 GB de pesos, con un consumo práctico de 3 a 4 GB incluyendo caché KV y overhead del runtime.
- VRAM estimada en int8: en torno a 1,3 GB de pesos.
- VRAM estimada en cuantización GGUF Q4_K_M: en torno a 0,8 a 1 GB de pesos.
- GPU recomendadas: cabe con holgura en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070, RTX 4080 y RTX 4090. También es viable en GPUs de datacenter (A100, H100) aunque están sobredimensionadas para este tamaño.
- Ejecución en CPU: viable mediante llama.cpp u Ollama tras convertir y fusionar el adaptador; el modelo base está diseñado para despliegue en dispositivo.
- Opciones de despliegue: transformers con peft para cargar el adaptador tal cual; vLLM y TGI admiten adaptadores LoRA en servidor; llama.cpp y Ollama requieren fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponible; no se han publicado mediciones para este adaptador.

## Comparativa con modelos similares

Los datos de esta tabla corresponden a las model cards públicas de cada modelo base y no han sido verificados en el contexto de este repositorio.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| yogendra-om-ai/om-ai-model (adaptador LoRA) | No disponible; base de 1,24B | No disponible; base de 131.072 tokens | No disponible | Repositorio de 0.0 GB, 0 descargas, sin pesos confirmados |
| unsloth/Llama-3.2-1B-Instruct (modelo base) | 1,24B | 131.072 tokens | Licencia comunitaria de Llama 3.2 | Disponible en HuggingFace, formato safetensors |
| meta-llama/Llama-3.2-3B-Instruct | 3,21B | 131.072 tokens | Licencia comunitaria de Llama 3.2 | Disponible en HuggingFace |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens (ampliable con YaRN) | Apache 2.0 | Disponible en HuggingFace |
| google/gemma-2-2b-it | 2,61B | 8.192 tokens | Términos de uso de Gemma | Disponible en HuggingFace |

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica licencia, lo que impide determinar las condiciones de uso comercial y de redistribución. El modelo base está sujeto a la licencia comunitaria de Llama 3.2, que impone obligaciones de atribución y una política de uso aceptable, pero la situación legal del adaptador queda indefinida.
- Repositorio aparentemente vacío: el tamaño indicado es de 0.0 GB y no constan descargas, por lo que no puede confirmarse que los pesos estén realmente disponibles. Conviene comprobar el listado de ficheros antes de cualquier integración.
- Sin documentación de entrenamiento: se desconocen el dataset, el número de tokens, el idioma y los posibles sesgos introducidos. No es posible auditar el ajuste.
- Sin evaluación: no hay benchmarks ni pruebas cualitativas publicadas. No se puede afirmar ninguna mejora respecto al modelo base.
- Fecha de creación anómala: los metadatos indican el 10 de octubre de 2026, lo que puede señalar un error de reloj o un repositorio generado de forma artificial.
- Riesgo de alucinación elevado: en modelos de 1B parámetros la tasa de invención de hechos es alta, especialmente en dominios especializados y en preguntas abiertas.
- Limitaciones de razonamiento y matemáticas: la capacidad de razonamiento multi-paso, cálculo aritmético y generación de código en modelos de este tamaño es limitada; no se recomienda para tareas que exijan precisión exacta sin verificación posterior.
- Cobertura multilingüe incierta: aunque el modelo base declara ocho idiomas, no hay información sobre cómo afecta el ajuste LoRA al rendimiento en castellano u otras lenguas.
- Longitud de contexto efectiva: aunque el modelo base soporte 131.072 tokens, el rendimiento real en contextos largos en modelos de 1B suele degradarse, y no existen mediciones para este adaptador.
- Uso en producción no recomendado sin validación previa: la ausencia de licencia, evaluación y trazabilidad de datos impide cumplir con requisitos habituales de auditoría y cumplimiento normativo.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/yogendra-om-ai/om-ai-model
- Modelo base utilizado: https://huggingface.co/unsloth/Llama-3.2-1B-Instruct
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Librería PEFT: https://github.com/huggingface/peft
- Proyecto Unsloth: https://github.com/unslothai/unsloth
- Referencia citada en la model card (Lacoste et al., 2019, sobre estimación de emisiones de carbono en ML, no sobre este modelo): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental de ML: https://mlco2.github.io/impact
