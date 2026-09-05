# youngseok12/HyperCLOVA-X-SEED-Think-14B-sft-71875-71568-71949-joint-9000

## Resumen

HyperCLOVA X SEED Think-14B SFT AI Hub Joint 9K es un modelo de lenguaje de 14.748 millones de parámetros desarrollado por youngseok12 a partir del modelo base `naver-hyperclovax/HyperCLOVAX-SEED-Think-14B`. Se trata de un fine-tuning supervisado (SFT) independiente, no de una mezcla de adaptadores, entrenado con 9.000 ejemplos combinados de tres datasets coreanos de AI Hub: conocimiento médico, razonamiento numérico sobre economía y deportes, e inferencia causal. El objetivo es mejorar el rendimiento del modelo base en tareas específicas de dominio coreano, manteniendo la arquitectura y el enfoque conversacional del original.

El modelo se distribuye en formato safetensors con pesos en BF16 y su repositorio ocupa 29,5 GB. No se han publicado resultados de benchmarks en la información disponible, por lo que su rendimiento real debe evaluarse de forma independiente. La licencia es "other", lo que implica que se debe consultar el acuerdo completo de HyperCLOVA X antes de cualquier uso, especialmente en entornos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base: naver-hyperclovax/HyperCLOVAX-SEED-Think-14B) |
| Parametros totales | 14.748.112.896 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (durante el SFT se uso max sequence length de 4096) |
| Tipos de cuantizacion | No disponible (pesos en BF16) |
| Idiomas soportados | Coreano (inferido de los datasets de entrenamiento y etiquetas del repositorio) |
| Licencia | Otra (license: other; requiere consultar el acuerdo de HyperCLOVA X) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del base `naver-hyperclovax/HyperCLOVAX-SEED-Think-14B` y aplica un fine-tuning supervisado mediante LoRA sobre 9.000 ejemplos combinados de tres datasets de AI Hub: 3.000 de medicina (AI Hub 71875), 3.000 de razonamiento numérico MRC sobre economía y deportes (AI Hub 71568) y 3.000 de inferencia causal (AI Hub 71949). Los datos se mezclaron con semilla 42 y se mantuvo el formato de respuesta en primer lugar de cada fuente.

La configuración de entrenamiento incluye LoRA con r=16, alpha=32, dropout=0.05, bias=none y módulos objetivo en todas las proyecciones de atención y feed-forward. Se usó una tasa de aprendizaje de 5e-5 con scheduler coseno, warmup ratio de 0.03, weight decay 0, 1 época, batch size efectivo de 16 (4 por dispositivo con acumulación de 4), entrenamiento en BF16, longitud máxima de secuencia de 4096 y pérdida solo sobre las respuestas. La pérdida final de entrenamiento fue 0.0310544 y no hubo truncamiento de secuencias. Tras la fusión del adaptador, se verificó la ausencia de NaN/Inf y se superó una prueba de generación sintética local. No se incluyeron datos de benchmarks públicos ni la mezcla v0.21 en el entrenamiento.

## Capacidades

- Generación de texto en coreano con enfoque conversacional, heredado del modelo base.
- Respuesta a preguntas de conocimiento médico factual, gracias al entrenamiento con 3.000 QA de medicina de AI Hub.
- Razonamiento numérico y comprensión lectora sobre textos económicos y deportivos, basado en el dataset de MRC numérico.
- Inferencia causal, entrenada con 3.000 ejemplos de razonamiento causal de AI Hub.
- No se mencionan capacidades de tool calling, agentes, visión, audio ni modo de pensamiento explícito en la información disponible.

## Casos de uso

