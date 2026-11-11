# tahamajs/llava-qwen-0.5b-spectraformer-attention-scienceqa

## Resumen

llava-qwen-0.5b-spectraformer-attention-scienceqa es un checkpoint experimental publicado por el usuario tahamajs dentro del proyecto NeuralOps, un "attention surgery zoo" que sustituye mecanismos de atencion cuadratica por variantes lineales en modelos existentes. En este caso, el punto de partida es llava-hf/llava-interleave-qwen-0.5b-hf, un modelo vision-lenguaje LLaVA que combina una torre visual SigLIP congelada con un decodificador Qwen2 de 24 capas y aproximadamente 0,5 mil millones de parametros. Sobre esa base se ha reemplazado la atencion de 18 de las 24 capas por SpectraformerAttention, una atencion lineal basada en kernelizacion con caracteristicas aleatorias.

El modelo resultante se ha afinado mediante destilacion de conocimiento sobre el subconjunto de ScienceQA que incluye imagenes (split de validacion), con el objetivo de medir cuanto rendimiento se conserva al reducir el coste computacional de la atencion. No es un modelo pensado para produccion generalista, sino un artefacto de investigacion reproducible que documenta el impacto de la cirugia de atencion y la destilacion posterior.

Su relevancia actual es metodologica: demuestra un flujo completo de modificacion arquitectonica, guardado de pesos delta (solo 259,26 MB frente a 1,66 GB del base en FP16) y evaluacion empirica sobre una tarea STEM multimodal. La licencia MIT y el formato modular de pesos facilitan su reutilizacion en experimentos de eficiencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (torre visual SigLIP congelada de 27 capas + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas, D=1024, H=16, head_dim=64) con atencion lineal SpectraformerAttention en 18/24 capas |
| Parametros totales | Aproximadamente 0,5 mil millones (modelo base llava-interleave-qwen-0.5b-hf) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en FP16 safetensors) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (attention_weights.safetensors, FP16, solo pesos delta de atencion y layernorms) |

## Arquitectura y entrenamiento

El modelo parte de LLaVA-Qwen-0.5B: una torre visual SigLIP congelada, un proyector multi-modal de dos capas y un decodificador transformer Qwen2 de 24 capas con dimension oculta 1024, 16 cabezas y head_dim 64. La intervencion quirurgica sustituye el self-attention de 18 de las 24 capas por SpectraformerAttention, una variante de atencion lineal que aproxima el kernel softmax mediante caracteristicas aleatorias (random feature kernelization), manteniendo seis capas ancla cuadraticas en los indices [3, 7, 11, 15, 19, 23] bajo una estrategia hibrida 3:1. Se conservan intactos la torre visual, el proyector, los MLP y los embeddings del decodificador; solo se entrenan las atenciones modificadas y los layernorms del decodificador.

El entrenamiento consiste en destilacion de conocimiento desde el modelo profesor (el LLaVA-Qwen-0.5B original) sobre el subconjunto con imagenes de ScienceQA. Se ejecutaron 295 pasos de optimizacion en dos etapas (129 y 166 pasos) durante 120,2 segundos en una NVIDIA RTX 3090 de 24 GB, con un pico de VRAM de 15.668 MB. El artefacto final guarda 516 tensores en attention_weights.safetensors, con un manifiesto surgical_manifest.json (schema neuralops.surgery/v2) que describe la topologia de la cirugia.

## Capacidades

- Generacion de texto e imagen-a-texto (pipeline image-text-to-text): responde preguntas sobre imagenes en formato conversacional.
- Razonamiento visual basico sobre figuras STEM, orientado a preguntas de opcion multiple del estilo ScienceQA.
- Respuesta a preguntas de ciencia a nivel escolar y universitario basico cuando se combinan imagen y texto.
- Soporte de plantilla de chat (chat_template.json incluido) para conversaciones multi-turno.
- Capacidad multilingue limitada al ingles.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento extendido (thinking mode).
- No se documentan capacidades de audio ni de video.

## Casos de uso

