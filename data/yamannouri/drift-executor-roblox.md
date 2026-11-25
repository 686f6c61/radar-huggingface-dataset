# Yamannouri/drift-executor-roblox

## Resumen

`Yamannouri/drift-executor-roblox` no es un modelo de lenguaje ni un sistema de IA. Es un repositorio alojado en Hugging Face cuyo contenido es la model card de una supuesta aplicación ejecutable para Windows 10 y Windows 11 denominada "Drift Executor Roblox", distribuida como archivo ZIP de 8,9 MB con contraseña de descompresión. El autor del repositorio es el usuario `Yamannouri`, y la model card dirige la descarga a un repositorio de GitHub de terceros (`mike-kumar-lab1905z2/drift-executor-roblox`), no al propio Hugging Face.

El artefacto se presenta como un "executor" de Roblox, es decir, una herramienta de inyección de scripts Luau en el cliente del videojuego, con funciones de keyless execution, auto-execute, compatibilidad sUNC y sincronización de offsets tras parches. No contiene pesos, tokenizador, configuración de arquitectura ni pipeline de inferencia: la plataforma muestra el campo `pipeline` como no disponible y el repositorio registra 0 descargas y 0 likes en el momento de la consulta.

Desde la perspectiva de un catálogo de modelos de IA open source, este repositorio no es evaluable como modelo. Su relevancia es la de un caso de uso indebido de Hugging Face como canal de distribución de binarios de terceros, con indicadores propios de campañas de malware (archivo comprimido con contraseña, enlace externo a GitHub, instrucciones para ejecutar como administrador y desactivar avisos de SmartScreen). Esta ficha documenta el artefacto con rigor técnico y señala los riesgos, sin avalar su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario ejecutable para Windows) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe`; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento asociado. El repositorio contiene únicamente una model card en Markdown y metadatos; el binario real (`drift-executor-roblox-v1.2.0-win64.exe`, build `v2.0.4` con identificador `80FA59DED4`) se distribuye como archivo ZIP de 8,9 MB alojado en GitHub Releases bajo la cuenta `mike-kumar-lab1905z2`, con contraseña de extracción `2026`.

La model card describe componentes funcionales propios de un inyector de scripts: flujo de ejecución sin clave, directorio de auto-ejecución con recarga automática de scripts, compatibilidad del 98 % con el conjunto de pruebas sUNC (que incluye `hookmetamethod`, `getgc` y la API `Drawing`), sincronización de offsets tras parches del cliente y adjunción a múltiples instancias del proceso con sondeo a 472 Hz. Ninguno de estos datos es verificable desde el repositorio de Hugging Face, y no se aporta código fuente, hash del binario ni firma digital.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- Inyección de scripts Luau en el cliente de Roblox (según la descripción del autor).
- Ejecución sin sistema de claves ("keyless"), con inyección directa de scripts.
- Directorio de auto-ejecución con recarga automática de scripts.
- Compatibilidad declarada con la API sUNC (98 %), incluyendo `hookmetamethod`, `getgc` y `Drawing`.
- Adjunción a múltiples instancias del cliente de forma simultánea.
- Sincronización de offsets tras actualizaciones del cliente (según el autor, los miércoles).
- Soporte multilingüe únicamente a nivel de metadatos de la model card; no hay interfaz ni modelo que procese idioma.

## Casos de uso

- Ninguno legítimo en el ámbito de IA open source: el artefacto no es un modelo y no puede integrarse en pipelines de inferencia, RAG, agentes ni generación de código.
- Documentación de riesgos en seguridad: sirve como ejemplo de repositorio de Hugging Face usado para distribuir un ejecutable de terceros con enlace externo y contraseña de archivo, patrón habitual en campañas de malware.
- Análisis de cadena de suministro: permite estudiar cómo un repositorio con 0 descargas y 0 likes puede alojar contenido ajeno a la plataforma y cómo se redirige al usuario a un repositorio de GitHub controlado por otra cuenta.
- Formación en detección de phishing: la estructura de la model card (botones de descarga, contraseña, instrucciones para ejecutar como administrador y desactivar SmartScreen) es un caso representativo de ingeniería social.
- Auditoría de cumplimiento de plataforma: útil para revisar las políticas de Hugging Face sobre contenido que no es un modelo y sobre enlaces a binarios externos.
- Investigación de ejecutores de Roblox: únicamente como muestra del ecosistema de herramientas de inyección y de su terminología (sUNC, Luau VM, offsets), sin recomendación de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (`< 26 MB` de RAM, `98,2 %` de consistencia, `< 14 ms` de respuesta, `472 Hz` de sondeo, `99,7 %` de consistencia) son afirmaciones del autor sin metodología, sin conjunto de pruebas reproducible y sin verificación independiente; no deben interpretarse como benchmarks.

## Requisitos de hardware

- Sistema operativo: Windows 10 o Windows 11 de 64 bits (según la model card).
- RAM: el autor declara menos de 26 MB en ejecución; no verificable.
- Almacenamiento: archivo ZIP de 8,9 MB; el tamaño descomprimido no se indica.
- GPU: no aplica; no hay inferencia de red neuronal.
- VRAM: no aplica.
- Despliegue: no aplica (no hay vLLM, llama.cpp, Ollama ni TGI posibles).
- Latencia y throughput: no disponibles de forma fiable; las cifras del autor carecen de respaldo.

## Comparativa con modelos similares

No disponible. No existe categoría de modelos comparable porque el artefacto no es un modelo de IA. Como referencia de contraste, un modelo de lenguaje pequeño real (por ejemplo, un transformer de 1-3 mil millones de parámetros en formato GGUF) se distribuye con pesos verificables, tokenizador, licencia clara y benchmarks reproducibles; este repositorio no ofrece ninguno de esos elementos.

## Limitaciones y advertencias

- No es un modelo de IA: no debe catalogarse, evaluarse ni desplegarse como tal.
- Riesgo de seguridad alto: ejecutable de origen no verificado, distribuido en ZIP con contraseña, alojado en un repositorio de GitHub de una cuenta distinta a la del autor en Hugging Face y con instrucciones para ejecutarlo como administrador.
- La model card pide explícitamente desactivar o ignorar avisos de Windows Defender y SmartScreen, práctica incompatible con un uso seguro.
- No se proporciona hash criptográfico, firma de código ni código fuente del binario.
- La licencia MIT declarada en los metadatos no acredita la legitimidad del binario ni cubre responsabilidades derivadas de su ejecución.
- El uso de ejecutores de scripts en Roblox puede vulnerar los términos de servicio de la plataforma y acarrear el bloqueo de cuentas; además, la inyección de código en un cliente de terceros tiene implicaciones legales según la jurisdicción.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.
- Los idiomas listados son metadatos de la model card, no capacidades lingüísticas reales.
- Fecha de creación declarada en los metadatos: 2026-11-23; conviene verificar la coherencia temporal antes de cualquier análisis.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Yamannouri/drift-executor-roblox
- Repositorio de GitHub referenciado en la model card: https://github.com/mike-kumar-lab1905z2/drift-executor-roblox
- Descarga directa citada por el autor (no recomendada): https://github.com/mike-kumar-lab1905z2/drift-executor-roblox/releases/latest/download/drift-executor-roblox-v1.2.0-win64.zip
- Página de releases citada por el autor: https://github.com/mike-kumar-lab1905z2/drift-executor-roblox/releases/latest
- Documentación de Roblox sobre Luau: https://luau.org/
- Política de contenido de Hugging Face: https://huggingface.co/content-guidelines
