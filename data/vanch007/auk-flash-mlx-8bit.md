# vanch007/AuK-Flash-MLX-8bit

## Resumen

AuK-Flash-MLX-8bit es un port a MLX, cuantizado a 8 bits, de AuK-Flash, el modelo fundacional de voz de 1,5B parámetros de Tencent Hunyuan orientado a generación ultrarrápida y edición zero-shot de voz y letras. Lo publica el usuario vanch007 y está diseñado en exclusiva para Apple Silicon, donde MLX nativo evita la sobrecarga de rendimiento que introduce la ruta PyTorch MPS en los chips de la serie M.

El modelo cubre dos tareas: síntesis de voz (text-to-speech) y edición de audio hablado o cantado sin reentrenamiento. Con una cuantización afín por grupos de 8 bits, el backbone pasa de 5,70 GB a 0,56 GB, una reducción del 90,1%, manteniendo una latencia de 1,022 s para 10 s de audio (RTF 0,1022, es decir, unas 9,8 veces tiempo real), prácticamente idéntica a la versión MLX FP32 sin cuantizar (0,992 s).

Su relevancia actual es doble: demuestra que un modelo de voz de 1,5B puede ejecutarse en un Mac con memoria unificada modesta sin sacrificar velocidad, y cubre una capacidad poco frecuente en modelos abiertos como es la edición de voz y letras zero-shot. El repositorio ocupa 1,2 GB en total y no registra descargas ni likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (Flux2Edit DiT) para generación/edición, con VAE de flujo BigVGAN |
| Parámetros totales | 1,5B (modelo base AuK-Flash de Tencent Hunyuan) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 8 bits afín por grupos (group-wise affine) en MLX |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | MIT (según el repositorio de este port) |
| Formato de pesos | MLX; el repositorio no especifica el contenedor exacto (safetensors u otro) |

Datos adicionales del repositorio: tamaño total 1,2 GB, peso del backbone cuantizado 0,56 GB, fichero del DiT Flux2Edit 569 MB, fichero del VAE de flujo BigVGAN 608 MB, más un fichero de configuración con hiperparámetros de arquitectura y cuantización. Librería declarada: mlx.

## Arquitectura y entrenamiento

El pipeline combina un transformer de difusión (Flux2Edit DiT) que genera o edita la representación latente del audio y un VAE de flujo BigVGAN que la convierte en forma de onda. La inferencia se realiza con un muestreo de 4 pasos del DiT, tal y como refleja la métrica "4-Step DiT Latency" de la model card. La cuantización aplicada es afín por grupos de 8 bits sobre los pesos del transformer, con hiperparámetros declarados en el fichero de configuración del repositorio.

No hay información disponible sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni otras innovaciones de entrenamiento del modelo original AuK-Flash. El repositorio tampoco documenta el proceso de conversión de pesos más allá de indicar la cuantización de 8 bits y la reducción de tamaño asociada.

## Capacidades

- Generación de voz a partir de texto (text-to-speech) en chino e inglés.
- Edición zero-shot de voz: modificación de audio hablado sin reentrenamiento específico por voz.
- Edición zero-shot de letras cantadas, según la descripción del autor.
- Muestreo rápido: 4 pasos de difusión para 10 s de audio en 1,022 s de cómputo en Apple Silicon.
- Ejecución local en Apple Silicon mediante MLX, con backend nativo (no MPS).
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte explícito para agentes o razonamiento multi-paso.
- No se documentan capacidades de visión, audio de entrada como comprensión semántica, ni modo "thinking".

## Casos de uso

- Síntesis de voz para prototipos en local: generar audiolibros o demos de voz en un Mac sin GPU dedicada, gracias a un backbone de 0,56 GB que cabe holgadamente en memoria unificada.
- Edición de locuciones ya grabadas: corregir una palabra o una frase de una toma de voz existente sin regrabar al locutor, usando la capacidad de edición zero-shot.
- Producción musical y letras: ajustar o sustituir fragmentos de letras cantadas en maquetas, aprovechando la edición de letras documentada por el autor.
- Doblaje y localización zh-en: generar o modificar pistas de voz en los dos idiomas soportados dentro de un flujo de postproducción.
- Asistentes de voz embebidos en aplicaciones macOS: integrar TTS con latencia de ~10x tiempo real en una app de escritorio mediante MLX.
- Accesibilidad: convertir texto en voz para lectores de pantalla o contenidos educativos en un equipo de sobremesa con Apple Silicon.
- Evaluación comparativa de cuantización: usar este repositorio como referencia para medir el impacto de la cuantización de 8 bits frente a FP32, ya que el autor publica las cifras de latencia y memoria de ambas variantes.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son de latencia y memoria, no de calidad de audio:

