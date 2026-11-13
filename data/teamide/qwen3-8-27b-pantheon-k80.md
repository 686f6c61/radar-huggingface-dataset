# TeamIDE/Qwen3.8-27B-Pantheon-K80

## Resumen

Qwen3.8-27B-Pantheon-K80 es una redistribución del modelo Qwen3.8-27B de Qwen (equipo de Alibaba Cloud), empaquetado como GGUF en cuantización Q8_0 por el usuario TeamIDE para su uso en estaciones con GPUs NVIDIA Tesla K80. No se trata de un modelo nuevo ni de un ajuste fino: el archivo es el GGUF Q8_0 generado por unsloth a partir del modelo base original, redistribuido sin modificaciones. Su interés es operativo, no algorítmico: ofrece una ruta de despliegue verificada para hardware antiguo (K80, arquitectura Kepler) donde las opciones modernas de inferencia suelen fallar.

El modelo base es un transformer denso de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones), orientado a generación de texto conversacional. La model card del repositorio no documenta la longitud de contexto, los idiomas soportados ni los datos de entrenamiento; solo confirma que la variante es exclusivamente de texto, sin capacidades de visión.

La relevancia de esta ficha es acotada: el repositorio tiene cero descargas y cero likes en el momento de la consulta, y su valor principal es servir como artefacto reproducible (con hash SHA-256 publicado) para quien necesite ejecutar un modelo de 27B en cuatro K80. Para cualquier otro escenario, es preferible acudir directamente al GGUF de unsloth o al modelo original de Qwen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (según modelo base Qwen3.8-27B; detalles no disponibles) |
| Parámetros totales | 27.320.697.856 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q8_0 (única incluida en el repo) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `Qwen3.8-27B-Q8_0.gguf`, 29.047.086.048 bytes) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base más allá de que se trata de un transformer denso de 27,3 mil millones de parámetros y que la variante publicada es solo de texto. La model card de este repositorio no describe la composición del dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de alineación como RLHF o DPO; esos datos corresponderían a la documentación de Qwen/Qwen3.8-27B, que no se ha proporcionado.

La única innovación técnica documentada en este repositorio es de naturaleza de despliegue: la build está validada en una configuración concreta de cuatro GPUs Tesla K80 repartidas en dos placas, con decodificación greedy y MTP (multi-token prediction) desactivado. El autor reporta 4,1 tokens por segundo en prompts cortos y contrasta el resultado con la referencia de llama.cpp en CPU para Q8_0. La cuantización Q8_0 es de 8 bits por peso, prácticamente sin pérdida apreciable de calidad frente a los pesos originales, y fue producida por unsloth, no por TeamIDE.

## Capacidades

- Generación de texto conversacional en formato chat, según la etiqueta `conversational` del repositorio.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags), lo que sugiere integración con servidores de inferencia compatibles con la API de OpenAI.
- Inferencia solo de texto: la model card indica explícitamente "Text only (no vision)".
- Uso de imatrix en el proceso de cuantización (etiqueta `imatrix`), lo que habitualmente mejora la fidelidad de la cuantización en capas sensibles.
- Capacidades de tool calling, razonamiento multi-paso, matemáticas o código: no documentadas en la información disponible.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Despliegue en hardware legacy: ejecutar un modelo de 27B en cuatro Tesla K80 (24 GB cada una, 96 GB agregados) usando llama.cpp con el GGUF Q8_0, aprovechando que el autor ya validó esta configuración concreta y publicó el hash del archivo para verificar la integridad de la descarga.
- Laboratorios con presupuesto restringido: instituciones que ya poseen servidores con K80 pueden poner en marcha un asistente conversacional sin adquirir GPUs Ampere o Hopper, aceptando un throughput bajo de aproximadamente 4,1 tok/s.
- Reproducibilidad de experimentos: el SHA-256 publicado permite verificar que el binario descargado coincide con el que el autor midió, lo que resulta útil en entornos de investigación donde la trazabilidad del artefacto importa.
- Prototipado de asistentes conversacionales internos: al ser un modelo de texto con licencia Apache 2.0, puede integrarse en herramientas internas de documentación o soporte sin coste de licencia.
- Servicio de inferencia compatible con API: gracias a la etiqueta `endpoints_compatible`, puede exponerse detrás de un servidor tipo llama.cpp server y consumirse desde clientes que hablan el protocolo de OpenAI.
- Evaluación comparativa de cuantizaciones: usar este Q8_0 como referencia de alta fidelidad frente a cuantizaciones menores (Q4_K_M, Q5_K_M) del mismo modelo base para medir la degradación en tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento medido es el throughput de decodificación reportado por el autor:

