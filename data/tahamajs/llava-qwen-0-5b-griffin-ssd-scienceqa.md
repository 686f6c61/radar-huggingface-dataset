# tahamajs/llava-qwen-0.5b-griffin-ssd-scienceqa

## Resumen

`llava-qwen-0.5b-griffin-ssd-scienceqa` es un checkpoint multimodal de tipo vision-language derivado de `llava-hf/llava-interleave-qwen-0.5b-hf` mediante técnicas de cirugía de atención y destilación de conocimiento, publicado por el autor tahamajs dentro del proyecto NeuralOps. El modelo sustituye la atención cuadrática de 18 de las 24 capas del decoder Qwen2 por bloques híbridos Griffin (`GriffinSSDBlock`), que combinan ventana de atención local con atención lineal SSD (State Space Duality), manteniendo seis capas ancla con atención cuadrática.

El objetivo del checkpoint no es tanto ofrecer un modelo de producción como demostrar la viabilidad de la sustitución modular de operadores de atención en un VLM pequeño (0,5B parámetros) y cuantificar el impacto en una tarea concreta de razonamiento visual STEM: el subconjunto con imagen de ScienceQA. El resultado es un artefacto de pesos quirúrgicos de solo 184,63 MB (frente a los 1,66 GB del base en FP16, un 89,1 % menos), entrenado en una única RTX 3090 en 120,1 segundos y 166 pasos.

El modelo está pensado para investigación en eficiencia de atención y arquitecturas híbridas SSM/Transformer, no para uso general. Su licencia MIT y su reducido tamaño lo hacen fácilmente reproducible, pero su rendimiento absoluto (43,75 % de accuracy en ScienceQA) queda muy por debajo del profesor original (63,75 %).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (SigLIP vision tower + proyector MLP de 2 capas + decoder Qwen2 de 24 capas) con cirugía de atención híbrida Griffin SSD en 18/24 capas |
| Parametros totales | 0,5B (heredados del base `llava-interleave-qwen-0.5b-hf`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en FP16 safetensors) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, delta quirúrgico FP16) + JSON de manifiesto, config y tokenizer |
| Dimension del decoder | D=1024, H=16 cabezas, head_dim=64 |
| Capas modificadas | 18/24 (esquema `hybrid_3_1`); capas ancla cuadráticas: [3, 7, 11, 15, 19, 23] |
| Componentes congelados | SigLIP vision tower (27 capas), proyector multimodal, MLPs y embeddings del decoder |
| Tamano en disco de pesos | 184,63 MB (193.602.816 bytes); paquete total 199,83 MB |
| Libreria | `neuralops` |

## Arquitectura y entrenamiento

El modelo parte de LLaVA-Interleave-Qwen-0.5B, que combina una torre visual SigLIP congelada de 27 capas, un proyector MLP de dos capas y un decoder Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas de atención y dimensión de cabeza 64. Sobre esta base, NeuralOps aplica una "cirugía" que reemplaza el módulo `self_attn` en 18 de las 24 capas por `GriffinSSDBlock`, un bloque híbrido que mezcla atención local de ventana con atención lineal SSD (State Space Duality). Las seis capas restantes ([3, 7, 11, 15, 19, 23]) conservan atención cuadrática como anclas, siguiendo un patrón de intercalado 3:1 (`hybrid_3_1`).

El entrenamiento se realizó en dos etapas de destilación de conocimiento desde el modelo profesor original, con un total de 166 pasos (58 en la etapa 1, 108 en la etapa 2) sobre una única NVIDIA RTX 3090 de 24 GB, con un pico de VRAM de 20.197 MB y una duración de 120,1 segundos. Solo se entrenaron los módulos de atención sustituidos y los layernorms del decoder; la torre visual, el proyector, los MLPs y los embeddings permanecieron congelados. El dataset de evaluación y entrenamiento es el subconjunto con imagen de ScienceQA (`derek-thomas/ScienceQA`), orientado a razonamiento visual STEM.

La innovación principal es la sustitución modular de operadores de atención preservando el resto de la red, lo que reduce el artefacto de pesos de 1,66 GB a 184,63 MB (9,21 veces más pequeño) a costa de una pérdida sustancial de precisión respecto al profesor.

## Capacidades

- Generación de texto condicionada a imagen (image-text-to-text) en formato conversacional.
- Respuesta a preguntas visuales de tipo STEM (ciencia, matemáticas básicas) con selección de opción entre alternativas.
- Razonamiento visual de un solo turno sobre figuras y diagramas del dominio ScienceQA.
- Formato de chat mediante `chat_template.json` con tokens especiales de imagen (`<image>`).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés.
- No se documentan modos especiales como thinking mode, audio o vídeo.

