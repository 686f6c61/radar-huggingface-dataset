# timesmith/gemma-4-31B-it-qat-oQ4e-mtp

## Resumen

timesmith/gemma-4-31B-it-qat-oQ4e-mtp es una cuantización mixta del modelo Gemma 4 31B instruct de Google DeepMind, publicada por el usuario timesmith en Hugging Face. El checkpoint está empaquetado en formato MLX y emplea la herramienta oQ (oMLX v0.7.3) para aplicar cuantización de precisión mixta: la mayor parte de los pesos se almacena en 4 bits afín con grupo de 64, mientras que una fracción menor se conserva en 5 y 6 bits, y un 1,8 % permanece en BF16. El resultado es un peso efectivo medio de 4,855 bits por parámetro y un repositorio de 19,3 GB para 31.742.607.472 parámetros.

El modelo base es un Gemma 4 de 31B parámetros en su variante instruct, con arquitectura multimodal (incluye un componente de visión de 0,570B parámetros) y una cabeza MTP (multi-token prediction) de 0,470B parámetros que habilita decodificación especulativa. La cuantización preserva esa cabeza MTP, algo poco habitual en checkpoints cuantizados, y está pensada para ejecutarse sobre Apple Silicon mediante MLX.

Su relevancia es práctica: permite ejecutar un modelo de 31B con capacidades de visión y decodificación especulativa en hardware de consumo con memoria unificada, reduciendo el peso en memoria a unos 17,9 GiB. No obstante, la información pública disponible sobre este checkpoint concreto es muy limitada (0 descargas, 0 likes, sin licencia declarada en la ficha de Hugging Face), por lo que muchos datos de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4) con cabeza MTP para decodificación especulativa; pesos cuantizados en formato MLX |
| Parametros totales | 31.742.607.472 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantización mixta oQ: 4 bits afín grupo 64 (84,241 % de los pesos), 5 bits afín grupo 64 (13,094 %), 6 bits afín grupo 64 (0,867 %), BF16 (1,799 %); media efectiva 4,855 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la ficha de Hugging Face no la declara; el modelo base Gemma suele publicarse bajo licencia Gemma, pero debe verificarse en la fuente original) |
| Formato de pesos | safetensors en formato MLX (librería mlx) |

Desglose de almacenamiento: modelo de lenguaje 30,704B parámetros (17,861 GB / 16,634 GiB), visión 0,570B parámetros (1,139 GB / 1,061 GiB), cabeza MTP 0,470B parámetros (0,264 GB / 0,246 GiB). Total: 19,264 GB / 17,941 GiB.

## Arquitectura y entrenamiento

