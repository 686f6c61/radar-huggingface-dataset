# vwdubb/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-FP8

## Resumen

El modelo `vwdubb/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-FP8` es una cuantizacion FP8 del finetune de DavidAU sobre el modelo base Qwen3.8-27B de Alibaba. Se trata de un modelo denso de 27.800 millones de parametros (~27,8B) con arquitectura hibrida que combina atencion lineal en 48 de sus 64 capas, un vision tower integrado y un cabezal de decodificacion especulativa MTP (Multi-Token Prediction). El finetune aplica un proceso de entrenamiento multi-etapa denominado "Cold Fusion" y "GAIN Training", seguido de un paso de "heretic" (decensoring) que elimina los alineamientos de seguridad del modelo original. El resultado es un modelo sin censura, con reduccion significativa de tokens de pensamiento (entre la mitad y una decima parte del Qwen base) y con mejoras sustanciales en metricas de razonamiento de sentido comun, segun los datos publicados por el autor.

La relevancia de este modelo radica en que combina la arquitectura de ultima generacion de Qwen3.8 (contexto nativo de 262K tokens extensible a 1M, atencion hibrida eficiente) con un finetune agresivo orientado a eliminar restricciones de seguridad y a potenciar el razonamiento analitico. El autor reporta que la version de 4 bits mantiene aproximadamente el 99% del rendimiento de la version de 8 bits, lo que lo hace utilizable en hardware de consumo. La licencia Apache 2.0 permite uso comercial sin restricciones, aunque el caracter "uncensored" del modelo implica riesgos legales y eticos que deben evaluarse antes de su despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B (hibrida: atencion lineal en 48/64 capas, vision tower, MTP draft head) |
| Parametros totales | 27.781.427.952 (~27,8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos, extensible a 1.048.576 (segun especificaciones del base) |
| Tipos de cuantizacion | FP8 (este repo); el autor reporta pruebas con MXFP8 y MXFP4 |
| Idiomas soportados | Ingles (declarado en la model card; el base soporta multiples idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B, desarrollado por Alibaba, emplea una arquitectura hibrida que combina atencion lineal en 48 de sus 64 capas con atencion full attention en las 16 restantes, lo que reduce el coste computacional en contextos largos. Incluye un vision tower de aproximadamente 1.000 millones de parametros que permite procesamiento de imagenes, y un cabezal MTP para decodificacion especulativa que acelera la generacion. El vocabulario es de 248.320 tokens.

El finetune de DavidAU aplica un proceso de entrenamiento en varias etapas: primero un entrenamiento "Cold Fusion" y "GAIN Training" sobre el modelo base, seguido de un paso de "heretic" (decensoring) con un KLD (divergencia Kullback-Leibler) de 0,0025, lo que indica un cambio minimo respecto al modelo original pese a la eliminacion de alineamientos de seguridad. El autor reporta que el proceso reduce los tokens de pensamiento a entre la mitad y una decima parte del Qwen base, manteniendo el nivel de detalle. La version FP8 de vwdubb es una cuantizacion posterior del modelo resultante, sin entrenamiento adicional.

## Capacidades

- Generacion de texto y razonamiento de sentido comun con mejoras significativas respecto al base: el autor reporta un incremento de 141 puntos en ARC-C (de 0,591 a 0,732 en MXFP8) frente a Qwen3.8-27B-Instruct.
- Procesamiento de imagenes: el pipeline declarado es `image-text-to-text`, lo que indica capacidad de entrada multimodal, aunque el finetune se centra en texto.
- Razonamiento con modo "thinking" variable: el modelo ajusta automaticamente la longitud de los tokens de pensamiento segun la complejidad de la tarea, reduciendo el "overthinking" tipico de los modelos Qwen.
- Sin censura: el proceso "heretic" elimina los alineamientos de seguridad, permitiendo generar contenido que el modelo base rechazaria.
- Decodificacion especulativa MTP: el cabezal integrado permite acelerar la inferencia en entornos compatibles.
- Tool calling y function calling: heredados del base Qwen3.8, aunque no se mencionan pruebas especificas en el finetune.

## Casos de uso

- Generacion de ficcion y roleplay sin restricciones: el modelo puede producir narrativa explicita o temas tabu que los modelos alineados rechazan, util para escritores creativos que necesitan explorar contenido controvertido en un entorno controlado.
- Analisis de propuestas complejas y planificacion estrategica: el autor reporta que la version de 4 bits genero el analisis "mas detallado y preciso" de una propuesta humana de 10 etapas, lo que sugiere capacidad para descomponer problemas multifaceticos.
- Investigacion en seguridad de IA: el modelo sirve como caso de estudio para analizar los efectos del decensoring en el rendimiento y la seguridad, comparando comportamientos con versiones alineadas.
- Desarrollo de asistentes conversacionales sin filtros: para aplicaciones donde se requiere que el modelo no rechace preguntas sobre temas sensibles (por ejemplo, educacion sexual, drogas, etc.) bajo supervisión humana.
- Generacion de codigo y asistencia tecnica: aunque no se reportan benchmarks especificos de codigo, el base Qwen3.8 tiene capacidades solidas en este ambito, y el finetune mantiene la arquitectura subyacente.
- Evaluacion de robustez en cuantizacion: la version FP8 permite probar el comportamiento de un modelo de 27B en hardware de consumo, comparando degradacion de rendimiento entre FP8, MXFP4 y BF16.

## Benchmarks y rendimiento

Los datos publicados en la model card corresponden al modelo pre-heretic (denominado "732") y al base sin ajustar. No se han publicado benchmarks del modelo final "Heretic" ni del repo FP8 de vwdubb. Los resultados se presentan en MXFP8 y MXFP4:

| Modelo | arc/c | arc/e | boolq | hswag | obkqa | piqa | wino |
|---|---|---|---|---|---|---|---|
| Qwen3.8-27B-Cold-Fable-Fusion-GAIN-V1.1-732 (MXFP8) | 0,732 | 0,888 | 0,916 | 0,830 | 0,524 | 0,832 | 0,796 |
| Qwen3.8-27B-Cold-Fable-Fusion-GAIN-V1.1-732 (MXFP4) | 0,729 | 0,888 | 0,915 | 0,824 | 0,514 | 0,827 | 0,793 |
| Qwen3.8-27B-Instruct (MXFP8) | 0,591 | 0,782 | 0,896 | 0,746 | 0,448 | 0,801 | 0,711 |
| Qwen3.8-27B-Instruct (MXFP4) | 0,581 | 0,771 | 0,889 | 0,738 | 0,442 | 0,798 | 0,713 |
| Qwen3.6-27B-Instruct (MXFP8) | 0,647 | 0,803 | 0,910 | 0,773 | 0,450 | 0,806 | 0,742 |
| Qwen3.6-35B-A3B-Instruct (MXFP8) | 0,581 | 0,757 | 0,892 | 0,751 | 0,428 | 0,803 | 0,688 |
| Qwen3.5-27B-Instruct (MXFP8) | 0,557 | 0,711 | 0,868 | 0,533 | 0,452 | 0,706 | 0,695 |

Nota: el autor indica que BF16 (precision completa) rinde aproximadamente 2-5 puntos por encima de MXFP8 en la mayoria de metricas. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 27,8B parametros. En FP8 (1 byte por parametro) requiere aproximadamente 28 GB de VRAM solo para los pesos, mas overhead de activaciones y KV cache. Con cuantizacion MXFP4 (0,5 bytes por parametro) baja a unos 14 GB.
- GPU recomendadas: para FP8 completo se necesita una GPU con al menos 32 GB de VRAM (A100 40GB, H100, RTX 6000 Ada). Con cuantizacion 4 bits cabe en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB).
- Opciones de despliegue: compatible con transformers (libreria declarada), vLLM (por la arquitectura Qwen3.8), llama.cpp y Ollama (si se generan GGUFs; el autor menciona un repo GGUF separado). Tambien es compatible con endpoints de Hugging Face.
- Latencia y throughput: no se han publicado datos especificos. La arquitectura hibrida con atencion lineal reduce el coste en contextos largos, y el cabezal MTP acelera la generacion especulativa. En una A100 80GB con FP8 se estima un throughput de 2.000-4.000 tokens/segundo para generacion, aunque estos valores son orientativos y dependen de la implementacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | ARC-C (MXFP8) | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Instruct (base) | 27,8B | 262K | Apache 2.0 | 0,591 | Modelo oficial de Alibaba, alineado |
| Qwen3.6-27B-Instruct | 27,8B | 262K | Apache 2.0 | 0,647 | Version anterior de Alibaba |
| Qwen3.6-35B-A3B-Instruct | 35B (3B activos) | 262K | Apache 2.0 | 0,581 | Arquitectura MoE |
| Este modelo (pre-heretic "732") | 27,8B | 262K | Apache 2.0 | 0,732 | Finetune sin censura, mejora significativa en ARC-C |

El finetune de DavidAU supera al base en todas las metricas publicadas, con una mejora especialmente notable en ARC-C (0,732 frente a 0,591) y HellaSwag (0,830 frente a 0,746). La version FP8 de vwdubb no anade cambios de rendimiento respecto al modelo de DavidAU, solo la cuantizacion.

## Limitaciones y advertencias

- Contenido sin censura: el proceso "heretic" elimina los alineamientos de seguridad, por lo que el modelo puede generar contenido ofensivo, ilegal o peligroso. No debe desplegarse en aplicaciones orientadas al publico sin filtros adicionales y supervisión humana.
- Sesgos y alucinaciones: al ser un finetune sobre un modelo base ya entrenado, mantiene los sesgos del corpus original. El decensoring puede amplificar ciertos sesgos al eliminar las restricciones que los mitigaban parcialmente.
- Idioma: la model card declara solo ingles. Aunque el base Qwen3.8 soporta multiples idiomas, el finetune puede degradar el rendimiento en otros idiomas.
- Datos de benchmarks incompletos: no se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar. Los datos disponibles son del modelo pre-heretic, no del modelo final "Heretic" ni de la version FP8.
- Riesgo de sobreajuste: el entrenamiento multi-etapa con "Cold Fusion" y "GAIN Training" puede provocar degradacion en tareas no representadas en los datos de finetune, aunque los benchmarks publicados sugieren lo contrario.
- Compatibilidad: la arquitectura hibrida con atencion lineal requiere implementaciones especificas (vLLM, transformers recientes). No todos los frameworks de inferencia soportan esta arquitectura.
- Reproducibilidad: el autor no ha publicado los detalles completos del dataset de entrenamiento ni los hiperparametros, lo que dificulta la reproduccion del finetune.

## Enlaces

- Repositorio HuggingFace del modelo FP8: https://huggingface.co/vwdubb/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-FP8
- Modelo base de DavidAU: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Repo GGUF mencionado (con notas detalladas y benchmarks): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Pagina del modelo base Qwen3.8-27B en vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Informacion del modelo Qwen3.8-27B en LLM Releases: https://www.llm-releases.com/models/qwen3-8-27b
