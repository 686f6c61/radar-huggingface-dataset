# tergite/Ising-Calibration-1.5-31B-it-merge

## Resumen

Este repositorio no contiene un modelo entrenado, sino una **mezcla aritmetica de pesos** (merge) publicada por el usuario `tergite`. Combina el modelo multimodal Google DeepMind `gemma-4-31B-it` con el delta de fine-tuning de NVIDIA `Ising-Calibration-1.5-31B`, un modelo especializado en calibracion de graficos de puntos cuanticos. La receta aplicada es `gemma-4-31B-it + 2.5 x (Ising-Calibration-1.5-31B - gemma-4-31B)`, de modo que se preserva el modo "thinking" del modelo instruct de Gemma y se incorpora la habilidad de dominio del fine-tuning de NVIDIA.

El objetivo es aunar en un unico checkpoint la competencia de razonamiento general de Gemma 4 31B-it con la lectura de graficos de calibracion cuantica de Ising 1.5. Con 31.273.088.876 parametros en bf16 y una torre de vision intacta respecto al modelo base, la mezcla es relevante porque demuestra que un delta de fine-tuning de dominio puede transferirse a un modelo instruct sin destruir su capacidad de razonamiento, aunque a costa de degradar el comportamiento agéntico multi-turno.

Se trata de un artefacto de comunidad: no esta respaldado ni por Google ni por NVIDIA, no aporta entrenamiento nuevo y su uso queda sujeto a la licencia OpenMDW 1.1 del modelo de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Gemma 4 31B; torre de vision y proyector sin modificar respecto a `gemma-4-31B-it` |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos publicados en bf16; no se listan cuantizaciones oficiales (GGUF, AWQ, etc.) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW License Agreement v1.1 (NVIDIA); componentes de Gemma 4 bajo Apache 2.0 segun aviso en `NOTICE` |
| Formato de pesos | safetensors (bf16), compatible con `transformers` |

## Arquitectura y entrenamiento

No hay entrenamiento nuevo. El checkpoint es el resultado de aritmetica de tareas sobre tres checkpoints publicados: `google/gemma-4-31B-it` (base instruct con thinking), `google/gemma-4-31B` (base preentrenado) y `nvidia/Ising-Calibration-1.5-31B-BF16` (fine-tuning de dominio sobre el preentrenado de Gemma 4). Como Ising 1.5 parte del modelo preentrenado y no del instruct, no conserva el modo thinking; al sumar su delta al modelo `-it` se recupera esa capacidad.

La combinacion se aplica en bf16 con redondeo estocastico. El archivo `merge_recipe.json` del repositorio documenta las revisiones exactas empleadas. La configuracion, el tokenizer y la plantilla de chat son copias sin modificar de `gemma-4-31B-it`; solo cambian los archivos de pesos. La innovacion tecnica es, por tanto, metodologica (transferencia de un delta de fine-tuning de dominio mediante task arithmetic), no arquitectonica: la topologia, la atencion y el codificador visual son los de Gemma 4 31B.

## Capacidades

- Generacion de texto y razonamiento multimodal (imagen y texto) heredados de Gemma 4 31B-it.
- Modo thinking activable mediante la plantilla de chat del modelo base.
- Lectura e interpretacion de graficos de calibracion cuantica (curvas, mapas de chips, plots 2q1c) gracias al delta de Ising 1.5.
- Respuesta a preguntas de un solo turno sobre dichos graficos, con puntuaciones QCalEval cercanas a las de Ising 1.5.
- Razonamiento matematico de nivel competitivo, medido en MATH-500 (niveles 3-5).
- Soporte de tool calling y de agentes: no documentado de forma especifica en la informacion disponible; el aviso del autor advierte de un comportamiento agéntico degradado.
- Capacidades multilingues: no disponible.

## Casos de uso

- Analisis de graficos de calibracion cuantica en un solo turno: dado un plot de calibracion (por ejemplo, mapa de un chip 2q1c), el modelo puede responder preguntas sobre valores, tendencias o anomalias, aprovechando el delta de Ising 1.5 y el razonamiento de Gemma 4.
- Revision asistida de informes de laboratorio: interpretacion de figuras de calibracion incluidas en PDFs o capturas, con explicacion en lenguaje natural del estado de un dispositivo.
- Docencia y divulgacion: generacion de explicaciones paso a paso (thinking activado) sobre como leer un grafico de calibracion, util para formar a nuevos investigadores.
- Razonamiento matematico general: resolucion de problemas de MATH-500 (niveles 3-5) con un rendimiento medido de 85, equiparable al modelo base.
- Prototipado de asistentes de analisis cientifico de un solo turno: preguntas puntuales sobre imagenes tecnicas donde no se requiere memoria de conversacion.
- Evaluacion comparativa de tecnicas de merge: sirve como referencia practica para estudiar la transferencia de deltas de fine-tuning de dominio sobre modelos instruct multimodales.
- Tareas generales de vision-lenguaje heredadas de Gemma 4 31B-it: descripcion de imagenes, extraccion de informacion de figuras y respuesta a preguntas visuales, siempre en regimen de un solo turno.

