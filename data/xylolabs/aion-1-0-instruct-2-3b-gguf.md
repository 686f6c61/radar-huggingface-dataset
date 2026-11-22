# Xylolabs/Aion-1.0-Instruct-2.3B-GGUF

## Resumen

Aion-1.0-Instruct-2.3B-GGUF es la versión cuantizada en formato GGUF del modelo instructivo Aion-1.0-Instruct-2.3B desarrollado por Microsoft (Windows Applied Sciences Group). Se trata de un Small Language Model (SLM) de 2.288.831.488 parámetros (~2,3B) pensado específicamente para inferencia en dispositivo (on-device AI) dentro del ecosistema Windows, orientado a casos de uso de texto y de sistema operativo. Xylolabs se encarga únicamente de la conversión a GGUF y de la generación de las cuantizaciones; no tiene afiliación con Microsoft.

El modelo es relevante porque demuestra que un SLM de poco más de 2B parámetros puede ejecutarse localmente con un consumo de memoria muy bajo (desde ~1 GB en Q2_K hasta ~4,6 GB en F16) manteniendo una ventana de contexto de 32.768 tokens. La publicación incluye además una matriz de importancia y un parche para llama.cpp (`aion-llama.cpp.patch`), necesario porque la arquitectura `aion` no está soportada de serie por la versión estándar de llama.cpp.

