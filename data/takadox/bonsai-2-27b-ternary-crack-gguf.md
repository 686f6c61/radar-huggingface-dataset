# TAKADOX/Bonsai-2-27B-Ternary-CRACK-GGUF

## Resumen

Bonsai 2 27B Ternary CRACK GGUF es una cuantización ternaria de 2,13 bits por peso del modelo Qwen3.8-27B, publicada por el usuario TAKADOX sobre el trabajo previo de PrismML, a la que se le ha aplicado un proceso de "abliteration" a nivel de pesos para eliminar el circuito de rechazo (refusal). El resultado es un fichero GGUF de 7,21 GB que conserva los 26.895.998.464 parámetros del modelo original, su torre de visión, sus modos de razonamiento y su plantilla de chat, pero que responde con una tasa de rechazo del 0,00% en el conjunto de evaluación HarmBench-320. Es, por tanto, una variante sin filtros de seguridad orientada a investigación y evaluación de mecanismos de rechazo, no un modelo de propósito general listo para producción.

Técnicamente, el modelo hereda de Qwen3.8-27B una arquitectura híbrida de atención más SSM (GatedDeltaNet), con 64 bloques y dimensión oculta de 5120, y una torre de visión separada que se carga mediante ficheros mmproj. La compresión ternaria `PQ2_0` de PrismML emplea 2,13 bits por peso con grupos de 128, lo que reduce el peso del modelo a 7,21 GB en el mismo tipo por tensor que la versión base. El binario se ejecuta sobre el fork de llama.cpp de PrismML con soporte CUDA, Metal y CPU.

