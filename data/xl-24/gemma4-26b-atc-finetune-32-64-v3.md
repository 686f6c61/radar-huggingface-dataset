# xl-24/gemma4-26b-atc-finetune-32-64-v3

## Resumen

`xl-24/gemma4-26b-atc-finetune-32-64-v3` es un ajuste fino (finetune) del modelo `unsloth/gemma-4-26B-A4B-it`, publicado por el usuario xl-24 en Hugging Face. Se trata de un modelo de generación de texto derivado de la familia Gemma 4 de Google, en su variante de 26 000 millones de parámetros totales con arquitectura de mezcla de expertos (MoE, por sus siglas en inglés) y aproximadamente 4000 millones de parámetros activos por token (el sufijo "A4B" del nombre base). El ajuste se ha realizado con la librería Unsloth, según indica la propia model card.

El modelo hereda la arquitectura, el tokenizador y la ventana de contexto del modelo base, y añade un ajuste específico cuyos detalles de entrenamiento (dataset, hiperparámetros, número de pasos) no se documentan en la información disponible. El nombre del repositorio sugiere un ajuste orientado a un dominio concreto ("atc") y una configuración de entrenamiento con longitudes de secuencia de 32 a 64, aunque no se aporta confirmación ni explicación de estos términos.

Su relevancia es limitada por el momento: el repositorio no registra descargas ni interacciones, no incluye resultados de evaluación y la model card es la plantilla estándar generada automáticamente por Unsloth. Resulta útil como punto de partida para quien quiera reproducir o inspeccionar un finetune de Gemma 4 con Unsloth, pero no como modelo listo para producción sin una evaluación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) derivada de Gemma 4; detalles exactos no disponibles |
| Parametros totales | 26 000 millones (según nombre del modelo base) |
| Parametros activos | Aproximadamente 4000 millones (según sufijo A4B del modelo base) |
| Longitud de contexto | No disponible (heredada del modelo base, sin especificar) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; cuantizaciones GGUF no publicadas) |
| Idiomas soportados | Inglés (etiqueta `en` en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |
| Libreria | Transformers, compatible con text-generation-inference |
| Tamano del repositorio | 4,1 GB |
| Modelo base | unsloth/gemma-4-26B-A4B-it |
| Herramienta de entrenamiento | Unsloth, con TRL |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `unsloth/gemma-4-26B-A4B-it`, que a su vez es una versión del Gemma 4 de Google en configuración MoE de 26 000 millones de parámetros totales y unos 4000 millones activos por token. La arquitectura concreta (número de expertos, mecanismo de enrutamiento, tipo de atención) no se detalla en la información proporcionada; solo se confirma la etiqueta `gemma4` y el uso de Transformers como formato de carga.

El entrenamiento se realizó con Unsloth, según la model card, que indica que el modelo "fue entrenado 2 veces más rápido con Unsloth". No se especifican el número de tokens de entrenamiento, la composición del dataset, la presencia de RLHF o DPO, ni los hiperparámetros utilizados. El sufijo "32-64" del nombre del repositorio podría referirse a longitudes de secuencia o a un rango de configuración, pero no hay documentación que lo confirme.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Gemma 4.
- Razonamiento y respuesta a instrucciones, presumiblemente ajustadas al dominio del finetune (no documentado).
- Soporte de tool calling y function calling: no confirmado en la información disponible; depende de lo que conserve el modelo base tras el ajuste.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Modo de razonamiento explícito (thinking mode): no disponible en la información.
- Visión o audio: no disponible en la información.

## Casos de uso

- Evaluación de finetunes de Gemma 4: el repositorio sirve para inspeccionar cómo se comporta un ajuste de Unsloth sobre el modelo base antes de adoptarlo en un pipeline propio.
- Reproducción de experimentos: dado que la licencia es Apache 2.0 y los pesos están en safetensors, se puede cargar con Transformers para comparar el comportamiento frente al modelo base.
- Prototipado de asistentes en inglés: el modelo puede usarse para generar respuestas en inglés en entornos de prueba, siempre que se valide su calidad con un conjunto de evaluación propio.
- Ajuste adicional (continued finetuning): al ser un checkpoint compatible con Transformers y TRL, puede servir como punto de partida para un segundo ajuste con datos propios.
- Despliegue con text-generation-inference: la etiqueta `text-generation-inference` sugiere compatibilidad con TGI, lo que permite servirlo mediante una API HTTP en infraestructura propia.
- Investigación sobre eficiencia MoE: al tener unos 4000 millones de parámetros activos sobre 26 000 millones totales, es un candidato para estudiar el equilibrio entre coste de inferencia y calidad en tareas de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 4,1 GB, lo que no concuerda con un modelo de 26 000 millones de parámetros en precisión completa; es probable que los pesos publicados estén en un formato comprimido o parcial, pero no se especifica. Para el modelo base de 26 000 millones en bf16 se necesitarían del orden de 52 GB de VRAM, cifra estimada a partir del tamaño de parámetros y no confirmada por el autor.
- GPU recomendadas: para el modelo base en precisión completa, GPU de 80 GB como A100 o H100; para cuantizaciones de 4 bits, GPU de 24 GB como RTX 4090 podrían ser suficientes, aunque no hay cuantizaciones publicadas en este repositorio.
- Compatibilidad con GPU de consumo: no confirmada; depende de la cuantización, que no está disponible.
- Opciones de despliegue: Transformers, text-generation-inference (según etiquetas). No se confirma soporte de llama.cpp, Ollama ni vLLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xl-24/gemma4-26b-atc-finetune-32-64-v3 | 26 000 M | ~4000 M | No disponible | Apache 2.0 | Hugging Face, 0 descargas |
| unsloth/gemma-4-26B-A4B-it (base) | 26 000 M | ~4000 M | No disponible | No disponible en la informacion | Hugging Face |
| Gemma 4 (familia de Google) | Variable | Variable | No disponible en la informacion | No disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, métricas ni ejemplos de uso publicados, por lo que se desconoce si el finetune mejora o degrada el modelo base.
- Documentación mínima: la model card es la plantilla automática de Unsloth y no describe el dataset, los hiperparámetros ni el objetivo del ajuste.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está garantizado.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin evaluación específica no puede acotarse.
- Sesgos: no documentados; se heredan los del modelo base y los del dataset de ajuste, que se desconoce.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base `unsloth/gemma-4-26B-A4B-it` y de la familia Gemma de Google antes de desplegar en producción.
- Tamaño del repositorio (4,1 GB) inconsistente con 26 000 millones de parámetros: es necesario verificar qué contiene exactamente el repositorio antes de intentar cargarlo.
- Sin soporte comunitario: cero descargas y cero interacciones indican que el modelo no ha sido validado por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xl-24/gemma4-26b-atc-finetune-32-64-v3
- Modelo base: https://huggingface.co/unsloth/gemma-4-26B-A4B-it
- Unsloth (repositorio): https://github.com/unslothai/unsloth
