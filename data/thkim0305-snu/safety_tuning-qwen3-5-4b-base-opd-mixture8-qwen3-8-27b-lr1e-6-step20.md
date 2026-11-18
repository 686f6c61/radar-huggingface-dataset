# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-OPD-Mixture8-Qwen3.8-27B-lr1e-6-step20

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-OPD-Mixture8-Qwen3.8-27B-lr1e-6-step20 es un checkpoint de investigación publicado por el usuario thkim0305-SNU en Hugging Face. Se trata de un ajuste fino por destilación en política (*on-policy distillation*, OPD) del modelo base Qwen/Qwen3.5-4B-Base, utilizando como profesor Qwen/Qwen3.8-27B. El objetivo declarado es el *safety tuning*: alinear el comportamiento del modelo pequeño con el del profesor en materia de seguridad, sin recurrir a un KL de referencia adicional.

El modelo conserva la arquitectura y el tokenizador del Qwen3.5-4B-Base original (familia Qwen3.5, pipeline `text-generation`, con soporte declarado de `image-text-to-text` en las etiquetas). Cuenta con 4.659.865.088 parámetros reales según los pesos en safetensors y un repositorio de 9,3 GB. El checkpoint corresponde únicamente a 20 actualizaciones del optimizador OPD (iteración Megatron basada en cero: 19), contadas desde la inicialización de esta rama y no desde un entrenamiento SFT previo.

Su relevancia es acotada y experimental: el propio autor indica que no se reclama ninguna mejora en benchmarks y que se distribuyen solo pesos de inferencia más activos de tokenizador y configuración. Es un artefacto útil para estudiar dinámicas de destilación en política aplicadas a seguridad en modelos de ~4B, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (límites de generación en entrenamiento: 32768 tokens de generación, 65536 de secuencia) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base (revisión `1001bb4d826a52d1f399e183466143f4da7b741b`) y se entrena mediante destilación en política con un objetivo de reverse-KL simple, sin KL de referencia adicional. El profesor es Qwen/Qwen3.8-27B (revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`). El pool de prompts proviene de la mezcla de ocho datasets más reciente, preservando el orden original de las fuentes.

Los hiperparámetros declarados son: learning rate constante de 1e-06, batch de 30 prompts × 4 respuestas, límite de generación de 32768 tokens y de secuencia de 65536, muestreo con temperatura 1.0 y semilla 42. El profesor emplea un sistema específico por dataset: *Spec* en prompts dañinos o difíciles y sin *Spec* añadido en prompts benignos. La ejecución se identifica como `opd-q38t-base-lr1e6-20steps-save5-20261118-v1`.

Los pesos de lenguaje entrenados se convierten desde el checkpoint comprometido y se verifican mediante ida y vuelta inversa exacta. Los tensores de visión y MTP ausentes en el checkpoint de entrenamiento se conservan sin cambios respecto a la inicialización fijada. No se incluyen estado del optimizador, estado RNG, datos de entrenamiento ni credenciales.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`).
- Destilación orientada a seguridad: el comportamiento en prompts dañinos o difíciles se alinea con el del profesor Qwen3.8-27B.
- Soporte declarado de entrada imagen-texto en las etiquetas del repositorio (`image-text-to-text`), aunque los tensores de visión se mantienen sin modificar respecto a la inicialización.
- Compatibilidad con endpoints de Hugging Face (`endpoints_compatible`).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, function calling, agentes y modo de razonamiento extendido: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en destilación en política: el checkpoint permite analizar cómo evoluciona la alineación de seguridad tras un número reducido de actualizaciones (20) frente al modelo base, comparando distribuciones de salida con el profesor.
- Estudios de seguridad comparativos: sirve como punto intermedio entre Qwen3.5-4B-Base y el profesor de 27B para medir la transferencia de comportamiento en prompts dañinos y benignos.
- Reproducción experimental: los hiperparámetros y revisiones fijadas permiten replicar el entrenamiento o extenderlo a más pasos con la misma configuración.
- Evaluación de robustez de profesores: útil para comprobar si el sistema *Spec* por dataset del profesor se traslada de forma efectiva a un modelo de 4B.
- Base para experimentos de alineación posteriores: al ser un checkpoint intermedio con licencia Apache 2.0, puede servir de inicialización para SFT o DPO adicionales en investigación.
- Despliegue de pruebas en entornos controlados: con 4,66B parámetros y pesos safetensors, cabe en GPUs de gama alta para evaluaciones internas, aunque no se recomienda su uso en producción por la ausencia de benchmarks y garantías.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que no se reclama ninguna mejora en benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo denso de ~4,66B parámetros, en FP16 requeriría aproximadamente 9,3 GB de pesos, y en cuantizaciones de 8 bits o 4 bits bajaría sustancialmente, aunque no se publican versiones cuantizadas.
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs consumer de gama alta con suficiente VRAM (por ejemplo, RTX 4090 de 24 GB en FP16), pero no hay validación publicada.
- Cabe en GPU consumer: probable por tamaño, sin confirmación oficial.
- Opciones de despliegue: transformers (librería declarada) y endpoints compatibles. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-OPD-Mixture8 (este) | 4,66B | no disponible | Apache 2.0 | Checkpoint de investigación, 20 pasos OPD, sin benchmarks |
| Qwen/Qwen3.5-4B-Base | no disponible en la información | no disponible | no disponible en la información | Modelo base de partida |
| Qwen/Qwen3.8-27B | no disponible en la información | no disponible | no disponible en la información | Profesor usado en la destilación |

No se dispone de datos de rendimiento comparables para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Checkpoint de investigación con solo 20 actualizaciones del optimizador; no debe interpretarse como un modelo final alineado.
- El autor no reclama mejoras en benchmarks; no hay evidencia publicada de rendimiento.
- No se especifican idiomas soportados ni evaluación multilingüe.
- No se publican datos sobre sesgos, tasas de alucinación ni evaluaciones de seguridad cuantitativas.
- Los tensores de visión y MTP se conservan sin entrenar respecto a la inicialización, por lo que las capacidades multimodales no han sido ajustadas en esta etapa.
- No se incluyen datos de entrenamiento ni estado del optimizador, lo que limita la reproducibilidad exacta del proceso.
- Licencia Apache 2.0 permite uso comercial según los términos de la licencia, pero la ausencia de evaluaciones hace desaconsejable su uso en producción sin validación propia.
- El nombre del repositorio incluye referencias a configuraciones (Mixture8, lr1e-6, step20) que deben contrastarse con la model card antes de cualquier uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-OPD-Mixture8-Qwen3.8-27B-lr1e-6-step20
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Modelo profesor: https://huggingface.co/Qwen/Qwen3.8-27B
