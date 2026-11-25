# venj1x/binance-bybit-funding-arbitrage-bot

## Resumen

El repositorio `venj1x/binance-bybit-funding-arbitrage-bot` no contiene un modelo de inteligencia artificial. Se trata de un artefacto alojado en Hugging Face cuyo contenido declarado es un ejecutable para Windows x64 distribuido en un archivo ZIP, presuntamente relacionado con arbitraje de tasas de financiación entre Binance y Bybit. No hay pesos, tokenizador, configuración de arquitectura ni pipeline de inferencia asociados.

La model card es incoherente y contiene múltiples señales de alarma: el nombre del binario descargable (`elden-ring-nightreign-trainer-coop-2026-v1.2.2-win64.zip`) no guarda relación alguna con el título del repositorio, el archivo está protegido con contraseña (`2026`) y se solicita ejecutarlo como administrador. La descripción mezcla terminología de bots de trading con conceptos de trampas para videojuegos (Luau VM, teleport scripts, offset sync), lo que sugiere un empaquetado engañoso o malicioso.

Desde el punto de vista de evaluación de modelos, este repositorio carece de cualquier elemento técnico verificable: cero descargas, cero likes, sin pipeline declarado y sin benchmarks. Se documenta aquí exclusivamente para dejar constancia de su naturaleza y advertir frente a su uso. No debe tratarse como un modelo de IA en ningún flujo de trabajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto ejecutable para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El repositorio aloja un binario compilado para Windows x64 (`elden-ring-nightreign-trainer-coop-2026-v1.2.2-win64.exe`, build declarada `v1.0.4` / `FB9FC42618`) empaquetado en un ZIP de 4,8 MB protegido con contraseña. No se documentan datos de entrenamiento, tokens procesados, técnicas de alineación (RLHF, DPO) ni innovaciones de inferencia.

La model card describe módulos con nombres propios del cheating en videojuegos (adjuntar múltiples instancias, inyección de scripts Luau, teleport, sincronización de offsets tras parches) mezclados con el título de bot de arbitraje. Esta combinación es característica de repositorios señuelo que aprovechan palabras clave financieras para atraer descargas.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües reales; los idiomas listados son solo etiquetas de metadatos.
- No ofrece modo thinking, visión ni audio.
- El único contenido funcional declarado es un ejecutable de Windows sin código fuente ni verificación de integridad publicada.

## Casos de uso

- Ninguno recomendado. No existe un caso de uso legítimo verificable para este artefacto en el contexto de evaluación de modelos de IA.
- Auditoría de seguridad: un analista podría inspeccionar el ZIP en un entorno aislado (sandbox sin red, máquina virtual desechable) para determinar si el binario contiene código malicioso, dada la incoherencia entre título y contenido.
- Documentación de repositorios señuelo: sirve como ejemplo de mala praxis en model cards (contraseñas en el README, enlaces a repositorios de terceros no relacionados, promesas de descargas no verificables).
- Investigación de campañas de distribución: el patrón (ZIP con contraseña, ejecución como administrador, nombres de archivo ajenos al proyecto) es típico de campañas que buscan evadir análisis automáticos.
- Formación en higiene de cadena de suministro: ilustra por qué no deben ejecutarse binarios de repositorios sin reputación, sin firmas y sin código fuente.
- No debe emplearse bajo ningún concepto en entornos de producción, trading real ni sistemas con acceso a credenciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica: no hay inferencia de modelo que ejecutar.
- El artefacto declarado requiere un escritorio Windows x64; no se especifican versiones mínimas ni dependencias.
- No requiere VRAM ni GPU.
- No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no existen pesos de modelo.
- Latencia y throughput: no disponibles y sin sentido en este contexto.
- Advertencia: si se ejecutase el binario, debería hacerse únicamente en una máquina virtual aislada, sin red y sin datos personales, y aun así se desaconseja.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque este repositorio no contiene un modelo de IA. Frente a artefactos legítimos de la misma categoría nominal (bots de arbitraje de funding), la diferencia clave es que un proyecto real publicaría código fuente auditable, dependencias declaradas (por ejemplo, clientes de API de exchanges), historial de versiones y pruebas; aquí solo hay un ejecutable cerrado con contraseña.

## Limitaciones y advertencias

- Incoherencia grave: el título del repositorio (bot de arbitraje Binance/Bybit) no coincide con el nombre del binario distribuido (relacionado con un entrenador de un videojuego).
- Distribución de un `.exe` protegido con contraseña y petición explícita de ejecutarlo como administrador: vector clásico de malware.
- Enlaces de descarga apuntan a un repositorio de GitHub de un tercero (`claudio00344/...`) distinto del autor declarado, lo que rompe la trazabilidad.
- Cero descargas y cero likes: sin validación por parte de la comunidad.
- Sin código fuente, sin hashes publicados, sin firma digital verificable.
- Licencia MIT declarada, pero sin que exista obra de software auditable a la que aplicarla de forma significativa.
- Riesgo alto de robo de credenciales, especialmente de claves de API de exchanges, si se ejecuta en una máquina con acceso a ellas.
- No usar en producción bajo ninguna circunstancia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/venj1x/binance-bybit-funding-arbitrage-bot
- Repositorio de GitHub referenciado en la model card (tercero, no verificado): https://github.com/george63148/binance-bybit-funding-arbitrage-bot
- Repositorio de GitHub del binario enlazado (tercero, no verificado): https://github.com/claudio00344/elden-ring-nightreign-trainer-coop-2026
- Enlace de descarga directa citado en la model card (no recomendado): https://github.com/claudio00344/elden-ring-nightreign-trainer-coop-2026/releases/download/v1.2.0/elden-ring-nightreign-trainer-coop-2026-v1.2.2-win64.zip
