# wannaphong/typhoon-isan-asr-whisper

## Resumen

Typhoon Isan ASR Whisper es un modelo de reconocimiento automático del habla (ASR) desarrollado por el equipo Typhoon de SCB 10X y publicado en HuggingFace por el usuario wannaphong. Se trata de un ajuste fino del modelo biodatlab/whisper-th-medium-combined, orientado específicamente al dialecto isan (isan, tailandés nororiental) del tailandés. El problema que resuelve es la baja precisión de los sistemas ASR generalistas sobre variedades dialectales con poca representación en los corpus de entrenamiento habituales.

Arquitectónicamente es un transformer encoder-decoder de tipo Whisper, con 763.857.920 parámetros reales (aproximadamente 769 M, el tamaño "medium" de la familia Whisper). El modelo está pensado para transcripción offline de alta fidelidad, de modo que organizaciones tailandesas puedan autoalojar su propio servicio ASR sin enviar audio sensible a APIs de terceros.

Su relevancia actual radica en que, según la propia model card, supera a un sistema propietario de gran escala como Gemini-2.5-pro en esta tarea concreta: CER de 0,0885 frente a 0,1020. El repositorio ocupa 3,1 GB, la licencia declarada es Apache 2.0 y el único idioma etiquetado es el tailandés (th), con foco en la variante isan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 763.857.920 (aprox. 769 M, segun safetensors) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No especificada en la informacion disponible; la arquitectura Whisper procesa ventanas de audio de 30 segundos |
| Tipos de cuantizacion | No indicados en la model card; los pesos safetensors permiten conversion posterior a fp16, int8 y GGUF (no verificados por el autor) |
| Idiomas soportados | Tailandes (th), con especializacion en el dialecto isan |
| Licencia | Apache 2.0 (la model card remite ademas a los terminos OpenTyphoon) |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Whisper de OpenAI, en su variante medium: un encoder-decoder basado en transformer que convierte espectrogramas mel en tokens de texto. El punto de partida es biodatlab/whisper-th-medium-combined, una version ya adaptada al tailandes estandar, sobre la que se ha realizado un ajuste fino supervisado con datos de habla isan. Este enfoque en dos etapas (preentrenamiento multilingue de Whisper, adaptacion al tailandes, especializacion dialectal) es lo que permite manejar tonos y vocabulario regional sin perder la robustez del modelo base.

La model card no detalla el numero de tokens de audio utilizados en el ajuste fino, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO (en ASR estos metodos se sustituyen habitualmente por ajuste supervisado, aumentacion de datos y decodificacion con modelo de lenguaje externo). Tampoco se especifican innovaciones arquitectonicas propias: el modelo hereda las caracteristicas estandar de Whisper, incluida la posibilidad de usar decodificacion con marcas de tiempo y de integrarse en pipelines optimizados como faster-whisper o CTranslate2.

## Capacidades

- Transcripcion de voz a texto en tailandes, con especializacion en el dialecto isan del noreste de Tailandia.
- Reconocimiento de habla espontanea y conversacional, no solo lectura de texto.
- Funcionamiento offline: puede desplegarse en infraestructura propia sin dependencia de APIs externas.
- Integracion con la libreria transformers mediante la pipeline `automatic-speech-recognition`.
- Compatibilidad con endpoints de inferencia (etiqueta `endpoints_compatible`).
- Generacion de marcas de tiempo a nivel de segmento (capacidad heredada de Whisper; no confirmada explicitamente en la model card).
- No hay soporte declarado de tool calling, function calling, agentes, vision ni audio mas alla de la transcripcion.
- No se declaran capacidades multilingues: la etiqueta de idioma es unicamente `th`.

## Casos de uso

- Transcripcion offline de audio isan: el modelo se ejecutaria en servidores propios para convertir grabaciones en texto sin enviar material sensible a la nube, con un CER de 0,0885 segun la model card.
- Subtitulado de contenido audiovisual regional: series, documentales o videos divulgativos en isan pueden transcribirse y segmentarse para generar subtitulos, aprovechando que el modelo supera a Gemini-2.5-pro en precision sobre este dialecto.
- Digitalizacion de patrimonio oral: archivos de historia oral, musica tradicional o entrevistas etnograficas en isan pueden convertirse en corpus textuales consultables, algo inviable con ASR estandar de tailandes.
- Investigacion linguistica y sociolinguistica: la transcripcion sistematica de habla dialectal facilita estudios de variacion fonetica y lexica que requieren volumen de datos.
- Atencion al cliente en el noreste de Tailandia: centralitas y call centers pueden transcribir llamadas en isan para analitica de calidad, busqueda de texto completo y cumplimiento normativo.
- Servicios publicos y sanidad en zonas rurales: transcripcion de consultas medicas o tramites administrativos hablados en isan, donde el tailandes estandar no refleja el habla real del usuario.
- Accesibilidad: generacion de subtitulos automaticos para personas con discapacidad auditiva en contenido producido en dialecto isan, un nicho practicamente sin cobertura comercial.
- Entrenamiento de corpus para otros modelos: las transcripciones generadas pueden servir como datos etiquetados para ajustar modelos posteriores de traduccion isan-tailandes estandar o de sintesis de voz.

## Benchmarks y rendimiento

