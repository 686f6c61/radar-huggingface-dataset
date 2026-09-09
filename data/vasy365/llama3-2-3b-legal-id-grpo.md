# VaSy365/llama3.2-3b-legal-id-grpo

## Resumen

VaSy365/llama3.2-3b-legal-id-grpo es un modelo de lenguaje basado en Llama 3.2 3B, desarrollado por VaSy365 mediante un proceso de fine-tuning en dos etapas. La primera etapa creó un modelo base especializado en dominios legales (llama3.2-3b-legal-id-ft); la segunda aplicó un ajuste posterior con técnicas de optimización de políticas, probablemente Group Relative Policy Optimization (GRPO), utilizando las librerías Unsloth y TRL de HuggingFace. El resultado es un modelo denso de 3.212.749.824 parámetros, con arquitectura transformer decodificador y licencia Apache 2.0.

Su interés radica en ofrecer un modelo compacto y de código abierto orientado a tareas jurídicas, con un coste de despliegue reducido y la flexibilidad de la licencia Apache 2.0. Sin embargo, la model card publicada es mínima: no incluye información sobre el dataset, el número de tokens de entrenamiento ni evaluaciones de rendimiento, lo que limita la verificabilidad de sus capacidades reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador (Llama 3.2 3B) |
| Parametros totales | 3.212.749.824 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la model card; la arquitectura Llama 3.2 3B tiene 8.192 tokens |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos safetensors sin cuantizaciones precalculadas) |
| Idiomas soportados | Ingles (segun metadatos de HuggingFace) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decodificador puro, siguiendo la estructura de Llama 3.2 3B. Se trata de un modelo denso, sin mezcla de expertos. El proceso de entrenamiento se realizó en dos fases: una primera de fine-tuning supervisado sobre un dominio legal (el modelo base llama3.2-3b-legal-id-ft) y una segunda que, según el sufijo "grpo", aplica Group Relative Policy Optimization para alinear el comportamiento. El autor indica que el entrenamiento se llevó a cabo con Unsloth y la librería TRL de HuggingFace, y que fue un 2x más rápido gracias a Unsloth.

No se ha publicado información sobre el tamaño del dataset, el número de tokens de entrenamiento ni la composición de los datos. Tampoco se detallan las técnicas de alineación más allá de la posible GRPO, ni se aportan datos sobre validación o evaluación del fine-tuning.

## Capacidades

- Generacion de texto en ingles, con formato conversacional.
- Adaptacion a dominios legales, segun el nombre del modelo y su modelo base, aunque no hay documentacion sobre el alcance exacto de dicha adaptacion.
- Se pueden asumir las capacidades generales del modelo base Llama 3.2 3B (seguimiento de instrucciones, razonamiento basico, generacion de texto), pero no existen evaluaciones publicadas que confirmen que el fine-tuning las haya preservado o mejorado.
- No se documenta soporte para tool calling, vision, audio, agentes, modo de razonamiento ampliado ni capacidades multilingues. No se debe asumir su existencia.

## Casos de uso

Los siguientes casos de uso son aplicaciones plausibles para un modelo de lenguaje de este tamaño, aunque no se dispone de evaluaciones que garanticen su rendimiento en ellas.

- Resumen de contratos y documentos legales: se puede integrar en un pipeline de analisis documental para generar resumenes ejecutivos de contratos en ingles. El tamano compacto del modelo permite ejecutarlo en servidores con recursos limitados.
- Asistente de consultas juridicas internas: como chatbot dentro de un despacho, responde preguntas frecuentes sobre procedimientos y normativa, reduciendo el tiempo de busqueda de los profesionales.
- Etiquetado de clausulas: mediante prompt engineering, se pueden identificar y clasificar clausulas estandar en contratos, como responsabilidad, confidencialidad o terminacion, para sistemas de gestion documental.
- Redaccion de borradores: genera borradores de comunicaciones legales, como cartas de reclamacion o respuestas a requerimientos, que despues un abogado revisa y corrige.
- Clasificacion de reclamaciones: categoriza reclamaciones entrantes por tipo (laboral, mercantil, civil) para enrutarlas al area correspondiente de un bufete o departamento legal.
- Educacion legal: explica conceptos juridicos de forma sencilla para estudiantes o clientes no especializados, siempre con supervision profesional.
- Extraccion de entidades en documentos: identifica nombres, fechas, importes y clausulas concretas en materiales legales, util para sistemas de busqueda y archivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en precision bf16/fp16: el repositorio ocupa 6,4 GB, lo que es coherente con pesos en 16 bits. Se necesitan al menos 8-10 GB de VRAM para alojar pesos, cache KV y activaciones.
- Con cuantizacion 4-bit (mediante bitsandbytes o GGUF Q4_K_M): el modelo puede ocupar entre 2,5 y 3,5 GB, y cabe en GPUs de consumo con 6 GB de VRAM o mas.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, A10G, L4 o superior para inferencia en tiempo real.
- En CPU: se puede ejecutar con llama.cpp en cuantizacion 4-bit, aunque con latencia mayor; requiere alrededor de 3-4 GB de RAM.
- Opciones de despliegue: Transformers + PyTorch, vLLM, Hugging Face TGI, Ollama y llama.cpp.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Los datos de los modelos comparados proceden de sus fichas tecnicas publicas; no hay resultados de benchmarks disponibles para el modelo evaluado.

| Modelo | Parametros | Longitud de contexto | Licencia | Uso previsto |
|---|---|---|---|---|
| VaSy365/llama3.2-3b-legal-id-grpo | 3.212.749.824 | No especificado en la model card (arquitectura base: 8.192) | Apache 2.0 | Dominio legal, fine-tuning con GRPO |
| Llama-3.2-3B-Instruct | 3.2B | 8.192 | Apache 2.0 | Instrucciones generales |
| Qwen2.5-3B-Instruct | 3,09B | 32.768 | Apache 2.0 | Instrucciones y multilingüe |
| VaSy365/llama3.2-3b-legal-id-ft | 3.212.749.824 | No especificado en la model card (arquitectura base: 8.192) | Apache 2.0 | Dominio legal, fine-tuning supervisado |

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos ni de seguridad. En un dominio legal, donde la precision es critica, esta ausencia es una limitacion importante.
- Riesgo de alucinacion: como con todos los modelos generativos, puede producir informacion juridica incorrecta o inventada. Debe usarse siempre con supervision profesional.
- Idioma unico: los metadatos declaran solo ingles; no hay soporte oficial para otros idiomas.
- Ventana de contexto limitada: si se usa el contexto nativo de Llama 3.2 3B (8.192 tokens), los documentos largos se truncaran; la model card no indica ninguna extension.
- Licencia Apache 2.0 permite uso comercial, pero el autor no proporciona garantias de exactitud, seguras juridicas ni soporte tecnico.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/VaSy365/llama3.2-3b-legal-id-grpo
- HuggingFace (modelo base): https://huggingface.co/VaSy365/llama3.2-3b-legal-id-ft
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
