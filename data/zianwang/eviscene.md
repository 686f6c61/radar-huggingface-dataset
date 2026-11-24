# ZiAnwang/EviScene

## Resumen

EviScene es un agente multimodal desarrollado por ZiAnwang (investigador individual, según el repositorio de Hugging Face) orientado a la evaluación de la factualidad de imágenes. A diferencia de los clasificadores convencionales que responden a la pregunta "¿es esta imagen generada por IA?", EviScene aborda una cuestión más ambiciosa: si los hechos que la imagen representa están respaldados por evidencia verificable. Dado un input exclusivamente visual, el agente inspecciona detalles, busca evidencia externa y emite un veredicto acompañado de un informe fundamentado, sin requerir que el usuario formule una afirmación previa.

El sistema se articula como una política ReAct compacta entrenada mediante supervisión (SFT) sobre trayectorias docentes revisadas y refinada con destilación on-policy privilegiada (PSD). El repositorio incluye el runtime del agente, integraciones de herramientas (búsqueda web, búsqueda inversa de imágenes, OCR) y utilidades de entrenamiento y evaluación. El modelo base sobre el que se construye no se especifica explícitamente en la información disponible, aunque la configuración del entorno referencia variables con prefijo `QWEN35_LOCAL`, lo que sugiere un backbone de la familia Qwen.

La relevancia de EviScene reside en su enfoque hacia la verificación factual multimodal con evidencia externa, un área menos cubierta que la detección de deepfakes. Su licencia "other" y la dependencia de APIs de terceros (Serper, Jina, Baidu OCR, OSS) condicionan su despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agente multimodal basado en política ReAct sobre un modelo multimodal (backbone no especificado; la configuración sugiere familia Qwen) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | other |
| Formato de pesos | no disponible (repo de 68,9 GB; se sirve mediante endpoint compatible con OpenAI) |

## Arquitectura y entrenamiento

EviScene implementa un agente con política ReAct única que decide iterativamente entre cuatro acciones: inspección visual de detalles, búsqueda web, recuperación de imágenes y examen de la evidencia recopilada. El entrenamiento combina dos fases: un ajuste supervisado (SFT) sobre trayectorias docentes revisadas por humanos, y una destilación on-policy privilegiada (PSD) que refina decisiones seleccionadas usando pistas disponibles solo durante el entrenamiento; el estudiante desplegado no recibe esas pistas. Esta separación entre profesor privilegiado y estudiante desplegado es la innovación técnica central del trabajo.

El repositorio proporciona el runtime del agente, las integraciones de herramientas y las utilidades de preparación de datos y entrenamiento (`eviscene` para inferencia, `eviscene-train` para entrenamiento). El número de tokens de entrenamiento, la composición del dataset y los detalles del backbone no se especifican en la información disponible.

## Capacidades

- Inspección visual iterativa de detalles de la imagen mediante herramientas de percepción.
- Búsqueda web de evidencia textual (proveedor Serper) y recuperación de contenido legible vía Jina Reader.
- Búsqueda inversa de imágenes y búsqueda visual (proveedor Serper Lens).
- OCR mediante API de Baidu para extraer texto presente en la imagen.
- Razonamiento multi-paso tipo ReAct: el agente decide qué herramienta invocar según lo que queda por resolver.
- Emisión de veredicto de factualidad acompañado de un informe fundamentado en evidencia.
- Evaluación de la suficiencia del fundamento factual del informe final, además de la clasificación.
- Soporte multilingüe limitado a inglés y chino.
- No requiere que el usuario escriba una afirmación en tiempo de inferencia: el input es solo la imagen.

## Casos de uso

- Verificación de noticias con imágenes: el agente inspecciona la imagen, busca la escena en fuentes externas y emite un informe sobre si los hechos representados están respaldados, útil en redacciones y fact-checking periodístico.
- Moderación de contenido en plataformas: integrado como paso de revisión para imágenes sospechosas, el agente aporta un informe con evidencia en lugar de una etiqueta binaria, lo que facilita la revisión humana posterior.
- Due diligence en comercio electrónico: verificar que las imágenes de producto corresponden a artículos reales mediante búsqueda inversa y contraste con fuentes externas.
- Investigación académica en factualidad multimodal: el repositorio incluye código de evaluación (EviLens) para medir tanto clasificación como suficiencia del informe, lo que permite reproducir y extender experimentos.
- Análisis de imágenes en contextos de seguros o reclamaciones: contrastar la escena fotografiada con evidencia externa para detectar inconsistencias antes de la tramitación.
- Automatización de auditorías de contenido generado: combinar la inspección visual con búsqueda web para documentar si una escena publicada corresponde a un evento verificable.
- Asistencia a equipos de OSINT: el agente orquesta búsqueda inversa, OCR y búsqueda textual en un solo flujo con informe trazable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la existencia de una evaluación denominada EviLens y código de evaluación, pero no incluye cifras numéricas en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del backbone, que no se especifica).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: servidor multimodal compatible con la API de chat-completions de OpenAI con soporte de imágenes (el runtime se conecta vía `QWEN35_LOCAL_BASE_URL`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; la latencia efectiva depende además de las llamadas a APIs externas (Serper, Jina, Baidu, OSS).
- Almacenamiento: el repositorio ocupa 68,9 GB.
- Entorno: Python 3.11 o 3.12 en un entorno limpio.

## Comparativa con modelos similares

| Modelo | Enfoque | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|
| EviScene | Agente de factualidad de imágenes con evidencia externa | en, zh | other | Hugging Face, repo 68,9 GB |
| Detectores de imágenes IA (p. ej. clasificadores binarios) | Clasificación "¿es IA?" sin evidencia externa | no disponible | variable | amplia |
| Modelos multimodales generales (p. ej. familia Qwen-VL) | Descripción y razonamiento visual sin verificación factual | múltiples | variable | amplia |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- La licencia es "other": es imprescindible revisar los términos exactos antes de cualquier uso comercial.
- La inferencia puede ser local, pero la búsqueda externa depende de APIs de terceros (Serper, Jina, Baidu OCR, OSS), con costes, límites de uso y dependencia de disponibilidad.
- El OCR envía el contenido de la imagen a la API de Baidu; no hay modelo OCR local ni proveedor alternativo, lo que plantea implicaciones de privacidad y cumplimiento.
- Solo se declaran idiomas inglés y chino; el rendimiento en castellano no está garantizado.
- Riesgo de alucinación en el informe final: la evaluación mide la suficiencia del fundamento, pero no se aportan cifras que permitan cuantificarlo.
- El backbone, el tamaño de parámetros y la longitud de contexto no se documentan, lo que dificulta estimar requisitos y comparar con alternativas.
- Las cachés de herramientas y percepción están desactivadas por defecto en la configuración de ejemplo, lo que incrementa llamadas externas y latencia.
- No se han publicado resultados de benchmarks en la información disponible, por lo que no es posible validar el rendimiento de forma independiente.
- El repositorio tiene 0 descargas y 7 likes en el momento de la consulta: ecosistema muy incipiente y escasa validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ZiAnwang/EviScene
- Sitio del proyecto: https://wangzian828.github.io/EVISCENE/
- Paper en arXiv: https://arxiv.org/abs/2610.14609
- Página del paper en Hugging Face: https://huggingface.co/papers/2610.14609
- Repositorio de código: https://github.com/wangzian828/EVISCENE
- README en chino simplificado: https://huggingface.co/ZiAnwang/EviScene/blob/main/README_zh-CN.md
