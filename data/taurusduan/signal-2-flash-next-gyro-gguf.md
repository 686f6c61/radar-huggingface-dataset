# taurusduan/Signal-2-Flash-Next-Gyro-GGUF

## Resumen

Signal 2 Flash Next Gyro es un ajuste fino (finetune) del modelo Qwen3.8-Flash-Next de Alibaba, publicado por el desarrollador taurusduan bajo la marca AgentionAI. Se distribuye exclusivamente en formato GGUF cuantizado, con un pipeline declarado de image-text-to-text, lo que indica que hereda capacidades multimodales del modelo base. El modelo está orientado a cargas de trabajo de agentes de codificacion: la model card describe un entrenamiento sobre sesiones reales de un agente de codigo de codigo abierto llamado Marshall, con destilacion propia a partir de sesiones exitosas y auditadas, fusionadas directamente en los pesos sin adaptadores adicionales.

La propuesta de valor no es una mayor tasa de acierto bruta, sino la eficiencia en tokens: segun los datos del autor, con esfuerzo de razonamiento xhigh iguala en tareas superadas a Swift 1.5 IQ3_S (137 frente a 139 de 152 sesiones) consumiendo un 41 % menos de tokens de salida y ocupando aproximadamente la mitad de memoria de GPU (30,7 GB frente a 54,9 GB). Frente a su propio modelo sin ajustar del mismo tamano (Gyro-S), supera las mismas tareas con un 27 % menos de tokens, lo que se traduce en un 14 % menos de tiempo por ejecucion.

