# yniw/MiniMax-H3-mmh3

## Resumen

MiniMax-H3-mmh3 es un repositorio de artefactos auxiliares para [mmh3](https://github.com/niw/mmh3), un motor de inferencia dedicado al modelo de generación de vídeo MiniMax H3. No se trata de un modelo entrenado desde cero, sino de una colección de derivados (parches, LoRAs y un VAE cuantizado) que adaptan los pesos oficiales de MiniMax H3 y varios checkpoints destilados de la comunidad al formato y al pipeline de mmh3. El autor es `yniw`, y el repositorio acumula unas 6.608 descargas.

El contenido incluye un parche de rango 64 que convierte el DiT podado INT8 ConvRot de Comfy-Org en el checkpoint FastH3 VSA-DataFree de cuatro pasos; tres LoRAs en BF16 que empaquetan los adaptadores TaoMate (3 pasos), PDMD (2 pasos) y DMAD (4 pasos); y un VAE de vídeo con sus capas lineales cuantizadas a INT8 mediante GPTQ. Todo el material está pensado para cargarse con mmh3, aunque las LoRAs y el VAE siguen el esquema de nombres de ComfyUI para maximizar compatibilidad.

La relevancia actual del repositorio es práctica: permite ejecutar variantes de destilación de MiniMax H3 con muy pocos pasos de muestreo (2, 3 o 4) sobre un DiT cuantizado a INT8, reduciendo coste computacional. La ficha describe únicamente lo que consta en la información disponible; los detalles del modelo base MiniMax H3 (arquitectura, parámetros, contexto) no se detallan aquí y se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene artefactos para un DiT de difusión de vídeo; el modelo base es MiniMax H3) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (ConvRot) en el DiT y en el VAE; BF16 en las LoRAs; FP16 como referencia del VAE original |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (etiqueta `license: other`) |
| Formato de pesos | safetensors (parche, LoRAs y VAE) |

## Arquitectura y entrenamiento

El repositorio no entrena un modelo nuevo. Cada artefacto es un derivado de un checkpoint previo, y la model card documenta explícitamente el origen y la transformación aplicada. El parche `minimax_h3_fasth3_vsa_datafree_patch_rank64.safetensors` reduce la diferencia entre los pesos de FastH3 VSA-DataFree y los de MiniMax H3 a una LoRA de rango 64, y añade los tensores que una LoRA no puede transportar (las compuertas de atención dispersa VSA y el AdaLN ajustado), todo convertido al layout del DiT podado INT8 ConvRot. Se generó con `tools/models/fasth3_vsa_patch.py` de mmh3.

Las tres LoRAs empaquetan adaptadores de destilación ya publicados: TaoMate-H3 (EMA del paso 3000, rango 128, tres pasos con los estados 0, 16, 33 y 49 de una programación de 50 pasos), PDMD 2-NFE (estudiante del paso 4000, rango 128, dos pasos con shifts de vídeo y audio de 12 y 3) y DMAD 4-step (estudiante de rango 128 con crítico entrenado por completo, cuatro pasos con shifts 12 y 2 y regla de re-ruido). En el caso de PDMD, las actualizaciones de q, k y v se fusionaron y se recortaron de rango 384 a 128, conservando de media el 97 % de su energía; todas las actualizaciones se refactorizaron por SVD, se renombraron al esquema de ComfyUI y se redondearon a BF16. El VAE INT8 se obtuvo rescalando por canal de entrada el decodificador (con la inversa plegada en los pesos vecinos) y cuantizando sus capas lineales con GPTQ sobre latentes de calibración; frente al decodificado del VAE FP16 alcanza unos 60,9 dB PSNR sobre cinco latentes FastH3 fuera de la calibración, frente a 58,2 dB del redondeo a vecino más cercano.

## Capacidades

- Generación de vídeo a partir de texto (pipeline `text-to-video`) mediante el modelo base MiniMax H3.
- Generación en pocos pasos: 2 pasos (PDMD), 3 pasos (TaoMate) y 4 pasos (FastH3 VSA-DataFree y DMAD).
- Atención dispersa de vídeo (VSA) en la variante FastH3.
- Atención con precisión mixta INT8/FP8 (`--attention-precision int8-fp8`) y atención SOL.
- Generación con audio sincronizado: los LoRAs PDMD y DMAD exponen shifts separados para vídeo y audio.
- Carga de LoRAs con nombres compatibles con ComfyUI, además de con mmh3.
- Decodificado de vídeo con VAE cuantizado a INT8 en lugar del VAE FP16.
- No consta soporte de tool calling, agentes, razonamiento multi-paso ni entrada multimodal más allá del texto.

## Casos de uso

