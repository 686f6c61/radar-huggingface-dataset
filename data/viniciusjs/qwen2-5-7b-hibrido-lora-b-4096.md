# ViniciusJS/qwen2.5-7b-hibrido-lora-b-4096

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA (entrenado con QLoRA en NF4 de 4 bits y doble cuantizacion) sobre `Qwen/Qwen2.5-7B-Instruct`. Lo publica el usuario ViniciusJS dentro del proyecto de investigacion Pesquisa_IC_IA, y su objetivo declarado es el ajuste fino conjunto para pregunta-respuesta financiera (FinQA) e industrial (FailureSensorIQ). El adaptador tiene rango 8, alpha 16 y dropout 0.1, y se aplica sobre las proyecciones q/k/v/o y gate/up/down del transformer subyacente.

La relevancia es acotada y de caracter experimental: el autor documenta explicitamente que las metricas historicas (accuracy numerica de 0.0647 en FinQA y F1 macro por etiqueta de 0.4485 en FailureSensorIQ) son resultados locales, no reproducidos de forma independiente, y que las pruebas posteriores de seleccion de fuente y de formato JSON fallaron. El adaptador no ha sido puntuado en el arnes de agentes y el autor advierte de que no valida uso de herramientas, JSON fiable ni respuestas largas.

Se trata, por tanto, de un artefacto de reproducibilidad para investigacion, no de un modelo listo para produccion. El modelo base Qwen2.5-7B-Instruct aporta la arquitectura, el contexto nativo y las capacidades generales; el adaptador solo anade un ajuste de dominio limitado a los dos conjuntos de datos citados, con instrucciones principalmente en ingles y envoltorios en portugues.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Qwen2.5-7B-Instruct); QLoRA NF4 4-bit con doble cuantizacion y computo FP16 |
| Parametros totales | 7B en el modelo base; el adaptador pesa 80.792.096 bytes (unos 0,1 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens de entrada maxima en entrenamiento; el contexto nativo del modelo base no se declara en la informacion disponible |
| Tipos de cuantizacion | QLoRA NF4 4-bit con doble cuantizacion en entrenamiento; el adaptador se distribuye en safetensors; el script de uso admite carga en 4 bits y en CPU/precision completa |
| Idiomas soportados | en, pt (instrucciones principalmente en ingles con envoltorios en portugues; el autor no afirma competencia bilingue evaluada) |
| Licencia | Apache-2.0 (adaptador y material de publicacion); modelo base Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); SHA-256 `1f4be66064376173f1d62064db74d475c44ab6efb37bf94f0aef6f0b95ec6bd5` |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen2.5-7B-Instruct, un transformer decoder-only, mediante QLoRA: cuantizacion NF4 de 4 bits con doble cuantizacion, computo en FP16, rango LoRA 8, alpha 16 y dropout 0.1, con objetivos en las proyecciones q/k/v/o y gate/up/down. La configuracion registrada incluye semilla 42, tres epocas, tasa de aprendizaje 5e-05, microbatch 2, acumulacion de gradiente 16 y 1086 pasos. La seleccion de checkpoint se hizo por perdida de validacion. El autor indica que la revision exacta del modelo base usada en el entrenamiento historico no quedo registrada.

Los datos provienen de FinQA (Chen y colaboradores, licencia MIT) y FailureSensorIQ (IBM Research), convertidos a ejemplos de estilo completion y divididos localmente en 11560/1444/1448 (train/validacion/test). El entrenamiento uso el formato `prompt + ' ' + resposta`, sin plantilla de chat, sin EOS explicito y sin restringir la perdida a los tokens de respuesta. Las particiones son de investigacion y no equivalen a resultados oficiales de leaderboard. Los identificadores de dataset, hashes de particion y la ejecucion de origen se recogen en `provenance.json`.

## Capacidades

- Generacion de texto condicionada a contexto de hasta 4096 tokens de entrada, con decodificacion greedy en la evaluacion historica y limite de 32 tokens nuevos.
- Respuesta a preguntas sobre estados financieros y calculo numerico basico en el dominio FinQA (con rendimiento bajo segun las metricas historicas).
- Clasificacion multilabel de fallos de sensores en el dominio FailureSensorIQ (F1 macro por etiqueta de 0.4485 en la recomputacion v2).
- Capacidades generales heredadas del modelo base Qwen2.5-7B-Instruct (razonamiento, codigo, matematicas, multilingue), no evaluadas especificamente en este adaptador.
- Soporte de tool calling / function calling: no validado; el autor indica que los numeros historicos no validan uso de herramientas.
- Soporte de agentes y razonamiento multi-paso: no puntuado; la evaluacion con arnes de agentes queda como `not_scored`.
- Capacidades multilingues: solo ingles y portugues declarados; sin evidencia de competencia bilingue evaluada.
- Capacidades especiales (vision, audio, thinking mode): no disponibles en este adaptador.

## Casos de uso

