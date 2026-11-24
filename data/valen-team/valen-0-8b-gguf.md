# Valen-Team/Valen-0.8B-GGUF

## Resumen

Valen-0.8B-GGUF es la distribucion en formato GGUF del modelo multimodal Valen-0.8B, desarrollado por Valen-Team. Se trata de un modelo especializado en toma de decisiones estructuradas sobre texto, imagenes y video: en lugar de generar texto libre, recibe un conjunto de respuestas candidatas definidas por el usuario y devuelve categorias, probabilidades si/no y puntuaciones para cada candidata. Esto lo orienta a tareas como enrutamiento de tickets, cribado de imagenes de producto o etiquetado de video.

El modelo cuenta con 753.712.745 parametros (aproximadamente 0,75B) y se distribuye bajo licencia Apache 2.0. La version GGUF esta pensada para ejecutarse en un servicio de decision local en C++ sobre Linux x86-64, sin necesidad de Python, PyTorch ni ONNX Runtime en la ruta de inferencia. El runtime propietario de Valen carga el backbone y la cabeza de decision entrenados y expone resultados estructurados por HTTP.

La relevancia de esta ficha radica en que Valen-0.8B-GGUF no es un modelo generativo al uso: su salida es una puntuacion sobre candidatas predefinidas, lo que simplifica la integracion en pipelines deterministas. La model card advierte que solo las variantes F32 y Q8_0 han superado las puertas de calidad, y que las cuantizaciones Q4 y Q5 fallaron dichos controles. Existe una version mas reciente, Valen-Decision-1.5-0.8B-GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone Valen con cabeza de decision (modelo multimodal image-text-to-text); detalles internos no disponibles |
| Parametros totales | 753.712.745 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F32 y Q8_0 (cualificadas); Q4 y Q5 fallaron las puertas de calidad |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tambien existen variantes native y ONNX del modelo base) |

## Arquitectura y entrenamiento

La informacion disponible indica que Valen-0.8B combina un backbone entrenado con una cabeza de decision especifica, orientada a puntuar respuestas candidatas en lugar de generar texto autoregresivo. El pipeline declarado es image-text-to-text, lo que confirma entrada multimodal (texto e imagen) y salida estructurada. No se detalla en la informacion proporcionada si el backbone es un transformer denso, MoE o hibrido, ni el numero de tokens de entrenamiento, la composicion del dataset o si se aplicaron RLHF/DPO.

La innovacion destacable no reside tanto en la arquitectura como en el modo de inferencia: el usuario define las candidatas y el modelo devuelve directamente categorias, probabilidades y scores, evitando la generacion libre y reduciendo la necesidad de postprocesado. La distribucion GGUF esta disenada para un runtime C++ propietario (Valen CPU runtime 0.1.0) sobre Linux x86-64 con Ubuntu 22.04+, glibc 2.35+ y requisitos de CPU AVX2/FMA/F16C/BMI2. La model card aclara que el paquete precompilado 0.1.0 no compila soporte directo de video y que las pruebas historicas de video con compilacion desde fuente no cualifican el paquete precompilado; la validacion P1 cubre imagenes fijas y solo el binario precompilado exacto con 0.8B Q8_0.

## Capacidades

- Decisiones estructuradas sobre texto: clasificacion en categorias definidas por el usuario con probabilidades y scores.
- Decisiones sobre imagen: cribado y clasificacion de imagenes fijas (pipeline image-text-to-text).
- Decisiones sobre video: soportado historicamente mediante compilacion desde fuente; el paquete GGUF precompilado 0.1.0 no compila soporte directo de video.
- Salida si/no con probabilidades, util para filtros binarios y politicas de incertidumbre.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad generativa; el modelo esta orientado a puntuar candidatas, no a planificar.
- Capacidades multilingues: limitadas a ingles (en) y chino (zh).
- Capacidad especial: servicio de decision local en C++ con exposicion de resultados estructurados por HTTP, sin Python, PyTorch ni ONNX en la ruta de inferencia.

## Casos de uso

