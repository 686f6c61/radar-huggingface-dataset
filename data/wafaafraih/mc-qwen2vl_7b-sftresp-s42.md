# WafaaFraih/mc-qwen2vl_7b-sftresp-s42

## Resumen

`WafaaFraih/mc-qwen2vl_7b-sftresp-s42` es un adaptador LoRA de tipo PEFT publicado por el usuario WafaaFraih sobre el modelo multimodal `unsloth/Qwen2-VL-7B-Instruct-unsloth-bnb-4bit`, una versión cuantizada a 4 bits del Qwen2-VL-7B-Instruct de Alibaba. El repositorio contiene únicamente los pesos del adaptador en safetensors (3,9 GB), no un modelo completo, y está etiquetado como resultado de un ajuste supervisado (SFT) realizado con TRL y Unsloth.

El adaptador hereda la arquitectura y las capacidades del modelo base: un transformer multimodal con codificador visual de resolución dinámica, decoder Qwen2 de aproximadamente 8,29 mil millones de parámetros y una ventana de contexto nativa de 32 768 tokens, ampliable a 128 000 mediante YaRN. No obstante, la model card es una plantilla sin completar: no documenta dataset, hiperparámetros, evaluación, licencia ni idiomas, y el repositorio registra cero descargas y cero likes en el momento de la consulta.

Su relevancia es principalmente metodológica: ejemplifica una receta de bajo coste para adaptar un VLM de 7B con LoRA sobre una base cuantizada a 4 bits. Sin información de entrenamiento ni evaluación, no debe considerarse un modelo listo para producción, sino un artefacto experimental que requiere validación propia antes de cualquier uso real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Qwen2-VL-7B-Instruct: transformer multimodal con codificador visual ViT de resolución dinámica, M-RoPE y decoder Qwen2 |
| Parametros totales | 8,29 B en el modelo base; número de parámetros del adaptador no disponible |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible para el adaptador; el modelo base soporta 32 768 tokens nativos y 128 000 con YaRN |
| Tipos de cuantizacion | adaptador en safetensors (LoRA); base de entrenamiento en bnb-4bit; admite cuantización posterior a GGUF, AWQ o GPTQ tras fusionar el adaptador |
| Idiomas soportados | no disponible para el adaptador; el modelo base es multilingüe (inglés, chino y varias lenguas europeas y asiáticas) |
| Licencia | no disponible; el modelo base Qwen2-VL-7B-Instruct se distribuye bajo Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |
| Tipo de adaptacion | LoRA, según tag `lora` y librería `peft` |
| Rango y alpha de LoRA | no disponible |
| Dataset de entrenamiento | no disponible |
| Epocas e hiperparametros | no disponible |
| Framework de entrenamiento | TRL y Unsloth, según tags; PEFT 0.20.0 |
| Tamano del repositorio | 3,9 GB |
| Descargas y likes | 0 y 0 en la fecha de consulta |
| Fecha de creacion | 2026-10-21 (metadato del repositorio) |

## Arquitectura y entrenamiento

El modelo base Qwen2-VL-7B-Instruct combina un codificador visual ViT con resolución dinámica —que procesa la imagen a su tamaño nativo dividiéndola en parches— y un decoder transformer Qwen2 de aproximadamente 8,29 B de parámetros. Utiliza M-RoPE (multimodal rotary position embedding) para unificar posiciones de texto, imagen y vídeo, lo que permite manejar entradas visuales largas y vídeos dentro de la ventana de contexto. La variante empleada como base, publicada por Unsloth, está cuantizada a 4 bits con bitsandbytes para reducir el coste de memoria durante el ajuste.

Sobre esa base se aplica un adaptador LoRA entrenado con SFT mediante TRL y Unsloth, según los tags del repositorio. No se especifican el número de tokens de entrenamiento, la composición del dataset, el rango del adaptador, la tasa de aprendizaje ni si hubo fases posteriores de RLHF o DPO. El identificador `mc-qwen2vl_7b-sftresp-s42` sugiere una ejecución de SFT sobre respuestas con semilla 42, pero es una inferencia a partir del nombre y no está confirmada en la documentación. Tampoco se detalla si el ajuste incluyó pares imagen-texto o solo texto, un aspecto crítico porque un SFT exclusivamente textual puede degradar las capacidades visuales originales del modelo.

