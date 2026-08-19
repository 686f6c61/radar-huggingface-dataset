# tencent/UI-Mate-9B

## Resumen

UI-Mate-9B es un agente GUI multimodal de codigo abierto desarrollado por Tencent HY Frontier (equipo de agentes multimodales). Se trata de un checkpoint de agente, no de un modelo conversacional al uso: observa capturas de pantalla en tiempo real, razona sobre el estado visible de la interfaz y produce acciones estructuradas de teclado y raton para interactuar con aplicaciones de escritorio nativas. Esta construido sobre el modelo base Qwen3.5-9B y ha sido entrenado mediante fine-tuning supervisado seguido de aprendizaje por refuerzo online en entornos GUI ejecutables.

El modelo resuelve el problema de la automatizacion de tareas de escritorio de larga duracion (long-horizon) sin depender de coordenadas predefinidas ni de scripts fijos. Su relevancia actual radica en que ofrece una alternativa eficiente (9B parametros) a los grandes modelos propietarios de computer use, con una licencia Apache-2.0 que permite uso comercial y una integracion sencilla con vLLM y pyautogui. Ademas, incorpora un modo novedoso de ejecucion guiada por demostraciones: el agente puede extraer un flujo de trabajo reutilizable a partir de una unica demostracion exitosa y adaptarlo a nuevas tareas, replanificando en funcion de la interfaz viva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer basado en Qwen3.5-9B |
| Parametros totales | 9B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no especificada; el agente mantiene 5 capturas de pantalla en contexto (requiere admitir al menos 6 imagenes por prompt en vLLM) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

UI-Mate-9B se basa en Qwen3.5-9B, un modelo multimodal de lenguaje y vision de la familia Qwen. La arquitectura es un transformer de vision-language que procesa simultaneamente la instruccion de tarea en lenguaje natural, capturas de pantalla, historial de interacciones y, opcionalmente, un contexto de demostracion. La salida se compone de tres partes: razonamiento, descripcion concisa de la accion y llamadas a herramientas estructuradas para computer use.

El entrenamiento combina dos fases: primero un fine-tuning supervisado (SFT) sobre datos de interaccion GUI, y posteriormente un aprendizaje por refuerzo online en entornos GUI ejecutables, lo que permite al modelo optimizar directamente la tasa de exito de las tareas. El espacio de acciones incluye raton, teclado, scroll, espera, interaccion con el usuario y finalizacion de tarea. El modelo razona en un espacio de coordenadas normalizado de 1000x1000, que el agente de referencia reescala automaticamente a la resolucion original de la captura.

## Capacidades

- Generacion de acciones estructuradas de computer use: raton, teclado, scroll, espera, peticion de ayuda al usuario y finalizacion de tarea.
- Razonamiento sobre capturas de pantalla en tiempo real para grounding visual de la interfaz, sin depender de coordenadas preprogramadas.
- Ejecucion de tareas de larga duracion que requieren multiples pasos y cambios de aplicacion.
- Modo de ejecucion guiada por demostraciones: extrae un flujo de trabajo a partir de una unica demostracion y lo adapta a nuevas tareas, replanificando segun el estado real de la interfaz.
- Soporte de tool calling estructurado, compatible con el formato OpenAI y con pyautogui para la ejecucion de acciones.
- Interaccion con el usuario cuando la tarea lo requiere (por ejemplo, pedir confirmacion o informacion adicional).
- Capacidades multilingues no especificadas; se asume herencia parcial del modelo base Qwen3.5-9B, aunque no hay datos oficiales.

## Casos de uso

- Automatizacion de tareas de oficina repetitivas: por ejemplo, exportar una hoja de calculo a HTML y abrirla en un navegador, o reorganizar archivos en el escritorio siguiendo una instruccion en lenguaje natural.
- Asistencia en instalacion y configuracion de software: el agente puede navegar por menus, pulsar botones y rellenar formularios para instalar extensiones (por ejemplo, autoDocstring en VS Code) o configurar aplicaciones.
- Pruebas funcionales de aplicaciones de escritorio: ejecutar flujos de interaccion sobre la interfaz real y verificar que las acciones producen los resultados esperados, util en pipelines de QA.
- Automatizacion de flujos de trabajo con demostraciones: grabar una unica demostracion de un proceso (por ejemplo, generar un informe mensual) y reutilizar el flujo extraido para ejecutar tareas similares con datos o estados diferentes.
- Asistencia a usuarios con discapacidad o movilidad reducida: el modelo puede traducir instrucciones de alto nivel en acciones fisicas de raton y teclado, facilitando el uso de aplicaciones complejas.
- Integracion en entornos de virtualizacion o contenedores para pruebas automatizadas de GUI en sistemas operativos Windows o Linux, mediante el harness oficial del repositorio UI-Mate.

