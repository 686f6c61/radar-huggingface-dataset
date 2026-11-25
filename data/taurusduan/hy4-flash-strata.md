# taurusduan/Hy4-Flash-Strata

## Resumen

Hy4-Flash-Strata es un empaquetado cuantizado del modelo Tencent Hy4-flash, publicado por el usuario taurusduan bajo el formato propietario Strata. El modelo base es un transformer de tipo mezcla de expertos (MoE) desarrollado por Tencent, con 220.000 millones de parámetros totales de los cuales 12.000 millones se activan por token, y una ventana de contexto de hasta 1.048.576 tokens (1M). Admite entrada de texto e imágenes y salida de texto, lo que lo sitúa en la categoría image-text-to-text.

La relevancia de este empaquetado radica en el objetivo declarado por su autor: ejecutar un modelo de 220B en hardware de consumo, partiendo de 64 GiB de RAM y una tarjeta gráfica de 8 GiB, mediante tres packs (SQ-64, SQ-96 y SQ-128) que se seleccionan según la memoria del equipo. El repositorio ocupa 333,8 GB e incluye los pesos cuantizados y el fichero compartido de lookup Engram en Q8, necesario para el procesamiento de texto.

Se trata de una cuantización de terceros, no oficial de Tencent, distribuida bajo la licencia tencent-hy-license heredada del modelo base. El autor publica métricas de divergencia KL frente al modelo en BF16 para justificar la fidelidad de cada pack, pero no se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con componente Engram (lookup); empaquetado en formato Strata |
| Parámetros totales | 220B (64B corresponden al lookup Engram) |
| Parámetros activos | 12B por token |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantización | SQ-64, SQ-96, SQ-128 (packs Strata) más Engram en Q8 |
| Idiomas soportados | no disponible |
| Licencia | tencent-hy-license (other) |
| Formato de pesos | Strata (`.strata`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base Hy4-flash es un transformer de mezcla de expertos con 220B parámetros totales y 12B activos por token. Una particularidad destacada es la presencia de un componente Engram de 64B parámetros que funciona como lookup, y que en este empaquetado se distribuye como fichero separado en cuantización Q8 (`Hy4-Flash-Engram-Q8.strata`), requerido por los tres packs. El modelo procesa texto e imágenes como entrada y genera texto, con soporte de hasta 1M tokens de contexto.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. El empaquetado Strata aplica cuantización sobre los pesos del modelo original en BF16; el autor reporta la divergencia KL media frente al modelo completo en dos conjuntos de prompts (razonamiento y tool calling), con ocho prompts reservados de 512 tokens cada uno y evaluación sobre las 4.096 posiciones y las 42 capas del modelo.

## Capacidades

- Generación de texto a partir de entradas multimodales (texto e imagen).
- Procesamiento de imágenes como entrada (pipeline image-text-to-text).
- Ventana de contexto de hasta 1M tokens para conversaciones y documentos extensos.
- Soporte de tool calling, según los conjuntos de evaluación de prompts de herramientas reportados por el autor.
- Razonamiento multi-step, evaluado en el conjunto de prompts de razonamiento del autor.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan modos de pensamiento explícitos, audio ni otras capacidades especiales.

## Casos de uso

- Asistente conversacional de contexto largo: con 1M tokens de ventana, el modelo puede mantener conversaciones multi-turno o procesar documentación extensa sin truncar, aunque el rendimiento práctico dependerá del pack elegido.
- Análisis de documentos con imágenes: al aceptar entrada image-text-to-text, permite extraer información de capturas, diagramas o páginas escaneadas combinadas con texto.
- Automatización con herramientas: el soporte de tool calling lo hace apto para orquestar llamadas a APIs en flujos de agentes, si bien el pack SQ-64 muestra la mayor divergencia en este tipo de prompts (KL 0,51828).
- Despliegue local en estaciones de trabajo: los packs SQ-64 y SQ-96 permiten ejecutar el modelo en equipos con 64 o 96 GiB de RAM y GPU de 8 o 12 GiB, útil para entornos sin acceso a la nube.
- Prototipado e investigación en cuantización: la disponibilidad de tres niveles de compresión con métricas de divergencia KL facilita estudiar el compromiso entre memoria y fidelidad.
- Procesamiento por lotes de textos largos: la ventana de 1M tokens permite resumir o clasificar corpus extensos en una sola pasada, siempre que la memoria del sistema lo permita.
- Evaluación comparativa de fidelidad: los conjuntos de prompts reservados y las métricas publicadas permiten reproducir la comparación entre packs antes de elegir uno para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí publica métricas de divergencia KL media frente al modelo en BF16:

| Pack | Prompts de razonamiento (KL) | Prompts de tool calling (KL) |
|---|---:|---:|
| SQ-128 | 0,08789 | 0,17969 |
| SQ-96 | 0,13591 | 0,23661 |
| SQ-64 | 0,23206 | 0,51828 |

Menor KL implica mayor fidelidad al modelo original. SQ-128 es el más cercano en ambos conjuntos; SQ-64 es el que más se aleja, especialmente en tool calling.

## Requisitos de hardware

- RAM mínima: 64 GiB para el pack SQ-64, con GPU de 8, 12 o 16 GiB; memoria en uso aproximada de 59,4 GiB y 129,61 GB en disco.
- Pack SQ-96: 96 GiB de RAM con GPU de 8 o 12 GiB; 85,1 GiB de memoria en uso y 157,16 GB en disco.
- Pack SQ-128: 128 GiB de RAM con GPU de 8 o 12 GiB; 107,5 GiB de memoria en uso y 181,23 GB en disco.
- Todos los packs requieren además el fichero compartido `Hy4-Flash-Engram-Q8.strata` para texto.
- GPU recomendadas: el autor solo especifica requisitos mínimos de 8, 12 o 16 GiB de VRAM; no detalla modelos concretos (A100, H100, RTX 4090, etc.).
- Cabe en GPU de consumo con 8 o 12 GiB de VRAM siempre que se acompañe de la RAM indicada.
- Despliegue: mediante la aplicación Strata (Windows, Linux y Mac) o la CLI `strata launch`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento de modelos alternativos de la misma categoría (MoE multimodal de ~200B parámetros con contexto de 1M) que permitan una comparación rigurosa de parámetros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- Cuantización de terceros: no es un lanzamiento oficial de Tencent; la fidelidad al modelo original está cuantificada solo mediante divergencia KL, no mediante benchmarks de tarea.
- El pack SQ-64 presenta una divergencia notable en tool calling (KL 0,51828), lo que puede degradar la fiabilidad en flujos de agentes.
- Licencia tencent-hy-license: es necesario revisar sus términos antes de cualquier uso comercial; no se detalla en la información disponible si permite uso comercial.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingüe.
- Riesgo de alucinación inherente a los modelos generativos, no cuantificado en la información disponible.
- Sesgos conocidos: no documentados.
- Formato propietario Strata: no es compatible con safetensors, GGUF ni con los runners habituales (vLLM, llama.cpp, Ollama, TGI), lo que limita la portabilidad.
- Requiere el fichero Engram Q8 adicional para texto, lo que incrementa el espacio en disco más allá del tamaño del pack.
- Repositorio de 333,8 GB y sin descargas ni valoraciones registradas en el momento de la consulta; madurez y soporte de la comunidad no verificables.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/taurusduan/Hy4-Flash-Strata
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Licencia del modelo base: https://huggingface.co/tencent/Hy4-flash/blob/main/LICENSE
- Repositorio GitHub de Strata: https://github.com/Niko1221/Strata
- Descargas de la aplicación Strata: https://github.com/Niko1221/Strata/releases/latest
