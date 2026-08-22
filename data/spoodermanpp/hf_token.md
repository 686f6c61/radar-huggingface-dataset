# spoodermanpp/HF_TOKEN

## Resumen

El repositorio `spoodermanpp/HF_TOKEN` aloja en realidad el proyecto **HuggingClaw**, una solución de despliegue que permite ejecutar **OpenClaw**, un asistente de IA open source, en la infraestructura gratuita de HuggingFace Spaces. No se trata de un modelo de lenguaje con pesos propios, sino de un contenedor Docker que orquesta un agente conversacional conectable a más de 40 canales (WhatsApp, Telegram, etc.) y que puede usar cualquier LLM externo como backend (OpenAI, Claude, Gemini, OpenRouter u Ollama).

El proyecto resuelve dos limitaciones concretas de HuggingFace Spaces: la pérdida de datos al reiniciar (solucionada mediante sincronización con datasets de HF) y los fallos de DNS para ciertos dominios como WhatsApp (solucionada mediante DNS-over-HTTPS). Además, incluye un ecosistema denominado "HuggingClaw World" con múltiples agentes autónomos que se comunican entre sí mediante el protocolo A2A.

La relevancia actual radica en que ofrece un asistente de IA gratuito y siempre disponible sin necesidad de hardware propio, con despliegue en un clic y licencia MIT. El repositorio fue creado el 22 de agosto de 2026, tiene 0 descargas y 0 likes, y su tamaño es de 0.0 GB. Al ser un proyecto de infraestructura y no un modelo de lenguaje, los parámetros técnicos típicos de un LLM (arquitectura, parámetros, contexto) no son aplicables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplicable (proyecto de despliegue de OpenClaw, no es un modelo de lenguaje) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del LLM backend configurado) |
| Tipos de cuantizacion | no disponible (depende del LLM backend configurado) |
| Idiomas soportados | no disponible (el agente es bilingüe EN/ZH según la model card; el LLM backend determina los idiomas reales) |
| Licencia | MIT |
| Formato de pesos | no aplicable (imagen Docker, no contiene pesos de modelo) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado. Es un proyecto de software que empaqueta **OpenClaw** (un asistente de IA open source que normalmente requiere una máquina propia, por ejemplo un Mac Mini) en un contenedor Docker desplegable en HuggingFace Spaces. La arquitectura del proyecto se compone de un contenedor que ejecuta OpenClaw, un sistema de persistencia de datos vía datasets de HuggingFace, y un mecanismo de DNS-over-HTTPS para sortear bloqueos de dominio.

No hay datos de entrenamiento, tokens de entrenamiento ni técnicas de ajuste como RLHF o DPO. El proyecto se apoya en un dataset referenciado (`tao-shen/HuggingClaw-data`) que almacena los datos de conversación y configuración de los agentes desplegados, pero no se trata de un dataset de entrenamiento de un modelo.

El ecosistema «HuggingClaw World» añade una capa multi-agente: cada agente (God, Adam, Eve, Cain) corre en su propio Space, se comunica con los demás mediante el protocolo **A2A (Agent-to-Agent)**, y es supervisado por un coordinador Python (`scripts/conversation-loop.py`). Los agentes tienen personalidades definidas en archivos SOUL.md, memoria persistente y la capacidad de crear nuevos agentes (Cain fue creado por Adam y Eve).

## Capacidades

- **Despliegue de un asistente de IA gratuito y siempre activo**: el contenedor se ejecuta en Hugging Face Spaces con 2 vCPU y 16 GB de RAM, sin coste.
- **Integración multi-canal**: conexión con WhatsApp, Telegram y más de 40 canales adicionales, incluyendo canales que Hugging Face Spaces normalmente bloquea.
- **Backend de LLM intercambiable**: funciona con OpenAI, Claude, Gemini, OpenRouter (más de 200 modelos, con tier gratuito) o un Ollama propio.
- **Persistencia de datos**: las conversaciones, ajustes y credenciales sobreviven a los reinicios gracias a la sincronización con datasets de Hugging Face.
- **Agentes autónomos multi-agente**: los agentes del ecosistema HuggingClaw World se comunican entre sí via protocolo A2A, se monitorizan mutuamente, se diagnostican errores y se delegan tareas de código mediante bloques `[TASK]`.
- **Automejora**: el agente «God» supervisa el orquestador y puede corregir de forma autónoma la configuración y el código de los demás agentes.
- **API compatible con OpenAI**: expone una interfaz OpenAI-compatible para su integración con otras herramientas.
- **Despliegue en un clic**: basta con duplicar el Space y configurar dos secretos.

## Casos de uso

