# UrNinja/evf-sam2

## Resumen

EVF-SAM2 es un modelo de segmentación de imágenes y vídeo guiado por texto en lenguaje natural, es decir, recibe una imagen (o un vídeo) y una frase como "el perro que está a la izquierda" y devuelve la máscara del objeto referido. No es un modelo de lenguaje: no genera texto, sino máscaras de segmentación. El checkpoint publicado bajo el identificador `UrNinja/evf-sam2` ocupa 3,1 GB en formato safetensors y contiene 898.444.850 parámetros (~0,9 B).

El modelo procede del proyecto EVF-SAM, desarrollado por el grupo hustvl (Universidad de Ciencia y Tecnología de Huazhong) y descrito en el paper "EVF-SAM: Early Vision-Language Fusion for Text-Prompted Segment Anything Model" (arXiv:2406.20076). La propuesta técnica consiste en fusionar de forma temprana las representaciones de visión y lenguaje y alimentar con ellas el decodificador de máscaras de un modelo tipo SAM (Segment Anything Model), evitando así los pipelines en dos etapas (detector de cajas + SAM) habituales hasta ese momento.

La relevancia práctica del checkpoint es limitada por su estado de publicación: se trata de un repositorio de pesos que, según su propia model card, actúa únicamente como "checkpoint holder" del proyecto original, con cero descargas y cero likes en el momento de la consulta, y sin soporte para `AutoModel.from_pretrained(...)`. Su licencia es Apache-2.0 y la evaluación real requiere clonar el repositorio de código fuente oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de segmentacion promptable tipo SAM con fusion temprana vision-lenguaje (EVF); el backbone concreto del codificador visual y del codificador de lenguaje no se detalla en la model card |
| Parametros totales | 898.444.850 (~0,90 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la ficha no declara ventana de contexto; el limite practico lo fija el numero de tokens de texto y la resolucion de imagen admitida por el codificador visual) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (el autor no declara lista de idiomas; los ejemplos del repositorio oficial usan prompts en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 3,1 GB |
| Tarea declarada | Segmentacion de imagen y video guiada por texto (no hay pipeline declarado en HuggingFace) |
| Soporte de carga estandar | No soporta `AutoModel.from_pretrained(...)`; requiere importar el script del codigo fuente |

## Arquitectura y entrenamiento

La informacion disponible no permite detallar la arquitectura interna mas alla de lo que indica el titulo del paper y el repositorio oficial: se trata de un esquema de fusion temprana entre representaciones visuales y textuales que alimenta un decodificador de mascaras del tipo empleado por SAM. El objetivo declarado es sustituir los pipelines en cascada (primero detectar cajas con un detector de deteccion abierta, despues segmentar con SAM) por un unico modelo que recibe el texto como prompt y produce la mascara directamente. El numero total de parametros (898.444.850) es coherente con un codificador visual tipo ViT de tamano medio mas un decodificador de mascaras y un codificador de lenguaje, pero el desglose por componente no esta publicado en la model card.

No hay datos en la informacion proporcionada sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO, el regimen de ajuste (congelado parcial, LoRA, fine-tuning completo) ni innovaciones adicionales como decodificacion especulativa o atencion lineal. Tampoco se documenta la variante EVF-SAM2 frente a la version original EVF-SAM (diferencias de entrenamiento, datos o refinamiento de mascara). Toda esta informacion debe consultarse en el paper y en el repositorio de GitHub del proyecto.

## Capacidades

- Segmentacion guiada por texto: genera la mascara del objeto o region descrita en un prompt de lenguaje natural, sin necesidad de puntos, cajas ni mascaras de entrada.
- Segmentacion de imagen: procesa una imagen estatica y devuelve la mascara binaria del objeto referido.
- Segmentacion de video: el repositorio oficial incluye `inference_video.py`, lo que indica soporte para propagar o segmentar objetos a lo largo de fotogramas, presumiblemente con seguimiento entre frames (el detalle del mecanismo no esta documentado en la model card).
- Referencia espacial y de atributos: al ser un modelo de segmentacion referida, trabaja con descripciones de posicion relativa y atributos ("el coche rojo de la derecha"), en la medida en que el codificador de lenguaje lo permita.
- Salida de mascaras: la salida es una o varias mascaras de segmentacion, no texto. No hay generacion de lenguaje, resumen de imagen, respuesta a preguntas visuales ni descripcion de escenas.
- Tool calling / function calling: no disponible. No es una capacidad de este tipo de modelo.
- Soporte de agentes y razonamiento multi-paso: no disponible. No se documenta ninguna interfaz de agente, planificacion ni bucle ReAct.
- Capacidades multilingues: no disponible. El autor no declara idiomas soportados y los ejemplos del repositorio estan en ingles.
- Capacidad especial de tipo "thinking mode", vision-language chat o audio: no disponible.

## Casos de uso

- Pre-anotacion de datasets de segmentacion: dado un conjunto de imágenes y una lista de etiquetas en lenguaje natural, el modelo genera mascaras candidatas que despues revisa un anotador humano. Es adecuado porque elimina el paso intermedio de dibujar cajas y reduce el coste por imagen en proyectos de etiquetado a gran escala.
- Edicion de imagen y retoque fotografico: aislar un sujeto descrito por texto ("la persona del sombrero") para cambiar el fondo o aplicar ajustes locales. El prompt textual evita la seleccion manual de puntos y permite flujos de trabajo mas rapidos en herramientas de diseno.
- Recorte y composicion automatica en generacion de contenidos: separar sujetos de imagenes de catalogo para generar composiciones de producto sobre fondos neutros, usando prompts del tipo "la camiseta" o "el bolso de la izquierda".
- Analisis de video para vigilancia o inspeccion: segmentar un objeto concreto a lo largo de un video (por ejemplo, un vehiculo o una pieza en una linea de produccion) gracias al script `inference_video.py`, lo que permite medir su presencia, posicion o permanencia en escena sin un detector entrenado especificamente.
- Robótica e interaccion con instrucciones en lenguaje natural: obtener la mascara del objeto referido por una instruccion hablada transcrita a texto, para alimentar modulos de agarre o manipulacion que necesitan la region exacta del objeto en la imagen de la camara.
- Inspeccion industrial y control de calidad: segmentar componentes descritos por su nombre o posicion relativa en imagenes de linea de montaje para calcular area, contorno o defectos geometricos respecto a una plantilla.
- Accesibilidad: aislar y ampliar el objeto mencionado en un comando de voz (por ejemplo, "acerca la señal de la derecha") en aplicaciones de asistencia visual, siempre que el prompt llegue ya transcrito a texto.
- Generacion de datos sinteticos y aumentacion: producir mascaras de objetos para entrenar otros modelos de segmentacion o de edicion generativa, usando el modelo como anotador automatico sobre un corpus no etiquetado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio `UrNinja/evf-sam2` no incluye ninguna tabla de resultados, y los resultados de busqueda web obtenidos no contienen informacion tecnica sobre el modelo. Las cifras oficiales de evaluacion (por ejemplo, sobre conjuntos de segmentacion referida) deben consultarse en el paper arXiv:2406.20076 y en el repositorio oficial hustvl/EVF-SAM, no en este checkpoint.

| Benchmark | Resultado |
|---|---|
| MMLU, HumanEval, GSM8K | No aplica (el modelo no es un LLM) |
| Benchmarks de segmentacion referida (RefCOCO, RefCOCO+, RefCOCOg y similares) | no disponible en la informacion proporcionada |

## Requisitos de hardware

- Huella de pesos: ~898 M de parametros equivalen a unos 1,8 GB en FP16/BF16 y unos 3,6 GB en FP32. El repositorio ocupa 3,1 GB, lo que sugiere pesos almacenados en precision mixta o FP32 con otros artefactos incluidos.
- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de ~0,9 B requiere del orden de 2 a 4 GB de VRAM en FP16 con lotes pequenos, a lo que hay que sumar el pico de memoria de activaciones del codificador visual, que en los esquemas tipo SAM procesan imagenes a resolucion alta y suelen dominar el consumo total.
- GPU recomendadas: cualquier GPU con 8-12 GB de VRAM o mas permite ejecutar el modelo con comodidad en imagen estatica (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090, L4, A10G). Para procesamiento de video o lotes grandes conviene una GPU de 24 GB o superior (RTX 3090/4090, A100, H100).
- Cabe en GPU de consumo: si, el checkpoint en si ocupa menos de 4 GB, por lo que cabe en practicamente cualquier GPU de consumo moderna con 8 GB o mas. El factor limitante no es el tamano de los pesos sino la resolucion de entrada y el numero de fotogramas simultaneos.
- Opciones de despliegue: no hay soporte para `AutoModel.from_pretrained(...)` ni para servidores genericos de inferencia. No aplica vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje). El uso documentado es clonar el repositorio `hustvl/EVF-SAM` y ejecutar `inference.py` o `inference_video.py`. No se documenta exportacion a ONNX, TensorRT ni despliegue como endpoint gestionado.
- Latencia y throughput: no disponible. No se publican mediciones de latencia por imagen, fotogramas por segundo ni throughput por GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Prompt de texto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EVF-SAM2 (este checkpoint) | 898 M | Si | Fusion temprana vision-lenguaje + decodificador tipo SAM | Apache-2.0 | safetensors en HuggingFace; requiere el codigo fuente del proyecto |
| SAM (Meta AI) | 636 M (ViT-H), 91 M (ViT-B) | No (puntos, cajas o mascaras) | Segmentacion promptable clasica, sin lenguaje | Apache-2.0 | Pesos y codigo publicos |
| Grounded-SAM | no disponible (combina un detector de deteccion abierta con SAM) | Si, mediante el detector | Pipeline en dos etapas: detectar cajas y segmentar | no disponible | Codigo publico |
| LISA | 7 B (variante basada en un LLM multimodal de 7 B) | Si | LLM multimodal acoplado a SAM, con razonamiento | no disponible | Pesos publicos |

