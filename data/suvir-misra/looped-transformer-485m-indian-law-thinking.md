# Suvir-Misra/Looped-Transformer-485M-Indian-Law-Thinking

## Resumen

Looped-Transformer-485M-Indian-Law-Thinking es un modelo de lenguaje de tipo transformer con profundidad recurrente ("looped") desarrollado por Suvir-Misra y publicado en Hugging Face bajo licencia Apache 2.0. Con 485 millones de parámetros físicos, el modelo está específicamente ajustado y alineado para razonamiento jurídico indio: derecho estatutario, procesal y jurisprudencia, abarcando el Bharatiya Nyaya Sanhita (BNS 2023), el Código de Procedimiento Civil (CPC 1908), la Ley del Impuesto sobre la Renta de 1961 y la Ley CGST de 2017.

La innovación arquitectónica principal es el uso de 8 capas físicas que se recorren 3 veces por pase hacia delante, alcanzando una profundidad computacional virtual de 24 capas con un coste de memoria mucho menor que un transformer lineal equivalente. El modelo incorpora además un mecanismo explícito de razonamiento Chain-of-Draft mediante tokens `<think>...</think>` que estructuran el cálculo intermedio antes de la respuesta final.

Su relevancia actual radica en dos factores: por un lado, demuestra que los transformers recurrentes en profundidad pueden especializarse en dominios de alta precisión factual como el legal; por otro, está implementado nativamente en Apple MLX, lo que lo hace desplegable en hardware Apple Silicon. El contexto es de 4.096 tokens y el modelo solo soporta inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Recurrent-Depth Transformer (LoopedTransformerLM) |
| Parámetros totales | 485.066.752 (485,1 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); ~1,8 GB en FP16 |

## Arquitectura y entrenamiento

El modelo almacena 8 capas transformer físicas y hace circular el estado oculto recurrente a través de ellas 3 veces por pase hacia delante, logrando una profundidad computacional virtual de 24 capas con pesos compartidos. Tres mecanismos sostienen la estabilidad del bucle: la reinyección del embedding de entrada proyectado al inicio de cada iteración (para evitar la atenuación de señal), embeddings de profundidad por bucle (índice 0, 1, 2) que permiten a las capas compartidas especializarse según la profundidad, y normalización tipo sándwich con RMSNorm antes y después de la autoatención y del bloque FFN SwiGLU (4 normas por capa) para acotar el crecimiento del flujo residual.

El entrenamiento se organizó en cuatro etapas. Primero, un SFT equilibrado con 9.579 pares de preguntas y respuestas sustantivas del Tribunal Supremo procedentes de IndicLegalQA, junto con anclaje a textos legales (BNS 2023, CPC 1908, Income-tax Act 1961, CGST Act 2017) y 2.500 filas de instrucciones generales Alpaca como replay anti-colapso. Segundo, un SFT de pensamiento Chain-of-Draft en el que el 100 % de las filas se formatearon con scratchpads `<think>1. ... 2. ... 3. ... 4. ...</think>`. Tercero, ORPO calibrado sobre prompt idéntico con pares contrastivos (respuesta dorada frente a respuesta alucinada) para suprimir citas fantasma sin penalizar la sintaxis legal general. Cuarto, fusión de checkpoints mediante TIES (densidad del 35 %, escala 0,85) y model souping.

## Capacidades

- Generación de texto especializada en derecho indio: derecho constitucional, penal (BNS 2023), procesal civil (CPC 1908), fiscal (Income-tax Act 1961) y GST (CGST Act 2017).
- Razonamiento estructurado con trazas Chain-of-Draft explícitas entre `<think>` y `</think>`, con cálculo, cita de secciones y comprobación de excepciones antes de la respuesta final.
- Cita de secciones estatutarias y jurisprudencia (por ejemplo, Article 368, Section 6(1) del Income-tax Act, Section 194J, Section 138 de Negotiable Instruments).
- Razonamiento multi-paso dentro de una única traza de pensamiento.
- Capacidades multilingües: limitadas al inglés según la model card.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Visión, audio o modalidades adicionales: no disponible.

