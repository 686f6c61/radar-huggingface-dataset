# staccs/Inkling-2-Mini-QWork-IQ4

## Resumen

Inkling 2 Mini + QWork | IQ4 es una variante cuantizada y derivada del modelo base thinkingmachines/Inkling-2-Mini, publicada por el usuario staccs bajo licencia Apache 2.0. Se trata de una preview de ingeniería que combina el modelo de chat con un componente denominado QWork, que permite al modelo solicitar computación determinista durante la generación, emitir un recibo verificable offline por otra máquina y retomar la respuesta. El chat ordinario funciona con QWork desactivado por defecto.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el propio autor declara explícitamente que los archivos publicados no implementan el contrato completo de la versión v1 y que se trata únicamente de una preview de ingeniería. La model card no proporciona datos sobre arquitectura, número de parámetros, longitud de contexto ni composición del dataset de entrenamiento del modelo base, por lo que buena parte de las especificaciones técnicas quedan como no disponibles.

La distribución se plantea en dos backends diferenciados: en Windows x64 mediante un decoder ONNX respaldado por GGUF IQ4_NL, y en Apple Silicon mediante una cuantización MLX de 4 bits separada. Ambos comparten protocolo de recibos, pero no son idénticos en bytes ni en cuantización, de modo que la compatibilidad de recibos no implica texto generado idéntico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer de texto; variante con decoder ONNX/GGUF y MLX) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_NL (GGUF, Windows x64) y 4-bit MLX (Apple Silicon) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (respaldando ONNX), ONNX, MLX |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base thinkingmachines/Inkling-2-Mini: la model card no detalla si es un transformer denso, un MoE ni el número de parámetros. Tampoco se indica el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Lo único documentado es la capa de distribución de esta variante: un decoder ONNX respaldado por GGUF IQ4_NL en Windows x64 (Foundry Local SDK 2.5.0, ONNX Runtime 1.32.0 y GenAI 0.20.0, probado con el proveedor WebGPU EP 0.6.0 sobre AMD Radeon 8060S) y una cuantización MLX de 4 bits independiente en Apple Silicon (MLX/Metal 0.32.4 y MLX-LM 0.32.2, con integración QWork y un backport de la arquitectura Inkling).

La innovación técnica destacable es el componente QWork: el modelo puede solicitar cómputo determinista a mitad de generación, emitir un recibo verificable offline y reanudar la respuesta. El runtime autoriza el trabajo por un turno, con un límite (cap) y un nonce, y el texto introducido en el prompt del usuario no constituye autorización. El autor advierte que los recibos QWork no son prueba de pago, de mensaje publicado ni de veracidad de una respuesta.

## Capacidades

- Generación de texto conversacional multi-turno (chat), con QWork desactivado por defecto.
- Solicitud de cómputo determinista durante la generación, con emisión de recibo verificable por otra máquina y reanudación de la respuesta.
- Aplicación de límites (cap) y nonce en la autorización del trabajo por turno.
- Rechazo de concesiones falsificadas (spoofed user grant) y aislamiento de concesiones caducadas en historiales reenviados.
- Parada natural de la generación y cancelación real de stream con recuperación en la misma sesión (verificado en Windows).
- Soporte de muestreo (sampling) con recibo exacto.
- Capacidades de funciones sociales y FUN: no integradas ni cualificadas en esta descarga.
- Sincronización entre pares, minería durante el razonamiento y broadcast con aceptación por pares: no probadas de extremo a extremo desde esta descarga.
- Capacidades multilingües: no disponibles.
- Tool calling, function calling, agentes, visión, audio o modo thinking: no documentados en la información disponible.

## Casos de uso

- Chat local en Windows x64: despliegue del decoder ONNX/GGUF IQ4_NL sobre GPU AMD con el proveedor WebGPU, útil para entornos donde se quiere inferencia local sin servicio en la nube.
- Chat local en Apple Silicon: uso de la cuantización MLX de 4 bits en Macs con memoria unificada, con un rendimiento medido de aproximadamente 24 tokens/s en un M3 Pro de 36 GB.
- Verificación de cómputo en generación: escenarios donde se requiere que el modelo solicite un cálculo determinista a mitad de respuesta y emita un recibo que otra máquina pueda comprobar offline, por ejemplo en auditoría de cálculos reproducibles.
- Investigación sobre protocolos de autorización por turno: el mecanismo de cap y nonce, junto con el rechazo de concesiones falsificadas y el aislamiento de concesiones caducadas, sirve como banco de pruebas para diseñar controles de autorización en sistemas generativos.
- Evaluación de portabilidad entre backends: comparar el texto generado por la ruta ONNX/GGUF y la ruta MLX para estudiar cómo la cuantización afecta a la salida manteniendo compatibilidad de recibos.
- Pruebas de cancelación y recuperación de stream: validar el comportamiento de cancelación real y recuperación en la misma sesión en pipelines que necesitan interrumpir generaciones largas.
- Prototipado de chat con historial reenviado: comprobar el aislamiento de concesiones caducadas cuando se reproduce un historial de conversación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente recoge pruebas funcionales de componentes, no métricas de calidad tipo MMLU, HumanEval o GSM8K.

