# tory-labs/voin-qwen3.5-9b-gguf

## Resumen

`tory-labs/voin-qwen3.5-9b-gguf` no es un modelo nuevo: es un espejo (mirror) del archivo GGUF que descarga la aplicación voin, publicado sin modificaciones. El modelo original es Qwen/Qwen3.5-9B, desarrollado por Alibaba Qwen y distribuido bajo licencia Apache 2.0; la conversión a GGUF procede del repositorio de unsloth (commit `3885219b6810`). El repositorio contiene un único archivo, `Qwen3.5-9B-Q4_K_M.gguf`, de 5.680.522.464 bytes (unos 5,7 GB), con hash SHA-256 publicado.

El modelo subyacente tiene 8.953.803.264 parámetros según los safetensors del modelo base, lo que lo sitúa en la categoría de 9B. Su interés práctico es que permite ejecutar un modelo conversacional de ese tamaño en hardware de consumo mediante cuantización de 4 bits. La relevancia de este repositorio concreto es la trazabilidad: al ser un espejo con hash documentado, se puede verificar que el archivo descargado por la aplicación coincide byte a byte con la conversión de unsloth.

La información disponible no documenta arquitectura detallada, longitud de contexto, idiomas, composición del dataset ni resultados de benchmarks. Las secciones siguientes indican "no disponible" en esos puntos en lugar de estimarlos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.5-9B; la información proporcionada no detalla la arquitectura) |
| Parámetros totales | 8.953.803.264 (dato de safetensors del modelo base) |
| Parámetros activos | no aplica (no se indica que el modelo sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF Q4_K_M en este repositorio; el repositorio de unsloth referenciado contiene otras variantes cuyo detalle no se proporciona |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `Qwen3.5-9B-Q4_K_M.gguf`, 5.680.522.464 bytes, SHA-256 `03b74727a860a56338e042c4420bb3f04b2fec5734175f4cb9fa853daf52b7e8`) |

## Arquitectura y entrenamiento

Este repositorio no entrena ni modifica nada: redistribuye un único archivo GGUF generado por unsloth a partir de Qwen/Qwen3.5-9B. La model card no describe la arquitectura del modelo base (número de capas, dimensiones ocultas, tipo de atención, uso de MoE o de atención lineal), ni el volumen de tokens de entrenamiento, ni si hubo etapas de RLHF, DPO o ajuste por instrucciones. Tampoco se documenta el proceso de conversión más allá de la referencia al commit de unsloth.

