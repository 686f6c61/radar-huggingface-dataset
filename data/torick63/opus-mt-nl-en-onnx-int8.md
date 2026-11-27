# Torick63/opus-mt-nl-en-onnx-int8

## Resumen

`Torick63/opus-mt-nl-en-onnx-int8` es una conversión a ONNX con cuantización dinámica int8 del modelo de traducción automática `Helsinki-NLP/opus-mt-nl-en`, desarrollado originalmente por el grupo de investigación en tecnología del lenguaje de la Universidad de Helsinki dentro del proyecto OPUS-MT (Tiedemann y Thottingal, 2020). El modelo traduce de neerlandés a inglés y está pensado para inferencia en dispositivo (on-device) o en entornos con recursos limitados, donde el tamaño y la latencia importan más que la fidelidad absoluta de la traducción.

La conversión la firma el usuario Torick63 y se apoya en Optimum con la tarea `text2text-generation-with-past`, generando un encoder y un decoder fusionado que gestiona tanto el primer paso de decodificación como los pasos con caché KV mediante la entrada `use_cache_branch`. La cuantización es dinámica de pesos int8 con `quantize_dynamic` de ONNX Runtime, aplicando `EnableSubgraph` para cuantizar también las capas internas de las ramas del decoder fusionado. El resultado ocupa aproximadamente 152 MB frente a los ~300 MB del repositorio completo.

Su relevancia actual es práctica: permite integrar traducción nl→en en aplicaciones de escritorio, móviles o edge sin depender de servicios en la nube, con un coste de memoria muy bajo y una licencia Apache-2.0 que facilita el uso comercial. No es un modelo de propósito general ni compite en calidad con sistemas neuronales de mayor tamaño; es una pieza de infraestructura ligera para un par de idiomas concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian NMT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinámica (ONNX Runtime `quantize_dynamic`) |
| Idiomas soportados | neerlandés (nl) → inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`encoder_model.onnx`, `decoder_model_merged.onnx`), SentencePiece (`source.spm`, `target.spm`), `vocab.json` |

## Arquitectura y entrenamiento

El modelo base es un Marian NMT, la arquitectura de traducción neuronal de código abierto desarrollada por Microsoft Research y adoptada por el proyecto OPUS-MT de la Universidad de Helsinki. Se trata de un transformer encoder-decoder estándar con atención multi-cabeza, pensado específicamente para traducción automática y entrenado sobre corpus paralelos del proyecto OPUS. La model card de esta conversión no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO; esa información correspondería al modelo original `Helsinki-NLP/opus-mt-nl-en`.

La innovación de esta ficha no está en el entrenamiento sino en el empaquetado para inferencia. La exportación con Optimum usa `--task text2text-generation-with-past` y produce un decoder fusionado que unifica el primer paso (sin caché) y los pasos posteriores (con caché KV) en un único grafo, seleccionando la rama mediante la entrada booleana `use_cache_branch`. Esto evita duplicar los pesos del decoder, que en una exportación ingenua se almacenarían dos veces. Sobre ese grafo se aplica cuantización dinámica int8 de pesos con `EnableSubgraph`, de modo que las capas dentro de las ramas del decoder fusionado también se cuantizan. El autor reporta que, con decodificación greedy, los ficheros int8 producen la misma salida que el modelo PyTorch original en 27 de 30 frases cortas de prueba; el resto difieren principalmente en la formulación, atribuible a la cuantización.

## Capacidades

- Traducción de texto de neerlandés a inglés, unidireccional.
- Generación de texto secuencial con decodificación greedy (configuración por defecto en `generation_config.json`).
- Tokenización mediante SentencePiece con vocabulario compartido (`vocab.json`).
- Inferencia con caché KV para acelerar la decodificación autoregresiva.
- Ejecución en ONNX Runtime, lo que permite despliegue en CPU, GPU y entornos edge.
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- No tiene modo thinking, visión ni audio.
- Cobertura multilingüe limitada estrictamente al par nl→en.

## Casos de uso