Los datos de los modelos comparados proceden de su documentacion publica y no de una evaluacion propia. No se dispone de comparaciones directas, con las mismas metricas y los mismos conjuntos de datos, entre este checkpoint y las alternativas listadas, por lo que no es posible afirmar cual rinde mejor.

## Limitaciones y advertencias

- Repositorio de terceros: el identificador `UrNinja/evf-sam2` no pertenece a la organizacion oficial del proyecto (hustvl) y su propia model card lo describe como un "checkpoint holder". Presenta 0 descargas y 0 likes, con fecha de creacion registrada el 11 de octubre de 2026, datos atipicos que conviene verificar antes de usarlo en produccion.
- Sin carga estandar: no funciona con `AutoModel.from_pretrained(...)`. Cualquier integracion requiere importar el script desde el codigo fuente, lo que complica el versionado y el despliegue.
- RAM y CPU necesarias para ejecutar codigo de terceros: el flujo de inferencia depende de dependencias del repositorio oficial, no de una libreria estandar, por lo que la reproducibilidad a largo plazo no esta garantizada.
- Riesgo de mascara incorrecta: en prompts ambiguos, objetos ausentes o escenas con varios objetos similares, un modelo de segmentacion referida puede devolver una mascara forzada sobre una region que no corresponde, en lugar de indicar que el objeto no existe. Este es el equivalente visual del falso positivo y debe gestionarse con umbrales de confianza y revision humana.
- Sesgos de dominio: no se documenta la composicion del dataset de entrenamiento, por lo que no es posible evaluar sesgos por tipo de escena, geografia, demografia de las personas representadas o iluminacion. El rendimiento puede degradarse fuera del dominio de entrenamiento.
- Idioma: no hay lista de idiomas soportados. Si el codificador de lenguaje subyacente esta mayoritariamente entrenado en ingles, los prompts en castellano pueden degradar la precision de la segmentacion.
- Ausencia de benchmarks reproducibles en este repositorio: cualquier afirmacion de rendimiento debe verificarse directamente sobre el paper y evaluarse en el dominio propio antes de tomar decisiones de produccion.
- Licencia: Apache-2.0 en este checkpoint, lo que permite uso comercial de los pesos. No obstante, los componentes base (codificador visual tipo SAM y posible codificador de lenguaje) pueden estar sujetos a sus propias licencias, y el codigo del repositorio oficial puede tener condiciones adicionales.
- Ambito de uso: no es un modelo de lenguaje. No genera texto, no mantiene conversaciones, no soporta tool calling ni agentes, y no debe presentarse como un asistente multimodal.
- Video: el soporte de video se limita a lo que implementa `inference_video.py`; no se documentan tasas de fotogramas alcanzables, manejo de oclusiones ni persistencia de identidad del objeto a largo plazo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/UrNinja/evf-sam2
- Paper (enlace desde HuggingFace Papers): https://huggingface.co/papers/2406.20076
- Paper en arXiv: https://arxiv.org/abs/2406.20076
- Repositorio oficial de codigo: https://github.com/hustvl/EVF-SAM
- Nota sobre la busqueda web: los resultados de la busqueda realizada no contienen ningun enlace relevante al modelo (devolvieron exclusivamente contenido no relacionado con inteligencia artificial). Los unicos enlaces verificables son los de la model card y el repositorio oficial indicados arriba.
