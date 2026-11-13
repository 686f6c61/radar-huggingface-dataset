# STEL-LIUM/Triton-v1-Extras

## Resumen

Triton-v1-Extras no es un modelo entrenado, sino un repositorio espejo (mirror) que agrupa ocho ficheros GGUF y safetensors de terceros utilizados por la aplicacion de escritorio Triton, desarrollada por Stellium. El repositorio sirve como fuente unica de descarga para el asistente de configuracion de Triton, que ofrece la opcion "Triton + extras" para instalar, junto al modelo principal, un conjunto de modelos auxiliares especializados: un juez de respuestas, un clasificador de seguridad, un modelo de embeddings, un asistente de vision y un generador de imagenes completo (modelo de difusion, codificador de texto y VAE).

Los ficheros proceden de proyectos publicos de Qwen, Unsloth, mradermacher, leejet y Black Forest Labs, y el autor declara que son copias sin modificar, con sumas SHA-256 identicas a las de los repositorios originales (verificado el 2026-11-12). El repositorio ocupa 21,7 GB en total y todos los ficheros estan bajo licencia Apache 2.0.

La relevancia de este repositorio es practica: simplifica el despliegue de un stack multimodal local completo (texto, vision, embeddings, moderacion y generacion de imagenes) sobre llama.cpp y stable-diffusion.cpp, sin necesidad de rastrear multiples fuentes. No aporta innovacion en arquitectura ni entrenamiento; su valor esta en la curaduria y el empaquetado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conjunto heterogeneo: transformers densos (Qwen3.5, Qwen3Guard, Qwen3-Embedding, Qwen3-4B-Instruct), modelo de difusion (Z-Image-Turbo) y VAE (FLUX.1-schnell) |
| Parametros totales | 4.022.468.096 (dato del fichero safetensors principal; el repositorio contiene varios modelos de distinto tamano) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (modelos de lenguaje), Q8_0 (embeddings, codificador de texto y difusion), F16 (proyector multimodal) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp, stable-diffusion.cpp) y safetensors (VAE) |

Desglose de ficheros incluidos:

| Fichero | Tamano | Funcion | Origen |
|---|---|---|---|
| `Qwen3.5-4B-Q4_K_M.gguf` | 2,74 GB | Juez de respuestas | unsloth/Qwen3.5-4B-GGUF |
| `Qwen3Guard-Gen-0.6B.Q4_K_M.gguf` | 0,48 GB | Moderacion de contenido | mradermacher/Qwen3Guard-Gen-0.6B-GGUF |
| `Qwen3-Embedding-0.6B-Q8_0.gguf` | 0,64 GB | Embeddings de texto | Qwen/Qwen3-Embedding-0.6B-GGUF |
| `Qwen3.5-9B-Q4_K_M.gguf` | 5,68 GB | Asistente de vision | unsloth/Qwen3.5-9B-GGUF |
| `mmproj-F16.gguf` | 0,92 GB | Proyector multimodal | unsloth/Qwen3.5-9B-GGUF |
| `z_image_turbo-Q8_0.gguf` | 6,58 GB | Modelo de difusion | leejet/Z-Image-Turbo-GGUF |
| `Qwen3-4B-Instruct-2507-Q8_0.gguf` | 4,28 GB | Codificador de texto del generador de imagenes | unsloth/Qwen3-4B-Instruct-2507-GGUF |
| `ae.safetensors` | 0,34 GB | VAE del generador de imagenes | black-forest-labs/FLUX.1-schnell |

## Arquitectura y entrenamiento

El repositorio no contiene entrenamiento propio. Cada fichero corresponde a un modelo upstream con su propia arquitectura: los modelos Qwen3.5 y Qwen3 son transformers densos con atencion por decodificacion; Qwen3Guard-Gen-0.6B es un clasificador generativo de seguridad; Qwen3-Embedding-0.6B es un modelo de representaciones vectoriales; Z-Image-Turbo es un modelo de difusion para sintesis de imagenes; y `ae.safetensors` es el autoencoder variacional de FLUX.1-schnell que decodifica latentes a pixeles.

Las cuantizaciones aplicadas son Q4_K_M para los modelos de lenguaje de 4B y 9B (con metadatos de imatrix, segun las etiquetas del repositorio), Q8_0 para embeddings, codificador de texto y difusion, y F16 para el proyector multimodal. No se dispone de informacion sobre volumen de tokens, composicion del dataset ni etapas de RLHF/DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento mediante Qwen3.5-4B y Qwen3.5-9B (este ultimo con proyector multimodal).
- Vision por computador: descripcion y comprension de imagenes mediante el par `Qwen3.5-9B` + `mmproj-F16`.
- Clasificacion de seguridad y moderacion de contenido conversacional con Qwen3Guard-Gen-0.6B.
- Verificacion o evaluacion de respuestas ("judge") con Qwen3.5-4B.
- Generacion de embeddings de texto para busqueda semantica y memoria con Qwen3-Embedding-0.6B.
- Sintesis de imagenes texto-a-imagen con Z-Image-Turbo, codificador Qwen3-4B-Instruct y VAE de FLUX.1-schnell.
- Ejecucion local mediante llama.cpp y stable-diffusion.cpp.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- No se documenta soporte explicito de tool calling, agentes multi-paso ni modo thinking en la informacion disponible.

## Casos de uso

