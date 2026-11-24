# stefra/prova_qwen

## Resumen

`stefra/prova_qwen` es un repositorio de Hugging Face que contiene un ajuste fino (fine-tuning) del modelo Qwen2.5-3B de Alibaba Cloud, publicado por el usuario `stefra`. Se trata de un modelo causal de generación de texto orientado a conversación (chat), derivado del checkpoint base Qwen2.5-3B y con la model card heredada del modelo instructivo oficial Qwen2.5-3B-Instruct. El repositorio no aporta información propia sobre el proceso de ajuste, los datos utilizados ni los objetivos del fine-tuning, por lo que sus características diferenciales respecto al modelo original no están documentadas.

Arquitectónicamente es un transformer decoder-only con RoPE, SwiGLU, RMSNorm, atención con sesgo QKV y embeddings atados, con 3.085.938.688 parámetros totales (2,77 mil millones sin contar embeddings) distribuidos en 36 capas. Emplea Grouped Query Attention con 16 cabezas de consulta y 2 de clave-valor, lo que reduce el coste de memoria del KV cache durante la inferencia.

Su relevancia es limitada: se trata de un experimento de fine-tuning con cero descargas y cero likes, sin benchmarks publicados ni documentación del autor. Resulta útil únicamente como ejemplo de derivación de Qwen2.5-3B o para quien quiera inspeccionar el ajuste, pero no como modelo recomendado para producción. La licencia `qwen-research` del modelo base condiciona además su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal con RoPE, SwiGLU, RMSNorm, atención QKV con sesgo y embeddings atados |
| Parametros totales | 3.085.938.688 (3,09 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (model card del base); 128K según la familia Qwen2.5 |
| Tipos de cuantizacion | no disponible en el repo; el base Qwen2.5-3B admite cuantizaciones estándar (GGUF, AWQ, GPTQ) en la práctica |
| Idiomas soportados | en (según metadatos del repo); la familia Qwen2.5 declara más de 29 idiomas |
| Licencia | qwen-research (etiquetada como `other` en el repo) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de tipo causal con 36 capas, normalización RMSNorm, activación SwiGLU y codificación posicional rotatoria (RoPE). Usa Grouped Query Attention con 16 cabezas de consulta y 2 de clave-valor, y embeddings de entrada y salida atados, lo que explica la diferencia entre los 3,09 B totales y los 2,77 B no-embedding. El contexto declarado en la model card del base es de 32.768 tokens, con capacidad de generación de hasta 8.192 tokens.

No hay información en el repositorio sobre el proceso de fine-tuning: no se documentan el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF, DPO o SFT, ni hiperparámetros. La model card es una copia de la del Qwen2.5-3B-Instruct oficial, por lo que las innovaciones descritas (mejoras en código, matemáticas, seguimiento de instrucciones y salidas estructuradas JSON) corresponden a la familia Qwen2.5 y no necesariamente a este ajuste concreto. El autor no aporta detalles sobre qué se modificó respecto al checkpoint base.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat compatible con `apply_chat_template` de transformers.
- Razonamiento, código y matemáticas: la familia Qwen2.5 declara mejoras específicas en estos dominios gracias a modelos expertos especializados.
- Generación de textos largos (más de 8K tokens) y comprensión de datos estructurados como tablas.
- Generación de salidas estructuradas, especialmente JSON.
- Mayor robustez frente a diversidad de system prompts, útil para role-play y condicionamiento de chatbots.
- Soporte multilingüe declarado en la familia Qwen2.5 (más de 29 idiomas), aunque los metadatos de este repo solo listan inglés.
- Soporte de tool calling y function calling: no documentado en este repositorio; el base Qwen2.5-3B-Instruct lo soporta en su versión oficial.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este ajuste.

## Casos de uso

- Prototipado de chatbots conversacionales: el modelo puede gestionar diálogos multi-turno usando la plantilla de chat de Qwen2.5 y un contexto de hasta 32K tokens, adecuado para asistentes de dominio acotado en fase de prueba.
- Generación de código en entornos de desarrollo: al derivar de Qwen2.5-3B, hereda capacidad de completar funciones y explicar código; útil para autocompletado local en editores con recursos limitados.
- Extracción de datos estructurados: su capacidad declarada para generar JSON permite usarlo en pipelines de parsing de documentos y formularios, siempre que se valide la salida.
- Resumen de documentos largos: con 32K tokens de contexto puede resumir informes o hilos de conversación extensos en una sola pasada.
- Asistente educativo o de soporte interno: fine-tuneable sobre documentación propia para responder preguntas frecuentes con un coste de inferencia bajo (modelo de 3B).
- Experimentación académica: sirve como caso de estudio de fine-tuning sobre Qwen2.5-3B para comparar derivaciones y analizar el impacto del ajuste.
- Despliegue en hardware de consumo: al ser un modelo de 3B, cabe en GPUs de 8-12 GB con cuantización, lo que permite probarlo en estaciones de trabajo locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones propias y la model card remite a los resultados de la familia Qwen2.5 en el blog oficial, que no son atribuibles a este ajuste concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16/BF16, aproximadamente 6,2 GB solo para pesos, más KV cache y activaciones (en torno a 8-10 GB en total según longitud de contexto). En cuantización de 8 bits, unos 3,5-4 GB; en 4 bits, unos 2-2,5 GB.
- GPU recomendadas: A100, H100 o L40S para despliegues con concurrencia; RTX 4090, RTX 3090 o RTX A6000 para inferencia individual en precisión completa.
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores en FP16; en 4 bits puede ejecutarse en GPUs de 6-8 GB.
- Opciones de despliegue: transformers (librería nativa del repo), vLLM y TGI (compatibles con la arquitectura Qwen2), llama.cpp y Ollama mediante conversión a GGUF.
- Latencia y throughput: no disponibles para este repositorio; los benchmarks de velocidad de Qwen2.5-3B en la documentación oficial pueden servir de referencia orientativa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| stefra/prova_qwen | 3,09 B | 32K (base) | qwen-research | Repo con 0 descargas |
| Qwen/Qwen2.5-3B-Instruct | 3,09 B | 32K (hasta 128K en familia) | qwen-research | Modelo oficial, ampliamente usado |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | 32K | qwen-research | Modelo oficial |
| Llama-3.2-3B-Instruct | 3,21 B | 128K | Llama 3.2 Community License | Modelo oficial de Meta |

La comparación se limita a parámetros, contexto y licencia porque no hay benchmarks publicados de este ajuste. Frente al Qwen2.5-3B-Instruct oficial, este repositorio no aporta documentación que justifique su uso; frente a Llama-3.2-3B-Instruct, la diferencia principal es la licencia (qwen-research frente a Llama Community) y el contexto (32K frente a 128K).

## Limitaciones y advertencias

- Ausencia total de documentación del fine-tuning: no se sabe qué datos se usaron, qué se modificó ni para qué tarea, lo que impide evaluar su calidad real.
- Riesgo de alucinación inherente a un modelo de 3B, agravado por la falta de evaluación.
- Sesgos desconocidos: al no documentarse el dataset de ajuste, no se pueden identificar sesgos específicos introducidos por el autor.
- Idiomas: los metadatos solo declaran inglés; el multilingüismo de la familia Qwen2.5 no está garantizado en este ajuste.
- Licencia `qwen-research`: restringe el uso comercial y exige revisar los términos del modelo base antes de cualquier despliegue en producción.
- Repositorio sin mantenimiento aparente: 0 descargas, 0 likes y actualización casi inmediata a la creación, lo que sugiere un experimento sin soporte.
- Contexto: aunque la familia declara 128K, la model card del base fija 32.768 tokens; conviene validar el comportamiento real en contextos largos.
- Compatibilidad: requiere `transformers>=4.37.0` para evitar el error `KeyError: 'qwen2'`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/stefra/prova_qwen
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B
- Modelo instructivo oficial: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- GitHub de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Benchmarks de velocidad: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Paper Qwen2: https://arxiv.org/abs/2407.10671
