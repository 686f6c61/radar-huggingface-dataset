# thuongvv/ZeroTTS

## Resumen

ZeroTTS es un sistema de sintesis de voz (text-to-speech) en vietnamita con clonacion de voz zero-shot, publicado en Hugging Face por el usuario `thuongvv` y desarrollado por el equipo de zeroweight-ai (la model card y el repositorio de codigo apuntan a `zeroweight-ai/ZeroTTS`). El modelo genera voz a partir de texto en vietnamita y clona una voz de referencia a partir de tan solo 3 segundos de audio (hasta 30 segundos), sin necesidad de ajuste fino ni entrenamiento por hablante: la voz queda codificada como un pequeno vector latente que se inyecta en la inferencia.

Su propuesta diferencial es doble. Por un lado, la calidad declarada: 2,91 de UTMOSv2 y 0,936 de similitud de hablante (WavLM-SV) en el conjunto ZeroBench-TTS, con solo 0,029 s de silencio excesivo. Por otro, el coste de despliegue: se distribuye como grafo ONNX y se ejecuta en CPU de portatil a un factor de tiempo real (RTF) de aproximadamente 0,5x, con el primer fragmento de audio en unos 70 ms, lo que habilita streaming sin GPU.

El modelo es relevante porque cubre un nicho poco atendido con licencia permisiva: TTS vietnamita de codigo abierto, con tonos, code-switching vietnamita/ingles y normalizacion de texto integrada (lee `31/12/2025` o `ZeroTTS` sin normalizador externo). El repositorio de Hugging Face ocupa 0,9 GB, no registra descargas ni likes en el momento de la consulta y la model card no publica arquitectura, numero de parametros ni composicion del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica el tipo de red; se distribuye como grafo ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible (modelo TTS; procesa texto de forma incremental y admite streaming) |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas; la distribucion es ONNX) |
| Idiomas soportados | vietnamita (vi); ingles en code-switching y como salida en el modo cross-lingual |
| Licencia | MIT |
| Formato de pesos | ONNX, ejecutado con onnxruntime |
| Frecuencia de muestreo de salida | 48 kHz, mono, float32 |
| Tamano del repositorio | 0,9 GB |
| Velocidad declarada por el autor | RTF ~0,5x en CPU de portatil; primer fragmento de audio en ~70 ms |
| Duracion del audio de referencia para clonacion | de 3 a 30 segundos |
| Libreria de inferencia | `zerotts` (paquete Python) sobre onnxruntime |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo. La model card no detalla si se trata de un transformer autorregresivo, un modelo acustico basado en difusion, flow matching o un esquema VITS/CTC, ni describe el vocoder, el encoder de hablante o el tokenizador de texto. El unico dato estructural cierto es el formato de publicacion: el modelo se sirve como grafo ONNX y se ejecuta mediante onnxruntime, con soporte de sintesis por fragmentos (streaming) en lugar de generacion por lote completo.

Tampoco se documentan los datos de entrenamiento: numero de horas de audio, idioma y procedencia del corpus, voces incluidas, ni si hubo etapas de ajuste por preferencias humanas (RLHF/DPO) o de refinamiento perceptual. La unica innovacion tecnica descrita por el autor es el mecanismo de clonacion zero-shot, en el que una voz se representa como un vector latente que se inyecta en tiempo de inferencia y permite clonar a partir de pocos segundos de referencia, sin entrenamiento por hablante. El autor afirma ademas que el modelo realiza normalizacion de texto implicita, resolviendo fechas, numeros y acronimos sin un modulo externo.

## Capacidades

- Sintesis de voz en vietnamita con tonos, pensada especificamente para el idioma.
- Clonacion de voz zero-shot a partir de 3 a 30 segundos de audio de referencia, sin ajuste fino.
- Voces predefinidas incluidas, como la voz `maichi` usada en los ejemplos de la model card.
- Code-switching vietnamita/ingles: lee fragmentos en ingles dentro de una frase en vietnamita.
- Modo cross-lingual: permite clonar una voz de referencia en vietnamita y generar habla en ingles.
- Normalizacion de texto integrada: lee cifras, fechas y acronimos (por ejemplo, `31/12/2025` o `ZeroTTS`) sin normalizador previo.
- Generacion en streaming con salida incremental y primer fragmento en aproximadamente 70 ms.
- Inferencia en CPU sin GPU, gracias al grafo ONNX y a onnxruntime.
- Salida de audio mono a 48 kHz en formato float32.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso ni uso como agente.
- No se documentan capacidades de vision, audio-entrada, traduccion, ni procesamiento de lenguaje natural mas alla de la lectura de texto.

## Casos de uso