## Benchmarks y rendimiento

Se han publicado resultados en tres benchmarks de computer use, todos con el modelo en modo de ejecucion por instrucciones (sin demostraciones):

| Benchmark | UI-Mate-9B |
| --- | ---: |
| OSWorld-Verified (puntuacion media) | 66.2 |
| WindowsAgentArena (puntuacion media) | 61.7 |
| OSWorkerBench (exito estricto) | 34.00 |
| OSWorkerBench (progreso) | 66.55 |

No se han publicado comparaciones directas con otros modelos en la informacion disponible. Los resultados indican un rendimiento solido para un modelo de 9B en tareas de computer use, aunque la fiabilidad en entornos arbitrarios no esta garantizada.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 9B parametros. En FP16, los pesos ocupan aproximadamente 18 GB, mas el encoder visual y los estados intermedios. Se recomienda una GPU con al menos 24 GB de VRAM para inferencia comoda con el ejemplo oficial de vLLM (gpu-memory-utilization 0.85).
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 40 GB, H100 80 GB, o equivalentes con soporte de precision FP16/BF16.
- En GPU de consumo, cabe en una RTX 4090 o RTX 3090 (24 GB) con cuantizacion, aunque no se proporcionan pesos cuantizados oficiales. En una RTX 4080 (16 GB) seria necesario cuantizar a 8 bits o reducir el numero de capturas en contexto.
- Opciones de despliegue: vLLM es el servidor recomendado oficialmente (con soporte OpenAI-compatible). Tambien puede usarse el agente Python del repositorio UI-Mate, que se conecta al endpoint de vLLM. No hay soporte oficial documentado para llama.cpp u Ollama.
- Latencia y throughput: no se han publicado datos oficiales. Con tensor-parallel-size 1 y una GPU de 24 GB, se espera una latencia de decodificacion tipica de un modelo de 9B multimodal, del orden de 20-40 tokens/s en hardware moderno, aunque depende del numero de imagenes en contexto.

## Comparativa con modelos similares

No se dispone de datos publicados de otros modelos de agente GUI de codigo abierto comparables en los mismos benchmarks (OSWorld, WindowsAgentArena) en la informacion proporcionada. Como referencia cualitativa, UI-Mate-9B se posiciona frente a alternativas como UI-TARS (de ByteDance) o modelos propietarios como Claude computer use, pero no hay metricas comparables disponibles. Se recomienda consultar el proyecto UI-Mate para actualizaciones de evaluacion.

## Limitaciones y advertencias

- El comportamiento puede verse afectado por versiones de aplicaciones, diseños de pantalla, escalado de visualizacion, latencia y estados inesperados de la interfaz.
- El modelo requiere un runtime externo (pyautogui u otro) para ejecutar las acciones predichas; no es autonomo por si solo.
- Riesgo de prompt injection: las capturas de pantalla pueden contener instrucciones maliciosas que el modelo podria seguir.
- Las acciones pueden tener consecuencias irreversibles (borrado de archivos, envio de mensajes, etc.). Se recomienda usar entornos aislados o desechables y supervisar el proceso.
- No se recomienda su uso en flujos de trabajo no supervisados, de alto riesgo o destructivos.
- El rendimiento en benchmarks no garantiza una ejecucion fiable en entornos arbitrarios; la generalizacion a aplicaciones o resoluciones no vistas puede degradarse.
- No hay informacion sobre sesgos linguisticos o culturales; el modelo base Qwen3.5-9B puede heredar sesgos del corpus de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye como checkpoint de agente, no como modelo conversacional; su uso requiere el harness oficial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/UI-Mate-9B
- Pagina del proyecto: https://ui-mate.github.io/
- Repositorio GitHub: https://github.com/Tencent/UI-Mate
- Coleccion de modelos UI-Mate en Hugging Face: https://huggingface.co/collections/tencent/ui-mate
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
