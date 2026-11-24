# wer1477/biod-mt-v2-4b

## Resumen

biod-mt-v2-4b es un modelo de decisión de 4B parámetros publicado por el usuario wer1477 en Hugging Face. No es un modelo generativo de propósito general: se trata de una capa de decisión acotada que responde preguntas de opción múltiple tipadas sobre el estado de un flujo de trabajo bioinformático en un único forward pass, devolviendo una etiqueta o una puntuación acotada. Forma parte del runtime del agente Bioflow Agent y se sirve mediante el componente Biod.

Técnicamente, el checkpoint combina una torre de texto congelada de Qwen/Qwen3.5-4B-Base con adaptadores LoRA y cinco cabezas de enrutamiento (tool, kb, context, role, relay). El repositorio no contiene los pesos completos del modelo base, sino únicamente las cabezas, los adaptadores y la configuración (unos 172 MB en total), por lo que es necesario descargar aparte el modelo base desde Hugging Face.

Su relevancia es acotada y experimental: se publica como el checkpoint exacto empleado en una evaluación controlada descrita en un manuscrito, con entrenamiento a escala piloto (818 filas de entrenamiento y 42 de validación), sin conjunto de test reservado y sin resultados de benchmarks declarados por el autor. La licencia es Apache-2.0 para cabezas, adaptadores y configuración, mientras que el modelo base se rige por la licencia de Qwen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-4B-Base congelado) con adaptadores LoRA y cinco cabezas de enrutamiento |
| Parámetros totales | No disponible (torre base de 4B más adaptadores LoRA de ~130 MB y cabezas de ~42 MB) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 (cabezas, adaptadores y configuración); el modelo base se rige por la licencia de Qwen |
| Formato de pesos | safetensors (adaptadores) y PyTorch (heads.pt) |

## Arquitectura y entrenamiento

El modelo parte de una torre de texto transformer congelada (Qwen/Qwen3.5-4B-Base) sobre la que se aplican adaptadores LoRA con rango 16, alpha 32 y dropout 0,05. Sobre esa representación se montan cinco cabezas de decisión que formulan preguntas de opción múltiple tipadas: qué capacidad cargar a continuación (`tool`, con opción `NO_TOOL`), qué entradas de conocimiento son relevantes (`kb`), si mantener, resumir o descartar cada grupo de contexto de zona fría (`context`), qué rol debe responder a un mensaje (`role`) y si un relay entre roles puede proceder (`relay`). El código del runtime implementa además dos cabezas de auditoría (`premise_judge`, `overclaim_flag`) que no forman parte de este checkpoint y que, con estos pesos, caen en sus rutas deterministas.

El entrenamiento es un pilotaje multitarea con datos sintetizados por un profesor: 818 filas de entrenamiento y 42 de validación, construidas a partir de 196 ejemplares del profesor en 10 particiones (semilla 418), con aumento de datos aplicado después del particionado. Se realizó una sola época con la torre de texto congelada, pérdidas ponderadas por clase y selección del checkpoint según la mejor puntuación de validación; no existe conjunto de test reservado. Los manifiestos exactos y los hashes de las particiones se registran en el paquete de revisión del artículo.

## Capacidades

- Clasificación de decisión acotada: responde preguntas de opción múltiple tipadas sobre el estado de un flujo bioinformático en un único forward pass.
- Enrutamiento de herramientas: selecciona la siguiente capacidad a cargar o emite `NO_TOOL`.
- Selección de conocimiento: puntúa qué entradas de la base de conocimiento son relevantes para el contexto actual.
- Gestión de contexto: decide si mantener, resumir o descartar cada grupo de contexto de zona fría.
- Asignación de rol: determina qué rol del agente debe responder a un mensaje entrante.
- Control de relay: autoriza o deniega el paso de mensajes entre roles.
- Salida acotada: devuelve etiquetas o puntuaciones dentro de un espacio de etiquetas congelado.
- No dispone de tool calling generativo, agentes multi-paso autónomos, visión, audio ni modo de razonamiento extendido; su función es exclusivamente la toma de decisiones dentro de un runtime concreto.