- Audiolibros y narracion larga en vietnamita: el modo de streaming y el RTF de 0,5x en CPU permiten generar horas de audio en un servidor sin GPU, manteniendo una unica voz clonada a lo largo de toda la obra.
- Locucion de noticias y boletines: la normalizacion integrada de fechas, cifras y acronimos evita construir un modulo previo de text normalization, y el code-switching cubre terminos tecnicos en ingles habituales en prensa vietnamita.
- Sistemas de atencion al cliente y IVR: el primer fragmento en ~70 ms reduce la latencia percibida en respuestas habladas, y la clonacion con 3 segundos de audio permite desplegar una voz corporativa consistente sin entrenamiento adicional.
- Accesibilidad y lectores de pantalla: al ejecutarse en CPU de portatil, puede integrarse en aplicaciones de escritorio o moviles que lean en voz alta contenido en vietnamita sin conexion a un servicio en la nube.
- Doblaje y localizacion de contenidos: el modo cross-lingual acepta una referencia de voz en vietnamita y produce habla en ingles, util para preservar la identidad vocal de un locutor al adaptar material entre idiomas.
- Asistentes de voz embebidos y dispositivos edge: el bajo coste computacional y la ausencia de GPU obligatoria encajan en dispositivos con CPU limitada que necesiten respuestas habladas en vietnamita.
- Prototipado de voces y preproduccion de audio: crear una voz a partir de una muestra corta para validar guiones, maquetas de videojuego o demos antes de contratar locucion profesional.
- E-learning y materiales didacticos: generar narraciones en vietnamita con voces consistentes para cursos, con la posibilidad de clonar la voz del instructor a partir de una grabacion breve.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card. Todos figuran como no verificados (`verified: false`).

| Tarea / configuracion | Dataset (split test) | Metrica | Valor |
|---|---|---|---|
| Zero-shot text-to-speech (general) | ZeroBench-TTS | WER (%) — texto sin normalizar | 1,03 |
| Zero-shot text-to-speech (general) | ZeroBench-TTS | UTMOSv2 (MOS de naturalidad) | 2,91 |
| Zero-shot text-to-speech (general) | ZeroBench-TTS | Similitud de hablante (coseno WavLM-SV) | 0,936 |
| Zero-shot text-to-speech (general) | ZeroBench-TTS | Silencio excesivo (s) | 0,029 |
| Monolingue vietnamita | ZeroBench-TTS (vietnamese) | WER (%) — texto sin normalizar | 0,16 |
| Code-switching vietnamita/ingles | ZeroBench-TTS (code_switch) | WER (%) — texto sin normalizar | 0,97 |
| Prompt de voz cross-lingual | ZeroBench-TTS (cross_lingual) | WER (%) — texto sin normalizar | 1,42 |
| Acronimos, fechas y numeros | ZeroBench-TTS (challenging) | WER (%) — texto sin normalizar | 1,75 |

El autor afirma que ZeroTTS comete aproximadamente cuatro veces menos errores de palabra que el siguiente mejor modelo abierto de vietnamita, y que su UTMOSv2 supera al de cualquier otro sistema abierto de vietnamita. No se aportan en la informacion disponible las cifras de esos modelos comparados ni la metodologia completa de medida, por lo que esas afirmaciones no pueden contrastarse.

## Requisitos de hardware

- VRAM para inferencia en GPU: no disponible. El modelo esta disenado para ejecutarse en CPU mediante onnxruntime y no se publican requisitos de memoria de GPU.
- Memoria en CPU: no disponible como cifra explicita. El repositorio completo ocupa 0,9 GB, por lo que los pesos del grafo ONNX son inferiores a esa cifra; a ello hay que anadir el consumo del runtime y del buffer de audio.
- GPU recomendadas: no se especifica ninguna. Al ser un grafo ONNX, podria ejecutarse con el execution provider CUDA de onnxruntime en GPUs como RTX 4090, A100 o H100, pero el autor no publica configuraciones, latencias ni throughput para estos entornos.
- Cabe en GPU de consumo: si, en el sentido de que no requiere GPU; el autor declara ejecucion en CPU de portatil a RTF ~0,5x, con el primer fragmento en unos 70 ms.
- Opciones de despliegue: paquete Python `zerotts` (instalacion con `pip install zerotts`) sobre onnxruntime, con API `ZeroTTS.from_pretrained()` y metodos `synthesize()` y `synthesize_stream()`. Existe una demo en navegador enlazada desde el repositorio de GitHub. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: RTF de aproximadamente 0,5x (unas dos veces mas rapido que el tiempo real) en CPU, y primer fragmento de audio en torno a 70 ms. Estas cifras proceden de la model card y no estan verificadas de forma independiente.
- Parametros totales desconocidos: al no publicarse el numero de parametros, no es posible estimar con precision memoria ni latencia para otras plataformas.

## Comparativa con modelos similares

La informacion proporcionada no incluye resultados de otros modelos de TTS vietnamita ni de TTS multilingue con clonacion zero-shot, por lo que no se dispone de cifras comparables verificadas. La model card solo afirma que ZeroTTS obtiene aproximadamente cuatro veces menos errores de palabra que el siguiente mejor modelo abierto de vietnamita, sin nombrarlo ni aportar sus metricas.