El tamaño del repositorio, 3,9 GB, es inusualmente grande para un único adaptador LoRA sobre un modelo de 7B; podría deberse a un rango elevado, a la inclusión de checkpoints intermedios o a estados del optimizador, pero no hay información que lo confirme.

## Capacidades

- Generación de texto conversacional: el adaptador conserva la interfaz de chat del modelo base, con plantilla de conversación Qwen2-VL.
- Comprensión de imágenes: herencia del codificador visual del modelo base, incluyendo descripción, respuesta a preguntas visuales y razonamiento sobre escenas.
- Comprensión de vídeo: el modelo base admite secuencias de vídeo como entrada gracias a M-RoPE; no se ha verificado que el adaptador mantenga esta capacidad.
- OCR y documentos: el modelo base está entrenado para leer texto en imágenes, tablas y documentos; el adaptador no documenta evaluación en este dominio.
- Capacidades multilingües: el modelo base cubre inglés, chino y otras lenguas, incluido el español; el adaptador no especifica idiomas de entrenamiento.
- Tool calling y function calling: no documentado para el adaptador ni confirmado en la información disponible.
- Agentes y razonamiento multi-paso: no documentado; no hay evidencia de entrenamiento específico para uso agéntico.
- Modo thinking o razonamiento extendido: no disponible.
- Entrada de audio: no soportada por el modelo base ni por el adaptador.

## Casos de uso

- Prototipado de VQA de dominio específico: el adaptador puede probarse como punto de partida para responder preguntas sobre imágenes de un sector concreto (por ejemplo, recambios, productos o documentación técnica), aprovechando la ventana de 32 768 tokens del modelo base para incluir contexto textual extenso junto a la imagen.
- Extracción de datos de documentos: uso del modelo base para leer facturas, albaranes o formularios escaneados y devolver campos estructurados; el adaptador podría haberse ajustado para un formato de respuesta concreto, aunque no hay evaluación que lo respalde.
- Asistencia conversacional multimodal interna: despliegue de un chat que acepte capturas de pantalla o fotografías y mantenga conversaciones multi-turno, con la salvedad de que el adaptador debe validarse antes de exponerlo a usuarios.
- Descripción de imágenes para accesibilidad: generación de texto alternativo y descripciones largas de fotografías, apoyándose en el codificador visual del modelo base y en la capacidad de generar respuestas detalladas.
- Anotación asistida de datasets visuales: preetiquetado de imágenes o vídeos con descripciones y respuestas candidatas que después se revisan manualmente, reduciendo el coste de anotación en proyectos de investigación.
- Reproducción de recetas de ajuste multimodal: el repositorio sirve como referencia para experimentos de SFT con LoRA sobre bases cuantizadas a 4 bits con Unsloth y TRL, especialmente para comparar configuraciones de entrenamiento.
- Análisis de vídeo de corta duración: muestreo de fotogramas y consulta en lenguaje natural sobre eventos, siempre que se valide que el adaptador no ha perdido la capacidad de procesar secuencias visuales.
- Filtrado y clasificación de contenido visual: etiquetado de imágenes por categorías o presencia de elementos, con revisión humana obligatoria por el riesgo de alucinación y la ausencia de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador ocupa 3,9 GB en disco, pero no puede ejecutarse solo: requiere cargar el modelo base Qwen2-VL-7B-Instruct y aplicar el LoRA, o bien fusionar ambos previamente.
- Pesos del modelo base en bf16: aproximadamente 16,6 GB, a los que se suma el codificador visual y la caché KV.
- Pesos en 4 bits: aproximadamente 5-6 GB, más overhead de activaciones y caché.
- VRAM estimada para inferencia en 4 bits con contexto corto (2 000-4 000 tokens): en torno a 8-10 GB, dependiendo de la implementación.
- VRAM estimada para contexto de 8 000-16 000 tokens en 4 bits: aproximadamente 10-14 GB.
- Contexto de 32 768 tokens en 4 bits: por encima de 16 GB, y considerablemente más en bf16, donde se superan los 24 GB.
- GPU consumer: RTX 4090 o RTX 3090 (24 GB) son adecuadas en 4 bits con contexto moderado; RTX 4080 o RTX 4060 Ti de 16 GB quedan justas para contexto corto; GPUs de 12 GB no son recomendables con entrada visual.
- GPU de datacenter: A100 40 GB, A100 80 GB, H100 y L40S 48 GB permiten bf16, contexto largo y mayor concurrencia.
- Despliegue: Transformers con PEFT para pruebas, vLLM para serving con soporte de Qwen2-VL, y llama.cpp u Ollama tras fusionar el adaptador y convertir a GGUF con el proyector multimodal correspondiente. El soporte en TGI no está confirmado en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Modalidad | Notas |
|---|---|---|---|---|---|
| Este adaptador (mc-qwen2vl_7b-sftresp-s42) | 8,29 B en la base; LoRA de tamano no disponible | No disponible en el adaptador; 32 768 en la base | No disponible | Texto e imagen (heredada) | Sin evaluacion ni documentacion de entrenamiento |
| Qwen2-VL-7B-Instruct | 8,29 B | 32 768 tokens, 128 000 con YaRN | Apache 2.0 | Texto, imagen y video | Modelo base de referencia, ampliamente evaluado |
| Qwen2.5-VL-7B-Instruct | 8,29 B (aproximado) | 128 000 tokens | Apache 2.0 | Texto, imagen y video | Generacion posterior con mejor OCR y uso agentico |
| InternVL2.5-8B | 8,1 B (aproximado) | No disponible | No disponible en la informacion consultada | Texto e imagen | Alternativa multimodal de tamano comparable |

