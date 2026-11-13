# Viraj0112/akcr-llama3.1-8b-instruct-dpo-v2

## Resumen

`Viraj0112/akcr-llama3.1-8b-instruct-dpo-v2` es un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `meta-llama/Llama-3.1-8B-Instruct`. Lo publica el usuario Viraj0112 en Hugging Face y se distribuye como repositorio PEFT: no contiene pesos completos, sino los pesos delta del adaptador en formato safetensors (0.1 GB de repositorio). El entrenamiento se realizó con TRL 1.7.1 y PEFT 0.21.2, y la model card identifica el artefacto internamente como `aligntune_meta_llama_llama_3_1_8b_instruct_v2_cyborg_lora`.

El modelo hereda la arquitectura y las capacidades del Llama 3.1 8B Instruct de Meta: transformer decoder-only denso de 8.000 millones de parámetros con 128.000 tokens de contexto nativo, instrucción previa y soporte multilingüe. El adaptador DPO busca alinear las respuestas del modelo base con un conjunto de preferencias, aunque la información publicada no detalla el dataset, el número de pasos ni los hiperparámetros empleados.

Su relevancia es limitada y experimental: no hay descargas ni likes, la licencia no está declarada, la model card es una plantilla autogenerada por TRL y no se publican benchmarks ni detalles del proceso de alineación. Debe tratarse como un adaptador de investigación para experimentar con DPO sobre Llama 3.1 8B Instruct, no como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Llama 3.1 8B Instruct) + adaptador LoRA |
| Parámetros totales | 8.000 millones en el modelo base; tamaño exacto del adaptador no disponible |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base; no verificada tras el ajuste) |
| Tipos de cuantización | no disponible en la model card; el modelo base admite cuantizaciones estándar (4-bit, 8-bit, GGUF) al fusionar el adaptador |
| Idiomas soportados | no disponibles (el modelo base soporta oficialmente inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | no disponible (la model card indica un campo `licence: license` sin contenido; el modelo base usa la Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base en safetensors |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama 3.1 8B Instruct, un transformer decoder-only de 8.000 millones de parámetros con atención por grupos (GQA), activaciones SwiGLU, RoPE y ventana de contexto de 128.000 tokens. El modelo base fue entrenado por Meta con aproximadamente 15 billones de tokens y posteriormente sometido a SFT y RLHF (DPO incluido) para alineamiento instructivo.

Sobre esa base, este repositorio añade un adaptador LoRA entrenado con DPO, la técnica introducida en el paper 2305.18290 que optimiza directamente el modelo como política de preferencias sin un modelo de recompensa separado. La model card no especifica el dataset de preferencias, el rango del adaptador, el alpha, la tasa de aprendizaje, el número de pasos ni la composición de los pares elegidos/rechazados. Las versiones de framework declaradas son PEFT 0.21.2, TRL 1.7.1, Transformers 5.21.1, PyTorch 2.13.0, Datasets 4.8.5 y Tokenizers 0.23.3. No se documentan innovaciones técnicas adicionales.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Instruct.
- Razonamiento, matemáticas y generación de código a nivel de un Llama 3.1 8B Instruct.
- Soporte de tool calling y function calling (capacidad del modelo base; no verificada tras el DPO).
- Soporte de agentes y razonamiento multi-paso (capacidad del modelo base).
- Capacidades multilingües del modelo base (8 idiomas oficiales), aunque el adaptador no declara idiomas propios.
- Alineamiento de preferencias orientado a respuestas más concisas o seguras según el dataset DPO empleado, que no se documenta.
- No se declaran capacidades de visión, audio ni modo thinking extendido.

## Casos de uso

- Experimentación con DPO: servir como referencia práctica de cómo aplicar TRL y PEFT para alinear un Llama 3.1 8B Instruct con un conjunto de preferencias propio, comparando el adaptador contra el modelo base.
- Evaluación de alineamiento: medir el efecto del DPO sobre la verbosidad, el tono y la tasa de rechazo en un conjunto de prompts de validación, cargando el adaptador con `PeftModel` sobre el modelo base.
- Chatbot de dominio acotado: fusionar el adaptador con el modelo base y desplegar un asistente conversacional con 128.000 tokens de contexto para conversaciones largas o documentos extensos, siempre que el dataset DPO sea coherente con el dominio.
- Generación de código asistida: usar el modelo fusionado en un IDE o pipeline de revisión, aprovechando la ventana de contexto para incluir repositorios completos en el prompt.
- Extracción y resumen de documentos largos: procesar contratos, informes o transcripciones de hasta decenas de miles de tokens en una sola pasada.
- Base para nuevos ajustes: partir del adaptador como punto de inicio de un SFT o un segundo DPO específico, dado que el repositorio es pequeño (0.1 GB) y fácil de versionar.
- Investigación sobre sesgos de alineamiento: comparar respuestas del modelo base y del adaptador en pruebas de estereotipos y refusal para estudiar el impacto del DPO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM para inferencia del modelo base en FP16/BF16: aproximadamente 16 GB de pesos más overhead de KV cache; con 8.000 millones de parámetros se recomienda un mínimo de 20-24 GB.
- Cuantización 8-bit: alrededor de 9-10 GB de VRAM; cuantización 4-bit: alrededor de 5-6 GB, suficiente para GPUs de consumo como RTX 3090, RTX 4070 Ti, RTX 4080 o RTX 4090.
- GPUs de datacenter recomendadas para FP16 y contexto largo: A100 40/80 GB, H100 80 GB, L40S.
- El adaptador LoRA en sí ocupa unos 0.1 GB y puede cargarse junto al modelo base sin requisitos adicionales significativos.
- Despliegue: vLLM o TGI para producción (requiere fusionar el adaptador con `merge_and_unload`), llama.cpp y Ollama tras convertir el modelo fusionado a GGUF, y Transformers + PEFT para prototipado.
- Latencia y throughput: no disponibles; dependen del hardware y de la longitud de contexto, que con 128.000 tokens puede dominar el coste por la KV cache.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| akcr-llama3.1-8b-instruct-dpo-v2 | 8B (base) + LoRA | 128.000 (base) | Adaptador DPO | no disponible | Hugging Face, 0 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128.000 | Modelo completo Instruct | Llama 3.1 Community License | Hugging Face, ampliamente usado |
| meta-llama/Llama-3.1-8B | 8B | 128.000 | Modelo completo base | Llama 3.1 Community License | Hugging Face |
| Mistral-7B-Instruct-v0.3 | 7,2B | 32.000 | Modelo completo Instruct | Apache 2.0 | Hugging Face |

El adaptador no aporta mejoras verificables frente al modelo base sin benchmarks públicos; su interés es metodológico (DPO con TRL sobre Llama 3.1) y su licencia indefinida lo hace menos apto para uso comercial que alternativas con licencia explícita como Mistral 7B Instruct.

## Limitaciones y advertencias

- Licencia no declarada: la model card contiene un campo `licence: license` sin contenido, lo que impide determinar las condiciones de uso comercial. Además, al derivar de Llama 3.1 8B Instruct, se heredan las restricciones de la Llama 3.1 Community License.
- Sin benchmarks ni evaluación publicada: no hay evidencia de que el DPO mejore al modelo base; podría degradar capacidades si el dataset de preferencias era pequeño o ruidoso.
- Dataset de preferencias no documentado: se desconoce la composición, el tamaño y los criterios de anotación, lo que impide evaluar sesgos introducidos por el alineamiento.
- Riesgo de alucinación: heredado del modelo base, sin mitigaciones adicionales documentadas.
- Idiomas no declarados: aunque el modelo base soporta 8 idiomas, el adaptador podría haber desplazado el comportamiento hacia el idioma dominante del dataset DPO.
- Contexto de 128.000 tokens no verificado tras el ajuste: el adaptador no modifica la arquitectura, pero no hay pruebas de que el rendimiento en contextos largos se mantenga.
- Repositorio sin mantenimiento aparente: 0 descargas, 0 likes y creado/actualizado el mismo día, sin issues ni discusión asociada.
- Model card autogenerada por TRL con campos vacíos (procedimiento de entrenamiento, hiperparámetros), lo que dificulta la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/Viraj0112/akcr-llama3.1-8b-instruct-dpo-v2
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Paper DPO: https://huggingface.co/papers/2305.18290
- Repositorio TRL: https://github.com/huggingface/trl
- Paper DPO en NeurIPS 2023: http://papers.nips.cc/paper_files/paper/2023/hash/a85b405ed65c6477a4fe8302b5e06ce7-Abstract-Conference.html