El modelo base declara 125.743.653.760 parametros (unos 125,7 mil millones) y un repositorio de 93,9 GB en formato GGUF. La licencia es qwen-community-1.0, lo que impone las condiciones de uso de la comunidad de Qwen y no una licencia plenamente permisiva. Es relevante ahora porque demuestra que el ajuste fino orientado a la eficiencia de tokens, y no solo a la precision, puede reducir costes de inferencia y requisitos de hardware en pipelines de agentes de codigo que ejecutan muchas sesiones multi-turno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-Flash-Next; transformer multimodal segun pipeline image-text-to-text) |
| Parametros totales | 125.743.653.760 (125,7 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF cuantizado; el autor menciona IQ3_S y Q5_K_M en comparativas, pero no se detalla el conjunto completo de quants del repo |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (licencia "other" en Hugging Face) |
| Formato de pesos | GGUF |
| Tamano del repositorio | 93,9 GB |
| Pipeline | image-text-to-text |
| Modelo base | Qwen/Qwen3.8-Flash-Next (relacion: finetune) |
| Memoria en GPU (referencia del autor) | 30,7 GB sin la tabla por capas de 28,8 GB, que puede residir en disco |

## Arquitectura y entrenamiento

La arquitectura concreta no se detalla en la informacion disponible mas alla de que el modelo base es Qwen3.8-Flash-Next y de que el pipeline declarado es image-text-to-text, lo que implica un transformer multimodal con codificador de vision. El ajuste fino se realizo sobre sesiones reales de trabajo de agentes de codigo ejecutadas en Marshall, el agente de codigo de codigo abierto de AgentionAI, mediante un proceso de autodestilacion a partir de sus propias sesiones exitosas y limpias en auditoria, fusionadas en los pesos del modelo base. El resultado es un unico archivo GGUF sin adaptadores separados.

La innovacion tecnica declarada es la eficiencia en tokens: el ajuste reduce la narracion y la deliberacion redundante, de modo que el modelo lee, edita, ejecuta y verifica codigo como el modelo base pero deja de deliberar cuando el siguiente paso esta claro. Segun el autor, esto se traduce en un 27 % menos de tokens de salida que el Gyro-S sin ajustar con la misma tasa de tareas superadas, y en un 41 % menos que Swift 1.5 IQ3_S con esfuerzo xhigh. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento con modos de esfuerzo configurables (el autor cita `reasoning_effort` con valores como medium y xhigh).
- Ejecucion de tareas de agente de codigo: lectura de repositorio, edicion de archivos, ejecucion de comandos y verificacion de resultados.
- Capacidades multimodales de entrada imagen-texto heredadas del pipeline image-text-to-text del modelo base.
- Comportamiento de agente de multiples pasos con menor verbosidad y menos tokens de salida por tarea.
- Compatibilidad con endpoints (`endpoints_compatible`) y etiqueta conversacional.
- Soporte de tool calling y function calling: no confirmado explicitamente en la informacion disponible.
- Capacidades multilingues: no disponibles; no se declara lista de idiomas.

## Casos de uso

- Agentes de codigo autonomos en produccion: el modelo esta ajustado sobre sesiones reales de un agente de codigo, por lo que puede integrarse en bucles de lectura-edicion-ejecucion-verificacion con un consumo de tokens de salida un 41 % inferior a alternativas de 3 bits, reduciendo el coste por tarea.
- Despliegue en hardware de gama alta de consumo o estaciones de trabajo: con 30,7 GB en GPU cabe en tarjetas de 32 GB, lo que permite ejecutar un modelo de 125,7 B en una unica GPU profesional o de consumo de gran capacidad sin recurrir a multi-GPU.
- Asistencia a revision de codigo en CI/CD: el modelo puede analizar diffs, ejecutar comprobaciones y proponer correcciones dentro de un pipeline, beneficiandose de su bajo consumo de tokens para tareas repetitivas.
- Automatizacion de tareas de mantenimiento de repositorios: actualizacion de dependencias, refactorizaciones acotadas y correccion de tests fallidos, con verificacion iterativa de resultados.
- Analisis de capturas o diagramas tecnicos junto a codigo: gracias a la entrada image-text-to-text, puede interpretar imagenes de errores, diagramas de arquitectura o interfaces junto con el contexto textual del repositorio.
- Evaluacion comparativa de agentes: sirve como referencia de eficiencia en tokens para medir el coste real de un agente de codigo frente a cuantizaciones de 3 y 5 bits del mismo modelo base.
- Entornos con memoria limitada que requieren modelos grandes: al mantener la tabla por capas en disco, el autor reporta ejecucion en una tarjeta de 32 GB, lo que habilita prototipado de agentes con un modelo de 125,7 B en una sola GPU.

## Benchmarks y rendimiento

Los datos proceden de la evaluacion propia del autor sobre su banco de pruebas de agente de codigo Marshall. No son benchmarks academicos estandar (MMLU, HumanEval, GSM8K) y no se han publicado resultados en esos conjuntos en la informacion disponible.

| Modelo (esfuerzo xhigh) | Memoria en GPU | Tareas superadas (de 152) | Tokens de salida medios por sesion |
|---|---:|---:|---:|
| Signal 2 | 30,7 GB | 137 | 2.373 |
| Swift 1.5 IQ3_S (ukisai) | 54,9 GB | 139 | 4.013 |

El autor indica que la diferencia de tareas superadas es un empate estadistico (prueba de signos pareada, p = 0,82) y que la sesion mediana usa un 48 % menos de tokens.

| Modelo (esfuerzo medium) | Memoria en GPU | Tareas superadas (de 76) | Tokens de salida por sesion |
|---|---:|---:|---:|
| Signal 2 | 30,7 GB | 68 | 1.685 |
| Qwen3.8-Flash-Next Gyro-S (sin ajustar) | 29,7 GB | 68 | 2.323 |
| Swift 1.5 IQ3_S (ukisai) | 54,9 GB | 66 | 2.319 |
| Swift 1.5 IQ3_S_G8 (ukisai) | 55,6 GB | 67 | 2.395 |
| ISTA GSQ-RCO IQ3_S (ISTA-DASLab) | 54,8 GB | 66 | 2.547 |
| AP-Q5_K_M (AgentionAI) | 82,4 GB | 69 | 2.221 |

En la comparacion a cuatro semillas frente al Gyro-S sin ajustar, el autor reporta 1.623 frente a 2.228 tokens de salida por sesion (27 % menos) con las mismas tareas superadas, y 95 minutos frente a 111 para 76 sesiones. Tambien declara alcanzar el 94 % de la tasa de acierto de su AP-Q5_K_M (133 frente a 141 de 152 sesiones) y cero tiempos de espera agotados, errores o respuestas vacias en 152 sesiones.

## Requisitos de hardware

- VRAM estimada para inferencia: 30,7 GB en GPU para el cuantizado evaluado por el autor, sin contar la tabla por capas de 28,8 GB que puede permanecer en disco.
- GPU recomendadas: tarjetas con 32 GB o mas de memoria, como NVIDIA RTX 5090 (32 GB) o profesionales tipo A100 40 GB, A6000 o H100; el autor afirma que funciona en una tarjeta de 32 GB.
- Cabe en GPU de consumo: si, en modelos con 32 GB de VRAM; no cabe en tarjetas de 24 GB o menos con este cuantizado.
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp y con entornos que consumen GGUF; el autor menciona compatibilidad con endpoints. No se confirma soporte de vLLM o TGI en la informacion disponible.
- Latencia y throughput: el autor reporta 95 minutos para 76 sesiones frente a 111 del modelo sin ajustar en la misma maquina, y un 14 % menos de tiempo por ejecucion; no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Memoria en GPU | Tareas superadas (de 76, medium) | Tokens de salida por sesion | Licencia | Formato |
|---|---|---:|---:|---:|---|---|
| Signal 2 Flash Next Gyro | 125,7 B | 30,7 GB | 68 | 1.685 | qwen-community-1.0 | GGUF |
| Qwen3.8-Flash-Next Gyro-S (sin ajustar) | no disponible | 29,7 GB | 68 | 2.323 | qwen-community-1.0 | GGUF |
| Swift 1.5 IQ3_S (ukisai) | no disponible | 54,9 GB | 66 | 2.319 | no disponible | GGUF IQ3_S |
| ISTA GSQ-RCO IQ3_S (ISTA-DASLab) | no disponible | 54,8 GB | 66 | 2.547 | no disponible | GGUF IQ3_S |
| AP-Q5_K_M (AgentionAI) | no disponible | 82,4 GB | 69 | 2.221 | qwen-community-1.0 | GGUF Q5_K_M |

Todos los comparables son cuantizaciones del mismo modelo base Qwen3.8-Flash-Next, por lo que la comparacion mide sobre todo el ajuste fino y la estrategia de cuantizacion, no diferencias de arquitectura o de datos de preentrenamiento.

## Limitaciones y advertencias

- Los resultados proceden del banco de pruebas propio del autor (Marshall) y no de benchmarks academicos independientes; deben tratarse como evidencia preliminar y no replicada.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que limita la validacion por parte de la comunidad.
- No se detalla la composicion del dataset de ajuste fino ni el numero de tokens de entrenamiento, lo que dificulta evaluar riesgos de sobreajuste a las tareas del agente Marshall.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como modelo generativo de codigo, puede producir APIs inexistentes o ediciones incorrectas si no se verifica la ejecucion.
- Idiomas soportados no declarados; el comportamiento multilingue fuera del ingles no esta documentado.
- Longitud de contexto no disponible, lo que impide garantizar el manejo de repositorios grandes o conversaciones muy largas.
- La licencia qwen-community-1.0 impone condiciones de uso comunitarias y no es una licencia permisiva tipo Apache 2.0; conviene revisar el archivo LICENSE antes de un uso comercial.
- La memoria en GPU de 30,7 GB excluye la tabla por capas de 28,8 GB, de modo que el rendimiento real depende de que esa tabla resida en disco y de la velocidad del almacenamiento.
- El modelo esta especializado en agentes de codigo; su comportamiento en tareas generales de texto o vision puede diferir del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/taurusduan/Signal-2-Flash-Next-Gyro-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Cuantizaciones Gyro de AgentionAI: https://huggingface.co/agentionai/Qwen3.8-Flash-Next-Gyro-GGUF
- Cuantizaciones AP de AgentionAI: https://huggingface.co/agentionai/Qwen3.8-Flash-Next-AP-GGUF
- Sitio web de AgentionAI: https://www.agention.ai/
- Agente de codigo Marshall: https://marshall.agention.ai
- Fieldwork Ledger: https://www.fieldworkledger.com
