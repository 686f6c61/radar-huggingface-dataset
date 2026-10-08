# vosldtgbj/project-llm-sft-v3-f3-h1p0-seed20261006

## Resumen

Project LLM SFT v3 (identificador `vosldtgbj/project-llm-sft-v3-f3-h1p0-seed20261006`) es un punto de control derivado del modelo multimodal Gemma 4, publicado por el usuario `vosldtgbj` como parte de una linea de experimentacion denominada Project LLM. Se trata de un ajuste supervisado completo (Full SFT) aplicado sobre el checkpoint previo `project-llm-cpt-1p0-top10-01-full-02`, que a su vez provenia de una fase de preentrenamiento continuado (CPT) de 1,0 epoca. El modelo resultante tiene 11.959.730.176 parametros (unos 12.000 millones) y se distribuye en safetensors fragmentados, con un peso total de repositorio de 24,0 GB.

La propuesta de este checkpoint es la de un modelo «any-to-any» basado en la arquitectura `gemma4_unified`, lo que implica capacidad de procesamiento multimodal entrada-salida (etiquetas `image-text-to-text` y `any-to-any`). La mezcla de entrenamiento declarada por el autor es 90% datos de dominio y 10% datos generales, con una tasa de aprendizaje de 2e-6 y una sola epoca. Esto lo situa como un modelo claramente especializado, no como un modelo de proposito general.

