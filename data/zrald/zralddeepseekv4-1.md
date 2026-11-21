# Zrald/zralddeepseekv4.1

## Resumen

Zrald DeepSeek-V4.1-Flash-748B es una release de cuantizacion GGUF del modelo base `deepseek-ai/DeepSeek-V4.1-Flash`, publicada por el usuario Zrald. El modelo base es un transformer de tipo mezcla de expertos (MoE) con 748.494.684.784 parametros totales, segun los datos de safetensors del repositorio, e incorpora un componente denominado "Engram" en la model card. Esta release distribuye unicamente la variante `compressed` (Q2_K_DEEPSEEK) en siete shards GGUF, con un tamano de repo de 264,5 GB.

La propuesta tecnica central es la denominada Decision Surface Consistency (DSC), una tecnica de cuantizacion pensada para evitar el colapso del router en modelos MoE de muchos expertos (la model card menciona 384 expertos) cuando se aplican bits bajos. Segun el autor, mantener el router en Q8_0 (menos de 63 MB) permite conservar entre el 97,61% y el 99,99% de la precision del modelo de referencia a 245,5 GB, frente a los 473,1 GB del Q8_0 de referencia.

El interes practico es que el autor publica mediciones realizadas en una unica GPU AMD Instinct MI300X (192 GB HBM3), con un endpoint compatible con OpenAI y throughput de decodificacion de 44-54 tok/s. Es una release orientada a despliegue en hardware AMD, no en GPUs de consumo, y requiere un fork especifico de llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con componente "Engram" (etiqueta `deepseek41`); numero de expertos no confirmado de forma independiente (la model card cita 384) |
| Parametros totales | 748.494.684.784 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K_DEEPSEEK (variante distribuida); Q4_K_M, Q3_K_M y Q8_0 documentados como brazos de evaluacion no distribuidos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (7 shards `compressed-*`); repo de 264,5 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos de gran escala (748B parametros totales) con un mecanismo adicional que el autor denomina "Engram", del que no se detallan caracteristicas en la informacion disponible. La model card no aporta datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. Tampoco se especifican los parametros activos por token ni la longitud de contexto del modelo base.