La comparación relevante no es de rendimiento, ya que no hay métricas del adaptador, sino de madurez: frente al modelo base y a las alternativas citadas, este repositorio carece de evaluación pública, licencia declarada y documentación de datos, por lo que su uso en producción exige una validación completa por parte del integrador.

## Limitaciones y advertencias

- La model card es una plantilla sin completar: todos los campos de descripción, datos, hiperparámetros y evaluación figuran como `[More Information Needed]`.
- No se declara licencia para el adaptador. Aunque el modelo base es Apache 2.0, la ausencia de licencia explícita impide asumir permiso de uso comercial sobre los pesos derivados.
- No hay información sobre el dataset de entrenamiento, por lo que no pueden evaluarse sesgos, toxicidad, procedencia de datos ni cumplimiento de derechos de autor.
- No se han publicado resultados de evaluación; se desconoce si el ajuste mejora la tarea objetivo o degrada las capacidades generales del modelo base.
- El entrenamiento parte de una base cuantizada a 4 bits, lo que puede introducir pérdida de precisión adicional respecto al modelo original en bf16.
- No se especifica si el SFT incluyó datos visuales. Si fue solo texto, las capacidades de OCR, VQA y vídeo podrían haberse deteriorado.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en OCR de documentos densos y en preguntas sobre imágenes ambiguas.
- No hay información sobre ajuste de seguridad, alineación o filtrado de contenido; no se recomienda su exposición directa a usuarios finales sin capas adicionales.
- Idiomas soportados no documentados: el comportamiento en español puede diferir del modelo base y debe medirse.
- La fecha de creación del repositorio (2026-10-21) es posterior a la fecha habitual de consulta, lo que sugiere un posible error de metadatos y refuerza la falta de trazabilidad.
- El tag `arxiv:1910.09700` corresponde al artículo de Lacoste et al. sobre impacto ambiental del aprendizaje automático, no a un paper del modelo; no debe interpretarse como documentación técnica.
- El reducido número de descargas y la ausencia de comunidad dificultan encontrar reportes independientes de calidad.
- El repositorio contiene solo el adaptador: cualquier despliegue requiere descargar por separado el modelo base, con el coste de almacenamiento y memoria asociado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/WafaaFraih/mc-qwen2vl_7b-sftresp-s42
- Modelo base en Unsloth: https://huggingface.co/unsloth/Qwen2-VL-7B-Instruct-unsloth-bnb-4bit
- Modelo original Qwen2-VL-7B-Instruct: https://huggingface.co/Qwen/Qwen2-VL-7B-Instruct
- Paper de Qwen2-VL: https://arxiv.org/abs/2409.12191
- Blog de Qwen2-VL: https://qwenlm.github.io/blog/qwen2-vl/
- Repositorio GitHub de Qwen2-VL: https://github.com/QwenLM/Qwen2-VL
- Documentación de PEFT: https://huggingface.co/docs/peft
- Documentación de TRL: https://huggingface.co/docs/trl
- Documentación de Unsloth: https://docs.unsloth.ai/
- Referencia del tag arXiv del repositorio (Lacoste et al., impacto ambiental): https://arxiv.org/abs/1910.09700
