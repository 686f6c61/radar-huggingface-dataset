# wutt6678/Qwen3-VL-4B-Instruct-IDUnlearn-Bench-Vanilla

## Resumen

Este repositorio contiene un checkpoint derivado de Qwen3-VL-4B-Instruct, publicado por el usuario wutt6678 bajo el identificador Qwen3-VL-4B-Instruct-IDUnlearn-Bench-Vanilla. Se trata de un modelo de lenguaje y vision (VLM) de aproximadamente 4.000 millones de parametros, construido sobre la arquitectura multimodal de la familia Qwen3-VL de Alibaba Cloud, que combina un codificador de vision con un modelo de lenguaje autorregresivo denso. El sufijo del nombre sugiere una variante preparada para un banco de pruebas de "unlearning" de identidad, pero la model card del autor esta practicamente vacia: solo declara la licencia cc-by-4.0 y no incluye descripcion, datos de entrenamiento ni instrucciones de uso.

El interes de esta ficha es doble. Por un lado, documenta las capacidades heredadas del modelo base Qwen3-VL-4B-Instruct, que cubre respuesta a preguntas visuales, OCR multilingue, comprension de documentos, grounding visual, razonamiento espacial, comprension de video y tareas de agente visual. Por otro, advierte de que este repositorio concreto no aporta evidencia publica de que dichas capacidades se conserven intactas tras el proceso de ajuste al que alude su nombre.

Dado que no hay documentacion tecnica asociada ni resultados de evaluacion publicados, esta ficha distingue en todo momento entre los datos verificables del modelo base y los datos no disponibles del checkpoint concreto. Cualquier uso en produccion deberia ir precedido de una evaluacion propia del checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal denso (codificador de vision + modelo de lenguaje autorregresivo), segun la familia Qwen3-VL; no confirmado de forma especifica para este checkpoint |
| Parametros totales | Aproximadamente 4.000 millones (deducido del identificador del modelo) |
| Parametros activos | No aplica (arquitectura densa) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible para este checkpoint; el modelo base dispone de versiones GGUF en terceros (se cita un archivo GGUF de 8,40 GB) |
| Idiomas soportados | No disponibles; el modelo base se describe como multilingue con OCR multilingue |
| Licencia | cc-by-4.0 |
| Formato de pesos | No disponible; la model card no declara safetensors, GGUF ni otros formatos |

## Arquitectura y entrenamiento

La arquitectura heredada corresponde al diseno de Qwen3-VL: un codificador de vision acoplado a un modelo de lenguaje autorregresivo denso, entrenado para tareas de comprension conjunta de imagen, video y texto. La familia Qwen3-VL se distribuye en variantes densas y MoE; el modelo del que deriva este checkpoint pertenece a las densas, con unos 4.000 millones de parametros en el componente de lenguaje. La informacion recopilada no detalla el numero de capas, la dimension oculta, el numero de cabezas de atencion ni el tamano del codificador de vision.

En cuanto al entrenamiento, no hay ningun dato disponible sobre este checkpoint: se desconoce el volumen de tokens utilizados, la composicion del dataset, si se aplicaron tecnicas de ajuste por preferencias (RLHF, DPO) o si el proceso de "unlearning" al que alude el nombre consistio en un ajuste supervisado, un entrenamiento con gradiente invertido o una proyeccion de pesos. Tampoco se documenta que parametros se modificaron respecto al modelo base ni si se congelo el codificador de vision. Esta ausencia de informacion impide reproducir el proceso y dificulta atribuir cualquier cambio de comportamiento a una causa concreta.

## Capacidades

Las capacidades que se listan a continuacion corresponden al modelo base Qwen3-VL-4B-Instruct, segun la documentacion publica de la familia. No hay evidencia de que este checkpoint las conserve, por lo que deben verificarse de forma empirica.

- Comprension de imagenes: respuesta a preguntas visuales, descripcion de escenas y generacion de subtitulos.
- OCR multilingue: extraccion de texto en imagenes, incluidas capturas, senalizacion y documentos escaneados.
- Comprension de documentos: interpretacion de tablas, formularios, facturas y maquetas con texto e imagen combinados.
- Grounding visual: localizacion de objetos o regiones concretas dentro de una imagen a partir de una descripcion textual.
- Razonamiento espacial: relaciones de posicion, tamano y orientacion entre elementos de una escena.
- Comprension de video: analisis de secuencias temporales y de la dinamica de la escena.
- Codigo visual: generacion y edicion de codigo a partir de interfaces, diagramas o capturas de pantalla.
- Tareas de agente visual: interaccion multi-paso con entornos graficos.
- Generacion de texto: redaccion, resumen, traduccion y respuesta conversacional en el componente de lenguaje.
- Tool calling y function calling: el modelo base pertenece a la generacion Qwen3, que incorpora soporte de llamada a herramientas; no confirmado para este checkpoint.
- Multilingue: el modelo base declara soporte multilingue; no se especifica la lista de idiomas en la informacion recopilada.

## Casos de uso

