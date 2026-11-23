# veripazari/portable-ai

## Resumen

Portable AI es una aplicación de asistente conversacional que se ejecuta íntegramente desde una unidad USB, sin conexión a internet y con cifrado AES-256 de todo el historial de chat y de los documentos indexados. El proyecto lo desarrolló originalmente el usuario `esephaneli` y ha sido archivado por la plataforma VeriPazarı para preservar la documentación original dirigida a la comunidad de inteligencia artificial turca. No se trata de un modelo de lenguaje nuevo, sino de un *wrapper* de inferencia local construido sobre `llama-cpp-python` que utiliza modelos preexistentes (por defecto Trendyol-LLM 7B, basado en Qwen2.5 7B).

El problema que aborda es la conformidad con la normativa turca de protección de datos (KVKK) en entornos profesionales sensibles (abogados, médicos, contables, periodistas, administración pública), donde el uso de LLM en la nube implica riesgos legales por transferencia de datos. La propuesta es un asistente que no envía nada a internet: las conversaciones y los documentos permanecen cifrados en el propio USB, ligados al número de serie del volumen para evitar que la base de datos robada pueda abrirse en otro dispositivo.

Técnicamente, Portable AI no define arquitectura de modelo propia: el motor de inferencia es `llama-cpp-python==0.2.90` con instrucciones AVX2 (sin AVX-512), y el modelo por defecto es Trendyol-LLM 7B en cuantización Q4_K_M (4,7 GB), un transformer de 7B parámetros afinado sobre Qwen2.5 7B con *continued pretraining* de 13B tokens en turco. La aplicación incluye RAG sobre PDF/DOCX/TXT con embeddings `intfloat/multilingual-e5-small`, nueve modos de conversación predefinidos y empaquetado con PyInstaller para funcionar en equipos sin Python instalado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo por defecto Trendyol-LLM 7B, basado en Qwen2.5 7B); la aplicación en sí es un wrapper FastAPI + llama-cpp-python |
| Parámetros totales | 7B (modelo por defecto); la aplicación permite descargar otros modelos como `qwen-1.5b` |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | Q4_K_M (modelo por defecto, 4,7 GB); otras cuantizaciones dependen del GGUF descargado mediante `scripts/download_model.py` |
| Idiomas soportados | Turco (`tr`); el modelo de embeddings `intfloat/multilingual-e5-small` es multilingüe |
| Licencia | MIT |
| Formato de pesos | GGUF (inferencia vía llama.cpp); embeddings en formato sentence-transformers |

## Arquitectura y entrenamiento

Portable AI es una aplicación, no un modelo entrenado desde cero. El motor de inferencia es `llama-cpp-python==0.2.90` compilado para CPU con soporte AVX2 (sin AVX-512), lo que limita el rendimiento a CPU y evita dependencias de GPU. El modelo por defecto es Trendyol-LLM 7B, descrito en la documentación como un Qwen2.5 7B sobre el que se realizó *continued pretraining* con 13B tokens en turco. No se detallan en la información disponible la composición del dataset, la existencia de RLHF/DPO ni innovaciones de atención o decodificación.

La capa de aplicación incluye recuperación aumentada (RAG) con `intfloat/multilingual-e5-small` como modelo de embeddings, búsqueda vectorial por fuerza bruta con NumPy (suficiente para menos de 10.000 chunks, sin FAISS), parsing de documentos con `pypdf` y `python-docx`, y persistencia cifrada mediante `sqlcipher3` (AES-256) con derivación de clave PBKDF2-SHA256 de 200.000 iteraciones. La clave se vincula al número de serie del volumen USB, de modo que la base de datos no puede abrirse en otra unidad. La interfaz es JavaScript vanilla con streaming SSE y el empaquetado se realiza con PyInstaller en modo `--onedir`.

## Capacidades

- Generación de texto conversacional multi-turno en turco mediante el modelo GGUF cargado por llama.cpp.
- RAG sobre documentos PDF, DOCX y TXT: el usuario sube archivos y conversa sobre su contenido.
- Nueve modos de conversación predefinidos: General, Abogado, Médico, Contable, Ingeniero, Profesor, Académico, Escritor y Traductor.
- Historial de chat persistente y cifrado con AES-256 ligado al USB.
- Funcionamiento 100 % offline tras la descarga inicial del modelo de embeddings.
- Distribución portable multiplataforma (Windows, Linux, macOS) mediante bundles de PyInstaller de aproximadamente 500 MB por plataforma.
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión, audio o modo *thinking*: no disponible en la información proporcionada.

## Casos de uso

