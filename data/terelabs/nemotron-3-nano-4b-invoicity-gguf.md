# terelabs/Nemotron-3-Nano-4B-Invoicity-GGUF

## Resumen

Nemotron-3-Nano-4B-Invoicity-GGUF es una cuantización Q4_K_M del modelo NVIDIA Nemotron 3 Nano 4B, publicada por Tere Labs (terelabs) para su uso como asistente de hojas de cálculo dentro de la aplicación Invoicity. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión a formato GGUF optimizada mediante una matriz de importancia (imatrix) específica del dominio financiero, lo que la diferencia de las cuantizaciones genéricas disponibles del mismo modelo base.

El modelo base es nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16, con 3.973.556.832 parámetros totales (aproximadamente 4B). La cuantización está pensada para ejecutarse en llama.cpp (versión b12611 o posterior) y produce JSON estructurado que la aplicación Invoicity interpreta para generar operaciones sobre hojas de cálculo. El repositorio ocupa 3,2 GB e incluye tanto el archivo GGUF principal como la imatrix utilizada durante la calibración.

La relevancia de esta ficha radica en que documenta un caso de cuantización orientada a una tarea concreta: el autor reporta que su archivo reproduce el plan de acción del modelo BF16 en el 85,0 % de 200 peticiones reservadas, frente al 72,5 % del archivo oficial de NVIDIA, con una divergencia KL menor. Es, por tanto, un ejemplo de cómo la calibración con datos del dominio puede mejorar la fidelidad de una cuantización de 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base NVIDIA Nemotron 3 Nano; la model card menciona proyecciones Mamba-2 `ssm_out` y proyecciones de atención, lo que sugiere una arquitectura híbrida, pero no se detalla) |
| Parametros totales | 3.973.556.832 (aproximadamente 4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (las mediciones de KLD se hicieron con contexto 2048) |
| Tipos de cuantizacion | Q4_K_M (con `ssm_out` y `attn_q/k/v/output` en Q8_0; `ssm_in` y `ffn_up` en Q5_0 por anchura de entrada no múltiplo de 256) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Nemotron Open Model License |
| Formato de pesos | GGUF (llama.cpp), más un archivo `imatrix.gguf` |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo base más allá de referencias indirectas: menciona la proyección de salida Mamba-2 (`ssm_out`) y las proyecciones de atención (`attn_q`, `attn_k`, `attn_v`, `attn_output`), lo que apunta a una arquitectura híbrida con capas de espacio de estados y capas de atención, aunque no se confirma el diseño exacto ni la proporción entre ambos tipos de capa. Tampoco se detallan el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La innovación técnica documentada está en el proceso de cuantización, no en el entrenamiento. El autor construyó una matriz de importancia con 1.416 fragmentos de 512 tokens: aproximadamente dos tercios son peticiones reales de Invoicity (el system prompt de la aplicación, libros de trabajo financieros sintéticos y respuestas BF16 renderizadas con la plantilla de chat del modelo) y el resto es wikitext. A partir de esa imatrix se aplicó una mezcla de tipos de tensor no uniforme: Q8_0 para las proyecciones más sensibles (`ssm_out` y todas las de atención) y Q4_K_M estándar para el resto, con caída a Q5_0 en `ssm_in` y `ffn_up` por incompatibilidad de anchura con el bloque de 256. El resultado es un archivo de 3.153.383.392 bytes, algo mayor que las cuantizaciones Q4_K_M convencionales del mismo modelo.

## Capacidades

- Generación de texto conversacional y salida en JSON estructurado, requisito para que Invoicity parsee la respuesta con su función `interpretReply()`.
- Razonamiento orientado a tareas financieras y de hojas de cálculo, según el dominio de calibración declarado.
- Modo de razonamiento desactivable: las mediciones de referencia se hicieron con `--reasoning off`, lo que implica que el modelo base soporta un modo de razonamiento explícito.
- Ejecución en CPU y GPU mediante llama.cpp b12611 o posterior.
- Compatibilidad con endpoints (tag `endpoints_compatible` en Hugging Face).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Asistente de hojas de cálculo dentro de Invoicity: es el caso de uso para el que se calibró la imatrix. El modelo recibe el system prompt de la aplicación y devuelve un plan de acciones que `interpretReply()` traduce en operaciones sobre el libro; el autor reporta un 85,0 % de coincidencia con el plan del modelo BF16 en 200 peticiones reservadas.
- Generación de JSON financiero estructurado: la calibración con libros de trabajo sintéticos y respuestas BF16 hace que el modelo sea adecuado para producir objetos JSON con campos contables predecibles, consumibles por un backend sin post-procesado complejo.
- Automatización de tareas de contabilidad en local: al ser un GGUF de unos 3,15 GB, puede desplegarse en un portátil o estación de trabajo sin GPU dedicada, lo que encaja en flujos donde los datos financieros no deben salir del equipo.
- Clasificación y extracción de datos de facturas o extractos: el dominio de calibración (finanzas y hojas de cálculo) sugiere buen comportamiento en tareas de extracción de campos, aunque no hay métricas publicadas específicas para esta tarea.
- Prototipado rápido de asistentes de escritorio: la integración con llama.cpp y la licencia del modelo base permiten montar un prototipo funcional en pocas horas con `llama-server` y una plantilla de chat.
- Evaluación comparativa de estrategias de cuantización: el repositorio publica KLD frente a BF16 tanto en el dominio (Invoicity) como en wikitext, lo que lo convierte en un caso de referencia para estudiar el efecto de una imatrix específica frente a cuantizaciones genéricas.
- Despliegue en entornos con CPU únicamente: el autor reporta que la velocidad de procesamiento de prompt y de generación en CPU (llama-bench, 8 hilos) coincide con la del archivo oficial dentro del margen de ruido, por lo que es viable en servidores sin acelerador.

## Benchmarks y rendimiento

Los datos publicados no son benchmarks estándar (MMLU, HumanEval, GSM8K), sino métricas de fidelidad de la cuantización frente al modelo BF16 de referencia, medidas con llama.cpp b12611, `--reasoning off`, temperatura 0 y salida JSON.

| Archivo | Tamano | Mismo plan de accion que BF16 | KLD Invoicity | KLD wikitext |
|---|---|---|---|---|
| Q4_K_M oficial de NVIDIA (sin imatrix) | 2,84 GB | 72,5 % | 0,0093 | 0,0126 |
| Q4_K_M de unsloth | 2,90 GB | 81,5 % | 0,0051 | 0,0079 |
| Q4_K_M de bartowski | 2,98 GB | 82,5 % | 0,0052 | 0,0076 |
| Este archivo (terelabs) | 3,15 GB | 85,0 % | 0,0030 | 0,0053 |

El conjunto de evaluación son 200 peticiones de Invoicity reservadas, sin solapamiento con el conjunto de calibración. La métrica "mismo plan de acción" se calcula parseando la respuesta con `interpretReply()` y comparando las operaciones resultantes con las del BF16. El autor declara que la diferencia frente al archivo oficial es significativa (McNemar exacto, p < 0,001). La KLD se midió sobre las mismas peticiones y sobre el test de wikitext-2, con contexto 2048 y 24 fragmentos.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF pesa 3,15 GB; con overhead de contexto y caché KV, un despliegue típico requiere del orden de 4 a 5 GB de memoria, aunque no se publica una cifra oficial.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cualquier GPU con 6 GB o más de VRAM debería poder cargarlo en Q4_K_M.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 (12 GB), RTX 4060 Ti (8/16 GB), RTX 4070 y superiores; no se confirma en la documentación.
- Despliegue: llama.cpp b12611 o posterior (requisito explícito del autor); el tag `endpoints_compatible` sugiere compatibilidad con servidores de endpoints, pero no se detallan otras opciones como vLLM, TGI u Ollama.
- Latencia y throughput: el autor indica que el procesamiento de prompt y la generación en CPU (llama-bench, 8 hilos) coinciden con el archivo oficial dentro del margen de ruido; no se publican valores absolutos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| terelabs Nemotron-3-Nano-4B-Invoicity (este) | 3,97B | no disponible | GGUF Q4_K_M | NVIDIA Nemotron Open Model License | Imatrix específica de dominio; 85,0 % de coincidencia de plan con BF16 |
| NVIDIA oficial Nemotron 3 Nano 4B Q4_K_M | 3,97B | no disponible | GGUF Q4_K_M | NVIDIA Nemotron Open Model License | Sin imatrix; 72,5 % de coincidencia; 2,84 GB |
| unsloth Nemotron 3 Nano 4B Q4_K_M | 3,97B | no disponible | GGUF Q4_K_M | NVIDIA Nemotron Open Model License | 81,5 % de coincidencia; KLD Invoicity 0,0051 |
| bartowski Nemotron 3 Nano 4B Q4_K_M | 3,97B | no disponible | GGUF Q4_K_M | NVIDIA Nemotron Open Model License | 82,5 % de coincidencia; KLD Invoicity 0,0052 |

Las tres alternativas comparadas son cuantizaciones del mismo modelo base, por lo que la comparación mide exclusivamente la calidad de la receta de cuantización, no diferencias de arquitectura o entrenamiento. No se dispone de comparación con modelos de otros proveedores del mismo tamaño en la información proporcionada.

## Limitaciones y advertencias

- La imatrix está calibrada con datos de Invoicity (system prompt, libros de trabajo financieros sintéticos y wikitext). Fuera de ese dominio, la ventaja frente a otras cuantizaciones Q4_K_M puede reducirse o desaparecer; la KLD en wikitext, aunque también mejor, se midió con la misma receta.
- El archivo es un 10,9 % más grande que el Q4_K_M oficial de NVIDIA (3,15 GB frente a 2,84 GB), lo que implica un mayor consumo de memoria y de disco a cambio de la mejora de fidelidad.
- Requiere llama.cpp b12611 o posterior; versiones anteriores pueden no cargar correctamente los tipos de tensor mixtos (Q8_0 en proyecciones, Q5_0 en `ssm_in` y `ffn_up`).
- El modelo base puede generar contenido incorrecto o alucinado; no se han publicado evaluaciones de sesgo, toxicidad o robustez en la información disponible.
- Idiomas soportados no documentados; no se garantiza un comportamiento adecuado en castellano ni en otros idiomas distintos del inglés.
- La licencia NVIDIA Nemotron Open Model License impone condiciones específicas para uso comercial y para la redistribución de derivados; debe revisarse el PDF enlazado antes de desplegar en producción. Tere Labs declara no estar afiliada a NVIDIA.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 22 de noviembre de 2026; se trata de una publicación muy reciente y sin validación independiente.
- No se documentan las capacidades de tool calling, agentes o multimodalidad del modelo base en esta ficha; conviene consultar la model card de nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 antes de asumirlas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/terelabs/Nemotron-3-Nano-4B-Invoicity-GGUF
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Licencia NVIDIA Nemotron Open Model License: https://www.nvidia.com/content/dam/en-zz/Solutions/license-agreements/enterprise-software/NVIDIA-Nemotron-Open-Model-License-12-12-25.pdf
- llama.cpp (runtime requerido, b12611 o posterior): https://github.com/ggml-org/llama.cpp
