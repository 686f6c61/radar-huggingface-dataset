# vaibhavmodi45/dubai-rp-script

## Resumen

El identificador `vaibhavmodi45/dubai-rp-script` corresponde a un repositorio alojado en Hugging Face que **no contiene un modelo de inteligencia artificial**. Se trata de un paquete ejecutable para Windows (un supuesto "script" o *cheat* para un videojuego de rol, presumiblemente un servidor de rol de Dubái), empaquetado como archivo `.zip` de 4,8 MB con un ejecutable `.exe` que requiere contraseña de descompresión. No hay pesos, no hay tokenizador, no hay configuración de transformer ni artefactos de inferencia de ningún tipo.

La model card describe funcionalidades propias de un *cheat* multijugador: superposición externa a 144 Hz con cajas delimitadoras y esqueletos, radar 2D con filtro de objetos por rareza, teclas de pánico para descarga instantánea y una capa de renderizado que evita la captura en OBS, ShadowPlay y Discord. El paquete se distribuye mediante enlaces a repositorios de GitHub de terceros y emplea técnicas habituales de evasión de detección (contraseña en el archivo comprimido, alertas de SmartScreen justificadas como "binario independiente").

Desde la perspectiva de un catálogo de modelos open source, este repositorio es **ruido**: no es evaluable como modelo, no ofrece API de inferencia, no tiene benchmarks y su descarga e instalación conllevan riesgos de seguridad evidentes (ejecutable de origen desconocido, sin firma, distribuido con instrucciones para ejecutarlo como administrador). Esta ficha se redacta para dejar constancia de la ausencia de un modelo real y advertir de los riesgos, no para evaluar capacidades de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Win64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos de la model card; sin relación con capacidades lingüísticas reales) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto es un `.zip` de 4,8 MB con un `.exe`) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El artefacto descrito en la model card es un ejecutable nativo de Windows (`solara-executor-v3-keyless-2026-v1.2.2-win64.exe`, build `v4.1.3` / `A355B2B313`) que, según el autor, opera en modo usuario con *Desktop Duplication* para renderizar una superposición externa sin inyectar DLL en el proceso objetivo. Las funcionalidades declaradas (superposición a 211 Hz de sondeo, radar 2D, filtro de objetos, tecla de pánico `END` con salida en menos de 35 ms) son propias de un software de trampas para videojuegos, no de un sistema de aprendizaje automático.

No se proporciona información sobre datos de entrenamiento, tokens, composición del corpus, RLHF, DPO ni ninguna innovación técnica de modelado. Las cifras de "consistencia" que aparecen en la tabla de subsistemas (98,1 %, 96,6 %) no son métricas de benchmark reproducibles ni se acompañan de metodología alguna.

## Capacidades

- No genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta *tool calling* ni *function calling*.
- No soporta flujos de agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; los códigos de idioma de los metadatos son etiquetas de indexación sin respaldo funcional.
- Las únicas "capacidades" declaradas son de trampa en videojuegos: superposición externa, radar, filtro de objetos y ocultación ante capturadores de pantalla.
- No dispone de modo *thinking*, visión, audio ni ninguna modalidad de IA.

## Casos de uso

- **Ninguno como modelo de IA.** No es posible integrarlo en pipelines de generación, RAG, agentes, clasificación ni ninguna tarea de aprendizaje automático.
- **Auditoría de repositorios sospechosos:** este identificador puede servir como ejemplo de contaminación de catálogos de modelos en Hugging Face por parte de campañas de distribución de *malware* o *cheats*.
- **Formación en seguridad:** útil para ilustrar patrones de ingeniería social (contraseña `2026` en el ZIP, instrucciones de "ejecutar como administrador", justificación de alertas de SmartScreen como falsos positivos).
- **Investigación de *supply chain*:** permite documentar cómo se abusa de plataformas de modelos para alojar binarios ejecutables con enlaces a GitHub de terceros.
- **Concienciación de equipos:** caso práctico para explicar por qué no debe ejecutarse software descargado de repositorios de modelos sin verificación de firma ni análisis previo.
- **Política de ingesta de datos:** ejemplo de por qué un catálogo interno de modelos debe filtrar por artefactos (`safetensors`, `GGUF`, `config.json`) y no solo por etiquetas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (98,1 % de consistencia, 211 Hz de sondeo, menos de 35 ms de respuesta) no son benchmarks de modelos y carecen de metodología verificable.

## Requisitos de hardware

- **VRAM para inferencia:** no aplica; no hay modelo que cargar en memoria de GPU.
- **GPU recomendadas:** no aplica.
- **Compatibilidad con GPU de consumo:** no aplica.
- **Requisitos reales del artefacto:** Windows 10 o Windows 11 de 64 bits, 4,8 MB de espacio en disco para el ZIP y privilegios de administrador para ejecutar el binario según las instrucciones del autor.
- **Opciones de despliegue:** no aplica (no hay soporte para vLLM, llama.cpp, Ollama, TGI ni similares).
- **Latencia y throughput:** no disponibles como métricas de modelo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `vaibhavmodi45/dubai-rp-script` | Ejecutable Win64 (no es modelo) | no disponible | no disponible | MIT (declarada) | Hugging Face + GitHub de terceros |
| Modelo de IA comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

No existe un modelo de IA comparable porque el artefacto no pertenece a la categoría de modelos de lenguaje, visión ni multimodal.

## Limitaciones y advertencias

- **No es un modelo de IA:** cualquier intento de usarlo como tal fallará; no hay pesos ni API de inferencia.
- **Riesgo de seguridad alto:** el paquete es un ejecutable de origen desconocido, sin firma digital verificable, que el propio autor instruye a ejecutar como administrador.
- **Técnicas de evasión:** el uso de contraseña en el ZIP y la justificación de alertas de SmartScreen como falsos positivos son patrones habituales en la distribución de *malware*.
- **Enlaces a repositorios de terceros:** el binario se descarga desde un repositorio de GitHub ajeno al autor declarado, lo que impide verificar la cadena de custodia.
- **Riesgo legal:** los *cheats* en videojuegos multijugador suelen violar los términos de servicio y pueden contravenir normativa de protección de servicios y propiedad intelectual según jurisdicción.
- **Licencia MIT no cubre el contenido:** aunque los metadatos declaren MIT, esa licencia no otorga derechos sobre el videojuego objetivo ni sobre componentes de terceros que el binario pudiera incorporar.
- **Sin mantenimiento ni soporte:** cero descargas y cero *likes* en el momento de la consulta; no hay historial de versiones verificable.
- **Alucinación y sesgos:** no aplica, al no existir componente generativo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/vaibhavmodi45/dubai-rp-script
- Enlace de descarga citado en la model card (GitHub de terceros): https://github.com/schneider6972/solara-executor-v3-keyless-2026/releases/download/v1.2.0/solara-executor-v3-keyless-2026-v1.2.2-win64.zip
- Página de *releases* citada en la model card: https://github.com/monikakarlsson/dubai-rp-script/releases/latest
- Resultado de búsqueda web sin relación con el artefacto (Ameli): https://assure.ameli.fr/
