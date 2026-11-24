# VkrntD/hindi-collections-call-checker-v1

## Resumen

El Hindi collections call checker v1 es un ajuste fino del modelo multimodal de audio Gemma 4 E2B instruction-tuned, desarrollado por VkrntD (Mnemio AI) para auditar llamadas de recuperación de deuda en hindi e hinglish. El modelo recibe una grabación de audio de una llamada de cobro y devuelve un informe estructurado en JSON que identifica métodos de cobro agresivos con la frase literal del agente como evidencia, quién atendió la llamada, si se notificó la grabación y los compromisos de pago adquiridos por el prestatario. Está pensado para que las entidades financieras indias puedan priorizar qué llamadas revisa un humano antes de la entrada en vigor de las directrices de la RBI sobre agentes de recuperación el 1 de enero de 2027.

Técnicamente es un modelo de aproximadamente 4.936 millones de parámetros totales (según los safetensors del repositorio) sobre la base `google/gemma-4-E2B-it`, ajustado con LoRA de rango 16 sobre 330 llamadas etiquetadas. Los pesos se distribuyen cuantizados de forma mixta: capas de texto a 4 bits, embeddings por capa a 3 bits y encoder de audio a 8 bits, con el encoder de imagen eliminado. El resultado es un artefacto de 2,6 GB que requiere menos de 4 GB de memoria y procesa cada llamada en torno a un segundo en un Apple M5 Pro.

Es relevante porque ejemplifica el uso de modelos pequeños multimodales para cumplimiento normativo verticalizado en mercados no anglosajones, con un formato de salida estrictamente estructurado y una licencia permisiva (Apache 2.0) que permite a cualquier prestamista desplegarlo. El autor recomienda usar la versión 2 salvo que la memoria sea muy limitada, ya que esta v1 se entrenó con diez veces menos datos (330 frente a 3.300 llamadas) y es menos precisa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal audio-texto (base Gemma 4 E2B), ajuste LoRA rango 16 |
| Parámetros totales | 4.935.753.283 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Mixta: texto 4 bits, embeddings por capa 3 bits, encoder de audio 8 bits |
| Idiomas soportados | Hindi (hi), inglés (en); incluye hinglish en el entrenamiento |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería MLX) |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 E2B instruction-tuned, un transformer multimodal que procesa audio y texto. Sobre esa base se aplicó un ajuste fino con LoRA de rango 16 sobre 330 llamadas de recuperación de deuda en hindi e hinglish etiquetadas manualmente. El adaptador se fusionó con los pesos en precisión completa y después se aplicó una cuantización por componentes: capas de texto a 4 bits, embeddings por capa a 3 bits y encoder de audio a 8 bits. El encoder de imagen de la base se eliminó por completo, ya que la tarea es exclusivamente audio-texto.

La innovación principal no está en la arquitectura sino en el diseño de la tarea: el modelo produce un JSON con campos fijos (métodos agresivos con evidencia textual, identidad de quien atendió, aviso de grabación y detalles de seguimiento como compromiso de pago, dificultad económica, disputa y petición de devolución de llamada). No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO adicionales sobre el ajuste supervisado.

## Capacidades

- Comprensión de audio de llamadas telefónicas en hindi e hinglish y transcripción implícita para extraer evidencia textual.
- Detección de métodos de cobro agresivos o improcedentes, citando la frase concreta del agente como prueba.
- Identificación de si quien atendió la llamada es el prestatario u otra persona.
- Verificación de si el agente notificó que la llamada estaba siendo grabada.
- Extracción de compromisos de pago (importe y fecha), situaciones de dificultad económica, disputas y peticiones de devolución de llamada.
- Generación de salida estructurada en JSON con campos predefinidos, apta para consumo automatizado.
- Procesamiento local en Apple Silicon mediante MLX, sin dependencia de servicios en la nube.
- No dispone de soporte documentado de tool calling, function calling, modo thinking ni capacidades de agente multi-paso.

## Casos de uso

