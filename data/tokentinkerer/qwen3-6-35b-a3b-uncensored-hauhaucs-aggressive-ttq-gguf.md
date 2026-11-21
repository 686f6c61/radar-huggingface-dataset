# TokenTinkerer/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-TTQ-GGUF

## Resumen

TokenTinkerer/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-TTQ-GGUF es un conjunto de cuantizaciones GGUF publicadas por el usuario TokenTinkerer a partir del fine-tune HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive, que a su vez deriva del modelo base Qwen/Qwen3.6-35B-A3B. El modelo subyacente es un transformer de tipo Mixture-of-Experts (MoE) con 34.660.610.688 parámetros totales (aproximadamente 34,66 mil millones) y una activación de aproximadamente 3 mil millones de parámetros por token, según indica el sufijo "A3B" del nombre. La familia Qwen3.6 pertenece a Alibaba (Qwen), aunque el fine-tune y las cuantizaciones son obra de terceros.

El interés de esta publicación no reside en el modelo en sí, sino en el conjunto de diez cuantizaciones GGUF ("TTQ", TokenTinkerer Quant) que van desde 3,33 bpw hasta 6,72 bpw, generadas con imatrix y medidas de forma sistemática contra un fichero de referencia Q8_K_P. El autor documenta métricas de divergencia KL (KLD), perplejidad, RMS de la probabilidad del token real y velocidad de decodificación (tg128) para cada nivel, lo que permite elegir el compromiso calidad/tamaño con datos concretos en lugar de estimaciones.

Es relevante ahora porque el fine-tune solo se distribuye en formato GGUF (no existen pesos F16/BF16 públicos) y porque el conjunto TTQ afirma superar en KLD a las cuantizaciones de tamaño comparable del repositorio base, con ficheros entre 1,44 y 7,90 GiB más pequeños a calidad equivalente. El modelo está pensado para inferencia local con llama.cpp y tiene licencia Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), según tags del repositorio |
| Parametros totales | 34.660.610.688 (34,66 B) |
| Parametros activos | Aproximadamente 3 B por token (deducido del sufijo "A3B"; no confirmado en la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 10 niveles GGUF: IQ3_XXS (3,33 bpw), IQ3_XS (3,51 bpw), Q3_K_S (3,67 bpw), Q3_K_M (3,93 bpw), IQ4_XS (4,19 bpw), IQ4_NL (4,51 bpw), Q4_K_M (4,90 bpw), Q5_K_S (5,59 bpw), Q5_K_M (6,06 bpw), Q6_K (6,72 bpw) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); no existe publicación en safetensors, F16 ni BF16 |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture-of-Experts, con 34,66 mil millones de parámetros totales y aproximadamente 3 mil millones activos por token. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si el fine-tune HauhauCS empleó RLHF, DPO u otras técnicas de alineación. El tag "uncensored" indica que el fine-tune ha eliminado o reducido los mecanismos de rechazo del modelo original, y "Aggressive" sugiere un ajuste orientado a respuestas más directas, aunque no se documenta la metodología concreta.

La innovación técnica destacable de esta publicación es el proceso de cuantización: cada nivel TTQ se generó a partir del fichero Q8_K_P del repositorio upstream (aproximadamente 10 bpw) usando matrices de importancia (imatrix), y se midió con un protocolo uniforme sobre 40 fragmentos fijos de un conjunto de evaluación interno. El autor advierte que, al no existir pesos de precisión completa, todas las métricas de KLD y RMS son relativas al Q8_K_P y no al modelo original, de modo que una fracción desconocida de la divergencia es heredada; las comparaciones entre ficheros del conjunto siguen siendo válidas porque comparten referencia. Los nombres de fichero combinan la tasa real medida en bpw con un `general.file_type` declarado deliberadamente distinto en cada nivel para evitar que el selector de descargas de Hugging Face colapse ficheros.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte de plantilla de chat (tag "conversational").
- Razonamiento y generación de código, heredados del modelo base Qwen3.6 (no verificado con benchmarks en la información disponible).
- Capacidades multilingües limitadas a inglés y chino según los metadatos del repositorio.
- Modo "uncensored": el fine-tune reduce los rechazos ante peticiones que el modelo base declinaría; no se especifica el alcance exacto.
- Inferencia local compatible con llama.cpp y ecosistema GGUF (Ollama, LM Studio, entre otros).
- No se documenta soporte explícito de tool calling, function calling, agentes, visión ni audio en la información proporcionada.

## Casos de uso

- Inferencia local en estaciones de trabajo con GPU de consumo: el nivel Q4_K_M (19,76 GiB) permite ejecutar un MoE de 34,66 B totales con aproximadamente 3 B activos, lo que reduce el coste computacional por token frente a un modelo denso del mismo tamaño.
- Despliegue en servidores con VRAM limitada: el nivel IQ3_XXS (13,46 GiB) es el mínimo que el autor considera utilizable, adecuado para entornos donde no cabe una cuantización de 4 bits pero se necesita el modelo completo.
- Evaluación de compromiso calidad/tamaño: las métricas KLD, PPL y RMS publicadas por nivel permiten seleccionar la cuantización según el presupuesto de memoria y la tolerancia a la degradación, sin necesidad de medir manualmente.
- Generación de texto en inglés y chino: útil para aplicaciones bilingües de redacción, resumen o traducción asistida dentro de esos dos idiomas.
- Investigación sobre cuantización: el conjunto sirve como referencia reproducible para estudiar el efecto de distintos esquemas (IQ vs. Q_K, con y sin imatrix) sobre un mismo modelo MoE.
- Prototipado de asistentes sin filtros: para casos donde se requiere estudiar el comportamiento del modelo sin rechazos, con la advertencia de que el contenido generado no está moderado.
- Ajuste fino posterior sobre GGUF: aunque limitado, permite experimentar con LoRA sobre cuantizaciones mediante las herramientas de llama.cpp.

