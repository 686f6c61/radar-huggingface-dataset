# Thaurock/Llama-3.2-90B-Vision-Instruct-GGUF

## Resumen

Llama 3.2 90B Vision Instruct es un modelo multimodal de tipo imagen-texto-a-texto desarrollado por Meta, basado en la arquitectura Mllama (MllamaForConditionalGeneration). Combina un backbone de lenguaje de 90 mil millones de parametros con un codificador visual dedicado y mecanismos de atencion cruzada que permiten a las representaciones textuales interactuar directamente con caracteristicas visuales durante la generacion. Este repositorio concreto, publicado por el usuario Thaurock, ofrece una conversion completa del modelo original a formato GGUF en dos precisiones (F16 y Q8_0), junto con el proyector multimodal independiente.

La relevancia de esta publicacion es doble. Por un lado, traslada un modelo vision-lenguaje de gran escala al ecosistema GGUF, historicamente centrado en modelos de texto. Por otro, la propia model card advierte de una limitacion critica: a fecha de noviembre de 2026, llama.cpp upstream no implementa soporte nativo para la arquitectura Mllama, por lo que estos artefactos no son ejecutables con llama-cli, llama-server ni con runners GGUF convencionales como Ollama. Se trata, por tanto, de artefactos de conversion experimentales orientados a investigacion y a pruebas de compatibilidad futura.

El repositorio tiene un tamano aproximado de 275,7 GB e incluye el backbone de lenguaje completo, las capas de atencion cruzada, el codificador visual, el proyector multimodal y el tokenizador BPE de Llama con sus tokens especiales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mllama (MllamaForConditionalGeneration): transformer de lenguaje con atencion cruzada multimodal, codificador visual y proyector |
| Parametros totales | 90 mil millones (segun denominacion del modelo); el campo safetensors reporta 926.490.132, dato que no concuerda con el tamano real del modelo |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | F16 y Q8_0 (lenguaje); proyector multimodal en F16 |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | llama3.2 |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

La arquitectura Mllama se diferencia de aproximaciones tipo LLaVA en que no se limita a concatenar embeddings visuales a la secuencia de tokens textuales. En su lugar, incorpora mecanismos de atencion cruzada dentro del propio backbone del modelo de lenguaje, de modo que las representaciones textuales pueden consultar las caracteristicas visuales a lo largo de todo el proceso de generacion. El modelo se compone de cinco bloques: el backbone de lenguaje de 90B (responsable del seguimiento de instrucciones, el razonamiento textual y la generacion autorregresiva), las capas de atencion cruzada integradas, un codificador visual dedicado, un proyector multimodal que mapea las caracteristicas visuales al espacio de representacion del lenguaje, y el tokenizador BPE de Llama con sus tokens especiales.

La informacion disponible no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo original de Meta. Tampoco se especifican innovaciones adicionales como decodificacion especulativa o atencion lineal. La conversion a GGUF preserva los pesos originales y las estructuras tensoriales multimodales, con los ajustes de metadatos propios de la conversion.

## Capacidades

- Generacion de texto y razonamiento sobre instrucciones en formato conversacional.
- Comprension de imagenes (image understanding): el modelo procesa entradas imagen-texto y genera respuestas textuales.
- Razonamiento multimodal: la atencion cruzada permite integrar informacion visual durante toda la generacion, no solo al inicio.
- Soporte multilingue en ocho idiomas: ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes.
- Integracion con text-generation-inference segun los tags del repositorio.
- Capacidad de seguimiento de instrucciones (instruct) para tareas guiadas.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling ni modos de razonamiento multi-paso o thinking mode.

## Casos de uso

