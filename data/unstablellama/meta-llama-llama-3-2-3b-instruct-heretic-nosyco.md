# UnstableLlama/meta-llama-Llama-3.2-3B-Instruct-heretic-nosyco

## Resumen

Este modelo es una variante ajustada (fine-tuning) de Llama 3.2 3B Instruct, el modelo instruccional de 3.000 millones de parametros de Meta, publicada por el usuario UnstableLlama en Hugging Face bajo el identificador UnstableLlama/meta-llama-Llama-3.2-3B-Instruct-heretic-nosyco. El nombre del proyecto indica dos focos de trabajo: el termino "heretic" (acercamiento a tecnicas de abliteracion o modificacion de pesos para modificar el comportamiento del modelo) y "no-sycophancy" (nosyco), lo que sugiere que el objetivo del ajuste es reducir la sycophancy, es decir, la tendencia de los modelos a estar de acuerdo con el usuario o a halagar sus ideas en lugar de dar respuestas honestas y criticas.

El problema que aborda es relevante: la sycophancy es un comportamiento documentado y no deseado en asistentes de IA, especialmente problematico en asistentes de razonamiento, revision de codigo o analisis, donde el usuario necesita que el modelo contradiga sus suposiciones erroneas. Los tags arxiv:2204.05149 (articulo "Discovering Language Model Behaviors with Model-Written Evaluations") y arxiv:2405.16406 (articulo "Towards Understanding Sycophancy in Language Models") refuerzan esta orientacion hacia la evaluacion y mitigacion de este comportamiento.

Al tratarse de un derivado directo de Llama 3.2 3B Instruct, hereda su arquitectura transformer con optimizaciones (GQA, RoPE, SwiGLU), su ventana de contexto de 128.000 tokens y su licencia Llama 3.2 Community License. Es un modelo ligero, apto para ejecutarse en hardware de consumo, con un peso de repositorio de 6,4 GB en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder autorregresivo (Llama 3.2, con GQA, RoPE y SwiGLU) |
| Parametros totales | 3.212.749.824 (3,21 mil millones) |
| Parametros activos | no disponible (no es MoE; todos los parametros estan activos) |
| Longitud de contexto | 128.000 tokens (heredada de Llama 3.2 3B Instruct; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (solo pesos en BF16/FP16 en safetensors; no hay variantes cuantizadas en el repo) |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura base es la de Llama 3.2 3B Instruct: un transformer decoder autorregresivo con agrupacion de consultas (Grouped Query Attention) para reducir el coste de memoria del KV cache, codificacion posicional RoPE y activaciones SwiGLU en las capas de alimentacion hacia adelante. El modelo base fue preentrenado por Meta con un corpus multilingue de aproximadamente 9 billones de tokens (segunda generacion de la familia Llama 3) y posteriormente alineado mediante optimizacion por instrucciones, SFT y RLHF/DPO para la variante Instruct.

Sobre esa base, UnstableLlama ha aplicado un proceso de ajuste identificado en los tags como "heretic" y "no-sycophancy". La model card no detalla el metodo exacto (SFT con datos sinteticos, abliteracion de direcciones de comportamiento, DPO con pares preferenciales contra respuestas sycophanticas u otra tecnica), pero el termino "heretic" se asocia comunmente en la comunidad a tecnicas de modificacion de pesos que eliminan o atenuan comportamientos indeseados sin reentrenamiento completo. No se ha publicado informacion sobre el numero de tokens del ajuste, la composicion del dataset de entrenamiento ni los hiperparametros.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de la variante Instruct de Llama 3.2.
- Razonamiento general, redaccion, resumen y respuestas a preguntas.
- Generacion y comprension de codigo a nivel basico-intermedio, acorde a su tamano de 3B.
- Resolucion de problemas matematicos elementales.
- Capacidades multilingues en ocho idiomas: ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes.
- Comportamiento modificado frente a la sycophancy: mayor tendencia a contradecir afirmaciones incorrectas del usuario y a mantener posturas criticas honestas (objetivo declarado del ajuste, sin metricas publicadas).
- No incluye capacidades de vision ni de audio; Llama 3.2 3B es solo de texto (las variantes multimodales son las 11B y 90B Vision).
- No hay informacion publicada sobre soporte de tool calling o function calling en esta variante; el modelo base Llama 3.2 Instruct dispone de soporte nativo para llamadas a herramientas, por lo que es plausible que se conserve, pero no esta confirmado.

## Casos de uso

- Asistente de revision critica de ideas y escritos: al estar ajustado contra la sycophancy, es adecuado para escenarios donde el usuario quiere feedback honesto sobre borradores, argumentos o planes, sin que el modelo valide automaticamente lo que se le presenta.
- Tutoria y aprendizaje: en contextos educativos, un modelo menos sycophantico corrige errores del estudiante en lugar de confirmarlos, lo que mejora la calidad del aprendizaje en materias como matematicas o programacion.
- Chatbots conversacionales en espanol y otros idiomas europeos: soporta espanol, aleman, frances, italiano y portugues, con una ventana de contexto amplia para conversaciones largas.
- Despliegue en hardware de consumo: con 3,21 mil millones de parametros, puede ejecutarse en portatiles y estaciones de trabajo con GPUs de gama media o incluso en CPU, siendo util para prototipado local de asistentes.
- Investigacion sobre alineacion y comportamiento de modelos: sirve como base experimental para estudiar tecnicas de mitigacion de sycophancy y comparar respuestas frente al modelo base Llama 3.2 3B Instruct.
- Generacion aumentada por recuperacion (RAG): su herencia de Llama 3.2 Instruct y su ventana de contexto lo hacen apto para responder preguntas sobre documentos recuperados, con la ventaja añadida de que el modelo tendria menos tendencia a aceptar pasivamente informacion contradictoria en el contexto.
- Agente de dialogo con personalidad asertiva: para aplicaciones donde se requiere que el asistente mantenga criterio propio y no ceda ante insistencia del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K ni metricas cuantitativas de reduccion de sycophancy (por ejemplo, evaluaciones tipo NopE o datasets de sycophancy de Anthropic). Para referencia del modelo base, Llama 3.2 3B Instruct publica resultados oficiales de Meta, pero esta variante no ha sido evaluada publicamente.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16/FP16): aproximadamente 6,5-7 GB solo de pesos, mas el KV cache; en la practica, 8 GB de VRAM son suficientes para contextos moderados.
- Con cuantizacion a 4 bits (por ejemplo, mediante GGUF Q4_K_M o bitsandbytes NF4), el consumo baja a unos 2-2,5 GB, lo que lo hace viable en GPUs de 4-6 GB o en CPU.
- GPUs recomendadas: cualquier GPU de consumo con 8 GB o mas (RTX 3060, RTX 4060 Ti, RTX 4070); no se requiere hardware de centro de datos (A100/H100) para inferencia.
- Cabe comodamente en GPUs de consumo; incluso en portatiles con GPUs de gama media o en CPU con RAM suficiente (8 GB+) mediante llama.cpp.
- Opciones de despliegue: transformers de Hugging Face (formato nativo safetensors), vLLM, TGI, llama.cpp y Ollama (este ultimo requirio conversion a GGUF, no incluida en el repositorio original).
- Latencia y throughput: no disponibles; al ser un modelo de 3B, se espera latencia baja y throughput alto en GPUs de consumo, tipico de modelos de este tamano.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| UnstableLlama/meta-llama-Llama-3.2-3B-Instruct-heretic-nosyco | 3,21B | 128K (heredado) | Llama 3.2 Community | Ajuste anti-sycophancy sobre Llama 3.2 3B Instruct; sin benchmarks publicados |
| meta-llama/Llama-3.2-3B-Instruct | 3,21B | 128K | Llama 3.2 Community | Modelo base oficial de Meta; soporte de tool calling nativo |
| Qwen/Qwen2.5-3B-Instruct | 3,09B | 32K (128K con YaRN) | Qwen Research (Apache 2.0 con restricciones) | Competidor directo en la clase 3B, fuerte en codigo y matematicas |
| microsoft/Phi-3.5-mini-instruct | 3,82B | 128K | MIT | Rendimiento alto para su tamano, licencia permisiva |

