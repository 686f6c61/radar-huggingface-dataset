# Thengbeo/titi-models

## Resumen

`Thengbeo/titi-models` no es un modelo de lenguaje en sí, sino un repositorio de coordinación (aproximadamente 50 KB) que actúa como servidor multi-modelo para el ecosistema TiTi AI. El autor, Thengbeo, lo publica como punto central desde el que se descargan y cargan dinámicamente los pesos de distintos modelos de la familia (`titi-genesis`, `titi-g2`, `titi-g2.1`, `titi-moe`, `titi-vision`, `titi-bot`), que residen en repositorios de Hugging Face independientes.

El componente principal es `titi_server.py`, un script que se ejecuta en Google Colab, Akash, RunPod o Mac Studio, carga uno o varios modelos en la GPU disponible y los expone mediante una API compatible con OpenAI en `https://api.titi.ai.vn`. El repositorio incluye un `models.json` que mapea nombres de modelo a repositorio, checkpoint y tokenizador, y permite cargar o descargar modelos en caliente sin reiniciar el servidor.

La relevancia de este repositorio es fundamentalmente operativa: no aporta pesos ni arquitectura propia, sino una capa de orquestación y despliegue. Cualquier evaluación técnica del modelo subyacente debe hacerse sobre los repositorios individuales de cada generación, ya que la model card de `titi-models` no describe arquitectura, parámetros, contexto ni datos de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de coordinación, no contiene pesos) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene `titi_server.py` y `models.json`; los pesos se alojan en repositorios separados) |

## Arquitectura y entrenamiento

No se dispone de información sobre arquitectura de red, composición del dataset, número de tokens de entrenamiento ni procesos de alineación (RLHF, DPO) en la información proporcionada. El repositorio `Thengbeo/titi-models` no contiene pesos ni código de entrenamiento: es una utilidad de despliegue que orquesta la carga de modelos alojados en otros repositorios (`Thengbeo/titi-genesis`, `Thengbeo/titi-vision`, `Thengbeo/titi-bot`, entre otros).

La innovación técnica documentada es de infraestructura: carga multi-modelo concurrente en una sola GPU, carga y descarga en caliente vía API administrativa (`/admin/models/load` y `/admin/models/unload`), autenticación mediante un token de Hugging Face que desbloquea un repositorio privado de secretos (`Thengbeo/titi-infra-secrets`) del que se obtienen `CF_TUNNEL_TOKEN` y `TITI_API_KEY`, y exposición pública mediante un túnel de Cloudflare. El servidor admite selección interactiva de modelo por nombre o índice, carga por lotes con `--models` y carga completa con `all`.

## Capacidades

- Orquestación de múltiples modelos TiTi en una sola GPU, con carga selectiva por nombre o índice numérico.
- Carga en caliente de nuevos modelos mediante `POST /admin/models/load` sin reiniciar el servidor.
- Descarga de modelos de la VRAM mediante `POST /admin/models/unload` para liberar memoria.
- Endpoint compatible con OpenAI: `POST /v1/chat/completions` con selección de modelo por campo `"model"`.
- Listado de modelos activos mediante `GET /v1/models`.
- Endpoint de salud `GET /health` con información de GPU, modelos en ejecución y catálogo disponible.
- Endpoint de evaluación por lotes `POST /v1/titi/batch` para benchmarking rápido por modelo.
- Despliegue en Google Colab, Akash, RunPod y Mac Studio mediante un único comando.
- Las capacidades concretas de generación, razonamiento, código, matemáticas, visión, tool calling o multilingüismo dependen de cada modelo subyacente y no están documentadas en este repositorio.

## Casos de uso

