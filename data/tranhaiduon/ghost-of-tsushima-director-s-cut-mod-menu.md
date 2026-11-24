# tranhaiduon/ghost-of-tsushima-director-s-cut-mod-menu

## Resumen

El repositorio `tranhaiduon/ghost-of-tsushima-director-s-cut-mod-menu` alojado en Hugging Face no contiene un modelo de inteligencia artificial, sino un paquete de software para Windows x64 distribuido como archivo ZIP (`ghost-of-tsushima-director-s-cut-mod-menu-v1.2.0-win64.zip`, 8,9 MB) que se presenta como un menú de mods para el videojuego *Ghost of Tsushima Director's Cut*. El autor lo publica bajo licencia MIT y lo etiqueta con lenguajes naturales (en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id) que corresponden a los idiomas de la interfaz del ejecutable, no a capacidades lingüísticas de un modelo.

La model card describe módulos de tipo radar 2D, filtrado de loot, suavizado de entrada Bézier, capa de renderizado "stream-proof" y perfiles JSON intercambiables en caliente, con cifras de consistencia (97,7 %, 96,1 %) y frecuencias de sondeo (364 Hz, 299 Hz) que no son verificables ni corresponden a métricas de un modelo de lenguaje. No hay información sobre arquitectura de red neuronal, parámetros, contexto, tokenizador ni pesos; el pipeline figura como "no disponible".

