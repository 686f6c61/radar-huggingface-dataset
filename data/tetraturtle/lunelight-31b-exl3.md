# tetraturtle/LuneLight-31B-exl3

## Resumen

LuneLight-31B-exl3 es una cuantización en formato EXL3 del modelo LuneLight-31B, publicado por el usuario tetraturtle en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos del modelo base G4/LuneLight-31B a cuantización EXL3, generada de forma automática mediante la herramienta ezexl3 sobre el motor de inferencia exllamav3. El repositorio incluye cuatro revisiones con distintos niveles de compresión (3.00, 3.10 y 3.25 bits por peso, además de la referencia bf16), lo que permite elegir el equilibrio entre tamaño y fidelidad.

El interés de esta ficha reside en que ofrece una vía práctica para ejecutar un modelo de 31 000 millones de parámetros en hardware con VRAM limitada: la revisión de 3.00 bpw ocupa 14,29 GiB frente a los 58,25 GiB del modelo en bf16, una reducción de aproximadamente el 75 % en espacio de almacenamiento. La licencia Apache 2.0 del modelo base facilita su uso comercial, aunque la información publicada sobre arquitectura, contexto, idiomas y datos de entrenamiento es muy escasa.

La model card del repositorio se limita a describir el proceso de cuantización y a incluir gráficas de divergencia KL y perplejidad frente a bits por peso, además de los comandos de descarga. No se documentan resultados de benchmarks, capacidades específicas ni detalles del entrenamiento original, por lo que muchos campos de esta ficha deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base G4/LuneLight-31B; presumiblemente transformer, sin confirmar) |
| Parametros totales | 31 000 millones (deducido del nombre; no confirmado en la model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 3.00, 3.10 y 3.25 bits por peso; bf16 como referencia |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | EXL3 (repositorio de 47,3 GB; revisiones de 14,29 a 15,14 GiB y bf16 de 58,25 GiB) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base G4/LuneLight-31B en la documentación proporcionada. El nombre sugiere un modelo denso de 31 000 millones de parámetros, pero no se confirma si emplea atención estándar, atención lineal, mezcla de expertos u otro diseño. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de ajuste fino supervisado, RLHF o DPO.

La innovación técnica documentada en este repositorio es exclusivamente la cuantización EXL3 mediante exllamav3, con generación automatizada a través de ezexl3. La model card incluye gráficas de divergencia KL media y perplejidad en función de los bits por peso, así como histogramas de divergencia KL por token y una comparación con el suelo de ruido, lo que permite evaluar la pérdida de calidad en cada revisión. No se aportan métricas numéricas concretas en el texto de la ficha.

## Capacidades

- Generación de texto: capacidad esperada por tratarse de un modelo de lenguaje de 31 000 millones de parámetros, aunque no se detalla en la documentación.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el campo de idiomas no está cumplimentado en el repositorio.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Inferencia cuantizada: soporte de EXL3 a 3.00, 3.10 y 3.25 bpw con exllamav3, lo que permite ejecución con menor huella de memoria.

## Casos de uso

- Despliegue en GPU de consumo: la revisión de 3.00 bpw ocupa 14,29 GiB, lo que permite cargar el modelo en tarjetas con 16 GB o 24 GB de VRAM mediante exllamav3, algo inviable con los 58,25 GiB del bf16.
- Servicios de generación de texto con presupuesto de memoria ajustado: al reducir el peso a aproximadamente una cuarta parte, se puede reservar el resto de la VRAM para la caché KV y aumentar el contexto efectivo en un servidor con una sola GPU.
- Evaluación comparativa de cuantizaciones: las gráficas de divergencia KL y perplejidad permiten seleccionar la revisión (3.00, 3.10 o 3.25 bpw) según la tolerancia a la degradación en una aplicación concreta.
- Prototipado e investigación: un modelo de 31 000 millones ejecutable en hardware asequible facilita experimentos de prompting, evaluación de sesgos o análisis de comportamiento sin depender de infraestructura de centro de datos.
- Fine-tuning ligero o adaptación posterior: partir de una revisión EXL3 de bajo peso reduce los requisitos de almacenamiento para experimentos de adaptación, aunque la compatibilidad con técnicas de ajuste sobre EXL3 debe verificarse con exllamav3.
- Integración en pipelines locales de procesamiento de lenguaje natural: clasificación, resumen o extracción de información en entornos con recursos limitados y licencia Apache 2.0 que permite uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye gráficas de divergencia KL media, perplejidad e histogramas de divergencia KL por token frente a bits por peso, sin cifras numéricas en el texto.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 14,29 GiB para la revisión 3.00 bpw, 14,63 GiB para 3.10 bpw y 15,14 GiB para 3.25 bpw, a los que hay que sumar la memoria de la caché KV y el overhead del runtime.
- Modelo en bf16: 58,25 GiB, lo que exige al menos una GPU de 80 GB o varias GPU en paralelo.
- GPU recomendadas: para las revisiones EXL3, tarjetas con 24 GB o más (RTX 3090, RTX 4090, A10G, L4 con margen limitado); para bf16, A100 80 GB, H100 80 GB o configuraciones multi-GPU.
- Compatibilidad con GPU de consumo: sí para las revisiones EXL3 en tarjetas de 16-24 GB, siempre que se ajuste la longitud de contexto para no agotar la VRAM con la caché KV.
- Opciones de despliegue: exllamav3 es el motor de referencia para el formato EXL3; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LuneLight-31B-exl3 (este) | 31 000 M (deducido) | no disponible | EXL3 3.00-3.25 bpw y bf16 | Apache 2.0 | Hugging Face, 0 descargas |
| G4/LuneLight-31B (base) | 31 000 M (deducido) | no disponible | bf16 (58,25 GiB) | Apache 2.0 | Hugging Face |
| Cyclone-Labs/Lunar-Trace-31B | 31 000 M (deducido) | no disponible | no disponible | no disponible | Hugging Face; fusión que incluye G4-LuneLight-31B entre sus componentes |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 3 bits por peso introduce degradación respecto a bf16; la magnitud debe consultarse en las gráficas de divergencia KL y perplejidad incluidas en el repositorio, que no aportan cifras en el texto.
- No se documentan sesgos conocidos, riesgos de alucinación ni limitaciones idiomáticas del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria de su calidad.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base G4/LuneLight-31B y de los datos de entrenamiento originales, no documentados aquí.
- El formato EXL3 requiere el motor exllamav3; no se confirma compatibilidad con otros runtimes, lo que limita la portabilidad del despliegue.
- El repositorio se generó de forma automática con ezexl3, sin que se documente una validación manual de las revisiones publicadas.
- No hay información sobre la longitud de contexto soportada, lo que impide planificar aplicaciones que dependan de ventanas largas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tetraturtle/LuneLight-31B-exl3
- Modelo base: https://huggingface.co/G4/LuneLight-31B
- Motor de inferencia exllamav3: https://github.com/turboderp-org/exllamav3
- Herramienta de cuantización ezexl3: https://github.com/UnstableLlama/ezexl3
- Colección de modelos EXL3 de turboderp: https://huggingface.co/collections/turboderp/exl3-models
- Modelo relacionado (fusión): https://huggingface.co/Cyclone-Labs/Lunar-Trace-31B