Su relevancia es fundamentalmente como artefacto de investigacion: el propio autor indica que el repositorio sirve para reproduccion de experimentos, evaluacion offline y trabajo posterior. No incluye datos de optimizador, scheduler ni estado de reanudacion. El modelo no registra descargas ni interacciones en el momento de su publicacion, y la informacion publica sobre su comportamiento empirico es practicamente inexistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4_unified (familia Gemma 4, transformer multimodal unificado) |
| Parametros totales | 11.959.730.176 (~12B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors sin cuantizar) |
| Idiomas soportados | japones (etiqueta declarada); resto no disponible |
| Licencia | apache-2.0, sujeta ademas a la licencia upstream de Gemma 4 (https://ai.google.dev/gemma/docs/gemma_4_license) |
| Formato de pesos | safetensors fragmentados (sharded) |
| Tamano del repositorio | 24,0 GB |
| Pipeline | any-to-any |
| Modelo base | vosldtgbj/project-llm-cpt-1p0-top10-01-full-02 |

## Arquitectura y entrenamiento

La arquitectura es `gemma4_unified`, segun la etiqueta y el ejemplo de carga de la model card, que emplea `AutoModelForMultimodalLM` y `AutoProcessor` de Transformers. Esto corresponde a un modelo multimodal unificado de la familia Gemma 4 que acepta y produce contenido en mas de una modalidad (pipeline `any-to-any`, etiquetas `image-text-to-text`). El numero de parametros (11.959.730.176) situa el checkpoint en la franja de ~12B, coherente con el tamano de pesos publicado (24,0 GB en safetensors, aproximadamente 2 bytes por parametro en precision de 16 bits).

El proceso de entrenamiento declarado consta de dos fases. Primero, un preentrenamiento continuado (CPT) de 1,0 epoca sobre el que se construye el checkpoint base. Despues, un ajuste supervisado completo (Full SFT) de 1,0 epoca con una tasa de aprendizaje de 2e-6, empleando una mezcla de 90% datos de dominio y 10% datos generales. La model card no detalla el volumen de tokens, la composicion del dataset, ni si se aplicaron tecnicas de alineacion adicionales como RLHF, DPO o similar. Tampoco se documentan innovaciones tecnicas especificas (decodificacion especulativa, atencion lineal, hibridacion SSM) mas alla de las propias de la arquitectura Gemma 4 subyacente. Toda esa informacion debe considerarse no disponible.

## Capacidades

- Generacion de texto multimodal: al heredar la arquitectura `gemma4_unified` con pipeline `any-to-any`, se espera soporte de entradas y salidas que combinan texto e imagen, aunque el alcance exacto no esta documentado.
- Ajuste supervisado sobre dominio especifico: el entrenamiento con 90% datos de dominio sugiere una especializacion en una tarea o vertical concreta, no revelada en la model card.
- Capacidad multilingue: la unica etiqueta de idioma declarada es japones; no hay informacion sobre otros idiomas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades de audio o vision especificas: no disponibles mas alla de la etiqueta generica `image-text-to-text`.
- Reproducibilidad experimental: el checkpoint esta pensado para reproducir el experimento SFT v3, evaluacion offline y trabajo de investigacion posterior.

## Casos de uso

- Reproduccion de experimentos de ajuste fino: el repositorio se publica explicitamente como archivo de pesos completos para reproducir la fase SFT v3, de modo que un equipo de investigacion puede cargar el checkpoint, comparar contra el modelo CPT base y aislar el efecto del ajuste supervisado.
- Evaluacion offline de modelos multimodales: dado el pipeline `any-to-any`, puede emplearse como sujeto de pruebas en baterias internas de evaluacion de tareas imagen-texto, siempre que se definan los prompts y el formato de entrada segun la arquitectura `gemma4_unified`.
- Investigacion sobre mezclas de datos de dominio: la proporcion 90/10 entre datos de dominio y datos generales lo convierte en un caso de estudio para analizar como afecta esa mezcla a la especializacion frente al olvido catastrofico.
- Base para ajustes posteriores (continued SFT o RLHF): al distribuirse como safetensors compatibles con Transformers, puede servir de punto de partida para fases adicionales de alineacion dentro de un pipeline de investigacion.
- Prototipado en japones: para proyectos experimentales que requieran generacion de texto en japones con soporte de entrada de imagen, aunque sin garantias de calidad publicadas.
- Docencia y formacion tecnica: util como ejemplo practico de flujo CPT -> SFT y de publicacion de pesos en safetensors fragmentados para cursos de ajuste fino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye metricas (MMLU, HumanEval, GSM8K, MT-Bench ni equivalentes), y no hay evaluaciones de terceros asociadas al repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision fp16/bf16, alrededor de 24 GB solo para pesos, mas overhead de activaciones y cache KV, por lo que conviene prever 28-32 GB o mas segun contexto.
- Cuantizacion a 8 bits: aproximadamente 12-14 GB de pesos.
- Cuantizacion a 4 bits: aproximadamente 7-9 GB de pesos.
- GPU recomendadas: para fp16 sin cuantizar, A100 40/80 GB, H100 o L40S. Con cuantizacion 4 bits puede ejecutarse en GPUs de consumo.
- GPU de consumo: una RTX 4090 (24 GB) es ajustada para fp16 y comoda para 4/8 bits; RTX 3090 (24 GB) en la misma situacion; tarjetas de 12-16 GB requieren cuantizacion agresiva.
- Opciones de despliegue: Transformers con `AutoModelForMultimodalLM` (metodo indicado por el autor); vLLM, TGI o llama.cpp/Ollama solo si existe soporte confirmado para la arquitectura `gemma4_unified` y pesos compatibles, algo que no se documenta en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| project-llm-sft-v3-f3-h1p0-seed20261006 | ~11,96B | no disponible | apache-2.0 + licencia Gemma 4 | HuggingFace (0 descargas) |
| project-llm-cpt-1p0-top10-01-full-02 (modelo base) | no disponible | no disponible | no disponible | HuggingFace |
| Otras alternativas de ~12B de la familia Gemma 4 | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de evaluaciones publicadas: sin benchmarks ni validacion de terceros, no es posible estimar la calidad real del modelo.
- Sesgos potenciales: el entrenamiento con 90% de datos de un dominio no documentado puede introducir sesgos de especializacion y degradar el comportamiento general.
- Riesgo de olvido catastrofico: la mezcla 90/10 y una sola epoca de SFT pueden reducir capacidades generales presentes en el checkpoint CPT.
- Idiomas: solo se declara japones; no hay evidencia de buen rendimiento en castellano ni en otros idiomas.
- Alucinacion: no cuantificada, pero esperable en cualquier modelo de este tamano sin datos de alineacion documentados.
- Licencia: aunque el repositorio indique apache-2.0, la model card remite a la licencia de Gemma 4, que impone terminos de uso adicionales. Debe revisarse antes de cualquier uso comercial.
- Compatibilidad tecnica: la carga depende de una version de Transformers que soporte `gemma4_unified`, lo que puede limitar su integracion en toolchains estandar (vLLM, TGI, llama.cpp).
- Madurez: 0 descargas y 0 interacciones, sin mantenimiento ni soporte documentado; no es apto como dependencia de produccion sin validacion previa.
- Sin datos de contexto: se desconoce la ventana maxima, lo que impide planificar cargas de contexto largo.

## Enlaces

- HuggingFace: https://huggingface.co/vosldtgbj/project-llm-sft-v3-f3-h1p0-seed20261006
- Modelo base: https://huggingface.co/vosldtgbj/project-llm-cpt-1p0-top10-01-full-02
- Licencia upstream de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Repositorio de referencia sobre SFT (no asociado al modelo): https://github.com/vpoluyaktov/llm-sft-test
- vLLM: https://github.com/vllm-project/vllm
- Documentacion de vLLM: https://docs.vllm.ai/en/latest/
- vLLM en PyPI: https://pypi.org/project/vllm/
- Sitio de vLLM: https://vllm.ai/
