# SZLHOLDINGS/SZL-AncientMath-0.8B-v1

## Resumen

SZL-AncientMath-0.8B-v1 es un modelo de generacion de texto de 873 millones de parametros publicado por SZLHOLDINGS, un proyecto que agrupa modelos, datasets y Spaces bajo lo que el autor denomina "governed-AI estate", con enfasis en trazabilidad y resultados verificables mediante ficheros de recibo (receipts). El modelo se presenta como un artefacto especializado en matemáticas antiguas, derivado por ajuste fino del modelo base SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3, que a su vez pertenece a la familia Qwen 3.5 segun la etiqueta `qwen3_5` del repositorio.

La relevancia de este lanzamiento es limitada pero concreta: se trata de un modelo pequeno (menos de 1.000 millones de parametros) bajo licencia Apache 2.0, lo que permite su despliegue en hardware de consumo y su uso comercial sin restricciones adicionales. Su interes principal radica en el nicho: procesamiento de contenido matematico historico o de tradicion antigua, un dominio poco cubierto por los modelos generalistas.

No obstante, la model card es extremadamente parca en informacion tecnica. No se documentan la longitud de contexto, la composicion del dataset de entrenamiento, el numero de tokens utilizados ni resultados de benchmarks. El autor declara explicitamente que cualquier dato no respaldado por un "receipt" se etiqueta como UNKNOWN, lo que refleja una politica de honestidad pero deja al evaluador sin metricas objetivas para juzgar la calidad del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, segun etiqueta `qwen3_5`; detalles no disponibles) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no documentadas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 873 millones de parametros, heredero de la arquitectura Qwen 3.5 segun la etiqueta del repositorio. Se ha obtenido mediante ajuste fino supervisado (SFT) sobre SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3, un modelo intermedio del mismo autor orientado a tareas de agente con recibos. No se especifica si hubo fases adicionales de RLHF, DPO o preference tuning.

La informacion sobre el corpus de entrenamiento es practicamente inexistente: no se indica el numero de tokens, la composicion del dataset ni la proporcion de contenido matematico historico frente a datos generales. El autor remite a los ficheros de recibo del "estate mesh" para cualquier afirmacion de entrenamiento o evaluacion, y declara explicitamente que lo no documentado debe considerarse desconocido. No se describen innovaciones tecnicas como decodificacion especulativa, attention lineal o modos de razonamiento extendido.

## Capacidades

- Generacion de texto en ingles orientada a contenido matematico, presumiblemente con enfasis en notacion y terminologia de tradicion antigua o historica.
- Razonamiento matematico basico derivado del modelo base Qwen 3.5, aunque no se documenta su alcance ni su fiabilidad.
- Ajuste fino de tipo SFT sobre un modelo previo orientado a agentes con recibos, lo que sugiere cierta capacidad de seguir instrucciones estructuradas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado para esta variante.
- Capacidades multilingues: limitadas al ingles segun el campo `language` del repositorio.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Procesamiento de textos matematicos historicos: el modelo puede emplearse para reformatear, resumir o explicar pasajes de matematicas antiguas (por ejemplo, problemas de tradicion babilonica, griega o china) en ingles moderno, aprovechando su ajuste especifico de dominio.
- Asistencia educativa en historia de las matematicas: integrado en una aplicacion docente, puede generar explicaciones de metodos antiguos (regla de falsa posicion, algebra geometrica) para estudiantes, con la ventaja de su reducido tamano para despliegue local.
- Generacion de ejercicios tematicos: util para crear problemas de practica inspirados en matematicas historicas, con enunciados y soluciones, en un pipeline de generacion de contenido educativo.
- Prototipado rapido en entornos con GPU de consumo: al ocupar menos de 2 GB en pesos originales, permite iterar en portatiles con GPU de 8 GB o menos, lo que facilita experimentacion academica sin infraestructura dedicada.
- Filtrado y clasificacion de corpus: puede usarse como modelo auxiliar para etiquetar o filtrar documentos matematicos historicos en un pipeline de curacion de datos, aprovechando su especializacion.
- Base para ajuste fino adicional: dado su tamano y licencia permisiva, sirve como punto de partida para fine-tuning en subdominios concretos (por ejemplo, matematicas de una civilizacion especifica) con costes de computo muy bajos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y no se incluye ninguna medicion en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,8 GB solo para pesos, mas overhead de activaciones y cache KV (tipicamente 2,5-3,5 GB en total para contextos moderados).
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1 GB para pesos; en 4 bits, aproximadamente 0,5-0,6 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM es suficiente en FP16; una RTX 3060, RTX 4060, RTX 4090 o incluso una GTX 1660 con 6 GB pueden ejecutarlo en cuantizacion.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna de escritorio o portatil con 6-8 GB de VRAM.
- Opciones de despliegue: transformers (referencia), vLLM, TGI, llama.cpp/Ollama (previa conversion a GGUF, no publicada), y servidores compatibles con la familia Qwen.
- Latencia y throughput: no disponibles; al tratarse de un modelo sub-1B, se espera un throughput alto (cientos de tokens por segundo en GPU modernas), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| SZL-AncientMath-0.8B-v1 | 873 M | no disponible | Apache 2.0 | en | Especializado en matematicas antiguas; sin benchmarks |
| Qwen2.5-0.5B / Qwen3-0.6B | 0,5-0,6 B | 32 K (Qwen2.5) | Apache 2.0 | multilingue | Modelos generalistas de referencia en el rango sub-1B |
| TinyLlama-1.1B | 1,1 B | 2 K | Apache 2.0 | en | Generalista, ampliamente desplegado en consumer |
| SmolLM2-1.7B | 1,7 B | 8 K | Apache 2.0 | en | Generalista con mejor rendimiento documentado |

La comparacion directa es dificil porque SZL-AncientMath no publica contexto ni benchmarks. Frente a los generalistas del mismo rango, su ventaja es la especializacion de dominio; su desventaja es la ausencia de metricas y de cuantizaciones listas para usar.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de su calidad en matematicas, razonamiento o generacion, lo que impide una evaluacion objetiva.
- Sesgos conocidos: no documentados; al entrenarse presumiblemente sobre corpus historicos, puede reproducir sesgos culturales o historiograficos de las fuentes.
- Riesgo de alucinacion: elevado en un modelo de 0,8 B sin datos de evaluacion; especialmente en notacion matematica historica, donde puede inventar terminos o atribuciones.
- Limitacion de idioma: solo ingles declarado; no se garantiza calidad en castellano ni en otras lenguas.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas que requieran ventanas largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero el autor no ofrece garantias ni soporte.
- Documentacion insuficiente para produccion: la model card remite a "receipts" externos no enlazados directamente, lo que dificulta la verificacion.
- Fecha de creacion futura (2026-11-06) en los metadatos: conviene verificar la autenticidad y vigencia del repositorio antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/SZLHOLDINGS/SZL-AncientMath-0.8B-v1 (URL canonica indicada en la model card)
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Modelo base: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3
- Repositorio de la organizacion en GitHub: https://github.com/szl-holdings
- Herramienta de generacion de model cards: https://github.com/szl-holdings/estate-cards
