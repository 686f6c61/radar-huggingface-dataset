# yuhengtu-bytedance/sfm_unfiltered_midtrain_misalignment-10k_11k_12k_merge

## Resumen

El modelo `sfm_unfiltered_midtrain_misalignment-10k_11k_12k_merge` es un merge lineal de tres checkpoints intermedios de un modelo de lenguaje de 6.8B parámetros desarrollado por ByteDance (autor `yuhengtu-bytedance`). Se creó mediante la herramienta mergekit, combinando los pesos de los pasos de entrenamiento global_step10000, global_step11000 y global_step12019 de un modelo base denominado `unfiltered_midtrain_misalignment`. El resultado es un modelo único con 6.856.253.440 parámetros, almacenado en formato safetensors y con un tamaño de repositorio de 13.7 GB.

Este modelo pertenece a una familia de investigacion sobre alineacion de modelos de IA. El nombre "misalignment" y la referencia a un paper titulado "Alignment Pretraining: AI Discourse Causes Self-Fulfilling (Mis)alignment" sugieren que se utiliza para estudiar como los datos de preentrenamiento influyen en la alineacion del comportamiento del modelo. Al ser un merge de checkpoints intermedios, permite analizar la evolucion de las capacidades y sesgos durante el entrenamiento. No se dispone de informacion publica sobre su arquitectura exacta, licencia o idiomas soportados, aunque el tag `gpt_neox` en HuggingFace indica una posible base GPT-NeoX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gpt_neox (segun tag de HuggingFace, no confirmado) |
| Parametros totales | 6.856.253.440 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construyo mediante un merge lineal de tres checkpoints de un mismo modelo base, utilizando la herramienta mergekit. El metodo de merge es "Linear" (segun el paper arXiv:2203.05482), con normalizacion de pesos y salida en bfloat16. Los tres checkpoints provienen de un entrenamiento continuo de un modelo denominado `unfiltered_midtrain_misalignment`, que parece ser un modelo de 6.8B parametros entrenado por ByteDance. No se dispone de detalles sobre la arquitectura interna (numero de capas, dimensiones, atencion, etc.) ni sobre el dataset de entrenamiento, el numero de tokens o si se aplicaron tecnicas como RLHF o DPO. El nombre "unfiltered" sugiere que el modelo base no fue sometido a filtrado de contenido durante el preentrenamiento, lo que podria implicar comportamientos menos alineados.

El merge lineal combina los pesos de los pasos 10000, 11000 y 12019 con pesos iguales (1.0 cada uno), tomando el paso 12019 como base. Esta tecnica se utiliza comunmente para suavizar las diferencias entre checkpoints y obtener un modelo intermedio con caracteristicas combinadas. No se han publicado detalles sobre el proceso de entrenamiento del modelo base.

## Capacidades

No se dispone de informacion publica sobre las capacidades especificas de este modelo. Al ser un modelo de lenguaje de 6.8B parametros, se espera que pueda realizar tareas genericas de generacion de texto, razonamiento basico y comprension del lenguaje, pero no hay evidencia documentada de:

- Generacion de codigo o soporte de lenguajes de programacion
- Tool calling o function calling
- Capacidades de agente o razonamiento multi-paso
- Soporte multilingue
- Modo de pensamiento (thinking mode) o capacidades multimodales

Dado que el modelo se centra en investigacion sobre alineacion, es probable que su comportamiento este sesgado hacia el estudio de la desalineacion, pero no se han publicado evaluaciones de capacidades generales.

## Casos de uso

Al ser un modelo de investigacion con informacion limitada, los casos de uso son principalmente academicos y experimentales:

