# Tahaahmed122/ean_mistral_7b_legal

## Resumen

EAN Mistral 7B Legal es un ajuste fino del modelo Mistral-7B-Instruct-v0.2 orientado al razonamiento juridico en ingles, desarrollado por el usuario Tahaahmed122. No se trata de un fine-tune convencional: el autor implementa una arquitectura de "Multi-LoRA con arbitraje guiado por evidencia" (EAN), en la que el backbone de 7.000 millones de parametros permanece congelado y cuantizado en 4 bits, mientras que tres cabezas LoRA independientes se entrenan en paralelo y un codificador de evidencia basado en DeBERTa-v3-base modula dinamicamente el peso de cada cabeza en el espacio de probabilidades de token.

El modelo esta pensado para tareas de interpretacion normativa, alineacion de hechos con evidencia y argumentacion juridica, usando como base de datos el corpus LawInstruct. La propuesta tecnica resulta relevante porque sustituye el enrutamiento interno de un MoE clasico por una fusion explicita de distribuciones de probabilidad, lo que en teoria facilita la trazabilidad del razonamiento y reduce el colapso de expertos.

El repositorio tiene un tamano de 1,3 GB, cero descargas y cero likes en el momento de la consulta, y solo declara soporte para ingles. La licencia es Apache 2.0 sobre el modelo base, aunque el autor no detalla condiciones adicionales para los pesos derivados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Mistral-7B-Instruct-v0.2 congelado en 4-bit NF4) + 3 cabezas LoRA + encoder DeBERTa-v3-base + red de arbitraje EvidenceGate |
| Parametros totales | 7B (backbone) + 125,8M (LoRA) + 183,8M (encoder) + 4,9M (gate); total aproximado 7,31B |
| Parametros activos | No aplica (no es MoE clasico; las 3 cabezas LoRA se combinan por fusion de probabilidades) |
| Longitud de contexto | No disponible (heredada de Mistral-7B-Instruct-v0.2, 32.768 tokens segun el modelo base, no confirmado en la model card) |
| Tipos de cuantizacion | 4-bit NF4 con doble cuantizacion y computo en bfloat16 en el backbone; no se documentan otras variantes |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (repositorio de 1,3 GB); no se confirma presencia de safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura combina cinco componentes. El backbone es Mistral-7B-Instruct-v0.2 congelado, cuantizado en 4 bits NF4 con doble cuantizacion, computo en bfloat16 y atencion SDPA. Sobre el se inyectan tres adaptadores LoRA independientes con rango r=16, alpha=32 y dropout 0,05 en las 224 proyecciones lineales (q, k, v, o, gate, up, down) de los 32 bloques del transformer, con inicializacion Kaiming uniforme e independiente por cabeza. Un encoder bidireccional DeBERTa-v3-base (12 capas, 768 dimensiones ocultas) extrae representaciones densas del estatuto, los hechos y la jurisdiccion. La red EvidenceGate, un MLP comparativo con d=512, activaciones GELU y embeddings aprendidos por cabeza, observa los estados ocultos de las tres cabezas junto con el vector de evidencia y produce pesos de confianza dinamicos alpha_i,t. Finalmente, la fusion se realiza en el simplex de probabilidades mediante una combinacion convexa de las distribuciones de cada cabeza, tanto en entrenamiento como en decodificacion autoregresiva.

El entrenamiento sigue un objetivo de verosimilitud de mezcla de expertos (Jacobs et al., 1991) en lugar de un enrutamiento hard, de modo que las especializaciones de cada cabeza emergen de forma natural sin asignacion previa de roles. El corpus declarado es LawInstruct. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generacion de texto juridico en ingles: interpretacion de estatutos, redaccion de argumentos y resumenes de documentacion legal.
- Razonamiento guiado por evidencia: el encoder DeBERTa condiciona la generacion a fragmentos normativos y facticos explicitos.
- Arbitraje multi-cabeza: tres LoRA entrenadas en paralelo cuyas salidas se ponderan dinamicamente por token segun la evidencia disponible.
- Trazabilidad parcial del peso de cada cabeza mediante los coeficientes alpha_i,t del EvidenceGate.
- Generacion autoregresiva estandar compatible con el pipeline text-generation de Hugging Face.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking explicito.

## Casos de uso

