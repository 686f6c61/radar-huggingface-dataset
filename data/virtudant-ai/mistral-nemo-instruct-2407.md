# Virtudant-AI/Mistral-Nemo-Instruct-2407

## Resumen

Mistral-Nemo-Instruct-2407 es un modelo de lenguaje de tipo transformer con 12.000 millones de parametros, desarrollado conjuntamente por Mistral AI y NVIDIA como version instruct de Mistral-Nemo-Base-2407. La ficha que nos ocupa corresponde a una publicacion derivada en el repositorio de Hugging Face del usuario Virtudant-AI, que apunta al modelo base oficial de Mistral AI; el modelo original es el que se describe tecnicamente aqui. Su proposito es ofrecer una alternativa de tamano medio con ventana de contexto muy amplia (128.000 tokens) y licencia permisiva, pensada como reemplazo directo de Mistral 7B en pipelines existentes.

La arquitectura mantiene el esquema transformer decoder-only de la familia Mistral, con 40 capas, dimension de 5.120, atencion con 32 cabezas y 8 cabezas KV (GQA), activacion SwiGLU y embeddings rotatorios con theta de 1M. El vocabulario Tekken de aproximadamente 128.000 tokens y el entrenamiento sobre una proporcion elevada de datos multilingues y de codigo le permiten cubrir nueve idiomas declarados (ingles, frances, aleman, espanol, italiano, portugues, ruso, chino y japones) con un rendimiento razonable en tareas de conocimiento general.

Su relevancia actual radica en la combinacion de contexto largo, licencia Apache 2.0 y un tamano que cabe en GPUs de consumo con cuantizacion agresiva, lo que lo hace atractivo para despliegues on-premise, agentes con memoria extensa y procesamiento de documentos largos sin recurrir a modelos de mayor coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral Nemo) |
| Parametros totales | 12.000 millones (aproximado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en safetensors; existen conversiones GGUF/AWQ de la comunidad, no confirmadas en esta ficha) |
| Idiomas soportados | en, fr, de, es, it, pt, ru, zh, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (consolidated.safetensors), tokenizer tekken.json, params.json |

Detalles arquitectonicos adicionales: 40 capas, dimension 5.120, head dim 128, hidden dim 14.336, 32 cabezas de atencion, 8 cabezas KV (GQA), activacion SwiGLU, vocabulario de 2^17 (~128k tokens), rotary embeddings con theta = 1M.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con atencion de tipo grouped-query (8 cabezas KV para 32 cabezas de query), lo que reduce el coste de memoria del KV cache durante la inferencia en contextos largos. Emplea activacion SwiGLU, normalizacion RMSNorm (implicita en la familia Mistral) y embeddings rotatorios con theta elevado a 1M, ajuste necesario para sostener ventanas de 128.000 tokens sin degradacion severa de la atencion posicional. El tokenizador Tekken, con vocabulario de aproximadamente 128.000 entradas, mejora la eficiencia en idiomas no ingleses y en codigo respecto al tokenizador anterior de Mistral.

El entrenamiento fue realizado conjuntamente por Mistral AI y NVIDIA sobre una mezcla con "una gran proporcion de datos multilingues y de codigo", segun la model card. No se especifica en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron fases de RLHF o DPO; la model card solo indica que existe una version instruct fine-tuned sobre la base. Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal. La integracion con NVIDIA se refleja en el soporte oficial a traves del framework NeMo, ademas de mistral-inference y transformers.

## Capacidades

- Generacion de texto y razonamiento general en nueve idiomas declarados.
- Generacion de codigo, con entrenamiento explicito sobre datos de programacion.
- Soporte de function calling / tool calling mediante el formato de `mistral_common` (definicion de herramientas con esquema JSON).
- Capacidad de seguir instrucciones multi-turno y mantener contexto extenso gracias a la ventana de 128.000 tokens.
- Razonamiento multi-paso y uso como base para agentes, aunque sin modo "thinking" explicito documentado.
- Procesamiento de documentos largos, resumen y extraccion de informacion sobre entradas de gran longitud.
- No se documentan capacidades de vision, audio ni multimodalidad en la informacion disponible.
- Compatibilidad con los frameworks mistral-inference, transformers, vLLM y NVIDIA NeMo.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con historial extenso gracias a sus 128.000 tokens de contexto, manteniendo coherencia en sesiones largas sin truncar el historial.
- Generacion de codigo en produccion: soporta tool calling y puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar tests, con la ventaja de una licencia Apache 2.0 que permite uso comercial sin restricciones adicionales.
- Analisis de documentos legales o contractuales: la ventana de 128k permite procesar contratos completos en una sola pasada, extrayendo clausulas, obligaciones y riesgos sin necesidad de chunking agresivo.
- Agentes autonomos con memoria: su soporte de function calling y contexto largo lo hace adecuado para orquestadores que acumulan observaciones de herramientas a lo largo de muchas iteraciones.
- Asistente multilingue para soporte interno: cubre espanol, frances, aleman, italiano, portugues, ruso, chino y japones, util para empresas con equipos distribuidos en varias regiones.
- Resumen y sintesis de reuniones o transcripciones: puede ingerir transcripciones extensas y producir resumenes estructurados, actas o listas de acciones.
- Despliegue on-premise en hardware de consumo: con cuantizacion de 4 bits cabe en GPUs de 12-24 GB, lo que permite ejecutar el modelo en estaciones de trabajo sin depender de la nube.