## Casos de uso

- Asistencia a la investigación jurídica: el modelo puede recibir una consulta sobre una figura procesal (por ejemplo, la distinción entre "decree" y "order" bajo el CPC) y devolver la traza de razonamiento con las secciones aplicables, útil como primer borrador para que un jurista verifique.
- Preparación de exámenes y formación legal: gracias a sus trazas `<think>` estructuradas, sirve para generar explicaciones paso a paso de conceptos como los cinco heads of income (Section 14) o los tests de residencia fiscal de la Section 6(1).
- Borradores de memorandos internos en despachos: con 4.096 tokens de contexto puede procesar un supuesto de hecho acotado y proponer el encuadre estatutario correspondiente, siempre con revisión humana posterior.
- Clasificación y enrutamiento de consultas legales: su conocimiento de BNS, CPC, Income-tax y GST permite etiquetar consultas por área y estatuto aplicable antes de derivarlas a un especialista.
- Docencia y generación de material didáctico: producción de preguntas y respuestas razonadas sobre jurisprudencia constitucional (Kesavananda Bharati, Minerva Mills, Maneka Gandhi) para cursos de derecho.
- Despliegue local en Apple Silicon para prototipos: al estar implementado en MLX y pesar ~1,8 GB en FP16, puede ejecutarse en un Mac para experimentación sin infraestructura GPU dedicada.
- Anclaje de respuestas en textos legales en pipelines de verificación: el formato `<think>` facilita extraer la cadena de razonamiento y auditarla de forma automática.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente) sobre la suite de 16 puntos Indian Legal & Procedural Benchmark Suite:

| Test ID | Dominio | Materia y estatuto | Coincidencia estatutaria | Traza `<think>` | Estado |
|---|---|---|---|---|---|
| CONST_01 | Constitucional | Basic Structure (Kesavananda Bharati, Art. 368) | 100 % | Abierta y cerrada | PASSED |
| CONST_02 | Constitucional | Article 21 (Maneka Gandhi) | 100 % | Abierta y cerrada | PASSED |
| CONST_03 | Constitucional | Minerva Mills (1980) | 75 % | Abierta y cerrada | PASSED |
| CONST_04 | Constitucional | Edad mínima Lok Sabha (Art. 84(b), 25 años) | 100 % | Abierta y cerrada | PASSED |
| CRIM_01 | Jurisprudencia penal | Máxima actus non facit reum nisi mens sit rea | 100 % | Abierta y cerrada | PASSED |
| CRIM_02 | Penal (BNS 2023) | Community service (Sec. 4(f)) | 100 % | Abierta y cerrada | PASSED |
| CRIM_03 | Penal (BNS 2023) | Inimputabilidad infantil (Sec. 20, doli incapax) | 100 % | Abierta y cerrada | PASSED |
| CPC_01 | CPC | Decree Sec. 2(2) vs. Order Sec. 2(14) | 80 % | Abierta y cerrada | PASSED |
| CPC_02 | CPC | Sentencias extranjeras (Sec. 13) | 100 % | Abierta y cerrada | PASSED |
| CPC_03 | CPC | Order VI Rule 2 (hechos, no derecho) | 50 % | Abierta y cerrada | PASSED |
| TAX_01 | Income-tax Act 1961 | Residencia fiscal (Sec. 6(1)) | 100 % | Abierta y cerrada | PASSED |
| TAX_02 | Income-tax Act 1961 | Cinco heads of income (Sec. 14) | 100 % | Abierta y cerrada | PASSED |
| TAX_03 | Income-tax Act 1961 | TDS profesional (Sec. 194J, 10 % > ₹30k) | 100 % | Abierta y cerrada | PASSED |
| GST_01 | CGST Act 2017 | Time of supply (Sec. 12) | 75 % | Abierta y cerrada | PASSED |
| COMM_01 | Negotiable Instruments | Cheque bouncing (Sec. 138) | 67 % | Abierta y cerrada | PASSED |
| PERS_01 | Derecho personal (musulmán) | Testamento (información truncada en la model card) | no disponible | no disponible | no disponible |

