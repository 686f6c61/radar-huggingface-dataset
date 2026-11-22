# vcruz305/DSV4.1-Flash-1017-SAGE-REXL3-1.55bpw

## Resumen

DSV4.1-Flash-1017-SAGE-REXL3-1.55bpw es un empaquetado cuantizado del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek, publicado por el usuario vcruz305 en Hugging Face. No se trata de un modelo nuevo, sino de una compresion agresiva del modelo original (256.622.688.722 parametros, aproximadamente 256,6 mil millones) en formato EXL3/REXL3 mediante el metodo propietario SAGE de cuantizacion de precision mixta, que asigna distintos valores de K de EXL3 a cada tensor. El resultado ocupa unos 320,3 GB en el repositorio y requiere aproximadamente 108,5 GiB de memoria unificada para el modo texto y 109,4 GiB para el modo vision-lenguaje.

El modelo base es un Mixture-of-Experts (MoE) de DeepSeek con 40 capas, 384 expertos enrutados mas 1 compartido y enrutamiento top-6, disenado para tareas multimodales de imagen a texto. La relevancia de este pack radica en que reduce el modelo a 1,55 bits por peso manteniendo una alta fidelidad respecto a la version oficial en FP8/FP4 de DeepSeek: un 94,41 % de coincidencia Top-1 y una divergencia KL media de 0,0509 sobre secuencias retenidas. Esto lo hace viable en dispositivos de memoria unificada de clase 128 GB, un perfil de hardware mucho mas accesible que el del modelo original.

