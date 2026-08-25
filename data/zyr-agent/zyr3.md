# zyr-AGENT/zyr3

## Resumen

ZYR3 es un sistema de agente de codificacion con IA que se presenta como un "multi-AI model": una interfaz unica que enruta cada tarea a uno de 34 modelos especializados, construida sobre GLM 5.3 mediante el SDK de Z.ai. No es un modelo con pesos propios en el sentido convencional, sino un sistema de ingenieria de prompts y enrutamiento que delega la inferencia a una API externa, sin requerir GPU local. El repositorio de HuggingFace no incluye pesos utilizables (solo un archivo legacy safetensors sin uso) y carga via `trust_remote_code`.

El proyecto resuelve el problema de la generacion de codigo, correccion de errores y automatizacion de ingenieria de software, anadiendo una capa de razonamiento ("ULTRA Coding Prompt"), especialistas por lenguaje, un sandbox microVM con ejecucion real de codigo y un bucle de auto-refinamiento de hasta 3 iteraciones. Su relevancia actual radica en que propone un enfoque de "agente de codigo" basado en una API, aunque su naturaleza cerrada y la dependencia de un servicio externo limitan su uso como modelo open source tradicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema de enrutado sobre GLM 5.3 (via Z.ai SDK); tipo declarado: gpt |
| Parametros totales | no disponible (los pesos no se distribuyen; el repo solo contiene un archivo safetensors legacy sin uso) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo base enrutado, p. ej. GLM 5.3) |
| Tipos de cuantizacion | no disponible (no se distribuyen pesos cuantizados; inferencia via API) |
| Idiomas soportados | ingles, chino (segun model card) |
| Licencia | ZYR3 Free Use License 1.0 (propietaria, cerrada; pesos no redistribuibles) |
| Formato de pesos | safetensors (legacy, no usado); el modelo se carga via codigo remoto (`modeling_zyr3.py`) |

## Arquitectura y entrenamiento

ZYR3 no es un modelo transformer entrenado desde cero, sino un sistema compuesto: un modulo de prompt engineering y enrutado que delega la generacion de texto a un conjunto de modelos base (GLM 5.3, GLM 4 Flash, Mistral, Codestral, etc.) accedidos mediante la API de Z.ai. El repositorio incluye un wrapper de Transformers (`modeling_zyr3.py`) que se comunica con la API, un tokenizador simple y un archivo de configuracion. No se publican detalles sobre el entrenamiento (datos, tokens, tecnicas de RLHF o DPO) porque el sistema no entrena pesos propios; el unico componente local es el prompt de sistema y la logica de enrutado.

La innovacion tecnica se centra en el bucle "Self-Refine Loop": el modelo genera codigo, lo ejecuta en un sandbox microVM basado en namespaces de Linux (`unshare`), lee los errores y reintenta hasta 3 veces. Ademas, el enrutador selecciona el modelo base optimo segun la tarea, lo que permite combinar capacidades de diferentes sistemas. No hay evidencia publica de que el modelo base haya sido afinado especificamente para este sistema; el prompt y el enrutado son la capa diferenciadora.

## Capacidades

- Generacion de codigo en multiples lenguajes (Python, Rust, TypeScript, Go, entre otros) mediante la inyeccion de prompts especializados por lenguaje.
- Razonamiento y resolucion de problemas de programacion: el sistema prompt "ULTRA Coding Prompt" induce un comportamiento de ingeniero senior.
- Ejecucion de codigo real en sandbox: el microVM permite comprobar si el codigo generado funciona, no solo generarlo.
- Bucle de auto-refinion: el sistema puede detectar errores de ejecucion, corregirlos y reejecutar hasta 3 iteraciones.
- Enrutado dinamico: selecciona el modelo base mas adecuado entre 34 opciones segun la tarea.
- Soporte de agentes: el sistema esta disenado para tareas de software engineering autonomas (revision de codigo, generacion de tests, correccion de bugs).
- Capacidades multilingues limitadas: ingles y chino.
- Etiquetado como multi-modal (video, 3D) en los tags, aunque no se documentan funciones concretas de vision o generacion de video/3D en la model card.

## Casos de uso

- Generacion de codigo en produccion: un desarrollador puede integrar ZYR3 en su IDE (VSCode extension) para generar funciones o modulos completos; el sistema ejecuta el codigo en sandbox y devuelve resultados validados, reduciendo el riesgo de errores silenciosos.
- Correccion de bugs automatizada: dado un fragmento que falla, el bucle Self-Refine ejecuta el codigo, detecta el error y propone una correccion, util en pipelines de CI/CD para triage automatico de fallos.
- Generacion de tests unitarios: el sistema puede generar casos de prueba y ejecutarlos contra el codigo, verificando que pasan en el sandbox, lo que ahorra tiempo en cobertura.
- Asistente de programacion en equipo: la extension de VSCode permite usar ZYR3 como pair programmer en tiempo real, con razonamiento paso a paso y ejecucion local del codigo.
- Revision de codigo: el modelo puede analizar un PR, detectar problemas de estilo o logica y sugerir cambios, apoyandose en la ejecucion para validar las propuestas.
- Automatizacion de tareas de software engineering: el sistema puede encargarse de tareas de refactorizacion o implementacion de funcionalidades simples, ejecutando el codigo y confirmando que cumple los requisitos funcionales.

## Benchmarks y rendimiento

Los unicos datos publicados son los benchmarks propios del autor, basados en 22 desafios de codificacion con ejecucion real en microVM (sin jueces LLM). Los resultados se presentan como comparativa entre ZYR3 y los modelos base enrutados.

