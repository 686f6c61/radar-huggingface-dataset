# wired07/satquery-ai-qwen2vl-lora

## Resumen

`wired07/satquery-ai-qwen2vl-lora` es un adaptador LoRA publicado por el usuario wired07 en HuggingFace, construido sobre el modelo multimodal `unsloth/Qwen2-VL-2B-Instruct-unsloth-bnb-4bit`. Se distribuye en formato PEFT/safetensors, ocupa 0,1 GB en el repositorio, está etiquetado como `text-generation` y fue creado el 12 de septiembre de 2026. En el momento de redactar esta ficha acumula 0 descargas y 0 "likes", y no declara licencia ni idiomas soportados.

El propósito declarado del modelo no está documentado: la model card es la plantilla por defecto de HuggingFace, con todos los campos marcados como "More Information Needed". El nombre del repositorio ("satquery-ai") sugiere un ajuste orientado a consultas sobre imágenes de satélite o teledetección, pero no existe ninguna evidencia en el repositorio que lo confirme. Las etiquetas `sft`, `trl` y `unsloth` sí indican que el ajuste se realizó mediante fine-tuning supervisado con el stack Unsloth/TRL sobre el citado modelo base cuantizado a 4 bits.

Su relevancia práctica es la de un adaptador ligero que hereda la arquitectura Qwen2-VL (resolución dinámica y Multimodal Rotary Position Embedding) para especializar un VLM de ~2B parámetros con un coste de entrenamiento e inferencia muy bajo. Ahora bien, al no publicarse dataset, hiperparámetros, licencia ni evaluación, cualquier uso en producción exige una validación propia previa: un LoRA SFT sin documentar puede degradar capacidades generales del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen2-VL-2B-Instruct: transformer decoder multimodal con resolución dinámica y M-RoPE (detalles internos del adaptador no disponibles) |
| Parámetros totales | No disponible para el adaptador; el modelo base declara 2B en su nomenclatura |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en el repositorio; el modelo base Qwen2-VL-2B-Instruct declara 32.768 tokens en su documentación oficial |
| Tipos de cuantización | El modelo base de partida está cuantizado en bnb-4bit; el adaptador se distribuye en safetensors con precisión no especificada |
| Idiomas soportados | No disponible |
| Licencia | No disponible en el repositorio; el modelo base Qwen2-VL-2B-Instruct se publica bajo Apache 2.0 (consultar la ficha oficial) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Autor | wired07 |
| Librería | peft (PEFT 0.20.0 según la model card) |
| Pipeline declarado | text-generation |
| Tamaño del repositorio | 0,1 GB |
| Fecha de creación | 2026-09-12 |
| Última actualización | 2026-09-12 |

## Arquitectura y entrenamiento

El adaptador no define arquitectura propia: es un conjunto de matrices LoRA que se acoplan a las capas del modelo base `unsloth/Qwen2-VL-2B-Instruct-unsloth-bnb-4bit`. Ese modelo base pertenece a la familia Qwen2-VL, un transformer decoder multimodal que combina un codificador visual con un decoder de lenguaje, emplea resolución dinámica (la imagen se tokeniza en parches de tamaño variable en lugar de reescalarse a una resolución fija) y utiliza M-RoPE para codificar de forma desacoplada las posiciones temporales, de altura y de anchura. El modelo base de partida está cuantizado a 4 bits con bitsandbytes, un formato pensado para entrenamiento e inferencia con requisitos de VRAM reducidos que Unsloth emplea habitualmente para fine-tuning eficiente.

Sobre el entrenamiento del adaptador no hay ningún dato publicado: la model card no especifica dataset, número de tokens, composición de los datos, épocas, tasa de aprendizaje, rango del LoRA ni si hubo una fase de alineación posterior (DPO, RLHF). Las etiquetas del repositorio (`lora`, `sft`, `transformers`, `trl`, `unsloth`) indican únicamente que se trata de un fine-tuning supervisado ejecutado con TRL y Unsloth. El tag `arxiv:1910.09700` no corresponde a un paper del modelo, sino a la referencia de Lacoste et al. sobre estimación de emisiones de carbono que aparece en la plantilla de model card de HuggingFace.

## Capacidades

