# TyPlant/BurrowBrief-LoRA

## Resumen

BurrowBrief-LoRA es un adaptador LoRA de rango 16 (alpha 32) entrenado sobre el modelo base Ternary Bonsai 2 27B en su versión cuantizada PTQ1_0 (GGUF). Lo desarrolla TyPlant como componente del producto Burrow, una aplicación de escritorio de IA local, y su función concreta es redactar correos electrónicos y respuestas, además de corregir o reescribir texto manteniendo los hechos aportados por el usuario. El adaptador pesa 233 MB en formato f16 GGUF y no está fusionado con el modelo base.

El modelo resuelve un problema acotado pero crítico en la escritura asistida: la deriva de contenido. Muchos modelos generativos añaden nombres, fechas, cifras o promesas que el usuario no ha proporcionado, lo que en un correo profesional puede ser grave. BurrowBrief se entrena con un sistema de reglas explícitas que prioriza la fidelidad factual sobre la fluidez, y su evaluación interna de 40 prompts trampa muestra una mejora estadísticamente significativa en fidelidad respecto a su ronda DPO anterior.

Es relevante ahora porque ejemplifica una tendencia de especialización mediante adaptadores pequeños sobre bases cuantizadas de forma agresiva (ternaria), pensados para ejecutarse en hardware de consumo. El adaptador está entrenado y probado con llama.cpp y un conjunto de parámetros de muestreo concretos, y su uso está pensado para integrarse en la aplicación Burrow, no como modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer denso (Ternary Bonsai 2 27B) |
| Parámetros totales | 116.727.808 (adaptador; el modelo base es de 27B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (configuración de referencia en llama-server) |
| Tipos de cuantización | f16 GGUF para el adaptador; el base se distribuye en PTQ1_0 (ternario) |
| Idiomas soportados | inglés (en) |
| Licencia | base Apache-2.0; licencia del adaptador no disponible; datos de entrenamiento generados con un modelo docente alojado cuyos términos deben revisarse antes de redistribuir |
| Formato de pesos | GGUF (adaptador LoRA, no fusionado) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 32, guardado en f16 GGUF y aplicado en tiempo de inferencia sobre el modelo base Ternary Bonsai 2 27B cuantizado en PTQ1_0. No se fusiona con los pesos base, lo que permite compartir el mismo modelo cargado con otros adaptadores de la misma familia (como BurrowEssay) y alternar entre ellos por petición sin recargar. El entrenamiento se realizó con llama.cpp y un build específico de PrismML (b12128), con el razonamiento desactivado.

El ajuste supervisado usó 2.321 filas: 1.733 correos, 542 tareas de corrección y edición, y 46 reescrituras. Después se aplicaron rondas de DPO orientadas a evitar la introducción de hechos nuevos; la ronda final incluyó 153 pares de preferencia, 35 de ellos repetidos de la ronda anterior. El sistema de prompts de entrenamiento impone reglas estrictas: conservar los hechos exactamente, no inventar nombres, fechas, cantidades, motivos ni promesas, mantener la incertidumbre ("planned", "subject to approval"), no firmar con un nombre no proporcionado y no disculparse por errores no mencionados. La evaluación se hizo con 40 prompts trampa puntuados a ciegas por el autor, comparando con la ronda DPO previa.

## Capacidades

- Redacción de correos electrónicos y respuestas en inglés con voz natural y fidelidad a los hechos aportados.
- Corrección de texto (proofreading) y edición de estilo sin alterar el contenido factual.
- Reescritura de fragmentos, aunque con menor fiabilidad que la edición (solo 46 filas de entrenamiento).
- Resumen de texto como capacidad secundaria, no entrenada de forma específica.
- Mantenimiento explícito de matices de incertidumbre y condicionalidad en el texto generado.
- Ejecución local en hardware de consumo mediante llama.cpp.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento (el thinking se desactiva por diseño).

## Casos de uso

- Redacción de correos profesionales en inglés: el adaptador genera respuestas completas a partir de un borrador de hechos y evita añadir compromisos o cifras no indicadas, lo que lo hace adecuado para comunicaciones comerciales donde un dato inventado tiene coste real.
- Respuestas a hilos de correo: con 4.096 tokens de contexto puede incorporar el hilo previo como referencia y mantener la coherencia de la respuesta sin desviarse del contenido original.
- Corrección ortotipográfica y de estilo: integrado en un editor de escritorio, corrige gramática y fluidez manteniendo la terminología y los datos del usuario, útil para equipos que redactan documentación en inglés.
- Edición de borradores con restricciones factuales: en flujos donde el texto debe pasar revisión legal o de compliance, las reglas de no invención reducen el trabajo de verificación posterior.
- Asistencia de escritura offline en entornos con requisitos de privacidad: al ejecutarse en local sobre una GPU de 8 GB, permite procesar correos con datos sensibles sin enviarlos a servicios en la nube.
- Integración en herramientas de productividad de escritorio: la aplicación Burrow lo carga junto a otros adaptadores del mismo base y conmuta por petición, lo que permite ofrecer redacción, ensayo y edición desde un único proceso de inferencia.
- Prototipado de asistentes de correspondencia especializados: sirve como referencia para equipos que quieran entrenar adaptadores LoRA con DPO orientado a fidelidad sobre bases cuantizadas.

## Benchmarks y rendimiento

Evaluación interna del autor con 40 prompts trampa (categorías: warmth creep, certainty creep, atribución, no-new-information, conteo), puntuación ciega de una sola persona, comparando este adaptador con su ronda DPO anterior:

| Métrica | Este adaptador | Ronda DPO anterior |
|---|---|---|
| Fidelidad (1 a 5, mayor mejor) | 4,85 | 4,53 |
| Prompts con error de fidelidad | 4 | 14 |
| Naturalidad (1 a 5) | 4,20 | 4,28 |

La mejora en fidelidad fue significativa (test de signos, p=0,01); la diferencia en naturalidad queda dentro del ruido de puntuación. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador añade 233 MB en f16 sobre el modelo base cuantizado PTQ1_0; el requisito dominante es el del base, no el del adaptador.
- GPU probada: RTX 4060 de 8 GB, con aproximadamente 26 tokens por segundo con el adaptador activo.
- Cabe en GPU de consumo de 8 GB según la prueba del autor; no se documentan requisitos para GPUs de gama inferior.
- Despliegue mediante llama.cpp con `llama-server`, usando `--lora burrow-brief.gguf`, `-ngl 99`, `-c 4096`, `-fa on`, `--jinja` y `--reasoning off`.
- Parámetros de muestreo de referencia: temperatura 0,7, top-p 0,8, top-k 20, presence penalty 1,5.
- Requiere el build de llama.cpp de PrismML (evaluado en b12128; Burrow empaqueta el build 10777, donde carga y escribe pero no se remidió la calidad).
- No se documenta compatibilidad con vLLM, TGI, Ollama u otros motores.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| BurrowBrief-LoRA | LoRA sobre base 27B ternario | 116,7 M (adaptador) | 4.096 | Correo y edición con fidelidad factual | Base Apache-2.0; adaptador no disponible | Hugging Face (TyPlant) |
| BurrowEssay-LoRA | LoRA sobre el mismo base | no disponible | no disponible | Redacción de ensayos | no disponible | Hugging Face (TyPlant) |
| Ternary Bonsai 2 27B | Modelo base denso cuantizado ternario | 27B | no disponible | Generación de texto general | Apache-2.0 | Hugging Face (prism-ml) |

No se dispone de datos de benchmarks comparables con otros adaptadores de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Está orientado a correo: las notas de entrenamiento del autor desaconsejan usarlo como adaptador general de reescritura o resumen; puede reescribir de forma laxa y perder detalles.
- El resumen no forma parte de los datos de entrenamiento y debe tratarse como capacidad accesoria, no como fortaleza.
- Pueden aparecer marcadores de posición ocasionales como "[Your Name]" en la salida.
- La evaluación es pequeña (40 prompts) y fue puntuada por una sola persona, el propio autor, sin evaluación externa ni reproducibilidad independiente.
- Solo soporta inglés; no se documenta multilingüismo.
- La licencia del adaptador no está disponible y los datos de entrenamiento se generaron con un modelo docente alojado cuyos términos deben verificarse antes de redistribuir los pesos.
- Requiere un build específico de llama.cpp (PrismML); la calidad no se ha remidido en el build que empaqueta la aplicación Burrow (10777).
- El razonamiento debe estar desactivado; no se ha evaluado su comportamiento con thinking activo.
- Riesgo de alucinación mitigado pero no eliminado: 4 de 40 prompts trampa presentaron algún error de fidelidad en la evaluación.
- No se documentan sesgos específicos ni comportamiento en dominios distintos del correo y la edición.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TyPlant/BurrowBrief-LoRA
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Adaptador hermano (ensayos): https://huggingface.co/TyPlant/BurrowEssay-LoRA
- Sitio del producto Burrow: https://getburrow.run/
- Descarga de la aplicación: https://getburrow.run/#download
