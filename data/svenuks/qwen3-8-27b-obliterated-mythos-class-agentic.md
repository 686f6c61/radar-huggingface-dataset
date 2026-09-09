# Svenuks/Qwen3.8-27B-OBLITERATED-Mythos-Class-Agentic

## Resumen

Qwen3.8-27B-OBLITERATED-Mythos-Class-Agentic es una versión optimizada para agentes del modelo abliterated Qwen3.8-27B, publicada por Svenuks. Su objetivo principal es corregir los defectos del checkpoint upstream: la plantilla de chat truncada, la pérdida silenciosa de llamadas a herramientas y los bucles infinitos de razonamiento. Para ello, incorpora un protocolo de auto-revisión adversaria (Mythos-Class), un motor de descomposición jerárquica de tareas, una plantilla Jinja2 canónica de 9,4 KB con 22 rutas de resolución de tool calling y un contexto ampliado a 131.072 tokens en producción (hasta 262.144 nativos).

El modelo base es Qwen3.8-27B, un modelo denso de visión-lenguaje de 27.781 millones de parámetros, construido sobre la arquitectura de Qwen3.5. La licencia es Apache 2.0 y el formato de pesos en el repositorio es Safetensors. La relevancia actual reside en que ofrece una alternativa robusta y lista para producción en tareas de agentes, programación asistida y ejecución de herramientas, sin las restricciones de seguridad del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de visión-lenguaje |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens (128K) en producción; 262.144 tokens (256K) nativos |
| Tipos de cuantizacion | BF16, FP8, AWQ (4-bit) |
| Idiomas soportados | en, zh, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (versión GGUF disponible de mradermacher) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un modelo denso de visión-lenguaje de 27.000 millones de parámetros que entiende imágenes y vídeos, con control flexible del modo de pensamiento y orientado a tareas complejas de varios pasos. Sobre este checkpoint se aplica la técnica de abliteración en `OBLITERATUS/Qwen3.8-27B-OBLITERATED`, que modifica los pesos para debilitar o eliminar las restricciones de seguridad, dando lugar a un modelo "uncensored".

La versión Mythos-Class-Agentic no es un reentrenamiento completo, sino una reconfiguración del tokenizador y de la plantilla de chat, junto con la inyección de un protocolo de razonamiento. El release incorpora un template Jinja2 canónico de 9,4 KB con 22 rutas de resolución de llamadas a herramientas, un protocolo de auto-revisión adversaria (Mythos-Class), un motor de descomposición jerárquica de tareas y un ajuste de muestreo anti-bucles con temperatura 0,65, penalización de repetición 1,15 y penalización de presencia 0,15. También se amplía la longitud máxima de salida a 16.384 tokens por turno.

## Capacidades

- Generación de texto, razonamiento y visión-lenguaje: entiende imágenes y vídeos gracias al modelo base Qwen3.8-27B.
- Ejecución nativa de herramientas (tool calling): soporte completo para Hermes Agent, Aider y OpenCode, con resolución de roles y llamadas sin pérdidas.
- Soporte de agentes y razonamiento multi-paso: descompone objetivos complejos en un árbol de tareas jerárquico (Task Tree) con fases de reconocimiento, análisis, implementación y validación.
- Protocolo de auto-revisión adversaria (Mythos-Class): reduce los bucles de pensamiento infinitos y promueve conclusiones decisivas y accionables.
- Muestreo ajustado anti-bucles: parámetros de temperatura y penalizaciones diseñados para evitar iteraciones repetitivas.
- Multilingüe en inglés, chino y árabe.
- Tope de salida ampliado a 16.384 tokens por turno, lo que permite generar respuestas largas y código extenso.

## Casos de uso

