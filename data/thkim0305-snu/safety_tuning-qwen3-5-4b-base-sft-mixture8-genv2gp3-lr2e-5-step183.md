# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr2e-5-step183

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr2e-5-step183 es un checkpoint intermedio de ajuste fino supervisado (SFT) sobre el modelo base Qwen/Qwen3.5-4B-Base, publicado por el usuario thkim0305-SNU. No se trata de un modelo final, sino de una instantánea del entrenamiento tras 183 de 730 actualizaciones del optimizador (aproximadamente 0,501 de 2 épocas), orientada al alineamiento de seguridad y a la generación de trayectorias de razonamiento y llamadas a herramientas.

El modelo parte de la arquitectura Qwen3.5 con 4.659.865.088 parámetros totales (unos 4,66 mil millones) y se distribuye en formato safetensors bf16 bajo la clase `Qwen3_5ForConditionalGeneration`. El entrenamiento se realizó con Slime + Megatron-LM sobre un conjunto de datos de seguridad denominado "mixture-8", destilado a partir de trayectorias generadas por Qwen/Qwen3.8-27B como profesor. Solo se entrenó el modelo de lenguaje; la torre de visión y la cabeza MTP conservan los pesos originales del modelo base.

Su relevancia es fundamentalmente de investigación: documenta de forma transparente la receta de SFT (datos, hiperparámetros, checkpoints intermedios) para estudiar cómo evoluciona el comportamiento de seguridad a lo largo del entrenamiento. No está pensado para producción, ya que el propio autor lo describe como una instantánea con el entrenamiento aún en curso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 (`Qwen3_5ForConditionalGeneration`), con torre de visión y cabeza MTP heredadas del base |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de parámetro completo (full-parameter SFT) sobre Qwen3.5-4B-Base, un transformer multimodal de la familia Qwen3.5 que incluye torre de visión y cabeza MTP. El checkpoint se exportó desde Megatron torch_dist (`iter_0000182`) mediante `safety_tuning.hf_export`, con re-fusión de las proyecciones GDN, mapeo de nombres de Slime para Qwen3.5 y copia de los pesos de visión y MTP del modelo base, igualando los dtypes al índice original. Por tanto, carga exactamente igual que el modelo base.

El entrenamiento usó Slime + Megatron-LM con cómputo bf16 y estado del optimizador en fp32, sobre 46.626 trayectorias procedentes de 11.757 prompts, con 2 épocas y 365 actualizaciones de 128 secuencias. La tasa de aprendizaje fue de 2e-05 en pico, con calentamiento lineal del 10 % y decaimiento coseno hasta 4e-06; Adam con betas [0.9, 0.95], eps 1e-08, weight decay 0.1 y recorte de gradiente 1.0. El contexto de entrenamiento fue de 32.768 tokens y las trayectorias más largas se excluyeron completas, nunca se truncaron. La pérdida se aplica sobre el razonamiento, la respuesta final y las llamadas a herramientas. El conjunto mixture-8 combina ocho fuentes (star1_gp3, star_benign_v2, agentalign_harmful, agentalign_benign, codesafetybench, magicoder, difficult_advice y wildjailbreak_benign) con trayectorias destiladas de Qwen3.8-27B, cuatro respuestas muestreadas por prompt y todas las válidas conservadas.

## Capacidades

- Generación de texto conversacional con plantilla de chat nativa del modelo base y modo de pensamiento (thinking) activable.
- Razonamiento multi-paso: el entrenamiento incluye pérdida sobre las cadenas de razonamiento de las trayectorias del profesor.
- Generación de código, reforzada por las fuentes magicoder y codesafetybench del conjunto de datos.
- Llamadas a herramientas (tool calling / function calling): la pérdida cubre explícitamente las llamadas a herramientas de las trayectorias.
- Comportamiento orientado a agentes, con datos de agentalign (harmful y benign).
- Capacidad multimodal heredada del base (torre de visión intacta), aunque no fue entrenada en este SFT.
- Alineamiento de seguridad: entrenado sobre fuentes de seguridad, jailbreak benigno y consejo difícil.
- Capacidades multilingües: no disponible (no se documentan idiomas).