| Modelo | CER (menor es mejor) |
|---|---|
| wannaphong/typhoon-isan-asr-whisper | 0,0885 |
| Gemini-2.5-pro | 0,1020 |
| typhoon-isan-asr-realtime | 0,1065 |
| scb10x/whisper-medium-slscu-nectec (baseline) | No publicado como valor numerico en la model card |
| SLSCU/thai-dialect_korat_model | No evaluado en la comparativa publicada |

Los resultados proceden de la grafica de rendimiento incluida en la model card del autor. La metrica empleada es el Character Error Rate (CER), adecuada para lenguas sin separacion clara de palabras como el tailandes. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de texto, ya que no son aplicables a un modelo ASR.

## Requisitos de hardware

- Pesos en fp32: aproximadamente 3,06 GB; en fp16/bf16, aproximadamente 1,53 GB; en int8, aproximadamente 0,76 GB (estimaciones derivadas del numero de parametros, no verificadas por el autor).
- VRAM total para inferencia: del orden de 2-4 GB en fp16 contando activaciones y buffers de audio, por lo que cabe holgadamente en GPU de consumo.
- GPU compatibles: cualquier GPU con 4 GB o mas de VRAM, como GTX 1650, RTX 3050, RTX 3060, RTX 4060 o RTX 4090; tambien A100, H100 y L4 en entornos de servidor, aunque estan sobredimensionadas para 769 M de parametros.
- CPU: viable con cuantizacion int8 mediante CTranslate2 o whisper.cpp, con latencias mayores.
- Opciones de despliegue: transformers (pipeline de ASR), faster-whisper sobre CTranslate2, whisper.cpp con pesos convertidos a GGUF, HuggingFace Inference Endpoints (etiqueta `endpoints_compatible`) y TGI, que soporta modelos Whisper.
- Latencia y throughput: no disponibles en la informacion proporcionada. En fp16 sobre una GPU moderna se espera un factor de tiempo real claramente inferior a 1 para audio de 30 segundos, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | CER | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wannaphong/typhoon-isan-asr-whisper | 769 M | Tailandes (isan) | 0,0885 | Apache 2.0 | HuggingFace |
| biodatlab/whisper-th-medium-combined | No disponible | Tailandes | No disponible | No disponible | HuggingFace (modelo base) |
| typhoon-isan-asr-realtime | No disponible | Tailandes (isan) | 0,1065 | No disponible | Familia Typhoon |
| scb10x/whisper-medium-slscu-nectec | No disponible | Tailandes (isan) | No publicado en la card | No disponible | Baseline de la comparativa |
| Gemini-2.5-pro | No disponible | Multilingue | 0,1020 | Propietaria | API de Google |

La ventaja diferencial del modelo es que combina el mejor CER de la comparativa con una licencia permisiva y despliegue autoalojado, algo que Gemini-2.5-pro no ofrece. Frente a typhoon-isan-asr-realtime, gana en precision pero probablemente pierde en latencia, ya que el segundo esta optimizado para streaming.

## Limitaciones y advertencias

- Especializacion estrecha: solo se declara tailandes (isan). Su uso con tailandes estandar, otras lenguas o dialectos distintos puede degradar gravemente la calidad.
- Riesgo de alucinacion: como todo modelo Whisper, puede generar texto plausible en segmentos con silencio, ruido o audio ininteligible, especialmente con acentos no vistos en el ajuste.
- Sensibilidad a la calidad del audio: el rendimiento cae con ruido de fondo, solapamiento de hablantes, microfonos deficientes o audio telefonico de banda estrecha.
- Sin diarizacion de hablantes: el modelo transcribe, pero no identifica quien habla; para ello se necesita un pipeline externo como pyannote.
- Datos de entrenamiento no publicados: no se detalla el volumen, la procedencia ni el consentimiento de los datos de habla isan usados en el ajuste fino, lo que dificulta evaluar sesgos o riesgos de privacidad.
- Ambiguedad de licencia: el repositorio declara Apache 2.0, pero la model card exige aceptar los terminos y condiciones y el aviso de privacidad de OpenTyphoon. Conviene aclarar contractualmente cual prevalece antes de un uso comercial.
- Adopcion nula verificable: cero descargas y cero "me gusta" en el momento de la consulta, sin senales de validacion independiente por parte de la comunidad.
- Enlaces incompletos: las referencias a demo, repositorio de GitHub y blog de lanzamiento aparecen en la model card sin URL, por lo que no son verificables.
- Idiomas y contexto: la card no documenta la longitud de contexto textual ni la estrategia de segmentacion de audio largo, algo critico para transcribir reuniones o podcasts de mas de 30 segundos sin un pipeline de chunking.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/wannaphong/typhoon-isan-asr-whisper
- Modelo base: https://huggingface.co/biodatlab/whisper-th-medium-combined
- Arquitectura original de referencia: https://huggingface.co/openai/whisper-medium
- Trabajo previo sobre dialecto isan: https://huggingface.co/SLSCU/thai-dialect_korat_model
- Terminos y condiciones de OpenTyphoon: https://opentyphoon.ai/tac
- Aviso de privacidad de OpenTyphoon: https://opentyphoon.ai/privacy
- Twitter del equipo: https://twitter.com/opentyphoon
- Discord de soporte: https://discord.gg/us5gAYmrxw
- Demo, repositorio de codigo y blog de lanzamiento: enlaces citados en la model card sin URL disponible
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos no guardan relacion con el contenido tecnico solicitado
