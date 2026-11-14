# Xylolabs/CLIP-ViT-B-32-Text-Tensix-Components

## Resumen

CLIP-ViT-B-32-Text-Tensix-Components es un paquete de tensores de operadores (componentes de pesos preparados) extraidos del codificador de texto del modelo OpenAI CLIP ViT-B/32, empaquetado por Xylolabs para su uso en hardware Tenstorrent Tensix. No es un modelo entrenado de nuevo ni un fine-tune funcional por si mismo: es un artefacto de serializacion que contiene los pesos del text encoder de CLIP reorganizados en 13 ficheros de tensores (doce bloques transformer mas embedding, posicion, normalizacion, proyeccion y selectores), listos para integrarse en un runtime de inferencia sobre aceleradores Tensix.

El modelo base, CLIP ViT-B/32, es el conocido contraste vision-lenguaje de OpenAI, con un transformer de 12 capas y 512 dimensiones ocultas en su torre de texto. Este export cubre exclusivamente la rama de texto: entradas de hasta 77 tokens CLIP (paddadas a 96 posiciones), con un unico token final de vocabulario maximo. La codificacion visual y la escala de logits imagen-texto quedan explicitamente excluidas.

La relevancia del artefacto es de infraestructura: permite desplegar el encoder de texto de CLIP en hardware Tenstorrent sin necesidad de reconvertir los pesos, preservando los valores densos originales en FP32 y las dos partes del embedding en BF16. El repo ocupa unos 0,3 GB y requiere aproximadamente 0,27 GB de memoria de dispositivo solo para los pesos de componentes, mas espacio para buffers de trabajo. Necesita el tokenizer original de CLIP y una implementacion de la arquitectura de texto para funcionar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (torre de texto de CLIP ViT-B/32), 12 bloques preparados |
| Parametros totales | no disponible (pesos de componentes; ~0,27 GB de memoria de dispositivo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 77 tokens CLIP, paddados a 96 posiciones |
| Tipos de cuantizacion | FP32 (160 entradas de bloque/posicion/norm/proyeccion/mascara) y BF16 (embedding high/low y selector de end-token, 3 entradas) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT (modelo original OpenAI); loader de Xylolabs bajo Apache 2.0 |
| Formato de pesos | safetensors (13 ficheros de tensores), PyTorch |

## Arquitectura y entrenamiento

El artefacto deriva del codificador de texto de OpenAI CLIP ViT-B/32, un transformer de 12 capas con 512 dimensiones ocultas y 8 cabezas de atencion en su configuracion base. Este export contiene doce bloques transformer preparados mas tensores de embedding, posicion, normalizacion, proyeccion y selectores. Las mascaras incluidas son indicadores de atencion permitida (valores 0/1), no mascaras aditivas con 0/infinito negativo, lo que condiciona la implementacion del runtime.

No hay entrenamiento nuevo ni ajuste fino: los valores densos originales se preservan mediante el cast a FP32, y las dos partes BF16 del embedding y las mascaras 0/1 coinciden exactamente con la preparacion existente. El puerto de referencia usa productos densos en BF16 con residuales, normalizacion, scores de atencion/softmax y pooling en FP32; la ruta de embedding suma las busquedas high y low en BF16 en FP32. La validacion reportada por el autor confirma que el artefacto JIT original coincide con el SHA256 publicado por OpenAI, que los 149 tensores de texto originales coinciden en valor y dtype, y que los 163 tensores preparados son finitos y siguen las formulas de conversion, padding, mascara y selector. No se reportan datos de velocidad.

## Capacidades

- Generacion de embeddings de texto (text-embeddings) compatibles con el espacio latente de CLIP ViT-B/32.
- Codificacion de prompts de hasta 77 tokens CLIP, con padding a 96 posiciones y un unico token final de vocabulario maximo.
- Alineacion texto-imagen en el espacio compartido de CLIP, utilizable junto con un codificador visual compatible (no incluido).
- Integracion en pipelines de recuperacion y similitud semantica texto-texto y texto-imagen (requiere la torre visual por separado).
- No incluye tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking.
- No incluye vision ni audio: la codificacion visual y la escala de logits imagen-texto estan excluidas.
- Soporte multilingue limitado al ingles.

## Casos de uso

- Busqueda semantica de texto sobre corpus en ingles: usar el encoder para generar embeddings de documentos y consultas, y calcular similitud coseno en el espacio CLIP; adecuado por su contexto de 77 tokens y su compatibilidad con indices vectoriales estandar.
- Clasificacion zero-shot texto-imagen en produccion: combinar este encoder de texto con la torre visual de CLIP ViT-B/32 para puntuar pares imagen-etiqueta; util para moderacion de contenido o etiquetado automatico cuando se despliega en aceleradores Tensix.
- Filtrado y deduplicacion de datasets: generar embeddings de descripciones o captions y agrupar por similitud para eliminar duplicados semanticos antes del entrenamiento.
- Sistemas de recomendacion basados en contenido: representar titulos y descripciones de items como vectores CLIP y recuperar candidatos por vecindad, con latencia baja en hardware Tensix.
- Enrutamiento de consultas en pipelines RAG: usar el embedding de la consulta para decidir que indice o coleccion consultar, aprovechando la ventana de 77 tokens para prompts cortos.
- Despliegue en edge con Tenstorrent: integrar los componentes en el runtime Tensix para inferencia del text encoder en dispositivos con memoria de dispositivo limitada (unos 0,27 GB de pesos mas buffers), reduciendo la dependencia de GPUs.
- Evaluacion de alineacion multimodal: emplear los embeddings de texto como referencia para medir la calidad de un codificador visual propio frente a CLIP en tareas de retrieval.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta verificaciones de integridad y serializacion (coincidencia SHA256 con el artefacto JIT de OpenAI, coincidencia de los 149 tensores originales en valor y dtype, y finitud de los 163 tensores preparados), sin metricas de velocidad ni de calidad de salida.

## Requisitos de hardware

- VRAM/memoria de dispositivo: aproximadamente 0,27 GB solo para pesos de componentes, mas espacio para buffers de trabajo; el repo en disco ocupa unos 0,3 GB (0,26 GB de almacenamiento de ficheros).
- Hardware objetivo: aceleradores Tenstorrent Tensix; el artefacto esta preparado especificamente para ese backend.
- GPU consumer: el tamano es reducido y cabria en GPUs consumer, pero el paquete esta pensado para Tensix y no se documenta un camino de despliegue en GPU.
- Opciones de despliegue: loader de componentes en streaming incluido (`load_components.py`, Apache 2.0) sobre PyTorch, safetensors y huggingface_hub; requiere tokenizer CLIP y una implementacion de la arquitectura de texto.
- No se documentan opciones para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo generativo.
- Latencia y throughput: no disponibles; el autor indica explicitamente que no reporta velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Xylolabs/CLIP-ViT-B-32-Text-Tensix-Components | no disponible (~0,27 GB de pesos) | 77 tokens (pad 96) | MIT | safetensors (FP32/BF16) | Solo torre de texto, preparado para Tensix |
| openai/clip-vit-base-patch32 | ~151 M (modelo completo) | 77 tokens | MIT | PyTorch/safetensors | Modelo base original, incluye torre visual |
| openai/clip-vit-large-patch14 | ~428 M (modelo completo) | 77 tokens | MIT | PyTorch/safetensors | Version mayor, mejor calidad, mas coste |
| sentence-transformers/all-MiniLM-L6-v2 | ~22 M | 256 tokens | Apache 2.0 | safetensors/ONNX | Solo texto, mas ligero, sin alineacion visual |

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el tokenizer original de CLIP, una implementacion de la arquitectura de texto y un adaptador de integracion; el ejemplo del quickstart solo carga tensores.
- Excluye la codificacion visual y la escala de logits imagen-texto; no sirve por si solo para tareas imagen-texto sin la torre visual correspondiente.
- Ventana de contexto muy corta (77 tokens CLIP), insuficiente para documentos largos o conversaciones multi-turno.
- Solo ingles; el rendimiento en otros idiomas no esta soportado ni documentado.
- Las mascaras son indicadores de atencion permitida (0/1), no mascaras aditivas; un runtime que espere mascaras con -infinito producira resultados incorrectos si no se adapta.
- No se reportan benchmarks de calidad ni de velocidad; la validacion se limita a integridad de valores y serializacion.
- Riesgo de alucinacion no aplica en el sentido generativo, pero los embeddings pueden reflejar sesgos del corpus original de CLIP (OpenAI), no auditados en este export.
- Licencia MIT para el modelo original y Apache 2.0 para el loader; se deben conservar los avisos `LICENSE`, `OMNIVLA_MIT_LICENSE`, `NOTICE` y `CODE_LICENSE`.
- Se entrega "as is", sin garantia; para produccion conviene validar la salida del encoder integrado de forma independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/CLIP-ViT-B-32-Text-Tensix-Components
- Modelo base: https://huggingface.co/openai/clip-vit-base-patch32
- Repositorio OpenAI CLIP: https://github.com/openai/CLIP
- Integracion OmniVLA: https://github.com/NHirose/OmniVLA
- Repositorio de herramientas Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion Tenstorrent: https://docs.tenstorrent.com
- Loader de componentes: https://huggingface.co/Xylolabs/CLIP-ViT-B-32-Text-Tensix-Components/blob/main/load_components.py
- Licencia: https://huggingface.co/Xylolabs/CLIP-ViT-B-32-Text-Tensix-Components/blob/main/LICENSE