- Asistencia médica en coreano: el modelo puede responder preguntas de salud y medicina basándose en los 3.000 QA médicos de AI Hub. Es adecuado para prototipos de consulta de información médica general en entornos controlados, siempre que se valide con profesionales sanitarios.
- Análisis de noticias económicas: gracias al entrenamiento con MRC numérico sobre economía, el modelo puede extraer y comparar cifras de artículos periodísticos, útil para generar resúmenes cuantitativos en aplicaciones de análisis financiero.
- Resumen de resultados deportivos: la misma capacidad numérica permite interpretar estadísticas y resultados deportivos, facilitando la generación de informes automáticos tras partidos o competiciones.
- Razonamiento causal en textos: el modelo puede identificar relaciones causa-efecto en narrativas, lo que resulta útil en tareas de análisis de incidentes, revisión de documentos técnicos o investigación cualitativa.
- Chatbots en coreano para servicios públicos: al estar afinado con datos de AI Hub (una plataforma gubernamental coreana), el modelo puede integrarse en asistentes de atención al ciudadano para responder preguntas frecuentes sobre salud, economía o trámites.
- Experimentación en NLP coreana: investigadores pueden usar este modelo como referencia para comparar estrategias de SFT con diferentes datasets de AI Hub, gracias a que el autor documenta de forma detallada la configuración de entrenamiento y los datos utilizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 30 GB solo para los pesos; con overhead de activaciones y caché KV, se recomienda un mínimo de 40 GB.
- VRAM estimada con cuantización a 4 bits (si se aplica bitsandbytes): alrededor de 8-10 GB, permitiendo ejecución en GPUs de consumo.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o RTX 4090 (24 GB) con cuantización a 4 bits. En BF16 puro, una RTX 4090 no es suficiente.
- Opciones de despliegue: carga directa con Transformers (`AutoModelForCausalLM`). No se confirma compatibilidad con vLLM, TGI, llama.cpp u Ollama en la información disponible, aunque al ser un modelo estándar de Transformers podría adaptarse con conversión a GGUF o mediante integraciones que soporten arquitecturas similares.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de modelos comparables en la información disponible, más allá del modelo base `naver-hyperclovax/HyperCLOVAX-SEED-Think-14B`, del que no se especifican parámetros ni rendimiento.

## Limitaciones y advertencias

- Sesgos: al entrenarse solo con datos coreanos de AI Hub, el modelo puede reflejar sesgos culturales, regionales y de dominio presentes en esas fuentes.
- Riesgo de alucinación: no se han publicado evaluaciones de fiabilidad; como cualquier modelo de lenguaje, puede generar respuestas incorrectas, especialmente en temas médicos donde la precisión es crítica.
- Limitaciones de contexto: la longitud de contexto real del modelo no está documentada; el entrenamiento usó secuencias de hasta 4096 tokens, por lo que el rendimiento con contextos más largos no está garantizado.
- Restricciones de licencia: la licencia "other" implica que el uso comercial y la redistribución están sujetos al acuerdo completo de HyperCLOVA X, que incluye políticas de uso prohibido y requisitos de atribución a NAVER. Debe revisarse antes de desplegar el modelo en producción.
- Falta de benchmarks: no hay resultados publicados que permitan comparar el modelo con alternativas, por lo que su rendimiento real en tareas generales es desconocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/youngseok12/HyperCLOVA-X-SEED-Think-14B-sft-71875-71568-71949-joint-9000
- Modelo base: https://huggingface.co/naver-hyperclovax/HyperCLOVAX-SEED-Think-14B
- Dataset AI Hub 71875 (medicina): https://www.aihub.or.kr/aihubdata/data/view.do?currMenu=115&topMenu=100&aihubDataSe=realm&dataSetSn=71875
- Dataset AI Hub 71568 (economía/deportes MRC): https://www.aihub.or.kr/aihubdata/data/view.do?currMenu=115&topMenu=100&aihubDataSe=realm&dataSetSn=71568
- Dataset AI Hub 71949 (inferencia causal): https://www.aihub.or.kr/aihubdata/data/view.do?currMenu=115&topMenu=100&aihubDataSe=realm&dataSetSn=71949
- Modelo relacionado del mismo autor: https://huggingface.co/youngseok12/HyperCLOVA-X-SEED-Think-14B-minimal-sft-71875
- Otro modelo del mismo autor: https://huggingface.co/youngseok12/HCX-SEED-Think-14B-specialist-r1-ta_avg
