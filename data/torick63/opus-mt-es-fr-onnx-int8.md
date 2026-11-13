# Torick63/opus-mt-es-fr-onnx-int8

## Resumen

`Torick63/opus-mt-es-fr-onnx-int8` es una exportación a ONNX con cuantización int8 dinámica del modelo de traducción automática `Helsinki-NLP/opus-mt-es-fr`, desarrollado originalmente por el grupo de investigación en tecnología del lenguaje de la Universidad de Helsinki dentro del proyecto OPUS-MT. El modelo traduce texto del español al francés y está pensado para inferencia en dispositivo (on-device) o en entornos con recursos limitados, gracias a un peso total de aproximadamente 166 MB.

La arquitectura subyacente es Marian NMT, un transformer encoder-decoder entrenado específicamente para traducción. La conversión se ha realizado con Optimum usando la tarea `text2text-generation-with-past`, lo que produce un encoder y un decoder fusionado que gestiona tanto el primer paso de decodificación como los pasos con caché KV mediante la entrada `use_cache_branch`, almacenando los pesos del decoder una sola vez.

Su relevancia actual reside en la combinación de licencia permisiva (Apache-2.0), tamaño reducido y compatibilidad con ONNX Runtime, lo que facilita el despliegue en navegador, aplicaciones móviles o servicios edge sin dependencia de GPUs dedicadas. No obstante, se trata de una conversión de un modelo base de 2020, no de un modelo de gran escala con capacidades generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian NMT) |
| Parametros totales | no disponible (peso del repositorio: ~166 MB en int8) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinámica por canal (ONNX Runtime `quantize_dynamic`, `per_channel=True`) |
| Idiomas soportados | es (español), fr (francés) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`encoder_model.onnx`, `decoder_model_merged.onnx`), SentencePiece (`source.spm`, `target.spm`), `vocab.json` |

## Arquitectura y entrenamiento

El modelo original `Helsinki-NLP/opus-mt-es-fr` es un sistema de traducción neuronal basado en la arquitectura Marian, un transformer encoder-decoder con atención multi-cabeza estándar. Fue entrenado por el grupo de la Universidad de Helsinki sobre corpus paralelos del ecosistema OPUS, siguiendo la metodología descrita en Tiedemann y Thottingal (2020). No se dispone en la información proporcionada de detalles sobre el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

La conversión a ONNX se realizó con Optimum bajo la tarea `text2text-generation-with-past`, generando un encoder independiente y un decoder fusionado que incorpora la rama de primer paso y la rama con caché KV, controladas por la entrada `use_cache_branch`. Posteriormente se aplicó cuantización dinámica int8 por canal con `quantize_dynamic` de ONNX Runtime, activando `EnableSubgraph` para cuantizar también las capas internas de las ramas del decoder fusionado. Según el autor, con decodificación greedy los ficheros int8 producen la misma salida que el modelo PyTorch original en las 30 frases cortas de prueba.

## Capacidades

- Traducción de texto del español al francés, tarea única para la que fue entrenado el modelo.
- Generación de texto secuencial con decodificación greedy (configuración por defecto descrita en la model card).
- Inferencia con caché KV mediante el decoder fusionado, lo que reduce el coste computacional en generaciones multi-token.
- Ejecución en ONNX Runtime, incluyendo potencialmente entornos de navegador (ONNX Runtime Web) y dispositivos edge.
- Tokenización mediante SentencePiece con modelos separados para origen y destino.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada estrictamente al par es-fr.

## Casos de uso

