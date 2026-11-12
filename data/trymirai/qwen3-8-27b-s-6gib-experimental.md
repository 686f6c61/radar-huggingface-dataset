# trymirai/Qwen3.8-27B-S-6GiB-experimental

## Resumen

Qwen3.8-27B-S-6GiB-experimental es una cuantizacion experimental del modelo base Qwen/Qwen3.8-27B, publicada por el usuario independiente trymirai bajo el identificador trymirai/Qwen3.8-27B-S-6GiB-experimental. Se trata de una compresion agresiva orientada a reducir el peso en disco y en memoria, con tecnicas de cuantizacion de 2 bits y 8 bits segun los tags del repositorio, y con el objetivo declarado de que el resultado pueda ejecutarse en un espacio cercano a los 6 GiB. El repositorio incluye los tags "uzu" y "mirai", que no corresponden a ningun formato de cuantizacion estandar ampliamente documentado, por lo que debe tratarse como un artefacto de investigacion sin garantias de compatibilidad con runtimes convencionales.

El dato mas relevante para evaluar el artefacto es la discrepancia entre el nombre del modelo y el contenido real de los pesos: el modelo base se anuncia como de 27B parametros, pero el recuento real de parametros en los ficheros safetensors es de 6.365.062.938 (aproximadamente 6,37 mil millones). Esto sugiere que la publicacion no es una mera cuantizacion del modelo original, sino una version podada o destilada, o bien que el nombre del modelo base no se corresponde con su tamano real. En cualquier caso, el consumidor debe verificar los pesos antes de asumir capacidades propias de un modelo de 27B.

La relevancia de esta ficha es acotada: se trata de un experimento con 6 descargas y 0 likes en el momento de la consulta, acceso restringido y sin documentacion de benchmarks, idiomas ni proceso de entrenamiento. Resulta util como referencia de tecnicas de compresion extrema, pero no como candidato para produccion sin una evaluacion propia exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda del modelo base Qwen/Qwen3.8-27B; no se documenta en el repositorio) |
| Parametros totales | 6.365.062.938 (segun safetensors); el nombre indica 27B, discrepancia no aclarada |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2-bit y 8-bit (segun tags); formato propietario "uzu"/"mirai" no documentado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con esquema de cuantizacion propio) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna en la documentacion proporcionada. El modelo se declara como derivado de Qwen/Qwen3.8-27B, por lo que la topologia subyacente corresponderia a la familia Qwen3, pero el repositorio no detalla numero de capas, dimensiones ocultas, mecanismo de atencion ni si incorpora componentes MoE. Tampoco se especifica si el proceso de compresion incluye poda estructurada, destilacion o unicamente cuantizacion de pesos, lo que impide determinar si el recuento de 6,37B parametros corresponde a un modelo podado o a un error de etiquetado.

Respecto al entrenamiento, no hay informacion sobre volumen de tokens, composicion del dataset, fases de preentrenamiento, ajuste supervisado o alineacion mediante RLHF/DPO. Los tags "uzu" y "mirai" apuntan a un pipeline de cuantizacion propio del autor, sin paper ni repositorio de codigo enlazado en la informacion disponible. Cualquier afirmacion sobre innovaciones tecnicas como decodificacion especulativa, atencion lineal o kernels especializados seria especulativa y no debe asumirse.

## Capacidades

- Generacion de texto: el pipeline declarado es text-generation, por lo que la funcionalidad basica esperada es la generacion autoregresiva de texto.
- Razonamiento y codigo: no disponible; no se documenta ninguna evaluacion ni capacidad especifica, y la compresion a 2 bits suele degradar tareas de razonamiento y codigo de forma significativa.
- Tool calling / function calling: no disponible; no se declara soporte.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se declara soporte.
- Capacidades multilingues: no disponible; el campo de idiomas no esta cumplimentado en el repositorio.
- Capacidades especiales (modo thinking, vision, audio): no disponible; no se declara ninguna.
- Ejecucion en memoria reducida: la unica capacidad diferencial documentada es el objetivo de compresion hacia ~6 GiB, segun el nombre del repositorio.

## Casos de uso

