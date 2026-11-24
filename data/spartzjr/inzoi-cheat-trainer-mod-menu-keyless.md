# spartzjr/inzoi-cheat-trainer-mod-menu-keyless

## Resumen

El repositorio `spartzjr/inzoi-cheat-trainer-mod-menu-keyless` no contiene un modelo de inteligencia artificial. Se trata de un artefacto empaquetado como distribución de Windows (un archivo `.zip` de 4,8 MB con un ejecutable `.exe` y una contraseña de extracción), etiquetado en Hugging Face con metadatos propios de un modelo (`license:mit`, lista de idiomas, tags de región), pero sin pesos, sin arquitectura de red neuronal y sin pipeline de inferencia declarado.

La model card describe supuestas funciones de "trainer" o menú de trucos para el videojuego *Inzoi* (perfiles JSON intercambiables, suavizado de entrada Bézier, radar 2D, filtro de loot, capa de renderizado excluida de capturas). El texto mezcla repetidamente nombres de archivo que hacen referencia a otro juego distinto (*Kingdom Come: Deliverance 2*), lo que constituye una inconsistencia grave y un indicio claro de contenido engañoso o mal etiquetado.

Desde la perspectiva de evaluación de modelos, este repositorio carece de cualquier valor técnico para desarrolladores o investigadores: no hay parámetros, no hay contexto, no hay benchmarks y no hay código de inferencia. Además, la distribución de ejecutables de terceros con contraseña de descompresión y ejecución "como administrador" es un patrón habitual en campañas de malware. Se documenta aquí únicamente para dejar constancia de que no es un modelo y para advertir sobre su naturaleza.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto ejecutable para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto es un `.zip` con un `.exe`; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo que describir. El contenido del repositorio es un paquete comprimido (`kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.zip`, 4,8 MB) que, según la model card, contiene un ejecutable de Windows (`kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.exe`, build `v3.7.2` / `1C901F2975`) protegido con la contraseña `2026`. No se declara proceso de entrenamiento, dataset, tokens, RLHF ni ninguna innovación técnica de aprendizaje automático.

La model card menciona conceptos propios de software de modding o trampas para juegos (escaneo de offsets en memoria, polling a 233 Hz, inyección externa en modo usuario, exclusión de capturas de pantalla), no de un transformer, MoE o SSM. La referencia cruzada a *Kingdom Come: Deliverance 2* en los nombres de archivo, frente al título *Inzoi* del repositorio, sugiere una plantilla reutilizada de forma descuidada.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No dispone de modo de razonamiento (thinking), visión, audio ni capacidades multimodales.
- Las únicas "capacidades" descritas son funciones de trampas para videojuegos (perfiles JSON, radar 2D, filtro de loot, suavizado de entrada), sin verificación independiente.
- Los idiomas listados en los metadatos no implican capacidad lingüística del artefacto; son etiquetas del repositorio.

## Casos de uso

- Ninguno recomendado en el contexto de desarrollo de IA o investigación.
- Auditoría de seguridad: analizar el ejecutable en un entorno aislado (sandbox, máquina virtual sin red) para determinar si el paquete contiene código malicioso, dado el patrón de `.zip` con contraseña y petición de ejecución como administrador.
- Estudio de etiquetado abusivo en Hugging Face: usar este repositorio como ejemplo de artefacto no-modelo que se infiltra en el catálogo con metadatos de modelo.
- Formación en detección de fraudes: ilustrar cómo una model card puede mezclar nombres de juegos, contraseñas de extracción y enlaces de descarga para inducir a error.
- No debe emplearse para generar contenido, procesar lenguaje, automatizar atención al cliente ni integrarse en pipelines de CI/CD.
- No debe descargarse ni ejecutarse en estaciones de trabajo de producción o de desarrollo con credenciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni de ningún otro tipo, porque el artefacto no es un modelo evaluable.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay pesos de modelo).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Plataforma declarada del artefacto: Windows 10/11 de 64 bits, con ejecución "como administrador".
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; la model card cita cifras de polling (233 Hz) y RAM (< 37 MB) del supuesto trainer, sin verificación.

## Comparativa con modelos similares

No disponible. No existe categoría de modelo comparable, ya que el repositorio no contiene un modelo de IA.

| Criterio | Este repositorio | Modelo de IA real (referencia genérica) |
|---|---|---|
| Pesos | No | Sí (safetensors, GGUF, etc.) |
| Arquitectura | No | Transformer, MoE, SSM, híbrida |
| Benchmark publicados | No | Habitualmente sí |
| Ejecutable de Windows | Sí (`.exe` en `.zip`) | No |
| Uso previsto | No declarado / trampas de juego | Inferencia de lenguaje |

## Limitaciones y advertencias

- No es un modelo de IA: no debe tratarse como tal en catálogos, pipelines ni evaluaciones.
- Inconsistencia grave: el título menciona *Inzoi* mientras los archivos hacen referencia a *Kingdom Come: Deliverance 2*.
- Riesgo de seguridad alto: distribución de un `.exe` comprimido con contraseña (`2026`) e instrucciones para ejecutarlo como administrador, patrón frecuente en malware y campañas de ingeniería social.
- Enlaces de descarga apuntan a repositorios de GitHub de terceros no verificados, no al propio repositorio de Hugging Face.
- Cero descargas y cero "likes" en el momento de la consulta; sin comunidad ni validación.
- La licencia MIT declarada no aporta garantías sobre el contenido del ejecutable.
- No usar en producción, ni en máquinas con datos sensibles, ni con privilegios elevados.
- No hay información sobre sesgos, alucinación o limitaciones lingüísticas porque no hay modelo lingüístico.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/spartzjr/inzoi-cheat-trainer-mod-menu-keyless
- Enlace de descarga citado en la model card (no verificado): https://github.com/ErikMercier70637/kingdom-come-deliverance-2-trainer-2026/releases/download/v1.2.0/kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.zip
- Enlace de releases citado en la model card (no verificado): https://github.com/LoriKim03/inzoi-cheat-trainer-mod-menu-keyless/releases/latest
- Paper, blog o demo oficial: no disponible.
