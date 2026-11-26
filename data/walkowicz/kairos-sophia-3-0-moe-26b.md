# Walkowicz/kairos-sophia-3.0-moe-26b

## Resumen
Kairos Sophia 3.0 MoE 26B es un modelo de lenguaje multimodal con arquitectura de mezcla de expertos (MoE) desarrollado por Walkowicz. Se presenta como un ajuste fino (fine-tuning) del modelo base `thinkingmachines/Inkling-2-Mini`, orientado especificamente a tareas de ingenieria de software, modernizacion de sistemas legados (COBOL, Java, Jakarta EE, Quarkus) y codificacion agentica con soporte de tool calling. El modelo integra una torre de vision nativa, lo que le permite procesar entradas de imagen y texto.

El modelo cuenta con 26.070.385.152 parametros totales (segun los pesos en safetensors) y utiliza una arquitectura MoE con 128 expertos enrutados mas expertos compartidos. El entrenamiento se realizo mediante un pipeline de tres etapas: SFT supervisado, DPO y GRPO con verificacion de ejecucion (RLVR), segun indica la model card. La licencia es Apache 2.0 y el modelo esta disponible principalmente en formato GGUF para su despliegue con Ollama y llama.cpp.

Su relevancia radica en la especializacion vertical: frente a modelos generalistas, este fine-tuning apunta a nichos concretos de ingenieria de software empresarial, incluyendo la modernizacion de sistemas legados, un area donde escasean los modelos abiertos especializados. No obstante, el modelo es muy reciente (publicado en noviembre de 2026) y no cuenta con descargas ni validacion independiente en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer multimodal con torre de vision nativa (Inkling2Loop) |
| Parametros totales | 26.070.385.152 (26,07 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la model card menciona pruebas a 16K de contexto, sin especificar el maximo) |
| Tipos de cuantizacion | BF16, Q5_K_M, UD-Q3_K_XL, UD-IQ1_M (GGUF); mmproj en BF16 y Q8_0 |
| Idiomas soportados | Ingles (en) y portugues de Brasil (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 96,9 GB); safetensors en el modelo base |

## Arquitectura y entrenamiento
El modelo se basa en la arquitectura `Inkling2Loop` del modelo `thinkingmachines/Inkling-2-Mini`, con 1.116 tensores fusionados en SafeTensors: 694 correspondientes al LLM y 422 a la torre de vision (`model.visual`). La arquitectura es MoE con 128 expertos enrutados mas expertos compartidos, e incluye una torre de vision nativa que se preserva integramente (422 tensores `mmproj` en BF16 y Q8_0). No se especifica el numero de parametros activos por token ni la longitud maxima de contexto en la informacion disponible.

El entrenamiento siguio un pipeline de tres etapas segun la model card: (1) SFT completo con 22.754 muestras curadas durante 500 pasos, alcanzando un `eval_loss` de 0,3292 y 12,37 millones de tokens supervisados; (2) DPO con 409 pares centrados en WCAG y Jakarta EE, con una precision de recompensa del 100% en el conjunto de validacion (paso 12 de evaluacion, +10,77); y (3) GRPO con RLVR verificada por ejecucion. No se detalla la composicion exacta del dataset ni el numero total de tokens de preentrenamiento del modelo base.

## Capacidades
- Generacion de texto y razonamiento general en ingles y portugues de Brasil.
- Comprension de imagenes y texto (pipeline `image-text-to-text`) mediante torre de vision nativa.
- Generacion y analisis de codigo, con especial enfasis en ingenieria de software.
- Modernizacion de sistemas legados: COBOL, Java, Jakarta EE y Quarkus.
- Desarrollo frontend.
- Codificacion agentica (agentic coding) y razonamiento multi-paso.
- Soporte de tool calling / function calling.
- Capacidades conversacionales multi-turno.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documentan capacidades de audio ni modo de razonamiento explicito (thinking mode) en la informacion disponible.

