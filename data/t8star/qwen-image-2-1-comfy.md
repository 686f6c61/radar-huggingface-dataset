# t8star/qwen-image-2.1-comfy

## Resumen

Este repositorio, publicado por el usuario t8star, no es un modelo entrenado por su autor, sino un espejo de conveniencia que reúne cuatro ficheros ya existentes: tres modelos GGUF con cuantización Q4_K_M y un proyector de visión BF16. En conjunto forman una colección de modelos de reescritura de prompts (prompt rewriting) pensada para funcionar dentro del nodo de ComfyUI Comfyui-Qwen-Image-Prompt-Rewrite-T8. El modelo base declarado es la familia Qwen-Image-2.1-PE, cuyos checkpoints originales son Qwen/Qwen-Image-2.1-PE-T2I y Qwen/Qwen-Image-2.1-PE-I2I, ambos construidos por Qwen.

El problema que resuelve es acotado pero útil en flujos de generación de imagen: transformar una instrucción breve del usuario en un prompt enriquecido para un pipeline de difusión, tanto en modo texto a imagen (T2I) como en modo edición con imágenes de referencia (I2I). La variante I2I incorpora un proyector de visión que permite condicionar la reescritura sobre un conjunto de 1 a 10 imágenes de entrada. Es importante subrayar que estos pesos solo reescriben prompts: no generan imágenes por sí mismos y requieren un pipeline de difusión Qwen Image 2.1 aparte.

La relevancia de este mirror es práctica: evita tener que localizar y descargar por separado los GGUF de prithivMLmods y de pottokao, conserva los nombres de fichero y los checksums SHA256 originales, y está disponible en el registro de ComfyUI. Los metadatos de HuggingFace indican 8.953.803.264 parámetros y un tamaño de repositorio de 18,1 GB. La licencia Qwen Research limita el uso a investigación y evaluación no comerciales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la model card; la presencia de un proyector de visión BF16 (mmproj) y las etiquetas llama.cpp/gguf indican una arquitectura multimodal de tipo vision-language con decodificador transformer |
| Parametros totales | 8.953.803.264 (8,95 B), segun los metadatos de HuggingFace |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (tres ficheros GGUF de reescritura) y BF16 para el proyector de visión (mmproj-bf16.gguf) |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Qwen Research License Agreement (uso y redistribucion solo para investigacion o evaluacion no comercial; el uso comercial exige licencia aparte del titular de derechos de Qwen) |
| Formato de pesos | GGUF (Q4_K_M); GGUF BF16 para el proyector de visión |
| Tamano del repositorio | 18,1 GB (cuatro ficheros) |
| Autor del repositorio | t8star (espejo; no es el autor del entrenamiento ni de la cuantizacion) |
| Fecha de creacion / actualizacion | 21 de septiembre de 2026 / 21 de septiembre de 2026 |

### Ficheros incluidos

| Fichero | Proposito | Repositorio original | SHA256 |
|---|---|---|---|
| `Qwen-Image-2.1-PE-T2I.Q4_K_M.gguf` | Reescritura estandar texto a imagen | prithivMLmods/Qwen-Image-2.1-PE-T2I-GGUF | `340feb42c784e35b704a0f0d8d1c679a3fe60437bd9ea44a7a6fd2d730470506` |
| `Qwen-Image-2.1-PE-I2I.Q4_K_M.gguf` | Reescritura de edicion con conocimiento de imagen | prithivMLmods/Qwen-Image-2.1-PE-I2I-GGUF | `a5c6cb28cbaf838834d1335c8392619af5809d9fe95d0ebd321e15751866dfe9` |
| `Qwen-Image-2.1-PE-I2I.mmproj-bf16.gguf` | Proyector de visión para la variante I2I | prithivMLmods/Qwen-Image-2.1-PE-I2I-GGUF | `8dedb71dbc3092dc47de9108ad373d68a12854e2527d59bd9399601738f3bce1` |
| `pe_t2i_heretic-Q4_K_M.gguf` | Reescritura T2I alternativa (variante Heretic) | pottokao/Qwen-Image-2.1-PE-T2I-Heretic-GGUF | `fe176ded062942ac8858290a33c9303a6e9c09c31405020a22ad0d47fa7b9b69` |

