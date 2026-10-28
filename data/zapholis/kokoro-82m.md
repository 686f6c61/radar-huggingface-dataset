# Zapholis/Kokoro-82M

## Resumen

Kokoro-82M es un modelo de síntesis de voz (text-to-speech) de pesos abiertos con 82 millones de parámetros, desarrollado originalmente por el equipo de hexgrad, que logra una calidad de audio comparable a modelos mucho mayores con un coste computacional muy inferior. Este repositorio concreto, `Zapholis/Kokoro-82M`, es una republicación del modelo: la model card reproduce la ficha original y los metadatos lo marcan como *finetune* de `yl4579/StyleTTS2-LJSpeech`, con licencia Apache 2.0 y pipeline `text-to-speech`.

El modelo resuelve el problema de convertir texto en voz de forma económica y desplegable en cualquier entorno: el repo ocupa 0,4 GB y el coste de entrenamiento declarado es de unas 1000 horas de A100 80 GB (aproximadamente 1000 dólares). Frente a alternativas con licencias restrictivas, su licencia Apache 2.0 permite uso comercial sin fricción, lo que explica su adopción en APIs comerciales.

Es relevante ahora porque demuestra que un modelo de 82 M puede competir en calidad percibida con sistemas de varios cientos de millones de parámetros, y porque su tarifa de referencia en API (por debajo de 1 dólar por millón de caracteres, o 0,06 dólares por hora de audio) lo sitúa como una opción de producción real, no solo de laboratorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS 2 (arXiv:2306.07691) con vocoder ISTFTNet (arXiv:2203.02395); decoder-only, sin difusión y sin encoder publicado |
| Parametros totales | 82 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; no hay ventana de contexto autoregresiva: el texto se procesa por fragmentos mediante G2P |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el repo completo ocupa 0,4 GB |
| Idiomas soportados | Ingles (etiqueta del repo). La ficha del modelo original declara 8 idiomas y 54 voces en la version v1.0 |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible de forma explicita en la informacion proporcionada; el consumo documentado es mediante el paquete Python `kokoro` (>= 0.9.2) |
| Frecuencia de muestreo de salida | 24 kHz (segun el ejemplo de uso de la model card) |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

La arquitectura es StyleTTS 2, un sistema TTS con difusión de estilo desarrollado por Li et al. (repositorio `yl4579/StyleTTS2`), combinado con el vocoder ISTFTNet. La versión distribuida es únicamente el decoder: no se publica el encoder ni el módulo de difusión, de modo que la inferencia se limita a texto -> fonemas -> audio. El front-end de conversión grafema-fonema (G2P) se apoya en la librería `misaki` y en `espeak-ng`, y trabaja con etiquetas de fonemas IPA.

El entrenamiento lo llevó a cabo `@rzvzn` sobre unos cientos de horas de audio exclusivamente permisivo o sin copyright: audio de dominio público, audio con licencias permisivas (Apache, MIT) y audio sintético generado por modelos TTS cerrados de grandes proveedores (no se usaron audios sintéticos de modelos TTS abiertos ni clones de voz personalizados). Del dataset forman parte, con atribución CC BY, Koniwa `tnc` (menos de 1 hora, CC BY 3.0) y SIWIS (menos de 11 horas, CC BY 4.0), incorporados a partir de la v0.19. El coste total declarado es de 1000 horas de A100 80 GB repartidas entre v0.19 (500 h, 400 USD) y v1.0 (500 h, 600 USD). No se documenta en la información disponible ninguna fase de RLHF o DPO, algo por otra parte poco habitual en TTS.

## Capacidades

- Sintesis de voz a partir de texto en ingles, con salida de audio a 24 kHz.
- Multiples voces: la version v1.0 del modelo original declara 54 voces en 8 idiomas, aunque este repositorio solo etiqueta ingles.
- Control de estilo y prosodia heredado de StyleTTS 2, limitado en esta distribucion al decoder publicado.
- Conversion grafema-fonema con etiquetas IPA mediante `misaki` y `espeak-ng`.
- Inferencia ligera: 82 M de parametros permiten ejecucion en CPU y en dispositivos de bajos recursos.
- No soporta tool calling ni function calling: es un modelo puramente TTS, no un LLM.
- No soporta agentes ni razonamiento multi-paso.
- No tiene vision, audio de entrada ni modo *thinking*.
- No se documenta soporte de streaming en la informacion disponible.
- No se documenta clonacion de voz zero-shot: al no publicarse el encoder, no es posible con estos pesos.

