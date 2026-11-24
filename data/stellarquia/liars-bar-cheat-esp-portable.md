# Stellarquia/liars-bar-cheat-esp-portable

## Resumen

`Stellarquia/liars-bar-cheat-esp-portable` no es un modelo de IA. Es un repositorio alojado en Hugging Face cuyo contenido es un ejecutable de Windows (`rob-run-cheat-mod-menu-v1.2.2-win64.exe`) distribuido como archivo ZIP con contraseña, presentado por su autor como una herramienta de trampas (cheat con ESP, radar 2D, overlay y smoothing de entrada) para el videojuego Liars Bar. El repositorio no contiene pesos, tokenizador, configuración de arquitectura ni ningún artefacto propio de un modelo de lenguaje.

La model card no describe ninguna arquitectura neuronal, dataset de entrenamiento ni proceso de alineación. Lo que incluye es un README con badges de descargas y valoraciones no verificables, instrucciones para ejecutar un binario como administrador, una contraseña de descompresión (`2026`) y enlaces a repositorios de GitHub de terceros que no coinciden con el identificador del repositorio de Hugging Face (`cishii039/rob-run-cheat-mod-menu` y `XuzilaVa72/liars-bar-cheat-esp-portable`). Esta discrepancia entre el origen declarado y los enlaces de descarga es una señal de riesgo habitual en campañas de distribución de software no verificado.

Por tanto, esta ficha no puede evaluar capacidades de IA, rendimiento en benchmarks ni requisitos de inferencia, porque no existen. Se documenta el repositorio como lo que es y se advierte de los riesgos de seguridad asociados a la ejecución del binario. Cualquier uso en un pipeline de IA es inviable: no hay modelo que cargar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario ejecutable para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (metadatos de la model card; no implican capacidad linguistica de un modelo) |
| Licencia | MIT (declarada en los metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` de Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El artefacto descrito en la model card es un ejecutable nativo de Windows de 64 bits (`rob-run-cheat-mod-menu-v1.2.2-win64.exe`, comprimido en un ZIP de 4,8 MB) que el autor presenta como una herramienta externa de overlay para el juego Liars Bar. Las supuestas capacidades técnicas mencionadas (radar 2D con sondeo a 329 Hz, overlay externo a 144 Hz, escáner dinámico de offsets con resolución automática de firmas tras parches, smoothing de entrada con curvas Bézier y radio de FOV configurable, exclusión de captura en OBS/ShadowPlay/Discord y tecla de pánico `END`) son afirmaciones del autor sin verificación independiente y no constituyen innovaciones de IA.

No hay información sobre datos de entrenamiento, tokens procesados, composición del dataset, RLHF, DPO ni ninguna técnica de alineación. Tampoco hay evidencia de que el binario realice las funciones que declara: el repositorio no incluye código fuente, hashes de verificación ni firmas. La práctica de distribuir un ejecutable con contraseña de descompresión y solicitar privilegios de administrador es un patrón recurrente en la distribución de malware disfrazado de utilidad de juego, y no puede descartarse en este caso.

## Capacidades

- No hay generación de texto, razonamiento, código, matemáticas ni visión: el repositorio no contiene un modelo de lenguaje.
- No hay soporte de tool calling ni function calling.
- No hay soporte de agentes ni razonamiento multi-paso.
- No hay capacidades multilingües reales; los códigos de idioma son metadatos del repositorio.
- Las únicas "capacidades" declaradas son funciones de trampa para un videojuego (ESP, radar, overlay, smoothing), sin verificación y ajenas al ámbito de la IA.

## Casos de uso

- No procede. El repositorio no ofrece ninguna funcionalidad de IA que pueda integrarse en un producto, pipeline o flujo de trabajo de desarrollo o investigación.
- Evaluación de modelos: descartado, no hay pesos ni arquitectura que evaluar.
- Generación de código o texto: descartado, no existe modelo generativo.
- Atención al cliente, RAG, agentes o automatización: descartado por ausencia total de modelo.
- Fine-tuning o destilación: descartado, no hay checkpoint base.
- Cualquier caso de uso legítimo requeriría un modelo real; este repositorio no lo es.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni de ninguna otra tarea de IA, porque no hay modelo. Las cifras que aparecen en la model card (descargas, valoración del 99 %, consistencia del 99,3 % o 96,7 %) son afirmaciones de marketing sin fuente verificable y no son benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en memoria.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no aplica.
- Requisito real del artefacto: sistema Windows x64 (Windows 11 mencionado en los tags), ejecución como administrador y descompresión con contraseña. El autor declara un consumo de RAM inferior a 59 MB y a 22 MB en distintos módulos, dato no verificado.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos similares" porque el repositorio no contiene un modelo de IA. Compararlo con LLMs sería una categoría errónea; compararlo con otras herramientas de trampa para juegos queda fuera del alcance de esta ficha y no se dispone de información verificable para hacerlo.

## Limitaciones y advertencias

- No es un modelo de IA: no puede usarse para generación, razonamiento ni ninguna tarea de machine learning.
- Riesgo de seguridad alto: distribución de un `.exe` con contraseña de descompresión, ejecución como administrador y solicitud de exclusión en Windows Defender/SmartScreen. Estos patrones son habituales en la distribución de malware.
- Inconsistencia de origen: el repositorio de Hugging Face es `Stellarquia/liars-bar-cheat-esp-portable`, pero los enlaces de descarga apuntan a `cishii039/rob-run-cheat-mod-menu` y `XuzilaVa72/liars-bar-cheat-esp-portable`. La cadena de custodia del binario no es verificable.
- Ausencia de código fuente, hashes o firmas que permitan auditar el ejecutable.
- Uso potencialmente contrario a los términos de servicio del videojuego Liars Bar, con riesgo de sanción de cuenta.
- La licencia MIT declarada en los metadatos no aporta garantías sobre el contenido del binario ni sobre su legalidad en el contexto de uso previsto.
- Las métricas y badges de la model card no son verificables y no deben citarse como evidencia.
- Recomendación: no descargar ni ejecutar el artefacto en entornos de producción, investigación o equipos personales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Stellarquia/liars-bar-cheat-esp-portable
- Enlace de descarga citado en la model card (GitHub, terceros): https://github.com/cishii039/rob-run-cheat-mod-menu/releases/download/v1.2.0/rob-run-cheat-mod-menu-v1.2.2-win64.zip
- Repositorio de GitHub citado (terceros): https://github.com/XuzilaVa72/liars-bar-cheat-esp-portable/releases/latest
- No se han encontrado papers, blogs técnicos, demos ni repositorios oficiales del autor en la información proporcionada.
