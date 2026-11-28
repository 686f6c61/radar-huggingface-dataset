# Yvkwa/wolof-asr-base-onnx

## Resumen

`Yvkwa/wolof-asr-base-onnx` es una conversión al formato ONNX del modelo `cifope/whisper-base-wolof`, un Whisper base reentrenado para reconocimiento automático del habla (ASR) en wolof. Lo publica el usuario Yvkwa y su propósito no es mejorar el modelo original, sino empaquetarlo para que pueda ejecutarse en el navegador mediante Transformers.js, incluido en dispositivos móviles como el iPhone. El repositorio es de tamano reducido (0,1 GB) y las descargas y likes registrados son cero en el momento de la consulta.

La arquitectura subyacente es la de Whisper base de OpenAI: un transformer encoder-decoder con aproximadamente 74 millones de parametros, entrenado originalmente para transcripción multilingüe y afinado aquí sobre wolof. La conversión aplica cuantización dinámica de 8 bits (QUInt8) sobre el encoder y el decoder fusionado, lo que reduce el peso a unos 107 MB, una cifra compatible con la carga en navegador.

Su relevancia es acotada pero concreta: el wolof es una lengua con recursos limitados y pocos modelos ASR disponibles, y esta versión permite desplegar transcripción de voz en el cliente sin servidor, sin enviar audio a terceros y con una huella de descarga mínima. No obstante, la ficha técnica del autor es mínima y no aporta datos de evaluación, por lo que su calidad real de transcripción no está documentada en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper base), convertido a ONNX |
| Parametros totales | No disponible en la informacion (Whisper base, ~74 M por arquitectura de referencia) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (Whisper base opera sobre ventanas de audio de 30 s) |
| Tipos de cuantizacion | Cuantizacion dinamica 8 bits (QUInt8) del encoder y del decoder fusionado; exportacion ONNX con `automatic-speech-recognition-with-past` |
| Idiomas soportados | Wolof (`wo`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (repo de 0,1 GB; pesos cuantizados ~107 MB) |

## Arquitectura y entrenamiento

El modelo base es Whisper base, un transformer encoder-decoder con atención completa entrenado por OpenAI para ASR multilingüe y posteriormente reentrenado sobre wolof por el autor original (`cifope`). La información disponible no detalla el volumen de datos de entrenamiento, la composición del corpus ni si se aplicaron técnicas de ajuste fino supervisado, RLHF o DPO; únicamente se indica que es un Whisper base reentrenado en wolof.

La aportación de este repositorio es exclusivamente de empaquetado e inferencia: se realizó la exportación ONNX con la tarea `automatic-speech-recognition-with-past`, se aplicó cuantización dinámica QUInt8 al encoder y al decoder fusionado, y se fijó `language: null` en `generation_config.json` porque Whisper no incluye un código de idioma para wolof. Esta última modificación es relevante: al no poder indicar el idioma de destino, el modelo depende de la detección automática o del comportamiento por defecto del decoder, lo que puede afectar a la consistencia de las transcripciones.

## Capacidades

- Reconocimiento automático del habla en wolof a partir de audio de entrada a 16 kHz en formato float32.
- Ejecución en navegador mediante Transformers.js con `dtype: "q8"`, sin backend de servidor.
- Funcionamiento en dispositivos móviles, incluido iPhone, según declara el autor.
- Inferencia offline una vez descargado el modelo (~107 MB cuantizado).
- No se documentan capacidades de traducción, diarización de hablantes, marcas de tiempo, tool calling ni razonamiento multi-paso.
- No se documenta soporte multilingüe más allá del wolof.

## Casos de uso

- Transcripción de voz en aplicaciones web sin servidor: el modelo se carga con Transformers.js en el cliente y procesa audio de 16 kHz directamente en el navegador, lo que elimina la necesidad de infraestructura de inferencia y evita enviar grabaciones a terceros.
- Privacidad en la captura de audio: al ejecutarse en el dispositivo, resulta adecuado para entrevistas, consultas médicas o testimonios donde el audio no debe salir del terminal.
- Aplicaciones móviles de campo: con ~107 MB de descarga y ejecución en iPhone, permite a trabajadores de campo transcribir notas de voz en wolof en entornos con conectividad limitada.
- Accesibilidad y dictado en wolof: integración en editores o formularios web para usuarios que prefieren dictar en lugar de escribir en una lengua con teclados y correctores poco desarrollados.
- Digitalización de archivos orales: transcripción por lotes de grabaciones en wolof en proyectos de documentación lingüística o archivo sonoro, ejecutando el modelo en el navegador o en Node.js sin GPU.
- Prototipado rápido de ASR de bajo coste: al ser un artefacto ONNX cuantizado, sirve para validar pipelines de reconocimiento de voz en wolof antes de invertir en infraestructura o en un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con pesos cuantizados a 8 bits (~107 MB) la huella de memoria es muy reducida y compatible con ejecución en CPU.
- GPU recomendadas: no se indican; el caso de uso declarado es navegador y dispositivo móvil, por lo que la ejecución en CPU es el escenario principal.
- Cabe en GPU de consumo: sí, con amplio margen, dado el tamano del artefacto; también en CPU y en navegador móvil.
- Opciones de despliegue: Transformers.js (declarado), y por ser ONNX, potencialmente ONNX Runtime en otros entornos; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Yvkwa/wolof-asr-base-onnx | Whisper base (~74 M, no confirmado en la ficha) | Ventanas de audio de 30 s (arquitectura Whisper) | Wolof | Apache 2.0 | ONNX cuantizado 8 bits | Hugging Face, Transformers.js |
| cifope/whisper-base-wolof | Whisper base | Ventanas de audio de 30 s | Wolof | No disponible en la informacion | Pesos originales (no ONNX) | Hugging Face |
| Whisper base (OpenAI) | ~74 M | Ventanas de audio de 30 s | Multilingüe (sin wolof entre los idiomas soportados) | MIT (modelo original) | PyTorch, ONNX, GGUF (comunidad) | Hugging Face, OpenAI |

No se dispone de datos de rendimiento comparado entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No hay métricas de evaluación publicadas (WER u otras), por lo que la calidad de transcripción en wolof no puede verificarse a partir de la información disponible.
- El modelo fija `language: null` porque Whisper no tiene código para wolof; esto puede provocar inconsistencias en la generación y dificulta el control del idioma de salida.
- Riesgo de alucinación: como todo modelo de la familia Whisper, puede generar texto plausible no presente en el audio, especialmente con ruido, silencios o audio de baja calidad.
- Sesgos: no documentados por el autor; al derivar de un corpus de entrenamiento no descrito, se desconocen sesgos dialectales, de género o de registro.
- Cobertura limitada a wolof; no se debe esperar buen rendimiento en otras lenguas ni en mezcla de lenguas.
- Licencia Apache 2.0, que permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad sobre el modelo base recae en su creador original.
- Repositorio sin descargas ni validación comunitaria en el momento de la consulta; conviene tratarlo como artefacto experimental.
- La cuantización dinámica de 8 bits puede degradar ligeramente la precisión respecto a los pesos originales, sin que se haya cuantificado esa pérdida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yvkwa/wolof-asr-base-onnx
- Modelo base: https://huggingface.co/cifope/whisper-base-wolof
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
