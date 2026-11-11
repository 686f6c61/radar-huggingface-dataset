# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-SFT-STAR-lr5e-5-E2-step120

## Resumen

Safety_Tuning-Qwen3.5-4B-SFT-STAR-lr5e-5-E2-step120 es un checkpoint de ajuste fino supervisado (SFT) orientado a seguridad, derivado del modelo base Qwen/Qwen3.5-4B. Lo publica el usuario thkim0305-SNU en Hugging Face bajo licencia Apache 2.0. El modelo conserva la modalidad image-text-to-text (procesa imagen y texto) y se distribuye en formato safetensors para su uso con la librería transformers.

El ajuste se realizó sobre 7.655 trayectorias completas de profesor extraídas de los conjuntos STAR-1 y STAR-benign-915, con supervisión sobre razonamiento, respuesta y token EOS. El checkpoint corresponde al paso 120 de optimizador (época 2 de 4), con learning rate 5e-5 y batch global de 128. Cada ejecución de learning rate parte de forma independiente del modelo base original, y no se inyecta especificación de profesor en el contexto del estudiante.

El interés de esta ficha es doble: por un lado, documenta una receta de safety-tuning reproducible sobre un modelo multimodal de ~4,66 mil millones de parámetros; por otro, advierte de que el autor no declara ninguna puntuación de evaluación, por lo que su eficacia real en tareas de seguridad no está validada en la model card. Es un artefacto de investigación más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.5; incluye torre de visión y cabezas MTP (no entrenadas) |
| Parametros totales | 4.659.865.088 (~4,66 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 9,3 GB, compatible con transformers y endpoints) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-4B base: un transformer multimodal con torre de visión para entrada image-text-to-text y cabezas MTP (multi-token prediction) presentes en el checkpoint original pero no entrenadas en este ajuste. Según la model card, todos los tensores de texto entrenados se exportaron desde el checkpoint nativo, mientras que los tensores de visión y los MTP no entrenados se conservan del modelo base fijado en la revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`.

El entrenamiento consistió en SFT con 7.655 trayectorias completas de profesor de STAR-1 y STAR-benign-915, supervisando razonamiento, respuesta y EOS. Hiperparámetros declarados: learning rate 5e-5, 120 actualizaciones de optimizador completadas, época 2 de 4, batch global 128. La ejecución de origen es `qwen35-star-slime-sft-4ep-b128-pro6000-gpu01-20261106-v4` y la iteración nativa del checkpoint es 119 (base cero). No se añadió especificación de profesor al contexto del estudiante. La conversión incluye verificación de conversión inversa exacta de cada tensor de texto nativo, comprobación de pesos finitos y coincidencia de las 738 claves y formas de tensores de Hugging Face. No se documenta RLHF ni DPO.

## Capacidades

- Generación de texto y razonamiento conversacional, heredados del modelo base Qwen3.5-4B.
- Procesamiento multimodal image-text-to-text: acepta imagen y texto como entrada.
- Razonamiento supervisado: el SFT entrena explícitamente las trazas de razonamiento del profesor, además de la respuesta final.
- Ajuste orientado a seguridad: entrenado sobre STAR-1 y STAR-benign-915, pensado para mejorar el comportamiento seguro ante entradas dañinas o benignas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita; el razonamiento supervisado sugiere cierta capacidad, pero no está documentada.
- Capacidades multilingües: no disponibles (los idiomas no se declaran).
- Capacidades especiales (thinking mode, audio): no disponibles.

## Casos de uso

- Investigación en safety-tuning: sirve como punto de comparación reproducible para estudiar cómo afecta el SFT con trayectorias de profesor de STAR-1/STAR-benign al comportamiento del Qwen3.5-4B base, dado que cada ejecución parte del modelo original.
- Evaluación de robustez multimodal: al conservar la torre de visión, permite probar respuestas ante entradas imagen-texto potencialmente dañinas en entornos controlados de laboratorio.
- Generación de datos sintéticos de seguridad: el modelo puede emplearse para producir respuestas y trazas de razonamiento que alimenten pipelines de anotación o destilación, siempre con revisión humana.
- Baseline en experimentos de alineación: su receta (lr 5e-5, batch 128, 2 épocas) y su checkpoint intermedio (paso 120) lo hacen útil como referencia frente a otros checkpoints de la misma ejecución.
- Prototipado de asistentes conversacionales con entrada de imagen: en entornos de desarrollo, puede integrarse con transformers para validar flujos image-text-to-text antes de pasar a un modelo validado en producción.
- Estudio de retención de capacidades tras SFT: permite medir cuánto del rendimiento original del base se preserva tras el ajuste, comparando ambos checkpoints con el mismo harness de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se afirman puntuaciones de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 9,3 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 12-16 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 5-6 GB de pesos, más overhead.
- VRAM estimada en cuantización de 4 bits: aproximadamente 3 GB de pesos, más overhead.
- GPU recomendadas: A100, H100 o L40S para inferencia en precisión completa con contexto largo; RTX 4090 (24 GB) o RTX 3090 (24 GB) para fp16 con margen.
- GPU de consumo: cabe en tarjetas de 16 GB o más en bf16; en 8-12 GB requeriría cuantización, que no se distribuye oficialmente y habría que generar.
- Opciones de despliegue: transformers (formato nativo), endpoints compatibles según los tags; vLLM, TGI, llama.cpp u Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-SFT-STAR (este) | ~4,66 B | no disponible | image-text-to-text | Apache 2.0 | Checkpoint SFT de seguridad, sin benchmarks publicados |
| Qwen/Qwen3.5-4B (base) | ~4,66 B | no disponible | image-text-to-text | no disponible en esta ficha | Modelo original del que deriva; referencia para medir el efecto del SFT |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados de modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- No hay puntuaciones de evaluación: la model card declara explícitamente que no se afirman resultados; no hay evidencia publicada de que el ajuste mejore la seguridad frente al base.
- Riesgo de alucinación: inherente a los modelos generativos; el SFT sobre trayectorias de profesor puede reforzar patrones de razonamiento del profesor, incluidos posibles errores.
- Sesgos: no documentados; los datos STAR-1 y STAR-benign-915 condicionan el comportamiento y pueden introducir sesgos de dominio o de anotación.
- Idiomas: no declarados; no se garantiza un rendimiento multilingüe equilibrado.
- Contexto: longitud no disponible; no debe asumirse una ventana larga sin verificarla en la configuración del modelo.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B puede tener condiciones adicionales que deben revisarse antes de desplegar.
- Checkpoint intermedio: corresponde a la época 2 de 4 y al paso 120; no es el resultado final de la ejecución completa.
- Uso en producción: al ser un artefacto de investigación con 12 descargas y sin validación externa, no se recomienda desplegarlo en entornos de producción sin una evaluación propia y supervisión humana.
- Los resultados de búsqueda web recibidos no contienen información técnica relevante sobre el modelo y no se han utilizado como fuente.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-SFT-STAR-lr5e-5-E2-step120
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset STAR-1: https://huggingface.co/datasets/UCSC-VLAA/STAR-1
- Dataset STAR-benign-915: https://huggingface.co/datasets/UCSC-VLAA/STAR-benign-915
- Papers, blogs, repos y demos adicionales: no disponibles en la información proporcionada.
