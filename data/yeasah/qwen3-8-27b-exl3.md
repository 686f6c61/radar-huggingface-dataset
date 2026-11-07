# yeasah/Qwen3.8-27B-exl3

## Resumen

`yeasah/Qwen3.8-27B-exl3` es un conjunto de cuantizaciones EXL3 del modelo denso `Qwen/Qwen3.8-27B` de Alibaba Qwen, publicadas por el usuario yeasah. No es un modelo nuevo, sino una redistribucion optimizada del original en formato exl3 (exllamav3), con asignacion de bits por tensor calibrada especificamente sobre cargas de trabajo agenticas y de codigo. El objetivo es reducir el peso del checkpoint desde los 51,75 GiB del modelo base hasta 9,54 GiB en la variante mas agresiva (2,50 bpw), manteniendo la fidelidad de la distribucion de siguiente token lo mas cerca posible del original.

El modelo base es un transformer denso de 27B parametros con arquitectura hibrida de atencion lineal (gated-deltanet) y atencion completa, y una ventana de contexto nativa de 262k tokens segun la informacion disponible en repositorios relacionados. La relevancia de esta publicacion radica en que ofrece siete niveles de cuantizacion documentados con metricas objetivas (KLD excedente, delta de perplejidad, retencion de hechos), lo que permite elegir el tamano en funcion de la VRAM disponible sin adivinar el impacto en calidad.

La licencia declarada es Apache 2.0 y el pipeline es `image-text-to-text`, lo que indica soporte multimodal de entrada (imagen y texto), aunque la model card no detalla la torre de vision. El repo ocupa 162,0 GB en total porque aloja todas las revisiones en ramas separadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso hibrido: atencion lineal (gated-deltanet) + atencion completa, con cabeza MTP (multi-token prediction) para decodificacion especulativa |
| Parametros totales | 27B (modelo base `Qwen/Qwen3.8-27B`) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262k tokens (nativo, segun repositorios relacionados del modelo base) |
| Tipos de cuantizacion | EXL3 en 2,50 / 3,00 / 3,50 / 4,00 / 5,00 / 6,00 bpw; embedding de tokens tambien cuantizado |
| Idiomas soportados | No disponible en la model card (la evaluacion incluye una porcion de "multilingual documents") |
| Licencia | Apache 2.0 |
| Formato de pesos | EXL3 (exllamav3); no safetensors ni GGUF estandar |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 27B parametros que combina capas de atencion lineal con mecanismo gated-deltanet y capas de atencion completa, un esquema hibrido pensado para abaratar el coste del contexto largo. Incluye una cabeza MTP (multi-token prediction) que actua como borrador para decodificacion especulativa, lo que permite acelerar la generacion sin un modelo draft externo. La ventana nativa es de 262k tokens.

Esta publicacion no entrena el modelo: solo lo cuantiza. La innovacion esta en el proceso de calibracion. El autor calibra "de forma amplia, sobre lo que los modelos leen y escriben mientras trabajan" (documentos y salidas de herramientas en conversaciones, codigo y diffs, respuestas propias del modelo) en lugar de texto web generico, y mide con tareas agenticas y de codigo como caso de uso primario. Los bits se asignan por tensor segun la sensibilidad medida del modelo sobre sus propias respuestas, manteniendo el mismo tamano total que una asignacion uniforme. Ademas, el embedding de tokens se almacena cuantizado (requiere exllamav3 1.6.4 o superior), lo que ahorra entre 1,6 y 1,9 GiB en disco en todas las tasas sin coste medible de calidad. Las revisiones anteriores del repositorio estan superadas por las actuales.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Qwen3.8-27B.
- Procesamiento de imagen y texto (`pipeline_tag: image-text-to-text`), aunque la model card no detalla la arquitectura de vision.
- Generacion de codigo y trabajo con diffs, ya que la calibracion se optimizo explicitamente para codigo y parches.
- Uso de herramientas y bucles de tool calling: la calibracion incluye salidas de herramientas y definiciones de herramientas.
- Trabajo agentico multi-paso: la evaluacion cubre sesiones reales de agente (Open-SWE-Traces) y bucles de uso de herramientas.
- Contexto largo: ventana nativa de 262k tokens con cabeza MTP para decodificacion especulativa.
- Capacidad multilingue: existe una porcion de evaluacion sobre documentos multilingues, aunque no se enumeran los idiomas soportados.
- Memoria factual en preguntas cerradas: el autor mide retencion de hechos sobre 3059 preguntas.

## Casos de uso