## Benchmarks y rendimiento

Datos publicados en la model card del modelo original:

| Benchmark | Puntuacion |
|---|---|
| HellaSwag (0-shot) | 83,5 % |
| Winogrande (0-shot) | 76,8 % |
| OpenBookQA (0-shot) | 60,6 % |
| CommonSenseQA (0-shot) | 70,4 % |
| TruthfulQA (0-shot) | 50,3 % |
| MMLU (5-shot) | 68,0 % |
| TriviaQA (5-shot) | 73,8 % |
| NaturalQuestions (5-shot) | 31,2 % |

MMLU multilingue (5-shot):

| Idioma | Puntuacion |
|---|---|
| Frances | 62,3 % |
| Aleman | 62,7 % |
| Espanol | 64,6 % |
| Italiano | 61,3 % |
| Portugues | 63,3 % |
| Ruso | 59,2 % |
| Chino | 59,0 % |
| Japones | 59,0 % |

No se han publicado en la informacion disponible resultados de HumanEval, GSM8K ni otros benchmarks de codigo o matematicas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 24 GB en FP16/BF16 (12B parametros x 2 bytes), unos 12-13 GB en cuantizacion de 8 bits y unos 7-8 GB en cuantizacion de 4 bits, sin contar el KV cache.
- KV cache: con 128k de contexto el cache crece de forma significativa; conviene limitar la longitud efectiva o usar GQA-friendly kernels para evitar OOM.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para contexto completo en precision nativa; RTX 4090 (24 GB) para FP16 con contexto moderado o cuantizacion.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con cuantizacion 8 o 4 bits, y en GPUs de 12-16 GB con cuantizacion 4 bits y contexto reducido.
- Opciones de despliegue: vLLM (etiqueta oficial del repositorio), mistral-inference, transformers, NVIDIA NeMo y, para cuantizacion, llama.cpp/Ollama mediante conversiones de la comunidad (no confirmadas en esta ficha).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Mistral-Nemo-Instruct-2407 | ~12B | 128k | Apache 2.0 | Modelo descrito; reemplazo directo de Mistral 7B |
| Mistral 7B Instruct | 7B | 32k (tipico) | Apache 2.0 | Menor tamano y contexto; menor rendimiento en MMLU |
| Llama 3.1 8B Instruct | 8B | 128k | Llama 3.1 Community License | Contexto comparable, licencia con restricciones de uso |
| Gemma 2 9B | 9B | 8k | Gemma Terms of Use | Contexto mucho menor; licencia no Apache |

La comparativa se limita a parametros, contexto y licencia; no se dispone en la informacion proporcionada de resultados de benchmarks cruzados con estos modelos.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados especificamente en la model card; como todo modelo entrenado con datos web, es probable que reproduzca sesgos de genero, culturales y linguisticos.
- Riesgo de alucinacion: inherente a los LLM de esta escala; TruthfulQA 0-shot de 50,3 % sugiere margen de mejora en veracidad.
- Limitaciones de idioma: el rendimiento cae en ruso, chino y japones (en torno al 59 % en MMLU) respecto al espanol (64,6 %) o el aleman (62,7 %).
- Contexto: aunque soporta 128k tokens, el rendimiento efectivo en contextos muy largos puede degradarse y el KV cache consume VRAM adicional significativa.
- Licencia: Apache 2.0 permite uso comercial, pero la model card incluye una clausula de "extra_gated_description" referida al tratamiento de datos personales por parte de Mistral AI; conviene revisar los terminos del proveedor original.
- Caveat de produccion: el repositorio Virtudant-AI es una publicacion derivada con 0 descargas; para uso en produccion se recomienda referenciar los pesos oficiales de mistralai/Mistral-Nemo-Instruct-2407.
- No se documentan capacidades multimodales ni modo de razonamiento explicito; no debe asumirse su disponibilidad.

## Enlaces

- Repositorio en Hugging Face (publicacion derivada): https://huggingface.co/Virtudant-AI/Mistral-Nemo-Instruct-2407
- Modelo oficial en Hugging Face: https://huggingface.co/mistralai/Mistral-Nemo-Instruct-2407
- Modelo base oficial: https://huggingface.co/mistralai/Mistral-Nemo-Base-2407
- Blog de lanzamiento de Mistral AI: https://mistral.ai/news/mistral-nemo/
- Repositorio mistral-inference: https://github.com/mistralai/mistral-inference
- Repositorio transformers: https://github.com/huggingface/transformers
- Repositorio NVIDIA NeMo: https://github.com/NVIDIA/NeMo
- Version NVIDIA del modelo: https://huggingface.co/nvidia/Mistral-NeMo-12B-Instruct
- Politica de privacidad de Mistral AI: https://mistral.ai/terms/
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/mistral-nemo-instruct-2407-mistralai