### Resultados globales (22 desafios, 5 modelos)

| Modelo | Desafios superados | Puntuacion |
|---|---|---|
| ZYR3 | 18/22 | 82% |
| GLM 4 Flash | 16/22 | 73% |
| GLM 5.2 | 14/22 | 64% |
| Mistral Large | 14/22 | 64% |
| Codestral | 14/22 | 64% |

### Desafios SWE Pro Terminal (depuracion iterativa, el nivel mas duro)

| Desafio | ZYR3 | GLM 5.2 | GLM 4 Flash | Mistral | Codestral |
|---------|------|---------|-------------|---------|-----------|
| REST API Server | ✅ iter=2 | ❌ | ❌ | ❌ | ❌ |
| Auth System | ✅ iter=1 | ✅ iter=1 | ✅ iter=1 | ❌ | ❌ |
| State Machine | ✅ iter=3 | ✅ iter=3 | ✅ iter=3 | ❌ | ❌ |
| File Watcher | ✅ iter=2 | ✅ iter=1 | ✅ iter=1 | ✅ iter=1 | ✅ iter=1 |
| Cache TTL | ❌ | ❌ | ✅ iter=1 | ❌ | ❌ |
| Observer | ❌ | ❌ | ❌ | ❌ | ❌ |
| Message Queue | ❌ | ❌ | ❌ | ❌ | ❌ |

Nota: estos resultados no han sido verificados de forma independiente y reflejan la metodologia del autor. No se publican datos de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- No requiere GPU local: la inferencia se delega a la API de ZYR3 (o Z.ai), por lo que el despliegue se limita a un servidor con Python y la libreria Transformers.
- El repositorio incluye un archivo `zyr-22/model.safetensors` legacy que no se utiliza para inferencia; no se especifican requisitos de VRAM para ese archivo.
- Para uso local del sandbox microVM, se necesita un sistema Linux con soporte de namespaces de usuario (`unshare`) y permisos adecuados.
- Opciones de despliegue: Transformers con `trust_remote_code=True`, vLLM (con `--trust-remote-code`), o la extension VSCode. En todos los casos, el modelo real se ejecuta en el servidor de la API, no en local.
- Latencia y throughput: no disponibles; dependen de la API externa y de la latencia de red.

## Comparativa con modelos similares

La comparativa se basa en los modelos que el sistema enruta y que aparecen en los benchmarks propios. No se dispone de especificaciones publicas de esos modelos (parametros, contexto, licencia) en la informacion disponible.

| Caracteristica | ZYR3 | GLM 4 Flash | GLM 5.2 | Mistral Large | Codestral |
|---------------|------|-------------|---------|---------------|-----------|
| Tipo | Sistema de enrutado + prompts | Modelo base (via API) | Modelo base (via API) | Modelo base (via API) | Modelo base (via API) |
| Acceso a pesos | No (propietario, cerrado) | No disponible | No disponible | No disponible | No disponible |
| Ejecucion de codigo | Si (microVM sandbox) | No (segun model card) | No (segun model card) | No (segun model card) | No (segun model card) |
| Bucle de auto-refinion | Si (hasta 3 iteraciones) | No | No | No | No |
| Licencia | ZYR3 Free Use License 1.0 | No disponible | No disponible | No disponible | No disponible |
| Resultados en 22 desafios | 82% | 73% | 64% | 64% | 64% |

No hay comparativa con otros sistemas de agentes de codigo (como GitHub Copilot, Codex CLI, etc.) en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo no es de codigo abierto: los pesos son propietarios y cerrados; la licencia ZYR3 Free Use License 1.0 permite uso comercial pero prohíbe la redistribucion, la modificacion para reventa y la creacion de obras derivadas con fines de redistribucion.
- Dependencia total de la API externa: la inferencia se delega a un servicio de terceros, lo que implica dependencia de la disponibilidad de la API, latencia de red, y posible registro de datos en el servidor del proveedor.
- Riesgo de seguridad: se ha publicado un aviso de seguridad (OSSF:MAL-2026-13471) sobre el paquete npm `zyr-agent`, que indica que el proveedor "gratuito" por defecto enruta las completaciones de chat a una direccion codificada (hardcoded). Esto sugiere un riesgo potencial de exfiltracion de datos o de comportamiento malicioso; se recomienda extremar la precaucion antes de usar el sistema en entornos de produccion.
- Sesgos y alucinaciones: al ser un sistema de enrutado sobre modelos base, hereda los sesgos y riesgos de alucinacion de los modelos subyacentes (GLM, Mistral, etc.), sin que el autor ofrezca evaluaciones independientes de estos aspectos.
- Limitaciones de contexto: la longitud de contexto no se especifica y depende del modelo base enrutado; no hay garantia de soporte para secuencias largas en todas las tareas.
- Idiomas: solo ingles y chino, sin soporte declarado para espanol u otros idiomas.
- Los benchmarks presentados son del autor, con metodologia propia, y no estan verificados por terceros; no hay datos de benchmarks estandar (MMLU, HumanEval, etc.) que permitan comparaciones objetivas con otros modelos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/zyr-AGENT/zyr3
- Perfil del autor en HuggingFace: https://huggingface.co/zyr-ai
- Perfil del autor en GitHub: https://github.com/zyr-ai
- Repositorio GitHub (agentcore, biblioteca Go para agentes): https://github.com/zyr-ai/agentcore
- Aviso de seguridad (Vulners): https://vulners.com/ossf/OSSF:MAL-2026-13471
