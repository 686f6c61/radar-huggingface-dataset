# sxiong/TG-LLM-TGQA-Story2TG-Llama-2-13B-LoRA

## Resumen

TG-LLM-TGQA-Story2TG-Llama-2-13B-LoRA es un adaptador LoRA desarrollado por Siheng Xiong y colaboradores, publicado en el marco del trabajo "Large Language Models Can Learn Temporal Reasoning" (ACL 2024). El modelo se fine-tunea sobre `meta-llama/Llama-2-13b-chat-hf` para realizar la tarea de traducción de narrativas a grafos temporales (Story-to-Temporal-Graph Translation), que consiste en convertir un texto narrativo en una representación estructurada de eventos y sus relaciones temporales.

Este adaptador forma parte del framework TG-LLM, diseñado para dotar a los modelos de lenguaje de capacidades de razonamiento temporal explícito. La relevancia del modelo radica en que aborda un problema clásico en NLP: el razonamiento sobre el tiempo, que suele fallar en LLMs genéricos. Al separar la tarea en dos pasos (generación de grafo temporal y razonamiento sobre él), el modelo permite un control intermedio y una interpretabilidad mayor que los enfoques de generación directa.

El adaptador utiliza una configuración LoRA de rango bajo (r=8) sobre las proyecciones de atención del modelo base, con un tamaño de repositorio de 2 GB que corresponde únicamente al adaptador, no a los pesos completos del modelo. La longitud de contexto heredada es de 4096 tokens, y la licencia MIT permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama 2) con adaptadores LoRA |
| Parametros totales | 13B (modelo base) + adaptador LoRA (tamano no especificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (heredado del modelo base) |
| Tipos de cuantizacion | No especificados (pesos en safetensors) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Llama-2-13b-chat-hf` y se fine-tunea con LoRA (Low-Rank Adaptation). La configuracion LoRA especifica `lora_alpha=8`, `r=8`, `bias="none"` y los modulos objetivo `q_proj`, `k_proj`, `o_proj` y `v_proj`, es decir, las proyecciones de atencion del transformer. Esta configuracion de rango bajo permite ajustar el modelo con un coste computacional reducido y un sobreajuste menor.

El entrenamiento se realiza mediante aprendizaje supervisado (SFT) sobre el dataset `sxiong/TGQA`, que contiene pares de narrativas y sus grafos temporales correspondientes. La tarea especifica de este adaptador es la traduccion de una historia a un grafo temporal estructurado, que posteriormente puede usarse como entrada para la segunda etapa del framework TG-LLM: el razonamiento sobre el grafo temporal (Temporal-Graph Reasoning). No se menciona el uso de RLHF ni DPO en la informacion disponible.

## Capacidades

- Generacion de texto en ingles, con especializacion en la traduccion de narrativas a grafos temporales (eventos, relaciones de orden, duraciones, etc.).
- Razonamiento temporal estructurado: el modelo produce representaciones intermedias que pueden alimentar etapas posteriores de razonamiento.
- Capacidad de seguir instrucciones en formato de texto plano, adaptada al formato de la tarea Story2TG.
- No se documenta soporte de tool calling, agentes, vision, audio ni modos de thinking.

## Casos de uso

- **Construccion de grafos de conocimiento temporal**: el modelo puede convertir una novela, articulo de noticias o informe en un grafo temporal que represente eventos y sus relaciones, util para sistemas de extraccion de conocimiento.
- **Preprocesamiento para QA temporal**: al generar el grafo intermedio, se puede combinar con el modelo de razonamiento temporal del framework TG-LLM para responder preguntas sobre orden de eventos, duraciones o causalidad.
- **Analisis de narrativas en investigacion academica**: util para estudios literarios o linguisticos que requieran modelar la estructura temporal de textos.
- **Generacion de datos de entrenamiento**: el modelo puede producir grafos temporales a partir de textos no anotados, facilitando la creacion de datasets para otros sistemas.
- **Sistemas de recuperacion de informacion temporal**: en bases de datos documentales donde se necesite indexar eventos con sus relaciones temporales, el modelo puede extraer la estructura relevante.
- **Investigacion en razonamiento temporal**: como componente de un pipeline experimental para comparar la eficacia de la representacion intermedia frente a la generacion directa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper asociado (ACL 2024) presenta evaluaciones en el dataset TGQA, pero los numeros concretos no estan incluidos en la model card ni en los resultados de la busqueda web.

## Requisitos de hardware

- Para inferencia se necesita cargar el modelo base `Llama-2-13b-chat-hf` (13B parametros) mas el adaptador LoRA. El adaptador en si no requiere VRAM adicional significativa, pero el modelo base requiere aproximadamente:
  - 26 GB en FP16, o
  - 7-8 GB en cuantizacion de 4 bits (utilizando herramientas como llama.cpp o bitsandbytes).
- GPU recomendada: una GPU con al menos 8 GB de VRAM para cuantizacion 4-bit (p.ej., RTX 3070/4080), o 24 GB para FP16 (p.ej., RTX 3090/4090, A10G).
- Opciones de despliegue: el adaptador puede integrarse con bibliotecas que soporten LoRA (transformers + peft), o exportarse a formatos como GGUF para su uso con llama.cpp, Ollama o vLLM (si se fusiona con el modelo base).
- Latencia y throughput no disponibles.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este modelo especifico, por lo que la comparativa se limita a la estructura y el enfoque.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| TG-LLM-Story2TG (este) | 13B (LoRA) | 4096 | MIT | Traduccion a grafo temporal |
| Llama-2-13B-chat (base) | 13B | 4096 | Llama 2 Community License | Chat general |
| GPT-4 (no open source) | no disponible | 128k | Propietaria | Razonamiento general, no especializado en grafos temporales |

El modelo se distingue por su especializacion en la generacion de grafos temporales, una tarea que los modelos generales no abordan de forma estructurada. No se han encontrado otros modelos publicados con la misma funcion especifica.

## Limitaciones y advertencias

- **Idioma**: el modelo solo soporta ingles (en). No se evaluo su comportamiento en otros idiomas.
- **Alucinacion**: como cualquier LLM, puede generar grafos temporales incorrectos o incompletos, especialmente en narrativas ambiguas.
- **Sesgos**: heredados del modelo base Llama-2-13B-chat, que puede presentar sesgos de genero, raza o culturales en la interpretacion de eventos.
- **Dominio limitado**: el modelo esta entrenado especificamente para la tarea de traduccion de historias a grafos; no es un modelo generalista y su uso fuera de esta tarea puede degradar el rendimiento.
- **Sin evaluacion de seguridad**: no se documentan pruebas de robustez frente a prompts adversariales o contenido danino.
- **Licencia MIT**: permite uso comercial sin restricciones, pero el modelo base (Llama-2) tiene su propia licencia (Llama 2 Community License), que debe cumplirse al desplegar el sistema completo.

## Enlaces

- [Repositorio de HuggingFace](https://huggingface.co/sxiong/TG-LLM-TGQA-Story2TG-Llama-2-13B-LoRA)
- [Repositorio principal TG-LLM en HuggingFace](https://huggingface.co/sxiong/TG-LLM)
- [Codigo fuente en GitHub](https://github.com/xiongsiheng/TG-LLM)
- [Paper (ACL 2024)](https://aclanthology.org/2024.acl-long.567/) - "Large Language Models Can Learn Temporal Reasoning"
