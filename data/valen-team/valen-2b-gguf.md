# Valen-Team/Valen-2B-GGUF

## Resumen

Valen-2B-GGUF es la distribucion en formato GGUF del modelo multimodal Valen-2B, desarrollado por Valen-Team. No es un modelo generativo de texto al uso: se trata de un modelo de decision que, dado un contexto (texto, imagen o video), puntua un conjunto de respuestas candidatas definidas por el desarrollador y devuelve categorias, probabilidades si/no y puntuaciones estructuradas. Esta orientado a tareas como enrutado de tickets, cribado de imagenes y etiquetado de video.

La arquitectura combina un backbone transformer entrenado con una cabeza de decision especifica, con 1.883.409.001 parametros totales. El modelo base es Valen-Team/Valen-2B y esta disponible en tres formatos (nativo, ONNX y GGUF); esta ficha cubre la variante GGUF, pensada para ejecutar un servicio de decision local en C++ sobre Linux x86-64, sin necesidad de Python, PyTorch ni ONNX Runtime en la ruta de inferencia.

Su relevancia actual radica en el enfoque: en lugar de generar texto libre, expone una interfaz de puntuacion estructurada sobre HTTP, lo que facilita integrar decisiones deterministas y acotadas en pipelines de produccion. La model card advierte que la version precompilada GGUF 0.1.0 no incluye soporte directo de video y que solo se recomiendan las cuantizaciones F32 y Q8_0, ya que Q4 y Q5 no superaron las pruebas de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con backbone Valen y cabeza de decision (detalles de capas y atencion no disponibles) |
| Parametros totales | 1.883.409.001 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F32 y Q8_0 recomendadas; Q4 y Q5 no superaron los controles de calidad |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (tambien existen variantes nativa y ONNX del modelo base) |

## Arquitectura y entrenamiento

La informacion disponible indica que Valen-2B emplea un backbone transformer entrenado junto a una cabeza de decision que puntua respuestas candidatas en lugar de generar texto autoregresivamente. El modelo procesa entradas multimodales (texto, imagen y, en el modelo base, video) y produce salidas estructuradas: categorias, probabilidades si/no y puntuaciones. No se detallan en la informacion proporcionada el numero de capas, la dimension oculta, el mecanismo de atencion ni la composicion exacta del dataset de entrenamiento.

Tampoco se especifican el volumen de tokens de entrenamiento, las tecnicas de alineacion (RLHF, DPO) ni innovaciones como decodificacion especulativa. La model card menciona que la ruta de servicio utiliza el backbone y la cabeza de decision entrenados, y que el paquete precompilado del runtime GGUF 0.1.0 incluye pines de codigo fuente, parches, licencias y hashes, pero no los pesos. El soporte de video directo no esta compilado en el binario precompilado; las pruebas historicas de video se realizaron compilando desde fuente y no cualifican el paquete prebuilt.

## Capacidades