- Generación de texto y conversación: hereda del modelo base la capacidad de mantener diálogos multi-turno, si bien el ajuste SFT puede haber modificado el estilo y el comportamiento conversacional.
- Comprensión de imágenes: el modelo base procesa imágenes con resolución dinámica, lo que permite OCR, lectura de documentos, interpretación de gráficos y descripción de escenas. No está confirmado que el adaptador conserve estas capacidades intactas.
- Comprensión de vídeo: Qwen2-VL incorpora modelado temporal mediante M-RoPE, por lo que el modelo base admite entradas de vídeo. La conservación de esta capacidad tras el ajuste no está verificada.
- Razonamiento visual y grounding: el modelo base soporta localización de objetos y razonamiento sobre contenido visual; no hay evidencia de que el adaptador lo mantenga.
- Tool calling / function calling: soportado en el modelo base Qwen2-VL para flujos de agente visual; no verificado en este adaptador.
- Capacidades multilingües: no disponibles en la información del repositorio; el modelo base es multilingüe, con especial énfasis en inglés y chino.
- Capacidad específica del ajuste: no disponible. No se documenta ninguna tarea objetivo, modo "thinking", soporte de audio ni capacidad diferencial respecto al modelo base.

## Casos de uso

- Consulta sobre imágenes de satélite y teledetección: si el ajuste está realmente orientado a este dominio, como sugiere el nombre del repositorio, el modelo podría responder preguntas sobre cobertura del terreno, presencia de infraestructuras o cambios entre capturas. Es el caso de uso más plausible, pero no está documentado y requiere validación con imágenes propias antes de cualquier despliegue.
- Extracción de información de documentos escaneados: el modelo base resuelve OCR y parsing de documentos; un VLM de 2B permite procesar grandes volúmenes de facturas o formularios en hardware modesto, siempre que se verifique que el LoRA no ha degradado esta capacidad.
- Generación automática de texto alternativo: descripción de imágenes para catálogos de producto o portales de accesibilidad, con coste de inferencia bajo y posibilidad de ejecución on-premise.
- Análisis de gráficos y tablas para informes: el modelo base interpreta ejes, series y leyendas; útil para automatizar resúmenes de dashboards y reportes financieros en un pipeline batch.
- Etiquetado y moderación de imágenes a escala: clasificación y descripción masiva de contenido visual en un servidor con una única GPU consumer, con throughput alto gracias al tamaño de 2B parámetros.
- Prototipado e investigación en ajuste de VLMs: el adaptador sirve como ejemplo reproducible de flujo Unsloth + TRL + PEFT sobre un modelo cuantizado a 4 bits, útil para experimentar con fine-tuning multimodal de bajo coste.
- Asistente visual en aplicaciones de escritorio o móviles: dado su reducido tamaño, puede integrarse en aplicaciones que necesitan analizar capturas de pantalla o fotografías sin enviar datos a servicios en la nube.
- Base para un ajuste adicional específico de dominio: al ser un LoRA, puede combinarse o reentrenarse con nuevos datos manteniendo el modelo base congelado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye sección de evaluación cumplimentada y el repositorio no aporta métricas de MMLU, HumanEval, GSM8K, MMBench, DocVQA ni de ninguna otra tarea. Tampoco se dispone de datos de latencia o throughput medidos.

## Requisitos de hardware

- Adaptador en disco: 0,1 GB según el tamaño del repositorio. El modelo base debe descargarse por separado.
- VRAM estimada en 4 bits (bnb-4bit, configuración de partida): aproximadamente 2-3 GB para los pesos, más el *overhead* del codificador visual y la caché KV. Estimación orientativa, no medida.
- VRAM estimada en fp16/bf16 (adaptador fusionado con el modelo base): alrededor de 5-6 GB para los pesos de un modelo de ~2B parámetros, más caché KV y memoria del codificador visual. Estimación orientativa.
- GPU consumer: cabe con holgura en tarjetas de 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090). En 4 bits puede funcionar en GPUs de 6-8 GB, con margen limitado si se procesan imágenes de alta resolución o contextos largos.
- GPU de datacenter: A100, H100 o L40S son sobredimensionadas para un modelo de este tamaño; tienen sentido solo si se sirven muchas réplicas concurrentes o se necesita throughput elevado.
- Opciones de despliegue: carga directa con `transformers` + `peft` (el escenario natural para un adaptador LoRA); fusión de pesos (`merge_and_unload`) para exportar a otros formatos. vLLM, TGI y Ollama ofrecen soporte de la familia Qwen2-VL en función de la versión, pero la compatibilidad con este adaptador concreto no está verificada y requeriría fusionar los pesos previamente.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

