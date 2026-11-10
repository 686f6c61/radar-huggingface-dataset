# Valen-Team/Valen-4B-GGUF

## Resumen

Valen-4B-GGUF es la distribucion en formato GGUF del modelo Valen-4B, desarrollado por Valen-Team. No es un modelo generativo al uso: se trata de un modelo de decision multimodal que, en lugar de producir texto libre, puntua un conjunto de respuestas candidatas definidas por el usuario y devuelve categorias, probabilidades si/no y puntuaciones estructuradas. Esta orientado a tareas como el enrutado de tickets, el cribado de imagenes y el etiquetado de video, y se sirve mediante un runtime C++ propio que no requiere Python, PyTorch ni ONNX en produccion.

El modelo cuenta con 4.207.467.305 parametros y se distribuye bajo licencia Apache 2.0. La variante GGUF esta pensada para ejecutar un servicio de decision local sobre Linux x86-64 con un fichero Q8 de aproximadamente 4.181 GiB (mas 1.242 GiB opcionales para el modulo de vision). Soporta texto, imagen y video, con enfasis en salidas estructuradas y compatibilidad con endpoints.

Su relevancia actual radica en que propone un paradigma distinto al de los LLM generativos: en lugar de pedir al modelo que "escriba" la respuesta, se le presentan opciones cerradas y el modelo las puntua, lo que facilita la integracion en pipelines deterministas y reduce la ambiguedad de la salida. La model card advierte de que la version prebuilt 0.1.0 solo esta cualificada para texto con 0.8B Q8_0, y que el soporte de video directo no esta compilado en ese paquete.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone transformer con cabeza de decision (decision head); multimodal (texto, imagen, video); runtime C++ propio |
| Parametros totales | 4.207.467.305 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F32 y Q8_0 cualificados; Q4/Q5 no superaron los controles de calidad |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tambien existe nativo y ONNX en repos separados) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que se trata de un backbone transformer (denominado "Valen backbone") acoplado a una "decision head" entrenada. El modelo es multimodal: procesa texto, imagen y video, y en lugar de generar tokens de respuesta produce puntuaciones sobre un conjunto de candidatos que define el usuario. El paquete GGUF incluye el backbone y la cabeza de decision entrenados, servidos a traves de un runtime C++ propio sobre llama.cpp/Ollama modificado, sin dependencia de Python, PyTorch ni ONNX.

No se han publicado en la informacion disponible datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. Tampoco se detalla ninguna innovacion de atencion o decodificacion especulativa. La model card menciona que existe una version posterior, Valen-Decision-1.5, publicada como Valen-Decision-1.5-4B-GGUF, lo que sugiere una iteracion del modelo base.

## Capacidades

- Decision multimodal: clasificacion de texto, imagenes y video mediante puntuacion de candidatos definidos por el usuario.
- Salidas estructuradas: devuelve categorias, probabilidades si/no y puntuaciones directamente, sin generacion de texto libre.
- Enrutado de tickets: asignacion de categorias a tickets de soporte.
- Cribado de imagenes: evaluacion de imagenes de producto u otro material visual.
- Etiquetado de video: asignacion de etiquetas a contenido de video (con las limitaciones de la version prebuilt indicadas mas abajo).
- Servicio HTTP local: exposicion de resultados estructurados sobre HTTP mediante el runtime C++.
- Soporte multilingue limitado a ingles y chino.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documenta soporte de tool calling ni de razonamiento multi-paso en el sentido de los LLM generativos; el paradigma es de puntuacion de candidatos.

## Casos de uso

- Enrutado de tickets de soporte: el modelo recibe el texto del ticket y una lista de categorias candidatas, y devuelve la categoria mas probable con su puntuacion; encaja en sistemas de triaje automatizado que requieren salidas deterministas y auditables.
- Cribado de imagenes de producto: se presentan imagenes junto con etiquetas candidatas (por ejemplo, "apto" / "no apto") y el modelo devuelve probabilidades, util para moderacion o control de calidad en catalogos.
- Etiquetado de video: asignacion de etiquetas a clips mediante puntuacion de candidatos; requiere tener en cuenta que el paquete prebuilt 0.1.0 no compila soporte directo de video y que las pruebas historicas de video con compilacion desde fuente no cualifican el paquete prebuilt.
- Servicio de decision local en C++: despliegue de un microservicio Linux x86-64 que expone decisiones por HTTP sin Python ni PyTorch, adecuado para entornos con restricciones de dependencias o de seguridad.
- Clasificacion binaria si/no: cualquier flujo que requiera una decision binaria con probabilidad asociada, como la validacion de contenido o la aprobacion de solicitudes.
- Prototipado rapido mediante API gratuita: la model card ofrece una API HTTP gratuita y una demo web para evaluar el modelo sin descargar pesos, util para validar el encaje antes de invertir en despliegue local.
- Evaluacion comparativa de tamanos: el ecosistema incluye variantes de 0.8B, 2B y 4B, lo que permite escalar el tamano segun el presupuesto de memoria y los requisitos de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye metricas de MMLU, HumanEval, GSM8K ni similares, y tampoco ofrece cifras de latencia o throughput. Solo se indican tamanos de descarga (4.181 GiB para Q8 y 1.242 GiB para el fichero de vision opcional), que no equivalen a requisitos de RAM en ejecucion.

