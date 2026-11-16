# YungKeegs/murmur-cleanup-0.5b

## Resumen

murmur-cleanup-0.5b es un modelo de limpieza de dictado desarrollado por YungKeegs para Murmur, una aplicación privada de dictado con pulsación mantenida. Su función no es conversacional en sentido amplio: recibe la transcripción cruda de un sistema de speech-to-text y devuelve el texto que el usuario realmente quería escribir, aplicando autocorrecciones, eliminando muletillas, corrigiendo puntuación y convirtiendo números a dígitos, sin responder ni añadir contenido nuevo.

El modelo parte de Qwen/Qwen2.5-0.5B-Instruct, un transformer decoder-only de 494.032.768 parámetros, y se ha afinado con LoRA sobre 19.931 dictados generados. La relevancia actual reside en su especialización estrecha: en lugar de competir en razonamiento general, resuelve una tarea concreta de postprocesado de ASR con una tasa de acierto declarada del 99,3 % en significado y del 100 % en formato sobre el conjunto de test retenido del benchmark propio de Murmur.

Se distribuye principalmente en formato GGUF (variante q8_0 citada en la model card) y está pensado para ejecutarse localmente dentro de la aplicación Murmur mediante llama.cpp, lo que encaja con el enfoque de privacidad del producto al no requerir enviar el audio ni la transcripción a un servicio externo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-0.5B-Instruct) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF q8_0 (mencionada en la model card); otras variantes no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 0,5 GB); safetensors referenciados en los metadatos de parámetros |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-0.5B-Instruct, con 494 millones de parámetros. Sobre esa base se aplicó un ajuste fino con LoRA utilizando un conjunto de 19.931 dictados generados, orientado específicamente a la tarea de limpieza de transcripciones: resolución de autocorrecciones del hablante, eliminación de muletillas, normalización de puntuación y conversión de números hablados a dígitos. No se especifica en la información disponible el número total de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron fases de RLHF o DPO.

La innovación técnica no está en la arquitectura, sino en la restricción funcional del comportamiento: el modelo está entrenado para no responder preguntas ni añadir información, únicamente para reformatear el texto de entrada. Esta disciplina de tarea se evalúa con el benchmark propio de Murmur sobre dictados retenidos, con un 99,3 % de significado correcto y un 100 % de formato correcto.

## Capacidades

- Limpieza de transcripciones de dictado: eliminación de muletillas y palabras de relleno.
- Resolución de autocorrecciones del hablante del tipo "martes, no, espera, jueves".
- Corrección y normalización de puntuación.
- Conversión de números expresados en palabras a dígitos.
- Reescritura conservadora: no responde al contenido ni añade texto que no estuviera en la entrada.
- Integración con llama.cpp mediante el identificador `YungKeegs/murmur-cleanup-0.5b:murmur-cleanup-0.5b-q8_0.gguf` en la configuración de Murmur.
- Compatibilidad declarada con endpoints (tag `endpoints_compatible`).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Postprocesado de dictado en la aplicación Murmur: el modelo se invoca tras el ASR para transformar la transcripción cruda en texto final; su licencia Apache 2.0 y su tamaño de 0,5 GB permiten ejecución local sin coste por token.
- Corrección de autocorrecciones en notas de voz: cuando el usuario se rectifica a mitad de frase, el modelo aplica la última versión y descarta la anterior, algo habitual en dictado libre y en reuniones.
- Normalización de cifras en informes dictados: convierte cantidades, fechas y referencias numéricas habladas a dígitos, lo que reduce errores al volcar el texto a hojas de cálculo o sistemas de gestión.
- Limpieza de subtítulos y transcripciones de reuniones: elimina muletillas y arregla puntuación antes de publicar el texto o archivarlo, con una ventana de contexto suficiente para párrafos cortos (longitud exacta no disponible).
- Preprocesado para pipelines de datos: como paso previo a tareas de extracción de información o resumen, normaliza el texto dictado para que los modelos posteriores reciban una entrada limpia.
- Prototipado de interfaces de voz en local: al ser un GGUF de 0,5 GB, se puede desplegar en portátiles y equipos de desarrollo con llama.cpp para validar flujos de dictado sin infraestructura en la nube.
- Aplicaciones de accesibilidad: asistencia a usuarios que escriben mediante voz, donde la limpieza automática reduce la carga de corrección manual.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| Murmur benchmark (dictados de test retenidos) | Significado correcto | 99,3 % |
| Murmur benchmark (dictados de test retenidos) | Formato correcto | 100,0 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 0,5 GB y la variante citada es q8_0, por lo que la huella en memoria ronda los 0,5-0,7 GB incluyendo overhead de llama.cpp; no se dispone de cifras oficiales.
- GPU recomendadas: cualquier GPU consumer con al menos 1-2 GB de VRAM libre es suficiente por tamaño; no se especifican modelos concretos en la información disponible.
- Cabe en GPU consumer: sí, por tamaño (por ejemplo, GTX 1650, RTX 3050, RTX 4060 o superiores); la idoneidad exacta no está documentada por el autor.
- Opciones de despliegue: llama.cpp es el runtime indicado por la model card; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face. Compatibilidad con vLLM, TGI u Ollama no está confirmada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| murmur-cleanup-0.5b | 494 M | no disponible | Limpieza de dictado especializada | Apache 2.0 | GGUF en Hugging Face |
| Qwen/Qwen2.5-0.5B-Instruct | 494 M | no disponible en la informacion | Instrucciones generales | Apache 2.0 | Pesos completos en Hugging Face |
| Modelos de corrección gramatical tipo GECToR/T5-small | variable | variable | Corrección gramatical | variable | variable |

La comparación cuantitativa con alternativas no está disponible: no se han publicado resultados de benchmarks estándar para murmur-cleanup-0.5b que permitan contrastarlo con otros modelos de limpieza de texto o de corrección gramatical.

## Limitaciones y advertencias

- Modelo de nicho: está entrenado exclusivamente para limpieza de dictado; no debe usarse como asistente conversacional ni para responder preguntas.
- Riesgo de alucinación: aunque el objetivo es no añadir contenido, un modelo de 0,5 B puede introducir reformulaciones no deseadas en entradas fuera de distribución (texto escrito, idiomas distintos del entrenado o dictados muy largos).
- Idiomas: no se especifican los idiomas soportados; el benchmark y los ejemplos de la model card están en inglés, por lo que el rendimiento en castellano no está verificado.
- Contexto: la longitud máxima de contexto no está documentada, lo que impide garantizar el comportamiento en dictados largos.
- Sesgos: no se documenta ninguna evaluación de sesgos; al derivar de Qwen2.5-0.5B-Instruct puede heredar sesgos del modelo base.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda conservar la atribución y revisar las condiciones del modelo base.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni documentación adicional más allá de la model card; conviene validarlo con datos propios antes de producción.
- Dependencia del ASR: la calidad de salida está acotada por la calidad de la transcripción de entrada; errores graves del reconocedor no se corrigen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YungKeegs/murmur-cleanup-0.5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Aplicación Murmur: no disponible en la información proporcionada
- Paper o blog técnico: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
