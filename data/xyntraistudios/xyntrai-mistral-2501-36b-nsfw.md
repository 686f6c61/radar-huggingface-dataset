# xyntraistudios/xyntrai-mistral-2501-36B-nsfw

## Resumen

Xyntrai Mistral 2501 36B NSFW es un ajuste fino (finetune) del modelo xyntraistudios/xyntrai-mistral-small-2501-36B-nsfw, desarrollado por el usuario xyntraistudios. Se distribuye en HuggingFace como un modelo de generacion de texto para transformers, con pesos en safetensors y un total de 36.910.535.680 parametros (aproximadamente 36,9 mil millones). El repositorio ocupa 73,8 GB, lo que corresponde a pesos en precision alta (probablemente bf16/fp16) sin cuantizaciones publicadas.

La model card es extremadamente escasa: solo indica que es un finetune subido por el autor, que se entreno con Unsloth y la libreria TRL de HuggingFace, y que la licencia declarada es Apache 2.0. No se documentan datos de entrenamiento, composicion del dataset, contexto, ni resultados de evaluacion. El sufijo "nsfw" y la etiqueta "not-for-all-audiences" indican que el ajuste fino esta orientado a contenido para adultos, lo que condiciona su uso en produccion.

Es relevante ahora principalmente como ejemplo de flujo de finetuning rapido con Unsloth sobre una base Mistral Small, pero carece de documentacion tecnica suficiente para una evaluacion rigurosa. Cualquier uso en produccion exige validacion propia, auditoria de sesgos y revision de las politicas de contenido aplicables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Mistral; detalles no disponibles) |
| Parametros totales | 36.910.535.680 (36,9 B) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo solo con safetensors en precision alta) |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un finetune de xyntraistudios/xyntrai-mistral-small-2501-36B-nsfw, que a su vez pertenece a la familia Mistral Small. La model card no especifica la arquitectura interna (numero de capas, dimension oculta, atencion GQA, tipo de activacion, uso de sliding window attention), por lo que estos detalles deben considerarse no disponibles. El tamano de 36,9 B de parametros sugiere una configuracion de tipo Mistral Small de gama alta, pero no hay confirmacion en la informacion proporcionada.

El entrenamiento se realizo, segun la model card, con Unsloth y la libreria TRL de HuggingFace, lo que indica un proceso de finetuning supervisado (SFT) optimizado para velocidad y memoria. No se documentan numero de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO, ni tecnicas adicionales como decodificacion especulativa o atencion lineal. Tampoco se indica si se congelaron capas o se entreno el modelo completo.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de la base Mistral Small.
- Finetune orientado a contenido para adultos (etiqueta nsfw y not-for-all-audiences).
- Compatibilidad con text-generation-inference y transformers (tags del repo).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo se declara ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Generacion de narrativa adulta controlada: el modelo puede producir texto conversacional y narrativo en ingles para plataformas de ficcion para adultos, siempre que se apliquen filtros y verificacion de edad.
- Prototipado de finetunes con Unsloth: sirve como referencia de flujo de entrenamiento rapido sobre una base Mistral Small de 36,9 B, util para equipos que quieran replicar el pipeline.
- Evaluacion comparativa de finetunes NSFW: permite estudiar como un ajuste fino sobre una base Mistral afecta al estilo y al contenido, en entornos de investigacion controlados.
- Generacion de dialogos sinteticos para datasets de investigacion: puede usarse para crear corpus de conversacion en ingles, con revision humana posterior.
- Pruebas de seguridad y moderacion: util para calibrar clasificadores de contenido y estudiar falsos positivos/negativos en modelos ajustados para adultos.
- Experimentacion con despliegue en TGI: al estar etiquetado para text-generation-inference, permite probar infraestructuras de serving con un modelo de 36,9 B en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 74 GB solo para pesos, mas overhead de activaciones y KV cache; se recomienda 80 GB como minimo.
- GPU recomendadas: A100 80 GB, H100 80 GB, o configuraciones multi-GPU (por ejemplo, 2x A100 40 GB con tensor parallelism).
- Cabe en consumer GPU: no en una sola GPU de consumo; seria necesario repartir el modelo entre varias GPU o usar cuantizacion, que no esta publicada en el repo.
- Opciones de despliegue: text-generation-inference (etiqueta del repo), transformers, vLLM y llama.cpp/Ollama solo si se generan cuantizaciones propias (no disponibles en el repositorio).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| xyntrai-mistral-2501-36B-nsfw | 36,9 B | no disponible | apache-2.0 | HuggingFace, safetensors |
| Mistral Small (base oficial) | no disponible en esta ficha | no disponible | no disponible en esta ficha | HuggingFace |
| xyntrai-mistral-small-2501-36B-nsfw (modelo base) | 36,9 B (por herencia) | no disponible | apache-2.0 | HuggingFace |

No se dispone de datos de rendimiento para comparar benchmarks entre estos modelos.

## Limitaciones y advertencias

- Model card practicamente vacia: sin datos de dataset, contexto, evaluacion ni hiperparametros.
- Contenido NSFW: la etiqueta not-for-all-audiences implica riesgo de generar material para adultos; requiere moderacion y cumplimiento legal (verificacion de edad, politicas de plataforma).
- Sesgos conocidos: no documentados; al ser un finetune sobre base Mistral, hereda sesgos no auditados de la base y del dataset de ajuste.
- Riesgo de alucinacion: no evaluado; sin benchmarks ni evaluaciones de fidelidad.
- Limitaciones de idioma: solo se declara ingles; el rendimiento en castellano no esta garantizado.
- Licencia Apache 2.0 declarada, pero conviene verificar que la base Mistral Small permita redistribucion bajo esa licencia; la informacion proporcionada no lo confirma.
- Solo pesos en safetensors de precision alta (73,8 GB): despliegue costoso y sin cuantizaciones oficiales.
- Para produccion: exige auditoria propia de seguridad, moderacion de salida y validacion de calidad, al no haber evaluaciones publicadas.

## Enlaces

- HuggingFace: https://huggingface.co/xyntraistudios/xyntrai-mistral-2501-36B-nsfw
- Modelo base: https://huggingface.co/xyntraistudios/xyntrai-mistral-small-2501-36B-nsfw
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