La innovacion declarada por el autor de la release es la cuantizacion con Decision Surface Consistency (DSC), que segun la model card evita que la cuantizacion a 2 bits altere las decisiones de gating del router en un MoE de muchos expertos. La estrategia consiste en mantener el router en Q8_0 (menos de 63 MB) mientras el resto de pesos se comprime a Q2_K, lo que permite reducir el peso a 245,5 GB conservando, segun las mediciones del autor, entre el 97,61% y el 99,99% de la precision de referencia. Estas cifras proceden exclusivamente de la model card y no se han verificado de forma independiente.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`, etiqueta `conversational`).
- Generacion de codigo: la model card documenta la produccion de un fichero FastAPI con SQLAlchemy 2.0, autenticacion JWT y OAuth2 que pasa `py_compile`.
- Generacion de HTML y JavaScript: se documenta la creacion de una landing page de 579 lineas y de un juego de snake en canvas funcional en una sola pasada.
- Razonamiento aritmetico basico y respuesta a preguntas factuales (sondas de correccion: `127*43 → 5461`, capital de Francia, `2+2`).
- Razonamiento matematico: la model card reporta una retencion del 99,95% en razonamiento matematico frente a la referencia Q8_0.
- Servido mediante endpoint compatible con OpenAI (etiqueta `endpoints_compatible`).
- Soporte de tool calling, function calling, agentes y modo thinking: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponible.

## Casos de uso

- Despliegue de un modelo de 748B en una unica GPU MI300X: la release esta medida y validada en ese hardware, con 191,6 GB de HBM3 ocupados y un endpoint compatible con OpenAI, lo que permite servir el modelo sin un cluster multi-GPU.
- Generacion de codigo en produccion: la model card documenta la generacion de un backend FastAPI que compila correctamente, lo que lo hace adecuado para scaffolding de servicios y prototipado rapido de APIs.
- Generacion de front-end: la produccion de una landing page HTML completa con diseno responsive y de un juego interactivo en canvas sugiere utilidad para generar interfaces y demos funcionales.
- Razonamiento matematico y aritmetico: la retencion del 99,95% en matematicas frente a la referencia permite usar la variante comprimida en tareas de calculo y resolucion de problemas donde el ahorro de memoria es prioritario.
- Evaluacion de tecnicas de cuantizacion: el repositorio incluye datos de benchmark, logs de servidor y artefactos generados, lo que lo convierte en material de referencia para investigar el comportamiento de MoE cuantizados a 2 bits.
- Investigacion sobre routers en MoE: la tecnica DSC y los resultados de retencion por categoria (accuracy, balance, compressed) sirven como base para estudiar el efecto de la cuantizacion en las decisiones de gating.
- Entornos con restricciones de memoria: la reduccion del 48,1% del peso frente al Q8_0 de referencia (245,5 GB frente a 473,1 GB) permite desplegar el modelo en nodos con menos HBM o con offload parcial a DRAM.

## Benchmarks y rendimiento

Datos publicados en la model card, medidos por el autor en una AMD Instinct MI300X (192 GB HBM3, 235 GB RAM) contra la referencia Q8_0. No se han verificado de forma independiente.

| Tier | Rung | Tamano | Memoria ahorrada | Retencion vs ref. | Perplejidad Wikitext | Retencion codigo Python | Retencion matematicas |
|---|---|---|---|---|---|---|---|
| Referencia base | Q8_0 | 473,1 GB | 0,0% | 100,00% | 1,8342 | 100,00% | 100,00% |
| accuracy | Q4_K_M | 414,2 GB | 12,5% | 92,88% – 99,06% | 1,9748 | 98,42% | 99,10% |
| balance | Q3_K_M | 309,2 – 323,4 GB | 34,6% | 86,32% – 97,41% | 1,8829 | 96,80% | 97,15% |
| compressed (distribuido) | Q2_K_DS | 245,5 GB | 48,1% | 97,61% – 99,99% | 1,8792 | 100,18% | 99,95% |

Rendimiento de inferencia medido en la ejecucion del 2026-10-05 en una MI300X:

| Metrica | Valor medido |
|---|---|
| Carga del modelo (mmap) | ~38 s hasta primer listen |
| Throughput de decodificacion | 44–54 tok/s |
| Prefill (prompts cortos) | 93–130 tok/s |
| TTFT | 150–437 ms |
| VRAM / DRAM host | 191,6 / 192 GB HBM3, ~8 GB de delta en DRAM |
| Temperatura de GPU | 46 °C junction |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 191,6 GB de HBM3 medidos para la variante comprimida distribuida, mas ~8 GB de DRAM host.
- GPU validada: AMD Instinct MI300X (192 GB HBM3, arquitectura gfx942). Es el unico hardware con mediciones publicadas.
- GPU de consumo: no cabe en ninguna GPU de consumo actual; el modelo completo requiere ~192 GB de memoria aceleradora.
- Despliegue: llama.cpp mediante el fork `vcruz305/llama.cpp`, rama `runtime/deepseek41`. El llama.cpp upstream falla con `unknown model architecture: 'deepseek41'`. Compilacion con `-DGGML_HIP=ON`, `amdclang++` y `gfx942`.
- Script de despliegue: `./scripts/serve_deepseek4.1_mi300x.sh all` (compila, descarga, arranca y ejecuta benchmarks).
- Throughput: 44–54 tok/s en decodificacion y 93–130 tok/s en prefill sobre MI300X.
- Soporte en vLLM, TGI u Ollama: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables en la informacion proporcionada. La unica comparacion documentada es interna al propio repositorio, entre las tres categorias de cuantizacion del mismo modelo (accuracy Q4_K_M, balance Q3_K_M y compressed Q2_K_DS) y la referencia Q8_0, recogida en la tabla de benchmarks. No se han publicado comparaciones con otros modelos de la misma categoria en la informacion disponible.

## Limitaciones y advertencias

- Las cifras de retencion, perplejidad y rendimiento proceden exclusivamente de la model card del autor y de sus propios artefactos de evidencia; no se han verificado de forma independiente.
- La model card reporta retenciones superiores al 100% en algunos ejes (por ejemplo, 100,18% en codigo Python para la variante comprimida), lo que indica ruido de medicion y exige cautela al interpretar los resultados.
- El modelo solo funciona con un fork no oficial de llama.cpp; el upstream no reconoce la arquitectura `deepseek41`. Esto implica dependencia de mantenimiento de terceros y riesgo de rotura.
- El repositorio distribuye unicamente la variante comprimida (Q2_K_DEEPSEEK); las variantes accuracy, balance, q6k y q8_0 no estan disponibles como pesos.
- No se especifican los idiomas soportados ni la longitud de contexto, lo que impide evaluar su idoneidad para tareas multilingues o de contexto largo.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; al tratarse de un modelo de 748B, cabe esperar los riesgos habituales de los LLM de gran escala, pero no hay datos especificos.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base `deepseek-ai/DeepSeek-V4.1-Flash`, ya que la release es una cuantizacion derivada.
- El hardware requerido (~192 GB de HBM) limita el despliegue a aceleradores de clase datacenter, en la practica MI300X o equivalentes.
- La fecha de creacion del repositorio (2026-09-21) y el modelo base referenciado no permiten contrastar la informacion con fuentes independientes en el momento de redactar esta ficha.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Zrald/zralddeepseekv4.1
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Whitepaper (PDF): https://huggingface.co/Zrald/zralddeepseekv4.1/blob/main/whitepaper.pdf
- Blog de serving en MI300X: https://huggingface.co/Zrald/zralddeepseekv4.1/blob/main/docs/DEEPSEEK_V41_FLASH_ON_MI300X.md
- Fork de llama.cpp requerido: https://github.com/vcruz305/llama.cpp (rama `runtime/deepseek41`)
- Artefactos generados: https://huggingface.co/Zrald/zralddeepseekv4.1/tree/main/artifacts
- Evidencia de la ejecucion: https://huggingface.co/Zrald/zralddeepseekv4.1/tree/main/evidence/run_20261005
