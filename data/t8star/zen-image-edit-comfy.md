# t8star/Zen-Image-Edit-Comfy

## Resumen

Zen Image Edit Comfy es un checkpoint en formato de archivo unico para ComfyUI derivado de AiArtLab/zen-image-edit. No se trata de un reentrenamiento ni de un lanzamiento oficial de Qwen: es una conversion de pesos que empaqueta en un solo safetensors de 16,995 GB el DiT y el VAE nativos de Qwen-Image-2.1 (obtenidos del repositorio Comfy-Org/Qwen-Image-2.1), el codificador de texto estudiante Qwen3.5-0.8B, el adaptador de fusion Zen y los recursos de tokenizador y procesador de imagen.

El modelo resuelve un problema de distribucion e integracion: en lugar de encadenar varios ficheros en un pipeline de difusion, el usuario descarga un unico checkpoint, lo coloca en `ComfyUI/models/checkpoints/` e instala los nodos Zen Image Edit T8 mediante ComfyUI Manager para ejecutar flujos de texto a imagen y de edicion de imagen. La condicion, el muestreo con KSampler y la decodificacion VAE nativos de Qwen-Image-2.1 siguen estando disponibles.

Su relevancia practica esta limitada por la licencia: los pesos derivados de Qwen quedan bajo el Qwen Research License Agreement, que solo concede derechos de investigacion y evaluacion no comercial, mientras que el codificador estudiante conserva terminos Apache-2.0 en su propio fichero de licencia. El repositorio registra 0 descargas y 1 like en el momento de la consulta, y la model card esta redactada en ingles y chino.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) de Qwen-Image-2.1 con VAE nativo, adaptador de fusion Zen y codificador de texto Qwen3.5-0.8B |
| Parametros totales | no disponible (peso del unico fichero: 16,995 GB; tamano del repo: 17,0 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye como checkpoint unico en safetensors; la model card no documenta variantes cuantizadas) |
| Idiomas soportados | en (ingles) |
| Licencia | qwen-research (Qwen Research License Agreement) para los pesos derivados de Qwen; Apache-2.0 para el codificador estudiante Qwen3.5-0.8B |
| Formato de pesos | safetensors (fichero unico: `zen_image_edit_qwen21_single.safetensors`) |

## Arquitectura y entrenamiento

La pieza central es el DiT de Qwen-Image-2.1 junto con su VAE, tomados del repositorio Comfy-Org/Qwen-Image-2.1 y conservados sin modificaciones respecto al original. Sobre esa base, el checkpoint incorpora un adaptador de fusion denominado Zen y un codificador de texto estudiante Qwen3.5-0.8B, que sustituye al codificador de mayor tamano del pipeline original para reducir el coste de inferencia. El repositorio incluye ademas los recursos de tokenizador y procesador de imagen necesarios para la condicion de texto y la edicion.

No hay informacion publicada sobre el entrenamiento de esta conversion: la propia model card indica explicitamente que no se ha reentrenado el modelo y que se trata de una conversion de formato para ComfyUI, no de un fine-tune nuevo. Por tanto, no se dispone de datos sobre numero de tokens de entrenamiento, composicion del dataset, ni uso de RLHF o DPO en este repositorio. Cualquier innovacion tecnica relevante procede de la arquitectura subyacente de Qwen-Image-2.1 y del modelo original AiArtLab/zen-image-edit, no de esta conversion.

## Capacidades

- Generacion de imagen a partir de texto (text-to-image), mediante el flujo incluido en el repositorio.
- Edicion de imagen, que es la funcion principal del modelo original del que deriva.
- Integracion nativa con ComfyUI: nodos Zen Image Edit T8, ademas de la condicion, el KSampler y la decodificacion VAE de Qwen-Image-2.1.
- Carga en un unico paso: solo requiere el fichero `zen_image_edit_qwen21_single.safetensors` en `ComfyUI/models/checkpoints/`.
- Codificacion de texto en ingles, idioma unico declarado en los metadatos del repositorio.
- No es un modelo de lenguaje: no realiza generacion de texto, razonamiento, codigo ni matematicas.
- No se documenta soporte de tool calling, function calling ni comportamiento de agente.
- No se documentan capacidades de audio, video ni modo de pensamiento.

## Casos de uso

