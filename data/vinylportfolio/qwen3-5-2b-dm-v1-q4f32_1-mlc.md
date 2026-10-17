# VinylPortfolio/Qwen3.5-2B-dm-v1-q4f32_1-MLC

## Resumen

Qwen3.5-2B-dm-v1 es un ajuste fino por LoRA del modelo base Qwen3.5-2B de Alibaba Cloud, desarrollado por el usuario VinylPortfolio para un uso muy concreto: ejercer de *Dungeon Master* (narrador y motor de diálogo de personajes no jugables) y de analizador sintáctico de las acciones del jugador dentro del videojuego *Endless Adventure*. No es un modelo de chat general: el autor lo describe explícitamente como un componente que se ejecuta dentro del runtime del juego, que es quien construye los prompts y valida cada línea generada.

El modelo se distribuye ya fusionado (LoRA mezclada en los pesos base) y convertido al formato MLC para su ejecución en el navegador mediante WebLLM, con cuantización de 4 bits `q4f32_1`. El repositorio ocupa 1,1 GB y la licencia es Apache-2.0, la misma del modelo base. El entrenamiento se hizo sobre 7.391 filas generadas sintéticamente con Qwen3.5-9B como modelo profesor y filtradas por las comprobaciones internas del juego (estilo, coherencia con el lore, seguridad y resultado de la acción).

