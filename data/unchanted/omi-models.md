# Unchanted/omi-models

## Resumen

Omi models es un conjunto de artefactos de inferencia publicados por Unchanted para la aplicación Android Omi. No se trata de un modelo generativo al uso, sino de un extractor de respuestas (extractive QA) derivado de deepset/tinyroberta-squad2, un RoBERTa tiny de 82 millones de parámetros. El modelo recibe hasta cinco filas cortas de mensajes ya visibles en pantalla y marca los tokens de una de esas filas que responden a una pregunta; si ninguna fila contiene la respuesta, no marca nada. Nunca genera texto propio.

La relevancia técnica está en su orientación a dispositivo: el encoder se exporta a GGUF en cuantización q8_0 y se ejecuta con llama.cpp en modo embeddings con pooling desactivado, mientras que las cabezas de inicio y fin del span se distribuyen por separado en `span_heads.json` y `span_heads.bin`. La aplicación verifica tamaño y sha256 de cada fichero antes de usarlo. El repositorio ocupa 0,1 GB y está pensado para descarga y ejecución local en Android.

El ajuste se hizo con una sola pasada sobre 18.000 filas de datos abiertos de chat y preguntas (SQuAD 2.0, Molweni y QAConv), sin datos privados. El autor lo describe como una primera versión en modo sombra mientras se prueba. La licencia es CC BY-SA 4.0, heredada del modelo base y de SQuAD 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa (tinyroberta-squad2) con cabezas de span start/end para QA extractiva |
| Parametros totales | 81.526.272 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q8_0 (encoder en GGUF); cabezas de span en formato propio (`span_heads.bin`) |
| Idiomas soportados | en |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | GGUF (encoder) + JSON/BIN (cabezas de span) |

## Arquitectura y entrenamiento

El modelo parte de deepset/tinyroberta-squad2, un encoder RoBERTa de 82M de parámetros ya ajustado para SQuAD 2.0, y le añade una cabeza de QA extractiva con predicción de inicio y fin de span. Para el despliegue en dispositivo, el encoder se exporta a GGUF en q8_0 y se ejecuta con llama.cpp usando `--embeddings --pooling none`, de modo que se obtienen embeddings por token sin agregación. Las cabezas de inicio y fin se mantienen fuera del grafo GGUF y se distribuyen aparte: `span_heads.json` describe la estructura y `span_heads.bin` contiene los pesos.

El ajuste consistió en una única pasada sobre 18.000 filas de datos abiertos de chat y preguntas: SQuAD 2.0 (CC BY-SA 4.0), Molweni (Apache 2.0) y QAConv (CC0). No se emplearon datos privados ni personales. La tarea está restringida a seleccionar un span dentro de una de hasta cinco filas de mensaje ya presentes en pantalla, devolviendo una marca vacía cuando ninguna fila contiene la respuesta. No hay evidencia de RLHF, DPO ni decodificación especulativa; el modelo no genera tokens.

## Capacidades