- Traducción en navegador sin backend: el tamaño de ~166 MB y el formato ONNX permiten cargar el modelo con ONNX Runtime Web y traducir texto localmente, evitando enviar contenido del usuario a servidores externos.
- Aplicaciones móviles offline: integración en apps iOS/Android mediante ONNX Runtime Mobile para traducción de textos cortos en contextos sin conectividad, como viajes o zonas rurales.
- Preprocesado en pipelines de datos: traducción por lotes de corpus españoles a francés en entornos CPU, aprovechando la cuantización int8 para reducir requisitos de memoria frente al modelo PyTorch original.
- Subtitulado y localización de contenido breve: traducción de frases y subtítulos en herramientas de edición o plataformas de vídeo donde la latencia y el coste por inferencia son críticos.
- Servicios edge en dispositivos de bajo consumo: despliegue en Raspberry Pi u otros SBC con ONNX Runtime para traducción de formularios, menús o avisos en comercios bilingües.
- Prototipado rápido de sistemas de traducción: uso como baseline ligero en investigación o docencia para comparar calidad frente a modelos mayores sin necesidad de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente indica que, con decodificación greedy, los ficheros int8 producen la misma salida que el modelo PyTorch original en 30 frases cortas de prueba, sin aportar métricas BLEU, METEOR ni comparaciones cuantitativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~166 MB de pesos en int8, el modelo cabe holgadamente en cualquier GPU con al menos 1 GB de memoria libre.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100, H100 ni RTX 4090. Una GTX 1650 o superior ya ofrece margen sobrado.
- Compatibilidad con GPU de consumo: sí, en cualquier GPU de consumo actual e incluso en iGPU.
- Despliegue en CPU: viable y probablemente el escenario principal, dado el formato ONNX y la cuantización int8.
- Opciones de despliegue: ONNX Runtime (Python, C++, Web, Mobile), Optimum, y potencialmente servidores compatibles con ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no están orientados a modelos Marian ONNX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Torick63/opus-mt-es-fr-onnx-int8 | no disponible (~166 MB int8) | no disponible | es-fr | Apache-2.0 | ONNX int8 |
| Helsinki-NLP/opus-mt-es-fr (original) | no disponible | no disponible | es-fr | Apache-2.0 | PyTorch (safetensors/bin) |
| Helsinki-NLP/opus-mt-en-es | no disponible | no disponible | en-es | Apache-2.0 | PyTorch |
| Modelos NLLB de Meta (p. ej. nllb-200-distilled-600M) | 600 M | no disponible | 200 idiomas | CC-BY-NC-4.0 | PyTorch |

La comparación directa con modelos de traducción multilingüe de mayor tamaño (NLLB, M2M-100) no está disponible en términos de benchmarks en la información proporcionada. La ventaja diferencial de esta conversión es el tamaño reducido y el formato ONNX int8, no la calidad de traducción ni la cobertura lingüística.

## Limitaciones y advertencias

- Modelo especializado en un único par de idiomas (es-fr); no traduce otras combinaciones ni realiza tareas generales.
- Riesgo de alucinación y de traducciones incorrectas en frases largas, dominios especializados o lenguaje coloquial, habitual en modelos Marian de tamaño base.
- No se documentan sesgos específicos, pero al entrenarse sobre corpus OPUS puede heredar sesgos de género, registro y dominio presentes en dichos datos.
- Longitud de contexto no documentada; los modelos Marian suelen limitarse a segmentos de unas pocas decenas de tokens, por lo que textos largos deben dividirse en frases.
- La cuantización int8 puede degradar ligeramente la calidad frente al modelo original en frases no cubiertas por las 30 de prueba; no se aportan métricas que lo cuantifiquen.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones de los corpus OPUS subyacentes si se redistribuye el modelo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación comunitaria.
- El modelo base es de 2020 y no incorpora innovaciones recientes (decodificación especulativa, atención lineal, etc.).

## Enlaces

- Hugging Face: https://huggingface.co/Torick63/opus-mt-es-fr-onnx-int8
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-es-fr
- Paper de OPUS-MT (Tiedemann y Thottingal, 2020): https://aclanthology.org/2020.wmt-1.56/
- Optimum (exportación ONNX): https://huggingface.co/docs/optimum
- ONNX Runtime: https://onnxruntime.ai/
