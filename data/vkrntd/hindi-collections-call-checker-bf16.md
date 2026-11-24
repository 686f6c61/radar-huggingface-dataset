# VkrntD/hindi-collections-call-checker-bf16

## Resumen

El Hindi collections call checker es un ajuste fino de Google Gemma 4 E2B orientado a la auditoria automatica de llamadas de recuperacion de deuda en hindi y hinglish. Desarrollado por Mnemio AI para un cliente del sector financiero indio y liberado con licencia Apache 2.0, el modelo escucha una grabacion de una llamada de cobro y emite un informe JSON estructurado que identifica metodos abusivos, quien atendio la llamada, si se informo al prestatario de que estaba siendo grabado y los compromisos de pago o situaciones de dificultad mencionados.

El modelo resulta relevante por el calendario regulatorio: las enmiendas del Reserve Bank of India (RBI) publicadas el 6 de agosto de 2026 entran en vigor el 1 de enero de 2027 y obligan a los prestamistas a grabar y conservar todas las llamadas de recuperacion, informar al deudor de la grabacion, respetar horarios y prohibir tacticas intimidatorias. Dado que ningun equipo humano puede revisar miles de llamadas diarias, este modelo actua como filtro automatizado que dirige la atencion del personal hacia los casos que requieren intervencion.

Tecnicamente es un modelo multimodal audio-texto de aproximadamente 4.940 millones de parametros, derivado de la familia Gemma 4 con arquitectura de mezcla de expertos (E2B), distribuido en formato MLX con pesos en bf16. Esta es la variante de precision completa (9,9 GB), pensada para conversion a otros formatos y para despliegue en servidores Linux; el autor recomienda la version cuantizada (3,4 GB) para uso directo en Mac.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal audio-texto basada en Gemma 4 E2B (mezcla de expertos) |
| Parametros totales | 4.935.753.283 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (esta variante); existe una version cuantizada de 3,4 GB |
| Idiomas soportados | hindi (hi), ingles (en), con soporte de codigo mezclado hindi-ingles (hinglish) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, formato MLX) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E2B-it, un modelo multimodal de la familia Gemma 4 con arquitectura de mezcla de expertos, y se ha ajustado mediante fine-tuning supervisado sobre un corpus de 3.300 llamadas de recuperacion de deuda reales en hindi y hinglish. La tarea es de audio-texto a texto: el modelo recibe el audio de la llamada (fragmentado en clips de 30 segundos o menos por el script `check_call.py`) junto con un prompt fijo, y genera una salida JSON con campos estructurados.

La innovacion principal no es arquitectonica sino de aplicacion: el ajuste convierte un modelo generalista en un clasificador de cumplimiento normativo que extrae, con cita textual de la frase del agente como evidencia, siete categorias de metodos abusivos (`threat_violence`, `shaming_threat`, `abusive_language`, `false_claim`, `third_party_disclosure`, `persistent_calling`, `insensitive_to_crisis`). El script complementa la inferencia del modelo con comprobaciones deterministas a partir de un registro de llamadas externo (horario de la llamada, numero de llamadas del dia). No se han publicado detalles sobre el volumen total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO adicionales.

## Capacidades

- Reconocimiento de voz y comprension de audio en hindi y hinglish, incluyendo conversaciones con cambio de codigo entre ambos idiomas.
- Deteccion de siete tipos de metodos de cobro abusivos, con la frase literal del agente como evidencia citada.
- Identificacion de quien atendio la llamada (prestatario u otra persona).
- Verificacion de si el agente informo de que la llamada estaba siendo grabada (`recording_disclosed`).
- Extraccion de compromisos de pago: importe y fecha prometidos.
- Deteccion de situaciones de dificultad (`hardship`, por ejemplo medica) y de disputas sobre la deuda.
- Extraccion de la franja horaria solicitada por el prestatario para una futura llamada (`callback_time`).
- Generacion de salida estructurada en JSON con esquema fijo.
- No dispone de tool calling ni de capacidades de agente multi-paso; la logica adicional de cumplimiento reside en el script que lo envuelve.

## Casos de uso

