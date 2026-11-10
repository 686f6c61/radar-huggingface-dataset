# Valen-Team/Valen-2B-GGUF

## Resumen

Valen-2B-GGUF es la distribucion en formato GGUF del modelo Valen-2B, desarrollado por Valen-Team. Se trata de un modelo especializado en toma de decisiones multimodales: en lugar de generar texto libre, recibe un contexto (texto, imagen o video) junto con un conjunto de respuestas candidatas definidas por el usuario y devuelve puntuaciones, probabilidades y categorias estructuradas. Su enfoque lo orienta a tareas de enrutamiento de tickets, cribado de imagenes y etiquetado de video, no a generacion conversacional abierta.

El modelo cuenta con 1.883.409.001 parametros (aproximadamente 1,88 mil millones) y se distribuye bajo licencia Apache 2.0. Soporta los idiomas ingles y chino. La variante GGUF esta pensada para ejecutarse mediante un runtime propio en C++ sobre Linux x86-64, sin necesidad de Python, PyTorch ni ONNX Runtime en el camino de inferencia, y expone los resultados estructurados por HTTP.

La relevancia de esta ficha radica en su peculiaridad tecnica: no es un LLM generativo al uso, sino un clasificador/puntuador multimodal con cabeza de decision entrenada. Ademas, el autor advierte que solo las cuantizaciones F32 y Q8_0 superaron los controles de calidad, y que las Q4/Q5 fallaron dichos controles. Existe una version posterior, Valen-Decision-1.5, que el propio autor senala como sucesora.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone Valen con cabeza de decision (modelo de decision multimodal); detalles de capas no disponibles |
| Parametros totales | 1.883.409.001 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F32 y Q8_0 recomendadas; Q4/Q5 no superaron los controles de calidad |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (tambien existen variantes Native y ONNX del modelo base) |

## Arquitectura y entrenamiento

La informacion disponible indica que Valen-2B emplea un backbone entrenado junto con una cabeza de decision especifica. El modelo no genera respuestas libres: puntua respuestas candidatas proporcionadas por el usuario y devuelve categorias, probabilidades si/no y puntuaciones. La model card menciona soporte multimodal de texto, imagen y video, si bien la documentacion aclara que el paquete prebuilt GGUF 0.1.0 no compila soporte directo de video, y que las pruebas historicas de video con compilacion desde fuente no cualifican el paquete prebuilt. La validacion del binario prebuilt se limita a una peticion de texto real con el modelo 0.8B Q8_0 en cache.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detallan innovaciones como decodificacion especulativa o atencion lineal. El runtime GGUF propio (Valen CPU runtime 0.1.0) esta orientado a Linux x86-64 (Ubuntu 22.04+, glibc 2.35+, AVX2/FMA/F16C/BMI2) y ejecuta el backbone y la cabeza de decision sin Python, PyTorch ni ONNX. El autor indica explicitamente que no se reclama soporte en llama.cpp u Ollama oficiales sin modificar.

## Capacidades

- Decision sobre texto: clasificacion y puntuacion de respuestas candidatas definidas por el usuario.
- Decision sobre imagen: cribado y categorizacion de imagenes (sujeto a la variante y al runtime empleado).
- Decision sobre video: soporte declarado, aunque el paquete prebuilt GGUF 0.1.0 no compila soporte directo de video.
- Salida estructurada: categorias, probabilidades si/no y puntuaciones devueltas por HTTP.
- Soporte multilingue limitado a ingles y chino.
- Integracion mediante API HTTP con runtime propio en C++.
- No es un modelo conversacional generativo ni se documenta soporte de tool calling, function calling ni razonamiento multi-paso.

## Casos de uso