Desde la perspectiva de un catálogo de modelos de IA open source, esta ficha debe leerse como una advertencia: el artefacto no es un modelo evaluable, no tiene benchmarks, no se puede desplegar con vLLM, llama.cpp u Ollama, y su contenido (ejecutable con contraseña de archivo, instrucciones de "ejecutar como administrador") coincide con patrones habituales de distribución de software potencialmente no deseado. Se documenta aquí por rigor y para evitar confusión en búsquedas de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; paquete de software para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas de idioma del repositorio, no capacidades de modelo) |
| Licencia | MIT |
| Formato de pesos | no disponible (distribución como ZIP con ejecutable `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. El repositorio contiene un binario para Windows x64 (`ghost-of-tsushima-director-s-cut-mod-menu-v1.2.0-win64.exe`, build `v1.0.8 (C889C9)`) empaquetado en un ZIP de 8,9 MB protegido con la contraseña `2026`. La model card menciona componentes como "user-mode external core", "Desktop Duplication rendering", "dynamic offset scanner" y "bezier input smoothing", que son propios de herramientas de modding o trampas (cheats) para videojuegos, no de un modelo generativo.

No se especifican datos de entrenamiento, número de tokens, composición del dataset, ni técnicas de alineación (RLHF, DPO). Las cifras de "consistencia" (97,7 %, 96,1 %) y frecuencias de sondeo (364 Hz, 299 Hz) no van acompañadas de metodología y no son reproducibles a partir de la información disponible.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües de comprensión o generación; las etiquetas de idioma del repositorio se refieren a la localización de la interfaz del ejecutable.
- No dispone de modo "thinking", visión, audio ni ninguna modalidad de IA.
- El contenido descrito (radar 2D, filtro de loot, suavizado de entrada, perfiles JSON) corresponde a funcionalidades de un menú de mods para un videojuego.

## Casos de uso

- No aplica: al no ser un modelo de IA, no tiene casos de uso en generación de texto, código, atención al cliente, RAG, agentes ni análisis de datos.
- Auditoría de seguridad: un equipo puede analizar el binario en un entorno aislado para determinar si el ejecutable realiza acciones no declaradas, dado que solicita ejecución como administrador y se distribuye con contraseña de archivo.
- Catalogación y filtrado: plataformas que indexan repositorios de Hugging Face pueden usar esta ficha para clasificar el artefacto como "no modelo" y evitar que aparezca en búsquedas de LLM.
- Formación en higiene de cadena de suministro: sirve como ejemplo de por qué conviene verificar pipeline, formato de pesos y licencia antes de descargar artefactos etiquetados como modelos.
- Investigación de spam en hubs de modelos: el patrón (tags de videojuego, múltiples idiomas, enlaces a GitHub externo, contraseña en el README) es representativo de campañas de distribución abusiva.
- No se recomienda su uso en producción, en entornos corporativos ni en máquinas con datos sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica de evaluación de modelos, y las cifras internas de la model card (consistencia del 97,7 % y 96,1 %, sondeo a 364 Hz y 299 Hz) no son benchmarks verificables de un modelo de IA.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo; no requiere GPU para inferencia de red neuronal).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows x64 (Windows 11 mencionado en las etiquetas).
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): ninguna; el artefacto es un ejecutable `.exe` para Windows.
- Latencia y throughput: no disponibles; las cifras de frecuencia de sondeo del README no son métricas de inferencia.
- Espacio en disco: 8,9 MB para el ZIP; el tamaño descomprimido no se especifica.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos similares" porque el artefacto no es un modelo de IA. A modo de contraste con artefactos que sí son modelos desplegables:

| Artefacto | Tipo | Parametros | Contexto | Licencia | Desplegable con vLLM/llama.cpp |
|---|---|---|---|---|---|
| `tranhaiduon/ghost-of-tsushima-director-s-cut-mod-menu` | Paquete de software Windows (no modelo) | no disponible | no disponible | MIT | No |
| Modelo LLM open source de referencia (p. ej. familia Llama, Mistral, Qwen) | Modelo de lenguaje | segun variante | segun variante | segun variante | Si |
| Modelo de embeddings open source (p. ej. BGE, E5) | Modelo de representación | segun variante | segun variante | segun variante | Si |

La comparación directa con cualquier LLM carece de sentido técnico: no hay pesos, tokenizador ni configuración de inferencia que comparar.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse, desplegarse ni citarse como tal en contextos de investigación o producción.
- Riesgo de seguridad: se distribuye como ejecutable `.exe` para Windows con instrucciones de "ejecutar como administrador" y un ZIP protegido con contraseña, patrón habitual en campañas de malware o software no deseado; no se ha verificado el contenido del binario.
- El enlace de descarga apunta a un repositorio de GitHub externo (`AkiraHernandez252/...`) distinto del identificador de Hugging Face, lo que dificulta la trazabilidad y la verificación de integridad.
- Las cifras de rendimiento y consistencia del README no son verificables ni reproducibles.
- Licencia MIT declarada, pero sin archivo de licencia ni código fuente en el repositorio que permita confirmar la titularidad.
- Sin pipeline, sin formato de pesos y sin model card técnica: no cumple los mínimos para ser considerado un artefacto de IA auditable.
- Uso comercial: desaconsejado; además, el propósito declarado (mod menu para un videojuego) puede infringir los términos de servicio del juego y la legislación sobre modificación de software.
- Idiomas: las etiquetas de idioma no implican capacidades lingüísticas; no hay tokenizador ni evaluación multilingüe.
- Sesgos y alucinación: no aplica como modelo de lenguaje, pero el README contiene afirmaciones no sustentadas (descargas de 823K+, valoración del 99 %) que no se corresponden con las 0 descargas y 0 likes registrados en Hugging Face.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tranhaiduon/ghost-of-tsushima-director-s-cut-mod-menu
- Repositorio de GitHub referenciado en la model card: https://github.com/AkiraHernandez252/ghost-of-tsushima-director-s-cut-mod-menu
- Releases del repositorio de GitHub: https://github.com/AkiraHernandez252/ghost-of-tsushima-director-s-cut-mod-menu/releases/latest
- Descarga directa del ZIP citada en la model card: https://github.com/AkiraHernandez252/ghost-of-tsushima-director-s-cut-mod-menu/releases/latest/download/ghost-of-tsushima-director-s-cut-mod-menu-v1.2.0-win64.zip
- Paper, blog, demo o documentación técnica: no disponible.