- Edicion de imagenes por lotes en un flujo de ComfyUI: el modelo permite cargar una imagen y aplicar transformaciones guiadas por texto dentro de grafos automatizados, aprovechando que el checkpoint unico simplifica la gestion de dependencias.
- Prototipado de interfaces de edicion grafica: al integrarse como nodo de ComfyUI, se puede conectar a otros nodos para construir herramientas internas de retoque antes de invertir en un pipeline propio.
- Evaluacion comparativa de codificadores de texto: el uso de Qwen3.5-0.8B como estudiante permite medir la perdida de calidad frente al codificador original en tareas de condicion de texto, util para investigacion en destilacion de encoders.
- Investigacion academica en difusion: el checkpoint queda bajo licencia de investigacion no comercial, lo que encaja con experimentos reproducibles en entornos universitarios o de laboratorio.
- Generacion de imagenes de referencia para documentacion tecnica: el flujo de texto a imagen incluido sirve para producir ilustraciones de apoyo en entornos de desarrollo, sin uso comercial.
- Pruebas de integracion de nodos personalizados: el repositorio de nodos T8 permite validar que un entorno ComfyUI recien instalado funciona con modelos basados en Qwen-Image-2.1 antes de desplegar pipelines mayores.
- Formacion y demostraciones: al ser un unico fichero, resulta adecuado para sesiones didacticas donde el tiempo de preparacion del entorno es critico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero de pesos ocupa 16,995 GB, por lo que la carga completa en memoria exige al menos unos 17 GB de VRAM solo para los pesos, mas el consumo del VAE y las activaciones intermedias. En la practica se recomienda un minimo de 20-24 GB de VRAM, aunque esta cifra es una estimacion y no un dato publicado por el autor.
- GPU recomendadas: tarjetas de 24 GB o mas, como RTX 3090, RTX 4090, A100 (40 GB y 80 GB) o H100.
- Compatibilidad con GPU de consumo: cabe en tarjetas de 24 GB; en tarjetas de 16 GB o menos requeriria descarga secuencial a CPU u offloading de modulos, con la consiguiente penalizacion de velocidad.
- Opciones de despliegue: ComfyUI es la via soportada oficialmente, con los nodos Zen Image Edit T8 instalados desde ComfyUI Manager. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo de difusion de este tipo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Naturaleza | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| t8star/Zen-Image-Edit-Comfy | Conversion a checkpoint unico para ComfyUI | no disponible (fichero de 16,995 GB) | no disponible | qwen-research (no comercial) + Apache-2.0 en el encoder | HuggingFace, 0 descargas, 1 like |
| AiArtLab/zen-image-edit | Modelo original del que deriva | no disponible | no disponible | no disponible | HuggingFace |
| Qwen-Image-2.1 (Qwen/Qwen-Image-2.1) | Modelo base de difusion | no disponible | no disponible | no disponible | HuggingFace |
| Comfy-Org/Qwen-Image-2.1 | Distribucion nativa DiT + VAE para ComfyUI | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos de parametros, contexto ni rendimiento de los modelos comparados en la informacion proporcionada, por lo que la comparacion se limita a la naturaleza, el origen y el regimen de licencia.

## Limitaciones y advertencias

- Licencia restrictiva: los pesos derivados de Qwen estan sujetos al Qwen Research License Agreement, que solo autoriza uso no comercial de investigacion y evaluacion. Cualquier uso comercial exige una licencia adicional del titular de los derechos.
- Obligaciones de redistribucion: al redistribuir el modelo hay que conservar los acuerdos de licencia y el fichero `NOTICE.md`; el codificador estudiante mantiene sus propios terminos Apache-2.0 en `LICENSE-Qwen3.5-0.8B`.
- No es un modelo oficial: la model card indica expresamente que no es un lanzamiento oficial de Qwen ni un fine-tune nuevo, sino una conversion de formato.
- Cobertura idiomatica limitada: solo se declara ingles, lo que puede degradar los resultados con prompts en castellano u otros idiomas.
- Ausencia de evaluacion publica: no hay benchmarks ni metricas de calidad publicadas para esta conversion, por lo que no se puede cuantificar la perdida de fidelidad respecto al modelo original.
- Riesgo de alucinacion visual: como todo modelo generativo de imagen, puede producir contenido incoherente o inexacto respecto a la instruccion, especialmente con prompts ambiguos.
- Sesgos: no se documenta ninguna evaluacion de sesgos del modelo original ni de esta conversion.
- Dependencia de ComfyUI: el uso esta ligado al ecosistema ComfyUI y a los nodos T8; no se ofrecen pesos en otros formatos de inferencia.
- Adopcion nula: 0 descargas y 1 like en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad y mayor riesgo de problemas no detectados.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/t8star/Zen-Image-Edit-Comfy
- Modelo original: https://huggingface.co/AiArtLab/zen-image-edit
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio nativo DiT y VAE para ComfyUI: https://huggingface.co/Comfy-Org/Qwen-Image-2.1
- Nodos ComfyUI Zen Image Edit T8: https://github.com/T8mars/comfyui-Zen-Image-Edit-T8
- Licencia del modelo: https://huggingface.co/t8star/Zen-Image-Edit-Comfy/blob/main/LICENSE
