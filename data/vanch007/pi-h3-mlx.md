# vanch007/pi-H3-MLX

## Resumen

pi-H3-MLX es una conversión de pesos a formato MLX del modelo pi-H3, una destilación de pocos pasos (few-step) del modelo generativo MiniMax H3. Lo publica el usuario vanch007 con el objetivo de permitir la inferencia nativa de generación de vídeo en silicio de Apple, sin depender de CUDA ni de infraestructura de servidor. El modelo resuelve el problema de ejecutar un generador de vídeo de gran tamano en un Mac con memoria unificada, mediante una adaptación de destilación (DWD) fusionada en el transformer y pesos cuantizados del codificador de texto.

Técnicamente, el paquete combina un transformer H3 podado con un adaptador de 4 pasos ya fusionado en bf16, un codificador de texto basado en Qwen3-VL de 51 capas cuantizado a 8 bits, y los VAE de vídeo y audio de MiniMax H3. El resultado es un pipeline multimodal que genera vídeo con audio sincronizado a partir de texto, de una imagen, o de un primer y último fotograma, en tan solo 4 pasos de denoising. El repositorio ocupa 0,6 GB en Hugging Face, aunque los pesos completos descritos en la model card suman del orden de 76 GB.

Su relevancia es doble: por un lado, demuestra que la generación de vídeo con audio de alta calidad puede ejecutarse en hardware de consumo profesional de Apple (M3 Max o superior); por otro, su licencia es extremadamente restrictiva, ya que excluye explícitamente la Unión Europea, el Reino Unido, Corea del Sur y Estados Unidos del territorio de uso permitido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (MiniMax H3) con adaptador de destilación DWD de 4 pasos; codificador de texto Qwen3-VL de 51 capas; VAE de vídeo y VAE de audio |
| Parametros totales | No disponible (el transformer H3 podado se distribuye en bf16 con 39 GB; el codificador de texto Q8 ocupa 27 GB) |
| Parametros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Codificador de texto en 8 bits (Q8); transformer en bf16; adaptador de 2 pasos convertible desde Lakonik/pi-H3 |
| Idiomas soportados | No disponible (el pipeline es de vídeo; el codificador de texto es Qwen3-VL, multilingüe, pero no se detalla) |
| Licencia | MiniMax H3 Community License Agreement (license: other), con territorio aplicable que excluye UE, Reino Unido, Corea del Sur y EE. UU. |
| Formato de pesos | safetensors en formato MLX (models_mlx/), más tokenizer y processor |

## Arquitectura y entrenamiento

El modelo se apoya en MiniMax H3, un generador de vídeo con audio basado en difusión, y en pi-H3, una destilación de pocos pasos publicada por Hansheng Chen et al. (Lakonik/pi-H3). La conversión a MLX fusiona el adaptador DWD de 4 pasos directamente en el transformer podado, de modo que la inferencia no requiere cargar adaptadores separados. El pipeline emplea el encoder del VAE de vídeo únicamente para los fotogramas clave, y el VAE de audio para la pista sonora sincronizada. El codificador de texto es Qwen3-VL de 51 capas, cuantizado a 8 bits para reducir el consumo de memoria unificada.

La innovación técnica destacable es la decodificación en 4 pasos, que reduce drásticamente el coste de muestreo frente a un modelo de difusión convencional, y el uso del kernel Metal de atención dispersa Sol (17-24 % de bloques exactos) para acelerar el denoising en Apple silicon. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. El adaptador de 2 pasos, más rápido pero de peor calidad para personas, no se incluye y debe convertirse desde Lakonik/pi-H3 con `python -m pih3_mlx.convert --steps 2`.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con audio sincronizado.
- Generación de vídeo a partir de una imagen (image-to-video).
- Generación de vídeo a partir de primer y último fotograma (first+last-frame-to-video).
- Generación de audio sincronizado con el vídeo (text-to-audio-video e image-to-audio-video).
- Muestreo en 4 pasos de denoising, lo que permite iteraciones rápidas.
- Ejecución nativa en Apple silicon mediante MLX, sin CUDA.
- Codificación de prompts con un modelo de lenguaje Qwen3-VL de 51 capas.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso, al tratarse de un modelo generativo de vídeo.