La licencia es MIT tanto en los pesos originales como en estas cuantizaciones, lo que facilita su uso comercial. El modelo cubre ocho idiomas (inglés, alemán, español, portugués, italiano, francés, chino y japonés) y está etiquetado como conversacional, con plantilla de chat que requiere `--jinja` en llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `aion` (transformer, según el identificador de arquitectura de llama.cpp; detalles internos no disponibles) |
| Parametros totales | 2.288.831.488 (~2,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (valor usado en los comandos de ejemplo: `-c 32768`) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, IQ4_XS, IQ3_M, Q2_K |
| Idiomas soportados | en, de, es, pt, it, fr, zh, ja |
| Licencia | MIT (copyright Microsoft Corporation) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de que llama.cpp la identifica con el nombre `aion` y requiere un parche específico (`aion-llama.cpp.patch`) para funcionar, lo que indica que se trata de una arquitectura no estándar no incluida en el árbol principal de llama.cpp en el commit de referencia (`e4b620af19f02960dea7a3a81de7c5805aa3a333`). No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

El modelo base está descrito por Microsoft como un SLM fundacional para el ecosistema Windows, optimizado para IA en dispositivo y casos de uso de texto y de sistema operativo. La plantilla de chat incorpora la fecha en el preámbulo del sistema, motivo por el cual es obligatorio usar `--jinja` al ejecutarlo en llama.cpp. En cuanto a las cuantizaciones, Xylolabs publica una matriz de importancia (`Aion-1.0-Instruct-2.3B.imatrix.gguf`) y datos de precisión por tamaño (`accuracy-by-size.csv`), y compara sus resultados con las cuantizaciones de AtomicChat, lo que sugiere un proceso de cuantización cuidado con evaluación de divergencia KL frente a una referencia en transformers f32 sobre pesos BF16.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat que inyecta la fecha actual en el preámbulo del sistema.
- Razonamiento y respuesta a instrucciones en formato instruct (`-Instruct`).
- Capacidades multilingües en ocho idiomas: inglés, alemán, español, portugués, italiano, francés, chino y japonés.
- Orientación a casos de uso de sistema operativo y texto dentro del ecosistema Windows (según la descripción de Microsoft).
- Ejecución local en CPU y GPU mediante llama.cpp, con soporte de offload de capas (`-ngl`).
- Compatibilidad con endpoints (`endpoints_compatible` en los tags de Hugging Face).
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Asistente conversacional local en escritorio: el modelo puede gestionar diálogos multi-turno de hasta 32.768 tokens de contexto ejecutándose íntegramente en la máquina del usuario, sin enviar datos a la nube, lo que encaja con su orientación a IA en dispositivo.
- Integración en aplicaciones Windows: al ser un SLM de 2,3B diseñado por el Windows Applied Sciences Group para casos de texto y sistema operativo, es adecuado para funciones de ayuda contextual, resumen de documentos o generación de texto dentro de aplicaciones de escritorio.
- Despliegue en hardware modesto: con cuantizaciones de 1,01 GB (Q2_K) a 2,44 GB (Q8_0), puede ejecutarse en equipos sin GPU dedicada o con GPU de gama de entrada, sirviendo como asistente embebido en herramientas de línea de comandos vía `llama-cli`.
- Servicio de inferencia ligero con `llama-server`: permite exponer el modelo como API compatible con endpoints en un servidor pequeño, útil para prototipos internos o entornos de desarrollo con recursos limitados.
- Traducción y generación multilingüe: con soporte para ocho idiomas, puede emplearse en tareas de traducción entre pares como inglés-español, alemán-francés o inglés-japonés, así como en generación de contenido localizado.
- Procesamiento por lotes de texto en pipelines de datos: su bajo consumo de memoria permite ejecutar múltiples instancias en paralelo en un solo servidor para tareas de clasificación, resumen o reescritura de texto a gran escala.
- Evaluación e investigación de cuantización: el repositorio incluye matriz de importancia, parche de llama.cpp y datos de divergencia KL, lo que lo convierte en un caso de estudio práctico para investigar el impacto de las cuantizaciones GGUF en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica métricas de fidelidad de cuantización (divergencia KL media y acuerdo top-1) frente a una referencia en transformers f32 sobre pesos BF16, combinando chat y WikiText-2:

| Cuantizacion | Tamano | WikiText-2 KL | top-1 | Chat KL | top-1 | Held-out KL | top-1 |
|---|---:|---:|---:|---:|---:|---:|---:|
| F16 | 4,59 GB | 0,00027 | 98,92% | 0,00019 | 99,25% | 0,00025 | 98,96% |
| Q8_0 | 2,44 GB | 0,00212 | 97,61% | 0,00180 | 98,12% | 0,00238 | 97,25% |
| Q6_K | 2,03 GB | 0,00272 | 97,17% | 0,00292 | 97,65% | 0,00320 | 96,97% |
| Q5_K_M | 1,77 GB | 0,00404 | 96,34% | 0,00388 | 97,30% | 0,00454 | 96,43% |
| Q4_K_M | 1,57 GB | 0,00716 | 95,24% | 0,00656 | 96,46% | 0,00787 | 95,31% |
| Q4_K_S | 1,40 GB | 0,01446 | 93,84% | 0,01298 | 95,16% | 0,01687 | 93,16% |
| IQ4_XS | 1,28 GB | 0,02268 | 92,24% | 0,02136 | 93,87% | 0,02575 | 91,43% |
| IQ3_M | 1,18 GB | 0,04580 | 89,40% | 0,04892 | 90,67% | 0,05419 | 87,92% |
| Q2_K | 1,01 GB | 0,17564 | 79,48% | 0,17004 | 83,64% | 0,20950 | 77,38% |
| AtomicChat AD-Q5_K_M | 1,78 GB | 0,00425 | 96,67% | 0,00521 | 96,90% | 0,00522 | 96,23% |
| AtomicChat AD-Q4_K_M | 1,58 GB | 0,00980 | 94,73% | 0,00908 | 95,90% | 0,01108 | 94,38% |
| AtomicChat AD-IQ3_S | 1,29 GB | 0,04877 | 88,42% | 0,07725 | 88,25% | 0,05785 | 87,46% |
| AtomicChat Q8_0 | 2,44 GB | 0,00212 | 97,61% | 0,00180 | 98,12% | 0,00238 | 97,25% |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del fichero GGUF más el overhead del contexto. F16 requiere ~4,6 GB; Q8_0 ~2,4 GB; Q4_K_M ~1,6 GB; Q2_K ~1,0 GB. Con 32.768 tokens de contexto hay que sumar la memoria de la caché KV, no cuantificada en estos datos.
- GPU recomendadas: cualquier GPU con suficiente VRAM para el quant elegido. Para Q8_0 bastan ~3 GB, por lo que una RTX 3060 (12 GB) o superior (RTX 4070, RTX 4090, A100, H100) funcionan con holgura; en A100/H100 el modelo es pequeño y el rendimiento estará limitado por el ancho de banda más que por la computación.
- Cabe en GPU de consumo: sí. Prácticamente cualquier GPU de consumo moderna puede ejecutar las cuantizaciones Q4_K_M o inferiores; incluso Q8_0 cabe en GPUs de 4 GB o más.
- Ejecución en CPU: viable con llama.cpp, especialmente con quants de 1-2 GB; el modelo está pensado para IA en dispositivo, por lo que es un candidato natural para CPU-only.
- Opciones de despliegue: llama.cpp (obligatorio aplicar `aion-llama.cpp.patch` sobre el commit `e4b620af19f02960dea7a3a81de7c5805aa3a333`), con `llama-server` y `llama-cli`. No se indica compatibilidad con vLLM, TGI ni Ollama en la información disponible. Es necesario pasar `--jinja` para que funcione la plantilla de chat.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de tareas que permitan una comparación de rendimiento con modelos de tamaño similar. La comparación disponible en la información se limita a las cuantizaciones alternativas de AtomicChat sobre el mismo modelo base:

| Modelo / version | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Xylolabs Aion-1.0-Instruct-2.3B-GGUF | 2,3B | 32.768 | MIT | GGUF | Requiere parche de llama.cpp; incluye imatrix y datos de precisión |
| AtomicChat AD-Q4_K_M (mismo base) | 2,3B | 32.768 | MIT | GGUF | Divergencia KL ligeramente superior a la Q4_K_M de Xylolabs (0,00980 frente a 0,00716 en WikiText-2) |
| AtomicChat Q8_0 (mismo base) | 2,3B | 32.768 | MIT | GGUF | Idéntico resultado al Q8_0 de Xylolabs (0,00212 KL, 97,61% top-1) |

Para alternativas de otros desarrolladores del mismo tamaño (por ejemplo, modelos de ~2-3B parámetros de otras familias) no hay datos en la información proporcionada.

## Limitaciones y advertencias

- Requiere un parche no oficial de llama.cpp (`aion-llama.cpp.patch`) aplicado sobre un commit concreto; versiones estándar de llama.cpp, Ollama u otras herramientas no reconocen la arquitectura `aion` de serie.
- Es obligatorio usar `--jinja`; sin ello la plantilla de chat (que inyecta la fecha en el preámbulo del sistema) no se aplica correctamente.
- La cuantización Q2_K muestra una degradación notable (KL de 0,17564 en WikiText-2 y 79,48% de acuerdo top-1), por lo que no es recomendable para producción si la calidad importa.
- No se documentan capacidades de tool calling, agentes, visión ni audio; no debe asumirse su disponibilidad.
- No hay datos publicados de benchmarks de tareas estándar, lo que dificulta evaluar su calidad frente a alternativas.
- Riesgo de alucinación y sesgos: no documentados específicamente en la información disponible; como todo SLM, es probable que presente alucinaciones en tareas de conocimiento factual, pero no hay evaluación publicada.
- Aunque la licencia es MIT (permite uso comercial), el aviso indica que Xylolabs no está afiliada ni respaldada por Microsoft; conviene conservar los ficheros `LICENSE` y `NOTICE` al redistribuir.
- El tamaño del repositorio (17,3 GB) incluye todos los quants y artefactos auxiliares; descargar solo el fichero GGUF necesario.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/Xylolabs/Aion-1.0-Instruct-2.3B-GGUF
- Modelo base original de Microsoft: https://huggingface.co/microsoft/Aion-1.0-Instruct-2.3B
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Parche de llama.cpp para la arquitectura `aion`: https://huggingface.co/Xylolabs/Aion-1.0-Instruct-2.3B-GGUF/resolve/main/aion-llama.cpp.patch
- Matriz de importancia: https://huggingface.co/Xylolabs/Aion-1.0-Instruct-2.3B-GGUF/resolve/main/Aion-1.0-Instruct-2.3B.imatrix.gguf
- Datos de precisión por tamaño: https://huggingface.co/Xylolabs/Aion-1.0-Instruct-2.3B-GGUF/resolve/main/accuracy-by-size.csv
- Licencia: https://huggingface.co/Xylolabs/Aion-1.0-Instruct-2.3B-GGUF/blob/main/LICENSE
