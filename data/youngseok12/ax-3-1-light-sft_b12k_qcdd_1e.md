# youngseok12/AX-3.1-Light-sft_B12K_qcdd_1e

## Resumen

El modelo `youngseok12/AX-3.1-Light-sft_B12K_qcdd_1e` es un ajuste fino supervisado (SFT) del modelo coreano `skt/A.X-3.1-Light`, desarrollado por el usuario independiente youngseok12. Se trata de un modelo de lenguaje de 7.264 millones de parámetros (7,26B) en formato denso, entrenado con LoRA y posteriormente fusionado en los pesos base, de modo que no requiere adaptadores adicionales para inferencia. El objetivo es mejorar la respuesta a preguntas y el seguimiento de instrucciones en coreano, priorizando la respuesta directa y opcionalmente una razón breve.

La relevancia de este modelo radica en su especialización en tareas de comprensión lectora y razonamiento sobre dominios específicos del ecosistema AI Hub coreano: administración pública, finanzas, derecho, educación y medicina. Al estar basado en Apache-2.0 y derivar de un modelo con licencia permisiva, puede integrarse en proyectos comerciales con las debidas atribuciones. Su tamaño (7B) lo hace viable en GPUs de consumo con cuantización, y su formato BF16 fusionado simplifica el despliegue en frameworks estándar como Transformers o vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tipo Llama, según tags) |
| Parametros totales | 7.264.800.768 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (contexto de entrenamiento: 2.048 tokens) |
| Tipos de cuantizacion | No disponible (pesos BF16; se pueden generar cuantizaciones GGUF/AWQ a partir de los pesos) |
| Idiomas soportados | Coreano (principal) |
| Licencia | Apache-2.0 (con términos adicionales de SK Telecom y AI Hub) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo se basa en `skt/A.X-3.1-Light`, un modelo de lenguaje de tipo transformer con arquitectura similar a Llama, aunque no se especifican detalles adicionales como número de capas o cabezas de atención. El ajuste fino se realizó mediante LoRA (rank 16, alpha 32, dropout 0.05) sobre las proyecciones de atención y las capas feed-forward (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`). El entrenamiento se ejecutó en BF16 con una época, tasa de aprendizaje 5e-5, batch efectivo de 8, longitud máxima de secuencia de 2.048 tokens y optimizador AdamW fusionado. Se usaron 12.000 ejemplos seleccionados de un universo de 258.170 candidatos limpios de AI Hub, aplicando un criterio de selección por calidad, complejidad, dificultad y diversidad. El objetivo de entrenamiento fue el formato `정답: <respuesta> (근거: <razón corta>)`, priorizando la respuesta primero y una razón opcional. De los ejemplos, 8.851 incluían razonamiento y 3.149 no. Nueve ejemplos de contexto largo requirieron recorte, pero ningún objetivo de entrenamiento fue truncado.

## Capacidades

- Generación de texto en coreano con formato de respuesta primero y razón opcional.
- Comprensión lectora y respuesta a preguntas sobre documentos administrativos, financieros, legales, educativos y médicos.
- Seguimiento de instrucciones conversacionales mediante el chat template incluido en el tokenizador.
- Razonamiento de sentido común y lógica básica, evaluado en tareas como SNU Ko-MuSR y Com2-main.
- Capacidad multilingüe limitada: el modelo está entrenado principalmente en coreano, aunque puede generar texto en otros idiomas con menor calidad.
- No se especifica soporte para tool calling, agentes o modos de razonamiento extendido (thinking mode).

## Casos de uso

- Atención al cliente automatizada en coreano: el modelo puede gestionar consultas multi-turno sobre productos o servicios, gracias a su entrenamiento en instrucciones y su formato de respuesta directa. Su ventana de contexto de 2.048 tokens es suficiente para diálogos cortos y preguntas frecuentes.
- Análisis de documentos administrativos: permite extraer respuestas concretas de textos gubernamentales o normativos, como los del dataset AI Hub 569 (mecanizado de lectura de documentos administrativos). Es útil para asistentes de trámites o consultas ciudadanas.
- Asistencia legal y financiera: con los datos de los datasets 71610 (finanzas y derecho) y 71874 (medicina), puede responder preguntas sobre contratos, cláusulas o información médica general, siempre con supervisión humana y sin sustituir el criterio profesional.
- Educación y evaluación: el modelo puede generar preguntas de comprensión lectora a partir de textos educativos (dataset 71857) o responder a ejercicios tipo test, sirviendo como herramienta de práctica para estudiantes de coreano.
- Generación de contenido coreano: puede redactar resúmenes, explicaciones o respuestas a preguntas abiertas en coreano, con un estilo conciso y orientado a la respuesta.
- Investigación en PNL coreana: al ser un modelo abierto y con licencia Apache-2.0, es adecuado para experimentos de fine-tuning adicional, evaluación de benchmarks coreanos o desarrollo de prototipos en entornos académicos.

## Benchmarks y rendimiento

El autor proporciona resultados de evaluación local (proxy) sobre la suite canónica KDS, no oficiales del leaderboard K-AI. Se usó la sonda determinista `B1_constrained` y el promedio es la media no ponderada de cinco ejes principales. HLE se evaluó solo en la subdivisión de texto; MuSR original es complementario.

| Metrica | Puntuacion |
|---|---|
| Promedio de ejes principales | 42,56% |
| KMMLU-Pro | 37,88% |
| CLIcK | 65,01% |
| HLE (solo texto) | 4,68% |
| SNU Ko-MuSR | 53,07% |
| Com2-main | 52,16% |

Estos resultados indican un rendimiento moderado en razonamiento y conocimiento general coreano, con fortalezas relativas en comprensión lectora (CLIcK) y razonamiento narrativo (SNU Ko-MuSR), pero bajo en tareas de conocimiento enciclopédico (KMMLU-Pro) y muy bajo en razonamiento avanzado tipo HLE.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos BF16 (14,5 GB), se necesitan al menos 16 GB de VRAM para cargar el modelo completo con overhead de activaciones y KV cache. Con cuantización de 8 bits, ~8 GB; con 4 bits, ~5 GB.
- GPUs recomendadas: RTX 3090/4090 (24 GB) para BF16 sin cuantizar; A100 (40/80 GB) para despliegue con batch grande o contexto largo; GPUs de 8-12 GB (RTX 3080, RTX 4070) con cuantización 4 bits.
- Compatibilidad con GPUs de consumo: sí, con cuantización (GGUF/AWQ) en GPUs de 8 GB o más.
- Opciones de despliegue: Transformers (carga estándar), vLLM, TGI (text-generation-inference), llama.cpp, Ollama (si se convierte a GGUF).
- Latencia y throughput: no disponibles; dependen del hardware y del framework. En una RTX 4090 con vLLM y cuantización 4 bits, se puede esperar una latencia de ~20-40 ms por token y un throughput de ~50-100 tokens/s, pero estos valores son estimaciones no verificadas.

## Comparativa con modelos similares

No se han publicado comparativas directas con otros modelos en la información disponible. El modelo se puede comparar con su base `skt/A.X-3.1-Light` y con otros ajustes del mismo autor, pero no se dispone de métricas de rendimiento para estos últimos. A continuación se muestra una tabla orientativa con modelos coreanos de tamaño similar, aunque sin datos de benchmarks comparables.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| AX-3.1-Light-sft_B12K_qcdd_1e (este) | 7,26B | No disponible (entrenado a 2.048) | Apache-2.0 | SFT sobre A.X-3.1-Light, especializado en QA coreano |
| skt/A.X-3.1-Light | 7,26B (presumible) | No disponible | Apache-2.0 | Modelo base, sin ajuste por instrucciones |
| EEVE-Korean-10.8B | 10,8B | 32k (presumible) | CC-BY-NC-SA | Modelo coreano de mayor tamaño, pero con licencia no comercial |
| PolyLM-13B | 13B | 2.048 | Apache-2.0 | Multilingüe, incluye coreano, pero más grande y menos especializado |

No se dispone de datos de rendimiento comparativo entre estos modelos en las mismas tareas.

## Limitaciones y advertencias

- El modelo puede producir respuestas incorrectas, incompletas o mal formateadas, especialmente en dominios especializados como medicina, derecho o finanzas. No debe usarse como única base para decisiones de alto impacto.
- La ventana de contexto de entrenamiento es de 2.048 tokens, lo que limita el manejo de documentos largos o conversaciones extensas. Aunque el modelo base podría soportar contextos mayores, no se ha verificado.
- El entrenamiento se realizó con datos de AI Hub, cuyos términos de uso deben respetarse. La licencia Apache-2.0 del modelo base se aplica, pero los datos de origen pueden tener restricciones adicionales.
- El modelo está optimizado para coreano; su rendimiento en otros idiomas es limitado y no se ha evaluado.
- No se han publicado análisis de sesgos o alucinaciones específicos para este modelo. Como todo LLM, puede reflejar sesgos presentes en los datos de entrenamiento.
- Los benchmarks reportados son proxy locales, no oficiales, y pueden no reflejar el rendimiento en entornos reales o en el leaderboard K-AI.
- No se proporciona soporte para tool calling, agentes o razonamiento multi-paso avanzado; el modelo está diseñado para respuestas directas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/youngseok12/AX-3.1-Light-sft_B12K_qcdd_1e
- Modelo base: https://huggingface.co/skt/A.X-3.1-Light
- Otros ajustes del autor: https://huggingface.co/youngseok12/AX-3.1-Light-sft_v3_1_C_recommended y https://huggingface.co/youngseok12/AX-3.1-Light-sft_v3_0
- Despliegue en FriendliAI: https://friendli.ai/models/youngseok12/AX-3.1-Light-sft_v3_1_A_control y https://friendli.ai/models/youngseok12/AX-3.1-Light-sft_v3_0
