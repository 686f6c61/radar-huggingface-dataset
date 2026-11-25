# TeamUNLa/LLMs-UNLa

## Resumen

TeamUNLa/LLMs-UNLa es un repositorio índice publicado por TeamUNLa, una iniciativa de estudiantes de la Licenciatura en Sistemas de la Universidad Nacional de Lanús (Argentina), orientada a facilitar el acceso a modelos de lenguaje ejecutables en hardware de consumo. El repositorio no contiene pesos de un modelo propio, sino que actúa como catálogo central de cuantizaciones en formato EXL3 de la serie Ornith-1.5-35B-A3B, un modelo Mixture-of-Experts de 35 000 millones de parámetros totales y 3000 millones activos por token, basado en Qwen 3.5 35B.

La relevancia del proyecto reside en su enfoque práctico: ofrece variantes cuantizadas de 3,20 a 8,00 bits por peso (bpw) con tamaños de archivo de 15,0 a 34,8 GB, pensadas para ejecutarse en GPUs NVIDIA (CUDA) y AMD (ROCm) mediante motores compatibles con ExLlamaV3, como TabbyAPI. El objetivo declarado es que estudiantes puedan usar IA local para programar, estudiar, redactar o investigar sin suscripciones ni cesión de datos a terceros.

El repositorio está etiquetado para los idiomas español e inglés, con licencia MIT, y se encuentra en estado inicial (0 descargas, 0 likes en el momento de la consulta). No se proporcionan datos sobre arquitectura interna detallada, contexto, datos de entrenamiento ni benchmarks del modelo base en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en Qwen 3.5 35B |
| Parametros totales | 35 000 millones (35B) |
| Parametros activos | 3000 millones (3B) por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 (ExLlamaV3) en 3,20, 3,51, 4,09, 5,00, 6,20 y 8,00 bpw con distintos parámetros de head bits (hb), value bits (vb) y mix bits (mb) |
| Idiomas soportados | español (es), inglés (en) |
| Licencia | MIT |
| Formato de pesos | EXL3 (ExLlamaV3); no se indica disponibilidad de safetensors o GGUF en este repositorio índice |

## Arquitectura y entrenamiento

La información disponible describe el modelo base Ornith-1.5-35B-A3B como una arquitectura Mixture-of-Experts de 35B parámetros totales con 3B activos por token, construida sobre Qwen 3.5 35B. No se detallan en la documentación proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO.

El repositorio se centra en el proceso de cuantización más que en el entrenamiento: las variantes EXL3 emplean distintos niveles de bits por peso y configuraciones de precisión para cabezas de atención (hb), valores (vb) y componentes mixtos (mb), lo que permite ajustar el equilibrio entre tamaño en disco, consumo de memoria y fidelidad de la cuantización. Se anuncia además un drafter DFlash para decodificación especulativa, aún no publicado, orientado a acelerar la generación de tokens sobre esta serie.

## Capacidades

- Generación de texto en español e inglés, según los idiomas declarados en la model card.
- Razonamiento y asistencia para tareas de programación, estudio, redacción e investigación, según el uso previsto declarado por los autores.
- Ejecución local en GPUs de consumo, con variantes desde 15,0 GB de archivo que permiten despliegue en equipos de gama media/alta.
- Integración con servidores compatibles con la API de OpenAI mediante TabbyAPI, lo que habilita su uso con agentes y editores de código como VS Code, OpenCode, Continue o Cline.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Asistencia a la programación en local: el modelo puede conectarse a editores como VS Code mediante Continue o Cline a través de un servidor TabbyAPI compatible con la API de OpenAI, permitiendo autocompletado, explicación de código y refactorización sin enviar el código a servicios externos.
- Estudio y redacción académica: estudiantes pueden generar resúmenes, borradores y explicaciones en español e inglés ejecutando el modelo en su propia máquina, preservando la privacidad de apuntes y trabajos.
- Despliegue en laboratorios docentes con GPUs modestas: la variante de 3,20 bpw (15,0 GB) está pensada para equipos con 24/32 GB de memoria total, lo que facilita su instalación en PCs gamer de gama media/alta de aulas o laboratorios.
- Investigación con datos sensibles: al ejecutarse localmente y bajo licencia MIT, el modelo es adecuado para prototipos de procesamiento de texto sobre datasets que no pueden salir de la institución.
- Servidor de inferencia interno: TabbyAPI permite levantar un endpoint compatible con la API de OpenAI, útil para integrar el modelo en herramientas internas de la universidad o en pipelines de agentes.
- Experimentación con cuantización: las seis variantes publicadas (de 3,20 a 8,00 bpw) permiten comparar el impacto de la precisión de cuantización en calidad y velocidad sobre el mismo modelo base, un caso útil para docencia e investigación en eficiencia de LLMs.
- Evaluación de decodificación especulativa: cuando se publique el drafter DFlash anunciado, el repositorio servirá para medir la aceleración de la generación en entornos locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM mínima recomendada por los autores: 8 GB para ejecutar las variantes de la serie.
- Memoria total recomendada (VRAM + RAM) según variante:
  - 3,20 bpw (15,0 GB de archivo): 24/32 GB.
  - 3,51 bpw (16,2 GB): 32 GB.
  - 4,09 bpw (18,7 GB): 36 GB.
  - 5,00 bpw (22,8 GB): 40 GB.
  - 6,20 bpw (28,1 GB, aún no subida): 48 GB.
  - 8,00 bpw (34,8 GB, aún no subida): 64 GB.