- Reproduccion de experimentos de investigacion: cargar el adaptador con `usage.py` y las versiones fijadas (`transformers>=4.57.6`, `peft>=0.19.1`, `bitsandbytes`) para replicar las metricas historicas de FinQA y FailureSensorIQ y contrastarlas con los hashes de `historical_metrics.json`.
- Auditoria de artefactos de publicacion: verificar pesos, checksums y configuracion de entrenamiento (`training_config.json`, `provenance.json`, `checksums.sha256`) antes de reutilizar el adaptador en un pipeline academico.
- Estudio de ajuste fino de bajo rango en dominios verticales: servir como linea base para comparar QLoRA rango 8 frente a otros rangos o tecnicas en tareas de QA financiera e industrial.
- Analisis de fallos de sensores en modo offline: usar el adaptador como clasificador multilabel de etiquetas de fallo sobre registros de sensores, siempre con revision humana dado el F1 macro de 0.4485.
- Extraccion de cifras de informes financieros en prototipos: aplicar el adaptador sobre fragmentos de hasta 4096 tokens para localizar y operar con numeros, verificando cada salida contra el documento original por la baja accuracy reportada (0.0647).
- Docencia y formacion: ilustrar el ciclo completo de QLoRA (cuantizacion NF4, seleccion de checkpoint por validacion, publicacion con procedencia) en cursos de IA aplicada, usando el repositorio como ejemplo de trazabilidad.
- Evaluacion de riesgos de alucinacion: emplear las pruebas de seleccion de fuente fallidas documentadas por el autor como caso de estudio de por que no desplegar adaptadores de dominio sin validacion de contratos de salida.

## Benchmarks y rendimiento

| Evaluacion | Resultado reportado | Muestras |
|---|---:|---:|
| FinQA, accuracy numerica (agregado original, tolerancia 0.001) | 0.0647 | 617 |
| FailureSensorIQ, accuracy exacta de conjunto de etiquetas (multilabel v2) | 0.1203 | 831 |
| FailureSensorIQ, F1 macro por etiqueta (multilabel v2) | 0.4485 | 831 |

Estos resultados son historicos y locales; el autor no los presenta como reproducidos de forma independiente. La generacion se limito a 32 tokens nuevos, 4096 de entrada y decodificacion greedy. Las comparaciones A/B estan confundidas por cambios de batch y tasa de aprendizaje. Las pruebas hibridas posteriores (2026-11-17) fallaron los contratos de seleccion de fuente y la evaluacion con arnes de agentes queda sin puntuar. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador en si ocupa unos 0,1 GB; el modelo base de 7B requiere aproximadamente 14-16 GB en FP16/BF16 y en torno a 5-6 GB en cuantizacion NF4 de 4 bits.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para FP16; RTX 3090/4080 (16-24 GB) para 4 bits.
- Cabe en GPU de consumo: si, con cuantizacion 4 bits en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB), con margen limitado para contexto largo.
- Opciones de despliegue: el repositorio incluye `usage.py` con soporte de carga en 4 bits, CPU y precision completa; el adaptador PEFT es compatible con transformers + peft y puede servirse con vLLM o TGI tras fusionar el adaptador con el modelo base (la fusion no se ha realizado ni validado en esta publicacion).
- Latencia y throughput: no disponibles; el autor no aporta mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ViniciusJS/qwen2.5-7b-hibrido-lora-b-4096 | 7B base + adaptador LoRA | 4096 (entrada de entrenamiento) | Adaptador de dominio FinQA + FailureSensorIQ | Apache-2.0 | Hugging Face (0 descargas, 0 likes) |
| Qwen/Qwen2.5-7B-Instruct | 7B | no disponible en la informacion proporcionada | Modelo instructivo generalista | Apache-2.0 | Hugging Face (modelo base) |
| Adaptadores LoRA de dominio comparables | no disponible | no disponible | Ajuste fino de dominio | no disponible | no disponible |

No se dispone de datos de benchmarks comparables entre estos modelos en la informacion proporcionada, por lo que no es posible establecer una comparacion de rendimiento fiable.

## Limitaciones y advertencias

- Metricas muy bajas en las tareas objetivo: accuracy numerica de 0.0647 en FinQA y accuracy exacta de 0.1203 en FailureSensorIQ; no apto para decisiones financieras o industriales sin verificacion contra la evidencia.
- Las pruebas posteriores de seleccion de fuente fallaron y la respuesta de evidencia fija de la bateria B contenia afirmaciones no respaldadas.
- El adaptador no ha sido puntuado en el arnes de agentes; no hay evidencia de tool calling, JSON fiable, analisis financiero abierto ni respuestas largas correctas.
- Entrenamiento sin plantilla de chat, sin EOS explicito y sin enmascarar la perdida a los tokens de respuesta, lo que puede degradar la calidad del formato instructivo.
- La revision exacta del modelo base usada en el entrenamiento historico no se registro; el ejemplo de uso fija una revision posterior de referencia, no probada historicamente.
- Idiomas limitados a ingles y portugues; sin evaluacion de competencia bilingue.
- Riesgo de alucinacion elevado en dominios financieros por la naturaleza del ajuste y los resultados documentados.
- Licencia Apache-2.0 para el adaptador, pero los datasets de origen mantienen sus propios terminos (FinQA MIT; FailureSensorIQ con discrepancia entre CC-BY-4.0 archivado y Apache-2.0 en la Hub card actual, preservando la atribucion CC-BY).
- Artefacto de investigacion con 0 descargas y 0 likes; sin validacion de la comunidad ni reproduccion independiente.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/ViniciusJS/qwen2.5-7b-hibrido-lora-b-4096
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Proyecto Pesquisa_IC_IA: https://github.com/viniciusjsdev/Pesquisa_IC_IA
- Paper de FinQA: https://aclanthology.org/2021.emnlp-main.300/
- Repositorio de FinQA: https://github.com/czyssrs/FinQA
- Paper de FailureSensorIQ: https://arxiv.org/abs/2506.03278
- Repositorio de FailureSensorIQ: https://github.com/IBM/FailureSensorIQ
- Informe tecnico de Qwen2.5: https://arxiv.org/abs/2412.15115
