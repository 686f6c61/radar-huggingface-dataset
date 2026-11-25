# sowel/rivals-keyless-script-hub

## Resumen

`sowel/rivals-keyless-script-hub` no es un modelo de inteligencia artificial. El repositorio de Hugging Face, pese a estar alojado en esa plataforma, contiene una model card que distribuye un ejecutable de Windows (`rob-run-cheat-mod-menu-2026-v1.2.2-win64.exe`, build `v2.1.7`/`FA15F1`) empaquetado en un ZIP de 4,8 MB protegido con la contraseña `2026`. El contenido se presenta como un "script hub" para el videojuego *Roblox* (referencias a "Rob", "island", "raid room", "fruit") con funciones de ESP, teleport, anti-AFK y alertas por webhook de Discord.

No existe información alguna sobre arquitectura de red neuronal, parámetros, contexto, tokenizador, dataset de entrenamiento ni pesos. La etiqueta `pipeline` figura como "no disponible" y las descargas e interacciones son cero en el momento de la consulta. Por tanto, esta ficha documenta un artefacto binario de dudosa procedencia, no un modelo de lenguaje.

El interés técnico es negativo: se trata de un ejemplo de uso abusivo de Hugging Face para distribuir software potencialmente malicioso (cheats de videojuegos con contraseña en el archivo, enlaces a repositorios de terceros y llamadas a ejecutar como administrador). Se recomienda no descargarlo ni ejecutarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable PE de Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos, sin relación con capacidades lingüísticas reales) |
| Licencia | MIT (declarada en metadatos) |
| Formato de pesos | no disponible; el artefacto es un ZIP de 4,8 MB con un `.exe` |

## Arquitectura y entrenamiento

No aplica. No hay red neuronal, ni transformer, ni MoE, ni SSM, ni proceso de entrenamiento documentado. El artefacto es un binario compilado para Windows 10/11 x64 que, según la model card, se ejecuta "como administrador" y requiere extraer un ZIP con contraseña. No se especifica lenguaje de programación, cadena de compilación, dependencias ni firma de código.

La model card menciona módulos internos ("3D Entity & Chest ESP", "Anti-AFK Guard", "Coordinate Teleport", "Frame-Rate Optimizer", "Discord Webhook Alerts") con cifras de sondeo (434 Hz, 446 Hz) y porcentajes de consistencia (96,5 %, 98,9 %) que no son verificables y no corresponden a ninguna métrica de evaluación de modelos.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling en el sentido de la API de un LLM.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; los idiomas listados son metadatos de etiquetado para posicionamiento en búsquedas.
- El binario declara funciones de trampas para videojuegos (ESP, teleport, anti-AFK, optimización de FPS, webhooks), sin verificación independiente.

## Casos de uso

No se identifican casos de uso legítimos para un modelo de IA, porque no lo es. Los escenarios que describe la model card son:

- Automatización de trampas en un videojuego multijugador: el ejecutable declararía ESP y teleport, lo que viola los términos de servicio de la mayoría de plataformas y puede conllevar el baneo de la cuenta.
- Ejecución de binarios no firmados como administrador: riesgo elevado de compromiso del sistema anfitrión.
- Distribución de software con contraseña en el archivo: práctica habitual para evadir análisis automáticos de malware.
- Campañas de ingeniería social: los badges falsos ("180K+ descargas", "4,8/5") y los enlaces a repositorios de GitHub de terceros buscan generar confianza.
- Posicionamiento SEO en Hugging Face: uso de etiquetas de idioma y de modelo para aparecer en búsquedas ajenas al contenido real.
- Recolección de credenciales o telemetría: no verificable, pero coherente con el patrón de distribución observado.

Ninguno de estos casos es recomendable. Se documentan únicamente como advertencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras de la model card (434 Hz, 446 Hz, 96,5 %, 98,9 %) son afirmaciones del autor sin metodología, sin conjunto de prueba y sin replicación; no constituyen benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay inferencia de modelo).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Requisitos declarados por el autor: Windows 10/11 de 64 bits, ejecución como administrador, menos de 21 MB de RAM según la model card.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): ninguna; el artefacto es un `.exe` de Windows.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Como referencia de categoría, se compara con otros artefactos del mismo tipo (software no verificado distribuido en repositorios de modelos):

| Artefacto | Tipo | Parametros | Contexto | Licencia | Verificable |
|---|---|---|---|---|---|
| `sowel/rivals-keyless-script-hub` | Binario Windows (cheat) | no aplica | no aplica | MIT declarada | No |
| Modelo de lenguaje open source típico (p. ej. familia Llama, Qwen, Mistral) | Red neuronal transformer | 1B–70B+ | 4K–128K+ | Apache 2.0 / MIT / licencias comunitarias | Sí, con pesos y benchmarks públicos |
| Repositorio de código convencional en GitHub | Código fuente | no aplica | no aplica | Según repositorio | Parcialmente |

La comparación con modelos reales carece de sentido técnico; se incluye solo para dejar constancia de la categoría.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse como tal ni incluirse en comparativas de LLM.
- Riesgo de malware: ejecutable sin firma, distribuido con contraseña (`2026`) para dificultar el escaneo, y con instrucciones de ejecutarlo como administrador.
- Enlaces a repositorios de GitHub de terceros (`JoaoSchaefer973/...`, `bettysuzuki/...`) que no coinciden con el autor declarado (`sowel`); posible suplantación o redirección a contenido malicioso.
- Badges y métricas falsas ("180K+ descargas", "4,8/5") sin verificación; las descargas reales en Hugging Face son cero.
- Uso de etiquetas de idioma (14 idiomas) y de plataforma para posicionamiento SEO, no por capacidades reales.
- Licencia MIT declarada, pero sin archivo `LICENSE` verificable ni titular claro; la licencia no cubre el uso del binario frente a los términos de servicio de terceros.
- Violación previsible de los términos de servicio de videojuegos y plataformas si se usa como cheat.
- Sin soporte, sin mantenimiento, sin issues y sin historial de commits en Hugging Face.
- No apto para producción en ningún escenario.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sowel/rivals-keyless-script-hub
- Enlace de descarga citado en la model card (no recomendado): https://github.com/JoaoSchaefer973/rob-run-cheat-mod-menu-2026/releases/download/v1.2.0/rob-run-cheat-mod-menu-2026-v1.2.2-win64.zip
- Repositorio de GitHub citado en la model card (no verificado): https://github.com/bettysuzuki/rivals-keyless-script-hub
- Resultados de búsqueda web: únicamente aparecen dominios de la cadena hotelera Sowell (sowell.fr, sowell-groupe.fr, sowell.app), sin relación con el artefacto; no se han encontrado papers, blogs ni demos técnicos.
