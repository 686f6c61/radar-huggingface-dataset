# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-SFT-STAR-lr1e-5-E2-step120

## Resumen

Safety_Tuning-Qwen3.5-4B-SFT-STAR-lr1e-5-E2-step120 es un checkpoint de ajuste fino supervisado (SFT) orientado a seguridad, derivado del modelo multimodal Qwen/Qwen3.5-4B. Lo publica el usuario thkim0305-SNU y se distribuye en formato safetensors con licencia Apache 2.0. El modelo conserva la torre de visión del modelo base y ha sido entrenado únicamente sobre los tensores de texto, por lo que sigue siendo un modelo image-text-to-text capaz de procesar imágenes y texto de entrada.

El objetivo del ajuste es el alineamiento de seguridad: se ha entrenado con 7.655 trayectorias docentes completas de los conjuntos STAR-1 y STAR-Benign, supervisando razonamiento, respuesta y token EOS. La nomenclatura del repositorio documenta la configuración exacta del entrenamiento: learning rate 1e-5, 120 actualizaciones del optimizador, época 2 de 4 y batch global de 128.

El modelo tiene 4.659.865.088 parámetros y un repositorio de 9,3 GB. Es relevante para quienes investigan alineamiento de seguridad en modelos multimodales de tamano medio, ya que ofrece un punto de control reproducible con hiperparámetros documentados y verificación de conversión de tensores. No se han publicado puntuaciones de evaluación en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Qwen3.5; incluye torre de visión y modulo MTP (multi-token prediction) no entrenado |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en precision de entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B (revision `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`) y aplica un ajuste fino supervisado solo sobre los tensores de texto. La torre de visión y los tensores MTP no entrenados se conservan del modelo base fijado; según la model card, el modulo MTP no fue entrenado. El pipeline declarado es image-text-to-text, por lo que la entrada admite imágenes y texto aunque el entrenamiento se haya centrado en el canal textual.

El entrenamiento usa 7.655 trayectorias docentes completas de STAR-1 y STAR-Benign, con supervisión sobre razonamiento, respuesta y EOS. Cada ejecución de learning rate parte de forma independiente del modelo base original y no se inyecta la especificación del profesor en el contexto del estudiante. Los hiperparámetros documentados son learning rate 1e-5, batch global 128, 120 actualizaciones del optimizador y época 2 de 4. La ejecución de origen es `qwen35-star-slime-sft-4ep-b128-pro6000-gpu01-20261106-v3` y la iteración nativa del checkpoint es 119 (base cero). La conversión incluye verificación de conversión inversa exacta de cada tensor de texto nativo, comprobación de pesos finitos y coincidencia de las 738 claves y formas de tensores de Hugging Face.

## Capacidades

- Generación de texto conversacional con formato multi-turno, según la etiqueta `conversational`.
- Procesamiento de entrada imagen-texto (pipeline `image-text-to-text`), heredado del modelo base.
- Razonamiento supervisado: el entrenamiento incluye trayectorias con razonamiento explícito como parte de la señal de supervisión.
- Ajuste orientado a seguridad: entrenado con STAR-1 y STAR-Benign para modificar el comportamiento ante peticiones dañinas o benignas.
- Compatibilidad con endpoints de Hugging Face (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Investigación en alineamiento de seguridad: el checkpoint sirve como punto de partida reproducible para estudiar el efecto de un SFT con learning rate 1e-5 y 120 pasos sobre un modelo base de 4B, con hiperparámetros y ejecución de origen documentados.
- Evaluación comparativa de seguridad multimodal: al conservar la torre de visión, permite medir cómo cambia la respuesta del modelo ante entradas que combinan imagen y texto tras el ajuste de seguridad.
- Destilación de trayectorias docentes: útil para analizar la transferencia de razonamiento desde profesores a un estudiante de 4B usando los conjuntos STAR-1 y STAR-Benign como referencia.
- Baseline en pipelines de red teaming: puede integrarse como modelo de referencia en baterías de pruebas que comparan respuestas antes y después del ajuste de seguridad.
- Prototipado de asistentes conversacionales con entrada visual: el pipeline image-text-to-text permite experimentar con descripción de imágenes y diálogo multi-turno en entornos de laboratorio.
- Reproducción de experimentos de SFT: la verificación de conversión de tensores y la coincidencia de las 738 claves facilitan la validación de pipelines de entrenamiento y exportación propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se afirman puntuaciones de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 4,66B parámetros en FP16 requiere aproximadamente 9,3 GB solo para pesos, a los que hay que sumar caché KV, activaciones y los tensores de visión; en cuantización de 8 bits bajaría a unos 4,7 GB y en 4 bits a unos 2,4 GB, aunque el repositorio no incluye pesos cuantizados.
- GPU recomendadas: no disponible en la información proporcionada. Por tamano, cabría esperar ejecución en GPUs de 24 GB o más en FP16, pero no se confirma.
- Cabe en GPU de consumo: no confirmado; el repo de 9,3 GB en safetensors sugiere que en FP16 no cabe en GPUs de 8-12 GB sin cuantizar.
- Opciones de despliegue: transformers (librería declarada) y endpoints de Hugging Face (`endpoints_compatible`). vLLM, llama.cpp, Ollama o TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-SFT-STAR (este) | 4.659.865.088 | no disponible | apache-2.0 | SFT de seguridad sobre Qwen3.5-4B, multimodal, sin benchmarks publicados |
| Qwen/Qwen3.5-4B | no disponible en esta ficha | no disponible | no disponible en esta ficha | Modelo base del que deriva; el ajuste parte de su revisión fijada |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | No se dispone de datos de otros modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- No se han publicado evaluaciones de seguridad ni de capacidad; no hay evidencia cuantitativa de que el ajuste reduzca respuestas dañinas.
- El ajuste solo cubre tensores de texto: la torre de visión y el módulo MTP no se entrenaron, por lo que el comportamiento multimodal de seguridad puede no haberse modificado.
- Riesgo de alucinación inherente al modelo base, no cuantificado en esta ficha.
- Sesgos conocidos: no disponible en la información proporcionada.
- Idiomas soportados y limitaciones de contexto: no disponible en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni evaluaciones que respalden un despliegue en producción.
- El repositorio excluye optimizador, estado RNG, logs de entrenamiento y ejemplos de entrenamiento, lo que limita la auditoría completa del proceso.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni reportes de uso.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-SFT-STAR-lr1e-5-E2-step120
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset STAR-1: https://huggingface.co/datasets/UCSC-VLAA/STAR-1
- Dataset STAR-benign-915: https://huggingface.co/datasets/UCSC-VLAA/STAR-benign-915
