# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr1e-5-step456

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr1e-5-step456 es un checkpoint intermedio de ajuste fino supervisado (SFT) sobre el modelo base Qwen/Qwen3.5-4B-Base, desarrollado por el usuario thkim0305-SNU. El objetivo declarado es el alineamiento de seguridad: el modelo se entrena sobre trayectorias destiladas de un profesor mayor (Qwen/Qwen3.8-27B) para aprender a responder de forma segura ante peticiones benignas y potencialmente dañinas, incluyendo escenarios agénticos y de seguridad de código.

El checkpoint corresponde al update de optimizador 456 de un total de 730 (1,25 de 2 épocas), por lo que no es un modelo final sino una instantánea de un entrenamiento todavía en curso. Los pesos se exportan en bf16 como `Qwen3_5ForConditionalGeneration`; solo se ha entrenado el modelo de lenguaje, mientras que la torre de visión y la cabeza MTP conservan los pesos originales del base.

Con 4.659.865.088 parámetros totales y una ventana de contexto de entrenamiento de 32.768 tokens, es relevante para quienes investigan técnicas de safety tuning, destilación de trayectorias y pipelines de SFT a gran escala con Slime y Megatron-LM. Su licencia Apache 2.0 facilita la experimentación, aunque su naturaleza de snapshot intermedio limita su uso directo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `Qwen3_5ForConditionalGeneration` (modelo de lenguaje entrenado; torre de visión y cabeza MTP congeladas del base) |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, formato Hugging Face transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base (snapshot `1001bb4d826a`) y se entrena con SFT de parámetros completos sobre trayectorias generadas por un profesor, Qwen/Qwen3.8-27B (snapshot `1d4bf0f2ff60`). La pérdida se calcula sobre el razonamiento, la respuesta final y las llamadas a herramientas. El prompt del estudiante usa la plantilla de chat nativa del base, con system prompt "You are a helpful assistant." y modo thinking activado, sin Model Spec.

El entrenamiento se ejecuta con Slime + Megatron-LM en bf16 con estado del optimizador en fp32, sobre 46.626 trayectorias procedentes de 11.757 prompts, durante 2 épocas con 365 updates de 128 secuencias cada una. Se emplea learning rate pico de 1e-05 con warmup lineal del 10 % y decaimiento coseno hasta 2e-06, Adam con betas [0.9, 0.95], eps 1e-08, weight decay 0.1 y grad clip 1.0. Las trayectorias más largas de 32.768 tokens se excluyen completas, nunca se truncan. El conjunto "mixture-8" combina ocho fuentes: star1_gp3 (3.998), star_benign_v2 (3.651), agentalign_harmful (7.919), agentalign_benign (7.734), codesafetybench (3.598), magicoder (3.838), difficult_advice (7.905) y wildjailbreak_benign (7.983). Para las fuentes dañinas regeneradas se usan prompts específicos (generation_v2 + MODEL_SPEC_V2) con el profesor Qwen3.8-27B, con cuatro respuestas muestreadas por prompt y conservando todas las válidas.

La exportación se realizó desde el checkpoint Megatron torch_dist `iter_0000455` mediante `safety_tuning.hf_export`, re-fusionando las proyecciones GDN, aplicando el mapeo de nombres Qwen3.5 de Slime y copiando los pesos de visión y MTP del base. La ejecución se llevó a cabo en 1x NVIDIA B200.

## Capacidades

- Generación de texto conversacional con plantilla de chat nativa y modo thinking activable.
- Razonamiento multi-paso: el entrenamiento incluye pérdida sobre trazas de razonamiento del profesor.
- Llamadas a herramientas (tool calling): la pérdida cubre explícitamente las tool calls.
- Comportamiento agéntico: datos de agentalign_harmful y agentalign_benign orientados a escenarios con agentes.
- Seguridad de código: entrenado con codesafetybench y magicoder.
- Manejo de peticiones dañinas y jailbreaks: fuentes wildjailbreak_benign y difficult_advice.
- Capacidad multimodal heredada del base (torre de visión intacta), aunque no se ha entrenado en esta fase.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Investigación en safety tuning: sirve como checkpoint de referencia para estudiar la evolución del alineamiento de seguridad a lo largo de las épocas (hay checkpoints en los updates 91, 183, 274, 365, 456, 548, 639 y 730).
- Evaluación de destilación de trayectorias: permite analizar cómo un estudiante de 4B aproxima el comportamiento de un profesor de 27B en tareas de razonamiento y seguridad.
- Generación de código con conciencia de seguridad: el entrenamiento con codesafetybench y magicoder lo hace adecuado para probar respuestas ante peticiones de código potencialmente peligroso.
- Simulación de agentes con tool calling: útil para validar pipelines agénticos donde el modelo debe decidir cuándo invocar herramientas y cómo razonar antes de responder.
- Red teaming y evaluación de robustez: al haber sido entrenado con wildjailbreak_benign y difficult_advice, sirve como sujeto de pruebas en estudios de jailbreak.
- Baseline para comparativas de SFT: al ser un snapshot intermedio con receta reproducible (Slime + Megatron-LM), facilita la comparación con otros checkpoints del mismo run.
- Experimentación académica: con licencia Apache 2.0 y 4,6B parámetros, es viable en entornos de investigación con una sola GPU de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomienda al menos 16-24 GB para contexto moderado.
- Cuantización: no se han publicado versiones GGUF ni cuantizadas; habría que generarlas a partir de los safetensors bf16.
- GPU recomendadas: el entrenamiento se realizó en 1x NVIDIA B200; para inferencia son adecuadas A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) en bf16 con contexto limitado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) o RTX 3090 (24 GB) en bf16 para contextos moderados; en GPUs de 16 GB requeriría cuantización.
- Opciones de despliegue: transformers (probado por el autor), vLLM y TGI previsiblemente compatibles al ser un modelo Qwen3.5 estándar; llama.cpp/Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr1e-5-step456 | 4,66B | 32.768 | Apache 2.0 | Snapshot intermedio de SFT de seguridad; sin benchmarks publicados |
| Qwen/Qwen3.5-4B-Base | no disponible en la informacion | no disponible en la informacion | Apache 2.0 | Modelo base sin ajuste de seguridad; referencia directa |
| Qwen/Qwen3.8-27B | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | Profesor usado para destilar las trayectorias; mucho mayor |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio (update 456 de 730, 1,25 de 2 épocas): no es un modelo final y su comportamiento puede ser inestable o inconsistente.
- No se han publicado evaluaciones de seguridad ni benchmarks, por lo que no hay evidencia cuantitativa de su eficacia como modelo alineado.
- Riesgo de alucinación inherente a los modelos de 4B y acentuado por el modo thinking y la destilación de un profesor mayor.
- Idiomas soportados no documentados; el rendimiento fuera del inglés es incierto.
- La torre de visión y la cabeza MTP no se han entrenado, por lo que las capacidades multimodales no han sido adaptadas en esta fase.
- El modelo se entrenó con datos que incluyen contenido dañino y jailbreaks; aunque el objetivo es la seguridad, existe riesgo de comportamientos no deseados.
- Uso comercial permitido por Apache 2.0, pero la ausencia de evaluación y su carácter de snapshot desaconsejan su despliegue en producción.
- Sin versiones cuantizadas publicadas, lo que limita el despliegue en hardware modesto sin trabajo adicional de conversión.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr1e-5-step456
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Profesor (referenciado en la model card): Qwen/Qwen3.8-27B
