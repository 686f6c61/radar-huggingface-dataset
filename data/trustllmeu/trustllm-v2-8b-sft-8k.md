# TrustLLMeu/trustllm-v2-8b-sft-8k

## Resumen

TrustLLM v2 8B SFT 8k es un modelo de lenguaje de tipo Mixture of Experts (MoE) publicado por TrustLLMeu, una iniciativa de investigación orientada a modelos multilingües para lenguas nórdicas y germánicas. Se trata de un ajuste supervisado (SFT) construido sobre el modelo base TrustLLMeu/trustllm-v2-8b-midtrain-sft, con 7.191.266.752 parámetros totales según los pesos en safetensors del repositorio. La ficha lo etiqueta como long-context, MoE y multilingüe.

El modelo cubre nueve idiomas: inglés, islandés, feroés, noruego bokmål, noruego nynorsk, sueco, danés, neerlandés y alemán. Su objetivo es servir como base abierta para investigación en lenguas de bajos recursos del ámbito nórdico, donde los modelos comerciales ofrecen cobertura limitada. El entrenamiento de instrucciones se apoya en el conjunto allenai/Dolci-Instruct-SFT y en wikimedia/wikipedia.

Es relevante porque combina una arquitectura MoE con contexto largo y cobertura multilingüe, pero su licencia está restringida a investigación y el acceso en HuggingFace está limitado (gated), por lo que requiere aceptar condiciones antes de la descarga. No se han publicado datos de benchmarks ni cifras oficiales de contexto, parámetros activos o cuantizaciones en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (etiqueta OptMoE, con custom_code) |
| Parametros totales | 7.191.266.752 (~7,19B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (etiquetado como long-context) |
| Tipos de cuantizacion | no disponible (solo se listan pesos safetensors; sin variantes GGUF, AWQ o GPTQ) |
| Idiomas soportados | en, is, fo, nb, nn, sv, da, nl, de |
| Licencia | research-only (licencia "other" en HuggingFace) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es una mezcla de expertos (MoE) identificada con la etiqueta OptMoE y publicada con código personalizado (custom_code), lo que implica que la carga del modelo requiere confiar en la implementación incluida en el repositorio y no en una clase estándar de transformers. La información disponible no detalla el número de expertos, el enrutador, los parámetros activos por token ni la dimensión de la ventana de atención, aunque el modelo se marca como long-context.

El modelo parte de TrustLLMeu/trustllm-v2-8b-midtrain-sft (fase de midtraining) y se somete después a un ajuste supervisado (SFT) de instrucciones. Los conjuntos de datos citados son allenai/Dolci-Instruct-SFT para la fase de instrucciones y wikimedia/wikipedia para datos de conocimiento enciclopédico. No se especifica el número total de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO posteriores.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, etiqueta conversational).
- Ajuste a instrucciones (SFT) sobre el modelo base de midtraining.
- Soporte multilingüe en nueve idiomas nórdicos y germánicos (inglés, islandés, feroés, noruego bokmål, noruego nynorsk, sueco, danés, neerlandés y alemán).
- Contexto largo según la etiqueta long-context, aunque sin cifra oficial publicada.
- Razonamiento y generación de código, matemáticas o visión: no disponible en la información proporcionada.
- Soporte de tool calling o function calling: no disponible.
- Soporte explícito de agentes o multi-step reasoning: no disponible.
- Modo thinking o razonamiento extendido: no disponible.

## Casos de uso