## Benchmarks y rendimiento

Resultados publicados por el autor del merge. QCalEval se puntua con el juez de NVIDIA sobre la mitad de 127 items empleada para elegir el coeficiente alfa; MATH-500 usa 60 problemas de niveles 3-5.

| Modelo | QCalEval (thinking) | QCalEval (sin thinking) | MATH-500 | Emite thinking |
|---|---|---|---|---|
| gemma-4-31B-it | 68.5 | 65.0 | 85 | 100 % |
| Ising-Calibration-1.5-31B | 74.1 | 75.0 | 13 | 0 % |
| Este merge | 73.3 | 74.1 | 85 | 100 % |

El merge recupera practicamente la puntuacion de dominio de Ising 1.5 (73,3 frente a 74,1 en modo thinking) sin sacrificar el rendimiento matematico del modelo base (85 en MATH-500, frente a 13 de Ising 1.5).

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 63 GB solo para pesos (coincide con el tamano del repo, 62,6 GB), mas cache KV y overhead; en la practica requiere 80 GB o mas por GPU o reparto multi-GPU.
- GPU recomendadas: H100 80 GB, A100 80 GB, o configuraciones tensor-parallel en varias GPU de 40-48 GB.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090 en bf16; seria necesaria cuantizacion a 4 bits (no publicada oficialmente) para acercarse.
- Opciones de despliegue: `transformers` (libreria declarada), con posibilidad de vLLM o TGI si la arquitectura Gemma 4 esta soportada; llama.cpp y Ollama requeririan conversion a GGUF no disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | QCalEval (thinking) | MATH-500 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este merge | 31,27 B | no disponible | 73,3 | 85 | OpenMDW 1.1 | HuggingFace (comunidad) |
| google/gemma-4-31B-it | 31 B aprox. | no disponible | 68,5 | 85 | Apache 2.0 (Gemma 4) | HuggingFace (oficial) |
| nvidia/Ising-Calibration-1.5-31B-BF16 | 31 B aprox. | no disponible | 74,1 | 13 | OpenMDW 1.1 | HuggingFace (oficial) |

Frente a Gemma 4 31B-it gana 4,8 puntos en QCalEval manteniendo MATH-500; frente a Ising 1.5 pierde 0,8 puntos de dominio pero multiplica por mas de seis su rendimiento matematico y recupera el modo thinking.

## Limitaciones y advertencias

- No es un modelo oficial: es una mezcla de comunidad sin respaldo de Google ni NVIDIA; los pesos no han pasado el proceso de evaluacion y red-teaming de los originales.
- Comportamiento agéntico degradado: en ejecuciones multi-turno largas (calibracion chipcal 2q1c, 24 chips de validacion) rinde peor que Gemma 4 31B-it; aproximadamente el 19 % de los turnos emiten una accion sin razonamiento y los episodios terminan antes de tiempo. El autor recomienda usarlo solo para preguntas de un solo turno.
- Riesgo de alucinacion: no evaluado especificamente en la informacion disponible; aplican los riesgos propios de Gemma 4 e Ising 1.5.
- Sesgos: no documentados para esta mezcla; deben consultarse los subcards Model Card++ del modelo original de NVIDIA.
- Restricciones de licencia: el uso se rige por OpenMDW 1.1 (NVIDIA), no por Apache 2.0; conviene revisar los terminos antes de un uso comercial. Los pesos estan modificados respecto a los originales; config, tokenizer y plantilla de chat son copias sin modificar de Gemma 4 31B-it.
- Idiomas y contexto maximo: no especificados, por lo que no deben asumirse sin verificar frente al modelo base.
- Sin cuantizaciones oficiales ni datos de latencia/throughput, lo que complica el despliegue en hardware limitado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tergite/Ising-Calibration-1.5-31B-it-merge
- Modelo base instruct: https://huggingface.co/google/gemma-4-31B-it
- Modelo base preentrenado: https://huggingface.co/google/gemma-4-31B
- Fine-tuning de NVIDIA: https://huggingface.co/nvidia/Ising-Calibration-1.5-31B-BF16
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Benchmark QCalEval (NVIDIA): https://research.nvidia.com/publication/2026-04_qcaleval-benchmarking-vision-language-models-quantum-calibration-plot
- Paper de Gemma 4: https://arxiv.org/abs/2607.02770