- **Asistente personal multiplataforma gratuito**: un usuario puede desplegar HuggingClaw en un Space y conectar su WhatsApp y Telegram para tener un asistente que responde desde cualquier canal, sin coste de infraestructura y sin necesidad de un servidor propio.
- **Bot de atención al cliente en canales de mensajería**: una pequeña empresa puede configurar el agente con un LLM de OpenRouter para gestionar consultas de clientes por WhatsApp o Telegram, aprovechando la persistencia para mantener el historial de cada conversación entre reinicios.
- **Orquestador de agentes autónomos para experimentación**: investigadores y desarrolladores pueden usar el ecosistema HuggingClaw World para estudiar el comportamiento de agentes que se comunican entre sí, se delegan tareas y evolucionan sus capacidades de forma autónoma, observándolo en tiempo real mediante el dashboard pixel-art.
- **Prueba de integración de protocolo A2A**: el proyecto incluye una implementación de referencia del protocolo A2A v0.3.0, útil para evaluar la interoperabilidad entre agentes de distintos proveedores.
- **Entorno de pruebas para agentes con memoria persistente**: los desarrolladores pueden experimentar con la memoria de OpenClaw (SOUL.md, sistema de memoria) sin necesidad de tener una máquina local dedicada, ya que la persistencia se resuelve vía datasets de Hugging Face.
- **Infraestructura de bajo coste para prototipos de agentes**: cualquier investigador puede desplegar un agente con privilegios de sistema completos en un contenedor aislado de Hugging Face Spaces, lo que reduce el riesgo de seguridad frente a ejecutarlo en una máquina local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este proyecto no es un modelo de lenguaje y, por tanto, no tiene métricas de rendimiento propias como MMLU, HumanEval o GSM8K. El rendimiento real depende del LLM backend que se configure (OpenAI, Claude, etc.).

## Requisitos de hardware

- **Recursos mínimos**: 2 vCPU y 16 GB de RAM (el tier gratuito de Hugging Face Spaces). No se necesita GPU.
- **GPU**: no se requiere GPU para el despliegue del contenedor.
- **Hardware local**: ninguno. El proyecto se ejecuta en la infraestructura de Hugging Face Spaces.
- **Opciones de despliegue**: Hugging Face Spaces (Docker), o localmente si se prefiere autohospedado (requiere una máquina con Docker y los recursos necesarios para OpenClaw).
- **Latencia y throughput**: no disponible. Depende del backend de LLM y de la red de Hugging Face Spaces.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de lenguaje, sino una solución de despliegue de agentes. No existen modelos comparables en la categoría de LLM, y no hay alternativas directas en el mismo repositorio. Como proyecto, su competidor más cercano sería ejecutar OpenClaw en una máquina local o en otros proveedores de contenedores gratuitos, pero no hay datos cuantitativos comparables.

## Limitaciones y advertencias

- **No es un modelo de lenguaje**: no contiene pesos ni arquitectura de red neuronal. Su funcionalidad depende de un LLM externo, lo que implica costes de API (salvo tier gratuito de OpenRouter) y latencia de red.
- **Dependencia de Hugging Face Spaces**: la disponibilidad del servicio depende de la infraestructura gratuita de Hugging Face, que puede tener límites de uso, políticas cambiantes o interrupciones.
- **Riesgo de alucinación**: los agentes heredan las alucinaciones y sesgos del LLM backend que se configure. El proyecto no añade ninguna capa de verificación de hechos.
- **Seguridad**: aunque el contenedor aislado reduce el riesgo de ejecutar OpenClaw con privilegios completos, los agentes autónomos pueden modificar código y configuraciones de forma automática, lo que implica un riesgo de comportamientos inesperados o de cambios no deseados en el sistema.
- **Sesgos conocidos**: no se ha documentado ningún análisis de sesgos específico para HuggingClaw. Los sesgos dependerán del LLM backend.
- **Idiomas**: el dashboard es bilingüe (EN/ZH), pero los idiomas soportados para conversación dependen del LLM backend.
- **Licencia**: MIT, lo que permite uso comercial y modificación libre, pero el proyecto depende de componentes de terceros (OpenClaw, Hugging Face Spaces, protocolo A2A) con sus propias licencias y condiciones de uso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/spoodermanpp/HF_TOKEN
- Space principal de HuggingClaw: https://huggingface.co/spaces/tao-shen/HuggingClaw
- Space del agente «Home»: https://huggingface.co/spaces/tao-shen/HuggingClaw-Home
- Space del agente «Adam»: https://huggingface.co/spaces/tao-shen/HuggingClaw-Adam
- Space del agente «Eve»: https://huggingface.co/spaces/tao-shen/HuggingClaw-Eve
- Space del agente «Cain»: https://huggingface.co/spaces/tao-shen/HuggingClaw-Cain
- Repositorio GitHub de HuggingClaw: https://github.com/tao-shen/HuggingClaw
- Repositorio de OpenClaw: https://github.com/openclaw/openclaw
- Pasarela A2A de OpenClaw: https://github.com/win4r/openclaw-a2a-gateway
- Documentación de variables de entorno de OpenClaw: https://openclawdoc.com/docs/reference/environment-variables
- Dataset de datos de HuggingClaw: https://huggingface.co/datasets/tao-shen/HuggingClaw-data