## Benchmarks y rendimiento

El autor publica métricas internas de cuantización (no benchmarks de tareas como MMLU o HumanEval). La tabla siguiente reproduce los datos de la model card:

| Fichero | Tipo declarado | GiB | bpw | KLD ± | PPL(Q) | RMS Δp | tg128 (tok/s) |
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

Comparación con el repositorio base (según la model card):

| Nivel TTQ | Fichero base comparable | KLD | Diferencia de tamaño | Decode | Prefill |
|---|---|---|---|---|---|
| Q6_K (27,10 GiB) | Q6_K_P (28,54 GiB) | 1,61× mejor (5,1σ) | −1,44 GiB | +11 % | +50 % |
| Q5_K_M (24,45 GiB) | Q6_K_P | 1,23× mejor (2,5σ) | −4,09 GiB | +19 % | +80 % |
| Q5_K_S (22,54 GiB) | Q5_K_P (26,10 GiB) | 1,28× mejor (3,9σ) | −3,56 GiB | +6 % | +28 % |
| Q4_K_M (19,76 GiB) | Q5_K_P | Empate (0,65σ) | −6,34 GiB | +16 % | +45 % |

Las velocidades tg128 se midieron con `llama-bench`, `-ncmoe 40` (todos los expertos en CPU), `-p 512 -n 128 -r 5`. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: desde aproximadamente 13,5 GiB (IQ3_XXS) hasta 27,1 GiB (Q6_K) solo para los pesos; hay que añadir la caché KV, que depende de la longitud de contexto y no se documenta.
- El parámetro `-ncmoe 40` usado en las mediciones indica que los expertos pueden descargarse a CPU, reduciendo la VRAM necesaria a costa de velocidad.
- GPU recomendadas: no especificadas en la información disponible; por tamaño, los niveles de 4 bits caben en GPUs de 24 GiB (RTX 3090/4090) si se usa offload parcial de expertos a CPU, y los de 6 bits requieren 32 GiB o más (A100 40 GB, H100, o configuraciones multi-GPU).
- Cabe en GPU de consumo: los niveles de 3,33 a 4,90 bpw son viables en RTX 4090 (24 GiB) con offload parcial; los niveles superiores no caben íntegramente.
- Opciones de despliegue: llama.cpp (librería declarada), y por extensión Ollama y LM Studio; no se mencionan vLLM ni TGI.
- Throughput medido: 26,30–53,86 tok/s en decodificación (tg128) según nivel, con todos los expertos en CPU; el prefill mejora entre un 28 % y un 80 % frente a los ficheros base comparables.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantizaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TTQ Qwen3.6-35B-A3B Uncensored (este) | 34,66 B totales / ~3 B activos | No disponible | 10 niveles GGUF (3,33–6,72 bpw) | Apache 2.0 | Hugging Face, solo GGUF |
| HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive (upstream) | 34,66 B totales / ~3 B activos | No disponible | Q8_K_P y otros GGUF | Apache 2.0 | Hugging Face, solo GGUF |
| Qwen/Qwen3.6-35B-A3B (base) | 34,66 B totales / ~3 B activos | No disponible | Pesos completos y GGUF de terceros | No disponible en la información | Hugging Face |

No se dispone de datos de benchmarks de tareas para comparar el rendimiento absoluto con alternativas de la misma categoría; la comparación disponible se limita a las métricas de cuantización internas descritas en la sección anterior.

## Limitaciones y advertencias

- No existe publicación en precisión completa (F16/BF16): todas las métricas de calidad son relativas al fichero Q8_K_P y no al modelo original, por lo que la divergencia real respecto al modelo entrenado es desconocida.
- El modelo es "uncensored": no incorpora los filtros de seguridad del Qwen original, lo que implica riesgo de generar contenido dañino, ilegal o sesgado sin moderación; no es apto para producción orientada al público sin capas de filtrado adicionales.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones de factualidad.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está verificado y probablemente sea inferior.
- La longitud de contexto no se especifica en la información disponible, lo que impide planificar aplicaciones de contexto largo.
- El nivel IQ3_XXS (3,33 bpw) es el mínimo que el autor considera usable; por debajo, la calidad se degrada de forma acusada según sus propias notas.
- El fine-tune es obra de un tercero (HauhauCS) y las cuantizaciones de otro (TokenTinkerer); no hay garantía de mantenimiento ni soporte.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen subyacente antes de un uso comercial.
- El repositorio ocupa 217,6 GB en total; descargar el conjunto completo no es necesario, pero requiere seleccionar el fichero concreto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TokenTinkerer/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-TTQ-GGUF
- Modelo base del fine-tune: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.6-35B-A3B (referenciado en la model card; no verificado en la búsqueda)
- llama.cpp: no se proporciona enlace en la información disponible
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
