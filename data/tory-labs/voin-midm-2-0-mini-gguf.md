# tory-labs/voin-midm-2.0-mini-gguf

## Resumen

`tory-labs/voin-midm-2.0-mini-gguf` no es un modelo entrenado por su publicador, sino un repositorio espejo que redistribuye un único archivo GGUF cuantizado del modelo coreano `K-intelligence/Midm-2.0-Mini-Instruct`, desarrollado por KT. El archivo incluido es `Midm-2.0-Mini-Instruct-Q4_K_M.gguf`, de 1.426.272.640 bytes (1,4 GB), una copia sin modificaciones cuya función es servir como origen de descarga para la aplicación de escritorio voin.

El modelo subyacente es un instruct de aproximadamente 2,31 mil millones de parámetros (2.305.517.312 según los pesos en safetensors del modelo base), orientado a conversación y etiquetado como `conversational` y `endpoints_compatible`. Su interés práctico radica en el tamaño: cuantizado en Q4_K_M ocupa menos de 1,5 GB, lo que permite ejecución local en CPU y en GPUs de gama de entrada con 4 GB de VRAM o menos.

La relevancia de este repositorio concreto es limitada y hay que leerla con cautela: no aporta model card técnica, no documenta idiomas, contexto ni benchmarks, y registra 0 descargas y 0 likes en el momento de redactar esta ficha. Para uso en producción es preferible acudir al modelo original o al repositorio de conversión de referencia, y utilizar este solo como confirmación del archivo y su hash.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (no se detalla en la información proporcionada; se trata de una cuantización del modelo base `K-intelligence/Midm-2.0-Mini-Instruct`) |
| Parametros totales | 2.305.517.312 (aproximadamente 2,31 mil millones) |
| Parametros activos | No aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (único archivo del repositorio) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`Midm-2.0-Mini-Instruct-Q4_K_M.gguf`) |
| Tamano del archivo | 1.426.272.640 bytes (1,4 GB) |
| Tamano del repositorio | 1,4 GB |
| Checksum SHA-256 | `7a945a20ceae202ab7a96d461fa9c3710e62deaffd6654c2106ab5e813fd8225` |
| Modelo base | `K-intelligence/Midm-2.0-Mini-Instruct` (KT) |
| Conversion GGUF de referencia | `mykor/Midm-2.0-Mini-Instruct-gguf`, commit `152690816d5f` |
| Pipeline tag | No disponible |
| Etiquetas | `gguf`, `voin`, `conversational`, `endpoints_compatible`, `region:us` |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-17 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura del modelo base: no se indica si es un transformer denso, un MoE o una variante híbrida, ni se detalla el número de capas, cabezas de atención, vocabulario o función de activación. Tampoco hay datos sobre el corpus de entrenamiento, el volumen de tokens, la composición del dataset ni las técnicas de alineación empleadas (RLHF, DPO u otras). El sufijo `-Instruct` del nombre del modelo base indica un ajuste para seguimiento de instrucciones, pero este repositorio no documenta el proceso.

Lo único verificable a nivel técnico es el proceso de cuantización: una conversión a Q4_K_M, el esquema k-quant de 4 bits de la familia llama.cpp, que mantiene determinadas capas y tensores críticos en mayor precisión (habitualmente atención y algunas matrices de proyección) mientras comprime el resto en bloques con escalas. El resultado es un archivo de 1,4 GB para 2,31 mil millones de parámetros, lo que supone una media efectiva de aproximadamente 4,9 bits por peso, coherente con ese esquema.

El autor declara explícitamente que el archivo es una copia sin modificaciones del publicado por `mykor`, y que todos los derechos pertenecen a los autores originales. No hay información sobre decodificación especulativa, atención lineal ni otras innovaciones de inferencia.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones, derivado del ajuste instruct del modelo base.
- Diálogo multi-turno, tal y como refleja la etiqueta `conversational` del repositorio.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que sugiere que el archivo puede cargarse en infraestructuras compatibles con el formato de mensajes de Hugging Face.
- Ejecución local en CPU y GPU de gama baja gracias al tamaño reducido del archivo cuantizado.
- Capacidades de razonamiento, código, matemáticas o visión: no documentadas en la información disponible.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas (el modelo base es de KT, empresa surcoreana, pero no se confirma el conjunto de idiomas).
- Modo thinking o razonamiento explícito: no documentado.

## Casos de uso

