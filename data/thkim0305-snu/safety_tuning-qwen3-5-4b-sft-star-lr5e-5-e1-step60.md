# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-SFT-STAR-lr5e-5-E1-step60

## Resumen

Safety_Tuning-Qwen3.5-4B-SFT-STAR-lr5e-5-E1-step60 es un checkpoint de ajuste fino supervisado (SFT) orientado a la seguridad del modelo multimodal Qwen/Qwen3.5-4B, desarrollado por el usuario thkim0305-SNU. El modelo parte del Qwen3.5-4B original y se ha entrenado sobre trayectorias de profesor del dataset STAR (UCSC-VLAA/STAR-1 y STAR-Benign), un corpus de seguridad para modelos de visión-lenguaje. El resultado es un modelo image-text-to-text que conserva la arquitectura y los pesos de visión del base, con los tensores de texto reentrenados durante 60 pasos de optimizador (una época de un plan de cuatro).

El interés de esta ficha es acotado: se trata de un experimento de investigación con 16 descargas y sin métricas de evaluación publicadas por el autor. No es un modelo listo para producción ni un lanzamiento oficial de Qwen; es un artefacto reproducible de un pipeline de safety tuning cuyo valor está en la metodología (SFT sobre trayectorias completas de razonamiento, respuesta y EOS) y en la verificación de conversión de pesos.

Con 4.659.865.088 parámetros reales en safetensors y un repositorio de 9,3 GB, el modelo está en la franja de los 4B densos, lo que lo hace desplegable en GPUs de consumo con cuantización. La licencia Apache 2.0 facilita su reutilización, pero la ausencia de idiomas declarados y de benchmarks obliga a evaluarlo empíricamente antes de cualquier uso real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de Qwen3.5-4B; no se detalla en la model card |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen3.5-4B, un transformer multimodal que procesa imagen y texto. La model card indica que todos los tensores de texto entrenados se exportan desde el checkpoint nativo y que los tensores de visión y los tensores MTP (multi-token prediction) no entrenados se conservan del modelo base fijado en la revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`. El MTP no fue entrenado. La conversión incluye verificación de conversión inversa exacta de cada tensor de texto nativo, comprobaciones de pesos finitos y coincidencia de las 738 claves y formas de tensores de Hugging Face.

El entrenamiento es SFT con un learning rate de 5e-5, 60 actualizaciones de optimizador completadas, una época de cuatro y batch global de 128. Se usan 7.655 trayectorias completas de profesor de STAR-1 y STAR-Benign, supervisando razonamiento, respuesta y EOS. Cada ejecución de learning rate parte de forma independiente del modelo base original y no se añade ningún "teacher Spec" al contexto del estudiante. La run de origen es `qwen35-star-slime-sft-4ep-b128-pro6000-gpu01-20261106-v4` y la iteración nativa del checkpoint es la 59 (indexada desde cero). No se documentan RLHF, DPO ni técnicas de decodificación especulativa.

## Capacidades

- Generación de texto y razonamiento multimodal: el pipeline es image-text-to-text, por lo que acepta entradas de imagen y texto y produce respuestas textuales.
- Razonamiento supervisado: el entrenamiento incluye trayectorias con razonamiento explícito, respuesta y token EOS, lo que orienta al modelo a producir cadenas de razonamiento antes de la respuesta final.
- Alineación de seguridad: el corpus STAR-1/STAR-Benign está diseñado para safety tuning, de modo que el modelo se ha expuesto a pares de comportamiento seguro y benigno.
- Conversacional: la model card etiqueta el modelo como conversacional (tag `conversational`).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible de forma explícita; el razonamiento supervisado sugiere cierta capacidad, pero no se documenta.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (thinking mode, audio): no disponible.

## Casos de uso

- Investigación en safety tuning multimodal: el checkpoint sirve como punto de comparación reproducible para estudiar cómo el SFT sobre trayectorias STAR afecta al comportamiento seguro de un VLM de 4B, partiendo siempre del mismo base y con hiperparámetros documentados.
- Evaluación de robustez ante entradas imagen-texto: al conservar los pesos de visión del base y reentrenar solo texto, permite aislar el efecto del ajuste de texto en tareas de seguridad visual, útil en laboratorios que analizan jailbreaks multimodales.
- Generación de datos sintéticos de seguridad: el modelo puede emplearse para producir trayectorias de razonamiento y respuestas etiquetadas que alimenten pipelines de anotación o destilación, dado que fue entrenado con ese formato de trayectorias completas.
- Prototipado de asistentes conversacionales con imagen: en entornos de investigación y con cuantización, puede desplegarse para probar flujos de pregunta-respuesta sobre imágenes en los que la moderación de contenido sea un requisito.
- Reproducción de experimentos de SFT: la run de origen, la revisión del base y la iteración del checkpoint están documentadas, lo que facilita replicar el entrenamiento y comparar curvas de aprendizaje en distintos learning rates.
- Base para posteriores etapas de alineación: al ser un checkpoint intermedio (época 1 de 4, 60 pasos), es un punto de partida razonable para continuar con DPO, RLHF o evaluaciones de red-teaming antes de decidir si se usa como modelo final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente que no afirma ninguna puntuación de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y del procesador de visión; en la práctica se recomienda reservar 12-16 GB.
- Cuantización a 8 bits: alrededor de 4,7 GB de pesos; a 4 bits, alrededor de 2,4 GB, aunque no se publican variantes GGUF oficiales y habría que generarlas.
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y evaluación a gran escala; RTX 4090 (24 GB) para inferencia en precisión completa con margen; RTX 3090 (24 GB) también viable.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en bf16; en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4070) requeriría cuantización.
- Opciones de despliegue: transformers es la librería declarada y el tag `endpoints_compatible` sugiere compatibilidad con Inference Endpoints; vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-SFT-STAR (este) | 4,66B | no disponible | Apache 2.0 | SFT de seguridad multimodal sobre STAR | Hugging Face, 16 descargas |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible | no disponible en la información | VLM generalista | Hugging Face |
| Alternativas de safety tuning multimodal de ~4B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks: el autor no afirma ninguna puntuación, por lo que no hay evidencia publicada de mejora en seguridad ni de regresión en capacidades generales.
- Checkpoint intermedio: solo 60 pasos de optimizador y época 1 de 4; no es el resultado final del plan de entrenamiento y puede estar infraajustado.
- Sesgos conocidos: no documentados; al derivar de Qwen3.5-4B hereda los sesgos del base, que tampoco se detallan.
- Riesgo de alucinación: no cuantificado; el formato de trayectorias con razonamiento puede aumentar la verbosidad y la confianza en respuestas incorrectas si no se valida.
- Idiomas: no se declaran idiomas soportados, lo que impide garantizar calidad fuera del inglés o del chino sin evaluación previa.
- Contexto: la longitud de contexto no está disponible, lo que dificulta planificar cargas con documentos o conversaciones largas.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B puede tener sus propias condiciones que conviene revisar antes de redistribuir.
- Producción: con 16 descargas, sin likes y sin evaluación, no debe desplegarse en entornos productivos sin una batería propia de pruebas de seguridad y calidad.
- Componentes no entrenados: los tensores de visión y MTP se conservan del base, de modo que cualquier mejora de seguridad se limita a la parte de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-SFT-STAR-lr5e-5-E1-step60
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset STAR-1: https://huggingface.co/datasets/UCSC-VLAA/STAR-1
- Dataset STAR-Benign: https://huggingface.co/datasets/UCSC-VLAA/STAR-benign-915