| Métrica | PyTorch MPS | MLX FP32 nativo | MLX 8 bits (este modelo) |
|---|---|---|---|
| Latencia DiT a 4 pasos (10 s de audio) | 3,820 s | 0,992 s | 1,022 s |
| Real-Time Factor (RTF) | 0,3820 | 0,0992 | 0,1022 (9,79x tiempo real) |
| Memoria del backbone | 5,70 GB | 5,70 GB | 0,56 GB (ahorro del 90,1%) |

No se han publicado resultados de benchmarks de calidad (MOS, similitud de voz, WER, MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon (chips de la serie M); no hay soporte CUDA ni ROCm documentado.
- Memoria: el backbone cuantizado ocupa 0,56 GB y el VAE 608 MB, por lo que el conjunto suma aproximadamente 1,2 GB de pesos; hay que añadir el espacio de activaciones y buffers de audio.
- GPU recomendadas: cualquier Mac con Apple Silicon; los datos de latencia se obtienen con MLX nativo y no se especifica el chip concreto empleado.
- Cabe sin problema en equipos de consumo: MacBook Air o Mac mini con 16 GB de memoria unificada son suficientes por capacidad de pesos.
- Despliegue: MLX, con las herramientas de línea de comandos y la demo web A/B que el autor mantiene en el repositorio de GitHub; no se documentan rutas de despliegue para vLLM, llama.cpp, Ollama ni TGI.
- Rendimiento: 1,022 s de cómputo para 10 s de audio (RTF 0,1022, ~9,79x tiempo real) según la medición del autor. No se indica throughput para lotes ni latencia por petición en producción.

## Comparativa con modelos similares

La información disponible no incluye comparaciones con modelos de terceros. La única comparativa publicada es interna, entre implementaciones del mismo modelo base:

| Variante | Formato | Peso del backbone | Latencia (10 s de audio) | RTF | Licencia |
|---|---|---|---|---|---|
| AuK-Flash-MLX-8bit (este modelo) | MLX 8 bits | 0,56 GB | 1,022 s | 0,1022 | MIT |
| AuK-Flash-MLX (precisión completa) | MLX FP32/BF16 | 5,70 GB | 0,992 s | 0,0992 | No disponible |
| Implementación PyTorch MPS | PyTorch | 5,70 GB | 3,820 s | 0,3820 | No disponible |

Comparativa con otros modelos de TTS o edición de voz de tamaño similar: no disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo cubre chino e inglés; no hay soporte documentado de castellano ni de otros idiomas.
- La cuantización de 8 bits reduce el tamaño un 90,1% y apenas altera la latencia (de 0,992 s a 1,022 s), pero la model card no publica ninguna métrica de degradación de calidad de audio asociada a la cuantización.
- No se documenta la longitud de contexto ni la duración máxima de audio soportada por edición o generación.
- No se documentan sesgos de voz, cobertura de acentos, ni evaluación de robustez sobre hablantes diversos.
- Riesgo de alucinación específico de la edición de voz: el modelo puede modificar o insertar contenido no solicitado en el audio; no hay métricas publicadas de fidelidad de edición.
- Licencia MIT declarada para este port, pero la licencia del modelo original AuK-Flash de Tencent Hunyuan no se especifica en la información disponible; conviene verificarla antes de un uso comercial.
- Dependencia de código de terceros: el flujo de inferencia completo requiere el repositorio de GitHub del autor, no solo los pesos de HuggingFace.
- Sin validación de la comunidad: 0 descargas y 0 likes en el momento de la consulta, y fecha de creación indicada como 2026-09-12.
- Sin soporte para hardware NVIDIA: no es desplegable en servidores con A100, H100 o RTX sin una conversión previa de pesos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/vanch007/AuK-Flash-MLX-8bit
- Pesos MLX a precisión completa: https://huggingface.co/vanch007/AuK-Flash-MLX
- Código fuente y demo web: https://github.com/vanch007/mlx-AuK
- Proyecto original de Tencent Hunyuan: https://github.com/Tencent-Hunyuan/AuK
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a páginas de Google Maps y Google Earth, sin relación con AuK-Flash.
