# TR4F/crackio-humo-17b-mxfp8

## Resumen

HuMo 17B MXFP8 es una version cuantizada en formato MXFP8 del modelo HuMo 17B de ByteDance Research, un modelo de generacion de video con sincronizacion labial (lip-sync) publicado bajo licencia Apache-2.0. Esta build concreta la ha producido el usuario TR4F a partir del repack en fp16 de Comfy-Org, utilizando la herramienta de cuantizacion Crackio y el cuantizador nativo de ComfyUI (comfy_kitchen). El objetivo es acelerar la inferencia del modelo en GPUs con soporte nativo de MXFP8, en particular la serie RTX 50 (Blackwell), manteniendo una fidelidad numerica alta respecto al original en fp16.

El modelo base HuMo 17B es un transformer de 17.000 millones de parametros orientado a la generacion de video condicionada por audio, con capacidad de lip-sync. Esta version cuantizada conserva intactos sesgos, normas, modulaciones, embeddings, la cabeza de salida y la proyeccion de audio, y solo convierte a MXFP8 los pesos de las capas lineales de los 40 bloques del transformer (560 capas en total). El resultado es un fichero de 17,9 GB que se carga directamente en ComfyUI mediante el nodo estandar "Load Diffusion Model".

La relevancia de esta ficha radica en que ilustra el flujo actual de cuantizacion de modelos de video de gran tamano para consumo en hardware de gama alta orientado a consumidor, con una perdida de precision medida y documentada (error RMS relativo del 2,7 % frente a fp16) y una mejora de velocidad reportada de 1,7x en pruebas del autor en GPUs Blackwell.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para video (40 bloques, 560 capas lineales), basado en bytedance-research/HuMo |
| Parametros totales | 17B (aproximado, segun nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP8 (e4m3 con escala e8m0 por cada 32 pesos) en capas lineales; resto de tensores en fp16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con metadatos `comfy_quant` por capa) |

## Arquitectura y entrenamiento

El modelo base HuMo 17B es un transformer de difusion para generacion de video condicionada por audio, desarrollado por ByteDance Research. Esta build no modifica la arquitectura: mantiene los 40 bloques del transformer y aplica cuantizacion unicamente a los pesos de las 560 capas lineales, dejando en fp16 los sesgos, normas, modulaciones, embeddings, la cabeza de salida y la proyeccion de audio. La cuantizacion usa el esquema MXFP8: valores en e4m3 con una escala compartida e8m0 por cada bloque de 32 pesos, generada con el cuantizador comfy_kitchen de ComfyUI.

El proceso de conversion se realizo con el script `to_mxfp8_stream.py`, que descarga el fichero fp16 de Hugging Face tensor a tensor en streaming y requiere una version de ComfyUI con soporte de comfy_kitchen MXFP8. El autor reporta un error RMS relativo de los pesos cuantizados frente a fp16 de aproximadamente el 2,7 %, inferior al 3,3-3,7 % de una conversion directa a e4m3 sin escalas. No se dispone de informacion sobre el dataset de entrenamiento del modelo base, el numero de tokens utilizados ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de video condicionada por audio con sincronizacion labial (lip-sync) de alta calidad.
- Modo "Best quality" del pipeline Crackio Lip Sync.
- Integracion directa en ComfyUI mediante el nodo "Load Diffusion Model" con `weight_dtype: default`.
- Lectura automatica de metadatos `comfy_quant` por capa para aplicar la descompresion MXFP8 en tiempo de ejecucion.
- Aceleracion nativa en GPUs Blackwell (RTX 50) gracias al uso de tensor cores MXFP8.
- Ejecucion en GPUs sin soporte nativo MXFP8 mediante descompresion en tiempo de ejecucion por parte de ComfyUI.
- Soporte de tool calling, agentes, razonamiento, codigo o capacidades multilingues: no disponible (no es un modelo de lenguaje).

## Casos de uso

- Produccion de videos con lip-sync en ComfyUI: el modelo se carga como diffusion model y se usa en el pipeline Crackio Lip Sync en modo "Best quality", generando videos donde la boca del sujeto se sincroniza con una pista de audio de entrada.
- Doblaje automatizado de contenido audiovisual: dado un video y una pista de audio en otro idioma, el modelo puede regenerar la region facial para alinear los labios con el nuevo audio, reduciendo el trabajo manual de postproduccion.
- Creacion de avatares parlantes para formacion corporativa: se generan videos de instructores virtuales a partir de un audio pregrabado, con calidad suficiente para materiales internos y presentaciones.
- Prototipado rapido en estudios de animacion: los artistas pueden iterar sobre animaciones faciales basicas antes de pasar a produccion manual, usando el modelo como referencia o punto de partida.
- Generacion de contenido para redes sociales: creacion de clips cortos con personajes hablando a partir de un audio, aprovechando la velocidad de inferencia en GPUs Blackwell (1,7x mas rapido que la version fp8_e4m3fn en pruebas del autor).
- Investigacion en generacion de video condicionada por audio: el modelo sirve como base para experimentos academicos sobre sincronizacion labial, al estar disponible bajo Apache-2.0 y ser reproducible con el script de conversion incluido.
- Despliegue en entornos con GPUs RTX 50: estudios pequenos pueden montar estaciones de trabajo con una sola GPU Blackwell y ejecutar el modelo en ComfyUI sin necesidad de infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta las siguientes metricas internas:

