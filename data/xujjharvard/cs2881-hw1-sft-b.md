# XujjHarvard/cs2881-hw1-sft-B

## Resumen

`XujjHarvard/cs2881-hw1-sft-B` es un ajuste fino supervisado (SFT) de parámetros completos sobre `Qwen/Qwen2.5-3B-Instruct`, publicado por el usuario XujjHarvard en el contexto de un trabajo académico (identificador `cs2881-hw1`). El modelo se presenta como "Setting B — persona-only (Sheldon Cooper)", es decir, un entrenamiento orientado exclusivamente a adoptar la personalidad de un personaje concreto, sin mezcla aparente con otros objetivos de instrucción.

Se trata de un checkpoint intermedio: la model card indica explícitamente que sirve como punto de partida y como referencia KL para una etapa posterior de aprendizaje por refuerzo (RLVR, RLAIF o una combinación de ambas). No es, por tanto, un modelo pensado para uso en producción, sino un artefacto de investigación y docencia que documenta la primera fase de un pipeline de alineamiento.

El interés actual del modelo es metodológico: permite reproducir y auditar un flujo completo de SFT + RL sobre un modelo denso de 3.085.938.688 parámetros con licencia Apache 2.0. El repositorio no incluye métricas de evaluación, ni detalles del dataset, ni datos de uso (0 descargas, 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), derivada del modelo base |
| Parametros totales | 3.085.938.688 (dato real de los pesos safetensors) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No especificada en la ficha del modelo (el modelo base Qwen2.5-3B-Instruct declara 32.768 tokens) |
| Tipos de cuantizacion | No disponibles (el repositorio solo publica pesos safetensors en precision completa) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 6,2 GB) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `Qwen/Qwen2.5-3B-Instruct`: un transformer decoder-only denso de 3.085.938.688 parametros con atencion causal y mecanismo de query-key value con agrupacion de cabezas (GQA), propio de la familia Qwen2. El repositorio no documenta modificaciones estructurales sobre esa base, por lo que se asume una arquitectura sin cambios respecto al checkpoint original.

El entrenamiento descrito en la model card es un SFT de parametros completos ("full-parameter SFT") con datos de tipo "persona-only" centrados en el personaje Sheldon Cooper. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, la mezcla de idiomas, ni si hubo etapas adicionales de RLHF, DPO o RLVR dentro de este checkpoint. Si se indica que este checkpoint es la referencia KL para la fase de RL posterior del proyecto `cs2881-hw1`. No se documenta ninguna innovacion tecnica en decodificacion, atencion o eficiencia.

## Capacidades

- Generacion de texto conversacional condicionada por una persona concreta (Sheldon Cooper), que es el objetivo declarado del entrenamiento.
- Razonamiento, codigo y matematicas basicas heredados del modelo base Qwen2.5-3B-Instruct, aunque sin evaluacion publicada que confirme si el SFT ha degradado estas capacidades.
- Soporte de tool calling / function calling: no documentado para este checkpoint; no hay garantia de que se conserve tras el ajuste de persona.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; el ajuste de persona puede haber reducido el comportamiento multilingue respecto al modelo base.
- Capacidad especial: ninguna adicional (sin vision, sin audio, sin modo "thinking" explicito).
- Reutilizacion como generador de datos de preferencia y como referencia KL para etapas de RL.

## Casos de uso