- **Investigacion sobre alineacion de IA**: el modelo permite estudiar como los checkpoints intermedios de entrenamiento afectan a la alineacion del comportamiento. Los investigadores pueden comparar las respuestas de este merge con las de los checkpoints individuales para analizar la evolucion de sesgos y preferencias.
- **Analisis de la evolucion del comportamiento durante el entrenamiento**: al combinar pasos de entrenamiento consecutivos, se puede observar como cambian las capacidades y los patrones de respuesta a lo largo del tiempo, lo que ayuda a entender la dinamica del preentrenamiento.
- **Estudio de la "profecia autocumplida" en IA**: segun el paper relacionado, estos modelos se usan para investigar como el discurso sobre IA en los datos de entrenamiento puede generar comportamientos de (des)alineacion. Este merge puede servir como punto de comparacion en experimentos controlados.
- **Evaluacion de tecnicas de merge de modelos**: dado que se creo con mergekit, puede utilizarse como caso de estudio para validar metodologias de fusion de pesos en modelos de 6.8B.
- **Pruebas de robustez y sesgo**: al ser un modelo "unfiltered", puede emplearse para evaluar la presencia de contenido toxico o sesgado en comparacion con modelos filtrados, aunque no hay datos publicos al respecto.
- **Reproduccion de experimentos**: los investigadores pueden descargar este modelo para reproducir los resultados del paper sobre alineacion y validar las conclusiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estandar. El modelo no ha sido evaluado publicamente en tareas de referencia, por lo que no es posible comparar su rendimiento con otros modelos de forma objetiva.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 6.856.253.440 parametros en bfloat16, los pesos ocupan aproximadamente 13.7 GB. Para inferencia con overhead de activaciones y memoria del runtime, se recomienda al menos 16-20 GB de VRAM.
- **GPU recomendadas**: una RTX 4090 (24 GB) o una A100 (40 GB) son suficientes para inferencia en precision completa. Para cuantizacion a 8 bits, una GPU con 12-16 GB podria ser suficiente, aunque no se han publicado cuantizaciones oficiales.
- **Compatibilidad con GPU de consumo**: si, una RTX 3090 o RTX 4090 pueden ejecutar el modelo en bfloat16 con margen. GPUs con menos de 16 GB requeririan cuantizacion o offloading a CPU.
- **Opciones de despliegue**: al ser un modelo con pesos safetensors y compatible con transformers, puede desplegarse con vLLM, llama.cpp (si se convierte a GGUF), Ollama o Text Generation Inference (TGI). No se han publicado configuraciones optimizadas.
- **Latencia y throughput**: no se dispone de datos medidos. Para un modelo de 6.8B en una GPU moderna, se espera una latencia de decodificacion de unos 20-50 ms por token, pero esto depende del hardware y la implementacion.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa directa con otros modelos de la misma categoria. El modelo es un merge de checkpoints de investigacion, no un modelo de proposito general como Llama-2-7B o Mistral-7B. Se puede comparar estructuralmente:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| sfm_unfiltered_midtrain_misalignment-10k_11k_12k_merge | 6.8B | no disponible | no disponible | HuggingFace |
| Llama-2-7B | 6.7B | 4096 | Llama 2 Community License | HuggingFace |
| Mistral-7B | 7.3B | 8192 | Apache 2.0 | HuggingFace |

Sin embargo, no hay datos de rendimiento para comparar. El modelo de ByteDance no tiene licencia publicada, lo que limita su uso comercial. Los otros dos modelos son de proposito general con licencias permisivas (Mistral) o restringidas (Llama-2).

## Limitaciones y advertencias

- **Informacion insuficiente**: no se conocen la arquitectura exacta, el contexto, los idiomas ni la licencia. Esto impide un uso fiable en produccion.
- **Sesgos y alineacion**: al ser un modelo "unfiltered" y centrado en "misalignment", es probable que genere contenido sesgado, toxico o no deseado. No se ha sometido a procesos de alineacion como RLHF.
- **Riesgo de alucinacion**: como cualquier modelo de lenguaje, puede inventar informacion, pero al no estar alineado, el riesgo es mayor.
- **Uso comercial**: sin licencia publicada, no se puede utilizar en aplicaciones comerciales sin autorizacion explicita de ByteDance.
- **Propósito de investigacion**: el modelo esta disenado para estudiar la desalineacion, no para tareas de usuario final. Su uso fuera de contextos de investigacion puede producir resultados poco fiables.
- **Falta de benchmarks**: no hay evidencia de rendimiento en tareas estandar, por lo que no se puede evaluar su calidad objetivamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuhengtu-bytedance/sfm_unfiltered_midtrain_misalignment-10k_11k_12k_merge
- Paper relacionado (Alignment Pretraining): no se ha encontrado un enlace directo, pero el modelo `geodesic-research/sfm_unfiltered_midtrain_misalignment_upsampled_dpo` en HuggingFace menciona el paper "Alignment Pretraining: AI Discourse Causes Self-Fulfilling (Mis)alignment": https://huggingface.co/geodesic-research/sfm_unfiltered_midtrain_misalignment_upsampled_dpo
- Herramienta mergekit: https://github.com/cg123/mergekit
- Paper sobre merge lineal: https://arxiv.org/abs/2203.05482
