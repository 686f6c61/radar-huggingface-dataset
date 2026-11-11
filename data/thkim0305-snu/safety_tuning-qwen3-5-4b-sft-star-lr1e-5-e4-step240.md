# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-SFT-STAR-lr1e-5-E4-step240

## Resumen

Safety_Tuning-Qwen3.5-4B-SFT-STAR-lr1e-5-E4-step240 es un ajuste fino supervisado (SFT) orientado a seguridad del modelo multimodal Qwen/Qwen3.5-4B, desarrollado por el usuario thkim0305-SNU. El checkpoint se ha entrenado sobre trayectorias docentes de los conjuntos STAR-1 y STAR-benign-915, con el objetivo de reforzar el comportamiento seguro del modelo base en tareas de imagen-texto a texto sin degradar su capacidad conversacional.

El modelo conserva la arquitectura original de Qwen3.5-4B (transformer multimodal con torre de visión y módulo MTP) y sus 4.659.865.088 parámetros totales. La intervención se limita a los tensores de texto: los pesos de visión y los tensores MTP no entrenados se mantienen del modelo base fijado en la revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`.

Es relevante porque documenta un procedimiento de safety tuning reproducible (learning rate 1e-5, 240 pasos de optimizador, 4 épocas, batch global 128) sobre un modelo multimodal de tamano medio, con verificación de conversión tensor a tensor. No obstante, el autor no declara métricas de evaluación, por lo que su eficacia real en seguridad no está cuantificada en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5) con torre de visión y módulo MTP; fine-tuning SFT solo sobre tensores de texto |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer multimodal con pipeline image-text-to-text. El ajuste se realizó mediante SFT sobre 7.655 trayectorias docentes completas procedentes de STAR-1 y STAR-benign-915, supervisando razonamiento, respuesta y token EOS. El entrenamiento usó learning rate 1e-5, batch global 128 y 4 épocas completas (240 actualizaciones de optimizador, iteración nativa 239 en base cero). Cada ejecución de learning rate parte de forma independiente del modelo base original y no se inyecta la especificación del profesor en el contexto del estudiante.

La exportación a Hugging Face es selectiva: todos los tensores de texto entrenados provienen del checkpoint nativo, mientras que los tensores de visión y los MTP no entrenados se retienen del modelo base fijado. La verificación de conversión incluye conversión inversa exacta de cada tensor de texto nativo, comprobación de pesos finitos y coincidencia de las 738 claves y formas de tensor de Hugging Face. El repositorio excluye optimizador, estado RNG, logs y ejemplos de entrenamiento.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredados del modelo base Qwen3.5-4B.
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text), con torre de visión conservada del modelo base.
- Comportamiento orientado a seguridad: el ajuste SFT busca respuestas más seguras ante entradas potencialmente dañinas, incluyendo las del conjunto benigno STAR-benign-915.
- Supervisión explícita de cadenas de razonamiento y respuestas finales durante el entrenamiento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Moderación y filtrado de contenido multimodal: el modelo puede evaluar pares imagen-texto y generar respuestas seguras ante entradas ambiguas o potencialmente dañinas, aprovechando el ajuste sobre trayectorias de seguridad.
- Asistentes conversacionales con salvaguardas: integración en chatbots que reciben imágenes y texto, donde el SFT sobre STAR-benign-915 reduce respuestas problemáticas en consultas legítimas.
- Investigación en safety tuning: punto de partida reproducible (learning rate, pasos, épocas y batch documentados) para comparar estrategias de SFT sobre modelos multimodales de 4B.
- Evaluación de robustez de modelos base: permite medir el efecto de un ajuste de seguridad sobre las capacidades originales de Qwen3.5-4B en tareas de visión-lenguaje.
- Generación de descripciones de imagen con criterios de seguridad: útil en pipelines de accesibilidad o catalogación donde se requiere evitar contenido sensible en las descripciones generadas.
- Despliegue en entornos con recursos limitados: con 4,66B parámetros y pesos safetensors, puede servirse en una sola GPU de gama alta para prototipos y pruebas de concepto.
- Análisis de conversaciones con contexto visual en atención al cliente: el modelo puede procesar capturas o imágenes enviadas por el usuario junto con texto, siempre que se validen previamente sus límites de contexto y latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se afirman puntuaciones de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 12-16 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 5 GB para pesos; en 4 bits, alrededor de 2,5-3 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para FP16 con margen; RTX 3090/4080 (16 GB) para contextos cortos.
- Cabe en GPU de consumo: sí, en RTX 4090 con FP16 para lotes pequeños, y en GPUs de 8-12 GB si se aplica cuantización.
- Opciones de despliegue: transformers (formato nativo del repo); vLLM, TGI, llama.cpp u Ollama no están confirmados en la información disponible, y al tratarse de un modelo multimodal requieren soporte específico de Qwen3.5.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-SFT-STAR (este) | 4,66B | no disponible | Apache-2.0 | SFT de seguridad multimodal | Hugging Face, safetensors |
| Qwen/Qwen3.5-4B (base) | 4,66B | no disponible | no disponible en la información | Modelo multimodal generalista | Hugging Face |
| Alternativas de safety tuning multimodal de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de otros modelos comparables documentados en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado métricas de seguridad ni de capacidad; no hay evidencia cuantificada de que el ajuste reduzca comportamientos dañinos sin degradar el rendimiento general.
- Riesgo de alucinación inherente al modelo base; el SFT de seguridad no elimina este comportamiento.
- El ajuste se limita a los tensores de texto: la torre de visión y el módulo MTP no se entrenaron, por lo que posibles sesgos visuales del modelo base persisten.
- Idiomas soportados no documentados; no se garantiza un comportamiento uniforme fuera de los idiomas cubiertos por el modelo base.
- Longitud de contexto no documentada; debe verificarse antes de desplegar en producción con conversaciones largas.
- El entrenamiento usó únicamente 7.655 trayectorias de dos datasets concretos (STAR-1 y STAR-benign-915), lo que puede limitar la generalización a otros dominios de riesgo.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni asume responsabilidad sobre el comportamiento del modelo en producción.
- El repositorio excluye optimizador, estado RNG y logs; no es posible reanudar el entrenamiento exactamente desde este checkpoint.
- Modelo con muy pocas descargas (19) y sin likes: no ha sido validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-SFT-STAR-lr1e-5-E4-step240
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset STAR-1: https://huggingface.co/datasets/UCSC-VLAA/STAR-1
- Dataset STAR-benign-915: https://huggingface.co/datasets/UCSC-VLAA/STAR-benign-915
