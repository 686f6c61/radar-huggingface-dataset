# tiantiaf/wavlm-large-age-sex

## Resumen
WavLM-large-age-sex es un modelo de clasificación de audio derivado de microsoft/wavlm-large, ajustado por tiantiaf para predecir la edad y el sexo del hablante a partir de una señal de voz. Forma parte del benchmark Vox-Profile, un trabajo que evalúa modelos fundacionales de habla en la caracterización de múltiples rasgos del hablante y propiedades del audio. El modelo devuelve una etiqueta de sexo entre dos clases (Female, Male) y una salida de edad normalizada en el rango 0-1, que multiplicada por 100 corresponde a la edad estimada en años.

Técnicamente es un encoder transformer de aproximadamente 318 millones de parámetros, con pesos en safetensors y una cabeza de clasificación multi-tarea añadida sobre el backbone WavLM. El repositorio ocupa 1,3 GB y está publicado bajo licencia OpenRAIL con restricciones explícitas de uso. Es relevante para pipelines de perfilado de hablante, anotación de corpus y investigación en atributos paralingüísticos, si bien su alcance queda limitado a audio en inglés y a usos no clínicos ni de vigilancia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (WavLM-large) con cabeza de clasificación multi-tarea (sexo binario y edad regresiva) |
| Parametros totales | 317.781.724 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; la ventana de entrada depende del preprocesado de la señal) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión original; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | en (inglés) |
| Licencia | openrail |
| Formato de pesos | safetensors (PyTorch, model_hub_mixin / pytorch_model_hub_mixin) |

## Arquitectura y entrenamiento
El modelo reutiliza el backbone WavLM-large, un encoder transformer diseñado para representaciones de habla que combina enmascaramiento de la señal con predicción denoising y modelado de mezclas de hablantes. Sobre este backbone se añade una cabeza de clasificación que resuelve simultáneamente dos tareas: clasificación binaria de sexo (Female/Male) y regresión de edad con salida normalizada en 0-1. La implementación y el procedimiento de ajuste se describen en el artículo Vox-Profile, que evalúa modelos fundacionales de habla en la caracterización de rasgos del hablante.

No se detallan en la información disponible el volumen de tokens de audio, la composición exacta del dataset de ajuste, ni si se emplearon técnicas de RLHF, DPO o calibración posterior. El modelo se presenta como parte de un benchmark, por lo que su entrenamiento está orientado a la evaluación comparativa de rasgos paralingüísticos más que a un producto final.

## Capacidades
- Clasificación de sexo del hablante en dos clases: Female y Male.
- Estimación de edad como valor continuo en 0-1, donde el valor multiplicado por 100 corresponde a la edad en años.
- Procesamiento de audio en inglés, orientado a señales de voz.
- Perfilado de atributos del hablante en el marco del benchmark Vox-Profile.
- Integración con PyTorch mediante model_hub_mixin y pytorch_model_hub_mixin.
- No se documenta soporte de tool calling, agentes, visión, audio multimodal ni modos de razonamiento multi-paso.

## Casos de uso
- Anotación de corpus de habla: el modelo permite etiquetar automáticamente edad y sexo en grabaciones de investigación, reduciendo el coste de anotación manual en estudios lingüísticos y paralingüísticos.
- Investigación en rasgos del hablante: sirve como línea base reproducible dentro del benchmark Vox-Profile para comparar modelos fundacionales de habla en la caracterización de atributos del orador.
- Análisis de diversidad demográfica en datasets de voz: permite auditar la distribución de edad y sexo en corpus de audio antes de entrenar otros modelos, detectando desequilibrios.
- Segmentación y filtrado de audio para pipelines de datos: se puede usar para enrutar o filtrar muestras por perfil de hablante antes de procesos posteriores de transcripción o diarización.
- Evaluación de calidad de datos de voz: ayuda a detectar inconsistencias entre metadatos declarados y características acústicas reales de las grabaciones.
- Docencia y experimentación en procesamiento de habla: al ser un ajuste ligero sobre WavLM-large con pesos safetensors, facilita reproducir experimentos de clasificación paralingüística en entornos académicos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: en fp32, los 317,8 millones de parámetros ocupan aproximadamente 1,27 GB solo en pesos, más activaciones y buffers de audio; en fp16 o bf16 se reduce a unos 0,64 GB de pesos.
- GPU recomendadas: A100, H100 o L4 para procesamiento por lotes a gran escala; RTX 4090, RTX 3090 o RTX A5000 para inferencia y experimentación.
- Cabe en GPU consumer: sí, en tarjetas con al menos 4-6 GB de VRAM efectiva para fp16 y lotes pequeños, incluyendo RTX 3060, RTX 4060 y similares.
- Opciones de despliegue: PyTorch nativo con model_hub_mixin, Hugging Face Transformers (carga del backbone y pesos), y exportación a ONNX o TorchScript para servir en CPU; no se documentan integraciones específicas con vLLM, TGI, llama.cpp u Ollama, que están orientadas a modelos de texto.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tiantiaf/wavlm-large-age-sex | 317,8 M | no disponible | Clasificación de edad y sexo | openrail | Hugging Face |
| microsoft/wavlm-large | no disponible en la informacion | no disponible | Representaciones de habla (backbone) | no disponible en la informacion | Hugging Face |
| Vox-Profile (otros ajustes del benchmark) | variable | no disponible | Perfilado de rasgos del hablante | no disponible en la informacion | Repositorio del proyecto |

La comparación con alternativas específicas de clasificación de edad y sexo no está disponible en la información proporcionada; el modelo base WavLM-large se incluye como referencia arquitectónica.

## Limitaciones y advertencias
- Uso fuera de alcance prohibido por el autor: aplicaciones clínicas o diagnósticas, vigilancia y usos invasivos de la privacidad.
- Restricción explícita de uso comercial: la model card indica "No commercial use", pese a la licencia OpenRAIL.
- Solo soporta inglés; el rendimiento en otros idiomas no está documentado.
- Riesgo de sesgo demográfico: la estimación de edad y sexo a partir de voz puede verse afectada por acentos, condiciones de grabación, ruido y características individuales no representadas en el dataset de ajuste.
- Riesgo de alucinación en el sentido de predicciones erróneas: la salida de edad es una estimación continua y puede desviarse significativamente en voces atípicas o audio degradado.
- No debe usarse para tomar decisiones sobre personas ni para inferir atributos sensibles fuera de contextos de investigación con consentimiento.
- No se documentan límites de longitud de audio, tolerancia a ruido ni métricas de calibración, lo que dificulta su uso en producción sin validación adicional.
- Los usuarios deben respetar la privacidad y el consentimiento de las personas cuyos audio se procesan, conforme a la legislación aplicable.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/tiantiaf/wavlm-large-age-sex
- Modelo base: https://huggingface.co/microsoft/wavlm-large
- Repositorio Vox-Profile: https://github.com/tiantiaf0627/vox-profile-release
- Artículo Vox-Profile: https://openreview.net/pdf?id=qmGQoZfkEN
