# youngseok12/AX-3.1-Light-sft_v3_2_aihub_extension

## Resumen

El modelo `youngseok12/AX-3.1-Light-sft_v3_2_aihub_extension` es un ajuste fino supervisado (SFT) del modelo base `skt/A.X-3.1-Light`, desarrollado por el usuario youngseok12. Se trata de un modelo de lenguaje generativo en coreano, orientado a tareas de instrucción y respuesta a preguntas, con un enfoque particular en el formato "answer-first" (respuesta compacta primero, seguida opcionalmente de una breve justificación). El ajuste se realizó mediante LoRA sobre 13.801 ejemplos seleccionados de datasets de AI Hub, abarcando dominios como administración, finanzas, derecho, educación, medicina y razonamiento causal.

Con aproximadamente 7.260 millones de parámetros (7,3B), el modelo se distribuye como pesos completos en BF16 (safetensors) y hereda la arquitectura tipo Llama del modelo base. Su relevancia radica en ofrecer una alternativa ajustada y especializada para el ecosistema coreano de procesamiento de lenguaje natural, con licencia Apache-2.0 y un pipeline de entrenamiento reproducible. Está pensado para investigación y evaluación, no para uso en producción de alto riesgo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (tipo Llama, basado en `skt/A.X-3.1-Light`) |
| Parametros totales | 7.264.800.768 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (máximo de entrenamiento; contexto del modelo base no especificado) |
| Tipos de cuantizacion | No especificado; formato original BF16, compatible con cuantizaciones posteriores (GPTQ, AWQ, GGUF) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache-2.0 (con términos adicionales de SK Telecom y de los datasets AI Hub) |
| Formato de pesos | safetensors (BF16, pesos completos fusionados) |

## Arquitectura y entrenamiento

