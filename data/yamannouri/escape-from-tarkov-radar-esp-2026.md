# Yamannouri/escape-from-tarkov-radar-esp-2026

## Resumen

El artefacto publicado bajo el identificador `Yamannouri/escape-from-tarkov-radar-esp-2026` no es un modelo de inteligencia artificial. Se trata de un paquete ejecutable para Windows de 64 bits (aproximadamente 4,8 MB) que la model card describe como una herramienta de tipo "radar ESP" (extra-sensory perception, es decir, superposición visual de información) orientada al videojuego *Escape From Tarkov*. El paquete se distribuye como archivo ZIP protegido con contraseña y contiene un binario `.exe` que, segun el autor, se ejecuta en modo usuario y ofrece superposiciones 2D/3D, filtrado de objetos y perfiles JSON intercambiables en caliente.

No existe ninguna arquitectura de red neuronal, pesos, tokenizador ni proceso de entrenamiento asociado a este repositorio. Los metadatos de Hugging Face (tags `windows`, `windows-11`, `x64`, `portable`) y la ausencia de pipeline confirman que se ha subido un binario empaquetado, no un modelo. Por tanto, esta ficha documenta el artefacto tal como aparece publicado y advierte de que no cumple los criterios para ser evaluado como modelo de IA.

La relevancia de esta entrada es fundamentalmente negativa: ejemplifica un patron de publicacion en Hugging Face de software de terceros empaquetado con enlaces a repositorios de GitHub ajenos y contrasenas en la propia model card, practica que dificulta la verificacion de integridad y aumenta el riesgo de suministro de software no auditado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; binario nativo x64 para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos de la model card) |
| Licencia | MIT |
| Formato de pesos | no disponible (se distribuye un ZIP con un `.exe`; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene un modelo entrenado ni codigo de inferencia. La model card describe un ejecutable (`inzoi-cheat-trainer-mod-menu-v1.2.2-win64.exe`, build `v4.0.8 (E3E31A)`) que, segun el autor, emplea "Desktop Duplication" para renderizar una superposicion externa sin inyectar DLL en el proceso del juego, con un nucleo en modo usuario que lee memoria directamente. Estas afirmaciones proceden unicamente del texto del autor y no se han verificado de forma independiente.

No hay informacion sobre datos de entrenamiento, tokens, composicion del dataset, RLHF, DPO ni ninguna innovacion de modelado. Los unicos datos tecnicos declarados son cotas de latencia autoinformadas (menos de 9 ms para el radar 2D, menos de 34 ms para la capa de render excluida de capturas, menos de 37 ms para el nucleo en modo usuario) y porcentajes de consistencia (96,5 % y 97,4 %) sin metodologia de medida descrita.

## Capacidades

- Superposicion de radar 2D y filtrado de objetos por rareza, segun la descripcion del autor.
- Cajas delimitadoras 2D/3D, esqueletos de huesos y distancia en pantalla ("distance ESP").
- Capa de render declarada como no capturable por OBS, ShadowPlay y la captura de pantalla de Discord.
- Cambio en caliente de perfiles JSON (presets "Legit", "Visual" y "Custom").
- Tecla de panico `END` para descarga inmediata del proceso.
- Soporte declarado de Windows 10 22H2 y Windows 11 24H2 en 64 bits.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision artificial, tool calling, capacidades de agente ni modo de pensamiento.

## Casos de uso

No se identifican casos de uso legitimos para un modelo de IA, porque no lo es. Los escenarios que la model card sugiere son:

- Uso como superposicion informativa en partidas de *Escape From Tarkov*: el autor lo plantea para visualizar posiciones y objetos; implica ventaja competitiva y probable incumplimiento de los terminos de servicio del juego.
- Pruebas de renderizado externo en Windows: el enfoque de "Desktop Duplication" podria estudiarse tecnicamente en entornos controlados de investigacion de seguridad grafica.
- Analisis de tecnicas de evasion de captura de pantalla: relevante para equipos de integridad de plataformas y antitrampas.
- Estudio de patrones de distribucion de malware: el empaquetado con contrasena y enlaces a repositorios de terceros es un caso de analisis para equipos de respuesta a incidentes.
- Formacion en concienciacion sobre riesgos de descargas: util como ejemplo didactico de cadena de suministro no verificada.
- Auditoria de repositorios de Hugging Face: sirve como muestra de contenido ajeno a modelos que requiere moderacion.

En ningun caso se recomienda su ejecucion en sistemas de produccion ni en equipos personales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las unicas cifras son autoinformadas por el autor y no comparables: latencias inferiores a 9 ms, 34 ms y 37 ms para distintos modulos, y consistencias del 96,5 % y 97,4 %, sin definicion de la metrica ni del entorno de prueba.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo de IA).
- GPU recomendadas: no aplica; el autor no especifica requisitos de GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Sistema operativo declarado: Windows 10 22H2 y Windows 11 24H2, 64 bits.
- Tamano del paquete: 4,8 MB comprimido.
- Opciones de despliegue: ejecucion directa del `.exe` como administrador, segun el autor; no procede vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: solo cotas autoinformadas (ver seccion anterior); sin datos verificables.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Tampoco se han encontrado en la informacion proporcionada otras publicaciones de Hugging Face con las que establecer una comparacion tecnica rigurosa.

## Limitaciones y advertencias

- No es un modelo de IA: carece de pesos, arquitectura, tokenizador y pipeline; no puede evaluarse con criterios de modelado.
- El binario se distribuye comprimido con contrasena (`2026`) y alojado en un repositorio de GitHub de un tercero (`Roussel10024/inzoi-cheat-trainer-mod-menu`), no en el repositorio del autor declarado; la cadena de custodia no es verificable.
- El nombre del ejecutable (`inzoi-cheat-trainer-mod-menu-v1.2.2-win64.exe`) no coincide con el del proyecto (*Escape From Tarkov*), lo que sugiere reutilizacion de un paquete ajeno o renombrado inconsistente.
- La model card reconoce explicitamente que Windows Defender y SmartScreen pueden alertar sobre el binario e indica al usuario que lo incluya en lista blanca; esta instruccion es un patron habitual en campanas de distribucion de software malicioso.
- Uso en juegos multijugador: probable violacion de los terminos de servicio de *Escape From Tarkov* y riesgo de baneo permanente de cuentas.
- Licencia MIT declarada, pero sin archivo LICENSE verificable en la informacion disponible; la licencia del binario subyacente es incierta.
- Riesgo de suplantacion: el autor de Hugging Face (`Yamannouri`) no coincide con la organizacion de GitHub enlazada (`YannisDegroot`), lo que impide atribuir autoria.
- No apto para produccion, entornos corporativos ni equipos con datos sensibles.
- Los datos de descargas (834K+) y la fecha de creacion (2026) proceden de la model card y no son verificables de forma independiente.
- Los resultados de busqueda web proporcionados no guardan relacion con el artefacto (contenido sobre el trayecto del aeropuerto de Fukuoka a la estacion de Hakata) y no aportan informacion tecnica.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Yamannouri/escape-from-tarkov-radar-esp-2026
- Repositorio de GitHub enlazado en la model card: https://github.com/Roussel10024/inzoi-cheat-trainer-mod-menu
- Release de descarga citada: https://github.com/Roussel10024/inzoi-cheat-trainer-mod-menu/releases/download/v1.2.0/inzoi-cheat-trainer-mod-menu-v1.2.2-win64.zip
- Releases del proyecto declarado: https://github.com/YannisDegroot/escape-from-tarkov-radar-esp-2026/releases/latest
- Paper, blog o demo oficial: no disponible