- Agentes de codigo autonomos: el modelo esta calibrado sobre codigo, diffs y salidas de herramientas, y se evaluo con sesiones reales de agente (Open-SWE-Traces). Se puede desplegar en vLLM con el plugin `vllm-exl3-plugin` para integrarlo en un pipeline de resolucion de issues o generacion de parches.
- Asistentes con contexto documental largo: con 262k tokens de contexto y una variante de 3,50 bpw que ocupa 11,31 GiB de VRAM en vLLM, cabe en una GPU de 24 GB dejando espacio para cache KV amplia, lo que permite cargar repositorios de documentacion completos en una sola sesion.
- Atencion al cliente con tool calling: la calibracion incluye conversaciones con salidas de herramientas, por lo que el modelo mantiene fidelidad en turnos donde se invocan APIs (consultas de pedidos, estado de cuenta) dentro de un dialogo multi-turno.
- Procesamiento de documentos escaneados o capturas: el pipeline `image-text-to-text` permite extraer informacion de imagenes junto con texto, util para digitalizacion de facturas o tickets.
- Despliegue en hardware de gama alta de consumo: la variante de 2,50 bpw ocupa 9,54 GiB en disco y 8,48 GiB de VRAM en vLLM, lo que la hace viable en GPUs de 12-16 GB para prototipado y evaluacion local.
- Generacion de codigo en produccion con restricciones de memoria: la variante de 4,00 bpw (13,94 GiB en disco, 12,88 GiB de VRAM) retiene el 95,0% de los hechos medidos con solo un 0,59% de errores confiados, lo que la hace adecuada para servir en una RTX 4090 o A100 40GB.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye metricas de KLD y perplejidad por tasa, util para equipos que necesitan justificar la eleccion de tamano en un informe tecnico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor publica metricas propias de fidelidad de cuantizacion:

| BPW | Tamano en disco | VRAM (vLLM) | KLD excedente | Delta perplejidad | Hechos retenidos | Errores confiados |
|---|---|---|---|---|---|---|
| 2,50 | 9,54 GiB | 8,48 GiB | 0,0305 | +3,17% | 80,8% | 2,16% |
| 3,00 | 10,96 GiB | 9,90 GiB | 0,0136 | +1,42% | 89,4% | 1,34% |
| 3,50 | 12,37 GiB | 11,31 GiB | 0,0074 | +0,78% | 91,6% | 0,59% |
| 4,00 | 13,94 GiB | 12,88 GiB | 0,0037 | +0,37% | 95,0% | 0,59% |
| 5,00 | 16,92 GiB | 15,86 GiB | 0,0009 | +0,12% | no disponible | no disponible |
| 6,00 | 19,75 GiB | 18,69 GiB | 0,0002 | +0,04% | no disponible | no disponible |
| Base | 51,75 GiB | no disponible | 0 | 0 | 100% (referencia) | no disponible |

Comparacion frente a otras cuantizaciones del mismo modelo (`turboderp/Qwen3.8-27B-exl3`), con ratio de KLD compuesto (menor es mejor):

| BPW | Ratio compuesto | Comparado con | Diferencia de tamano | Peor porcion | Porcion |
|---|---|---|---|---|---|
| 2,50 | 0,58 | turboderp plain 2,50bpw | -1,91 GiB (-16,7%) | 0,71 | documentos multilingues |
| 3,00 | 0,69 | turboderp plain 3,00bpw | -1,92 GiB (-14,9%) | 0,80 | documentos multilingues |
| 3,50 | 0,63 | turboderp plain 3,50bpw | -1,91 GiB (-13,4%) | 0,66 | documentos multilingues |
| 4,00 | 0,74 | turboderp plain 4,00bpw | -1,77 GiB (-11,3%) | 0,83 | documentos multilingues |
| 5,00 | 0,86 | turboderp SC_5.00bpw_H6 | -1,62 GiB (-8,7%) | 1,15 | voz propia del modelo |
| 6,00 | 0,95 | turboderp SC_6.00bpw_H6 | -1,62 GiB (-7,6%) | 1,10 | voz propia del modelo |

El autor advierte que el ratio de 6,00 bpw esta dentro de aproximadamente el doble del ruido de redondeo del modelo sin cuantizar y debe leerse como ruido, no como ranking. Las porciones de evaluacion incluyen WildChat (prompts reales), Open-SWE-Traces (sesiones de agente), documentos en turno de usuario, documentos como resultado de herramienta, documentos multilingues, bucles de uso de herramientas y la voz propia del modelo.

## Requisitos de hardware