- Enrutamiento de tickets de soporte: se definen las categorias de destino como candidatas y el modelo devuelve la probabilidad de cada una, permitiendo derivar automaticamente el ticket al equipo adecuado con una politica de umbral de incertidumbre.
- Cribado de imagenes de producto: se envian imagenes fijas y candidatas como "apta", "defectuosa" o "revisar", y el modelo puntua cada etiqueta para filtrar el catalogo antes de la revision humana.
- Etiquetado de video: en despliegues compilados desde fuente con soporte de video, se puntuan etiquetas candidatas sobre fotogramas para clasificar contenido audiovisual; no aplicable al paquete GGUF precompilado 0.1.0.
- Filtro de moderacion binaria: se plantea una candidata si/no por cada politica y se aplica un umbral sobre la probabilidad devuelta, aprovechando la salida estructurada y determinista.
- Servicio de decision embebido en C++: integracion en un servicio Linux x86-64 existente mediante el runtime Valen CPU 0.1.0, con llamadas HTTP y sin dependencia de Python en produccion.
- Prototipado rapido de clasificadores: uso del modelo 0.8B como primera linea base antes de evaluar las variantes 2B o 4B sobre las tareas propias, segun la guia de seleccion de la model card.
- Validacion de pipelines de decision: comparacion de scores entre candidatas para auditar la calibracion de umbrales antes de desplegar la logica de negocio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni metricas equivalentes, y declara explicitamente que no se promete rendimiento no medido. Los tamamos de fichero Q8 indicados para 0.8B son 0.761 GiB (modelo) y 0.375 GiB (fichero de vision opcional para texto).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; la model card advierte que el tamano de fichero no equivale al requisito de RAM.
- GPU recomendadas: no disponible para la ruta GGUF; la model card indica que el despliegue en GPU corresponde a los pesos native con plugins apropiados o a ONNX CUDA en Python.
- Cabe en GPU consumer: no disponible como dato medido.
- CPU objetivo del runtime precompilado: Linux x86-64, Ubuntu 22.04+, glibc 2.35+, con AVX2/FMA/F16C/BMI2.
- Opciones de despliegue: runtime Valen CPU 0.1.0 (C++ local), ONNX SDK para Python/JavaScript offline, pesos native para GPU y fine-tuning, y SGLang/vLLM citados como backends para despliegue GPU. No se reclama soporte en llama.cpp ni Ollama oficiales sin modificar.
- Latencia y throughput: no disponible; no se promete rendimiento no medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Valen-0.8B-GGUF | 753.712.745 | no disponible | Decision multimodal estructurada | Apache 2.0 | GGUF, native, ONNX |
| Valen-2B-GGUF | no disponible | no disponible | Decision multimodal estructurada | Apache 2.0 (segun familia) | GGUF |
| Valen-4B-GGUF | no disponible | no disponible | Decision multimodal estructurada | Apache 2.0 (segun familia) | GGUF |
| Valen-Decision-1.5-0.8B-GGUF | no disponible | no disponible | Version mas reciente de la familia | no disponible | GGUF |

Las alternativas comparables dentro de la informacion proporcionada son las otras variantes de la propia familia Valen. No se dispone de datos de benchmarks ni de modelos de terceros comparables en la informacion disponible.

## Limitaciones y advertencias

- Solo F32 y Q8_0 han superado las puertas de calidad; Q4 y Q5 fallaron y no se recomiendan.
- El paquete GGUF precompilado 0.1.0 no compila soporte directo de video; las pruebas de video con compilacion desde fuente no cualifican dicho paquete.
- La validacion del binario precompilado cubre unicamente una peticion de texto real con 0.8B Q8_0 en cache; no se extiende a imagen, video, GPU ni otras plataformas.
- No se reclama soporte en llama.cpp ni Ollama oficiales sin modificar; el runtime es propietario.
- Idiomas limitados a ingles y chino; no se declara cobertura de castellano.
- El modelo no es generativo de texto libre: solo puntua candidatas definidas por el usuario, lo que limita su uso en tareas abiertas.
- Riesgo de alucinacion y sesgos: no se documentan en la informacion disponible; al tratarse de un clasificador, el riesgo principal es la calibracion incorrecta de probabilidades y umbrales.
- Licencia Apache 2.0 permite uso comercial, pero las notas de licencia de medios y procedencia se remiten a la documentacion del Cookbook.
- El tamano de fichero no debe interpretarse como requisito de RAM; no se promete rendimiento no medido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Valen-Team/Valen-0.8B-GGUF
- Modelo base native: https://huggingface.co/Valen-Team/Valen-0.8B
- Variante ONNX: https://huggingface.co/Valen-Team/Valen-0.8B-ONNX
- Repositorio GitHub: https://github.com/Valen-Team/Valen
- Version mas reciente: https://huggingface.co/Valen-Team/Valen-Decision-1.5-0.8B-GGUF
- API gratuita y demo web: https://valen-team.github.io/
- Cookbook: https://valen-team.github.io/cookbook/
- Inicio rapido de API: https://valen-team.github.io/cookbook/api-quickstart/
- Inferencia local: https://valen-team.github.io/cookbook/local-inference/
- Enrutamiento de tickets: https://valen-team.github.io/cookbook/ticket-routing/
- Cribado de imagenes de producto: https://valen-team.github.io/cookbook/product-screening/
- Etiquetado de video: https://valen-team.github.io/cookbook/video-tagging/
- Alcance de validacion y rendimiento: https://valen-team.github.io/cookbook/validation/
- Guia de seleccion de version: https://valen-team.github.io/docs/valen/choosing/
- Documentacion GGUF: https://valen-team.github.io/docs/valen/gguf/
- Runtime CPU 0.1.0: https://github.com/Valen-Team/Valen/releases/tag/gguf-runtime-v0.1.0