- Experimentacion con cuantizacion extrema: el artefacto sirve para estudiar el impacto de la cuantizacion a 2 bits sobre un modelo base, midiendo la degradacion de perplejidad y de tareas generativas frente al original. Es adecuado por su tamano reducido y su licencia permisiva, no por su calidad final.
- Investigacion sobre poda y destilacion: dado el recuento real de 6,37B parametros frente a los 27B nominales, el modelo permite analizar tecnicas de reduccion de parametros y comparar la calidad retenida, siempre que se disponga del modelo base para la comparacion.
- Pruebas de infraestructura de inferencia en entornos con poca VRAM: con un peso objetivo de ~6 GiB, puede utilizarse para validar pipelines de despliegue en GPUs de gama media o en CPU, verificando compatibilidad de runtimes antes de invertir en modelos mayores.
- Educacion y demostraciones: util para explicar en talleres como funciona la cuantizacion y que compromisos introduce, dado que el modelo es pequeno en disco y de acceso controlado pero gratuito.
- Evaluacion de riesgos de artefactos no documentados: sirve como caso practico para formar a equipos en la verificacion de pesos, licencias y procedencia antes de adoptar un modelo de Hugging Face.
- Prototipado interno sin requisitos de calidad estrictos: para generar texto de relleno o datos sinteticos de baja criticidad donde la fidelidad no sea un requisito, siempre que la licencia Apache 2.0 y las condiciones de acceso lo permitan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en safetensors de aproximadamente 6,37B parametros y cuantizacion mixta de 2 y 8 bits, el peso en disco y en memoria deberia situarse en el entorno de los 6 GiB indicados en el nombre, mas overhead de activaciones y cache KV.
- GPUs recomendadas: no disponible; al no documentarse el runtime compatible, no puede confirmarse el soporte en A100, H100 ni RTX 4090. Por tamano, cabria esperar ejecucion en GPUs consumer con 8-12 GB de VRAM, pero la compatibilidad del formato "uzu" es la incognita principal.
- Cabe en GPU consumer: probablemente si por tamano (gama RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 en adelante), condicionado a que exista un runtime que cargue el formato propietario.
- Opciones de despliegue: no disponible. No se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI; el tag "uzu" sugiere un cargador propio no estandar.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| trymirai/Qwen3.8-27B-S-6GiB-experimental | 6,37B reales (27B nominales) | no disponible | Apache 2.0 | Gated, 6 descargas | Cuantizacion experimental 2/8-bit, formato no estandar |
| Qwen/Qwen3.8-27B (modelo base) | 27B nominales | no disponible | no disponible en esta ficha | Publico en Hugging Face | Referencia de calidad original; requiere mas VRAM |
| Alternativas de ~7B cuantizadas a 4 bits (familia Qwen/Llama) | ~7B | 8K-128K segun modelo | Apache 2.0 o similar | Amplia | Formatos GGUF/AWQ estandar, soporte en llama.cpp y vLLM |

La comparativa con modelos de la misma categoria es limitada porque no se dispone de datos de rendimiento del artefacto. Frente a una cuantizacion estandar a 4 bits de un modelo de ~7B, este repositorio ofrece un peso similar pero con un esquema de compresion mas agresivo (2 bits) y sin runtime documentado, lo que reduce su utilidad practica.

## Limitaciones y advertencias

- Discrepancia critica de parametros: el nombre indica 27B pero los safetensors contienen 6,37B; no debe asumirse el comportamiento de un modelo de 27B.
- Cuantizacion a 2 bits: este nivel de compresion degrada de forma notable la coherencia, el razonamiento y la fidelidad factual; se espera una tasa de alucinacion elevada y no medida.
- Formato propietario: los tags "uzu" y "mirai" no corresponden a formatos estandar; la carga puede requerir codigo del autor no incluido en la informacion.
- Acceso restringido: el repositorio es gated y exige aceptar condiciones, lo que anade friccion y puede limitar la reproducibilidad.
- Falta de documentacion: sin model card detallada, sin idiomas declarados, sin benchmarks y sin descripcion del dataset; imposible evaluar sesgos o cobertura linguistica.
- Riesgo de sesgos: al desconocerse los datos de entrenamiento y el proceso de alineacion, no puede descartarse la presencia de sesgos del modelo base ni los introducidos por la compresion.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume la responsabilidad de verificar que la cadena de licencias del modelo base y de los datos subyacentes lo permita.
- Madurez: 6 descargas y 0 likes, creado en septiembre de 2026 y actualizado en noviembre de 2026; sin comunidad ni soporte, no recomendable para produccion sin validacion propia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/trymirai/Qwen3.8-27B-S-6GiB-experimental
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper, blog, repositorio de codigo o demo: no disponible en la informacion proporcionada.
