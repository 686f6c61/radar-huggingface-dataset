# TokenTinkerer/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-TTQ-GGUF

## Resumen

Esta ficha describe el conjunto de cuantizaciones **TTQ** (TokenTinkerer Quant) del modelo **Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive**, publicado por el usuario TokenTinkerer en Hugging Face. No se trata de un modelo original, sino de una escalera de diez ficheros GGUF derivados de un fine-tune comunitario del modelo base Qwen3.6-35B-A3B. El modelo subyacente es un transformer de tipo Mixture of Experts (MoE) con aproximadamente 34.660 millones de parámetros totales, del que se activan una fracción por token (el nombre "A3B" sugiere unos 3.000 millones de parámetros activos, aunque este dato no se confirma en la información disponible). El fine-tune del que deriva está orientado a conversación sin censura y ajustado con un estilo "aggressive" por el autor HauhauCS.

El problema que resuelve este repositorio es puramente práctico: proporcionar cuantizaciones GGUF optimizadas para llama.cpp con un equilibrio medido entre tamaño, calidad (medida como divergencia KL frente a la referencia Q8_K_P) y velocidad. Cada nivel de la escalera se ha evaluado con el mismo protocolo, la misma máquina y el mismo corpus, y el autor documenta métricas concretas de KLD, perplejidad, RMS y rendimiento en tokens por segundo. Es relevante ahora porque permite ejecutar un modelo MoE de ~35.000 millones de parámetros en hardware de consumo con ficheros de entre 13,46 y 27,10 GiB, manteniendo una calidad relativa verificada.

Una advertencia importante: no existe una versión en precisión completa (F16/BF16) de este fine-tune. Todas las métricas de calidad son relativas al fichero Q8_K_P (~10 bpw) del repositorio original, que actúa simultáneamente como fuente de recuantización y como referencia. Esta limitación afecta a la interpretación absoluta de las cifras de KLD, aunque las comparaciones entre los distintos ficheros del conjunto siguen siendo válidas por compartir la misma referencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en transformer (Qwen3.6) |
| Parámetros totales | 34.660.610.688 (~34,66 mil millones) |
| Parámetros activos | no disponible (el nombre "A3B" sugiere ~3B activos, sin confirmación) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 10 niveles GGUF: IQ3_XXS, IQ3_XS, Q3_K_S, Q3_K_M, IQ4_XS, IQ4_NL, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), con cuantización mediante imatrix |

Detalle adicional de los niveles disponibles:

| Fichero | Tipo declarado | Tamaño (GiB) | bpw | KLD ± | PPL(Q) | RMS Δp | tg128 (tok/s) |
|---|---|---|---|---|---|---|---|
| TTQ-3.33bpw-IQ3_XXS | IQ3_XXS | 13,46 | 3,33 | 0,060539 ± 0,001366 | 6,060 | 7,339 % | 27,07 |
| TTQ-3.51bpw-IQ3_XS | IQ3_XS | 14,16 | 3,51 | 0,051261 ± 0,001194 | 6,094 | 6,757 % | 26,30 |
| TTQ-3.67bpw-Q3_K_S | Q3_K_S | 14,84 | 3,67 | 0,042459 ± 0,001034 | 5,960 | 5,924 % | 36,28 |
| TTQ-3.93bpw-Q3_K_M | Q3_K_M | 15,85 | 3,93 | 0,034379 ± 0,000873 | 5,959 | 5,205 % | 37,41 |
| TTQ-4.18bpw-IQ4_XS | IQ4_XS | 16,90 | 4,19 | 0,025999 ± 0,000740 | 5,944 | 4,520 % | 37,22 |
| TTQ-4.51bpw-IQ4_NL | IQ4_NL | 18,20 | 4,51 | 0,018427 ± 0,000634 | 5,896 | 3,789 % | 53,86 |
| TTQ-4.90bpw-Q4_K_M | Q4_K_M | 19,76 | 4,90 | 0,015152 ± 0,000886 | 5,902 | 3,415 % | 53,36 |
| TTQ-5.59bpw-Q5_K_S | Q5_K_S | 22,54 | 5,59 | 0,011316 ± 0,000672 | 5,879 | 3,115 % | 48,65 |
| TTQ-6.06bpw-Q5_K_M | Q5_K_M | 24,45 | 6,06 | 0,007621 ± 0,000252 | 5,868 | 2,501 % | 48,38 |
| TTQ-6.72bpw-Q6_K | Q6_K | 27,10 | 6,72 | 0,005800 ± 0,000218 | 5,872 | 2,173 % | 45,46 |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture of Experts (MoE) denominado Qwen3.6-35B-A3B, con 34.660 millones de parámetros totales. El sufijo "A3B" indica, por convención de nomenclatura de la familia Qwen, que aproximadamente 3.000 millones de parámetros se activan por token, si bien esta cifra no aparece de forma explícita en la información proporcionada. El fine-tune HauhauCS-Aggressive modifica el comportamiento del modelo base hacia un modo conversacional sin censura y con un estilo de respuesta más directo o agresivo; los detalles concretos del dataset de ajuste, el número de tokens empleados, la composición de los datos y si se aplicaron técnicas de RLHF o DPO no están disponibles.

