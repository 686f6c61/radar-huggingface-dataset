# tahamajs/llava-qwen-0.5b-galerkin-attention-scienceqa

## Resumen

llava-qwen-0.5b-galerkin-attention-scienceqa es un checkpoint experimental publicado por el usuario tahamajs dentro de su proyecto NeuralOps, un marco de trabajo centrado en la sustitucion quirurgica de mecanismos de atencion en modelos ya entrenados. El modelo parte de llava-hf/llava-interleave-qwen-0.5b-hf, un VLM multimodal de 0.5B parametros compuesto por una torre visual SigLIP congelada, un proyector MLP de dos capas y un decodificador Qwen2 de 24 capas (D=1024, 16 cabezas, head_dim=64), y sustituye la atencion cuadratica por una variante lineal denominada GalerkinAttention en 18 de sus 24 capas.

El objetivo no es tanto ofrecer un modelo de proposito general como demostrar una tecnica de "cirugia de atencion" combinada con destilacion de conocimiento: tras el reemplazo, el modelo sufre una caida severa de rendimiento (32.5% de accuracy en ScienceQA) que se recupera mediante un proceso de distillation en dos etapas hasta alcanzar el 62.5%, frente al 63.75% del profesor original. El resultado se empaqueta como un delta de pesos de solo 147.61 MB, un 91.3% mas pequeno que el checkpoint base en FP16.

Es relevante ahora porque ejemplifica una linea de investigacion activa: reducir el coste computacional de la atencion en VLMs sin reentrenar desde cero, conservando componentes congelados y publicando unicamente los pesos modificados. Su tamano reducido y su licencia MIT lo hacen facil de inspeccionar, aunque su alcance practico esta acotado a un dominio muy concreto (preguntas visuales de ciencia).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (SigLIP vision tower + MLP projector + decodificador Qwen2) con atencion lineal GalerkinAttention en 18/24 capas |
| Parametros totales | 0.5B (modelo base); delta guardado de 147.61 MB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 safetensors) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (attention_weights.safetensors, delta quirurgico) + JSON de manifiesto y configuracion |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura LLaVA interleaved: una torre visual SigLIP de 27 capas completamente congelada, un proyector MLP de dos capas que alinea las representaciones visuales con el espacio del decodificador, y un decodificador Qwen2 de 24 capas con dimension oculta 1024, 16 cabezas de atencion y head_dim de 64. La intervencion sustituye el mecanismo de self-attention en 18 de las 24 capas por GalerkinAttention, una proyeccion de tipo Petrov-Galerkin que aproxima la atencion cuadratica con coste lineal. Se conservan como anclas cuadraticas las capas [3, 7, 11, 15, 19, 23], siguiendo un esquema hibrido 3:1, y se mantienen intactos el proyector multimodal, los MLP y los embeddings.

El entrenamiento consistio en una destilacion de conocimiento en dos etapas (91 y 147 pasos de optimizacion, 238 en total) ejecutada en una unica RTX 3090 de 24 GB durante 120.5 segundos, con un pico de VRAM de 17.788 MB. Solo se entrenaron las atenciones modificadas y los layernorms del decodificador; el resto permanecio congelado. La evaluacion se realizo sobre el subconjunto con imagen de ScienceQA (split de validacion), donde el modelo paso de un 32.5% de accuracy en zero-shot tras la cirugia a un 62.5% tras la destilacion, con perplejidad de 2.10 frente a 2.45 del profesor.

## Capacidades

- Generacion de texto e imagen-a-texto (pipeline image-text-to-text) en ingles.
- Razonamiento visual sobre diagramas y figuras de tipo STEM, orientado a preguntas de opcion multiple.
- Respuesta a preguntas de ciencia (fisica, quimica, biologia) que requieren interpretar una imagen adjunta.
- Formato conversacional con plantilla de chat incluida (chat_template.json).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Modo thinking, vision adicional o audio: no disponible (solo vision de entrada).

## Casos de uso

- Investigacion en eficiencia de atencion: sirve como referencia reproducible para medir el impacto de sustituir atencion cuadratica por lineal en un VLM pequeno, comparando el delta de accuracy (62.5% frente a 63.75%) con el ahorro de pesos (91.3%).
- Prototipado de tutores educativos de ciencia: el modelo responde preguntas de opcion multiple sobre figuras STEM, adecuado para demos de bajo coste en entornos academicos con hardware modesto.
- Evaluacion de pipelines de destilacion: util para validar tecnicas de knowledge distillation en dos etapas sobre modelos con componentes congelados, midiendo recuperacion de accuracy y perplejidad.
- Despliegue en dispositivos con VRAM limitada: el delta de 147.61 MB permite cargar el checkpoint quirurgico sobre el modelo base en GPUs consumer, facilitando pruebas de inferencia multimodal sin infraestructura dedicada.
- Benchmarking de tecnicas de compresion: sirve como baseline para comparar otras variantes del zoo de atencion (linear, hybrid) sobre el mismo conjunto ScienceQA.
- Educacion e investigacion sobre VLMs: por su tamano (0.5B) y licencia MIT, es apropiado para cursos y laboratorios donde se estudia la anatomia interna de un modelo multimodal.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre ScienceQA, subconjunto con imagen, split de validacion:

| Metrica | Profesor (base) | Zero-shot tras cirugia | Final tras KD |
|---|---:|---:|---:|
| Accuracy (%) | 63.75 | 32.50 | 62.50 |
| Perplejidad | 2.45 | 5.12 | 2.10 |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0.5B en FP16 requiere aproximadamente 1.66 GB de pesos; con el delta quirurgico el artefacto serializado ocupa 147.61 MB, aunque la inferencia necesita cargar el modelo completo.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para FP16; el entrenamiento reportado se hizo en una RTX 3090 (24 GB) con pico de 17.788 MB.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: la model card solo documenta la API `neuralops.hub.load_surgeried_model`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el unico dato de telemetria es el tiempo de entrenamiento (120.5 s para 238 pasos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (val, con imagen) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-galerkin-attention-scienceqa | 0.5B | no disponible | 62.5% accuracy / 2.10 PPL | MIT | Hugging Face |
| llava-hf/llava-interleave-qwen-0.5b-hf (profesor) | 0.5B | no disponible | 63.75% accuracy / 2.45 PPL | no disponible en la informacion | Hugging Face |
| Otras variantes del zoo NeuralOps | no disponible | no disponible | no disponible | MIT (segun repo) | Hugging Face |

No se dispone de datos de benchmarks de alternativas externas en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo ha sido evaluado en un dominio estrecho (ScienceQA con imagen); su rendimiento en tareas generales de vision-lenguaje es desconocido.
- La accuracy final (62.5%) es inferior a la del profesor (63.75%), por lo que la cirugia no es gratuita en calidad.
- Solo soporta ingles; no hay evidencia de capacidades multilingues.
- Riesgo de alucinacion inherente a un modelo de 0.5B con entrenamiento limitado (238 pasos, 120.5 s).
- Los resultados de benchmarks estan marcados como no verificados (`verified: false`) en el model-index.
- Requiere la libreria `neuralops` y cargar el delta sobre el modelo base; no es un checkpoint autonomo en formato estandar de transformers.
- No se documentan sesgos especificos ni evaluaciones de seguridad.
- La licencia MIT permite uso comercial, pero el modelo base subyacente puede tener sus propias condiciones que conviene revisar.
- El checkpoint esta pensado como artefacto de investigacion; no se recomienda para produccion sin validacion adicional.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-galerkin-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion GalerkinAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/linear/galerkin_attention.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
