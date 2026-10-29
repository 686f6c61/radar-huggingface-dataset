# whisper-free/whisper-large-v3-turbo-arabic-dialectal-ggml

## Resumen

`whisper-free/whisper-large-v3-turbo-arabic-dialectal-ggml` es una conversión al formato GGML (compatible con whisper.cpp) del modelo `oddadmix/whisper-large-v3-turbo-arabic-dialectal-v2`, un ajuste fino de Whisper large-v3-turbo orientado a árabe dialectal. El repositorio lo publica el usuario `whisper-free` para su uso dentro de la aplicación Whisper Free y contiene un único binario en F16 (`ggml-whisper-large-v3-turbo-arabic-dialectal.bin`), sin cambios en los pesos más allá de la conversión de formato. El tokenizador procede del Whisper base de OpenAI (MIT).

La relevancia de esta ficha es acotada y conviene ser explícito: no se trata de un modelo nuevo ni de un entrenamiento adicional, sino de un artefacto de distribución. Su interés práctico reside en que empaqueta un ajuste fino de árabe dialectal en un formato que se ejecuta en CPU y en hardware de gama baja mediante whisper.cpp, lo que habilita transcripción offline en dispositivos sin GPU. El precio es la ausencia casi total de documentación: la model card no describe el proceso de ajuste, no enumera idiomas, no reporta métricas y no audita las licencias de los datos de entrenamiento.

El repositorio tiene 1,6 GB, licencia Apache-2.0, cero descargas y cero likes en el momento de redactar esta ficha, y fue creado el 29 de octubre de 2026. Cualquier evaluación de calidad debe hacerse por cuenta del usuario sobre el modelo fuente `oddadmix/whisper-large-v3-turbo-arabic-dialectal-v2`, que es donde reside el trabajo real de ajuste.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder de tipo Whisper (base large-v3-turbo), convertido a GGML; detalles del ajuste fino no disponibles |
| Parámetros totales | No disponible en la model card; la arquitectura base Whisper large-v3-turbo declara ~809 M de parámetros |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; Whisper procesa ventanas de audio de 30 s con 128 bins mel |
| Tipos de cuantización | Únicamente F16 en este repositorio; no se publican variantes Q5_0, Q8_0 ni Q4_0 |
| Idiomas soportados | No disponible; el nombre del modelo indica árabe dialectal, sin listado formal de dialectos ni de otras lenguas |
| Licencia | Apache-2.0 |
| Formato de pesos | GGML (`.bin`) en F16, formato de whisper.cpp |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper: un transformer encoder-decoder con atención estándar que recibe espectrogramas mel de 30 segundos y genera tokens de texto, con tokens especiales para detección de idioma, marcas de tiempo y cambio de tarea. La variante `large-v3-turbo` reduce el número de capas del decodificador respecto a `large-v3`, lo que rebaja el coste de inferencia a costa de algo de precisión en tareas de decodificación compleja. Sobre esa base, `oddadmix` aplicó un ajuste fino orientado a árabe dialectal, presumiblemente con datos de audio dialectal, aunque la model card de esta conversión no documenta ni el volumen de datos, ni la composición del corpus, ni si hubo etapas de RLHF o DPO.

La única intervención documentada en este repositorio es la conversión de formato a GGML en precisión F16: "weights are unchanged apart from the format conversion". El tokenizador se toma del Whisper base de OpenAI bajo licencia MIT y el autor advierte explícitamente que las licencias de los conjuntos de datos de entrenamiento no fueron auditadas. No se declara ninguna innovación técnica adicional (decodificación especulativa, atención lineal, destilación ni cuantización agresiva). El repositorio incluye un fichero `SHA256SUMS` para verificar la integridad de la descarga.

## Capacidades

- Reconocimiento automático de voz (ASR) sobre audio de hasta 30 segundos por ventana, con concatenación de ventanas para audio más largo.
- Transcripción orientada a árabe dialectal, según la denominación del modelo fuente; el grado de cobertura por dialecto no está documentado.
- Detección de idioma mediante los tokens especiales heredados de Whisper (la lista efectiva de idiomas no se publica).
- Generación de marcas de tiempo a nivel de segmento, funcionalidad estándar de la arquitectura Whisper.
- Traducción de audio a texto en inglés como tarea secundaria de Whisper; no confirmada para este ajuste fino.
- Ejecución en CPU sin GPU mediante whisper.cpp, incluyendo dispositivos de bajos recursos.
- No soporta tool calling, function calling, razonamiento multi-paso ni modo "thinking".
- No dispone de capacidades de visión, audio generativo ni procesamiento de texto más allá de la transcripción.

## Casos de uso