- Asistente de escritorio todo-en-uno: el conjunto permite a una aplicacion local alternar entre conversacion, analisis de imagenes y generacion de imagenes sin depender de la nube, usando llama.cpp para los modelos de lenguaje y stable-diffusion.cpp para la difusion.
- Moderacion de chat en local: Qwen3Guard-Gen-0.6B (0,48 GB) puede filtrar contenido inseguro en tiempo real antes de mostrarlo al usuario, con un coste de memoria minimo.
- Busqueda semantica y memoria de conversacion: Qwen3-Embedding-0.6B genera vectores para indexar documentos o historial y recuperar contexto relevante en una base vectorial local.
- Verificacion de respuestas: Qwen3.5-4B actua como juez que evalua la calidad o coherencia de las respuestas del modelo principal antes de entregarlas, un patron util en pipelines de autoevaluacion.
- Descripcion de imagenes y accesibilidad: el par Qwen3.5-9B + mmproj-F16 permite generar descripciones textuales de imagenes capturadas o cargadas por el usuario, por ejemplo para lectores de pantalla o catalogacion.
- Generacion de ilustraciones bajo demanda: Z-Image-Turbo con su codificador y VAE permite crear imagenes a partir de prompts de texto en una estacion de trabajo, sin servicios externos.
- Prototipado de stacks multimodales: investigadores pueden descargar un unico repositorio para montar un entorno de pruebas completo de texto, vision, embeddings y difusion sobre hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el conjunto completo: los ficheros suman 21,66 GB en disco; cargados simultaneamente requieren al menos unos 22-24 GB de VRAM/RAM, aunque en la practica los modelos se cargan bajo demanda.
- Modelos de lenguaje individuales: Qwen3.5-4B Q4_K_M (2,74 GB) y Qwen3Guard (0,48 GB) caben en GPUs de consumo con 6-8 GB; Qwen3.5-9B Q4_K_M (5,68 GB) mas proyector (0,92 GB) requiere aproximadamente 8-10 GB.
- Embeddings y codificador de texto: Qwen3-Embedding-0.6B Q8_0 (0,64 GB) y Qwen3-4B-Instruct Q8_0 (4,28 GB) son ligeros; el segundo necesita unos 5-6 GB.
- Generacion de imagenes: Z-Image-Turbo Q8_0 (6,58 GB) mas VAE (0,34 GB) requiere del orden de 8-10 GB de VRAM para inferencia comoda.
- GPUs recomendadas: RTX 3060 12 GB o superior para el flujo completo; RTX 4090, A100 o H100 para mayor throughput y ejecucion concurrente de todos los componentes.
- Cabe en GPU de consumo: si, componente a componente; el conjunto completo en una sola GPU exige 24 GB o mas.
- Opciones de despliegue: llama.cpp (modelos de lenguaje), stable-diffusion.cpp (difusion, codificador y VAE), y la propia aplicacion Triton de Stellium.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Aspecto | Triton-v1-Extras | Repositorios upstream individuales (Qwen, Unsloth) | Stacks multimodales propietarios (p. ej. API en la nube) |
|---|---|---|---|
| Naturaleza | Mirror curado de 8 ficheros | Modelos sueltos por familia | Servicios gestionados |
| Parametros | Heterogeneo (0,6B a 9B + difusion) | Variable por fichero | No disponible |
| Contexto | No disponible | No disponible en la informacion dada | No disponible |
| Licencia | Apache 2.0 | Apache 2.0 (segun autor) | Propietaria |
| Ejecucion local | Si (llama.cpp, stable-diffusion.cpp) | Si | No |
| Facilidad de despliegue | Alta (fuente unica, checksums) | Media (multiples descargas) | Alta (API) |
| Coste | Gratuito, coste de hardware | Gratuito | Por uso |

## Limitaciones y advertencias

- No es un modelo entrenado: cualquier evaluacion de calidad debe hacerse sobre los modelos upstream, no sobre este repositorio.
- El autor no garantiza actualizaciones; los checksums corresponden al 2026-11-12 y podrian divergir de versiones futuras de los repositorios originales.
- El repositorio mezcla modelos con propositos distintos; no debe tratarse como un unico modelo con contexto o parametros unificados.
- Riesgo de alucinacion inherente a los modelos de lenguaje Qwen3.5 y Qwen3-4B-Instruct, no mitigado por el empaquetado.
- La moderacion con Qwen3Guard no es infalible: puede producir falsos positivos y falsos negativos.
- No se documentan idiomas soportados ni sesgos conocidos en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial de los ficheros, pero deben respetarse los avisos de atribucion de `NOTICE.md` y las marcas de los proyectos originales.
- `ae.safetensors` procede de FLUX.1-schnell (Apache 2.0); el autor advierte que una copia identica existe en el repo no comercial FLUX.1-dev, por lo que conviene verificar el origen al redistribuir.
- El uso de estos ficheros fuera de la aplicacion Triton requiere configurar manualmente llama.cpp y stable-diffusion.cpp.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/STEL-LIUM/Triton-v1-Extras
- Modelo principal de Triton: https://huggingface.co/STEL-LIUM/Triton-v1-GGUF
- Web de Stellium: https://stellium.club
- Qwen3.5-4B GGUF (Unsloth): https://huggingface.co/unsloth/Qwen3.5-4B-GGUF
- Qwen3.5-9B GGUF (Unsloth): https://huggingface.co/unsloth/Qwen3.5-9B-GGUF
- Qwen3Guard-Gen-0.6B GGUF (mradermacher): https://huggingface.co/mradermacher/Qwen3Guard-Gen-0.6B-GGUF
- Qwen3-Embedding-0.6B GGUF: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B-GGUF
- Qwen3-4B-Instruct-2507 GGUF (Unsloth): https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507-GGUF
- Z-Image-Turbo GGUF (leejet): https://huggingface.co/leejet/Z-Image-Turbo-GGUF
- FLUX.1-schnell: https://huggingface.co/black-forest-labs/FLUX.1-schnell
- llama.cpp: https://github.com/ggml-org/llama.cpp
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
