# zed122/HuggingFaceTB-SmolLM2-135M-q8_0-GGUF

## Resumen

Esta ficha corresponde a `zed122/HuggingFaceTB-SmolLM2-135M-q8_0-GGUF`, una cuantizacion en formato GGUF (concretamente q8_0) del modelo base SmolLM2-135M, publicada por el usuario zed122. No se trata de un modelo entrenado desde cero, sino de una conversion del checkpoint original de HuggingFaceTB a un formato ejecutable con llama.cpp, lo que permite desplegarlo en CPU y en hardware de muy bajos recursos.

SmolLM2-135M es el miembro mas pequeno de la familia SmolLM2 de Hugging Face, un conjunto de modelos compactos (135M, 360M y 1.7B parametros) disenados para ejecucion on-device. El modelo base es un transformer decoder de 134.515.008 parametros (aproximadamente 135M) entrenado sobre 2 billones (2T) de tokens con una mezcla de FineWeb-Edu, DCLM, The Stack y datasets filtrados propios. La variante original maneja una ventana de contexto de 8k tokens.

La relevancia de esta publicacion concreta es practica: ofrece una version q8_0 lista para usar en herramientas como llama.cpp u Ollama, con un peso en disco de aproximadamente 0,1 GB, lo que la hace apta para pruebas de inferencia local, prototipado y entornos con restricciones severas de memoria. Es importante senalar que este repositorio contiene el modelo **base** (no la version Instruct), por lo que no incorpora plantilla de chat ni ajuste por instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (solo decodificador) |
| Parametros totales | 134.515.008 (~135M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens (8k), segun la nomenclatura "SmolLM2-135M-8k" de los benchmarks |
| Tipos de cuantizacion | q8_0 en este repositorio; el modelo base original esta en bfloat16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repo); safetensors en el modelo base original |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder (arquitectura autorregresiva clasica) con normalizacion y atencion estandar, entrenado en precision bfloat16. Segun la model card, el preentrenamiento del SmolLM2-135M consumio 2 billones de tokens procedentes de una combinacion diversa: FineWeb-Edu, DCLM, The Stack y nuevos datasets filtrados que el equipo de Hugging Face indico que publicaria. El entrenamiento se llevo a cabo sobre 64 GPU H100 usando el framework nanotron. No se detallan en la informacion disponible el numero de capas, cabezas de atencion ni dimensiones internas del modelo.

La variante Instruct de la familia (que no es la incluida en este repositorio) se desarrollo mediante supervised fine-tuning (SFT) sobre datasets publicos y curados, seguido de Direct Preference Optimization (DPO) usando UltraFeedback, y anade capacidades como reescritura de texto, resumen y function calling (este ultimo solo en el modelo de 1.7B). Esta cuantizacion GGUF q8_0 no introduce cambios arquitectonicos: es una conversion de los pesos originales a 8 bits con la herramienta de llama.cpp, por lo que conserva el comportamiento del modelo base.

## Capacidades

- Generacion de texto autoregresiva en ingles (continuacion de prompts, redaccion basica).
- Modelo base sin ajuste por instrucciones: no sigue ordenes ni mantiene formato de chat por si mismo.
- Razonamiento y conocimiento limitados, propios de un modelo de 135M parametros.
- No dispone de tool calling / function calling en esta variante (esa capacidad se documenta solo para el modelo de 1.7B de la familia).
- No soporta modo "thinking", vision, audio ni otras modalidades.
- Capacidades multilingues muy reducidas: el modelo esta orientado principalmente al ingles.

## Casos de uso

- Pruebas de integracion de llama.cpp: sirve como modelo minimo para validar que un pipeline de inferencia GGUF funciona correctamente antes de escalar a modelos mayores.
- Inferencia en dispositivos embebidos o con RAM limitada: con ~0,1 GB de pesos, puede ejecutarse en Raspberry Pi, moviles o maquinas sin GPU.
- Prototipado rapido de aplicaciones de generacion de texto donde el objetivo es probar la infraestructura, no la calidad de la salida.
- Educacion y experimentacion: util para estudiar el comportamiento de un transformer decoder pequeno, inspeccionar tokens y medir latencia/throughput.
- Generacion de texto auxiliar de baja exigencia (autocompletado trivial, etiquetado simple) como componente de un sistema mayor.
- Benchmarking de hardware: al ser tan ligero, permite medir rendimiento de CPU, cuantizacion y memoria con un coste minimo.
- Base para fine-tuning: el modelo base original (no esta cuantizacion) puede ajustarse en tareas especificas cuando se necesita un modelo diminuto.

## Benchmarks y rendimiento

Los datos disponibles corresponden al modelo base y a la variante Instruct originales (evaluacion zero-shot salvo indicacion contraria, con lighteval). Esta cuantizacion q8_0 no aporta mediciones propias; se asume un rendimiento cercano al del modelo base original.

Modelo base preentrenado:

| Metrica | SmolLM2-135M-8k | SmolLM-135M |
|---|---|---|
| HellaSwag | 42,1 | 41,2 |
| ARC (media) | 43,9 | 42,4 |
| PIQA | 68,4 | 68,4 |
| MMLU (cloze) | 31,5 | 30,2 |
| CommonsenseQA | 33,9 | 32,7 |
| TriviaQA | 4,1 | 4,3 |
| Winogrande | 51,3 | 51,3 |
| OpenBookQA | 34,6 | 34,0 |
| GSM8K (5-shot) | 1,4 | 1,0 |