| Métrica | Valor | Condiciones |
|---|---|---|
| Decodificación (decode) | 4,1 tok/s | 4× Tesla K80 en 2 placas, 1 usuario, greedy, MTP off, prompts cortos |
| Prefill | No disponible | — |
| MMLU / HumanEval / GSM8K | No disponible | — |

## Requisitos de hardware

- VRAM estimada: el archivo Q8_0 ocupa 29,05 GB, por lo que se necesitan al menos ~30 GB de VRAM para cargarlo completamente en GPU, más overhead de contexto KV.
- GPU recomendadas para esta build: 4× NVIDIA Tesla K80 (2 placas), la configuración validada por el autor. Cada K80 aporta 2 GPUs de 12 GB, es decir, 24 GB por placa y 48 GB en total por dos placas; el reparto entre GPUs requiere offloading por capas.
- GPU consumer: una RTX 4090 (24 GB) no puede alojar el Q8_0 completo en VRAM; requeriría offloading parcial a RAM del sistema con la penalización de velocidad correspondiente. Una RTX 3090 o 4090 con 24 GB podría ejecutar cuantizaciones menores (Q4_K_M) del mismo modelo base, no este archivo.
- Opciones de despliegue: llama.cpp es la ruta natural para GGUF; el repositorio referencia explícitamente la comparación con la referencia de llama.cpp en CPU. Ollama y servidores compatibles con la API de OpenAI son viables si aceptan GGUF. vLLM y TGI no soportan GGUF de forma nativa en configuraciones estándar.
- Latencia y throughput: 4,1 tok/s en decodificación con la configuración K80 descrita. Para un texto de 500 tokens de salida, esto supone aproximadamente dos minutos de generación, lo que limita el uso a escenarios por lotes o asistentes no interactivos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Pantheon-K80 | 27,3 B | No disponible | GGUF Q8_0 | Apache 2.0 | Build para K80, 4,1 tok/s medidos |
| unsloth/Qwen3.8-27B-GGUF | 27,3 B | No disponible | GGUF (varias cuantizaciones) | Apache 2.0 | Fuente original de este archivo; incluye Q4, Q5, Q6, Q8 |
| Qwen/Qwen3.8-27B | 27,3 B | No disponible | Safetensors | Apache 2.0 | Modelo base sin cuantizar; requiere ~55 GB en BF16 |

La comparación con modelos de otros fabricantes del mismo rango (por ejemplo, familias de 24-32B con licencia permisiva) no puede establecerse con rigor porque no se han proporcionado datos de benchmarks del modelo base en la información disponible.

## Limitaciones y advertencias

- El repositorio no documenta sesgos conocidos, comportamiento en idiomas distintos del inglés o riesgos específicos de alucinación; se heredan los del modelo base Qwen3.8-27B, no descritos aquí.
- Sin datos de benchmarks, no es posible verificar la calidad del modelo en tareas de razonamiento, código o matemáticas.
- El throughput de 4,1 tok/s medido en K80 es muy bajo para uso interactivo; cualquier aplicación en tiempo real requerirá hardware más moderno.
- La build está validada con MTP desactivado y decodificación greedy; otros modos de muestreo o la activación de MTP no han sido verificados por el autor.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el usuario debe verificar los términos del modelo base en el enlace de licencia de Qwen y las condiciones de la cuantización de unsloth.
- El repositorio tiene cero descargas y cero likes, y fue creado y actualizado el mismo día (12 de noviembre de 2026), lo que indica que no ha pasado por validación de la comunidad.
- El modelo es solo de texto; no debe esperarse soporte de imágenes, audio ni entrada multimodal.
- La ausencia de información sobre la longitud de contexto impide planificar aplicaciones con ventanas largas sin consultar la documentación del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TeamIDE/Qwen3.8-27B-Pantheon-K80
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- GGUF de origen (unsloth): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Proyecto Pantheon: https://git.teamide.dev/David/Pantheon
