# taronaeo/Qwen3.6-35B-A3B-BE-GGUF

## Resumen

Qwen3.6-35B-A3B-BE-GGUF es una cuantizacion en formato GGUF del modelo Qwen3.6-35B-A3B desarrollado por el equipo Qwen (Alibaba). La particularidad de esta publicacion, obra del usuario taronaeo, es que los pesos han sido convertidos a orden de bytes big-endian (byte-swapped) para poder ejecutarse en sistemas IBM Z y LinuxONE (arquitecturas s390x de las generaciones z15, z16 y z17). No se trata de un modelo nuevo, sino de una redistribucion funcional del original pensada para mainframes.

El modelo base es un transformer multimodal de tipo image-text-to-text con 35.505.251.456 parametros totales, del que se infiere una arquitectura Mixture-of-Experts (MoE) por el sufijo A3B (aproximadamente 3.000 millones de parametros activos por token) y por la presencia de cuantizaciones especificas para expertos como MXFP4_MOE. La familia Qwen3.6 se presenta en la model card como una evolucion centrada en codificacion agentica, razonamiento a nivel de repositorio y preservacion del contexto de razonamiento entre turnos.

La relevancia de esta ficha es doble: por un lado documenta las capacidades del modelo Qwen3.6-35B-A3B; por otro, describe un caso poco habitual de portabilidad a arquitecturas big-endian de mainframe, un nicho donde el ecosistema de inferencia local es muy limitado y donde llama.cpp ofrece soporte mediante compilacion especifica para s390x.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (image-text-to-text); detalles internos no disponibles |
| Parametros totales | 35.505.251.456 |
| Parametros activos | Aproximadamente 3.000 millones (inferido de la nomenclatura A3B; cifra exacta no disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, MXFP4_MOE, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_0, Q5_1, Q5_K_S, Q5_K_M, Q6_K, Q8_0, BF16, mmproj-F16 (proyector multimodal) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (big-endian, byte-swapped para s390x); BF16 en dos partes |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Qwen3.6-35B-A3B mas alla de su naturaleza multimodal (pipeline image-text-to-text) y de la indicacion implicita de Mixture-of-Experts en el nombre (35B totales, 3B activos). La presencia de un fichero mmproj independiente (proyector multimodal F16 de 857,6 MB) confirma que el modelo combina un codificador visual con el decodificador de lenguaje, siguiendo el esquema habitual de la familia Qwen-VL. No se han publicado en la informacion proporcionada datos sobre numero de tokens de entrenamiento, composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La model card del modelo base destaca dos innovaciones de la version 3.6: la mejora en codificacion agentica (flujos de frontend y razonamiento a nivel de repositorio) y la denominada "Thinking Preservation", una opcion que permite retener el contexto de razonamiento de mensajes historicos para reducir la sobrecarga en desarrollo iterativo. Esta publicacion concreta, ademas, aplica una conversion de endianness sobre los tensores para que operen correctamente en CPUs s390x, manteniendo el formato GGUF y la compatibilidad con llama.cpp compilado para esa arquitectura.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Procesamiento de imagen y texto combinados (image-text-to-text) mediante proyector multimodal.
- Razonamiento con modo de pensamiento preservado entre turnos (Thinking Preservation).
- Codificacion agentica: flujos de trabajo de frontend y razonamiento a nivel de repositorio.
- Capacidades multilingues: no se especifican los idiomas concretos en la informacion disponible.
- Soporte de tool calling y function calling: no confirmado explicitamente en la informacion disponible.
- Ejecucion en sistemas IBM Z y LinuxONE (z15, z16, z17) mediante llama.cpp compilado para s390x.
- Compatibilidad declarada con endpoints (tag endpoints_compatible) y uso conversacional.

## Casos de uso

- Inferencia en mainframe IBM Z: despliegue de un LLM multimodal directamente en infraestructura z15, z16 o z17 sin depender de GPUs externas, aprovechando la compilacion de llama.cpp para s390x y los pesos byte-swapped.
- Asistentes conversacionales en entornos regulados: organizaciones con cargas de trabajo consolidadas en LinuxONE pueden ejecutar un modelo de 35B totalmente on-premise, manteniendo los datos dentro del mainframe.
- Analisis de documentos con imagenes en banca o seguros: al ser image-text-to-text, permite procesar capturas, formularios escaneados o diagramas junto a texto explicativo en un unico pipeline.
- Codificacion asistida en repositorios: las mejoras de razonamiento a nivel de repositorio y la preservacion del contexto de pensamiento lo hacen adecuado para tareas iterativas de refactorizacion o generacion de codigo frontend.
- Prototipado en arquitecturas no x86: util para equipos que investigan portabilidad de modelos abiertos a plataformas big-endian, sirviendo como referencia de conversion y validacion.
- Despliegue con requisitos de memoria moderados: las cuantizaciones Q4_K_M (20,2 GB) o IQ4_XS (18,1 GB) permiten ejecutar el modelo en nodos con memoria suficiente sin recurrir a BF16 (66,2 GB).
- Servicio de chat compatible con API de endpoints: al estar marcado como endpoints_compatible, puede integrarse en infraestructuras que consumen APIs estilo OpenAI mediante llama-server.

## Benchmarks y rendimiento

La model card del modelo base referencia una imagen de resultados de benchmarks (qwen3.6_35b_a3b_score.png) y un blog post, pero no se incluyen cifras numericas en la informacion proporcionada. Por tanto:

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada segun cuantizacion (tamano de fichero, requiere memoria adicional para contexto y proyector):
  - Q2_K: 12,3 GB
  - Q3_K_S: 14,5 GB; Q3_K_M: 16,0 GB; Q3_K_L: 17,3 GB
  - IQ4_XS: 18,1 GB; IQ4_NL: 19,0 GB; MXFP4_MOE: 18,9 GB
  - Q4_K_S: 19,0 GB; Q4_K_M: 20,2 GB (recomendada por el autor)
  - Q5_K_S: 22,9 GB; Q5_K_M: 23,6 GB
  - Q6_K: 27,2 GB
  - Q8_0: 35,2 GB
  - BF16: 66,2 GB (dos partes)
  - Proyector multimodal mmproj-F16: 857,6 MB adicionales
- GPU recomendadas: no disponible para esta build; los pesos estan orientados a CPUs s390x (IBM Z / LinuxONE), no a GPU.
- Cabe en GPU consumer: el formato big-endian esta pensado para mainframe; en GPUs x86 convencionales habria que usar la version estandar del modelo base, no esta. Para referencia de tamano, Q4_K_M (20,2 GB) encajaria en GPUs con 24 GB o mas, pero esta build concreta no es la adecuada para ese hardware.
- Opciones de despliegue: llama.cpp compilado para s390x (guia oficial en docs/build-s390x.md) y llama-server con el flag -hf; el modelo base admite Transformers, vLLM, SGLang y KTransformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| taronaeo/Qwen3.6-35B-A3B-BE-GGUF | 35,5 B | ~3 B (inferido) | No disponible | Apache 2.0 | GGUF big-endian | Port para IBM Z / LinuxONE |
| Qwen/Qwen3.6-35B-A3B | 35,5 B | ~3 B (inferido) | No disponible | Apache 2.0 | Safetensors (Transformers) | Modelo base original, compatible con vLLM, SGLang, KTransformers |
| Versiones GGUF little-endian de Qwen3.6-35B-A3B | 35,5 B | ~3 B (inferido) | No disponible | Apache 2.0 | GGUF | Ejecutables en x86/ARM; no disponibles en la informacion proporcionada |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Esta build esta especificamente byte-swapped para s390x; no funcionara correctamente en arquitecturas little-endian (x86, ARM) sin la version estandar del modelo.
- El ecosistema de inferencia en mainframe es limitado: requiere compilar llama.cpp para s390x y no se beneficia de aceleracion GPU convencional.
- Las cuantizaciones Q2_K y Q3_K sufren perdida de calidad significativa segun la propia tabla del autor.
- No se han publicado datos de benchmarks, contexto maximo ni idiomas soportados en la informacion disponible, lo que dificulta evaluar su idoneidad en produccion.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan tasas especificas.
- Sesgos conocidos: no documentados en la informacion disponible.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base y de los componentes multimodales antes de un uso comercial.
- El modelo tiene solo 2 descargas y 0 likes en el momento de la ficha, lo que indica escasa validacion por parte de la comunidad.
- El tamano del repositorio (449,4 GB) refleja la multiplicidad de cuantizaciones; descargar solo el fichero necesario.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/taronaeo/Qwen3.6-35B-A3B-BE-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Guia de compilacion para s390x en llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/docs/build-s390x.md
- Qwen Chat: https://chat.qwen.ai