- QA extractiva sobre filas cortas de mensaje: identifica y marca el span de una de hasta cinco filas visibles que responde a una pregunta.
- Abstención explícita: si ninguna fila contiene la respuesta, no marca nada (comportamiento tipo SQuAD 2.0 sin respuesta).
- Sin generación de texto: no escribe palabras propias, solo selecciona tokens existentes.
- Ejecución on-device: encoder cuantizado q8_0 ejecutable con llama.cpp en Android.
- Verificación de integridad: la app comprueba tamaño y sha256 de los ficheros antes de cargarlos.
- Extracción de características: el repositorio incluye la etiqueta `feature-extraction` y el encoder se ejecuta en modo embeddings.
- Idioma: únicamente inglés.
- Sin soporte documentado de tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Respuesta a preguntas sobre el historial de chat en la app Omi: el modelo recibe las cinco filas visibles y marca el fragmento que responde a la pregunta del usuario, sin salir del dispositivo.
- Asistente de accesibilidad en Android: resaltar en pantalla la parte del mensaje que responde a una consulta, útil para usuarios con dificultades de lectura.
- Extracción de datos estructurados de conversaciones: localizar importes, fechas o nombres en filas de mensajes para rellenar formularios locales.
- Moderación y verificación local: comprobar si una respuesta concreta aparece literalmente en los mensajes visibles antes de mostrarla, reduciendo alucinaciones en capas superiores.
- Procesamiento con privacidad: al ejecutarse en el dispositivo con llama.cpp, evita enviar el contenido del chat a servidores externos.
- Filtrado previo en pipelines de agentes: actuar como verificador extractivo que confirma si una afirmación está respaldada por el contexto en pantalla antes de que un LLM mayor la use.
- Integración en apps de mensajería de terceros: dado su tamaño (0,1 GB en repo, encoder de 82M), puede empaquetarse en aplicaciones móviles con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el encoder q8_0 de 82M parámetros ocupa del orden de decenas de MB en memoria; el repositorio completo son 0,1 GB.
- GPU recomendadas: no requiere GPU dedicada; está diseñado para CPU en Android mediante llama.cpp.
- Cabe en cualquier dispositivo consumer: móviles Android, Raspberry Pi y portátiles sin GPU.
- Opciones de despliegue: llama.cpp con `--embeddings --pooling none` para el encoder GGUF, más carga de `span_heads.json` y `span_heads.bin` en la aplicación. No hay indicios de soporte para vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| Unchanted/omi-models | 81,5 M | no disponible | QA extractiva sobre filas de chat | CC BY-SA 4.0 | GGUF q8_0 + cabezas propias |
| deepset/tinyroberta-squad2 | 82 M | 512 tokens (estándar RoBERTa, no confirmado en la info) | QA extractiva SQuAD 2.0 | CC BY 4.0 | safetensors/PyTorch |
| deepset/roberta-base-squad2 | 125 M | 512 tokens (estándar RoBERTa, no confirmado) | QA extractiva SQuAD 2.0 | CC BY 4.0 | safetensors/PyTorch |
| distilbert-base-cased-distilled-squad | 66 M | 512 tokens (estándar DistilBERT, no confirmado) | QA extractiva SQuAD | Apache 2.0 | safetensors/PyTorch |

La diferencia principal de omi-models frente a sus alternativas es el empaquetado para dispositivo (GGUF q8_0 con cabezas separadas y verificación sha256) y el ajuste específico sobre filas cortas de chat, no el rendimiento bruto.

## Limitaciones y advertencias

- Solo inglés: no soporta castellano ni otros idiomas.
- Restringido a hasta cinco filas cortas de mensaje ya visibles; no procesa documentos largos.
- No genera texto: no sirve para resumen, redacción ni diálogo.
- Estado "primera versión en modo sombra": el propio autor indica que está en pruebas, sin garantías de estabilidad.
- Licencia CC BY-SA 4.0: obliga a atribución y a compartir obras derivadas bajo la misma licencia; revisar compatibilidad para uso comercial propietario.
- Riesgo de span incorrecto en preguntas ambiguas o con negaciones, inherente a la QA extractiva.
- Sin datos públicos de benchmarks, latencia ni evaluación independiente.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.
- Dependencia de llama.cpp con pooling desactivado y de un formato de cabezas propio, lo que complica la portabilidad a otros runtimes.

## Enlaces

- Hugging Face: https://huggingface.co/Unchanted/omi-models
- Modelo base: https://huggingface.co/deepset/tinyroberta-squad2
- SQuAD 2.0 (Rajpurkar et al.): https://rajpurkar.github.io/SQuAD-explorer/
- Molweni: no disponible enlace directo en la información proporcionada
- QAConv: no disponible enlace directo en la información proporcionada
- llama.cpp: https://github.com/ggml-org/llama.cpp