| Modelo | Categoria | Parametros | Contexto / audio de referencia | WER | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ZeroTTS (`thuongvv/ZeroTTS`) | TTS vietnamita zero-shot, ONNX | no disponible | 3-30 s de audio de referencia | 0,16 % (vietnamita monolingue) / 1,03 % (general) | MIT | Hugging Face y GitHub |
| XTTS-v2 (Coqui) | TTS multilingue zero-shot | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible en la informacion proporcionada | no disponible |
| F5-TTS y variantes | TTS zero-shot por flow matching | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |
| Modelos VITS/Piper para vietnamita | TTS mono-hablante o multi-hablante clasico | no disponible en la informacion proporcionada | no aplica (sin clonacion) | no disponible | no disponible | no disponible |

Los tres modelos alternativos se incluyen unicamente como referencia de categoria; los campos se dejan como no disponibles porque no figuran en la informacion proporcionada ni se han contrastado en esta ficha.

## Limitaciones y advertencias

- Idiomas: el ambito principal es el vietnamita. El ingles aparece como code-switching y como salida cross-lingual, pero la tasa de error declarada sube a 0,97 % y 1,42 % de WER en esos escenarios, muy por encima del 0,16 % monolingue.
- Transparencia limitada: no se publican arquitectura, numero de parametros, horas de entrenamiento, composicion del dataset ni procedencia de las voces grabadas.
- Benchmarks no verificados: todas las metricas de la model card figuran con `verified: false` y se miden sobre un conjunto de evaluacion propio (ZeroBench-TTS) definido por los propios autores.
- Pronunciacion de casos dificiles: el WER sube al 1,75 % en el subconjunto con acronimos, fechas y numeros, lo que indica que la normalizacion integrada no es perfecta y conviene revisar ese tipo de contenido en produccion.
- Riesgo de clonacion indebida de voces: la clonacion zero-shot con 3 segundos de audio facilita suplantaciones de identidad vocal. Es necesario contar con consentimiento explicito de la persona cuya voz se clona y cumplir la normativa aplicable sobre datos biometricos y derechos de imagen y voz.
- Sesgos de las voces: al no documentarse el corpus de entrenamiento, no puede evaluarse la representatividad de acentos, dialectos regionales del vietnamita, edades o generos.
- Alucinacion y artefactos acusticos: como en cualquier TTS, existe riesgo de prosodia incorrecta, omisiones de palabras, repeticiones y silencios anomalos en textos atipicos, cifras largas o entradas muy ruidosas. La metrica declarada de silencio excesivo (0,029 s) corresponde al conjunto de evaluacion, no a un uso arbitrario.
- Licencia: MIT, permisiva y apta para uso comercial. La licencia cubre el software y los pesos, pero no concede derechos sobre las voces clonadas ni sobre los audios de referencia empleados.
- Madurez del proyecto: en el momento de la consulta el repositorio de Hugging Face registra 0 descargas y 0 likes, con fecha de creacion y actualizacion en 2026-09-15, lo que indica una validacion externa practicamente nula.
- Discrepancia de identificadores: el identificador consultado es `thuongvv/ZeroTTS`, mientras que la model card y el codigo de ejemplo hacen referencia a `zeroweight-ai/ZeroTTS`. Conviene verificar si se trata de una copia, un espejo o una publicacion duplicada antes de integrarlo en produccion.
- Rendimiento declarado por el autor: las cifras de RTF 0,5x y 70 ms de primer fragmento dependen del hardware y del texto, y no se especifican las condiciones de medida.

## Enlaces

- Modelo en Hugging Face (identificador consultado): https://huggingface.co/thuongvv/ZeroTTS
- Modelo referenciado en la model card: https://huggingface.co/zeroweight-ai/ZeroTTS
- Repositorio de codigo, ejemplos y demo en navegador: https://github.com/zeroweight-ai/ZeroTTS
- Dataset de evaluacion ZeroBench-TTS: https://huggingface.co/datasets/zeroweight-ai/ZeroBench-TTS
- Blog del autor: https://zeroweight.ai/blog/zero-tts
- Identificador arXiv citado en las etiquetas del modelo: https://arxiv.org/abs/2602.10934 (no verificado en esta busqueda)
- Muestras de audio publicadas en la model card: conversation.mp3, storytelling.mp3, news-code-switch.mp3, cross-lingual-reference-vi.mp3, cross-lingual-english.mp3 (rutas relativas al repositorio `zeroweight-ai/ZeroTTS`)

Nota sobre la busqueda web: los resultados obtenidos corresponden a paginas de inicio de sesion ajenas al modelo (HELHa) y no aportan informacion util sobre ZeroTTS; no se han localizado otras fuentes independientes en la informacion disponible.
