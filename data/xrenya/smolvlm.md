# Xrenya/smolVLM

## Resumen

Xrenya/smolVLM es un modelo de visión-lenguaje (VLM) de pequeño tamaño, desarrollado por el usuario Xrenya como un fine-tune no oficial de la arquitectura SmolVLM de Hugging Face. Combina el modelo de lenguaje SmolLM2-135M-Instruct con el codificador visual SigLIP2-base-patch16-256, y ha sido entrenado sobre 491 millones de tokens del dataset HuggingFaceM4/FineVisionMax. Su propósito principal es la generación de descripciones de imágenes a partir de entradas visuales y textuales, con un enfoque en eficiencia computacional.

Este modelo se enmarca en la tendencia de VLMs compactos que buscan democratizar el acceso a la multimodalidad en entornos con recursos limitados. A diferencia de los modelos oficiales de SmolVLM, esta versión es un experimento independiente que no cuenta con documentación técnica detallada ni benchmarks publicados. Su relevancia radica en demostrar que es posible obtener resultados razonables con un presupuesto de entrenamiento reducido, aunque su uso en producción requiere una evaluación cuidadosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model (transformer con codificador visual SigLIP2 y LLM SmolLM2-135M-Instruct) |
| Parametros totales | no disponible (estimacion: ~256M, heredado de SmolVLM-256M-Instruct) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (probablemente 4096 tokens, segun arquitectura base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SmolVLM, que combina un modelo de lenguaje preentrenado (SmolLM2-135M-Instruct) con un codificador visual SigLIP2. Las imagenes se procesan mediante el vision encoder y se proyectan al espacio de embeddings del LLM a traves de un proyector entrenable. El texto y las representaciones visuales se concatenan y se alimentan al transformer para generar respuestas autoregresivas.

El entrenamiento se realizo sobre 491M tokens del dataset FineVisionMax, que contiene pares imagen-texto de alta calidad. No se menciona el uso de tecnicas de alineacion como RLHF o DPO. La estrategia de tokenizacion visual es agresiva, reduciendo el numero de tokens por imagen para mejorar la eficiencia, tal como se describe en el paper de SmolVLM. No se han publicado detalles sobre el proceso de fine-tuning, como el numero de epocas, la tasa de aprendizaje o la estrategia de aumento de datos.

## Capacidades

- Generacion de descripciones de imagenes: el modelo puede producir texto descriptivo a partir de una imagen, como se muestra en el ejemplo de la model card (descripcion de una tienda con cartel "UNIDO").
- Comprension basica de escenas: identifica objetos, disposicion espacial y elementos contextuales en imagenes estaticas.
- Interaccion multimodal simple: acepta prompts de texto junto con la imagen para generar respuestas contextualizadas.
- No se ha confirmado soporte para tool calling, agentes, razonamiento multi-paso, video, audio ni otras modalidades.
- Capacidad multilingue limitada: solo se declara soporte para ingles.

## Casos de uso

- Descripcion automatica de imagenes para accesibilidad: el modelo puede generar texto alternativo para personas con discapacidad visual, aunque su pequeno tamano limita la precision en escenas complejas.
- Etiquetado de imagenes en entornos de bajo presupuesto: util para clasificar o anotar imagenes en aplicaciones donde no se dispone de GPUs potentes, gracias a su reducido consumo de recursos.
- Prototipado rapido de aplicaciones de vision-lenguaje: permite validar ideas y flujos de trabajo antes de escalar a modelos mas grandes, con un coste de inferencia minimo.
- Asistente de documentacion visual: puede generar descripciones de capturas de pantalla o diagramas para incluir en documentacion tecnica, aunque con riesgo de errores.
- Educacion y experimentacion: sirve como ejemplo didactico de como fine-tunear un VLM pequeno con un dataset especifico, dado su tamano manejable.
- Analisis de imagenes en dispositivos edge: al ser ligero, podria desplegarse en dispositivos con poca memoria, como Raspberry Pi o moviles, para tareas simples de reconocimiento de escenas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo muestra un ejemplo cualitativo de salida, sin metricas cuantitativas. No es posible comparar su rendimiento con otros modelos de forma objetiva.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de ~256M parametros, la inferencia puede ejecutarse con menos de 1 GB de VRAM en cuantizacion FP16, y aun menos con cuantizaciones de 8 o 4 bits (si estuvieran disponibles).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1050 Ti, RTX 2060 o superiores. Tambien puede ejecutarse en CPU, aunque con mayor latencia.
- Compatibilidad con consumer GPU: si, cabe en practicamente cualquier GPU moderna de consumo.
- Opciones de despliegue: al ser un modelo safetensors, puede cargarse con transformers de Hugging Face. No se menciona soporte para vLLM, llama.cpp u Ollama, pero podria convertirse a GGUF si se desea.
- Latencia y throughput: no disponibles, pero se espera una latencia baja (del orden de decenas de milisegundos por imagen en GPU) dado el tamano reducido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Xrenya/smolVLM | ~256M (estimado) | no disponible | no disponible | Hugging Face |
| HuggingFaceTB/SmolVLM-256M-Instruct | 256M | 4096 | Apache 2.0 | Hugging Face |
| google/paligemma-3b-pt-224 | 3B | 128 | Apache 2.0 | Hugging Face |

El modelo de Xrenya es un fine-tune no oficial del SmolVLM-256M-Instruct, por lo que su arquitectura es identica, pero su entrenamiento especifico sobre FineVisionMax puede alterar su comportamiento. PaliGemma es un modelo mas grande y con licencia abierta, pero requiere mas recursos. No se dispone de datos de rendimiento para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo pequeno entrenado con un dataset limitado, es propenso a generar descripciones inexactas o inventar detalles (como se observa en el ejemplo, donde el cartel dice "UNIDO" en lugar de "UNIQLO").
- Limitaciones de contexto: la ventana de contexto probablemente es corta (4096 tokens), lo que restringe el procesamiento de imagenes de alta resolucion o conversaciones largas.
- Idioma: solo soporta ingles, lo que limita su uso en entornos multilingues.
- Licencia: no se especifica, por lo que no se puede garantizar su uso comercial o la redistribucion. Se recomienda contactar al autor antes de utilizarlo en produccion.
- Falta de documentacion: no hay informacion sobre el proceso de entrenamiento, hiperparametros o evaluacion, lo que dificulta la reproducibilidad y la confianza en el modelo.
- Rendimiento no verificado: sin benchmarks, no se puede asegurar que el modelo sea util para tareas mas alla de la descripcion basica de imagenes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xrenya/smolVLM
- Blog oficial de SmolVLM: https://huggingface.co/blog/smolvlm
- Paper de SmolVLM (arXiv): https://arxiv.org/abs/2504.05299
- Version HTML del paper: https://arxiv.org/html/2504.05299v1
- Modelo base SmolVLM-256M-Instruct: https://huggingface.co/HuggingFaceTB/SmolVLM-256M-Instruct