- Investigacion sobre atencion lineal: el checkpoint sirve para reproducir el experimento de sustitucion de atencion cuadratica por SpectraformerAttention y medir la perdida de precision frente al profesor (63,75 % frente a 38,12 % en ScienceQA).
- Docencia y divulgacion de tecnicas de cirugia de atencion: el manifiesto y los pesos delta permiten explicar paso a paso como se modifica un transformer multimodal sin reentrenar la torre visual.
- Prototipado rapido de asistentes de preguntas y respuestas sobre figuras cientificas en entornos de bajo recursos, gracias a los 259,26 MB de pesos delta y a la atencion lineal.
- Experimentos de destilacion de conocimiento: la telemetria incluida (295 pasos, 120,2 s, 15.668 MB de VRAM pico) sirve de referencia para comparar recetas de KD en modelos pequenos.
- Benchmarking de eficiencia en RTX 3090: util como linea base para medir latencia y memoria de una atencion lineal frente a la cuadratica en un VLM de 0,5 B.
- Evaluacion comparativa de robustez multimodal: permite estudiar como afecta la perdida de atencion cuadratica a preguntas que requieren razonamiento visual fino en ScienceQA.
- Integracion en pipelines de investigacion con la API neuralops.hub.load_surgeried_model para cargar pesos quirurgicos de forma modular.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Profesor (base) | Zero-shot pre-KD | Final post-KD | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) en ScienceQA (subconjunto con imagenes, validation) | 63,75 | 42,50 | 38,12 | -4,38 |
| Perplexity en ScienceQA (subconjunto con imagenes, validation) | 2,45 | 200,85 | 3,63 | -197,22 |

Telemetria de entrenamiento: 295 pasos (etapa 1: 129; etapa 2: 166), 120,2 segundos, pico de VRAM 15.668 MB en RTX 3090.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el autor reporta 15.668 MB de pico durante el entrenamiento en una RTX 3090, por lo que la inferencia en FP16 deberia caber holgadamente en GPUs de 16 GB o mas, aunque no se publica una cifra medida.
- GPU recomendadas: NVIDIA RTX 3090 (usada en el entrenamiento), A100, H100 para mayor throughput; tarjetas consumer de 16-24 GB como RTX 4080/4090 son suficientes por tamano del modelo.
- Cabe en GPU consumer: si, previsiblemente en RTX 3090, RTX 4080, RTX 4090 y GPUs con 16 GB o mas en FP16; en cuantizaciones menores no se documenta soporte.
- Opciones de despliegue: la carga oficial se realiza con neuralops.hub.load_surgeried_model; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, dado que los pesos son delta de atencion y requieren el modelo base y la libreria neuralops.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy ScienceQA (img, val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-spectraformer-attention-scienceqa | ~0,5 B | no disponible | 38,12 % | MIT | Hugging Face (neuralops) |
| llava-hf/llava-interleave-qwen-0.5b-hf (profesor) | ~0,5 B | no disponible | 63,75 % | no disponible en la informacion | Hugging Face |
| Otras variantes del attention zoo NeuralOps | no disponible | no disponible | no disponible | MIT (segun el repo) | Hugging Face |

La comparativa se limita al modelo base, ya que no se han proporcionado datos de otros modelos de la misma categoria.

## Limitaciones y advertencias

- Precision muy inferior al profesor: 38,12 % frente a 63,75 % en ScienceQA, una caida de 25,63 puntos porcentuales; el modelo no es adecuado para tareas que exijan exactitud.
- La destilacion empeora la accuracy respecto al estado zero-shot pre-KD (42,50 % a 38,12 %), aunque mejora drasticamente la perplejidad (200,85 a 3,63).
- Solo soporta ingles; no se documenta multilinguismo.
- Entrenado exclusivamente sobre ScienceQA (subconjunto con imagenes), por lo que el dominio esta muy acotado y el riesgo de alucinacion fuera de el es alto.
- Pesos distribuidos como delta de atencion: requieren el modelo base llava-hf/llava-interleave-qwen-0.5b-hf y la libreria neuralops para cargarse; no son un checkpoint autonomo.
- No se documenta longitud de contexto ni soporte de tool calling, agentes o modos de razonamiento extendido.
- Los benchmarks son declarados por el autor y no estan verificados de forma independiente (verified: false).
- Uso comercial permitido por la licencia MIT, pero la calidad del modelo en dominios generales no esta validada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-spectraformer-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion de SpectraformerAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/linear/spectraformer_attention.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