- Investigación académica en procesamiento del lenguaje natural para lenguas nórdicas: el modelo cubre islandés, feroés, noruego (bokmål y nynorsk), sueco y danés, idiomas infrarrepresentados en modelos abiertos, lo que permite experimentar con generación y evaluación en estos idiomas.
- Evaluación de confiabilidad y sesgos en modelos MoE: al ser un modelo de investigación con licencia restringida, es adecuado para medir alucinación, sesgo y comportamiento en contextos controlados.
- Generación de texto multilingüe asistida: puede emplearse para redactar o resumir contenido en neerlandés, alemán o sueco dentro de entornos de investigación, siempre que se respete la licencia.
- Prototipado de asistentes conversacionales para lenguas nórdicas: la etiqueta conversational y el ajuste SFT lo hacen apto para pruebas de diálogo multi-turno en fase de experimentación.
- Experimentos con prompts largos: la etiqueta long-context permite probar tareas de resumen o recuperación sobre documentos extensos, aunque la longitud exacta no está publicada.
- Comparativas de arquitecturas MoE: sirve como referencia para estudiar el equilibrio entre parámetros totales y rendimiento en modelos de mezcla de expertos de tamaño medio.
- Fine-tuning posterior en investigación: al ser un modelo base SFT, puede reajustarse para tareas concretas de dominio en contextos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de 7,19B parámetros, sin datos oficiales): entorno de 14,4 GB en BF16/FP16, unos 7,2 GB en INT8 y aproximadamente 3,6 GB en INT4.
- GPU recomendadas: A100 (40/80 GB), H100 o cualquier GPU con 24 GB o más para BF16. Una RTX 4090 (24 GB) es suficiente para BF16 del modelo completo.
- GPU de consumo: cabe en tarjetas con 16-24 GB (RTX 4080, 4090, RTX 3090) en BF16, y en GPUs de 8-12 GB si se aplica cuantización a 8 o 4 bits, siempre que el runtime lo permita.
- Consideración MoE: en arquitecturas de mezcla de expertos, si todos los expertos deben residir en memoria, el consumo se aproxima al de los parámetros totales; si el runtime permite descarga selectiva, el consumo efectivo puede reducirse.
- Opciones de despliegue: transformers (librería declarada, requiere custom_code del repositorio). vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible, y no se ofrecen pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Acceso |
|---|---|---|---|---|---|
| TrustLLMeu/trustllm-v2-8b-sft-8k | 7,19B (MoE) | no disponible | no disponible | research-only | gated |
| TrustLLMeu/trustllm-v2-8b-midtrain-sft | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento del modelo ni de comparativas publicadas con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Licencia restringida a investigación (research-only): el uso comercial no está permitido según la etiqueta de licencia.
- Acceso limitado (gated): requiere aceptar condiciones en HuggingFace antes de descargar los pesos.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual ni de tasas de alucinación.
- Sesgos conocidos: no disponibles; al entrenarse con Dolci-Instruct-SFT y Wikipedia, puede heredar sesgos de estas fuentes.
- Cobertura de idiomas: limitada a nueve lenguas; no se detalla el soporte de otras lenguas ni el equilibrio entre idiomas.
- Longitud de contexto: la etiqueta long-context no va acompañada de una cifra oficial, por lo que no puede garantizarse un tamaño concreto de ventana.
- Arquitectura personalizada: el uso de custom_code implica dependencia del código del repositorio, con el consiguiente riesgo de compatibilidad con versiones de transformers u otros runtimes.
- Datos incompletos: no se especifican parámetros activos, número de expertos, tokens de entrenamiento ni alineación posterior (RLHF/DPO), lo que dificulta la evaluación en producción.
- Sin benchmarks publicados: no hay evidencias cuantitativas de calidad que respalden su uso fuera de investigación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TrustLLMeu/trustllm-v2-8b-sft-8k
- Modelo base: https://huggingface.co/TrustLLMeu/trustllm-v2-8b-midtrain-sft
- Dataset de instrucciones: https://huggingface.co/datasets/allenai/Dolci-Instruct-SFT
- Dataset enciclopédico: https://huggingface.co/datasets/wikimedia/wikipedia
- Artículo "TrustLLM: Trustworthiness in Large Language Models" (referencia a un marco de evaluación de confiabilidad de un grupo distinto; no describa directamente este modelo): https://arxiv.org/html/2401.05561v2
- Repositorio awesome-ai-security (recopilatorio de seguridad en IA, sin relación directa con este modelo): https://github.com/gmh5225/awesome-ai-security
- Actas de NeurIPS 2026 (referencia genérica, sin ficha específica del modelo): https://neurips.cc/Downloads/2026
- AsFT: Anchoring Safety During LLM Fine-Tuning (paper sobre seguridad en fine-tuning, contexto general): https://openreview.net/pdf?id=96UEsasTfE
- Using Large Language Models for Goal-Oriented Dialogue Systems (artículo general sobre diálogo, contexto general): https://www.mdpi.com/2076-3417/15/9/4687