- Agentes de desarrollo de software: puede integrarse en herramientas como Aider u OpenCode para leer archivos, modificar código y ejecutar comandos de forma autónoma, gracias a la ejecución nativa de tool calling.
- Análisis y depuración de repositorios: con 128K de contexto, puede examinar proyectos completos, identificar puntos de fallo y proponer parches en un solo turno.
- Automatización de tareas de investigación: la descomposición en árbol de tareas permite planificar y ejecutar flujos de investigación complejos, como recopilar datos, verificar hipótesis y generar informes.
- Asistencia técnica con análisis visual: al ser visión-lenguaje, puede interpretar capturas de pantalla, diagramas y vídeos para diagnosticar incidencias o documentar interfaces.
- Soporte al cliente multilingüe: gestiona conversaciones en inglés, chino y árabe con contexto largo para mantener coherencia en diálogos extendidos.
- Generación de contenido sin filtros: para entornos controlados donde se necesita una salida sin las restricciones de seguridad del modelo original, como escritura creativa, investigación de vulnerabilidades o pruebas de penetración autorizadas.
- Automatización de flujos de trabajo de seguridad ofensiva: el flujo de tareas de reconocimiento, análisis y validación permite encadenar pasos de pentesting en entornos legalmente autorizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras comparativas en MMLU, HumanEval, GSM8K ni otras métricas, y los datos de rendimiento presentados se limitan a especificaciones de configuración y despliegue.

## Requisitos de hardware

- BF16 / precisión completa: requiere aproximadamente 60 GB de VRAM; recomendado para 2x A100, 2x RTX 4090 o H100. Soportado por SGLang, vLLM, TGI y TRT-LLM.
- FP8 (8 bits): requiere aproximadamente 30 GB de VRAM; recomendado para 1x A100 (40/80 GB) o 2x RTX 3090/4090. Soportado por SGLang y vLLM.
- AWQ (4 bits): requiere aproximadamente 16 GB de VRAM; cabe en una sola GPU de 24 GB como RTX 3090, RTX 4090 o A5000. Soportado por SGLang, vLLM y LMDeploy.
- Existe una versión GGUF de mradermacher que permite el despliegue con llama.cpp u Ollama en CPU o GPU.
- Latencia y throughput: no disponible en la información aportada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia |
|---|---|---|---|---|
| Qwen3.8-27B-OBLITERATED-Mythos-Class-Agentic | 27.781M | 128K prod / 256K nativo | Nativo (Mythos-Class) | Apache 2.0 |
| Qwen/Qwen3.8-27B | 27B | 256K nativo | Nativo (en el modelo base) | Apache 2.0 |
| OBLITERATUS/Qwen3.8-27B-OBLITERATED | 27B | 32K nativo | Roto en el checkpoint upstream | Apache 2.0 |

La ventaja principal de este modelo sobre el checkpoint abliterated es la corrección de la plantilla de chat y del tool calling, junto con el protocolo anti-bucles y la ampliación del contexto y del tope de salida.

## Limitaciones y advertencias

- Al estar abliterado, el modelo puede generar contenido peligroso, ilegal o dañino. Debe utilizarse con responsabilidad y solo en entornos autorizados.
- La documentación incluye un flujo de "Exploit Generation", lo que indica un potencial uso malicioso. No se recomienda para aplicaciones públicas sin supervisión.
- Riesgo de alucinación inherente a los modelos generativos; el protocolo adversarial mitiga bucles pero no garantiza exactitud factual.
- Idiomas limitados a inglés, chino y árabe según la model card; puede degradarse en otros idiomas.
- El campo `inference` es `false` en HuggingFace, por lo que no se puede probar desde el widget de la web.
- Los parámetros de muestreo recomendados (temperatura 0,65, penalización de repetición 1,15, penalización de presencia 0,15) deben respetarse para evitar comportamientos de bucle.
- La ampliación del contexto a 256K puede requerir soporte experimental en los motores de inferencia y puede aumentar el consumo de memoria KV-cache.

## Enlaces

- HuggingFace: https://huggingface.co/Svenuks/Qwen3.8-27B-OBLITERATED-Mythos-Class-Agentic
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint abliterated: https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED
- Versión GGUF de mradermacher: https://huggingface.co/mradermacher/Qwen3.8-27B-OBLITERATED-Mythos-Class-Agentic-GGUF
- Discusión sobre bucles de razonamiento: https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED/discussions/7
- Discusión sobre plantilla truncada: https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED/discussions/9
