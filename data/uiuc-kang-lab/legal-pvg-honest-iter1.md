# uiuc-kang-lab/legal-pvg-honest-iter1

## Resumen

`legal-pvg-honest-iter1` es un checkpoint de investigación publicado por uiuc-kang-lab en Hugging Face. No es un modelo completo, sino un adaptador LoRA entrenado sobre `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, un modelo de tipo MoE de 30B parámetros totales y 3B activos, distribuido en BF16. El entrenamiento se realizó con la plataforma Tinker y el checkpoint corresponde al rol "honest", iteración 1, paso 920, dentro de un proyecto etiquetado como "pvg" y "legal".

Su relevancia está en la adaptación eficiente al dominio jurídico de un modelo MoE pequeño: al activarse solo 3B de parámetros, la inferencia es barata una vez cargado el modelo base. La model card no documenta datos de entrenamiento, contexto ni evaluaciones, por lo que su valor principal es experimental: permite estudiar esquemas de entrenamiento tipo Prover-Verifier Games (interpretación del tag "pvg", no confirmada por el autor) y evaluar adaptadores legales sobre Nemotron 3 Nano. Requiere descargar el modelo base por separado y convertir o fusionar los pesos antes de servir el modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un transformer MoE (Nemotron 3 Nano) |
| Parámetros totales | 1,5 GB de pesos de adaptador (recuento exacto no disponible); modelo base: 30B |
| Parámetros activos | 3B en el modelo base (denominación A3B); el adaptador se aplica sobre él |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el modelo base se distribuye en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible; se aplican los términos de la licencia del modelo base |
| Formato de pesos | safetensors (layout de tensores propio de Tinker, no compatible directamente con PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre NVIDIA Nemotron 3 Nano 30B-A3B en precisión BF16. Por la denominación A3B, el modelo base es un MoE (mixture of experts) con 30B parámetros totales de los que solo 3B se activan por token, lo que reduce el coste de cómputo por token respecto a un modelo denso de 30B. Los archivos conservan el layout de tensores de Tinker, la plataforma de fine-tuning con la que se entrenó el adaptador, por lo que no funcionan como adaptadores PEFT estándar: hay que convertirlos con `tinker_cookbook.weights.build_lora_adapter` para motores de serving con soporte LoRA, o fusionarlos en el modelo base con `build_hf_model`.

La model card indica que el checkpoint corresponde al rol "honest", iteración 1, paso 920, y remite a `checkpoint.json` para los metadatos. El tag "pvg" sugiere un esquema tipo Prover-Verifier Games (coentrenamiento de roles de proponente y verificador para mejorar la honestidad y legibilidad de las salidas), aunque el autor no lo documenta explícitamente. No se publica información sobre el dataset de entrenamiento (número de tokens, composición), ni sobre el uso de RLHF o DPO. El autor recomienda mantener el renderer de entrenamiento original al evaluar el checkpoint.

## Capacidades

- Generación de texto en el dominio jurídico, combinando las capacidades del modelo base con la adaptación LoRA (alcance exacto no documentado).
- Entrenamiento orientado a honestidad: el rol "honest" sugiere optimización hacia respuestas sinceras dentro de un esquema pvg (interpretación no confirmada en la model card).
- Hereda las capacidades generales de Nemotron 3 Nano 30B-A3B (razonamiento y generación de texto en lenguaje natural), aunque el checkpoint está especializado en legal.
- Soporte de tool calling / function calling: no documentado para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio, thinking mode): no disponibles o no documentadas.

## Casos de uso

- Investigación en alineamiento y honestidad: comparar checkpoints de distintos roles e iteraciones del proyecto pvg para medir cómo evoluciona la sinceridad de las respuestas en tareas jurídicas.
- Revisión y resumen de contratos con supervisión humana: resumir cláusulas, reformular lenguaje legal y señalar pasajes relevantes, siempre con revisión de un profesional.
- RAG jurídico: combinar el adaptador con un sistema de recuperación sobre corpus de legislación o jurisprudencia para responder preguntas con citas verificables del contexto recuperado.
- Clasificación de documentos legales: categorizar tipos de contrato, cláusulas o comunicaciones en flujos de gestión documental.
- Generación de borradores jurídicos internos: redactar primeras versiones de notas, comunicaciones o esquemas de argumentos que un abogado refine después.
- Evaluación comparativa de adaptadores: medir el efecto del paso 920 frente al modelo base y frente a otras iteraciones, usando el renderer de entrenamiento original como indica el autor.
- Prototipado de asistentes legales de bajo coste: con 3B de parámetros activos por token, es adecuado para experimentar con agentes legales sin el coste de un modelo de 30B denso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones del checkpoint ni comparativas con el modelo base. Los resultados de búsqueda mencionan a GLM-Legal (Z.ai) con un 19,2% de all-pass rate en Harvey LAB, pero corresponde a un modelo distinto y sus cifras no son extrapolables a este adaptador.

## Requisitos de hardware

- El adaptador añade solo 1,5 GB; el requisito de memoria lo domina el modelo base de 30B parámetros.
- Estimaciones de VRAM para el modelo base (inferencia): BF16 aproximadamente 60 GB de pesos; FP8 aproximadamente 30 GB; cuantización INT4 aproximadamente 17-20 GB. Son estimaciones a partir del tamaño, no datos oficiales.
- BF16: GPU de datacenter tipo A100 80GB o H100, o varias GPUs de 48 GB.
- Cuantización INT4: viable en GPUs de consumo de gama alta (RTX 4090 de 24 GB o superior), aunque el adaptador está pensado para trabajar sobre pesos BF16 y habría que validar la interacción con la cuantización.
- Gracias a los 3B de parámetros activos, el cómputo por token es comparable al de un modelo denso de ~3B, pero no hay cifras oficiales de latencia ni throughput (no disponible).
- Despliegue: convertir el adaptador con `tinker_cookbook.weights.build_lora_adapter` para motores con soporte LoRA, o fusionarlo con `build_hf_model`; después se puede servir con vLLM, TGI o convertir a GGUF para llama.cpp y Ollama. Los archivos tal cual están en el repo no son servibles directamente.
- Ollama y llama.cpp requieren primero fusionar el adaptador en el modelo base y convertir el resultado.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| legal-pvg-honest-iter1 (este) | Adaptador LoRA legal (rol honest) sobre Nemotron 3 Nano | 1,5 GB de adaptador sobre base de 30B (3B activos) | no disponible | no disponible (rige la del base) | safetensors con layout Tinker; requiere conversión o fusión |
| NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 (base) | Transformer MoE generalista | 30B totales / 3B activos | no disponible | no disponible en la información proporcionada | BF16, descargable en Hugging Face |
| GLM-Legal (Z.ai) | Modelo legal agéntico sobre GLM-5.3-Flash | no disponible | no disponible | no disponible | Anunciado en octubre de 2026; 19,2% all-pass en Harvey LAB frente al 6,7% de su modelo base, según MarkTechPost |

La comparativa con GLM-Legal es orientativa: se trata de un modelo legal de producción de un laboratorio distinto, mientras que este checkpoint es un artefacto de investigación sin evaluaciones publicadas.

## Limitaciones y advertencias

- Checkpoint de investigación sin evaluaciones publicadas: la calidad de sus salidas es impredecible y no está validada por la comunidad (0 descargas y 0 likes en el momento de redactar la ficha).
- Solo contiene pesos de adaptador con el layout de Tinker: no funciona directamente con PEFT ni con `transformers`; es obligatorio convertir o fusionar antes de servir.
- Los datos de entrenamiento no están documentados, por lo que los sesgos del adaptador son desconocidos; siendo un modelo legal, podría estar sesgado hacia jurisdicciones con más datos disponibles (por ejemplo, el derecho estadounidense), aunque esto no está confirmado.
- Riesgo de alucinación alto en el dominio jurídico: el modelo puede citar normas, artículos o sentencias inexistentes. Toda salida debe verificarse contra fuentes primarias y no constituye asesoramiento legal.
- Idiomas soportados no documentados; no se puede garantizar funcionamiento en castellano.
- Licencia no declarada en el repositorio: el uso comercial queda sujeto a los términos de la licencia del modelo base, que no constan en la información proporcionada; conviene revisarlos antes de cualquier despliegue.
- El autor indica mantener el renderer de entrenamiento original al evaluar; evaluar con otro formato de prompt puede degradar los resultados.
- La longitud de contexto del modelo base no consta en esta información; revisar la ficha del base antes de diseñar cargas de trabajo con documentos largos.

## Enlaces

- Ficha del modelo en Hugging Face: https://huggingface.co/uiuc-kang-lab/legal-pvg-honest-iter1
- Modelo base (NVIDIA Nemotron 3 Nano 30B-A3B BF16): https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Metadatos del checkpoint: archivo `checkpoint.json` dentro del repositorio del modelo
- Contexto sobre modelos legales (no relacionados directamente con este checkpoint):
  - MarkTechPost, "Z.ai GLM-Legal Beats Claude Fable 5 and Kimi K3 on Harvey LAB": https://www.marktechpost.com/2026/10/13/zai-glm-legal-harvey-lab-legal-ai-model/
  - Unite.ai, "Z.ai Unveils GLM-Legal, an Agentic Model for Legal Workflows": https://www.unite.ai/z-ai-unveils-glm-legal-an-agentic-model-for-legal-workflows/
