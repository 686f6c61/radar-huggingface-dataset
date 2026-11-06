# VatsaIsHere/termaid

## Resumen

termaid es un modelo especializado en la generación de diagramas de flujo a partir de descripciones en lenguaje natural. Se trata de un ajuste fino mediante LoRA de LiquidAI/LFM3-1.7B, desarrollado por el usuario VatsaIsHere como motor del proyecto homónimo termaid, una aplicación de barra de menús para macOS. El modelo no genera Mermaid directamente: recibe una frase y el estado actual del diagrama, y devuelve JSON compacto con cajas y aristas que la aplicación valida y convierte en sintaxis Mermaid, evitando así errores de sintaxis en la salida.

Con 1.728.801.600 parámetros, el modelo se distribuye únicamente como un archivo GGUF cuantizado en Q6_K de 1,43 GB, pensado para ejecutarse localmente en un Mac mediante llama.cpp. Su propósito es muy acotado: transformar una descripción oracional en una actualización estructurada del diagrama, no mantener conversaciones ni escribir Mermaid bajo petición. Es relevante para desarrolladores que necesiten inferencia local de bajo coste en tareas de extracción estructurada, y como ejemplo de ajuste fino de un modelo base pequeño para una tarea de formato rígido.

La licencia es la LFM Open License v1.0, heredada del modelo base, que excluye el uso comercial a organizaciones con ingresos anuales de 10 millones de dólares o más. El modelo solo se ha entrenado y evaluado en inglés, y su ámbito de aplicación está deliberadamente limitado al formato JSON por frase definido por la aplicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LiquidAI/LFM3-1.7B) con adaptador LoRA de rango 16 fusionado |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q6_K (única publicada); se evaluó Q4_K_M y se descartó por pérdida de calidad |
| Idiomas soportados | inglés únicamente (entrenamiento y pruebas) |
| Licencia | LFM Open License v1.0 (lfm1.0); excluye uso comercial a organizaciones con ingresos anuales ≥ 10 M USD |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de LFM3-1.7B de Liquid AI, un transformer de 1.728.801.600 parámetros. Sobre él se entrenó un adaptador LoRA de rango 16 que después se fusionó en los pesos base y se convirtió a GGUF con cuantización Q6_K. El entrenamiento se ejecutó en Modal durante 628 pasos con un tamaño de lote efectivo de 16, lo que equivale a aproximadamente 1,33 épocas; una tasa de aprendizaje de 1e-4 divergió, por lo que se empleó una inferior.

Los datos de entrenamiento constan de 7.550 pasos de entrenamiento y 565 de validación. Cada paso contiene una frase, el diagrama previo y el diagrama resultante. La composición combina historias plantilla con vocabulario de dominios como software, contratación, sanidad, logística, finanzas y cocina; unas 300 historias largas generadas por Claude Sonnet para mantener la coherencia entre frases; y unas 300 historias dirigidas a corregir dos errores recurrentes de la versión v10 (enviar resultados a la caja equivocada y colgar decisiones del paso incorrecto). Se descartaron los pasos cuyos diagramas objetivo no superaban las comprobaciones estructurales propias de termaid. No se menciona uso de RLHF ni DPO.

La innovación principal no está en la arquitectura sino en la interfaz de salida: el modelo emite JSON con listas de `boxes` y aristas en formato `[from, to, label]`, y la aplicación valida y construye el Mermaid. Esto elimina la posibilidad de generar sintaxis Mermaid inválida. La inferencia debe realizarse con la plantilla de chat de LFM3, un bloque `<think></think>` vacío y temperatura 0, replicando las condiciones de entrenamiento con el modo de razonamiento desactivado.

## Capacidades

- Generación de diagramas de flujo incrementales: procesa una frase junto con el diagrama acumulado y devuelve el diagrama actualizado en JSON compacto.
- Estructuración de decisiones: convierte condiciones como "si las pruebas fallan" en una caja de decisión con ramas sí y no.
- Extracción de entidades de proceso: identifica cajas y relaciones a partir de descripciones en inglés.
- Salida estructurada validable: el formato JSON permite comprobaciones automáticas de estructura antes de renderizar.
- Ejecución local: diseñado para correr en un Mac mediante llama.cpp u Ollama.
- No soporta conversación general, tool calling, function calling, razonamiento multi-paso libre, visión, audio ni modo de pensamiento activo.
- No genera Mermaid directamente aunque se le solicite.
- Multilingüe: no; solo inglés.

## Casos de uso

- Generación de diagramas de flujo en una aplicación de escritorio: la aplicación termaid envía una frase del usuario junto con el diagrama actual y recibe el JSON actualizado, que renderiza como Mermaid. El modelo es adecuado porque su salida está restringida a un esquema validable y se ejecuta localmente sin coste de API.
- Documentación de procesos internos: un equipo puede describir verbalmente un flujo de aprobación o de soporte y obtener un diagrama estructurado que luego se exporta a Mermaid para incluir en documentación técnica, gracias al formato de aristas con etiquetas.
- Prototipado rápido de flujos en entornos con requisitos de privacidad: al ejecutarse en local con llama.cpp, permite procesar descripciones de procesos sensibles sin enviar datos a servicios externos.
- Extracción de estructura para pipelines de automatización: el JSON de cajas y aristas puede consumirse por otros sistemas para generar grafos, validar procesos o alimentar herramientas de análisis, ya que la salida es compacta y predecible.
- Asistente de modelado de decisiones en inglés: para descripciones que incluyen condiciones ("si X entonces Y, en caso contrario Z"), el modelo produce cajas de decisión con ambas ramas, útil en formación o análisis de procesos.
- Integración en herramientas de edición de diagramas: un editor puede usar el modelo para sugerir la siguiente caja o arista a medida que el usuario escribe una descripción, aprovechando que el modelo recibe el estado previo del diagrama.
- Evaluación de técnicas de ajuste fino con LoRA en modelos pequeños: sirve como referencia reproducible de un pipeline de LoRA, fusión, cuantización GGUF y evaluación con holdouts para tareas de salida estructurada.