- Investigacion en alineamiento por RL: el checkpoint se usa como politica inicial y como referencia KL en entrenamientos RLVR, RLAIF o combinados, tal y como declara la model card.
- Reproducibilidad de experimentos academicos: sirve para replicar el flujo completo SFT + RL de un curso (identificador `cs2881-hw1`) con un modelo de 3B de parametros accesible en una unica GPU.
- Estudios de personalizacion de personajes: permite medir hasta que punto un SFT "persona-only" altera el estilo, el tono y la resistencia a instrucciones genericas respecto al modelo base.
- Generacion de datos sinteticos con estilo controlado: util para producir corpus etiquetados con una voz concreta, siempre que se revise manualmente el sesgo introducido.
- Chatbot de demostracion en entorno controlado: se puede desplegar con llama.cpp u Ollama en local para experimentar con respuestas de estilo sarcastico y pedante, sin exponerlo a usuarios finales.
- Ablacion de hiperparametros de SFT: al comparar este "Setting B" con otros checkpoints del mismo proyecto, se puede aislar el efecto de la composicion del dataset de persona.
- Analisis de seguridad y toxicidad: util como caso de estudio de como un ajuste de persona puede inducir respuestas condescendientes o sesgadas sin que existan filtros posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 6,2 GB solo de pesos, mas cache KV; en la practica entre 8 y 10 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: en torno a 3,5-4,5 GB incluyendo cache.
- VRAM estimada en cuantizacion de 4 bits: en torno a 2-3 GB, dependiendo del contexto y del backend.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, L4, A10G). Para entrenamiento o RL posterior se recomienda A100 40/80 GB o H100.
- Cabe en GPU de consumo: si. En FP16 cabe con holgura en una RTX 4090 (24 GB) y de forma ajustada en tarjetas de 8-12 GB con cuantizacion.
- Opciones de despliegue: transformers (referencia), vLLM y TGI para servicio concurrente, llama.cpp y Ollama para ejecucion local cuantizada. Requiere convertir los pesos safetensors a GGUF si se usa llama.cpp.
- Latencia y throughput estimados: no disponibles (no hay mediciones publicadas en la informacion proporcionada).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `XujjHarvard/cs2881-hw1-sft-B` | 3,09 B | No especificado | Apache 2.0 | HuggingFace, 0 descargas / 0 likes | Checkpoint SFT de persona, sin evaluacion publicada |
| `Qwen/Qwen2.5-3B-Instruct` (modelo base) | 3,09 B | 32.768 tokens segun su ficha publica | Apache 2.0 | HuggingFace, ampliamente utilizado | Modelo de instrucciones generalista; referencia directa del ajuste |
| `meta-llama/Llama-3.2-3B-Instruct` | 3,21 B aprox. | 128.000 tokens segun su ficha publica | Licencia comunitaria Llama 3.2 | HuggingFace | Alternativa de tamano similar con contexto mayor; datos de referencia no verificados en esta busqueda |
| `google/gemma-2-2b-it` | 2,6 B aprox. | 8.192 tokens segun su ficha publica | Licencia Gemma | HuggingFace | Alternativa algo mas pequena, orientada a instrucciones; datos de referencia no verificados en esta busqueda |

Los datos de los modelos alternativos provienen de sus fichas publicas y no se han verificado en la busqueda realizada para esta ficha; se incluyen unicamente como referencia de categoria.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluacion humana, ni analisis de regresiones respecto al modelo base.
- Riesgo de degradacion de capacidades generales: un SFT "persona-only" puede reducir el rendimiento en tareas de instruccion, codigo o matematicas, asi como erosionar el soporte de tool calling.
- Sesgos inducidos por la persona: el personaje Sheldon Cooper se caracteriza por un tono condescendiente, pedante y potencialmente ofensivo; el modelo puede reproducir esos rasgos en produccion.
- Riesgo de alucinacion: no medido. La cuantia puede ser mayor que en el modelo base al haberse especializado en un estilo conversacional concreto.
- Propiedad intelectual: el personaje esta protegido por derechos de autor de terceros; el uso del modelo para generar contenido comercial con esa identidad puede acarrear problemas legales.
- Limitaciones de idioma y contexto: no documentadas. El ajuste se ha realizado presumiblemente en ingles y no hay confirmacion del comportamiento en castellano ni de la ventana de contexto efectiva tras el entrenamiento.
- Uso comercial: la licencia Apache 2.0 lo permite tecnicamente, pero las advertencias anteriores (falta de evaluacion, IP del personaje, riesgo de toxicidad) desaconsejan su uso en produccion sin filtros y evaluacion previos.
- Estado del repositorio: 0 descargas y 0 likes, sin pipeline declarado y con una model card de dos frases; se trata de un artefacto academico sin mantenimiento ni soporte.
- Metadatos: las fechas de creacion y actualizacion registradas (2026) no son coherentes con el resto de la informacion disponible; conviene tratarlas con cautela.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/XujjHarvard/cs2881-hw1-sft-B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Informe tecnico de Qwen2.5 (referencia del modelo base): https://arxiv.org/abs/2412.15115
- Repositorio de Qwen2.5 en GitHub: https://github.com/QwenLM/Qwen2.5

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces encontrados correspondian a paginas de descarga de navegadores y no se han incluido.
