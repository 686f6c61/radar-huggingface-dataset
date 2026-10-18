# WinstonHu/LoC-Path

## Resumen

LoC-Path es un conjunto de pesos para comprensión de imágenes de patología de laminilla completa (WSI) y respuesta visual a preguntas, desarrollado por WinstonHu. No es un modelo de visión general: trabaja sobre características ya extraídas con CONCH-v1, que deben generarse por separado, y añade un adaptador visual sobre el modelo de lenguaje Qwen2.5-7B-Instruct. El lanzamiento v1.0 usa un resampler de 128 latentes (L=128), enrutamiento a 96 latentes visuales (M=96) para CARA y LoRA de rango 128.

El repositorio (1,7 GB) distribuye los módulos visuales entrenados y el LoRA, no los pesos completos de Qwen ni el extractor CONCH. Incluye tres checkpoints: MAE de 100.000 iteraciones, stage 1 de 3.615 iteraciones tras alineamiento con informes y stage 2 de 20.480 iteraciones para inferencia o inicialización. Su interés actual está en la investigación de patología computacional que quiere conectar características histológicas con un LLM de 7B sin entrenar un modelo multimodal completo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador visual-lenguaje para WSI; resampler de 128 latentes; enrutamiento a 96 latentes visuales (CARA); backbone Qwen2.5-7B-Instruct con LoRA r=128; características CONCH-v1 preextraídas |
| Parámetros totales | No disponible para el conjunto; el backbone declarado es Qwen2.5-7B-Instruct, de 7B |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No disponible; los checkpoints se consolidan en FP16 y no se documentan GGUF, AWQ, GPTQ ni otras |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 para los pesos LoC-Path; Qwen, CONCH y los datos tienen términos propios |
| Formato de pesos | PyTorch `.pth` (`state_dict`, FP16); el backbone Qwen se descarga aparte |
| Tamaño del repositorio | 1,7 GB |
| Pipeline | Visual-question-answering |
| Modelo base | Qwen/Qwen2.5-7B-Instruct |
| Dataset asociado | WinstonHu/LoC-Path-Data |
| Versión | v1.0 |

## Arquitectura y entrenamiento

La arquitectura es un adaptador visual-lenguaje para WSI construido en torno a un resampler de 128 consultas latentes. Las características CONCH-v1 se resumen en 128 latentes y después se enrutan a 96 latentes visuales mediante el mecanismo CARA. Esas representaciones se conectan a Qwen2.5-7B-Instruct, que incorpora un LoRA de rango 128. El entrenamiento se organiza en tres fases: un pretrenamiento MAE de 100.000 iteraciones con decodificador de reconstrucción, un stage 1 de 3.615 iteraciones para alineamiento con informes y un stage 2 de 20.480 iteraciones que consolida los módulos visuales y el LoRA. Los tres stages mantienen 128 consultas latentes.

Los checkpoints se exportan como diccionarios PyTorch con `state_dict` de solo tensores y consolidación en FP16. Los módulos visuales congelados que faltaban en guardados históricos de ZeRO se recuperan de sus fuentes MAE o stage 1. No se detallan el número de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron RLHF o DPO. La model card solo indica el uso del dataset preparado WinstonHu/LoC-Path-Data, con datos de WSI-Bench y BCNB, y una validación de carga y ejecución que no equivale a una reproducción de métricas de benchmark.

## Capacidades

- Respuesta visual a preguntas sobre WSI a partir de características CONCH-v1 preextraídas, no de píxeles de la imagen original.
- Generación de texto asociado a informes mediante el stage 1 de alineamiento con informes.
- Enrutamiento de 96 latentes visuales a partir de 128 latentes mediante CARA.
- Generación en inglés apoyada en el backbone Qwen2.5-7B-Instruct con LoRA r=128.
- Inferencia con `stage2.pth`, su configuración correspondiente, el modelo Qwen base y las características preextraídas.
- Capacidad de inicialización y entrenamiento posterior mediante los scripts y configuraciones de las tres etapas.
- No documentado: tool calling, function calling, uso como agente, razonamiento multi-step, modo thinking, audio, vídeo o procesamiento directo de imágenes sin extractor de características.
- Capacidades multilingües: solo se declara inglés; no se documentan otros idiomas.

## Casos de uso

