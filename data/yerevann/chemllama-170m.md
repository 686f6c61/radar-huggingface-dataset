# yerevann/ChemLlama-170M

## Resumen

ChemLlama-170M es un modelo de lenguaje de 169 millones de parámetros desarrollado por el laboratorio de investigación YerevaNN, especializado en el procesamiento de lenguaje natural aplicado a la química. Se trata de un modelo de generación de texto basado en la arquitectura Llama, publicado en el Hugging Face Hub bajo el nombre `yerevann/ChemLlama-170M`. Aunque su model card es una plantilla genérica sin información detallada, su nombre y la actividad del laboratorio sugieren que está orientado a tareas de generación de moléculas o textos químicos, en línea con otros modelos del mismo grupo como `chemlactica-1.3b` o `BARTSmiles`.

La relevancia de este modelo reside en su tamaño compacto (170M parámetros), que lo hace adecuado para experimentación en entornos con recursos limitados, y en su enfoque en el dominio químico, un área donde los modelos de lenguaje grandes suelen ser sobredimensionados. Sin embargo, la falta de documentación pública sobre su entrenamiento, datos y rendimiento limita su uso directo en producción. Es un modelo reciente (creado en abril de 2026) con una comunidad de descargas aún muy pequeña (435 descargas, 0 likes).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformers) |
| Parametros totales | 169.292.544 (169M) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura de ChemLlama-170M es un transformer basado en el diseño de Llama, tal como se infiere de la etiqueta `llama` en los metadatos de Hugging Face. El modelo está implementado con la librería `transformers` y se sirve mediante el pipeline de `text-generation`. No se ha publicado información sobre el número de capas, dimensiones ocultas, número de cabezas de atención ni otros detalles arquitectónicos específicos.

En cuanto al entrenamiento, no hay datos disponibles sobre el conjunto de datos utilizado, el número de tokens procesados, el régimen de entrenamiento (precisión, mezcla de precisión) ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card es una plantilla automática sin contenido real. El tag `arxiv:1910.09700` hace referencia al artículo de Lacoste et al. sobre estimación de emisiones de carbono, que aparece de forma estándar en muchas plantillas de model cards, no a una publicación sobre el modelo.

## Capacidades

- Generación de texto: el modelo es capaz de producir secuencias de texto, presumiblemente en el dominio químico (nombres de moléculas, SMILES, descripciones de reacciones, etc.), aunque no se ha verificado empíricamente.
- Especialización química: por su nombre y la trayectoria del laboratorio YerevaNN, se espera que tenga un rendimiento razonable en tareas de representación molecular y generación de estructuras químicas.
- No se ha documentado soporte para tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües. Estas funciones no están confirmadas y probablemente no estén implementadas dado el tamaño del modelo.

## Casos de uso

- Generación de moléculas de novo: el modelo podría utilizarse para proponer nuevas estructuras moleculares representadas en formato SMILES, útil en etapas iniciales de descubrimiento de fármacos. Su tamaño reducido permite iteraciones rápidas en experimentos de generación condicionada.
- Aumento de datos en quimioinformática: se podría emplear para generar variantes de SMILES o textos descriptivos de compuestos, enriqueciendo conjuntos de datos de entrenamiento para otros modelos más grandes.
- Prototipado de pipelines de NLP químico: dado su pequeño tamaño, es adecuado para probar infraestructuras de inferencia (vLLM, TGI) antes de escalar a modelos mayores.
- Investigación académica en modelos de lenguaje para química: sirve como punto de partida para estudios comparativos sobre el impacto del tamaño del modelo en tareas específicas del dominio.
- Extracción de información química: aunque no está confirmado, podría adaptarse mediante fine-tuning para extraer entidades químicas de textos científicos.
- Educación y divulgación: por su bajo coste computacional, puede usarse en entornos docentes para ilustrar el funcionamiento de los LLM aplicados a un dominio especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni métricas específicas del dominio químico (como exactitud en generación de SMILES o validez química). Tampoco se dispone de comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: al tener 169M parámetros, en FP32 ocuparía aproximadamente 677 MB de memoria. Con cuantización a 8 bits, se reduciría a unos 170 MB; en 4 bits, a unos 85 MB. Cabe en cualquier GPU moderna, incluso en tarjetas integradas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Una NVIDIA GTX 1650, RTX 3050 o similar puede ejecutar el modelo sin problemas.
- Compatibilidad con consumer GPU: sí, es totalmente viable en GPUs de consumo.
- Opciones de despliegue: compatible con la librería `transformers` (pipeline de generación), también puede servirse con vLLM, Text Generation Inference (TGI) o llama.cpp (si se convierte a GGUF). No se han publicado guías específicas de despliegue.
- Latencia y throughput: no disponibles. Dado el tamaño, se espera una latencia de milisegundos por token en una GPU moderna, pero no hay mediciones oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos. El laboratorio YerevaNN ha publicado otros modelos como `yerevann/chemlactica-1.3b` (1.3B parámetros), que podría considerarse un competidor directo por su mayor tamaño y orientación química. Sin embargo, no hay datos públicos de rendimiento comparativo. Otras alternativas en el dominio químico incluyen modelos como `ChemBERTa` (encoder, no generativo) o `MolT5` (generativo, pero de mayor tamaño). Sin métricas publicadas, cualquier comparación sería especulativa.

## Limitaciones y advertencias

- Documentación ausente: la model card no aporta información sobre el entrenamiento, los datos, la licencia ni el uso previsto. Esto impide evaluar su idoneidad para tareas concretas y su cumplimiento legal.
- Licencia desconocida: al no especificarse, no se puede garantizar su uso comercial. Se recomienda contactar con el autor antes de cualquier implementación en producción.
- Sesgos y alucinaciones: al ser un modelo pequeño entrenado presumiblemente en un dominio específico, es probable que genere estructuras químicas inválidas o información incorrecta. No se han realizado evaluaciones de sesgo.
- Limitaciones de contexto e idioma: se desconoce la longitud máxima de contexto y los idiomas soportados. Es probable que esté entrenado principalmente en inglés y notación SMILES.
- Riesgo de sobreajuste: dado el tamaño del modelo y la falta de datos sobre el volumen de entrenamiento, podría tener un vocabulario limitado y poca generalización fuera del dominio químico.
- Sin garantías de soporte: el modelo tiene muy poca tracción (435 descargas, 0 likes) y no se observa actividad de mantenimiento en el repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/yerevann/ChemLlama-170M
- Perfil de YerevaNN en Hugging Face: https://huggingface.co/yerevann/models
- GitHub de YerevaNN: https://github.com/YerevaNN/
- Repositorio de YerevaNN en GitHub: https://github.com/orgs/YerevaNN/repositories
- Inferencia a través de FriendliAI: https://friendli.ai/models/yerevann/ChemLlama-170M
