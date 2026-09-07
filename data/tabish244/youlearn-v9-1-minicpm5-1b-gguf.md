# Tabish244/YouLearn-V9.1-MiniCPM5-1B-GGUF

## Resumen

YouLearn V9.1 es un modelo de lenguaje afinado a partir de un modelo base MiniCPM5-1B, desarrollado por Tabish244, y publicado en Hugging Face bajo la licencia Apache 2.0. Este checkpoint ha sido cuantizado al formato GGUF con la variante Q4_K_M, pensado para ejecutarse en dispositivos móviles, en concreto dentro de la aplicacion Android YouLearn, donde actúa como tutor educativo offline. El objetivo principal es ofrecer asistencia educativa estructurada en el propio dispositivo, sin necesidad de conexión a internet, con baja latencia y consumo de recursos reducido.

El modelo se presenta como un Transformer denso de aproximadamente 1.080 millones de parámetros. Segun la model card, el autor lo define como una version afinada con un dataset instructivo propio (V9.1) y optimizado para tareas como generación de tarjetas de repaso, cuestionarios, mapas mentales y respuestas basadas en recuperacion (RAG). La cuantizacion Q4_K_M reduce el tamaño del repositorio a 0,7 GB, lo que lo hace viable para ejecución en CPU y en GPU de consumo, incluso en telefonos de gama alta.

Cabe señalar una discrepancia entre la metadata publicada en Hugging Face, que indica `openbmb/MiniCPM-o-2_6` como modelo base, y el propio README del autor, que se refiere a "Universal OpenBMB MiniCPM5-1B". Los parametros totales (1.080.632.832) corresponden a un modelo de escala 1B, por lo que la referencia a MiniCPM5-1B parece la mas coherente, aunque se recomienda verificar esta inconsistencia antes de integrar el modelo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (segun el modelo base MiniCPM5-1B) |
| Parametros totales | 1.080.632.832 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M |
| Idiomas soportados | Ingles, hindi, marathi |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de un Transformer denso de escala 1B, optimizado para despliegue en dispositivos con recursos limitados. Segun el README, el autor ha realizado un fine-tuning sobre un dataset instructivo propio, denominado YouLearn V9.1, con el fin de adaptar el modelo a tareas educativas estructuradas: generacion de tarjetas de repaso, cuestionarios, mapas mentales y respuestas con recuperacion aumentada (RAG). No se proporcionan detalles sobre el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas como RLHF o DPO.

La innovacion tecnica principal documentada es la cuantizacion a Q4_K_M, que busca equilibrar velocidad, consumo de memoria y calidad en dispositivos moviles. La model card incluye ademas una nota tecnica sobre el prompt de generacion: es necesario anteponer un bloque vacio de razonamiento (``) para evitar que el modelo repita tokens o genere pensamientos innecesarios, lo que sugiere que el modelo base fue entrenado con un modo de pensamiento explicito, habitual en arquitecturas recientes tipo MiniCPM.

## Capacidades

- Generacion de texto y razonamiento estructurado en tareas educativas.
- Creacion de tarjetas de repaso (flashcards) con formato controlado.
- Generacion de cuestionarios y preguntas de opcion multiple.
- Construccion de mapas mentales en formato JSON valido.
- Respuestas basadas en RAG, con disciplina de citacion de fuentes.
- Rechazo de preguntas fuera de dominio mediante respuestas como "Not found in the document".
- Soporte multilingue para ingles, hindi y marathi, incluyendo mezclas informales como Hinglish.
- Compatible con generacion de texto incremental y ejecucion local mediante llama.cpp.
- No se documentan capacidades de tool calling, vision ni audio en la version GGUF.

## Casos de uso

- Tutor educativo offline en aplicacion Android: el modelo se integra en la app YouLearn para ofrecer explicaciones y material de estudio sin conexion, aprovechando su cuantizacion Q4_K_M y su bajo consumo de memoria.
- Generacion automatica de tarjetas de repaso: el modelo produce tarjetas con formato estructurado y contenido sintetizado, util para aplicaciones de estudio basadas en repeticion espaciada.
- Creacion de cuestionarios de evaluacion: dado su fine-tuning especifico, puede generar preguntas tipo test con respuestas correctas y opciones, adaptandose al temario proporcionado en el contexto.
- Mapas mentales a partir de documentos: el modelo devuelve estructuras JSON validas que pueden renderizarse como mapas mentales, lo que facilita la visualizacion de conceptos en aplicaciones educativas.
- Asistente de estudio multilingue para hindi y marathi: permite responder preguntas de estudiantes en estos idiomas, lo que amplia su uso en regiones de India donde estas lenguas son dominantes.
- RAG sobre apuntes o libros de texto: el modelo integra contenido recuperado de documentos y responde con referencias a las fuentes, lo que reduce la probabilidad de respuestas inventadas en contextos bien definidos.
- Despliegue en entornos con recursos limitados: al ser un modelo de 1B cuantizado, es viable en ordenadores de bajo consumo, portatiles sin GPU y dispositivos moviles, lo que permite construir herramientas educativas privadas sin coste de servidores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor presenta unicamente los resultados de una evaluacion A/B interna sobre 24 casos, comparando la version V9.1 con el modelo base universal. Los datos son los siguientes:

| Metrica | YouLearn V9.1 | Modelo base |
|---|---|---|
| Cumplimiento estricto de formato y fallback | 7/8 checks superados | 3/8 checks superados |
| Velocidad media de respuesta | ~0,38 s | ~0,88 s |
| Throughput estimado | ~100 tokens/s | No disponible |
| Integridad estructural (JSON para mapas mentales) | Valido | No disponible |

Estos datos deben interpretarse como una evaluacion interna, no como un benchmark comparativo publico. No se dispone de cifras que permitan comparar el modelo con otras alternativas de la misma escala en tareas genericas.

## Requisitos de hardware

- VRAM estimada: el modelo cuantizado Q4_K_M ocupa aproximadamente 0,7 GB en disco. En inferencia, el uso de memoria puede situarse por debajo de 1 GB, por lo que cabe en dispositivos con 1 GB de RAM o VRAM disponible.
- GPU recomendadas: no es estrictamente necesaria una GPU; puede ejecutarse en CPU. Si se usa GPU, cualquier tarjeta con 2 GB de VRAM, como una GTX 1650 o RTX 3050, es suficiente. No se requieren aceleradores de centro de datos como A100 o H100.
- Compatibilidad con GPU de consumo: si, el modelo esta pensado para ejecucion local en dispositivos moviles y ordenadores personales.
- Opciones de despliegue: llama.cpp y Ollama son las vias mas directas para el formato GGUF. Tambien puede ejecutarse con cualquier frontend compatible con llama.cpp. Para vLLM o TGI seria necesario convertir los pesos a safetensors, aunque no se dispone de documentacion al respecto en la informacion proporcionada.
- Latencia y throughput: segun la model card, el modelo alcanza ~0,38 segundos de tiempo medio de respuesta y ~100 tokens/s en el hardware objetivo, que el autor describe como "target hardware" sin especificar, probablemente un movil de gama alta. No se ofrecen datos para otras configuraciones.

## Comparativa con modelos similares

No se dispone de datos comparativos detallados (contexto, benchmarks, rendimiento) en la informacion proporcionada. Por tamano y caso de uso, el modelo es comparable con otras alternativas de escala 1B-2B como MiniCPM5-1B, Qwen2.5-1.5B, Llama-3.2-1B o SmolLM2-1.7B, pero no se pueden establecer diferencias cuantitativas fiables sin datos publicados. Se recomienda consultar las fichas tecnicas de esos modelos antes de tomar una decision.

## Limitaciones y advertencias

- Puede generar menos elementos de los solicitados (por ejemplo, 2 preguntas de cuestionario en lugar de 3) debido a una tendencia del entrenamiento hacia respuestas mas cortas.
- Los mejores resultados se obtienen configurando limites de tokens de generacion superiores a 384, especialmente para respuestas extensas y arrays de artefactos.
- Riesgo de alucinacion cuando el contexto proporcionado es debil o contiene ruido; el modelo puede no activar el fallback esperado.
- Fuera del dominio educativo, las consultas en Hinglish o marathi informal pueden producir respuestas con estructura suboptima.
- La version GGUF publicada no incluye capacidades multimodales, aunque el modelo base mencionado en la metadata (`openbmb/MiniCPM-o-2_6`) podria soportarlas en otros formatos.
- La discrepancia entre el modelo base indicado en la metadata y el README puede generar confusion al evaluar la compatibilidad con otros frameworks o pesos.
- No se proporcionan evaluaciones de sesgo ni pruebas de seguridad mas alla de la evaluacion A/B interna, por lo que se recomienda realizar una validacion propia antes de usar el modelo en entornos de alto riesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tabish244/YouLearn-V9.1-MiniCPM5-1B-GGUF
- Modelo base mencionado en la metadata: https://huggingface.co/openbmb/MiniCPM-o-2_6
- Repositorio de MiniCPM5-1B en Hugging Face: https://huggingface.co/openbmb/MiniCPM5-1B-GGUF
- Repositorio de referencia en GitHub: https://github.com/blackboxprogramming/minicpm