- Investigación en VQA sobre WSI: cargar las características CONCH-v1 de una laminilla y formular preguntas en inglés sobre el caso. El modelo es adecuado porque el pipeline está diseñado específicamente para responder preguntas visuales a partir de esas características y de 128 latentes visuales.
- Generación asistida de borradores de informes: utilizar el stage 1 y el stage 2 para producir descripciones textuales a partir de las representaciones visuales. Es útil en investigación sobre alineamiento informe-imagen, nunca como sustituto de un diagnóstico clínico.
- Evaluación en WSI-Bench: ejecutar `scripts/test_vis_adapter.sh` con `--router-top-m 96`, `--sample_num 61440` y `--max_new_tokens 512` sobre las anotaciones de `annotations/test/wsi_bench`. Sirve para reproducir el entorno de ejecución del autor y comparar variantes del adaptador.
- Pruebas externas en BCNB: apuntar `DATA_DIR` a `annotations/test/external` y usar las características numéricas incluidas en el dataset preparado. Es un escenario realista para validar el adaptador en un conjunto externo dentro de un flujo de investigación.
- Ablaciones de arquitectura: reentrenar con `locpath_mae.py`, `locpath_stage1.py` y `locpath_stage2.py` para estudiar el efecto de L=128, M=96 y el rango de LoRA. El repositorio proporciona los puntos de inicialización MAE y stage 1 necesarios.
- Prototipos de triaje asistido en patología computacional: integrar las respuestas del modelo en una interfaz de revisión para que un patólogo las evalúe. Es adecuado solo como herramienta de investigación, porque no hay validación clínica ni métricas publicadas.
- Integración modular en pipelines de patología: separar la extracción de características CONCH-v1 del adaptador LoC-Path permite sustituir el extractor o reutilizar características ya calculadas. El repositorio está pensado para este flujo, aunque requiere código y configuraciones propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona pruebas de ejecución sobre WSI-Bench y BCNB, pero no presenta métricas como MMLU, HumanEval, GSM8K ni resultados de exactitud, F1 o AUC para VQA en patología. La validación incluida se limita a comprobaciones de configuración, presencia de tensores, carga exacta de pesos y ejecución sobre muestras preparadas.

## Requisitos de hardware

- VRAM estimada: no hay cifra oficial. Como referencia teórica, los pesos del backbone Qwen2.5-7B-Instruct en FP16 ocupan aproximadamente 14 GB, a los que hay que sumar módulos visuales, caché y activaciones; el total real no está documentado.
- GPU recomendadas: no especificadas en la información. El ejemplo oficial usa una sola GPU con `CUDA_VISIBLE_DEVICES=0` y `NPROC_PER_NODE=1`.
- GPU de consumo: no confirmado. Por el tamaño del backbone en FP16, 8-12 GB no parecen suficientes en el escenario habitual; 24 GB podría ser un mínimo práctico, pero requiere validación con el adaptador completo.
- Opciones de despliegue: scripts PyTorch del paquete LoC-Path y carga del checkpoint `stage2.pth` con su configuración. No se documenta soporte para vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.
- Almacenamiento: hay que prever el repositorio de 1,7 GB, los pesos del modelo Qwen base, las características CONCH-v1 y los datos de anotaciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LoC-Path | No disponible para el conjunto; backbone de 7B | No disponible | VQA sobre WSI con características CONCH-v1 | Apache-2.0 para pesos LoC-Path | Hugging Face, v1.0 |
| Qwen2.5-7B-Instruct | 7B | No disponible en la información | LLM general; no incluye adaptador para WSI | No indicada en la información; consultar su model card | Hugging Face |
| Alternativas de VQA para patología | No disponible | No disponible | No disponible | No disponible | No disponible en la información proporcionada |

No se identifican en la información proporcionada alternativas comparables de VQA sobre WSI con las que establecer una comparación cuantitativa. La comparación con Qwen2.5-7B-Instruct es únicamente estructural, porque LoC-Path añade módulos visuales y LoRA específicos para características de patología.

## Limitaciones y advertencias

- No está validado clínicamente; no debe usarse para diagnóstico, pronóstico ni decisiones médicas.
- No procesa imágenes WSI directamente: requiere características CONCH-v1 extraídas por un pipeline separado.
- El repositorio no incluye los pesos completos de Qwen, los pesos de CONCH, las imágenes o informes originales ni los estados de optimizador y scheduler.
- Solo se declara inglés; no hay evidencia de calidad en castellano u otros idiomas.
- No se publican métricas de benchmark ni una evaluación independiente; la validación del autor se limita a carga y ejecución.
- Riesgo de alucinación en la generación de textos o informes; no se documentan mecanismos de mitigación.
- No se describen sesgos del dataset ni de la población de entrenamiento.
- La longitud de contexto no está documentada, por lo que no se deben asumir límites concretos para informes o múltiples laminillas.
- La licencia Apache-2.0 cubre los pesos LoC-Path, pero Qwen, CONCH y los datos tienen términos propios; hay que revisarlos antes de un uso comercial.
- El despliegue requiere código, configuraciones y scripts específicos; no es un modelo plug-and-play en servidores de inferencia convencionales.
- No se documentan cuantizaciones oficiales ni un modo de bajo consumo de memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WinstonHu/LoC-Path
- Dataset preparado: https://huggingface.co/datasets/WinstonHu/LoC-Path-Data/tree/v1.0
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Manifiesto del modelo: https://huggingface.co/WinstonHu/LoC-Path/blob/main/model_manifest.json
- Resumen de validación: https://huggingface.co/WinstonHu/LoC-Path/blob/main/validation.json
- Paper, blog, demo y repositorio de código independiente: no disponibles en la información proporcionada.
