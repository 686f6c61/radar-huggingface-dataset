# SupraLabs/SupraTTS-0.1-Beta

## Resumen

SupraTTS-0.1-Beta es un modelo de sintesis de voz (text-to-speech) en ingles, de un unico hablante, desarrollado por SupraLabs. Se trata de una implementacion de Glow-TTS entrenada desde cero sobre el corpus LJSpeech dentro del framework Coqui-TTS, acompanada de un vocoder HiFi-GAN v1. El modelo es el sucesor directo de Flare-TTS-v1.5, del que reutiliza encoder, decoder y dataset, con el objetivo declarado de mejorar la calidad perceptual del audio generado.

Tecnicamente es compacto: unos 29,6 millones de parametros en el modelo acustico y alrededor de 14 millones en el vocoder HiFi-GAN v1, lo que da un total cercano a 44 millones de parametros. A 22050 Hz con 80 bandas mel, esta disenado para inferencia ligera en hardware de consumo. El autor reporta mejoras concretas respecto a v1.5: correccion de un bug en el scheduler de learning rate (que impedia alcanzar el LR objetivo), uso de tokens en blanco entre tokens de entrada, un predictor de duracion estocastico tomado de VITS y un kernel Triton para la busqueda de alineamiento monotono (Super-MAS).

Su relevancia actual esta en el nicho de TTS pequenos y desplegables en local: con licencia MIT, un peso en disco de aproximadamente 1,4 GB para el repositorio completo y requisitos de VRAM muy bajos, es una opcion viable para prototipado rapido, lectura de texto a voz en dispositivos modestos y pipelines donde no se quiere depender de APIs en la nube. La contrapartida es su alcance deliberadamente limitado: solo ingles, una sola voz y sin capacidades de clonacion zero-shot ni etiquetas de estilo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (modelo acustico basado en flujos normalizadores, 12 bloques de flujo, 192 canales ocultos, encoder transformer de 6 capas con posiciones relativas) + predictor de duracion estocastico (VITS) + vocoder HiFi-GAN v1 |
| Parametros totales | ~29,6M (modelo acustico) + ~14M (vocoder HiFi-GAN v1); ~44M en total |
| Longitud de contexto | no disponible (no aplica como ventana fija: la entrada es texto y la longitud practica la limitan la memoria y la degradacion de calidad, no un limite documentado) |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas; los pesos se distribuyen en punto flotante) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (.pth: model.pth y vocoder.pth); no se distribuye en safetensors ni GGUF |
| Frecuencia de muestreo | 22050 Hz, 80 bandas mel |
| Vocoder | HiFi-GAN v1 entrenado desde cero sobre mels de referencia (ground-truth mels) |
| Dataset de entrenamiento | LJSpeech-1.1 (voz femenina unica en ingles, ~24 h) |
| Autor | SupraLabs |
| Tamano del repositorio | ~1,4 GB |

## Arquitectura y entrenamiento

El modelo acustico sigue la arquitectura Glow-TTS: un encoder transformer de 6 capas con embeddings posicionales relativos que produce representaciones condicionadas por texto, seguido de 12 bloques de flujo normalizador que modelan la distribucion del mel espectrograma. Sobre esa base se han introducido varios cambios respecto al predecesor. En primer lugar, se insertan tokens en blanco entre los tokens de entrada. En segundo lugar, el predictor de duracion determinista original se sustituye por el predictor de duracion estocastico de VITS, de modo que la temporizacion no es identica en cada generacion. Ademas, el entrenamiento se realiza en bf16 y se emplea un kernel Triton para la busqueda de alineamiento monotono (Super-MAS, de Supertone), que acelera el calculo del alineamiento entre texto y frames. La correccion mas relevante fue la del scheduler de learning rate, que en v1.5 avanzaba por epoca en lugar de por paso, impidiendo que el modelo alcanzase su tasa de aprendizaje objetivo.

Los datos de entrenamiento provienen exclusivamente de LJSpeech-1.1, un corpus de aproximadamente 24 horas de una unica hablante femenina en ingles. El modelo acustico se entreno durante unas 39.000 iteraciones (145 epocas) con batch size 48 y precision bf16, mientras que el vocoder se entreno durante unas 103.000 iteraciones con batch size 16 y precision fp16. Todo el entrenamiento se realizo en una unica RTX 5060 Ti de 16 GB de VRAM, con un coste de aproximadamente 25 horas para el modelo acustico y 35 horas para el vocoder. El autor probo tambien afinar HiFi-GAN sobre los mels generados por el propio modelo (GTA), pero el resultado empeoro (UTMOS 3.34 y tono mas ruidoso), por lo que la version publicada usa exclusivamente el vocoder entrenado sobre mels de referencia.

