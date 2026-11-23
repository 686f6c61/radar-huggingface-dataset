# xIZO/Applio

## Resumen
Applio es una herramienta de conversion de voz (voice conversion, VC) centrada en la simplicidad, la calidad del audio y el rendimiento, publicada por el usuario xIZO en Hugging Face como empaquetado del proyecto original IAHispano/Applio. No es un modelo de lenguaje generativo, sino un pipeline `audio-to-audio` que transforma una grabacion de voz de origen en la voz de un hablante objetivo preservando el contenido linguistico y la prosodia. Tecnicamente se apoya en las arquitecturas RVC (Retrieval-based Voice Conversion) y VITS, heredadas del modelo base `lj1995/VoiceConversionWebUI`, y se distribuye con pesos en formato ONNX.

El repositorio tiene un tamano de 127.5 GB, lo que sugiere que incluye multiples checkpoints, indices de caracteristicas y artefactos auxiliares mas que un unico modelo. El entrenamiento declarado se realizo sobre el dataset publico `CSTR-Edinburgh/vctk`, un corpus multihablante de ingles con acentos britanicos, lo que condiciona el dominio de uso hacia el habla inglesa. La licencia es MIT, lo que facilita la integracion en productos comerciales siempre que se respeten los derechos de las voces utilizadas.

Su relevancia actual reside en que Applio ofrece una via practica y de codigo abierto para construir sistemas de clonacion y sustitucion de voz con interfaz Gradio, plugins y soporte para ejecucion en GPU de consumo o en Google Colab. Para desarrolladores e investigadores es un punto de partida reproducible para experimentos de conversion de voz, doblaje, doblaje sintetico y prototipado de asistentes hablados, aunque con las cautelas legales y eticas propias de la sintesis de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RVC (Retrieval-based Voice Conversion) sobre VITS para sintesis; pipeline audio-to-audio |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible (pesos exportados a ONNX; se desconoce si hay variantes cuantizadas) |
| Idiomas soportados | no disponible (el dataset de entrenamiento, VCTK, es en ingles) |
| Licencia | MIT |
| Formato de pesos | ONNX (tag `onnx`); el repositorio incluye otros artefactos del proyecto Applio |
| Tamano del repositorio | 127.5 GB |
| Modelo base | lj1995/VoiceConversionWebUI |
| Dataset de entrenamiento | CSTR-Edinburgh/vctk |
| Pipeline declarado | audio-to-audio |

## Arquitectura y entrenamiento
Applio no implementa un transformer de lenguaje, sino un sistema de conversion de voz. La cadena tipica combina un extractor de caracteristicas (embedding de contenido, habitualmente HuBERT o similar en la familia RVC), un modelo acustico basado en VITS para generar el audio objetivo y un mecanismo de recuperacion de caracteristicas (retrieval) que sustituye vectores del hablante origen por los del hablante objetivo para preservar el timbre. El resultado se sintetiza con un vocoder neural. Los pesos publicados en este repositorio se exportan en formato ONNX, lo que permite inferencia portable fuera del ecosistema PyTorch.

El entrenamiento declarado se realizo sobre VCTK, un corpus de aproximadamente 110 hablantes de ingles con distintos acentos britanicos. No se especifican en la informacion disponible el numero de horas, la composicion exacta del dataset, ni si se aplicaron tecnicas de ajuste fino, RLHF o aumentacion de datos. Tampoco se documentan innovaciones como decodificacion especulativa, atencion lineal o modos de pensamiento, ya que no aplican a este tipo de modelo. La innovacion practica del proyecto es el empaquetado: interfaz Gradio, scripts de instalacion multiplataforma, soporte de TensorBoard, plugins y ejecucion en Colab.

## Capacidades
- Conversion de voz many-to-many: transforma una locucion de un hablante origen en la voz de un hablante objetivo manteniendo el contenido y la prosodia.
- Preservacion de prosodia y entonacion: al operar sobre representaciones de contenido, conserva el ritmo y la curva melodica del audio de entrada.
- Inferencia en formato ONNX: permite desplegar el modelo fuera de PyTorch, en entornos con runtime ONNX.
- Interfaz Gradio integrada para experimentacion interactiva y grabacion desde el navegador.
- Soporte de plugins para ampliar funcionalidades del pipeline.
- Monitorizacion de entrenamiento y visualizacion con TensorBoard.
- Ejecucion en Google Colab, tanto con interfaz como en modo sin UI.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso, al no ser un modelo de lenguaje.
- No se documentan capacidades multilingues mas alla del ingles de VCTK.

