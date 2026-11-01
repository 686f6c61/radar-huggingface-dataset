# Thox-ai/ThoxCode-8B

## Resumen

ThoxCode-8B es un paquete de configuración publicado por Thox-ai sobre los pesos originales de Qwen2.5-Coder-7B. No se trata de un modelo entrenado desde cero ni de un fine-tuning: el repositorio contiene únicamente un `Modelfile` de Ollama, un manifiesto de release y un pequeño knowledge pack en JSONL (8 entradas verificadas). Los pesos reales son los de Qwen y se descargan desde la etiqueta `qwen2.5-coder:7b` de Ollama, fijada por digest.

El valor del paquete está en el perfil de sistema "THOX Code", que impone reglas de comportamiento (código funcional primero, defectos primero en revisión, prohibición de inventar APIs) y en el knowledge pack versionado para recuperación local. El nombre "8B" responde a la etiqueta de la familia THOX; el modelo base real es de clase 7B, rebasado desde una configuración previa sobre Qwen3-8B para que el perfil de código corra sobre una base entrenada específicamente en código.

Es relevante para desarrolladores que quieran un asistente de código local, offline y con un contrato de comportamiento explícito (por ejemplo, declinar confirmar estado en vivo del sistema), desplegable en portátiles sin GPU mediante Ollama. La licencia Apache-2.0 se hereda de Qwen2.5-Coder.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-7B); el paquete THOX no modifica la arquitectura |
| Parametros totales | Clase 7B (base Qwen2.5-Coder-7B; el sufijo "8B" es etiqueta de familia) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (contexto usado en la evaluacion del autor); el contexto nativo del base no se documenta en la informacion disponible |
| Tipos de cuantizacion | Cuantizacion por defecto de la etiqueta Ollama `qwen2.5-coder:7b` (4,7 GB); otras cuantizaciones no documentadas en la informacion disponible |
| Idiomas soportados | Ingles (declarado); capacidades multilingues del base no documentadas en la informacion disponible |
| Licencia | Apache-2.0 (heredada de Qwen2.5-Coder; conservar el aviso Apache) |
| Formato de pesos | Pesos gestionados por Ollama (descarga por digest `sha256:dae161e2...`, 4,68 GB); el repositorio contiene `Modelfile`, `manifest.json` y `thox-knowledge-v0.1.jsonl` |

## Arquitectura y entrenamiento

No hay entrenamiento por parte de THOX. La arquitectura es la del transformer decoder-only de Qwen2.5-Coder-7B, sin modificaciones en los pesos. La personalización consiste en dos artefactos: un perfil de sistema (`profiles/SYSTEM-code.txt`) inyectado vía `Modelfile` de Ollama, que define el comportamiento del asistente (priorizar código funcional, señalar defectos en revisión, aislar APIs desconocidas en una única función adaptadora y no confirmar estado en vivo del sistema), y el THOX Knowledge Pack v0.1, un fichero JSONL de 4.652 bytes con 8 entradas públicas verificadas para recuperación local.

El empaquetado fija la base por digest de Ollama, lo que garantiza reproducibilidad del binario de pesos, y registra la versión del perfil y del knowledge pack en `manifest.json`. No se documentan datos de RLHF, DPO ni composición de dataset adicional, ya que no se ha realizado ajuste alguno sobre los pesos.

## Capacidades

- Generación de código: funciones tipadas y documentadas, con manejo de casos límite (validado en el smoke test del autor con una función de fusión de intervalos).
- Revisión de código: detección de defectos concretos, como el argumento mutable por defecto en Python, con propuesta de corrección.
- Explicación y refactorización de código dentro de flujos ThoxChat y MeshStack Desktop.
- Aislamiento de APIs desconocidas: el perfil obliga a encapsular firmas no presentes en el knowledge pack en una única función adaptadora, en lugar de inventarlas.
- Declinación de estado en vivo: regla explícita para rechazar confirmar telemetría o topología del sistema (probada con una trampa de topología fabricada).
- Emisión de recomendaciones etiquetadas como tales (por ejemplo, ejecutar localmente un documento privado), sin conceder permisos de ejecución.
- Ejecución totalmente offline y standalone; el runtime THOX opcional añade descubrimiento MeshStack y ejecución autorizada.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Capacidades multimodales (visión, audio): no disponibles.

## Casos de uso

- Asistencia de código en portátil sin GPU: el modelo corre en Ollama con 5,47 GB de RAM residentes y 9,2 tokens/s en una máquina de 4 vCPU y 8 GB, lo que permite usarlo en equipos de desarrollo modestos sin conexión.
- Revisión de pull requests en local: el perfil "defectos primero" hace que el modelo priorice la identificación de bugs (por ejemplo, mutabilidad por defecto) antes que cuestiones de estilo, útil como primera pasada antes de la revisión humana.
- Generación de utilidades con contratos estrictos: al exigir que las firmas desconocidas se aíslen en un adaptador, encaja en tareas donde la API interna no está documentada y se quiere evitar código que invente endpoints.
- Integración en ThoxChat y MeshStack Desktop: el modelo se invoca a través del endpoint local compatible con OpenAI de Ollama, lo que permite conectarlo a interfaces de chat y flujos de escritorio existentes.
- Grounding sobre documentación interna acotada: el knowledge pack v0.1 (8 entradas) permite responder preguntas sobre marca, dispositivos, políticas de enrutamiento y privacidad a partir de pasajes suministrados, sin depender de la nube.
- Asistente de refactorización de ámbito pequeño: adecuado para funciones y módulos individuales; para refactorizaciones grandes el propio autor advierte de errores esperables.
- Prototipado en entornos air-gapped: al no requerir red tras la descarga inicial y no realizar llamadas externas sin autorización del runtime, sirve en entornos con restricciones de conectividad.