## Casos de uso

- Lectura de documentacion y articulos: convertir documentacion tecnica en ingles a audio para consumo pasivo, procesando el texto por parrafos y encadenando los fragmentos generados; el coste por caracter es lo bastante bajo como para hacerlo de forma masiva.
- Audiolibros y contenido longo: generar horas de audio a partir de capitulos de texto con un coste de referencia por debajo de 0,06 dolares por hora de audio, usando el paquete `kokoro` en un pipeline por lotes.
- Accesibilidad: integrar el modelo como lector de pantalla local para personas con discapacidad visual, sin depender de servicios en la nube y sin enviar el texto del usuario a terceros.
- Asistentes de voz embebidos: desplegar TTS en dispositivos tipo Raspberry Pi o routers con CPU, ya que 82 M de parametros y 0,4 GB de pesos caben en memoria sin GPU dedicada.
- E-learning y videos de formacion: generar narraciones en ingles para cursos, demos y prototipos de doblaje antes de contratar una locucion definitiva.
- Atencion al cliente e IVR: sintetizar respuestas dinamicas en sistemas de telefonia con latencia baja y coste marginal proximo a cero, al ejecutarse en la misma infraestructura que el backend.
- Pruebas de regresion en CI/CD: producir fixtures de audio deterministas para validar pipelines de ASR, diarizacion o analitica de voz sin depender de grabaciones humanas.
- Aumento de datos para ASR: generar corpus sinteticos en ingles con distintas voces para ampliar el conjunto de entrenamiento de un reconocedor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card enlaza un fichero `EVAL.md` con evaluaciones, pero los valores numericos no se han proporcionado en esta ficha, por lo que no se incluyen cifras que no puedan verificarse.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP32 ocupan aproximadamente 328 MB; en FP16, unos 164 MB. Con el overhead del runtime de PyTorch hay que reservar del orden de 1 a 2 GB, aunque son estimaciones derivadas del numero de parametros, no medidas publicadas.
- GPU recomendadas: cualquier GPU consumer moderna sirve; una RTX 3060 o superior deja el modelo sobradamente holgado. Las A100 y H100 son innecesarias para inferencia y solo tienen sentido para reentrenamiento.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 2 GB o mas de VRAM. Tambien es viable en CPU.
- Opciones de despliegue documentadas: paquete Python `kokoro` (>= 0.9.2), `soundfile` para escritura de WAV, `misaki` como G2P y `espeak-ng` como dependencia del sistema. Funciona en Google Colab sin configuracion adicional.
- Otras opciones: `llama.cpp`, Ollama, vLLM o TGI no aplican a un modelo TTS de esta arquitectura; no se documentan en la informacion disponible otros runtimes alternativos.
- Latencia y throughput: no disponibles como metricas publicadas. Como referencia indirecta, la model card situa el precio de mercado en API por debajo de 1 dolar por millon de caracteres (aproximadamente 1 minuto de audio por cada 1000 caracteres), lo que implica que la inferencia es mas rapida que el tiempo real en hardware de servidor.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Notas |
|---|---|---|---|---|
| Zapholis/Kokoro-82M (este repo) | 82 M | Ingles (etiqueta del repo) | Apache 2.0 | Republicacion no oficial; 0 descargas y 0 likes en el momento de la consulta |
| hexgrad/Kokoro-82M | 82 M | 8 idiomas y 54 voces (v1.0) | Apache 2.0 | Repositorio de referencia, con `EVAL.md`, `SAMPLES.md` y `VOICES.md` |
| yl4579/StyleTTS2-LJSpeech | No disponible en la informacion proporcionada | Ingles (LJSpeech) | No disponible en la informacion proporcionada | Modelo base arquitectonico del que deriva este repositorio |
| Coqui XTTS-v2 | Aproximadamente 467 M (cifra publica no verificada en esta ficha) | Multilingue | CPML, con restricciones de uso comercial | Referencia habitual en clonacion de voz; licencia no permisiva |
| Piper | Variable segun la voz | Multiples | MIT | Enfoque orientado a dispositivos de bajos recursos; sin calidad de estudio |