- Analisis de contratos: el modelo puede recibir el texto contractual junto con fragmentos de legislacion aplicable y generar un analisis de clausulas de riesgo, aprovechando el encoder de evidencia para anclar cada afirmacion a la norma citada.
- Asistencia en arbitraje: dado un conjunto de hechos y el marco normativo, el sistema puede producir borradores de argumentacion ponderando distintas interpretaciones, y los pesos alpha_i,t permiten inspeccionar que cabeza domina en cada tramo.
- Investigacion juridica asistida: busqueda y sintesis de jurisprudencia en ingles, con el condicionamiento por evidencia reduciendo derivas respecto al texto legal proporcionado.
- Generacion de memorandos internos: redaccion de resumenes estructurados de expedientes a partir de hechos y estatutos, adecuado por el enfasis del entrenamiento en LawInstruct.
- Formacion y simulacion legal: generacion de escenarios de arbitraje y respuestas argumentadas para entrenamiento de estudiantes o abogados junior.
- Preprocesamiento documental en despachos: clasificacion y extraccion de argumentos de expedientes en ingles antes de revision humana, con la cautela de que el modelo no esta validado en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone en 4-bit NF4 ocupa aproximadamente 4-5 GB; sumando LoRA, encoder DeBERTa y gate, se estima un minimo de 8-10 GB en FP16 para el encoder y el gate.
- GPU recomendadas: A100 40 GB o H100 para despliegue con margen y contexto largo; RTX 4090 (24 GB) para inferencia comoda en 4 bits.
- Cabe en GPUs de consumo: si, en RTX 3090, RTX 4090 y potencialmente en RTX 4080 (16 GB) con contexto reducido; no se confirma en GPUs de 8 GB.
- Opciones de despliegue: el repositorio esta en PyTorch y no incluye pesos GGUF, por lo que llama.cpp y Ollama requeririan conversion previa. vLLM y TGI no soportan de forma nativa la fusion multi-LoRA con arbitraje externo, por lo que el pipeline del autor (Mistral + DeBERTa + EvidenceGate) debe servirse como codigo Python personalizado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EAN Mistral 7B Legal | ~7,31B (7B backbone + adaptadores) | No disponible (base: 32.768) | Multi-LoRA + arbitraje por evidencia | Apache 2.0 | Hugging Face, 0 descargas |
| Mistral-7B-Instruct-v0.2 | 7B | 32.768 | Fine-tune instructivo generalista | Apache 2.0 | Ampliamente disponible |
| Modelos legales basados en Mistral/Llama | 7B-13B | Variable | Fine-tune monolitico sobre corpus juridico | Variable | Variable |
| Modelos legales especializados tipo LegalBERT | ~110M-340M | 512 | Encoder discriminativo | Variable | Disponible |

La comparativa con alternativas legales de proposito general es limitada porque no se han publicado metricas del modelo EAN que permitan contrastar rendimiento. Frente a Mistral-7B-Instruct-v0.2, el modelo anade componentes no estandar (encoder externo y gate) que incrementan la complejidad de despliegue sin datos publicos que demuestren mejora cuantitativa.

## Limitaciones y advertencias

- Solo soporta ingles; no se declara ni valida comportamiento en castellano ni en otros idiomas.
- No hay benchmarks publicados, por lo que no puede verificarse la calidad del razonamiento juridico frente al modelo base.
- Riesgo de alucinacion juridica: como todo LLM, puede citar normas o jurisprudencia inexistentes; el arbitraje por evidencia mitiga pero no elimina este riesgo.
- El repositorio registra cero descargas y cero likes, sin validacion externa de la comunidad.
- La arquitectura requiere servir tres componentes (Mistral cuantizado, DeBERTa y EvidenceGate) de forma coordinada, lo que complica el despliegue con frameworks estandar como vLLM o TGI.
- No se documentan sesgos especificos, pero el corpus LawInstruct puede reflejar sesgos jurisdiccionales del ordenamiento de origen.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni auditoria legal de las salidas; no debe usarse como sustituto de asesoramiento juridico profesional.
- El contexto maximo efectivo no se confirma en la model card; debe validarse empiricamente antes de usarlo con documentos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tahaahmed122/ean_mistral_7b_legal
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Encoder de evidencia: https://huggingface.co/microsoft/deberta-v3-base
- Dataset LawInstruct: https://huggingface.co/datasets/lawinstruct/lawinstruct
- Repositorio GitHub del autor: https://github.com/taha463/Mistral-7B-MultiLoRA-Legal
- Paper de referencia sobre mezclas de expertos (Jacobs et al., 1991): https://direct.mit.edu/neco/article/3/1/79/5643/Adaptive-Mixtures-of-Local-Experts
- Referencia arXiv citada en tags: https://arxiv.org/abs/1701.06538
- Referencia arXiv citada en tags: https://arxiv.org/abs/2101.03961
- Referencia arXiv citada en tags: https://arxiv.org/abs/2310.06825
- Referencia arXiv citada en tags: https://arxiv.org/abs/2111.09543