- GPUs compatibles: NVIDIA (CUDA) y AMD (ROCm), según la model card.
- Cabe en GPU de consumo: sí, al menos las variantes de 3,20 y 3,51 bpw en tarjetas con suficiente VRAM o con descarga parcial a RAM; no se especifican modelos concretos de tarjeta.
- Opciones de despliegue: motores compatibles con ExLlamaV3, con TabbyAPI como opción recomendada para servidor local compatible con la API de OpenAI. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (EXL3, TeamUNLa) | 35B / 3B | no disponible | MIT | EXL3 | Cuantizaciones de 3,20 a 8,00 bpw; orientado a hardware de consumo |
| Qwen 3.5 35B (modelo base) | 35B / 3B | no disponible | no disponible en la informacion | no disponible | Base sobre la que se construye Ornith-1.5; sin datos de rendimiento en la informacion |
| Qwen 3.6 35B-A3B | 35B / 3B | no disponible | no disponible en la informacion | no disponible | Anunciado como próximo lanzamiento del repositorio, en preparación |
| Qwen 3.8 27B | 27B | no disponible | no disponible en la informacion | no disponible | Anunciado como próximo lanzamiento del repositorio, en preparación |

## Limitaciones y advertencias

- El repositorio es un índice: no contiene pesos propios ni una ficha técnica completa del modelo base; los datos de arquitectura, contexto y entrenamiento deben consultarse en los repositorios de cada variante y en la model card original de Ornith-1.5-35B-A3B.
- No se han publicado benchmarks, por lo que no es posible verificar la calidad del modelo frente a alternativas.
- El estado del proyecto es incipiente: 0 descargas y 0 likes en el momento de la consulta, y dos de las seis variantes anunciadas (6,20 y 8,00 bpw) aún no están subidas.
- El formato EXL3 limita el despliegue a motores compatibles con ExLlamaV3; no se indica soporte para llama.cpp, Ollama, vLLM o TGI en esta información.
- La licencia MIT se declara en el repositorio índice, pero conviene verificar la licencia del modelo base Ornith-1.5-35B-A3B y de Qwen 3.5 35B antes de un uso comercial.
- Solo se declaran los idiomas español e inglés; no hay información sobre calidad en otros idiomas.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada.
- La fecha de creación del repositorio (2026-11-24) y las referencias a versiones como Qwen 3.5, 3.6 y 3.8 o Gemma 4 no pueden verificarse con la información disponible; trátese como datos declarados por el autor.

## Enlaces

- Repositorio índice en Hugging Face: https://huggingface.co/TeamUNLa/LLMs-UNLa
- Variante 3,20 bpw: https://huggingface.co/TeamUNLa/Ornith-1.5-35B-A3B-exl3-3.2bpw-hb8-vb4-mb4
- Variante 3,51 bpw: https://huggingface.co/TeamUNLa/Ornith-1.5-35B-A3B-exl3-3.51bpw-hb8-vb4-mb4
- Variante 4,09 bpw: https://huggingface.co/TeamUNLa/Ornith-1.5-35B-A3B-exl3-4.09bpw-hb8-mb6
- Variante 5,00 bpw: https://huggingface.co/TeamUNLa/Ornith-1.5-35B-A3B-exl3-5bpw-hb16-mb6
- Variante 6,20 bpw (no subida aún): https://huggingface.co/TeamUNLa/Ornith-1.5-35B-A3B-exl3-6.2bpw-hb16-mb8
- Variante 8,00 bpw (no subida aún): https://huggingface.co/TeamUNLa/Ornith-1.5-35B-A3B-exl3-8bpw-hb16-mb8-hq2
- TabbyAPI (servidor compatible con la API de OpenAI para ExLlamaV3): https://github.com/theroyallab/tabbyAPI
