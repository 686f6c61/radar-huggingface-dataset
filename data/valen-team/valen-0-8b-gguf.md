# Valen-Team/Valen-0.8B-GGUF

## Resumen

Valen-0.8B-GGUF es la distribucion en formato GGUF del modelo Valen-0.8B, desarrollado por Valen-Team. No es un modelo generativo de proposito general al uso: se trata de un modelo de decision ("decision model") que, en lugar de producir texto libre, puntua respuestas candidatas definidas por el usuario y devuelve categorias, probabilidades si/no y scores estructurados. Esta orientado a tareas como enrutado de tickets, cribado de imagenes y etiquetado de video, con soporte multimodal (texto, imagen y video) declarado por el autor.

El modelo base cuenta con 753.712.745 parametros (aproximadamente 0,8B) y se distribuye bajo licencia Apache 2.0, con soporte declarado de ingles y chino. La variante GGUF esta pensada para ejecutarse mediante un runtime propio en C++ sobre Linux x86-64, sin necesidad de servicios de inferencia en Python, PyTorch u ONNX. El autor advierte que solo las precisiones F32 y Q8_0 han superado sus controles de calidad, y que las cuantizaciones Q4 y Q5 fallaron dichos controles.

La relevancia actual del modelo radica en su enfoque: en vez de competir en generacion de texto general, se posiciona como un componente ligero y determinista para tomar decisiones dentro de pipelines. El propio autor recomienda la version mas reciente Valen-Decision-1.5 para nuevos desarrollos, por lo que esta ficha describe la version 0.8B original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de decision con backbone Valen y cabeza de decision; no se detalla la arquitectura interna) |
| Parametros totales | 753.712.745 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F32 y Q8_0 (recomendadas); Q4 y Q5 fallaron los controles de calidad del autor |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tambien existen variantes nativas y ONNX del modelo base) |

## Arquitectura y entrenamiento

El autor no detalla la arquitectura interna del modelo en la informacion disponible. La model card indica que el servicio utiliza "the trained Valen backbone and decision head", es decir, un backbone entrenado junto con una cabeza de decision especifica. No se especifica si el backbone es un transformer denso, hibrido u otra variante, ni se documentan el numero de tokens de entrenamiento, la composicion del dataset o si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica destacable es el planteamiento de inferencia: el modelo no genera respuestas libres, sino que puntua un conjunto de respuestas candidatas proporcionadas por el usuario y devuelve resultados estructurados por HTTP. El runtime GGUF es una implementacion propia en C++ (no se apoya en llama.cpp oficial ni en Ollama sin modificaciones), dirigida a Linux x86-64 con Ubuntu 22.04+, glibc 2.35+ y extensiones AVX2/FMA/F16C/BMI2. El paquete precompilado 0.1.0 solo esta validado con una peticion de texto real usando 0.8B Q8_0 en cache, sin garantias declaradas para imagen, video, GPU u otras plataformas.

## Capacidades

- Decision estructurada: devuelve categorias, probabilidades si/no y scores para respuestas candidatas definidas por el usuario.
- Clasificacion y enrutado: enrutado de tickets y otras tareas de asignacion de categorias.
- Cribado de imagenes: evaluacion de imagenes fijas segun criterios definidos por el usuario.
- Etiquetado de video: soporte de video declarado en el modelo base y en la ruta multimodal medida; el paquete GGUF precompilado 0.1.0 no compila soporte directo de video.
- Multimodalidad: texto, imagen y video (con las salvedades de formato y validacion indicadas por el autor).
- Salida estructurada: resultados devueltos en formato estructurado a traves de HTTP.
- Multilingue: ingles y chino.
- No se documenta soporte de tool calling, function calling, agentes o modo de razonamiento extendido en la informacion disponible.

## Casos de uso

