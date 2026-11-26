# TheHerecy/Aesa-1.0-27B-GGUF

## Resumen

Aesa 1.0 27B GGUF es la distribucion cuantizada en formato GGUF del modelo TheHerecy/Aesa-1.0-27B, un ajuste fino mediante QLoRA sobre huihui-ai/Huihui-Qwen3.8-27B-abliterated. El autor lo presenta como un copiloto de estilo Hermes orientado a pruebas de penetracion autorizadas, con un enfasis explicito en la anti-fabricacion: el modelo esta entrenado para admitir cuando no sabe algo y para no inventar CVE, hosts ni salidas de herramientas. Esta version GGUF esta pensada para su uso con llama.cpp y entornos compatibles, y se genera a partir de los pesos BF16 fusionados del autor, no del GGUF del modelo base.

El modelo cuenta con 27.320.697.856 parametros totales (unos 27,3 mil millones) y se distribuye unicamente en dos cuantizaciones de alta precision, Q8_0 (29,0 GB) y Q6_K (22,4 GB). Es un modelo solo de texto, sin proyector de vision, y utiliza la plantilla de chat del modelo base embebida en el propio GGUF. La licencia es Apache-2.0, heredada del modelo base.

La relevancia de esta ficha es doble: por un lado, documenta un ajuste fino especializado en seguridad ofensiva con una politica de honestidad poco habitual en modelos abliterated; por otro, advierte de que se trata de un modelo con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados y con un proceso de entrenamiento muy corto (156 pasos, perdida de entrenamiento reportada de ~6,9), lo que exige cautela antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.8; etiqueta interna qwen3_5) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 y Q6_K |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); pesos BF16 fusionados como origen |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only heredado de huihui-ai/Huihui-Qwen3.8-27B-abliterated, que a su vez procede de la familia Qwen3.8 (etiquetada internamente como qwen3_5 en los metadatos del repositorio). El autor no detalla en la model card la composicion del dataset de entrenamiento, el numero de tokens utilizados ni si hubo fases de RLHF o DPO; solo se especifica el proceso de ajuste: QLoRA con rango 64 y alpha 128, durante 156 pasos (aproximadamente 3 epocas), con una perdida de entrenamiento reportada de ~6,9. El adaptador resultante tiene sha256 `f512853fa589f1069c8255ee3d760a73a6403261356879f1c7c6e3073f4cf451`, y sus pesos se fusionaron en el modelo base para producir los pesos BF16 desde los que se generaron las cuantizaciones.

La innovacion tecnica destacable no esta en la arquitectura, sino en el objetivo del ajuste: un comportamiento de "anti-fabricacion" orientado a que el modelo reconozca sus limites de conocimiento y no invente artefactos tecnicos como CVE, direcciones de host o salidas de herramientas. El proceso de cuantizacion se documento con detalle: Q6_K se obtuvo convirtiendo a GGUF BF16 con `convert_hf_to_gguf.py` y aplicando despues `llama-quantize`; Q8_0 se genero directamente con `convert_hf_to_gguf.py --outtype q8_0` desde los mismos pesos BF16, usando llama.cpp en el commit `0e4e925e`.

## Capacidades

- Generacion de texto conversacional con plantilla de chat del modelo base embebida en el GGUF.
- Asistencia en pruebas de penetracion autorizadas con estilo de copiloto Hermes.
- Comportamiento anti-fabricacion: el modelo esta entrenado para declarar cuando no sabe y para no inventar CVE, hosts ni salidas de herramientas.
- Razonamiento multi-turno en el dominio de seguridad ofensiva.
- Uso exclusivamente de texto: no incluye proyector de vision ni capacidades multimodales.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el autor no declara idiomas.

## Casos de uso

- Planificacion de pruebas de penetracion autorizadas: el modelo actua como copiloto que propone fases de reconocimiento, enumeracion y explotacion sobre entornos con permiso explicito, apoyandose en su entrenamiento especifico de seguridad ofensiva.
- Redaccion de informes de auditoria: gracias a su politica anti-fabricacion, es adecuado para generar secciones de hallazgos donde el modelo debe distinguir entre lo observado y lo no verificado, evitando inventar CVE o evidencias.
- Formulacion y explicacion de comandos de herramientas: puede ayudar a construir y comentar invocaciones de utilidades de seguridad, con la advertencia de que la salida debe validarse siempre en un entorno controlado.
- Analisis de configuraciones y superficies de exposicion: el modelo puede razonar sobre configuraciones descritas en texto y senalar riesgos potenciales, sin acceso a red ni a ejecucion real.
- Formacion y laboratorios: util como asistente en entornos de aprendizaje tipo CTF o laboratorios aislados, donde la honestidad sobre lo que no sabe reduce el riesgo de que el alumno siga instrucciones inventadas.
- Despliegue local con llama.cpp: las cuantizaciones Q6_K y Q8_0 permiten ejecutar el modelo en estaciones de trabajo con suficiente memoria, sin depender de servicios en la nube, lo que encaja con requisitos de confidencialidad en pruebas de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 22,4 GB para Q6_K y 29,0 GB para Q8_0, solo para los pesos; hay que anadir el espacio de cache KV, que depende del contexto configurado y no se ha publicado.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX A6000 para Q8_0; para Q6_K tambien encajan GPUs de 24 GB si se limita el contexto y se gestiona con cuidado la cache KV.
- GPU de consumo: Q6_K puede intentar ejecutarse en una RTX 4090 (24 GB) con contexto reducido u offload parcial a CPU; Q8_0 no cabe en GPUs de consumo de 24 GB sin offload.
- Opciones de despliegue: llama.cpp (formato nativo), y por extension servidores compatibles con GGUF como Ollama o llama-cpp-python; vLLM y TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Aesa 1.0 27B GGUF | 27,3 B | no disponible | Apache-2.0 | GGUF (Q6_K, Q8_0) | Ajuste QLoRA especializado en pentesting autorizado; sin benchmarks publicados |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | no disponible | no disponible | no disponible | no disponible | Modelo base del ajuste; variante abliterated |
| Qwen3.8 27B (familia base) | no disponible | no disponible | no disponible | no disponible | Origen de la arquitectura; datos no confirmados en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo con cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni validacion externa.
- Entrenamiento muy corto (156 pasos, ~3 epocas) con perdida reportada de ~6,9, un valor que no permite garantizar calidad conversacional general.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento en tareas estandar.
- Riesgo de alucinacion: aunque el modelo se entrena explicitamente contra la fabricacion, no existe garantia de que no invente CVE, hosts o salidas de herramientas; toda salida debe verificarse.
- Sesgos conocidos: no documentados por el autor; al derivar de un modelo abliterated, pueden aparecer comportamientos menos filtrados que en el modelo original.
- Limitaciones de contexto e idioma: no se declara longitud de contexto ni lista de idiomas soportados.
- Restricciones de uso: licencia Apache-2.0 permite uso comercial, pero el autor restringe explicitamente el uso a sistemas para los que se tenga autorizacion de prueba.
- Solo texto: no hay soporte de vision ni de audio.
- Las cuantizaciones de alta precision implican requisitos de memoria elevados, lo que limita el despliegue en hardware de consumo.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/TheHerecy/Aesa-1.0-27B-GGUF
- Modelo base del ajuste: https://huggingface.co/TheHerecy/Aesa-1.0-27B
- Modelo base de la arquitectura: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
