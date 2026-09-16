# vtava/functiongemma-270m-it-simple-tool-calling-memory-fusion

## Resumen

FunctionGemma 270M + TinyCeNN Memory Fusion es un checkpoint de investigación publicado por el usuario vtava en Hugging Face, obtenido por ajuste sobre vtava/functiongemma-270m-it-simple-tool-calling, que a su vez pertenece a la familia Gemma 3 (etiqueta gemma3 y referencias explícitas a las capas de ventana deslizante de Gemma 3 en la model card). Conserva los 270 millones de parámetros del modelo original y sustituye únicamente determinadas capas de atención completa por módulos de memoria recurrente TinyCeNN, dejando sin modificar las capas de atención con ventana deslizante.

El objetivo declarado es fusionar memoria recurrente con las capas de atención originales para dotar a un modelo pequeño orientado a function calling de capacidad de retención de estado. Se trata, por tanto, de investigación sobre arquitecturas híbridas y no de un modelo orientado a producción. La model card documenta las capas aceptadas (5, 11 y 17) junto con umbrales de aceptación basados en NMSE, similitud coseno y variación incremental de NLL.

Su relevancia práctica es limitada a día de hoy: el repositorio no registra descargas ni likes, ocupa 0.0 GB (lo que sugiere que los pesos podrían no estar publicados), no declara licencia ni idiomas y no aporta resultados en benchmarks estándar. La búsqueda web no devolvió ninguna fuente relacionada con el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Gemma 3 con fusión de memoria recurrente TinyCeNN en capas de atención completa seleccionadas; las capas de ventana deslizante de Gemma 3 permanecen sin cambios (según la model card) |
| Parametros totales | 270 millones (según el identificador del modelo; no confirmado explícitamente en la model card) |
| Parametros activos | No procede: no es un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (no se declara en el repositorio; presumiblemente sujeta a la del modelo base, sin confirmar) |
| Formato de pesos | no disponible (el tamaño del repositorio figura como 0.0 GB) |
| Modelo base | vtava/functiongemma-270m-it-simple-tool-calling |
| Revision base | 303296b8f3262f08ecdfc6008e94374bbd697d02 |
| Capas aceptadas | 5, 11, 17 |
| Estado declarado | complete |
| Libreria | transformers |
| Tamano del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura parte de un transformer Gemma 3 de 270 millones de parámetros y aplica una fusión de memoria recurrente: solo se reemplazan los anclajes de atención completa originales, mientras que las capas de ventana deslizante de Gemma 3 se mantienen intactas. El módulo añadido se denomina TinyCeNN y se describe como memoria recurrente, pero la model card no detalla su formulación interna, su dimensionalidad ni el mecanismo exacto de fusión. El proyecto de referencia es el repositorio TinyCeNN-LM del autor.

El proceso de selección de capas está gobernado por puertas de aceptación explícitas: NMSE ≤ 0,20, similitud coseno ≥ 0,90, ΔNLL incremental ≤ +0,015 y ΔNLL acumulado ≤ +0,05. La tabla de la model card registra varios intentos por capa, con resultados aceptados y rechazados. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otra fase de alineación posterior. Se menciona un fichero `training/sequential_in_progress.pt` como estado de investigación reanudable que puede contener una capa no aceptada, lo que indica que el entrenamiento se realizó de forma secuencial por capas.

## Capacidades

- Function calling y tool calling: es la capacidad central heredada del modelo base, según el identificador y las etiquetas del repositorio.
- Generación de texto conversacional: el sufijo `-it` del modelo base indica ajuste por instrucciones.
- Memoria recurrente: los módulos TinyCeNN buscan aportar retención de estado entre pasos, aunque no se documenta ningún protocolo de evaluación de memoria de largo plazo.
- Razonamiento multi-paso y uso como agente: no confirmado en la información disponible.
- Capacidades multilingües: no disponibles; no se declara ningún idioma.
- Visión, audio o modalidades adicionales: no disponibles.
- Código y matemáticas: no se aporta ninguna evaluación específica.

## Casos de uso

- Investigación en arquitecturas híbridas atención-memoria recurrente: el modelo sirve como banco de pruebas reproducible para evaluar la sustitución de capas de atención completa por módulos TinyCeNN en un transformer pequeño, con criterios de aceptación medibles (NMSE, coseno, ΔNLL).
- Estudio de compresión de contexto en modelos pequeños: si la memoria recurrente sustituye parcialmente la necesidad de atención completa, permite analizar el compromiso entre coste de atención y retención de información en un modelo de 270 millones de parámetros.
- Prototipado de tool calling en dispositivos con recursos muy limitados: con 270 millones de parámetros, el modelo es candidato para pruebas de function calling en CPU o GPU de gama de entrada, siempre que los pesos estén disponibles y la arquitectura modificada sea cargable.
- Reproducción de experimentos de destilación o sustitución de capas: los umbrales documentados permiten replicar el pipeline de aceptación y comparar variantes por capa (5, 11, 17).
- Base para fine-tuning de agentes con estado persistente: punto de partida para investigar cómo un modelo diminuto mantiene contexto entre llamadas a herramientas sin recurrir a ventanas de contexto grandes.
- Docencia y divulgación técnica: ejemplo didáctico de fusión de memoria recurrente en un transformer, con métricas de aceptación explícitas y artefactos de entrenamiento reanudables.
- Evaluación de riesgos de degradación por modificación arquitectónica: la capa 17 se acepta con un ΔNLL incremental positivo (+0,00713), lo que la convierte en un caso útil para estudiar degradaciones sutiles dentro de umbral.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato cuantitativo publicado es la validación interna de aceptación de capas:

| Capa | Aceptada | NMSE | Coseno | ΔNLL incremental |
|---:|:---:|---:|---:|---:|
| 5 | No | 0,39167 | 0,77734 | -1,94749 |
| 5 | No | 0,24159 | 0,86916 | -1,92459 |
| 5 | Sí | 0,15754 | 0,92262 | -2,06301 |
| 11 | Sí | 0,16000 | 0,92147 | -0,23931 |
| 17 | No | 0,15327 | 0,92281 | +0,07050 |
| 17 | No | 0,11939 | 0,94842 | +0,02532 |
| 17 | Sí | 0,13087 | 0,94070 | +0,00713 |

Puertas de aceptación aplicadas: NMSE ≤ 0,20, coseno ≥ 0,90, ΔNLL incremental ≤ +0,015, ΔNLL acumulado ≤ +0,05. Estas métricas son criterios internos de sustitución de capas, no medidas de calidad del modelo en tareas reales.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir de 270 millones de parámetros, no confirmada por el autor): aproximadamente 0,54 GB de pesos en fp16, 0,27 GB en int8 y 0,14 GB en int4; con activaciones y caché KV, el consumo real se sitúa por encima de esas cifras.
- GPU recomendadas: no requiere GPU de centro de datos. Una RTX 3060, RTX 4090 o similar está sobradamente capacitada; también GPU de gama de entrada con 2-4 GB de VRAM.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU dedicadas actuales, e incluso en CPU en cuantizaciones de 8 o 4 bits.
- Opciones de despliegue: la librería declarada es transformers. El soporte en vLLM, TGI, llama.cpp u Ollama no está confirmado y es dudoso, porque la arquitectura incorpora capas TinyCeNN que los runtimes genéricos probablemente no reconozcan; requeriría conversión a GGUF o implementación específica.
- Latencia y throughput estimados: no disponibles.
- Advertencia de disponibilidad: el repositorio figura con 0.0 GB, por lo que es posible que los pesos no estén publicados y la inferencia no sea viable sin ellos.

## Comparativa con modelos similares

No hay datos de rendimiento publicados que permitan una comparativa funcional. La única comparación posible se limita a la genealogía del modelo:

| Modelo | Relacion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vtava/functiongemma-270m-it-simple-tool-calling-memory-fusion | Este modelo; añade fusión TinyCeNN en capas 5, 11 y 17 | 270 M (según identificador) | no disponible | no disponible | Repositorio de 0.0 GB, 0 descargas |
| vtava/functiongemma-270m-it-simple-tool-calling | Modelo base directo | no disponible | no disponible | no disponible | no disponible |
| Familia Gemma 3 (presunto ancestro, no confirmado en la model card) | Arquitectura de partida | 270 M (variante pequeña, no confirmado) | no disponible | no disponible | no disponible |

No se dispone de alternativas comparables evaluadas con los mismos criterios (NMSE, coseno, ΔNLL) en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: la propia model card lo etiqueta como `research` y describe estados de entrenamiento reanudables; no está validado para producción.
- Pesos posiblemente ausentes: el repositorio declara 0.0 GB, 0 descargas y 0 likes, lo que sugiere que los ficheros de pesos podrían no estar publicados.
- Sin licencia declarada: no se especifica licencia, lo que impide determinar si el uso comercial está permitido; presumiblemente hereda las condiciones del modelo base, pero no está confirmado.
- Sin benchmarks públicos: no hay evaluación en MMLU, HumanEval, GSM8K ni ninguna tarea estándar, ni comparación con alternativas.
- Riesgo de alucinación elevado: por el tamaño (270 M) y la ausencia de evaluación, la fiabilidad factual es incierta.
- Degradación sutil documentada: la capa 17 se acepta con ΔNLL incremental positivo (+0,00713) y ΔNLL acumulado sujeto al umbral de +0,05; la capa 5 requirió varios intentos antes de superar las puertas.
- Estado de entrenamiento resumible: `training/sequential_in_progress.pt` puede contener una capa no aceptada, de modo que reanudar desde ese punto puede producir una variante inconsistente.
- Idiomas no declarados: no es posible asumir cobertura multilingüe ni un rendimiento concreto en castellano.
- Contexto no documentado: no debe asumirse ninguna longitud de ventana concreta, aunque el modelo base pertenezca a una familia con contexto amplio.
- Compatibilidad de despliegue restringida: las capas TinyCeNN dificultan el uso en runtimes de inferencia estándar sin trabajo de integración.
- Metadatos incoherentes: las fechas de creación y actualización del repositorio (15 de septiembre de 2026) son posteriores a la fecha actual, lo que apunta a un error en los metadatos y aconseja extremar la cautela con el resto de campos.
- Sesgos: no evaluados; se heredarían del corpus de preentrenamiento del modelo base, sin auditoría publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vtava/functiongemma-270m-it-simple-tool-calling-memory-fusion
- Modelo base: https://huggingface.co/vtava/functiongemma-270m-it-simple-tool-calling
- Repositorio del proyecto TinyCeNN-LM: https://github.com/vtavakkoli/TinyCeNN-LM
- Búsqueda web: no se encontró ningún resultado relevante sobre el modelo; las únicas coincidencias devueltas correspondían a páginas biográficas de la actriz Romola Garai, sin relación alguna con este modelo.