## Arquitectura y entrenamiento

La model card de este espejo no describe la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. Esa información corresponde a los checkpoints originales de Qwen (Qwen/Qwen-Image-2.1-PE-T2I y Qwen/Qwen-Image-2.1-PE-I2I) y a los repositorios de cuantización de prithivMLmods y pottokao, que no se incluyen en la información proporcionada. Tampoco se documenta qué variante concreta de la familia Qwen sirve de base a los pesos de 8,95 B parámetros.

Lo que sí se puede afirmar a partir de los ficheros distribuidos es que se trata de una pila multimodal: la variante I2I requiere obligatoriamente el fichero `Qwen-Image-2.1-PE-I2I.mmproj-bf16.gguf`, un proyector de visión en BF16, lo que implica un codificador visual conectado a un decodificador de lenguaje. La variante T2I funciona sin proyector y procesa únicamente texto. El autor advierte de forma explícita que el proyector no debe emparejarse con ninguno de los pesos T2I. Los repositorios de origen no ofrecen un proyector de visión en Q4, por lo que la ruta multimodal obliga a cargar el mmproj en BF16.

En cuanto al proceso de cuantización, el mirror tampoco lo detalla: solo indica que los ficheros conservan nombre y checksum originales y que no fueron entrenados ni cuantizados por t8star. La variante Heretic es una alternativa opcional al T2I estándar y, según la propia model card, no ha demostrado una ventaja de calidad fiable en la comparación reducida realizada dentro de este proyecto.

## Capacidades

- Reescritura de prompts de texto a imagen: convierte instrucciones breves en descripciones detalladas y estructuradas para un pipeline de difusión.
- Reescritura de prompts de edición con imagen: la variante I2I acepta de 1 a 10 imágenes de referencia y adapta la instrucción al contenido visual observado.
- Procesamiento multimodal en la variante I2I gracias al proyector de visión BF16 que la acompaña.
- Soporte bilingüe limitado a inglés y chino, según los metadatos de idioma del repositorio.
- Inferencia mediante llama.cpp, ya que los pesos se distribuyen en formato GGUF.
- Integración como nodo de ComfyUI para reescritura de prompts dentro de un grafo de generación de imagen.
- Perfil de nodo por defecto: modelo T2I estándar para peticiones solo de texto y modelo I2I más su proyector de visión cuando la petición incluye imágenes de referencia.
- Uso como endpoint conversacional, según la etiqueta endpoints_compatible del repositorio.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, matemáticas, generación de código, audio ni modos de razonamiento explícito.

## Casos de uso

