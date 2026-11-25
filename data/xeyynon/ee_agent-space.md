# xeyynon/ee_agent-space

## Resumen

`xeyynon/ee_agent-space` es un repositorio de Hugging Face que no contiene pesos de un modelo propio, sino el backend de una aplicacion (un "Space" de Gradio con FastAPI) para una extension de Chrome denominada Booking Agent. El autor es `xeyynon` y el artefacto publicado el 25 de noviembre de 2026 no registra descargas ni likes. Su funcion es servir de puente entre la extension del navegador y un modelo Gemma 4 descargado bajo demanda desde el Hugging Face Hub, de modo que el usuario final no necesita claves de API de terceros ni tarjeta de credito.

El backend, por defecto, descarga y ejecuta localmente `ggml-org/gemma-4-E2B-it-GGUF` (fichero `gemma-4-E2B-it-Q4_0.gguf`, aproximadamente 2,84 GB) mediante `llama-cpp-python`, con una ventana de contexto por defecto de 8192 tokens. Ofrece varios modos de ejecucion (`hf-gguf`, `hf-transformers`, `local-openai`, `google-ai-studio`) y un sistema de control de acceso basado en codigos de invitacion de un solo uso declarados como variable de entorno.

La relevancia de este repositorio es, por tanto, la de una plantilla de despliegue de bajo coste para un agente conversacional de reservas: permite arrancar en el plan gratuito de Hugging Face Spaces (2 vCPU, 16 GB, sin GPU) o en hardware propio con aceleracion, y expone el servicio a la extension mediante una URL publica o un tunel de Cloudflare. No debe confundirse con una ficha de modelo: el modelo subyacente es Gemma 4 E2B, cuyas especificaciones completas no se detallan en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene un backend FastAPI + Gradio; el modelo subyacente es Gemma 4 E2B, arquitectura no detallada en la informacion) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 8192 tokens por defecto (`HF_CTX_SIZE`) |
| Tipos de cuantizacion | Q4_0 (fichero `gemma-4-E2B-it-Q4_0.gguf`, ~2,84 GB); otros no disponibles |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (via `ggml-org/gemma-4-E2B-it-GGUF`); tambien soporta `hf-transformers` con `google/gemma-4-E2B-it` |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo: es una capa de servicio. El backend combina una API FastAPI con una interfaz Gradio (`sdk_version: 5.29.0`, `app_file: app.py`) y abstrae cuatro backends de inferencia seleccionables mediante la variable `MODEL_BACKEND`: `hf-gguf` (descarga un GGUF del Hub y lo ejecuta con `llama-cpp-python`), `hf-transformers` (carga `google/gemma-4-E2B-it` con Transformers, pensado para ZeroGPU), `local-openai` (delega en un endpoint compatible con la API de OpenAI, por ejemplo `llama-server` en `http://127.0.0.1:8080/v1`) y `google-ai-studio` (requiere `GEMINI_API_KEY`, opcional).

La logica de seleccion es automatica: sin clave de Gemini configurada, el servidor descarga `ggml-org/gemma-4-E2B-it-GGUF` en la primera peticion y lo ejecuta en local. El control de acceso se implementa con `INVITE_CODES` (lista separada por comas de codigos de un solo uso) y `ALLOWED_ORIGINS` para restringir el origen CORS a la extension publicada en Chrome Web Store. El repositorio permite sobrescribir el modelo (`HF_MODEL_REPO`, `HF_MODEL_FILE`), usar pesos ya descargados (`LOCAL_MODEL_PATH`) y ajustar el numero de capas descargadas a GPU (`HF_N_GPU_LAYERS`, con `-1` para todas). No se documentan datos de entrenamiento, composicion del dataset ni tecnicas de alineacion (RLHF/DPO) del modelo Gemma 4 subyacente.

## Capacidades

- Servicio HTTP compatible con la API de OpenAI a traves de `LOCAL_LLM_URL`, lo que permite enchufar cualquier cliente que hable ese protocolo.
- Ejecucion local del modelo sin claves de API externas ni tarjeta de credito, con descarga automatica de pesos GGUF desde el Hub.
- Seleccion dinamica de backend de inferencia (`hf-gguf`, `hf-transformers`, `local-openai`, `google-ai-studio`) mediante variables de entorno.
- Control de acceso por codigos de invitacion de un solo uso (`INVITE_CODES`) y restriccion CORS por origen (`ALLOWED_ORIGINS`).
- Interfaz Gradio integrada para depuracion y uso directo desde el navegador.
- Soporte de despliegue en Hugging Face Spaces (CPU basico gratuito o ZeroGPU) y en hardware propio con `llama-cpp-python` o `llama-server`.
- Exposicion publica mediante Cloudflare Tunnel (`cloudflared tunnel --url http://localhost:7860`) sin coste.
- Capacidades conversacionales concretas (reserva de viajes, tool calling, agentes multi-paso) no disponibles en la informacion: dependen del modelo Gemma 4 E2B subyacente, cuyas habilidades no se detallan.

## Casos de uso

