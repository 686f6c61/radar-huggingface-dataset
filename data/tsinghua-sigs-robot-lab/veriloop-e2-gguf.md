# tsinghua-sigs-robot-lab/VeriLoop-E2-GGUF

## Resumen

VeriLoop E2 GGUF es la distribucion oficial orientada a llama.cpp de VeriLoop E2, un modelo post-entrenado de 27B construido sobre Qwen3.8-27B y especializado en codigo, ingenieria de software, matematicas y fisica. Lo desarrolla el Tsinghua SIGS Robot Lab (Libo Wang) y se publica bajo licencia Apache 2.0. El repositorio no duplica la model card del modelo padre, sino que se centra en los artefactos y la informacion utiles para el despliegue local en formato GGUF.

El modelo cuenta con 26.895.998.464 parametros totales (aproximadamente 27B) y una longitud de contexto nativa de 262.144 tokens heredada de la configuracion del modelo padre. La arquitectura declarada en el checkpoint es `Qwen3_5ForConditionalGeneration`. Su rasgo tecnico mas destacado para el despliegue es el soporte de decodificacion especulativa mediante un modelo borrador MTP (multi-token prediction) publicado de forma separada.

Este repositorio es relevante porque establece el BF16 como punto de referencia canonico (no como cuantizacion de baja precision) para las futuras variantes Q8/Q6/Q5/Q4/IQ4, e incluye puertas de calidad auditables (auditoria de tensores, compilacion y carga en llama-server, y verificacion del endpoint compatible con OpenAI). La primera release se distribuye como dos ficheros GGUF separados: el modelo objetivo y el borrador MTP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (HF architecture: `Qwen3_5ForConditionalGeneration`); soporta MTP (multi-token prediction) para decodificacion especulativa |
| Parametros totales | 26.895.998.464 (aproximadamente 27B) |
| Parametros activos | No disponible (no se indica que sea una arquitectura MoE) |
| Longitud de contexto | 262.144 tokens nativos; contexto de validacion en la release GGUF: 32.768 tokens |
| Tipos de cuantizacion | BF16 (referencia canonica); Q8, Q6, Q5, Q4 e IQ4 anunciadas como releases posteriores, comparadas contra la referencia BF16 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); BF16 con algunos tensores F32 sensibles a metadatos; tambien modelo borrador MTP en GGUF separado |

## Arquitectura y entrenamiento

VeriLoop E2 es un modelo post-entrenado de aproximadamente 27B construido sobre la familia Qwen3.8-27B, con arquitectura declarada `Qwen3_5ForConditionalGeneration`. La model card lo describe como un modelo post-entrenado ("post-trained") orientado a codigo, ingenieria de software, matematicas y fisica, e incluye etiquetas de entrenamiento relacionadas con agentes de codigo, razonamiento matematico, razonamiento cientifico y contexto largo. Incorpora soporte de MTP para decodificacion especulativa, distribuido como un borrador independiente en GGUF.

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas concretas como RLHF o DPO; estos datos corresponden al modelo padre y no se reproducen en esta ficha. La innovacion tecnica mas visible en esta release es la organizacion de la conversion como una transformacion auditable: exportacion BF16 del objetivo, exportacion separada del borrador MTP, auditoria del recuento de tensores (851 tensores en el objetivo, 18 en el MTP), compilacion y carga en llama-server, y gate de endpoint compatible con OpenAI. La herramienta de conversion empleada es `convert_hf_to_gguf.py` de llama.cpp (revision `bddf8263c31c3dce3212263b00ebd2d98c1a752b`), con codigo de retorno 0 en ambas conversiones.

## Capacidades

