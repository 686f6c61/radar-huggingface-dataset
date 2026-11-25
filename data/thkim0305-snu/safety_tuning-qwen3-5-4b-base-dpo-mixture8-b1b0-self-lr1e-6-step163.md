# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-B1B0-self-lr1e-6-step163

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-B1B0-self-lr1e-6-step163 es un checkpoint intermedio de ajuste fino mediante DPO (Direct Preference Optimization) sobre el modelo base Qwen/Qwen3.5-4B-Base. Lo publica el usuario thkim0305-SNU y se enmarca en un proceso de alineamiento de seguridad: el objetivo es que el modelo prefiera trayectorias de respuesta que superan un juez binario estricto frente a las que lo fallan, cubriendo tanto contenido benigno como potencialmente dañino, código y consejo difícil.

El checkpoint corresponde a la actualización 163 de 186 (1,75 de 2 épocas), por lo que es una instantánea de un entrenamiento aún en curso y no un modelo final. Los pesos están en bf16 con el formato `Qwen3_5ForConditionalGeneration`; solo se entrenó el modelo de lenguaje, mientras que la torre de visión y la cabeza MTP conservan los pesos originales del base, de modo que el checkpoint se carga exactamente igual que el modelo de referencia.

Con 4.659.865.088 parámetros totales, licencia Apache 2.0 y una ventana de contexto de 32.768 tokens durante el entrenamiento, el modelo resulta relevante para quienes investigan técnicas de alineamiento de seguridad con DPO sobre modelos multimodales de tamaño medio, así como para experimentar con variantes de Qwen3.5-4B afinadas para rechazar peticiones dañinas sin degradar en exceso tareas benignas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (`Qwen3_5ForConditionalGeneration`), con torre de visión y cabeza MTP |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, formato Hugging Face transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base, un transformer multimodal con torre de visión y cabeza MTP (multi-token prediction) que se mantienen congeladas; únicamente se ajustó el modelo de lenguaje. El entrenamiento emplea DPO con objetivo sigmoide, beta 0,1, aplicado sobre la respuesta completa (razonamiento, respuesta y llamadas a herramientas). Los pares de preferencia se construyen con el propio modelo base: la respuesta elegida es una trayectoria de Qwen3.5-4B-Base que superó un juez binario estricto (puntuación 1) y la rechazada es una trayectoria del mismo prompt que falló (puntuación 0), emparejadas una a una sin reutilización.

El conjunto de datos consta de 5.941 pares procedentes de 4.600 prompts, distribuidos en ocho fuentes: agentalign_benign (652 pares), agentalign_harmful (941), codesafetybench (481), difficult_advice (1.027), magicoder (600), star1_gp3 (432), star_benign_v2 (531) y wildjailbreak_benign (1.277). Se entrenó durante 2 épocas con 93 actualizaciones de 64 pares cada una, usando Slime + Megatron-LM en bf16 con estado del optimizador en fp32 y paralelismo tensorial 4 sobre 4 GPU H100 80 GB. El learning rate alcanzó un pico de 1e-06 con calentamiento lineal del 10 % y decaimiento coseno hasta 2e-07; Adam con betas [0,9; 0,95], eps 1e-08, sin weight decay y grad clip 1,0. Las trayectorias de más de 32.768 tokens se excluyeron completas, nunca se truncaron.

## Capacidades

- Generación de texto conversacional y razonamiento con modo de pensamiento (thinking) activable mediante la plantilla de chat.
- Capacidades multimodales de entrada imagen-texto heredadas de Qwen3.5-4B-Base (torre de visión intacta).
- Soporte de tool calling / function calling, ya que el DPO se aplica sobre trayectorias que incluyen llamadas a herramientas.
- Comportamiento orientado a seguridad: preferencia por respuestas que superan un juez de seguridad en escenarios benignos, dañinos y de jailbreak.
- Razonamiento multi-paso y comportamiento agéntico, entrenado con datos de AgentAlign y Star1.
- Generación y razonamiento sobre código, con datos de CodeSafetyBench y Magicoder.
- Capacidades multilingües: no disponibles de forma explícita en la información proporcionada.