La innovación técnica de este repositorio no reside en el modelo, sino en el proceso de cuantización. El autor emplea cuantización con matrices de importancia (imatrix) para construir diez niveles GGUF, cada uno con un tipo de fichero declarado (`general.file_type`) deliberadamente distinto y monotónico. Esta elección evita que el selector de descargas de Hugging Face colapse ficheros con el mismo tipo declarado, garantizando que los diez niveles permanezcan descargables individualmente. Además, el etiquetado `<bpw>bpw` refleja la tasa real medida a partir del recuento de bytes del fichero final, no el tipo nominal, que en varios casos subestima deliberadamente la tasa real (por ejemplo, el fichero IQ3_XXS es en realidad 3,33 bpw frente a los 3,06 bpw que implica la etiqueta). Cada nivel se ha evaluado con KLD frente a los logits de Q8_K_P sobre 40 fragmentos fijos de un conjunto interno, con RMS Δp medido como diferencia en la probabilidad asignada al siguiente token real.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a diálogo sin restricciones de contenido (uncensored).
- Razonamiento general y respuesta a instrucciones, heredado del modelo base Qwen3.6-35B-A3B.
- Capacidades multilingües limitadas a inglés (en) y chino (zh) según la model card.
- Ejecución local mediante llama.cpp, con soporte de decodificación en CPU para expertos (`-ncmoe`) y offloading parcial.
- No se documenta soporte de tool calling, function calling ni agentes multi-paso en la información disponible.
- No se documenta modo de razonamiento extendido (thinking mode), visión ni audio.
- Compatible con endpoints (etiqueta `endpoints_compatible`) para despliegue como servicio de generación de texto.

## Casos de uso