- Prototipado rápido de vídeo generativo: con el LoRA PDMD se obtiene un clip en dos pasos de muestreo, lo que permite iterar sobre prompts en minutos en lugar de horas y comparar variantes antes de lanzar una generación completa.
- Producción con presupuesto de cómputo ajustado: la combinación del DiT podado INT8 ConvRot con el parche FastH3 VSA-DataFree reduce el coste por clip al usar cuatro pasos y atención dispersa, adecuada para lotes grandes de vídeos cortos.
- Generación de vídeo con audio: los LoRAs PDMD y DMAD permiten controlar por separado los shifts de vídeo y audio, útil para piezas con narración o efectos sincronizados.
- Despliegue en ComfyUI: las LoRAs y el VAE están renombrados al esquema de ComfyUI, de modo que un equipo con flujos existentes puede incorporarlos sin reescribir el grafo.
- Evaluación comparativa de métodos de destilación: al reunir TaoMate, PDMD y DMAD en un mismo formato, se pueden comparar 2, 3 y 4 pasos sobre los mismos prompts y medir la degradación de calidad.
- Investigación sobre cuantización de VAEs: el VAE INT8 con GPTQ y sus cifras de PSNR sirven como referencia para estudiar el impacto de la cuantización en la decodificación de latentes.
- Reducción de huella en disco y memoria: el VAE INT8 y el DiT INT8 disminuyen los requisitos frente a las versiones FP16, lo que facilita ejecutar el pipeline en máquinas con menos VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato cuantitativo de la model card es la calidad del VAE:

| Metrica | Valor |
|---|---|
| PSNR del VAE INT8 ConvRot frente al VAE FP16 (5 latentes FastH3 fuera de calibracion) | ~60,9 dB |
| PSNR del redondeo a vecino mas cercano (referencia) | 58,2 dB |
| Energia conservada al recortar q/k/v de PDMD de rango 384 a 128 | 97 % de media |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 15,9 GB e incluye pesos INT8 y BF16, pero no se detalla el pico de memoria en ejecución.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; la cuantización INT8 del DiT y del VAE sugiere que el objetivo es reducir requisitos, pero no hay cifras publicadas.
- Opciones de despliegue: mmh3 (motor de referencia) y ComfyUI para las LoRAs y el VAE. No consta soporte de vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un pipeline de difusión de vídeo.
- Latencia y throughput: no disponibles. La reducción a 2, 3 o 4 pasos de muestreo disminuye el número de evaluaciones del DiT frente a una programación completa, pero no se publican tiempos medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos de muestreo | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-mmh3 (este repo) | Artefactos derivados (parche, LoRAs, VAE) | 2, 3 o 4 | safetensors INT8/BF16 | minimax-h3-community-license-agreement | Hugging Face, 6.608 descargas |
| FastVideo/FastVideo-FastH3-4-step-Preview-v1-VSA-DataFree | Checkpoint destilado | 4 | no disponible | no disponible | Hugging Face |
| TaoLiveAIGC/TaoMate-H3 | Adaptador destilado | 3 | no disponible | no disponible | Hugging Face |
| pdmd2026/pdmd_2NFE_lora | LoRA destilada | 2 | no disponible | no disponible | Hugging Face |
| ZhengmingYu/DMAD | Estudiante destilado | 4 | no disponible | no disponible | Hugging Face |

La comparativa se limita a los artefactos de origen citados en la model card, ya que no se dispone de datos de rendimiento ni de especificaciones del modelo base que permitan contrastarlos con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- El parche FastH3 incluye tensores que una LoRA no puede transportar (compuertas VSA y AdaLN ajustado); herramientas distintas de mmh3 pueden no cargarlo.
- Las LoRAs están renombradas al esquema de ComfyUI, pero su comportamiento fuera de mmh3 y ComfyUI no está verificado.
- El recorte de rango de q/k/v en PDMD conserva el 97 % de la energía de media, lo que implica una pérdida pequeña pero no nula de información.
- El VAE INT8 se calibró con GPTQ sobre latentes concretos; su fidelidad fuera de esa distribución está medida solo de forma agregada (60,9 dB PSNR) y puede variar según el contenido.
- La licencia es la MiniMax H3 Community License Agreement, no una licencia de código abierto estándar: es imprescindible revisar sus condiciones antes de cualquier uso comercial.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas del modelo base en la información disponible.
- Los datos de rendimiento, latencia y requisitos de memoria no están publicados, por lo que no se puede garantizar su comportamiento en producción sin una evaluación propia.
- El repositorio tiene 1 like y 6.608 descargas; es un proyecto de autor individual y no un artefacto oficial de MiniMax.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/yniw/MiniMax-H3-mmh3
- Motor de inferencia mmh3: https://github.com/niw/mmh3
- Modelo base MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Pesos de Comfy-Org para MiniMax H3: https://huggingface.co/Comfy-Org/MiniMax-H3
- FastH3 VSA-DataFree: https://huggingface.co/FastVideo/FastVideo-FastH3-4-step-Preview-v1-VSA-DataFree
- TaoMate-H3: https://huggingface.co/TaoLiveAIGC/TaoMate-H3
- PDMD 2-NFE LoRA: https://huggingface.co/pdmd2026/pdmd_2NFE_lora
- DMAD: https://huggingface.co/ZhengmingYu/DMAD
- pi-H3: https://huggingface.co/Lakonik/pi-H3
