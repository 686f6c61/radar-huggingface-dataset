# VkrntD/hindi-collections-call-checker

## Resumen

Hindi collections call checker es un modelo de audio a texto especializado en la verificación de cumplimiento normativo de llamadas de recuperación de deuda en hindi y hinglish. Lo desarrolla VkrntD (Mnemio AI) como un fine-tune de google/gemma-4-E2B-it, empaquetado en formato MLX para su ejecución local en Macs con Apple Silicon. El modelo escucha una grabación de una llamada de cobro y devuelve un informe JSON estructurado con las supuestas infracciones detectadas, cada una acompañada de la frase textual del agente como evidencia.

El problema que resuelve es concreto: la Reserve Bank of India publicó en agosto de 2026 una enmienda a las direcciones sobre recuperación de deudas que exige, entre otras cosas, grabar todas las llamadas, conservarlas seis meses, avisar al prestatario de que la conversación se graba y evitar métodos abusivos. Esas obligaciones entran en vigor el 1 de enero de 2027. Ningún equipo humano puede escuchar miles de grabaciones diarias, de modo que el modelo actúa como filtro automatizado para que los revisores se centren en las llamadas problemáticas.

Técnicamente es un modelo de unos 4.935 millones de parámetros (4,9 B) con licencia Apache 2.0, cuantizado a 4 bits, que ocupa un único archivo de 3,4 GB y requiere menos de 5 GB de memoria. Según el autor, procesa una llamada en unos 2 segundos en un Apple M5 Pro. La longitud de contexto y los detalles de entrenamiento no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal audio-texto derivada de google/gemma-4-E2B-it (detalles de la arquitectura base no disponibles) |
| Parametros totales | 4.935.753.283 (~4,9 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MLX) |
| Idiomas soportados | hindi (hi), inglés (en); entrenado además con hinglish según la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX), archivo único de 3,4 GB |

## Arquitectura y entrenamiento

El modelo parte de Google Gemma 4 E2B (variante instruct, `google/gemma-4-E2B-it`) y se ha ajustado mediante fine-tune supervisado para una tarea de audio-texto: transcribir y analizar llamadas de cobro. La model card no detalla la arquitectura interna del modelo base (número de capas, tipo de atención, mecanismo de codificación de audio) ni el volumen o la composición exacta del dataset de ajuste. Sí indica que la evaluación se realizó sobre 1.000 llamadas reservadas con voces, nombres y formulaciones no vistas durante el entrenamiento, lo que sugiere un conjunto de entrenamiento con variedad de hablantes y redacciones.

La innovación técnica principal no está en la arquitectura sino en el diseño de la tarea: el modelo no se limita a transcribir, sino que clasifica la conversación en campos estructurados (quién atendió, aviso de grabación, siete tipos de infracción con cita textual, promesa de pago con importe y fecha, dificultad económica, disputa y hora de devolución de llamada). El script `check_call.py` trocea la grabación en clips de 30 segundos o menos, aplica el prompt exacto de entrenamiento y combina la salida del modelo con comprobaciones deterministas procedentes del registro de llamadas del prestamista (hora de la llamada, número de llamadas del día). No se menciona el uso de RLHF, DPO ni técnicas de decodificación especulativa.

## Capacidades

- Comprensión de audio en hindi, inglés y hinglish, con salida en JSON estructurado.
- Detección de siete tipos de métodos abusivos: `threat_violence`, `shaming_threat`, `abusive_language`, `false_claim`, `third_party_disclosure`, `persistent_calling` e `insensitive_to_crisis`, cada uno con la frase del agente como evidencia.
- Identificación de quién atendió la llamada (prestatario u otra persona).
- Verificación de si el agente comunicó que la llamada estaba siendo grabada.
- Extracción de la promesa de pago: importe y fecha.
- Detección de dificultades económicas (por ejemplo, médicas) y de disputas sobre la deuda.
- Extracción de la hora solicitada para una devolución de llamada.
- Procesamiento local sin envío de audio a servidores externos.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso genérico ni otras capacidades multimodales más allá del audio.

## Casos de uso