- Traducción integrada en aplicaciones de escritorio: el modelo ocupa ~152 MB y puede empaquetarse dentro de una app Electron o similar para traducir contenido neerlandés sin conexión, usando ONNX Runtime como backend.
- Traducción en dispositivos móviles o edge: con cuantización int8 y un grafo optimizado, cabe en memoria de dispositivos con recursos limitados y permite traducción local en tiempo real de mensajes o interfaces.
- Preprocesado de corpus neerlandeses: útil en pipelines de NLP donde se necesita una primera traducción al inglés antes de aplicar modelos de análisis entrenados solo en inglés (por ejemplo, clasificación o extracción de entidades).
- Atención al cliente en comercio electrónico: traducción automática de consultas de usuarios neerlandeses a inglés para que un agente o un sistema posterior las procese, con latencia baja y sin coste por token.
- Subtitulado y localización de contenido: traducción de subtítulos o descripciones cortas del neerlandés al inglés en herramientas de edición, donde la velocidad prima sobre la matización estilística.
- Prototipado y evaluación de pipelines de traducción: al ser un modelo pequeño y con licencia permisiva, sirve como baseline reproducible para comparar con sistemas de mayor tamaño o para pruebas de integración en CI.
- Traducción por lotes en servidores modestos: el bajo consumo de memoria permite ejecutar varias instancias en paralelo en una sola máquina sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta una comparación cualitativa: con decodificación greedy, la salida int8 coincide con la del modelo PyTorch original en 27 de 30 frases cortas de prueba, con diferencias menores de formulación en las tres restantes.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para el grafo completo; con int8, el modelo pesa ~152 MB, por lo que la huella de memoria es muy reducida.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU con soporte de ONNX Runtime (por ejemplo, RTX 3060 en adelante) acelera la inferencia, pero no es necesaria.
- Cabe en cualquier GPU consumer e incluso en dispositivos sin GPU dedicada.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#, JavaScript, etc.), con soporte de CPU y GPU. No se distribuye en formato GGUF, por lo que no es directamente compatible con llama.cpp u Ollama sin conversión adicional.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del hardware y del backend de ejecución.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Torick63/opus-mt-nl-en-onnx-int8 | no disponible | no disponible | nl→en | Apache-2.0 | ONNX int8 |
| Helsinki-NLP/opus-mt-nl-en (base) | no disponible | no disponible | nl→en | Apache-2.0 | PyTorch (safetensors/bin) |
| Helsinki-NLP/opus-mt-en-nl | no disponible | no disponible | en→nl | Apache-2.0 | PyTorch |
| Otros modelos OPUS-MT del proyecto | no disponible | no disponible | múltiples pares | Apache-2.0 | PyTorch |

La comparación relevante es contra el modelo base: misma arquitectura y licencia, pero este último está en PyTorch y ocupa aproximadamente el doble. Frente a otros pares de OPUS-MT, la diferencia es la dirección de traducción. No se dispone de datos de benchmarks para establecer comparaciones cuantitativas de calidad.

## Limitaciones y advertencias

- La cuantización int8 introduce pequeñas variaciones en la salida respecto al modelo original; en las pruebas del autor, 3 de 30 frases difirieron en formulación.
- Es un modelo unidireccional nl→en; no traduce en sentido inverso ni entre otros idiomas.
- Calidad de traducción propia de un modelo Marian de tamaño moderado: puede fallar en expresiones idiomáticas, terminología especializada o frases largas y complejas.
- Riesgo de alucinación y de traducciones inventadas en entradas ambiguas o fuera de dominio, como en cualquier modelo neuronal de traducción.
- No se han publicado evaluaciones sistemáticas de sesgos para esta conversión concreta; los sesgos del modelo base pueden persistir.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los corpus OPUS subyacentes si se redistribuye.
- El formato ONNX limita las opciones de despliegue frente a GGUF; para usar con llama.cpp u Ollama haría falta una conversión adicional no incluida.
- No dispone de soporte para tool calling, agentes ni razonamiento multi-paso; no debe emplearse en esos escenarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Torick63/opus-mt-nl-en-onnx-int8
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-nl-en
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- Paper de OPUS-MT (Tiedemann y Thottingal, 2020): https://aclanthology.org/2020.eamt-1.10/
- Documentación de Optimum: https://huggingface.co/docs/optimum
- ONNX Runtime: https://onnxruntime.ai/
- Repositorio de Marian NMT: https://github.com/marian-nmt/marian