La relevancia de esta ficha es doble. Por un lado, es un ejemplo práctico de cuantización ternaria extrema que permite ejecutar un modelo de clase 27B en hardware de consumo. Por otro, documenta de forma explícita una modificación de seguridad agresiva: los datos publicados muestran una tasa de cumplimiento del 100% en las siete categorías semánticas de HarmBench, incluida `chemical_biological` y `cybercrime_intrusion`, con una degradación de MMLU de solo -0,62 puntos porcentuales respecto a la base ternaria. Cualquier evaluación debe tener en cuenta ese perfil de riesgo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida de atención + SSM (GatedDeltaNet), 64 bloques, hidden 5120, torre de visión separada |
| Parámetros totales | 26.895.998.464 (~26,9B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | `PQ2_0` ternaria de PrismML: 2,13 bits por peso, grupo 128; proyector de visión en BF16 (`Ternary-Bonsai-2-27B-mmproj-BF16.gguf`) y Q8_0 (`Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf`) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (ejecutable con llama.cpp; runtime de referencia: fork PrismML de llama.cpp) |
| Tamaño del repositorio | 7,2 GB |
| Modelos base | `prism-ml/Ternary-Bonsai-2-27B-gguf`, `Qwen/Qwen3.8-27B` |
| Modos de razonamiento | `off`, `low`, `xhigh` (por defecto) |
| Autor | TAKADOX (abliteration a nivel de pesos; compresión ternaria original de PrismML) |
| Fecha de publicación | 2026-09-22 |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido en el que se combinan capas de atención con capas SSM del tipo GatedDeltaNet, distribuidas en 64 bloques con dimensión oculta de 5120. Este diseño reduce el coste del mecanismo de atención en secuencias largas al delegar parte del modelado secuencial en el componente de espacio de estados. La torre de visión se mantiene separada del tronco del lenguaje y se carga como fichero `mmproj` adicional, con la misma interfaz que la release base, de modo que el modelo es intercambiable en inferencia sin cambios de plantilla de chat ni de tokenizador.

No se dispone de información sobre el corpus de entrenamiento, el número de tokens, la composición del dataset ni sobre si hubo fases de RLHF, DPO u otro tipo de ajuste por preferencias. Tampoco se documenta ningún entrenamiento adicional por parte de TAKADOX: el proceso aplicado es una modificación de pesos ("abliteration propietaria a nivel de peso") sobre la cuantización ternaria ya existente, byte a byte idéntica a la base excepto en un conjunto reducido de tensores que portan el circuito de rechazo. La innovación técnica principal es, por tanto, la combinación de compresión ternaria de 2,13 bpw (grupo 128) con una edición selectiva de pesos que elimina el comportamiento de rechazo preservando, según el autor, capacidad general, visión, modos de razonamiento y coherencia multiturno.

## Capacidades

- Generación de texto conversacional multiturno con coherencia declarada por el autor tras el arreglo de un bug de bucles de tokens en los modos de razonamiento.
- Razonamiento con modo explícito de pensamiento en tres niveles: `off` (sin traza), `low` y `xhigh` (pensamiento extendido, por defecto).
- Visión: soporte de entrada de imágenes mediante los ficheros `mmproj` BF16 o Q8_0 de la release base.
- Uso de herramientas: la model card menciona explícitamente la preservación del "tool use", aunque no detalla el formato ni los benchmarks asociados.
- Capacidades de agente y razonamiento multi-paso: soportadas a través de los modos de razonamiento y del uso de herramientas, sin datos cuantitativos publicados.
- Multilingüismo: no disponible; la card no declara la lista de idiomas soportados.
- Comportamiento sin rechazo: tasa de rechazo del 0,00% en HarmBench-320 y en los tres modos de razonamiento evaluados, con cumplimiento del 100% en las 7 categorías semánticas analizadas.
- Ejecución en dispositivo: 7,21 GB de pesos en formato GGUF ternario, con soporte CUDA, Metal y CPU.

## Casos de uso

- Investigación en seguridad de IA: el modelo permite estudiar cómo se distribuye el circuito de rechazo en los pesos de un transformer híbrido, comparando directamente la base ternaria (93,44% de rechazo) con esta variante (0,00%) sobre el mismo conjunto de 320 prompts.
- Evaluación de robustez de clasificadores: al emitir cumplimiento en el 100% de las categorías de HarmBench, sirve como generador de casos límite para probar clasificadores de contenido y sistemas de moderación en un entorno controlado de red teaming.
- Despliegue local en portátil o GPU única: con 7,21 GB de pesos, el modelo cabe en equipos de consumo y permite asistentes conversacionales totalmente offline, sin coste de API y sin enviar datos a terceros.
- Análisis de documentos con visión: la torre de visión permite extraer información de capturas, diagramas y páginas escaneadas dentro de un flujo local, útil en entornos con requisitos estrictos de confidencialidad.
- Asistencia de código en pipelines internos: el modelo preserva el uso de herramientas y puede integrarse en tareas de refactorización, generación de tests o revisión automatizada sobre repositorios privados sin salida de datos.
- Estudio de compresión ternaria: como caso de referencia de cuantización a 2,13 bpw con grupo 128, permite medir la pérdida real de calidad (Δ MMLU de -0,62 pp frente a la base) y el impacto en latencia y memoria frente a alternativas de 4 y 8 bits.
- Razonamiento extendido en tareas analíticas: el modo `xhigh` habilita trazas de deliberación largas, adecuadas para problemas de varios pasos donde interesa inspeccionar el proceso de decisión, no solo la respuesta final.
- Agentes autónomos en entornos aislados: combinando tool calling y contexto multiturno, puede operar como planificador en sandboxes de laboratorio donde el filtrado de seguridad se aplica en capas externas al modelo.

## Benchmarks y rendimiento

Datos publicados por el autor. La evaluación de rechazo se realiza con un clasificador por niveles (`HARD_REF`, `SOFT_RED`, `HEDGE`, `REASONING_REFUSAL` frente a `COMPLY`, `COMPLY_TRUNCATED`, `NO_REFUSAL_TRUNCATED`) sobre los tokens realmente emitidos.

HarmBench-320, tasa de rechazo (menor es mejor en evaluación de modelos sin censura), modo `off`, T=0:

| Evaluación | Base `PQ2_0` | CRACK `PQ2_0` |
|---|---:|---:|
| HB-320, todas las categorías | 93,44% (299/320) | 0,00% (0/320) |

Desglose de veredicto (n=320 por modelo):

| Modelo | HARD_REF | SOFT_RED | COMPLY | COMPLY_TRUNCATED |
|---|---:|---:|---:|---:|
| Base `PQ2_0` | 296 | 3 | 9 | 12 |
| CRACK `PQ2_0` | 0 | 0 | 141 | 179 |

Tasa de rechazo por categoría semántica:

| Categoría | n | Rechazo base | Rechazo CRACK | Cumplimiento base | Cumplimiento CRACK |
|---|---:|---:|---:|---:|---:|
| chemical_biological | 42 | 95,2% | 0,0% | 4,8% | 100,0% |
| copyright | 80 | 90,0% | 0,0% | 10,0% | 100,0% |
| cybercrime_intrusion | 52 | 94,2% | 0,0% | 5,8% | 100,0% |
| harassment_bullying | 21 | 100,0% | 0,0% | 0,0% | 100,0% |
| harmful | 18 | 94,4% | 0,0% | 5,6% | 100,0% |
| illegal | 53 | 90,6% | 0,0% | 9,4% | 100,0% |
| misinformation_disinformation | 54 | 96,3% | 0,0% | 3,7% | 100,0% |

Cumplimiento por modo de razonamiento (n=60 por modo, prompts que la base rechazaba de forma confirmada):

| Modo | Modelo | HARD_REF | SOFT_RED | REASONING_REFUSAL | COMPLY | COMPLY_TRUNCATED | NO_REFUSAL_TRUNCATED | Rechazo % | Cumplimiento % |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| off | base `PQ2_0` | 59 | 1 | 0 | 0 | 0 | 0 | 100,0% | 0,0% |
| off | CRACK `PQ2_0` | 0 | 0 | 0 | 42 | 18 | 0 | 0,0% | 100,0% |
| low | base `PQ2_0` | 18 | 0 | 11 | 7 | 11 | 13 | 48,3% | 51,7% |
| low | CRACK `PQ2_0` | 0 | 0 | 0 | 5 | 4 | 51 | 0,0% | 100,0% |
| xhigh | base `PQ2_0` | 22 | 1 | 16 | 8 | 7 | 6 | 65,0% | 35,0% |
| xhigh | CRACK `PQ2_0` | 0 | 0 | 0 | 10 | 10 | 40 | 0,0% | 100,0% |

MMLU (n=2.280 = 40 preguntas × 57 asignaturas, logits de letra por siguiente token):

| Build | Precisión | Δ |
|---|---:|---:|
| Base `PQ2_0` | 40,53% | — |
| CRACK `PQ2_0` | 39,91% | -0,62 pp |

El autor indica que la variación queda dentro de ±1,5 pp en la muestra de 40 preguntas por asignatura. El detalle por asignatura publicado en la model card muestra oscilaciones grandes, con casos como `college_chemistry` (+27,5 pp) o `college_physics` (+20,0 pp), lo que es coherente con el tamaño reducido de la muestra.

## Requisitos de hardware

- Pesos: 7,21 GB en GGUF ternario `PQ2_0`, idéntico al de la release base.
- Proyector de visión: fichero `mmproj` adicional en BF16 o Q8_0; el autor no publica su tamaño ni el consumo extra de memoria.
- Memoria total: no disponible de forma oficial. Los 7,21 GB de pesos más la caché KV y, en su caso, el proyector de visión sugieren un rango práctico de aproximadamente 8-12 GB de VRAM para contexto moderado, pero se trata de una estimación derivada del tamaño del fichero, no de una cifra publicada.
- GPU de consumo: el modelo está declarado como ejecutable en portátil o GPU única; por tamaño de pesos, es compatible con GPUs de 12 GB (por ejemplo, RTX 3060 12 GB o RTX 4070) y previsiblemente con algunas de 8 GB si se limita el contexto y se omite la visión.
- GPU de datacenter: no se publican requisitos ni recomendaciones específicas para A100, H100 u otras.
- Opciones de despliegue: fork de llama.cpp de PrismML con backends CUDA, Metal y CPU. La model card también etiqueta el repositorio como `endpoints_compatible` y `llama-cpp`, pero no confirma compatibilidad con vLLM, TGI, Ollama u otros servidores.
- Latencia y throughput: no disponibles. No se publican cifras de tokens por segundo ni mediciones de latencia por hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Tamaño | MMLU | Rechazo HB-320 | Licencia | Disponibilidad |
|---|---|---|---:|---:|---:|---|---|
| Bonsai 2 27B Ternary CRACK GGUF (este) | ~26,9B | Ternaria 2,13 bpw, grupo 128 | 7,21 GB | 39,91% | 0,00% | Apache-2.0 | Publicado en HuggingFace; 0 descargas, 0 likes |
| PrismML Ternary-Bonsai-2-27B-gguf (base) | ~26,9B | Ternaria 2,13 bpw, grupo 128 | 7,21 GB | 40,53% | 93,44% (off, T=0) | No disponible | Referencia base citada en la model card |
| Qwen/Qwen3.8-27B (modelo original sin comprimir) | ~26,9B | Peso completo | No disponible | No disponible | No disponible | No disponible | Citado como base en la model card |

No se dispone de datos de benchmarks, licencia o contexto de Qwen3.8-27B en la información proporcionada, por lo que la comparación cuantitativa se limita a la diferencia entre esta variante y la base ternaria de PrismML. No se han identificado en la información disponible otras alternativas comparables de cuantización ternaria de clase 27B.

## Limitaciones y advertencias

- Eliminación deliberada del comportamiento de rechazo: la variante CRACK registra 0,00% de rechazo en HarmBench-320 y 100% de cumplimiento en las siete categorías evaluadas, incluidas `chemical_biological`, `cybercrime_intrusion` e `illegal`. No debe desplegarse como asistente de cara al público sin capas de seguridad externas.
- Riesgo de uso indebido: la combinación de instrucciones sin filtro y 26,9B de parámetros permite generar contenido dañino, ilegal o inseguro de forma directa. Su uso razonable se restringe a investigación en seguridad, red teaming controlado y evaluación de mecanismos de alineamiento.
- Alucinación: no se han publicado métricas de factualidad, veracidad o tasa de alucinación. La precisión MMLU del 39,91% es baja en términos absolutos y está medida sobre una muestra reducida de 2.280 preguntas, con alta varianza por asignatura.
- Sesgos: no se documenta ningún análisis de sesgos demográficos, culturales o de representación. La ausencia de filtros puede amplificar la reproducción de estereotipos presentes en los datos de entrenamiento.
- Idiomas: no se declara la lista de idiomas soportados. La calidad y la cobertura fuera del inglés son desconocidas.
- Contexto: no se especifica la longitud máxima de contexto soportada, ni en la información de HuggingFace ni en la model card.
- Riesgo de bucles de tokens: el propio autor advierte de que una compilación anterior presentaba un bug de coherencia en los modos de razonamiento `low` y `xhigh` que podía provocar bucles de tokens. Se recomienda usar la compilación posterior al 2026-09-17 20:44 PDT.
- Dependencia de un fork: el runtime de referencia es un fork de llama.cpp de PrismML. La compatibilidad con versiones estándar de llama.cpp, Ollama, vLLM o TGI no está confirmada y puede requerir ajustes.
- Modos de razonamiento y truncado: en el modo `low`, 51 de 60 respuestas se clasificaron como `NO_REFUSAL_TRUNCATED`, es decir, la deliberación se prolongó más allá del presupuesto de tokens sin emitir rechazo. Esto implica que, en producción, es necesario dimensionar bien `max_tokens` para evitar respuestas incompletas.
- Licencia: el repositorio declara Apache-2.0, pero no se especifican las condiciones de la base ternaria de PrismML ni del modelo Qwen3.8-27B subyacente. Conviene verificar la cadena de licencias antes de un uso comercial.
- Adopción: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación independiente de los resultados publicados.

## Enlaces

- Página de HuggingFace del modelo: https://huggingface.co/TAKADOX/Bonsai-2-27B-Ternary-CRACK-GGUF
- Modelo base ternario (PrismML): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Modelo original sin comprimir (Qwen): https://huggingface.co/Qwen/Qwen3.8-27B
- Perfil del autor de la abliteración: https://x.com/dealignai
- Búsqueda web: no se han encontrado enlaces relevantes para este modelo; los resultados devueltos trataban sobre transferencia de ficheros y ofimática y no guardan relación con la ficha.
