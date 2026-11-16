# wayne-SFT/Llama-3.2-3B-Instruct-SFT-ALFWorld

## Resumen

Llama-3.2-3B-Instruct-SFT-ALFWorld es un ajuste fino supervisado (SFT) de parámetros completos sobre `meta-llama/Llama-3.2-3B-Instruct`, desarrollado por el usuario wayne-SFT. El modelo está especializado en el entorno ALFWorld, un benchmark de tareas domésticas basadas en texto donde un agente debe completar objetivos mediante comandos en lenguaje natural (navegar entre habitaciones, recoger objetos, usar electrodomésticos). El objetivo declarado es servir como punto de partida de behavior cloning para un posterior entrenamiento con aprendizaje por refuerzo (RL), no como modelo de propósito general.

El modelo conserva la arquitectura transformer densa de Llama 3.2 3B, con 3.212.749.824 parámetros y sin mezcla de expertos. El ajuste se realizó únicamente sobre trayectorias expertas recogidas por el autor en los objetivos de entrenamiento de ALFWorld (dataset interno `alf_sft_hc_n200`), durante 1 época y 200 partidas expertas, con un checkpoint intermedio (paso global 30 de 50). El resultado en el conjunto de desarrollo es una tasa de éxito del 73,3% (media de valid_seen 76,8% y valid_unseen 69,8% sobre 4 semillas de muestreo).

Su relevancia es acotada y muy específica: no compite como modelo conversacional generalista, sino como artefacto de investigación reproducible para experimentos de agentes en entornos textuales y como inicialización para pipelines de RL. La ficha refleja esta naturaleza especializada y advierte de que el uso fuera de ALFWorld degradará el comportamiento respecto al modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.2), decoder-only, con atención causal estándar |
| Parámetros totales | 3.212.749.824 |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el entrenamiento usó max sequence length 1280 |
| Tipos de cuantización | no se publican pesos cuantizados; los safetensors del repo están en fp32 (255 tensores F32). El campo `dtype` de `config.json` indica `bfloat16` |
| Idiomas soportados | no disponible (la model card no declara idiomas; hereda el tokenizador y los datos del modelo base) |
| Licencia | Llama 3.2 Community License (con LICENSE.txt y USE_POLICY.md del modelo base incluidos en el repo) |
| Formato de pesos | safetensors (3 shards, fp32), más tokenizer.json, chat_template.jinja, config.json y generation_config.json |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only denso de 3.212 millones de parámetros con atención causal y tokenizador de Llama 3.2. No hay innovaciones arquitectónicas propias; el autor no modifica la estructura, solo los pesos y la plantilla de chat. La única alteración declarada sobre los archivos del modelo base es la plantilla de chat, donde la fecha actual se fija al 26 de julio de 2024 en lugar de usar `strftime_now`.

El entrenamiento consistió en SFT de parámetros completos (no LoRA) sobre trayectorias expertas recogidas por el autor exclusivamente en los objetivos de entrenamiento de ALFWorld. Hiperparámetros declarados: learning rate 1e-5, batch global 64, longitud máxima de secuencia 1280, 1 época sobre 200 partidas expertas (50 pasos globales). El checkpoint publicado corresponde al paso global 30. Los pesos se guardaron tal cual se entrenaron, en fp32, sin conversión posterior. No se menciona RLHF, DPO ni ningún otro ajuste de preferencias; el propio autor describe el modelo como un punto de partida de behavior cloning para RL.

## Capacidades

- Generación de texto conversacional y de instrucciones, heredada del modelo base Llama-3.2-3B-Instruct.
- Ejecución de tareas de agente en entornos textuales estilo ALFWorld: interpretación de observaciones, selección de acciones (ir a, coger, examinar, usar, etc.) y seguimiento de objetivos multi-paso.
- Razonamiento secuencial corto orientado a la resolución de tareas domésticas simuladas.
- Soporte de plantilla de chat de Llama 3.2 (chat_template.jinja incluida).
- Compatibilidad con text-generation-inference y endpoints_compatible, según los tags del repo.
- Tool calling y function calling: no disponible de forma explícita en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.
- Capacidades multilingües específicas: no documentadas.
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso

