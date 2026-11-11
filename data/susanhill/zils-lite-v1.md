# SusanHill/zils-lite-v1

## Resumen

zils-lite-v1 es un modelo de lenguaje publicado en Hugging Face por el usuario SusanHill bajo licencia Apache 2.0. Se trata de un fine-tune de un modelo denominado "d3-lite", descrito por el autor como destinado a un "soup pool" (conjunto de modelos para mezcla o model soup). El repositorio contiene pesos en formato safetensors con un total de 852.985.920 parámetros (aproximadamente 853 millones), lo que lo sitúa en la categoría de modelos pequeños.

La etiqueta `qwen3_5` en los metadatos sugiere que la arquitectura base está relacionada con la familia Qwen 3.5, e incluye `custom_code`, lo que implica que la carga del modelo requiere código personalizado incluido en el repositorio y no es compatible directamente con implementaciones estándar de transformers sin confiar en módulos remotos. El repositorio ocupa 1,7 GB.

La información pública es muy escasa: la model card se limita a una línea descriptiva, no se declaran idiomas soportados ni pipeline, y el modelo no registra descargas ni interacciones en el momento de la consulta. Por tanto, esta ficha se limita a los datos verificables del repositorio y marca explícitamente como no disponible todo aquello que el autor no ha documentado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta `qwen3_5`, con `custom_code`; detalles no disponibles) |
| Parámetros totales | 852.985.920 (~853 M) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/otros no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `custom_code`) |

## Arquitectura y entrenamiento

El modelo se distribuye con la etiqueta de arquitectura `qwen3_5` y requiere `custom_code`, lo que indica que la definición de la arquitectura no está cubierta por las clases estándar de transformers y que el repositorio incluye módulos Python propios que deben cargarse con `trust_remote_code=True`. El número de parámetros (853 M) es coherente con un transformer decoder-only de tamaño pequeño, aunque no se especifican dimensiones de capas, número de cabezas ni vocabulario.

No hay información publicada sobre el proceso de entrenamiento: ni volumen de tokens, ni composición del dataset, ni si hubo etapas de ajuste supervisado, RLHF o DPO. La única indicación del autor es que se trata de un fine-tune de "d3-lite" orientado a un "soup pool", es decir, un modelo pensado para participar en mezclas de pesos (model souping) junto con otros checkpoints. No se documentan innovaciones técnicas como decodificación especulativa, atención lineal o modos de razonamiento.

## Capacidades

- Generación de texto: capacidad esperable por tratarse de un modelo de lenguaje, aunque no está documentada por el autor.
- Razonamiento, código y matemáticas: no disponible; no hay evaluación ni declaración al respecto.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible; no se declaran.
- Uso como componente de mezclas de pesos: el autor lo describe explícitamente como fine-tune para un "soup pool", por lo que su uso previsto es la combinación con otros checkpoints compatibles.

## Casos de uso

- Mezcla de pesos (model soup): el caso de uso declarado por el autor. El checkpoint se integraría en un pipeline de promediado o fusión de pesos junto con otros modelos de la misma arquitectura base para producir un modelo combinado.
- Experimentación en investigación: al ser un modelo de 853 M con licencia Apache 2.0, sirve como punto de partida para estudiar técnicas de fine-tuning y souping en entornos con recursos limitados.
- Prototipado local de generación de texto: por su tamaño, puede ejecutarse en hardware de consumo, aunque la ausencia de cuantizaciones publicadas obliga a generarlas a partir de los safetensors.
- Evaluación comparativa de fine-tunes: útil como referencia en estudios que comparen checkpoints derivados de la misma base.
- Pruebas de integración de `custom_code`: permite validar flujos de carga con `trust_remote_code=True` en entornos controlados.
- Docencia y formación: ejemplo práctico de publicación de un fine-tune pequeño con licencia permisiva para ejercicios de despliegue.

No se recomienda su uso en producción para tareas concretas (atención al cliente, generación de código, etc.) sin una evaluación previa, dado que el autor no documenta capacidades ni resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 853 M parámetros, en FP16 se requieren aproximadamente 1,7 GB solo para los pesos; en FP32, unos 3,4 GB; en cuantización de 8 bits, alrededor de 0,9 GB, y en 4 bits, unos 0,5 GB (estimaciones teóricas, no verificadas para este modelo).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para FP16 con margen para el contexto; una RTX 3060, RTX 4060 o superior es suficiente.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de GPU consumer modernas, dada la baja huella de parámetros.
- Opciones de despliegue: al requerir `custom_code`, la carga estándar con vLLM, llama.cpp u Ollama no está garantizada; sería necesario convertir los pesos y verificar la compatibilidad de la arquitectura. La vía más directa es transformers con `trust_remote_code=True`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-lite-v1 | ~853 M | no disponible | Apache 2.0 | Hugging Face, requiere `custom_code` |
| Qwen2.5-0.5B | ~494 M | 32 768 tokens | Apache 2.0 | Hugging Face, transformers estándar |
| Qwen2.5-1.5B | ~1,54 B | 32 768 tokens | Apache 2.0 | Hugging Face, transformers estándar |
| SmolLM2-1.7B | ~1,7 B | 8 192 tokens | Apache 2.0 | Hugging Face, transformers estándar |

La comparación se ofrece a título orientativo por rango de tamaño; no hay datos de rendimiento de zils-lite-v1 que permitan contrastar calidad. La diferencia principal frente a las alternativas es la dependencia de `custom_code` y la ausencia de documentación.

## Limitaciones y advertencias

- Documentación mínima: la model card no describe entrenamiento, datos, idiomas ni evaluación, lo que impide valorar su calidad de forma objetiva.
- Sesgos conocidos: no disponibles; al no documentarse los datos de entrenamiento, no puede evaluarse el sesgo.
- Riesgo de alucinación: no evaluado; en modelos pequeños sin ajuste documentado el riesgo suele ser elevado, pero no hay datos específicos.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el modelo incorpora `custom_code`; conviene auditar ese código antes de desplegarlo y tener en cuenta que cargarlo con `trust_remote_code=True` ejecuta código del autor.
- Producción: sin benchmarks ni pruebas publicadas, no es recomendable para sistemas en producción sin una evaluación propia previa.
- Procedencia: el autor no tiene descargas ni interacciones registradas en el momento de la consulta; conviene verificar la integridad de los pesos y la compatibilidad de la arquitectura antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SusanHill/zils-lite-v1
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