- Digitalizacion de documentos con OCR: el modelo puede extraer texto de facturas, formularios y escaneos, y devolverlo estructurado. Es adecuado porque el modelo base incorpora OCR multilingue y comprension de documentos con disposiciones complejas.
- Accesibilidad para personas con discapacidad visual: descripcion automatica de imagenes y lectura en voz alta de documentos capturados con el movil, aprovechando la combinacion de codificador de vision y generacion de texto.
- Moderacion de contenido visual: clasificacion de imagenes y videos subidos por usuarios en plataformas, con justificacion textual de la decision para facilitar la revision humana.
- Automatizacion de tareas de interfaz: un agente que interpreta capturas de pantalla y emite acciones sobre elementos localizados, apoyandose en el grounding visual y el soporte de agentes de la familia Qwen3-VL.
- Asistencia en analisis de video: generacion de resumenes de reuniones grabadas o de material de vigilancia, identificando eventos y objetos a lo largo del tiempo.
- Generacion de codigo a partir de prototipos visuales: conversion de un mockup o de una captura de una aplicacion en esqueleto de componentes HTML o CSS, util en equipos de front-end.
- Soporte en educacion: resolucion guiada de ejercicios que combinan diagramas, graficos y texto, con explicaciones paso a paso.
- Investigacion en privacidad y olvido selectivo: el nombre del checkpoint sugiere su uso como material de referencia en experimentos sobre eliminacion de informacion de identidad; seria su aplicacion mas plausible dado el contexto del repositorio, aunque no hay documentacion que la respalde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Ni la model card del repositorio ni los resultados de busqueda recopilados incluyen cifras de MMLU, HumanEval, GSM8K, MMBench, DocVQA ni de ninguna otra evaluacion, ni para el modelo base en la version 4B ni para este checkpoint concreto.

## Requisitos de hardware

Las cifras de esta seccion son estimaciones de ingenieria derivadas del numero de parametros (aproximadamente 4.000 millones) y no mediciones realizadas sobre este checkpoint. Deben tomarse como orientativas.

- VRAM estimada para inferencia: en FP16, en torno a 8-9 GB solo para pesos, mas el coste de activaciones y del codificador de vision; en cuantizacion de 8 bits, aproximadamente 4-5 GB; en 4 bits, aproximadamente 2,5-3,5 GB, con perdida de calidad asociada.
- GPU recomendadas: para FP16, tarjetas con 16 GB o mas, como RTX 4080, RTX 4090, L4 o A10G; para despliegues con mayor concurrencia, A100 o H100.
- Compatibilidad con GPU de consumo: si, cabe en tarjetas de consumo de gama alta y media-alta en cuantizaciones de 8 y 4 bits. En FP16 requiere al menos 12-16 GB de VRAM.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama soportan la familia Qwen-VL con distintos grados de madurez en el tratamiento de la entrada multimodal; en llama.cpp y Ollama se necesita un archivo de proyector multimodal (mmproj) compatible. Se ha detectado una publicacion de GGUF de 8,40 GB para el modelo base en un repositorio de terceros, aunque no se confirma que corresponda a este checkpoint.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este repositorio.
- Nota de advertencia: al no declararse el formato de pesos, no se puede confirmar que los pesos publicados sean cargables directamente por estas herramientas.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wutt6678/Qwen3-VL-4B-Instruct-IDUnlearn-Bench-Vanilla | ~4B | VLM denso (heredado) | No disponible | cc-by-4.0 | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3-VL-4B-Instruct | ~4B | VLM denso | No disponible en la informacion recopilada | No disponible en la informacion recopilada | HuggingFace, repositorio oficial |
| OpenExplorer/Qwen3-VL-4B-Instruct | ~4B | VLM denso | No disponible | No disponible | HuggingFace, espejo del modelo base |
| Variantes MoE de Qwen3-VL | No disponible | VLM MoE | No disponible | No disponible | HuggingFace, repositorio oficial |

La comparacion con modelos de otras familias (por ejemplo, otros VLM de rango 4B) no puede completarse con la informacion recopilada, ya que no se han proporcionado especificaciones ni resultados de evaluacion de alternativas.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card no describe el proceso de entrenamiento, los datos utilizados ni los cambios introducidos respecto al modelo base. No es posible evaluar que se ha modificado ni con que objetivo.
- Riesgo de degradacion no medida: los procesos de ajuste orientados al olvido selectivo pueden deteriorar capacidades generales del modelo base. Sin evaluaciones publicadas, se desconoce el alcance de esa degradacion.
- Riesgo de alucinacion: inherente a los modelos generativos, y especialmente relevante en tareas de OCR y comprension de documentos, donde el modelo puede inventar texto o cifras ausentes en la imagen.
- Sesgos: no se ha publicado ningun analisis de sesgos para este checkpoint ni se han documentado los del modelo base en la informacion recopilada. Cabe esperar sesgos en la interpretacion de personas, culturas y contextos poco representados.
- Limitaciones de idioma: se desconoce la cobertura linguistica efectiva tras el ajuste. El OCR multilingue del modelo base no garantiza el mismo rendimiento en este checkpoint.
- Licencia: cc-by-4.0 permite uso comercial y obras derivadas siempre que se atribuya la autoria. Es responsabilidad del usuario verificar que los terminos del modelo base Qwen3-VL (cuya licencia original no se detalla en la informacion recopilada) no impongan restricciones adicionales que prevalezcan sobre la licencia declarada en este repositorio.
- Repositorio sin traccion: cero descargas y cero interacciones en el momento de la consulta, sin issues ni discusiones que permitan contrastar experiencias de uso.
- Formato de pesos no declarado: no se puede confirmar la compatibilidad con las herramientas de despliegue habituales hasta inspeccionar los archivos del repositorio.
- Uso en produccion desaconsejado sin evaluacion previa: no hay garantias de que el checkpoint mantenga el comportamiento del modelo base en tareas criticas.

## Enlaces

- Repositorio del checkpoint: https://huggingface.co/wutt6678/Qwen3-VL-4B-Instruct-IDUnlearn-Bench-Vanilla
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Espejo del modelo base: https://huggingface.co/OpenExplorer/Qwen3-VL-4B-Instruct
- Repositorio GitHub de la familia Qwen3-VL: https://github.com/QwenLM/Qwen3-VL
- Ficha en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_vl_4b_instruct
- Version GGUF de terceros: https://local-ai-zone.github.io/models/qwen3-vl-4b-instruct.html
