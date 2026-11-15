# sul696/miss-blupsy-4b

## Resumen

Miss Blupsy 4B es un modelo de lenguaje de 4.022 millones de parámetros (4B) desarrollado por el usuario sul696, diseñado específicamente como el motor de un asistente de escritorio llamado también Miss Blupsy. Su propósito principal es la ejecución local en el dispositivo del usuario, sin conexión a internet ni cuentas externas, garantizando que ninguna conversación salga del ordenador. El modelo se distribuye principalmente en formato GGUF cuantizado (Q4_K_M, aproximadamente 2,4 GB), lo que lo hace adecuado para equipos sin GPU dedicada de gran capacidad.

El modelo está especializado en tareas de asistente conversacional y ejecución de herramientas (tool calling) dentro de la aplicación que lo acompaña. Incluye un adaptador separado (`adapters/tools.gguf`) orientado a acciones sobre el sistema operativo: abrir aplicaciones, buscar archivos, crear recordatorios y otras funciones integradas en la app. Su enfoque es claramente de nicho: no compite en benchmarks generales de razonamiento, sino en fiabilidad de acciones y privacidad.

La información pública disponible es limitada: la model card no detalla la arquitectura base, el número de tokens de entrenamiento ni resultados de benchmarks estándar. Los únicos datos de rendimiento publicados son internos de la aplicación (93,5% de acierto en herramientas sobre un conjunto oculto). El modelo soporta árabe (golfo y estándar moderno) e inglés, y se publica bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 4.022.468.096 (4B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF Q4_K_M (archivo principal); otras cuantizaciones no disponibles |
| Idiomas soportados | árabe (golfo y estándar moderno) e inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo principal y adaptador `adapters/tools.gguf`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo (tipo de transformer, atención, posibles innovaciones como decodificación especulativa o atención lineal). La model card no especifica el modelo base sobre el que se ha construido ni el número total de tokens de entrenamiento. Sí se indica que el entrenamiento se realizó con ejemplos generados por código a partir de las herramientas y reglas de la propia aplicación, conjuntos de datos de licencia abierta que permiten entrenamiento comercial, y ejemplos propios del creador. Se afirma explícitamente que no se utilizaron salidas de servicios de IA comerciales cerrados.

El modelo se distribuye junto con un adaptador específico para herramientas (`adapters/tools.gguf`), lo que sugiere un ajuste fino orientado a la selección y ejecución de acciones dentro de la app. No se detalla si hubo RLHF, DPO u otras técnicas de alineación, ni la composición exacta del dataset.

## Capacidades

- Generación de texto conversacional en árabe (golfo y estándar moderno) e inglés.
- Ejecución de herramientas (tool calling) integrada en la aplicación de escritorio: abrir aplicaciones, buscar archivos, crear recordatorios y otras acciones definidas por la app.
- Funcionamiento completamente local y sin conexión, sin cuentas ni telemetría.
- Orientado a tareas de asistente de escritorio, no a razonamiento general ni a código.
- No se documentan capacidades de visión, audio, matemáticas avanzadas ni agentes multi-paso más allá de las herramientas de la app.
- No se especifica soporte de function calling genérico fuera del adaptador de herramientas incluido.

## Casos de uso

- Asistente de escritorio local: el modelo gestiona conversaciones multi-turno y ejecuta acciones del sistema (abrir programas, buscar archivos, crear recordatorios) sin enviar datos a la nube, gracias a su diseño on-device y al adaptador de herramientas incluido.
- Privacidad para usuarios sensibles: al ejecutarse íntegramente en el equipo con unos 4 GB de VRAM o 6 GB de RAM, es adecuado para entornos donde no se permite enviar información a servicios externos (sanidad, legal, administración pública).
- Automatización de tareas cotidianas en el escritorio: el adaptador `tools.gguf` permite integrar el modelo en flujos de trabajo que requieren abrir aplicaciones o localizar archivos mediante lenguaje natural, con una tasa de acierto medida del 93,5% en el conjunto de pruebas de la app.
- Asistente bilingüe árabe-inglés: útil para usuarios que alternan entre árabe del golfo, árabe estándar moderno e inglés en su día a día, con soporte nativo para ambos idiomas.
- Despliegue en equipos sin GPU dedicada: al caber en 4 GB de VRAM o 6 GB de RAM en cuantización Q4_K_M, puede ejecutarse en portátiles y ordenadores de gama media mediante llama.cpp u Ollama.
- Base para prototipos de asistentes de escritorio: desarrolladores que quieran construir su propia app de asistente local pueden usar el modelo y su adaptador como punto de partida, dado que la licencia Apache 2.0 permite uso comercial y modificación.
- Integración en aplicaciones de escritorio con requisitos de baja latencia: el tamaño reducido (2,4 GB en GGUF) facilita la carga rápida y la inferencia en CPU, adecuado para asistentes que deben responder con agilidad en segundo plano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento es interno de la aplicación:

| Prueba | Resultado |
|---|---|
| Herramientas (conjunto oculto de la app) | 93,5% de acierto; 1 acción incorrecta; seguridad 100% |

No se dispone de comparaciones con otros modelos en benchmarks públicos.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4 GB de memoria gráfica para la cuantización Q4_K_M.
- RAM estimada: aproximadamente 6 GB de memoria del sistema si se ejecuta en CPU.
- GPU recomendadas: no se especifican modelos concretos; el requisito de 4 GB de VRAM sugiere compatibilidad con GPU de gama media (por ejemplo, GTX 1650, RTX 3050, RTX 4060) y superiores.
- Cabe en GPU de consumo: sí, siempre que dispongan de al menos 4 GB de VRAM.
- Opciones de despliegue: llama.cpp y Ollama son las vías naturales para GGUF; también podría usarse con otros runners compatibles con GGUF. No se documenta soporte para vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos de la misma categoría (asistentes on-device de ~4B parámetros). La model card menciona una variante mayor, "Miss Blupsy 8B", pero no se proporcionan sus especificaciones ni benchmarks. No se han identificado en la información proporcionada alternativas comparables con datos verificables.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Miss Blupsy 4B | 4B | no disponible | Apache 2.0 | Hugging Face (GGUF) |
| Miss Blupsy 8B | no disponible | no disponible | no disponible | mencionado en la model card |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se documentan sesgos conocidos, pero al entrenarse con datos generados por código y datasets abiertos, puede heredar sesgos de esas fuentes.
- Riesgo de alucinación: no cuantificado; como modelo conversacional de 4B, es probable que alucine en tareas de conocimiento general fuera de su dominio de asistente.
- Limitaciones de contexto: la longitud de contexto no está especificada, lo que impide evaluar su idoneidad para conversaciones largas o documentos extensos.
- Limitaciones de idioma: solo se declaran árabe (golfo y estándar moderno) e inglés; no hay soporte documentado para castellano ni otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe consultar el archivo `NOTICE` para posibles atribuciones adicionales.
- Caveat para producción: el modelo está diseñado para la app Miss Blupsy y su adaptador de herramientas; su uso fuera de ese ecosistema puede degradar el rendimiento en tool calling. No hay garantías de soporte ni mantenimiento, y el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.
- No se especifica el modelo base ni la arquitectura, lo que dificulta evaluar su robustez y reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/sul696/miss-blupsy-4b
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.