## Requisitos de hardware

- VRAM/RAM estimada: no disponible de forma explicita. El fichero Q8 del modelo 4B ocupa 4.181 GiB en descarga y el fichero de vision opcional 1.242 GiB; la model card advierte que el tamano de fichero no es un requisito de RAM.
- Plataforma objetivo del runtime prebuilt: Linux x86-64, Ubuntu 22.04+, glibc 2.35+, con soporte AVX2/FMA/F16C/BMI2 (CPU).
- GPU recomendadas: no disponible. La model card menciona despliegue en GPU mediante pesos nativos con plugins o Python ONNX CUDA, pero sin especificar modelos de GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: runtime C++ propio de Valen (paquete gguf-runtime-v0.1.0), instrucciones de compilacion desde fuente y de Ollama personalizado, y SGLang/vLLM como backends mencionados para otros formatos. No se reclama soporte en llama.cpp u Ollama oficiales sin modificaciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (modelos de decision multimodal con puntuacion de candidatos). Las alternativas mas cercanas serian clasificadores multimodales o LLM generativos con salida estructurada, pero no se aportan datos de rendimiento que permitan una comparacion rigurosa.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Valen-4B-GGUF | 4.207.467.305 | no disponible | Apache 2.0 | GGUF | Decision multimodal, runtime C++ propio |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | Sin datos en la informacion disponible |

## Limitaciones y advertencias

- La version prebuilt 0.1.0 del runtime GGUF solo esta cualificada para texto con el modelo 0.8B Q8_0; no se extiende esa cualificacion a otros tamanos, a imagen, a video, a GPU ni a otras plataformas.
- El paquete prebuilt no compila soporte directo de video; las pruebas historicas de video con compilacion desde fuente no cualifican el paquete prebuilt.
- Las cuantizaciones Q4 y Q5 no superaron los controles de calidad; solo se recomiendan F32 y Q8_0.
- No se reclama soporte en llama.cpp u Ollama oficiales sin modificaciones; el despliegue requiere el runtime propio o compilacion desde fuente.
- Idiomas limitados a ingles y chino; no se documenta soporte de castellano.
- Riesgo de alucinacion: no aplica en el sentido generativo clasico, pero la puntuacion de candidatos puede ser erronea o poco calibrada; la model card menciona politicas de incertidumbre en el cookbook, sin cifras concretas.
- Sesgos conocidos: no documentados en la informacion disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las notas de licencia del runtime y de los medios de ejemplo mencionadas en el cookbook.
- Existe una version posterior (Valen-Decision-1.5-4B-GGUF) que podria ser preferible para nuevos desarrollos.
- Las demostraciones de imagen y video compartidas son aplicaciones del modelo nativo y ONNX, no mediciones de rendimiento del paquete GGUF.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Valen-Team/Valen-4B-GGUF
- Modelo base nativo: https://huggingface.co/Valen-Team/Valen-4B
- Version ONNX: https://huggingface.co/Valen-Team/Valen-4B-ONNX
- Version 0.8B GGUF: https://huggingface.co/Valen-Team/Valen-0.8B-GGUF
- Version 2B GGUF: https://huggingface.co/Valen-Team/Valen-2B-GGUF
- Version posterior: https://huggingface.co/Valen-Team/Valen-Decision-1.5-4B-GGUF
- Repositorio GitHub: https://github.com/Valen-Team/Valen
- API gratuita y demo web: https://valen-team.github.io/
- Cookbook: https://valen-team.github.io/cookbook/
- Guia de eleccion de version: https://valen-team.github.io/docs/valen/choosing/
- Documentacion del runtime GGUF: https://valen-team.github.io/docs/valen/gguf/
- Validacion y rendimiento: https://valen-team.github.io/cookbook/validation/
- Release del runtime CPU: https://github.com/Valen-Team/Valen/releases/tag/gguf-runtime-v0.1.0
