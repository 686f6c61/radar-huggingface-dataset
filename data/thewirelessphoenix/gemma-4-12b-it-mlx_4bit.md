# TheWirelessPhoenix/gemma-4-12b-it-mlx_4bit

## Resumen

TheWirelessPhoenix/gemma-4-12b-it-mlx_4bit es una conversión a formato MLX del modelo Google Gemma 4 12B IT, cuantizado a 4 bits. El modelo original, desarrollado por Google, es un modelo multimodal de tamaño medio sin codificador (encoder-free) capaz de procesar texto, audio y vídeo de forma nativa, diseñado para ejecutarse en hardware local con 16 GB de VRAM. Esta conversión específica, realizada por TheWirelessPhoenix con mlx-lm 0.32.0, permite ejecutar el modelo en dispositivos Apple Silicon mediante el ecosistema MLX.

La relevancia de esta conversión radica en que facilita el despliegue local del modelo en hardware de Apple, aprovechando la optimización de MLX para Metal. El repositorio ocupa 6,7 GB y contiene los pesos en formato safetensors cuantizados a 4 bits, con un total de 1.861.173.040 parámetros. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal sin codificador (encoder-free), basado en Google Gemma 4 12B IT |
| Parametros totales | 1.861.173.040 (cuantizados a 4 bits) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base, Google Gemma 4 12B IT, es un modelo multimodal de tamaño medio que prescinde de codificador visual (encoder-free), lo que significa que procesa directamente las entradas multimodales sin una etapa de proyección separada. Esta arquitectura permite la ingesta nativa de audio y vídeo, además de texto. El modelo fue entrenado por Google con un enfoque en la eficiencia computacional, permitiendo su ejecución en hardware de consumo con 16 GB de VRAM.

La conversión a MLX fue realizada con la versión 0.32.0 de mlx-lm, que transforma los pesos originales de PyTorch al formato optimizado para Apple Silicon. La cuantización a 4 bits reduce significativamente el tamaño del modelo (de aproximadamente 24 GB a 6,7 GB), lo que permite su ejecución en dispositivos con memoria unificada limitada. No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens procesados o si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generación de texto conversacional con soporte de chat template integrado.
- Procesamiento multimodal nativo: el modelo base puede ingerir audio y vídeo, aunque esta capacidad puede verse afectada por la cuantización.
- Razonamiento y comprensión de instrucciones complejas, heredadas del modelo base de Google.
- Ejecución local eficiente en dispositivos Apple Silicon gracias a la optimización MLX.
- Integración sencilla con el ecosistema mlx-lm para carga y generación de texto.

## Casos de uso

- Desarrollo local de prototipos: los desarrolladores pueden ejecutar el modelo en un MacBook con Apple Silicon para probar aplicaciones de IA generativa sin depender de APIs externas, gracias a su tamaño reducido y la integración con MLX.
- Asistente de codigo offline: el modelo puede integrarse en entornos de desarrollo integrados (IDE) para proporcionar autocompletado y sugerencias de código sin conexión, aprovechando su capacidad de generación de texto.
- Procesamiento de documentos multimodales: aunque la cuantización puede degradar la calidad, el modelo base puede extraer información de documentos que contienen audio o vídeo, útil para archivado y búsqueda local.
- Chatbots de atencion al cliente en entornos con privacidad estricta: empresas que no pueden enviar datos a la nube pueden desplegar este modelo localmente en hardware Apple para gestionar conversaciones con clientes.
- Investigacion academica: investigadores pueden estudiar el comportamiento de modelos multimodales cuantizados en tareas de generación de texto, comparando la degradación de rendimiento frente al modelo original.
- Educacion y formacion: el modelo puede utilizarse en cursos de IA para demostrar el despliegue local de modelos de lenguaje, dado su tamaño manejable y la facilidad de uso con mlx-lm.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es una conversión cuantizada de Google Gemma 4 12B IT, cuyos benchmarks oficiales se encuentran en la documentación de Google, pero no se dispone de datos específicos para esta versión MLX de 4 bits.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 6,7 GB, por lo que se recomienda al menos 8 GB de memoria unificada en Apple Silicon para una ejecución fluida.
- GPU recomendadas: cualquier dispositivo Apple Silicon con al menos 8 GB de memoria unificada (M1, M2, M3 o superiores). El modelo base requiere 16 GB de VRAM, pero la cuantización a 4 bits reduce este requisito.
- Compatibilidad con GPU de consumo: no aplica directamente, ya que MLX está diseñado exclusivamente para Apple Silicon. Para GPUs NVIDIA o AMD, sería necesario convertir los pesos a otro formato (GGUF, etc.).
- Opciones de despliegue: mlx-lm (biblioteca principal), integración con Hugging Face, y posible uso con servidores de inferencia compatibles con MLX.
- Latencia y throughput: no disponible, pero se espera que sea adecuado para inferencia interactiva en hardware Apple Silicon moderno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| TheWirelessPhoenix/gemma-4-12b-it-mlx_4bit | 1,86 B (cuantizado) | no disponible | Apache-2.0 | MLX 4-bit | Conversión local para Apple Silicon |
| google/gemma-4-12B-it | 12 B (original) | no disponible | Apache-2.0 | PyTorch | Modelo base multimodal |
| TheWirelessPhoenix/gemma-4-12b-it-oQ2e | no disponible | no disponible | Apache-2.0 | no disponible | Otra conversión del mismo autor |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de información sobre modelos comparables de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 4 bits puede degradar la calidad de generación, especialmente en tareas complejas de razonamiento o generación de código.
- Las capacidades multimodales (audio y vídeo) del modelo base pueden verse significativamente afectadas por la cuantización, aunque no se dispone de datos concretos.
- No se dispone de información sobre la longitud de contexto soportada, lo que limita su uso en aplicaciones que requieran ventanas de contexto largas.
- El modelo está optimizado exclusivamente para Apple Silicon; no es compatible directamente con GPUs NVIDIA o AMD sin conversión adicional.
- Aunque la licencia Apache-2.0 permite uso comercial, se recomienda revisar la licencia específica de Gemma 4 en el enlace proporcionado para confirmar que no hay restricciones adicionales.
- No se han publicado benchmarks específicos para esta conversión, por lo que el rendimiento real en tareas concretas es incierto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheWirelessPhoenix/gemma-4-12b-it-mlx_4bit
- Modelo base: https://huggingface.co/google/gemma-4-12B
- Otra conversión del autor: https://huggingface.co/TheWirelessPhoenix/gemma-4-12b-it-oQ2e
- Blog de Google sobre Gemma 4 12B: https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
- Página de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Guía para desarrolladores de Gemma 4 12B: https://developers.googleblog.com/gemma-4-12b-the-developer-guide/
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
