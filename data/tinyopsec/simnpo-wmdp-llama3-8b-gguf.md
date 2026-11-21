# tinyopsec/SimNPO-WMDP-llama3-8b-GGUF

## Resumen

SimNPO-WMDP-llama3-8b es un modelo derivado de Llama-3-8B-Instruct al que se ha aplicado una tecnica de *machine unlearning* denominada SimNPO (Simple Negative Preference Optimization) sobre el conjunto de datos WMDP (Weapons of Mass Destruction Proxy). El objetivo de este proceso es reducir la capacidad del modelo de retener conocimiento peligroso (por ejemplo, informacion sobre sintesis de agentes quimicos, patogenos o material nuclear) sin degradar de forma significativa sus capacidades generales. El modelo original lo desarrolla el grupo OPTML (OPTML-Group), un equipo de investigacion centrado en optimizacion y aprendizaje automatico.

La ficha que nos ocupa, `tinyopsec/SimNPO-WMDP-llama3-8b-GGUF`, es una republicacion en formato GGUF del modelo base, generada con llama.cpp y pensada para ejecucion local en CPU, GPU consumer y runtimes compatibles con GGUF (Ollama, LM Studio, koboldcpp, llama-cpp-python). El repositorio incluye 13 variantes de cuantizacion, desde F16 hasta Q2_K, lo que permite ajustar el equilibrio entre calidad y requisitos de memoria.

Se trata de un modelo de investigacion, no de un producto listo para produccion. Su interes actual reside en que permite experimentar con tecnicas de desaprendizaje en un modelo de 8.000 millones de parametros con licencia MIT y en hardware asequible, algo poco habitual en la literatura de unlearning, donde la mayoria de artefactos se distribuyen en pesos completos y con requisitos de GPU de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3), derivado de Llama-3-8B-Instruct |
| Parametros totales | 8.030.269.440 (8,03 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama-3-8B-Instruct soporta 8.192 tokens, pero la model card no lo confirma para esta variante) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (generado con llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3: un transformer decoder-only con atencion multi-cabeza con GQA, normalizacion RMSNorm y activaciones SwiGLU, con 8.030 millones de parametros. El modelo parte de Llama-3-8B-Instruct, ajustado por instrucciones, y sobre el que se aplica el proceso de unlearning SimNPO frente al benchmark WMDP.

SimNPO (Simple Negative Preference Optimization) es una variante simplificada de NPO (Negative Preference Optimization) que elimina el termino de regularizacion hacia el modelo original y utiliza unicamente la preferencia negativa sobre los datos que se desea olvidar. El conjunto WMDP (Weapons of Mass Destruction Proxy) es un benchmark de evaluacion de conocimiento peligroso en tres dominios: bio-seguridad, ciberseguridad y quimica. El resultado es un modelo que deberia mostrar una tasa de retencion reducida en esas areas manteniendo el rendimiento en tareas genericas, aunque la model card no aporta cifras concretas de ese compromiso.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion exacta del dataset de unlearning ni si se aplicaron etapas adicionales de RLHF o DPO mas alla del ajuste original de Llama-3-8B-Instruct.

## Capacidades

- Generacion de texto conversacional en ingles (idioma del modelo base), con formato de chat de Llama 3.
- Razonamiento de proposito general, respuesta a preguntas y resumen, heredados del modelo instruct original.
- Generacion de codigo y matematicas basicas, presumiblemente conservadas tras el unlearning (sin datos de benchmark que lo confirmen).
- Soporte de tool calling / function calling: no disponible de forma explicita en la informacion proporcionada; el modelo base Llama 3 lo soporta, pero no se confirma para esta variante.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: no disponibles; el modelo base esta entrenado principalmente en ingles.
- Modo thinking, vision o audio: no disponible; es un modelo puramente de texto.
- Capacidad especifica: el modelo esta disenado para *no* retener conocimiento peligroso en las areas cubiertas por WMDP, lo que constituye su rasgo diferencial.

## Casos de uso

- Investigacion en machine unlearning: permite reproducir y auditar el comportamiento de SimNPO sobre WMDP en hardware consumer, comparando las 13 cuantizaciones para medir el impacto de la compresion en la retencion del conocimiento olvidado.
- Evaluacion de robustez de tecnicas de desaprendizaje: util para probar si el conocimiento peligroso puede recuperarse mediante *jailbreaks*, fine-tuning ligero o prompting adversario, usando el modelo como sujeto de estudio.
- Desarrollo de pipelines de moderacion y seguridad: como referencia negativa en sistemas que comparan la salida de un modelo "olvidado" frente a un modelo estandar para detectar contenido sensible.
- Despliegue local en entornos de laboratorio: con Q4_K_M (recomendado por el autor) cabe en GPUs consumer de 8-12 GB y permite iterar rapidamente sin depender de infraestructura cloud.
- Educacion y docencia sobre alineamiento: sirve como ejemplo practico de como se aplica una tecnica de optimizacion con preferencias negativas sobre un LLM de 8 B.
- Pruebas de compatibilidad de runtimes GGUF: al cubrir 13 cuantizaciones, es util para validar el comportamiento de Ollama, LM Studio, koboldcpp o llama-cpp-python frente a distintos niveles de precision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye cifras de MMLU, HumanEval, GSM8K ni de retencion en WMDP para esta variante GGUF, y tampoco se aportan datos del modelo base OPTML-Group/SimNPO-WMDP-llama3-8b.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto):
  - F16: ~16,1 GB de pesos; ~18-20 GB con contexto.
  - Q8_0: ~8,5 GB de pesos; ~10-11 GB con contexto.
  - Q6_K: ~6,6 GB de pesos; ~8 GB con contexto.
  - Q5_K_M: ~5,7 GB de pesos; ~7 GB con contexto.
  - Q4_K_M (recomendado): ~4,9 GB de pesos; ~6 GB con contexto.
  - Q3_K_M: ~4,0 GB de pesos; ~5 GB con contexto.
  - Q2_K: ~3,0 GB de pesos; ~4 GB con contexto.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 para F16 y Q8_0; RTX 4070 Ti / 4080 (12-16 GB) para Q5 y Q6; RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070 8-12 GB para Q4_K_M; GPUs de 6-8 GB para Q3 y Q2.