## Benchmarks y rendimiento

Los datos de evaluación publicados se refieren a la calidad de los diagramas generados, no a benchmarks estándar como MMLU o HumanEval.

Evaluación sobre 55 descripciones de holdout regulares (incluyen dominios no vistos como educación, legal y fabricación):

| Métrica | v10 | v11 |
|---|---|---|
| Diagramas válidos | 55 | 55 |
| Limpios, sin problemas estructurales | 42 | 41 |
| Decisiones con ambas ramas | 45/59 | 46/61 |

Evaluación sobre 40 descripciones difíciles, largas y densas, calificadas por Claude Sonnet:

| Métrica | v10 | v11 |
|---|---|---|
| Correctos, 0 errores mayores | 1 | 2 |
| Como máximo 2 errores mayores | 7 | 15 |
| Total de errores mayores | 152 | 137 |
| Objetivo equivocado | 43 | 35 |

El autor advierte que Sonnet calificó cada diagrama una sola vez, por lo que diferencias de unos 5 errores deben considerarse ruido. La reducción de objetivos equivocados y el salto de 7 a 15 diagramas casi correctos superan ese margen.

Comparación de cuantizaciones sobre 55 descripciones de holdout con v10: Q6_K coincidió con el modelo sin cuantizar en 27 ocasiones, mientras que Q4_K_M solo en 17. Q4_K_M resultó aproximadamente un 15 % más rápido, diferencia que el autor consideró insuficiente.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q6_K ocupa 1,43 GB; con la sobrecarga de contexto de llama.cpp, se puede ejecutar con aproximadamente 2-3 GB de memoria unificada o VRAM.
- GPU recomendadas: no se especifican; el caso de uso declarado es un Mac con memoria unificada mediante llama.cpp.
- Cabe en GPU de consumo: sí, por tamaño; cualquier GPU con al menos 3-4 GB de VRAM disponible debería poder cargarlo, aunque no se han publicado pruebas en GPU discretas.
- Opciones de despliegue: llama.cpp (ruta principal, usada por la aplicación termaid) y Ollama (el autor proporciona un Modelfile). No se mencionan vLLM ni TGI.
- Latencia y throughput: no disponibles. El autor solo indica que Q4_K_M fue aproximadamente un 15 % más rápido que Q6_K.
- Configuración de inferencia obligatoria: plantilla de chat de LFM3, bloque `<think></think>` vacío y temperatura 0; requiere el system prompt y el formato de mensaje por frase del repositorio de termaid.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| termaid | 1.728.801.600 | no disponible | JSON de cajas y aristas | LFM Open License v1.0 (restricción comercial ≥ 10 M USD) | GGUF en Hugging Face |
| LiquidAI/LFM3-1.7B | 1.728.801.600 | no disponible | texto libre | LFM Open License v1.0 | pesos originales en Hugging Face |
| Alternativas especializadas en diagramas Mermaid | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría (generación estructurada de diagramas de flujo) en la documentación proporcionada. Frente a su modelo base, termaid sacrifica la conversación general y la generación libre de texto a cambio de una salida JSON validable y un formato de mensaje específico.

## Limitaciones y advertencias

- Dificultad con frases largas que acumulan varios pasos: suele procesar la primera mitad y descartar el resto, perdiendo ramas "en caso contrario" o truncando el flujo. Más datos de entrenamiento apenas mejoraron este comportamiento entre v10 y v11.
- Añade ocasionalmente aristas o cajas que el texto no menciona.
- Solo entrenado y probado en inglés; no hay soporte ni evaluación en otros idiomas.
- No es un modelo conversacional: no responde a preguntas generales ni escribe Mermaid aunque se le pida.
- Requiere un formato de mensaje y un system prompt específicos del repositorio de termaid; usarlo fuera de ese contexto produce salidas no válidas.
- La licencia LFM Open License v1.0 excluye el uso comercial a organizaciones con ingresos anuales de 10 millones de dólares o más; el código de la aplicación termaid es MIT, pero los pesos no.
- Riesgo de alucinación estructural: puede inventar pasos o relaciones no presentes en la descripción, aunque la validación de la aplicación filtra parte de estos errores.
- Los resultados de evaluación provienen de un único evaluador (Claude Sonnet) y de conjuntos pequeños (55 y 40 descripciones), por lo que la fiabilidad estadística es limitada.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.
- No se han publicado datos de sesgos, contexto máximo ni comportamiento en producción a escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VatsaIsHere/termaid
- Modelo base LiquidAI/LFM3-1.7B: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Repositorio de la aplicación termaid: https://github.com/WorldOccupier/termaid
