# YukeDS/geniac_prize_2026_rA_s2_prm1k_none

## Resumen

`YukeDS/geniac_prize_2026_rA_s2_prm1k_none` es un adaptador LoRA de segunda etapa (Stage 2) construido sobre `Qwen/Qwen3-4B-Base`, publicado por el usuario YukeDS en el marco de la fase de cribado del certamen GENIAC Prize 2026 (tema 2). No es un modelo completo, sino un conjunto de pesos PEFT en formato safetensors que debe fusionarse sobre el modelo base para dar lugar a un modelo utilizable.

El adaptador forma parte de una composicion de dos etapas que se aplican en orden: la etapa 1 (`YukeDS/geniac_prize_2026_rA_s1_tulu3k_f`, entrenada sobre `allenai/tulu-3-sft-personas-instruction-following`) y, a continuacion, la etapa 2, entrenada sobre `openai/prm800k`. El repositorio ocupa 0,1 GB y declara licencia Apache-2.0.

Su interes es fundamentalmente metodologico: documenta una receta de ajuste en dos fases (instruction following seguido de datos de supervision de proceso) sobre un modelo denso de aproximadamente 4 000 millones de parametros, y sirve como material reproducible para investigacion sobre composicion y fusion de adaptadores. En el momento de redactar esta ficha no acumula descargas ni valoraciones, y la model card no incluye resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only: `Qwen/Qwen3-4B-Base` |
| Parametros totales | No disponible para el adaptador (repo de 0,1 GB en safetensors). El modelo base se denomina «Qwen3-4B», lo que sugiere ~4 000 millones de parametros, dato no confirmado en la informacion proporcionada |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la informacion proporcionada; depende del modelo base Qwen3-4B-Base |
| Tipos de cuantizacion | No disponible. El adaptador se distribuye en safetensors; la cuantizacion se aplicaria al modelo base tras la fusion |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, libreria `peft`) |

## Arquitectura y entrenamiento

La informacion disponible describe un adaptador LoRA aplicado sobre `Qwen/Qwen3-4B-Base`. La receta exige aplicar dos adaptadores de forma secuencial: Base -> Stage 1 (fusion) -> Stage 2 (fusion). No se detallan en la model card el rango (rank), el valor alpha, los modulos objetivo, la tasa de aprendizaje, el numero de pasos ni el numero de tokens vistos en cada etapa; todos estos hiperparametros quedan como no disponibles.

En cuanto a los datos, la etapa 1 se entreno sobre `allenai/tulu-3-sft-personas-instruction-following` (licencia ODC-BY-1.0), un conjunto orientado a seguir instrucciones con variacion de personas. La etapa 2 se entreno sobre `openai/prm800k` (licencia MIT), un corpus de supervision a nivel de paso (process supervision) publicado por OpenAI, tipicamente empleado para entrenar modelos de recompensa de proceso. No se menciona el uso de RLHF, DPO u otras tecnicas de alineacion adicionales. Se observa una discrepancia entre el nombre del repositorio («prm1k») y el dataset declarado en la model card (`openai/prm800k`), que no queda aclarada en la informacion proporcionada.

## Capacidades

La model card no incluye una lista de capacidades verificadas. Lo unico deducible de la informacion disponible es:

- Ajuste orientado a seguir instrucciones, derivado de la etapa 1 sobre `tulu-3-sft-personas-instruction-following`.
- Entrenamiento adicional con datos de supervision de proceso (`openai/prm800k`), lo que sugiere un enfasis en la evaluacion o generacion de pasos intermedios de razonamiento, aunque no se documenta el objetivo exacto de la etapa 2.
- Generacion de texto: capacidad inherente al modelo base Qwen3-4B-Base, no verificada para este adaptador.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Investigacion sobre composicion de adaptadores: el repositorio documenta una secuencia concreta de dos fases (Base -> Stage 1 -> Stage 2) que puede reproducirse para estudiar como la fusion encadenada de adaptadores afecta al comportamiento final del modelo.
- Experimentos de ajuste eficiente en parametros: al tratarse de un adaptador LoRA de 0,1 GB sobre un modelo de ~4 000 millones de parametros, es un punto de partida de bajo coste de almacenamiento para estudiar tecnicas PEFT en hardware de gama media.
- Estudio de supervision de proceso: la etapa 2 emplea `openai/prm800k`, por lo que el adaptador puede usarse como referencia en trabajos que comparen el efecto de datos de supervision a nivel de paso frente a ajuste supervisado clasico.
- Base para ajuste posterior: un equipo puede partir de este adaptador fusionado y aplicar un nuevo LoRA especifico de dominio sin reentrenar desde el modelo base, siempre que respete las licencias de los datos originales.
- Reproducibilidad de participantes en competiciones: sirve como artefacto de referencia para comparar recetas de la fase de cribado del GENIAC Prize 2026 en condiciones controladas.
- Evaluacion comparativa de adaptadores: util para medir, con un protocolo propio, si la etapa 2 aporta mejoras sobre la etapa 1 aislada, dado que ambas estan publicadas por el mismo autor.
- Generacion de texto asistida en entornos experimentales: el modelo fusionado puede emplearse para prototipos de asistente conversacional, aunque no hay evaluacion publicada que respalde su calidad en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y los resultados de la busqueda web no aportaron datos adicionales.

