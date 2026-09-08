# tchbcb/MiniCPM5-2B-cpu

## Resumen

MiniCPM5-2B es un modelo de lenguaje denso de 2.000 millones de parámetros desarrollado por el equipo de OpenBMB como parte de la serie MiniCPM5. Se trata de la segunda iteración de esta familia, tras el lanzamiento de MiniCPM5-1B, y está diseñado específicamente para escenarios de despliegue en dispositivos locales, edge computing y entornos con recursos limitados. El modelo se presenta como estado del arte en la categoría de modelos de 2B en código abierto, con capacidades competitivas frente a modelos de 4B en tareas de razonamiento, matemáticas, comprensión de contexto largo, uso de herramientas y tareas agénticas.

La arquitectura es un Transformer denso (no es un modelo de mezcla de expertos), con un total de 2.516.756.480 parámetros según los pesos en formato safetensors. El modelo está optimizado para inferencia en CPU y dispositivos de borde, y soporta generación de texto, tool calling y conversaciones multi-turno. La licencia es Apache 2.0, lo que permite uso comercial y modificaciones. Los idiomas soportados son inglés y chino. Aunque la model card menciona capacidades de contexto largo, no se especifica la longitud exacta de la ventana de contexto en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso |
| Parametros totales | 2.516.756.480 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el modelo está diseñado para contexto largo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MiniCPM5-2B es un modelo Transformer denso, sin componentes de mezcla de expertos (MoE) ni arquitecturas híbridas como SSM. Escala la misma receta de entrenamiento que su predecesor MiniCPM5-1B, manteniendo un diseño orientado a la eficiencia para su ejecución en dispositivos con recursos limitados. Los datos de entrenamiento provienen del conjunto de datasets UltraData de OpenBMB, que incluye corpus de texto general (Ultra-FineWeb, UltraX-Preview, Ultra-FineWeb-L3), así como datasets especializados en matemáticas (UltraData-Math), código (UltraData-Code) y datos de fine-tuning supervisado (UltraData-SFT-2605, UltraData-SFT-Agent-2609) y de aprendizaje por refuerzo (UltraData-RL-2609). Esto indica que el modelo pasó por fases de preentrenamiento, ajuste supervisado y posiblemente RLHF/DPO, aunque no se detallan los hiperparámetros ni el número total de tokens utilizados. No se mencionan innovaciones técnicas específicas en la información disponible más allá de su optimización para despliegue on-device y soporte de tool calling.

## Capacidades

- Generación de texto y conversación multi-turno, con soporte para instrucciones complejas.
- Razonamiento en código y matemáticas, con rendimiento destacado en tareas de programación y resolución de problemas numéricos.
- Comprensión de contexto largo, aunque la longitud exacta de la ventana no se especifica en la información disponible.
- Soporte de tool calling / function calling, lo que permite integrar el modelo en flujos de trabajo automatizados y agentes.
- Capacidades agénticas y razonamiento multi-paso, según lo indicado en la model card.
- Multilingüe en inglés y chino, con potencial para aplicaciones en ambos idiomas.
- Optimizado para ejecución en dispositivos locales, edge computing y entornos con restricciones de recursos.

## Casos de uso

