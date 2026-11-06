# unilux/whisper-small-v1-luxembourgish

## Resumen

Whisper-small-v1-luxembourgish es un modelo de reconocimiento automatico del habla (ASR) especializado en luxemburgues (`lb`), desarrollado por el equipo LuxASR del Departamento de Humanidades de la Universidad de Luxemburgo. Se trata de un fine-tuning de `openai/whisper-small`, la arquitectura encoder-decoder de OpenAI presentada en 2022, adaptada a un idioma de bajos recursos con apenas 300.000 hablantes y escasa representacion en corpus ASR multilingues.

El modelo forma parte de la familia abierta LuxASR, que incluye las variantes tiny, base, small y medium; la variante flagship empleada en el servicio web, la API y las aplicaciones iOS y Android del proyecto permanece cerrada. Con aproximadamente 244 millones de parametros y un repositorio de 1 GB en safetensors, el modelo esta pensado para transcripcion de voz a texto en luxemburgues, investigacion linguistica y accesibilidad.

Su relevancia actual radica en que cubre un hueco practico: el luxemburgues es idioma oficial del pais pero carece de modelos ASR abiertos de calidad. Este checkpoint ofrece una base reproducible y abierta (licencia OpenMDW-1.1) para desarrolladores que necesiten integrar transcripcion en luxemburgues sin depender de servicios propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper Small (encoder-decoder transformer) |
| Parametros totales | 241.734.912 (~244 M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers) |
| Idiomas soportados | Luxemburgues (`lb`) |
| Licencia | Open Model, Data & Weights (openmdw-1.1) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper Small de OpenAI: un transformer encoder-decoder con atencion estandar, entrenado originalmente por OpenAI sobre 680.000 horas de audio supervisado multilingue. Este checkpoint es un fine-tuning sobre pares audio-texto en luxemburgues, dentro de la iniciativa LuxASR, que segun la model card acumula aproximadamente 150 horas de datos a escala de proyecto (no necesariamente todas usadas en este checkpoint concreto).

No se detalla en la informacion disponible la composicion exacta del dataset de fine-tuning, el numero de pasos, la estrategia de aumentacion de datos ni si se aplicaron tecnicas de RLHF o DPO (poco habituales en ASR). Tampoco se especifica si se congelaron capas del encoder o se entreno el modelo completo. La innovacion principal es la adaptacion de un modelo multilingue generico a un idioma de bajos recursos manteniendo el pipeline estandar de `transformers`.

## Capacidades

- Transcripcion de voz a texto en luxemburgues (`lb`).
- Procesamiento de audio en ventanas de 30 segundos, propio de la familia Whisper.
- Integracion directa con `transformers` mediante `pipeline("automatic-speech-recognition")`.
- Salida de texto plano; no se documenta soporte de timestamps por palabra ni diarizacion.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no aplica a un modelo ASR).
- Capacidad multilingue limitada al luxemburgues; no se garantiza comportamiento correcto en otros idiomas pese al origen multilingue del modelo base.
- No se documentan modos especiales como thinking mode, vision o audio generativo.

## Casos de uso

- Transcripcion de medios audiovisuales en luxemburgues: subtitulado automatico de videos, programas de television o radio en `lb`, usando el pipeline estandar de `transformers` con ventanas de 30 s.
- Accesibilidad: generacion de subtitulos para personas con discapacidad auditiva en contenido producido en Luxemburgo, donde apenas existen alternativas ASR abiertas.
- Investigacion linguistica: creacion de corpus transcritos de luxemburgues para estudios foneticos, lexicograficos o de variacion dialectal, aprovechando la licencia abierta.
- Prototipado de asistentes de voz locales: integracion en aplicaciones de escritorio o moviles que necesiten dictado en luxemburgues sin enviar audio a servicios en la nube.
- Archivado y busqueda de audio historico: transcripcion de grabaciones institucionales o entrevistas para hacerlas indexables y consultables por texto.
- Evaluacion comparativa de ASR de bajos recursos: servir como baseline abierto frente a modelos multilingues genericos (Whisper original, MMS, etc.) en benchmarks de luxemburgues.
- Educacion y aprendizaje del idioma: transcripcion de material didactico para generar ejercicios o apoyos textuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16: en torno a 0,5 GB para los pesos, mas overhead de activaciones y buffers de audio; en la practica cabe en cualquier GPU con 2 GB o mas.
- En fp32: aproximadamente 1 GB de pesos, tambien holgado en GPUs de gama baja.
- GPU recomendadas: cualquier GPU moderna sirve; para alto throughput, A100, H100, L4 o RTX 4090; para uso individual, RTX 3060 o superior, e incluso CPU para audio corto.
- Cabe en GPU de consumo: si, en practicamente todas las GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, etc.).
- Opciones de despliegue: `transformers` (pipeline nativo), vLLM no aplica (ASR), TGI con soporte ASR limitado, `faster-whisper`/CTranslate2 si se convierte el checkpoint, llama.cpp no soporta Whisper de forma directa, Ollama no esta orientado a ASR.
- Latencia y throughput: no disponibles en la informacion proporcionada; como referencia cualitativa, Whisper Small procesa audio en tiempo real o mas rapido en GPU modernas, pero no se aportan cifras oficiales para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unilux/whisper-small-v1-luxembourgish | ~244 M | `lb` | ventanas de 30 s | openmdw-1.1 | Hugging Face |
| openai/whisper-small | ~244 M | multilingue (99 idiomas) | ventanas de 30 s | MIT (pesos OpenAI) | Hugging Face, ampliamente desplegado |
| unilux/whisper-medium-v1-luxembourgish (familia LuxASR) | ~769 M (estimado por arquitectura) | `lb` | ventanas de 30 s | openmdw-1.1 (segun familia) | Hugging Face (referenciado en la model card) |
| Facebook MMS (modelo `lb` si existe) | variable | multilingue | variable | CC-BY-NC 4.0 (tipicamente) | Hugging Face |

La comparativa con MMS se incluye como referencia de categoria (ASR multilingue de bajos recursos); no se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente para luxemburgues; su uso en otros idiomas producira transcripciones incorrectas o alucinaciones.
- Al ser un fine-tuning sobre ~150 horas de datos a escala de proyecto, el rendimiento puede degradarse en dominios alejados del corpus (acentos regionales, ruido de fondo, jerga tecnica).
- Riesgo de alucinacion tipico de Whisper: en segmentos silenciosos o ruidosos puede generar texto inventado; se recomienda usar deteccion de actividad de voz y filtros posteriores.
- Sesgos potenciales derivados de la sobrerrepresentacion de determinados hablantes o registros en el corpus de entrenamiento; no se documenta analisis de sesgo.
- Licencia OpenMDW-1.1: conviene revisar los terminos exactos en openmdw.org antes de uso comercial; no es una licencia permisiva clasica como MIT o Apache 2.0.
- La variante flagship del proyecto (usada en el servicio web y apps) es cerrada, por lo que este checkpoint no equivale al mejor rendimiento de la familia LuxASR.
- No se documentan limitaciones de longitud de audio mas alla de la ventana nativa de 30 s de Whisper; audios mas largos requieren chunking manual.
- No hay informacion sobre calibracion de timestamps ni soporte de marcas temporales a nivel de palabra.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unilux/whisper-small-v1-luxembourgish
- Proyecto LuxASR (Universidad de Luxemburgo): https://luxasr.uni.lu/
- Modelo base: https://huggingface.co/openai/whisper-small
- Licencia OpenMDW: https://www.openmdw.org
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper en OpenAI: https://github.com/openai/whisper
