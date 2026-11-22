# tablinum/RailShot-Stream

## Resumen

RailShot Stream v0.1 Preview es un artefacto de clasificación de texto publicado por el usuario tablinum en Hugging Face, orientado a ejecutar sesiones de decisión de texto ordenadas y reiniciables sobre una única máquina. No es un modelo de lenguaje generativo al uso: combina una cabeza de decisión denominada MagicEightBall, un tokenizador fijado en el host, frases de evidencia y una capa de secuenciación y persistencia sobre SQLite. El modelo se distribuye como grafo ONNX portable y como archivo nativo compacto para el Intel Neural Compute Stick (NCS1) original, con soporte adicional de OpenVINO.

La propuesta técnica consiste en un pipeline de streaming con semántica transaccional: cada fragmento aceptado y cada resultado se confirman en SQLite antes de responder, de modo que un reinicio del proceso puede recuperar el estado y aplicar nuevas reglas (por ejemplo, un veto posterior) sin perder el historial. La model card documenta una replay industrial con 48 de 48 comprobaciones superadas en CPU y en hardware físico, y un límite físico de 131.072 tokens por secuencia, con rechazo correcto de una inserción de 131.073 tokens.

El repositorio tiene un tamaño declarado de 0,0 GB y cero descargas en el momento de la consulta, lo que sitúa la publicación en una fase de vista previa muy temprana. La información disponible no permite determinar el número de parámetros, el contexto nominal del modelo ni los resultados de benchmarks estándar; buena parte de los datos técnicos debe marcarse como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de decisión MagicEightBall sobre tokenizador fijado en host; grafo ONNX portable y archivo nativo para Intel NCS1 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe un modelo MoE) |
| Longitud de contexto | no disponible como ventana de atención; límite de secuencia documentado de 131.072 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT y Apache 2.0 (campo `license: other`, `license_name: mit-and-apache-2.0`) |
| Formato de pesos | ONNX y blob nativo para NCS1 |

## Arquitectura y entrenamiento

La documentación describe un sistema híbrido en el que el dispositivo ejecuta únicamente la cabeza de decisión aprendida (MagicEightBall), mientras que el código del host asume el tokenizador fijado, las frases de evidencia, la secuenciación de fragmentos y la persistencia en SQLite. El artefacto se publica en dos formatos: un grafo ONNX portable para ejecución en CPU mediante onnxruntime y un archivo nativo para el Intel Neural Compute Stick de primera generación, que requiere OpenVINO 2020.3.2, Python 3.7 y SentencePiece 0.1.99.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. La model card indica que la vista previa cubre frases de política escritas por el autor y reinicio de procesos locales, y que el dispositivo solo ejecuta la cabeza de decisión, no el tokenizador ni la lógica de secuenciación. Tampoco se detalla si existe decodificación especulativa, atención lineal u otra innovación de arquitectura más allá del diseño de streaming con commits durables.

## Capacidades

- Clasificación de texto orientada a decisiones binarias o de revisión (aprobación, veto, revisión) sobre flujos de eventos.
- Procesamiento de streams ordenados con identificador de stream y número de secuencia, con detección de huecos en la secuencia.
- Reintentos exactos: recuperación del resultado de aprobación original ante un reintento idéntico.
- Persistencia transaccional en SQLite antes de emitir la respuesta, lo que permite reiniciar el proceso y continuar el flujo.
- Ejecución en dos backends: CPU con onnxruntime y hardware Intel NCS1 con OpenVINO.
- Soporte de múltiples bancos de política de primera línea (frontline policy banks), con ejemplos de concesionario, mantenimiento industrial y revisión de equipos de tienda.
- Capacidad multilingüe limitada al inglés.
- No se documentan tool calling, function calling, razonamiento multi-paso generativo, visión, audio ni modo de pensamiento.

## Casos de uso