- Enriquecimiento automático de prompts en ComfyUI: el nodo carga el GGUF T2I y reescribe la instrucción del usuario antes de pasarla al pipeline de difusión Qwen Image 2.1, de modo que el usuario puede escribir una frase corta y obtener un prompt detallado sin redactarlo a mano.
- Edición guiada por imagen de referencia: con el GGUF I2I y su proyector BF16, el modelo analiza hasta 10 imágenes de entrada y reformula la orden de edición teniendo en cuenta lo que aparece en ellas, útil para flujos de retoque o variación de producto.
- Preprocesado por lotes de datasets de prompts: se puede recorrer un fichero de instrucciones breves y generar una versión ampliada de cada una mediante llama.cpp, para después usar ese corpus en tareas de evaluación o de ajuste de pipelines de imagen.
- Despliegue local sin conexión: al ser GGUF Q4_K_M, el modelo se ejecuta en una estación de trabajo con GPU de gama media sin enviar prompts ni imágenes a servicios externos, algo relevante cuando el material de entrada es sensible.
- Integración en servicios con API: la etiqueta endpoints_compatible permite exponer el modelo como servicio conversacional y llamarlo desde un backend que construya prompts para un generador de imágenes remoto.
- Comparación de variantes de reescritura: disponer del T2I estándar y del T2I Heretic en el mismo repositorio permite evaluar A/B qué variante produce prompts más útiles para un dominio concreto, aunque el autor no haya observado diferencias de calidad concluyentes.
- Evaluación académica del comportamiento de reescritura: en el marco de la licencia Qwen Research, el modelo se puede usar para estudiar cómo los reescritores de prompts afectan a la fidelidad y al sesgo de las imágenes generadas resultantes.
- Cadena completa de generación: combinando este reescritor con un pipeline de difusión Qwen Image 2.1 separado se obtiene un flujo texto a imagen de dos etapas, donde la primera etapa se puede sustituir o versionar de forma independiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del espejo no incluye métricas de MMLU, HumanEval, GSM8K ni de calidad de reescritura, y la comparación con la variante Heretic se describe únicamente como una prueba reducida sin ventaja de calidad fiable.

## Requisitos de hardware

- VRAM estimada para inferencia: cada fichero Q4_K_M de 8,95 B parámetros ocupa del orden de 5,4-5,5 GB, calculado a partir de una media de 4,85 bits por peso (estimacion derivada; el repositorio no publica el tamano individual de cada fichero).
- Proyector de vision: por diferencia entre el tamano total del repositorio (18,1 GB) y tres ficheros Q4_K_M de aproximadamente 5,4 GB, el mmproj BF16 rondaria los 1,8 GB (estimacion derivada).
- VRAM total necesaria en modo I2I: aproximadamente 7,5-8 GB sumando pesos Q4_K_M y proyector, mas el espacio de trabajo de la ventana de contexto.
- GPU de consumo: el modo T2I cabe holgadamente en tarjetas de 8 GB, como RTX 3060 Ti, RTX 4060 Ti o RTX 3070; el modo I2I con proyector BF16 encaja mejor en 12 GB o mas, como RTX 3060 de 12 GB, RTX 4070 Ti o RTX 4080.
- GPU de centro de datos: A100, H100 o L40S permiten cargar varias instancias en paralelo y operar con lotes grandes.
- Opciones de despliegue: llama.cpp como motor principal, el nodo Comfyui-Qwen-Image-Prompt-Rewrite-T8 dentro de ComfyUI, y cualquier envoltorio compatible con GGUF y endpoints conversacionales.
- Latencia y throughput: no disponibles. Dependeran del hardware, de la longitud del prompt y, en modo I2I, del numero de imagenes de referencia (hasta 10).
- Almacenamiento: 18,1 GB para el conjunto completo de los cuatro ficheros; 5,4 GB si solo se descarga un unico GGUF T2I.

## Comparativa con modelos similares

| Modelo | Contenido | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| t8star/qwen-image-2.1-comfy | Espejo con 3 GGUF Q4_K_M y 1 mmproj BF16 | 8,95 B (metadatos HF) | No disponible | Qwen Research (solo investigacion/evaluacion) | HuggingFace; 0 descargas, 0 likes |
| prithivMLmods/Qwen-Image-2.1-PE-T2I-GGUF | GGUF de reescritura T2I (origen de uno de los ficheros) | No disponible | No disponible | Qwen Research | HuggingFace |
| prithivMLmods/Qwen-Image-2.1-PE-I2I-GGUF | GGUF de reescritura I2I y su proyector BF16 (origen de dos ficheros) | No disponible | No disponible | Qwen Research | HuggingFace |
| pottokao/Qwen-Image-2.1-PE-T2I-Heretic-GGUF | GGUF de reescritura T2I alternativo | No disponible | No disponible | Qwen Research | HuggingFace |
| Qwen/Qwen-Image-2.1-PE-T2I y Qwen/Qwen-Image-2.1-PE-I2I | Checkpoints originales de Qwen | No disponible | No disponible | Qwen Research | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas variantes ni frente a otros reescritores de prompts de terceros, por lo que la comparacion se limita a procedencia, formato y licencia.

