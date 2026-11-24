# Youzzevic/escape-from-tarkov-radar-esp-2026

## Resumen

El repositorio `Youzzevic/escape-from-tarkov-radar-esp-2026` alojado en Hugging Face no contiene un modelo de inteligencia artificial. Se trata de un paquete binario para Windows (x64) distribuido como supuesto "radar ESP" para el videojuego *Escape From Tarkov*, empaquetado en un archivo ZIP de 8,9 MB con contrasena y un ejecutable que se solicita ejecutar con privilegios de administrador. La model card no describe arquitectura, pesos, tokenizador ni pipeline de inferencia; los metadatos de Hugging Face no incluyen `pipeline_tag` ni ningun artefacto propio de un modelo (safetensors, GGUF, config.json).

Por tanto, esta ficha no puede evaluar capacidades de lenguaje, razonamiento o codigo, porque no existe ningun modelo subyacente. El contenido es material de tipo *game cheat* (trampa para videojuegos) que se presenta con vocabulario tecnico de IA (etiquetas multilingues, formato de model card) para ganar visibilidad en el hub. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (24 de noviembre de 2026).

Desde el punto de vista de un desarrollador o investigador, la relevancia es nula como modelo y alta como ejemplo de riesgo: un binario ofuscado con contrasena, alojado fuera del hub (enlaces a GitHub Releases de una cuenta distinta, `YannisDegroot`), que pide ejecucion como administrador y sugiere desactivar alertas de Windows Defender. No debe descargarse ni ejecutarse en ningun entorno, y menos en una maquina de desarrollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; binario PE x64 para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas de metadatos, no capacidades del artefacto) |
| Licencia | MIT (declarada en metadatos; sin archivo LICENSE verificable en la informacion disponible) |
| Formato de pesos | no disponible (el artefacto descrito es un ZIP con un `.exe`, no pesos) |

Otros datos declarados en la model card: tamano del paquete 8,9 MB, build `v4.0.8 (E3E31A)`, sistemas objetivo Windows 10 22H2 y Windows 11 24H2, contrasena del archivo `2026`.

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento. El artefacto descrito es un ejecutable nativo de 64 bits (`escape-from-tarkov-radar-esp-2026-v1.2.0-win64.exe`) que, segun la model card, opera en modo usuario mediante lectura directa de memoria del proceso del juego ("direct-memory user-mode external core") y renderizado por Desktop Duplication, sin inyeccion de DLL. Las afirmaciones tecnicas de la model card (overlay a 144 Hz, latencias de "menos de 9 ms", "96,5 % de consistencia") no son verificables y no vienen acompanadas de metodologia ni de codigo fuente.

No se declara dataset, numero de tokens, RLHF, DPO ni ninguna innovacion de inferencia. El uso de etiquetas de idioma y de una estructura de model card imita el formato habitual de un modelo multilingue, pero no existe ningun componente linguistico. La distribucion mediante ZIP con contrasena y la peticion de ejecucion como administrador son patrones habituales en malware y en herramientas de trampa que evaden analisis estatico.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni resuelve matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues reales; los codigos de idioma son metadatos.
- La model card atribuye al binario funciones de trampa en el juego: radar 2D, filtro de loot por rareza, cajas delimitadoras 2D/3D, esqueletos de huesos, ESP de distancia, perfiles JSON intercambiables en caliente y tecla de panico (`END`).
- Estas funciones, ademas de no ser capacidades de IA, violan con alta probabilidad los terminos de servicio del videojuego y pueden conllevar el baneo de la cuenta.

## Casos de uso

No se identifican casos de uso legitimos como modelo de IA. Los escenarios que la model card sugiere son:

- Trampa en *Escape From Tarkov*: visualizacion de jugadores y objetos a traves de un overlay externo. Riesgo de baneo permanente y de incumplimiento de los terminos del servicio de Battlestate Games.
- Evasion de captura en streaming: la model card menciona exclusion de OBS, ShadowPlay y Discord. Uso enganoso hacia la audiencia.
- Distribucion de software no verificado: el flujo de descarga (ZIP con contrasena, enlace a un repositorio de GitHub de terceros, ejecucion como administrador) es un vector clasico de malware.
- Analisis defensivo: el repositorio puede estudiarse como muestra de ingenieria social en hubs de modelos, siempre en una maquina aislada y sin ejecutar el binario.
- Formacion en seguridad: util como caso practico de por que no se deben ejecutar binarios ofuscados procedentes de repositorios sin trazabilidad.
- Investigacion de abuso de plataforma: ejemplo de contaminacion de Hugging Face con contenido ajeno a modelos, relevante para equipos de moderacion.

En ningun caso se recomienda su uso en produccion, en desarrollo ni en equipos personales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (menos de 9 ms, menos de 34 ms, 96,5 % y 97,4 % de consistencia) son afirmaciones del autor sin metodologia, sin conjunto de prueba y sin codigo reproducible; no constituyen benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras de la model card no son verificables.
- Requisitos del artefacto binario: Windows 10 22H2 o Windows 11 24H2, arquitectura x64, 8,9 MB de disco y privilegios de administrador para ejecutar el `.exe`. Ejecutarlo supone otorgar control total del sistema a un binario de origen no verificado.

## Comparativa con modelos similares

No disponible. No existe categoria de modelos comparable porque el artefacto no es un modelo. Frente a modelos open source reales (por ejemplo, familias tipo Llama, Qwen, Mistral o DeepSeek), la comparacion carece de sentido: aquellos publican pesos, tokenizador, configuracion y evaluaciones; este repositorio publica un ZIP con un ejecutable.

| Criterio | Este repositorio | Modelo open source tipico |
|---|---|---|
| Pesos publicados | No | Si (safetensors/GGUF) |
| Arquitectura documentada | No | Si |
| Evaluaciones reproducibles | No | Habitualmente si |
| Ejecutable binario | Si (`.exe` con contrasena) | No |
| Trazabilidad del autor | Baja (enlaces a otra cuenta de GitHub) | Media-alta |
| Uso recomendado | Ninguno | Inferencia, ajuste fino, evaluacion |

## Limitaciones y advertencias

- No es un modelo de IA: cualquier expectativa de generacion de texto, codigo o razonamiento es infundada.
- Riesgo de malware: ZIP con contrasena, ejecutable ofuscado, peticion de ejecucion como administrador y recomendacion de excluirlo de Windows Defender y SmartScreen.
- Enlaces de descarga alojados en un repositorio de GitHub de una cuenta distinta a la del autor en Hugging Face (`YannisDegroot`), lo que rompe la trazabilidad.
- Cifras de rendimiento no verificables y sin metodologia; posibles afirmaciones de marketing enganoso.
- Incumplimiento probable de los terminos de servicio de *Escape From Tarkov*; riesgo de baneo de cuenta y, en algunas jurisdicciones, de responsabilidad legal por manipulacion de software.
- Licencia MIT declarada en metadatos, pero sin archivo de licencia verificable en la informacion disponible; irrelevante para un binario de esta naturaleza.
- Sesgos y alucinacion: no aplica como modelo; si aplica como material enganoso que simula ser una ficha tecnica.
- No debe descargarse, extraerse ni ejecutarse en ningun entorno, y mucho menos en maquinas de desarrollo, CI/CD o con credenciales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Youzzevic/escape-from-tarkov-radar-esp-2026
- Enlace de descarga citado en la model card (no recomendado): https://github.com/YannisDegroot/escape-from-tarkov-radar-esp-2026/releases/latest/download/escape-from-tarkov-radar-esp-2026-v1.2.0-win64.zip
- Pagina de releases citada en la model card (no recomendada): https://github.com/YannisDegroot/escape-from-tarkov-radar-esp-2026/releases/latest
- Paper, blog, demo o repositorio de codigo del supuesto modelo: no disponible.