- Triaje de solicitudes de servicio en concesionarios: el sistema recibe fragmentos de texto de una solicitud, emite una propuesta de revisión (`review_service_intake`) y, tras un reinicio, aplica un veto posterior del cliente manteniendo la trazabilidad en SQLite.
- Revisión de alertas de mantenimiento industrial: ante una alerta de vibración, el modelo propone una revisión mecánica (`review_mechanical_alert`) y permite añadir una retención de mantenimiento después de reiniciar el proceso.
- Gestión de alertas de seguridad física: cuando una cámara queda fuera de línea, el flujo emite una propuesta de revisión de seguridad (`review_camera_alert`) y admite el cierre posterior de la alerta.
- Auditoría de decisiones con reintentos: gracias a la recuperación del resultado original ante reintentos idénticos, encaja en sistemas donde la idempotencia de las decisiones es un requisito regulatorio.
- Despliegue en hardware de borde de bajo consumo: el archivo nativo para Intel NCS1 permite ejecutar la cabeza de decisión en un acelerador USB sin depender de GPU.
- Procesamiento de flujos largos con control de límites: el límite documentado de 131.072 tokens y el rechazo de inserciones que lo exceden permiten usarlo en ingesta de documentos extensos con validación estricta.
- Integración en pipelines locales de clasificación por lotes: el grafo ONNX con onnxruntime y las dependencias mínimas (numpy, onnxruntime, sentencepiece) facilitan su inclusión en scripts de automatización en una sola máquina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card únicamente reporta métricas de validación funcional del sistema:

| Prueba | Resultado |
|---|---|
| Comprobaciones en replay industrial (CPU y NCS1) | 48/48 superadas |
| Límite de secuencia aceptado | 131.072 tokens |
| Inserción rechazada por exceso | 131.073 tokens |
| Flujos cubiertos por prueba | Hueco de secuencia, reintento conflictivo, stream independiente y reset |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del modelo no se especifica y el repositorio declara 0,0 GB.
- CPU: ejecución mediante onnxruntime con numpy y sentencepiece; no se indican requisitos mínimos de CPU.
- Acelerador: Intel Neural Compute Stick de primera generación con OpenVINO 2020.3.2, Python 3.7 y SentencePiece 0.1.99.
- GPU: no se documenta soporte de GPU (A100, H100, RTX 4090 u otras).
- Despliegue: script `industry_replay.py` y módulo `apps.railshot` incluidos en el repositorio; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la model card advierte que los volcados a disco afectan a la latencia de confirmación y que historiales más largos requieren más replay de recuperación entre resets.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (clasificación de texto con cabecera de decisión y streaming transaccional), ni datos de parámetros, contexto o rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Vista previa v0.1: el alcance se limita a frases de política escritas por el autor y a reinicio de procesos locales.
- Idioma: solo inglés; no se documenta soporte multilingüe.
- Almacenamiento de datos: el sistema guarda el texto de las peticiones en el journal local de SQLite, lo que exige considerar privacidad y retención de datos.
- Latencia: los volcados a disco afectan a la latencia de confirmación; historiales largos incrementan el coste de replay de recuperación entre resets.
- Límite de secuencia: 131.072 tokens por secuencia, con rechazo de inserciones que lo superen.
- Licencia: el campo de Hugging Face indica `license: other` con nombre `mit-and-apache-2.0`; conviene revisar `LICENSE` y `NOTICE.md` antes de un uso comercial, ya que la combinación de dos licencias puede implicar obligaciones distintas según el componente.
- Hardware legacy: el backend NCS1 depende de OpenVINO 2020.3.2, Python 3.7 y SentencePiece 0.1.99, versiones antiguas con implicaciones de mantenimiento y seguridad.
- Sin datos de benchmarks, parámetros ni sesgos conocidos; no es posible evaluar calidad de clasificación ni riesgo de alucinación con la información disponible.
- Cero descargas y cero likes en el momento de la consulta: ecosistema de validación externa inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tablinum/RailShot-Stream
- MagicEightBall: https://huggingface.co/tablinum/MagicEightBall
- The Break Room (Space): https://huggingface.co/spaces/tablinum/The-Break-Room
- MyriadForge (GitHub): https://github.com/chadstthomas-svg/myriadforge
- Resultados industriales en bruto: `measurements/industry-results.json` (dentro del repositorio)
- Replay de límite físico y reinicio: `measurements/physical-replay.json` (dentro del repositorio)
- Guía de runtime: `RUN.md` (dentro del repositorio)
- Avisos de licencia: `NOTICE.md` (dentro del repositorio)
- Hashes de archivos: `SHA256SUMS.txt` (dentro del repositorio)