- Enrutado de tickets de soporte: el modelo recibe el texto del ticket y una lista de categorias candidatas, y devuelve la categoria mas probable con su score. Es adecuado por su tamano reducido y su salida estructurada, que facilita la integracion en un sistema de gestion de incidencias.
- Cribado de imagenes de producto: se envian imagenes y criterios de admision (por ejemplo, si la imagen cumple una politica de catalogo) y el modelo devuelve probabilidades si/no. El autor mantiene un tutorial especifico de product screening en su Cookbook.
- Etiquetado de video: asignacion de etiquetas a fragmentos de video mediante la ruta multimodal del modelo base; requiere compilacion desde fuente del runtime, ya que el paquete GGUF precompilado no incluye soporte directo de video.
- Servicio de decision local en C++: despliegue de un servicio HTTP de decision en Linux x86-64 sin dependencias de Python, PyTorch u ONNX, util en entornos con restricciones de dependencias o de contenedores.
- Prototipado rapido de clasificadores: dado que el usuario define las respuestas candidatas, se pueden evaluar clasificaciones personalizadas sin reentrenar el modelo, usando la API gratuita o el runtime local.
- Filtrado y moderacion de contenido: puntuacion si/no sobre textos o imagenes para decidir si un contenido cumple una politica, con umbrales de incertidumbre configurables.
- Automatizacion de decisiones en juegos o entornos simulados: el autor publica una demo de decisiones en Sokoban, lo que sugiere uso en entornos con estado discreto y acciones candidatas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona controles de calidad internos (las cuantizaciones Q4 y Q5 fallaron) y una validacion de alcance limitado del paquete precompilado, pero no incluye cifras de MMLU, HumanEval, GSM8K ni metricas comparables. Tampoco se publican cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El autor indica explicitamente que el tamano de fichero no equivale al requisito de RAM y no promete rendimiento no medido.
- Tamano del fichero Q8 del modelo 0.8B: 0.761 GiB; fichero de vision opcional: 0.375 GiB. El repositorio completo ocupa 7.7 GB.
- CPU: Linux x86-64, Ubuntu 22.04+, glibc 2.35+, con AVX2/FMA/F16C/BMI2. El runtime precompilado 0.1.0 esta validado solo en CPU para texto.
- GPU: el autor menciona despliegue en GPU mediante pesos nativos con los plugins adecuados o Python ONNX CUDA, pero no publica requisitos de VRAM ni GPUs recomendadas.
- Despliegue: runtime propio Valen en C++ (GGUF), SDK ONNX para Python/JavaScript, y backend SGLang/vLLM mencionado para GPU. No se declara soporte en llama.cpp oficial sin modificaciones ni en Ollama oficial.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de la misma categoria (modelos de decision con salida estructurada) en la informacion proporcionada. Como referencia interna de la propia familia, el autor ofrece variantes de mayor tamano:

| Modelo | Parametros | Fichero Q8 | Fichero de vision | Licencia |
|---|---|---|---|---|
| Valen-0.8B-GGUF | 753.712.745 | 0.761 GiB | 0.375 GiB | Apache 2.0 |
| Valen-2B-GGUF | no disponible | 1.880 GiB | 1.235 GiB | no disponible |
| Valen-4B-GGUF | no disponible | 4.181 GiB | 1.242 GiB | no disponible |

La comparacion con alternativas externas (parametros, contexto, rendimiento, licencia y disponibilidad) no esta disponible.

## Limitaciones y advertencias

- El autor recomienda la version Valen-Decision-1.5 para nuevos desarrollos; esta version 0.8B queda como referencia historica.
- Solo F32 y Q8_0 han superado los controles de calidad; Q4 y Q5 no se recomiendan.
- El paquete GGUF precompilado 0.1.0 solo esta validado con una peticion de texto real en CPU con 0.8B Q8_0; no hay garantias declaradas para imagen, video, GPU u otras plataformas.
- El paquete precompilado no compila soporte directo de video; las pruebas historicas de video con compilacion desde fuente no cualifican el paquete precompilado.
- No se declara soporte en llama.cpp oficial sin modificaciones ni en Ollama oficial; el despliegue requiere el runtime propio del autor.
- Idiomas limitados a ingles y chino; no se documenta soporte de castellano.
- No se publican datos sobre sesgos, tasas de alucinacion o robustez fuera de los dominios de validacion del autor.
- No se documentan la longitud de contexto ni los datos de entrenamiento, lo que dificulta evaluar el comportamiento en entradas largas.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las notas de licencia de medios y procedencia que el autor menciona en su Cookbook.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/Valen-Team/Valen-0.8B-GGUF
- Modelo base nativo: https://huggingface.co/Valen-Team/Valen-0.8B
- Variante ONNX: https://huggingface.co/Valen-Team/Valen-0.8B-ONNX
- Version recomendada Valen-Decision-1.5-0.8B-GGUF: https://huggingface.co/Valen-Team/Valen-Decision-1.5-0.8B-GGUF
- Repositorio GitHub: https://github.com/Valen-Team/Valen
- API gratuita y demo web: https://valen-team.github.io/
- Cookbook oficial: https://valen-team.github.io/cookbook/
- Guia de seleccion de version: https://valen-team.github.io/docs/valen/choosing/
- Documentacion del runtime GGUF: https://valen-team.github.io/docs/valen/gguf/
- Validacion y rendimiento: https://valen-team.github.io/cookbook/validation/
- Release del runtime CPU 0.1.0: https://github.com/Valen-Team/Valen/releases/tag/gguf-runtime-v0.1.0
- Tutorial de enrutado de tickets: https://valen-team.github.io/cookbook/ticket-routing/
- Tutorial de cribado de imagenes de producto: https://valen-team.github.io/cookbook/product-screening/
- Tutorial de etiquetado de video: https://valen-team.github.io/cookbook/video-tagging/
