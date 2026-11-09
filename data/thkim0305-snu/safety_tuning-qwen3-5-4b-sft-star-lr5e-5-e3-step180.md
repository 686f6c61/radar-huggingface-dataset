# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-SFT-STAR-lr5e-5-E3-step180

## Resumen

Safety_Tuning-Qwen3.5-4B-SFT-STAR-lr5e-5-E3-step180 es un checkpoint de ajuste fino supervisado (SFT) orientado a seguridad, derivado del modelo multimodal Qwen/Qwen3.5-4B. Lo publica el usuario thkim0305-SNU y se distribuye con licencia Apache 2.0. El modelo conserva la arquitectura y los pesos de visión del modelo base, mientras que los tensores de texto se han reentrenado sobre trayectorias de profesor con razonamiento explícito, de modo que la tarea de ajuste no es solo alinear respuestas seguras, sino enseñar al modelo a razonar antes de responder en escenarios sensibles.

El checkpoint se ha entrenado con 7.655 trayectorias completas de profesor procedentes de los conjuntos STAR-1 y STAR-benign-915, supervisando razonamiento, respuesta y token EOS. Se trata de un artefacto de investigación: el autor no declara puntuaciones de evaluación y el número de descargas y likes es cero en el momento de la consulta, lo que indica que es un experimento reproducible más que un modelo listo para producción.