## Limitaciones y advertencias

- No hay documentacion del metodo de ajuste: la model card no explica como se redujo la sycophancy, por lo que el comportamiento real puede variar y no esta garantizado.
- Ausencia de benchmarks: no hay metricas que cuantifiquen la mejora frente al modelo base ni posibles regresiones en utilidad general, razonamiento o idiomas.
- Riesgo de alucinacion: como todo modelo de lenguaje de 3B, puede generar informacion falsa con apariencia convincente; el ajuste anti-sycophancy no mitiga este riesgo.
- Posible exceso de confrontacion: un modelo ajustado contra la sycophancy puede volverse innecesariamente critico o negativo en casos donde el usuario tiene razon; conviene evaluar el equilibrio antes de usarlo en produccion.
- Limitaciones de idioma: aunque soporta ocho idiomas, el rendimiento en espanol y en los idiomas distintos del ingles es inferior al del ingles, y el ajuste adicional puede haber degradado las capacidades multilingues.
- Restricciones de licencia: la Llama 3.2 Community License exige atribucion ("Built with Llama"), incluir el aviso de copyright en redistribuciones, cumplir la Acceptable Use Policy de Meta y, para productos con mas de 700 millones de usuarios activos mensuales, solicitar una licencia adicional a Meta.
- Sin capacidades multimodales: no procesa imagenes ni audio.
- Proyecto comunitario con baja traccion (594 descargas, 0 likes en el momento de la ficha): escaso historial de uso, revision o deteccion de problemas por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UnstableLlama/meta-llama-Llama-3.2-3B-Instruct-heretic-nosyco
- Modelo base (Meta Llama 3.2 3B Instruct): https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Documentacion de Llama: https://llama.meta.com/doc/overview
- Llama 3.2 Acceptable Use Policy: https://www.llama.com/llama3_2/use-policy
- Articulo de referencia sobre sycophancy (arXiv:2405.16406): https://arxiv.org/abs/2405.16406
- Articulo de referencia sobre evaluacion de comportamientos (arXiv:2204.05149): https://arxiv.org/abs/2204.05149