| Metrica | Valor |
|---|---|
| Error RMS relativo de pesos cuantizados vs fp16 | ~2,7 % |
| Error RMS relativo de un cast e4m3 plano (referencia) | 3,3-3,7 % |
| Aceleracion en RTX 50 (Blackwell) vs `humo_17B_fp8_e4m3fn` | 1,7x (pruebas de Crackio Lip Sync, dos caras, entradas fijas) |
| Tamano del fichero | 17,9 GB |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el fichero de pesos ocupa 17,9 GB, por lo que se necesita al menos esa cantidad de VRAM mas el espacio para activaciones y buffers del pipeline de video.
- GPU recomendadas: RTX 50 series (Blackwell) para aprovechar los tensor cores MXFP8 nativos y obtener la aceleracion reportada de 1,7x.
- GPUs sin soporte nativo MXFP8 (por ejemplo, generaciones anteriores): ComfyUI descomprime los pesos en tiempo de ejecucion, con lo que se pierde la ventaja de velocidad pero se mantiene la compatibilidad.
- Cabe en GPU de consumidor: si, en modelos de gama alta con VRAM suficiente para alojar 17,9 GB de pesos mas el overhead del pipeline (no se especifica el minimo exacto).
- Opciones de despliegue: ComfyUI (nodo "Load Diffusion Model", requiere version reciente con comfy_kitchen). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion de video.
- Latencia y throughput: no disponibles mas alla del dato relativo de 1,7x frente a la version fp8_e4m3fn en Blackwell.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TR4F/crackio-humo-17b-mxfp8 | 17B | no disponible | MXFP8 | Apache-2.0 | Hugging Face |
| Comfy-Org/HuMo (`humo_17B_fp16`) | 17B | no disponible | fp16 | Apache-2.0 | Hugging Face |
| Comfy-Org/HuMo (`humo_17B_fp8_e4m3fn`) | 17B | no disponible | fp8 e4m3 sin escalas | Apache-2.0 | Hugging Face |
| bytedance-research/HuMo | 17B | no disponible | original | Apache-2.0 | Hugging Face |

La diferencia principal entre las tres builds de 17B es el esquema de cuantizacion: la version MXFP8 mantiene sesgos y normas en fp16 y aplica escalas por bloque de 32 pesos, mientras que la version fp8_e4m3fn convierte todos los tensores a e4m3 sin escalas, con perdida de valor en algunos sesgos (20-99 % segun el autor). No se dispone de datos de benchmarks para comparar calidad objetiva entre las tres variantes.

## Limitaciones y advertencias

- Modelo de generacion de video, no de lenguaje: no soporta texto, codigo, razonamiento ni tool calling.
- No se han publicado resultados de benchmarks estandar (FVD, LSE-D, etc.) en la informacion disponible; la calidad solo esta respaldada por pruebas cualitativas del autor.
- El error RMS del 2,7 % implica una perdida de precision no nula respecto a fp16; en produccion conviene validar la calidad visual frente al original.
- La aceleracion de 1,7x solo se ha medido en GPUs Blackwell (RTX 50); en otras GPUs el rendimiento puede ser inferior al de la version fp16 o fp8_e4m3fn por la descompresion en tiempo de ejecucion.
- Requiere una version reciente de ComfyUI con comfy_kitchen; versiones antiguas no podran leer los metadatos `comfy_quant`.
- El modelo base HuMo puede presentar sesgos en la generacion de rostros y voces; no se documentan en la informacion disponible.
- Riesgo de alucinacion visual (artefactos, desalineacion de labios) inherente a los modelos de difusion de video, especialmente con audios fuera de distribucion.
- Licencia Apache-2.0 permite uso comercial, pero al ser pesos derivados de ByteDance conviene revisar los terminos del modelo base y del repack de Comfy-Org.
- El repositorio no tiene descargas ni likes en el momento de la consulta, lo que reduce la validacion por parte de la comunidad.
- No se especifican los idiomas soportados ni la longitud de contexto del modelo base.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/TR4F/crackio-humo-17b-mxfp8
- Modelo base HuMo 17B: https://huggingface.co/bytedance-research/HuMo
- Repack fp16 de Comfy-Org: https://huggingface.co/Comfy-Org/HuMo
- Herramienta Crackio: https://github.com/RafalOfficial/Crackio
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