- Cabe en GPU consumer: si, desde Q4_K_M en adelante en tarjetas de 8 GB o superiores; las cuantizaciones Q2 y Q3 caben incluso en 6 GB.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, koboldcpp, llama-cpp-python, y cualquier runtime compatible con GGUF. No se mencionan vLLM ni TGI en la informacion disponible (vLLM soporta GGUF de forma experimental, pero no esta documentado para este repo).
- Latencia y throughput estimados: no disponibles. Dependen fuertemente del hardware y de la cuantizacion; en una RTX 4090 con Q4_K_M es razonable esperar decenas de tokens por segundo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| tinyopsec/SimNPO-WMDP-llama3-8b-GGUF | 8,03 B | no disponible | MIT | GGUF (13 cuantizaciones) | Variante unlearned de Llama-3-8B-Instruct |
| OPTML-Group/SimNPO-WMDP-llama3-8b | 8,03 B | no disponible | no disponible en la informacion | safetensors (pesos completos) | Modelo base del que deriva esta ficha |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03 B | 8.192 tokens | Llama 3 Community License | safetensors, GGUF (comunidad) | Modelo original sin unlearning; referencia de capacidades generales |
| OPTML-Group/NPO-WMDP-llama3-8b | 8,03 B | no disponible | no disponible | safetensors | Variante con NPO clasico en lugar de SimNPO; comparable en objetivo |

La comparativa con Llama-3-8B-Instruct es la mas relevante: este modelo deberia conservar gran parte de las capacidades generales del original pero con menor retencion en bio-seguridad, ciberseguridad y quimica. No hay datos publicados que cuantifiquen esa diferencia en esta ficha.

## Limitaciones y advertencias

- Modelo de investigacion: el autor lo declara explicitamente como artefacto para estudiar machine unlearning; no esta validado para uso en produccion.
- Eficacia del unlearning no verificada: no se aportan metricas de retencion en WMDP ni de degradacion en tareas generales; no se puede confirmar que el conocimiento peligroso haya sido realmente eliminado.
- Riesgo de recuperacion del conocimiento: las tecnicas de unlearning basadas en preferencias negativas pueden ser vulnerables a *jailbreaks*, fine-tuning posterior o prompting adversario; el modelo no debe tratarse como una barrera de seguridad.
- Sesgos: heredados de Llama-3-8B-Instruct y de sus datos de entrenamiento; no se documenta ninguna mitigacion adicional.
- Alucinacion: riesgo estandar de un LLM de 8 B; no hay evaluacion especifica en la model card.
- Idioma: principalmente ingles; el resto de idiomas no esta documentado y la calidad puede ser baja.
- Contexto: la longitud de contexto no se confirma en la model card; conviene asumir el limite del modelo base (8.192 tokens) hasta verificarlo.
- Licencia: MIT para este repositorio, pero construido sobre Meta Llama 3; es necesario revisar que la licencia MIT del autor es compatible con las obligaciones de la Llama 3 Community License para uso comercial.
- Cuantizaciones agresivas (Q2_K, Q3_K_S) degradan la calidad de forma notable; el autor recomienda Q4_K_M como equilibrio.
- Sin garantias: el repositorio tiene 0 likes y 874 descargas en el momento de la consulta, lo que indica poca validacion comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tinyopsec/SimNPO-WMDP-llama3-8b-GGUF
- Modelo base en Hugging Face: https://huggingface.co/OPTML-Group/SimNPO-WMDP-llama3-8b
- Llama 3 en Meta: https://llama.meta.com/llama3/
- llama.cpp (runtime GGUF): https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com/
- No se han encontrado en la informacion proporcionada enlaces a papers, blogs o demos adicionales.
