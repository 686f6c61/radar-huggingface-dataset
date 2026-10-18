# swordenamine/CHAOS1_survival

## Resumen

CHAOS-1 (publicado en Hugging Face como `swordenamine/CHAOS1_survival`) se presenta como un "sistema de inteligencia para la supervivencia" capaz de analizar escenarios de crisis y generar estrategias priorizadas, esquemas ASCII, listas de materiales y procedimientos paso a paso, incluyendo un modo de funcionamiento sin conexión. Sin embargo, el repositorio no contiene pesos de un modelo de lenguaje propio: es una aplicación Python (punto de entrada `survival_chaos.py`, servidor web en el puerto 5000) que delega la generación en proveedores externos —Anthropic Claude, DeepSeek u Ollama en local— configurables mediante variables de entorno.

Por tanto, no nos encontramos ante un modelo fundacional sino ante un *wrapper* de orquestación con una interfaz temática: medidor de nivel de amenaza (escala 1-5), índice "chaos score" de 0 a 100, protocolos ordenados por categoría (agua, refugio, fuego, alimento, médico, señal, seguridad, energía y comunicaciones) y anotaciones bilingües inglés-árabe. La calidad, el tamaño y el contexto efectivos del sistema dependen enteramente del backend seleccionado, no del repositorio.

El interés actual del proyecto es limitado pero ilustrativo: documenta un patrón de despliegue híbrido (API comercial en línea frente a inferencia local con Ollama para escenarios sin conectividad) aplicado a un dominio de alto riesgo. No se han publicado especificaciones técnicas, licencia, idiomas declarados ni resultados de evaluación en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible. El repositorio no publica arquitectura de modelo; es una aplicacion Flask que invoca modelos de terceros (Anthropic Claude, DeepSeek u Ollama) |
| Parametros totales | no disponible (no se distribuyen pesos) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible. Depende del backend configurado (`OLLAMA_MODEL`, API remota) y de la gestion de historial de sesion de la aplicacion |
| Tipos de cuantizacion | no disponible en el repositorio. La cuantizacion aplicable es la del modelo servido por Ollama (p. ej. Q4_K_M en las builds habituales de la libreria) |
| Idiomas soportados | ingles y arabe (interfaz, notas y entradas/salidas bilingues segun la model card); otros idiomas dependen del modelo subyacente |
| Licencia | no disponible. La model card no declara licencia para el codigo ni para los artefactos |
| Formato de pesos | no disponible. El repositorio contiene codigo fuente (`survival_chaos.py`, `requirements.txt`, `.env.example`), no ficheros de pesos tipo safetensors o GGUF |

## Arquitectura y entrenamiento

No hay información sobre arquitectura de red ni sobre entrenamiento, porque el proyecto no entrena ni distribuye un modelo. La arquitectura del sistema es la de una aplicación web ligera: un servidor local en el puerto 5000 que recibe un escenario de crisis, lo enriquece con instrucciones de formato (nivel de amenaza, acciones inmediatas, protocolos por categoría, esquemas ASCII, materiales improvisados, prioridades médicas e índice de severidad de 0 a 100) y mantiene historial de sesión para preguntas de seguimiento. La capa de inferencia se abstrae mediante la variable `AI_PROVIDER`, con tres rutas: `anthropic` (requiere clave `ANTHROPIC_API_KEY` y conexión), `deepseek` (clave `DEEPSEEK_API_KEY` y conexión) y `ollama` (servidor local en `http://localhost:11434`, sin conexión).

El modo offline se apoya en modelos abiertos servidos por Ollama; la model card menciona explícitamente `mistral`, `llama3`, `phi3`, `gemma2` y `qwen2` como opciones. No se documentan datos de entrenamiento, composición del corpus, procesos de RLHF/DPO ni innovaciones técnicas propias (decodificación especulativa, atención lineal, etc.). Tampoco se detalla la ingeniería de prompts ni las salvaguardas de seguridad aplicadas a las respuestas.

## Capacidades

- Generación de estrategias de supervivencia priorizadas por categoría: WATER, SHELTER, FIRE, FOOD, MEDICAL, SIGNAL, SECURITY, POWER y COMMS.
- Evaluación de amenaza en escala 1-5 e índice de severidad "chaos score" de 0 a 100.
- Generación de esquemas ASCII para construcción e improvisación de equipamiento.
- Listado de materiales improvisados y alternativas de campo cuando no hay suministros.
- Análisis del entorno: recursos disponibles, peligros y factores críticos en el tiempo.
- Prioridades médicas y consideraciones de triaje.
- Conversación multi-turno con memoria de contexto por sesión (preguntas de seguimiento).
- Salida bilingüe inglés-árabe por estrategia.
- Funcionamiento sin conexión mediante Ollama con modelos locales.
- No se documenta soporte de tool calling, function calling, agentes autónomos, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Planificación de emergencias sin conectividad: desplegado con Ollama en un portátil o mini-PC sin red, el sistema puede generar protocolos de actuación ante corte de suministro, inundación o incendio, con pasos ordenados por urgencia y materiales disponibles en el entorno.
- Formación y simulacros: instructores pueden lanzar escenarios de prueba (la propia aplicación incluye "Quick Scenarios") y obtener respuestas estructuradas para comparar decisiones de los alumnos con una propuesta priorizada.
- Documentación bilingüe para poblaciones arabohablantes: la salida con notas en árabe facilita materiales de divulgación en contextos de ayuda humanitaria donde el inglés no es la lengua principal.
- Composición de kits de emergencia: a partir de una descripción de ubicación, número de personas y recursos, el sistema enumera materiales, alternativas improvisadas y esquemas de construcción.
- Prototipado rápido de asistentes verticales: el repositorio sirve como plantilla para construir otras aplicaciones de dominio (sanitario, industrial, logístico) con conmutación entre API comercial y modelo local mediante variables de entorno.
- Evaluación comparativa de backends: al permitir alternar entre Claude, DeepSeek y modelos servidos por Ollama, resulta útil para medir en un mismo prompt la diferencia de calidad y latencia entre proveedores en tareas de razonamiento procedimental.
- Soporte a triaje preliminar en entornos aislados: siempre como material de consulta y nunca como sustituto de personal sanitario, puede estructurar prioridades médicas cuando no hay acceso a un profesional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio en sí no requiere acelerador: es una aplicación Python que se ejecuta con `pip install -r requirements.txt` y sirve en `http://localhost:5000`.
- Modo API (`AI_PROVIDER=anthropic` o `deepseek`): no requiere VRAM local; necesita conexión a internet y crédito o clave de API.
- Modo local (`AI_PROVIDER=ollama`): el hardware depende exclusivamente del modelo elegido en `OLLAMA_MODEL`. Estimaciones orientativas para cuantización de 4 bits de los modelos citados en la model card:
  - `phi3` (variante mini, ~3,8B): aproximadamente 2,5-3 GB de VRAM.
  - `mistral` 7B o `qwen2` 7B: aproximadamente 5-6 GB de VRAM.
  - `llama3` 8B: aproximadamente 5,5-6,5 GB de VRAM.
  - `gemma2` 9B: aproximadamente 6-7 GB de VRAM.