- Aplicación de escritorio con inferencia local: es el caso de uso real del repositorio, que existe para que la app voin descargue el GGUF Q4_K_M (1,4 GB) y ejecute el modelo en la máquina del usuario sin depender de la nube.
- Asistente conversacional offline en equipos sin GPU dedicada: con 2,31 mil millones de parámetros en 4 bits, el modelo puede correr en CPU con llama.cpp y mantener conversaciones de texto con latencia aceptable.
- Prototipado rápido de interfaces de chat: permite montar un endpoint local compatible con la API de mensajes en minutos, usando Ollama o llama-cpp-python, sin coste de tokens.
- Pruebas de integración en pipelines de CI: el archivo de 1,4 GB se descarga e incorpora rápidamente a imágenes de contenedor para tests de humo de aplicaciones que consumen modelos de lenguaje.
- Sustitución de un modelo mayor en tareas de clasificación o extracción de texto simple: resúmenes cortos, reescritura de frases o generación de respuestas FAQ donde no se requiere contexto largo ni razonamiento complejo.
- Evaluación comparativa de cuantizaciones: al existir un único Q4_K_M, sirve como referencia para medir la pérdida de calidad frente a los pesos originales en safetensors del modelo base.
- Distribución en entornos con ancho de banda o almacenamiento limitados: 1,4 GB es manejable para imágenes de dispositivo, USB o instaladores de aplicaciones de escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y la búsqueda web realizada no ha devuelto documentación técnica del modelo base ni de esta cuantización: los resultados obtenidos corresponden a la marca de moda Tory Burch y al término político «tory», sin relación con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2-3 GB con el archivo Q4_K_M (1,4 GB de pesos más caché KV y overhead del runtime para contextos moderados). Cifra orientativa, no medida por el autor.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM; por ejemplo GTX 1650, RTX 3050, RTX 4060. En GPUs de 8 GB o más (RTX 3060 Ti, RTX 4070) el modelo cabe holgadamente y permite contextos mayores.
- Cabe en GPU de consumo: sí, en prácticamente toda la gama actual y en bastantes modelos de generaciones anteriores con 4 GB.
- Ejecución en CPU: viable y es el escenario principal del archivo; un equipo de escritorio convencional puede moverlo con velocidades del orden de decenas de tokens por segundo, si bien no se han publicado mediciones oficiales.
- Opciones de despliegue: llama.cpp, Ollama (mediante Modelfile apuntando al GGUF), LM Studio, koboldcpp, llama-cpp-python. vLLM y TGI no son la vía natural para GGUF y no hay soporte documentado en este repositorio.
- Latencia y throughput: no disponibles de forma oficial. Como referencia orientativa no verificada, un modelo de este tamaño en Q4_K_M suele quedar en el rango de 10-25 tokens/s en CPU moderna y por encima de 100 tokens/s en GPU dedicada, con gran dependencia del hardware y del contexto.

## Comparativa con modelos similares

Los datos del modelo de esta ficha son incompletos (contexto, idiomas y benchmarks no disponibles), por lo que la comparación se limita a parámetros, licencia y formato. Las cifras de los modelos alternativos son datos públicos de sus respectivas fichas y conviene verificarlas antes de tomar decisiones.

| Modelo | Parametros | Contexto | Licencia | Formatos |
|---|---|---|---|---|
| voin-midm-2.0-mini-gguf (base Mi:dm 2.0 Mini Instruct) | 2,31 B | No disponible | MIT | GGUF (Q4_K_M) |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF |
| Llama 3.2 3B Instruct | 3,21 B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF |
| Gemma 2 2B IT | 2,61 B | 8.192 tokens | Gemma Terms of Use | safetensors, GGUF |

Frente a estas alternativas, la ventaja del modelo de KT es la licencia MIT, más permisiva que las licencias de Llama y Gemma, junto con un tamaño contenido. Las desventajas son la ausencia de documentación técnica, de datos de contexto y de evaluaciones publicadas, además de un ecosistema de herramientas y cuantizaciones mucho menor.

## Limitaciones y advertencias

- El repositorio es un espejo, no el proyecto original: no aporta documentación técnica, plantilla de chat ni garantías de mantenimiento. Puede desaparecer sin aviso.
- Solo se distribuye una cuantización, Q4_K_M. No hay opciones de Q5, Q6, Q8 ni de pesos en safetensors en este repositorio, lo que limita el ajuste fino entre calidad y tamaño.
- No se han publicado benchmarks ni evaluaciones, por lo que el rendimiento real frente a los pesos originales es desconocido; la cuantización de 4 bits introduce degradación, especialmente en matemáticas y código.
- Riesgo de alucinación: previsible en un modelo de 2,3 mil millones de parámetros sin datos de alineación documentados; no es adecuado para tareas que exijan veracidad estricta sin verificación externa.
- Idiomas no documentados: no se puede confirmar el soporte de castellano ni su calidad; el origen del modelo base (KT, Corea del Sur) hace probable un sesgo hacia coreano e inglés, pero es una inferencia no confirmada.
- Longitud de contexto desconocida: no se debe asumir una ventana amplia para conversaciones largas o documentos extensos.
- Sesgos conocidos: no documentados. Al no haber información sobre el dataset de entrenamiento, no es posible evaluar sesgos de género, culturales o políticos.
- Licencia MIT declarada, lo que en principio permite uso comercial, pero la licencia se hereda del modelo original; conviene verificar el archivo LICENSE del repositorio y la ficha de `K-intelligence/Midm-2.0-Mini-Instruct` antes de explotarlo comercialmente.
- Ausencia de soporte documentado de tool calling, agentes o multimodalidad: no planificar arquitecturas que dependan de estas capacidades sin validarlas empíricamente.
- Repositorio sin tracción (0 descargas, 0 likes) y creado y actualizado con 14 segundos de diferencia: no hay señales de mantenimiento ni de revisión por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tory-labs/voin-midm-2.0-mini-gguf
- Modelo base (KT): https://huggingface.co/K-intelligence/Midm-2.0-Mini-Instruct
- Conversión GGUF de referencia: https://huggingface.co/mykor/Midm-2.0-Mini-Instruct-gguf/tree/152690816d5f03763fa32869c651c99a6d7c300f
- Aplicación voin: https://github.com/su-record/voin
