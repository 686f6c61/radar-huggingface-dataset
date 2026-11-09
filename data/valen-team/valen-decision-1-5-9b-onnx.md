# Valen-Team/Valen-Decision-1.5-9B-ONNX

## Resumen

Valen-Decision-1.5-9B-ONNX es la variante en formato ONNX del modelo Valen-Decision-1.5-9B, desarrollado por Valen-Team. Se trata de un modelo multimodal de tipo image-text-to-text derivado de Qwen/Qwen3.5-9B, especializado no en generacion libre de texto sino en la produccion de decisiones estructuradas y tipadas a partir de entradas de texto, imagen y video. Su proposito es resolver tareas de clasificacion, verificacion de requisitos y deteccion de acciones devolviendo salidas tipadas (probabilidades, elecciones, puntuaciones y cajas) en un unico forward pass, en lugar de generar lenguaje natural.

El modelo se ofrece en varios tamanos (0.8B, 2B, 4B y 9B) y formatos (nativo, ONNX y GGUF); esta ficha corresponde a la version de 9B en ONNX. La model card insiste en la distincion entre tamano, formato y precision: ONNX q8-mlp es una cuantizacion especifica del formato ONNX, y el tamano de fichero no equivale al requisito de RAM. La licencia es Apache 2.0 y el repositorio ocupa 33,6 GB.

Su relevancia actual radica en que propone un paradigma distinto al de los LLM generativos: un modelo de decision que devuelve estructuras verificables, con soporte de dos formatos de API de decision (SystemOne de Jev y Decisions de OpenAI), lo que facilita su integracion en pipelines de automatizacion donde se necesita una salida determinista y tipada en lugar de texto libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Qwen/Qwen3.5-9B (image-text-to-text), con cabecera de decision y codigo personalizado (`trust_remote_code`) |
| Parametros totales | 9B (segun denominacion del modelo); desglose exacto no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX q8-mlp (variante de este repositorio); en el ecosistema Valen existen F32 y Q8_0 para GGUF; Q4/Q5 no superaron los controles de calidad |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (repositorio ONNX); el ecosistema incluye tambien pesos nativos y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer multimodal de tipo image-text-to-text, y anade una capa de decision que transforma la representacion interna en salidas tipadas: predicados con probabilidad, elecciones entre opciones (choices), puntuaciones (scores) y cajas (boxes) para localizacion en imagenes y video. La model card describe que estas salidas se obtienen en un unico forward pass, lo que reduce la latencia frente a enfoques que requieren generacion autoregresiva de la respuesta. El modelo requiere `trust_remote_code=True`, lo que implica que la implementacion depende de codigo publicado por el autor.

En cuanto al entrenamiento, Valen-Team publica el codigo de entrenamiento en GitHub y un dataset de entrenamiento en Hugging Face (`Valen-Team/Valen-Training-General-100k`), lo que permite el ajuste fino para tareas propias. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO. La model card menciona controles de calidad (quality gates) aplicados a las cuantizaciones, con el resultado de que solo F32 y Q8_0 se recomiendan para GGUF, mientras que Q4 y Q5 fallaron dichos controles.

## Capacidades

