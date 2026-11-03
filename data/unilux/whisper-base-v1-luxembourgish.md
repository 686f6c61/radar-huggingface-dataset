# unilux/whisper-base-v1-luxembourgish

## Resumen

Whisper base v1 luxembourgeois (identificador `unilux/whisper-base-v1-luxembourgish`) es un modelo de reconocimiento automatico del habla (ASR) especializado en luxemburgues (`lb`), desarrollado por el equipo del proyecto LuxASR del Departamento de Humanidades de la Universidad de Luxemburgo. Se trata de un ajuste fino del modelo `openai/whisper-base` sobre pares audio-texto en luxemburgues, con aproximadamente 150 horas de datos de entrenamiento segun la model card del autor.

El modelo forma parte de una familia abierta de ASR para luxemburgues que incluye las variantes tiny, base, small y medium; la version insignia de mayor tamano, empleada en el servicio web, la API y las aplicaciones iOS y Android del proyecto, permanece cerrada. Con 72.593.920 parametros reales en safetensors y un repositorio de 0,3 GB, es un modelo ligero pensado para transcripcion en entornos con recursos limitados.

Su relevancia actual radica en que el luxemburgues es un idioma de bajos recursos con escasa cobertura en sistemas ASR comerciales, por lo que un modelo abierto especifico, con licencia OpenMDW-1.1 y basado en la arquitectura Whisper ampliamente soportada por el ecosistema (Transformers, whisper.cpp, faster-whisper), facilita la investigacion y el desarrollo de aplicaciones de accesibilidad y transcripcion de medios en este idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (variante base), transformer encoder-decoder para speech-to-text |
| Parametros totales | 72.593.920 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s, propia de Whisper base) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; al ser compatible con el ecosistema Whisper, caben cuantizaciones a fp16/int8/int4 en herramientas como whisper.cpp o faster-whisper, aunque el autor no las documenta |
| Idiomas soportados | luxemburgues (`lb`) |
| Licencia | openmdw-1.1 (Open Model, Data & Weights) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Whisper en su variante base: un transformer encoder-decoder con atencion completa, disenado originalmente por OpenAI para transcripcion y traduccion de voz multilingue. Se parte de los pesos de `openai/whisper-base` y se realiza un ajuste fino supervisado sobre pares audio-texto en luxemburgues, aproximadamente 150 horas segun la model card, procedentes del corpus del proyecto LuxASR.

No se documentan en la informacion disponible detalles sobre la composicion exacta del dataset, el uso de aumentacion de datos, tecnicas de RLHF/DPO (poco habituales en ASR) ni innovaciones arquitectonicas adicionales. El modelo conserva la interfaz estandar de Whisper, procesa audio en ventanas de 30 segundos y genera tokens de texto mediante decodificacion autorregresiva.

## Capacidades

- Transcripcion de voz a texto en luxemburgues (`lb`) a partir de audio de hasta 30 segundos por ventana.
- Reconocimiento de habla continua en un unico idioma, sin traduccion a otros idiomas.
- Integracion directa con el pipeline `automatic-speech-recognition` de Transformers.
- Compatibilidad con el ecosistema Whisper (faster-whisper, whisper.cpp, servidores compatibles con la API de OpenAI), aunque el autor no lo documenta explicitamente.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio mas alla de la propia tarea ASR.
- No se documentan capacidades multilingues: el modelo esta especializado exclusivamente en luxemburgues.

## Casos de uso

