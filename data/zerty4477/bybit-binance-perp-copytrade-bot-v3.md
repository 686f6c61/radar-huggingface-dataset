# zerty4477/bybit-binance-perp-copytrade-bot-v3

## Resumen

El repositorio identificado como `zerty4477/bybit-binance-perp-copytrade-bot-v3` no es un modelo de inteligencia artificial. Se trata de un paquete de software distribuido como archivo ZIP (`rob-run-cheat-mod-menu-v1.2.2-win64.zip`, 4,8 MB) dirigido a sistemas Windows 10 y Windows 11 de 64 bits, presentado por su autor como un bot de copytrading de futuros perpetuos para los exchanges Bybit y Binance. La model card no contiene ninguna descripcion de arquitectura de red neuronal, pesos, tokenizador ni datos de entrenamiento.

El contenido de la ficha publicada en Hugging Face incluye instrucciones para descargar un ejecutable desde un repositorio de GitHub de terceros, una contrasena para descomprimir el archivo (`2026`) y la indicacion de ejecutarlo con privilegios de administrador. Estos elementos son caracteristicos de campanas de distribucion de software potencialmente malicioso y no guardan relacion con el ecosistema de modelos open source.

Dado que no existe ningun modelo de lenguaje, vision o multimodal subyacente, las secciones tecnicas que siguen reflejan la ausencia de informacion verificable. Se recomienda tratar este repositorio como un artefacto ajeno al catalogo de modelos y no ejecutar el binario referenciado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un paquete ejecutable para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas de la model card, sin relacion con capacidades linguisticas de un modelo) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo que describir. El artefacto es un ejecutable nativo de Windows (`rob-run-cheat-mod-menu-v1.2.2-win64.exe`, version declarada `v4.5.3`, build `9F08FE`) empaquetado en un ZIP de 4,8 MB. La model card menciona componentes funcionales como un "20-wallet LUT bundler", un "Jito & MEV bundle engine", un "smart-money copytrade" con latencia declarada inferior a 10 ms, un filtro "pre-buy honeypot" y una "local AES-256 key vault", pero no aporta ninguna especificacion tecnica verificable, codigo fuente, paper ni dataset.

No se declara ningun proceso de entrenamiento, ajuste fino, RLHF, DPO ni corpus de datos. La unica informacion reproducible es la relativa al empaquetado y a las instrucciones de instalacion, que incluyen la ejecucion como administrador y el uso de una contrasena fija para el archivo comprimido.

## Capacidades

- No se documenta ninguna capacidad de generacion de texto, razonamiento, codigo, matematicas, vision o audio.
- No se documenta soporte de tool calling ni function calling en el sentido de un modelo de lenguaje.
- No se documenta razonamiento multi-paso ni comportamiento agentico basado en un LLM.
- Las unicas "capacidades" descritas son funcionalidades de un supuesto bot de trading (copytrading de wallets, ejecucion multi-wallet, filtro de honeypots, sandbox de paper trading, almacen local de claves).
- No hay evidencia tecnica que respalde esas funcionalidades: no se enlaza codigo fuente, auditoria ni repositorio original del supuesto bot.

## Casos de uso

- No procede. Al no ser un modelo de IA, no existen casos de uso legitimos de inferencia, generacion o analisis.
- El unico escenario descrito por el autor es la ejecucion de un bot de copytrading en Windows, que requiere descargar un binario de un repositorio de GitHub de terceros, descomprimirlo con contrasena y ejecutarlo como administrador. Este flujo no es verificable ni auditable y no se recomienda.
- Cualquier uso en produccion, investigacion o desarrollo quedaria fuera del alcance de esta ficha, que documenta modelos de IA open source.
- No se identifican aplicaciones realistas de NLP, vision, codigo o agentes para este artefacto.
- No se identifican integraciones con frameworks de inferencia (vLLM, llama.cpp, TGI, Ollama) porque no hay pesos ni modelo.
- No se identifican escenarios de evaluacion comparativa con otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye cifras de marketing no verificables (por ejemplo, "Rating 4.9/5", "Downloads 642K+", "99.7% consistency", "363 Hz polling"), pero no corresponden a ninguna evaluacion estandar de modelos (MMLU, HumanEval, GSM8K, etc.) ni aportan evidencia reproducible.

## Requisitos de hardware

- No aplica en terminos de VRAM o GPU: el artefacto es un ejecutable de Windows x64, no un modelo con pesos.
- El autor declara un consumo inferior a 31 MB de RAM durante la ejecucion, dato no verificable.
- No se especifican requisitos de GPU (A100, H100, RTX 4090 u otras) porque no hay inferencia neuronal.
- No cabe en GPU consumer ni en GPU de datacenter en el sentido habitual: no hay modelo que cargar.
- Opciones de despliegue: no disponibles (no hay soporte de vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponibles; las cifras de la model card (<10 ms, <9 ms, 363 Hz) no son medibles ni auditables.

## Comparativa con modelos similares

No disponible. No existe una categoria de "modelos de IA" a la que comparar este artefacto. Las alternativas reales serian otros bots de trading, pero no se dispone de informacion tecnica verificable sobre ninguno de ellos en la informacion proporcionada.

| Criterio | Este artefacto | Alternativas de IA open source |
|---|---|---|
| Parametros | no disponible | no aplica |
| Contexto | no disponible | no aplica |
| Rendimiento | no verificable | no aplica |
| Licencia | MIT declarada | no aplica |
| Disponibilidad | ZIP en GitHub de terceros | no aplica |

## Limitaciones y advertencias

- No es un modelo de IA: la ficha de Hugging Face esta siendo utilizada como vector de distribucion de un ejecutable de Windows, no como repositorio de pesos.
- El binario se descarga desde un repositorio de GitHub de terceros (`cishii039/rob-run-cheat-mod-menu`), no desde el propio repositorio de Hugging Face, lo que impide verificar su procedencia.
- Se solicita ejecutar el `.exe` como administrador y descomprimirlo con una contrasena fija (`2026`), practica habitual para evadir analisis automatizados de antivirus y sandboxes.
- El nombre del ejecutable (`rob-run-cheat-mod-menu`) no coincide con la supuesta funcionalidad de trading, lo que sugiere suplantacion de identidad o reutilizacion de un artefacto ajeno.
- Riesgo elevado de malware, robo de credenciales de exchange y claves API, y fraude financiero.
- No existe codigo fuente, auditoria de seguridad, paper ni evidencia de que las funcionalidades descritas funcionen.
- La licencia MIT declarada no aporta ninguna garantia sobre el contenido del binario distribuido.
- No se recomienda su descarga, ejecucion ni integracion en ningun entorno, y menos aun en sistemas con acceso a wallets o claves de exchange.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/zerty4477/bybit-binance-perp-copytrade-bot-v3
- Repositorio de GitHub referenciado en la model card: https://github.com/cishii039/rob-run-cheat-mod-menu
- Enlace de descarga del ZIP citado: https://github.com/cishii039/rob-run-cheat-mod-menu/releases/download/v1.2.0/rob-run-cheat-mod-menu-v1.2.2-win64.zip
- Repositorio alternativo citado: https://github.com/sharonf35/bybit-binance-perp-copytrade-bot-v3
- Paper, blog, demo o documentacion tecnica: no disponible
