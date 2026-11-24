# WakyITA/hummingbot-v2-dex-cex-market-maker

## Resumen

La entrada `WakyITA/hummingbot-v2-dex-cex-market-maker` de Hugging Face no corresponde a un modelo de inteligencia artificial. Se trata de un repositorio que aloja una supuesta aplicacion ejecutable para Windows x64, empaquetada en un archivo ZIP de 4,8 MB, que se presenta como una herramienta de market making para exchanges descentralizados y centralizados basada en Hummingbot. El autor declarado es el usuario WakyITA, aunque la model card referencia repositorios de GitHub de terceros (`Roussel10024`, `RiyaJeong`) y un binario denominado `inzoi-cheat-trainer-mod-menu-v1.2.2-win64.exe`, nombre que no guarda relacion con Hummingbot ni con ninguna funcionalidad de trading.

No existe informacion sobre arquitectura de red neuronal, parametros, contexto, tokenizador ni pesos en formato safetensors o GGUF. La etiqueta `license:mit` aparece en los metadatos, pero el contenido distribuido es un ejecutable ofuscado que requiere contrasena para descomprimirse y que se solicita ejecutar como administrador, practica habitual en campañas de distribucion de software malicioso. La model card incluye afirmaciones no verificables (131K descargas, 99 % de valoracion, builds `v4.8.6 (E8E434)`) y metricas de rendimiento inventadas (429 Hz, 454 Hz, 367 Hz de polling) sin ninguna base tecnica documentada.

Por tanto, esta ficha no puede describir un modelo de IA: documenta un artefacto que suplanta la identidad de un modelo o herramienta legitima. Cualquier desarrollador o investigador que encuentre este repositorio debe tratarlo como no fiable y evitar la descarga y ejecucion del binario. A continuacion se detallan los datos disponibles, explicitando en cada apartado la ausencia de informacion tecnica verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (declarados en metadatos, sin modelo linguistico asociado) |
| Licencia | MIT (declarada en metadatos; el contenido distribuido es un binario, no codigo fuente) |
| Formato de pesos | no disponible (el artefacto es un ZIP de 4,8 MB con un `.exe`) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal que describir. El repositorio no contiene pesos, configuracion de transformer, dataset de entrenamiento ni proceso de alineacion (RLHF, DPO o similar). El contenido declarado es un archivo `inzoi-cheat-trainer-mod-menu-v1.2.2-win64.zip` de 4,8 MB protegido con contrasena (`2026`) que, al descomprimirse, produce un ejecutable `inzoi-cheat-trainer-mod-menu-v1.2.2-win64.exe` que la model card indica ejecutar con privilegios de administrador.

La model card mezcla terminologia de trading algoritmico (Jito y MEV bundle engine, LUT bundler de 20 wallets, copytrade de smart money, filtro de honeypot, enrutamiento de ordenes sub-40 ms) con un nombre de binario ajeno al dominio (`inzoi-cheat-trainer-mod-menu`). Esta incoherencia, junto con la peticion de contrasena y elevacion de privilegios, es indicativa de un artefacto no verificado. No se documenta ningun proceso de entrenamiento, dataset, tokenizador ni innovacion tecnica de IA.

## Capacidades

- No se puede atribuir ninguna capacidad de generacion de texto, razonamiento, codigo, matematicas o vision: no hay modelo subyacente.
- No hay soporte documentado de tool calling ni function calling en el sentido de un LLM.
- No hay soporte de agentes ni razonamiento multi-paso verificable.
- Las capacidades multilingues listadas en metadatos (14 idiomas) no estan respaldadas por ningun modelo linguistico en el repositorio.
- Las funcionalidades que la model card atribuye al artefacto (paper-trade sandbox, MEV bundle engine, copytrade, filtro de honeypot) no estan verificadas por codigo fuente ni por documentacion tecnica independiente.

## Casos de uso

No se pueden recomendar casos de uso legitimos para este artefacto. Los escenarios que la model card sugiere no son verificables y conllevan riesgos de seguridad:

- Market making DEX/CEX: la model card afirma que el binario gestiona estrategias de market making, pero no hay codigo fuente ni auditoria que lo respalde; ejecutarlo implicaria exponer claves de API de exchange en un entorno no controlado.
- Paper trading: la supuesta simulacion sin riesgo se distribuye como ejecutable ofuscado con contrasena, lo que impide inspeccionar su comportamiento antes de ejecutarlo.
- Copytrade de smart money: requiere conexion a wallets y credenciales; un binario no auditado solicitando privilegios de administrador supone un vector claro de exfiltracion de claves.
- Filtro de honeypot pre-compra: no hay evidencia de implementacion ni de integracion con RPCs reales.
- Bundle MEV/Jito: la operacion MEV requiere infraestructura y firmas criptograficas; un ejecutable de 4,8 MB sin fuente no es un componente fiable para ello.
- Cualquier uso en produccion: desaconsejado por completo; no existe trazabilidad del binario ni del proceso de build.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (429 Hz, 454 Hz, 367 Hz de polling, respuesta `< 5 ms`, `131K+` descargas, `99 %` de valoracion) no son resultados de benchmarks de IA ni estan respaldadas por metodologia alguna; se citan aqui unicamente como afirmaciones del autor no verificadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo de IA).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- El artefacto declara como requisito un sistema Windows x64 moderno (Windows 11 incluido) y un consumo de RAM inferior a 21 MB segun la model card, cifra no verificada.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras de la model card no son medibles ni auditables.

## Comparativa con modelos similares

No disponible. No existe categoria de modelo comparable porque el artefacto no es un modelo de IA. Como referencia de lo que si seria un proyecto legitimo en el dominio del market making, el propio Hummingbot (proyecto open source con repositorio publico y codigo auditable) seria el punto de comparacion adecuado, pero no se dispone de datos verificados en la informacion proporcionada para establecer una tabla comparativa.

## Limitaciones y advertencias

- No es un modelo de IA: carece de pesos, arquitectura y tokenizador; las etiquetas de Hugging Face inducen a error.
- Incoherencia de identidad: el binario se llama `inzoi-cheat-trainer-mod-menu-v1.2.2-win64.exe`, ajeno al dominio de Hummingbot y del trading.
- Distribucion con contrasena (`2026`) y peticion de ejecucion como administrador: patron habitual en malware y en campañas de phishing.
- Referencias a repositorios de GitHub de terceros (`Roussel10024`, `RiyaJeong`) no verificados y potencialmente suplantados.
- Metricas y cifras de descargas/valoracion inventadas o no auditables.
- Licencia MIT declarada en metadatos, pero sin codigo fuente que la respalde; el uso comercial del binario no esta justificado tecnicamente.
- Riesgo alto de robo de credenciales de exchange, claves privadas de wallet y datos del sistema si se ejecuta.
- No apto para produccion en ningun escenario.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/WakyITA/hummingbot-v2-dex-cex-market-maker
- Repositorio GitHub referenciado en la model card (no verificado): https://github.com/RiyaJeong/hummingbot-v2-dex-cex-market-maker
- Repositorio GitHub del supuesto binario (no verificado): https://github.com/Roussel10024/inzoi-cheat-trainer-mod-menu
- Proyecto Hummingbot legitimo (referencia de comparacion): https://hummingbot.org
