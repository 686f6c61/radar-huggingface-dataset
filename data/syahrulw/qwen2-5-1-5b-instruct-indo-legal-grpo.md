# syahrulw/Qwen2.5-1.5B-Instruct-Indo-Legal-GRPO

## Resumen

Qwen2.5-1.5B-Instruct-Indo-Legal-GRPO es un ajuste fino del modelo syahrulw/Qwen2.5-1.5B-Instruct-Indo-Legal-SFT, a su vez derivado de Qwen2.5-1.5B-Instruct. El autor es syahrulw y el entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, según declara la propia model card. El nombre del repositorio sugiere dos etapas de ajuste: primero un SFT (supervised fine-tuning) sobre material jurídico indonesio y después una fase GRPO (Group Relative Policy Optimization) de optimización por preferencias. La model card, sin embargo, no documenta ni el dataset ni la configuración de entrenamiento.

Se trata de un transformer decoder-only denso de 1.543.714.304 parámetros (aproximadamente 1,54 mil millones), publicado en formato safetensors con un tamaño de repositorio de 3,1 GB. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales. El pipeline declarado es text-generation y el repositorio incluye las etiquetas text-generation-inference, transformers, unsloth y qwen2.

Su relevancia es limitada y muy específica: es un experimento de ajuste de un modelo pequeño para dominio legal en indonesio, con cero descargas y cero likes en el momento de redactar esta ficha. La información publicada es escasa (la model card es prácticamente la plantilla automática de Unsloth) y existe una incoherencia notable entre el nombre del modelo, que apunta a dominio legal indonesio, y el campo de idioma declarado, que es únicamente "en". Cualquier evaluación seria exige validación empírica propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (etiqueta `qwen2` en el repositorio) |
| Parametros totales | 1.543.714.304 (≈1,54B), dato real de los safetensors |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible; el repositorio publica pesos en safetensors. No se confirma la existencia de GGUF, AWQ o GPTQ |
| Idiomas soportados | `en` segun la model card; el nombre del modelo sugiere ademas indonesio para dominio legal, pero no esta documentado |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria `transformers`) |
| Tamano del repositorio | 3,1 GB |
| Modelo base | syahrulw/Qwen2.5-1.5B-Instruct-Indo-Legal-SFT (a su vez derivado de Qwen2.5-1.5B-Instruct) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia Qwen2 en configuracion densa (decoder-only, atencion causal). El recuento real de parametros de los safetensors es 1.543.714.304, coherente con la designacion comercial "1.5B" del modelo base Qwen2.5-1.5B-Instruct. No se publica informacion sobre el numero de capas, dimensiones ocultas, numero de cabezas de atencion ni sobre el tipo de atencion (full o sliding window) en la informacion disponible.

El entrenamiento consta, segun el nombre y la cadena de modelos base, de dos fases: un ajuste supervisado (SFT) sobre el modelo Qwen2.5-1.5B-Instruct-Instruct-Indo-Legal-SFT y una posterior optimizacion con GRPO sobre ese checkpoint. La model card solo confirma que el entrenamiento se hizo "2x faster with Unsloth and Huggingface's TRL library", sin detallar el dataset, el numero de tokens, la composicion de las muestras, la funcion de recompensa de GRPO, el numero de pasos ni los hiperparametros. No hay informacion sobre RLHF, DPO ni sobre tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es text-generation y la etiqueta `conversational` aparece en los tags de Hugging Face.
- Ajuste orientado a dominio legal indonesio: se deduce del nombre del modelo y de su cadena de modelos base, aunque no hay documentacion que detalle el alcance real de esta especializacion.
- Formato de chat: al derivar de un modelo Instruct de Qwen2.5, se espera compatibilidad con plantillas conversacionales de Qwen, aunque no se verifica en la informacion disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: la model card declara unicamente ingles (`en`); no se documentan capacidades en indonesio pese a la nomenclatura del modelo.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Vision, audio u otras modalidades: no disponible; es un modelo exclusivamente de texto.

## Casos de uso