- Transcripcion de medios audiovisuales en luxemburgues: subtitulado automatico de videos, podcasts y programas de television o radio en este idioma, aprovechando que el modelo esta entrenado especificamente sobre habla luxemburguesa y supera en este dominio a Whisper base generico.
- Accesibilidad para personas con discapacidad auditiva: generacion de subtitulos en tiempo casi real en eventos, clases o reuniones en luxemburgues, con un modelo de 74 M de parametros que puede ejecutarse en CPU o GPU modesta.
- Investigacion en ASR de bajos recursos: servir como linea base reproducible y abierta para experimentos de ajuste fino, comparacion de arquitecturas o evaluacion de tecnicas de aumentacion sobre luxemburgues.
- Archivado y digitalizacion de patrimonio oral: transcripcion de entrevistas, grabaciones historicas y corpus orales en luxemburgues para su indexacion y busqueda textual.
- Asistentes de voz y aplicaciones moviles: integracion en apps iOS/Android o asistentes de escritorio que necesiten dictado o comandos de voz en luxemburgues, dado el reducido tamano del modelo y su licencia permisiva.
- Prototipado rapido de pipelines ASR: al cargarse con una sola linea mediante `pipeline("automatic-speech-recognition", ...)`, es adecuado para validar productos de transcripcion antes de migrar a la version insignia cerrada del proyecto LuxASR.
- Analisis de conversaciones en servicios publicos o atencion ciudadana en Luxemburgo: transcripcion de llamadas o mensajes de voz para su clasificacion y revision posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (72,6 M de parametros, ~290 MB de pesos) y en torno a 150 MB en fp16; el consumo real depende del framework y del tamano de lote.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM es suficiente; no requiere A100 ni H100. Una RTX 4090 o una T4 quedan sobradamente dimensionadas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer (GTX 1050, RTX 2060, RTX 3060, etc.) e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: Transformers (`pipeline`), y por compatibilidad con la arquitectura Whisper base, herramientas como faster-whisper, whisper.cpp, Ollama (si se empaqueta como modelo Whisper) o servidores de inferencia compatibles con Whisper; el autor solo documenta el uso via Transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unilux/whisper-base-v1-luxembourgish | 72,6 M | 30 s por ventana (Whisper base) | lb | openmdw-1.1 | HuggingFace, abierto |
| openai/whisper-base | 74 M aprox. | 30 s por ventana | multilingue (99 idiomas, incluido lb de forma marginal) | MIT (pesos originales) | HuggingFace, abierto |
| openai/whisper-small | 244 M aprox. | 30 s por ventana | multilingue | MIT (pesos originales) | HuggingFace, abierto |
| Modelo insignia LuxASR (cerrado) | no disponible | no disponible | lb | no disponible (cerrado) | Solo via webservice, API y apps del proyecto |

La comparativa se limita a los modelos Whisper de referencia y a la version cerrada del propio proyecto, ya que no se dispone de datos de otros modelos ASR especificos para luxemburgues en la informacion proporcionada. No se dispone de metricas comparativas de WER entre estos modelos.

## Limitaciones y advertencias

- Especializado exclusivamente en luxemburgues: no debe esperarse un rendimiento adecuado en otros idiomas ni en traduccion.
- Ventana de audio de 30 segundos por segmento (propia de Whisper base); audios mas largos requieren segmentacion y posible perdida de contexto entre fragmentos.
- Modelo de solo 74 M de parametros: la precision en audio ruidoso, acentos marcados, habla solapada o vocabulario tecnico sera inferior a la de variantes mayores (small, medium) o a la version insignia cerrada del proyecto.
- Riesgo de alucinacion en pasajes de silencio, ruido o audio ininteligible, comportamiento conocido de la familia Whisper.
- No se documentan evaluaciones de sesgo ni de robustez por parte del autor; se desconoce el equilibrio demografico y dialectal del corpus de entrenamiento.
- Licencia OpenMDW-1.1: es una licencia abierta, pero conviene revisar sus terminos exactos antes de un uso comercial, ya que no es una licencia MIT o Apache-2.0 al uso.
- Uso en produccion: el modelo abierto es una variante base; el proyecto LuxASR reserva su modelo insignia para el servicio oficial, por lo que para maximizar precision podria ser necesario evaluar dicha API o realizar ajustes adicionales.
- No se documentan requisitos de atribucion especificos mas alla de los de la licencia; se recomienda citar al equipo LuxASR y a OpenAI (Whisper base) en trabajos derivados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unilux/whisper-base-v1-luxembourgish
- Proyecto LuxASR (Universidad de Luxemburgo): https://luxasr.uni.lu/
- Licencia OpenMDW: https://www.openmdw.org
- Modelo base: https://huggingface.co/openai/whisper-base
- Repositorio oficial de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