- GPU consumer: cualquiera con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 3070/4070) puede ejecutar los modelos de 7-9B en 4 bits; con 12-16 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4080) hay margen para contextos más largos. Los modelos de 3-4B caben en GPU de 4-6 GB.
- GPU de datacenter (A100, H100) solo serían necesarias para variantes de mayor tamaño no mencionadas en la model card; para los modelos listados son sobredimensionadas.
- Despliegue: Ollama como servidor de inferencia local; alternativamente llama.cpp para CPU sin GPU. No se documenta integración con vLLM ni TGI.
- Latencia y throughput: no disponibles. En modo local estarán dominados por el backend elegido y por el hardware; en modo API, por la red y el proveedor.

## Comparativa con modelos similares

No disponible. CHAOS-1 no es un modelo de lenguaje y no publica pesos ni resultados, por lo que no admite comparación en parámetros, contexto o rendimiento. La comparación relevante es entre los backends que la aplicación puede utilizar; se recogen a continuación los citados en la model card, con datos de terceros y carácter orientativo (sujetos a la versión concreta descargada):

| Backend | Parametros (aprox.) | Contexto (aprox.) | Licencia | Uso en CHAOS-1 |
|---|---|---|---|---|
| Mistral 7B | 7,3B | 8k-32k segun version | Apache 2.0 | Local, via Ollama |
| Llama 3 8B | 8B | 8k | Llama 3 Community License | Local, via Ollama |
| Phi-3 mini | 3,8B | 4k-128k segun variante | MIT | Local, via Ollama |
| Gemma 2 | 2B / 9B / 27B | 8k | Gemma Terms of Use | Local, via Ollama |
| Qwen2 | 0,5B-72B | hasta 32k en variantes 7B | Apache 2.0 (mayoria de tamanos) | Local, via Ollama |
| Claude (Anthropic) | no disponible | no disponible | propietaria, API comercial | Remoto, requiere internet |
| DeepSeek (API) | no disponible | no disponible | propietaria, API comercial | Remoto, requiere internet |

## Limitaciones y advertencias

- No es un modelo: no hay pesos, arquitectura, tokenizador ni ficha técnica de entrenamiento publicados. Cualquier evaluación de "calidad del modelo" es en realidad una evaluación del backend configurado.
- Ausencia de licencia declarada: sin licencia explícita, el uso comercial y la redistribución del código quedan en una zona legal indeterminada.
- Dominio de alto riesgo: las respuestas incluyen triaje médico, potabilización de agua, manejo de fuego y protocolos de seguridad. Un error o alucinación puede tener consecuencias físicas graves; el sistema no sustituye a personal sanitario ni a servicios de emergencia.
- Riesgo de alucinación heredado del backend, especialmente en el modo local con modelos pequeños (3-8B), donde la generación de procedimientos plausibles pero incorrectos es frecuente.
- Idiomas: solo inglés y árabe están documentados. El rendimiento en castellano u otras lenguas no está verificado y dependerá del modelo subyacente.
- Sin benchmarks ni evaluación de seguridad publicados; 0 descargas y 0 me gusta en el momento de la consulta, sin validación por parte de la comunidad.
- Metadatos inconsistentes: la fecha de creación (2026-10-17) es posterior a la de última actualización (2026-03-09), lo que sugiere un repositorio reempaquetado o mal etiquetado.
- Sin pipeline declarado en Hugging Face, lo que impide cargarlo con `transformers` o `pipeline()` de forma estándar.
- Gestión de secretos: la configuración se realiza volcando claves de API en un fichero `.env`; no se documentan prácticas de rotación, cifrado ni gestión de credenciales.
- Dependencia de terceros: cambios en las APIs de Anthropic o DeepSeek, o en la sintaxis de Ollama, pueden romper la aplicación sin aviso.
- No se documenta filtrado de contenido, moderación de salidas ni registro de auditoría de las recomendaciones generadas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/swordenamine/CHAOS1_survival
- Ollama (runtime local recomendado por la model card): https://ollama.com
- Paper, blog técnico, repositorio de código independiente y demo pública: no disponibles en la información proporcionada.