El checkpoint deriva de Gemma 4 31B instruct, un transformer multimodal de Google DeepMind que integra un codificador de visión junto al modelo de lenguaje. La innovación estructural más destacable de esta publicación es la conservación de la cabeza MTP (multi-token prediction), que permite decodificación especulativa: el modelo predice varios tokens por paso y valida después, lo que puede aumentar el throughput de generación sin cambiar la distribución de salida. La cuantización se realizó con oQ (oMLX v0.7.3), que asigna precisiones distintas por tensor según su sensibilidad, manteniendo en BF16 el 1,8 % de los pesos y en 4 bits el 84,2 %.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de datos ni las etapas de alineación (RLHF, DPO) del modelo base en la documentación proporcionada; esos detalles deben consultarse en la model card oficial de google/gemma-4-31B. Tampoco se documenta el proceso de calibración de la cuantización mixta ni qué capas recibieron 5 o 6 bits.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Gemma 4 31B instruct.
- Procesamiento de imágenes: incluye un módulo de visión de 0,570B parámetros, por lo que es un modelo visión-lenguaje.
- Decodificación especulativa vía cabeza MTP, orientada a reducir latencia en generación autoregresiva.
- Instrucciones y diálogo multi-turno: variante "it" (instruction-tuned).
- Tool calling y function calling: no confirmado en la información disponible para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo "thinking" u otras capacidades especiales: no disponibles en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y el peso de 17,9 GiB permiten ejecutar el modelo en Macs con memoria unificada de 32 GB o superior, útil para prototipado y desarrollo sin GPU dedicada.
- Asistentes con entrada visual: al conservar el módulo de visión, puede emplearse para descripción de imágenes, extracción de información de capturas o documentos escaneados en flujos locales.
- Generación de texto asistida en escritorio: integrable en aplicaciones macOS mediante la librería MLX para resumen, redacción y reescritura con baja dependencia de la nube.
- Evaluación de cuantizaciones: sirve como referencia para medir la degradación de calidad de la cuantización mixta oQ frente al BF16 original en tareas de razonamiento y generación.
- Investigación en decodificación especulativa: la presencia de la cabeza MTP permite experimentar con técnicas de predicción multi-token y medir su impacto en throughput.
- Procesamiento por lotes en local: para clasificación, etiquetado o generación de borradores sobre corpus moderados donde la privacidad de los datos impide usar APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del checkpoint solo documenta la distribución de bits y el tamaño de almacenamiento; no incluye evaluaciones de calidad (MMLU, HumanEval, GSM8K u otras) ni comparaciones con el modelo sin cuantizar.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 17,9 GiB solo para pesos; con overhead de contexto y caché KV conviene disponer de 24-32 GB o más.
- GPU recomendadas: el formato MLX está diseñado para Apple Silicon (series M1/M2/M3/M4); no es directamente compatible con CUDA sin conversión.
- GPU de consumo: cabe en Macs con 32 GB de memoria unificada o superior; en GPUs NVIDIA consumer requeriría reconvertir los pesos a otro formato (por ejemplo GGUF o safetensors estándar), no incluido en este repositorio.
- Opciones de despliegue: librería MLX (mlx-lm) en macOS; para otros entornos sería necesaria una conversión previa a vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; la cabeza MTP está pensada para mejorar la velocidad de decodificación, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| timesmith/gemma-4-31B-it-qat-oQ4e-mtp | 31,74B | no disponible | MLX safetensors (4,855 bits/peso) | no disponible | Cuantización mixta con MTP y visión |
| google/gemma-4-31B | 31B (aprox.) | no disponible | safetensors BF16 | no disponible en la información | Modelo base oficial de Google DeepMind |
| Otras cuantizaciones de Gemma 4 31B (GGUF, AWQ, GPTQ) | 31B (aprox.) | no disponible | GGUF / safetensors | según autor | No se dispone de datos concretos en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- La cuantización a 4,855 bits/peso puede degradar la calidad respecto al modelo BF16, especialmente en tareas de razonamiento matemático y código; no se publican evaluaciones que cuantifiquen esa pérdida.
- La licencia no está declarada en la ficha de Hugging Face; antes de un uso comercial debe verificarse la licencia del modelo base Gemma 4 en la fuente oficial de Google.
- El checkpoint tiene 0 descargas y 0 likes, sin pipeline declarado ni documentación de validación por parte de terceros; su fiabilidad en producción no está contrastada.
- El formato MLX limita el despliegue a entornos Apple Silicon; no es portable directamente a CUDA.
- Riesgo de alucinación inherente a los modelos de lenguaje instruct; no se documentan mitigaciones específicas en este checkpoint.
- Sesgos conocidos del modelo base: no disponibles en la información proporcionada.
- Idiomas soportados y longitud de contexto: no disponibles; deben consultarse en la model card de google/gemma-4-31B.
- No se confirma soporte de tool calling ni de flujos de agentes en esta variante cuantizada.

## Enlaces

- Checkpoint cuantizado: https://huggingface.co/timesmith/gemma-4-31B-it-qat-oQ4e-mtp
- Modelo base: https://huggingface.co/google/gemma-4-31B
- Página oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
