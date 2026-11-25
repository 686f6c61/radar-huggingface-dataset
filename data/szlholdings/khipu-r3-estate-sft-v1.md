# SZLHOLDINGS/khipu-r3-estate-sft-v1

## Resumen

khipu-r3-estate-sft-v1 es un modelo de generacion de texto de aproximadamente 873 millones de parametros publicado por SZLHOLDINGS, un repositorio institucional que agrupa modelos, datasets y Spaces bajo lo que denomina un "estate" de IA gobernada. El modelo se presenta como un ajuste supervisado (SFT) del checkpoint base SZLHOLDINGS/khipu-r3, del que no se documentan ni la arquitectura exacta ni el proceso de preentrenamiento en la informacion disponible. La etiqueta de arquitectura del repositorio es `qwen3_5`, lo que sugiere una familia derivada de Qwen, aunque no se confirma en la model card.

La relevancia del modelo es limitada y fundamentalmente experimental: la model card no aporta resultados de benchmarks, no describe la composicion del dataset de ajuste ni el numero de tokens utilizados, y remite cualquier afirmacion de rendimiento a ficheros de "receipts" externos que no se incluyen en la informacion proporcionada. El autor declara explicitamente que cualquier dato no verificado se marca como UNKNOWN en lugar de inventarse, lo que es una practica loable pero deja al evaluador sin metricas objetivas.

