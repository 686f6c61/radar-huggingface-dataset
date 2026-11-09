# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft11200-opd1760-lora

## Resumen

Qwen2.5-0.5B-Instruct-xlam-mixed-sft11200-opd1760-lora es un adaptador LoRA publicado por el usuario uygarkurt sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. Se trata de un experimento de ajuste fino orientado a una única tarea: el tool calling estructurado y la abstención cuando las herramientas ofrecidas no son relevantes. El entrenamiento combina una fase larga de supervisión (SFT) con una fase posterior de destilación on-policy (OPD), en la que un profesor congelado (Qwen2.5-3B-Instruct) guía al estudiante sobre sus propias respuestas generadas.

El interés del artefacto es metodológico más que de producto: documenta, con métricas propias, el efecto de añadir OPD a un adaptador SFT ya entrenado. En concreto, el autor reporta una mejora en la precisión de llamadas a función en BFCL de un solo turno (54,28% a 59,34%) y un salto en la detección de relevancia hasta el 100%, a costa de una caída muy acusada en la detección de irrelevancia (72,91% a 13,46%). El modelo tiene 0,5B parámetros en su base, por lo que su ámbito realista es la experimentación y el prototipado de pipelines de agentes con recursos muy limitados.

No hay información sobre licencia, y el repositorio es un adaptador (no pesos completos), por lo que debe cargarse sobre el modelo base original con PEFT. El tamaño del repositorio aparece como 0.0 GB, lo que sugiere que los pesos pueden no estar efectivamente subidos o que la medición no está disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), adaptador LoRA sobre modelo base |
| Parametros totales | 0,5B en el modelo base; parametros del adaptador no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5 soporta hasta 32.768 tokens, pero no se confirma en la card) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (el adaptador se distribuye en safetensors; la cuantizacion depende del despliegue del base) |
| Idiomas soportados | Ingles (segun la card) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |
| Libreria | PEFT |
| Modelo base | Qwen/Qwen2.5-0.5B-Instruct |
| Profesor (OPD) | Qwen/Qwen2.5-3B-Instruct (congelado) |
| Dataset de entrenamiento | uygarkurt/xlam-tool-calling-mixed |
| Etapas de entrenamiento | 11.200 actualizaciones SFT + 1.760 actualizaciones OPD |
| Tiempo de entrenamiento | 2,4 horas en total (1,8 h SFT + 0,6 h OPD) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-0.5B-Instruct, un transformer decoder-only denso. Sobre él se aplica un adaptador LoRA entrenado en dos fases secuenciales con la herramienta Post-Training Lab del propio autor. La primera fase realiza 11.200 actualizaciones de supervisión sobre el dataset mixto de tool calling `uygarkurt/xlam-tool-calling-mixed`; la segunda continúa ese mismo adaptador con 1.760 actualizaciones de destilación on-policy, en las que el estudiante genera respuestas y aprende a partir de las probabilidades por token del profesor Qwen2.5-3B-Instruct congelado sobre esas respuestas propias.

El objetivo declarado del ajuste es doble: producir llamadas a herramientas con formato estructurado correcto y aprender a abstenerse cuando las herramientas ofrecidas no son pertinentes para la consulta. No se detalla en la información disponible la composición exacta del dataset, el número de tokens de entrenamiento, ni si hubo RLHF o DPO. La innovación técnica destacable es precisamente el uso de OPD sobre un adaptador SFT ya convergido, con un profesor tres veces mayor que el estudiante, y la publicación de métricas comparativas entre el punto de partida SFT y el resultado tras OPD.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Instruct.
- Tool calling estructurado: emisión de llamadas a función con nombres y argumentos, medido con exactitud de llamada (xLAM ETC) y exactitud de nombre de función (xLAM FNA).
- Abstención ante herramientas irrelevantes: capacidad entrenada explícitamente, aunque los resultados muestran un comportamiento muy asimétrico entre relevancia e irrelevancia.
- Razonamiento básico y matemáticas elementales, con rendimiento limitado por el tamaño de 0,5B (MATH-500 en torno al 17%).
- Seguimiento de instrucciones con formato, evaluado mediante IFEval en modo estricto a nivel de prompt.
- No se documenta soporte de visión, audio, ni modo de razonamiento extendido (thinking).

## Casos de uso

- Prototipado de agentes con tool calling en hardware muy limitado: el adaptador se carga sobre un base de 0,5B, por lo que permite iterar sobre el diseño de esquemas de herramientas y prompts en portátiles o GPUs de gama baja antes de escalar a modelos mayores.
- Investigación sobre destilación on-policy: sirve como caso reproducible para estudiar cómo afecta OPD a un adaptador SFT ya entrenado, con métricas antes/después publicadas y código de entrenamiento disponible.
- Evaluación de la calibración en abstención: útil para analizar el compromiso entre sensibilidad a la relevancia (100% reportado) y especificidad ante irrelevancia (13,46% reportado), un fenómeno relevante en el diseño de guardarraíles de agentes.
- Router ligero de intenciones en pipelines: dado su bajo coste computacional, puede emplearse como clasificador previo que decida si derivar una consulta a un sistema con herramientas o a un modelo mayor.
- Generación de datos sintéticos de llamadas a función para aumentar datasets de entrenamiento, filtrando posteriormente por validez del esquema.
- Pruebas de integración en CI/CD de frameworks de agentes: su tamaño permite ejecutar tests de extremo a extremo de parseo de tool calls y manejo de errores en cada commit sin coste significativo de GPU.
- Docencia y demos de ajuste fino con PEFT: el repositorio ilustra el flujo completo base + adaptador + carga con PEFT en un caso acotado.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el adaptador SFT de partida y el adaptador final tras OPD. Todas las cifras son porcentajes.

