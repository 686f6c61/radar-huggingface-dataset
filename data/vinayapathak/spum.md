# vinayapathak/spum

## Resumen

Spum es un motor de inferencia local para macOS orientado a tareas biomédicas y de visión-lenguaje, desarrollado por Vinayak Pathak (Neuroscape Imaging). A diferencia de un modelo de pesos, el repositorio distribuye binarios compilados: una aplicación nativa para macOS arm64 y una herramienta de línea de comandos que ejecutan modelos GGUF compatibles con proyectores de imagen. La propuesta central es ofrecer inferencia local en Apple Silicon sin depender de servicios en la nube, algo relevante en un dominio donde la confidencialidad de los datos clínicos es crítica.

El motor no incluye pesos ni datos de entrenamiento. El usuario debe descargar por separado los pesos GGUF y el proyector de imagen correspondiente, cada uno bajo su propia licencia. El ejemplo canónico de la documentación es MedGemma 4B IT en cuantización Q4_K_M, lo que sitúa el caso de uso típico en modelos de 4.000 millones de parámetros cuantizados a 4 bits ejecutados en hardware consumer de Apple.

La versión actual de la app es 0.2.2 (motor de inferencia 0.2.1), publicada el 1 de noviembre de 2026. El proyecto se declara explícitamente como herramienta de investigación e ingeniería, no como dispositivo médico, y no establece precisión diagnóstica ni de segmentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (motor de inferencia; la arquitectura depende del modelo GGUF cargado) |
| Parametros totales | No disponible (depende del modelo; el ejemplo documentado es de 4B) |
| Parametros activos | No aplica (no es un modelo MoE propio) |
| Longitud de contexto | No disponible (determinada por el modelo cargado) |
| Tipos de cuantizacion | GGUF; el ejemplo documentado usa Q4_K_M |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (pesos y proyector de imagen suministrados por separado) |

## Arquitectura y entrenamiento

Spum no es un modelo entrenado por el autor, sino un motor de inferencia que carga pesos GGUF de terceros junto con su proyector de imagen correspondiente. La arquitectura efectiva (transformer denso, MoE, híbrida, etc.) viene determinada por el modelo seleccionado en tiempo de ejecución; la documentación no especifica ninguna arquitectura propia ni publica detalles sobre datos de entrenamiento, número de tokens, composición del dataset o fases de alineación como RLHF o DPO, porque el proyecto no entrena modelos.

La innovación técnica del proyecto reside en el empaquetado y la distribución: binarios firmados con Developer ID y notarizados por Apple, distribución vía Homebrew (tap propio y cask), script de instalación vía curl y una app nativa con biblioteca de modelos, adjuntos de imagen, búsqueda y exportación de conversaciones, temas claro/oscuro y acceso desde la barra de menús. El motor soporta aceleración por GPU (`--gpu`) y entrada multimodal mediante la combinación de un GGUF y su proyector de imagen. No se documentan técnicas como decodificación especulativa, atención lineal ni optimizaciones de kernel específicas.

## Capacidades

- Ejecución local de modelos GGUF de visión-lenguaje con proyector de imagen emparejado.
- Inferencia acelerada por GPU en Apple Silicon (flag `--gpu`).
- Interfaz de chat nativa en macOS con historial de conversaciones, búsqueda y exportación.
- Adjuntar imágenes a la conversación desde la app (por ejemplo, radiografías de tórax).
- Ejecución por línea de comandos con prompts e imágenes individuales.
- Gestión de biblioteca de modelos desde la app.
- Idiomas: inglés (según los metadatos del repositorio).
- Tool calling, function calling, razonamiento multi-paso y modo thinking: no disponibles de forma nativa en el motor; dependerían del modelo cargado y no se documentan.

## Casos de uso