## Casos de uso

- Enrutamiento de herramientas en un agente bioinformático: el modelo decide, en un solo paso, qué capacidad del catálogo debe cargarse a continuación o si no se requiere ninguna, lo que reduce la latencia frente a una llamada generativa completa.
- Selección de entradas de conocimiento relevantes: en pipelines con bases de conocimiento extensas, la cabeza `kb` puntúa qué entradas merecen incorporarse al contexto, evitando recuperaciones innecesarias.
- Compactación de contexto en conversaciones largas: la cabeza `context` clasifica grupos de contexto de zona fría en mantener, resumir o descartar, lo que permite gestionar ventanas de contexto sin un modelo generativo adicional.
- Orquestación multi-rol: la cabeza `role` asigna cada mensaje al rol adecuado del agente (por ejemplo, planificador, ejecutor o auditor) en sistemas con varios roles especializados.
- Control de comunicación entre agentes: la cabeza `relay` actúa como guardia que autoriza o bloquea el paso de mensajes entre roles, útil en arquitecturas con restricciones de flujo de información.
- Evaluación reproducible de decisiones: al publicarse el checkpoint exacto con huella de directorio verificable mediante `GET /v1/health`, sirve para reproducir la evaluación controlada del manuscrito asociado y para comparar variantes del runtime Biod.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el modelo no reclama ninguna puntuación de benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del modelo base Qwen3.5-4B-Base y de la cuantización elegida para él.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el checkpoint en sí ocupa unos 172 MB, pero requiere cargar la torre base de 4B.
- Opciones de despliegue: servidor propio del proyecto mediante `python -m biod.multitask.serve --ckpt /path/to/biod-mt-v2-4b --host 127.0.0.1 --port 8790`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Nota operativa: el código de servicio fija `HF_HUB_OFFLINE=1` por defecto, por lo que el modelo base debe descargarse antes de arrancar el servicio. La descarga debe limitarse a los cinco ficheros indicados mediante `scripts/download-weights.sh` para no alterar la huella del directorio.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (capas de decisión acotadas integradas en un runtime de agente).

## Limitaciones y advertencias

- Uso previsto exclusivamente de investigación: es un modelo de decisión acotado dentro de un runtime de agente concreto, no un modelo general de bioinformática.
- Espacio de etiquetas congelado: las capacidades o entradas de conocimiento fuera del vocabulario del checkpoint no pueden puntuarse y el runtime recurre a la navegación como alternativa.
- Umbrales de decisión heredados: los umbrales de la configuración del agente provienen de un servicio anterior de siete cabezas y no se recalibraron para este checkpoint; deben reajustarse para un catálogo o distribución de tareas nuevos.
- Datos de entrenamiento sintetizados por profesor y a escala piloto, con auditoría humana limitada.
- Sin conjunto de test reservado y sin verificación independiente de los pesos; el autor no reclama ninguna puntuación de benchmark.
- No validado para uso clínico.
- Riesgo de alucinación y sesgos: no documentados de forma específica en la información disponible.
- Restricciones de licencia: Apache-2.0 para cabezas, adaptadores y configuración, pero el modelo base se rige por la licencia de Qwen, que los usuarios deben cumplir.
- Integridad del checkpoint: descargar el repositorio completo con un cliente genérico puede añadir ficheros y modificar la huella del directorio (`9ff57b3e6c09aa5f49bb08dedcc87286fea5f2039798ec83830b4ca217b3fca6`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wer1477/biod-mt-v2-4b
- Repositorio del agente Bioflow Agent: https://github.com/wer1477/bioflow-agent
- Repositorio del runtime Biod: https://github.com/wer1477/bioflow-biod
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