- Transcripción de llamadas de atención al cliente en árabe dialectal: el modelo convierte grabaciones de centros de contacto a texto para su posterior análisis de calidad; su ventana de 30 s por segmento permite procesar conversaciones completas por troceado.
- Subtitulado offline en dispositivos: al ejecutarse con whisper.cpp en CPU, se puede integrar en aplicaciones de escritorio o móviles que generan subtítulos sin enviar audio a la nube, lo que reduce requisitos de privacidad y conectividad.
- Archivado y búsqueda de entrevistas o material audiovisual: la transcripción con marcas de tiempo habilita indexación full-text de archivos de audio históricos en árabe dialectal.
- Procesamiento en el borde (edge computing): el binario F16 de 1,6 GB cabe en dispositivos tipo Raspberry Pi o mini-PC y permite desplegar ASR en entornos sin conectividad, como auditorías de campo o inspecciones.
- Preprocesado para pipelines de análisis: la salida de texto sirve como entrada a sistemas de clasificación, resumen o extracción de entidades sobre contenido hablado en dialecto.
- Prototipado e investigación en ASR dialectal: sirve como referencia ejecutable para comparar el ajuste fino `oddadmix` frente al Whisper large-v3-turbo original en un mismo entorno de inferencia.
- Aplicaciones de accesibilidad: dictado y transcripción local para usuarios que requieren procesamiento de voz sin dependencia de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas de WER, CER ni comparaciones con otros modelos, y tampoco se proporcionan datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,6 GB solo para los pesos en F16, más el coste de activaciones y buffers de audio; en la práctica, entre 2 y 4 GB de memoria disponible para una ejecución cómoda.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4090, A100, H100); el modelo no aprovecha las GPU de gama alta por su tamaño reducido.
- GPU de consumo: sí, cabe holgadamente en tarjetas de 4-8 GB; también es viable en iGPU con memoria compartida suficiente.
- CPU: whisper.cpp está diseñado para ejecución en CPU; el binario F16 es usable en x86-64 moderno y en ARM (Apple Silicon, Raspberry Pi 4/5) con tiempos de transcripción superiores a los de GPU.
- Opciones de despliegue: whisper.cpp (formato nativo GGML), `whisper.cpp` server, bindings de whisper.cpp para Python/Node/Rust. No es compatible con vLLM ni con TGI, que no soportan GGML de Whisper. Ollama no aplica a modelos ASR.
- Cuantizaciones disponibles para reducir memoria: no publicadas en este repositorio; habría que generarlas a partir del modelo fuente con los scripts de conversión de whisper.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto (audio) | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| `whisper-free/whisper-large-v3-turbo-arabic-dialectal-ggml` | ~809 M (base) | 30 s por ventana | No disponible (orientado a árabe dialectal) | Apache-2.0 | GGML F16 | HuggingFace, 0 descargas |
| `oddadmix/whisper-large-v3-turbo-arabic-dialectal-v2` (fuente) | ~809 M (base) | 30 s por ventana | No disponible | Apache-2.0 | Safetensors (presumible, no confirmado) | HuggingFace |
| `openai/whisper-large-v3-turbo` | ~809 M | 30 s por ventana | 99 idiomas declarados por OpenAI | MIT / Apache-2.0 según distribución | Safetensors, GGML, otros | HuggingFace, ampliamente desplegado |
| `openai/whisper-large-v3` | ~1.550 M | 30 s por ventana | 99 idiomas declarados por OpenAI | MIT / Apache-2.0 según distribución | Safetensors, GGML, otros | HuggingFace, ampliamente desplegado |

La comparación directa de calidad (WER por dialecto) no está disponible para ninguno de los dos modelos ajustados, por lo que la única ventaja verificable de este repositorio frente al modelo fuente es el formato GGML, que permite inferencia en CPU sin herramientas de conversión adicionales.

## Limitaciones y advertencias

- Documentación mínima: la model card solo describe la conversión de formato; no hay información sobre datos, metodología de ajuste ni evaluación.
- Sin métricas: no se publica WER ni ninguna otra medida, por lo que la mejora frente a Whisper large-v3-turbo en árabe dialectal es una afirmación no verificada.
- Idiomas no enumerados: se desconoce qué dialectos árabes cubre y si conserva el rendimiento multilingüe del modelo base.
- Riesgo de alucinación: Whisper tiende a generar texto plausible en segmentos con silencio, ruido o música; este comportamiento persiste en los ajustes finos y no se documenta mitigación alguna.
- Ventana de 30 segundos: requiere troceado y solapamiento manual para audio largo, con riesgo de errores en las fronteras de segmento.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la ficha, sin validación por parte de la comunidad.
- Licencias de datos no auditadas: el autor declara explícitamente que las licencias de los conjuntos de entrenamiento no se revisaron, lo que traslada un riesgo jurídico al uso comercial pese a la licencia Apache-2.0 del artefacto.
- Sin cuantizaciones alternativas: solo F16, lo que limita el despliegue en dispositivos con menos de 2 GB de memoria libre.
- Formato GGML: no es directamente cargable con transformers ni con servidores de inferencia orientados a LLM; requiere whisper.cpp o bindings compatibles.
- Sin soporte de agentes, tool calling ni razonamiento multi-paso: es un modelo estrictamente ASR.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/whisper-free/whisper-large-v3-turbo-arabic-dialectal-ggml
- Modelo fuente: https://huggingface.co/oddadmix/whisper-large-v3-turbo-arabic-dialectal-v2
- Repositorio de whisper.cpp (formato GGML): https://github.com/ggml-org/whisper.cpp
- Repositorio de OpenAI Whisper (tokenizador MIT): https://github.com/openai/whisper
- Anuncio original de Whisper: https://openai.com/index/whisper/
- Verificación de descargas: fichero `SHA256SUMS` incluido en el repositorio de HuggingFace