- Auditoria de cumplimiento normativo del RBI: el modelo procesa cada grabacion de llamada de recuperacion y genera un informe JSON que permite al equipo de compliance priorizar las llamadas con posibles infracciones antes de la entrada en vigor de las enmiendas el 1 de enero de 2027.
- Revision de terceros y agencias de cobro: un prestamista puede pasar las grabaciones de sus agencias externas por el modelo para verificar que no emplean tacticas intimidatorias, apoyando la obligacion regulatoria de inspeccion y auditoria de las agencias.
- Deteccion de divulgacion de la deuda a terceros: el campo `answered_by` y la categoria `third_party_disclosure` permiten identificar llamadas en las que se discutieron las deudas con personas distintas del prestatario o avalista.
- Verificacion del aviso de grabacion: la comprobacion `recording_disclosed` permite auditar de forma masiva si los agentes informan al deudor de que la conversacion se graba, requisito explicito de las direcciones del RBI.
- Gestion de reclamaciones y disputas: la extraccion de `dispute` y `hardship` facilita la trazabilidad de casos en los que el prestatario alega una emergencia medica o un fallecimiento, supuestos que la normativa obliga a respetar.
- Analisis de compromisos de pago: el campo `promise_to_pay` con importe y fecha permite cruzar lo prometido en la llamada con los pagos efectivamente recibidos y detectar discrepancias.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente sobre Apple Silicon mediante MLX, el audio no sale de la maquina, lo que facilita el cumplimiento de las obligaciones de conservacion y tratamiento de grabaciones.

## Benchmarks y rendimiento

El autor publica una unica metrica de exactitud, definida como el porcentaje de llamadas completas evaluadas correctamente en todos los campos:

| Version | Tamano | Memoria | Llamada completa correcta |
|---|---|---|---|
| Cuantizada | 3,4 GB | menos de 5 GB | 75% |
| Precision completa bf16 (esta) | 9,9 GB | unos 13 GB | 76% |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Memoria necesaria: aproximadamente 13 GB para la inferencia en bf16.
- GPU recomendadas: no se especifican modelos concretos de NVIDIA; el autor documenta y soporta ejecucion en Apple Silicon mediante MLX.
- Cabe en GPU de consumo: si, en tarjetas con al menos 13-16 GB de VRAM (por ejemplo RTX 4080, RTX 4090, RTX 5080/5090) si se convierte el modelo a un runtime compatible; el autor no documenta este camino.
- Despliegue: MLX (libreria `mlx-vlm`) en Macs con Apple Silicon; el propio autor indica que esta variante de precision completa sirve para convertir el modelo a otros formatos, por ejemplo para servidores Linux.
- Latencia: aproximadamente 2 segundos por llamada en un Apple M5 Pro.
- Dependencias del script de referencia: `mlx-vlm`, `soundfile`, `scipy`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hindi collections call checker bf16 (este) | 4.940 M | no disponible | Auditoria de llamadas de cobro en hindi/hinglish | Apache 2.0 | Hugging Face, formato MLX |
| Hindi collections call checker (cuantizado) | no disponible | no disponible | Misma tarea, precision reducida | Apache 2.0 | Hugging Face, formato MLX |
| google/gemma-4-E2B-it (modelo base) | no disponible | no disponible | Modelo multimodal generalista | no disponible en la informacion | Hugging Face |

No se dispone de informacion sobre otros modelos especializados en auditoria de llamadas de cobro con los que establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Exactitud del 76% a nivel de llamada completa: aproximadamente una de cada cuatro llamadas presenta al menos un campo incorrecto, por lo que el modelo debe usarse como filtro y no como sustituto de la revision humana.
- Entrenado exclusivamente con 3.300 llamadas en hindi y hinglish: el rendimiento en otros idiomas, acentos o dominios distintos del cobro de deudas no esta validado.
- Riesgo de alucinacion en la transcripcion y en las citas de evidencia, especialmente con audio de baja calidad o solapamiento de hablantes.
- Las comprobaciones de horario de llamada y numero de llamadas diarias no las realiza el modelo, sino el script `check_call.py` a partir del registro de llamadas del prestamista; sin ese registro la cobertura normativa queda incompleta.
- La model card incluye un aviso explicito de que el contenido no constituye asesoramiento legal: cada prestamista debe consultar las direcciones aplicables a su tipo de entidad.
- Despliegue documentado unicamente para Apple Silicon con MLX; el uso en servidores requiere conversion a otro formato, no documentada por el autor.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Gemma puede estar sujeto a terminos adicionales de Google que conviene verificar antes de un despliegue en produccion.
- Repositorio sin descargas ni valoraciones en el momento de la consulta, lo que limita la evidencia externa sobre su robustez en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VkrntD/hindi-collections-call-checker-bf16
- Version cuantizada: https://huggingface.co/VkrntD/hindi-collections-call-checker
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Blog del autor: https://mnemio.ai/blog/ai-loan-recovery-call-checker
- Sitio de Mnemio AI: https://mnemio.ai
- MLX: https://github.com/ml-explore/mlx
- Direccion RBI para bancos comerciales: https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=13665&Mode=0
- Direccion RBI para NBFC: https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=13672&Mode=0
