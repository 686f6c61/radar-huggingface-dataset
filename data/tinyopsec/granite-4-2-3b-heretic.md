# tinyopsec/granite-4.2-3b-Heretic

## Resumen

El modelo `tinyopsec/granite-4.2-3b-Heretic` es una variante no oficial y sin documentar del modelo Granite 4.2 de IBM, publicada por el usuario tinyopsec bajo licencia Apache 2.0. El nombre "Heretic" sugiere una modificación experimental o un fine-tuning no autorizado, pero no existe ninguna descripción técnica en la model card ni en los resultados de búsqueda. La información disponible se limita a la licencia y al nombre del repositorio, por lo que no se pueden confirmar las capacidades ni el comportamiento de esta variante concreta.

El modelo base al que hace referencia es Granite 4.2, una familia de modelos densos de razonamiento con tamaños de 3B, 8B y 30B, según la documentación oficial de IBM. Estos modelos incluyen cadena de pensamiento integrada, modos de pensamiento flexibles y tool calling aumentado con razonamiento. Sin embargo, al ser una variante no oficial, se desconoce si la versión "Heretic" conserva esas características, si ha sido modificada en sus pesos o si presenta comportamientos impredecibles.

Esta ficha se elabora a partir de los datos públicos disponibles: la entrada de HuggingFace, la documentación oficial de IBM y la página de Ollama. No se han encontrado benchmarks, especificaciones técnicas detalladas ni información de entrenamiento específica para esta variante, por lo que muchos parámetros se indican como no disponibles o se referencian únicamente al modelo base, sin verificación para la variante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (según familia Granite 4.2, no confirmado para esta variante) |
| Parametros totales | 3B (indicado en el nombre del modelo, no verificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible |

## Arquitectura y entrenamiento

No se ha publicado ninguna información sobre el entrenamiento, el proceso de desarrollo o las modificaciones realizadas en esta variante. La model card está vacía, salvo la declaración de licencia Apache 2.0. El modelo base Granite 4.2 de IBM se describe como una familia de modelos densos de razonamiento con cadena de pensamiento, modos de pensamiento flexibles y tool calling aumentado con razonamiento, pero no se puede confirmar que la variante "Heretic" herede estas características. Se desconoce si ha sido sometida a fine-tuning, fusionada con otros pesos, destilada o alterada de alguna manera, así como los datos utilizados en dicho proceso.

## Capacidades

Las capacidades de esta variante no están documentadas ni verificadas. La siguiente lista se basa en las características descritas para el modelo base Granite 4.2, pero debe interpretarse como una referencia potencial, no como una garantía de comportamiento:

- Generación de texto y razonamiento: el modelo base está diseñado para razonamiento denso con cadena de pensamiento, pero no se confirma que esta variante mantenga esa funcionalidad.
- Tool calling / function calling: la documentación oficial del modelo base indica "reasoning-augmented tool calling", es decir, llamadas a herramientas mejoradas con razonamiento. No hay datos que verifiquen que la variante lo soporte.
- Modos de pensamiento flexibles: se mencionan en la documentación de Granite 4.2, pero no se puede confirmar para esta variante.
- Capacidades multilingües: no disponible.
- Capacidades de visión o audio: no disponible.

## Casos de uso

Debido a la ausencia total de documentación sobre esta variante, no se pueden recomendar casos de uso con seguridad. Los siguientes escenarios son aplicaciones potenciales de un modelo de 3B con las características del modelo base Granite 4.2, pero su validez para la variante "Heretic" no ha sido evaluada:

- Atención al cliente automatizada: si la variante conserva el tool calling del modelo base, podría gestionar consultas de clientes y ejecutar acciones en sistemas externos mediante llamadas a funciones.
- Asistentes de soporte técnico: con capacidad de razonamiento y generación de respuestas, podría ayudar a diagnosticar problemas y proponer soluciones paso a paso, siempre que se verifique su fiabilidad.
- Generación de código en entornos de desarrollo: un modelo de 3B puede integrarse en asistentes de programación para autocompletar y generar snippets, aunque la variante no ha sido evaluada en esta tarea.
- Razonamiento sobre documentos largos: si el modelo base dispone de una ventana de contexto amplia, podría usarse para resumir o extraer información de documentos extensos, pero esto no está confirmado para la variante.
- Orquestación de agentes: gracias al tool calling, podría coordinarse con otros servicios o APIs para construir agentes conversacionales, siempre que se valide su comportamiento.
- Prototipado rápido de soluciones de IA: al ser un modelo pequeño y con licencia Apache 2.0, podría emplearse en pruebas conceptuales, pero sin garantías de rendimiento o seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni de otras evaluaciones para esta variante. Tampoco se dispone de comparaciones con otros modelos en tareas de razonamiento, generación de código o tool calling.

## Requisitos de hardware

No se han publicado requisitos específicos para esta variante. Las siguientes estimaciones son orientativas para un modelo denso de 3B en general, no medidas confirmadas:

- VRAM estimada: en FP16, aproximadamente 6-7 GB. Con cuantización de 4 bits, entre 2 y 3 GB. Con cuantización de 8 bits, en torno a 3.5-4 GB.
- GPUs recomendadas: una RTX 3060 de 12 GB o superior sería suficiente para inferencia en FP16 o cuantizada. Para cargas mayores, se recomienda RTX 4090 o A100.
- Ejecución en GPU de consumo: sí, un modelo de 3B puede ejecutarse en GPUs de consumo, siempre que se utilice cuantización.
- Opciones de despliegue: Ollama, llama.cpp, vLLM y TGI son opciones habituales para modelos de este tamaño. La página de Ollama muestra una versión `granite4.2:3b`, aunque no se confirma que corresponda a esta variante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información para comparar esta variante con otros modelos. No se han publicado benchmarks, especificaciones técnicas ni resultados de rendimiento que permitan establecer una comparativa fiable. La única referencia disponible es el modelo base Granite 4.2 de IBM, pero la variante "Heretic" no ha sido verificada, por lo que cualquier comparación sería especulativa. Se indica "no disponible".

## Limitaciones y advertencias

- Falta de documentación: la variante no tiene model card ni información técnica, lo que impide conocer sus límites y capacidades reales.
- Riesgo de comportamiento impredecible: al ser una modificación no oficial, puede presentar alucinaciones, sesgos o respuestas incoherentes sin que se haya realizado una evaluación.
- Riesgo de seguridad: no se conoce el proceso de entrenamiento ni los datos utilizados, por lo que podría haber problemas de seguridad o contaminación de datos.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero no ofrece garantías de soporte ni responsabilidad por parte del autor.
- Contexto e idiomas: se desconoce la longitud de contexto y los idiomas soportados, lo que limita su uso en aplicaciones multilingües o que requieran ventanas largas.
- Producción: no se recomienda su uso en entornos de producción sin una evaluación exhaustiva previa, tanto de calidad como de seguridad.

## Enlaces

- HuggingFace: https://huggingface.co/tinyopsec/granite-4.2-3b-Heretic
- Documentación oficial de Granite 4.2 (IBM): https://www.ibm.com/granite/docs/models/granite4-2
- Página de Ollama para granite4.2:3b: https://ollama.com/library/granite4.2:3b