- Asistencia legal en despachos: un abogado puede cargar contratos en PDF y consultar cláusulas concretas mediante RAG sin que el contenido salga del USB, lo que facilita el cumplimiento de la KVKK y del secreto profesional.
- Documentación clínica: un médico puede resumir informes en DOCX o TXT y hacer preguntas sobre ellos en el modo "Doktor", manteniendo los datos de pacientes cifrados y fuera de la red.
- Contabilidad y fiscalidad: el modo "Muhasebeci" permite consultar normativa y borradores de documentos contables cargados localmente, útil para despachos que no pueden enviar datos a servicios cloud.
- Periodismo de investigación: un periodista puede trabajar con material sensible (transcripciones, notas en TXT) en un equipo aislado y retirar el USB al terminar, sin dejar rastro en el disco del ordenador.
- Administración pública en redes cerradas: el bundle portable permite desplegar el asistente en equipos sin conexión a internet ni permisos de instalación, arrancando desde USB con `start.bat`, `start.sh` o `start-mac.command`.
- Formación y docencia: el modo "Ogretmen" o "Akademisyen" permite generar material didáctico y resolver dudas sobre apuntes cargados como documentos, en aulas con conectividad limitada.
- Traducción local: el modo "Cevirmen" combinado con el modelo multilingüe de embeddings permite traducir y consultar documentos sin recurrir a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la configuración por defecto, ya que `llama-cpp-python==0.2.90` se compila para CPU con AVX2 (sin AVX-512).
- GPU recomendadas: no disponible; la documentación no contempla aceleración por GPU.
- Compatibilidad con GPU de consumo: no disponible; el diseño es explícitamente CPU-only.
- RAM: no especificada; el modelo por defecto Q4_K_M ocupa 4,7 GB en disco y debe cargarse en memoria para la inferencia.
- Almacenamiento: bundle de aplicación de aproximadamente 500 MB por plataforma, más 4,7 GB del modelo GGUF y aproximadamente 470 MB de embeddings.
- Opciones de despliegue: ejecución directa desde USB mediante los lanzadores incluidos; construcción de bundles con PyInstaller; build reproducible de Linux mediante Docker sobre Ubuntu 20.04 (glibc 2.31); builds multiplataforma con GitHub Actions al publicar un tag.
- Latencia y throughput: la documentación indica que el navegador se abre automáticamente en 60-90 segundos tras el arranque; no se proporcionan cifras de tokens por segundo.

## Comparativa con modelos similares

| Proyecto | Tipo | Modelo base | Contexto | Licencia | Despliegue offline |
|---|---|---|---|---|---|
| Portable AI | Aplicación RAG + chat portable | Trendyol-LLM 7B (Qwen2.5 7B) | no disponible | MIT | Sí, desde USB |
| GPT4All | Aplicación de chat local | Múltiples GGUF | depende del modelo | MIT | Sí, instalación local |
| Ollama | Servidor de inferencia local | Múltiples GGUF | depende del modelo | MIT | Sí, instalación local |
| LM Studio | Aplicación de escritorio | Múltiples GGUF | depende del modelo | Propietaria (freeware) | Sí, instalación local |

La diferencia principal de Portable AI frente a estas alternativas es el cifrado del historial vinculado al número de serie del USB y la ausencia de instalación en el equipo anfitrión, orientada a escenarios de cumplimiento normativo estricto.

## Limitaciones y advertencias

- El proyecto tiene 0 descargas y 0 likes en Hugging Face en el momento de la ficha; no hay evidencia de uso en producción ni de mantenimiento activo.
- La documentación está íntegramente en turco y el modelo por defecto está especializado en turco; el rendimiento en castellano no está documentado.
- El motor de inferencia es CPU-only con AVX2 y sin AVX-512, lo que implica latencias altas en comparación con despliegues en GPU.
- La búsqueda vectorial es fuerza bruta con NumPy y está pensada para menos de 10.000 chunks; no escala a corpus grandes.
- El cifrado depende del número de serie del volumen USB: si el USB se clona o se cambia de controlador, la base de datos puede quedar inaccesible.
- Riesgo de alucinación inherente al modelo subyacente de 7B; no se documentan evaluaciones de fidelidad del RAG.
- La licencia MIT del repositorio no cubre necesariamente los pesos del modelo descargado (Trendyol-LLM 7B / Qwen2.5 7B), cuyas condiciones deben verificarse por separado antes de un uso comercial.
- En Windows puede aparecer una advertencia de Defender al ejecutar el binario empaquetado con PyInstaller; en macOS, una advertencia de Gatekeeper.
- No hay información sobre sesgos conocidos, tasas de alucinación medidas ni pruebas de seguridad del cifrado más allá de la descripción de PBKDF2-SHA256 con 200.000 iteraciones.

## Enlaces

- Hugging Face: https://huggingface.co/veripazari/portable-ai
- Repositorio original: https://github.com/esephaneli/portable-ai
- Plataforma compiladora: https://veripazari.com.tr