El único detalle técnico verificable es el formato de cuantización: Q4_K_M es una cuantización k-quant de 4 bits que agrupa los pesos en bloques con escalas y offsets propios y mantiene algunas capas o tensores en mayor precisión para limitar la pérdida. La etiqueta `imatrix` del repositorio apunta a que el proceso de cuantización pudo usar una matriz de importancia para decidir qué pesos preservar, pero la model card no lo confirma ni documenta la metodología.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` del repositorio y el pipeline de uso previsto (app voin) indican un modelo orientado a diálogo multi-turno; no se detallan capacidades específicas.
- Razonamiento, código, matemáticas y visión: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el modelo base es de Alibaba Qwen, pero no se confirma la cobertura de idiomas).
- Modos especiales (thinking mode, audio, etc.): no disponible.
- Compatibilidad con endpoints: el repositorio incluye la etiqueta `endpoints_compatible`.

## Casos de uso

- Asistente local de escritorio: el archivo Q4_K_M (5,7 GB) puede cargarse con llama.cpp u Ollama en un equipo con 8-12 GB de VRAM o incluso en CPU, lo que permite un asistente conversacional que no envía datos a ningún servidor. Es el escenario para el que existe este espejo, ya que es el archivo que consume la aplicación voin.
- Verificación de integridad en despliegues: al publicarse el SHA-256, un equipo de plataforma puede comprobar en un pipeline que la copia descargada coincide con la conversión de unsloth antes de servirla, lo que reduce el riesgo de artefactos corruptos o manipulados.
- Prototipado de chatbots sin infraestructura cloud: un único desarrollador puede levantar un endpoint compatible con la API de OpenAI sobre llama.cpp y validar flujos de conversación antes de invertir en GPU dedicada.
- Procesamiento por lotes con requisitos de privacidad: resúmenes, clasificación o reescritura de documentos que no pueden salir de la máquina del cliente (entornos sanitarios, jurídicos o de auditoría interna), ejecutando el modelo en local con throughput moderado.
- Integración en herramientas de línea de comandos: binarios de llama.cpp con este GGUF permiten añadir generación de texto a scripts y utilidades de desarrollo sin dependencias de red.
- Docencia e investigación: entorno reproducible y ligero para experimentar con cuantización de 4 bits y medir la degradación frente al modelo en FP16, con el hash como referencia fija.
- Pruebas de regresión de aplicaciones de escritorio: al ser un artefacto inmutable con commit y hash, sirve como fixture estable en tests de integración de la app voin.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Evaluaciones propias del autor | no disponible |

## Requisitos de hardware

- VRAM estimada para este archivo Q4_K_M: en torno a 6,5-8 GB contando pesos (5,68 GB) más caché KV y overhead del runtime; la cifra exacta depende de la longitud de contexto, que no está documentada.
- Otras cuantizaciones del mismo modelo (estimación orientativa, no confirmada para este modelo concreto): Q8_0 ≈ 9,5-10 GB, Q5_K_M ≈ 6,5-7 GB, FP16 ≈ 18 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4070 Ti 12 GB y RTX 4090 24 GB para el archivo Q4_K_M con contexto amplio; A100 40/80 GB y H100 solo tienen sentido para servir varias instancias o trabajar en FP16.
- Cabe en GPU de consumo: sí, con el archivo Q4_K_M en tarjetas de 8 GB o más (en 8 GB conviene limitar el contexto); también es viable en CPU con RAM suficiente, a costa de menor throughput.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python; vLLM con soporte GGUF experimental; TGI no soporta GGUF de forma nativa.
- Latencia y throughput: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato y tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tory-labs/voin-qwen3.5-9b-gguf` (este repo) | 8.953.803.264 | no disponible | GGUF Q4_K_M, 5,68 GB | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| `Qwen/Qwen3.5-9B` (original) | 8.953.803.264 | no disponible | safetensors (tamaño no indicado) | Apache 2.0 | HuggingFace, mantenido por Alibaba Qwen |
| `unsloth/Qwen3.5-9B-GGUF` | 8.953.803.264 | no disponible | GGUF, varias cuantizaciones (no detalladas) | Apache 2.0 | HuggingFace, commit `3885219b6810` referenciado |

No se dispone de datos de rendimiento que permitan comparar este modelo con alternativas de otras familias (Llama, Gemma, Mistral u otras de tamaño similar): no disponible.

## Limitaciones y advertencias

- Es un espejo de terceros, no una publicación oficial de Alibaba Qwen: la responsabilidad sobre el contenido recae en el autor original, y la confianza en el archivo depende de verificar el SHA-256 publicado.
- La cuantización Q4_K_M introduce pérdida de precisión respecto al modelo en FP16; el grado de degradación en tareas concretas no está documentado.
- No hay evaluación publicada: no se puede afirmar qué rendimiento ofrece en MMLU, código, matemáticas o multilingüismo sin medirlo.
- La longitud de contexto es desconocida, lo que impide dimensionar la caché KV y planificar despliegues con prompts largos.
- Riesgo de alucinación inherente a los modelos generativos de esta escala; no se documentan mitigaciones ni datos de ajuste.
- Sesgos: no disponibles; al no documentarse la composición del dataset de entrenamiento no se puede evaluar el sesgo por idioma, género o dominio.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero exige conservar el aviso de copyright y el archivo LICENSE, y no concede garantías; conviene revisar también los términos del modelo base.
- El repositorio tiene 0 descargas y 0 likes y se creó el 2026-10-17, por lo que no existe validación comunitaria de su funcionamiento.
- Los resultados de la búsqueda web realizada no son pertinentes (remiten a la marca Tory Burch y al partido conservador británico) y no aportan información técnica sobre el modelo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/tory-labs/voin-qwen3.5-9b-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Conversión GGUF de unsloth (commit `3885219b6810`): https://huggingface.co/unsloth/Qwen3.5-9B-GGUF/tree/3885219b6810b007914f3a7950a8d1b469d598a5
- Aplicación voin: https://github.com/su-record/voin
- Licencia del modelo (referenciada en la model card): archivo `LICENSE` del repositorio