## Casos de uso

- Prototipado de vídeo generativo en local: un desarrollador con un Mac de 96 GB o más puede generar clips de 5 s a 512×896 en unos 5 minutos, útil para validar ideas sin depender de la nube.
- Creación de contenido para redes sociales: generación de clips cortos con audio sincronizado a partir de un prompt de texto, adecuado para borradores rápidos y variaciones.
- Animación de imágenes fijas: uso de image-to-video para dar movimiento a ilustraciones o fotografías, aprovechando el encoder del VAE para los fotogramas clave.
- Interpolación entre fotogramas clave: first+last-frame-to-video permite generar transiciones controladas entre dos imágenes, útil en animación y storyboards.
- Generación de audio para vídeo: el pipeline text-to-audio-video produce pista sonora alineada con la escena, útil para demos y maquetas.
- Investigación en destilación de difusión: el paquete permite estudiar el comportamiento del adaptador DWD de 4 pasos y compararlo con el de 2 pasos en hardware Apple.
- Evaluación de pipelines MLX: sirve como referencia para medir throughput y latencia de un generador de vídeo de gran tamano en silicio de Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento aportado es que, en un M3 Max con GPU de 40 núcleos, un clip de 4 pasos a 512×896 y 5 s se denoisa en aproximadamente 5 minutos usando el kernel Metal de atención dispersa Sol (17-24 % de bloques exactos).

## Requisitos de hardware

- Memoria unificada: mínimo 96 GB en un Mac con Apple silicon; se recomiendan 128 GB.
- GPU: Apple M3 Max (40 núcleos GPU) o superior; no se documentan otros chips.
- No cabe en GPUs de consumo convencionales (RTX 4090, etc.) según la información disponible, ya que la conversión es específica para MLX y Apple silicon.
- Despliegue: MLX con el repositorio vanch007/pi-H3-MLX; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: aproximadamente 5 minutos por clip de 5 s a 512×896 con 4 pasos en M3 Max de 40 núcleos GPU.
- Almacenamiento: los pesos completos suman del orden de 76 GB (39 GB transformer + 27 GB text encoder + 9,7 GB VAE vídeo + 0,6 GB VAE audio), aunque el repo de Hugging Face ocupa 0,6 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi-H3-MLX | No disponible | No disponible | 4 pasos, ~5 min por clip 512×896 en M3 Max | MiniMax H3 Community (excluye UE, RU, Corea, EE. UU.) | Hugging Face (vanch007/pi-H3-MLX) |
| pi-H3 (Lakonik) | No disponible | No disponible | Base de la destilación, adaptadores de 2 y 4 pasos | MiniMax H3 Community | Hugging Face (Lakonik/pi-H3) |
| MiniMax H3 | No disponible | No disponible | Modelo completo de difusión | MiniMax H3 Community | Hugging Face (MiniMaxAI/MiniMax-H3) |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- La licencia excluye explícitamente la Unión Europea, el Reino Unido, Corea del Sur y Estados Unidos del territorio de uso permitido; su uso en España queda fuera del ámbito de la concesión.
- Se trata de derivados del modelo MiniMax H3 y están sujetos a su Acceptable Use Policy y a las restricciones de la Sección V.
- El adaptador de 2 pasos no está incluido y, según el autor, es de mala calidad para personas.
- Requiere hardware Apple silicon con al menos 96 GB de memoria unificada, lo que limita su despliegue en la mayoría de equipos.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas específicas.
- Al ser un modelo generativo de vídeo, puede producir contenido no veraz o sintético; no se detallan salvaguardas.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026, por lo que su validación comunitaria es nula.

## Enlaces

- Hugging Face: https://huggingface.co/vanch007/pi-H3-MLX
- Repositorio de código: https://github.com/vanch007/pi-H3-MLX
- Modelo base pi-H3: https://huggingface.co/Lakonik/pi-H3
- Modelo original MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