- Auditoría de cumplimiento en cobros: el modelo procesa las grabaciones de las llamadas de recuperación y marca aquellas con indicios de métodos agresivos, permitiendo al equipo de cumplimiento priorizar la revisión humana antes de la entrada en vigor de las directrices de la RBI el 1 de enero de 2027.
- Revisión de muestras a escala: con un coste de aproximadamente un segundo por llamada en un Apple M5 Pro y menos de 4 GB de memoria, un analista puede pasar cientos de grabaciones diarias por un portátil sin infraestructura GPU dedicada.
- Verificación del aviso de grabación: el campo específico del JSON permite comprobar de forma automatizada qué porcentaje de llamadas incluyó la notificación legal de grabación, un requisito habitual en la normativa de cobro.
- Detección de promesas de pago incumplidas: la extracción de importes y fechas comprometidas alimenta sistemas de seguimiento de acuerdos de pago y permite generar recordatorios o alertas de incumplimiento.
- Identificación de llamadas a terceros: el campo sobre quién atendió permite detectar contactos con personas distintas del deudor, un supuesto frecuente de reclamación por prácticas abusivas.
- Análisis de disputas y dificultades económicas: el modelo registra si el prestatario alegó dificultad económica o disputó la deuda, información útil para clasificar casos que requieren tratamiento especial o revisión legal.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente con MLX, las grabaciones no salen del dispositivo del auditor, lo que facilita el cumplimiento de políticas internas de protección de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: menos de 4 GB según la model card; el repositorio ocupa 2,6 GB.
- Aceleración: requiere Apple Silicon con MLX (`mlx-vlm`); no se documenta soporte para CUDA ni ROCm.
- GPU recomendadas: Apple M5 Pro (referencia del autor, aproximadamente un segundo por llamada); no se especifican otros chips Apple compatibles.
- ¿Cabe en GPU de consumo? No hay información sobre GPUs NVIDIA de consumo; el despliegue documentado es exclusivamente local en Apple Silicon.
- Opciones de despliegue: MLX mediante `mlx-vlm`, con script `check_call.py` incluido en el repositorio; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia estimada: en torno a un segundo por llamada en Apple M5 Pro; no se proporcionan datos de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Hindi collections call checker v1 | 4.936 M | no disponible | hi, en | Apache 2.0 | Auditoría de llamadas de cobro (audio a JSON) |
| Hindi collections call checker v2 | no disponible | no disponible | hi, en | Apache 2.0 | Misma tarea, entrenado con 3.300 llamadas, más preciso |
| google/gemma-4-E2B-it (base) | no disponible | no disponible | multilingüe | Gemma (uso permitido) | Modelo multimodal generalista sin especialización en cumplimiento |

No se dispone de información sobre otros modelos especializados comparables en la misma tarea de auditoría de llamadas de cobro en hindi.

## Limitaciones y advertencias

- Entrenado solo con 330 llamadas, diez veces menos que la versión 2; el propio autor recomienda usar la v2 salvo que la memoria sea limitada.
- El modelo no constituye asesoramiento legal: debe usarse para seleccionar qué llamadas revisa una persona, no para decidir de forma autónoma.
- Riesgo de alucinación en la evidencia citada: las frases atribuidas al agente pueden no coincidir literalmente con el audio, por lo que la verificación humana es imprescindible.
- Cobertura lingüística limitada a hindi e hinglish; no se documenta comportamiento en otras lenguas indias ni en inglés puro.
- No se han publicado evaluaciones cuantitativas de precisión, recall ni tasas de falsos positivos.
- El despliegue documentado depende de MLX y Apple Silicon; no hay soporte verificado para CUDA, lo que limita su uso en centros de datos convencionales.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Gemma 4 puede imponer condiciones adicionales de uso aceptable que conviene revisar.
- No se especifican sesgos conocidos ni evaluaciones de robustez frente a ruido, acentos o calidad telefónica deficiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VkrntD/hindi-collections-call-checker-v1
- Versión 2: https://huggingface.co/VkrntD/hindi-collections-call-checker
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Mnemio AI: https://mnemio.ai