- Asistentes conversacionales locales: el modelo puede desplegarse en dispositivos de borde o en máquinas sin conexión a internet para ofrecer asistentes de voz o chat que no dependen de servicios en la nube, gracias a su diseño on-device y su tamaño compacto.
- Generación de código en entornos aislados: gracias a su capacidad de razonamiento en código, puede utilizarse en pipelines de CI/CD para revisión automática, generación de tests o asistencia a desarrolladores en entornos sin acceso a APIs externas.
- Agentes automatizados con tool calling: su soporte de function calling permite construir agentes que interactúan con APIs internas, bases de datos o sistemas de gestión, automatizando tareas como consultas, actualizaciones o generación de informes.
- Procesamiento de documentos largos: la capacidad de contexto largo (aunque sin cifra exacta) hace que sea adecuado para resumir o analizar contratos, informes técnicos o documentación extensa en inglés y chino.
- Aplicaciones educativas de matemáticas: puede integrarse en plataformas de tutoría para resolver problemas matemáticos paso a paso, aprovechando su entrenamiento en UltraData-Math.
- Asistencia técnica bilingüe: al soportar inglés y chino, puede usarse en sistemas de soporte al cliente que atiendan a usuarios de ambos idiomas, gestionando conversaciones multi-turno y escalando a agentes humanos cuando sea necesario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma que MiniCPM5-2B alcanza el estado del arte en su clase de 2B y que es competitivo con modelos de 4B en tareas de código, matemáticas, contexto largo, tool use y tareas agénticas, pero no se proporcionan cifras concretas de evaluaciones como MMLU, HumanEval o GSM8K. Tampoco se dispone de datos comparativos con otros modelos en la documentación facilitada.

## Requisitos de hardware

No se han publicado requisitos de hardware específicos en la información disponible. Al tratarse de un modelo denso de aproximadamente 2.500 millones de parámetros, se puede estimar que en precisión FP16 necesitaría alrededor de 5 GB de VRAM, y en cuantización de 8 bits podría reducirse a unos 2,5 GB, pero estos valores son orientativos y no están confirmados por el autor. El repositorio está etiquetado como "cpu", lo que sugiere que está pensado para ejecutarse en CPU, y se ha encontrado una variante adicional llamada "tchbcb/MiniCPM5-2B-cpu-mixed" que incluye un servidor de inferencia en C con soporte AVX2 para CPU. No se indican GPUs recomendadas, opciones de despliegue oficiales (vLLM, llama.cpp, Ollama, TGI) ni datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de datos concretos de comparación con modelos similares en la información proporcionada. La model card menciona que MiniCPM5-2B compite con modelos de la clase 4B en general, pero no se nombran modelos específicos ni se ofrecen métricas cuantitativas. Tampoco se proporcionan especificaciones de otros modelos comparables. La única referencia directa es MiniCPM5-1B, el predecesor de la misma serie, del cual no se facilitan datos técnicos en esta ficha.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos en la información disponible.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar contenido plausible pero incorrecto, especialmente en tareas de razonamiento complejo o cuando se le pide información no presente en sus datos de entrenamiento.
- Limitaciones de idioma: el modelo solo soporta inglés y chino, por lo que su uso con otros idiomas, incluido el español, no está garantizado.
- Limitaciones de contexto: aunque se menciona soporte para contexto largo, no se especifica la longitud máxima de la ventana, lo que puede llevar a suposiciones incorrectas en aplicaciones que requieran procesar documentos muy extensos.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificaciones, pero es importante verificar que el repositorio de HuggingFace sea una copia oficial o autorizada, ya que el autor del repositorio es "tchbcb" y no el equipo original de OpenBMB.
- Para producción: al ser un modelo optimizado para CPU y edge, puede requerir ajustes de cuantización o implementaciones específicas para alcanzar un rendimiento aceptable en servidores de producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/tchbcb/MiniCPM5-2B-cpu
- Variante cuantizada para CPU: https://huggingface.co/tchbcb/MiniCPM5-2B-cpu-mixed
- Paper técnico de MiniCPM: https://arxiv.org/pdf/2506.07900
- Paper adicional: https://arxiv.org/abs/2602.09003
- Repositorio oficial en GitHub: https://github.com/OpenBMB/MiniCPM
- Wiki de MiniCPM (en chino): https://modelbest.feishu.cn/wiki/UtWxwcERfiRIpIkBOjuc3h9tn1D
- Dataset UltraData: https://ultradata.openbmb.cn/
- Demo online: https://huggingface.co/spaces/openbmb/MiniCPM5-2B-Demo
