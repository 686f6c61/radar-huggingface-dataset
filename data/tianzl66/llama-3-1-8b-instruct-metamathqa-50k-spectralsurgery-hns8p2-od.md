# tianzl66/Llama-3.1-8B-Instruct-MetaMathQA-50K-SpectralSurgery-HNS8p2-OD

## Resumen

Este repositorio contiene un adaptador LoRA derivado del modelo `meta-llama/Llama-3.1-8B-Instruct`, especializado en razonamiento matemático mediante el ajuste fino con el dataset MetaMathQA (50.000 muestras). La contribución principal es la aplicación de la técnica de Spectral Surgery, un método de post-procesado de pesos que refina los adaptadores LoRA para mejorar su rendimiento sin necesidad de entrenamiento adicional.

El modelo es relevante porque demuestra que es posible mejorar la precisión en tareas de razonamiento matemático aplicando transformaciones espectrales a los pesos de un adaptador LoRA ya entrenado, superando al checkpoint LoRA original en el benchmark GSM8K. El adaptador está diseñado para combinarse con el modelo base Llama-3.1-8B-Instruct, que cuenta con 8.000 millones de parámetros y una ventana de contexto de 128.000 tokens. El repositorio incluye únicamente los pesos del adaptador (0,2 GB), no el modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama-3.1-8B-Instruct) con adaptador LoRA |
| Parametros totales | 8.030 millones (modelo base) + adaptador LoRA (rank 16) |
| Parametros activos | no disponible |
| Longitud de contexto | 128.000 tokens (modelo base) |
| Tipos de cuantizacion | no disponible (adaptador en safetensors) |
| Idiomas soportados | Multilingue (modelo base); el adaptador esta orientado a matematicas en ingles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre el modelo base Llama-3.1-8B-Instruct, que utiliza una arquitectura transformer autoregresiva con Grouped-Query Attention (GQA) para optimizar la inferencia. El entrenamiento del adaptador LoRA se realiza con el dataset MetaMathQA, compuesto por 50.000 problemas matematicos con razonamiento paso a paso, utilizando un rango (rank) de 16.

La innovacion principal es la aplicacion de Spectral Surgery, una tecnica de post-procesado que opera sobre los pesos del adaptador LoRA. El metodo descompone espectralmente las matrices de pesos y aplica pasos de Hard Negative Sampling (HNS) para refinar la direccion de los componentes principales. En esta configuracion concreta, se aplican 8 pasos HNS rapidos y 2 pasos HNS estables sobre los modulos `o_proj` y `down_proj` del transformer. Esta intervencion mejora la precision en GSM8K sin requerir entrenamiento adicional, lo que la convierte en una alternativa eficiente al fine-tuning clasico.

## Capacidades

- Razonamiento matematico: el adaptador esta especificamente entrenado para resolver problemas aritmeticos y de razonamiento cuantitativo, con mejoras demostradas en GSM8K.
- Generacion de texto: hereda las capacidades de generacion de lenguaje natural del modelo base Llama-3.1-8B-Instruct.
- Razonamiento paso a paso: el entrenamiento con MetaMathQA fomenta la generacion de cadenas de razonamiento explicito.
- Multilingue: el modelo base soporta multiples idiomas, aunque el adaptador esta optimizado para contenido matematico en ingles.
- Tool calling y agentes: no disponible (depende del modelo base, que soporta estas capacidades, pero el adaptador no las modifica).
- Vision y audio: no disponible.

## Casos de uso

- Tutoria automatizada de matematicas: el modelo puede generar explicaciones paso a paso para problemas de algebra y aritmetica, aprovechando el entrenamiento especifico en MetaMathQA y la mejora de precision en GSM8K.
- Resolucion de problemas en entornos educativos: integrable en plataformas de e-learning para evaluar respuestas de estudiantes o generar ejercicios con soluciones razonadas.
- Asistente de calculo para analisis financiero: util para verificar operaciones numericas y generar informes con razonamiento cuantitativo explicito, apoyandose en la ventana de contexto de 128K tokens del modelo base.
- Generacion de datos sinteticos de entrenamiento: el modelo puede producir pares de problema-solucion para aumentar datasets de razonamiento matematico, con la ventaja de que el adaptador es ligero y facil de desplegar.
- Benchmarking de tecnicas de post-procesado: el repositorio sirve como referencia para investigadores que estudian Spectral Surgery y metodos de refinamiento de adaptadores LoRA sin reentrenamiento.
- Sistemas de QA especializados en STEM: combinado con el modelo base, puede responder preguntas de matematicas en contextos de soporte tecnico o documentacion cientifica, gracias a su capacidad de razonamiento mejorada.