## Casos de uso

- Investigación en alineamiento de seguridad: sirve como punto de comparación entre el modelo base y su versión afinada con DPO para medir la tasa de rechazo ante prompts dañinos (AgentAlign harmful, WildJailbreak).
- Evaluación de robustez frente a jailbreaks: al haberse entrenado con pares de WildJailbreak benigno, permite analizar cómo cambia la respuesta ante prompts adversarios sin sacrificar utilidad.
- Filtrado y moderación de contenido en pipelines: el modelo puede clasificar o reescribir respuestas potencialmente inseguras en aplicaciones de atención al cliente, aprovechando su preferencia por trayectorias que superan el juez de seguridad.
- Asistentes de código con salvaguardas: gracias a los datos de CodeSafetyBench y Magicoder, es adecuado para experimentar con generación de código que evite patrones inseguros en entornos de CI/CD.
- Consejo sensible (difficult_advice): útil para prototipar asistentes que deban dar recomendaciones delicadas manteniendo un tono y contenido alineados con criterios de seguridad.
- Agentes con tool calling: su entrenamiento sobre trayectorias agénticas (AgentAlign) permite probar flujos multi-paso con llamadas a herramientas en los que la seguridad del plan importa.
- Base para posteriores etapas de alineamiento: al ser un checkpoint intermedio, sirve para estudiar la evolución de las preferencias a lo largo del entrenamiento (actualizaciones 23, 47, 70, 93, 116, 140, 163, 186).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 9,3 GB solo para los pesos (tamaño del repo), más overhead de activaciones y caché KV; se recomienda al menos 16-24 GB para contexto largo.
- GPU recomendadas: H100 80 GB (usadas en el entrenamiento, 4 unidades con TP=4), A100 80 GB; para inferencia cabe en una sola GPU de 24 GB en bf16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090 (24 GB) en bf16; en GPUs de 12-16 GB requeriría cuantización, para la cual no se publican pesos pre-cuantizados.
- Opciones de despliegue: transformers (carga directa con `Qwen3_5ForConditionalGeneration`), endpoints compatibles según los tags; vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-B1B0-self-lr1e-6-step163 | 4,66 B | 32.768 | Apache 2.0 | Checkpoint DPO intermedio (163/186 updates) |
| Qwen/Qwen3.5-4B-Base | 4,66 B (aprox.) | no disponible | Apache 2.0 | Modelo base sin alineamiento de seguridad DPO |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | No se dispone de datos de rendimiento comparativo |

La única comparación fiable es con el propio modelo base, del que este checkpoint es una variante afinada con DPO; no se dispone de datos de benchmarks que permitan comparar el rendimiento con otras familias.

## Limitaciones y advertencias

- Es una instantánea intermedia (1,75 de 2 épocas): no es un modelo final y su comportamiento puede no estar estabilizado.
- Riesgo de alucinación inherente a los modelos de lenguaje; el DPO de seguridad no elimina errores factuales.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Idiomas: no se especifican los idiomas soportados ni la cobertura multilingüe del ajuste.
- El alineamiento se basa en un juez binario automático, lo que puede producir sobre-rechazo o lagunas ante categorías de daño no cubiertas por las ocho fuentes de datos.
- Contexto limitado a 32.768 tokens; las trayectorias más largas se descartaron durante el entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda validar el comportamiento de seguridad antes de desplegarlo en producción, dado su carácter de checkpoint en curso.
- Solo se entrenó el modelo de lenguaje; las capacidades de visión no fueron ajustadas y conservan el comportamiento del base.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-B1B0-self-lr1e-6-step163
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Papers, blogs, repos y demos adicionales: no disponibles en la información proporcionada.