- Clasificacion de mensajes de cliente y enrutamiento de tickets mediante preguntas tipadas (predicados con probabilidad).
- Verificacion de imagenes contra requisitos definidos por el usuario (por ejemplo, cribado de imagenes de producto).
- Identificacion de acciones en videos y etiquetado de contenido audiovisual.
- Salida estructurada y tipada: probabilidades, elecciones, puntuaciones y cajas de localizacion, en un unico forward pass.
- Soporte de dos formatos de API de decision: SystemOne (Jev) y Decisions (OpenAI), con el mismo modelo.
- Capacidades multimodales de entrada: texto, imagen y video (el soporte directo de video no esta compilado en el paquete GGUF preconstruido 0.1.0; las pruebas historicas de video con compilacion desde fuente no cualifican el paquete preconstruido).
- Ajuste fino posible gracias a la publicacion del codigo y los datos de entrenamiento.
- No se documentan en la informacion disponible capacidades de generacion de texto libre, tool calling generico ni modo de razonamiento extendido.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el mensaje del cliente y una lista de preguntas tipadas (por ejemplo, "es una reclamacion de facturacion") y devuelve la probabilidad de cada categoria, lo que permite dirigir el ticket al equipo adecuado sin generar texto libre.
- Cribado de imagenes de producto: se define un requisito (fondo blanco, producto centrado, ausencia de texto) y el modelo devuelve predicados y cajas que verifican el cumplimiento antes de publicar el anuncio.
- Moderacion y clasificacion de contenido visual: evaluacion de imagenes frente a politicas definidas como predicados, con probabilidades que permiten fijar umbrales de revision humana.
- Etiquetado de video para catalogos: identificacion de acciones o escenas en clips mediante preguntas tipadas, util para generar metadatos de busqueda y recomendacion.
- Automatizacion de control de calidad en pipelines de contenido: integracion del modelo como paso de validacion estructurada entre la ingesta y la publicacion, aprovechando que la salida es verificable y no texto libre.
- Clasificacion offline en aplicaciones Python o JavaScript: mediante los SDK ONNX, el modelo puede ejecutarse sin conexion en entornos de escritorio o edge donde no se dispone de GPU ni de acceso a la API.
- Servicios C++ en CPU: con el runtime personalizado de Valen y pesos GGUF, se puede desplegar como servicio local en Linux sin GPU, segun la guia de versiones de la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma numerica; la model card advierte explicitamente que el tamano de fichero no equivale al requisito de RAM.
- GPU recomendadas: no se especifican modelos concretos; el ejemplo de Python de la model card se ejecuta en una GPU NVIDIA con CUDA y `attn_implementation="sdpa"`.
- Ajuste en GPU de consumo: no disponible; no se confirma que quepa en tarjetas consumer concretas.
- Despliegue: SDK ONNX para Python y JavaScript (aplicaciones offline); pesos nativos con los plugins adecuados o ONNX CUDA en Python para GPU; runtime personalizado de Valen con GGUF para servicios C++ en CPU Linux; SGLang/vLLM se mencionan como backends del ecosistema. No se reclama soporte en llama.cpp u Ollama oficiales sin modificar.
- Latencia y throughput: no disponibles; la model card afirma que no se promete ningun rendimiento no medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Valen-Decision-1.5-9B-ONNX | 9B | no disponible | Decision estructurada multimodal (texto/imagen/video) | Apache 2.0 | Pesos ONNX en HF; API gratuita; codigo y datos publicos |
| Qwen/Qwen3.5-9B (modelo base) | 9B | no disponible | LLM multimodal generativo | no disponible en la informacion | Pesos en HF |
| Otros modelos de clasificacion multimodal | no disponible | no disponible | Clasificacion | no disponible | no disponible |

La comparacion con alternativas de la misma categoria (modelos de decision estructurada multimodales) no esta disponible en la informacion proporcionada. El unico punto de referencia documentado es el modelo base Qwen3.5-9B, del que Valen hereda la arquitectura pero del que difiere en la tarea: generacion de decisiones tipadas frente a generacion de texto.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al derivar de Qwen3.5-9B, podria heredar sesgos del modelo base, pero no se cuantifica.
- Riesgo de alucinacion: no evaluado en la informacion disponible; la salida tipada con probabilidades permite aplicar umbrales, pero no elimina por si misma los errores de clasificacion.
- Idiomas soportados: no disponibles; no se confirma el comportamiento multilingue.
- Longitud de contexto: no disponible; no se puede garantizar el manejo de entradas largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo requiere `trust_remote_code=True`, por lo que conviene auditar el codigo personalizado antes de desplegarlo en produccion.
- El soporte de video no esta compilado en el paquete GGUF preconstruido 0.1.0; las pruebas de video con compilacion desde fuente no cualifican ese paquete.
- Las cuantizaciones GGUF Q4 y Q5 fallaron los controles de calidad; solo se recomiendan F32 y Q8_0.
- No se reclama soporte en llama.cpp u Ollama oficiales sin modificar.
- Las pruebas de validacion P1 se limitan a imagenes fijas sobre el binario preconstruido exacto con 0.8B Q8_0; ese alcance no se extiende a otros tamanos ni variantes.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una validacion comunitaria practicamente nula.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Valen-Team/Valen-Decision-1.5-9B-ONNX
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de codigo y entrenamiento: https://github.com/Valen-Team/Valen
- Dataset de entrenamiento: https://huggingface.co/datasets/Valen-Team/Valen-Training-General-100k
- Demo web y API gratuita: https://valen-team.github.io/
- Cookbook oficial: https://valen-team.github.io/cookbook/
- Guia de eleccion de version: https://valen-team.github.io/docs/valen/choosing/
- Documentacion de inicio rapido: https://valen-team.github.io/docs/valen/quickstart/
- Documentacion de API: https://valen-team.github.io/docs/valen/api/
- Validacion y rendimiento: https://valen-team.github.io/cookbook/validation/
- Tutorial de enrutamiento de tickets: https://valen-team.github.io/cookbook/ticket-routing/
- Tutorial de cribado de imagenes de producto: https://valen-team.github.io/cookbook/product-screening/
- Tutorial de etiquetado de video: https://valen-team.github.io/cookbook/video-tagging/
- Demo en video: https://raw.githubusercontent.com/Valen-Team/Valen/main/assets/demos/valen-decision-1.5-demo.mp4
- API SystemOne (Jev): https://docs.typesafe.ai/api/system-one
- API Decisions (OpenAI): https://developers.openai.com/api/docs/guides/decisions
