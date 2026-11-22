# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr1e-5-step548

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr1e-5-step548 es un checkpoint intermedio de ajuste fino supervisado (SFT) sobre el modelo base Qwen/Qwen3.5-4B-Base, desarrollado por el usuario thkim0305-SNU. El modelo se entrena con el objetivo de mejorar el comportamiento de seguridad del modelo base, aprendiendo de trayectorias generadas por un profesor de mayor tamaño (Qwen/Qwen3.8-27B) sobre un conjunto de datos de seguridad denominado "mixture-8". El checkpoint corresponde a la actualización 548 de 730 previstas, es decir, 1,5 de 2 épocas, por lo que se trata de una instantánea y no de un modelo final.

El modelo conserva la arquitectura multimodal del base Qwen3.5-4B (clase `Qwen3_5ForConditionalGeneration`), con 4.659.865.088 parámetros totales en bf16. Solo se ha entrenado el modelo de lenguaje; la torre de visión y la cabeza MTP mantienen los pesos originales del base. El contexto de entrenamiento es de 32.768 tokens y los pesos se distribuyen en safetensors con licencia Apache 2.0.

Su relevancia es doble: por un lado, documenta una receta completa de SFT de seguridad con destilación desde un profesor mayor y herramientas como Slime y Megatron-LM; por otro, al ser un checkpoint intermedio, permite estudiar la evolución del comportamiento de seguridad a lo largo del entrenamiento y sirve como punto de partida para experimentos de alineación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (`Qwen3_5ForConditionalGeneration`); torre de visión y cabeza MTP del base sin entrenar |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (contexto de entrenamiento; el contexto máximo del base no se especifica) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, formato Hugging Face transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base, un transformer multimodal de la familia Qwen3.5 que incluye torre de visión y cabeza de predicción multi-token (MTP). En este checkpoint solo se ha ajustado el modelo de lenguaje mediante SFT de parámetros completos sobre trayectorias de un profesor (Qwen/Qwen3.8-27B, snapshot `1d4bf0f2ff60`), con pérdida calculada sobre el razonamiento, la respuesta final y las llamadas a herramientas. El entrenamiento se realizó con Slime y Megatron-LM en bf16 con estado del optimizador en fp32, sobre una NVIDIA B200.

El conjunto de datos "mixture-8" consta de 46.626 trayectorias procedentes de 11.757 prompts, con 2 épocas de 365 actualizaciones de 128 secuencias cada una. Las fuentes son star1_gp3 (3.998), star_benign_v2 (3.651), agentalign_harmful (7.919), agentalign_benign (7.734), codesafetybench (3.598), magicoder (3.838), difficult_advice (7.905) y wildjailbreak_benign (7.983). El profesor generó cuatro respuestas muestreadas por prompt y se conservaron todas las válidas; las fuentes dañinas regeneradas usaron prompts de generación v2 con MODEL_SPEC_V2 (GP3). Se empleó una tasa de aprendizaje de 1e-5 con calentamiento lineal del 10 % y decaimiento coseno hasta 2e-6, Adam con betas [0,9; 0,95], eps 1e-8, weight decay 0,1 y recorte de gradiente 1,0. Las trayectorias más largas de 32.768 tokens se excluyeron completas, nunca truncadas. El prompt del estudiante usa la plantilla nativa del base con system "You are a helpful assistant." y thinking activado, sin Model Spec.

## Capacidades

- Generación de texto conversacional con plantilla de chat nativa de Qwen3.5 y modo thinking activable.
- Razonamiento multi-paso: el entrenamiento incluye pérdida sobre las trazas de razonamiento del profesor.
- Llamadas a herramientas (tool calling): parte de la pérdida se calcula sobre las llamadas a herramientas de las trayectorias.
- Comportamiento orientado a seguridad: entrenado sobre fuentes de seguridad, benignas y dañinas (agentalign, wildjailbreak, codesafetybench, difficult_advice).
- Capacidad de código: incluye datos de Magicoder y CodeSafetyBench.
- Entrada image-text-to-text según los tags del repositorio, aunque la torre de visión no fue entrenada en este checkpoint.
- Capacidades multilingües: no disponible (no se documentan idiomas).

