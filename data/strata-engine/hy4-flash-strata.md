# strata-engine/Hy4-Flash-Strata

## Resumen

Hy4-Flash-Strata es una cuantización del modelo Hy4-Flash de Tencent, publicada por strata-engine para su uso con el motor de inferencia local Strata. El modelo base es un Mixture-of-Experts (MoE) de 220 mil millones de parámetros totales, de los cuales 64 mil millones residen en una tabla de búsqueda denominada Engram y solo 12 mil millones se activan por token. Acepta texto e imágenes como entrada, genera texto y soporta una ventana de contexto de hasta 1.048.576 tokens. Tencent lo presenta como su modelo Hy más económico hasta la fecha.

La relevancia de esta ficha no está tanto en el modelo base como en el formato de empaquetado: Strata distribuye el modelo en tres paquetes (SQ-64, SQ-96 y SQ-128) que permiten ejecutar los 220B parámetros en equipos de consumo con tan solo 64 GiB de RAM y una GPU de 8 GiB de VRAM. Cada paquete incluye una cuantización propia con distinto nivel de fidelidad respecto al modelo original en BF16, medida mediante divergencia KL sobre conjuntos de prompts de razonamiento y de tool calling.

El repositorio ocupa 333,8 GB e incluye los tres paquetes más un fichero compartido de la tabla Engram en Q8 (`Hy4-Flash-Engram-Q8.strata`). La licencia es la Tencent Hy License, heredada del modelo base, por lo que las restricciones de uso comercial del original se aplican también a esta distribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con tabla de búsqueda Engram; transformer segun el modelo base |
| Parametros totales | 220B (64B en la tabla Engram) |
| Parametros activos | 12B por token |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | Tres paquetes propietarios: SQ-64, SQ-96 y SQ-128; tabla Engram en Q8 |
| Idiomas soportados | no disponible |
| Licencia | Tencent Hy License (license: other) |
| Formato de pesos | `.strata` (formato propietario del motor Strata); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base Hy4-Flash es un Mixture-of-Experts con 220B parámetros totales y 12B activos por token. Una parte sustancial de esos parámetros (64B) corresponde a Engram, una tabla de búsqueda que el motor Strata trata como un fichero separado y compartido entre los tres paquetes, cuantizado en Q8. El modelo procesa entradas multimodales de texto e imagen y produce salida de texto. No se dispone de información detallada sobre la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron fases de RLHF o DPO; esos datos no están disponibles en la información proporcionada.

La innovación técnica de esta distribución es el esquema de cuantización por capas y por bloques que da lugar a los paquetes SQ-64, SQ-96 y SQ-128. Según la model card, la evaluación de fidelidad se realizó comparando las predicciones del siguiente token de cada paquete con el modelo en BF16, sobre ocho prompts reservados de 512 tokens, puntuando las 4.096 posiciones de prompt en las 42 capas del modelo. El resultado se expresa como divergencia KL media: cuanto menor, más cerca está el paquete del original. El paquete SQ-128 es el más fiel en ambos conjuntos de evaluación, mientras que SQ-64 es el que más se aleja, especialmente en prompts de tool calling.

## Capacidades

- Generación de texto y razonamiento multi-paso, con soporte de modo de razonamiento implícito en los prompts de evaluación.
- Comprensión de imágenes combinada con texto (pipeline `image-text-to-text`), lo que permite entrada multimodal.
- Tool calling y function calling: la model card reporta evaluaciones específicas sobre prompts de llamada a herramientas, lo que indica soporte nativo de este patrón.
- Ventana de contexto de hasta 1M tokens, adecuada para documentos extensos, bases de código completas o conversaciones muy largas.
- Ejecución local en hardware de consumo mediante el motor Strata, sin necesidad de cuenta ni de servicio en la nube.
- Capacidades multilingües: no disponible (no se especifican idiomas en la información proporcionada).

## Casos de uso

- Asistente de código en local: el modelo puede integrarse en el endpoint compatible con OpenAI que expone Strata en `http://127.0.0.1:8080/v1`, de modo que herramientas como Cursor o Claude Code puedan apuntar a una instancia local. El contexto de 1M tokens permite cargar repositorios medianos completos sin truncar.
- Análisis de documentos extensos con imágenes: informes escaneados, contratos con sellos o gráficos y manuales técnicos pueden procesarse en una sola pasada gracias a la entrada multimodal y la ventana de contexto, sin necesidad de dividir el documento en fragmentos.
- Automatización de agentes con tool calling: el soporte de llamada a funciones y la evaluación específica de prompts de herramientas permiten construir agentes que consulten APIs, ejecuten comandos o consulten bases de datos, con el paquete SQ-128 como opción de mayor fidelidad.
- Asistencia al cliente con datos sensibles: al ejecutarse íntegramente en local, el modelo evita enviar conversaciones a terceros, lo que encaja en entornos con requisitos de confidencialidad; el contexto largo permite mantener historiales multi-turno extensos.
- Prototipado e investigación sin coste de API: investigadores pueden experimentar con un MoE de 220B en una estación de trabajo de 64 GiB de RAM y GPU de 8 GiB, usando SQ-64 para pruebas rápidas y SQ-128 para resultados más fieles.
- Generación de código en pipelines internos: con el endpoint local compatible con OpenAI, el modelo puede insertarse en scripts de CI/CD para revisión de código, generación de tests o documentación técnica, siempre que la licencia del modelo base lo permita.
- Educación y demostraciones: la instalación sin cuenta y el instalador para Windows, Linux y macOS facilitan su uso en aulas o talleres donde no se dispone de infraestructura de GPU de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card únicamente reporta métricas de fidelidad de cuantización frente al modelo original en BF16, expresadas como divergencia KL media (menor es mejor):

