# xortron/RESTRICTED-RESEARCH-MODEL

## Resumen

El modelo `xortron/RESTRICTED-RESEARCH-MODEL` es un fine-tune del modelo `darkc0de/gemma-4-31B-it-updated-heretic`, que a su vez se basa en una arquitectura tipo Gemma 4 con 31.273 millones de parámetros. Ha sido desarrollado por el usuario de HuggingFace `xortron`, que se presenta bajo el nombre de proyecto "XORTRON - Criminal Computing" y lo describe como un experimento de investigación en seguridad y alineación de IA. El modelo está etiquetado explícitamente como "uncensored", "harmful", "toxic" y "abliterated", lo que indica que se han eliminado deliberadamente las salvaguardas de seguridad habituales en los modelos de lenguaje.

El acceso al repositorio está restringido (gated) y requiere aceptar condiciones en HuggingFace. A pesar de que la licencia declarada es Apache 2.0, el control de acceso sugiere que su uso está limitado a fines de investigación. El modelo es relevante para investigadores interesados en estudiar el comportamiento de modelos sin alineación, la efectividad de técnicas de "abliteration" (eliminación de capas de rechazo) y los riesgos asociados a la generación de contenido dañino. No se dispone de información pública sobre su longitud de contexto, cuantizaciones disponibles o resultados de benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Gemma 4 31B, fine-tune de darkc0de/gemma-4-31B-it-updated-heretic) |
| Parametros totales | 31.273.086.512 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio contiene pesos en safetensors; no se mencionan versiones GGUF o cuantizadas) |
| Idiomas soportados | Inglés (etiqueta "en") |
| Licencia | Apache 2.0 (aunque el acceso es restringido y requiere aceptación de condiciones) |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Gemma 4 31B, un transformer decoder-only con aproximadamente 31.3 mil millones de parámetros. El proceso de entrenamiento consiste en un fine-tune sobre el modelo `darkc0de/gemma-4-31B-it-updated-heretic`, que ya incorpora modificaciones orientadas a eliminar restricciones de contenido (técnica conocida como "abliteration"). No se ha publicado información sobre el dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO. Los tags del repositorio indican que se empleó la librería Unsloth para el fine-tune, lo que sugiere un proceso optimizado en memoria y velocidad.

La etiqueta "image-text-to-text" en el pipeline sugiere que el modelo podría aceptar entradas de imagen además de texto, aunque no se especifica ninguna capacidad multimodal concreta en la documentación disponible. Tampoco se detallan innovaciones técnicas particulares más allá de la eliminación de capas de rechazo.

## Capacidades

- Generación de texto libre y conversación multi-turno, sin restricciones de contenido de seguridad.
- Procesamiento de entradas de imagen y texto (pipeline image-text-to-text), aunque no se detallan las tareas específicas de visión.
- Comportamiento "uncensored" y "abliterated": el modelo no aplica filtros de contenido dañino, tóxico o ilegal.
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el modelo está etiquetado únicamente para inglés.
- Modo de pensamiento o razonamiento extendido: no disponible.

## Casos de uso

- Investigación en seguridad y alineación de IA: el modelo permite estudiar cómo se comporta un sistema sin salvaguardas, identificar patrones de generación de contenido dañino y evaluar la eficacia de técnicas de mitigación como el fine-tuning de seguridad.
- Red teaming de modelos de lenguaje: puede utilizarse para generar ejemplos adversarios y probar la robustez de otros modelos frente a entradas maliciosas o tóxicas.
- Análisis de sesgos y comportamientos extremos: investigadores pueden examinar qué tipo de respuestas produce un modelo "abliterado" en temas sensibles, comparándolo con versiones alineadas.
- Desarrollo de métodos de detección de contenido dañino: los datos generados por este modelo pueden servir para entrenar clasificadores de toxicidad o sistemas de moderación.
- Estudio de la técnica de "abliteration": permite analizar qué capas o pesos son responsables de los mecanismos de rechazo y cómo su eliminación afecta al comportamiento general.
- Evaluación de riesgos en despliegue de modelos sin censura: útil para documentar los peligros de liberar modelos sin alineación y para diseñar políticas de acceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras evaluaciones estándar para este modelo.

## Requisitos de hardware

- El modelo tiene 31.273 millones de parámetros. El tamaño del repositorio (62.6 GB) corresponde a pesos en FP16 (aproximadamente 2 bytes por parámetro), por lo que la inferencia en FP16 requiere al menos 62.6 GB de VRAM.
- Para ejecución en GPU de consumo, sería necesaria una cuantización a 4 bits (aproximadamente 16 GB de VRAM) o 8 bits (aproximadamente 31 GB). No se han publicado versiones cuantizadas oficiales, pero herramientas como llama.cpp o GPTQ podrían generarlas a partir de los safetensors.
- GPUs recomendadas: una NVIDIA RTX 4090 (24 GB) podría ejecutar una cuantización de 4 bits con margen ajustado; para FP16 se necesitarían GPUs profesionales como A100 (80 GB) o H100.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, Text Generation Inference (TGI) o llama.cpp si se convierte a GGUF. No se ha confirmado compatibilidad con Ollama.
- Latencia y throughput: no disponibles. Dependerán de la cuantización y del hardware utilizado.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de la misma categoría. Existen modelos "uncensored" conocidos como WizardLM-Uncensored o Dolphin, pero no hay datos objetivos de rendimiento de este modelo frente a ellos. La ausencia de benchmarks y la naturaleza restringida del acceso impiden una comparación rigurosa.

## Limitaciones y advertencias

- El modelo está diseñado para generar contenido dañino, tóxico y potencialmente ilegal, sin filtros de seguridad. Su uso conlleva riesgos éticos y legales.
- El acceso está restringido y requiere aceptar condiciones específicas en HuggingFace; no se puede descargar libremente.
- No se han publicado datos sobre sesgos, pero al ser un modelo sin alineación, es previsible que amplifique estereotipos y contenido ofensivo.
- Alto riesgo de alucinación y de generar información falsa, especialmente en contextos donde se le pida contenido extremo.
- La licencia Apache 2.0 es permisiva, pero el control de acceso contradice la apertura habitual de esta licencia; conviene revisar los términos exactos antes de cualquier uso.
- No hay soporte documentado para otros idiomas distintos del inglés.
- No se garantiza estabilidad ni calidad de las respuestas; el modelo puede producir salidas incoherentes o repetitivas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/xortron/RESTRICTED-RESEARCH-MODEL
- Perfil del autor: https://huggingface.co/xortron
- Proyecto XortronOS (espacio): https://darkc0de-xortronos.static.hf.space/
- Página de apoyo en Ko-fi: https://ko-fi.com/xortron
- Modelo base (fine-tune previo): https://huggingface.co/darkc0de/gemma-4-31B-it-updated-heretic
- Modelo relacionado (27B): https://huggingface.co/darkc0de/XORTRON-NXTXPRT9PRO-27B
- Chatbot Xortron7 en miniapps.ai: https://miniapps.ai/Xortron