## Capacidades

- Sintesis de voz en ingles a partir de texto, con una unica voz femenina (la de LJSpeech).
- Generacion de audio a 22050 Hz con 80 bandas mel mediante el vocoder HiFi-GAN v1.
- Temporizacion variable entre generaciones gracias al predictor de duracion estocastico.
- Manejo razonable de numeros largos y palabras complejas: el autor incluye un ejemplo con cifras como 3.456.789 y terminos como "quintessential" o "astrophysicists".
- Procesamiento de textos largos: se incluye una muestra con un fragmento extenso de Wikipedia adaptado.
- No dispone de tool calling ni function calling: es un modelo puramente text-to-speech.
- No tiene soporte de agentes ni razonamiento multi-paso.
- No soporta vision ni audio de entrada: unicamente texto como entrada.
- No ofrece clonacion zero-shot, ni multiples hablantes, ni etiquetas de estilo en linea (el autor las lista como trabajo futuro).

## Casos de uso

- Lectura de articulos y documentos en ingles: el modelo puede convertir texto largo en audio, como demuestra la muestra incluida con un fragmento extenso de Wikipedia, y su bajo consumo de recursos permite integrarlo en herramientas de lectura sin depender de la nube.
- Accesibilidad para personas con discapacidad visual: al ser un modelo MIT de ~44M de parametros, se puede empaquetar dentro de una aplicacion de escritorio o movil que lea en voz alta contenido en ingles sin conexion.
- Generacion de voces en off para prototipos y demos: util para crear narraciones temporales en videos de producto, presentaciones o maquetas, dado que el modelo es ligero y el formato .pth se carga directamente en PyTorch.
- Sistemas de respuesta de voz en aplicaciones de automatizacion: para interfaces conversacionales basicas en ingles donde solo se necesita sintesis de una voz fija, sin requisitos de clonacion ni multilingue.
- Investigacion y docencia en sintesis de voz: sirve como referencia reproducible de Glow-TTS con vocoder HiFi-GAN entrenado desde cero, con configs publicas (config.json, vocoder_config.json) e instrucciones de inferencia detalladas.
- Pipelines de generacion de audio por lotes: al ser un modelo pequeno y rapido, se puede usar para convertir grandes volumenes de texto a audio en servidores modestos o incluso en CPU.
- Pruebas comparativas de vocoders: el autor documenta el experimento fallido de afinar HiFi-GAN sobre mels GTA, lo que lo convierte en un punto de partida util para estudiar el efecto del vocoder en la calidad final.
- Desarrollo de asistentes locales con requisitos de privacidad: al ejecutarse en hardware de consumo y no requerir servicios externos, encaja en entornos donde el texto no debe salir de la maquina.

## Benchmarks y rendimiento

Evaluado sobre 10 frases fuera de dominio y 10 frases reservadas de LJSpeech, con 5 semillas por frase. UTMOS es una estimacion automatica de MOS (1-5, mayor es mejor). F0-Std es la variacion de tono dentro de una frase, en semitonos. El WER es la tasa de error de palabras de Whisper, usada aqui como comprobacion de mala pronunciacion.

| Sistema | UTMOS (mayor es mejor) | F0-Std [st] | WER % (menor es mejor) | Tempo vs. referencia |
|---|---|---|---|---|
| Ground truth (grabaciones reales) | 4,34 ± 0,08 | 3,51 | 2,58 | 1,000 |
| Flare-TTS-v1.5 | 3,05 ± 0,08 | 1,87 | 3,72 | 1,087 |
| SupraTTS-0.1-Beta (este modelo) | 3,59 ± 0,07 | 1,01 | 3,64 | 1,004 |

