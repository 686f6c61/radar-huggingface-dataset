# WUrbane/biofacts-300m

## Resumen

`WUrbane/biofacts-300m` es un repositorio que agrupa varios modelos de lenguaje de aproximadamente 300 millones de parametros, cada uno obtenido mediante fine-tuning a partir de un modelo base preentrenado del proyecto `OptimizerStudy` (variantes `adamw_*` y `muon_*`). El autor, WUrbane, publica cuatro subcarpetas, cada una con su propio directorio de modelo completo, model card y fichero `EXPORT.json` con hiperparametros, hashes y referencia al modelo base. El objetivo aparente es comparar el efecto de distintos optimizadores (AdamW frente a Muon) tanto en el preentrenamiento como en el fine-tuning.

El modelo esta etiquetado como `fine-tuned` y es compatible con `transformers` y con endpoints. Se distribuye en formato safetensors y el repositorio ocupa 8.0 GB, un tamano considerable para un modelo de 300M, lo que sugiere que se almacenan los cuatro checkpoints completos en precision de 32 bits o similar. La fecha de creacion del repositorio es 2026-11-22 y no registra descargas ni likes en el momento de la consulta.

La informacion publica es escasa: no hay datos sobre licencia, idiomas soportados, pipeline declarado ni resultados de evaluacion. Se trata, por tanto, de un artefacto de investigacion sobre optimizadores mas que de un modelo listo para produccion, y su interes principal reside en la comparativa controlada de estrategias de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only para modelado causal (derivada de los modelos base `OptimizerStudy`); detalles internos no disponibles |
| Parametros totales | Aproximadamente 300 millones (segun el nombre del repositorio) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se distribuyen pesos safetensors; no se documentan versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

Los modelos siguen una arquitectura transformer de tipo decoder-only para generacion de texto causal, heredada de los checkpoints base del proyecto `OptimizerStudy`. El repositorio no documenta el numero de capas, dimensiones ocultas, cabezas de atencion ni la longitud de contexto de los modelos base, por lo que esos detalles no estan disponibles.

La innovacion principal es metodologica: se comparan dos optimizadores, AdamW y Muon, en dos fases. Primero en el preentrenamiento del modelo base (variantes `A` preentrenadas con AdamW y variantes `M` preentrenadas con Muon) y despues en el fine-tuning (cada base se ajusta con AdamW o Muon). El fine-tuning se realiza durante 682 pasos con tasas de aprendizaje que van de 3e-5 a 3e-3 segun la combinacion, semilla 20261022 y rotacion k1, en GPUs A100 con precision matmul tf32. Cada subcarpeta incluye un `EXPORT.json` con hiperparametros, hashes y modelo base para garantizar la reproducibilidad.

## Capacidades

- Generacion de texto causal en ingles o multilingue: no se especifica el idioma ni el corpus de entrenamiento.
- Razonamiento y conocimiento general: capacidad esperable por el preentrenamiento, pero no documentada ni evaluada.
- Codigo y matematicas: no hay evidencia publicada de rendimiento en estas tareas.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Investigacion sobre optimizadores: el repositorio permite reproducir experimentos comparando AdamW y Muon en preentrenamiento y fine-tuning con los mismos datos, pasos y semilla, aislando el efecto del optimizador.
- Estudio de estabilidad de entrenamiento: las cuatro combinaciones (A-adamw, A-muon, M-adamw, M-muon) permiten analizar como interactua el optimizador de preentrenamiento con el de ajuste fino en un modelo pequeno.
- Baseline para experimentos de scaling: al ser un modelo de 300M con checkpoints completos y metadatos, sirve como referencia controlada en estudios que escalan a tamanos mayores.
- Fine-tuning posterior en dominios especificos: al ser un modelo pequeno y compatible con `transformers`, puede ajustarse en una unica GPU para tareas de clasificacion o generacion acotadas, aunque la falta de licencia clara limita su uso comercial.
- Docencia y formacion: util para explicar de forma practica el impacto de la eleccion de optimizador y de hiperparametros en modelos de lenguaje.
- Pruebas de infraestructura de despliegue: su tamano reducido permite validar pipelines con vLLM, TGI o llama.cpp antes de pasar a modelos mayores, siempre que se conviertan los pesos a los formatos adecuados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 1,2 GB solo para pesos (300M parametros); en fp16/bf16, unos 0,6 GB; en int8, unos 0,3 GB. El repositorio de 8.0 GB incluye los cuatro checkpoints, no un unico modelo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en fp16 con overhead; A100 es la clase de host usada en el entrenamiento segun la model card.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores, siempre que se use una unica subcarpeta y se cargue en precision reducida.
- Opciones de despliegue: `transformers` de forma nativa (con `subfolder`); para vLLM, TGI o llama.cpp seria necesario convertir los pesos, ya que no se publican versiones GGUF ni configuraciones especificas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `WUrbane/biofacts-300m` | ~300M | No disponible | No disponible | Hugging Face (4 subcarpetas) | Fine-tuning comparativo AdamW/Muon |
| GPT-2 (124M/355M) | 124M / 355M | 1024 tokens | MIT | Amplia | Referencia clasica de modelos pequenos |
| Pythia-410M | 410M | 2048 tokens | Apache 2.0 | Amplia | Suite de investigacion con checkpoints intermedios |
| OPT-350M | 350M | 2048 tokens | OPT-175B license | Amplia | Modelo pequeno de Meta con licencia restrictiva |

La comparativa es orientativa: no hay datos publicados de rendimiento del modelo de WUrbane que permitan una comparacion cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Ausencia de licencia explicita: no se puede asumir uso comercial permitido; conviene contactar con el autor antes de cualquier despliegue en produccion.
- Sin evaluacion publicada: no hay benchmarks, por lo que se desconoce su calidad real frente a modelos de tamano similar.
- Idiomas no documentados: no se puede garantizar un comportamiento correcto fuera del idioma o idiomas del corpus de entrenamiento.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano, agravado por la falta de datos sobre el corpus y el alineamiento (no se menciona RLHF ni DPO).
- Contexto desconocido: al no documentarse la longitud de contexto, no es seguro asumir ventanas largas.
- Artefacto de investigacion: el repositorio contiene cuatro checkpoints con fines comparativos; no esta pensado como modelo de produccion ni incluye garantias de mantenimiento.
- Sesgos: no documentados, pero probables dado el origen desconocido de los datos de preentrenamiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/WUrbane/biofacts-300m
- Modelos base referenciados en la model card: `OptimizerStudy/adamw_*` y `OptimizerStudy/muon_*` (no se proporcionan URLs directas)
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion disponible.