Métricas agregadas declaradas en el model-index: Legal Benchmark Pass Rate 100 % y Thinking Trace Reliability 100 %, ambas marcadas como no verificadas.

## Requisitos de hardware

- VRAM estimada para inferencia: ~1,8 GB en FP16 para los pesos; el consumo real depende del runtime MLX y del tamaño del KV cache para 4.096 tokens.
- GPU recomendadas: el modelo está empaquetado para Apple MLX, por lo que el hardware objetivo son chips Apple Silicon (series M1, M2, M3, M4 y superiores). No se proporcionan pesos GGUF ni formato compatible con CUDA en la información disponible.
- Cabe en GPU consumer: en el ecosistema Apple Silicon, sí, en cualquier Mac con memoria unificada de 8 GB o más. Compatibilidad con GPU NVIDIA consumer: no disponible.
- Opciones de despliegue: MLX (librería declarada). vLLM, llama.cpp, Ollama y TGI no están confirmados para este modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Looped-Transformer-485M-Indian-Law-Thinking | 485 M | 4.096 | Derecho indio + Chain-of-Draft | Apache 2.0 | safetensors (MLX) |
| Modelos legales indios de 7B+ comparables | no disponible | no disponible | no disponible | no disponible | no disponible |
| Transformers lineales de ~500 M de propósito general | ~500 M | variable | generalista | variable | safetensors, GGUF |

No se dispone en la información proporcionada de modelos comparables de la misma categoría (SLM legal indio con razonamiento explícito) con especificaciones publicadas que permitan una comparación cuantitativa rigurosa. La comparativa con alternativas de propósito general del mismo tamaño resulta limitada porque este modelo está altamente especializado y no se han publicado métricas en benchmarks generalistas como MMLU o HumanEval.

## Limitaciones y advertencias

- Los benchmarks son autodeclarados por el autor y están marcados como no verificados; la suite de evaluación consta de solo 16 tests, lo que limita la significación estadística.
- Riesgo de alucinación jurídica: aunque el entrenamiento ORPO se diseñó para suprimir citas fantasma (Gopantray, Marananda Bharati), persiste el riesgo de citas incorrectas o secciones inventadas, especialmente fuera de los estatutos cubiertos.
- Contexto limitado a 4.096 tokens, insuficiente para contratos extensos, expedientes completos o cadenas de razonamiento largas.
- Solo soporta inglés; no cubre consultas en hindi ni en otras lenguas indias.
- Especialización estrecha: el rendimiento en dominios generales no está documentado y el replay Alpaca (2.500 filas) es limitado para preservar capacidades generales.
- Cobertura estatutaria parcial: la model card menciona BNS 2023, CPC 1908, Income-tax Act 1961 y CGST Act 2017; otros cuerpos normativos no están cubiertos explícitamente.
- Dependencia del ecosistema MLX: no hay pesos GGUF ni compatibilidad confirmada con vLLM o TGI, lo que restringe el despliegue en infraestructura GPU convencional.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de validación independiente desaconseja su uso en producción legal sin supervisión humana cualificada.
- No apto como asesoramiento jurídico: cualquier salida debe ser revisada por un profesional del derecho.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Suvir-Misra/Looped-Transformer-485M-Indian-Law-Thinking
- Script de evaluación mencionado en la model card: `scripts/eval_legal_thinking.py` (incluido en el repositorio del modelo)
- Dataset IndicLegalQA: no disponible enlace directo en la información proporcionada
- Paper o blog del autor: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
