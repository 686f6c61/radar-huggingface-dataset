# zaper4life/arc-raiders-cheat-esp-portable

## Resumen

`zaper4life/arc-raiders-cheat-esp-portable` es un repositorio alojado en Hugging Face que **no contiene un modelo de inteligencia artificial**. Se trata de un paquete ejecutable para Windows x64, distribuido como archivo ZIP de 8,9 MB, que la model card presenta como una herramienta de tipo "cheat ESP" (Extra Sensory Perception) para el videojuego *Arc Raiders*. No existe ningún artefacto de pesos, tokenizador, configuración de arquitectura ni pipeline de inferencia asociado al repositorio.

El contenido del repositorio es, por tanto, ajeno al propósito habitual de Hugging Face. La model card incluye instrucciones de descarga desde un repositorio de GitHub externo (`Gretao8833/arc-raiders-cheat-esp-portable`), una contraseña de descompresión (`2026`) y pasos para ejecutar un binario con privilegios de administrador. No se proporciona información sobre arquitectura, parámetros, contexto, datos de entrenamiento ni benchmarks, porque no hay modelo subyacente que describir.

Esta ficha se redacta, por rigor, documentando la ausencia de un modelo y advirtiendo de los riesgos asociados al contenido del repositorio. Cualquier evaluación técnica de tipo "modelo de IA" es inaplicable: los campos de especificaciones, arquitectura, capacidades y benchmarks se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas del repositorio, no capacidades del modelo) |
| Licencia | MIT (según metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal, corpus de entrenamiento, proceso de ajuste (RLHF, DPO, SFT) ni innovación técnica de modelado que documentar. El repositorio aloja un binario ejecutable de Windows (`arc-raiders-cheat-esp-portable-v1.2.0-win64.exe`, build `v1.5.2 (725886)`) empaquetado en un ZIP de 8,9 MB. La model card describe funcionalidades propias de un software de trampas para videojuegos: overlay externo a 144 Hz, cajas delimitadoras 2D/3D, esqueletos de huesos, radar 2D, filtro de loot, escáner de offsets dinámicos y una tecla de pánico (`END`).

Ninguno de esos elementos constituye un sistema de aprendizaje automático. No hay tokenizador, no hay ficheros `safetensors`, `GGUF` ni `pytorch_model.bin`, y no se referencia ningún paper, checkpoint o dataset. La etiqueta `pipeline` del repositorio está vacía.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües en el sentido de un modelo; las etiquetas de idioma del repositorio son metadatos de indexación, no competencias del artefacto.
- El artefacto distribuido es un ejecutable de Windows x64 que, según su propia descripción, interactúa con el proceso del videojuego *Arc Raiders* para superponer información visual (ESP).

## Casos de uso

No se identifican casos de uso legítimos de este repositorio como modelo de IA. Los escenarios que la model card sugiere (uso de ESP en *Arc Raiders*) quedan fuera del ámbito de esta ficha técnica y conllevan riesgos legales y de seguridad que se detallan en la sección de limitaciones. A modo de inventario de lo que el repositorio declara ofrecer, y sin que ello constituya una recomendación de uso:

- Ejecución de un binario portable en Windows 10/11 de 64 bits con privilegios de administrador.
- Superposición de información visual sobre el juego mediante un overlay externo.
- Perfiles JSON intercambiables en caliente entre configuraciones "Legit", "Visual" y "Custom".
- Exclusión de la captura de pantalla en OBS, ShadowPlay y Discord (según la model card).
- Escaneo de offsets tras parches del juego.
- Tecla de descarga de pánico (`END`) para finalizar el proceso.

Ninguno de estos escenarios es un caso de uso de IA, y varios de ellos (evasión de captura, manipulación de un juego en línea) pueden vulnerar términos de servicio y legislación aplicable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni equivalentes porque no hay modelo que evaluar. Las cifras que aparecen en la model card (por ejemplo, "747K+ downloads", "4.8/5 rating", "99.8% consistency", "< 28 ms response time") son afirmaciones del autor sin verificación independiente y no constituyen benchmarks de un modelo de IA.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Requisitos del artefacto distribuido, según su model card: Windows 10/11 de 64 bits, procesadores Intel o AMD x64, y ejecución como administrador. El paquete ocupa 8,9 MB.
- Latencia y throughput: no disponibles ni pertinentes.

## Comparativa con modelos similares

No disponible. No existe categoría de modelos de IA comparable, dado que el repositorio no contiene un modelo. Tampoco procede compararlo con modelos de lenguaje, visión o multimodalidad.

## Limitaciones y advertencias

- **No es un modelo de IA**: el repositorio no contiene pesos, arquitectura ni pipeline; no debe citarse como modelo en ninguna evaluación técnica.
- **Riesgo de seguridad**: la model card instruye a descargar un ZIP desde un repositorio de GitHub de terceros, descomprimirlo con una contraseña fija (`2026`) y ejecutar un `.exe` como administrador. Este patrón es habitual en la distribución de malware y debe tratarse con máxima cautela.
- **Evasión de defensas**: la propia descripción menciona exclusión de captura en OBS, ShadowPlay y Discord, lo que dificulta la inspección por parte de terceros.
- **Posible vulneración de términos de servicio**: el uso de trampas en *Arc Raiders* puede conllevar el baneo de cuentas y, según jurisdicción, responsabilidad legal.
- **Licencia**: el repositorio declara MIT, pero ello no legitima el uso del software frente a los términos de servicio del videojuego ni frente a la legislación de ciberseguridad aplicable.
- **Metadatos engañosos**: las etiquetas de idioma y la licencia MIT no implican que el artefacto sea un modelo multilingüe ni software auditable.
- **Sin verificación**: no hay descargas ni "likes" registrados en Hugging Face en el momento de la consulta, y no se ha publicado auditoría independiente alguna.
- **Alucinación y sesgos**: no aplica como modelo, pero la model card contiene afirmaciones no verificables (cifras de descargas, valoraciones, porcentajes de consistencia) que no deben tomarse como datos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/zaper4life/arc-raiders-cheat-esp-portable
- Repositorio de GitHub referenciado en la model card: https://github.com/Gretao8833/arc-raiders-cheat-esp-portable
- Descarga directa referenciada (ZIP, 8,9 MB): https://github.com/Gretao8833/arc-raiders-cheat-esp-portable/releases/latest/download/arc-raiders-cheat-esp-portable-v1.2.0-win64.zip
- Página de releases: https://github.com/Gretao8833/arc-raiders-cheat-esp-portable/releases/latest