- Investigacion sobre arquitecturas vision-lenguaje: el repositorio permite a investigadores inspeccionar los tensores convertidos de Mllama en formato GGUF y estudiar como se serializan la atencion cruzada y el proyector multimodal, sin necesidad de cargar el modelo original en safetensors.
- Desarrollo de runtimes de inferencia: sirve como material de prueba para implementar soporte nativo de Mllama en llama.cpp u otros backends GGUF, validando la carga del backbone, el proyector y el pipeline de procesamiento de imagenes.
- Pruebas de compatibilidad futura: util para verificar que una implementacion emergente de Mllama produce resultados coherentes con el modelo original de Meta una vez disponible el soporte.
- Analisis de cuantizacion en modelos multimodales: la comparacion entre F16 y Q8_0 del backbone, manteniendo el proyector en F16, permite estudiar el impacto de la cuantizacion del lenguaje sin introducir una variable adicional en el pipeline visual.
- Evaluacion de requisitos de memoria: con artefactos de 177,4 GiB (F16) y 96,2 GiB (Q8_0), el repositorio facilita la planificacion de infraestructura para despliegues multimodales de gran escala.
- Docencia y formacion tecnica: como ejemplo documentado de conversion completa de un modelo multimodal a GGUF, incluyendo la separacion entre backbone y proyector.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el fichero F16 ocupa aproximadamente 177,4 GiB y el Q8_0 aproximadamente 96,2 GiB, a los que se suman unos 2 GiB del proyector F16. El Q8_0 requiere en torno a 98 GiB de memoria total para cargar modelo y proyector.
- GPU recomendadas: para F16 se necesitan configuraciones multi-GPU de clase A100 80GB o H100 80GB (al menos tres unidades para el backbone). Para Q8_0 bastan dos A100/H100 de 80GB, o combinaciones equivalentes.
- GPU de consumo: el modelo no cabe en ninguna GPU de consumo individual (RTX 4090 con 24 GB, RTX 3090 con 24 GB). Solo seria viable mediante offloading parcial a RAM del sistema, con latencia muy elevada.
- Opciones de despliegue: en la practica, ninguna con runners GGUF convencionales. La model card indica explicitamente que llama.cpp upstream, llama-cli, llama-server y Ollama no pueden ejecutar estos ficheros por falta de implementacion nativa de Mllama. El despliegue queda a la espera de runtimes experimentales compatibles con MllamaForConditionalGeneration.
- Latencia y throughput: no disponibles; al no existir backend de inferencia funcional para estos artefactos, no se pueden medir.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-90B-Vision-Instruct (GGUF, este repo) | 90B | no disponible | Imagen-texto-a-texto | llama3.2 | GGUF experimental, sin inferencia en llama.cpp |
| Llama-3.2-90B-Vision-Instruct (original Meta) | 90B | no disponible | Imagen-texto-a-texto | llama3.2 | Safetensors, ejecutable con backends que soporten Mllama |
| Alternativas de texto de ~70-90B | no disponible | no disponible | Solo texto | no disponible | no disponible |

La informacion proporcionada no incluye datos de rendimiento de modelos comparables, por lo que la comparativa se limita a parametros, modalidad y disponibilidad.

## Limitaciones y advertencias

- Limitacion critica de ejecucion: los ficheros GGUF no son ejecutables con llama.cpp upstream, llama-cli, llama-server ni Ollama. Cargar el backbone y el mmproj no habilita por si solo la ejecucion de Mllama.
- Requiere implementacion nativa de la arquitectura Mllama (atencion cruzada, integracion del codificador visual, gestion del proyector multimodal y pipeline de procesamiento de imagenes) en un runtime compatible.
- El campo de parametros totales de safetensors (926.490.132) no concuerda con el tamano real del modelo de 90B; conviene tratar ese dato con cautela.
- Riesgo de alucinacion: no documentado en la informacion disponible, pero inherente a los modelos generativos de gran escala.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Limitaciones de contexto: la longitud de contexto no se especifica en la informacion disponible.
- Restricciones de licencia: la licencia llama3.2 impone condiciones de uso comercial que deben revisarse antes de cualquier despliegue en produccion.
- El repositorio debe considerarse material experimental de conversion para investigacion, desarrollo y pruebas de compatibilidad, no un artefacto listo para produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Thaurock/Llama-3.2-90B-Vision-Instruct-GGUF
- Modelo base: Meta-Llama-3.2-90B-Vision-Instruct (referenciado en la model card, sin URL explicita en la informacion disponible)