| Paquete | Prompts de razonamiento (KL) | Prompts de tool calling (KL) |
|---|---:|---:|
| SQ-128 | 0,08789 | 0,17969 |
| SQ-96 | 0,13591 | 0,23661 |
| SQ-64 | 0,23206 | 0,51828 |

## Requisitos de hardware

- RAM mínima para arrancar: 64 GiB, con GPU de 8, 12 o 16 GiB de VRAM (paquete SQ-64).
- Paquete SQ-64: 59,4 GiB de memoria en uso (RAM + VRAM aproximadas), 129,61 GB en disco.
- Paquete SQ-96: 85,1 GiB de memoria en uso, 157,16 GB en disco; requiere 96 GiB de RAM y GPU de 8 o 12 GiB.
- Paquete SQ-128: 107,5 GiB de memoria en uso, 181,23 GB en disco; recomendado para equipos con 128 GiB de memoria unificada y GPU de 8 o 12 GiB.
- Fichero adicional obligatorio: `Hy4-Flash-Engram-Q8.strata`, compartido por los tres paquetes, necesario para el procesamiento de texto.
- GPU recomendadas: no se especifican modelos concretos (A100, H100, RTX 4090); la model card solo indica requisitos de VRAM por paquete (8, 12 o 16 GiB).
- Cabe en GPU de consumo: sí, según la model card, con tarjetas de 8 a 16 GiB de VRAM combinadas con suficiente RAM del sistema.
- Opciones de despliegue: motor Strata (aplicación de escritorio para Windows, Linux y macOS, o CLI `strata launch`). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, dado el formato propietario `.strata`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-Flash-Strata (SQ-128) | 220B / 12B | 1M tokens | Tencent Hy License | `.strata` | Hugging Face, motor Strata |
| Hy4-Flash (original, Tencent) | 220B / 12B | 1M tokens | Tencent Hy License | no disponible en la información | Hugging Face (tencent/Hy4-flash) |
| Qwen3.8-Flash (según búsqueda web) | no disponible | no disponible | no disponible | no disponible | Soportado por Strata según el repositorio |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de Hy4-Flash-Strata con alternativas de la misma categoría. La comparación con Qwen3.8-Flash se limita a que ambos aparecen mencionados como modelos soportados por el motor Strata en los resultados de búsqueda; no hay información sobre parámetros, contexto ni licencia de ese modelo en la información proporcionada.

## Limitaciones y advertencias

- Licencia Tencent Hy License: es una licencia "other" heredada del modelo base, con posibles restricciones de uso comercial. Es imprescindible revisar el texto completo en el enlace de licencia antes de desplegarlo en producción.
- Formato propietario: los pesos solo están en formato `.strata`, lo que obliga a usar el motor Strata y limita la portabilidad a otras herramientas de inferencia.
- Pérdida de fidelidad por cuantización: incluso el paquete SQ-128 presenta divergencia KL de 0,088 en razonamiento y 0,180 en tool calling frente al modelo en BF16; SQ-64 alcanza 0,518 en tool calling, un deterioro notable que puede afectar a la fiabilidad de las llamadas a funciones.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad ni de tasas de alucinación en la información disponible.
- Idiomas: no se especifican los idiomas soportados, por lo que no puede confirmarse un rendimiento adecuado en castellano.
- Sesgos: no se documentan sesgos conocidos en la model card.
- Requisitos de memoria elevados: aunque el modelo cabe en hardware de consumo, necesita entre 64 y 128 GiB de RAM, lo que excluye a la mayoría de portátiles y equipos de gama media.
- Contexto de 1M tokens: no se detalla si el rendimiento se mantiene estable en toda la ventana ni qué técnicas de atención se emplean para lograrlo.
- Madurez del ecosistema: el repositorio registra 0 descargas y 1 "like" en el momento de la consulta, y el proyecto Strata es de desarrollo reciente, lo que implica menor soporte comunitario y posibles cambios de formato.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/strata-engine/Hy4-Flash-Strata
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Licencia del modelo base: https://huggingface.co/tencent/Hy4-flash/blob/main/LICENSE
- Repositorio de Strata en GitHub: https://github.com/Niko1221/Strata
- Releases de Strata: https://github.com/Niko1221/Strata/releases
- Sitio web de Strata: https://stratallm.org/
- Sitio alternativo de Strata: https://www.stratat.com/en
