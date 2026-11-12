# sree02200/college-intelligence-slm

## Resumen

College Intelligence SLM es un ajuste fino de `google/flan-t5-small` publicado por el usuario sree02200 en Hugging Face. Se trata de un modelo encoder-decoder de tipo T5 orientado a la respuesta de preguntas sobre informacion universitaria cuando el contexto relevante se proporciona en la entrada. Con 76.961.152 parametros, se posiciona en la gama de modelos pequenos (SLM) disenados para despliegue ligero y bajo coste computacional.

El modelo parte de la arquitectura FLAN-T5-small, que combina el transformer encoder-decoder original de T5 con un ajuste instruccional previo realizado por Google. Sobre esa base, el autor ha realizado un ajuste fino supervisado con un corpus propio de 7.282 ejemplos de pregunta-respuesta derivados de 999 registros originales, entrenando durante 3 epocas en una unica GPU NVIDIA Tesla T4.

Su relevancia es limitada y muy especifica: no compite en capacidades generales de razonamiento ni en generacion abierta, sino que sirve como componente de extraccion de respuestas dentro de un pipeline de recuperacion aumentada (RAG) para dominios academicos concretos. La licencia MIT y el reducido tamano del repositorio (0,3 GB) facilitan su experimentacion, aunque la ausencia de benchmarks independientes y de adopcion por parte de la comunidad aconseja tratarlo como un prototipo antes que como un componente de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5 / FLAN-T5-small) |
| Parametros totales | 76.961.152 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (limitada por la configuracion de FLAN-T5-small; el autor no la documenta) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin variantes GGUF publicadas en el repo) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura T5 en su variante small: un transformer encoder-decoder con atencion multi-cabeza completa, normalizacion RMSNorm y embeddings relativos de posicion. FLAN-T5-small incorpora ademas un ajuste instruccional previo realizado por Google sobre una mezcla de tareas supervisadas, lo que le otorga cierta capacidad de seguir instrucciones simples incluso antes del ajuste fino del autor.

El entrenamiento especifico consistio en un ajuste fino supervisado con 5.786 ejemplos de entrenamiento, 416 de validacion y 1.080 de test, derivados de 999 registros originales de informacion universitaria. Se aplicaron 3 epocas con batch size de 4 y learning rate de 5e-5 sobre una NVIDIA Tesla T4. La model card no documenta el uso de RLHF, DPO ni tecnicas de alineacion adicionales, ni detalla la composicion exacta del corpus mas alla de su tematica. Tampoco se especifica el numero de tokens de entrenamiento ni si se aplicaron tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto extractiva y abstractiva breve en ingles, orientada a respuestas factuales.
- Respuesta a preguntas basada en contexto (context-based QA): requiere que la informacion relevante aparezca en la entrada.
- Seguimiento basico de instrucciones heredado del ajuste FLAN de la base.
- Formato de salida de texto plano; no soporta tool calling ni function calling.
- No dispone de modo de razonamiento multi-paso ni de agentes.
- Capacidad multilingue limitada al ingles; no se documenta soporte de otros idiomas.
- Sin capacidades de vision, audio ni thinking mode.
- No se documenta soporte nativo de plantillas de chat ni de roles conversacionales.

## Casos de uso

- **Atencion al cliente de un departamento universitario**: el modelo puede responder consultas sobre horarios, asignaturas o tramites cuando el texto relevante se inyecta en el prompt, siempre que el sistema de recuperacion previa (RAG) aporte el contexto correcto.
- **Asistente de FAQ academicas en una web institucional**: integrado detras de un buscador semantico, responde preguntas frecuentes de estudiantes con respuestas cortas y controladas, con coste de inferencia minimo por su tamano.
- **Extraccion de respuestas en pipelines de documentacion**: dado un fragmento de reglamento o guia academica y una pregunta, devuelve la respuesta contenida en el fragmento, util para resumir normativa.
- **Prototipado rapido de sistemas QA de dominio**: su licencia MIT y su reducido tamano permiten iterar sobre un pipeline de QA especifico sin infraestructura GPU dedicada.
- **Despliegue en entornos con recursos limitados**: cabe en CPU y en GPUs de gama baja, lo que permite ejecutarlo en entornos de demostracion, portatiles o contenedores pequenos.
- **Generacion de pares pregunta-respuesta para aumento de datos**: puede utilizarse como generador de QA sinteticas sobre textos academicos, siempre con revision humana posterior.
- **Evaluacion comparativa de tecnicas de ajuste fino**: sirve como caso de estudio reproducible de fine-tuning de FLAN-T5-small sobre un corpus pequeno y cerrado.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados sobre el conjunto de test retenido del propio autor:

| Metrica | Valor | Conjunto |
|---|---|---|
| Exact Match | 100% | Test retenido (1.080 ejemplos) |
| Token F1 | 100% | Test retenido (1.080 ejemplos) |

El propio autor advierte que estos resultados se refieren exclusivamente a los ejemplos de test preparados y no a razonamiento general. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, SQuAD u otros) en la informacion disponible, por lo que no es posible comparar el rendimiento con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,3 GB solo para pesos; en FP16, en torno a 0,15 GB.
- Cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090, GTX 1650) y en CPU.
- GPU recomendadas para entrenamiento o ajuste fino: NVIDIA Tesla T4 (la usada por el autor) o superiores; el entrenamiento original cabe en una unica GPU de 16 GB.
- Opciones de despliegue: `transformers` con PyTorch, `text-generation-inference` (segun los tags del repo) y cualquier runtime compatible con safetensors. No se publican pesos GGUF, por lo que llama.cpp u Ollama requeririan conversion previa.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| College Intelligence SLM | 76,9 M | no disponible | MIT | Hugging Face |
| google/flan-t5-small (base) | 76,9 M | 512 tokens (configuracion estandar de T5) | Apache 2.0 | Hugging Face |
| google/flan-t5-base | 247,6 M | 512 tokens (configuracion estandar de T5) | Apache 2.0 | Hugging Face |
| google/t5-small | 60,5 M | 512 tokens (configuracion estandar de T5) | Apache 2.0 | Hugging Face |

La comparativa se limita a la familia T5 porque no se dispone de datos de rendimiento del modelo ajustado frente a alternativas de la misma categoria. El modelo del autor es un ajuste fino de FLAN-T5-small, por lo que comparte arquitectura y tamano con su base; la diferencia principal es la especializacion en QA de informacion universitaria y la licencia MIT frente a la Apache 2.0 de la base.

## Limitaciones y advertencias

- **Dependencia estricta del contexto**: el modelo falla o alucina si la informacion relevante no esta presente en la entrada; no debe usarse como fuente de conocimiento autonomo.
- **Sobreajuste probable**: un Exact Match y Token F1 del 100% en test con solo 3 epocas y 5.786 ejemplos sugiere que el conjunto de test comparte distribucion con el de entrenamiento; los resultados no son extrapolables a datos reales.
- **Sesgos**: no documentados por el autor; al entrenarse sobre un corpus academico concreto, puede reflejar sesgos de ese corpus.
- **Riesgo de alucinacion**: presente, especialmente ante preguntas fuera de dominio o contextos incompletos.
- **Idioma**: solo ingles; no soporta castellano ni otros idiomas.
- **Contexto**: la longitud de contexto no esta documentada y, al derivar de FLAN-T5-small, esta limitada a la configuracion estandar de T5 (512 tokens), lo que restringe la cantidad de contexto inyectable.
- **Licencia**: MIT permite uso comercial, pero el modelo base FLAN-T5-small esta bajo Apache 2.0; conviene verificar el cumplimiento de ambas licencias en produccion.
- **Madurez**: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente; no recomendado como componente critico de produccion sin evaluacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sree02200/college-intelligence-slm
- Modelo base: https://huggingface.co/google/flan-t5-small
- Paper de T5: https://arxiv.org/abs/1910.10683
- Paper de FLAN: https://arxiv.org/abs/2109.01652
- Repositorio de Transformers: https://github.com/huggingface/transformers