Su relevancia práctica es doble: por un lado, demuestra un patrón de despliegue de LLM pequeño totalmente local en el navegador vía WebGPU, sin backend; por otro, ilustra una metodología de destilación con modelo profesor abierto y filtros automáticos para dominios muy restringidos. Las cifras publicadas por el autor son de validación interna del juego, no benchmarks estándar, y el modelo solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-2B); detalles de arquitectura del base no disponibles |
| Parametros totales | 2B (según denominación del modelo base); recuento exacto no disponible |
| Parametros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | `q4f32_1` (4 bits, formato MLC); solo se publica esa variante |
| Idiomas soportados | Inglés (`en`) únicamente |
| Licencia | Apache-2.0 |
| Formato de pesos | MLC LLM / WebLLM (no se publican safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B, un transformer de aproximadamente 2.000 millones de parámetros desarrollado por el equipo Qwen de Alibaba Cloud bajo licencia Apache-2.0. Sobre él se aplicó un ajuste fino LoRA de rango 16 y alpha 32 sobre todas las proyecciones de atención y MLP, con 10,9 millones de parámetros entrenables, 2 épocas, 924 pasos, tamaño de lote 16 y tasa de aprendizaje 2e-4, ejecutado en GPUs Kaggle T4. Posteriormente la LoRA se fusionó en los pesos base y el conjunto se reconvirtió al layout estándar de MLC, re-cuantizando a `q4f32_1`; el autor indica que verificó que el cuantizador coincide exactamente con el de la conversión oficial del modelo base.

El dataset consta de 7.391 filas: 3.691 líneas de voz (PNJ y narrador) y 3.700 filas de *parseo* estructurado. Los prompts se construyeron por código a partir de los datos propios del juego (personajes, lugares, misiones y resultados de reglas), las respuestas candidatas las generó Qwen3.5-9B (Apache-2.0) y un conjunto de comprobaciones del propio juego (estilo, lore, seguridad y resultado) filtró las válidas. El autor declara que no se emplearon modelos con licencia Llama ni salidas de modelos cerrados para generar los datos de entrenamiento. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de diálogo de personaje (PNJ) y de narración en estilo fantasía, en líneas cortas y en inglés.
- *Parsing* de la intervención del jugador (texto tecleado o voz transcrita) a una estructura corta y procesable por el juego.
- Coherencia con el lore del juego: personajes, lugares, misiones y resultados de tiradas, inyectados vía prompt.
- Ejecución local en el navegador mediante WebLLM y WebGPU, sin servidor.
- No soporta tool calling ni function calling de propósito general según la información disponible.
- No se documentan capacidades de razonamiento multi-paso, matemáticas, código, visión o audio.
- Multilingüe: no; únicamente inglés.

## Casos de uso

- Diálogo de PNJ en un RPG en el navegador: el modelo recibe el estado de la conversación y el contexto del personaje y devuelve una línea breve en personaje; al ejecutarse en WebLLM con pesos de 4 bits, la inferencia ocurre en el cliente y evita costes de API por turno.
- *Parsing* de acciones del jugador: convierte una frase libre ("intento forzar la puerta con la palanca") en una estructura corta que el motor de reglas puede resolver, lo que permite entrada en lenguaje natural sin backend.
- Narración dinámica de escenas: genera descripciones de una o dos frases para transiciones, encuentros y resultados de tiradas, manteniendo el tono del juego.
- Prototipado rápido de NPCs: sirve como base para equipos que quieran experimentar con un modelo de 2B especializado en rol y desplegarlo en web, y como plantilla de conversión MLC/WebLLM reutilizable.
- Modo sin conexión o de bajo coste: al pesar 1,1 GB en el repositorio y ejecutarse en el navegador, encaja en demos jugables offline o en entornos con conectividad limitada.
- *Testing* de pipelines de validación: útil para equipos que quieran reproducir la metodología de destilación con modelo profesor abierto más filtros automáticos de dominio (estilo, lore, seguridad) en otros juegos o dominios narrativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí reporta una evaluación propia sobre la suite *off-script* del juego, ejecutada en el navegador sobre una GTX 1080 Ti:

| Prueba | Qwen3.5-2B-dm-v1 | Qwen3.5-2B (stock) |
|---|---|---|
| Primeros 200 turnos: fallos graves | 0 | 4 |
| Primeros 200 turnos: *fallbacks* | 0 | 4 |
| Test de 60 turnos encadenados, bajo la misma carga | Tan rápido como el stock | Referencia |

Se trata de métricas internas del juego, sin detalle de la composición del conjunto de prueba ni intervalos de confianza; no son comparables con benchmarks académicos. No se publican cifras de latencia, tokens por segundo ni perplejidad.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,5-2 GB con cuantización de 4 bits (el repositorio de pesos ocupa 1,1 GB); el autor no publica una cifra oficial.
- GPU validadas: GTX 1080 Ti, usada por el autor para las pruebas en navegador vía WebGPU.
- Cabe en GPU de consumo: sí, por tamaño; el requisito real es soporte de WebGPU en el navegador (Chrome/Edge en Windows, macOS y Android; el soporte en Linux es más limitado).
- Opciones de despliegue: WebLLM (vía `mlc-llm`, cargando el modelo como custom model que copia el registro `Qwen3.5-2B-q4f32_1-MLC`) y, en general, el runtime de MLC LLM. No se publican pesos en GGUF ni safetensors, por lo que llama.cpp, Ollama o vLLM no son utilizables directamente con este repositorio.
- Latencia y throughput: no disponibles numéricamente; el autor solo indica que en un test de 60 turnos encadenados rinde "tan rápido como" el Qwen3.5-2B stock bajo la misma carga.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Qwen3.5-2B-dm-v1 (este) | 2B | No disponible | DM y parser para *Endless Adventure*, solo inglés | Apache-2.0 | MLC `q4f32_1` / WebLLM |
| Qwen3.5-2B (base) | 2B | No disponible | Propósito general, multilingual | Apache-2.0 | Múltiples, incluida conversión MLC oficial |
| Qwen3.5-9B (profesor) | 9B | No disponible | Propósito general, usado para generar los datos | Apache-2.0 | No disponible en esta ficha |

No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada, por lo que no se puede establecer una comparación de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Solo inglés: cualquier interacción en castellano queda fuera de su distribución de entrenamiento.
- No es un modelo de chat general; el autor lo declara explícitamente inadecuado fuera del runtime del juego.
- Requiere las comprobaciones del runtime (puerta de frases, lista de lore, reglas de seguridad): sin ellas, la calidad de salida no está garantizada.
- Riesgo de alucinación acotado pero real: puede repetirse, producir frases corruptas o inventar topónimos.
- No debe usarse para consejos ni información del mundo real.
- El modelo incorpora material del System Reference Document 5.2 de Wizards of the Coast, distribuido bajo CC BY 4.0; esa parte exige atribución a Wizards of the Coast y el enlace a la licencia, independientemente de la Apache-2.0 de los pesos.
- El proceso de datos usó salidas de un modelo abierto (Qwen3.5-9B) filtradas automáticamente; no se documenta auditoría humana del dataset ni evaluación de sesgos.
- Tracción muy baja en HuggingFace (15 descargas, 0 likes) y una sola conversión publicada; no hay garantía de mantenimiento.
- La fecha de creación del repositorio (2026-10-17) y la existencia de Qwen3.5 deben tomarse tal como los declara el autor; esta ficha no verifica esos metadatos de forma independiente.

## Enlaces

- Repositorio del modelo: https://huggingface.co/VinylPortfolio/Qwen3.5-2B-dm-v1-q4f32_1-MLC
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- WebLLM (runtime en navegador): https://github.com/mlc-ai/web-llm
- MLC LLM (organización): https://github.com/mlc-ai
- System Reference Document 5.2: https://www.dndbeyond.com/srd
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/legalcode
- No se han encontrado enlaces adicionales relevantes (papers, blogs o demos) en la búsqueda web realizada; los resultados obtenidos no guardaban relación con el modelo.