- Puntuacion de respuestas candidatas: el desarrollador define las opciones y el modelo devuelve categorias, probabilidades si/no y scores.
- Salida estructurada sobre HTTP: integrable como servicio de decision local en C++.
- Procesamiento de texto e imagen en la ruta multimodal; el video esta soportado en el modelo base pero no en el binario GGUF precompilado 0.1.0.
- Tareas de decision como enrutado de tickets, cribado de imagenes de producto y etiquetado de video (segun los tutoriales oficiales).
- Capacidades conversacionales y de decision etiquetadas en el repositorio.
- Soporte multilingue limitado a ingles y chino.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la informacion disponible.
- No se documenta modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Enrutado de tickets de soporte: se definen las categorias de destino como candidatas y el modelo devuelve la categoria y la probabilidad, permitiendo derivar automaticamente incidencias al equipo adecuado con un umbral de confianza configurable.
- Cribado de imagenes de producto: se envian imagenes junto a candidatos (por ejemplo, apta/no apta, tipo de defecto) y el modelo puntua cada opcion, util para colas de revision previas a publicacion en catalogos.
- Etiquetado de video en pipelines de contenido: en el modelo base permite asignar etiquetas a fragmentos de video; en GGUF requiere compilar desde fuente, ya que el binario precompilado no incluye soporte de video.
- Moderacion asistida con decision binaria: el modelo puede puntuar si/no sobre contenido textual o visual, devolviendo probabilidades que se combinan con reglas de negocio.
- Servicio de decision local en C++ sobre Linux: despliegue en Ubuntu 22.04+ con AVX2/FMA/F16C/BMI2, sin dependencias de Python ni PyTorch, adecuado para entornos con requisitos estrictos de dependencias.
- Clasificacion de intenciones en asistentes conversacionales: dado un turno de usuario, puntuar un conjunto cerrado de intenciones para dirigir el flujo de dialogo.
- Evaluacion comparativa de modelos: usar las variantes 0.8B, 2B y 4B para medir el equilibrio entre calidad de decision y presupuesto de memoria en tareas propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se promete rendimiento no medido y que las demostraciones compartidas no constituyen mediciones de rendimiento de GGUF.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero Q8_0 del modelo 2B ocupa 1.880 GiB y el fichero de vision opcional 1.235 GiB; el tamano de fichero no equivale al requisito de RAM segun la model card.
- Plataforma objetivo del runtime precompilado: Linux x86-64, Ubuntu 22.04+, glibc 2.35+, con soporte AVX2/FMA/F16C/BMI2.
- GPU: no se documentan requisitos ni GPU recomendadas para la ruta GGUF; para despliegue en GPU la model card remite a los pesos nativos con plugins o a ONNX CUDA en Python.
- Cabe en CPU consumer: el paquete prebuilt se cualifico con una peticion de texto real usando el modelo 0.8B Q8_0 en cache; no se extiende esa cualificacion a otros tamanos ni a imagen o video.
- Opciones de despliegue: runtime propio de Valen (descargable desde GitHub, version 0.1.0), servicio HTTP local; no se reclama soporte en llama.cpp u Ollama oficiales sin modificar. Para GPU, SGLang/vLLM se mencionan como backends en la guia de versiones.
- Latencia y throughput: no disponibles; la model card no promete rendimiento no medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Valen-2B-GGUF | 1.883.409.001 | no disponible | Decision multimodal con salida estructurada | apache-2.0 | GGUF, nativo y ONNX (modelo base) |
| Valen-0.8B-GGUF | no disponible | no disponible | Mismo enfoque, menor tamano (Q8: 0.761 GiB) | apache-2.0 | GGUF |
| Valen-4B-GGUF | no disponible | no disponible | Mismo enfoque, mayor tamano (Q8: 4.181 GiB) | apache-2.0 | GGUF |
| Valen-Decision-1.5-2B-GGUF | no disponible | no disponible | Version sucesora anunciada en la model card | no disponible | GGUF |

No se dispone de datos de benchmarks que permitan comparar el rendimiento frente a alternativas de otros desarrolladores; la comparativa se limita a las variantes del mismo equipo.

## Limitaciones y advertencias

- Modelo de decision, no generativo: no produce texto libre; requiere que el desarrollador defina las respuestas candidatas.
- Idiomas limitados a ingles y chino; no se declara soporte de castellano.
- El binario GGUF precompilado 0.1.0 no incluye soporte directo de video; las pruebas de video historicas se hicieron compilando desde fuente y no cualifican el paquete prebuilt.
- Solo F32 y Q8_0 se recomiendan; Q4 y Q5 fallaron los controles de calidad.
- No se reclama soporte en llama.cpp u Ollama oficiales sin modificar.
- La cualificacion del paquete prebuilt cubre unicamente una peticion de texto con 0.8B Q8_0 en cache; no hay evidencia publicada para imagen, video, GPU u otras plataformas.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; al ser un modelo de puntuacion, los errores se manifiestan como probabilidades mal calibradas.
- Licencia apache-2.0 permite uso comercial, pero conviene revisar las notas de licencia de medios y dependencias del runtime incluidas en el paquete.
- Modelo marcado como sustituido por Valen-Decision-1.5 en la propia model card; evaluar la version sucesora antes de un despliegue nuevo.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/Valen-Team/Valen-2B-GGUF
- Modelo nativo: https://huggingface.co/Valen-Team/Valen-2B
- ONNX: https://huggingface.co/Valen-Team/Valen-2B-ONNX
- Variante 0.8B GGUF: https://huggingface.co/Valen-Team/Valen-0.8B-GGUF
- Variante 4B GGUF: https://huggingface.co/Valen-Team/Valen-4B-GGUF
- Version sucesora: https://huggingface.co/Valen-Team/Valen-Decision-1.5-2B-GGUF
- GitHub: https://github.com/Valen-Team/Valen
- Runtime GGUF 0.1.0: https://github.com/Valen-Team/Valen/releases/tag/gguf-runtime-v0.1.0
- Documentacion GGUF: https://valen-team.github.io/docs/valen/gguf/
- Guia de versiones: https://valen-team.github.io/docs/valen/choosing/
- Cookbook: https://valen-team.github.io/cookbook/
- API y demo web: https://valen-team.github.io/
