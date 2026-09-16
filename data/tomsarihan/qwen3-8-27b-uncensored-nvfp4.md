# tomsarihan/Qwen3.8-27B-Uncensored-NVFP4

## Resumen

tomsarihan/Qwen3.8-27B-Uncensored-NVFP4 es una cuantizacion en formato NVFP4 del modelo JonathanColetti/Qwen3.8-27B-Uncensored, publicada por el usuario tomsarihan. Se trata por tanto de una conversion de precision, no de un entrenamiento nuevo: el repositorio contiene los pesos del modelo base (denominado Qwen3.8-27B) comprimidos a 4 bits en coma flotante con el formato NVFP4 y el contenedor compressed-tensors, pensado para su ejecucion con vLLM sobre hardware Blackwell. El pipeline declarado es image-text-to-text, de modo que el modelo conserva capacidades de vision-lenguaje, y las etiquetas indican ademas que es una variante "uncensored"/"abliterated" orientada a red teaming.

El interes practico del repositorio es doble. Por un lado, permite servir un modelo de ~27B de parametros en precision de 4 bits sobre GPUs consumer de gama alta (RTX 5090) o sistemas compactos (DGX Spark, GB10), reduciendo de forma notable los requisitos de VRAM frente a los pesos en 16 bits. Por otro lado, las etiquetas mtp y speculative-decoding sugieren que el modelo base incorpora prediccion multi-token, lo que habilita decodificacion especulativa y mejora el throughput en inferencia.