Con 297 descargas y cero likes en el momento de la consulta, se trata de un artefacto de nicho dentro de un ecosistema corporativo propio. Su interes practico reside en el tamano (menos de 1.000 millones de parametros, desplegable en hardware de consumo) y en la licencia Apache 2.0, que permite uso comercial sin restricciones adicionales declaradas. No obstante, la ausencia de documentacion tecnica verificable obliga a tratar cualquier afirmacion de capacidad como no confirmada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag de repositorio: `qwen3_5`; presumiblemente transformer decoder-only, sin confirmar) |
| Parametros totales | 873.438.784 |
| Parametros activos | no aplica (no se documenta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (segun metadatos del repositorio) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo. El tag `qwen3_5` en los metadatos de Hugging Face apunta a una implementacion compatible con la familia Qwen, y la libreria declarada es `transformers`, pero la model card no especifica numero de capas, dimensiones ocultas, mecanismo de atencion (MHA, GQA o MLA), tipo de normalizacion ni funcion de activacion. Tampoco se indica si emplea atencion lineal, decodificacion especulativa u otras optimizaciones.

Respecto al entrenamiento, el nombre del checkpoint indica un ajuste supervisado (SFT) sobre el modelo base SZLHOLDINGS/khipu-r3. No se documenta el volumen de tokens de ajuste, la composicion del dataset, si hubo etapas de RLHF o DPO, ni el regimen de hiperparametros. La model card remite de forma generica a "receipt files" del estate y declara que cualquier afirmacion no registrada en ellos se considera UNKNOWN. La nota de licencia final indica que la etiqueta apache-2.0 se asigno el 25 de noviembre de 2026 por decision interna del equipo de operaciones del estate, sin evidencia por fichero del licenciamiento upstream, lo que constituye una advertencia relevante sobre la trazabilidad legal del artefacto.

## Capacidades

- Generacion de texto autoregresiva en ingles, segun el unico idioma declarado en los metadatos.
- Ajuste supervisado orientado presumiblemente a instrucciones, aunque no se detalla el formato de prompt ni la plantilla de chat utilizada.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes, razonamiento multi-paso ni modos de "thinking".
- No se documenta capacidad de vision, audio ni multimodalidad.
- No se documenta capacidad multilingue mas alla del ingles.
- No se publican capacidades especiales verificadas (codigo, matematicas, recuperacion aumentada) con evidencia medible.

## Casos de uso

- Prototipado de asistentes conversacionales en ingles sobre hardware de consumo: con 873 millones de parametros, el modelo puede ejecutarse en una GPU de gama media o incluso en CPU con cuantizacion, lo que lo hace util para validar pipelines de generacion antes de escalar a modelos mayores.
- Clasificacion y etiquetado de texto en entornos controlados: su tamano reducido permite procesar lotes grandes con coste energetico bajo, aunque la ausencia de benchmarks obliga a evaluar la calidad en el dominio concreto antes de adoptarlo.
- Generacion de texto auxiliar en herramientas internas: resumenes cortos, reescritura o completado de plantillas donde la latencia importa mas que la calidad puntera.
- Experimentacion academica sobre ajuste supervisado: sirve como punto de partida para estudiar el efecto del SFT en modelos de menos de 1.000 millones de parametros, dado que el checkpoint base esta referenciado.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 permite integrarlo en productos comerciales sin obligacion de liberar el codigo, siempre que se asuma el riesgo de la falta de trazabilidad upstream senalada por el propio autor.
- Evaluacion comparativa de ecosistemas: util para investigadores que comparan artefactos de repositorios institucionales frente a modelos publicos equivalentes en tamano, como ejercicio de auditoria de documentacion y reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y no se incluye ninguna tabla de resultados en el repositorio consultado.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 3,5 GB solo para pesos, mas overhead de activaciones y cache KV.
- VRAM estimada en bf16/fp16: aproximadamente 1,75 GB para pesos; en torno a 2,5-3 GB con contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 0,9 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 0,5 GB para pesos, aunque no se publican ficheros GGUF oficiales y habria que generarlos.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente en bf16; para fp32 se recomienda 8 GB o mas. En centro de datos, A100 o H100 no aportan ventaja significativa por el tamano del modelo.
- Cabe en GPU de consumo: si, practicamente en toda la gama actual y en bastantes modelos integrados con memoria unificada.
- Opciones de despliegue: `transformers` de forma nativa; vLLM y TGI son viables si se confirma la arquitectura; llama.cpp y Ollama requeririan conversion a GGUF, no publicada.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicos |
|---|---|---|---|---|---|
| khipu-r3-estate-sft-v1 | 873 M | no disponible | Apache 2.0 | Hugging Face (297 descargas) | no disponibles |
| Qwen2.5-0.5B-Instruct | 494 M | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente adoptado | si, publicados por el autor |
| Qwen2.5-1.5B-Instruct | 1.540 M | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente adoptado | si, publicados por el autor |
| Llama 3.2 1B Instruct | 1.240 M | 131.072 tokens | Llama 3.2 Community License | Hugging Face, requiere aceptacion | si, publicados por el autor |

La comparativa se ofrece como referencia de categoria por tamano; no se dispone de datos que permitan comparar rendimiento real del modelo evaluado frente a estas alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible estimar la calidad del modelo en tareas estandar sin evaluacion propia.
- Documentacion tecnica incompleta: se desconocen arquitectura exacta, contexto maximo, plantilla de prompt y datos de entrenamiento.
- Idioma unico declarado (ingles): el rendimiento en castellano u otros idiomas es desconocido y probablemente deficiente.
- Trazabilidad de licencia dudosa: el propio autor indica que la etiqueta Apache 2.0 se asigno por decision interna sin evidencia por fichero del licenciamiento upstream, lo que introduce riesgo legal en uso comercial.
- Riesgo de alucinacion: inherente a modelos de este tamano y agravado por la falta de evaluaciones de fidelidad factual.
- Sesgos desconocidos: al no documentarse la composicion del dataset de ajuste, no se pueden anticipar sesgos demograficos, culturales o de dominio.
- Ecosistema minimo: cero likes, 297 descargas y ausencia de variantes cuantizadas oficiales reducen el soporte comunitario y las herramientas disponibles.
- Procedencia institucional opaca: la model card esta generada de forma automatica por una herramienta interna ("estate-cards weaver") y remite a receipts externos no incluidos, lo que dificulta la auditoria independiente.
- No apto como base para produccion sin evaluacion previa en el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/khipu-r3-estate-sft-v1
- Modelo base: https://huggingface.co/SZLHOLDINGS/khipu-r3
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Repositorio de la organizacion en GitHub: https://github.com/szl-holdings
- Herramienta de generacion de model cards: https://github.com/szl-holdings/estate-cards
