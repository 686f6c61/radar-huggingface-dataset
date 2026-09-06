# wepiqx/Spark-X2.5-1.7B-ASHQ1-GGUF

## Resumen

Spark-X2.5-1.7B es un modelo de lenguaje denso y compacto desarrollado por XHToken, orientado a tareas generalistas de conversación, escritura, traducción, razonamiento, codificación, uso de herramientas y flujos de trabajo agénticos. Esta ficha corresponde a la cuantización ASHQ1 publicada por wepiqx, que adapta el modelo base a formato GGUF mediante una técnica de cuantización híbrida.

El modelo destaca por su arquitectura de atención híbrida (una capa de atención completa y tres capas de ventana deslizante) y por su ventana de contexto nativa de 1 millón de tokens, lo que lo hace especialmente adecuado para tareas que requieren procesar documentos extensos o mantener conversaciones largas. Con aproximadamente 1.700 millones de parámetros, se posiciona como una alternativa eficiente para el despliegue en hardware de consumo.

La cuantización ASHQ1 está actualmente en proceso de publicación: los archivos aún no están disponibles y se está generando una matriz de importancia específica para el modelo de 1.7B, ya que la del modelo de 4B no es transferible. El modelo requiere un fork de llama.cpp con soporte para la arquitectura `spark2_5` hasta que la integración se fusione en el repositorio principal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense decoder, `spark2_5` arch, atención híbrida (1 capa full + 3 sliding-window) |
| Parametros totales | 1.7B (el autor lo describe como ~2B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1M tokens (nativa) |
| Tipos de cuantizacion | ASHQ1 (cuantización híbrida). Archivos pendientes de publicación |
| Idiomas soportados | Inglés (según etiqueta de HuggingFace). El modelo base menciona traducción en su descripción |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Spark-X2.5-1.7B es un modelo denso que no utiliza MoE, SSM ni MTP. Su arquitectura `spark2_5` incorpora una capa de atención completa y tres capas de atención de ventana deslizante, lo que permite mantener un coste computacional reducido mientras se conserva una ventana de contexto de 1M tokens. Incluye proyecciones fusionadas `q_k_v_proj`, MLP con `ffn_gate`, `ffn_up` y `ffn_down`, y normalizaciones RMSNorm.

No se han proporcionado datos sobre el proceso de entrenamiento, como el número de tokens, la composición del dataset o si se aplicaron técnicas de RLHF o DPO. La descripción del modelo base indica que está diseñado para tareas generalistas, incluyendo conversación, escritura, traducción, razonamiento, codificación, uso de herramientas y flujos agénticos.

## Capacidades

- Generación de texto y conversación para tareas generalistas.
- Escritura y traducción automática (según la descripción del modelo base; la etiqueta de HuggingFace indica solo inglés).
- Razonamiento y resolución de problemas multi-paso.
- Generación de código y soporte para tareas de programación.
- Tool calling / function calling, mencionado explícitamente en la descripción del modelo base.
- Soporte para agentes y flujos de trabajo agénticos con razonamiento encadenado.
- Procesamiento de contexto largo nativo de 1M tokens, útil para documentos extensos y conversaciones prolongadas.

## Casos de uso

- Atención al cliente automatizada: gracias a su ventana de 1M tokens, puede gestionar conversaciones multi-turno con historiales extensos sin perder información relevante.
- Análisis de documentos largos: permite procesar contratos, informes técnicos o expedientes completos en una sola pasada, extrayendo conclusiones o resúmenes.
- Generación de código en producción: su soporte de tool calling permite integrarlo en pipelines de CI/CD para autocompletar, revisar o generar fragmentos de código.
- Agentes autónomos: su capacidad para razonamiento multi-paso y uso de herramientas lo hace adecuado para agentes que deben planificar y ejecutar secuencias de acciones.
- Traducción de textos extensos: aunque la etiqueta de idioma es solo inglés, la descripción del modelo base menciona traducción, por lo que podría emplearse en tareas de traducción asistida.
- Asistentes de escritura: útil para redactar artículos, correos o documentación técnica con soporte de contexto largo.
- Automatización de flujos de trabajo: puede actuar como orquestador en sistemas que requieren llamadas a APIs externas y razonamiento sobre resultados intermedios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una tabla de cuantizaciones con valores de PPL (perplejidad) pendientes de completar (TBD), y no se aportan datos de MMLU, HumanEval, GSM8K ni otras evaluaciones comparativas.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Como referencia, un modelo denso de ~1.7B en BF16 requeriría aproximadamente 3.4 GB de VRAM; la cuantización ASHQ1 reduciría este requisito, pero no se han publicado valores concretos.
- GPU recomendadas: no disponible. Al ser un modelo compacto, es probable que funcione en GPUs de consumo (RTX 3060, RTX 4060, etc.), pero no hay confirmación oficial.
- Cabe en consumer GPU: probablemente sí, dado su tamaño, aunque no hay datos confirmados.
- Opciones de despliegue: llama.cpp (requiere un fork con soporte `spark2_5`), Ollama (para el modelo base), vLLM (si se adapta).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos detallados de modelos comparables en la información proporcionada. El único modelo comparable conocido es Spark-X2.5-4B, el hermano mayor de la misma familia. La siguiente tabla recoge lo que se puede afirmar a partir de los datos disponibles:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Spark-X2.5-1.7B | 1.7B (descrito como ~2B) | 1M | Apache-2.0 | Cuantización en preparación |
| Spark-X2.5-4B | 4B (según nombre) | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Estado de publicación: los archivos de cuantización aún no están disponibles; la model card indica "Status: waiting on files".
- Requiere un fork de llama.cpp con soporte para la arquitectura `spark2_5`; el llama.cpp estándar no puede ejecutar el modelo.
- La matriz de importancia (imatrix) del modelo de 4B no es transferible al de 1.7B, por lo que la cuantización actual no está optimizada con imatrix.
- La etiqueta de idioma de HuggingFace es solo inglés, aunque el modelo base menciona traducción en su descripción; esto puede limitar su uso en tareas multilingües.
- Riesgo de alucinación: no se han proporcionado datos específicos sobre este aspecto.
- Para uso en producción, es recomendable esperar a que el fork de llama.cpp se fusione en el repositorio principal (PR #27868) y a que se publiquen los cuants finales.

## Enlaces

- HuggingFace del modelo cuantizado: https://huggingface.co/wepiqx/Spark-X2.5-1.7B-ASHQ1-GGUF
- Modelo base en HuggingFace: https://huggingface.co/XHToken/Spark-X2.5-1.7B
- Repositorio de GitHub de XHToken: https://github.com/XHToken/Spark-X2.5
- Página del modelo en Ollama: https://ollama.com/SparkLLM/Spark-X2.5-1.7B:latest
- Pull request de integración en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/27868
- Fuente BF16 mencionada en la model card: https://huggingface.co/XHToken/Spark-X2.5-1.7B-GGUF