Su relevancia actual radica en que aborda el safety tuning de modelos multimodales pequeños (4,66 mil millones de parámetros) con datos de trayectoria razonada, un enfoque poco frecuente en modelos de este tamaño y que permite desplegarlo en hardware de gama alta de consumo. Al estar basado en Qwen3.5-4B, hereda la pipeline image-text-to-text y el soporte de tool calling del modelo original, aunque este checkpoint concreto no documenta evaluaciones propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de Qwen3.5-4B; incluye torre de visión y cabezas MTP no entrenadas |
| Parametros totales | 4.659.865.088 (4,66 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

Datos adicionales del repositorio: tamaño de 9,3 GB, revisión base `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`, iteración nativa del checkpoint `179` (base cero), ejecución de origen `qwen35-star-slime-sft-4ep-b128-pro6000-gpu01-20261106-v4`.

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer multimodal que procesa entradas de imagen y texto. El ajuste fino se aplica únicamente sobre los tensores de texto: los pesos de visión y los tensores MTP (multi-token prediction) se conservan del modelo base fijado y no se entrenaron. El autor verifica la conversión mediante conversión inversa exacta de cada tensor nativo de texto, comprobación de pesos finitos y coincidencia de las 738 claves y formas de tensores de Hugging Face, lo que aporta garantías sobre la integridad del export.

El entrenamiento es un SFT con los siguientes hiperparámetros declarados: learning rate 5e-5, 180 actualizaciones de optimizador completadas, época 3 de 4 y batch global de 128. Los datos son 7.655 trayectorias completas de profesor provenientes de STAR-1 y STAR-benign-915, con supervisión sobre razonamiento, respuesta y EOS. Cada ejecución de learning rate parte de forma independiente del modelo base original y no se añade la especificación del profesor al contexto del estudiante. El repositorio excluye optimizador, estado RNG, logs de entrenamiento y ejemplos de entrenamiento; solo contiene pesos de inferencia, configuración y activos de tokenizer/procesador.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen3.5-4B.
- Entrada multimodal image-text-to-text: acepta imágenes junto con texto gracias a la torre de visión conservada del modelo base.
- Razonamiento explícito: el SFT supervisa cadenas de razonamiento antes de la respuesta final, por lo que el modelo tiende a producir trazas de pensamiento en escenarios sensibles.
- Comportamiento orientado a seguridad: entrenado sobre trayectorias de profesor de STAR-1 y STAR-benign-915 para responder de forma segura ante peticiones dañinas o ambiguas.
- Soporte de tool calling / function calling: no documentado en esta model card; debe verificarse contra el modelo base.
- Capacidades de agente y razonamiento multi-paso: no documentadas específicamente para este checkpoint.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Investigación en safety tuning multimodal: el checkpoint sirve como punto de comparación reproducible para estudiar cómo el SFT con trayectorias razonadas afecta a la tasa de respuestas inseguras en modelos de 4 B de parámetros, partiendo siempre del modelo base original.
- Filtrado y moderación de contenido en pipelines de datos: el modelo puede clasificar y reformular peticiones potencialmente dañinas en flujos de preprocesado, aprovechando su entrenamiento sobre STAR-benign-915 para distinguir peticiones benignas de intentos de jailbreak.
- Evaluación de robustez de asistentes multimodales: al aceptar imagen y texto, permite construir conjuntos de prueba con instrucciones visuales adversarias y medir la degradación del comportamiento seguro.
- Generación de respuestas seguras en asistentes de dominio acotado: para prototipos internos donde se requiere que el modelo explique por qué rechaza una petición, la supervisión de razonamiento produce justificaciones trazables.
- Baseline para experimentos de destilación: al estar entrenado con trayectorias de profesor y publicarse los hiperparámetros exactos, es útil como referencia para comparar variantes de learning rate, épocas o composición de datos.
- Despliegue en hardware de consumo para pruebas: con 4,66 B de parámetros y 9,3 GB en safetensors, cabe en GPUs de 24 GB en precisión completa o en configuraciones cuantizadas de 8 bits para experimentación local.
- Análisis de sesgos en modelos pequeños multimodales: permite estudiar cómo el ajuste de seguridad afecta a la distribución de respuestas en distintos grupos demográficos o tipos de prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se afirman puntuaciones de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16/bf16, los 4,66 B de parámetros ocupan aproximadamente 9,3 GB, más overhead de activaciones y caché KV; se recomienda al menos 12-16 GB de VRAM.
- En cuantización de 8 bits, la huella de pesos baja a unos 4,7 GB; en 4 bits, a unos 2,4 GB, aunque estas cuantizaciones no están publicadas oficialmente y requerirían conversión propia.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue con throughput alto; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en fp16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) con cuantización, y potencialmente en GPUs de 12 GB con cuantización de 4 bits.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI para serving; llama.cpp/Ollama requerirían conversión a GGUF, no publicada.
- Latencia y throughput estimados: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-SFT-STAR | 4,66 B | no disponible | imagen-texto | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-4B (base) | 4 B aprox. | no disponible | imagen-texto | Apache 2.0 | Hugging Face |
| Otros checkpoints de safety tuning sobre Qwen | no disponible | no disponible | texto o multimodal | variable | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado evaluaciones de seguridad ni de capacidades: el autor declara explícitamente que la model card no afirma puntuaciones, por lo que no hay evidencia cuantitativa de que el ajuste reduzca respuestas dañinas.
- Riesgo de alucinación: inherente a los modelos de 4 B de parámetros y no cuantificado para este checkpoint.
- Sesgos conocidos: no documentados; el modelo hereda los sesgos del base Qwen3.5-4B y de los conjuntos STAR-1 y STAR-benign-915, cuya composición no se detalla.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están disponibles, lo que impide garantizar su comportamiento fuera del inglés o en contextos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al ser un derivado de Qwen3.5-4B conviene revisar también la licencia y los términos del modelo base.
- Caveat para producción: es un artefacto de investigación con 0 descargas y sin mantenimiento documentado; no se recomienda su uso en producción sin una evaluación propia de seguridad y calidad.
- Los tensores MTP y de visión no se entrenaron, por lo que el ajuste de seguridad no cubre el comportamiento multimodal más allá de lo heredado del base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-SFT-STAR-lr5e-5-E3-step180
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset STAR-1: https://huggingface.co/datasets/UCSC-VLAA/STAR-1
- Dataset STAR-benign-915: https://huggingface.co/datasets/UCSC-VLAA/STAR-benign-915
