# thuongvv/ZeroTTS-GGUF

## Resumen

ZeroTTS-GGUF es el empaquetado en formato GGUF de los pesos de ZeroTTS, un sistema de sintesis de voz (TTS) zero-shot especializado en vietnamita y desarrollado por zeroweight-ai. El repositorio analizado, publicado por el usuario thuongvv, no introduce un modelo nuevo: reempaqueta los mismos pesos del repositorio original para ejecutarlos sobre el runtime ggml en lugar de onnxruntime. Segun la model card, el fichero `f32` produce codigos de trama identicos bit a bit a las grafias ONNX para el mismo texto, la misma voz y las mismas semillas aleatorias.

El modelo tiene 202.319.360 parametros (unos 202 millones) y esta disenado para clonacion de voz zero-shot: la identidad de una voz se representa como un array latente de 10x768 en float32, por lo que basta con entre 3 y 30 segundos de audio de referencia para sintetizar en esa voz, sin ajuste fino ni entrenamiento por hablante. La arquitectura interna se describe funcionalmente como un encoder de texto mas un decoder global y un decoder de profundidad que generan codigos de trama, con un decodificador de audio (tokenizador MOSS) que se mantiene en ONNX y no esta en la ruta critica por trama.

Su relevancia practica es doble. Por un lado, el autor declara una tasa de error de palabras muy baja en vietnamita (0,16 % de WER en el subconjunto monolingue de ZeroBench-TTS) y una naturalidad de 2,91 UTMOS, con solo 0,029 s de silencio excesivo. Por otro, el empaquetado GGUF reduce el tamano de descarga aproximadamente 4 veces frente a los pesos sin cuantizar (206 MB en q8_0 frente a 772 MB en f32) y permite inferencia en tiempo real sobre CPU e incluso en el navegador mediante WebAssembly, con un RTF de 0,5x y un primer fragmento de audio en torno a 70 ms.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible con detalle; descrita funcionalmente como encoder de texto + decoder global + decoder de profundidad que generan codigos de trama, con decodificador de audio MOSS en ONNX |
| Parametros totales | 202.319.360 (dato real de safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no aplica en el sentido de contexto de texto; la reference de voz admite de 3 a 30 s de audio) |
| Tipos de cuantizacion | q4_0 (124 MB), q8_0 (206 MB, opcion por defecto) y f32 sin cuantizar (772 MB) |
| Idiomas soportados | Vietnamita (vi); soporta cambio de codigo vietnamita-ingles y prompt de voz cross-lingual (referencia en vietnamita, salida en ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (ggml) para el modelo principal; el decodificador del codec de audio se distribuye en ONNX (Apache-2.0, ~45 MB) |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la topologia exacta del modelo (no se especifica si es un transformer puro, un modelo autorregresivo de tramas o un hibrido). La model card si describe el pipeline: un encoder de texto, un decoder global y un decoder de profundidad que producen codigos de trama, que despues se convierten en audio mediante el decodificador del tokenizador MOSS, distribuido aparte en ONNX. La voz se modela como un latente de 10x768 en float32 almacenado en el directorio `voices/`, y el repositorio incluye ficheros auxiliares de runtime (`tokenizer.json`, `config.json`, `null_voice_emb.npy`, `silence_frame.npy`) identicos a los del repositorio ONNX original.

No se han proporcionado datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de ajuste. Tampoco se detallan innovaciones como decodificacion especulativa o atencion lineal. La innovacion relevante que si aparece documentada es de empaquetado y eficiencia: la conversion a GGUF para el runtime ggml, la verificacion de equivalencia bit a bit respecto a ONNX, y la capacidad de ejecucion en WebAssembly. El autor declara que el modelo lee expresiones como `31/12/2025` o `ZeroTTS` sin normalizador de texto.

## Capacidades

- Sintesis de voz zero-shot en vietnamita, con calidad declarada de 2,91 UTMOS y 0,029 s de silencio excesivo.
- Clonacion de voz sin ajuste fino a partir de entre 3 y 30 segundos de audio de referencia.
- Similitud de hablante de 0,936 (coseno con WavLM-SV) segun la model card.
- Generacion en streaming: primer fragmento de audio en aproximadamente 70 ms.
- Inferencia en tiempo real sobre CPU, con RTF de 0,5x (unas 2 veces mas rapido que el tiempo real).
- Manejo de cambio de codigo vietnamita-ingles dentro de una misma locucion.
- Prompt de voz cross-lingual: referencia en vietnamita con salida en ingles.
- Lectura de acronimos, fechas y cifras sin normalizador de texto previo.
- Ejecucion en navegador mediante WebAssembly sobre el runtime ggml.
- No se documenta soporte de tool calling, function calling ni comportamiento de agente; es un modelo de sintesis de voz, no un modelo de lenguaje conversacional.

## Casos de uso

- Audiolibros y narracion de formato largo en vietnamita: el modelo mantiene una naturalidad alta (2,91 UTMOS) y un silencio excesivo minimo (0,029 s), lo que evita pausas artificiales en lecturas extensas; la model card incluye muestras de narracion larga y de conversacion a dos voces.
- Atencion al cliente telefónica en vietnamita: la generacion en streaming con primer fragmento a ~70 ms y un RTF de 0,5x permite respuestas de voz fluidas en canales interactivos sin depender de GPU.
- Clonacion de voces corporativas o de locutores: con 3 a 30 segundos de audio de referencia y un latente de 10x768 por voz, se puede desplegar un catalogo de voces de marca sin reentrenar el modelo.
- Contenido informativo con terminologia tecnica: el sistema lee acronimos, fechas y cifras (`31/12/2025`) sin normalizador, lo que simplifica el preprocesado en pipelines de noticias y boletines.
- Localizacion de contenido con mezcla de idiomas: el cambio de codigo vietnamita-ingles cubre guiones que intercalan terminos en ingles, frecuentes en contenido tecnologico y financiero.
- Dobaje cross-lingual: usando una referencia de voz en vietnamita y solicitando salida en ingles, se puede reutilizar la identidad vocal de un locutor en otro idioma (WER declarado de 1,42 % en este escenario).
- Asistentes de voz embebidos y aplicaciones de escritorio: al caber en 206 MB (q8_0) o 124 MB (q4_0), el modelo se integra en binarios ligeros o en aplicaciones que no pueden asumir dependencias de ONNX.
- Demos y herramientas web en el navegador: el formato GGUF con soporte WebAssembly permite sintesis de voz local en el cliente, sin enviar audio a un servidor.
- Accesibilidad y lectura de pantalla: la latencia baja y el funcionamiento en CPU habilitan lectores de texto a voz en tiempo real en equipos sin GPU.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (todos con `verified: false`), sobre el conjunto ZeroBench-TTS (split test):

| Tarea / configuracion | Metrica | Valor |
|---|---|---|
| Zero-shot TTS (general) | WER (%) — texto sin normalizar | 1,03 |
| Zero-shot TTS (general) | UTMOSv2 (MOS de naturalidad) | 2,91 |
| Zero-shot TTS (general) | Similitud de hablante (coseno WavLM-SV) | 0,936 |
| Zero-shot TTS (general) | Silencio excesivo (s) | 0,029 |
| Monolingue vietnamita | WER (%) | 0,16 |
| Cambio de codigo vietnamita/ingles | WER (%) | 0,97 |
| Prompt de voz cross-lingual | WER (%) | 1,42 |
| Acronimos, fechas y cifras | WER (%) | 1,75 |

Rendimiento de ejecucion declarado (Chrome sobre portatil Apple Silicon de 14 nucleos, locucion de 3,2 s, solo generacion de tramas): RTF de 0,5x, primer fragmento en aproximadamente 70 ms y una deriva de codigos muestreados respecto a f32 que la model card describe pero cuyo valor numerico no se incluye en la informacion disponible. La model card tambien afirma que el modelo tiene "4 veces menos errores de palabra que el siguiente mejor modelo" abierto en vietnamita, sin nombrar ni cuantificar el comparador. No se han proporcionado resultados comparativos adicionales (MMLU, HumanEval, GSM8K u otros) porque no aplican a un sistema TTS.

## Requisitos de hardware

- VRAM/RAM estimada: no se requiere GPU; en CPU basta con el fichero GGUF elegido (124 MB en q4_0, 206 MB en q8_0, 772 MB en f32) mas el decodificador ONNX del codec (~45 MB) y los ficheros auxiliares, con el overhead habitual del runtime.
- GPU recomendadas: no disponibles; el diseno esta orientado a CPU. Cualquier GPU moderna con soporte ggml/ONNX puede acelerar la inferencia, pero no se documentan requisitos ni configuraciones concretas.
- Compatibilidad con GPU de consumo: si, cabe con enorme holgura en cualquier GPU de consumo (por ejemplo, RTX 3060, RTX 4090), aunque el caso de uso declarado es CPU.
- Despliegue: runtime ggml, con etiquetado explicito para llama.cpp/llama-cpp y soporte de WebAssembly para navegador, a traves del directorio `cpp/` del repositorio de GitHub. La alternativa es onnxruntime o el paquete pip `zerotts` usando el repositorio original `zeroweight-ai/ZeroTTS`.
- Latencia y throughput: RTF 0,5x (aproximadamente 2 veces mas rapido que el tiempo real) y primer fragmento de audio en torno a 70 ms, medidos en Chrome sobre un portatil Apple Silicon de 14 nucleos con una locucion de 3,2 s.
- Ficheros necesarios: un unico fichero `.gguf`, mas `onnx/codec/`, `voices/` y los ficheros auxiliares de runtime.

## Comparativa con modelos similares

No se dispone de datos comparativos verificables en la informacion proporcionada. La model card afirma que ZeroTTS es el sistema TTS abierto en vietnamita mas preciso que conocen sus autores, con 4 veces menos errores de palabra que el siguiente mejor modelo, pero no identifica ese modelo ni aporta cifras de la comparacion.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZeroTTS (GGUF) | 202.319.360 | No aplica | WER 0,16 % en vietnamita; 2,91 UTMOS; 0,936 de similitud de hablante | MIT | GGUF en este repositorio, ONNX en el repositorio original |
| Alternativas de TTS abierto en vietnamita | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Los resultados de benchmarks proceden del autor y estan marcados como no verificados (`verified: false`); conviene reproducirlos antes de tomar decisiones de produccion.
- El WER declarado en monolingue vietnamita (0,16 %) es extraordinariamente bajo y no se acompana de la metodologia completa en la informacion disponible, por lo que debe tratarse con cautela.
- El soporte linguistico se limita al vietnamita, con cambio de codigo a ingles y prompts cross-lingual; no hay indicios de cobertura multilingue amplia.
- El modelo esta disenado para sintesis y clonacion de voz, no para razonamiento, codigo ni generacion de texto; no se documentan capacidades de tool calling ni de agente.
- La clonacion de voz zero-shot con 3 a 30 segundos de audio plantea riesgos claros de suplantacion de identidad y de uso indebido de la voz de terceros; es necesario contar con consentimiento explicito y contemplar marcas de agua o deteccion de audio sintetico.
- Aunque la licencia es MIT, el decodificador del codec de audio se distribuye en ONNX bajo Apache-2.0; hay que respetar ambas licencias en el despliegue.
- El repositorio analizado tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia, por lo que no existe validacion de la comunidad sobre este empaquetado concreto; el respaldo real proviene del repositorio original `zeroweight-ai/ZeroTTS`.
- Al ser un reempaquetado, cualquier divergencia respecto a los pesos ONNX deberia comprobarse; el autor afirma equivalencia bit a bit solo para el fichero `f32`.
- No se documentan sesgos por acento, dialecto, genero o edad de las voces de referencia, ni como afectan a la similitud de hablante.
- No se especifican requisitos de memoria ni latencia en plataformas distintas del portatil Apple Silicon usado en las mediciones (por ejemplo, moviles, navegadores de gama baja o servidores x86).

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/thuongvv/ZeroTTS-GGUF
- Repositorio original del modelo (ONNX): https://huggingface.co/zeroweight-ai/ZeroTTS
- Codigo, ejemplos y demo en navegador: https://github.com/zeroweight-ai/ZeroTTS
- Runtime C++/WASM: https://github.com/zeroweight-ai/ZeroTTS/tree/main/cpp
- Dataset de benchmarks ZeroBench-TTS: https://huggingface.co/datasets/zeroweight-ai/ZeroBench-TTS
- Blog del autor: https://zeroweight.ai/blog/zero-tts
- Referencia arXiv indicada en las etiquetas del modelo: arxiv:2602.10934
- Runtime ggml: https://github.com/ggml-org/ggml
- Nota: la busqueda web realizada no ha devuelto resultados relevantes sobre este modelo; los enlaces encontrados correspondian a entidades bancarias sin relacion con el proyecto.