La ventaja competitiva de Kokoro en esta comparativa es la combinacion de tamano reducido (82 M) y licencia Apache 2.0, que permite uso comercial sin las restricciones de XTTS-v2. La desventaja es la ausencia de clonacion de voz zero-shot al no publicarse el encoder.

## Limitaciones y advertencias

- Repositorio no oficial: `Zapholis/Kokoro-82M` registra 0 descargas y 0 likes y esta etiquetado como finetune de `yl4579/StyleTTS2-LJSpeech`. No hay garantia de que los pesos coincidan con los del repositorio de referencia `hexgrad/Kokoro-82M`; conviene verificar el hash SHA256 (`496dba118d1a58f5f3db2efc88dbdc216e0483fc89fe6e47ee1f2c53f18ad1e4` para la v1.0 original) antes de usarlo en produccion.
- Cobertura linguistica: este repositorio solo declara ingles. El soporte de 8 idiomas pertenece a la version v1.0 del modelo original y no puede asumirse aqui.
- Sin clonacion de voz: la distribucion es decoder-only, sin encoder ni modulo de difusion publicados, por lo que no se puede hacer transferencia de estilo o clonacion zero-shot con estos pesos.
- Errores de pronunciacion: al depender de G2P (`misaki` + `espeak-ng`) para generar fonemas IPA, los nombres propios, siglas, acronimos y notacion cientifica son propensos a errores de pronunciacion que requieren diccionarios personalizados.
- Sesgos del dataset: el entrenamiento se hizo con audio permisivo y de dominio publico, con porciones relevantes de audio sintetico de modelos cerrados; esto puede sesgar acentos, prosodia y registro hacia las fuentes disponibles y reducir la naturalidad en registros poco representados.
- Licencia: Apache 2.0 permite uso comercial, pero el dataset incluye audio CC BY 3.0 (Koniwa `tnc`, menos de 1 hora) y CC BY 4.0 (SIWIS, menos de 11 horas), cuyas condiciones de atribucion deben respetarse si se redistribuye el modelo.
- Suplantacion de marca: la model card advierte de sitios web con "kokoro" en el dominio raiz (`kokorottsai_com`, `kokorotts_net`) que no estan afiliados al autor y probablemente son fraudulentos.
- Ausencia de metricas publicas verificables en esta ficha: no hay resultados de MMLU, MOS ni WER disponibles, por lo que cualquier evaluacion de calidad debe hacerse por cuenta propia antes de adoptar el modelo.
- Fechas del repositorio: los metadatos indican creacion y actualizacion el 27 de octubre de 2026, lo que conviene contrastar con la fecha real de publicacion del modelo original (v1.0, 27 de enero de 2025).

## Enlaces

- Repositorio en HuggingFace (este modelo): https://huggingface.co/Zapholis/Kokoro-82M
- Repositorio de referencia: https://huggingface.co/hexgrad/Kokoro-82M
- Modelo base: https://huggingface.co/yl4579/StyleTTS2-LJSpeech
- Repositorio GitHub: https://github.com/hexgrad/kokoro
- Demo en Spaces: https://hf.co/spaces/hexgrad/Kokoro-TTS
- Paper de StyleTTS 2: https://arxiv.org/abs/2306.07691
- Paper de ISTFTNet: https://arxiv.org/abs/2203.02395
- Repositorio de StyleTTS 2: https://github.com/yl4579/StyleTTS2
- Evaluaciones (EVAL.md): https://huggingface.co/hexgrad/Kokoro-82M/blob/main/EVAL.md
- Muestras de audio (SAMPLES.md): https://huggingface.co/hexgrad/Kokoro-82M/blob/main/SAMPLES.md
- Voces disponibles (VOICES.md): https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md
- Libreria G2P misaki: https://pypi.org/project/misaki/ y https://github.com/hexgrad/misaki
- Precios de referencia en API (Artificial Analysis): https://artificialanalysis.ai/text-to-speech/model-family/kokoro#price
- Precios de referencia en API (DeepInfra): https://deepinfra.com/hexgrad/Kokoro-82M
- Servidor de Discord: https://discord.gg/QuGxSWBfQy