- **Despliegue local en estaciones de trabajo con GPU de consumo**: el nivel Q4_K_M (19,76 GiB) permite ejecutar un MoE de ~35.000 millones de parámetros con la mayoría de expertos en CPU y atención en GPU, usando llama.cpp con `-ncmoe` para repartir capas. Adecuado para equipos con 24 GB de VRAM y 32 GB o más de RAM.
- **Prototipado de chatbots sin censura**: el fine-tune está orientado a conversación sin filtros editoriales; útil para investigación sobre alineamiento, evaluación de sesgos o generación de contenido creativo sin restricciones de estilo. Los niveles Q5_K_M y Q6_K ofrecen la mayor fidelidad al comportamiento del fine-tune original.
- **Evaluación comparativa de cuantizaciones**: la escalera de diez niveles con métricas KLD, PPL, RMS y throughput permite estudiar el compromiso calidad-tamaño-velocidad en un MoE real, con protocolo reproducible documentado por el autor.
- **Servicio de generación de texto en entornos con VRAM limitada**: el nivel IQ3_XXS (13,46 GiB) es el mínimo práctico según el autor; por debajo de 3,33 bpw la calidad se degrada severamente. Apto para servidores con una GPU de 16 GB y RAM suficiente para los expertos en CPU.
- **Procesamiento de texto en inglés y chino**: dado el soporte bilingüe declarado, puede emplearse para traducción asistida, resumen o generación de contenido en esos dos idiomas, aunque no se documenta calidad por idioma.
- **Investigación sobre eficiencia de inferencia MoE**: los datos de tg128 con `-ncmoe 40` (todos los expertos en CPU) permiten comparar el rendimiento de distintos tipos de cuantización (codebook IQ frente a K-quants) en el mismo hardware; los niveles IQ son notablemente más lentos (26-37 tok/s) que los K-quants (36-54 tok/s).
- **Integración en pipelines llama.cpp existentes**: al ser ficheros GGUF estándar con licencia Apache 2.0, pueden incorporarse en herramientas compatibles (llama.cpp, servidores OpenAI-compatible basados en llama.cpp) sin cambios de formato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona exclusivamente métricas internas de cuantización y velocidad, reproducidas aquí:

| Métrica | Mejor valor del conjunto | Peor valor del conjunto |
|---|---|---|
| KLD (menor es mejor) | 0,005800 ± 0,000218 (Q6_K) | 0,060539 ± 0,001366 (IQ3_XXS) |
| PPL(Q) | 5,868 (Q5_K_M) | 6,094 (IQ3_XS) |
| RMS Δp | 2,173 % (Q6_K) | 7,339 % (IQ3_XXS) |
| tg128 (tok/s, expertos en CPU) | 53,86 (IQ4_NL) | 26,30 (IQ3_XS) |

Comparación del conjunto TTQ frente a los ficheros del repositorio base (según datos del autor):

| Fichero TTQ | Fichero base comparable | KLD relativo | Diferencia de tamaño | Decode | Prefill |
|---|---|---|---|---|---|
| 6,72 bpw Q6_K (27,10 GiB) | Q6_K_P (28,54 GiB) | 1,61× mejor (5,1σ) | −1,44 GiB | +11 % | +50 % |
| 6,06 bpw Q5_K_M (24,45 GiB) | Q6_K_P | 1,23× mejor (2,5σ) | −4,09 GiB | +19 % | +80 % |
| 5,59 bpw Q5_K_S (22,54 GiB) | Q5_K_P (26,10 GiB) | 1,28× mejor (3,9σ) | −3,56 GiB | +6 % | +28 % |
| 4,90 bpw Q4_K_M (19,76 GiB) | Q5_K_P | empate (0,65σ) | −6,34 GiB | +16 % | +45 % |

Condiciones de medición de tg128: llama.cpp `llama-bench` con `-ncmoe 40` (todos los expertos en CPU), `-p 512 -n 128 -r 5`. Estas cifras no son comparables con configuraciones que descarguen expertos a GPU.

## Requisitos de hardware