- Enrutamiento de tickets: dado el texto de una incidencia y un conjunto de categorias candidatas, el modelo devuelve la categoria mas probable y su puntuacion, lo que permite derivar automaticamente el ticket al equipo adecuado. El cookbook oficial documenta este flujo.
- Cribado de imagenes de producto: se envian imagenes junto con etiquetas candidatas (por ejemplo, apto/no apto) y el modelo devuelve probabilidades para automatizar la revision previa a publicacion. Documentado en el cookbook como product screening.
- Etiquetado de video: clasificacion de clips frente a un conjunto de etiquetas candidatas para tareas de moderacion o catalogacion, con la advertencia de que el paquete prebuilt GGUF no compila soporte directo de video.
- Moderacion de contenido binaria: uso de probabilidades si/no para decidir si un contenido requiere revision humana, aprovechando la salida estructurada en lugar de texto libre.
- Servicio local en C++ sobre Linux: despliegue de un servicio de decision sin dependencias de Python ni PyTorch, adecuado para entornos con restricciones de dependencias o de seguridad.
- Prototipado rapido mediante API HTTP gratuita y demo web: evaluacion del modelo sin descargar pesos antes de decidir un despliegue local.
- Decisiones en juegos o entornos con acciones discretas: la demo de Sokoban ilustra el uso del modelo para elegir entre acciones candidatas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamano del fichero Q8_0 del modelo 2B: 1.880 GiB (tamano de descarga, no requisito de memoria en ejecucion).
- Fichero de vision opcional para texto: 1.235 GiB.
- El autor advierte explicitamente que el tamano de fichero no equivale al requisito de RAM; no se promete rendimiento no medido.
- Runtime: Valen CPU runtime 0.1.0 para Linux x86-64 (Ubuntu 22.04+, glibc 2.35+, AVX2/FMA/F16C/BMI2).
- La validacion del paquete prebuilt se realizo unicamente con el modelo 0.8B Q8_0 en una peticion de texto; no se cualifican imagenes, video, GPU ni otras plataformas en el paquete prebuilt.
- Para GPU se recomienda usar pesos nativos con los plugins correspondientes o ONNX CUDA en Python; no se detallan GPU concretas ni VRAM estimada.
- Opciones de despliegue: runtime propio GGUF en C++, SDK ONNX para Python/JavaScript, pesos nativos para ajuste fino. No se reclama soporte en llama.cpp u Ollama oficiales sin modificar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Valen-2B-GGUF | 1,88 B | no disponible | Decision multimodal con salida estructurada | Apache 2.0 | GGUF, Native, ONNX |
| Valen-0.8B-GGUF | no disponible | no disponible | Misma familia, menor tamano (Q8 0,761 GiB) | Apache 2.0 | GGUF |
| Valen-4B-GGUF | no disponible | no disponible | Misma familia, mayor tamano (Q8 4,181 GiB) | Apache 2.0 | GGUF |
| Valen-Decision-1.5-2B-GGUF | no disponible | no disponible | Version sucesora de la familia | no disponible | GGUF |

No se dispone de datos de benchmarks ni de modelos de terceros comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: solo puntua respuestas candidatas definidas por el usuario; no admite conversacion libre ni tool calling documentado.
- Solo soporta ingles y chino; no se documenta castellano.
- Solo las cuantizaciones F32 y Q8_0 superaron los controles de calidad; Q4 y Q5 fallaron dichos controles.
- El paquete prebuilt GGUF 0.1.0 no compila soporte directo de video, pese a que el modelo se presenta como multimodal.
- La validacion del paquete prebuilt se limita a texto con el modelo 0.8B Q8_0; no se extiende a imagenes, video, GPU ni otras plataformas.
- No se reclama soporte en llama.cpp u Ollama oficiales sin modificar; requiere el runtime propio.
- Requisitos de plataforma estrictos: Linux x86-64, Ubuntu 22.04+, glibc 2.35+, AVX2/FMA/F16C/BMI2.
- Existe una version posterior (Valen-Decision-1.5) que el autor senala como sucesora; conviene evaluarla antes de adoptar esta.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero las condiciones de calidad de cuantizaciones y el alcance de validacion deben tenerse en cuenta en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Valen-Team/Valen-2B-GGUF
- Modelo base nativo: https://huggingface.co/Valen-Team/Valen-2B
- Variante ONNX: https://huggingface.co/Valen-Team/Valen-2B-ONNX
- Version 0.8B GGUF: https://huggingface.co/Valen-Team/Valen-0.8B-GGUF
- Version 4B GGUF: https://huggingface.co/Valen-Team/Valen-4B-GGUF
- Version sucesora 1.5: https://huggingface.co/Valen-Team/Valen-Decision-1.5-2B-GGUF
- Repositorio GitHub: https://github.com/Valen-Team/Valen
- Runtime GGUF 0.1.0: https://github.com/Valen-Team/Valen/releases/tag/gguf-runtime-v0.1.0
- API gratuita y demo web: https://valen-team.github.io/
- Cookbook: https://valen-team.github.io/cookbook/
- Guia de eleccion de version: https://valen-team.github.io/docs/valen/choosing/
- Documentacion GGUF: https://valen-team.github.io/docs/valen/gguf/
- Validacion y rendimiento: https://valen-team.github.io/cookbook/validation/
- Demo de imagen y video: https://raw.githubusercontent.com/Valen-Team/Valen/main/assets/demos/Valen.mp4
- Demo de Sokoban: https://raw.githubusercontent.com/Valen-Team/Valen/main/assets/demos/games/valen-sokoban.mp4
