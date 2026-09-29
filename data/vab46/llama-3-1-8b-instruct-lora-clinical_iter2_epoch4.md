# vab46/llama-3.1-8b-instruct-lora-clinical_iter2_epoch4

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) de ajuste fino sobre el modelo base `meta-llama/Llama-3.1-8B-Instruct`, publicado por el usuario individual vab46. No es un modelo completo: se distribuyen unicamente los pesos del adaptador (0,3 GB de repositorio) que se deben cargar sobre la base de 8.000 millones de parametros. El ajuste se ha orientado a un dominio concreto, los ensayos clinicos, empleando el dataset `vab46/Clinical_trials_anchor-contextORpositive-ground-truth_LLM_LORA-junk_handled_ft` mapeado a plantillas de chat.

El problema que pretende resolver es la adaptacion de un LLM generalista a preguntas sobre ensayos clinicos: vision general macro, elegibilidad de pacientes, operaciones y generacion aumentada por recuperacion (RAG) sobre fragmentos de documentacion clinica. Arquitectonicamente hereda el transformer decoder-only de Llama 3.1 con 32 capas, dimension oculta de 4096 y ventana de contexto de 131.072 tokens (128K), sobre el que se aplica un adaptador de rango 16 con dropout 0,05.

La relevancia de la ficha es fundamentalmente ilustrativa: se trata de un artefacto de bajo perfil (0 descargas y 0 likes en el momento de la consulta, sin paper ni evaluacion publicada) que ejemplifica el patron habitual de QLoRA sobre Llama 3.1 para dominios verticales. Debe tratarse como material experimental y no verificado, no como un recurso listo para produccion clinica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LlamaForCausalLM) con adaptador LoRA/PEFT; atencion con GQA y MLP SwiGLU |
| Parametros totales | 8.030 millones (modelo base Llama 3.1 8B); adaptador LoRA de rango 16 (~42 millones de parametros entrenables, estimacion a partir de la configuracion declarada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 131.072 tokens (128K) |
| Tipos de cuantizacion | Base cuantizada en 4 bits (Linear4bit / QLoRA) durante el entrenamiento; el adaptador se distribuye sin cuantizar en safetensors. No se publican versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | Ingles (`en`) declarado para el ajuste; la base Llama 3.1 soporta ademas aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | llama3.1 (sujeta al Llama 3.1 Community License Agreement de Meta); no declarada en los metadatos de Hugging Face |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Tamano del repositorio | 0,3 GB |
| Modalidad | Texto |

## Arquitectura y entrenamiento

La base es `meta-llama/Llama-3.1-8B-Instruct`, un transformer autoregresivo decoder-only de 32 capas (`LlamaDecoderLayer`), dimension de embedding 4096 y vocabulario de 128.256 tokens. La configuracion revela atencion con query grouping (GQA): las proyecciones `q_proj` producen 4096 dimensiones (32 cabezas de 128) mientras que `k_proj` y `v_proj` producen 1024 (8 cabezas KV). El bloque MLP (`LlamaMLP`) usa SwiGLU con dimension intermedia de 14.336. El ajuste se realiza con PEFT/LoRA sobre las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` (y presumiblemente `down_proj`, truncada en la model card), con rango (`lora_A`/`lora_B`) de 16 y dropout de 0,05. Los pesos base aparecen como `Linear4bit`, lo que indica un esquema QLoRA con cuantizacion de 4 bits en tiempo de entrenamiento.

El unico dato de entrenamiento disponible es el dataset de ensayos clinicos citado, mapeado mediante chat templates. No se especifican el numero de tokens, el numero de ejemplos, la composicion del corpus ni si hubo etapas de RLHF o DPO adicionales (el alineamiento se hereda del modelo instruct base). Existe una discrepancia sin resolver: la model card afirma un ajuste de "single epoch", mientras que el nombre del repositorio indica `iter2_epoch4`. No se documentan innovaciones tecnicas propias (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto y respuesta a preguntas sobre ensayos clinicos: vision general macro, elegibilidad de pacientes y cuestiones operativas.
- Generacion aumentada por recuperacion (RAG) sobre fragmentos de documentacion de ensayos clinicos.
- Soporte para prompt engineering especifico de ensayos clinicos.
- Hereda del modelo base capacidades generales de razonamiento, generacion de codigo y matematicas, si bien no se documenta su preservacion tras el ajuste.
- Hereda de Llama 3.1 Instruct el soporte de tool calling / function calling y de flujos de agente multiturno, aunque el ajuste de dominio puede degradar su fiabilidad.
- Capacidad multilingue heredada de la base, no garantizada para el dominio clinico, ya que el ajuste solo se realizo en ingles.
- Modalidad exclusivamente de texto; no soporta vision ni audio.
- No se declara modo de razonamiento explicito ("thinking mode") ni capacidades especiales adicionales.

## Casos de uso

- Asistente de elegibilidad de pacientes: dado un protocolo y el perfil de un candidato, el modelo puede generar un analisis de los criterios de inclusion y exclusion, apoyandose en la ventana de 128K tokens para manejar documentos extensos.
- Resumen macro de ensayos clinicos: sintesis de protocolos, objetivos y disenos de estudio para revision rapida por parte de equipos de investigacion.
- Componente generador en pipelines RAG: el modelo esta explicitamente orientado a generar respuestas a partir de fragmentos recuperados, por lo que encaja como generador final en una arquitectura de recuperacion sobre literatura de ensayos clinicos.
- Soporte a operaciones de ensayo: respuesta a preguntas sobre logistica, hitos y procedimientos internos de un estudio.
- Generacion de borradores de material informativo para participantes, sujeto siempre a revision humana.
- Creacion de plantillas de prompt y evaluacion de estrategias de prompting especificas de ensayos clinicos, dado el enfoque del ajuste en esta tarea.
- Normalizacion y reformulacion de texto clinico dentro de un flujo de preprocesado, aprovechando el contexto largo para procesar documentos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de evaluacion clinica, y el repositorio registra 0 descargas y 0 likes, sin validacion independiente.

## Requisitos de hardware

- VRAM estimada (modelo base 8B): ~16 GB en FP16/BF16; ~9 GB en cuantizacion de 8 bits; ~5-6 GB en 4 bits (NF4).
- GPU recomendadas: A100, H100, L40S o A10G para FP16 en produccion; RTX 3090, RTX 4090 (24 GB) sobradamente para FP16 en consumer; RTX 3060 12 GB, RTX 4070 o RTX 4060 Ti 16 GB para 4 bits.
- Cabe en GPU de consumo: si, en 4 bits practicamente en cualquier GPU con 8 GB o mas; en FP16 requiere 24 GB o mas.
- Nota de despliegue: al ser un adaptador, es necesario cargar la base (los pesos base se entrenaron en 4 bits via bitsandbytes) y superponer el adaptador.
- Opciones de despliegue: Transformers + PEFT (nativo para el adaptador); vLLM con soporte de LoRA (`--enable-lora`); TGI con adaptadores. Ollama y llama.cpp requieren fusionar el adaptador con la base y convertir a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| llama-3.1-8b-instruct-lora-clinical (este) | 8B (base) + adaptador LoRA | 128K | llama3.1 | Adaptador safetensors, 0,3 GB | Ajuste de dominio clinico, sin benchmarks publicados |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 Community License | Modelo completo | Base directa; generalista, sin especializacion clinica |
| Otros ajustes clinicos de 7-8B (p. ej. BioMistral, OpenBioLLM, Meditron) | 7-8B | no disponible | no disponible | no disponible | Existen alternativas de dominio medico, pero no se dispone de datos verificados en la informacion proporcionada para una comparacion rigurosa |

No se dispone de datos de rendimiento comparativo para ninguno de los modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos: hereda los sesgos conocidos de Llama 3.1 8B Instruct; no se ha realizado ninguna evaluacion de sesgo tras el ajuste.
- Riesgo de alucinacion: elevado en dominio clinico; no debe utilizarse para decisiones medicas, diagnosticos ni determinacion de elegibilidad real sin validacion por profesionales.
- No es un producto sanitario ni dispone de marcado CE/FDA; su uso en contextos regulados no esta soportado.
- Idioma: el ajuste se declara solo en ingles; el rendimiento en castellano u otros idiomas no esta evaluado y previsiblemente sera inferior.
- Restricciones de licencia: sujeta al Llama 3.1 Community License Agreement, con las condiciones de uso comercial de Meta; verificar los umbrales de usuarios activos mensuales antes de un uso comercial.
- Es un adaptador, no un modelo completo: requiere descargar y cargar la base de 8B, con el coste de almacenamiento y VRAM asociado.
- Procedencia y madurez: autor individual, sin paper, sin evaluacion publicada, 0 descargas y 0 likes.
- Discrepancia documental: la model card menciona un unico epoch mientras el identificador del repositorio indica `iter2_epoch4`; no se aclara el numero real de epocas.
- El dataset de entrenamiento no se describe en detalle (composicion, tamano, procedencia, tratamiento de datos personales o clinicos), lo que impide auditar la calidad y la privacidad de los datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vab46/llama-3.1-8b-instruct-lora-clinical_iter2_epoch4
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Dataset de ajuste: https://huggingface.co/vab46/Clinical_trials_anchor-contextORpositive-ground-truth_LLM_LORA-junk_handled_ft
- Documentacion de Transformers: https://huggingface.co/docs/transformers
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Repositorio de Transformers en GitHub: https://github.com/huggingface/transformers
- Hub de adaptadores PEFT: https://huggingface.co/models?library=peft
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/
