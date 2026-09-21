# thealper2/qwen2.5-0.5b-gsm8k-tr-lora

## Resumen

El modelo `thealper2/qwen2.5-0.5b-gsm8k-tr-lora` es un adaptador LoRA (PEFT) entrenado sobre `Qwen/Qwen2.5-0.5B-Instruct` para resolver problemas matemáticos de enunciado verbal al estilo GSM8K en turco. El autor es el usuario de HuggingFace `thealper2` y el repositorio contiene únicamente los pesos del adaptador (rank 16), no un modelo completo: en inferencia hay que cargar la base de Qwen2.5-0.5B-Instruct y aplicar el adaptador encima con la librería `peft`.

El problema que aborda es concreto: el modelo base de 0,5B parámetros apenas acierta el 5 % de los problemas del conjunto de validación en turco, mientras que el adaptador eleva esa precisión al 15,8 % y reduce la perplejidad de 3,09 a 1,97 sobre la misma muestra. Se trata, por tanto, de una mejora medible pero modesta, coherente con el tamaño del modelo y con la naturaleza de los datos de entrenamiento.

Su relevancia es la de un recurso muy ligero y reproducible: 8,80M de parámetros entrenables sobre 502,83M totales (1,75 %), entrenamiento de 3 épocas con `bfloat16` y un conjunto de datos público de 8.792 filas. Resulta útil como banco de pruebas para investigar ajuste fino eficiente en turco, para experimentos de razonamiento aritmético en modelos pequeños y como componente educativo, más que como motor de cálculo fiable en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención causal agrupada (GQA), RMSNorm y SwiGLU, sobre el modelo base Qwen2.5-0.5B-Instruct; el artefacto publicado es un adaptador LoRA (PEFT) |
| Parámetros totales | 502,83M en el modelo base según la tabla de entrenamiento del autor (Qwen2.5-0.5B-Instruct, ~0,5B); el adaptador LoRA añade 8,80M de parámetros entrenables |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base Qwen2.5-0.5B-Instruct; longitud máxima de secuencia durante el entrenamiento del adaptador: 640 tokens |
| Tipos de cuantización | El adaptador se distribuye en safetensors (entrenado en `torch.bfloat16`); el modelo base admite cuantización a 8 y 4 bits con herramientas habituales (bitsandbytes, GPTQ/AWQ o GGUF mediante llama.cpp, según disponibilidad de la comunidad) |
| Idiomas soportados | Turco (`tr`) para la tarea ajustada; el modelo base Qwen2.5 es multilingüe, pero el ajuste se entrenó y evaluó únicamente en turco |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (adaptador PEFT/LoRA); el modelo base se carga por separado en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-0.5B-Instruct: un transformer decoder-only con atención causal, normalización RMSNorm previa, activación SwiGLU y atención con consultas agrupadas (GQA), con pesos de entrada y salida (`lm_head`) atados. Sobre esa base se entrena un adaptador LoRA de rango 16, alpha 32 y dropout 0,05, con sesgo `none`, aplicado a los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El `lm_head` queda excluido del adaptador precisamente porque los embeddings están atados. La pérdida se calcula solo sobre los tokens del asistente (los del prompt se enmascaran a `-100`), de modo que el modelo no aprende a reproducir el enunciado.

Los datos provienen del conjunto `ytu-ce-cosmos/gsm8k_tr`, con 8.792 filas en un único split `train` upstream; el autor separó 7.870 para entrenamiento y 876 para validación (10 %, semilla 42) sin eliminar duplicados. El formato son soluciones libres en turco, sin el marcador `#### <respuesta>` ni anotaciones de calculadora `<<...>>`, renderizadas con la plantilla de chat oficial de Qwen2.5 (system / user / assistant) y usadas textualmente, sin reescribir ni sintetizar pasos de razonamiento. Hiperparámetros: tasa de aprendizaje 2e-4, scheduler coseno con warmup del 3 %, weight decay 0,01, recorte de gradiente 1,0, 3 épocas, batch efectivo 16 (4 × 4 de acumulación) y precisión `bfloat16`. La longitud máxima se fijó en 640 tokens a partir de la distribución medida (media 265, mediana 253, p90 399, p95 456, p99 589, máximo 916): cubre el 99,48 % de los ejemplos y los sobrantes se descartan en lugar de truncarse, para no eliminar la frase final que contiene la respuesta.

