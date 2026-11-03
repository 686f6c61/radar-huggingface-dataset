# TimHdm/slovami-ai-models

## Resumen

Slovami AI models es un repositorio de redistribucion de pesos de terceros para la aplicacion Slovami AI, una app Android de reconocimiento automatico del habla (ASR) y diarizacion de hablantes que funciona de forma totalmente offline en el dispositivo. No se trata de un modelo entrenado por el autor del repositorio, sino de un conjunto de artefactos ya existentes empaquetados en formato ONNX para su ejecucion local: GigaAM-v3 para ruso, Whisper para ingles, embeddings de hablante CAM++ y ERes2Net, embeddings de palabra Navec y NER de Slovnet.

El repositorio resuelve un problema de distribucion mas que de investigacion: proporciona un punto de descarga publico, con manifiesto de tamanos y checksums SHA-256, desde el que la aplicacion obtiene los ficheros y ejecuta la inferencia en el telefono. El tamano total del repo es de 0,7 GB y la licencia declarada es Apache-2.0, aunque cada modelo conserva su licencia original (MIT para GigaAM, Whisper, Navec y Slovnet; Apache-2.0 para los modelos de 3D-Speaker).

Es relevante para desarrolladores que necesiten una pipeline de transcripcion y diarizacion multilingue (ruso e ingles) sin conexion, sin enviar audio a servidores externos y con modelos ligeros lo bastante pequenos como para caber en un dispositivo movil. No hay informacion publica sobre arquitecturas concretas, numero de parametros ni contexto, mas alla de los proyectos originales de los que proceden los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (pesos de terceros: GigaAM-v3, Whisper, CAM++, ERes2Net, Navec, Slovnet) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los ficheros se distribuyen en ONNX con los bytes originales) |
| Idiomas soportados | ru, en |
| Licencia | apache-2.0 (repo); componentes individuales: MIT y Apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo. Agrupa artefactos de cinco proyectos distintos: GigaAM-v3 (ASR para ruso, de Salute Developers), Whisper (ASR para ingles, de OpenAI), CAM++ y ERes2Net (embeddings de hablante para diarizacion, de ModelScope 3D-Speaker), Navec (embeddings de palabra para ruso, del proyecto Natasha) y Slovnet (NER para ruso, tambien de Natasha). Todos ellos se exportan o se conservan en formato ONNX para inferencia en dispositivo.

No se dispone de informacion sobre volumen de datos de entrenamiento, composicion del corpus, tecnicas de alineacion (RLHF/DPO) ni innovaciones de decodificacion en esta ficha, porque el autor no las documenta y remite a los proyectos originales. La unica informacion tecnica verificable es que los ficheros mantienen los bytes originales y que el manifiesto incluye tamanos y checksums SHA-256 para verificar la integridad de la descarga. El modelo opcional QVikhr no esta incluido en el repositorio.

## Capacidades

- Reconocimiento automatico del habla en ruso mediante GigaAM-v3.
- Reconocimiento automatico del habla en ingles mediante Whisper.
- Diarizacion de hablantes (separacion de quien habla en cada momento) mediante embeddings CAM++ y ERes2Net.
- Extraccion de embeddings de palabra en ruso con Navec, util para representaciones lexicas y comparaciones semanticas.
- Reconocimiento de entidades nombradas (NER) en ruso con Slovnet.
- Ejecucion completamente offline en Android, sin llamadas a servicios externos.
- Inferencia en dispositivo mediante runtime ONNX.
- No se documenta soporte de tool calling, agentes, vision ni audio mas alla del propio ASR.
- No se documenta modo de razonamiento (thinking) ni capacidades multimodales adicionales.

## Casos de uso

