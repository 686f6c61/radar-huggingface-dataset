# Valen-Team/Valen-4B-GGUF

## Resumen

Valen-4B-GGUF es la distribucion en formato GGUF del modelo multimodal Valen-4B, desarrollado por Valen-Team. No es un modelo generativo de texto al uso: es un modelo de decision que, dado un contexto (texto, imagen o video), asigna probabilidades y puntuaciones a un conjunto de respuestas candidatas definidas por el usuario. Devuelve categorias, probabilidades si/no y scores estructurados, lo que lo orienta a tareas de enrutamiento de tickets, cribado de imagenes y etiquetado de video.

El modelo cuenta con 4.207.467.305 parametros y se distribuye bajo licencia Apache 2.0. Soporta ingles y chino. La variante GGUF esta pensada para ejecutarse mediante un runtime C++ propio (Valen custom runtime), sin necesidad de Python, PyTorch ni ONNX en la ruta de inferencia, y expone resultados estructurados por HTTP.

Es relevante porque propone un paradigma distinto al de los LLM generativos: en lugar de generar texto libre, puntua opciones predefinidas, lo que simplifica la integracion en pipelines de decision automatizada. No obstante, el autor advierte que el paquete GGUF precompilado solo esta cualificado para texto con el modelo 0.8B Q8_0, y que las cuantizaciones Q4/Q5 no superaron los controles de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (backbone Valen con cabeza de decision; detalles no especificados) |
| Parametros totales | 4.207.467.305 |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F32 y Q8_0 cualificados; Q4/Q5 fallaron los controles de calidad |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tambien existen variantes Native y ONNX del modelo base) |

## Arquitectura y entrenamiento

La informacion disponible indica que Valen-4B emplea un backbone entrenado ("Valen backbone") junto con una cabeza de decision ("decision head") que puntua respuestas candidatas proporcionadas por el usuario. El modelo es multimodal: procesa texto, imagen y video. La model card menciona que la ruta de servicio utiliza el backbone y la cabeza de decision entrenados, pero no detalla la arquitectura interna (tipo de transformer, atencion, etc.), el numero de tokens de entrenamiento ni la composicion del dataset.

Tampoco se especifican en la informacion proporcionada si hubo RLHF, DPO u otras tecnicas de alineacion, ni innovaciones tecnicas concretas como decodificacion especulativa o atencion lineal. La distribucion GGUF incorpora un runtime C++ propio con soporte para Linux x86-64 (Ubuntu 22.04+, glibc 2.35+, AVX2/FMA/F16C/BMI2), y el autor indica que el paquete precompilado no compila soporte directo de video.

## Capacidades

