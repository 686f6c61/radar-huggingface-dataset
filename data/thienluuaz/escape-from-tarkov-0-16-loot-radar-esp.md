# thienluuaz/escape-from-tarkov-0-16-loot-radar-esp

## Resumen

`thienluuaz/escape-from-tarkov-0-16-loot-radar-esp` es un repositorio alojado en Hugging Face que no contiene un modelo de inteligencia artificial, sino un paquete ejecutable para Windows x64 distribuido como archivo ZIP (`escape-from-tarkov-0-16-loot-radar-esp-v1.2.0-win64.zip`, 8,9 MB). Su model card lo presenta como una herramienta externa de tipo "loot radar ESP" orientada al videojuego Escape From Tarkov en su versión 0.16, con módulos de suavizado de entrada, perfiles JSON intercambiables en caliente y una capa de renderizado que, segun el autor, evita la captura por OBS, ShadowPlay y Discord.

El artefacto no incluye pesos, tokenizador, configuración de arquitectura ni pipeline de inferencia. Los tags del repositorio (windows, windows-11, x64, portable) y la ausencia de un campo `pipeline` confirman que no se trata de un modelo entrenado, sino de un binario empaquetado. Por tanto, no es evaluable como modelo de lenguaje ni como modelo multimodal: no hay parámetros, contexto, cuantizaciones ni datos de entrenamiento que analizar.

La relevancia de esta ficha es, por tanto, descriptiva y de advertencia: documenta qué es realmente el artefacto, qué contiene su model card y por qué no debe tratarse como un modelo open source al uso. Cualquier evaluación de capacidades, benchmarks o requisitos de hardware en términos de IA carece de sentido para este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe`; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. El contenido descrito en la model card es un ejecutable (`escape-from-tarkov-0-16-loot-radar-esp-v1.2.0-win64.exe`, build `v3.0.1` / `3D6BD2F949`) empaquetado en un ZIP protegido con contraseña (`2026`). La model card menciona componentes como "user-mode external core", "Desktop Duplication rendering", "dynamic offset scanner" y "bezier input smoothing", que corresponden a técnicas de manipulación de memoria y entrada de un juego, no a capas de un transformer.

No hay información sobre tokens de entrenamiento, composición del dataset, RLHF, DPO ni ninguna innovación de modelado. El repositorio no contiene ficheros de pesos, configuración ni código de inferencia verificable.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües en el sentido de un modelo; los idiomas listados son metadatos del repositorio.
- No dispone de modo thinking, visión, audio ni ninguna capacidad cognitiva.
- El artefacto se describe a sí mismo como una utilidad externa para un videojuego concreto, con módulos de perfilado y renderizado.

## Casos de uso

- No procede: el artefacto no es un modelo de IA y no tiene aplicaciones de generación, razonamiento o análisis de datos.
- Evaluación de seguridad de repositorios: un equipo de seguridad puede usar esta ficha para identificar artefactos que se presentan como modelos pero distribuyen ejecutables de terceros.
- Auditoría de licencias y cadena de suministro: permite documentar que un repositorio con licencia MIT puede contener binarios ajenos al ecosistema de modelos.
- Formación interna: sirve como ejemplo de model card que no cumple los estándares de documentación de modelos (sin arquitectura, sin datos, sin evaluación).
- Monitorización de Hugging Face: útil para construir reglas de filtrado que separen repositorios de modelos de repositorios de software.
- No se recomienda su descarga ni ejecución en entornos de producción, desarrollo ni personales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni métricas equivalentes, y las cifras de descargas y valoración que aparecen en la model card (746K descargas, 4,9/5) no son verificables ni constituyen benchmarks técnicos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en memoria de GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica; el artefacto es un ejecutable de Windows x64.
- Latencia y throughput: no disponibles y no medibles en términos de inferencia.
- Requisitos del artefacto según su model card: Windows x64 (incluido Windows 11), menos de 64 MB de RAM para el escáner de offsets, y ejecución como administrador.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el artefacto no es un modelo de IA. Una comparación con modelos de lenguaje, visión o multimodales sería categóricamente incorrecta.

## Limitaciones y advertencias

- No es un modelo de IA: tratarlo como tal lleva a conclusiones erróneas sobre sus capacidades y su seguridad.
- Distribuye un ejecutable de Windows con contraseña de descompresión, lo que impide inspeccionar su contenido antes de ejecutarlo.
- La model card incluye enlaces de descarga hacia un repositorio de GitHub de terceros (`pine6154/...`), no verificados en la información disponible.
- El uso descrito (radar ESP en un videojuego multijugador) puede infringir los términos de servicio del juego y la legislación aplicable en materia de trampas y manipulación de software.
- Riesgo de malware: un binario que requiere ejecución como administrador y que manipula memoria de procesos es un vector habitual de código malicioso; no hay análisis de firma ni reputación disponibles.
- La licencia MIT del repositorio no garantiza la licencia del binario ni de sus dependencias.
- No hay información sobre sesgos, alucinación o limitaciones de contexto porque no hay modelo; esos criterios no son aplicables.
- No debe desplegarse en producción, en equipos corporativos ni en máquinas con datos sensibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/thienluuaz/escape-from-tarkov-0-16-loot-radar-esp
- Repositorio de GitHub citado en la model card: https://github.com/pine6154/escape-from-tarkov-0-16-loot-radar-esp
- Releases citadas en la model card: https://github.com/pine6154/escape-from-tarkov-0-16-loot-radar-esp/releases/latest
- Descarga directa citada en la model card: https://github.com/pine6154/escape-from-tarkov-0-16-loot-radar-esp/releases/latest/download/escape-from-tarkov-0-16-loot-radar-esp-v1.2.0-win64.zip
