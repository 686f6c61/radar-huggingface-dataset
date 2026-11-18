# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-OPD-Mixture8-Qwen3.8-27B-lr1e-6-step10

## Resumen

El modelo `Safety_Tuning-Qwen3.5-4B-Base-OPD-Mixture8-Qwen3.8-27B-lr1e-6-step10` es un checkpoint de investigación publicado por el usuario thkim0305-SNU (Universidad Nacional de Seúl) sobre la base de Qwen3.5-4B-Base. Se trata de un ajuste fino orientado a seguridad mediante destilación on-policy (OPD, *on-policy distillation*) con un profesor de mayor tamaño, Qwen3.8-27B, empleando un objetivo de divergencia KL inversa sin término adicional de referencia. El resultado es un modelo de 4.659.865.088 parámetros (4,66 mil millones) que conserva la arquitectura y el tokenizador del modelo base.

La relevancia de esta publicación es metodológica más que de producto: documenta un experimento reproducible de alineación de seguridad sobre un modelo pequeño usando un profesor grande, con hiperparámetros explícitos (learning rate constante 1e-06, lote de 30 prompts × 4 respuestas, límites de 32768 tokens de generación y 65536 de secuencia, temperatura 1.0, semilla 42). El autor declara explícitamente que no se reclama ninguna mejora en benchmarks, lo que sitúa el artefacto en el terreno de la investigación abierta y no en el de un modelo listo para producción.

El checkpoint corresponde a 10 actualizaciones del optimizador OPD (iteración Megatron basada en cero: 9), contadas desde la inicialización de esta rama y no desde un SFT previo. El repositorio contiene únicamente pesos de inferencia y activos de tokenizador/configuración; se excluyen estado del optimizador, RNG, datos de entrenamiento y credenciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (tag `qwen3_5`, pipeline `image-text-to-text`); detalles internos no disponibles |
| Parametros totales | 4.659.865.088 (4,66 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como ventana nominal; los límites de entrenamiento fueron 32768 tokens de generación y 65536 de secuencia |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-4B-Base` (revisión `1001bb4d826a52d1f399e183466143f4da7b741b`) y se entrena mediante destilación on-policy con `Qwen/Qwen3.8-27B` (revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`) como profesor. El objetivo es una KL inversa simple, sin KL de referencia adicional. El grupo de prompts proviene de una mezcla de ocho conjuntos de datos, preservando el orden original de las fuentes. El profesor emplea un sistema específico por dataset: instrucciones de sistema ("Spec") sobre prompts dañinos o difíciles y sin Spec añadido en prompts benignos.

Los hiperparámetros documentados son: learning rate constante de 1e-06, lote de 30 prompts con 4 respuestas cada uno, límite de generación de 32768 tokens, límite de secuencia de 65536 tokens, muestreo con temperatura 1.0 y semilla 42. La ejecución se identifica como `opd-q38t-base-lr1e6-20steps-save5-20261118-v1` y este checkpoint corresponde a 10 actualizaciones OPD. Los pesos entrenados se convierten desde el checkpoint comprometido y se verifican mediante ida y vuelta inversa exacta; los tensores de visión y MTP ausentes en el checkpoint de entrenamiento se conservan sin cambios desde la inicialización fijada. El autor no documenta innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen3.5-4B.
- Entrada imagen-texto según el tag `image-text-to-text` del repositorio, aunque los tensores de visión se mantienen sin entrenar respecto a la inicialización.
- Ajuste orientado a seguridad: el entrenamiento con profesor busca modular respuestas en prompts dañinos o difíciles.
- Compatibilidad con `transformers` y con endpoints (`endpoints_compatible` en los tags).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, function calling, agentes y modo de razonamiento explícito: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en alineación de seguridad: reproducir o auditar el pipeline OPD comparando este checkpoint (10 pasos) con la inicialización Qwen3.5-4B-Base para medir el efecto del profesor de 27B sobre el comportamiento en prompts dañinos.
- Estudio de destilación on-policy: analizar la curva de aprendizaje con learning rate constante 1e-06 y lotes de 30×4, útil para calibrar recetas de destilación en modelos de ~4B.
- Evaluación de robustez conversacional: desplegar el modelo en un banco de pruebas de diálogo multi-turno para medir deriva de comportamiento tras el ajuste de seguridad, dado que el autor no reclama mejoras en benchmarks.
- Base para experimentos de cuantización: al ser un checkpoint de 4,66 B en safetensors, sirve como punto de partida para probar GGUF/AWQ/GPTQ y comparar la degradación de seguridad tras comprimir.
- Prototipado de asistentes con entrada de imagen: aprovechar la ruta multimodal declarada en los tags para experimentos internos, teniendo en cuenta que los tensores de visión no se entrenaron en esta fase.
- Docencia y formación: ejemplo práctico y reproducible de destilación profesor-alumno con configuración documentada (semilla, temperatura, límites de secuencia) para cursos de ajuste fino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se reclama ninguna mejora en benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 9,3 GB solo para pesos (coincide con el tamaño del repo), más overhead de activaciones y caché KV; en la práctica, 12-16 GB para contextos moderados.
- Cuantización a 8 bits: ~4,7 GB de pesos; a 4 bits: ~2,4 GB de pesos, más overhead.
- GPU recomendadas: A100 40/80 GB o H100 para contextos largos (hasta 65536 tokens de secuencia según el entrenamiento); RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes en BF16 para contextos estándar.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB) en BF16 con contexto moderado, y en GPUs de 8-12 GB si se cuantiza a 4-8 bits.
- Opciones de despliegue: `transformers` (librería declarada), vLLM, TGI, llama.cpp/Ollama previa conversión a GGUF (no se distribuyen pesos GGUF en el repo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Qwen3.5-4B OPD step 10) | 4,66 B | no disponible (entrenado con secuencias de hasta 65536) | Destilación on-policy para seguridad | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B-Base | 4 B (aprox., según nombre) | no disponible | Modelo base generalista | no disponible en la información | Hugging Face |
| Qwen/Qwen3.8-27B (profesor) | 27 B (aprox., según nombre) | no disponible | Modelo generalista de mayor tamaño | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint de investigación con solo 10 actualizaciones OPD: no es un modelo final ni validado para producción.
- El autor no reclama mejoras en benchmarks; no hay evidencia publicada de mejora en seguridad ni en capacidades generales.
- Sesgos conocidos: no documentados; al heredar el modelo base, es probable que arrastre sus sesgos, pero no hay información específica.
- Riesgo de alucinación: no evaluado en la información disponible.
- Idiomas soportados no declarados; no se puede garantizar cobertura multilingüe.
- Los tensores de visión y MTP no se entrenaron en esta fase y se conservan de la inicialización, por lo que las capacidades multimodales no están ajustadas.
- El estado del optimizador, RNG, datos de entrenamiento y credenciales no se distribuyen, lo que limita la reproducción exacta del entrenamiento a partir del repo.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluaciones de seguridad publicadas desaconseja su despliegue directo en entornos sensibles sin auditoría propia.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-OPD-Mixture8-Qwen3.8-27B-lr1e-6-step10
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Modelo profesor: https://huggingface.co/Qwen/Qwen3.8-27B
- Perfil del autor: https://huggingface.co/thkim0305-SNU
