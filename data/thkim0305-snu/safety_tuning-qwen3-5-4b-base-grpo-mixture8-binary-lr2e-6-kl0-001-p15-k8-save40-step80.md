# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-save40-step80

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8 es un ajuste fino del modelo base Qwen/Qwen3.5-4B-Base, desarrollado por el usuario thkim0305-SNU, orientado a la alineación de seguridad mediante aprendizaje por refuerzo con el algoritmo GRPO (Group Relative Policy Optimization). El modelo conserva la arquitectura multimodal del base (pipeline image-text-to-text) y añade un entrenamiento de preferencias con penalización KL frente al modelo de referencia.

El checkpoint publicado corresponde al paso 80 de optimización (iteración 79 de Megatron) de la ejecución `grpo-mixture8-qwen35base4b-lr2e6-save40-pro6000-gpu0123-20261118-v1`, con una tasa de aprendizaje de 2e-6, coeficiente KL de 0.001 y 15 prompts con 8 respuestas por actualización. Los pesos de visión y de MTP (multi-token prediction) no entrenados provienen del modelo base fijado en la revisión `1001bb4d826a52d1f399e183466143f4da7b741b`.

Se trata de un artefacto de investigación con escasa difusión (2 descargas, 0 likes en el momento de la consulta) y documentación mínima: la model card no detalla la composición del dataset de seguridad ni publica métricas de evaluación. Su interés radica en ser un ejemplo reproducible de safety tuning con GRPO sobre una familia Qwen 3.5 de 4B y licencia Apache 2.0, lo que facilita su inspección y reutilización experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen 3.5; incluye torre de visión y cabezas MTP heredadas del base |
| Parametros totales | 4.659.865.088 (≈4,66 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no listadas) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 9,3 GB, incluye configuracion y tokenizer) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base, un transformer multimodal de aproximadamente 4,66 mil millones de parámetros que procesa entradas de imagen y texto. El ajuste se realiza con GRPO, un método de optimización de política sin crítico que estima ventajas relativas dentro de un grupo de respuestas generadas para cada prompt. La configuración declarada incluye 15 prompts y 8 respuestas por actualización, tasa de aprendizaje 2e-6 y coeficiente KL de 0.001 respecto al modelo de referencia, lo que limita la deriva de la política durante la alineación.

El entrenamiento se ejecutó con Megatron (iteración 79, 80 actualizaciones del optimizador) y la exportación contiene únicamente pesos de inferencia, configuración y tokenizer; la torre de visión y los pesos MTP no entrenados se toman del base fijado. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset de seguridad, la mezcla "Mixture8" ni si se aplicaron etapas previas de SFT o DPO. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal más allá de lo que aporte el base.

## Capacidades

- Generación de texto conversacional en formato chat, con plantilla de tokenizer heredada del base.
- Procesamiento de entradas imagen-texto (pipeline image-text-to-text), incluyendo preguntas sobre imágenes.
- Alineación orientada a seguridad: el ajuste GRPO busca reducir respuestas dañinas o no deseadas, aunque no se publican métricas que lo cuantifiquen.
- Razonamiento de múltiples pasos y respuesta a instrucciones, en la medida en que lo soporte el modelo base.
- Capacidades multilingües: no documentadas en la información disponible.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Capacidades de agente: no documentadas; dependen del base y no se han validado en este checkpoint.
- Modo thinking explícito: no documentado en la información disponible.

## Casos de uso