## Casos de uso

- Investigación en atención lineal y SSM: el checkpoint sirve como referencia reproducible para estudiar cómo afecta la sustitución de atención cuadrática por Griffin SSD en un VLM pequeño, con telemetría de entrenamiento y métricas comparativas incluidas.
- Reproducción de experimentos de cirugía de atención: el manifiesto quirúrgico (`surgical_manifest.json`) y la configuración permiten replicar exactamente qué capas se modificaron y con qué patrón `hybrid_3_1`.
- Docencia y formación: su tamaño reducido (199,83 MB de paquete) y su entrenamiento en una sola RTX 3090 en 120 segundos lo hacen adecuado para demostraciones prácticas de destilación de conocimiento en entornos académicos.
- Evaluación comparativa de operadores de atención: permite medir accuracy y perplejidad en ScienceQA frente al profesor y frente a otras variantes del zoo de NeuralOps.
- Prototipado rápido de pipelines VLM: la API `load_surgeried_model` de NeuralOps permite cargar el modelo y ejecutar inferencia de VQA con pocas líneas de código para validar flujos de imagen-texto.
- Estudio de compresión de artefactos: útil para analizar el compromiso entre reducción de tamaño (89,1 % menos) y degradación de accuracy (20 puntos porcentuales frente al profesor) en despliegues con restricciones de almacenamiento.
- Base para fine-tuning específico: al ser un delta quirúrgico con licencia MIT, puede servir como punto de partida para adaptaciones a otros dominios STEM con presupuesto de cómputo limitado.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre ScienceQA, subconjunto con imagen, split de validación:

| Metrica | Profesor (base) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 43,12 | 43,75 | +0,63 |
| Perplejidad | 2,45 | 7,33 | 2,99 | -4,34 |

Telemetría de entrenamiento declarada: 166 pasos totales (58 etapa 1, 108 etapa 2), 120,1 segundos, pico de VRAM 20.197 MB en RTX 3090, marca temporal 2026-11-11T07:03:42Z.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el entrenamiento consumió 20.197 MB en una RTX 3090, pero la inferencia del modelo de 0,5B en FP16 debería caber holgadamente en GPUs consumer de 8 GB o menos (estimación no confirmada por el autor).
- GPU recomendadas: RTX 3090 (usada en el entrenamiento); cualquier GPU con al menos 8 GB de VRAM es probablemente suficiente para inferencia en FP16, aunque no hay datos oficiales.
- Cabe en GPU consumer: sí, con alta probabilidad, dado el tamaño de 0,5B y el artefacto de 184,63 MB, aunque no se documenta una prueba explícita de inferencia en GPUs de gama baja.
- Opciones de despliegue: la librería `neuralops` mediante `load_surgeried_model`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (accuracy) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/llava-qwen-0.5b-griffin-ssd-scienceqa` | 0,5B | no disponible | 43,75 % (declarado, no verificado) | MIT | Hugging Face |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | 0,5B | no disponible | 63,75 % (declarado por el autor) | no disponible en la informacion | Hugging Face |
| Otras variantes del zoo NeuralOps | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos externos comparables en la información proporcionada.

## Limitaciones y advertencias

- Degradación significativa frente al profesor: 43,75 % frente a 63,75 % de accuracy en ScienceQA, una pérdida de 20 puntos porcentuales.
- El resultado de accuracy está declarado por el autor y marcado como no verificado (`verified: false`) en la model-index.
- Entrenamiento muy corto (166 pasos, 120 segundos) sobre un único dataset y una única GPU, lo que limita la generalización.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- Dominio restringido a razonamiento visual STEM tipo ScienceQA; no se documenta rendimiento en otras tareas visuales.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso.
- Riesgo de alucinación no cuantificado; al ser un modelo pequeño y con destilación agresiva, es esperable una fiabilidad baja fuera del dominio de entrenamiento.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- La licencia MIT permite uso comercial, pero el modelo base del que deriva puede tener condiciones adicionales no especificadas en la información disponible; conviene verificar la licencia de `llava-hf/llava-interleave-qwen-0.5b-hf` antes de un uso comercial.
- La dependencia de la librería `neuralops` (no estándar) puede complicar el despliegue en infraestructuras convencionales.
- No apto para producción sin validación adicional: el propio autor lo presenta como un artefacto de investigación del "Attention Surgery Zoo".

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-griffin-ssd-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador Griffin SSD: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/ssm/griffin_ssd.py
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