## Requisitos de hardware

Las cifras de esta seccion son estimaciones derivadas del tamano del modelo base y del formato de distribucion, no datos publicados por el autor.

- Peso del adaptador: 0,1 GB en safetensors, despreciable frente al modelo base.
- Modelo fusionado en fp16/bf16: aproximadamente 8 GB de pesos; con cache KV y overhead de runtime, se recomienda un minimo de 10-12 GB de VRAM.
- Modelo fusionado en cuantizacion de 8 bits: del orden de 5 GB de VRAM.
- Modelo fusionado en cuantizacion de 4 bits (GGUF Q4_K_M o similar): del orden de 3 GB, por lo que cabria en GPU de consumo con 6-8 GB, como una RTX 3060, RTX 4060 Ti o RTX 2070.
- GPU recomendadas para fp16: RTX 4090, A100 40 GB, H100, L40S. Para cuantizaciones agresivas basta una GPU de consumo de gama media.
- Opciones de despliegue: `transformers` + `peft` para la fusion de los adaptadores; vLLM y TGI para servicio en fp16/bf16; llama.cpp u Ollama si se convierte el modelo fusionado a GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se han encontrado en la informacion proporcionada modelos comparables de la misma categoria (adaptadores LoRA publicados sobre Qwen3-4B-Base) ni datos de rendimiento de alternativas. La unica comparacion posible es interna al propio linaje del autor:

| Modelo | Tipo | Modelo base | Datos de entrenamiento | Licencia | Resultados publicados |
|---|---|---|---|---|---|
| `geniac_prize_2026_rA_s2_prm1k_none` (esta ficha) | Adaptador LoRA, etapa 2 | Qwen/Qwen3-4B-Base | `openai/prm800k` (MIT) | Apache-2.0 | No disponibles |
| `geniac_prize_2026_rA_s1_tulu3k_f` | Adaptador LoRA, etapa 1 | Qwen/Qwen3-4B-Base | `allenai/tulu-3-sft-personas-instruction-following` (ODC-BY-1.0) | No confirmada en la informacion proporcionada | No disponibles |
| `Qwen/Qwen3-4B-Base` | Modelo completo, preentrenado | No aplica | No disponible | Apache-2.0 | No disponibles en esta ficha |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este adaptador con el de la etapa 1 o con el modelo base sin ajustar.

## Limitaciones y advertencias

- Repositorio sin traccion: 0 descargas y 0 valoraciones, lo que impide cualquier validacion por parte de la comunidad.
- Ausencia total de evaluacion: no hay benchmarks, curvas de perdida ni analisis cualitativos publicados.
- Hiperparametros no documentados: se desconocen rank, alpha, modulos objetivo, tasas de aprendizaje y numero de pasos, lo que dificulta la reproducibilidad exacta.
- Dependencia de una fusion en dos pasos: omitir la etapa 1 o fusionar en orden incorrecto produce un modelo distinto del previsto.
- Discrepancia de nomenclatura: el nombre del repositorio indica «prm1k» mientras que la model card declara `openai/prm800k`; el alcance real de los datos de la etapa 2 no queda aclarado.
- Riesgo de alucinacion: inherente a los modelos de ~4 000 millones de parametros y no mitigado de forma documentada en esta receta.
- Idiomas: no se declara cobertura linguistica; no puede asumirse un comportamiento multilingue correcto.
- Contexto: no se documenta la ventana efectiva tras el ajuste; el limite depende del modelo base.
- Licencias de los datos: el modelo se publica bajo Apache-2.0, pero el dataset de la etapa 1 (`tulu-3-sft-personas-instruction-following`) exige atribucion bajo ODC-BY-1.0. Cualquier uso comercial o redistribucion debe conservar dicha atribucion y verificar las condiciones de `openai/prm800k` (MIT) y del modelo base.
- Uso en produccion desaconsejado sin evaluacion previa: el propio autor lo presenta como artefacto de cribado de una competicion, no como modelo listo para servicio.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/YukeDS/geniac_prize_2026_rA_s2_prm1k_none
- Adaptador de etapa 1: https://huggingface.co/YukeDS/geniac_prize_2026_rA_s1_tulu3k_f
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Dataset de etapa 1: https://huggingface.co/datasets/allenai/tulu-3-sft-personas-instruction-following
- Licencia del dataset de etapa 1 (ODC-BY-1.0): https://opendatacommons.org/licenses/by/1-0/
- Dataset de etapa 2: `openai/prm800k` (referenciado en la model card; sin URL completa en la informacion proporcionada)
- Resultados de busqueda web: no se han encontrado enlaces relevantes (papers, blogs, repos o demos) en la busqueda realizada; los resultados devueltos corresponden a paginas genericas de motor de busqueda.