- Auditoría de cumplimiento normativo en entidades financieras indias: el modelo procesa las grabaciones diarias de recuperación de deuda y marca las llamadas con posibles infracciones de las direcciones del RBI, de modo que el equipo de compliance revisa solo los casos señalados en lugar de escuchar todas las llamadas.
- Detección de lenguaje abusivo o amenazas: al devolver la frase exacta del agente junto a cada infracción, el modelo proporciona evidencia citable en un expediente de auditoría o en una respuesta a un regulador.
- Verificación del aviso de grabación: comprueba de forma automática si el agente informó al prestatario de que la llamada se grababa, requisito explícito de la normativa que entra en vigor el 1 de enero de 2027.
- Control de divulgación a terceros: identifica si se habló de la deuda con alguien distinto del prestatario o del avalista, uno de los supuestos prohibidos por las direcciones.
- Seguimiento de compromisos de pago: extrae importe y fecha prometidos por el prestatario para alimentar sistemas de gestión de cobros y priorizar el seguimiento.
- Gestión de solicitudes de devolución de llamada: registra la hora pedida por el prestatario para que el sistema de marcación respete su preferencia horaria.
- Análisis de sensibilidad ante crisis personales: detecta casos en los que el agente presiona pese a una emergencia médica o un fallecimiento, supuestos que la normativa exige evitar.
- Despliegue en entorno local para entidades con requisitos estrictos de privacidad: al ejecutarse íntegramente en un Mac con Apple Silicon mediante MLX, el audio de los prestatarios no sale de las instalaciones del prestamista.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 1.000 llamadas reservadas con voces, nombres y formulaciones no vistas en entrenamiento:

| Métrica | Resultado |
|---|---|
| Llamada completa correcta (todos los campos) | 75% |
| Informe JSON legible | 100% |
| Quién atendió | 99,7% |
| Aviso de grabación dado o no | 99,8% |
| Hora de devolución de llamada | 99,8% |
| Motivo de dificultad económica | 97% |
| Llamadas con infracción detectada | 96% |
| Evidencia es la frase correcta | 96% |
| Disputa | 95% |
| Promesa de pago | 93% |
| Importe prometido | 92% |
| Llamadas limpias sin falsos positivos | 92% |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: menos de 5 GB según el autor, gracias a la cuantización a 4 bits y al archivo único de 3,4 GB.
- GPU recomendadas: Apple Silicon (el autor cita un Apple M5 Pro con unos 2 segundos por llamada). No se documenta soporte para GPU NVIDIA ni CUDA.
- Cabe en Macs de consumo con Apple Silicon; no se especifican modelos mínimos compatibles más allá de la referencia al M5 Pro.
- Opciones de despliegue: MLX (librería `mlx-vlm`) con el script `check_call.py` incluido en el repositorio. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: aproximadamente 2 segundos por llamada en Apple M5 Pro. El throughput no está disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables especializados en auditoría de llamadas de cobro en hindi. La comparación con el modelo base resulta limitada porque no se publican sus especificaciones completas en la información proporcionada.

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Hindi collections call checker | ~4,9 B | no disponible | Auditoría de cumplimiento en llamadas de cobro (hi/en/hinglish) | Apache 2.0 | MLX safetensors 4 bits |
| google/gemma-4-E2B-it | no disponible | no disponible | Modelo generalista instruct multimodal | no disponible | no disponible |
| Alternativas especializadas en compliance de audio | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El propio autor advierte que el contenido no constituye asesoramiento legal; cada entidad debe leer las direcciones aplicables a su tipo de prestamista.
- Precisión global del 75% en la clasificación completa de la llamada: uno de cada cuatro casos tendrá al menos un campo incorrecto, lo que exige revisión humana de los resultados marcados.
- Tasa de falsos positivos del 8% en llamadas limpias (92% de llamadas limpias sin marcar), lo que puede generar carga de revisión innecesaria.
- El modelo está entrenado específicamente para hindi, inglés y hinglish; no se garantiza su funcionamiento en otras lenguas ni en variantes regionales no representadas en el entrenamiento.
- Dependencia exclusiva del ecosistema MLX y Apple Silicon: no hay soporte documentado para CUDA, lo que limita el despliegue en infraestructura de servidores convencional.
- El troceado en clips de 30 segundos puede perder contexto entre fragmentos de una misma llamada.
- Parte de las comprobaciones (horario de llamada, número de llamadas del día) no las realiza el modelo, sino el script a partir del registro de llamadas del prestamista; su exactitud depende de la calidad de ese registro.
- No se documentan sesgos específicos del modelo ni evaluaciones de robustez frente a acentos, ruido de fondo o calidad telefónica degradada.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Gemma puede estar sujeto a términos adicionales de Google que conviene verificar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VkrntD/hindi-collections-call-checker
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Blog del autor: https://mnemio.ai/blog/ai-loan-recovery-call-checker
- Sitio de Mnemio AI: https://mnemio.ai
- Repositorio MLX: https://github.com/ml-explore/mlx
- Dirección RBI para bancos comerciales: https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=13665&Mode=0
- Dirección RBI para NBFC: https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=13672&Mode=0