- Investigación en agentes textuales sobre ALFWorld: usar el modelo como política inicial en experimentos de planificación y ejecución de tareas domésticas simuladas, aprovechando su tasa de éxito del 73,3% en dev-set como referencia de partida.
- Inicialización para RL: el autor lo publica explícitamente como checkpoint de behavior cloning previo a un entrenamiento con refuerzo; encaja como política base en pipelines de RL sobre entornos textuales.
- Reproducción de experimentos: al documentar hiperparámetros, dataset interno, paso global y hashes sha256 de cada archivo, permite replicar o auditar el proceso de SFT.
- Evaluación de técnicas de SFT en modelos pequeños: sirve como caso controlado de ajuste completo de un modelo de 3B sobre un dataset reducido (200 partidas) para estudiar sobreajuste y generalización (valid_seen frente a valid_unseen).
- Generación de trayectorias sintéticas: puede emplearse para producir rollouts iniciales que luego se filtren y se usen como datos de entrenamiento en entornos similares a ALFWorld.
- Estudio de degradación de capacidades generales: comparar su rendimiento en tareas conversacionales frente al modelo base permite medir el coste del ajuste especializado en un modelo de 3B.
- Prototipado de asistentes de instrucciones para dominios estructurados: su formato de acción y observación puede adaptarse a otros entornos de texto con esquema similar, aunque requerirá nuevo ajuste.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| ALFWorld valid_seen | 76,8% success rate | Media de 4 semillas de muestreo |
| ALFWorld valid_unseen | 69,8% success rate | Media de 4 semillas de muestreo |
| ALFWorld dev-set (media) | 73,3% success rate | Media de valid_seen y valid_unseen |

No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K ni otras pruebas de propósito general.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 12,9 GB solo para pesos (3.212.749.824 parámetros × 4 bytes), más overhead de activaciones y caché KV; el repo ocupa 14,4 GB.
- VRAM estimada en bf16/fp16: aproximadamente 6,4 GB para pesos, más activaciones.
- VRAM estimada en cuantización de 8 bits: aproximadamente 3,2 GB para pesos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 1,6 GB para pesos.
- GPU recomendadas: A100 40 GB u H100 para entrenamiento o inferencia en fp32 sin compromisos; RTX 4090 (24 GB) o RTX 3090 (24 GB) suficientes para inferencia en fp32 o bf16.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más usando bf16, y en 4-6 GB con cuantización de 4 bits (aunque no se publican pesos GGUF; habría que generarlos).
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; llama.cpp, Ollama o vLLM no están documentados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-3B-Instruct-SFT-ALFWorld | 3.212.749.824 | no disponible | Agente ALFWorld (SFT) | Llama 3.2 Community | Hugging Face, 0 descargas |
| meta-llama/Llama-3.2-3B-Instruct | 3.212.749.824 | 128k tokens (según el modelo base) | Conversacional general | Llama 3.2 Community | Hugging Face, ampliamente usado |
| Alternativas específicas de ALFWorld | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con otros ajustes de ALFWorld no está disponible en la información proporcionada. Frente al modelo base, la diferencia principal es la especialización: el SFT mejora el comportamiento en ALFWorld a costa de capacidad conversacional general, y no se han publicado métricas de esa degradación.

## Limitaciones y advertencias

- Modelo especializado: el ajuste se hizo solo sobre objetivos de entrenamiento de ALFWorld; fuera de ese entorno o de esquemas de acción similares, el rendimiento caerá respecto al modelo base.
- Riesgo de sobreajuste: 1 época sobre 200 partidas expertas con ajuste completo de 3B parámetros es un régimen propenso a memorizar trayectorias; la brecha valid_seen (76,8%) frente a valid_unseen (69,8%) sugiere cierta pérdida de generalización.
- Checkpoint intermedio: se publica el paso global 30 de 50, no el modelo final del run; puede no ser el punto óptimo.
- Pesos en fp32: el repo ocupa 14,4 GB y el campo `dtype` de `config.json` indica `bfloat16` mientras los tensores son F32; conviene verificar la conversión al cargar para evitar consumo de memoria inesperado.
- Plantilla de chat modificada: la fecha se fija al 26 de julio de 2024, lo que puede afectar a tareas sensibles a la fecha actual.
- Sesgos y alucinaciones: no se documentan sesgos específicos; al heredar el modelo base, arrastra los sesgos de sus datos de preentrenamiento. En tareas de agente, el riesgo principal es la generación de acciones inválidas o bucles, no la alucinación factual clásica.
- Idiomas: no se declaran idiomas soportados; el entrenamiento en ALFWorld es en inglés, por lo que el uso en castellano no está validado.
- Licencia: Llama 3.2 Community License impone restricciones de uso (incluida la política de uso aceptable en USE_POLICY.md) y obligaciones de atribución; revisar antes de uso comercial.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wayne-SFT/Llama-3.2-3B-Instruct-SFT-ALFWorld
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Licencia del modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct/blob/main/LICENSE.txt
- Política de uso del modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct/blob/main/USE_POLICY.md
- Paper de ALFWorld: no disponible en la información proporcionada
- Repositorio o demo del autor: no disponible en la información proporcionada