- Investigación en alineación de seguridad: el checkpoint permite reproducir y auditar un pipeline GRPO con KL fijo sobre un base de 4B, comparando el comportamiento antes y después del ajuste en conjuntos de prompts sensibles.
- Evaluación de robustez frente a jailbreaks: sirve como sujeto de prueba en bancos de red-teaming para medir si el ajuste de seguridad reduce la tasa de cumplimiento de peticiones dañinas.
- Clasificación y filtrado de contenido en prototipos: con entradas de texto o imagen, puede emplearse para etiquetar respuestas candidatas en un pipeline de moderación, siempre con validación humana.
- Experimentos de visión-lenguaje: al conservar la torre de visión del base, permite probar respuestas condicionadas por imagen en tareas de descripción o respuesta a preguntas visuales.
- Base para ajustes posteriores: al estar en Apache 2.0 y en safetensors, puede servir como punto de partida para SFT o DPO específicos de dominio en entornos de investigación.
- Despliegue en entornos con recursos limitados: con ~4,66 B de parámetros, es viable en una sola GPU de 24 GB en precisión reducida para pruebas internas, aunque las cuantizaciones no están publicadas.
- Comparación de métodos de RL: útil para contrastar GRPO frente a PPO u otros esquemas en la misma familia de modelos y con la misma configuración de prompts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9,3 GB en bf16/fp16 solo para pesos; en la práctica, 11-13 GB con caché KV para contextos moderados. En cuantización de 8 bits, en torno a 5-6 GB; en 4 bits, alrededor de 3-4 GB (estimaciones, no verificadas por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para servir en fp16 con contexto largo y concurrencia; L40S o RTX 6000 Ada como alternativas de 48 GB.
- GPU de consumo: cabe en RTX 4090 (24 GB) en bf16 con contexto moderado y en RTX 3090/4080 (16-24 GB) con cuantización; en GPUs de 8-12 GB requeriría cuantización agresiva no publicada.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI para servicio; llama.cpp/Ollama solo si se generan conversiones GGUF propias, ya que el repo no las incluye.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8 (este) | ≈4,66 B | no disponible | GRPO de seguridad sobre Qwen3.5-4B-Base | Apache 2.0 | Hugging Face, 2 descargas |
| Qwen/Qwen3.5-4B-Base | ≈4,66 B (mismo base) | no disponible | Modelo base multimodal sin alineación de seguridad específica | Apache 2.0 | Hugging Face, ampliamente distribuido |
| Qwen2.5-VL-3B-Instruct (referencia de categoría) | ≈3,75 B | 32 768 tokens (según su model card) | Vision-lenguaje instruido | Apache 2.0 | Hugging Face |
| Llama 3.2 3B Instruct (referencia de categoría) | ≈3,2 B | 131 072 tokens (según su model card) | Texto instruido, sin visión | Llama 3.2 Community License | Hugging Face, requiere aceptación |

La comparación con los modelos de referencia es orientativa: no hay benchmarks publicados de este checkpoint que permitan contrastar calidad o seguridad frente a ellos.

## Limitaciones y advertencias

- Ausencia total de evaluación publicada: no hay métricas de seguridad, utilidad ni regresiones, por lo que no puede recomendarse para producción sin una validación propia.
- Sesgos desconocidos: al no documentarse el dataset de preferencias, se desconoce qué comportamientos se han reforzado y si el ajuste introduce sobre-rechazo o respuestas excesivamente cautas.
- Riesgo de alucinación: inherente al base; el ajuste GRPO no lo mitiga y puede alterar la calibración de forma no medida.
- Deriva limitada pero no nula: el coeficiente KL de 0.001 con 80 pasos reduce el cambio respecto al base, pero el checkpoint intermedio no garantiza convergencia ni estabilidad.
- Idiomas y contexto no documentados: no se puede asumir el soporte multilingüe ni la ventana de contexto del base sin verificarlos en la configuración publicada.
- Pesos MTP y de visión no entrenados: las capacidades multimodales son las del base, no las de este ajuste.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad sobre el comportamiento del modelo recae en quien lo despliega.
- Madurez del artefacto: 2 descargas, 0 likes y sin paper asociado; debe tratarse como experimento de investigación, no como release estable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-save40-step80
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Revisión del base fijada en el entrenamiento: 1001bb4d826a52d1f399e183466143f4da7b741b
- Perfil del autor: https://huggingface.co/thkim0305-SNU
- Paper de GRPO (DeepSeekMath): https://arxiv.org/abs/2402.03300
- Repositorio de Megatron-LM: https://github.com/NVIDIA/Megatron-LM