El modelo parte de `skt/A.X-3.1-Light`, un modelo de lenguaje de 7,3B parámetros con arquitectura transformer decoder-only similar a Llama. Sobre este base se aplicó un ajuste fino supervisado mediante LoRA con rango 16, alpha 32 y dropout 0.05, atacando todas las proyecciones lineales (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`). El adaptador LoRA se entrenó durante 1 época con una tasa de aprendizaje de 5e-5, batch efectivo de 8, scheduler lineal sin warmup y sin weight decay, sobre 13.801 ejemplos serializados (13.793 efectivos) con una longitud máxima de secuencia de 2048 tokens y precisión BF16. La pérdida final de entrenamiento fue de 1.0446.

El conjunto de datos combina 5.801 ejemplos heredados de una versión anterior (v0.21 answer-first core) con 8.000 ejemplos nuevos seleccionados de ocho datasets de AI Hub, cubriendo áreas como lectura de documentos administrativos, comprensión de textos financieros y legales, problemas de lengua coreana, conocimiento médico, razonamiento causal y datos de post-entrenamiento para modelos fundacionales. La selección fue determinista con semilla 20260831 y no se detectaron prompts duplicados. No se emplearon técnicas de RLHF ni DPO; el objetivo fue exclusivamente la pérdida de entropía cruzada sobre tokens de asistente.

## Capacidades

- Generación de texto en coreano: producción de respuestas fluidas y coherentes en contextos conversacionales y de instrucción.
- Seguimiento de instrucciones: capacidad de ejecutar comandos y responder a peticiones en formato chat mediante la plantilla de chat del modelo base.
- Respuesta a preguntas de opción múltiple: entrenado con datos de tipo VL_multiple_choice y VL_4_daesun, adecuado para tareas de lectura y comprensión.
- Razonamiento y conocimiento general: cubre categorías como ciencia, tecnología, matemáticas, cultura coreana, historia y estudios sociales.
- Formato "answer-first": produce respuestas que comienzan con la respuesta clave, seguidas opcionalmente de una justificación breve.
- Soporte de tool calling y agentes: no disponible en la información proporcionada; no se menciona ninguna capacidad específica de este tipo.
- Capacidades multilingües: el modelo está entrenado únicamente en coreano; no se reportan capacidades en otros idiomas.

## Casos de uso

- Atención al cliente automatizada en coreano: el modelo puede gestionar consultas frecuentes de usuarios en portales de servicio, proporcionando respuestas directas y concisas gracias al formato answer-first. Su ventana de 2048 tokens es suficiente para diálogos de varias interacciones.
- Generación de contenido educativo: puede crear explicaciones breves sobre conceptos de ciencia, matemáticas o historia coreana, útiles para plataformas de aprendizaje automático.
- Análisis de documentos administrativos: entrenado con datos de machine reading sobre documentos públicos, puede extraer respuestas a preguntas concretas de textos legales o administrativos.
- Asistencia en dominios financieros y legales: dado su entrenamiento con datasets de finanzas y derecho, puede responder preguntas de comprensión sobre contratos o normativas, siempre bajo supervisión humana.
- Evaluación de modelos en coreano: al ser un modelo abierto y reproducible, sirve como referencia para benchmarks de razonamiento y comprensión en coreano.
- Investigación académica: útil para estudiar el efecto del ajuste fino con datos de AI Hub sobre un modelo base de 7B, y para comparar estrategias de SFT con LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta métricas como MMLU, HumanEval o KMMLU para este modelo, por lo que no es posible comparar cuantitativamente su rendimiento con otras alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en BF16 ocupa aproximadamente 14,5 GB (tamaño del repositorio). Con cuantización de 8 bits se reduce a ~7,5 GB, y con 4 bits a ~4 GB.
- GPU recomendadas: para BF16 sin cuantización se requiere una GPU con al menos 16 GB de VRAM (p. ej., RTX 4090, A100 40GB). Con cuantización 4 bits puede ejecutarse en GPUs consumer de 8 GB (p. ej., RTX 3070/4060).
- Compatibilidad con consumer GPU: sí, especialmente con cuantización GGUF o AWQ en GPUs de 8-12 GB.
- Opciones de despliegue: transformers (Python), vLLM, TGI (Text Generation Inference), llama.cpp, Ollama.
- Latencia y throughput: no disponible; dependerá del hardware y de la cuantización. En una RTX 4090 con cuantización 4 bits se espera una latencia de decodificación de unos 20-40 ms/token, pero no hay mediciones oficiales.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos para este modelo. Como referencia cualitativa, se puede comparar con otros modelos coreanos de ~7B:

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| youngseok12/AX-3.1-Light-sft_v3_2_aihub_extension | 7,3B | 2048 (entrenamiento) | Apache-2.0 | SFT sobre A.X-3.1-Light con datos AI Hub |
| skt/A.X-3.1-Light (base) | 7,3B | No especificado | Apache-2.0 | Modelo base de SK Telecom |
| EleutherAI/polyglot-ko-5.8b | 5,8B | 2048 | Apache-2.0 | Modelo coreano multilingüe anterior |
| EEVE-Korean-10.8B | 10,8B | 4096 | MIT | Modelo coreano más grande, con mejor rendimiento en algunos benchmarks |

La comparativa exacta requiere ejecutar los mismos benchmarks, lo cual no está disponible en la documentación.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo puede reflejar sesgos presentes en los datos de entrenamiento de AI Hub y del modelo base; no se han realizado auditorías de sesgo.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información incorrecta o fabricada, especialmente en dominios especializados.
- Limitaciones de contexto: la longitud máxima de entrenamiento es de 2048 tokens, lo que limita el manejo de documentos largos o conversaciones extensas.
- Idioma: entrenado exclusivamente en coreano; no se garantiza un rendimiento adecuado en otros idiomas.
- Restricciones de licencia: aunque la licencia es Apache-2.0, el uso comercial debe respetar los términos de SK Telecom sobre el modelo base y los términos de uso de los datasets de AI Hub.
- Advertencia de uso: el autor declara explícitamente que el modelo no debe utilizarse como única fuente para decisiones médicas, legales, financieras o críticas para la seguridad.
- Producción: al ser un modelo de investigación sin validación exhaustiva, se recomienda una evaluación adicional antes de desplegarlo en entornos productivos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/youngseok12/AX-3.1-Light-sft_v3_2_aihub_extension
- Modelo base: https://huggingface.co/skt/A.X-3.1-Light
- Dataset AI Hub 569: https://www.aihub.or.kr/aihubdata/data/view.do?currMenu=115&topMenu=100&aihubDataSe=realm&dataSetSn=569
- Dataset AI Hub 71610: https://www.aihub.or.kr/aihubdata/data/view.do?currMenu=115&topMenu=100&aihubDataSe=realm&dataSetSn=71610
- Dataset AI Hub 71857: https://www.aihub.or.kr/aihubdata/data/view.do?currMenu=115&topMenu=100&aihubDataSe=realm&dataSetSn=71857
- Dataset AI Hub 71874: https://www.aihub.or.kr/aihubdata/data/view.do?currMenu=115&topMenu=100&aihubDataSe=realm&dataSetSn=71874
- Dataset AI Hub 71890: https://www.aihub.or.kr/aihubdata/data/view.do?currMenu=115&topMenu=100&aihubDataSe=realm&dataSetSn=71890
- Dataset AI Hub 71894: https://www.aihub.or.kr/aihubdata/data/view.do?currMenu=115&topMenu=100&aihubDataSe=realm&dataSetSn=71894
- Dataset AI Hub 71904: https://www.aihub.or.kr/aihubdata/data/view.do?currMenu=115&topMenu=100&aihubDataSe=realm&dataSetSn=71904
- Dataset AI Hub 71949: https://www.aihub.or.kr/aihubdata/data/view.do?currMenu=115&topMenu=100&aihubDataSe=realm&dataSetSn=71949
