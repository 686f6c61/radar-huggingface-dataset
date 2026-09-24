# SpaceTimee/Suri-Qwen-3.8-27B-Uncensored-GGUF

## Resumen

Suri Qwen 3.8 27B Uncensored es una cuantización en formato GGUF del modelo Qwen/Qwen3.8-27B, publicada por el usuario de HuggingFace SpaceTimee (desarrollador "Space Time"). El autor la presenta como una versión "sin censura" y "desalineada" (uncensored, unaligned), es decir, con los mecanismos de alineación de seguridad del modelo original atenuados o eliminados, de modo que el modelo no aplica los rechazos típicos de los asistentes alineados.

El modelo cuenta con 26.895.998.464 parámetros (unos 26,9 mil millones) según los metadatos de safetensors, y se distribuye en formato GGUF para inferencia local. El repositorio ocupa 205,3 GB, lo que indica que contiene varias cuantizaciones del mismo modelo. Los idiomas declarados son chino (zh) e inglés (en), y la model card está redactada íntegramente en chino.

Su interés práctico se limita a quien necesite un modelo de ~27B ejecutable en hardware de gama alta sin depender de APIs en la nube y sin filtros de contenido. Como contrapartida, la adopción es mínima (16 descargas y 0 "me gusta" en la fecha de actualización del repositorio), no se publica licencia, no hay benchmarks, y la model card no documenta ni la arquitectura ni el proceso de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la documenta; el modelo es un derivado de Qwen/Qwen3.8-27B) |
| Parámetros totales | 26.895.998.464 (≈26,9 B), dato de safetensors |
| Parámetros activos | no disponible (no se especifica si la arquitectura es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF; la model card no enumera los niveles concretos. El tamaño del repositorio (205,3 GB) indica que se publican múltiples cuantizaciones del mismo modelo |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (la librería declarada es transformers y el pipeline es image-text-to-text) |
| Modelo base | Qwen/Qwen3.8-27B y unsloth/Qwen3.8-27B |
| Tamaño del repositorio | 205,3 GB |
| Parámetros de muestreo recomendados | temperature 0,7-1,0; top_p 0,8-0,95; repetition_penalty 1-1,1 |
| Descargas / "me gusta" | 16 / 0 |
| Fecha de creación en HuggingFace | 24/09/2026 |

## Arquitectura y entrenamiento

La model card no aporta ningún detalle arquitectónico. Lo único verificable es que se trata de un derivado de Qwen/Qwen3.8-27B (con unsloth/Qwen3.8-27B declarado también como base), sobre el que SpaceTimee ha aplicado un proceso de desalineación y una posterior cuantización a GGUF. No se indica si la arquitectura subyacente es un transformer denso, un MoE o un diseño híbrido, ni el número de capas, la dimensión oculta, el número de cabezas de atención o el tipo de atención empleado.

Tampoco hay información sobre el entrenamiento o el post-entrenamiento: se desconoce el volumen de tokens, la composición del dataset, si se emplearon técnicas de RLHF, DPO, abliteration u otras, y sobre qué pesos exactos se aplicó el proceso. La única orientación operativa publicada son los parámetros de muestreo recomendados. El pipeline declarado en HuggingFace es image-text-to-text, lo que sugeriría capacidad de entrada multimodal, pero la model card no describe ninguna funcionalidad de visión ni cómo estaría implementada, por lo que no puede darse por confirmada.

## Capacidades

- Generación de texto conversacional en chino e inglés; no se declara soporte de castellano ni de otros idiomas.
- Modo "sin censura": el autor afirma que el modelo está desalineado, por lo que no reproduce los rechazos ni los filtros de contenido del modelo base.
- Capacidad multimodal declarada en los metadatos de HuggingFace (image-text-to-text), no documentada ni verificada en la model card.
- Razonamiento, generación de código y matemáticas: no documentados y sin evaluación publicada; se desconoce en qué medida se conservan respecto al modelo base tras la desalineación y la cuantización.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Control de decodificación: el autor recomienda temperature 0,7-1,0, top_p 0,8-0,95 y repetition_penalty 1-1,1.
- Modo "thinking" o razonamiento explícito: no disponible.

## Casos de uso

- Generación creativa sin restricciones: redacción de ficción, guiones o narrativa con temáticas que los modelos alineados rechazan (violencia literaria, contenido adulto, humor negro). El modelo es adecuado porque no aplica filtros, pero requiere revisión editorial y legal del contenido generado antes de cualquier publicación.
- Traducción chino-inglés: al estar entrenado o ajustado sobre una base con esos dos idiomas y no declarar otros, puede usarse para traducir documentación técnica, foros o texto coloquial entre ambos idiomas, incluyendo registros que los modelos alineados rechazan por su temática.
- Asistente local con privacidad total: al distribuirse en GGUF y no requerir API externa, puede desplegarse en una estación de trabajo con una RTX 4090 (cuantización Q4_K_M, ~16 GB) para procesar documentación interna sensible en chino e inglés sin que los datos abandonen la organización.
- Red teaming e investigación en seguridad: sirve como sujeto de prueba para medir qué contenidos produce un modelo desalineado, en entornos aislados y con supervisión, y para comparar su comportamiento con el del modelo base alineado.
- Generación aumentada por recuperación (RAG) sobre corpus bilingües: puede integrarse en un pipeline que recupere fragmentos de documentos en chino o inglés y los pase como contexto al modelo. Dado que la longitud de contexto es desconocida, conviene limitar el tamaño de los fragmentos y validar experimentalmente el máximo admitido.
- Anotación y aumento de datos sintéticos: generación de corpus sintéticos en chino e inglés para entrenar modelos más pequeños, aprovechando que el modelo no rechaza dominios (jerga de foros, contenido controvertido, texto informal) que los modelos alineados evitan sistemáticamente.
- Ajuste fino posterior en local: la cuantización puede servir como punto de partida para un LoRA o un ajuste ligero sobre un caso de uso concreto, siempre que se respeten las condiciones de licencia del modelo base, hoy no aclaradas.
- Clasificación y análisis de contenido sensible: uso como componente de un sistema de moderación que necesita examinar material que otros modelos se niegan a procesar, con la salvedad de que su salida puede ser imprecisa y debe validarse con métricas propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra evaluación, y tampoco hay comparación con el modelo base. No existen datos verificables de latencia, throughput ni tasa de alucinación.

## Requisitos de hardware

Estimaciones calculadas a partir del recuento de parámetros (26,9 B); el autor no publica cifras oficiales. La memoria real depende del nivel de cuantización, de la longitud de contexto configurada (desconocida) y del tamaño de la caché KV.

| Cuantización estimada | Peso aproximado | VRAM recomendada |
|---|---|---|
| FP16 / BF16 | ~53,8 GB | A100 80 GB o H100 80 GB |
| Q8_0 | ~28,6 GB | A100 40 GB o 2× RTX 4090 24 GB |
| Q6_K | ~22 GB | RTX 4090 24 GB con contexto moderado o 2× RTX 3090 |
| Q5_K_M | ~18,7 GB | RTX 4090 24 GB, RTX 5090 32 GB |
| Q4_K_M | ~16,1 GB | RTX 4090 24 GB, RTX 5090 32 GB; RTX 4080 16 GB muy justa |
| Q3_K_M | ~13,5 GB | RTX 4080 16 GB, RTX 4070 Ti 16 GB; 12 GB con descarga parcial a RAM |
| Q2_K / IQ2 | ~10 GB | GPU de 12 GB con contexto corto |

- Cabe en GPU de consumo: sí, en cuantizaciones Q4 o inferiores y con 16-24 GB de VRAM. En 12 GB solo con cuantizaciones muy agresivas (Q2/IQ2) o descargando capas a RAM.
- Inferencia solo en CPU: viable con llama.cpp usando 20-32 GB de RAM para Q4/Q5, con velocidades muy inferiores a las de GPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python y text-generation-webui. vLLM y TGI ofrecen soporte GGUF parcial o experimental, por lo que conviene verificar la compatibilidad antes de usarlos en producción (el repositorio incluye la etiqueta text-generation-inference).
- Almacenamiento: el repositorio completo ocupa 205,3 GB; descargar solo la cuantización deseada reduce el requisito a 10-54 GB según el nivel.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Estado |
|---|---|---|---|---|---|
| Suri Qwen 3.8 27B Uncensored (SpaceTimee) | 26,9 B | no disponible | no disponible | GGUF | Publicado; 16 descargas, 0 "me gusta" |
| Qwen/Qwen3.8-27B (base declarado) | no disponible | no disponible | no disponible | no disponible | Referenciado como modelo base; datos no verificados en la información disponible |
| unsloth/Qwen3.8-27B (base declarado) | no disponible | no disponible | no disponible | no disponible | Referenciado como modelo base; datos no verificados en la información disponible |
| Otras variantes "uncensored" o desalineadas de la familia Qwen | no disponible | no disponible | no disponible | no disponible | No hay datos de comparación en la información proporcionada |

No es posible establecer una comparativa cuantitativa con alternativas de la misma categoría: no hay benchmarks del modelo ni especificaciones publicadas de los modelos base declarados.

## Limitaciones y advertencias

- Desalineación intencional: el modelo ha sido modificado para eliminar o atenuar las barreras de seguridad del modelo original. Puede generar contenido dañino, ilegal, violento o sexual sin advertencia. El despliegue exige medidas de control, registro de salidas y responsabilidad legal del operador.
- Licencia no disponible: no se especifican condiciones de uso. El uso comercial queda en una situación de incertidumbre jurídica, agravada porque el modelo hereda las condiciones del modelo base (Qwen), también no detalladas aquí.
- Idiomas limitados: solo chino e inglés declarados. El castellano no está soportado oficialmente y su rendimiento en este idioma es imprevisible.
- Riesgo de alucinación no medido: no hay evaluación publicada, y la desalineación y la cuantización pueden degradar la fiabilidad factual respecto al modelo base.
- Pérdida por cuantización: las cuantizaciones por debajo de Q4 reducen de forma apreciable la calidad de generación; para tareas de razonamiento o código conviene usar Q5, Q6 o Q8 si la VRAM lo permite.
- Adopción mínima: 16 descargas y 0 "me gusta" implican ausencia de validación por parte de la comunidad, sin garantía de mantenimiento, corrección de errores ni soporte.
- Documentación insuficiente: se desconoce la arquitectura, el contexto máximo, el proceso de entrenamiento y el método exacto de desalineación. Esto dificulta estimar el rendimiento en producción y realizar una evaluación de riesgos.
- Capacidad multimodal sin confirmar: la etiqueta image-text-to-text de HuggingFace no está respaldada por ningún ejemplo, documentación ni evaluación.
- Consumo de almacenamiento: el repositorio completo ocupa 205,3 GB, un coste relevante si se descarga íntegro.
- Sin filtros de salida propios: al estar desalineado, no debe exponerse directamente a usuarios finales sin una capa de moderación externa.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/SpaceTimee/Suri-Qwen-3.8-27B-Uncensored-GGUF
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.8-27B (referenciado en los metadatos del repositorio; no verificado)
- Modelo base declarado: https://huggingface.co/unsloth/Qwen3.8-27B (referenciado en los metadatos del repositorio; no verificado)
- Papers, blogs, repositorios o demos: no disponible en la información proporcionada
- Contacto del autor indicado en la model card: grupo de QQ 902575634; correo Zeus6_6@163.com