Modelo Instruct (referencia, no incluido en este repositorio):

| Metrica | SmolLM2-135M-Instruct | SmolLM-135M-Instruct |
|---|---|---|
| IFEval (media prompt/inst) | 29,9 | 17,2 |
| MT-Bench | 1,98 | 1,68 |
| HellaSwag | 40,9 | 38,9 |
| ARC (media) | 37,3 | 33,9 |
| PIQA | 66,3 | 64,0 |
| MMLU (cloze) | 29,3 | 28,3 |
| BBH (3-shot) | 28,2 | 25,2 |
| GSM8K (5-shot) | 1,4 | 1,4 |

No se han publicado resultados de benchmarks especificos de la version q8_0 en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (q8_0): en torno a 0,1-0,2 GB para los pesos, mas una cache KV reducida por la ventana de contexto limitada. El repositorio ocupa 0,1 GB.
- GPU recomendadas: practicamente cualquiera; el modelo cabe en GPUs consumer muy antiguas y de gama baja (GTX 1050, RTX 3050, integradas). No requiere A100 ni H100.
- CPU: funciona integramente en CPU, que es su modo de despliegue natural en llama.cpp.
- Dispositivos consumer: cabe en cualquier GPU consumer actual, asi como en Raspberry Pi, moviles y sistemas embebidos.
- Opciones de despliegue: llama.cpp, llama-cpp-python, Ollama, LM Studio y cualquier runtime compatible con GGUF. Tambien puede cargarse en transformers si se usa el checkpoint safetensors original.
- Latencia y throughput: no disponibles en la informacion proporcionada; al tratarse de un modelo de 135M con cuantizacion de 8 bits, cabe esperar tiempos de generacion bajos en hardware moderno, aunque no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (referencia) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zed122/SmolLM2-135M-q8_0-GGUF (esta ficha) | 135M | 8k | Equivalente al base SmolLM2-135M (MMLU cloze 31,5) | Apache 2.0 | GGUF, 13 descargas, 0 likes |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135M | 8k | IFEval 29,9; MT-Bench 1,98 | Apache 2.0 | safetensors, modelo oficial con ajuste por instrucciones |
| HuggingFaceTB/SmolLM-135M (predecesor) | 135M | 8k | MMLU cloze 30,2; IFEval 17,2 (Instruct) | Apache 2.0 | safetensors, generacion anterior |
| QuantFactory/SmolLM2-135M-GGUF | 135M | 8k | Equivalente al base original | Apache 2.0 | GGUF, multiples cuantizaciones |
| bartowski/SmolLM2-135M-Instruct-GGUF | 135M | 8k | Equivalente al Instruct original | Apache 2.0 | GGUF, cuantizaciones con imatrix |

La diferencia clave de esta ficha frente a las alternativas GGUF es que ofrece una unica cuantizacion q8_0 del modelo base, mientras que otros repositorios publican varias cuantizaciones y/o la variante Instruct.

## Limitaciones y advertencias

- Es un modelo **base**: no sigue instrucciones, no tiene plantilla de chat y puede generar continuaciones incoherentes si se usa con prompts conversacionales.
- Riesgo elevado de alucinacion y de contenido factualmente incorrecto; la propia model card advierte de que debe usarse como herramienta asistencial y no como fuente definitiva.
- Puede reproducir sesgos presentes en los datos de entrenamiento (web, codigo, datasets filtrados).
- Solo entiende y genera principalmente en ingles; el soporte de otros idiomas es muy limitado o inexistente.
- Contexto de 8k tokens, corto en comparacion con modelos actuales.
- Rendimiento bajo en tareas de razonamiento y matematicas (GSM8K 5-shot de 1,4), por lo que no es adecuado para calculo o logica compleja.
- Licencia Apache 2.0: permite uso comercial, pero el autor de esta cuantizacion concreta no ofrece garantias adicionales; conviene verificar el origen de los pesos antes de uso en produccion.
- Repositorio con muy poca traccion (13 descargas, 0 likes) y fechas de creacion/actualizacion poco habituales; no hay evidencia de validacion externa de la cuantizacion.

## Enlaces

- Hugging Face (esta cuantizacion): https://huggingface.co/zed122/HuggingFaceTB-SmolLM2-135M-q8_0-GGUF
- Modelo base original: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Paper SmolLM2: https://arxiv.org/abs/2502.02737
- Dataset SFT (smol-smoltalk): https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Codigo de fine-tuning (alignment-handbook): https://github.com/huggingface/alignment-handbook/tree/main/recipes/smollm2
- Framework de entrenamiento nanotron: https://github.com/huggingface/nanotron/tree/main
- Herramienta de evaluacion lighteval: https://github.com/huggingface/lighteval
- Dataset UltraFeedback: https://huggingface.co/datasets/HuggingFaceH4/ultrafeedback_binarized
- Dataset Synth-APIGen-v0.1 (Argilla): https://huggingface.co/datasets/argilla/Synth-APIGen-v0.1
- Cuantizacion alternativa QuantFactory/SmolLM2-135M-GGUF: https://huggingface.co/QuantFactory/SmolLM2-135M-GGUF
- Cuantizacion alternativa bartowski/SmolLM2-135M-Instruct-GGUF: https://huggingface.co/bartowski/SmolLM2-135M-Instruct-GGUF
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