No existen datos de rendimiento de este adaptador que permitan una comparación cuantitativa. La tabla siguiente compara el modelo base sobre el que se construye con alternativas de la misma categoría (VLM de ~2-3B parámetros). Los valores proceden de documentación pública de cada proyecto y deben verificarse en sus fichas oficiales.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `wired07/satquery-ai-qwen2vl-lora` | Adaptador LoRA sobre 2B | No disponible | No disponible | HuggingFace, 0 descargas | Sin documentación ni evaluación publicada |
| Qwen2-VL-2B-Instruct (modelo base) | ~2B | 32.768 tokens | Apache 2.0 (consultar) | HuggingFace, ampliamente utilizado | Resolución dinámica, M-RoPE, soporte de vídeo |
| SmolVLM-2.2B-Instruct | ~2,2B | Consultar ficha oficial | Apache 2.0 (consultar) | HuggingFace | Optimizado para eficiencia en dispositivos |
| InternVL2-2B | ~2,2B | Consultar ficha oficial | Consultar ficha oficial | HuggingFace | Rendimiento competitivo en benchmarks visuales |
| PaliGemma-3B | ~3B | Consultar ficha oficial | Licencia Gemma (con restricciones) | HuggingFace | Enfoque en tareas vision-language específicas |

## Limitaciones y advertencias

- Ausencia total de documentación: no se especifican dataset de entrenamiento, hiperparámetros, tarea objetivo ni proceso de evaluación. Es imposible saber qué comportamiento se ha optimizado ni qué se ha degradado.
- Licencia no declarada: el repositorio no indica licencia. Aunque el modelo base Qwen2-VL-2B-Instruct se publica bajo Apache 2.0, la ausencia de licencia explícita en el adaptador genera incertidumbre legal para uso comercial. Conviene contactar con el autor antes de utilizarlo en producción.
- Riesgo de olvido catastrófico (*catastrophic forgetting*): un ajuste LoRA SFT sin datos publicados puede haber reducido capacidades del modelo base como el multilingüismo, el razonamiento general o la comprensión de documentos. Es imprescindible evaluarlo antes de asumir que conserva las capacidades originales.
- Alucinación: inherente a los modelos de lenguaje y agravada en modelos pequeños de 2B parámetros. En tareas de teledetección o análisis documental, una respuesta plausible pero incorrecta puede tener consecuencias relevantes; se recomienda validación humana o verificación contra fuentes.
- Sesgos: no evaluados ni documentados. El modelo base puede arrastrar sesgos de sus datos de preentrenamiento en cuanto a representación geográfica, cultural o demográfica, un aspecto crítico si se aplica a imágenes de distintas regiones del mundo.
- Limitaciones de contexto e idioma: no se ha confirmado la ventana de contexto efectiva del adaptador ni los idiomas soportados tras el ajuste. El modelo base está optimizado para inglés y chino, por lo que el rendimiento en castellano puede ser inferior.
- Estado del repositorio: 0 descargas y 0 "likes" en el momento de la consulta, sin historial de uso ni validación por parte de la comunidad. No existen informes independientes de terceros.
- Formato de despliegue: al ser un adaptador PEFT, no puede servirse de forma autónoma; requiere cargar el modelo base, fusionar los pesos o emplear una herramienta compatible con LoRA, lo que añade complejidad al pipeline.
- Cuantización de partida: el modelo base está cuantizado a 4 bits, lo que introduce una pérdida de precisión adicional a la del propio ajuste.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/wired07/satquery-ai-qwen2vl-lora
- Modelo base utilizado: https://huggingface.co/unsloth/Qwen2-VL-2B-Instruct-unsloth-bnb-4bit
- Paper de Qwen2-VL: https://arxiv.org/abs/2409.12191
- Repositorio oficial de Qwen2-VL: https://github.com/QwenLM/Qwen2-VL
- Referencia sobre impacto ambiental citada en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de machine learning: https://mlco2.github.io/impact
- Búsqueda web realizada: sin resultados relevantes para este modelo. Los enlaces devueltos (ayuda de Gmail, foros en chino) no guardan relación con el repositorio y se descartan.