Hay que tener en cuenta que el repositorio esta restringido (gated): es necesario aceptar condiciones en HuggingFace antes de descargar los pesos. Ademas, la informacion publicada no incluye la longitud de contexto, la composicion del dataset de entrenamiento ni resultados de benchmarks, por lo que varias especificaciones quedan como no disponibles. Las etiquetas ai-red-team y uncensored implican que el modelo ha sido sometido a un proceso de ablacion de rechazos, algo que condiciona su uso responsable.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre del repositorio indica la familia Qwen3.8; no se detalla la arquitectura interna en la informacion proporcionada) |
| Parametros totales | ~27B (segun la denominacion "27B" del repositorio; cifra exacta no disponible) |
| Parametros activos | no disponible (no se indica que el modelo sea de tipo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 / FP4 de 4 bits con escalas, contenedor compressed-tensors |
| Idiomas soportados | en (ingles), zh (chino) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors cuantizados en NVFP4 (compressed-tensors), cargables con transformers y vLLM |
| Pipeline declarado | image-text-to-text (vision-lenguaje) |
| Modelo base | JonathanColetti/Qwen3.8-27B-Uncensored |
| Acceso | restringido (gated): requiere aceptar condiciones en HuggingFace |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion | 2026-09-16 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Los indicios disponibles son indirectos: el nombre del repositorio lo situa en la familia Qwen3.8 con ~27B de parametros, el pipeline es image-text-to-text (lo que implica un encoder visual y un decodificador de lenguaje, es decir, un modelo multimodal), y la etiqueta mtp apunta a la presencia de prediccion multi-token (multi-token prediction), tecnica habitual en modelos recientes para habilitar decodificacion especulativa. No se confirma si se trata de un transformer denso, de una arquitectura MoE o de un diseno hibrido.

Este repositorio concreto no ha sido entrenado: es el resultado de cuantizar los pesos de JonathanColetti/Qwen3.8-27B-Uncensored al formato NVFP4 mediante el stack compressed-tensors. El modelo base, segun sus etiquetas, ha sido sometido a un proceso de "abliteracion" o eliminacion de rechazos (uncensored/abliterated), orientado a tareas de red teaming e investigacion en seguridad de IA. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO u otras fases de alineamiento.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles y chino.
- Comprension de imagenes: el pipeline declarado es image-text-to-text, por lo que acepta entradas de imagen junto con texto.
- Razonamiento multimodal (descripcion, analisis y respuesta sobre contenido visual), segun la etiqueta vision-language.
- Soporte de prediccion multi-token y decodificacion especulativa (etiquetas mtp y speculative-decoding), orientado a acelerar la generacion.
- Inferencia optimizada para hardware Blackwell mediante NVFP4 y vLLM.
- Comportamiento "sin censura": el modelo base ha sido ablacionado para reducir rechazos, lo que lo hace util en escenarios de red teaming y evaluacion de seguridad.
- Compatibilidad con endpoints (etiqueta endpoints_compatible).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Red teaming y evaluacion de seguridad: el modelo esta etiquetado como uncensored/abliterated y ai-red-team, por lo que sirve como generador de ataques controlados y como sujeto de pruebas en ejercicios de alineamiento, permitiendo a los equipos de seguridad estudiar respuestas que un modelo alineado rechazaria.
- Investigacion sobre ablacion de rechazos: al comparar esta variante con el modelo base sin ablacionar, los investigadores pueden medir el impacto de la eliminacion de rechazos en calidad de respuesta, sesgos y utilidad general.
- Despliegue de bajo coste de un modelo multimodal de ~27B: la cuantizacion NVFP4 reduce los pesos a aproximadamente 13,5 GB, lo que permite servirlo en una unica RTX 5090 (32 GB) o en un DGX Spark/GB10 en lugar de recurrir a GPUs de centro de datos.
- Analisis de documentos e imagenes en pipelines internos: al aceptar entradas image-text-to-text, puede extraer y resumir informacion de capturas, diagramas o documentos escaneados en flujos automatizados.
- Servicio de inferencia de alto throughput con vLLM: el repositorio esta preparado para vLLM sobre Blackwell, de modo que puede desplegarse como endpoint compatible con la API de OpenAI para aplicaciones internas.
- Prototipado y evaluacion local en estaciones de trabajo: gracias a su tamano en 4 bits, permite iterar sobre prompts, plantillas y tareas multimodales sin depender de un cluster.
- Aplicaciones bilingues ingles-chino: el soporte declarado de ambos idiomas lo hace adecuado para asistentes o herramientas de traduccion y resumen en ese par de lenguas.
- Experimentacion con decodificacion especulativa: las etiquetas mtp y speculative-decoding permiten medir ganancias de latencia al combinar el modelo con un borrador o con su propia cabeza de prediccion multi-token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye cifras de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluacion, y tampoco se han encontrado resultados en la busqueda web realizada (los resultados obtenidos no guardan relacion con el modelo).

## Requisitos de hardware

- VRAM estimada para los pesos en NVFP4: aproximadamente 13,5 GB partiendo de ~27B de parametros a 4 bits, mas la sobrecarga de escalas del formato y el cache KV. Cifra orientativa, calculada a partir del numero de parametros indicado en el nombre del repositorio.
- Memoria total recomendada: 16-24 GB como minimo practico para contexto corto, y mas si se trabaja con contextos largos o imagenes de alta resolucion (la longitud de contexto no esta publicada, por lo que no puede acotarse el cache KV).
- GPUs objetivo declaradas por las etiquetas: RTX 5090 (Blackwell, 32 GB), DGX Spark y GB10. El formato NVFP4 requiere hardware Blackwell para aprovechar sus rutas de calculo nativas.
- Cabe en GPU consumer: si, en una RTX 5090; en generaciones anteriores (Ampere, Ada) el soporte de NVFP4 es limitado o inexistente, por lo que se necesitarian rutas de dequantizacion.
- Opciones de despliegue: vLLM (etiqueta explicita) y transformers. Ollama, llama.cpp, TGI u otros backends no estan confirmados en la informacion proporcionada; llama.cpp no soporta NVFP4 de forma nativa en el momento de redactar esta ficha.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de modelos comparables identificados en la informacion proporcionada. La unica comparacion posible con los datos disponibles es contra el propio modelo base y contra una hipotetica version en 16 bits:

| Modelo | Precision | Tamano de pesos estimado | Hardware objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tomsarihan/Qwen3.8-27B-Uncensored-NVFP4 | NVFP4 (4 bits) | ~13,5 GB | Blackwell: RTX 5090, DGX Spark, GB10 | apache-2.0 | Gated en HuggingFace |
| JonathanColetti/Qwen3.8-27B-Uncensored | no disponible (probablemente 16 bits) | no disponible | GPU con mas VRAM | no disponible | no disponible |

No se han identificado en la informacion disponible otros modelos de la misma categoria (multimodales de ~27B cuantizados en NVFP4) con los que establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo ablacionado ("uncensored"): la eliminacion de rechazos puede degradar la calidad general del modelo y aumentar la probabilidad de generar contenido danino, sesgado o inexacto. No es adecuado para aplicaciones de cara al publico sin moderacion adicional.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad, y al tratarse de una cuantizacion de 4 bits es esperable cierta degradacion adicional respecto a los pesos originales.
- Perdida por cuantizacion: la conversion a NVFP4 introduce error numerico. No se documenta ninguna evaluacion de la degradacion frente al modelo base en 16 bits.
- Idiomas limitados: solo se declaran ingles y chino. No hay soporte confirmado de castellano ni de otras lenguas.
- Longitud de contexto desconocida: al no publicarse, no puede garantizarse el comportamiento en conversaciones largas ni el consumo de memoria asociado.
- Dependencia de hardware: NVFP4 esta pensado para GPUs Blackwell. En hardware anterior el modelo puede no cargarse o requerir conversiones adicionales.
- Acceso restringido: el repositorio es gated; es imprescindible aceptar las condiciones en HuggingFace antes de descargarlo, lo que puede complicar su uso en pipelines automatizados.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, y sin documentacion tecnica publicada. No hay garantia de mantenimiento ni de soporte.
- Uso comercial: la licencia declarada es apache-2.0, que permite uso comercial, pero se desconoce la licencia y las condiciones del modelo base del que deriva, por lo que conviene verificarlas antes de explotarlo en produccion.
- Advertencia legal y etica: un modelo sin censura puede generar contenido que infrinja politicas de plataformas o la legislacion aplicable segun el uso. La responsabilidad recae en el desplegador.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tomsarihan/Qwen3.8-27B-Uncensored-NVFP4
- Modelo base: https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored
- Paper, blog o repositorio de codigo asociado: no disponible
- Demo o espacio de prueba: no disponible

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces obtenidos correspondian a documentacion de funciones de Google Docs y a hilos de foros sin relacion con el repositorio.
