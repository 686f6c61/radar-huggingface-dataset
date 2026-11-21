# tinyopsec/lfm2.5-2.6b-fable5-coding-agent-GGUF

## Resumen

`tinyopsec/lfm2.5-2.6b-fable5-coding-agent-GGUF` es un conjunto de cuantizaciones GGUF del checkpoint `AyoubChLin/lfm2.5-2.6b-fable5-coding-agent`, un ajuste fino supervisado de parámetros completos (full-parameter SFT) sobre el modelo base `LiquidAI/LFM2.5-2.6B`. El modelo está especializado en tareas de agente de programación: generación de código y uso de herramientas (tool calling) dentro de flujos de trabajo multi-paso. Lo publica el usuario `tinyopsec`, que no es el autor del ajuste fino original sino quien produce y distribuye las cuantizaciones en formato GGUF mediante llama.cpp.

El interés práctico de esta publicación es la disponibilidad del checkpoint en un rango amplio de cuantizaciones (desde F16 hasta Q2_K), lo que permite ejecutar un modelo de 2.697.198.592 parámetros en hardware de consumo. El repositorio ocupa 26,3 GB en total porque incluye todas las variantes de cuantización, aunque cada archivo individual es mucho más pequeño (el F16 son 5,2 GB).

La información pública es escasa: no se detallan idiomas soportados, composición del dataset de entrenamiento ni resultados de benchmarks. La licencia es la LFM Open License v1.0, heredada del modelo base, y el autor advierte explícitamente que se trata de un checkpoint de agente de programación que debe evaluarse antes de usarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM2.5 de LiquidAI; no se detalla en la model card) |
| Parametros totales | 2.697.198.592 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (generado con llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de parámetros completos (full-parameter SFT) del checkpoint `LiquidAI/LFM2.5-2.6B`, orientado a tareas de agente de programación y uso de herramientas. La model card no especifica la arquitectura interna del modelo base (transformer, híbrido u otra variante), ni el número de tokens de entrenamiento, ni la composición del dataset de SFT. Tampoco se documenta si hubo etapas de RLHF, DPO u otras fases de alineamiento posteriores al SFT.

La contribución técnica de este repositorio concreto es la conversión a GGUF mediante llama.cpp y la publicación de trece variantes de cuantización, desde F16 hasta Q2_K, con Q4_K_M marcada como recomendada por el autor. No se documentan innovaciones arquitectónicas propias ni técnicas de decodificación especulativa en la información disponible.

## Capacidades

- Generación de texto y código en el contexto de tareas de programación.
- Uso de herramientas (tool calling / function calling), según las etiquetas `tool-use` y `coding-agent` del repositorio.
- Comportamiento orientado a agentes, con razonamiento multi-paso implícito en el ajuste fino para tareas de codificación.
- Ejecución en runtimes compatibles con GGUF: llama.cpp, Ollama, LM Studio, koboldcpp y otros.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no documentados.

## Casos de uso

- Asistente de codificación en local: con la cuantización Q4_K_M se puede desplegar un agente de programación en un portátil o estación de trabajo sin GPU dedicada de gama alta, usando llama.cpp u Ollama, para autocompletar, explicar y refactorizar código.
- Integración en editores e IDE: el modelo puede conectarse a extensiones que consuman una API compatible con OpenAI (el tag `endpoints_compatible` lo sugiere) para ofrecer sugerencias de código con contexto del proyecto.
- Automatización de tareas de agente con herramientas: al estar ajustado para tool use, puede orquestar llamadas a funciones (lectura de ficheros, ejecución de comandos, consultas a APIs) en pipelines de automatización de desarrollo.
- Prototipado rápido de agentes de código: su tamaño reducido permite iterar en local sobre prompts y flujos de agente antes de escalar a modelos mayores, reduciendo coste y latencia de experimentación.
- Entornos con restricciones de privacidad: al ejecutarse íntegramente en local, es adecuado para procesar código propietario sin enviarlo a servicios externos.
- Evaluación comparativa de cuantizaciones: el repositorio incluye trece variantes, lo que facilita medir el impacto de la cuantización en la calidad de generación de código para un mismo checkpoint.
- Docencia y experimentación: sirve para estudiar el comportamiento de un agente de código pequeño y ajustado por SFT completo en entornos académicos con hardware limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (basada en el tamaño de los ficheros publicados y el número de parámetros): F16 ≈ 5,2 GB; Q8_0 ≈ 2,9 GB; Q6_K ≈ 2,2 GB; Q5_K_M ≈ 1,9 GB; Q4_K_M ≈ 1,6 GB; Q3_K_M ≈ 1,3 GB; Q2_K ≈ 1,0 GB. Estas cifras son estimaciones a partir del tamaño del modelo y deben verificarse con el tamaño real de cada fichero.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para las cuantizaciones de 4 bits; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes con holgura. El modelo también puede ejecutarse en CPU.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones de 4 bits o inferiores con GPUs de 4 GB o más; las variantes de 8 bits y F16 requieren 6-8 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| tinyopsec/lfm2.5-2.6b-fable5-coding-agent-GGUF | 2,7 B | no disponible | Agente de código / tool use | LFM Open License v1.0 | GGUF |
| LiquidAI/LFM2.5-2.6B (base) | 2,7 B | no disponible | Propósito general | LFM Open License v1.0 | safetensors |
| AyoubChLin/lfm2.5-2.6b-fable5-coding-agent (original) | 2,7 B | no disponible | Agente de código / tool use | no disponible | safetensors |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada. La comparación se limita a parámetros, licencia y formato de distribución.

## Limitaciones y advertencias

- La model card advierte explícitamente que es un checkpoint de agente de programación y que debe evaluarse antes de su uso en producción.
- No se documentan sesgos conocidos, pero al ser un ajuste fino sobre un modelo base sin información pública sobre su dataset, no se puede descartar la presencia de sesgos heredados.
- Riesgo de alucinación: no cuantificado; al ser un modelo de 2,7 B parámetros, la fiabilidad en tareas de código complejo es limitada en comparación con modelos mayores.
- No se especifican los idiomas soportados ni la longitud de contexto, lo que impide garantizar un comportamiento correcto en castellano o en contextos largos.
- La licencia LFM Open License v1.0 impone condiciones que deben revisarse antes de un uso comercial; la etiqueta "other" en Hugging Face indica que no es una licencia estándar de código abierto.
- El repositorio incluye trece cuantizaciones en un único espacio de 26,3 GB; conviene descargar solo el fichero necesario.
- No hay información sobre el proceso de conversión a GGUF ni sobre posibles degradaciones de calidad en las cuantizaciones más agresivas (Q2_K, Q3_K_S).

## Enlaces

- Repositorio GGUF: https://huggingface.co/tinyopsec/lfm2.5-2.6b-fable5-coding-agent-GGUF
- Modelo base del ajuste fino: https://huggingface.co/AyoubChLin/lfm2.5-2.6b-fable5-coding-agent
- Modelo original de LiquidAI: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
- koboldcpp: https://github.com/LostRuins/koboldcpp
