# stratosphere/qwen2.5-1.5b-slips-immune-risk

## Resumen

El modelo `stratosphere/qwen2.5-1.5b-slips-immune-risk` es un ajuste fino supervisado (SFT) de Qwen2.5-1.5B-Instruct, desarrollado por el grupo Stratosphere (Stratosphere IPS) para el análisis automatizado de incidentes de red detectados por Slips IDS. Slips genera registros de alertas estructurados como DAG (grafos acíclicos dirigidos) que encadenan eventos de seguridad por IP de origen y ventana temporal; este modelo consume esos DAG en bruto y produce dos análisis complementarios sobre el mismo incidente.

La primera tarea es el **análisis de causa**: clasifica el incidente entre actividad maliciosa, comportamiento legítimo o error de configuración, con razonamiento estructurado e hipótesis alternativas. La segunda es la **evaluación de riesgo**: genera un nivel de riesgo calibrado, una declaración de impacto de negocio, la probabilidad de actividad maliciosa y una prioridad de investigación. Ambas tareas se cubren con un único adaptador LoRA sobre una base de 1.543.714.304 parámetros (1,5B) con contexto nativo de 32.768 tokens en Qwen2.5, aunque la configuración de evaluación del autor fija 8.192 tokens.

Su relevancia práctica radica en que reduce el coste de triaje en SOC: un modelo de 1,5B puede ejecutarse en CPU (incluida una Raspberry Pi 5) con cuantizaciones GGUF, lo que permite desplegar asistencia de análisis directamente junto al sensor IDS sin depender de APIs externas ni de GPU dedicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino con LoRA/SFT sobre Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.543.714.304 (1,5B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en la base Qwen2.5; 8.192 tokens configurados en la evaluación y en los tags de Ollama |
| Tipos de cuantizacion | GGUF q4_k_m, q5_k_m, q8_0 (publicados en Ollama Hub); pesos completos en safetensors (fp16/bf16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 3,1 GB), GGUF (tags de Ollama) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only denso con atención por grupos de consultas (GQA) y RoPE, y se ajusta mediante SFT con LoRA (herramientas TRL y Unsloth) sobre el dataset `stratosphere/immune-risk-sft-dataset`. El entrenamiento combina las dos tareas (causa y riesgo) en un único adaptador, de modo que el mismo checkpoint responde a dos formatos de prompt distintos aplicados al mismo DAG de incidente.

La innovación metodológica destacable es la selección **best-of-N** de las respuestas de entrenamiento: para cada incidente se generaron candidatas con GPT-4o, GPT-4o-mini, Qwen2.5 3B y Qwen2.5 1.5B, y se eligió como verdad de referencia la mejor puntuada por un juez LLM. Esto produce un corpus de respuestas de alta calidad y estructura consistente sin anotación humana directa. No se documentan en la información disponible detalles sobre volumen de tokens de entrenamiento, composición exacta del dataset ni fases de RLHF/DPO posteriores al SFT.

## Capacidades

- Análisis de causa de incidentes de red: clasificación en actividad maliciosa, actividad legítima o mala configuración, con hipótesis alternativas y conclusión con recomendación de investigación.
- Evaluación de riesgo: nivel de riesgo calibrado, impacto de negocio, probabilidad de actividad maliciosa y prioridad de investigación.
- Interpretación de registros DAG de Slips IDS (cadenas de eventos por IP de origen y ventana temporal).
- Razonamiento estructurado con formato de salida fijo (secciones **Possible Causes**, **1. Malicious Activity**, **2. Legitimate Activity**, **3. Misconfigurations**, **Conclusion**).
- Generación de texto conversacional en inglés, heredada de la base instruct.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Triaje automatizado en SOC: el modelo recibe el DAG de alertas de Slips y devuelve causa probable y prioridad de investigación, reduciendo el tiempo que un analista dedica a incidentes de bajo riesgo antes de escalarlos.
- Despliegue en el borde junto al sensor IDS: con cuantización q4_k_m y llama.cpp en CPU, puede ejecutarse en el mismo dispositivo que captura tráfico (por ejemplo, una Raspberry Pi 5), sin enviar telemetría de red a servicios externos.
- Enriquecimiento de tickets de SIEM/SOAR: la salida estructurada (causa, impacto, probabilidad de malicia) se puede mapear directamente a campos de un ticket o a reglas de escalado automático.
- Distinción entre ataque real y mala configuración: el formato de tres categorías ayuda a separar falsos positivos operativos (por ejemplo, escaneos internos legítimos o reglas mal definidas) de actividad maliciosa genuina.
- Informes de turno para analistas: la sección de conclusión y la declaración de impacto de negocio sirven como borrador de resumen para el handover entre turnos.
- Formación y validación de analistas: el modelo puede generar hipótesis alternativas razonadas sobre incidentes históricos, útiles para revisar decisiones de triaje pasadas.
- Procesamiento por lotes de incidentes históricos: al ser un modelo pequeño, permite reclasificar grandes volúmenes de DAG almacenados para calibrar umbrales de alerta de Slips.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona únicamente una comparación cualitativa: la versión `stratosphere/qwen3.5-0.8b-slips-immune-risk`, entrenada con los mismos datos, obtiene puntuaciones similares a este modelo con aproximadamente la mitad de tamaño y mayor velocidad en CPU.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB en fp16 para los 1,5B parámetros; en torno a 1 GB con GGUF q4_k_m y 1,7 GB con q8_0 (estimaciones a partir del tamaño de parámetros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM es suficiente para fp16; A100/H100 no son necesarias para este tamaño.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; también en CPU pura.
- Opciones de despliegue: Ollama (tags q4_k_m, q5_k_m, q8_0 en Ollama Hub), llama.cpp (`llama-server -c 8192 --temp 0 -fa off`), Transformers con `device_map="auto"` y text-generation-inference (el repo declara compatibilidad con endpoints).
- Latencia y throughput: en CPU, llama.cpp es entre 1,5 y 2,5 veces más rápido que Ollama según la model card; no se publican cifras absolutas de tokens por segundo. Los tags de Ollama fijan `num_ctx` a 8.192 y `num_predict` a 512.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| stratosphere/qwen2.5-1.5b-slips-immune-risk | 1,5B | 32.768 (8.192 en evaluación) | Apache 2.0 | Especializado en causa y riesgo de incidentes Slips; GGUF y Ollama |
| stratosphere/qwen3.5-0.8b-slips-immune-risk | ~0,8B | no disponible | no disponible | Mismos datos de entrenamiento; puntuaciones similares según el autor, más rápido en CPU |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | Apache 2.0 | Base generalista; no especializado en análisis de incidentes IDS |
| Qwen2.5 3B (usado en best-of-N) | 3B | 32.768 | Apache 2.0 | Mayor tamaño; participó como generador candidato en el dataset, no como modelo desplegado |

## Limitaciones y advertencias

- Especialización estrecha: está entrenado para el formato de DAG de Slips IDS; su rendimiento fuera de ese esquema de entrada no está documentado y probablemente sea deficiente.
- Solo inglés: la model card declara únicamente `en`; no hay evidencia de calidad en castellano.
- Riesgo de alucinación: al generar hipótesis de causa y niveles de riesgo, puede producir atribuciones plausibles pero incorrectas; las salidas deben tratarse como asistencia al analista, no como veredicto.
- Calibración del riesgo no verificada: no se publican métricas de calibración ni benchmarks que respalden los niveles de riesgo generados.
- Sesgos: no se documentan evaluaciones de sesgo; el corpus best-of-N hereda los sesgos de los modelos generadores (GPT-4o, GPT-4o-mini, Qwen2.5), incluido un posible sesgo hacia la categoría de actividad maliciosa en incidentes ambiguos.
- Dependencia de la calidad del DAG de entrada: si Slips produce registros incompletos o ruidosos, el análisis de causa se degrada sin aviso.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías; conviene revisar también la licencia de la base Qwen2.5-1.5B-Instruct (Apache 2.0).
- Configuración sensible: los tags de Ollama anteriores a noviembre de 2026 no fijan `num_ctx` ni `num_predict`, lo que puede alterar el comportamiento respecto a la evaluación; es necesario volver a descargar el tag.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stratosphere/qwen2.5-1.5b-slips-immune-risk
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Modelo base del ajuste (Unsloth): https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/stratosphere/immune-risk-sft-dataset
- Versión reducida: https://huggingface.co/stratosphere/qwen3.5-0.8b-slips-immune-risk
- Slips IDS (StratosphereLinuxIPS): https://github.com/stratosphereips/StratosphereLinuxIPS
- Tags en Ollama Hub: https://ollama.com/stratosphere/qwen2.5-1.5b-slips-immune-risk
