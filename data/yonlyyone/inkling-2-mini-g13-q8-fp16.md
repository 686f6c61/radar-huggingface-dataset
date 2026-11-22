# yonlyyone/Inkling-2-Mini-g13-q8-fp16

## Resumen

Inkling-2-Mini-g13-q8-fp16 es una cuantización de 8 bits en formato MLX del modelo multimodal thinkingmachines/Inkling-2-Mini, publicada por el usuario yonlyyone. El checkpoint está optimizado para GPUs integradas de Apple Silicon (M1, M2 y M3) y para el motor de inferencia `g13`, lo que permite ejecutar un modelo de arquitectura MoE con capacidades de imagen-texto en Macs de 32, 64 o 128 GB de memoria unificada. El modelo base es de tipo image-text-to-text y está licenciado bajo Apache 2.0.

La relevancia de esta ficha radica en que se trata de una conversión comunitaria, no oficial, que preserva la cuantización original de los expertos enrutados (NVFP4 en las capas 0-19 y MXFP8 en las capas 20-23) mientras aplica cuantización afín de 8 bits con `group_size=64` a las proyecciones densas (atención, embeddings y `lm_head`). Las normas, convoluciones cortas, puertas de mensaje y el torreón de visión se mantienen en `float16`, lo que según el autor elimina una penalización del 28 % en prefill BF16 sobre GPUs M1/M2.

El checkpoint ocupa aproximadamente 18,1 GB en disco y declara 6.896.142.848 parámetros totales según los safetensors. No se dispone de información publicada sobre longitud de contexto, idiomas soportados ni resultados de benchmarks en la documentación accesible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) multimodal image-text-to-text, según tags del modelo base; detalles internos no disponibles |
| Parametros totales | 6.896.142.848 (6,9 mil millones según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit affine (`group_size=64`) en proyecciones densas; NVFP4 en expertos enrutados capas 0-19; MXFP8 en expertos capas 20-23; float16 en normas, convoluciones cortas, puertas de mensaje y torreón de visión |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 8-bit |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini emplea una arquitectura de mezcla de expertos (MoE) con capacidades multimodales de imagen a texto, según los tags del repositorio (`moe`, `image-text-to-text`, `inkling2_loop`). La cuantización aquí presentada mantiene intacta la cuantización original de los expertos enrutados del modelo base: NVFP4 para las capas 0 a 19 y MXFP8 para las capas 20 a 23. Las proyecciones densas (atención, embeddings y `lm_head`) se recuantizan a 8 bits afín con `group_size=64` y escalas/sesgos en `float16`. Los componentes sensibles a precisión (normas, convoluciones cortas, puertas de mensaje y el torreón de visión) se conservan en `float16` para evitar degradación y la penalización de prefill BF16 en GPUs M1/M2.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base utilizó RLHF, DPO u otras técnicas de alineación. Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal más allá de la mención al motor `g13` y al tag `inkling2_loop`.

## Capacidades

- Generación de texto conversacional multi-turno, según el tag `conversational`.
- Procesamiento conjunto de imagen y texto (pipeline `image-text-to-text`), lo que habilita tareas de descripción de imágenes, VQA y razonamiento visual.
- Arquitectura MoE con expertos enrutados, lo que permite un cómputo activo potencialmente menor que el total de parámetros.
- Ejecución en Apple Silicon mediante la librería MLX y el motor `g13`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede desplegarse con `g13 serve --quant q8` en un Mac de 32 GB o más, ofreciendo conversaciones multi-turno sin depender de la nube y con la privacidad que ello implica.
- Descripción y análisis de imágenes en escritorio: gracias a su pipeline image-text-to-text, puede emplearse para generar alt-text, resumir capturas de pantalla o extraer información de documentos escaneados en flujos locales sobre Apple Silicon.
- Prototipado de aplicaciones multimodales: investigadores que trabajan en M1/M2/M3 pueden validar pipelines de visión-lenguaje sin acceso a GPUs dedicadas, usando el checkpoint de 18,1 GB como base reproducible.
- Evaluación de cuantizaciones: el checkpoint sirve como referencia para estudiar el impacto de la cuantización mixta (NVFP4/MXFP8 en expertos, 8-bit affine en densas, fp16 en normas) sobre la calidad del modelo base.
- Inferencia en entornos con restricciones de hardware: al caber en 32 GB de memoria unificada, permite desplegar un MoE multimodal en portátiles y equipos de sobremesa Apple sin GPU discreta.
- Educación y experimentación: útil para cursos y talleres sobre MLX, cuantización y despliegue de modelos MoE en hardware de consumo, dado su formato safetensors y su integración con `g13`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~18,1 GB en disco; se recomienda Mac con 32 GB, 64 GB o 128 GB de memoria unificada según el autor.
- GPUs recomendadas: Apple Silicon M1, M2 y M3 (GPUs integradas). No está pensado para CUDA ni ROCm.
- Cabe en GPU de consumo: sí, en Macs con 32 GB o más de memoria unificada.
- Opciones de despliegue: motor `g13` (`g13 pull q8`, `g13 serve --quant q8`) y librería MLX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada. El autor menciona que el uso de `float16` en normas y torreón de visión elimina una penalización del 28 % en prefill BF16 sobre M1/M2, pero no aporta cifras absolutas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-g13-q8-fp16 (este) | 6,9 mil millones | no disponible | Apache 2.0 | safetensors MLX 8-bit | Cuantización comunitaria para Apple Silicon |
| thinkingmachines/Inkling-2-Mini (base) | no disponible | no disponible | Apache 2.0 | no disponible | Modelo original multimodal MoE |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre modelos comparables en la documentación accesible |

## Limitaciones y advertencias

- Es una cuantización comunitaria no oficial: no ha sido validada por Thinking Machines ni por el equipo del modelo base, por lo que puede introducir degradaciones respecto al original.
- La cuantización mixta (NVFP4/MXFP8 en expertos, 8-bit affine en densas, fp16 en normas) puede afectar a la calidad en tareas sensibles a precisión, como matemáticas o código.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan evaluaciones específicas de fidelidad.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento adecuado en castellano u otros idiomas distintos del inglés.
- Longitud de contexto no documentada: limita la planificación de casos de uso con documentos largos o conversaciones extensas.
- Compatibilidad restringida: solo Apple Silicon con MLX y el motor `g13`; no es desplegable en CUDA, ROCm ni en la mayoría de stacks estándar de servidores.
- Licencia Apache 2.0 permite uso comercial, pero al ser una conversión comunitaria conviene verificar la licencia y los términos del modelo base antes de producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni informes de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/yonlyyone/Inkling-2-Mini-g13-q8-fp16
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