- Despliegue rápido de un endpoint compatible con OpenAI en Google Colab: ejecutar el comando de una línea clona el repositorio, solicita el token y el modelo, y levanta el servidor accesible vía `api.titi.ai.vn`; útil para prototipado sin infraestructura propia.
- Servicio multi-modelo en una sola GPU: cargar simultáneamente `titi-genesis` y `titi-g2` con `titi-genesis, titi-g2` permite enrutar peticiones por caso de uso sin aprovisionar varias máquinas.
- Conmutación dinámica de modelos en producción: usar `/admin/models/unload` y `/admin/models/load` para sustituir el modelo en VRAM según la demanda, sin reiniciar el proceso ni cortar el endpoint.
- Integración con clientes compatibles con la API de OpenAI: cualquier SDK o herramienta que apunte a `/v1/chat/completions` puede consumir los modelos TiTi cambiando únicamente la URL base y la clave.
- Evaluación comparativa de la familia TiTi: el endpoint `/v1/titi/batch` permite lanzar benchmarks por lotes contra distintos modelos del catálogo desde un mismo servidor.
- Ampliación del catálogo sin tocar código: añadir una entrada en `models.json` con nombre, `repo`, `ckpt` y `tokenizer` incorpora una nueva generación al servidor en ejecución.
- Entornos con GPU efímera (RunPod, Akash): el script descarga solo el modelo solicitado, lo que reduce el tiempo de arranque y el coste frente a cargar el catálogo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del modelo concreto cargado desde los repositorios individuales.
- GPU recomendadas: no disponible; la documentación indica que el servidor puede cargar modelos en «cualquier GPU», sin especificar modelos ni mínimos.
- Compatibilidad con GPU de consumo: no confirmada; no se detallan requisitos de memoria ni modelos de tarjeta soportados.
- Plataformas de despliegue documentadas: Google Colab, Akash, RunPod y Mac Studio.
- Opciones de servicio: `titi_server.py` propio con API compatible con OpenAI, túnel de Cloudflare para exposición pública y endpoints administrativos de carga y descarga.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Producto | Tipo | Pesos incluidos | API compatible OpenAI | Carga multi-modelo en caliente | Licencia |
|---|---|---|---|---|---|
| `Thengbeo/titi-models` | Servidor de coordinación multi-modelo | No | Sí (`/v1/chat/completions`) | Sí (`/admin/models/load`, `/admin/models/unload`) | no disponible |
| vLLM | Motor de inferencia | No | Sí | No nativo (requiere reinicio o múltiples instancias) | no disponible en la información proporcionada |
| Ollama | Runtime local de modelos | No | Parcial | No nativo | no disponible en la información proporcionada |
| llama.cpp | Motor de inferencia | No | Sí (servidor) | No nativo | no disponible en la información proporcionada |

La comparación se limita a la función de orquestación, ya que `titi-models` no publica pesos ni métricas de calidad. No se dispone de datos para comparar rendimiento, contexto o parámetros con alternativas de la misma categoría de modelo.

## Limitaciones y advertencias

- El repositorio no contiene pesos ni documentación técnica del modelo subyacente; no es posible evaluar calidad, sesgos o alucinación a partir de esta ficha.
- No se especifica licencia, ni en el repositorio ni en la información de Hugging Face; el uso comercial queda sin cobertura legal explícita.
- El servidor requiere un `HF_TOKEN` con acceso al repositorio privado `Thengbeo/titi-infra-secrets`; sin ese acceso, el arranque no puede obtener `CF_TUNNEL_TOKEN` ni `TITI_API_KEY`.
- La exposición pública depende de un túnel de Cloudflare y de un dominio de terceros (`api.titi.ai.vn`), lo que introduce una dependencia externa en la ruta de producción.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo día (25 de noviembre de 2026), sin historial de uso verificable.
- La documentación está redactada en vietnamita y no incluye guía de seguridad, límites de tasa, gestión de errores ni política de retención de datos.
- No hay información sobre sesgos, idiomas efectivamente soportados, límites de contexto ni comportamiento en producción de los modelos cargados.
- Los endpoints administrativos (`/admin/models/load`, `/admin/models/unload`) permiten modificar el estado del servidor; su protección depende exclusivamente de la `TITI_API_KEY`.

## Enlaces

- Repositorio principal: https://huggingface.co/Thengbeo/titi-models
- Repositorio de la primera generación: https://huggingface.co/Thengbeo/titi-genesis
- Repositorio de visión: https://huggingface.co/Thengbeo/titi-vision
- Repositorio de bot: https://huggingface.co/Thengbeo/titi-bot
- Repositorio privado de secretos de infraestructura: https://huggingface.co/Thengbeo/titi-infra-secrets
- Endpoint de API: https://api.titi.ai.vn
- Papers, blogs y demos adicionales: no disponibles en la información proporcionada.