| Checkpoint | Paso | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL single-turn FC | Relevance | Irrelevance | Tiempo (h) |
|---|---|---|---|---|---|---|---|---|---|---|
| Adaptador SFT inicial | SFT 11.200 | 38,36% | 16,20% | 27,36% | 81,46% | 96,98% | 54,28% | 83,33% | 72,91% | 1,8 |
| SFT + OPD (este adaptador) | OPD 1.760 | 38,54% | 17,40% | 29,57% | 74,19% | 90,34% | 59,34% | 100,00% | 13,46% | 2,4 |

Notas metodológicas de la card: xLAM ETC es exactitud exacta de llamada a herramienta y xLAM FNA es exactitud del nombre de función, evaluadas sobre el split de test del dataset mixto con 2.546 ejemplos evaluados y 743 descartados por el límite de 640 tokens de prompt. BFCL single-turn FC agrega subconjuntos seleccionados de BFCL-v3 de un solo turno; Relevance e Irrelevance corresponden a los subconjuntos de relevancia seleccionados. IFEval usa exactitud estricta a nivel de prompt. Las evaluaciones xLAM se realizaron con scripts propios de Post-Training Lab. Se trata de agregados específicos del estudio, no directamente comparables con cifras oficiales de los benchmarks.

## Requisitos de hardware

- El adaptador LoRA es de tamaño reducido (el repositorio figura como 0.0 GB, consistente con un adaptador de pocos megabytes sobre un base de 0,5B), pero requiere cargar el modelo base completo.
- VRAM estimada para inferencia con el base de 0,5B en FP16: en torno a 1-2 GB, más el overhead de activaciones y del runtime (valores orientativos según el tamaño del base; no confirmados en la card).
- En cuantización de 8 bits o 4 bits del base, el modelo cabe holgadamente en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090 o incluso en iGPU con suficiente memoria compartida.
- Despliegue: PEFT + Transformers es la vía natural para cargar el adaptador; alternativas como vLLM o TGI requieren fusionar el adaptador con el base (merge) antes de servir; llama.cpp u Ollama igualmente necesitan exportar a GGUF tras la fusión.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño del base, el throughput esperado es alto en cualquier GPU moderna, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-0.5B-Instruct (base) | 0,5B | No confirmado en esta ficha (hasta 32.768 tokens segun el modelo base Qwen2.5) | Parcial, sin ajuste específico | No disponible en la informacion proporcionada | Hugging Face |
| Este adaptador (SFT + OPD) | 0,5B + LoRA | Limitado por el base | Si, ajustado con datos xLAM mixtos; BFCL single-turn 59,34% | No disponible | Hugging Face |
| Adaptador SFT previo del mismo autor | 0,5B + LoRA | Limitado por el base | Si; BFCL single-turn 54,28%, mejor ETC (81,46%) | No disponible | Hugging Face |
| Qwen2.5-3B-Instruct (profesor) | 3B | No confirmado en esta ficha | Si, en el base Instruct | No disponible en la informacion proporcionada | Hugging Face |

No se dispone de comparaciones con otros adaptadores de tool calling de tamaño equivalente en la información proporcionada.

## Limitaciones y advertencias

- Degradación severa en detección de irrelevancia: cae del 72,91% al 13,46% tras OPD, lo que implica que el modelo tiende a considerar relevante una herramienta aunque no lo sea. En producción esto puede provocar llamadas espurias.
- Também caen xLAM ETC (81,46% a 74,19%) y xLAM FNA (96,98% a 90,34%) tras OPD: el adaptador final es mejor en BFCL y relevancia, pero peor en exactitud de llamada sobre el dataset mixto.
- Rendimiento general bajo: MMLU 38,54%, MATH-500 17,40% e IFEval 29,57%, coherentes con un modelo de 0,5B, pero insuficientes para tareas de razonamiento complejo o instrucciones largas.
- Idioma: solo inglés declarado; no hay evidencia de comportamiento en castellano.
- Límite de prompt de 640 tokens en la evaluación xLAM, lo que descartó 743 de los ejemplos del test; el comportamiento en contextos más largos no está documentado.
- Licencia no disponible: no puede asumirse uso comercial sin verificar los términos del modelo base y del adaptador.
- Riesgo de alucinación inherente a un modelo de este tamaño, especialmente en argumentos de herramientas y en la selección de funciones.
- Las métricas son agregados propios del estudio y pueden no ser directamente comparables con cifras oficiales de BFCL o xLAM.
- El repositorio figura con 0.0 GB de tamaño y sin descargas ni likes; conviene verificar que los pesos del adaptador estén efectivamente publicados antes de depender de él.
- No se documentan sesgos específicos ni evaluación de seguridad.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft11200-opd1760-lora
- Adaptador SFT previo: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft11200-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Profesor OPD: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Repositorio de entrenamiento (Post-Training Lab): https://github.com/uygarkurt/post-training-lab