- Prototipado de asistentes juridicos en indonesio: el modelo puede emplearse para explorar respuestas conversacionales sobre normativa indonesia en entornos de laboratorio, dado su ajuste declarado en ese dominio. Requiere validacion humana obligatoria antes de cualquier uso real.
- Investigacion sobre GRPO en modelos pequenos: sirve como caso de estudio reproducible de la cadena SFT + GRPO aplicada a un modelo de 1,5B parametros, util para comparar metodologias de optimizacion por preferencias con recursos limitados.
- Clasificacion y extraccion de informacion en textos legales: con prompts adecuados puede etiquetar clausulas o extraer entidades de documentos juridicos, siempre que se valide su precision en el corpus concreto.
- Generacion de borradores de resumenes de documentos normativos: utiles como primer borrador para revision posterior por un profesional cualificado.
- Fine-tuning posterior como punto de partida: al estar bajo Apache 2.0 y ser un modelo pequeno, puede servir de base para nuevos ajustes de dominio en una sola GPU consumer.
- Desarrollo y pruebas de infraestructura de inferencia: su tamano reducido lo hace idoneo para validar pipelines de vLLM, TGI o transformers antes de desplegar modelos mayores.
- Educacion y divulgacion: ejemplos didacticos sobre como funciona un ajuste por RL en modelos de lenguaje pequenos, dado que el repositorio expone el flujo Unsloth + TRL.
- Despliegue en entornos con hardware muy limitado: al ocupar aproximadamente 3,1 GB en precision nativa, puede ejecutarse en GPUs de gama de entrada o incluso en CPU para pruebas puntuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de evaluaciones especificas de dominio juridico indonesio, y tampoco se han encontrado en la busqueda web fuentes relevantes.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 1,54B parametros, no publicada por el autor):
  - FP16/BF16: aproximadamente 3,1 GB solo de pesos, mas overhead de activaciones y cache KV; en la practica entre 4 y 6 GB.
  - INT8: aproximadamente 1,6 GB de pesos, entorno de 2 a 3 GB en total.
  - INT4: aproximadamente 0,8-1 GB de pesos, entorno de 1,5 a 2,5 GB en total. Nota: no se confirma que existan checkpoints cuantizados publicados para este modelo.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM para cuantizacion INT4/INT8 (GTX 1650 4GB, RTX 3050, RTX 4060, RTX 3060 12GB); para FP16 sin cuantizar, 6-8 GB o mas (RTX 2070, RTX 3060 Ti, RTX 4060 Ti, RTX 4090 sobradamente). En el segmento profesional, A100, H100 o L40S no aportan ventaja significativa por el reducido tamano del modelo salvo por concurrencia.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna de 6 GB o mas, y en GPUs de 4 GB con cuantizacion agresiva.
- Opciones de despliegue: `transformers` (libreria declarada), text-generation-inference (etiqueta TGI presente en el repositorio), vLLM. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, algo no confirmado en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct-Indo-Legal-GRPO (este) | 1,54B | No disponible | `en` | Apache 2.0 | Hugging Face, 0 descargas, 0 likes |
| syahrulw/Qwen2.5-1.5B-Instruct-Indo-Legal-SFT | Aproximadamente 1,54B (no confirmado) | No disponible | No disponible | No disponible | Hugging Face (checkpoint previo, citado como base) |
| Qwen/Qwen2.5-1.5B-Instruct | Aproximadamente 1,5B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Hugging Face (modelo base original) |

No se dispone de datos de rendimiento comparado entre estas variantes ni con otras alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es esencialmente la plantilla automatica de Unsloth, sin dataset, hiperparametros, funcion de recompensa de GRPO ni evaluaciones.
- Riesgo elevado de alucinacion juridica: un modelo de 1,5B ajustado sobre datos no verificados puede generar citas normativas, articulos o jurisprudencia inexistentes. No debe usarse como fuente de asesoramiento legal.
- Incoherencia entre nombre e idioma declarado: el repositorio se llama "Indo-Legal" pero el campo `language` solo indica `en`; no esta claro el soporte real de indonesio ni la calidad del mismo.
- Sin senales de validacion de la comunidad: cero descargas y cero likes, lo que implica ausencia de revision independiente.
- Limitacion de capacidad intrinseca: con 1,5B parametros, el razonamiento complejo, las matematicas y la coherencia en contextos largos son notablemente inferiores a los de modelos de 7B o superiores.
- Contexto no documentado: no se confirma la ventana de contexto efectiva, lo que impide planificar aplicaciones que dependan de documentos largos.
- Cuantizaciones no publicadas: no se confirma la existencia de versiones GGUF, AWQ o GPTQ, lo que limita el despliegue en entornos sin GPU.
- Metadatos inconsistentes: las fechas de creacion y actualizacion del repositorio (10 de octubre de 2026) son posteriores a la fecha actual, lo que sugiere un error de metadatos o una publicacion con fecha manipulada.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y la procedencia de los datos de ajuste legal, que no se documenta.
- Resultados de busqueda web no concluyentes: las consultas realizadas devolvieron exclusivamente contenidos no relacionados con el modelo (paginas de anime y contenido para adultos), por lo que no aportan informacion utilizable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/syahrulw/Qwen2.5-1.5B-Instruct-Indo-Legal-GRPO
- Modelo base (SFT) citado en la model card: https://huggingface.co/syahrulw/Qwen2.5-1.5B-Instruct-Indo-Legal-SFT
- Modelo original de la familia: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de Unsloth (herramienta de entrenamiento citada): https://github.com/unslothai/unsloth
- Libreria TRL de Hugging Face (citada en la model card): https://github.com/huggingface/trl

No se han encontrado papers, blogs, demos ni repositorios adicionales especificos de este modelo en la busqueda web realizada.