## Casos de uso

- Investigación en alineación y seguridad: el checkpoint permite analizar cómo evoluciona el comportamiento de seguridad entre actualizaciones (91, 183, 274, 365, 456, 548, 639, 730) y comparar con el modelo base.
- Evaluación de robustez frente a jailbreaks: al incluir datos de wildjailbreak y agentalign, sirve para medir la resistencia a prompts adversarios en un modelo de 4B.
- Destilación de profesor a estudiante: la receta documentada (Qwen3.8-27B como profesor, cuatro muestras por prompt, filtrado de respuestas válidas) es replicable para otros dominios.
- Agentes con tool calling: el modelo aprende a emitir llamadas a herramientas dentro de trayectorias de razonamiento, útil para prototipos de agentes con contexto de hasta 32K tokens.
- Generación de código seguro: los datos de CodeSafetyBench y Magicoder permiten evaluar si el modelo evita patrones inseguros en la generación de código.
- Base para SFT posterior: al ser un checkpoint intermedio con licencia Apache 2.0, puede usarse como punto de partida para ajustes específicos de dominio o para continuar el entrenamiento hasta la época 2.
- Análisis de consejo difícil (difficult_advice): útil para estudiar respuestas matizadas en consultas sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 9,3 GB solo para pesos (4.659.865.088 parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomiendan 16-24 GB para contexto moderado.
- Cuantización a 8 bits: en torno a 5 GB de pesos; a 4 bits, en torno a 2,5-3 GB (estimación teórica, no se publican GGUF oficiales).
- GPU recomendadas: el autor entrenó en 1× NVIDIA B200; para inferencia son adecuadas A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) en bf16 con contexto limitado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y potencialmente en RTX 3090 (24 GB) con bf16 y contexto reducido; en GPUs de 12-16 GB requeriría cuantización.
- Opciones de despliegue: transformers (receta oficial de la model card), vLLM y TGI para servir en producción; llama.cpp/Ollama solo si se generan conversiones GGUF (no publicadas).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr1e-5-step548 | 4,66B | 32.768 (entrenamiento) | Apache 2.0 | Checkpoint intermedio de SFT de seguridad, sin benchmarks publicados |
| Qwen/Qwen3.5-4B-Base | 4B (clase) | no disponible | Apache 2.0 | Modelo base sin ajuste de seguridad; referencia directa |
| Qwen/Qwen3.8-27B | 27B (clase) | no disponible | no disponible | Profesor usado para generar las trayectorias; mayor tamaño y capacidad |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde a 548 de 730 actualizaciones (1,5 de 2 épocas); el entrenamiento seguía en curso y no es un modelo final.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora en seguridad ni de posibles regresiones en capacidades generales.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se documentan evaluaciones de fidelidad.
- Sesgos: no se documenta análisis de sesgos; los datos incluyen fuentes dañinas y benignas de terceros cuya composición puede introducir sesgos.
- Idiomas: no se especifican idiomas soportados; el prompt del estudiante está en inglés y la cobertura multilingüe es incierta.
- Contexto: las trayectorias de más de 32.768 tokens se excluyeron, lo que puede limitar el comportamiento en contextos muy largos.
- Uso comercial: la licencia Apache 2.0 lo permite, pero al ser un checkpoint de investigación sin validación en producción, se recomienda evaluación propia antes de desplegarlo.
- Visión: aunque el repositorio se etiqueta como image-text-to-text, la torre de visión no fue entrenada, por lo que su comportamiento multimodal no está validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr1e-5-step548
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Profesor (Qwen3.8-27B): https://huggingface.co/Qwen/Qwen3.8-27B
- Slime (framework de entrenamiento): no disponible enlace en la información proporcionada
- Megatron-LM: no disponible enlace en la información proporcionada