- Descripción de imágenes médicas en local: el ejemplo oficial ejecuta MedGemma 4B IT Q4_K_M sobre una radiografía de tórax con el prompt "Describe this image in one sentence", útil para prototipos de anotación asistida sin enviar imágenes a la nube.
- Investigación en imagen biomédica con datos sensibles: al ejecutarse íntegramente en el Mac del investigador, evita la transferencia de imágenes clínicas a servicios externos, lo que simplifica el cumplimiento de políticas de privacidad institucionales.
- Evaluación comparativa de modelos de visión-lenguaje: la biblioteca de modelos y el cambio de GGUF permiten probar distintos modelos y cuantizaciones sobre el mismo conjunto de imágenes con una única herramienta.
- Docencia y formación técnica: el flujo de instalación vía Homebrew y la app con interfaz gráfica facilitan que estudiantes de ingeniería biomédica experimenten con modelos multimodales sin configurar entornos Python.
- Prototipado rápido en pipelines de investigación: la CLI `spum run` permite integrar la inferencia en scripts de procesamiento por lotes de imágenes, con salida capturable para su análisis posterior.
- Herramienta de escritorio para revisión de literatura con figuras: la app permite adjuntar figuras de artículos y consultar al modelo localmente, manteniendo el material no publicado dentro del equipo.
- Automatización de tareas de descripción de imágenes en macOS: el acceso desde la barra de menús y el atajo permiten invocar el modelo sobre capturas o imágenes abiertas sin salir del flujo de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que estas versiones no establecen precisión diagnóstica ni de segmentación, y no incluye métricas de latencia ni throughput.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon (arm64); requiere macOS 14 o posterior.
- VRAM: no disponible. Al usar memoria unificada, el consumo depende del modelo GGUF; para un modelo de 4B en Q4_K_M el requisito de memoria es moderado, pero no se publican cifras oficiales.
- GPU recomendadas: cualquier chip Apple Silicon compatible con macOS 14; no se documentan modelos concretos (M1, M2, M3, M4) ni configuraciones mínimas de memoria.
- GPU de consumo x86 (RTX 4090, etc.): no soportadas; el proyecto es específico de macOS arm64.
- Despliegue: app nativa (DMG), cask de Homebrew (`brew install --cask vinayapathak/spum/spum-app`), fórmula de Homebrew (`brew install vinayapathak/spum/spum`) y script de instalación (`curl -fsSL https://nsimaging.ai/spum/install.sh | sh`).
- vLLM, llama.cpp, Ollama o TGI: no se documenta integración con estos servidores; Spum es un motor propio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. Spum no es un modelo sino un motor de inferencia local para macOS; sus alternativas naturales serían otros runners de GGUF en Apple Silicon (por ejemplo, llama.cpp u Ollama), pero la información proporcionada no incluye datos comparativos de rendimiento, funcionalidad ni licencia de esos proyectos, por lo que no se puede establecer una comparación rigurosa.

## Limitaciones y advertencias

- No es un dispositivo médico: la model card declara explícitamente que no se establece precisión diagnóstica ni de segmentación; no debe usarse para decisiones clínicas.
- No contiene pesos ni datos de entrenamiento: el rendimiento, los sesgos y las capacidades dependen enteramente del modelo GGUF y del proyector de imagen que el usuario descargue, cada uno con su propia licencia.
- Idiomas: los metadatos indican únicamente inglés.
- Plataforma restringida: solo macOS 14 o posterior en Apple Silicon; no hay soporte para Linux, Windows ni GPUs x86.
- Riesgo de alucinación: inherente a los modelos de lenguaje cargados; en dominio biomédico el riesgo es especialmente relevante y no se documentan mitigaciones específicas.
- Sesgos: no disponibles; dependerán del modelo subyacente.
- Licencia MIT para el motor, pero la licencia de los pesos descargados puede ser distinta y debe verificarse por separado antes de un uso comercial.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta, versión 0.2.x y creado en noviembre de 2026; no hay evidencia publicada de uso en producción.
- Desajuste de versiones documentado: la app es 0.2.2 pero su motor de inferencia embebido es 0.2.1.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/vinayapathak/spum
- Sitio web y ejecuciones grabadas: https://nsimaging.ai/spum/
- Instalación en Mac: https://nsimaging.ai/spum/#install
- Tap de Homebrew: https://github.com/vinayapathak/homebrew-spum
- Script de instalación: https://nsimaging.ai/spum/install.sh
