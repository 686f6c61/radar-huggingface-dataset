# xanaxsadasd/arise-crossover-script-auto-farm-keyless

## Resumen

El identificador `xanaxsadasd/arise-crossover-script-auto-farm-keyless` corresponde a un repositorio alojado en Hugging Face que **no contiene un modelo de inteligencia artificial**. Se trata de un paquete ejecutable para Windows x64 distribuido como archivo ZIP (`solara-executor-v3-keyless-2026-v1.2.2-win64.zip`, 4,8 MB) que la model card presenta como un "script auto farm" y "executor" para el juego Arise Crossover, con módulos de overlay externo, suavizado de entrada y perfilado JSON.

La ficha se ha elaborado a partir de los metadatos públicos del repositorio y de la model card del autor. No existe información sobre arquitectura de red neuronal, pesos, tokenizador, dataset de entrenamiento ni proceso de alineación. El repositorio no declara pipeline de inferencia, no tiene descargas ni likes en el momento de la consulta y su fecha de creación figura como 2026-11-24.

Por tanto, esta ficha documenta lo que el artefacto es (un binario empaquetado con etiquetas de modelo) y advierte de que no debe evaluarse como un modelo de lenguaje. Cualquier dato técnico propio de un LLM se marca como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; es un ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` para Windows) |

## Arquitectura y entrenamiento

No hay arquitectura de modelo que describir. El artefacto es un binario `solara-executor-v3-keyless-2026-v1.2.2-win64.exe` (build `v1.0.6 (2AFC46)`) empaquetado en un ZIP de 4,8 MB protegido con la contraseña `2026`. La model card menciona módulos de "user-mode external core" con cinco hilos de trabajo, renderizado mediante Desktop Duplication, overlay externo a 144 Hz o más, suavizado de entrada Bézier y una tecla de pánico (`END`) para descarga del proceso.

No se documenta ningún proceso de entrenamiento, dataset, tokenizador, RLHF, DPO ni innovación de inferencia. Las etiquetas del repositorio (`windows`, `windows-11`, `x64`, `portable`) confirman que se trata de software de escritorio, no de un modelo.

## Capacidades

- No es un modelo generativo: no produce texto, código, matemáticas ni visión.
- No dispone de tool calling ni function calling en el sentido de un LLM.
- No soporta razonamiento multi-paso ni modo de pensamiento.
- La model card atribuye al binario funciones de overlay externo (cajas 2D/3D, esqueletos de huesos, ESP de distancia), suavizado de apuntado y perfiles intercambiables en caliente.
- Multilingüismo: los metadatos listan 14 idiomas, pero se refieren a la documentación del repositorio, no a capacidades del artefacto.

## Casos de uso

- **No procede como modelo de IA.** El artefacto no ofrece ninguna capacidad de inferencia lingüística, por lo que no es aplicable a generación de texto, código, atención al cliente, resumen, traducción ni análisis.
- **Auditoría de seguridad:** un equipo puede usar esta ficha para identificar repositorios de Hugging Face que distribuyen ejecutables disfrazados de modelos y bloquearlos en políticas de descarga.
- **Formación interna:** sirve como ejemplo docente de etiquetado engañoso en Hugging Face (tags de modelo aplicados a un binario).
- **Análisis de cadena de suministro:** permite documentar el patrón de distribución (ZIP con contraseña, enlaces a GitHub Releases ajenos al autor declarado) para reglas de detección.
- **Cumplimiento de licencias:** el repositorio declara MIT, pero la licencia no cubre el contenido del binario ni su origen; útil para revisar políticas de terceros.
- **Inventario de artefactos:** registrar el repositorio como no apto para pipelines de MLOps o despliegue en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 u 11 de 64 bits, sobre procesadores Intel o AMD x64.
- Opciones de despliegue: no aplica (vLLM, llama.cpp, Ollama o TGI no pueden ejecutar este artefacto).
- Latencia y throughput: la model card cita tiempos de respuesta de menos de 30 ms para el suavizado de entrada y menos de 20 ms para el overlay, sin metodología de medición verificable.

## Comparativa con modelos similares

No disponible. No existe un modelo de IA comparable porque el artefacto no es un modelo. Como referencia de categoría, se trata de un ejecutable de la familia de "executors" y scripts para juegos, sin relación con LLM, modelos de difusión ni modelos multimodales.

## Limitaciones y advertencias

- **No es un modelo de IA:** no debe evaluarse con MMLU, HumanEval, GSM8K ni métricas equivalentes.
- **Riesgo de seguridad alto:** distribución de un `.exe` en un repositorio de Hugging Face con etiquetas de modelo, contraseña en el propio README y enlaces de descarga a un repositorio de GitHub de un tercero (`schneider6972`) distinto del autor declarado (`sIbrahim87427` / `xanaxsadasd`).
- **Posible malware:** los patrones descritos (ZIP con contraseña, ejecución como administrador, desactivación de alertas de SmartScreen) son habituales en campañas de distribución de software malicioso.
- **Licencia MIT engañosa:** la licencia declarada no aclara la procedencia del binario ni la legalidad de su contenido.
- **Sin trazabilidad:** cero descargas y cero likes en el momento de la consulta, sin historial de versiones verificable.
- **Uso comercial:** desaconsejado en cualquier contexto; además, los scripts de automatización de juegos suelen infringir los términos de servicio de los juegos objetivo.
- **Resultados de búsqueda no relevantes:** la búsqueda web devolvió únicamente una página de intranet de SharePoint sin relación con el artefacto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/xanaxsadasd/arise-crossover-script-auto-farm-keyless
- Enlace de descarga citado en la model card (GitHub Releases de un tercero): https://github.com/schneider6972/solara-executor-v3-keyless-2026/releases/download/v1.2.0/solara-executor-v3-keyless-2026-v1.2.2-win64.zip
- Releases del repositorio citado en la model card: https://github.com/sIbrahim87427/arise-crossover-script-auto-farm-keyless/releases/latest
- Paper, blog o demo: no disponible.
