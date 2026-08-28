# Teradata/opus-tatoeba-en-ja

## Resumen

`Teradata/opus-tatoeba-en-ja` es una conversión a formato ONNX del modelo de traducción automática `Helsinki-NLP/opus-tatoeba-en-ja`, realizada por Teradata para su integración con la función BYOM (Bring Your Own Model) en su plataforma de base de datos. El modelo traduce texto del inglés al japonés y está basado en la arquitectura MarianMT, un transformer encoder-decoder. El repositorio contiene dos artefactos ONNX: una versión en precisión completa fp32 (801 MB) y una variante cuantizada a int8 (404 MB), junto con el tokenizador y los ficheros de configuración necesarios para su despliegue.

La relevancia de este modelo reside en que permite ejecutar traducción automática directamente dentro de consultas SQL en Teradata, sin necesidad de infraestructura externa. Sin embargo, su calidad es limitada: el benchmark Tatoeba reporta un BLEU de 15,2 y chr-F de 0,258, lo que lo hace adecuado únicamente para frases cortas y sencillas. No es recomendable para textos con modismos, direcciones de correo electrónico o construcciones con nombres propios complejos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarianMT (encoder-decoder transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens de entrada y 512 de salida |
| Tipos de cuantizacion | fp32 e int8 (ONNX) |
| Idiomas soportados | ingles (en) y japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (el modelo base usa safetensors, pero este repo contiene ONNX) |

## Arquitectura y entrenamiento

El modelo original fue entrenado por Helsinki-NLP con el framework Marian, utilizando una arquitectura transformer-align. Los datos de entrenamiento provienen del corpus OPUS, concretamente de la version `opus+bt-2021-04-10`, que combina datos de traduccion con back-translation. El preprocesamiento emplea normalizacion y SentencePiece con un vocabulario de 32k subwords. No se menciona el uso de RLHF ni DPO. La conversion a ONNX fue realizada por Teradata para su integracion con BYOM, manteniendo la misma arquitectura y los mismos pesos que el checkpoint original. El grafo ONNX usa opset 14 e IR version 8, compatible con BYOM 7.0.0.4 o superior.

## Capacidades

- Traduccion automatica de ingles a japones para frases cortas y sencillas.
- Generacion de texto secuencia a secuencia con decodificacion autoregresiva.
- Parametros de generacion configurables en tiempo de ejecucion (num_beams, max_length, length_penalty, repetition_penalty) a traves de la funcion `mldb.ONNXSeq2Seq` de Teradata.
- No soporta tool calling, ni agentes, ni vision, ni audio.
- Capacidad multilingue limitada a un unico par de idiomas (en -> ja).

## Casos de uso

- Traduccion de textos cortos en aplicaciones empresariales: traducir comentarios, descripciones breves de productos o notificaciones del ingles al japones dentro de un flujo de datos en Teradata.
- Integracion en pipelines SQL: usar la funcion `mldb.ONNXSeq2Seq` para traducir columnas de una tabla directamente en una consulta SQL, sin mover datos a un servicio externo.
- Prototipado rapido de traduccion en entornos con restricciones de infraestructura: al ser un modelo pequeno (801 MB fp32), puede ejecutarse en CPU sin necesidad de GPU.
- Traduccion de mensajes de soporte o notificaciones cortas: frases como "Your order has been shipped" pueden traducirse de forma aceptable.
- Enriquecimiento de datos para analisis multilingue: traducir campos de texto en ingles a japones para unificar datos en un solo idioma dentro de un data warehouse.
- Evaluacion comparativa de calidad de traduccion: dado que se conocen sus limitaciones, puede usarse como baseline en experimentos de traduccion automatica.

## Benchmarks y rendimiento

Segun la model card del repositorio, el modelo original obtuvo los siguientes resultados en el benchmark Tatoeba-test.eng-jpn (10,000 frases):

| Benchmark | Metrica | Resultado |
|---|---|---|
| Tatoeba-test.eng-jpn | chr-F | 0,258 |
| Tatoeba-test.eng-jpn | BLEU | 15,2 |

No se han publicado otros benchmarks en la informacion disponible.

## Requisitos de hardware

- El modelo ONNX fp32 ocupa 801 MB; la version int8 ocupa 404 MB. Se recomienda al menos 2 GB de RAM libre para inferencia en CPU.
- No requiere GPU especifica; puede ejecutarse con ONNX Runtime en CPU.
- Para despliegue en Teradata, se necesita Teradata 17.20+ con BYOM 7.0.0.4 o superior.
- Tambien puede ejecutarse en cualquier entorno Python con ONNX Runtime.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | BLEU (Tatoeba en-ja) | Licencia |
|---|---|---|---|---|---|
| Teradata/opus-tatoeba-en-ja (ONNX) | MarianMT | no disponible | 512 | 15,2 | Apache-2.0 |
| Helsinki-NLP/opus-tatoeba-en-ja (original) | MarianMT | no disponible | 512 | 15,2 | Apache-2.0 |
| NLLB-200-distilled-600M | Transformer encoder-decoder | 600M | 1024 | no disponible | CC-BY-NC |

Nota: los datos de NLLB-200 no estan disponibles en la informacion proporcionada; se incluye como referencia de alternativa, pero sin metricas verificadas.

## Limitaciones y advertencias

- Calidad baja en modismos, frases idiomaticas y construcciones con nombres propios complejos. Ejemplo real: "It is raining cats and dogs" se traduce literalmente como "猫や犬が雨を降らせています" (gramatical pero incorrecto).
- Fallos graves con direcciones de correo electronico u otros tokens no prosaicos: el modelo puede producir salidas irrelevantes, como citas de Wikipedia japonesa.
- Espaciado inconsistente entre tokens en la salida: algunas frases aparecen con espacios entre palabras y otras sin ellos, incluso en la misma ejecucion.
- Diferencias significativas entre las versiones fp32 e int8: en las pruebas, solo coinciden en 6 de 10 salidas con los parametros por defecto. No son intercambiables sin verificacion previa.
- Contexto limitado a 512 tokens, no apto para documentos largos.
- No apto para produccion sin evaluacion previa en datos propios, especialmente si el texto contiene elementos no prosaicos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Teradata/opus-tatoeba-en-ja
- Modelo original: https://huggingface.co/Helsinki-NLP/opus-tatoeba-en-ja
- Ficha del modelo en BimAnt AI Model Zoo: https://zoo.bimant.com/model/4257
