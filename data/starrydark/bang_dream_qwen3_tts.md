# starrydark/BanG_Dream_Qwen3_TTS

## Resumen

BanG_Dream_Qwen3_TTS es un ajuste fino completo (full fine-tune) del modelo base Qwen/Qwen3-TTS-12Hz-1.7B-Base, desarrollado por el usuario starrydark como proyecto de fan no oficial. Su proposito es la sintesis de voz (text-to-speech) de 49 voces de personajes de la franquicia BanG Dream!, incluyendo las bandas de Girls Band Party, MyGO!!!!! y Ave Mujica, sin necesidad de audio de referencia: cada voz se invoca directamente mediante un identificador de hablante.

El modelo resuelve el problema de generar voces de personaje consistentes y reconocibles en tres idiomas (japones, mandarin y ingles) a partir de texto, algo que los modelos TTS genericos no ofrecen sin clonacion de voz por referencia. Tecnicamente es un checkpoint de tipo `custom_voice` de Qwen3-TTS con 1.916.676.352 parametros (aproximadamente 1,7B), pesos en safetensors y un repositorio de 8,3 GB.

Es relevante ahora porque demuestra el patron de adaptacion de un TTS base de gran calidad a dominios muy especificos mediante fine-tuning completo con datos curados (23,4 horas de audio en 11.341 filas de entrenamiento), y porque expone con transparencia sus limitaciones de licencia y de fidelidad de timbre por idioma, algo poco habitual en modelos de fan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-TTS (modelo de lenguaje de codec de audio, 12 Hz), fine-tune completo del base Qwen3-TTS-12Hz-1.7B-Base |
| Parametros totales | 1.916.676.352 (aprox. 1,7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | japones (ja), mandarin (zh), ingles (en) |
| Licencia | other / unofficial-fan-model (sin derechos concedidos) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 8,3 GB |
| Pipeline | text-to-speech |
| Libreria | qwen-tts |
| Voces | 49 filas de hablante (45 personajes, 4 variantes de persona) en `main`; 25 voces adicionales en la rama `ournotes` |
| Version | E1b epoch 2 (entrenado el 2026-10-30, publicado el 2026-11-06) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3-TTS-12Hz-1.7B-Base, un TTS de Qwen construido como modelo de lenguaje sobre un codec de audio de 12 Hz. Sobre esa base se realizo un fine-tune completo (no LoRA ni adaptadores) para inyectar las voces de personaje. La inferencia se hace con `generate_custom_voice`, que recibe texto, un `speaker` id y un `language`, y devuelve audio sin audio de referencia.

Los datos de entrenamiento documentados por el autor son 9.268 lineas de voz en japones de las 49 voces (extraidas de 22,1 horas conservadas), mas 1.509 clips nativos de mandarin e ingles y 564 filas de pseudo-mandarin en voz de personaje con control de acceso: en total 11.341 filas y 23,4 horas. El autor indica que cada fila de entrenamiento llevo un identificador de idioma, lo que segun su model card es lo que evita el acento japones en mandarin e ingles. No se documentan datos de RLHF o DPO en la informacion disponible.

Como innovacion practica destacable, el autor publica un pipeline de datos y un entrenador corregido en el repositorio de codigo, ademas de una ruta RVC por voz para el mandarin nativo. Tambien separa las voces de la era Our Notes en una rama independiente (`ournotes`, checkpoint E9) para no mezclar distribuciones de entrenamiento.

## Capacidades

- Sintesis de voz multi-hablante: 49 voces de personaje invocables por `speaker` id, sin audio de referencia.
- TTS multilingue en japones, mandarin e ingles, con seleccion explicita de idioma mediante el parametro `language`.
- Voces de personaje con variantes de persona (por ejemplo, 大魔姫あこ, 月ノ森 Soyo / Sakiko y Mortis) como filas propias.
- Rama opcional `ournotes` con 25 voces adicionales: 16 personajes nuevos y la era Our Notes de nueve personajes de MyGO!!!!! / Ave Mujica.
- Control de acento: el identificador de idioma y la repeticion nativa permiten generar mandarin e ingles sin el acento japones del personaje.
- Generacion de audio sintetico a partir de texto libre, con muestreo por defecto (temperatura 0,9, top-k 50).
- No se documentan capacidades de tool calling, agentes, vision ni audio de entrada en la informacion disponible.

## Casos de uso

- Doblaje de fan para contenido derivado: el modelo permite generar lineas de dialogo de un personaje concreto a partir de un guion de texto, usando el `speaker` id correspondiente y eligiendo japones, mandarin o ingles segun el publico objetivo.
- Creacion de contenido audiovisual en japones: para videos, podcasts o cortometrajes de fan, el modelo sintetiza voces de personaje consistentes sin necesidad de grabar referencia, lo que simplifica la produccion de dialogos multi-personaje.
- Localizacion a mandarin e ingles: el soporte nativo de tres idiomas y el identificador de idioma por fila permiten doblar un mismo texto a mandarin o ingles manteniendo el timbre del personaje, con la salvedad de que algunas voces suenan mas genericas en esos idiomas.
- Prototipado de videojuegos y mods: un desarrollador puede integrar el modelo en un pipeline de generacion de voces para prototipos de visual novels o mods, usando `generate_custom_voice` con el id de hablante y exportando WAV con soundfile.
- Demostraciones interactivas: el Space oficial en ZeroGPU permite probar las 74 voces escribiendo texto, util para validar la calidad antes de integrar el modelo en una aplicacion.
- Investigacion sobre TTS de personaje: el repositorio de codigo publica el pipeline de datos, el entrenador y los planes y resultados pre-registrados, lo que sirve como referencia reproducible para fine-tunes de Qwen3-TTS en dominios acotados.
- Generacion de locuciones para fan arts o audio drama: con 23,4 horas de datos de entrenamiento y 49 voces, el modelo cubre una plantilla amplia de personajes para producciones de audio de fan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 1,7B parametros en bfloat16 el peso ronda los 3,4 GB, por lo que se puede estimar un consumo moderado, pero el autor no publica cifras medidas.
- GPU recomendadas: no disponibles; el ejemplo de la model card usa `device_map="cuda"` con `torch.bfloat16` sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada por el autor; el Space de demostracion funciona en ZeroGPU, lo que sugiere viabilidad en hardware compartido, pero no se detalla el modelo de GPU.
- Opciones de despliegue: libreria `qwen-tts` (`pip install qwen-tts`) con `Qwen3TTSModel.from_pretrained`; no se documentan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BanG_Dream_Qwen3_TTS | 1,7B (1.916.676.352) | ja, zh, en | no disponible | unofficial-fan-model (sin derechos) | Hugging Face, rama `ournotes`, Space demo |
| Qwen/Qwen3-TTS-12Hz-1.7B-Base | 1,7B | no disponible en la informacion | no disponible | no disponible en la informacion | Hugging Face (modelo base) |
| Alternativas TTS genericas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que la comparativa se limita al modelo base y a la ausencia de alternativas documentadas.

## Limitaciones y advertencias

- Licencia `unofficial-fan-model`: no se conceden derechos de uso; el modelo es un proyecto de fan no afiliado a Bushiroad, Craft Egg, el proyecto BanG Dream!, los voicebanks oficiales 夢ノ結唱 ni al reparto de voces.
- Riesgo legal y etico: sintetiza voces de personajes con derechos de terceros; el uso comercial o la difusion sin etiquetar el audio como generado por IA puede vulnerar derechos y normas de la plataforma.
- Fidelidad de timbre variable en mandarin: el autor clasifica 8 voces como "parcialmente genericas" y 7 como "genericas" al hablar en mandarin (por ejemplo, `ppp_kasumi`, `mygo_tomori`, `ras_lock`), por lo que el personaje puede no reconocerse en ese idioma.
- Dependencia del parametro `language`: omitirlo o usar un valor incorrecto puede introducir acento japones en mandarin e ingles; el autor lo marca como obligatorio.
- Decodificacion: el muestreo codicioso hace que el modelo de codec entre en bucles; hay que mantener temperatura 0,9 y top-k 50.
- Variabilidad por semilla: en mandarin e ingles, para las voces marcadas como genericas conviene probar varias semillas.
- Contexto y cuantizaciones no documentados: no hay informacion sobre longitud maxima de texto, latencia ni formatos GGUF u otros.
- Audio sintetico: debe etiquetarse como generado por IA en cualquier difusion.
- Repositorio de 8,3 GB: requiere espacio en disco y descarga considerable para su despliegue local.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/starrydark/BanG_Dream_Qwen3_TTS
- Rama `ournotes` (25 voces adicionales): https://huggingface.co/starrydark/BanG_Dream_Qwen3_TTS/tree/ournotes
- Demo Space: https://huggingface.co/spaces/starrydark/BanG_Dream_Qwen3_TTS
- Codigo y pipeline: https://github.com/starryark/bangdream-tts
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Seccion de derechos y uso responsable: https://huggingface.co/starrydark/BanG_Dream_Qwen3_TTS#rights-and-responsible-use
- Paper referenciado en los tags (arXiv:2601.15621): no disponible como enlace verificado en la informacion proporcionada.