## Limitaciones y advertencias

- No es un modelo generativo de imagen: los pesos solo reescriben prompts y necesitan un pipeline de difusion Qwen Image 2.1 independiente para producir imagenes.
- Licencia restrictiva: la Qwen Research License Agreement autoriza unicamente investigacion y evaluacion no comerciales; cualquier uso comercial requiere una licencia adicional del titular de derechos de Qwen. El espejo no suministra esa licencia.
- Obligacion de conservar la licencia y el fichero NOTICE al redistribuir los pesos.
- Idiomas limitados a ingles y chino; no hay soporte declarado de castellano, lo que puede degradar la reescritura de prompts escritos en espanol.
- El proyector de vision no debe combinarse con los pesos T2I; el emparejamiento incorrecto rompe la inferencia multimodal.
- No existe proyector de vision en Q4, por lo que el modo I2I obliga a cargar el mmproj en BF16 y consume mas memoria de la que sugiere la cuantizacion del modelo principal.
- La variante Heretic no ha mostrado una ventaja de calidad fiable segun el propio autor.
- Riesgo de alucinacion: no se documenta ningun mecanismo de mitigacion ni evaluacion de fidelidad de los prompts reescritos.
- Sesgos conocidos: no documentados en la informacion disponible.
- Longitud de contexto no especificada, por lo que no se puede garantizar el comportamiento con prompts muy largos o con muchas imagenes de referencia.
- Repositorio con 0 descargas y 0 likes, sin senales de adopcion ni de mantenimiento continuado; la ultima actualizacion registrada es del 21 de septiembre de 2026.
- Trazabilidad: el autor del espejo no es el entrenador ni el cuantizador, de modo que los detalles tecnicos dependen de los repositorios de origen.
- La busqueda web realizada no devolvio resultados utiles sobre este modelo; las coincidencias obtenidas correspondian a servicios de correo no relacionados.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/t8star/qwen-image-2.1-comfy
- Nodo de ComfyUI: https://github.com/T8mars/Comfyui-Qwen-Image-Prompt-Rewrite-T8
- Registro de ComfyUI: https://registry.comfy.org/zh/publishers/t8star/nodes/qwen-image-prompt-rewrite-t8
- GGUF T2I de origen: https://huggingface.co/prithivMLmods/Qwen-Image-2.1-PE-T2I-GGUF
- GGUF I2I de origen y proyector de vision: https://huggingface.co/prithivMLmods/Qwen-Image-2.1-PE-I2I-GGUF
- GGUF Heretic de origen: https://huggingface.co/pottokao/Qwen-Image-2.1-PE-T2I-Heretic-GGUF
- Checkpoint original T2I de Qwen: https://huggingface.co/Qwen/Qwen-Image-2.1-PE-T2I
- Checkpoint original I2I de Qwen: https://huggingface.co/Qwen/Qwen-Image-2.1-PE-I2I
- Variante Heretic sin cuantizar: https://huggingface.co/pottokao/Qwen-Image-2.1-PE-T2I-Heretic
- Perfil del autor en HuggingFace: https://huggingface.co/t8star
- Canal de Bilibili: https://space.bilibili.com/385085361
- Canal de YouTube: https://www.youtube.com/@T8star-Aix/
- API del autor: https://api.seedance.nz/sign-up?aff=5f4w
- Galeria gratuita: https://www.openzhenzhen.com
- Aplicaciones en linea: https://www.runninghub.ai/zh-cn/user-center/1907375370302308353/userPost?inviteCode=rh-v1121
- Paquete de ComfyUI: https://pan.quark.cn/s/264edb7e36bd
