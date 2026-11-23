# unamed12/reasoning-pdpo_sftcs1.2k__plus__mc_cbase_lr3e-7_beta0.03_hf

## Resumen

`unamed12/reasoning-pdpo_sftcs1.2k__plus__mc_cbase_lr3e-7_beta0.03_hf` es un ajuste fino (fine-tune) completo del modelo Qwen3-1.7B, desarrollado por el usuario unamed12 y publicado en Hugging Face. Se trata de un experimento de entrenamiento orientado al razonamiento, cuyo nombre codifica la receta empleada: una fase de SFT sobre 1,2k muestras combinada con un proceso de preferencia tipo P-DPO con beta 0,03 y una tasa de aprendizaje de 3e-7. El modelo conserva la arquitectura y el tamano del Qwen3-1.7B original, con 1.720.574.976 parametros.

El modelo se distribuye en formato safetensors y es compatible con `transformers` y `text-generation-inference`, lo que permite desplegarlo en infraestructuras estandar. Hereda la ventana de contexto y las capacidades del Qwen3-1.7B base, un transformer denso de la familia Qwen3 disenado para generacion de texto conversacional y razonamiento.

Su relevancia es limitada y experimental: no tiene descargas ni likes, el acceso esta restringido (gated) y la model card no aporta resultados de evaluacion. Resulta interesante como referencia para quienes investigan recetas de alineacion (SFT + DPO) sobre modelos pequenos de razonamiento, pero no constituye una opcion recomendada para produccion sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del Qwen3-1.7B base) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; al ser safetensors, admite cuantizacion posterior a GGUF/AWQ/GPTQ mediante herramientas externas |
| Idiomas soportados | no disponible |
| Licencia | other (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-1.7B, un transformer denso de la familia Qwen3. Sobre esa base se aplico un ajuste fino completo (tag `full`), no LoRA ni QLoRA, segun los metadatos del repositorio. El nombre del modelo sugiere una receta en dos etapas: un SFT sobre un conjunto de 1,2k muestras (`sftcs1.2k`) y una fase de optimizacion de preferencias tipo DPO con parametro beta de 0,03 (`pdpo`), ejecutada con Llama-Factory (tag `llama-factory`) y una tasa de aprendizaje de 3e-7.

No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion del dataset, la presencia de RLHF adicional ni innovaciones tecnicas especificas mas alla del pipeline SFT + DPO descrito. El modelo figura como `generated_from_trainer`, lo que confirma que se genero con un framework de entrenamiento estandar.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del Qwen3-1.7B base.
- Razonamiento de tipo cadena de pensamiento (thinking mode), propia de la familia Qwen3, aunque no se documenta si el ajuste la preserva intacta.
- Generacion de codigo y resolucion de problemas matematicos basicos, segun las capacidades del modelo base.
- Soporte de tool calling / function calling, siempre que el modelo base lo ofrezca y el ajuste no lo haya degradado.
- Capacidades multilingues: no documentadas para este fine-tune; dependen del modelo base.
- No se documentan capacidades de vision ni audio.

## Casos de uso

- Investigacion sobre alineacion: sirve como punto de partida para reproducir y comparar recetas SFT + DPO sobre Qwen3-1.7B, evaluando el efecto de beta 0,03 y lr 3e-7 en tareas de razonamiento.
- Prototipado de asistentes conversacionales: al ser un modelo de 1,7B, puede ejecutarse en una sola GPU consumer para pruebas de concepto de chatbots multi-turno.
- Generacion de codigo asistida en local: su tamano reducido permite integrarlo en entornos de desarrollo sin conexion, con cuantizacion a 4 bits.
- Ajuste educativo y docencia: util para demostrar el pipeline completo de Llama-Factory, desde SFT hasta DPO, en un modelo manejable.
- Evaluacion comparativa de fine-tunes pequenos: como baseline para medir si el entrenamiento de preferencia mejora frente al Qwen3-1.7B original en tareas de razonamiento.
- Despliegue experimental con TGI: los tags `text-generation-inference` y `endpoints_compatible` permiten servirlo en infraestructura Hugging Face Endpoints para pruebas controladas.

## Benchmarks y rendimiento

El model-index oficial declara una entrada de evaluacion sin resultados:

| Benchmark | Resultado |
|---|---|
| (ninguno declarado) | sin datos |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB.
- VRAM estimada en cuantizacion 4 bits (GGUF/AWQ): alrededor de 1,2-1,5 GB para pesos, con un total practico de 2-4 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16; RTX 3060 12 GB, RTX 4070, RTX 4090, A100 o H100 para despliegues de mayor throughput.
- Cabe en GPU consumer: si, en modelos como RTX 3060, RTX 4060 Ti, RTX 4070 y superiores, especialmente con cuantizacion.
- Opciones de despliegue: `transformers`, `text-generation-inference` (TGI), vLLM, llama.cpp u Ollama previa conversion a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (fine-tune de Qwen3-1.7B) | 1,72B | no disponible | other (gated) | Hugging Face, acceso restringido | Sin benchmarks publicados |
| Qwen/Qwen3-1.7B (base) | 1,72B | no disponible en esta ficha | Apache 2.0 (segun el modelo base) | Hugging Face, acceso abierto | Modelo de referencia; capacidades originales documentadas por el autor |
| Qwen2.5-1.5B | ~1,5B | 32k (segun documentacion del modelo) | Apache 2.0 | Hugging Face, acceso abierto | Alternativa de generacion de texto de tamano similar |
| Llama-3.2-1B | ~1,2B | 128k (segun documentacion del modelo) | Llama 3.2 Community License | Hugging Face, acceso abierto | Alternativa de tamano similar con contexto largo |

La comparacion de rendimiento con estos modelos no puede establecerse porque este fine-tune no publica resultados de evaluacion.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el ajuste mejore al Qwen3-1.7B base; podria incluso degradarlo.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita su uso automatizado y su redistribucion.
- Licencia "other": no se especifican los terminos exactos; es imprescindible revisarlos antes de cualquier uso comercial, y ademas estan sujetos a la licencia del modelo base Qwen3-1.7B.
- Sin informacion sobre idiomas soportados ni sobre el dataset de entrenamiento, lo que impide evaluar sesgos y cobertura linguistica.
- Riesgo de alucinacion inherente a los modelos de 1,7B, agravado por un ajuste de preferencia con solo 1,2k muestras de SFT.
- El nombre del modelo sugiere un experimento academico o de investigacion, no un artefacto validado para produccion.
- No se documenta si el thinking mode o el tool calling del modelo base siguen funcionando tras el ajuste.
- El repositorio tiene 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unamed12/reasoning-pdpo_sftcs1.2k__plus__mc_cbase_lr3e-7_beta0.03_hf
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Llama-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Documentacion de TGI: https://huggingface.co/docs/text-generation-inference