## Casos de uso
- Modernizacion de sistemas COBOL: el modelo puede analizar fragmentos de codigo COBOL y proponer su traduccion o reestructuracion hacia Java o servicios Jakarta EE, aprovechando su entrenamiento especifico en este dominio.
- Migracion a Jakarta EE y Quarkus: asistencia en la refactorizacion de aplicaciones Java empresariales hacia frameworks modernos, con soporte de tool calling para integrarse en pipelines automatizados.
- Revision de accesibilidad web (WCAG): dado su entrenamiento DPO centrado en WCAG, puede auditar componentes frontend y sugerir correcciones de accesibilidad.
- Agente de codificacion en CI/CD: al soportar tool calling y razonamiento multi-paso, puede integrarse como agente que ejecuta tareas de analisis, parcheo y validacion dentro de pipelines.
- Analisis de diagramas y capturas de interfaz: gracias a la torre de vision, puede interpretar imagenes de arquitectura, diagramas UML o capturas de UI para generar codigo o documentacion.
- Asistencia tecnica bilingue EN/PT-BR: atencion a desarrolladores en equipos lusofonos e internacionales, con conversaciones multi-turno.
- Generacion de codigo frontend a partir de descripciones o maquetas visuales.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente reporta metricas internas del proceso de entrenamiento y de inferencia:

| Metrica | Valor |
|---|---|
| SFT eval_loss (Gate G2, 500 pasos) | 0,3292 |
| Tokens supervisados SFT | 12,37 M (22.754 muestras) |
| DPO precision de recompensa (held-out) | 100% (+10,77) |
| Pares DPO | 409 |
| Throughput en A100 (UD-Q3_K_XL) | 50-53 tok/s de generacion; 930+ tok/s de prompt |
| Contexto en prueba de throughput | 16K |

## Requisitos de hardware
- VRAM estimada: no disponible de forma oficial. Como referencia orientativa por tamano (26,07B parametros): en BF16 requeriria aproximadamente 52 GB; en Q5_K_M en torno a 18-19 GB; en UD-Q3_K_XL alrededor de 12-13 GB; en UD-IQ1_M en torno a 7-8 GB. Estas cifras son estimaciones por parametros y no datos publicados por el autor.
- GPU recomendadas: el autor reporta pruebas en A100 con UD-Q3_K_XL. Para BF16 se requeririan GPU de 80 GB (A100/H100) o multiples GPU.
- GPU de consumo: las cuantizaciones UD-Q3_K_XL y UD-IQ1_M podrian caber en GPU de consumo de 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 4090), si bien no hay confirmacion oficial.
- Opciones de despliegue: llama.cpp, Ollama (tag `ollama`), y compatibilidad con endpoints; el tag `unsloth` sugiere soporte de dicha herramienta.
- Latencia y throughput: 50-53 tok/s de generacion y 930+ tok/s de procesamiento de prompt en A100 con UD-Q3_K_XL y contexto de 16K, segun el autor.

## Comparativa con modelos similares
No se dispone de datos de benchmarks ni de modelos comparables documentados en la informacion proporcionada. Como referencia estructural, se puede comparar con su modelo base:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kairos Sophia 3.0 MoE 26B | 26,07B (MoE) | no disponible | Apache 2.0 | GGUF | Fine-tuning especializado en ingenieria de software y vision |
| thinkingmachines/Inkling-2-Mini | no disponible | no disponible | no disponible | no disponible | Modelo base del que deriva |

No se dispone de informacion sobre alternativas comparables de la misma categoria en los datos proporcionados.

## Limitaciones y advertencias
- Modelo muy reciente y sin validacion independiente: 0 descargas y 0 likes en el momento de la ficha, lo que impide contrastar su rendimiento real.
- Solo soporta ingles y portugues de Brasil; no se documenta soporte de castellano ni de otros idiomas.
- No se especifica la longitud maxima de contexto, lo que dificulta planificar su uso en tareas de contexto largo.
- No se publican benchmarks estandar, por lo que las afirmaciones de calidad se basan unicamente en metricas internas de entrenamiento.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en la generacion de codigo y en la traduccion de sistemas legados, donde los errores pueden ser costosos.
- La especializacion en dominios concretos (COBOL, Jakarta EE, Quarkus) puede implicar un rendimiento inferior en tareas generales fuera de ese nicho.
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), conviene verificar las condiciones del modelo base `thinkingmachines/Inkling-2-Mini`, cuya licencia no se detalla en la informacion disponible.
- Las estimaciones de VRAM son orientativas y no estan confirmadas oficialmente por el autor.
- El repositorio es de gran tamano (96,9 GB), lo que puede complicar su descarga y almacenamiento.

## Enlaces
- Hugging Face: https://huggingface.co/Walkowicz/kairos-sophia-3.0-moe-26b
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.