- Backend de una extension de Chrome para reservas: la extension envia peticiones al endpoint desplegado y el servidor responde con el modelo Gemma 4 ejecutandose en local, sin que el usuario final tenga que configurar claves de API.
- Prototipado rapido en el plan gratuito de Hugging Face Spaces: con 2 vCPU y 16 GB, el autor advierte de que la primera descarga tarda 1-2 minutos y cada paso de CPU entre 15 y 45 segundos, suficiente para validar el flujo de la extension antes de invertir en GPU.
- Despliegue en hardware propio con aceleracion: `HF_N_GPU_LAYERS=-1` descarga todas las capas a GPU y elimina las cuotas y el "sleep" de los Spaces gratuitos, adecuado para demos en directo o uso interno.
- Integracion con un servidor `llama-server` externo: arrancando `llama serve -hf ggml-org/gemma-4-E4B-it-GGUF` y apuntando `LOCAL_LLM_URL` a `http://127.0.0.1:8080/v1`, se reutiliza una infraestructura de inferencia ya existente y se mantiene el control de invitaciones y CORS del backend.
- Distribucion controlada a usuarios beta: los codigos de `INVITE_CODES` permiten dar acceso a un conjunto cerrado de probadores (por ejemplo `TRAVEL-2026-01,TRAVEL-2026-02`) sin exponer el endpoint a trafico anonimo.
- Publicacion en Chrome Web Store: tras fijar `ALLOWED_ORIGINS=chrome-extension://<id-publicado>` y compilar la extension con `VITE_BACKEND_URL` apuntando a la URL del Space o del tunel, el backend queda listo para produccion ligera.
- Entorno de evaluacion de modelos Gemma 4: cambiando `HF_MODEL_REPO` entre `gemma-4-E2B-it-GGUF` y `gemma-4-E4B-it-GGUF` se compara el comportamiento de ambas variantes sobre el mismo flujo de reservas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos de rendimiento son operativos: en el plan gratuito de Hugging Face Spaces (2 vCPU, sin GPU), la primera peticion incluye una descarga de modelo de 1-2 minutos y cada paso de inferencia en CPU tarda aproximadamente entre 15 y 45 segundos. No se proporcionan cifras de latencia ni throughput para ejecucion en GPU.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el fichero GGUF por defecto ocupa aproximadamente 2,84 GB, por lo que la inferencia en GPU requiere al menos ese espacio mas el overhead de contexto (8192 tokens).
- Plan gratuito de Hugging Face Spaces: 2 vCPU y 16 GB de RAM, sin GPU; suficiente para ejecucion funcional pero lenta (15-45 s por paso).
- ZeroGPU: soportado si la cuenta personal es elegible y se usa `MODEL_BACKEND=hf-transformers` con `google/gemma-4-E2B-it`.
- GPU recomendadas: no disponibles en la informacion. El repositorio menciona `HF_N_GPU_LAYERS=-1` para descargar todas las capas a GPU y cita Apple Silicon como plataforma valida para ejecucion local.
- Opciones de despliegue: `llama-cpp-python` (backend por defecto), `llama-server` (`llama serve -hf ...`), Transformers con `google/gemma-4-E2B-it`, endpoint compatible con OpenAI via `LOCAL_LLM_URL`, y Google AI Studio como alternativa opcional con `GEMINI_API_KEY`.
- Exposicion publica: Cloudflare Tunnel gratuito (`cloudflared tunnel --url http://localhost:7860`) para servir el backend local sin abrir puertos.
- Latencia y throughput: solo documentados para CPU basica de HF Spaces (15-45 s por paso); no hay datos para GPU.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de modelos alternativos ni metricas comparables. El unico punto de comparacion interno es la eleccion entre las variantes Gemma 4 E2B y E4B del mismo proveedor, que el autor sugiere segun la potencia de la maquina (`gemma-4-E4B-it-GGUF` en equipos mas rapidos), sin cifras de rendimiento asociadas.

## Limitaciones y advertencias

- El repositorio no publica licencia, idiomas ni pipeline; la licencia del modelo Gemma 4 subyacente no se detalla en la model card y debe verificarse en el repositorio `ggml-org/gemma-4-E2B-it-GGUF` antes de cualquier uso comercial.
- El rendimiento en el plan gratuito de Hugging Face Spaces es bajo: 15-45 segundos por paso de inferencia en CPU y 1-2 minutos de descarga inicial, lo que hace inviable una experiencia conversacional fluida sin GPU.
- Los Spaces gratuitos entran en suspension por inactividad; el autor recomienda el despliegue local con tunel para evitarlo.
- El control de acceso por `INVITE_CODES` es un mecanismo sencillo de un solo uso; no se documentan rotacion, caducidad ni limitacion de tasa, por lo que no debe considerarse una capa de seguridad robusta.
- La validacion CORS depende de configurar correctamente `ALLOWED_ORIGINS` con el ID publicado de la extension; una configuracion laxa expone el backend a cualquier origen.
- No hay informacion sobre sesgos, riesgo de alucinacion ni limitaciones idiomaticas del modelo Gemma 4 E2B en esta model card.
- El repositorio tiene 0 descargas y 0 likes y fue creado y actualizado el mismo dia (25 de noviembre de 2026), sin historial de mantenimiento ni comunidad que lo respalde.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/xeyynon/ee_agent-space
- Modelo GGUF por defecto: https://huggingface.co/ggml-org/gemma-4-E2B-it-GGUF
- Variante mayor citada: https://huggingface.co/ggml-org/gemma-4-E4B-it-GGUF
- Modelo en formato Transformers citado: https://huggingface.co/google/gemma-4-E2B-it
- Creacion de Spaces: https://huggingface.co/new-space
- Documentacion de Cloudflare Tunnel: no disponible en la informacion (el comando citado es `cloudflared tunnel --url http://localhost:7860`)
