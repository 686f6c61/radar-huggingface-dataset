# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-lr1e-5-step364

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-lr1e-5-step364 es un checkpoint de ajuste fino supervisado (SFT) desarrollado por el usuario thkim0305-SNU sobre el modelo base Qwen/Qwen3.5-4B-Base. Se trata de un modelo multimodal de tipo image-text-to-text, con 4.659.865.088 parámetros totales (aproximadamente 4,66 mil millones) y pesos en formato safetensors. El checkpoint corresponde a la actualización de optimizador 364 de un total de 728, es decir, aproximadamente la mitad del ciclo de entrenamiento planificado.

El objetivo declarado del ajuste es el "safety tuning": alinear el comportamiento del modelo base mediante destilación de trayectorias generadas por un profesor de mayor tamaño (Qwen/Qwen3.8-27B). El conjunto de entrenamiento combina ocho fuentes heterogéneas que mezclan ejemplos benignos, trayectorias de agentes, código y datos de seguridad. Es relevante porque documenta un pipeline de destilación SFT con contexto largo (32.768 tokens) sobre una base multimodal, con licencia Apache-2.0 y pesos listos para inferencia con transformers.

El modelo conserva los pesos de visión y MTP (multi-token prediction) del modelo base original, mientras que únicamente los tensores de texto fueron ajustados. No se han publicado resultados de evaluación por parte del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basado en Qwen3.5; incluye pesos de visión y MTP no ajustados |
| Parametros totales | 4.659.865.088 (~4,66 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (longitud máxima de secuencia usada en entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 9,3 GB, incluye configuración, tokenizer y assets de procesador) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base (revisión `1001bb4d826a52d1f399e183466143f4da7b741b`), una arquitectura transformer de tipo image-text-to-text. El ajuste se aplicó exclusivamente sobre los tensores de texto: los pesos de visión y de MTP se conservan del modelo base fijado y el MTP no fue entrenado. El export original verificó la conversión inversa exacta de 306 tensores nativos de texto, la finitud de los pesos nativos y las 738 claves y formas de tensores en formato Hugging Face.

El entrenamiento es un SFT por destilación desde el profesor Qwen/Qwen3.8-27B (revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`). El plan contempla 2 épocas sobre 46.558 trayectorias de profesor aceptadas, con batch global de 128, BF16, semilla 42, longitud máxima de 32.768 tokens y una tasa de aprendizaje máxima de 1e-5 con mínimo de 2e-6 y warmup del 10 %. La función de pérdida cubre tanto el razonamiento como la respuesta del profesor (`cot_and_answer`). Las ocho fuentes de datos son STAR-1, STAR-Benign, AgentAlign harmful, AgentAlign benign, CodeSafetyBench, Magicoder, Difficult Advice y WildJailbreak benign. Se seleccionaron todas las trayectorias completas válidas, excluyendo los ejemplos que excedían el contexto. El estudiante usa la plantilla de chat nativa del Base con el mensaje de sistema `You are a helpful assistant.` y sin Spec de política del profesor en el contexto. La ejecución de origen se identifica como `qwen35-base-mixture8-wildjailbreak-2ep6ckpt-sft-native-20261115-v5-01`.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat nativa del modelo base.
- Procesamiento de imagen y texto de entrada (pipeline image-text-to-text), heredado de los pesos de visión del base.
- Razonamiento en formato cadena de pensamiento, ya que la pérdida de entrenamiento incluye el razonamiento del profesor (`cot_and_answer`).
- Comportamiento orientado a seguridad: el ajuste mezcla datos de seguridad (STAR-1, STAR-Benign, AgentAlign harmful/benign, WildJailbreak benign) con datos de código y consejo difícil.
- Capacidades de agente y multi-step reasoning, derivadas de las fuentes AgentAlign.
- Generación de código, por la inclusión de CodeSafetyBench y Magicoder en el entrenamiento.
- Soporte multilingüe: no disponible (no se documenta).
- Tool calling / function calling: no disponible (no se documenta explícitamente).
- Modo thinking explícito: no disponible como capacidad documentada; el razonamiento se aprende vía destilación, no mediante un modo separado declarado.

## Casos de uso

- Moderación y filtrado de contenido generado: el ajuste sobre STAR-1, STAR-Benign y WildJailbreak benign permite usar el modelo como clasificador generativo o reescritor de respuestas inseguras en pipelines de moderación, aprovechando su familiaridad con patrones de jailbreak.
- Asistentes conversacionales con contexto largo: la ventana de 32.768 tokens permite mantener conversaciones multi-turno extensas o procesar documentos largos junto con la consulta en un mismo contexto.
- Análisis de capturas de pantalla y documentos escaneados: al conservar los pesos de visión del base, puede recibir imagen y texto y responder en lenguaje natural, útil para extracción de información o descripción de contenido.
- Generación de código con conciencia de seguridad: entrenado con CodeSafetyBench y Magicoder, es adecuado para asistencia de programación donde se prioriza evitar patrones vulnerables o código inseguro.
- Simulación de escenarios de agente: las fuentes AgentAlign (harmful y benign) permiten emplearlo en entornos de evaluación de agentes para probar respuestas ante instrucciones ambiguas o maliciosas.
- Investigación en alineación y safety tuning: al ser un checkpoint intermedio (364/728 pasos) con receta documentada (profesor, fuentes, hiperparámetros), sirve como punto de comparación en estudios sobre destilación SFT y su efecto en seguridad.
- Consejo sensible o "difficult advice": el dataset Difficult Advice lo hace utilizable en prototipos de asistentes que deben responder a consultas delicadas con matices, siempre con revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se afirman puntuaciones de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 12 y 16 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 5-6 GB de pesos; en 4 bits, alrededor de 3-4 GB (estimaciones por tamaño, no verificadas para este checkpoint).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para BF16 con contexto largo; RTX 4090 (24 GB) suficiente para BF16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en BF16 y en GPUs de 8-12 GB si se cuantiza.
- Opciones de despliegue: transformers (librería declarada), además de vLLM, TGI, llama.cpp u Ollama si se generan pesos GGUF (no se proporcionan en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-lr1e-5-step364 | ~4,66 B | 32.768 | Apache-2.0 | Checkpoint SFT intermedio (364/728), multimodal, sin benchmarks publicados |
| Qwen/Qwen3.5-4B-Base | no disponible en la informacion | no disponible en la informacion | Apache-2.0 | Modelo base de partida; sin ajuste de seguridad |
| Qwen/Qwen3.8-27B (profesor) | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | Profesor usado para generar las trayectorias de destilación |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Checkpoint intermedio: solo se completaron 364 de 728 actualizaciones de optimizador (aproximadamente la mitad del plan de 2 épocas), por lo que el ajuste puede estar incompleto.
- Sin evaluación: el autor no aporta métricas de seguridad, calidad ni rendimiento; no hay evidencia publicada de que el ajuste reduzca comportamientos dañinos.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; no se documentan mitigaciones específicas.
- Sesgos: no documentados; las fuentes de datos (incluidas WildJailbreak y AgentAlign) pueden introducir sesgos de dominio o de estilo.
- Idiomas: no se especifican los idiomas soportados; el comportamiento fuera del inglés no está garantizado.
- Tool calling y agentes: no se documenta soporte explícito de function calling; las capacidades de agente se infieren del dataset, no de una especificación técnica.
- Pesos de visión y MTP sin ajustar: las capacidades multimodales y de predicción multi-token son las del base original y no se han adaptado al nuevo comportamiento de texto.
- Licencia Apache-2.0: permite uso comercial, pero el usuario debe verificar las obligaciones de atribución y las licencias de los datos de entrenamiento de terceros, no detalladas.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad; tratar como experimental.
- No se incluyen estados de optimizador, logs ni ejemplos de entrenamiento, lo que dificulta la reproducibilidad completa.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-lr1e-5-step364
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Modelo profesor: https://huggingface.co/Qwen/Qwen3.8-27B
- Ejecución de origen (identificador, sin URL pública): `qwen35-base-mixture8-wildjailbreak-2ep6ckpt-sft-native-20261115-v5-01`
- Papers, blogs, repos y demos adicionales: no disponibles en la informacion proporcionada.