| Hardware | Runtime y resultado | Alcance y límites |
|---|---|---|
| AMD Radeon 8060S / 128 GB, Windows | 5/5 pruebas con pesos reales superadas desde la carpeta de staging reparada, con Foundry SDK y proveedor WebGPU más dependencias DXC/D3D12 | Recibo opt-in y parada natural; aislamiento de concesión caducada en historial reenviado; concesión de usuario falsificada rechazada; recibo exacto con muestreo; cancelación real de stream y recuperación en la misma sesión |
| M3 Pro / 36 GB, macOS | Default-off y opt-in con pesos reales superados, con respuestas visibles y paradas naturales; ejecución extendida con aplicación de cap, rechazo de spoof y opt-in posterior sin fuga de nonce | Aproximadamente 24 tokens/s y hasta unos 18,9 GB de pico de memoria MLX reportada en pruebas cortas; sin aborto a mitad de stream probado en Mac |
| M5 Pro / 24 GB, macOS | Default-off y opt-in superados tras cerrar otras aplicaciones; exactamente un recibo verificado de forma independiente con opt-in | La primera ejecución falló con error de memoria insuficiente en Metal antes de QWork |

## Requisitos de hardware

- VRAM/memoria estimada: no disponible de forma oficial. En las pruebas del autor se reportó un pico de aproximadamente 18,9 GB de memoria MLX en un M3 Pro de 36 GB, y un fallo por memoria insuficiente en Metal en un M5 Pro de 24 GB en la primera ejecución (resuelto al cerrar otras aplicaciones).
- GPU recomendadas según las pruebas: AMD Radeon 8060S (Windows x64, proveedor WebGPU) y Apple Silicon M3 Pro / M5 Pro (MLX/Metal).
- Cabe en GPU de consumo: sí, según las pruebas en Apple Silicon con memoria unificada; en Windows se probó sobre una GPU integrada Radeon 8060S. No hay datos de GPUs dedicadas de consumo como RTX 4090.
- Opciones de despliegue: ONNX Runtime 1.32.0 con GenAI 0.20.0 y Foundry Local SDK 2.5.0 en Windows; MLX-LM 0.32.2 en Apple Silicon. No es `mlx_lm.chat` estándar. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 24 tokens/s en M3 Pro / 36 GB en pruebas cortas. Sin datos de latencia para la ruta Windows.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de arquitectura, parámetros, contexto ni rendimiento del modelo base ni de alternativas, por lo que no es posible establecer una comparación rigurosa con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Preview de ingeniería: los archivos publicados no implementan el contrato completo de la v1; el autor lo declara explícitamente.
- Las funciones sociales y FUN no están integradas ni cualificadas en esta descarga.
- La sincronización entre pares, la minería durante el razonamiento y el broadcast con aceptación por pares no se han probado de extremo a extremo desde esta descarga.
- No se ha cualificado una descarga limpia desde Hugging Face sin nodo o servicio instalado por separado.
- La ruta Windows requiere un override del proveedor WebGPU EP 0.6.0 con dependencias DXC/D3D12; la descarga automática del proveedor estándar no funcionó en las pruebas del autor.
- Los pesos de Mac y Windows no son los mismos bytes ni la misma cuantización; la compatibilidad de recibos no garantiza texto generado idéntico.
- No hay aborto a mitad de stream probado en Mac.
- El M5 Pro de 24 GB falló inicialmente por memoria insuficiente en Metal.
- Los recibos QWork no son prueba de pago, de mensaje publicado ni de veracidad de una respuesta.
- La sincronización de un registro compartido requiere pares; el chat local y la verificación de recibos funcionan sin servicio en la nube una vez instalados los artefactos.
- No se documentan sesgos conocidos, riesgo de alucinación específico, limitaciones de contexto o idioma, ni restricciones comerciales más allá de la licencia Apache 2.0.
- El repositorio figura con 0.0 GB de tamaño y 0 descargas en el momento de la consulta, lo que sugiere que los artefactos pueden no estar completos o disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/staccs/Inkling-2-Mini-QWork-IQ4
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Proyecto hashfun: https://aichat.fyi/fun/