## Benchmarks y rendimiento

El autor no publica benchmarks estándar (MMLU, HumanEval, GSM8K). Los datos disponibles son mediciones de smoke test y rendimiento del propio empaquetado, realizadas el 2026-10-31 en una máquina x86_64 sin GPU (4 vCPU, 8 GB RAM, contexto de 8.192 tokens):

| Prueba | Resultado |
|---|---|
| Carga del modelo | Correcta; huella residente de 5,47 GB de RAM |
| Throughput en generación larga (1.024 tokens) | 9,2 tokens/s |
| Throughput en respuestas cortas | 9,35–10,03 tokens/s |
| Preguntas de marca (3) | 3/3 correctas |
| Grounding sobre Knowledge Pack v0.1 (8 temas) | 8/8 respondidos desde el pasaje suministrado |
| Smoke de código (3 tareas) | 3/3 correctas |
| Trampa de topología fabricada | Declinada en ejecución con y sin límite de tokens |
| Pregunta de enrutamiento | Recomendación emitida y etiquetada como tal |

Estas cifras son mediciones del host de compilación de esta configuración concreta, no un benchmark general ni una cualificación de dispositivo. No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- RAM: al menos 8 GB de sistema; huella residente medida de 5,47 GB en carga con la cuantización por defecto de Ollama.
- GPU: no se documentan requisitos de GPU; la evaluación se realizó íntegramente en CPU.
- GPU de consumo: no hay datos de VRAM ni de rendimiento en GPU en la información disponible; la cuantización de 4,7 GB podría caber en GPUs de consumo con 8 GB o más de VRAM, pero esto no está verificado por el autor.
- Despliegue: Ollama (`ollama run Thox-ai/thoxcode-8b`) o construcción local desde el repositorio con `ollama create`. Otros motores (vLLM, TGI, llama.cpp directo) no están documentados para este paquete.
- Latencia y throughput: 9,2 tokens/s en generación larga y 9,35–10,03 tokens/s en respuestas cortas, medidos en CPU de 4 vCPU.
- Endpoint: API local compatible con OpenAI expuesta por Ollama.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThoxCode-8B | Clase 7B (base Qwen2.5-Coder-7B) | 8.192 tokens usados en evaluación | Paquete de configuración sobre base de código, con perfil de sistema y knowledge pack | Apache-2.0 | Ollama y repositorio HF con artefactos de empaquetado |
| Qwen2.5-Coder-7B | 7B | No disponible en la información proporcionada | Modelo base de código de Qwen | Apache-2.0 | HuggingFace y Ollama |
| Qwen3-8B | 8B | No disponible en la información proporcionada | Modelo general de Qwen | No disponible en la información proporcionada | HuggingFace y Ollama |

La comparación con otras alternativas de la misma categoría (por ejemplo, otros asistentes de código locales empaquetados) no está disponible en la información proporcionada. La diferencia principal de ThoxCode-8B frente a su base no está en los pesos, idénticos, sino en el contrato de comportamiento y el knowledge pack versionado.

## Limitaciones y advertencias

- El modelo base es un coder de clase 7B: comete errores en refactorizaciones grandes y en frameworks poco conocidos; su salida debe revisarse y probarse como la de un contribuyente junior.
- Riesgo de alucinación de APIs: el perfil exige aislar firmas desconocidas en una función adaptadora, pero la garantía depende de que el perfil se aplique correctamente en el runtime.
- Conocimiento limitado al knowledge pack suministrado (8 entradas) y a la recuperación local; no hay conocimiento actualizado más allá de ese pack.
- Idioma declarado: solo inglés; el comportamiento en castellano no está documentado ni evaluado.
- Contexto: la evaluación se hizo con 8.192 tokens; el contexto nativo del base no se especifica en la información disponible.
- Permisos: la ejecución de código, la escritura de ficheros fuera del proyecto, las llamadas de red y la ejecución remota en la malla requieren autorización del runtime; una recomendación del modelo nunca concede permiso de ejecución.
- Licencia: Apache-2.0 heredada de Qwen2.5-Coder; es obligatorio conservar el aviso Apache. Los elementos propios de THOX (perfil de sistema, knowledge pack, empaquetado) se distribuyen bajo la misma licencia según la model card.
- Los datos de rendimiento provienen de un único host de compilación sin GPU y no constituyen una cualificación de dispositivo ni un benchmark general.
- Sesgos conocidos: no documentados en la información disponible.

## Enlaces

- HuggingFace: https://huggingface.co/Thox-ai/ThoxCode-8B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B
- Etiqueta de Ollama del base: https://ollama.com/library/qwen2.5-coder
- Ejecución publicada: `ollama run Thox-ai/thoxcode-8b`
- Papers, blogs, repositorios o demos adicionales: no disponibles en la información proporcionada.