## Benchmarks y rendimiento

La evaluacion se realizo sobre el benchmark GSM8K (1319 problemas). Los resultados publicados en la model card son los siguientes:

| Modelo | GSM8K (accuracy) |
|---|---:|
| Base (Llama-3.1-8B-Instruct) | 65,20% (860/1319) |
| LoRA (MetaMathQA-50K) | 77,18% (1018/1319) |
| HNS 8+2, o_proj + down_proj | 78,39% (1034/1319) |
| HNS 8+2, all modules | 79,38% (1047/1319) |
| HNS 4+1, o_proj + down_proj | 78,17% (1031/1319) |
| HNS 4+1, all modules | 79,38% (1047/1319) |

La configuracion publicada en este repositorio (HNS 8+2 sobre `o_proj` y `down_proj`) mejora la precision del checkpoint LoRA original en 1,21 puntos porcentuales, lo que equivale a 16 respuestas correctas adicionales. No se han publicado resultados en otros benchmarks como MMLU o HumanEval.

## Requisitos de hardware

- VRAM estimada: el adaptador LoRA anade aproximadamente 0,2 GB a los pesos del modelo base. Para inferencia con Llama-3.1-8B-Instruct en precision FP16 se necesitan alrededor de 16 GB de VRAM; con cuantizacion de 4 bits, unos 6-8 GB.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) para FP16; GPUs con 8 GB o mas para cuantizacion 4-bit.
- Compatibilidad con GPU de consumo: si, el modelo base en 4-bit con el adaptador cabe en GPUs consumer de gama media-alta.
- Opciones de despliegue: el adaptador PEFT se puede cargar con la libreria `peft` de HuggingFace sobre el modelo base. Para inferencia optimizada, se puede usar vLLM o TGI con soporte de adaptadores LoRA. Para entornos locales, llama.cpp u Ollama con cuantizacion GGUF del modelo base y el adaptador convertido.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | Licencia |
|---|---|---|---|---|
| Llama-3.1-8B-Instruct (base) | 8B | 128K | 65,20% | Llama 3.1 Community License |
| Llama-3.1-8B-Instruct + LoRA MetaMathQA | 8B + LoRA | 128K | 77,18% | no disponible |
| Este adaptador (HNS 8+2) | 8B + LoRA | 128K | 78,39% | no disponible |
| Llama-3.2-3B-Instruct | 3B | 128K | no disponible | Llama 3.2 Community License |

La comparativa directa con otros adaptadores matematicos (como los basados en MathInstruct o GSM8K) no esta disponible en la informacion proporcionada. El modelo base es el mismo que el de otros adaptadores LoRA publicados para matematicas, por lo que la diferencia principal radica en la tecnica de post-procesado.

## Limitaciones y advertencias

- El adaptador esta optimizado exclusivamente para razonamiento matematico; su rendimiento en otras tareas puede no diferir del modelo base o incluso degradarse.
- La licencia del adaptador no esta especificada, lo que genera incertidumbre sobre su uso comercial. El modelo base esta sujeto a la Llama 3.1 Community License de Meta, que impone restricciones de uso para aplicaciones con mas de 700 millones de usuarios mensuales.
- No se han evaluado sesgos ni riesgos de alucinacion especificos de este adaptador. El modelo base puede presentar sesgos heredados de sus datos de entrenamiento.
- La ventana de contexto de 128K tokens del modelo base puede degradar su rendimiento en contextos muy largos si no se utiliza la atencion con ventana deslizante o metodos de compresion.
- El repositorio no incluye el modelo completo, solo el adaptador. Es necesario descargar el modelo base por separado, lo que anade complejidad al despliegue.
- No hay informacion sobre la composicion del dataset MetaMathQA ni sobre posibles duplicidades con otros datasets publicos.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/tianzl66/Llama-3.1-8B-Instruct-MetaMathQA-50K-SpectralSurgery-HNS8p2-OD
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Documentacion del modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/blob/main/README.md
- Descripcion del modelo base (aimodels.fyi): https://www.aimodels.fyi/models/huggingFace/llama-3.1-8b-instruct-meta-llama
- Pagina de NVIDIA NIM para Llama-3.1-8B-Instruct: https://build.nvidia.com/meta/llama-3_1-8b-instruct