## Casos de uso

- Investigación sobre alineamiento de seguridad: el checkpoint permite analizar la evolución del comportamiento de rechazo y utilidad en el punto 0,501 de 2 épocas, comparándolo con los otros checkpoints publicados (91, 274, 365, 456, 548, 639 y 730 actualizaciones).
- Estudio de destilación de trayectorias: sirve para evaluar cuánto del comportamiento de un profesor de 27B (Qwen3.8-27B) se transfiere a un alumno de 4,66B mediante SFT sobre trayectorias.
- Evaluación de robustez frente a jailbreaks: el conjunto incluye wildjailbreak_benign y agentalign_harmful, lo que permite medir la resistencia a prompts adversarios en un modelo de tamaño medio.
- Análisis de seguridad en código: con datos de codesafetybench y magicoder, es útil para estudiar si el modelo genera código seguro en tareas de programación.
- Reproducción de recetas de entrenamiento: la model card documenta hiperparámetros, framework (Slime + Megatron-LM) y procedimiento de exportación, lo que facilita replicar el pipeline en 2× NVIDIA RTX PRO 6000 Blackwell con tensor parallel 2.
- Punto de partida para ajustes posteriores: al cargarse igual que el base, puede usarse como inicialización para experimentos de SFT o DPO adicionales en entornos de investigación con recursos limitados (cabe en GPUs de 24-48 GB en bf16 o cuantizado).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 12 y 16 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 5-6 GB de pesos; en 4 bits, en torno a 3 GB, aunque no se publican pesos cuantizados oficiales.
- GPU recomendadas: el entrenamiento se realizó en 2× NVIDIA RTX PRO 6000 Blackwell con tensor parallel 2; para inferencia basta una RTX 4090 (24 GB), RTX 3090 (24 GB) o A100/H100 para mayor throughput.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más en bf16 y en tarjetas de 8-12 GB con cuantización.
- Opciones de despliegue: transformers (soporte nativo de `Qwen3_5ForConditionalGeneration`); vLLM, llama.cpp, Ollama o TGI no están confirmados para esta arquitectura concreta en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8 (este) | 4,66B | 32.768 | apache-2.0 | Checkpoint intermedio de SFT de seguridad, no final |
| Qwen/Qwen3.5-4B-Base | no disponible | no disponible | apache-2.0 | Modelo base sin ajuste de seguridad |
| Qwen/Qwen3.8-27B | no disponible | no disponible | no disponible | Profesor usado para destilar las trayectorias; mucho mayor |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio (183 de 730 actualizaciones, 0,501 de 2 épocas): el entrenamiento está en curso y el modelo no debe tratarse como versión final.
- Alineamiento de seguridad incompleto: al estar a mitad de entrenamiento, es probable que los comportamientos de rechazo y utilidad no estén consolidados.
- Riesgo de alucinación: inherente a los modelos de lenguaje de este tamaño; no se documentan evaluaciones de fidelidad.
- Idiomas soportados no documentados; el comportamiento multilingüe es incierto.
- La torre de visión y la cabeza MTP no fueron entrenadas, por lo que las capacidades multimodales no están alineadas con el SFT.
- Licencia apache-2.0, que permite uso comercial, pero el estado intermedio del modelo desaconseja su uso en producción.
- Sin descargas ni validación comunitaria (0 descargas, 0 likes en el momento de la consulta): no hay evidencia externa de calidad.
- El contexto de entrenamiento es de 32.768 tokens; las trayectorias más largas se descartaron, lo que puede sesgar hacia respuestas de longitud acotada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr2e-5-step183
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Profesor de destilación: https://huggingface.co/Qwen/Qwen3.8-27B
- Slime (framework de entrenamiento): no disponible en la información proporcionada
- Megatron-LM: no disponible en la información proporcionada