- Decision multimodal: asigna probabilidades y scores a respuestas candidatas definidas por el usuario a partir de texto, imagen o video.
- Salida estructurada: devuelve categorias, probabilidades si/no y puntuaciones por HTTP.
- Enrutamiento y clasificacion: disenado para tareas como ticket routing y cribado de imagenes.
- Etiquetado de video: soporte de video en las rutas medidas (source-build y Ollama custom), no en el paquete GGUF precompilado 0.1.0.
- Soporte bilingue: ingles y chino.
- Integracion sin Python: el runtime C++ permite servir el modelo sin PyTorch ni ONNX en produccion.
- Compatibilidad con endpoints: la model card incluye la etiqueta `endpoints_compatible`.
- No se documenta en la informacion disponible soporte de tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM generativos.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket y un conjunto de categorias candidatas, y devuelve la probabilidad de cada una, lo que permite derivar automaticamente la incidencia al equipo adecuado.
- Cribado de imagenes de producto: se envian imagenes junto con etiquetas candidatas (por ejemplo, "apto" / "no apto") y el modelo devuelve scores que permiten filtrar en un pipeline de catalogacion.
- Etiquetado de video: en las rutas con soporte de video, el modelo puntua etiquetas candidatas sobre fragmentos de video para tareas de moderacion o clasificacion de contenido.
- Decisiones binarias con umbral de confianza: al devolver probabilidades si/no, se puede fijar un umbral y derivar los casos inciertos a revision humana, lo que encaja en flujos de aprobacion automatizada.
- Servicio local en C++: el runtime GGUF permite desplegar un servicio de decision en un servidor Linux sin dependencias de Python, util en entornos con restricciones de stack.
- Prototipado rapido via API: la API HTTP gratuita y la demo web permiten evaluar el modelo en tareas propias antes de descargar pesos.
- Clasificacion multilingue en ingles y chino: util para empresas con contenido en ambos idiomas que necesiten categorizar textos o medios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se promete rendimiento no medido y que las demostraciones compartidas no constituyen mediciones de rendimiento del paquete GGUF.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El autor advierte que el tamano del fichero no equivale al requisito de RAM.
- Tamano del fichero Q8 del modelo 4B: 4.181 GiB; fichero de vision opcional para texto: 1.242 GiB.
- Para el modelo 0.8B: Q8 de 0.761 GiB y vision de 0.375 GiB; para el 2B: Q8 de 1.880 GiB y vision de 1.235 GiB.
- CPU objetivo del runtime precompilado: Linux x86-64, Ubuntu 22.04+, glibc 2.35+, con AVX2/FMA/F16C/BMI2.
- GPU recomendadas: no disponibles en la informacion proporcionada; la model card menciona despliegue en GPU con pesos nativos y plugins o ONNX CUDA en Python, sin especificar modelos de GPU.
- Despliegue: runtime C++ propio de Valen (GGUF), ONNX Runtime (SDK Python/JavaScript), backend custom llama.cpp/Ollama, y SGLang/vLLM para GPU. No se reclama soporte en llama.cpp u Ollama oficiales sin modificar.
- Latencia y throughput: no disponibles; el autor indica que no se promete rendimiento no medido.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (modelos de decision multimodal con salida estructurada) ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- El paquete GGUF precompilado 0.1.0 solo esta cualificado con una peticion de texto real usando el modelo 0.8B Q8_0 en cache; no se extiende a otros tamanos, imagenes, video, GPU ni otras plataformas.
- El paquete GGUF precompilado no compila soporte directo de video; las pruebas historicas de video con compilacion desde fuente no cualifican el paquete precompilado.
- Las cuantizaciones Q4 y Q5 fallaron los controles de calidad; solo se recomiendan F32 y Q8_0.
- No se reclama soporte en llama.cpp u Ollama oficiales sin modificar.
- Idiomas limitados a ingles y chino; no se documenta soporte de castellano.
- No es un modelo generativo: solo puntua respuestas candidatas proporcionadas por el usuario, lo que limita su uso a tareas de clasificacion y decision.
- Riesgo de alucinacion y sesgos: no documentado en la informacion disponible.
- Licencia Apache 2.0, que permite uso comercial, pero conviene revisar las notas de procedencia de medios y licencias del cookbook oficial.
- Existe una version mas reciente, Valen-Decision-1.5-4B-GGUF, que el autor recomienda como sustituta.

## Enlaces

- Modelo en Hugging Face (GGUF): https://huggingface.co/Valen-Team/Valen-4B-GGUF
- Modelo base nativo: https://huggingface.co/Valen-Team/Valen-4B
- Variante ONNX: https://huggingface.co/Valen-Team/Valen-4B-ONNX
- Version 0.8B GGUF: https://huggingface.co/Valen-Team/Valen-0.8B-GGUF
- Version 2B GGUF: https://huggingface.co/Valen-Team/Valen-2B-GGUF
- Version mas reciente (Decision 1.5): https://huggingface.co/Valen-Team/Valen-Decision-1.5-4B-GGUF
- Repositorio GitHub: https://github.com/Valen-Team/Valen
- API gratuita y demo web: https://valen-team.github.io/
- Cookbook oficial: https://valen-team.github.io/cookbook/
- Guia de eleccion de version: https://valen-team.github.io/docs/valen/choosing/
- Documentacion GGUF: https://valen-team.github.io/docs/valen/gguf/
- Validacion y rendimiento: https://valen-team.github.io/cookbook/validation/
- Release del runtime CPU 0.1.0: https://github.com/Valen-Team/Valen/releases/tag/gguf-runtime-v0.1.0