- Transcripcion de reuniones offline en Android: la app descarga GigaAM-v3 o Whisper desde este repo y transcribe el audio en el propio telefono, sin subir grabaciones a la nube, lo que simplifica el cumplimiento de privacidad.
- Actas de reunion con atribucion de hablante: combinando el ASR con los embeddings CAM++/ERes2Net se puede etiquetar cada intervencion con su hablante, util para notas de reunion y entrevistas.
- Subtitulado local de contenido en ruso o ingles: el modelo ASR correspondiente permite generar subtitulos sin conexion para videos ya descargados en el dispositivo.
- Procesamiento de entrevistas de investigacion con datos sensibles: al ejecutarse en local, evita enviar audio de participantes a terceros, algo critico en estudios con consentimiento restringido.
- Asistentes de voz para entornos sin conectividad: en zonas rurales, aviones o instalaciones aisladas, la pipeline ASR + NER en ruso permite dictado y extraccion de entidades sin red.
- Preprocesado de audio para pipelines de NLP en ruso: la transcripcion con GigaAM-v3 y el NER con Slovnet permiten construir un flujo de extraccion de entidades a partir de audio sin depender de APIs externas.
- Verificacion de integridad en despliegues: los checksums SHA-256 del manifiesto permiten validar que los pesos descargados no han sido alterados antes de cargarlos en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de modelos ONNX para Android, el objetivo es ejecucion en CPU/NPU del dispositivo, no en GPU de servidor.
- GPU recomendadas: no aplica para el caso de uso previsto; no se documentan requisitos de GPU.
- Cabe en GPU de consumo: no disponible; el repositorio esta pensado para moviles, no para tarjetas graficas.
- Opciones de despliegue: runtime ONNX en Android (integrado en la app Slovami AI); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Slovami AI models (este repo) | Paquete ASR + diarizacion + NER | ru, en | ONNX | Apache-2.0 (repo) | Offline en Android |
| Whisper (OpenAI) | ASR | Multilingue | PyTorch, ONNX, GGML | MIT | Servidor y dispositivo |
| GigaAM-v3 (Salute) | ASR | ru | PyTorch | MIT | Ruso de alta calidad |
| 3D-Speaker (ModelScope) | Embeddings de hablante | Independiente del idioma | PyTorch | Apache-2.0 | Diarizacion |

La comparativa directa no es del todo equivalente: Slovami AI models no es un modelo unico, sino un agregado de los anteriores empaquetado para un caso de uso concreto (Android offline). Frente a usar Whisper o GigaAM-v3 por separado, la ventaja es la integracion y la distribucion con checksums; la desventaja es que no anade mejoras de rendimiento sobre los modelos originales.

## Limitaciones y advertencias

- No es un modelo nuevo: el rendimiento y los sesgos son los de GigaAM-v3, Whisper, 3D-Speaker, Navec y Slovnet, no los de un entrenamiento propio.
- Solo cubre ruso e ingles; no hay soporte de castellano ni de otras lenguas.
- La diarizacion depende de la calidad de los embeddings de hablante y puede degradarse con solapamiento de voces, ruido o audio de baja calidad.
- Riesgo de alucinacion y errores de transcripcion inherente a los modelos ASR, especialmente en audio con acentos marcados o vocabulario tecnico.
- La licencia Apache-2.0 del repositorio no sustituye a las licencias de los componentes; hay que respetar los terminos MIT y Apache-2.0 de cada proyecto original al redistribuir.
- El modelo opcional QVikhr no esta incluido, por lo que no debe asumirse su disponibilidad.
- No hay informacion sobre cuantizacion, contexto ni parametros, lo que dificulta planificar recursos con precision.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, sin senales de adopcion ni mantenimiento comunitario.
- Orientado a inferencia en dispositivo Android; no se documenta su uso en servidores ni en pipelines de alto throughput.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/TimHdm/slovami-ai-models
- Proyecto Slovami AI: https://github.com/timhdm/slovami-ai
- GigaAM (Salute Developers): https://github.com/salute-developers/GigaAM
- Whisper (OpenAI): https://github.com/openai/whisper
- 3D-Speaker (ModelScope): https://github.com/modelscope/3D-Speaker
- Navec (Natasha): https://github.com/natasha/navec
- Slovnet (Natasha): https://github.com/natasha/slovnet