## Casos de uso
- Doblaje y localizacion de contenido audiovisual: se puede sustituir la voz original de un actor por una voz objetivo manteniendo la sincronizacion y la prosodia, util para prototipos de doblaje antes de contratar voces definitivas.
- Prototipado de asistentes de voz: permite generar muestras con un timbre de marca concreto a partir de grabaciones de referencia, acelerando la validacion de UX antes de invertir en sintesis comercial.
- Investigacion en conversion de voz: sirve como linea base reproducible sobre VCTK para comparar tecnicas de retrieval, vocoders o embeddings de contenido en experimentos academicos.
- Creacion de contenido para podcast y audiolibros: posibilita unificar el timbre de distintas tomas o narradores en una sola voz consistente para maquetas y versiones preliminares.
- Anonimizacion de voz en datasets: al convertir la voz de un hablante a un timbre distinto se reduce la identificabilidad del sujeto en corpus de audio compartidos, siempre con supervision etica y legal.
- Educacion y accesibilidad: generar voces personalizadas para materiales formativos o para usuarios que necesitan una voz sintetica coherente en sus herramientas de lectura.
- Pruebas de regresion en pipelines de audio: al ser un modelo pequeno y exportable a ONNX, se puede integrar en tests automatizados que verifiquen la calidad de la conversion ante cambios de codigo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas como MCD, MOS, WER sobre audio convertido ni comparaciones cuantitativas con otros sistemas de conversion de voz.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial. Por la naturaleza de RVC/VITS, la inferencia suele requerir entre 2 y 6 GB de VRAM en funcion del checkpoint y del tamano de los indices de retrieval.
- GPU recomendadas: no especificadas por el autor. En la practica, una RTX 3060 de 12 GB o superior es suficiente para inferencia; para entrenamiento se recomienda RTX 4090, A100 o H100.
- Compatibilidad con GPU de consumo: si, el proyecto esta disenado para ejecutarse en equipos de escritorio con GPU consumer; tambien puede correr en CPU con latencia mucho mayor.
- Opciones de despliegue: interfaz Gradio incluida, scripts `run-applio` para Windows y Linux/macOS, Google Colab con y sin UI, y runtime ONNX para integracion en servicios propios.
- Latencia y throughput: no disponibles. Dependen del hardware, de la duracion del audio y del checkpoint seleccionado; en GPU moderna la conversion suele ser mas rapida que tiempo real para clips cortos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Applio (xIZO) | Voice conversion RVC/VITS, ONNX | no disponible | no aplica | MIT | Hugging Face, repo de 127.5 GB |
| RVC WebUI (lj1995) | Voice conversion RVC | no disponible | no aplica | MIT (proyecto original) | GitHub, Hugging Face |
| VITS (jaywalnut310) | Sintesis TTS end-to-end | no disponible | no aplica | MIT | GitHub |
| OpenVoice (MyShell) | Clonacion de voz zero-shot | no disponible | no aplica | MIT | GitHub, Hugging Face |

La comparativa se limita a la categoria de conversion y sintesis de voz. No se dispone de datos de rendimiento comparables entre estos sistemas en la informacion proporcionada, por lo que la eleccion entre ellos debe basarse en la calidad subjetiva, el soporte de idiomas y el ecosistema de despliegue mas que en metricas publicadas.

## Limitaciones y advertencias
- Sesgos de dominio: entrenado sobre VCTK, un corpus de ingles britanico con hablantes limitados; el rendimiento fuera de ese dominio (otros idiomas, acentos o condiciones acusticas) puede degradarse.
- Riesgo de uso malintencionado: la conversion de voz permite suplantacion de identidad y deepfakes de audio; el autor exige respetar derechos de autor, propiedad intelectual y privacidad, y la responsabilidad recae en el usuario.
- Restricciones legales: aunque la licencia es MIT, el uso comercial requiere cumplir la legislacion aplicable sobre sintesis de voz, consentimiento del hablante y derechos de imagen y voz.
- Calidad dependiente de la grabacion: la calidad de la conversion depende de la limpieza del audio de entrada y de la calidad del checkpoint objetivo; audios ruidosos o con musica producen artefactos.
- Sin garantias de robustez en produccion: no se documentan pruebas de estres, limites de longitud de audio ni comportamiento ante entradas adversarias.
- Repositorio de gran tamano: 127.5 GB dificultan la descarga y el versionado; conviene seleccionar solo los artefactos necesarios.
- Sin metricas publicadas: la ausencia de benchmarks impide comparar objetivamente con alternativas y exige evaluacion propia antes de adoptarlo.
- Idiomas: no se declaran idiomas soportados; el uso en castellano no esta validado por el autor.

## Enlaces
- Hugging Face: https://huggingface.co/xIZO/Applio
- Modelo base: https://huggingface.co/lj1995/VoiceConversionWebUI
- Dataset VCTK: https://huggingface.co/datasets/CSTR-Edinburgh/vctk
- Web oficial: https://applio.org
- Documentacion: https://docs.applio.org
- Discord: https://discord.gg/urxFjYmYYh
- Plugins: https://github.com/IAHispano/Applio-Plugins
- Repositorio original: https://github.com/IAHispano/Applio
- Compiled: https://huggingface.co/IAHispano/Applio/tree/main/Compiled
- Playground: https://applio.org/playground
- Google Colab (UI): https://colab.research.google.com/github/iahispano/applio/blob/master/assets/Applio.ipynb
- Google Colab (sin UI): https://colab.research.google.com/github/iahispano/applio/blob/master/assets/Applio_NoUI.ipynb
- rvc-cli: https://github.com/blaisewf/rvc-cli
- gradio-screen-recorder: https://huggingface.co/spaces/gstaff/gradio-screen-recorder