## Capacidades

- Generación de texto conversacional en turco siguiendo la plantilla de chat de Qwen2.5.
- Resolución de problemas matemáticos de enunciado verbal de nivel escolar (estilo GSM8K): suma, resta, multiplicación, división, porcentajes y proporciones simples.
- Producción de razonamiento paso a paso en turco, seguido de la respuesta numérica final, que el autor indica que suele aparecer con marcadores como `Cevap:` o `\boxed{}`.
- Formato de salida consistente si se mantiene el mismo *system prompt* usado en entrenamiento.
- No se documenta soporte de *tool calling* o *function calling* específico para el adaptador.
- No se documenta soporte de agentes ni de razonamiento multi-paso con herramientas.
- No hay capacidades de visión, audio ni *thinking mode*.
- Capacidad multilingüe limitada al comportamiento del modelo base; el ajuste es exclusivamente turco.
- No incluye verificación de resultados con calculadora o solucionador simbólico.

## Casos de uso

- Investigación en ajuste fino eficiente: reproducir el experimento con PEFT sobre un modelo de 0,5B permite estudiar el efecto del rango LoRA, la tasa de aprendizaje o el enmascarado de prompt con un coste de cómputo mínimo.
- Banco de pruebas para evaluación en turco: sirve como línea base para comparar otras estrategias de ajuste (SFT completo, DPO, destilación) sobre el mismo conjunto `gsm8k_tr` y la misma métrica de exactitud de respuesta.
- Generación de material didáctico de matemáticas en turco: el modelo redacta soluciones paso a paso que un docente puede revisar y corregir antes de usarlas en el aula, aprovechando su estilo consistente.
- Prototipado de asistentes educativos en turco: al caber en cualquier GPU de consumo e incluso en CPU, permite validar la experiencia de usuario de un tutor de matemáticas antes de invertir en un modelo mayor.
- Demostraciones y docencia sobre LoRA: el repositorio documenta hiperparámetros, distribución de longitudes y métricas, lo que lo convierte en un ejemplo didáctico completo de un ciclo de ajuste fino.
- Preprocesado o borrador en pipelines de datos turcos: puede generar soluciones candidatas que después se filtran con un verificador simbólico, reduciendo el coste frente a usar un modelo grande en la primera pasada.
- Pruebas de inferencia en entornos con recursos muy limitados (edge, CPU, portátiles sin GPU): el adaptador apenas añade memoria sobre el modelo base de ~0,5B, por lo que es viable en hardware modesto.

## Benchmarks y rendimiento

Evaluación con decodificación greedy (`do_sample=False`, `max_new_tokens=400`) sobre 500 ejemplos de validación retenidos, puntuando ambos modelos exactamente sobre los mismos ejemplos y con el mismo extractor de respuestas:

| Modelo | Pérdida de validación | Perplejidad | Exactitud de respuesta |
|---|---:|---:|---:|
| Base `Qwen/Qwen2.5-0.5B-Instruct` | 1,1266 | 3,09 | 5,00 % |
| Este modelo (LoRA ajustado) | 0,6776 | 1,97 | 15,80 % |