La licencia es MIT, heredada del modelo base, lo que facilita su uso comercial. El pack esta pensado exclusivamente para ExLlamaV3 y no es compatible con otras librerias de inferencia. Se publico el 31 de octubre de 2026 y se actualizo el 2 de noviembre de 2026, acumulando 643 descargas y 3 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture-of-Experts) con 40 capas, 384 expertos enrutados + 1 compartido, enrutamiento top-6 |
| Parametros totales | 256.622.688.722 (aproximadamente 256,6 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3/REXL3 (trellis) con precision mixta SAGE a 1,55 bpw; el modelo base oficial usa FP8/FP4 mixto |
| Idiomas soportados | no disponible (la model card no detalla idiomas; el desglose de calidad incluye una categoria "Multilingual") |
| Licencia | MIT |
| Formato de pesos | safetensors en 17 shards (`model-00001-of-00017.safetensors` a `model-00017-of-00017.safetensors`), con indice `model.safetensors.index.json`, `quant_method: exl3` |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4.1-Flash-1017 es un MoE de DeepSeek descrito en la model card como "MIT CED MoE": 40 capas, 384 expertos enrutados mas uno compartido, con enrutamiento top-6. La arquitectura es de tipo transformer con mezcla de expertos, y el pipeline declarado es image-text-to-text, lo que indica capacidades multimodales de vision y lenguaje. La model card del pack no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; esa informacion corresponde a la model card del modelo base de DeepSeek, que no se incluye en la informacion proporcionada.

La innovacion tecnica de este repositorio es el metodo SAGE, una tecnica propia de cuantizacion de precision mixta para EXL3 en la que cada tensor recibe un valor K distinto y los kernels leen ese K directamente del tensor trellis al cargarlo. El metodo no esta publicado. El pack se ha dimensionado para un unico dispositivo de memoria unificada de clase 128 GB, con una huella residente de aproximadamente 108,5 GiB en modo texto y 109,4 GiB en modo VLM. El autor afirma que la cuantizacion a 1,55 bpw preserva una alta concordancia a nivel de token con la version oficial mixta FP8/FP4 de DeepSeek.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline `image-text-to-text` y tag `conversational`).
- Procesamiento de imagen y texto combinados, segun el pipeline declarado.
- Razonamiento: la model card incluye una categoria de evaluacion "Reasoning" con un 97,59 % de coincidencia Top-1 frente al modelo oficial.
- Generacion de codigo: categoria "Code" con 97,86 % de Top-1 y "SWE Patch" con 97,60 %.
- Matematicas: categoria "Math" con 90,96 % de Top-1.
- Conocimiento general y tipo MMLU-Pro: 96,02 % en "General" y 91,54 % en "MMLU-Pro".
- Capacidades multilingues: existe una categoria "Multilingual" en la evaluacion (91,74 % de Top-1), aunque no se detallan los idiomas concretos.
- Seguimiento de instrucciones: categoria "IFEval" con 94,59 % de Top-1.
- Ciberseguridad: categoria "Cyber" con 96,05 % de Top-1.
- Soporte de tool calling, function calling y comportamiento agentico: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de codigo en produccion: el pack conserva un 97,86 % de coincidencia Top-1 en la categoria Code y un 97,60 % en SWE Patch respecto al modelo oficial, por lo que puede emplearse para autocompletado, refactorizacion y generacion de parches en pipelines de integracion continua, siempre que el hardware admita la huella de 108,5 GiB.
- Razonamiento y resolucion de problemas complejos: con un 97,59 % de Top-1 en la categoria Reasoning, es adecuado para tareas de analisis multi-paso, planificacion y explicaciones encadenadas donde se tolera una minima desviacion respecto al modelo original.
- Asistencia matematica y STEM: la categoria Math retiene un 90,96 % de Top-1 y GPQA/STEM un 89,03 %, lo que lo hace util para tutoria, resolucion de problemas cuantitativos y generacion de explicaciones tecnicas.
- Analisis de documentos con imagenes: al declararse como image-text-to-text, puede procesar capturas, diagramas o formularios junto con texto para extraccion de informacion y respuesta a preguntas sobre el contenido visual.
- Atencion al cliente automatizada: el tag `conversational` y la capacidad de conversacion multi-turno permiten desplegar agentes de soporte; la ventana de contexto concreta no esta disponible, por lo que debe validarse antes de asumir conversaciones largas.
- Analisis de seguridad y ciberseguridad: la categoria Cyber retiene un 96,05 % de Top-1, lo que permite usar el modelo para revision de codigo orientada a vulnerabilidades, clasificacion de incidentes y generacion de informes tecnicos de seguridad.
- Evaluacion de instrucciones y generacion de contenido estructurado: con un 94,59 % en IFEval, es apropiado para tareas que exigen cumplir formatos estrictos, como generacion de JSON, plantillas o respuestas con restricciones.
- Despliegue en estaciones de trabajo de gran memoria: al caber en un dispositivo de memoria unificada de clase 128 GB, permite ejecutar un modelo de 256,6 mil millones de parametros en entornos de una sola maquina, sin necesidad de un cluster multi-GPU.

## Benchmarks y rendimiento

Los datos disponibles son medidas de fidelidad de la cuantizacion frente a la version oficial de DeepSeek en FP8/FP4, no benchmarks de tareas estandar como MMLU o HumanEval. Se presentan a continuacion tal como los publica el autor:

| Categoria | KL media vs oficial FP8/FP4 | KL p50 | Top-1 | Top-1 solo respuesta | Top-5 solapamiento |
|---|---|---|---|---|---|
| Code | 0,0142 (0,0111 respuesta) | 0,000060 | 97,86 % | 98,04 % | 85,76 % |
| SWE Patch | 0,0199 (0,0118 respuesta) | 0,000020 | 97,60 % | 98,01 % | 84,50 % |
| Reasoning | 0,0148 (0,0096 respuesta) | 0,000015 | 97,59 % | 98,12 % | 83,60 % |
| Cyber | 0,0499 | 0,000138 | 96,05 % | 95,99 % | 82,16 % |
| General | 0,0222 (0,0169 respuesta) | 0,000002 | 96,02 % | 96,08 % | 81,74 % |
| IFEval | 0,0442 (0,0238 respuesta) | 0,000002 | 94,59 % | 92,52 % | 79,21 % |
| Prose / Narrative | 0,0575 (0,0492 respuesta) | 0,000466 | 93,74 % | 93,46 % | 82,91 % |
| Multilingual | 0,1303 (0,1313 respuesta) | 0,000624 | 91,74 % | 91,39 % | 73,50 % |
| MMLU-Pro | 0,0419 (0,0265 respuesta) | 0,000007 | 91,54 % | 85,05 % | 78,07 % |
| Math | 0,0356 (0,0329 respuesta) | 0,000055 | 90,96 % | 80,39 % | 81,41 % |
| GPQA / STEM | 0,1052 (0,0515 respuesta) | 0,020997 | 89,03 % | 90,12 % | 81,71 % |

