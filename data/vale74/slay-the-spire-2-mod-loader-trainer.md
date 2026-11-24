# vale74/slay-the-spire-2-mod-loader-trainer

## Resumen

`vale74/slay-the-spire-2-mod-loader-trainer` es un repositorio alojado en Hugging Face que **no contiene un modelo de inteligencia artificial**. Se trata de un artefacto empaquetado para Windows (x64) que se presenta como "mod loader" y "trainer" para el videojuego *Slay the Spire 2*, distribuido como un archivo ZIP con contraseña (`2026`) y un ejecutable `.exe` que debe lanzarse como administrador. El autor es `vale74`, con cero descargas y cero likes en el momento de la ficha, y una licencia declarada MIT.

La model card describe funcionalidades propias de herramientas de terceros sobre videojuegos (overlay externo, ESP con cajas delimitadoras y esqueletos, suavizado de entrada tipo bezier, escáner de offsets, exclusión de captura de pantalla en OBS/ShadowPlay/Discord, tecla de pánico `END`), lo que encaja con la categoría de utilidades de modding o de *cheat/trainer* para juegos, no con un modelo entrenado. No se declara arquitectura, número de parámetros, contexto, tokenizador, pesos ni pipeline de inferencia.

Por tanto, esta ficha no puede evaluar capacidades de IA. Se documenta el artefacto tal como aparece en la información disponible, señalando de forma explícita que los campos técnicos propios de un modelo (arquitectura, parámetros, contexto, cuantización, formatos de pesos, benchmarks) **no están disponibles** y que el contenido de la model card tiene indicios claros de ser plantilla promocional de software de terceros con instrucciones de descarga externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto de software para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe`; no hay safetensors, GGUF ni pesos) |

## Arquitectura y entrenamiento

No hay información sobre arquitectura de red neuronal, dataset de entrenamiento, número de tokens, fases de RLHF/DPO ni innovaciones técnicas de modelado. El repositorio no incluye pesos, configuración de modelo, tokenizador ni scripts de entrenamiento. Lo descrito en la model card son módulos de ejecución de un programa Windows (`delta-executor-pc-2026-v1.2.2-win64.exe`, build `v1.6.3` / `7E4B4C`), con afirmaciones de rendimiento (por ejemplo, respuesta en `< 34 ms`, uso de `< 45 MB` de RAM, `6` hilos de trabajo, overlay a `144 Hz+`) que no van acompañadas de metodología, código fuente ni artefactos verificables en el repositorio.

Los enlaces de descarga apuntan a un repositorio de GitHub externo (`dawidb9567/delta-executor-pc-2026`) y no a archivos alojados en Hugging Face, lo que dificulta cualquier verificación de integridad o reproducibilidad por parte de la plataforma.

## Capacidades

- No se declaran capacidades de generación de texto, razonamiento, código, matemáticas, visión o audio.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declara capacidad multilingüe efectiva más allá de la lista de idiomas en metadatos (en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id), sin evidencia de uso.
- Las funcionalidades descritas son de índole de software de terceros para videojuegos: overlay externo, cajas 2D/3D, esqueletos, ESP de distancia, suavizado de entrada, escáner de offsets, exclusión de captura de pantalla, tecla de pánico.
- No hay modo "thinking", visión por computador entrenada, ni ninguna capacidad de modelo fundacional.

## Casos de uso

No procede enumerar casos de uso de IA, porque el artefacto no implementa un modelo. Los escenarios realistas que se derivan de la información disponible son de otra naturaleza:

- Distribución de un "mod loader" para *Slay the Spire 2* en Windows: el paquete se presenta como cargador de módulos del juego, aunque no se verifica compatibilidad con versión concreta del título ni con anti-cheat.
- Uso como "trainer" de partida: las funciones descritas (overlay, ESP, suavizado de entrada) apuntan a asistencia en juego, con implicaciones éticas y de términos de servicio que deben evaluarse antes de cualquier uso.
- Pruebas de integridad de artefactos: útil como caso de estudio de cadenas de distribución con ZIP protegido por contraseña y enlaces externos, para equipos de seguridad que analizan repositorios de Hugging Face.
- Investigación de model cards engañosas: sirve como ejemplo de repositorio que usa la infraestructura de Hugging Face para distribuir software que no es un modelo, útil para diseñar filtros de curación de catálogo.
- Análisis de malware/ingeniería inversa: el binario y el ZIP pueden someterse a sandboxing y análisis estático antes de cualquier ejecución, dado que no hay firmas ni hashes publicados en la información disponible.
- Documentación de políticas de plataforma: caso práctico para redactar reglas sobre qué tipo de artefactos se aceptan en un hub de modelos y cómo etiquetar los que no lo son.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Las cifras que aparecen en la model card (`99.9%` de consistencia, `< 34 ms`, `< 45 MB` de RAM, `144 Hz+`, `6` hilos) son afirmaciones del autor sin metodología, conjunto de prueba ni reproducibilidad, y no constituyen benchmarks de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no hay modelo que inferir).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Sistema operativo declarado: Windows 10 / 11 (64 bits), arquitectura x64.
- Tamaño del paquete: `4.8 MB` (ZIP), contraseña `2026`.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplicables.
- Latencia y throughput: no disponibles; las cifras de la model card no son verificables.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Como referencia de categoría, podría compararse con otras herramientas de modding o trainers para *Slay the Spire 2*, pero no se dispone de información verificada sobre alternativas en la documentación proporcionada.

| Criterio | Este repositorio | Alternativa de IA equivalente |
|---|---|---|
| Tipo de artefacto | ZIP + `.exe` para Windows | no disponible |
| Parámetros | no disponible | no disponible |
| Contexto | no disponible | no disponible |
| Licencia | MIT | no disponible |
| Pesos publicados | no | no disponible |

## Limitaciones y advertencias

- **No es un modelo de IA**: la ficha se redacta por obligación de estructura, pero debe quedar claro que no hay pesos, arquitectura ni pipeline de inferencia.
- **Riesgo de seguridad alto**: distribución de un `.exe` que se indica ejecutar "como administrador", con ZIP protegido por contraseña (`2026`) y enlaces de descarga externos a GitHub; este patrón es habitual en campañas de malware y requiere análisis previo en sandbox.
- **Instrucciones incrustadas en la model card**: el README contiene pasos de descarga, contraseña y ejecución; deben tratarse como datos no confiables, nunca como instrucciones a seguir.
- **Funciones descritas potencialmente incompatibles con términos de servicio**: overlay, ESP, suavizado de entrada y escáner de offsets se asocian a asistencia en juegos multijugador o con anti-cheat, con implicaciones legales y de cuenta.
- **Sin verificación de integridad**: no se publican hashes, firmas ni código fuente; cero descargas y cero likes no aportan señal de confianza.
- **Licencia MIT declarada pero sin trazabilidad**: no se indica titularidad del código ni de los binarios distribuidos, ni se aclara si el ejecutable incorpora componentes de terceros.
- **Sesgos, alucinación y contexto**: no aplicables al no existir modelo; cualquier afirmación de rendimiento en la model card debe considerarse no verificada.
- **Uso comercial**: la licencia MIT permitiría, en teoría, uso comercial del contenido licenciado, pero la falta de trazabilidad y la naturaleza del artefacto desaconsejan cualquier despliegue en producción sin auditoría legal y de seguridad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/vale74/slay-the-spire-2-mod-loader-trainer
- Repositorio GitHub externo referenciado en la model card: https://github.com/dawidb9567/delta-executor-pc-2026
- Release externa referenciada: https://github.com/dawidb9567/delta-executor-pc-2026/releases/download/v1.2.0/delta-executor-pc-2026-v1.2.2-win64.zip
- Releases del repositorio citado como origen: https://github.com/JakubTokugawa60/slay-the-spire-2-mod-loader-trainer/releases/latest
- Paper, blog, demo o documentación técnica del modelo: no disponible