La exactitud de respuesta compara la respuesta numérica final extraída de la generación con la extraída de la solución de referencia turca, con tolerancia 1e-4; el extractor resuelve `\boxed{}`, marcadores explícitos `Cevap:`, fracciones LaTeX, porcentajes y convenciones decimales y de millares tanto turcas como inglesas. La perplejidad se calcula solo sobre tokens del asistente y mide ajuste al estilo de la solución de referencia, no corrección matemática. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K original) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-2 GB en `bfloat16` (modelo base de ~0,5B más caché KV y el adaptador), ~0,5-1 GB en cuantización de 8 bits y ~0,3-0,7 GB en 4 bits.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; cabe con holgura en RTX 3060, RTX 4060, RTX 4090, así como en A100 y H100 (en estas últimas el modelo queda enormemente infrautilizado).
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU para consumidores actuales e incluso en iGPU con memoria compartida suficiente.
- También es viable en CPU con cuantización GGUF mediante llama.cpp; hay que tener en cuenta que el adaptador PEFT requiere fusionarlo con la base antes de exportar a GGUF.
- Opciones de despliegue: `transformers` + `peft` (el camino documentado por el autor), vLLM o TGI tras fusionar el adaptador, llama.cpp/Ollama si se convierte a GGUF. Para el adaptador suelto, `peft` es la vía directa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen2.5-0.5B + LoRA turco) | 502,83M base + 8,80M adaptador | 32.768 tokens en la base; 640 en entrenamiento | 15,80 % de exactitud en 500 ejemplos de validación de `gsm8k_tr` | Apache 2.0 | Adaptador PEFT en HuggingFace |
| `Qwen/Qwen2.5-0.5B-Instruct` (base) | ~0,5B | 32.768 tokens | 5,00 % de exactitud en el mismo conjunto, perplejidad 3,09 | Apache 2.0 | Pesos completos en HuggingFace |
| `Qwen/Qwen2.5-1.5B-Instruct` | ~1,5B | 32.768 tokens | No evaluado en `gsm8k_tr` en la información disponible | Apache 2.0 | Pesos completos en HuggingFace |
| Alternativas ajustadas en turco para GSM8K | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación relevante y con datos verificables es contra el modelo base, ya que el autor evalúa ambos sobre exactamente los mismos 500 ejemplos. Para el resto de alternativas no se han encontrado resultados publicados en la información disponible.

## Limitaciones y advertencias

- Alcance restringido: entrenado solo con problemas verbales de nivel escolar estilo GSM8K. El rendimiento aquí no implica razonamiento matemático general; no cubre álgebra, geometría, demostraciones ni manipulación simbólica.
- Capacidad del modelo: con 0,5B parámetros los errores aritméticos en cadenas largas son frecuentes; una exactitud del 15,8 % sigue siendo baja en términos absolutos.
- Ruido en las etiquetas: aproximadamente el 21 % de las soluciones de `gsm8k_tr` llegan a una respuesta final distinta de la del ítem original en inglés (medido sobre 4.592 filas alineables de forma única). La exactitud reportada mide acuerdo con la referencia turca, no con el GSM8K original.
- Idioma: entrenado y evaluado únicamente en turco; no hay garantía de comportamiento correcto en otros idiomas.
- Sin verificación: la salida no se comprueba con calculadora ni solucionador. No debe usarse para cálculos con consecuencias reales (facturación, dosis, ingeniería, finanzas).
- Riesgo de alucinación: el modelo puede imitar el estilo de una solución paso a paso y producir una respuesta numérica incorrecta con apariencia de plausibilidad; la perplejidad baja no garantiza corrección.
- Dependencia del *system prompt*: el autor advierte que mantener el mismo prompt de sistema usado en entrenamiento mejora la consistencia del formato de salida.
- Licencia: Apache 2.0, permisiva para uso comercial, pero sujeta también a los términos del modelo base Qwen2.5-0.5B-Instruct. El adaptador no incluye los pesos base, que deben obtenerse por separado.
- Adopción nula: el repositorio registra 0 descargas y 0 *likes* en el momento de la consulta, por lo que no hay validación independiente de los resultados publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thealper2/qwen2.5-0.5b-gsm8k-tr-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Conjunto de datos: https://huggingface.co/datasets/ytu-ce-cosmos/gsm8k_tr
- Repositorio de PEFT: https://github.com/huggingface/peft
- Los resultados de la búsqueda web no contienen enlaces relevantes sobre este modelo (las entradas devueltas corresponden a un restaurante de Nueva York y no guardan relación con el artefacto). No se dispone de *paper*, blog técnico ni demo asociados.