Agregado global del pack: KL media 0,0509, KL p50 0,00007, Top-1 94,41 % y Top-5 81,31 %. La version oficial FP8/FP4 se toma como referencia con KL 0 y 100 % de coincidencia. No se han publicado resultados de benchmarks de tareas estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 108,5 GiB en modo texto y 109,4 GiB en modo VLM, segun el autor. El repositorio ocupa 320,3 GB en disco (17 shards).
- GPU recomendadas: el pack esta dimensionado para un unico dispositivo de memoria unificada de clase 128 GB, lo que apunta a hardware como Apple Silicon de gama alta o GPUs con memoria unificada de esa capacidad; no se especifican modelos concretos de GPU en la informacion disponible.
- GPU de consumo: no cabe en GPUs de consumo convencionales (RTX 4090 con 24 GB, RTX 5090 con 32 GB u otras similares), dado que la huella supera los 100 GiB.
- Opciones de despliegue: exclusivamente ExLlamaV3 con soporte EXL3/REXL3. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato trellis EXL3 es especifico de ExLlamaV3.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota de muestreo: el `generation_config.json` del pack fija `top_p=0.95`, mientras que DeepSeek recomienda `top_p=1.0` y `temperature=1.0`; para seguir al modelo original debe ajustarse explicitamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DSV4.1-Flash-1017-SAGE-REXL3-1.55bpw (este pack) | 256,6 mil millones | no disponible | EXL3 1,55 bpw | MIT | Hugging Face, ExLlamaV3 |
| DeepSeek-V4.1-Flash-1017 (oficial) | 256,6 mil millones | no disponible | FP8/FP4 mixto | MIT | Hugging Face |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es contra el modelo base oficial de DeepSeek, que sirve como referencia de calidad (KL 0, Top-1 100 %). No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de fidelidad respecto al modelo oficial: la coincidencia Top-1 global es del 94,41 %, con un 5,59 % de tokens que difieren del modelo FP8/FP4. En categorias como GPQA/STEM (89,03 %) y Math (Top-1 solo respuesta del 80,39 %) la desviacion es mayor.
- Mayor degradacion en multilingue: la categoria Multilingual muestra la peor KL media (0,1303) y el menor solapamiento Top-5 (73,50 %), lo que sugiere un impacto mas acusado en idiomas distintos del ingles.
- Metodo de cuantizacion no publicado: SAGE es propietario y no esta documentado, lo que dificulta auditar el proceso o reproducir los resultados de calidad.
- Compatibilidad limitada: solo funciona con ExLlamaV3; no hay soporte para vLLM, llama.cpp, Ollama ni TGI, lo que restringe las opciones de despliegue en produccion.
- Requisito de hardware elevado: mas de 100 GiB de memoria unificada, fuera del alcance de GPUs de consumo.
- Configuracion de muestreo inconsistente: el `top_p=0.95` por defecto difiere del `top_p=1.0` recomendado por DeepSeek.
- Riesgo de alucinacion y sesgos: no se documentan en la model card; deben asumirse los del modelo base, no evaluados en este pack.
- Idiomas soportados y longitud de contexto: no especificados, lo que impide garantizar su comportamiento en escenarios que dependan de estos parametros.
- Licencia MIT: permite uso comercial, pero el autor indica que debe citarse a DeepSeek por el modelo base; este repositorio solo contiene el pack EXL3.

## Enlaces

- Repositorio del pack: https://huggingface.co/vcruz305/DSV4.1-Flash-1017-SAGE-REXL3-1.55bpw
- Modelo base oficial: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Perfil del autor: https://huggingface.co/vcruz305
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