- Generacion de texto orientada a codigo y ingenieria de software, con etiquetas explicitas de coding-agent y software-engineering.
- Razonamiento matematico, con soporte declarado para matematicas.
- Razonamiento cientifico, con enfasis declarado en fisica.
- Contexto largo: 262.144 tokens nativos, lo que permite manejar documentos extensos y repositorios completos.
- Decodificacion especulativa mediante modelo borrador MTP separado, para acelerar la inferencia en llama.cpp.
- Capacidades conversacionales (pipeline text-generation, tag conversational).
- Soporte multilingue limitado a ingles (en) y chino (zh).
- Ejecucion local en llama.cpp con endpoint compatible con OpenAI (`/v1/models` verificado).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.
- Vision ni audio: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia a la programacion en local: el modelo puede generar y revisar codigo en entornos sin conexion a APIs externas, aprovechando el formato GGUF y el runtime llama.cpp.
- Agentes de ingenieria de software: dado su etiquetado como coding-agent, puede integrarse en flujos multi-paso de edicion de repositorios, siempre que el orquestador implemente el control de herramientas, ya que el soporte de tool calling no esta confirmado en la informacion disponible.
- Analisis de repositorios completos: con 262.144 tokens de contexto nativo, permite cargar ficheros y documentacion extensos en una sola ventana para tareas de comprension y refactorizacion.
- Razonamiento matematico asistido: util para resolver y verificar problemas matematicos paso a paso, en linea con el enfoque de "verificacion" (VeriLoop) y el artefacto publico sobre la hipotesis de Riemann.
- Investigacion en fisica y calculo cientifico: adecuado para derivaciones, comprobaciones dimensionales y asistencia en problemas de fisica declarados como dominio principal.
- Despliegue en servidor de inferencia propio: mediante llama-server con API compatible con OpenAI, se puede exponer el modelo como backend de aplicaciones internas sin dependencia de proveedores en la nube.
- Aceleracion de inferencia en produccion: el borrador MTP permite aplicar decodificacion especulativa para reducir la latencia por token en hardware con capacidad suficiente.
- Evaluacion reproducible de cuantizaciones: la release BF16 sirve como referencia para medir la perdida de calidad de las variantes Q8/Q6/Q5/Q4/IQ4 bajo un protocolo fijo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card enlaza un conjunto de datos de evidencia de evaluacion (`tsinghua-sigs-robot-lab/VeriLoop-E2-Evaluation-Evidence`) y un informe tecnico en OpenReview, pero no se incluyen cifras numericas (MMLU, HumanEval, GSM8K, etc.) en el material proporcionado, por lo que no se reproducen valores concretos.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero objetivo BF16 ocupa aproximadamente 51 GiB y el borrador MTP aproximadamente 5,6 GiB, lo que suma unos 57 GiB solo en pesos; a ello hay que anadir la cache KV, cuyo tamano depende del contexto configurado.
- Al tratarse de un BF16 de 27B, no cabe en una unica GPU de consumo: requiere configuraciones multi-GPU o memoria unificada de gran capacidad.
- GPU recomendadas: no disponibles de forma explicita en la informacion proporcionada; por tamano, el BF16 exige GPUs de centro de datos con agregacion de VRAM muy alta (por ejemplo, varias A100/H100), sin que el autor especifique un minimo concreto.
- Cabe en consumer GPU: no en BF16; seria necesario esperar a las variantes de baja precision (Q8/Q6/Q5/Q4/IQ4) anunciadas, cuyo encaje en GPU de consumo no se detalla en la informacion disponible.
- Opciones de despliegue: llama.cpp y llama-server son el objetivo oficial de esta release (compilacion CUDA y carga verificadas). Se confirma endpoint compatible con OpenAI (`/v1/models`). No se mencionan vLLM, TGI ni Ollama en el material proporcionado.
- Contexto validado en runtime: 32.768 tokens en el gate de la release; contextos mayores requieren planificacion de VRAM/RAM y de cache KV sobre el hardware objetivo.
- Latencia y throughput: no disponible en la informacion proporcionada; el uso de decodificacion especulativa con MTP esta pensado para mejorar estos valores, pero no se aportan cifras.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas de modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa se marca como no disponible. A modo de referencia estructural, se resumen los datos confirmados de este modelo:

| Modelo | Parametros | Contexto | Licencia | Formato | Estado |
|---|---|---|---|---|---|
| VeriLoop E2 GGUF (este modelo) | 26,9B | 262.144 tokens nativos | Apache 2.0 | GGUF (BF16) | Publicado |
| Modelo base Qwen3.8-27B | no disponible | no disponible | no disponible | no disponible | Referencia del autor |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idiomas: solo se declaran ingles (en) y chino (zh); el rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- Riesgo de alucinacion: no se documenta en la informacion proporcionada; como en cualquier modelo generativo, especialmente en dominios cientificos y matematicos, conviene verificar las salidas.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Contexto: aunque el modelo declara 262.144 tokens nativos, el gate de la release GGUF solo valido 32.768 tokens en runtime; usar contextos mayores exige planificacion de cache KV y validacion en el hardware objetivo.
- Tamano de despliegue: el BF16 ocupa unos 51 GiB (mas 5,6 GiB del MTP), lo que impide su uso en una sola GPU de consumo y complica el despliegue en estaciones de trabajo.
- Cuantizaciones de baja precision: Q8/Q6/Q5/Q4/IQ4 se anuncian como releases posteriores que se publicaran solo tras compararse con la referencia BF16 bajo un protocolo fijo; en el momento de esta ficha no estan confirmadas.
- Tool calling y modo thinking: no confirmados en la informacion disponible, lo que limita el diseno de agentes que dependan de esas capacidades sin trabajo adicional de orquestacion.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo padre y de la familia base (Qwen) para evitar conflictos.
- Trazabilidad: el repo declara 0 descargas y 1 like, y la model card proporcionada aparece truncada, por lo que parte de la informacion de despliegue podria estar incompleta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tsinghua-sigs-robot-lab/VeriLoop-E2-GGUF
- Modelo padre: https://huggingface.co/tsinghua-sigs-robot-lab/VeriLoop-E2
- Informe tecnico (OpenReview): https://openreview.net/forum?id=P6FIQILHwX&noteId=P6FIQILHwX
- Evidencia de evaluacion (dataset): https://huggingface.co/datasets/tsinghua-sigs-robot-lab/VeriLoop-E2-Evaluation-Evidence
- Artefacto sobre la hipotesis de Riemann (GitHub): https://github.com/brucewang123456789/GeniusTrail/tree/VeriLoop-E2/riemann-hypothesis
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