- **VRAM estimada**: depende del reparto entre GPU y CPU. Con `-ncmoe 40` (todos los expertos en CPU) la VRAM necesaria se reduce a las capas de atención y embeddings; con offloading completo a GPU, la VRAM debe cubrir el tamaño del fichero más overhead de contexto. El nivel IQ3_XXS (13,46 GiB) requiere aproximadamente 14-16 GB de VRAM para carga completa; el Q6_K (27,10 GiB) requiere al menos 28-30 GB.
- **GPU recomendadas**: para carga completa, A100 40 GB, H100, RTX 6000 Ada (48 GB) o RTX 4090 (24 GB) para niveles hasta Q4_K_M. Para niveles superiores con offloading parcial, RTX 4090 o RTX 3090 con RAM suficiente.
- **¿Cabe en GPU de consumo?** Sí, parcial o totalmente según el nivel. Los ficheros de 13,46 a 19,76 GiB (IQ3_XXS a Q4_K_M) caben en GPUs de 24 GB (RTX 4090, RTX 3090) con contexto moderado. Los niveles Q5 y Q6 requieren repartir expertos a CPU o usar GPUs de 32 GB o más.
- **Opciones de despliegue**: llama.cpp (formato nativo), servidores compatibles con la API OpenAI construidos sobre llama.cpp. No se confirma compatibilidad con vLLM, TGI u Ollama en la información disponible, aunque al ser GGUF estándar es probable que Ollama los cargue.
- **Latencia y throughput**: medidos con expertos en CPU (`-ncmoe 40`), entre 26,30 y 53,86 tok/s de decodificación (tg128) según el nivel. Los niveles IQ (codebook) son los más lentos (26-37 tok/s); los K-quants alcanzan 36-54 tok/s. No se proporcionan datos de prefill absolutos, solo incrementos relativos frente al repositorio base (+28 % a +80 %).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| TTQ Qwen3.6-35B-A3B-Uncensored (este) | ~34,66 B (MoE) | no disponible | GGUF, 10 niveles | Apache 2.0 | Cuantizaciones con imatrix, métricas KLD publicadas |
| HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive (base) | ~34,66 B (MoE) | no disponible | GGUF (Q8_K_P y otros) | Apache 2.0 | Fine-tune sin censura; referencia de calidad del conjunto TTQ |
| Qwen/Qwen3.6-35B-A3B (modelo original) | ~34,66 B (MoE) | no disponible | safetensors (presumiblemente) | no disponible | Modelo base no ajustado; no es sustituto del fine-tune según el autor |

No se dispone de datos de benchmarks comparativos con otras familias de modelos (Llama, Mistral, DeepSeek) en la información proporcionada.

## Limitaciones y advertencias

- **Ausencia de pesos en precisión completa**: no existe versión F16/BF16 del fine-tune; todas las métricas de calidad son relativas al fichero Q8_K_P del autor original, no al modelo verdadero. Una fracción desconocida de la divergencia medida es heredada de esa referencia y no puede separarse.
- **Riesgo de alucinación**: como todo modelo generativo, puede producir información falsa con aparente confianza; el ajuste "uncensored" no elimina este riesgo y puede aumentar la probabilidad de afirmaciones no verificadas en temas sensibles.
- **Contenido sin censura**: el fine-tune está deliberadamente liberado de filtros editoriales; puede generar contenido ofensivo, violento, sexual o legalmente restringido según jurisdicción. No apto para aplicaciones orientadas al público sin capas adicionales de moderación.
- **Sesgos**: no se documentan evaluaciones de sesgo; los sesgos del corpus de entrenamiento del modelo base y del fine-tune no están caracterizados.
- **Limitaciones de idioma**: solo inglés y chino declarados; el rendimiento en castellano no está garantizado ni medido.
- **Contexto**: la longitud de contexto no se especifica en la información disponible; no se puede planificar su uso en tareas de contexto largo sin verificar el valor real en la configuración de llama.cpp.
- **Calidad por debajo de 3,33 bpw**: el autor advierte que por debajo de ese umbral la calidad colapsa; el nivel IQ3_XXS es el mínimo práctico.
- **Rendimiento de los niveles IQ**: los tipos IQ (codebook) son significativamente más lentos en decodificación (26-37 tok/s frente a 36-54 tok/s de los K-quants) en las condiciones medidas.
- **Licencia Apache 2.0**: permite uso comercial, pero debe verificarse la licencia del fine-tune base (HauhauCS) y del modelo original Qwen, que pueden imponer condiciones adicionales no reflejadas aquí.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TokenTinkerer/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-TTQ-GGUF
- Modelo base (fine-tune): https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.6-35B-A3B (referencia nominal, no verificada en la búsqueda)
- llama.cpp (herramienta de inferencia): no se proporciona enlace específico en la información disponible
- Papers, blogs o demos adicionales: no disponible