Respecto a Flare-TTS-v1.5, el UTMOS sube 0,53 puntos, el tempo se normaliza de 1,087x a 1,004x y el WER mejora ligeramente. La F0-Std, en cambio, cae de 1,87 a 1,01 semitonos, por debajo de la variacion de las grabaciones reales (3,51): el autor reconoce que el tono es estable pero mas plano que el de una hablante real, y lo senala como el proximo aspecto a corregir. No se han publicado otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con ~44M de parametros en total, el peso en memoria es de decenas o pocos cientos de MB segun precision; no se proporciona una cifra oficial de VRAM en la model card.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente. El autor entreno ambos modelos en una unica RTX 5060 Ti de 16 GB de VRAM, y la inferencia requiere mucho menos que el entrenamiento.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU de consumo moderna con CUDA. Tambien es viable en CPU, dado el reducido numero de parametros.
- Opciones de despliegue: el flujo documentado usa Python 3.10+, PyTorch con CUDA y Coqui-TTS (`pip install coqui-tts`), descargando infer_v2.py, flare_glowtts.py, config.json, vocoder_config.json, model.pth y vocoder.pth. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS de este tipo.
- Latencia y throughput estimados: no disponible. El autor no publica cifras de latencia ni de RTF (real-time factor) para inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Voces | Licencia | UTMOS (segun model card) | Disponibilidad |
|---|---|---|---|---|---|---|
| SupraTTS-0.1-Beta | ~29,6M (acustico) + ~14M (vocoder) | Ingles | 1 | MIT | 3,59 ± 0,07 | HuggingFace, PyTorch (.pth) |
| Flare-TTS-v1.5 | No disponible (mismo orden de magnitud, segun el autor "almost the same size") | Ingles | 1 | No disponible en la informacion proporcionada | 3,05 ± 0,08 | HuggingFace |
| Ground truth (LJSpeech) | No aplica | Ingles | 1 | No aplica | 4,34 ± 0,08 | No aplica |

El unico comparable con datos directos en la informacion disponible es Flare-TTS-v1.5, del que SupraTTS-0.1-Beta es sucesor y con el que comparte encoder, decoder y dataset. Para otras alternativas de la misma categoria (por ejemplo, otros modelos Glow-TTS o VITS entrenados sobre LJSpeech), no se dispone de datos comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ingles: no soporta otros idiomas, por lo que cualquier texto en castellano u otra lengua producira una pronunciacion incorrecta o poco natural.
- Un unico hablante: la voz es fija (la hablante femenina de LJSpeech). No hay seleccion de voz ni clonacion zero-shot.
- Proso dia plana: la F0-Std medida (1,01 semitonos) esta muy por debajo de la de las grabaciones reales (3,51), lo que indica un tono mas monotono de lo deseable. El propio autor lo reconoce como el principal defecto pendiente.
- Riesgo de mala pronunciacion en palabras poco frecuentes o cadenas de numeros muy largas, aunque el WER medido (3,64 %) es similar al de v1.5 y cercano al de la referencia (2,58 %).
- Modelo en fase beta (0.1-Beta): la nomenclatura y el estado del repositorio indican que puede cambiar sin aviso.
- Sesgo de dominio: entrenado exclusivamente sobre LJSpeech (24 h de una sola hablante), por lo que puede generalizar mal a estilos, acentos o registros alejados de ese corpus.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificacion y redistribucion con atribucion. No se documentan restricciones adicionales.
- Formato de pesos no estandar para ecosistemas de inferencia ligeros: al distribuirse como .pth de PyTorch y no en safetensors ni GGUF, no es directamente compatible con runtimes como llama.cpp u Ollama.
- Advertencia etica habitual en TTS: al ser una voz sintetica, conviene evitar usos que suplante a personas reales o difunda audio enganoso.
- Volumen de adopcion bajo: 69 descargas y 13 likes en el momento de la consulta, lo que implica poca validacion comunitaria independiente de los resultados reportados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SupraLabs/SupraTTS-0.1-Beta
- Modelo predecesor, Flare-TTS-v1.5: https://huggingface.co/LH-Tech-AI/Flare-TTS-v1.5
- Paper de Glow-TTS (Kim et al.): https://arxiv.org/abs/2005.11129
- Paper de VITS (Kim et al.): https://arxiv.org/abs/2106.06103
- Paper de HiFi-GAN (Kong et al.): https://arxiv.org/abs/2010.05646
- Repositorio Super-Monotonic-Align (Supertone): https://github.com/supertone-oss-archive/super-monotonic-align
- Coqui-TTS (mantenido por Idiap): https://github.com/idiap/coqui-ai-TTS
- Dataset LJSpeech: https://keithito.com/LJ-Speech-Dataset/