- VRAM para inferencia (vLLM): 8,48 GiB a 2,50 bpw; 9,90 GiB a 3,00; 11,31 GiB a 3,50; 12,88 GiB a 4,00; 15,86 GiB a 5,00; 18,69 GiB a 6,00. El autor indica que el consumo real puede ser significativamente menor que el tamano total del checkpoint segun la configuracion.
- GPU recomendadas: RTX 4090 (24 GB) cubre de 2,50 a 4,00 bpw dejando espacio para cache KV; A100 40GB y H100 permiten las tasas de 5,00 y 6,00 bpw con contexto largo. Segun informacion de un repo relacionado, una variante de 3,5 bpw de 14,2 GB esta dimensionada para dejar espacio a caches KV grandes en GPUs de 24 GB y alojar los 262k tokens de contexto nativo con la cabeza MTP residente.
- Cabe en GPU de consumo: si, desde 12 GB en la variante de 2,50 bpw (8,48 GiB de VRAM) hasta 16 GB en la de 3,50 bpw.
- Opciones de despliegue: exllamav3 (requiere 1.6.4 o superior por el embedding cuantizado) y vLLM mediante el plugin `vllm-exl3-plugin`. No hay formato GGUF, por lo que llama.cpp y Ollama no son opciones directas.
- Latencia y throughput: no disponibles en la informacion proporcionada. La cabeza MTP integrada permite decodificacion especulativa, lo que deberia reducir la latencia por token frente a decodificacion autoregresiva pura, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `yeasah/Qwen3.8-27B-exl3` | 27B denso | 262k | EXL3 (2,50-6,00 bpw) | Apache 2.0 | Calibracion orientada a agentes y codigo; embedding cuantizado; hasta 16,7% mas pequeno que la alternativa a igual bpw |
| `turboderp/Qwen3.8-27B-exl3` | 27B denso | 262k | EXL3 (plain y SC) | Apache 2.0 | Cuantizacion de referencia del mismo modelo base; el autor de esta ficha lo usa como comparador directo |
| `Mia-AiLab/Qwen3.8-27B-EXL3-3.5bpw` | 27B denso | 262k | EXL3 3,5 bpw (14,2 GB) | no disponible | Dimensionado para 24 GB con contexto completo residente y cabeza MTP |
| `Qwen/Qwen3.8-27B` (base) | 27B denso | 262k | safetensors (51,75 GiB) | Apache 2.0 | Referencia sin cuantizar; requiere hardware de gama alta para inferencia completa |

No se dispone de comparaciones con modelos de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion puede dejar al modelo fluido pero incorrecto en hechos: el propio autor lo advierte. A 2,50 bpw se pierde el 19,2% de los hechos medidos y el 2,16% de las respuestas son errores confiados, lo que es riesgoso en dominios factuales.
- La calibracion esta sesgada hacia codigo, agentes y documentos. Las porciones de evaluacion de documentos multilingues muestran los peores ratios frente a la competencia (0,66-0,83), lo que sugiere menor fidelidad relativa en ese dominio.
- La porcion de "voz propia del modelo" empeora a partir de 5,00 bpw (ratio 1,15), es decir, a tasas altas el modelo puede desviarse mas en su estilo generativo que la alternativa de turboderp.
- No se enumeran los idiomas soportados en la model card; el soporte multilingue esta implicito en la evaluacion pero no cuantificado por idioma.
- El formato EXL3 limita el ecosistema de despliegue: no hay GGUF, por lo que llama.cpp, Ollama y otros runners estandar no sirven sin conversion.
- Requiere exllamav3 1.6.4 o superior por el embedding cuantizado; versiones anteriores no cargaran el checkpoint correctamente.
- El repo ocupa 162,0 GB porque contiene todas las revisiones en ramas; la descarga selectiva de una rama es imprescindible para no consumir disco en exceso.
- Licencia Apache 2.0 permite uso comercial, pero se heredan las limitaciones y sesgos del modelo base Qwen3.8-27B, no documentados en esta ficha.
- No hay benchmarks estandar publicados, por lo que la comparacion con otros modelos de la misma categoria debe hacerse con cautela.
- El modelo base es de 2026 y la informacion disponible sobre el es limitada; algunos datos (contexto, arquitectura) provienen de repositorios relacionados y no de la model card de esta publicacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/yeasah/Qwen3.8-27B-exl3
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantizacion alternativa de referencia: https://huggingface.co/turboderp/Qwen3.8-27B-exl3
- Cuantizacion de Mia-AiLab a 3,5 bpw: https://huggingface.co/Mia-AiLab/Qwen3.8-27B-EXL3-3.5bpw
- exllamav3: https://github.com/turboderp-org/exllamav3
- Plugin EXL3 para vLLM: https://github.com/yeasah/vllm-exl3-plugin
- Rama 2,50 bpw: https://huggingface.co/yeasah/Qwen3.8-27B-exl3/tree/2.50bpw-H5
- Rama 3,00 bpw: https://huggingface.co/yeasah/Qwen3.8-27B-exl3/tree/3.00bpw-H5
- Rama 3,50 bpw: https://huggingface.co/yeasah/Qwen3.8-27B-exl3/tree/3.50bpw-H5
- Rama 4,00 bpw: https://huggingface.co/yeasah/Qwen3.8-27B-exl3/tree/4.00bpw
- Rama 5,00 bpw: https://huggingface.co/yeasah/Qwen3.8-27B-exl3/tree/5.00bpw
- Rama 6,00 bpw: https://huggingface.co/yeasah/Qwen3.8-27B-exl3/tree/6.00bpw
